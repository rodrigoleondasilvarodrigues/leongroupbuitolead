#!/usr/bin/env python3
"""Monta o artefato e a versao de impressao dos roteiros a partir de um JSON so.

Uso:  python3 scripts/montar_roteiros.py [--pdf]

Os dois documentos saem do mesmo renderizador, entao nao divergem. O artefato ganha
por cima uma camada de filtro e de botao de copiar; a impressao e plana.
"""
import json, html, re, pathlib, subprocess, sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
DADOS = RAIZ / "marketing/anuncios/roteiros-20.json"
ART = RAIZ / "saidas/roteiros-anuncios.html"
IMP = RAIZ / "saidas/roteiros-anuncios-impressao.html"
PDF = RAIZ / "saidas/Leon-Group-20-Roteiros-de-Anuncio.pdf"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
FRAMES = RAIZ / "marketing/anuncios/referencia-enrico"

e = lambda s: html.escape(str(s if s is not None else ""))

def marcar(s):
    # mantem os colchetes dentro da etiqueta: o realce fica, e o texto copiado
    # do campo de script continua identico ao do JSON
    return re.sub(r"\[(VERIFICAR|RODRIGO|DEMONSTRA[ÇC][ÃA]O)([^\]]*)\]",
                  lambda m: '<span class="mk">[' + e(m.group(1) + m.group(2)) + "]</span>", e(s))

# ------------------------------------------------------------------ blocos
def caixa(rotulo, texto, extra="", mono=True, copiavel=True, meta=""):
    cls = "cx" + (" destaque" if "destaque" in extra else "")
    bt = '<button class="copiar" type="button">Copiar</button>' if copiavel else ""
    mt = f'<span class="cxmeta">{e(meta)}</span>' if meta else ""
    return (f'<div class="{cls}"><header><span>{e(rotulo)}</span>{mt}{bt}</header>'
            f'<div class="txt{" m" if mono else ""}">{marcar(texto)}</div></div>')

def cartao(r, impressao=False):
    ia = r["tipo"] == "ia"
    chars = len(r["script_arcads"])
    teto = 400 if r["numero"] == 20 else 600
    aviso = "" if chars <= teto else f'<div class="alerta">Script com {chars} caracteres, acima do teto de {teto}. Cortar antes de gerar.</div>'

    modelo = (r["modelo_arcads"] or "").split(".")[0].split("(")[0].strip()
    cfg = (f'<dl class="cfg">'
           f'<dt>Modelo</dt><dd>{e(modelo)}</dd>'
           f'<dt>Áudio</dt><dd>Speech to Speech, em Settings &gt; Audio. Você grava a própria voz com os respiros no lugar e a ferramenta troca a voz.</dd>'
           f'<dt>Script</dt><dd>{chars} caracteres, teto de {teto}. Cabe em uma geração só.</dd>'
           f'</dl>') if ia else (
           f'<dl class="cfg">'
           f'<dt>Quem grava</dt><dd>Você, Rodrigo, em primeira pessoa.</dd>'
           f'<dt>Fala</dt><dd>{chars} caracteres, cerca de {r["duracao_seg"]} segundos com respiro. Não decore, leia duas vezes e fale com suas palavras.</dd>'
           f'</dl>')

    prompt = caixa("O prompt, cole inteiro", r["prompt_arcads"], "destaque",
                   meta=f"{len(r['prompt_arcads'])} caracteres")

    linhas = "".join(
        f'<tr><td class="tt">{e(b["t"])}</td><td>{marcar(b["imagem"])}</td>'
        f'<td class="te">{marcar(b["tela"])}</td><td class="fl">{marcar(b["fala"])}</td></tr>'
        for b in r["storyboard"])
    sb = (f'<h5 class="pt">Storyboard</h5>'
          f'<div class="sbwrap"><table class="sb"><thead><tr>'
          f'<th class="c1">Tempo</th><th class="c2">Imagem</th><th class="c3">Na tela</th><th class="c4">Fala</th>'
          f'</tr></thead><tbody>{linhas}</tbody></table></div>')

    ver = "".join(f"<li>{marcar(x)}</li>" for x in r.get("verificar") or [])
    fim_ = (caixa("Primary text no Meta", r["legenda_meta"], mono=False)
            + f'<div class="nota"><b>CTA</b> {marcar(r["cta"])}</div>'
            + f'<div class="nota"><b>Integridade</b> {marcar(r["integridade"])}</div>'
            + (f'<div class="nota at"><b>Conferir antes de subir</b><ul class="li">{ver}</ul></div>' if ver else ""))

    corpo = f'<div class="corpo">{cfg}{aviso}{prompt}{sb}<div class="fecho">{fim_}</div></div>'
    selo = "Ator de IA" if ia else "Você grava"
    cab = (f'<div class="num">{r["numero"]:02d}</div>'
           f'<div class="tcab"><h3>{e(r["titulo"])}</h3><p>{marcar(r["hook_resumo"])}</p></div>'
           f'<div class="selos"><span class="selo {"ia" if ia else "rod"}">{selo}</span>'
           f'<span class="selo">{e(r["grupo"])}</span>'
           f'<span class="selo dur">{e(r["duracao_seg"])}s</span></div>')

    if impressao:
        return f'<section class="rot"><div class="cab">{cab}</div>{corpo}</section>'
    return (f'<details class="roteiro" data-tipo="{e(r["tipo"])}" data-grupo="{e(r["grupo"])}">'
            f'<summary>{cab}</summary>{corpo}</details>')


