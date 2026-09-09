# Site da Leon Group

No ar: **https://leon-group-site.pages.dev**

Site institucional da agência. Estático, sem framework e sem build: três arquivos
e uma pasta de imagens. Hospedado no Cloudflare Pages, como manda o `CLAUDE.md`
(CRMs e sites da agência no Cloudflare, site de cliente no Vercel).

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | Estrutura e todo o CSS |
| `conteudo.js` | **Todo o texto**, em português e inglês. É aqui que você edita |
| `site.js` | Comportamento: idioma, leão de fundo, formulário, WhatsApp, CRM |
| `teste.js` | 96 verificações automáticas (ver abaixo) |
| `assets/` | Logo, símbolo, favicon e imagem de compartilhamento |

## O que precisa ser configurado

Abra `conteudo.js`. As linhas de configuração ficam no topo:

```js
const WHATSAPP = "5561998629189";   // ⚠ PROVISÓRIO, trocar pelo americano
const CRM_ENDPOINT = "https://leon-group.leongroup.workers.dev/api/site-lead";
const PARCIAL_MS = 2500;            // espera antes de guardar formulário incompleto
```

⚠ **O número atual é provisório** (brasileiro, DDD 61). Quando o número americano
existir, mude **só esta linha** e republique. Nenhum outro arquivo referencia o
número, nem o HTML, nem o JS. Leva menos de um minuto.

Formato: código do país + DDD + número, só dígitos.
Brasil `5531999999999` · Estados Unidos `16175550123`

Deixar como `""` faz o botão avisar para usar o e-mail, em vez de abrir uma conversa
com número errado.

## Seções da página

1. **Hero** com headline, slogan em carimbo e três números honestos
2. **Faixa rolante** com os nichos e o slogan intercalado
3. **O problema** (quatro dores do contractor)
4. **História** da Leon Group, com o significado do Built to Lead
5. **Serviços**: sete cards, sendo tráfego pago o último, marcado como última etapa
6. **O time por trás**: as doze funções que trabalham na conta
7. **Como funciona**: seis etapas, tráfego pago fechando
8. **Faixa do slogan** em tela cheia
9. **Dúvidas** (FAQ com oito perguntas)
10. **Contato** com o formulário na própria página
11. **Rodapé**

## As doze funções

A seção "O time por trás" lista gestor de projeto, head comercial, especialista em
Google Meu Negócio, especialista em SEO, copywriter, designer, social media, editor
de vídeo, I.A. e automação, head de performance, gestor de tráfego pago e suporte
integral.

O texto fala em **funções executadas na conta**, nunca em número de funcionários,
e fecha com uma nota dizendo que a agência é enxuta e se apoia em processo,
ferramenta e automação. Isso não é enfeite: a regra de integridade do `CLAUDE.md`
proíbe inventar equipe, e o `teste.js` falha se o texto passar a afirmar headcount.

## Tráfego pago é a última etapa

Google Ads (search) e Meta Ads aparecem em dois lugares, sempre marcados como
última etapa: no sétimo card de serviço e no sexto passo do método. O argumento é o
mesmo dos dois lados: anúncio em cima de presença fraca e sem follow-up é o jeito
mais caro de não vender nada.

## Formulário: um só, em dois lugares

Existe **um único** `<form>` no site, e ele mora na seção de contato. Quando alguém
clica num CTA do topo, o `site.js` **move o mesmo nó** pra dentro do modal e devolve
depois. Mover preserva valores e eventos, então não há dois formulários com estados
diferentes. Se a seção de contato já estiver na tela, o CTA nem abre modal: rola até
ela e põe o cursor no WhatsApp.

Ordem dos campos: **WhatsApp primeiro**, destacado. Depois nome, empresa, serviço,
cidade, papel e como o cliente chega hoje.

## Quem desiste no meio também vira lead

O WhatsApp vem primeiro porque é o único dado que permite retomar contato com quem
abandona o formulário, que é a maioria.

- Dois segundos e meio depois de parar de digitar, com telefone válido (8 dígitos ou
  mais), o preenchimento parcial vai pro CRM
- Ao fechar a aba ou trocar de app, um `sendBeacon` manda o que houver
- O lead nasce em **Leads novos / Super Hot** com a observação
  `FORMULÁRIO INCOMPLETO no site: contato guardado pra retomar`
