import { Hono, type Context } from 'hono';
import { CATEGORIAS, ESTADOS, STATUS_PROSPECCAO } from './constants';
import { validateGrupo, toCsv, extractCode, type ArquivoCsv } from './csv';
import { validateArquivos } from './importar';
import * as emp from './empresas';
import { readAccessToken, verifyAccessJwt } from './access';
import * as db from './db';
import * as v from './views';

export interface Env {
  DB: D1Database;
  ACCESS_AUD?: string;
  ACCESS_TEAM_DOMAIN?: string;
  CHECK_BATCH?: string;
  CHECK_DELAY_MS?: string;
}
type C = Context<{ Bindings: Env }>;

const app = new Hono<{ Bindings: Env }>();
const num = (s: string | undefined, d: number) => (Number.isFinite(Number(s)) && Number(s) > 0 ? Number(s) : d);

// Segurança básica
app.use('*', async (c, next) => {
  if (c.env.ACCESS_AUD && c.env.ACCESS_TEAM_DOMAIN && c.req.path !== '/healthz') {
    const token = readAccessToken(c.req.raw.headers);
    if (!token) return c.text('Acesso negado (sem token do Cloudflare Access).', 403);
    const r = await verifyAccessJwt(token, { ACCESS_AUD: c.env.ACCESS_AUD, ACCESS_TEAM_DOMAIN: c.env.ACCESS_TEAM_DOMAIN });
    if (!r.ok) return c.text(`Acesso negado: ${r.reason}`, 403);
  }
  if (c.req.method === 'POST') {
    const origin = c.req.header('Origin');
    if (origin && origin !== 'null' && new URL(origin).host !== new URL(c.req.url).host) return c.text('Origem inválida.', 403);
  }
  await next();
  c.header('X-Frame-Options', 'DENY');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Referrer-Policy', 'no-referrer');
  c.header('X-Robots-Tag', 'noindex, nofollow');
});

app.get('/healthz', (c) => c.text('ok'));

app.get('/', async (c) => {
  const [d, estados, cats] = await Promise.all([db.dashboard(c.env.DB), db.resumoEstados(c.env.DB), db.resumoCategorias(c.env.DB)]);
  return c.html(v.inicioPage(d.totais, estados, cats));
});
app.get('/estados', async (c) => c.html(v.estadosPage(await db.resumoEstados(c.env.DB))));
app.get('/categorias', async (c) => c.html(v.categoriasPage(await db.resumoCategorias(c.env.DB))));
app.get('/como-utilizar', (c) => c.html(v.comoUtilizarPage()));

/** Filtros públicos da biblioteca: só grupos ATIVOS (sem opção de ver expirados). */
function readFiltros(c: C): db.Filtros & { page: number } {
  const q = (k: string) => (c.req.query(k) ?? '').trim() || undefined;
  const estado = q('estado')?.toUpperCase();
  const categoria = q('categoria');
  return {
    q: q('q')?.slice(0, 100),
    estado: estado === db.SEM_ESTADO ? db.SEM_ESTADO : estado && ESTADOS[estado] ? estado : undefined,
    cidade: q('cidade')?.slice(0, 80),
    categoria: categoria && categoria in CATEGORIAS ? categoria : undefined,
    nicho: q('nicho')?.toLowerCase().slice(0, 60),
    page: Math.max(1, Math.floor(num(c.req.query('page'), 1))),
  };
}

async function library(c: C, f: db.Filtros & { page: number }) {
  const r = await db.listGrupos(c.env.DB, f, f.page);
  const [cidades, estados] = await Promise.all([db.cidades(c.env.DB, f.estado), db.resumoEstados(c.env.DB)]);
  return c.html(v.libraryPage({ f, page: f.page, pages: r.pages, total: r.total, rows: r.rows, cidades, estados: estados.map((e) => e.estado) }));
}

app.get('/grupos', (c) => library(c, readFiltros(c)));
app.get('/estado/:uf', (c) => {
  const uf = c.req.param('uf').toUpperCase();
  if (!ESTADOS[uf]) return c.notFound();
  return library(c, { ...readFiltros(c), estado: uf });
});
app.get('/categoria/:slug', (c) => {
  const s = c.req.param('slug');
  if (!(s in CATEGORIAS)) return c.notFound();
  return library(c, { ...readFiltros(c), categoria: s });
});

