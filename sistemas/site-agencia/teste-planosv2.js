/* /planosv2 é a proposta COM VALORES, no formato da Kairon: três prazos por
   plano, e quanto mais longo, menor a mensalidade.

   O que este teste protege acima de tudo: a conta tem que fechar. Mensal vezes
   meses tem que dar o total, nos nove casos. Uma divergência aqui aparece na
   frente do cliente, no meio da call, e não tem como consertar na hora. */
const fs = require("fs"), path = require("path");
const { JSDOM } = require("jsdom");
const RAIZ = __dirname;

let ok = 0, mal = 0;
const t = (n, c, d = "") => { c ? (ok++, console.log("  \x1b[32m✓\x1b[0m " + n + (d ? "  → " + d : "")))
  : (mal++, console.log("  \x1b[31m✗ FALHOU\x1b[0m " + n + (d ? "  → " + d : ""))) };

const html = fs.readFileSync(path.join(RAIZ, "planosv2/index.html"), "utf8");
const conteudo = fs.readFileSync(path.join(RAIZ, "conteudo.js"), "utf8");
const pronto = html.replace('<script src="../conteudo.js"></script>',
  "<script>" + conteudo + "</script>");
const CONT = new Function(conteudo + "; return {T:T, WHATSAPP:WHATSAPP};")();

const erros = [];
const dom = new JSDOM(pronto, { runScripts: "dangerously", pretendToBeVisual: true,
  url: "https://leon-group-site.pages.dev/planosv2/",
  beforeParse(w) { w.localStorage.clear();
    w.addEventListener("error", (e) => erros.push(e.message)) } });
const w = dom.window, doc = w.document;
const $ = (s) => doc.querySelector(s), $$ = (s) => [...doc.querySelectorAll(s)];
const visivel = () => doc.body.textContent.replace(/\s+/g, " ");
const nums = (s) => (s.match(/[\d,]+/g) || []).map((x) => Number(x.replace(/,/g, "")));

