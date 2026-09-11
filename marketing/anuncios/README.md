# Roteiros de anúncio · Meta Ads

Vinte roteiros para tráfego pago, escritos no formato que as ferramentas
realmente aceitam. Dezesseis com ator de IA, quatro gravados pelo Rodrigo.

## Onde está o quê

| Arquivo | O que é |
|---|---|
| `roteiros-20.json` | **A fonte de verdade da leva Massachusetts.** Os vinte roteiros. Editar aqui, nunca no HTML |
| `roteiros-la.json` | **A leva Los Angeles.** Seis roteiros, adaptação dos 1, 2, 4, 12, 15 e 20 |
| `briefing.html` | As três seções de contexto (aulas, criativo de referência, o que muda). Reaproveitadas pelos dois documentos |
| `referencia-enrico/` | Frames extraídos do criativo que o Enrico mostrou na aula 02 |
| `dossie-aulas.json` | O que foi minerado das quatro aulas, com citação e origem |
| `testar-documento.mjs` | 25 verificações no documento montado |
| `roteiros-20-formato-antigo.json` | Versão anterior, de bloco único. Histórico, não usar |

Saídas em `saidas/`: `roteiros-anuncios.html` (artefato),
`roteiros-anuncios-impressao.html` e `Leon-Group-20-Roteiros-de-Anuncio.pdf`.

## O formato

**Um prompt por roteiro.** Um bloco só, copiável de uma vez: QUEM é a pessoa,
ONDE ela está, O QUE FALA palavra por palavra, e o que NUNCA pode aparecer.
Abaixo dele, o storyboard daquele prompt. Nada mais sai daqui pra ferramenta.

A seção QUEM já traz o filtro da biblioteca do Arcads (`Add Actors`, gênero,
idade, cenário), porque lá você escolhe o ator em vez de descrever. A seção
O QUE FALA é o que vai no campo de script.

**Os dezesseis atores são pessoas diferentes em lugares diferentes**, de
trinta e um a quarenta e sete anos, em garagem, picape, obra, depósito e
cozinha em reforma. Dezesseis vídeos com o mesmo rosto na mesma parede
saturam o público em uma semana.

**Teto de caracteres por modelo:**

| Modelo | Teto | Para |
|---|---|---|
| Omnihuman 1.5 | 400 caracteres | O mais expressivo, gesto de corpo inteiro |
| Audio Driven | 600 caracteres | 45s ou mais. É onde quase tudo aqui roda |
| Arcads 1.0 | 1500+ caracteres | Script longo, evitado de propósito |

Todos os scripts cabem em **600 caracteres**, o que dá 40 a 45 segundos com
respiro e **uma geração só**, sem emenda. O roteiro 20 cabe em 400.

**Áudio em `Settings > Audio > Speech to Speech`**, nunca Text to Speech.
Grava a própria voz com os respiros no lugar e a ferramenta troca a voz.

**Os planos de apoio vivem na coluna Imagem do storyboard**, não em prompts
separados. Se for gerar algum, a descrição da célula já serve de prompt.

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

A concretude entrou por outro caminho: cada anúncio conta a história de uma
pessoa com nome, ofício e cidade. Wilson instala piso em Waltham, Cleiton faz
banheiro entre Everett e Malden, Sidnei tem seis avaliações contra duzentas e
quatorze do concorrente.

Esses personagens **ilustram o problema do mercado**, e a agência entra depois.
Nenhum deles é apresentado como cliente da Leon Group nem dá depoimento, que é
exatamente o que separa dramatização de testemunho fabricado. O campo
`verificar` de cada roteiro repete essa regra, para não se perder na edição.

## As duas levas

| Leva | Arquivo | Quantos | Cidades |
|---|---|---|---|
| Massachusetts | `roteiros-20.json` | 20 | Everett, Malden, Framingham, Waltham, Medford, Revere, Quincy, Lynn, Somerville |
| Los Angeles | `roteiros-la.json` | 6 | Van Nuys, North Hollywood, Burbank, Glendale, Pasadena, Long Beach, Inglewood, Torrance, Pomona |

Os seis de LA (numerados 101 a 106) são adaptação dos roteiros 1, 2, 4, 12, 15
e 20. **Adaptação não é troca de nome de cidade.** O roteiro 4 girava em torno
de fevereiro, neve e ice dam, que não existem no sul da Califórnia, e virou a
estação de chuva de janeiro (roteiro 103). E **nenhum valor em dólar de
Massachusetts foi reaproveitado**: ticket de Boston não é ticket de Los
Angeles, então onde havia número, ou ele saiu do roteiro, ou entrou como faixa
a conferir em fonte local antes de gravar.

Validar os dois com o mesmo script:

```bash
python3 scripts/validar_roteiros_anuncio.py marketing/anuncios/roteiros-20.json
python3 scripts/validar_roteiros_anuncio.py marketing/anuncios/roteiros-la.json
```

## Antes da primeira leva

O número americano (+1 213 396 0014) está **ativo no WhatsApp Business** desde o
fim do dia 2026-09-10. Falta o teste ponta a ponta: antes de gravar cartela ou
áudio citando o número, e antes de subir campanha apontando pra ele, mande uma
mensagem de teste pelo link `wa.me` e confirme que ela chega. Os blocos
`verificar` dizem isso.

Continua faltando: **página no Facebook**, o modelo do documento de diagnóstico
que os roteiros 15, 20, 105 e 106 prometem por escrito, e **os vídeos, que não
existem**. Roteiro escrito não é criativo pronto. Cada roteiro lista o que
conferir no seu bloco `verificar`.
