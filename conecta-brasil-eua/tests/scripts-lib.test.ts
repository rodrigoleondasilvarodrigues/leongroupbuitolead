import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { arquivosDaPasta, resolveFiles } from '../scripts/lib';

describe('scripts: arquivos da pasta do coletor', () => {
  const dir = mkdtempSync(join(tmpdir(), 'conecta-'));
  for (const n of ['grupos.csv', 'grupos_outros.csv', 'grupos.bak.csv', 'grupos.bak2.csv', 'grupos_outros.bak.csv',
    'leads_frank.csv', 'leads_empresas.csv', 'leads_frente1.csv', 'leads_extra.csv', 'staging_leads_f1.csv', 'staging_nichos.csv', 'contatos.csv']) {
    writeFileSync(join(dir, n), 'x\n');
  }
  it('usa grupos + leads_*; ignora *.bak*.csv e staging_*; lista os esperados que faltam', () => {
    const r = arquivosDaPasta(dir);
    expect(r.paths.map((p) => p.slice(dir.length + 1))).toEqual([
      'grupos.csv', 'grupos_outros.csv', 'leads_empresas.csv', 'leads_frente1.csv', 'leads_frank.csv', 'leads_extra.csv',
    ]);
    expect(r.ignorados.sort()).toEqual(['grupos.bak.csv', 'grupos.bak2.csv', 'grupos_outros.bak.csv', 'staging_leads_f1.csv', 'staging_nichos.csv']);
    expect(r.faltando.map((p) => p.slice(dir.length + 1))).toEqual(['leads_frente2.csv', 'leads_claudinho.csv']);
  });
  it('grupos_*.csv entram; com empresas_final.csv os leads_*.csv são ignorados', () => {
    const d2 = mkdtempSync(join(tmpdir(), 'conecta-'));
    for (const n of ['grupos.csv', 'grupos_outros.csv', 'grupos_staging2.csv', 'grupos_b.csv', 'grupos.bak4.csv', 'staging_grupos3.csv',
      'empresas_final.csv', 'leads_frank.csv', 'leads_frente2.csv.bak_clean']) writeFileSync(join(d2, n), 'x\n');
    const r = arquivosDaPasta(d2);
    expect(r.paths.map((p) => p.slice(d2.length + 1))).toEqual(['grupos.csv', 'grupos_outros.csv', 'grupos_b.csv', 'grupos_staging2.csv', 'empresas_final.csv']);
    expect(r.ignorados).toContain('leads_frank.csv (usando empresas_final.csv)');
    expect(r.ignorados).toContain('staging_grupos3.csv');
    expect(r.faltando).toEqual([]);
  });
  it('aceita pasta como argumento posicional e ignora backup passado explicitamente', () => {
    const r = resolveFiles([dir, join(dir, 'grupos.bak2.csv'), '--sql', 'out.sql']);
    expect(r.files).toHaveLength(6);
    expect(r.ignorados).toContain('grupos.bak2.csv');
    expect(r.rest).toEqual(['--sql', 'out.sql']);
  });
});
