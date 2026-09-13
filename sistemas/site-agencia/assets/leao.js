/* ═══════════════════════════════════════════════════════════════════
   O LEÃO DA MARCA NAS PÁGINAS DE PLANOS

   Duas coisas, num arquivo só, usado pelas três versões (/planos,
   /planosv2, /planosv3). Arquivo único de propósito: três cópias de
   animação divergem, e no dia em que divergirem uma das páginas de
   proposta abre na call com um comportamento que ninguém revisou.

   1. LEÃO DE FUNDO. Uma camada fixa que atravessa a tela conforme a
      pessoa rola, no mesmo espírito do leão da home, mas guiado pela
      fração de rolagem em vez de por seções, porque as três páginas têm
      alturas e estruturas diferentes e nenhuma tem as mesmas âncoras.

   2. CURSOR LEÃO. O ponteiro do computador vira a cabeça do leão. Só em
      quem tem mouse de verdade (`hover:hover` e `pointer:fine`): em tela
      de toque não existe cursor, e forçar um ali só atrapalha.

   ── A regra de segurança que manda neste arquivo ──
   O cursor nativo só é escondido DEPOIS que a imagem do leão carregou e
   o elemento está na tela. Se o arquivo não carregar, se a imagem falhar
   ou se o JS morrer antes disso, a página fica com o cursor normal do
   sistema. Página de proposta sem cursor nenhum, aberta na frente do
   cliente, é pior do que página sem efeito.

   ── Como cada página liga ──
   <script src="../assets/leao.js" data-conteudo=".topo,.env" data-forca=".07"></script>

   `data-conteudo`  os seletores que seguram o conteúdo. Eles sobem para
                    z-index 2 e o leão fica no 1, então o leão passa por
                    cima do fundo das seções e NUNCA por cima do texto.
                    Errar esse seletor é o único jeito de o leão cobrir
                    palavra escrita, então ele é obrigatório e explícito.
   `data-forca`     opacidade base do leão naquela página. As claras
                    pedem menos, a v3 tem faixa escura e aguenta mais.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) return;                       // sem referência ao próprio src, não dá para achar a imagem

  var CONTEUDO = (script.getAttribute("data-conteudo") || ".env").trim();
  var FORCA = parseFloat(script.getAttribute("data-forca")) || 0.07;
  var IMG = new URL("simbolo.png", script.src).href;

  var raiz = document.documentElement;
  var suave = false;                         // true = a pessoa pediu menos movimento no sistema
  try {
    suave = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  } catch (e) {}

  var temMouse = false;
  try {
    temMouse = !!(window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  } catch (e) {}

  /* ─────────────────────────── estilo ───────────────────────────
     Tudo que é do leão mora aqui dentro, inclusive o z-index do
     conteúdo da página. Assim o HTML de cada versão ganha uma linha
     só, e desligar o efeito é apagar essa linha. */
  /* `:where()` zera a especificidade: isto vira um PADRÃO que qualquer regra
     da própria página derruba. Sem ele, esta linha entra no <head> depois do
     estilo da página, ganha no desempate e rebaixa o que já estava
     posicionado. Foi o que quase aconteceu com o menu da v3, que é
     `position:sticky;z-index:40`: viraria `relative;z-index:2` e o menu
     desgrudaria do topo. O leão não pode mexer no layout de quem o hospeda. */
  var padrao = ":where(" + CONTEUDO + "){position:relative;z-index:2}";

  var css = [
    padrao,

    ".leao-fundo{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden}",
    ".leao-fundo .simb,.leao-fundo .brilho{position:absolute;left:0;top:0;",
    "transform:translate3d(var(--lx,74vw),var(--ly,36vh),0) translate(-50%,-50%)",
    " rotate(var(--lr,-7deg)) scale(var(--ls,1.1));will-change:transform,opacity}",
    ".leao-fundo .simb{width:min(46vw,560px);height:auto;opacity:var(--lo,.07);",
    "filter:saturate(1.22) contrast(1.04)}",
    ".leao-fundo .brilho{width:min(62vw,740px);height:min(62vw,740px);border-radius:50%;",
    "background:radial-gradient(circle,rgba(230,90,25,.5),rgba(230,90,25,.13) 46%,transparent 70%);",
    "opacity:calc(var(--lo,.07) * 1.1)}",
    "@media (max-width:760px){.leao-fundo .simb{width:78vw}",
    ".leao-fundo .brilho{width:96vw;height:96vw}}",

    /* O cursor fica acima de tudo, inclusive de menu fixo e modal. */
    ".leao-cursor{position:fixed;left:0;top:0;width:26px;height:26px;",
    "z-index:2147483000;pointer-events:none;opacity:0;",
    "transform:translate3d(var(--cx,-100px),var(--cy,-100px),0) translate(-50%,-50%)",
    " rotate(var(--crot,0deg)) scale(var(--cesc,1));",
    "transition:opacity .2s linear;will-change:transform,opacity}",
    ".leao-cursor.on{opacity:1}",
    ".leao-cursor.sumiu{opacity:0}",
    ".leao-cursor img{width:100%;height:100%;display:block;",
    "filter:drop-shadow(0 2px 7px rgba(23,23,23,.34))}",
    /* o halo só acende sobre coisa clicável: é o que substitui a mãozinha */
    ".leao-cursor::before{content:'';position:absolute;inset:-62%;border-radius:50%;",
    "background:radial-gradient(circle,rgba(230,90,25,.4),rgba(230,90,25,0) 68%);",
    "opacity:var(--chalo,0);transition:opacity .22s ease}",

    "html.leao-cursor-on,html.leao-cursor-on *{cursor:none}",
    /* campo de texto devolve o cursor do sistema: sem barrinha ninguém
       sabe onde está escrevendo, e isso vale mais que o efeito */
    "html.leao-cursor-on input,html.leao-cursor-on textarea,",
    "html.leao-cursor-on select,html.leao-cursor-on [contenteditable]{cursor:auto}",

    "@media print{.leao-fundo,.leao-cursor{display:none!important}}"
  ].join("");

  var estilo = document.createElement("style");
  estilo.setAttribute("data-leao", "");
  estilo.textContent = css;
  document.head.appendChild(estilo);

  /* ──────────────────────── leão de fundo ────────────────────────
     Cinco paradas ao longo da rolagem, da primeira tela ao rodapé. Ele
     cruza a tela de um lado para o outro enquanto a pessoa desce, e a
     interpolação suavizada faz ele deslizar em vez de saltar.
     x/y em vw/vh · s escala · r rotação · o multiplicador da opacidade */
  var PARADAS = [
    { p: 0.00, x: 80, y: 26, s: 1.10, r: -8,  o: 1.00 },
    { p: 0.27, x: 14, y: 58, s: 0.86, r:  11, o: 0.64 },
    { p: 0.52, x: 88, y: 40, s: 1.28, r: -6,  o: 1.00 },
    { p: 0.76, x: 18, y: 30, s: 0.96, r:  9,  o: 0.60 },
    { p: 1.00, x: 76, y: 68, s: 1.42, r: -11, o: 1.00 }
  ];

  var fundo = document.createElement("div");
  fundo.className = "leao-fundo";
  fundo.setAttribute("aria-hidden", "true");
  fundo.innerHTML = '<div class="brilho"></div><img class="simb" src="' + IMG + '" alt="">';

  function progresso() {
    var alt = (document.documentElement.scrollHeight || 0) - (window.innerHeight || 0);
    if (!(alt > 0)) return 0;                // página que não rola: fica na primeira parada
    var y = window.pageYOffset || window.scrollY || 0;
    return Math.max(0, Math.min(1, y / alt));
  }

  function moverFundo(t) {
    var k = progresso(), i = 0;
    while (i < PARADAS.length - 2 && PARADAS[i + 1].p < k) i++;
    var a = PARADAS[i], b = PARADAS[i + 1];
    var vao = (b.p - a.p) || 1;
    var f = Math.max(0, Math.min(1, (k - a.p) / vao));
    f = f * f * (3 - 2 * f);                 // suaviza a entrada e a saída de cada parada
    var mix = function (p, q) { return p + (q - p) * f };

    /* respiro: mesmo parado ele balança de leve, senão a página parece
       congelada quando a pessoa para de rolar para ler um plano */
    var bx = 0, by = 0, br = 0;
    if (!suave) {
      by = Math.sin(t / 3400) * 1.3;
      bx = Math.cos(t / 4700) * 0.9;
      br = Math.sin(t / 5200) * 1.2;
    }

    var s = fundo.style;
    s.setProperty("--lx", (mix(a.x, b.x) + bx).toFixed(2) + "vw");
    s.setProperty("--ly", (mix(a.y, b.y) + by).toFixed(2) + "vh");
    s.setProperty("--ls", mix(a.s, b.s).toFixed(3));
    s.setProperty("--lr", (mix(a.r, b.r) + br).toFixed(2) + "deg");
    s.setProperty("--lo", (FORCA * mix(a.o, b.o)).toFixed(4));
  }

  /* ───────────────────────── cursor leão ─────────────────────────
     O leão persegue o ponteiro com um atraso curto: perto o bastante
     para clicar sem errar, solto o bastante para parecer vivo. */
  var CLICAVEL = 'a,button,[role="button"],summary,label,select,' +
                 'input[type="submit"],input[type="button"],input[type="checkbox"],' +
                 'input[type="radio"],[data-idi]';
  var TEXTO = 'input,textarea,[contenteditable="true"]';

  var cursor = null;
  var mx = 0, my = 0, cx = 0, cy = 0;        // m = ponteiro de verdade · c = leão na tela
  var esc = 1, rot = 0, halo = 0;
  /* O tamanho é derivado de dois estados, nunca multiplicado e dividido de
     volta: apertar o botão sobre um link e soltar fora dele deixaria a conta
     desamarrada, e o leão ficaria preso num tamanho que não é de nada. */
  var sobreClicavel = false, pressionado = false;
  var escAlvo = function () {
    return (sobreClicavel ? 1.55 : 1) * (pressionado ? 0.72 : 1);
  };

  function montarCursor() {
    cursor = document.createElement("div");
    cursor.className = "leao-cursor";
    cursor.setAttribute("aria-hidden", "true");

    var img = document.createElement("img");
    img.alt = "";
    img.decoding = "async";

    /* ── o portão de segurança ──
       Esconder o cursor do sistema é a última coisa que acontece, e só
       acontece se a imagem realmente apareceu. Qualquer falha antes
       daqui deixa a página com o ponteiro normal. */
    var ligar = function () {
      if (!cursor.isConnected) return;
      raiz.classList.add("leao-cursor-on");
      cursor.classList.add("on");
    };
    img.addEventListener("load", ligar);
    img.addEventListener("error", function () {
      if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
      raiz.classList.remove("leao-cursor-on");
    });
    img.src = IMG;
    cursor.appendChild(img);
    document.body.appendChild(cursor);
    if (img.complete && img.naturalWidth > 0) ligar();

    mx = cx = (window.innerWidth || 0) / 2;
    my = cy = (window.innerHeight || 0) / 2;

    addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      cursor.classList.remove("sumiu");
    }, { passive: true });

    /* Sair da janela some com o leão, senão ele fica parado na borda
       como se a página tivesse travado. */
    addEventListener("mouseleave", function () { cursor.classList.add("sumiu") });
    addEventListener("blur", function () { cursor.classList.add("sumiu") });

    addEventListener("mouseover", function (e) {
      var alvo = e.target;
      if (!alvo || !alvo.closest) return;
      if (alvo.closest(TEXTO)) {             // em campo de texto o leão sai de cena
        cursor.classList.add("sumiu");
        sobreClicavel = false; halo = 0;
        return;
      }
      cursor.classList.remove("sumiu");
      sobreClicavel = !!alvo.closest(CLICAVEL);
      halo = sobreClicavel ? 1 : 0;
    }, { passive: true });

    addEventListener("mousedown", function () { pressionado = true }, { passive: true });
    addEventListener("mouseup", function () { pressionado = false }, { passive: true });
    // soltar o botão fora da janela nunca chega como mouseup: sem isto o
    // leão voltaria encolhido e ficaria assim
    addEventListener("blur", function () { pressionado = false });
  }

  function moverCursor() {
    if (!cursor) return;
    if (suave) {                             // sem perseguição nem inclinação
      cx = mx; cy = my; esc = escAlvo(); rot = 0;
    } else {
      var dx = mx - cx, dy = my - cy;
      cx += dx * 0.34;
      cy += dy * 0.34;
      esc += (escAlvo() - esc) * 0.18;
      /* inclina para o lado do movimento: é o que dá a sensação de que
         o leão está olhando para onde a pessoa vai */
      var alvoRot = Math.max(-13, Math.min(13, dx * 0.55));
      rot += (alvoRot - rot) * 0.12;
    }
    var s = cursor.style;
    s.setProperty("--cx", cx.toFixed(1) + "px");
    s.setProperty("--cy", cy.toFixed(1) + "px");
    s.setProperty("--cesc", esc.toFixed(3));
    s.setProperty("--crot", rot.toFixed(2) + "deg");
    s.setProperty("--chalo", String(halo));
  }

  /* ──────────────────────── laço e arranque ──────────────────────── */
  var rodando = false;

  function laco(t) {
    if (!rodando) return;
    moverFundo(t || 0);
    moverCursor();
    requestAnimationFrame(laco);
  }

  /* Navegador sem `:where()` (anterior a 2021) descarta aquela regra inteira
     por ser seletor desconhecido, e aí o conteúdo não sobe e o leão passa por
     cima do texto. Nesse caso a camada é garantida elemento a elemento, sem
     encostar em quem já está posicionado ou já tem z-index maior. */
  function garantirCamada() {
    var apoia = false;
    try { apoia = !!(window.CSS && CSS.supports && CSS.supports("selector(:where(a))")) } catch (e) {}
    if (apoia) return;
    var lista = document.querySelectorAll(CONTEUDO);
    for (var i = 0; i < lista.length; i++) {
      var el = lista[i], pos = "static", zi = "auto";
      try { var c = getComputedStyle(el); pos = c.position; zi = c.zIndex } catch (e) {}
      if (pos === "static") el.style.position = "relative";
      if (zi === "auto" || zi === "" || Number(zi) < 2) el.style.zIndex = "2";
    }
  }

  function arrancar() {
    if (!document.body) return;
    garantirCamada();
    document.body.appendChild(fundo);
    if (temMouse) montarCursor();

    moverFundo(0);
    moverCursor();

    if (typeof requestAnimationFrame !== "function") return;
    rodando = true;
    requestAnimationFrame(laco);

    /* Aba escondida não anima: nada para ver, e o laço continuar ali
       só gasta bateria de quem deixou a proposta aberta numa guia. */
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { rodando = false; return }
      if (!rodando) { rodando = true; requestAnimationFrame(laco) }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arrancar);
  } else {
    arrancar();
  }
})();