setTimeout(() => {
  console.log("\n\x1b[1m═══ 1. A PÁGINA MONTOU ═══\x1b[0m");
  t("nenhum erro de JS", erros.length === 0, erros[0] || "limpo");
  t("os três planos", $$(".plano").length === 3,
    $$(".plano-cab h2").map((h) => h.textContent).join(" · "));
  t("três prazos em cada plano", $$(".plano").every((p) => p.querySelectorAll(".prazo").length === 3),
    $$(".prazo").length + " prazos no total");
  t("nenhum preço escrito no HTML, vem do conteudo.js",
    !/2,?500|4,?500|7,?500|8,?000|14,?000|24,?000/.test(html));

  console.log("\n\x1b[1m═══ 2. A CONTA FECHA, NOS NOVE CASOS ═══\x1b[0m");
  /* Mensal x meses = total. É o teste que existe para a página não mostrar uma
     conta errada na frente do cliente. */
  let fecharam = 0, falhas = [];
  $$(".plano").forEach((bloco) => {
    const nome = bloco.querySelector("h2").textContent;
    bloco.querySelectorAll(".prazo").forEach((pz) => {
      const meses = nums(pz.querySelector(".meses").textContent)[0];
      const mensal = nums(pz.querySelector(".num").textContent)[0];
      const total = nums(pz.querySelector(".tot b").textContent)[0];
      // arredondamento de 1 dólar por mês é aceitável; mais que isso não
      Math.abs(mensal * meses - total) <= meses ? fecharam++
        : falhas.push(`${nome} ${meses}m: ${mensal}x${meses}=${mensal * meses} != ${total}`);
    });
  });
  t("os nove prazos fecham mensal x meses = total", fecharam === 9 && !falhas.length,
    falhas.length ? falhas.join(" | ") : "9 de 9");
  t("a mensalidade cai conforme o prazo aumenta, em todo plano",
    $$(".plano").every((b) => {
      const m = [...b.querySelectorAll(".prazo .num")].map((x) => nums(x.textContent)[0]);
      return m[0] > m[1] && m[1] > m[2];
    }),
    $$(".plano").map((b) => [...b.querySelectorAll(".prazo .num")]
      .map((x) => x.textContent).join(">")).join("  ·  "));
  t("o total sobe conforme o prazo aumenta",
    $$(".plano").every((b) => {
      const tt = [...b.querySelectorAll(".prazo .tot b")].map((x) => nums(x.textContent)[0]);
      return tt[0] < tt[1] && tt[1] < tt[2];
    }));
  t("os prazos são 3, 6 e 12 meses",
    $$(".plano")[0] && [...$$(".plano")[0].querySelectorAll(".prazo .meses")]
      .map((x) => nums(x.textContent)[0]).join("/") === "3/6/12");
  t("o desconto aparece nos prazos longos, não no curto",
    $$(".plano").every((b) => {
      const pz = [...b.querySelectorAll(".prazo")];
      return !pz[0].querySelector(".eco") && pz[1].querySelector(".eco") && pz[2].querySelector(".eco");
    }));
  t("o desconto declarado bate com a conta", (() => {
    return $$(".plano").every((b) => {
      const pz = [...b.querySelectorAll(".prazo")];
      const m = pz.map((x) => nums(x.querySelector(".num").textContent)[0]);
      return pz.slice(1).every((x, i) => {
        const dito = nums(x.querySelector(".eco").textContent).pop();
        const real = Math.round((1 - m[i + 1] / m[0]) * 100);
        return Math.abs(dito - real) <= 1;
      });
    });
  })(), $$(".prazo .eco").map((e) => e.textContent.trim()).join(" · "));
  t("o melhor custo por mês é marcado, e é o prazo mais longo",
    $$(".melhor").length === 3
    && $$(".plano").every((b) => {
      const pz = [...b.querySelectorAll(".prazo")];
      return !!pz[2].querySelector(".melhor");
    }));

  console.log("\n\x1b[1m═══ 3. A ANCORAGEM SE MANTÉM ═══\x1b[0m");
  t("só um plano é o alvo", $$(".plano.alvo").length === 1);
  t("e é o PRIMEIRO", $$(".plano")[0].classList.contains("alvo"));
  t("o alvo é o mais barato dos três", (() => {
    const t3 = $$(".plano").map((b) => nums(b.querySelector(".prazo .tot b").textContent)[0]);
    return t3[0] < t3[1] && t3[1] < t3[2];
  })(), $$(".plano").map((b) => b.querySelector(".prazo .tot b").textContent).join(" < "));
  t("o alvo diz 'comece por aqui'", /Comece por aqui/i.test($(".plano.alvo .selo").textContent));
  t("os outros dizem 'para depois'",
    $$(".plano.depois .selo").every((e) => /Para depois/i.test(e.textContent)));
  t("o subtítulo diz que o primeiro resolve o que dói agora",
    /primeiro plano é o que resolve/i.test($("#sub").textContent));

  console.log("\n\x1b[1m═══ 4. O PRAZO DIZ O QUE ACRESCENTA ═══\x1b[0m");
  /* Vender 12 meses de um escopo que é majoritariamente construção inicial,
     sem dizer o que acontece do mês 4 ao 12, seria vender ar. */
  t("cada prazo explica o que acrescenta", $$(".prazo .acresc").length === 9
    && $$(".prazo .acresc").every((a) => a.textContent.length > 40));
  t("o escopo do plano aparece uma vez, no plano, não repetido por prazo",
    $$(".entrega").length === 3);
  t("cada plano lista o que entrega", $$(".plano").every((b) => b.querySelectorAll(".entrega li").length >= 5),
    $$(".plano").map((b) => b.querySelectorAll(".entrega li").length).join("/") + " itens");

  console.log("\n\x1b[1m═══ 5. FORA DO GOOGLE ═══\x1b[0m");
  const rb = $('meta[name="robots"]');
  t("noindex, nofollow e noarchive", !!rb && /noindex/.test(rb.content)
    && /nofollow/.test(rb.content) && /noarchive/.test(rb.content), rb && rb.content);

  console.log("\n\x1b[1m═══ 6. OS BOTÕES ═══\x1b[0m");
  const bts = $$(".prazo .bt");
  t("nove botões, um por prazo", bts.length === 9);
  t("todos abrem o WhatsApp", bts.every((b) => /wa\.me\//.test(b.href)));
  t("e cada um diz o plano E o prazo", bts.every((b) => {
    const m = decodeURIComponent(b.href);
    return /plano/i.test(m) && /\d+ meses/.test(m);
  }), decodeURIComponent(bts[0].href).split("text=")[1] || "");
  t("abrem em aba nova, sem vazar referrer",
    bts.every((b) => b.target === "_blank" && /noopener/.test(b.rel)));
  t("o número do WhatsApp não está escrito na página",
    !new RegExp(CONT.WHATSAPP).test(html));

  console.log("\n\x1b[1m═══ 7. TRANSPARÊNCIA E INTEGRIDADE ═══\x1b[0m");
  t("as três notas", $$(".notas p").length === 3);
  t("assume que a agência é nova", /ainda não tem caso publicado/i.test($("#notas").textContent));
  t("diz que não recebe percentual sobre a verba", /não recebe percentual/i.test($("#notas").textContent));
  t("o rodapé diz que o contrato é lido inteiro antes de aceitar",
    /lê inteiro antes de aceitar/i.test($("#rodape").textContent));
  const proibido = [[/garantimos.{0,25}(faturamento|posição|ranking)/i, "garantia"],
    [/\d+\s*clientes\s*atendidos/i, "contagem de clientes"],
    [/primeira p[áa]gina do google/i, "promessa de posição"]];
  const achou = proibido.filter(([re]) => re.test(visivel())).map(([, n]) => n);
  t("nenhuma alegação proibida", achou.length === 0, achou.join(", ") || "limpo");

  console.log("\n\x1b[1m═══ 8. OS DOIS IDIOMAS ═══\x1b[0m");
  t("começa em português", doc.documentElement.lang === "pt-BR");
  $$(".idi button").find((b) => b.dataset.idi === "en").click();
  t("troca para inglês", doc.documentElement.lang === "en");
  t("os planos traduziram", /Local Presence/.test($("#lista").textContent));
  t("os prazos traduziram", /Quarterly/i.test($("#lista").textContent),
    $$(".prazo .nome")[0].textContent);
  t("a conta continua fechando em inglês", (() => {
    let n = 0;
    $$(".prazo").forEach((pz) => {
      const meses = nums(pz.querySelector(".meses").textContent)[0];
      const mensal = nums(pz.querySelector(".num").textContent)[0];
      const total = nums(pz.querySelector(".tot b").textContent)[0];
      if (Math.abs(mensal * meses - total) <= meses) n++;
    });
    return n === 9;
  })());
  t("e a ancoragem se mantém", $$(".plano")[0].classList.contains("alvo")
    && /Start here/i.test($(".plano.alvo .selo").textContent));
  $$(".idi button").find((b) => b.dataset.idi === "pt").click();
  t("volta para português", doc.documentElement.lang === "pt-BR");
  t("nenhum erro de JS no percurso", erros.length === 0, erros[0] || "limpo");

  console.log("\n" + (mal ? "\x1b[31m" : "\x1b[32m") + "\x1b[1m" + ok
    + " passaram, " + mal + " falharam\x1b[0m");
  process.exit(mal ? 1 : 0);
}, 700);
