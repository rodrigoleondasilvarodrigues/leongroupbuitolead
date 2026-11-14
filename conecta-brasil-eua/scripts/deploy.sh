#!/usr/bin/env bash
# Deploy completo e NÃO interativo do Conecta Brasil-EUA na Cloudflare (D1 + Worker + dados).
#
# Autenticação (ver DEPLOY.md, seção 1) — duas opções, nesta ordem:
#   1. export CLOUDFLARE_API_TOKEN=...   # token com Workers Scripts:Edit, D1:Edit, Account Settings:Read, User Details:Read, Memberships:Read
#   2. npx wrangler login                # login OAuth no navegador (usado automaticamente quando não há token)
# Opcionais:
#   export CLOUDFLARE_ACCOUNT_ID=...     # sem ele, usa a primeira conta listada no `wrangler whoami`
#   export ACCESS_AUD=...                # AUD Tag da aplicação do Cloudflare Access (depois de criá-la — ver DEPLOY.md §3)
#   export ACCESS_TEAM_DOMAIN=...        # <team>.cloudflareaccess.com
#
# Uso:
#   scripts/deploy.sh                      # usa out/import.sql se existir
#   scripts/deploy.sh <pasta-do-coletor>   # gera out/import.sql a partir da pasta (grupos* + leads_*) e importa
#   SKIP_IMPORT=1 scripts/deploy.sh        # só infraestrutura + código
#
# O que faz, em ordem (pode rodar de novo; cada passo é idempotente):
#   1. autenticação (para na hora se o wrangler não estiver logado)
#   2. testes + typecheck (aborta se falhar)
#   3. cria o banco D1 "conecta-db" se ainda não existir e grava o database_id no wrangler.toml
#   4. (se ACCESS_AUD/ACCESS_TEAM_DOMAIN definidos) grava as duas variáveis no [vars] do wrangler.toml
#   5. aplica as migrations no D1 remoto
#   6. publica o Worker (wrangler deploy)
#   7. importa os dados via scripts/reimport.sh (upsert: não duplica, não desfaz revalidações mais novas)
set -euo pipefail

cd "$(dirname "$0")/.."
DB_NAME="conecta-db"
DATA_DIR="${1:-${CONECTA_DATA_DIR:-}}"

log() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
log "1/7 Autenticação na Cloudflare"
. scripts/comum.sh

log "2/7 Testes e typecheck"
npm test --silent
npm run --silent typecheck

log "3/7 Banco D1 \"$DB_NAME\""
db_id() { "${W[@]}" d1 list --json </dev/null | "${H[@]}" db-id "$DB_NAME"; }
ID="$(db_id)"
if [ -z "$ID" ]; then
  # ${} obrigatorio: o bash 3.2 do macOS engole o reticencias dentro do nome da variavel
  echo "Criando ${DB_NAME}..."
  "${W[@]}" d1 create "$DB_NAME" </dev/null
  ID="$(db_id)"
fi
[ -n "$ID" ] || { echo "Não consegui obter o database_id de $DB_NAME." >&2; exit 1; }
echo "database_id = $ID"
# grava o id no wrangler.toml (só a linha database_id do bloco [[d1_databases]])
"${H[@]}" set-db-id "$ID"

log "4/7 Variáveis do Cloudflare Access"
if [ -n "${ACCESS_AUD:-}" ] && [ -n "${ACCESS_TEAM_DOMAIN:-}" ]; then
  "${H[@]}" set-access "$ACCESS_AUD" "$ACCESS_TEAM_DOMAIN"
  echo "ACCESS_AUD / ACCESS_TEAM_DOMAIN gravados em [vars]. O Worker passa a exigir o JWT do Access."
else
  echo "ACCESS_AUD/ACCESS_TEAM_DOMAIN não definidos: a verificação extra no Worker fica desligada."
  echo "(A proteção principal é a política do Cloudflare Access no painel — ver DEPLOY.md §3.)"
fi

log "5/7 Migrations no D1 remoto"
"${W[@]}" d1 migrations apply "$DB_NAME" --remote </dev/null

log "6/7 Deploy do Worker"
"${W[@]}" deploy </dev/null

log "7/7 Dados"
if [ -n "${SKIP_IMPORT:-}" ]; then
  echo "SKIP_IMPORT definido: pulando importação."
elif [ -n "$DATA_DIR" ]; then
  bash scripts/reimport.sh "$DATA_DIR"
elif [ -f out/import.sql ]; then
  bash scripts/reimport.sh --sql-pronto
else
  echo "Sem pasta de dados e sem out/import.sql — nada a importar."
  echo "Para importar depois: bash scripts/reimport.sh [pasta]  (padrão: dados-import/)"
fi

log "Pronto"
echo "Próximo passo OBRIGATÓRIO se ainda não fez: proteger o site com o Cloudflare Access (DEPLOY.md §3)."
echo "Até lá, a URL *.workers.dev fica pública."
