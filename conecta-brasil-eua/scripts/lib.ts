import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import type { ArquivoCsv } from '../src/csv';
import type { ImportacaoResult } from '../src/importar';
import { contagemPorArquivo } from '../src/empresas';

/** Arquivos esperados na pasta do coletor. Os de grupos sempre; os de leads podem faltar (aviso). */
export const ARQUIVOS_GRUPOS = ['grupos.csv', 'grupos_outros.csv'];
export const ARQUIVOS_LEADS_ESPERADOS = ['leads_empresas.csv', 'leads_frente1.csv', 'leads_frente2.csv', 'leads_claudinho.csv', 'leads_frank.csv'];
/** Lista consolidada de empresas (com confianca_brasileira). Se existir na pasta, os leads_*.csv são ignorados. */
export const ARQUIVO_EMPRESAS_FINAL = 'empresas_final.csv';
/** Backups e arquivos de rascunho dos coletores: nunca importados. */
export const IGNORAR = (nome: string) => /\.bak/i.test(nome) || /^staging_/i.test(nome);

/**
 * Arquivos de uma pasta (sem backups/staging):
 *   grupos   → grupos.csv, grupos_outros.csv e demais grupos_*.csv;
 *   empresas → empresas_final.csv se existir (aí os leads_*.csv são ignorados); senão todos os leads_*.csv.
 */
export function arquivosDaPasta(dir: string): { paths: string[]; faltando: string[]; ignorados: string[] } {
  const nomes = readdirSync(dir).filter((n) => n.toLowerCase().endsWith('.csv'));
  const ignorados = nomes.filter(IGNORAR);
  const ok = nomes.filter((n) => !IGNORAR(n));
  const grupos = [
    ...ARQUIVOS_GRUPOS.filter((n) => ok.includes(n)),
    ...ok.filter((n) => /^grupos_.*\.csv$/i.test(n) && !ARQUIVOS_GRUPOS.includes(n)).sort((a, b) => a.localeCompare(b)),
  ];
  const leads = ok.filter((n) => /^leads_.*\.csv$/i.test(n)).sort((a, b) =>
    (ARQUIVOS_LEADS_ESPERADOS.indexOf(a) + 1 || 99) - (ARQUIVOS_LEADS_ESPERADOS.indexOf(b) + 1 || 99) || a.localeCompare(b));
  const temFinal = ok.includes(ARQUIVO_EMPRESAS_FINAL);
  const empresas = temFinal ? [ARQUIVO_EMPRESAS_FINAL] : leads;
  if (temFinal) ignorados.push(...leads.map((n) => `${n} (usando ${ARQUIVO_EMPRESAS_FINAL})`));
  const esperados = [...ARQUIVOS_GRUPOS, ...(temFinal ? [] : ARQUIVOS_LEADS_ESPERADOS)];
  const faltando = esperados.filter((n) => !ok.includes(n)).map((n) => join(dir, n));
  return { paths: [...grupos, ...empresas].map((n) => join(dir, n)), faltando, ignorados };
}

/** Resolve a lista de arquivos a partir de caminhos (arquivos ou pastas) e/ou `--dir <pasta>`. */
export function resolveFiles(args: string[]): { files: ArquivoCsv[]; faltando: string[]; ignorados: string[]; rest: string[] } {
  const paths: string[] = [];
  const rest: string[] = [];
  const faltando: string[] = [];
  const ignorados: string[] = [];
  const addDir = (dir: string) => {
    const r = arquivosDaPasta(dir);
    paths.push(...r.paths); faltando.push(...r.faltando); ignorados.push(...r.ignorados);
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--dir') addDir(args[++i]);
    else if (a.startsWith('--')) { rest.push(a); if (['--sql', '--db', '--persist-to'].includes(a)) rest.push(args[++i]); }
    else if (existsSync(a) && statSync(a).isDirectory()) addDir(a);
    else if (IGNORAR(basename(a))) ignorados.push(basename(a));
    else if (existsSync(a)) paths.push(a);
    else faltando.push(a);
  }
  // lê cada arquivo uma única vez (somente leitura); nomes curtos para os relatórios
  const uniq = [...new Set(paths)];
  return { files: uniq.map((p) => ({ nome: basename(p), texto: readFileSync(p, 'utf8') })), faltando, ignorados, rest };
}

export const contagem = (vals: string[]) =>
  Object.entries(vals.reduce<Record<string, number>>((a, v) => ((a[v] = (a[v] ?? 0) + 1), a), {}))
    .sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0])).map(([x, n]) => `${x || '(vazio)'}=${n}`).join(', ') || '-';

