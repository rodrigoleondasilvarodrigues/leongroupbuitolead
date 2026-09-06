-- Migração 05 — separa o contador de tentativas do admin (login) do contador
-- da rota pública do formulário. Antes os dois compartilhavam o mesmo balde:
-- 50 acessos com token errado ao formulário trancavam o DONO fora do admin.
ALTER TABLE tentativas_login ADD COLUMN escopo TEXT DEFAULT 'login';
UPDATE tentativas_login SET escopo='login' WHERE escopo IS NULL;
CREATE INDEX IF NOT EXISTS ix_login_esc ON tentativas_login(escopo, ip, em);
-- índices das rotas públicas: sem eles, cada abertura de formulário varria
-- a tabela clientes inteira (a mais larga do banco, 51 colunas).
CREATE INDEX IF NOT EXISTS ix_cli_token  ON clientes(formulario_token);
CREATE INDEX IF NOT EXISTS ix_cli_origem ON clientes(lead_origem_id);
