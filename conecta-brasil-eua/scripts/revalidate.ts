// Revalidação standalone (Node 18+), fora do Worker.
// Lê um CSV no formato oficial, verifica cada convite com GET na página pública
// (https://chat.whatsapp.com/<codigo>) — NUNCA entra em grupos — e grava um NOVO CSV
// com status/ultima_validacao atualizados. O arquivo de entrada nunca é modificado.
//
// Uso: npx tsx scripts/revalidate.ts <entrada.csv> <saida.csv> [--limit 50] [--delay 2000] [--dry]
//   --dry   só mostra o resultado, não grava a saída
// Nota: aqui não há histórico de falhas; um "expirado" único já é aplicado. Revise antes de importar.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateCsv, toCsv } from '../src/csv';
import { checkInvite, sleep } from '../src/linkcheck';

const args: string[] = process.argv.slice(2);
const [input, output] = args.filter((a: string, i: number) => !a.startsWith('--') && !(args[i - 1] ?? '').match(/^--(limit|delay)$/));
const opt = (n: string, d: number) => { const i = args.indexOf(`--${n}`); return i >= 0 ? Number(args[i + 1]) : d; };
const dry = args.includes('--dry');
if (!input || (!dry && !output)) { console.error('Uso: npx tsx scripts/revalidate.ts <entrada.csv> <saida.csv> [--limit N] [--delay ms] [--dry]'); process.exit(2); }
if (output && resolve(output) === resolve(input)) { console.error('A saída deve ser um arquivo diferente da entrada.'); process.exit(2); }
if (output && existsSync(output) && !args.includes('--force')) { console.error(`${output} já existe (use --force para sobrescrever).`); process.exit(2); }

const limit = opt('limit', 50);
const delay = Math.max(1000, opt('delay', 2000));
const r = validateCsv(readFileSync(input, 'utf8'));
if (r.fatal) { console.error(r.fatal); process.exit(1); }
const today = new Date().toISOString().slice(0, 10);
const alvo = [...r.validos].filter((g) => g.status !== 'expirado')
  .sort((a, b) => a.ultima_validacao.localeCompare(b.ultima_validacao)).slice(0, limit);
console.log(`Verificando ${alvo.length} de ${r.validos.length} link(s), ${delay} ms entre requisições…`);
const res: Record<string, number> = {};
for (let i = 0; i < alvo.length; i++) {
  if (i) await sleep(delay);
  const g = alvo[i];
  const c = await checkInvite(g.codigo);
  res[c.result] = (res[c.result] ?? 0) + 1;
  if (c.result !== 'indeterminado') g.status = c.result;
  if (!g.nome_grupo && c.nome) g.nome_grupo = c.nome.slice(0, 200);
  g.ultima_validacao = today;
  console.log(`${String(i + 1).padStart(3)} ${g.codigo} → ${c.result} (${c.motivo})`);
}
console.log('Resumo:', res);
if (!dry) { writeFileSync(output, toCsv(r.validos)); console.log(`Gravado em ${output}`); }
