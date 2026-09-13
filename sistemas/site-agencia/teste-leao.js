/* O leão das páginas de proposta: fundo que atravessa a tela na rolagem, e o
   ponteiro do mouse virando a cabeça do leão.

   O teste que mais importa aqui não é o do efeito, é o do PORTÃO: o cursor do
   sistema só pode ser escondido depois que a imagem do leão apareceu de fato.
   Se alguém inverter essa ordem um dia, a página de proposta abre na call com
   cursor nenhum na tela, e o cliente fica sem saber onde está clicando.

   O segundo que mais importa é o do z-index. O leão passa por cima do FUNDO
   das seções e nunca por cima de texto, e isso depende do seletor que cada
   página passa em `data-conteudo`. Um seletor com erro de digitação não quebra
   nada visivelmente na hora: só solta o leão por cima do preço. */
const fs = require("fs"), path = require("path");
const { JSDOM, requestInterceptor, VirtualConsole } = require("jsdom");
const RAIZ = __dirname;
const ORIGEM = "https://leon-group-site.pages.dev";

let ok = 0, mal = 0;
const t = (n, c, d = "") => { c ? (ok++, console.log("  \x1b[32m✓\x1b[0m " + n + (d ? "  → " + d : "")))
  : (mal++, console.log("  \x1b[31m✗ FALHOU\x1b[0m " + n + (d ? "  → " + d : ""))) };

const PAGINAS = ["planos", "planosv2", "planosv3"];
const fonte = {};
PAGINAS.forEach((p) => { fonte[p] = fs.readFileSync(path.join(RAIZ, p, "index.html"), "utf8") });
const leao = fs.readFileSync(path.join(RAIZ, "assets/leao.js"), "utf8");

/* Abre uma das páginas de verdade, servindo os arquivos locais do disco.
   Nada sai para a rede: origem de fora devolve resposta vazia, senão a suíte
   passa a depender de internet e de o Google Fonts estar no ar. */
function abrir(pagina, opcoes = {}) {
  const erros = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => { if (!/Could not load link/.test(e.message)) erros.push(e.message) });

  const dom = new JSDOM(fonte[pagina], {
    runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc,
    url: ORIGEM + "/" + pagina + "/",
    resources: { interceptors: [requestInterceptor((req) => {
      const u = new URL(req.url);
      if (u.origin !== ORIGEM) return new Response("", { status: 200 });
      const f = path.join(RAIZ, decodeURIComponent(u.pathname));
      if (f.startsWith(RAIZ) && fs.existsSync(f) && fs.statSync(f).isFile()) {
        return new Response(fs.readFileSync(f), { headers: { "Content-Type":
          u.pathname.endsWith(".js") ? "text/javascript" : "image/png" } });
      }
      return new Response("", { status: 404 });
    })] },
    beforeParse(w) {
      w.localStorage.clear();
      w.addEventListener("error", (e) => erros.push(e.message));
      // jsdom não tem canvas: a constelação do herói da v3 não pode derrubar
      // a página por causa disso. Mesmo remendo de teste-planosv3.js.
      w.HTMLCanvasElement.prototype.getContext = () => null;
      // jsdom responde `false` para toda media query: sem esse trecho o
      // cursor nunca liga e o teste do cursor não testa nada.
      w.matchMedia = (q) => ({
        matches: /prefers-reduced-motion/.test(q) ? !!opcoes.suave : !!opcoes.mouse,
        media: q, onchange: null, addListener() {}, removeListener() {},
        addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false }
      });
    }
  });

  const w = dom.window, doc = w.document;
  const espera = (ms) => new Promise((r) => setTimeout(r, ms));
  return espera(220).then(() => ({
    w, doc, erros, dom, espera,
    css: () => (doc.querySelector("style[data-leao]") || { textContent: "" }).textContent,
    fundo: () => doc.querySelector(".leao-fundo"),
    cursor: () => doc.querySelector(".leao-cursor"),
    // jsdom não faz layout: a altura rolável tem que ser encenada na mão
    rolar: (y, alt = 5000) => {
      Object.defineProperty(doc.documentElement, "scrollHeight", { value: alt, configurable: true });
      Object.defineProperty(w, "pageYOffset", { value: y, configurable: true });
      return espera(90);
    },
    varFundo: (n) => doc.querySelector(".leao-fundo").style.getPropertyValue("--" + n),
    varCursor: (n) => doc.querySelector(".leao-cursor").style.getPropertyValue("--" + n)
  }));
}

