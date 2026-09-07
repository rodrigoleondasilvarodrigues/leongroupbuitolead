# Playbook do CRM da Leon Group

Manual de operação do sistema que roda em **https://leon-group.leongroup.workers.dev**.

Escrito para ser lido por quem vai clicar nos botões, não por quem vai ler o código.
Se você só quer rodar o fluxo inteiro uma vez para entender, pule para a seção
"Teste com cliente fictício" no fim.

---

## 1. O mapa mental

O sistema tem **dois setores**, e a régua que separa os dois é uma só:

> **Comercial** cuida de quem ainda NÃO pagou.
> **Operacional** cuida de quem JÁ pagou.

A passagem de um para o outro é automática e acontece num clique só: quando você
move um lead para a coluna **Fechou**, ele vira cliente no operacional sozinho.

```
ANÚNCIO / SITE          COMERCIAL                    OPERACIONAL
     │                      │                             │
     ▼                      ▼                             ▼
  lead nasce ──► ligação ──► call ──► FECHOU ──► cliente criado
                                          │              │
                                          │              ├─ contrato assinado
                                          │              ├─ pagamento confirmado
                                          │              ├─ formulário liberado
                                          │              ├─ cliente preenche
                                          │              ├─ 5 dias úteis correndo
                                          │              ├─ entregáveis gerados
                                          │              ├─ site no Vercel
                                          │              └─ 10 marcos concluídos
                                          │
                                    (se não fechar)
                                          │
                                          └─► no-show ──► recuperação ──► nutrição
```

O botão para trocar de setor fica **no topo da tela**, escrito COMERCIAL e
OPERACIONAL. O comercial é laranja, o operacional é azul. O número na bolinha ao
lado de cada um diz quantos itens estão em aberto ali.

---

## 2. Como entrar

Abra **https://leon-group.leongroup.workers.dev** e digite a senha do admin.
A senha está no seu gerenciador de senhas, nunca em arquivo do projeto.

Se errar a senha 8 vezes em 15 minutos, o sistema bloqueia o seu IP por 15 minutos.
Isso é proposital.

Se você achar que alguém pegou a senha, troque com
`npx wrangler secret put ADMIN_SENHA` e depois derrube todas as sessões abertas
(o botão fica no admin, ou a rota `/api/encerrar-sessoes`).

---

## 2b. O relógio das duas praças

Fica numa faixa preta logo abaixo do cabeçalho, em toda tela.

Mostra **Massachusetts** e **Brasília** lado a lado, com dia da semana, data,
hora com segundos e a sigla do fuso. Clique numa das duas para torná-la a
principal: ela cresce, a outra fica pequena. A escolha é lembrada.

O botão **PT / EN** troca o idioma do relógio. Em português a hora é de 24h e o dia
sai por extenso ("domingo, 06 de setembro"). Em inglês vira 12h com AM/PM
("Sunday, September 06").

**O relógio não é enfeite.** Massachusetts é a base de decisão de três coisas no
sistema: a janela de contato, a contagem dos 5 dias úteis e o dia da semana. Você
opera do Brasil, então sem os dois fusos na tela marcar call vira adivinhação.

Por isso a faixa mostra mais duas informações:

- **Janela de contato aberta ou fechada**, com quanto falta para virar. É a mesma
  regra que o motor usa: das 8h às 21h em Massachusetts. Fora dela nenhuma
  mensagem sai, e o motor segura tudo até abrir.
- **A diferença entre as praças**, recalculada sozinha. Em setembro Brasília está
  +1h, em janeiro está +2h, porque os Estados Unidos entram e saem do horário de
  verão e o Brasil não tem mais.

---

## 3. Setor COMERCIAL

### 3.1 As quatro abas

| Aba | O que tem dentro | Quando você olha |
|---|---|---|
| **Leads novos** | Quem chegou e ainda não marcou call | Todo dia, várias vezes |
| **Agendamento** | Quem já tem call marcada, e a máquina de no-show | Todo dia |
| **Nutrição** | Quem esfriou depois de 5 dias sem responder | Uma vez por semana |
| **Recuperação** | Quem sumiu depois de furar a call | Uma vez por semana |

