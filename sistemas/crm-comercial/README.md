# CRM Comercial — Leon Group

Implementação dos 4 pipelines comerciais especificados nas aulas 01–04 da mentoria.
Roda local, sem nenhuma dependência externa: Python 3 (stdlib) + SQLite.

## Rodar

```bash
cd sistemas/crm-comercial
python3 crm.py
```

Abre em **http://localhost:8770**. O banco (`crm.db`) é criado sozinho na primeira execução.

Para enviar mensagens de verdade, copie `.env.exemplo` para `.env` e preencha as chaves.
Sem elas, o CRM roda em **modo simulado**: registra tudo no banco e imprime no console,
sem disparar nada — bom para testar sem risco de queimar o número.

## Os 4 pipelines

**1. Leads novos** — `Responderam · Super Hot · Hot · Warm · Cold · Super Cold`
Lead entra em Super Hot. A cada 24h sem resposta desce um degrau automaticamente e as
ativações diárias caem junto (10 → 7 → 5 → 3 → 2). Cinco dias sem resposta → Nutrição.

**2. Agendamento** — `Call Agendado · Call Rolando · No Show · F1 · F2 · F3 · Recusou`
Ao agendar, o CRM calcula sozinho a cadência de confirmação a partir do horário da call:
mensagens em T-24h, T-8h, T-4h, T-2h, T-1h e uma **ligação humana** em T-30min.
No-show dispara F1 em 3h, F2 em 24h e F3 (encerramento) — sempre no padrão 2 ligações + 2 mensagens
(F3: 2 ligações + 1 mensagem).

**3. Recuperação** — lead que sumiu mesmo após o F3. Uma mensagem a cada 14 dias.

**4. Nutrição** — lead que não respondeu em 5 dias. Uma mensagem a cada 7 dias, gerada por IA,
nunca oferta. Quem responde volta direto para "Responderam".

## Regras que o sistema aplica sozinho

| Regra | Onde |
|---|---|
| Boas-vindas automática em 15-30s avisando que ligam em menos de 5 min | ao criar o lead |
| Nunca agendar call para mais de 2 dias à frente | bloqueado na API |
| Nunca 3 ligações seguidas (risco de ban) | catálogo de ativações |
| Mensagens variadas por IA, espaçadas 5-7s | `enfileirar()` |
| Número novo não dispara nada por 7 dias | `numero_liberado()` |
| Confirmação nunca pergunta se vai comparecer — só afirma | prompt da variação |
| Vocabulário: "call", nunca "reunião" | prompt da variação |

## Diagnóstico de gargalo

O painel de KPIs não mostra só número — aponta a causa, conforme a aula:

- muitos no WhatsApp mas poucos atendem → **o criativo está ruim**
- marcam mas não comparecem → **o SDR não gerou valor na qualificação**
- comparecem mas não fecham → em 80% dos casos, **o closer**

## Estrutura

```
crm.py        servidor, API, motor de automação (tick a cada 60s)
regras.py     todas as constantes extraídas das aulas — mexa aqui para ajustar
schema.sql    modelo de dados
static/       interface web
.env.exemplo  chaves de Z-API e OpenAI
```

Os tempos (24h, 3h, 7 e 14 dias, cadência de confirmação) estão em `regras.py`,
não hard-coded no meio do código.

## Aviso sobre uma das ativações

O catálogo tem 10 tipos de ativação. O décimo — **comprovante de PIX falso** — é um engodo:
simula um documento financeiro para forçar a abertura da mensagem. Foi incluído a pedido
explícito do usuário e está marcado no código (`regras.py`) e na interface (botão em vermelho).
Riscos reais: quebra de confiança com o lead, denúncia e possível violação dos termos do WhatsApp.
Os outros 9 tipos funcionam pelo mesmo mecanismo de curiosidade sem enganar ninguém.
