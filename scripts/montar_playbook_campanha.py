#!/usr/bin/env python3
"""Monta o playbook de campanha em HTML de impressão e em PDF.

Uso:  python3 scripts/montar_playbook_campanha.py [--pdf]

Fonte de verdade: _memoria/playbook-campanha-meta.md
Saídas:           saidas/campanha-meta-passo-a-passo.html
                  saidas/Leon-Group-Campanha-Meta-Passo-a-Passo.pdf

Por que um conversor próprio em vez de uma biblioteca: nenhuma das
(markdown, mistune, commonmark, weasyprint, reportlab) está instalada nesta
máquina, e o documento usa um subconjunto pequeno e conhecido de markdown.
O PDF sai pelo Chrome headless, que é o mesmo caminho que
scripts/montar_roteiros.py já usa para o PDF dos roteiros.

O que o conversor cobre, e é só o que o documento usa: títulos de 1 a 3,
parágrafos, listas com caixa de marcar, listas comuns, tabelas, citação em
bloco, bloco de código, régua, negrito, código em linha.
"""
import html
import pathlib
import re
import subprocess
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
FONTE = RAIZ / "_memoria/playbook-campanha-meta.md"
SAIDA = RAIZ / "saidas/campanha-meta-passo-a-passo.html"
PDF = RAIZ / "saidas/Leon-Group-Campanha-Meta-Passo-a-Passo.pdf"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

e = lambda s: html.escape(str(s if s is not None else ""))


def inline(t):
    """Negrito, código em linha e escape. Nesta ordem, porque o escape tem que
    vir antes de injetar tag, senão a tag é escapada junto."""
    t = e(t)
    t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
    t = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", t)
    return t


def converter(md):
    """Markdown para HTML, no subconjunto que este documento usa.

    Três coisas que a primeira versão errava, e que estão resolvidas aqui:

    1. Marcador de bloco INDENTADO não era reconhecido. A cerca de código e a
       tabela dentro de um item de lista vêm com espaço na frente, e comparar
       com startswith na linha só rstripada deixava as duas passarem como
       parágrafo. Agora a detecção usa a linha strip.
    2. NEGRITO QUEBRADO ENTRE LINHAS não fechava. O documento tem
       "**9h no horário de\\n      Brasília**", e aplicar inline() linha por
       linha nunca encontra o par. Agora o texto cru é acumulado primeiro e
       inline() roda uma vez no fim.
    3. Continuação de item de lista era detectada por contagem de espaços, o
       que confundia item seguinte com continuação.
    """
    linhas = md.split("\n")
    saida = []
    pilha = []
    i, n = 0, len(linhas)

    def fecha():
        while pilha:
            saida.append("</%s>" % pilha.pop().split("-")[0])

    def abre(tag, cls=""):
        chave = tag + ("-" + cls if cls else "")
        if chave not in pilha:
            fecha()
            saida.append("<%s%s>" % (tag, ' class="%s"' % cls if cls else ""))
            pilha.append(chave)

    # continuação = linha indentada que NÃO começa um bloco novo
    def eh_continuacao(l):
        if not l.strip():
            return False
        if not re.match(r"^\s{2,}\S", l):
            return False
        return not re.match(r"^\s*(-\s|\d+\.\s|#{1,3}\s|>|\||```|---+$)", l)

    while i < n:
        bruta = linhas[i]
        l = bruta.strip()

        # bloco de código, com ou sem indentação
        if l.startswith("```"):
            fecha()
            i += 1
            corpo = []
            while i < n and not linhas[i].strip().startswith("```"):
                corpo.append(linhas[i].strip())
                i += 1
            i += 1
            saida.append("<pre>" + e("\n".join(corpo)) + "</pre>")
            continue

        # tabela, com ou sem indentação
        if l.startswith("|") and i + 1 < n and re.match(r"^\|[\s:|-]+\|$", linhas[i + 1].strip()):
            fecha()
            cabec = [c.strip() for c in l.strip("|").split("|")]
            i += 2
            corpos = []
            while i < n and linhas[i].strip().startswith("|"):
                corpos.append([c.strip() for c in linhas[i].strip().strip("|").split("|")])
                i += 1
            t = ['<div class="tw"><table><thead><tr>']
            t += ["<th>%s</th>" % inline(c) for c in cabec]
            t.append("</tr></thead><tbody>")
            for linha in corpos:
                t.append("<tr>" + "".join("<td>%s</td>" % inline(c) for c in linha) + "</tr>")
            t.append("</tbody></table></div>")
            saida.append("".join(t))
            continue

        if re.match(r"^---+$", l):
            fecha()
            saida.append('<hr class="quebra">')
            i += 1
            continue

        m = re.match(r"^(#{1,3})\s+(.*)$", l)
        if m:
            fecha()
            nivel = len(m.group(1))
            saida.append("<h%d>%s</h%d>" % (nivel, inline(m.group(2)), nivel))
            i += 1
            continue

        # citação, com continuação, convertida recursivamente
        if l.startswith(">"):
            fecha()
            bloco = []
            while i < n and linhas[i].strip().startswith(">"):
                bloco.append(re.sub(r"^>\s?", "", linhas[i].strip()))
                i += 1
            saida.append("<blockquote>" + converter("\n".join(bloco)) + "</blockquote>")
            continue

        # item com caixa de marcar
        m = re.match(r"^-\s+\[([ xX])\]\s+(.*)$", l)
        if m:
            abre("ul", "chk")
            marcado = m.group(1).lower() == "x"
            cru = [m.group(2)]
            i += 1
            while i < n and eh_continuacao(linhas[i]):
                cru.append(linhas[i].strip())
                i += 1
            # inline() só AQUI, depois de juntar, senão negrito quebrado não fecha
            saida.append('<li><i class="cx%s"></i><span>%s</span></li>'
                         % (" on" if marcado else "", inline(" ".join(cru))))
            continue

        # item comum
        m = re.match(r"^-\s+(.*)$", l)
        if m:
            abre("ul")
            cru = [m.group(1)]
            i += 1
            while i < n and eh_continuacao(linhas[i]):
                cru.append(linhas[i].strip())
                i += 1
            saida.append("<li>%s</li>" % inline(" ".join(cru)))
            continue

        if not l:
            fecha()
            i += 1
            continue

        # parágrafo
        fecha()
        cru = []
        while i < n and linhas[i].strip() and not re.match(
                r"^\s*(#{1,3}\s|>|-\s|\||```|---+$)", linhas[i].strip()):
            cru.append(linhas[i].strip())
            i += 1
        saida.append("<p>%s</p>" % inline(" ".join(cru)))

    fecha()
    return "\n".join(saida)


