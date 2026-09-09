/* /planosv3 é a cópia do layout da Kairon, medida no CSS real dela e conferida
   nos prints. Este teste existe para o que foi PEDIDO não se perder:
   as três colunas, a ancoragem no MAIOR (o inverso de /planos e /planosv2), o
   herói escuro, o menu com âncora por plano, e o card destacado escolhido a
   dedo em cada faixa de preço, que não é o mais barato. */
const fs = require("fs"), path = require("path");
const { JSDOM } = require("jsdom");
const RAIZ = __dirname;

let ok = 0, mal = 0;
const t = (n, c, d = "") => { c ? (ok++, console.log("  \x1b[32m✓\x1b[0m " + n + (d ? "  → " + d : "")))
  : (mal++, console.log("  \x1b[31m✗ FALHOU\x1b[0m " + n + (d ? "  → " + d : ""))) };

const html = fs.readFileSync(path.join(RAIZ, "planosv3/index.html"), "utf8");
const conteudo = fs.readFileSync(path.join(RAIZ, "conteudo.js"), "utf8");
const pronto = html.replace('<script src="../conteudo.js"></script>',
  "<script>" + conteudo + "</script>");
const CONT = new Function(conteudo + "; return {T:T, WHATSAPP:WHATSAPP};")();

const erros = [];
const dom = new JSDOM(pronto, { runScripts: "dangerously", pretendToBeVisual: true,
  url: "https://leon-group-site.pages.dev/planosv3/",
  beforeParse(w) {
    w.localStorage.clear();
    w.matchMedia = () => ({ matches: false, addEventListener(){}, removeEventListener(){} });
    // jsdom não tem canvas: o herói não pode derrubar a página por causa disso
    w.HTMLCanvasElement.prototype.getContext = () => null;
    w.addEventListener("error", (e) => erros.push(e.message));
  } });
const w = dom.window, doc = w.document;
const $ = (s) => doc.querySelector(s), $$ = (s) => [...doc.querySelectorAll(s)];
const visivel = () => doc.body.textContent.replace(/\s+/g, " ");
const nums = (s) => (s.match(/[\d,]+/g) || []).map((x) => Number(x.replace(/,/g, "")));

