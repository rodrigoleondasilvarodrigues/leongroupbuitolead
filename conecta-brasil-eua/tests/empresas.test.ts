import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { detectTipo, validateCsv, toCsv, parseCsv } from '../src/csv';
import { upsertImportSql } from '../src/db';
import { validateArquivos } from '../src/importar';
import {
  normTelefone, chaveEmpresa, chaveNome, mergeEmpresa, validateEmpresa, validateEmpresasCsv, validateManyEmpresas,
  contagemPorArquivo, empresasSql, empresaUpsertSql, empresasToCsv, whereEmpresas, FROM,
} from '../src/empresas';
import { EMPRESA_COLUMNS, type Empresa, type EmpresaRow, type Grupo } from '../src/constants';

const HE = EMPRESA_COLUMNS.join(',');
const HG = 'codigo,link,nome_grupo,estado,cidade,categoria,fonte_url,data_coleta,status,ultima_validacao';
const emp = (o: Partial<Empresa> = {}): Empresa => ({
  empresa: 'Café Brasil', nicho: 'comida', cidade: 'Orlando', estado: 'FL', telefone_comercial: '(407) 555-0101',
  site: 'https://cafe.example.com/', instagram: '', facebook: '', google_nota: '', google_avaliacoes: '',
  indicio_brasileiro: 'nome com Brasil', oportunidade_marketing: 'sem Instagram comercial listado',
  fonte_url: 'https://guia.example.com/a', data_coleta: '2026-11-13', arquivo_origem: '', confianca_brasileira: '', ...o,
});
const cell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const csvE = (...rows: Empresa[]) => [HE, ...rows.map((r) => EMPRESA_COLUMNS.map((c) => cell(r[c])).join(','))].join('\n');
const row = (o: Partial<Empresa> = {}): EmpresaRow => validateEmpresa(emp(o)).empresa;

const newDb = (onlyFirst = false) => {
  const d = new DatabaseSync(':memory:');
  const dir = new URL('../migrations/', import.meta.url);
  const files = readdirSync(dir).filter((x) => x.endsWith('.sql')).sort();
  for (const f of onlyFirst ? files.slice(0, 1) : files) d.exec(readFileSync(new URL(f, dir), 'utf8'));
  return d;
};
const apply = (d: DatabaseSync, rows: EmpresaRow[], nomes?: Map<string, Set<string>>) =>
  d.exec(empresasSql({ empresas: rows, nomes: nomes ?? new Map() }).join('\n'));
const all = (d: DatabaseSync) => d.prepare('SELECT * FROM empresas ORDER BY chave').all() as unknown as EmpresaRow[];
const pick = (r: EmpresaRow) => Object.fromEntries(['chave', 'chave_nome', ...EMPRESA_COLUMNS].map((c) => [c, r[c as keyof EmpresaRow]]));

describe('detecção do tipo pelo cabeçalho', () => {
  it('grupos (com e sem nicho), empresas, BOM e desconhecido', () => {
    expect(detectTipo(`${HG}\nx`)).toBe('grupos');
    expect(detectTipo(`${HG},nicho\n`)).toBe('grupos');
    expect(detectTipo(`﻿${HE}\r\n`)).toBe('empresas');
    expect(detectTipo('EMPRESA,Telefone_Comercial,cidade')).toBe('empresas');
    expect(detectTipo('comunidade,estado,canal,contato,fonte_url,observacao')).toBeNull();
    expect(detectTipo('nome_no_video,encontrado,codigo,status,fonte_url')).toBeNull();
  });
  it('validateArquivos separa os tipos e ignora o desconhecido', () => {
    const C = 'AAAAAAAAAAAAAAAAAAAAA1';
    const r = validateArquivos([
      { nome: 'grupos.csv', texto: `${HG}\n${C},https://chat.whatsapp.com/${C},G,FL,Orlando,geral,,2026-11-13,ativo,2026-11-13` },
      { nome: 'leads_empresas.csv', texto: csvE(emp()) },
      { nome: 'leads_frente1.csv', texto: `${HE}\n` },
      { nome: 'contatos.csv', texto: 'comunidade,estado\nx,FL' },
    ]);
    expect(r.grupos.validos).toHaveLength(1);
    expect(r.empresas.empresas).toHaveLength(1);
    expect(r.empresas.arquivos.map((a) => [a.nome, a.result.vazio])).toEqual([['leads_empresas.csv', false], ['leads_frente1.csv', true]]);
    expect(r.ignorados.map((i) => i.nome)).toEqual(['contatos.csv']);
  });
});

