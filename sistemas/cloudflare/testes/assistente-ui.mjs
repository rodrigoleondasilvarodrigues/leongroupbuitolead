/* Interface completa, transporte local e comportamento assíncrono do assistente. */
import assert from 'node:assert/strict';
import { JSDOM, VirtualConsole } from 'jsdom';
import { ADMIN_HTML } from '../src/admin.js';

const BASE='http://127.0.0.1:8811/api/assistente';
const painel={clientes:[],leads:[],pipelines:{leads_novos:[],agendamento:[],recuperacao:[],nutricao:[]},
  entregaveis:[],ativacoes:{},kpis:{etapas:{whatsapp:0,ligacao_atendida:0,call_marcada:0,call_comparecida:0,call_fechada:0},alertas:[]}};
let passou=0;
const falhas=[];
function t(nome,condicao){assert.ok(condicao,nome);passou++;console.log('  ok '+nome);}
const turno=()=>new Promise(r=>setTimeout(r,0));
async function ate(condicao){for(let n=0;n<40;n++){if(condicao())return;await turno();}throw Error('A condição assíncrona não foi alcançada.');}
const json=(dados,status=200)=>new Response(JSON.stringify(dados),{status,headers:{'Content-Type':'application/json'}});
function adiar(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};}
function canal(signal){
  let ctrl,terminou=false;
  const body=new ReadableStream({start(c){ctrl=c;}});
  signal?.addEventListener('abort',()=>{if(!terminou){terminou=true;ctrl.error(new DOMException('Interrompido','AbortError'));}},{once:true});
  return {
    resposta:new Response(body,{headers:{'Content-Type':'text/event-stream'}}),
    bytes(texto,fragmentado=false){if(terminou)return;const bytes=new TextEncoder().encode(texto);if(fragmentado){for(const byte of bytes)ctrl.enqueue(Uint8Array.of(byte));}else ctrl.enqueue(bytes);},
    evento(tipo,dados,fragmentado=false){this.bytes('event: '+tipo+'\ndata: '+JSON.stringify(dados)+'\n\n',fragmentado);},
    fechar(){if(!terminou){terminou=true;ctrl.close();}}
  };
}
function respostaFinal(texto='Resposta pronta.',fontes=[]){const c=canal();c.evento('concluida',{texto,fontes});c.fechar();return c.resposta;}

