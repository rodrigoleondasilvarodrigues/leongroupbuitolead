#!/usr/bin/env python3
"""Monta o pacote de criativos para entregar a outra inteligência artificial.

Uso:  python3 scripts/montar_pacote_criativos.py

Junta, num diretório só e autoexplicativo, tudo que uma IA de fora precisa para
produzir os vídeos: contexto do negócio, oferta, produto, entrega, mecanismo,
regras de integridade, especificação técnica da ferramenta e os 26 roteiros.

POR QUE UM GERADOR, E NÃO UMA PASTA MONTADA NA MÃO
Os roteiros e a oferta continuam evoluindo nos arquivos de origem. Pacote
copiado na mão diverge da origem no primeiro ajuste, e aí a IA de fora produz
vídeo com preço velho ou com cidade que saiu do escopo. Aqui o pacote é sempre
refeito do zero a partir das fontes de verdade:

    marketing/anuncios/roteiros-20.json      os 20 de Massachusetts
    marketing/anuncios/roteiros-la.json      os 6 de Los Angeles
    sistemas/site-agencia/conteudo.js        a oferta publicada, PT e EN
    dados/checklist-otimizacao.json          o que a entrega cobre, item a item
    identidade/design-guide.md               a paleta

Rodar de novo depois de mexer em qualquer uma delas.
"""
import json, subprocess, pathlib, shutil, sys, datetime

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "saidas" / "pacote-criativos-ia"
HOJE = datetime.date.today().isoformat()


