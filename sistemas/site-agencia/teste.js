const fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
const RAIZ='/Users/macbook/Leon Group - Buit To Lead /sistemas/site-agencia';
let ok=0,mal=0;
const t=(n,c,d='')=>{ if(c){ok++;console.log('  \x1b[32m✓\x1b[0m '+n+(d?'  → '+d:''))} else {mal++;console.log('  \x1b[31m✗ FALHOU\x1b[0m '+n+(d?'  → '+d:''))} };

// replacement como FUNÇÃO: string de troca trata $$ como escape de $
// e comeria o $$ do próprio código do site.
const inlinar=(h,arq)=>h.replace(new RegExp('<script src="'+arq.replace('.','\\.')+'"></script>'),
  ()=>'<script>'+fs.readFileSync(path.join(RAIZ,arq),'utf8')+'</script>');
let html=fs.readFileSync(path.join(RAIZ,'index.html'),'utf8');
html=inlinar(html,'conteudo.js'); html=inlinar(html,'site.js');

const erros=[];
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://leongroup.com/?fonte=Instagram',pretendToBeVisual:true,
  beforeParse(w){
    w.matchMedia=w.matchMedia||(q=>({matches:false,media:q,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}));
    // jsdom não tem IntersectionObserver: stub que revela na hora, pra exercitar o caminho real
    w.IntersectionObserver=class{constructor(cb){this.cb=cb}observe(el){this.cb([{isIntersecting:true,target:el}])}unobserve(){}disconnect(){}};
    Object.defineProperty(w.navigator,'language',{value:'pt-BR',configurable:true});
    w.alert=m=>{w.__alert=m};
    w.open=(u)=>{w.__aberto=u;return {}};
    w.fetch=()=>Promise.resolve({json:()=>Promise.resolve({})});
    w.addEventListener('error',e=>erros.push(String(e.error||e.message)));
  }});
const w=dom.window,doc=w.document;
const $=s=>doc.querySelector(s), $$=s=>[...doc.querySelectorAll(s)];

