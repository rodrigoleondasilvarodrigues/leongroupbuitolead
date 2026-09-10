#!/usr/bin/env bash
# Gera a versão de impressão e o PDF de "Dez criativos no ar".
# A fonte é saidas/dez-criativos-no-ar.html, que é o mesmo arquivo publicado
# como artefato. O wrapper só acrescenta doctype, head e trava o tema claro,
# que é o que o artefato faz sozinho no navegador.
# Uso: ./saidas/gerar-pdf-criativos.sh
set -e
cd "$(dirname "$0")"

python3 - <<'PY'
import io
corpo = io.open("dez-criativos-no-ar.html", encoding="utf-8").read()
molde = """<!doctype html>
<html lang="pt-BR" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html{color-scheme:light}
  body{margin:0;font:14px system-ui,-apple-system,sans-serif;background:#fafaf9}
  img{max-width:100%}
  [hidden]{display:none!important}
</style>
__CORPO__
</body>
</html>
"""
io.open("dez-criativos-no-ar-impressao.html", "w", encoding="utf-8").write(molde.replace("__CORPO__", corpo))
print("impressao gerada")
PY

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
  --virtual-time-budget=20000 --no-pdf-header-footer \
  --print-to-pdf="$PWD/Leon-Group-Dez-Criativos-no-Ar.pdf" \
  "file://$PWD/dez-criativos-no-ar-impressao.html" 2>/dev/null

echo "PDF gerado: $PWD/Leon-Group-Dez-Criativos-no-Ar.pdf"