- Quando a pessoa termina, o **mesmo lead** é completado, não nasce um segundo:
  a costura é feita por um id de sessão (`sessao_site`, com índice único no banco)
- Campo vazio não apaga campo já preenchido antes

Está avisado na tela, embaixo do campo de WhatsApp, **antes** de a pessoa digitar:
"Se você parar no meio do formulário, a gente guarda o que já foi preenchido e chama
no WhatsApp. Nada de lista e nada de spam."

Teto anti-inundação: 8 leads parciais novos por IP a cada 15 minutos. Quem passa do
teto recebe `200 ok` e some, sem erro na tela.

## Como o botão de WhatsApp funciona

1. A pessoa preenche o formulário (na página ou no modal)
2. Uma prévia mostra **exatamente** a mensagem que vai ser enviada
3. Ao enviar, duas coisas acontecem ao mesmo tempo:
   - o contato vira lead completo em **Leads novos / Super Hot**
   - abre o WhatsApp com a mensagem já escrita

A mensagem sai assim:

```
Olá! Vim pelo site da Leon Group (encontrei em: Instagram).

Sou João Silva, da Silva Flooring LLC.
• Serviço: Flooring
• Onde atendo: Boston, MA
• Sou: Dono da empresa (contractor)
• Cliente hoje chega por: Só por indicação

Quero saber mais sobre o que a Leon Group pode fazer pela minha empresa.
```

O "encontrei em" é detectado sozinho: primeiro `?fonte=` ou `?utm_source=` na URL,
depois o site que indicou (Instagram, Facebook, YouTube, Google e outros).

**Para saber de onde veio cada lead**, use links marcados na bio e nos anúncios:

```
https://leon-group-site.pages.dev/?fonte=Instagram
https://leon-group-site.pages.dev/?fonte=Anuncio-Meta-Flooring
```

## O leão de fundo

O símbolo da marca fica numa camada fixa que muda de posição, tamanho, inclinação e
intensidade conforme a pessoa rola a página. Cada seção tem um ponto de parada
(`ANCORAS`, em `site.js`) e a posição é interpolada entre a seção atual e a próxima.
A transição longa no CSS faz ele flutuar em vez de saltar.

Fica em `z-index: 2`: acima do fundo das seções e **abaixo de todo conteúdo**
(`.env` está em `z-index: 3`). Por isso ele aparece forte no fundo sem nunca
atrapalhar a leitura. Nas seções escuras a opacidade sobe, nas claras desce.

Para mexer, edite a tabela `ANCORAS` em `site.js`: `x`/`y` em vw/vh, `s` escala,
`r` rotação, `o` opacidade.

## Idioma

- Na primeira visita aparece a escolha em tela cheia: **Português** ou **English**
- A sugestão inicial segue o idioma do navegador, mas quem decide é a pessoa
- A escolha fica gravada, nas próximas visitas o site já abre no idioma certo
- O switch PT/EN continua no topo, sempre visível

Para mudar qualquer texto, edite `conteudo.js`: os dois idiomas ficam lado a lado.

## Regras de escrita

**Nada de travessão** (o tracinho longo) em nenhum texto do site. Pedido permanente
do usuário: fica feio e denuncia texto de IA. Use vírgula, dois-pontos, ponto ou
parêntese. O `teste.js` falha se aparecer um, em qualquer dos dois idiomas.

## A página de Planos: `/planos`

**Não fica na home, e não está no Google.** Preço na vitrine vira objeção antes
da conversa: o contractor compara número sem contexto, não sabe que o
diagnóstico é gratuito nem que o plano de cima é para depois, e sai.

A página existe para ser **apresentada na call**, depois de o diagnóstico ter
sido mostrado. Aí o número tem contexto.

```
https://leon-group-site.pages.dev/planos          (português)
https://leon-group-site.pages.dev/planos?idi=en   (já em inglês)
```

O que a mantém discreta:

- `noindex, nofollow, noarchive` no `<head>`
- **nenhum link** para ela em lugar nenhum do site
- mesmo domínio do site, o que preserva a credibilidade na hora de mandar

O `teste.js` da home agora verifica a **ausência** dos planos lá, inclusive que
não sobrou nenhum preço em dólar na página. Se um dia a seção voltar para a
home sem querer, o teste falha.