setTimeout(()=>{
  console.log('\n\x1b[1m═══ 1. ERRO DE JS ═══\x1b[0m');
  t('nenhum erro ao carregar',erros.length===0,erros.join(' | ')||'limpo');

  console.log('\n\x1b[1m═══ 2. ESCOLHA DE IDIOMA NA ABERTURA ═══\x1b[0m');
  t('porta de idioma aparece na 1ª visita',!$('#porta').hidden);
  t('tem os dois botões, PT e EN',$$('.porta .escolhas button').length===2,
    $$('.porta .escolhas button').map(b=>b.dataset.idi).join('/'));
  t('título aparece nos dois idiomas',$('#porta-tit').textContent.length>0 && $('#porta-sub').textContent.length>0,
    $('#porta-tit').textContent+' / '+$('#porta-sub').textContent);
  t('switch PT/EN também no header',$$('.idioma button').length===2);

  console.log('\n\x1b[1m═══ 3. CONTEÚDO EM PORTUGUÊS ═══\x1b[0m');
  t('html lang=pt-BR',doc.documentElement.lang==='pt-BR',doc.documentElement.lang);
  t('headline montada',$('#h1').textContent.trim().length>20,JSON.stringify($('#h1').textContent.trim()));
  t('parte laranja da headline existe',$$('#h1 .lar').length===1,$$('#h1 .lar').map(e=>e.textContent).join());
  t('nav em português',$('[data-t="nav_historia"]').textContent==='História');
  t('4 dores listadas',$$('#lista-dor li').length===4);
  t('4 parágrafos de história',$$('#hist p').length===4);
  t('destaque laranja na história',$$('#hist .lar').length>=3,$$('#hist .lar').length+' trechos');
  t('6 cards de serviço',$$('#cards .card').length===6);
  t('todo card tem ícone',$$('#cards .card svg').length===6);
  t('5 passos do método',$$('#passos .passo').length===5);
  t('6 itens de "o que não fazemos"',$$('#lista-nao li').length===6);
  t('8 perguntas no FAQ',$$('#lista-faq details').length===8);
  t('marquee com nichos duplicados',$$('#trilho span').length===36,$$('#trilho span').length+' itens');
  t('ano no rodapé',/20\d\d/.test($('#ano').textContent),$('#ano').textContent);

  console.log('\n\x1b[1m═══ 4. TROCA PARA INGLÊS ═══\x1b[0m');
  const antesH1=$('#h1').textContent;
  $$('.idioma button').find(b=>b.dataset.idi==='en').click();
  t('html lang=en',doc.documentElement.lang==='en',doc.documentElement.lang);
  t('headline mudou',$('#h1').textContent!==antesH1,JSON.stringify($('#h1').textContent.trim()));
  t('nav em inglês',$('[data-t="nav_historia"]').textContent==='Story');
  t('FAQ em inglês',$$('#lista-faq summary')[0].textContent.includes('paid ads'),
    $$('#lista-faq summary')[0].textContent);
  t('botão EN aceso',$$('.idioma button').find(b=>b.dataset.idi==='en').classList.contains('on'));
  t('botão PT apagado',!$$('.idioma button').find(b=>b.dataset.idi==='pt').classList.contains('on'));
  t('nº de seções igual nos dois idiomas',
    $$('#cards .card').length===6 && $$('#lista-faq details').length===8 && $$('#passos .passo').length===5);
  t('idioma gravado no localStorage',w.localStorage.getItem('leon_idioma')==='en');

  console.log('\n\x1b[1m═══ 5. VOLTA PRO PORTUGUÊS ═══\x1b[0m');
  $$('.idioma button').find(b=>b.dataset.idi==='pt').click();
  t('voltou pra pt-BR',doc.documentElement.lang==='pt-BR');
  t('conteúdo em português de novo',$('[data-t="nav_faq"]').textContent==='Dúvidas');

  console.log('\n\x1b[1m═══ 6. FORMULÁRIO → WHATSAPP ═══\x1b[0m');
  $$('[data-abrir]')[0].click();
  t('modal abriu',!$('#modal').hidden);
  t('select de serviço preenchido',$('#f_servico').options.length===11,$('#f_servico').options.length+' opções');
  t('placeholder desabilitado',$('#f_servico').options[0].disabled);

  console.log('\n  → tentando enviar vazio:');
  $('#form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  t('bloqueou envio vazio',!w.__aberto,'nenhuma janela aberta');
  t('marcou campos em erro',$$('.erro-c').length>=5,$$('.erro-c').length+' campos');
  t('mostrou mensagem de erro',$$('.msg-erro.ver').length>=5);

  console.log('\n  → preenchendo:');
  const set=(id,v)=>{const e=$(id);e.value=v;e.dispatchEvent(new w.Event('input',{bubbles:true}));e.dispatchEvent(new w.Event('change',{bubbles:true}))};
  set('#f_nome','João Silva');set('#f_empresa',"O'Brien Flooring LLC");set('#f_tel','+1 617 555 0123');
  set('#f_servico','Flooring');set('#f_cidade','Boston, MA');
  set('#f_papel','Dono da empresa (contractor)');set('#f_hoje','Só por indicação');
  t('prévia mostra a mensagem',$('#previa').textContent.includes('João Silva'));
  t('prévia captou a origem da URL (?fonte=Instagram)',$('#previa').textContent.includes('Instagram'),
    ($('#previa').textContent.match(/encontrei em: [^)]+/)||['-'])[0]);
  t('prévia resume o formulário',['Flooring','Boston, MA','indicação',"O'Brien"].every(x=>$('#previa').textContent.includes(x)));
  t('prévia pede pra saber mais',/saber mais/.test($('#previa').textContent));

  console.log('\n  → mensagem que vai pro WhatsApp:');
  console.log($('#previa').textContent.split('\n').map(l=>'      '+l).join('\n'));

  console.log('\n  → enviando:');
  w.__aberto=null; w.__alert=null;
  $('#form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  const link=w.__aberto||'';
  t('abriu o WhatsApp',/^https:\/\/wa\.me\//.test(link),link.slice(0,42)+'…');
  t('número correto no link',link.includes('wa.me/5561998629189'),(link.match(/wa\.me\/(\d+)/)||['','-'])[1]);
  t('mensagem codificada na URL',link.includes('?text=')&&link.length>180);
  t('mensagem decodificada bate com a prévia',
    decodeURIComponent((link.split('?text=')[1]||''))===$('#previa').textContent);
  t('modal fechou depois de enviar',$('#modal').hidden);
  t('nenhum aviso de erro',!w.__alert,w.__alert||'nenhum');

  console.log('\n\x1b[1m═══ 7. ISCA DE ROBÔ ═══\x1b[0m');
  w.__alert=null; w.__aberto=null;
  $$('[data-abrir]')[0].click();
  w.__alert=null;
  $('input[name="site_web"]').value='http://spam.com';
  $('#form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  t('robô que preenche o campo escondido é ignorado',!w.__alert&&!w.__aberto);

  console.log('\n\x1b[1m═══ 8. INTEGRIDADE DO TEXTO ═══\x1b[0m');
  // só o texto VISÍVEL: scripts inlinados pelo harness não contam
  const clone=doc.body.cloneNode(true);
  [...clone.querySelectorAll('script,style')].forEach(e=>e.remove());
  const todo=clone.textContent;
  const proibido=[[/\d+\s*(clientes|clients)\s*(atendidos|served)/i,'contagem de clientes'],
    [/garantimos.{0,25}(faturamento|posição|ranking)/i,'garantia de número'],
    [/desde\s+20\d\d|since\s+20\d\d/i,'ano de fundação inventado'],
    [/(sediada|based)\s+(em|in)\s+(Boston|Massachusetts|EUA|USA|the US)/i,'sede americana falsa'],
    [/["“][^"”]{25,}["”]\s*[—–-]\s*[A-Z][a-zà-ú]+/,'citação atribuída a alguém (depoimento)']];
  let limpo=true;
  proibido.forEach(([re,rot])=>{ if(re.test(todo)){limpo=false;console.log('    \x1b[31mencontrado:\x1b[0m '+rot+' → '+todo.match(re)[0]) } });
  // "depoimento"/"testimonial" só vale se NÃO estiver numa negação
  [...todo.matchAll(/depoimento|testimonial/gi)].forEach(m=>{
    const antes=todo.slice(Math.max(0,m.index-60),m.index);
    if(!/\b(n[ãa]o|nenhum|sem|don't|won't|no)\b/i.test(antes)){
      limpo=false;console.log('    \x1b[31mencontrado:\x1b[0m depoimento afirmado → ...'+antes.slice(-40)+m[0]);
    }
  });
  t('nenhuma alegação proibida pela regra de integridade',limpo);
  t('diz explicitamente que é agência nova',/agência nova/i.test(todo));
  t('assume que não tem caso publicado',/caso publicado ainda|caso real/i.test(todo));
  t('não finge presença nos EUA',/opera[çc]ão é remota/i.test(todo));

  console.log('\n'+(mal?'\x1b[31m':'\x1b[32m')+'\x1b[1m'+ok+' passaram, '+mal+' falharam\x1b[0m');
  process.exit(mal?1:0);
},800);
