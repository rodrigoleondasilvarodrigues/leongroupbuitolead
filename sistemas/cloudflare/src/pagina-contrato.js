/* ═══════════════════════ A PÁGINA DO CONTRATO ═══════════════════════
   O que o cliente vê em `/c/<token>`, em duas etapas na mesma página:

   ETAPA 1  ele preenche os dados legais dele (nome legal, tipo de empresa,
            endereço, e-mail). Sete campos, nada de documento nem de número
            fiscal: contrato de serviço não precisa, e guardar SSN ou EIN num
            banco de dados seria assumir um risco sem ganho nenhum.

   ETAPA 2  o contrato aparece INTEIRO na tela, já com os dados dele, e ele
            aceita digitando o nome completo.

   Por que o texto integral tem que estar na tela: aceite por clique só vale
   como prova se a pessoa teve o texto na frente antes de clicar. Um resumo com
   um "concordo com os termos" e um link para outro lugar é exatamente o que
   derruba clickwrap em juízo.

   E por que duas etapas e não uma: o hash guardado no aceite é calculado pelo
   SERVIDOR sobre o texto que o servidor gerou. Montar o contrato no navegador
   enquanto ele digita seria mais bonito e provaria menos, porque o que ficaria
   guardado não seria necessariamente o que estava na tela.                  */

