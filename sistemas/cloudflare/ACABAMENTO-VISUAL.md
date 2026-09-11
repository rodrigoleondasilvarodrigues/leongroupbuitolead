# Acabamento visual do CRM

Implementado no Codex em 2026-09-11, após a aprovação da prévia pelo Rodrigo.
Pedido: manter a densidade de informação e o fluxo construído com o Claude,
com visual mais vivo, cores nos estados de conclusão e movimento nas interações.

## O que mudou

- Cabeçalho com o logo oficial, copiado sem recoloração do brand kit.
- Relógios, seletor de setor e abas em superfícies claras da marca, na mesma ordem.
- Cards, indicadores, formulários, painéis, dashboard e caixa com acabamento consistente.
- Clientes concluídos recebem destaque verde a partir de `entrega_completa`, calculado
  pelo sistema. Atrasados recebem borda de alerta. As pills não definem a conclusão.
- Checklist, marcos, etapas respondidas e arquivos concluídos aproveitam seus estados
  existentes para dar retorno visual. O portão de fechamento antecipado mantém a
  indicação laranja e a explicação que já existia.
- Movimento breve na abertura do painel e de detalhes, no clique e na marcação de
  tarefas. Sem animação contínua nos relógios ou nos valores financeiros. Respeita
  `prefers-reduced-motion`.
- Notas do funil, barras de categoria e coluna em real continuam acessíveis em tela
  pequena, com rolagem dentro das tabelas quando necessária.

## Onde editar

- `src/admin-visual.js`: acabamento geral e estados do operacional.
- `src/admin-visual-dados.js`: dashboard e caixa.
- `src/admin-logo.js`: PNG oficial incorporado para funcionar no mesmo Worker.
- `src/admin.js`: importa o acabamento no final do CSS, usa o logo no cabeçalho e
  acrescenta as classes visuais de cliente concluído ou atrasado.

Rotas, persistência, automações, contratos, cálculos, filtros, roteiro da ligação,
confirmação ao vivo, ordem das seções e geração dos 20 depoimentos foram preservados.
Os nomes dos campos e os manipuladores das ações continuam os mesmos.

## Validação

- `./testes/rodar.sh`: 655 asserções passaram, zero falhas.
- Suítes `teste*.js` do site: 240 asserções passaram, zero falhas.
- `node testes/relogio.js`: passou.
- Navegador: pipelines, troca de setor, seis filtros operacionais, dashboard, caixa,
  painel do cliente e checkbox do checklist. O estado verde aparece ao marcar; o
  campo de observações continua preenchido e o painel permanece na região da tarefa.
- Conferência em 1280 px e 390 px. Dashboard e caixa sem transbordamento da página;
  as cinco faixas do funil continuam com altura igual em cada largura.
- Sem erros JavaScript no navegador. `git diff --check` passou.

O script avulso histórico `testes/troca-de-setor.js` não integra a suíte oficial e
não executa diretamente: usa CommonJS dentro do pacote ESM e depende de arquivos
externos `admin.html` e `painel.json`. Não foi alterado nesta entrega. A troca de
setor foi conferida na interface atual e pelas verificações da suíte oficial.

## Publicação

O código foi preparado e testado localmente. **Deploy não realizado nesta entrega.**
Os dados de demonstração usados na inspeção ficaram em um servidor local temporário,
fora do repositório, sem conexão com a produção.

Para publicar o CRM a partir desta pasta, depois de conferir a versão desejada:

```bash
cd sistemas/cloudflare
npx wrangler deploy
```

O site público não precisa de deploy por causa desta alteração.