async function navegador(opcoes={}){
  const chamadas=[],erros=[],copias=[],conversas=new Map();
  const estado={offline:false,status:{conectado:true,pareado:true},
    contexto:{dados:{resumo:'Dados consultados no CRM'},fontes:[]},contextoStatus:200,
    mensagem:()=>respostaFinal(),detalhe:null,popup:null,...opcoes};
  const consoleVirtual=new VirtualConsole();consoleVirtual.on('jsdomError',e=>erros.push(String(e)));
  const dom=new JSDOM(ADMIN_HTML,{url:'https://crm.test',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:consoleVirtual,
    beforeParse(w){
      w.scrollTo=()=>{};w.matchMedia=()=>({matches:true,addEventListener(){}});
      w.TextDecoder=TextDecoder;w.AbortController=AbortController;
      w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
      w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
      Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async texto=>{copias.push(texto);}}});
      w.open=(...args)=>{estado.popupArgs=args;return estado.popup;};
      w.fetch=async(url,options={})=>{
        const registro={url:String(url),method:options.method||'GET',options,body:options.body?JSON.parse(options.body):null};chamadas.push(registro);
        if(url==='/api/painel')return json(painel);
        if(url==='/api/assistente/contexto')return json(estado.contexto,estado.contextoStatus);
        if(String(url).startsWith(BASE)&&estado.offline)throw Error('Servidor local indisponível');
        if(url===BASE+'/status')return json(estado.status);
        if(url===BASE+'/conexao')return json({id:'a'.repeat(64),verificador:'b'.repeat(64)});
        if(url===BASE+'/conexao/consultar')return json(estado.tokenPolling?{token:estado.tokenPolling}:{pendente:true});
        if(url===BASE+'/conversas'&&registro.method==='GET')return json({conversas:[...conversas.values()].map(c=>({id:c.id,titulo:c.titulo||c.id}))});
        if(url===BASE+'/conversas'&&registro.method==='POST'){
          const c={id:'conversa-'+(conversas.size+1),contexto:registro.body.contexto,turnos:[],total:0};conversas.set(c.id,c);return json(c);
        }
        if(String(url).endsWith('/mensagens'))return estado.mensagem(registro);
        if(String(url).startsWith(BASE+'/conversas/')){
          const id=decodeURIComponent(String(url).slice((BASE+'/conversas/').length));
          if(estado.detalhe)return estado.detalhe(id,registro);
          return conversas.has(id)?json(conversas.get(id)):json({erro:'Conversa não encontrada.'},404);
        }
        throw Error('Pedido inesperado no teste: '+url);
      };
    }});
  await turno();
  const w=dom.window,doc=w.document;
  return {w,doc,estado,chamadas,erros,copias,conversas,el:id=>doc.getElementById('ai_'+id),
    geracoes:()=>chamadas.filter(c=>c.url.endsWith('/mensagens')),
    async abrir(texto){w.abrirAssistente(texto);await ate(()=>!doc.getElementById('ai_status').textContent.includes('Verificando'));await turno();},
    fechar:()=>dom.window.close()};
}
async function caso(nome,fn,opcoes){const h=await navegador(opcoes);try{await fn(h);}catch(e){falhas.push(nome+': '+e.message);console.error('  FALHOU '+nome+': '+e.message);}finally{h.fechar();}}

await caso('abrir, contexto e teclado',async h=>{
  const {w,doc,el}=h;
  t('HTML integrado inicia sem erro de script',h.erros.length===0);
  w.eval("aberto=27;tipoAberto='cliente';");
  await h.abrir('Prepare uma mensagem para o cliente.');
  t('abrir mostra diálogo e foca o campo',el('dialog').open&&doc.activeElement===el('entrada'));
  t('abrir com pedido preenche sem gerar inferência',el('entrada').value==='Prepare uma mensagem para o cliente.'&&h.geracoes().length===0);
  t('contexto começa no cliente aberto',el('contexto').textContent.includes('cliente #27'));
  t('status explica assinatura sem solicitar chave de API',el('status').textContent.includes('assinatura')&&!el('dialog').querySelector('input[type=password]'));
  const sugestao=el('mensagens').querySelector('[data-ai-prompt]');sugestao.click();
  t('sugestões apenas preparam o texto',el('entrada').value===sugestao.dataset.aiPrompt&&h.geracoes().length===0);
  const ime=new w.KeyboardEvent('keydown',{key:'Enter',isComposing:true,bubbles:true,cancelable:true});el('entrada').dispatchEvent(ime);await turno();
  t('Enter durante composição IME não envia',!ime.defaultPrevented&&h.geracoes().length===0);
  const quebra=new w.KeyboardEvent('keydown',{key:'Enter',shiftKey:true,bubbles:true,cancelable:true});el('entrada').dispatchEvent(quebra);await turno();
  t('Shift + Enter preserva quebra de linha',!quebra.defaultPrevented&&h.geracoes().length===0);
  const enter=new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true});el('entrada').dispatchEvent(enter);await ate(()=>h.geracoes().length===1);await ate(()=>el('parar').hidden);
  t('Enter normal envia uma única vez',enter.defaultPrevented&&h.geracoes().length===1);
  const consulta=h.chamadas.find(c=>c.url==='/api/assistente/contexto'),geracao=h.geracoes()[0];
  t('consulta somente IDs do contexto, sem dados inteiros do navegador',JSON.stringify(consulta.body.contexto)===JSON.stringify({tipo:'cliente',id:27}));
  t('consulta autenticada no CRM precede a geração local',h.chamadas.indexOf(consulta)<h.chamadas.indexOf(geracao)&&consulta.method==='POST');
  t('geração recebe o pacote consultado no servidor',JSON.stringify(geracao.body.pacote)===JSON.stringify(h.estado.contexto));
  t('assistente não grava registros comerciais ou operacionais',h.chamadas.filter(c=>c.method==='POST'&&c.url.startsWith('/api/')&&c.url!=='/api/assistente/contexto').length===0);
  t('conversa fica selecionada para retomar no Mac',w.sessionStorage.getItem('leon-assistente-conversa')==='conversa-1');
});

