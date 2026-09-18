#!/usr/bin/env bash
# Prepara a PRÉVIA LOCAL com um cliente de demonstração completo.
#
# O que este script faz, tudo em banco LOCAL (nada toca produção):
#   1. copia 12 fotos do kit da mentoria para demo-fotos/ (pasta ignorada pelo git)
#   2. cria o banco local com o schema e TODAS as migrações, inclusive a 16
#   3. semeia o cliente de demonstração, com fotos, pagamento, marcos e checklist
#
# Depois dele, você abre dois terminais:
#   Terminal 1:  cd sistemas/cloudflare/demo-fotos && python3 -m http.server 8899
#   Terminal 2:  cd sistemas/cloudflare && npm run dev
#
# E entra em http://127.0.0.1:8787 com a senha que está em .dev.vars
#
# Uso: ./preparar-demo-local.sh
set -e
cd "$(dirname "$0")"

ZIP="../../dados/kit-agencia-delafiori.zip"
FOTOS="Kit-Agencia-Delafiori/exemplos/site/img"

echo "── 1. fotos de demonstração ──"
if [ -d demo-fotos ] && [ "$(ls demo-fotos 2>/dev/null | wc -l)" -ge 12 ]; then
  echo "  já existem, pulando"
else
  mkdir -p demo-fotos
  if [ -f "$ZIP" ]; then
    rm -rf /tmp/demo-fotos-tmp && mkdir -p /tmp/demo-fotos-tmp
    unzip -q -o "$ZIP" "$FOTOS/*" -d /tmp/demo-fotos-tmp
    i=1
    for f in /tmp/demo-fotos-tmp/$FOTOS/*.jpg; do
      [ $i -gt 12 ] && break
      cp "$f" "demo-fotos/foto-$(printf %02d $i).jpg"
      i=$((i + 1))
    done
    rm -rf /tmp/demo-fotos-tmp
    echo "  $((i - 1)) fotos copiadas para demo-fotos/"
  else
    echo "  ⚠ zip do kit não encontrado em $ZIP"
    echo "    Coloque 12 fotos .jpg em demo-fotos/ com os nomes foto-01.jpg ... foto-12.jpg"
    exit 1
  fi
fi

echo "── 2. banco local: schema e migrações ──"
npx wrangler d1 execute leon-group --local --file=schema.sql >/dev/null
for m in $(ls migracao-*.sql | sort -V); do
  # migração já aplicada devolve "duplicate column", que aqui é esperado
  npx wrangler d1 execute leon-group --local --file="$m" >/dev/null 2>&1 || true
  echo "  ok $m"
done

echo "── 3. cliente de demonstração ──"
node semear-cliente-demo.mjs > /tmp/demo.sql
npx wrangler d1 execute leon-group --local --file=/tmp/demo.sql >/dev/null
echo "  Vieira Hardwood Floors criado, com 12 fotos"

echo
echo "Pronto. Agora, em DOIS terminais:"
echo "  1)  cd \"$(pwd)/demo-fotos\" && python3 -m http.server 8899"
echo "  2)  cd \"$(pwd)\" && npm run dev"
echo
echo "Depois abra http://127.0.0.1:8787 e entre com a senha do arquivo .dev.vars"
