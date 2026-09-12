import { CSS_VISUAL_DADOS } from './admin-visual-dados.js';

/* Interface da Leon Group. Dados e regras permanecem nos módulos de origem. */
export const CSS_VISUAL = `
:root{--ui-raio:16px;--ui-tempo:220ms;--ui-sucesso:#E4F5E9;--ui-sucesso-borda:#ADD8BB;--ui-borda:#DEDCD5;--ui-ink:#232621;--ui-ease:cubic-bezier(.22,1,.36,1)}
body,body.operacional{color-scheme:light;background:var(--marfim);font-size:14px}
header,body.operacional header{background:var(--preto);padding:13px 26px;gap:16px;min-height:70px}
header .marca-admin{display:flex;align-items:center;gap:18px;flex:none}
header .marca-admin img{display:block;width:112px;height:42px;object-fit:contain}
header .marca-admin small{font-size:12px;font-weight:500;color:#C9C4BB;border-left:1px solid #49433B;padding-left:18px}
header .sair{color:#E9E1D6;padding:8px 11px;border:1px solid #45413A;border-radius:8px;font-size:12px}
header .sair:hover{background:#343029;color:#fff}
.selo{border-radius:5px;letter-spacing:.08em;padding:5px 10px;font-size:11px}
button{transition:background var(--ui-tempo),border-color var(--ui-tempo),color var(--ui-tempo),transform var(--ui-tempo),box-shadow var(--ui-tempo)}
button:disabled{cursor:wait;opacity:.6}
button:not(:disabled):active{transform:scale(.97)}
button:focus-visible,a:focus-visible,summary:focus-visible,[role=button]:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid var(--laranja);outline-offset:3px}
input,select,textarea{border-radius:9px;border-color:var(--ui-borda);background:#fff;color:var(--preto);padding:10px 12px;transition:border-color var(--ui-tempo),box-shadow var(--ui-tempo)}
input:hover,select:hover,textarea:hover{border-color:#BAAB98}
input:focus,select:focus,textarea:focus{border-color:var(--laranja)}
input[type=checkbox]{accent-color:var(--verde)}
button.acao{border-radius:9px;min-height:40px;font-weight:650;padding:10px 17px;background:var(--laranja);box-shadow:0 2px 0 #AA3B1020}
button.acao:hover{background:var(--laranja-esc);box-shadow:0 4px 12px #C447121A}
button.sec{background:#fff;color:var(--preto);box-shadow:none;border:1px solid var(--ui-borda)}
button.sec:hover{background:var(--marfim);color:var(--preto);border-color:var(--laranja)}
.grid button{border-radius:8px;min-height:38px}
.ui-icon{width:19px;height:19px;display:inline-block;vertical-align:middle;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}

/* Mesmas praças, setores e abas, com mais contraste na navegação. */
.relogio{background:var(--branco);color:var(--preto);border-bottom:1px solid var(--ui-borda);padding:10px 26px;gap:0;flex-wrap:wrap;overflow:visible}
.rel-praca,.rel-praca.on{background:transparent;padding:0 18px 0 10px;margin-right:18px;border-right:1px solid var(--areia);border-left:2px solid transparent;cursor:pointer;min-width:145px}
.rel-praca:hover{background:var(--marfim)}
.rel-praca.on{border-left-color:var(--laranja)}
.rel-praca.on.bsb{box-shadow:none;border-left-color:var(--op)}
.rel-cid,.rel-praca.on .rel-cid,.rel-praca.on.bsb .rel-cid{color:var(--cinza);font-size:11px;letter-spacing:.05em}
.rel-hora,.rel-praca.on .rel-hora{font-size:23px;line-height:1.2;color:var(--preto);letter-spacing:-.04em}
.rel-dia,.rel-praca.on .rel-dia{color:var(--cinza);font-size:12px}
.rel-fuso{color:var(--cinza);font-size:10px;line-height:1.3}
.rel-sel,.rel-praca:not(.on) .rel-sel{background:transparent;color:var(--laranja-esc);font-size:12px;letter-spacing:0;border-color:transparent;margin:0;padding:1px 0;min-height:22px}
.rel-estado{padding:2px 14px 2px 0;min-width:205px;gap:5px}
.rel-badge{padding:4px 9px;border-radius:6px;letter-spacing:0;text-transform:none;font-size:12px;font-weight:600}
.rel-badge.aberta{background:var(--ui-sucesso);color:var(--verde)}
.rel-badge.fechada{background:var(--laranja-pal);color:var(--laranja-esc)}
.rel-nota,.rel-dif{color:var(--cinza);font-size:12px;letter-spacing:0;line-height:1.4}
.rel-idi{border:0;padding:0;gap:5px}.rel-idi button{color:var(--cinza);border-color:var(--ui-borda);border-radius:6px;padding:8px 10px;letter-spacing:0}
.rel-idi button.on{background:var(--preto);color:var(--marfim);border-color:var(--preto)}
.setores{padding:17px 26px 12px;background:var(--marfim);gap:8px;flex-wrap:wrap}
.setores button{padding:10px 20px;border:1px solid var(--ui-borda);border-radius:10px;color:var(--cinza);background:#fff;font-size:13px;letter-spacing:.04em}
.setores button:hover{color:var(--preto);border-color:#B6ACA0}
.setores button.com.on{color:#fff;background:var(--preto);border-color:var(--preto)}
.setores button.op.on{color:#fff;background:var(--op);border-color:var(--op)}
.setores .badge,.setores button.op .badge{background:#FFFFFF20;color:inherit;border-radius:5px;font-size:12px;padding:2px 7px}
.setores button:not(.on) .badge{background:var(--marfim)}
.faixa{height:0}
nav{position:relative;margin:0 26px;padding:5px;background:#EBE5DC;border:1px solid #DFD7CA;border-radius:12px;gap:4px;scrollbar-width:thin;isolation:isolate}
nav button{position:relative;z-index:1;border:0;border-radius:8px;padding:10px 15px;font-size:13px;font-weight:550;line-height:1.4}
nav button.on,nav button.op.on{color:#fff;background:var(--laranja-esc);border:0;font-weight:650}
body.operacional nav button.on{background:var(--op)}
nav button:not(.on):hover{background:#FFFFFF90;color:var(--preto)}
nav .sep{margin:0 5px;background:#CBBFAE;height:20px}
.ui-nav-marker{position:absolute;top:5px;height:38px;background:var(--laranja-esc);border-radius:8px;z-index:0;pointer-events:none}
body.operacional .ui-nav-marker{background:var(--op)}
nav.ui-marker-on button.on{background:transparent}
main{padding:24px 26px 50px}
.ui-view-head{display:flex;align-items:center;justify-content:space-between;gap:18px;margin:0 0 20px}
.ui-view-head h1{font-size:28px;line-height:1.2;font-weight:700;letter-spacing:-.045em}
.ui-view-head p{font-size:13px;color:var(--cinza);margin-top:6px}
.ui-view-head .acao{white-space:nowrap}
.ui-loading{padding:28px;border:1px solid var(--ui-borda);border-radius:16px;background:#fff;color:var(--cinza);display:flex;align-items:center;gap:12px}
.ui-loading i{width:19px;height:19px;border:2px solid var(--areia);border-top-color:var(--laranja);border-radius:50%;animation:leon-loading 800ms linear infinite}
@keyframes leon-loading{to{transform:rotate(360deg)}}

/* A assinatura dos indicadores é forte; os números permanecem reais. */
.kpis{gap:12px;margin-bottom:22px}
.kpi{flex:1 1 140px;min-width:120px;padding:18px 20px;border-radius:var(--ui-raio);border-color:var(--ui-borda);background:#fff;position:relative;overflow:hidden}
.kpi b{font-size:34px;line-height:1.15;font-weight:700;letter-spacing:-.045em;font-variant-numeric:tabular-nums}
.kpi span{display:block;margin-top:10px;font-size:13px;letter-spacing:0;text-transform:none}
.kpi .ui-kpi-icon{position:absolute;right:17px;top:18px;width:32px;height:32px;border-radius:9px;background:var(--marfim);color:var(--laranja-esc);display:grid;place-items:center}
.kpi[data-etapa=whatsapp]{background:var(--ui-ink);border-color:var(--ui-ink);color:#fff}
.kpi[data-etapa=whatsapp] span{color:#DDD7CA}.kpi[data-etapa=whatsapp] .ui-kpi-icon{background:#FFFFFF12;color:#F69462}
.kpi[data-etapa=call_fechada]{background:var(--ui-sucesso);border-color:var(--ui-sucesso-borda)}
.kpi[data-etapa=call_fechada] b,.kpi[data-etapa=call_fechada] span{color:var(--verde)}
.kpi[data-etapa=call_fechada] .ui-kpi-icon{background:#CBE8D5;color:var(--verde)}
.kpis .alerta{flex-basis:100%;min-width:0;font-size:13px}
.quadro{gap:14px;padding:2px 1px 20px;scrollbar-width:thin;scrollbar-color:#BEA98F transparent}
.col{min-width:246px;max-width:246px;border-radius:15px;background:#EBE5DB;border:1px solid #E0D7CB;overflow:hidden}
.col h3{background:transparent;padding:16px 14px 12px;font-size:12px;align-items:center;letter-spacing:.04em;color:#44473F;border:0}
.col h3:before{content:'';width:7px;height:7px;flex:none;background:#A49A8A;border-radius:50%;margin-right:8px}
.col h3 em{margin-left:auto;background:#fff;border-radius:6px;font-size:12px;padding:2px 7px}
.col[data-etapa=super_hot] h3:before,.col[data-etapa=responderam] h3:before{background:var(--laranja)}
.col[data-etapa=fechou] h3:before{background:var(--verde)}
.col[data-etapa=no_show] h3:before{background:#C0392B}
.col .ativ{background:transparent;border:0;color:#806852;font-size:12px;padding:0 14px 8px 29px}
.cards{padding:8px;gap:10px}
.card{background:#fff;border-color:#DCD6CC;border-radius:11px;padding:15px 13px;box-shadow:0 2px 3px #27201706;transition:border-color var(--ui-tempo),box-shadow var(--ui-tempo),transform var(--ui-tempo)}
.ui-lead-top{display:flex;align-items:center;gap:9px;margin-bottom:12px}
.ui-avatar{width:34px;height:34px;display:grid;place-items:center;border-radius:9px;background:#EFE8DA;color:#77603D;font-size:12px;font-weight:700;flex:none;letter-spacing:.02em}
.card b{font-size:14px;line-height:1.35;margin:0;overflow-wrap:anywhere}
.card small{display:block;font-size:12px;line-height:1.55;color:var(--cinza)}
.card .t{display:flex;align-items:center;gap:5px;font-size:12px;margin-top:13px;padding-top:11px;border-top:1px solid #ECE7DF}
.card .t .ui-icon{width:14px;height:14px}
.card .ui-card-arrow{margin-left:auto;color:#7E7B73}
.col[data-etapa=super_hot] .card{border-top:3px solid var(--laranja)}
.col[data-etapa=responderam] .ui-avatar{background:var(--laranja-pal);color:var(--laranja-esc)}
.col[data-etapa=fechou] .card{border-color:var(--ui-sucesso-borda);background:#F4FBF6}
.cli{border-radius:var(--ui-raio);padding:20px 22px;background:#fff;border-color:var(--ui-borda);margin-bottom:15px;transition:border-color var(--ui-tempo),box-shadow var(--ui-tempo),transform var(--ui-tempo)}
.cli>div:first-child{gap:10px;flex-wrap:wrap}
.cli .ui-client-name{display:flex;gap:12px;align-items:center;min-width:0}
.cli .ui-avatar{width:40px;height:40px;font-size:14px;background:var(--op-claro);color:var(--op)}
.cli h3{font-size:18px;letter-spacing:-.025em;overflow-wrap:anywhere}
.cli .meta{margin:11px 0 15px;line-height:1.65;font-size:13px}
.cli.concluida{border-left:4px solid var(--verde);background:#F1FAF4}
.cli.concluida .ui-avatar{background:var(--verde);color:#fff}
.cli.atrasada{border-left:4px solid #C0392B;background:#FFFAF8}
.ui-client-foot{display:flex;align-items:center;gap:20px;justify-content:space-between;flex-wrap:wrap}
.ui-client-progress{width:180px;max-width:100%;font-size:12px;color:var(--cinza)}
.ui-client-progress span{display:block;margin-bottom:5px}
.ui-client-progress progress{display:block;width:100%;height:7px;border:0;appearance:none;border-radius:10px;overflow:hidden;background:var(--areia)}
.ui-client-progress progress::-webkit-progress-bar{background:var(--areia)}
.ui-client-progress progress::-webkit-progress-value{background:var(--op);border-radius:10px}
.ui-client-progress progress::-moz-progress-bar{background:var(--op)}
.concluida .ui-client-progress progress::-webkit-progress-value{background:var(--verde)}
.concluida .ui-client-progress progress::-moz-progress-bar{background:var(--verde)}
.pills{gap:7px}.pill{font-size:12px;border-radius:7px;padding:5px 10px;background:#F5F1EA;border-color:#E5DFD5}
.pill.ok{background:#DCEFE2;border-color:#B8D7C3;color:#245B40}.pill.ok:before{content:'✓ ';font-weight:700}
@media(hover:hover){.card:hover{transform:translateY(-5px);border-color:var(--laranja);box-shadow:0 9px 18px #31211412}.cli:hover{transform:translateY(-3px);border-color:var(--op);box-shadow:0 8px 20px #3121140C}.card:hover .ui-card-arrow{color:var(--laranja);transform:translateX(3px)}}

/* Painel de trabalho, sem esconder roteiro ou etapas. */
body:has(.painel.on):after{content:'';position:fixed;inset:0;background:#17171724;pointer-events:none;z-index:19;animation:leon-dim 300ms ease-out}
.painel{width:min(700px,100%);padding:28px;background:var(--branco);border-color:#CEC3B2;box-shadow:-16px 0 50px #17171720}
.painel.on{animation:leon-painel 520ms var(--ui-ease)}
.painel>.x{position:sticky;top:0;float:right;z-index:2;display:grid;place-items:center;width:38px;height:38px;border:1px solid var(--ui-borda);border-radius:10px;background:#fff;font-size:24px;line-height:1}
.painel>h2{padding-right:44px;font-size:26px!important;letter-spacing:-.035em;line-height:1.3;margin-bottom:7px}
.painel>section{margin-top:25px;padding-top:20px}
.painel h4{font-size:13px;letter-spacing:.07em;font-weight:700;color:var(--preto);margin-bottom:14px}
.painel label{font-size:13px;margin-bottom:5px}
.painel .kpi{padding:14px;min-width:120px}.painel .kpi b{font-size:26px}
.rel-card,.passo-agora,.portao,.peca,.rev{border-radius:14px}
.rel-card{padding:18px 20px;margin-top:18px;background:#252823}
.rel-card .rc-rot{font-size:11px;color:#C6C5BC;letter-spacing:.06em}
.rel-card .rc-rot b{color:#F69462;font-size:12px}
.rel-card .rc-hora{font-size:32px;margin:4px 0}
.rel-card .rc-vs,.rel-card .rc-nada,.rel-card .rc-dupla{color:#C6C5BC;font-size:12px}
.passo-agora{padding:18px 20px;background:var(--op)}
.passo-agora .r{font-size:11px;color:#BBD8E8;letter-spacing:.08em}
.passo-agora b{font-size:18px}.passo-agora span{font-size:13px;color:#E1EDF3}
.passo-agora.fim{background:#22593F}.passo-agora.fim .r{color:#BDE8CE}
.linha{padding:10px 4px;font-size:13px;border-radius:8px;transition:background 240ms}
.linha.feito{color:var(--verde);background:var(--ui-sucesso)}
.chk-item{border-radius:9px;transition:background 240ms,border-color 240ms;padding:12px 10px;margin:5px 0;border:1px solid var(--areia);background:#fff}
.chk-item .t{font-size:14px}.chk-item .d{font-size:12px}
.chk-item input,.linha input[type=checkbox]{width:17px;height:17px;flex:none}
.chk-item.ok{background:var(--ui-sucesso);border-color:var(--ui-sucesso-borda)}
.chk-item.ok .t{color:var(--verde)}
.chk-barra{height:9px;margin:11px 0 8px}.chk-barra i{transition:width 600ms var(--ui-ease),background 300ms}
.chk-area>b{font-size:12px}.chk-area>b em{font-size:12px}
.portao.pronto{border-color:var(--ui-sucesso-borda)}.portao-cab{padding:17px 18px}.portao-cab b{font-size:17px}
.pg.ok .pg-ic{background:var(--verde);color:#fff}.pg.ok{background:#F0FAF3}.pg{padding:14px 18px}
.portao.forcada .portao-cab{background:var(--laranja-pal)}
.peca.ok>summary{background:#EFF9F2}.peca>summary{padding:15px 16px;font-size:14px}
.peca[open]>.peca-corpo,.at-l.abre .at-corpo{animation:leon-detalhe 350ms var(--ui-ease)}
.rq-e{border-radius:10px;padding:15px 10px;margin:6px 0;gap:12px;grid-template-columns:28px 1fr}
.rq-n{width:27px;height:27px;font-size:13px;line-height:27px;background:var(--ui-ink)}
.rq-e.feito{background:#F0F8F2}.rq-c:has(input:checked){background:var(--ui-sucesso)}
.rq-c input[type=checkbox]{width:17px;height:17px;padding:0;accent-color:var(--verde)}
.rq-et,.at-grupo>b,.at-rot{font-size:12px;line-height:1.4;letter-spacing:.07em}
.rq-fala{font-size:15px;line-height:1.65;padding:13px 14px}
.rq-pq,.rq-dica{font-size:12px;line-height:1.6}
.at-l{border-radius:11px}.at-topo{padding:13px}.at-nome{font-size:14px}.at-l.feito{background:#F0F8F2}
.at-corpo{border-radius:0 0 11px 11px}.pr-txt{line-height:1.6}
dialog{margin:auto;border:1px solid var(--areia);border-radius:18px;box-shadow:0 24px 70px #17171730}
dialog[open]{animation:leon-detalhe 350ms var(--ui-ease)}
.ui-completion{position:fixed;right:28px;bottom:26px;z-index:90;display:flex;align-items:center;gap:13px;max-width:min(390px,calc(100% - 32px));padding:16px 20px;border:1px solid #80B597;border-radius:15px;background:#173E2C;color:#fff;box-shadow:0 12px 36px #173E2C30;pointer-events:none}
.ui-completion[hidden]{display:none}.ui-completion .ui-confirm-icon{display:grid;place-items:center;width:38px;height:38px;flex:none;border-radius:50%;background:#BCEBCC;color:#17462F}
.ui-completion b{display:block;font-size:15px}.ui-completion span{display:block;font-size:12px;color:#CBE4D4;margin-top:3px}
@keyframes leon-painel{from{transform:translateX(90px)}to{transform:translateX(0)}}
@keyframes leon-detalhe{from{transform:translateY(14px);opacity:.35}to{transform:translateY(0);opacity:1}}
@keyframes leon-dim{from{background:#17171700}to{background:#17171724}}
${CSS_VISUAL_DADOS}
@media(max-width:800px){
 header,body.operacional header{padding:12px 16px;gap:10px;flex-wrap:wrap}
 header .marca-admin{gap:12px}header .marca-admin img{width:100px;height:38px}header .marca-admin small{padding-left:12px}
 .relogio{padding:12px 16px;gap:10px 0}.rel-praca,.rel-praca.on{min-width:130px;margin-right:12px;padding-right:12px}
 .rel-hora,.rel-praca.on .rel-hora{font-size:22px}.rel-estado{min-width:190px;padding-right:8px}.rel-idi{margin-left:auto}
 .setores{padding:14px 16px 10px}.setores button{padding:10px 15px}nav{margin:0 16px}nav button{padding:10px 13px}
 main{padding:20px 16px 35px}.ui-view-head h1{font-size:24px}
 .kpis{gap:9px}.kpi{padding:16px;flex-basis:125px}.kpi b{font-size:29px}.kpi .ui-kpi-icon{right:12px;top:15px;width:28px;height:28px}
 .cli{padding:17px}.painel{padding:22px}.ui-client-progress{width:100%}
 .painel .grid{grid-template-columns:repeat(auto-fill,minmax(125px,1fr))}
}
@media(max-width:600px){
 header .marca-admin small{display:none}header,body.operacional header{gap:6px;min-height:62px}
 header .marca-admin img{width:82px;height:32px}header .sair{padding:7px 8px;font-size:11px}header .sair:last-child{margin-left:0!important}
 .relogio{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:11px 6px}
 .rel-praca,.rel-praca.on{min-width:0;margin:0;padding:0 7px}.rel-dia,.rel-praca.on .rel-dia{font-size:11px;line-height:1.4}
 .rel-sel{max-width:100%;font-size:11px}.rel-estado{grid-column:1/-1;grid-row:2;min-width:0;padding:0}
 .rel-idi{grid-column:3;grid-row:1;align-self:center;flex-direction:column;margin:0}.rel-idi button{font-size:11px;padding:7px 9px}
 .kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}.kpi{min-width:0;padding:13px 10px}.kpi .ui-kpi-icon{display:none}
 .kpi b{font-size:25px;overflow-wrap:anywhere}.kpi span{font-size:11px;margin-top:7px;letter-spacing:-.02em;overflow-wrap:anywhere}.kpis .alerta{grid-column:1/-1}
}
@media(max-width:430px){.ui-view-head{align-items:flex-start;gap:10px}.ui-view-head h1{font-size:23px}.ui-view-head .acao{font-size:12px;padding:10px 12px}.kpi{flex-basis:calc(50% - 9px)}.ui-completion{right:16px;bottom:16px}}
@media(pointer:coarse){button.acao,.setores button,nav button,.grid button,summary{min-height:44px}.painel>.x{width:44px;height:44px}input:not([type=checkbox]):not([type=file]),select,textarea{font-size:16px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;