describe('chave de deduplicação', () => {
  it('telefone: só dígitos, sem o 1 dos EUA quando tem 11 dígitos', () => {
    expect(normTelefone('(770) 818-0088')).toBe('7708180088');
    expect(normTelefone('+1 770.818.0088')).toBe('7708180088');
    expect(normTelefone('1-770-818-0088')).toBe('7708180088');
    expect(normTelefone('27708180088')).toBe('27708180088'); // 11 dígitos sem o 1: mantém
    expect(normTelefone('')).toBe('');
  });
  it('célula com vários telefones: a chave usa o primeiro (com aviso)', () => {
    expect(normTelefone('+1 (407) 883-2429 / (321) 280-9928')).toBe('4078832429');
    expect(normTelefone('+1-781-396-8337;+1-781-396-8303')).toBe('7813968337');
    expect(normTelefone('(305) 555-0000 ou (305) 555-1111')).toBe('3055550000');
    const v = validateEmpresa(emp({ telefone_comercial: '+1 (407) 883-2429 / (321) 280-9928' }));
    expect(v.empresa.chave).toBe('tel:4078832429');
    expect(v.avisos.join('|')).toMatch(/vários telefones/);
    expect(validateEmpresa(emp({ telefone_comercial: '+55 11 94078-5353' })).avisos.join('|')).toMatch(/Brasil/);
  });
  it('sem telefone: empresa+cidade+estado em minúsculas, espaços normalizados', () => {
    expect(chaveEmpresa(emp({ telefone_comercial: '' , empresa: '  Café   BRASIL ', cidade: 'Los  Angeles', estado: 'ca' })))
      .toBe('nome:café brasil|los angeles|ca');
    expect(chaveEmpresa(emp())).toBe('tel:4075550101');
  });
});

describe('validação do CSV de empresas', () => {
  it('cabeçalho só (arquivo vazio de dados) não é erro', () => {
    const r = validateEmpresasCsv(`${HE}\n`);
    expect(r).toMatchObject({ fatal: null, vazio: true, totalLinhas: 0 });
  });
  it('coluna ausente invalida o arquivo', () => {
    expect(validateEmpresasCsv('empresa,telefone_comercial\nx,1').fatal).toMatch(/colunas ausentes: nicho/);
  });
  it('erros por linha (estado, empresa vazia, nº de colunas) com número da linha', () => {
    const r = validateEmpresasCsv([csvE(emp(), emp({ estado: 'ZZ' }), emp({ empresa: '' })), 'a,b'].join('\n'));
    expect(r.validos).toHaveLength(1);
    expect(r.erros.map((e) => [e.linha, e.erros[0]])).toEqual([
      [3, 'estado desconhecido "ZZ"'], [4, 'empresa vazia'], [5, 'esperava 16 colunas, encontrou 2'],
    ]);
  });
  it('normaliza com aviso (nota, avaliações, instagram, URL sem http) e nunca derruba o lead por isso', () => {
    const { empresa: e, erros, avisos } = validateEmpresa(emp({
      google_nota: '4,7', google_avaliacoes: '1.234', instagram: '@cafe.br', site: 'cafe.com', facebook: 'algo estranho',
      estado: 'fl', nicho: ' Comida ', indicio_brasileiro: 'a; A ;b', fonte_url: 'https://x.com/1 nao-url https://x.com/1',
    }));
    expect(erros).toEqual([]);
    expect(e).toMatchObject({ google_nota: '4.7', google_avaliacoes: '1234', instagram: 'https://www.instagram.com/cafe.br',
      site: 'https://cafe.com', estado: 'FL', nicho: 'comida', indicio_brasileiro: 'a; b', fonte_url: 'https://x.com/1' });
    expect(avisos.join('|')).toMatch(/facebook não parece uma URL/);
    expect(validateEmpresa(emp({ google_nota: '7' })).empresa.google_nota).toBe('');
    expect(validateEmpresa(emp({ data_coleta: '13/11/2026' })).empresa.data_coleta).toBe('');
    expect(validateEmpresa(emp({ cidade: 'St. Petersburg' })).avisos).toEqual([]);
    expect(validateEmpresa(emp({ cidade: 'Buffet hours vary from business hours. Please call for any questions' })).avisos.join('|')).toMatch(/cidade suspeita/);
  });
});