ESTILO = """
@page{size:A4;margin:16mm 14mm 18mm}
:root{--marfim:#F7F3EA;--branco:#fff;--preto:#171717;--laranja:#E65A19;
--laranja-esc:#C44712;--areia:#E9E1D6;--cinza:#5c5852;--verde:#2d6a4f}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font:10.5pt/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif;
color:var(--preto);background:#fff}
.capa{background:var(--preto);color:var(--marfim);padding:26mm 16mm;margin:-16mm -14mm 10mm;
page-break-after:always}
.capa .marca{font:800 15pt/1 "Inter Tight",Inter,sans-serif;letter-spacing:.01em}
.capa .marca span{color:var(--laranja)}
.capa .marca em{display:block;font:400 8pt/1 inherit;font-style:normal;opacity:.65;
margin-top:3mm;letter-spacing:.08em}
.capa h1{font:800 30pt/1.05 "Inter Tight",Inter,sans-serif;letter-spacing:-.03em;
margin:40mm 0 6mm;max-width:15cm}
.capa .sub{font-size:12pt;opacity:.8;max-width:13cm;line-height:1.5}
.capa .rod{margin-top:36mm;font-size:8.5pt;opacity:.55;line-height:1.6;max-width:14cm}
/* code na capa: o estilo global usa fundo claro, e sobre o preto da capa o
   texto desaparecia em blocos cinza. Aqui ele inverte. */
.capa code{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.18);
color:#f0ebe1}
/* o h1 da capa não leva a régua laranja do h1 do corpo */
.capa h1{border-bottom:0;padding-bottom:0}
h1{font:800 19pt/1.15 "Inter Tight",Inter,sans-serif;letter-spacing:-.025em;
margin:0 0 5mm;padding-bottom:2.5mm;border-bottom:2.5pt solid var(--laranja);
page-break-after:avoid}
h2{font:700 14pt/1.2 "Inter Tight",Inter,sans-serif;letter-spacing:-.02em;
margin:8mm 0 3mm;page-break-after:avoid}
h3{font:700 11pt/1.25 inherit;margin:6mm 0 2mm;color:var(--laranja-esc);
page-break-after:avoid}
p{margin:0 0 2.6mm;orphans:3;widows:3}
strong{font-weight:700}
code{font:9pt/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--marfim);
padding:.4mm 1.2mm;border-radius:1mm;border:.3pt solid var(--areia)}
pre{font:9pt/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--preto);
color:#e8e3d9;padding:4mm 5mm;border-radius:2mm;margin:0 0 3.5mm;white-space:pre-wrap;
page-break-inside:avoid}
ul{margin:0 0 3.5mm;padding-left:6mm}
ul li{margin-bottom:1.4mm;page-break-inside:avoid}
/* lista com caixa de marcar: é para riscar no papel */
ul.chk{list-style:none;padding-left:0}
ul.chk li{display:flex;gap:2.6mm;align-items:flex-start;margin-bottom:2.2mm;
page-break-inside:avoid}
ul.chk .cx{flex:none;width:3.6mm;height:3.6mm;border:.9pt solid var(--preto);
border-radius:.7mm;margin-top:.9mm}
ul.chk .cx.on{background:var(--verde);border-color:var(--verde)}
blockquote{margin:0 0 3.5mm;padding:3mm 4mm;background:var(--marfim);
border-left:2.5pt solid var(--laranja);border-radius:0 1.5mm 1.5mm 0;
page-break-inside:avoid}
blockquote p{margin-bottom:1.6mm;font-size:10pt}
blockquote p:last-child{margin-bottom:0}
blockquote .tw{margin-bottom:0}
.tw{margin:0 0 4mm;page-break-inside:avoid}
table{border-collapse:collapse;width:100%;font-size:9.5pt}
th,td{text-align:left;padding:1.8mm 2.4mm;border-bottom:.4pt solid var(--areia);
vertical-align:top}
th{font:700 7.6pt/1.3 inherit;letter-spacing:.09em;text-transform:uppercase;
color:var(--cinza);background:var(--marfim);border-bottom:.8pt solid var(--areia)}
tr:last-child td{border-bottom:0}
hr.quebra{border:0;border-top:.4pt solid var(--areia);margin:7mm 0}
"""


