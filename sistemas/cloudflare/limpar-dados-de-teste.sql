-- ═══════════════════════════════════════════════════════════════════
-- LIMPEZA DOS DADOS DE TESTE DO CRM
--
-- ⚠ NÃO RODE SEM DECIDIR. Este arquivo apaga dados de PRODUÇÃO e não tem
--   desfazer. Ele existe pronto para o dia em que o usuário disser "ok,
--   limpa", e não antes.
--
-- Rodar com:
--   cd sistemas/cloudflare
--   npx wrangler d1 execute leon-group --remote --file=limpar-dados-de-teste.sql
--
-- ═══════════════════════════════════════════════════════════════════
-- O QUE EXISTE HOJE NO BANCO DE PRODUÇÃO (inventário de 2026-09-10)
--
--   LEADS
--     #1  Richard Leon · RL HVAC · meta-ads · coluna fechou
--     #2  Teste Planos · (sem empresa) · site:direto · super_hot
--     #3  Marcos Oliveira · Oliveira Hardwood & Tile · site:TESTE-AO-VIVO
--     #4  Anderson Prado · Prado Painting & Drywall · site:TESTE-AO-VIVO-2
--
--   CLIENTES
--     #1  RL HVAC (veio do lead 1)
--     #2  Oliveira Hardwood & Tile (veio do lead 3)
--     #3  Prado Painting & Drywall (criado direto, com formulário respondido)
--
--   ENTRADAS: 2 lançamentos de US$ 2.500 no cliente 2
--   SAÍDAS: nenhuma
--   ATIVAÇÕES: 20 registros nos leads 1, 2 e 4
--   ARQUIVOS: nenhum
--
-- ⚠ O #1, Richard Leon / RL HVAC, NÃO foi criado por mim. Veio de "meta-ads"
--   e está em "fechou". Pode ser teste do usuário, pode ser pessoa real.
--   Por isso ele NÃO está na limpeza abaixo. Se for teste, descomente o
--   bloco no fim do arquivo.
--
-- ═══════════════════════════════════════════════════════════════════

-- Os arquivos no R2 NÃO são apagados por SQL. Se houver arquivo subido, ele
-- fica órfão ocupando espaço. Hoje a tabela está vazia, então não há o que
-- limpar; se houver no futuro, apague pelo admin antes de rodar isto.

-- ── clientes de teste e tudo que pende deles ──
DELETE FROM entradas   WHERE cliente_id IN (SELECT id FROM clientes WHERE slug IN
  ('oliveira-hardwood-tile','prado-painting-teste'));
DELETE FROM saidas     WHERE cliente_id IN (SELECT id FROM clientes WHERE slug IN
  ('oliveira-hardwood-tile','prado-painting-teste'));
DELETE FROM arquivos   WHERE cliente_id IN (SELECT id FROM clientes WHERE slug IN
  ('oliveira-hardwood-tile','prado-painting-teste'));
DELETE FROM midias     WHERE cliente_id IN (SELECT id FROM clientes WHERE slug IN
  ('oliveira-hardwood-tile','prado-painting-teste'));
DELETE FROM reviews    WHERE cliente_id IN (SELECT id FROM clientes WHERE slug IN
  ('oliveira-hardwood-tile','prado-painting-teste'));
DELETE FROM posts      WHERE cliente_id IN (SELECT id FROM clientes WHERE slug IN
  ('oliveira-hardwood-tile','prado-painting-teste'));
DELETE FROM marcos     WHERE cliente_id IN (SELECT id FROM clientes WHERE slug IN
  ('oliveira-hardwood-tile','prado-painting-teste'));
DELETE FROM checklist  WHERE cliente_id IN (SELECT id FROM clientes WHERE slug IN
  ('oliveira-hardwood-tile','prado-painting-teste'));
DELETE FROM entregaveis WHERE cliente_id IN (SELECT id FROM clientes WHERE slug IN
  ('oliveira-hardwood-tile','prado-painting-teste'));
