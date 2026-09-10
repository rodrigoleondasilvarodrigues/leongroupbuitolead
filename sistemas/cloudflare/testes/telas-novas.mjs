/* Renderiza no navegador simulado as telas NOVAS: o dashboard comercial e as
   seções novas do card do cliente (portão de conclusão, logo, peças).

   Por que este teste existe: `node --check` vê o HTML como uma string, e o
   teste de sintaxe só garante que compila. O que derruba na prática é código
   que compila e mesmo assim estoura ao desenhar, e o resultado é tela branca
   sem nenhuma mensagem. Aqui cada tela é desenhada de verdade e conferida.

   Rode com: node testes/telas-novas.mjs                                    */
import { ADMIN_HTML } from "../src/admin.js";
import { financeiroTotal, financeiroDoCliente } from "../src/funil.js";
import { JSDOM } from "jsdom";

let ok = 0, mal = 0;
const t = (n, c, d = "") => { c ? (ok++, console.log(`  \x1b[32mv\x1b[0m ${n}${d ? "  -> " + d : ""}`))
                                : (mal++, console.log(`  \x1b[31mX\x1b[0m ${n}${d ? "  -> " + d : ""}`)) };

const PIPES = {
  leads_novos: [["super_hot", "Super Hot"], ["hot", "Hot"]],
  agendamento: [["call_agendado", "Call Agendado"], ["fechou", "Fechou"]],
  recuperacao: [["recuperacao", "Recuperação"]], nutricao: [["nutricao", "Nutrição"]],
};
const ENTREGAVEIS = [["gmb", "Google Meu Negócio"], ["site", "Site"],
                     ["instagram", "Instagram (12 posts + 4 destaques)"], ["logo", "Logo"]];

const PAINEL = {
  leads: [{ id: 1, nome: "Marcos Ribeiro", empresa: "Ribeiro Hardwood", telefone: "+15085550142",
    nicho: "Flooring", cidade: "Framingham", estado: "MA", pipeline: "leads_novos",
    coluna: "super_hot", entrou_coluna_em: new Date().toISOString() }],
  clientes: [{ id: 7, empresa: "Ribeiro Hardwood", nome_contato: "Marcos", nicho: "Flooring",
    dias: 3, dias_uteis: 2, entrega_iniciada_em: new Date().toISOString(),
    valor_contrato: "US$ 2.500", valor_pago: "US$ 2.500", pagamento_confirmado: 1,
    entregaveis: [], reviews_total: 20, reviews_postadas: 3, marcos_total: 11, marcos_feitos: 4,
    midias: { foto: 12 }, arquivos_agencia: 6, entrega_completa: false, atrasado: false,
    renovacao_perto: false, dias_para_renovar: 80, portao_cumprido: false, entrega_forcada: 0 }],
  pipelines: PIPES, ativacoes: { super_hot: 10, hot: 7 },
  catalogo: [["ligacao", "Ligação"]], entregaveis: ENTREGAVEIS,
  kpis: { etapas: { whatsapp: 1, ligacao_atendida: 0, call_marcada: 0, call_comparecida: 0, call_fechada: 0 }, alertas: [] },
  sem_r2: false,
};

/* O financeiro do mock sai da função REAL (`financeiroTotal`), não de um
   objeto escrito à mão. Assim o teste não passa a testar um formato que o
   servidor deixou de mandar, que é o jeito mais silencioso de um teste
   apodrecer.

   O cenário: fatura em dólar, vive no Brasil. Um cliente TCV pago em dólar
   com cotação registrada, um MRR pago em dois meses com cotações diferentes,
   um cliente que recebeu em real, e um que fechou e não pagou nada. */
const CLIS_FIN = [
  { id: 7, empresa: "Ribeiro Hardwood", tipo_contrato: "TCV", valor_contrato: "US$ 2.500",
    taxa_percentual: "5", custos_valor: "540", custos_moeda: "BRL" },
  { id: 8, empresa: "Silva Painting", tipo_contrato: "MRR", valor_contrato: "US$ 1.200",
    duracao_meses: 6, taxa_percentual: "5" },
  { id: 9, empresa: "Costa Roofing", tipo_contrato: "TCV", valor_contrato: "R$ 9.000" },
  { id: 10, empresa: "Alves Gutters", tipo_contrato: "TCV", valor_contrato: "US$ 3.000" },
];
const ENTRADAS_FIN = [
  { id: 1, cliente_id: 7, valor: "2500", moeda: "USD", cotacao: "5.20",
    recebido_em: "2026-02-14", meio: "Wise", parcela: "pagamento único" },
  { id: 2, cliente_id: 8, valor: "1200", moeda: "USD", cotacao: "5.15",
    recebido_em: "2026-02-05", meio: "Zelle", parcela: "mês 1 de 6" },
  { id: 3, cliente_id: 8, valor: "1200", moeda: "USD", cotacao: null,
    recebido_em: "2026-03-05", meio: "Zelle", parcela: "mês 2 de 6" },
  { id: 4, cliente_id: 9, valor: "4500", moeda: "BRL", cotacao: "5.30",
    recebido_em: "2026-03-20", meio: "PIX", parcela: "entrada" },
];
/* Saídas cobrindo os casos que importam: gasto em real, gasto em dólar (o do
   cartão, que fecha pela cotação do dia), despesa mensal recorrente, custo
   preso a um cliente, e um gasto sem cotação registrada. */
const SAIDAS_FIN = [
  { id: 1, valor: "1800", moeda: "BRL", cotacao: "5.20", pago_em: "2026-02-10",
    categoria: "anuncios", descricao: "Meta Ads fevereiro" },
  { id: 2, valor: "100", moeda: "USD", cotacao: "5.25", pago_em: "2026-02-01",
    categoria: "infra", descricao: "Z-API", recorrente: 1 },
  { id: 3, valor: "60", moeda: "USD", cotacao: null, pago_em: "2026-02-01",
    categoria: "ferramentas", descricao: "Canva e IA", recorrente: 1 },
  { id: 4, valor: "400", moeda: "BRL", cotacao: "5.30", pago_em: "2026-03-05",
    categoria: "contador", descricao: "honorário", recorrente: 1 },
  { id: 5, valor: "250", moeda: "USD", cotacao: "5.30", pago_em: "2026-03-12",
    categoria: "terceiros", descricao: "edição de vídeo", cliente_id: 7 },
  { id: 6, valor: "2500", moeda: "BRL", cotacao: "5.30", pago_em: "2026-03-20",
    categoria: "anuncios", descricao: "Meta Ads março" },
];
const FIN = financeiroTotal(CLIS_FIN, ENTRADAS_FIN,
  { valor: "5.40", em: "2026-09-08T12:00:00Z", fonte: "digitada por você" }, SAIDAS_FIN);

