/* ═══════════════════════ FUNIL E FINANCEIRO ═══════════════════════
   O que o dashboard comercial mostra: quantos entram, quantos respondem,
   quantos viram reunião, quantos aparecem, quantos recusam, quantos fecham
   na call, quantos fecham no follow-up, quantos se perdem. E o dinheiro:
   contratado, recebido, custos, lucro.

   Regra da casa que vale aqui inteiro: número que não existe fica em branco,
   não vira zero animado nem estimativa. Com amostra pequena o diagnóstico se
   cala e diz que se calou.                                                  */

/* ═══════════ DINHEIRO ═══════════
   Os valores são TEXT no banco porque foram digitados à mão: "US$ 2.500",
   "2,500.00", "1500". Somar isso exige adivinhar o separador decimal, e
   adivinhar errado troca 2500 por 2,5.

   Regra: se o separador aparece mais de uma vez, é separador de milhar. Se
   aparece uma vez, é decimal só quando sobram 1 ou 2 dígitos depois dele.
   "2.500" -> 2500 (3 dígitos depois, milhar). "2.50" -> 2.5 (decimal).      */
export function parseDinheiro(txt) {
  if (txt === null || txt === undefined) return null;
  const s = String(txt).trim();
  if (!s) return null;

  const moeda = /r\$/i.test(s) ? "BRL"
    : /(us\$|usd|\$)/i.test(s) ? "USD"
    : null;

  let n = s.replace(/[^\d.,-]/g, "");
  if (!/\d/.test(n)) return null;
  const negativo = n.startsWith("-");
  n = n.replace(/-/g, "");

  const pontos = (n.match(/\./g) || []).length;
  const virgulas = (n.match(/,/g) || []).length;

  const decimal = (sep) => {
    const i = n.lastIndexOf(sep);
    const depois = n.length - i - 1;
    return depois >= 1 && depois <= 2;
  };

  if (pontos && virgulas) {
    // o último dos dois manda: "1.234,56" é BR, "1,234.56" é US
    const sep = n.lastIndexOf(".") > n.lastIndexOf(",") ? "." : ",";
    const outro = sep === "." ? "," : ".";
    n = n.split(outro).join("");
    n = decimal(sep) ? n.replace(sep, ".") : n.split(sep).join("");
  } else if (pontos === 1 && decimal(".")) {
    /* já está em ponto decimal */
  } else if (virgulas === 1 && decimal(",")) {
    n = n.replace(",", ".");
  } else {
    n = n.replace(/[.,]/g, "");   // só milhar
  }

  const v = Number.parseFloat(n);
  if (!Number.isFinite(v)) return null;
  return { valor: negativo ? -v : v, moeda };
}

/* ═══════════ CÂMBIO ═══════════
   A operação fatura em DÓLAR e o fundador vive em REAL. Isso não é detalhe de
   apresentação: são dois números que ele precisa ver ao mesmo tempo, e a ponte
   entre eles é uma cotação que muda todo dia.

   A regra aqui é uma só: o real que ele recebeu depende da cotação do dia em
   que AQUELE dinheiro entrou, não da cotação de hoje. Por isso cada entrada
   guarda a própria cotação, e o total em real de uma entrada antiga não muda
   quando o dólar mexe. Sem isso o "faturamento" mudaria sozinho a cada vez que
   a tela fosse aberta, e faturamento que muda sozinho não é faturamento.

   Entrada sem cotação registrada é convertida pela cotação de REFERÊNCIA e
   fica marcada como estimada. A tela diz quanto do total é estimado, para ele
   saber o peso do chute antes de usar o número em qualquer decisão.          */
export const COTACAO_PADRAO = 5.40;   // só para a tela não nascer vazia

const num = (v) => {
  const n = Number.parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
};
export const cotacaoValida = (v) => { const n = num(v); return n && n >= 0.5 && n <= 100 ? n : null; };

