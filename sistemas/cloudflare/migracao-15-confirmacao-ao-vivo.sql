-- A confirmação ao vivo do roteiro da Aula 03: os seis passos que o SDR faz
-- com o lead AINDA NO TELEFONE (viva-voz, abrir o WhatsApp, receber a
-- confirmação, mandar o e-mail, explicar o Meet, pegar o compromisso).
--
-- Guardado como lista de ids separada por vírgula. Serve para duas coisas:
-- o card lembrar o que já foi feito, e o diagnóstico de no-show conseguir
-- responder "esse lead que não apareceu teve confirmação ao vivo ou não?".
ALTER TABLE leads ADD COLUMN confirmacao_ao_vivo TEXT;
