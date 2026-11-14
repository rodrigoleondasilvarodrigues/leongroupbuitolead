import { CSV_COLUMNS, type Grupo } from './constants';
import { checkInvite, nextStatus, sleep, type FetchLike } from './linkcheck';

export interface Filtros { q?: string; estado?: string; cidade?: string; categoria?: string; nicho?: string; status?: string; todos?: boolean }
export const PAGE_SIZE = 24;
/** Valor do filtro de estado para grupos sem estado ("Nacional / sem estado"). */
export const SEM_ESTADO = '-';

function where(f: Filtros): { sql: string; args: unknown[] } {
  const c: string[] = [];
  const a: unknown[] = [];
  if (f.status) { c.push('status = ?'); a.push(f.status); }
  else if (!f.todos) c.push("status = 'ativo'");
  if (f.estado === SEM_ESTADO) c.push("estado = ''");
  else if (f.estado) { c.push('estado = ?'); a.push(f.estado.toUpperCase()); }
  if (f.cidade) { c.push('cidade = ? COLLATE NOCASE'); a.push(f.cidade); }
  if (f.categoria) { c.push('categoria = ?'); a.push(f.categoria); }
  if (f.nicho) { c.push('nicho = ?'); a.push(f.nicho); }
  if (f.q) {
    c.push("(nome_grupo LIKE ? ESCAPE '\\' OR cidade LIKE ? ESCAPE '\\' OR nicho LIKE ? ESCAPE '\\')");
    const like = `%${f.q.replace(/[\\%_]/g, (m) => '\\' + m)}%`;
    a.push(like, like, like);
  }
  return { sql: c.length ? `WHERE ${c.join(' AND ')}` : '', args: a };
}

