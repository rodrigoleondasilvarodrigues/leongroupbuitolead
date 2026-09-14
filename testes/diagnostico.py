#!/usr/bin/env python3
"""O diagnóstico: modelo, gerador e o que nunca pode vazar para o cliente.

Rodar: python3 testes/diagnostico.py
"""
import json, pathlib, re, subprocess, sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
ok = mau = 0
def t(nome, cond, extra=""):
    global ok, mau
    if cond: ok += 1; print(f"  \033[32mv\033[0m {nome}" + (f"  -> {extra}" if extra else ""))
    else: mau += 1; print(f"  \033[31mx FALHOU\033[0m {nome}" + (f"  -> {extra}" if extra else ""))

modelo = json.load(open(RAIZ / "dados/diagnostico-modelo.json"))
exemplo = json.load(open(RAIZ / "dados/diagnostico-exemplo.json"))

print("\n\033[1m=== O MODELO ESTA COMPLETO ===\033[0m")
itens = [i for a in modelo["areas"] for i in a["itens"]]
t("tres areas", len(modelo["areas"]) == 3, " · ".join(a["titulo"] for a in modelo["areas"]))
t("27 itens", len(itens) == 27, f"{len(itens)} itens")
t("todo item diz o que o cliente faz", all(i.get("fazer", "").strip() for i in itens))
t("todo item diz onde VOCE olha", all(i.get("onde_olhar", "").strip() for i in itens))
t("o modelo nasce todo em falta, pra obrigar a auditar",
  all(i["estado"] == "falta" for i in itens))
t("o modelo nasce sem observacao", all(not i.get("obs") for i in itens))

print("\n\033[1m=== O QUE NAO PODE VAZAR PRO CLIENTE ===\033[0m")
subprocess.run([sys.executable, str(RAIZ / "scripts/gerar_diagnostico.py"),
                str(RAIZ / "dados/diagnostico-exemplo.json")], capture_output=True)
html = (RAIZ / "saidas/diagnostico-exemplo.html").read_text()
vazou = [i["item"] for a in exemplo["areas"] for i in a["itens"]
         if i.get("onde_olhar") and i["onde_olhar"][:45] in html]
t("nenhuma instrucao de auditoria no PDF", not vazou, vazou[0] if vazou else "limpo")
t("o gerador ignora chave que nao conhece", "onde_olhar" not in html)

print("\n\033[1m=== O EXEMPLO ESTA ROTULADO ===\033[0m")
t("o exemplo se declara exemplo", exemplo.get("exemplo") is True)
t("e o selo sai impresso", "modelo de demonstração" in html)
t("o modelo em branco NAO se declara exemplo", modelo.get("exemplo") is False)

print("\n\033[1m=== INTEGRIDADE DO QUE VAI IMPRESSO ===\033[0m")
texto = json.dumps(exemplo, ensure_ascii=False)
t("nao promete posicao no Google",
  not re.search(r"(garant|prometo|vai ficar em)\w*\s*\w*\s*(primeiro lugar|1º lugar|topo do google)", texto, re.I))
t("nao promete faturamento", not re.search(r"(vai faturar|garantimos|garanto)\s*\w*\s*(R\$|US\$|\d)", texto, re.I))
t("nao acusa avaliacao de fraude", not re.search(r"(comprou|fraude|falsific)\w*\s*avalia", texto, re.I))
t("nenhum travessao", not re.search(r"[—–]", texto))

print("\n\033[1m=== A ORDEM DE CORRECAO EXPLICA O PORQUE ===\033[0m")
t("o exemplo tem ordem preenchida", len(exemplo.get("ordem", [])) >= 5,
  f"{len(exemplo.get('ordem', []))} passos")
t("todo passo diz o que, como e por que",
  all(p.get("o_que") and p.get("como") and p.get("porque") for p in exemplo["ordem"]))

print("\n\033[1m=== O PASSO A PASSO EXISTE ===\033[0m")
guia = (RAIZ / "propostas/diagnostico-passo-a-passo.md").read_text()
t("o guia cita o comando do gerador", "gerar_diagnostico.py" in guia)
t("diz que sao duas informacoes do cliente", re.search(r"duas (coisas|informa)", guia, re.I) is not None)
t("diz para entregar na call, nao antes", re.search(r"na call, na tela, n[ãa]o antes", guia, re.I) is not None)
t("lista os quatro estados", all(f"`{e}`" in guia for e in ("ok", "parcial", "falta", "na")))

print(f"\n\033[{'31' if mau else '32'}m\033[1m{ok} passaram, {mau} falharam\033[0m")
sys.exit(1 if mau else 0)
