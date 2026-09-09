/* ═══════════════════════════════════════════════════════════════════
   Comportamento do site da Leon Group.
   Sem dependência nenhuma: nada de biblioteca, nada de build.
   O texto todo mora em conteudo.js.
   ═══════════════════════════════════════════════════════════════════ */
(() => {
"use strict";

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
  (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

const CHAVE = "leon_idioma";
const CHAVE_SESSAO = "leon_sessao";
const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
let idi = "pt";

/* ─────────────────────── de onde a pessoa veio ───────────────────────
   Alimenta a linha "encontrei em: X" da mensagem do WhatsApp.
   Prioridade: ?fonte= ou ?utm_source= na URL, depois o site que indicou. */
function origem() {
  const q = new URLSearchParams(location.search);
  const marcado = q.get("fonte") || q.get("utm_source") || q.get("origem");
  if (marcado) return marcado.replace(/[^\w\s.\-]/g, "").slice(0, 40);
  const r = document.referrer;
  if (!r) return "";
  try {
    const h = new URL(r).hostname.replace(/^www\./, "");
    if (h === location.hostname) return "";
    const conhecidos = {
      "instagram.com": "Instagram", "l.instagram.com": "Instagram",
      "facebook.com": "Facebook", "l.facebook.com": "Facebook", "m.facebook.com": "Facebook",
      "youtube.com": "YouTube", "m.youtube.com": "YouTube", "youtu.be": "YouTube",
      "google.com": "Google", "google.com.br": "Google", "bing.com": "Bing",
      "linkedin.com": "LinkedIn", "t.co": "X", "x.com": "X",
    };
    return conhecidos[h] || h;
  } catch { return ""; }
}
const ORIGEM = origem();

/* Identificador da visita. Serve pra que o preenchimento incompleto e o
   envio final caiam no MESMO lead do CRM, em vez de virarem dois. Fica
   no sessionStorage: some quando a aba fecha, não é rastreamento. */
const SESSAO = (() => {
  try {
    let s = sessionStorage.getItem(CHAVE_SESSAO);
    if (!s) {
      s = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random())
            .replace(/[^a-z0-9]/gi, "").slice(0, 32);
      sessionStorage.setItem(CHAVE_SESSAO, s);
    }
    return s;
  } catch { return String(Date.now()) + String(Math.random()).slice(2, 8); }
})();

/* ─────────────────────── troca de idioma ─────────────────────── */
function aplicar(novo) {
  idi = T[novo] ? novo : "pt";
  const t = T[idi];
  document.documentElement.lang = t._html;
  document.documentElement.dataset.idioma = idi;
  try { localStorage.setItem(CHAVE, idi); } catch {}

  /* textos simples marcados com data-t */
  $$("[data-t]").forEach((el) => {
    const v = t[el.dataset.t];
    if (typeof v === "string") el.textContent = v;
  });

  $("#porta-tit").textContent = t.porta_tit;
  $("#porta-sub").textContent = t.porta_sub;
  $("#salvo-txt").textContent = t.f_salvo;
  $$(".idioma button").forEach((b) => b.classList.toggle("on", b.dataset.idi === idi));

  /* Cada etapa isolada. A lição vem do CRM: uma exceção no meio da
     montagem deixava tudo depois dela sem executar, em silêncio. */
  [["hero", montarHero], ["listas", montarListas], ["form", montarForm]]
    .forEach(([nome, fn]) => {
      try { fn(t); } catch (e) { console.warn(`falha ao montar ${nome}:`, e.message); }
    });
  try { previa(); } catch {}
  try { medirLeao(); } catch {}
}

/* ─────────────────────── hero: revelação linha por linha ─────────────────────── */
function montarHero(t) {
  const h1 = $("#h1");
  h1.innerHTML = t.hero_h1.map((linha) => {
    const laranja = /^~.*~$/.test(linha);
    const txt = esc(laranja ? linha.slice(1, -1) : linha);
    return `<span class="rev-linha"><span class="rev-p${laranja ? " lar" : ""}">${txt}</span></span>`;
  }).join("");
  /* atraso escalonado por linha */
  $$(".rev-p", h1).forEach((p, i) => { p.style.transitionDelay = `${0.08 + i * 0.11}s`; });
  requestAnimationFrame(() => h1.classList.add("pronto"));
}

/* ─────────────────────── listas do corpo ─────────────────────── */
const ICONES = {
  marca:     '<path d="M12 2l2.9 6.3 6.9.8-5 4.7 1.3 6.8L12 17.4 5.9 20.6 7.2 13.8 2.2 9.1l6.9-.8z"/>',
  gbp:       '<path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>',
  site:      '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 9h20M6 6.5h.01M9 6.5h.01"/>',
  review:    '<path d="M12 3l2.5 5.4 5.9.7-4.3 4 1.1 5.8L12 16.1 6.8 19l1.1-5.8-4.3-4 5.9-.7z"/>',
  insta:     '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.6"/><path d="M17.4 6.6h.01"/>',
  aquisicao: '<path d="M3 17l5-5 4 3 5-7 4 3"/><path d="M3 21h18"/>',
  ads:       '<path d="M3 11v2a1 1 0 001 1h2l4 4V6L6 10H4a1 1 0 00-1 1z"/><path d="M15.5 8.5a5 5 0 010 7"/><path d="M18.5 5.5a9 9 0 010 13"/>',
};
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

function montarListas(t) {
  /* marquee: nichos com o slogan entrando a cada seis, duplicado pro
     laço não ter emenda. O slogan tem que aparecer em todo lugar. */
  const passada = [];
  NICHOS.forEach((n, i) => {
    passada.push(`<span>${esc(n)}</span>`);
    if ((i + 1) % 6 === 0) passada.push(`<span class="slg">${esc(SLOGAN)}</span>`);
  });
  $("#trilho").innerHTML = passada.join("") + passada.join("");

  $("#lista-dor").innerHTML = t.dores.map(([tit, txt], i) => `
    <li class="ap" data-atraso="${Math.min(i + 1, 5)}">
      <span class="n">0${i + 1}</span>
      <div><strong>${esc(tit)}</strong><p>${esc(txt)}</p></div>
    </li>`).join("");

  $("#hist").innerHTML = t.hist.map((p, i) => {
    /* ~trecho~ vira destaque laranja */
    const corpo = esc(p).replace(/~([^~]+)~/g, '<span class="lar">$1</span>');
    return `<p class="ap" data-atraso="${Math.min(i, 4)}">${corpo}</p>`;
  }).join("");

  $("#cards").innerHTML = t.servicos.map(([ic, tit, txt, tag], i) => `
    <article class="card ap${ic === "ads" ? " fim" : ""}" data-atraso="${Math.min(i % 3 + 1, 5)}">
      <div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round">${ICONES[ic] || ICONES.marca}</svg></div>
      <h3>${esc(tit)}</h3><p>${esc(txt)}</p>
      <span class="tag">${esc(tag)}</span>
    </article>`).join("");

  /* funções executadas na conta. Não é contagem de gente: é escopo. */
  $("#lista-funcoes").innerHTML = t.funcoes.map(([tit, txt], i) => `
    <article class="fn ap" data-atraso="${Math.min(i % 4 + 1, 5)}">
      <span class="nb">${String(i + 1).padStart(2, "0")}</span>
      <h3>${esc(tit)}</h3><p>${esc(txt)}</p>
    </article>`).join("");

  $("#passos").innerHTML = t.passos.map(([tit, txt, prazo], i) => `
    <div class="passo ap${i === t.passos.length - 1 ? " fim" : ""}" data-atraso="${Math.min(i + 1, 5)}">
      <div><h3>${esc(tit)}</h3><p>${esc(txt)}</p>
      ${prazo ? `<span class="prazo">${esc(prazo)}</span>` : ""}</div>
    </div>`).join("");

  $("#lista-faq").innerHTML = t.faq.map(([q, a], i) => `
    <details class="ap" data-atraso="${Math.min(i % 3 + 1, 5)}">
      <summary>${esc(q)}</summary>
      <div class="resp"><p>${esc(a)}</p></div>
    </details>`).join("");

  /* motivos pra chamar agora, na seção de contato */
  $("#lista-pontos").innerHTML = t.ct_pontos.map(([tit, txt], i) => `
    <li class="ap" data-atraso="${Math.min(i + 1, 5)}">
      ${CHECK}<div><strong>${esc(tit)}</strong><p>${esc(txt)}</p></div>
    </li>`).join("");

  observar();
}

/* ─────────────────────── revelação na rolagem ─────────────────────── */
let obs;
function observar() {
  /* Sem suporte (ou com movimento reduzido pedido pelo sistema), mostra tudo
     de uma vez. Antes isto lançava e derrubava a montagem inteira: o
     formulário e os cliques nunca eram ligados e o site ficava mudo. */
  if (calmo || typeof IntersectionObserver === "undefined") {
    $$(".ap").forEach((e) => e.classList.add("dentro"));
    return;
  }
  obs = obs || new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("dentro"); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  $$(".ap:not(.dentro)").forEach((e) => obs.observe(e));
}

/* ─────────────────────── leão de fundo ───────────────────────
   O símbolo da marca fica numa camada fixa e muda de lugar conforme a
   pessoa lê o site: cada seção tem um ponto de parada, e a posição é
   interpolada entre o ponto da seção atual e o da próxima. A transição
   longa no CSS faz ele flutuar em vez de saltar.
   x/y em vw/vh · s escala · r rotação · o opacidade (mais forte no escuro) */
const ANCORAS = [
  { sel: "#hero",       x: 76, y: 34, s: 1.15, r: -7,  o: .15 },
  { sel: "#problema",   x: 12, y: 66, s: 0.82, r:  9,  o: .07 },
  { sel: "#historia",   x: 88, y: 28, s: 1.00, r: -12, o: .06 },
  { sel: "#servicos",   x: 20, y: 70, s: 1.30, r:  6,  o: .17 },
  { sel: "#funcoes",    x: 84, y: 42, s: 0.90, r: -5,  o: .07 },
  { sel: "#metodo",     x: 14, y: 32, s: 1.05, r: 10,  o: .06 },
  { sel: ".lema-faixa", x: 50, y: 50, s: 1.70, r:  0,  o: .20 },
  { sel: "#faq",        x: 86, y: 66, s: 0.88, r: -8,  o: .06 },
  { sel: "#contato",    x: 18, y: 44, s: 1.35, r:  5,  o: .18 },
];

function medirLeao() {
  ANCORAS.forEach((a) => {
    const el = $(a.sel);
    if (!el || !el.getBoundingClientRect) { a.centro = null; return; }
    const r = el.getBoundingClientRect();
    a.centro = r.top + scrollY + r.height / 2;
  });
}

function moverLeao() {
  const pontos = ANCORAS.filter((a) => typeof a.centro === "number");
  if (pontos.length < 2) return;
  const alvo = scrollY + innerHeight / 2;
  let i = 0;
  while (i < pontos.length - 1 && pontos[i + 1].centro < alvo) i++;
  const a = pontos[i], b = pontos[Math.min(i + 1, pontos.length - 1)];
  const vao = (b.centro - a.centro) || 1;
  const k = Math.max(0, Math.min(1, (alvo - a.centro) / vao));
  const mix = (p, q) => p + (q - p) * k;
  const s = document.documentElement.style;
  s.setProperty("--lx", mix(a.x, b.x).toFixed(2) + "vw");
  s.setProperty("--ly", mix(a.y, b.y).toFixed(2) + "vh");
  s.setProperty("--ls", mix(a.s, b.s).toFixed(3));
  s.setProperty("--lr", mix(a.r, b.r).toFixed(2) + "deg");
  s.setProperty("--lo", mix(a.o, b.o).toFixed(3));
}

/* ─────────────────────── formulário ───────────────────────
   O WhatsApp vem primeiro de propósito: é o único dado que permite
   retomar contato com quem desistir no meio do preenchimento. */
const CAMPOS = ["telefone", "nome", "empresa", "servico", "cidade", "papel", "hoje"];
const idDe = (c) => `#f_${c === "telefone" ? "tel" : c}`;

function montarForm(t) {
  const opcao = (v) => `<option value="${esc(v)}">${esc(v)}</option>`;
  const vazio = `<option value="" disabled selected>${esc(t.opt_placeholder)}</option>`;
  const guardar = (sel, lista) => {
    const el = $(sel), antes = el.selectedIndex;
    el.innerHTML = vazio + lista.map(opcao).join("");
    if (antes > 0) el.selectedIndex = antes;   // não perde a escolha ao trocar de idioma
  };
  guardar("#f_servico", t.opt_servico);
  guardar("#f_papel", t.opt_papel);
  guardar("#f_hoje", t.opt_hoje);
}

function dados() {
  const v = (id) => ($(id).value || "").trim();
  return {
    nome: v("#f_nome"), empresa: v("#f_empresa"), telefone: v("#f_tel"),
    servico: v("#f_servico"), cidade: v("#f_cidade"),
    papel: v("#f_papel"), hoje: v("#f_hoje"), origem: ORIGEM,
    plano: v("#f_plano"),   // qual plano ele clicou, se clicou em algum
  };
}

function mensagem() {
  const d = dados();
  const t = T[idi];
  const rot = (x) => x || t.f_vazio;
  return t.wa({
    ...d,
    nome: rot(d.nome), empresa: rot(d.empresa),
    servico: rot(d.servico), cidade: rot(d.cidade),
    papel: rot(d.papel), hoje: rot(d.hoje),
  });
}

/* prévia ao vivo: a pessoa vê exatamente o que vai ser enviado */
function previa() { $("#previa").textContent = mensagem(); }

function valida() {
  let ok = true, primeiro = null;
  CAMPOS.forEach((c) => {
    const el = $(idDe(c));
    if (!el) return;
    const vazio = !(el.value || "").trim();
    el.classList.toggle("erro-c", vazio);
    const aviso = el.parentElement.querySelector(".msg-erro");
    if (aviso) aviso.classList.toggle("ver", vazio);
    if (vazio) { ok = false; primeiro = primeiro || el; }
  });
  if (primeiro) primeiro.focus();
  return ok;
}

/* ─────────────── registro no CRM ───────────────
   Duas formas de chegar lá:
   1. envio completo  -> lead cheio, pronto pra trabalhar
   2. envio PARCIAL   -> quem começou a preencher e parou no meio.
      Vale ouro: a maior parte de quem abandona formulário nunca
      manda mensagem nenhuma, e sem isso o contato se perderia
      inteiro. Só dispara com telefone válido, porque sem telefone
      não há como chamar de volta. Está avisado na tela, embaixo
      do campo, antes da pessoa digitar. */
let jaEnviou = false;      // depois do envio completo, para de mandar parcial
let parcialPendente = false;

const telValido = () => (($("#f_tel").value || "").replace(/\D/g, "").length >= 8);

function corpoCRM(extra) {
  return JSON.stringify({
    ...dados(), ...extra,
    sessao: SESSAO, idioma: idi, pagina: location.href,
    fonte: $("#form").dataset.fonte || "",
  });
}

function avisarCRM(extra) {
  if (!CRM_ENDPOINT) return Promise.resolve();
  return fetch(CRM_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: corpoCRM(extra),
  }).catch(() => {});
}

function salvarParcial(viaBeacon) {
  if (jaEnviou || !CRM_ENDPOINT || !telValido()) return;
  parcialPendente = false;
  const corpo = corpoCRM({ parcial: 1 });
  /* Ao sair da página o fetch normal é cancelado. sendBeacon sobrevive.
     text/plain evita preflight, que o beacon não sabe fazer. */
  if (viaBeacon && navigator.sendBeacon) {
    try {
      navigator.sendBeacon(CRM_ENDPOINT, new Blob([corpo], { type: "text/plain" }));
      return;
    } catch {}
  }
  fetch(CRM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" },
                        body: corpo, keepalive: true }).catch(() => {});
  $("#salvo").classList.add("ver");
}

