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

**✅ O WhatsApp aceitou o número americano (2026-09-10, fim do dia).** O número
`+1 213 396 0014` (Vnumber, área 213, Los Angeles) está ativo no WhatsApp
Business, confirmado pelo Rodrigo. O site e o CRM já apontam para ele, e o passo
7 da subida de campanha deixou de estar bloqueado.

**O que ainda não foi testado:** mandar uma mensagem pelo botão do site e ela
chegar de verdade no aparelho. Faça esse teste antes de gravar cartela citando o
número e antes de subir campanha apontando pra ele. O histórico de como o número
entrou está na seção 8 de `_memoria/playbook-campanha-meta.md`.

**Ferramenta única, decidido em 2026-09-10:** o trabalho segue só no Claude Code
dentro do VS Code, nesta pasta. Não há mais edição paralela em outra ferramenta,
então o risco de conflito na mesma pasta deixou de existir. O `AGENTS.md` fica
no repositório para o caso de isso mudar.

---

## O que está no ar agora

| O que | Onde | Verificação |
|---|---|---|
| Site público | https://leon-group-site.pages.dev | 102 asserções |
| Proposta, um preço | .../planos | 43 asserções |
| Proposta, três prazos | .../planosv2 | 39 asserções |
| Proposta, layout Kairon | .../planosv3 | 56 asserções |
| CRM, caixa e entrega | https://leon-group.leongroup.workers.dev | 606 asserções |

Rodar antes de todo deploy. **Num clone novo, `npm install` primeiro nas duas
pastas**, senão os testes morrem com "Cannot find module 'jsdom'" e parece que
estão quebrados quando é só dependência faltando:

```bash
cd sistemas/cloudflare  && npm install && ./testes/rodar.sh                   # 606
cd sistemas/site-agencia && npm install && for f in teste*.js; do node $f; done  # 240
```

Verificado em 2026-09-10 na pasta de trabalho do Rodrigo: 606 e 240,
zero falhas. (Os 574 antigos viraram 606 quando o teste dos depoimentos passou
de 31 para 63 asserções. Nenhum teste foi removido nem afrouxado.)

Deploy:

```bash
cd sistemas/cloudflare && npx wrangler deploy
npx wrangler pages deploy sistemas/site-agencia --project-name=leon-group-site --branch=main
```

---

## O que o Rodrigo pediu e ainda não foi feito

### 1. Os dados de teste do CRM (feito em 2026-09-10)

O ok veio e foi executado. **O banco de produção foi esvaziado por inteiro**,
incluindo o lead e o cliente "Richard Leon / RL HVAC", que o Rodrigo confirmou
que podiam ir junto, e as 3 entradas de US$ 2.500 do caixa.

Backup de tudo que existia antes está em
`dados/backup-crm-2026-09-10/` (11 tabelas em JSON). É de onde recuperar o
Richard Leon, se ele fizer falta.

No lugar entraram **registros de teste cobrindo todas as etapas**, para dar
para percorrer o sistema de ponta a ponta:

| Onde | Quantos | O que |
|---|---|---|
| `leads` | 16 | um em cada etapa dos 4 pipelines, de "responderam" a "nutrição" |
| `clientes` | 5 | um em cada sub-visão da aba Entrega (ver a tabela abaixo) |
| `entradas` | 5 | US$ 2.500 por cliente |
| `marcos` | 55 | a cadência de 11 marcos por cliente, concluídos variando |
| `checklist` | 210 | os 42 itens de otimização por cliente |
| `reviews` | 80 | os 20 depoimentos nos 4 clientes que já passaram da geração |
| `posts` | 64 | 12 posts + 4 destaques nos mesmos 4 |

**Os 5 clientes do operacional, um por sub-visão de `VISOES_OP`:**

| Cliente | Aparece em | Por quê |
|---|---|---|
| Moreira Flooring · Van Nuys CA | Aguardando cliente | sem `formulario_em`: o link foi enviado e não voltou |
| Ruiz Cabinets · Framingham MA | Em entrega | 3 dias úteis, dentro do prazo, marcos 5/11 |
| Amaral HVAC · Glendale CA | Em entrega, **Atrasados** | 10 dias úteis com entrega aberta |
| Caldeira Remodeling · Inglewood CA | Concluídos | **portão cumprido**: 11/11 marcos, 37/37 checklist, 4/4 entregáveis |
| Tavares Hardwood · Burbank CA | Concluídos, **Renovação** | renova em 9 dias, fechou por **conclusão antecipada** (`entrega_forcada`) |

