const EUA = [
  ["Boston, MA",        "America/New_York"],
  ["New York, NY",      "America/New_York"],
  ["Newark, NJ",        "America/New_York"],
  ["Bridgeport, CT",    "America/New_York"],
  ["Philadelphia, PA",  "America/New_York"],
  ["Washington, DC",    "America/New_York"],
  ["Miami, FL",         "America/New_York"],
  ["Orlando, FL",       "America/New_York"],
  ["Atlanta, GA",       "America/New_York"],
  ["Chicago, IL",       "America/Chicago"],
  ["Houston, TX",       "America/Chicago"],
  ["Dallas, TX",        "America/Chicago"],
  ["Nashville, TN",     "America/Chicago"],
  ["Denver, CO",        "America/Denver"],
  ["Phoenix, AZ",       "America/Phoenix"],
  ["Las Vegas, NV",     "America/Los_Angeles"],
  ["Los Angeles, CA",   "America/Los_Angeles"],
  ["San Francisco, CA", "America/Los_Angeles"],
  ["Seattle, WA",       "America/Los_Angeles"],
];
const TZ_BSB='America/Sao_Paulo';

// Estado -> fuso predominante. Os marcados em DUPLO são cortados por dois
// fusos: o mapa usa o mais populoso e a tela avisa que pode estar errado.
const UF={
  CT:'America/New_York',DE:'America/New_York',DC:'America/New_York',GA:'America/New_York',
  ME:'America/New_York',MD:'America/New_York',MA:'America/New_York',NH:'America/New_York',
  NJ:'America/New_York',NY:'America/New_York',NC:'America/New_York',OH:'America/New_York',
  PA:'America/New_York',RI:'America/New_York',SC:'America/New_York',VT:'America/New_York',
  VA:'America/New_York',WV:'America/New_York',
  FL:'America/New_York',MI:'America/New_York',IN:'America/New_York',KY:'America/New_York',
  AL:'America/Chicago',AR:'America/Chicago',IL:'America/Chicago',IA:'America/Chicago',
  LA:'America/Chicago',MN:'America/Chicago',MS:'America/Chicago',MO:'America/Chicago',
  OK:'America/Chicago',WI:'America/Chicago',
  TX:'America/Chicago',TN:'America/Chicago',KS:'America/Chicago',NE:'America/Chicago',
  ND:'America/Chicago',SD:'America/Chicago',
  CO:'America/Denver',MT:'America/Denver',NM:'America/Denver',UT:'America/Denver',
  WY:'America/Denver',ID:'America/Boise',
  AZ:'America/Phoenix',
  CA:'America/Los_Angeles',WA:'America/Los_Angeles',
  NV:'America/Los_Angeles',OR:'America/Los_Angeles',
  AK:'America/Anchorage',HI:'Pacific/Honolulu',
};
const UF_DUPLO=['FL','TX','TN','IN','KY','MI','KS','NE','ND','SD','OR','ID','NV','AZ'];
const UF_NOME={MA:'Massachusetts',NY:'New York',NJ:'New Jersey',CT:'Connecticut',FL:'Florida',
  GA:'Georgia',TX:'Texas',CA:'California',IL:'Illinois',PA:'Pennsylvania',AZ:'Arizona',
  NV:'Nevada',CO:'Colorado',WA:'Washington',TN:'Tennessee',NH:'New Hampshire',RI:'Rhode Island',
  MD:'Maryland',VA:'Virginia',NC:'North Carolina',OH:'Ohio',MI:'Michigan',UT:'Utah'};

// Tira a UF de um texto solto: "Boston, MA", "boston ma", "Marlborough - MA"
function ufDe(txt){
  const t=String(txt||'').toUpperCase();
  const m=t.match(/(?:^|[,\s\-\/])([A-Z]{2})(?:$|[,\s\-\.\/])/g);
  if(m) for(let i=m.length-1;i>=0;i--){
    const uf=m[i].replace(/[^A-Z]/g,''); if(UF[uf]) return uf;
  }
  for(const uf in UF_NOME) if(t.includes(UF_NOME[uf].toUpperCase())) return uf;
  return '';
}
// Fuso de um lead/cliente: override manual > estado > cidade
function fusoDe(reg){
  if(reg&&reg.fuso&&/^[A-Za-z]+\/[A-Za-z_]+$/.test(reg.fuso)) return {tz:reg.fuso,uf:'',manual:true};
  const uf=ufDe(reg&&reg.estado)||ufDe(reg&&reg.cidade)||ufDe(reg&&reg.observacoes);
  return uf?{tz:UF[uf],uf,manual:false}:{tz:'',uf:'',manual:false};
}

