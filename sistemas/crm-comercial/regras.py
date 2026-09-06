"""
Regras de negócio do CRM Comercial da Leon Group.

Toda constante aqui saiu da transcrição das aulas 01-04 da mentoria.
Rastreabilidade: _memoria/historico/ESPECIFICACOES-SISTEMAS.md
"""

# ─────────────────────────────────────────────────────────────────────────────
# PIPELINE 1 — LEADS NOVOS
# Decaimento automático: a cada 24h sem resposta o lead desce um degrau,
# e o número de ativações diárias cai junto.
# ─────────────────────────────────────────────────────────────────────────────

LEADS_NOVOS = [
    # (coluna, rótulo, horas de permanência, ativações/dia)
    ("responderam", "Responderam",  24, 0),   # 0 = não ativa; o que se faz é LIGAR em <1min
    ("super_hot",   "Super Hot",    24, 10),
    ("hot",         "Hot",          24, 7),
    ("warm",        "Warm",         24, 5),
    ("cold",        "Cold",         24, 3),
    ("super_cold",  "Super Cold",   24, 2),
]

# ordem do decaimento (responderam fica fora: é entrada, não degrau)
ESCADA_DECAIMENTO = ["super_hot", "hot", "warm", "cold", "super_cold"]

ATIVACOES_POR_COLUNA = {c: a for c, _, _, a in LEADS_NOVOS}

# ─────────────────────────────────────────────────────────────────────────────
# CATÁLOGO DE ATIVAÇÕES — as 10 maneiras de ativar o lead
# Follow-up NÃO é venda: proibido ofertar, promover ou fazer marketing de oferta.
# O objetivo é só retomar o contato; a venda acontece na ligação.
# ─────────────────────────────────────────────────────────────────────────────

CATALOGO_ATIVACOES = [
    ("ligacao",              "Ligação",                      "Liga. Nunca 3x seguidas (risco de ban)."),
    ("audio",                "Áudio",                        "Áudio curto e natural."),
    ("audio_unico",          "Áudio de visualização única",  "Gera curiosidade por ser efêmero."),
    ("foto_unica",           "Foto de visualização única",   "Mesma lógica do áudio único."),
    ("figurinha",            "Figurinha",                    "Humaniza, quebra o padrão de texto."),
    ("emoji",                "Emoji",                        "Mínimo esforço de resposta."),
    ("mensagem",             "Mensagem de texto",            "Curta. Nada de 'puta texto'."),
    ("video_unico",          "Vídeo de visualização única",  "Variação do formato efêmero."),
    ("status_mencao",        "Menção em status",             "Aparece sem invadir a conversa."),
    # ⚠️ ATIVAÇÃO CONTROVERSA — incluída por decisão explícita do usuário.
    # A aula ensina enviar um comprovante de PIX FALSO para induzir a abertura;
    # ao abrir, o lead encontra uma foto pedindo retorno.
    # É um engodo: o documento simula uma transação financeira que não existe.
    # Risco real: quebra de confiança, denúncia por parte do lead e possível
    # violação dos termos do WhatsApp. Mantida no catálogo a seu pedido.
    ("comprovante_falso",    "Comprovante de PIX falso ⚠️",  "ENGODO — documento financeiro simulado para forçar abertura."),
]

ATIVACOES_VALIDAS = {k for k, _, _ in CATALOGO_ATIVACOES}

# ─────────────────────────────────────────────────────────────────────────────
# PIPELINE 2 — AGENDAMENTO
# ─────────────────────────────────────────────────────────────────────────────

AGENDAMENTO = [
    ("call_agendado", "Call Agendado"),
    ("call_rolando",  "Call Rolando"),
    ("no_show",       "No Show"),
    ("no_show_f1",    "No Show F1"),
    ("no_show_f2",    "No Show F2"),
    ("no_show_f3",    "No Show F3"),
    ("recusou",       "Recusou"),
]

# Cadência de confirmação — 6 pontos de contato, contados a partir do horário da call.
# T-30min NÃO é mensagem: é ligação humana.
CADENCIA_CONFIRMACAO = [
    (24 * 60, "mensagem", "confirmacao_T24"),
    ( 8 * 60, "mensagem", "confirmacao_T8"),
    ( 4 * 60, "mensagem", "confirmacao_T4"),
    ( 2 * 60, "mensagem", "confirmacao_T2"),
    ( 1 * 60, "mensagem", "confirmacao_T1"),
    (     30, "ligacao",  "confirmacao_T30min"),
]

# Conteúdo dos follows de confirmação — sorteados em ordem 100% aleatória.
# REGRA DURA: nunca perguntar se vai comparecer, nunca perguntar se "está tudo certo".
# Só AFIRMAR. Dar brecha é dar chance de desmarcar.
# VOCABULÁRIO: sempre "call", nunca "reunião".
TIPOS_CONFIRMACAO = [
    ("time_pronto",       "Afirma que o time já está preparado para a call."),
    ("conteudo_instagram","Envia um conteúdo do Instagram da agência, agregando valor."),
    ("foto_plano",        "Envia foto do time montando o plano."),
]

