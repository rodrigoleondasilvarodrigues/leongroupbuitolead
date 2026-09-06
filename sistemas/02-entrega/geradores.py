"""
Geradores dos entregáveis — Leon Group.

Os 4 entregáveis oficiais (estáveis há mais de um ano, segundo a aula):
  1. GMB — Google Meu Negócio
  2. Site
  3. Instagram — 12 posts + 4 destaques
  4. Logo (quando o cliente não tem)

Mais as ~20 reviews estratégicas em inglês, que o CLIENTE repassa para amigos e
familiares postarem (a agência não posta).
"""
import json, os, random, urllib.request

OPENAI_KEY = os.environ.get("OPENAI_API_KEY", "")

# ─────────────────────────────────────────────────────────────────────────────
# REVIEWS ESTRATÉGICAS — anatomia ditada na aula
#   (a) repete o NOME DO DONO várias vezes
#   (b) nomeia o TIPO DE SERVIÇO executado
#   (c) nomeia a CIDADE várias vezes  ← SEO local
#   (d) elogia atendimento e prazo
#   (e) fecha com superlativo local ("melhor X em Y")
#   Escritas em PRIMEIRA PESSOA, como cliente final, em INGLÊS, longas.
# ─────────────────────────────────────────────────────────────────────────────

_ABERTURAS = [
    "I had been looking for a reliable {servico} contractor in {cidade} for months before I found {dono}.",
    "After getting three quotes for {servico} here in {cidade}, I decided to go with {dono} — best decision I made.",
    "We needed {servico} done at our home in {cidade} and a neighbor recommended {dono}.",
    "I want to leave an honest review about the {servico} work {dono} did for us in {cidade}.",
    "Finding a good {servico} company in {cidade} is not easy. {dono} changed that for us.",
    "This is my second project with {dono} and once again the {servico} work in {cidade} was flawless.",
]
_ATENDIMENTO = [
    "{dono} was extremely attentive from the very first call — answered every question without rushing me.",
    "What stood out was the communication. {dono} kept me updated every single day of the project.",
    "{dono} showed up exactly when he said he would, which is rare around {cidade}.",
    "The whole crew was respectful and clean, and {dono} personally checked the work at the end of each day.",
    "I never had to chase {dono} for an update. He was always one step ahead.",
]
_PRAZO = [
    "The job was finished ahead of the schedule we agreed on — {dono} delivered earlier than we expected.",
    "They finished the {servico} faster than promised and without cutting any corners.",
    "{dono} gave me a timeline and beat it. That never happens with contractors.",
    "Project came in on budget and ahead of the deadline.",
]
_QUALIDADE = [
    "The quality of the {servico} is exactly what we hoped for — the finish is clean and professional.",
    "You can tell {dono} takes pride in the work. Every detail of the {servico} was done right.",
    "Our neighbors here in {cidade} have already asked who did our {servico}.",
    "The result completely changed the space. The {servico} looks better than the photos we were shown.",
]
_FECHAMENTOS = [
    "If you need {servico} in {cidade}, call {dono}. Best {servico} service in {cidade}, hands down.",
    "I recommend {dono} to anyone in {cidade} looking for {servico}. Best {servico} contractor in {cidade}.",
    "Hands down the best {servico} company in {cidade}. Thank you, {dono}!",
    "Do yourself a favor and hire {dono} — the best {servico} in {cidade} by far.",
    "Five stars. Best {servico} team in {cidade} and I will use {dono} again.",
]

def gerar_reviews(cliente, servicos, quantidade=20, fotos=None):
    """Gera reviews com a anatomia exata da aula. Usa OpenAI se houver chave; senão, templates."""
    dono   = cliente.get("nome_dono") or cliente.get("nome_contato") or "the owner"
    cidade = cliente.get("cidade") or "our city"
    fotos  = fotos or []
    servicos = [s.strip() for s in (servicos or "").replace(";", ",").split(",") if s.strip()] or ["remodeling"]

    if OPENAI_KEY:
        vindas = _reviews_openai(dono, cidade, servicos, quantidade)
        if vindas:
            return [{"texto": t, "servico": random.choice(servicos),
                     "foto_ref": (fotos[i % len(fotos)] if fotos else None)}
                    for i, t in enumerate(vindas)]

    saida, usados = [], set()
    for i in range(quantidade):
        servico = servicos[i % len(servicos)]
        ctx = {"dono": dono, "cidade": cidade, "servico": servico}
        for _ in range(30):
            partes = [random.choice(_ABERTURAS), random.choice(_ATENDIMENTO),
                      random.choice(_PRAZO), random.choice(_QUALIDADE), random.choice(_FECHAMENTOS)]
            texto = " ".join(p.format(**ctx) for p in partes)
            if texto not in usados:
                usados.add(texto); break
        saida.append({"texto": texto, "servico": servico,
                      "foto_ref": (fotos[i % len(fotos)] if fotos else None)})
    return saida

