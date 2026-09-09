/* Funil, dinheiro e diagnóstico.
   O que este teste existe para impedir:

   1. "US$ 2.500" somar como 2,5 em vez de 2500. O campo é texto digitado à
      mão, e adivinhar errado o separador decimal troca a ordem de grandeza
      do faturamento.
   2. Somar US$ com R$ no mesmo total, que daria um número que não existe.
   3. Diagnosticar gargalo em cima de 2 leads, que é chute com cara de dado.
   4. Contar como recebido dinheiro que não entrou.

   Rode com: node testes/funil-e-financeiro.js                            */
import { parseDinheiro, financeiroDoCliente, financeiroTotal, cotacaoValida,
         valorDoContrato, rotuloCategoria, CATEGORIAS_SAIDA,
         diagnostico, AMOSTRA_MINIMA } from "../src/funil.js";

let ok = 0, mal = 0;
const t = (rot, cond, det = "") => {
  if (cond) { ok++; console.log(`  \x1b[32mv\x1b[0m ${rot}${det ? "  -> " + det : ""}`); }
  else { mal++; console.log(`  \x1b[31mX\x1b[0m ${rot}${det ? "  -> " + det : ""}`); }
};

console.log("\n\x1b[1m=== 1. LER O VALOR QUE FOI DIGITADO À MÃO ===\x1b[0m");
const v = (s) => { const r = parseDinheiro(s); return r ? r.valor : null; };
t("US$ 2.500 é dois mil e quinhentos, não dois e meio", v("US$ 2.500") === 2500, String(v("US$ 2.500")));
t("2,500.00 no padrão americano", v("2,500.00") === 2500, String(v("2,500.00")));
t("R$ 1.234,56 no padrão brasileiro", v("R$ 1.234,56") === 1234.56, String(v("R$ 1.234,56")));
t("1.234.567 com milhar repetido", v("1.234.567") === 1234567, String(v("1.234.567")));
t("2.50 com duas casas é decimal", v("2.50") === 2.5, String(v("2.50")));
t("número puro passa direto", v("1500") === 1500, String(v("1500")));
t("campo vazio não vira zero", parseDinheiro("") === null && parseDinheiro(null) === null);
t("texto sem número não vira zero", parseDinheiro("a combinar") === null);
t("moeda reconhecida: US$", parseDinheiro("US$ 900").moeda === "USD");
t("moeda reconhecida: R$", parseDinheiro("R$ 900").moeda === "BRL");
t("sem símbolo, moeda fica em branco", parseDinheiro("900").moeda === null);

console.log("\n\x1b[1m=== 2. O QUE ENTROU VEM DAS ENTRADAS ===\x1b[0m");
const cli = (extra = {}) => ({ id: 1, empresa: "A", data_entrada: "2026-01-10",
  tipo_contrato: "TCV", valor_contrato: "US$ 2.500", ...extra });
const ent = (o) => ({ cliente_id: 1, ...o });
const REF = { valor: "5.40" };

const nada = financeiroTotal([cli()], [], REF);
t("sem entrada, nada entrou", nada.entrou.usd === 0 && nada.n_entradas === 0);
t("mas o contratado aparece", nada.contratado.usd === 2500, String(nada.contratado.usd));
t("e o a receber é o contrato inteiro", Math.round(nada.a_receber.usd) === 2500,
  String(Math.round(nada.a_receber.usd)));
t("lucro por cliente fica nulo, não zero", nada.lucro_por_cliente === null);

const marcado = financeiroTotal(
  [cli({ pagamento_confirmado: 1, valor_pago: null })], [], REF);
t("pagamento marcado sem entrada lançada é sinalizado",
  /nenhuma entrada registrada/.test(marcado.por_cliente[0].pendente),
  marcado.por_cliente[0].pendente);
t("e esse dinheiro NÃO entra em nenhum total", marcado.entrou.usd === 0);