describe('mescla em memória (vários arquivos)', () => {
  it('mesmo telefone em formatos diferentes → 1 empresa; mais nova vence; vazio não apaga; listas unidas', () => {
    const r = validateManyEmpresas([
      { nome: 'leads_empresas.csv', texto: csvE(emp({ instagram: 'https://instagram.com/cafe', google_nota: '4.5', data_coleta: '2026-11-10',
        indicio_brasileiro: 'nome com Brasil; guia Brazusa' })) },
      { nome: 'leads_frente2.csv', texto: csvE(emp({ telefone_comercial: '+1 407 555 0101', site: 'https://novo.example.com/', instagram: '',
        google_nota: '', oportunidade_marketing: 'texto novo', indicio_brasileiro: 'guia Brazusa; fala português', fonte_url: 'https://outra.example.com/b',
        data_coleta: '2026-11-12' })) },
    ]);
    expect(r.empresas).toHaveLength(1);
    expect(r.empresas[0]).toMatchObject({
      chave: 'tel:4075550101', site: 'https://novo.example.com/', instagram: 'https://instagram.com/cafe', google_nota: '4.5',
      oportunidade_marketing: 'texto novo', indicio_brasileiro: 'nome com Brasil; guia Brazusa; fala português',
      fonte_url: 'https://guia.example.com/a https://outra.example.com/b', data_coleta: '2026-11-12',
    });
    expect(r.mesclados).toEqual([{ chave: 'tel:4075550101', nomesDiferentes: false, ocorrencias: [
      { arquivo: 'leads_empresas.csv', linha: 2, empresa: 'Café Brasil', cidade: 'Orlando' },
      { arquivo: 'leads_frente2.csv', linha: 2, empresa: 'Café Brasil', cidade: 'Orlando' }] }]);
  });
  it('linha mais antiga não sobrescreve, mas preenche campo vazio', () => {
    const r = validateManyEmpresas([{ nome: 'a', texto: csvE(
      emp({ site: 'https://novo/', facebook: '', data_coleta: '2026-11-12' }),
      emp({ site: 'https://velho/', facebook: 'https://fb.com/cafe', data_coleta: '2026-11-01' }),
    ) }]);
    expect(r.empresas[0]).toMatchObject({ site: 'https://novo/', facebook: 'https://fb.com/cafe', data_coleta: '2026-11-12' });
  });
  it('lead sem telefone casa com o mesmo empresa+cidade+estado que tem telefone (em qualquer ordem)', () => {
    const r = validateManyEmpresas([
      { nome: 'a', texto: csvE(emp({ telefone_comercial: '', empresa: 'CAFÉ BRASIL', instagram: 'https://ig/cafe' })) },
      { nome: 'b', texto: csvE(emp()) },
    ]);
    expect(r.empresas).toHaveLength(1);
    expect(r.empresas[0]).toMatchObject({ chave: 'tel:4075550101', instagram: 'https://ig/cafe' });
  });
  it('mesmo telefone com nomes/cidades diferentes é mesclado e sinalizado', () => {
    const r = validateManyEmpresas([{ nome: 'a', texto: csvE(emp({ cidade: 'Marietta' }), emp({ cidade: 'Sandy Springs' })) }]);
    expect(r.empresas).toHaveLength(1);
    expect(r.mesclados[0].nomesDiferentes).toBe(true);
  });
  it('contagem por arquivo: inseridas / mescladas / ignoradas', () => {
    const r = validateManyEmpresas([
      { nome: 'a', texto: csvE(emp(), emp({ telefone_comercial: '305-555-0000', empresa: 'Outra' }), emp({ estado: '' })) },
      { nome: 'b', texto: csvE(emp({ data_coleta: '2026-11-14' }), emp({ telefone_comercial: '', empresa: 'Nova' })) },
    ]);
    const c = contagemPorArquivo(r);
    expect(c.get('a')).toEqual({ linhas: 3, inseridas: 2, mescladas: 0, ignoradas: 1 });
    expect(c.get('b')).toEqual({ linhas: 2, inseridas: 1, mescladas: 1, ignoradas: 0 });
    const c2 = contagemPorArquivo(r, (k) => k === 'tel:3055550000');
    expect(c2.get('a')).toMatchObject({ inseridas: 1, mescladas: 1 });
  });
});

