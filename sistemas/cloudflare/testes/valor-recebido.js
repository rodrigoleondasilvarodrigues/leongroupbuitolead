// A regra do dinheiro, isolada exatamente como está na rota.
function regra(atual, ligando){
  const campos=[], vals=[];
  campos.push('pagamento_confirmado=?','pagamento_em=?');
  vals.push(ligando?1:0, ligando?'agora':null);
  if(ligando){ if(!atual.valor_pago && atual.valor_contrato){campos.push('valor_pago=?');vals.push(atual.valor_contrato);} }
  else { campos.push('valor_pago=?'); vals.push(null); }
  const i=campos.indexOf('valor_pago=?');
  return i<0 ? atual.valor_pago : vals[i];
}
let ok=0,mal=0;
const t=(n,c,d='')=>{c?(ok++,console.log('  \x1b[32mv\x1b[0m '+n+(d?'  -> '+d:''))):(mal++,console.log('  \x1b[31mX\x1b[0m '+n+(d?'  -> '+d:'')))};

console.log('\n\x1b[1m=== O DINHEIRO SÓ CONTA COM PAGAMENTO CONFIRMADO ===\x1b[0m');
t('cliente novo, sem pagamento: recebido vazio',
  regra({valor_contrato:'6900',valor_pago:null},false)===null,'null');
t('ligando a chave: recebido nasce do contratado',
  regra({valor_contrato:'6900',valor_pago:null},true)==='6900','6900');
t('ligando com valor já digitado à mão: respeita o que estava lá',
  regra({valor_contrato:'6900',valor_pago:'3450'},true)==='3450','3450 (metade, entrada)');
t('desligando a chave: zera o recebido',
  regra({valor_contrato:'6900',valor_pago:'6900'},false)===null,'null');
t('sem contrato preenchido, ligando: não inventa valor',
  regra({valor_contrato:null,valor_pago:null},true)===null,'null');
t('MRR: recebido nasce da mensalidade, não do total',
  regra({valor_contrato:'1500',valor_pago:null},true)==='1500','1500');

console.log('\n\x1b[1m=== O QUE A TELA MOSTRA ===\x1b[0m');
const tela=c=>c.pagamento_confirmado&&c.valor_pago ? c.valor_pago+' recebido'
  : c.valor_contrato ? c.valor_contrato+' a receber' : '';
t('fechou mas não pagou', tela({valor_contrato:'6900',valor_pago:null,pagamento_confirmado:0})==='6900 a receber','6900 a receber');
t('pagou', tela({valor_contrato:'6900',valor_pago:'6900',pagamento_confirmado:1})==='6900 recebido','6900 recebido');
t('pagou parcial', tela({valor_contrato:'6900',valor_pago:'3450',pagamento_confirmado:1})==='3450 recebido','3450 recebido');
t('sem contrato nenhum', tela({valor_contrato:null,valor_pago:null,pagamento_confirmado:0})==='','vazio');

console.log('\n'+(mal?'\x1b[31m':'\x1b[32m')+'\x1b[1m'+ok+' passaram, '+mal+' falharam\x1b[0m');
process.exit(mal?1:0);
