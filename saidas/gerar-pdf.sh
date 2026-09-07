#!/usr/bin/env bash
# Regera o PDF do playbook genérico a partir da versão de impressão.
# Uso: ./saidas/gerar-pdf.sh
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
  --virtual-time-budget=12000 --no-pdf-header-footer \
  --print-to-pdf="$PWD/Playbook-Do-Anuncio-a-Renovacao.pdf" \
  "file://$PWD/playbook-generico-impressao.html" 2>/dev/null
echo "PDF gerado: $PWD/Playbook-Do-Anuncio-a-Renovacao.pdf"
