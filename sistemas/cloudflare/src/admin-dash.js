/* ═══════════════════ DASHBOARD COMERCIAL ═══════════════════
   O funil inteiro numa tela, nas cores da marca, com o dinheiro embaixo e o
   diagnóstico do lado.

   Mora em arquivo separado porque `admin.js` é um HTML de mil linhas numa
   template string, e enfiar o dashboard lá dentro tornaria os dois
   impossíveis de mexer. As duas metades daqui (`CSS_DASH` e `JS_DASH`) são
   interpoladas no <style> e no <script> do admin.

   Cores: marfim de fundo, preto no texto, laranja SÓ na ênfase. Etapa em
   dificuldade fica em laranja escuro, etapa saudável em verde. Nada de
   gradiente e nada de 3D, que é a direção estética da marca.               */

export const CSS_DASH = `
/* ═══ FUNIL ═══
   Funil de verdade: trapézios centrados, largura proporcional ao valor, e
   ALTURA CONSTANTE por etapa.

   A altura constante não é escolha estética. Trapézio com altura variável
   distorce a área, e como o olho compara área e não largura, diferença pequena
   entre etapas passa a ser lida errada. Com altura fixa a área fica
   linearmente proporcional à largura, e a leitura volta a ser honesta.

   Nada de 3D, sombra ou gradiente: além de ser a direção estética da marca, é
   o que mais atrapalha a leitura de funil.

   Três colunas por linha: nome à esquerda, faixa no meio, números à direita.
   O texto fica FORA do trapézio de propósito, porque em etapa estreita ele não
   caberia dentro e teria que encolher ou vazar.                              */
.funil{background:var(--branco);border:1px solid var(--areia);border-radius:11px;
  padding:22px 18px 18px}
.fx-l{display:grid;grid-template-columns:minmax(96px,150px) minmax(120px,1fr) 118px;
  align-items:center;gap:0 14px}
.fx-rot{text-align:right;font-size:12.5px;font-weight:600;line-height:1.25}
.fx-rot small{display:block;font-weight:400;color:var(--cinza);font-size:10.5px;margin-top:1px}
.fx-faixa{position:relative;height:44px}
.fx-faixa i{position:absolute;inset:0;background:var(--preto);display:block;
  transition:clip-path .55s ease-out}
.fx-faixa.dor i{background:var(--laranja-esc)}
.fx-faixa.fim i{background:var(--verde)}
.fx-faixa.vazia i{background:var(--areia)}
.fx-n{font-size:21px;font-weight:700;letter-spacing:-.025em;font-variant-numeric:tabular-nums;
  line-height:1.1}
.fx-n small{display:block;font-size:10.5px;font-weight:600;color:var(--cinza);letter-spacing:.03em}
/* a linha fina entre duas etapas: é onde a conversão e a perda aparecem */
.fx-p{display:grid;grid-template-columns:minmax(96px,150px) minmax(120px,1fr) 118px;
  gap:0 14px;align-items:center;height:34px}
.fx-p .meio{display:flex;align-items:center;gap:8px;justify-content:center;
  font-size:11px;color:var(--cinza);white-space:nowrap;overflow:hidden}
.fx-p .tag{font:800 10px/1 inherit;letter-spacing:.06em;padding:3px 8px;border-radius:3px;flex:none}
.fx-p .tag.bom{background:#e5f0e9;color:var(--verde)}
.fx-p .tag.limite{background:var(--laranja-pal);color:var(--laranja-esc)}
.fx-p .tag.ruim{background:var(--laranja-esc);color:#fff}
.fx-p .tag.sem{background:var(--areia);color:var(--cinza)}
.fx-p .perda{color:var(--laranja-esc);font-weight:600}
.fx-p .seta{color:#c9bda9;flex:none}
/* as saídas laterais do funil: onde ele vaza, e como fecha */
.fx-fuga{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:9px;
  margin-top:16px;padding-top:16px;border-top:1px solid var(--areia)}
.fg{border:1px solid var(--areia);border-radius:8px;padding:11px 14px;background:var(--marfim)}
.fg b{display:block;font-size:18px;font-weight:700;letter-spacing:-.02em}
.fg span{font-size:10.5px;color:var(--cinza);text-transform:uppercase;letter-spacing:.05em;
  font-weight:700}
.fg small{display:block;font-size:11px;color:var(--cinza);margin-top:4px;line-height:1.4}
.fg.fechou b{color:var(--verde)}
.fg.perdeu b{color:var(--laranja-esc)}
.fx-anom{background:var(--laranja-pal);border-left:3px solid var(--laranja-esc);
  border-radius:0 5px 5px 0;padding:10px 13px;font-size:12px;margin-top:14px;line-height:1.5}
@media (max-width:640px){
  .fx-l,.fx-p{grid-template-columns:74px 1fr 76px;gap:0 8px}
  .fx-rot{font-size:11px}.fx-rot small{display:none}
  .fx-n{font-size:17px}.fx-faixa{height:36px}
  .fx-p .meio{font-size:10px}
}
/* ── dinheiro nas duas moedas ──
   A operação fatura em dólar e o fundador vive em real. Todo número aparece
   nos dois, sempre na mesma ordem: dólar em cima, real embaixo. Trocar a
   ordem entre cartões faria ele ler o número errado com pressa. */
.entrou-cx{background:var(--preto);color:var(--marfim);border-radius:11px;padding:22px 24px;
  display:grid;grid-template-columns:1fr 1fr;gap:22px}
.entrou-cx .lado{min-width:0}
.entrou-cx .r{font-size:10.5px;letter-spacing:.13em;text-transform:uppercase;color:#8a8580;
  font-weight:700;margin-bottom:5px}
.entrou-cx .v{font-size:31px;font-weight:700;letter-spacing:-.025em;line-height:1.1;
  font-variant-numeric:tabular-nums;overflow-wrap:break-word}
.entrou-cx .usd .v{color:#fff}
.entrou-cx .brl .v{color:var(--laranja)}
.entrou-cx .sub{font-size:11.5px;color:#8a8580;margin-top:6px;line-height:1.45}
.entrou-cx .sub b{color:#c9c4bb;font-weight:600}
.entrou-rod{grid-column:1/-1;border-top:1px solid #2b2b2b;padding-top:13px;font-size:11.5px;
  color:#8a8580;display:flex;flex-wrap:wrap;gap:5px 18px;align-items:center}
.entrou-rod b{color:#c9c4bb}
.cot-bt{background:none;border:1px solid #3a3a3a;color:#c9c4bb;border-radius:5px;
  padding:4px 10px;font:inherit;font-size:11px;cursor:pointer;margin-left:auto}
.cot-bt:hover{border-color:var(--laranja);color:var(--laranja)}
/* cartão de duas moedas */
.duo{display:grid;grid-template-columns:repeat(auto-fit,minmax(184px,1fr));gap:9px}
.d2{background:var(--branco);border:1px solid var(--areia);border-radius:8px;padding:13px 15px}
.d2 .r{font-size:10.5px;color:var(--cinza);text-transform:uppercase;letter-spacing:.05em;
  font-weight:700;margin-bottom:7px}
.d2 .u{font-size:19px;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums;
  line-height:1.15}
.d2 .b{font-size:14px;font-weight:600;color:var(--cinza);font-variant-numeric:tabular-nums;
  margin-top:1px}
.d2 small{display:block;font-size:11px;color:var(--cinza);margin-top:6px;line-height:1.4}
.d2.forte{border-color:var(--laranja);background:#fffaf6}
.d2.forte .u{color:var(--laranja-esc)}
.d2.forte .b{color:var(--laranja-esc);opacity:.75}
.d2.fraco .u{color:var(--cinza);font-weight:600;font-size:17px}
/* mês a mês */
.mes-t{background:var(--branco);border:1px solid var(--areia);border-radius:9px;overflow:hidden}
.mes-l{display:grid;grid-template-columns:64px 1fr 118px 108px;align-items:center;gap:11px;
  padding:9px 15px;border-bottom:1px solid #f4efe6;font-size:12.5px}
.mes-l:last-child{border-bottom:0}
.mes-l.cab{background:var(--marfim);font-size:10.5px;text-transform:uppercase;
  letter-spacing:.07em;color:var(--cinza);font-weight:700}
.mes-l b{font-variant-numeric:tabular-nums;text-align:right;display:block}
.mes-l .bar{height:16px;background:var(--marfim);border-radius:3px;overflow:hidden}
.mes-l .bar i{display:block;height:100%;background:var(--laranja);min-width:2px}
.mes-l .rot{font-weight:700;text-transform:capitalize}
.mes-l .brl{color:var(--cinza);font-weight:600}
/* cliente por cliente */
.cli-t{background:var(--branco);border:1px solid var(--areia);border-radius:9px;overflow:hidden}
.cli-l{padding:11px 15px;border-bottom:1px solid #f4efe6;font-size:12.5px}
.cli-l:last-child{border-bottom:0}
.cli-l .top{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap}
.cli-l .top b{font-size:13.5px}
.cli-l .top .tipo{font-size:9.5px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;
  background:var(--areia);color:var(--cinza);padding:2px 6px;border-radius:3px}
.cli-l .nums{margin-left:auto;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.cli-l .nums b{display:block;font-size:14px}
.cli-l .nums span{font-size:12px;color:var(--cinza)}
.cli-l .det{color:var(--cinza);font-size:11.5px;margin-top:4px;line-height:1.5}
.cli-l .det .pend{color:var(--laranja-esc);font-weight:600}
.cli-l .ent{font-size:11.5px;color:var(--cinza);margin-top:5px;padding-left:11px;
  border-left:2px solid var(--areia);line-height:1.55}
.cli-l .ent .est{color:var(--laranja-esc)}
.aviso-cot{background:var(--laranja-pal);border-left:3px solid var(--laranja);
  border-radius:0 5px 5px 0;padding:10px 14px;font-size:12px;margin-bottom:10px;line-height:1.5}
@media (max-width:700px){
  .entrou-cx{grid-template-columns:1fr;gap:16px;padding:18px}
  .entrou-cx .v{font-size:25px}
  .mes-l{grid-template-columns:52px 1fr 96px;gap:8px}
  .mes-l .brl-col{display:none}
}
/* ── diagnóstico ── */
.diag{background:var(--preto);color:var(--marfim);border-radius:10px;padding:19px 21px}
.diag .cab{font-size:10.5px;letter-spacing:.13em;text-transform:uppercase;color:#8a8580;
  font-weight:700;margin-bottom:9px}
.diag .grande{font-size:15.5px;line-height:1.5}
.diag .grande b{color:var(--laranja)}
.diag ul{list-style:none;margin-top:14px;display:flex;flex-direction:column;gap:9px}
.diag li{font-size:13px;line-height:1.5;padding-left:13px;border-left:2px solid #333;color:#d9d4cb}
.diag li b{color:var(--marfim)}
.diag .bem{border-left-color:var(--verde)}
.diag .dor{border-left-color:var(--laranja)}
.acao-cx{background:var(--laranja-pal);border-left:3px solid var(--laranja);border-radius:0 6px 6px 0;
  padding:13px 15px;margin-top:14px;font-size:13px;line-height:1.5;color:var(--preto)}
.acao-cx b{display:block;font-size:10.5px;letter-spacing:.11em;text-transform:uppercase;
  color:var(--laranja-esc);margin-bottom:4px}
.ia-cx{margin-top:14px}
.ia-saida{background:var(--branco);border:1px solid var(--areia);border-radius:9px;
  padding:17px 19px;margin-top:12px;display:none}
.ia-saida.on{display:block}
.ia-saida h5{font-size:10.5px;letter-spacing:.11em;text-transform:uppercase;color:var(--laranja-esc);
  margin:15px 0 5px;font-weight:800}
.ia-saida h5:first-child{margin-top:0}
.ia-saida p{font-size:13.5px;line-height:1.55}
.ia-et{border-top:1px solid #f4efe6;padding:10px 0;font-size:13px;line-height:1.5}
.ia-et b{display:block}
.ia-et span{color:var(--cinza)}
.ia-et i{display:block;font-style:normal;color:var(--laranja-esc);margin-top:3px;font-weight:600}
.vazio{background:var(--branco);border:1px dashed var(--areia);border-radius:9px;
  padding:26px 22px;text-align:center;color:var(--cinza);font-size:13.5px;line-height:1.6}
.vazio b{display:block;color:var(--preto);font-size:15px;margin-bottom:6px}
@media (max-width:700px){
  .et,.pulo{grid-template-columns:120px 1fr 58px;gap:9px}
  .et-rot{font-size:12px}.et-n{font-size:17px}
}
`;

