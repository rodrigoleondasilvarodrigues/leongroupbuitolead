export const CSS_ASSISTENTE = `
.ai-abrir{border:1px solid #ffffff38;background:#ffffff12;color:#fff;border-radius:10px;padding:8px 13px;font:inherit;font-size:12px;cursor:pointer;white-space:nowrap}.ai-abrir:hover{background:#E65A19;border-color:#E65A19}
#ai_dialog{inset:0;margin:auto;width:min(1000px,calc(100vw - 28px));height:min(860px,92dvh);max-height:92dvh;padding:0;border:1px solid #d8cfc0;border-radius:22px;background:#FFFDF8;color:#171717;box-shadow:0 35px 110px #0005;overflow:hidden}
#ai_dialog{max-width:calc(100vw - 28px)}#ai_dialog::backdrop{background:#17171780;backdrop-filter:blur(6px)}
.ai-shell{height:100%;display:flex;flex-direction:column}.ai-top{display:flex;align-items:center;gap:13px;padding:19px 24px;background:#171717;color:#F7F3EA}.ai-emblema{display:grid;place-items:center;width:42px;height:42px;flex:none;border-radius:13px;background:#E65A19;font-size:22px}.ai-top h2{font-size:17px;letter-spacing:-.03em}.ai-top small{font-size:11px;color:#b8b1a6}.ai-top button{margin-left:auto;color:#F7F3EA;background:none;border:1px solid #ffffff30;border-radius:9px;padding:6px 12px;cursor:pointer;font:inherit}
.ai-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;border-bottom:1px solid #E9E1D6;padding:12px 24px;background:#F7F3EA}.ai-bar select{width:220px;max-width:100%;margin:0;font-size:12px}.ai-bar button,.ai-fontes button,.ai-copy,.ai-retry{font:inherit;font-size:11px;border:1px solid #ddd3c6;background:#FFFDF8;border-radius:8px;padding:6px 10px;cursor:pointer}.ai-bar button:hover,.ai-fontes button:hover{border-color:#E65A19;color:#C44712}.ai-contexto{margin-left:auto;font-size:11px;color:#68645E;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ai-conexao{padding:10px 24px;border-bottom:1px solid #E9E1D6;font-size:12px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}.ai-conexao span{flex:1;min-width:160px}.ai-conexao button{font:inherit;background:#171717;color:white;border:0;border-radius:7px;padding:7px 11px;cursor:pointer}.ai-conexao[data-ok="true"]{color:#2d6a4f;background:#f1f7f2}.ai-ajuda{font-size:12px;padding:8px 24px;background:#fff4e8}.ai-ajuda summary{cursor:pointer}.ai-ajuda code{display:block;margin:8px 0;user-select:all;font-size:11px;overflow-wrap:anywhere}
.ai-mensagens{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:24px;scroll-behavior:smooth}.ai-vazio{max-width:630px;margin:6% auto 0}.ai-vazio .ai-kicker{color:#C44712;text-transform:uppercase;font-size:10px;font-weight:700;letter-spacing:.13em}.ai-vazio h3{font-size:32px;line-height:1.13;letter-spacing:-.04em;margin:12px 0}.ai-vazio p{font-size:13px;color:#68645E;max-width:500px}.ai-sugestoes{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:23px}.ai-sugestoes button{background:#F7F3EA;text-align:left;border:1px solid #E9E1D6;border-radius:13px;padding:16px;font:inherit;font-size:12px;cursor:pointer;transition:transform .18s,border-color .18s}.ai-sugestoes button:hover{transform:translateY(-2px);border-color:#E65A19}.ai-sugestoes b{display:block;font-size:13px;margin-bottom:4px}
.ai-msg{max-width:800px;margin:0 auto 24px}.ai-msg-user{max-width:640px;margin-right:0;background:#F0E8DD;border:1px solid #E6DAC9;border-radius:16px 16px 4px 16px;padding:14px 18px}.ai-autor{font-size:10px;text-transform:uppercase;letter-spacing:.09em;font-weight:700;color:#C44712;margin-bottom:8px}.ai-texto{font-size:14px;line-height:1.8;white-space:pre-wrap;overflow-wrap:anywhere}.ai-texto strong{font-weight:650}.ai-texto code{font-size:12px;background:#F0E8DD;padding:2px 4px;border-radius:4px}.ai-fontes{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0 8px}.ai-copy{color:#68645E;margin-top:8px}.ai-erro{background:#fff0e8;color:#9e3612;border:1px solid #eccab9;border-radius:9px;padding:10px 12px;margin-top:10px;font-size:12px}.ai-retry{margin:8px 0 0;display:block;color:#9e3612}.ai-escrevendo{display:flex;gap:5px;align-items:center;color:#68645E;font-size:12px;min-height:26px}.ai-escrevendo i{width:6px;height:6px;border-radius:50%;background:#E65A19;animation:ai-pulso 1.2s infinite}.ai-escrevendo i:nth-child(2){animation-delay:.16s}.ai-escrevendo i:nth-child(3){animation-delay:.32s}
.ai-rodape{padding:14px 24px 17px;border-top:1px solid #E9E1D6;background:#FFFDF8}.ai-composer{border:1px solid #d6c9b7;border-radius:14px;background:#F7F3EA;padding:11px 12px}.ai-composer:focus-within{border-color:#E65A19;box-shadow:0 0 0 3px #E65A1910}.ai-composer textarea{resize:none;background:none;border:0;box-shadow:none;outline:0;min-height:52px;max-height:120px;padding:0;margin:0;font-size:13px}.ai-composer-bottom{display:flex;align-items:center;gap:8px}.ai-composer-bottom small{color:#827b71;font-size:10px;flex:1}.ai-composer button{font:inherit;font-size:12px;border:0;border-radius:9px;padding:9px 16px;background:#E65A19;color:#fff;cursor:pointer}.ai-composer button:disabled{opacity:.45;cursor:default}.ai-composer #ai_parar{background:#171717}.ai-nota{font-size:10px;color:#827b71;margin-top:9px}.ai-aviso{font-size:12px;color:#9e3612;margin-bottom:8px}.ai-entrada{animation:ai-entrada .24s ease-out}
@keyframes ai-pulso{0%,70%,100%{opacity:.25;transform:translateY(0)}35%{opacity:1;transform:translateY(-3px)}}@keyframes ai-entrada{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:650px){#ai_dialog{width:100vw;height:100dvh;max-height:100dvh;border:0;border-radius:0}.ai-top,.ai-bar,.ai-conexao,.ai-rodape{padding-left:16px;padding-right:16px}.ai-mensagens{padding:20px 16px}.ai-vazio h3{font-size:28px}.ai-sugestoes{grid-template-columns:1fr}.ai-contexto{max-width:100%;margin:0;width:100%}.ai-bar select{flex:1;width:150px}.ai-top small{font-size:10px}.ai-abrir{font-size:11px;padding:6px 8px}}
@media(prefers-reduced-motion:reduce){.ai-entrada,.ai-escrevendo i{animation:none}.ai-mensagens{scroll-behavior:auto}.ai-sugestoes button{transition:none}}
`;