console.log("\n\x1b[1m=== 3. DÓLAR E REAL AO MESMO TEMPO ===\x1b[0m");
const umaUSD = financeiroTotal([cli()],
  [ent({ id: 1, valor: "2500", moeda: "USD", cotacao: "5.20", recebido_em: "2026-03-14" })], REF);
t("entrou em dólar", umaUSD.entrou.usd === 2500, String(umaUSD.entrou.usd));
t("convertido pela cotação DA ENTRADA (5,20), não pela de referência (5,40)",
  umaUSD.entrou.brl === 13000, String(umaUSD.entrou.brl));
t("registrado como nativo em dólar", umaUSD.entrou.nativo_usd === 2500);
t("nada estimado, porque a cotação estava lá", umaUSD.entrou.estimado_brl === 0);
t("0% do total em real é estimativa", umaUSD.entrou.pct_estimado_brl === 0);

const semCot = financeiroTotal([cli()],
  [ent({ id: 1, valor: "2500", moeda: "USD", cotacao: null, recebido_em: "2026-03-14" })], REF);
t("sem cotação na entrada, usa a de referência", semCot.entrou.brl === 13500,
  String(semCot.entrou.brl));
t("e marca o valor como estimado", semCot.entrou.estimado_brl === 13500);
t("dizendo que 100% do real é estimativa", semCot.entrou.pct_estimado_brl === 100,
  semCot.entrou.pct_estimado_brl + "%");
t("com aviso na tela", semCot.avisos.some((a) => /cotação de referência/.test(a)));

const emBRL = financeiroTotal([cli({ valor_contrato: "R$ 12.000" })],
  [ent({ id: 1, valor: "6000", moeda: "BRL", cotacao: "5.00", recebido_em: "2026-03-14" })], REF);
t("entrada em real fica exata em real", emBRL.entrou.brl === 6000, String(emBRL.entrou.brl));
t("e vira dólar pela cotação da entrada", emBRL.entrou.usd === 1200, String(emBRL.entrou.usd));
t("registrada como nativa em real", emBRL.entrou.nativo_brl === 6000);

console.log("\n\x1b[1m=== 4. O PASSADO NÃO MUDA QUANDO O DÓLAR MEXE ===\x1b[0m");
/* O ponto central do desenho. Uma entrada com cotação registrada tem que dar
   o MESMO valor em real hoje, amanhã e no ano que vem. Faturamento que muda
   sozinho quando a cotação mexe não é faturamento. */
const entradaFixa = [ent({ id: 1, valor: "2500", moeda: "USD", cotacao: "5.20",
                           recebido_em: "2026-03-14" })];
const hoje = financeiroTotal([cli()], entradaFixa, { valor: "5.40" });
const dolarSubiu = financeiroTotal([cli()], entradaFixa, { valor: "7.10" });
const dolarCaiu = financeiroTotal([cli()], entradaFixa, { valor: "4.10" });
t("cotação de referência a 5,40: real fica em 13000", hoje.entrou.brl === 13000);
t("dólar de referência sobe para 7,10: o real da entrada NÃO muda",
  dolarSubiu.entrou.brl === 13000, String(dolarSubiu.entrou.brl));
t("dólar de referência cai para 4,10: também não muda",
  dolarCaiu.entrou.brl === 13000, String(dolarCaiu.entrou.brl));

const semCotFixa = [ent({ id: 1, valor: "1000", moeda: "USD", cotacao: null,
                          recebido_em: "2026-03-14" })];
t("já a entrada SEM cotação acompanha a referência, e é por isso que fica marcada",
  financeiroTotal([cli()], semCotFixa, { valor: "5.40" }).entrou.brl === 5400
  && financeiroTotal([cli()], semCotFixa, { valor: "6.00" }).entrou.brl === 6000);