describe('upsert de empresas (SQL real no SQLite, mesmo texto usado no D1)', () => {
  it('insere, depois mescla: mais nova vence, vazio não apaga, listas sem repetição, idempotente', () => {
    const d = newDb();
    const a = row({ instagram: 'https://ig/cafe', google_nota: '4.5', data_coleta: '2026-11-10', indicio_brasileiro: 'x; y' });
    const b = row({ site: 'https://novo/', instagram: '', google_nota: '', indicio_brasileiro: 'Y; z', fonte_url: 'https://f/2', data_coleta: '2026-11-12' });
    apply(d, [a]);
    apply(d, [b]);
    apply(d, [b]); // de novo: nada muda
    const rows = all(d);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ site: 'https://novo/', instagram: 'https://ig/cafe', google_nota: '4.5', indicio_brasileiro: 'x; y; z',
      fonte_url: 'https://guia.example.com/a https://f/2', data_coleta: '2026-11-12' });
    // e o resultado é idêntico ao da mescla em memória
    expect(pick(rows[0])).toEqual(pick(mergeEmpresa(mergeEmpresa(a, b), b)));
  });
  it('dado mais antigo no CSV não sobrescreve o banco, só preenche vazios', () => {
    const d = newDb();
    apply(d, [row({ site: 'https://novo/', facebook: '', oportunidade_marketing: 'atual', data_coleta: '2026-11-12' })]);
    apply(d, [row({ site: 'https://velho/', facebook: 'https://fb/c', oportunidade_marketing: 'antiga', data_coleta: '2026-11-01' })]);
    expect(all(d)[0]).toMatchObject({ site: 'https://novo/', facebook: 'https://fb/c', oportunidade_marketing: 'atual', data_coleta: '2026-11-12' });
  });
  it('lead antigo sem telefone no banco é promovido para a chave do telefone (sem duplicar)', () => {
    const d = newDb();
    apply(d, [row({ telefone_comercial: '', instagram: 'https://ig/cafe' })]);
    expect(all(d)[0].chave).toBe('nome:café brasil|orlando|fl');
    apply(d, [row({ data_coleta: '2026-11-14' })]);
    const rows = all(d);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ chave: 'tel:4075550101', instagram: 'https://ig/cafe', telefone_comercial: '(407) 555-0101' });
  });
  it('lead sem telefone mescla no registro com telefone já existente', () => {
    const d = newDb();
    apply(d, [row()]);
    apply(d, [row({ telefone_comercial: '', facebook: 'https://fb/c', data_coleta: '2026-11-14' })]);
    const rows = all(d);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ chave: 'tel:4075550101', facebook: 'https://fb/c', telefone_comercial: '(407) 555-0101' });
  });
  it('escapa aspas (sem injeção)', () => {
    const d = newDb();
    const evil = "O'Brien'); DROP TABLE empresas; --";
    apply(d, [row({ empresa: evil, indicio_brasileiro: "it's; ok", oportunidade_marketing: "a'b" })]);
    apply(d, [row({ empresa: evil, indicio_brasileiro: "it's; novo'" })]);
    expect(all(d)[0]).toMatchObject({ empresa: evil, indicio_brasileiro: "it's; ok; novo'" });
  });
  it('uma linha do lote = statements independentes (UPDATE de promoção + INSERT)', () => {
    expect(empresaUpsertSql(row())).toHaveLength(3); // UPDATE prospeccao + UPDATE empresas + INSERT
    expect(empresaUpsertSql(row({ telefone_comercial: '' }))).toHaveLength(1);
  });
  it('lote real mesclado + chave_nome', () => {
    const r = validateManyEmpresas([{ nome: 'a', texto: csvE(emp(), emp({ telefone_comercial: '', empresa: 'Sem Fone', cidade: 'Miami' })) }]);
    const d = newDb();
    apply(d, r.empresas, r.nomes);
    expect(all(d).map((x) => [x.chave, x.chave_nome])).toEqual([
      ['nome:sem fone|miami|fl', chaveNome({ empresa: 'Sem Fone', cidade: 'Miami', estado: 'FL' })],
      ['tel:4075550101', 'café brasil|orlando|fl'],
    ]);
  });
  it('filtros: palavras da busca em qualquer campo, telefone pelos dígitos, oportunidade "contém"', () => {
    const d = newDb();
    apply(d, [row(), row({ telefone_comercial: '305-555-0000', empresa: 'Limpa Tudo', nicho: 'limpeza', cidade: 'Miami', oportunidade_marketing: 'sem site próprio' })]);
    const q = (f: Parameters<typeof whereEmpresas>[0]) => {
      const w = whereEmpresas(f);
      return (d.prepare(`SELECT empresa ${FROM} ${w.sql} ORDER BY empresa`).all(...(w.args as string[])) as { empresa: string }[]).map((x) => x.empresa);
    };
    expect(q({ q: 'limpa miami' })).toEqual(['Limpa Tudo']);
    expect(q({ q: '3055550000' })).toEqual(['Limpa Tudo']);
    expect(q({ oport: 'SEM INSTAGRAM' })).toEqual(['Café Brasil']);
    expect(q({ nicho: 'limpeza', estado: 'fl', cidade: 'MIAMI' })).toEqual(['Limpa Tudo']);
    expect(q({ q: '50%' })).toEqual([]);
  });
  it('exportação CSV volta a ser importável (round-trip)', () => {
    const e = row({ oportunidade_marketing: 'a, "b"\nc' });
    const back = validateEmpresasCsv(empresasToCsv([e]));
    expect(back.erros).toEqual([]);
    expect(pick(back.validos[0])).toEqual(pick(e));
  });
});