SCRIPT_T30MIN = (
    "Ligação humana. Falar: 'em 15 minutos a gente já vai deixar o link da nossa call' "
    "e 'faltando 5 minutos a gente entra'. Nunca perguntar se está tudo certo."
)

# No-show: gatilhos por tempo e padrão de disparo
NO_SHOW_FOLLOWS = [
    # (coluna destino, horas sem resposta para disparar, ligações, mensagens)
    ("no_show_f1", 3,  2, 2),   # padrão "2L e 2M"
    ("no_show_f2", 24, 2, 2),
    ("no_show_f3", 24, 2, 1),   # encerramento: 2 ligações + 1 mensagem
]

# ─────────────────────────────────────────────────────────────────────────────
# PIPELINES 3 e 4 — RECUPERAÇÃO e NUTRIÇÃO
# ─────────────────────────────────────────────────────────────────────────────

NUTRICAO_DIAS = 7      # follow-up infinito, mensagem gerada por IA, nunca oferta
RECUPERACAO_DIAS = 14  # lead que sumiu mesmo após o encerramento F3

DIAS_ATE_NUTRICAO = 5  # 5 colunas × 24h sem resposta em leads_novos

PIPELINES = {
    "leads_novos": [(c, r) for c, r, _, _ in LEADS_NOVOS],
    "agendamento": AGENDAMENTO,
    "recuperacao": [("recuperacao", "Recuperação")],
    "nutricao":    [("nutricao", "Nutrição")],
}

# ─────────────────────────────────────────────────────────────────────────────
# REGRAS GLOBAIS DE DISPARO (anti-ban) — inegociáveis
# ─────────────────────────────────────────────────────────────────────────────

MAX_LIGACOES_SEGUIDAS = 2          # nunca 3 seguidas
ESPACAMENTO_MSG_SEG = (5, 7)       # entre mensagens em volume
DIAS_SILENCIO_NUMERO_NOVO = 7      # número novo não dispara nada por 7 dias
SEG_BOAS_VINDAS = (15, 30)         # mensagem automática ao lead cair no WhatsApp
SEG_LIGAR_APOS_LEAD = 60           # ligar em menos de 1 minuto

# Janelas de atendimento (America/New_York — mercado é EUA)
JANELAS_LIGACAO = [
    ("17:00", "22:00", "melhor janela — 52% de taxa de atendimento"),
    ("07:00", "11:00", "segunda melhor janela"),
]

# ─────────────────────────────────────────────────────────────────────────────
# QUALIFICAÇÃO
# ─────────────────────────────────────────────────────────────────────────────

FATURAMENTO_MINIMO_USD = 20000   # dono/operador acima de US$20-30 mil/mês
ANCORA_BUDGET_USD = 10000        # ancorar em US$10 mil e deixar o lead subir

ROTEIRO_BANT = [
    ("rapport",   "Rapport — quanto melhor, mais vendas. Registrar o ponto de conexão (reusado no F1)."),
    ("budget",    "Budget — perguntar como foram os últimos 30 dias, ancorar em US$10 mil, deixar subir."),
    ("authority", "Authority — confirmar que é o decisor final e que estará na call."),
    ("need",      "Need — se precisa mesmo do serviço."),
    ("timeline",  "Timeline — se é para agora ou para o futuro."),
    ("agendamento", "Agendamento — ritual completo (2 janelas no mesmo dia, viva-voz, confirmação ao vivo)."),
]

RITUAL_AGENDAMENTO = [
    "Oferecer 2 janelas de horário no MESMO DIA",
    "Informar duração de ~40 minutos",
    "Pedir para colocar no viva-voz",
    "Pedir para abrir a conversa no WhatsApp",
    "Enviar a confirmação AO VIVO e checar se chegou",
    "Pedir o e-mail no chat 'para linkar com o nosso invite no Google Agenda'",
    "Instruir a baixar o Google Meet na App Store (sem criar conta)",
    "Avisar que faltando 5 minutos o closer já estará na sala",
    "Fechar pedindo compromisso: 'posso contar com a tua presença mesmo?'",
]

MAX_DIAS_AGENDAMENTO = 2   # nunca agendar para mais de 2 dias à frente
MAX_CALLS_POR_DIA = 3      # capacidade de uma pessoa sozinha

# ─────────────────────────────────────────────────────────────────────────────
# KPIs e diagnóstico de gargalo
# ─────────────────────────────────────────────────────────────────────────────

ETAPAS_FUNIL = ["ads", "whatsapp", "ligacao_atendida", "call_marcada", "call_comparecida", "call_fechada"]

DIAGNOSTICO_GARGALO = [
    ("whatsapp", "ligacao_atendida",
     "Muitos leads chegam no WhatsApp mas poucos atendem a ligação → o CRIATIVO está ruim."),
    ("call_marcada", "call_comparecida",
     "Marcam mas não comparecem → o SDR não gerou valor suficiente na qualificação."),
    ("call_comparecida", "call_fechada",
     "Comparecem mas não fecham → em 80% dos casos é o CLOSER."),
]

HORAS_RELATORIO = 2   # relatório automático de KPIs no WhatsApp a cada 2 horas
