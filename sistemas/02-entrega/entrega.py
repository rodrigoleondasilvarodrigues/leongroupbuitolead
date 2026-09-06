#!/usr/bin/env python3
"""
Operação de Entrega — Leon Group
Rode com:  python3 entrega.py   →  http://localhost:8771

Cadastra o cliente fechado, coleta o formulário, gera os 4 entregáveis
(GMB, site, Instagram, logo) + as 20 reviews, e monta a pasta de entrega.
"""
import json, os, re, sqlite3, shutil
from datetime import datetime, timezone, timedelta
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

import geradores as G

AQUI = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(AQUI, "entrega.db")
SAIDA = os.path.join(AQUI, "entregas")
PORTA = int(os.environ.get("PORTA", "8771"))

def carregar_env():
    p = os.path.join(AQUI, ".env")
    if os.path.exists(p):
        for l in open(p, encoding="utf-8"):
            l = l.strip()
            if l and not l.startswith("#") and "=" in l:
                k, v = l.split("=", 1); os.environ.setdefault(k.strip(), v.strip())
carregar_env()

ENTREGAVEIS = [("gmb", "Google Meu Negócio"), ("site", "Site"),
               ("instagram", "Instagram (12 posts + 4 destaques)"), ("logo", "Logo")]

agora = lambda: datetime.now(timezone.utc).isoformat()
slug = lambda s: re.sub(r"[^a-z0-9]+", "-", (s or "").lower()).strip("-") or "cliente"

def conectar():
    c = sqlite3.connect(DB, timeout=30); c.row_factory = sqlite3.Row
    c.execute("PRAGMA foreign_keys = ON"); return c

def init_db():
    c = conectar()
    c.executescript(open(os.path.join(AQUI, "schema.sql"), encoding="utf-8").read())
    c.commit(); c.close(); os.makedirs(SAIDA, exist_ok=True)

def dias_desde(iso):
    d = datetime.fromisoformat(iso) if iso else None
    return (datetime.now(timezone.utc) - d).days if d else 0

