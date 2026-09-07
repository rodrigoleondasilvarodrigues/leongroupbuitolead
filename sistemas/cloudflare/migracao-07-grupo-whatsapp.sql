-- Link do grupo de WhatsApp do cliente.
-- O fluxo real da agência centraliza toda a comunicação num grupo criado
-- assim que o formulário chega. Sem campo, esse link vivia solto no celular.
ALTER TABLE clientes ADD COLUMN grupo_whatsapp TEXT;
