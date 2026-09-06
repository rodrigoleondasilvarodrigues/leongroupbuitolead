#!/usr/bin/env python3
"""
CRM Comercial — Leon Group
Rode com:  python3 crm.py     →  http://localhost:8770

Sem dependências externas: stdlib + SQLite.
Integrações (Z-API e OpenAI) funcionam em modo simulado até você colocar as chaves
no arquivo .env ao lado deste script.
"""
import json, os, re, sqlite3, random, threading, time, urllib.request, urllib.error
from datetime import datetime, timedelta, timezone
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

import regras as R

AQUI = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(AQUI, "crm.db")
PORTA = int(os.environ.get("PORTA", "8770"))

# ──────────────────────────────── .env ────────────────────────────────
def carregar_env():
    caminho = os.path.join(AQUI, ".env")
    if not os.path.exists(caminho):
        return
    for linha in open(caminho, encoding="utf-8"):
        linha = linha.strip()
        if not linha or linha.startswith("#") or "=" not in linha:
            continue
        k, v = linha.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip())

carregar_env()
ZAPI_INSTANCIA = os.environ.get("ZAPI_INSTANCIA", "")
ZAPI_TOKEN     = os.environ.get("ZAPI_TOKEN", "")
ZAPI_CLIENT    = os.environ.get("ZAPI_CLIENT_TOKEN", "")
OPENAI_KEY     = os.environ.get("OPENAI_API_KEY", "")
MODO_SIMULADO  = not (ZAPI_INSTANCIA and ZAPI_TOKEN)

# ──────────────────────────────── util ────────────────────────────────
def agora():
    return datetime.now(timezone.utc).isoformat()

def dt(s):
    if not s: return None
    try: return datetime.fromisoformat(s)
    except Exception: return None

def horas_desde(s):
    d = dt(s)
    if not d: return 0.0
    return (datetime.now(timezone.utc) - d).total_seconds() / 3600.0

def conectar():
    c = sqlite3.connect(DB, timeout=30)
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA foreign_keys = ON")
    return c

def init_db():
    novo = not os.path.exists(DB)
    c = conectar()
    c.executescript(open(os.path.join(AQUI, "schema.sql"), encoding="utf-8").read())
    padroes = [
        ("numero_ativado_em", "", "quando o número novo entrou em operação (base dos 7 dias de silêncio)"),
        ("relatorio_whatsapp", "", "número que recebe o relatório de KPIs a cada 2h"),
        ("horas_relatorio", str(R.HORAS_RELATORIO), "intervalo do relatório automático"),
        ("dias_ate_nutricao", str(R.DIAS_ATE_NUTRICAO), "dias sem resposta até cair na nutrição"),
        ("nutricao_dias", str(R.NUTRICAO_DIAS), "cadência da nutrição"),
        ("recuperacao_dias", str(R.RECUPERACAO_DIAS), "cadência da recuperação"),
    ]
    for k, v, nota in padroes:
        c.execute("INSERT OR IGNORE INTO config (chave,valor,nota) VALUES (?,?,?)", (k, v, nota))
    c.commit(); c.close()
    if novo: print(f"[db] criado em {DB}")

def cfg(chave, padrao=""):
    c = conectar()
    r = c.execute("SELECT valor FROM config WHERE chave=?", (chave,)).fetchone()
    c.close()
    return r["valor"] if r and r["valor"] else padrao

def evento(c, lead_id, tipo, de=None, para=None, detalhe=None):
    c.execute("INSERT INTO eventos (lead_id,tipo,de,para,detalhe,criado_em) VALUES (?,?,?,?,?,?)",
              (lead_id, tipo, de, para, detalhe, agora()))