class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def _j(self, o, s=200):
        b = json.dumps(o, ensure_ascii=False, default=str).encode()
        self.send_response(s); self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(b))); self.end_headers(); self.wfile.write(b)
    def _corpo(self):
        n = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(n) or b"{}")

    def do_GET(self):
        u = urlparse(self.path); p = u.path
        if p in ("/", "/index.html"):
            b = open(os.path.join(AQUI, "static", "index.html"), "rb").read()
            self.send_response(200); self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(b))); self.end_headers()
            self.wfile.write(b); return
        c = conectar()
        try:
            if p == "/api/clientes":
                out = []
                for r in c.execute("SELECT * FROM clientes WHERE arquivado=0 ORDER BY id DESC"):
                    d = dict(r)
                    d["dias"] = dias_desde(d["data_entrada"])
                    d["entregaveis"] = [dict(x) for x in c.execute(
                        "SELECT tipo,status FROM entregaveis WHERE cliente_id=?", (d["id"],))]
                    d["reviews_total"] = c.execute(
                        "SELECT COUNT(*) FROM reviews WHERE cliente_id=?", (d["id"],)).fetchone()[0]
                    d["reviews_postadas"] = c.execute(
                        "SELECT COUNT(*) FROM reviews WHERE cliente_id=? AND postada=1", (d["id"],)).fetchone()[0]
                    out.append(d)
                return self._j({"clientes": out, "entregaveis": [{"tipo": t, "rotulo": r} for t, r in ENTREGAVEIS]})
            if p == "/api/cliente":
                cid = int(parse_qs(u.query).get("id", ["0"])[0])
                r = c.execute("SELECT * FROM clientes WHERE id=?", (cid,)).fetchone()
                if not r: return self._j({"erro": "não encontrado"}, 404)
                d = dict(r); d["dias"] = dias_desde(d["data_entrada"])
                for tab in ("entregaveis", "reviews", "posts", "marcos", "midias"):
                    d[tab] = [dict(x) for x in c.execute(
                        f"SELECT * FROM {tab} WHERE cliente_id=? ORDER BY id", (cid,))]
                return self._j(d)
            return self._j({"erro": "rota desconhecida"}, 404)
        finally:
            c.close()

    def do_POST(self):
        p = urlparse(self.path).path
        try: b = self._corpo()
        except Exception: return self._j({"erro": "json inválido"}, 400)
        c = conectar()
        try:
            if p == "/api/cliente":
                n = agora()
                cur = c.execute(
                    "INSERT INTO clientes (nome_contato,empresa,nicho,data_entrada,email,plano,valor_pago,"
                    "criado_em,atualizado_em) VALUES (?,?,?,?,?,?,?,?,?)",
                    (b.get("nome_contato", ""), b.get("empresa", ""), b.get("nicho"),
                     b.get("data_entrada") or n, b.get("email"), b.get("plano"), b.get("valor_pago"), n, n))
                cid = cur.lastrowid
                for t, _ in ENTREGAVEIS:
                    c.execute("INSERT INTO entregaveis (cliente_id,tipo,atualizado_em) VALUES (?,?,?)", (cid, t, n))
                for m, dias in G.MARCOS_PADRAO:
                    c.execute("INSERT INTO marcos (cliente_id,marco,prazo_dias,criado_em) VALUES (?,?,?,?)",
                              (cid, m, dias, n))
                c.commit(); return self._j({"id": cid})

            if p == "/api/formulario":
                campos = ["nome_dono","cidade","estado","telefone","servicos","diferencial",
                          "observacoes","cores","email","nicho"]
                sets = ", ".join(f"{k}=?" for k in campos)
                c.execute(f"UPDATE clientes SET {sets}, tem_logo=?, formulario_em=?, atualizado_em=? WHERE id=?",
                          [b.get(k) for k in campos] + [1 if b.get("tem_logo") else 0, agora(), agora(), b["id"]])
                for url in (b.get("fotos") or []):
                    c.execute("INSERT INTO midias (cliente_id,tipo,caminho,criado_em) VALUES (?,?,?,?)",
                              (b["id"], "foto", url, agora()))
                c.execute("UPDATE marcos SET concluido=1, concluido_em=? WHERE cliente_id=? AND marco LIKE 'Formulário%'",
                          (agora(), b["id"]))
                c.commit(); return self._j({"ok": True})

            if p == "/api/gerar":
                cid = b["id"]
                cli = dict(c.execute("SELECT * FROM clientes WHERE id=?", (cid,)).fetchone())
                fotos = [r["caminho"] for r in c.execute(
                    "SELECT caminho FROM midias WHERE cliente_id=? AND tipo='foto'", (cid,))]
                pasta = os.path.join(SAIDA, slug(cli["empresa"]))
                for sub in ("entregaveis", "fotos-e-videos", "reviews", "reunioes"):
                    os.makedirs(os.path.join(pasta, sub), exist_ok=True)
                feito = []

                if b.get("site", True):
                    html = G.gerar_site(cli, fotos, b.get("cor", "#1B4965"), b.get("cor2", "#F6AE2D"))
                    dest = os.path.join(pasta, "entregaveis", "index.html")
                    open(dest, "w", encoding="utf-8").write(html)
                    c.execute("UPDATE entregaveis SET status='entregue', url=?, atualizado_em=? "
                              "WHERE cliente_id=? AND tipo='site'", (dest, agora(), cid))
                    c.execute("UPDATE marcos SET concluido=1, concluido_em=? WHERE cliente_id=? AND marco LIKE 'Site no ar%'",
                              (agora(), cid))
                    feito.append("site")

                if b.get("reviews", True):
                    c.execute("DELETE FROM reviews WHERE cliente_id=?", (cid,))
                    revs = G.gerar_reviews(cli, cli.get("servicos"), int(b.get("qtd_reviews", 20)), fotos)
                    for r in revs:
                        c.execute("INSERT INTO reviews (cliente_id,texto,servico,foto_ref,criado_em) "
                                  "VALUES (?,?,?,?,?)", (cid, r["texto"], r["servico"], r["foto_ref"], agora()))
                    txt = "\n\n".join(
                        f"--- REVIEW {i+1} ({r['servico']}){' — anexar foto: ' + r['foto_ref'] if r['foto_ref'] else ''} ---\n{r['texto']}"
                        for i, r in enumerate(revs))
                    open(os.path.join(pasta, "reviews", "reviews-google.txt"), "w", encoding="utf-8").write(
                        f"REVIEWS PARA O GOOGLE MEU NEGÓCIO — {cli['empresa']}\n"
                        f"{'='*70}\n\nQuem posta é o CLIENTE. Repasse para amigos e familiares.\n"
                        f"Ritmo alvo: 3 reviews por semana até completar {len(revs)}.\n"
                        f"Se possível, anexe a foto indicada em cada review.\n\n{'='*70}\n\n{txt}")
                    c.execute("UPDATE marcos SET concluido=1, concluido_em=? WHERE cliente_id=? AND marco LIKE '20 reviews%'",
                              (agora(), cid))
                    feito.append(f"{len(revs)} reviews")

                if b.get("instagram", True):
                    c.execute("DELETE FROM posts WHERE cliente_id=?", (cid,))
                    ps = G.gerar_posts(cli)
                    for x in ps:
                        c.execute("INSERT INTO posts (cliente_id,ordem,tipo,titulo,brief,legenda,criado_em) "
                                  "VALUES (?,?,?,?,?,?,?)",
                                  (cid, x["ordem"], x["tipo"], x["titulo"], x["brief"], x["legenda"], agora()))
                    linhas = [f"INSTAGRAM — {cli['empresa']}", "=" * 70, ""]
                    for x in ps:
                        linhas += [f"[{x['tipo'].upper()} {x['ordem']}] {x['titulo']}", x["brief"], ""]
                    open(os.path.join(pasta, "entregaveis", "instagram-briefs.txt"), "w",
                         encoding="utf-8").write("\n".join(linhas))
                    c.execute("UPDATE entregaveis SET status='em_producao', atualizado_em=? "
                              "WHERE cliente_id=? AND tipo='instagram'", (agora(), cid))
                    feito.append("12 posts + 4 destaques (briefs)")

                open(os.path.join(pasta, "LEIA-ME.txt"), "w", encoding="utf-8").write(
                    f"ENTREGA — {cli['empresa']}\n{'='*70}\n\n"
                    f"Cliente: {cli.get('nome_dono') or cli['nome_contato']}\n"
                    f"Cidade: {cli.get('cidade','')}, {cli.get('estado','')}\n"
                    f"Entrada: {cli['data_entrada'][:10]}\n\n"
                    "PASTAS\n"
                    "  entregaveis/     site (index.html), briefs do Instagram, logo\n"
                    "  fotos-e-videos/  tudo que o cliente enviou no formulário\n"
                    "  reviews/         as reviews para o cliente repassar\n"
                    "  reunioes/        gravações das reuniões\n\n"
                    "PARA PUBLICAR O SITE\n"
                    "  1. Acesse dash.cloudflare.com → Workers & Pages → Create → Pages\n"
                    "  2. Upload da pasta 'entregaveis' (ou só o index.html)\n"
                    f"  3. O domínio sai como {slug(cli['empresa'])}.pages.dev\n"
                    "  4. Hospedagem gratuita, até 500 sites na conta\n")
                c.commit()
                return self._j({"ok": True, "pasta": pasta, "gerado": feito})

            if p == "/api/entregavel":
                c.execute("UPDATE entregaveis SET status=?, url=?, nota=?, atualizado_em=? WHERE id=?",
                          (b["status"], b.get("url"), b.get("nota"), agora(), b["eid"]))
                c.commit(); return self._j({"ok": True})

            if p == "/api/marco":
                c.execute("UPDATE marcos SET concluido=?, concluido_em=? WHERE id=?",
                          (1 if b.get("concluido") else 0, agora() if b.get("concluido") else None, b["mid"]))
                c.commit(); return self._j({"ok": True})

            if p == "/api/review-postada":
                c.execute("UPDATE reviews SET postada=?, postada_em=? WHERE id=?",
                          (1 if b.get("postada") else 0, agora() if b.get("postada") else None, b["rid"]))
                c.commit(); return self._j({"ok": True})

            return self._j({"erro": "rota desconhecida"}, 404)
        except Exception as e:
            return self._j({"erro": str(e)}, 500)
        finally:
            c.close()

def main():
    init_db()
    print(f"\n  Operação de Entrega — Leon Group")
    print(f"  http://localhost:{PORTA}")
    print(f"  entregas salvas em: {SAIDA}")
    print(f"  reviews por IA: {'ativo' if os.environ.get('OPENAI_API_KEY') else 'templates (sem OPENAI_API_KEY)'}\n")
    ThreadingHTTPServer(("127.0.0.1", PORTA), H).serve_forever()

if __name__ == "__main__":
    main()