/* Dashboard com o funil apertado no meio: 100 entram, 60 agendam, 12
   comparecem. O gargalo tem que ser agendaram -> compareceram. */
const DASHBOARD = {
  etapas: { entraram: 100, responderam: 80, agendaram: 60, compareceram: 12,
            recusaram: 6, fecharam_call: 4, fecharam_followup: 2, fecharam: 6, perdidos: 20 },
  clientes_ativos: 1,
  rotulos: { entraram: "Entraram", responderam: "Responderam", agendaram: "Agendaram reunião",
    compareceram: "Compareceram", recusaram: "Recusaram na call", fecharam_call: "Fecharam na call",
    fecharam_followup: "Fecharam no follow-up", fecharam: "Fecharam (total)", perdidos: "Perdidos" },
  financeiro: FIN,
  diagnostico: {
    amostra: 100, amostra_suficiente: true, taxa_geral: 6,
    passos: [
      { de: "entraram", para: "responderam", base: 100, chegou: 80, taxa: 80, piso: 40,
        estado: "bom", perdidos_aqui: 20, sem_amostra: false, faltam_para_medir: 0,
        dor: "x", acao: "y" },
      { de: "responderam", para: "agendaram", base: 80, chegou: 60, taxa: 75, piso: 40,
        estado: "bom", perdidos_aqui: 20, sem_amostra: false, faltam_para_medir: 0, dor: "x", acao: "y" },
      { de: "agendaram", para: "compareceram", base: 60, chegou: 12, taxa: 20, piso: 50,
        estado: "ruim", perdidos_aqui: 48, sem_amostra: false, faltam_para_medir: 0,
        dor: "Marcam e não aparecem.", acao: "A cadência de confirmação já roda sozinha." },
      { de: "compareceram", para: "fecharam", base: 12, chegou: 6, taxa: 50, piso: 30,
        estado: "bom", perdidos_aqui: 6, sem_amostra: false, faltam_para_medir: 0, dor: "x", acao: "y" },
    ],
    gargalo: { de: "agendaram", para: "compareceram", taxa: 20, piso: 50, perdidos_aqui: 48,
      dor: "Marcam e não aparecem.", acao: "A cadência de confirmação já roda sozinha." },
    melhor: { de: "entraram", para: "responderam", taxa: 80, piso: 40 },
    notas: ["A maioria das vendas fecha no follow-up, não na call."],
    resumo: "Gargalo real: Agendaram reunião para Compareceram, em 20%.",
  },
  ia_disponivel: true,
};

const IA = { ok: true, em: new Date().toISOString(),
  dor_real: "O no-show está comendo 48 leads.",
  por_etapa: [{ etapa: "Agendaram", leitura: "20% comparecem", acao: "Marcar para o dia seguinte." }],
  indo_bem: "A resposta ao primeiro contato está alta.",
  financeiro: "Metade do contratado ainda não entrou.",
  proxima_acao: "Ligar 30 minutos antes de cada call." };

/* Cliente com: portão aberto nos 3 grupos que travam, briefing de logo
   preenchido, prompt já gerado, e peças parcialmente subidas. */
const CATALOGO_ARQ = [
  { destino: "logo", dia: 1, rotulo: "Logo", nota: "Primeiro de tudo.",
    slots: [{ slot: "principal", rotulo: "Principal (PNG transparente)", minimo: 1, max: 3, dica: "Fundo transparente." },
            { slot: "favicon", rotulo: "Ícone quadrado", minimo: 1, max: 2, dica: "Só o símbolo." }] },
  { destino: "instagram", dia: 2, rotulo: "Instagram", nota: "Artes finalizadas.",
    slots: [{ slot: "posts", rotulo: "Artes dos 12 posts", minimo: 12, max: 30, dica: "1080x1350." }] },
];
const arq = (id, destino, slot) => ({ id, destino, slot, origem: "agencia",
  mime: "image/png", nome: "peca.png", url: "/m/c7/" + String(id).padStart(32, "0") + ".png" });
