# PROMPT — CRM Comercial da Leon Group

> **Como usar:** abra o Claude Code numa pasta vazia (ex: `~/leon-crm`) e cole este arquivo inteiro
> como primeira mensagem. Ele é autossuficiente: contém a especificação completa dos 4 pipelines,
> as automações, os gatilhos de tempo e as regras de conteúdo.
>
> **Origem:** especificação extraída das aulas 01-04 da mentoria (transcrição literal, 5h56).
> Rastreabilidade em `_memoria/historico/ESPECIFICACOES-SISTEMAS.md`.

---

## Contexto do negócio

A Leon Group é uma agência de geração de leads para empresas de construção e home services nos
Estados Unidos, com foco em contractors brasileiros (prioridade: Massachusetts e Boston).

O funil comercial é: **anúncio no Meta → WhatsApp → ligação de qualificação → call de vendas → pagamento**.
Não existe formulário no meio — cada etapa a mais esfria o lead.

Você vai construir o CRM que governa esse funil.

## Stack obrigatória

- **Backend + frontend:** sua escolha, desde que rode local e possa ser hospedado depois. O código
  fica sendo meu — essa é uma exigência: preciso conseguir instrumentar qualquer coisa depois.
- **WhatsApp:** integração via **Z-API** (API não-oficial, ~R$100/mês). Não usar a API oficial do
  WhatsApp Business, que cobra por mensagem.
- **Variação de mensagem:** **API da OpenAI**. Toda mensagem disparada em volume precisa ser
  reescrita pela IA antes de sair — nunca duas mensagens idênticas.
- **Banco:** local, simples, com migração versionada.

---

## Regras globais de disparo (valem para todos os pipelines)

Estas regras existem para evitar banimento do número de WhatsApp e são inegociáveis:

1. **Nunca ligar 3 vezes seguidas.** O padrão é 2 ligações seguidas e para. Três chamadas seguidas
   repetidas geram risco de ban.
2. **Mensagens em massa sempre variadas por IA**, espaçadas de **5 a 7 segundos** entre uma e outra.
   Nunca idênticas, nunca todas de uma vez.
3. **Número novo não manda mensagem para ninguém.** Ao subir a campanha, o sistema deve bloquear
   disparos ativos por **7 dias** — só responde quem chamar. Depois desse período libera as ativações.
4. **Follow-up nunca é venda.** É proibido em qualquer ativação: fazer oferta, promoção ou marketing
   de oferta. O objetivo da ativação é só retomar o contato. A venda acontece na ligação.

---

## PIPELINE 1 — LEADS NOVOS

Colunas, na ordem:

| Coluna | Permanência | Ativações/dia |
|---|---|---|
| RESPONDERAM | 24h | — (objetivo é ligar em <1 min) |
| SUPER HOT | 24h | 10 |
| HOT | 24h | 7 |
| WARM | 24h | 5 |
| COLD | 24h | menos |
| SUPER COLD | 24h | menos |

### Entrada no pipeline
Lead clica no anúncio e cai no WhatsApp. O sistema:
1. Cria o lead na coluna **SUPER HOT**
2. Dispara a **mensagem de boas-vindas automática em 15 a 30 segundos**, cujo conteúdo comunica que
   *alguém vai ligar em menos de cinco minutos*
3. Notifica o SDR para **ligar em menos de 1 minuto**

> A mensagem de boas-vindas existe como rede de segurança para o caso do SDR não conseguir ligar.
> O SDR deve esperar a mensagem sair e ligar em seguida.

### Decaimento automático
A cada **24 horas sem resposta**, o lead desce um degrau automaticamente:
`SUPER HOT → HOT → WARM → COLD → SUPER COLD`, com o número de ativações diárias caindo junto.

### Coluna RESPONDERAM
Fica **acima** de SUPER HOT. Quando o lead responde qualquer ativação, é movido para cá.
Permanência: 24h. Ação imediata: **ligar em menos de 1 minuto**.

### Catálogo de ativações
As ativações são **manuais** (o sistema agenda e lembra, o humano executa) e devem ser as mais
naturais possíveis — nada de "puta texto". Tipos disponíveis:

- Ligação
- Áudio
- Áudio de visualização única
- Foto de visualização única
- Figurinha
- Emoji
- Mensagem de texto curta

