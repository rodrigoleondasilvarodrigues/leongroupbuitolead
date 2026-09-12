/* Persistência real em SQLite e resposta assíncrona da interface completa. */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { JSDOM, VirtualConsole } from 'jsdom';
import worker from '../src/index.js';
import { criarSessao } from '../src/auth.js';
import { ADMIN_HTML } from '../src/admin.js';
import { financeiroTotal } from '../src/funil.js';
let passou=0;
function t(nome,condicao){assert.ok(condicao,nome);passou++;console.log('  ok '+nome);}
const db=new DatabaseSync(':memory:');
db.exec(`CREATE TABLE config(chave TEXT PRIMARY KEY, valor TEXT);
 CREATE TABLE checklist(id INTEGER PRIMARY KEY,cliente_id INTEGER,feito INTEGER,feito_em TEXT);
 CREATE TABLE marcos(id INTEGER PRIMARY KEY,concluido INTEGER,concluido_em TEXT);
 INSERT INTO checklist VALUES(17,4,0,NULL),(4,17,0,NULL);
 INSERT INTO marcos VALUES(9,0,NULL);`);
const env={SESSAO_SEGREDO:crypto.randomUUID(),DB:{prepare(sql){
  let args=[];return {bind(...v){args=v;return this;},
    async first(){return db.prepare(sql).get(...args)||null;},
    async run(){const r=db.prepare(sql).run(...args);return {meta:{changes:r.changes}};}};
}}};
const sessao=await criarSessao(env);
async function enviar(rota,dados){return worker.fetch(new Request('https://crm.test'+rota,{
  method:'POST',headers:{Cookie:'leon_sessao='+sessao,'Content-Type':'application/json'},body:JSON.stringify(dados)
}),env,{});}
try{
  let r=await enviar('/api/checklist',{id:17,cid:4,feito:true});
  t('checklist confirmado pela API',(await r.json()).ok===true);
  const item=db.prepare('SELECT * FROM checklist WHERE id=17').get();
  t('item com ID diferente do cliente fica salvo',item.feito===1&&!!item.feito_em);
  t('par inverso de IDs não altera outro cliente',db.prepare('SELECT feito FROM checklist WHERE id=4').get().feito===0);
  await enviar('/api/checklist',{id:17,cid:4,feito:false});
  const desfeito=db.prepare('SELECT * FROM checklist WHERE id=17').get();
  t('desmarcar limpa feito e data',desfeito.feito===0&&desfeito.feito_em===null);
  r=await enviar('/api/checklist',{id:17,cid:99,feito:true});
  t('cliente incorreto não recebe falso sucesso',r.status===404&&!(await r.json()).ok);
  r=await enviar('/api/checklist',{id:999,cid:4,feito:true});
  t('item inexistente não recebe falso sucesso',r.status===404);
  r=await enviar('/api/marco',{mid:9,concluido:true});
  t('marco é salvo e confirmado',(await r.json()).ok===true&&db.prepare('SELECT concluido FROM marcos WHERE id=9').get().concluido===1);
  r=await enviar('/api/marco',{mid:999,concluido:true});
  t('marco inexistente não recebe falso sucesso',r.status===404);
}finally{db.close();}

const painel={clientes:[],leads:[],pipelines:{leads_novos:[],agendamento:[],recuperacao:[],nutricao:[]},
  entregaveis:[],ativacoes:{},kpis:{etapas:{whatsapp:0,ligacao_atendida:0,call_marcada:0,call_comparecida:0,call_fechada:0},alertas:[]}};
