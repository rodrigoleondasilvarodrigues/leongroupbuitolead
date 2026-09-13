import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import http from 'node:http';
import { criarServidorAssistente } from '../src-local/assistente-servidor.mjs';
import { executarClaude } from '../src-local/claude-transporte.mjs';

let passou = 0;
function t(nome, ok) { assert.ok(ok, nome); passou++; console.log('  ok ' + nome); }
function espera() { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; }
const turno = () => new Promise(r => setImmediate(r));
const origin = 'http://127.0.0.1:8810';
const dir = mkdtempSync(join(tmpdir(), 'leon-concorrencia-'));
let statusFn = async () => ({ conectado: true }), chamadas = 0, ultimoPrompt;
const app = criarServidorAssistente({ diretorio: dir, status: () => statusFn(), executar: async o => {
  chamadas++; ultimoPrompt = JSON.parse(o.prompt); o.onDelta('Resposta confirmada.');
  return { texto: 'Resposta confirmada.' };
} });
await new Promise(r => app.server.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + app.server.address().port;
let token;
async function local(path, dados) {
  return fetch(base + path, { method: dados ? 'POST' : 'GET', headers: {
    Origin: origin, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json',
  }, ...(dados ? { body: JSON.stringify(dados) } : {}) });
}
async function conversa() {
  return '/api/assistente/conversas/' + (await (await local('/api/assistente/conversas', { contexto: { tipo: 'geral' } })).json()).id;
}
const pedido = mensagem => ({ request_id: randomUUID(), mensagem: mensagem || 'Analise o CRM.', contexto: { tipo: 'geral', id: null },
  pacote: { dados: { atualizado_em: new Date().toISOString() }, fontes: [] } });

try {
  const html = await (await fetch(base + '/conectar?origem=' + encodeURIComponent(origin))).text();
  const nonce = html.match(/nonce:'([a-f0-9]{64})'/)[1];
  token = (await (await fetch(base + '/parear', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: JSON.stringify({ nonce }) })).json()).token;

  // A conexão fecha enquanto o status do Claude ainda está pendente.
  const path = await conversa(), login = espera(), consultou = espera(), fechou = espera();
  statusFn = () => { consultou.resolve(); return login.promise; };
  const observar = (req, res) => { if (req.url === path + '/mensagens') res.once('close', fechou.resolve); };
  app.server.on('request', observar);
  const abandonado = http.request(base + path + '/mensagens', { method: 'POST', headers: {
    Origin: origin, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json',
  } });
  abandonado.on('error', () => {});
  abandonado.end(JSON.stringify(pedido()));
  await consultou.promise;
  abandonado.destroy();
  await fechou.promise;
  login.resolve({ conectado: true });
  await turno(); await turno();
  app.server.off('request', observar);
  t('desconexão durante autenticação não inicia Claude', chamadas === 0);
  let salvo = await (await local(path)).json();
  t('pedido abandonado antes da geração não grava turno', salvo.turnos.length === 0);

  // Dois envios podem consultar o login antes que o primeiro adquira a trava.
  const gates = [espera(), espera()], chamados = [espera(), espera()]; let n = 0;
  statusFn = () => { const i = n++; chamados[i].resolve(); return gates[i].promise; };
  const igual = pedido();
  const primeiro = local(path + '/mensagens', igual);
  await chamados[0].promise;
  const segundo = local(path + '/mensagens', igual);
  await chamados[1].promise;
  gates[0].resolve({ conectado: true });
  const a = await (await primeiro).text();
  gates[1].resolve({ conectado: true });
  const b = await (await segundo).text();
  t('revalidação após login reaproveita resposta concluída', chamadas === 1 && a.includes('event: concluida') && b.includes('event: concluida'));
  salvo = await (await local(path)).json();
  t('repetição concorrente não duplica nem sobrescreve o turno', salvo.turnos.length === 1 && salvo.turnos[0].estado === 'concluida');

  const gates2 = [espera(), espera()], chamados2 = [espera(), espera()]; n = 0;
  statusFn = () => { const i = n++; chamados2[i].resolve(); return gates2[i].promise; };
  const original = pedido('Texto original');
  const p1 = local(path + '/mensagens', original); await chamados2[0].promise;
  const p2 = local(path + '/mensagens', { ...original, mensagem: 'Outro texto' }); await chamados2[1].promise;
  gates2[0].resolve({ conectado: true }); await (await p1).text();
  gates2[1].resolve({ conectado: true });
  t('revalidação rejeita ID agora associado a outro texto', (await p2).status === 409 && chamadas === 2);

  statusFn = async () => ({ conectado: true });
  const sql = new DatabaseSync(join(dir, 'assistente.sqlite'));
  try {
    sql.exec("CREATE TRIGGER falha_gravacao BEFORE INSERT ON turnos BEGIN SELECT RAISE(FAIL,'CAMINHO_PRIVADO_DO_BANCO'); END;");
    const novo = pedido('Gravar depois de uma falha');
    let r = await local(path + '/mensagens', novo);
    const erro = await r.text();
    t('falha na gravação retorna erro sem expor detalhes internos', r.status === 500 && !erro.includes('CAMINHO_PRIVADO'));
    sql.exec('DROP TRIGGER falha_gravacao;');
    r = await local(path + '/mensagens', novo);
    t('falha na gravação sempre libera a trava da conversa', r.status === 200 && (await r.text()).includes('event: concluida'));
  } finally { sql.close(); }

  // Divide propositalmente o byte inicial de ç do resto do caractere.
  const unicode = pedido('Ação concluída no Paraná 🦁'), bytes = Buffer.from(JSON.stringify(unicode));
  const corte = bytes.indexOf(Buffer.from('ç')) + 1;
  const utf8 = await new Promise((resolve, reject) => {
    const req = http.request(base + path + '/mensagens', { method: 'POST', headers: {
      Origin: origin, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json',
    } }, res => { let texto = ''; res.setEncoding('utf8'); res.on('data', s => { texto += s; }); res.on('end', () => resolve(texto)); });
    req.on('error', reject); req.write(bytes.subarray(0, corte));
    setTimeout(() => req.end(bytes.subarray(corte)), 15);
  });
  t('UTF-8 dividido entre chunks chega intacto ao modelo', utf8.includes('event: concluida') && ultimoPrompt.pedido_atual === unicode.mensagem);
  salvo = await (await local(path)).json();
  t('acentos e emoji permanecem intactos no histórico', salvo.turnos.at(-1).mensagem === unicode.mensagem);

  const bin = join(dir, 'claude-controlado.mjs');
  function cli(codigo) { writeFileSync(bin, '#!/usr/bin/env node\nprocess.stdin.resume();process.stdin.on("end",()=>{' + codigo + '});', { mode: 0o700 }); }
  cli('process.stderr.write("DETALHE_PRIVADO_DA_CONTA");console.log(JSON.stringify({type:"result",is_error:true,result:"DETALHE_PRIVADO_DA_CONTA"}));');
  let erroCli;
  try { await executarClaude({ binary: bin, prompt: 'Teste' }); } catch (e) { erroCli = e; }
  t('erro bruto do CLI não é enviado à interface', erroCli?.publica === true && !erroCli.message.includes('DETALHE_PRIVADO'));
  cli('console.log(JSON.stringify({type:"result",is_error:false,result:42}));');
  await assert.rejects(() => executarClaude({ binary: bin, prompt: 'Teste' }));
  t('resultado malformado do CLI é erro controlado', true);
  cli('console.log(JSON.stringify({type:"result",is_error:false,result:"a".repeat(120001)}));');
  await assert.rejects(() => executarClaude({ binary: bin, prompt: 'Teste' }));
  t('resposta longa não é truncada com falso sucesso', true);
  cli('console.log(JSON.stringify({type:"stream_event",event:{delta:{type:"text_delta",text:"Oi"}}}));setInterval(()=>{},1000);');
  await assert.rejects(() => executarClaude({ binary: bin, prompt: 'Teste', onDelta() { throw Error('DETALHE_PRIVADO_DA_UI'); } }));
  t('falha ao entregar delta cancela CLI sem derrubar servidor', true);
} finally {
  await app.fechar();
  rmSync(dir, { recursive: true, force: true });
}
console.log('\n' + passou + ' passaram, 0 falharam');