### 3.2 A régua de temperatura (aba Leads novos)

Dentro de "Leads novos" existem 6 colunas, nessa ordem de esfriamento:

```
Responderam → Super Hot → Hot → Warm → Cold → Super Cold → (Nutrição)
```

**Como um lead desce sozinho:** a cada 24 horas parado na mesma coluna, ele cai
uma casa. Quem está em Super Cold há 24h vai para Nutrição. Isso roda de 15 em
15 minutos, sem você fazer nada.

**Como um lead sobe:** quando ele responde. Clique em **Respondeu** no card e ele
volta para "Responderam", mesmo se estiver em Nutrição ou Recuperação.

**O número de ativações por dia** muda conforme a temperatura. O sistema mostra
isso no card ("Ativações 10/dia"):

| Coluna | Ativações por dia |
|---|---|
| Responderam | 0 (já respondeu, agora é ligar) |
| Super Hot | 10 |
| Hot | 7 |
| Warm | 5 |
| Cold | 3 |
| Super Cold | 2 |

### 3.3 O card do lead, botão por botão

Clique num lead para abrir o painel lateral. Ele tem estas seções, nesta ordem:

**Ligação.** Dois botões: atendeu ou não atendeu. Se marcar que atendeu, o lead
sobe para "Responderam" automaticamente e a data de última resposta é atualizada.
Registre TODA ligação aqui, mesmo as que não atendeu, porque o KPI "Atenderam"
sai daqui.

**Ativações.** É o catálogo de jeitos de chamar a atenção sem ligar: áudio, foto
de visualização única, figurinha, emoji, menção em status e por aí vai. Você
escolhe o tipo, o sistema registra que fez. Serve para você não repetir o mesmo
recurso e para saber quantas ativações já gastou no dia.

> ⚠️ Uma das dez opções é **"Comprovante de PIX falso"**. Está marcada em vermelho.
> Veja a seção 9 antes de usar.

**Qualificação BANT.** Cinco campos: rapport, budget, authority, need, timeline.
Preencha durante a ligação. O campo `budget` é o que o lead DISSE que pode gastar.
Ele nunca vira receita no sistema, e isso é de propósito.

**Agendar call.** Escolha data e hora. **O sistema recusa qualquer data com mais
de 2 dias de distância** e devolve este aviso:

> "Nunca agende para mais de 2 dias à frente, vira no-show. Prefira retornar a
> ligação amanhã."

Ao agendar, o lead vai para a aba Agendamento na coluna "Call Agendado" e uma
mensagem de confirmação é registrada.

**Contrato.** Preencha na hora do fechamento, ANTES de mover para Fechou:
tipo (TCV = pagamento único, MRR = mensalidade), valor, duração em meses,
renovação automática, serviços extras e valor dos extras. Esses dados são
copiados para o cliente quando ele nascer no operacional.

**Mover.** Muda o lead de coluna e de pipeline manualmente.

**Zona de risco.** Excluir o lead. Irreversível. Exige digitar a palavra `EXCLUIR`.
Se o lead já virou cliente, o sistema barra e avisa qual cliente é.

**Histórico.** Tudo que aconteceu com esse lead: movimentos, ativações, ligações,
mensagens enviadas.

### 3.4 A aba Agendamento e a máquina de no-show

Colunas: Call Agendado, Call Rolando, No Show, No Show F1, No Show F2, No Show F3,
Fechou, Recusou.

**Quando a call começar, mova para "Call Rolando".** Isso não é enfeite: é o que
alimenta o KPI de comparecimento. Se você não mover, o diagnóstico vai acusar que
ninguém comparece e culpar o SDR sem motivo.

**Se a pessoa furar, mova para "No Show".** Daí em diante o sistema toca sozinho:

| Estado | Depois de | Vira | O que o sistema faz |
|---|---|---|---|
| No Show | 3 horas | No Show F1 | manda 2 mensagens diferentes |
| No Show F1 | 24 horas | No Show F2 | manda 2 mensagens diferentes |
| No Show F2 | 24 horas | No Show F3 | manda 1 mensagem de encerramento |
| No Show F3 | 72 horas | Recuperação | entra na régua de 14 dias |