export async function listGrupos(db: D1Database, f: Filtros, page = 1, pageSize = PAGE_SIZE) {
  const w = where(f);
  const total = (await db.prepare(`SELECT COUNT(*) AS n FROM grupos ${w.sql}`).bind(...w.args).first<{ n: number }>())?.n ?? 0;
  const { results } = await db.prepare(
    `SELECT * FROM grupos ${w.sql} ORDER BY estado, cidade, nome_grupo LIMIT ? OFFSET ?`,
  ).bind(...w.args, pageSize, (page - 1) * pageSize).all<Grupo>();
  return { total, rows: results, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getGrupo(db: D1Database, codigo: string) {
  return db.prepare('SELECT * FROM grupos WHERE codigo = ?').bind(codigo).first<Grupo>();
}

/** Cidades com grupos ATIVOS (para o select da biblioteca). */
export async function cidades(db: D1Database, estado?: string) {
  const q = estado
    ? db.prepare("SELECT DISTINCT cidade FROM grupos WHERE status = 'ativo' AND estado = ? AND cidade <> '' ORDER BY cidade").bind(estado === SEM_ESTADO ? '' : estado)
    : db.prepare("SELECT DISTINCT cidade FROM grupos WHERE status = 'ativo' AND cidade <> '' ORDER BY cidade");
  return (await q.all<{ cidade: string }>()).results.map((r) => r.cidade);
}

export async function nichosGrupos(db: D1Database) {
  return (await db.prepare("SELECT DISTINCT nicho FROM grupos WHERE nicho <> '' ORDER BY nicho").all<{ nicho: string }>()).results.map((r) => r.nicho);
}

export async function estadosUsados(db: D1Database) {
  return (await db.prepare('SELECT DISTINCT estado FROM grupos ORDER BY estado').all<{ estado: string }>()).results.map((r) => r.estado);
}

export interface EstadoResumo { estado: string; n: number; cidades: { cidade: string; n: number }[] }
/** Grupos ATIVOS por estado, com as cidades de cada um (estado '' = Nacional / sem estado, sempre por último). */
export async function resumoEstados(db: D1Database): Promise<EstadoResumo[]> {
  const { results } = await db.prepare(`SELECT estado, cidade, COUNT(*) AS n FROM grupos WHERE status = 'ativo'
    GROUP BY estado, cidade COLLATE NOCASE ORDER BY estado, cidade COLLATE NOCASE`).all<{ estado: string; cidade: string; n: number }>();
  const map = new Map<string, EstadoResumo>();
  for (const r of results) {
    const e = map.get(r.estado) ?? map.set(r.estado, { estado: r.estado, n: 0, cidades: [] }).get(r.estado)!;
    e.n += r.n;
    if (r.cidade) e.cidades.push({ cidade: r.cidade, n: r.n });
  }
  return [...map.values()].sort((a, b) => (a.estado === '' ? 1 : 0) - (b.estado === '' ? 1 : 0) || a.estado.localeCompare(b.estado));
}

/** Grupos ATIVOS por categoria. */
export async function resumoCategorias(db: D1Database) {
  return (await db.prepare("SELECT categoria, COUNT(*) AS n FROM grupos WHERE status = 'ativo' GROUP BY categoria ORDER BY n DESC, categoria")
    .all<{ categoria: string; n: number }>()).results;
}

export interface DashTotais { total: number; ativos: number; estados: number; categorias: number; cidades: number; ultima: string | null }
export async function dashboard(db: D1Database) {
  const [tot, porStatus, porCat] = await db.batch([
    db.prepare(`SELECT
      (SELECT COUNT(*) FROM grupos) AS total,
      (SELECT COUNT(*) FROM grupos WHERE status='ativo') AS ativos,
      (SELECT COUNT(DISTINCT estado) FROM grupos WHERE status='ativo' AND estado <> '') AS estados,
      (SELECT COUNT(DISTINCT categoria) FROM grupos WHERE status='ativo') AS categorias,
      (SELECT COUNT(DISTINCT estado || '|' || lower(cidade)) FROM grupos WHERE status='ativo' AND cidade <> '') AS cidades,
      (SELECT MAX(ultima_validacao) FROM grupos) AS ultima`),
    db.prepare('SELECT status, COUNT(*) AS n FROM grupos GROUP BY status'),
    db.prepare("SELECT categoria, COUNT(*) AS n FROM grupos WHERE status='ativo' GROUP BY categoria ORDER BY n DESC"),
  ]);
  return {
    totais: tot.results[0] as DashTotais,
    porStatus: porStatus.results as { status: string; n: number }[],
    porCategoria: porCat.results as { categoria: string; n: number }[],
  };
}

const INSERT = `INSERT INTO grupos (${CSV_COLUMNS.join(', ')}) VALUES (${CSV_COLUMNS.map(() => '?').join(', ')})`;
/** Edição manual: sobrescreve tudo. */
const UPSERT_EDIT = `${INSERT}
  ON CONFLICT(codigo) DO UPDATE SET ${CSV_COLUMNS.filter((c) => c !== 'codigo').map((c) => `${c}=excluded.${c}`).join(', ')},
  falhas_seguidas = CASE WHEN excluded.status <> grupos.status THEN 0 ELSE grupos.falhas_seguidas END,
  atualizado_em = datetime('now')`;
/**
 * Importação de CSV (upsert por codigo). Os arquivos do coletor crescem com o tempo, então:
 * - status só é sobrescrito se a ultima_validacao do CSV for >= à do banco (não regride uma revalidação mais nova);
 * - nome_grupo vazio no CSV não apaga um nome já conhecido.
 */
export const UPSERT_IMPORT = `${INSERT}
  ON CONFLICT(codigo) DO UPDATE SET
  link=excluded.link, estado=excluded.estado, cidade=excluded.cidade, categoria=excluded.categoria,
  fonte_url=excluded.fonte_url, data_coleta=excluded.data_coleta,
  nome_grupo = COALESCE(NULLIF(excluded.nome_grupo, ''), grupos.nome_grupo),
  nicho = COALESCE(NULLIF(excluded.nicho, ''), grupos.nicho),
  falhas_seguidas = CASE WHEN excluded.ultima_validacao >= grupos.ultima_validacao AND excluded.status <> grupos.status THEN 0 ELSE grupos.falhas_seguidas END,
  status = CASE WHEN excluded.ultima_validacao >= grupos.ultima_validacao THEN excluded.status ELSE grupos.status END,
  ultima_validacao = MAX(excluded.ultima_validacao, grupos.ultima_validacao),
  atualizado_em = datetime('now')`;

/** Gera SQL literal (para `wrangler d1 execute --file`) com a mesma semântica de upsert da importação. */
export function upsertImportSql(g: Grupo): string {
  // compacta só o template (nunca os valores, que podem ter espaços duplos/quebras de linha)
  const parts = UPSERT_IMPORT.replace(/\s+/g, ' ').split('?');
  const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
  return parts.map((p, i) => (i < CSV_COLUMNS.length ? p + q(g[CSV_COLUMNS[i]] ?? '') : p)).join('') + ';';
}

export async function upsertMany(db: D1Database, rows: Grupo[], mode: 'import' | 'edit' = 'import') {
  const UPSERT = mode === 'edit' ? UPSERT_EDIT : UPSERT_IMPORT;
  const existing = await codigosExistentes(db, rows.map((r) => r.codigo));
  for (let i = 0; i < rows.length; i += 50) {
    await db.batch(rows.slice(i, i + 50).map((r) => db.prepare(UPSERT).bind(...CSV_COLUMNS.map((c) => r[c] ?? ''))));
  }
  const atualizados = rows.filter((r) => existing.has(r.codigo)).length;
  return { inseridos: rows.length - atualizados, atualizados };
}

export async function codigosExistentes(db: D1Database, codigos: string[]) {
  const s = new Set<string>();
  for (let i = 0; i < codigos.length; i += 90) {
    const chunk = codigos.slice(i, i + 90);
    if (!chunk.length) continue;
    const { results } = await db.prepare(`SELECT codigo FROM grupos WHERE codigo IN (${chunk.map(() => '?').join(',')})`)
      .bind(...chunk).all<{ codigo: string }>();
    results.forEach((r) => s.add(r.codigo));
  }
  return s;
}

export async function deleteGrupo(db: D1Database, codigo: string) {
  await db.prepare('DELETE FROM grupos WHERE codigo = ?').bind(codigo).run();
}

export async function setStatus(db: D1Database, codigo: string, status: string) {
  await db.prepare("UPDATE grupos SET status = ?, falhas_seguidas = 0, atualizado_em = datetime('now') WHERE codigo = ?")
    .bind(status, codigo).run();
}

export async function allGrupos(db: D1Database) {
  return (await db.prepare('SELECT * FROM grupos ORDER BY estado, cidade, nome_grupo').all<Grupo>()).results;
}

export const today = () => new Date().toISOString().slice(0, 10);

/**
 * Revalida um lote pequeno: os links verificados há mais tempo (exceto já expirados).
 * Sequencial, com pausa entre requisições.
 */
export async function revalidateBatch(db: D1Database, opts: { batch: number; delayMs: number; fetcher?: FetchLike; codigos?: string[] }) {
  const rows = opts.codigos?.length
    ? (await db.prepare(`SELECT codigo, status, falhas_seguidas, nome_grupo FROM grupos WHERE codigo IN (${opts.codigos.map(() => '?').join(',')})`)
      .bind(...opts.codigos).all<{ codigo: string; status: string; falhas_seguidas: number; nome_grupo: string }>()).results
    : (await db.prepare(`SELECT codigo, status, falhas_seguidas, nome_grupo FROM grupos WHERE status <> 'expirado'
        ORDER BY ultima_validacao ASC, codigo LIMIT ?`).bind(opts.batch).all<{ codigo: string; status: string; falhas_seguidas: number; nome_grupo: string }>()).results;
  const out: { codigo: string; resultado: string; motivo: string; status: string }[] = [];
  for (let i = 0; i < rows.length; i++) {
    if (i > 0) await sleep(opts.delayMs);
    const r = rows[i];
    const c = await checkInvite(r.codigo, opts.fetcher);
    const n = nextStatus(r.status, r.falhas_seguidas, c.result);
    await db.prepare("UPDATE grupos SET status = ?, falhas_seguidas = ?, ultima_validacao = ?, atualizado_em = datetime('now') WHERE codigo = ?")
      .bind(n.status, n.falhas, today(), r.codigo).run();
    if (!r.nome_grupo && c.result === 'ativo' && c.nome) {
      await db.prepare("UPDATE grupos SET nome_grupo = ? WHERE codigo = ? AND nome_grupo = ''").bind(c.nome.slice(0, 200), r.codigo).run();
    }
    out.push({ codigo: r.codigo, resultado: c.result, motivo: c.motivo, status: n.status });
  }
  return out;
}
