#!/usr/bin/env bash
# Reimporta os CSVs do coletor no D1 REMOTO num comando só. Upsert idempotente: pode rodar quantas vezes quiser,
# não duplica, não desfaz revalidações mais novas e não apaga campo já preenchido.
#
# Uso:
#   bash scripts/reimport.sh                 # pasta padrão: dados-import/
#   bash scripts/reimport.sh <pasta>         # outra pasta do coletor
#   bash scripts/reimport.sh --sql-pronto    # não gera nada: executa o out/import.sql que já existe
#
# Autenticação: CLOUDFLARE_API_TOKEN se estiver definido; senão, o login OAuth do wrangler (ver scripts/comum.sh).
# Passos: valida os CSVs (relatório por arquivo/linha) -> gera out/import.sql -> executa no D1 remoto
# (dividindo em lotes se o arquivo for grande demais) -> imprime as contagens do banco.
set -euo pipefail

cd "$(dirname "$0")/.."
DB_NAME="conecta-db"
SQL="out/import.sql"

log() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
. scripts/comum.sh

if [ "${1:-}" = "--sql-pronto" ]; then
  [ -f "$SQL" ] || { echo "ERRO: $SQL não existe. Rode sem --sql-pronto para gerar a partir dos CSVs." >&2; exit 1; }
  log "1/3 Usando o $SQL já existente (nada é gerado)"
else
  DATA_DIR="${1:-${CONECTA_DATA_DIR:-dados-import}}"
  [ -d "$DATA_DIR" ] || { echo "ERRO: a pasta \"$DATA_DIR\" não existe. Uso: bash scripts/reimport.sh [pasta]" >&2; exit 1; }
  log "1/3 Validando os CSVs de \"$DATA_DIR\" (nenhum arquivo de entrada é modificado)"
  npx --no-install tsx scripts/validate-csv.ts --dir "$DATA_DIR" || echo "(as linhas com erro listadas acima serão ignoradas na importação)"
  log "2/3 Gerando $SQL"
  npx --no-install tsx scripts/import-csvs.ts --dir "$DATA_DIR" --sql "$SQL"
fi

log "3/3 Executando no D1 remoto \"$DB_NAME\""
d1_exec_file "$SQL"

log "Contagens no D1 remoto"
"${W[@]}" d1 execute "$DB_NAME" --remote --yes --command \
  "SELECT (SELECT COUNT(*) FROM grupos) AS grupos, (SELECT COUNT(*) FROM grupos WHERE status='ativo') AS grupos_ativos, (SELECT COUNT(*) FROM empresas) AS empresas" </dev/null

# Confiança de que a empresa é brasileira (coluna da migration 0003; '' = CSV antigo, sem classificação).
# A contagem de prospeccao vai junto para provar que o reimport não zerou a tabela editada no site.
"${W[@]}" d1 execute "$DB_NAME" --remote --yes --command \
  "SELECT (SELECT COUNT(*) FROM empresas WHERE confianca_brasileira='alta') AS conf_alta, (SELECT COUNT(*) FROM empresas WHERE confianca_brasileira='media') AS conf_media, (SELECT COUNT(*) FROM empresas WHERE confianca_brasileira='baixa') AS conf_baixa, (SELECT COUNT(*) FROM empresas WHERE confianca_brasileira='') AS sem_classificacao, (SELECT COUNT(*) FROM prospeccao) AS prospeccao" </dev/null