# ------------------------------------------------------------------ estilo
TOKENS = """
:root{
  --marfim:#F7F3EA; --papel:#FFFDF7; --areia:#EFE8D9; --linha:#DCD2BF;
  --preto:#171717; --fumo:#6E655A; --laranja:#E65A19; --laranja-esc:#C44712;
  --ok:#2F6B4F; --alerta:#8A5A12;
  --sombra:0 1px 2px rgba(23,23,23,.05), 0 8px 24px -16px rgba(23,23,23,.28);
  --disp:'Anton',Impact,'Arial Narrow Bold',sans-serif;
  --corpo:'Archivo','Helvetica Neue',Helvetica,Arial,sans-serif;
  --mono:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --marfim:#131211; --papel:#1B1917; --areia:#232019; --linha:#332E26;
    --preto:#F2ECE1; --fumo:#9C9184; --laranja:#F26A28; --laranja-esc:#FF8347;
    --ok:#6FBF95; --alerta:#D7A54A;
    --sombra:0 1px 2px rgba(0,0,0,.4), 0 8px 24px -16px rgba(0,0,0,.8);
  }
}
:root[data-theme="dark"]{
  --marfim:#131211; --papel:#1B1917; --areia:#232019; --linha:#332E26;
  --preto:#F2ECE1; --fumo:#9C9184; --laranja:#F26A28; --laranja-esc:#FF8347;
  --ok:#6FBF95; --alerta:#D7A54A;
  --sombra:0 1px 2px rgba(0,0,0,.4), 0 8px 24px -16px rgba(0,0,0,.8);
}
"""

