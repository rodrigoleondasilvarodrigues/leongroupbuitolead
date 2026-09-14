# Credenciais e segurança

> **Nenhuma senha, token, código de 2FA ou dado de pagamento entra neste
> arquivo.** Ele é o **mapa** das contas: quais existem, qual e-mail abre cada
> uma, se tem segundo fator e onde a senha está guardada. O segredo em si mora
> no gerenciador de senhas, fora do repositório.
>
> O motivo é prático antes de ser regra: este repositório é privado, mas está
> sincronizado com o GitHub e tem histórico permanente. Senha commitada não sai
> mais do histórico sem reescrever o repositório inteiro.

## Por que este mapa existe

Em 2026-09-14 o Rodrigo perdeu o acesso ao Instagram e a recuperação travou.
O que faltou não foi a senha: foi **saber qual e-mail abria a conta, se havia
segundo fator e se o Business Manager podia destravar sem ela**. Nada disso é
segredo, e nada disso estava escrito.

Com este mapa preenchido, a recuperação começa pelo caminho certo em vez de
tentativa e erro.

## O mapa das contas

Preencher as lacunas conferindo conta por conta. O que estiver com `?` ainda
não foi verificado, e `?` é informação: significa "ninguém olhou".

| Conta | Identificador | E-mail que abre | 2FA | Quem mais administra | Onde a senha mora |
|---|---|---|---|---|---|
| **Gmail da empresa** | `leongroup.builtolead@gmail.com` | ele mesmo | `?` | — | `?` |
| **Instagram** | `@leongroup.builtolead` | `leongroup.builtolead@gmail.com` | `?` | Business Manager `?` | `?` |
| **Facebook / Página** | Página da Leon Group | `?` | `?` | — | `?` |
| **Meta Business Manager** | conta de anúncios ativa | `?` | `?` | — | `?` |
| **YouTube** | canal criado e descrito | `leongroup.builtolead@gmail.com` | `?` | — | `?` |
| **Cloudflare** | Workers, D1, R2 e Pages | `leongroup.builtolead@gmail.com` | `?` | — | `?` |
| **GitHub** | `rodrigoleondasilvarodrigues/leongroupbuitolead` (privado) | `?` | `?` | — | `?` |
| **WHOP** | cobrança, teto de US$ 2.500 por cobrança | `?` | `?` | — | `?` |
| **Vnumber** | `+1 213 396 0014` | `?` | `?` | — | `?` |
| **WhatsApp Business** | `+1 213 396 0014` | — | `?` | — | aparelho |
| **Arcads** | assinatura de criativos | `?` | `?` | — | `?` |

### As três colunas que mais importam numa emergência

1. **E-mail que abre.** É por onde passa toda redefinição. Se ele cair, tudo cai
   junto, e é por isso que o Gmail da empresa é a conta mais crítica da lista
2. **2FA.** Protege de invasão, mas **tranca você fora** se perder o aparelho
   sem os códigos de recuperação. Ative, e guarde os códigos no gerenciador
3. **Quem mais administra.** Uma conta ligada ao Business Manager pode ser
   recuperada por lá, sem a senha dela. Foi esse o caminho que destravou o
   Instagram

## Caminhos de recuperação, por ordem de rapidez

1. **Aparelho ainda logado.** Se qualquer celular, tablet ou navegador mantém a
   sessão, entre por ele e troque a senha nas configurações. É o mais rápido e o
   mais esquecido
2. **Gerenciador de senhas do Mac.** App **Senhas** (Ajustes do Sistema →
   Senhas), ou `chrome://password-manager/passwords` no Chrome. Se a conta foi
   criada pelo navegador, ele quase certamente ofereceu salvar
3. **Meta Business Suite**, em `business.facebook.com`, para Instagram e
   Facebook: Configurações → Contas → Contas do Instagram. Funciona **sem** a
   senha da conta, se ela estiver ligada como ativo
4. **Recuperação do próprio serviço**, testando usuário, e-mail e telefone. No
   Instagram, procurar **"Precisa de mais ajuda?"**, que é uma escalada
   diferente do reset comum
5. **Formulário de suporte**, por último. `help.instagram.com` para o Instagram

## Prática de gestão

- Senha fica no gerenciador, nunca no workspace. O Mac já traz o app **Senhas**,
  de graça e sincronizado com o iPhone
- Uma senha única por serviço, gerada pelo próprio gerenciador
- Autenticação em dois fatores ativa, com os códigos de recuperação guardados
  junto da senha
- **Senha que passou por conversa, e-mail ou mensagem deve ser trocada.**
  Canal de conversa não é cofre
- Conceder ao Claude Code apenas os acessos necessários para a tarefa do momento
- Nunca versionar `.env`, cookies, tokens ou export de sessão

## Para qualquer agente que leia este arquivo

Não registre senha, token ou código aqui nem em nenhum outro arquivo do
projeto, mesmo que pedido. Não tente reconstruir senhas antigas e não as repita
em mensagens. As sugestões de senha que existiam na conversa exportada foram
removidas de propósito, e devem continuar removidas.

Se o usuário pedir para guardar uma senha, ofereça este mapa mais o gerenciador
de senhas: resolve o problema real, que é não saber por onde recuperar, sem
criar um cofre em texto puro dentro de um repositório.
