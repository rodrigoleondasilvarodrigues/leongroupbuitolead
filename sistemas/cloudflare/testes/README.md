# Testes do CRM

## `rodar.sh` — regressão da interface do admin

Carrega a página real do admin num DOM de verdade (jsdom), simula os cliques e
confere 31 asserções: tema, selo, realce do switch de setor, sub-abas corretas
por setor, conteúdo certo, realce da sub-aba acompanhando o clique, ida e volta
20× sem vazar estado, e nenhum erro de JS.

```bash
LEON_SENHA='sua-senha-do-admin' ./testes/rodar.sh
```

Rodar sempre que mexer em `src/admin.js`. O bug que esse teste existe para
impedir: uma ação mudava o estado global mas só redesenhava parte da tela —
o clique em OPERACIONAL trocava o conteúdo e deixava cabeçalho, selo e abas
no setor antigo, então na tela parecia que nada tinha acontecido.

## Medir a velocidade do painel

```bash
for i in 1 2 3; do
  curl -s -b cookie.txt -o /dev/null \
    -w "%{time_total}s  %{size_download}B\n" \
    https://leon-group.leongroup.workers.dev/api/painel
done
```

Referência: ~0,4s. Se passar de 1s, provavelmente voltou um N+1 (consulta dentro
de laço) em `/api/painel` — foi o que fazia essa rota levar 3,5s.
