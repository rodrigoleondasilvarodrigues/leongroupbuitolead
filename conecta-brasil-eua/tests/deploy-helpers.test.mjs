// Auxiliares do deploy (scripts/deploy-helpers.mjs): parsing do whoami e divisão do .sql em lotes.
// Arquivo .mjs de propósito: o helper é Node puro, usado pelos scripts .sh.
import { describe, it, expect } from 'vitest';
import { whoamiAccounts, splitSql, lotesSql, setDbId, setVar } from '../scripts/deploy-helpers.mjs';

const ID1 = 'a'.repeat(32);
const ID2 = 'b1c2'.repeat(8);

describe('whoamiAccounts', () => {
  it('lê a tabela do `wrangler whoami` (OAuth, uma conta)', () => {
    const saida = [
      '👋 You are logged in with an OAuth Token, associated with the email leon@example.com.',
      '┌──────────────────────┬──────────────────────────────────┐',
      '│ Account Name         │ Account ID                       │',
      '├──────────────────────┼──────────────────────────────────┤',
      `│ Leon's Account       │ ${ID1} │`,
      '└──────────────────────┴──────────────────────────────────┘',
      '🔓 Token Permissions: d1 (write)',
    ].join('\n');
    expect(whoamiAccounts(saida)).toEqual([{ nome: "Leon's Account", id: ID1 }]);
  });

  it('mantém a ordem com várias contas e ignora cores ANSI', () => {
    const esc = String.fromCharCode(27);
    const saida = [
      '│ Account Name │ Account ID │',
      `│ ${esc}[1mPrimeira${esc}[0m │ ${ID1} │`,
      `│ Segunda LLC │ ${ID2} │`,
    ].join('\n');
    expect(whoamiAccounts(saida)).toEqual([{ nome: 'Primeira', id: ID1 }, { nome: 'Segunda LLC', id: ID2 }]);
  });

  it('devolve lista vazia quando não há login', () => {
    expect(whoamiAccounts('You are not authenticated. Please run `wrangler login`.')).toEqual([]);
    expect(whoamiAccounts('')).toEqual([]);
  });
});

describe('splitSql / lotesSql', () => {
  it('separa statements e descarta os comentários do cabeçalho', () => {
    const sql = "-- gerado em 2026-11-13\n-- 2 statements\nINSERT INTO grupos VALUES ('a');\nINSERT INTO grupos VALUES ('b');\n";
    expect(splitSql(sql)).toEqual(["INSERT INTO grupos VALUES ('a');", "INSERT INTO grupos VALUES ('b');"]);
  });

  it('não corta no ponto e vírgula dentro de string, nem em valor com quebra de linha ou apóstrofo', () => {
    const sql = "INSERT INTO e VALUES ('a; b\nc', 'O''Brien; Co');\nUPDATE e SET x = 1;";
    expect(splitSql(sql)).toEqual(["INSERT INTO e VALUES ('a; b\nc', 'O''Brien; Co');", 'UPDATE e SET x = 1;']);
  });

  it('não confunde um "--" dentro de string com comentário', () => {
    const sql = "INSERT INTO e VALUES ('x -- y');\nINSERT INTO e VALUES ('z');";
    expect(splitSql(sql)).toHaveLength(2);
  });

  it('agrupa em lotes por quantidade e por tamanho, preservando a ordem', () => {
    const stmts = ['A;', 'B;', 'C;', 'D;', 'E;'];
    expect(lotesSql(stmts, 1e6, 2)).toEqual([['A;', 'B;'], ['C;', 'D;'], ['E;']]);
    expect(lotesSql(stmts, 10, 1000)).toEqual([['A;', 'B;', 'C;'], ['D;', 'E;']]);   // 3 bytes por statement
    expect(lotesSql(stmts, 1e6, 1000)).toEqual([stmts]);
    expect(lotesSql([])).toEqual([]);
  });

  it('não divide um statement grande demais (vai sozinho no lote)', () => {
    const grande = `INSERT INTO e VALUES ('${'x'.repeat(100)}');`;
    expect(lotesSql(['A;', grande, 'B;'], 10, 1000)).toEqual([['A;'], [grande], ['B;']]);
  });
});

describe('wrangler.toml', () => {
  const toml = '[[d1_databases]]\ndatabase_id = "00000000-0000-0000-0000-000000000000"\n\n[vars]\nCHECK_BATCH = "20"\n# ACCESS_AUD = "<AUD>"\n';
  it('grava o database_id e recusa um id inválido', () => {
    expect(setDbId(toml, '11111111-2222-3333-4444-555555555555')).toContain('database_id = "11111111-2222-3333-4444-555555555555"');
    expect(() => setDbId(toml, 'nope')).toThrow(/inválido/);
  });
  it('descomenta/insere variáveis no [vars] sem duplicar', () => {
    const t = setVar(setVar(toml, 'ACCESS_AUD', 'aud123'), 'ACCESS_TEAM_DOMAIN', 'leon.cloudflareaccess.com');
    expect(t).toContain('ACCESS_AUD = "aud123"');
    expect(t).toContain('ACCESS_TEAM_DOMAIN = "leon.cloudflareaccess.com"');
    expect(t.match(/ACCESS_AUD/g)).toHaveLength(1);
    expect(t).toContain('CHECK_BATCH = "20"');
  });
});
