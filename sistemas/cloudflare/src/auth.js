// Autenticação do admin — sessão assinada por HMAC, cookie httpOnly.
// A senha vive como secret do Worker (npx wrangler secret put ADMIN_SENHA),
// nunca no repositório.

const COOKIE = "leon_sessao";
const VALIDADE_H = 12;              // sessão expira em 12 horas
const MAX_TENTATIVAS = 8;           // por IP na janela curta
const JANELA_MIN = 15;
const MAX_GLOBAL = 50;              // teto GLOBAL, independente de IP
const JANELA_GLOBAL_MIN = 60;       // impede força bruta distribuída por muitos IPs

const enc = new TextEncoder();
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function hmac(segredo, texto) {
  if (!segredo || String(segredo).length < 16)
    throw new Error("SESSAO_SEGREDO ausente ou curto — defina com: npx wrangler secret put SESSAO_SEGREDO");
  const chave = await crypto.subtle.importKey("raw", enc.encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64(await crypto.subtle.sign("HMAC", chave, enc.encode(texto)));
}

// comparação em tempo constante — evita descobrir a senha por timing
function igualSeguro(a, b) {
  const x = enc.encode(a), y = enc.encode(b);
  if (x.length !== y.length) return false;
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0;
}

// A versão fica no payload assinado. Incrementar a versão (no logout ou no
// "encerrar todas as sessões") invalida NA HORA todo token já emitido.
export async function versaoSessao(env) {
  const r = await env.DB.prepare("SELECT valor FROM config WHERE chave='sessao_versao'").first();
  return Number(r?.valor || 1);
}
export async function invalidarTodasSessoes(env) {
  const nova = (await versaoSessao(env)) + 1;
  await env.DB.prepare(
    "INSERT INTO config (chave,valor) VALUES ('sessao_versao',?) " +
    "ON CONFLICT(chave) DO UPDATE SET valor=excluded.valor"
  ).bind(String(nova)).run();
  return nova;
}

export async function criarSessao(env) {
  const expira = Date.now() + VALIDADE_H * 3600 * 1000;
  const payload = `admin.${await versaoSessao(env)}.${expira}`;
  return `${payload}.${await hmac(env.SESSAO_SEGREDO, payload)}`;
}

export async function sessaoValida(req, env) {
  const cru = req.headers.get("Cookie") || "";
  const m = cru.match(new RegExp(`${COOKIE}=([^;]+)`));
  if (!m) return false;
  const partes = m[1].split(".");
  if (partes.length !== 4) return false;
  const [quem, versao, expira, assinatura] = partes;
  if (Number(expira) < Date.now()) return false;
  const esperada = await hmac(env.SESSAO_SEGREDO, `${quem}.${versao}.${expira}`);
  if (!igualSeguro(assinatura, esperada)) return false;
  // token de versão antiga morre mesmo estando dentro da validade
  return Number(versao) === (await versaoSessao(env));
}

export function cookieSessao(token) {
  return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${VALIDADE_H * 3600}`;
}
export const cookieLimpo = () => `${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;

// IPv6 vira o prefixo /64: sem isso, um único VPS com /64 tem 2^64 endereços
// distintos e zera o contador a cada tentativa.
export function chaveIp(ip) {
  const s = String(ip || "0.0.0.0");
  if (!s.includes(":")) return s;
  const p = s.split(":");
  return p.slice(0, 4).join(":") + "::/64";
}

export async function bloqueadoPorTentativas(env, ip) {
  const k = chaveIp(ip);
  const desde = new Date(Date.now() - JANELA_MIN * 60000).toISOString();
  const porIp = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM tentativas_login WHERE ip=? AND ok=0 AND em>?"
  ).bind(k, desde).first();
  if ((porIp?.n || 0) >= MAX_TENTATIVAS) return true;

  // teto global: mesmo distribuindo por milhares de IPs, o total tem limite
  const desdeG = new Date(Date.now() - JANELA_GLOBAL_MIN * 60000).toISOString();
  const global = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM tentativas_login WHERE ok=0 AND em>?"
  ).bind(desdeG).first();
  return (global?.n || 0) >= MAX_GLOBAL;
}

// atraso crescente conforme as falhas recentes — encarece cada tentativa
export async function atrasoPorFalhas(env, ip) {
  const desde = new Date(Date.now() - JANELA_MIN * 60000).toISOString();
  const r = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM tentativas_login WHERE ip=? AND ok=0 AND em>?"
  ).bind(chaveIp(ip), desde).first();
  const falhas = r?.n || 0;
  if (!falhas) return;
  await new Promise((ok) => setTimeout(ok, Math.min(3000, 250 * falhas)));
}

export async function registrarTentativa(env, ip, ok) {
  await env.DB.prepare("INSERT INTO tentativas_login (ip,em,ok) VALUES (?,?,?)")
    .bind(chaveIp(ip), new Date().toISOString(), ok ? 1 : 0).run();
}

export async function senhaConfere(env, senha) {
  if (!env.ADMIN_SENHA) return false;
  return igualSeguro(String(senha || ""), String(env.ADMIN_SENHA));
}
