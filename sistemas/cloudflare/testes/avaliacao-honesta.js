/* CONTRATO DA ENTREGA OPERACIONAL DE DEPOIMENTOS.

   Por decisão do Rodrigo em 2026-09-10, o operacional entrega 20 textos
   completos e variados, personalizados com os dados do contractor. São
   rascunhos para o cliente real validar conforme sua experiência. O padrão
   fica no código e só deve mudar quando o próprio Rodrigo pedir.

   Os textos gerados não entram automaticamente no site público, não recebem
   autor ou nota inventados e não alteram a oferta do site comercial. Estes
   testes também preservam as proteções dessas outras superfícies.          */
import fs from "node:fs";
import path from "node:path";
import { gerarReviews, gerarSite, CADENCIA } from "../src/geradores.js";
import { ADMIN_HTML } from "../src/admin.js";
import { JSDOM } from "jsdom";

const RAIZ = path.join(import.meta.dirname, "..");
const SITE = path.join(RAIZ, "..", "site-agencia");

let ok = 0, mal = 0;
const t = (n, c, d = "") => { c ? (ok++, console.log("  \x1b[32mv\x1b[0m " + n + (d ? "  -> " + d : "")))
  : (mal++, console.log("  \x1b[31mX\x1b[0m " + n + (d ? "  -> " + d : ""))) };

const CLIENTE = { nome_dono: "Marcos", nome_contato: "Contato administrativo",
  cidade: "Framingham", estado: "MA", localizacoes: "MetroWest and Greater Boston",
  empresa: "Oliveira Hardwood", servicos: "Hardwood Installation, Tile, Staircase" };

console.log("\n\x1b[1m=== 1. VINTE DEPOIMENTOS COMPLETOS E PERSONALIZADOS ===\x1b[0m");
const depoimentos = await gerarReviews(CLIENTE);
t("gerou exatamente 20 por padrão", depoimentos.length === 20, String(depoimentos.length));
t("os 20 textos são distintos", new Set(depoimentos.map((p) => p.texto)).size === 20);
for (const campo of ["nome_dono", "empresa", "cidade", "estado", "localizacoes"])
  t("todos contêm " + campo, depoimentos.every((p) => p.texto.includes(CLIENTE[campo])));
t("nome do dono tem prioridade sobre o contato administrativo",
  depoimentos.every((p) => !p.texto.includes(CLIENTE.nome_contato)));
t("cada texto corresponde ao serviço identificado no registro",
  depoimentos.every((p) => p.servico && p.texto.includes(p.servico)));
t("os três serviços cadastrados estão representados",
  ["Hardwood Installation", "Tile", "Staircase"].every((s) => depoimentos.some((p) => p.servico === s)));
for (const [tema, re] of [
  ["qualidade", /quality|craftsmanship|workmanship|attention to detail|well[- ](?:done|finished)/i],
  ["prazo", /on time|on schedule|agreed (?:time|date|schedule)|promised (?:time|date)|deadline|timeline/i],
  ["limpeza", /clean|tidy|tidied|neat|debris/i],
]) t("todos tratam de " + tema, depoimentos.every((p) => re.test(p.texto)));
t("nenhum texto é apenas um pedido de avaliação",
  !depoimentos.some((p) => /\{LINK\}|would you mind leaving|leave (?:us |me |a |an |your |honest |quick |Google )*review/i.test(p.texto)));
t("nenhum oferece desconto ou brinde em troca",
  !depoimentos.some((p) => /discount|gift|off your next|em troca/i.test(p.texto)));
t("nenhum inventa nota ou estrelas",
  !depoimentos.some((p) => /\b(?:[1-5]|one|two|three|four|five)[ -]*stars?\b|[★⭐]|\b[1-5]\s*\/\s*5\b/i.test(p.texto)));
t("nenhum registro atribui o rascunho a um consumidor ou o marca como real",
  depoimentos.every((p) => !p.real && !["autor", "author", "reviewer", "nome_cliente", "rating", "nota", "stars"]
    .some((campo) => Object.hasOwn(p, campo))));
