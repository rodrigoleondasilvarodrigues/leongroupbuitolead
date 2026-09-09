# Testes do CRM

## `rodar.sh`: regressão da interface do admin

Carrega a página real do admin num DOM de verdade (jsdom), simula os cliques e
confere 31 asserções: tema, selo, realce do switch de setor, sub-abas corretas
por setor, conteúdo certo, realce da sub-aba acompanhando o clique, ida e volta
20× sem vazar estado, e nenhum erro de JS.

```bash
LEON_SENHA='sua-senha-do-admin' ./testes/rodar.sh
```

Rodar sempre que mexer em `src/admin.js`. O bug que esse teste existe para
impedir: uma ação mudava o estado global mas só redesenhava parte da tela.
O clique em OPERACIONAL trocava o conteúdo e deixava cabeçalho, selo e abas
no setor antigo, então na tela parecia que nada tinha acontecido.

## `telas-novas.mjs`: dashboard, portão de conclusão, logo e peças

Desenha de verdade, num DOM real, as telas que entraram em 2026-09-08, e
confere 170 asserções: o funil em 8 barras com a etapa ruim pintada de ruim, o
diagnóstico nomeando o gargalo, os 7 cartões de dinheiro, o estado vazio que
não inventa número, a saída da IA, o portão com os 4 grupos e o que trava cada
um, o briefing e o prompt da logo, os slots de upload com miniatura, o aviso de
R2 ausente e o card de entrega fechada antes do prazo.

O bug que este teste existe para impedir: código que **compila** e mesmo assim
estoura ao desenhar. `node --check` vê o HTML como uma string e não pega nada
disso, e o resultado na tela é branco, sem mensagem nenhuma.

Inclui a **geometria do funil**: as larguras das faixas são lidas do
`clip-path` e conferidas contra os valores das etapas, mais o caso do dado
torto (etapa maior que a anterior), que tem que travar sem alargar o funil.

O financeiro do cenário não é um objeto escrito à mão: sai da função **real**
(`financeiroTotal`), com os valores conferidos à mão e a aritmética escrita em
comentário ao lado de cada asserção. Mock escrito à mão apodrece em silêncio
quando o servidor muda de formato, e o teste passa a testar nada.

Ele dirige tudo pelos pontos de entrada de verdade (clicar na aba, trocar a
resposta do servidor, chamar `carregar()`), nunca mexendo nas variáveis do
script por fora. Motivo técnico: `let` no topo de um `<script>` clássico não
vira propriedade de `window`, então `w.DASH = ...` criaria uma variável nova
que o script não vê, e o teste passaria testando nada.

## `funil-e-financeiro.js`: as contas do dashboard

108 asserções sobre `src/funil.js`, sem navegador. O que ele impede:

- **O total em real mudar sozinho quando o dólar mexe.** É o teste central do
  desenho de câmbio: o cenário move a cotação de referência de 5,40 para 7,10,
  depois para 4,10, e o valor em real da entrada que tem cotação gravada tem que
  ficar parado nos três casos. Faturamento que muda sozinho não é faturamento.
- **Somar a mensalidade crua de um MRR como se fosse o contrato inteiro**, o que
  subestimava a carteira e o "a receber".
- **Dividir o lucro pelos clientes que fecharam** em vez dos que pagaram.
- **Perder o histórico antigo:** cliente com valor recebido de antes do controle
  de entradas tem que continuar contando, marcado como registro antigo.
- **Responder "cada cliente se paga" e "sobrou dinheiro" com o mesmo número.**
  Tem cenário de cliente lucrativo com caixa negativo, que é o caso que um
  número só esconderia.
- **O extrato não fechar com os totais.** Soma as linhas do extrato e compara
  com o total do servidor, para entrada, saída e taxa. Foi assim que apareceu
  que o custo do campo antigo entrava no total e não no extrato.
- **Ratear a taxa por percentual médio**, que com clientes de taxas diferentes
  dava R$ 2,29 de diferença no saldo.

- **`US$ 2.500` somar como 2,5.** Os valores são TEXT digitados à mão, e
  adivinhar errado o separador decimal troca a ordem de grandeza do
  faturamento. Cobre os padrões brasileiro e americano.
- **Somar US$ com R$ no mesmo total**, que daria um número que não existe.
- **Contar como recebido dinheiro que não entrou**, e dividir o lucro pelos
  contratos em vez de pelos que pagaram.
- **Diagnosticar gargalo em cima de 3 leads.** Abaixo de 5 numa etapa o
  diagnóstico tem que ficar nulo, não zero.
- **Apontar o gargalo errado.** Ele é a etapa que perde mais gente em número
  absoluto, não a de pior percentual: 20% de 100 dói mais que 5% de 4.

## Medir a velocidade do painel

```bash
for i in 1 2 3; do
  curl -s -b cookie.txt -o /dev/null \
    -w "%{time_total}s  %{size_download}B\n" \
    https://leon-group.leongroup.workers.dev/api/painel
done
```

Referência: ~0,4s. Se passar de 1s, provavelmente voltou um N+1 (consulta dentro
de laço) em `/api/painel`, que foi o que fazia essa rota levar 3,5s.

## `fotos-do-site.js`: as fotos que vão para o site

16 asserções. Existe porque, no dia em que o R2 foi ligado, o fluxo principal
estava quebrado e ninguém veria até o primeiro cliente real: o site sairia
**sem foto nenhuma** para todo cliente que subisse do celular, porque a geração
lia só a tabela de links colados.

O que ele tranca:

- **URL sempre absoluta.** O site é publicado no Vercel, em outro domínio: um
  `/m/...` relativo resolveria contra o Vercel e o site iria ao ar quebrado.
- **As duas fontes entram**, subida e colada, e nenhuma some quando a outra
  está vazia.
- **Subidas primeiro.** A primeira foto vira a capa do site, e a subida do
  celular é a que o cliente escolheu a dedo.
- **Lixo não entra:** `javascript:`, `ftp:`, texto que não é URL, vazio, nulo,
  e foto repetida.
