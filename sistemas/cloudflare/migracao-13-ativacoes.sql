-- Migração 13 — ativação com checklist e playbook.
-- npx wrangler d1 execute leon-group --remote --file=migracao-13-ativacoes.sql
--
-- O QUE MUDA NO COMPORTAMENTO
--
-- Antes: clicar numa ativação REGISTRAVA na hora. O botão era "eu fiz isso",
-- e o operador tinha que inventar o conteúdo por fora, do zero, toda vez.
--
-- Agora: clicar ABRE o playbook daquela ativação, já personalizado com o nome
-- e a empresa do lead: o que escrever, o que falar no áudio, quais emojis, a
-- direção da foto de visualização única e o prompt de imagem pronto para
-- colar no gerador. Registrar é um segundo clique, depois de mandar.
--
-- Separar "abrir" de "registrar" é o ponto: registrar no clique de abrir
-- enchia o histórico de ativações que nunca foram mandadas, e o checklist
-- passava a mentir sobre o que já foi feito.
--
-- A tabela `ativacoes` já existia e não muda de forma. O checklist é DERIVADO
-- dela (agrupando por tipo), então não há estado duplicado para divergir.

-- Quantas vezes o operador abriu o playbook sem registrar o envio. Serve para
-- o card dizer "você abriu isso 3 vezes e nunca mandou", que é sinal de
-- ativação que não está funcionando para ele.
ALTER TABLE ativacoes ADD COLUMN aberto_em TEXT;

-- Onde o lead estava quando a ativação foi mandada. Sem isso não há como saber
-- se a ativação que funciona no super hot é a mesma que funciona na nutrição,
-- e essa é a única pergunta que faz o catálogo evoluir.
ALTER TABLE ativacoes ADD COLUMN coluna_na_hora TEXT;
ALTER TABLE ativacoes ADD COLUMN pipeline_na_hora TEXT;

-- O conteúdo exato que saiu. O playbook é um modelo; o que o operador mandou
-- de verdade pode ter sido editado. Guardar o que saiu é o que permite, mais
-- tarde, comparar qual redação trouxe resposta.
ALTER TABLE ativacoes ADD COLUMN conteudo_enviado TEXT;

CREATE INDEX IF NOT EXISTS ix_ativ_tipo ON ativacoes(lead_id, tipo);
CREATE INDEX IF NOT EXISTS ix_ativ_col ON ativacoes(coluna_na_hora, tipo);
