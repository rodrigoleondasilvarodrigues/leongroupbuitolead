// Dry-run: valida 1+ CSVs (grupos e/ou empresas — o tipo é detectado pelo cabeçalho) SEM importar nem modificar os arquivos.
// Uso:
//   npx tsx scripts/validate-csv.ts <a.csv> [b.csv ...] [--json]
//   npx tsx scripts/validate-csv.ts --dir <pasta-do-coletor>     # grupos.csv, grupos_outros.csv e leads_*.csv
//                                                               # (ignora *.bak*.csv e staging_*.csv)
import { validateArquivos } from '../src/importar';
import { resolveFiles, relatorio } from './lib';

const { files, faltando, ignorados, rest } = resolveFiles(process.argv.slice(2));
for (const f of faltando) console.warn(`aviso: arquivo não encontrado (seguindo sem ele): ${f}`);
if (ignorados.length) console.warn(`aviso: ignorados (backup/staging): ${ignorados.join(', ')}`);
if (!files.length) { console.error('Uso: npx tsx scripts/validate-csv.ts <a.csv> [b.csv ...] | --dir <pasta> [--json]'); process.exit(2); }
const r = validateArquivos(files);
if (rest.includes('--json')) {
  console.log(JSON.stringify({
    ...r,
    grupos: { ...r.grupos, origem: Object.fromEntries(r.grupos.origem) },
    empresas: { ...r.empresas, nomes: Object.fromEntries([...r.empresas.nomes].map(([k, v]) => [k, [...v]])), origem: Object.fromEntries(r.empresas.origem) },
  }, null, 2));
} else {
console.log(`Arquivos: ${r.tipos.map((t) => `${t.nome} (${t.tipo ?? 'não reconhecido'})`).join(', ')}`);
const { linhas, erros } = relatorio(r);
console.log(linhas.join('\n'));
console.log(`\n${erros ? `${erros} erro(s) — as linhas com erro serão ignoradas na importação.` : 'Nenhum erro.'}`);
// exitCode (e não process.exit) para não truncar a saída quando ela vai para um pipe
process.exitCode = erros ? 1 : 0;
}