console.log("\n\x1b[1m=== 5. DUAS MOEDAS NA MESMA CARTEIRA ===\x1b[0m");
const mix = financeiroTotal(
  [{ id: 1, empresa: "A", tipo_contrato: "TCV", valor_contrato: "US$ 2.000" },
   { id: 2, empresa: "B", tipo_contrato: "TCV", valor_contrato: "R$ 5.000" }],
  [{ cliente_id: 1, id: 1, valor: "2000", moeda: "USD", cotacao: "5.00", recebido_em: "2026-02-10" },
   { cliente_id: 2, id: 2, valor: "5000", moeda: "BRL", cotacao: "5.00", recebido_em: "2026-02-20" }],
  REF);
t("total em dólar: 2000 + (5000/5) = 3000", mix.entrou.usd === 3000, String(mix.entrou.usd));
t("total em real: (2000*5) + 5000 = 15000", mix.entrou.brl === 15000, String(mix.entrou.brl));
t("mostra quanto veio nativo em dólar", mix.entrou.nativo_usd === 2000);
t("e quanto veio nativo em real", mix.entrou.nativo_brl === 5000);
t("duas entradas contadas", mix.n_entradas === 2);
t("nenhuma estimativa, as duas tinham cotação", mix.entrou.pct_estimado_brl === 0);

console.log("\n\x1b[1m=== 5b. CONTRATO RECORRENTE ===\x1b[0m");
const mrr = financeiroTotal(
  [{ id: 1, empresa: "A", tipo_contrato: "MRR", valor_contrato: "US$ 1.200", duracao_meses: 6 }],
  [{ cliente_id: 1, id: 1, valor: "1200", moeda: "USD", cotacao: "5.00", recebido_em: "2026-01-05" },
   { cliente_id: 1, id: 2, valor: "1200", moeda: "USD", cotacao: "5.10", recebido_em: "2026-02-05" }],
  REF);
t("contratado de MRR é mensalidade x duração, não a mensalidade crua",
  mrr.contratado.usd === 7200, String(mrr.contratado.usd));
t("mensalidade recorrente somada em separado", mrr.mrr.usd === 1200, String(mrr.mrr.usd));
t("dois meses recebidos somam", mrr.entrou.usd === 2400, String(mrr.entrou.usd));
t("cada mês usou a PRÓPRIA cotação: 6000 + 6120", mrr.entrou.brl === 12120,
  String(mrr.entrou.brl));
t("a receber é o resto do contrato", Math.round(mrr.a_receber.usd) === 4800,
  String(Math.round(mrr.a_receber.usd)));

console.log("\n\x1b[1m=== 5c. TAXA, CUSTO E LUCRO NAS DUAS ===\x1b[0m");
const lucro = financeiroTotal(
  [{ id: 1, empresa: "A", tipo_contrato: "TCV", valor_contrato: "US$ 2.000",
     taxa_percentual: "5", custos_valor: "540", custos_moeda: "BRL" }],
  [{ cliente_id: 1, id: 1, valor: "2000", moeda: "USD", cotacao: "5.00", recebido_em: "2026-02-10" }],
  REF);
t("entrou 2000 dólares, 10000 reais",
  lucro.entrou.usd === 2000 && lucro.entrou.brl === 10000);
t("taxa de 5% em dólar", lucro.taxas.usd === 100, String(lucro.taxas.usd));
t("e a mesma taxa em real", lucro.taxas.brl === 500, String(lucro.taxas.brl));
t("custo lançado em real fica exato em real", lucro.custos.brl === 540, String(lucro.custos.brl));
t("e vira dólar pela referência: 540/5,40 = 100", lucro.custos.usd === 100,
  String(lucro.custos.usd));
t("lucro em dólar: 2000 - 100 - 100", lucro.lucro.usd === 1800, String(lucro.lucro.usd));
t("lucro em real: 10000 - 500 - 540", lucro.lucro.brl === 8960, String(lucro.lucro.brl));
t("margem sobre o que entrou", lucro.lucro.margem === 90, lucro.lucro.margem + "%");
t("lucro por cliente nas duas moedas",
  lucro.lucro_por_cliente.usd === 1800 && lucro.lucro_por_cliente.brl === 8960);