const CLIENTE = {
  id: 7, empresa: "Ribeiro Hardwood", nome_contato: "Marcos", dias: 3, nicho: "Flooring",
  slug: "ribeiro-hardwood", formulario_token: "tok123", formulario_em: new Date().toISOString(),
  contrato_assinado: 1, pagamento_confirmado: 1, valor_contrato: "US$ 2.500",
  valor_pago: "US$ 2.500", taxa_percentual: "5", custos_valor: "US$ 100", custos_nota: "hospedagem",
  entrega_iniciada_em: new Date().toISOString(), prazo_final: new Date().toISOString(),
  dias_uteis: 2, prazo_maximo: 5, dias_para_renovar: 80, renovado_vezes: 0,
  cidade: "Framingham", estado: "MA", telefone: "+15085550142", nome_dono: "Marcos",
  servicos: "Hardwood, Tile", diferencial: "equipe própria", observacoes: "",
  tempo_mercado: "8 anos", localizacoes: "Framingham, Natick", faz: "piso", nao_faz: "comercial",
  cor_primaria: "#1B4965", cor_destaque: "#F6AE2D", grupo_whatsapp: "", vercel_url: "",
  tem_logo: 0, cores: "azul escuro e dourado",
  logo_estilo: "moderna e limpa", logo_simbolo: "uma tábua de madeira",
  logo_evitar: "nada de casinha", logo_referencias: "Bosch",
  logo_texto: "Ribeiro Hardwood Flooring", logo_slogan: "Quality you can walk on",
  logo_prompt: JSON.stringify({ task: "Design a logo", brand: { trade: "flooring" } }, null, 2),
  logo_prompt_em: new Date().toISOString(),
  entregaveis: [{ id: 1, tipo: "gmb", status: "pendente" }, { id: 2, tipo: "site", status: "em_producao" },
                { id: 3, tipo: "instagram", status: "pendente" }, { id: 4, tipo: "logo", status: "pendente" }],
  reviews: [], posts: [], midias: [], checklist: [
    { id: 1, area: "gbp", item: "Perfil verificado", detalhe: "passo a passo", obrigatorio: 1, feito: 0 },
    { id: 2, area: "site", item: "Telefone clicável", detalhe: "link tel:", obrigatorio: 1, feito: 1 }],
  marcos: [{ id: 1, marco: "Grupo do WhatsApp criado [agência]", prazo_dias: 1, concluido: 0 },
           { id: 2, marco: "Site no ar [agência]", prazo_dias: 1, concluido: 1 }],
  arquivos: [arq(1, "logo", "principal"), arq(2, "logo", "principal")],
  pecas: [
    { ...CATALOGO_ARQ[0], completo: false, tem: 2, falta: 1,
      slots: [{ ...CATALOGO_ARQ[0].slots[0], arquivos: [arq(1, "logo", "principal"), arq(2, "logo", "principal")], tem: 2, falta: 0, completo: true },
              { ...CATALOGO_ARQ[0].slots[1], arquivos: [], tem: 0, falta: 1, completo: false }] },
    { ...CATALOGO_ARQ[1], completo: false, tem: 0, falta: 12,
      slots: [{ ...CATALOGO_ARQ[1].slots[0], arquivos: [], tem: 0, falta: 12, completo: false }] },
  ],
  catalogo_arquivos: CATALOGO_ARQ,
  entradas: ENTRADAS_FIN.filter((e) => e.cliente_id === 7),
  cotacao_ref: 5.40, cotacao_em: "2026-09-08T12:00:00Z", cotacao_padrao: false,
  financeiro: financeiroDoCliente(CLIS_FIN[0], ENTRADAS_FIN, 5.40, SAIDAS_FIN),
  marcos_total: 2, marcos_feitos: 1, chk_total: 2, chk_feitos: 1, ent_total: 4, ent_feitos: 0,
  entrega_completa: false, atrasado: false,
  trava_entrega: "Marcos da cadência: 1 de 2 aberto(s) · Entregáveis: 4 de 4 aberto(s)",
  proximo_passo: ["Faça a logo primeiro", "O cliente não tinha logo."],
  portao: {
    grupos: [
      { chave: "marcos", rotulo: "Marcos da cadência", trava: true, feitos: 1, total: 2,
        onde: "Seção “Cadência de entrega”, no card", porque: "São os 11 passos dos 5 dias úteis." },
      { chave: "checklist", rotulo: "Checklist obrigatório", trava: true, feitos: 1, total: 2,
        onde: "Seção “Checklist de otimização”", porque: "É onde mora o Google Meu Negócio." },
      { chave: "entregaveis", rotulo: "Entregáveis", trava: true, feitos: 0, total: 4,
        abertos: ["Google Meu Negócio", "Site", "Instagram (12 posts + 4 destaques)", "Logo"],
        onde: "Seção “Entregáveis”", porque: "É o que foi vendido." },
      { chave: "arquivos", rotulo: "Arquivos das peças", trava: false, feitos: 1, total: 3,
        abertos: ["Ícone quadrado (falta 1)", "Artes dos 12 posts (falta 12)"],
        onde: "Seção “Peças e arquivos”", porque: "Não trava a conclusão." },
    ],
    pendencias: [{ chave: "marcos", rotulo: "Marcos da cadência: 1 de 2 aberto(s)" },
                 { chave: "checklist", rotulo: "Checklist obrigatório: 1 de 2 aberto(s)" },
                 { chave: "entregaveis", rotulo: "Entregáveis: 4 de 4 aberto(s)" }],
    cumprido: false, concluida: false, forcada: false,
    forcada_em: null, forcada_nota: null, forcada_pendencias: null,
    frase_confirmacao: "SERVIÇO ENTREGUE ANTES DO TEMPO",
  },
};

const erros = [];

/* `let` no topo de um <script> clássico NÃO vira propriedade de window, então
   o teste não consegue (e não deve) mexer em D, DASH, aba ou setor por fora.
   Tudo é dirigido pelos pontos de entrada de verdade: clicar na aba, trocar a
   resposta do servidor e chamar carregar(). É mais perto do uso real.       */
const RESP = { painel: PAINEL, dashboard: DASHBOARD, cliente: CLIENTE, ia: IA,
  prompt: { ok: true, prompt: '{"task":"logo"}', falta: [], rationale: null } };

const dom = new JSDOM(ADMIN_HTML, { runScripts: "dangerously",
  url: "https://leon-group.workers.dev/", pretendToBeVisual: true,
  beforeParse(w) {
    w.fetch = (u) => Promise.resolve({ ok: true, json: () => Promise.resolve(
      String(u).startsWith("/api/painel") ? RESP.painel :
      String(u).startsWith("/api/dashboard") ? RESP.dashboard :
      String(u).startsWith("/api/cliente?") ? RESP.cliente :
      String(u).startsWith("/api/diagnostico-ia") ? RESP.ia :
      String(u).startsWith("/api/prompt-logo") ? RESP.prompt :
      { ok: true }) });
    w.alert = (m) => { w.__alert = m; };
    w.confirm = () => true;
    w.prompt = () => "SERVIÇO ENTREGUE ANTES DO TEMPO";
    w.addEventListener("error", (e) => erros.push(String(e.error || e.message)));
  } });
const w = dom.window, doc = w.document;
const $ = (s) => doc.querySelector(s), $$ = (s) => [...doc.querySelectorAll(s)];
const txt = () => doc.body.textContent;
const espera = (ms = 40) => new Promise((r) => setTimeout(r, ms));

