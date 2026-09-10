/* AVALIAÇÃO FABRICADA NÃO VOLTA.

   Este teste existe por causa de um achado real da auditoria de 2026-09-10: o
   sistema gerava 20 avaliações em primeira pessoa de cliente, prontas para o
   contractor publicar no Google, e as páginas de proposta vendiam isso por
   escrito. Além de quebrar a regra de integridade do CLAUDE.md, suspende
   perfil no Google, e desde 2024 a FTC Rule on Consumer Reviews alcança quem
   FORNECE o texto, não só quem publica. Quem levava a suspensão era o cliente,
   no perfil que a Leon Group acabou de montar para ele.

   O que o sistema gera agora é PEDIDO de avaliação: a mensagem que o
   contractor manda para o cliente real dele. Quem escreve a avaliação é o
   cliente final, sempre.                                                  */
import fs from "node:fs";
import path from "node:path";
import { gerarReviews, gerarSite, CADENCIA } from "../src/geradores.js";

const RAIZ = path.join(import.meta.dirname, "..");
const SITE = path.join(RAIZ, "..", "site-agencia");

let ok = 0, mal = 0;
const t = (n, c, d = "") => { c ? (ok++, console.log("  \x1b[32mv\x1b[0m " + n + (d ? "  -> " + d : "")))
  : (mal++, console.log("  \x1b[31mX\x1b[0m " + n + (d ? "  -> " + d : ""))) };

const CLIENTE = { nome_dono: "Marcos", cidade: "Framingham", estado: "MA",
  empresa: "Oliveira Hardwood", servicos: "Hardwood Installation, Tile, Staircase" };

/* Frases que só um CLIENTE escreveria. Se alguma aparecer no que o sistema
   gera, é avaliação fabricada de volta. */
const VOZ_DE_CLIENTE = [
  [/\bI (want to |wanted to )?leave (an? )?(honest )?review/i, "cliente dizendo que vai avaliar"],
  [/\bhighly recommend\b/i, "recomendação de cliente"],
  [/\bI recommend\b/i, "recomendação de cliente"],
  [/\bfive stars\b|\b5 stars\b/i, "nota dada por cliente"],
  [/\bbest .{0,24}\b(in|around) [A-Z]/i, "superlativo de cliente"],
  [/\bhands down\b/i, "superlativo de cliente"],
  [/\bflawless\b/i, "elogio de cliente"],
  [/\bwe hired\b|\bI hired\b/i, "cliente narrando a contratação"],
  [/\bthe crew was\b|\bthe whole crew\b/i, "cliente descrevendo a equipe"],
  [/\bahead of (the )?schedule\b/i, "cliente elogiando prazo"],
  [/\bon budget\b/i, "cliente elogiando orçamento"],
  [/\bour neighbors\b/i, "cliente citando vizinhos"],
  [/\bdo yourself a favor\b/i, "chamada de cliente para outros"],
  [/\bgot three quotes\b|\bthree quotes\b/i, "cliente narrando cotações"],
];

console.log("\n\x1b[1m=== 1. O GERADOR PRODUZ PEDIDO, NÃO AVALIAÇÃO ===\x1b[0m");
const pedidos = await gerarReviews(CLIENTE, 20, [], "");
t("gerou os 20", pedidos.length === 20, String(pedidos.length));

const flagrados = [];
for (const p of pedidos)
  for (const [re, nome] of VOZ_DE_CLIENTE)
    if (re.test(p.texto)) flagrados.push(nome + ": " + p.texto.slice(0, 70));
t("nenhuma frase em voz de cliente", flagrados.length === 0,
  flagrados.slice(0, 2).join(" | ") || "limpo");

t("quem fala é o contractor, pelo nome",
  pedidos.every((p) => /Marcos/.test(p.texto)));
t("todo pedido tem o link para o cliente colar",
  pedidos.every((p) => p.texto.includes("{LINK}")));
t("todo pedido de fato PEDE a avaliação",
  pedidos.every((p) => /review/i.test(p.texto)));