let resolver,rejeitar,ultimoEnvio,resolverDash,rejeitarDash,pedidosDash=0;
const animacoes=[],erros=[];
const preferencia={matches:false,addEventListener(tipo,fn){this.mudar=fn;}};
const virtualConsole=new VirtualConsole();
virtualConsole.on('jsdomError',e=>erros.push(String(e)));
const dom=new JSDOM(ADMIN_HTML,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://crm.test',virtualConsole,
  beforeParse(w){
    w.scrollTo=()=>{};w.matchMedia=()=>preferencia;
    w.Element.prototype.animate=function(quadros,opcoes){
      const a={alvo:this,quadros,opcoes,cancelado:false,cancel(){this.cancelado=true;this.oncancel?.();}};
      animacoes.push(a);return a;
    };
    w.fetch=(url,op)=>{
      if(url==='/api/painel')return Promise.resolve({json:async()=>painel});
      if(url==='/api/dashboard'){pedidosDash++;return new Promise((res,rej)=>{resolverDash=dados=>res({json:async()=>dados});rejeitarDash=rej;});}
      ultimoEnvio={url,body:JSON.parse(op.body)};
      return new Promise((res,rej)=>{resolver=dados=>res({json:async()=>dados});rejeitar=rej;});
    };
  }});
const w=dom.window,doc=w.document;
const turno=()=>new Promise(r=>setTimeout(r,0));
function montar(){
  w.eval("aberto=4;tipoAberto='cliente';");
  const p=doc.getElementById('painel');p.classList.add('on');
  p.innerHTML='<textarea id="rascunho">Observação ainda não salva</textarea><div class="chk-item"><input type="checkbox"><div><div class="t">Revisar perfil <span class="obg">*</span></div></div></div><div id="chk_res"></div><div class="chk-barra"><i id="chk_bar"></i></div><div class="linha" data-marco><input type="checkbox"><span>Entregar arquivos</span></div>';
  p.scrollTop=420;
  doc.getElementById('ui_conclusao')?.remove();
  return {p,el:p.querySelector('.chk-item input'),linha:p.querySelector('.chk-item')};
}
try{
  await turno();
  t('interface inicia sem erro',erros.length===0);
  t('primeira vista anima os indicadores',animacoes.some(a=>a.alvo.classList.contains('kpi')));
  let n=animacoes.length;await w.carregar();
  t('atualização de dados não repete entrada da tela',animacoes.length===n);
  doc.querySelectorAll('#abas button')[3].click();
  t('troca de aba anima o conteúdo',animacoes.length>n);
  t('aba atual fica identificada para tecnologia assistiva',doc.querySelector('#abas button[aria-current="page"]').textContent.includes('Agendamento'));
  let {p,el,linha}=montar();el.checked=true;
  let tarefa=w.chk(17,true,el);
  t('envia item e cliente corretos',ultimoEnvio.body.id===17&&ultimoEnvio.body.cid===4);
  t('aguarda servidor sem marcar classe de conclusão',el.disabled&&!linha.classList.contains('ok')&&!doc.getElementById('ui_conclusao'));
  resolver({ok:true});await tarefa;await turno();
  t('sucesso atualiza o mesmo item',el===p.querySelector('.chk-item input')&&linha.classList.contains('ok')&&!el.disabled);
  t('sucesso mantém rascunho e rolagem',p.scrollTop===420&&doc.getElementById('rascunho').value==='Observação ainda não salva');
  t('sucesso anuncia conclusão e anima retorno',!doc.getElementById('ui_conclusao').hidden&&animacoes.some(a=>a.alvo===linha));
  t('contador mostra só a conclusão confirmada',doc.getElementById('chk_res').textContent.includes('1 de 1'));
  doc.getElementById('ui_conclusao').remove();el.checked=false;n=animacoes.length;
  tarefa=w.chk(17,false,el);resolver({ok:true});await tarefa;await turno();
  t('desmarcar salva sem comemorar',!linha.classList.contains('ok')&&!doc.getElementById('ui_conclusao')&&animacoes.length===n);
  ({p,el,linha}=montar());el.checked=true;tarefa=w.chk(17,true,el);resolver({erro:'Item não encontrado'});await tarefa;
  t('erro JSON restaura checkbox sem falso verde',!el.checked&&!el.disabled&&!linha.classList.contains('ok')&&!doc.getElementById('ui_conclusao'));
  t('falha fica explicada na tela',doc.getElementById('aviso-falha').textContent==='Item não encontrado');
  el.checked=true;tarefa=w.chk(17,true,el);rejeitar(new Error('Sem conexão'));await tarefa;
  t('falha de rede também restaura estado',!el.checked&&!linha.classList.contains('ok')&&!doc.getElementById('ui_conclusao'));
  el.checked=true;tarefa=w.chk(17,true,el);w.eval('aberto=99');p.innerHTML='<p>Outro cliente</p>';resolver({ok:true});await tarefa;await turno();
  t('resposta atrasada não celebra no cliente seguinte',p.textContent==='Outro cliente'&&!doc.getElementById('ui_conclusao'));
  ({p,el,linha}=montar());el=p.querySelector('.linha input');el.checked=true;tarefa=w.marco(9,true,el);
  t('marco também aguarda confirmação',el.disabled&&!el.parentElement.classList.contains('feito'));
  resolver({ok:true});await tarefa;await turno();
  t('marco confirmado recebe estado concluído',el.parentElement.classList.contains('feito'));
  ({p}=montar());
  p.insertAdjacentHTML('beforeend','<div class="linha" data-marco><input type="checkbox"><span>Segundo marco</span></div><div><b id="trava_txt"></b></div>');
  const marcos=p.querySelectorAll('[data-marco] input');marcos[0].checked=true;marcos[1].checked=true;
  const primeiro=w.marco(9,true,marcos[0]),confirmarPrimeiro=resolver;
  const segundo=w.marco(10,true,marcos[1]),falharSegundo=resolver;
  confirmarPrimeiro({ok:true});await primeiro;await turno();
  t('marco pendente não entra no contador confirmado',doc.getElementById('trava_txt').textContent.includes('1 marco(s)'));
  falharSegundo({erro:'Falha ao salvar'});await segundo;
  t('marco com falha permanece pendente na contagem',!marcos[1].checked&&doc.getElementById('trava_txt').textContent.includes('1 marco(s)'));
  preferencia.matches=true;preferencia.mudar({matches:true});
  t('alterar preferência de movimento cancela animações ativas',animacoes.every(a=>a.cancelado));
  n=animacoes.length;doc.querySelectorAll('#abas button')[2].click();
  t('movimento reduzido mantém navegação sem animar',animacoes.length===n&&doc.querySelector('h1').textContent==='Leads novos');
  ({el,linha}=montar());el.checked=true;tarefa=w.chk(17,true,el);resolver({ok:true});await tarefa;await turno();
  t('movimento reduzido ainda informa sucesso',animacoes.length===n&&linha.classList.contains('ok')&&!doc.getElementById('ui_conclusao').hidden);
  w.eval('DASH=null;dashSujo=true');
  doc.querySelectorAll('#abas button')[0].click();doc.querySelectorAll('#abas button')[1].click();
  t('troca rápida de dashboard para caixa compartilha a busca',pedidosDash===1);
  resolverDash({etapas:{entraram:0},financeiro:financeiroTotal([],[],{valor:'5.4'},[])});await turno();await turno();
  t('resposta compartilhada desenha a última aba escolhida',doc.querySelector('h1').textContent==='Caixa'&&!!doc.querySelector('.cx-topo'));
  w.eval('DASH=null;dashSujo=true');doc.querySelectorAll('#abas button')[0].click();w.irPara('operacional');
  rejeitarDash(new Error('Falha atrasada'));await turno();await turno();
  t('erro de uma aba anterior não substitui o operacional',doc.querySelector('h1').textContent.startsWith('Entrega')&&!doc.getElementById('conteudo').textContent.includes('Falha atrasada'));
  t('nenhum erro durante os cenários',erros.length===0);
}finally{dom.window.close();}
console.log('\n'+passou+' passaram, 0 falharam');
