/* Acabamento do dashboard e do caixa sobre o HTML existente.
   A geometria do funil e os valores das barras continuam vindo dos dados.
   As duas moedas mantêm a ordem definida pelos componentes. */
export const CSS_VISUAL_DADOS = `
.dash{max-width:none}
.dash-grid{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(300px,1fr);gap:22px;align-items:start}
.dash-overview,.dash-insight,.dash-money{border:0;padding:0;margin:0;min-width:0}
.dash-money{margin-top:26px}
.dash-grid h3,.dash-money>h3{font-size:17px;font-weight:700;letter-spacing:-.025em;line-height:1.4;margin:0 0 14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.dash-grid h3:before,.dash-money>h3:before{content:'';width:4px;height:17px;background:var(--laranja);border-radius:3px}
.dash-grid h3 em,.dash-money>h3 em{font-size:12px;font-style:normal;font-weight:400;color:var(--cinza);letter-spacing:0}
.dash .funil{padding:24px 20px 20px;border-color:var(--ui-borda);border-radius:16px}
.dash .diag{border-radius:16px;background:var(--ui-ink);border-top:4px solid var(--laranja);padding:24px}
.dash .diag .grande{font-size:18px;letter-spacing:-.025em}
.dash .diag li{font-size:13px}
.dash .entrou-cx,.dash .cx-topo{border-radius:16px;background:var(--ui-ink);padding:26px}
.dash .entrou-cx .v,.dash .cx-tri .u{font-size:34px;letter-spacing:-.045em;line-height:1.25}
.dash .cx-tri .saldo .u{color:#9DE5B7}
.dash .d2{border-color:var(--ui-borda);border-radius:14px;background:#fff}
.dash .d2 .u{font-size:23px;letter-spacing:-.035em}
.dash .d2.forte{background:var(--ui-sucesso);border-color:var(--ui-sucesso-borda)}
.dash .d2.forte .u,.dash .d2.forte .b{color:var(--verde)}
.dash .fx-fuga{grid-template-columns:repeat(2,minmax(0,1fr))}
@media(min-width:1051px){.dash-grid .fx-l,.dash-grid .fx-p{grid-template-columns:112px minmax(100px,1fr) 102px;gap:0 12px}}
@media(max-width:1050px){.dash-grid{grid-template-columns:1fr}.dash .diag .grande{font-size:17px}}
@media(max-width:600px){.dash .entrou-cx,.dash .cx-topo{padding:20px}.dash .entrou-cx .v,.dash .cx-tri .u{font-size:27px}.dash .funil{padding:20px 12px}.dash .fg{padding:11px!important}.dash .fg span{font-size:10px!important}}

.dash > h3{font-size:14px;font-weight:750;letter-spacing:-.015em;
  line-height:1.45;margin:24px 0 11px}
.dash > h3:first-child{margin-top:0}
.dash > h3 em{font-size:12px;line-height:1.5;font-weight:400;
  letter-spacing:0;color:var(--cinza)}
.dash .funil,.dash .entrou-cx,.dash .d2,.dash .mes-t,.dash .cli-t,
.dash .diag,.dash .ia-saida,.dash .vazio,.dash .cx-topo,
.dash .cat-cx,.dash .ext,.dash .sai-form{border-radius:12px}

/* Etapas e conversões: nenhuma alteração nas larguras ou alturas das faixas. */
.dash .fx-rot{line-height:1.4}
.dash .fx-rot small,.dash .fx-n small{font-size:11px;line-height:1.4}
.dash .fx-p{height:auto;min-height:34px}
.dash .fx-p .meio{white-space:normal;overflow:visible;flex-wrap:wrap;
  line-height:1.4;padding:7px 0;gap:5px 8px}
.dash .fx-p .tag{border-radius:5px;font-size:11px;line-height:1.2;
  letter-spacing:.02em}
.dash .fx-p .seta{color:var(--cinza)}
.dash .fx-faixa i,.dash .cat-l .bar i,.dash .mes-l .bar i{transition:none}
.dash .fx-fuga{gap:10px}
.dash .fg{border-radius:10px;padding:12px 14px}
.dash .fg span{font-size:11px;letter-spacing:.04em}
.dash .fg b{font-size:20px;line-height:1.35;font-variant-numeric:tabular-nums}
.dash .fg.fechou{background:#e5f0e9;border-color:#cbded0}
.dash .fg.perdeu{border-left:3px solid var(--laranja-esc)}
.dash .fx-anom,.dash .aviso-cot,.dash .acao-cx{border-radius:0 10px 10px 0}

/* Texto de apoio legível nos cartões escuros, inclusive valores em real. */
.dash .entrou-cx .r,.dash .entrou-cx .sub,.dash .entrou-rod,
.dash .diag .cab,.dash .cx-tri .r,.dash .cx-tri .b,
.dash .cx-tri small,.dash .cx-rod{color:#c9c4bb}
.dash .entrou-cx .sub b,.dash .entrou-rod b,.dash .cx-rod b,
.dash .cx-tri .saldo .b{color:var(--marfim)}
.dash .entrou-cx .r,.dash .diag .cab,.dash .cx-tri .r{font-size:11px;
  letter-spacing:.09em;line-height:1.4}
.dash .entrou-rod,.dash .cx-rod{border-color:#3b3833;line-height:1.55}
.dash .diag{padding:20px 22px}
.dash .diag .grande{line-height:1.6}
.dash .diag li{line-height:1.55;padding-left:12px}
.dash .diag .bem{border-left-color:#6bbf8f}
.dash .diag .grande b{color:#f08a58}
.dash .ia-saida{padding:18px 20px}
.dash .ia-saida h5{font-size:11px;letter-spacing:.07em}
.dash .ia-et{border-top-color:var(--areia)}

/* O dinheiro mantém a hierarquia dólar seguido de real. */
.dash .duo{gap:10px}
.dash .d2{padding:15px 16px}
.dash .d2 .r{font-size:11px;line-height:1.4;letter-spacing:.04em}
.dash .d2 .u,.dash .d2 .b{overflow-wrap:anywhere}
.dash .d2 .b{margin-top:3px}
.dash .d2.forte .b{opacity:1}
.dash .d2 small{font-size:11.5px;line-height:1.5}
.dash .mes-l,.dash .cli-l,.dash .ext-l{border-bottom-color:var(--areia)}
.dash .mes-l.cab,.dash .ext-dia{font-size:11px;letter-spacing:.05em}
.dash .mes-l{padding-top:11px;padding-bottom:11px}
.dash .mes-l .bar,.dash .cat-l .bar{border-radius:4px}
.dash .cli-l{padding:13px 16px}
.dash .cli-l .top{min-width:0}
.dash .cli-l .top > b{overflow-wrap:anywhere}
.dash .cli-l .top .tipo{font-size:10px;border-radius:5px;letter-spacing:.05em}
.dash .cli-l .det,.dash .cli-l .ent{font-size:12px}
.dash .cli-l .ent{border-left-color:#d8ccba}

/* Caixa: meses, categorias, extrato e formulário conservam a sequência atual. */
.dash .cx-mes{gap:8px;margin-bottom:20px}
.dash .cx-mes button{border-radius:8px;border-color:#4c4740;
  color:var(--marfim);min-height:32px;line-height:1.35}
.dash .cx-mes button.on{color:var(--preto)}
.dash .cx-mes .nav{min-width:32px}
.dash .cx-tri .saldo{border-color:#3b3833}
.dash .cx-tri small{font-size:11.5px;line-height:1.5}
.dash .cot-bt{border-color:#4c4740;border-radius:7px;min-height:30px;
  color:var(--marfim);font-size:12px}
.dash .cat-cx{padding:14px 18px}
.dash .cat-l{padding-top:10px;padding-bottom:10px}
.dash .cat-l + .cat-l{border-top:1px solid var(--areia)}
.dash .cat-l .rot{line-height:1.45}
.dash .cat-l .val span{font-size:11.5px}
.dash .cx-filtros{gap:8px}
.dash .chip{min-height:34px;padding:7px 13px;line-height:1.35}
.dash .chip em{opacity:1;font-variant-numeric:tabular-nums}
.dash .ext-dia{padding-top:10px;padding-bottom:10px;flex-wrap:wrap}
.dash .ext-l{padding-top:12px;padding-bottom:12px}
.dash .ext-l .oq{min-width:0;overflow-wrap:anywhere}
.dash .ext-l .oq span{line-height:1.5}
.dash .ext-l .oq .tag{border-radius:5px;font-size:10px;letter-spacing:.04em}
.dash .ext-l .bts{flex-wrap:wrap}
.dash .ext-l .bts button{border-radius:7px;min-height:30px;
  color:var(--preto);font-size:11.5px}
.dash .sai-form{padding:18px 20px}
.dash .sai-form h5{font-size:14px}
.dash .sai-form .lin{gap:10px}
.dash .sai-form .rec{line-height:1.5}
.dash .cat-dica{font-size:12px;line-height:1.5}
.dash .cx-mes button:focus-visible,.dash .cot-bt:focus-visible,
.dash .chip:focus-visible,.dash .ext-l .bts button:focus-visible{
  outline:2px solid var(--laranja);outline-offset:3px}
@media (hover:hover){
  .dash .mes-l:not(.cab):hover,.dash .cli-l:hover,.dash .cat-l:hover,
  .dash .ext-l:hover{background:var(--marfim)}
  .dash .cx-mes button:not(:disabled):not(.on):hover,
  .dash .cot-bt:hover{border-color:var(--laranja);color:#f08a58}
}

/* Tabelas densas continuam completas e podem rolar dentro de seus cartões. */
@media (max-width:760px){
  .dash .cat-cx{overflow-x:auto;overscroll-behavior-x:contain}
  .dash .cat-l{grid-template-columns:minmax(100px,1fr) minmax(80px,1fr) 44px 108px;
    min-width:440px;gap:10px}
  .dash .cat-l .bar{display:block}
}
@media (max-width:700px){
  .dash > h3 em{display:block;margin-top:3px}
  .dash .mes-t{overflow-x:auto;overscroll-behavior-x:contain}
  .dash .mes-l{grid-template-columns:52px minmax(80px,1fr) 112px 112px;
    min-width:440px;gap:8px}
  .dash .mes-l .brl-col{display:block}
  .dash .diag,.dash .ia-saida,.dash .sai-form{padding:17px 18px}
}
@media (max-width:640px){
  .dash .fx-rot small{display:block;font-size:10px}
  .dash .fx-n small{font-size:10px}
  .dash .fx-p .meio{font-size:10.5px}
  .dash .fx-p .tag{font-size:10.5px}
}
@media (max-width:420px){
  .dash .ext-l{grid-template-columns:24px minmax(0,1fr);gap:8px}
  .dash .ext-l .vl{grid-column:2;white-space:normal;text-align:left}
  .dash .ext-l .bts{grid-column:2;justify-content:flex-start}
  .dash .cli-l .nums{width:100%;margin-left:0;text-align:left}
}
`;
