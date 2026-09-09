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
| `/m/<chave>` | público | Foto e vídeo dos clientes (R2). O site publicado busca daqui |
| `/favicon.png` | público | Ícone da marca na aba, o mesmo do site |
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

Num banco que JÁ existe, aplique as migrações que faltam, em ordem:

```bash
for m in migracao-*.sql; do npx wrangler d1 execute leon-group --remote --file="$m"; done
```

Erro de "duplicate column" nas migrações 01, 02, 03 e 05 é esperado: essas
colunas já foram incorporadas ao `schema.sql`. As outras têm que passar.

**2b. Criar o armazenamento de arquivo**

```bash
npx wrangler r2 bucket create leon-group-midia
```

É onde ficam as fotos e vídeos que o cliente sobe do celular no formulário e as
peças prontas que a agência sobe no card. Não vai para o D1: o D1 é SQLite, com
linha de no máximo 1 MB, e um vídeo de celular tem 40 MB. O plano grátis do R2 dá
10 GB e não cobra saída de dados, que é o que o site do cliente consome ao
carregar as fotos.

Sem o bucket o sistema sobe igual: a área de upload aparece desligada, com o
comando na tela, e o campo de colar link continua funcionando.

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

## Fotos e vídeos

O cliente escolhe na galeria do celular e o arquivo sobe direto, sem Drive e
sem link. Guardado no **R2** (bucket `leon-group-midia`), servido pela rota
pública `/m/<chave>`.

A rota é pública de propósito: o site do cliente é publicado no Vercel, em
outro domínio, e busca as imagens daqui sem cookie nenhum. A chave é um UUID,
então o link não é adivinhável, mas também não é secreto: foto de obra existe
justamente para aparecer no site dele.

Limites: 12 MB por foto, 95 MB por vídeo (o corpo de requisição do Worker para
em 100 MB), 40 fotos e 5 vídeos por cliente. A foto é reduzida no celular antes
de subir, para gastar pouca internet.

O tipo é conferido pelos **primeiros bytes**, não pelo cabeçalho: o
`Content-Type` é escolhido por quem sobe, então sozinho não vale nada. HTML
disfarçado de PNG é recusado.

Se o bucket for apagado, comente as três linhas do binding em `wrangler.toml`:
o sistema volta a rodar sem upload, o formulário mostra os campos de colar link
e a área de peças mostra o aviso. **Binding declarado sem bucket criado derruba
o deploy inteiro**, não só o upload.

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
ele preenche **e sobe as fotos direto do celular** → você clica em **Gerar** → site
no ar, 20 reviews e briefs do Instagram prontos → baixa o `.txt` da entrega e manda
pro cliente.

**Dashboard comercial:** primeira aba do setor Comercial. O funil inteiro (quantos
entram, respondem, agendam, comparecem, recusam, fecham na call, fecham no
follow-up, se perdem), o dinheiro em **dólar e real ao mesmo tempo**, e o
diagnóstico de onde está o gargalo. O diagnóstico da tela roda sempre e não custa
nada; o botão **Analisar com IA** manda só os números agregados para a OpenAI,
nenhum nome ou telefone de lead.

Com menos de 5 leads numa etapa o diagnóstico se cala e diz que se calou: taxa em
cima de 3 leads é ruído, e apontar gargalo ali seria chute com cara de dado.

## Dinheiro: dólar e real, sem ficção

A operação fatura em **dólar** e o fundador vive em **real**. Isso não é detalhe de
apresentação: são dois números que ele precisa ver juntos, e a ponte entre eles é
uma cotação que muda todo dia.

A regra que sustenta tudo aqui é uma só:

> O real que entrou depende da cotação do dia em que **aquele** dinheiro entrou,
> não da cotação de hoje.

Por isso cada entrada guarda a própria cotação, e o total em real de uma entrada
antiga **não muda** quando o dólar mexe. Sem isso, o faturamento mudaria sozinho a
cada vez que a tela fosse aberta, e faturamento que muda sozinho não é
faturamento. Há teste dedicado a isso em `testes/funil-e-financeiro.js`.