COMUM = """
*{box-sizing:border-box}
body{margin:0; background:var(--marfim); color:var(--preto); font-family:var(--corpo);
     font-size:16px; line-height:1.62; -webkit-font-smoothing:antialiased}
.env{max-width:1180px; margin:0 auto; padding:0 24px}
.leitura{max-width:68ch}
h1,h2,h3,h4,h5{text-wrap:balance; margin:0}
a{color:var(--laranja-esc)}
:focus-visible{outline:2px solid var(--laranja); outline-offset:3px; border-radius:2px}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
p{margin:0 0 15px}
ul.lista,ul.li{margin:0 0 14px; padding-left:0; list-style:none}
ul.lista li,ul.li li{position:relative; padding-left:19px; margin-bottom:8px}
ul.lista li::before,ul.li li::before{content:""; position:absolute; left:2px; top:.68em; width:6px; height:1.5px; background:var(--laranja)}

/* passos */
.passo{border-top:1px solid var(--linha); padding:20px 0 4px}
.passo:first-child{border-top:none; padding-top:2px}
.pcab{display:flex; align-items:center; gap:11px; margin-bottom:14px}
.pn{font-family:var(--disp); font-size:15px; line-height:1; color:var(--marfim); background:var(--preto);
    width:24px; height:24px; display:grid; place-items:center; border-radius:50%; flex:none}
.pcab h5{font-family:var(--mono); font-size:11.5px; letter-spacing:.13em; text-transform:uppercase; color:var(--preto); font-weight:500}

dl.cfg{display:grid; grid-template-columns:auto 1fr; gap:5px 16px; margin:0 0 14px; font-size:14px}
dl.cfg dt{font-family:var(--mono); font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--fumo); padding-top:3px}
dl.cfg dd{margin:0; line-height:1.55}

/* caixas copiaveis */
.cx{border:1px solid var(--linha); border-radius:9px; overflow:hidden; margin-bottom:14px; background:var(--papel)}
.cx header{display:flex; align-items:center; gap:10px; padding:8px 12px; background:var(--areia); border-bottom:1px solid var(--linha)}
.cx header span{font-family:var(--mono); font-size:10.5px; letter-spacing:.11em; text-transform:uppercase; color:var(--fumo)}
.cxmeta{margin-left:auto; font-variant-numeric:tabular-nums}
.copiar{margin-left:10px; font-family:var(--mono); font-size:10.5px; letter-spacing:.06em; text-transform:uppercase;
        border:1px solid var(--linha); background:var(--papel); color:var(--fumo); padding:4px 9px; border-radius:4px; cursor:pointer}
.copiar:hover{color:var(--preto); border-color:var(--fumo)}
.copiar[data-feito="1"]{color:var(--ok); border-color:var(--ok)}
.cx .txt{padding:14px 15px; font-size:15px; line-height:1.7; white-space:pre-wrap}
.cx .txt.m{font-family:var(--mono); font-size:13px; line-height:1.68}
.cx.destaque{border-color:var(--laranja)}
.cx.destaque header{background:color-mix(in srgb, var(--laranja) 13%, transparent)}
.cx.destaque header span{color:var(--laranja)}
.cx.destaque .txt{font-family:var(--corpo); font-size:16px; line-height:1.72}

.plano{margin-bottom:16px}
.pq{display:flex; align-items:baseline; gap:10px; font-family:var(--mono); font-size:11px;
    letter-spacing:.07em; color:var(--laranja); margin-bottom:6px}
.pq .org{color:var(--fumo); letter-spacing:.05em; text-transform:none}

.alerta{border-left:3px solid var(--alerta); background:color-mix(in srgb,var(--alerta) 11%,transparent);
        padding:10px 13px; border-radius:0 6px 6px 0; font-size:13.5px; margin-bottom:13px}
.nota{font-size:14px; line-height:1.6; color:var(--fumo); margin-bottom:11px}
.nota b{display:block; font-family:var(--mono); font-size:10.5px; letter-spacing:.11em;
        text-transform:uppercase; color:var(--preto); margin-bottom:4px}
.nota.at b{color:var(--alerta)}
.mk{font-family:var(--mono); font-size:.86em; color:var(--alerta); border:1px solid currentColor;
    padding:1px 5px; border-radius:3px; white-space:nowrap}
.campo{margin-bottom:14px}
.rot2{font-family:var(--mono); font-size:10.5px; letter-spacing:.11em; text-transform:uppercase; color:var(--fumo); margin-bottom:5px}
.campo .valor{font-size:14.5px; line-height:1.6}

/* storyboard */
.sbwrap{overflow-x:auto; border:1px solid var(--linha); border-radius:9px; -webkit-overflow-scrolling:touch}
table.sb{width:100%; border-collapse:collapse; min-width:720px; font-size:13.5px; table-layout:fixed}
table.sb th{font-family:var(--mono); font-size:10px; letter-spacing:.11em; text-transform:uppercase; text-align:left;
  color:var(--fumo); background:var(--areia); padding:9px 12px; border-bottom:1px solid var(--linha); font-weight:500}
table.sb td{padding:11px 12px; border-bottom:1px solid var(--linha); vertical-align:top; line-height:1.52; overflow-wrap:anywhere}
table.sb tr:last-child td{border-bottom:none}
table.sb tr:nth-child(even) td{background:color-mix(in srgb, var(--areia) 42%, transparent)}
th.c1{width:78px} th.c2{width:32%} th.c3{width:26%}
td.tt{font-family:var(--mono); font-size:11.5px; color:var(--laranja); white-space:nowrap; font-weight:500}
td.te{font-family:var(--mono); font-size:11.5px; color:var(--fumo); line-height:1.5}
td.fl{font-weight:500}
h5.pt{font-family:var(--mono); font-size:10.5px; letter-spacing:.13em; text-transform:uppercase;
  color:var(--laranja); margin:24px 0 9px; font-weight:500}
.fecho{border-top:1px solid var(--linha); padding-top:18px; margin-top:20px}
"""

# ------------------------------------------------------------------ secoes fixas
FERRAMENTA_SEC = """
<section id="ferramenta">
  <div class="env">
    <div class="rot">Parte três</div>
    <h2 class="tit">Um prompt, um storyboard</h2>
    <div class="leitura">
      <p>Cada roteiro tem <b>um bloco só</b> pra copiar. Quem é a pessoa, onde ela está, o que ela fala. Nada além disso precisa sair daqui pra ferramenta.</p>
      <p>Abaixo do prompt vem o storyboard daquele prompt: o que aparece na tela em cada trecho, o texto sobreposto e a fala correspondente. É o mapa da edição, não é coisa pra colar em lugar nenhum.</p>
    </div>

    <div class="regra">
      <div class="cab">No Arcads</div>
      <p>Você escolhe o ator em <span class="mono">Add Actors</span>, filtrando por gênero, idade e cenário. A seção QUEM do prompt diz exatamente o filtro e o tipo de cara procurar. A seção ONDE orienta a escolha do cenário do ator. A seção O QUE FALA é o texto que vai no campo de script, palavra por palavra.</p>
    </div>

    <h3 class="sub2">O teto de caracteres</h3>
    <div class="leitura">
      <p>O campo de script tem contador e mostra a duração estimada. Cada modelo aguenta um tamanho:</p>
    </div>
    <div class="grade">
      <div><h5>Omnihuman 1.5</h5><p>Até <strong>400 caracteres</strong>. O mais expressivo, com gesto de corpo inteiro.</p></div>
      <div><h5>Audio Driven</h5><p>Até <strong>600 caracteres</strong>, 45 segundos ou mais. É onde estes roteiros rodam.</p></div>
      <div><h5>Arcads 1.0</h5><p><strong>1500 caracteres ou mais</strong>. Para script longo, evitado aqui de propósito.</p></div>
    </div>
    <div class="leitura">
      <p>Todos os scripts cabem em 600 caracteres, o que dá 40 a 45 segundos falados com respiro e <b>uma geração só</b>, sem emenda na edição. O roteiro 20 cabe em 400.</p>
    </div>

    <div class="regra">
      <div class="cab">Áudio</div>
      <p>Em <span class="mono">Settings &gt; Audio</span>, escolha <b>Speech to Speech</b>, nunca Text to Speech. Você grava a própria voz lendo o script com os respiros no lugar e a ferramenta troca pela voz do ator. Texto lido pela máquina sai com entonação errada, e esse público percebe na hora.</p>
    </div>

    <h3 class="sub2">Dezesseis pessoas, não uma</h3>
    <div class="leitura">
      <p>Os dezesseis atores de IA são gente diferente em lugares diferentes, de propósito: idades de trinta e um a quarenta e sete, garagem, picape, obra, depósito, cozinha em reforma. Dezesseis vídeos com o mesmo rosto na mesma parede saturam o público em uma semana.</p>
    </div>
  </div>
</section>
"""

