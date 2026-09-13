import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import http from 'node:http';
import worker from '../src/index.js';
import { criarSessao } from '../src/auth.js';
import { criarServidorAssistente } from '../src-local/assistente-servidor.mjs';
import { executarClaude } from '../src-local/claude-transporte.mjs';
let passou=0;
function t(nome,ok){assert.ok(ok,nome);passou++;console.log('  ok '+nome);}
const db=new DatabaseSync(':memory:');
// A coluna contrato_token é adicionada pela migração 13. O schema histórico
// já declara seu índice, por isso a aplicação inicial adia esse único índice.
db.exec(readFileSync(new URL('../schema.sql',import.meta.url),'utf8').replace(/CREATE INDEX IF NOT EXISTS ix_cli_ctoken[\s\S]*?;/,''));
db.exec("ALTER TABLE clientes ADD COLUMN custos_moeda TEXT");
db.exec(`INSERT INTO leads(id,nome,empresa,telefone,email,criado_em,entrou_coluna_em,atualizado_em,observacoes) VALUES(1,'Pessoa Teste','Empresa Teste','SEGREDO_TELEFONE','SEGREDO_EMAIL','2026-09-01','2026-09-01','2026-09-01','Dado de exemplo');
INSERT INTO clientes(id,empresa,slug,nome_contato,formulario_token,site_html,data_entrada,criado_em,atualizado_em,entrega_forcada,entrega_iniciada_em) VALUES(1,'Cliente Teste','teste-ia','Pessoa','SEGREDO_TOKEN','SEGREDO_HTML','2026-09-01','2026-09-01','2026-09-01',1,'2026-09-01T12:00:00Z');
INSERT INTO marcos(cliente_id,marco,prazo_dias,concluido,criado_em) VALUES(1,'Primeira entrega',1,0,'2026-09-01');
INSERT INTO checklist(cliente_id,area,item,obrigatorio,feito,ordem,criado_em) VALUES(1,'Google','Revisar',1,0,1,'2026-09-01');
INSERT INTO entregaveis(cliente_id,tipo,status,atualizado_em) VALUES(1,'site','pendente','2026-09-01');`);
const consultas=[];
const D={prepare(sql){consultas.push(sql);let valores=[];return{bind(...v){valores=v;return this;},async first(){return db.prepare(sql).get(...valores)||null;},async all(){return{results:db.prepare(sql).all(...valores)};},async run(){throw Error('Escrita proibida no teste de contexto');}};},async batch(q){return Promise.all(q.map(s=>s.all()));}};
const env={DB:D,SESSAO_SEGREDO:crypto.randomUUID()};
const sessao=await criarSessao(env);
async function api(path,body,auth=true){return worker.fetch(new Request('https://crm.test'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(auth?{Cookie:'leon_sessao='+sessao}:{})},...(body?{body:JSON.stringify(body)}:{})}),env,{});}
try{
  let r=await api('/api/assistente/contexto',{contexto:{tipo:'geral'}},false);
  t('contexto exige sessão do CRM',r.status===401||r.status===302);
  r=await api('/api/assistente/contexto',{contexto:{tipo:'sql',id:'DROP TABLE clientes'}});
  t('não aceita contexto arbitrário',r.status===400);
  r=await api('/api/assistente/contexto',{contexto:{tipo:'lead',id:1}});
  const pacote=await r.json();
  t('contexto é produzido pela API autenticada',r.status===200&&pacote.dados.registro.empresa==='Empresa Teste');
  t('projeção exclui campos sensíveis',!JSON.stringify(pacote).includes('SEGREDO_'));
  t('cobertura e instante são explícitos',pacote.dados.cobertura.leads_ativos===1&&!!pacote.dados.atualizado_em);
  const dash=await (await api('/api/dashboard')).json();
  t('financeiro reutiliza os números do dashboard',JSON.stringify(dash.financeiro.entrou)===JSON.stringify(pacote.dados.financeiro.entrou));
  t('conclusão antecipada não é todas as tarefas feitas',pacote.dados.clientes[0].entrega_completa&&!pacote.dados.clientes[0].portao_cumprido&&pacote.dados.clientes[0].checklist_feitos===0);
  r=await api('/api/assistente/contexto',{contexto:{tipo:'cliente',id:1}});
  const detalhe=await r.json();
  t('cliente selecionado inclui as pendências',detalhe.dados.registro.checklist[0].item==='Revisar'&&detalhe.dados.registro.marcos[0].concluido===0);
  t('cliente tem financeiro individual sem lançamentos brutos',detalhe.dados.registro.financeiro.entrou.usd===0&&!('entradas' in detalhe.dados.registro.financeiro));
  t('registros de teste ficam identificados',detalhe.dados.clientes[0].registro_teste===1&&detalhe.dados.registro.registro_teste===1);
  r=await api('/api/assistente/contexto',{contexto:{tipo:'cliente',id:999}});
  t('registro ausente é informado',r.status===404);
  t('contexto executou apenas SELECT',consultas.every(q=>/^\s*SELECT\b/i.test(q)));
}finally{db.close();}

