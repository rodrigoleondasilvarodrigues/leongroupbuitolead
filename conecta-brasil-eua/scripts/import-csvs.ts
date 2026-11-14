// Importa 1+ CSVs de grupos e/ou empresas (tipo detectado pelo cabeçalho). Os arquivos de entrada nunca são modificados.
//
//   Gerar SQL (para o D1 remoto, depois do deploy):
//     npx tsx scripts/import-csvs.ts --dir <pasta-do-coletor> --sql out/import.sql
//     npx wrangler d1 execute conecta-db --remote --file=out/import.sql
//   Importar direto no D1 LOCAL (.wrangler/):
//     npx tsx scripts/import-csvs.ts --dir <pasta-do-coletor> --local
//
// --dir usa grupos.csv, grupos_outros.csv e grupos_*.csv; para empresas, empresas_final.csv se existir
// (aí ignora leads_*.csv), senão todos os leads_*.csv. Sempre ignora *.bak*.csv e staging_*.csv.
// A tabela `prospeccao` (status editado no site) nunca é apagada nem sobrescrita pelo import.
// Mesma semântica da tela de importação:
//   grupos   → upsert por codigo; não regride status com ultima_validacao mais nova; não apaga nome/nicho conhecido.
//   empresas → chave = telefone (dígitos) ou empresa+cidade+estado; data_coleta mais nova vence; vazio nunca apaga;
//              indicio_brasileiro e fonte_url são unidos.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { validateArquivos } from '../src/importar';
import { upsertImportSql } from '../src/db';
import { empresasSql } from '../src/empresas';
import { resolveFiles, relatorio } from './lib';

const { files, faltando, ignorados, rest } = resolveFiles(process.argv.slice(2));
for (const f of faltando) console.warn(`aviso: arquivo não encontrado (seguindo sem ele): ${f}`);
if (ignorados.length) console.warn(`aviso: ignorados (backup/staging): ${ignorados.join(', ')}`);
const sqlIdx = rest.indexOf('--sql');
const sqlOut = sqlIdx >= 0 ? rest[sqlIdx + 1] : undefined;
const local = rest.includes('--local');
if (rest.includes('--remote')) { console.error('Este script não executa no D1 remoto. Gere o SQL com --sql e rode o wrangler você mesmo (ou scripts/deploy.sh).'); process.exit(2); }
if (!files.length || (!sqlOut && !local)) {
  console.error('Uso: npx tsx scripts/import-csvs.ts (<a.csv> [b.csv ...] | --dir <pasta>) (--sql saida.sql | --local)');
  process.exit(2);
}

const pIdx = rest.indexOf('--persist-to');
const persist = pIdx >= 0 ? ['--persist-to', rest[pIdx + 1]] : [];
const wrangler = (args: string[]) =>
  execFileSync('npx', ['wrangler', 'd1', 'execute', 'conecta-db', '--local', ...persist, ...args, '--json'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 256 * 1024 * 1024 });
function queryLocal<T>(sql: string): T[] {
  return (JSON.parse(wrangler([`--command=${sql}`])) as { results: T[] }[])[0]?.results ?? [];
}

const r = validateArquivos(files);

// No modo --local, compara com o que já está no banco para separar "novo" de "mescla".
let existeGrupo: ((c: string) => boolean) | undefined;
let existeEmpresa: ((k: string) => boolean) | undefined;
if (local) {
  try {
    const cods = new Set(queryLocal<{ codigo: string }>('SELECT codigo FROM grupos').map((x) => x.codigo));
    const emps = queryLocal<{ chave: string; chave_nome: string }>('SELECT chave, chave_nome FROM empresas');
    const ks = new Set(emps.map((x) => x.chave));
    const ns = new Set(emps.map((x) => x.chave_nome));
    existeGrupo = (c) => cods.has(c);
    existeEmpresa = (k) => ks.has(k) || [...(r.empresas.nomes.get(k) ?? [])].some((n) => ns.has(n));
  } catch (e) {
    console.error('Não consegui ler o D1 local. Rode antes: npm run db:migrate:local');
    console.error(String((e as { stderr?: string }).stderr ?? e).slice(0, 500));
    process.exit(1);
  }
}

const { linhas } = relatorio(r, { existeGrupo, existeEmpresa, detalhado: false });
console.log(linhas.join('\n'));
if (!r.grupos.validos.length && !r.empresas.empresas.length) { console.error('\nNada para importar.'); process.exit(1); }

const stmts = [...r.grupos.validos.map(upsertImportSql), ...empresasSql(r.empresas)];
const header = [
  `-- Conecta Brasil-EUA: importação gerada em ${new Date().toISOString()}`,
  `-- Arquivos: ${r.tipos.map((t) => `${t.nome}(${t.tipo ?? 'ignorado'})`).join(', ')}`,
  `-- ${r.grupos.validos.length} grupo(s), ${r.empresas.empresas.length} empresa(s). Idempotente: pode rodar de novo.`,
  `-- Requer as migrations 0001, 0002 e 0003 aplicadas.`,
];
const out = sqlOut ?? '.wrangler/import.sql';
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, header.join('\n') + '\n' + stmts.join('\n') + '\n');
console.log(`\nSQL gravado em ${out} (${stmts.length} statements: ${r.grupos.validos.length} grupos + ${r.empresas.empresas.length} empresas).`);

if (local) {
  const res = JSON.parse(wrangler([`--file=${out}`])) as { success: boolean }[];
  const falhas = res.filter((x) => !x.success).length;
  if (falhas) { console.error(`${falhas} statement(s) falharam no D1 local.`); process.exit(1); }
  const [g] = queryLocal<{ total: number; ativos: number }>("SELECT COUNT(*) AS total, SUM(status='ativo') AS ativos FROM grupos");
  const [e] = queryLocal<{ total: number; alta: number; media: number; baixa: number; sem: number }>(
    "SELECT COUNT(*) AS total, SUM(confianca_brasileira='alta') AS alta, SUM(confianca_brasileira='media') AS media, SUM(confianca_brasileira='baixa') AS baixa, SUM(confianca_brasileira='') AS sem FROM empresas");
  console.log(`Importado no D1 local. Banco agora: grupos ${g.ativos ?? 0} ativos / ${g.total} total; ` +
    `empresas ${e.total} (alta ${e.alta ?? 0}, média ${e.media ?? 0}, baixa ${e.baixa ?? 0}, sem classificação ${e.sem ?? 0}).`);
}
