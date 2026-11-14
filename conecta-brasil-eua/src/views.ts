import { CATEGORIAS, CATEGORIA_SLUGS, CONFIANCAS, ESTADOS, OBSERVACAO_MAX, STATUS, STATUS_LIST, STATUS_PROSPECCAO, inviteLink, type Grupo } from './constants';
import { SEM_ESTADO, type DashTotais, type EstadoResumo, type Filtros } from './db';
import type { ArquivoCsv } from './csv';
import type { ImportacaoResult } from './importar';
import { contagemPorArquivo, type DashEmpresas, type FiltrosEmpresa } from './empresas';
import type { EmpresaView } from './constants';

export const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const catLabel = (s: string) => (CATEGORIAS as Record<string, string>)[s] ?? s;
const estLabel = (uf: string) => (ESTADOS[uf] ? `${ESTADOS[uf]} (${uf})` : uf);
const estNome = (uf: string) => (uf ? ESTADOS[uf] ?? uf : 'Nacional / sem estado');
const fmtDate = (d: string) => (/^\d{4}-\d{2}-\d{2}$/.test(d) ? d.split('-').reverse().join('/') : d || '—');
const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

// ---------- ícones (SVG inline, traço) ----------
const P: Record<string, string> = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  books: '<path d="M4 4v16M9 4v16"/><path d="M13 5l4-1 4 15-4 1z"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  book: '<path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2z"/><path d="M22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z"/>',
  building: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  chat: '<path d="M21 12a9 9 0 0 1-13.5 7.8L3 21l1.3-4.4A9 9 0 1 1 21 12z"/>',
  wa: '<path d="M21 12a9 9 0 0 1-13.5 7.8L3 21l1.3-4.4A9 9 0 1 1 21 12z"/><path d="M9 8.5c-.3 3.2 3.3 6.8 6.5 6.5l.8-1.6-2-1-1 .9a4 4 0 0 1-2.1-2.1l.9-1-1-2z"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  open: '<path d="M7 17L17 7M8 7h9v9"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  gear: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
};
export const icon = (n: keyof typeof P | string, cls = 'ic') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] ?? ''}</svg>`;

const CSS = `
:root{--bg:#0b1210;--bg2:#0d1513;--card:#141d1a;--card2:#18231f;--line:#22302b;--ink:#f2f7f5;--mute:#93a39d;--mute2:#6f807a;
--pri:#1fd8a0;--pri2:#22c58e;--priT:rgba(31,216,160,.12);--red:#ff7a6b;--amber:#f2c14e;--r:12px;--side:248px}
*{box-sizing:border-box}html{color-scheme:dark}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 Manrope,"Plus Jakarta Sans","Avenir Next","Segoe UI",ui-sans-serif,system-ui,-apple-system,Roboto,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--pri);text-decoration:none}a:hover{text-decoration:underline}
h1{font-size:2rem;line-height:1.15;font-weight:800;letter-spacing:-.02em;margin:0}
h2{font-size:1.15rem;font-weight:800;margin:0 0 .7em}h3{font-size:1rem;font-weight:700;margin:0}
.sub{color:var(--mute);margin:.35em 0 0}.meta{color:var(--mute);font-size:.86rem}.mute{color:var(--mute2)}
.ic{width:18px;height:18px;flex:none;vertical-align:-3px}
/* layout */
.side{position:fixed;inset:0 auto 0 0;width:var(--side);background:var(--bg2);border-right:1px solid var(--line);display:flex;flex-direction:column;padding:18px 14px;z-index:30;transition:transform .2s}
.logo{display:flex;align-items:center;gap:8px;font-weight:800;letter-spacing:.01em;font-size:1.02rem;color:#fff;padding:4px 8px 18px}
.logo:hover{text-decoration:none}.logo .ic{width:28px;height:28px;color:var(--pri)}.logo b{color:var(--pri);font-weight:800}
.nav{display:grid;gap:4px}.nav a{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;color:#d5dfdb;font-weight:600;font-size:.93rem}
.nav a:hover{background:rgba(255,255,255,.04);text-decoration:none}.nav a.on{background:var(--priT);color:var(--pri)}
.side .foot{margin-top:auto;border-top:1px solid var(--line);padding-top:12px}
.main{margin-left:var(--side);padding:40px 44px 56px;max-width:calc(var(--side) + 1240px)}
.mtop{display:none}.nav-t{display:none}.scrim{display:none}
.phead{padding-bottom:22px;margin-bottom:26px;border-bottom:1px solid var(--line)}
section{margin:0 0 30px}.hr{border:0;border-top:1px solid var(--line);margin:26px 0}
@media(max-width:900px){
 .side{transform:translateX(-100%);box-shadow:0 0 40px rgba(0,0,0,.6)}
 .nav-t:checked~.side{transform:none}.nav-t:checked~.scrim{display:block;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:20}
 .main{margin-left:0;padding:16px 16px 40px}
 .mtop{display:flex;align-items:center;gap:10px;margin:-4px 0 18px}
 .burger{display:inline-grid;place-items:center;width:42px;height:42px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink);cursor:pointer}
 .mtop .logo{padding:0}h1{font-size:1.6rem}
}
/* cards e grids */
.grid{display:grid;gap:16px;grid-template-columns:repeat(3,minmax(0,1fr))}
@media(max-width:1180px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:640px){.grid{grid-template-columns:1fr}}
.box{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:18px}
.gcard{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:18px;display:flex;flex-direction:column;gap:12px;min-width:0}
.gcard:hover{border-color:#2e4239}
.gtop{display:flex;justify-content:space-between;align-items:center;gap:8px}
.gtop .ic{width:26px;height:26px;color:var(--pri)}
.kicker{font-size:.66rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--mute2)}
.gcard h3{font-size:1.02rem;line-height:1.35;overflow-wrap:anywhere;min-height:2.7em}
.gcard hr{border:0;border-top:1px solid var(--line);margin:0}
.kv{display:grid;gap:6px;margin:0;font-size:.86rem}.kv div{display:flex;justify-content:space-between;gap:12px}
.kv dt{display:flex;align-items:center;gap:6px;color:#cfdad6}.kv dt .ic{width:15px;height:15px;color:var(--pri)}
.kv dd{margin:0;color:var(--mute);text-align:right;overflow-wrap:anywhere;min-width:0}
.btn-wa{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:auto;padding:11px 14px;border-radius:10px;background:var(--pri);color:#062018;font-weight:800;font-size:.93rem;border:0;cursor:pointer}
.btn-wa:hover{background:#3be3b1;text-decoration:none}
.btn-dark{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:auto;padding:10px 14px;border-radius:10px;background:#0c1311;border:1px solid var(--line);color:var(--ink);font-weight:700;font-size:.9rem}
.btn-dark:hover{border-color:var(--pri);text-decoration:none}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;font:inherit;font-weight:700;padding:10px 16px;border-radius:10px;border:1px solid var(--pri);background:var(--pri);color:#062018;cursor:pointer;text-align:center}
.btn:hover{text-decoration:none;filter:brightness(1.08)}.btn.sec{background:transparent;color:var(--ink);border-color:var(--line)}.btn.sec:hover{border-color:var(--pri)}
.btn.red{background:transparent;color:var(--red);border-color:#5a2b26}.btn.sm{padding:6px 11px;font-size:.84rem}
/* contadores / passos */
.stats{display:grid;gap:14px;grid-template-columns:repeat(3,minmax(0,1fr))}@media(max-width:640px){.stats{grid-template-columns:1fr 1fr}}
.stats.four{grid-template-columns:repeat(4,minmax(0,1fr))}@media(max-width:900px){.stats.four{grid-template-columns:1fr 1fr}}
.stat{background:linear-gradient(160deg,#18342b,#141d1a 70%);border:1px solid var(--line);border-radius:var(--r);padding:18px}
.stat .ic{color:var(--pri);width:22px;height:22px}.stat b{display:block;font-size:2rem;font-weight:800;margin-top:6px;line-height:1.1}.stat span{color:var(--mute);font-size:.88rem}
.badge{display:inline-flex;align-items:center;gap:6px;color:var(--pri);font-weight:700;font-size:.88rem}
.steps{display:grid;gap:22px;grid-template-columns:1fr 1fr}@media(max-width:640px){.steps{grid-template-columns:1fr}}
.step .ic{color:var(--pri);width:22px;height:22px}.step h3{margin:8px 0 4px}.step p{margin:0;color:var(--mute);font-size:.9rem}
.steps.v{grid-template-columns:1fr;gap:0}.steps.v .step{padding:22px 0;border-bottom:1px solid var(--line)}
.lists{display:grid;gap:30px;grid-template-columns:1fr 1fr}@media(max-width:760px){.lists{grid-template-columns:1fr}}
.list a{display:flex;justify-content:space-between;align-items:center;padding:10px 4px;border-bottom:1px solid var(--line);color:var(--ink);font-weight:600;font-size:.93rem}
.list a:hover{color:var(--pri);text-decoration:none}.list a span{display:flex;align-items:center;gap:8px;color:var(--mute);font-weight:500}
.cta-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}
/* estados */
.cities{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:.88rem;font-weight:600}.cities a{display:inline-flex;align-items:center;gap:3px}
.cities .ic{width:13px;height:13px}.state-n{color:var(--mute);font-size:.88rem;margin-top:-6px}
/* filtros */
form.filters{display:grid;gap:10px;margin-bottom:18px}
.search{position:relative}.search .ic{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--mute)}.search input{padding-left:42px}
.sels{display:grid;gap:10px;grid-template-columns:repeat(3,minmax(0,1fr))}@media(max-width:640px){.sels{grid-template-columns:1fr}}
.sels.emp{grid-template-columns:repeat(3,minmax(0,1fr))}@media(min-width:1180px){.sels.emp{grid-template-columns:repeat(6,minmax(0,1fr))}}
input,select,textarea{font:inherit;color:var(--ink);padding:11px 12px;border:1px solid var(--line);border-radius:10px;background:var(--card);width:100%;min-width:0}
input:focus,select:focus,textarea:focus{outline:none;border-color:var(--pri)}input[type=date]{color-scheme:dark}
textarea{min-height:90px;resize:vertical}textarea.code{min-height:160px;font-family:ui-monospace,monospace;font-size:13px}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.between{justify-content:space-between}
.chk{display:flex;gap:6px;align-items:center;font-size:.9rem;color:var(--mute)}.chk input{width:auto}
.pager{display:flex;gap:10px;justify-content:center;align-items:center;margin:26px 0}
label{display:grid;gap:5px;font-size:.86rem;color:var(--mute)}
.fields{display:grid;gap:12px;grid-template-columns:1fr}@media(min-width:720px){.fields{grid-template-columns:1fr 1fr}}
/* tags, notas, tabelas */
.tag{display:inline-flex;align-items:center;gap:4px;font-size:.74rem;font-weight:700;padding:3px 9px;border-radius:999px;background:#1d2a26;color:#cfdad6;border:1px solid var(--line)}
.tag.cat{color:var(--pri)}.st-ativo{color:var(--pri)}.st-expirado{color:var(--red)}.st-indeterminado{color:var(--mute)}
.conf-alta{background:rgba(31,216,160,.14);color:var(--pri);border-color:rgba(31,216,160,.35)}
.conf-media{background:rgba(242,193,78,.12);color:var(--amber);border-color:rgba(242,193,78,.35)}
.conf-baixa{background:rgba(255,122,107,.1);color:var(--red);border-color:rgba(255,122,107,.3)}
.ps-contatado{color:#8fb8ff}.ps-respondeu{color:var(--amber)}.ps-cliente{color:var(--pri)}
.note{background:#17231f;border:1px solid var(--line);border-left:3px solid var(--pri);padding:12px 14px;border-radius:10px;margin:0 0 16px}
.err{color:var(--red)}.note.err{border-left-color:var(--red)}.ok{color:var(--pri)}
.oport{background:#1a2420;border:1px dashed #33463f;border-radius:10px;padding:8px 10px;font-size:.84rem;color:#d7e2de}
.links{display:flex;flex-wrap:wrap;gap:6px}.links a{font-size:.8rem;font-weight:700;padding:4px 10px;border-radius:8px;border:1px solid var(--line);color:var(--ink);display:inline-flex;align-items:center;gap:4px}
.links a:hover{border-color:var(--pri);text-decoration:none}.links .ic{width:13px;height:13px}
details.prosp{border-top:1px solid var(--line);padding-top:10px}details.prosp summary{cursor:pointer;font-size:.86rem;font-weight:700;color:#cfdad6}
details.prosp form{display:grid;gap:8px;margin-top:10px}details.prosp textarea{min-height:70px}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:var(--r);overflow:hidden;font-size:.86rem}
th,td{padding:9px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{background:#111a17;font-weight:700;color:#cfdad6}
.scroll{overflow-x:auto}code{background:#1d2a26;padding:1px 5px;border-radius:5px}summary{cursor:pointer}
.bars{display:grid;gap:7px}.bar{display:grid;grid-template-columns:minmax(90px,170px) 1fr 44px;gap:10px;align-items:center;font-size:.86rem}
.bar i{display:block;height:8px;border-radius:6px;background:var(--pri)}.bar a{color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.bar span{text-align:right;color:var(--mute)}
.chips{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.chips a{padding:5px 11px;border:1px solid var(--line);border-radius:999px;color:var(--ink);font-size:.84rem}
.chips a.on{background:var(--priT);color:var(--pri);border-color:rgba(31,216,160,.4)}.chips a:hover{text-decoration:none;border-color:var(--pri)}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:10px;overflow:hidden}.seg a{padding:7px 12px;color:var(--mute);font-size:.84rem;font-weight:700}.seg a.on{background:var(--priT);color:var(--pri)}
`;

const NAV: [string, string, string][] = [
  ['/', 'home', 'Início'], ['/grupos', 'books', 'Biblioteca de grupos'], ['/estados', 'pin', 'Estados e cidades'],
  ['/categorias', 'tag', 'Categorias'], ['/como-utilizar', 'book', 'Como utilizar'], ['/empresas', 'building', 'Empresas'],
];
const LOGO = `<a class="logo" href="/">${icon('globe')}<span>CONECTA <b>BRASIL-EUA</b></span></a>`;

export function layout(title: string, body: string, active = ''): string {
  const nav = NAV.map(([h, ic, l]) => `<a href="${h}" class="${active === h ? 'on' : ''}"${active === h ? ' aria-current="page"' : ''}>${icon(ic)}${l}</a>`).join('');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<meta name="referrer" content="no-referrer"><meta name="theme-color" content="#0b1210"><title>${esc(title)} · Conecta Brasil-EUA</title><style>${CSS}</style></head>
<body><input type="checkbox" id="nav-t" class="nav-t" aria-hidden="true">
<aside class="side" aria-label="Menu">${LOGO}<nav class="nav">${nav}</nav>
<div class="foot nav"><a href="/admin" class="${active === '/admin' ? 'on' : ''}">${icon('gear')}Administração</a></div></aside>
<label for="nav-t" class="scrim" aria-hidden="true"></label>
<main class="main"><div class="mtop"><label for="nav-t" class="burger" aria-label="Abrir menu">${icon('menu')}</label>${LOGO}</div>
${body}</main></body></html>`;
}

const pageHead = (title: string, sub: string) => `<header class="phead"><h1>${esc(title)}</h1><p class="sub">${sub}</p></header>`;

export const nomeExibicao = (g: Grupo) => g.nome_grupo || `Grupo ${catLabel(g.categoria).toLowerCase()} · ${g.cidade || (g.estado ? estNome(g.estado) : 'EUA')}`;
const statusTag = (s: string) => `<span class="tag st-${esc(s)}">${esc((STATUS as Record<string, string>)[s] ?? s)}</span>`;
const NI = '<span class="mute">Não informado</span>';

export function grupoCard(g: Grupo): string {
  return `<article class="gcard">
<div class="gtop">${icon('chat')}<span class="kicker">Grupo de WhatsApp</span></div>
<h3>${esc(nomeExibicao(g))}</h3><hr>
<dl class="kv">
<div><dt>${icon('pin')}Estado</dt><dd${g.estado ? ` title="${esc(estNome(g.estado))}"` : ''}>${g.estado ? esc(g.estado) : NI}</dd></div>
<div><dt>Cidade</dt><dd>${g.cidade ? esc(g.cidade) : NI}</dd></div>
<div><dt>${icon('tag')}Categoria</dt><dd>${g.categoria ? esc(catLabel(g.categoria)) : NI}</dd></div>
</dl>
<a class="btn-wa" href="${esc(inviteLink(g.codigo))}" target="_blank" rel="noopener noreferrer">${icon('wa')}Entrar no WhatsApp</a></article>`;
}

export function qs(f: Filtros & { page?: number }, base: Record<string, string | undefined> = {}): string {
  const p = new URLSearchParams();
  const all = { q: f.q, estado: f.estado, cidade: f.cidade, categoria: f.categoria, nicho: f.nicho, page: f.page && f.page > 1 ? String(f.page) : undefined, ...base };
  for (const [k, v] of Object.entries(all)) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `?${s}` : '';
}

const opt = (val: string, label: string, cur?: string) => `<option value="${esc(val)}"${cur !== undefined && cur.toLowerCase() === val.toLowerCase() ? ' selected' : ''}>${esc(label)}</option>`;

export function filtersForm(action: string, f: Filtros, cidades: string[], estados: string[]): string {
  const ufs = [...new Set([...estados, ...(f.estado ? [f.estado] : [])])];
  const estOpts = ufs.map((uf) => (uf === '' || uf === SEM_ESTADO ? opt(SEM_ESTADO, 'Nacional / sem estado', f.estado) : opt(uf, estLabel(uf), f.estado))).join('');
  const catOpts = CATEGORIA_SLUGS.map((s) => opt(s, CATEGORIAS[s], f.categoria)).join('');
  const cidOpts = [...new Set([...cidades, ...(f.cidade ? [f.cidade] : [])])].map((c) => opt(c, c, f.cidade)).join('');
  return `<form class="filters" method="get" action="${esc(action)}" role="search">
<div class="search">${icon('search')}<input type="search" name="q" placeholder="Busque por nome, cidade ou interesse" value="${esc(f.q ?? '')}" aria-label="Buscar"></div>
<div class="sels">
<select name="estado" aria-label="Estado" onchange="this.form.cidade.value='';this.form.submit()"><option value="">Todos os estados</option>${estOpts}</select>
<select name="cidade" aria-label="Cidade" onchange="this.form.submit()"><option value="">Todas as cidades</option>${cidOpts}</select>
<select name="categoria" aria-label="Categoria" onchange="this.form.submit()"><option value="">Todas as categorias</option>${catOpts}</select>
</div>${f.nicho ? `<input type="hidden" name="nicho" value="${esc(f.nicho)}">` : ''}
<noscript><button class="btn" type="submit">Filtrar</button></noscript></form>`;
}

const pagerHtml = (page: number, pages: number, href: (p: number) => string) => pages > 1 ? `<nav class="pager" aria-label="Paginação">
${page > 1 ? `<a class="btn sec sm" href="${esc(href(page - 1))}">← Anterior</a>` : ''}
<span class="meta">Página ${page} de ${pages}</span>
${page < pages ? `<a class="btn sec sm" href="${esc(href(page + 1))}">Próxima →</a>` : ''}</nav>` : '';

export function libraryPage(opts: { f: Filtros; page: number; pages: number; total: number; rows: Grupo[]; cidades: string[]; estados: string[] }): string {
  const { f, page, pages } = opts;
  const filtrado = !!(f.q || f.estado || f.cidade || f.categoria || f.nicho);
  return layout('Biblioteca de grupos', `${pageHead('Biblioteca', `${plural(opts.total, 'grupo', 'grupos')}${filtrado ? ' com esses filtros · <a href="/grupos">limpar filtros</a>' : ''}`)}
${filtersForm('/grupos', f, opts.cidades, opts.estados)}
${opts.rows.length ? `<div class="grid">${opts.rows.map(grupoCard).join('')}</div>` : '<p class="note">Nenhum grupo encontrado com esses filtros.</p>'}
${pagerHtml(page, pages, (p) => '/grupos' + qs({ ...f, page: p }))}`, '/grupos');
}

const grupoHref = (uf: string, cidade?: string) => `/grupos${qs({ estado: uf || SEM_ESTADO, cidade })}`;

export function inicioPage(t: DashTotais, estados: EstadoResumo[], cats: { categoria: string; n: number }[]): string {
  const estList = estados.map((e) => `<a href="${esc(grupoHref(e.estado))}">${esc(estNome(e.estado))}<span>${e.n}${icon('arrow')}</span></a>`).join('');
  const catList = cats.map((c) => `<a href="/grupos${esc(qs({ categoria: c.categoria }))}">${esc(catLabel(c.categoria))}<span>${c.n}${icon('arrow')}</span></a>`).join('');
  return layout('Início', `${pageHead('Olá 👋', 'Que bom ter você aqui. Encontre grupos de brasileiros nos Estados Unidos, por estado, cidade e interesse.')}
<section><p class="badge">${icon('shield')}Só aparecem convites ativos (verificados automaticamente)</p>
<div class="stats" style="margin-top:14px">
<div class="stat">${icon('books')}<b>${t.ativos}</b><span>Grupos ativos</span></div>
<div class="stat">${icon('pin')}<b>${t.estados}</b><span>Estados</span></div>
<div class="stat">${icon('tag')}<b>${t.categorias}</b><span>Categorias</span></div></div></section>
<hr class="hr"><section><h2>Encontre sua comunidade</h2><p class="sub">Explore os grupos e encontre o seu lugar perto de você.</p>
<div class="cta-row"><a class="btn" href="/grupos">${icon('books')}Abrir a biblioteca</a><a class="btn sec" href="/estados">${icon('pin')}Estados e cidades</a></div></section>
<hr class="hr"><section><h2>Como aproveitar a biblioteca</h2><div class="steps">
<div class="step">${icon('search')}<h3>01 · Pesquise</h3><p>Busque pelo nome, cidade ou interesse.</p></div>
<div class="step">${icon('filter')}<h3>02 · Filtre</h3><p>Refine por estado, cidade e categoria.</p></div></div></section>
<hr class="hr"><div class="lists">
<section><h2>Estados e cidades</h2><div class="list">${estList || '<p class="meta">Nenhum grupo ativo ainda.</p>'}</div></section>
<section><h2>Categorias</h2><div class="list">${catList || '<p class="meta">Nenhum grupo ativo ainda.</p>'}</div></section></div>`, '/');
}

export function estadosPage(estados: EstadoResumo[]): string {
  const cards = estados.map((e) => `<article class="gcard">
<div class="gtop">${icon('pin')}</div><h3 style="min-height:0">${esc(estNome(e.estado))}</h3><p class="state-n">${plural(e.n, 'grupo', 'grupos')}</p><hr>
${e.cidades.length ? `<div class="cities">${e.cidades.map((c) => `<a href="${esc(grupoHref(e.estado, c.cidade))}">${icon('arrow')}${esc(c.cidade)}</a>`).join('')}</div>` : '<p class="meta" style="margin:0">Nenhuma cidade informada</p>'}
<a class="btn-dark" href="${esc(grupoHref(e.estado))}">Ver grupos ${icon('arrow')}</a></article>`).join('');
  return layout('Estados e cidades', `${pageHead('Estados e cidades', 'Explore os grupos por estado e cidade na biblioteca.')}
${cards ? `<div class="grid">${cards}</div>` : '<p class="note">Nenhum grupo ativo ainda.</p>'}`, '/estados');
}

export function categoriasPage(cats: { categoria: string; n: number }[]): string {
  const n = new Map(cats.map((c) => [c.categoria, c.n]));
  const slugs = [...CATEGORIA_SLUGS].sort((a, b) => (n.get(b) ?? 0) - (n.get(a) ?? 0));
  const cards = slugs.map((s) => `<article class="gcard">
<div class="gtop">${icon('tag')}</div><h3 style="min-height:0">${esc(CATEGORIAS[s])}</h3><p class="state-n">${plural(n.get(s) ?? 0, 'grupo', 'grupos')}</p>
<a class="btn-dark" href="/grupos${esc(qs({ categoria: s }))}">Ver grupos ${icon('arrow')}</a></article>`).join('');
  return layout('Categorias', `${pageHead('Categorias', 'Encontre grupos pelo assunto que interessa a você.')}<div class="grid">${cards}</div>`, '/categorias');
}

export function comoUtilizarPage(): string {
  return layout('Como utilizar', `${pageHead('Como utilizar', 'Da pesquisa à sua próxima conexão.')}
<div class="steps v">
<div class="step">${icon('search')}<h3>01 · Encontre um grupo</h3><p>Abra a <a href="/grupos">biblioteca</a> e pesquise pelo nome, cidade ou interesse.</p></div>
<div class="step">${icon('filter')}<h3>02 · Filtre</h3><p>Use os filtros de estado, cidade e categoria para chegar mais rápido ao grupo certo.</p></div>
<div class="step">${icon('open')}<h3>03 · Abra o convite</h3><p>Toque em <b>Entrar no WhatsApp</b> para abrir o convite público do grupo. A entrada depende da disponibilidade do convite e das regras do grupo.</p></div>
</div>`, '/como-utilizar');
}

export function adminPage(opts: { rows: Grupo[]; total: number; page: number; pages: number; f: Filtros; msg?: string }): string {
  const { f } = opts;
  const statusOpts = ['', ...STATUS_LIST].map((s) => `<option value="${s}" ${f.status === s ? 'selected' : ''}>${s ? STATUS[s as keyof typeof STATUS] : 'Todos os status'}</option>`).join('');
  const rows = opts.rows.map((g) => `<tr><td><a href="${esc(g.link)}" target="_blank" rel="noopener noreferrer">${esc(nomeExibicao(g))}</a>${g.nome_grupo ? '' : ' <span class="tag">sem nome</span>'}<div class="meta">${esc(g.codigo)}</div></td>
<td>${esc(g.cidade)} / ${esc(g.estado)}</td><td>${esc(catLabel(g.categoria))}${g.nicho ? `<div class="meta">${esc(g.nicho)}</div>` : ''}</td><td>${statusTag(g.status)}<div class="meta">${esc(fmtDate(g.ultima_validacao))}</div></td>
<td><div class="row"><a class="btn sec sm" href="/admin/grupos/${esc(g.codigo)}">Editar</a>
${g.status !== 'expirado' ? `<form method="post" action="/admin/grupos/${esc(g.codigo)}/expirar"><button class="btn red sm">Expirar</button></form>` : ''}</div></td></tr>`).join('');
  const p = new URLSearchParams();
  if (f.q) p.set('q', f.q); if (f.status) p.set('status', f.status);
  const link = (pg: number) => { const x = new URLSearchParams(p); x.set('page', String(pg)); return `/admin?${x}`; };
  return layout('Admin', `<h1>Admin</h1>${opts.msg ? `<p class="note">${esc(opts.msg)}</p>` : ''}
<div class="row" style="margin-bottom:12px"><a class="btn" href="/admin/novo">+ Novo link</a><a class="btn sec" href="/admin/importar">Importar CSV (grupos/empresas)</a>
<a class="btn sec" href="/admin/exportar.csv">Exportar grupos CSV</a><a class="btn sec" href="/empresas/exportar.csv">Exportar empresas CSV</a>
<form method="post" action="/admin/revalidar"><button class="btn sec" title="Verifica um lote pequeno de links agora">Revalidar agora</button></form></div>
<form class="row" method="get" action="/admin" style="margin-bottom:12px"><input style="max-width:280px" type="search" name="q" placeholder="Buscar…" value="${esc(f.q ?? '')}">
<select style="max-width:200px" name="status">${statusOpts}</select><button class="btn sec">Filtrar</button></form>
<p class="meta">${opts.total} link(s)</p>
<div class="scroll"><table><thead><tr><th>Grupo</th><th>Local</th><th>Categoria</th><th>Status</th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="5">Nada aqui.</td></tr>'}</tbody></table></div>
${opts.pages > 1 ? `<div class="pager">${opts.page > 1 ? `<a class="btn sec sm" href="${esc(link(opts.page - 1))}">← Anterior</a>` : ''}<span class="meta">Página ${opts.page} de ${opts.pages}</span>${opts.page < opts.pages ? `<a class="btn sec sm" href="${esc(link(opts.page + 1))}">Próxima →</a>` : ''}</div>` : ''}`, '/admin');
}

export function formPage(g: Partial<Grupo> | null, erros: string[] = [], isNew = true): string {
  const v = (k: keyof Grupo) => esc(g?.[k] ?? '');
  const sel = (name: string, opts: [string, string][], cur?: string) =>
    `<select name="${name}" required>${opts.map(([val, l]) => `<option value="${esc(val)}" ${cur === val ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
  const action = isNew ? '/admin/novo' : `/admin/grupos/${esc(g?.codigo)}`;
  return layout(isNew ? 'Novo link' : 'Editar link', `<h1>${isNew ? 'Novo link' : 'Editar link'}</h1>
${erros.length ? `<div class="note err"><b>Corrija:</b><ul>${erros.map((e) => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''}
<form method="post" action="${action}"><div class="fields">
<label>Link do convite<input name="link" required placeholder="https://chat.whatsapp.com/…" value="${v('link')}"></label>
<label>Código (preenchido a partir do link se vazio)<input name="codigo" value="${v('codigo')}" ${isNew ? '' : 'readonly'}></label>
<label>Nome do grupo<input name="nome_grupo" maxlength="200" value="${v('nome_grupo')}"></label>
<label>Estado${sel('estado', [['', 'Selecione…'], ...Object.keys(ESTADOS).map((uf) => [uf, estLabel(uf)] as [string, string])], g?.estado)}</label>
<label>Cidade<input name="cidade" value="${v('cidade')}"></label>
<label>Categoria${sel('categoria', [['', 'Selecione…'], ...CATEGORIA_SLUGS.map((s) => [s, CATEGORIAS[s]] as [string, string])], g?.categoria)}</label>
<label>Nicho (opcional)<input name="nicho" maxlength="60" value="${v('nicho')}"></label>
<label>Status${sel('status', STATUS_LIST.map((s) => [s, STATUS[s]] as [string, string]), g?.status ?? 'indeterminado')}</label>
<label>URL da fonte<input name="fonte_url" type="url" value="${v('fonte_url')}"></label>
<label>Data da coleta<input name="data_coleta" type="date" value="${v('data_coleta')}"></label>
<label>Última validação<input name="ultima_validacao" type="date" value="${v('ultima_validacao')}"></label>
</div><div class="row" style="margin-top:14px"><button class="btn">Salvar</button><a class="btn sec" href="/admin">Cancelar</a></div></form>
${isNew ? '' : `<h2>Outras ações</h2><div class="row">
<form method="post" action="/admin/grupos/${esc(g?.codigo)}/revalidar"><button class="btn sec">Revalidar este link</button></form>
<form method="post" action="/admin/grupos/${esc(g?.codigo)}/expirar"><button class="btn red">Marcar como expirado</button></form>
<form method="post" action="/admin/grupos/${esc(g?.codigo)}/excluir" onsubmit="return confirm('Excluir este link?')"><button class="btn red">Excluir</button></form></div>`}`, '/admin');
}

export function importPage(erro = ''): string {
  return layout('Importar CSV', `<h1>Importar CSV</h1>${erro ? `<p class="note err">${esc(erro)}</p>` : ''}
<p class="meta">UTF-8 com cabeçalho. Pode enviar <b>vários arquivos de uma vez</b>, de <b>grupos</b> e de <b>empresas</b> misturados:
o tipo de cada arquivo é detectado pelo cabeçalho.</p>
<ul class="meta">
<li><b>Grupos</b> (ex.: <code>grupos.csv</code>, <code>grupos_outros.csv</code>): <code>codigo, link, nome_grupo, estado, cidade, categoria, fonte_url, data_coleta, status, ultima_validacao</code> + <code>nicho</code> opcional. Upsert pelo <code>codigo</code>.</li>
<li><b>Empresas</b> (ex.: <code>leads_empresas.csv</code>): <code>empresa, nicho, cidade, estado, telefone_comercial, site, instagram, facebook, google_nota, google_avaliacoes, indicio_brasileiro, oportunidade_marketing, fonte_url, data_coleta</code>. Deduplicação pelo telefone (ou empresa+cidade+estado).</li></ul>
<form method="post" action="/admin/importar" enctype="multipart/form-data">
<label>Arquivo(s) CSV<input type="file" name="arquivo" accept=".csv,text/csv" multiple></label>
<p class="meta">…e/ou cole o conteúdo:</p><textarea class="code" name="texto"></textarea>
<div class="row" style="margin-top:10px"><button class="btn">Pré-visualizar</button></div></form>`, '/admin');
}

const contagem = <T extends Record<string, string>>(rows: T[], k: keyof T) =>
  Object.entries(rows.reduce<Record<string, number>>((a, g) => ((a[g[k]] = (a[g[k]] ?? 0) + 1), a), {}))
    .sort((x, y) => y[1] - x[1]).map(([x, n]) => `${esc(x || '(vazio)')}=${n}`).join(', ') || '—';

type ErrLike = { linha: number; codigo: string; erros: string[] };
const errTable = (rows: { nome: string; e: ErrLike }[], col: string, cls = '') => rows.length
  ? `<div class="scroll"><table><thead><tr><th>Arquivo</th><th>Linha</th><th>${col}</th><th>Detalhe</th></tr></thead><tbody>${rows.map(({ nome, e }) =>
    `<tr><td>${esc(nome)}</td><td>${e.linha}</td><td>${esc(e.codigo)}</td><td class="${cls}">${e.erros.map(esc).join('<br>')}</td></tr>`).join('')}</tbody></table></div>` : '';

export function previewPage(all: ImportacaoResult, existentes: Set<string>, empExistentes: Set<string>, files: ArquivoCsv[]): string {
  const r = all.grupos;
  const E = all.empresas;
  const hidden = files.map((f) => `<input type="hidden" name="nome" value="${esc(f.nome)}"><input type="hidden" name="texto" value="${esc(f.texto)}">`).join('');
  const tipos = all.tipos.map((t) => `<span class="tag ${t.tipo ? '' : 'st-expirado'}">${esc(t.nome)}: ${t.tipo ?? 'ignorado'}</span>`).join(' ');
  const ignorados = all.ignorados.length ? `<p class="note err">${all.ignorados.map((i) => `${esc(i.nome)}: ${esc(i.motivo)}`).join('<br>')}</p>` : '';

  // ----- grupos -----
  const novos = r.validos.filter((g) => !existentes.has(g.codigo)).length;
  const gErros = r.arquivos.reduce((n, a) => n + a.result.erros.length, 0);
  const porArquivo = r.arquivos.map(({ nome, result: a }) => `<tr><td><b>${esc(nome)}</b></td>
<td>${a.fatal ? `<span class="err">${esc(a.fatal)}</span>` : `${a.totalLinhas} linhas · ${a.validos.length} válidas · <span class="${a.erros.length ? 'err' : ''}">${a.erros.length} erro(s)</span> · ${a.avisos.length} aviso(s)`}</td>
<td class="meta">${a.fatal ? '' : `status: ${contagem(a.validos, 'status')}<br>estados: ${contagem(a.validos, 'estado')}`}</td></tr>`).join('');
  const dups = r.duplicados.map((d) => `<tr><td>${esc(d.codigo)}</td><td>${d.ocorrencias.map((o) => `${esc(o.arquivo)}:${o.linha}`).join('<br>')}</td>
<td>${d.conflitos.length ? `<span class="err">${d.conflitos.map(esc).join(', ')}</span>` : 'idênticos'}</td><td>${esc(d.escolhido)}</td></tr>`).join('');
  const gPreview = r.validos.slice(0, 50).map((g) => `<tr><td>${existentes.has(g.codigo) ? 'atualizar' : '<b class="ok">novo</b>'}</td><td>${esc(g.codigo)}</td><td>${esc(g.nome_grupo || '(vazio)')}</td><td>${esc(g.cidade)}/${esc(g.estado)}</td><td>${esc(catLabel(g.categoria))}${g.nicho ? ` · ${esc(g.nicho)}` : ''}</td><td>${statusTag(g.status)}</td><td class="meta">${esc(r.origem.get(g.codigo))}</td></tr>`).join('');
  const gErr = r.arquivos.flatMap(({ nome, result }) => result.erros.map((e) => ({ nome, e })));
  const gAv = r.arquivos.flatMap(({ nome, result }) => result.avisos.map((e) => ({ nome, e }))).slice(0, 200);
  const secGrupos = r.arquivos.length ? `<h2>Grupos</h2>
<div class="stats"><div class="stat"><b>${r.arquivos.length}</b><span>arquivo(s)</span></div><div class="stat"><b>${r.validos.length}</b><span>códigos únicos válidos</span></div>
<div class="stat"><b>${novos}</b><span>novos / ${r.validos.length - novos} atualizações</span></div><div class="stat"><b class="${gErros ? 'err' : ''}">${gErros}</b><span>linhas com erro (ignoradas)</span></div></div>
<div class="scroll" style="margin-top:10px"><table><thead><tr><th>Arquivo</th><th>Resumo</th><th>Contagens</th></tr></thead><tbody>${porArquivo}</tbody></table></div>
<p class="meta">Total mesclado — status: ${contagem(r.validos, 'status')} · estados: ${contagem(r.validos, 'estado')}</p>
${dups ? `<h3>Códigos repetidos entre arquivos (${r.duplicados.length})</h3><div class="scroll"><table><thead><tr><th>Código</th><th>Ocorrências</th><th>Campos divergentes</th><th>Versão usada</th></tr></thead><tbody>${dups}</tbody></table></div>` : ''}
${gErr.length ? `<h3>Erros (grupos)</h3>${errTable(gErr, 'Código', 'err')}` : ''}
${gAv.length ? `<details><summary>Avisos (grupos): ${gAv.length}</summary>${errTable(gAv, 'Código')}</details>` : ''}
<details><summary>Prévia de grupos (até 50)</summary><div class="scroll"><table><thead><tr><th>Ação</th><th>Código</th><th>Nome</th><th>Local</th><th>Categoria</th><th>Status</th><th>Arquivo</th></tr></thead><tbody>${gPreview}</tbody></table></div></details>` : '';

  // ----- empresas -----
  const cont = contagemPorArquivo(E, (k) => empExistentes.has(k));
  const eNovas = E.empresas.filter((e) => !empExistentes.has(e.chave)).length;
  const eErros = E.arquivos.reduce((n, a) => n + a.result.erros.length, 0);
  const ePorArq = E.arquivos.map(({ nome, result: a }) => {
    const c = cont.get(nome)!;
    return `<tr><td><b>${esc(nome)}</b></td><td>${a.fatal ? `<span class="err">${esc(a.fatal)}</span>` : a.vazio ? '<span class="meta">só cabeçalho (nenhuma linha)</span>'
      : `${a.totalLinhas} linhas · <b class="ok">${c.inseridas}</b> nova(s) · ${c.mescladas} mesclada(s) · <span class="${c.ignoradas ? 'err' : ''}">${c.ignoradas} ignorada(s)</span> · ${a.avisos.length} aviso(s)`}</td>
<td class="meta">${a.fatal || a.vazio ? '' : `nichos: ${contagem(a.validos, 'nicho')}<br>estados: ${contagem(a.validos, 'estado')}`}</td></tr>`;
  }).join('');
  const eMescl = E.mesclados.map((m) => `<tr><td>${esc(m.chave)}</td><td>${m.ocorrencias.map((o) => `${esc(o.arquivo)}:${o.linha} — ${esc(o.empresa)} (${esc(o.cidade)})`).join('<br>')}</td><td>${m.nomesDiferentes ? '<span class="err">nomes/cidades diferentes — confira</span>' : 'mesma empresa'}</td></tr>`).join('');
  const eErr = E.arquivos.flatMap(({ nome, result }) => result.erros.map((e) => ({ nome, e })));
  const eAv = E.arquivos.flatMap(({ nome, result }) => result.avisos.map((e) => ({ nome, e }))).slice(0, 300);
  const ePreview = E.empresas.slice(0, 50).map((e) => `<tr><td>${empExistentes.has(e.chave) ? 'mesclar' : '<b class="ok">nova</b>'}</td><td>${esc(e.empresa)}</td><td>${esc(e.nicho)}</td><td>${esc(e.cidade)}/${esc(e.estado)}</td><td>${esc(e.telefone_comercial)}</td><td class="meta">${esc(e.chave)}</td></tr>`).join('');
  const secEmp = E.arquivos.length ? `<h2>Empresas</h2>
<div class="stats"><div class="stat"><b>${E.arquivos.length}</b><span>arquivo(s)</span></div><div class="stat"><b>${E.empresas.length}</b><span>empresas únicas</span></div>
<div class="stat"><b>${eNovas}</b><span>novas / ${E.empresas.length - eNovas} mesclas com o banco</span></div><div class="stat"><b class="${eErros ? 'err' : ''}">${eErros}</b><span>linhas com erro (ignoradas)</span></div></div>
<div class="scroll" style="margin-top:10px"><table><thead><tr><th>Arquivo</th><th>Resumo</th><th>Contagens</th></tr></thead><tbody>${ePorArq}</tbody></table></div>
${eMescl ? `<h3>Linhas mescladas pela chave (${E.mesclados.length})</h3><div class="scroll"><table><thead><tr><th>Chave</th><th>Linhas</th><th></th></tr></thead><tbody>${eMescl}</tbody></table></div>` : ''}
${eErr.length ? `<h3>Erros (empresas)</h3>${errTable(eErr, 'Empresa', 'err')}` : ''}
${eAv.length ? `<details><summary>Avisos (empresas): ${eAv.length}</summary>${errTable(eAv, 'Empresa')}</details>` : ''}
<details><summary>Prévia de empresas (até 50)</summary><div class="scroll"><table><thead><tr><th>Ação</th><th>Empresa</th><th>Nicho</th><th>Local</th><th>Telefone</th><th>Chave</th></tr></thead><tbody>${ePreview}</tbody></table></div></details>` : '';

  const totalReg = r.validos.length + E.empresas.length;
  return layout('Pré-visualização', `<h1>Pré-visualização da importação</h1>
<p>${tipos}</p>${ignorados}
${totalReg ? `<form method="post" action="/admin/importar/confirmar" style="margin:14px 0">${hidden}
<button class="btn">Confirmar importação (${r.validos.length} grupo(s), ${E.empresas.length} empresa(s))</button> <a class="btn sec" href="/admin/importar">Cancelar</a></form>` : '<p class="note">Nenhuma linha válida para importar.</p>'}
${secGrupos}${secEmp}`, '/admin');
}

export function revalidatePage(out: { codigo: string; resultado: string; motivo: string; status: string }[]): string {
  return layout('Revalidação', `<h1>Revalidação</h1><p class="meta">${out.length} link(s) verificados neste lote. Um link só vira "expirado" após 2 verificações seguidas indicando revogação.</p>
<div class="scroll"><table><thead><tr><th>Código</th><th>Resultado</th><th>Motivo</th><th>Status</th></tr></thead><tbody>
${out.map((o) => `<tr><td>${esc(o.codigo)}</td><td>${esc(o.resultado)}</td><td class="meta">${esc(o.motivo)}</td><td>${statusTag(o.status)}</td></tr>`).join('') || '<tr><td colspan="4">Nada a verificar.</td></tr>'}
</tbody></table></div><p><a class="btn sec" href="/admin">Voltar ao Admin</a></p>`, '/admin');
}

// ---------------- Empresas (leads B2B) ----------------

const safeUrl = (u: string) => (/^https?:\/\/\S+$/i.test(u) ? u : '');
const hostOf = (u: string) => { try { return new URL(u).host.replace(/^www\./, ''); } catch { return u; } };
const ext = (u: string, label: string) => (safeUrl(u) ? `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>` : '');
/** Palavras-chave rápidas para o filtro "oportunidade de marketing" (texto contém). */
export const OPORT_CHIPS = ['sem Instagram', 'sem Facebook', 'sem site', 'sem nota', 'sem telefone', 'Google Business', 'conferir avaliações'];
const CONF_OPTS: [string, string][] = [['', 'Alta + média (padrão)'], ['alta', 'Só alta'], ['media', 'Só média'], ['baixa', 'Só baixa'], ['todas', 'Todas (inclui baixa)']];

export type FiltrosEmpresaUI = FiltrosEmpresa & { page?: number; view?: string };
export function qsEmp(f: FiltrosEmpresaUI): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries({ q: f.q, nicho: f.nicho, estado: f.estado, cidade: f.cidade, oport: f.oport, conf: f.conf, status: f.status,
    view: f.view === 'tabela' ? 'tabela' : undefined, page: f.page && f.page > 1 ? String(f.page) : undefined })) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `?${s}` : '';
}

/** id estável (para âncora) a partir da chave da empresa. */
export function empId(chave: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < chave.length; i++) { h ^= chave.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return 'e' + (h >>> 0).toString(36);
}
const confTag = (c: string) => (c in CONFIANCAS ? `<span class="tag conf-${esc(c)}" title="Confiança de que é negócio brasileiro">${icon('shield', 'ic')}${esc((CONFIANCAS as Record<string, string>)[c])}</span>` : '<span class="tag" title="Sem classificação de confiança">sem classificação</span>');
const statusProspTag = (s: string) => `<span class="tag ps-${esc(s)}">${esc((STATUS_PROSPECCAO as Record<string, string>)[s] ?? s)}</span>`;
const telDigits = (e: EmpresaView) => (e.chave.startsWith('tel:') ? e.chave.slice(4) : '');
const telHtml = (e: EmpresaView) => {
  if (!e.telefone_comercial) return NI;
  const d = telDigits(e);
  return d.length === 10 ? `<a href="tel:+1${d}">${esc(e.telefone_comercial)}</a>` : /^\d{7,15}$/.test(d) ? `<a href="tel:+${d}">${esc(e.telefone_comercial)}</a>` : esc(e.telefone_comercial);
};

function prospForm(e: EmpresaView, volta: string): string {
  const id = empId(e.chave);
  return `<details class="prosp"><summary>Prospecção: ${esc((STATUS_PROSPECCAO as Record<string, string>)[e.status_prospeccao] ?? e.status_prospeccao)}${e.data_contato ? ` · ${esc(fmtDate(e.data_contato))}` : ''}</summary>
<form method="post" action="/empresas/prospeccao">
<input type="hidden" name="chave" value="${esc(e.chave)}"><input type="hidden" name="volta" value="${esc(volta)}#${id}">
<label>Status<select name="status_prospeccao">${Object.entries(STATUS_PROSPECCAO).map(([k, l]) => opt(k, l, e.status_prospeccao)).join('')}</select></label>
<label>Data do contato<input type="date" name="data_contato" value="${esc(e.data_contato)}"></label>
<label>Observação<textarea name="observacao" maxlength="${OBSERVACAO_MAX}" placeholder="Ex.: falei com o dono, retornar na segunda">${esc(e.observacao)}</textarea></label>
<button class="btn sm" type="submit">Salvar prospecção</button></form></details>`;
}

export function empresaCard(e: EmpresaView, volta = '/empresas'): string {
  const d = telDigits(e);
  const links = [ext(e.site, 'Site'), ext(e.instagram, 'Instagram'), ext(e.facebook, 'Facebook')].filter(Boolean).join('');
  const nota = e.google_nota ? `${icon('star')} ${esc(e.google_nota)}${e.google_avaliacoes ? ` <span class="mute">(${esc(e.google_avaliacoes)})</span>` : ''}` : NI;
  const fontes = e.fonte_url.split(/\s+/).filter(Boolean).map((u) => ext(u, hostOf(u))).filter(Boolean).join(', ');
  const cta = d ? `<a class="btn-wa" href="tel:+${d.length === 10 ? '1' + d : d}">${icon('phone')}Ligar</a>`
    : safeUrl(e.site) ? `<a class="btn-wa" href="${esc(e.site)}" target="_blank" rel="noopener noreferrer">${icon('open')}Abrir site</a>`
    : safeUrl(e.instagram) ? `<a class="btn-wa" href="${esc(e.instagram)}" target="_blank" rel="noopener noreferrer">${icon('open')}Ver Instagram</a>`
    : safeUrl(e.facebook) ? `<a class="btn-wa" href="${esc(e.facebook)}" target="_blank" rel="noopener noreferrer">${icon('open')}Ver Facebook</a>` : '';
  return `<article class="gcard" id="${empId(e.chave)}">
<div class="gtop">${icon('building')}<span class="row" style="gap:6px"><span class="kicker">Empresa</span>${confTag(e.confianca_brasileira)}</span></div>
<h3 style="min-height:0">${esc(e.empresa)}</h3>
<div class="row">${e.nicho ? `<a class="tag cat" href="/empresas${esc(qsEmp({ nicho: e.nicho }))}">${esc(e.nicho)}</a>` : ''}${statusProspTag(e.status_prospeccao)}</div><hr>
<dl class="kv">
<div><dt>${icon('pin')}Local</dt><dd>${esc([e.cidade, e.estado].filter(Boolean).join(' / ')) || NI}</dd></div>
<div><dt>${icon('phone')}Telefone</dt><dd>${telHtml(e)}</dd></div>
<div><dt>${icon('star')}Google</dt><dd>${nota}</dd></div>
</dl>
${links ? `<div class="links">${links}</div>` : '<p class="meta" style="margin:0">Sem site/redes</p>'}
${e.oportunidade_marketing ? `<div class="oport"><b>Oportunidade:</b> ${esc(e.oportunidade_marketing)}</div>` : ''}
${e.indicio_brasileiro ? `<p class="meta" style="margin:0"><b>Indício BR:</b> ${esc(e.indicio_brasileiro)}</p>` : ''}
${e.observacao ? `<p class="meta" style="margin:0"><b>Obs.:</b> ${esc(e.observacao)}</p>` : ''}
<p class="meta" style="margin:0">${fontes ? `Fonte: ${fontes} · ` : ''}coleta ${esc(fmtDate(e.data_coleta))}</p>
${prospForm(e, volta)}
${cta}</article>`;
}

function empresasTabela(rows: EmpresaView[]): string {
  return `<div class="scroll"><table><thead><tr><th>Empresa</th><th>Nicho</th><th>Local</th><th>Telefone</th><th>Links</th><th>Google</th><th>Confiança</th><th>Prospecção</th></tr></thead><tbody>
${rows.map((e) => `<tr id="${empId(e.chave)}"><td><b>${esc(e.empresa)}</b>${e.oportunidade_marketing ? `<div class="meta">${esc(e.oportunidade_marketing)}</div>` : ''}</td><td>${esc(e.nicho)}</td>
<td>${esc([e.cidade, e.estado].filter(Boolean).join(' / '))}</td><td>${telHtml(e)}</td>
<td><div class="links">${[ext(e.site, 'Site'), ext(e.instagram, 'IG'), ext(e.facebook, 'FB')].filter(Boolean).join('') || '—'}</div></td>
<td>${e.google_nota ? `★ ${esc(e.google_nota)}${e.google_avaliacoes ? ` (${esc(e.google_avaliacoes)})` : ''}` : '—'}</td>
<td>${confTag(e.confianca_brasileira)}</td><td>${statusProspTag(e.status_prospeccao)}${e.data_contato ? `<div class="meta">${esc(fmtDate(e.data_contato))}</div>` : ''}${e.observacao ? `<div class="meta">${esc(e.observacao.slice(0, 120))}</div>` : ''}</td></tr>`).join('')}
</tbody></table></div><p class="meta">Para editar a prospecção, use a visão em cards.</p>`;
}

function barras<T extends { n: number }>(rows: T[], label: (r: T) => string, href: (r: T) => string, max = 12): string {
  const top = Math.max(1, ...rows.map((r) => r.n));
  const shown = rows.slice(0, max);
  return shown.map((r) => `<div class="bar"><a href="${esc(href(r))}" title="${esc(label(r))}">${esc(label(r))}</a><i style="width:${Math.max(2, Math.round((r.n / top) * 100))}%"></i><span>${r.n}</span></div>`).join('') +
    (rows.length > max ? `<p class="meta" style="margin:4px 0 0">+ ${rows.length - max} outros</p>` : '');
}

export function empresasDashboard(d: DashEmpresas, f: FiltrosEmpresaUI): string {
  const t = d.totais;
  const conf = Object.fromEntries(d.porConfianca.map((r) => [r.confianca, r.n]));
  const st = Object.fromEntries(d.porStatus.map((r) => [r.status, r.n]));
  return `<details class="box" open style="margin-bottom:18px"><summary><b>Painel</b> <span class="meta">· totais com os filtros atuais</span></summary>
<div class="stats four" style="margin-top:14px">
<div class="stat">${icon('building')}<b>${t.total}</b><span>Empresas</span></div>
<div class="stat">${icon('phone')}<b>${t.com_telefone}</b><span>Com telefone</span></div>
<div class="stat">${icon('open')}<b>${t.com_instagram}</b><span>Com Instagram</span></div>
<div class="stat">${icon('pin')}<b>${t.cidades}</b><span>Cidades</span></div></div>
<div class="row" style="margin:14px 0 4px"><span class="meta">Confiança:</span>${['alta', 'media', 'baixa', ''].filter((c) => conf[c]).map((c) => `${confTag(c)} <b>${conf[c]}</b>`).join(' &nbsp; ') || '—'}</div>
<div class="row" style="margin:4px 0 14px"><span class="meta">Prospecção:</span>${Object.keys(STATUS_PROSPECCAO).map((s) => `<a href="/empresas${esc(qsEmp({ ...f, status: s, page: 1 }))}">${statusProspTag(s)}</a> <b>${st[s] ?? 0}</b>`).join(' &nbsp; ')}</div>
<div class="fields"><div><h3 style="margin-bottom:8px">Por nicho</h3><div class="bars">${barras(d.porNicho, (r) => r.nicho || '(sem nicho)', (r) => `/empresas${qsEmp({ ...f, nicho: r.nicho, page: 1 })}`)}</div></div>
<div><h3 style="margin-bottom:8px">Por estado</h3><div class="bars">${barras(d.porEstado, (r) => estLabel(r.estado), (r) => `/empresas${qsEmp({ ...f, estado: r.estado, cidade: undefined, page: 1 })}`)}</div></div></div>
<p class="meta" style="margin:12px 0 0">Última coleta: ${esc(fmtDate(t.ultima ?? ''))}</p></details>`;
}

export function empresasPage(o: { f: FiltrosEmpresaUI; page: number; pages: number; total: number; rows: EmpresaView[]; nichos: string[]; estados: string[]; cidades: string[]; dash: DashEmpresas; msg?: string; erro?: string }): string {
  const { f } = o;
  const sel = (vals: string[], cur: string | undefined, label = (x: string) => x) =>
    [...new Set([...vals, ...(cur ? [cur] : [])])].map((v) => opt(v, label(v), cur)).join('');
  const chips = OPORT_CHIPS.map((k) => `<a href="/empresas${esc(qsEmp({ ...f, oport: f.oport === k ? undefined : k, page: 1 }))}" class="${f.oport === k ? 'on' : ''}">${esc(k)}</a>`).join('');
  const filtrado = !!(f.q || f.nicho || f.estado || f.cidade || f.oport || f.conf || f.status);
  const volta = `/empresas${qsEmp({ ...f, page: o.page })}`;
  const tabela = f.view === 'tabela';
  return layout('Empresas', `${pageHead('Empresas', `${plural(o.total, 'empresa', 'empresas')}${filtrado ? ' com esses filtros' : ''} · leads B2B de negócios brasileiros nos EUA${f.conf ? '' : ' · confiança alta + média'}`)}
${o.msg ? `<p class="note">${esc(o.msg)}</p>` : ''}${o.erro ? `<p class="note err">${esc(o.erro)}</p>` : ''}
<form class="filters" method="get" action="/empresas" role="search">
<div class="search">${icon('search')}<input type="search" name="q" placeholder="Busque por nome, telefone, site, cidade, observação…" value="${esc(f.q ?? '')}" aria-label="Buscar"></div>
<div class="sels emp">
<select name="nicho" aria-label="Nicho"><option value="">Todos os nichos</option>${sel(o.nichos, f.nicho)}</select>
<select name="estado" aria-label="Estado" onchange="this.form.cidade.value=''"><option value="">Todos os estados</option>${sel(o.estados, f.estado, estLabel)}</select>
<select name="cidade" aria-label="Cidade"><option value="">Todas as cidades</option>${sel(o.cidades, f.cidade)}</select>
<select name="conf" aria-label="Confiança">${CONF_OPTS.map(([v, l]) => opt(v, `Confiança: ${l}`, f.conf ?? '')).join('')}</select>
<select name="status" aria-label="Status de prospecção"><option value="">Todos os status</option>${Object.entries(STATUS_PROSPECCAO).map(([k, l]) => opt(k, l, f.status)).join('')}</select>
<input name="oport" list="oport-kw" placeholder="Oportunidade contém…" value="${esc(f.oport ?? '')}" aria-label="Oportunidade de marketing">
</div><datalist id="oport-kw">${OPORT_CHIPS.map((k) => `<option value="${esc(k)}">`).join('')}</datalist>
${tabela ? '<input type="hidden" name="view" value="tabela">' : ''}
<div class="row between"><div class="row"><button class="btn" type="submit">${icon('filter')}Filtrar</button>${filtrado ? '<a class="btn sec" href="/empresas">Limpar</a>' : ''}</div>
<div class="row"><span class="seg"><a href="/empresas${esc(qsEmp({ ...f, view: undefined, page: o.page }))}" class="${tabela ? '' : 'on'}">Cards</a><a href="/empresas${esc(qsEmp({ ...f, view: 'tabela', page: o.page }))}" class="${tabela ? 'on' : ''}">Tabela</a></span>
<a class="btn sec sm" href="/empresas/exportar.csv${esc(qsEmp({ ...f, view: undefined, page: 1 }))}">Exportar CSV${filtrado ? ' (filtro atual)' : ''}</a></div></div></form>
<div class="chips" style="margin-bottom:16px"><span class="meta">Oportunidade:</span>${chips}</div>
${empresasDashboard(o.dash, f)}
${o.rows.length ? (tabela ? empresasTabela(o.rows) : `<div class="grid">${o.rows.map((e) => empresaCard(e, volta)).join('')}</div>`)
    : `<p class="note">${o.total || filtrado ? 'Nenhuma empresa com esses filtros.' : 'Nenhuma empresa ainda — importe um CSV de empresas na Administração.'}</p>`}
${pagerHtml(o.page, o.pages, (p) => '/empresas' + qsEmp({ ...f, page: p }))}`, '/empresas');
}
