# Contexto completo da Leon Group para o Claude Code

Esta pasta transforma o trabalho realizado na conversa do Codex em memória utilizável pelo Claude Code. Ela reúne tanto o histórico quanto o estado consolidado da empresa.

## Como começar

Abra no VS Code o arquivo `ABRA-LEON-GROUP.code-workspace`, localizado na raiz deste pacote. Ele carregará toda esta pasta como o projeto da Leon Group.

O pacote não contém um `CLAUDE.md` pronto. O objetivo é que o próprio Claude Code faça a leitura, audite o projeto e gere esse arquivo com a estrutura que considerar adequada.

Comece anexando ou colando o conteúdo de `ENTREGUE-AO-CLAUDE-CODE.md`. Em seguida, peça para ele ler os demais documentos e inspecionar os arquivos antes de escrever o `CLAUDE.md`.

Mensagem curta de abertura:

> Leia integralmente `ENTREGUE-AO-CLAUDE-CODE.md`, siga a ordem de auditoria indicada, inspecione os documentos e ativos do pacote e então produza você mesmo o `CLAUDE.md` ideal para assumir a gestão da Leon Group.

## O que existe aqui

- `CONVERSA-COMPLETA.md`: 155 mensagens visíveis entre usuário e assistente, em ordem cronológica.
- `ESTADO-ATUAL.md`: o que foi decidido, criado, publicado e o que ainda não foi confirmado.
- `DECISOES-DE-MARCA.md`: identidade oficial, paleta, estilo, público e mensagens.
- `AULAS-E-HOTSEAT.md`: fontes estudadas e estrutura extraída das quatro aulas e do hotseat.
- `PENDENCIAS-E-PROXIMOS-PASSOS.md`: fila operacional consolidada.
- `CREDENCIAIS-E-SEGURANCA.md`: dados públicos e regras de proteção de credenciais.
- `INVENTARIO-DE-ARQUIVOS.md`: relação completa dos arquivos relevantes produzidos, incluindo explorações anteriores e materiais oficiais.
- `ARVORE-PRINCIPAL.txt`: lista simples dos caminhos para leitura automatizada.
- `FONTES/`: resumo do hotseat, transcrição com tempos e linha editorial dos 12 posts para clientes.

## Alcance da exportação

A conversa completa contém as mensagens visíveis e úteis do projeto. Foram excluídos raciocínio interno, instruções do sistema, chamadas técnicas, grandes blocos binários e credenciais. As solicitações sobre senhas continuam registradas como eventos históricos, mas as respostas que continham senhas foram removidas.

Os arquivos visuais completos permanecem em `outputs/LEON-GROUP/` e estão relacionados no inventário. O material bruto pesado do vídeo do hotseat e ambientes técnicos de dependências não fazem parte do pacote portátil, mas o resumo e a transcrição relevante estão incluídos.

## Fonte de verdade

Use esta precedência:

1. Pedido mais recente do usuário.
2. Decisões atuais confirmadas em `DECISOES-DE-MARCA.md` e `ESTADO-ATUAL.md`.
3. Materiais oficiais em `outputs/LEON-GROUP/`.
4. Histórico da conversa.
5. Depois da auditoria, o `CLAUDE.md` criado pelo próprio Claude Code passa a consolidar essas fontes sem substituir os arquivos históricos.

Isso evita restaurar nomes e direções descartados como Valdieri, Leone ou versões de logo sem o leão no O.