def main():
    md = FONTE.read_text(encoding="utf-8")

    # a capa sai do primeiro título e do primeiro bloco de citação
    corpo = converter(md)

    doc = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Leon Group · Campanha na Meta, passo a passo</title>
<style>{ESTILO}</style></head><body>
<div class="capa">
  <div class="marca">LE<span>O</span>N GROUP<em>Built to Lead.</em></div>
  <h1>Subir a campanha na Meta, passo a passo</h1>
  <p class="sub">Extraído das 4 aulas da mentoria e do hotseat, filtrado pela
  regra de integridade da casa. Com a conta do seu orçamento, a tabela de
  decisão de matar e escalar, e o plano da sexta hora a hora.</p>
  <p class="rod">Gerado de <code>_memoria/playbook-campanha-meta.md</code>, que é a
  fonte de verdade. Editar lá e rodar <code>python3
  scripts/montar_playbook_campanha.py --pdf</code> para refazer este arquivo.<br><br>
  Os 42 itens marcados como tática enganosa na extração ficam em quarentena na
  seção 2 e não entram em nenhum passo.</p>
</div>
{corpo}
</body></html>"""

    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(doc, encoding="utf-8")
    print(f"  html: {SAIDA.name}  {len(doc)//1024} KB")

    if "--pdf" in sys.argv:
        r = subprocess.run(
            [CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer",
             f"--print-to-pdf={PDF}", "--virtual-time-budget=20000", SAIDA.as_uri()],
            capture_output=True, text=True)
        if PDF.exists():
            dados = PDF.read_bytes()
            paginas = dados.count(b"/Type /Page") - dados.count(b"/Type /Pages")
            print(f"  pdf:  {PDF.name}  {len(dados)//1024} KB  {paginas} páginas")
        else:
            print("  pdf: FALHOU")
            print((r.stderr or "")[-500:])
            sys.exit(1)


if __name__ == "__main__":
    main()