await caso('assistente offline',async h=>{
  await h.abrir();
  t('offline explica como iniciar a ponte no Mac',h.el('status').textContent.includes('Inicie o Assistente Leon neste Mac'));
  t('offline deixa ajuda disponível e envio desativado',!h.el('ajuda').hidden&&h.el('enviar').disabled&&h.el('ajuda').textContent.includes('npm run assistente'));
  h.el('entrada').value='Teste';await h.w.aiEnviar();
  t('offline não finge uma resposta nem gera requisição de inferência',h.geracoes().length===0&&!h.el('mensagens').querySelector('.ai-msg'));
},{offline:true});

await caso('streaming, HTML seguro e cópia',async h=>{
  let stream;h.estado.mensagem=req=>{stream=canal(req.options.signal);return stream.resposta;};
  await h.abrir();h.el('entrada').value='<img src=x onerror="window.invasao=1"> Analise.';
  const tarefa=h.w.aiEnviar();await ate(()=>!!stream);
  t('geração desativa envio e exibe interrupção',h.el('enviar').disabled&&!h.el('parar').hidden);
  stream.evento('delta',{texto:'Olá, São Luís. **Prioridade**: '},true);
  await ate(()=>h.doc.getElementById('ai_resposta_0').textContent.includes('São Luís'));
  t('UTF-8 fragmentado aparece progressivamente antes do final',h.doc.getElementById('ai_resposta_0').textContent.includes('Olá, São Luís.')&&!h.el('parar').hidden);
  const ataque='<img src=x onerror="window.invasao=1">\n<script>window.invasao=2</script>\n<a href="javascript:alert(1)">link</a>';
  const texto='# Plano\n**Prioridade**: '+ataque;
  stream.evento('concluida',{texto,fontes:[{tipo:'lead',id:42,titulo:'Lead <img src=x>'}]});stream.fechar();await tarefa;
  t('HTML de mensagens e respostas aparece como texto inofensivo',!h.el('mensagens').querySelector('img,script,a')&&h.w.invasao===undefined&&h.el('mensagens').textContent.includes('<img src=x'));
  t('títulos e negrito seguros continuam formatados',h.doc.getElementById('ai_resposta_0').querySelectorAll('strong').length===2);
  t('final remove indicador de escrita e reativa envio',h.el('parar').hidden&&!h.el('enviar').disabled&&!h.el('mensagens').querySelector('.ai-escrevendo'));
  h.el('mensagens').querySelector('[data-ai-copy]').click();await turno();
  t('copiar preserva o texto integral da resposta',h.copias[0]===texto&&h.el('mensagens').querySelector('[data-ai-copy]').textContent==='Copiado');
  let fonte;h.w.abrirLead=id=>{fonte=id;};h.el('mensagens').querySelector('[data-ai-fonte]').click();
  t('fonte abre o registro pela navegação nativa e fecha assistente',fonte===42&&!h.el('dialog').open);
});

await caso('falha do contexto não envia dados ao modelo',async h=>{
  await h.abrir();h.estado.contextoStatus=401;h.estado.contexto={erro:'Sessão expirada. Entre novamente.'};h.el('entrada').value='Qual o próximo passo?';await h.w.aiEnviar();
  t('erro autenticado do CRM impede geração local',h.geracoes().length===0);
  t('erro da consulta permite tentar de novo sem perder pergunta',h.el('mensagens').textContent.includes('Sessão expirada')&&h.el('mensagens').querySelector('[data-ai-retry]')&&h.el('mensagens').querySelectorAll('.ai-msg-user').length===1);
});