export const HTML_ASSISTENTE = `<dialog id="ai_dialog" aria-labelledby="ai_titulo"><div class="ai-shell">
  <div class="ai-top"><div class="ai-emblema" aria-hidden="true">✦</div><div><h2 id="ai_titulo">Assistente Leon</h2><small>Clareza para decidir. Espaço para criar.</small></div><button onclick="aiFechar()" aria-label="Fechar assistente">Fechar</button></div>
  <div class="ai-bar"><select id="ai_historico" aria-label="Histórico de conversas" onchange="aiTrocar(this.value)"><option value="">Nova conversa</option></select><button onclick="aiNova()">+ Nova</button><button id="ai_usar_registro" onclick="aiUsarRegistro()">Usar card aberto</button><button onclick="aiGeral()">Visão geral</button><span class="ai-contexto" id="ai_contexto">Contexto: visão geral</span></div>
  <div class="ai-conexao" id="ai_conexao"><span id="ai_status" role="status">Verificando assistente neste Mac...</span><button id="ai_conectar" onclick="aiConectar()">Conectar</button><button onclick="aiVerificar()" aria-label="Verificar conexão">Verificar</button></div>
  <details class="ai-ajuda" id="ai_ajuda" hidden><summary>Como iniciar o assistente neste Mac</summary><p>Na pasta sistemas/cloudflare, abra o arquivo <b>Abrir Assistente Leon.command</b> ou execute no terminal:</p><code>npm run assistente</code><p>Mantenha o terminal aberto e o Claude Code conectado à sua assinatura. Depois clique em Verificar e Conectar. Se o navegador pedir acesso à rede local, permita para este CRM.</p></details>
  <div class="ai-mensagens" id="ai_mensagens" aria-label="Conversa com o assistente"></div>
  <div class="ai-rodape"><div class="ai-aviso" id="ai_aviso" role="status"></div><div class="ai-composer"><textarea id="ai_entrada" aria-label="Mensagem para o assistente" placeholder="Pergunte sobre o CRM ou desenvolva uma ideia..." maxlength="8000" rows="2"></textarea><div class="ai-composer-bottom"><small>Enter envia · Shift + Enter quebra a linha</small><button id="ai_parar" onclick="aiParar()" hidden>Interromper</button><button id="ai_enviar" onclick="aiEnviar()" disabled>Enviar ↗</button></div></div><p class="ai-nota">Claude pela sua assinatura · Histórico neste Mac · Dados do CRM enviados ao Claude a cada pergunta · Sem alteração de registros</p></div>
</div></dialog>`;