def producao_sec(rs):
    aviso = ""
    return f"""
<section id="producao">
  <div class="env">
    <div class="rot">Parte seis</div>
    <h2 class="tit">Da copy ao anúncio no ar</h2>

    <h3 class="sub2">Ordem de produção</h3>
    <div class="leitura"><p>Não produza os vinte. Teste ângulos diferentes primeiro, descubra qual o mercado responde, e só depois produza variações do que ganhou.</p></div>
    <div class="tl">
      <div class="tl-l"><time>1ª leva</time><div><b>Cinco criativos, um de cada família.</b> Roteiros 01, 05, 08, 15 e 17. Dor, inimigo, mecanismo, oferta e prova ao vivo. Cem reais em cada, um dia.</div></div>
      <div class="tl-l"><time>2ª leva</time><div><b>Três variações da família que ganhou.</b> Mesmo ângulo, hooks diferentes. É aqui que o custo por lead cai.</div></div>
      <div class="tl-l"><time>3ª leva</time><div><b>Roteiro 20 no retargeting</b> de quem viu setenta e cinco por cento de qualquer criativo e não chamou.</div></div>
    </div>

    <h3 class="sub2">Checklist antes de subir</h3>
    <ul class="lista">
      <li>O script cabe no teto do modelo escolhido, sem corte no fim</li>
      <li>A palavra do ICP está falada até o quinto segundo, em voz alta</li>
      <li>O áudio está em Speech to Speech, gravado por você, não lido pela máquina</li>
      <li>A fala mantém os respiros e não foi acelerada</li>
      <li>A legenda é pequena, preta, marfim, e acompanha a fala sem atrasar</li>
      <li>O CTA aparece só no último terço</li>
      <li>Nenhum travessão em nenhum texto</li>
      <li>Todo número na tela tem fonte que você mostra se alguém perguntar</li>
      <li>Nenhuma fala coloca você fisicamente nos Estados Unidos</li>
      <li>Todo plano de B-roll foi gerado, licenciado ou gravado por você</li>
      <li>9:16, 1080x1920, áudio em português, entre 40 e 60 segundos</li>
    </ul>

    <h3 class="sub2">Nomenclatura</h3>
    <div class="leitura">
      <p>Sem padrão você perde a leitura das métricas em duas semanas.</p>
      <div class="cx"><div class="txt m">LG_[numero]_[familia]_[hook-curto]_[versao]

LG_01_dor_diaria_v1.mp4
LG_05_inimigo_agenciasumiu_v1.mp4
LG_17_rodrigo_diagnosticoaovivo_v1.mp4</div></div>
      <p>No Meta o nome do anúncio repete o nome do arquivo, para o relatório falar português.</p>
    </div>

    <h3 class="sub2">O que trava a primeira leva</h3>
    <div class="nota at"><b>Pendente</b>Número americano. O WhatsApp do site ainda é o brasileiro provisório. Resolva Google Voice ou OpenPhone antes de subir.</div>
    <div class="nota at"><b>Pendente</b>Página no Facebook e conta de anúncio. Sem página não sobe anúncio.</div>
    <div class="nota at"><b>Pendente</b>Modelo do documento de diagnóstico. O roteiro 15 promete um PDF por escrito; ele precisa existir antes de alguém pedir.</div>
    <div class="nota at"><b>Pendente</b>Os dados marcados como a verificar. Cada roteiro lista o que conferir e onde.</div>
  </div>
</section>
"""

