/* Gera o SQL dos LEADS de teste do CRM comercial.
 *
 * Um lead em cada uma das 16 etapas dos 4 pipelines. Os CLIENTES do
 * operacional vivem no semear-operacional.mjs, que é o par deste: um script
 * por CRM, para um não sobrescrever o outro.
 *
 * Uso, de dentro de sistemas/cloudflare:
 *
 *   node semear-comercial.mjs > /tmp/semear.sql
 *   npx wrangler d1 execute leon-group --local  --file=/tmp/semear.sql   # testar
 *   npx wrangler d1 execute leon-group --remote --file=/tmp/semear.sql   # produção
 *
 * Apagar antes, se quiser começar limpo (isto APAGA dados de verdade):
 *
 *   npx wrangler d1 execute leon-group --remote --command "DELETE FROM ativacoes;
 *     DELETE FROM leads;"
 *
 * A decisão que importa:
 *
 * `entrou_coluna_em` é SEMPRE agora. O motor de automação roda de 15 em 15
 *    minutos e move lead parado há mais de 24h na régua de temperatura, e
 *    lead em no_show depois de N horas. Com a data de entrada recente, os 16
 *    ficam onde foram postos e a distribuição sobrevive para ser vista.
 *    `criado_em` é escalonado, então os cards mostram idades diferentes sem
 *    disparar movimento.
 *
 * Telefones na faixa 555-01XX, reservada para ficção, então nenhum número cai
 * em pessoa real. Origem começa com TESTE para dar para distinguir depois, e as
 * observações dizem o mesmo em texto.
 */

const AGORA = new Date();
const iso = (d) => d.toISOString();
const diasAtras = (n) => iso(new Date(AGORA.getTime() - n * 864e5));
const horasAtras = (n) => iso(new Date(AGORA.getTime() - n * 36e5));
const diasAFrente = (n) => iso(new Date(AGORA.getTime() + n * 864e5));
const N = iso(AGORA);
const q = (v) => (v === null || v === undefined ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);

/* ─────────────── comercial: 16 etapas ─────────────── */
const LEADS = [
  // pipeline leads_novos, a régua de temperatura
  {p:"leads_novos", c:"responderam",  n:"Jailson Moreira",  e:"Moreira Flooring",        t:"12135550101", ni:"Flooring",   cid:"Van Nuys, CA",    idade:1,  resp:2},
  {p:"leads_novos", c:"super_hot",    n:"Cleiton Barbosa",  e:"Barbosa Remodeling",      t:"16175550102", ni:"Remodeling", cid:"Everett, MA",     idade:1,  resp:3},
  {p:"leads_novos", c:"hot",          n:"Wanderson Lima",   e:"Lima Painting",           t:"16265550103", ni:"Painting",   cid:"Pasadena, CA",    idade:2},
  {p:"leads_novos", c:"warm",         n:"Fabiano Ruiz",     e:"Ruiz Cabinets",           t:"15085550104", ni:"Cabinets",   cid:"Framingham, MA",  idade:3},
  {p:"leads_novos", c:"cold",         n:"Adilson Faria",    e:"Faria Roofing",           t:"15625550105", ni:"Roofing",    cid:"Long Beach, CA",  idade:5},
  {p:"leads_novos", c:"super_cold",   n:"Gerson Pontes",    e:"Pontes Gutters",          t:"17815550106", ni:"Gutters",    cid:"Malden, MA",      idade:7},

  // pipeline agendamento, da call marcada ao desfecho
  {p:"agendamento", c:"call_agendado",n:"Marcelo Tavares",  e:"Tavares Hardwood",        t:"18185550107", ni:"Flooring",   cid:"Burbank, CA",     idade:2,  call:1},
  {p:"agendamento", c:"call_rolando", n:"Élcio Nogueira",   e:"Nogueira Construction",   t:"17815550108", ni:"Remodeling", cid:"Medford, MA",     idade:2,  call:0},
  {p:"agendamento", c:"no_show",      n:"Robson Amaral",    e:"Amaral HVAC",             t:"18185550109", ni:"HVAC",       cid:"Glendale, CA",    idade:3,  call:-1},
  {p:"agendamento", c:"no_show_f1",   n:"Valdir Sampaio",   e:"Sampaio Tile & Stone",    t:"17815550110", ni:"Flooring",   cid:"Revere, MA",      idade:4,  call:-2},
  {p:"agendamento", c:"no_show_f2",   n:"Nilson Prado",     e:"Prado Carpentry",         t:"13105550111", ni:"Carpentry",  cid:"Torrance, CA",    idade:5,  call:-3},
  {p:"agendamento", c:"no_show_f3",   n:"Edinaldo Rocha",   e:"Rocha Framing",           t:"16175550112", ni:"Framing",    cid:"Quincy, MA",      idade:7,  call:-5},
  {p:"agendamento", c:"fechou",       n:"Sidnei Caldeira",  e:"Caldeira Remodeling",     t:"13235550113", ni:"Remodeling", cid:"Inglewood, CA",   idade:9,  call:-4, fechou:true},
  {p:"agendamento", c:"recusou",      n:"Aparecido Menezes",e:"Menezes Painting",        t:"16175550114", ni:"Painting",   cid:"Somerville, MA",  idade:11, call:-6, recusa:"Achou caro e disse que vai tentar sozinho por mais três meses."},

  // pipelines de retomada
  {p:"recuperacao", c:"recuperacao",  n:"Joelson Ferraz",   e:"Ferraz Gutter Guard",     t:"19095550115", ni:"Gutters",    cid:"Pomona, CA",      idade:16},
  {p:"nutricao",    c:"nutricao",     n:"Ivanildo Serra",   e:"Serra Custom Cabinets",   t:"17815550116", ni:"Cabinets",   cid:"Waltham, MA",     idade:22},
];