console.log("\n\x1b[1m=== 5d. MÊS A MÊS, PELA DATA DO DINHEIRO ===\x1b[0m");
const meses = financeiroTotal([cli({ valor_contrato: "US$ 9.000" })], [
  ent({ id: 1, valor: "1000", moeda: "USD", cotacao: "5.00", recebido_em: "2026-01-15" }),
  ent({ id: 2, valor: "2000", moeda: "USD", cotacao: "5.00", recebido_em: "2026-01-28" }),
  ent({ id: 3, valor: "1500", moeda: "USD", cotacao: "5.50", recebido_em: "2026-03-02" }),
], REF);
t("dois meses com entrada, não três", meses.por_mes.length === 2,
  meses.por_mes.map((m) => m.rotulo).join(" "));
t("janeiro soma as duas entradas do mês", meses.por_mes[0].usd === 3000,
  meses.por_mes[0].rotulo + ": " + meses.por_mes[0].usd);
t("em ordem cronológica", meses.por_mes[0].mes === "2026-01" && meses.por_mes[1].mes === "2026-03");
t("rótulo em português", meses.por_mes[0].rotulo === "jan/26", meses.por_mes[0].rotulo);
t("março usou a cotação de março", meses.por_mes[1].brl === 8250, String(meses.por_mes[1].brl));

console.log("\n\x1b[1m=== 5e. O HISTÓRICO ANTIGO NÃO DESAPARECE ===\x1b[0m");
/* Cliente de antes do controle de entradas: tem valor_pago e nenhuma entrada.
   Esse dinheiro tem que continuar contando, marcado como registro antigo. */
const antigo = financeiroTotal(
  [cli({ pagamento_confirmado: 1, valor_pago: "US$ 2.500", pagamento_em: "2026-02-01T10:00:00Z" })],
  [], REF);
t("o valor antigo conta como uma entrada", antigo.n_entradas === 1);
t("convertido pela referência, porque não há cotação do dia",
  antigo.entrou.brl === 13500, String(antigo.entrou.brl));
t("marcado como registro antigo", antigo.por_cliente[0].tem_implicita === true);
t("com aviso para regularizar", antigo.avisos.some((a) => /registro de entradas/.test(a)));
t("entra no mês a mês pela data do pagamento", antigo.por_mes[0].mes === "2026-02",
  antigo.por_mes[0].rotulo);
t("e a entrada implícita não tem id, então a tela não oferece editar",
  antigo.por_cliente[0].entradas[0].id === null);

console.log("\n\x1b[1m=== 5f. COTAÇÃO INVÁLIDA NÃO PASSA ===\x1b[0m");
t("zero é recusado", cotacaoValida("0") === null);
t("negativo é recusado", cotacaoValida("-5") === null);
t("absurdo é recusado", cotacaoValida("500") === null);
t("texto é recusado", cotacaoValida("cinco") === null);
t("vírgula é aceita", cotacaoValida("5,42") === 5.42);
t("ponto é aceito", cotacaoValida("5.42") === 5.42);
t("sem cotação salva, cai no padrão e avisa",
  financeiroTotal([cli()], [], {}).cotacao.padrao === true);

console.log("\n\x1b[1m=== 5g. SAÍDAS: O OUTRO LADO DO CAIXA ===\x1b[0m");
const SAI = [
  { id: 1, valor: "1800", moeda: "BRL", cotacao: "5.20", pago_em: "2026-02-10",
    categoria: "anuncios", descricao: "Meta Ads" },
  { id: 2, valor: "100", moeda: "USD", cotacao: "5.25", pago_em: "2026-02-01",
    categoria: "infra", descricao: "Z-API", recorrente: 1 },
  { id: 3, valor: "250", moeda: "USD", cotacao: "5.30", pago_em: "2026-03-12",
    categoria: "terceiros", descricao: "edição", cliente_id: 1 },
];
const cx = financeiroTotal(
  [{ id: 1, empresa: "A", tipo_contrato: "TCV", valor_contrato: "US$ 2.500", taxa_percentual: "5" }],
  [ent({ id: 1, valor: "2500", moeda: "USD", cotacao: "5.20", recebido_em: "2026-02-14" })],
  REF, SAI);