const fmtBRL = (v) => "R$ " + Number(v || 0).toLocaleString("pt-BR",
  { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtUSD = (v) => "US$ " + Number(v || 0).toLocaleString("pt-BR",
  { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt = (v, moeda) => (moeda === "BRL" ? fmtBRL(v) : moeda === "USD" ? fmtUSD(v)
  : Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

/* Um valor em uma moeda, visto nas duas. `estimada` diz se a conversão usou a
   cotação de referência em vez da cotação registrada na própria entrada. */
function nasDuas(valor, moeda, cotacaoEntrada, cotacaoRef) {
  const c = cotacaoValida(cotacaoEntrada);
  const taxa = c || cotacaoRef;
  return {
    usd: moeda === "USD" ? valor : valor / taxa,
    brl: moeda === "BRL" ? valor : valor * taxa,
    cotacao_usada: taxa,
    estimada: !c,
  };
}

/* Acumulador nas duas moedas ao mesmo tempo, guardando também o quanto veio
   nativo de cada uma e o quanto foi estimado na conversão. */
const zero = () => ({ usd: 0, brl: 0, nativo_usd: 0, nativo_brl: 0,
                      estimado_usd: 0, estimado_brl: 0, n: 0 });
function soma(acc, valor, moeda, cotacaoEntrada, cotacaoRef) {
  const c = cotacaoValida(cotacaoEntrada);
  const taxa = c || cotacaoRef;
  const usd = moeda === "USD" ? valor : valor / taxa;
  const brl = moeda === "BRL" ? valor : valor * taxa;
  acc.usd += usd; acc.brl += brl; acc.n++;
  if (moeda === "USD") { acc.nativo_usd += valor; if (!c) acc.estimado_brl += brl; }
  else { acc.nativo_brl += valor; if (!c) acc.estimado_usd += usd; }
  return acc;
}
const rotula = (a) => ({
  ...a,
  usd_rot: fmtUSD(a.usd), brl_rot: fmtBRL(a.brl),
  nativo_usd_rot: fmtUSD(a.nativo_usd), nativo_brl_rot: fmtBRL(a.nativo_brl),
  // quanto do total consolidado depende da cotação de referência, não da real
  pct_estimado_brl: a.brl ? Math.round(100 * a.estimado_brl / a.brl) : 0,
  pct_estimado_usd: a.usd ? Math.round(100 * a.estimado_usd / a.usd) : 0,
});

/* ═══════════ CATEGORIAS DE SAÍDA ═══════════
   As categorias vêm da operação real desta agência, não de uma lista genérica
   de contabilidade. Tudo que sai do caixa cabe numa delas, e "Outros" existe
   para não travar o lançamento quando não couber: gasto não lançado por falta
   de categoria é gasto que desaparece do caixa.

   `fixo` marca o que costuma ser mensal, para a tela sugerir a marcação de
   recorrente sem decidir por ele.                                           */
export const CATEGORIAS_SAIDA = [
  ["anuncios", "Anúncios", "Meta e Google Ads. O maior gasto variável da operação.", false],
  ["ferramentas", "Ferramentas e software", "Assinatura de ferramenta, IA, editor, banco de imagem.", true],
  ["infra", "Domínio, hospedagem e Z-API", "Cloudflare, Vercel, domínio, a ponte do WhatsApp.", true],
  ["terceiros", "Freelancer e terceirizado", "Designer, editor de vídeo, redator, quem entra por fora.", false],
  ["contador", "Contador e impostos", "Honorário, guia, taxa de abertura.", true],
  ["equipamento", "Equipamento", "Computador, celular, microfone, o que é comprado uma vez.", false],
  ["bancario", "Taxa bancária e câmbio", "Tarifa de transferência, spread, taxa de saque.", false],
  ["educacao", "Curso e mentoria", "O que foi pago para aprender a operar.", false],
  ["operacao", "Custo de operação", "Internet, energia, telefone, o que mantém a luz acesa.", true],
  ["outros", "Outros", "O que não couber acima. Melhor lançar aqui que não lançar.", false],
];
const CAT = new Map(CATEGORIAS_SAIDA.map(([k, rot, desc, fixo]) => [k, { rot, desc, fixo }]));
export const rotuloCategoria = (k) => (CAT.get(k)?.rot || k || "sem categoria");

/* ═══════════ VALOR DO CONTRATO ═══════════
   TCV é pagamento único: o valor do contrato é o valor digitado.
   MRR é mensalidade: o valor do contrato é a mensalidade VEZES a duração.
   Somar a mensalidade crua com o total de um TCV subestima a carteira e faz o
   "a receber" nascer errado, que era o comportamento antigo.               */
export function valorDoContrato(c, cotacaoRef) {
  const base = parseDinheiro(c.valor_contrato);
  const extra = parseDinheiro(c.valor_extras);
  if (!base && !extra) return null;
  const meses = Math.max(1, Number(c.duracao_meses) || 1);
  const recorrente = c.tipo_contrato === "MRR";
  const moeda = base?.moeda || extra?.moeda || null;

  /* O EXTRA PODE ESTAR EM OUTRA MOEDA que a base, e antes era somado cru:
     R$ 800 de serviço extra viravam US$ 800 no "Contratado" e no "Ainda a
     receber". `parseDinheiro` já detecta a moeda de cada texto; o bug era
     descartar a do extra. Agora converte pela cotação de referência e marca o
     total como parcialmente estimado, para a tela poder dizer isso. */
  const ref = cotacaoValida(cotacaoRef) || COTACAO_PADRAO;
  let extraNaMoeda = 0, extraConvertido = false;
  if (extra) {
    const mesma = !extra.moeda || !moeda || extra.moeda === moeda;
    if (mesma) extraNaMoeda = extra.valor;
    else {
      extraNaMoeda = extra.moeda === "USD" ? extra.valor * ref : extra.valor / ref;
      extraConvertido = true;
    }
  }
  const total = (base ? base.valor * (recorrente ? meses : 1) : 0) + extraNaMoeda;
  return {
    total, moeda,
    mensalidade: recorrente && base ? base.valor : null,
    meses: recorrente ? meses : null,
    recorrente,
    extra_convertido: extraConvertido,
    extra_original: extra ? { valor: extra.valor, moeda: extra.moeda } : null,
  };
}

/* ═══════════ FINANCEIRO POR CLIENTE ═══════════
   contratado  o valor do contrato inteiro (TCV, ou mensalidade x duração)
   entrou      soma das ENTRADAS registradas desse cliente
   taxa        percentual do gateway/câmbio, sobre o que entrou
   custos      custo direto do cliente, na moeda dele
   lucro       entrou - taxa - custos, calculado nas duas moedas             */
export function financeiroDoCliente(c, entradas = [], cotacaoRef = COTACAO_PADRAO, saidas = []) {
  const ct = valorDoContrato(c, cotacaoRef);
  const minhas = entradas.filter((e) => e.cliente_id === c.id);

  /* Compatibilidade com o histórico: cliente antigo tem valor_pago e nenhuma
     entrada registrada. Esse valor conta como UMA entrada implícita, com a
     data do pagamento, para nada desaparecer. A tela diz que fez isso. */
  const implicita = !minhas.length && c.pagamento_confirmado && parseDinheiro(c.valor_pago);
  const lista = minhas.length ? minhas : (implicita ? [{
    id: null, cliente_id: c.id, valor: c.valor_pago,
    moeda: implicita.moeda || "USD", cotacao: null,
    recebido_em: c.pagamento_em || c.data_entrada, meio: null,
    parcela: "registro antigo", nota: null, implicita: true,
  }] : []);

  const ent = zero();
  const detalhe = [];
  for (const e of lista) {
    const v = parseDinheiro(e.valor);
    if (!v) continue;
    const moeda = e.moeda || v.moeda || "USD";
    soma(ent, v.valor, moeda, e.cotacao, cotacaoRef);
    const d = nasDuas(v.valor, moeda, e.cotacao, cotacaoRef);
    detalhe.push({ id: e.id, valor: v.valor, moeda, valor_rot: fmt(v.valor, moeda),
      cotacao: cotacaoValida(e.cotacao), cotacao_usada: d.cotacao_usada,
      /* A marca de estimado NÃO depende da moeda. Antes só marcava entrada em
         dólar; entrada em real sem cotação ficava sem marca e o total em DÓLAR
         mudava sozinho quando a cotação de referência era atualizada, com a
         tela jurando estar exata. É a mesma ficção que a migração 11 existe
         para evitar, virada para o outro lado, e o caso é real: parte do
         recebimento de contractor brasileiro entra por PIX em real. */
      cotacao_estimada: !cotacaoValida(e.cotacao),
      moeda_estimada: !cotacaoValida(e.cotacao) ? (moeda === "USD" ? "BRL" : "USD") : null,
      usd: d.usd, brl: d.brl, usd_rot: fmtUSD(d.usd), brl_rot: fmtBRL(d.brl),
      recebido_em: e.recebido_em, meio: e.meio || null, parcela: e.parcela || null,
      nota: e.nota || null, implicita: !!e.implicita });
  }

  const taxaPct = Math.min(Math.max(num(c.taxa_percentual) || 0, 0), 100);
  const taxas = { usd: ent.usd * taxaPct / 100, brl: ent.brl * taxaPct / 100 };
  /* A taxa de cada entrada vai junto com ela. Sem isso, a tela do caixa tinha
     que ratear a taxa total por um percentual médio, e média de percentual
     entre clientes com taxas diferentes não fecha com a soma exata: dava R$
     2,29 de diferença no saldo, que é o tipo de erro que faz a conferência
     contra o banco não bater e ninguém saber por quê. */
  for (const d of detalhe) {
    d.taxa_usd = d.usd * taxaPct / 100;
    d.taxa_brl = d.brl * taxaPct / 100;
  }

  /* Custo do cliente: sai das SAÍDAS lançadas para ele. O campo antigo
     `custos_valor` só conta enquanto não houver nenhuma saída lançada, senão
     o mesmo gasto entraria duas vezes. Mesmo padrão de valor_pago x entradas. */
  const minhasSaidas = saidas.filter((x) => Number(x.cliente_id) === Number(c.id));
  const custos = zero();
  const detalheSaidas = [];
  for (const x of minhasSaidas) {
    const v = parseDinheiro(x.valor);
    if (!v) continue;
    const moeda = x.moeda || v.moeda || "USD";
    soma(custos, v.valor, moeda, x.cotacao, cotacaoRef);
    const d = nasDuas(v.valor, moeda, x.cotacao, cotacaoRef);
    detalheSaidas.push({ id: x.id, valor: v.valor, moeda, valor_rot: fmt(v.valor, moeda),
      categoria: x.categoria, categoria_rot: rotuloCategoria(x.categoria),
      descricao: x.descricao || null, pago_em: x.pago_em, recorrente: !!x.recorrente,
      usd: d.usd, brl: d.brl, usd_rot: fmtUSD(d.usd), brl_rot: fmtBRL(d.brl),
      cotacao: cotacaoValida(x.cotacao), cotacao_usada: d.cotacao_usada,
      cotacao_estimada: d.estimada && moeda === "USD" });
  }
  const cu = minhasSaidas.length ? null : parseDinheiro(c.custos_valor);
  if (cu) soma(custos, cu.valor, c.custos_moeda || cu.moeda || "USD", null, cotacaoRef);

  const lucro = { usd: ent.usd - taxas.usd - custos.usd, brl: ent.brl - taxas.brl - custos.brl };

  // A RECEBER só existe com contrato preenchido, e nunca é negativo: quem
  // pagou mais que o contratado não tem "a receber" de menos zero.
  const aReceber = ct ? (() => {
    const c2 = nasDuas(ct.total, ct.moeda || "USD", null, cotacaoRef);
    return { usd: Math.max(0, c2.usd - ent.usd), brl: Math.max(0, c2.brl - ent.brl) };
  })() : null;

  return {
    id: c.id, empresa: c.empresa,
    contratado: ct ? ct.total : null, contratado_moeda: ct?.moeda || null,
    contratado_rot: ct ? fmt(ct.total, ct.moeda) : null,
    recorrente: !!ct?.recorrente, mensalidade: ct?.mensalidade || null, meses: ct?.meses || null,
    entrou: rotula(ent), entradas: detalhe, n_entradas: detalhe.length,
    tem_implicita: detalhe.some((d) => d.implicita),
    taxa_pct: taxaPct,
    taxas: { ...taxas, usd_rot: fmtUSD(taxas.usd), brl_rot: fmtBRL(taxas.brl) },
    custos: rotula(custos), custos_nota: c.custos_nota || null,
    saidas: detalheSaidas, n_saidas: detalheSaidas.length,
    // o campo antigo foi aposentado por ter saída lançada de verdade
    custo_antigo_ignorado: !!(minhasSaidas.length && parseDinheiro(c.custos_valor)),
    custo_antigo_ativo: !!cu,
    lucro: { ...lucro, usd_rot: fmtUSD(lucro.usd), brl_rot: fmtBRL(lucro.brl) },
    margem: ent.usd ? Math.round(1000 * lucro.usd / ent.usd) / 10 : null,
    a_receber: aReceber ? { ...aReceber, usd_rot: fmtUSD(aReceber.usd), brl_rot: fmtBRL(aReceber.brl) } : null,
    // o que impede este cliente de ter número fechado
    pendente: !detalhe.length
      ? (c.pagamento_confirmado ? "pagamento marcado, nenhuma entrada registrada" : "nada entrou ainda")
      : null,
  };
}

/* ═══════════ TOTAL ═══════════
   Consolida nas DUAS moedas. Não é "somar dólar com real": é mostrar o mesmo
   total visto de cada lado, com a conversão declarada, mais o quanto entrou
   nativo em cada moeda. O que ele precisa saber é justamente os dois.       */
export function financeiroTotal(clientes = [], entradas = [], cotacao = {}, saidas = []) {
  const ref = cotacaoValida(cotacao.valor) || COTACAO_PADRAO;
  const porCliente = clientes.map((c) => financeiroDoCliente(c, entradas, ref, saidas));
  const nomeCliente = new Map(clientes.map((c) => [Number(c.id), c.empresa]));

  const entrou = zero(), contratado = zero(), taxas = zero(), custos = zero(), aReceber = zero();
  let nContratos = 0, nComEntrada = 0, nRecorrentes = 0;
  const mrr = zero();

  for (const f of porCliente) {
    if (f.contratado !== null) {
      soma(contratado, f.contratado, f.contratado_moeda || "USD", null, ref);
      nContratos++;
      if (f.recorrente && f.mensalidade) {
        soma(mrr, f.mensalidade, f.contratado_moeda || "USD", null, ref);
        nRecorrentes++;
      }
    }
    if (f.n_entradas) {
      nComEntrada++;
      // acumula a partir do detalhe, para cada entrada usar a PRÓPRIA cotação
      for (const d of f.entradas) soma(entrou, d.valor, d.moeda, d.cotacao, ref);
      taxas.usd += f.taxas.usd; taxas.brl += f.taxas.brl;
    }
    /* Custo do cliente entra no total mesmo sem entrada: dinheiro gasto num
       cliente que nunca pagou é prejuízo real, e esconder isso do caixa
       inflaria o saldo. O lucro POR CLIENTE segue calculado só sobre quem
       pagou, que é outra pergunta. */
    if (f.custo_antigo_ativo) { custos.usd += f.custos.usd; custos.brl += f.custos.brl; }
    if (f.a_receber) { aReceber.usd += f.a_receber.usd; aReceber.brl += f.a_receber.brl; }
  }

  /* ═══ SAÍDAS ═══
     Todas as saídas lançadas, de cliente e de operação. As de cliente já
     entraram em `f.custos` por cliente; aqui elas são recontadas no total do
     caixa, por isso `custos` acima só somou o campo ANTIGO (legado). */
  const saiu = zero();
  // o pedaço das saídas que é custo direto de cliente: o resto é overhead
  const custosDeCliente = zero();
  /* Recorrente por MÊS, não somado no período. Antes `fixoMensal` acumulava
     toda saída recorrente do período inteiro e a tela imprimia isso como
     "Custo fixo mensal": depois de um ano de R$ 200 de assinatura, a tela
     dizia R$ 2.400 de custo fixo mensal. É a base do ponto de equilíbrio, e
     era o número mais errado do caixa. Agora agrupa por mês e a tela usa o
     mês mais recente com lançamento. */
  const recorrentePorMes = new Map();
  const porCategoria = new Map();
  const fixoMensal = zero();
  const detalheSaidas = [];
  for (const x of saidas) {
    const v = parseDinheiro(x.valor);
    if (!v) continue;
    const moeda = x.moeda || v.moeda || "USD";
    soma(saiu, v.valor, moeda, x.cotacao, ref);
    if (x.cliente_id) soma(custosDeCliente, v.valor, moeda, x.cotacao, ref);
    if (!porCategoria.has(x.categoria)) porCategoria.set(x.categoria, zero());
    soma(porCategoria.get(x.categoria), v.valor, moeda, x.cotacao, ref);
    if (x.recorrente) {
      const mes = String(x.pago_em || "").slice(0, 7);
      if (/^\d{4}-\d{2}$/.test(mes)) {
        if (!recorrentePorMes.has(mes)) recorrentePorMes.set(mes, zero());
        soma(recorrentePorMes.get(mes), v.valor, moeda, x.cotacao, ref);
      }
      soma(fixoMensal, v.valor, moeda, x.cotacao, ref);   // total do período
    }
    const d = nasDuas(v.valor, moeda, x.cotacao, ref);
    detalheSaidas.push({
      tipo: "saida", id: x.id, data: String(x.pago_em || "").slice(0, 10),
      valor: v.valor, moeda, valor_rot: fmt(v.valor, moeda),
      usd: d.usd, brl: d.brl, usd_rot: fmtUSD(d.usd), brl_rot: fmtBRL(d.brl),
      cotacao: cotacaoValida(x.cotacao), cotacao_usada: d.cotacao_usada,
      cotacao_estimada: d.estimada && moeda === "USD",
      categoria: x.categoria, categoria_rot: rotuloCategoria(x.categoria),
      descricao: x.descricao || null, recorrente: !!x.recorrente,
      cliente_id: x.cliente_id || null,
      cliente: x.cliente_id ? (nomeCliente.get(Number(x.cliente_id)) || null) : null,
      nota: x.nota || null,
    });
  }
  /* O custo antigo (legado) também sai do caixa, senão o saldo mente. E ele é
     custo de cliente por definição: mora no card de um cliente.

     Ele ENTRA NO EXTRATO como linha sintética. Sem isso, a tela do caixa (que
     soma o extrato para dar o total do mês) discordaria do total do servidor
     justo pelo valor do custo antigo, e os dois números apareceriam
     diferentes em duas telas do mesmo sistema. Sem id, porque não existe
     linha para editar: o jeito de mexer nele é lançar a saída de verdade. */
  saiu.usd += custos.usd; saiu.brl += custos.brl;
  saiu.estimado_usd += custos.estimado_usd; saiu.estimado_brl += custos.estimado_brl;
  custosDeCliente.usd += custos.usd; custosDeCliente.brl += custos.brl;
  for (const f of porCliente) {
    if (!f.custo_antigo_ativo || !f.custos.usd) continue;
    const moeda = f.custos.nativo_brl ? "BRL" : "USD";
    const bruto = moeda === "BRL" ? f.custos.nativo_brl : f.custos.nativo_usd;
    const cli = clientes.find((c) => Number(c.id) === Number(f.id)) || {};
    detalheSaidas.push({
      tipo: "saida", id: null, data: String(cli.pagamento_em || cli.data_entrada || "").slice(0, 10),
      valor: bruto, moeda, valor_rot: fmt(bruto, moeda),
      usd: f.custos.usd, brl: f.custos.brl,
      usd_rot: fmtUSD(f.custos.usd), brl_rot: fmtBRL(f.custos.brl),
      cotacao: null, cotacao_usada: ref, cotacao_estimada: moeda === "USD",
      categoria: "outros", categoria_rot: rotuloCategoria("outros"),
      descricao: f.custos_nota || "Custo lançado no campo antigo do cliente",
      recorrente: false, cliente_id: f.id, cliente: f.empresa,
      nota: null, implicita: true,
    });
    if (!porCategoria.has("outros")) porCategoria.set("outros", zero());
    soma(porCategoria.get("outros"), bruto, moeda, null, ref);
  }

  /* ═══ EXTRATO ═══
     Entradas e saídas na mesma lista, ordenada pela data do dinheiro, mais
     recente primeiro. É o que a tela do caixa mostra agrupado por dia. */
  const detalheEntradas = [];
  for (const f of porCliente)
    for (const d of f.entradas)
      detalheEntradas.push({
        tipo: "entrada", id: d.id, data: String(d.recebido_em || "").slice(0, 10),
        valor: d.valor, moeda: d.moeda, valor_rot: d.valor_rot,
        usd: d.usd, brl: d.brl, usd_rot: d.usd_rot, brl_rot: d.brl_rot,
        cotacao: d.cotacao, cotacao_usada: d.cotacao_usada,
        cotacao_estimada: d.cotacao_estimada,
        // qual dos dois lados é o estimado: sem isso a tela não sabe se o
        // número duvidoso é o de real ou o de dólar
        moeda_estimada: d.moeda_estimada || null,
        cliente_id: f.id, cliente: f.empresa,
        descricao: [d.parcela, d.meio].filter(Boolean).join(" · ") || null,
        implicita: d.implicita, categoria: "recebimento", categoria_rot: "Recebimento",
        taxa_usd: d.taxa_usd || 0, taxa_brl: d.taxa_brl || 0,
      });
  const extrato = [...detalheEntradas, ...detalheSaidas]
    .sort((a, b) => (b.data || "").localeCompare(a.data || "") || (b.id || 0) - (a.id || 0));

  /* ═══ SALDO ═══
     Entrou menos saiu menos taxa. É o que efetivamente sobrou no caixa, e a
     diferença entre isto e o "lucro" é só o que se considera custo: o lucro
     olha o que o trabalho rendeu, o saldo olha o que existe na conta. */
  const saldo = { usd: entrou.usd - saiu.usd - taxas.usd,
                  brl: entrou.brl - saiu.brl - taxas.brl };

  /* ═══ DUAS PERGUNTAS DIFERENTES, DOIS NÚMEROS DIFERENTES ═══
     Confundir as duas é o erro clássico de painel de agência:

     LUCRO NOS CLIENTES  entrou, menos a taxa, menos o custo DIRETO de cada
                         cliente. Responde "cada cliente se paga?". Não desconta
                         anúncio, ferramenta nem contador, que não são de um
                         cliente só.
     SALDO DO CAIXA      entrou, menos TUDO que saiu. Responde "sobrou dinheiro
                         no fim do mês?". É o resultado do negócio.

     Um cliente pode ser lucrativo e o caixa fechar negativo, se o custo da
     operação for maior que a soma dos clientes. Mostrar um número só esconderia
     exatamente esse caso, que é o que quebra agência pequena. */
  const lucroClientes = { usd: 0, brl: 0 };
  for (const f of porCliente)
    if (f.n_entradas) { lucroClientes.usd += f.lucro.usd; lucroClientes.brl += f.lucro.brl; }
  const overhead = { usd: saiu.usd - custosDeCliente.usd, brl: saiu.brl - custosDeCliente.brl };

  /* ── mês a mês do que entrou ──
     Agrupado pela data do DINHEIRO, não pela do cadastro. É a única forma de
     ver se a entrada está crescendo ou parou. */
  const meses = new Map();
  const balde = (mes) => {
    if (!meses.has(mes)) meses.set(mes, { entrou: zero(), saiu: zero(), taxas: { usd: 0, brl: 0 } });
    return meses.get(mes);
  };
  for (const d of detalheEntradas) {
    const mes = d.data.slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(mes)) continue;
    const b = balde(mes);
    soma(b.entrou, d.valor, d.moeda, d.cotacao, ref);
    b.taxas.usd += d.taxa_usd || 0; b.taxas.brl += d.taxa_brl || 0;
  }
  for (const d of detalheSaidas) {
    const mes = d.data.slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(mes)) continue;
    soma(balde(mes).saiu, d.valor, d.moeda, d.cotacao, ref);
  }
  const MES_PT = ["jan", "fev", "mar", "abr", "mai", "jun",
                  "jul", "ago", "set", "out", "nov", "dez"];
  const porMes = [...meses.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    .map(([mes, m]) => {
      // a taxa entra no saldo do mês: ela saiu do caixa junto com o resto
      const sal = { usd: m.entrou.usd - m.saiu.usd - m.taxas.usd,
                    brl: m.entrou.brl - m.saiu.brl - m.taxas.brl };
      return { mes,
        rotulo: `${MES_PT[Number(mes.slice(5, 7)) - 1]}/${mes.slice(2, 4)}`,
        ...rotula(m.entrou),                       // entrou fica na raiz, compatível
        entrou: rotula(m.entrou), saiu: rotula(m.saiu),
        taxas: { ...m.taxas, usd_rot: fmtUSD(m.taxas.usd), brl_rot: fmtBRL(m.taxas.brl) },
        saldo: { ...sal, usd_rot: fmtUSD(sal.usd), brl_rot: fmtBRL(sal.brl),
                 positivo: sal.usd >= 0 } };
    });

  const avisos = [];
  if (entrou.estimado_brl > 0) avisos.push(
    `${Math.round(100 * entrou.estimado_brl / entrou.brl)}% do total em REAL foi convertido pela cotação de referência ` +
    `(R$ ${ref.toFixed(2).replace(".", ",")}), não pela cotação do dia em que o dinheiro entrou. ` +
    `Preencha a cotação em cada entrada para o número em real virar exato.`);
  /* O aviso pelo lado do DÓLAR faltava. Entrada em real sem cotação fazia o
     total em dólar mudar sozinho, e o dólar é o número grande da tela. */
  if (entrou.estimado_usd > 0 && entrou.usd) avisos.push(
    `${Math.round(100 * entrou.estimado_usd / entrou.usd)}% do total em DÓLAR foi convertido pela cotação de ` +
    `referência (R$ ${ref.toFixed(2).replace(".", ",")}), não pela cotação do dia. São entradas em real sem ` +
    `cotação registrada: enquanto ficarem assim, o total em dólar muda quando você atualizar a cotação.`);
  if (porCliente.some((f) => f.tem_implicita)) avisos.push(
    "Alguns clientes têm valor recebido antigo, de antes do registro de entradas. " +
    "Ele conta como uma entrada só, sem cotação e sem data do dinheiro. " +
    "Regularize lançando as entradas de verdade no card.");
  if (lucroClientes.usd > 0 && saldo.usd < 0) avisos.push(
    `Cada cliente se paga (lucro nos clientes de ${fmtUSD(lucroClientes.usd)}), mas o caixa ` +
    `fecha negativo em ${fmtUSD(Math.abs(saldo.usd))}: o custo da operação ` +
    `(${fmtUSD(overhead.usd)}) está maior que o que os clientes rendem. Ou entra mais ` +
    `cliente, ou o custo fixo tem que cair.`);
  if (saiu.estimado_brl > 0 && saiu.brl) avisos.push(
    `${Math.round(100 * saiu.estimado_brl / saiu.brl)}% do que saiu, em real, foi convertido pela ` +
    `cotação de referência. Gasto em dólar no cartão brasileiro tem a cotação do dia do ` +
    `fechamento: preencha ela na saída para o valor em real ficar exato.`);
  if (porCliente.some((f) => f.custo_antigo_ignorado)) avisos.push(
    "Algum cliente tem custo no campo antigo E saída lançada no caixa. O campo antigo " +
    "foi ignorado para o gasto não contar duas vezes, e o card diz isso no cliente.");
  if (porCliente.some((f) => f.pendente === "pagamento marcado, nenhuma entrada registrada")) avisos.push(
    "Há cliente com pagamento confirmado e nenhuma entrada lançada. Enquanto a " +
    "entrada não for lançada, esse dinheiro não aparece no total.");

  return {
    cotacao: { valor: ref, rotulo: ref.toFixed(2).replace(".", ","),
               em: cotacao.em || null, fonte: cotacao.fonte || null,
               padrao: !cotacaoValida(cotacao.valor) },
    entrou: rotula(entrou),
    contratado: { ...rotula(contratado), n: nContratos },
    mrr: { ...rotula(mrr), n: nRecorrentes },
    a_receber: { ...aReceber, usd_rot: fmtUSD(aReceber.usd), brl_rot: fmtBRL(aReceber.brl) },
    taxas: { ...taxas, usd_rot: fmtUSD(taxas.usd), brl_rot: fmtBRL(taxas.brl) },
    // custo direto de cliente, e o que é da operação (anúncio, ferramenta)
    custos: { ...rotula(custosDeCliente) },
    overhead: { ...overhead, usd_rot: fmtUSD(overhead.usd), brl_rot: fmtBRL(overhead.brl) },
    /* "lucro" = o que os clientes rendem, sem descontar overhead.
       Responde: cada cliente se paga? */
    lucro: { ...lucroClientes,
             usd_rot: fmtUSD(lucroClientes.usd), brl_rot: fmtBRL(lucroClientes.brl),
             margem: entrou.usd ? Math.round(1000 * lucroClientes.usd / entrou.usd) / 10 : null },
    lucro_por_cliente: nComEntrada
      ? { usd: lucroClientes.usd / nComEntrada, brl: lucroClientes.brl / nComEntrada,
          usd_rot: fmtUSD(lucroClientes.usd / nComEntrada),
          brl_rot: fmtBRL(lucroClientes.brl / nComEntrada) }
      : null,
    /* ═══ o outro lado do caixa ═══ */
    saiu: rotula(saiu),
    saldo: { ...saldo, usd_rot: fmtUSD(saldo.usd), brl_rot: fmtBRL(saldo.brl),
             positivo: saldo.usd >= 0,
             // quanto de cada real que entrou sobrou
             margem: entrou.usd ? Math.round(1000 * saldo.usd / entrou.usd) / 10 : null },
    /* Dois números diferentes, e antes eram um só chamado "Custo fixo mensal":
       o do MÊS é o que serve para ponto de equilíbrio; o do período é o total
       gasto em recorrentes desde o começo. */
    custo_fixo_mensal: (() => {
      const meses = [...recorrentePorMes.keys()].sort();
      const ultimo = meses[meses.length - 1];
      return { ...rotula(ultimo ? recorrentePorMes.get(ultimo) : zero()),
               mes: ultimo || null,
               n_meses: meses.length };
    })(),
    recorrente_no_periodo: rotula(fixoMensal),
    por_categoria: [...porCategoria.entries()]
      .map(([k, a]) => ({ chave: k, rotulo: rotuloCategoria(k), ...rotula(a),
        // fatia do que saiu, para desenhar a barra
        fatia: saiu.usd ? Math.round(1000 * a.usd / saiu.usd) / 10 : 0 }))
      .sort((a, b) => b.usd - a.usd),
    categorias: CATEGORIAS_SAIDA,
    extrato,
    n_saidas: detalheSaidas.length,
    n_lancamentos: extrato.length,
    n_clientes_com_entrada: nComEntrada,
    n_entradas: entrou.n,
    por_mes: porMes,
    por_cliente: porCliente,
    sem_valor: porCliente.filter((f) => f.pendente).length,
    avisos,
  };
}

/* Busca a cotação de mercado do dólar. É REFERÊNCIA, e a tela diz isso: o real
   que ele recebeu de verdade saiu da cotação do banco ou da Wise dele, que
   sempre é pior que a de mercado. Serve para não ter que digitar todo dia.

   Falha em silêncio de propósito: se a API de fora cair, a cotação salva
   continua valendo e nada na tela para de funcionar.                        */
export async function buscarCotacao() {
  try {
    const r = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) return { erro: `A fonte respondeu ${r.status}. Digite a cotação na mão.` };
    const j = await r.json();
    const v = cotacaoValida(j?.USDBRL?.bid);
    if (!v) return { erro: "A fonte devolveu um valor que não parece cotação. Digite na mão." };
    return { ok: true, valor: v, fonte: "AwesomeAPI, cotação de mercado (compra)" };
  } catch (e) {
    console.log("cotacao falhou:", e.message);
    return { erro: "Não consegui buscar a cotação agora. Digite na mão." };
  }
}

/* ═══════════ FUNIL ═══════════
   Uma consulta por etapa, todas num batch. As etapas saem de onde o dado
   realmente mora, não de um contador paralelo que alguém tem que lembrar de
   incrementar:

   entraram      a tabela leads inteira, arquivado incluído
   responderam   ultima_resposta_em, gravado pela ligação atendida e pelo
                 botão "respondeu mensagem"
   agendaram     call_agendada_para
   compareceram  evento call_compareceu, gravado ao mover para "call rolando"
   fecharam      evento moveu com para terminando em /fechou. O `de` desse
                 evento é o que separa fechou-na-call de fechou-no-follow-up
   recusaram     coluna recusou
   perdidos      arquivado, ou parou no no_show_f3, que é o encerramento      */
export async function funil(D) {
  const [qTot, qResp, qAgen, qComp, qRec, qPerd, qFech, qCli] = await D.batch([
    D.prepare("SELECT COUNT(*) n FROM leads"),
    D.prepare("SELECT COUNT(*) n FROM leads WHERE ultima_resposta_em IS NOT NULL"),
    D.prepare("SELECT COUNT(*) n FROM leads WHERE call_agendada_para IS NOT NULL"),
    D.prepare("SELECT COUNT(DISTINCT lead_id) n FROM eventos WHERE tipo='call_compareceu'"),
    D.prepare("SELECT COUNT(*) n FROM leads WHERE coluna='recusou'"),
    D.prepare("SELECT COUNT(*) n FROM leads WHERE arquivado=1 OR coluna='no_show_f3'"),
    /* Fechamento pela PASSAGEM, mas só de quem AINDA está em fechou.
       O bug: `fecharam` saía de eventos (permanentes) e `recusaram` do estado
       atual da coluna (reversível). Mover para Fechou e depois para Recusou
       contava o mesmo lead nas duas pontas, para sempre, e a taxa geral
       ("X% fecham", que vai no título do funil e para a IA) ficava inflada sem
       jeito de corrigir a não ser excluindo o lead.

       O `de` do evento continua sendo a fonte de onde ele veio, que é o que
       separa fechou-na-call de fechou-no-follow-up. O INNER JOIN com leads é
       o que trava a contagem no estado atual. */
    D.prepare(`SELECT e.lead_id, e.de, MIN(e.id) pid FROM eventos e
               JOIN leads l ON l.id = e.lead_id AND l.coluna = 'fechou'
               WHERE e.tipo='moveu' AND e.para LIKE '%/fechou'
               GROUP BY e.lead_id`),
    D.prepare("SELECT COUNT(*) n FROM clientes WHERE arquivado=0"),
  ]);
  const n = (q) => q?.results?.[0]?.n || 0;

  let naCall = 0, noFollow = 0;
  for (const f of qFech.results || []) {
    // "agendamento/call_rolando" = estava na reunião quando fechou.
    // Qualquer outra origem (no-show, nutrição, recuperação) é follow-up.
    if (String(f.de || "").endsWith("/call_rolando")) naCall++; else noFollow++;
  }

  const etapas = {
    entraram: n(qTot),
    responderam: n(qResp),
    agendaram: n(qAgen),
    compareceram: n(qComp),
    recusaram: n(qRec),
    fecharam_call: naCall,
    fecharam_followup: noFollow,
    perdidos: n(qPerd),
  };
  etapas.fecharam = naCall + noFollow;
  return { etapas, clientes_ativos: n(qCli) };
}

export const ROTULOS_FUNIL = {
  entraram: "Entraram", responderam: "Responderam", agendaram: "Agendaram reunião",
  compareceram: "Compareceram", recusaram: "Recusaram na call",
  fecharam_call: "Fecharam na call", fecharam_followup: "Fecharam no follow-up",
  fecharam: "Fecharam (total)", perdidos: "Perdidos",
};

/* As transições que importam, e o que uma queda em cada uma significa.
   O diagnóstico vem das aulas estudadas (ver _memoria/historico) e é
   referência INTERNA da operação, não estatística de mercado. */
const TRANSICOES = [
  { de: "entraram", para: "responderam", piso: 40,
    dor: "O criativo do anúncio atrai quem não quer conversa.",
    acao: "Trocar o criativo antes de mexer em qualquer outra coisa. Nada adiante compensa lead que não responde." },
  { de: "responderam", para: "agendaram", piso: 40,
    dor: "Ele responde e a conversa não vira reunião.",
    acao: "A qualificação não está gerando valor. Ancorar o problema dele antes de oferecer a call, e nunca agendar para mais de 2 dias." },
  { de: "agendaram", para: "compareceram", piso: 50,
    dor: "Marcam e não aparecem.",
    acao: "A cadência de confirmação existe e roda sozinha. Se o no-show está alto com ela ligada, a call foi marcada longe demais ou o valor não ficou claro." },
  { de: "compareceram", para: "fecharam", piso: 30,
    dor: "Sentam na reunião e não fecham.",
    acao: "Em 80% dos casos é o closer, não o lead. Revisar a condução: ouvir muito, receitar no fim, sem empurrar." },
];

/* ═══════════ DIAGNÓSTICO SEM IA ═══════════
   Roda sempre, não custa nada e não depende de chave. É a base: a IA em cima
   dele só escreve melhor, não descobre o gargalo sozinha.

   AMOSTRA_MINIMA existe porque com 3 leads qualquer taxa é ruído, e um
   "diagnóstico" em cima disso é chute com cara de dado.                     */
export const AMOSTRA_MINIMA = 5;

export function diagnostico(etapas) {
  const total = etapas.entraram || 0;
  const taxa = (de, para) => {
    const base = etapas[de] || 0;
    if (base < AMOSTRA_MINIMA) return null;
    return Math.round(1000 * (etapas[para] || 0) / base) / 10;
  };

  const passos = TRANSICOES.map((t) => {
    const base = etapas[t.de] || 0;
    const v = taxa(t.de, t.para);
    return {
      ...t, base, chegou: etapas[t.para] || 0, taxa: v,
      sem_amostra: base < AMOSTRA_MINIMA,
      faltam_para_medir: Math.max(0, AMOSTRA_MINIMA - base),
      estado: v === null ? "sem_dados" : v < t.piso ? "ruim" : v < t.piso * 1.25 ? "limite" : "bom",
      perdidos_aqui: Math.max(0, base - (etapas[t.para] || 0)),
    };
  });

  const medidos = passos.filter((p) => p.taxa !== null);
  const ruins = medidos.filter((p) => p.estado === "ruim");

  // o gargalo é a etapa ruim que perde MAIS gente em número absoluto, não a
  // de pior percentual: 20% de 100 leads dói mais que 5% de 4
  const gargalo = ruins.slice().sort((a, b) => b.perdidos_aqui - a.perdidos_aqui)[0] || null;
  const bons = medidos.filter((p) => p.estado === "bom");
  const melhor = bons.slice().sort((a, b) => (b.taxa / b.piso) - (a.taxa / a.piso))[0] || null;

  const fechamentos = (etapas.fecharam_call || 0) + (etapas.fecharam_followup || 0);
  const notas = [];
  if (fechamentos >= 3 && etapas.fecharam_followup > etapas.fecharam_call)
    notas.push("A maioria das vendas fecha no follow-up, não na call. O follow-up está sustentando o comercial, e isso costuma significar que a call não está fechando de primeira.");
  if (etapas.compareceram >= AMOSTRA_MINIMA && etapas.recusaram > 0) {
    const r = Math.round(100 * etapas.recusaram / etapas.compareceram);
    if (r >= 50) notas.push(`${r}% de quem senta na reunião recusa. Ou a qualificação está deixando passar quem não pode pagar, ou a oferta não está clara antes da call.`);
  }
  if (total >= 10 && !etapas.agendaram)
    notas.push("Nenhuma reunião agendada com o funil já rodando. O gargalo não é conversão, é que o processo para antes de chegar na call.");

  return {
    amostra: total,
    amostra_suficiente: total >= AMOSTRA_MINIMA,
    passos, gargalo, melhor, notas,
    taxa_geral: total >= AMOSTRA_MINIMA ? Math.round(1000 * fechamentos / total) / 10 : null,
    resumo: !total
      ? "Nenhum lead no sistema ainda. Sem dado não há diagnóstico."
      : total < AMOSTRA_MINIMA
        ? `${total} lead(s) no sistema. Abaixo de ${AMOSTRA_MINIMA} qualquer taxa é ruído: o diagnóstico fica em silêncio de propósito até haver amostra.`
        : gargalo
          ? `Gargalo real: ${ROTULOS_FUNIL[gargalo.de]} para ${ROTULOS_FUNIL[gargalo.para]}, em ${gargalo.taxa}%. Perde ${gargalo.perdidos_aqui} lead(s) aí.`
          : "Nenhuma etapa medida abaixo do piso de referência. O funil está saudável no volume que existe hoje.",
  };
}

/* ═══════════ DIAGNÓSTICO COM IA ═══════════
   Botão, não automático: cada clique é uma chamada paga, e o diagnóstico
   determinístico acima já responde a pergunta na maior parte dos dias.

   Só números agregados vão para a API. Nenhum nome, telefone ou e-mail de
   lead sai daqui.                                                           */
export async function diagnosticoIA(etapas, fin, diag, key) {
  if (!key) return { erro: "Sem OPENAI_API_KEY configurada. O diagnóstico da tela funciona sem ela." };
  if ((etapas.entraram || 0) < AMOSTRA_MINIMA)
    return { erro: `Amostra de ${etapas.entraram || 0} lead(s). Abaixo de ${AMOSTRA_MINIMA} eu não analiso: sairia adivinhação com cara de análise.` };

  const linhas = diag.passos.map((p) =>
    `- ${ROTULOS_FUNIL[p.de]} -> ${ROTULOS_FUNIL[p.para]}: ${p.base} para ${p.chegou}` +
    (p.taxa === null ? " (amostra insuficiente)" : ` = ${p.taxa}% (piso interno ${p.piso}%)`)).join("\n");
  /* A operação fatura em dólar e o fundador vive em real, então os dois vão
     juntos em toda linha. A cotação usada vai declarada: sem isso o modelo
     inventaria uma conversão própria e o número não fecharia com a tela. */
  const dinheiro = fin.n_entradas ? [
    `- cotação de referência usada: R$ ${fin.cotacao.rotulo} por dólar`,
    `- ENTROU na empresa: ${fin.entrou.usd_rot} / ${fin.entrou.brl_rot} em ${fin.n_entradas} entrada(s) de ${fin.n_clientes_com_entrada} cliente(s)`,
    `- desse total, entrou nativo em dólar: ${fin.entrou.nativo_usd_rot}; nativo em real: ${fin.entrou.nativo_brl_rot}`,
    `- contratado (valor total dos contratos): ${fin.contratado.usd_rot} / ${fin.contratado.brl_rot} em ${fin.contratado.n} contrato(s)`,
    fin.mrr.n ? `- mensalidade recorrente somada: ${fin.mrr.usd_rot} / ${fin.mrr.brl_rot} por mês em ${fin.mrr.n} contrato(s)` : "",
    `- ainda a receber: ${fin.a_receber.usd_rot} / ${fin.a_receber.brl_rot}`,
    `- taxas: ${fin.taxas.usd_rot} / ${fin.taxas.brl_rot} · outros custos: ${fin.custos.usd_rot} / ${fin.custos.brl_rot}`,
    `- LUCRO do que entrou: ${fin.lucro.usd_rot} / ${fin.lucro.brl_rot}` +
      (fin.lucro.margem !== null ? ` (margem ${fin.lucro.margem}%)` : ""),
    fin.lucro_por_cliente ? `- lucro por cliente: ${fin.lucro_por_cliente.usd_rot} / ${fin.lucro_por_cliente.brl_rot}` : "",
    fin.por_mes.length ? "- mês a mês do que entrou: " + fin.por_mes.map((m) =>
      `${m.rotulo} ${m.usd_rot}/${m.brl_rot}`).join(", ") : "",
    fin.entrou.pct_estimado_brl ? `- atenção: ${fin.entrou.pct_estimado_brl}% do total em real foi convertido pela cotação de referência, não pela cotação real do dia da entrada` : "",
  ].filter(Boolean).join("\n") : "- nada entrou na empresa ainda";

  const pedido =
`Você é o analista comercial de uma agência enxuta de geração de leads. O cliente dela é
contractor brasileiro nos Estados Unidos (construção e home services, foco Massachusetts).
O fundador opera sozinho: ele mesmo é SDR e closer.

FUNIL (números reais do CRM, período inteiro):
${Object.entries(etapas).map(([k, v]) => `- ${ROTULOS_FUNIL[k] || k}: ${v}`).join("\n")}

TRANSIÇÕES:
${linhas}

FINANCEIRO:
${dinheiro}

Responda SÓ com um objeto JSON:
{
  "dor_real": "a etapa onde o dinheiro está sendo perdido e por que, 2 frases",
  "por_etapa": [{"etapa":"nome da etapa","leitura":"o que o número diz","acao":"uma acao concreta pra essa semana"}],
  "indo_bem": "o que está funcionando e deve ser deixado em paz, 1 frase",
  "financeiro": "leitura de 2 a 3 frases sobre contratado x entrou x lucro, citando dolar E real, e o que fazer com isso",
  "proxima_acao": "a UNICA coisa que ele deveria fazer primeiro, 1 frase"
}

Regras: escreva em português do Brasil. NUNCA use travessão, use vírgula ou dois-pontos.
Não invente número que não está acima, e NÃO converta moeda por conta própria:
os dois valores de cada linha já vêm calculados, use exatamente eles. Se a amostra de uma etapa for pequena, diga isso em
vez de diagnosticar. Nada de jargão de guru (alavancar, sinergia). Seja direto e específico.`;

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o", temperature: 0.4,
                             response_format: { type: "json_object" },
                             messages: [{ role: "user", content: pedido }] }),
    });
    if (!r.ok) return { erro: `A API respondeu ${r.status}. Tente de novo em um minuto.` };
    const j = await r.json();
    const o = JSON.parse(j.choices[0].message.content);
    const txt = (v, n = 600) => (typeof v === "string" ? v.slice(0, n) : "");
    return {
      ok: true, em: new Date().toISOString(),
      dor_real: txt(o.dor_real), indo_bem: txt(o.indo_bem),
      financeiro: txt(o.financeiro), proxima_acao: txt(o.proxima_acao),
      por_etapa: (Array.isArray(o.por_etapa) ? o.por_etapa : []).slice(0, 8).map((x) => ({
        etapa: txt(x?.etapa, 60), leitura: txt(x?.leitura, 300), acao: txt(x?.acao, 300) })),
    };
  } catch (e) {
    console.log("diagnostico IA falhou:", e.message);
    return { erro: "Não consegui falar com a API agora. O diagnóstico da tela continua valendo." };
  }
}