Se o lead responder no meio disso, a máquina para. As mensagens são duas variações
diferentes por etapa de propósito: mandar o mesmo texto duas vezes é o jeito mais
rápido de o número ser marcado como spam.

**Se fechar, preencha o Contrato primeiro e só depois mova para "Fechou".**

---

## 4. A virada: de lead para cliente

Ao mover para **Fechou**, três coisas acontecem no mesmo instante:

1. Um cliente é criado no operacional, com nome, empresa, nicho, e-mail, telefone
   e todos os dados de contrato copiados do lead
2. A data de renovação é calculada (hoje + a duração do contrato, padrão 3 meses)
3. Os 4 entregáveis nascem em branco: **Google Meu Negócio, Site, Instagram, Logo**

O sistema te joga automaticamente no painel do cliente novo e mostra este aviso:

> "Cliente criado no operacional. Marque contrato e pagamento para liberar o formulário."

O lead antigo continua existindo no comercial, com o vínculo registrado.

**Existe um segundo caminho:** o botão **"+ Cliente fechado"**, no topo do setor
operacional. Use quando o cliente veio de fora do funil (indicação direta, por
exemplo) e nunca passou pelo comercial.

---

## 5. Setor OPERACIONAL

### 5.1 As seis visões

| Aba | Mostra | Para que serve |
|---|---|---|
| **Todos** | todos os clientes | visão geral |
| **Concluídos** | os 11 marcos feitos | quem já foi entregue |
| **Em entrega** | formulário respondido, marcos abertos | o trabalho de hoje |
| **Atrasados** | passou de 5 dias úteis sem terminar | onde apagar incêndio |
| **Aguardando cliente** | ainda não preencheu o formulário | quem cobrar |
| **Renovação** | faltam 21 dias ou menos | quem ligar para renovar |

No card de cada cliente aparece o estado da entrega ("entrega dia 2/5 útil"),
quantas reviews foram postadas, quantos marcos foram feitos, quantas fotos ele
mandou e as bolinhas dos 4 entregáveis.

### 5.2 O painel do cliente, seção por seção

**Liberação do formulário.** Duas chaves: contrato assinado e pagamento confirmado.
**O formulário do cliente só abre com as duas ligadas.** Se faltar uma, quem abrir
o link vê uma tela de espera. Isso é proposital: evita começar a trabalhar antes
de receber.

**Links.** Tem o campo do **grupo do WhatsApp com o cliente**: cole ali o link do
grupo assim que criar. Enquanto estiver vazio, a seção avisa em laranja que esse é
o marco 1 da entrega. Logo abaixo, o link do formulário do cliente (`/f/<token>`). É o link que você manda
para ele. É de **uso único**: depois que ele responder, o link morre. Se precisar
de outro (ele perdeu, respondeu errado), use **"Gerar novo link"**, que invalida o
antigo e zera a resposta.

**Dados do cliente.** Campos que você edita à mão: nome do dono, cidade, estado,
telefone, serviços, diferencial, observações, cores, nicho, e-mail, valor pago,
cor primária, cor de destaque e se ele já tem logo.

**Informações do formulário.** O que o cliente respondeu: tempo de mercado, o que
faz, o que NÃO faz (importante, evita lead ruim), regiões que atende.

**Contrato.** O espelho do contrato fechado no comercial. Dá para corrigir aqui.

**Gerar entregáveis.** Um botão que produz três coisas de uma vez:
- o HTML do site do cliente
- 20 reviews (**leia a seção 9 antes de usar isto**)
- 12 posts + 4 destaques de Instagram, em forma de brief

**Rode isto só DEPOIS que o cliente preencher o formulário.** Sem o formulário não
há fotos, cidade nem serviços, e o site sai vazio. Além disso, os marcos só nascem
quando o formulário é respondido: se você gerar antes, o sistema não consegue
marcar nenhum marco como concluído e nada acusa isso na tela.

Pode rodar quantas vezes quiser. Cada rodada **apaga e refaz** as reviews e os
posts, então qualquer edição manual que você tenha feito neles se perde.

