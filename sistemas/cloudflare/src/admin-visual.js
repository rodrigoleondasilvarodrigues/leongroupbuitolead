import { CSS_VISUAL_DADOS } from './admin-visual-dados.js';

/* Acabamento do CRM. As regras, as seções e os indicadores continuam nos
   módulos originais. Este CSS entra por último e só apresenta seus estados. */
export const CSS_VISUAL = `
:root{--ui-raio:12px;--ui-tempo:180ms;--ui-sucesso:#E6F2E9;--ui-sucesso-borda:#BBD8C6}
body{color-scheme:light}
body.operacional{background:var(--marfim)}
header,body.operacional header{background:var(--preto);padding:12px 22px;gap:15px;min-height:62px}
header .marca-admin{display:flex;align-items:center;gap:15px;flex:none}
header .marca-admin img{display:block;width:106px;height:40px;object-fit:contain}
header .marca-admin small{font-size:12px;font-weight:500;color:#C9C4BB;border-left:1px solid #403C36;padding-left:15px}
header .sair{color:#C9C4BB;padding:6px 8px;border-radius:6px}
header .sair:hover{background:#2B2824;color:var(--branco)}
.selo{border-radius:5px;letter-spacing:.06em}
button{transition:background var(--ui-tempo),border-color var(--ui-tempo),color var(--ui-tempo),transform var(--ui-tempo)}
button:disabled{cursor:default;opacity:.6}
button:not(:disabled):active{transform:translateY(1px)}
button:focus-visible,a:focus-visible,summary:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid var(--laranja);outline-offset:3px}
input,select,textarea{border-radius:7px;transition:border-color var(--ui-tempo),background var(--ui-tempo);color:var(--preto)}
input:hover,select:hover,textarea:hover{border-color:#CBBEA9}
input[type=checkbox]{accent-color:var(--verde)}
button.acao{border-radius:7px;min-height:36px}
button.sec:hover{background:var(--marfim);color:var(--preto);border-color:var(--laranja)}
.grid button{border-radius:7px}

/* As duas praças e as mesmas abas ficam no topo, em superfícies claras. */
.relogio{background:var(--branco);color:var(--preto);border-bottom:1px solid var(--areia);padding:10px 22px;gap:0;flex-wrap:wrap;overflow:visible}
.rel-praca,.rel-praca.on{background:transparent;padding:0 18px 0 10px;margin-right:18px;border-right:1px solid var(--areia);border-left:2px solid transparent;cursor:pointer;min-width:130px}
.rel-praca:hover{background:var(--marfim)}
.rel-praca.on{border-left-color:var(--laranja)}
.rel-praca.on.bsb{box-shadow:none;border-left-color:var(--op)}
.rel-cid,.rel-praca.on .rel-cid,.rel-praca.on.bsb .rel-cid{color:var(--cinza);font-size:10px;letter-spacing:.08em}
.rel-praca.on.ma .rel-cid{color:var(--laranja-esc)}
.rel-hora,.rel-praca.on .rel-hora{font-size:25px;line-height:1.2;color:var(--preto);letter-spacing:-.04em}
.rel-dia,.rel-praca.on .rel-dia{color:var(--cinza);font-size:11px}
.rel-fuso{color:var(--cinza);font-size:10px;line-height:1.3}
.rel-sel,.rel-praca:not(.on) .rel-sel{background:var(--branco);color:var(--laranja-esc);font-size:11px;letter-spacing:0;border-color:transparent;margin:0;padding:2px 0;min-height:22px}
.rel-estado{padding:2px 14px 2px 0;min-width:200px;gap:5px}
.rel-badge{padding:3px 8px;border-radius:5px;letter-spacing:0;text-transform:none;font-weight:600}
.rel-badge.aberta{background:var(--ui-sucesso);color:var(--verde)}
.rel-badge.fechada{background:var(--laranja-pal);color:var(--laranja-esc)}
.rel-nota,.rel-dif{color:var(--cinza);font-size:11px;letter-spacing:0;line-height:1.4}
.rel-idi{border:0;padding:0;gap:4px}
.rel-idi button{color:var(--cinza);border-color:var(--areia);border-radius:5px;padding:7px 9px;letter-spacing:0}
.rel-idi button.on{background:var(--preto);color:var(--marfim);border-color:var(--preto)}
.setores{padding:13px 22px 10px;background:var(--branco);gap:8px;flex-wrap:wrap}
.setores button{padding:8px 15px;border:1px solid var(--areia);border-radius:8px;color:var(--cinza);font-size:12px}
.setores button:hover{color:var(--preto);background:var(--marfim)}
.setores button.com.on{color:var(--laranja-esc);background:var(--laranja-pal);border-color:#EABE9F}
.setores button.op.on{color:var(--op);background:var(--op-claro);border-color:var(--op-borda)}
.setores .badge,.setores button.op .badge{background:var(--branco);color:inherit;border-radius:4px;font-size:10px;padding:1px 6px}
.faixa{height:0}
nav{background:var(--branco);border-color:var(--areia);gap:3px;scrollbar-width:thin}
nav button{padding:11px 10px;font-size:12px}
nav button.on{color:var(--laranja-esc)}
nav button.op.on{color:var(--op)}
nav button:hover{background:var(--marfim)}
nav .sep{margin:0 5px;background:var(--areia)}
main{padding:18px 22px 50px}

/* Indicadores e fila: mesma densidade, com contraste entre coluna e card. */
.kpis{gap:10px}
.kpi{flex:1 1 106px;min-width:106px;padding:12px 14px;border-radius:var(--ui-raio);position:relative;overflow:hidden}
.kpi:before{content:'';position:absolute;top:0;left:14px;width:24px;height:2px;background:var(--laranja)}
.kpi b{font-size:25px;line-height:1.3;font-weight:650;letter-spacing:-.04em;font-variant-numeric:tabular-nums}
.kpi span{display:block;margin-top:5px;font-size:11px;letter-spacing:0;text-transform:none}
.kpis .alerta{flex-basis:100%;min-width:0}
.quadro{padding:1px 1px 14px;scrollbar-width:thin;scrollbar-color:#CBBEA9 transparent}
.col{border-radius:var(--ui-raio);background:#F0EAE0;overflow:hidden}
.col h3{background:var(--branco);padding:12px;font-size:11px;align-items:center}
.col h3 em{background:var(--marfim);border-radius:5px;font-size:11px}
.col .ativ{background:#F5E5D8;font-size:11px;padding:6px 12px}
.cards{padding:9px;gap:8px}
.card{background:var(--branco);border-color:#DED6C9;border-radius:9px;padding:12px;transition:border-color var(--ui-tempo),background var(--ui-tempo),transform var(--ui-tempo)}
.card b{font-size:13px;margin-bottom:5px}
.card small{display:block;line-height:1.55}
.card .t{font-size:11px;margin-top:9px;padding-top:7px;border-top:1px solid var(--areia)}
.cli{border-radius:var(--ui-raio);padding:16px 18px;transition:border-color var(--ui-tempo),background var(--ui-tempo),transform var(--ui-tempo)}
.cli>div:first-child{gap:7px;flex-wrap:wrap}
.cli h3{font-size:15px;letter-spacing:-.015em;overflow-wrap:anywhere}
.cli .meta{margin:6px 0 11px;line-height:1.7}
.cli.concluida{background:#F4F8F1;border-left:3px solid var(--verde)}
.cli.atrasada{border-left:3px solid #C0392B}
.pills{gap:6px}
.pill{font-size:11px;border-radius:6px;padding:4px 9px}
.pill.ok{background:var(--ui-sucesso);border-color:var(--ui-sucesso-borda)}
.pill.ok:before{content:'✓ ';font-weight:700}
@media(hover:hover){.card:hover,.cli:hover{transform:translateY(-2px);border-color:var(--laranja)}.card:hover{background:#fff}}

/* Detalhes completos. A abertura move o painel, sem transparência no texto. */
.painel{padding:26px 24px;border-color:#D9CFBC;box-shadow:-12px 0 32px #17171712}
.painel.on{animation:leon-painel 230ms ease-out}
.painel>.x{position:sticky;top:0;float:right;z-index:2;display:grid;place-items:center;width:32px;height:32px;border:1px solid var(--areia);border-radius:50%;background:var(--branco);font-size:22px;line-height:1}
.painel>h2{padding-right:40px;letter-spacing:-.02em}
.painel h4{font-size:12px;letter-spacing:.06em}
.painel .kpi{padding:10px 12px}
.painel .kpi b{font-size:21px}
.rel-card,.passo-agora,.portao,.peca,.rev{border-radius:var(--ui-raio)}
.rel-card{padding:15px 17px}
.rel-card .rc-rot{font-size:10px;color:#BFB6A8;letter-spacing:.08em}
.rel-card .rc-rot b{color:#F1AD86;font-size:11px}
.rel-card .rc-vs,.rel-card .rc-nada,.rel-card .rc-dupla{color:#BFB6A8}
.passo-agora .r{font-size:10px;color:#BFB6A8;letter-spacing:.1em}
.passo-agora.fim .r{color:#A8DBBF}
.linha{padding:8px 0}
.linha.feito{color:var(--verde);background:var(--ui-sucesso);border-radius:6px}
.chk-item{border-radius:7px;transition:background var(--ui-tempo);padding:9px 6px}
.chk-item.ok{background:var(--ui-sucesso)}
.chk-item.ok .t{color:var(--verde)}
.chk-item.ok input,.linha.feito input{animation:leon-check 240ms ease-out}
.chk-barra{height:7px}
.chk-barra i{transition:width 320ms ease-out,background var(--ui-tempo)}
.portao.pronto{border-color:var(--ui-sucesso-borda)}
.pg.ok .pg-ic{background:var(--verde);color:#fff}
.pg.ok{background:#F4F8F1}
.portao.forcada .portao-cab{background:var(--laranja-pal)}
.peca.ok>summary{background:#F4F8F1}
.peca[open]>.peca-corpo,.at-l.abre .at-corpo{animation:leon-conteudo 180ms ease-out}
.rq-e{border-radius:8px;padding:12px 6px}
.rq-e.feito{background:#F4F8F1}
.rq-c:has(input:checked){background:var(--ui-sucesso)}
.rq-c input[type=checkbox]{width:16px;height:16px;padding:0;accent-color:var(--verde)}
.rq-et,.at-grupo>b,.at-rot{font-size:11px;line-height:1.3;letter-spacing:.07em}
.at-l{border-radius:9px}
.at-l.feito{background:#F4F8F1}
.at-l.feito .at-ic{animation:leon-check 240ms ease-out}
.at-corpo{border-radius:0 0 9px 9px}
.pr-txt{line-height:1.6}
dialog{margin:auto;border:1px solid var(--areia);border-radius:14px}
dialog[open]{animation:leon-conteudo 180ms ease-out}
@keyframes leon-painel{from{transform:translateX(18px)}to{transform:translateX(0)}}
@keyframes leon-conteudo{from{transform:translateY(4px)}to{transform:translateY(0)}}
@keyframes leon-check{0%{transform:scale(.85)}65%{transform:scale(1.12)}100%{transform:scale(1)}}
@media(max-width:700px){
 header,body.operacional header{padding:10px 12px;gap:9px;flex-wrap:wrap}
 header .marca-admin{gap:9px}header .marca-admin img{width:90px;height:34px}
 header .marca-admin small{padding-left:9px}
 .relogio{padding:10px 12px;gap:10px 0}
 .rel-praca,.rel-praca.on{min-width:110px;margin-right:12px;padding-right:12px}
 .rel-hora,.rel-praca.on .rel-hora{font-size:23px}
 .rel-estado{min-width:180px;padding-right:8px}.rel-idi{margin-left:auto}
 .setores{padding:12px 12px 8px}.setores button{padding:9px 12px}
 nav{padding:0 12px}main{padding:14px 12px 35px}
 .kpis{gap:7px}.kpi{padding:10px;flex-basis:90px;min-width:90px}
 .kpi b{font-size:23px}.kpi:before{left:10px}
 .cli{padding:14px}.painel{padding:20px 16px}
 .painel .grid{grid-template-columns:repeat(auto-fill,minmax(125px,1fr))}
}
@media(pointer:coarse){
 button.acao,.setores button,nav button,.grid button,summary{min-height:44px}
 .painel>.x{width:44px;height:44px}
 input:not([type=checkbox]):not([type=file]),select,textarea{font-size:16px}
}
${CSS_VISUAL_DADOS}
/* Sem movimento quando essa é a preferência do dispositivo. */
@media(prefers-reduced-motion:reduce){
 *,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
}
`;
