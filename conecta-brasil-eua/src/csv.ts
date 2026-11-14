import {
  CATEGORIAS, CSV_COLUMNS, CSV_COLUMNS_OBRIGATORIAS, EMPRESA_COLUMNS, ESTADOS, INVITE_CODE_RE, STATUS, type Grupo,
} from './constants';

export type TipoCsv = 'grupos' | 'empresas';
/**
 * Detecta o tipo do CSV pelo cabeçalho: grupos têm `codigo` + `link`; empresas têm `empresa` + `telefone_comercial`.
 * Retorna null se não reconhecer (o arquivo é ignorado com aviso).
 */
export function detectTipo(text: string): TipoCsv | null {
  const first = parseCsv(text.slice(0, 4096).split(/\r?\n/)[0] ?? '')[0] ?? [];
  const h = new Set(first.map((x) => x.trim().toLowerCase()));
  if (h.has('codigo') && h.has('link')) return 'grupos';
  if (h.has('empresa') && h.has('telefone_comercial')) return 'empresas';
  // cabeçalho parcial: decide pela maioria das colunas conhecidas
  const g = CSV_COLUMNS.filter((c) => h.has(c)).length;
  const e = EMPRESA_COLUMNS.filter((c) => h.has(c)).length;
  if (Math.max(g, e) >= 5 && g !== e) return g > e ? 'grupos' : 'empresas';
  return null;
}

/** RFC 4180 parser: aspas, vírgulas/quebras dentro de aspas, CRLF, BOM. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = text.charCodeAt(0) === 0xfeff ? 1 : 0;
  for (; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      rows.push(row); row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''));
}

const csvCell = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
export function toCsv(rows: Grupo[]): string {
  const lines = [CSV_COLUMNS.join(',')];
  for (const r of rows) lines.push(CSV_COLUMNS.map((c) => csvCell(r[c] ?? '')).join(','));
  return lines.join('\r\n') + '\r\n';
}

export function isValidDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + 'T00:00:00Z');
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function extractCode(link: string): string | null {
  const m = /^https:\/\/chat\.whatsapp\.com\/(?:invite\/)?([A-Za-z0-9]+)\/?(?:\?.*)?$/.exec(link.trim());
  return m ? m[1] : null;
}

/** Grafias alternativas usadas pelo coletor → slug oficial. */
export const CATEGORIA_ALIASES: Record<string, string> = {
  compra_e_venda: 'compra-e-venda', 'compra e venda': 'compra-e-venda', compraevenda: 'compra-e-venda',
  uber_delivery: 'uber-delivery', delivery: 'uber-delivery', uber: 'uber-delivery',
  'serviços': 'servicos', 'imigração': 'imigracao',
  nacional: 'geral', 'mães': 'mulheres', maes: 'mulheres', universidades: 'universidade',
};

export interface RowError { linha: number; codigo: string; erros: string[] }
export interface ImportResult {
  fatal: string | null;
  validos: Grupo[];
  /** número da linha (no arquivo) de cada item de `validos` */
  linhas: number[];
  erros: RowError[];
  avisos: RowError[];
  totalLinhas: number;
}

/** Valida/normaliza um registro. Retorna lista de erros (vazia = ok) e avisos. */
export function validateGrupo(raw: Partial<Grupo>): { grupo: Grupo; erros: string[]; avisos: string[] } {
  const g = {} as Grupo;
  for (const c of CSV_COLUMNS) g[c] = (raw[c] ?? '').toString().trim();
  g.estado = g.estado.toUpperCase();
  g.categoria = g.categoria.toLowerCase();
  g.status = g.status.toLowerCase();
  g.nicho = g.nicho.toLowerCase().replace(/\s+/g, ' ');
  const erros: string[] = [];
  const avisos: string[] = [];

  if (!g.codigo) erros.push('codigo vazio');
  else if (!INVITE_CODE_RE.test(g.codigo)) erros.push(`codigo inválido "${g.codigo}" (esperado 10–40 letras/números)`);

  const linkCode = extractCode(g.link);
  if (!g.link) erros.push('link vazio');
  else if (!linkCode) erros.push('link não é https://chat.whatsapp.com/<codigo>');
  else if (g.codigo && linkCode !== g.codigo) erros.push(`codigo do link (${linkCode}) difere da coluna codigo`);

  if (!g.nome_grupo) avisos.push('nome_grupo vazio (será exibido um nome provisório; a revalidação tenta preencher)');
  else if (g.nome_grupo.length > 200) erros.push('nome_grupo com mais de 200 caracteres');

  if (!g.estado) avisos.push('estado vazio → "Nacional / sem estado"');
  else if (!ESTADOS[g.estado]) erros.push(`estado desconhecido "${g.estado}"`);

  if (!g.cidade) avisos.push('cidade vazia');

  if (g.categoria in CATEGORIA_ALIASES) {
    avisos.push(`categoria "${g.categoria}" normalizada para "${CATEGORIA_ALIASES[g.categoria]}"`);
    g.categoria = CATEGORIA_ALIASES[g.categoria];
  }
  if (!g.categoria) erros.push('categoria vazia');
  else if (!(g.categoria in CATEGORIAS)) erros.push(`categoria inválida "${g.categoria}"`);

  if (g.fonte_url && !/^https?:\/\/\S+$/i.test(g.fonte_url)) erros.push('fonte_url não é uma URL http(s)');

  if (g.data_coleta && !isValidDate(g.data_coleta)) erros.push(`data_coleta inválida "${g.data_coleta}" (YYYY-MM-DD)`);
  if (!g.data_coleta) avisos.push('data_coleta vazia');

  if (!g.status) { g.status = 'indeterminado'; avisos.push('status vazio → indeterminado'); }
  else if (!(g.status in STATUS)) erros.push(`status inválido "${g.status}"`);

  if (g.ultima_validacao && !isValidDate(g.ultima_validacao)) erros.push(`ultima_validacao inválida "${g.ultima_validacao}" (YYYY-MM-DD)`);

  if (g.nicho.length > 60) erros.push('nicho com mais de 60 caracteres');

  return { grupo: g, erros, avisos };
}