t("nenhum texto adiciona assinatura de consumidor",
  !depoimentos.some((p) => /(?:^|\n)\s*(?:review (?:by|from)|reviewer|customer name|signed by|author)\s*:/i.test(p.texto)));

console.log("\n\x1b[1m=== 2. PADRÃO FIXO, SEM IA OU DADOS INVENTADOS ===\x1b[0m");
const semDono = await gerarReviews({ ...CLIENTE, nome_dono: "", nome_contato: "Ana" });
t("usa nome_contato quando nome_dono falta", semDono.every((p) => p.texto.includes("Ana")));
const incompleto = await gerarReviews({});
t("cadastro incompleto ainda produz 20 textos distintos",
  incompleto.length === 20 && new Set(incompleto.map((p) => p.texto)).size === 20);
for (const marcador of ["[business owner]", "[company name]", "[city]", "[service performed]"])
  t("campo ausente aparece como " + marcador, incompleto.every((p) => p.texto.includes(marcador)));
t("não inventa um serviço ou localização quando faltam dados",
  incompleto.every((p) => p.servico === "[service performed]"
    && !/\bremodeling\b|\bFramingham\b|\bBoston\b|\bundefined\b|\bnull\b/i.test(p.texto)));
t("sem fotos, a referência permanece vazia", incompleto.every((p) => p.foto_ref === null));
const fotos = ["https://example.test/job-1.jpg", "https://example.test/job-2.jpg", "https://example.test/job-3.jpg"];
const comFotos = await gerarReviews(CLIENTE, 20, fotos);
t("as fotos continuam vinculadas em ciclo",
  comFotos.every((p, i) => p.foto_ref === fotos[i % fotos.length]));
t("fotos não mudam o conteúdo dos textos",
  JSON.stringify(comFotos.map((p) => p.texto)) === JSON.stringify(depoimentos.map((p) => p.texto)));
for (const qtd of [0, 1, 50]) {
  const lote = await gerarReviews(CLIENTE, qtd);
  t("pedido de quantidade " + qtd + " preserva a entrega de 20", lote.length === 20);
}
const fetchOriginal = globalThis.fetch;
let chamadasExternas = 0, comChave;
try {
  globalThis.fetch = async () => {
    chamadasExternas++;
    throw new Error("Este gerador não deve depender de rede.");
  };
  comChave = await gerarReviews(CLIENTE, 20, [], "chave-ficticia-para-teste");
} finally {
  globalThis.fetch = fetchOriginal;
}
t("mesmo com chave configurada não faz chamada externa", chamadasExternas === 0);
t("configurar uma chave não muda a entrega", JSON.stringify(comChave) === JSON.stringify(depoimentos));
t("gerar novamente mantém o mesmo padrão salvo no código",
  JSON.stringify(await gerarReviews(CLIENTE)) === JSON.stringify(depoimentos));

console.log("\n\x1b[1m=== 3. O SITE DO CLIENTE NÃO RECEBE TEXTO GERADO ===\x1b[0m");
/* Antes, os textos gerados iam para o site PÚBLICO do cliente como se fossem
   depoimento real. Pior que o cliente publicar no Google. */
const htmlComDepoimentos = gerarSite(CLIENTE, ["https://x/1.jpg"], depoimentos);
const vazou = depoimentos.filter((p) => htmlComDepoimentos.includes(p.texto.slice(0, 40)));
t("passar rascunhos para gerarSite não os coloca no site", vazou.length === 0,
  vazou.length + " vazaram");
t("nem o {LINK} aparece no site", !htmlComDepoimentos.includes("{LINK}"));
const idx = fs.readFileSync(path.join(RAIZ, "src/index.js"), "utf8");
t("a rota de gerar passa lista vazia para o site",
  /G\.gerarSite\(c, fotos, \[\]\)/.test(idx));
t("e não busca mais texto por postada=1",
  !/FROM reviews WHERE cliente_id=\? AND postada=1/.test(idx));
/* Avaliação real, marcada como real, PODE aparecer: é o caminho honesto. */
const htmlComReal = gerarSite(CLIENTE, ["https://x/1.jpg"],
  [{ texto: "Marcos did our floors and we could not be happier.", servico: "Hardwood", real: 1 }]);
