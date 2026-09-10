const fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
const RAIZ=process.cwd();
const inlinar=(h,arq)=>h.replace(new RegExp('<script src="'+arq.replace('.','\\.')+'"></script>'),
  ()=>'<script>'+fs.readFileSync(path.join(RAIZ,arq),'utf8')+'</script>');
let html=fs.readFileSync(path.join(RAIZ,'index.html'),'utf8');
html=inlinar(html,'conteudo.js'); html=inlinar(html,'site.js');
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://leon-group-site.pages.dev/',pretendToBeVisual:true,
  beforeParse(w){
    w.matchMedia=w.matchMedia||(q=>({matches:false,media:q,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}));
    w.IntersectionObserver=class{constructor(cb){this.cb=cb}observe(el){this.cb([{isIntersecting:true,target:el}])}unobserve(){}disconnect(){}};
    w.fetch=()=>Promise.resolve({json:()=>Promise.resolve({})});Object.defineProperty(w.navigator,'language',{value:'pt-BR',configurable:true});
    console.log('sendBeacon existe em jsdom?', typeof w.navigator.sendBeacon);
  }});
const w=dom.window,doc=w.document;
setTimeout(()=>{
  const txt=()=>{const c=doc.body.cloneNode(true);[...c.querySelectorAll('script,style')].forEach(e=>e.remove());
    return c.textContent.split('\n').map(s=>s.trim()).filter(Boolean).join('\n');};
  const pt=txt();
  [...doc.querySelectorAll('.idioma button')].find(b=>b.dataset.idi==='en').click();
  const en=txt();
  const setPT=new Set(pt.split('\n')), setEN=new Set(en.split('\n'));
  const iguais=[...setEN].filter(l=>setPT.has(l));
  console.log('\n--- linhas IDÊNTICAS em pt e en (candidatos a texto sem tradução) ---');
  iguais.forEach(l=>console.log('  |',l.slice(0,160)));
  // heurística: palavras portuguesas em modo EN
  const pal=/\b(você|voc\u00ea|Serviços|Dúvidas|História|Falar|Preencha|Escolha|Idioma|Fechar|não|obra|cliente|empresa|gratuito)\b/i;
  console.log('\n--- linhas em EN que parecem português ---');
  en.split('\n').filter(l=>pal.test(l)).forEach(l=>console.log('  !',l.slice(0,160)));
  console.log('\n--- atributos aria-label/placeholder/title em modo EN ---');
  [...doc.querySelectorAll('[aria-label],[placeholder],[title],[alt]')].forEach(e=>{
    const a=e.getAttribute('aria-label')||'',p=e.getAttribute('placeholder')||'',ti=e.getAttribute('title')||'';
    if(a||p||ti) console.log('  ',e.tagName,e.id||e.className,'| aria:',a,'| ph:',p,'| title:',ti);
  });
  console.log('\n--- title/meta description (nunca mudam) ---');
  console.log('  title:',doc.title);
  console.log('  desc:',(doc.querySelector('meta[name=description]')||{}).content);
  console.log('  html lang:',doc.documentElement.lang);
},900);
