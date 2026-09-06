# Site da Leon Group

No ar: **https://leon-group-site.pages.dev**

Site institucional da agência. Estático, sem framework e sem build — três arquivos
e uma pasta de imagens. Hospedado no Cloudflare Pages, como manda o `CLAUDE.md`
(CRMs e sites da agência no Cloudflare; site de cliente no Vercel).

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | Estrutura e todo o CSS |
| `conteudo.js` | **Todo o texto**, em português e inglês. É aqui que você edita |
| `site.js` | Comportamento: idioma, animações, formulário, WhatsApp |
| `teste.js` | 50 verificações automáticas (ver abaixo) |
| `assets/` | Logo, símbolo, favicon e imagem de compartilhamento |

## O que precisa ser configurado

Abra `conteudo.js`. As duas primeiras linhas úteis são:

```js
const WHATSAPP = "5561998629189";   // ⚠ PROVISÓRIO — trocar pelo americano
const CRM_ENDPOINT = "https://leon-group.leongroup.workers.dev/api/site-lead";
```

⚠ **O número atual é provisório** (brasileiro, DDD 61). Quando o número americano
existir, mude **só esta linha** e republique — nenhum outro arquivo referencia o
número, nem o HTML, nem o JS. Leva menos de um minuto.

Formato: código do país + DDD + número, só dígitos.
Brasil `5531999999999` · Estados Unidos `16175550123`

Deixar como `""` faz o botão avisar para usar o e-mail, em vez de abrir uma conversa
com número errado — útil se o número sair do ar antes de o novo entrar.

## Como o botão de WhatsApp funciona

1. A pessoa clica em qualquer CTA
2. Abre um formulário de 7 campos (nome, empresa, WhatsApp, serviço, cidade, papel, como consegue cliente hoje)
3. Uma prévia mostra **exatamente** a mensagem que vai ser enviada
4. Ao enviar, duas coisas acontecem ao mesmo tempo:
   - o contato vira lead em **Leads novos / Super Hot** no CRM
   - abre o WhatsApp com a mensagem já escrita

O lead entra no CRM **antes** de a conversa começar. Isso importa: a maior parte
de quem preenche formulário não chega a mandar a mensagem, e sem isso esse
contato se perderia inteiro.

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
depois o site que indicou (Instagram, Facebook, YouTube, Google…).

**Para saber de onde veio cada lead**, use links marcados na bio e nos anúncios:

```
https://leon-group-site.pages.dev/?fonte=Instagram
https://leon-group-site.pages.dev/?fonte=Anuncio-Meta-Flooring
```

## Idioma

- Na primeira visita aparece a escolha em tela cheia: **Português** ou **English**
- A sugestão inicial segue o idioma do navegador, mas quem decide é a pessoa
- A escolha fica gravada; nas próximas visitas o site já abre no idioma certo
- O switch PT/EN continua no topo, sempre visível

Para mudar qualquer texto, edite `conteudo.js` — os dois idiomas ficam lado a lado.

## Publicar uma alteração

```bash
npx wrangler pages deploy sistemas/site-agencia \
  --project-name=leon-group-site --branch=main --commit-dirty=true
```

## Testar antes de publicar

```bash
cd sistemas/site-agencia && npm install jsdom && node teste.js
```

50 verificações: erro de JS, escolha de idioma, troca PT↔EN completa, montagem de
todas as seções, validação do formulário, prévia da mensagem, detecção de origem,
número e codificação do link do WhatsApp, isca de robô e — importante —
**a regra de integridade**: o teste falha se o texto
do site passar a alegar contagem de clientes, ano de fundação, depoimento atribuído,
sede americana ou garantia de faturamento.

## Regra de conteúdo

O `CLAUDE.md` proíbe alegar cliente, depoimento, avaliação, localização, equipe ou
resultado que não exista. O texto foi escrito dentro dessa regra e assume em voz alta
que a agência é nova. Há uma seção inteira ("O que a gente não faz") e uma resposta
no FAQ dizendo que a operação é remota, em vez de fingir endereço americano.

Quando existir o primeiro caso real, com nome e número documentados, ele entra aqui.
Não antes — e o `teste.js` está lá justamente para impedir que entre antes.

## Domínio próprio

O site está em `leon-group-site.pages.dev`. Para apontar um domínio, registre no
Cloudflare e adicione em Pages → leon-group-site → Custom domains. Depois disso,
acrescente o domínio novo em `ORIGENS_SITE` no arquivo
`sistemas/cloudflare/src/index.js` — senão o CORS barra o formulário e o lead
para de chegar no CRM.
