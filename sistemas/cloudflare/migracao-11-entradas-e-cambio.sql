-- Migração 11 — o que ENTROU na empresa, entrada por entrada, com câmbio.
-- npx wrangler d1 execute leon-group --remote --file=migracao-11-entradas-e-cambio.sql
--
-- Por que uma tabela nova em vez de esticar `clientes.valor_pago`:
--
-- 1. `valor_pago` é UM campo. Contrato MRR recebe todo mês, e o segundo e o
--    terceiro pagamento não tinham onde ser registrados. "Quanto entrou na
--    empresa" era impossível de responder para contrato recorrente.
-- 2. A operação fatura em DÓLAR e o fundador vive em REAL. O real que ele
--    recebeu de verdade depende da cotação do dia em que aquele dinheiro foi
--    convertido, não da cotação de hoje. Sem guardar a cotação por entrada, o
--    total em real muda sozinho a cada vez que a tela é aberta, e isso não é
--    faturamento, é ficção.
-- 3. Data da entrada é o que permite ver o mês a mês.
--
-- `clientes.valor_pago` continua existindo e continua sendo o resumo do card.
-- Quando um cliente antigo tem valor_pago sem nenhuma entrada aqui, o
-- dashboard conta esse valor como UMA entrada implícita e diz na tela que
-- fez isso, para nada desaparecer do histórico.

CREATE TABLE IF NOT EXISTS entradas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  valor TEXT NOT NULL,           -- como foi digitado: "US$ 2.500", "3400"
  moeda TEXT NOT NULL,           -- USD | BRL, escolhida na tela
  -- Reais por dólar NO DIA EM QUE ESSE DINHEIRO ENTROU. Em branco quando não
  -- se sabe: aí o dashboard usa a cotação de referência e marca como estimado.
  cotacao TEXT,
  recebido_em TEXT NOT NULL,     -- a data do dinheiro, não a do cadastro
  meio TEXT,                     -- Wise, Zelle, PIX, transferência, cheque
  parcela TEXT,                  -- "entrada", "mês 2 de 6", "parcela 1 de 3"
  nota TEXT,
  criado_em TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_ent_cli ON entradas(cliente_id, recebido_em);
CREATE INDEX IF NOT EXISTS ix_ent_data ON entradas(recebido_em);

-- Custo também tem moeda própria: a ferramenta é cobrada em dólar, o contador
-- e o freela em real. Somar os dois num campo só daria um número que não
-- existe. `custos_valor` já carrega o símbolo no texto; isto guarda a moeda
-- explícita para não depender de o símbolo ter sido digitado.
ALTER TABLE clientes ADD COLUMN custos_moeda TEXT;
