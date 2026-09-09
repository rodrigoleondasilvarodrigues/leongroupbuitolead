-- Migração 10 — briefing de logo, arquivos de verdade, portão de conclusão
-- e o financeiro real (contratado, recebido, custos, lucro).
-- npx wrangler d1 execute leon-group --remote --file=migracao-10-logo-arquivos-e-financeiro.sql

-- ─────────── BRIEFING DA LOGO ───────────
-- O formulário só perguntava "quais cores você gostaria". Isso não dá pra
-- gerar logo nenhuma. Estes campos são a REFERÊNCIA que o cliente dá, e é
-- deles que sai o prompt JSON do gpt-image-2.
ALTER TABLE clientes ADD COLUMN logo_estilo TEXT;        -- moderna, clássica, robusta, minimalista...
ALTER TABLE clientes ADD COLUMN logo_simbolo TEXT;       -- o que ele quer ver no símbolo
ALTER TABLE clientes ADD COLUMN logo_evitar TEXT;        -- o que ele NÃO quer
ALTER TABLE clientes ADD COLUMN logo_referencias TEXT;   -- marcas/links que ele gosta
ALTER TABLE clientes ADD COLUMN logo_texto TEXT;         -- o texto exato que vai na logo
ALTER TABLE clientes ADD COLUMN logo_slogan TEXT;        -- slogan, se ele quiser um
ALTER TABLE clientes ADD COLUMN logo_prompt TEXT;        -- último prompt gerado (para não reescrever)
ALTER TABLE clientes ADD COLUMN logo_prompt_em TEXT;

-- ─────────── PORTÃO DE CONCLUSÃO ───────────
-- Antes, "concluído" era uma conta invisível em três lugares e não havia como
-- fechar um cliente entregue adiantado. Estes campos deixam a decisão explícita
-- e AUDITÁVEL: quem forçou, quando, e o que estava aberto na hora.
ALTER TABLE clientes ADD COLUMN entrega_concluida_em TEXT;
ALTER TABLE clientes ADD COLUMN entrega_forcada INTEGER DEFAULT 0;
ALTER TABLE clientes ADD COLUMN entrega_forcada_nota TEXT;      -- justificativa escrita
ALTER TABLE clientes ADD COLUMN entrega_forcada_pendencias TEXT; -- o que ficou aberto, congelado no momento do clique

-- ─────────── FINANCEIRO REAL ───────────
-- "Vendido" e "lucro" são números diferentes. O CRM já separava contratado de
-- recebido; faltava o que sai do recebido antes de virar lucro.
ALTER TABLE clientes ADD COLUMN taxa_percentual TEXT;   -- taxa do gateway/câmbio, em %
ALTER TABLE clientes ADD COLUMN custos_valor TEXT;      -- custo direto do cliente (ferramenta, freela)
ALTER TABLE clientes ADD COLUMN custos_nota TEXT;       -- o que é esse custo

-- ─────────── ARQUIVOS (R2) ───────────
-- Tabela nova em vez de esticar `midias`: `midias` guarda CAMINHO de coisa que
-- veio de fora (link do Drive). Aqui o arquivo mora no R2, tem dono, destino,
-- tamanho e tipo, e precisa ser apagável de verdade (objeto + linha).
--
-- destino  = para onde a peça vai (logo | instagram | gmb | site | entrega)
-- slot     = qual peça dentro do destino (ver CATALOGO_ARQUIVOS em arquivos.js)
-- origem   = 'cliente' (subiu no formulário) | 'agencia' (subiu no admin)
CREATE TABLE IF NOT EXISTS arquivos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  chave TEXT NOT NULL UNIQUE,      -- caminho do objeto no R2
  nome TEXT,                       -- nome original, só para exibir
  mime TEXT,
  bytes INTEGER,
  destino TEXT NOT NULL DEFAULT 'entrega',
  slot TEXT,
  origem TEXT NOT NULL DEFAULT 'agencia',
  largura INTEGER, altura INTEGER,
  criado_em TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_arq ON arquivos(cliente_id, destino);
CREATE UNIQUE INDEX IF NOT EXISTS ix_arq_chave ON arquivos(chave);

-- Eventos consultados pelo funil do dashboard. Sem este índice, cada abertura
-- do dashboard varria a tabela eventos inteira três vezes.
CREATE INDEX IF NOT EXISTS ix_evt_tipo ON eventos(tipo, lead_id);