O sistema deve registrar qual tipo foi usado em cada ativação, para não repetir o mesmo tipo em
sequência e para medir qual converte melhor.

### Saída
Lead que não responde em **nenhum dos 5 dias** (5 colunas × 24h) sai para o **PIPELINE 4 — NUTRIÇÃO**.

---

## PIPELINE 2 — AGENDAMENTO

Colunas: `CALL AGENDADO → CALL ROLANDO → NO SHOW → NO SHOW F1 → NO SHOW F2 → NO SHOW F3 → RECUSOU`

### CALL AGENDADO
O lead entra quando atende a ligação e topa agendar. Ao entrar, o sistema:
1. Grava o **horário da call** nas configurações do lead
2. Dispara a mensagem de confirmação
3. Calcula automaticamente a cadência abaixo a partir desse horário

### Cadência de confirmação (6 pontos de contato)

| Quando | O quê |
|---|---|
| T-24h | mensagem automática |
| T-8h | mensagem automática |
| T-4h | mensagem automática |
| T-2h | mensagem automática |
| T-1h | mensagem automática |
| **T-30min** | **ligação humana** (não é mensagem) |

**Conteúdo das mensagens** — três tipos, sorteados em **ordem 100% aleatória**, sem sequência padrão:
- (a) que o time está pronto
- (b) um conteúdo do Instagram da agência, para agregar valor
- (c) uma foto do time montando o plano

**Regra editorial dura:** nunca perguntar se o lead vai comparecer, nunca perguntar se "está tudo
certo". Só **afirmar**. Dar brecha é dar chance de desmarcar.

**Vocabulário:** sempre "call", nunca "reunião". "Reunião" soa a compromisso sério de venda; "call"
é mais natural.

**Script da ligação T-30min:** *"em 15 minutos a gente já vai deixar o link da nossa call"* e
*"faltando 5 minutos a gente entra"*.

### Regra de janela de agendamento
- **Nunca agendar para mais de 2 dias à frente.**
- Prioridade máxima: **mesmo dia**.
- Se não houver horário disponível hoje, **não marque a call** — diga que retorna a ligação amanhã.
  Compromisso marcado com cara corrido vira no-show; ligação prometida não gera procrastinação.

### CALL ROLANDO
O lead entra ao começar a call. Se a call não acontecer, o SDR/closer **arrasta manualmente** para
NO SHOW.

### Tratamento de NO-SHOW

**NO SHOW** (automático ao entrar na coluna): mensagem de questionamento simpática que
(a) reconhece que ele não conseguiu comparecer, (b) oferece a desculpa por ele — *"imagino que você
esteja na correria, na obra"* — e (c) **já afirma o reagendamento**: *"vou deixar marcado amanhã para
o mesmo horário. Me confirma aqui"*. Afirmando, ele só precisa responder "ok" — elimina o "vou verificar".

**NO SHOW F1** — gatilho: **3 horas** sem resposta. Ação: **2 ligações seguidas + 2 mensagens seguidas**
(padrão "2L e 2M"). Conteúdo personalizado: puxar um ponto de conexão do rapport da ligação de
qualificação e cobrar uma resposta, retomando os problemas que ele mesmo relatou.

**NO SHOW F2** — gatilho: **24 horas** sem resposta ao F1. Mesmo padrão 2L + 2M. Comunica que se
espera uma última resposta.

**NO SHOW F3** — encerramento: **2 ligações + 1 mensagem**. Diz que o contato foi bom, mas que não
responder por três/quatro dias tendo marcado um compromisso é falta de respeito.

### RECUSOU
Lead que diz explicitamente que não vai fechar. Pode ir para "perdido" ou ficar parado aqui para
remarketing futuro. **Não vai para recuperação.**

---

## PIPELINE 3 — RECUPERAÇÃO

- **Entrada:** lead de no-show que sumiu mesmo depois da mensagem de encerramento (F3), **24 horas** depois.
- **Cadência:** 1 mensagem a cada **14 dias**.
- **Conteúdo:** mesmo espírito da nutrição, sem oferta.

---

## PIPELINE 4 — NUTRIÇÃO

