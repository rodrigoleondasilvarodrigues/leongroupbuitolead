-- Operação de Entrega — Leon Group
-- Cadastro do cliente fechado + rastreamento dos 4 entregáveis

CREATE TABLE IF NOT EXISTS clientes (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    -- registro do Closer (preenchido ainda em call, logo após o pagamento)
    nome_contato      TEXT NOT NULL,
    empresa           TEXT NOT NULL,
    nicho             TEXT,
    data_entrada      TEXT NOT NULL,
    -- webhook do gateway
    email             TEXT,
    plano             TEXT,
    valor_pago        TEXT,
    gateway_ref       TEXT,
    -- formulário do cliente
    servicos          TEXT,      -- todos os serviços que presta, em detalhe
    diferencial       TEXT,
    observacoes       TEXT,
    cidade            TEXT,      -- usada nas reviews (SEO local)
    estado            TEXT,
    nome_dono         TEXT,      -- repetido nas reviews
    telefone          TEXT,
    tem_logo          INTEGER DEFAULT 0,
    cores             TEXT,      -- se não tem logo, as cores desejadas
    formulario_em     TEXT,      -- quando o cliente respondeu
    -- controle
    criado_em         TEXT NOT NULL,
    atualizado_em     TEXT NOT NULL,
    arquivado         INTEGER DEFAULT 0
);

-- Os 4 entregáveis oficiais: GMB, site, Instagram, logo
CREATE TABLE IF NOT EXISTS entregaveis (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id   INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    tipo         TEXT NOT NULL,     -- gmb | site | instagram | logo
    status       TEXT NOT NULL DEFAULT 'pendente',  -- pendente | em_producao | entregue | aprovado
    url          TEXT,
    nota         TEXT,
    atualizado_em TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS midias (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id  INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    tipo        TEXT NOT NULL,      -- foto | video
    caminho     TEXT NOT NULL,
    descricao   TEXT,               -- que serviço aparece — alimenta a review
    criado_em   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id  INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    texto       TEXT NOT NULL,
    servico     TEXT,
    foto_ref    TEXT,               -- foto que quem postar deve anexar
    postada     INTEGER DEFAULT 0,
    postada_em  TEXT,
    criado_em   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id  INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    ordem       INTEGER,
    tipo        TEXT DEFAULT 'post',  -- post | destaque
    titulo      TEXT,
    legenda     TEXT,
    brief       TEXT,
    criado_em   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS marcos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id  INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    marco       TEXT NOT NULL,
    prazo_dias  INTEGER,
    concluido   INTEGER DEFAULT 0,
    concluido_em TEXT,
    criado_em   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ent_cli ON entregaveis(cliente_id);
CREATE INDEX IF NOT EXISTS idx_rev_cli ON reviews(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pos_cli ON posts(cliente_id);