const sql = [];
sql.push("-- registros de teste do CRM, gerados em " + N);

LEADS.forEach((l, i) => {
  const criado = diasAtras(l.idade);
  const bant = l.p === "agendamento" || l.c === "responderam" || l.c === "super_hot";
  sql.push(`INSERT INTO leads (nome,telefone,email,empresa,nicho,faturamento_mensal,origem,
  pipeline,coluna,criado_em,entrou_coluna_em,ultima_resposta_em,atualizado_em,
  rapport,budget,authority,need,timeline,qualificado,call_agendada_para,motivo_recusa,observacoes,
  tipo_contrato,valor_contrato,duracao_meses,arquivado)
VALUES (${q(l.n)},${q(l.t)},${q(l.e.toLowerCase().replace(/[^a-z]/g,"")+"@exemplo-teste.com")},${q(l.e)},${q(l.ni)},
  ${q(i % 3 === 0 ? "US$ 10-20k/mês" : i % 3 === 1 ? "US$ 30-60k/mês" : "US$ 20-30k/mês")},
  ${q("TESTE:" + l.p)},${q(l.p)},${q(l.c)},${q(criado)},${q(N)},
  ${q(l.resp ? horasAtras(l.resp) : null)},${q(N)},
  ${q(bant ? "Falou do filho que joga futebol na escola" : null)},
  ${q(bant ? "Tem reserva, aceita parcelar" : null)},
  ${q(bant ? "Decide sozinho" : null)},
  ${q(bant ? "Depende de indicação e quer cliente próprio" : null)},
  ${q(bant ? "Quer começar este mês" : null)},
  ${bant ? 1 : 0},
  ${q(l.call !== undefined ? (l.call >= 0 ? diasAFrente(l.call) : diasAtras(-l.call)) : null)},
  ${q(l.recusa || null)},
  ${q("REGISTRO DE TESTE. " + l.cid + ". Criado para exercitar a etapa " + l.c + ".")},
  ${q(l.fechou ? "TCV" : null)},${q(l.fechou ? "2500" : null)},${l.fechou ? 3 : "NULL"},0);`);
});

console.log(sql.join("\n"));
