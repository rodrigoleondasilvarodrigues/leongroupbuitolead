/* ═══════════ A CONDIÇÃO DE REUNIÃO, ESCONDIDA ═══════════
   Uma oferta que NÃO está na página e que só existe quando o Rodrigo a chama,
   ao vivo, dentro da call: US$ 2.000 por mês, recorrente.

   ── por que escondida ──
   Se o valor estivesse impresso na tabela, ele viraria o preço da agência e
   os planos de cima viram enfeite. Escondido, ele é o que ele deve ser: uma
   condição que aparece no momento da decisão, e só para quem está na reunião.

   ── como abrir ──
   Digite  l e o n  no teclado, com a página em foco. Quatro letras, sem clique
   e sem nada na barra de endereço, então no compartilhamento de tela o cliente
   vê a oferta surgir sem ver como. Não dispara enquanto o cursor estiver dentro
   de campo de texto. ESC fecha.

   ── por que não é ?param na URL ──
   Na call a barra de endereço está visível. "?oferta=2000" entrega o truque e,
   pior, fica no histórico e pode vazar num print.                          */

(function () {
  "use strict";

  var SEGREDO = "leon";
  var digitado = "";
  var aberto = false;

  var T = {
    pt: {
      selo: "Condição de reunião",
      titulo: "Uma porta que não está na tabela",
      sub: "Válida nesta conversa, para começar agora.",
      unid: "por mês",
      rec: "recorrente, sem prazo mínimo",
      inclui: "O que entra",
      itens: [
        "Perfil no Google criado e otimizado, e mantido todo mês",
        "Site no ar, com o seu WhatsApp no botão",
        "Processo de avaliação rodando, com pedido a cada serviço entregue",
        "Conteúdo publicado no perfil e no Instagram",
        "Acompanhamento direto comigo no WhatsApp",
      ],
      nota: "Sem fidelidade e sem multa. Você para quando quiser, e o que foi construído continua seu: o perfil, o site e as avaliações estão no seu nome, não no meu.",
      cta: "Quero começar assim",
      fechar: "Fechar",
      msg: "Oi Rodrigo! Quero começar pela condição de 2.000 por mês que você me mostrou na reunião.",
    },
    en: {
      selo: "Meeting-only terms",
      titulo: "A door that is not on the table",
      sub: "Good in this conversation, to start now.",
      unid: "per month",
      rec: "recurring, no minimum term",
      inclui: "What is included",
      itens: [
        "Google profile built, optimized and maintained every month",
        "Website live, with your WhatsApp on the button",
        "Review process running, with a request after every job",
        "Content published on the profile and on Instagram",
        "Direct support with me on WhatsApp",
      ],
      nota: "No lock-in and no cancellation fee. You stop whenever you want, and what was built stays yours: the profile, the site and the reviews are in your name, not mine.",
      cta: "I want to start like this",
      fechar: "Close",
      msg: "Hi Rodrigo! I want to start with the 2,000 a month terms you showed me in the meeting.",
    },
  };

  function idioma() {
    try {
      var q = new URLSearchParams(location.search).get("idi");
      if (q === "en" || q === "pt") return q;
      return localStorage.getItem("leon_idi") === "en" ? "en" : "pt";
    } catch (e) { return "pt"; }
  }

  function zap() {
    try {
      if (typeof WHATSAPP === "string" && WHATSAPP) return WHATSAPP;
    } catch (e) {}
    return "12133960014";
  }

  var CSS =
    "#ofr{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:22px;" +
      "background:rgba(10,10,10,.62);backdrop-filter:blur(9px);-webkit-backdrop-filter:blur(9px);" +
      "opacity:0;transition:opacity .42s ease}" +
    "#ofr.on{opacity:1}" +
    "#ofr .cx{position:relative;width:min(560px,100%);max-height:92vh;overflow:auto;" +
      "background:#F7F3EA;color:#171717;border-radius:26px;padding:40px 38px 34px;" +
      "box-shadow:0 40px 120px -30px rgba(0,0,0,.7);" +
      "transform:translateY(26px) scale(.96);opacity:0;" +
      "transition:transform .55s cubic-bezier(.16,1,.3,1),opacity .45s ease}" +
    "#ofr.on .cx{transform:none;opacity:1}" +
    "#ofr .selo{display:inline-block;font:700 10.5px/1 ui-sans-serif,system-ui,sans-serif;" +
      "letter-spacing:.19em;text-transform:uppercase;color:#C44712;background:#F6DCCC;" +
      "padding:8px 15px;border-radius:100px}" +
    "#ofr h3{font:700 clamp(24px,4.4vw,33px)/1.13 ui-sans-serif,system-ui,sans-serif;" +
      "letter-spacing:-.02em;margin:19px 0 7px}" +
    "#ofr .sub{font:400 15px/1.55 ui-sans-serif,system-ui,sans-serif;color:#454545;margin-bottom:26px}" +
    "#ofr .preco{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap}" +
    "#ofr .cif{font:700 25px/1 ui-sans-serif,system-ui,sans-serif;color:#C44712}" +
    "#ofr .num{font:700 clamp(56px,12vw,88px)/.9 ui-sans-serif,system-ui,sans-serif;" +
      "letter-spacing:-.045em;color:#171717;font-variant-numeric:tabular-nums}" +
    "#ofr .un{font:600 16px/1 ui-sans-serif,system-ui,sans-serif;color:#454545}" +
    "#ofr .rec{font:500 13px/1.5 ui-sans-serif,system-ui,sans-serif;color:#C44712;margin-top:9px}" +
    "#ofr .rot{font:700 10.5px/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:.17em;" +
      "text-transform:uppercase;color:#6E655A;margin:28px 0 12px}" +
    "#ofr ul{list-style:none;margin:0;padding:0}" +
    "#ofr li{position:relative;padding-left:25px;margin-bottom:11px;" +
      "font:400 14.5px/1.5 ui-sans-serif,system-ui,sans-serif;" +
      "opacity:0;transform:translateX(-9px);transition:opacity .4s ease,transform .4s ease}" +
    "#ofr.on li{opacity:1;transform:none}" +
    "#ofr li::before{content:'';position:absolute;left:2px;top:.62em;width:11px;height:2px;background:#E65A19}" +
    "#ofr .nota{font:400 12.5px/1.55 ui-sans-serif,system-ui,sans-serif;color:#6E655A;" +
      "border-top:1px solid #E2D9C8;margin-top:24px;padding-top:16px}" +
    "#ofr .bts{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}" +
    "#ofr .bt{flex:1;min-width:190px;text-align:center;text-decoration:none;cursor:pointer;" +
      "font:600 15px/1 ui-sans-serif,system-ui,sans-serif;padding:16px 20px;border-radius:12px;" +
      "background:#171717;color:#F7F3EA;border:0;transition:background .2s ease}" +
    "#ofr .bt:hover{background:#E65A19}" +
    "#ofr .bt.sec{flex:0 0 auto;min-width:0;background:transparent;color:#6E655A;border:1px solid #E2D9C8}" +
    "#ofr .bt.sec:hover{background:transparent;color:#171717;border-color:#171717}" +
    "#ofr .x{position:absolute;top:15px;right:17px;width:33px;height:33px;border:0;cursor:pointer;" +
      "border-radius:50%;background:transparent;color:#6E655A;font-size:21px;line-height:1}" +
    "#ofr .x:hover{background:#EDE5D6;color:#171717}" +
    "@media (prefers-reduced-motion:reduce){#ofr,#ofr .cx,#ofr li{transition:none}}";

  function esc(x) {
    return String(x).replace(/[&<>\"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function montar() {
    var t = T[idioma()];
    var st = document.createElement("style");
    st.textContent = CSS;
    document.head.appendChild(st);

    var el = document.createElement("div");
    el.id = "ofr";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.innerHTML =
      '<div class="cx">' +
        '<button class="x" type="button" aria-label="' + esc(t.fechar) + '">&times;</button>' +
        '<span class="selo">' + esc(t.selo) + "</span>" +
        "<h3>" + esc(t.titulo) + "</h3>" +
        '<p class="sub">' + esc(t.sub) + "</p>" +
        '<div class="preco"><span class="cif">US$</span>' +
          '<span class="num" id="ofr-num">0</span>' +
          '<span class="un">' + esc(t.unid) + "</span></div>" +
        '<div class="rec">' + esc(t.rec) + "</div>" +
        '<div class="rot">' + esc(t.inclui) + "</div>" +
        "<ul>" + t.itens.map(function (x) { return "<li>" + esc(x) + "</li>" }).join("") + "</ul>" +
        '<p class="nota">' + esc(t.nota) + "</p>" +
        '<div class="bts">' +
          '<a class="bt" target="_blank" rel="noopener" href="https://wa.me/' + zap() +
            "?text=" + encodeURIComponent(t.msg) + '">' + esc(t.cta) + "</a>" +
          '<button class="bt sec" type="button">' + esc(t.fechar) + "</button>" +
        "</div>" +
      "</div>";
    document.body.appendChild(el);

    el.querySelector(".x").addEventListener("click", fechar);
    el.querySelector(".bt.sec").addEventListener("click", fechar);
    el.addEventListener("click", function (ev) { if (ev.target === el) fechar(); });
    return el;
  }

  /* O número sobe de 0 a 2000. É o único movimento chamativo da peça, e é de
     propósito: o valor é a informação, então é ele que se move. */
  function contar(alvo) {
    var lento = false;
    try {
      lento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {}
    // quem pediu menos movimento recebe o número na hora, sem espera nenhuma
    if (lento) { alvo.textContent = "2,000"; return; }
    var ini = null, dur = 950;
    function passo(ts) {
      if (ini === null) ini = ts;
      var k = Math.min(1, (ts - ini) / dur);
      var suave = 1 - Math.pow(1 - k, 3);
      alvo.textContent = Math.round(2000 * suave).toLocaleString("en-US");
      if (k < 1) requestAnimationFrame(passo);
    }
    // deixa o cartão pousar antes de o número começar a subir
    setTimeout(function () { requestAnimationFrame(passo); }, 260);
  }

  function abrir() {
    if (aberto) return;
    aberto = true;
    var el = document.getElementById("ofr") || montar();
    el.style.display = "grid";
    var itens = el.querySelectorAll("li");
    for (var i = 0; i < itens.length; i++) itens[i].style.transitionDelay = (0.34 + i * 0.075) + "s";
    contar(el.querySelector("#ofr-num"));
    // dois quadros para a transição do CSS partir do estado inicial
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.classList.add("on"); });
    });
    var bt = el.querySelector(".bt");
    if (bt && bt.focus) bt.focus({ preventScroll: true });
  }

  function fechar() {
    var el = document.getElementById("ofr");
    if (!el) { aberto = false; return; }
    el.classList.remove("on");
    aberto = false;
    setTimeout(function () { el.style.display = "none"; }, 430);
  }

  function digitando(ev) {
    var a = ev.target;
    if (!a) return false;
    var tag = (a.tagName || "").toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select" || a.isContentEditable === true;
  }

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && aberto) { fechar(); return; }
    if (digitando(ev) || ev.metaKey || ev.ctrlKey || ev.altKey) return;
    if (!ev.key || ev.key.length !== 1) return;
    digitado = (digitado + ev.key.toLowerCase()).slice(-SEGREDO.length);
    if (digitado === SEGREDO) { digitado = ""; abrir(); }
  });

  // para o teste e para o console, se ele precisar abrir sem digitar
  window.leonOferta = { abrir: abrir, fechar: fechar, segredo: SEGREDO };
})();