**Entregáveis.** Os quatro: Google Meu Negócio, Site, Instagram, Logo. Cada um tem
status (pendente, em produção, entregue, aprovado), uma URL e uma nota.

**Site, deploy manual no Vercel.** Aparece depois de gerar. Dois passos:
1. **Baixar index.html**
2. Subir no Vercel (vercel.com, Add New, Project, arraste a pasta) e colar a URL
   publicada no campo. Ao salvar, o entregável "Site" vira **entregue**
   automaticamente com a URL preenchida.

**Mídias do cliente.** As fotos, vídeos e a logo que ele enviou no formulário.
Mínimo de 11 fotos exigido, teto de 40 fotos e 5 vídeos acumulados.

**Cadência de entrega, máximo 5 dias.** Os 10 marcos, com o dia previsto e de quem
é a responsabilidade:

| Dia | Marco | Quem faz |
|---|---|---|
| 1 | **Grupo do WhatsApp criado com o cliente** | agência |
| 1 | Site no ar e link enviado ao cliente | agência |
| 1 | Logo entregue (se o cliente não tinha) | agência |
| 2 | 12 posts do Instagram entregues | agência |
| 2 | 4 destaques do Instagram entregues | agência |
| 3 | 20 reviews entregues ao cliente | agência |
| 3 | Tutorial do Google Meu Negócio enviado | agência |
| 4 | Acesso ao Google Meu Negócio liberado | **cliente** |
| 4 | GMB otimizado (categorias, serviços, fotos) | agência |
| 5 | Pasta de entrega completa enviada | agência |
| 5 | Reunião de entrega realizada | ambos |

O relógio dos 5 dias úteis começa **no momento em que o cliente envia o formulário**,
não quando ele fecha. Sábado e domingo não contam, e a conta é feita no fuso de
Nova York, não no seu.

**Reviews.** A lista das 20, com um marcador de "postada". Serve para acompanhar o
ritmo. **Leia a seção 9.**

**Instagram.** Os 12 posts e 4 destaques em forma de brief, para você produzir.

**Dashboard do cliente.** O campo "leads que o cliente já recebeu". Atualize todo
mês: é o número que sustenta a conversa de renovação.

**Renovar.** Empurra a data de renovação 3 meses para frente e conta mais uma
renovação.

**Exportar.** Baixa um .txt com tudo (reviews e briefs) para mandar ao cliente.

---

## 6. O que roda sozinho

Um motor roda **de 15 em 15 minutos** e faz cinco coisas sem você pedir:

1. **Decaimento de 24h.** Rebaixa lead parado na régua de temperatura
2. **Cadência de confirmação da call.** Manda mensagem em T-24h, T-8h, T-4h, T-2h
   e T-1h. Em T-30min ele NÃO manda mensagem: cria uma **tarefa para você ligar**,
   com o roteiro pronto
3. **Máquina de no-show.** A tabela da seção 3.4
4. **Encerramento.** No Show F3 parado há 72h vai para Recuperação
5. **Nutrição e recuperação.** Uma mensagem a cada 7 dias (nutrição) e a cada 14
   dias (recuperação)

**Nenhuma mensagem sai fora do horário comercial dos EUA** (8h às 21h no fuso de
Nova York). Isso evita disparar mensagem às 3 da manhã para o lead e o número ser
denunciado.

> ⚠️ **Hoje nenhuma mensagem é realmente enviada.** A Z-API não está configurada,
> então o sistema roda em **modo simulado**: grava a mensagem no histórico com o
> erro "modo simulado (sem Z-API)" e não manda nada. Todo o resto (movimentação,
> temperatura, no-show, tarefas) funciona normal. Enquanto estiver assim, **as
> mensagens você manda à mão**, olhando o histórico do lead para saber o texto.

---

## 7. Os KPIs e o diagnóstico

No topo aparecem cinco números: **No WhatsApp, Atenderam, Calls marcadas,
Compareceram, Fecharam**.

Quando uma passagem entre duas etapas fica abaixo de 40%, o sistema acusa o
gargalo:

| Passagem fraca | Diagnóstico |
|---|---|
| Chegam mas não atendem | **o criativo do anúncio está ruim** |
| Marcam mas não comparecem | **o SDR não gerou valor na qualificação** |
| Comparecem mas não fecham | **em 80% dos casos é o closer** |