// ---------- Empresas (leads B2B) ----------
function readFiltrosEmpresa(c: C): v.FiltrosEmpresaUI & { page: number } {
  const q = (k: string) => (c.req.query(k) ?? '').trim() || undefined;
  const estado = q('estado')?.toUpperCase();
  const conf = q('conf')?.toLowerCase();
  const status = q('status');
  return {
    q: q('q')?.slice(0, 120),
    nicho: q('nicho')?.toLowerCase().slice(0, 60),
    estado: estado && ESTADOS[estado] ? estado : undefined,
    cidade: q('cidade')?.slice(0, 80),
    oport: q('oport')?.slice(0, 80),
    conf: conf && (emp.CONF_FILTROS as readonly string[]).includes(conf) ? conf : undefined,
    status: status && status in STATUS_PROSPECCAO ? status : undefined,
    view: q('view') === 'tabela' ? 'tabela' : undefined,
    page: Math.max(1, Math.floor(num(c.req.query('page'), 1))),
  };
}
async function empresasHtml(c: C, f: v.FiltrosEmpresaUI & { page: number }, extra: { msg?: string; erro?: string } = {}) {
  const [r, op, dash] = await Promise.all([
    emp.listEmpresas(c.env.DB, f, f.page), emp.opcoesEmpresas(c.env.DB, f.estado), emp.dashboardEmpresas(c.env.DB, f),
  ]);
  return v.empresasPage({ f, page: f.page, pages: r.pages, total: r.total, rows: r.rows, ...op, dash, ...extra });
}
app.get('/empresas', async (c) => c.html(await empresasHtml(c, readFiltrosEmpresa(c), { msg: c.req.query('msg')?.slice(0, 200) })));
app.get('/empresas/exportar.csv', async (c) => {
  const f = readFiltrosEmpresa(c);
  const csv = emp.empresasToCsv(await emp.exportEmpresas(c.env.DB, f));
  const sufixo = [f.nicho, f.estado, f.cidade, f.conf, f.status].filter(Boolean).map((x) => x!.toLowerCase().replace(/[^a-z0-9]+/g, '-')).join('_');
  return c.body(csv, 200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="empresas-${db.today()}${sufixo ? '_' + sufixo : ''}${f.q || f.oport ? '_filtrado' : ''}.csv"`,
  });
});
// Escrita: passa pelo mesmo middleware (Cloudflare Access opcional + checagem de Origin) das demais rotas.
const MAX_FORM = 8_000;
app.post('/empresas/prospeccao', async (c) => {
  if (Number(c.req.header('Content-Length') ?? 0) > MAX_FORM) return c.text('Formulário grande demais.', 413);
  const body = await c.req.parseBody();
  const { p, chave, erros } = emp.validateProspeccao(body);
  if (!erros.length && !(await emp.getEmpresa(c.env.DB, chave))) erros.push('empresa não encontrada');
  if (erros.length) {
    return c.html(v.layout('Prospecção', `<h1>Não foi possível salvar</h1><div class="note err" style="margin-top:16px"><ul>${erros.map((e) => `<li>${v.esc(e)}</li>`).join('')}</ul></div>
<p><a class="btn sec" href="${v.esc(emp.voltaSegura(body.volta))}">Voltar</a></p>`, '/empresas'), 400);
  }
  await emp.salvarProspeccao(c.env.DB, chave, p);
  const volta = emp.voltaSegura(body.volta);
  const [path, hash] = volta.split('#');
  const u = new URL(path, 'http://x');
  u.searchParams.set('msg', 'Prospecção salva.');
  return c.redirect(`${u.pathname}${u.search}${hash ? '#' + hash : ''}`, 303);
});

// ---------- Admin ----------
app.get('/admin', async (c) => {
  const status = c.req.query('status');
  const f: db.Filtros = { q: c.req.query('q')?.trim() || undefined, status: status && ['ativo', 'expirado', 'indeterminado'].includes(status) ? status : undefined, todos: true };
  const page = Math.max(1, Math.floor(num(c.req.query('page'), 1)));
  const r = await db.listGrupos(c.env.DB, f, page, 50);
  return c.html(v.adminPage({ rows: r.rows, total: r.total, page, pages: r.pages, f, msg: c.req.query('msg') }));
});

const back = (c: C, msg: string) => c.redirect(`/admin?msg=${encodeURIComponent(msg)}`, 303);

app.get('/admin/novo', (c) => c.html(v.formPage(null)));
app.post('/admin/novo', async (c) => {
  const body = Object.fromEntries(Object.entries(await c.req.parseBody()).map(([k, x]) => [k, String(x)]));
  if (!body.codigo && body.link) body.codigo = extractCode(body.link) ?? '';
  const { grupo, erros } = validateGrupo(body);
  if (!erros.length && (await db.getGrupo(c.env.DB, grupo.codigo))) erros.push('Já existe um link com esse código.');
  if (erros.length) return c.html(v.formPage(grupo, erros, true), 400);
  await db.upsertMany(c.env.DB, [grupo], 'edit');
  return back(c, `Link "${grupo.nome_grupo || grupo.codigo}" criado.`);
});

app.get('/admin/grupos/:codigo', async (c) => {
  const g = await db.getGrupo(c.env.DB, c.req.param('codigo'));
  return g ? c.html(v.formPage(g, [], false)) : c.notFound();
});
app.post('/admin/grupos/:codigo', async (c) => {
  const codigo = c.req.param('codigo');
  if (!(await db.getGrupo(c.env.DB, codigo))) return c.notFound();
  const body = Object.fromEntries(Object.entries(await c.req.parseBody()).map(([k, x]) => [k, String(x)]));
  const { grupo, erros } = validateGrupo({ ...body, codigo });
  if (erros.length) return c.html(v.formPage(grupo, erros, false), 400);
  await db.upsertMany(c.env.DB, [grupo], 'edit');
  return back(c, `Link "${grupo.nome_grupo || grupo.codigo}" atualizado.`);
});
app.post('/admin/grupos/:codigo/excluir', async (c) => {
  await db.deleteGrupo(c.env.DB, c.req.param('codigo'));
  return back(c, 'Link excluído.');
});
app.post('/admin/grupos/:codigo/expirar', async (c) => {
  await db.setStatus(c.env.DB, c.req.param('codigo'), 'expirado');
  return back(c, 'Link marcado como expirado.');
});
app.post('/admin/grupos/:codigo/revalidar', async (c) => {
  const out = await db.revalidateBatch(c.env.DB, { batch: 1, delayMs: 0, codigos: [c.req.param('codigo')] });
  return c.html(v.revalidatePage(out));
});
app.post('/admin/revalidar', async (c) => {
  // Lote pequeno por requisição (limite de subrequests do plano gratuito)
  const out = await db.revalidateBatch(c.env.DB, { batch: Math.min(10, num(c.env.CHECK_BATCH, 10)), delayMs: num(c.env.CHECK_DELAY_MS, 1500) });
  return c.html(v.revalidatePage(out));
});

app.get('/admin/importar', (c) => c.html(v.importPage()));
const MAX_TOTAL = 5_000_000;
/** Lê 1+ arquivos enviados (campo `arquivo`, multiple) e/ou texto colado / campos ocultos do preview. */
async function readCsvFiles(c: C): Promise<ArquivoCsv[]> {
  const body = await c.req.parseBody({ all: true });
  const arr = <T,>(v: T | T[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
  const out: ArquivoCsv[] = [];
  for (const f of arr(body.arquivo)) {
    if (f && typeof f !== 'string' && f.size > 0) out.push({ nome: f.name || `arquivo${out.length + 1}.csv`, texto: await f.text() });
  }
  const textos = arr(body.texto).map(String);
  const nomes = arr(body.nome).map(String);
  textos.forEach((t, i) => { if (t.trim()) out.push({ nome: nomes[i] || 'texto colado', texto: t }); });
  return out;
}
app.post('/admin/importar', async (c) => {
  const files = await readCsvFiles(c);
  if (!files.length) return c.html(v.importPage('Envie ao menos um arquivo ou cole o conteúdo.'), 400);
  if (files.reduce((n, f) => n + f.texto.length, 0) > MAX_TOTAL) return c.text('Arquivos muito grandes (máx. 5 MB no total).', 413);
  const r = validateArquivos(files);
  const [existentes, empExistentes] = await Promise.all([
    db.codigosExistentes(c.env.DB, r.grupos.validos.map((g) => g.codigo)),
    emp.empresasExistentes(c.env.DB, r.empresas),
  ]);
  return c.html(v.previewPage(r, existentes, empExistentes, files));
});
app.post('/admin/importar/confirmar', async (c) => {
  const files = await readCsvFiles(c);
  if (files.reduce((n, f) => n + f.texto.length, 0) > MAX_TOTAL) return c.text('Arquivos muito grandes.', 413);
  const r = validateArquivos(files);
  const partes: string[] = [];
  if (r.grupos.arquivos.length) {
    const g = r.grupos;
    const fatais = g.arquivos.filter((a) => a.result.fatal).map((a) => a.nome);
    const erros = g.arquivos.reduce((n, a) => n + a.result.erros.length, 0);
    const res = await db.upsertMany(c.env.DB, g.validos);
    partes.push(`Grupos (${g.arquivos.length} arquivo(s)): ${res.inseridos} novo(s), ${res.atualizados} atualizado(s), ` +
      `${erros} linha(s) com erro ignorada(s), ${g.duplicados.length} código(s) repetido(s) entre arquivos mesclado(s)` +
      (fatais.length ? `; ignorado(s) por cabeçalho inválido: ${fatais.join(', ')}` : ''));
  }
  if (r.empresas.arquivos.length) {
    const e = r.empresas;
    const fatais = e.arquivos.filter((a) => a.result.fatal).map((a) => a.nome);
    const vazios = e.arquivos.filter((a) => a.result.vazio).map((a) => a.nome);
    const erros = e.arquivos.reduce((n, a) => n + a.result.erros.length, 0);
    const linhasValidas = e.arquivos.reduce((n, a) => n + a.result.validos.length, 0);
    const res = await emp.upsertEmpresas(c.env.DB, e);
    partes.push(`Empresas (${e.arquivos.length} arquivo(s)): ${res.inseridas} nova(s), ${res.mescladas} mesclada(s) com o banco, ` +
      `${linhasValidas - e.empresas.length} linha(s) repetida(s) mesclada(s) no lote, ${erros} linha(s) com erro ignorada(s)` +
      (fatais.length ? `; ignorado(s) por cabeçalho inválido: ${fatais.join(', ')}` : '') +
      (vazios.length ? `; só cabeçalho: ${vazios.join(', ')}` : ''));
  }
  if (r.ignorados.length) partes.push(`Arquivo(s) não reconhecido(s): ${r.ignorados.map((i) => i.nome).join(', ')}`);
  return back(c, `Importação concluída. ${partes.join(' | ')}.`);
});
app.get('/admin/exportar.csv', async (c) => {
  const csv = toCsv(await db.allGrupos(c.env.DB));
  return c.body(csv, 200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="grupos-${db.today()}.csv"`,
  });
});

app.notFound((c) => c.html(v.layout('Não encontrado', '<h1>Página não encontrada</h1><p class="sub"><a href="/">Voltar ao início</a></p>'), 404));
app.onError((err, c) => { console.error(err); return c.html(v.layout('Erro', `<h1>Erro</h1><p class="note err">${v.esc(err.message)}</p>`), 500); });

export default {
  fetch: app.fetch,
  async scheduled(_e: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(db.revalidateBatch(env.DB, { batch: Math.min(40, num(env.CHECK_BATCH, 20)), delayMs: num(env.CHECK_DELAY_MS, 1500) })
      .then((out) => console.log(`revalidação: ${out.length} links`, JSON.stringify(out.map((o) => [o.codigo, o.resultado])))));
  },
};
