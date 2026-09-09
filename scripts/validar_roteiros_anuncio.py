#!/usr/bin/env python3
"""Confere os roteiros de anuncio contra as regras que nao podem ser quebradas.

Formato novo: script_arcads (teto por modelo), broll como lista de planos, storyboard de 4 colunas.
"""
import json, re, sys, unicodedata

ICP = ("subcontractor", "subcontrator", "empresario da construcao", "empresario de construcao", "home service")

PROIBIDO = [
    (r"\bmeu cliente\b", "cliente proprio afirmado"),
    (r"\bnosso cliente\b", "cliente proprio afirmado"),
    (r"\bum cliente (nosso|meu)\b", "cliente proprio afirmado"),
    (r"\bcliente (nosso|meu) (fez|fatur|saiu|conseguiu)", "resultado de cliente"),
    (r"aqui n[oa]s? (estados unidos|america)", "presenca fisica nos EUA"),
    (r"aqui em (boston|massachusetts)", "presenca fisica nos EUA"),
    (r"\b(eu|a gente|nos) (estou|estamos|to|tamo) (aqui )?(n[oa]s?|em) (estados unidos|america|boston|massachusetts)", "presenca fisica nos EUA"),
    (r"\bvoc[e] vai faturar\b", "promessa de faturamento"),
    (r"\bgarant\w+ .{0,30}(primeiro lugar|numero 1|topo do google)", "promessa de posicao"),
    (r"\bja ajudamos\b", "contagem de clientes"),
    (r"\b\d+\+? (clientes|empresas) (atendid|ajudad)", "contagem de clientes"),
]

