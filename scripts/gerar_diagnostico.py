#!/usr/bin/env python3
"""Gera o diagnóstico gratuito por escrito, que é a oferta de entrada da Leon Group.

Uso:  python3 scripts/gerar_diagnostico.py dados/diagnostico-<slug>.json

Lê um JSON com o estado observado da empresa do lead e emite um PDF em A4 na
identidade da marca. O item vem do mesmo vocabulário do checklist de entrega
(dados/checklist-otimizacao.json), pra auditar e entregar com a mesma régua.
"""
import json, html, sys, pathlib, subprocess, datetime

RAIZ = pathlib.Path(__file__).resolve().parent.parent
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
e = lambda s: html.escape(str(s if s is not None else ""))

ESTADOS = {
    "ok":      ("Feito",    "#2F6B4F"),
    "parcial": ("Parcial",  "#B07818"),
    "falta":   ("Falta",    "#C44712"),
    "na":      ("Não se aplica", "#8A8279"),
}

CSS = """
@page{size:A4 portrait;margin:16mm 14mm 18mm}
@page :first{margin-top:0}
*{box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;font-family:'Archivo','Helvetica Neue',Arial,sans-serif;font-size:9.6pt;
     line-height:1.55;color:#171717;background:#fff}
.disp{font-family:'Anton',Impact,sans-serif;font-weight:400;text-transform:uppercase;letter-spacing:.01em}
.mono{font-family:'JetBrains Mono',ui-monospace,Menlo,monospace}

.capa{height:262mm;padding:36mm 0 0;display:flex;flex-direction:column;break-after:page}
.capa .eyebrow{font-family:'JetBrains Mono',monospace;font-size:8pt;letter-spacing:.18em;
  text-transform:uppercase;color:#E65A19;margin-bottom:10mm}
.capa h1{font-family:'Anton',Impact,sans-serif;font-size:46pt;line-height:.95;text-transform:uppercase;margin:0 0 6mm}
.capa .quem{font-size:15pt;line-height:1.4;margin-bottom:3mm}
.capa .quem b{display:block;font-size:20pt;font-weight:700}
.capa .sub{font-size:11pt;color:#5E564C;max-width:130mm;margin-top:8mm}
.capa .rodape{margin-top:auto;padding-top:8mm;border-top:1.5pt solid #171717;
  display:flex;justify-content:space-between;align-items:baseline}
.capa .marca{font-family:'Anton',Impact,sans-serif;font-size:13pt;letter-spacing:.05em;text-transform:uppercase}
.capa .marca em{font-style:normal;color:#E65A19}
.capa .data{font-family:'JetBrains Mono',monospace;font-size:8pt;color:#6E655A;text-align:right;line-height:1.7}

h2{font-family:'Anton',Impact,sans-serif;font-size:19pt;text-transform:uppercase;margin:0 0 4mm;letter-spacing:.005em}
h3{font-size:12pt;margin:7mm 0 2.5mm}
.rot{font-family:'JetBrains Mono',monospace;font-size:7.5pt;letter-spacing:.15em;
  text-transform:uppercase;color:#6E655A;margin-bottom:2.5mm}
p{margin:0 0 3.5mm}

.placar{display:flex;gap:4mm;margin:5mm 0 7mm}
.placar>div{flex:1;border:1pt solid #DCD2BF;border-radius:2.5mm;padding:4mm;background:#FFFDF7}
.placar .n{font-family:'Anton',Impact,sans-serif;font-size:26pt;line-height:1}
.placar .l{font-family:'JetBrains Mono',monospace;font-size:7pt;letter-spacing:.1em;
  text-transform:uppercase;color:#6E655A;margin-top:1mm}
.placar .b{height:2mm;border-radius:1mm;background:#EFE8D9;margin-top:2.5mm;overflow:hidden}
.placar .b i{display:block;height:100%;background:#E65A19}

section.area{break-before:page}
table{width:100%;border-collapse:collapse;font-size:8.8pt;table-layout:fixed}
th{text-align:left;font-family:'JetBrains Mono',monospace;font-size:6.8pt;letter-spacing:.1em;
  text-transform:uppercase;color:#6E655A;background:#F0E9DA;padding:2mm;border-bottom:.6pt solid #171717;font-weight:500}
td{padding:2.4mm 2mm;border-bottom:.4pt solid #DCD2BF;vertical-align:top;overflow-wrap:anywhere}
tr{break-inside:avoid-page}
th.c1{width:44mm}th.c2{width:20mm}
td.it{font-weight:600}
td.fz{color:#3F3A33}
.chip{display:inline-block;font-family:'JetBrains Mono',monospace;font-size:6.8pt;letter-spacing:.07em;
  text-transform:uppercase;padding:.8mm 2mm;border-radius:1mm;color:#fff;white-space:nowrap}
.obs{font-size:8.2pt;color:#6E655A;display:block;margin-top:1mm;font-style:italic}

ol.ordem{counter-reset:p;list-style:none;padding:0;margin:0}
ol.ordem li{counter-increment:p;position:relative;padding-left:11mm;margin-bottom:4mm;break-inside:avoid-page}
ol.ordem li::before{content:counter(p);position:absolute;left:0;top:-.5mm;
  font-family:'Anton',Impact,sans-serif;font-size:15pt;color:#E65A19;line-height:1}
ol.ordem b{display:block;font-size:10pt}
ol.ordem span{display:block;font-size:8.8pt;color:#3F3A33;margin-top:.8mm}
ol.ordem .pq{font-family:'JetBrains Mono',monospace;font-size:7.2pt;color:#6E655A;margin-top:1mm;display:block}

.nota{border-left:2.5pt solid #E65A19;background:#FDF8F2;padding:3.5mm 4mm;margin:5mm 0;
  border-radius:0 2mm 2mm 0;break-inside:avoid-page}
/* so o rotulo vira bloco; b dentro do texto continua inline */
.nota > b:first-child{display:block;font-family:'JetBrains Mono',monospace;font-size:7.2pt;
  letter-spacing:.12em;text-transform:uppercase;color:#E65A19;margin-bottom:1.5mm}
.nota p b{font-weight:700;color:#171717}
.nota p:last-child{margin-bottom:0}
.fecho{break-before:page}
.assin{margin-top:8mm;padding-top:5mm;border-top:1pt solid #171717;font-size:9pt}
.assin b{font-family:'Anton',Impact,sans-serif;font-size:12pt;letter-spacing:.04em;text-transform:uppercase}
.assin b em{font-style:normal;color:#E65A19}
"""

