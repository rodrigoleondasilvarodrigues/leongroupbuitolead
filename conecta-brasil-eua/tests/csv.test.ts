import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseCsv, toCsv, validateCsv, extractCode, isValidDate } from '../src/csv';

const H = 'codigo,link,nome_grupo,estado,cidade,categoria,fonte_url,data_coleta,status,ultima_validacao';
const C1 = 'AAAAAAAAAAAAAAAAAAAAA1';
const row = (o: Partial<Record<string, string>> = {}) => {
  const d = { codigo: C1, link: `https://chat.whatsapp.com/${C1}`, nome_grupo: 'Grupo Teste', estado: 'FL', cidade: 'Orlando',
    categoria: 'empregos', fonte_url: 'https://example.com/x', data_coleta: '2026-11-01', status: 'ativo', ultima_validacao: '2026-11-02', ...o };
  return H.split(',').map((k) => (d as Record<string, string>)[k]).join(',');
};

describe('parseCsv', () => {
  it('lida com aspas, vírgulas, quebras de linha, CRLF e BOM', () => {
    const rows = parseCsv('﻿a,b\r\n"x, y","linha1\nlinha2"\r\n"aspas ""duplas""",z\r\n');
    expect(rows).toEqual([['a', 'b'], ['x, y', 'linha1\nlinha2'], ['aspas "duplas"', 'z']]);
  });
  it('ignora linhas em branco', () => {
    expect(parseCsv('a,b\n\n1,2\n')).toEqual([['a', 'b'], ['1', '2']]);
  });
});

describe('validateCsv', () => {
  it('aceita linha válida e normaliza', () => {
    const r = validateCsv(`${H}\n${row({ estado: 'fl', categoria: 'Empregos', status: 'ATIVO' })}\n`);
    expect(r.fatal).toBeNull();
    expect(r.erros).toEqual([]);
    expect(r.validos[0]).toMatchObject({ codigo: C1, estado: 'FL', categoria: 'empregos', status: 'ativo' });
  });
  it('aceita colunas em outra ordem', () => {
    const cols = H.split(',').reverse();
    const vals = row().split(',').reverse();
    expect(validateCsv(`${cols.join(',')}\n${vals.join(',')}`).validos).toHaveLength(1);
  });
  it('rejeita cabeçalho com coluna ausente ou extra', () => {
    expect(validateCsv('codigo,link\nx,y').fatal).toMatch(/colunas ausentes/);
    expect(validateCsv(`${H},extra\n${row()},1`).fatal).toMatch(/colunas extras: extra/);
  });
  it('reporta erros por linha', () => {
    const r = validateCsv([H,
      row({ estado: 'XX' }),
      row({ codigo: 'BBBBBBBBBBBBBBBBBBBBB2', link: 'https://chat.whatsapp.com/CCCCCCCCCCCCCCCCCCCCC3' }),
      row({ codigo: 'DDDDDDDDDDDDDDDDDDDDD4', link: 'https://chat.whatsapp.com/DDDDDDDDDDDDDDDDDDDDD4', categoria: 'outros', status: 'ok', data_coleta: '2026-13-01' }),
      row({ codigo: 'EEEEEEEEEEEEEEEEEEEEE5', link: 'http://example.com/x' }),
    ].join('\n'));
    expect(r.validos).toHaveLength(0);
    expect(r.erros.map((e) => e.linha)).toEqual([2, 3, 4, 5]);
    expect(r.erros[0].erros.join()).toMatch(/estado desconhecido/);
    expect(r.erros[1].erros.join()).toMatch(/difere/);
    expect(r.erros[2].erros.join()).toMatch(/categoria inválida.*status inválido|status inválido/);
    expect(r.erros[2].erros.join()).toMatch(/data_coleta inválida/);
    expect(r.erros[3].erros.join()).toMatch(/chat\.whatsapp\.com/);
  });
  it('detecta codigo duplicado e número errado de colunas', () => {
    const r = validateCsv(`${H}\n${row()}\n${row()}\na,b\n`);
    expect(r.validos).toHaveLength(1);
    expect(r.erros[0].erros[0]).toMatch(/duplicado/);
    expect(r.erros[1].erros[0]).toMatch(/esperava 10 colunas/);
  });
  it('nome_grupo vazio é aceito com aviso', () => {
    const r = validateCsv(`${H}\n${row({ nome_grupo: '' })}`);
    expect(r.validos).toHaveLength(1);
    expect(r.avisos[0].erros[0]).toMatch(/nome_grupo vazio/);
  });
  it('status vazio vira indeterminado com aviso', () => {
    const r = validateCsv(`${H}\n${row({ status: '', cidade: '' })}`);
    expect(r.validos[0].status).toBe('indeterminado');
    expect(r.avisos[0].erros).toEqual(expect.arrayContaining(['cidade vazia', 'status vazio → indeterminado']));
  });
  it('o CSV de exemplo do repositório é 100% válido', () => {
    const r = validateCsv(readFileSync(new URL('../data/sample-groups.csv', import.meta.url), 'utf8'));
    expect(r.fatal).toBeNull();
    expect(r.erros).toEqual([]);
    expect(r.validos.length).toBeGreaterThanOrEqual(10);
  });
});

describe('toCsv (export) faz round-trip', () => {
  it('reimporta o que exporta', () => {
    const r = validateCsv(`${H}\n${row({ nome_grupo: '"Vagas, Miami"\nnova linha' })}`);
    const again = validateCsv(toCsv(r.validos));
    expect(again.validos).toEqual(r.validos);
  });
});

describe('helpers', () => {
  it('extractCode', () => {
    expect(extractCode(`https://chat.whatsapp.com/${C1}`)).toBe(C1);
    expect(extractCode(`https://chat.whatsapp.com/invite/${C1}?x=1`)).toBe(C1);
    expect(extractCode(`https://evil.com/${C1}`)).toBeNull();
  });
  it('isValidDate', () => {
    expect(isValidDate('2026-02-28')).toBe(true);
    expect(isValidDate('2026-02-30')).toBe(false);
    expect(isValidDate('13/11/2026')).toBe(false);
  });
});