// 1800/5,20 = 346,15 · 100 · 250  ->  696,15
t("saiu soma as três, cada uma pela própria cotação",
  cx.saiu.usd.toFixed(2) === "696.15", "US$ " + cx.saiu.usd.toFixed(2));
t("e em real: 1800 + 525 + 1325", cx.saiu.brl === 3650, String(cx.saiu.brl));
t("saldo = entrou (2500) menos saiu (696,15) menos taxa (125)",
  cx.saldo.usd.toFixed(2) === "1678.85", "US$ " + cx.saldo.usd.toFixed(2));
t("margem do caixa sobre o que entrou", cx.saldo.margem === 67.2, cx.saldo.margem + "%");
t("custo fixo mensal conta só o marcado como recorrente",
  cx.custo_fixo_mensal.usd === 100, cx.custo_fixo_mensal.usd_rot);

console.log("\n\x1b[1m=== 5h. CLIENTE LUCRATIVO E CAIXA NEGATIVO ===\x1b[0m");
/* As duas perguntas que um painel de agência costuma confundir num número só.
   Um cliente pode se pagar e o caixa fechar negativo, se o custo da operação
   for maior que a soma dos clientes. Mostrar um número só esconde esse caso,
   que é o que quebra agência pequena. */
t("custo de cliente separado do custo da operação",
  cx.custos.usd === 250 && cx.overhead.usd.toFixed(2) === "446.15",
  "cliente " + cx.custos.usd_rot + " · operação " + cx.overhead.usd_rot);
t("lucro nos clientes ignora o overhead: 2500 - 125 - 250",
  cx.lucro.usd === 2125, cx.lucro.usd_rot);
t("e é diferente do saldo do caixa", cx.lucro.usd !== cx.saldo.usd,
  cx.lucro.usd_rot + " vs " + cx.saldo.usd_rot);
const afogado = financeiroTotal(
  [{ id: 1, empresa: "A", tipo_contrato: "TCV", valor_contrato: "US$ 1.000" }],
  [ent({ id: 1, valor: "1000", moeda: "USD", cotacao: "5.00", recebido_em: "2026-02-10" })],
  REF, [{ id: 1, valor: "4000", moeda: "USD", cotacao: "5.00", pago_em: "2026-02-11",
          categoria: "anuncios", descricao: "queimou em anúncio" }]);
t("cliente se paga mas o caixa fecha negativo",
  afogado.lucro.usd > 0 && afogado.saldo.usd < 0,
  "lucro " + afogado.lucro.usd_rot + " · saldo " + afogado.saldo.usd_rot);
t("e o sistema diz isso em texto, nomeando a causa",
  afogado.avisos.some((a) => /custo da operação.*est[aá] maior/.test(a)),
  (afogado.avisos.find((a) => /custo da operação/.test(a)) || "").slice(0, 80));
t("saldo negativo é marcado como negativo", afogado.saldo.positivo === false);

console.log("\n\x1b[1m=== 5i. O EXTRATO FECHA COM OS TOTAIS ===\x1b[0m");
/* A tela do caixa soma o extrato para dar o total do mês escolhido. Se o
   extrato não contiver tudo que entra nos totais do servidor, as duas telas
   do mesmo sistema mostram números diferentes. */
const somaExt = (f, tipo, k) => f.extrato.filter((x) => x.tipo === tipo)
  .reduce((a, x) => a + x[k], 0);
t("entradas do extrato somam o total de entrada",
  Math.abs(somaExt(cx, "entrada", "usd") - cx.entrou.usd) < 0.01
  && Math.abs(somaExt(cx, "entrada", "brl") - cx.entrou.brl) < 0.01);
