/* ═══════════════ O ROTEIRO DA LIGAÇÃO NA TELA ═══════════════
   ANTES: cinco campos de texto em branco (rapport, budget, authority, need,
   timeline) com uma dica de 11px em cada. Servia para anotar depois da
   ligação. Não servia para conduzir a ligação, que é quando se ganha ou se
   perde a venda.

   AGORA: o roteiro da Aula 03 aberto na tela, etapa por etapa, com a fala já
   preenchida com o nome e a empresa do lead, o campo de captura ao lado da
   etapa que o alimenta, e no fim o checklist da confirmação ao vivo.

   A decisão de desenho: a FALA é o elemento maior da linha. O "por quê" fica
   pequeno e cinza. Quem está com o telefone no ouvido precisa achar a frase
   em meio segundo, não ler explicação.

   O checklist de confirmação fica separado e destacado porque ele acontece
   com o lead AINDA NO TELEFONE, e é a única parte do processo que ataca o
   no-show antes de ele existir.                                            */

import { ROTEIRO, CONFIRMACAO, FECHO } from "./conteudo-qualificacao.js";

export const CSS_QUAL = `
.rq-cab{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:11px}
.rq-cab .prog{margin-left:auto;font:600 11.5px/1 ui-monospace,monospace;color:var(--cinza)}
.rq-cab .prog b{color:var(--preto)}
.rq-tom{background:var(--areia);border-radius:6px;padding:9px 12px;font-size:11.5px;
  line-height:1.5;color:var(--cinza);margin-bottom:12px}
.rq-tom b{color:var(--preto)}

.rq-e{display:grid;grid-template-columns:26px 1fr;gap:10px;padding:11px 0;
  border-top:1px solid var(--areia)}
.rq-e:first-of-type{border-top:0}
.rq-n{font:700 12px/22px ui-monospace,monospace;text-align:center;color:var(--marfim);
  background:var(--preto);border-radius:50%;width:22px;height:22px}
.rq-e.feito .rq-n{background:var(--verde)}
.rq-et{font:700 9.5px/1 inherit;letter-spacing:.13em;text-transform:uppercase;
  color:var(--cinza);margin-bottom:5px}
.rq-fala{font-size:14px;line-height:1.55;white-space:pre-wrap;background:var(--branco);
  border:1px solid var(--areia);border-left:3px solid var(--laranja);border-radius:0 6px 6px 0;
  padding:9px 12px;cursor:pointer}
.rq-fala:hover{border-left-color:var(--laranja-esc);background:#fff}
.rq-fala.copiado{border-left-color:var(--verde)}
.rq-pq{font-size:11.5px;line-height:1.5;color:var(--cinza);margin-top:6px}
.rq-pq b{color:var(--preto);font-weight:600}
.rq-dica{font-size:11.5px;line-height:1.5;color:var(--laranja-esc);margin-top:5px}
.rq-e input{margin-top:7px}

.rq-conf{margin-top:15px;border:1px solid var(--laranja);border-radius:8px;overflow:hidden}
.rq-conf>b{display:block;background:var(--laranja-pal);color:var(--laranja-esc);
  font:700 10px/1 inherit;letter-spacing:.12em;text-transform:uppercase;padding:9px 12px}
.rq-conf .aviso{font-size:11.5px;line-height:1.5;color:var(--cinza);padding:9px 12px 4px}
.rq-c{display:grid;grid-template-columns:20px 1fr;gap:9px;padding:9px 12px;
  border-top:1px solid var(--areia);align-items:start}
.rq-c input{margin-top:3px}
.rq-c .t{font-size:13px;font-weight:600;line-height:1.4}
.rq-c .f{font-size:12px;line-height:1.5;color:var(--cinza);margin-top:3px;
  white-space:pre-wrap;cursor:pointer}
.rq-c .f:hover{color:var(--preto)}
.rq-fecho{font-size:12.5px;line-height:1.5;padding:11px 12px;border-top:1px solid var(--areia);
  background:var(--branco);white-space:pre-wrap;cursor:pointer}
`;

