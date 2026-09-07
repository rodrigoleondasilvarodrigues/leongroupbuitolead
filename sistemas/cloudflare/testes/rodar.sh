#!/usr/bin/env bash
# Roda tudo. Use ANTES de todo deploy.
set -e
cd "$(dirname "$0")/.."
echo "── sintaxe dos módulos ──"
for f in src/*.js; do node --check "$f" && echo "  ok $f"; done
echo
echo "── JS embutido no HTML (o que node --check NÃO vê) ──"
node testes/html-interno.mjs
echo
echo "── admin num navegador simulado ──"
node testes/admin.mjs
echo
echo "── fusos horários ──"
node testes/fusos.js
