## Site do cliente: o que entrou em 2026-09-17 e 18

Feito, no ar e com teste (`testes/site-do-cliente.mjs`, 81 asserções):

- **Selos condicionais** no herói: Licensed e Insured só para quem marcou no
  formulário. O template do kit da mentoria os escreve fixos, e isso seria
  alegação falsa em nome do cliente.
- **Rodapé** com e-mail, Instagram e tagline, mais o crédito
  "Marketing and social media by Leon Group" (decisão de 2026-09-18, que revoga
  a regra de white label herdada do kit).
- **Visualizar site** (`/api/ver-site`), que faltava: só existia o download, e ele
  marcava `site_exportado_em`. Visualizar não marca nada.
- **Domínio próprio do cliente**: o Worker serve o site pelo host que chega,
  sem projeto Pages por cliente. Migração 17, com índice único.
- **Região fixa fora da copy**: "New England" saiu da biblioteca de textos.
- **Cadência** ganhou o marco da call de apresentação e acesso (Aula 05).
- **Checklist** ganhou as duas regras de foto do kit (post do Google sem texto
  na imagem, e recusa de foto fora do assunto).

### O que falta dessa frente

1. **QA automático do site** antes de marcar o entregável como pronto. O kit tem
   um `site_qa.js` que confere seções, imagens quebradas e slots de foto.
2. **Biblioteca de textos por nicho** do kit (`lib_niche_defaults.js`, 27 KB de
   copy em inglês por serviço) para substituir a nossa, que é mais curta.
3. **Hashtags por nicho** (`lib_hashtags.js`).
4. **Fase 2, motor local:** renderizar os 12 posts e os 4 destaques em PNG com
   Puppeteer e tratar a cor das fotos com ffmpeg. Não roda em Worker, precisa do
   mesmo desenho do Assistente Leon (serviço local pareado com o sistema no ar).

⚠ Os 5 clientes de teste em produção guardam o site antigo em `site_html`. O
crédito e os selos só aparecem depois de gerar de novo em cada card.

---

## Roteiro da ligação de qualificação (feito em 2026-09-11)

A seção "Qualificação BANT" do card do lead eram cinco campos em branco com uma
dica de 11px em cada. Servia para anotar depois. Não servia para conduzir a
ligação, que é onde a venda acontece.

Agora o card abre o roteiro da Aula 03 etapa por etapa, com a fala já preenchida
com o nome e a empresa do lead, o campo de captura embaixo da etapa que o
alimenta, e no fim o checklist da confirmação ao vivo.

- Conteúdo em `src/conteudo-qualificacao.js`, tela em `src/admin-qualificacao.js`
- 49 asserções em `testes/qualificacao.mjs`
- Migração 15 guarda quais passos da confirmação ao vivo foram feitos

**Duas adaptações conscientes do script original**, porque o Enrico opera com SDR
e closer separados e a Leon Group é uma pessoa só: saiu o "quem vai conduzir essa
call vai ser o Henrico" e saiu o "eu vou pedir para os meus meninos prepararem o
plano". Fingir equipe é exatamente o que a regra de integridade proíbe. O
compromisso foi reescrito para o trabalho real, que é o diagnóstico que ele monta
sozinho, e o efeito de criar custo social para o no-show se mantém porque o
trabalho é verdadeiro.

# Melhorias pedidas durante o teste integral (2026-09-07)

Anotadas no meio do teste para não interromper o fluxo. Fazer depois que
o teste terminar.

## 1. Ordem das seções no card do lead ✅ FEITO

**Pedido do usuário:** hoje a seção **Contrato** aparece antes de **Mover**.
Inverter: Mover primeiro, Contrato depois.

Motivo: Mover é usado a cada passo (call rolando, no show, recusou), e
Contrato só uma vez, no fechamento. A ação frequente tem que estar mais perto.

**Cuidado ao fazer:** o contrato precisa estar preenchido ANTES de mover para
"Fechou", porque os dados são copiados para o cliente na virada. Com Contrato
embaixo de Mover, fica fácil clicar em Fechou sem ter preenchido.