JS = """
const chips=[...document.querySelectorAll('.chip')],cont=document.getElementById('cont');
function filtrar(f){let n=0;document.querySelectorAll('.roteiro').forEach(el=>{
  const b=f==='tudo'||el.dataset.tipo===f||el.dataset.grupo===f;el.hidden=!b;if(b)n++;});
  cont.textContent=n+(n===1?' roteiro':' roteiros');}
chips.forEach(c=>c.addEventListener('click',()=>{chips.forEach(o=>o.setAttribute('aria-pressed',String(o===c)));filtrar(c.dataset.f);}));
filtrar('tudo');
document.addEventListener('click',ev=>{const b=ev.target.closest('.copiar');if(!b)return;
  const t=b.closest('.cx').querySelector('.txt').innerText;
  navigator.clipboard.writeText(t).then(()=>{b.textContent='Copiado';b.dataset.feito='1';
    setTimeout(()=>{b.textContent='Copiar';b.dataset.feito='';},1600);})
   .catch(()=>{b.textContent='Selecione e copie';});});
const raiz=document.documentElement,bt=document.getElementById('btema');
try{const s=localStorage.getItem('lg-tema');if(s)raiz.setAttribute('data-theme',s);}catch(e){}
bt.addEventListener('click',()=>{
  const sis=typeof window.matchMedia==='function'&&window.matchMedia('(prefers-color-scheme: dark)').matches;
  const esc=raiz.getAttribute('data-theme')==='dark'||(!raiz.getAttribute('data-theme')&&sis);
  const novo=esc?'light':'dark';raiz.setAttribute('data-theme',novo);
  try{localStorage.setItem('lg-tema',novo);}catch(e){}});
"""

CROMO = """
.barra{position:sticky;top:0;z-index:40;background:color-mix(in srgb,var(--marfim) 92%,transparent);
  backdrop-filter:saturate(1.4) blur(10px);border-bottom:1px solid var(--linha)}
.barra .env{display:flex;align-items:center;gap:18px;height:56px}
.marca{font-family:var(--disp);font-size:19px;letter-spacing:.055em;text-transform:uppercase;white-space:nowrap}
.marca em{font-style:normal;color:var(--laranja)}
.navlinks{display:flex;gap:2px;margin-left:auto;flex-wrap:wrap}
.navlinks a{font-family:var(--mono);font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;
  color:var(--fumo);text-decoration:none;padding:7px 10px;border-radius:5px}
.navlinks a:hover{color:var(--preto);background:var(--areia)}
.tema{font-family:var(--mono);font-size:11.5px;border:1px solid var(--linha);background:transparent;
  color:var(--fumo);padding:6px 9px;border-radius:5px;cursor:pointer}
.abre{padding:62px 0 40px;border-bottom:1px solid var(--linha)}
.eyebrow{font-family:var(--mono);font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--laranja);margin-bottom:18px}
.abre h1{font-family:var(--disp);font-size:clamp(40px,7.2vw,78px);line-height:.94;text-transform:uppercase;margin-bottom:22px}
.abre .sub{font-size:19px;color:var(--fumo);max-width:60ch;line-height:1.55}
.placar{display:flex;flex-wrap:wrap;gap:34px;margin-top:38px}
.placar b{display:block;font-family:var(--disp);font-size:38px;line-height:1}
.placar span{font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--fumo)}
section{padding:64px 0;border-bottom:1px solid var(--linha)}
.rot{font-family:var(--mono);font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--fumo);
  display:flex;align-items:center;gap:12px;margin-bottom:14px}
.rot::after{content:"";flex:1;height:1px;background:var(--linha)}
h2.tit{font-family:var(--disp);font-size:clamp(27px,3.7vw,42px);line-height:1.04;text-transform:uppercase;margin-bottom:16px}
h3.sub2{font-size:20px;font-weight:700;margin:38px 0 12px}
.mono{font-family:var(--mono);font-size:.92em}
.cit{font-style:italic;color:var(--fumo);border-left:2px solid var(--linha);padding:2px 0 2px 15px;margin:15px 0}
.cit cite{display:block;font-style:normal;font-family:var(--mono);font-size:11px;color:var(--fumo);margin-top:6px;opacity:.8}
.regra{border-left:3px solid var(--laranja);background:var(--papel);padding:17px 20px;margin:22px 0;
  border-radius:0 8px 8px 0;box-shadow:var(--sombra)}
.regra .cab{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--laranja);margin-bottom:7px}
.regra p:last-child{margin-bottom:0}
.grade{display:grid;grid-template-columns:repeat(auto-fit,minmax(232px,1fr));gap:1px;background:var(--linha);
  border:1px solid var(--linha);border-radius:10px;overflow:hidden;margin:26px 0}
.grade>div{background:var(--papel);padding:19px 20px}
.grade h5{margin:0 0 7px;font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--laranja)}
.grade p{margin:0;font-size:14.5px;color:var(--fumo);line-height:1.55}
.grade p strong{color:var(--preto);font-weight:600}
.frames{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:22px;margin:30px 0 8px}
.frames figure{margin:0}
.frames img{width:100%;display:block;border-radius:9px;border:1px solid var(--linha)}
.frames figcaption{font-family:var(--mono);font-size:11.5px;line-height:1.5;color:var(--fumo);margin-top:10px}
.frames figcaption b{display:block;color:var(--preto);letter-spacing:.06em;text-transform:uppercase;font-size:10.5px;margin-bottom:4px}
.tl{border:1px solid var(--linha);border-radius:10px;overflow:hidden;margin:26px 0;background:var(--papel)}
.tl-l{display:grid;grid-template-columns:88px 1fr;border-bottom:1px solid var(--linha)}
.tl-l:last-child{border-bottom:none}
.tl-l>*{padding:11px 14px}
.tl-l time{font-family:var(--mono);font-size:12px;color:var(--laranja);background:var(--areia);border-right:1px solid var(--linha);font-weight:500}
.tl-l div{font-size:14.5px;line-height:1.55}
.aviso{display:flex;gap:10px;font-size:13.5px;color:var(--fumo);background:var(--areia);border-radius:8px;padding:12px 14px;margin-top:16px}
.aviso b{color:var(--preto)}
.filtros{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 30px}
.chip{font-family:var(--mono);font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;padding:7px 13px;
  border:1px solid var(--linha);background:var(--papel);color:var(--fumo);border-radius:100px;cursor:pointer}
.chip[aria-pressed="true"]{background:var(--preto);color:var(--marfim);border-color:var(--preto)}
.contagem{font-family:var(--mono);font-size:11.5px;color:var(--fumo);align-self:center;margin-left:6px}
.roteiro{border:1px solid var(--linha);border-radius:11px;background:var(--papel);margin-bottom:13px;overflow:hidden;box-shadow:var(--sombra)}
.roteiro>summary{display:grid;grid-template-columns:60px 1fr auto;gap:17px;align-items:center;padding:17px 20px;cursor:pointer;list-style:none}
.roteiro>summary::-webkit-details-marker{display:none}
.roteiro>summary:hover{background:var(--areia)}
.roteiro[open]>summary{border-bottom:1px solid var(--linha)}
.num{font-family:var(--disp);font-size:37px;line-height:.86;color:var(--laranja);font-variant-numeric:tabular-nums}
.roteiro[open] .num{color:var(--preto)}
.tcab h3{font-size:18.5px;font-weight:700;margin-bottom:4px;line-height:1.25}
.tcab p{margin:0;font-size:14px;color:var(--fumo);line-height:1.5}
.selos{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end}
.selo{font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;padding:4px 8px;
  border-radius:4px;border:1px solid var(--linha);color:var(--fumo);white-space:nowrap}
.selo.ia{border-color:var(--laranja);color:var(--laranja)}
.selo.rod{background:var(--preto);color:var(--marfim);border-color:var(--preto)}
.corpo{padding:8px 20px 26px}
footer{padding:46px 0 66px;color:var(--fumo);font-size:13.5px}
footer .env{display:flex;flex-wrap:wrap;gap:18px;align-items:baseline;justify-content:space-between}
footer .fr{font-family:var(--disp);font-size:17px;letter-spacing:.05em;text-transform:uppercase;color:var(--preto)}
footer .fr em{font-style:normal;color:var(--laranja)}
@media (max-width:640px){
  .env{padding:0 17px}.abre{padding:40px 0 30px}section{padding:44px 0}
  .roteiro>summary{grid-template-columns:44px 1fr;gap:13px;padding:15px 16px}
  .num{font-size:29px}.selos{grid-column:1/-1;justify-content:flex-start;margin-top:4px}
  .corpo{padding:6px 16px 22px}.navlinks{display:none}
  dl.cfg{grid-template-columns:1fr;gap:2px 0}
  dl.cfg dt{padding-top:8px}
}
"""