# ────────────────────────── integrações ──────────────────────────
def variar_mensagem(texto, contexto=""):
    """Reescreve a mensagem via OpenAI para que nunca saiam duas idênticas."""
    if not OPENAI_KEY:
        sufixos = ["", " ", "​"]
        return texto + random.choice(sufixos)
    corpo = json.dumps({
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content":
             "Reescreva a mensagem mantendo exatamente a mesma intenção e informação, mudando "
             "as palavras e o ritmo. Português brasileiro, tom natural de WhatsApp, curto. "
             "NUNCA faça oferta, promoção ou tentativa de venda. Responda só com a mensagem."},
            {"role": "user", "content": f"{contexto}\n\nMensagem: {texto}"},
        ],
        "temperature": 1.0,
    }).encode()
    req = urllib.request.Request("https://api.openai.com/v1/chat/completions", data=corpo,
        headers={"Authorization": f"Bearer {OPENAI_KEY}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"[openai] falhou, usando texto original: {e}")
        return texto

def enviar_whatsapp(telefone, texto):
    """Envia via Z-API. Em modo simulado, só registra."""
    if MODO_SIMULADO:
        print(f"[simulado] → {telefone}: {texto[:80]}")
        return True, None
    url = f"https://api.z-api.io/instances/{ZAPI_INSTANCIA}/token/{ZAPI_TOKEN}/send-text"
    corpo = json.dumps({"phone": re.sub(r"\D", "", telefone), "message": texto}).encode()
    h = {"Content-Type": "application/json"}
    if ZAPI_CLIENT: h["Client-Token"] = ZAPI_CLIENT
    try:
        with urllib.request.urlopen(urllib.request.Request(url, data=corpo, headers=h), timeout=30) as r:
            r.read(); return True, None
    except Exception as e:
        return False, str(e)

def numero_liberado():
    """Número novo fica 7 dias sem disparar nada (regra anti-ban)."""
    d = dt(cfg("numero_ativado_em"))
    if not d: return True
    return (datetime.now(timezone.utc) - d).days >= R.DIAS_SILENCIO_NUMERO_NOVO

def enfileirar(c, lead_id, tipo, texto, contexto=""):
    """Cria a mensagem, varia por IA e envia respeitando o espaçamento de 5-7s."""
    lead = c.execute("SELECT telefone FROM leads WHERE id=?", (lead_id,)).fetchone()
    if not lead: return
    if not numero_liberado():
        c.execute("INSERT INTO mensagens (lead_id,direcao,tipo,conteudo,criada_em,erro) VALUES (?,?,?,?,?,?)",
                  (lead_id, "enviada", tipo, texto, agora(), "bloqueada: numero em periodo de silencio"))
        return
    final = variar_mensagem(texto, contexto)
    time.sleep(random.uniform(*R.ESPACAMENTO_MSG_SEG))
    ok, err = enviar_whatsapp(lead["telefone"], final)
    c.execute("INSERT INTO mensagens (lead_id,direcao,tipo,conteudo,criada_em,enviada_em,erro) VALUES (?,?,?,?,?,?,?)",
              (lead_id, "enviada", tipo, final, agora(), agora() if ok else None, err))
    evento(c, lead_id, "mensagem_enviada", para=tipo, detalhe=final[:200])

# ────────────────────────── motor de automação ──────────────────────────
def mover(c, lead, coluna, pipeline=None, motivo=""):
    pipeline = pipeline or lead["pipeline"]
    c.execute("UPDATE leads SET pipeline=?, coluna=?, entrou_coluna_em=?, atualizado_em=? WHERE id=?",
              (pipeline, coluna, agora(), agora(), lead["id"]))
    evento(c, lead["id"], "moveu", de=f'{lead["pipeline"]}/{lead["coluna"]}',
           para=f"{pipeline}/{coluna}", detalhe=motivo)

def tick():
    """Roda a cada minuto: decaimento, nutrição, cadência de confirmação, no-show."""
    c = conectar()
    try:
        _tick_decaimento(c)
        _tick_confirmacao(c)
        _tick_no_show(c)
        _tick_nutricao_recuperacao(c)
        c.commit()
    except Exception as e:
        print(f"[tick] erro: {e}")
    finally:
        c.close()

def _tick_decaimento(c):
    """A cada 24h sem resposta, desce um degrau da régua de temperatura."""
    limite = int(cfg("dias_ate_nutricao", str(R.DIAS_ATE_NUTRICAO)))
    for lead in c.execute("SELECT * FROM leads WHERE pipeline='leads_novos' AND arquivado=0").fetchall():
        if horas_desde(lead["entrou_coluna_em"]) < 24:
            continue
        col = lead["coluna"]
        if col == "responderam":
            mover(c, lead, "super_hot", motivo="24h sem evolução em 'responderam'")
            continue
        if col not in R.ESCADA_DECAIMENTO:
            continue
        i = R.ESCADA_DECAIMENTO.index(col)
        if i + 1 < len(R.ESCADA_DECAIMENTO):
            prox = R.ESCADA_DECAIMENTO[i + 1]
            mover(c, lead, prox, motivo=f"decaimento automático 24h ({col} → {prox})")
        else:
            # esgotou os 5 dias sem resposta → nutrição
            mover(c, lead, "nutricao", pipeline="nutricao",
                  motivo=f"{limite} dias sem resposta — vai para nutrição")

def _tick_confirmacao(c):
    """Cadência de confirmação da call: T-24h, T-8h, T-4h, T-2h, T-1h (msg) e T-30min (ligação)."""
    for lead in c.execute(
        "SELECT * FROM leads WHERE pipeline='agendamento' AND coluna='call_agendado' "
        "AND call_agendada_para IS NOT NULL AND arquivado=0").fetchall():
        alvo = dt(lead["call_agendada_para"])
        if not alvo: continue
        faltam_min = (alvo - datetime.now(timezone.utc)).total_seconds() / 60
        if faltam_min < 0: continue
        for minutos, modo, tipo in R.CADENCIA_CONFIRMACAO:
            if not (minutos - 3 <= faltam_min <= minutos + 3):
                continue
            ja = c.execute("SELECT 1 FROM mensagens WHERE lead_id=? AND tipo=?", (lead["id"], tipo)).fetchone()
            if ja: continue
            if modo == "ligacao":
                c.execute("INSERT INTO mensagens (lead_id,direcao,tipo,conteudo,criada_em) VALUES (?,?,?,?,?)",
                          (lead["id"], "enviada", tipo, f"[TAREFA HUMANA] {R.SCRIPT_T30MIN}", agora()))
                evento(c, lead["id"], "tarefa_ligacao", para=tipo, detalhe=R.SCRIPT_T30MIN)
            else:
                # sorteio 100% aleatório entre os três tipos de conteúdo
                chave, desc = random.choice(R.TIPOS_CONFIRMACAO)
                base = {
                    "time_pronto":        "Fechou! Nosso time já está com tudo preparado para a nossa call.",
                    "conteudo_instagram": "Enquanto isso, dá uma olhada nesse conteúdo que a gente publicou — tem a ver com o que a gente conversou.",
                    "foto_plano":         "Olha aí o time montando o plano para a sua empresa.",
                }[chave]
                enfileirar(c, lead["id"], tipo, base,
                           contexto="Mensagem de confirmação de call. NUNCA pergunte se vai comparecer "
                                    "nem se está tudo certo — apenas AFIRME. Use a palavra 'call', nunca 'reunião'.")

def _tick_no_show(c):
    """Máquina de no-show: F1 em 3h, F2 em 24h, F3 encerramento."""
    for lead in c.execute(
        "SELECT * FROM leads WHERE pipeline='agendamento' "
        "AND coluna IN ('no_show','no_show_f1','no_show_f2') AND arquivado=0").fetchall():
        col = lead["coluna"]
        h = horas_desde(lead["entrou_coluna_em"])
        if lead["ultima_resposta_em"] and dt(lead["ultima_resposta_em"]) and \
           dt(lead["ultima_resposta_em"]) > dt(lead["entrou_coluna_em"]):
            continue  # respondeu, não escala
        mapa = {"no_show": R.NO_SHOW_FOLLOWS[0], "no_show_f1": R.NO_SHOW_FOLLOWS[1],
                "no_show_f2": R.NO_SHOW_FOLLOWS[2]}
        destino, horas, ligs, msgs = mapa[col]
        if h < horas: continue
        mover(c, lead, destino, motivo=f"{horas}h sem resposta em {col}")
        textos = {
            "no_show_f1": "Poxa, a gente combinou e não consegui te encontrar. Imagino que a correria "
                          "da obra tenha atrapalhado. É o mínimo que eu espero de ti alguma resposta "
                          "sobre toda a conversa que a gente teve, que foi super bacana.",
            "no_show_f2": "Vou esperar uma última resposta tua. Se não der, encerro o contato por aqui.",
            "no_show_f3": "Foi muito bom nosso contato. Mas não responder por três, quatro dias, tendo "
                          "marcado um compromisso, é uma falta de respeito. Fico à disposição se mudar de ideia.",
        }
        for _ in range(msgs):
            enfileirar(c, lead["id"], destino, textos[destino],
                       contexto=f"Follow de no-show ({destino}). Nunca ofertar nem vender.")
        c.execute("INSERT INTO eventos (lead_id,tipo,para,detalhe,criado_em) VALUES (?,?,?,?,?)",
                  (lead["id"], "tarefa_ligacao", destino,
                   f"{ligs} ligações seguidas (nunca 3) — padrão {ligs}L e {msgs}M", agora()))

def _tick_nutricao_recuperacao(c):
    """Nutrição a cada 7 dias, recuperação a cada 14. Mensagem gerada por IA, nunca oferta."""
    for pipe, dias_cfg, padrao in (("nutricao", "nutricao_dias", R.NUTRICAO_DIAS),
                                   ("recuperacao", "recuperacao_dias", R.RECUPERACAO_DIAS)):
        dias = int(cfg(dias_cfg, str(padrao)))
        for lead in c.execute("SELECT * FROM leads WHERE pipeline=? AND arquivado=0", (pipe,)).fetchall():
            ult = c.execute("SELECT criada_em FROM mensagens WHERE lead_id=? AND tipo=? "
                            "ORDER BY id DESC LIMIT 1", (lead["id"], pipe)).fetchone()
            base = ult["criada_em"] if ult else lead["entrou_coluna_em"]
            if horas_desde(base) < dias * 24: continue
            enfileirar(c, lead["id"], pipe,
                       "Passando para dizer que estou por aqui se precisar. Qualquer coisa é só chamar.",
                       contexto="Mensagem de nutrição: agregar valor, lembrar que existimos. "
                                "PROIBIDO qualquer oferta, promoção ou tentativa de venda.")

def loop_automacao():
    while True:
        tick()
        time.sleep(60)

# ────────────────────────── KPIs ──────────────────────────
def kpis():
    c = conectar()
    q = lambda s, *a: c.execute(s, a).fetchone()[0]
    total      = q("SELECT COUNT(*) FROM leads WHERE arquivado=0")
    atenderam  = q("SELECT COUNT(DISTINCT lead_id) FROM ligacoes WHERE atendeu=1")
    marcadas   = q("SELECT COUNT(*) FROM leads WHERE call_agendada_para IS NOT NULL")
    compareceu = q("SELECT COUNT(DISTINCT lead_id) FROM eventos WHERE tipo='call_compareceu'")
    fechadas   = q("SELECT COUNT(DISTINCT lead_id) FROM eventos WHERE tipo='call_fechou'")
    c.close()
    etapas = {"whatsapp": total, "ligacao_atendida": atenderam, "call_marcada": marcadas,
              "call_comparecida": compareceu, "call_fechada": fechadas}
    taxas, alertas = {}, []
    for de, para, msg in R.DIAGNOSTICO_GARGALO:
        a, b = etapas.get(de, 0), etapas.get(para, 0)
        t = round(100 * b / a, 1) if a else None
        taxas[f"{de}→{para}"] = t
        if t is not None and t < 40:
            alertas.append({"transicao": f"{de} → {para}", "taxa": t, "diagnostico": msg})
    return {"etapas": etapas, "taxas": taxas, "alertas": alertas}

# ────────────────────────── API HTTP ──────────────────────────
class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def _json(self, obj, status=200):
        b = json.dumps(obj, ensure_ascii=False, default=str).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers(); self.wfile.write(b)

    def _corpo(self):
        n = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(n) or b"{}")

    def do_GET(self):
        u = urlparse(self.path); p = u.path
        if p in ("/", "/index.html"):
            caminho = os.path.join(AQUI, "static", "index.html")
            b = open(caminho, "rb").read()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(b)))
            self.end_headers(); self.wfile.write(b); return
        if p == "/api/quadro":
            c = conectar()
            leads = [dict(r) for r in c.execute(
                "SELECT * FROM leads WHERE arquivado=0 ORDER BY entrou_coluna_em DESC").fetchall()]
            c.close()
            return self._json({
                "pipelines": {k: [{"coluna": a, "rotulo": b} for a, b in v] for k, v in R.PIPELINES.items()},
                "ativacoes_por_coluna": R.ATIVACOES_POR_COLUNA,
                "catalogo": [{"tipo": t, "rotulo": r, "nota": n} for t, r, n in R.CATALOGO_ATIVACOES],
                "leads": leads,
                "modo_simulado": MODO_SIMULADO,
                "numero_liberado": numero_liberado(),
            })
        if p == "/api/kpis":
            return self._json(kpis())
        if p == "/api/lead":
            lid = int(parse_qs(u.query).get("id", ["0"])[0])
            c = conectar()
            lead = c.execute("SELECT * FROM leads WHERE id=?", (lid,)).fetchone()
            if not lead: c.close(); return self._json({"erro": "não encontrado"}, 404)
            d = dict(lead)
            d["ativacoes"] = [dict(r) for r in c.execute(
                "SELECT * FROM ativacoes WHERE lead_id=? ORDER BY id DESC", (lid,)).fetchall()]
            d["mensagens"] = [dict(r) for r in c.execute(
                "SELECT * FROM mensagens WHERE lead_id=? ORDER BY id DESC LIMIT 50", (lid,)).fetchall()]
            d["eventos"] = [dict(r) for r in c.execute(
                "SELECT * FROM eventos WHERE lead_id=? ORDER BY id DESC LIMIT 50", (lid,)).fetchall()]
            d["ligacoes"] = [dict(r) for r in c.execute(
                "SELECT * FROM ligacoes WHERE lead_id=? ORDER BY id DESC", (lid,)).fetchall()]
            d["roteiro_bant"] = [{"campo": a, "instrucao": b} for a, b in R.ROTEIRO_BANT]
            d["ritual"] = R.RITUAL_AGENDAMENTO
            c.close(); return self._json(d)
        return self._json({"erro": "rota desconhecida"}, 404)

    def do_POST(self):
        p = urlparse(self.path).path
        try: body = self._corpo()
        except Exception: return self._json({"erro": "json inválido"}, 400)
        c = conectar()
        try:
            if p == "/api/lead":
                n = agora()
                cur = c.execute(
                    "INSERT INTO leads (nome,telefone,email,empresa,nicho,faturamento_mensal,origem,"
                    "pipeline,coluna,criado_em,entrou_coluna_em,atualizado_em) "
                    "VALUES (?,?,?,?,?,?,?,'leads_novos','super_hot',?,?,?)",
                    (body.get("nome", "Sem nome"), body.get("telefone", ""), body.get("email"),
                     body.get("empresa"), body.get("nicho"), body.get("faturamento_mensal"),
                     body.get("origem", "meta-ads"), n, n, n))
                lid = cur.lastrowid
                evento(c, lid, "criado", para="leads_novos/super_hot", detalhe="entrada pelo anúncio")
                # boas-vindas automática em 15-30s: avisa que alguém liga em menos de 5 minutos
                threading.Timer(random.uniform(*R.SEG_BOAS_VINDAS), _boas_vindas, args=(lid,)).start()
                c.commit(); return self._json({"id": lid})

            if p == "/api/mover":
                lead = c.execute("SELECT * FROM leads WHERE id=?", (body["id"],)).fetchone()
                if not lead: return self._json({"erro": "não encontrado"}, 404)
                destino, pipe = body["coluna"], body.get("pipeline")
                mover(c, lead, destino, pipe, motivo=body.get("motivo", "movido manualmente"))
                if destino == "no_show":
                    enfileirar(c, lead["id"], "no_show",
                        "Poxa, não consegui te encontrar na call. Imagino que você esteja na correria, "
                        "na obra. Vou deixar marcado amanhã para o mesmo horário. Me confirma aqui.",
                        contexto="Mensagem de no-show. AFIRME o reagendamento, nunca pergunte se ele pode.")
                c.commit(); return self._json({"ok": True})

            if p == "/api/ativacao":
                tipo = body["tipo"]
                if tipo not in R.ATIVACOES_VALIDAS:
                    return self._json({"erro": "tipo inválido"}, 400)
                c.execute("INSERT INTO ativacoes (lead_id,tipo,executada_em,nota) VALUES (?,?,?,?)",
                          (body["id"], tipo, agora(), body.get("nota")))
                evento(c, body["id"], "ativacao", para=tipo)
                c.commit(); return self._json({"ok": True})

            if p == "/api/ligacao":
                atendeu = 1 if body.get("atendeu") else 0
                c.execute("INSERT INTO ligacoes (lead_id,executada_em,atendeu,nota) VALUES (?,?,?,?)",
                          (body["id"], agora(), atendeu, body.get("nota")))
                if atendeu:
                    lead = c.execute("SELECT * FROM leads WHERE id=?", (body["id"],)).fetchone()
                    c.execute("UPDATE leads SET ultima_resposta_em=? WHERE id=?", (agora(), body["id"]))
                    if lead["pipeline"] == "leads_novos" and lead["coluna"] != "responderam":
                        mover(c, lead, "responderam", motivo="atendeu a ligação")
                evento(c, body["id"], "ligacao", detalhe="atendeu" if atendeu else "não atendeu")
                c.commit(); return self._json({"ok": True})

            if p == "/api/respondeu":
                lead = c.execute("SELECT * FROM leads WHERE id=?", (body["id"],)).fetchone()
                c.execute("UPDATE leads SET ultima_resposta_em=? WHERE id=?", (agora(), body["id"]))
                if lead["pipeline"] in ("leads_novos", "nutricao", "recuperacao"):
                    mover(c, lead, "responderam", "leads_novos",
                          motivo=f"respondeu (voltou de {lead['pipeline']})")
                evento(c, body["id"], "respondeu")
                c.commit(); return self._json({"ok": True})

            if p == "/api/qualificar":
                c.execute("UPDATE leads SET rapport=?,budget=?,authority=?,need=?,timeline=?,"
                          "qualificado=?,atualizado_em=? WHERE id=?",
                          (body.get("rapport"), body.get("budget"), body.get("authority"),
                           body.get("need"), body.get("timeline"), 1 if body.get("qualificado") else 0,
                           agora(), body["id"]))
                evento(c, body["id"], "qualificado" if body.get("qualificado") else "desqualificado")
                c.commit(); return self._json({"ok": True})

            if p == "/api/agendar":
                quando = body["quando"]  # ISO
                alvo = dt(quando)
                limite = datetime.now(timezone.utc) + timedelta(days=R.MAX_DIAS_AGENDAMENTO)
                if alvo and alvo > limite:
                    return self._json({"erro": f"Nunca agende para mais de {R.MAX_DIAS_AGENDAMENTO} dias "
                                               "à frente — vira no-show. Prefira retornar a ligação amanhã."}, 400)
                lead = c.execute("SELECT * FROM leads WHERE id=?", (body["id"],)).fetchone()
                c.execute("UPDATE leads SET call_agendada_para=?, atualizado_em=? WHERE id=?",
                          (quando, agora(), body["id"]))
                mover(c, lead, "call_agendado", "agendamento", motivo="call agendada")
                enfileirar(c, lead["id"], "confirmacao_imediata",
                           "Fechou! Já deixei nossa call marcada. Te mando o link por aqui.",
                           contexto="Confirmação imediata. Use 'call', nunca 'reunião'. Só afirme.")
                c.commit(); return self._json({"ok": True})

            if p == "/api/desfecho":
                tipo = body["tipo"]  # call_compareceu | call_fechou | recusou
                lead = c.execute("SELECT * FROM leads WHERE id=?", (body["id"],)).fetchone()
                evento(c, body["id"], tipo, detalhe=body.get("nota"))
                if tipo == "recusou":
                    c.execute("UPDATE leads SET motivo_recusa=? WHERE id=?", (body.get("nota"), body["id"]))
                    mover(c, lead, "recusou", "agendamento", motivo="lead recusou")
                elif tipo == "call_compareceu":
                    mover(c, lead, "call_rolando", "agendamento", motivo="entrou na call")
                c.commit(); return self._json({"ok": True})

            if p == "/api/config":
                for k, v in body.items():
                    c.execute("INSERT INTO config (chave,valor) VALUES (?,?) "
                              "ON CONFLICT(chave) DO UPDATE SET valor=excluded.valor", (k, str(v)))
                c.commit(); return self._json({"ok": True})

            return self._json({"erro": "rota desconhecida"}, 404)
        except Exception as e:
            return self._json({"erro": str(e)}, 500)
        finally:
            c.close()

def _boas_vindas(lead_id):
    c = conectar()
    try:
        enfileirar(c, lead_id, "boas_vindas",
                   "Oi! Recebi seu contato aqui. Um dos nossos especialistas vai te ligar em menos "
                   "de 5 minutos, tudo bem?",
                   contexto="Mensagem de boas-vindas automática. Ela só existe caso o SDR não consiga "
                            "ligar antes. Nunca ofertar nada.")
        c.commit()
    finally:
        c.close()

def main():
    init_db()
    threading.Thread(target=loop_automacao, daemon=True).start()
    print(f"\n  CRM Comercial — Leon Group")
    print(f"  http://localhost:{PORTA}")
    print(f"  modo: {'SIMULADO (sem Z-API configurada)' if MODO_SIMULADO else 'PRODUÇÃO'}")
    print(f"  automação: tick a cada 60s\n")
    ThreadingHTTPServer(("127.0.0.1", PORTA), Handler).serve_forever()

if __name__ == "__main__":
    main()