def chip(estado):
    rot, cor = ESTADOS.get(estado, ESTADOS["falta"])
    return f'<span class="chip" style="background:{cor}">{e(rot)}</span>'

def tabela(itens):
    linhas = ""
    for it in itens:
        obs = f'<span class="obs">{e(it["obs"])}</span>' if it.get("obs") else ""
        linhas += (f'<tr><td class="it">{e(it["item"])}{obs}</td>'
                   f'<td>{chip(it.get("estado","falta"))}</td>'
                   f'<td class="fz">{e(it.get("fazer",""))}</td></tr>')
    return (f'<table><thead><tr><th class="c1">O que a gente olhou</th>'
            f'<th class="c2">Como está</th><th>O que fazer</th></tr></thead>'
            f'<tbody>{linhas}</tbody></table>')

def placar(areas):
    out = ""
    for a in areas:
        itens = [i for i in a["itens"] if i.get("estado") != "na"]
        ok = sum(1 for i in itens if i.get("estado") == "ok")
        pct = round(ok / len(itens) * 100) if itens else 0
        out += (f'<div><div class="n">{ok}<span style="font-size:14pt;color:#8A8279">/{len(itens)}</span></div>'
                f'<div class="l">{e(a["titulo"])}</div>'
                f'<div class="b"><i style="width:{pct}%"></i></div></div>')
    return f'<div class="placar">{out}</div>'

