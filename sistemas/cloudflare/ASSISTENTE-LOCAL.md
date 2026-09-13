# Assistente Leon com Claude Code

Implementado em 12/09/2026 a pedido do Rodrigo: conversar, analisar os dados e
escrever textos, sem alterar registros e sem configurar chave de API.

O CRM usa o Claude Code já autenticado pela assinatura no Mac. É uma resposta
real do modelo, transmitida progressivamente. A assinatura, seus limites e uma
conexão com a internet continuam necessários. O serviço local precisa estar
aberto neste Mac; um Worker da Cloudflare não executa o Claude Code.

## Iniciar no Mac

Na pasta `sistemas/cloudflare`, abra `Abrir Assistente Leon.command` com dois
cliques. Alternativa no terminal:

```bash
cd "/Users/macbook/Leon Group - Buit To Lead /sistemas/cloudflare"
npm run assistente
```

Requisitos verificados: Node 24.12.0 e Claude Code 2.1.266, conectado com uma
assinatura Claude. O executável usado por padrão é `~/.local/bin/claude`.
Se a conta estiver desconectada, abra o Claude Code e entre nela.

No CRM, clique em **Assistente Leon**, depois **Conectar**. Confirme na janela
local. Se ela abrir em outro navegador, a aba original reconhece a confirmação
automaticamente; o link “Abrir janela de conexão” também funciona. Se solicitado
pelo navegador, permita o acesso à rede local para o CRM.

Mantenha o terminal do assistente aberto. Ctrl+C encerra o serviço. Depois de
reiniciá-lo ou após 12 horas, conecte o navegador novamente. Não é necessário
digitar token ou chave. Nenhuma inferência começa só por abrir o chat.

## Uso

- O histórico permite retomar conversas ou iniciar uma nova.
- “Usar card aberto” inclui detalhes do lead ou cliente selecionado.
- “Visão geral” usa funil, caixa, clientes e operação.
- Cada envio consulta novamente o CRM, incluindo cobertura e horário.
- Enter envia, Shift + Enter quebra a linha. É possível interromper e tentar
  novamente, preservando o mesmo identificador para evitar duplicação.
- Os atalhos abaixo da resposta abrem as telas consultadas. Os textos podem
  ser copiados para revisão. A IA não envia WhatsApp, publica ou altera dados.

## Arquitetura e limites

`src/admin-assistente.js` contém a interface, independente do painel de edição.
`POST /api/assistente/contexto` usa a sessão autenticada do CRM e executa apenas
consultas. `src/ai-contexto.js` seleciona os campos e reutiliza os cálculos de
funil e financeiro já usados no dashboard, inclusive o financeiro do cliente.

As listas incluem até 200 leads ativos e 100 clientes ativos mais recentes.
Totais seguem a base inteira e as regras atuais do CRM. Um registro selecionado
inclui até 25 eventos, 100 marcos, 200 itens de checklist e 50 entregáveis.
Textos longos têm limites explícitos. A IA recebe até 20 interações anteriores
(65 mil caracteres), embora o histórico completo permaneça no disco.

O serviço `src-local/assistente-servidor.mjs` escuta exclusivamente em
`127.0.0.1:8811`. O pareamento exige confirmação local, origem permitida,
nonce de uso único e credencial temporária. A confirmação entre janelas pode
usar um desafio cujo verificador permanece na aba original, sem segredo na URL.
Os limites são 12 gerações por origem em 10 minutos e duas simultâneas.

O transporte usa `claude -p` com `--safe-mode`, `--tools ""`,
`--strict-mcp-config` e `--no-session-persistence`. Executa fora do projeto,
sem ferramentas, MCP, hooks, arquivos do projeto ou sessão do editor. O modelo
recebe apenas instruções do assistente, histórico e contexto. Não usa a
integração OpenAI antiga para esse chat.

Histórico:
`~/Library/Application Support/Leon Group/assistente.sqlite`.
A pasta tem permissão 0700 e o arquivo 0600. O histórico não entra no Git,
não vai para D1 e não contém credenciais da conta Claude. Os campos dedicados
a telefone, e-mail, tokens, assinatura, HTML e identificadores de pagamento
são excluídos do contexto. Observações e textos comerciais selecionados são
enviados ao Claude como dados, assim como o que Rodrigo escreve na conversa.

Para testes, `LEON_ASSISTENTE_DIR` muda a pasta do histórico e
`LEON_CLAUDE_BIN` muda o caminho do executável. Não colocar credenciais em
arquivos do projeto.

## Validação e publicação

Os testes novos cobrem contexto autenticado e somente leitura, projeção de
campos, financeiro, persistência, idempotência, concorrência, UTF-8, pareamento,
cancelamento, falhas do CLI, HTML hostil e interface com streaming.
Eles usam transporte de teste e não consomem a assinatura.
Validação final: 791 asserções do CRM, zero falhas. A suíte do site também
passou. A segunda mensagem real no navegador manteve o contexto e produziu
o texto solicitado na mesma conversa.

```bash
./testes/rodar.sh
```

Também foi realizada uma chamada real pelo navegador da prévia local,
com dados de demonstração: o Claude identificou 16 leads e 5 clientes e
reconheceu explicitamente que não eram dados de produção.

**Esta entrega foi salva no Mac e versionada no GitHub, sem deploy na
Cloudflare.** A prévia `http://127.0.0.1:8810/` usa dados de demonstração fora
do repositório. Para disponibilizar o novo botão e o endpoint no CRM de
produção, o Claude Code deve revisar esta entrega, rodar as duas suítes e
executar `npx wrangler deploy` em `sistemas/cloudflare`. Não há migração D1
nova. Depois do deploy, o assistente local continua necessário neste Mac.

Referências do modo programático e dos argumentos:
[Claude Code programático](https://code.claude.com/docs/en/headless) e
[referência do CLI](https://code.claude.com/docs/en/cli-reference).
