-- Lead vindo do site: liga o preenchimento PARCIAL ao envio completo.
-- Sem isso, quem começa o formulário, para no meio e volta depois vira
-- dois leads separados no CRM. A sessão do site é o fio que costura os dois.
ALTER TABLE leads ADD COLUMN sessao_site TEXT;

-- Índice único parcial: uma sessão do site = no máximo um lead.
-- O "WHERE ... IS NOT NULL" deixa de fora todo lead que não veio do site.
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_sessao_site
  ON leads(sessao_site) WHERE sessao_site IS NOT NULL;