def ler_conteudo_js():
    """A oferta publicada mora em conteudo.js, que é JavaScript. Em vez de
    reescrever os preços aqui (duas tabelas divergem, e no dia em que
    divergirem alguém anuncia um preço que não existe), o node lê o arquivo
    de verdade e devolve JSON."""
    js = RAIZ / "sistemas" / "site-agencia" / "conteudo.js"
    codigo = (
        "const fs=require('fs');"
        "const src=fs.readFileSync(%r,'utf8');"
        "const {T}=new Function(src+'; return {T:T};')();"
        "process.stdout.write(JSON.stringify(T));" % str(js)
    )
    r = subprocess.run(["node", "-e", codigo], capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit("conteudo.js não pôde ser lido:\n" + r.stderr)
    return json.loads(r.stdout)


def bloco(titulo, linhas):
    return "## " + titulo + "\n\n" + "\n".join(linhas) + "\n\n"


# ══════════════════════════════════════════════════════════════════
# 00 · LEIA PRIMEIRO
# ══════════════════════════════════════════════════════════════════
def doc_leia_primeiro(n20, nla):
    return f"""# Pacote de criativos · Leon Group

Gerado em {HOJE} a partir dos arquivos de origem do projeto.

Você é a inteligência artificial que vai **produzir os vídeos** destes
roteiros. Este pacote é tudo que você precisa saber. Ele foi escrito para
alguém que não sabe nada sobre este negócio.

## As sete regras, antes de qualquer coisa

Este pacote foi auditado contra estas sete regras, e ele não pode ser gerado se
quebrar qualquer uma. **Elas valem também para tudo que VOCÊ produzir a partir
daqui:**

1. **Zero cliente inventado**
2. **Zero depoimento falso**
3. **Zero resultado atribuído à Leon Group**
4. **Zero promessa de faturamento ou de primeiro lugar no Google**
5. **Zero sugestão de escritório ou equipe americana**
6. **Zero número em dólar sem fonte declarada**
7. **Zero travessão** (o tracinho longo separando frase, em texto nenhum)

O porquê de cada uma está em `03-REGRAS-INEGOCIAVEIS.md`. Duas delas têm
consequência jurídica, não são preferência de estilo.

Se um pedido que você receber esbarrar em alguma delas, **não cumpra o pedido:
diga qual regra ele quebra.**

## Como usar isto numa IA de navegador (ChatGPT, Gemini, Claude)

**Dois passos, e a ordem importa:**

1. **Suba `CONTEXTO-COMPLETO.md` uma vez.** São os cinco documentos de contexto
   num arquivo só, cerca de 9 mil tokens. Cabe folgado e é lido inteiro.
2. **Depois suba um roteiro por vez**, de `roteiros-um-a-um/`. Cada arquivo tem
   2 a 3 mil tokens.

**Não suba `05-ROTEIROS-MASSACHUSETTS.md` esperando fidelidade palavra por
palavra.** Ele tem cerca de 70 mil tokens, e arquivo desse tamanho numa IA de
navegador deixa de ser lido inteiro: a ferramenta passa a buscar trechos. Para
ler o conjunto e escolher por onde começar, ele serve. Para produzir um vídeo
com a fala exata, use o arquivo individual do roteiro.

**Não suba o `.zip`.** A maioria das IAs de navegador só abre zip dentro de um
sandbox de código, o que funciona mal para absorver contexto. Suba os arquivos
soltos.

## Leia nesta ordem

| Arquivo | O que é | Quando usar |
|---|---|---|
| `CONTEXTO-COMPLETO.md` | **Comece aqui.** Os cinco documentos abaixo, juntos | Upload 1, sempre |
| `roteiros-um-a-um/` | Um arquivo por roteiro, pequeno e lido inteiro | Upload 2, um por vez |
| `01-NEGOCIO-PUBLICO-MERCADO.md` | Quem anuncia, para quem, em que mercado | Sempre, antes de tudo |
| `02-OFERTA-PRODUTO-ENTREGA.md` | O que é vendido, por quanto, o que é entregue, o mecanismo | Sempre |
| `03-REGRAS-INEGOCIAVEIS.md` | O que **nunca** pode ser dito, e por quê | Sempre. Esta é a mais importante |
| `04-COMO-PRODUZIR-OS-VIDEOS.md` | Ferramenta, tetos de caracteres, áudio, formato | Na hora de gerar |
| `05-ROTEIROS-MASSACHUSETTS.md` | Os {n20} roteiros da primeira leva | Na hora de gerar |
| `06-ROTEIROS-LOS-ANGELES.md` | Os {nla} roteiros da segunda leva | Na hora de gerar |
| `07-PRODUZIR-NO-ARCADS.md` | **Como produzir os vídeos no Arcads**, passo a passo, com os parâmetros exatos da ferramenta | Na hora de gerar |
| `arcads-passo-a-passo/` | As quatro telas do Arcads, da escolha do ator ao download | Junto com o 07 |
| `roteiros-massachusetts.json` | Os mesmos {n20}, estruturados, para importar | Importação automática |
| `roteiros-los-angeles.json` | Os mesmos {nla}, estruturados | Importação automática |
| `identidade/` | Logo, símbolo e paleta, para as cartelas na tela | Na edição |
| `referencia-visual/` | Frames do criativo de referência, **com a legenda que diz o que neles não pode ser copiado** | Para calibrar o visual. Leia o `.md` de lá antes de olhar as imagens |

## O trabalho, em uma frase

São **{n20 + nla} roteiros escritos e prontos**. Falta transformá-los em vídeo.
Roteiro escrito não é criativo pronto, e é exatamente esse o pedaço que falta.

## Três coisas que você precisa entender antes de começar

**1. O roteiro é verbatim.** O campo com a fala é palavra por palavra. Não
reescreva, não melhore, não "deixe mais natural". Cada frase foi medida para
caber no teto de caracteres da ferramenta e para dizer o ICP nas duas primeiras
frases. Mudar uma palavra pode estourar o teto ou apagar o filtro de público.

**2. As pessoas nos roteiros não são clientes.** Wilson, Cleiton e Sidnei são
personagens que **ilustram o problema do mercado**. Nenhum deles é cliente da
Leon Group, nenhum dá depoimento. Essa distinção é o que separa dramatização
legítima de testemunho fabricado, que é crime de propaganda nos Estados Unidos.
Está detalhado em `03-REGRAS-INEGOCIAVEIS.md`, e é inegociável.

**3. Dezesseis atores diferentes, não um.** Dezesseis vídeos com o mesmo rosto
na mesma parede saturam o público em uma semana. Cada roteiro traz o filtro do
ator que ele pede.

## Dois pontos ainda em aberto no negócio

Estes não estão resolvidos. Nenhum roteiro depende deles (nenhum roteiro cita
preço), mas se você for escrever copy nova, precisa saber:

- **O preço tem duas versões vivas.** A página pública de planos diz
  US$ 2.500 / 4.500 / 7.500. A decisão comercial de 2026-09-11 diz front de
  US$ 5.000 com piso de negociação em US$ 2.500. Estão em
  `02-OFERTA-PRODUTO-ENTREGA.md`, lado a lado. **Não anuncie preço** até isso
  ser resolvido por uma pessoa.
- **Território.** A segmentação é os Estados Unidos inteiros, filtrada por
  idioma português, não por cidade. As duas levas de roteiro são de cidades
  específicas por outro motivo: concretude. Explicado no arquivo 01.
"""


# ══════════════════════════════════════════════════════════════════
# 01 · NEGÓCIO, PÚBLICO, MERCADO
# ══════════════════════════════════════════════════════════════════
def doc_negocio(T):
    p = T["pt"]
    dores = "\n".join("- **%s.** %s" % (d[0], d[1]) for d in p["dores"])
    hist = "\n\n".join(x.replace("~", "") for x in p["hist"]) if isinstance(p["hist"], list) else p["hist"]
    return f"""# 1 · O negócio, o público e o mercado

## Quem anuncia

**Leon Group.** Slogan: **Built to Lead.**

Agência enxuta de geração de leads, operada por **uma pessoa**: o Rodrigo,
brasileiro, operando do Brasil. Não há escritório nos Estados Unidos, não há
equipe, e a agência é nova, sem cliente fechado até agora.

Isso não é um detalhe de bastidor, é uma restrição de roteiro: nada no vídeo
pode sugerir presença física nos Estados Unidos, equipe grande ou carteira de
clientes. O motivo está no arquivo 03.

## A história, na voz da própria marca

{hist}

## Para quem vende

Brasileiros **donos ou operadores de empresas de construção e home services nos
Estados Unidos**.

**Dois perfis, e o primeiro é a maioria:**

| Perfil | O que é | Fatia do mercado | Faturamento |
|---|---|---|---|
| **Subcontractor** | O pedreiro contratado. Executa a obra, não assina o orçamento | 85 a 90% | US$ 10 a 20 mil por mês |
| **Contractor** | O dono da obra. Fecha com o cliente final | 10 a 15% | US$ 30 a 60 mil por mês |

**Fonte desses números:** levantamento de mercado apresentado na mentoria que o
Rodrigo cursa. Uma versão anterior do mesmo material citava faixas mais altas
(US$ 15 a 30 mil e US$ 70 a 100 mil). **Não são medição da Leon Group e não
podem ser ditos em anúncio como dado próprio.** Servem para você entender com
quem está falando, não para virar número na tela.

Os dois já têm A-Number, o equivalente americano ao CNPJ.

**O subcontractor querendo virar contractor é o alvo central dos roteiros.**
É a pessoa que executa melhor que o concorrente e ganha menos que ele, porque o
concorrente aparece no Google e ele não.

## Quem é essa pessoa, de verdade

Homem, 30 a 55 anos, veio do Brasil, aprendeu o ofício na mão. Executa muito
bem. Cobra bem menos do que quem vende o mesmo serviço com o nome na porta.
Consegue trabalho por indicação e por WhatsApp de conterrâneo. Não tem site, ou
tem um que não abre direito no celular. Tem menos de dez avaliações no Google,
quando tem perfil. Nunca contratou marketing, ou contratou uma vez, pagou, e
não recebeu nada.

**O que ele sente, na ordem em que sente:** mês bom seguido de mês morto; ver o
concorrente que trabalha pior aparecer primeiro no Google; mandar orçamento e o
cliente sumir; a sensação de que está sempre recomeçando.

## As quatro dores, do jeito que a marca as nomeia

{dores}

## Os nichos

Construção e home services. Nove subnichos, todos dentro do escopo:

**Flooring** (90% dos clientes; subtipos hardwood, carpet, staircase, tile,
vinyl, laminate, epóxi), **Painting**, **Remodeling** (interior, exterior,
bathroom, kitchen), **Carpentry**, **Cabinets**, **Roofing**, **HVAC**,
**Gutter**, **Framing**.

Fora do escopo por ticket baixo: house cleaning, carpet cleaning, window tint,
car detail.

## Território: os Estados Unidos inteiros

Esta é a parte que mais confunde quem chega agora, então vale devagar.

**A segmentação da campanha é o país inteiro, filtrada por idioma português,
não por cidade.** Restringir a área encolhe o público e encarece a entrega. O
filtro real é o idioma: quem fala português e trabalha com construção nos
Estados Unidos.

**Mas os roteiros são de cidades específicas.** Vinte se passam em
Massachusetts (Everett, Malden, Framingham, Waltham, Medford, Revere, Quincy,
Lynn, Somerville) e seis em Los Angeles (Van Nuys, North Hollywood, Burbank,
Glendale, Pasadena, Long Beach, Inglewood, Torrance, Pomona).

Isso é de propósito. Uma história concreta converte mais que uma genérica:
"Wilson instala piso em Waltham" prende mais do que "um contractor em algum
lugar". A cidade é o detalhe que faz a história parecer real, não um recorte de
público.

**Nunca estreite a segmentação para uma região.** De onde os leads vêm se lê
depois, no CRM.

## O tamanho do mercado

Milhões de brasileiros nos Estados Unidos na construção civil, com
baixíssima concorrência direta no serviço que a Leon Group vende.

## O número de contato

**+1 213 396 0014** (área 213, Los Angeles), ativo no WhatsApp Business, com
atendimento nacional. É o número que aparece nas cartelas e nos CTAs.
"""


# ══════════════════════════════════════════════════════════════════
# 02 · OFERTA, PRODUTO, ENTREGA, MECANISMO
# ══════════════════════════════════════════════════════════════════
def doc_oferta(T, checklist):
    p = T["pt"]
    servicos = "\n".join(
        "### %s\n*%s*\n\n%s\n" % (s[1], s[3], s[2]) for s in p["servicos"]
    )
    passos = "\n".join(
        "%d. **%s**%s\n   %s" % (i + 1, s[0], (" · `" + s[2] + "`") if s[2] else "", s[1])
        for i, s in enumerate(p["passos"])
    )
    funcoes = "\n".join("| %s | %s |" % (f[0], f[1]) for f in p["funcoes"])

    planos = ""
    for pl in p["planos"]:
        nome, preco, mes, periodo, resumo, itens, marca = pl
        alvo = "  ← **é este o alvo**" if marca == "alvo" else ""
        planos += "### %s · US$ %s%s\n\n" % (nome, preco, alvo)
        planos += "US$ %s por mês, %s. %s\n\n" % (mes, periodo, resumo)
        # a origem do número vai junto do número, e não só no alto da seção:
        # é o bloco inteiro que pode ser copiado sozinho para outro lugar
        planos += "*Fonte: página pública de planos da Leon Group.*\n\n"
        planos += "\n".join("- " + i for i in itens) + "\n\n"

    periodos = ""
    for nome, linhas in p["planos_periodos"]:
        periodos += "**%s**  *(fonte: página pública de planos)*\n\n" % nome
        periodos += "| Prazo | Total | O que muda |\n|---|---|---|\n"
        for meses, valor, nota in linhas:
            periodos += "| %d meses | US$ %s | %s |\n" % (meses, f"{valor:,}".replace(",", "."), nota)
        periodos += "\n"

    areas = {}
    for item in checklist:
        areas.setdefault(item["area"], []).append(item)
    cobertura = ""
    for area, itens in areas.items():
        obrig = sum(1 for i in itens if i.get("obrigatorio"))
        cobertura += "- **%s**: %d itens (%d obrigatórios)\n" % (area, len(itens), obrig)

    faq = "\n".join("**%s**\n\n%s\n" % (f[0], f[1]) for f in p["faq"])

    return f"""# 2 · A oferta, o produto, a entrega e o mecanismo

Este é o arquivo que diz **o que a Leon Group vende de verdade**. Nada além do
que está aqui pode ser prometido em anúncio.

## A promessa central

> {p['hero_sub']}

Duas coisas nessa frase carregam o peso, e as duas são diferenciais reais:

- **Sem depender de tráfego pago.** O cliente não precisa queimar US$ 4 a 6 mil
  por semana em Meta e Google para começar a receber contato. (Essa faixa vem do
  levantamento da mentoria sobre o que o mercado gasta, não de medição da Leon
  Group. Não usar como número na tela.)
- **Sem precisar de license.** O Google Local Service Ads, que é o canal mais
  direto, exige licença que cerca de 90% dos contractors brasileiros não tem.
  O método da Leon Group não passa por lá.

## O mecanismo único: a ordem

**O mecanismo não é uma ferramenta nova, é uma ordem de execução.** É isso que
diferencia a Leon Group de agência que vende post bonito ou tráfego solto.

A ordem é:

{passos}

**O tráfego pago entra por último, de propósito.** Esta é uma decisão firmada e
o site diz isso abertamente. Anúncio apontando para presença fraca, site que não
converte e follow-up que não existe é o jeito mais caro de não vender nada. Com
a casa arrumada primeiro, o mesmo dólar de anúncio rende muito mais.

Essa inversão é contraintuitiva para o mercado (todo mundo vende tráfego
primeiro) e por isso ela é um ângulo forte de criativo. Vários roteiros giram em
torno dela.

## O que é entregue, serviço por serviço

{servicos}

## Os planos e os preços

⚠ **ATENÇÃO: o preço tem duas versões vivas e isso não está resolvido.**

**Versão A, a que está publicada na página de planos:**

{planos}
**Por prazo de contrato:**

{periodos}
**Versão B, a decisão comercial de 2026-09-11:** front de **US$ 5.000**, com
**piso de negociação em US$ 2.500**. A lógica é abrir mais caro e negociar para
baixo, nunca abrir no piso. No pior caso, US$ 2.000 de recorrência mensal.

**Restrição de cobrança:** o link do WHOP está limitado a **US$ 2.500 por
cobrança**. Valor acima disso precisa ser partido.

**O que fazer com isso:** nenhum dos 26 roteiros cita preço, e isso foi
verificado. **Não introduza preço em criativo nenhum** até uma pessoa resolver
qual versão vale.

## O prazo e o formato da entrega

- **5 dias úteis** para a construção completa, com **reunião de entrega no
  quinto dia**
- Depois disso, **3 meses de acompanhamento** no WhatsApp
- **Os arquivos originais e todos os logins ficam com o cliente.** A agência não
  guarda acesso. Esse ponto responde direto ao medo de quem já foi abandonado
  por agência antes

## A profundidade da entrega, em números

A otimização é auditada contra um checklist de **{len(checklist)} itens**,
o mesmo vocabulário usado no diagnóstico gratuito:

{cobertura}
Cada item tem o passo a passo escrito. Não é lista de conferência genérica, é a
régua da entrega.

## A oferta de entrada: o diagnóstico gratuito

**É a isca, e ela é real.** Um documento **por escrito**, em PDF na identidade
da marca, avaliando o Google Business Profile, o site e as avaliações do lead,
item por item, com o estado de cada um (feito, parcial, falta, não se aplica).

Isso importa para o criativo por dois motivos:

1. **É trabalho de verdade, não isca falsa.** Quando alguém pedir, o documento
   é entregue mesmo. Vários roteiros prometem isso em texto, e a promessa tem
   que se sustentar.
2. **É o que o CTA pede.** O criativo não vende o pacote e não cita preço. Ele
   pede uma conversa no WhatsApp em troca de um diagnóstico gratuito e por
   escrito. Essa é a única conversão que o vídeo precisa produzir, e é por isso
   que a indefinição de preço não trava a produção dos vídeos.

## O processo comercial, depois do clique

O vídeo entrega o lead no WhatsApp. Dali em diante:

- **A regra é ligar em menos de um minuto.** Velocidade fecha mais que argumento
- Qualificação, depois call, depois o diagnóstico apresentado ao vivo
- CRM com régua de temperatura e follow-up. Nenhum lead sai do funil sem dizer
  explicitamente que não quer
- **A analogia interna de vendas:** "a agência é uma consultoria médica, ouve,
  ouve, ouve, e no final entrega a receita." O cliente não pode sentir que você
  quer vender

## As doze funções

A agência é operada por uma pessoa apoiada em processo e automação, e cobre doze
funções. **Isto é escopo de trabalho, nunca contagem de funcionários.** Dizer ou
sugerir que a Leon Group tem doze pessoas é mentira.

| Função | O que faz |
|---|---|
{funcoes}

> {p['func_nota']}

## Perguntas que o público faz, e as respostas oficiais

{faq}
"""


# ══════════════════════════════════════════════════════════════════
# 03 · REGRAS INEGOCIÁVEIS
# ══════════════════════════════════════════════════════════════════
def doc_regras():
    return """# 3 · Regras inegociáveis

**Se você ler um arquivo só deste pacote, leia este.**

**As sete, em uma linha cada:** zero cliente inventado, zero depoimento falso,
zero resultado atribuído à Leon Group, zero promessa de faturamento ou de
primeiro lugar no Google, zero sugestão de escritório ou equipe americana, zero
número em dólar sem fonte declarada, e nada de travessão.

As regras abaixo não são preferência de estilo. Algumas são consequência
jurídica, outras são decisão comercial já tomada. Um vídeo que quebre qualquer
uma delas não pode ir ao ar, por melhor que esteja.

## O que NUNCA pode aparecer

### 1. Depoimento, cliente ou resultado inventado

A Leon Group **não tem cliente fechado até hoje**. Portanto:

- Nenhuma pessoa no vídeo pode ser apresentada como cliente da Leon Group
- Nenhuma pessoa pode dar depoimento sobre o serviço
- Nenhum resultado pode ser atribuído a um cliente
- Nenhuma contagem de clientes pode ser citada

**Por quê:** depoimento fabricado em anúncio pago no mercado americano cai na
regra de testemunhos da FTC, com multa civil por violação, e o Meta derruba o
anúncio e pode derrubar a conta junto.

**Como os roteiros resolvem isso, e você precisa preservar:** cada anúncio conta
a história de uma pessoa com nome, ofício e cidade. Wilson instala piso em
Waltham. Cleiton faz banheiro entre Everett e Malden. Sidnei tem seis avaliações
contra duzentas e quatorze do concorrente.

**Esses personagens ilustram o problema do mercado, e a agência entra depois.**
Nenhum é apresentado como cliente, nenhum dá depoimento. É exatamente isso que
separa dramatização legítima de testemunho fabricado. Não aproxime os dois.

### 2. Presença física nos Estados Unidos

A operação é remota, do Brasil. Nada pode sugerir escritório, equipe ou
endereço americano.

**Por quê, e este motivo é comercial antes de ser ético:** a própria aula da
mentoria documenta o caso do mentorado que viu o cliente, com o cartão na mão
pagando cinco mil dólares, perguntar "você tá no Brasil?" e desistir. Mentir
sobre isso cria uma bomba-relógio na call.

### 3. Promessa de faturamento ou de posição no Google

Nada de "você vai faturar X", "você vai aparecer em primeiro lugar", "garanto
tantos leads". Sem base verificável, não se promete.

### 4. Equipe grande

As doze funções são **escopo de trabalho**. Nunca headcount. A agência é uma
pessoa apoiada em processo e automação, e o site diz isso abertamente.

### 5. Valor em dólar sem fonte

Todo número em dólar que aparecer na tela ou na fala precisa de fonte declarada
no frame. Os roteiros já trazem isso no campo `verificar` de cada um. Não
invente número novo, e não reaproveite número de Massachusetts num roteiro de
Los Angeles: ticket de Boston não é ticket de Los Angeles.

### 6. B-roll sem origem declarada

Nenhuma imagem de banco sem licença. Nenhuma obra de terceiro apresentada como
obra do cliente. Cada plano de apoio precisa de origem declarada.

## A regra de escrita que vale em todo texto

**Nada de travessão.** O tracinho longo separando frase não entra em lugar
nenhum: fala, legenda, cartela, descrição, título. É regra permanente do dono do
negócio, dada em 2026-09-06. Usar vírgula, dois-pontos, ponto ou parêntese no
lugar. Hífen de palavra composta (pré-venda, follow-up) continua normal.

## O tom de voz

**Confiante, direto, profissional, claro, próximo de contractor brasileiro nos
Estados Unidos.** Conversa de estacionamento, não apresentação de palco.

**Evitar sempre:**

- "Vamos juntos!"
- "Caro cliente"
- Jargão de guru: "alavancar", "sinergia", "mindset", "destravar"
- Emoji em contexto formal
- Entusiasmo de vendedor. O ator precisa parecer alguém que já pegou no pesado
  e fala reto, não modelo de comercial

## O idioma

**Os roteiros são em português**, porque o público é brasileiro morando nos
Estados Unidos e a campanha é filtrada por idioma português. Não traduza para
inglês. Termos técnicos do ofício ficam em inglês, do jeito que o público usa
no dia a dia: engineered hardwood, subcontractor, drywall, estimate.

## A identidade visual nas cartelas

| Uso | HEX |
|---|---|
| Preto, fundo de cartela | `#171717` |
| Marfim, texto sobre preto | `#F7F3EA` |
| Laranja, ênfase e CTA | `#E65A19` |
| Laranja escuro | `#C44712` |
| Areia | `#E9E1D6` |
| Cinza de apoio | `#68645E` |

**O símbolo da marca é uma cabeça de leão integrada à letra O de LEON.** Nunca
usar versão sem o leão. Os arquivos estão em `identidade/`.

**Direção estética:** sofisticada, limpa, bastante espaço negativo, laranja só
como ênfase e nunca como fundo dominante. **Evitar:** 3D, brilho, sombra
pesada, ornamento em excesso e aparência genérica de IA.
"""


# ══════════════════════════════════════════════════════════════════
# 04 · COMO PRODUZIR
# ══════════════════════════════════════════════════════════════════
def doc_producao(roteiros):
    ia = [r for r in roteiros if r["tipo"] == "ia"]
    grav = [r for r in roteiros if r["tipo"] != "ia"]
    maior = max(r["script_chars"] for r in roteiros)
    return f"""# 4 · Como produzir os vídeos

## O que existe e o que falta

{len(roteiros)} roteiros escritos. **{len(ia)} para ator de inteligência
artificial** e **{len(grav)} para o Rodrigo gravar ele mesmo**, que custam zero
e por isso vêm primeiro.

Os vídeos **não existem**. É esse o trabalho.

## A ferramenta e o teto de caracteres

A ferramenta prevista é o **Arcads**. Cada modelo tem um teto:

| Modelo | Teto | Para |
|---|---|---|
| Omnihuman 1.5 | 400 caracteres | O mais expressivo, gesto de corpo inteiro |
| Audio Driven | 600 caracteres | 45 segundos ou mais. É onde quase tudo aqui roda |
| Arcads 1.0 | 1500+ caracteres | Script longo, evitado de propósito |

**Todos os scripts cabem em 600 caracteres.** O maior tem {maior}. Isso dá 40 a
45 segundos com respiro e **uma geração só, sem emenda**. Cada roteiro traz o
modelo recomendado no campo próprio, com o motivo.

## O áudio

**`Settings > Audio > Speech to Speech`, nunca Text to Speech.**

Grave a própria voz com os respiros no lugar e deixe a ferramenta trocar a voz.
Text to Speech entrega leitura, não fala, e o público reconhece na hora. Cada
roteiro traz uma orientação de áudio específica: onde acelerar, onde parar, onde
a frase cai.

## A escolha do ator

**Na biblioteca do Arcads você escolhe o ator, não descreve.** Por isso cada
roteiro traz um filtro pronto: `Add Actors`, gênero, faixa etária, cenário.

**Os {len(ia)} atores precisam ser pessoas diferentes em lugares diferentes**,
de trinta e um a quarenta e sete anos, em garagem, picape, obra, depósito e
cozinha em reforma. Dezesseis vídeos com o mesmo rosto na mesma parede saturam
o público em uma semana.

Em todos: procurar alguém que parece que já pegou no pesado e fala reto.
**Descartar** ator com sorriso de comercial, gesticulação de palestrante ou
fundo de escritório com plantinha.

## O formato de cada roteiro

Cada um tem um **prompt único, copiável de uma vez**, com quatro seções:

- **QUEM** a pessoa é, incluindo o filtro da biblioteca
- **ONDE** ela está
- **O QUE FALA**, palavra por palavra
- **O QUE NUNCA PODE APARECER**

Abaixo do prompt vem o **storyboard** daquele roteiro, em três colunas: tempo,
imagem, e o que aparece escrito na tela. **Os planos de apoio vivem na coluna
Imagem**, não em prompts separados. Se for gerar algum, a descrição da célula já
serve de prompt.

Nada além do prompt precisa ir para a ferramenta.

## A ordem de produção, e ela importa por dinheiro

O Arcads cobra **US$ 110 por 10 vídeos**, não tem teste grátis, e "não gostei do
resultado" **não é reembolsável**. (Preço de tabela da própria ferramenta,
apurado em 2026-09-09. Confira antes de comprar: preço de ferramenta muda.)
Então:

1. **Gravar primeiro os {len(grav)} do Rodrigo.** Custam zero
2. **Depois 1 no Arcads**, só para conferir o resultado
3. **Só então 3 ou 4 por vez**

Nunca gerar os dezesseis de uma vez.

## O que conferir antes de publicar qualquer um

Cada roteiro tem um campo `verificar` com a lista dele. Além disso, vale para
todos:

- Nenhuma afirmação proibida pelo arquivo 03 sobrou no vídeo
- Nenhum travessão na legenda nem na cartela
- Todo valor em dólar na tela tem fonte declarada
- O número de WhatsApp na cartela foi testado ponta a ponta antes de ir ao ar
"""


# ══════════════════════════════════════════════════════════════════
# 05/06 · OS ROTEIROS
# ══════════════════════════════════════════════════════════════════
def doc_roteiros(roteiros, titulo, intro):
    out = "# " + titulo + "\n\n" + intro + "\n\n"

    out += "## Índice\n\n| Nº | Grupo | Título | Duração | Tipo |\n|---|---|---|---|---|\n"
    for r in roteiros:
        tipo = "ator de IA" if r["tipo"] == "ia" else "Rodrigo grava"
        out += "| %d | %s | %s | %ds | %s |\n" % (
            r["numero"], r["grupo"], r["titulo"], r["duracao_seg"], tipo)
    out += "\n---\n\n"

    for r in roteiros:
        tipo = "ator de IA" if r["tipo"] == "ia" else "gravado pelo Rodrigo"
        out += "## Roteiro %d · %s\n\n" % (r["numero"], r["titulo"])
        out += "`%s` · %d segundos · %s · %d caracteres de script\n\n" % (
            r["grupo"], r["duracao_seg"], tipo, r["script_chars"])
        out += "**O ângulo:** %s\n\n" % r["hook_resumo"]
        out += "**Modelo:** %s\n\n" % r["modelo_arcads"]

        out += "### O prompt, copiar de uma vez\n\n```\n%s\n```\n\n" % r["prompt_arcads"]

        out += "### Escolha do ator\n\n%s\n\n" % r["filtro_ator"]
        out += "### Áudio\n\n%s\n\n" % r["audio"]

        out += "### Storyboard\n\n| Tempo | Imagem | Na tela |\n|---|---|---|\n"
        for c in r["storyboard"]:
            limpa = lambda s: str(s).replace("|", "/").replace("\n", " ")
            out += "| `%s` | %s | %s |\n" % (limpa(c["t"]), limpa(c["imagem"]), limpa(c.get("tela", "")))
        out += "\n"

        if r.get("broll"):
            # cada plano de apoio já vem com prompt pronto e origem declarada,
            # que é o que a regra de integridade exige de todo B-roll
            out += "### Planos de apoio, com prompt pronto\n\n"
            for b in r["broll"]:
                if isinstance(b, dict):
                    out += "**`%s`** · origem: %s\n\n```\n%s\n```\n\n" % (
                        b.get("quando", ""), b.get("origem", "não declarada"), b.get("prompt", ""))
                else:
                    out += "- %s\n\n" % b

        out += "### Para publicar\n\n"
        out += "**Headline estática:** %s\n\n" % r["headline_estatica"]
        out += "**CTA:** %s\n\n" % r["cta"]
        out += "**Legenda do Meta:**\n\n```\n%s\n```\n\n" % r["legenda_meta"]

        out += "### Integridade\n\n%s\n\n" % r["integridade"]
        out += "### Conferir antes de publicar\n\n" + \
               "\n".join("- [ ] " + v for v in r["verificar"]) + "\n\n---\n\n"
    return out


# ══════════════════════════════════════════════════════════════════
def main():
    r20 = json.loads((RAIZ / "marketing/anuncios/roteiros-20.json").read_text("utf-8"))
    rla = json.loads((RAIZ / "marketing/anuncios/roteiros-la.json").read_text("utf-8"))
    checklist = json.loads((RAIZ / "dados/checklist-otimizacao.json").read_text("utf-8"))
    T = ler_conteudo_js()

    if SAIDA.exists():
        shutil.rmtree(SAIDA)
    SAIDA.mkdir(parents=True)

    escrever = lambda nome, txt: (SAIDA / nome).write_text(txt, "utf-8")

    escrever("00-LEIA-PRIMEIRO.md", doc_leia_primeiro(len(r20), len(rla)))
    escrever("01-NEGOCIO-PUBLICO-MERCADO.md", doc_negocio(T))
    escrever("02-OFERTA-PRODUTO-ENTREGA.md", doc_oferta(T, checklist))
    escrever("03-REGRAS-INEGOCIAVEIS.md", doc_regras())
    escrever("04-COMO-PRODUZIR-OS-VIDEOS.md", doc_producao(r20 + rla))

    # O guia do Arcads é a etapa seguinte ao roteiro: sem ele o pacote entrega
    # o que falar e não entrega como produzir. Escrito AQUI, e não lá embaixo
    # junto das imagens, porque o CONTEXTO-COMPLETO.md logo abaixo o consome.
    guia = RAIZ / "marketing/anuncios/ARCADS-FLUXO-PARA-IA.md"
    if guia.exists():
        escrever("07-PRODUZIR-NO-ARCADS.md", guia.read_text("utf-8"))

    escrever("05-ROTEIROS-MASSACHUSETTS.md", doc_roteiros(
        r20, "5 · Os 20 roteiros · leva Massachusetts",
        "Cidades: Everett, Malden, Framingham, Waltham, Medford, Revere, Quincy,\n"
        "Lynn e Somerville. Dezesseis com ator de IA, quatro gravados pelo Rodrigo\n"
        "(os de número 17 a 20)."))

    escrever("06-ROTEIROS-LOS-ANGELES.md", doc_roteiros(
        rla, "6 · Os 6 roteiros · leva Los Angeles",
        "Numerados 101 a 106, adaptação dos roteiros 1, 2, 4, 12, 15 e 20.\n\n"
        "**Adaptação não foi troca de nome de cidade.** O roteiro 4 girava em torno\n"
        "de fevereiro, neve e ice dam, que não existem no sul da Califórnia, e virou\n"
        "a estação de chuva de janeiro (roteiro 103). E nenhum valor em dólar de\n"
        "Massachusetts foi reaproveitado: ticket de Boston não é ticket de Los\n"
        "Angeles, então onde havia número, ou ele saiu, ou entrou como faixa a\n"
        "conferir em fonte local antes de gravar.\n\n"
        "Cidades: Van Nuys, North Hollywood, Burbank, Glendale, Pasadena, Long\n"
        "Beach, Inglewood, Torrance e Pomona."))

    escrever("roteiros-massachusetts.json", json.dumps(r20, ensure_ascii=False, indent=1))
    escrever("roteiros-los-angeles.json", json.dumps(rla, ensure_ascii=False, indent=1))

    # ── CONTEXTO-COMPLETO.md ──
    # Os quatro documentos de contexto num arquivo só, porque a forma de usar
    # isto numa IA de navegador é: sobe o contexto inteiro uma vez (cabe folgado
    # na janela), depois um roteiro por vez. Quatro uploads viram um.
    partes = ["00-LEIA-PRIMEIRO.md", "01-NEGOCIO-PUBLICO-MERCADO.md",
              "02-OFERTA-PRODUTO-ENTREGA.md", "03-REGRAS-INEGOCIAVEIS.md",
              "04-COMO-PRODUZIR-OS-VIDEOS.md", "07-PRODUZIR-NO-ARCADS.md"]
    junto = ("# Leon Group · contexto completo para produzir os criativos\n\n"
             "Os seis documentos de contexto deste pacote, num arquivo só,\n"
             "incluindo o passo a passo da produção no Arcads.\n"
             "Os roteiros vêm à parte, um por arquivo, em `roteiros-um-a-um/`.\n\n"
             + "\n\n---\n\n".join((SAIDA / n).read_text("utf-8") for n in partes))
    escrever("CONTEXTO-COMPLETO.md", junto)

    # ── roteiros-um-a-um/ ──
    # Um arquivo por roteiro. Arquivo grande numa IA de navegador deixa de ser
    # lido inteiro e passa a ser buscado por trecho, e roteiro precisa sair
    # palavra por palavra. Arquivo pequeno é sempre lido inteiro.
    def slug(txt):
        import unicodedata, re
        t = unicodedata.normalize("NFKD", txt).encode("ascii", "ignore").decode()
        return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", t.lower())).strip("-")

    umaum = SAIDA / "roteiros-um-a-um"
    umaum.mkdir()
    for r in r20 + rla:
        nome = "roteiro-%03d-%s.md" % (r["numero"], slug(r["titulo"]))
        corpo = doc_roteiros([r], "Roteiro %d · %s" % (r["numero"], r["titulo"]),
                             "Leia o `CONTEXTO-COMPLETO.md` antes deste arquivo.")
        # o índice de um item só é ruído
        corpo = corpo.split("---\n\n", 1)[1] if "---\n\n" in corpo else corpo
        (umaum / nome).write_text(corpo, "utf-8")

    # identidade e referência visual
    (SAIDA / "identidade").mkdir()
    for origem, destino in [
        ("identidade/brand-kit/07-simbolo-transparente.png", "simbolo-leao.png"),
        ("identidade/brand-kit/02-logo-horizontal-transparente.png", "logo-horizontal.png"),
        ("identidade/brand-kit/12-logo-monocromatica-branca.png", "logo-branca.png"),
        ("identidade/brand-kit/21-paleta-de-cores.png", "paleta-de-cores.png"),
    ]:
        f = RAIZ / origem
        if f.exists():
            shutil.copy2(f, SAIDA / "identidade" / destino)

    ref = RAIZ / "marketing/anuncios/referencia-enrico"
    if ref.exists():
        shutil.copytree(ref, SAIDA / "referencia-visual")
    # Os frames sozinhos são perigosos: são de um criativo cujo depoimento é
    # inventado. Sem o texto ao lado, uma IA de fora olha as imagens e copia
    # o que não pode ser copiado. A legenda viaja junto.
    doc_ref = RAIZ / "marketing/anuncios/CRIATIVO-DE-REFERENCIA-ENRICO.md"
    if doc_ref.exists():
        shutil.copy2(doc_ref, SAIDA / "referencia-visual" / "LEIA-ANTES-DE-OLHAR-OS-FRAMES.md")

    prints = RAIZ / "marketing/anuncios/arcads-passo-a-passo"
    if prints.exists():
        shutil.copytree(prints, SAIDA / "arcads-passo-a-passo")

    arquivos = sorted(p for p in SAIDA.rglob("*") if p.is_file())
    total = sum(p.stat().st_size for p in arquivos)
    print("Pacote montado em  %s" % SAIDA.relative_to(RAIZ))
    print("%d arquivos, %.1f MB, %d roteiros\n" % (len(arquivos), total / 1e6, len(r20) + len(rla)))
    for p in arquivos:
        print("  %-46s %7.1f KB" % (p.relative_to(SAIDA), p.stat().st_size / 1024))

    # ── o portão ──
    # A auditoria roda AQUI, e não como passo separado que alguém lembra de
    # rodar. Material que vai para uma IA de fora é material que sai do
    # controle: se quebrar uma das sete regras, o pacote não pode existir.
    sys.path.insert(0, str(RAIZ / "scripts"))
    from auditar_pacote_criativos import auditar
    if auditar(SAIDA) != 0:
        shutil.rmtree(SAIDA)
        sys.exit("\nPacote APAGADO por violar as regras. Corrija a origem e rode de novo.")


if __name__ == "__main__":
    main()
