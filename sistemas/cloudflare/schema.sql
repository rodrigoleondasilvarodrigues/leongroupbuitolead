-- Leon Group — banco único (D1)
-- Aplique com: npx wrangler d1 execute leon-group --remote --file=schema.sql

-- ─────────────── COMERCIAL: leads antes da venda ───────────────
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  empresa TEXT,
  nicho TEXT,
  faturamento_mensal TEXT,
  origem TEXT DEFAULT 'meta-ads',
  pipeline TEXT NOT NULL DEFAULT 'leads_novos',
  coluna TEXT NOT NULL DEFAULT 'super_hot',
  criado_em TEXT NOT NULL,
  entrou_coluna_em TEXT NOT NULL,
  ultima_resposta_em TEXT,
  atualizado_em TEXT NOT NULL,
  rapport TEXT, budget TEXT, authority TEXT, need TEXT, timeline TEXT,
  qualificado INTEGER DEFAULT 0,
  call_agendada_para TEXT,
  motivo_recusa TEXT,
  observacoes TEXT,
  -- controle comercial do contrato (preenchido no fechamento, reflete no operacional)
  tipo_contrato TEXT,              -- TCV (pagamento único) | MRR (mensal recorrente)
  valor_contrato TEXT,             -- TCV: valor total · MRR: valor da mensalidade
  duracao_meses INTEGER,           -- por quanto tempo o trabalho foi contratado
  renovacao_automatica INTEGER DEFAULT 0,
  servicos_extras TEXT,            -- serviço fora do escopo padrão, se houve
  valor_extras TEXT,
  arquivado INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS ativacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL, tipo TEXT NOT NULL,
  executada_em TEXT NOT NULL, respondeu INTEGER DEFAULT 0, nota TEXT
);
CREATE TABLE IF NOT EXISTS ligacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL, executada_em TEXT NOT NULL,
  atendeu INTEGER DEFAULT 0, nota TEXT
);
CREATE TABLE IF NOT EXISTS mensagens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER, cliente_id INTEGER, direcao TEXT NOT NULL,
  tipo TEXT, conteudo TEXT NOT NULL, criada_em TEXT NOT NULL,
  enviada_em TEXT, erro TEXT
);
CREATE TABLE IF NOT EXISTS eventos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER, cliente_id INTEGER, tipo TEXT NOT NULL,
  de TEXT, para TEXT, detalhe TEXT, criado_em TEXT NOT NULL
);

-- ─────────────── OPERACIONAL: clientes depois da venda ───────────────
CREATE TABLE IF NOT EXISTS clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE,
  nome_contato TEXT NOT NULL, empresa TEXT NOT NULL, nicho TEXT,
  data_entrada TEXT NOT NULL,
  email TEXT, plano TEXT, valor_pago TEXT, gateway_ref TEXT,
  nome_dono TEXT, cidade TEXT, estado TEXT, telefone TEXT,
  servicos TEXT, diferencial TEXT, observacoes TEXT,
  tem_logo INTEGER DEFAULT 0, cores TEXT,
  cor_primaria TEXT DEFAULT '#1B4965', cor_destaque TEXT DEFAULT '#F6AE2D',
  site_html TEXT,          -- site gerado, servido em /site/<slug>
  site_publicado INTEGER DEFAULT 0,
  formulario_em TEXT, formulario_token TEXT,   -- link público do formulário
  -- o formulário só abre depois destes dois: contrato assinado + pagamento confirmado
  contrato_assinado INTEGER DEFAULT 0, contrato_em TEXT,
  pagamento_confirmado INTEGER DEFAULT 0, pagamento_em TEXT,
  entrega_iniciada_em TEXT,        -- quando o formulário chegou: base dos 5 dias úteis
  prazo_final TEXT,                -- 5º dia útil contado da resposta do formulário
  vercel_url TEXT,                 -- onde o site foi publicado (Vercel, deploy manual)
  site_exportado_em TEXT,
  -- contrato de 3 meses: base do alerta de renovação
  renovacao_em TEXT,
  renovado_vezes INTEGER DEFAULT 0,
  -- do formulário (tudo que a aula pede)
  tempo_mercado TEXT,
  faz TEXT,                        -- o que faz
  nao_faz TEXT,                    -- o que NÃO faz (evita lead ruim)
  localizacoes TEXT,               -- cidades/regiões que atende
  -- resultado real do cliente, para a conversa de renovação
  leads_recebidos INTEGER DEFAULT 0,
  ultimo_resultado_em TEXT,
  lead_origem_id INTEGER,          -- de qual lead do comercial este cliente veio
  -- espelho do contrato fechado no comercial: a equipe precisa saber o que esperar
  tipo_contrato TEXT,              -- TCV | MRR
  valor_contrato TEXT,
  duracao_meses INTEGER,
  renovacao_automatica INTEGER DEFAULT 0,
  servicos_extras TEXT,
  valor_extras TEXT,
  criado_em TEXT NOT NULL, atualizado_em TEXT NOT NULL,
  arquivado INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS entregaveis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL, tipo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente', url TEXT, nota TEXT,
  atualizado_em TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS midias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL, tipo TEXT NOT NULL,
  caminho TEXT NOT NULL, descricao TEXT, criado_em TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL, texto TEXT NOT NULL, servico TEXT,
  foto_ref TEXT, postada INTEGER DEFAULT 0, postada_em TEXT, criado_em TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL, ordem INTEGER, tipo TEXT DEFAULT 'post',
  titulo TEXT, legenda TEXT, brief TEXT, criado_em TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS marcos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL, marco TEXT NOT NULL, prazo_dias INTEGER,
  concluido INTEGER DEFAULT 0, concluido_em TEXT, criado_em TEXT NOT NULL
);

-- ─────────────── controle ───────────────
CREATE TABLE IF NOT EXISTS config (chave TEXT PRIMARY KEY, valor TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS tentativas_login (
  id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT, em TEXT NOT NULL, ok INTEGER
);

CREATE INDEX IF NOT EXISTS ix_leads ON leads(pipeline, coluna, arquivado);
CREATE INDEX IF NOT EXISTS ix_leads_call ON leads(call_agendada_para);
CREATE INDEX IF NOT EXISTS ix_ativ ON ativacoes(lead_id);
CREATE INDEX IF NOT EXISTS ix_cli ON clientes(arquivado);
CREATE INDEX IF NOT EXISTS ix_cli_slug ON clientes(slug);
CREATE INDEX IF NOT EXISTS ix_ent ON entregaveis(cliente_id);
CREATE INDEX IF NOT EXISTS ix_rev ON reviews(cliente_id);
CREATE INDEX IF NOT EXISTS ix_login ON tentativas_login(ip, em);
