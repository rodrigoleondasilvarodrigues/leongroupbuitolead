-- Campos que o site novo do cliente usa e que o formulário não coletava.
--
-- `instagram`: o @ do perfil do cliente. Vira link no rodapé do site dele e
-- amarra o site ao perfil que a gente monta na mesma entrega.
--
-- `licenciado` e `segurado`: os dois selos de confiança do herói ("Licensed",
-- "Insured"). São CONDICIONAIS de propósito. O template do kit do Enrico
-- escreve "Licensed & Insured" fixo para todo cliente, e boa parte dos
-- contratistas brasileiros não tem license: publicar isso no site deles seria
-- alegação falsa em nome do cliente, feita por nós. Só aparece quem marcar.
--
-- Não entram aqui, porque já existem: email, razao_social e logo_slogan
-- (que é a tagline usada no site).
ALTER TABLE clientes ADD COLUMN instagram TEXT;
ALTER TABLE clientes ADD COLUMN licenciado INTEGER DEFAULT 0;
ALTER TABLE clientes ADD COLUMN segurado INTEGER DEFAULT 0;
