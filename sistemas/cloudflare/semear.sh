#!/usr/bin/env bash
# Cria 8 registros fictícios para percorrer o workflow inteiro.
# Uso:  ./semear.sh <URL_BASE> <SENHA>
#
# IMPORTANTE: este script CAPTURA os ids devolvidos pela API em vez de assumir
# que começam em 1 — se o banco já tiver dados, nada é sobrescrito.
set -euo pipefail
U="${1:?informe a URL}"; S="${2:?informe a senha}"
CK=$(mktemp); trap 'rm -f "$CK"' EXIT
W="npx --yes wrangler@3"
REMOTO="${REMOTO:-}"

api(){ curl -s -b "$CK" --max-time 30 -X POST "$U$1" -H 'Content-Type: application/json' -d "$2"; }
get(){ curl -s -b "$CK" --max-time 30 "$U$1"; }
jq1(){ node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{console.log(JSON.parse(s)$1??'')}catch(e){console.log('')}})"; }
sql(){ $W d1 execute leon-group ${REMOTO:---local} --command "$1" >/dev/null 2>&1 || true; }

curl -s -c "$CK" -o /dev/null --max-time 30 -X POST "$U/api/login" \
  -H 'Content-Type: application/json' -d "{\"senha\":\"$S\"}"

# cria um lead e devolve o id real
novo_lead(){ api /api/lead "$1" | jq1 ".id"; }
# move para fechou e devolve o cliente_id real
fechar(){ api /api/mover "{\"id\":$1,\"coluna\":\"fechou\",\"pipeline\":\"agendamento\"}" | jq1 ".cliente_id"; }

echo "── COMERCIAL ──"

L1=$(novo_lead '{"nome":"Ricardo Almeida","telefone":"+15085551001","empresa":"Almeida Flooring","nicho":"Flooring","email":"ricardo@almeidafloor.com","faturamento_mensal":"US$ 22k"}')
echo "  1. Almeida Flooring (lead #$L1) — Super Hot, ninguém ligou ainda"

L2=$(novo_lead '{"nome":"Douglas Ferreira","telefone":"+15085551002","empresa":"DF Remodeling","nicho":"Remodeling","email":"douglas@dfremodel.com","faturamento_mensal":"US$ 35k"}')
api /api/ligacao "{\"id\":$L2,\"atendeu\":true,\"nota\":\"atendeu de primeira, estava na obra\"}" >/dev/null
api /api/qualificar "{\"id\":$L2,\"rapport\":\"Também é de Minas, torce pro Cruzeiro\",\"budget\":\"US\$ 30-40k/mês\",\"authority\":\"Dono, decide sozinho\",\"need\":\"Depende 100% de indicação\",\"timeline\":\"Quer começar já\",\"qualificado\":true}" >/dev/null
echo "  2. DF Remodeling (lead #$L2) — Responderam, BANT preenchido"

L3=$(novo_lead '{"nome":"Wesley Santos","telefone":"+15085551003","empresa":"Santos HVAC","nicho":"HVAC","email":"wesley@santoshvac.com","faturamento_mensal":"US$ 48k"}')
api /api/ligacao "{\"id\":$L3,\"atendeu\":true}" >/dev/null
api /api/qualificar "{\"id\":$L3,\"rapport\":\"Filho joga bola no mesmo time\",\"budget\":\"US\$ 45k+\",\"authority\":\"Dono\",\"need\":\"Quer sair de subcontractor\",\"timeline\":\"Esta semana\",\"qualificado\":true}" >/dev/null
api /api/contrato "{\"id\":$L3,\"tipo_contrato\":\"TCV\",\"valor_contrato\":\"US\$ 4.997\",\"duracao_meses\":3}" >/dev/null
AMANHA=$(node -e "const d=new Date();d.setDate(d.getDate()+1);d.setHours(19,0,0,0);console.log(d.toISOString())")
api /api/agendar "{\"id\":$L3,\"quando\":\"$AMANHA\"}" >/dev/null
echo "  3. Santos HVAC (lead #$L3) — Call Agendado amanhã 19h, confirmações rodando"

