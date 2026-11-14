// Empresas (leads B2B): validação do CSV, chave de deduplicação, mescla e upsert no D1.
//
// Chave: telefone comercial (só dígitos, sem o "1" inicial dos EUA quando tem 11 dígitos) → 'tel:<dígitos>'.
//        Sem telefone → 'nome:<empresa>|<cidade>|<estado>' (minúsculas, espaços normalizados).
// Mescla (igual em memória e no SQL):
//   - campos simples: a linha com data_coleta mais nova (empate → a que chega depois) vence,
//     mas um valor vazio NUNCA apaga um valor já conhecido;
//   - indicio_brasileiro (itens separados por "; ") e fonte_url (URLs separadas por espaço): união sem repetição;
//   - data_coleta: a maior.
//   - um lead sem telefone casa com o mesmo empresa+cidade+estado que tenha telefone (e vice-versa).
import {
  CONFIANCAS, EMPRESA_COLUMNS, EMPRESA_COLUMNS_OPCIONAIS, ESTADOS, OBSERVACAO_MAX, STATUS_PROSPECCAO,
  type Empresa, type EmpresaColumn, type EmpresaRow, type EmpresaView, type StatusProspeccao,
} from './constants';
import { parseCsv, isValidDate, type ArquivoCsv, type RowError } from './csv';