/** Valida um CSV completo (sem tocar no banco). */
export function validateCsv(text: string): ImportResult {
  const res: ImportResult = { fatal: null, validos: [], linhas: [], erros: [], avisos: [], totalLinhas: 0 };
  const rows = parseCsv(text);
  if (!rows.length) { res.fatal = 'Arquivo vazio.'; return res; }
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const missing = CSV_COLUMNS_OBRIGATORIAS.filter((c) => !header.includes(c));
  const extra = header.filter((h) => !(CSV_COLUMNS as readonly string[]).includes(h));
  const dupHeader = header.filter((h, i) => header.indexOf(h) !== i);
  if (missing.length || extra.length || dupHeader.length) {
    res.fatal = [
      missing.length ? `colunas ausentes: ${missing.join(', ')}` : '',
      extra.length ? `colunas extras: ${extra.join(', ')}` : '',
      dupHeader.length ? `colunas duplicadas: ${dupHeader.join(', ')}` : '',
    ].filter(Boolean).join('; ');
    return res;
  }
  const idx = Object.fromEntries(CSV_COLUMNS.map((c) => [c, header.indexOf(c)]));
  const seen = new Map<string, number>();
  for (let r = 1; r < rows.length; r++) {
    const linha = r + 1; // linha 1 = cabeçalho
    const cells = rows[r];
    res.totalLinhas++;
    if (cells.length !== header.length) {
      res.erros.push({ linha, codigo: cells[idx.codigo] ?? '', erros: [`esperava ${header.length} colunas, encontrou ${cells.length}`] });
      continue;
    }
    const raw = Object.fromEntries(CSV_COLUMNS.map((c) => [c, idx[c] >= 0 ? cells[idx[c]] : ''])) as Grupo;
    const { grupo, erros, avisos } = validateGrupo(raw);
    if (grupo.codigo && seen.has(grupo.codigo)) erros.push(`codigo duplicado no arquivo (já na linha ${seen.get(grupo.codigo)})`);
    if (erros.length) { res.erros.push({ linha, codigo: grupo.codigo, erros }); continue; }
    seen.set(grupo.codigo, linha);
    if (avisos.length) res.avisos.push({ linha, codigo: grupo.codigo, erros: avisos });
    res.validos.push(grupo);
    res.linhas.push(linha);
  }
  return res;
}

export interface ArquivoCsv { nome: string; texto: string }
export interface DuplicadoEntreArquivos {
  codigo: string;
  ocorrencias: { arquivo: string; linha: number }[];
  /** campos com valores diferentes entre as ocorrências */
  conflitos: string[];
  escolhido: string;
}
export interface MultiImportResult {
  arquivos: { nome: string; result: ImportResult }[];
  validos: Grupo[];
  origem: Map<string, string>;
  duplicados: DuplicadoEntreArquivos[];
}

/** Ordem de preferência entre duplicatas: validação mais recente, depois coleta mais recente, depois o arquivo posterior. */
const maisRecente = (a: Grupo, b: Grupo) =>
  b.ultima_validacao.localeCompare(a.ultima_validacao) || b.data_coleta.localeCompare(a.data_coleta);

/** Valida vários CSVs e mescla por codigo (sem tocar no banco). */
export function validateMany(files: ArquivoCsv[]): MultiImportResult {
  const arquivos = files.map((f) => ({ nome: f.nome, result: validateCsv(f.texto) }));
  const porCodigo = new Map<string, { g: Grupo; arquivo: string; linha: number }[]>();
  for (const { nome, result } of arquivos) {
    for (let i = 0; i < result.validos.length; i++) {
      const g = result.validos[i];
      const list = porCodigo.get(g.codigo) ?? [];
      list.push({ g, arquivo: nome, linha: result.linhas[i] });
      porCodigo.set(g.codigo, list);
    }
  }
  const validos: Grupo[] = [];
  const origem = new Map<string, string>();
  const duplicados: DuplicadoEntreArquivos[] = [];
  for (const [codigo, list] of porCodigo) {
    // estável: em empate, o último arquivo vence
    const best = list.reduce((acc, cur) => (maisRecente(acc.g, cur.g) >= 0 ? cur : acc));
    validos.push(best.g);
    origem.set(codigo, best.arquivo);
    if (list.length > 1) {
      const conflitos = CSV_COLUMNS.filter((c) => new Set(list.map((x) => x.g[c])).size > 1);
      duplicados.push({ codigo, ocorrencias: list.map((x) => ({ arquivo: x.arquivo, linha: x.linha })), conflitos, escolhido: best.arquivo });
    }
  }
  return { arquivos, validos, origem, duplicados };
}
