// Páginas públicas: login do admin e formulário do cliente.

const ESTILO = `
:root{--marfim:#F7F3EA;--branco:#FFFDF8;--preto:#171717;--laranja:#E65A19;
--laranja-esc:#C44712;--areia:#E9E1D6;--cinza:#68645E}
*{box-sizing:border-box;margin:0;padding:0}
body{font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif;
background:var(--marfim);color:var(--preto);min-height:100vh}
input,textarea,select{width:100%;padding:11px 13px;border:1px solid var(--areia);border-radius:6px;
font:inherit;background:var(--branco);margin-bottom:12px}
textarea{min-height:88px;resize:vertical}
label{font-size:13px;color:var(--cinza);display:block;margin-bottom:4px;font-weight:500}
button{background:var(--laranja);color:#fff;border:0;border-radius:6px;padding:13px 24px;
cursor:pointer;font:inherit;font-weight:600;font-size:15px}
button:hover{background:var(--laranja-esc)}
.erro{background:#fbe9e2;border-left:3px solid var(--laranja-esc);padding:11px 14px;
border-radius:4px;font-size:14px;margin-bottom:14px;display:none}
`;

export const LOGIN_HTML = `<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Leon Group · Acesso</title><style>${ESTILO}
body{display:flex;align-items:center;justify-content:center;padding:24px}
.cx{background:var(--branco);border:1px solid var(--areia);border-radius:12px;
padding:38px 34px;width:100%;max-width:390px;box-shadow:0 4px 24px rgba(0,0,0,.05)}
h1{font-size:21px;margin-bottom:6px;letter-spacing:.01em}h1 span{color:var(--laranja)}
p.sub{color:var(--cinza);font-size:13.5px;margin-bottom:26px}
</style></head><body>
<div class="cx">
  <h1>LE<span>O</span>N GROUP</h1>
  <p class="sub">Built to Lead.</p>
  <div class="erro" id="erro"></div>
  <label>Senha</label>
  <input type="password" id="senha" autofocus onkeydown="if(event.key==='Enter')entrar()">
  <button onclick="entrar()" style="width:100%">Entrar</button>
</div>
<script>
async function entrar(){
  const e=document.getElementById('erro');e.style.display='none';
  const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({senha:document.getElementById('senha').value})});
  const j=await r.json();
  if(j.ok){location.href='/'}
  else{e.textContent=j.erro||'Erro';e.style.display='block';document.getElementById('senha').value=''}
}
</script></body></html>`;

