# Trechos comuns ao scripts/deploy.sh e ao scripts/reimport.sh. Use com:  . scripts/comum.sh
# Define: log(), W (wrangler), H (helpers), d1_exec_file() e a autenticação da Cloudflare.
#
# Autenticação, nesta ordem:
#   1. CLOUDFLARE_API_TOKEN definido  -> usa o token
#   2. sem token                      -> usa o login OAuth do wrangler (`npx wrangler login`)
# CLOUDFLARE_ACCOUNT_ID é opcional: sem ele, usa a PRIMEIRA conta listada no `wrangler whoami`
# (e avisa, quando há mais de uma). Sem autenticação válida, o script PARA aqui.

export CI=true WRANGLER_SEND_METRICS=false   # sem prompts / sem telemetria
W=(npx --no-install wrangler)
H=(node scripts/deploy-helpers.mjs)
log() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }

[ -d node_modules ] || { log "Instalando dependências"; npm ci; }

# Executa um .sql no D1 remoto. Se o D1 recusar por tamanho/limite, divide em lotes e tenta de novo.
d1_exec_file() {
  local arq="$1" saida lotes total i=0
  if saida="$("${W[@]}" d1 execute "$DB_NAME" --remote --file="$arq" --yes </dev/null 2>&1)"; then
    printf '%s\n' "$saida" | tail -6
    return 0
  fi
  printf '%s\n' "$saida" >&2
  log "O D1 recusou $arq de uma vez. Dividindo em lotes e tentando de novo"
  rm -rf out/lotes
  lotes="$("${H[@]}" split-sql "$arq" out/lotes)"
  total="$(printf '%s\n' "$lotes" | wc -l | tr -d ' ')"
  while IFS= read -r l; do
    i=$((i + 1))
    echo "  lote $i/$total: $l"
    "${W[@]}" d1 execute "$DB_NAME" --remote --file="$l" --yes </dev/null >/dev/null
  done <<< "$lotes"
  echo "$total lote(s) executados."
}

if [ -z "${CF_AUTH_OK:-}" ]; then
  if [ -n "${CLOUDFLARE_API_TOKEN:-}" ]; then
    export CLOUDFLARE_API_TOKEN
    echo "Autenticação: CLOUDFLARE_API_TOKEN."
  else
    echo "Autenticação: login OAuth do wrangler (CLOUDFLARE_API_TOKEN não definido)."
  fi

  CF_WHOAMI="$("${W[@]}" whoami </dev/null 2>&1)" || true
  CF_CONTAS="$(printf '%s\n' "$CF_WHOAMI" | "${H[@]}" whoami-accounts || true)"
  if [ -z "$CF_CONTAS" ]; then
    printf '%s\n' "$CF_WHOAMI" >&2
    cat >&2 <<'MSG'

ERRO: o wrangler não está autenticado (ou o token expirou e não conseguiu renovar).
Nada foi publicado. Resolva de um dos dois jeitos e rode de novo:
  1) npx wrangler login                                          # abre o navegador e autoriza (OAuth)
  2) export CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=...   # token de API (ver DEPLOY.md, seção 1)
MSG
    exit 1
  fi

  CF_N_CONTAS="$(printf '%s\n' "$CF_CONTAS" | wc -l | tr -d ' ')"
  CF_CONTA="$(printf '%s\n' "$CF_CONTAS" | head -1)"
  if [ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
    export CLOUDFLARE_ACCOUNT_ID
    echo "Conta: $CLOUDFLARE_ACCOUNT_ID (CLOUDFLARE_ACCOUNT_ID definido no ambiente)."
  else
    export CLOUDFLARE_ACCOUNT_ID="${CF_CONTA%% *}"
    if [ "$CF_N_CONTAS" -gt 1 ]; then
      echo "O whoami listou $CF_N_CONTAS contas; usando a PRIMEIRA (defina CLOUDFLARE_ACCOUNT_ID para escolher outra):"
      printf '%s\n' "$CF_CONTAS" | sed 's/^/  - /'
    fi
    echo "Conta: ${CF_CONTA#* } ($CLOUDFLARE_ACCOUNT_ID)"
  fi
  export CF_AUTH_OK=1
fi
