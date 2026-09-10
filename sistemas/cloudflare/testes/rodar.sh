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
echo "── telas novas: dashboard, portão, logo, peças ──"
node testes/telas-novas.mjs
echo
echo "── fusos horários ──"
node testes/fusos.js
echo
echo "── contratado x recebido ──"
node testes/valor-recebido.js
echo
echo "── o contrato e a prova do aceite ──"
node testes/contrato.js
echo
echo "── 20 depoimentos para validação e isolamento do site ──"
node testes/avaliacao-honesta.js
echo
echo "── ativações com playbook ──"
node testes/ativacoes.mjs
echo
echo "── as fotos que vão para o site ──"
node testes/fotos-do-site.js
echo
echo "── funil, dinheiro e diagnóstico ──"
node testes/funil-e-financeiro.js
