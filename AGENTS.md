# AGENTS.md

Contexto para agentes de código que não sejam o Claude Code. O Claude Code lê o
`CLAUDE.md`; o Codex e a maioria dos outros leem este arquivo. Os dois descrevem
o mesmo projeto, então mantenha-os coerentes se mudar um.

## Leia primeiro

1. **`RETOMAR-AQUI.md`** na raiz. Diz em que ponto a última sessão parou, o que
   está no ar, o que espera decisão do dono e duas armadilhas técnicas que já
   morderam mais de uma vez.
2. `CLAUDE.md`, para as regras do projeto (tom, idioma, estrutura de pastas).
3. `_memoria/empresa.md`, `_memoria/preferencias.md`, `_memoria/estrategia.md`.

## O que é isto

Leon Group, agência de geração de leads para brasileiros donos de empresas de
construção e home services nos Estados Unidos, com foco em Massachusetts. Opera
um CRM próprio, um site público e três páginas de proposta.

O dono é o Rodrigo. Conversa em **português**. Peças voltadas ao mercado
americano saem em inglês.

## Onde roda o código

| O quê | Onde | Stack |
|---|---|---|
| CRM comercial e operacional | `sistemas/cloudflare/` | Cloudflare Workers + D1 + R2 |
| Site público e propostas | `sistemas/site-agencia/` | Cloudflare Pages, HTML estático |
| Versões antigas em Python | `sistemas/crm-comercial/`, `sistemas/02-entrega/` | **Histórico. Não desenvolver nelas** |

## Comandos

Num clone novo, `npm install` primeiro nas duas pastas, senão os testes morrem
com "Cannot find module 'jsdom'" e parecem quebrados quando é só dependência
faltando.

```bash
cd sistemas/cloudflare   && npm install && ./testes/rodar.sh                    # 574 asserções
cd sistemas/site-agencia && npm install && for f in teste*.js; do node $f; done # 240 asserções
```

Rodar as duas suítes antes de qualquer deploy. Deploy exige credenciais
Cloudflare que **não estão no repositório**, então um agente em nuvem consegue
escrever e testar o código, mas não consegue publicar. Deixe o deploy para o
Rodrigo rodar na máquina dele:

```bash
cd sistemas/cloudflare && npx wrangler deploy
npx wrangler pages deploy sistemas/site-agencia --project-name=leon-group-site --branch=main
```

## Duas armadilhas deste código

**Backtick dentro de template literal.** `admin.js`, `admin-dash.js`,
`admin-caixa.js`, `admin-partes.js`, `admin-ativacoes.js` e `paginas.js`
exportam HTML dentro de template string. Um backtick ou um `\n` sem escape ali
**quebra o JavaScript no navegador sem quebrar o `node --check`**. O teste
`testes/html-interno.mjs` existe para pegar exatamente isso.

**`const` no topo de script clássico não vira `window.algo`.** O handler de
`onclick` funciona, mas o teste em jsdom não alcança. Use `function nome()` para
o que precisa ser testado.

## Regras de escrita

- **Sem travessão** (o tracinho longo) separando frase, em qualquer texto,
  incluindo as respostas do agente. Use vírgula, dois pontos, ponto ou
  parênteses. Hífen de palavra composta continua normal.
- Nunca gravar senha, token, chave de API ou dado de pagamento em arquivo do
  projeto. Hoje o repositório está limpo disso, e deve continuar.

## Fluxo de trabalho entre ferramentas

O repositório é a única fonte de verdade compartilhada. Antes de trocar de
ferramenta, commite e dê push. Ao voltar, dê `git pull` antes de editar
qualquer coisa. Trabalhar nas duas ao mesmo tempo na mesma pasta gera conflito.