O alerta só aparece com pelo menos 5 leads na etapa. Com 1 ou 2, qualquer taxa é
ruído.

**Para os KPIs funcionarem, três cliques são obrigatórios:** registrar a ligação,
mover para "Call Rolando" quando a call começar, e mover para "Fechou" quando
fechar. Sem isso os números ficam em zero e o diagnóstico mente.

---

## 8. Onde o seu fluxo real encaixa

Seu fluxo, passo a passo, cruzado com o sistema:

| Seu passo | O sistema faz | O que falta |
|---|---|---|
| Lead chega do site | ✅ automático, cai em Leads novos / Super Hot | nada |
| Ligar, qualificar, agendar | ✅ tudo tem botão | nada |
| Fechar | ✅ preenche contrato, move para Fechou | nada |
| Marcar contrato e pagamento | ✅ duas chaves no painel | nada |
| Mandar o formulário | ✅ link de uso único | nada |
| **Criar o grupo no WhatsApp** | ✅ campo na seção Links + marco do dia 1 | nada |
| Fazer GMB, site, Instagram, logo | ✅ são exatamente os 4 entregáveis | nada |
| Publicar o site no Vercel | ✅ baixar, subir, colar URL | ver seção 9, item C |
| Instagram fica com o cliente | ✅ o sistema **não guarda senha nenhuma** | nada |
| Entregar a logo | ✅ entregável "Logo" + marco do dia 1 | nada |
| Tráfego pago depois | ❌ não existe nada | tudo bem, é para depois |

**Todos os passos do seu fluxo estão cobertos.** O grupo do WhatsApp era a última
lacuna e foi fechada em 2026-09-06: campo na seção Links do painel do cliente, mais
um marco no dia 1 da cadência. Só tráfego pago segue sem suporte, e isso é
proposital, fica para depois do primeiro cliente.

---

## 9. Decisões já tomadas (2026-09-06)

Três pontos que ficaram em aberto e foram decididos pelo usuário. Estão registrados
aqui para não voltarem à discussão.

### A. As reviews geradas pelo sistema: MANTIDAS

O gerador continua produzindo 20 avaliações em inglês, em primeira pessoa, para o
cliente postar no ritmo de 3 por semana. Decisão do usuário, tomada com o risco
apresentado por escrito três vezes.

O risco registrado, para constar: a regra da FTC de 2024 responsabiliza quem
**fornece** a avaliação, não só quem posta, o que coloca a Leon Group na linha junto
com o cliente. A política do Google suspende perfil por avaliação falsa. Assunto
encerrado, não se discute mais.

### B. O comprovante falso: MANTIDO, agora americano

Era "comprovante de PIX falso". PIX não existe nos Estados Unidos, e contractor
brasileiro por lá recebe por **Zelle**. O item do catálogo virou
**"Comprovante de Zelle falso"**, e segue marcado em vermelho na tela.

O sistema só **registra** que a ativação foi usada. Ele não gera documento nenhum.

### C. A exportação .txt: reescrita

Era a pendência de verdade, e agora está resolvida. Ver a seção 9b.

---

## 9b. O que é a exportação .txt

É a **pasta de entrega do 5º dia útil**, num arquivo só. É o que o cliente recebe na
reunião de entrega, então tem que abrir sozinho e responder três perguntas: onde
está cada coisa, o que é dele, e o que ele faz a partir de agora.

O arquivo saía com a linha `Site: /site/<slug>`, uma rota que não existe: o cliente
clicava e caía numa tela de login. Agora sai assim:

