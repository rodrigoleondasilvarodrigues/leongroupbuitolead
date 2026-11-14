import { describe, it, expect, beforeEach } from 'vitest';
import { verifyAccessJwt, readAccessToken, _resetAccessCache } from '../src/access';

const TEAM = 'exemplo.cloudflareaccess.com';
const AUD = 'aud-teste-123';
const b64url = (b: ArrayBuffer | Uint8Array | string) =>
  Buffer.from(typeof b === 'string' ? b : new Uint8Array(b as ArrayBuffer)).toString('base64url');

async function setup() {
  const kp = (await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true, ['sign', 'verify'])) as CryptoKeyPair;
  const jwk = { ...(await crypto.subtle.exportKey('jwk', kp.publicKey)), kid: 'k1' };
  const fetcher = (async (url: string) => {
    expect(url).toBe(`https://${TEAM}/cdn-cgi/access/certs`);
    return new Response(JSON.stringify({ keys: [jwk] }));
  }) as unknown as typeof fetch;
  const sign = async (payload: object, kid = 'k1') => {
    const h = b64url(JSON.stringify({ alg: 'RS256', kid, typ: 'JWT' }));
    const p = b64url(JSON.stringify(payload));
    const s = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', kp.privateKey, new TextEncoder().encode(`${h}.${p}`));
    return `${h}.${p}.${b64url(s)}`;
  };
  return { fetcher, sign };
}

const env = { ACCESS_AUD: AUD, ACCESS_TEAM_DOMAIN: TEAM };
const now = Date.now();
const good = { aud: [AUD], iss: `https://${TEAM}`, exp: Math.floor(now / 1000) + 600, email: 'leon@example.com' };

describe('verifyAccessJwt', () => {
  beforeEach(() => _resetAccessCache());
  it('aceita token válido', async () => {
    const { fetcher, sign } = await setup();
    expect(await verifyAccessJwt(await sign(good), env, fetcher, now)).toEqual({ ok: true, email: 'leon@example.com' });
  });
  it('rejeita aud, iss, exp errados', async () => {
    const { fetcher, sign } = await setup();
    expect(await verifyAccessJwt(await sign({ ...good, aud: ['outro'] }), env, fetcher, now)).toMatchObject({ ok: false, reason: 'aud não confere' });
    _resetAccessCache();
    expect(await verifyAccessJwt(await sign({ ...good, iss: 'https://x.cloudflareaccess.com' }), env, fetcher, now)).toMatchObject({ ok: false, reason: 'iss não confere' });
    _resetAccessCache();
    expect(await verifyAccessJwt(await sign({ ...good, exp: Math.floor(now / 1000) - 3600 }), env, fetcher, now)).toMatchObject({ ok: false, reason: 'token expirado' });
  });
  it('rejeita assinatura adulterada e kid desconhecido', async () => {
    const { fetcher, sign } = await setup();
    const t = await sign(good);
    const [h, , s] = t.split('.');
    const forged = `${h}.${b64url(JSON.stringify({ ...good, email: 'intruso@x.com' }))}.${s}`;
    expect(await verifyAccessJwt(forged, env, fetcher, now)).toMatchObject({ ok: false, reason: 'assinatura inválida' });
    expect(await verifyAccessJwt(await sign(good, 'k9'), env, fetcher, now)).toMatchObject({ ok: false, reason: 'kid desconhecido' });
  });
  it('rejeita token malformado e alg none', async () => {
    const { fetcher } = await setup();
    expect(await verifyAccessJwt('abc', env, fetcher, now)).toMatchObject({ ok: false });
    const none = `${b64url(JSON.stringify({ alg: 'none' }))}.${b64url(JSON.stringify(good))}.`;
    expect(await verifyAccessJwt(none, env, fetcher, now)).toMatchObject({ ok: false, reason: 'alg não suportado' });
  });
});

describe('readAccessToken', () => {
  it('lê header ou cookie CF_Authorization', () => {
    expect(readAccessToken(new Headers({ 'Cf-Access-Jwt-Assertion': 'h' }))).toBe('h');
    expect(readAccessToken(new Headers({ Cookie: 'a=1; CF_Authorization=c' }))).toBe('c');
    expect(readAccessToken(new Headers())).toBeNull();
  });
});