def _reviews_openai(dono, cidade, servicos, quantidade):
    prompt = (
        f"Write {quantidade} distinct Google Business Profile reviews in ENGLISH for a construction / "
        f"home services company in {cidade}, owned by {dono}. Services: {', '.join(servicos)}.\n\n"
        "Each review MUST:\n"
        f"- be written in first person, as a real residential customer\n"
        f"- repeat the owner's name '{dono}' at least twice\n"
        f"- name the specific service performed\n"
        f"- name the city '{cidade}' at least twice (local SEO)\n"
        "- praise the attentiveness of the service and mention the job finished ahead of schedule\n"
        f"- end stating they are the best [service] in {cidade}\n"
        "- be 4 to 7 sentences long, natural, with varied sentence structure\n"
        "- sound like different people wrote them: vary tone, vocabulary and what they focus on\n\n"
        "Return ONLY a JSON array of strings, nothing else."
    )
    corpo = json.dumps({"model": "gpt-4o", "temperature": 1.0,
        "messages": [{"role": "user", "content": prompt}]}).encode()
    req = urllib.request.Request("https://api.openai.com/v1/chat/completions", data=corpo,
        headers={"Authorization": f"Bearer {OPENAI_KEY}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            txt = json.load(r)["choices"][0]["message"]["content"].strip()
        txt = txt[txt.find("["): txt.rfind("]") + 1]
        arr = json.loads(txt)
        return [a for a in arr if isinstance(a, str)][:quantidade]
    except Exception as e:
        print(f"[openai] reviews falharam, usando templates: {e}")
        return None

# ─────────────────────────────────────────────────────────────────────────────
# 12 POSTS + 4 DESTAQUES DE INSTAGRAM
# A linha editorial fala com a DOR DO CLIENTE FINAL do contractor — nunca sobre marketing.
# ─────────────────────────────────────────────────────────────────────────────

PAUTAS_12_POSTS = [
    ("Antes e depois", "Mostrar a transformação de um projeto real. A foto faz o trabalho — legenda curta."),
    ("O processo por dentro", "Como o serviço é executado, etapa por etapa. Gera confiança de quem sabe fazer."),
    ("Material que a gente usa", "Comparar materiais e explicar a escolha. Posiciona como especialista."),
    ("Erro comum que sai caro", "Um erro que o dono da casa comete e o prejuízo que gera."),
    ("Quanto tempo leva", "Expectativa realista de prazo para o serviço mais pedido."),
    ("A equipe", "Quem executa. Rosto humano vende mais que logo."),
    ("Cliente satisfeito", "Depoimento real, com autorização. Sem encenação."),
    ("Detalhe do acabamento", "Close no detalhe que separa o trabalho bem feito do mal feito."),
    ("Região atendida", "Quais cidades atende — reforça SEO local e filtra lead ruim."),
    ("Dúvida frequente", "A pergunta que todo cliente faz antes de fechar, respondida direto."),
    ("Projeto concluído", "Entrega final com o resultado em destaque."),
    ("Como pedir um orçamento", "Chamada para ação clara, com o caminho do contato."),
]

DESTAQUES_4 = [
    ("Services",  "O que a empresa faz. Um card por serviço principal."),
    ("Projects",  "Portfólio: antes e depois dos trabalhos entregues."),
    ("Reviews",   "Prints das avaliações reais do Google Meu Negócio."),
    ("Contact",   "Como falar com a empresa: telefone, WhatsApp, região atendida."),
]

def gerar_posts(cliente):
    empresa = cliente.get("empresa") or "a empresa"
    cidade  = cliente.get("cidade") or "a região"
    servicos = cliente.get("servicos") or ""
    saida = []
    for i, (titulo, brief) in enumerate(PAUTAS_12_POSTS, 1):
        saida.append({"ordem": i, "tipo": "post", "titulo": titulo,
            "brief": f"{brief}\n\nEmpresa: {empresa} · Região: {cidade}\nServiços: {servicos[:200]}",
            "legenda": ""})
    for i, (titulo, brief) in enumerate(DESTAQUES_4, 1):
        saida.append({"ordem": i, "tipo": "destaque", "titulo": titulo,
            "brief": f"{brief}\n\nEmpresa: {empresa} · Região: {cidade}", "legenda": ""})
    return saida

# ─────────────────────────────────────────────────────────────────────────────
# SITE — template próprio. Gera HTML pronto para subir no Cloudflare Pages.
# ─────────────────────────────────────────────────────────────────────────────

def gerar_site(cliente, fotos=None, cor="#1B4965", cor2="#F6AE2D"):
    fotos = fotos or []
    empresa = cliente.get("empresa") or "Company"
    dono    = cliente.get("nome_dono") or cliente.get("nome_contato") or ""
    cidade  = cliente.get("cidade") or ""
    estado  = cliente.get("estado") or ""
    tel     = cliente.get("telefone") or ""
    servicos = [s.strip() for s in (cliente.get("servicos") or "").replace(";", ",").split(",") if s.strip()]
    dif     = cliente.get("diferencial") or ""
    zap = "".join(ch for ch in tel if ch.isdigit())

    cards = "\n".join(
        f'<article class="s"><h3>{s}</h3><p>Professional {s.lower()} services in {cidade}, {estado}.</p></article>'
        for s in (servicos[:6] or ["Remodeling", "Flooring", "Painting"]))
    galeria = "\n".join(f'<figure><img src="{f}" alt="{empresa} project in {cidade}" loading="lazy"></figure>'
                        for f in fotos[:12])

    return f"""<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{empresa} — {servicos[0] if servicos else 'Construction'} in {cidade}, {estado}</title>
<meta name="description" content="{empresa}: {', '.join(servicos[:4])} in {cidade}, {estado}. Free estimate. {dif[:90]}">
<style>
:root{{--c:{cor};--a:{cor2};--t:#1a1a1a;--bg:#fff;--mut:#666}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--t);background:var(--bg)}}
header{{background:var(--c);color:#fff;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}}
header b{{font-size:20px;letter-spacing:.02em}}
header a{{background:var(--a);color:#111;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600}}
.hero{{background:linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)){' ,url(' + fotos[0] + ')' if fotos else ''};
background-size:cover;background-position:center;color:#fff;padding:110px 24px;text-align:center}}
.hero h1{{font-size:clamp(28px,5vw,46px);max-width:760px;margin:0 auto 14px}}
.hero p{{font-size:19px;opacity:.94;max-width:620px;margin:0 auto 26px}}
.btn{{display:inline-block;background:var(--a);color:#111;padding:15px 34px;border-radius:8px;
text-decoration:none;font-weight:700;font-size:17px}}
section{{padding:64px 24px;max-width:1100px;margin:0 auto}}
h2{{font-size:29px;margin-bottom:26px;color:var(--c)}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:18px}}
.s{{border:1px solid #e6e6e6;border-radius:10px;padding:22px}}
.s h3{{color:var(--c);margin-bottom:7px;font-size:19px}}
.gal{{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}}
.gal img{{width:100%;height:210px;object-fit:cover;border-radius:8px;display:block}}
.cta{{background:var(--c);color:#fff;text-align:center}}
.cta h2{{color:#fff}}
footer{{background:#111;color:#999;padding:30px 24px;text-align:center;font-size:14px}}
.zap{{position:fixed;right:20px;bottom:20px;background:#25D366;color:#fff;width:58px;height:58px;
border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;
text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.28)}}
</style></head><body>
<header><b>{empresa}</b><a href="#contact">Free Estimate</a></header>

<div class="hero">
  <h1>{servicos[0] if servicos else 'Quality Construction'} in {cidade}, {estado}</h1>
  <p>{dif or f'Licensed and experienced team serving {cidade} and surrounding areas.'}</p>
  <a class="btn" href="#contact">Get Your Free Estimate</a>
</div>

<section><h2>Our Services</h2><div class="grid">{cards}</div></section>

{'<section><h2>Recent Projects</h2><div class="gal">' + galeria + '</div></section>' if fotos else ''}

<section><h2>Why {empresa}</h2><div class="grid">
  <article class="s"><h3>On Schedule</h3><p>We finish when we say we will — most projects ahead of schedule.</p></article>
  <article class="s"><h3>Clear Communication</h3><p>{dono or 'The owner'} keeps you updated at every stage.</p></article>
  <article class="s"><h3>Local to {cidade}</h3><p>We know the homes, the codes and the neighborhoods here.</p></article>
</div></section>

<section class="cta" id="contact">
  <h2>Request Your Free Estimate</h2>
  <p style="margin-bottom:24px">Tell us about your project and we'll get back to you today.</p>
  {'<a class="btn" href="https://wa.me/' + zap + '">Message us on WhatsApp</a>' if zap else ''}
  {'<p style="margin-top:18px;font-size:19px">' + tel + '</p>' if tel else ''}
</section>

<footer>© {empresa} · {cidade}, {estado} · All rights reserved</footer>
{'<a class="zap" href="https://wa.me/' + zap + '" aria-label="WhatsApp">✆</a>' if zap else ''}
</body></html>"""

# ─────────────────────────────────────────────────────────────────────────────
# MARCOS DO QUICK WIN — os primeiros 14 dias definem a satisfação dos 3 meses
# ─────────────────────────────────────────────────────────────────────────────

MARCOS_PADRAO = [
    ("Formulário do cliente respondido",              1),
    ("Site no ar (Cloudflare Pages)",                 3),
    ("Logo entregue (se aplicável)",                  3),
    ("12 posts + 4 destaques entregues",              5),
    ("20 reviews entregues ao cliente",               5),
    ("Acesso ao Google Meu Negócio liberado",         7),
    ("GMB otimizado (categorias, serviços, fotos)",   9),
    ("Pasta do Drive entregue ao cliente",           10),
    ("Primeiras 3 reviews postadas pelo cliente",    12),
    ("Reunião de acompanhamento do quick win",       14),
]