// ---------- normalização ----------
/** Separa uma célula com vários telefones ("a / b", "a; b", "a, b", "a ou b") em números (só dígitos, ≥ 7). */
export function telefones(s: string): string[] {
  return (s ?? '').split(/\s*(?:[;\/,|]|\bou\b|\bor\b)\s*/i).map((p) => p.replace(/\D/g, '')).filter((d) => d.length >= 7);
}
/** Chave do telefone: só dígitos do PRIMEIRO número, sem o "1" inicial dos EUA quando tem 11 dígitos. */
export function normTelefone(s: string): string {
  let d = telefones(s)[0] ?? (s ?? '').replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1);
  return d;
}
const normTxt = (s: string) => (s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
export const chaveNome = (e: Pick<Empresa, 'empresa' | 'cidade' | 'estado'>) => [e.empresa, e.cidade, e.estado].map(normTxt).join('|');
export function chaveEmpresa(e: Empresa): string {
  const t = normTelefone(e.telefone_comercial);
  return t ? `tel:${t}` : `nome:${chaveNome(e)}`;
}

/** lower() do SQLite só mexe em A–Z; usamos a mesma regra aqui para a mescla em memória e no SQL darem o mesmo resultado. */
const asciiLower = (s: string) => s.replace(/[A-Z]/g, (c) => c.toLowerCase());
export const LISTAS = {
  indicio_brasileiro: { sep: '; ', split: (s: string) => (s ?? '').split(/\s*;\s*/).map((x) => x.trim()).filter(Boolean) },
  fonte_url: { sep: ' ', split: (s: string) => (s ?? '').split(/[\s|]+/).filter(Boolean) },
  arquivo_origem: { sep: ' | ', split: (s: string) => (s ?? '').split(/\s*\|\s*/).map((x) => x.trim()).filter(Boolean) },
} as const;
type Lista = keyof typeof LISTAS;
const isLista = (c: string): c is Lista => c in LISTAS;
function uniao(a: string[], b: string[]): string[] {
  const seen = new Set(a.map(asciiLower));
  const out = [...a];
  for (const x of b) if (!seen.has(asciiLower(x))) { seen.add(asciiLower(x)); out.push(x); }
  return out;
}
const normLista = (c: Lista, s: string) => uniao([], LISTAS[c].split(s)).join(LISTAS[c].sep);

const ESCALARES = EMPRESA_COLUMNS.filter((c) => !isLista(c) && c !== 'data_coleta');

/** Mescla `inc` sobre `old` (mesma chave). Pura; espelha exatamente o SQL de `empresaUpsertSql`. */
export function mergeEmpresa(old: EmpresaRow, inc: EmpresaRow): EmpresaRow {
  const newer = inc.data_coleta >= old.data_coleta;
  const out = { ...old };
  for (const f of ['chave_nome', ...ESCALARES] as (EmpresaColumn | 'chave_nome')[]) {
    out[f] = newer ? inc[f] || old[f] : old[f] || inc[f];
  }
  for (const f of Object.keys(LISTAS) as Lista[]) {
    out[f] = uniao(LISTAS[f].split(old[f]), LISTAS[f].split(inc[f])).join(LISTAS[f].sep);
  }
  out.data_coleta = old.data_coleta > inc.data_coleta ? old.data_coleta : inc.data_coleta;
  return out;
}

// ---------- validação ----------
const URL_RE = /^https?:\/\/\S+$/i;

/** "alta" | "média"/"media" | "baixa" (qualquer caixa) → slug; '' fica ''; outro valor → null. */
export function normConfianca(s: string): string | null {
  const v = (s ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (!v) return '';
  return v in CONFIANCAS ? v : null;
}

export function validateEmpresa(raw: Partial<Empresa>): { empresa: EmpresaRow; erros: string[]; avisos: string[] } {
  const e = {} as Empresa;
  for (const c of EMPRESA_COLUMNS) e[c] = (raw[c] ?? '').toString().trim();
  const erros: string[] = [];
  const avisos: string[] = [];
  e.estado = e.estado.toUpperCase();
  e.nicho = normTxt(e.nicho);
  e.empresa = e.empresa.replace(/\s+/g, ' ');
  e.cidade = e.cidade.replace(/\s+/g, ' ');

  if (!e.empresa) erros.push('empresa vazia');
  else if (e.empresa.length > 200) erros.push('empresa com mais de 200 caracteres');
  if (!e.estado) erros.push('estado vazio');
  else if (!ESTADOS[e.estado]) erros.push(`estado desconhecido "${e.estado}"`);
  if (!e.cidade) avisos.push('cidade vazia');
  else if (e.cidade.length > 40 || /[0-9!?:;]/.test(e.cidade) || (e.cidade.match(/\./g) ?? []).length > 1) avisos.push(`cidade suspeita (parece outro campo): "${e.cidade.slice(0, 60)}"`);
  if (!e.nicho) avisos.push('nicho vazio');

  if (e.telefone_comercial) {
    const d = normTelefone(e.telefone_comercial);
    if (!d) avisos.push(`telefone sem dígitos "${e.telefone_comercial}" (deduplicado pelo nome)`);
    else {
      if (telefones(e.telefone_comercial).length > 1) avisos.push(`vários telefones na célula; a chave usa o primeiro: "${e.telefone_comercial}"`);
      if (/^\+?55\D/.test(e.telefone_comercial)) avisos.push(`telefone do Brasil (+55): "${e.telefone_comercial}"`);
      else if (d.length !== 10) avisos.push(`telefone fora do padrão dos EUA (10 dígitos): "${e.telefone_comercial}"`);
    }
  }

  for (const c of ['site', 'instagram', 'facebook'] as const) {
    const v = e[c];
    if (!v || URL_RE.test(v)) continue;
    if (c === 'instagram' && /^@?[A-Za-z0-9._]{1,30}$/.test(v)) {
      e.instagram = `https://www.instagram.com/${v.replace(/^@/, '')}`;
      avisos.push(`instagram "${v}" convertido para URL`);
    } else if (/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(v)) {
      e[c] = `https://${v}`;
      avisos.push(`${c} sem http(s) → "https://${v}"`);
    } else avisos.push(`${c} não parece uma URL: "${v}"`);
  }

  if (e.google_nota) {
    const n = Number(e.google_nota.replace(',', '.'));
    if (Number.isFinite(n) && n >= 0 && n <= 5) e.google_nota = String(n);
    else { avisos.push(`google_nota inválida "${e.google_nota}" (0–5) — ignorada`); e.google_nota = ''; }
  }
  if (e.google_avaliacoes) {
    const s = e.google_avaliacoes.replace(/[\s.,]/g, '');
    if (/^\d+$/.test(s)) e.google_avaliacoes = String(Number(s));
    else { avisos.push(`google_avaliacoes inválido "${e.google_avaliacoes}" — ignorado`); e.google_avaliacoes = ''; }
  }

  e.indicio_brasileiro = normLista('indicio_brasileiro', e.indicio_brasileiro);
  e.arquivo_origem = normLista('arquivo_origem', e.arquivo_origem);
  const conf = normConfianca(e.confianca_brasileira);
  if (conf === null) { avisos.push(`confianca_brasileira inválida "${e.confianca_brasileira}" (alta|media|baixa) — tratada como vazia`); e.confianca_brasileira = ''; }
  else e.confianca_brasileira = conf;
  const urls = LISTAS.fonte_url.split(e.fonte_url);
  const ruins = urls.filter((u) => !URL_RE.test(u));
  if (ruins.length) avisos.push(`fonte_url ignorada (não é http/https): ${ruins.map((u) => `"${u}"`).join(', ')}`);
  e.fonte_url = uniao([], urls.filter((u) => URL_RE.test(u))).join(' ');

  if (e.data_coleta && !isValidDate(e.data_coleta)) {
    avisos.push(`data_coleta inválida "${e.data_coleta}" (YYYY-MM-DD) — tratada como vazia`);
    e.data_coleta = '';
  } else if (!e.data_coleta) avisos.push('data_coleta vazia');

  return { empresa: { ...e, chave: chaveEmpresa(e), chave_nome: chaveNome(e) }, erros, avisos };
}

export interface EmpresasCsvResult {
  fatal: string | null;
  /** arquivo só com o cabeçalho (sem linhas de dados) */
  vazio: boolean;
  validos: EmpresaRow[];
  linhas: number[];
  erros: RowError[];
  avisos: RowError[];
  totalLinhas: number;
}

const PROSPECCAO_COLS: readonly string[] = ['status_prospeccao', 'data_contato', 'observacao'];

export function validateEmpresasCsv(text: string): EmpresasCsvResult {
  const res: EmpresasCsvResult = { fatal: null, vazio: false, validos: [], linhas: [], erros: [], avisos: [], totalLinhas: 0 };
  const rows = parseCsv(text);
  if (!rows.length) { res.fatal = 'Arquivo vazio.'; return res; }
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const cols = EMPRESA_COLUMNS as readonly string[];
  const missing = cols.filter((c) => !header.includes(c) && !EMPRESA_COLUMNS_OPCIONAIS.includes(c));
  // colunas de prospecção (vindas da exportação) são aceitas e IGNORADAS: o import nunca grava prospecção
  const extra = header.filter((h) => !cols.includes(h) && !PROSPECCAO_COLS.includes(h));
  const dup = header.filter((h, i) => header.indexOf(h) !== i);
  if (missing.length || extra.length || dup.length) {
    res.fatal = [
      missing.length ? `colunas ausentes: ${missing.join(', ')}` : '',
      extra.length ? `colunas extras: ${extra.join(', ')}` : '',
      dup.length ? `colunas duplicadas: ${dup.join(', ')}` : '',
    ].filter(Boolean).join('; ');
    return res;
  }
  const idx = Object.fromEntries(EMPRESA_COLUMNS.map((c) => [c, header.indexOf(c)]));
  for (let r = 1; r < rows.length; r++) {
    const linha = r + 1;
    const cells = rows[r];
    res.totalLinhas++;
    const nome = cells[idx.empresa] ?? '';
    if (cells.length !== header.length) {
      res.erros.push({ linha, codigo: nome, erros: [`esperava ${header.length} colunas, encontrou ${cells.length}`] });
      continue;
    }
    const { empresa, erros, avisos } = validateEmpresa(Object.fromEntries(EMPRESA_COLUMNS.map((c) => [c, idx[c] >= 0 ? cells[idx[c]] : ''])) as Empresa);
    if (erros.length) { res.erros.push({ linha, codigo: nome, erros }); continue; }
    if (avisos.length) res.avisos.push({ linha, codigo: empresa.empresa, erros: avisos });
    res.validos.push(empresa);
    res.linhas.push(linha);
  }
  res.vazio = res.totalLinhas === 0;
  return res;
}

export interface Ocorrencia { arquivo: string; linha: number; empresa: string; cidade: string }
export interface EmpresaMesclada { chave: string; ocorrencias: Ocorrencia[]; nomesDiferentes: boolean }
export interface EmpresasMultiResult {
  arquivos: { nome: string; result: EmpresasCsvResult }[];
  /** um registro por chave, já mesclado */
  empresas: EmpresaRow[];
  /** todas as chave_nome vistas em cada chave (para casar com registros antigos sem telefone no banco) */
  nomes: Map<string, Set<string>>;
  /** linhas de origem de cada chave */
  origem: Map<string, Ocorrencia[]>;
  /** chaves com 2+ linhas (no mesmo arquivo ou entre arquivos) */
  mesclados: EmpresaMesclada[];
}

/** Valida vários CSVs de empresas e mescla por chave (sem tocar no banco). */
export function validateManyEmpresas(files: ArquivoCsv[]): EmpresasMultiResult {
  const arquivos = files.map((f) => ({ nome: f.nome, result: validateEmpresasCsv(f.texto) }));
  const todas = arquivos.flatMap(({ nome, result }) => result.validos.map((e, i) => ({ e, arquivo: nome, linha: result.linhas[i] })));
  // lead sem telefone → mesmo empresa+cidade+estado com telefone, se houver
  const telPorNome = new Map<string, string>();
  for (const { e } of todas) if (e.chave.startsWith('tel:') && !telPorNome.has(e.chave_nome)) telPorNome.set(e.chave_nome, e.chave);
  const porChave = new Map<string, EmpresaRow>();
  const nomes = new Map<string, Set<string>>();
  const origem = new Map<string, Ocorrencia[]>();
  for (const { e, arquivo, linha } of todas) {
    const chave = e.chave.startsWith('tel:') ? e.chave : telPorNome.get(e.chave_nome) ?? e.chave;
    const row = { ...e, chave };
    const prev = porChave.get(chave);
    porChave.set(chave, prev ? mergeEmpresa(prev, row) : row);
    (nomes.get(chave) ?? nomes.set(chave, new Set()).get(chave)!).add(e.chave_nome);
    (origem.get(chave) ?? origem.set(chave, []).get(chave)!).push({ arquivo, linha, empresa: e.empresa, cidade: e.cidade });
  }
  const mesclados: EmpresaMesclada[] = [];
  for (const [chave, oc] of origem) {
    if (oc.length > 1) mesclados.push({ chave, ocorrencias: oc, nomesDiferentes: (nomes.get(chave)?.size ?? 0) > 1 });
  }
  return { arquivos, empresas: [...porChave.values()], nomes, origem, mesclados };
}

/**
 * Contagem por arquivo: inseridas (1ª linha de uma chave que não existe no banco), mescladas (linha que caiu numa
 * chave já vista no lote ou já existente no banco) e ignoradas (linhas com erro).
 */
export function contagemPorArquivo(r: EmpresasMultiResult, existe: (chave: string) => boolean = () => false) {
  const out = new Map(r.arquivos.map((a) => [a.nome, { linhas: a.result.totalLinhas, inseridas: 0, mescladas: 0, ignoradas: a.result.erros.length }]));
  for (const [chave, oc] of r.origem) {
    oc.forEach((o, i) => {
      const c = out.get(o.arquivo)!;
      if (i === 0 && !existe(chave)) c.inseridas++; else c.mescladas++;
    });
  }
  return out;
}

// ---------- SQL (mesmo texto para o Worker e para `wrangler d1 execute --file`) ----------
const lit = (s: string) => `'${(s ?? '').replace(/'/g, "''")}'`;
const COLS = ['chave', 'chave_nome', ...EMPRESA_COLUMNS] as const;

function uniaoSql(f: Lista, valor: string): string {
  const { sep, split } = LISTAS[f];
  const itens = split(valor);
  if (!itens.length) return `empresas.${f}`;
  const frame = (x: string) => `lower(${lit(sep)} || ${x} || ${lit(sep)})`;
  const adds = itens.map((it) => `CASE WHEN instr(${frame(`empresas.${f}`)}, ${frame(lit(it))}) = 0 THEN ${lit(sep + it)} ELSE '' END`);
  return `LTRIM(empresas.${f} || ${adds.join(' || ')}, ${lit(sep)})`;
}

/**
 * Statements SQL (literais, com aspas escapadas) para gravar uma empresa já mesclada.
 * Não usa parâmetros: evita o limite de 100 bind params do D1 e serve igual para o arquivo .sql.
 */
export function empresaUpsertSql(e: EmpresaRow, nomes: Iterable<string> = []): string[] {
  const out: string[] = [];
  let keyExpr = lit(e.chave);
  if (e.chave.startsWith('tel:')) {
    // um registro antigo sem telefone (chave 'nome:…') passa a usar a chave do telefone
    for (const n of new Set([e.chave_nome, ...nomes])) {
      // a prospecção acompanha a empresa quando a chave muda (antes do UPDATE de empresas, que cria a chave 'tel:')
      out.push(`UPDATE prospeccao SET empresa_chave = ${lit(e.chave)} WHERE empresa_chave = ${lit('nome:' + n)} AND NOT EXISTS (SELECT 1 FROM prospeccao WHERE empresa_chave = ${lit(e.chave)}) AND NOT EXISTS (SELECT 1 FROM empresas WHERE chave = ${lit(e.chave)});`);
      out.push(`UPDATE empresas SET chave = ${lit(e.chave)}, atualizado_em = datetime('now') WHERE chave = ${lit('nome:' + n)} AND NOT EXISTS (SELECT 1 FROM empresas WHERE chave = ${lit(e.chave)});`);
    }
  } else {
    // sem telefone: se já existe a mesma empresa+cidade+estado com telefone, mescla nela
    keyExpr = `COALESCE((SELECT chave FROM empresas WHERE chave_nome = ${lit(e.chave_nome)} AND chave LIKE 'tel:%' ORDER BY chave LIMIT 1), ${lit(e.chave)})`;
  }
  const newer = 'excluded.data_coleta >= empresas.data_coleta';
  const sets = [
    ...['chave_nome', ...ESCALARES].map((f) => `${f} = CASE WHEN ${newer} THEN COALESCE(NULLIF(excluded.${f}, ''), empresas.${f}) ELSE COALESCE(NULLIF(empresas.${f}, ''), excluded.${f}) END`),
    ...(Object.keys(LISTAS) as Lista[]).map((f) => `${f} = ${uniaoSql(f, e[f])}`),
    'data_coleta = MAX(excluded.data_coleta, empresas.data_coleta)',
    "atualizado_em = datetime('now')",
  ];
  const vals = COLS.map((c) => (c === 'chave' ? keyExpr : lit(e[c])));
  out.push(`INSERT INTO empresas (${COLS.join(', ')}) VALUES (${vals.join(', ')}) ON CONFLICT(chave) DO UPDATE SET ${sets.join(', ')};`);
  return out;
}

export function empresasSql(r: Pick<EmpresasMultiResult, 'empresas' | 'nomes'>): string[] {
  return r.empresas.flatMap((e) => empresaUpsertSql(e, r.nomes.get(e.chave) ?? []));
}

// ---------- consultas (D1) ----------
/**
 * conf: '' (padrão) = alta + média (+ não classificadas, de CSVs antigos sem a coluna); 'alta' | 'media' | 'baixa'; 'todas'.
 * status: status de prospecção (sem linha em `prospeccao` = nao_contatado).
 */
export interface FiltrosEmpresa { q?: string; nicho?: string; estado?: string; cidade?: string; oport?: string; conf?: string; status?: string }
export const CONF_FILTROS = ['alta', 'media', 'baixa', 'todas'] as const;
export const EMP_PAGE_SIZE = 30;
const likeEsc = (s: string) => `%${s.replace(/[\\%_]/g, (m) => '\\' + m)}%`;
const BUSCA = `(empresa || ' ' || nicho || ' ' || cidade || ' ' || estado || ' ' || telefone_comercial || ' ' || chave || ' ' || site || ' ' ||
  instagram || ' ' || facebook || ' ' || indicio_brasileiro || ' ' || oportunidade_marketing || ' ' || fonte_url || ' ' || COALESCE(observacao, ''))`;
export const FROM = 'FROM empresas LEFT JOIN prospeccao ON prospeccao.empresa_chave = empresas.chave';
const SELECT = `SELECT empresas.*, COALESCE(status_prospeccao, 'nao_contatado') AS status_prospeccao,
  COALESCE(data_contato, '') AS data_contato, COALESCE(observacao, '') AS observacao ${FROM}`;

export function whereEmpresas(f: FiltrosEmpresa): { sql: string; args: unknown[] } {
  const c: string[] = [];
  const a: unknown[] = [];
  if (f.nicho) { c.push('nicho = ?'); a.push(f.nicho); }
  if (f.estado) { c.push('estado = ?'); a.push(f.estado.toUpperCase()); }
  if (f.cidade) { c.push('cidade = ? COLLATE NOCASE'); a.push(f.cidade); }
  if (f.oport) { c.push("oportunidade_marketing LIKE ? ESCAPE '\\'"); a.push(likeEsc(f.oport)); }
  if (f.conf === 'alta' || f.conf === 'media' || f.conf === 'baixa') { c.push('confianca_brasileira = ?'); a.push(f.conf); }
  else if (f.conf !== 'todas') c.push("confianca_brasileira <> 'baixa'");
  if (f.status && f.status in STATUS_PROSPECCAO) { c.push("COALESCE(status_prospeccao, 'nao_contatado') = ?"); a.push(f.status); }
  if (f.q) {
    // cada palavra precisa aparecer em algum campo (telefone também casa só pelos dígitos)
    for (const w of f.q.split(/\s+/).filter(Boolean).slice(0, 8)) {
      const dig = w.replace(/[\s()+.-]/g, '');
      c.push(/^\d{3,}$/.test(dig) ? `(${BUSCA} LIKE ? ESCAPE '\\' OR chave LIKE ?)` : `${BUSCA} LIKE ? ESCAPE '\\'`);
      a.push(likeEsc(w));
      if (/^\d{3,}$/.test(dig)) a.push(`%${dig}%`);
    }
  }
  return { sql: c.length ? `WHERE ${c.join(' AND ')}` : '', args: a };
}

export async function listEmpresas(db: D1Database, f: FiltrosEmpresa, page = 1, pageSize = EMP_PAGE_SIZE) {
  const w = whereEmpresas(f);
  const total = (await db.prepare(`SELECT COUNT(*) AS n ${FROM} ${w.sql}`).bind(...w.args).first<{ n: number }>())?.n ?? 0;
  const { results } = await db.prepare(`${SELECT} ${w.sql} ORDER BY estado, cidade, empresa LIMIT ? OFFSET ?`)
    .bind(...w.args, pageSize, (page - 1) * pageSize).all<EmpresaView>();
  return { total, rows: results, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function exportEmpresas(db: D1Database, f: FiltrosEmpresa) {
  const w = whereEmpresas(f);
  return (await db.prepare(`${SELECT} ${w.sql} ORDER BY estado, cidade, empresa`).bind(...w.args).all<EmpresaView>()).results;
}

export async function opcoesEmpresas(db: D1Database, estado?: string) {
  const [n, e, c] = await db.batch([
    db.prepare("SELECT DISTINCT nicho FROM empresas WHERE nicho <> '' ORDER BY nicho"),
    db.prepare("SELECT DISTINCT estado FROM empresas WHERE estado <> '' ORDER BY estado"),
    estado
      ? db.prepare("SELECT DISTINCT cidade FROM empresas WHERE estado = ? AND cidade <> '' ORDER BY cidade").bind(estado)
      : db.prepare("SELECT DISTINCT cidade FROM empresas WHERE cidade <> '' ORDER BY cidade"),
  ]);
  return {
    nichos: (n.results as { nicho: string }[]).map((r) => r.nicho),
    estados: (e.results as { estado: string }[]).map((r) => r.estado),
    cidades: (c.results as { cidade: string }[]).map((r) => r.cidade),
  };
}

export interface DashEmpresas {
  totais: { total: number; com_telefone: number; com_instagram: number; com_site: number; cidades: number; ultima: string | null };
  porNicho: { nicho: string; n: number }[];
  porEstado: { estado: string; n: number }[];
  porConfianca: { confianca: string; n: number }[];
  porStatus: { status: string; n: number }[];
}
/** Totais do painel de empresas, respeitando os filtros (inclusive o de confiança). */
export async function dashboardEmpresas(db: D1Database, f: FiltrosEmpresa = {}): Promise<DashEmpresas> {
  const w = whereEmpresas(f);
  const [t, n, e, cf, st] = await db.batch([
    db.prepare(`SELECT COUNT(*) AS total,
      SUM(telefone_comercial <> '') AS com_telefone, SUM(instagram <> '') AS com_instagram, SUM(site <> '') AS com_site,
      COUNT(DISTINCT CASE WHEN cidade <> '' THEN estado || '|' || lower(cidade) END) AS cidades, MAX(data_coleta) AS ultima ${FROM} ${w.sql}`).bind(...w.args),
    db.prepare(`SELECT nicho, COUNT(*) AS n ${FROM} ${w.sql} GROUP BY nicho ORDER BY n DESC, nicho`).bind(...w.args),
    db.prepare(`SELECT estado, COUNT(*) AS n ${FROM} ${w.sql} GROUP BY estado ORDER BY n DESC, estado`).bind(...w.args),
    db.prepare(`SELECT confianca_brasileira AS confianca, COUNT(*) AS n ${FROM} ${w.sql} GROUP BY confianca_brasileira ORDER BY n DESC`).bind(...w.args),
    db.prepare(`SELECT COALESCE(status_prospeccao, 'nao_contatado') AS status, COUNT(*) AS n ${FROM} ${w.sql} GROUP BY 1 ORDER BY n DESC`).bind(...w.args),
  ]);
  const tot = t.results[0] as DashEmpresas['totais'];
  for (const k of ['com_telefone', 'com_instagram', 'com_site'] as const) tot[k] = tot[k] ?? 0;
  return {
    totais: tot, porNicho: n.results as DashEmpresas['porNicho'], porEstado: e.results as DashEmpresas['porEstado'],
    porConfianca: cf.results as DashEmpresas['porConfianca'], porStatus: st.results as DashEmpresas['porStatus'],
  };
}

// ---------- prospecção (editável no site; nunca tocada pelo importador) ----------
export interface Prospeccao { status_prospeccao: StatusProspeccao; data_contato: string; observacao: string }

/** Valida o formulário de prospecção (servidor). */
export function validateProspeccao(raw: Record<string, unknown>): { p: Prospeccao; chave: string; erros: string[] } {
  const s = (k: string) => (typeof raw[k] === 'string' ? (raw[k] as string) : '').trim();
  const erros: string[] = [];
  const chave = s('chave');
  if (!chave) erros.push('empresa não informada');
  else if (chave.length > 400 || !/^(tel|nome):/.test(chave)) erros.push('chave de empresa inválida');
  const status = s('status_prospeccao') || 'nao_contatado';
  if (!(status in STATUS_PROSPECCAO)) erros.push(`status inválido "${status.slice(0, 40)}"`);
  const data = s('data_contato');
  if (data && !isValidDate(data)) erros.push('data de contato inválida (use AAAA-MM-DD)');
  const obs = s('observacao').replace(/\r\n?/g, '\n');
  if (obs.length > OBSERVACAO_MAX) erros.push(`observação com mais de ${OBSERVACAO_MAX} caracteres`);
  return { p: { status_prospeccao: status as StatusProspeccao, data_contato: data, observacao: obs }, chave, erros };
}

/** Volta para a lista de empresas (só caminhos internos /empresas…, nunca outro host). */
export function voltaSegura(s: unknown): string {
  const x = typeof s === 'string' ? s : '';
  return x.length <= 1500 && /^\/empresas(?:[?#][^\s\\]*)?$/.test(x) && !x.startsWith('//') ? x : '/empresas';
}
export async function getEmpresa(db: D1Database, chave: string) {
  return db.prepare(`${SELECT} WHERE empresas.chave = ?`).bind(chave).first<EmpresaView>();
}

export async function salvarProspeccao(db: D1Database, chave: string, p: Prospeccao) {
  await db.prepare(`INSERT INTO prospeccao (empresa_chave, status_prospeccao, data_contato, observacao) VALUES (?, ?, ?, ?)
    ON CONFLICT(empresa_chave) DO UPDATE SET status_prospeccao = excluded.status_prospeccao, data_contato = excluded.data_contato,
    observacao = excluded.observacao, prosp_atualizado_em = datetime('now')`)
    .bind(chave, p.status_prospeccao, p.data_contato, p.observacao).run();
}

/**
 * Chaves (ou chave_nome) que já existem no banco — para dizer "nova" x "mescla" na prévia.
 * Uma única consulta (as chaves são pequenas; milhares de linhas cabem fácil) para economizar queries por invocação.
 */
export async function empresasExistentes(db: D1Database, r: Pick<EmpresasMultiResult, 'empresas' | 'nomes'>): Promise<Set<string>> {
  const found = new Set<string>();
  if (!r.empresas.length) return found;
  const { results } = await db.prepare('SELECT chave, chave_nome FROM empresas').all<{ chave: string; chave_nome: string }>();
  const ks = new Set(results.map((x) => x.chave));
  const ns = new Set(results.map((x) => x.chave_nome));
  for (const e of r.empresas) {
    if (ks.has(e.chave) || [...(r.nomes.get(e.chave) ?? [e.chave_nome])].some((n) => ns.has(n))) found.add(e.chave);
  }
  return found;
}

export async function upsertEmpresas(db: D1Database, r: Pick<EmpresasMultiResult, 'empresas' | 'nomes'>) {
  const existentes = await empresasExistentes(db, r);
  const stmts = empresasSql(r).map((s) => db.prepare(s));
  // lotes grandes = menos chamadas ao D1 por requisição (para a carga inicial completa, prefira `npm run import:sql`)
  for (let i = 0; i < stmts.length; i += 100) await db.batch(stmts.slice(i, i + 100));
  return { inseridas: r.empresas.length - existentes.size, mescladas: existentes.size };
}

export async function deleteEmpresa(db: D1Database, chave: string) {
  await db.prepare('DELETE FROM empresas WHERE chave = ?').bind(chave).run();
}

const csvCell = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
export const EXPORT_COLUMNS = [...EMPRESA_COLUMNS, 'status_prospeccao', 'data_contato', 'observacao'] as const;
export function empresasToCsv(rows: (Empresa & Partial<Record<'status_prospeccao' | 'data_contato' | 'observacao', string>>)[]): string {
  const lines = [EXPORT_COLUMNS.join(',')];
  for (const r of rows) {
    lines.push(EXPORT_COLUMNS.map((c) => csvCell(String(r[c] ?? (c === 'status_prospeccao' ? 'nao_contatado' : '')))).join(','));
  }
  return lines.join('\r\n') + '\r\n';
}