const tiposAviso = (avisos: { erros: string[] }[]) =>
  contagem(avisos.flatMap((e) => e.erros.map((x) => x.replace(/ \(.*\)$/, '').replace(/"[^"]*"/g, '"…"').replace(/: .*$/, ''))));

/**
 * Relatório completo (texto) de uma validação/importação.
 * `existeGrupo` / `existeEmpresa` dizem o que já está no banco (para "novo" x "mescla"); sem eles, compara com banco vazio.
 */
export function relatorio(r: ImportacaoResult, opts: { existeGrupo?: (c: string) => boolean; existeEmpresa?: (k: string) => boolean; detalhado?: boolean } = {}): { linhas: string[]; erros: number } {
  const L: string[] = [];
  let erros = 0;
  const { grupos: G, empresas: E } = r;
  for (const i of r.ignorados) L.push(`\n=== ${i.nome} === IGNORADO: ${i.motivo}`);

  for (const { nome, result: a } of G.arquivos) {
    L.push(`\n=== ${nome} (grupos) ===`);
    if (a.fatal) { L.push(`ERRO FATAL (arquivo ignorado): ${a.fatal}`); erros++; continue; }
    const ativos = a.validos.filter((g) => g.status === 'ativo').length;
    L.push(`Linhas de dados: ${a.totalLinhas} | válidas: ${a.validos.length} (ativos ${ativos}/${a.validos.length}) | com erro: ${a.erros.length} | com aviso: ${a.avisos.length}`);
    if (!a.totalLinhas) L.push('AVISO: arquivo só com cabeçalho.');
    if (opts.detalhado !== false) {
      L.push(`Por status: ${contagem(a.validos.map((g) => g.status))}`);
      L.push(`Por estado: ${contagem(a.validos.map((g) => g.estado))}`);
      L.push(`Por categoria: ${contagem(a.validos.map((g) => g.categoria))}`);
      if (a.validos.some((g) => g.nicho)) L.push(`Por nicho: ${contagem(a.validos.map((g) => g.nicho))}`);
    }
    for (const e of a.erros) L.push(`  ERRO linha ${e.linha} [${e.codigo}]: ${e.erros.join('; ')}`);
    if (a.avisos.length) L.push(`  Avisos por tipo: ${tiposAviso(a.avisos)}`);
    erros += a.erros.length;
  }
  if (G.arquivos.length) {
    const novos = opts.existeGrupo ? G.validos.filter((g) => !opts.existeGrupo!(g.codigo)).length : G.validos.length;
    const ativos = G.validos.filter((g) => g.status === 'ativo').length;
    L.push(`\n--- Grupos: total mesclado (upsert por codigo) ---`);
    L.push(`Códigos únicos válidos: ${G.validos.length} (ativos ${ativos}/${G.validos.length}) | novos: ${novos} | atualizações: ${G.validos.length - novos}`);
    L.push(`Por status: ${contagem(G.validos.map((g) => g.status))}`);
    L.push(`Códigos repetidos entre arquivos: ${G.duplicados.length}`);
    for (const d of G.duplicados) {
      L.push(`  ${d.codigo}: ${d.ocorrencias.map((o) => `${o.arquivo}:${o.linha}`).join(' + ')} → ${d.conflitos.length ? `diverge em ${d.conflitos.join(', ')}` : 'idênticos'}; usado: ${d.escolhido}`);
    }
  }

  const cont = contagemPorArquivo(E, opts.existeEmpresa);
  for (const { nome, result: a } of E.arquivos) {
    L.push(`\n=== ${nome} (empresas) ===`);
    if (a.fatal) { L.push(`ERRO FATAL (arquivo ignorado): ${a.fatal}`); erros++; continue; }
    if (a.vazio) { L.push('AVISO: arquivo só com cabeçalho (nenhuma linha) — nada a importar, seguindo.'); continue; }
    const c = cont.get(nome)!;
    L.push(`Linhas de dados: ${a.totalLinhas} | válidas: ${a.validos.length} | inseridas: ${c.inseridas} | mescladas: ${c.mescladas} | ignoradas (erro): ${c.ignoradas} | com aviso: ${a.avisos.length}`);
    if (opts.detalhado !== false) {
      L.push(`Por nicho: ${contagem(a.validos.map((e) => e.nicho))}`);
      L.push(`Por estado: ${contagem(a.validos.map((e) => e.estado))}`);
      L.push(`Com telefone: ${a.validos.filter((e) => e.chave.startsWith('tel:')).length} | com Instagram: ${a.validos.filter((e) => e.instagram).length} | com nota Google: ${a.validos.filter((e) => e.google_nota).length}`);
    }
    for (const e of a.erros) L.push(`  ERRO linha ${e.linha} [${e.codigo}]: ${e.erros.join('; ')}`);
    if (a.avisos.length) L.push(`  Avisos por tipo: ${tiposAviso(a.avisos)}`);
    erros += a.erros.length;
  }
  if (E.arquivos.length) {
    const novas = opts.existeEmpresa ? E.empresas.filter((e) => !opts.existeEmpresa!(e.chave)).length : E.empresas.length;
    L.push(`\n--- Empresas: total mesclado (chave = telefone ou empresa+cidade+estado) ---`);
    L.push(`Empresas únicas: ${E.empresas.length} | novas: ${novas} | mescladas com o banco: ${E.empresas.length - novas}`);
    L.push(`Por nicho: ${contagem(E.empresas.map((e) => e.nicho))}`);
    L.push(`Por estado: ${contagem(E.empresas.map((e) => e.estado))}`);
    L.push(`Por confiança: ${contagem(E.empresas.map((e) => e.confianca_brasileira || '(sem)'))}`);
    L.push(`Chaves com 2+ linhas (mescladas): ${E.mesclados.length}`);
    for (const m of E.mesclados) {
      L.push(`  ${m.chave}: ${m.ocorrencias.map((o) => `${o.arquivo}:${o.linha} "${o.empresa}" (${o.cidade})`).join(' + ')}${m.nomesDiferentes ? '  ⚠ nomes/cidades diferentes — confira' : ''}`);
    }
  }
  return { linhas: L, erros };
}