### Entradas, não um campo de "valor pago"

Cada dinheiro que cai na conta é uma linha na seção **Entradas** do card do
cliente: valor, moeda, **a data em que o dinheiro entrou**, a cotação daquele dia,
o meio (Wise, Zelle, PIX) e qual parcela é.

Isso existe porque um campo só não responde a pergunta:

- Contrato **MRR** recebe todo mês. O segundo e o terceiro pagamento não tinham
  onde ser registrados.
- A data do dinheiro é o que permite ver o **mês a mês** e saber se a entrada
  está crescendo ou parou.
- A cotação por entrada é o que trava o valor em real.

Cliente antigo que tem valor recebido e nenhuma entrada lançada continua contando:
esse valor entra como **uma** entrada implícita, marcada na tela como registro
antigo, com aviso para regularizar. Nada do histórico desaparece.

### Cotação de referência

Usada só em dois lugares: onde a entrada não tem cotação própria, e para projetar
o que ainda falta receber. O botão **Atualizar cotação** aceita um valor digitado
ou busca a cotação de mercado do dia (AwesomeAPI, sem chave).

Ela é **referência**, e a tela diz isso: o real que você recebe de verdade sai da
cotação do seu banco ou da Wise, que é sempre um pouco pior que a de mercado. Todo
valor convertido pela referência em vez da cotação real aparece marcado como
estimado, com o percentual do total que depende dessa estimativa. Passando de 20%,
um aviso grande diz onde resolver.

### O funil

Funil de verdade, não barra horizontal: trapézios centrados, largura
proporcional ao valor, **altura constante** por etapa.

A altura constante não é escolha estética. Trapézio de altura variável distorce
a área, e como o olho compara área e não largura, diferença pequena entre
etapas passa a ser lida errada. Com altura fixa a área fica linearmente
proporcional à largura. Nada de 3D, sombra ou gradiente, que é o que mais
atrapalha a leitura de funil (e também é a direção estética da marca).

Cinco etapas no corpo (entraram, responderam, agendaram, compareceram,
fecharam) e as saídas laterais em cartão: fechou na call, fechou no follow-up,
recusou na call, perdido. Entre cada par de etapas, a taxa, o piso de
referência e quantos pararam ali. A faixa que fica **depois** de uma transição
ruim é a única que muda de cor: é onde dói.

Se uma etapa vier maior que a anterior (alguém movido para frente sem passar
pelo meio), a largura é travada na anterior e a anomalia é dita em texto. Funil
invertido desenhado em silêncio esconderia um erro de cadastro.

### Caixa: o app de gastos da operação

Aba própria no comercial. Registra os dois lados do dinheiro e diz quanto
sobrou.

O que veio de referência de aplicativo de gasto:

| Padrão | Por que |
|---|---|
| Cartão de saldo no topo | "Sobrou dinheiro?" é a primeira pergunta e não pode exigir rolagem |
| Navegação por mês | Gasto se lê por mês: é o ciclo do cartão, do aluguel, do anúncio |
| Para onde foi, por categoria | Sem isso ninguém enxerga que 60% do caixa virou anúncio |
| Extrato agrupado por dia | É a forma como se confere contra o banco. Cada dia traz o próprio saldo |
| Entrada e saída por cor e sinal | Distinção imediata, sem ler o valor |
| Lançamento rápido | Data já em hoje, categoria com explicação do que entra nela |

O que é específico desta operação: **tudo em dólar e em real ao mesmo tempo**, e
cada lançamento carrega a cotação do dia em que aquele dinheiro se moveu.

As saídas ficam na tabela `saidas`, com dez categorias tiradas da operação real
(anúncios, ferramentas, infra e Z-API, terceiros, contador, equipamento, taxa
bancária, curso, custo de operação, outros). Despesa marcada como **mensal**
alimenta o custo fixo. `cliente_id` preenchido faz o gasto ser custo direto
daquele cliente; vazio, é custo da operação.

### Duas perguntas que não são a mesma

O erro clássico de painel de agência é responder as duas com um número:

| | O que responde | O que desconta |
|---|---|---|
| **Lucro nos clientes** | Cada cliente se paga? | Taxa e custo direto daquele cliente |
| **Saldo do caixa** | Sobrou dinheiro no fim do mês? | Tudo que saiu, anúncio e contador incluídos |

Um cliente pode ser lucrativo e o caixa fechar negativo, se o custo da operação
for maior que a soma dos clientes. É o que quebra agência pequena, e mostrar um
número só esconderia exatamente esse caso. Quando acontece, o sistema diz em
texto, com os dois valores e a causa.

### O que o dashboard mostra

| Bloco | O que responde |
|---|---|
| Entrou na empresa | O total, em dólar e em real, com quanto veio nativo em cada moeda |
| Saiu e saldo | Na aba Caixa: tudo que saiu, por categoria e por dia |
| Contratado | Valor total dos contratos. MRR conta mensalidade x duração, não a mensalidade crua |
| Ainda a receber | Contratado menos o que entrou |
| Mensalidade recorrente | A soma das mensalidades dos contratos de MRR, por mês |
| Taxas e custos | O que sai do que entrou. Custo tem moeda própria: ferramenta em dólar, contador em real |
| Lucro e lucro por cliente | Nas duas moedas, dividido pelos que **pagaram**, não pelos que fecharam |
| Mês a mês | Pela data do dinheiro, com barra de comparação |
| Cliente por cliente | Cada entrada com a cotação que usou, e o que falta receber |

Cada cartão traz dólar em cima e real embaixo, sempre nessa ordem: alternar a
ordem entre cartões faria ler o número errado com pressa.

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

### A logo, antes das outras três peças

O formulário pergunta ao cliente o estilo, o símbolo, as cores, as marcas de
referência e **o que ele não quer**. Desse briefing o card monta um **prompt JSON
para o gpt-image-2**, com um botão de copiar: cola no ChatGPT, pede a imagem, e
sobe os arquivos de volta na seção **Peças e arquivos**.

O prompt sai em inglês (é o que o modelo desenha melhor, e o texto dentro da logo
é para dono de casa americano), com a frase original do cliente em português
guardada num campo próprio: se a tradução errar a intenção, a intenção está lá do
lado. O campo mais importante é a grafia exata do nome, isolada de propósito, que
é onde modelo de imagem mais erra.

A logo é a primeira peça da fila porque ela entra no site, no Instagram e no
Google. Fazer depois das três é refazer as três.

### O que precisa estar pronto para o cliente sair de "Em entrega"

A resposta fica no alto do card, na seção **O que falta para concluir**, com o
número de cada grupo e onde mexer em cada um. São três grupos que travam:

| Grupo | Onde | Por que trava |
|---|---|---|
| Os 11 marcos da cadência | Seção "Cadência de entrega" | Marco aberto é etapa que o cliente não recebeu |
| Os itens obrigatórios do checklist | Seção "Checklist de otimização" | É onde mora o Google Meu Negócio, a peça de maior retorno |
| Os 4 entregáveis | Seção "Entregáveis" | É o que foi vendido |

Os **arquivos das peças** aparecem no mesmo painel como quarto grupo, mas **não
travam**: quem atesta que a logo foi entregue é o item do checklist. O arquivo no
R2 é a prova, não a condição.

**Entregou antes do prazo?** O botão *Marcar como entregue antes do prazo* fecha
mesmo com grupo aberto. Ele pede duas coisas: a justificativa escrita e a frase
`SERVIÇO ENTREGUE ANTES DO TEMPO` digitada. O que estava aberto no momento do
clique fica congelado no card, e quem abrir depois vê o que faltava. Dá para
reabrir a qualquer momento.

Marcar entregue o que não foi feito é exatamente o tipo de número que esta
operação não inventa, então o botão registra em vez de apagar.

### Custos e lucro

"Entrou" e "lucro" são números diferentes. O card tem **Custos e lucro** com a
taxa do gateway em % e o custo direto do cliente, **com moeda própria**: a
ferramenta é cobrada em dólar, o contador e o freela em real. Sem isso
preenchido, o dashboard mostra lucro igual ao que entrou.

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
