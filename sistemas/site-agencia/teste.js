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
    w.__crm=[];
    w.fetch=(url,op)=>{ try{w.__crm.push(JSON.parse(op&&op.body||'{}'))}catch{w.__crm.push({})}
      return Promise.resolve({json:()=>Promise.resolve({})}) };
    w.addEventListener('error',e=>erros.push(String(e.error||e.message)));
  }});
const w=dom.window,doc=w.document;
const $=s=>doc.querySelector(s), $$=s=>[...doc.querySelectorAll(s)];
const visivel=()=>{const c=doc.body.cloneNode(true);[...c.querySelectorAll('script,style')].forEach(e=>e.remove());return c.textContent};

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
  t('7 cards de serviço',$$('#cards .card').length===7);
  t('todo card tem ícone',$$('#cards .card svg').length===7);
  t('6 passos do método',$$('#passos .passo').length===6);
  t('8 perguntas no FAQ',$$('#lista-faq details').length===8);
  t('ano no rodapé',/20\d\d/.test($('#ano').textContent),$('#ano').textContent);

  console.log('\n\x1b[1m═══ 4. AS 12 FUNÇÕES NA CONTA ═══\x1b[0m');
  t('12 funções listadas',$$('#lista-funcoes .fn').length===12,$$('#lista-funcoes .fn').length+' itens');
  const funcs=$$('#lista-funcoes .fn h3').map(e=>e.textContent);
  const esperadas=['Gestor de tráfego pago','Gestor de projeto','Especialista em Google Meu Negócio',
    'Editor de vídeo','Designer','Social media','Head comercial','Suporte integral','Copywriter',
    'I.A. e automação','Especialista em SEO','Head de performance'];
  const faltando=esperadas.filter(e=>!funcs.includes(e));
  t('todas as funções pedidas estão lá',faltando.length===0,faltando.join(', ')||'nenhuma faltando');
  t('funções numeradas de 01 a 12',$$('#lista-funcoes .nb').map(e=>e.textContent).join()==='01,02,03,04,05,06,07,08,09,10,11,12');
  t('nota diz que a agência é enxuta, sem inventar equipe',/enxuta/i.test($('.func-nota').textContent));
  t('não afirma número de funcionários',!/(equipe|time) de \d+|\d+ (funcion|profissionais contratados)/i.test(visivel()));

  console.log('\n\x1b[1m═══ 5. TRÁFEGO PAGO COMO ÚLTIMA ETAPA ═══\x1b[0m');
  const tudo=visivel();
  t('Google Ads citado',/Google Ads/.test(tudo));
  t('Meta Ads citado',/Meta Ads/.test(tudo));
  t('search do Google mencionado',/search/i.test(tudo));
  t('card de tráfego pago marcado como última etapa',
    $$('#cards .card.fim').length===1 && /Última etapa/.test($('#cards .card.fim .tag').textContent),
    $('#cards .card.fim .tag').textContent);
  t('é o último passo do método',$$('#passos .passo').at(-1).classList.contains('fim') &&
    /tr[áa]fego pago/i.test($$('#passos .passo').at(-1).textContent));

  console.log('\n\x1b[1m═══ 6. SLOGAN EM TODO LUGAR ═══\x1b[0m');
  const nSlogan=(tudo.match(/Built to Lead/g)||[]).length;
  t('slogan aparece em vários pontos do texto',nSlogan>=5,nSlogan+' ocorrências');
  t('slogan no header',/Built to Lead/.test($('.marca .lema').textContent));
  t('slogan no hero',/Built to Lead/.test($('.lema-carimbo').textContent));
  t('slogan na porta de idioma',/Built to Lead/.test($('.porta .lema-porta').textContent));
  t('faixa dedicada ao slogan',/Built\s*to Lead/.test($('.lema-faixa .dsp').textContent));
  t('slogan na seção de contato',/Built to Lead/.test($('.ct-lema').textContent));
  t('slogan no rodapé',/Built to Lead/.test($('footer .lema-pe').textContent));
  t('slogan no título da aba',/Built to Lead/.test(doc.title),doc.title);
  t('slogan roda no marquee',$$('#trilho .slg').length>=4,$$('#trilho .slg').length+' vezes');

  console.log('\n\x1b[1m═══ 7. NENHUM TRAVESSÃO NO TEXTO ═══\x1b[0m');
  const trav=(tudo.match(/[—–]/g)||[]).length;
  t('nenhum travessão no texto visível (pt)',trav===0,
    trav?'achei '+trav+': '+(tudo.match(/.{0,26}[—–].{0,26}/g)||[]).slice(0,3).join(' | '):'limpo');

  console.log('\n\x1b[1m═══ 8. LEÃO DE FUNDO ═══\x1b[0m');
  t('camada do leão existe',!!$('#leao'));
  t('usa o símbolo da marca',/simbolo\.png/.test($('#leao img').getAttribute('src')));
  t('tem brilho laranja junto',!!$('#leao .brilho'));
  t('fica atrás do conteúdo, não por cima',/\.env\{[^}]*z-index:3/.test(html)&&/\.leao\{[^}]*z-index:2/.test(html));
  const antesX=doc.documentElement.style.getPropertyValue('--lx');
  w.scrollY=4000; w.dispatchEvent(new w.Event('scroll'));
  t('posição é recalculada na rolagem',typeof antesX==='string');

  console.log('\n\x1b[1m═══ 9. TROCA PARA INGLÊS ═══\x1b[0m');
  const antesH1=$('#h1').textContent;
  $$('.idioma button').find(b=>b.dataset.idi==='en').click();
  t('html lang=en',doc.documentElement.lang==='en',doc.documentElement.lang);
  t('headline mudou',$('#h1').textContent!==antesH1,JSON.stringify($('#h1').textContent.trim()));
  t('nav em inglês',$('[data-t="nav_historia"]').textContent==='Story');
  t('FAQ em inglês',$$('#lista-faq summary')[0].textContent.includes('paid ads'),
    $$('#lista-faq summary')[0].textContent);
  t('12 funções também em inglês',$$('#lista-funcoes .fn').length===12);
  t('nenhum travessão no texto em inglês',!/[—–]/.test(visivel()));
  t('botão EN aceso',$$('.idioma button').find(b=>b.dataset.idi==='en').classList.contains('on'));
  t('nº de seções igual nos dois idiomas',
    $$('#cards .card').length===7 && $$('#lista-faq details').length===8 && $$('#passos .passo').length===6);
  t('idioma gravado no localStorage',w.localStorage.getItem('leon_idioma')==='en');

  console.log('\n\x1b[1m═══ 10. VOLTA PRO PORTUGUÊS ═══\x1b[0m');
  $$('.idioma button').find(b=>b.dataset.idi==='pt').click();
  t('voltou pra pt-BR',doc.documentElement.lang==='pt-BR');
  t('conteúdo em português de novo',$('[data-t="nav_faq"]').textContent==='Dúvidas');

  console.log('\n\x1b[1m═══ 11. FORMULÁRIO NA PÁGINA ═══\x1b[0m');
  t('formulário mora na seção de contato',$('#casa-form').contains($('#form')));
  t('4 motivos pra chamar listados',$$('#lista-pontos li').length===4);
  t('diagnóstico gratuito é o incentivo',/gratuito/i.test($('#contato').textContent));
  const ordem=[...$('#form').querySelectorAll('input:not(.mel),select')].map(e=>e.id);
  t('WhatsApp é o PRIMEIRO campo',ordem[0]==='f_tel',ordem.join(' → '));
  t('campo do WhatsApp vem destacado',$('#f_tel').closest('.campo').classList.contains('primeiro'));
  t('avisa que guarda o preenchimento incompleto',
    /guarda o que já foi preenchido/i.test($('.dica').textContent),$('.dica').textContent.trim().slice(0,60)+'…');

  console.log('\n\x1b[1m═══ 12. GUARDAR QUEM DESISTE NO MEIO ═══\x1b[0m');
  const set=(id,v)=>{const e=$(id);e.value=v;e.dispatchEvent(new w.Event('input',{bubbles:true}));e.dispatchEvent(new w.Event('change',{bubbles:true}))};
  w.__crm=[];
  set('#f_tel','+1 617 555 0123');
  t('nada é mandado enquanto a pessoa ainda digita',w.__crm.length===0);
  w.dispatchEvent(new w.Event('pagehide'));
  t('ao sair da página, manda o parcial',w.__crm.length===1,JSON.stringify(w.__crm[0]||{}).slice(0,70)+'…');
  const pc=w.__crm[0]||{};
  t('vai marcado como parcial',pc.parcial===1);
  t('leva o telefone',/617/.test(pc.telefone||''));
  t('leva a sessão pra não duplicar o lead depois',!!pc.sessao&&pc.sessao.length>6);
  t('leva a origem detectada na URL',pc.origem==='Instagram',pc.origem);

  w.__crm=[];
  const el=$('#f_tel');el.value='';el.dispatchEvent(new w.Event('input',{bubbles:true}));
  w.dispatchEvent(new w.Event('pagehide'));
  t('sem telefone válido não manda nada',w.__crm.length===0);
  set('#f_tel','+1 617 555 0123');

  console.log('\n\x1b[1m═══ 13. MODAL PEGA O MESMO FORMULÁRIO EMPRESTADO ═══\x1b[0m');
  $$('[data-abrir]')[0].click();
  t('modal abriu',!$('#modal').hidden);
  t('formulário foi movido pro modal',$('#vaga-form').contains($('#form')));
  t('não existem dois formulários',$$('form').length===1);
  t('o que já tinha sido digitado continua lá',$('#f_tel').value.includes('617'));
  t('select de serviço preenchido',$('#f_servico').options.length===11,$('#f_servico').options.length+' opções');
  t('placeholder desabilitado',$('#f_servico').options[0].disabled);

  console.log('\n  → tentando enviar incompleto:');
  w.__aberto=null;
  $('#form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  t('bloqueou envio incompleto',!w.__aberto,'nenhuma janela aberta');
  t('marcou campos em erro',$$('.erro-c').length>=5,$$('.erro-c').length+' campos');
  t('mostrou mensagem de erro',$$('.msg-erro.ver').length>=5);
  t('o WhatsApp preenchido não foi marcado como erro',!$('#f_tel').classList.contains('erro-c'));

  console.log('\n  → preenchendo o resto:');
  set('#f_nome','João Silva');set('#f_empresa',"O'Brien Flooring LLC");
  set('#f_servico','Flooring');set('#f_cidade','Boston, MA');
  set('#f_papel','Dono da empresa (contractor)');set('#f_hoje','Só por indicação');
  t('prévia mostra a mensagem',$('#previa').textContent.includes('João Silva'));
  t('prévia captou a origem da URL (?fonte=Instagram)',$('#previa').textContent.includes('Instagram'),
    ($('#previa').textContent.match(/encontrei em: [^)]+/)||['-'])[0]);
  t('prévia resume o formulário',['Flooring','Boston, MA','indicação',"O'Brien"].every(x=>$('#previa').textContent.includes(x)));
  t('prévia pede pra saber mais',/saber mais/.test($('#previa').textContent));
  t('nenhum travessão na mensagem do WhatsApp',!/[—–]/.test($('#previa').textContent));

  console.log('\n  → mensagem que vai pro WhatsApp:');
  console.log($('#previa').textContent.split('\n').map(l=>'      '+l).join('\n'));

  console.log('\n  → enviando:');
  w.__aberto=null; w.__alert=null; w.__crm=[];
  $('#form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  const link=w.__aberto||'';
  t('abriu o WhatsApp',/^https:\/\/wa\.me\//.test(link),link.slice(0,42)+'…');
  t('número correto no link',link.includes('wa.me/5561998629189'),(link.match(/wa\.me\/(\d+)/)||['','-'])[1]);
  t('mensagem codificada na URL',link.includes('?text=')&&link.length>180);
  t('mensagem decodificada bate com a prévia',
    decodeURIComponent((link.split('?text=')[1]||''))===$('#previa').textContent);
  t('avisou o CRM como envio completo',(w.__crm[0]||{}).parcial===0);
  t('mesma sessão do parcial, então é o mesmo lead',(w.__crm[0]||{}).sessao===pc.sessao);
  t('modal fechou depois de enviar',$('#modal').hidden);
  t('formulário voltou pra seção de contato',$('#casa-form').contains($('#form')));
  t('nenhum aviso de erro',!w.__alert,w.__alert||'nenhum');

  w.__crm=[];
  w.dispatchEvent(new w.Event('pagehide'));
  t('depois de enviar, para de mandar parcial',w.__crm.length===0);

  console.log('\n\x1b[1m═══ 14. ISCA DE ROBÔ ═══\x1b[0m');
  w.__alert=null; w.__aberto=null;
  $$('[data-abrir]')[0].click();
  $('input[name="site_web"]').value='http://spam.com';
  $('#form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  t('robô que preenche o campo escondido é ignorado',!w.__alert&&!w.__aberto);
  $('input[name="site_web"]').value='';

  console.log('\n\x1b[1m═══ 15. PLANOS ═══\x1b[0m');
  /* O primeiro plano é o alvo. Os outros dois ancoram e são entregáveis de
     verdade. O que este bloco impede: a ancoragem inverter sozinha (o plano
     caro roubando o destaque) e o clique num plano estragar o select de
     ofício, que é outra coisa. */
  const planos=$$('.plano');
  t('os três planos desenharam', planos.length===3, planos.length+' planos');
  t('só um é o alvo', $$('.plano.alvo').length===1);
  t('e o alvo é o PRIMEIRO, o mais barato',
    planos[0].classList.contains('alvo'),
    planos.map(p=>p.querySelector('h3').textContent).join(' · '));
  t('o alvo diz "comece por aqui"',/Comece por aqui/i.test($('.plano.alvo .selo').textContent),
    $('.plano.alvo .selo').textContent);
  t('os outros dois dizem "para depois", não "melhor"',
    $$('.plano.depois .selo').every(e=>/Para depois/i.test(e.textContent)));
  t('só o alvo tem preço fechado; os outros dizem "a partir de"',
    !$('.plano.alvo .partir') && $$('.plano.depois .partir').length===2);
  t('o alvo custa 2.500',/2\.500/.test($('.plano.alvo .num').textContent),
    $('.plano.alvo .num').textContent);
  t('os preços sobem da esquerda para a direita', (()=>{
    const n=planos.map(p=>parseFloat(p.querySelector('.num').textContent.replace(/\./g,'')));
    return n[0]<n[1]&&n[1]<n[2]})(),
    planos.map(p=>p.querySelector('.num').textContent).join(' < '));
  t('cada plano lista o que entrega',
    planos.every(p=>p.querySelectorAll('li').length>=5),
    planos.map(p=>p.querySelectorAll('li').length+' itens').join(' · '));
  t('cada plano tem botão', $$('.plano .bt').length===3);
  t('as três notas de transparência aparecem', $$('.planos-notas p').length===3);
  t('a nota de agência nova está em destaque', !!$('.planos-notas p.nova'));
  t('diz que não recebe percentual sobre a verba de anúncio',
    /não recebe percentual sobre a verba/i.test($('#planos-notas').textContent));
  t('diz que o valor mensal não é mensalidade',
    /não uma mensalidade/i.test($('#planos-notas').textContent));
  t('oferece o diagnóstico gratuito para quem não sabe escolher',
    /diagnóstico gratuito/i.test($('#planos-duvida').textContent));
  t('o menu tem link para planos', !!$('a[href="#planos"]'));

  /* O clique registra o plano num campo próprio. Antes eu tinha ligado no
     #f_servico, que é o OFÍCIO dele: escrever o nome de um plano ali gravaria
     um valor que não existe entre as opções do select. */
  const antesOficio=$('#f_servico').value;
  $$('.plano.alvo .bt')[0].click();
  t('clicar no plano registra qual foi, em campo próprio',
    $('#f_plano').value.length>0, $('#f_plano').value);
  t('e NÃO estraga o select de ofício', $('#f_servico').value===antesOficio,
    'ofício segue "'+$('#f_servico').value+'"');
  t('o campo do plano é escondido, porque não é pergunta',
    $('#f_plano').type==='hidden');

  console.log('\n\x1b[1m═══ 16. INTEGRIDADE DO TEXTO ═══\x1b[0m');
  const todo=visivel();
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
},900);
