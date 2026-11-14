import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { validateMany, validateCsv } from '../src/csv';
import { upsertImportSql } from '../src/db';
import type { Grupo } from '../src/constants';

const H = 'codigo,link,nome_grupo,estado,cidade,categoria,fonte_url,data_coleta,status,ultima_validacao';
const g = (codigo: string, o: Partial<Grupo> = {}): Grupo => ({
  codigo, link: `https://chat.whatsapp.com/${codigo}`, nome_grupo: 'Grupo', estado: 'FL', cidade: 'Orlando',
  categoria: 'geral', fonte_url: '', data_coleta: '2026-11-01', status: 'ativo', ultima_validacao: '2026-11-01', nicho: '', ...o,
});
const line = (x: Grupo) => H.split(',').map((k) => x[k as keyof Grupo]).join(',');
const csv = (...rows: Grupo[]) => [H, ...rows.map(line)].join('\n');
const A = 'AAAAAAAAAAAAAAAAAAAAA1', B = 'BBBBBBBBBBBBBBBBBBBBB2', C = 'CCCCCCCCCCCCCCCCCCCCC3';

describe('validateMany (vários arquivos)', () => {
  it('mescla por codigo e reporta duplicados entre arquivos', () => {
    const r = validateMany([
      { nome: 'grupos.csv', texto: csv(g(A), g(B, { status: 'ativo', ultima_validacao: '2026-11-01' })) },
      { nome: 'grupos_outros.csv', texto: csv(g(C, { estado: 'WA' }), g(B, { status: 'expirado', ultima_validacao: '2026-11-10' })) },
    ]);
    expect(r.validos.map((x) => x.codigo).sort()).toEqual([A, B, C]);
    expect(r.duplicados).toHaveLength(1);
    expect(r.duplicados[0]).toMatchObject({ codigo: B, conflitos: ['status', 'ultima_validacao'], escolhido: 'grupos_outros.csv' });
    expect(r.duplicados[0].ocorrencias).toEqual([{ arquivo: 'grupos.csv', linha: 3 }, { arquivo: 'grupos_outros.csv', linha: 3 }]);
    expect(r.validos.find((x) => x.codigo === B)!.status).toBe('expirado');
  });
  it('validação mais recente vence mesmo se estiver no primeiro arquivo; empate → último arquivo', () => {
    const r = validateMany([
      { nome: '1', texto: csv(g(A, { nome_grupo: 'novo', ultima_validacao: '2026-11-12' }), g(B, { nome_grupo: 'x' })) },
      { nome: '2', texto: csv(g(A, { nome_grupo: 'velho', ultima_validacao: '2026-11-02' }), g(B, { nome_grupo: 'y' })) },
    ]);
    expect(r.validos.find((x) => x.codigo === A)!.nome_grupo).toBe('novo');
    expect(r.validos.find((x) => x.codigo === B)!.nome_grupo).toBe('y');
  });
  it('arquivo com cabeçalho inválido não impede o outro', () => {
    const r = validateMany([{ nome: 'ruim.csv', texto: 'a,b\n1,2' }, { nome: 'bom.csv', texto: csv(g(A)) }]);
    expect(r.arquivos[0].result.fatal).toMatch(/colunas ausentes/);
    expect(r.validos).toHaveLength(1);
  });
  it('linhas com erro mantêm número de linha correto nos válidos', () => {
    const r = validateCsv(csv(g(A), g(B, { estado: 'ZZ' }), g(C)));
    expect(r.linhas).toEqual([2, 4]);
  });
  it('normaliza grafias alternativas de categoria (com aviso); "classificados" continua erro', () => {
    const r = validateCsv(csv(g(A, { categoria: 'compra_e_venda' }), g(B, { categoria: 'delivery' }), g(C, { categoria: 'classificados' })));
    expect(r.validos.map((x) => x.categoria)).toEqual(['compra-e-venda', 'uber-delivery']);
    expect(r.avisos[0].erros[0]).toMatch(/normalizada/);
    expect(r.erros[0].erros[0]).toMatch(/categoria inválida "classificados"/);
  });
});

describe('upsert de importação (SQL real no SQLite)', () => {
  const db = () => {
    const d = new DatabaseSync(':memory:');
    const dir = new URL('../migrations/', import.meta.url);
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.sql')).sort()) d.exec(readFileSync(new URL(f, dir), 'utf8'));
    return d;
  };
  const get = (d: DatabaseSync, c: string) => d.prepare('SELECT * FROM grupos WHERE codigo = ?').get(c) as Record<string, unknown>;

  it('insere e atualiza por codigo', () => {
    const d = db();
    d.exec(upsertImportSql(g(A, { nome_grupo: "O'Brien & cia" })));
    d.exec(upsertImportSql(g(A, { nome_grupo: 'Renomeado', cidade: 'Tampa', ultima_validacao: '2026-11-05' })));
    expect(get(d, A)).toMatchObject({ nome_grupo: 'Renomeado', cidade: 'Tampa', ultima_validacao: '2026-11-05' });
    expect((d.prepare('SELECT COUNT(*) n FROM grupos').get() as { n: number }).n).toBe(1);
  });
  it('não regride status com validação mais nova no banco nem apaga nome conhecido', () => {
    const d = db();
    d.exec(upsertImportSql(g(A, { nome_grupo: 'Nome real', status: 'expirado', ultima_validacao: '2026-11-20' })));
    d.exec(upsertImportSql(g(A, { nome_grupo: '', status: 'ativo', ultima_validacao: '2026-11-13', cidade: 'Miami' })));
    expect(get(d, A)).toMatchObject({ nome_grupo: 'Nome real', status: 'expirado', ultima_validacao: '2026-11-20', cidade: 'Miami' });
    d.exec(upsertImportSql(g(A, { status: 'ativo', ultima_validacao: '2026-11-21' })));
    expect(get(d, A)).toMatchObject({ status: 'ativo', ultima_validacao: '2026-11-21' });
  });
  it('escapa aspas (sem injeção)', () => {
    const d = db();
    d.exec(upsertImportSql(g(A, { nome_grupo: "x'); DROP TABLE grupos; --" })));
    expect(get(d, A).nome_grupo).toBe("x'); DROP TABLE grupos; --");
    d.exec(upsertImportSql(g(A, { nome_grupo: 'dois  espaços\nlinha' })));
    expect(get(d, A).nome_grupo).toBe('dois  espaços\nlinha');
  });
});
