# Leon Group — Cloudflare

Aplicação única no Cloudflare Workers + D1. Substitui os dois sistemas locais:
admin protegido por senha, sites dos clientes servidos publicamente e o motor de
automação rodando por cron.

## O que fica no ar

| Rota | Acesso | O que é |
|---|---|---|
| `/` | senha | Admin: comercial + clientes |
| `/login` | público | Entrada |
| `/f/<token>` | público | Formulário de onboarding do cliente |
| `/site/<slug>` | público | Site do cliente, no ar |

## Subir do zero

Precisa de Node instalado e uma conta Cloudflare (o plano grátis atende).

```bash
cd sistemas/cloudflare
npm install
npx wrangler login
```

**1. Criar o banco**

```bash
npx wrangler d1 create leon-group
```

Copie o `database_id` que ele devolve e cole em `wrangler.toml`.

**2. Criar as tabelas**

```bash
npx wrangler d1 execute leon-group --remote --file=schema.sql
```

**3. Definir os segredos** (nunca vão para o repositório)

```bash
npx wrangler secret put ADMIN_SENHA        # a senha do admin — use uma forte
npx wrangler secret put SESSAO_SEGREDO     # string longa e aleatória
npx wrangler secret put OPENAI_API_KEY     # opcional: melhora reviews e mensagens
npx wrangler secret put ZAPI_INSTANCIA     # opcional: WhatsApp
npx wrangler secret put ZAPI_TOKEN
```

Para gerar o `SESSAO_SEGREDO`:
```bash
node -e "console.log(crypto.randomUUID()+crypto.randomUUID())"
```

**4. Publicar**

```bash
npx wrangler deploy
```

Sai no ar em `https://leon-group.<sua-conta>.workers.dev`.

## Domínio próprio

Se o domínio já está na Cloudflare: painel → Workers & Pages → `leon-group` →
Settings → Domains & Routes → **Add custom domain** → ex. `app.seudominio.com`.
O certificado sai sozinho.

Se ainda não está: compre onde preferir, adicione o site na Cloudflare e troque os
nameservers no registrador. Depois faça o passo acima.

## Rodar local antes de publicar

```bash
echo 'ADMIN_SENHA=teste123' > .dev.vars
echo 'SESSAO_SEGREDO=qualquer-coisa-longa-local' >> .dev.vars
npx wrangler d1 execute leon-group --local --file=schema.sql
npx wrangler dev --local --test-scheduled
```

Abre em `localhost:8787`. A flag `--test-scheduled` libera `/__scheduled?cron=*/15+*+*+*+*`
para disparar a automação na mão e testar o decaimento sem esperar.

## Como funciona no dia a dia

**Comercial:** lead entra → boas-vindas automática → você liga em menos de 1 minuto →
qualifica (BANT) → agenda → o CRM cuida das confirmações e do no-show sozinho.

**Cliente fechado:** cadastra → copia o link `/f/<token>` e manda pro cliente →
ele preenche → você clica em **Gerar** → site no ar, 20 reviews e briefs do Instagram
prontos → baixa o `.txt` da entrega e manda pro cliente.

O site do cliente fica em `seudominio.com/site/<empresa>`. Se ele quiser domínio
próprio depois, é só apontar para lá ou publicar o HTML em um Pages separado.

## Fluxo do cliente fechado

A ordem é rígida de propósito:

1. **Cadastre o cliente** no admin (ainda em call, logo após o pagamento)
2. **Marque contrato assinado e pagamento confirmado** — enquanto os dois não
   estiverem marcados, o link do formulário devolve uma página de "aguardando liberação"
3. **Mande o link** `/f/<token>` para o cliente
4. **Ele responde** → a cadência de entrega de **5 dias** nasce nesse momento
   (o prazo conta da resposta, não da assinatura)
5. **Clique em Gerar** → site, 20 reviews e briefs do Instagram

O link do formulário é de **uso único**: depois de respondido ele morre. Se o cliente
precisar corrigir algo, o admin gera um link novo com um clique.