let relPraca='eua', relIdi='pt', relCidade=0;
try{
  relPraca=localStorage.getItem('leon_rel_praca')||'eua';
  relIdi=localStorage.getItem('leon_rel_idi')||'pt';
  relCidade=+(localStorage.getItem('leon_rel_cidade')||0)||0;
}catch(e){}
if(relPraca!=='eua'&&relPraca!=='bsb') relPraca='eua';
if(relIdi!=='pt'&&relIdi!=='en') relIdi='pt';
if(!EUA[relCidade]) relCidade=0;

const relLoc=()=>relIdi==='pt'?'pt-BR':'en-US';
const T2=(pt,en)=>relIdi==='pt'?pt:en;

function horaEm(tz,d){
  const p=new Intl.DateTimeFormat('en-US',{timeZone:tz,hour12:false,hour:'2-digit',minute:'2-digit'}).formatToParts(d);
  return {h:+p.find(x=>x.type==='hour').value%24, m:+p.find(x=>x.type==='minute').value};
}
const fmtHora=(tz,d,seg)=>new Intl.DateTimeFormat(relLoc(),{timeZone:tz,hour:'2-digit',
  minute:'2-digit',...(seg?{second:'2-digit'}:{}),hour12:relIdi==='en'}).format(d);
const fmtDia=(tz,d)=>new Intl.DateTimeFormat(relLoc(),{timeZone:tz,weekday:'long',day:'2-digit',month:'long'}).format(d);
function sigla(tz,d){
  try{ return new Intl.DateTimeFormat('en-US',{timeZone:tz,timeZoneName:'short'})
    .formatToParts(d).find(x=>x.type==='timeZoneName').value; }catch(e){ return ''; }
}
// diferença em horas de tz contra Brasília (positivo = Brasília na frente)
function difBsb(tz,d){
  const a=horaEm(tz,d), c=horaEm(TZ_BSB,d);
  let m=(c.h*60+c.m)-(a.h*60+a.m);
  if(m>720)m-=1440; if(m<-720)m+=1440;
  return m/60;
}
const sinalDif=v=>(v>=0?'+':'-')+Math.abs(v)+'h';



let ok=0,mal=0;
const t=(n,c,d='')=>{c?(ok++,console.log('  \x1b[32mv\x1b[0m '+n+(d?'  -> '+d:''))):(mal++,console.log('  \x1b[31mX\x1b[0m '+n+(d?'  -> '+d:'')))};
const d=new Date();
const hEm=(tz)=>+new Intl.DateTimeFormat('en-US',{timeZone:tz,hour12:false,hour:'2-digit'}).formatToParts(d).find(x=>x.type==='hour').value%24;

console.log('\n\x1b[1m=== PRACAS AMERICANAS ===\x1b[0m');
t('19 cidades',EUA.length===19,EUA.length+'');
t('fusos IANA validos',EUA.every(([n,tz])=>{try{new Intl.DateTimeFormat('en',{timeZone:tz});return true}catch(e){return false}}));
t('Boston/MA e o padrao',EUA[0][0]==='Boston, MA');
t('cobre 5 fusos continentais',[...new Set(EUA.map(x=>x[1]))].length===5);
t('Phoenix isolado (sem horario de verao)',EUA.find(x=>x[0].startsWith('Phoenix'))[1]==='America/Phoenix');

console.log('\n\x1b[1m=== MAPA ESTADO -> FUSO ===\x1b[0m');
t('50 estados + DC',Object.keys(UF).length===51,Object.keys(UF).length+' entradas');
t('todos validos',Object.values(UF).every(tz=>{try{new Intl.DateTimeFormat('en',{timeZone:tz});return true}catch(e){return false}}));
[['MA','America/New_York'],['FL','America/New_York'],['TX','America/Chicago'],['CA','America/Los_Angeles'],
 ['AZ','America/Phoenix'],['CO','America/Denver'],['NJ','America/New_York'],['IL','America/Chicago'],
 ['NV','America/Los_Angeles'],['HI','Pacific/Honolulu']].forEach(([uf,tz])=>t(uf+' -> '+tz.split('/')[1],UF[uf]===tz,UF[uf]));

