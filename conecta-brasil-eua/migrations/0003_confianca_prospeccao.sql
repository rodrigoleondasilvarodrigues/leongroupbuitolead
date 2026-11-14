-- Conecta Brasil-EUA: empresas_final.csv (confiança + arquivo de origem) e prospecção editável no site.
-- Só ADICIONA colunas/tabela: compatível com bancos existentes.

-- 1) Empresas: confiança de que é brasileira ('alta' | 'media' | 'baixa'; '' = não classificada, CSVs antigos)
--    e arquivo(s) de origem (itens separados por ' | ', união ao mesclar)
ALTER TABLE empresas ADD COLUMN confianca_brasileira TEXT NOT NULL DEFAULT '';
ALTER TABLE empresas ADD COLUMN arquivo_origem TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_empresas_confianca ON empresas(confianca_brasileira);

-- 2) Prospecção: tabela SEPARADA, chaveada pela mesma chave de deduplicação da empresa (empresas.chave).
--    O importador nunca grava aqui (só migra a chave quando um lead 'nome:…' ganha telefone 'tel:…'),
--    então reimportar CSVs não apaga nem sobrescreve o status.
CREATE TABLE IF NOT EXISTS prospeccao (
  empresa_chave       TEXT PRIMARY KEY,
  status_prospeccao   TEXT NOT NULL DEFAULT 'nao_contatado'
                      CHECK (status_prospeccao IN ('nao_contatado','contatado','respondeu','cliente')),
  data_contato        TEXT NOT NULL DEFAULT '',
  observacao          TEXT NOT NULL DEFAULT '',
  prosp_atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_prospeccao_status ON prospeccao(status_prospeccao);
