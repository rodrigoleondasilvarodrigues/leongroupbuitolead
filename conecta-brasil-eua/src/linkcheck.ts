/**
 * Heurísticas de verificação de convites do WhatsApp — isoladas aqui.
 *
 * Apenas faz GET na página PÚBLICA https://chat.whatsapp.com/<codigo>.
 * NUNCA segue o link de "entrar no grupo" (web.whatsapp.com/accept, whatsapp://),
 * nunca envia credenciais/cookies, nunca entra em grupos.
 *
 * As regras foram escritas a partir do comportamento conhecido da página pública
 * e testadas com fixtures SINTÉTICAS. Ajuste-as se o WhatsApp mudar o HTML.
 */
import { INVITE_CODE_RE, inviteLink } from './constants';

export type CheckResult = 'ativo' | 'expirado' | 'indeterminado';
export interface Classification { result: CheckResult; motivo: string; nome?: string }

/** Títulos genéricos que aparecem quando a página NÃO mostra um grupo específico. */
const GENERIC_TITLES = [
  'whatsapp group invite', 'whatsapp', 'whatsapp web', 'share on whatsapp',
  'convite para grupo do whatsapp', 'convite de grupo do whatsapp',
  'invitación a grupo de whatsapp', 'invitación de grupo de whatsapp',
];

/** Frases explícitas de convite revogado/inválido (en/pt/es). */
const REVOKED_PATTERNS: RegExp[] = [
  /invite link (?:was|has been) (?:reset|revoked)/i,
  /this (?:invite )?link (?:is|has) (?:no longer valid|expired|been revoked)/i,
  /(?:invalid|expired|revoked) (?:group )?invite link/i,
  /couldn'?t (?:join|open) this group/i,
  /link de convite (?:foi )?(?:redefinido|revogado|inv[aá]lido|expirado)/i,
  /(?:este|esse) link (?:de convite )?(?:n[aã]o [eé] mais v[aá]lido|expirou)/i,
  /enlace de invitaci[oó]n (?:fue )?(?:restablecido|revocado|no es v[aá]lido)/i,
];

const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));

function metaContent(html: string, prop: string): string | undefined {
  const re1 = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*)["']`, 'i');
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${prop}["']`, 'i');
  const m = re1.exec(html) ?? re2.exec(html);
  return m ? decode(m[1]).trim() : undefined;
}

const stripTags = (html: string) =>
  decode(html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');

/** Classifica a partir do status HTTP e do HTML público. Função pura (testável). */
export function classifyInvitePage(httpStatus: number, html: string): Classification {
  if (httpStatus === 404 || httpStatus === 410) return { result: 'expirado', motivo: `HTTP ${httpStatus}` };
  if (httpStatus === 429) return { result: 'indeterminado', motivo: 'HTTP 429 (rate limit)' };
  if (httpStatus < 200 || httpStatus >= 300) return { result: 'indeterminado', motivo: `HTTP ${httpStatus}` };
  if (!html || html.length < 50) return { result: 'indeterminado', motivo: 'página vazia' };

  const text = stripTags(html);
  for (const re of REVOKED_PATTERNS) {
    if (re.test(text)) return { result: 'expirado', motivo: `texto de convite revogado (${re.source.slice(0, 30)}…)` };
  }

  const ogTitle = metaContent(html, 'og:title');
  const hasAccept = /(?:web\.whatsapp\.com\/accept\?code=|whatsapp:\/\/chat\?code=|id=["']action-button["'])/i.test(html);
  const looksLikeInvitePage = hasAccept || /chat\.whatsapp\.com/i.test(html) || ogTitle !== undefined;

  if (ogTitle && !GENERIC_TITLES.includes(ogTitle.toLowerCase())) {
    return { result: 'ativo', motivo: 'og:title com nome do grupo', nome: ogTitle };
  }
  // Observado na página pública: convite inexistente/revogado vem com og:title VAZIO
  // (o botão de ação continua presente, então ele não serve como sinal de validade).
  if (ogTitle !== undefined && (ogTitle === '' || GENERIC_TITLES.includes(ogTitle.toLowerCase()))) {
    return { result: 'expirado', motivo: 'página de convite sem nome de grupo (og:title vazio/genérico)' };
  }
  if (hasAccept) return { result: 'indeterminado', motivo: 'botão de entrada sem og:title identificável' };
  if (!looksLikeInvitePage) return { result: 'indeterminado', motivo: 'HTML não reconhecido' };
  return { result: 'indeterminado', motivo: 'sinais insuficientes' };
}

export interface FetchLike { (url: string, init?: RequestInit): Promise<Response> }

/** Faz GET educado na página pública e classifica. Nunca lança exceção. */
export async function checkInvite(codigo: string, fetcher: FetchLike = fetch, timeoutMs = 10000): Promise<Classification> {
  if (!INVITE_CODE_RE.test(codigo)) return { result: 'indeterminado', motivo: 'codigo com formato inválido' };
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetcher(inviteLink(codigo), {
      method: 'GET',
      redirect: 'follow',
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ConectaBrasilEUA-LinkCheck/1.0)',
        'Accept': 'text/html',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
    });
    const html = (await res.text()).slice(0, 300_000);
    return classifyInvitePage(res.status, html);
  } catch (e) {
    return { result: 'indeterminado', motivo: `erro de rede: ${(e as Error).message}` };
  } finally {
    clearTimeout(t);
  }
}

/** Regra de transição de status: só marca expirado após 2 verificações seguidas. */
export function nextStatus(atual: string, falhas: number, r: CheckResult): { status: string; falhas: number } {
  if (r === 'ativo') return { status: 'ativo', falhas: 0 };
  if (r === 'expirado') {
    const f = falhas + 1;
    return { status: f >= 2 ? 'expirado' : atual, falhas: f };
  }
  return { status: atual, falhas }; // indeterminado: não mexe no status atual
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