const num = (s) => parseFloat(String(s).replace(/[a-z%]+$/i, ""));

/* Mede o percurso inteiro em vez de apostar em dois ou três pontos: o leão
   vai e volta pela tela, e amostrar só o começo e o fim pode pegar duas
   posições parecidas e concluir, errado, que ele ficou parado. */
const ALTURA = 5000;
async function percurso(a, passos = 10) {
  const rolavel = ALTURA - a.w.innerHeight;
  const xs = [], ys = [];
  for (let i = 0; i <= passos; i++) {
    await a.rolar(Math.round((rolavel * i) / passos), ALTURA);
    xs.push(num(a.varFundo("lx")));
    ys.push(num(a.varFundo("ly")));
  }
  return { xs, ys,
    larguraX: Math.max(...xs) - Math.min(...xs),
    minX: Math.min(...xs), maxX: Math.max(...xs),
    alturaY: Math.max(...ys) - Math.min(...ys) };
}

(async () => {

console.log("\n\x1b[1m═══ 1. AS TRÊS PÁGINAS LIGAM O MESMO ARQUIVO ═══\x1b[0m");
t("assets/leao.js existe", fs.existsSync(path.join(RAIZ, "assets/leao.js")),
  leao.length + " bytes");
t("assets/simbolo.png existe, é a imagem do leão",
  fs.existsSync(path.join(RAIZ, "assets/simbolo.png")));

PAGINAS.forEach((p) => {
  const tag = (fonte[p].match(/<script[^>]*assets\/leao\.js[^>]*><\/script>/) || [""])[0];
  t("/" + p + " carrega ../assets/leao.js", /src="\.\.\/assets\/leao\.js"/.test(tag));

  const conteudo = (tag.match(/data-conteudo="([^"]+)"/) || [])[1];
  t("/" + p + " declara data-conteudo", !!conteudo, conteudo || "ausente");

  const forca = parseFloat((tag.match(/data-forca="([^"]+)"/) || [])[1]);
  t("/" + p + " declara data-forca em faixa de marca d'água",
    forca > 0 && forca <= 0.12, String(forca));

  // um seletor com erro de digitação não quebra nada na hora: só larga o
  // leão por cima do texto. Por isso ele é conferido contra o HTML real.
  const d = new JSDOM(fonte[p]);
  const falhou = (conteudo || "").split(",").filter((s) => !d.window.document.querySelector(s.trim()));
  t("/" + p + ": todo seletor de data-conteudo existe na página",
    conteudo && falhou.length === 0, falhou.length ? "não casou: " + falhou.join(",") : conteudo);

  t("/" + p + " não tem cópia do CSS do leão no HTML",
    !/\.leao-fundo|\.leao-cursor/.test(fonte[p]), "fonte única em assets/leao.js");
});

console.log("\n\x1b[1m═══ 2. O LEÃO DE FUNDO ═══\x1b[0m");
{
  const a = await abrir("planos", { mouse: true });
  t("nenhum erro de JS na página com o leão", a.erros.length === 0, a.erros[0] || "limpo");
  t("a camada do leão foi criada", !!a.fundo());
  t("a camada é invisível pra leitor de tela", a.fundo().getAttribute("aria-hidden") === "true");
  t("tem o símbolo e o brilho", !!a.fundo().querySelector("img.simb") && !!a.fundo().querySelector(".brilho"));
  t("o símbolo aponta pro PNG da marca",
    /assets\/simbolo\.png$/.test(a.fundo().querySelector("img.simb").src));

  const css = a.css();
  t("a camada não intercepta clique", /\.leao-fundo\{[^}]*pointer-events:none/.test(css));
  t("o leão fica no z-index 1", /\.leao-fundo\{[^}]*z-index:1/.test(css));
  t("o conteúdo da página sobe pro z-index 2, acima do leão",
    /:where\(\.topo,\.env\)\{position:relative;z-index:2\}/.test(css));
  t("e sobe como PADRÃO, via :where, sem ganhar do estilo da página",
    css.indexOf(":where(") === 0,
    "especificidade zero: qualquer regra da página derruba");
  t("o conteúdo fica mesmo acima do leão, no estilo calculado",
    a.w.getComputedStyle(a.doc.querySelector(".env")).zIndex === "2");
  t("o leão some na impressão", /@media print\{[^}]*\.leao-fundo[^}]*display:none/.test(css));

  const p = await percurso(a);
  t("no topo o leão está do lado direito", p.xs[0] > 60, p.xs[0].toFixed(1) + "vw");
  t("descendo a página ele atravessa de um lado ao outro",
    p.minX < 25 && p.maxX > 75, p.minX.toFixed(0) + "vw … " + p.maxX.toFixed(0) + "vw");
  t("ele se move na vertical também, não só de lado", p.alturaY > 25,
    p.alturaY.toFixed(0) + "vh de percurso");
  t("não fica parado em trecho nenhum da rolagem",
    p.xs.every((x, i) => i === 0 || Math.abs(x - p.xs[i - 1]) > 0.5),
    p.xs.map((x) => x.toFixed(0)).join(" → "));

  t("a opacidade nunca passa de marca d'água", num(a.varFundo("lo")) <= 0.12,
    a.varFundo("lo"));
  t("e nunca chega a zero, senão o efeito some", num(a.varFundo("lo")) > 0.01,
    a.varFundo("lo"));

  // página curta demais para rolar não pode dividir por zero nem sumir
  await a.rolar(0, 0);
  t("página que não rola não quebra o cálculo", !isNaN(num(a.varFundo("lx"))),
    a.varFundo("lx"));
  a.w.close();
}

console.log("\n\x1b[1m═══ 3. O PORTÃO: CURSOR DO SISTEMA SÓ SOME DEPOIS DA IMAGEM ═══\x1b[0m");
{
  const a = await abrir("planos", { mouse: true });
  const c = a.cursor();
  t("com mouse de verdade, o cursor leão é montado", !!c);
  t("o cursor é invisível pra leitor de tela", c.getAttribute("aria-hidden") === "true");
  t("o cursor não intercepta clique", /\.leao-cursor\{[^}]*pointer-events:none/.test(a.css()));

  // jsdom não carrega imagem (o pacote canvas não está instalado), então este
  // é exatamente o estado "a imagem ainda não apareceu"
  t("ANTES da imagem carregar, o cursor do sistema continua na tela",
    !a.doc.documentElement.classList.contains("leao-cursor-on"),
    "html sem a classe: '" + a.doc.documentElement.className + "'");
  t("e o leão ainda não está visível", !c.classList.contains("on"));

  c.querySelector("img").dispatchEvent(new a.w.Event("load"));
  t("DEPOIS do load, o cursor do sistema é escondido",
    a.doc.documentElement.classList.contains("leao-cursor-on"));
  t("e o leão aparece", c.classList.contains("on"));

  const css = a.css();
  t("o cursor nativo só some sob essa classe, nunca por padrão",
    /html\.leao-cursor-on,html\.leao-cursor-on \*\{cursor:none\}/.test(css) &&
    !/^\s*\*\{cursor:none/.test(css));
  t("campo de texto devolve o cursor do sistema",
    /html\.leao-cursor-on input,html\.leao-cursor-on textarea/.test(css) &&
    /\{cursor:auto\}/.test(css));
  t("o cursor some na impressão", /@media print\{[^}]*\.leao-cursor[^}]*display:none/.test(css));
  a.w.close();
}

console.log("\n\x1b[1m═══ 4. SE A IMAGEM FALHAR, A PÁGINA VOLTA AO NORMAL ═══\x1b[0m");
{
  const a = await abrir("planos", { mouse: true });
  const c = a.cursor();
  c.querySelector("img").dispatchEvent(new a.w.Event("load"));
  t("partiu do estado ligado", a.doc.documentElement.classList.contains("leao-cursor-on"));

  c.querySelector("img").dispatchEvent(new a.w.Event("error"));
  t("erro na imagem tira o leão da tela", !a.doc.querySelector(".leao-cursor"));
  t("e devolve o cursor do sistema",
    !a.doc.documentElement.classList.contains("leao-cursor-on"));
  a.w.close();
}

console.log("\n\x1b[1m═══ 5. O LEÃO SEGUE O MOUSE ═══\x1b[0m");
{
  const a = await abrir("planos", { mouse: true });
  const c = a.cursor();
  c.querySelector("img").dispatchEvent(new a.w.Event("load"));
  const meio = a.w.innerWidth / 2;

  a.w.dispatchEvent(new a.w.MouseEvent("mousemove", { clientX: 300, clientY: 200 }));
  await a.espera(140);
  const x = num(a.varCursor("cx")), y = num(a.varCursor("cy"));
  t("o leão caminha até onde o ponteiro está", x < meio - 50 && x < 320 && x > 280,
    "x " + x.toFixed(0) + " para um ponteiro em 300");
  t("na vertical também", y < 260 && y > 180, "y " + y.toFixed(0) + " para 200");

  t("parado sobre texto comum, sem halo", num(a.varCursor("chalo")) === 0);

  const link = a.doc.querySelector(".duvida a") || a.doc.querySelector("a[href]");
  link.dispatchEvent(new a.w.MouseEvent("mouseover", { bubbles: true }));
  await a.espera(140);
  t("sobre link, o halo laranja acende no lugar da mãozinha",
    num(a.varCursor("chalo")) === 1);
  t("e o leão cresce", num(a.varCursor("cesc")) > 1.1, a.varCursor("cesc"));

  const texto = a.doc.querySelector("h1") || a.doc.body;
  texto.dispatchEvent(new a.w.MouseEvent("mouseover", { bubbles: true }));
  await a.espera(160);
  t("saindo do link, o halo apaga", num(a.varCursor("chalo")) === 0);
  t("e ele volta ao tamanho normal", num(a.varCursor("cesc")) < 1.2, a.varCursor("cesc"));

  /* Apertar o botão sobre um link e soltar fora dele: o caminho que deixava
     o leão preso num tamanho que não corresponde a nada. */
  link.dispatchEvent(new a.w.MouseEvent("mouseover", { bubbles: true }));
  a.w.dispatchEvent(new a.w.MouseEvent("mousedown", { bubbles: true }));
  await a.espera(120);
  t("apertar o botão encolhe o leão", num(a.varCursor("cesc")) < 1.2, a.varCursor("cesc"));
  texto.dispatchEvent(new a.w.MouseEvent("mouseover", { bubbles: true }));
  a.w.dispatchEvent(new a.w.MouseEvent("mouseup", { bubbles: true }));
  await a.espera(200);
  t("soltar fora do link devolve o tamanho certo, sem ficar preso",
    Math.abs(num(a.varCursor("cesc")) - 1) < 0.06, a.varCursor("cesc"));

  a.w.dispatchEvent(new a.w.Event("mouseleave"));
  t("sair da janela some com o leão, em vez de largar ele na borda",
    c.classList.contains("sumiu"));
  a.w.dispatchEvent(new a.w.MouseEvent("mousemove", { clientX: 400, clientY: 400 }));
  t("e voltar traz ele de volta", !c.classList.contains("sumiu"));
  a.w.close();
}

console.log("\n\x1b[1m═══ 6. TELA DE TOQUE E MENOS MOVIMENTO ═══\x1b[0m");
{
  const a = await abrir("planos", { mouse: false });
  t("sem mouse de verdade, nenhum cursor leão é montado", !a.cursor());
  t("e o cursor do sistema nunca é escondido",
    !a.doc.documentElement.classList.contains("leao-cursor-on"));
  t("mas o leão de fundo continua lá", !!a.fundo());
  t("nenhum erro de JS no caminho do toque", a.erros.length === 0, a.erros[0] || "limpo");
  a.w.close();
}
{
  const a = await abrir("planos", { mouse: true, suave: true });
  const c = a.cursor();
  c.querySelector("img").dispatchEvent(new a.w.Event("load"));
  t("com 'menos movimento' o cursor leão continua existindo", !!c);
  a.w.dispatchEvent(new a.w.MouseEvent("mousemove", { clientX: 700, clientY: 500 }));
  await a.espera(120);
  t("mas ele gruda no ponteiro, sem perseguição", num(a.varCursor("cx")) === 700,
    a.varCursor("cx"));
  t("e não inclina", num(a.varCursor("crot")) === 0, a.varCursor("crot"));

  await a.rolar(2500);
  const y1 = num(a.varFundo("ly"));
  await a.espera(120);
  t("o leão de fundo para de respirar, só anda com a rolagem",
    num(a.varFundo("ly")) === y1, y1 + "vh parado");
  t("nenhum erro de JS no caminho de menos movimento", a.erros.length === 0, a.erros[0] || "limpo");
  a.w.close();
}

console.log("\n\x1b[1m═══ 7. AS OUTRAS DUAS VERSÕES ═══\x1b[0m");
for (const p of ["planosv2", "planosv3"]) {
  const a = await abrir(p, { mouse: true });
  t("/" + p + ": nenhum erro de JS", a.erros.length === 0, a.erros[0] || "limpo");
  t("/" + p + ": leão de fundo montado", !!a.fundo());
  t("/" + p + ": cursor leão montado", !!a.cursor());
  a.cursor().querySelector("img").dispatchEvent(new a.w.Event("load"));
  t("/" + p + ": cursor do sistema escondido só depois do load",
    a.doc.documentElement.classList.contains("leao-cursor-on"));

  const alvo = (fonte[p].match(/data-conteudo="([^"]+)"/) || [])[1];
  t("/" + p + ": o conteúdo dela sobe pro z-index 2",
    a.css().indexOf(":where(" + alvo + "){position:relative;z-index:2}") === 0,
    alvo);

  /* O leão não pode mexer no layout de quem o hospeda. O menu da v3 é
     `position:sticky;z-index:40`, e uma regra de especificidade normal
     injetada no <head> depois do estilo da página o rebaixaria para
     `relative;z-index:2`: o menu descolaria do topo ao rolar. */
  if (p === "planosv3") {
    const nav = a.doc.querySelector(".nav");
    const est = a.w.getComputedStyle(nav);
    t("/planosv3: o menu continua grudado no topo", est.position === "sticky", est.position);
    t("/planosv3: e continua acima de tudo, no z-index dele", est.zIndex === "40", est.zIndex);
    t("/planosv3: o leão não escreveu estilo no menu", !nav.getAttribute("style"),
      nav.getAttribute("style") || "sem style inline");
    t("/planosv3: o conteúdo das seções está acima do leão",
      a.w.getComputedStyle(a.doc.querySelector(".section .container")).zIndex === "2");
  }

  const perc = await percurso(a);
  t("/" + p + ": o leão atravessa a tela na rolagem",
    perc.minX < 25 && perc.maxX > 75 && perc.alturaY > 25,
    perc.minX.toFixed(0) + "vw … " + perc.maxX.toFixed(0) + "vw");
  a.w.close();
}

console.log("\n\x1b[1m═══ 8. A PÁGINA CONTINUA FORA DO GOOGLE ═══\x1b[0m");
PAGINAS.forEach((p) => {
  t("/" + p + " segue noindex depois da mudança",
    /<meta name="robots" content="noindex,nofollow,noarchive">/.test(fonte[p]));
});

console.log("\n" + (mal === 0
  ? "\x1b[32m\x1b[1m✓ " + ok + " verificações, tudo certo\x1b[0m\n"
  : "\x1b[31m\x1b[1m✗ " + mal + " falhas em " + (ok + mal) + " verificações\x1b[0m\n"));
process.exit(mal === 0 ? 0 : 1);

})().catch((e) => { console.error(e); process.exit(1) });