IMPRESSAO = """
@page{size:A4 portrait;margin:14mm 13mm 16mm 13mm}
@page :first{margin-top:0}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-size:9.2pt;line-height:1.5;background:#fff}
.env{max-width:none;padding:0}
.capa{height:262mm;padding:34mm 0 0;display:flex;flex-direction:column;break-after:page}
.capa .eyebrow{font-size:8pt;letter-spacing:.18em;margin-bottom:9mm}
.capa h1{font-family:var(--disp);font-size:52pt;line-height:.93;text-transform:uppercase;margin:0 0 7mm}
.capa .sub{font-size:12pt;color:#5E564C;max-width:135mm}
.capa .placar{display:flex;gap:13mm;margin-top:14mm;flex-wrap:wrap}
.capa .placar b{font-family:var(--disp);font-size:24pt;line-height:1}
.capa .placar span{font-size:7pt;letter-spacing:.11em}
.capa .rodape{margin-top:auto;padding-top:8mm;border-top:1.5pt solid #171717;display:flex;justify-content:space-between;align-items:baseline}
.capa .rodape .marca{font-family:var(--disp);font-size:14pt;letter-spacing:.05em;text-transform:uppercase}
.capa .rodape .nota{font-family:var(--mono);font-size:7.5pt;color:#6E655A;text-align:right;line-height:1.7;margin:0}
.capa .rodape .nota b{display:none}
section{padding:0;border:none;break-before:page}
section#contexto{break-before:auto}
h2.tit{font-family:var(--disp);font-size:20pt;text-transform:uppercase;margin:0 0 5mm}
h3.sub2{font-size:12pt;margin:6mm 0 2.5mm}
.rot{font-size:7.5pt;letter-spacing:.15em;margin-bottom:2.5mm}
.leitura{max-width:none}
.frames{grid-template-columns:repeat(3,1fr);gap:5mm}
.grade{grid-template-columns:repeat(2,1fr)}
.grade>div{padding:3mm 3.5mm}
.grade p{font-size:8.4pt}
.tl-l{grid-template-columns:22mm 1fr}
.tl-l>*{padding:2mm 3mm}
.tl-l div{font-size:8.6pt}
.barra,.filtros,.contagem,.copiar,.tema,footer .fr+div,.navlinks{display:none!important}
.roteiro,.rot-imp{break-before:page}
.rot-imp .cab{display:flex;align-items:flex-start;gap:5mm;border-bottom:1.5pt solid #171717;padding-bottom:3.5mm;margin-bottom:4mm}
.num{font-family:var(--disp);font-size:30pt;line-height:1;color:#E65A19}
.tcab h3{font-size:14pt;margin:0 0 1.4mm}
.tcab p{font-size:9pt;color:#3F3A33}
.selos{margin-left:auto;flex-direction:column;align-items:flex-end;gap:1.5mm}
.selo{font-size:6.8pt;padding:.8mm 2mm}
.corpo{padding:0}
.passo{border-top:.6pt solid #DCD2BF;padding:4mm 0 1mm}
.pn{width:5mm;height:5mm;font-size:8pt}
.pcab h5{font-size:7.5pt}
dl.cfg{font-size:8.4pt;gap:1mm 5mm}
dl.cfg dt{font-size:7pt}
.cx{margin-bottom:3mm;break-inside:avoid-page}
.cx header{padding:1.5mm 3mm}
.cx header span{font-size:7pt}
.cx .txt{padding:3mm 3.5mm;font-size:9.6pt;line-height:1.6}
.cx .txt.m{font-size:7.8pt;line-height:1.55}
.cx.destaque .txt{font-size:10.4pt;line-height:1.65}
.plano{margin-bottom:3.5mm;break-inside:avoid-page}
.pq{font-size:7.5pt;margin-bottom:1.5mm}
table.sb{min-width:0;font-size:7.6pt;line-height:1.45}
table.sb th{font-size:6.8pt;padding:1.8mm}
table.sb td{padding:1.8mm}
table.sb tr{break-inside:avoid-page}
th.c1{width:14mm}th.c2{width:32%}th.c3{width:26%}
td.tt{font-size:7pt}td.te{font-size:6.9pt}
.sbwrap{overflow:visible}
.nota{font-size:8.2pt;margin-bottom:2.5mm;break-inside:avoid-page}
.nota b{font-size:7pt}
.alerta{font-size:8.2pt;padding:2mm 3mm}
.mk{font-size:.86em;padding:0 1mm}
h4,h5,.pcab,.rot-imp .cab{break-after:avoid-page}
.fecho{padding-top:3mm}
.sumario{break-after:page}
.sumario table{width:100%;border-collapse:collapse;font-size:9pt}
.sumario td{padding:2.2mm 2mm;border-bottom:.5pt solid #DCD2BF;vertical-align:top}
.sumario td.n{font-family:var(--disp);font-size:13pt;color:#E65A19;width:11mm;line-height:1}
.sumario td.t{font-weight:600}
.sumario td.g,.sumario td.d{font-family:var(--mono);font-size:7.5pt;color:#6E655A;white-space:nowrap}
.sumario tr.sep td{border-bottom:1.2pt solid #171717}
"""

