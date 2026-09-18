// Páginas públicas: login do admin e formulário do cliente.
import { TAGS_ICONE } from "./marca.js";
import { MIN_FOTOS } from "./geradores.js";

const ESTILO = `
:root{--marfim:#F7F3EA;--branco:#FFFDF8;--preto:#171717;--laranja:#E65A19;
--laranja-esc:#C44712;--areia:#E9E1D6;--cinza:#68645E;--verde:#2d6a4f}
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
button:disabled{opacity:.55;cursor:default}
.erro{background:#fbe9e2;border-left:3px solid var(--laranja-esc);padding:11px 14px;
border-radius:4px;font-size:14px;margin-bottom:14px;display:none}
`;

/* ── área de upload ──
   O cliente preenche isso do celular, em pé na obra. Cada detalhe daqui
   existe por causa disso: alvo de toque grande, miniatura para ele conferir
   que mandou a foto certa, contador do que falta e progresso por arquivo. */
const ESTILO_UPLOAD = `
.subir{border:2px dashed var(--areia);border-radius:10px;background:var(--branco);
  padding:20px 16px;text-align:center;margin-bottom:12px;transition:.15s}
.subir.arrasta{border-color:var(--laranja);background:#fdf4ef}
.subir .btn{display:inline-block;background:var(--laranja);color:#fff;border-radius:8px;
  padding:14px 22px;font-weight:600;cursor:pointer;font-size:15.5px}
.subir .btn:active{background:var(--laranja-esc)}
.subir input[type=file]{position:absolute;width:1px;height:1px;opacity:0;overflow:hidden}
.subir p{font-size:12.5px;color:var(--cinza);margin-top:9px;line-height:1.45}
.conta{display:flex;align-items:center;gap:9px;font-size:13px;margin:10px 0 6px;font-weight:600}
.conta i{flex:1;height:7px;background:var(--areia);border-radius:99px;overflow:hidden;font-style:normal}
.conta i b{display:block;height:100%;width:0;background:var(--laranja);transition:width .3s}
.conta.ok i b{background:var(--verde)}
.conta.ok{color:var(--verde)}
.tiras{display:grid;grid-template-columns:repeat(auto-fill,minmax(86px,1fr));gap:7px;margin-bottom:12px}
.tira{position:relative;aspect-ratio:1;border-radius:7px;overflow:hidden;border:1px solid var(--areia);
  background:var(--branco)}
.tira img{width:100%;height:100%;object-fit:cover;display:block}
.tira .vid{display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;
  gap:3px;font-size:10.5px;color:var(--cinza);padding:5px;text-align:center;word-break:break-all}
.tira .vid b{font-size:19px;line-height:1}
.tira .x{position:absolute;top:3px;right:3px;width:23px;height:23px;border-radius:50%;
  background:rgba(23,23,23,.72);color:#fff;border:0;font-size:15px;line-height:1;padding:0;
  display:flex;align-items:center;justify-content:center;cursor:pointer}
.tira .x:hover{background:#c0392b}
.tira.enviando{opacity:.5}
.tira .barra{position:absolute;left:0;right:0;bottom:0;height:4px;background:rgba(0,0,0,.15)}
.tira .barra b{display:block;height:100%;width:0;background:var(--laranja);transition:width .2s}
.tira.falhou{border-color:#c0392b}
.tira .re{position:absolute;inset:0;background:rgba(192,57,43,.9);color:#fff;border:0;
  font-size:11.5px;font-weight:600;cursor:pointer;padding:4px}
.oureg{font-size:13px;color:var(--cinza);margin:4px 0 10px}
.oureg summary{cursor:pointer;font-weight:600;color:var(--laranja-esc)}
.oureg[open] summary{margin-bottom:9px}
.avisoup{background:#fdf4ef;border-left:3px solid var(--laranja);padding:10px 13px;
  border-radius:4px;font-size:12.5px;margin-bottom:12px}
`;

