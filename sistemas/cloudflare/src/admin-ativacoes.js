/* ═══════════════ ATIVAÇÕES NA TELA ═══════════════
   A seção que mais muda no card do lead.

   ANTES: uma grade de dez botões. Clicar registrava na hora, e o conteúdo era
   inventado por fora, do zero, toda vez.

   AGORA: um checklist. Cada linha diz se já foi mandada, quantas vezes, quando
   e se teve resposta. Clicar ABRE o playbook daquela ativação, já com o nome e
   a empresa do lead dentro: o que escrever, o que falar no áudio, os emojis, a
   direção da foto e o prompt pronto para colar no gerador. Registrar é outro
   clique, depois de mandar.

   A decisão de desenho que resolve o problema real: o playbook abre DENTRO da
   linha, não num modal. O card do lead já é um painel lateral, e modal em cima
   de painel esconde o lead que ele está tentando ativar.                    */

export const CSS_ATIV = `
/* ── cabeçalho da seção ── */
.at-cab{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:10px}
.at-cab .cota{font:600 11px/1 inherit;letter-spacing:.05em;text-transform:uppercase;
  color:var(--laranja-esc);background:var(--laranja-pal);padding:4px 9px;border-radius:99px}
.at-cab .cota.zero{background:var(--areia);color:var(--cinza)}
.at-cab .prog{margin-left:auto;font:600 11.5px/1 ui-monospace,monospace;color:var(--cinza)}
.at-cab .prog b{color:var(--preto)}
.at-falta{background:#fbe9e2;border-left:3px solid var(--laranja-esc);border-radius:0 5px 5px 0;
  padding:9px 13px;font-size:12px;line-height:1.5;margin-bottom:11px}
/* ── o checklist ── */
.at-grupo{margin-top:13px}
.at-grupo>b{font:700 9.5px/1 inherit;letter-spacing:.13em;text-transform:uppercase;
  color:var(--cinza);display:block;margin-bottom:6px}
.at-l{border:1px solid var(--areia);border-radius:7px;margin-bottom:5px;background:var(--branco);
  overflow:hidden}
.at-l.feito{background:#f6faf7;border-color:#cfe3d6}
.at-l.aberto{border-color:var(--laranja);background:#fffaf6}
.at-topo{display:grid;grid-template-columns:22px 1fr auto;gap:9px;align-items:center;
  padding:9px 11px;cursor:pointer;user-select:none}
.at-topo:hover{background:var(--marfim)}
.at-l.feito .at-topo:hover{background:#eef6f1}
.at-ic{width:19px;height:19px;border-radius:50%;border:1.5px solid var(--areia);
  display:flex;align-items:center;justify-content:center;font:700 11px/1 inherit;flex:none;
  color:var(--cinza);background:var(--branco)}
.at-l.feito .at-ic{background:var(--verde);border-color:var(--verde);color:#fff}
.at-l.aberto .at-ic{border-color:var(--laranja);color:var(--laranja-esc);border-style:dashed}
.at-nome{font-size:12.8px;font-weight:600;line-height:1.3}
.at-nome small{display:block;font-weight:400;font-size:11px;color:var(--cinza);margin-top:1px}
.at-dir{font:600 10.5px/1 ui-monospace,monospace;color:var(--cinza);white-space:nowrap}
.at-l.feito .at-dir{color:var(--verde)}
.at-resp{display:inline-block;background:#e5f0e9;color:var(--verde);font:700 9.5px/1 inherit;
  letter-spacing:.06em;text-transform:uppercase;padding:3px 6px;border-radius:3px;margin-left:5px}
/* ── o playbook aberto ── */
.at-corpo{border-top:1px solid var(--areia);padding:13px 12px;background:var(--marfim);
  display:none}
.at-l.abre .at-corpo{display:block}
.at-quando{font-size:12.5px;line-height:1.55;color:var(--preto);margin-bottom:4px}
.at-porque{font-size:11.8px;line-height:1.5;color:var(--cinza);margin-bottom:12px;
  padding-left:11px;border-left:2px solid var(--areia)}
.at-bloco{margin-bottom:11px}
.at-rot{font:700 9.5px/1 inherit;letter-spacing:.12em;text-transform:uppercase;
  color:var(--cinza);margin-bottom:5px;display:flex;align-items:center;gap:8px}
.at-rot .cp{margin-left:auto;border:1px solid var(--areia);background:var(--branco);
  border-radius:4px;padding:3px 9px;font:600 10.5px/1 inherit;cursor:pointer;color:var(--cinza);
  letter-spacing:0;text-transform:none}
.at-rot .cp:hover{border-color:var(--laranja);color:var(--laranja-esc)}
.at-rot .cp.ok{background:#e5f0e9;border-color:#bcd9c8;color:var(--verde)}
.at-txt{background:var(--branco);border:1px solid var(--areia);border-radius:6px;
  padding:10px 12px;font-size:13px;line-height:1.55;white-space:pre-wrap;word-break:break-word}
.at-txt.mono{font:11.5px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;max-height:200px;
  overflow-y:auto;background:var(--preto);color:#d9d4cb;border-color:var(--preto)}
.at-emojis{display:flex;gap:6px;flex-wrap:wrap}
.at-emojis button{border:1px solid var(--areia);background:var(--branco);border-radius:6px;
  padding:6px 11px;font-size:17px;cursor:pointer;line-height:1}
.at-emojis button:hover{border-color:var(--laranja);background:var(--laranja-pal)}
.at-prompt{border:1px solid var(--areia);border-radius:7px;overflow:hidden;margin-bottom:9px;
  background:var(--branco)}
.at-prompt .cab{padding:9px 11px;background:var(--branco);border-bottom:1px solid var(--areia)}
.at-prompt .cab b{font-size:12.5px;display:block}
.at-prompt .cab span{font-size:11px;color:var(--cinza);display:block;margin-top:2px;line-height:1.45}
.at-prompt .cab .saida{display:inline-block;font:700 9.5px/1 inherit;letter-spacing:.07em;
  text-transform:uppercase;background:var(--op-claro);color:var(--op);padding:3px 7px;
  border-radius:3px;margin-top:6px}
.at-prompt .pe{padding:10px 11px;display:flex;gap:7px;align-items:center;flex-wrap:wrap}
.at-nao{background:#fbe9e2;border-radius:6px;padding:10px 12px;margin-top:4px}
.at-nao b{font:700 9.5px/1 inherit;letter-spacing:.12em;text-transform:uppercase;
  color:var(--laranja-esc);display:block;margin-bottom:6px}
.at-nao ul{margin:0;padding-left:16px}
.at-nao li{font-size:12px;line-height:1.5;color:var(--preto);margin-bottom:3px}
.at-fim{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-top:13px;
  padding-top:11px;border-top:1px solid var(--areia)}
.at-fim .obs{flex:1;min-width:150px;margin:0}
`;