import { TAGS_ICONE } from "./marca.js";
import { contratoEmHTML } from "./contrato.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
  (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

const ESTILO = `
:root{--marfim:#F7F3EA;--branco:#FFFDF8;--preto:#171717;--laranja:#E65A19;
--laranja-esc:#C44712;--areia:#E9E1D6;--cinza:#68645E;--verde:#2d6a4f;
--sunk:#F1EADC}
*{box-sizing:border-box;margin:0;padding:0}
body{font:15.5px/1.62 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif;
background:var(--marfim);color:var(--preto);min-height:100vh}
.wrap{max-width:44rem;margin:0 auto;padding:0 1.3rem 4rem}
header{background:var(--preto);color:var(--marfim);padding:1.15rem 1.3rem}
header .in{max-width:44rem;margin:0 auto}
header b{font-size:1.05rem;letter-spacing:.01em}
header b span{color:var(--laranja)}
header p{font-size:.8rem;opacity:.72;margin-top:.15rem}
h1{font-size:1.55rem;line-height:1.2;margin:2rem 0 .5rem;letter-spacing:-.02em}
.lede{color:var(--cinza);font-size:.98rem;margin-bottom:1.6rem;max-width:34rem}
/* ── as duas etapas, sempre visíveis, para ele saber onde está ── */
.etapas{display:flex;gap:.5rem;margin:0 0 1.8rem;font-size:.8rem}
.et{flex:1;padding:.6rem .8rem;border-radius:6px;background:var(--sunk);
color:var(--cinza);border:1px solid var(--areia)}
.et b{display:block;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;
margin-bottom:.15rem;opacity:.75}
.et.on{background:var(--preto);color:var(--marfim);border-color:var(--preto)}
.et.ok{background:#e5f0e9;border-color:#bcd9c8;color:var(--verde)}
fieldset{border:1px solid var(--areia);border-radius:9px;padding:1.2rem;
margin-bottom:1.1rem;background:var(--branco)}
legend{font-size:.72rem;text-transform:uppercase;letter-spacing:.09em;
color:var(--cinza);padding:0 .5rem;font-weight:700}
label{font-size:.8rem;color:var(--cinza);display:block;margin-bottom:.22rem;
font-weight:500}
input,select{width:100%;padding:.65rem .8rem;border:1px solid var(--areia);
border-radius:6px;font:inherit;background:var(--marfim);margin-bottom:.75rem}
input:focus-visible,select:focus-visible{outline:2px solid var(--laranja);
outline-offset:1px}
.dupla{display:flex;gap:.7rem}.dupla>div{flex:1;min-width:0}
.tripla{display:flex;gap:.7rem}.tripla>div{flex:1;min-width:0}
.dica{font-size:.79rem;color:var(--cinza);margin:-.5rem 0 .8rem;line-height:1.45}
button{background:var(--laranja);color:#fff;border:0;border-radius:6px;
padding:.85rem 1.5rem;cursor:pointer;font:inherit;font-weight:600;font-size:.97rem}
button:hover{background:var(--laranja-esc)}
button:disabled{opacity:.5;cursor:default}
button.sec{background:var(--branco);color:var(--preto);border:1px solid var(--areia)}
.erro{background:#fbe9e2;border-left:3px solid var(--laranja-esc);padding:.7rem .95rem;
border-radius:0 4px 4px 0;font-size:.9rem;margin-bottom:1rem;display:none}
.obg{color:var(--laranja-esc)}
/* ── o contrato ── */
.ct{background:var(--branco);border:1px solid var(--areia);border-radius:9px;
padding:1.5rem 1.6rem;margin:1.2rem 0;max-height:26rem;overflow-y:auto;
font-size:.9rem;line-height:1.66}
.ct-t{font-size:1.05rem;line-height:1.3;margin:0 0 1rem;letter-spacing:-.01em}
.ct-h{font-size:.78rem;letter-spacing:.09em;text-transform:uppercase;
color:var(--laranja-esc);margin:1.5rem 0 .55rem;font-weight:700}
.ct-h:first-of-type{margin-top:0}
.ct-p{margin:0 0 .7rem}
.ct-itens{display:flex;flex-direction:column;gap:.55rem;margin-bottom:.7rem}
.ct-i{margin:0;padding-left:2.3rem;text-indent:-2.3rem}
.ct-i b{font-weight:600;color:var(--laranja-esc)}
.ct-hr{border:0;border-top:1px solid var(--areia);margin:1.3rem 0}
.ct-sel{font-size:.76rem;letter-spacing:.1em;text-transform:uppercase;
font-weight:700;color:var(--cinza);margin:.5rem 0}
.rolar{font-size:.79rem;color:var(--cinza);text-align:center;margin:-.6rem 0 1rem}
/* ── o aceite ── */
.aceite{background:var(--preto);color:var(--marfim);border-radius:9px;
padding:1.4rem 1.5rem}
.aceite h2{font-size:1.05rem;margin-bottom:.7rem}
.aceite p{font-size:.88rem;opacity:.82;margin-bottom:1rem;line-height:1.55}
.aceite label{color:#c9c4bb}
.aceite input[type=text]{background:#0d0d0d;border-color:#333;color:var(--marfim)}
.marca{display:flex;gap:.6rem;align-items:flex-start;font-size:.88rem;
margin:.3rem 0 1.1rem;line-height:1.5}
.marca input{width:auto;margin:.2rem 0 0;flex:none}
.ok{background:#e5f0e9;border:1px solid #bcd9c8;border-left:3px solid var(--verde);
border-radius:0 8px 8px 0;padding:1.3rem 1.5rem}
.ok h2{font-size:1.1rem;color:var(--verde);margin-bottom:.5rem}
.ok p{font-size:.93rem;margin-bottom:.6rem}
.ok .rec{font:.8rem/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;
background:var(--branco);border:1px solid #bcd9c8;border-radius:5px;
padding:.8rem .95rem;margin-top:.9rem;word-break:break-all}
.aviso{background:var(--sunk);border-radius:7px;padding:.9rem 1.1rem;
font-size:.85rem;color:var(--cinza);line-height:1.55;margin:1.2rem 0}
@media (max-width:560px){
  .dupla,.tripla{flex-wrap:wrap}
  .etapas{flex-direction:column}
  .ct{padding:1.1rem;max-height:22rem}
}
`;

const CABECA = (titulo) => `<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${titulo}</title>${TAGS_ICONE}<style>${ESTILO}</style></head><body>
<header><div class="in"><b>LE<span>O</span>N GROUP</b><p>Built to Lead.</p></div></header>
<div class="wrap">`;

/* ETAPA 1: os dados legais. */
export function contratoFormHTML(c, token) {
  const emp = esc(c.empresa || "");
  const v = (x) => esc(c[x] || "");
  return CABECA(`Contrato · ${emp}`) + `
<h1>Seu contrato, ${emp}</h1>
<p class="lede">Preenche esses dados e o contrato aparece pronto na tela, já com o
seu nome. Leva dois minutos. Nada é assinado neste passo.</p>

<div class="etapas">
  <div class="et on"><b>Passo 1</b>Seus dados</div>
  <div class="et"><b>Passo 2</b>Ler e aceitar</div>
</div>

<div class="erro" id="erro"></div>
<form id="f">
<fieldset><legend>Quem está contratando</legend>
  <label>Nome legal da empresa, ou o seu nome completo <span class="obg">*</span></label>
  <input id="razao_social" value="${v("razao_social")}" placeholder="Ribeiro Hardwood Flooring LLC">
  <p class="dica">Exatamente como está registrado. Se você não tem empresa aberta,
  use seu nome completo.</p>

  <label>Tipo <span class="obg">*</span></label>
  <select id="tipo_entidade">
    <option value="">escolha</option>
    ${["LLC", "Corporation", "Sole Proprietor", "Partnership", "Pessoa física"]
      .map((t) => `<option ${c.tipo_entidade === t ? "selected" : ""}>${t}</option>`).join("")}
  </select>

  <label>Seu nome completo, como representante <span class="obg">*</span></label>
  <input id="nome_dono" value="${v("nome_dono")}" placeholder="João Ribeiro">

  <label>E-mail <span class="obg">*</span></label>
  <input id="email_contrato" type="email" value="${v("email_contrato")}" placeholder="joao@exemplo.com">
  <p class="dica">É para onde vai a cópia do contrato aceito.</p>
</fieldset>

<fieldset><legend>Endereço do contrato</legend>
  <label>Rua e número <span class="obg">*</span></label>
  <input id="endereco" value="${v("endereco")}" placeholder="42 Concord St">
  <div class="tripla">
    <div><label>Cidade <span class="obg">*</span></label>
      <input id="endereco_cidade" value="${v("endereco_cidade")}" placeholder="Framingham"></div>
    <div><label>Estado <span class="obg">*</span></label>
      <input id="endereco_estado" value="${v("endereco_estado")}" placeholder="MA" maxlength="2"></div>
    <div><label>ZIP <span class="obg">*</span></label>
      <input id="endereco_zip" value="${v("endereco_zip")}" placeholder="01702"></div>
  </div>
  <p class="dica">Este endereço fica <b>só no contrato</b>. Ele não vai para o seu
  site nem para o seu perfil do Google: lá entram as cidades que você atende, e o
  endereço fica escondido de propósito.</p>
</fieldset>

<button type="button" onclick="seguir()">Ver o contrato</button>
</form>

<div class="aviso">Dúvida em qualquer campo? Chama no WhatsApp antes de preencher.
Nada aqui é assinado até você ler o contrato inteiro no passo 2.</div>

<script>
var T='${token}';
function el(i){return document.getElementById(i)}
function v(i){return (el(i).value||'').trim()}
async function seguir(){
  var e=el('erro');e.style.display='none';
  var falta=[];
  var campos={razao_social:'nome legal',tipo_entidade:'tipo',nome_dono:'seu nome completo',
    email_contrato:'e-mail',endereco:'rua e número',endereco_cidade:'cidade',
    endereco_estado:'estado',endereco_zip:'ZIP'};
  for(var k in campos) if(!v(k)) falta.push(campos[k]);
  if(v('email_contrato')&&v('email_contrato').indexOf('@')<0) falta.push('um e-mail válido');
  if(falta.length){
    e.innerHTML='<b>Falta preencher:</b><br>'+falta.join('<br>');
    e.style.display='block';window.scrollTo({top:0,behavior:'smooth'});return}
  var b=document.querySelector('button');b.disabled=true;b.textContent='Montando...';
  var corpo={};for(var k in campos) corpo[k]=v(k);
  var r=await fetch('/api/contrato-dados/'+T,{method:'POST',
    headers:{'Content-Type':'application/json'},body:JSON.stringify(corpo)});
  var j=await r.json();
  if(j.ok){location.reload()}
  else{b.disabled=false;b.textContent='Ver o contrato';
    e.textContent=j.erro||'Erro ao salvar';e.style.display='block';
    window.scrollTo({top:0,behavior:'smooth'})}
}
</script>
</div></body></html>`;
}

/* ETAPA 2: o contrato inteiro na tela, e o aceite. */
export function contratoLerHTML(c, token, texto) {
  const emp = esc(c.empresa || "");
  return CABECA(`Contrato · ${emp}`) + `
<h1>Leia e aceite</h1>
<p class="lede">O contrato abaixo já está com os seus dados. Leia inteiro: ao aceitar,
você declara que leu, e o sistema guarda exatamente este texto.</p>

<div class="etapas">
  <div class="et ok"><b>Passo 1</b>Seus dados ✓</div>
  <div class="et on"><b>Passo 2</b>Ler e aceitar</div>
</div>

<div class="ct" id="ct">${contratoEmHTML(texto)}</div>
<p class="rolar" id="rolar">Role o contrato até o fim para liberar o aceite</p>

<div class="erro" id="erro"></div>

<div class="aceite">
  <h2>Aceite</h2>
  <p>Ao digitar seu nome completo e confirmar, você declara que leu este contrato
  inteiro, que concorda com todas as cláusulas, e que tem poderes para contratar.</p>
  <label>Digite seu nome completo, igual ao do contrato</label>
  <input type="text" id="nome" placeholder="${esc(c.nome_dono || "")}" autocomplete="off">
  <label class="marca"><input type="checkbox" id="li">
    <span>Eu li o contrato inteiro e concordo com os termos, incluindo a cláusula 6,
    que diz o que <b>não</b> está incluído.</span></label>
  <button type="button" id="bt" onclick="aceitar()" disabled>Aceitar e contratar</button>
</div>

<div class="aviso">Precisa mudar algum dado? <a href="/c/${esc(token)}?editar=1">Voltar ao
passo 1</a>. Precisa de mudança em alguma cláusula? Fala com a gente pelo WhatsApp
antes de aceitar.</div>

<script>
var T='${token}';
function el(i){return document.getElementById(i)}
/* O aceite só libera depois de o contrato ter sido rolado até o fim. Não é
   enfeite: é o que sustenta a afirmação de que ele teve o texto na tela. */
var cx=el('ct'), leu=false;
function conferir(){
  if(!leu && cx.scrollTop+cx.clientHeight >= cx.scrollHeight-24){
    leu=true; el('rolar').textContent='Contrato lido até o fim';
    el('rolar').style.color='var(--verde)'; liberar();
  }
}
cx.addEventListener('scroll',conferir);
// contrato curto que já cabe na tela sem rolagem também conta como lido
if(cx.scrollHeight<=cx.clientHeight+24){leu=true;el('rolar').style.display='none'}
function liberar(){
  el('bt').disabled = !(leu && el('li').checked && (el('nome').value||'').trim().length>4);
}
el('li').addEventListener('change',liberar);
el('nome').addEventListener('input',liberar);
liberar();

async function aceitar(){
  var e=el('erro');e.style.display='none';
  var b=el('bt');b.disabled=true;b.textContent='Registrando...';
  var r=await fetch('/api/contrato-aceitar/'+T,{method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({nome:(el('nome').value||'').trim(),li:el('li').checked})});
  var j=await r.json();
  if(j.ok){location.reload()}
  else{b.disabled=false;b.textContent='Aceitar e contratar';
    e.textContent=j.erro||'Erro ao registrar';e.style.display='block';
    window.scrollTo({top:0,behavior:'smooth'})}
}
</script>
</div></body></html>`;
}

/* ETAPA 3: já aceito. O link não morre, porque o cliente tem direito de voltar
   e reler o que assinou. Mas não aceita de novo. */
export function contratoAceitoHTML(c, texto) {
  const emp = esc(c.empresa || "");
  const quando = c.contrato_aceito_em
    ? new Date(c.contrato_aceito_em).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
    : "";
  return CABECA(`Contrato aceito · ${emp}`) + `
<h1>Contrato aceito</h1>

<div class="ok">
  <h2>Está tudo certo, ${esc(c.nome_dono || emp)}</h2>
  <p>O contrato foi aceito e registrado. Guarde esta página: ela é a sua via, e o
  link continua valendo para você reler quando quiser.</p>
  <p><b>O próximo passo é nosso:</b> assim que o pagamento for confirmado, você recebe
  o formulário de início. É a partir da sua resposta que começam os cinco dias úteis.</p>
  <div class="rec">Nome digitado: ${esc(c.contrato_aceito_nome)}
Data e hora: ${esc(quando)} (horário de Brasília)
Versão aceita: ${esc(c.contrato_versao)}
Impressão do texto: ${esc(c.contrato_hash)}</div>
</div>

<h1 style="font-size:1.15rem;margin-top:2.2rem">O que você aceitou</h1>
<div class="ct">${contratoEmHTML(texto)}</div>

<div class="aviso">Quer uma cópia em arquivo? Pede no WhatsApp que a gente manda.</div>
</div></body></html>`;
}

/* Link inválido, ou cliente sem contrato liberado. */
export function contratoIndisponivelHTML(motivo) {
  return CABECA("Contrato") + `
<h1>Link indisponível</h1>
<p class="lede">${esc(motivo)}</p>
<div class="aviso">Se você recebeu este link da Leon Group, chama no WhatsApp que a
gente gera um novo.</div>
</div></body></html>`;
}