t("nenhum oferece desconto ou brinde em troca",
  !pedidos.some((p) => /discount|free|gift|off your next|em troca/i.test(p.texto)));
t("nenhum sugere quantas estrelas dar",
  !pedidos.some((p) => /\b[1-5]\s*stars?\b/i.test(p.texto)));
t("os textos não são todos iguais",
  new Set(pedidos.map((p) => p.texto)).size >= 15,
  new Set(pedidos.map((p) => p.texto)).size + " distintos de 20");

console.log("\n\x1b[1m=== 2. O PROMPT DA IA TAMBÉM PEDE PEDIDO ===\x1b[0m");
/* Sem chave, gerarReviews usa o fallback. O prompt da IA é o outro caminho, e
   ele tem que instruir a mesma coisa: se um dia a chave existir, não pode
   voltar a gerar avaliação. */
const ger = fs.readFileSync(path.join(RAIZ, "src/geradores.js"), "utf8");
t("o prompt diz REVIEW REQUEST, não reviews", /REVIEW REQUEST messages/.test(ger));
t("proíbe explicitamente voz de cliente",
  /Do NOT write anything in the voice of a customer/.test(ger));
t("proíbe testemunho", /Do NOT write testimonials/.test(ger));
t("proíbe incentivo em troca", /no incentive offered/.test(ger));
t("proíbe sugerir a nota", /how many stars to give/.test(ger));
t("nenhuma lista antiga de avaliação sobrou",
  !/const (ABERTURAS|ATENDIMENTO|QUALIDADE|FECHAMENTOS) = \[/.test(ger),
  (ger.match(/const (ABERTURAS|ATENDIMENTO|QUALIDADE|FECHAMENTOS) = \[/) || ["nenhuma"])[0]);
t("o arquivo registra por que mudou",
  /FTC Rule on Consumer Reviews/.test(ger) && /avaliação fabricada/i.test(ger));

console.log("\n\x1b[1m=== 3. O SITE DO CLIENTE NÃO RECEBE TEXTO GERADO ===\x1b[0m");
/* Antes, os textos gerados iam para o site PÚBLICO do cliente como se fossem
   depoimento real. Pior que o cliente publicar no Google. */
const htmlComPedidos = gerarSite(CLIENTE, ["https://x/1.jpg"], pedidos);
const vazou = pedidos.filter((p) => htmlComPedidos.includes(p.texto.slice(0, 40)));
t("passar os pedidos para gerarSite não os coloca no site", vazou.length === 0,
  vazou.length + " vazaram");
t("nem o {LINK} aparece no site", !htmlComPedidos.includes("{LINK}"));
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
t("a pasta de entrega chama de PEDIDOS", /PEDIDOS DE AVALIAÇÃO/.test(idx));
t("e diz que quem escreve é o cliente final",
  /Quem escreve a avaliação é o cliente final/.test(idx));
t("nenhum lugar do CRM diz que o cliente posta a avaliação",
  !/Quem posta é o cliente/.test(idx)
  && !/Quem posta é o cliente/.test(fs.readFileSync(path.join(RAIZ, "src/admin.js"), "utf8")));

console.log("\n\x1b[1m=== 5. O SITE COMERCIAL NÃO VENDE AVALIAÇÃO PRONTA ===\x1b[0m");
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

console.log("\n\x1b[1m=== 6. A NOTA DE PAGAMENTO NÃO PROMETE O IMPOSSÍVEL ===\x1b[0m");
/* A nota dizia "em até três parcelas" em páginas que vendem até US$ 24.000,
   com teto de US$ 2.500 por cobrança: três parcelas dariam 8.000 cada. */
t("não promete mais um número fixo de parcelas",
  !/em até três parcelas/i.test(cont) && !/up to three installments/i.test(cont));
t("e explica o teto real por cobrança",
  /2\.500 cada/.test(cont) && /2,500 each/.test(cont));

console.log("\n" + (mal ? "\x1b[31m" : "\x1b[32m") + "\x1b[1m" + ok
  + " passaram, " + mal + " falharam\x1b[0m");
process.exit(mal ? 1 : 0);