export const LOGIN_HTML = `<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Leon Group · Acesso</title>${TAGS_ICONE}<style>${ESTILO}
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

/* `opcoes.upload` diz se o armazenamento de arquivo está ligado. Estando
   desligado, o formulário NÃO mostra o seletor: botão que sempre falha faz o
   cliente achar que o problema é o celular dele, e ele desiste. Nesse caso os
   campos de colar link aparecem abertos, que é o caminho que funciona. */
export function formularioHTML(cliente, token, opcoes = {}) {
  const emp = String(cliente.empresa || "").replace(/[<>"]/g, "");
  const podeSubir = opcoes.upload !== false;
  return `<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${emp} · Formulário de onboarding</title>${TAGS_ICONE}<style>${ESTILO}${ESTILO_UPLOAD}
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
.ok{background:#e5f0e9;border-left:3px solid var(--verde);padding:18px;border-radius:6px;display:none}
.prog{position:sticky;top:0;background:var(--marfim);padding:10px 0;font-size:12.5px;color:var(--cinza);
border-bottom:1px solid var(--areia);margin:-28px -22px 22px;padding-left:22px;z-index:5}
.obg{color:var(--laranja-esc)}
.marca-cx{border-left:3px solid var(--laranja);background:#fdf4ef;padding:14px;border-radius:0 6px 6px 0;margin-top:6px}
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
  <input id="telefone" inputmode="tel" placeholder="+1 617 555 0100">
  <label>E-mail do negócio</label>
  <input id="email" type="email" inputmode="email" placeholder="contato@suaempresa.com">
  <p class="dica">Aparece no rodapé do seu site. Se não tiver um do negócio, pode deixar em branco.</p>
  <label>Seu Instagram</label>
  <input id="instagram" placeholder="@suaempresa">
  <p class="dica">Vira link no seu site e liga o site ao perfil que a gente monta pra você.</p>
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
  <label style="font-weight:600;color:var(--preto);margin-top:16px">
    <input type="checkbox" id="licenciado" style="width:auto;margin-right:7px">
    Tenho license no estado onde atendo</label>
  <label style="font-weight:600;color:var(--preto)">
    <input type="checkbox" id="segurado" style="width:auto;margin-right:7px">
    Tenho seguro (insurance) do negócio</label>
  <p class="dica">Marque só o que for verdade. Esses dois selos aparecem no topo do seu site, e
  o homeowner americano confere. Escrever que tem sem ter é o tipo de coisa que derruba a
  confiança e te expõe.</p>
</fieldset>

<fieldset><legend>4 · Sua marca</legend>
  <label style="font-weight:600;color:var(--preto)">
    <input type="checkbox" id="tem_logo" style="width:auto;margin-right:7px" onchange="trocaLogo()">
    Eu já tenho uma logo pronta</label>

  <div id="cx_tem_logo" style="display:none">
    ${podeSubir ? `
    <p class="dica" style="margin-top:11px">Manda o arquivo da sua logo. Se tiver mais de uma versão,
    manda todas.</p>
    <div class="subir" id="cx_up_logo">
      <label class="btn" for="f_logo">Escolher arquivo da logo</label>
      <input type="file" id="f_logo" accept="image/*" multiple onchange="escolheu(this,'logo')">
      <p>PNG com fundo transparente é o ideal. JPG também serve.</p>
    </div>
    <div class="tiras" id="tiras_logo"></div>` : `
    <label style="margin-top:11px">Cole o link do arquivo da sua logo</label>
    <input id="logo_url" placeholder="https://...">
    <p class="dica">Suba no Google Drive ou Dropbox, deixe o link público e cole aqui.</p>`}
  </div>

  <div id="cx_sem_logo" class="marca-cx">
    <p style="font-size:13.5px;margin-bottom:14px"><b>Não tem logo? A gente faz a sua.</b><br>
    <span style="color:var(--cinza);font-size:12.5px">Quanto mais você contar aqui, mais perto do que
    você imagina ela sai. Responde com suas palavras, sem se preocupar com termo técnico.</span></p>

    <label>Que estilo você quer?</label>
    <input id="logo_estilo" placeholder="moderna e limpa · robusta · clássica · elegante">
    <p class="dica">Pode escrever do jeito que vier: "algo forte, que passe confiança".</p>

    <label>Que desenho ou símbolo você gostaria de ver nela?</label>
    <textarea id="logo_simbolo" placeholder="uma tábua de madeira, a inicial do meu nome, um martelo, nada de desenho, só o nome"></textarea>

    <label>Quais cores?</label>
    <input id="cores" placeholder="azul escuro e dourado">

    <label>O que você <b>não</b> quer de jeito nenhum?</label>
    <textarea id="logo_evitar" placeholder="nada de casinha, nada de verde, sem letra cursiva"></textarea>
    <p class="dica">Esse campo economiza uma rodada inteira de refação.</p>

    <label>Alguma marca ou logo que você gosta?</label>
    <textarea id="logo_referencias" placeholder="cite nomes de empresas, cole links, ou descreva uma que você viu num caminhão"></textarea>

    <div class="dupla">
      <div><label>Nome exato que vai na logo</label>
        <input id="logo_texto" placeholder="${emp}"></div>
      <div><label>Slogan, se você quiser um</label>
        <input id="logo_slogan" placeholder="Quality you can walk on"></div>
    </div>
    <p class="dica" style="margin-bottom:0">O nome vai escrito exatamente como você digitar aqui,
    então confere a grafia.</p>
  </div>
</fieldset>

<fieldset><legend>5 · Fotos e vídeos do seu trabalho</legend>
  ${podeSubir ? `<div class="avisoup">Dá para mandar direto do celular. Escolhe as fotos na galeria e elas
  sobem aqui na hora, sem precisar de Drive, sem precisar de link.</div>`
  : `<div class="avisoup">Suba as fotos no Google Drive, no Dropbox ou no iCloud, deixe a pasta
  <b>pública</b> e cole os links aqui embaixo, um por linha. Qualquer dúvida, chama no WhatsApp
  que a gente te ajuda a fazer isso.</div>`}

  <label style="font-size:14px;color:var(--preto);font-weight:600">
    Fotos dos seus trabalhos prontos <span class="obg">*</span></label>
  <p class="dica">Precisamos de <b>pelo menos ${MIN_FOTOS}</b>. De preferência bem iluminadas,
  e se você tiver antes e depois da mesma obra, manda os dois.</p>

  ${podeSubir ? `
  <div class="subir" id="cx_up_foto">
    <label class="btn" for="f_foto">Escolher fotos</label>
    <input type="file" id="f_foto" accept="image/*" multiple onchange="escolheu(this,'foto')">
    <p class="dica"><b>O que serve:</b> foto do serviço pronto e do serviço sendo feito, de perto e
    de longe, com boa luz. Antes e depois separados, em duas fotos.<br>
    <b>O que não serve:</b> foto com texto ou moldura escrita por cima, print de tela, documento,
    selfie sem obra atrás, paisagem solta, e imagem tirada da internet ou feita por IA. O cliente
    americano percebe, e o Google entrega menos post que parece anúncio.</p>
    <p>Pode selecionar várias de uma vez. Elas são reduzidas no seu celular antes
    de subir, então gasta pouca internet.</p>
  </div>
  <div class="conta" id="conta_foto"><span id="conta_foto_txt">0 fotos</span><i><b id="conta_foto_bar"></b></i></div>
  <div class="tiras" id="tiras_foto"></div>

  <label style="font-size:14px;color:var(--preto);font-weight:600;margin-top:18px">Vídeos, de 1 a 3</label>
  <p class="dica">Vídeo curto do trabalho sendo feito ou do resultado. Ajuda muito no anúncio.</p>
  <div class="subir" id="cx_up_video">
    <label class="btn" for="f_video">Escolher vídeos</label>
    <input type="file" id="f_video" accept="video/*" multiple onchange="escolheu(this,'video')">
    <p>Até 95 MB por vídeo. Se o seu for maior, manda um trecho.</p>
  </div>
  <div class="tiras" id="tiras_video"></div>

  <details class="oureg">
    <summary>Prefere mandar por link do Drive ou Dropbox?</summary>
    <label>Links das fotos, um por linha</label>
    <textarea id="fotos" placeholder="https://...&#10;https://..." style="min-height:110px"></textarea>
    <label>Links dos vídeos, um por linha</label>
    <textarea id="videos" placeholder="https://..."></textarea>
    <p class="dica" style="margin-bottom:0">Se usar link, deixa a pasta pública, senão a gente
    não consegue abrir.</p>
  </details>` : `
  <label>Links das fotos, um por linha</label>
  <textarea id="fotos" placeholder="https://...&#10;https://..." style="min-height:150px"></textarea>
  <div class="conta" id="conta_foto"><span id="conta_foto_txt">0 fotos</span><i><b id="conta_foto_bar"></b></i></div>
  <label style="margin-top:14px">Links dos vídeos, de 1 a 3</label>
  <textarea id="videos" placeholder="https://..."></textarea>
  <p class="dica">Vídeo curto do trabalho sendo feito ou do resultado. Ajuda muito no anúncio.</p>`}

  <label style="margin-top:10px">Alguma observação importante que a gente precise saber</label>
  <textarea id="observacoes"></textarea>
</fieldset>

<button type="button" id="enviar" onclick="enviar()" style="width:100%">Enviar e começar minha entrega</button>
<p class="dica" style="text-align:center;margin-top:12px">Ao enviar, sua entrega de 5 dias úteis começa.</p>
</form>
<script>
var TOKEN='${token}';
var MIN_FOTOS=${MIN_FOTOS};
// Com o armazenamento desligado, os seletores de arquivo não existem na
// página. Tudo abaixo respeita isso em vez de estourar procurando por eles.
var PODE_SUBIR=${podeSubir};
var LADO_MAX=1920;          // maior lado depois da redução
var QUALIDADE=0.82;
var TETO_IMG=12*1024*1024, TETO_VID=95*1024*1024;
var itens={foto:[],video:[],logo:[]};
var seq=0;

function el(id){return document.getElementById(id)}
function trocaLogo(){
  var tem=el('tem_logo').checked;
  el('cx_tem_logo').style.display=tem?'block':'none';
  el('cx_sem_logo').style.display=tem?'none':'block';
}

/* ── redução no próprio celular ──
   Foto de celular tem 4 MB e 4000px. O site nunca usa mais de 1920px, e
   subir 15 fotos de 4 MB em rede móvel é o que fazia o cliente desistir no
   meio. Reduzir antes derruba pra algo entre 200 e 400 KB.

   Bônus: o iPhone fotografa em HEIC, que navegador nenhum desenha em <img>.
   Passar pelo canvas devolve JPEG, então a foto do iPhone funciona no site. */
function reduzir(file){
  return new Promise(function(res){
    if(!/^image\\//.test(file.type)) return res(null);
    var url=URL.createObjectURL(file);
    var img=new Image();
    img.onload=function(){
      try{
        var w=img.naturalWidth,h=img.naturalHeight;
        var esc=Math.min(1,LADO_MAX/Math.max(w,h));
        var cv=document.createElement('canvas');
        cv.width=Math.round(w*esc); cv.height=Math.round(h*esc);
        cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
        cv.toBlob(function(b){
          URL.revokeObjectURL(url);
          // se a redução não ajudou, manda o original
          res(b&&b.size<file.size?{blob:b,mime:'image/jpeg'}:null);
        },'image/jpeg',QUALIDADE);
      }catch(e){URL.revokeObjectURL(url);res(null)}
    };
    img.onerror=function(){URL.revokeObjectURL(url);res(null)};
    img.src=url;
  });
}

function escolheu(input,tipo){
  if(!PODE_SUBIR) return;
  var arqs=[].slice.call(input.files||[]);
  input.value='';                       // permite escolher o mesmo arquivo de novo
  arqs.forEach(function(f){ enfileirar(f,tipo) });
}

function enfileirar(f,tipo){
  var teto=tipo==='video'?TETO_VID:TETO_IMG;
  var it={id:++seq,tipo:tipo,file:f,nome:f.name||'arquivo',estado:'espera',pct:0,
          grande:tipo==='video'&&f.size>teto};
  itens[tipo].push(it);
  desenhar(tipo);
  if(it.grande){
    it.estado='falhou';
    it.erro='Vídeo de '+Math.round(f.size/1048576)+' MB. O limite é 95 MB.';
    desenhar(tipo); return;
  }
  subir(it);
}

async function subir(it){
  it.estado='enviando'; it.pct=5; it.erro=null; desenhar(it.tipo);
  try{
    var corpo=it.file, mime=it.file.type||'application/octet-stream';
    if(it.tipo!=='video'){
      var r=await reduzir(it.file);
      if(r){corpo=r.blob;mime=r.mime}
    }
    if(corpo.size>(it.tipo==='video'?TETO_VID:TETO_IMG))
      throw new Error('Arquivo de '+Math.round(corpo.size/1048576)+' MB, acima do limite.');
    it.pct=35; desenhar(it.tipo);

    var resp=await fetch('/api/subir/'+TOKEN+'?tipo='+it.tipo+'&nome='+encodeURIComponent(it.nome.slice(0,120)),
      {method:'POST',headers:{'Content-Type':mime},body:corpo});
    var j=await resp.json().catch(function(){return {}});
    if(!resp.ok||j.erro) throw new Error(j.erro||('Falhou com código '+resp.status));
    it.estado='pronto'; it.pct=100; it.idServidor=j.id; it.url=j.url; it.preview=j.preview;
  }catch(e){
    it.estado='falhou'; it.erro=e.message||'Não subiu. Toca para tentar de novo.';
  }
  desenhar(it.tipo); contar();
}

function tentarDeNovo(tipo,id){
  var it=itens[tipo].filter(function(x){return x.id===id})[0];
  if(!it) return;
  if(it.grande) return;
  subir(it);
}

async function remover(tipo,id){
  var it=itens[tipo].filter(function(x){return x.id===id})[0];
  if(!it) return;
  if(it.idServidor){
    it.estado='enviando'; desenhar(tipo);
    var r=await fetch('/api/remover/'+TOKEN,{method:'POST',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({id:it.idServidor})});
    var j=await r.json().catch(function(){return {}});
    if(!r.ok||j.erro){ it.estado='falhou'; it.erro=j.erro||'Não consegui apagar.'; desenhar(tipo); return }
  }
  itens[tipo]=itens[tipo].filter(function(x){return x.id!==id});
  desenhar(tipo); contar();
}

function desenhar(tipo){
  var cx=el('tiras_'+tipo); if(!cx) return;   // não existe com o upload desligado
  cx.innerHTML=itens[tipo].map(function(it){
    var miolo;
    if(it.tipo==='video'||it.preview===false)
      miolo='<div class="vid"><b>'+(it.tipo==='video'?'▶':'◼')+'</b>'+esc(it.nome.slice(0,26))+'</div>';
    else if(it.url) miolo='<img src="'+esc(it.url)+'" alt="" loading="lazy">';
    else miolo='<div class="vid"><b>◻</b>'+esc(it.nome.slice(0,26))+'</div>';
    var cls='tira'+(it.estado==='enviando'?' enviando':'')+(it.estado==='falhou'?' falhou':'');
    var extra='';
    if(it.estado==='enviando') extra='<div class="barra"><b style="width:'+it.pct+'%"></b></div>';
    if(it.estado==='falhou') extra='<button type="button" class="re" '+
      'onclick="tentarDeNovo(\\''+tipo+'\\','+it.id+')">'+esc(it.erro||'erro')+
      (it.grande?'':'<br>tentar de novo')+'</button>';
    return '<div class="'+cls+'">'+miolo+extra+
      '<button type="button" class="x" title="Remover" '+
      'onclick="remover(\\''+tipo+'\\','+it.id+')">×</button></div>';
  }).join('');
}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(m){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}

function linksFotos(){
  return (el('fotos').value||'').split('\\n').map(function(s){return s.trim()}).filter(Boolean);
}
function prontas(tipo){
  return itens[tipo].filter(function(x){return x.estado==='pronto'}).length;
}
function contar(){
  var n=prontas('foto')+linksFotos().length;
  var pct=Math.min(100,Math.round(100*n/MIN_FOTOS));
  var cx=el('conta_foto');
  el('conta_foto_txt').textContent = n===0 ? 'Nenhuma foto ainda, faltam '+MIN_FOTOS
    : n<MIN_FOTOS ? n+' de '+MIN_FOTOS+', faltam '+(MIN_FOTOS-n)
    : n+' fotos, já dá';
  el('conta_foto_bar').style.width=pct+'%';
  cx.classList.toggle('ok',n>=MIN_FOTOS);
}
el('fotos').addEventListener('input',contar);

/* Arrastar e soltar, para quando ele preencher do computador. No celular
   nunca dispara e não estorva nada. */
if(PODE_SUBIR) ['foto','video','logo'].forEach(function(tipo){
  var cx=el('cx_up_'+tipo); if(!cx) return;
  ['dragenter','dragover'].forEach(function(ev){cx.addEventListener(ev,function(e){
    e.preventDefault();cx.classList.add('arrasta')})});
  ['dragleave','drop'].forEach(function(ev){cx.addEventListener(ev,function(e){
    e.preventDefault();cx.classList.remove('arrasta')})});
  cx.addEventListener('drop',function(e){
    [].slice.call(e.dataTransfer.files||[]).forEach(function(f){enfileirar(f,tipo)})});
});

// Sair no meio com upload rolando perde o que estava no ar naquele segundo.
window.addEventListener('beforeunload',function(e){
  var subindo=['foto','video','logo'].some(function(t){
    return itens[t].some(function(x){return x.estado==='enviando'})});
  if(subindo){e.preventDefault();e.returnValue=''}
});

/* Retoma o que já subiu. O navegador do celular mata a aba quando ele troca
   de aplicativo para procurar uma foto: sem isso, voltar mostrava a lista
   vazia e ele mandaria tudo de novo. */
(async function retomar(){
  if(!PODE_SUBIR) return;
  try{
    var r=await fetch('/api/subir/'+TOKEN);
    if(!r.ok) return;
    var j=await r.json();
    (j.arquivos||[]).forEach(function(a){
      var tipo=a.tipo==='video'?'video':(a.tipo==='logo'?'logo':'foto');
      itens[tipo].push({id:++seq,tipo:tipo,nome:a.nome||'arquivo',estado:'pronto',pct:100,
        idServidor:a.id,url:a.url,preview:!/heic|heif/i.test(a.mime||'')});
    });
    ['foto','video','logo'].forEach(desenhar);
    if(itens.logo.length){el('tem_logo').checked=true;trocaLogo()}
    contar();
  }catch(e){}
})();

trocaLogo(); contar();

async function enviar(){
  var v=function(id){var e=el(id);return e?e.value.trim():''};
  var e=el('erro');e.style.display='none';
  var subindo=['foto','video','logo'].some(function(t){
    return itens[t].some(function(x){return x.estado==='enviando'})});
  if(subindo){
    e.textContent='Espera os arquivos terminarem de subir. Falta pouco.';
    e.style.display='block';window.scrollTo({top:0,behavior:'smooth'});return}

  var nFotos=prontas('foto')+linksFotos().length;
  var faltando=[];
  if(!v('nome_dono'))faltando.push('seu nome');
  if(!v('telefone'))faltando.push('telefone');
  if(!v('tempo_mercado'))faltando.push('tempo de mercado');
  if(!v('cidade'))faltando.push('cidade');
  if(!v('estado'))faltando.push('estado');
  if(!v('localizacoes'))faltando.push('regiões que atende');
  if(!v('servicos'))faltando.push('serviços');
  if(!v('nao_faz'))faltando.push('o que você não faz');
  if(!v('diferencial'))faltando.push('seu diferencial');
  if(nFotos<MIN_FOTOS)faltando.push('pelo menos '+MIN_FOTOS+' fotos (você tem '+nFotos+')');
  var falhou=['foto','video','logo'].reduce(function(n,t){
    return n+itens[t].filter(function(x){return x.estado==='falhou'}).length},0);
  if(faltando.length){
    e.innerHTML='<b>Falta preencher:</b><br>'+faltando.join('<br>')
      +(falhou?'<br><br><b>'+falhou+' arquivo(s) não subiram.</b> Toca em cima deles para tentar de novo, ou remove.':'');
    e.style.display='block';window.scrollTo({top:0,behavior:'smooth'});return}

  var b=el('enviar');b.disabled=true;b.textContent='Enviando...';
  var r=await fetch('/api/formulario/'+TOKEN,{method:'POST',
    headers:{'Content-Type':'application/json'},body:JSON.stringify({
      nome_dono:v('nome_dono'),telefone:v('telefone'),tempo_mercado:v('tempo_mercado'),
      email:v('email'),instagram:v('instagram'),
      licenciado:!!(el('licenciado')&&el('licenciado').checked),
      segurado:!!(el('segurado')&&el('segurado').checked),
      cidade:v('cidade'),estado:v('estado'),localizacoes:v('localizacoes'),
      servicos:v('servicos'),faz:v('faz'),nao_faz:v('nao_faz'),diferencial:v('diferencial'),
      observacoes:v('observacoes'),tem_logo:el('tem_logo').checked,
      logo_url:v('logo_url'),
      cores:v('cores'),logo_estilo:v('logo_estilo'),logo_simbolo:v('logo_simbolo'),
      logo_evitar:v('logo_evitar'),logo_referencias:v('logo_referencias'),
      logo_texto:v('logo_texto'),logo_slogan:v('logo_slogan'),
      fotos:linksFotos(),
      videos:(el('videos').value||'').split('\\n').map(function(s){return s.trim()}).filter(Boolean)})});
  var j=await r.json().catch(function(){return {erro:'Falha de conexão. Tenta de novo.'}});
  if(j.ok){el('form').style.display='none';
    el('prog').style.display='none';
    el('ok').style.display='block';window.scrollTo({top:0,behavior:'smooth'})}
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
<title>${emp} · Aguardando liberação</title>${TAGS_ICONE}<style>${ESTILO}
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
<title>${emp} · Formulário já respondido</title>${TAGS_ICONE}<style>${ESTILO}
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
