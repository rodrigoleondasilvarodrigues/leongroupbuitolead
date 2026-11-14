// Testes das heurísticas com fixtures SINTÉTICAS (ver tests/fixtures/README.md).
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { classifyInvitePage, checkInvite, nextStatus } from '../src/linkcheck';

const fx = (n: string) => readFileSync(new URL(`./fixtures/${n}`, import.meta.url), 'utf8');

describe('classifyInvitePage (fixtures sintéticas)', () => {
  it('página válida → ativo, com nome do grupo', () => {
    const r = classifyInvitePage(200, fx('synthetic-valid.html'));
    expect(r.result).toBe('ativo');
    expect(r.nome).toBe('Brasileiros em Orlando & Região (EXEMPLO)');
  });
  it('página genérica sem grupo → expirado', () => {
    expect(classifyInvitePage(200, fx('synthetic-revoked-generic.html')).result).toBe('expirado');
  });
  it('texto explícito de link redefinido → expirado', () => {
    expect(classifyInvitePage(200, fx('synthetic-revoked-text.html')).result).toBe('expirado');
  });
  it('HTML não reconhecido → indeterminado', () => {
    expect(classifyInvitePage(200, fx('synthetic-unknown.html')).result).toBe('indeterminado');
  });
  it('códigos HTTP', () => {
    expect(classifyInvitePage(404, '').result).toBe('expirado');
    expect(classifyInvitePage(429, '').result).toBe('indeterminado');
    expect(classifyInvitePage(503, fx('synthetic-valid.html')).result).toBe('indeterminado');
    expect(classifyInvitePage(200, '').result).toBe('indeterminado');
  });
  it('og:title vazio + botão de ação → expirado', () => {
    expect(classifyInvitePage(200, fx('synthetic-revoked-empty-title.html')).result).toBe('expirado');
  });
  it('botão de ação sem meta og:title → indeterminado (conservador)', () => {
    const html = fx('synthetic-revoked-empty-title.html').replace(/<meta property="og:title"[^>]*>/, '');
    expect(classifyInvitePage(200, html).result).toBe('indeterminado');
  });
});

describe('checkInvite', () => {
  it('faz apenas GET na página pública do convite, sem cookies', async () => {
    const fetcher = vi.fn(async () => new Response(fx('synthetic-valid.html'), { status: 200 }));
    const r = await checkInvite('EXEMPLOAAAAAAAAAAAAAAAA', fetcher);
    expect(r.result).toBe('ativo');
    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://chat.whatsapp.com/EXEMPLOAAAAAAAAAAAAAAAA');
    expect(init.method).toBe('GET');
    expect(JSON.stringify(init.headers)).not.toMatch(/cookie/i);
  });
  it('não faz requisição para código inválido', async () => {
    const fetcher = vi.fn();
    expect((await checkInvite('../../etc', fetcher)).result).toBe('indeterminado');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('erro de rede → indeterminado', async () => {
    const r = await checkInvite('EXEMPLOAAAAAAAAAAAAAAAA', async () => { throw new Error('boom'); });
    expect(r).toMatchObject({ result: 'indeterminado' });
  });
});

describe('nextStatus', () => {
  it('só expira após 2 resultados "expirado" seguidos', () => {
    expect(nextStatus('ativo', 0, 'expirado')).toEqual({ status: 'ativo', falhas: 1 });
    expect(nextStatus('ativo', 1, 'expirado')).toEqual({ status: 'expirado', falhas: 2 });
    expect(nextStatus('ativo', 1, 'ativo')).toEqual({ status: 'ativo', falhas: 0 });
    expect(nextStatus('indeterminado', 1, 'indeterminado')).toEqual({ status: 'indeterminado', falhas: 1 });
  });
});
