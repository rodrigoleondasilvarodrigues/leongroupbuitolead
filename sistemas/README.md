# Sistemas — Leon Group

Construídos a partir das 311 especificações extraídas das 4 aulas da mentoria
(transcrição literal, 5h56). Rastreabilidade em `_memoria/historico/ESPECIFICACOES-SISTEMAS.md`.

## O que roda hoje

| Sistema | Pasta | Onde | Estado |
|---|---|---|---|
| **Aplicação única** (CRM + caixa + entrega) | `cloudflare/` | [leon-group.leongroup.workers.dev](https://leon-group.leongroup.workers.dev) | no ar, 402 asserções |
| Site da agência | `site-agencia/` | [leon-group-site.pages.dev](https://leon-group-site.pages.dev) | no ar, 96 verificações |

```bash
cd sistemas/cloudflare
./testes/rodar.sh      # antes de todo deploy
npx wrangler deploy
```

Documentação: `cloudflare/README.md` (como usar), `cloudflare/PENDENCIAS.md`
(estado e dívida técnica), `cloudflare/testes/README.md` (o que cada teste impede).

## Histórico: as versões locais em Python

| # | Sistema | Pasta | Porta |
|---|---|---|---|
| 1 | CRM Comercial | `crm-comercial/` | 8770 |
| 2 | Operação de Entrega | `02-entrega/` | 8771 |

Foram o primeiro corte, e a aplicação Cloudflare **substituiu as duas**. Ficam
aqui porque a rastreabilidade das 311 especificações passa por elas.

⚠ **Não desenvolver nessas pastas.** O que está no ar é `cloudflare/`, e mudança
feita aqui não chega a lugar nenhum.

```bash
cd sistemas/crm-comercial && python3 crm.py      # localhost:8770
cd sistemas/02-entrega    && python3 entrega.py  # localhost:8771
```

## A divisão entre os dois

**CRM Comercial** cuida de quem ainda não é cliente: do anúncio até o pagamento.
4 pipelines (leads novos, agendamento, recuperação, nutrição), régua de temperatura
com decaimento de 24h, cadência de confirmação de call, máquina de no-show e KPIs
com diagnóstico de gargalo.

**Operação de Entrega** começa onde o outro termina: o cliente pagou. Cadastro,
formulário, geração do site + 20 reviews + briefs de Instagram, pasta de entrega e
a régua dos 14 dias.

## Ordem que a própria aula recomenda

O instrutor é explícito sobre a sequência:

1. **Não comece pelo CRM.** *"Se você hoje não utiliza CRM, não se preocupa em usar agora"* —
   no começo o volume é baixo e dá pra tocar no WhatsApp com uma planilha de KPIs.
2. O momento de ligar o CRM comercial é na transição do **2º para o 3º cliente**.
3. A entrega dos 2 primeiros clientes é **manual** — que é exatamente o que o sistema 2 faz.

Ou seja: o sistema 2 é o que você usa primeiro. O sistema 1 já está pronto para quando
o volume justificar.

## Configuração das integrações

Ambos funcionam em modo simulado sem nenhuma chave. Para produção, copie
`.env.exemplo` para `.env` em cada pasta:

- **Z-API** (~R$100/mês) — ponte entre o CRM e o WhatsApp. Só no sistema 1.
- **OpenAI** — varia as mensagens do CRM e gera as reviews. Nos dois.

## O que ainda depende das 3 aulas não liberadas

- A **aula de Claude Coding** — o instrutor menciona que virá e é onde ele mostraria
  o ecossistema do CRM dele por dentro.
- O **arquivo `.md`** que ele prometeu na aula 01 e voltou atrás na aula 04
  (*"não consigo disponibilizar o template, são muitos códigos"*).
- O **arquivo do sistema de registro do Closer** — o único que ele mantém a promessa
  de enviar (*"esse eu consigo enviar um arquivo que vocês só vão instalar"*).

Quando essas aulas saírem, dá pra comparar com o que já está construído e completar
o que faltar.