t("saídas do extrato somam o total de saída",
  Math.abs(somaExt(cx, "saida", "usd") - cx.saiu.usd) < 0.01
  && Math.abs(somaExt(cx, "saida", "brl") - cx.saiu.brl) < 0.01);
t("a taxa vai em cada entrada, não rateada por média depois",
  cx.extrato.filter((x) => x.tipo === "entrada").every((x) => x.taxa_usd !== undefined)
  && Math.abs(somaExt(cx, "entrada", "taxa_usd") - cx.taxas.usd) < 0.01,
  "soma das taxas do extrato: US$ " + somaExt(cx, "entrada", "taxa_usd").toFixed(2));
/* Custo que só existe no campo antigo do cliente também precisa de linha, ou
   o extrato ficaria menor que o total e ninguém saberia de onde vem a
   diferença. */
const legado = financeiroTotal(
  [{ id: 1, empresa: "A", data_entrada: "2026-02-01", tipo_contrato: "TCV",
     valor_contrato: "US$ 1.000", custos_valor: "540", custos_moeda: "BRL",
     custos_nota: "freela antigo" }],
  [ent({ id: 1, valor: "1000", moeda: "USD", cotacao: "5.00", recebido_em: "2026-02-10" })],
  REF, []);
t("custo do campo antigo aparece como linha do extrato",
  legado.extrato.filter((x) => x.tipo === "saida").length === 1);
t("e o extrato continua fechando com o total",
  Math.abs(somaExt(legado, "saida", "usd") - legado.saiu.usd) < 0.01
  && Math.abs(somaExt(legado, "saida", "brl") - legado.saiu.brl) < 0.01,
  "extrato US$ " + somaExt(legado, "saida", "usd").toFixed(2)
  + " · total US$ " + legado.saiu.usd.toFixed(2));
t("marcada como registro antigo e sem id, porque não há o que editar",
  legado.extrato.find((x) => x.tipo === "saida").implicita === true
  && legado.extrato.find((x) => x.tipo === "saida").id === null);
t("mas ela é ignorada quando existe saída de verdade para o cliente", (() => {
  const dois = financeiroTotal(
    [{ id: 1, empresa: "A", data_entrada: "2026-02-01", custos_valor: "540", custos_moeda: "BRL" }],
    [], REF,
    [{ id: 1, valor: "200", moeda: "BRL", cotacao: "5.00", pago_em: "2026-02-05",
       categoria: "outros", cliente_id: 1 }]);
  return dois.saiu.brl === 200 && dois.extrato.filter((x) => x.tipo === "saida").length === 1;
})());

console.log("\n\x1b[1m=== 5j. CATEGORIA E MÊS ===\x1b[0m");
t("categorias ordenadas do maior gasto para o menor",
  cx.por_categoria.map((c) => c.chave).join(",") === "anuncios,terceiros,infra",
  cx.por_categoria.map((c) => c.rotulo + " " + c.fatia + "%").join(" · "));
t("a fatia de cada categoria soma 100%",
  Math.abs(cx.por_categoria.reduce((a, c) => a + c.fatia, 0) - 100) < 0.2,
  cx.por_categoria.reduce((a, c) => a + c.fatia, 0).toFixed(1) + "%");
t("o mês traz entrou, saiu, taxa e saldo",
  cx.por_mes[0].entrou && cx.por_mes[0].saiu && cx.por_mes[0].taxas && cx.por_mes[0].saldo);
// fev: entrou 2500, saiu 346,15+100 = 446,15, taxa 125 -> saldo 1928,85
t("saldo do mês desconta a taxa daquele mês",
  cx.por_mes[0].saldo.usd.toFixed(2) === "1928.85",
  cx.por_mes[0].rotulo + ": " + cx.por_mes[0].saldo.usd_rot);
t("categoria fora do catálogo ainda tem rótulo legível",
  rotuloCategoria("xpto") === "xpto" && rotuloCategoria("anuncios") === "Anúncios");

