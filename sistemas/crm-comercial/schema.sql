-- CRM Comercial — Leon Group
-- Modelo de dados dos 4 pipelines

CREATE TABLE IF NOT EXISTS leads (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    nome                TEXT NOT NULL,
    telefone            TEXT NOT NULL,
    email               TEXT,
    empresa             TEXT,
    nicho               TEXT,
    faturamento_mensal  TEXT,          -- faixa declarada em USD
    origem              TEXT DEFAULT 'meta-ads',

    pipeline            TEXT NOT NULL DEFAULT 'leads_novos',
    coluna              TEXT NOT NULL DEFAULT 'super_hot',

    criado_em           TEXT NOT NULL,
    entrou_coluna_em    TEXT NOT NULL,   -- base do decaimento de 24h
    ultima_resposta_em  TEXT,
    atualizado_em       TEXT NOT NULL,

    -- qualificação BANT
    rapport             TEXT,            -- ponto de conexão, reusado no follow F1
    budget              TEXT,
    authority           TEXT,
    need                TEXT,
    timeline            TEXT,
    qualificado         INTEGER DEFAULT 0,

    -- agendamento
    call_agendada_para  TEXT,            -- ISO; base da cadência de confirmação
    call_duracao_min    INTEGER DEFAULT 40,

    motivo_recusa       TEXT,
    observacoes         TEXT,
    arquivado           INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ativacoes (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id       INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    tipo          TEXT NOT NULL,       -- ver CATALOGO_ATIVACOES em crm.py
    executada_em  TEXT NOT NULL,
    respondeu     INTEGER DEFAULT 0,
    nota          TEXT
);

CREATE TABLE IF NOT EXISTS mensagens (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id      INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    direcao      TEXT NOT NULL,        -- enviada | recebida
    canal        TEXT DEFAULT 'whatsapp',
    tipo         TEXT,                 -- boas_vindas | confirmacao_T24 | ... | nutricao | recuperacao
    conteudo     TEXT NOT NULL,
    criada_em    TEXT NOT NULL,
    enviada_em   TEXT,
    erro         TEXT
);

CREATE TABLE IF NOT EXISTS eventos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id    INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    tipo       TEXT NOT NULL,
    de         TEXT,
    para       TEXT,
    detalhe    TEXT,
    criado_em  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ligacoes (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id       INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    executada_em  TEXT NOT NULL,
    atendeu       INTEGER DEFAULT 0,
    duracao_seg   INTEGER,
    nota          TEXT
);

CREATE TABLE IF NOT EXISTS config (
    chave  TEXT PRIMARY KEY,
    valor  TEXT NOT NULL,
    nota   TEXT
);

CREATE INDEX IF NOT EXISTS idx_leads_pipeline ON leads(pipeline, coluna, arquivado);
CREATE INDEX IF NOT EXISTS idx_leads_call     ON leads(call_agendada_para);
CREATE INDEX IF NOT EXISTS idx_ativ_lead      ON ativacoes(lead_id, executada_em);
CREATE INDEX IF NOT EXISTS idx_msg_lead       ON mensagens(lead_id, criada_em);
CREATE INDEX IF NOT EXISTS idx_ev_lead        ON eventos(lead_id, criado_em);
