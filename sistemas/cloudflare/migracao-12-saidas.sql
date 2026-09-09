-- Migração 12: SAÍDAS, o outro lado do caixa.
-- npx wrangler d1 execute leon-group --remote --file=migracao-12-saidas.sql
--
-- Até aqui o sistema só sabia o que ENTRAVA. Custo existia num campo por
-- cliente (`clientes.custos_valor`), que não dá conta do que a operação
-- realmente gasta: anúncio, Z-API, domínio, ferramenta, contador, mentoria.
-- Nada disso é de um cliente só, e nada disso tinha onde ser registrado.
--
-- Com esta tabela o caixa fecha dos dois lados: entrou, saiu, sobrou.
--
-- `cliente_id` é opcional. Preenchido, o gasto é custo direto daquele cliente
-- e entra no lucro dele. Vazio, é custo da operação e entra só no caixa geral.
--
-- `custos_valor` do cliente continua no banco e continua contando, MAS só
-- enquanto aquele cliente não tiver saída lançada aqui. Na primeira saída
-- lançada para ele, o campo antigo é ignorado e a tela avisa. É o mesmo
-- padrão de `valor_pago` x `entradas`: o histórico não desaparece e não
-- é contado duas vezes.

CREATE TABLE IF NOT EXISTS saidas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  valor TEXT NOT NULL,             -- como foi digitado
  moeda TEXT NOT NULL,             -- USD | BRL
  -- Reais por dólar no dia do pagamento. A ferramenta é cobrada em dólar no
  -- cartão brasileiro: o real que saiu da conta depende da cotação daquele
  -- dia, não da de hoje. Mesma regra das entradas.
  cotacao TEXT,
  pago_em TEXT NOT NULL,           -- a data do dinheiro, não a do cadastro
  categoria TEXT NOT NULL,
  descricao TEXT,
  cliente_id INTEGER,              -- vazio = custo da operação
  -- Despesa que repete todo mês (Z-API, hospedagem, ferramenta). Marcada
  -- aqui, o caixa consegue dizer qual é o custo fixo mensal da operação.
  recorrente INTEGER DEFAULT 0,
  nota TEXT,
  criado_em TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_sai_data ON saidas(pago_em);
CREATE INDEX IF NOT EXISTS ix_sai_cli ON saidas(cliente_id);
CREATE INDEX IF NOT EXISTS ix_sai_cat ON saidas(categoria, pago_em);