def des(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn").lower()

def campos(r):
    for k in ("titulo","hook_resumo","script_arcads","prompt_arcads","headline_estatica","legenda_meta","cta","filtro_ator","audio","integridade"):
        v = r.get(k)
        if isinstance(v, str) and v.strip(): yield k, v
    for i, b in enumerate(r.get("broll") or []):
        for k in ("quando","prompt","origem"):
            if b.get(k): yield f"broll[{i}].{k}", b[k]
    for i, b in enumerate(r.get("storyboard") or []):
        for k in ("t","imagem","tela","fala"):
            if b.get(k): yield f"storyboard[{i}].{k}", b[k]
    for i, v in enumerate(r.get("verificar") or []):
        yield f"verificar[{i}]", v

def segs(t):
    m = re.findall(r"(\d+):(\d{1,2})", t or "")
    return [int(a)*60+int(b) for a, b in m] if m else None

def checar(r):
    p, n = [], r.get("numero")
    teto = 400 if n == 20 else 600

    # travessao
    for c, t in campos(r):
        for ch in ("—", "–"):
            if ch in t:
                i = t.index(ch)
                p.append(f"travessao em {c}: ...{t[max(0,i-40):i+40]}...")

    # script
    sc = r.get("script_arcads") or ""
    if not sc:
        p.append("sem script_arcads")
    else:
        if len(sc) > teto:
            p.append(f"script com {len(sc)} caracteres, teto {teto}")
        if r.get("script_chars") and abs(r["script_chars"] - len(sc)) > 2:
            p.append(f"script_chars diz {r['script_chars']} mas o texto tem {len(sc)}")
        # marcacao de roteiro nao pode vazar pro campo de script
        for ruim, nome in ((r"^\s*(HOOK|BODY|CTA|ATOR|CEN[ÁA]RIO|FALA)\b", "cabecalho de bloco"),
                           (r"\([^)]{25,}\)", "direcao entre parenteses"),
                           (r"^\s*[\"'].*[\"']\s*$", "aspas em volta do script inteiro"),
                           (r"\[\d?:?\d*\]", "marcacao de tempo")):
            if re.search(ruim, sc, re.M):
                p.append(f"script contem {nome}, o campo do Arcads aceita so a fala")
        # ICP nas duas primeiras frases
        ini = " ".join(re.split(r"[.\n]", sc)[:2])
        if not any(k in des(ini) for k in (des(x) for x in ICP)):
            p.append(f"ICP nao aparece na abertura do script: {ini.strip()[:110]!r}")

    # modelo compativel com o tamanho
    # vence o modelo nomeado PRIMEIRO no campo; o resto do texto costuma comparar com os outros
    mod = des(r.get("modelo_arcads") or "")
    if sc and "nao se aplica" not in mod and "nao passa pelo arcads" not in mod:
        pos = {k: mod.find(k) for k in ("omnihuman", "audio driven", "arcads 1.0") if mod.find(k) >= 0}
        if not pos:
            p.append(f"modelo_arcads nao nomeia nenhum dos tres: {mod[:60]!r}")
        else:
            esc = min(pos, key=pos.get)
            if esc == "omnihuman" and len(sc) > 400: p.append(f"Omnihuman 1.5 escolhido mas o script tem {len(sc)}")
            if esc == "audio driven" and len(sc) > 600: p.append(f"Audio Driven escolhido mas o script tem {len(sc)}")

    # duracao
    d = r.get("duracao_seg") or 0
    faixa = (20, 32) if n == 20 else (38, 62)
    if not (faixa[0] <= d <= faixa[1]):
        p.append(f"duracao {d}s fora da faixa {faixa[0]}-{faixa[1]}s")

    # storyboard
    sb = r.get("storyboard") or []
    minimo = max(5, round(d / 6))
    if len(sb) < minimo:
        p.append(f"storyboard com {len(sb)} blocos, minimo {minimo} para {d}s")
    fim = 0
    for i, b in enumerate(sb):
        s = segs(b.get("t", ""))
        if not s or len(s) < 2:
            p.append(f"storyboard[{i}].t nao parseavel: {b.get('t')!r}"); continue
        if s[0] > fim + 1: p.append(f"buraco no storyboard entre {fim}s e {s[0]}s")
        fim = max(fim, s[1])
    if fim and abs(fim - d) > 5:
        p.append(f"storyboard termina em {fim}s mas duracao diz {d}s")

    # CTA nao no primeiro terco
    for i, b in enumerate(sb):
        s = segs(b.get("t", ""))
        if s and s[1] <= d / 3 and re.search(r"(chama (a gente|no whats)|toca aqui|clica aqui|me chama)", des(b.get("fala",""))):
            p.append(f"CTA cedo demais, bloco {i} ({b.get('t')})")

    # proibicoes
    for c, t in campos(r):
        # prompt_arcads carrega a secao NUNCA, que enuncia as regras em vez de viola-las;
        # a fala em si ja e conferida por script_arcads, que vive dentro dele
        if c in ("integridade", "filtro_ator", "audio", "prompt_arcads") or c.startswith("verificar"): continue
        dt = des(t)
        for rx, nome in PROIBIDO:
            for m in re.finditer(rx, dt):
                antes = dt[max(0, m.start()-45):m.start()]
                if re.search(r"\b(nunca|nao|sem|jamais|evit\w*|proib\w*|nada de)\b[^.]*$", antes): continue
                p.append(f"{nome} em {c}: ...{t[max(0,m.start()-50):m.start()+70]}...")

    # valor em dolar: ou rotulo no proprio frame, ou entrada na lista verificar do roteiro
    tem_ver = any(re.search(r"(valor|ticket|di[\u00e1a]ria|d[\u00f3o]lar|pre[\u00e7c]o|\\$)", v, re.I)
                  for v in (r.get("verificar") or []))
    for campo, txt in campos(r):
        if campo == "integridade" or campo.startswith("verificar"): continue
        for m in re.finditer(r"\$\s?[\d][\d.,]{2,}", txt):
            # um campo tela descreve UM frame: a linha de fonte nele vale pros numeros dele.
            # nos demais campos, olha so a vizinhanca.
            ctx = txt if campo.endswith(".tela") else txt[max(0, m.start()-150):m.end()+150]
            local = re.search(r"(VERIFICAR|fonte|valor de mercado|m[\u00e9e]dia de mercado|ticket|a confirmar|segundo|dado de)", ctx, re.I)
            if not local and not tem_ver:
                p.append(f"valor {m.group().strip()} sem fonte no frame e sem entrada em verificar, em {campo}")
            elif not local:
                p.append(f"valor {m.group().strip()} sem linha de fonte no proprio frame, em {campo}")

    # prompt unico: as tres secoes que o usuario pediu, e a fala verbatim dentro dele
    pa = r.get("prompt_arcads") or ""
    if not pa:
        p.append("sem prompt_arcads")
    else:
        for sec in ("QUEM", "ONDE", "O QUE FALA"):
            if sec not in pa: p.append(f"prompt_arcads sem a secao {sec}")
        if sc and sc.strip() not in pa:
            p.append("o script nao esta dentro do prompt_arcads")

    # a fala de cada bloco tem que existir no script, senao o storyboard saiu de sincronia
    for i, b in enumerate(sb):
        f = (b.get("fala") or "").strip()
        if f and sc and f not in sc:
            p.append(f"storyboard[{i}].fala nao existe no script: {f[:60]!r}")

    # broll com origem
    for i, b in enumerate(r.get("broll") or []):
        if not re.search(r"(licenc|banco|stock|\bia\b|gerad|rodrigo|grava|arquivo proprio|tela)", des(b.get("origem",""))):
            p.append(f"broll[{i}] sem origem declarada: {b.get('origem','')[:70]!r}")
        if not (b.get("prompt") or "").strip():
            p.append(f"broll[{i}] sem prompt")

    if not (r.get("filtro_ator") or "").strip(): p.append("sem filtro_ator")
    if not (r.get("legenda_meta") or "").strip(): p.append("sem legenda_meta")
    return p

def main(caminho):
    rs = json.load(open(caminho))
    if isinstance(rs, dict): rs = rs.get("roteiros") or []
    rs = [x.get("roteiro", x) for x in rs if x]
    total = 0
    for r in sorted(rs, key=lambda x: x.get("numero", 0)):
        p = checar(r)
        total += len(p)
        print(f"{'ok  ' if not p else 'FALHA'} {r.get('numero'):>2}. {r.get('titulo','')[:40]:<40} "
              f"{len(r.get('script_arcads') or ''):>4} car.  {r.get('duracao_seg')}s  {len(r.get('storyboard') or [])} blocos")
        for x in p: print(f"        - {x}")
    print(f"\n{len(rs)} roteiros, {total} apontamentos")
    return 1 if total else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
