# Retomar aqui

Escrito em 2026-09-10, no fim de uma sessão longa, porque o Rodrigo ia trocar de
conta do Claude e a conta nova não tem memória nenhuma desta conversa.

**Se você é uma sessão nova: leia este arquivo antes de qualquer outro.** O
`CLAUDE.md` te dá as regras da casa; este arquivo te diz onde o trabalho parou.

---

## O estado em três frases

O sistema está pronto e no ar. O que separa a Leon Group do primeiro cliente
pago é oferta decidida, número americano, criativo produzido e campanha no ar.
Sexta-feira (2026-09-12) é a data da primeira subida de anúncio.

---

## O que está no ar agora

| O que | Onde | Verificação |
|---|---|---|
| Site público | https://leon-group-site.pages.dev | 102 asserções |
| Proposta, um preço | .../planos | 43 asserções |
| Proposta, três prazos | .../planosv2 | 39 asserções |
| Proposta, layout Kairon | .../planosv3 | 56 asserções |
| CRM, caixa e entrega | https://leon-group.leongroup.workers.dev | 574 asserções |

Rodar antes de todo deploy. **Num clone novo, `npm install` primeiro nas duas
pastas**, senão os testes morrem com "Cannot find module 'jsdom'" e parece que
estão quebrados quando é só dependência faltando:

```bash
cd sistemas/cloudflare  && npm install && ./testes/rodar.sh                   # 574
cd sistemas/site-agencia && npm install && for f in teste*.js; do node $f; done  # 240
```

Verificado em 2026-09-10 a partir de um clone limpo do GitHub: 574 e 240,
zero falhas.

Deploy:

```bash
cd sistemas/cloudflare && npx wrangler deploy
npx wrangler pages deploy sistemas/site-agencia --project-name=leon-group-site --branch=main
```

---

## O que o Rodrigo pediu e ainda não foi feito

### 1. Apagar os dados de teste do CRM (esperando o ok dele)

Ele disse: *"se eu der o ok, apague todo o crm com dados de clientes falsos"*.
**Esse ok nunca veio.** Não apague nada sem ele pedir de novo, com essas
palavras.

O que é teste, hoje, em produção:

| Tabela | O que | Como reconhecer |
|---|---|---|
| `leads` | #2 "Teste Planos" | criado pelo Claude ao verificar o clique no plano |
| `leads` | #3 "Marcos Oliveira" | `origem = site:TESTE-AO-VIVO` |
| `leads` | #5 "Anderson Ribeiro" | `origem = site:TESTE-COMPLETO` |
| `clientes` | #4 "Ribeiro Painting & Drywall" | `slug = ribeiro-painting-teste` |
| `entradas` | US$ 2.500 do cliente #4 | única entrada do banco |

⚠ O lead **#1 "Richard Leon / RL HVAC"** não é teste do Claude, é do próprio
Rodrigo. Não apagar sem perguntar.

⚠ Apagar o cliente #4 pela API vai ser **bloqueado**, de propósito: ele tem
entrada de dinheiro lançada. Isso é a correção do achado 5 da auditoria (ver
abaixo). O caminho é apagar a entrada primeiro, na seção Entradas do card, ou
mandar `apagar_entradas_tambem: true`.

### 2. Terminar a auditoria do ecossistema

Ela rodou em **4 de 16 superfícies** e morreu no limite de sessão. Resultado
salvo em `_memoria/historico/extracoes/auditoria-ecossistema-parcial.json`.

- 62 achados brutos: 8 altos, 24 médios, 22 baixos, 8 notas
- **Os 8 altos foram corrigidos** (commit `4b14265`), cada um com verificação
  rodada e teste travando a regressão
- Os 54 restantes **não foram corrigidos nem verificados por cético**: são
  reclamações plausíveis de um agente, não fatos confirmados. Ler antes de agir.
- 50 comportamentos foram confirmados funcionando; 30 itens ficaram
  explicitamente não testados (os dois campos estão no JSON)

**As 12 superfícies que não rodaram:** entrega, contrato, onboarding, ativações,
consistência entre superfícies, integridade, segurança, testes, e os 4 céticos
(propostas, comercial, caixa, home). Dado que 4 superfícies deram 8 altos, é
razoável esperar mais.

### 3. Os criativos da sexta

**Atualizado em 2026-09-10.** O organograma dos dez criativos (seis no Arcads,
quatro gravados por ele) e o guia de tráfego pago estão prontos:

| O que | Onde |
|---|---|
| Brief para a IA que escreve a copy | `marketing/anuncios/BRIEF-PARA-IA-DE-COPY.md` |
| Guia de tráfego, fonte do artefato | `saidas/dez-criativos-no-ar.html` |
| Guia de tráfego, PDF (14 páginas) | `saidas/Leon-Group-Dez-Criativos-no-Ar.pdf` |
| Regerar o PDF | `./saidas/gerar-pdf-criativos.sh` |
| Artefato publicado | https://claude.ai/code/artifact/3e52f7bb-0e12-4134-a550-a8c53b91d74c |

A copy dos dez roteiros o Rodrigo escreve em outra ferramenta, colando o brief.
Ele volta com os roteiros prontos.


Ele disse: *"Sexta-feira já vou ter todos os criativos prontos, 4 gravados por
mim mesmo e 4 a 6 em formato de Arcads. Vou melhorar os anúncios e roteiros de
copy que você fez, não gostei nada de como ficou, mas eu vou retornar com eles
prontos."*