console.log("\n\x1b[1m=== 6. DIAGNÓSTICO SE CALA SEM AMOSTRA ===\x1b[0m");
const vazio = diagnostico({ entraram: 0, responderam: 0, agendaram: 0, compareceram: 0,
  recusaram: 0, fecharam_call: 0, fecharam_followup: 0, fecharam: 0, perdidos: 0 });
t("zero lead: nenhum gargalo apontado", vazio.gargalo === null);
t("zero lead: taxa geral fica nula, não 0%", vazio.taxa_geral === null);
t("zero lead: diz que não há dado", /Sem dado/i.test(vazio.resumo), vazio.resumo);

const pouco = diagnostico({ entraram: 3, responderam: 0, agendaram: 0, compareceram: 0,
  recusaram: 0, fecharam_call: 0, fecharam_followup: 0, fecharam: 0, perdidos: 0 });
t("3 leads e 0% de resposta: ainda não acusa ninguém", pouco.gargalo === null);
t("explica que está em silêncio por amostra", /ru[íi]do/i.test(pouco.resumo), pouco.resumo);
t("diz quantos faltam para medir",
  pouco.passos[0].faltam_para_medir === AMOSTRA_MINIMA - 3,
  "faltam " + pouco.passos[0].faltam_para_medir);

console.log("\n\x1b[1m=== 7. DIAGNÓSTICO COM AMOSTRA ===\x1b[0m");
/* 100 entram, 80 respondem (bom), 60 agendam (bom), 12 comparecem (RUIM:
   20%), 6 fecham. O gargalo tem que ser agendaram->compareceram, que é onde
   48 pessoas somem, e não compareceram->fecharam, que tem percentual pior
   em base menor. */
const real = diagnostico({ entraram: 100, responderam: 80, agendaram: 60, compareceram: 12,
  recusaram: 6, fecharam_call: 4, fecharam_followup: 2, fecharam: 6, perdidos: 20 });
t("achou gargalo", !!real.gargalo, real.gargalo && real.gargalo.de + " -> " + real.gargalo.para);
t("o gargalo é onde mais gente some, não o pior percentual",
  real.gargalo.de === "agendaram" && real.gargalo.para === "compareceram",
  real.gargalo.de + " -> " + real.gargalo.para + " (" + real.gargalo.perdidos_aqui + " perdidos)");
t("aponta o que está indo bem", !!real.melhor, real.melhor && real.melhor.de + " -> " + real.melhor.para);
t("taxa geral calculada", real.taxa_geral === 6, real.taxa_geral + "%");
t("etapa boa marcada como boa",
  real.passos.find((p) => p.de === "entraram").estado === "bom");
t("etapa ruim marcada como ruim",
  real.passos.find((p) => p.de === "agendaram").estado === "ruim");

console.log("\n\x1b[1m=== 8. NOTA DO FOLLOW-UP ===\x1b[0m");
const follow = diagnostico({ entraram: 60, responderam: 50, agendaram: 40, compareceram: 30,
  recusaram: 4, fecharam_call: 2, fecharam_followup: 8, fecharam: 10, perdidos: 5 });
t("avisa quando o follow-up fecha mais que a call",
  follow.notas.some((n) => /follow-up/i.test(n)),
  follow.notas.find((n) => /follow-up/i.test(n)) || "(nenhuma nota)");
const semNota = diagnostico({ entraram: 60, responderam: 50, agendaram: 40, compareceram: 30,
  recusaram: 4, fecharam_call: 9, fecharam_followup: 1, fecharam: 10, perdidos: 5 });
t("não avisa quando a call fecha mais", !semNota.notas.some((n) => /follow-up/i.test(n)));

console.log(`\n${mal ? "\x1b[31m" : "\x1b[32m"}\x1b[1m${ok} passaram, ${mal} falharam\x1b[0m`);
process.exit(mal ? 1 : 0);
