// Rotas do Worker (Hono) contra um D1 falso sobre node:sqlite com as migrations reais.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import worker from '../src/index';
import { upsertImportSql } from '../src/db';
import { empresasSql, validateEmpresa, validateManyEmpresas } from '../src/empresas';
import { EMPRESA_COLUMNS, type Empresa, type Grupo } from '../src/constants';

function fakeD1(d: DatabaseSync) {
  const stmt = (sql: string, args: unknown[] = []) => ({
    bind: (...a: unknown[]) => stmt(sql, a),
    all: async () => ({ results: d.prepare(sql).all(...(args as never[])) }),
    first: async () => d.prepare(sql).get(...(args as never[])) ?? null,
    run: async () => { d.prepare(sql).run(...(args as never[])); return { success: true }; },
    _exec: () => ({ results: d.prepare(sql).all(...(args as never[])) }),
  });
  return {
    prepare: (sql: string) => stmt(sql),
    batch: async (ss: ReturnType<typeof stmt>[]) => ss.map((s) => s._exec()),
  } as unknown as D1Database;
}
function newDb() {
  const d = new DatabaseSync(':memory:');
  const dir = new URL('../migrations/', import.meta.url);
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.sql')).sort()) d.exec(readFileSync(new URL(f, dir), 'utf8'));
  return d;
}
const g = (codigo: string, o: Partial<Grupo> = {}): Grupo => ({
  codigo, link: `https://chat.whatsapp.com/${codigo}`, nome_grupo: `Grupo ${codigo.slice(0, 3)}`, estado: 'FL', cidade: 'Orlando',
  categoria: 'geral', fonte_url: '', data_coleta: '2026-11-13', status: 'ativo', ultima_validacao: '2026-11-13', nicho: '', ...o,
});
const e = (o: Partial<Empresa> = {}): Empresa => ({
  ...(Object.fromEntries(EMPRESA_COLUMNS.map((c) => [c, ''])) as Empresa),
  empresa: 'Café Brasil', nicho: 'comida', cidade: 'Orlando', estado: 'FL', telefone_comercial: '(407) 555-0101',
  data_coleta: '2026-11-13', confianca_brasileira: 'alta', ...o,
});

