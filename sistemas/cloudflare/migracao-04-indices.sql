-- Migração 04 — índices que faltavam nas tabelas do operacional.
-- Sem eles, cada consulta por cliente_id varria a tabela inteira.
CREATE INDEX IF NOT EXISTS ix_mid  ON midias(cliente_id);
CREATE INDEX IF NOT EXISTS ix_post ON posts(cliente_id);
CREATE INDEX IF NOT EXISTS ix_marc ON marcos(cliente_id);
CREATE INDEX IF NOT EXISTS ix_lig  ON ligacoes(lead_id);
CREATE INDEX IF NOT EXISTS ix_evt  ON eventos(lead_id, tipo);
CREATE INDEX IF NOT EXISTS ix_msg_lead ON mensagens(lead_id);
CREATE INDEX IF NOT EXISTS ix_msg_cli  ON mensagens(cliente_id);
