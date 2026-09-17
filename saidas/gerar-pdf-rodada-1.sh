#!/usr/bin/env bash
# Gera a versão de impressão e o PDF do guia "Rodada 1 na Meta".
# A fonte é saidas/rodada-1-meta.html, que é o mesmo arquivo publicado como
# artefato em https://claude.ai/artifact/JktX46fPVLnRSEjaLcmD4y
# O wrapper só acrescenta doctype, head e trava o tema claro, que é o que o
# artefato faz sozinho no navegador.
#
# As regras de impressão (quebra de página por parte, barra fixa virando
# estática, contador e botão de limpar escondidos) já moram no @media print
# dentro do próprio HTML, então editar o guia é editar um arquivo só.
#
# Uso: ./saidas/gerar-pdf-rodada-1.sh
set -e
cd "$(dirname "$0")"

python3 - <<'PY'
import io
corpo = io.open("rodada-1-meta.html", encoding="utf-8").read()
molde = """<!doctype html>
<html lang="pt-BR" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html{color-scheme:light}
  body{margin:0;font:14px system-ui,-apple-system,sans-serif;background:#ffffff}
  img{max-width:100%}
  [hidden]{display:none!important}
</style>
__CORPO__
</body>
</html>
"""
io.open("rodada-1-meta-impressao.html", "w", encoding="utf-8").write(molde.replace("__CORPO__", corpo))
print("impressao gerada")
PY

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
  --virtual-time-budget=20000 --no-pdf-header-footer \
  --print-to-pdf="$PWD/Leon-Group-Rodada-1-na-Meta.pdf" \
  "file://$PWD/rodada-1-meta-impressao.html" 2>/dev/null

echo "PDF gerado: $PWD/Leon-Group-Rodada-1-na-Meta.pdf"
