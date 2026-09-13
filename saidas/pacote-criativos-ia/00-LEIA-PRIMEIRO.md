# Pacote de criativos · Leon Group

Gerado em 2026-09-12 a partir dos arquivos de origem do projeto.

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
| `05-ROTEIROS-MASSACHUSETTS.md` | Os 20 roteiros da primeira leva | Na hora de gerar |
| `06-ROTEIROS-LOS-ANGELES.md` | Os 6 roteiros da segunda leva | Na hora de gerar |
| `07-PRODUZIR-NO-ARCADS.md` | **Como produzir os vídeos no Arcads**, passo a passo, com os parâmetros exatos da ferramenta | Na hora de gerar |
| `arcads-passo-a-passo/` | As quatro telas do Arcads, da escolha do ator ao download | Junto com o 07 |
| `roteiros-massachusetts.json` | Os mesmos 20, estruturados, para importar | Importação automática |
| `roteiros-los-angeles.json` | Os mesmos 6, estruturados | Importação automática |
| `identidade/` | Logo, símbolo e paleta, para as cartelas na tela | Na edição |
| `referencia-visual/` | Frames do criativo de referência, **com a legenda que diz o que neles não pode ser copiado** | Para calibrar o visual. Leia o `.md` de lá antes de olhar as imagens |

## O trabalho, em uma frase

São **26 roteiros escritos e prontos**. Falta transformá-los em vídeo.
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