setTimeout(async () => {
  await espera(120);

  console.log("\n\x1b[1m=== 1. AS FUNÇÕES NOVAS EXISTEM ===\x1b[0m");
  const fns = ["carregarCaixa", "renderCaixa", "blocoExtrato", "salvarSaida", "editarSaida",
               "apagarSaida", "abrirLancarSaida", "irMes", "mudarMes", "filtrarTipo",
               "carregarDash", "renderDash", "blocoDiag", "blocoGrana", "rodarIA", "pintarIA",
               "l_portao", "l_logo", "l_pecas", "l_entradas", "concluirAntes", "reabrirEntrega",
               "gerarPromptLogo", "copiarPrompt", "subirPeca", "apagarPeca", "marcarDashSujo",
               "mexerCotacao", "salvarEntrada", "editarEntrada", "apagarEntrada", "limparEntrada"];
  t("todas carregaram", fns.every((f) => typeof w[f] === "function"),
    fns.filter((f) => typeof w[f] !== "function").join(", ") || `${fns.length} funções`);
  t("nenhum erro de JS ao montar", erros.length === 0, erros.join(" | ") || "limpo");

  console.log("\n\x1b[1m=== 2. O FUNIL É UM FUNIL ===\x1b[0m");
  const abaDash = $$("#abas button").find((b) => /Dashboard/.test(b.textContent));
  t("a aba Dashboard existe no comercial", !!abaDash);
  abaDash.click();                      // o mesmo caminho do clique de verdade
  await espera(80);

  t("o bloco do funil existe", !!$(".funil"));
  t("cinco etapas desenhadas", $$(".fx-l").length === 5,
    $$(".fx-rot").map((x) => x.textContent.split("\n")[0].trim()).join(" → "));
  t("quatro transições entre elas", $$(".fx-p").length === 4);
  t("cada etapa tem faixa e número", $$(".fx-faixa").length === 5 && $$(".fx-n").length === 5);

  /* A GEOMETRIA. É aqui que um funil mente ou não mente: a largura do topo de
     cada faixa tem que ser o valor da etapa sobre o valor de quem entrou.
     Cenário: 100 / 80 / 60 / 12 / 6 leads. */
  const larguras = $$(".fx-faixa i").map((el) => {
    const m = el.getAttribute("style").match(/polygon\(([\d.]+)% 0,([\d.]+)% 0/);
    return m ? Math.round((Number(m[2]) - Number(m[1])) * 10) / 10 : null;
  });
  t("largura do topo proporcional ao valor da etapa",
    JSON.stringify(larguras) === JSON.stringify([100, 80, 60, 12, 6]),
    larguras.join(" / ") + " (esperado 100/80/60/12/6)");
  t("todas as faixas centradas", $$(".fx-faixa i").every((el) => {
    const m = el.getAttribute("style").match(/polygon\(([\d.]+)% 0,([\d.]+)% 0/);
    return Math.abs((Number(m[1]) + Number(m[2])) / 2 - 50) < 0.01;
  }));
  t("a base de cada faixa encosta no topo da seguinte, formando o afunilamento",
    (() => {
      const bases = $$(".fx-faixa i").map((el) => {
        const m = el.getAttribute("style").match(/([\d.]+)% 100%,([\d.]+)% 100%/);
        return m ? Math.round((Number(m[1]) - Number(m[2])) * 10) / 10 : null;
      });
      // base da faixa i = topo da faixa i+1
      return bases.slice(0, 4).every((b, i) => Math.abs(b - larguras[i + 1]) < 0.2);
    })());
  /* A altura constante é o ponto do desenho: trapézio de altura variável
     distorce a área e faz o olho ler diferença pequena errado. */
  t("altura da faixa é constante e declarada no CSS, não por valor",
    /\.fx-faixa\{[^}]*height:44px/.test(ADMIN_HTML)
    && !$$(".fx-faixa").some((el) => /height/.test(el.getAttribute("style") || "")));
  t("nenhum gradiente, sombra ou 3D no funil",
    !/\.fx-faixa[^}]*(gradient|box-shadow|perspective)/.test(ADMIN_HTML));

  console.log("\n\x1b[1m=== 2b. O FUNIL DIZ ONDE DÓI ===\x1b[0m");
  t("a etapa depois da transição ruim é a única pintada de dor",
    $$(".fx-faixa.dor").length === 1, $$(".fx-faixa.dor").length + " faixa(s)");
  t("e é a etapa certa (compareceram, que recebe os 20%)",
    $$(".fx-l")[3].querySelector(".fx-faixa").classList.contains("dor"));
  t("a etapa final é marcada como fechamento", $$(".fx-faixa.fim").length === 1);
  t("cada transição mostra a taxa", $$(".fx-p .tag").length === 4,
    $$(".fx-p .tag").map((x) => x.textContent).join(" "));
  t("a transição ruim tem a tag de ruim", $$(".fx-p .tag.ruim").length === 1);
  t("mostra quantos pararam em cada passagem", /48 pararam aqui/.test(txt()));
  t("mostra o piso de referência de cada passagem", /piso 50%/.test(txt()));
  t("cada etapa diz o % de quem entrou", /% de quem entrou/.test(txt()));

  console.log("\n\x1b[1m=== 2c. AS SAÍDAS LATERAIS ===\x1b[0m");
  t("os quatro cartões de saída", $$(".fg").length === 4,
    $$(".fg span").map((x) => x.textContent).join(" · "));
  t("fechamento separado em call e follow-up",
    /Fecharam na call/.test(txt()) && /Fecharam no follow-up/.test(txt()));
  t("recusa e perda aparecem em cor de perda", $$(".fg.perdeu").length === 2);

  console.log("\n\x1b[1m=== 2d. DADO TORTO NÃO É DESENHADO EM SILÊNCIO ===\x1b[0m");
  /* Se alguém foi movido para frente sem passar pela etapa do meio, uma etapa
     fica maior que a anterior. O funil não pode alargar como se fosse normal. */
  RESP.dashboard = { ...DASHBOARD,
    etapas: { ...DASHBOARD.etapas, responderam: 30, agendaram: 60 } };
  await w.carregarDash(true);
  await espera(60);
  t("avisa que o dado está torto", !!$(".fx-anom"));
  t("nomeia a etapa impossível", /Agendaram reunião/.test($(".fx-anom").textContent));
  t("e trava a largura na etapa anterior, sem alargar", (() => {
    const l = $$(".fx-faixa i").map((el) => {
      const m = el.getAttribute("style").match(/polygon\(([\d.]+)% 0,([\d.]+)% 0/);
      return Math.round((Number(m[2]) - Number(m[1])) * 10) / 10;
    });
    // 100 / 30 / travado em 30 / 12 / 6, nunca crescendo
    return l.every((v, i) => i === 0 || v <= l[i - 1] + 0.01);
  })(), $$(".fx-faixa i").map((el) => {
    const m = el.getAttribute("style").match(/polygon\(([\d.]+)% 0,([\d.]+)% 0/);
    return Math.round(Number(m[2]) - Number(m[1]));
  }).join(" / "));
  RESP.dashboard = DASHBOARD;
  await w.carregarDash(true);
  await espera(60);

  console.log("\n\x1b[1m=== 3. DIAGNÓSTICO NA TELA ===\x1b[0m");
  t("bloco de diagnóstico existe", !!$(".diag"));
  t("nomeia o gargalo", /Marcam e n[ãa]o aparecem/.test(txt()));
  t("mostra a taxa do gargalo e o piso", /20%/.test(txt()) && /50%/.test(txt()));
  t("diz quantos leads param ali", /48/.test(txt()));
  t("diz o que está indo bem", /Funcionando/.test(txt()));
  t("traz a nota do follow-up", /follow-up/i.test(txt()));
  t("tem a caixa de primeira ação", !!$(".acao-cx"));

  console.log("\n\x1b[1m=== 4. DINHEIRO NAS DUAS MOEDAS ===\x1b[0m");
  /* Ele fatura em dólar e vive em real. A tela tem que dar os dois números
     sem que ele precise fazer conta nenhuma de cabeça. */
  t("o bloco do que entrou existe", !!$(".entrou-cx"));
  /* Aritmética das 4 entradas do cenário, entrada por entrada:
       2500 USD @ 5,20  ->  US$ 2500,00   R$ 13.000,00
       1200 USD @ 5,15  ->  US$ 1200,00   R$  6.180,00
       1200 USD sem cotação, cai na referência 5,40
                        ->  US$ 1200,00   R$  6.480,00   estimado
       4500 BRL @ 5,30  ->  US$  849,06   R$  4.500,00
       ----------------------------------------------------------
       total            ->  US$ 5.749,06  R$ 30.160,00              */
  t("mostra o total em dólar", /US\$ 5\.749,06/.test(txt()),
    $(".entrou-cx .usd .v") && $(".entrou-cx .usd .v").textContent);
  t("e o total em real, lado a lado", /R\$ 30\.160,00/.test(txt()),
    $(".entrou-cx .brl .v") && $(".entrou-cx .brl .v").textContent);
  t("diz quantas entradas e de quantos clientes", /4 entrada\(s\) de 3 cliente\(s\)/.test(txt()));
  t("separa o que veio nativo em dólar", /faturado direto em dólar/.test(txt()));
  t("e o que veio nativo em real", /recebido direto em real/.test(txt()));
  t("declara a cotação de referência usada", /R\$ 5,40<\/b> por dólar/.test($(".entrou-rod").innerHTML));
  t("oferece atualizar a cotação", !!$(".cot-bt"));

  console.log("\n\x1b[1m=== 4b. HONESTIDADE SOBRE A CONVERSÃO ===\x1b[0m");
  /* Uma das 4 entradas não tem cotação registrada. A tela tem que dizer que
     aquele pedaço do total em real é estimativa, e qual o peso dela. */
  // R$ 6.480 de R$ 30.160 vieram da cotação de referência = 21%
  t("marca a fatia estimada em %", FIN.entrou.pct_estimado_brl === 21,
    FIN.entrou.pct_estimado_brl + "%");
  t("e diz isso na tela", /21% convertido pela cotação de referência/.test(txt()));
  t("com o aviso grande, porque passa de 20%", !!$(".aviso-cot"));
  t("o aviso explica onde resolver", /seção <b>Entradas<\/b>/.test($(".aviso-cot").innerHTML));

  console.log("\n\x1b[1m=== 4c. DO CONTRATO AO LUCRO ===\x1b[0m");
  const duo = $$(".d2").map((d) => d.querySelector(".r").textContent);
  t("os 8 cartões, cada um nas duas moedas", $$(".d2").length === 8, duo.join(" · "));
  t("todo cartão traz dólar e real", $$(".d2").every((d) =>
    /US\$/.test(d.querySelector(".u").textContent) && /R\$/.test(d.querySelector(".b").textContent)));
  // 2500 (TCV) + 1200x6=7200 (MRR) + 9000/5,40=1666,67 (contrato em real) + 3000
  t("contratado soma o MRR pela duração, não pela mensalidade",
    FIN.contratado.usd.toFixed(2) === "14366.67",
    "US$ " + FIN.contratado.usd.toFixed(2));
  t("cartão de mensalidade recorrente aparece", duo.includes("Mensalidade recorrente"));
  t("cartão de a receber aparece", duo.includes("Ainda a receber"));
  t("cartão de lucro aparece em destaque", $$(".d2.forte").length === 2);
  t("lucro por cliente divide pelos que pagaram, não pelos que fecharam",
    FIN.n_clientes_com_entrada === 3, FIN.n_clientes_com_entrada + " clientes");

  console.log("\n\x1b[1m=== 4d. MÊS A MÊS ===\x1b[0m");
  t("a tabela de meses existe", !!$(".mes-t"));
  // fev (05/02 e 14/02) e mar (05/03 e 20/03): dois meses, quatro entradas
  t("dois meses com entrada, com as do mesmo mês somadas",
    $$(".mes-l").length === 3,   // 1 cabeçalho + 2 meses
    $$(".mes-l:not(.cab) .rot").map((x) => x.textContent).join(" "));
  t("fevereiro soma as duas entradas do mês: 13000 + 6180",
    /R\$ 19\.180,00/.test($$(".mes-l")[1].textContent),
    $$(".mes-l")[1].textContent.trim().replace(/\s+/g, " "));
  t("em ordem cronológica",
    $$(".mes-l:not(.cab) .rot").map((x) => x.textContent).join(" ") === "fev/26 mar/26",
    $$(".mes-l:not(.cab) .rot").map((x) => x.textContent).join(" "));
  t("cada mês com os dois valores", $$(".mes-l:not(.cab)").every((l) =>
    /US\$/.test(l.textContent) && /R\$/.test(l.textContent)));

  console.log("\n\x1b[1m=== 4e. CLIENTE POR CLIENTE ===\x1b[0m");
  t("a lista por cliente existe", !!$(".cli-t"));
  t("os 4 clientes aparecem", $$(".cli-l").length === 4, $$(".cli-l").length + " linhas");
  t("marca qual contrato é recorrente",
    $$(".cli-l .tipo").some((x) => /MRR 6m/.test(x.textContent)));
  t("lista as entradas de cada um com a data", /05\/02\/2026/.test(txt()));
  t("mostra a cotação usada em cada entrada", /\(cotação 5,20\)/.test(txt()));
  t("e marca a entrada sem cotação como estimada", /cotação estimada em 5,40/.test(txt()));
  t("quem fechou e não pagou aparece com a pendência",
    /nada entrou ainda/.test(txt()));

  console.log("\n\x1b[1m=== 5. DASHBOARD VAZIO NÃO INVENTA ===\x1b[0m");
  RESP.dashboard = { ...DASHBOARD, etapas: { entraram: 0, responderam: 0, agendaram: 0,
    compareceram: 0, recusaram: 0, fecharam_call: 0, fecharam_followup: 0, fecharam: 0, perdidos: 0 } };
  await w.carregarDash(true);
  await espera(60);
  t("mostra o estado vazio", /Nenhum lead no sistema ainda/.test(txt()));
  t("não desenha barra de funil", $$(".et").length === 0);
  t("diz que fica vazio de propósito", /de prop[óo]sito/.test(txt()));
  RESP.dashboard = DASHBOARD;
  await w.carregarDash(true);
  await espera(60);

  console.log("\n\x1b[1m=== 6. DIAGNÓSTICO DA IA ===\x1b[0m");
  const btn = $$(".ia-cx button")[0];
  t("botão da IA existe", !!btn, btn && btn.textContent.trim());
  await w.rodarIA(btn);
  await espera(40);
  t("saída da IA apareceu", $("#ia_saida").classList.contains("on"));
  t("traz a dor real", /48 leads/.test(txt()));
  t("traz a próxima ação", /30 minutos antes/.test(txt()));
  t("avisa para conferir antes de agir", /Confira contra a sua leitura/.test(txt()));

  console.log("\n\x1b[1m=== 6b. CAIXA: O APP DE GASTOS ===\x1b[0m");
  const abaCaixa = $$("#abas button").find((b) => b.textContent.trim() === "Caixa");
  t("a aba Caixa existe no comercial", !!abaCaixa);
  abaCaixa.click();
  await espera(90);

  t("o cartão de saldo está no topo", !!$(".cx-topo"));
  t("mostra entrou, saiu e saldo, nessa ordem",
    $$(".cx-tri .r").map((x) => x.textContent).join("|") === "Entrou|Saiu|Sobrou no caixa",
    $$(".cx-tri .r").map((x) => x.textContent).join(" | "));
  t("cada um dos três em dólar E em real",
    $$(".cx-tri .u").length === 3 && $$(".cx-tri .b").length === 3
    && $$(".cx-tri .u").every((x) => /US\$/.test(x.textContent))
    && $$(".cx-tri .b").every((x) => /R\$/.test(x.textContent)));
  /* A conta do cenário, conferida à mão:
       entrou   US$ 5.749,06   R$ 30.160,00   (4 entradas)
       saiu     US$ 1.303,32   R$  6.874,00   (6 despesas)
       taxa     US$   245,00   R$  1.283,00   (5% dos clientes 7 e 8)
       ---------------------------------------------------------
       saldo    US$ 4.200,73   R$ 22.003,00
     A taxa em real é a soma das taxas de cada entrada, não a taxa total
     rateada por um percentual médio: com clientes de taxas diferentes as duas
     contas divergem, e a média dava R$ 2,29 a mais. */
  t("o saldo é entrou menos tudo que saiu, incluindo a taxa",
    /US\$ 4\.200,73/.test(txt()), $(".cx-tri .saldo .u").textContent);
  t("e o mesmo saldo em real, pela soma exata das taxas",
    /R\$ 22\.003,00/.test(txt()), $(".cx-tri .saldo .b").textContent);
  t("diz quanto sobrou de cada real que entrou", /% do que entrou/.test(txt()));
  t("o rodapé traz o custo fixo mensal", /Custo fixo mensal/.test(txt()));
  t("e separa lucro nos clientes de custo da operação",
    /Lucro nos clientes/.test(txt()) && /custo da operação/.test(txt()));

  console.log("\n\x1b[1m=== 6c. PARA ONDE FOI O DINHEIRO ===\x1b[0m");
  t("o bloco de categorias existe", !!$(".cat-cx"));
  t("categorias ordenadas da maior para a menor", (() => {
    const p = $$(".cat-l .pct").map((x) => parseFloat(x.textContent));
    return p.every((v, i) => i === 0 || v <= p[i - 1]);
  })(), $$(".cat-l .rot").map((x) => x.textContent).join(" > "));
  t("anúncios é o maior gasto do período", /Anúncios/.test($(".cat-l .rot").textContent),
    $(".cat-l .rot").textContent);
  t("cada categoria tem barra, percentual e valor nas duas moedas",
    $$(".cat-l").every((l) => l.querySelector(".bar i") && l.querySelector(".pct")
      && /US\$/.test(l.querySelector(".val b").textContent)
      && /R\$/.test(l.querySelector(".val span").textContent)));

  console.log("\n\x1b[1m=== 6d. EXTRATO AGRUPADO POR DIA ===\x1b[0m");
  t("o extrato existe", !!$(".ext"));
  t("dez lançamentos: 4 entradas + 6 saídas", $$(".ext-l").length === 10,
    $$(".ext-l").length + " linhas");
  t("agrupado por dia, com cabeçalho de data", $$(".ext-dia").length > 0,
    $$(".ext-dia span")[0].textContent);
  t("do mais recente para o mais antigo", (() => {
    const d = $$(".ext-dia span").map((x) => x.textContent);
    return /20 de março/.test(d[0]);
  })(), $$(".ext-dia span").map((x) => x.textContent).join(" | "));
  t("o dia mostra o próprio saldo, para conferir contra o banco",
    $$(".ext-dia em").length === $$(".ext-dia").length);
  t("entrada e saída separadas por classe",
    $$(".ext-l.mais").length === 4 && $$(".ext-l.menos").length === 6);
  t("com sinal de mais e de menos", $$(".ext-l.mais .sinal")[0].textContent === "+"
    && $$(".ext-l.menos .sinal")[0].textContent === "\u2212");
  t("cada linha nas duas moedas", $$(".ext-l").every((l) =>
    /US\$/.test(l.querySelector(".vl b").textContent)
    && /R\$/.test(l.querySelector(".vl span").textContent)));
  t("despesa mensal marcada como mensal", $$(".ext-l .tag.rec").length === 3,
    $$(".ext-l .tag.rec").length + " marcadas");
  t("gasto sem cotação marcado como estimado", $$(".ext-l .tag.est").length >= 1);
  t("saída dá para editar e apagar", $$(".ext-l.menos .bts button").length === 12);
  t("entrada leva para o cliente, não é editada aqui",
    $$(".ext-l.mais .bts button").every((b) => /abrir cliente/.test(b.textContent)));

  console.log("\n\x1b[1m=== 6e. NAVEGAÇÃO POR MÊS ===\x1b[0m");
  t("começa em Tudo", /Tudo/.test($(".cx-mes .atual").textContent),
    $(".cx-mes .atual").textContent);
  t("os meses com movimento viraram botão",
    $$(".cx-mes button").some((b) => /fev\/26/.test(b.textContent))
    && $$(".cx-mes button").some((b) => /mar\/26/.test(b.textContent)));
  w.irMes("2026-02");
  await espera(50);
  t("escolhendo fevereiro, o título vira o mês",
    /fevereiro de 2026/.test($(".cx-mes .atual").textContent),
    $(".cx-mes .atual").textContent);
  /* fev: entrou 2500+1200 = 3700 · saiu 1800/5,20 + 100 + 60 = 506,15 */
  t("os totais passam a ser só do mês", /US\$ 3\.700,00/.test(txt()),
    $(".cx-tri .entrou .u").textContent);
  t("e a saída também", /US\$ 506,15/.test($(".cx-tri .saiu .u").textContent)
    || /US\$ 691,15/.test($(".cx-tri .saiu .u").textContent),
    $(".cx-tri .saiu .u").textContent);
  t("o extrato mostra só os lançamentos de fevereiro", $$(".ext-l").length === 5,
    $$(".ext-l").length + " linhas");
  t("as categorias recalculam para o mês, não ficam no total geral",
    $$(".cat-l").length === 3, $$(".cat-l .rot").map((x) => x.textContent).join(" · "));
  w.irMes("tudo");
  await espera(50);
  t("voltando para Tudo, o extrato volta inteiro", $$(".ext-l").length === 10);

  console.log("\n\x1b[1m=== 6f. FILTROS ===\x1b[0m");
  t("três chips de tipo com contagem", $$(".cx-filtros .chip").length >= 3,
    $$(".cx-filtros .chip").map((x) => x.textContent).join(" · "));
  w.filtrarTipo("saida");
  await espera(50);
  t("filtrando saída, só saída aparece",
    $$(".ext-l").length === 6 && $$(".ext-l.mais").length === 0);
  w.filtrarTipo("entrada");
  await espera(50);
  t("filtrando entrada, só entrada aparece",
    $$(".ext-l").length === 4 && $$(".ext-l.menos").length === 0);
  w.filtrarTipo("tudo");
  await espera(50);

  console.log("\n\x1b[1m=== 6g. LANÇAR DESPESA ===\x1b[0m");
  w.abrirLancarSaida();
  await espera(50);
  t("o formulário abre", !!$(".sai-form"));
  t("tem valor, moeda, data, cotação, categoria e descrição",
    ["sa_valor", "sa_moeda", "sa_data", "sa_cotacao", "sa_cat", "sa_desc"]
      .every((id) => !!doc.getElementById(id)));
  t("a data já vem em hoje",
    /^\d{4}-\d{2}-\d{2}$/.test(doc.getElementById("sa_data").value),
    doc.getElementById("sa_data").value);
  t("real é a moeda padrão, que é onde ele mora",
    doc.getElementById("sa_moeda").value === "BRL");
  t("as dez categorias estão lá", $$("#sa_cat option").length === 10,
    $$("#sa_cat option").length + " opções");
  t("a categoria explica o que entra nela", !!$("#sa_dica").textContent.trim(),
    $("#sa_dica").textContent.slice(0, 60));
  t("dá para prender a despesa a um cliente",
    !!doc.getElementById("sa_cli") && $$("#sa_cli option").length >= 2);
  t("o padrão é custo da operação, não de cliente",
    doc.getElementById("sa_cli").value === "");
  t("dá para marcar como mensal", !!doc.getElementById("sa_rec"));
  t("explica por que a cotação do dia importa",
    /não muda quando o dólar mexer/.test($(".sai-form").textContent));
  t("editar uma despesa preenche o formulário", (() => {
    w.editarSaida(1);
    return doc.getElementById("sa_valor").value === "1800"
        && doc.getElementById("sa_cat").value === "anuncios"
        && doc.getElementById("sa_id").value === "1"
        && doc.getElementById("sa_cotacao").value === "5,20";
  })(), doc.getElementById("sa_valor").value + " / " + doc.getElementById("sa_cotacao").value);
  t("cancelar fecha o formulário", (() => { w.fecharLancarSaida();
    return !$(".sai-form"); })());

  console.log("\n\x1b[1m=== 6h. CAIXA VAZIO NÃO INVENTA ===\x1b[0m");
  /* Vazio de verdade: sem entrada, sem saída E sem o custo no campo antigo do
     cliente. Deixar o custo antigo aqui não daria caixa vazio, e nem deveria:
     aquele dinheiro saiu e o extrato tem que mostrar. */
  RESP.dashboard = { ...DASHBOARD,
    financeiro: financeiroTotal(
      CLIS_FIN.map((c) => ({ ...c, custos_valor: null })), [], { valor: "5.40" }, []) };
  await w.carregarCaixa(true);
  await espera(60);
  t("sem lançamento, o extrato diz que está vazio", !!$(".vazio"));
  t("e ensina onde lançar", /card do cliente/.test($(".vazio").textContent));
  t("o cartão de saldo continua, zerado, sem esconder a pergunta", !!$(".cx-topo"));
  RESP.dashboard = { ...DASHBOARD, financeiro: FIN };
  await w.carregarCaixa(true);
  await espera(60);

  console.log("\n\x1b[1m=== 6i. CLIQUE DUPLO NÃO GRAVA DOIS PAGAMENTOS ===\x1b[0m");
  /* Achado na inspeção de 2026-09-10: o botão de lançar dinheiro disparava um
     POST por clique, sem desabilitar nada. Dois cliques rápidos gravavam dois
     pagamentos, o faturamento inflava sozinho e a conferência contra o banco
     deixava de bater. Este teste é o que impede o defeito de voltar. */
  const posts = [];
  const fetchOriginal = w.fetch;
  w.fetch = (u, o) => {
    if (String(u) === "/api/saida") posts.push(o);
    // segura a resposta, para o segundo clique acontecer com o primeiro no ar
    if (String(u) === "/api/saida")
      return new Promise((r) => setTimeout(() =>
        r({ ok: true, json: () => Promise.resolve({ ok: true, id: 99 }) }), 120));
    return fetchOriginal(u, o);
  };
  w.abrirLancarSaida();
  await espera(60);
  doc.getElementById("sa_valor").value = "500";
  doc.getElementById("sa_data").value = "2026-09-10";
  const btSai = $$(".sai-form .acao").find((b2) => /Lançar|Salvar/.test(b2.textContent));
  t("o botão de lançar despesa existe", !!btSai);
  btSai.click();
  await espera(20);
  t("durante a gravação o botão fica desabilitado", btSai.disabled);
  t("e avisa que está salvando", /Salvando/.test(btSai.textContent), btSai.textContent);
  btSai.click();            // o clique duplo
  btSai.click();            // e um terceiro, por garantia
  await espera(240);
  t("três cliques gravaram UMA despesa só", posts.length === 1,
    posts.length + " requisição(ões)");
  t("e o botão volta ao normal depois", !btSai.disabled && /Lançar|Salvar/.test(btSai.textContent),
    btSai.textContent);
  w.fetch = fetchOriginal;
  w.fecharLancarSaida();
  await espera(40);

  console.log("\n\x1b[1m=== 7. CARD DO CLIENTE: PORTÃO DE CONCLUSÃO ===\x1b[0m");
  await w.abrirCliente(7);
  await espera(60);
  t("nenhum erro de JS ao abrir o card", erros.length === 0, erros.join(" | ") || "limpo");
  t("o portão desenhou", !!$(".portao"));
  t("os 4 grupos aparecem", $$(".pg").length === 4, $$(".pg").length + " grupos");
  t("diz que está em entrega", /Em entrega/.test($(".portao-cab").textContent));
  t("3 grupos marcados como travando", $$(".pg.falta").length === 3, $$(".pg.falta").length + "");
  t("o grupo de arquivos é marcado como não travando",
    $$(".pg.solto").length === 1 && /não trava/.test($(".pg.solto").textContent));
  t("diz ONDE mexer em cada grupo", /Cadência de entrega/.test(txt()) && /Checklist de otimização/.test(txt()));
  t("lista os entregáveis abertos por nome", /Google Meu Negócio · Site/.test(txt()));
  t("botão de fechar antes do prazo existe",
    $$("button").some((b) => /antes do prazo/i.test(b.textContent)));

  console.log("\n\x1b[1m=== 7b. CARD DO CLIENTE: ENTRADAS ===\x1b[0m");
  t("o bloco de entradas do cliente existe", !!$(".ent-topo"));
  t("mostra o que entrou deste cliente em dólar", /US\$ 2\.500,00/.test(txt()));
  t("e em real, pela cotação da entrada (5,20)", /R\$ 13\.000,00/.test(txt()));
  t("mostra o contratado e diz que está quitado", /quitado/.test($(".ent-topo").textContent));
  t("mostra o lucro do cliente nas duas moedas",
    /Lucro deste cliente/.test($(".ent-topo").textContent));
  t("a entrada aparece na lista com data", $$(".ent-l").length === 1
    && /14\/02\/2026/.test($(".ent-l").textContent), $(".ent-l").textContent.trim().slice(0, 60));
  t("com o meio e a parcela", /Wise/.test(txt()) && /pagamento único/.test(txt()));
  t("dá para editar e apagar cada entrada", $$(".ent-l .bts button").length === 2);
  t("o formulário de lançar entrada existe",
    !!doc.getElementById("en_valor") && !!doc.getElementById("en_moeda")
    && !!doc.getElementById("en_data") && !!doc.getElementById("en_cotacao"));
  t("a moeda é escolhida, não adivinhada",
    $$("#en_moeda option").map((o) => o.value).join(",") === "USD,BRL");
  t("a data já vem preenchida com hoje", /^\d{4}-\d{2}-\d{2}$/.test(doc.getElementById("en_data").value),
    doc.getElementById("en_data").value);
  t("explica por que a cotação do dia importa",
    /muda sozinho quando o dólar mexe/.test(txt()));
  t("editar uma entrada preenche o formulário", (() => {
    w.editarEntrada(1);
    return doc.getElementById("en_valor").value === "2500"
        && doc.getElementById("en_cotacao").value === "5,20"
        && doc.getElementById("en_id").value === "1";
  })(), doc.getElementById("en_valor").value + " / " + doc.getElementById("en_cotacao").value);
  t("limpar esvazia o formulário", (() => {
    w.limparEntrada();
    return doc.getElementById("en_valor").value === "" && doc.getElementById("en_id").value === "";
  })());

  console.log("\n\x1b[1m=== 8. CARD DO CLIENTE: LOGO ===\x1b[0m");
  t("briefing veio preenchido nos campos",
    doc.getElementById("lg_estilo").value === "moderna e limpa",
    doc.getElementById("lg_estilo").value);
  t("símbolo pedido no textarea", /t[áa]bua de madeira/.test(doc.getElementById("lg_simbolo").value));
  t("o prompt já gerado aparece", !!doc.getElementById("lg_prompt"));
  t("botão de copiar existe", !!$(".pr-copiar"));
  t("explica que é para o gpt-image-2", /gpt-image-2/.test(txt()));
  await w.gerarPromptLogo(0);
  await espera(40);
  t("regerar o prompt não quebra", erros.length === 0 && !!doc.getElementById("lg_prompt"),
    erros.join(" | ") || "ok");

  console.log("\n\x1b[1m=== 9. CARD DO CLIENTE: PEÇAS E ARQUIVOS ===\x1b[0m");
  t("os grupos de peça desenharam", $$(".peca").length === 2, $$(".peca").length + " grupos");
  t("a ordem começa pela logo", /Logo/.test($(".peca .peca-rot").textContent),
    $(".peca .peca-rot").textContent);
  t("cada peça mostra o dia da cadência", $$(".peca-dia").length === 2,
    $$(".peca-dia").map((x) => x.textContent).join(" "));
  t("os slots desenharam", $$(".slot").length === 3, $$(".slot").length + " slots");
  t("slot completo marcado como completo", $$(".slot.ok").length === 1);
  t("slot incompleto mostra quanto falta", /0\/12/.test(txt()));
  t("botão de subir em cada slot", $$(".slot-bt").length === 3);
  t("miniaturas dos arquivos já subidos", $$(".mn").length === 2, $$(".mn").length + " miniaturas");
  t("cada miniatura tem botão de apagar", $$(".mn .x").length === 2);
  t("explica por que a logo vem primeiro", /entra no site/.test(txt()));

  console.log("\n\x1b[1m=== 10. SEM R2, A ÁREA AVISA EM VEZ DE SUMIR ===\x1b[0m");
  RESP.painel = { ...PAINEL, sem_r2: true };
  await w.carregar();
  await w.abrirCliente(7);
  await espera(40);
  t("mostra o aviso", !!$(".semr2"));
  t("dá o comando para criar o bucket", /wrangler r2 bucket create/.test(txt()));
  t("diz que colar link continua funcionando", /colar link continua funcionando/.test(txt()));
  RESP.painel = PAINEL;
  await w.carregar();

  console.log("\n\x1b[1m=== 11. CLIENTE COM ENTREGA FORÇADA ===\x1b[0m");
  const forcado = { ...CLIENTE, entrega_completa: true, portao: { ...CLIENTE.portao,
    concluida: true, forcada: true, forcada_em: new Date().toISOString(),
    forcada_nota: "Entreguei tudo na segunda e o cliente aprovou na quarta.",
    forcada_pendencias: [{ chave: "marcos", rotulo: "Marcos da cadência: 1 de 2 aberto(s)" }] } };
  RESP.cliente = forcado;
  await w.abrirCliente(7);
  await espera(40);
  t("cabeçalho diz que foi fechada antes", /fechada antes do prazo/i.test($(".portao-cab").textContent));
  t("mostra a justificativa escrita", /aprovou na quarta/.test(txt()));
  t("mostra o que estava aberto na hora do clique", /Estava aberto na hora do clique/.test(txt()));
  t("oferece reabrir", $$("button").some((b) => /Reabrir a entrega/.test(b.textContent)));

  console.log("\n\x1b[1m=== 12. NADA QUEBROU NO CAMINHO ===\x1b[0m");
  t("nenhum erro de JS em todo o percurso", erros.length === 0, erros.join(" | ") || "limpo");

  console.log(`\n${mal ? "\x1b[31m" : "\x1b[32m"}\x1b[1m${ok} passaram, ${mal} falharam\x1b[0m`);
  process.exit(mal ? 1 : 0);
}, 60);