const dir=mkdtempSync(join(tmpdir(),'leon-assistente-test-'));
let chamadas=0,prompt='',modo='ok',abortou=false,liberar;
const executar=async o=>{
  chamadas++;prompt=o.prompt;
  o.onDelta('Olá, ');
  if(modo==='erro')throw Error('Falha de teste');
  if(modo==='esperar')await new Promise((resolve,reject)=>{liberar=resolve;o.signal.addEventListener('abort',()=>{abortou=true;reject(Error('Cancelado'));},{once:true});});
  return{texto:'Olá, resposta real do transporte de teste.'};
};
let app=criarServidorAssistente({diretorio:dir,executar,status:async()=>({conectado:true,motor:'Claude Code'})});
await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
let base='http://127.0.0.1:'+app.server.address().port;
const origin='http://127.0.0.1:8810';
let token='';
async function local(path,body,op={}){return fetch(base+path,{method:body?'POST':'GET',headers:{Origin:origin,'Content-Type':'application/json',Authorization:'Bearer '+token,...op.headers},...(body?{body:JSON.stringify(body)}:{}),...(op.signal?{signal:op.signal}:{})});}
const packet={dados:{atualizado_em:new Date().toISOString(),contexto:{tipo:'geral',id:null},leads:[]},fontes:[{tipo:'dashboard',titulo:'Funil',id:null},{tipo:'url',titulo:'Ataque',id:1}]};
const mensagem=(texto='Primeira pergunta')=>({request_id:crypto.randomUUID(),mensagem:texto,contexto:{tipo:'geral',id:null},pacote:packet});
try{
  let r=await local('/api/assistente/conversas');
  t('histórico não abre sem pareamento',r.status===401);
  r=await local('/api/assistente/status',null,{headers:{Origin:'https://malicioso.test'}});
  t('origem externa é bloqueada',r.status===403);
  const hostStatus=await new Promise((resolve,reject)=>{http.get(base+'/api/assistente/status',{headers:{Host:'malicioso.test'}},r=>{r.resume();resolve(r.statusCode);}).on('error',reject);});
  t('host incorreto é bloqueado',hostStatus===403);
  r=await fetch(base+'/api/assistente/status',{method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Method':'POST'}});
  t('preflight permite apenas o CRM autorizado',r.status===204&&r.headers.get('Access-Control-Allow-Origin')===origin);
  const html=await (await fetch(base+'/conectar?origem='+encodeURIComponent(origin))).text();
  const nonce=html.match(/nonce:'([a-f0-9]{64})'/)[1];
  r=await local('/parear',{nonce});
  t('CRM não pode confirmar seu próprio pareamento',r.status===403);
  r=await local('/parear',{nonce},{headers:{Origin:base}});
  token=(await r.json()).token;t('pareamento local emite acesso temporário',token.length===64);
  r=await local('/parear',{nonce},{headers:{Origin:base}});
  t('pareamento é de uso único',r.status===403);
  const desafio=await (await local('/api/assistente/conexao',{})).json();
  t('conexão independente cria desafio sem autenticar CRM',desafio.id.length===64&&desafio.verificador.length===64);
  r=await local('/api/assistente/conexao/consultar',{...desafio,verificador:'incorreto'});
  t('consulta do pareamento exige verificador secreto',r.status===403);
  r=await local('/api/assistente/conexao/consultar',desafio);
  t('pedido ainda não confirmado permanece pendente',(await r.json()).pendente===true);
  const pagina=await (await fetch(base+'/conectar?pedido='+desafio.id)).text();
  t('janela sem opener pode confirmar o pedido',pagina.includes('!window.opener&&!true'));
  const nonceIndependente=pagina.match(/nonce:'([a-f0-9]{64})'/)[1];
  await local('/parear',{nonce:nonceIndependente},{headers:{Origin:base}});
  r=await local('/api/assistente/conexao/consultar',desafio,{headers:{Origin:'http://localhost:8787'}});
  t('outro CRM não recebe credencial do pedido',r.status===403);
  r=await local('/api/assistente/conexao/consultar',desafio);
  const aprovado=await r.json();
  t('confirmação independente entrega a credencial à aba original',aprovado.token.length===64);
  r=await local('/api/assistente/conexao/consultar',desafio);
  t('credencial do pareamento é entregue uma única vez',r.status===403);
  const conversa=await (await local('/api/assistente/conversas',{contexto:{tipo:'geral'}})).json();
  const path='/api/assistente/conversas/'+conversa.id;
  const primeiro=mensagem();
  r=await local(path+'/mensagens',primeiro);const stream=await r.text();
  t('resposta transmite deltas e conclusão',stream.includes('event: delta')&&stream.includes('event: concluida'));
  t('fontes arbitrárias são excluídas',!stream.includes('Ataque'));
  r=await local(path+'/mensagens',primeiro);await r.text();
  t('repetir pedido concluído não chama modelo novamente',chamadas===1);
  r=await local(path+'/mensagens',{...primeiro,mensagem:'Pedido diferente'});
  t('ID reaproveitado com outro texto é rejeitado',r.status===409);
  r=await local(path+'/mensagens',mensagem('Continue de onde parou'));await r.text();
  t('segunda mensagem recebe histórico completo da primeira',JSON.parse(prompt).historico[0].usuario==='Primeira pergunta');
  t('transporte recebe somente pacote, histórico e pedido',Object.keys(JSON.parse(prompt)).length===4);
  let salvo=await (await local(path)).json();
  t('histórico persiste e não duplica primeira mensagem',salvo.turnos.length===2&&salvo.turnos[0].estado==='concluida');
  modo='erro';const falhou=mensagem('Uma falha');
  r=await local(path+'/mensagens',falhou);const errorStream=await r.text();
  t('falha após delta não vira conclusão',errorStream.includes('event: erro')&&!errorStream.includes('event: concluida'));
  modo='ok';r=await local(path+'/mensagens',falhou);await r.text();
  salvo=await (await local(path)).json();
  t('tentar novamente usa o mesmo turno',salvo.turnos.length===3&&salvo.turnos[2].estado==='concluida');
  modo='esperar';const ctrl=new AbortController();
  r=await local(path+'/mensagens',mensagem('Interromper'),{signal:ctrl.signal});
  await r.body.getReader().read();
  let concorrente=await local(path+'/mensagens',mensagem('Concorrente'));
  t('trava de conversa impede geração concorrente',concorrente.status===409);
  ctrl.abort();
  for(let i=0;i<30&&!abortou;i++)await new Promise(r=>setTimeout(r,10));
  t('desconectar navegador cancela transporte',abortou);
  for(let i=0;i<30;i++){salvo=await (await local(path)).json();if(salvo.turnos.at(-1).estado==='interrompida')break;await new Promise(r=>setTimeout(r,10));}
  t('interrupção conserva trecho e estado honesto',salvo.turnos.at(-1).estado==='interrompida'&&salvo.turnos.at(-1).resposta==='Olá, ');
  t('histórico tem permissão restrita no Mac',(statSync(join(dir,'assistente.sqlite')).mode&0o777)===0o600);
  await app.fechar();
  app=criarServidorAssistente({diretorio:dir,executar,status:async()=>({conectado:true})});
  await new Promise(r=>app.server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+app.server.address().port;
  r=await local('/api/assistente/conversas');
  t('reinício invalida pareamentos antigos',r.status===401);
  const check=new DatabaseSync(join(dir,'assistente.sqlite'));
  t('reinício conserva histórico no disco',check.prepare('SELECT COUNT(*) n FROM turnos').get().n===4);check.close();
  // Executável controlado valida os argumentos e a condição de sucesso do CLI.
  const bin=join(dir,'claude-falso.mjs');
  writeFileSync(bin,`#!/usr/bin/env node
const a=process.argv.slice(2);process.stdin.resume();process.stdin.on('end',()=>{
if(!a.includes('--safe-mode')||a[a.indexOf('--tools')+1]!==''||!a.includes('--no-session-persistence'))process.exit(8);
console.log(JSON.stringify({type:'stream_event',event:{delta:{type:'text_delta',text:'Conexão '}}}));
console.log(JSON.stringify({type:'result',is_error:false,result:'Conexão confirmada'}));
});`,{mode:0o700});
  let delta='';
  const result=await executarClaude({binary:bin,prompt:'Teste',onDelta:s=>delta+=s});
  t('CLI roda sem ferramentas com streaming verdadeiro',result.texto==='Conexão confirmada'&&delta==='Conexão ');
  writeFileSync(bin,"#!/usr/bin/env node\nprocess.stdin.resume();process.stdin.on('end',()=>console.log(JSON.stringify({type:'result',is_error:true,result:'Não concluído'})));",{mode:0o700});
  await assert.rejects(()=>executarClaude({binary:bin,prompt:'Teste'}));
  t('resultado de erro do CLI nunca é sucesso',true);
}finally{liberar?.();await app.fechar();rmSync(dir,{recursive:true,force:true});}
console.log('\n'+passou+' passaram, 0 falharam');