L4=$(novo_lead '{"nome":"Fábio Rocha","telefone":"+15085551004","empresa":"Rocha Painting","nicho":"Painting","email":"fabio@rochapaint.com","faturamento_mensal":"US$ 18k"}')
api /api/ligacao "{\"id\":$L4,\"atendeu\":true}" >/dev/null
api /api/qualificar "{\"id\":$L4,\"rapport\":\"Conversou sobre o filho no futebol\",\"budget\":\"US\$ 15-20k\",\"authority\":\"Dono\",\"need\":\"Quer previsibilidade\",\"timeline\":\"Mês que vem\",\"qualificado\":true}" >/dev/null
api /api/mover "{\"id\":$L4,\"coluna\":\"no_show\",\"pipeline\":\"agendamento\"}" >/dev/null
api /api/mover "{\"id\":$L4,\"coluna\":\"no_show_f1\",\"pipeline\":\"agendamento\"}" >/dev/null
echo "  4. Rocha Painting (lead #$L4) — No Show F1"

echo "── OPERACIONAL ──"

L5=$(novo_lead '{"nome":"Marcelo Souza","telefone":"+15085552001","empresa":"Souza Flooring LLC","nicho":"Flooring","email":"marcelo@souzafloor.com"}')
api /api/contrato "{\"id\":$L5,\"tipo_contrato\":\"TCV\",\"valor_contrato\":\"US\$ 4.997\",\"duracao_meses\":3}" >/dev/null
C5=$(fechar "$L5")
echo "  5. Souza Flooring (cliente #$C5) — fechou, aguardando contrato + pagamento"

L6=$(novo_lead '{"nome":"Alexandre Lima","telefone":"+15085552002","empresa":"Lima Cabinets","nicho":"Cabinets","email":"alex@limacabinets.com"}')
api /api/contrato "{\"id\":$L6,\"tipo_contrato\":\"MRR\",\"valor_contrato\":\"US\$ 900/mês\",\"duracao_meses\":6,\"renovacao_automatica\":true}" >/dev/null
C6=$(fechar "$L6")
api /api/liberar-formulario "{\"id\":$C6,\"contrato\":true}" >/dev/null
api /api/liberar-formulario "{\"id\":$C6,\"pagamento\":true}" >/dev/null
echo "  6. Lima Cabinets (cliente #$C6) — formulário liberado, sem resposta ainda"

L7=$(novo_lead '{"nome":"Bruno Cardoso","telefone":"+15085552003","empresa":"Cardoso Roofing","nicho":"Roofing","email":"bruno@cardosoroof.com"}')
api /api/contrato "{\"id\":$L7,\"tipo_contrato\":\"TCV\",\"valor_contrato\":\"US\$ 2.497\",\"duracao_meses\":3,\"servicos_extras\":\"gestão do Google Ads\",\"valor_extras\":\"US\$ 600\"}" >/dev/null
C7=$(fechar "$L7")
api /api/liberar-formulario "{\"id\":$C7,\"contrato\":true}" >/dev/null
api /api/liberar-formulario "{\"id\":$C7,\"pagamento\":true}" >/dev/null
T7=$(get "/api/cliente?id=$C7" | jq1 ".formulario_token")
F7=$(node -e "console.log(JSON.stringify(Array.from({length:12},(_,i)=>'https://picsum.photos/seed/roof'+i+'/900/600')))")
curl -s --max-time 30 -X POST "$U/api/formulario/$T7" -H 'Content-Type: application/json' -d "{
  \"nome_dono\":\"Bruno\",\"telefone\":\"+15085552003\",\"tempo_mercado\":\"11 anos\",
  \"cidade\":\"Framingham\",\"estado\":\"MA\",
  \"localizacoes\":\"Framingham, Natick, Ashland, Marlborough, Worcester\",
  \"servicos\":\"Roof Replacement, Roof Repair, Gutter Installation, Siding\",
  \"faz\":\"Troca e reparo de telhado residencial, do rip-off ao acabamento\",
  \"nao_faz\":\"Não faço obra comercial nem telhado metálico industrial\",
  \"diferencial\":\"Equipe própria, garantia de 10 anos na mão de obra, limpeza total no fim do dia\",
  \"observacoes\":\"Atende emergência de vazamento\",\"tem_logo\":false,\"cores\":\"azul escuro e cinza\",
  \"fotos\":$F7,\"videos\":[\"https://example.com/telhado.mp4\"]}" >/dev/null