t("avaliação REAL, marcada como tal, aparece no site",
  htmlComReal.includes("could not be happier"));

console.log("\n\x1b[1m=== 4. O MARCO E A PASTA DE ENTREGA ===\x1b[0m");
const marco = CADENCIA.find((m) => /avalia/i.test(m.marco));
t("o marco existe", !!marco, marco && marco.marco);
t("e não promete 20 avaliações entregues",
  !!marco && !/20 reviews entregues|20 avaliações entregues/i.test(marco.marco));
const admin = fs.readFileSync(path.join(RAIZ, "src/admin.js"), "utf8");
const exportacao = idx.slice(idx.indexOf('if (p === "/api/exportar")'), idx.indexOf('if (p === "/api/exportar")') + 7000);
t("a pasta de entrega chama de DEPOIMENTOS", /DEPOIMENTOS/.test(exportacao));
t("a exportação orienta validar com o cliente real", /validar/i.test(exportacao) && /cliente real/i.test(exportacao));
t("o card operacional identifica os depoimentos", /Depoimentos/i.test(admin));
t("o card também orienta validar com o cliente real", /validar/i.test(admin) && /cliente real/i.test(admin));
t("nenhum lugar do CRM diz que o cliente posta a avaliação",
  !/Quem posta é o cliente/.test(idx)
  && !/Quem posta é o cliente/.test(admin));

console.log("\n\x1b[1m=== 5. O BOTÃO GERA SOMENTE DEPOIMENTOS E ATUALIZA O CARD ===\x1b[0m");
/* A página e seus handlers são os reais. Só o servidor é substituído:
   clicar no botão deve pedir apenas depoimentos e mostrar o lote devolvido
   na leitura seguinte do cliente. Não alteramos variáveis internas da UI. */
const clienteUI = { ...CLIENTE, id: 7, dias: 1, dias_para_renovar: null,
  reviews: [], entregaveis: [], posts: [], midias: [], marcos: [], checklist: [] };
const painelUI = { leads: [], clientes: [clienteUI], entregaveis: [],
  pipelines: { leads_novos: [], agendamento: [], recuperacao: [], nutricao: [] },
  ativacoes: {}, catalogo: [], kpis: { etapas: {}, alertas: [] } };
const requisicoes = [], errosUI = [];
const dom = new JSDOM(ADMIN_HTML, { runScripts: "dangerously",
  url: "https://example.test/", pretendToBeVisual: true,
  beforeParse(w) {
    w.fetch = async (url, options = {}) => {
      requisicoes.push({ url: String(url), method: options.method || "GET",
        body: options.body ? JSON.parse(options.body) : null });
      let resposta;
      if (String(url) === "/api/gerar") {
        clienteUI.reviews = depoimentos.map((p, i) => ({ ...p, id: i + 1, postada: 0 }));
        resposta = { ok: true, gerado: ["20 depoimentos"] };
      } else if (String(url) === "/api/painel") resposta = painelUI;
      else if (String(url) === "/api/cliente?id=7") resposta = clienteUI;
      else throw new Error("Requisição inesperada no teste: " + url);
      return { ok: true, json: async () => resposta };
    };
    w.alert = (mensagem) => { w.__alert = mensagem; };
    w.scrollTo = () => {};
    w.addEventListener("error", (e) => errosUI.push(String(e.error || e.message)));
  } });
