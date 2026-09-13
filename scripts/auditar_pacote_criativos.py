#!/usr/bin/env python3
"""Audita o pacote de criativos contra as sete regras inegociáveis.

Uso:  python3 scripts/auditar_pacote_criativos.py [pasta]
      (sem argumento, audita saidas/pacote-criativos-ia)

Sai com código 1 se achar violação. O montador chama isto no fim, então um
pacote que quebre qualquer regra não chega a existir.

AS SETE REGRAS
  1. Zero cliente inventado
  2. Zero depoimento falso
  3. Zero resultado atribuído à Leon Group
  4. Zero promessa de faturamento ou de primeiro lugar no Google
  5. Zero sugestão de escritório ou equipe americana
  6. Zero número em dólar sem fonte declarada
  7. Zero travessão

O PROBLEMA CENTRAL DESTE AUDITOR, E COMO ELE É RESOLVIDO
O pacote fala o tempo todo SOBRE essas proibições. O arquivo de regras existe
justamente para dizer "nunca apresente ninguém como cliente". Busca por palavra
solta acusaria a própria regra como se fosse a violação, o auditor viraria ruído
e alguém desligaria ele, que é o pior desfecho possível.

Por isso cada achado passa por um teste de negação: se a frase onde ele aparece
carrega nunca, não, nenhum, zero, sem, jamais, evitar ou proibido, ela está
PROIBINDO a coisa, não afirmando. O relatório informa quantas frases foram
dispensadas por esse motivo, para que a conta fique visível e auditável em vez
de silenciosa.
"""
import json, re, sys, pathlib, unicodedata

RAIZ = pathlib.Path(__file__).resolve().parent.parent
PADRAO = RAIZ / "saidas" / "pacote-criativos-ia"

NEGACAO = re.compile(
    r"\b(nunca|jamais|n[ãa]o|nenhum[ao]?s?|nada|zero|sem|evitar|evite|proibid[ao]|"
    r"descartar|proibe|impede|proíbe)\b", re.I)

# Cada regra: (nome, regex do que seria uma AFIRMAÇÃO proibida)
REGRAS = [
    ("1. cliente inventado", re.compile(
        r"(noss[oa]s? clientes?|clientes? d[ao] Leon Group\s+(?:disse|contou|relatou|conseguiu|teve|fechou)"
        r"|j[áa] atendemos|atendemos mais de|carteira de clientes"
        r"|\b\d+\s+clientes?\s+(?:atendidos|satisfeitos|ativos))", re.I)),

    ("2. depoimento falso", re.compile(
        r"((?:depoimento|testemunho|relato) d[eo] (?:cliente|quem contratou)"
        r"|palavras? d[eo] cliente|veja o que .{0,24} diz sobre)", re.I)),

    ("3. resultado atribuído à agência", re.compile(
        r"(a Leon Group (?:aumentou|dobrou|triplicou|multiplicou|gerou|trouxe|levou|conseguiu)"
        r"|(?:aumentou|dobrou|triplicou|cresceu)\s+\d+\s*%"
        r"|resultados? comprovados?|casos? de sucesso)", re.I)),

    ("4. promessa de faturamento ou de posição", re.compile(
        r"(garant(?:imos|ido|ia) (?:resultado|faturamento|lead|posi[çc][ãa]o|primeiro lugar)"
        r"|voc[êe] vai (?:faturar|lucrar|ganhar) (?:US\$|R\$|\d)"
        r"|primeir[ao] (?:lugar|posi[çc][ãa]o) no Google"
        r"|top 1 do Google|fatur(?:e|amento) garantido)", re.I)),

    ("5. escritório ou equipe americana", re.compile(
        r"(noss[oa] escrit[óo]rio|escrit[óo]rio (?:em|nos|na) \w+"
        r"|noss[ao] (?:equipe|time) (?:em|nos|na|de) (?:Boston|Massachusetts|Los Angeles|Estados Unidos|EUA|Miami)"
        r"|estamos (?:em|nos) (?:Boston|Massachusetts|Los Angeles|Estados Unidos|EUA)"
        r"|nossa sede)", re.I)),
]