export const JS_QUAL = `
const ROTEIRO=${JSON.stringify(ROTEIRO)};
const CONFIRMACAO=${JSON.stringify(CONFIRMACAO)};
const FECHO=${JSON.stringify(FECHO)};

function rqPreencher(t,l){
  const primeiro=(l&&l.nome?String(l.nome):'').trim().split(/\\s+/)[0]||'amigo';
  return String(t||'')
    .split('{primeiro}').join(primeiro)
    .split('{empresa}').join((l&&l.empresa)||'sua empresa')
    .split('{palpite}').join((l&&l.nicho)||'construção')
    .split('{janela}').join((l&&l.janela)||'6 e 8 da noite');
}

function rqCopiar(el){
  const t=el.innerText;
  navigator.clipboard.writeText(t).then(function(){
    el.classList.add('copiado');
    setTimeout(function(){el.classList.remove('copiado')},1400);
  }).catch(function(){});
}

// quais etapas já têm resposta guardada: serve pro contador e pra bolinha verde
function rqFeito(l,campo){
  if(!campo)return false;
  const v=l?l[campo]:null;
  return !!(v&&String(v).trim());
}

function l_roteiro(l){
  const marcados=(l&&l.confirmacao_ao_vivo?String(l.confirmacao_ao_vivo):'').split(',').filter(Boolean);
  const comCampo=ROTEIRO.filter(function(e){return e.campo});
  const prontos=comCampo.filter(function(e){return rqFeito(l,e.campo)}).length;

  let h='<div class="rq-cab"><span class="prog"><b>'+prontos+'</b>/'+comCampo.length+' respondidas</span></div>';
  h+='<div class="rq-tom"><b>Venda não pode parecer venda.</b> Sem entusiasmo de vendedor na abertura. '+
     'O script é âncora, não robô: a resposta importa, a frase exata não. Toque numa fala para copiar.</div>';

  ROTEIRO.forEach(function(e){
    const feito=rqFeito(l,e.campo);
    h+='<div class="rq-e'+(feito?' feito':'')+'"><div class="rq-n">'+e.n+'</div><div>';
    h+='<div class="rq-et">'+esc(e.etapa)+'</div>';
    h+='<div class="rq-fala" onclick="rqCopiar(this)">'+esc(rqPreencher(e.fala,l))+'</div>';
    if(e.dica)h+='<div class="rq-dica">'+esc(e.dica)+'</div>';
    if(e.porque)h+='<div class="rq-pq"><b>Por quê:</b> '+esc(e.porque)+'</div>';
    if(e.campo)h+='<input id="q_'+e.campo+'" placeholder="o que ele respondeu" value="'+esc(l&&l[e.campo]?l[e.campo]:'')+'">';
    h+='</div></div>';
  });

  h+='<div class="rq-conf"><b>Confirmação ao vivo</b>';
  h+='<div class="aviso">Isto acontece com ele <b>ainda no telefone</b>, não depois por mensagem. '+
     'É a única parte do processo que ataca o no-show antes de ele existir.</div>';
  CONFIRMACAO.forEach(function(c){
    const on=marcados.indexOf(c.id)>=0;
    h+='<label class="rq-c"><input type="checkbox" id="rqc_'+c.id+'"'+(on?' checked':'')+'>'+
       '<div><div class="t">'+esc(c.texto)+'</div>'+
       '<div class="f" onclick="event.preventDefault();rqCopiar(this)">'+esc(rqPreencher(c.fala,l))+'</div></div></label>';
  });
  h+='<div class="rq-fecho" onclick="rqCopiar(this)">'+esc(rqPreencher(FECHO,l))+'</div></div>';

  h+='<div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:12px">'+
     '<button class="acao" onclick="qual(1)">Salvar e qualificar</button>'+
     '<button class="acao sec" onclick="qual(0)">Só salvar</button></div>';
  return h;
}

// junta os ids marcados da confirmação ao vivo
function rqConfirmacao(){
  return CONFIRMACAO.filter(function(c){
    const el=document.getElementById('rqc_'+c.id);
    return el&&el.checked;
  }).map(function(c){return c.id}).join(',');
}
`;
