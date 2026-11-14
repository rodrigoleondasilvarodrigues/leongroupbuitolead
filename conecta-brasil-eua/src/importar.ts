// Importação mista: cada arquivo é classificado pelo cabeçalho (grupos x empresas) e validado pelo módulo certo.
import { detectTipo, validateMany, type ArquivoCsv, type MultiImportResult, type TipoCsv } from './csv';
import { validateManyEmpresas, type EmpresasMultiResult } from './empresas';

export interface ImportacaoResult {
  grupos: MultiImportResult;
  empresas: EmpresasMultiResult;
  /** arquivos com cabeçalho não reconhecido (ignorados) */
  ignorados: { nome: string; motivo: string }[];
  tipos: { nome: string; tipo: TipoCsv | null }[];
}

export function classificar(files: ArquivoCsv[]) {
  const tipos = files.map((f) => ({ nome: f.nome, tipo: f.texto.trim() ? detectTipo(f.texto) : null, vazio: !f.texto.trim() }));
  return {
    tipos,
    grupos: files.filter((_, i) => tipos[i].tipo === 'grupos'),
    empresas: files.filter((_, i) => tipos[i].tipo === 'empresas'),
    ignorados: tipos.filter((t) => !t.tipo).map((t) => ({
      nome: t.nome,
      motivo: t.vazio ? 'arquivo vazio' : 'cabeçalho não reconhecido (nem grupos: codigo,link,… nem empresas: empresa,telefone_comercial,…)',
    })),
  };
}

export function validateArquivos(files: ArquivoCsv[]): ImportacaoResult {
  const c = classificar(files);
  return {
    grupos: validateMany(c.grupos),
    empresas: validateManyEmpresas(c.empresas),
    ignorados: c.ignorados,
    tipos: c.tipos.map(({ nome, tipo }) => ({ nome, tipo })),
  };
}