await caso('erro e repetição idempotente',async h=>{
  let numero=0;h.estado.mensagem=()=>{numero++;return numero===1?json({erro:'Claude indisponível agora.'},503):respostaFinal('Funcionou na repetição.');};
  await h.abrir();h.el('entrada').value='Sugira uma prioridade.';await h.w.aiEnviar();
  t('erro HTTP é explicado e retira estado de geração',h.el('mensagens').textContent.includes('Claude indisponível agora.')&&h.el('parar').hidden&&!h.el('enviar').disabled);
  const primeiro=h.geracoes()[0];h.el('mensagens').querySelector('[data-ai-retry]').click();await ate(()=>h.geracoes().length===2);await ate(()=>h.el('mensagens').textContent.includes('Funcionou na repetição.'));
  t('repetir conserva request_id para não duplicar turno',h.geracoes()[1].body.request_id===primeiro.body.request_id);
  t('repetir mantém uma pergunta e uma resposta na tela',h.el('mensagens').querySelectorAll('.ai-msg-user').length===1&&h.el('mensagens').querySelectorAll('[id^=ai_resposta_]').length===1);
  t('repetir consulta dados atuais antes da nova tentativa',h.chamadas.filter(c=>c.url==='/api/assistente/contexto').length===2);
});

await caso('erro SSE e stream incompleto',async h=>{
  h.estado.mensagem=()=>{const c=canal();c.evento('delta',{texto:'Trecho parcial.'});c.evento('erro',{erro:'Limite da assinatura atingido.'});c.fechar();return c.resposta;};
  await h.abrir();h.el('entrada').value='Escreva um texto.';await h.w.aiEnviar();
  t('erro SSE preserva trecho sem anunciar sucesso',h.el('mensagens').textContent.includes('Trecho parcial.')&&h.el('mensagens').textContent.includes('Limite da assinatura atingido.')&&h.el('mensagens').querySelector('[data-ai-retry]'));
  h.w.aiNova();h.estado.mensagem=()=>{const c=canal();c.evento('delta',{texto:'Sem evento final.'});c.fechar();return c.resposta;};h.el('entrada').value='Outra pergunta';await h.w.aiEnviar();
  t('fim inesperado de stream é erro recuperável',h.el('mensagens').textContent.includes('conexão terminou antes da resposta')&&h.el('parar').hidden);
});

await caso('cancelamento e conversa nova',async h=>{
  let stream;h.estado.mensagem=req=>{stream=canal(req.options.signal);return stream.resposta;};
  await h.abrir();h.el('entrada').value='Faça uma análise longa';let tarefa=h.w.aiEnviar();await ate(()=>!!stream);stream.evento('delta',{texto:'Primeiro trecho.'});await ate(()=>h.el('mensagens').textContent.includes('Primeiro trecho.'));
  h.el('parar').click();await tarefa;
  t('interromper aborta transporte e preserva trecho',h.geracoes()[0].options.signal.aborted&&h.el('mensagens').textContent.includes('Primeiro trecho.')&&h.el('mensagens').textContent.includes('Resposta interrompida'));
  t('interrupção libera campo e oferece tentativa',!h.el('enviar').disabled&&h.el('parar').hidden&&h.el('mensagens').querySelector('[data-ai-retry]'));
  stream=null;h.w.aiNova();h.el('entrada').value='Outra análise';tarefa=h.w.aiEnviar();await ate(()=>!!stream);h.w.aiNova();await tarefa;
  t('nova conversa aborta stream sem contaminar tela vazia',h.geracoes().at(-1).options.signal.aborted&&h.el('mensagens').querySelector('.ai-vazio')&&!h.el('mensagens').querySelector('.ai-erro'));
  t('nova conversa limpa seleção persistida',h.w.sessionStorage.getItem('leon-assistente-conversa')==='');
});