api /api/gerar "{\"id\":$C7,\"qtd_reviews\":20}" >/dev/null
sql "UPDATE clientes SET entrega_iniciada_em=datetime('now','-3 days') WHERE id=$C7"
sql "UPDATE marcos SET concluido=1, concluido_em=datetime('now') WHERE cliente_id=$C7 AND prazo_dias<=2"
echo "  7. Cardoso Roofing (cliente #$C7) — em entrega, site e 20 reviews gerados"

L8=$(novo_lead '{"nome":"Everton Dias","telefone":"+15085552004","empresa":"Dias Tile & Stone","nicho":"Flooring","email":"everton@diastile.com"}')
api /api/contrato "{\"id\":$L8,\"tipo_contrato\":\"MRR\",\"valor_contrato\":\"US\$ 1.200/mês\",\"duracao_meses\":3,\"renovacao_automatica\":false}" >/dev/null
C8=$(fechar "$L8")
api /api/liberar-formulario "{\"id\":$C8,\"contrato\":true}" >/dev/null
api /api/liberar-formulario "{\"id\":$C8,\"pagamento\":true}" >/dev/null
T8=$(get "/api/cliente?id=$C8" | jq1 ".formulario_token")
F8=$(node -e "console.log(JSON.stringify(Array.from({length:12},(_,i)=>'https://picsum.photos/seed/tile'+i+'/900/600')))")
curl -s --max-time 30 -X POST "$U/api/formulario/$T8" -H 'Content-Type: application/json' -d "{
  \"nome_dono\":\"Everton\",\"telefone\":\"+15085552004\",\"tempo_mercado\":\"7 anos\",
  \"cidade\":\"Marlborough\",\"estado\":\"MA\",
  \"localizacoes\":\"Marlborough, Hudson, Southborough, Westborough\",
  \"servicos\":\"Tile Installation, Natural Stone, Backsplash, Shower Tile\",
  \"faz\":\"Assentamento de porcelanato e pedra natural em cozinha e banheiro\",
  \"nao_faz\":\"Não faço piso de madeira nem área externa grande\",
  \"diferencial\":\"Acabamento de rejunte impecável, 7 anos sem uma reclamação\",
  \"observacoes\":\"Prefere trabalho em Marlborough e arredores\",\"tem_logo\":true,
  \"logo_url\":\"https://picsum.photos/seed/logotile/400/400\",
  \"fotos\":$F8,\"videos\":[]}" >/dev/null
api /api/gerar "{\"id\":$C8,\"qtd_reviews\":20}" >/dev/null
api /api/vercel-url "{\"id\":$C8,\"url\":\"https://dias-tile-stone.vercel.app\"}" >/dev/null
api /api/resultado "{\"id\":$C8,\"leads\":23}" >/dev/null
sql "UPDATE clientes SET entrega_iniciada_em=datetime('now','-70 days'), renovacao_em=datetime('now','+12 days') WHERE id=$C8"
sql "UPDATE marcos SET concluido=1, concluido_em=datetime('now','-60 days') WHERE cliente_id=$C8"
sql "UPDATE reviews SET postada=1, postada_em=datetime('now') WHERE cliente_id=$C8 AND id % 2 = 0"
sql "UPDATE entregaveis SET status='aprovado' WHERE cliente_id=$C8"
echo "  8. Dias Tile & Stone (cliente #$C8) — concluída, 23 leads, renova em 12 dias"

echo ""
echo "Pronto: leads #$L1 #$L2 #$L3 #$L4 no comercial · clientes #$C5 #$C6 #$C7 #$C8 no operacional"