export const JS_ATIV = `
/* ═══════════ ATIVAÇÕES ═══════════ */
let atAberta=null, atPlaybook={};

/* Copiar para a área de transferência. clipboard.writeText só existe em
   contexto seguro; o fallback com textarea cobre o resto e não pode falhar
   em silêncio, senão o operador acha que copiou e cola o nada. */
async function atCopiar(texto, bt){
  let ok=false;
  try{ await navigator.clipboard.writeText(texto); ok=true }
  catch(e){
    try{
      const ta=document.createElement('textarea');
      ta.value=texto; ta.style.cssText='position:fixed;top:-9999px';
      document.body.appendChild(ta); ta.select();
      ok=document.execCommand('copy'); ta.remove();
    }catch(e2){ ok=false }
  }
  if(bt){
    const antes=bt.textContent;
    bt.textContent=ok?'copiado':'não copiou';
    bt.classList.toggle('ok',ok);
    setTimeout(()=>{bt.textContent=antes;bt.classList.remove('ok')},1600);
  }
  if(!ok) alert('Não consegui copiar sozinho. Selecione o texto e copie na mão.');
  return ok;
}

/* O checklist. Agrupado, porque dez linhas soltas viram parede. */
function l_ativacoes(l){
  const lista=l.checklist_ativacoes||[];
  if(!lista.length) return '<p style="color:var(--cinza);font-size:12.5px">Sem catálogo carregado.</p>';
  const feitos=lista.filter(x=>x.feito).length;
  const respostas=lista.reduce((n,x)=>n+x.respostas,0);
  const cota=(D.ativacoes||{})[l.coluna];
  const falta=l.ativacao_falta||[];

  let h='<div class="at-cab">'
    +'<span class="cota'+(cota?'':' zero')+'">'
      +(cota?cota+' por dia nesta coluna':'sem cota nesta coluna')+'</span>'
    +'<span class="prog"><b>'+feitos+'</b>/'+lista.length+' usadas'
      +(respostas?' · '+respostas+' resposta(s)':'')+'</span></div>';

  if(falta.length) h+='<div class="at-falta"><b>Falta cadastrar: '+esc(falta.join(', '))+'.</b><br>'
    +'O playbook usa esses campos, e o PDF sai com o campo vazio se você gerar assim. '
    +'Preencha em "Onde o lead está" e nos dados do lead antes de gerar peça.</div>';

  const GRUPOS={contato:'Contato direto',efemero:'Visualização única',
                leve:'Toque leve',peca:'Peça pronta'};
  for(const g in GRUPOS){
    const doGrupo=lista.filter(x=>x.grupo===g);
    if(!doGrupo.length) continue;
    h+='<div class="at-grupo"><b>'+esc(GRUPOS[g])+'</b>'
      +doGrupo.map(x=>{
        const cls=[x.feito?'feito':'', x.aberto_sem_mandar?'aberto':''].filter(Boolean).join(' ');
        const ic=x.feito?'&#10003;':(x.aberto_sem_mandar?'&#8943;':'');
        let dir='';
        if(x.feito) dir=x.vezes+'x'+(x.ultima?' · '+new Date(x.ultima).toLocaleDateString('pt-BR'):'');
        else if(x.aberto_sem_mandar) dir='aberto, não mandou';
        return '<div class="at-l '+cls+'" id="atl_'+x.tipo+'">'
          +'<div class="at-topo" onclick="atAbrir(\\''+x.tipo+'\\')">'
            +'<span class="at-ic">'+ic+'</span>'
            +'<span class="at-nome">'+esc(x.rotulo)
              +(x.respostas?'<span class="at-resp">respondeu</span>':'')
              +(x.tem_playbook?'':'<small>sem playbook ainda</small>')+'</span>'
            +'<span class="at-dir">'+esc(dir)+'</span>'
          +'</div>'
          +'<div class="at-corpo" id="atc_'+x.tipo+'"></div>'
        +'</div>';
      }).join('')+'</div>';
  }
  return h;
}

/* Abrir o playbook. Buscar do servidor em vez de mandar tudo no /api/lead:
   os dois prompts do usuário somam 17 KB, e carregar isso em TODO lead
   aberto seria pagar 17 KB por card para usar em um clique de vez em quando. */
async function atAbrir(tipo){
  const linha=document.getElementById('atl_'+tipo);
  const corpo=document.getElementById('atc_'+tipo);
  if(!linha||!corpo) return;
  if(linha.classList.contains('abre')){        // segundo clique fecha
    linha.classList.remove('abre'); atAberta=null; return;
  }
  document.querySelectorAll('.at-l.abre').forEach(e=>e.classList.remove('abre'));
  linha.classList.add('abre'); atAberta=tipo;
  corpo.innerHTML='<p style="color:var(--cinza);font-size:12.5px">Montando o playbook...</p>';
  const pb=await api('/api/ativacao-playbook?id='+aberto+'&tipo='+encodeURIComponent(tipo));
  if(pb.erro){ corpo.innerHTML='<p style="color:#c0392b;font-size:12.5px">'+esc(pb.erro)+'</p>'; return }
  atPlaybook[tipo]=pb;
  corpo.innerHTML=atCorpo(pb);
}

function atCorpo(pb){
  const bloco=(rot,txt,mono,id)=>!txt?'':'<div class="at-bloco"><div class="at-rot">'+esc(rot)
    +'<button class="cp" onclick="atCopiarDe(\\''+pb.tipo+'\\',\\''+id+'\\',this)">copiar</button></div>'
    +'<div class="at-txt'+(mono?' mono':'')+'">'+esc(txt)+'</div></div>';

  let h='';
  if(pb.quando_usar) h+='<div class="at-quando"><b>Quando usar:</b> '+esc(pb.quando_usar)+'</div>';
  if(pb.por_que) h+='<div class="at-porque">'+esc(pb.por_que)+'</div>';

  h+=bloco('O que mandar escrito', pb.texto_pt, false, 'texto_pt');
  h+=bloco('Se ele preferir inglês', pb.texto_en, false, 'texto_en');
  h+=bloco('O que falar no áudio', pb.roteiro_audio, false, 'roteiro_audio');

  if(pb.emojis&&pb.emojis.length) h+='<div class="at-bloco"><div class="at-rot">Emoji</div>'
    +'<div class="at-emojis">'+pb.emojis.map(e=>
      '<button onclick="atCopiar('+JSON.stringify(e).replace(/"/g,'&quot;')+',null);this.style.borderColor=\\'var(--verde)\\'">'
      +esc(e)+'</button>').join('')+'</div></div>';

  h+=bloco('A imagem: o que tem que aparecer', pb.direcao_visual, false, 'direcao_visual');

  if(pb.prompts&&pb.prompts.length){
    h+='<div class="at-bloco"><div class="at-rot">Prompt pronto, já com os dados do lead</div>';
    h+=pb.prompts.map((pr,i)=>'<div class="at-prompt">'
      +'<div class="cab"><b>'+esc(pr.titulo)+'</b>'
        +(pr.onde?'<span>'+esc(pr.onde)+'</span>':'')
        +'<span class="saida">devolve: '+esc(pr.saida)+'</span></div>'
      +'<div class="pe">'
        +'<button class="acao" onclick="atCopiarPrompt(\\''+pb.tipo+'\\','+i+',this)">Copiar o prompt inteiro</button>'
        +'<button class="acao sec" onclick="atVerPrompt(\\''+pb.tipo+'\\','+i+',this)">Ver</button>'
        +'<span style="font-size:11px;color:var(--cinza)">'+pr.texto.length.toLocaleString('pt-BR')+' caracteres</span>'
      +'</div>'
      +'<div class="at-txt mono" id="pv_'+pb.tipo+'_'+i+'" style="display:none;margin:0 11px 11px">'
        +esc(pr.texto)+'</div>'
    +'</div>').join('');
    h+='</div>';
  }

  if(pb.nao_fazer&&pb.nao_fazer.length) h+='<div class="at-nao"><b>Não faça</b><ul>'
    +pb.nao_fazer.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div>';

  h+='<div class="at-fim">'
    +'<button class="acao" onclick="atRegistrar(\\''+pb.tipo+'\\')">Mandei, registrar</button>'
    +'<input class="obs" id="atobs_'+pb.tipo+'" placeholder="observação (opcional)">'
    +'</div>';
  return h;
}

function atCopiarDe(tipo,campo,bt){
  const pb=atPlaybook[tipo]; if(!pb) return;
  atCopiar(pb[campo]||'',bt);
}
function atCopiarPrompt(tipo,i,bt){
  const pb=atPlaybook[tipo]; if(!pb||!pb.prompts[i]) return;
  atCopiar(pb.prompts[i].texto,bt);
}
function atVerPrompt(tipo,i,bt){
  const el=document.getElementById('pv_'+tipo+'_'+i); if(!el) return;
  const mostra=el.style.display==='none';
  el.style.display=mostra?'block':'none';
  bt.textContent=mostra?'Esconder':'Ver';
}

/* Registrar o envio. Manda junto o texto que estava na tela, para depois dar
   para comparar qual redação trouxe resposta. */
async function atRegistrar(tipo){
  const pb=atPlaybook[tipo]||{};
  const obs=document.getElementById('atobs_'+tipo);
  const r=await post('/api/ativacao',{id:aberto,tipo:tipo,
    nota:obs?obs.value.trim():'',
    conteudo:pb.texto_pt||pb.roteiro_audio||pb.direcao_visual||''});
  if(r.erro) return alert(r.erro);
  atAberta=null;
  await carregar(); abrirLead(aberto);
}
`;