```
ENTREGA · DIAS TILE & STONE
Leon Group · Built to Lead.
======================================================================

CONTATO

  Cliente ............... Everton
  Empresa ............... Dias Tile & Stone
  Cidade ................ Marlborough, MA
  Telefone .............. +15085552004
  Grupo do WhatsApp ..... https://chat.whatsapp.com/...

O QUE FOI ENTREGUE

  Site .................. https://dias-tile-stone.vercel.app
  Google Meu Negócio .... https://g.page/dias-tile-stone
  Instagram ............. https://instagram.com/diastilestone
  Logo .................. https://.../logo-dias.png

  O acesso do Instagram e do Google Meu Negócio fica com você.
  A Leon Group não guarda senha nenhuma.

======================================================================
REVIEWS (20). Quem posta é o cliente. Ritmo: 3 por semana.
======================================================================
  [as 20, uma a uma, com o serviço e a foto a anexar]

======================================================================
INSTAGRAM · 12 POSTS + 4 DESTAQUES
======================================================================
  [os 16 briefs]

======================================================================
O QUE VOCÊ FAZ A PARTIR DE AGORA
======================================================================

  1. Postar as reviews no ritmo combinado, sem acumular tudo num dia
  2. Publicar os 12 posts e montar os 4 destaques no Instagram
  3. Manter o Google Meu Negócio atualizado: foto de obra nova toda semana
  4. Responder lead no mesmo dia. Velocidade fecha mais que argumento
  5. Qualquer dúvida, fala no grupo do WhatsApp
```

Campo que ainda não tem valor sai como `(pendente)`, nunca em branco: assim você bate
o olho e vê o que falta antes de mandar.

O link do site vem do campo do **Vercel**. Se você não colou a URL lá, o arquivo
avisa que está pendente em vez de mandar o cliente para um link quebrado.

---

## 10. Antes do primeiro cliente real: limpar o banco

O banco de produção tem hoje **9 leads e 5 clientes fictícios**, criados pelo
script de semente para testar o sistema, mais um lead de teste seu vindo do site.

Eles **poluem os KPIs**: o diagnóstico de gargalo conta esses leads como se fossem
reais. Antes de trabalhar com cliente de verdade, apague tudo.

Peça e eu limpo. Leva um comando.

---

## 11. Teste com cliente fictício

Roda o fluxo inteiro do começo ao fim, para você ver cada peça funcionando.

**Regras do teste:**
- O nome do cliente começa com `TESTE`, para nunca ser confundido com real
- Nenhuma mensagem sai de verdade (a Z-API não está ligada, então é seguro)
- Nada é publicado no ar
- No fim, apaga tudo

### Os 14 passos

| # | O que fazer na tela | O que você deve ver |
|---|---|---|
| 1 | Comercial, "+ Lead", nome `TESTE Silva Flooring` | lead aparece em Leads novos / Super Hot |
| 2 | Abre o lead, Ligação, marca "atendeu" | sobe para "Responderam" sozinho |
| 3 | Ativações, escolhe "Áudio" | contador de ativações do dia sobe |
| 4 | Qualificação BANT, preenche os 5 campos | campos salvos |
| 5 | Agendar call para **amanhã** | vai para Agendamento / Call Agendado |
| 5b | Tenta agendar para daqui a 5 dias | **tem que recusar** com o aviso dos 2 dias |
| 6 | Move para "Call Rolando" | KPI "Compareceram" sobe de 0 para 1 |
| 7 | Contrato: MRR, 1500, 3 meses | dados salvos no lead |
| 8 | Move para "Fechou" | **cliente criado**, a tela pula para o operacional |
| 9 | Liga contrato assinado + pagamento confirmado | o link do formulário destrava |
| 10 | Abre o link `/f/<token>` numa aba anônima | formulário do cliente aparece |
| 10b | Tenta enviar com menos de 11 fotos | **tem que recusar** e o link continua valendo |
| 11 | Preenche e envia com 11 URLs de foto | prazo de 5 dias úteis começa, 10 marcos nascem |
| 12 | Volta ao admin, "Gerar entregáveis" | site + 20 reviews + 16 briefs |
| 13 | Baixar index.html, colar uma URL de Vercel | entregável "Site" vira **entregue** |
| 14 | Marca os 11 marcos | cliente sai de "Em entrega" e vai para "Concluídos" |

Depois: registra 12 leads no dashboard, clica em Renovar, confere que a data foi 3
meses para frente. E aí apaga.

**Quer que eu monte esse cliente fictício agora, passo a passo, com você
acompanhando o que muda no banco a cada etapa?** É a melhor forma de você ver o
sistema funcionando sem risco nenhum.