O conteúdo **não está duplicado**: a página carrega o mesmo `conteudo.js` da
home e lê `T[idioma].planos`. Duas tabelas de preço divergem, e no dia em que
divergirem alguém fecha por um preço que não existe. Por isso não há nenhum
valor escrito no HTML de `/planos`, e o teste confere isso.

Três planos, e o **primeiro é o alvo**. Os outros dois ancoram.

A ancoragem funciona pelo **enquadramento**, não pelo preço: o selo dos planos
2 e 3 diz "Para depois", não "Recomendado". Eles não são melhores, são de outro
momento. Contractor que ainda não aparece no Google não precisa de gestão de
tráfego, precisa existir primeiro, e o subtítulo da seção diz isso na cara.

Isso é o inverso do padrão de tabela de preço, onde o plano do meio ou o de
cima leva o destaque. Aqui o plano 1 é a escolha óbvia por maturidade, e o
cliente não sente que está comprando a versão pobre.

| | Plano | Preço | Selo | Botão |
|---|---|---|---|---|
| 1 | Presença Local | US$ 2.500 fechado | Comece por aqui | laranja, cheio |
| 2 | Presença + Conteúdo | a partir de US$ 4.500 | Para depois | contorno |
| 3 | Aquisição | a partir de US$ 7.500 | Para depois | contorno |

**Os três são entregáveis de verdade.** Plano de vitrine que a agência não sabe
executar seria promessa falsa, e cai na regra de integridade.

⚠ **Não vender o plano Aquisição** antes de a agência ter rodado a primeira
campanha dela. Por isso o preço é "a partir de" e não fechado.

Conteúdo em `conteudo.js`, na chave `planos` de cada idioma. Cada plano é
`[nome, total, mensal, prazo, descrição, [itens], "alvo"|"depois"]`. O
renderizador está em `site.js`, e o selo, a cor do botão e o "a partir de" saem
todos do último campo.

O botão de cada plano abre o WhatsApp **já dizendo qual plano**. Se o link for
mandado em vez de apresentado na tela, o clique chega com contexto em vez de um
"oi" solto. O número sai do `conteudo.js`, não escrito na página.

O campo escondido `#f_plano` continua no formulário da home, para o dia em que
alguém vier de `/planos` para o formulário. **Ele não mexe em `#f_servico`**,
que é o ofício do contractor: escrever nome de plano num select de ofício
gravaria um valor que não existe entre as opções.

## Testes

```bash
node sistemas/site-agencia/teste.js          # a home, 102 verificações
node sistemas/site-agencia/teste-planos.js   # /planos, 43 verificações
```

## Publicar uma alteração

```bash
npx wrangler pages deploy sistemas/site-agencia \
  --project-name=leon-group-site --branch=main --commit-dirty=true
```

## Testar antes de publicar

```bash
cd sistemas/site-agencia && npm install jsdom && node teste.js
```

96 verificações: erro de JS, escolha de idioma, troca PT↔EN completa, montagem de
todas as seções, as doze funções, tráfego pago como última etapa, slogan nos oito
pontos da página, ausência de travessão nos dois idiomas, leão de fundo, ordem dos
campos do formulário, captura do preenchimento incompleto, empréstimo do formulário
pro modal, prévia da mensagem, detecção de origem, número e codificação do link do
WhatsApp, isca de robô e a **regra de integridade**: o teste falha se o texto do site
passar a alegar contagem de clientes, ano de fundação, depoimento atribuído, sede
americana, garantia de faturamento ou número de funcionários.

## Regra de conteúdo

O `CLAUDE.md` proíbe alegar cliente, depoimento, avaliação, localização, equipe ou
resultado que não exista. O texto foi escrito dentro dessa regra: assume em voz alta
que a agência é nova, diz no FAQ que a operação é remota em vez de fingir endereço
americano, e trata as doze funções como escopo de trabalho, não como headcount.

Quando existir o primeiro caso real, com nome e número documentados, ele entra aqui.
Não antes, e o `teste.js` está lá justamente para impedir que entre antes.

## Domínio próprio

O site está em `leon-group-site.pages.dev`. Para apontar um domínio, registre no
Cloudflare e adicione em Pages → leon-group-site → Custom domains. Depois disso,
acrescente o domínio novo em `ORIGENS_SITE` no arquivo
`sistemas/cloudflare/src/index.js`, senão o CORS barra o formulário e o lead para de
chegar no CRM.