Proposta: fazer a inversão pedida E, ao clicar em "Fechou" com o contrato
vazio, o sistema perguntar antes de converter. Assim atende o pedido sem
abrir o buraco.

## 2. Fuso no campo de agendamento

O campo `datetime-local` não diz em que fuso a hora está sendo digitada. Ele
usa o relógio do navegador, em silêncio.

Hoje funciona porque só o fundador opera, e ele está em Brasília. O risco é
real: marcar 8h da manhã pensando "cedo mas ok" dá 7h para um lead em
Massachusetts, e ligação às 7h queima o lead.

**Correção:** mostrar embaixo do campo, ao vivo, a hora convertida para o
fuso do lead enquanto ele digita. Algo como:

    12:30 para você em Brasília  ·  11:30 para ele em Framingham, MA

Os dados já existem: `fusoDe(lead)` no admin.js devolve o fuso, e a função
`difBsb` já calcula a diferença.

## 3. valor_pago preenchido antes do pagamento ✅ RESOLVIDO, ver item 8

Na virada de lead para cliente, `criarClienteDoLead` grava
`valor_pago = corpo.valor_pago || lead.valor_contrato`. No teste, o cliente
nasceu com `valor_pago = 1500` enquanto `pagamento_confirmado = 0`.

`valor_pago` é dinheiro que ENTROU. Somar esse campo entre clientes para ver
faturamento conta dinheiro que ainda não chegou. É o mesmo erro que o código
já evita de propósito com o budget do BANT, mas escapou aqui.

**Correção:** não gravar `valor_pago` na virada. Preencher quando a chave de
pagamento confirmado for ligada, usando o valor do contrato como sugestão
editável.

## 4. Travessões nas páginas públicas ✅ FEITO

`src/paginas.js` é anterior à regra de não usar travessão. Pelo menos três:
- título da página de espera: "<empresa> — Aguardando liberação"
- intro do formulário: "melhor fica a entrega — e mais qualificado..."
- campo de fotos: "Links das fotos — precisamos de pelo menos 11"

Varrer o arquivo inteiro.

## 5. RECONSTRUIR o site do cliente ✅ FEITO em 2026-09-07

Pedido do usuário durante o teste: "será que conseguimos melhorar o site do
cliente? Deixar muito melhor mesmo, sem algo tão simples e montar como se
fosse um padrão pra todos os futuros clientes?"

### O que o site gerado tem hoje, medido no teste

    tamanho                     6,1 KB, 4 seções
    schema.org LocalBusiness    não tem
    telefone clicável (tel:)    não tem
    formulário de orçamento     não tem
    cidades atendidas           não tem (o cliente informou 10)
    as 20 reviews               não tem
    palavras em português       14

### Problema 1: idioma misturado

O formulário é respondido em português, porque o cliente é brasileiro. Isso
está certo. O erro é usar a prosa dele CRUA no site, que é lido por dono de
casa americano. O campo `diferencial` foi direto para o subtítulo do hero em
português, embaixo de um título em inglês.

**Correção:** as respostas em português são BRIEFING, não conteúdo. O texto
em inglês tem que ser gerado a partir delas (via OPENAI_API_KEY). Sem a
chave, o site não pode exibir a prosa crua: usa só os campos estruturados
(serviços, cidades, telefone), que já são termos em inglês.

### Problema 2: falta o que faz um site de contractor converter

Um site de prestador local precisa, no mínimo:

- **schema.org LocalBusiness em JSON-LD** com nome, telefone, área atendida,
  serviços e horário. É o que alimenta o resultado de busca local
- **Telefone como `tel:` fixo na tela**, sempre visível no celular. A maior
  parte do tráfego é celular e a ação é ligar
- **Uma página ou seção por serviço**, com o termo que a pessoa realmente
  busca ("hardwood floor refinishing near me")
- **As cidades atendidas listadas**, cada uma como texto indexável. As 10
  cidades que o cliente informou são a maior alavanca de SEO local que ele
  tem, e hoje nenhuma aparece
- **As reviews em destaque**, com nota e nome
- **Galeria de antes e depois**, que é o formato que converte em obra
- **Formulário de orçamento** que mande o lead para algum lugar (decidir
  para onde: WhatsApp do cliente, e-mail, ou o CRM)