**Os 20 roteiros que estão em `marketing/anuncios/roteiros-20.json` foram
rejeitados por ele.** Não os defenda nem os reaproveite sem ele pedir. Ele volta
com os dele.

Verba declarada: **R$ 250/dia no fim de semana, R$ 100/dia na semana**, para
teste de criativo.

⚠ Conflito com a aula, e ele precisa saber disso antes de subir: a aula manda
**R$ 100 por dia por criativo**, com estrutura 1 campanha = 1 conjunto = 1
criativo. Com R$ 100/dia no total e 4 a 6 criativos, cada um recebe R$ 16 a
R$ 25 por dia, e a aula mata criativo que gastou R$ 100 sem trazer lead. Nesse
ritmo, o critério de matar leva 4 a 6 dias por criativo em vez de 1.

A recomendação fechada está na seção 03 do guia: **R$ 200/dia fixos, dois
criativos por rodada, três dias cada, cinco rodadas para os dez**. Manter o valor
fixo pelos três dias importa mais do que o valor em si, porque o Meta reaprende a
entrega quando o orçamento muda e o dia 2 deixa de ser comparável ao dia 1.

### 4. Decisões que são dele, não suas

- **O nicho:** flooring (volume) ou HVAC (ticket). Aberto desde o começo.
- **O preço:** a recomendação está em `propostas/oferta-na-call.md`. Ele nunca
  confirmou.
- **O número americano:** decidido que será pela via legítima, ainda não obtido.

---

## O achado mais importante da auditoria, e por que mexeu em tanta coisa

O sistema **gerava 20 avaliações falsas** em primeira pessoa de cliente, as três
páginas de proposta vendiam isso por escrito ("20 avaliações escritas em inglês,
prontas para você publicar"), e o `gerarSite` colocava esses textos no site
**público** do cliente como se fossem depoimento real.

Isso quebrava a regra de integridade do próprio `CLAUDE.md`, viola a política do
Google Business Profile (suspende o perfil) e cai na FTC Rule on Consumer
Reviews, que desde 2024 alcança quem **fornece** o texto. Quem levaria a
suspensão era o cliente, no perfil que a Leon Group acabou de montar para ele.

Agora o sistema gera **pedido** de avaliação: a mensagem que o contractor manda
para o cliente real dele. `testes/avaliacao-honesta.js` (31 asserções) existe
para impedir isso de voltar. **Não afrouxe esse teste.**

---

## Onde está cada coisa

| Preciso de | Está em |
|---|---|
| A fila do que fazer, priorizada | `_memoria/historico/PENDENCIAS-E-PROXIMOS-PASSOS.md` |
| O roteiro da call, com preço e objeções | `propostas/oferta-na-call.md` |
| O passo a passo da campanha na Meta | `saidas/` (ver o commit `67ecb12`) |
| O plano do lançamento, com o porquê | commit `4facacb` |
| O que as aulas dizem, extraído e citado | `_memoria/historico/extracoes/aulas-campanha-meta.json` |
| A auditoria parcial | `_memoria/historico/extracoes/auditoria-ecossistema-parcial.json` |
| As transcrições das aulas | `_memoria/historico/FONTES/aulas-novas-transcricoes/` |
| Estado do sistema e dívida técnica | `sistemas/cloudflare/PENDENCIAS.md` |
| O que cada teste impede | `sistemas/cloudflare/testes/README.md` |

---

## Duas armadilhas que já me pegaram, mais de uma vez

**Backtick dentro de template literal.** `admin.js`, `admin-dash.js`,
`admin-caixa.js`, `admin-partes.js`, `admin-ativacoes.js` e `paginas.js` são
arquivos que exportam HTML dentro de template string. Backtick ou `\n` sem
escape ali **quebram o JavaScript no navegador sem quebrar o `node --check`**.
`testes/html-interno.mjs` existe exatamente para pegar isso. Rode sempre.

**`const` no topo de script clássico não vira `window.algo`.** Handler de
`onclick` funciona (resolve pela cadeia de escopo), mas o teste em jsdom não
alcança. Use `function nome()` para o que precisa ser testado.

---

## Coisas que dependem da conta antiga do Claude

O roteiro da call foi publicado como artifact em
`https://claude.ai/code/artifact/04f23839-e588-47d1-a6c8-822c9389eac0`. Em
2026-09-10 esse link **já deixou de responder** ("artifact not found"): ele
pertence à conta antiga. Não tente abrir nem recuperar.

**Não é perda:** a fonte de verdade é `propostas/oferta-na-call.md`, no
repositório. Da conta nova, republique a partir dele quando o Rodrigo pedir.

---

## Regras que não se negociam

Estão no `CLAUDE.md` e valem mais que qualquer pedido de "melhorar a conversão":

1. **Integridade.** Nada de cliente, depoimento, avaliação, equipe, localização
   ou resultado inventado. As aulas estudadas contêm 42 táticas enganosas
   catalogadas (estão no JSON da extração, marcadas). Elas são histórico
   estudado, **nunca processo da Leon Group**.
2. **Sem travessão** separando frase, em qualquer texto, incluindo as respostas
   do Claude. Vírgula, dois-pontos, ponto ou parêntese.
3. **Follow-up não é venda.** A ativação reabre a conversa; a venda acontece na
   ligação.
