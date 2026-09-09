/* ═══════════════════════ CAIXA ═══════════════════════
   O financeiro com cara de aplicativo de gastos, porque é exatamente isso que
   ele é: registra tudo que entra e tudo que sai, e diz quanto sobrou.

   O que veio de referência de app de gasto, e por quê:

   1. CARTÃO DE SALDO NO TOPO, com entrou e saiu ao lado. É a primeira
      pergunta ("sobrou dinheiro?") e ela não pode exigir rolagem.
   2. NAVEGAÇÃO POR MÊS. Gasto se lê por mês, não por período aberto: é o
      ciclo do cartão, do aluguel, do anúncio. Com "tudo" ao lado para a
      visão do período inteiro.
   3. PARA ONDE FOI, por categoria, em barra. Sem isso o extrato é uma lista
      de linhas e ninguém enxerga que 60% do caixa virou anúncio.
   4. EXTRATO AGRUPADO POR DIA, mais recente primeiro, com entrada e saída
      separadas por cor e sinal. É a forma como se confere contra o banco.
   5. LANÇAMENTO RÁPIDO, com a data já em hoje e a categoria lembrada.

   O que é específico desta operação e não vem de app nenhum: **tudo aparece
   em dólar e em real ao mesmo tempo**, e cada lançamento carrega a cotação do
   dia em que aquele dinheiro se moveu. Ele fatura em dólar e vive em real, e
   sem isso nenhum dos dois números serviria.                                */