console.log('\n\x1b[1m=== LER SIGLA DE TEXTO SOLTO ===\x1b[0m');
[['Boston, MA','MA'],['boston ma','MA'],['Marlborough - MA','MA'],['Miami, FL','FL'],['Orlando FL','FL'],
 ['Massachusetts','MA'],['Los Angeles, CA','CA'],['Framingham, MA, USA','MA'],['',''],['Sao Paulo','']]
 .forEach(([txt,esp])=>t(JSON.stringify(txt)+' -> '+(esp||'(nada)'),ufDe(txt)===esp,ufDe(txt)||'(nada)'));

console.log('\n\x1b[1m=== FUSO DE UM REGISTRO ===\x1b[0m');
t('estado manda',fusoDe({estado:'MA'}).tz==='America/New_York');
t('cidade com sigla resolve',fusoDe({cidade:'Miami, FL'}).tz==='America/New_York');
t('observacoes como ultimo recurso',fusoDe({observacoes:'Onde atende: Denver, CO'}).tz==='America/Denver');
t('override manual vence',fusoDe({estado:'MA',fuso:'America/Los_Angeles'}).tz==='America/Los_Angeles');
t('override com lixo ignorado',fusoDe({estado:'MA',fuso:'nao-e-fuso'}).tz==='America/New_York');
t('sem dado nenhum devolve vazio',fusoDe({}).tz==='');
t('estados divididos marcados',UF_DUPLO.includes('FL')&&UF_DUPLO.includes('TX')&&UF_DUPLO.includes('TN'));

console.log('\n\x1b[1m=== DIFERENCA CONTRA BRASILIA ===\x1b[0m');
[['America/New_York','Boston'],['America/Chicago','Chicago'],['America/Denver','Denver'],
 ['America/Phoenix','Phoenix'],['America/Los_Angeles','Los Angeles']].forEach(([tz,rot])=>{
  const v=difBsb(tz,d);
  t(rot+': Brasilia '+sinalDif(v),v>0&&v<=8,'local '+hEm(tz)+'h vs BSB '+hEm('America/Sao_Paulo')+'h');});
t('LA mais atrasado que Boston',difBsb('America/Los_Angeles',d)>difBsb('America/New_York',d));
t('janeiro: Boston +2h (fim do horario de verao)',difBsb('America/New_York',new Date(Date.UTC(2027,0,15,15,0)))===2);

console.log('\n\x1b[1m=== JANELA DE LIGACAO POR FUSO ===\x1b[0m');
const bom=(tz,m)=>{const h=horaEm(tz,m).h;return h>=8&&h<21};
const hh=(tz,m)=>String(horaEm(tz,m).h).padStart(2,'0')+':'+String(horaEm(tz,m).m).padStart(2,'0');
// 15:30 UTC = 11:30 Boston, 08:30 LA, 08:30 Phoenix: todos liberados
const m1=new Date(Date.UTC(2026,8,7,15,30));
t('Boston '+hh('America/New_York',m1)+': pode ligar',bom('America/New_York',m1));
t('Los Angeles '+hh('America/Los_Angeles',m1)+': pode ligar',bom('America/Los_Angeles',m1));
t('Phoenix '+hh('America/Phoenix',m1)+': pode ligar',bom('America/Phoenix',m1));
// 13:30 UTC = 09:30 Boston (ok), 06:30 LA e Phoenix (cedo demais)
const m2=new Date(Date.UTC(2026,8,7,13,30));
t('Boston '+hh('America/New_York',m2)+': pode ligar',bom('America/New_York',m2));
t('Los Angeles '+hh('America/Los_Angeles',m2)+': NAO ligar',!bom('America/Los_Angeles',m2));
t('Phoenix '+hh('America/Phoenix',m2)+': NAO ligar',!bom('America/Phoenix',m2));
// 03:00 UTC = 23:00 Boston: tarde demais nos dois
const m3=new Date(Date.UTC(2026,8,8,3,0));
t('Boston '+hh('America/New_York',m3)+': NAO ligar',!bom('America/New_York',m3));

console.log('\n'+(mal?'\x1b[31m':'\x1b[32m')+'\x1b[1m'+ok+' passaram, '+mal+' falharam\x1b[0m');
process.exit(mal?1:0);

