-- Migração 03 — dados de contrato (TCV/MRR) no comercial e no operacional
-- npx wrangler d1 execute leon-group --remote --file=migracao-03-contrato.sql
ALTER TABLE leads ADD COLUMN tipo_contrato TEXT;
ALTER TABLE leads ADD COLUMN valor_contrato TEXT;
ALTER TABLE leads ADD COLUMN duracao_meses INTEGER;
ALTER TABLE leads ADD COLUMN renovacao_automatica INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN servicos_extras TEXT;
ALTER TABLE leads ADD COLUMN valor_extras TEXT;
ALTER TABLE clientes ADD COLUMN tipo_contrato TEXT;
ALTER TABLE clientes ADD COLUMN valor_contrato TEXT;
ALTER TABLE clientes ADD COLUMN duracao_meses INTEGER;
ALTER TABLE clientes ADD COLUMN renovacao_automatica INTEGER DEFAULT 0;
ALTER TABLE clientes ADD COLUMN servicos_extras TEXT;
ALTER TABLE clientes ADD COLUMN valor_extras TEXT;
