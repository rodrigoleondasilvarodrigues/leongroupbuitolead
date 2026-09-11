/* Gera o SQL dos registros de teste do CRM.
 *
 * Uso, de dentro de sistemas/cloudflare:
 *
 *   node semear-etapas.mjs > /tmp/semear.sql
 *   npx wrangler d1 execute leon-group --local  --file=/tmp/semear.sql   # testar
 *   npx wrangler d1 execute leon-group --remote --file=/tmp/semear.sql   # produção
 *
 * Apagar antes, se quiser começar limpo (isto APAGA dados de verdade):
 *
 *   npx wrangler d1 execute leon-group --remote --command "DELETE FROM ativacoes;
 *     DELETE FROM reviews; DELETE FROM posts; DELETE FROM marcos; DELETE FROM checklist;
 *     DELETE FROM entregaveis; DELETE FROM midias; DELETE FROM arquivos;
 *     DELETE FROM entradas; DELETE FROM clientes; DELETE FROM leads;"
 *
 * ⚠ Apagar linha de mídia NÃO apaga o arquivo no R2. Os blobs ficam órfãos,
 *   que é a dívida técnica 2 do PENDENCIAS.md.
 *
 * Os INSERTs são individuais de propósito: com UNION ALL o statement do
 * checklist estoura o limite do D1 (SQLITE_TOOBIG), porque o passo a passo de
 * cada item é texto longo.
 *
 * Comercial: um lead em cada uma das 16 etapas dos 4 pipelines.
 * Operacional: um cliente em cada estágio da entrega, do cadastro ao atrasado.
 *
 * Duas decisões que importam:
 *
 * 1. `entrou_coluna_em` é SEMPRE agora. O motor de automação roda de 15 em 15
 *    minutos e move lead parado há mais de 24h na régua de temperatura, e
 *    lead em no_show depois de N horas. Com a data de entrada recente, os 16
 *    ficam onde foram postos e a distribuição sobrevive para ser vista.
 *    `criado_em` é escalonado, então os cards mostram idades diferentes sem
 *    disparar movimento.
 *
 * 2. Telefones na faixa 555-01XX, reservada para ficção, então nenhum número
 *    cai em pessoa real. Origem começa com TESTE para dar para distinguir
 *    depois, e as observações dizem o mesmo em texto.
 */
import { CADENCIA, CHECKLIST, ENTREGAVEIS } from "./src/geradores.js";

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

/* ─────────────── operacional: 8 estágios ─────────────── */
const CLIENTES = [
  {slug:"teste-01-aguardando-contrato", emp:"Moreira Flooring LLC",      dono:"Jailson Moreira",  cid:"Van Nuys",   uf:"CA", tel:"12135550101", ni:"Flooring",
   estagio:"Cadastrado, aguardando o contrato ser assinado", contrato:0, pago:0, form:null, inicio:null, feitos:0},
  {slug:"teste-02-contrato-assinado",   emp:"Barbosa Remodeling Inc",    dono:"Cleiton Barbosa",  cid:"Everett",    uf:"MA", tel:"16175550102", ni:"Remodeling",
   estagio:"Contrato assinado, aguardando o pagamento", contrato:1, pago:0, form:null, inicio:null, feitos:0},
  {slug:"teste-03-formulario-liberado", emp:"Lima Painting Co",          dono:"Wanderson Lima",   cid:"Pasadena",   uf:"CA", tel:"16265550103", ni:"Painting",
   estagio:"Pago e formulário liberado, esperando o cliente responder", contrato:1, pago:1, form:null, inicio:null, feitos:0},
  {slug:"teste-04-dia-1",               emp:"Ruiz Cabinets LLC",         dono:"Fabiano Ruiz",     cid:"Framingham", uf:"MA", tel:"15085550104", ni:"Cabinets",
   estagio:"Formulário respondido, primeiro dia útil da entrega", contrato:1, pago:1, form:0, inicio:0, feitos:1},
  {slug:"teste-05-dia-3",               emp:"Faria Roofing Inc",         dono:"Adilson Faria",    cid:"Long Beach", uf:"CA", tel:"15625550105", ni:"Roofing",
   estagio:"No meio da entrega, terceiro dia útil", contrato:1, pago:1, form:3, inicio:3, feitos:5},
  {slug:"teste-06-dia-5",               emp:"Tavares Hardwood LLC",      dono:"Marcelo Tavares",  cid:"Burbank",    uf:"CA", tel:"18185550107", ni:"Flooring",
   estagio:"Último dia do prazo, entrega quase fechada", contrato:1, pago:1, form:6, inicio:6, feitos:9},
  {slug:"teste-07-atrasado",            emp:"Amaral HVAC Services",      dono:"Robson Amaral",    cid:"Glendale",   uf:"CA", tel:"18185550109", ni:"HVAC",
   estagio:"ATRASADO: passou dos 5 dias úteis e a entrega não fechou", contrato:1, pago:1, form:12, inicio:12, feitos:6},
  {slug:"teste-08-concluido",           emp:"Caldeira Remodeling Inc",   dono:"Sidnei Caldeira",  cid:"Inglewood",  uf:"CA", tel:"13235550113", ni:"Remodeling",
   estagio:"Entrega concluída, contrato correndo", contrato:1, pago:1, form:20, inicio:20, feitos:11, concluido:14},
];