describe('grupos: coluna opcional nicho', () => {
  const C = 'AAAAAAAAAAAAAAAAAAAAA1';
  const lineG = (nicho?: string) => `${C},https://chat.whatsapp.com/${C},G,FL,Orlando,geral,,2026-11-13,ativo,2026-11-13${nicho === undefined ? '' : ',' + nicho}`;
  const g = (o: Partial<Grupo> = {}): Grupo => ({ codigo: C, link: `https://chat.whatsapp.com/${C}`, nome_grupo: 'G', estado: 'FL', cidade: 'Orlando',
    categoria: 'geral', fonte_url: '', data_coleta: '2026-11-13', status: 'ativo', ultima_validacao: '2026-11-13', nicho: '', ...o });
  it('aceita CSV com e sem nicho; normaliza para minúsculas', () => {
    expect(validateCsv(`${HG}\n${lineG()}`).validos[0].nicho).toBe('');
    expect(validateCsv(`${HG},nicho\n${lineG(' Limpeza ')}`).validos[0].nicho).toBe('limpeza');
    expect(validateCsv(`${HG},nicho,outra\n${lineG('x')},y`).fatal).toMatch(/colunas extras: outra/);
  });
  it('exporta nicho e o export é reimportável', () => {
    const out = toCsv([g({ nicho: 'beleza' })]);
    expect(parseCsv(out)[0]).toContain('nicho');
    expect(validateCsv(out).validos[0].nicho).toBe('beleza');
  });
  it('migration compatível: banco com dados da 0001 recebe a 0002 sem perder linhas; nicho vazio não apaga o conhecido', () => {
    const d = newDb(true);
    const old = upsertImportSql(g()).replace(/, nicho\)/, ')').replace(/, ''\) ON CONFLICT/, ') ON CONFLICT')
      .replace(/nicho = COALESCE\(NULLIF\(excluded\.nicho, ''\), grupos\.nicho\),/, '');
    d.exec(old);
    d.exec(readFileSync(new URL('../migrations/0002_empresas.sql', import.meta.url), 'utf8'));
    const get = () => d.prepare('SELECT nome_grupo, nicho FROM grupos').all();
    expect(get()).toEqual([{ nome_grupo: 'G', nicho: '' }]);
    d.exec(upsertImportSql(g({ nicho: 'comida' })));
    d.exec(upsertImportSql(g({ nicho: '' })));
    expect(get()).toEqual([{ nome_grupo: 'G', nicho: 'comida' }]);
  });
});

describe('empresas_final.csv: confiança e arquivo_origem', () => {
  it('normaliza "Média"/"media"/"ALTA"; valor estranho vira vazio com aviso; arquivo_origem é lista', async () => {
    const { normConfianca } = await import('../src/empresas');
    expect(['alta', 'Média', 'media', 'MEDIA', 'baixa', '', 'talvez'].map(normConfianca)).toEqual(['alta', 'media', 'media', 'media', 'baixa', '', null]);
    const v = validateEmpresa(emp({ confianca_brasileira: 'talvez', arquivo_origem: 'a.csv | b.csv|a.csv' }));
    expect(v.empresa.confianca_brasileira).toBe('');
    expect(v.avisos.join('|')).toMatch(/confianca_brasileira inválida/);
    expect(v.empresa.arquivo_origem).toBe('a.csv | b.csv');
  });
  it('CSV antigo (sem as colunas novas) continua válido', () => {
    const old = EMPRESA_COLUMNS.filter((c) => c !== 'arquivo_origem' && c !== 'confianca_brasileira');
    const r = validateEmpresasCsv(`${old.join(',')}\n${old.map((c) => cell(emp()[c])).join(',')}`);
    expect(r.fatal).toBeNull();
    expect(r.validos[0].confianca_brasileira).toBe('');
  });
});

describe('grupos sem estado', () => {
  it('estado vazio é aviso (Nacional / sem estado), não erro; "nacional" vira geral', () => {
    const C = 'AAAAAAAAAAAAAAAAAAAAA1';
    const r = validateCsv(`${HG}\n${C},https://chat.whatsapp.com/${C},G,,,nacional,,2026-11-13,ativo,2026-11-13`);
    expect(r.erros).toEqual([]);
    expect(r.validos[0]).toMatchObject({ estado: '', categoria: 'geral' });
  });
});
