/**
 * Verificação opcional do JWT do Cloudflare Access (header Cf-Access-Jwt-Assertion).
 * Só é ativada quando ACCESS_AUD e ACCESS_TEAM_DOMAIN estão definidos.
 */
export interface AccessEnv { ACCESS_AUD?: string; ACCESS_TEAM_DOMAIN?: string }
type Jwk = JsonWebKey & { kid?: string };

let cache: { url: string; keys: Jwk[]; at: number } | null = null;

const b64urlToBytes = (s: string) => {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
};
const b64urlJson = (s: string) => JSON.parse(new TextDecoder().decode(b64urlToBytes(s)));

export function teamOrigin(domain: string): string {
  const d = domain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
  return `https://${d}`;
}

async function getKeys(certsUrl: string, fetcher: typeof fetch, force = false): Promise<Jwk[]> {
  if (!force && cache && cache.url === certsUrl && Date.now() - cache.at < 3600_000) return cache.keys;
  const res = await fetcher(certsUrl);
  if (!res.ok) throw new Error(`certs HTTP ${res.status}`);
  const body = (await res.json()) as { keys: Jwk[] };
  cache = { url: certsUrl, keys: body.keys ?? [], at: Date.now() };
  return cache.keys;
}
export const _resetAccessCache = () => { cache = null; };

export async function verifyAccessJwt(
  token: string, env: Required<AccessEnv>, fetcher: typeof fetch = fetch, now = Date.now(),
): Promise<{ ok: true; email?: string } | { ok: false; reason: string }> {
  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, reason: 'token malformado' };
  let header: { alg?: string; kid?: string }, payload: Record<string, unknown>;
  try { header = b64urlJson(parts[0]); payload = b64urlJson(parts[1]); } catch { return { ok: false, reason: 'token malformado' }; }
  if (header.alg !== 'RS256') return { ok: false, reason: 'alg não suportado' };

  const origin = teamOrigin(env.ACCESS_TEAM_DOMAIN);
  const certsUrl = `${origin}/cdn-cgi/access/certs`;
  let keys: Jwk[];
  try { keys = await getKeys(certsUrl, fetcher); } catch (e) { return { ok: false, reason: `falha ao obter chaves: ${(e as Error).message}` }; }
  let jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) { try { keys = await getKeys(certsUrl, fetcher, true); jwk = keys.find((k) => k.kid === header.kid); } catch { /* ignore */ } }
  if (!jwk) return { ok: false, reason: 'kid desconhecido' };

  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlToBytes(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
  if (!valid) return { ok: false, reason: 'assinatura inválida' };

  const aud = payload.aud;
  const auds = Array.isArray(aud) ? aud : [aud];
  if (!auds.includes(env.ACCESS_AUD)) return { ok: false, reason: 'aud não confere' };
  if (payload.iss !== origin) return { ok: false, reason: 'iss não confere' };
  const sec = Math.floor(now / 1000);
  if (typeof payload.exp !== 'number' || payload.exp < sec - 60) return { ok: false, reason: 'token expirado' };
  if (typeof payload.nbf === 'number' && payload.nbf > sec + 60) return { ok: false, reason: 'token ainda não válido' };
  return { ok: true, email: typeof payload.email === 'string' ? payload.email : undefined };
}

export function readAccessToken(headers: Headers): string | null {
  const h = headers.get('Cf-Access-Jwt-Assertion');
  if (h) return h;
  const m = /(?:^|;\s*)CF_Authorization=([^;]+)/.exec(headers.get('Cookie') ?? '');
  return m ? m[1] : null;
}