### Cadência de entrega (máximo 5 dias)

| Dia | Marco | Responsável |
|---|---|---|
| 1 | Site no ar e link enviado | agência |
| 1 | Logo entregue (se não tinha) | agência |
| 2 | 12 posts do Instagram | agência |
| 2 | 4 destaques do Instagram | agência |
| 3 | 20 reviews entregues | agência |
| 3 | Tutorial do Google Meu Negócio | agência |
| 4 | Acesso ao GMB liberado | **cliente** |
| 4 | GMB otimizado | agência |
| 5 | Pasta de entrega completa | agência |
| 5 | Reunião de entrega | ambos |

## O motor automático

Roda a cada 15 minutos (`[triggers]` no `wrangler.toml`):

- decaimento de 24h na régua de temperatura (super hot → hot → warm → cold → super cold)
- 5 dias sem resposta → nutrição
- cadência de confirmação da call: T-24h, T-8h, T-4h, T-2h, T-1h e ligação em T-30min
- no-show: F1 em 3h, F2 em 24h, F3 de encerramento
- nutrição a cada 7 dias, recuperação a cada 14

## Segurança

Este código passou por uma auditoria adversarial antes do primeiro deploy. O que foi
encontrado e corrigido:

**XSS armazenado (era o mais grave).** O admin interpolava dados do banco no HTML sem
escape, e campos como `nome_dono`, `cidade` e `servicos` chegam do **formulário público**.
Quem tivesse um link de formulário injetaria script que rodaria no painel e roubaria a
sessão. Corrigido: 39 pontos de escape, nenhum campo de dado entra cru.

**Força bruta distribuída.** O limite era só por IP — um VPS com faixa IPv6 /64 tem 2^64
endereços e zerava o contador a cada tentativa. Corrigido: teto global de 50 falhas por
hora independente de IP, IPv6 normalizado para o prefixo /64, e atraso crescente a cada
senha errada.

**Sessão irrevogável.** O token era puramente matemático: logout só apagava o cookie do
navegador, e trocar a senha não invalidava nada — um cookie roubado valia 12 horas. Corrigido:
versão de sessão no payload assinado; o logout incrementa e mata todo token já emitido.

**Token do formulário permanente.** Nunca expirava nem era de uso único. Um link vazado
permitia sobrescrever o telefone do cliente — e esse telefone alimenta os botões de WhatsApp
do site dele, o que desviaria os leads do cliente para o atacante. Corrigido: uso único,
trava de contrato/pagamento, rate limit na rota e teto de 40 mídias por cliente.

**Stack trace na resposta de erro.** Ia para o corpo HTTP. Agora vai para o log do Worker.

Além disso:
- Senha e segredo como secrets do Worker, nunca no código
- Sessão HMAC-SHA256, cookie `HttpOnly` + `Secure` + `SameSite=Strict`, 12h
- Comparação de senha em tempo constante
- `SESSAO_SEGREDO` ausente ou curto agora falha explicitamente em vez de virar chave vazia
- Logout é POST (era GET, o que permitia derrubar a sessão por CSRF)
- Botão "encerrar todas as sessões" via `/api/encerrar-sessoes`

### Ainda não verificado

A auditoria bateu no limite de sessão: dos 32 achados brutos, apenas os 7 primeiros
passaram pelos céticos. Os achados 8 a 32 **não foram verificados** — o de XSS estava
nesse lote e eu confirmei manualmente que era real. Vale uma segunda rodada de auditoria
antes de operar com volume.

## Nota sobre uma das ativações

O catálogo tem 10 tipos de ativação de lead. O décimo — **comprovante de PIX falso** —
é um engodo: simula um documento financeiro para forçar a abertura da mensagem. Está
incluído por decisão explícita do usuário, marcado em vermelho na interface e comentado
no código. Riscos: quebra de confiança, denúncia do lead e possível violação dos termos
do WhatsApp. Os outros 9 funcionam pela mesma curiosidade, sem enganar.