- **Selo de licença e seguro** quando o cliente tiver

### Problema 3: é um template genérico

Cores padrão do banco (azul #1B4965 e amarelo #F6AE2D) em layout de
template. Precisa virar um padrão de verdade da Leon Group: identidade
própria, reconhecível como trabalho da agência, mas que respeite as cores
que o cliente escolheu no formulário.

### Como fazer

Vale tratar como projeto próprio, não como remendo em `gerarSite`. Provável
caminho: um template real com blocos condicionais (mostra a seção de reviews
só se houver reviews, a de licença só se houver licença), gerado a partir de
um objeto de dados limpo, com o texto em inglês vindo da IA a partir do
briefing em português.

Testar com o Ribeiro antes de usar em cliente real.

## 6. Marcos e entregáveis não conversam ✅ FEITO, o checklist trava a entrega

Achado pelo usuário durante o teste: "o que significa estar pendente se já
foi entregue?"

No fim do teste o painel dizia **entrega completa** (11 de 11 marcos) com
dois dos quatro entregáveis ainda em `pendente` (Google Meu Negócio e Logo)
e um em `em_producao` (Instagram).

São dois controles paralelos que não se falam:

- **Marcos**: os 11 passos da cadência. Marcados à mão, um a um
- **Entregáveis**: os 4 artefatos e seu estado. Manuais, com duas exceções
  automáticas: gerar move `site` e `instagram` para `em_producao`, e colar a
  URL do Vercel move `site` para `entregue`. `gmb` e `logo` nunca mudam
  sozinhos, e `instagram` nunca chega a `entregue`

O risco: fechar a entrega de um cliente sem o Google Meu Negócio existir, que
é justamente a peça de maior retorno da entrega. O sistema não avisa nada.

**Correção proposta, em duas partes:**

1. `entrega_completa` passa a exigir marcos concluídos **E** os quatro
   entregáveis em `entregue` ou `aprovado`. Hoje ela olha só os marcos
2. O painel mostra qual entregável está travando o fechamento

Opcional, avaliar: marcar o marco correspondente mover o entregável junto.
O mapa é direto:

    marco "Site no ar e link enviado"       -> entregável site
    marco "Logo entregue"                   -> entregável logo
    marcos "12 posts" e "4 destaques"       -> entregável instagram
    marco "GMB otimizado"                   -> entregável gmb

Risco dessa parte: automatizar demais faz o operador marcar sem fazer. A
parte 1 é mais segura, porque trava sem tirar a decisão da mão dele.


---

## 7. Mensagem no grupo do WhatsApp

Fora da lista por enquanto, a pedido do usuário: ele ainda não contratou a
Z-API e vai voltar nesse assunto depois. Fica registrado só o diagnóstico,
para não ter que redescobrir:

O campo `grupo_whatsapp` guarda o LINK DE CONVITE (`chat.whatsapp.com/XXXX`).
A Z-API não envia para link de convite, ela envia para o ID do grupo, que é
outro identificador. Resolver exige guardar o ID, e provavelmente buscar a
lista de grupos da instância conectada para o operador escolher numa lista
em vez de digitar.

## 8. valor_pago antes do pagamento ✅ RESOLVIDO em 2026-09-07

Eram dois números tratados como um só. Agora estão separados:

    valor_contrato = CONTRATADO, o que foi combinado no fechamento
    valor_pago     = RECEBIDO, dinheiro que entrou de verdade

- A virada de lead para cliente não grava mais `valor_pago`. Na virada nada
  entrou ainda
- `valor_pago` nasce quando a chave de pagamento confirmado é ligada,
  sugerido pelo valor do contrato e editável
- Desligar a chave zera o `valor_pago`: pagamento não confirmado não conta
  como receita
- A tela mostra os dois estados de forma diferente: `6900 a receber` em
  laranja, ou `6900 recebido` em negrito

---

# Pedidos de 2026-09-08 (feitos)

Seis pedidos do usuário, todos implementados e testados. Suíte em 203
asserções (`./testes/rodar.sh`), mais um percurso ponta a ponta no Worker
rodando local com D1 e R2 simulados.

## 1. Prompt JSON da logo ✅ FEITO

O formulário perguntava só "quais cores você gostaria", o que não dá para
gerar logo nenhuma. Agora ele pergunta estilo, símbolo, cores, referências,
o que **não** quer, o nome exato e o slogan. Desse briefing sai um prompt
JSON para o gpt-image-2, com botão de copiar, na seção **Logo** do card.

Decisões que valem registrar:

- **Determinístico por padrão.** Mesma entrada, mesma saída, sem chamada de
  rede e sem custo. A IA (`&ia=1`) é só refinamento opcional dos campos
  descritivos, e não pode tocar na grafia do nome, na lista negativa nem nos
  entregáveis, que são exigência e não estilo.
- **Sai em inglês, guarda o português.** O modelo desenha melhor em inglês e
  o texto dentro da logo é para dono de casa americano. A frase crua do
  cliente fica em `client_brief_verbatim`, com instrução de que ela manda em
  caso de contradição: se a tradução automática errar a intenção, a intenção
  original está do lado.
- **Símbolo por ofício.** Flooring puxa tábua e veio de madeira, roofing
  puxa linha de telhado, HVAC puxa fluxo de ar. Sem isso o modelo devolve
  casinha genérica para todo mundo, que é a cara de logo de IA que a marca
  evita.
- **A lista negativa é padrão da casa**, não preferência de cliente: nada de
  3D, brilho, gradiente, selo de prêmio falso, fileira de cinco estrelas
  falsa. As duas últimas por causa da regra de integridade.

## 2. Área para subir a peça pronta ✅ FEITO

Seção **Peças e arquivos** no card, na ordem do fluxo de trabalho e não em
ordem alfabética: **logo → site → Instagram → Google → pasta de entrega**,
com o dia da cadência em cada grupo.

A logo vem primeiro porque ela entra nas outras três. Fazer depois é refazer
as três, e agora o "o que fazer agora" do card aponta para ela quando o
cliente não tinha logo.

Cada slot diz quantos arquivos precisa, quantos tem e o que é a peça (o
ícone quadrado do Google recorta em círculo, a arte do post é 1080x1350).

## 3. Upload de verdade no formulário do cliente ✅ FEITO

Era "suba no Drive, deixe público e cole 11 links, um por linha". Ninguém faz
isso no celular, e era onde a entrega travava. Agora é seletor de arquivo com
miniatura, contador do que falta e progresso por arquivo.

O que foi preciso resolver:

- **Redução no próprio celular** (canvas, 1920px, JPEG 0.82). Foto de celular
  tem 4 MB; 15 delas em rede móvel fazia o cliente desistir no meio. Cai para
  algo entre 200 e 400 KB.
- **HEIC do iPhone.** Navegador nenhum desenha HEIC em `<img>`. Passar pelo
  canvas devolve JPEG, então a foto do iPhone funciona no site. O HEIC cru
  ainda é aceito como último recurso, marcado como sem preview.
- **Um arquivo por requisição**, não multipart. Um POST com 15 fotos estoura
  o corpo do Worker e as 15 falham juntas.
- **Retomada.** O navegador do celular mata a aba quando ele troca de
  aplicativo para procurar uma foto. `GET /api/subir/<token>` devolve o que já
  subiu, e a lista volta em vez de ele mandar tudo de novo.
- **O mínimo de 11 vale sobre a soma** de subidas e links colados. O campo de
  link continua lá, recolhido, para quem já tem uma pasta pronta.
- **URL absoluta no banco.** O site do cliente é publicado no Vercel, em outro
  domínio: caminho relativo apontaria para o lugar errado.

Validação no servidor: tipo na lista, **assinatura dos primeiros bytes**
conferida contra o tipo declarado (sem isso dava para declarar `image/png` e
subir HTML, que serviria script no nosso domínio), teto de tamanho, teto de
quantidade por slot, e a mesma trava de contrato/pagamento/link-consumido do
formulário.

## 4. O que define "concluído" ✅ FEITO

A pergunta "o que falta para este cliente sair de EM ENTREGA" tinha resposta
espalhada por três contagens invisíveis em lugares diferentes da tela. Agora é
uma conta só, no servidor (`portaoDeConclusao`), usada pelo card, pela lista e
pelo botão. A seção **O que falta para concluir** mostra os grupos, o número de
cada um, **onde mexer** e por que aquele grupo importa.

Travam: os 11 marcos, os itens obrigatórios do checklist, os 4 entregáveis.
Os arquivos das peças aparecem no mesmo painel e **não travam**: quem atesta a
entrega é o checklist, o arquivo é a prova. Transformar em condição criaria
trabalho que ninguém pediu, e a linha é fácil de mudar se ele quiser.

**Botão de entrega antecipada:** pede a justificativa escrita e a frase
`SERVIÇO ENTREGUE ANTES DO TEMPO` digitada. Aceita sem acento e em minúscula,
porque recusar por causa do Ç no teclado do celular não protege nada. O que
estava aberto no clique fica congelado em `entrega_forcada_pendencias` e
aparece no card, com evento no histórico. Dá para reabrir.

## 5. Dashboard comercial ✅ FEITO

Primeira aba do setor Comercial, nas cores da marca (marfim, preto, laranja só
na ênfase, verde para etapa saudável).

- **Funil em 8 barras**, proporcionais a quem entrou e não à etapa anterior:
  é o que mostra o estreitamento real em vez de dar 100% em toda etapa.
  Fechamento aparece separado, **na call** e **no follow-up**, derivado do
  campo `de` do evento de movimentação. Funciona para os dados que já
  existiam, sem precisar de contador novo.
- **Dinheiro:** contratado, recebido, a receber, taxas, custos, lucro e lucro
  por cliente. **Uma linha por moeda**, nunca somando entre moedas. Valor
  digitado sem moeda vai para um balde próprio e é sinalizado na tela.
- **Diagnóstico determinístico**, roda sempre e não custa nada. O gargalo é a
  etapa ruim que perde **mais gente em número absoluto**, não a de pior
  percentual: 20% de 100 leads dói mais que 5% de 4. Aponta também o que está
  indo bem, para ele não mexer no que funciona.
- **Botão de IA**, não automático: cada clique é uma chamada paga, e o
  diagnóstico da tela já responde na maioria dos dias. Só números agregados
  saem, nenhum nome ou telefone de lead.
- **Amostra mínima de 5.** Abaixo disso o diagnóstico se cala e diz que se
  calou, na tela e na resposta da IA. Taxa em cima de 3 leads é ruído.

O parser de dinheiro tem teste próprio porque os valores são TEXT digitados à
mão: `US$ 2.500` tinha que dar 2500 e não 2,5.

## 6. Ícone da marca na aba ✅ FEITO

O CRM é um Worker só, sem pasta de arquivos estáticos, então o ícone sai do
código: os mesmos bytes do favicon do site, em base64 (`src/marca.js`), servidos
em `/favicon.png` e `/apple-touch-icon.png`. Fica antes do portão de sessão,
porque a tela de login e o formulário do cliente também mostram o leão.

---

## O que ficou de fora, e por quê

- **Vídeo acima de 95 MB.** O corpo de requisição do Worker para em 100 MB no
  plano grátis. O formulário avisa e pede um trecho. Resolver de verdade exige
  upload direto para o R2 com URL assinada, que precisa de credencial S3 como
  secret. Vale se ele reclamar.
- **Largura e altura dos arquivos.** As colunas existem na tabela e ficam em
  branco: nada na tela usa ainda.
- **O grupo de arquivos não trava a conclusão.** Decisão registrada acima,
  fácil de inverter: é o campo `trava` em `portaoDeConclusao`.
- **A auditoria adversarial de 2026-09-06 parou no achado 7 de 32.** Continua
  valendo, e agora há superfície nova (upload público, rota de mídia pública,
  duas rotas que chamam a OpenAI). Vale uma segunda rodada antes de operar com
  volume.

---

# Câmbio e entradas (2026-09-08, mesmo dia, depois do pedido)

Pedido do usuário ao aprovar o resto: *"estou no brasil mas trabalho em dólar,
quero sim saber real e dólar baseado no que tem entrado na empresa de uma forma
completa e detalhada."*

O dashboard da primeira rodada mostrava uma linha por moeda e se recusava a
consolidar. Isso era conservador demais para a situação real: ele precisa dos
dois números juntos, não de dois relatórios separados.

## O que mudou de desenho

**Antes:** `clientes.valor_pago`, um campo só, e o dashboard somava por moeda
sem nunca cruzar.

**Agora:** tabela `entradas`, uma linha por dinheiro que caiu, com moeda, **a
data em que entrou** e **a cotação daquele dia**. O dashboard consolida nas duas
moedas e declara a conversão.

Três coisas obrigaram a tabela nova:

1. **Contrato MRR recebe todo mês.** O segundo e o terceiro pagamento não tinham
   onde ser registrados. "Quanto entrou na empresa" era impossível de responder
   para contrato recorrente.
2. **A cotação por entrada trava o passado.** Sem ela, o total em real mudaria
   sozinho a cada abertura da tela conforme o dólar mexesse. Faturamento que muda
   sozinho não é faturamento. Isso tem teste dedicado, com o cenário de o dólar
   de referência ir a 7,10 e voltar a 4,10: o real da entrada com cotação
   gravada não se move em nenhum dos casos.
3. **A data do dinheiro** é o que permite o mês a mês. `criado_em` não serve:
   lançar em setembro um pagamento de março colocaria março em setembro.

## Honestidade sobre a conversão

Entrada sem cotação registrada é convertida pela cotação de **referência** e fica
marcada como estimada. A tela mostra o percentual do total em real que depende
dessa estimativa, e passando de 20% dá um aviso grande dizendo onde resolver.

A cotação de referência tem um botão que busca a cotação de **mercado**
(AwesomeAPI, sem chave, falha em silêncio). A tela é explícita: é referência, e o
real que ele recebe de verdade sai da cotação do banco ou da Wise dele, que é
sempre um pouco pior. Não dá para o sistema saber a cotação real do banco dele,
então ele digita quando importa.

## Correções que vieram no caminho

- **`contratado` para MRR estava errado.** Somava a mensalidade crua, então um
  contrato de 1.200 por 6 meses entrava como 1.200 em vez de 7.200, e o "a
  receber" nascia subestimado. Agora é mensalidade x duração, e a mensalidade
  recorrente somada aparece em cartão próprio.
- **Custo agora tem moeda própria** (`custos_moeda`). Ferramenta é cobrada em
  dólar, contador e freela em real. Somar os dois num campo só dava um número
  que não existe.
- **`lucro por cliente` divide pelos que pagaram**, não pelos que fecharam. Um
  cliente que assinou e não pagou não pode puxar a média para baixo.

## Um erro que o teste pegou, e vale registrar

O `\n` dentro de `JS_DASH` chegou no navegador como quebra de linha de verdade e
partiu a string do `prompt()`. É exatamente a classe de bug que
`testes/html-interno.mjs` existe para pegar (barra invertida comida pela template
string), e pegou. Dentro de template string tem que ser `\\n`.

Também escrevi três expectativas de teste com aritmética errada e o código
estava certo: conferi as contas à mão, entrada por entrada, e a conta agora está
escrita em comentário ao lado da asserção, para o próximo leitor poder verificar
sem refazer.

---

# Estado do deploy (2026-09-08)

**No ar** em https://leon-group.leongroup.workers.dev, versão
`b5404efe-8246-4098-b2ea-c18e32062aba`. Migrações 10 e 11 aplicadas no D1 de
produção. Suíte em **295 asserções**, todas passando.

## ✅ O upload de arquivo está LIGADO (2026-09-09)

R2 habilitado pelo usuário no painel (a ativação pede cartão mesmo custando
zero), bucket `leon-group-midia` criado, binding religado no `wrangler.toml`.

A primeira tentativa havia falhado com **code 10042, "Please enable R2 through
the Cloudflare Dashboard"**: é ativação de conta, o token da CLI não resolve.
Fica registrado que **binding declarado sem bucket criado derruba o deploy
inteiro** (code 10085), não só o upload. Se o bucket for apagado algum dia,
comente as três linhas do binding e o sistema volta a rodar sem upload.

Testado de ponta a ponta, com arquivo real:

| O que | Resultado |
|---|---|
| Subir pelo card (agência) | grava no R2 e na tabela, devolve a URL |
| Servir em `/m/<chave>` | 200, bytes idênticos ao original, `immutable` de 1 ano |
| Rota de mídia sem cookie | 200, e tem que ser: o site do cliente vive em outro domínio |
| Apagar | objeto sai do R2 e a linha do banco vai junto, `/m/` passa a 404 |
| Apagar com o cliente errado | recusado, não alcança arquivo de outro cliente |
| HTML disfarçado de PNG | recusado pelo sniff dos primeiros bytes |
| Tipo não aceito | recusado com mensagem em português |
| Chave fora do padrão | 404, sem tocar no R2 |
| Teto por slot | respeitado (3 arquivos no slot de logo principal) |
| Subir pelo token do formulário | funciona sem sessão de admin |
| Token falso, ou sem contrato | recusado |

## O furo que só apareceu com o R2 ligado

Com o upload funcionando, o fluxo principal estava quebrado e ninguém veria até
o primeiro cliente real: **o site gerado sairia sem foto nenhuma**.

`/api/gerar` lia só a tabela `midias`, que guarda link colado. As fotos subidas
do celular vivem em `arquivos`. Cliente que usasse o seletor de arquivo (que
agora é o caminho normal) teria site sem uma única imagem.

Junto vinha um segundo problema: a URL de `/m/<chave>` é relativa. O site é
publicado no **Vercel**, em outro domínio, então um `/m/...` resolveria contra o
Vercel, onde a imagem não existe. Site no ar com tudo quebrado.

Os dois estão corrigidos, e a junção das duas fontes foi extraída para
`G.fotosDoCliente()` com **16 asserções** em `testes/fotos-do-site.js`: URL
sempre absoluta, subidas antes das coladas (a primeira foto vira a capa do
site), foto repetida entra uma vez, e `javascript:`, `ftp:` e texto que não é
URL caem fora.

A pasta de entrega (`.txt`) tinha o mesmo furo com a logo, e também foi
corrigida: procura a logo subida quando não há link colado, com URL absoluta,
porque o `.txt` é aberto fora do sistema.

## O que continua pendente

- **A auditoria adversarial parou no achado 7 de 32**, e agora há superfície nova
  e no ar: upload público, rota de mídia pública, três rotas que chamam API
  externa (OpenAI duas, AwesomeAPI uma). Vale uma segunda rodada antes de operar
  com volume.
- **Nada limpa o R2 quando o teto de storage chegar.** 10 GB no plano grátis dá
  para muitos clientes de foto, mas vídeo come rápido: 40 MB cada, 5 por
  cliente. Não há alerta de uso nem expurgo de cliente arquivado. Apagar o
  cliente apaga os arquivos dele (`apagarDoCliente`), mas arquivar não.
- **Vídeo acima de 95 MB** continua fora: o corpo de requisição do Worker para em
  100 MB no plano grátis. Resolver exige upload direto para o R2 com URL
  assinada, que precisa de credencial S3 como secret.
- **`wrangler` está na 3.114.17** e avisa em toda execução que a 4 saiu. Não
  mexi: trocar de major na hora de publicar não é hora de descobrir
  incompatibilidade.

---

# Funil e caixa (2026-09-09)

Pedido: *"melhora o funil deixa ele bonito, coloca de fato um funil, melhore a
parte de pagamento e controle como se fosse um aplicativo de gastos que registra
tudo. Se esforce e busque referência."*

## O funil

Era barra horizontal. Agora é funil: trapézios centrados com `clip-path`,
largura proporcional ao valor, **altura constante**.

A altura constante saiu da referência e é a decisão que importa: trapézio de
altura variável distorce a área, e o olho compara área, não largura, então
diferença pequena entre etapas passa a ser lida errada. Com altura fixa a área
fica linearmente proporcional à largura. Isso e a recusa de 3D, sombra e
gradiente vieram das duas fontes consultadas (Atlassian e Domo, ver o final
desta seção), e por sorte batem com a direção estética da marca.

Detalhes que resolvem problema real:

- A faixa **depois** de uma transição ruim é a única que muda de cor. Pintar
  tudo tira a ênfase de onde dói.
- Etapa em zero tem piso de 4% de largura, para aparecer como fio em vez de
  sumir e dar a impressão de que a etapa não existe.
- Etapa maior que a anterior (dado torto) trava na largura da anterior e sai
  aviso em texto. Desenhar funil invertido em silêncio esconderia erro de
  cadastro.

A geometria tem teste: as larguras do cenário têm que sair exatamente
100/80/60/12/6, centradas, com a base de cada faixa encostando no topo da
seguinte, e o caso do dado torto tem que travar sem alargar.

## O caixa

Aba nova no comercial, com os padrões de app de gasto: cartão de saldo no topo,
navegação por mês, "para onde foi" por categoria em barra, extrato agrupado por
dia com o saldo de cada dia, entrada e saída por cor e sinal, lançamento rápido
com a data já em hoje.

Tabela `saidas` nova (migração 12), com dez categorias tiradas da operação real.
Antes o sistema só sabia o que entrava: custo existia num campo por cliente, e
anúncio, Z-API, domínio, contador e mentoria não tinham onde ser registrados.

## Três coisas que só apareceram fazendo

**1. Eu tinha juntado duas perguntas num número só.** "Lucro" estava valendo
`entrou - tudo que saiu`, e `lucro_por_cliente` era esse número dividido pelos
clientes. Isso responde "sobrou dinheiro no caixa" e "cada cliente se paga" com
o mesmo valor, e as duas respostas são diferentes: um cliente pode ser
lucrativo e o caixa fechar negativo se o custo da operação for maior que a soma
dos clientes. Separei em **lucro nos clientes** (desconta só taxa e custo
direto) e **saldo do caixa** (desconta tudo), com aviso em texto quando os dois
divergem em sinal.

**2. A taxa estava sendo rateada por percentual médio.** A tela do caixa
calculava `taxa_total / entrou_total` e aplicava esse percentual ao real. Com
clientes de taxas diferentes, média de percentual não fecha com a soma exata:
dava **R$ 2,29** de diferença no saldo. Agora cada entrada carrega a própria
taxa, e o mês a mês também. É o tipo de erro que faz a conferência contra o
banco não bater e ninguém saber por quê.

**3. O extrato não fechava com os totais.** O custo do campo antigo
(`clientes.custos_valor`) entrava no total de saída do servidor mas não tinha
linha no extrato. Como a tela soma o extrato para dar o total do mês, as duas
telas do mesmo sistema mostrariam números diferentes. Agora ele entra como
linha sintética, marcada como registro antigo e sem id (não há o que editar: o
jeito de mexer é lançar a saída de verdade). Há teste que soma o extrato e
compara com o total, para entrada, saída e taxa.

## Erros meus no caminho, registrados para não repetir

- **Backtick dentro de template string.** Escrevi `` `function` `` num
  comentário dentro de `JS_CAIXA` e fechei a template. O `node --check` pegou.
- **Três expectativas de teste com aritmética errada**, de novo: usei os números
  de um cenário no outro. O código estava certo nas três. Conferi à mão, e a
  conta agora está escrita em comentário ao lado da asserção.
- **Handler de clique como arrow em const.** `const irMes = m => ...` no topo de
  um script clássico funciona no navegador (o onclick resolve pela cadeia de
  escopo) mas não vira propriedade de `window`, e o teste não consegue dirigir a
  tela pelo mesmo caminho do clique. Virou declaração de função.

## Referências consultadas

- Atlassian, *A Complete Guide to Funnel Charts*
- Domo, *Funnel Charts in Analytics: How to Visualize Conversion Drop-Offs*
- Ramotion, *Expense Tracker App UI/UX Design Concept*
- Muzli, *Designing a finance tracker app*

## Estado

No ar, versão `853ae295-016a-4cdb-825b-adbdc35ed41c`. Migração 12 aplicada em
produção. Suíte em **386 asserções**, todas passando.

O upload de arquivo continua desligado, esperando o R2 ser habilitado no painel
(ver a seção acima).