export const CSS_CAIXA = `
/* ── cartão de saldo ── */
.cx-topo{background:var(--preto);color:var(--marfim);border-radius:12px;padding:20px 22px}
.cx-mes{display:flex;align-items:center;gap:7px;margin-bottom:18px;flex-wrap:wrap}
.cx-mes button{background:none;border:1px solid #333;color:#c9c4bb;border-radius:6px;
  padding:6px 12px;font:inherit;font-size:12px;cursor:pointer;font-weight:600}
.cx-mes button:hover{border-color:var(--laranja);color:var(--laranja)}
.cx-mes button.on{background:var(--marfim);color:var(--preto);border-color:var(--marfim)}
.cx-mes .nav{padding:6px 10px;font-size:14px;line-height:1}
.cx-mes .atual{font-size:14px;font-weight:700;letter-spacing:.01em;text-transform:capitalize;
  padding:0 6px;min-width:88px;text-align:center}
.cx-tri{display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:20px}
.cx-tri>div{min-width:0}
.cx-tri .r{font-size:10px;letter-spacing:.13em;text-transform:uppercase;color:#8a8580;
  font-weight:700;margin-bottom:5px}
.cx-tri .u{font-size:25px;font-weight:700;letter-spacing:-.025em;line-height:1.12;
  font-variant-numeric:tabular-nums;overflow-wrap:break-word}
.cx-tri .b{font-size:14px;font-weight:600;color:#8a8580;font-variant-numeric:tabular-nums;
  margin-top:2px}
.cx-tri .entrou .u{color:#6bbf8f}
.cx-tri .saiu .u{color:#f08a58}
.cx-tri .saldo{border-left:1px solid #2b2b2b;padding-left:20px}
.cx-tri .saldo .u{font-size:30px;color:#fff}
.cx-tri .saldo.neg .u{color:#f08a58}
.cx-tri .saldo .b{color:#c9c4bb}
.cx-tri small{display:block;font-size:11px;color:#6e6a63;margin-top:6px;line-height:1.4}
.cx-rod{border-top:1px solid #2b2b2b;margin-top:16px;padding-top:13px;font-size:11.5px;
  color:#8a8580;display:flex;flex-wrap:wrap;gap:4px 18px;line-height:1.5}
.cx-rod b{color:#c9c4bb}
/* ── para onde foi ── */
.cat-l{display:grid;grid-template-columns:minmax(120px,190px) 1fr 62px 108px;
  align-items:center;gap:12px;padding:8px 0;font-size:12.5px}
.cat-l .rot{font-weight:600;line-height:1.25}
.cat-l .bar{height:14px;background:var(--marfim);border-radius:3px;overflow:hidden}
.cat-l .bar i{display:block;height:100%;background:var(--laranja);min-width:2px;
  transition:width .5s ease-out}
.cat-l .pct{font:700 12px/1 ui-monospace,monospace;color:var(--cinza);text-align:right}
.cat-l .val{text-align:right;font-variant-numeric:tabular-nums}
.cat-l .val b{display:block;font-weight:700}
.cat-l .val span{font-size:11px;color:var(--cinza)}
.cat-cx{background:var(--branco);border:1px solid var(--areia);border-radius:10px;padding:14px 18px}
/* ── filtros ── */
.cx-filtros{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:20px 0 12px}
.chip{border:1px solid var(--areia);background:var(--branco);border-radius:99px;
  padding:6px 14px;font:inherit;font-size:12px;cursor:pointer;color:var(--cinza);font-weight:600}
.chip:hover{border-color:var(--laranja);color:var(--laranja-esc)}
.chip.on{background:var(--preto);border-color:var(--preto);color:#fff}
.chip.on.mais{background:var(--verde);border-color:var(--verde)}
.chip.on.menos{background:var(--laranja-esc);border-color:var(--laranja-esc)}
.chip em{font-style:normal;opacity:.65;margin-left:4px;font-weight:400}
/* ── extrato ── */
.ext{background:var(--branco);border:1px solid var(--areia);border-radius:10px;overflow:hidden}
.ext-dia{padding:8px 17px;background:var(--marfim);border-bottom:1px solid var(--areia);
  border-top:1px solid var(--areia);font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;
  font-weight:700;color:var(--cinza);display:flex;gap:10px}
.ext-dia:first-child{border-top:0}
.ext-dia em{font-style:normal;margin-left:auto;text-transform:none;letter-spacing:0;
  font-variant-numeric:tabular-nums;font-weight:600}
.ext-l{display:grid;grid-template-columns:26px 1fr auto auto;gap:11px;align-items:center;
  padding:11px 17px;border-bottom:1px solid #f4efe6;font-size:12.5px}
.ext-l:last-child{border-bottom:0}
.ext-l .sinal{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;
  justify-content:center;font:700 14px/1 inherit;flex:none}
.ext-l.mais .sinal{background:#e5f0e9;color:var(--verde)}
.ext-l.menos .sinal{background:#fbe9e2;color:var(--laranja-esc)}
.ext-l .oq b{display:block;font-size:13px;line-height:1.3}
.ext-l .oq span{color:var(--cinza);font-size:11.5px;line-height:1.4;display:block;margin-top:1px}
.ext-l .oq .tag{display:inline-block;font-size:9.5px;font-weight:800;letter-spacing:.07em;
  text-transform:uppercase;background:var(--areia);color:var(--cinza);padding:2px 6px;
  border-radius:3px;margin-right:5px;vertical-align:1px}
.ext-l .oq .tag.rec{background:var(--op-claro);color:var(--op)}
.ext-l .oq .tag.est{background:var(--laranja-pal);color:var(--laranja-esc)}
.ext-l .vl{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.ext-l .vl b{display:block;font-size:14px;font-weight:700}
.ext-l.mais .vl b{color:var(--verde)}
.ext-l.menos .vl b{color:var(--laranja-esc)}
.ext-l .vl span{font-size:11.5px;color:var(--cinza)}
.ext-l .bts{display:flex;gap:4px}
.ext-l .bts button{border:1px solid var(--areia);background:var(--marfim);border-radius:4px;
  padding:3px 8px;font:inherit;font-size:11px;cursor:pointer;color:var(--cinza)}
.ext-l .bts button:hover{border-color:var(--laranja);color:var(--laranja-esc)}
/* ── formulário de lançamento ── */
.sai-form{background:var(--branco);border:1px solid var(--areia);border-radius:10px;
  padding:16px 18px;margin-bottom:14px}
.sai-form .lin{display:flex;gap:9px;flex-wrap:wrap}
.sai-form .lin>div{flex:1;min-width:132px}
.sai-form h5{font-size:13px;margin-bottom:11px}
.sai-form .rec{display:flex;align-items:center;gap:7px;font-size:12.5px;margin:2px 0 11px}
.sai-form .rec input{width:auto;margin:0}
.cat-dica{font-size:11.5px;color:var(--cinza);line-height:1.45;margin:-4px 0 9px;min-height:17px}
@media (max-width:760px){
  .cx-tri{grid-template-columns:1fr 1fr;gap:16px}
  .cx-tri .saldo{grid-column:1/-1;border-left:0;border-top:1px solid #2b2b2b;
    padding-left:0;padding-top:14px}
  .cat-l{grid-template-columns:1fr 52px 96px;gap:8px}
  .cat-l .bar{display:none}
  .ext-l{grid-template-columns:24px 1fr auto;gap:8px}
  .ext-l .bts{grid-column:2/-1;justify-content:flex-end;margin-top:4px}
}
`;

