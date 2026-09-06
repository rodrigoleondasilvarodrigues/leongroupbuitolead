export const ADMIN_HTML = `<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Leon Group — Admin</title><style>
:root{--marfim:#F7F3EA;--branco:#FFFDF8;--preto:#171717;--laranja:#E65A19;--laranja-esc:#C44712;
--laranja-pal:#F4D8C9;--areia:#E9E1D6;--cinza:#68645E;--verde:#2d6a4f;
/* comercial = laranja da marca · operacional = azul-petróleo */
--op:#1B4965;--op-claro:#DCE9F0;--op-borda:#a9c4d4}
*{box-sizing:border-box;margin:0;padding:0}
body{font:14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif;background:var(--marfim);color:var(--preto)}
header{background:var(--preto);color:var(--marfim);padding:13px 22px;display:flex;align-items:center;gap:18px}
header b{font-size:15px}header b span{color:var(--laranja)}
header .sair{margin-left:auto;color:var(--cinza);font-size:12.5px;cursor:pointer;background:none;border:0}
nav{display:flex;align-items:center;gap:2px;padding:0 22px;background:var(--areia);
border-bottom:1px solid #d8cfc0;overflow-x:auto}
/* switch primário entre os dois setores */
.setores{display:flex;gap:0;padding:0 22px;background:var(--preto)}
.setores button{flex:0 0 auto;border:0;background:none;color:#8a8580;font:inherit;font-size:13px;
font-weight:600;padding:13px 26px;cursor:pointer;letter-spacing:.03em;position:relative;
border-bottom:3px solid transparent;transition:.15s}
.setores button:hover{color:var(--marfim)}
.setores button.on{color:#fff}
.setores button.com.on{border-bottom-color:var(--laranja);background:rgba(230,90,25,.14)}
.setores button.op.on{border-bottom-color:#5fa8d3;background:rgba(95,168,211,.14)}
.setores .badge{display:inline-block;margin-left:7px;background:var(--laranja);color:#fff;
font-size:10.5px;padding:1px 7px;border-radius:9px;font-weight:700}
.setores button.op .badge{background:#5fa8d3;color:#08304a}
nav .sep{width:1px;height:22px;background:#c9bda9;margin:0 12px;flex:0 0 auto}
nav button.op.on{border-bottom-color:var(--op)}
body.operacional{background:#F2F6F8}
body.operacional header{background:var(--op)}
.faixa{height:3px;background:var(--laranja)}
body.operacional .faixa{background:var(--op)}
.selo{font-size:10px;text-transform:uppercase;letter-spacing:.09em;font-weight:700;
padding:3px 9px;border-radius:3px;background:var(--laranja-pal);color:var(--laranja-esc)}
body.operacional .selo{background:var(--op-claro);color:var(--op)}
nav button{border:0;background:none;padding:11px 17px;cursor:pointer;font:inherit;font-size:13px;
color:var(--cinza);border-bottom:2px solid transparent;white-space:nowrap}
nav button.on{color:var(--preto);border-bottom-color:var(--laranja);font-weight:600}
main{padding:18px 22px 50px}
.kpis{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:16px}
.kpi{background:var(--branco);border:1px solid var(--areia);border-radius:6px;padding:9px 14px;min-width:106px}
.kpi b{display:block;font-size:19px}.kpi span{font-size:10.5px;color:var(--cinza);text-transform:uppercase;letter-spacing:.04em}
.alerta{background:var(--laranja-pal);border-left:3px solid var(--laranja);padding:9px 13px;border-radius:4px;font-size:12.5px;flex:1;min-width:280px}
.quadro{display:flex;gap:11px;overflow-x:auto;padding-bottom:10px;align-items:flex-start}
.col{background:var(--branco);border:1px solid var(--areia);border-radius:8px;min-width:222px;max-width:222px;flex:0 0 auto}
.col h3{font-size:11.5px;text-transform:uppercase;letter-spacing:.05em;padding:10px 12px;
border-bottom:1px solid var(--areia);display:flex;justify-content:space-between;color:var(--cinza)}
.col h3 em{font-style:normal;background:var(--areia);border-radius:10px;padding:1px 8px;color:var(--preto)}
.col .ativ{font-size:10.5px;color:var(--laranja-esc);padding:5px 12px;background:var(--laranja-pal);border-bottom:1px solid var(--areia)}
.cards{padding:8px;display:flex;flex-direction:column;gap:6px;min-height:44px}
.card{background:var(--marfim);border:1px solid var(--areia);border-radius:6px;padding:9px 10px;cursor:pointer}
.card:hover{border-color:var(--laranja)}
.card b{display:block;font-size:12.5px}.card small{color:var(--cinza);font-size:11.5px}
.card .t{font-size:10.5px;color:var(--laranja-esc);margin-top:3px}
.cli{background:var(--branco);border:1px solid var(--areia);border-radius:9px;padding:15px 17px;margin-bottom:11px;cursor:pointer}
.cli:hover{border-color:var(--laranja)}
.cli h3{font-size:15.5px}.cli .meta{color:var(--cinza);font-size:12.5px;margin:2px 0 9px}
.pills{display:flex;gap:5px;flex-wrap:wrap}
.pill{font-size:10.5px;padding:3px 9px;border-radius:11px;border:1px solid var(--areia);background:var(--marfim)}
.pill.ok{background:#e5f0e9;border-color:#bcd9c8;color:var(--verde)}
.pill.prod{background:var(--laranja-pal);border-color:#e8bfa9;color:var(--laranja-esc)}
button.acao{background:var(--laranja);color:#fff;border:0;border-radius:5px;padding:8px 15px;cursor:pointer;font:inherit;font-size:13px}
button.acao:hover{background:var(--laranja-esc)}
button.sec{background:var(--branco);color:var(--preto);border:1px solid var(--areia)}
.painel{position:fixed;inset:0 0 0 auto;width:min(620px,100%);background:var(--branco);border-left:1px solid var(--areia);
box-shadow:-8px 0 30px rgba(0,0,0,.1);overflow-y:auto;padding:24px;display:none;z-index:20}
.painel.on{display:block}
.painel .x{position:absolute;top:15px;right:18px;border:0;background:none;font-size:23px;cursor:pointer;color:var(--cinza)}
section{margin-top:20px;padding-top:15px;border-top:1px solid var(--areia)}
h4{font-size:11.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--cinza);margin-bottom:9px}
input,select,textarea{width:100%;padding:8px 10px;border:1px solid var(--areia);border-radius:5px;font:inherit;background:var(--marfim);margin-bottom:8px}
textarea{min-height:60px;resize:vertical}
label{font-size:11.5px;color:var(--cinza);display:block;margin-bottom:2px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(138px,1fr));gap:6px}
.grid button{font-size:12px;padding:7px 9px;text-align:left;border:1px solid var(--areia);background:var(--marfim);border-radius:5px;cursor:pointer;font-family:inherit}
.grid button:hover{border-color:var(--laranja);background:var(--laranja-pal)}
.grid button.perigo{border-color:var(--laranja-esc);background:#fbe9e2}
.linha{font-size:12.5px;padding:6px 0;border-bottom:1px solid #f2ede4;display:flex;gap:8px;align-items:flex-start}
.linha.feito{color:var(--cinza);text-decoration:line-through}
.linha input[type=checkbox]{width:auto;margin:3px 0 0}
.rev{background:var(--marfim);border:1px solid var(--areia);border-radius:6px;padding:10px;margin-bottom:7px;font-size:12.5px}
.rev small{color:var(--cinza);display:block;margin-bottom:3px}
.nota{background:var(--laranja-pal);border-left:3px solid var(--laranja);padding:10px 13px;border-radius:4px;font-size:12.5px;margin:10px 0}
.link{background:var(--marfim);border:1px dashed var(--areia);padding:9px 11px;border-radius:5px;
font-size:12px;word-break:break-all;margin-bottom:8px}
dialog{border:0;border-radius:10px;padding:24px;max-width:460px;width:93%;box-shadow:0 20px 60px rgba(0,0,0,.2)}
dialog::backdrop{background:rgba(23,23,23,.45)}
</style></head><body>
<header><b>LE<span>O</span>N GROUP · Admin</b><span class="selo" id="selo">Comercial</span>
  <button class="sair" onclick="fetch('/api/logout',{method:'POST'}).then(()=>location.href='/login')">sair</button></header>
<div class="setores" id="setores"></div>
<div class="faixa"></div>
<nav id="abas"></nav>
<main><div id="conteudo"></div></main>
<div class="painel" id="painel"></div>

<dialog id="dlgLead"><h3 style="margin-bottom:13px">Novo lead</h3>
  <label>Nome</label><input id="l_nome"><label>Telefone (com DDI)</label><input id="l_tel">
  <label>Empresa</label><input id="l_emp"><label>Nicho</label><input id="l_nicho">
  <div style="display:flex;gap:8px;margin-top:10px">
    <button class="acao" onclick="criarLead()">Criar</button>
    <button class="acao sec" onclick="dlgLead.close()">Cancelar</button></div>
  <p style="font-size:11.5px;color:var(--cinza);margin-top:11px">
    Entra em Super Hot, boas-vindas dispara automático. Ligue em menos de 1 minuto.</p></dialog>

<dialog id="dlgCli"><h3 style="margin-bottom:13px">Cliente fechado</h3>
  <label>Nome do contato</label><input id="c_nome"><label>Empresa</label><input id="c_emp">
  <label>Nicho</label><input id="c_nicho"><label>E-mail</label><input id="c_email">
  <label>Valor pago</label><input id="c_valor" placeholder="US$ 2.500">
  <div style="display:flex;gap:8px;margin-top:10px">
    <button class="acao" onclick="criarCliente()">Cadastrar</button>
    <button class="acao sec" onclick="dlgCli.close()">Cancelar</button></div></dialog>

<script>
const api=(u,o)=>fetch(u,o).then(r=>r.json());
// Escapa todo dado vindo do banco antes de entrar no HTML.
// Campos como nome_dono, cidade e servicos chegam do FORMULÁRIO PÚBLICO:
// sem isso, quem tem um link de formulário injeta script no admin.
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const post=(u,b)=>api(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
const hrs=i=>i?((Date.now()-new Date(i))/36e5):0;
let D={},setor='comercial',aba='leads_novos',aberto=null,tipoAberto=null;
// sub-visões do operacional — filtram a mesma lista de clientes
const VISOES_OP={
  todos:      {rotulo:'Todos',      filtro:()=>true},
  concluidos: {rotulo:'Concluídos', filtro:c=>c.entrega_completa},
  em_entrega: {rotulo:'Em entrega', filtro:c=>c.entrega_iniciada_em&&!c.entrega_completa},
  atrasados:  {rotulo:'Atrasados',  filtro:c=>c.atrasado},
  aguardando: {rotulo:'Aguardando cliente', filtro:c=>!c.formulario_em},
  renovacao:  {rotulo:'Renovação',  filtro:c=>c.renovacao_perto},
};
const ROT={leads_novos:'Leads novos',agendamento:'Agendamento',nutricao:'Nutrição',recuperacao:'Recuperação'};

async function carregar(){
  D=await api('/api/painel');
  const operacional = setor==='operacional';
  document.body.classList.toggle('operacional', operacional);
  document.getElementById('selo').textContent = operacional?'Operacional':'Comercial';
  const alertas = D.clientes.filter(c=>c.atrasado||c.renovacao_perto).length;
  const emAberto = D.leads.filter(l=>l.pipeline!=='nutricao'&&l.pipeline!=='recuperacao').length;

  // switch primário: os dois setores, sempre visíveis e clicáveis
  document.getElementById('setores').innerHTML=
    \`<button class="com \${!operacional?'on':''}" onclick="irPara('comercial')">
        COMERCIAL\${emAberto?\`<span class="badge">\${emAberto}</span>\`:''}</button>
      <button class="op \${operacional?'on':''}" onclick="irPara('operacional')">
        OPERACIONAL\${D.clientes.length?\`<span class="badge">\${D.clientes.length}\${alertas?' ⚠':''}</span>\`:''}</button>\`;

  // sub-abas do setor ativo
  document.getElementById('abas').innerHTML = operacional
    ? Object.entries(VISOES_OP).map(([k,v])=>{
        const n=D.clientes.filter(v.filtro).length;
        return \`<button class="op \${k===aba?'on':''}" onclick="aba='\${k}';render()">\${v.rotulo} (\${n})</button>\`}).join('')
    : Object.keys(D.pipelines).map(p=>{const n=D.leads.filter(l=>l.pipeline===p).length;
        return \`<button class="\${p===aba?'on':''}" onclick="aba='\${p}';render()">\${ROT[p]} (\${n})</button>\`}).join('');
  render();
}

function render(){
  const c=document.getElementById('conteudo');
  const k=D.kpis;
  const rotK={whatsapp:'No WhatsApp',ligacao_atendida:'Atenderam',call_marcada:'Calls marcadas',
    call_comparecida:'Compareceram',call_fechada:'Fecharam'};
  const kpis=\`<div class="kpis">\${Object.entries(k.etapas).map(([e,v])=>
    \`<div class="kpi"><b>\${v}</b><span>\${rotK[e]||e}</span></div>\`).join('')}
    \${k.alertas.map(a=>\`<div class="alerta"><b>\${a.taxa}%</b> em \${a.transicao} — \${a.diagnostico}</div>\`).join('')}</div>\`;

  if(setor==='operacional'){
    c.innerHTML=kpis+\`<div style="margin-bottom:14px"><button class="acao" onclick="dlgCli.showModal()">+ Cliente fechado</button></div>\`
      +(()=>{const lista=D.clientes.filter((VISOES_OP[aba]||VISOES_OP.todos).filtro);
        return lista.length?lista.map(x=>{
        const pills=x.entregaveis.map(e=>{
          const cl=['entregue','aprovado'].includes(e.status)?'ok':(e.status==='em_producao'?'prod':'');
          const r=(D.entregaveis.find(y=>y[0]===e.tipo)||[])[1]||e.tipo;
          return \`<span class="pill \${cl}">\${r.split(' (')[0]}</span>\`}).join('');
        return \`<div class="cli" onclick="abrirCliente(\${x.id})">
          <div style="display:flex;align-items:baseline"><h3>\${esc(x.empresa)}</h3>
          <span style="margin-left:auto;font-size:12px;color:var(--cinza)">\${
            x.dias_uteis!==null&&x.dias_uteis<=5?'<b style="color:'+(x.atrasado?'#c0392b':'var(--laranja-esc)')+'">entrega dia '+x.dias_uteis+'/5 útil</b>'
            :x.atrasado?'<b style="color:#c0392b">ENTREGA ATRASADA</b>'
            :x.renovacao_perto?'<b style="color:var(--laranja-esc)">renova em '+x.dias_para_renovar+'d</b>'
            :x.dias+' dias'}</span></div>
          <div class="meta">\${esc(x.nome_contato)}\${x.nicho?' · '+esc(x.nicho):''}\${x.valor_pago?' · '+esc(x.valor_pago):''}
            \${x.reviews_total?' · '+x.reviews_postadas+'/'+x.reviews_total+' reviews':''}
            \${x.marcos_total?' · '+x.marcos_feitos+'/'+x.marcos_total+' marcos':''}
            \${x.midias&&x.midias.foto?' · '+x.midias.foto+' fotos':''}
            \${x.leads_recebidos?' · <b>'+x.leads_recebidos+' leads entregues</b>':''}</div>
          <div class="pills">\${pills}</div></div>\`}).join('')
        :\`<p style="color:var(--cinza)">Nenhum cliente \${aba==='todos'?'ainda':'nesta visão'}.</p>\`})();
    return;
  }
  const cols=D.pipelines[aba]||[];
  c.innerHTML=kpis+\`<div style="margin-bottom:14px"><button class="acao" onclick="dlgLead.showModal()">+ Novo lead</button></div>
   <div class="quadro">\${cols.map(([col,rot])=>{
    const ls=D.leads.filter(l=>l.pipeline===aba&&l.coluna===col);
    const a=D.ativacoes[col];
    return \`<div class="col"><h3>\${rot}<em>\${ls.length}</em></h3>
      \${a?\`<div class="ativ">\${a} ativações/dia</div>\`:''}
      <div class="cards">\${ls.length?ls.map(l=>{const h=hrs(l.entrou_coluna_em);
        return \`<div class="card" onclick="abrirLead(\${l.id})"><b>\${esc(l.nome)}</b>
          <small>\${esc(l.empresa||'—')}\${l.nicho?' · '+esc(l.nicho):''}</small>
          <div class="t">\${h<1?'agora há pouco':h.toFixed(0)+'h aqui'}\${h>=24?' · decai no próximo ciclo':''}</div>
        </div>\`}).join(''):'<div style="color:var(--cinza);font-size:12px;padding:8px 12px">vazio</div>'}</div></div>\`}).join('')}</div>\`;
}

async function abrirLead(id){
  aberto=id;tipoAberto='lead';
  const l=await api('/api/lead?id='+id);
  const p=document.getElementById('painel');p.classList.add('on');
  p.innerHTML=\`<button class="x" onclick="fechar()">×</button>
   <h2 style="font-size:18px">\${esc(l.nome)}</h2>
   <div style="color:var(--cinza);font-size:12.5px">\${esc(l.empresa||'—')} · \${esc(l.telefone)}</div>
   <div style="font-size:12px;margin-top:5px"><b>\${esc(l.pipeline)}</b> / \${esc(l.coluna)} · \${hrs(l.entrou_coluna_em).toFixed(0)}h aqui</div>
   <section><h4>Ligação</h4><div style="display:flex;gap:7px;flex-wrap:wrap">
     <button class="acao" onclick="lig(1)">Atendeu</button>
     <button class="acao sec" onclick="lig(0)">Não atendeu</button>
     <button class="acao sec" onclick="resp()">Respondeu mensagem</button></div>
     <p style="font-size:11.5px;color:var(--cinza);margin-top:6px">
       Nunca 3 ligações seguidas. Melhor janela: 17h-22h (52% atendem).</p></section>
   <section><h4>Ativações — \${D.ativacoes[l.coluna]||0}/dia</h4>
     <div class="grid">\${D.catalogo.map(([t,r])=>
       \`<button class="\${t==='comprovante_falso'?'perigo':''}" onclick="ativ('\${t}')">\${r}</button>\`).join('')}</div>
     <p style="font-size:11.5px;color:var(--cinza);margin-top:7px">
       Follow-up não é venda. Proibido ofertar — a venda acontece na ligação.</p></section>
   <section><h4>Qualificação BANT</h4>
     <label>Rapport (ponto de conexão — reusado no follow de no-show)</label><input id="q_rapport" value="\${esc(l.rapport)}">
     <label>Budget (ancorar em US$10 mil)</label><input id="q_budget" value="\${esc(l.budget)}">
     <label>Authority (é o decisor? estará na call?)</label><input id="q_authority" value="\${esc(l.authority)}">
     <label>Need</label><input id="q_need" value="\${esc(l.need)}">
     <label>Timeline</label><input id="q_timeline" value="\${esc(l.timeline)}">
     <button class="acao" onclick="qual(1)">Salvar e qualificar</button>
     <button class="acao sec" onclick="qual(0)">Só salvar</button></section>
   <section><h4>Agendar call</h4><input type="datetime-local" id="q_quando">
     <button class="acao" onclick="agendar()">Agendar</button>
     <p style="font-size:11.5px;color:var(--cinza);margin-top:6px">
       Nunca mais de 2 dias à frente. Sem horário hoje? Não marque — diga que retorna a ligação amanhã.</p></section>
   <section><h4>Contrato</h4>
     <label>Modelo de cobrança</label>
     <select id="k_tipo">
       <option value="">— não definido —</option>
       <option value="TCV" \${l.tipo_contrato==='TCV'?'selected':''}>TCV — valor total em pagamento único</option>
       <option value="MRR" \${l.tipo_contrato==='MRR'?'selected':''}>MRR — mensalidade recorrente</option>
     </select>
     <div style="display:flex;gap:8px">
       <div style="flex:1"><label id="k_lbl">Valor</label><input id="k_valor" value="\${esc(l.valor_contrato)}" placeholder="US$ 2.500"></div>
       <div style="flex:1"><label>Duração (meses)</label><input type="number" id="k_meses" value="\${l.duracao_meses||3}"></div>
     </div>
     <label><input type="checkbox" id="k_auto" style="width:auto" \${l.renovacao_automatica?'checked':''}> Renovação automática</label>
     <label style="margin-top:9px">Serviço extra fora do escopo padrão (se houve)</label>
     <input id="k_extras" value="\${esc(l.servicos_extras)}" placeholder="ex: gestão de tráfego pago">
     <label>Valor do extra</label><input id="k_valor_extras" value="\${esc(l.valor_extras)}">
     <button class="acao" onclick="salvarContrato()">Salvar contrato</button>
     <p style="font-size:11.5px;color:var(--cinza);margin-top:6px">
       Preencha antes de marcar "Fechou" — esses dados vão junto pro operacional,
       para a equipe saber o que esperar do contrato.</p>
   </section>
   <section><h4>Mover</h4><div style="display:flex;gap:6px;flex-wrap:wrap">
     <button class="acao sec" onclick="mv('call_rolando','agendamento')">Entrou na call</button>
     <button class="acao sec" onclick="mv('no_show','agendamento')">Não apareceu</button>
     <button class="acao" onclick="mv('fechou','agendamento')">Fechou a venda ✓</button>
     <button class="acao sec" onclick="mv('recusou','agendamento')">Recusou</button></div>
     <p style="font-size:11.5px;color:var(--cinza);margin-top:6px">
       Ao marcar "Fechou", os dados do lead viram um cliente no operacional automaticamente.</p></section>
   <section><h4>Zona de risco</h4>
     <button class="acao" style="background:#c0392b" onclick="excluir('lead',\${l.id},'\${esc(l.nome)}')">Excluir este lead</button>
     <p style="font-size:11.5px;color:var(--cinza);margin-top:6px">
       Apaga o lead e todo o histórico dele. Não tem como desfazer.</p>
   </section>
   <section><h4>Histórico</h4>\${(l.eventos||[]).slice(0,12).map(e=>
     \`<div class="linha"><span><b>\${esc(e.tipo)}</b> \${e.para?'→ '+esc(e.para):''}
      <br><small style="color:var(--cinza)">\${new Date(e.criado_em).toLocaleString('pt-BR')}</small></span></div>\`).join('')}</section>\`;
}

async function abrirCliente(id){
  aberto=id;tipoAberto='cliente';
  const c=await api('/api/cliente?id='+id);
  const p=document.getElementById('painel');p.classList.add('on');
  const base=location.origin;
  p.innerHTML=\`<button class="x" onclick="fechar()">×</button>
   <h2 style="font-size:18px">\${esc(c.empresa)}</h2>
   <div style="color:var(--cinza);font-size:12.5px">\${esc(c.nome_contato)} · dia \${c.dias}\${c.valor_pago?' · '+esc(c.valor_pago):''}</div>
   \${c.entrega_iniciada_em?
     \`<div class="nota" style="\${c.dias_uteis>5?'background:#fbe4e0;border-left-color:#c0392b':''}">
       Entrega: <b>dia \${c.dias_uteis} de \${c.prazo_maximo} úteis</b>
       \${c.dias_uteis>5?' — <b>ATRASADA</b>':''}. Prazo final: \${c.prazo_final?new Date(c.prazo_final).toLocaleDateString('pt-BR'):'—'}</div>\`
     :'<div class="nota">A cadência de 5 dias úteis começa quando o cliente responder o formulário.</div>'}
   \${c.dias_para_renovar!==null?
     \`<div class="nota" style="\${c.dias_para_renovar<=21?'':'background:var(--areia);border-left-color:var(--cinza)'}">
       Contrato de 3 meses: <b>\${c.dias_para_renovar>0?'renova em '+c.dias_para_renovar+' dias':'VENCIDO há '+(-c.dias_para_renovar)+' dias'}</b>
       \${c.renovado_vezes?' · já renovou '+c.renovado_vezes+'x':''}
       <button class="acao sec" style="margin-top:7px;font-size:12px" onclick="renovar()">Renovar +3 meses</button></div>\`:''}
   <section><h4>Liberação do formulário</h4>
     <div class="linha"><input type="checkbox" \${c.contrato_assinado?'checked':''}
       onchange="liberar('contrato',this.checked)"><span><b>Contrato assinado</b></span></div>
     <div class="linha"><input type="checkbox" \${c.pagamento_confirmado?'checked':''}
       onchange="liberar('pagamento',this.checked)"><span><b>Pagamento confirmado</b></span></div>
     <p style="font-size:11.5px;color:var(--cinza);margin-top:7px">
       O formulário do cliente só abre com os dois marcados. A cadência de entrega
       (5 dias) nasce quando ele responder.</p>
   </section>
   <section><h4>Links</h4>
     \${(c.contrato_assinado&&c.pagamento_confirmado)?
       \`<div class="link"><b>Formulário do cliente:</b><br>\${base}/f/\${esc(c.formulario_token)}
         \${c.formulario_em?' <span style="color:var(--verde)">✓ respondido — link consumido</span>':' <span style="color:var(--laranja-esc)">aguardando resposta</span>'}</div>
        \${c.formulario_em?'<button class="acao sec" onclick="novoToken()">Gerar link novo</button>':''}\`
       :'<div class="link" style="color:var(--cinza)">Formulário travado — marque contrato e pagamento acima.</div>'}
     \${c.site_publicado?\`<div class="link"><b>Site publicado:</b><br><a href="/site/\${esc(c.slug)}" target="_blank">\${base}/site/\${esc(c.slug)}</a></div>\`:''}
     <a class="acao sec" style="display:inline-block;text-decoration:none;padding:8px 15px" href="/api/exportar?id=\${c.id}">Baixar entrega (.txt)</a>
   </section>
   <section><h4>Dados do cliente</h4>
     <label>Nome do dono (repetido nas reviews)</label><input id="e_nome_dono" value="\${esc(c.nome_dono)}">
     <div style="display:flex;gap:8px"><div style="flex:2"><label>Cidade (SEO local)</label>
       <input id="e_cidade" value="\${esc(c.cidade)}"></div><div style="flex:1"><label>Estado</label>
       <input id="e_estado" value="\${esc(c.estado)}"></div></div>
     <label>Telefone</label><input id="e_telefone" value="\${esc(c.telefone)}">
     <label>Serviços (separados por vírgula)</label><textarea id="e_servicos">\${esc(c.servicos)}</textarea>
     <label>Diferencial</label><textarea id="e_diferencial">\${esc(c.diferencial)}</textarea>
     <label>Observações</label><textarea id="e_observacoes">\${esc(c.observacoes)}</textarea>
     <div style="display:flex;gap:8px"><div style="flex:1"><label>Cor principal</label>
       <input type="color" id="e_cor_primaria" value="\${esc(c.cor_primaria||'#1B4965')}"></div>
       <div style="flex:1"><label>Cor de destaque</label>
       <input type="color" id="e_cor_destaque" value="\${esc(c.cor_destaque||'#F6AE2D')}"></div></div>
     <label>Fotos adicionais (uma URL por linha)</label><textarea id="e_fotos"></textarea>
     <p style="font-size:11.5px;color:var(--cinza)">\${(c.midias||[]).length} fotos cadastradas</p>
     <button class="acao" onclick="salvarCliente()">Salvar</button></section>
   <section><h4>Dashboard do cliente</h4>
     <div class="kpis" style="margin-bottom:10px">
       <div class="kpi"><b>\${c.dias_uteis??'—'}</b><span>dia útil de 5</span></div>
       <div class="kpi"><b>\${(c.marcos||[]).filter(m=>m.concluido).length}/\${(c.marcos||[]).length}</b><span>marcos</span></div>
       <div class="kpi"><b>\${(c.reviews||[]).filter(r=>r.postada).length}/\${(c.reviews||[]).length}</b><span>reviews postadas</span></div>
       <div class="kpi"><b>\${(c.midias||[]).filter(m=>m.tipo==='foto').length}</b><span>fotos</span></div>
       <div class="kpi"><b>\${(c.midias||[]).filter(m=>m.tipo==='video').length}</b><span>vídeos</span></div>
       <div class="kpi"><b>\${c.leads_recebidos||0}</b><span>leads entregues</span></div>
     </div>
     <label>Leads que o cliente já recebeu (para a conversa de renovação)</label>
     <div style="display:flex;gap:7px"><input type="number" id="d_leads" value="\${c.leads_recebidos||0}" style="flex:1">
       <button class="acao sec" onclick="salvarResultado()">Salvar</button></div>
   </section>
   <section><h4>Site — deploy manual no Vercel</h4>
     \${c.site_html?\`
       <a class="acao" style="display:inline-block;text-decoration:none;padding:8px 15px" href="/api/baixar-site?id=\${c.id}">Baixar index.html</a>
       <p style="font-size:11.5px;color:var(--cinza);margin:8px 0">
         Suba esse arquivo no Vercel (vercel.com → Add New → Project → arraste a pasta),
         depois cole a URL aqui embaixo.</p>
       <label>URL publicada no Vercel</label>
       <div style="display:flex;gap:7px"><input id="d_vercel" value="\${esc(c.vercel_url)}" placeholder="https://empresa.vercel.app" style="flex:1">
         <button class="acao sec" onclick="salvarVercel()">Salvar</button></div>
       \${c.vercel_url?\`<p style="font-size:12px;margin-top:5px"><a href="\${esc(c.vercel_url)}" target="_blank">abrir site do cliente ↗</a></p>\`:''}\`
       :'<p style="color:var(--cinza);font-size:12.5px">Gere os entregáveis primeiro.</p>'}
   </section>
   <section><h4>Mídias do cliente (\${(c.midias||[]).length})</h4>
     \${(c.midias||[]).length?\`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:6px">
       \${(c.midias||[]).map(m=>m.tipo==='foto'
         ?\`<a href="\${esc(m.caminho)}" target="_blank"><img src="\${esc(m.caminho)}" style="width:100%;height:66px;object-fit:cover;border-radius:5px;border:1px solid var(--areia)"></a>\`
         :\`<a href="\${esc(m.caminho)}" target="_blank" style="display:flex;align-items:center;justify-content:center;height:66px;background:var(--marfim);border:1px solid var(--areia);border-radius:5px;font-size:11px;text-decoration:none;color:var(--preto)">\${esc(m.tipo)}</a>\`
       ).join('')}</div>\`
       :'<p style="color:var(--cinza);font-size:12.5px">Nenhuma mídia — vem do formulário do cliente.</p>'}
   </section>
   <section><h4>Informações do formulário</h4>
     \${c.formulario_em?\`
       <div class="linha"><span><b>Tempo de mercado:</b> \${esc(c.tempo_mercado)}</span></div>
       <div class="linha"><span><b>Atende:</b> \${esc(c.localizacoes)}</span></div>
       <div class="linha"><span><b>Faz:</b> \${esc(c.faz)}</span></div>
       <div class="linha"><span><b>NÃO faz:</b> \${esc(c.nao_faz)}</span></div>\`
       :'<p style="color:var(--cinza);font-size:12.5px">Aguardando o cliente responder.</p>'}
   </section>
   <section><h4>Contrato</h4>
     \${l_contrato(c)}
   </section>
   <section><h4>Gerar entregáveis</h4>
     <label>Quantidade de reviews</label><input type="number" id="g_qtd" value="20">
     <button class="acao" onclick="gerar()">Gerar site + reviews + Instagram</button>
     <p style="font-size:11.5px;color:var(--cinza);margin-top:6px">
       O site vai ao ar em \${base}/site/\${esc(c.slug)} na hora.</p></section>
   <section><h4>Entregáveis</h4>\${(c.entregaveis||[]).map(e=>\`<div class="linha">
     <select onchange="statusEnt(\${e.id},this.value)" style="width:auto;margin:0">
       \${['pendente','em_producao','entregue','aprovado'].map(s=>\`<option \${e.status===s?'selected':''}>\${s}</option>\`).join('')}
     </select><span><b>\${((D.entregaveis.find(y=>y[0]===e.tipo)||[])[1])||e.tipo}</b></span></div>\`).join('')}</section>
   <section><h4>Cadência de entrega — máximo 5 dias</h4>\${(c.marcos||[]).map(m=>\`<div class="linha \${m.concluido?'feito':''}">
     <input type="checkbox" \${m.concluido?'checked':''} onchange="marco(\${m.id},this.checked)">
     <span>\${esc(m.marco)} <small style="color:var(--cinza)">· dia \${m.prazo_dias}</small></span></div>\`).join('')}</section>
   <section><h4>Reviews (\${(c.reviews||[]).filter(r=>r.postada).length}/\${(c.reviews||[]).length} postadas)</h4>
     \${(c.reviews||[]).length?'<p style="font-size:12px;color:var(--cinza);margin-bottom:8px">Quem posta é o <b>cliente</b>. Ritmo: 3 por semana.</p>':''}
     \${(c.reviews||[]).slice(0,5).map(r=>\`<div class="rev"><small>
       <input type="checkbox" \${r.postada?'checked':''} onchange="revPost(\${r.id},this.checked)" style="width:auto">
       \${esc(r.servico)}</small>\${esc(r.texto)}</div>\`).join('')}
     \${(c.reviews||[]).length>5?\`<p style="font-size:12px;color:var(--cinza)">…e mais \${c.reviews.length-5} no arquivo.</p>\`:''}</section>
   <section><h4>Zona de risco</h4>
     <button class="acao" style="background:#c0392b" onclick="excluir('cliente',\${c.id},'\${esc(c.empresa)}')">Excluir este cliente</button>
     <p style="font-size:11.5px;color:var(--cinza);margin-top:6px">
       Apaga o cliente, entregáveis, reviews, posts, marcos e mídias. Não tem como desfazer.</p>
   </section>
   <section><h4>Instagram</h4>\${(c.posts||[]).map(x=>
     \`<div class="linha"><span><b>\${x.tipo==='destaque'?'★':x.ordem}</b> \${esc(x.titulo)}</span></div>\`).join('')
     ||'<p style="color:var(--cinza);font-size:12.5px">Gere os entregáveis.</p>'}</section>\`;
}

function irPara(s){
  setor=s;
  aba = s==='operacional' ? 'todos' : 'leads_novos';
  fechar();
  render();
}
const fechar=()=>{document.getElementById('painel').classList.remove('on');aberto=null};
const V=id=>document.getElementById(id).value;
async function criarLead(){const r=await post('/api/lead',{nome:V('l_nome'),telefone:V('l_tel'),empresa:V('l_emp'),nicho:V('l_nicho')});
  if(r.id){dlgLead.close();['l_nome','l_tel','l_emp','l_nicho'].forEach(i=>document.getElementById(i).value='');await carregar();abrirLead(r.id)}}
async function criarCliente(){const r=await post('/api/cliente',{nome_contato:V('c_nome'),empresa:V('c_emp'),
  nicho:V('c_nicho'),email:V('c_email'),valor_pago:V('c_valor')});
  if(r.id){dlgCli.close();['c_nome','c_emp','c_nicho','c_email','c_valor'].forEach(i=>document.getElementById(i).value='');
    setor='operacional';aba='todos';await carregar();abrirCliente(r.id)}}
const ativ=t=>post('/api/ativacao',{id:aberto,tipo:t}).then(()=>abrirLead(aberto));
const lig=a=>post('/api/ligacao',{id:aberto,atendeu:a}).then(carregar).then(()=>abrirLead(aberto));
const resp=()=>post('/api/respondeu',{id:aberto}).then(carregar).then(()=>abrirLead(aberto));
const qual=q=>post('/api/qualificar',{id:aberto,rapport:V('q_rapport'),budget:V('q_budget'),
  authority:V('q_authority'),need:V('q_need'),timeline:V('q_timeline'),qualificado:q}).then(()=>abrirLead(aberto));
async function agendar(){const v=V('q_quando');if(!v)return alert('Escolha data e hora');
  const r=await post('/api/agendar',{id:aberto,quando:new Date(v).toISOString()});
  if(r.erro)return alert(r.erro);await carregar();abrirLead(aberto)}
async function mv(col,pip){
  const r=await post('/api/mover',{id:aberto,coluna:col,pipeline:pip});
  if(r.aviso){alert(r.aviso);setor='operacional';aba='todos';await carregar();return abrirCliente(r.cliente_id)}
  await carregar();abrirLead(aberto);
}
async function salvarCliente(){await post('/api/cliente-editar',{id:aberto,nome_dono:V('e_nome_dono'),
  cidade:V('e_cidade'),estado:V('e_estado'),telefone:V('e_telefone'),servicos:V('e_servicos'),
  diferencial:V('e_diferencial'),observacoes:V('e_observacoes'),cor_primaria:V('e_cor_primaria'),
  cor_destaque:V('e_cor_destaque'),fotos_novas:V('e_fotos').split('\\n').map(s=>s.trim()).filter(Boolean)});
  await carregar();abrirCliente(aberto)}
async function gerar(){const r=await post('/api/gerar',{id:aberto,qtd_reviews:+V('g_qtd')});
  if(r.erro)return alert(r.erro);alert('Gerado: '+r.gerado.join(', ')+'\\n\\nSite: '+r.site_url);
  await carregar();abrirCliente(aberto)}
// bloco de contrato reaproveitado no painel do cliente
function l_contrato(c){
  const tcv=c.tipo_contrato==='TCV', mrr=c.tipo_contrato==='MRR';
  return \`<div class="nota" style="background:var(--op-claro);border-left-color:var(--op)">
    \${c.tipo_contrato?\`<b>\${esc(c.tipo_contrato)}</b> — \${tcv?'pagamento único':'mensalidade recorrente'}
      · \${esc(c.valor_contrato)||'valor não informado'}
      · \${c.duracao_meses||3} meses
      \${c.renovacao_automatica?' · renova automático':' · sem renovação automática'}
      \${c.servicos_extras?'<br><b>Extra:</b> '+esc(c.servicos_extras)+(c.valor_extras?' ('+esc(c.valor_extras)+')':''):''}\`
      :'Contrato não preenchido no comercial.'}
  </div>
  <label>Modelo</label>
  <select id="kc_tipo">
    <option value="">— não definido —</option>
    <option value="TCV" \${tcv?'selected':''}>TCV — pagamento único</option>
    <option value="MRR" \${mrr?'selected':''}>MRR — mensalidade</option>
  </select>
  <div style="display:flex;gap:8px">
    <div style="flex:1"><label>Valor</label><input id="kc_valor" value="\${esc(c.valor_contrato)}"></div>
    <div style="flex:1"><label>Duração (meses)</label><input type="number" id="kc_meses" value="\${c.duracao_meses||3}"></div>
  </div>
  <label><input type="checkbox" id="kc_auto" style="width:auto" \${c.renovacao_automatica?'checked':''}> Renovação automática</label>
  <label style="margin-top:9px">Serviço extra</label><input id="kc_extras" value="\${esc(c.servicos_extras)}">
  <label>Valor do extra</label><input id="kc_valor_extras" value="\${esc(c.valor_extras)}">
  <button class="acao" onclick="salvarContratoCliente()">Salvar contrato</button>\`;
}
const salvarContrato=()=>post('/api/contrato',{id:aberto,tipo_contrato:V('k_tipo'),
  valor_contrato:V('k_valor'),duracao_meses:V('k_meses'),
  renovacao_automatica:document.getElementById('k_auto').checked,
  servicos_extras:V('k_extras'),valor_extras:V('k_valor_extras')}).then(()=>abrirLead(aberto));
const salvarContratoCliente=()=>post('/api/contrato-cliente',{id:aberto,tipo_contrato:V('kc_tipo'),
  valor_contrato:V('kc_valor'),duracao_meses:V('kc_meses'),
  renovacao_automatica:document.getElementById('kc_auto').checked,
  servicos_extras:V('kc_extras'),valor_extras:V('kc_valor_extras')}).then(carregar).then(()=>abrirCliente(aberto));

async function excluir(tipo,id,nome){
  const digitado=prompt(
    'Isso apaga '+(tipo==='lead'?'o lead':'o cliente')+' "'+nome+'" e todo o histórico dele.\\n'+
    'Não tem como desfazer.\\n\\nPara confirmar, digite EXCLUIR:');
  if(digitado===null)return;
  if(digitado.trim()!=='EXCLUIR')return alert('Não apaguei nada — você precisa digitar EXCLUIR exatamente.');
  let r=await post('/api/excluir',{tipo,id,confirmacao:'EXCLUIR'});
  if(r.erro&&r.erro.includes('virou o cliente')){
    if(!confirm(r.erro+'\\n\\nApagar os dois?'))return;
    r=await post('/api/excluir',{tipo,id,confirmacao:'EXCLUIR',apagar_cliente_tambem:true});
  }
  if(r.erro)return alert(r.erro);
  alert('Apagado: '+r.apagado);
  fechar();await carregar();
}
const salvarResultado=()=>post('/api/resultado',{id:aberto,leads:+V('d_leads')}).then(carregar).then(()=>abrirCliente(aberto));
const salvarVercel=()=>post('/api/vercel-url',{id:aberto,url:V('d_vercel')}).then(carregar).then(()=>abrirCliente(aberto));
async function renovar(){if(!confirm('Renovar por mais 3 meses?'))return;
  await post('/api/renovar',{id:aberto});await carregar();abrirCliente(aberto)}
const liberar=(qual,v)=>post('/api/liberar-formulario',{id:aberto,[qual]:v}).then(carregar).then(()=>abrirCliente(aberto));
async function novoToken(){if(!confirm('Gerar link novo? O atual deixa de funcionar.'))return;
  await post('/api/novo-token-formulario',{id:aberto});await carregar();abrirCliente(aberto)}
const statusEnt=(eid,s)=>post('/api/entregavel',{eid,status:s}).then(carregar);
const marco=(mid,v)=>post('/api/marco',{mid,concluido:v}).then(()=>abrirCliente(aberto));
const revPost=(rid,v)=>post('/api/review-postada',{rid,postada:v}).then(()=>abrirCliente(aberto));
carregar();setInterval(()=>{if(!aberto)carregar()},60000);
</script></body></html>`;
