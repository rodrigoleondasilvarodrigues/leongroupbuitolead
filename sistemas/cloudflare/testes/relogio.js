// Mesma lógica do relógio do admin, isolada para conferir os dois fusos.
const PRACAS={
  ma: {tz:'America/New_York',  pt:'Massachusetts', en:'Massachusetts', paisPt:'Estados Unidos', paisEn:'United States'},
  bsb:{tz:'America/Sao_Paulo', pt:'Brasília',      en:'Brasilia',      paisPt:'Brasil',         paisEn:'Brazil'},
};
function horaEm(tz,d){
  const p=new Intl.DateTimeFormat('en-US',{timeZone:tz,hour12:false,hour:'2-digit',minute:'2-digit'}).formatToParts(d);
  return {h:+p.find(x=>x.type==='hour').value%24, m:+p.find(x=>x.type==='minute').value};
}
function render(d,relIdi){
  const loc=relIdi==='pt'?'pt-BR':'en-US';
  const out={};
  for(const k of ['ma','bsb']){
    const P=PRACAS[k];
    out[k]={
      cidade:P[relIdi]+' · '+P[relIdi==='pt'?'paisPt':'paisEn'],
      hora:new Intl.DateTimeFormat(loc,{timeZone:P.tz,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:relIdi==='en'}).format(d),
      dia:new Intl.DateTimeFormat(loc,{timeZone:P.tz,weekday:'long',day:'2-digit',month:'long'}).format(d),
      sig:new Intl.DateTimeFormat('en-US',{timeZone:P.tz,timeZoneName:'short'}).formatToParts(d).find(x=>x.type==='timeZoneName').value,
    };
  }
  const ny=horaEm(PRACAS.ma.tz,d), aberta=ny.h>=8&&ny.h<21;
  const faltam=aberta?(21-ny.h-1)*60+(60-ny.m):((ny.h<8?8-ny.h:32-ny.h)*60-ny.m);
  const a=horaEm(PRACAS.ma.tz,d), c=horaEm(PRACAS.bsb.tz,d);
  let dif=(c.h*60+c.m)-(a.h*60+a.m); if(dif>720)dif-=1440; if(dif<-720)dif+=1440;
  out.janela={aberta,faltam,txt:Math.floor(faltam/60)+'h'+String(faltam%60).padStart(2,'0')};
  out.dif=(dif>=0?'+':'-')+Math.abs(dif)/60+'h';
  return out;
}
let ok=0,mal=0;
const t=(n,c,d='')=>{c?(ok++,console.log('  \x1b[32m✓\x1b[0m '+n+(d?'  → '+d:''))):(mal++,console.log('  \x1b[31m✗\x1b[0m '+n+(d?'  → '+d:'')))};

console.log('\n\x1b[1m═══ AGORA ═══\x1b[0m');
const agora=new Date(); const A=render(agora,'pt'), Aen=render(agora,'en');
console.log('  MA  :',A.ma.hora,'·',A.ma.dia,'·',A.ma.sig);
console.log('  BSB :',A.bsb.hora,'·',A.bsb.dia,'·',A.bsb.sig);
console.log('  EN  :',Aen.ma.hora,'/',Aen.bsb.hora,'·',Aen.ma.dia);
console.log('  janela:',A.janela.aberta?'ABERTA':'FECHADA','· vira em',A.janela.txt,'· dif',A.dif);

console.log('\n\x1b[1m═══ FUSOS ═══\x1b[0m');
t('Massachusetts usa America/New_York',PRACAS.ma.tz==='America/New_York');
t('Brasília usa America/Sao_Paulo',PRACAS.bsb.tz==='America/Sao_Paulo');
t('sigla do fuso aparece',/^[A-Z]{2,5}$/.test(A.ma.sig)&&/^(GMT|BR|-)/.test(A.bsb.sig)||A.bsb.sig.length>1,A.ma.sig+' / '+A.bsb.sig);
t('PT usa 24h (sem AM/PM)',!/[AP]M/i.test(A.ma.hora),A.ma.hora);
t('EN usa 12h (com AM/PM)',/[AP]M/i.test(Aen.ma.hora),Aen.ma.hora);
t('dia da semana em português',/^(segunda|terça|quarta|quinta|sexta|sábado|domingo)/i.test(A.ma.dia),A.ma.dia);
t('dia da semana em inglês',/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(Aen.ma.dia),Aen.ma.dia);

console.log('\n\x1b[1m═══ JANELA DE CONTATO (regra do motor: 8h-21h em NY) ═══\x1b[0m');
// 2026-09-07 é uma segunda-feira. Testando horas específicas em NY.
const emNY=(hUTC)=>new Date(Date.UTC(2026,8,7,hUTC,30,0));
const casos=[[11,true,'07:30 NY'],[12,true,'08:30 NY'],[16,true,'12:30 NY'],[0,true,'20:30 NY'],[1,true,'21:30 NY'],[6,true,'02:30 NY']];
[[12,'08:30',true],[13,'09:30',true],[0,'20:30',true],[1,'21:30',false],[5,'01:30',false],[11,'07:30',false],[23,'19:30',true]]
  .forEach(([utc,rot,esperado])=>{
    const d=new Date(Date.UTC(2026,8,7,utc,30,0));
    const r=render(d,'pt');
    const real=horaEm('America/New_York',d);
    t(`${String(real.h).padStart(2,'0')}:30 em NY → janela ${esperado?'ABERTA':'fechada'}`,r.janela.aberta===esperado,
      (r.janela.aberta?'aberta':'fechada')+', vira em '+r.janela.txt);
  });

console.log('\n\x1b[1m═══ DIFERENÇA ENTRE AS PRAÇAS ═══\x1b[0m');
// set/2026: NY em EDT (UTC-4), São Paulo sem horário de verão (UTC-3) → +1h
t('setembro: Brasília +1h',render(new Date(Date.UTC(2026,8,7,15,0)),'pt').dif==='+1h',render(new Date(Date.UTC(2026,8,7,15,0)),'pt').dif);
// jan/2027: NY em EST (UTC-5), São Paulo UTC-3 → +2h
t('janeiro: Brasília +2h',render(new Date(Date.UTC(2027,0,15,15,0)),'pt').dif==='+2h',render(new Date(Date.UTC(2027,0,15,15,0)),'pt').dif);

console.log('\n'+(mal?'\x1b[31m':'\x1b[32m')+'\x1b[1m'+ok+' passaram, '+mal+' falharam\x1b[0m');
process.exit(mal?1:0);
