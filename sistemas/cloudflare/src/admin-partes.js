/* ═══════════ SEÇÕES NOVAS DO CARD DO CLIENTE ═══════════
   Três blocos que entram no painel do cliente:

   1. PORTÃO DE CONCLUSÃO — a resposta explícita para "o que falta para este
      cliente sair de EM ENTREGA", que antes era uma conta invisível
      espalhada por três seções diferentes. Mais o botão de fechar antes do
      prazo, com a frase digitada.

   2. LOGO — o briefing que o cliente deu e o prompt JSON do gpt-image-2
      montado a partir dele, pronto para copiar.

   3. PEÇAS E ARQUIVOS — onde a peça PRONTA é guardada, na ordem do fluxo de
      trabalho: logo primeiro, porque ela entra nas outras três.

   Arquivo separado de `admin.js` pelo mesmo motivo do dashboard: aquele já é
   um HTML de mil linhas dentro de uma template string.                     */

export const CSS_PARTES = `
/* ── portão de conclusão ── */
.portao{border:1px solid var(--areia);border-radius:9px;overflow:hidden;background:var(--branco)}
.portao-cab{padding:13px 15px;background:var(--marfim);border-bottom:1px solid var(--areia)}
.portao-cab b{font-size:14px;display:block}
.portao-cab span{font-size:12px;color:var(--cinza)}
.portao.pronto .portao-cab{background:#e5f0e9;border-bottom-color:#bcd9c8}
.portao.pronto .portao-cab b{color:var(--verde)}
.portao.forcada .portao-cab{background:var(--laranja-pal);border-bottom-color:#e8bfa9}
.portao.forcada .portao-cab b{color:var(--laranja-esc)}
.pg{display:grid;grid-template-columns:22px 1fr auto;gap:10px;align-items:start;
  padding:11px 15px;border-bottom:1px solid #f4efe6;font-size:12.5px}
.pg:last-child{border-bottom:0}
.pg-ic{width:19px;height:19px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:11px;font-weight:800;background:var(--areia);color:var(--cinza);margin-top:1px}
.pg.ok .pg-ic{background:#e5f0e9;color:var(--verde)}
.pg.falta .pg-ic{background:#fbe9e2;color:var(--laranja-esc)}
.pg.solto .pg-ic{background:var(--marfim);color:#b9b2a6}
.pg b{display:block;font-size:13px}
.pg .onde{color:var(--cinza);font-size:11.5px;margin-top:2px}
.pg .porque{color:var(--cinza);font-size:11.5px;margin-top:4px;line-height:1.45}
.pg .abertos{margin-top:4px;font-size:11.5px;color:var(--laranja-esc)}
.pg-n{font:700 13px/1 ui-monospace,monospace;white-space:nowrap;margin-top:3px}
.pg.ok .pg-n{color:var(--verde)}
.pg.falta .pg-n{color:var(--laranja-esc)}
.pg.solto .pg-n{color:var(--cinza)}
.pg .selo-solto{font-size:9.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;
  background:var(--areia);color:var(--cinza);padding:2px 6px;border-radius:3px;margin-left:6px}
.forcada-nota{background:var(--laranja-pal);border-left:3px solid var(--laranja);
  padding:11px 14px;border-radius:0 5px 5px 0;font-size:12.5px;margin-top:11px;line-height:1.5}
.forcada-nota b{display:block;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;
  color:var(--laranja-esc);margin-bottom:4px}
/* ── logo ── */
.pr-cx{position:relative}
.pr-txt{width:100%;min-height:190px;font:11.5px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;
  background:var(--preto);color:#d9d4cb;border:0;border-radius:8px;padding:14px;resize:vertical}
.pr-copiar{position:absolute;top:9px;right:9px}
.falta-brief{background:var(--laranja-pal);border-left:3px solid var(--laranja);padding:10px 13px;
  border-radius:0 5px 5px 0;font-size:12px;margin-bottom:10px;line-height:1.5}
/* ── peças e arquivos ── */
.peca{border:1px solid var(--areia);border-radius:9px;margin-bottom:9px;background:var(--branco);
  overflow:hidden}
.peca>summary{padding:12px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;
  font-size:13px;list-style:none}
.peca>summary::-webkit-details-marker{display:none}
.peca>summary::before{content:'▸';color:var(--cinza);font-size:11px;flex:none;transition:.15s}
.peca[open]>summary::before{transform:rotate(90deg)}
.peca[open]>summary{border-bottom:1px solid var(--areia);background:var(--marfim)}
.peca-dia{font:700 9.5px/1 inherit;letter-spacing:.09em;text-transform:uppercase;
  background:var(--op-claro);color:var(--op);padding:3px 7px;border-radius:3px;flex:none}
.peca-rot{font-weight:600;flex:1}
.peca-n{font:700 11.5px/1 ui-monospace,monospace;color:var(--cinza)}
.peca.ok>summary .peca-n{color:var(--verde)}
.peca.ok .peca-dia{background:#e5f0e9;color:var(--verde)}
.peca-corpo{padding:12px 14px}
.peca-nota{font-size:11.5px;color:var(--cinza);line-height:1.5;margin-bottom:12px}
.slot{border-top:1px solid #f4efe6;padding:12px 0}
.slot:first-child{border-top:0;padding-top:0}
.slot-cab{display:flex;align-items:baseline;gap:8px;margin-bottom:3px}
.slot-cab b{font-size:12.5px}
.slot-cab .est{font:700 10.5px/1 ui-monospace,monospace;margin-left:auto;white-space:nowrap}
.slot.ok .est{color:var(--verde)}
.slot.falta .est{color:var(--laranja-esc)}
.slot-dica{font-size:11.5px;color:var(--cinza);line-height:1.45;margin-bottom:9px}
.slot-bt{display:inline-block;background:var(--branco);border:1px solid var(--areia);border-radius:5px;
  padding:7px 13px;font-size:12px;cursor:pointer;font-weight:600}
.slot-bt:hover{border-color:var(--laranja);background:var(--laranja-pal)}
.slot input[type=file]{position:absolute;width:1px;height:1px;opacity:0}
.mini{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:5px;margin-top:9px}
.mn{position:relative;aspect-ratio:1;border-radius:5px;overflow:hidden;border:1px solid var(--areia);
  background:var(--marfim)}
.mn img{width:100%;height:100%;object-fit:cover;display:block}
.mn .nao-img{display:flex;align-items:center;justify-content:center;height:100%;font-size:9.5px;
  color:var(--cinza);padding:4px;text-align:center;word-break:break-all;line-height:1.25}
.mn .x{position:absolute;top:2px;right:2px;width:19px;height:19px;border-radius:50%;
  background:rgba(23,23,23,.75);color:#fff;border:0;font-size:13px;line-height:1;padding:0;
  cursor:pointer;display:flex;align-items:center;justify-content:center}
.mn .x:hover{background:#c0392b}
.mn.subindo{opacity:.45}
.mn .pc{position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--laranja);width:0}
/* ── contrato ── */
.ct-ok{background:#e5f0e9;border:1px solid #bcd9c8;border-left:3px solid var(--verde);
  border-radius:0 7px 7px 0;padding:11px 14px;margin-bottom:10px}
.ct-ok b{display:block;font-size:12.5px;color:var(--verde);margin-bottom:3px}
.ct-ok span{font-size:11.5px;color:var(--cinza);line-height:1.5;display:block}
.ct-dados{background:var(--marfim);border:1px solid var(--areia);border-radius:7px;
  padding:11px 14px;margin-top:11px}
.ct-dados b{display:block;font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;
  color:var(--cinza);margin-bottom:4px}
.ct-dados span{font-size:12.5px;line-height:1.55;display:block}
.ct-legal{background:var(--laranja-pal);border-left:3px solid var(--laranja-esc);
  border-radius:0 5px 5px 0;padding:10px 13px;margin-top:12px;font-size:11.5px;
  line-height:1.5}
.ct-legal b{display:block;font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;
  color:var(--laranja-esc);margin-bottom:4px}
.ct-legal code{font:11px ui-monospace,monospace;background:var(--branco);
  padding:1px 4px;border-radius:3px}
/* ── entradas: o dinheiro que caiu na conta ── */
.ent-topo{display:grid;grid-template-columns:1fr 1fr;gap:12px;background:var(--preto);
  color:var(--marfim);border-radius:9px;padding:15px 17px;margin-bottom:12px}
.ent-topo .r{font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:#8a8580;
  font-weight:700;margin-bottom:3px}
.ent-topo .v{font-size:22px;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums;
  line-height:1.15}
.ent-topo .usd .v{color:#fff}
.ent-topo .brl .v{color:var(--laranja)}
.ent-topo .s{font-size:11px;color:#8a8580;margin-top:4px;line-height:1.4}
.ent-topo .full{grid-column:1/-1;border-top:1px solid #2b2b2b;padding-top:11px;font-size:11.5px;
  color:#8a8580;line-height:1.5}
.ent-topo .full b{color:#c9c4bb}
.ent-l{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:start;
  padding:10px 0;border-bottom:1px solid #f4efe6;font-size:12.5px}
.ent-l:last-of-type{border-bottom:0}
.ent-l .dia{font:700 11px/1.3 ui-monospace,monospace;color:var(--cinza);white-space:nowrap;
  padding-top:2px}
.ent-l .val{font-weight:700;font-size:13.5px;font-variant-numeric:tabular-nums}
.ent-l .conv{color:var(--cinza);font-size:11.5px;margin-top:2px;line-height:1.45}
.ent-l .conv .est{color:var(--laranja-esc);font-weight:600}
.ent-l .meta{color:var(--cinza);font-size:11.5px;margin-top:2px}
.ent-l .bts{display:flex;gap:4px}
.ent-l .bts button{border:1px solid var(--areia);background:var(--marfim);border-radius:4px;
  padding:3px 8px;font:inherit;font-size:11px;cursor:pointer;color:var(--cinza)}
.ent-l .bts button:hover{border-color:var(--laranja);color:var(--laranja-esc)}
.ent-l.antiga{background:#fdf9f4}
.ent-form{background:var(--marfim);border:1px solid var(--areia);border-radius:8px;
  padding:13px 15px;margin-top:12px}
.ent-form .lin{display:flex;gap:8px}
.ent-form .lin>div{flex:1;min-width:0}
.ent-cot{background:var(--laranja-pal);border-left:3px solid var(--laranja);
  border-radius:0 5px 5px 0;padding:9px 13px;font-size:11.5px;line-height:1.5;margin-bottom:11px}
@media (max-width:560px){.ent-topo{grid-template-columns:1fr}.ent-form .lin{flex-wrap:wrap}}
.semr2{background:#fbe9e2;border-left:3px solid var(--laranja-esc);padding:11px 14px;
  border-radius:0 5px 5px 0;font-size:12px;line-height:1.5}
.semr2 code{font:11.5px ui-monospace,monospace;background:rgba(0,0,0,.06);padding:1px 5px;border-radius:3px}
`;

