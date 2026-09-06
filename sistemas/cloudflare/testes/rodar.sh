#!/usr/bin/env bash
# Teste de regressão do admin: carrega a página real num DOM de verdade (jsdom),
# simula os cliques e confere que a moldura inteira acompanha — tema, selo,
# switch de setor, sub-abas e conteúdo.
#
# Uso:  LEON_SENHA='...' ./testes/rodar.sh
set -euo pipefail
URL="${LEON_URL:-https://leon-group.leongroup.workers.dev}"
: "${LEON_SENHA:?defina LEON_SENHA com a senha do admin}"

TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
cd "$TMP"

echo "→ login em $URL"
curl -sS -c cookie.txt -o /dev/null -X POST "$URL/api/login" \
  -H 'content-type: application/json' -d "{\"senha\":\"$LEON_SENHA\"}"

echo "→ baixando página e dados"
curl -sS -b cookie.txt "$URL/"           -o admin.html
curl -sS -b cookie.txt "$URL/api/painel" -o painel.json
grep -q '"leads"' painel.json || { echo "FALHOU: /api/painel não devolveu dados (senha errada?)"; exit 1; }

echo "→ instalando jsdom (temporário)"
npm install --silent jsdom >/dev/null 2>&1

cp "$OLDPWD/testes/troca-de-setor.js" .
echo
node troca-de-setor.js 2>&1 | grep -v "Error: Not implemented"
