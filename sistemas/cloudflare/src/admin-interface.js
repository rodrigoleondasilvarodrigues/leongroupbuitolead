/* Movimento e apresentação. Não altera etapas, cálculos ou filtros. */
export const JS_INTERFACE = String.raw`
function uiIcone(nome){
  const formas={
    whatsapp:'<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 0 1 4 11.5a8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/>',
    ligacao_atendida:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1Z"/>',
    call_marcada:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 11h18m-12 5h2"/>',
    call_comparecida:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    call_fechada:'<path d="M8 3h8v5a4 4 0 0 1-8 0V3ZM8 5H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 1v6m-4 3h8m-7 0v-3h6v3"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
    check:'<path d="m5 12 4 4L19 6"/>'
  };
  return '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">'+(formas[nome]||formas.check)+'</svg>';
}
function uiIniciais(nome){
  const partes=String(nome||'').trim().split(/\s+/).filter(Boolean);
  return esc((partes[0]?.[0]||'')+(partes.length>1?partes[partes.length-1][0]:''));
}
function uiCabecalho(titulo,sub,acao){
  return '<div class="ui-view-head"><div><h1>'+esc(titulo)+'</h1>'
    +(sub?'<p>'+esc(sub)+'</p>':'')+'</div>'+(acao||'')+'</div>';
}
function uiReduzMovimento(){
  return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
const uiAnimacoes=new Set();
function uiAnimar(el,quadros,opcoes){
  if(!el||typeof el.animate!=='function'||uiReduzMovimento()) return null;
  const a=el.animate(quadros,opcoes); uiAnimacoes.add(a);
  a.onfinish=a.oncancel=()=>uiAnimacoes.delete(a);
  return a;
}
// A preferência também pode mudar enquanto o CRM está aberto.
window.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener?.('change',e=>{
  if(e.matches){uiAnimacoes.forEach(a=>a.cancel());uiAnimacoes.clear();}
});
let uiChaveVista='',uiPendente=null,uiNavAnterior=null,uiNavMudou=false;
function uiPrepararVista(chave){
  uiNavMudou=chave!==uiChaveVista;
  const nav=document.getElementById('abas'), ativo=nav.querySelector('.ui-nav-marker')||nav.querySelector('button.on');
  uiNavAnterior=ativo?{left:ativo.offsetLeft,width:ativo.offsetWidth}:null;
  if(uiNavMudou){uiChaveVista=chave;uiPendente=chave;}
}
function uiNavegacao(redimensionou){
  const nav=document.getElementById('abas'),ativo=nav.querySelector('button.on');
  if(!ativo)return;
  let marcador=nav.querySelector('.ui-nav-marker');
  if(!marcador){marcador=document.createElement('span');marcador.className='ui-nav-marker';marcador.setAttribute('aria-hidden','true');nav.appendChild(marcador);}
  const left=ativo.offsetLeft,width=ativo.offsetWidth;
  Object.assign(marcador.style,{left:left+'px',top:ativo.offsetTop+'px',width:width+'px',height:ativo.offsetHeight+'px'});
  nav.classList.add('ui-marker-on');
  nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-current',b===ativo?'page':'false'));
  if(!redimensionou&&uiNavMudou&&uiNavAnterior){
    uiAnimar(marcador,[{transform:'translateX('+(uiNavAnterior.left-left)+'px)',width:uiNavAnterior.width+'px'},{transform:'translateX(0)',width:width+'px'}],{duration:420,easing:'cubic-bezier(.22,1,.36,1)'});
  }
  if(!redimensionou&&uiNavMudou&&(left<nav.scrollLeft||left+width>nav.scrollLeft+nav.clientWidth))nav.scrollLeft=Math.max(0,left-5);
}
window.addEventListener('resize',()=>uiNavegacao(true));
function uiFimVista(chave){
  if(uiPendente!==chave||uiChaveVista!==chave)return;
  uiPendente=null;
  const grupos=document.querySelectorAll('#conteudo .ui-view-head,#conteudo .kpis>.kpi,#conteudo .col,#conteudo .cli,#conteudo .dash-overview,#conteudo .dash-insight,#conteudo .dash-money,#conteudo .cx-topo,#conteudo .cat-cx,#conteudo .ext,#conteudo .vazio');
  grupos.forEach((el,i)=>uiAnimar(el,[{opacity:.25,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],{duration:560,delay:Math.min(i*45,270),easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));
}
let uiAvisoTimer,uiAvisoAnimacao;
function uiConcluido(linha,el){
  let aviso=document.getElementById('ui_conclusao');
  if(!aviso){aviso=document.createElement('div');aviso.id='ui_conclusao';aviso.className='ui-completion';aviso.setAttribute('role','status');aviso.setAttribute('aria-live','polite');document.body.appendChild(aviso);}
  const descricao=linha.querySelector('.t')?.textContent||linha.querySelector('span')?.textContent||'Alteração salva';
  aviso.innerHTML='<div class="ui-confirm-icon">'+uiIcone('check')+'</div><div><b>Item concluído</b><span>'+esc(descricao.trim())+'</span></div>';
  aviso.hidden=false;clearTimeout(uiAvisoTimer);uiAvisoAnimacao?.cancel();
  uiAvisoAnimacao=uiAnimar(aviso,[{opacity:0,transform:'translateY(35px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,easing:'cubic-bezier(.22,1,.36,1)'});
  uiAnimar(linha,[{boxShadow:'0 0 0 3px #63AC82',background:'#C7EAD4'},{boxShadow:'0 0 0 0px transparent',background:'#E4F5E9'}],{duration:800,easing:'ease-out'});
  uiAnimar(el,[{transform:'scale(1)'},{transform:'scale(1.35)',offset:.4},{transform:'scale(1)'}],{duration:420,easing:'ease-out'});
  uiAvisoTimer=setTimeout(()=>{aviso.hidden=true;},3200);
}
async function uiSalvarConclusao(url,dados,el,seletor,classe,valor){
  const registro=aberto,linha=el?.closest(seletor);
  if(el)el.disabled=true;
  try{
    const r=await post(url,dados);
    if(r?.ok!==true)throw new Error(r?.erro||'Não foi possível salvar o item. Tente novamente.');
    if(linha?.isConnected&&aberto===registro){
      linha.classList.toggle(classe,valor);recontar();
      if(valor)uiConcluido(linha,el);
    }
    carregar();
  }catch(e){
    if(el?.isConnected){el.checked=!valor;recontar();}
    avisoFalha(e.message||'Sem conexão. O item não foi salvo.');
  }finally{if(el)el.disabled=false;}
}
let uiPedidoPainel=0,uiFocoAnterior=null;
function uiInicioPainel(tipo,id){
  const novo=aberto!==id||tipoAberto!==tipo||!document.getElementById('painel').classList.contains('on');
  if(novo)uiFocoAnterior=document.activeElement;
  return {novo,pedido:++uiPedidoPainel};
}
function uiFocoPainel(vista){
  if(vista.novo)document.querySelector('#painel .x')?.focus({preventScroll:true});
}
function uiFecharPainel(){
  uiPedidoPainel++;
  const destino=uiFocoAnterior?.isConnected?uiFocoAnterior:document.querySelector('#abas button.on');
  destino?.focus({preventScroll:true});
  uiFocoAnterior=null;
}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&document.getElementById('painel').classList.contains('on')&&!document.querySelector('dialog[open]')){fechar();return;}

  if((e.key==='Enter'||e.key===' ')&&e.target.matches('.card[role="button"],.cli[role="button"]')){
    e.preventDefault();e.target.click();
  }
});
`;
