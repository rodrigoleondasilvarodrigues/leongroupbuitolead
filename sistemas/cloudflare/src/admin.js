import { CSS_DASH, JS_DASH } from "./admin-dash.js";
import { CSS_PARTES, JS_PARTES } from "./admin-partes.js";
import { CSS_CAIXA, JS_CAIXA } from "./admin-caixa.js";
import { CSS_ATIV, JS_ATIV } from "./admin-ativacoes.js";
import { TAGS_ICONE } from "./marca.js";

export const ADMIN_HTML = `<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Leon Group · Admin</title>${TAGS_ICONE}<style>
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
/* ── checklist de otimização ── */
.chk-barra{height:6px;background:var(--areia);border-radius:99px;overflow:hidden;margin:8px 0 4px}
.chk-barra i{display:block;height:100%;background:var(--op);transition:width .4s}
.chk-barra.pronto i{background:var(--verde)}
.chk-area{margin-top:14px}
.chk-area>b{font-size:10.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--op);
  display:flex;gap:8px;align-items:baseline}
.chk-area>b em{font-style:normal;margin-left:auto;color:var(--cinza);letter-spacing:0;
  text-transform:none;font-size:11px;font-weight:400}
.chk-item{display:grid;grid-template-columns:auto 1fr;gap:9px;padding:8px 0;
  border-bottom:1px solid #f2ede4}
.chk-item input{width:auto;margin:3px 0 0}
.chk-item .t{font-size:12.5px;font-weight:600;line-height:1.35}
.chk-item.ok .t{color:var(--cinza);text-decoration:line-through;font-weight:400}
.chk-item .obg{color:var(--laranja);font-weight:700}
.chk-item .d{font-size:11.5px;color:var(--cinza);line-height:1.5;margin-top:3px}
.chk-item.ok .d{display:none}
.trava{background:#fbe4e0;border-left:3px solid #c0392b;padding:10px 13px;border-radius:4px;
  font-size:12.5px;margin-top:10px}
.trava b{color:#c0392b}
/* o próximo passo, no topo do card do cliente */
.passo-agora{background:var(--preto);color:var(--marfim);border-radius:8px;
  padding:13px 16px;margin:12px 0 4px}
.passo-agora .r{font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;
  color:#8a8580;font-weight:700;margin-bottom:5px}
.passo-agora b{display:block;font-size:15px;line-height:1.25;color:#fff}
.passo-agora span{display:block;font-size:12px;color:#c9c4bb;margin-top:5px;line-height:1.5}
.passo-agora.fim{background:#1e4d38}
.passo-agora.fim .r{color:#8fd0ae}
.rev{background:var(--marfim);border:1px solid var(--areia);border-radius:6px;padding:10px;margin-bottom:7px;font-size:12.5px}
.rev small{color:var(--cinza);display:block;margin-bottom:3px}
.nota{background:var(--laranja-pal);border-left:3px solid var(--laranja);padding:10px 13px;border-radius:4px;font-size:12.5px;margin:10px 0}
.link{background:var(--marfim);border:1px dashed var(--areia);padding:9px 11px;border-radius:5px;
font-size:12px;word-break:break-all;margin-bottom:8px}
/* ── relógio local de cada lead/cliente ──
   Quem opera está em Brasília. Quem atende o telefone está em Massachusetts,
   na Flórida ou na Califórnia. Ligar às 6h da manhã do cara queima o lead. */
.rel-card{background:var(--preto);color:var(--marfim);border-radius:7px;
  padding:12px 14px;margin-bottom:12px;display:grid;gap:2px}
.rel-card .rc-rot{font-size:9px;letter-spacing:.16em;text-transform:uppercase;
  font-weight:700;color:#8a8580;display:flex;gap:8px;align-items:baseline}
.rel-card .rc-rot b{color:var(--laranja);font-weight:700;letter-spacing:.06em;
  text-transform:none;font-size:10.5px;margin-left:auto}
.rel-card .rc-hora{font:700 27px/1.05 ui-monospace,SFMono-Regular,Menlo,monospace;
  font-variant-numeric:tabular-nums;letter-spacing:-.01em}
.rel-card .rc-dia{font-size:11.5px;color:#c9c4bb;text-transform:capitalize}
.rel-card .rc-vs{margin-top:7px;padding-top:7px;border-top:1px solid #2a2a2a;
  font-size:11px;color:#8a8580;display:flex;flex-wrap:wrap;gap:4px 10px}
.rel-card .rc-vs b{color:#c9c4bb;font-weight:600;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-variant-numeric:tabular-nums}
.rel-card .rc-ok{font-size:10.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
  margin-top:6px;display:inline-flex;align-items:center;gap:6px}
.rel-card .rc-ok.bom{color:#6bbf8f} .rel-card .rc-ok.ruim{color:#f08a58}
.rel-card .rc-ok i{width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}
.rel-card .rc-nada{font-size:11.5px;color:#8a8580;line-height:1.45}
.rel-card .rc-dupla{font-size:10px;color:#6e6a63;margin-top:5px;line-height:1.4}
dialog{border:0;border-radius:10px;padding:24px;max-width:460px;width:93%;box-shadow:0 20px 60px rgba(0,0,0,.2)}
dialog::backdrop{background:rgba(23,23,23,.45)}

/* ─────────── relógio das duas praças ───────────
   O sistema decide três coisas pelo relógio de Massachusetts: a janela de
   contato (8h-21h), a contagem dos 5 dias úteis e o dia da semana. Quem opera
   está no Brasil. Sem os dois fusos na tela, marcar call vira adivinhação. */
.relogio{display:flex;align-items:stretch;gap:0;background:#111;color:var(--marfim);
  border-bottom:1px solid #2a2a2a;overflow-x:auto}
.rel-praca{display:flex;flex-direction:column;justify-content:center;gap:2px;
  padding:12px 22px;border-right:1px solid #262626;flex:none;cursor:pointer;
  background:none;border-top:0;border-left:0;border-bottom:0;color:inherit;text-align:left;
  font:inherit;transition:background .18s}
.rel-praca:hover{background:#1a1a1a}
.rel-praca.on{background:#1c1a17}
.rel-praca.on.ma{box-shadow:inset 3px 0 0 var(--laranja)}
.rel-praca.on.bsb{box-shadow:inset 3px 0 0 #5fa8d3}
.rel-cid{font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:#8a8580}
.rel-praca.on .rel-cid{color:var(--marfim)}
.rel-praca.on.ma .rel-cid{color:var(--laranja)}
.rel-praca.on.bsb .rel-cid{color:#5fa8d3}
.rel-hora{font:700 15px/1 ui-monospace,SFMono-Regular,Menlo,monospace;
  font-variant-numeric:tabular-nums;letter-spacing:.02em;color:#b8b3ab}
.rel-praca.on .rel-hora{font-size:34px;color:#fff;letter-spacing:-.01em}
.rel-dia{font-size:11px;color:#8a8580;text-transform:capitalize}
.rel-praca.on .rel-dia{font-size:12.5px;color:#c9c4bb}
.rel-fuso{font:600 9.5px/1 ui-monospace,monospace;letter-spacing:.1em;color:#6e6a63}
/* estado da janela de contato: é regra do motor, não enfeite */
.rel-estado{display:flex;flex-direction:column;justify-content:center;gap:4px;
  padding:12px 22px;flex:1;min-width:210px}
.rel-badge{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:700;
  letter-spacing:.09em;text-transform:uppercase;align-self:flex-start;
  padding:5px 11px;border-radius:99px}
.rel-badge.aberta{background:rgba(45,106,79,.22);color:#6bbf8f}
.rel-badge.fechada{background:rgba(196,71,18,.2);color:#f08a58}
.rel-badge i{width:7px;height:7px;border-radius:50%;background:currentColor;flex:none}
.rel-nota{font-size:11px;color:#8a8580;line-height:1.4}
.rel-dif{font:600 10.5px/1 ui-monospace,monospace;color:#6e6a63;letter-spacing:.05em}
/* seletor da praça americana: o público está espalhado pelos EUA */
.rel-sel{background:#000;color:var(--laranja);border:1px solid #333;border-radius:5px;
  font:700 9.5px/1 inherit;letter-spacing:.11em;text-transform:uppercase;
  padding:4px 6px;cursor:pointer;max-width:172px}
.rel-sel:hover{border-color:var(--laranja)}
.rel-praca:not(.on) .rel-sel{color:#8a8580;letter-spacing:.14em}
.rel-idi{display:flex;align-items:center;padding:0 18px;flex:none;gap:3px;border-left:1px solid #262626}
.rel-idi button{background:none;border:1px solid #333;color:#8a8580;cursor:pointer;
  font:700 10.5px/1 inherit;letter-spacing:.09em;padding:6px 10px;border-radius:99px}
.rel-idi button.on{background:var(--marfim);color:var(--preto);border-color:var(--marfim)}
@media (max-width:820px){
  .rel-praca{padding:10px 15px}.rel-praca.on .rel-hora{font-size:26px}
  .rel-estado{padding:10px 15px;min-width:170px}.rel-idi{padding:0 12px}
}
${CSS_DASH}${CSS_PARTES}${CSS_CAIXA}${CSS_ATIV}
</style></head><body>
<header><b>LE<span>O</span>N GROUP · Admin</b><span class="selo" id="selo">Comercial</span>
  <button class="sair" id="btn_zap" onclick="abrirConfig()" style="margin-left:auto">WhatsApp</button>
  <button class="sair" onclick="fetch('/api/logout',{method:'POST'}).then(()=>location.href='/login')" style="margin-left:14px">sair</button></header>
<div class="relogio" id="relogio">
  <div class="rel-praca eua" data-praca="eua" id="p_eua">
    <select class="rel-sel" id="rel_cidade" aria-label="Praça nos Estados Unidos"></select>
    <span class="rel-hora" id="h_eua">--:--:--</span>
    <span class="rel-dia" id="d_eua"></span>
    <span class="rel-fuso" id="f_eua"></span>
  </div>
  <div class="rel-praca bsb" data-praca="bsb" id="p_bsb">
    <span class="rel-cid" id="c_bsb"></span>
    <span class="rel-hora" id="h_bsb">--:--:--</span>
    <span class="rel-dia" id="d_bsb"></span>
    <span class="rel-fuso" id="f_bsb"></span>
  </div>
  <div class="rel-estado">
    <span class="rel-badge" id="rel_badge"></span>
    <span class="rel-nota" id="rel_nota"></span>
    <span class="rel-dif" id="rel_dif"></span>
  </div>
  <div class="rel-idi">
    <button type="button" data-relidi="pt">PT</button>
    <button type="button" data-relidi="en">EN</button>
  </div>
</div>
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

<dialog id="dlgCfg"><h3 style="margin-bottom:5px">WhatsApp do CRM</h3>
  <p style="font-size:12px;color:var(--cinza);margin-bottom:14px">
    Lembrete de tarefa vem pra cá. Mensagem pra lead e pra cliente sai daqui.</p>
  <div id="cfg_estado"></div>
  <label>Meu WhatsApp (com código do país, só dígitos)</label>
  <input id="cfg_num" placeholder="5561999999999" inputmode="tel">
  <p style="font-size:11.5px;color:var(--cinza);margin:4px 0 10px">
    Brasil: 55 + DDD + número · EUA: 1 + área + número</p>
  <label>Hora do resumo diário (seu horário, Brasília)</label>
  <input id="cfg_hora" type="number" min="0" max="23" value="8">
  <div class="linha" style="margin-top:10px"><input type="checkbox" id="cfg_lig">
    <label for="cfg_lig" style="margin:0">Mandar avisos e resumo</label></div>
  <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
    <button class="acao" onclick="salvarConfig()">Salvar</button>
    <button class="acao sec" onclick="testarZap()">Mandar teste agora</button>
    <button class="acao sec" onclick="dlgCfg.close()">Fechar</button></div>
  <p id="cfg_msg" style="font-size:12px;margin-top:11px"></p></dialog>

<script>
const api=(u,o)=>fetch(u,o).then(r=>r.json());
// Escapa todo dado vindo do banco antes de entrar no HTML.
// Campos como nome_dono, cidade e servicos chegam do FORMULÁRIO PÚBLICO:
// sem isso, quem tem um link de formulário injeta script no admin.
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const post=(u,b)=>api(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
const hrs=i=>i?((Date.now()-new Date(i))/36e5):0;
/* Contratado e recebido são números diferentes. Mostrar um valor solto sem
   dizer qual é dos dois é como se contava faturamento que ainda não entrou. */
const dinheiro=c=>{
  if(c.pagamento_confirmado&&c.valor_pago) return ' · <b>'+esc(c.valor_pago)+'</b> recebido';
  if(c.valor_contrato) return ' · '+esc(c.valor_contrato)+' <span style="color:var(--laranja-esc)">a receber</span>';
  return '';
};
let D={},setor='comercial',aba='leads_novos',aberto=null,tipoAberto=null;
/* O cliente aberto, inteiro. As seções novas precisam de dados que não
   estão na lista do painel (as entradas com a cotação de cada uma, por
   exemplo), e reabrir o card só para editar uma linha perderia a rolagem. */
let CLI_ABERTO=null;
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
// O dashboard é a primeira aba do comercial: a pergunta "como está o funil"
// vem antes de "quem eu ligo agora".
const ABA_DASH='dashboard';
/* E o Caixa é a segunda: "como está o funil" e "onde está o dinheiro" são as
   duas perguntas de quem olha o comercial de fora, e nenhuma das duas é a
   lista de quem ligar agora. */
const ABA_CAIXA='caixa';

async function carregar(){
  let r;
  try{ r=await api('/api/painel'); }
  catch(e){ return avisoFalha('Sem conexão com o servidor. Tentando de novo em 1 minuto.'); }
  // sessão expirada devolve {erro:"não autenticado"} — sem isso, D virava o
  // objeto de erro, a tela congelava e nada explicava o motivo.
  if(!r||r.erro){
    if(/autentic/i.test(r&&r.erro||''))return location.href='/login';
    return avisoFalha(r.erro||'Falha ao carregar.');
  }
  D=r; document.getElementById('aviso-falha')?.remove(); marcarDashSujo(); pintar();
}

function avisoFalha(txt){
  document.getElementById('aviso-falha')?.remove();
  const d=document.createElement('div');
  d.id='aviso-falha'; d.className='alerta';
  d.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:18px;z-index:99;max-width:92%';
  d.textContent=txt;
  document.body.appendChild(d);
}

// pintar() redesenha TODA a moldura: tema, selo, switch de setor e sub-abas.
// Antes isso morava dentro de carregar(), então irPara() (que só chamava render())
// trocava o conteúdo mas deixava cabeçalho, selo e abas no setor antigo —
// na tela parecia que o clique não fez nada. Agora a troca é instantânea e completa.
function pintar(){
  if(!D.clientes) return;              // ainda carregando o primeiro painel
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
        return \`<button class="op \${k===aba?'on':''}" onclick="aba='\${k}';pintar()">\${v.rotulo} (\${n})</button>\`}).join('')
    : \`<button class="\${aba===ABA_DASH?'on':''}" onclick="aba='\${ABA_DASH}';pintar()">Dashboard</button>
       <button class="\${aba===ABA_CAIXA?'on':''}" onclick="aba='\${ABA_CAIXA}';pintar()">Caixa</button>
       <span class="sep"></span>\`
      + Object.keys(D.pipelines).map(p=>{const n=D.leads.filter(l=>l.pipeline===p).length;
        return \`<button class="\${p===aba?'on':''}" onclick="aba='\${p}';pintar()">\${ROT[p]} (\${n})</button>\`}).join('');
  render();
}

function render(){
  const c=document.getElementById('conteudo');
  /* O dashboard tem busca própria (/api/dashboard) e desenho próprio: são
     agregações do período inteiro, não a lista de quem está em cada coluna. */
  if(setor==='comercial'&&aba===ABA_DASH) return carregarDash();
  if(setor==='comercial'&&aba===ABA_CAIXA) return carregarCaixa();
  const k=D.kpis;
  const rotK={whatsapp:'No WhatsApp',ligacao_atendida:'Atenderam',call_marcada:'Calls marcadas',
    call_comparecida:'Compareceram',call_fechada:'Fecharam'};
  const kpis=\`<div class="kpis">\${Object.entries(k.etapas).map(([e,v])=>
    \`<div class="kpi"><b>\${v}</b><span>\${rotK[e]||e}</span></div>\`).join('')}
    \${k.alertas.map(a=>\`<div class="alerta"><b>\${a.taxa}%</b> em \${a.transicao} · \${a.diagnostico}</div>\`).join('')}</div>\`;

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
          <div class="meta">\${esc(x.nome_contato)}\${x.nicho?' · '+esc(x.nicho):''}\${dinheiro(x)}
            \${x.reviews_total?' · '+x.reviews_postadas+'/'+x.reviews_total+' reviews':''}
            \${x.marcos_total?' · '+x.marcos_feitos+'/'+x.marcos_total+' marcos':''}
            \${x.midias&&x.midias.foto?' · '+x.midias.foto+' fotos':''}
            \${x.arquivos_agencia?' · '+x.arquivos_agencia+' peças':''}
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
          <small>\${esc(l.empresa||'sem empresa')}\${l.nicho?' · '+esc(l.nicho):''}</small>
          <div class="t">\${h<1?'agora há pouco':h.toFixed(0)+'h aqui'}\${h>=24?' · decai no próximo ciclo':''}</div>
        </div>\`}).join(''):'<div style="color:var(--cinza);font-size:12px;padding:8px 12px">vazio</div>'}</div></div>\`}).join('')}</div>\`;
}

async function abrirLead(id){
  aberto=id;tipoAberto='lead';
  const l=await api('/api/lead?id='+id);
  const p=document.getElementById('painel');p.classList.add('on');
  p.innerHTML=\`<button class="x" onclick="fechar()">×</button>
   <h2 style="font-size:18px">\${esc(l.nome)}</h2>
   <div style="color:var(--cinza);font-size:12.5px">\${esc(l.empresa||'sem empresa')} · \${esc(l.telefone)}</div>
   <div style="font-size:12px;margin-top:5px"><b>\${esc(l.pipeline)}</b> / \${esc(l.coluna)} · \${hrs(l.entrou_coluna_em).toFixed(0)}h aqui</div>
   \${blocoRelogio(l,'Hora do lead')}
   <section><h4>Ligação</h4><div style="display:flex;gap:7px;flex-wrap:wrap">
     <button class="acao" onclick="lig(1)">Atendeu</button>
     <button class="acao sec" onclick="lig(0)">Não atendeu</button>
     <button class="acao sec" onclick="resp()">Respondeu mensagem</button></div>
     <p style="font-size:11.5px;color:var(--cinza);margin-top:6px">
       Nunca 3 ligações seguidas. Melhor janela: 17h-22h (52% atendem).</p></section>
   <section><h4>Ativações</h4>
     \${l_ativacoes(l)}
     <p style="font-size:11.5px;color:var(--cinza);margin-top:9px">
       Follow-up não é venda. Proibido ofertar: a venda acontece na ligação.
       Clicar abre o playbook; registrar é o segundo clique, depois de mandar.</p></section>
   <section><h4>Qualificação BANT</h4>
     <label>Rapport (ponto de conexão, reusado no follow de no-show)</label><input id="q_rapport" value="\${esc(l.rapport)}">
     <label>Budget (ancorar em US$10 mil)</label><input id="q_budget" value="\${esc(l.budget)}">
     <label>Authority (é o decisor? estará na call?)</label><input id="q_authority" value="\${esc(l.authority)}">
     <label>Need</label><input id="q_need" value="\${esc(l.need)}">
     <label>Timeline</label><input id="q_timeline" value="\${esc(l.timeline)}">
     <button class="acao" onclick="qual(1)">Salvar e qualificar</button>
     <button class="acao sec" onclick="qual(0)">Só salvar</button></section>
   <section><h4>Agendar call</h4><input type="datetime-local" id="q_quando">
     <button class="acao" onclick="agendar()">Agendar</button>
     <p style="font-size:11.5px;color:var(--cinza);margin-top:6px">
       Nunca mais de 2 dias à frente. Sem horário hoje? Não marque: diga que retorna a ligação amanhã.</p></section>
   <section><h4>Mover</h4><div style="display:flex;gap:6px;flex-wrap:wrap">
     <button class="acao sec" onclick="mv('call_rolando','agendamento')">Entrou na call</button>
     <button class="acao sec" onclick="mv('no_show','agendamento')">Não apareceu</button>
     <button class="acao" onclick="mv('fechou','agendamento')">Fechou a venda ✓</button>
     <button class="acao sec" onclick="mv('recusou','agendamento')">Recusou</button></div>
     <p style="font-size:11.5px;color:var(--cinza);margin-top:6px">
       Ao marcar "Fechou", os dados do lead viram um cliente no operacional automaticamente.</p></section>
   <section><h4>Contrato</h4>
     <label>Modelo de cobrança</label>
     <select id="k_tipo">
       <option value="">não definido</option>
       <option value="TCV" \${l.tipo_contrato==='TCV'?'selected':''}>TCV · valor total em pagamento único</option>
       <option value="MRR" \${l.tipo_contrato==='MRR'?'selected':''}>MRR · mensalidade recorrente</option>
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
       Preencha antes de marcar "Fechou": esses dados vão junto pro operacional,
       para a equipe saber o que esperar do contrato.</p>
   </section>
   <section><h4>Onde o lead está</h4>
     <div style="display:flex;gap:8px"><div style="flex:2"><label>Cidade</label>
       <input id="q_cidade" value="\${esc(l.cidade)}" placeholder="Boston"></div>
       <div style="flex:1"><label>Estado (sigla)</label>
       <input id="q_estado" value="\${esc(l.estado)}" placeholder="MA" maxlength="2"></div></div>
     <label>Fuso manual (só se o mapa errar)</label>
     <input id="q_fuso" value="\${esc(l.fuso)}" placeholder="America/New_York">
     <button class="acao sec" onclick="salvarLocal()">Salvar localização</button>
     <p style="font-size:11.5px;color:var(--cinza);margin-top:6px">
       O estado define o fuso do relógio acima. Sem ele, não há como saber a hora do cara.</p></section>
   <section><h4>Histórico</h4>\${(l.eventos||[]).slice(0,12).map(e=>
     \`<div class="linha"><span><b>\${esc(e.tipo)}</b> \${e.para?'→ '+esc(e.para):''}
      <br><small style="color:var(--cinza)">\${new Date(e.criado_em).toLocaleString('pt-BR')}</small></span></div>\`).join('')}</section>
   <section><h4>Zona de risco</h4>
     <button class="acao" style="background:#c0392b" onclick="excluir('lead',\${l.id})">Excluir este lead</button>
     <p style="font-size:11.5px;color:var(--cinza);margin-top:6px">
       Apaga o lead e todo o histórico dele. Não tem como desfazer.</p>
   </section>\`;
}

async function abrirCliente(id){
  aberto=id;tipoAberto='cliente';
  const c=await api('/api/cliente?id='+id);
  CLI_ABERTO=c;
  const p=document.getElementById('painel');p.classList.add('on');
  const base=location.origin;
  p.innerHTML=\`<button class="x" onclick="fechar()">×</button>
   <h2 style="font-size:18px">\${esc(c.empresa)}</h2>
   <div style="color:var(--cinza);font-size:12.5px">\${esc(c.nome_contato)} · dia \${c.dias}\${dinheiro(c)}</div>
   \${blocoRelogio(c,'Hora do cliente')}
   \${(()=>{const[t,d]=c.proximo_passo||['',''];return t?\`<div class="passo-agora \${c.entrega_completa?'fim':''}">
     <div class="r">\${c.entrega_completa?'Situação':'O que fazer agora'}</div>
     <b>\${esc(t)}</b><span>\${esc(d)}</span></div>\`:''})()}
   \${c.entrega_iniciada_em?
     \`<div class="nota" style="\${c.dias_uteis>5?'background:#fbe4e0;border-left-color:#c0392b':''}">
       Entrega: <b>dia \${c.dias_uteis} de \${c.prazo_maximo} úteis</b>
       \${c.dias_uteis>5?', <b>ATRASADA</b>':''}. Prazo final: \${c.prazo_final?new Date(c.prazo_final).toLocaleDateString('pt-BR'):'sem prazo'}</div>\`
     :'<div class="nota">A cadência de 5 dias úteis começa quando o cliente responder o formulário.</div>'}
   \${c.dias_para_renovar!==null?
     \`<div class="nota" style="\${c.dias_para_renovar<=21?'':'background:var(--areia);border-left-color:var(--cinza)'}">
       Contrato de 3 meses: <b>\${c.dias_para_renovar>0?'renova em '+c.dias_para_renovar+' dias':'VENCIDO há '+(-c.dias_para_renovar)+' dias'}</b>
       \${c.renovado_vezes?' · já renovou '+c.renovado_vezes+'x':''}
       <button class="acao sec" style="margin-top:7px;font-size:12px" onclick="renovar()">Renovar +3 meses</button></div>\`:''}
   <section><h4>O que falta para concluir</h4>
     \${l_portao(c)}
   </section>
   <section><h4>Entradas · o que caiu na conta</h4>
     \${l_entradas(c)}
   </section>
   <section><h4>Contrato</h4>
     \${l_contrato_link(c, base)}
   </section>
   <section><h4>Liberação do formulário</h4>
     <div class="linha"><input type="checkbox" \${c.contrato_assinado?'checked':''}
       \${c.contrato_aceito_em?'disabled':''}
       onchange="liberar('contrato',this.checked)"><span><b>Contrato assinado</b>
       \${c.contrato_aceito_em
         ? '<br><small style="color:var(--verde)">aceito pelo cliente, a chave fica travada</small>'
         : ''}</span></div>
     <div class="linha"><input type="checkbox" \${c.pagamento_confirmado?'checked':''}
       onchange="liberar('pagamento',this.checked)"><span><b>Pagamento confirmado</b></span></div>
     <p style="font-size:11.5px;color:var(--cinza);margin-top:7px">
       O formulário do cliente só abre com os dois marcados. A cadência de entrega
       (5 dias) nasce quando ele responder.</p>
   </section>
   <section><h4>Links</h4>
     \${(c.contrato_assinado&&c.pagamento_confirmado)?
       \`<div class="link"><b>Formulário do cliente:</b><br>\${base}/f/\${esc(c.formulario_token)}
         \${c.formulario_em?' <span style="color:var(--verde)">✓ respondido, link consumido</span>':' <span style="color:var(--laranja-esc)">aguardando resposta</span>'}</div>
        \${c.formulario_em?'<button class="acao sec" onclick="novoToken()">Gerar link novo</button>':''}\`
       :'<div class="link" style="color:var(--cinza)">Formulário travado. Marque contrato e pagamento acima.</div>'}
     \${c.vercel_url?\`<div class="link"><b>Site publicado:</b><br><a href="\${esc(c.vercel_url)}" target="_blank">\${esc(c.vercel_url)}</a></div>\`:''}
     <label>Grupo do WhatsApp com o cliente</label>
     <div style="display:flex;gap:7px"><input id="d_grupo" value="\${esc(c.grupo_whatsapp)}"
       placeholder="https://chat.whatsapp.com/..." style="flex:1">
       <button class="acao sec" onclick="salvarGrupo()">Salvar</button></div>
     \${c.grupo_whatsapp
       ?\`<p style="font-size:12px;margin-top:5px"><a href="\${esc(c.grupo_whatsapp)}" target="_blank">abrir o grupo ↗</a></p>\`
       :'<p style="font-size:11.5px;color:var(--laranja-esc);margin-top:5px">Crie o grupo assim que o formulário chegar. É o marco 1 da entrega.</p>'}
     <a class="acao sec" style="display:inline-block;text-decoration:none;padding:8px 15px;margin-top:11px" href="/api/exportar?id=\${c.id}">Baixar entrega (.txt)</a>
   </section>
   <section><h4>Informações do formulário</h4>
     \${c.formulario_em?\`
       <div class="linha"><span><b>Tempo de mercado:</b> \${esc(c.tempo_mercado)}</span></div>
       <div class="linha"><span><b>Atende:</b> \${esc(c.localizacoes)}</span></div>
       <div class="linha"><span><b>Faz:</b> \${esc(c.faz)}</span></div>
       <div class="linha"><span><b>NÃO faz:</b> \${esc(c.nao_faz)}</span></div>\`
       :'<p style="color:var(--cinza);font-size:12.5px">Aguardando o cliente responder.</p>'}
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
     <label>Fuso manual (só se o mapa errar o estado)</label>
     <div style="display:flex;gap:7px"><input id="d_fuso" value="\${esc(c.fuso)}"
       placeholder="America/New_York" style="flex:1">
       <button class="acao sec" onclick="salvarFusoCli()">Salvar</button></div>
     <label>Fotos adicionais (uma URL por linha)</label><textarea id="e_fotos"></textarea>
     <p style="font-size:11.5px;color:var(--cinza)">\${(c.midias||[]).length} fotos cadastradas</p>
     <button class="acao" onclick="salvarCliente()">Salvar</button></section>
   <section><h4>Mídias do cliente (\${(c.midias||[]).length})</h4>
     \${(c.midias||[]).length?\`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:6px">
       \${(c.midias||[]).map(m=>m.tipo==='foto'
         ?\`<a href="\${esc(m.caminho)}" target="_blank"><img src="\${esc(m.caminho)}" style="width:100%;height:66px;object-fit:cover;border-radius:5px;border:1px solid var(--areia)"></a>\`
         :\`<a href="\${esc(m.caminho)}" target="_blank" style="display:flex;align-items:center;justify-content:center;height:66px;background:var(--marfim);border:1px solid var(--areia);border-radius:5px;font-size:11px;text-decoration:none;color:var(--preto)">\${esc(m.tipo)}</a>\`
       ).join('')}</div>\`
       :'<p style="color:var(--cinza);font-size:12.5px">Nenhuma mídia ainda. Ela vem do formulário do cliente.</p>'}
   </section>
   <section><h4>Logo · briefing e prompt do gpt-image-2</h4>
     \${l_logo(c)}
   </section>
   <section><h4>Gerar entregáveis</h4>
     <label>Quantidade de reviews</label><input type="number" id="g_qtd" value="20">
     <button class="acao" onclick="gerar()">Gerar site + reviews + Instagram</button>
     <p style="font-size:11.5px;color:var(--cinza);margin-top:6px">
       Gera o HTML do site, as reviews e os briefs do Instagram. O site NÃO vai ao ar
       sozinho: baixe o index.html na seção abaixo e publique no Vercel.</p></section>
   <section><h4>Peças e arquivos</h4>
     \${l_pecas(c)}
   </section>
   <section><h4>Entregáveis</h4>\${(c.entregaveis||[]).map(e=>\`<div class="linha">
     <select onchange="statusEnt(\${e.id},this.value)" style="width:auto;margin:0">
       \${['pendente','em_producao','entregue','aprovado'].map(s=>\`<option \${e.status===s?'selected':''}>\${s}</option>\`).join('')}
     </select><span><b>\${((D.entregaveis.find(y=>y[0]===e.tipo)||[])[1])||e.tipo}</b></span></div>\`).join('')}</section>
   <section><h4>Site · deploy manual no Vercel</h4>
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
   <section><h4>Instagram</h4>\${(c.posts||[]).map(x=>
     \`<div class="linha"><span><b>\${x.tipo==='destaque'?'★':x.ordem}</b> \${esc(x.titulo)}</span></div>\`).join('')
     ||'<p style="color:var(--cinza);font-size:12.5px">Gere os entregáveis.</p>'}</section>
   <section><h4>Reviews (\${(c.reviews||[]).filter(r=>r.postada).length}/\${(c.reviews||[]).length} postadas)</h4>
     \${(c.reviews||[]).length?'<p style="font-size:12px;color:var(--cinza);margin-bottom:8px">Quem posta é o <b>cliente</b>. Ritmo: 3 por semana.</p>':''}
     \${(c.reviews||[]).slice(0,5).map(r=>\`<div class="rev"><small>
       <input type="checkbox" \${r.postada?'checked':''} onchange="revPost(\${r.id},this.checked)" style="width:auto">
       \${esc(r.servico)}</small>\${esc(r.texto)}</div>\`).join('')}
     \${(c.reviews||[]).length>5?\`<p style="font-size:12px;color:var(--cinza)">…e mais \${c.reviews.length-5} no arquivo.</p>\`:''}</section>
   <section><h4>Cadência de entrega · máximo 5 dias</h4>\${(c.marcos||[]).map(m=>\`<div class="linha \${m.concluido?'feito':''}">
     <input type="checkbox" \${m.concluido?'checked':''} onchange="marco(\${m.id},this.checked,this)">
     <span>\${esc(m.marco)} <small style="color:var(--cinza)">· dia \${m.prazo_dias}</small></span></div>\`).join('')}</section>
   <section><h4>Checklist de otimização</h4>\${l_checklist(c)}</section>
   <section><h4>Contrato</h4>
     \${l_contrato(c)}
   </section>
   <section><h4>Custos e lucro</h4>
     <div style="display:flex;gap:8px">
       <div style="flex:1"><label>Taxa do gateway / câmbio (%)</label>
         <input id="cu_taxa" value="\${esc(c.taxa_percentual)}" placeholder="4.99" inputmode="decimal"></div>
       <div style="flex:1"><label>Outros custos deste cliente</label>
         <input id="cu_valor" value="\${esc(c.custos_valor)}" placeholder="120"></div>
       <div style="flex:1"><label>Moeda do custo</label>
         <select id="cu_moeda">
           <option value="USD" \${c.custos_moeda!=='BRL'?'selected':''}>Dólar (US$)</option>
           <option value="BRL" \${c.custos_moeda==='BRL'?'selected':''}>Real (R$)</option>
         </select></div>
     </div>
     <label>O que é esse custo</label>
     <input id="cu_nota" value="\${esc(c.custos_nota)}" placeholder="hospedagem, freela de arte">
     <button class="acao sec" onclick="salvarCustos()">Salvar</button>
     <p style="font-size:11.5px;color:var(--cinza);margin-top:6px">
       Sai do que <b>entrou</b> para chegar no lucro, no dashboard do comercial.
       Sem isso preenchido, lucro e entrada dão o mesmo número.
       A moeda importa: ferramenta é cobrada em dólar, contador e freela em real.</p>
   </section>
   <section><h4>Dashboard do cliente</h4>
     <div class="kpis" style="margin-bottom:10px">
       <div class="kpi"><b>\${c.dias_uteis??'0'}</b><span>dia útil de 5</span></div>
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
   <section><h4>Zona de risco</h4>
     <button class="acao" style="background:#c0392b" onclick="excluir('cliente',\${c.id})">Excluir este cliente</button>
     <p style="font-size:11.5px;color:var(--cinza);margin-top:6px">
       Apaga o cliente, entregáveis, reviews, posts, marcos e mídias. Não tem como desfazer.</p>
   </section>\`;
}

function irPara(s){
  if(setor===s) return;                // já está nesse setor
  setor=s;
  aba = s==='operacional' ? 'todos' : 'leads_novos';
  fechar();
  pintar();                            // instantâneo: usa os dados já em memória
  window.scrollTo(0,0);
}
const fechar=()=>{document.getElementById('painel').classList.remove('on');aberto=null};
const V=id=>document.getElementById(id).value;
async function criarLead(){const r=await post('/api/lead',{nome:V('l_nome'),telefone:V('l_tel'),empresa:V('l_emp'),nicho:V('l_nicho')});
  if(r.id){dlgLead.close();['l_nome','l_tel','l_emp','l_nicho'].forEach(i=>document.getElementById(i).value='');await carregar();abrirLead(r.id)}}
async function criarCliente(){const r=await post('/api/cliente',{nome_contato:V('c_nome'),empresa:V('c_emp'),
  nicho:V('c_nicho'),email:V('c_email'),valor_pago:V('c_valor')});
  if(r.id){dlgCli.close();['c_nome','c_emp','c_nicho','c_email','c_valor'].forEach(i=>document.getElementById(i).value='');
    setor='operacional';aba='todos';await carregar();abrirCliente(r.id)}}
const lig=a=>post('/api/ligacao',{id:aberto,atendeu:a}).then(carregar).then(()=>abrirLead(aberto));
const resp=()=>post('/api/respondeu',{id:aberto}).then(carregar).then(()=>abrirLead(aberto));
const qual=q=>post('/api/qualificar',{id:aberto,rapport:V('q_rapport'),budget:V('q_budget'),
  authority:V('q_authority'),need:V('q_need'),timeline:V('q_timeline'),qualificado:q}).then(()=>abrirLead(aberto));
async function agendar(){const v=V('q_quando');if(!v)return alert('Escolha data e hora');
  const r=await post('/api/agendar',{id:aberto,quando:new Date(v).toISOString()});
  if(r.erro)return alert(r.erro);await carregar();abrirLead(aberto)}
async function mv(col,pip){
  // O usuário pediu Mover ACIMA de Contrato, porque mover é o que ele faz o
  // dia inteiro. O efeito colateral é ficar fácil clicar em "Fechou" sem ter
  // preenchido o contrato, e os dados do contrato são copiados pro cliente
  // exatamente nesse clique. Quem não preencheu tem que redigitar do outro
  // lado. Então a ordem é a que ele pediu, com um aviso na única transição
  // em que isso importa.
  if(col==='fechou'){
    const l=(D.leads||[]).find(x=>x.id===aberto)||{};
    if(!l.tipo_contrato||!l.valor_contrato){
      const falta=[!l.tipo_contrato?'modelo de cobrança':'',!l.valor_contrato?'valor':'']
        .filter(Boolean).join(' e ');
      if(!confirm('O contrato está sem '+falta+'.\\n\\n'
        +'Esses dados são copiados pro cliente agora, neste clique. Fechando '
        +'assim, você vai ter que digitar de novo no operacional.\\n\\n'
        +'Fechar mesmo assim?')) return;
    }
  }
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
  if(r.erro)return alert(r.erro);alert('Gerado: '+r.gerado.join(', ')+'\\n\\n'+(r.proximo||''));
  await carregar();abrirCliente(aberto)}
/* Checklist de otimização, agrupado por área.
   O "detalhe" de cada item é o passo a passo: quem executa não precisa
   lembrar de nada. Some quando o item é marcado, pra lista não virar
   parede de texto depois de pronta.                                   */
const AREAS_CHK={gbp:'Google Business Profile',site:'Site',instagram:'Instagram',
                 logo:'Logo',geral:'Geral'};
function l_checklist(c){
  const lista=c.checklist||[];
  if(!lista.length) return '<p style="color:var(--cinza);font-size:12.5px">'
    +'O checklist nasce quando o cliente responde o formulário.</p>';
  const obr=lista.filter(k=>k.obrigatorio), fei=obr.filter(k=>k.feito).length;
  const pct=obr.length?Math.round(100*fei/obr.length):0;
  const pronto=fei>=obr.length;
  let h='<div id="chk_res" style="font-size:12.5px"><b>'+fei+' de '+obr.length+'</b> itens obrigatórios'
    +(pronto?' <span style="color:var(--verde)">· tudo pronto</span>':'')+'</div>'
    +'<div class="chk-barra '+(pronto?'pronto':'')+'"><i id="chk_bar" style="width:'+pct+'%"></i></div>'
    +'<div class="trava"'+(c.trava_entrega?'':' style="display:none"')+'>'
    +'A entrega não fecha ainda. Falta: <b id="trava_txt">'+esc(c.trava_entrega||'')+'</b></div>';
  for(const a in AREAS_CHK){
    const itens=lista.filter(k=>k.area===a); if(!itens.length) continue;
    const o=itens.filter(k=>k.obrigatorio), f=o.filter(k=>k.feito).length;
    h+='<div class="chk-area"><b>'+esc(AREAS_CHK[a])+'<em>'+f+'/'+o.length+'</em></b>'
      +itens.map(k=>'<label class="chk-item '+(k.feito?'ok':'')+'">'
        +'<input type="checkbox" '+(k.feito?'checked':'')
        +' onchange="chk('+k.id+',this.checked,this)">'
        +'<span><span class="t">'+esc(k.item)
        +(k.obrigatorio?' <span class="obg">*</span>':' <small style="color:var(--cinza);font-weight:400">(recomendado)</small>')
        +'</span><span class="d">'+esc(k.detalhe||'')+'</span></span></label>').join('')
      +'</div>';
  }
  return h;
}

// bloco de contrato reaproveitado no painel do cliente
function l_contrato(c){
  const tcv=c.tipo_contrato==='TCV', mrr=c.tipo_contrato==='MRR';
  return \`<div class="nota" style="background:var(--op-claro);border-left-color:var(--op)">
    \${c.tipo_contrato?\`<b>\${esc(c.tipo_contrato)}</b> · \${tcv?'pagamento único':'mensalidade recorrente'}
      · \${esc(c.valor_contrato)||'valor não informado'}
      · \${c.duracao_meses||3} meses
      \${c.renovacao_automatica?' · renova automático':' · sem renovação automática'}
      \${c.servicos_extras?'<br><b>Extra:</b> '+esc(c.servicos_extras)+(c.valor_extras?' ('+esc(c.valor_extras)+')':''):''}\`
      :'Contrato não preenchido no comercial.'}
  </div>
  <label>Modelo</label>
  <select id="kc_tipo">
    <option value="">não definido</option>
    <option value="TCV" \${tcv?'selected':''}>TCV · pagamento único</option>
    <option value="MRR" \${mrr?'selected':''}>MRR · mensalidade</option>
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

async function excluir(tipo,id){
  // o nome vem dos dados em memória, não interpolado no onclick: nome com
  // apóstrofo (O'Brien, D'Angelo) quebrava o handler e o botão ficava inerte.
  const reg=(tipo==='lead'?D.leads:D.clientes).find(x=>x.id===id);
  const nome=(tipo==='lead'?reg&&reg.nome:reg&&reg.empresa)||('#'+id);
  const digitado=prompt(
    'Isso apaga '+(tipo==='lead'?'o lead':'o cliente')+' "'+nome+'" e todo o histórico dele.\\n'+
    'Não tem como desfazer.\\n\\nPara confirmar, digite EXCLUIR:');
  if(digitado===null)return;
  if(digitado.trim()!=='EXCLUIR')return alert('Não apaguei nada. Você precisa digitar EXCLUIR exatamente.');
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
const salvarGrupo=()=>post('/api/cliente-editar',{id:aberto,grupo_whatsapp:V('d_grupo')}).then(carregar).then(()=>abrirCliente(aberto));
const salvarLocal=()=>post('/api/lead-editar',{id:aberto,cidade:V('q_cidade'),
  estado:V('q_estado').toUpperCase(),fuso:V('q_fuso')}).then(carregar).then(()=>abrirLead(aberto));
const salvarFusoCli=()=>post('/api/cliente-editar',{id:aberto,fuso:V('d_fuso')}).then(carregar).then(()=>abrirCliente(aberto));
const salvarCustos=()=>post('/api/custos',{id:aberto,taxa_percentual:V('cu_taxa'),
  custos_valor:V('cu_valor'),custos_moeda:V('cu_moeda'),custos_nota:V('cu_nota')}).then(r=>{
    if(r.erro)return alert(r.erro);
    marcarDashSujo();return carregar().then(()=>abrirCliente(aberto))});
async function renovar(){if(!confirm('Renovar por mais 3 meses?'))return;
  await post('/api/renovar',{id:aberto});await carregar();abrirCliente(aberto)}
const liberar=(qual,v)=>post('/api/liberar-formulario',{id:aberto,[qual]:v}).then(carregar).then(()=>abrirCliente(aberto));
async function novoToken(){if(!confirm('Gerar link novo? O atual deixa de funcionar.'))return;
  await post('/api/novo-token-formulario',{id:aberto});await carregar();abrirCliente(aberto)}
const statusEnt=(eid,s)=>post('/api/entregavel',{eid,status:s}).then(carregar);
/* Marcar item NÃO redesenha o painel.
   Antes chamava abrirCliente(), que remonta tudo e joga a rolagem pro topo:
   você marcava um item lá embaixo e era atirado pra cima, parecendo que o
   item tinha sumido. Agora o DOM é atualizado no lugar e a lista de trás
   recarrega em segundo plano.                                            */
async function marco(mid,v,el){
  const linha=el&&el.closest('.linha'); if(linha) linha.classList.toggle('feito',v);
  await post('/api/marco',{mid,concluido:v});
  recontar(); carregar();
}
async function chk(id,v,el){
  const item=el&&el.closest('.chk-item'); if(item) item.classList.toggle('ok',v);
  await post('/api/checklist',{id,cid:aberto,feito:v});
  recontar(); carregar();
}
// recalcula contadores, barra e aviso de trava direto do que está na tela
function recontar(){
  const itens=[...document.querySelectorAll('.chk-item')];
  if(!itens.length) return;
  const obr=itens.filter(i=>i.querySelector('.obg'));
  const fei=obr.filter(i=>i.classList.contains('ok')).length;
  const pct=obr.length?Math.round(100*fei/obr.length):0;
  const b=document.getElementById('chk_res');
  if(b) b.innerHTML='<b>'+fei+' de '+obr.length+'</b> itens obrigatórios'
    +(fei>=obr.length?' <span style="color:var(--verde)">· tudo pronto</span>':'');
  const barra=document.getElementById('chk_bar');
  if(barra){ barra.style.width=pct+'%';
    barra.parentElement.classList.toggle('pronto',fei>=obr.length); }
  document.querySelectorAll('.chk-area').forEach(a=>{
    const o=[...a.querySelectorAll('.chk-item')].filter(i=>i.querySelector('.obg'));
    const f=o.filter(i=>i.classList.contains('ok')).length;
    const em=a.querySelector('b em'); if(em) em.textContent=f+'/'+o.length;
  });
  const mk=[...document.querySelectorAll('.linha input[type=checkbox]')];
  const mkF=mk.filter(x=>x.checked).length;
  const t=document.getElementById('trava_txt');
  if(t){
    const falta=[ mk.length-mkF ? (mk.length-mkF)+' marco(s)' : '',
                  obr.length-fei ? (obr.length-fei)+' item(ns) do checklist' : '' ].filter(Boolean);
    t.parentElement.style.display = falta.length ? '' : 'none';
    t.textContent = falta.join(' · ');
  }
}
const revPost=(rid,v)=>post('/api/review-postada',{rid,postada:v}).then(()=>abrirCliente(aberto));
/* ═══════════════════ RELÓGIOS ═══════════════════
   Três fusos importam nesta operação:
   1. Brasília, onde o operador está
   2. a praça americana escolhida no topo (padrão Boston/MA)
   3. a cidade de CADA lead e de CADA cliente, dentro do card

   O terceiro é o que evita o erro caro: ligar 6h da manhã do cara queima
   o lead. O mapa estado->fuso resolve, com override manual pros estados
   cortados por dois fusos.                                              */

// Praças americanas onde há concentração de brasileiro na construção.
const EUA = [
  ["Boston, MA",        "America/New_York"],
  ["New York, NY",      "America/New_York"],
  ["Newark, NJ",        "America/New_York"],
  ["Bridgeport, CT",    "America/New_York"],
  ["Philadelphia, PA",  "America/New_York"],
  ["Washington, DC",    "America/New_York"],
  ["Miami, FL",         "America/New_York"],
  ["Orlando, FL",       "America/New_York"],
  ["Atlanta, GA",       "America/New_York"],
  ["Chicago, IL",       "America/Chicago"],
  ["Houston, TX",       "America/Chicago"],
  ["Dallas, TX",        "America/Chicago"],
  ["Nashville, TN",     "America/Chicago"],
  ["Denver, CO",        "America/Denver"],
  ["Phoenix, AZ",       "America/Phoenix"],
  ["Las Vegas, NV",     "America/Los_Angeles"],
  ["Los Angeles, CA",   "America/Los_Angeles"],
  ["San Francisco, CA", "America/Los_Angeles"],
  ["Seattle, WA",       "America/Los_Angeles"],
];
const TZ_BSB='America/Sao_Paulo';

// Estado -> fuso predominante. Os marcados em DUPLO são cortados por dois
// fusos: o mapa usa o mais populoso e a tela avisa que pode estar errado.
const UF={
  CT:'America/New_York',DE:'America/New_York',DC:'America/New_York',GA:'America/New_York',
  ME:'America/New_York',MD:'America/New_York',MA:'America/New_York',NH:'America/New_York',
  NJ:'America/New_York',NY:'America/New_York',NC:'America/New_York',OH:'America/New_York',
  PA:'America/New_York',RI:'America/New_York',SC:'America/New_York',VT:'America/New_York',
  VA:'America/New_York',WV:'America/New_York',
  FL:'America/New_York',MI:'America/New_York',IN:'America/New_York',KY:'America/New_York',
  AL:'America/Chicago',AR:'America/Chicago',IL:'America/Chicago',IA:'America/Chicago',
  LA:'America/Chicago',MN:'America/Chicago',MS:'America/Chicago',MO:'America/Chicago',
  OK:'America/Chicago',WI:'America/Chicago',
  TX:'America/Chicago',TN:'America/Chicago',KS:'America/Chicago',NE:'America/Chicago',
  ND:'America/Chicago',SD:'America/Chicago',
  CO:'America/Denver',MT:'America/Denver',NM:'America/Denver',UT:'America/Denver',
  WY:'America/Denver',ID:'America/Boise',
  AZ:'America/Phoenix',
  CA:'America/Los_Angeles',WA:'America/Los_Angeles',
  NV:'America/Los_Angeles',OR:'America/Los_Angeles',
  AK:'America/Anchorage',HI:'Pacific/Honolulu',
};
const UF_DUPLO=['FL','TX','TN','IN','KY','MI','KS','NE','ND','SD','OR','ID','NV','AZ'];
const UF_NOME={MA:'Massachusetts',NY:'New York',NJ:'New Jersey',CT:'Connecticut',FL:'Florida',
  GA:'Georgia',TX:'Texas',CA:'California',IL:'Illinois',PA:'Pennsylvania',AZ:'Arizona',
  NV:'Nevada',CO:'Colorado',WA:'Washington',TN:'Tennessee',NH:'New Hampshire',RI:'Rhode Island',
  MD:'Maryland',VA:'Virginia',NC:'North Carolina',OH:'Ohio',MI:'Michigan',UT:'Utah'};

// Tira a UF de um texto solto: "Boston, MA", "boston ma", "Marlborough - MA"
function ufDe(txt){
  const t=String(txt||'').toUpperCase();
  const m=t.match(/(?:^|[,\\s\\-\\/])([A-Z]{2})(?:$|[,\\s\\-\\.\\/])/g);
  if(m) for(let i=m.length-1;i>=0;i--){
    const uf=m[i].replace(/[^A-Z]/g,''); if(UF[uf]) return uf;
  }
  for(const uf in UF_NOME) if(t.includes(UF_NOME[uf].toUpperCase())) return uf;
  return '';
}
// Fuso de um lead/cliente: override manual > estado > cidade
function fusoDe(reg){
  if(reg&&reg.fuso&&/^[A-Za-z]+\\/[A-Za-z_]+$/.test(reg.fuso)) return {tz:reg.fuso,uf:'',manual:true};
  const uf=ufDe(reg&&reg.estado)||ufDe(reg&&reg.cidade)||ufDe(reg&&reg.observacoes);
  return uf?{tz:UF[uf],uf,manual:false}:{tz:'',uf:'',manual:false};
}

let relPraca='eua', relIdi='pt', relCidade=0;
try{
  relPraca=localStorage.getItem('leon_rel_praca')||'eua';
  relIdi=localStorage.getItem('leon_rel_idi')||'pt';
  relCidade=+(localStorage.getItem('leon_rel_cidade')||0)||0;
}catch(e){}
if(relPraca!=='eua'&&relPraca!=='bsb') relPraca='eua';
if(relIdi!=='pt'&&relIdi!=='en') relIdi='pt';
if(!EUA[relCidade]) relCidade=0;

const relLoc=()=>relIdi==='pt'?'pt-BR':'en-US';
const T2=(pt,en)=>relIdi==='pt'?pt:en;

function horaEm(tz,d){
  const p=new Intl.DateTimeFormat('en-US',{timeZone:tz,hour12:false,hour:'2-digit',minute:'2-digit'}).formatToParts(d);
  return {h:+p.find(x=>x.type==='hour').value%24, m:+p.find(x=>x.type==='minute').value};
}
const fmtHora=(tz,d,seg)=>new Intl.DateTimeFormat(relLoc(),{timeZone:tz,hour:'2-digit',
  minute:'2-digit',...(seg?{second:'2-digit'}:{}),hour12:relIdi==='en'}).format(d);
const fmtDia=(tz,d)=>new Intl.DateTimeFormat(relLoc(),{timeZone:tz,weekday:'long',day:'2-digit',month:'long'}).format(d);
function sigla(tz,d){
  try{ return new Intl.DateTimeFormat('en-US',{timeZone:tz,timeZoneName:'short'})
    .formatToParts(d).find(x=>x.type==='timeZoneName').value; }catch(e){ return ''; }
}
// diferença em horas de tz contra Brasília (positivo = Brasília na frente)
function difBsb(tz,d){
  const a=horaEm(tz,d), c=horaEm(TZ_BSB,d);
  let m=(c.h*60+c.m)-(a.h*60+a.m);
  if(m>720)m-=1440; if(m<-720)m+=1440;
  return m/60;
}
const sinalDif=v=>(v>=0?'+':'-')+Math.abs(v)+'h';

/* ── faixa do topo ── */
function montarSelect(){
  const sel=document.getElementById('rel_cidade');
  sel.innerHTML=EUA.map(([n],i)=>'<option value="'+i+'"'+(i===relCidade?' selected':'')+'>'+esc(n)+'</option>').join('');
  sel.addEventListener('change',()=>{
    relCidade=+sel.value; try{localStorage.setItem('leon_rel_cidade',relCidade)}catch(e){}
    relPraca='eua'; try{localStorage.setItem('leon_rel_praca','eua')}catch(e){}
    tique();
  });
  sel.addEventListener('click',e=>e.stopPropagation());
}
function tique(){
  const d=new Date();
  const tzEua=EUA[relCidade][1];

  document.getElementById('p_eua').className='rel-praca eua'+(relPraca==='eua'?' on':'');
  document.getElementById('p_bsb').className='rel-praca bsb'+(relPraca==='bsb'?' on':'');
  document.getElementById('h_eua').textContent=fmtHora(tzEua,d,true);
  document.getElementById('d_eua').textContent=fmtDia(tzEua,d);
  document.getElementById('f_eua').textContent=relPraca==='eua'?sigla(tzEua,d):'';
  document.getElementById('c_bsb').textContent=T2('Brasília · Brasil','Brasilia · Brazil');
  document.getElementById('h_bsb').textContent=fmtHora(TZ_BSB,d,true);
  document.getElementById('d_bsb').textContent=fmtDia(TZ_BSB,d);
  document.getElementById('f_bsb').textContent=relPraca==='bsb'?sigla(TZ_BSB,d):'';

  // A janela do MOTOR é sempre Nova York: é o que está no código do cron.
  // Se a praça escolhida estiver em outro fuso, a tela diz as duas coisas,
  // pra não dar a entender que o motor segue a cidade selecionada.
  const ny=horaEm('America/New_York',d), aberta=ny.h>=8&&ny.h<21;
  const b=document.getElementById('rel_badge');
  b.className='rel-badge '+(aberta?'aberta':'fechada');
  b.innerHTML='<i></i>'+T2(aberta?'Janela do motor aberta':'Janela do motor fechada',
                           aberta?'Engine window open':'Engine window closed');
  const faltam=aberta?(21-ny.h-1)*60+(60-ny.m):((ny.h<8?8-ny.h:32-ny.h)*60-ny.m);
  const quanto=Math.floor(faltam/60)+'h'+String(faltam%60).padStart(2,'0');
  const mesmoFuso=horaEm(tzEua,d).h===ny.h;
  document.getElementById('rel_nota').textContent=
    T2((aberta?'Fecha em '+quanto:'Abre em '+quanto)+' · o motor usa Nova York (8h-21h)'
        +(mesmoFuso?'':', não '+EUA[relCidade][0]),
       (aberta?'Closes in '+quanto:'Opens in '+quanto)+' · the engine uses New York (8am-9pm)'
        +(mesmoFuso?'':', not '+EUA[relCidade][0]));
  const dif=difBsb(tzEua,d);
  document.getElementById('rel_dif').textContent=
    T2('Brasília está '+sinalDif(dif)+' em relação a '+EUA[relCidade][0],
       'Brasilia is '+sinalDif(dif)+' vs '+EUA[relCidade][0]);

  document.querySelectorAll('[data-relidi]').forEach(x=>x.classList.toggle('on',x.dataset.relidi===relIdi));
  atualizarCards(d);
}

/* ── relógio dentro do card do lead/cliente ──
   O HTML é montado uma vez por abertura de painel; o texto é atualizado a
   cada segundo pelo mesmo tique, achando os nós por classe.            */
function blocoRelogio(reg,rotulo){
  const f=fusoDe(reg);
  const onde=[reg.cidade,reg.estado].filter(Boolean).join(', ')
    || (reg.observacoes||'').match(/Onde atende:\\s*([^·]+)/)?.[1]?.trim() || '';
  if(!f.tz) return '<div class="rel-card"><span class="rc-rot">'+esc(rotulo)+'</span>'
    +'<span class="rc-nada">Sem cidade ou estado preenchido, então não dá pra saber o fuso. '
    +'Preencha o estado (sigla de 2 letras, ex: MA) e o relógio local aparece aqui.</span></div>';
  return '<div class="rel-card rel-vivo" data-tz="'+esc(f.tz)+'">'
    +'<span class="rc-rot">'+esc(rotulo)+'<b class="rc-onde">'+esc(onde||f.uf)+'</b></span>'
    +'<span class="rc-hora"></span><span class="rc-dia"></span>'
    +'<span class="rc-vs"></span><span class="rc-ok"></span>'
    +(!f.manual&&UF_DUPLO.includes(f.uf)
      ?'<span class="rc-dupla">'+esc(f.uf)+' tem mais de um fuso. Usei o mais populoso. '
       +'Se estiver errado, grave o fuso certo no campo abaixo.</span>':'')
    +'</div>';
}
function atualizarCards(d){
  document.querySelectorAll('.rel-vivo').forEach(el=>{
    const tz=el.dataset.tz; if(!tz) return;
    const q=c=>el.querySelector('.'+c);
    q('rc-hora').textContent=fmtHora(tz,d,false);
    q('rc-dia').textContent=fmtDia(tz,d);
    const dif=difBsb(tz,d);
    q('rc-vs').innerHTML=T2('Você em Brasília: ','You in Brasilia: ')
      +'<b>'+esc(fmtHora(TZ_BSB,d,false))+'</b> ('+sinalDif(dif)+')'
      +' &nbsp;·&nbsp; '+esc(sigla(tz,d));
    const h=horaEm(tz,d).h, bom=h>=8&&h<21;
    const ok=q('rc-ok');
    ok.className='rc-ok '+(bom?'bom':'ruim');
    ok.innerHTML='<i></i>'+T2(bom?'Bom horário para ligar':'Fora de hora, não ligue agora',
                              bom?'Good time to call':'Off hours, do not call now');
  });
}

document.querySelectorAll('[data-praca]').forEach(x=>x.addEventListener('click',()=>{
  relPraca=x.dataset.praca; try{localStorage.setItem('leon_rel_praca',relPraca)}catch(e){} tique();}));
document.querySelectorAll('[data-relidi]').forEach(x=>x.addEventListener('click',()=>{
  relIdi=x.dataset.relidi; try{localStorage.setItem('leon_rel_idi',relIdi)}catch(e){} tique();}));
montarSelect(); tique(); setInterval(tique,1000);

/* ── configuração do canal de WhatsApp ── */
async function abrirConfig(){
  const c=await api('/api/config');
  document.getElementById('cfg_num').value=c.meu_whatsapp||'';
  document.getElementById('cfg_hora').value=c.hora_resumo||'8';
  document.getElementById('cfg_lig').checked=!!c.avisos_ligados;
  const pill=(ok,rot)=>'<span class="pill '+(ok?'ok':'')+'" style="margin-right:6px">'+rot+'</span>';
  document.getElementById('cfg_estado').innerHTML=
    '<div style="margin-bottom:13px">'
    +pill(c.zapi,c.zapi?'Z-API conectada':'Z-API NÃO configurada')
    +pill(c.openai,c.openai?'IA varia o texto':'sem IA, texto fixo')+'</div>'
    +(c.zapi?'':'<div class="nota" style="margin-bottom:13px">Sem a Z-API nada é enviado de verdade: '
      +'o sistema grava a mensagem no histórico com o aviso "modo simulado". '
      +'O passo a passo pra ligar está no PLAYBOOK.md.</div>');
  document.getElementById('cfg_msg').textContent='';
  dlgCfg.showModal();
}
async function salvarConfig(){
  const r=await post('/api/config',{meu_whatsapp:V('cfg_num'),hora_resumo:V('cfg_hora'),
    avisos_ligados:document.getElementById('cfg_lig').checked});
  const m=document.getElementById('cfg_msg');
  m.style.color=r.erro?'#c0392b':'var(--verde)';
  m.textContent=r.erro||'Salvo.';
}
async function testarZap(){
  const m=document.getElementById('cfg_msg');
  m.style.color='var(--cinza)'; m.textContent='Mandando...';
  await post('/api/config',{meu_whatsapp:V('cfg_num')});
  const r=await api('/api/testar-whatsapp',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
  m.style.color=r.erro?'#c0392b':'var(--verde)';
  m.textContent=r.erro?('Não saiu: '+r.erro):'Mandei. Confere teu WhatsApp.';
}

${JS_DASH}
${JS_PARTES}
${JS_CAIXA}
${JS_ATIV}

carregar();setInterval(()=>{if(!aberto)carregar()},60000);
</script></body></html>`;