export const JS_PARTES = `
/* ═══════════ 1. PORTÃO DE CONCLUSÃO ═══════════
   A pergunta "por que este cliente ainda está em entrega" com resposta na
   tela, item por item, dizendo onde mexer em cada um. */
function l_portao(c){
  const P=c.portao; if(!P) return '';
  const cls=P.forcada?'forcada':(P.cumprido?'pronto':'');
  const cab=P.forcada
    ? '<b>Entrega fechada antes do prazo</b><span>Fechada por você em '
      +new Date(P.forcada_em).toLocaleString('pt-BR')+'</span>'
    : P.cumprido
      ? '<b>Portão cumprido, entrega concluída</b><span>Os três grupos que travam estão fechados.</span>'
      : '<b>Em entrega</b><span>Falta fechar '+P.pendencias.length
        +' grupo(s) para este cliente sair de "Em entrega".</span>';

  let h='<div class="portao '+cls+'"><div class="portao-cab">'+cab+'</div>';
  for(const g of P.grupos){
    const completo=g.total>0&&g.feitos>=g.total;
    const st=!g.trava?'solto':(completo?'ok':'falta');
    h+='<div class="pg '+st+'">'
      +'<div class="pg-ic">'+(completo?'✓':(g.trava?'!':'·'))+'</div>'
      +'<div><b>'+esc(g.rotulo)
        +(g.trava?'':'<span class="selo-solto">não trava</span>')+'</b>'
      +'<div class="onde">'+esc(g.onde)+'</div>'
      +(!completo&&g.abertos&&g.abertos.length
        ? '<div class="abertos">Aberto: '+g.abertos.map(esc).join(' · ')+'</div>':'')
      +'<div class="porque">'+esc(g.porque)+'</div></div>'
      +'<div class="pg-n">'+g.feitos+'/'+g.total+'</div></div>';
  }
  h+='</div>';

  if(P.forcada){
    h+='<div class="forcada-nota"><b>Por que foi fechada antes</b>'+esc(P.forcada_nota||'')
      +(P.forcada_pendencias&&P.forcada_pendencias.length
        ? '<div style="margin-top:8px"><b style="margin-bottom:3px">Estava aberto na hora do clique</b>'
          +P.forcada_pendencias.map(x=>esc(x.rotulo)).join('<br>')+'</div>'
        : '<div style="margin-top:8px;color:var(--cinza)">O portão inteiro já estava cumprido.</div>')
      +'</div>'
      +'<button class="acao sec" style="margin-top:10px" onclick="reabrirEntrega()">Reabrir a entrega</button>';
  } else if(!P.cumprido){
    h+='<p style="font-size:11.5px;color:var(--cinza);margin:11px 0 7px;line-height:1.5">'
      +'Entregou tudo antes do prazo, ou por um caminho diferente do previsto? Feche aqui. '
      +'Fica registrado o que estava aberto na hora, e por quê.</p>'
      +'<button class="acao" onclick="concluirAntes()">Marcar como entregue antes do prazo</button>';
  }
  return h;
}

async function concluirAntes(){
  const c=(D.clientes||[]).find(x=>x.id===aberto)||{};
  const FRASE='SERVIÇO ENTREGUE ANTES DO TEMPO';
  const nota=prompt('Fechar a entrega de "'+(c.empresa||'#'+aberto)+'" antes do prazo.\\n\\n'
    +'Primeiro: escreva o que foi entregue e por que está fechando agora.\\n'
    +'Isso fica gravado no card, junto com o que estava aberto neste momento.');
  if(nota===null) return;
  if(!nota.trim()) return alert('Sem a justificativa eu não fecho. Ela é o registro do que aconteceu.');
  const dig=prompt('Confirmação.\\n\\nDigite exatamente esta frase:\\n\\n'+FRASE);
  if(dig===null) return;
  const r=await post('/api/concluir-entrega',{id:aberto,confirmacao:dig,nota:nota});
  if(r.erro) return alert(r.erro);
  alert(r.pendencias&&r.pendencias.length
    ? 'Fechada. Ficou registrado que estava aberto:\\n\\n'
      +r.pendencias.map(x=>'· '+x.rotulo).join('\\n')
    : 'Fechada. O portão inteiro já estava cumprido.');
  await carregar(); abrirCliente(aberto);
}
async function reabrirEntrega(){
  if(!confirm('Reabrir a entrega? O cliente volta para "Em entrega" e a justificativa é apagada.')) return;
  const r=await post('/api/concluir-entrega',{id:aberto,desfazer:true});
  if(r.erro) return alert(r.erro);
  await carregar(); abrirCliente(aberto);
}

/* ═══════════ 1b. ENTRADAS: o dinheiro que caiu na conta ═══════════
   Uma linha por entrada, com a moeda em que veio e a cotação do dia. É isso
   que responde "quanto entrou na empresa" para contrato recorrente, e é isso
   que trava o total em real: entrada de março não muda de valor porque o
   dólar mexeu hoje.

   O card mostra dólar E real sempre juntos: a operação fatura em dólar e o
   fundador vive em real, então nenhum dos dois sozinho responde a pergunta. */
function l_entradas(c){
  const F=c.financeiro; if(!F) return '';
  const E=F.entrou;
  let h='<div class="ent-topo">'
    +'<div class="usd"><div class="r">Entrou deste cliente</div>'
      +'<div class="v">'+esc(E.usd_rot)+'</div>'
      +'<div class="s">'+F.n_entradas+' entrada(s)'
      +(E.nativo_usd?'<br>em dólar: <b>'+esc(E.nativo_usd_rot)+'</b>':'')+'</div></div>'
    +'<div class="brl"><div class="r">O mesmo em real</div>'
      +'<div class="v">'+esc(E.brl_rot)+'</div>'
      +'<div class="s">'+(E.nativo_brl?'em real: <b>'+esc(E.nativo_brl_rot)+'</b>':'convertido')
      +(E.pct_estimado_brl?'<br><b>'+E.pct_estimado_brl+'% estimado</b>':'')+'</div></div>'
    +'<div class="full">'
      +(F.contratado!==null
        ? 'Contratado: <b>'+esc(F.contratado_rot)+'</b>'
          +(F.recorrente?' ('+esc(String(F.mensalidade))+' por mês x '+F.meses+' meses)':' em pagamento único')
          +(F.a_receber&&F.a_receber.usd>0.01
            ? ' · ainda a receber <b>'+esc(F.a_receber.usd_rot)+'</b> / '+esc(F.a_receber.brl_rot)
            : ' · <b>quitado</b>')
        : 'Contrato não preenchido, então não há como saber o que falta receber.')
      +(F.n_entradas?'<br>Lucro deste cliente: <b>'+esc(F.lucro.usd_rot)+'</b> / '
        +esc(F.lucro.brl_rot)+(F.margem!==null?' ('+F.margem+'% do que entrou)':''):'')
    +'</div></div>';

  if(F.tem_implicita) h+='<div class="ent-cot"><b>Registro antigo.</b> Este cliente tem valor '
    +'recebido de antes do controle de entradas: ele conta como uma entrada só, sem data do '
    +'dinheiro e sem cotação. Lance a entrada de verdade abaixo e o número em real fica exato.</div>';
  else if(F.pendente==='pagamento marcado, nenhuma entrada registrada')
    h+='<div class="ent-cot"><b>Pagamento marcado, nenhuma entrada lançada.</b> '
      +'Enquanto a entrada não for lançada aqui, esse dinheiro não entra em nenhum total.</div>';

  h+=(F.entradas||[]).map(e=>'<div class="ent-l'+(e.implicita?' antiga':'')+'">'
    +'<span class="dia">'+esc(e.recebido_em
      ?new Date(String(e.recebido_em).slice(0,10)+'T12:00:00').toLocaleDateString('pt-BR')
      :'sem data')+'</span>'
    +'<span><span class="val">'+esc(e.valor_rot)+'</span>'
      +'<div class="conv">'+(e.moeda==='USD'
        ? '= '+esc(e.brl_rot)+(e.cotacao_estimada
            ? ' <span class="est">(cotação estimada '+e.cotacao_usada.toFixed(2).replace('.',',')+')</span>'
            : ' (cotação '+e.cotacao_usada.toFixed(2).replace('.',',')+')')
        : '= '+esc(e.usd_rot)+' (cotação '+e.cotacao_usada.toFixed(2).replace('.',',')+')')+'</div>'
      +((e.parcela||e.meio||e.nota)?'<div class="meta">'
        +[e.parcela,e.meio,e.nota].filter(Boolean).map(esc).join(' · ')+'</div>':'')
    +'</span>'
    +(e.id?'<span class="bts"><button onclick="editarEntrada('+e.id+')">editar</button>'
      +'<button onclick="apagarEntrada('+e.id+')">apagar</button></span>':'<span></span>')
    +'</div>').join('');

  // formulário de lançamento. A cotação nasce sugerida pela de referência,
  // mas editável: o que vale é a cotação em que o dinheiro foi convertido.
  const hoje=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  h+='<div class="ent-form"><b style="font-size:12px">Lançar uma entrada</b>'
    +'<div class="lin" style="margin-top:8px">'
      +'<div><label>Valor</label><input id="en_valor" placeholder="2500" inputmode="decimal"></div>'
      +'<div><label>Moeda</label><select id="en_moeda">'
        +'<option value="USD">Dólar (US$)</option><option value="BRL">Real (R$)</option>'
      +'</select></div></div>'
    +'<div class="lin">'
      +'<div><label>Data em que o dinheiro entrou</label>'
        +'<input type="date" id="en_data" value="'+hoje+'"></div>'
      +'<div><label>Cotação do dia (reais por dólar)</label>'
        +'<input id="en_cotacao" placeholder="'+esc(String(c.cotacao_ref).replace('.',','))
        +'" inputmode="decimal"></div></div>'
    +'<div class="lin">'
      +'<div><label>Meio</label><input id="en_meio" placeholder="Wise, Zelle, PIX"></div>'
      +'<div><label>Qual parcela</label><input id="en_parcela" placeholder="entrada · mês 2 de 6"></div>'
    +'</div>'
    +'<label>Observação</label><input id="en_nota">'
    +'<input type="hidden" id="en_id" value="">'
    +'<button class="acao" onclick="salvarEntrada()">Lançar entrada</button>'
    +'<button class="acao sec" onclick="limparEntrada()" style="margin-left:7px">Limpar</button>'
    +'<p style="font-size:11.5px;color:var(--cinza);margin-top:7px">'
    +'A <b>cotação do dia</b> é o que trava o valor em real: sem ela, a entrada é convertida pela '
    +'cotação de referência de hoje e o total em real muda sozinho quando o dólar mexe. '
    +'Use a cotação que o seu banco ou a Wise realmente aplicou.</p>'
    +'</div>';
  return h;
}

async function salvarEntrada(){
  const g=id=>{const e=document.getElementById(id);return e?e.value.trim():''};
  if(!g('en_valor')) return alert('Escreva o valor que entrou.');
  if(!g('en_data')) return alert('Informe a data em que o dinheiro entrou.');
  const r=await post('/api/entrada',{cliente_id:aberto,id:g('en_id')||undefined,
    valor:g('en_valor'),moeda:g('en_moeda'),recebido_em:g('en_data'),
    cotacao:g('en_cotacao'),meio:g('en_meio'),parcela:g('en_parcela'),nota:g('en_nota')});
  if(r.erro) return alert(r.erro);
  marcarDashSujo(); await carregar(); abrirCliente(aberto);
}
function editarEntrada(id){
  const c=CLI_ABERTO;
  const e=((c&&c.financeiro&&c.financeiro.entradas)||[]).find(x=>x.id===id);
  if(!e) return;
  const s=(k,v)=>{const el=document.getElementById(k);if(el)el.value=v==null?'':String(v)};
  s('en_id',e.id); s('en_valor',e.valor); s('en_moeda',e.moeda);
  s('en_data',String(e.recebido_em||'').slice(0,10));
  // duas casas sempre: cotação é dinheiro, e "5,2" fica estranho no campo
  s('en_cotacao',e.cotacao?e.cotacao.toFixed(2).replace('.',','):'');
  s('en_meio',e.meio); s('en_parcela',e.parcela); s('en_nota',e.nota);
  // rolar até o formulário é conforto, não função: nunca pode derrubar a edição
  const alvo=document.getElementById('en_valor');
  if(alvo&&alvo.scrollIntoView) alvo.scrollIntoView({behavior:'smooth',block:'center'});
}
function limparEntrada(){
  ['en_id','en_valor','en_cotacao','en_meio','en_parcela','en_nota']
    .forEach(k=>{const e=document.getElementById(k);if(e)e.value=''});
}
async function apagarEntrada(id){
  if(!confirm('Apagar esta entrada? Ela sai de todos os totais, do mês a mês e do lucro.')) return;
  const r=await post('/api/entrada',{cliente_id:aberto,id:id,apagar:true});
  if(r.erro) return alert(r.erro);
  marcarDashSujo(); await carregar(); abrirCliente(aberto);
}

/* ═══════════ 1c. CONTRATO ═══════════
   O contrato é a PRIMEIRA coisa que o cliente toca no sistema, antes do
   onboarding. O fluxo: gerar o link, mandar, ele preenche os dados legais dele,
   lê o texto inteiro e aceita. O aceite liga a chave de contrato assinado
   sozinho, e a partir daí a chave fica travada: mexer nela à mão contradiria
   uma prova de aceite registrada. */
function l_contrato_link(c, base){
  const aceito = !!c.contrato_aceito_em;
  const temDados = !!c.razao_social;
  let h = '';

  if(aceito){
    h += '<div class="ct-ok"><b>Aceito pelo cliente</b>'
      + '<span>' + esc(c.contrato_aceito_nome) + ' &middot; '
      + esc(new Date(c.contrato_aceito_em).toLocaleString('pt-BR'))
      + '<br>versão ' + esc(c.contrato_versao)
      + ' &middot; impressão ' + esc(String(c.contrato_hash||'').slice(0,16)) + '...'
      + '</span></div>';
  } else if(!c.contrato_token){
    h += '<p style="font-size:12.5px;color:var(--cinza);margin-bottom:9px">'
      + 'Gere o link e mande pro cliente. Ele preenche os dados legais, lê o contrato '
      + 'inteiro na tela e aceita. O aceite liga a chave de contrato assinado sozinho.</p>'
      + '<button class="acao" onclick="gerarContrato()">Gerar link do contrato</button>';
  } else {
    h += '<div class="link"><b>Link do contrato:</b><br>' + esc(base) + '/c/'
      + esc(c.contrato_token)
      + (temDados
        ? ' <span style="color:var(--laranja-esc)">dados preenchidos, aguardando aceite</span>'
        : ' <span style="color:var(--cinza)">aguardando o cliente preencher</span>')
      + '</div>'
      + '<button class="acao sec" onclick="copiarContrato()">Copiar link</button>'
      + '<button class="acao sec" style="margin-left:7px" onclick="gerarContrato(1)">Gerar link novo</button>';
  }

  if(temDados){
    h += '<div class="ct-dados"><b>Dados que o cliente informou</b>'
      + '<span>' + esc(c.razao_social) + (c.tipo_entidade?' ('+esc(c.tipo_entidade)+')':'')
      + '<br>' + esc([c.endereco,c.endereco_cidade,c.endereco_estado,c.endereco_zip]
          .filter(Boolean).join(', '))
      + (c.email_contrato?'<br>'+esc(c.email_contrato):'')
      + '</span></div>'
      + '<a class="acao sec" style="display:inline-block;text-decoration:none;padding:8px 15px;'
      + 'margin-top:10px" href="/api/baixar-contrato?id='+c.id+'">Baixar o contrato (.txt)</a>';
  }

  h += '<div class="ct-legal"><b>Minuta, não parecer jurídico</b>'
    + 'O texto foi escrito a partir do escopo real do sistema, por quem não é advogado. '
    + 'Prestador no Brasil, cliente nos Estados Unidos, aceite eletrônico e foro precisam '
    + 'de revisão profissional antes de este contrato valer contra alguém. '
    + 'O detalhe do que revisar está no topo de <code>src/contrato.js</code>.</div>';
  return h;
}

async function gerarContrato(trocar){
  if(trocar && !confirm('Gerar link novo? O link atual deixa de funcionar.')) return;
  const r=await post('/api/gerar-contrato',{id:aberto});
  if(r.erro) return alert(r.erro);
  await carregar(); abrirCliente(aberto);
}
function copiarContrato(){
  const c=CLI_ABERTO; if(!c||!c.contrato_token) return;
  const url=location.origin+'/c/'+c.contrato_token;
  if(navigator.clipboard) navigator.clipboard.writeText(url)
    .then(()=>alert('Link copiado:\\n\\n'+url))
    .catch(()=>prompt('Copie o link:',url));
  else prompt('Copie o link:',url);
}

/* ═══════════ 2. LOGO ═══════════ */
function l_logo(c){
  const temPronta=(c.arquivos||[]).some(a=>a.destino==='logo'&&a.origem==='agencia');
  let h='';
  if(c.tem_logo&&!temPronta)
    h+='<div class="nota">O cliente marcou que <b>já tem logo</b>. Confira o arquivo dele na '
      +'seção de mídias. Se estiver ruim ou em formato inútil, o prompt abaixo continua valendo.</div>';

  h+='<label>Estilo que ele quer</label><input id="lg_estilo" value="'+esc(c.logo_estilo)+'" '
    +'placeholder="moderna e limpa · robusta · clássica">'
    +'<label>Símbolo ou desenho que ele pediu</label>'
    +'<textarea id="lg_simbolo" placeholder="uma tábua de madeira, a inicial do nome, nada de desenho">'
    +esc(c.logo_simbolo)+'</textarea>'
    +'<label>Cores</label><input id="lg_cores" value="'+esc(c.cores)+'" placeholder="azul escuro e dourado">'
    +'<label>O que ele NÃO quer</label>'
    +'<textarea id="lg_evitar" placeholder="nada de casinha, sem letra cursiva">'+esc(c.logo_evitar)+'</textarea>'
    +'<label>Marcas de referência</label>'
    +'<textarea id="lg_ref" placeholder="empresas que ele citou, links, o que ele viu num caminhão">'
    +esc(c.logo_referencias)+'</textarea>'
    +'<div style="display:flex;gap:8px"><div style="flex:1"><label>Texto exato da logo</label>'
    +'<input id="lg_texto" value="'+esc(c.logo_texto)+'" placeholder="'+esc(c.empresa)+'"></div>'
    +'<div style="flex:1"><label>Slogan</label><input id="lg_slogan" value="'+esc(c.logo_slogan)+'"></div></div>'
    +'<button class="acao sec" onclick="salvarBriefingLogo()">Salvar briefing</button>'
    +'<p style="font-size:11.5px;color:var(--cinza);margin-top:6px">'
    +'O cliente responde isso no formulário, mas na prática ele manda áudio no WhatsApp. '
    +'Transcreva aqui e o prompt sai igual.</p>';

  h+='<div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--areia)">'
    +'<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:9px">'
    +'<button class="acao" onclick="gerarPromptLogo(0)">Gerar prompt</button>'
    +'<button class="acao sec" onclick="gerarPromptLogo(1)">Gerar refinado com IA</button></div>'
    +'<div id="lg_saida">'
    +(c.logo_prompt?blocoPrompt(c.logo_prompt,null,null,c.logo_prompt_em):
      '<p style="font-size:12.5px;color:var(--cinza)">Clique em <b>Gerar prompt</b>. '
      +'Sai um JSON pronto para colar no ChatGPT com o gpt-image-2.</p>')
    +'</div></div>';
  return h;
}

function blocoPrompt(txt,falta,rationale,em){
  let h='';
  if(falta&&falta.length) h+='<div class="falta-brief"><b>O briefing está incompleto:</b> falta '
    +falta.map(esc).join(', ')+'. O prompt sai igual, mas mais genérico. '
    +'Pergunte no WhatsApp e preencha acima, é uma rodada de refação a menos.</div>';
  if(rationale) h+='<div class="nota" style="margin-bottom:9px">'+esc(rationale)+'</div>';
  h+='<div class="pr-cx"><textarea class="pr-txt" id="lg_prompt" readonly>'+esc(txt)+'</textarea>'
    +'<button class="acao pr-copiar" onclick="copiarPrompt(this)">Copiar</button></div>'
    +'<p style="font-size:11.5px;color:var(--cinza)">Cole no ChatGPT e peça a imagem com o '
    +'<b>gpt-image-2</b>. Depois suba os arquivos na seção <b>Peças e arquivos</b>, em Logo.'
    +(em?' · Gerado em '+new Date(em).toLocaleString('pt-BR'):'')+'</p>';
  return h;
}

const salvarBriefingLogo=()=>post('/api/logo-briefing',{id:aberto,
  logo_estilo:V('lg_estilo'),logo_simbolo:V('lg_simbolo'),cores:V('lg_cores'),
  logo_evitar:V('lg_evitar'),logo_referencias:V('lg_ref'),
  logo_texto:V('lg_texto'),logo_slogan:V('lg_slogan')})
  .then(carregar).then(()=>abrirCliente(aberto));

async function gerarPromptLogo(comIA){
  const cx=document.getElementById('lg_saida');
  cx.innerHTML='<p style="color:var(--cinza);font-size:12.5px">Montando'
    +(comIA?' e refinando com a IA':'')+'...</p>';
  const r=await api('/api/prompt-logo?id='+aberto+(comIA?'&ia=1':''));
  if(r.erro){cx.innerHTML='<p style="color:#c0392b">'+esc(r.erro)+'</p>';return}
  cx.innerHTML=blocoPrompt(r.prompt,r.falta,r.rationale,null);
}

async function copiarPrompt(btn){
  const t=document.getElementById('lg_prompt');
  try{
    await navigator.clipboard.writeText(t.value);
  }catch(e){
    // clipboard falha sem HTTPS e em alguns navegadores: seleciona para o
    // operador dar Ctrl+C, em vez de o botão não fazer nada
    t.removeAttribute('readonly'); t.select(); t.setAttribute('readonly','');
    btn.textContent='Selecionei, dá Ctrl+C'; setTimeout(()=>{btn.textContent='Copiar'},2600); return;
  }
  btn.textContent='Copiado'; setTimeout(()=>{btn.textContent='Copiar'},1800);
}

/* ═══════════ 3. PEÇAS E ARQUIVOS ═══════════
   A ordem é a do fluxo de trabalho, não alfabética: logo primeiro, porque
   ela entra no site, no Instagram e no Google. Fazer depois é refazer três. */
function l_pecas(c){
  if(!c.pecas) return '';
  if(D.sem_r2)
    return '<div class="semr2"><b>Armazenamento de arquivo não configurado.</b><br>'
      +'Crie o bucket uma vez, com <code>npx wrangler r2 bucket create leon-group-midia</code>, '
      +'e publique. Até lá o campo de colar link continua funcionando no formulário.</div>';

  let h='<p style="font-size:11.5px;color:var(--cinza);margin-bottom:11px;line-height:1.5">'
    +'A ordem abaixo é a ordem de fazer. A logo vem primeiro porque ela entra no site, '
    +'no Instagram e no Google: fazer depois das três é refazer as três.</p>';
  for(const g of c.pecas){
    h+='<details class="peca '+(g.completo?'ok':'')+'"'+(g.completo?'':' open')+'>'
      +'<summary><span class="peca-dia">dia '+g.dia+'</span>'
      +'<span class="peca-rot">'+esc(g.rotulo)+'</span>'
      +'<span class="peca-n">'+(g.completo?'completo':(g.falta?'falta '+g.falta:g.tem+' arquivo(s)'))
      +'</span></summary><div class="peca-corpo">'
      +'<div class="peca-nota">'+esc(g.nota)+'</div>';
    for(const s of g.slots){
      const st=s.minimo===0?'':(s.completo?'ok':'falta');
      const idf='up_'+g.destino+'_'+s.slot;
      h+='<div class="slot '+st+'"><div class="slot-cab"><b>'+esc(s.rotulo)+'</b>'
        +'<span class="est">'+(s.minimo?s.tem+'/'+s.minimo:s.tem+' enviado(s)')
        +(s.completo&&s.minimo?' ✓':'')+'</span></div>'
        +(s.dica?'<div class="slot-dica">'+esc(s.dica)+'</div>':'')
        +'<label class="slot-bt" for="'+idf+'">+ Subir arquivo</label>'
        +'<input type="file" id="'+idf+'" multiple accept="image/*,video/*,application/pdf" '
        +'onchange="subirPeca(this,\\''+g.destino+'\\',\\''+s.slot+'\\')">'
        +'<div class="mini" id="mini_'+g.destino+'_'+s.slot+'">'
        +s.arquivos.map(a=>miniHTML(a)).join('')+'</div></div>';
    }
    h+='</div></details>';
  }
  return h;
}

function miniHTML(a){
  const img=/^image\\/(jpeg|png|webp)$/.test(a.mime||'');
  return '<div class="mn" data-arq="'+a.id+'">'
    +(img?'<img src="'+esc(a.url)+'" alt="" loading="lazy">'
        :'<div class="nao-img">'+esc((a.nome||a.mime||'arquivo').slice(0,22))+'</div>')
    +'<button class="x" title="Apagar" onclick="apagarPeca('+a.id+')">×</button></div>';
}

/* Upload da agência. Mesma redução do formulário do cliente: arte de
   Instagram exportada do Canva tem 3 MB e ninguém precisa de mais que
   1920px. PDF e vídeo passam intactos. */
async function subirPeca(input,destino,slot){
  const arqs=[].slice.call(input.files||[]); input.value='';
  const cx=document.getElementById('mini_'+destino+'_'+slot);
  for(const f of arqs){
    const prov=document.createElement('div');
    prov.className='mn subindo';
    prov.innerHTML='<div class="nao-img">'+esc(f.name.slice(0,22))+'</div><div class="pc"></div>';
    cx.appendChild(prov);
    const barra=prov.querySelector('.pc');
    try{
      let corpo=f, mime=f.type||'application/octet-stream';
      if(/^image\\//.test(mime)){
        const r=await reduzirImg(f);
        if(r){corpo=r.blob;mime='image/jpeg'}
      }
      barra.style.width='45%';
      const resp=await fetch('/api/subir-arquivo?cliente_id='+aberto+'&destino='+destino
        +'&slot='+slot+'&nome='+encodeURIComponent(f.name.slice(0,120)),
        {method:'POST',headers:{'Content-Type':mime},body:corpo});
      const j=await resp.json().catch(()=>({}));
      if(!resp.ok||j.erro) throw new Error(j.erro||('código '+resp.status));
      barra.style.width='100%';
      prov.outerHTML=miniHTML({id:j.id,url:j.url,mime:mime,nome:f.name});
    }catch(e){
      prov.className='mn';
      prov.innerHTML='<div class="nao-img" style="color:#c0392b">'+esc(e.message||'falhou')+'</div>'
        +'<button class="x" onclick="this.parentElement.remove()">×</button>';
    }
  }
  carregar();
  // recarrega o card para os contadores e o portão refletirem o que subiu
  abrirCliente(aberto);
}

function reduzirImg(file){
  return new Promise(res=>{
    const url=URL.createObjectURL(file), img=new Image();
    img.onload=()=>{
      try{
        const esc0=Math.min(1,1920/Math.max(img.naturalWidth,img.naturalHeight));
        const cv=document.createElement('canvas');
        cv.width=Math.round(img.naturalWidth*esc0); cv.height=Math.round(img.naturalHeight*esc0);
        cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
        cv.toBlob(b=>{URL.revokeObjectURL(url);res(b&&b.size<file.size?{blob:b}:null)},
          'image/jpeg',0.85);
      }catch(e){URL.revokeObjectURL(url);res(null)}
    };
    img.onerror=()=>{URL.revokeObjectURL(url);res(null)};
    img.src=url;
  });
}

async function apagarPeca(id){
  if(!confirm('Apagar este arquivo? Não tem como desfazer.')) return;
  const r=await post('/api/arquivo-apagar',{id:id,cliente_id:aberto});
  if(r.erro) return alert(r.erro);
  const el=document.querySelector('.mn[data-arq="'+id+'"]');
  if(el) el.remove();
  carregar(); abrirCliente(aberto);
}
`;