let relogioParcial;
function agendarParcial() {
  if (jaEnviou) return;
  parcialPendente = true;
  clearTimeout(relogioParcial);
  relogioParcial = setTimeout(() => salvarParcial(false), PARCIAL_MS);
}

/* ─────────────────────── modal ───────────────────────
   Existe UM formulário só. Ele mora na seção de contato e é MOVIDO pra
   dentro do modal quando alguém clica num CTA do topo. Mover o nó
   preserva valores e eventos, então não há dois estados divergindo.
   Se a seção de contato já estiver na tela, nem abre modal: rola até
   ela e põe o cursor no WhatsApp. */
let ultimoFoco = null;

function formNaTela() {
  const casa = $("#casa-form");
  if (!casa || !casa.getBoundingClientRect) return false;
  const r = casa.getBoundingClientRect();
  return r.top < innerHeight * 0.85 && r.bottom > innerHeight * 0.15;
}

function abrir(fonte) {
  $("#form").dataset.fonte = fonte || "";
  if (formNaTela()) {                       // já está à vista: não atrapalha
    $("#f_tel").focus();
    previa();
    return;
  }
  ultimoFoco = document.activeElement;
  $("#vaga-form").appendChild($("#form"));
  $("#modal").hidden = false;
  document.body.style.overflow = "hidden";
  previa();
  setTimeout(() => $("#f_tel").focus(), 90);
}