try {
  const w = dom.window, doc = w.document;
  await w.carregar();
  w.irPara("operacional");
  await w.abrirCliente(7);
  const botao = [...doc.querySelectorAll("#painel button")]
    // rótulo mudou em 2026-09-18: "depoimento" virou "texto de avaliação", para
    // a tela dizer o que a entrega é de fato (referência para o cliente real
    // pedir avaliação aos clientes DELE). O que o botão faz não mudou.
    .find((b) => b.textContent.trim() === "Gerar somente os 20 textos de avaliação");
  t("o botão exclusivo existe no card do cliente", !!botao);
  t("a quantidade da entrega não é configurável no card", !doc.querySelector("#g_qtd"));
  const inicioClique = requisicoes.length;
  botao?.click();
  // As respostas são imediatas. Um turno do event loop esgota as continuações
  // assíncronas de post(), carregar() e abrirCliente() disparadas pelo clique.
  await new Promise((resolve) => setTimeout(resolve, 0));
  const aposClique = requisicoes.slice(inicioClique);
  const gravacoes = aposClique.filter((r) => r.method === "POST");
  const pedido = gravacoes[0];
  t("um clique faz um único POST para /api/gerar",
    gravacoes.length === 1 && pedido?.url === "/api/gerar");
  t("envia o id do cliente aberto", pedido?.body?.id === 7);
  t("exclui site e Instagram da geração",
    pedido?.body?.site === false && pedido?.body?.instagram === false);
  t("não envia quantidade variável ou desativa os depoimentos",
    !!pedido?.body && !Object.hasOwn(pedido.body, "qtd_reviews") && pedido.body.reviews !== false);
  t("recarrega painel e card depois de gerar",
    aposClique.some((r) => r.url === "/api/painel" && r.method === "GET")
    && aposClique.some((r) => r.url === "/api/cliente?id=7" && r.method === "GET"));
  const secao = [...doc.querySelectorAll("#painel section")]
    .find((s) => /^Depoimentos/.test(s.querySelector("h4")?.textContent || ""));
  t("o card atualizado mostra os 20 entregues e as cinco prévias",
    !!secao && /0\/20/.test(secao.querySelector("h4").textContent)
    && secao.querySelectorAll(".rev").length === 5
    && depoimentos.slice(0, 5).every((p) => secao.textContent.includes(p.texto)));
  t("a orientação para validar aparece junto dos textos",
    !!secao && /cliente real/i.test(secao.textContent) && /validar/i.test(secao.textContent));
  t("o card oferece o arquivo completo do cliente correto",
    !!doc.querySelector('#painel a[href="/api/exportar?id=7"]'));
  t("a geração exclusiva não causa erro de JavaScript", errosUI.length === 0, errosUI.join(" | "));
} finally {
  dom.window.close();
}

console.log("\n\x1b[1m=== 6. O SITE COMERCIAL NÃO VENDE AVALIAÇÃO PRONTA ===\x1b[0m");
const cont = fs.readFileSync(path.join(SITE, "conteudo.js"), "utf8");
const VENDE_PRONTA = [
  [/avaliações escritas em inglês, prontas para (você )?publicar/i, "pt: prontas para publicar"],
  [/reviews written in English, ready for you to publish/i, "en: ready to publish"],
  [/\d+ avaliações novas (a cada|por) trimestre/i, "pt: quantidade de avaliações contratada"],
  [/\d+ new reviews every quarter/i, "en: quantidade contratada"],
];
const vendendo = VENDE_PRONTA.filter(([re]) => re.test(cont)).map(([, n]) => n);
t("nenhuma página vende avaliação pronta para publicar", vendendo.length === 0,
  vendendo.join(" | ") || "limpo");
t("o entregável virou o SISTEMA de coleta",
  /Sistema de avaliação montado/.test(cont) && /Review system set up/.test(cont));
t("com link, QR e modelos de PEDIDO",
  /modelos de pedido/.test(cont) && /request templates/.test(cont));
t("o card de serviço honesto continua lá",
  /avaliação de cliente real depois de cada obra/.test(cont));

console.log("\n\x1b[1m=== 7. A NOTA DE PAGAMENTO NÃO PROMETE O IMPOSSÍVEL ===\x1b[0m");
/* A nota dizia "em até três parcelas" em páginas que vendem até US$ 24.000,
   com teto de US$ 2.500 por cobrança: três parcelas dariam 8.000 cada. */
t("não promete mais um número fixo de parcelas",
  !/em até três parcelas/i.test(cont) && !/up to three installments/i.test(cont));
t("e explica o teto real por cobrança",
  /2\.500 cada/.test(cont) && /2,500 each/.test(cont));

console.log("\n" + (mal ? "\x1b[31m" : "\x1b[32m") + "\x1b[1m" + ok
  + " passaram, " + mal + " falharam\x1b[0m");
process.exit(mal ? 1 : 0);