⚠ **As duas sobreposições são do sistema, não erro dos dados.** Atrasado também
é "Em entrega" (começou e não terminou), e quem renova também é "Concluído"
(quem renova já recebeu a entrega). Os filtros em `VISOES_OP` são assim.

Há um cliente para cada caminho de conclusão: o Caldeira fecha pelo portão de
verdade, o Tavares pelo botão de fechar antes do prazo.

**Como reconhecer que é teste:** todo lead tem `origem` começando com `TESTE:`,
todo cliente tem `slug` começando com `teste-0`, e as observações dizem
"REGISTRO DE TESTE" em texto. Os telefones estão na faixa 555-01XX, reservada
para ficção, então nenhum cai em pessoa real.

**Para refazer, ou recriar depois de limpar:**

Um script por CRM, para um não sobrescrever o outro:

```bash
cd sistemas/cloudflare
node semear-comercial.mjs   > /tmp/com.sql   # os 16 leads
node semear-operacional.mjs > /tmp/op.sql    # os 5 clientes
npx wrangler d1 execute leon-group --remote --file=/tmp/com.sql
npx wrangler d1 execute leon-group --remote --file=/tmp/op.sql
```

O cabeçalho de cada um traz o comando de limpeza da sua metade e explica por que
os INSERTs são individuais (com UNION ALL o statement do checklist estoura o
limite do D1).

⚠ **`entrou_coluna_em` de todo lead é o instante da criação**, de propósito: o
motor roda de 15 em 15 minutos e move lead parado há mais de 24h na régua de
temperatura. Com data recente, os 16 ficam onde foram postos. Se você quiser
ver o decaimento acontecer, recue essa coluna de um lead específico.

⚠ **Os blobs do R2 ficaram órfãos.** As 38 linhas de mídia saíram do banco, os
arquivos não. É a dívida técnica 2 do `PENDENCIAS.md`, que continua aberta.

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

## Entrega de 20 depoimentos: decisão posterior do Rodrigo

**Atualização de 2026-09-10, alteração pontual feita no Codex.** O Rodrigo pediu
expressamente que a entrega operacional gere **20 depoimentos completos**, com
variações de nome do dono, empresa, cidade/estado, região atendida e serviço,
elogiando qualidade, prazo e limpeza. Ele esclareceu: **"Quero que rode dessa
forma com depoimento até que EU peça pra reverter."**

**Manter esse padrão até novo pedido explícito dele.** Não converter de volta
para mensagens pedindo avaliação por iniciativa de uma auditoria ou de outro
agente. Os modelos são fixos no código, em inglês, sem depender de chave ou
chamada de IA. Campos ausentes ficam identificados para preenchimento.

A interface operacional e o arquivo de entrega identificam os textos como
rascunhos para o cliente real validar e ajustar à experiência que teve antes
de usar. O site público continua sem receber esses textos automaticamente.
Não há autor de avaliação inventado nem publicação automática.

O botão **"Gerar somente os 20 depoimentos"** atualiza apenas esse lote, usando
os dados salvos do cliente. A geração conjunta continua disponível. Ao gerar
novamente, o lote anterior é substituído e o acompanhamento de envio reinicia,
como já acontecia antes. O pedido foi manter o padrão até ele pedir reversão,
não tornar o conteúdo impossível de atualizar ou remover o histórico do Git.

O teste `sistemas/cloudflare/testes/avaliacao-honesta.js` agora protege a nova
entrega e mantém as verificações de isolamento do site público e do comercial.
Nenhuma mudança de oferta, contrato, caixa ou CRM comercial foi solicitada.

**Histórico:** a auditoria anterior havia substituído as reviews por pedidos
porque os textos gerados eram publicados no site como depoimentos reais.
A decisão atual modifica a entrega operacional, mantendo a validação real e
o isolamento do site. As instruções antigas para gerar somente pedidos estão
superadas por este pedido explícito do Rodrigo.

**Validação:** 606 asserções do CRM e 240 do site passaram, sem falhas.
Inclui clique no botão real em jsdom, geração isolada e exportação acessível.

**Publicação: FEITA em 2026-09-10.** `npx wrangler deploy` rodado da pasta do
Rodrigo. Versão no ar `c111510d-83c7-469f-b3dc-9c2b6852051b`, com 100% do
tráfego, confirmada em `npx wrangler deployments list`. O site da agência não
mudou neste commit e não precisou de nova publicação.

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