export const JS_DASH = `
/* ═══════════ DASHBOARD ═══════════
   Busca própria, separada de /api/painel: o painel recarrega a cada 60
   segundos e isto são agregações do período inteiro, que não mudam de
   minuto em minuto. Só busca quando a aba é aberta. */
let DASH=null, dashCarregando=false, dashPedido=null, iaSaida=null, dashSujo=true;

/* Chamada por carregar() a cada leva de dados novos. O dashboard NÃO é
   buscado junto do painel: ele só refaz a conta quando está na tela, senão
   seriam duas agregações do banco a cada 60 segundos sem ninguém olhando. */
function marcarDashSujo(){ dashSujo=true }

async function carregarDash(forcar){
  if(!DASH||forcar||dashSujo){
    // Dashboard e caixa compartilham a busca quando as abas mudam rapidamente.
    if(!dashPedido){
      dashCarregando=true;
      const cx=document.getElementById('conteudo');
      if(cx&&!DASH) cx.innerHTML='<div class="ui-loading" role="status"><i></i>Carregando indicadores...</div>';
      dashPedido=(async()=>{
        try{
          const r=await api('/api/dashboard');
          if(!r||r.erro) throw new Error(r?.erro||'Resposta vazia do servidor.');
          DASH=r;dashSujo=false;return true;
        }catch(e){
          if(cx&&setor==='comercial'&&(aba===ABA_DASH||aba===ABA_CAIXA)){
            cx.innerHTML='<div class="vazio"><b>Não consegui carregar os indicadores</b>'+esc(e.message||'')+'</div>';
            uiFimVista('comercial:'+aba);
          }
          return false;
        }finally{dashPedido=null;dashCarregando=false;}
      })();
    }
    if(!await dashPedido)return false;
  }
  if(setor==='comercial'&&aba===ABA_DASH) renderDash();
  return true;
}

const nfmt=n=>Number(n||0).toLocaleString('pt-BR');

function renderDash(){
  const cx=document.getElementById('conteudo');
  if(!DASH) return carregarDash();
  const e=DASH.etapas, d=DASH.diagnostico, R=DASH.rotulos;

  if(!e.entraram){
    cx.innerHTML='<div class="dash"><div class="vazio"><b>Nenhum lead no sistema ainda</b>'
      +'O funil, o dinheiro e o diagnóstico aparecem aqui a partir do primeiro lead. '
      +'Nada é estimado: enquanto não houver dado, esta tela fica vazia de propósito.</div></div>';
    uiFimVista('comercial:'+ABA_DASH);
    return;
  }

  /* ── o funil ──
     Largura de cada faixa proporcional a quem ENTROU, não à etapa anterior: é
     o que mostra o estreitamento real, em vez de dar 100% em toda etapa. Piso
     de 4% para etapa em zero ainda aparecer como fio, em vez de sumir e dar a
     impressão de que a etapa não existe.

     Se uma etapa vier MAIOR que a anterior (dado torto: alguém agendou sem ter
     respondido), a largura é travada na anterior para o funil não alargar, e a
     anomalia é dita em texto embaixo. Desenhar funil invertido em silêncio
     seria esconder um erro de cadastro. */
  const ETAPAS=[
    ['entraram','todo lead que já entrou'],
    ['responderam','atendeu ligação ou respondeu'],
    ['agendaram','call marcada na agenda'],
    ['compareceram','sentou na reunião'],
    ['fecharam','virou cliente'],
  ];
  const base=Math.max(1,e.entraram);
  const anomalias=[];
  let anterior=Infinity;
  const larg=ETAPAS.map(([k])=>{
    const v=e[k]||0;
    if(v>anterior) anomalias.push(R[k]||k);
    const efetivo=Math.min(v,anterior);
    anterior=efetivo;
    return Math.max(4,Math.min(100,100*efetivo/base));
  });
  // trapézio da faixa i: topo na largura dela, base na largura da seguinte
  const recorte=(i)=>{
    const t=larg[i], b=i+1<larg.length?larg[i+1]:larg[i]*0.72;
    const x=w=>[(100-w)/2,(100+w)/2];
    const t2=x(t), b2=x(b);
    return 'polygon('+t2[0]+'% 0,'+t2[1]+'% 0,'+b2[1]+'% 100%,'+b2[0]+'% 100%)';
  };
  const passoEntre=(de,para)=>(d.passos||[]).find(p=>p.de===de&&p.para===para);

  let funil='<div class="funil">';
  ETAPAS.forEach(function(par,i){
    const k=par[0], nota=par[1], v=e[k]||0;
    // a faixa DEPOIS de uma transição ruim é a que dói: é a única que muda de cor
    const ant=i>0?passoEntre(ETAPAS[i-1][0],k):null;
    const cls=!v?'vazia':(k==='fecharam'?'fim':(ant&&ant.estado==='ruim'?'dor':''));
    funil+='<div class="fx-l">'
      +'<div class="fx-rot">'+esc(R[k]||k)+'<small>'+esc(nota)+'</small></div>'
      +'<div class="fx-faixa '+cls+'"><i style="clip-path:'+recorte(i)+'"></i></div>'
      +'<div class="fx-n">'+nfmt(v)+'<small>'
      +(i===0?'100%':Math.round(100*v/base)+'% de quem entrou')+'</small></div>'
      +'</div>';
    if(i+1<ETAPAS.length){
      const p=passoEntre(k,ETAPAS[i+1][0]);
      const tag=!p?'':p.taxa===null
        ?'<span class="tag sem">sem amostra</span>'
        :'<span class="tag '+p.estado+'">'+p.taxa+'%</span>';
      const txt=!p?'':p.taxa===null
        ?'faltam '+p.faltam_para_medir+' para poder medir'
        :(p.perdidos_aqui?'<span class="perda">'+nfmt(p.perdidos_aqui)+' pararam aqui</span>'
                         :'não perdeu ninguém')+' · piso '+p.piso+'%';
      funil+='<div class="fx-p"><div></div><div class="meio">'
        +'<span class="seta">&#8595;</span>'+tag+'<span>'+txt+'</span></div><div></div></div>';
    }
  });

  funil+='<div class="fx-fuga">'
    +'<div class="fg fechou"><span>Fecharam na call</span><b>'+nfmt(e.fecharam_call)+'</b>'
      +'<small>fecharam dentro da reunião</small></div>'
    +'<div class="fg fechou"><span>Fecharam no follow-up</span><b>'+nfmt(e.fecharam_followup)+'</b>'
      +'<small>fecharam depois, fora da reunião</small></div>'
    +'<div class="fg perdeu"><span>Recusaram na call</span><b>'+nfmt(e.recusaram)+'</b>'
      +'<small>sentaram e disseram não</small></div>'
    +'<div class="fg perdeu"><span>Perdidos</span><b>'+nfmt(e.perdidos)+'</b>'
      +'<small>arquivados ou encerrados no F3</small></div>'
    +'</div>';
  if(anomalias.length) funil+='<div class="fx-anom"><b>Dado torto:</b> '
    +anomalias.map(esc).join(', ')+' tem mais gente que a etapa anterior, o que não deveria ser '
    +'possível. Provavelmente alguém foi movido para frente sem passar pela etapa do meio. '
    +'A faixa foi travada na largura da anterior para o funil não alargar.</div>';
  funil+='</div>';

  cx.innerHTML=uiCabecalho('Dashboard','','')+'<div class="dash"><div class="dash-grid"><section class="dash-overview">'
    +'<h3>Funil <em>'+nfmt(e.entraram)+' leads no período inteiro · '
    +(d.taxa_geral!==null?d.taxa_geral+'% fecham':'taxa sem amostra')+'</em></h3>'
    +funil+'</section><section class="dash-insight">'
    +'<h3>Diagnóstico</h3>'+blocoDiag(d)+'</section></div><section class="dash-money">'
    +'<h3>Dinheiro <em>dólar e real, do contrato ao que sobrou</em></h3>'+blocoGrana(DASH.financeiro)
    +'</section></div>';
  if(iaSaida) pintarIA(iaSaida);
  uiFimVista('comercial:'+ABA_DASH);
}

function estadoCls(de,para){
  const p=(DASH.diagnostico.passos||[]).find(x=>x.de===de&&x.para===para);
  if(!p||p.taxa===null) return 'morto';
  return p.estado==='ruim'?'ruim':p.estado==='bom'?'bom':'ac';
}

/* ── diagnóstico sem IA ──
   Roda sempre, não custa nada e é a base. A IA em cima só escreve melhor. */
function blocoDiag(d){
  if(!d.amostra_suficiente)
    return '<div class="diag"><div class="cab">Amostra</div>'
      +'<div class="grande">'+esc(d.resumo)+'</div></div>';

  let h='<div class="diag"><div class="cab">Onde está a dor</div>'
    +'<div class="grande">'+(d.gargalo
      ? 'Gargalo real: <b>'+esc(d.gargalo.dor)+'</b> '+esc(d.gargalo.acao)
      : esc(d.resumo))+'</div><ul>';
  if(d.gargalo) h+='<li class="dor"><b>'+esc(DASH.rotulos[d.gargalo.de])+' para '
    +esc(DASH.rotulos[d.gargalo.para])+': '+d.gargalo.taxa+'%</b> contra um piso de '
    +d.gargalo.piso+'%. São '+nfmt(d.gargalo.perdidos_aqui)+' lead(s) parados aí.</li>';
  if(d.melhor) h+='<li class="bem"><b>Funcionando: '+esc(DASH.rotulos[d.melhor.de])+' para '
    +esc(DASH.rotulos[d.melhor.para])+', '+d.melhor.taxa+'%.</b> Está acima do piso de '
    +d.melhor.piso+'%. Não mexe nessa etapa enquanto a de cima não estiver resolvida.</li>';
  (d.notas||[]).forEach(n=>{h+='<li>'+esc(n)+'</li>'});
  // etapas que ainda não têm amostra: dizer isso vale mais que inventar taxa
  const sem=(d.passos||[]).filter(p=>p.taxa===null);
  if(sem.length) h+='<li><b>Sem amostra para medir:</b> '
    +sem.map(p=>esc(DASH.rotulos[p.de])+' para '+esc(DASH.rotulos[p.para])).join(', ')
    +'. Com menos de '+sem[0].base+(sem[0].base===1?' lead':' leads')
    +' na etapa, qualquer taxa é ruído, então nada é diagnosticado aí.</li>';
  h+='</ul>';
  if(d.gargalo) h+='<div class="acao-cx"><b>Primeira coisa a fazer</b>'+esc(d.gargalo.acao)+'</div>';
  h+='<div class="ia-cx"><button class="acao" onclick="abrirAssistente()">Conversar com o Assistente Leon</button>'
    +'<span style="font-size:11.5px;color:#8a8580;margin-left:9px">Analise os números e desenvolva ideias com o Claude conectado no seu Mac.</span></div>';
  h+='</div><div class="ia-saida" id="ia_saida"></div>';
  return h;
}

/* ── dinheiro ──
   Ele fatura em dólar e vive em real. Os dois números importam ao mesmo tempo,
   então nada aqui aparece numa moeda só.

   O que NÃO é feito: somar dólar com real num total único, e recalcular o
   passado pela cotação de hoje. Cada entrada guarda a cotação do dia em que
   aquele dinheiro entrou; o que não tem cotação registrada é convertido pela
   de referência e aparece marcado como estimado, com o peso do chute em %. */
function blocoGrana(f){
  if(!f.n_entradas)
    return '<div class="vazio"><b>Nada entrou na empresa ainda</b>'
      +'Lance as entradas na seção <b>Entradas</b> do card do cliente: valor, moeda, '
      +'a data em que o dinheiro caiu e a cotação do dia. É daí que sai tudo aqui, '
      +'em dólar e em real.</div>';

  const E=f.entrou;
  let h='';

  // ── o número principal: o que entrou, visto dos dois lados ──
  h+='<div class="entrou-cx">'
    +'<div class="lado usd"><div class="r">Entrou na empresa</div>'
      +'<div class="v">'+esc(E.usd_rot)+'</div>'
      +'<div class="sub">'+f.n_entradas+' entrada(s) de '+f.n_clientes_com_entrada+' cliente(s)'
      +(E.nativo_usd?'<br>faturado direto em dólar: <b>'+esc(E.nativo_usd_rot)+'</b>':'')
      +'</div></div>'
    +'<div class="lado brl"><div class="r">O mesmo em real</div>'
      +'<div class="v">'+esc(E.brl_rot)+'</div>'
      +'<div class="sub">'
      +(E.nativo_brl?'recebido direto em real: <b>'+esc(E.nativo_brl_rot)+'</b><br>':'')
      +(E.pct_estimado_brl
        ? '<b>'+E.pct_estimado_brl+'% convertido pela cotação de referência</b>, não pela do dia'
        : 'convertido pela cotação de cada entrada')
      +'</div></div>'
    +'<div class="entrou-rod">'
      +'<span>Cotação de referência: <b>R$ '+esc(f.cotacao.rotulo)+'</b> por dólar</span>'
      +(f.cotacao.padrao
        ? '<span style="color:var(--laranja)">nunca foi definida, usando um valor padrão</span>'
        : '<span>'+esc(f.cotacao.fonte||'')+(f.cotacao.em
            ?', '+new Date(f.cotacao.em).toLocaleDateString('pt-BR'):'')+'</span>')
      +'<button class="cot-bt" onclick="mexerCotacao(this)">Atualizar cotação</button>'
    +'</div></div>';

  if(E.pct_estimado_brl>=20) h+='<div class="aviso-cot" style="margin-top:11px">'
    +'<b>'+E.pct_estimado_brl+'% do total em real é estimativa.</b> Esse pedaço foi convertido '
    +'pela cotação de referência de hoje, e não pela cotação do dia em que o dinheiro entrou. '
    +'Para o número em real ficar exato, preencha a cotação em cada entrada, na seção '
    +'<b>Entradas</b> do card do cliente.</div>';

  // ── os cartões ──
  const d2=(rot,u,b,nota,cls)=>'<div class="d2 '+(cls||'')+'"><div class="r">'+esc(rot)+'</div>'
    +'<div class="u">'+esc(u)+'</div><div class="b">'+esc(b)+'</div>'
    +(nota?'<small>'+nota+'</small>':'')+'</div>';

  h+='<h3 style="margin-top:24px">Do contrato ao lucro <em>dólar em cima, real embaixo</em></h3>'
    +'<div class="duo">'
    +d2('Contratado', f.contratado.usd_rot, f.contratado.brl_rot,
        f.contratado.n+' contrato(s), valor total'
        +(f.mrr.n?'<br>inclui '+f.mrr.n+' recorrente(s)':''))
    +d2('Entrou', E.usd_rot, E.brl_rot, f.n_entradas+' entrada(s) registrada(s)')
    +d2('Ainda a receber', f.a_receber.usd_rot, f.a_receber.brl_rot,
        'contratado menos o que entrou', 'fraco')
    +(f.mrr.n?d2('Mensalidade recorrente', f.mrr.usd_rot, f.mrr.brl_rot,
        'por mês, somando os '+f.mrr.n+' contrato(s) de MRR'):'')
    +d2('Taxas', f.taxas.usd_rot, f.taxas.brl_rot, 'gateway e câmbio, sobre o que entrou', 'fraco')
    +d2('Outros custos', f.custos.usd_rot, f.custos.brl_rot, 'ferramenta, freela', 'fraco')
    +d2('Lucro do que entrou', f.lucro.usd_rot, f.lucro.brl_rot,
        f.lucro.margem!==null?f.lucro.margem+'% do que entrou':'', 'forte')
    +(f.lucro_por_cliente?d2('Lucro por cliente', f.lucro_por_cliente.usd_rot,
        f.lucro_por_cliente.brl_rot, 'média dos '+f.n_clientes_com_entrada
        +' cliente(s) que já pagaram', 'forte'):'')
    +'</div>';

  // ── mês a mês: a única forma de ver se a entrada cresce ou parou ──
  if(f.por_mes.length){
    const teto=Math.max(...f.por_mes.map(m=>m.usd))||1;
    h+='<h3 style="margin-top:24px">Mês a mês do que entrou <em>pela data do dinheiro,'
      +' não pela do cadastro</em></h3><div class="mes-t">'
      +'<div class="mes-l cab"><span>Mês</span><span></span><span style="text-align:right">Dólar</span>'
      +'<span style="text-align:right" class="brl-col">Real</span></div>'
      +f.por_mes.map(m=>'<div class="mes-l"><span class="rot">'+esc(m.rotulo)+'</span>'
        +'<span class="bar"><i style="width:'+Math.max(2,100*m.usd/teto)+'%"></i></span>'
        +'<b>'+esc(m.usd_rot)+'</b>'
        +'<b class="brl brl-col">'+esc(m.brl_rot)+'</b></div>').join('')
      +'</div>';
  }

  // ── cliente por cliente, com as entradas de cada um ──
  const comGrana=f.por_cliente.filter(c=>c.n_entradas||c.contratado!==null);
  if(comGrana.length){
    h+='<h3 style="margin-top:24px">Cliente por cliente</h3><div class="cli-t">'
      +comGrana.map(c=>{
      let l='<div class="cli-l"><div class="top"><b>'+esc(c.empresa)+'</b>'
        +(c.recorrente?'<span class="tipo">MRR '+c.meses+'m</span>':'<span class="tipo">único</span>')
        +'<span class="nums"><b>'+esc(c.entrou.usd_rot)+'</b>'
        +'<span>'+esc(c.entrou.brl_rot)+'</span></span></div>';
      const det=[];
      if(c.contratado!==null) det.push('contratado '+esc(c.contratado_rot)
        +(c.recorrente?' ('+esc(String(c.mensalidade))+' x '+c.meses+' meses)':''));
      if(c.a_receber&&c.a_receber.usd>0.01) det.push('a receber '+esc(c.a_receber.usd_rot));
      if(c.lucro&&c.n_entradas) det.push('lucro '+esc(c.lucro.usd_rot)+' / '+esc(c.lucro.brl_rot));
      if(c.pendente) det.push('<span class="pend">'+esc(c.pendente)+'</span>');
      if(det.length) l+='<div class="det">'+det.join(' · ')+'</div>';
      if(c.entradas.length) l+='<div class="ent">'+c.entradas.map(e=>
        esc(new Date(e.recebido_em+'T12:00:00').toLocaleDateString('pt-BR'))
        +' · '+esc(e.valor_rot)+' = '+esc(e.brl_rot)
        +(e.cotacao_estimada
          ? ' <span class="est">(cotação estimada em '+e.cotacao_usada.toFixed(2).replace('.',',')+')</span>'
          : e.moeda==='USD' ? ' (cotação '+e.cotacao_usada.toFixed(2).replace('.',',')+')' : '')
        +(e.parcela?' · '+esc(e.parcela):'')+(e.meio?' · '+esc(e.meio):'')
        ).join('<br>')+'</div>';
      return l+'</div>';
    }).join('')+'</div>';
  }

  (f.avisos||[]).forEach(a=>{h+='<div class="aviso-cot" style="margin-top:11px">'+esc(a)+'</div>'});
  return h;
}

/* Trocar a cotação de referência. O botão de buscar traz a cotação de MERCADO,
   que é referência: o real que ele recebe de verdade sai da cotação do banco
   ou da Wise dele, sempre pior que a de mercado. */
async function mexerCotacao(btn){
  const atual=DASH.financeiro.cotacao.rotulo;
  const v=prompt('Cotação de referência: quantos reais vale um dólar.\\n\\n'
    +'Ela é usada só onde a entrada não tem cotação própria, e para projetar o que '
    +'ainda falta receber.\\n\\n'
    +'Deixe em branco e confirme para eu buscar a cotação de mercado de hoje.\\n\\n'
    +'Atual: '+atual, atual);
  if(v===null) return;
  btn.disabled=true; btn.textContent='...';
  const r=await post('/api/cotacao', v.trim()?{valor:v.trim()}:{buscar:true});
  btn.disabled=false; btn.textContent='Atualizar cotação';
  if(r.erro) return alert(r.erro);
  if(!v.trim()) alert('Cotação de mercado de hoje: R$ '+Number(r.valor).toFixed(2).replace('.',',')
    +'\\n\\nÉ a cotação de MERCADO. O real que você recebe de verdade sai da cotação do seu '
    +'banco ou da Wise, que é sempre um pouco pior.');
  await carregarDash(true);
}

async function rodarIA(btn){
  const cx=document.getElementById('ia_saida');
  btn.disabled=true; const rot=btn.textContent; btn.textContent='Analisando...';
  const r=await post('/api/diagnostico-ia',{});
  btn.disabled=false; btn.textContent=rot;
  if(r.erro){
    cx.className='ia-saida on';
    cx.innerHTML='<p style="color:var(--laranja-esc)"><b>'+esc(r.erro)+'</b></p>';
    return;
  }
  iaSaida=r; pintarIA(r);
}
function pintarIA(r){
  const cx=document.getElementById('ia_saida'); if(!cx) return;
  cx.className='ia-saida on';
  cx.innerHTML='<h5>A dor real</h5><p>'+esc(r.dor_real)+'</p>'
    +(r.por_etapa&&r.por_etapa.length?'<h5>Etapa por etapa</h5>'
      +r.por_etapa.map(x=>'<div class="ia-et"><b>'+esc(x.etapa)+'</b>'
        +'<span>'+esc(x.leitura)+'</span><i>'+esc(x.acao)+'</i></div>').join(''):'')
    +(r.indo_bem?'<h5>Indo bem, não mexer</h5><p>'+esc(r.indo_bem)+'</p>':'')
    +(r.financeiro?'<h5>Dinheiro</h5><p>'+esc(r.financeiro)+'</p>':'')
    +(r.proxima_acao?'<div class="acao-cx" style="margin-top:15px"><b>A próxima ação</b>'
      +esc(r.proxima_acao)+'</div>':'')
    +'<p style="font-size:11.5px;color:var(--cinza);margin-top:13px">Análise gerada em '
    +new Date(r.em).toLocaleString('pt-BR')+' a partir dos números do funil. '
    +'Confira contra a sua leitura da operação antes de agir.</p>';
}
`;