export function formularioHTML(cliente, token) {
  const emp = String(cliente.empresa || "").replace(/[<>"]/g, "");
  return `<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${emp} · Formulário de onboarding</title><style>${ESTILO}
.wrap{max-width:660px;margin:0 auto;padding:32px 22px 60px}
header{background:var(--preto);color:var(--marfim);padding:20px 22px;margin:-32px -22px 28px}
header b{font-size:17px}header b span{color:var(--laranja)}
header p{font-size:13px;opacity:.8;margin-top:3px}
h2{font-size:20px;margin-bottom:8px}
.intro{color:var(--cinza);font-size:14px;margin-bottom:26px}
fieldset{border:1px solid var(--areia);border-radius:9px;padding:20px;margin-bottom:18px;background:var(--branco)}
legend{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--cinza);padding:0 8px;font-weight:600}
.dupla{display:flex;gap:12px}.dupla>div{flex:1}
.dica{font-size:12.5px;color:var(--cinza);margin:-6px 0 12px}
.ok{background:#e5f0e9;border-left:3px solid #2d6a4f;padding:18px;border-radius:6px;display:none}
.prog{position:sticky;top:0;background:var(--marfim);padding:10px 0;font-size:12.5px;color:var(--cinza);
border-bottom:1px solid var(--areia);margin:-28px -22px 22px;padding-left:22px;z-index:5}
.obg{color:var(--laranja-esc)}
</style></head><body><div class="wrap">
<header><b>LE<span>O</span>N GROUP</b><p>Built to Lead.</p></header>
<h2>Bem-vindo, ${emp}</h2>
<p class="intro">Estas informações são o que a gente precisa para montar seu site, seu Instagram
e seu Google Meu Negócio. Leva cerca de 15 minutos. Quanto mais detalhe você der, melhor fica
a entrega, e mais qualificado é o cliente que chega até você.</p>
<div class="prog" id="prog">Campos obrigatórios marcados com <span class="obg">*</span></div>
<div class="erro" id="erro"></div>
<div class="ok" id="ok"><b>Recebemos tudo!</b><br>Sua entrega começa agora e fica pronta
em até <b>5 dias úteis</b>. Vamos te avisando a cada etapa.</div>
<form id="form">

<fieldset><legend>1 · Sobre você</legend>
  <label>Seu nome, como os clientes te chamam <span class="obg">*</span></label>
  <input id="nome_dono">
  <p class="dica">Esse nome vai aparecer nas avaliações do Google. Use como as pessoas te conhecem.</p>
  <label>Telefone / WhatsApp de atendimento <span class="obg">*</span></label>
  <input id="telefone" placeholder="+1 617 555 0100">
  <label>Há quanto tempo você trabalha nessa área? <span class="obg">*</span></label>
  <input id="tempo_mercado" placeholder="8 anos">
  <p class="dica">Tempo de mercado é um dos argumentos que mais pesa para o cliente final.</p>
</fieldset>

<fieldset><legend>2 · Onde você atende</legend>
  <div class="dupla">
    <div><label>Cidade principal <span class="obg">*</span></label><input id="cidade" placeholder="Framingham"></div>
    <div><label>Estado <span class="obg">*</span></label><input id="estado" placeholder="MA"></div>
  </div>
  <p class="dica">A cidade principal é a que usamos para te posicionar nas buscas do Google.</p>
  <label>Todas as cidades e regiões que você atende <span class="obg">*</span></label>
  <textarea id="localizacoes" placeholder="Framingham, Natick, Ashland, Marlborough, Worcester, até 30 milhas"></textarea>
  <p class="dica">Liste tudo. Isso define onde seu perfil aparece e evita chamada de lugar que você não vai.</p>
</fieldset>

<fieldset><legend>3 · O que você faz</legend>
  <label>Todos os serviços que você presta <span class="obg">*</span></label>
  <textarea id="servicos" placeholder="Hardwood Installation, Vinyl Flooring, Tile, Staircase Refinishing"></textarea>
  <p class="dica">Separe por vírgula. Cada serviço vira uma seção do seu site.</p>
  <label>Descreva com suas palavras o trabalho que você faz</label>
  <textarea id="faz" placeholder="Instalo e restauro piso de madeira em casa residencial, do preparo do contrapiso ao acabamento"></textarea>
  <label>O que você <b>não</b> faz <span class="obg">*</span></label>
  <textarea id="nao_faz" placeholder="Não faço obra comercial, não faço demolição, não trabalho com carpete"></textarea>
  <p class="dica">Isso é tão importante quanto o que você faz: evita perder tempo com quem
  procura serviço que você não presta.</p>
  <label>O que te diferencia dos concorrentes <span class="obg">*</span></label>
  <textarea id="diferencial" placeholder="Equipe própria, limpeza garantida no fim de cada dia, garantia de 2 anos"></textarea>
</fieldset>

<fieldset><legend>4 · Sua marca</legend>
  <label><input type="checkbox" id="tem_logo" style="width:auto;margin-right:7px">Eu já tenho logo</label>
  <label style="margin-top:10px">Se você já tem, cole o link do arquivo</label>
  <input id="logo_url" placeholder="https://...">
  <label>Se não tem, quais cores você gostaria?</label>
  <input id="cores" placeholder="azul escuro e dourado">
</fieldset>

<fieldset><legend>5 · Fotos e vídeos do seu trabalho</legend>
  <label>Links das fotos, precisamos de <b>pelo menos 11</b> <span class="obg">*</span></label>
  <textarea id="fotos" placeholder="https://...&#10;https://...&#10;uma por linha" style="min-height:150px"></textarea>
  <p class="dica">Fotos dos seus serviços prontos, de preferência boas e bem iluminadas.
  Suba no Google Drive ou Dropbox, deixe o link público e cole aqui, uma por linha.</p>
  <label>Links dos vídeos, de 1 a 3</label>
  <textarea id="videos" placeholder="https://...&#10;uma por linha"></textarea>
  <p class="dica">Vídeo curto do trabalho sendo feito ou do resultado. Ajuda muito no anúncio.</p>
  <label>Alguma observação importante que a gente precise saber</label>
  <textarea id="observacoes"></textarea>
</fieldset>

<button type="button" onclick="enviar()" style="width:100%">Enviar e começar minha entrega</button>
<p class="dica" style="text-align:center;margin-top:12px">Ao enviar, sua entrega de 5 dias úteis começa.</p>
</form>
<script>
async function enviar(){
  const v=id=>document.getElementById(id).value.trim();
  const e=document.getElementById('erro');e.style.display='none';
  const fotos=v('fotos').split('\\n').map(s=>s.trim()).filter(Boolean);
  const faltando=[];
  if(!v('nome_dono'))faltando.push('seu nome');
  if(!v('telefone'))faltando.push('telefone');
  if(!v('tempo_mercado'))faltando.push('tempo de mercado');
  if(!v('cidade'))faltando.push('cidade');
  if(!v('estado'))faltando.push('estado');
  if(!v('localizacoes'))faltando.push('regiões que atende');
  if(!v('servicos'))faltando.push('serviços');
  if(!v('nao_faz'))faltando.push('o que você não faz');
  if(!v('diferencial'))faltando.push('seu diferencial');
  if(fotos.length<11)faltando.push('pelo menos 11 fotos (você enviou '+fotos.length+')');
  if(faltando.length){
    e.innerHTML='<b>Falta preencher:</b><br>'+faltando.join('<br>');
    e.style.display='block';window.scrollTo({top:0,behavior:'smooth'});return}
  const b=document.querySelector('button');b.disabled=true;b.textContent='Enviando...';
  const r=await fetch('/api/formulario/${token}',{method:'POST',
    headers:{'Content-Type':'application/json'},body:JSON.stringify({
      nome_dono:v('nome_dono'),telefone:v('telefone'),tempo_mercado:v('tempo_mercado'),
      cidade:v('cidade'),estado:v('estado'),localizacoes:v('localizacoes'),
      servicos:v('servicos'),faz:v('faz'),nao_faz:v('nao_faz'),diferencial:v('diferencial'),
      observacoes:v('observacoes'),tem_logo:document.getElementById('tem_logo').checked,
      logo_url:v('logo_url'),cores:v('cores'),fotos,
      videos:v('videos').split('\\n').map(s=>s.trim()).filter(Boolean)})});
  const j=await r.json();
  if(j.ok){document.getElementById('form').style.display='none';
    document.getElementById('prog').style.display='none';
    document.getElementById('ok').style.display='block';window.scrollTo({top:0,behavior:'smooth'})}
  else{b.disabled=false;b.textContent='Enviar e começar minha entrega';
    e.textContent=j.erro||'Erro ao enviar';e.style.display='block';
    window.scrollTo({top:0,behavior:'smooth'})}
}
</script></div></body></html>`;
}

// Formulário ainda travado: falta contrato assinado e/ou pagamento confirmado.
export function aguardandoHTML(c) {
  const emp = String(c.empresa || "").replace(/[<>"]/g, "");
  const falta = [];
  if (!c.contrato_assinado) falta.push("assinatura do contrato");
  if (!c.pagamento_confirmado) falta.push("confirmação do pagamento");
  return `<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${emp} · Aguardando liberação</title><style>${ESTILO}
body{display:flex;align-items:center;justify-content:center;padding:24px}
.cx{background:var(--branco);border:1px solid var(--areia);border-radius:12px;padding:36px 32px;max-width:440px;text-align:center}
h1{font-size:19px;margin-bottom:10px}h1 span{color:var(--laranja)}
p{color:var(--cinza);font-size:14.5px}
</style></head><body><div class="cx">
<h1>LE<span>O</span>N GROUP</h1>
<p style="margin-bottom:14px"><b>${emp}</b></p>
<p>Seu formulário de onboarding será liberado assim que concluirmos
${falta.join(" e ")}.</p>
<p style="margin-top:14px;font-size:13.5px">Qualquer dúvida, fale com a gente pelo WhatsApp.</p>
</div></body></html>`;
}

// Link de uso único já consumido.
export function jaRespondidoHTML(c) {
  const emp = String(c.empresa || "").replace(/[<>"]/g, "");
  return `<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${emp} · Formulário já respondido</title><style>${ESTILO}
body{display:flex;align-items:center;justify-content:center;padding:24px}
.cx{background:var(--branco);border:1px solid var(--areia);border-radius:12px;padding:36px 32px;max-width:440px;text-align:center}
h1{font-size:19px;margin-bottom:10px}h1 span{color:var(--laranja)}
p{color:var(--cinza);font-size:14.5px}
</style></head><body><div class="cx">
<h1>LE<span>O</span>N GROUP</h1>
<p style="margin-bottom:14px"><b>${emp}</b></p>
<p>Este formulário já foi respondido e o link não é mais válido.</p>
<p style="margin-top:14px;font-size:13.5px">Precisa corrigir alguma informação?
Fale com a gente pelo WhatsApp que geramos um link novo.</p>
</div></body></html>`;
}