export const JS_ASSISTENTE = String.raw`
const AI_BASE='http://127.0.0.1:8811';
const AI={id:null,contexto:{tipo:'geral',id:null},turnos:[],busy:false,conectado:false,pareado:false,controller:null,popup:null,versao:0,retorno:null,pareamento:0};
function aiEl(id){return document.getElementById('ai_'+id);}
function aiStorage(k,v){try{if(v===undefined)return sessionStorage.getItem('leon-assistente-'+k)||'';sessionStorage.setItem('leon-assistente-'+k,v);}catch{}return '';}
function aiEsc(t){return String(t||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function aiMarkdown(t){return aiEsc(t).replace(/^#{1,4} (.+)$/gm,'<strong>$1</strong>').replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>');}
function aiDaTela(){return aberto&&['lead','cliente'].includes(tipoAberto)?{tipo:tipoAberto,id:Number(aberto)}:{tipo:'geral',id:null};}
function aiAviso(t){aiEl('aviso').textContent=t||'';}
function aiAtualizarControles(){
  aiEl('enviar').disabled=AI.busy||!AI.pareado||!AI.conectado;
  aiEl('parar').hidden=!AI.busy;
  aiEl('historico').disabled=AI.busy;
  aiEl('usar_registro').disabled=AI.busy||aiDaTela().tipo==='geral';
  aiEl('contexto').textContent=AI.contexto.tipo==='geral'?'Contexto: visão geral':'Contexto: '+AI.contexto.tipo+' #'+AI.contexto.id;
}
async function aiFetch(path,options={}){
  const r=await fetch(AI_BASE+'/api/assistente'+path,{...options,headers:{'Content-Type':'application/json',Authorization:'Bearer '+aiStorage('token'),...(options.headers||{})}});
  if(!r.ok){let d={};try{d=await r.json();}catch{}if(r.status===401){AI.pareado=false;aiAtualizarControles();aiEl('conectar').hidden=false;}throw Error(d.erro||'Não foi possível acessar o assistente.');}
  return r;
}
async function aiVerificar(){
  const v=AI.versao;aiEl('status').textContent='Verificando assistente neste Mac...';
  try{
    const c=new AbortController(),timer=setTimeout(()=>c.abort(),12000);let d;
    try{d=await (await aiFetch('/status',{signal:c.signal})).json();}finally{clearTimeout(timer);}
    if(v!==AI.versao)return;
    AI.conectado=!!d.conectado;AI.pareado=!!d.pareado;
    aiEl('status').textContent=d.conectado?(d.pareado?'Claude conectado neste Mac. Usa os limites da sua assinatura.':'Claude disponível. Conecte este navegador para começar.'):d.mensagem;
    aiEl('ajuda').hidden=!!d.conectado;aiEl('conectar').hidden=!!d.pareado;
    aiEl('conexao').dataset.ok=String(d.conectado&&d.pareado);
    if(AI.pareado){await aiHistorico();if(!AI.id&&aiStorage('conversa'))await aiTrocar(aiStorage('conversa'));}
  }catch(e){if(v!==AI.versao)return;AI.conectado=false;AI.pareado=false;aiEl('status').textContent='Inicie o Assistente Leon neste Mac para conversar.';aiEl('ajuda').hidden=false;aiEl('conectar').hidden=false;aiEl('conexao').dataset.ok='false';}
  aiAtualizarControles();
}
async function aiConectar(){
  const tentativa=++AI.pareamento;
  try{
    const d=await (await aiFetch('/conexao',{method:'POST',body:'{}'})).json();
    if(tentativa!==AI.pareamento)return;
    const url=AI_BASE+'/conectar?pedido='+encodeURIComponent(d.id);
    aiEl('aviso').innerHTML='Confirme a conexão na janela local. <a target="_blank" rel="noopener" href="'+aiEsc(url)+'">Abrir janela de conexão</a>';
    AI.popup=window.open(url,'leon-assistente-conectar','popup,width=610,height=600');
    for(let i=0;i<150&&tentativa===AI.pareamento;i++){
      await new Promise(r=>setTimeout(r,1800));
      if(tentativa!==AI.pareamento)return;
      const r=await (await aiFetch('/conexao/consultar',{method:'POST',body:JSON.stringify({id:d.id,verificador:d.verificador})})).json();
      if(r.token){aiReceberConexao(r.token);return;}
    }
    if(tentativa===AI.pareamento)aiAviso('Conexão expirada. Clique em Conectar novamente.');
  }catch(e){if(tentativa===AI.pareamento)aiAviso(e.message);}
}
function aiReceberConexao(token){
  if(!/^[a-f0-9]{64}$/.test(token||''))return;
  AI.pareamento++;aiStorage('token',token);AI.popup=null;aiAviso('');aiVerificar();
}
window.addEventListener('message',e=>{
  if(e.origin!==AI_BASE||!AI.popup||e.source!==AI.popup||e.data?.tipo!=='leon-assistente-conectado'||!/^[a-f0-9]{64}$/.test(e.data.token||''))return;
  aiReceberConexao(e.data.token);
});
function abrirAssistente(prefill){
  AI.retorno=document.activeElement;
  if(!AI.id)AI.contexto=aiDaTela();
  const d=aiEl('dialog');if(!d.open){if(d.showModal)d.showModal();else d.setAttribute('open','');d.classList.add('ai-entrada');}
  if(typeof prefill==='string')aiEl('entrada').value=prefill;
  aiRender();aiAtualizarControles();aiVerificar();aiEl('entrada').focus();
}
function aiFechar(){aiParar();const d=aiEl('dialog');if(d.close)d.close();else d.removeAttribute('open');if(AI.retorno?.isConnected)AI.retorno.focus();}
function aiParar(){AI.controller?.abort();}
function aiNova(){aiParar();AI.versao++;AI.id=null;AI.turnos=[];AI.busy=false;AI.contexto=aiDaTela();aiStorage('conversa','');aiEl('historico').value='';aiAviso('');aiRender();aiAtualizarControles();aiEl('entrada').focus();}
function aiUsarRegistro(){if(AI.busy)return;AI.contexto=aiDaTela();aiAtualizarControles();}
function aiGeral(){if(AI.busy)return;AI.contexto={tipo:'geral',id:null};aiAtualizarControles();}
async function aiHistorico(){
  const d=await (await aiFetch('/conversas')).json();
  aiEl('historico').innerHTML='<option value="">Nova conversa</option>'+d.conversas.map(c=>'<option value="'+aiEsc(c.id)+'">'+aiEsc(c.titulo)+'</option>').join('');
  aiEl('historico').value=AI.id||'';
}
async function aiTrocar(id){
  if(!id)return aiNova();
  aiParar();const v=++AI.versao;AI.busy=true;aiAtualizarControles();
  try{const d=await (await aiFetch('/conversas/'+encodeURIComponent(id))).json();if(v!==AI.versao)return;
    AI.id=d.id;AI.contexto=d.contexto;AI.turnos=d.turnos;aiStorage('conversa',d.id);aiEl('historico').value=d.id;
    aiAviso(d.total>100?'Exibindo as últimas 100 interações. O histórico completo continua salvo neste Mac.':'');aiRender();aiAtualizarControles();
  }catch(e){if(v!==AI.versao)return;aiAviso(e.message);aiStorage('conversa','');}
  finally{if(v===AI.versao){AI.busy=false;aiAtualizarControles();}}
}
function aiRender(){
  const box=aiEl('mensagens');
  if(!AI.turnos.length){box.innerHTML='<div class="ai-vazio ai-entrada"><span class="ai-kicker">Seu contexto, uma conversa</span><h3>O próximo passo<br>começa com clareza.</h3><p>Explore os números, prepare uma conversa ou transforme uma ideia em texto. O assistente acompanha o contexto que você escolher.</p><div class="ai-sugestoes"><button data-ai-prompt="Analise a situação atual do CRM e sugira três prioridades, explicando os dados por trás de cada uma."><b>Onde focar hoje</b>Prioridades apoiadas nos dados do CRM ↗</button><button data-ai-prompt="Analise os gargalos do funil e me ajude a preparar a próxima conversa comercial."><b>Avançar uma conversa</b>Gargalos, argumentos e preparação ↗</button><button data-ai-prompt="Revise a operação: quais entregas merecem atenção e o que está pendente?"><b>Cuidar das entregas</b>Prazos, pendências e próximos passos ↗</button><button data-ai-prompt="Quero desenvolver um texto para um cliente. Me ajude usando o contexto selecionado."><b>Escrever com contexto</b>Mensagens, ideias e textos para revisar ↗</button></div></div>';return;}
  box.innerHTML=AI.turnos.map((t,i)=>'<div class="ai-msg ai-msg-user"><div class="ai-autor">Você</div><div class="ai-texto">'+aiEsc(t.mensagem)+'</div></div><div class="ai-msg"><div class="ai-autor">✦ Assistente Leon</div><div class="ai-texto" id="ai_resposta_'+i+'">'+aiMarkdown(t.resposta)+'</div><div id="ai_meta_'+i+'">'+aiMeta(t,i)+'</div></div>').join('');
  box.scrollTop=box.scrollHeight;
}
function aiMeta(t,i){
  if(t.estado==='gerando')return '<div class="ai-escrevendo" role="status"><i></i><i></i><i></i> Claude está respondendo...</div>';
  let h=t.estado==='concluida'?'<div class="ai-fontes">'+(t.fontes||[]).map((f,n)=>'<button data-ai-fonte="'+i+':'+n+'">'+aiEsc(f.titulo)+' ↗</button>').join('')+'</div>':'<div class="ai-erro">'+aiEsc(t.erro||'Resposta interrompida.')+'<button class="ai-retry" data-ai-retry="'+i+'">Tentar novamente</button></div>';
  if(t.resposta)h+='<button class="ai-copy" data-ai-copy="'+i+'">Copiar '+(t.estado==='concluida'?'resposta':'trecho')+'</button>';
  return h;
}
function aiAtualizarResposta(t,i){
  const box=aiEl('mensagens'),perto=box.scrollHeight-box.scrollTop-box.clientHeight<130;
  const el=document.getElementById('ai_resposta_'+i);if(el)el.innerHTML=aiMarkdown(t.resposta);
  const meta=document.getElementById('ai_meta_'+i);if(meta)meta.innerHTML=aiMeta(t,i);
  if(perto)box.scrollTop=box.scrollHeight;
}
async function aiLerStream(r,evento){
  const reader=r.body.getReader(),decoder=new TextDecoder();let buffer='';
  try{while(true){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true}).replace(/\r\n/g,'\n');let p;
    while((p=buffer.indexOf('\n\n'))>=0){const bloco=buffer.slice(0,p);buffer=buffer.slice(p+2);let tipo='',dados=[];for(const l of bloco.split('\n')){if(l.startsWith('event:'))tipo=l.slice(6).trim();if(l.startsWith('data:'))dados.push(l.slice(5).trim());}if(tipo&&dados.length)evento(tipo,JSON.parse(dados.join('\n')));}
  }}finally{reader.releaseLock();}
}
async function aiEnviar(repetir){
  if(AI.busy||!AI.pareado||!AI.conectado)return;
  const mensagem=repetir?repetir.mensagem:aiEl('entrada').value.trim();if(!mensagem)return;
  const contexto=repetir?JSON.parse(repetir.contexto):{...AI.contexto};
  const t=repetir||{mensagem,resposta:'',estado:'gerando',request_id:crypto.randomUUID(),contexto:JSON.stringify(contexto),fontes:[]};
  t.estado='gerando';t.resposta='';t.erro=null;
  if(!repetir){AI.turnos.push(t);aiEl('entrada').value='';}
  const i=AI.turnos.indexOf(t),v=AI.versao,ctrl=new AbortController();AI.controller=ctrl;AI.busy=true;aiAviso('');aiRender();aiAtualizarControles();
  try{
    if(!AI.id){const c=await (await aiFetch('/conversas',{method:'POST',body:JSON.stringify({contexto}),signal:ctrl.signal})).json();if(v!==AI.versao)return;AI.id=c.id;aiStorage('conversa',c.id);}
    const cr=await fetch('/api/assistente/contexto',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contexto}),signal:ctrl.signal});
    let pacote;try{pacote=await cr.json();}catch{throw Error('Não foi possível consultar o CRM. Entre novamente e tente de novo.');}
    if(!cr.ok||pacote.erro)throw Error(pacote.erro||'Não foi possível atualizar o contexto do CRM.');
    const r=await aiFetch('/conversas/'+AI.id+'/mensagens',{method:'POST',body:JSON.stringify({mensagem,contexto,pacote,request_id:t.request_id}),signal:ctrl.signal});
    let terminou=false;
    await aiLerStream(r,(tipo,d)=>{if(v!==AI.versao)return;if(tipo==='delta')t.resposta+=d.texto;
      if(tipo==='concluida'){t.resposta=d.texto;t.fontes=d.fontes;t.estado='concluida';terminou=true;}
      if(tipo==='erro'){t.estado='erro';t.erro=d.erro;terminou=true;}
      aiAtualizarResposta(t,i);
    });
    if(!terminou)throw Error('A conexão terminou antes da resposta. Tente novamente.');
  }catch(e){if(v!==AI.versao)return;t.estado=ctrl.signal.aborted?'interrompida':'erro';t.erro=ctrl.signal.aborted?'Resposta interrompida. Você pode tentar novamente.':e.message;aiAtualizarResposta(t,i);}
  finally{if(v===AI.versao){AI.busy=false;AI.controller=null;aiAtualizarControles();aiHistorico().catch(()=>{});}}
}
aiEl('dialog').addEventListener('cancel',e=>{e.preventDefault();aiFechar();});
aiEl('entrada').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();aiEnviar();}});
aiEl('mensagens').addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.aiPrompt){aiEl('entrada').value=b.dataset.aiPrompt;aiEl('entrada').focus();}
  if(b.dataset.aiRetry!==undefined)aiEnviar(AI.turnos[Number(b.dataset.aiRetry)]);
  if(b.dataset.aiCopy!==undefined){try{await navigator.clipboard.writeText(AI.turnos[Number(b.dataset.aiCopy)].resposta);b.textContent='Copiado';}catch{aiAviso('Não foi possível copiar automaticamente. Selecione o texto da resposta.');}}
  if(b.dataset.aiFonte){const [i,n]=b.dataset.aiFonte.split(':').map(Number),f=AI.turnos[i]?.fontes?.[n];if(!f)return;aiFechar();if(f.tipo==='lead')abrirLead(f.id);else if(f.tipo==='cliente')abrirCliente(f.id);else if(f.tipo==='operacional')irPara('operacional');else{irPara('comercial');aba='dashboard';pintar();render();}}
});
`;