CLIENTES.forEach((c) => {
  sql.push(`INSERT INTO clientes (slug,nome_contato,empresa,nicho,data_entrada,email,telefone,
  plano,valor_pago,nome_dono,cidade,estado,servicos,diferencial,observacoes,localizacoes,
  formulario_token,formulario_em,contrato_assinado,contrato_em,pagamento_confirmado,pagamento_em,
  entrega_iniciada_em,entrega_concluida_em,tipo_contrato,valor_contrato,duracao_meses,
  renovacao_em,criado_em,atualizado_em)
VALUES (${q(c.slug)},${q(c.dono)},${q(c.emp)},${q(c.ni)},${q(diasAtras(c.form === null ? 2 : c.form + 2))},
  ${q(c.slug + "@exemplo-teste.com")},${q(c.tel)},${q("Plano único")},${q("US$ 2.500")},
  ${q(c.dono)},${q(c.cid)},${q(c.uf)},
  ${q(c.ni === "Flooring" ? "hardwood flooring, staircase refinishing, vinyl installation"
    : c.ni === "Remodeling" ? "kitchen remodeling, bathroom remodeling, interior renovation"
    : c.ni === "Painting" ? "interior painting, exterior painting, cabinet refinishing"
    : c.ni === "Cabinets" ? "custom cabinets, cabinet installation, countertops"
    : c.ni === "Roofing" ? "roof replacement, roof repair, gutter installation"
    : "HVAC installation, HVAC repair, duct cleaning")},
  ${q("REGISTRO DE TESTE, não é cliente real.")},
  ${q("REGISTRO DE TESTE. Estágio: " + c.estagio)},
  ${q(c.uf === "CA" ? "Greater Los Angeles" : "Greater Boston")},
  ${q("tok-teste-" + c.slug.slice(6, 8))},
  ${q(c.form === null ? null : diasAtras(c.form))},
  ${c.contrato},${q(c.contrato ? diasAtras((c.form === null ? 2 : c.form) + 1) : null)},
  ${c.pago},${q(c.pago ? diasAtras((c.form === null ? 2 : c.form) + 1) : null)},
  ${q(c.inicio === null ? null : diasAtras(c.inicio))},
  ${q(c.concluido ? diasAtras(c.inicio - c.concluido > 0 ? c.inicio - c.concluido : 1) : null)},
  ${q("TCV")},${q("2500")},3,
  ${q(diasAFrente(90 - (c.inicio || 0)))},${q(N)},${q(N)});`);

  // marcos, checklist e entregáveis nascem com o cliente, como na criação real
  CADENCIA.forEach((m, i) => {
    const feito = i < c.feitos;
    sql.push(`INSERT INTO marcos (cliente_id,marco,prazo_dias,concluido,concluido_em,criado_em) VALUES (` +
      `(SELECT id FROM clientes WHERE slug=${q(c.slug)}),${q(m.marco + " [" + m.quem + "]")},${m.dia},` +
      `${feito ? 1 : 0},${q(feito ? N : null)},${q(N)});`);
  });

  CHECKLIST.forEach(([area, item, obr, det], j) => {
    sql.push(`INSERT INTO checklist (cliente_id,area,item,detalhe,obrigatorio,ordem,feito,criado_em) VALUES (` +
      `(SELECT id FROM clientes WHERE slug=${q(c.slug)}),${q(area)},${q(item)},${q(det)},${obr},${j},` +
      `${c.feitos >= 11 ? 1 : 0},${q(N)});`);
  });

  ENTREGAVEIS.forEach(([tipo]) => {
    sql.push(`INSERT INTO entregaveis (cliente_id,tipo,atualizado_em) VALUES (` +
      `(SELECT id FROM clientes WHERE slug=${q(c.slug)}),${q(tipo)},${q(N)});`);
  });
});

/* uma entrada de dinheiro por cliente que já pagou, para o caixa ter o que mostrar */
CLIENTES.filter((c) => c.pago).forEach((c) => {
  sql.push(`INSERT INTO entradas (cliente_id,valor,moeda,cotacao,recebido_em,meio,parcela,nota,criado_em) VALUES (` +
    `(SELECT id FROM clientes WHERE slug=${q(c.slug)}),'2500','USD','5.4',` +
    `${q(diasAtras((c.form === null ? 2 : c.form) + 1))},'Wise','pagamento único','REGISTRO DE TESTE',${q(N)});`);
});

console.log(sql.join("\n"));