CAB_FONTES = """<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap">"""

def placar(rs):
    ia = sum(1 for r in rs if r["tipo"] == "ia")
    bl = sum(len(r["storyboard"]) for r in rs)
    md = sorted(len(r["script_arcads"]) for r in rs)[len(rs) // 2]
    return [("20","roteiros"),(str(ia),"com IA"),(str(20-ia),"você grava"),
            (str(md),"caracteres, mediana"),(str(bl),"blocos")]

def main():
    rs = json.load(open(DADOS))
    rs.sort(key=lambda r: r["numero"])
    brief = (RAIZ / "marketing/anuncios/briefing.html").read_text()
    pl = "".join(f"<div><b>{a}</b><span>{b}</span></div>" for a, b in placar(rs))

    filtros = ['<button class="chip" data-f="tudo" aria-pressed="true">Todos</button>',
               '<button class="chip" data-f="ia" aria-pressed="false">Ator de IA</button>',
               '<button class="chip" data-f="gravado" aria-pressed="false">Você grava</button>']
    for g in dict.fromkeys(r["grupo"] for r in rs):
        filtros.append(f'<button class="chip" data-f="{e(g)}" aria-pressed="false">{e(g)}</button>')

    # ---------------- artefato
    art = f"""<title>Sala de Corte</title>
{CAB_FONTES}
<style>{TOKENS}{COMUM}{CROMO}</style>
<header class="barra"><div class="env">
  <div class="marca">Sala de C<em>o</em>rte</div>
  <nav class="navlinks">
    <a href="#contexto">Contexto</a><a href="#referencia">A referência</a>
    <a href="#ferramenta">A ferramenta</a><a href="#delta">O que muda</a>
    <a href="#roteiros">20 roteiros</a><a href="#producao">Produção</a>
  </nav>
  <button class="tema" id="btema" aria-label="Alternar tema">Tema</button>
</div></header>

<div class="abre"><div class="env">
  <div class="eyebrow">Leon Group · Meta Ads · Setembro de 2026</div>
  <h1>Vinte roteiros<br>prontos pra rodar</h1>
  <p class="sub">Cada peça partida em três: o script que vai no Arcads, os prompts de B-roll e a montagem. Um botão de copiar por campo de destino.</p>
  <div class="placar">{pl}</div>
</div></div>

{brief}
{FERRAMENTA_SEC}

<section id="roteiros"><div class="env">
  <div class="rot">Parte cinco</div>
  <h2 class="tit">Os vinte roteiros</h2>
  <div class="leitura">
    <p>Clique para abrir. Cada roteiro vem em três passos, e cada passo corresponde a um lugar diferente da ferramenta. O bloco laranja do passo um é o que você cola no campo de script do Arcads.</p>
  </div>
  <div class="filtros" role="group" aria-label="Filtrar roteiros">{''.join(filtros)}<span class="contagem" id="cont"></span></div>
  {''.join(cartao(r) for r in rs)}
</div></section>

{producao_sec(rs)}

<footer><div class="env">
  <div><div class="fr">Le<em>o</em>n Group · Built to Lead.</div>
  <div style="margin-top:6px">Vinte roteiros, dezesseis com ator de IA e quatro gravados por você.</div></div>
  <div style="font-family:var(--mono);font-size:11.5px;text-align:right;line-height:1.8">
    Frames extraídos da aula 02<br>Formato conferido na documentação do Arcads<br>Documento interno</div>
</div></footer>
<script>{JS}</script>"""
    ART.write_text(art)

    # ---------------- impressao
    sumario, ga = "", None
    for r in rs:
        sep = ' class="sep"' if ga and r["grupo"] != ga else ""
        ga = r["grupo"]
        sumario += (f'<tr{sep}><td class="n">{r["numero"]:02d}</td><td class="t">{e(r["titulo"])}</td>'
                    f'<td class="g">{e(r["grupo"])}</td>'
                    f'<td class="d">{"IA" if r["tipo"]=="ia" else "Você grava"} · {len(r["script_arcads"])} car.</td></tr>')
    cards = "".join(cartao(r, impressao=True) for r in rs).replace('<section class="rot">', '<section class="rot-imp">')
    imp = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Leon Group · 20 Roteiros de Anúncio</title>
{CAB_FONTES}
<style>{TOKENS}{COMUM}{CROMO}{IMPRESSAO}</style></head><body>
<div class="capa">
  <div class="eyebrow">Leon Group · Meta Ads · Setembro de 2026</div>
  <h1>Vinte roteiros<br>prontos pra rodar</h1>
  <p class="sub">Cada peça partida em três: o script que vai no Arcads, os prompts de B-roll e a montagem.</p>
  <div class="placar">{pl}</div>
  <div class="rodape"><div class="marca">Le<em>o</em>n Group · Built to Lead.</div>
  <div class="nota">Documento interno<br>Não distribuir</div></div>
</div>
<div class="sumario"><div class="rot">Sumário</div><h2 class="tit">Os vinte</h2><table>{sumario}</table>
  <h3 class="sub2">Como usar</h3>
  <p>Cada roteiro ocupa a sua própria página e vem em três passos. O <b>passo um</b> é o Arcads: escolha o modelo, filtre o ator na biblioteca, ponha o áudio em Speech to Speech e cole o script do quadro laranja. O <b>passo dois</b> são os prompts de B-roll, um por plano, em inglês. O <b>passo três</b> é a montagem.</p>
  <p>Os scripts foram escritos para caber em 600 caracteres, o teto do modelo Audio Driven, o que dá uma geração só sem emenda.</p>
  <h3 class="sub2">Primeira leva</h3>
  <p>Não produza os vinte. Comece com cinco, um de cada família: <b>01</b> a dor, <b>05</b> o inimigo comum, <b>08</b> o mecanismo, <b>15</b> a oferta e <b>17</b> a prova ao vivo.</p>
</div>
{brief}
{FERRAMENTA_SEC}
{cards}
{producao_sec(rs)}
</body></html>"""
    IMP.write_text(imp)
    print(f"artefato:  {ART.name}  {len(art)//1024} KB")
    print(f"impressão: {IMP.name}  {len(imp)//1024} KB")

    if "--pdf" in sys.argv:
        subprocess.run([CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer",
                        f"--print-to-pdf={PDF}", "--virtual-time-budget=30000", IMP.as_uri()],
                       capture_output=True, text=True)
        if PDF.exists():
            n = len(re.findall(rb"/Type\s*/Page[^s]", PDF.read_bytes()))
            print(f"pdf:       {PDF.name}  {PDF.stat().st_size//1024} KB  {n} páginas")
        else:
            print("pdf: falhou")
    return 0

if __name__ == "__main__":
    sys.exit(main())
