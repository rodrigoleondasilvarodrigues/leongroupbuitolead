-- Conecta Brasil-EUA: seção "Empresas" (lista de leads B2B) + coluna opcional `nicho` em grupos.
-- Compatível com bancos existentes: só ADICIONA coluna (com DEFAULT) e cria tabela nova.

-- 1) Grupos: nicho opcional (CSVs antigos sem a coluna continuam válidos; vazio = sem nicho)
ALTER TABLE grupos ADD COLUMN nicho TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_grupos_nicho ON grupos(nicho);

-- 2) Empresas (leads B2B)
--   chave      = 'tel:<dígitos>' (telefone comercial normalizado, sem o +1 dos EUA)
--                ou 'nome:<empresa>|<cidade>|<estado>' (minúsculas, sem espaços extras) quando não há telefone
--   chave_nome = sempre 'empresa|cidade|estado' normalizado (usado para casar um lead sem telefone
--                com o mesmo lead que depois ganhou telefone)
CREATE TABLE IF NOT EXISTS empresas (
  chave                  TEXT PRIMARY KEY,
  chave_nome             TEXT NOT NULL,
  empresa                TEXT NOT NULL,
  nicho                  TEXT NOT NULL DEFAULT '',
  cidade                 TEXT NOT NULL DEFAULT '',
  estado                 TEXT NOT NULL DEFAULT '',
  telefone_comercial     TEXT NOT NULL DEFAULT '',
  site                   TEXT NOT NULL DEFAULT '',
  instagram              TEXT NOT NULL DEFAULT '',
  facebook               TEXT NOT NULL DEFAULT '',
  google_nota            TEXT NOT NULL DEFAULT '',   -- '' ou número 0–5 (ex.: 4.7)
  google_avaliacoes      TEXT NOT NULL DEFAULT '',   -- '' ou inteiro
  indicio_brasileiro     TEXT NOT NULL DEFAULT '',   -- itens separados por '; ' (união ao mesclar)
  oportunidade_marketing TEXT NOT NULL DEFAULT '',
  fonte_url              TEXT NOT NULL DEFAULT '',   -- 1+ URLs separadas por espaço (união ao mesclar)
  data_coleta            TEXT NOT NULL DEFAULT '',
  criado_em              TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em          TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_empresas_nome ON empresas(chave_nome);
CREATE INDEX IF NOT EXISTS idx_empresas_local ON empresas(estado, cidade);
CREATE INDEX IF NOT EXISTS idx_empresas_nicho ON empresas(nicho);