DELETE FROM mensagens  WHERE cliente_id IN (SELECT id FROM clientes WHERE slug IN
  ('oliveira-hardwood-tile','prado-painting-teste'));
DELETE FROM eventos    WHERE cliente_id IN (SELECT id FROM clientes WHERE slug IN
  ('oliveira-hardwood-tile','prado-painting-teste'));
DELETE FROM clientes   WHERE slug IN ('oliveira-hardwood-tile','prado-painting-teste');

-- ── leads de teste e tudo que pende deles ──
-- Os três: o "Teste Planos" que eu criei verificando o clique no plano, e os
-- dois "TESTE-AO-VIVO" que eu criei para ele testar a pipeline.
DELETE FROM ativacoes WHERE lead_id IN (SELECT id FROM leads WHERE
  origem LIKE 'site:TESTE-AO-VIVO%' OR nome = 'Teste Planos');
DELETE FROM ligacoes  WHERE lead_id IN (SELECT id FROM leads WHERE
  origem LIKE 'site:TESTE-AO-VIVO%' OR nome = 'Teste Planos');
DELETE FROM mensagens WHERE lead_id IN (SELECT id FROM leads WHERE
  origem LIKE 'site:TESTE-AO-VIVO%' OR nome = 'Teste Planos');
DELETE FROM eventos   WHERE lead_id IN (SELECT id FROM leads WHERE
  origem LIKE 'site:TESTE-AO-VIVO%' OR nome = 'Teste Planos');
DELETE FROM leads     WHERE origem LIKE 'site:TESTE-AO-VIVO%' OR nome = 'Teste Planos';

-- ── a cotação de referência que eu deixei em 5,40 durante os testes ──
-- Não apago: ela é configuração e não dado de teste. Ajuste no Caixa quando
-- quiser, pelo botão "Atualizar cotação".

-- ═══════════════════════════════════════════════════════════════════
-- SE O RICHARD LEON / RL HVAC TAMBÉM FOR TESTE, descomente daqui para baixo.
-- ═══════════════════════════════════════════════════════════════════
-- DELETE FROM entradas    WHERE cliente_id IN (SELECT id FROM clientes WHERE slug='rl-hvac');
-- DELETE FROM saidas      WHERE cliente_id IN (SELECT id FROM clientes WHERE slug='rl-hvac');
-- DELETE FROM arquivos    WHERE cliente_id IN (SELECT id FROM clientes WHERE slug='rl-hvac');
-- DELETE FROM midias      WHERE cliente_id IN (SELECT id FROM clientes WHERE slug='rl-hvac');
-- DELETE FROM reviews     WHERE cliente_id IN (SELECT id FROM clientes WHERE slug='rl-hvac');
-- DELETE FROM posts       WHERE cliente_id IN (SELECT id FROM clientes WHERE slug='rl-hvac');
-- DELETE FROM marcos      WHERE cliente_id IN (SELECT id FROM clientes WHERE slug='rl-hvac');
-- DELETE FROM checklist   WHERE cliente_id IN (SELECT id FROM clientes WHERE slug='rl-hvac');
-- DELETE FROM entregaveis WHERE cliente_id IN (SELECT id FROM clientes WHERE slug='rl-hvac');
-- DELETE FROM mensagens   WHERE cliente_id IN (SELECT id FROM clientes WHERE slug='rl-hvac');
-- DELETE FROM eventos     WHERE cliente_id IN (SELECT id FROM clientes WHERE slug='rl-hvac');
-- DELETE FROM clientes    WHERE slug='rl-hvac';
-- DELETE FROM ativacoes   WHERE lead_id IN (SELECT id FROM leads WHERE empresa='RL HVAC');
-- DELETE FROM ligacoes    WHERE lead_id IN (SELECT id FROM leads WHERE empresa='RL HVAC');
-- DELETE FROM mensagens   WHERE lead_id IN (SELECT id FROM leads WHERE empresa='RL HVAC');
-- DELETE FROM eventos     WHERE lead_id IN (SELECT id FROM leads WHERE empresa='RL HVAC');
-- DELETE FROM leads       WHERE empresa='RL HVAC';