function fechar() {
  if ($("#modal").hidden) return;
  $("#modal").hidden = true;
  $("#casa-form").appendChild($("#form"));   // devolve o formulário pra casa
  document.body.style.overflow = "";
  if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
}

/* menu do celular: declarada aqui de propósito, o handler de Escape
   abaixo a referencia, e função declarada não depende da ordem. */
function alternarMenu(abre) {
  $("#menu").classList.toggle("aberto", abre);
  $("#hamb").classList.toggle("x", abre);
  document.body.style.overflow = abre ? "hidden" : "";
}

/* ─────────────────────── ligações ─────────────────────── */
function ligar() {
  /* idioma */
  $$(".idioma button, .porta .escolhas button").forEach((b) =>
    b.addEventListener("click", () => {
      aplicar(b.dataset.idi);
      const porta = $("#porta");
      if (!porta.hidden) {
        porta.classList.add("saindo");
        setTimeout(() => { porta.hidden = true; porta.classList.remove("saindo"); }, 430);
      }
    }));

  /* abrir/fechar modal */
  $$("[data-abrir]").forEach((b) =>
    b.addEventListener("click", () => abrir(b.dataset.fonte)));
  $("#fechar").addEventListener("click", fechar);
  $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") fechar(); });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!$("#modal").hidden) fechar();
    else if ($("#menu").classList.contains("aberto")) alternarMenu(false);
  });

  /* prévia ao vivo + guarda do preenchimento incompleto */
  const aoDigitar = () => { previa(); agendarParcial(); };
  $("#form").addEventListener("input", aoDigitar);
  $("#form").addEventListener("change", aoDigitar);

  /* saindo da página com formulário pela metade: manda antes de morrer */
  const aoSair = () => { if (parcialPendente) salvarParcial(true); };
  addEventListener("pagehide", aoSair);
  addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") aoSair(); });

  /* envio */
  $("#form").addEventListener("submit", (e) => {
    e.preventDefault();
    if ($('input[name="site_web"]').value) return;   /* isca de robô */
    if (!valida()) { agendarParcial(); return; }

    clearTimeout(relogioParcial);
    parcialPendente = false;
    jaEnviou = true;
    avisarCRM({ parcial: 0 });

    if (!WHATSAPP) { alert(T[idi].sem_numero); return; }
    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem())}`;
    /* abre em aba nova pra não perder o site */
    const w = window.open(url, "_blank", "noopener");
    if (!w) location.href = url;
    fechar();
  });

  /* menu no celular */
  $("#hamb").addEventListener("click", () =>
    alternarMenu(!$("#menu").classList.contains("aberto")));
  $$("#menu a").forEach((a) => a.addEventListener("click", () => alternarMenu(false)));

  /* header grudado + barra de progresso + botão flutuante + leão */
  let pintando = false;
  const aoRolar = () => {
    const y = scrollY;
    $("#topo").classList.toggle("grudado", y > 24);
    const alt = document.documentElement.scrollHeight - innerHeight;
    $("#prog").style.width = alt > 0 ? `${Math.min(100, (y / alt) * 100)}%` : "0";
    $("#flut").classList.toggle("ver", y > innerHeight * 0.65);
    if (!pintando) {
      pintando = true;
      requestAnimationFrame(() => { pintando = false; try { moverLeao(); } catch {} });
    }
  };
  addEventListener("scroll", aoRolar, { passive: true });
  addEventListener("resize", () => { medirLeao(); moverLeao(); }, { passive: true });
  medirLeao();
  aoRolar();
  /* as seções só têm altura final depois das fontes: remede um pouco depois */
  setTimeout(() => { medirLeao(); moverLeao(); }, 900);

  $("#ano").textContent = new Date().getFullYear();
}

/* ─────────────────────── início ─────────────────────── */
function comecar() {
  let salvo = null;
  const protegido = (rot, fn) => { try { fn(); } catch (e) { console.warn(`${rot}:`, e.message); } };
  try { salvo = localStorage.getItem(CHAVE); } catch {}

  if (salvo && T[salvo]) {
    aplicar(salvo);                     /* já escolheu antes: respeita e segue */
  } else {
    /* primeira visita: sugere pelo navegador, mas a escolha é da pessoa */
    const nav = (navigator.language || "pt").toLowerCase();
    aplicar(nav.startsWith("pt") ? "pt" : "en");
    $("#porta").hidden = false;
  }
  protegido("ligar eventos", ligar);
}

if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", comecar);
else comecar();
})();