await caso('troca de conversa em carregamento',async h=>{
  const antiga={id:'antiga',contexto:{tipo:'lead',id:9},turnos:[{mensagem:'Pergunta antiga',resposta:'Resposta antiga',estado:'concluida',fontes:[]}],total:1};
  const nova={id:'nova',contexto:{tipo:'cliente',id:12},turnos:[{mensagem:'Pergunta nova',resposta:'Resposta nova',estado:'concluida',fontes:[]}],total:1};
  h.conversas.set('antiga',antiga);h.conversas.set('nova',nova);await h.abrir();await h.w.aiTrocar('antiga');
  const espera=adiar();h.estado.detalhe=id=>id==='nova'?espera.promise:json(antiga);
  const troca=h.w.aiTrocar('nova');h.el('entrada').value='Não misture conversas';
  t('carregar conversa bloqueia envio até conhecer seu ID',h.el('enviar').disabled);
  await h.w.aiEnviar();t('envio durante carregamento não usa conversa anterior',h.geracoes().length===0);
  espera.resolve(json(nova));await troca;
  t('troca restaura histórico e contexto correspondentes',h.el('mensagens').textContent.includes('Resposta nova')&&!h.el('mensagens').textContent.includes('Resposta antiga')&&h.el('contexto').textContent.includes('cliente #12'));
  t('conversa carregada libera envio e persiste seleção',!h.el('enviar').disabled&&h.w.sessionStorage.getItem('leon-assistente-conversa')==='nova');
  const atrasada=adiar();h.estado.detalhe=id=>id==='antiga'?atrasada.promise:json(nova);const primeiro=h.w.aiTrocar('antiga');await h.w.aiTrocar('nova');atrasada.resolve(json(antiga));await primeiro;
  t('resposta tardia do histórico não substitui última escolha',h.el('mensagens').textContent.includes('Resposta nova')&&h.w.sessionStorage.getItem('leon-assistente-conversa')==='nova');
});

await caso('pareamento exige origem, janela e token válidos',async h=>{
  const {w,el}=h;await h.abrir();w.aiConectar();await ate(()=>!!h.estado.popupArgs);
  t('janela bloqueada recebe link para conexão independente',!!el('aviso').querySelector('a[href*="/conectar?pedido="]'));
  const popup={closed:false},token=crypto.randomBytes?crypto.randomBytes(32).toString('hex'):Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
  h.estado.popup=popup;h.estado.popupArgs=null;w.aiConectar();await ate(()=>!!h.estado.popupArgs);const tipo='leon-assistente-conectado';
  w.dispatchEvent(new w.MessageEvent('message',{origin:'https://malicioso.test',source:popup,data:{tipo,token}}));
  w.dispatchEvent(new w.MessageEvent('message',{origin:'http://127.0.0.1:8811',source:{},data:{tipo,token}}));
  w.dispatchEvent(new w.MessageEvent('message',{origin:'http://127.0.0.1:8811',source:popup,data:{tipo,token:'inválido'}}));
  t('pareamento ignora origem, janela e formato inválidos',!w.sessionStorage.getItem('leon-assistente-token'));
  w.dispatchEvent(new w.MessageEvent('message',{origin:'http://127.0.0.1:8811',source:popup,data:{tipo,token}}));await turno();
  t('pareamento aceito fica apenas na sessão do navegador',w.sessionStorage.getItem('leon-assistente-token')===token&&!w.localStorage.getItem('leon-assistente-token'));
  const pedido=h.chamadas.filter(c=>c.url===BASE+'/status').at(-1);
  t('pedidos locais autenticam com token de pareamento',pedido.options.headers.Authorization==='Bearer '+token);
},{status:{conectado:true,pareado:false}});

if(falhas.length){console.error('\n'+falhas.join('\n'));process.exitCode=1;}
console.log('\n'+passou+' asserções do assistente na interface, '+falhas.length+' falhas.');