- **Entrada:** lead que não respondeu em nenhum dos 5 dias do pipeline 1.
- **Cadência:** 1 mensagem a cada **7 dias**, por tempo indeterminado ("follow-up infinito").
- **Conteúdo:** **gerado por IA**, aleatório, sempre agregando valor — um post do Instagram da
  agência, uma prova social real de cliente. Espírito: *"estou aqui se precisar"*. **Nunca oferta.**
- **Retorno:** lead que responde volta direto para a coluna **RESPONDERAM** do pipeline 1.
  Esse lead é dos mais quentes que existem: teve tempo de pensar e voltou decidido.

---

## Qualificação (o que o CRM precisa capturar por lead)

A ligação segue esta ordem. O script é **âncora, não roteiro de robô** — não deve ser lido literalmente.

1. **RAPPORT** — quanto melhor, mais vendas. Registrar o ponto de conexão gerado (será reusado no F1).
2. **B — Budget** — perguntar como foram os últimos 30 dias e ancorar em US$10 mil, deixando o lead subir.
3. **A — Authority** — confirmar que quem está na linha é o decisor final e que ele estará na call.
4. **N — Need** — se precisa mesmo do serviço.
5. **T — Timeline** — se é para agora ou para o futuro.
6. **Agendamento** — ritual completo abaixo.

**Critério de lead qualificado:** dono/operador faturando acima de **US$20-30 mil/mês** e com
necessidade real.

### Ritual de agendamento (ao fim da ligação)
- Oferecer 2 janelas de horário no **mesmo dia**
- Informar duração de **~40 minutos**
- Pedir para colocar no **viva-voz**
- Pedir para abrir a conversa no WhatsApp
- **Enviar a confirmação ao vivo** e checar se chegou
- Pedir o e-mail no chat "para linkar com o nosso invite no Google Agenda"
- Instruir a baixar o **Google Meet** na App Store (não precisa criar conta)
- Avisar que faltando 5 minutos o closer já estará na sala
- Fechar pedindo compromisso: *"posso contar com a tua presença mesmo? Eu não posso ter furo na agenda"*

---

## Janelas de horário operacionais

- Campanhas rodam 24h. Leads chegam mais das **7h ao meio-dia** e das **17h em diante**.
- Melhor janela para ligar quando o lead não atendeu: **17h às 22h** (52% de taxa de atendimento,
  medido sobre mais de 10 mil ligações). Segunda melhor: **7h às 11h**.
- Tarde é ruim — mas não se deixa de ligar nem de mandar mensagem.

---

## KPIs e relatórios

Metrificar cada transição do funil:

`ADS → WHATSAPP → LIGAÇÃO → CALL MARCADA → CALL COMPARECIDA → CALL FECHADA`

Taxas obrigatórias:
- de quantos leads chegam no WhatsApp, quantos **atendem a ligação**
- de quantos atendem, quantos **marcam a call**
- de quantos marcam, quantos **comparecem**
- de quantos comparecem, quantos **fecham**

**Relatório automático:** a cada **2 horas**, enviar ao meu WhatsApp um resumo com números de ads,
ligações e todos os KPIs atualizados.

**Diagnóstico de gargalo** (o sistema deve apontar, não só mostrar número):
- Muitos leads no WhatsApp mas poucos atendem a ligação → **o criativo está ruim**
- Bom topo mas não comparecem na call → **o SDR não gerou valor suficiente na qualificação**
- Comparecem mas não fecham → em 80% dos casos, **o closer**

---

## Escopo do SDR (a ser respeitado pelas permissões do sistema)

O SDR **só** liga, qualifica, agenda call e faz follow-up. É **proibido** de tentar vender por
mensagem, ofertar ou entrar na call. Meta operacional: **10 ativações por dia por lead** em super hot.

Capacidade: uma pessoa sozinha faz no máximo **3 calls por dia**.

---

## O que eu quero que você faça agora

1. Me faça as perguntas que faltam antes de começar (stack, autenticação, se rodo local ou hospedado).
2. Proponha o modelo de dados dos 4 pipelines antes de escrever código.
3. Construa incrementalmente, começando pelo pipeline 1 (leads novos) funcional ponta a ponta —
   incluindo Z-API e o decaimento automático de 24h — antes de partir para os outros três.
4. Deixe os gatilhos de tempo (24h, 3h, T-24h/8h/4h/2h/1h/30min, 7 dias, 14 dias) configuráveis,
   não hard-coded.