function setup(env: Record<string, string> = {}) {
  const d = newDb();
  for (const x of [g('AAAAAAAAAAAAAAAAAAAAA1'), g('BBBBBBBBBBBBBBBBBBBBB2', { status: 'expirado', nome_grupo: 'Expirado X' }),
    g('CCCCCCCCCCCCCCCCCCCCC3', { estado: '', cidade: '', nome_grupo: 'Brasileiros nos EUA', categoria: 'imigracao' }),
    g('DDDDDDDDDDDDDDDDDDDDD4', { estado: 'CA', cidade: 'San Diego', categoria: 'empregos' })]) d.exec(upsertImportSql(x));
  const rows = [e(), e({ empresa: 'Média Ltda', telefone_comercial: '(305) 555-0000', confianca_brasileira: 'media', cidade: 'Miami' }),
    e({ empresa: 'Duvidosa Inc', telefone_comercial: '(212) 555-0000', confianca_brasileira: 'baixa', estado: 'NY', cidade: 'New York', nicho: 'limpeza' })]
    .map((x) => validateEmpresa(x).empresa);
  d.exec(empresasSql({ empresas: rows, nomes: new Map() }).join('\n'));
  const E = { DB: fakeD1(d), ...env };
  const ctx = { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext;
  const req = (path: string, init?: RequestInit) => worker.fetch(new Request(`http://localhost${path}`, init), E as never, ctx);
  const post = (path: string, form: Record<string, string>, headers: Record<string, string> = {}) =>
    req(path, { method: 'POST', body: new URLSearchParams(form), headers: { Origin: 'http://localhost', ...headers }, redirect: 'manual' });
  return { d, req, post };
}

describe('páginas públicas (grupos)', () => {
  it('início: Olá + contadores só de ativos', async () => {
    const { req } = setup();
    const r = await req('/');
    expect(r.status).toBe(200);
    const h = await r.text();
    expect(h).toContain('Olá');
    expect(h).toMatch(/<b>3<\/b><span>Grupos ativos/);
    expect(h).toMatch(/<b>2<\/b><span>Estados/);
    expect(h).toContain('CONECTA <b>BRASIL-EUA</b>');
  });
  it('biblioteca: só ativos (mesmo com ?todos=1), card com botão e target _blank', async () => {
    const { req } = setup();
    const h = await (await req('/grupos?todos=1')).text();
    expect(h).not.toContain('Expirado X');
    expect((h.match(/class="gcard"/g) ?? []).length).toBe(3);
    expect(h).toContain('Busque por nome, cidade ou interesse');
    expect(h).toMatch(/href="https:\/\/chat\.whatsapp\.com\/AAAAAAAAAAAAAAAAAAAAA1" target="_blank" rel="noopener noreferrer">.*Entrar no WhatsApp/s);
    expect(h).toContain('Não informado');
  });
  it('estados e cidades: card por estado, Nacional / sem estado, links filtrados', async () => {
    const { req } = setup();
    const h = await (await req('/estados')).text();
    expect(h).toContain('Califórnia');
    expect(h).toContain('Nacional / sem estado');
    expect(h).toContain('href="/grupos?estado=FL&amp;cidade=Orlando"');
    expect(h).toContain('Nenhuma cidade informada');
    const sem = await (await req('/grupos?estado=-')).text();
    expect(sem).toContain('Brasileiros nos EUA');
    expect((sem.match(/class="gcard"/g) ?? []).length).toBe(1);
    const cid = await req('/grupos?estado=CA&cidade=San%20Diego');
    expect(cid.status).toBe(200);
    expect((await cid.text()).match(/class="gcard"/g)).toHaveLength(1);
  });
  it('categorias e como utilizar renderizam', async () => {
    const { req } = setup();
    expect(await (await req('/categorias')).text()).toContain('Imigração');
    expect(await (await req('/como-utilizar')).text()).toContain('03 · Abra o convite');
  });
});

describe('empresas: confiança, prospecção e exportação', () => {
  it('padrão mostra alta + média; filtro conf=baixa / todas', async () => {
    const { req } = setup();
    const h = await (await req('/empresas')).text();
    expect(h).toContain('Café Brasil');
    expect(h).toContain('Média Ltda');
    expect(h).not.toContain('Duvidosa Inc');
    expect(h).toMatch(/<b>2<\/b><span>Empresas/); // painel respeita o filtro
    expect(await (await req('/empresas?conf=baixa')).text()).toContain('Duvidosa Inc');
    expect(await (await req('/empresas?conf=todas&view=tabela')).text()).toMatch(/<table>.*Duvidosa Inc/s);
  });
  it('salva prospecção (303 de volta), filtra por status, exporta e sobrevive ao reimport', async () => {
    const { d, req, post } = setup();
    const r = await post('/empresas/prospeccao', { chave: 'tel:4075550101', status_prospeccao: 'respondeu', data_contato: '2026-11-12', observacao: 'ligar de novo', volta: '/empresas?nicho=comida&msg=velha#e1' });
    expect(r.status).toBe(303);
    expect(r.headers.get('Location')).toBe('/empresas?nicho=comida&msg=Prospec%C3%A7%C3%A3o+salva.#e1');
    const h = await (await req('/empresas?status=respondeu')).text();
    expect(h).toContain('Café Brasil');
    expect(h).not.toContain('Média Ltda');
    expect(h).toContain('ligar de novo');
    // reimport da mesma empresa (dados novos) não mexe na prospecção
    const again = validateManyEmpresas([{ nome: 'empresas_final.csv', texto: `${EMPRESA_COLUMNS.join(',')}\nCafé Brasil,comida,Orlando,FL,(407) 555-0101,https://cafe.example.com,,,4.9,10,,,,2026-11-14,leads_x.csv,média` }]);
    d.exec(empresasSql(again).join('\n'));
    const csv = await (await req('/empresas/exportar.csv')).text();
    expect(csv.split('\r\n')[0]).toBe([...EMPRESA_COLUMNS, 'status_prospeccao', 'data_contato', 'observacao'].join(','));
    expect(csv).toMatch(/Café Brasil,.*,media,respondeu,2026-11-12,ligar de novo/);
    expect(csv).toMatch(/Média Ltda,.*,nao_contatado,,/);
    expect(csv).not.toContain('Duvidosa');
  });
  it('lead sem telefone que ganha telefone leva a prospecção junto', async () => {
    const { d, post, req } = setup();
    d.exec(empresasSql({ empresas: [validateEmpresa(e({ empresa: 'Sem Fone', telefone_comercial: '', cidade: 'Tampa' })).empresa], nomes: new Map() }).join('\n'));
    expect((await post('/empresas/prospeccao', { chave: 'nome:sem fone|tampa|fl', status_prospeccao: 'cliente' })).status).toBe(303);
    d.exec(empresasSql(validateManyEmpresas([{ nome: 'x.csv', texto: `${EMPRESA_COLUMNS.join(',')}\nSem Fone,comida,Tampa,FL,(813) 555-0000,,,,,,,,,2026-11-14,,alta` }])).join('\n'));
    expect(d.prepare('SELECT empresa_chave, status_prospeccao FROM prospeccao').all()).toEqual([{ empresa_chave: 'tel:8135550000', status_prospeccao: 'cliente' }]);
    expect(await (await req('/empresas?status=cliente')).text()).toContain('Sem Fone');
  });
  it('validação no servidor: status, data, tamanho, empresa inexistente, redirect só interno', async () => {
    const { post, d } = setup();
    expect((await post('/empresas/prospeccao', { chave: 'tel:4075550101', status_prospeccao: 'hackeado' })).status).toBe(400);
    expect((await post('/empresas/prospeccao', { chave: 'tel:4075550101', data_contato: '2026-02-30' })).status).toBe(400);
    expect((await post('/empresas/prospeccao', { chave: 'tel:4075550101', observacao: 'x'.repeat(1001) })).status).toBe(400);
    expect((await post('/empresas/prospeccao', { chave: 'tel:0000000000' })).status).toBe(400);
    expect((await post('/empresas/prospeccao', { chave: 'tel:4075550101', status_prospeccao: 'cliente' }, { Origin: 'https://evil.example' })).status).toBe(403);
    expect(d.prepare('SELECT COUNT(*) n FROM prospeccao').get()).toEqual({ n: 0 });
    const r = await post('/empresas/prospeccao', { chave: 'tel:4075550101', status_prospeccao: 'contatado', volta: '//evil.example/x' });
    expect(r.headers.get('Location')).toBe('/empresas?msg=Prospec%C3%A7%C3%A3o+salva.');
  });
  it('com Cloudflare Access configurado, escrita sem token é negada', async () => {
    const { post, d } = setup({ ACCESS_AUD: 'aud', ACCESS_TEAM_DOMAIN: 'time.cloudflareaccess.com' });
    expect((await post('/empresas/prospeccao', { chave: 'tel:4075550101', status_prospeccao: 'cliente' })).status).toBe(403);
    expect(d.prepare('SELECT COUNT(*) n FROM prospeccao').get()).toEqual({ n: 0 });
  });
});
