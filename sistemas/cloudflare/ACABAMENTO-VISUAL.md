# Interface visual e movimento do CRM

Concluído no Codex em 2026-09-12. Rodrigo considerou o primeiro acabamento
sutil demais e pediu uma evolução visível, mantendo a identidade da Leon Group,
a densidade de informação e o fluxo construído com o Claude.

## O que mudou nesta revisão

- Abas em uma superfície contínua, com marcador que desliza até a seleção.
  Setores, filtros e pipelines continuam na mesma ordem.
- Entrada de tela em sequência, com deslocamento e transparência nos indicadores,
  colunas e cards. A atualização automática de dados não repete essa animação.
- Indicadores maiores, ícones discretos e contraste entre captação e fechamento.
  Cards de leads com iniciais, empresa, nicho, permanência e resposta ao passar o mouse.
- Cards operacionais com progresso dos marcos, todas as informações anteriores,
  destaque de atraso e estado verde baseado no campo real `entrega_completa`.
  A barra dos marcos não decide se a entrega está concluída.
- Funil e diagnóstico lado a lado em telas largas, dinheiro em seguida. No celular,
  seguem em sequência. Larguras proporcionais, alturas iguais por etapa, percentuais
  e cálculos financeiros não foram alterados.
- Painel com abertura animada, foco no botão de fechar ao abrir outro registro,
  Escape para fechar e proteção contra resposta atrasada de um registro anterior.
- Checklist e marcos ganham destaque e aviso de conclusão apenas depois de a API
  confirmar. Durante o salvamento, o checkbox fica desabilitado. Em erro, volta ao
  estado anterior. Rascunhos, nós do formulário e rolagem são preservados.
- Preferência de movimento reduzido respeitada, inclusive quando muda com o CRM aberto.
  Não há animação contínua nos dados nem contagem fictícia de dinheiro.
- Cabeçalho, relógios e indicadores compactados em tela estreita. Ambos os fusos,
  a janela de contato e os valores continuam disponíveis.

A logo é o PNG oficial do brand kit, sem recoloração. Não foi criada outra marca.

## Correções necessárias para o retorno visual ser verdadeiro

`/api/checklist` invertia os parâmetros `id` e `cid`. Com valores diferentes,
a API podia não gravar ou atualizar o par inverso em outro cliente, retornando sucesso.
A ordem foi corrigida. Checklist e marcos agora retornam 404 quando nenhuma linha
é encontrada. O teste usa SQLite em memória, o Worker real e uma sessão assinada,
com um segundo registro de IDs invertidos para garantir o isolamento.

A contagem dos marcos passou a considerar o estado confirmado. Uma segunda tarefa
pendente ou com erro não pode liberar visualmente a trava.

Dashboard e Caixa compartilham uma busca pendente. A resposta ou o erro de uma aba
anterior não substitui a tela escolhida depois.

Estas correções estão no código local e no GitHub após o commit desta revisão.
**Não foram aplicadas ao banco de produção nem publicadas no Worker.**

## Onde editar

- `src/admin-visual.js`: estilos gerais, cards, painel, conclusão e responsividade.
- `src/admin-visual-dados.js`: dashboard e caixa, sobre os componentes existentes.
- `src/admin-interface.js`: ícones, movimento, marcador de navegação, foco e
  confirmação assíncrona dos itens.
- `src/admin.js`: integração das classes e funções visuais no HTML real.
- `src/admin-dash.js` e `src/admin-caixa.js`: composição do dashboard e busca compartilhada.
- `src/admin-logo.js`: logo oficial incorporada no Worker.
- `src/index.js`: correção dos identificadores do checklist e confirmação de atualização.

Automações, contratos, filtros, cálculo de prazos, roteiro da ligação, seis
confirmações ao vivo, ordem das seções do painel e geração dos 20 depoimentos
mantêm suas regras. Não há migração de banco, biblioteca de animação ou rota nova.

## Validação

- `./testes/rodar.sh`: 690 asserções, zero falhas, incluindo as 35 novas verificações
  de persistência, respostas atrasadas, falha de rede, movimento e contagens.
- Suítes `teste*.js` do site: 240 asserções, zero falhas.
- A nova suíte usa `node:sqlite`; validada no Node 24.12.0 desta máquina.
- Navegador: dashboard, caixa, pipelines, seis filtros operacionais, painel por teclado,
  checklist salvo com aviso verde, rascunho preservado e rolagem mantida.
- Conferência em 1280 px e 390 px, sem transbordamento da página. As cinco faixas
  do funil continuam com altura igual; tabelas densas rolam dentro dos cartões.
- Sintaxe do JavaScript embutido no HTML e `git diff --check` conferidos.

O script histórico `testes/troca-de-setor.js` continua fora da suíte oficial:
usa CommonJS em pacote ESM e depende de arquivos externos `admin.html` e
`painel.json`. Não foi alterado. A navegação atual é coberta pela suíte e pelo navegador.

## Prévia e publicação

A prévia local usa dados de demonstração num servidor temporário fora do repositório,
sem conexão com a produção. O endereço utilizado é http://127.0.0.1:8810/.
As alterações da prévia não gravam no CRM em produção.

**Deploy não realizado.** Para publicar a versão conferida a partir desta pasta:

```bash
cd sistemas/cloudflare
npx wrangler deploy
```

O site público não precisa de deploy por causa desta alteração.
