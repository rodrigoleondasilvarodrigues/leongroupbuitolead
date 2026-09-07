#!/usr/bin/env bash
# Publica a Leon Group na Cloudflare. Rode DEPOIS de `npx wrangler login`.
set -euo pipefail
# Nenhum deploy sem os testes: uma regex quebrada dentro de template string
# já derrubou o admin inteiro em produção, e node --check não pega isso.
./testes/rodar.sh

cd "$(dirname "$0")"
W="npx --yes wrangler@3"

azul() { printf "\033[1;34m%s\033[0m\n" "$1"; }
ok()   { printf "\033[1;32m✓ %s\033[0m\n" "$1"; }
erro() { printf "\033[1;31m✗ %s\033[0m\n" "$1"; exit 1; }

azul "1/6  Conferindo autenticação"
$W whoami 2>&1 | grep -qi "not authenticated" && erro "Rode 'npx wrangler login' primeiro."
ok "autenticado"

azul "2/6  Banco D1"
if grep -q "COLE_AQUI_O_ID_DO_D1" wrangler.toml; then
  saida=$($W d1 create leon-group 2>&1 || true)
  id=$(printf '%s' "$saida" | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1)
  if [ -z "$id" ]; then
    # banco já existia: pega o id da listagem
    id=$($W d1 list --json 2>/dev/null | node -e "
      let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{
        try{const j=JSON.parse(s);const b=j.find(x=>x.name==='leon-group');console.log(b?b.uuid||b.database_id:'')}catch{console.log('')}})" || true)
  fi
  [ -z "$id" ] && erro "Não consegui obter o database_id. Rode '$W d1 create leon-group' na mão e cole em wrangler.toml."
  sed -i '' "s/COLE_AQUI_O_ID_DO_D1/$id/" wrangler.toml
  ok "banco pronto ($id)"
else
  ok "database_id já configurado"
fi

azul "3/6  Criando as tabelas"
$W d1 execute leon-group --remote --file=schema.sql >/dev/null 2>&1 && ok "schema aplicado" || ok "schema já existia"

azul "4/6  Segredo da sessão"
segredo=$(node -e "console.log(crypto.randomUUID()+crypto.randomUUID())")
printf '%s' "$segredo" | $W secret put SESSAO_SEGREDO >/dev/null 2>&1
ok "SESSAO_SEGREDO gerado e salvo (não fica em nenhum arquivo)"

azul "5/6  Senha do admin"
if [ -n "${LEON_SENHA:-}" ]; then
  senha="$LEON_SENHA"
  echo "   usando a senha da variável LEON_SENHA"
else
  senha=$(node -e "
    const a='abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#\$%&*';
    console.log(Array.from(crypto.getRandomValues(new Uint32Array(20))).map(n=>a[n%a.length]).join(''))")
  echo ""
  printf "   \033[1;33mSENHA GERADA: %s\033[0m\n" "$senha"
  echo "   Guarde agora no seu gerenciador de senhas — ela não será mostrada de novo."
  echo ""
fi
printf '%s' "$senha" | $W secret put ADMIN_SENHA >/dev/null 2>&1
ok "senha salva como secret"

azul "6/6  Publicando"
$W deploy 2>&1 | tail -6
echo ""
ok "no ar"
echo ""
echo "Entre com a senha acima. Para ligar o WhatsApp e as reviews por IA depois:"
echo "  $W secret put OPENAI_API_KEY"
echo "  $W secret put ZAPI_INSTANCIA"
echo "  $W secret put ZAPI_TOKEN"
