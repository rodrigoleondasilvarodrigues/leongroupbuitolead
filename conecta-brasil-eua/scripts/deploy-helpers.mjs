// Auxiliares do scripts/deploy.sh (Node puro, sem dependências). Testáveis sem tocar na Cloudflare.
//   node scripts/deploy-helpers.mjs db-id <nome>              # lê o JSON de `wrangler d1 list --json` no stdin → imprime o uuid (ou nada)
//   node scripts/deploy-helpers.mjs set-db-id <uuid> [toml]   # grava database_id no wrangler.toml
//   node scripts/deploy-helpers.mjs set-access <aud> <team> [toml]  # grava ACCESS_AUD / ACCESS_TEAM_DOMAIN em [vars]
//   node scripts/deploy-helpers.mjs whoami-accounts           # le a saida de `wrangler whoami` no stdin, imprime "<id> <nome>" por linha
//   node scripts/deploy-helpers.mjs split-sql <arq.sql> <pasta> [maxBytes] [maxStmts]  # divide em lotes; imprime os caminhos
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const [cmd, ...a] = process.argv.slice(2);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const tomlEsc = (v) => v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

export function setDbId(t, id) {
  if (!UUID.test(id)) throw new Error(`database_id inválido: "${id}"`);
  if (!/^database_id = ".*"$/m.test(t)) throw new Error('linha database_id não encontrada no wrangler.toml');
  return t.replace(/^database_id = ".*"$/m, `database_id = "${id}"`);
}

export function setVar(t, k, v) {
  const re = new RegExp(`^#?\\s*${k} = ".*"$`, 'm');
  const line = `${k} = "${tomlEsc(v)}"`;
  if (re.test(t)) return t.replace(re, line);
  if (!/^\[vars\]$/m.test(t)) return `${t.trimEnd()}\n\n[vars]\n${line}\n`;
  return t.replace(/^\[vars\]$/m, `[vars]\n${line}`);
}

/**
 * Contas da saida de `wrangler whoami` (tabela "Account Name | Account ID"), na ordem em que aparecem.
 * Funciona tanto com login OAuth quanto com API token.
 */
export function whoamiAccounts(saida) {
  const out = [];
  for (const linha of String(saida).split('\n')) {
    if (!/[│|]/.test(linha)) continue;
    const cols = linha.split(/[│|]/).map((c) => c.replace(/\x1b\[[0-9;]*m/g, '').trim()).filter((c) => c !== '');
    if (cols.length < 2) continue;
    const id = cols[cols.length - 1];
    const nome = cols.slice(0, -1).join(' ');
    if (/^[0-9a-f]{32}$/i.test(id) && nome) out.push({ nome, id });
  }
  return out;
}

/** Statements de um arquivo .sql, respeitando strings ('' escapado) e descartando comentarios soltos. */
export function splitSql(sql) {
  const out = [];
  let ini = 0;
  let aspas = false;
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i];
    if (aspas) {
      if (c === "'") { if (sql[i + 1] === "'") i++; else aspas = false; }
      continue;
    }
    if (c === "'") { aspas = true; continue; }
    if (c === '-' && sql[i + 1] === '-') {
      const nl = sql.indexOf('\n', i);
      const fim = nl < 0 ? sql.length : nl + 1;
      if (!sql.slice(ini, i).trim()) ini = fim;   // comentario antes do proximo statement: descarta
      i = fim - 1;
      continue;
    }
    if (c === ';') {
      const s = sql.slice(ini, i + 1).trim();
      if (s) out.push(s);
      ini = i + 1;
    }
  }
  const resto = sql.slice(ini).trim();
  if (resto) out.push(resto);
  return out;
}

/** Agrupa statements em lotes de no maximo `maxBytes` e `maxStmts` (um statement nunca e cortado no meio). */
export function lotesSql(stmts, maxBytes = 2000000, maxStmts = 1000) {
  const lotes = [];
  let atual = [];
  let bytes = 0;
  for (const s of stmts) {
    const n = Buffer.byteLength(s, 'utf8') + 1;
    if (atual.length && (atual.length >= maxStmts || bytes + n > maxBytes)) { lotes.push(atual); atual = []; bytes = 0; }
    atual.push(s);
    bytes += n;
  }
  if (atual.length) lotes.push(atual);
  return lotes;
}

function edit(file, fn) {
  const t = readFileSync(file, 'utf8');
  const n = fn(t);
  if (n !== t) { writeFileSync(file, n); console.log(`${file} atualizado.`); } else console.log(`${file} já estava assim.`);
}

// rodando como CLI? (compara caminhos resolvidos: `file://${argv[1]}` quebra quando a pasta tem espaco no nome)
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const lerStdin = (fn) => {
    let s = '';
    process.stdin.on('data', (d) => (s += d)).on('end', () => fn(s));
  };
  try {
    if (cmd === 'db-id') {
      lerStdin((s) => {
        const db = (JSON.parse(s || '[]')).find((x) => x.name === a[0]);
        process.stdout.write(db?.uuid ?? db?.id ?? '');
      });
    } else if (cmd === 'whoami-accounts') {
      lerStdin((s) => { for (const c of whoamiAccounts(s)) process.stdout.write(`${c.id} ${c.nome}\n`); });
    } else if (cmd === 'split-sql') {
      if (!a[0] || !a[1]) throw new Error('uso: split-sql <arq.sql> <pasta> [maxBytes] [maxStmts]');
      const stmts = splitSql(readFileSync(a[0], 'utf8'));
      if (!stmts.length) throw new Error(`nenhum statement em ${a[0]}`);
      const lotes = lotesSql(stmts, Number(a[2]) || undefined, Number(a[3]) || undefined);
      mkdirSync(a[1], { recursive: true });
      lotes.forEach((l, i) => {
        const nome = join(a[1], `lote-${String(i + 1).padStart(3, '0')}.sql`);
        writeFileSync(nome, `-- lote ${i + 1}/${lotes.length} de ${a[0]} (${l.length} statements)\n${l.join('\n')}\n`);
        console.log(nome);
      });
      console.error(`${stmts.length} statements em ${lotes.length} lote(s).`);
    } else if (cmd === 'set-db-id') edit(a[1] ?? 'wrangler.toml', (t) => setDbId(t, a[0]));
    else if (cmd === 'set-access') {
      if (!a[0] || !a[1]) throw new Error('uso: set-access <aud> <team-domain>');
      if (!/^[a-z0-9-]+\.cloudflareaccess\.com$/i.test(a[1])) throw new Error(`ACCESS_TEAM_DOMAIN deve ser <time>.cloudflareaccess.com (recebi "${a[1]}")`);
      edit(a[2] ?? 'wrangler.toml', (t) => setVar(setVar(t, 'ACCESS_AUD', a[0]), 'ACCESS_TEAM_DOMAIN', a[1]));
    } else throw new Error(`comando desconhecido: ${cmd ?? '(nenhum)'}`);
  } catch (e) { console.error(String(e.message ?? e)); process.exit(1); }
}
