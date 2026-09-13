#!/bin/zsh
cd -- "$(dirname -- "$0")" || exit 1
export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.local/bin:$PATH"
if ! command -v node >/dev/null; then
  print "Instale Node.js 24 ou superior para iniciar o Assistente Leon."
  read -k 1
  exit 1
fi
node src-local/assistente-servidor.mjs
if [[ $? -ne 0 ]]; then read -k 1; fi
