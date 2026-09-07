-- Checklist de otimização por cliente.
-- Nasce junto com os marcos, quando o cliente responde o formulário.
-- A entrega não fecha enquanto os itens OBRIGATÓRIOS não estiverem feitos.
CREATE TABLE IF NOT EXISTS checklist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  area TEXT NOT NULL,              -- gbp | site | instagram | logo | geral
  item TEXT NOT NULL,              -- o que conferir
  detalhe TEXT,                    -- como fazer, o passo a passo
  obrigatorio INTEGER DEFAULT 1,   -- 0 = recomendado, não trava a entrega
  feito INTEGER DEFAULT 0,
  feito_em TEXT,
  ordem INTEGER,
  criado_em TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_chk ON checklist(cliente_id, area);
