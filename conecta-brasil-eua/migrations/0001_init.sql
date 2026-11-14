-- Conecta Brasil-EUA: tabela de grupos (chave = codigo do convite)
CREATE TABLE IF NOT EXISTS grupos (
  codigo            TEXT PRIMARY KEY,
  link              TEXT NOT NULL,
  nome_grupo        TEXT NOT NULL,
  estado            TEXT NOT NULL,
  cidade            TEXT NOT NULL DEFAULT '',
  categoria         TEXT NOT NULL,
  fonte_url         TEXT NOT NULL DEFAULT '',
  data_coleta       TEXT NOT NULL DEFAULT '',
  status            TEXT NOT NULL DEFAULT 'indeterminado'
                    CHECK (status IN ('ativo','expirado','indeterminado')),
  ultima_validacao  TEXT NOT NULL DEFAULT '',
  -- quantas verificações seguidas indicaram link revogado (expira com >= 2)
  falhas_seguidas   INTEGER NOT NULL DEFAULT 0,
  criado_em         TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_grupos_status ON grupos(status);
CREATE INDEX IF NOT EXISTS idx_grupos_estado ON grupos(estado, cidade);
CREATE INDEX IF NOT EXISTS idx_grupos_categoria ON grupos(categoria);
CREATE INDEX IF NOT EXISTS idx_grupos_validacao ON grupos(ultima_validacao);