# ── regra 6 ──
# Todo valor em dólar precisa de fonte à vista. "À vista" é a VIZINHANÇA do
# número, não o parágrafo isolado: uma tabela de preços declara a origem no
# cabeçalho da seção, e a faixa de faturamento declara no parágrafo seguinte.
# Exigir a fonte dentro do mesmo parágrafo acusaria os dois casos, o auditor
# viraria ruído e alguém desligaria ele.
#
# A janela é de dois parágrafos antes e um depois, que é o que um leitor
# enxerga sem procurar. Mais que isso viraria carimbo: bastaria a palavra
# "fonte" em qualquer canto da seção para liberar um número solto.
JANELA_ANTES, JANELA_DEPOIS = 2, 1
FONTE = re.compile(
    r"(fonte|origem|segundo|apurad[oa]|levantamento|mentoria|p[áa]gina p[úu]blica"
    r"|p[áa]gina de planos|decis[ãa]o comercial|tabela|pre[çc]o de tabela"
    r"|conferir|a conferir|verificar|na descri[çc][ãa]o do an[úu]ncio"
    r"|publicad[oa]|WHOP|teto|limitad[oa])", re.I)
DOLAR = re.compile(r"US\$\s?\d")

TRAVESSAO = "—"


def paragrafos(txt):
    return [p for p in re.split(r"\n\s*\n", txt) if p.strip()]


def frases(par):
    return re.split(r"(?<=[.!?:])\s+|\n", par)


def texto_de(caminho):
    """JSON entra como texto legível, não como despejo de estrutura: o que
    importa é o que a IA de fora vai ler."""
    bruto = caminho.read_text("utf-8")
    if caminho.suffix == ".json":
        def achatar(v):
            if isinstance(v, str):
                return [v]
            if isinstance(v, list):
                return [x for i in v for x in achatar(i)]
            if isinstance(v, dict):
                return [x for i in v.values() for x in achatar(i)]
            return []
        try:
            return "\n\n".join(achatar(json.loads(bruto)))
        except Exception:
            return bruto
    return bruto


def auditar(pasta):
    arquivos = sorted(p for p in pasta.rglob("*") if p.suffix in (".md", ".json"))
    if not arquivos:
        sys.exit("nada para auditar em " + str(pasta))

    achados, dispensadas, dolares_ok = [], 0, 0

    for f in arquivos:
        rel = f.relative_to(pasta)
        txt = texto_de(f)

        # regra 7: travessão, sem exceção e sem teste de negação
        for i, linha in enumerate(txt.splitlines(), 1):
            if TRAVESSAO in linha:
                achados.append(("7. travessão", rel, i, linha.strip()[:110]))

        # regras 1 a 5: afirmação proibida, dispensando frase que nega
        for par in paragrafos(txt):
            for frase in frases(par):
                for nome, rx in REGRAS:
                    m = rx.search(frase)
                    if not m:
                        continue
                    if NEGACAO.search(frase):
                        dispensadas += 1
                        continue
                    achados.append((nome, rel, 0, frase.strip()[:110]))

        # regra 6: dólar sem fonte na vizinhança
        pars = paragrafos(txt)
        for i, par in enumerate(pars):
            if not DOLAR.search(par):
                continue
            vizinhanca = "\n".join(
                pars[max(0, i - JANELA_ANTES): i + 1 + JANELA_DEPOIS])
            if FONTE.search(vizinhanca):
                dolares_ok += 1
            else:
                achados.append(("6. dólar sem fonte", rel, 0,
                                re.sub(r"\s+", " ", par.strip())[:110]))

    print("\n\033[1mAuditoria do pacote de criativos\033[0m")
    try:
        onde_pasta = pasta.relative_to(RAIZ)
    except ValueError:
        onde_pasta = pasta          # auditando pasta de fora do projeto
    print("%d arquivos lidos em %s\n" % (len(arquivos), onde_pasta))

    if achados:
        print("\033[31m\033[1m%d violações\033[0m\n" % len(achados))
        for nome, rel, linha, trecho in achados:
            onde = "%s:%d" % (rel, linha) if linha else str(rel)
            print("  \033[31m✗\033[0m %-38s %s" % (nome, onde))
            print("      %s" % trecho)
        print()
        return 1

    for nome, _ in REGRAS:
        print("  \033[32m✓\033[0m " + nome)
    print("  \033[32m✓\033[0m 6. dólar sem fonte          %d trechos com valor, todos com fonte a %d parágrafos de distância" % (dolares_ok, JANELA_ANTES))
    print("  \033[32m✓\033[0m 7. travessão                nenhum, em nenhum arquivo")
    print("\n  %d frases citavam uma proibição e foram dispensadas por negarem" % dispensadas)
    print("\n\033[32m\033[1m✓ as sete regras passam\033[0m\n")
    return 0


if __name__ == "__main__":
    alvo = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else PADRAO
    sys.exit(auditar(alvo))