export const JS_CAIXA = `
/* ═══════════ CAIXA ═══════════
   Usa o mesmo /api/dashboard do funil: os dois leem o mesmo financeiro, e
   buscar duas vezes daria dois números diferentes na mesma tela se uma das
   buscas estivesse velha. */
let caixaMes='tudo', caixaTipo='tudo', caixaCat='tudo', caixaEdit=null;

const MESES_PT=['janeiro','fevereiro','março','abril','maio','junho',
                'julho','agosto','setembro','outubro','novembro','dezembro'];
const mesRotuloLongo=m=>MESES_PT[Number(m.slice(5,7))-1]+' de '+m.slice(0,4);

async function carregarCaixa(forcar){
  if(!DASH||forcar||dashSujo) await carregarDash(true);
  if(!DASH) return;
  renderCaixa();
}

function renderCaixa(){
  const cx=document.getElementById('conteudo');
  const f=DASH&&DASH.financeiro;
  if(!f) return carregarCaixa(true);

  // o mês escolhido tem que existir nos dados; se sumiu, volta para "tudo"
  if(caixaMes!=='tudo'&&!f.por_mes.some(m=>m.mes===caixaMes)) caixaMes='tudo';

  const doMes=x=>caixaMes==='tudo'||String(x.data).slice(0,7)===caixaMes;
  const lanc=f.extrato.filter(doMes);
  const noMes=caixaMes==='tudo'?null:f.por_mes.find(m=>m.mes===caixaMes);

  /* ── totais do período escolhido ──
     Somados a partir dos próprios lançamentos, inclusive a taxa, que cada
     entrada carrega. Ratear a taxa total por um percentual médio (o jeito
     óbvio) não fecha quando os clientes têm taxas diferentes, e a conferência
     contra o banco passa a não bater por alguns centavos sem explicação. */
  const tot=(tipo)=>lanc.filter(x=>x.tipo===tipo).reduce((a,x)=>({
    usd:a.usd+x.usd, brl:a.brl+x.brl,
    txu:a.txu+(x.taxa_usd||0), txb:a.txb+(x.taxa_brl||0),
  }),{usd:0,brl:0,txu:0,txb:0});
  const e1=tot('entrada'), s1=tot('saida');
  const ent={usd:e1.usd,brl:e1.brl};
  const sai={usd:s1.usd,brl:s1.brl};
  const tx={usd:e1.txu,brl:e1.txb};
  const sal={usd:ent.usd-sai.usd-tx.usd,brl:ent.brl-sai.brl-tx.brl};

  let h='<div class="dash">';

  // ── navegação de mês + cartão de saldo ──
  const i=f.por_mes.findIndex(m=>m.mes===caixaMes);
  h+='<div class="cx-topo"><div class="cx-mes">'
    +'<button class="nav" onclick="mudarMes(-1)"'+(i<=0?' disabled style="opacity:.3"':'')+'>&#8592;</button>'
    +'<span class="atual">'+(caixaMes==='tudo'?'Tudo':esc(mesRotuloLongo(caixaMes)))+'</span>'
    +'<button class="nav" onclick="mudarMes(1)"'
      +(caixaMes==='tudo'||i>=f.por_mes.length-1?' disabled style="opacity:.3"':'')+'>&#8594;</button>'
    +'<button class="'+(caixaMes==='tudo'?'on':'')+'" onclick="irMes(\\'tudo\\')">Tudo</button>'
    +f.por_mes.slice().reverse().slice(0,6).map(m=>
      '<button class="'+(m.mes===caixaMes?'on':'')+'" onclick="irMes(\\''+m.mes+'\\')">'
      +esc(m.rotulo)+'</button>').join('')
    +'</div>';

  h+='<div class="cx-tri">'
    +'<div class="entrou"><div class="r">Entrou</div>'
      +'<div class="u">'+esc(dinDol(ent.usd))+'</div><div class="b">'+esc(dinReal(ent.brl))+'</div>'
      +'<small>'+lanc.filter(x=>x.tipo==='entrada').length+' recebimento(s)</small></div>'
    +'<div class="saiu"><div class="r">Saiu</div>'
      +'<div class="u">'+esc(dinDol(sai.usd+tx.usd))+'</div>'
      +'<div class="b">'+esc(dinReal(sai.brl+tx.brl))+'</div>'
      +'<small>'+lanc.filter(x=>x.tipo==='saida').length+' despesa(s)'
      +(tx.usd?' + '+esc(dinDol(tx.usd))+' de taxa':'')+'</small></div>'
    +'<div class="saldo'+(sal.usd<0?' neg':'')+'"><div class="r">'
      +(sal.usd<0?'Faltou no caixa':'Sobrou no caixa')+'</div>'
      +'<div class="u">'+esc(dinDol(sal.usd))+'</div>'
      +'<div class="b">'+esc(dinReal(sal.brl))+'</div>'
      +'<small>'+(ent.usd?Math.round(1000*sal.usd/ent.usd)/10+'% do que entrou'
        :'nada entrou neste período')+'</small></div>'
    +'</div>';

  h+='<div class="cx-rod">'
    +'<span>Cotação de referência: <b>R$ '+esc(f.cotacao.rotulo)+'</b></span>'
    +(f.custo_fixo_mensal.usd?'<span>Custo fixo mensal: <b>'+esc(f.custo_fixo_mensal.usd_rot)
      +'</b> / '+esc(f.custo_fixo_mensal.brl_rot)+'</span>':'')
    +'<span>Lucro nos clientes: <b>'+esc(f.lucro.usd_rot)+'</b>, custo da operação <b>'
      +esc(f.overhead.usd_rot)+'</b></span>'
    +'</div></div>';

  // ── para onde foi ──
  const cats=categoriasDoPeriodo(lanc);
  if(cats.length){
    h+='<h3>Para onde foi <em>'+(caixaMes==='tudo'?'período inteiro'
      :esc(mesRotuloLongo(caixaMes)))+'</em></h3><div class="cat-cx">'
      +cats.map(c=>'<div class="cat-l">'
        +'<span class="rot">'+esc(c.rotulo)+'</span>'
        +'<span class="bar"><i style="width:'+Math.max(2,c.fatia)+'%"></i></span>'
        +'<span class="pct">'+c.fatia.toFixed(0)+'%</span>'
        +'<span class="val"><b>'+esc(dinDol(c.usd))+'</b><span>'+esc(dinReal(c.brl))+'</span></span>'
        +'</div>').join('')+'</div>';
  }

  // ── filtros e lançamento ──
  h+='<div class="cx-filtros">'
    +'<button class="chip '+(caixaTipo==='tudo'?'on':'')+'" onclick="filtrarTipo(\\'tudo\\')">Tudo<em>'+lanc.length+'</em></button>'
    +'<button class="chip mais '+(caixaTipo==='entrada'?'on':'')+'" onclick="filtrarTipo(\\'entrada\\')">Entrou<em>'+lanc.filter(x=>x.tipo==='entrada').length+'</em></button>'
    +'<button class="chip menos '+(caixaTipo==='saida'?'on':'')+'" onclick="filtrarTipo(\\'saida\\')">Saiu<em>'+lanc.filter(x=>x.tipo==='saida').length+'</em></button>'
    +(caixaCat!=='tudo'?'<button class="chip on" onclick="filtrarCat(\\'tudo\\')">'
      +esc(rotCat(caixaCat))+' &times;</button>':'')
    +'<button class="acao" style="margin-left:auto" onclick="abrirLancarSaida()">+ Lançar despesa</button>'
    +'</div>';
  h+='<div id="sai_cx"></div>';

  // ── extrato ──
  const vis=lanc.filter(x=>(caixaTipo==='tudo'||x.tipo===caixaTipo)
    &&(caixaCat==='tudo'||x.categoria===caixaCat));
  h+='<h3>Extrato <em>'+vis.length+' lançamento(s), do mais recente</em></h3>';
  h+=vis.length?blocoExtrato(vis):'<div class="vazio"><b>Nenhum lançamento aqui</b>'
    +'Troque o mês ou o filtro. Para registrar uma despesa, use o botão acima; '
    +'recebimento é lançado no card do cliente, na seção Entradas.</div>';

  h+='</div>';
  cx.innerHTML=h;
  if(caixaEdit) abrirLancarSaida(caixaEdit);
}

const dinDol=v=>'US$ '+Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const dinReal=v=>'R$ '+Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const rotCat=k=>{const c=(DASH.financeiro.categorias||[]).find(x=>x[0]===k);
  return c?c[1]:(k==='recebimento'?'Recebimento':k)};

/* Categoria só das saídas, e só do período na tela. O agregado que vem do
   servidor é do período inteiro: usar ele com um mês escolhido mostraria a
   fatia errada. */
function categoriasDoPeriodo(lanc){
  const m=new Map();
  let total=0;
  for(const x of lanc){
    if(x.tipo!=='saida') continue;
    if(!m.has(x.categoria)) m.set(x.categoria,{usd:0,brl:0});
    const a=m.get(x.categoria); a.usd+=x.usd; a.brl+=x.brl; total+=x.usd;
  }
  return [...m.entries()].map(([k,a])=>({chave:k,rotulo:rotCat(k),...a,
    fatia:total?100*a.usd/total:0})).sort((a,b)=>b.usd-a.usd);
}

/* Extrato agrupado por dia, mais recente primeiro. O cabeçalho do dia traz o
   saldo daquele dia: é assim que se confere contra o extrato do banco. */
function blocoExtrato(lista){
  const dias=[];
  for(const x of lista){
    if(!dias.length||dias[dias.length-1].dia!==x.data) dias.push({dia:x.data,itens:[]});
    dias[dias.length-1].itens.push(x);
  }
  let h='<div class="ext">';
  for(const d of dias){
    const sal=d.itens.reduce((a,x)=>a+(x.tipo==='entrada'?x.usd:-x.usd),0);
    let rot=d.dia;
    try{ rot=new Date(d.dia+'T12:00:00').toLocaleDateString('pt-BR',
      {weekday:'long',day:'2-digit',month:'long'}); }catch(err){}
    h+='<div class="ext-dia"><span>'+esc(rot)+'</span><em>'
      +(sal>=0?'+':'')+esc(dinDol(sal))+'</em></div>';
    for(const x of d.itens){
      const menos=x.tipo==='saida';
      const tags=[
        x.recorrente?'<span class="tag rec">mensal</span>':'',
        x.cotacao_estimada?'<span class="tag est">cotação estimada</span>':'',
        x.implicita?'<span class="tag">registro antigo</span>':'',
      ].join('');
      const sub=[menos?esc(x.categoria_rot):null,
                 x.cliente?esc(x.cliente):null,
                 x.descricao?esc(x.descricao):null].filter(Boolean).join(' · ');
      h+='<div class="ext-l '+(menos?'menos':'mais')+'">'
        +'<span class="sinal">'+(menos?'&minus;':'+')+'</span>'
        +'<span class="oq"><b>'+(menos?esc(x.descricao||x.categoria_rot)
            :'Recebimento'+(x.cliente?' de '+esc(x.cliente):''))+'</b>'
          +'<span>'+tags+sub+'</span></span>'
        +'<span class="vl"><b>'+esc(x.usd_rot)+'</b><span>'+esc(x.brl_rot)+'</span></span>'
        +(menos&&x.id?'<span class="bts">'
          +'<button onclick="editarSaida('+x.id+')">editar</button>'
          +'<button onclick="apagarSaida('+x.id+')">apagar</button></span>'
          :'<span class="bts">'+(x.tipo==='entrada'&&x.cliente_id
            ?'<button onclick="irCliente('+x.cliente_id+')">abrir cliente</button>':'')+'</span>')
        +'</div>';
    }
  }
  return h+'</div>';
}

function mudarMes(passo){
  const ms=DASH.financeiro.por_mes;
  if(caixaMes==='tudo'){ if(passo<0&&ms.length) irMes(ms[ms.length-1].mes); return }
  const i=ms.findIndex(m=>m.mes===caixaMes)+passo;
  if(i>=0&&i<ms.length) irMes(ms[i].mes);
}
/* Declaração de função, e não arrow em const, de propósito. Handler de
   onclick resolve pela cadeia de escopo, então const até funciona no
   navegador, mas não vira propriedade de window e o teste não consegue
   dirigir a tela pelo mesmo caminho do clique de verdade. */
function irMes(m){ caixaMes=m; renderCaixa() }
function filtrarTipo(t){ caixaTipo=t; renderCaixa() }
function filtrarCat(c){ caixaCat=c; renderCaixa() }
function irCliente(id){ setor='operacional';aba='todos';pintar();abrirCliente(id) }

/* ── lançar despesa ──
   A data nasce em hoje e a cotação nasce sugerida pela de referência, porque
   o caso comum é lançar hoje o que foi pago hoje. Os dois são editáveis: o
   caso que importa acertar é o gasto em dólar no cartão, que fecha com a
   cotação do dia do fechamento e não com a de hoje. */
function abrirLancarSaida(edit){
  const f=DASH.financeiro;
  const cx=document.getElementById('sai_cx'); if(!cx) return;
  const e=edit||{};
  caixaEdit=edit||null;
  const hoje=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  cx.innerHTML='<div class="sai-form"><h5>'+(e.id?'Editar despesa':'Lançar despesa')+'</h5>'
    +'<div class="lin">'
      +'<div><label>Quanto</label><input id="sa_valor" inputmode="decimal" placeholder="1800" value="'
        +esc(e.valor!=null?String(e.valor).replace('.',','):'')+'"></div>'
      +'<div><label>Moeda</label><select id="sa_moeda">'
        +'<option value="BRL"'+(e.moeda!=='USD'?' selected':'')+'>Real (R$)</option>'
        +'<option value="USD"'+(e.moeda==='USD'?' selected':'')+'>Dólar (US$)</option>'
      +'</select></div>'
      +'<div><label>Data do pagamento</label><input type="date" id="sa_data" value="'
        +esc(e.data||hoje)+'"></div>'
      +'<div><label>Cotação do dia</label><input id="sa_cotacao" inputmode="decimal" placeholder="'
        +esc(f.cotacao.rotulo)+'" value="'+esc(e.cotacao?e.cotacao.toFixed(2).replace('.',','):'')+'"></div>'
    +'</div>'
    +'<div class="lin"><div><label>Categoria</label><select id="sa_cat" onchange="dicaCat()">'
      +(f.categorias||[]).map(c=>'<option value="'+c[0]+'"'
        +(e.categoria===c[0]?' selected':'')+'>'+esc(c[1])+'</option>').join('')
      +'</select></div>'
      +'<div style="flex:2"><label>O que foi</label><input id="sa_desc" placeholder="Meta Ads de fevereiro" value="'
        +esc(e.descricao)+'"></div></div>'
    +'<div class="cat-dica" id="sa_dica"></div>'
    +'<div class="lin"><div><label>É de algum cliente?</label><select id="sa_cli">'
      +'<option value="">Não, é custo da operação</option>'
      +(D.clientes||[]).map(c=>'<option value="'+c.id+'"'
        +(Number(e.cliente_id)===c.id?' selected':'')+'>'+esc(c.empresa)+'</option>').join('')
      +'</select></div></div>'
    +'<label class="rec"><input type="checkbox" id="sa_rec"'+(e.recorrente?' checked':'')+'>'
      +'Repete todo mês (entra no custo fixo)</label>'
    +'<input type="hidden" id="sa_id" value="'+(e.id||'')+'">'
    +'<button class="acao" onclick="salvarSaida()">'+(e.id?'Salvar':'Lançar')+'</button>'
    +'<button class="acao sec" style="margin-left:7px" onclick="fecharLancarSaida()">Cancelar</button>'
    +'<p style="font-size:11.5px;color:var(--cinza);margin-top:8px">'
    +'Gasto em dólar no cartão brasileiro fecha pela cotação do dia da compra. '
    +'Preenchendo a <b>cotação do dia</b>, o valor em real fica travado e não muda quando o dólar mexer.</p>'
    +'</div>';
  dicaCat();
  const el=document.getElementById('sa_valor');
  if(el&&el.scrollIntoView) el.scrollIntoView({behavior:'smooth',block:'center'});
}
function fecharLancarSaida(){ caixaEdit=null;
  const cx=document.getElementById('sai_cx'); if(cx) cx.innerHTML='' }
function dicaCat(){
  const s=document.getElementById('sa_cat'), d=document.getElementById('sa_dica');
  if(!s||!d) return;
  const c=(DASH.financeiro.categorias||[]).find(x=>x[0]===s.value);
  d.textContent=c?c[2]:'';
  // categoria que costuma ser mensal já sugere a marcação, sem decidir por ele
  const r=document.getElementById('sa_rec');
  if(r&&c&&c[3]&&!document.getElementById('sa_id').value) r.checked=true;
}

async function salvarSaida(){
  const g=id=>{const e=document.getElementById(id);return e?e.value.trim():''};
  if(!g('sa_valor')) return alert('Escreva quanto foi.');
  if(!g('sa_data')) return alert('Informe a data do pagamento.');
  const r=await post('/api/saida',{id:g('sa_id')||undefined,valor:g('sa_valor'),
    moeda:g('sa_moeda'),pago_em:g('sa_data'),cotacao:g('sa_cotacao'),
    categoria:g('sa_cat'),descricao:g('sa_desc'),cliente_id:g('sa_cli')||null,
    recorrente:document.getElementById('sa_rec').checked});
  if(r.erro) return alert(r.erro);
  caixaEdit=null; marcarDashSujo(); await carregarCaixa(true);
}
function editarSaida(id){
  const x=(DASH.financeiro.extrato||[]).find(y=>y.tipo==='saida'&&y.id===id);
  if(x) abrirLancarSaida(x);
}
async function apagarSaida(id){
  if(!confirm('Apagar esta despesa? Ela sai do caixa, do mês a mês e das categorias.')) return;
  const r=await post('/api/saida',{id:id,apagar:true});
  if(r.erro) return alert(r.erro);
  marcarDashSujo(); await carregarCaixa(true);
}
`;
