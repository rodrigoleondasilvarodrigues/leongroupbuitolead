-- Migração 13: contrato com preenchimento pelo cliente e aceite eletrônico.
-- npx wrangler d1 execute leon-group --remote --file=migracao-13-contrato.sql
--
-- O fluxo: o cliente fecha na call, o operador gera o link, o cliente abre,
-- preenche os dados legais dele, LÊ o contrato já preenchido com esses dados,
-- digita o nome completo e aceita. O aceite grava a prova e liga a chave de
-- `contrato_assinado`, que é o portão que já existia.
--
-- Por que não Google Forms: o formulário do Google devolve uma planilha, e
-- alguém teria que copiar da planilha para um documento à mão. Aqui o contrato
-- sai pronto porque os dados já estão no mesmo banco do resto.
--
-- ⚠ AVISO QUE NÃO PODE SER APAGADO DAQUI: o texto do contrato em
-- `src/contrato.js` é MINUTA, escrita por quem não é advogado. Prestador no
-- Brasil, cliente nos Estados Unidos, aceite eletrônico e lei aplicável são
-- exatamente o tipo de coisa que precisa de revisão profissional antes de
-- valer contra alguém. Ver a seção de aviso no próprio arquivo.

-- ── dados legais, preenchidos pelo cliente ──
-- Ficam separados de `cidade`/`estado`, que são a área de ATENDIMENTO dele e
-- alimentam o SEO local. O endereço do contrato costuma ser outro (a casa
-- dele), e misturar os dois colocaria o endereço residencial no site.
ALTER TABLE clientes ADD COLUMN razao_social TEXT;      -- nome legal da empresa ou da pessoa
ALTER TABLE clientes ADD COLUMN tipo_entidade TEXT;     -- LLC | Corp | Sole Proprietor | pessoa física
ALTER TABLE clientes ADD COLUMN endereco TEXT;
ALTER TABLE clientes ADD COLUMN endereco_cidade TEXT;
ALTER TABLE clientes ADD COLUMN endereco_estado TEXT;
ALTER TABLE clientes ADD COLUMN endereco_zip TEXT;
ALTER TABLE clientes ADD COLUMN email_contrato TEXT;    -- para onde vai a cópia do aceite

-- ── o link do formulário do contrato ──
-- Separado de `formulario_token`: aquele é o onboarding, que só abre DEPOIS do
-- contrato e do pagamento. Este vem antes, e é o primeiro contato do cliente
-- com o sistema.
ALTER TABLE clientes ADD COLUMN contrato_token TEXT;
ALTER TABLE clientes ADD COLUMN contrato_enviado_em TEXT;

-- ── a prova do aceite ──
-- Aceite eletrônico só vale como prova se registrar QUEM aceitou, QUANDO, DE
-- ONDE e, principalmente, QUAL TEXTO estava na tela. Sem a versão do texto, um
-- contrato editado depois torna o aceite inútil: ninguém consegue dizer com o
-- que a pessoa concordou.
ALTER TABLE clientes ADD COLUMN contrato_aceito_em TEXT;
ALTER TABLE clientes ADD COLUMN contrato_aceito_nome TEXT;   -- nome completo digitado
ALTER TABLE clientes ADD COLUMN contrato_aceito_ip TEXT;
ALTER TABLE clientes ADD COLUMN contrato_aceito_agente TEXT; -- navegador, para a trilha
ALTER TABLE clientes ADD COLUMN contrato_versao TEXT;        -- versão do texto aceito
ALTER TABLE clientes ADD COLUMN contrato_hash TEXT;          -- SHA-256 do texto exato

CREATE INDEX IF NOT EXISTS ix_cli_ctoken ON clientes(contrato_token);
