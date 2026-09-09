/* A página /planos é apresentada NA CALL, depois do diagnóstico. É onde a
   ancoragem tem que se sustentar: o plano mais barato precisa ser o alvo
   visual, e os dois de cima precisam ancorar sem parecerem a versão boa.

   E ela precisa continuar fora do Google. Um dia em que essa página for
   indexada, o contractor chega direto no preço sem contexto, que é
   exatamente o que a mudança de hoje quis evitar. */
const fs = require("fs"), path = require("path");
const { JSDOM } = require("jsdom");
const RAIZ = __dirname;

let ok = 0, mal = 0;
const t = (n, c, d = "") => { c ? (ok++, console.log("  \x1b[32m✓\x1b[0m " + n + (d ? "  → " + d : "")))
  : (mal++, console.log("  \x1b[31m✗ FALHOU\x1b[0m " + n + (d ? "  → " + d : ""))) };

const html = fs.readFileSync(path.join(RAIZ, "planos/index.html"), "utf8");
// o <script src="../conteudo.js"> não resolve no jsdom: injeta na mão
const conteudo = fs.readFileSync(path.join(RAIZ, "conteudo.js"), "utf8");
const pronto = html.replace('<script src="../conteudo.js"></script>',
  "<script>" + conteudo + "</script>");

const erros = [];
const dom = new JSDOM(pronto, { runScripts: "dangerously", pretendToBeVisual: true,
  url: "https://leon-group-site.pages.dev/planos/",
  beforeParse(w) {
    w.localStorage.clear();
    w.addEventListener("error", (e) => erros.push(e.message));
  } });
const w = dom.window, doc = w.document;
const $ = (s) => doc.querySelector(s), $$ = (s) => [...doc.querySelectorAll(s)];
const visivel = () => doc.body.textContent.replace(/\s+/g, " ");

