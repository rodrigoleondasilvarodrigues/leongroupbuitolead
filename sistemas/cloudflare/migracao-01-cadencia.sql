-- Migração 01 — trava de contrato/pagamento e cadência de 5 dias
-- Aplique com: npx wrangler d1 execute leon-group --remote --file=migracao-01-cadencia.sql
ALTER TABLE clientes ADD COLUMN contrato_assinado INTEGER DEFAULT 0;
ALTER TABLE clientes ADD COLUMN contrato_em TEXT;
ALTER TABLE clientes ADD COLUMN pagamento_confirmado INTEGER DEFAULT 0;
ALTER TABLE clientes ADD COLUMN pagamento_em TEXT;
ALTER TABLE clientes ADD COLUMN entrega_iniciada_em TEXT;
ALTER TABLE clientes ADD COLUMN vercel_url TEXT;
