-- Migração 02 — fluxo completo: 5 dias úteis, renovação, formulário ampliado
-- npx wrangler d1 execute leon-group --remote --file=migracao-02-fluxo.sql
ALTER TABLE clientes ADD COLUMN prazo_final TEXT;
ALTER TABLE clientes ADD COLUMN site_exportado_em TEXT;
ALTER TABLE clientes ADD COLUMN renovacao_em TEXT;
ALTER TABLE clientes ADD COLUMN renovado_vezes INTEGER DEFAULT 0;
ALTER TABLE clientes ADD COLUMN tempo_mercado TEXT;
ALTER TABLE clientes ADD COLUMN faz TEXT;
ALTER TABLE clientes ADD COLUMN nao_faz TEXT;
ALTER TABLE clientes ADD COLUMN localizacoes TEXT;
ALTER TABLE clientes ADD COLUMN leads_recebidos INTEGER DEFAULT 0;
ALTER TABLE clientes ADD COLUMN ultimo_resultado_em TEXT;
ALTER TABLE clientes ADD COLUMN lead_origem_id INTEGER;