setTimeout(() => {
  console.log("\n\x1b[1m═══ 1. A PÁGINA MONTOU ═══\x1b[0m");
  t("nenhum erro de JS", erros.length === 0, erros[0] || "limpo");
  t("título e subtítulo preenchidos",
    $("#titulo").textContent.length > 20 && $("#sub").textContent.length > 40);
  t("reusa o conteudo.js, sem cópia de preço na página",
    !/2\.500|4\.500|7\.500/.test(html), "nenhum preço escrito no HTML");

  console.log("\n\x1b[1m═══ 2. FORA DO GOOGLE ═══\x1b[0m");
  /* Se esta página for indexada, o contractor chega direto no preço sem
     contexto, que é o que a mudança de hoje quis evitar. */
  const robots = $('meta[name="robots"]');
  t("tem meta robots", !!robots);
  t("noindex", /noindex/.test(robots.content), robots.content);
  t("nofollow", /nofollow/.test(robots.content));
  t("noarchive, para não sobrar em cache", /noarchive/.test(robots.content));

  console.log("\n\x1b[1m═══ 3. A ANCORAGEM ═══\x1b[0m");
  const planos = $$(".plano");
  t("os três planos", planos.length === 3,
    planos.map((p) => p.querySelector("h2").textContent).join(" · "));
  t("só um é o alvo", $$(".plano.alvo").length === 1);
  t("e o alvo é o PRIMEIRO, o mais barato", planos[0].classList.contains("alvo"));
  t("o alvo diz 'comece por aqui'", /Comece por aqui/i.test($(".plano.alvo .selo").textContent),
    $(".plano.alvo .selo").textContent);
  t("os de cima dizem 'para depois', não 'melhor' nem 'mais popular'",
    $$(".plano.depois .selo").every((e) => /Para depois/i.test(e.textContent)));
  t("só o alvo tem preço fechado", !$(".plano.alvo .partir"));
  t("os outros dois dizem 'a partir de'", $$(".plano.depois .partir").length === 2);
  t("os preços sobem da esquerda para a direita", (() => {
    const n = planos.map((p) => parseFloat(p.querySelector(".num").textContent.replace(/[.,]/g, "")));
    return n[0] < n[1] && n[1] < n[2];
  })(), planos.map((p) => p.querySelector(".num").textContent).join(" < "));
  t("o alvo custa 2.500", /2\.500/.test($(".plano.alvo .num").textContent));
  t("cada plano lista o que entrega", planos.every((p) => p.querySelectorAll("li").length >= 5),
    planos.map((p) => p.querySelectorAll("li").length).join(" / ") + " itens");
  t("o subtítulo desaconselha o plano caro",
    /não é o mais indicado/i.test($("#sub").textContent));

  console.log("\n\x1b[1m═══ 4. AS NOTAS DE TRANSPARÊNCIA ═══\x1b[0m");
  t("as três notas", $$(".notas p").length === 3);
  t("a de agência nova em destaque", !!$(".notas p.nova"));
  t("assume que não tem caso publicado",
    /ainda não tem caso publicado/i.test($("#notas").textContent));
  t("diz que não recebe percentual sobre a verba",
    /não recebe percentual/i.test($("#notas").textContent));
  t("diz que o mensal não é mensalidade", /não uma mensalidade/i.test($("#notas").textContent));
  t("oferece o diagnóstico gratuito", /diagnóstico gratuito/i.test($("#duvida").textContent));

  console.log("\n\x1b[1m═══ 5. O BOTÃO LEVA A ALGUM LUGAR COM CONTEXTO ═══\x1b[0m");
  const bts = $$(".plano .bt");
  t("os três botões existem", bts.length === 3);
  t("todos abrem o WhatsApp", bts.every((b) => /wa\.me\//.test(b.href)));
  t("e já dizem qual plano", bts.every((b) => /plano/i.test(decodeURIComponent(b.href))));
  t("o do alvo nomeia o plano certo",
    /Presen[çc]a Local/i.test(decodeURIComponent(bts[0].href)),
    decodeURIComponent(bts[0].href).split("text=")[1] || "");
  t("abrem em aba nova, sem vazar referrer",
    bts.every((b) => b.target === "_blank" && /noopener/.test(b.rel)));
  t("o número do WhatsApp vem do conteudo.js, não escrito aqui",
    !/5561|wa\.me\/\d/.test(html));

  console.log("\n\x1b[1m═══ 6. INTEGRIDADE DO TEXTO ═══\x1b[0m");
  const todo = visivel();
  const proibido = [
    [/garantimos.{0,25}(faturamento|posição|ranking)/i, "garantia de resultado"],
    [/\d+\s*clientes\s*atendidos/i, "contagem de clientes"],
    [/primeira p[áa]gina do google/i, "promessa de posição"],
    [/\d+x\s*mais\s*(clientes|faturamento)/i, "multiplicador de resultado"],
  ];
  const achou = proibido.filter(([re]) => re.test(todo)).map(([, n]) => n);
  t("nenhuma alegação proibida pela regra de integridade", achou.length === 0,
    achou.join(", ") || "limpo");
  t("os três planos são entregáveis reais, sem plano de vitrine",
    !/sob consulta|entre em contato para saber/i.test(todo));

  console.log("\n\x1b[1m═══ 7. OS DOIS IDIOMAS ═══\x1b[0m");
  t("começa em português", doc.documentElement.lang === "pt-BR");
  $$(".idi button").find((b) => b.dataset.idi === "en").click();
  t("troca para inglês", doc.documentElement.lang === "en");
  t("os planos traduziram", /Local Presence/.test($("#lista").textContent),
    $$(".plano h2").map((h) => h.textContent).join(" · "));
  t("as notas traduziram", /published case study/i.test($("#notas").textContent));
  t("o botão do WhatsApp traduziu",
    /I'm interested/i.test(decodeURIComponent($$(".plano .bt")[0].href)));
  t("e a ancoragem se mantém em inglês",
    $$(".plano")[0].classList.contains("alvo")
    && /Start here/i.test($(".plano.alvo .selo").textContent),
    $(".plano.alvo .selo").textContent);
  $$(".idi button").find((b) => b.dataset.idi === "pt").click();
  t("e volta para português", doc.documentElement.lang === "pt-BR");

  console.log("\n\x1b[1m═══ 8. VOLTA PARA O SITE ═══\x1b[0m");
  t("a marca no topo volta para a home", $(".marca").getAttribute("href") === "../");
  t("o rodapé tem link de volta", /Voltar ao site/i.test($("#rodape").textContent));
  t("o rodapé diz que isto não substitui a proposta",
    /não substitui a proposta/i.test($("#rodape").textContent));
  t("nenhum erro de JS no percurso", erros.length === 0, erros[0] || "limpo");

  console.log("\n" + (mal ? "\x1b[31m" : "\x1b[32m") + "\x1b[1m" + ok
    + " passaram, " + mal + " falharam\x1b[0m");
  process.exit(mal ? 1 : 0);
}, 700);