def gerar(d):
    hoje = d.get("data") or datetime.date.today().strftime("%d/%m/%Y")
    ex = d.get("exemplo", False)
    selo = ('<div class="nota"><b>Exemplo</b><p>Este documento é um modelo de demonstração. '
            'A empresa, os dados e os achados são fictícios, criados só para mostrar o formato.</p></div>') if ex else ""

    areas = d["areas"]
    secoes = ""
    for a in areas:
        secoes += (f'<section class="area"><div class="rot">{e(a.get("rotulo","Área"))}</div>'
                   f'<h2>{e(a["titulo"])}</h2>'
                   + (f'<p>{e(a["intro"])}</p>' if a.get("intro") else "")
                   + tabela(a["itens"])
                   + (f'<div class="nota"><b>Observação</b><p>{e(a["nota"])}</p></div>' if a.get("nota") else "")
                   + '</section>')

    ordem = "".join(
        f'<li><b>{e(p["o_que"])}</b><span>{e(p["como"])}</span>'
        f'<span class="pq">Por que primeiro: {e(p["porque"])}</span></li>'
        for p in d.get("ordem", []))

    return f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Diagnóstico · {e(d['empresa'])}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
<style>{CSS}</style></head><body>

<div class="capa">
  <div class="eyebrow">Diagnóstico gratuito · Leon Group</div>
  <h1>Onde a sua<br>empresa está hoje</h1>
  <div class="quem"><b>{e(d['empresa'])}</b>{e(d.get('oficio',''))}{' · ' if d.get('oficio') and d.get('cidade') else ''}{e(d.get('cidade',''))}</div>
  <p class="sub">{e(d.get('resumo',''))}</p>
  <div class="rodape">
    <div class="marca">Le<em>o</em>n Group · Built to Lead.</div>
    <div class="data">{e(hoje)}<br>{e(d.get('autor','Rodrigo Leon'))}</div>
  </div>
</div>

<section>
  <div class="rot">Resumo</div>
  <h2>O que a gente encontrou</h2>
  {selo}
  <p>{e(d.get('abertura',''))}</p>
  {placar(areas)}
  <div class="nota"><b>Como ler</b>
    <p><b>Feito</b> quer dizer que está lá e está certo. <b>Parcial</b> quer dizer que existe mas está incompleto ou errado. <b>Falta</b> quer dizer que não existe.</p>
    <p>Nada aqui é opinião: cada linha é uma coisa que dá para conferir abrindo o seu perfil ou o seu site agora.</p>
  </div>
</section>

{secoes}

<section class="fecho">
  <div class="rot">O que fazer</div>
  <h2>A ordem de correção</h2>
  <p>{e(d.get('ordem_intro','Consertar tudo ao mesmo tempo não funciona. Essa é a sequência que dá mais resultado por esforço, de cima para baixo.'))}</p>
  <ol class="ordem">{ordem}</ol>

  <div class="nota"><b>Isso é seu</b>
    <p>Você pode executar essa lista sozinho, sem contratar ninguém. Está tudo aqui de propósito: nenhum passo depende de ferramenta paga nem de acesso que só a gente tem.</p>
    <p>Se quiser que a gente faça, a Leon Group monta o perfil no Google, publica o site com SEO local com o botão indo direto para o seu WhatsApp, organiza a estratégia de avaliação e cuida do Instagram. Tráfego pago só na última etapa, quando já existe alguma coisa para encontrar.</p>
  </div>

  <div class="assin">
    <b>Le<em>o</em>n Group · Built to Lead.</b>
    <p style="margin-top:2mm">Qualquer dúvida sobre um item específico, me chama no WhatsApp que eu explico.</p>
  </div>
</section>
</body></html>"""

def main(caminho):
    d = json.load(open(caminho))
    slug = d.get("slug") or pathlib.Path(caminho).stem.replace("diagnostico-", "")
    saida_html = RAIZ / f"saidas/diagnostico-{slug}.html"
    saida_pdf = RAIZ / f"saidas/Diagnostico-{slug}.pdf"
    saida_html.write_text(gerar(d))
    subprocess.run([CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer",
                    f"--print-to-pdf={saida_pdf}", "--virtual-time-budget=20000",
                    saida_html.as_uri()], capture_output=True)
    if saida_pdf.exists():
        import re
        n = len(re.findall(rb"/Type\s*/Page[^s]", saida_pdf.read_bytes()))
        print(f"{saida_pdf.name}  {saida_pdf.stat().st_size//1024} KB  {n} páginas")
    else:
        print("falhou ao gerar o PDF")
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