setTimeout(() => {
  console.log("\n\x1b[1m═══ 1. A ESTRUTURA DA KAIRON ═══\x1b[0m");
  t("nenhum erro de JS, mesmo sem canvas", erros.length === 0, erros[0] || "limpo");
  t("menu fixo no topo", !!$(".nav") && /sticky/.test(html));
  t("herói escuro antes dos planos", !!$(".hero")
    && $(".hero").compareDocumentPosition($("#planos")) & 4);
  t("seção dos planos", !!$("#planos"));
  t("uma seção de preços por plano", $$(".pricing").length === 3);
  t("faixa final com fundo accent", !!$(".cta-planos"));
  const nomeDe = (e) => e.classList.contains("hero") ? "hero"
    : e.id === "planos" ? "planos"
    : e.classList.contains("pricing") ? "precos"
    : e.classList.contains("cta-planos") ? "cta" : "?";
  const ordem = [...doc.querySelectorAll(".hero,#planos,.pricing,.cta-planos")].map(nomeDe);
  t("a ordem é herói, planos, três faixas de preço, faixa final",
    ordem.join(">") === "hero>planos>precos>precos>precos>cta", ordem.join(" > "));

  console.log("\n\x1b[1m═══ 2. AS TRÊS COLUNAS ═══\x1b[0m");
  t("plans-grid existe", !!$(".plans-grid"));
  t("três colunas a partir de 960px, como na Kairon",
    /@media \(min-width:960px\)\{\.plans-grid\{grid-template-columns:repeat\(3,1fr\)\}\}/.test(html));
  t("uma coluna no celular", /\.plans-grid\{display:grid;grid-template-columns:1fr/.test(html));
  t("os três cards", $$(".plan").length === 3,
    $$(".plan-name").map((h) => h.textContent).join(" · "));
  t("raio de 34px, como na Kairon", /--radius-card:34px/.test(html));
  t("price-grid em três colunas a partir de 900px",
    /@media \(min-width:900px\)\{\.price-grid\{grid-template-columns:repeat\(3,1fr\)\}\}/.test(html));
  t("nove cards de preço", $$(".price-card").length === 9);
  t("cartão de preço centralizado, como na Kairon",
    /\.price-card\{[^}]*text-align:center/.test(html));

  console.log("\n\x1b[1m═══ 3. A ANCORAGEM NO MAIOR ═══\x1b[0m");
  /* O inverso de /planos e /planosv2, a pedido: aqui o plano MAIOR leva o
     card escuro e a faixa, exatamente como o Kairós leva na Kairon. */
  const planos = $$(".plan");
  t("o primeiro card fica SEM destaque",
    !planos[0].classList.contains("plan--borda") && !planos[0].classList.contains("plan--escuro"));
  t("o do meio leva a borda accent", planos[1].classList.contains("plan--borda"));
  t("o MAIOR leva o card escuro", planos[2].classList.contains("plan--escuro"));
  t("e é o maior de verdade, pelo preço", (() => {
    const tot = $$(".pricing").map((s) => nums(s.querySelector(".price-meta span").textContent)[0]);
    return tot[0] < tot[1] && tot[1] < tot[2];
  })(), $$(".pricing").map((s) => s.querySelector(".price-meta span").textContent.trim()).join(" < "));
  t("só o maior tem faixa no topo", $$(".plan-ribbon").length === 1
    && planos[2].querySelector(".plan-ribbon"));
  t("a faixa diz para quem é", /quem quer volume/i.test($(".plan-ribbon").textContent),
    $(".plan-ribbon").textContent.trim());
  t("a seção de preços do maior tem fundo escuro",
    $$(".pricing")[2].classList.contains("pricing--dark")
    && !$$(".pricing")[0].classList.contains("pricing--dark"));

  console.log("\n\x1b[1m═══ 4. O DESTACADO É ESCOLHIDO A DEDO ═══\x1b[0m");
  /* Na Kairon: Silver nenhum, Gold o do meio, Kairós o primeiro. NÃO é o mais
     barato, e foi isso que eu havia feito errado em /planosv2. */
  const feat = $$(".pricing").map((s) =>
    [...s.querySelectorAll(".price-card")].findIndex((c) => c.classList.contains("featured")));
  t("plano 1: nenhum destacado", feat[0] === -1);
  t("plano 2: o do MEIO destacado", feat[1] === 1);
  t("plano 3: o PRIMEIRO destacado", feat[2] === 0);
  t("bate com v3_featured do conteúdo",
    JSON.stringify(feat.map((x) => (x === -1 ? null : x)))
      === JSON.stringify(CONT.T.pt.v3_featured), feat.join(" / "));
  t("o destacado ganha borda accent e sombra",
    /\.price-card\.featured\{border:2px solid var\(--accent\);box-shadow:var\(--shadow-accent\)\}/.test(html));

  console.log("\n\x1b[1m═══ 5. O HERÓI ═══\x1b[0m");
  t("pílula com ponto", !!$(".pill") && !!$(".pill i"));
  t("título com a segunda parte em destaque", !!$(".hero .h1 em"),
    $(".hero .h1").textContent.trim());
  t("dois botões no herói", $$(".hero-bts .btn").length === 2);
  t("o primeiro rola para os planos", $$(".hero-bts .btn")[0].getAttribute("href") === "#planos");
  t("o segundo abre o WhatsApp", /wa\.me\//.test($$(".hero-bts .btn")[1].href));
  t("dica de rolagem embaixo", !!$(".hero-scroll") && !!$(".hero-scroll .mouse"));
  t("canvas da constelação", !!$("#ceu"));
  t("o canvas é decorativo para leitor de tela",
    $("#ceu").getAttribute("aria-hidden") === "true");

  console.log("\n\x1b[1m═══ 6. O MENU ═══\x1b[0m");
  const links = $$(".nav-links a");
  t("quatro links: Planos mais um por plano", links.length === 4,
    links.map((a) => a.textContent).join(" · "));
  t("o primeiro aponta para a seção dos planos", links[0].getAttribute("href") === "#planos");
  t("os outros três apontam para a faixa de preço de cada plano",
    links.slice(1).every((a) => /^#precos-/.test(a.getAttribute("href")))
    && links.slice(1).every((a) => !!doc.querySelector(a.getAttribute("href"))),
    links.slice(1).map((a) => a.getAttribute("href")).join(" "));
  t("botão de WhatsApp no menu", /wa\.me\//.test($("#nav_cta").href));
  t("o 'Ver preços' de cada card leva à faixa daquele plano",
    $$(".plan .btn").length === 3
    && $$(".plan .btn").every((b) => !!doc.querySelector(b.getAttribute("href"))));

  console.log("\n\x1b[1m═══ 7. A CONTA FECHA ═══\x1b[0m");
  let fecharam = 0, falhas = [];
  $$(".price-card").forEach((c) => {
    const mensal = nums(c.querySelector(".price-value").textContent)[0];
    const meta = c.querySelector(".price-meta").textContent;
    const total = nums(meta)[0];
    const meses = Math.round(total / mensal);
    Math.abs(mensal * meses - total) <= meses ? fecharam++
      : falhas.push(`${mensal}x${meses}!=${total}`);
  });
  t("os nove cards fecham mensal x meses = total", fecharam === 9, falhas.join(" ") || "9 de 9");
  t("as parcelas respeitam o teto de US$ 2.500 do WHOP", (() => {
    return $$(".price-card").every((c) => {
      const meta = c.querySelector(".price-meta").textContent;
      const total = nums(meta)[0];
      const p = nums(meta)[1];
      return total / p <= 2500 + 1;
    });
  })(), $$(".price-card").map((c) => nums(c.querySelector(".price-meta").textContent).slice(0,2).join("/")).join(" "));
  /* Nenhum preço de plano escrito na página: todos saem do conteudo.js. A
     varredura ignora o teto de cobrança do WHOP, que é regra de pagamento e
     não preço de plano. */
  const semTeto = html.replace(/TETO_COBRANCA[^;]*;/g, "");
  t("nenhum preço de plano escrito no HTML, vem do conteudo.js",
    !/\b(2,?500|4,?500|7,?500|8,?000|13,?500|14,?000|24,?000)\b/.test(semTeto),
    (semTeto.match(/\b(2,?500|4,?500|7,?500|8,?000|13,?500|14,?000|24,?000)\b/) || ["nenhum"])[0]);

  console.log("\n\x1b[1m═══ 8. FORA DO GOOGLE E ÍNTEGRO ═══\x1b[0m");
  const rb = $('meta[name="robots"]');
  t("noindex, nofollow, noarchive", !!rb && /noindex/.test(rb.content)
    && /nofollow/.test(rb.content) && /noarchive/.test(rb.content));
  t("as três notas de transparência", $$(".notas p").length === 3);
  t("assume que a agência é nova", /ainda não tem caso publicado/i.test(visivel()));
  const proibido = [[/garantimos.{0,25}(faturamento|posição|ranking)/i, "garantia"],
    [/\d+\s*clientes\s*atendidos/i, "contagem de clientes"],
    [/primeira p[áa]gina do google/i, "posição"]];
  const achou = proibido.filter(([re]) => re.test(visivel())).map(([, n]) => n);
  t("nenhuma alegação proibida", achou.length === 0, achou.join(", ") || "limpo");
  t("a verba de anúncio só aparece no plano que tem anúncio",
    $$(".price-ads").length === 3
    && $$(".pricing")[2].querySelectorAll(".price-ads").length === 3);

  console.log("\n\x1b[1m═══ 9. OS DOIS IDIOMAS ═══\x1b[0m");
  t("começa em português", doc.documentElement.lang === "pt-BR");
  $$(".idi button").find((b) => b.dataset.idi === "en").click();
  t("troca para inglês", doc.documentElement.lang === "en");
  t("os planos traduziram", /Local Presence/.test($("#grade").textContent));
  t("o menu traduziu", /Presence/.test($("#nav_links").textContent),
    $$(".nav-links a").map((a) => a.textContent).join(" · "));
  t("a ancoragem no maior se mantém",
    $$(".plan")[2].classList.contains("plan--escuro") && $$(".plan-ribbon").length === 1);
  t("o destacado por plano se mantém", (() => {
    const f = $$(".pricing").map((s) =>
      [...s.querySelectorAll(".price-card")].findIndex((c) => c.classList.contains("featured")));
    return f.join() === "-1,1,0";
  })());
  $$(".idi button").find((b) => b.dataset.idi === "pt").click();
  t("volta para português", doc.documentElement.lang === "pt-BR");
  t("nenhum erro de JS no percurso", erros.length === 0, erros[0] || "limpo");

  console.log("\n" + (mal ? "\x1b[31m" : "\x1b[32m") + "\x1b[1m" + ok
    + " passaram, " + mal + " falharam\x1b[0m");
  process.exit(mal ? 1 : 0);
}, 800);
