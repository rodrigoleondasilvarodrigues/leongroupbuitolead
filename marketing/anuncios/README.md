# Roteiros de anúncio · Meta Ads

Vinte roteiros para tráfego pago, escritos no formato que as ferramentas
realmente aceitam. Dezesseis com ator de IA, quatro gravados pelo Rodrigo.

## Onde está o quê

| Arquivo | O que é |
|---|---|
| `roteiros-20.json` | **A fonte de verdade.** Os vinte roteiros. Editar aqui, nunca no HTML |
| `briefing.html` | As três seções de contexto (aulas, criativo de referência, o que muda). Reaproveitadas pelos dois documentos |
| `referencia-enrico/` | Frames extraídos do criativo que o Enrico mostrou na aula 02 |
| `dossie-aulas.json` | O que foi minerado das quatro aulas, com citação e origem |
| `testar-documento.mjs` | 25 verificações no documento montado |
| `roteiros-20-formato-antigo.json` | Versão anterior, de bloco único. Histórico, não usar |

Saídas em `saidas/`: `roteiros-anuncios.html` (artefato),
`roteiros-anuncios-impressao.html` e `Leon-Group-20-Roteiros-de-Anuncio.pdf`.

## Como o Arcads funciona de verdade

Isso define o formato do documento inteiro.

**Você não descreve o ator.** Clica em `Add Actors` e escolhe numa biblioteca
de mais de trezentos, filtrando por gênero, idade e cenário. Por isso cada
roteiro traz um **filtro de busca**, não uma descrição física.

**O único campo de texto é o script**, com contador de caracteres e duração
estimada. O teto depende do modelo:

| Modelo | Teto | Para |
|---|---|---|
| Omnihuman 1.5 | 400 caracteres | O mais expressivo, gesto de corpo inteiro |
| Audio Driven | 600 caracteres | 45s ou mais. É onde quase tudo aqui roda |
| Arcads 1.0 | 1500+ caracteres | Script longo, evitado de propósito |

Todos os scripts cabem em **600 caracteres**, o que dá 40 a 45 segundos com
respiro e **uma geração só**, sem emenda. O roteiro 20 cabe em 400.

**Áudio em `Settings > Audio > Speech to Speech`**, nunca Text to Speech.
Grava a própria voz com os respiros no lugar e a ferramenta troca a voz.

**B-roll** usa os modelos visuais que o próprio Arcads embute (Sora 2 Pro,
Veo 3.1, Kling 2.6). Seedance funciona igual. Um prompt por plano, em inglês.

## Montar de novo

```bash
python3 scripts/montar_roteiros.py --pdf   # artefato + impressão + PDF
python3 scripts/validar_roteiros_anuncio.py marketing/anuncios/roteiros-20.json
node marketing/anuncios/testar-documento.mjs
```

O gerador emite os dois documentos do mesmo JSON e do mesmo renderizador,
então eles não divergem.

## O que o validador barra

Teto de caracteres por modelo, ICP falado nas duas primeiras frases, marcação
de roteiro vazando pro campo de script, CTA no primeiro terço, buraco no
storyboard, travessão, valor em dólar sem fonte no frame nem entrada em
`verificar`, B-roll sem origem declarada, e as afirmações que a Leon Group não
pode sustentar hoje: cliente, depoimento, resultado, contagem de clientes,
presença física nos Estados Unidos e promessa de faturamento ou de posição.

## O que ficou de fora, e por quê

O pedido incluía inventar depoimento, atribuir resultado a cliente e afirmar
presença nos Estados Unidos. Isso não entrou:

- **Depoimento e resultado fabricados** em anúncio pago no mercado americano
  caem na regra de testemunhos da FTC, com multa civil por violação, e o Meta
  derruba o anúncio e pode derrubar a conta junto.
- **Presença nos EUA**: a própria aula documenta o mentorado que viu o cliente,
  com o cartão na mão pagando cinco mil dólares, perguntar "você tá no Brasil?"
  e desistir. O risco é comercial antes de ser ético.

A concretude que o pedido buscava entrou por outro caminho: cidade real, ofício
nomeado, valor de mercado com fonte, cena específica. A história é a **do
espectador**, em segunda pessoa, e os personagens de ilustração descrevem o
mercado (o contractor que repassa, o dono da casa), nunca um cliente da agência.

## Antes da primeira leva

Número americano no WhatsApp (hoje o site usa um brasileiro provisório), página
no Facebook e conta de anúncio, e o modelo do documento de diagnóstico, que o
roteiro 15 promete por escrito. Cada roteiro lista o que conferir no seu bloco
`verificar`.
