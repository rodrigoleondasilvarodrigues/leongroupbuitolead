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
  $$(".idioma button").forEach((b) => b.classList.toggle("on", b.dataset.idi === idi));

  /* Cada etapa isolada. A lição vem do CRM: uma exceção no meio da
     montagem deixava tudo depois dela sem executar, em silêncio. */
  [["hero", montarHero], ["listas", montarListas], ["form", montarForm]]
    .forEach(([nome, fn]) => {
      try { fn(t); } catch (e) { console.warn(`falha ao montar ${nome}:`, e.message); }
    });
  try { previa(); } catch {}
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
};

function montarListas(t) {
  /* marquee — os nichos, duplicados pro laço não ter emenda */
  $("#trilho").innerHTML = [...NICHOS, ...NICHOS]
    .map((n) => `<span>${esc(n)}</span>`).join("");

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
    <article class="card ap" data-atraso="${Math.min(i % 3 + 1, 5)}">
      <div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round">${ICONES[ic] || ICONES.marca}</svg></div>
      <h3>${esc(tit)}</h3><p>${esc(txt)}</p>
      <span class="tag">${esc(tag)}</span>
    </article>`).join("");

  $("#passos").innerHTML = t.passos.map(([tit, txt, prazo], i) => `
    <div class="passo ap" data-atraso="${Math.min(i + 1, 5)}">
      <div><h3>${esc(tit)}</h3><p>${esc(txt)}</p>
      ${prazo ? `<span class="prazo">${esc(prazo)}</span>` : ""}</div>
    </div>`).join("");

  $("#lista-nao").innerHTML = t.naos.map((n) => `
    <li><svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round"
      stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>${esc(n)}</li>`).join("");

  $("#lista-faq").innerHTML = t.faq.map(([q, a], i) => `
    <details class="ap" data-atraso="${Math.min(i % 3 + 1, 5)}">
      <summary>${esc(q)}</summary>
      <div class="resp"><p>${esc(a)}</p></div>
    </details>`).join("");

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

/* ─────────────────────── formulário ─────────────────────── */
const CAMPOS = ["nome", "empresa", "telefone", "servico", "cidade", "papel", "hoje"];

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
  };
}

function mensagem() {
  const d = dados();
  const t = T[idi];
  const rot = (x, alt) => x || alt;
  return t.wa({
    ...d,
    nome: rot(d.nome, "—"), empresa: rot(d.empresa, "—"),
    servico: rot(d.servico, "—"), cidade: rot(d.cidade, "—"),
    papel: rot(d.papel, "—"), hoje: rot(d.hoje, "—"),
  });
}

/* prévia ao vivo: a pessoa vê exatamente o que vai ser enviado */
function previa() { $("#previa").textContent = mensagem(); }

function valida() {
  let ok = true, primeiro = null;
  CAMPOS.forEach((c) => {
    const el = $(`#f_${c === "telefone" ? "tel" : c}`);
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

/* registra o contato no CRM, se o endpoint estiver configurado.
   Nunca bloqueia o WhatsApp: se falhar, a conversa abre do mesmo jeito. */
function avisarCRM(d) {
  if (!CRM_ENDPOINT) return Promise.resolve();
  return fetch(CRM_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...d, idioma: idi, pagina: location.href }),
  }).catch(() => {});
}

/* ─────────────────────── modal ─────────────────────── */
let ultimoFoco = null;
function abrir(fonte) {
  ultimoFoco = document.activeElement;
  $("#modal").hidden = false;
  document.body.style.overflow = "hidden";
  $("#form").dataset.fonte = fonte || "";
  previa();
  setTimeout(() => $("#f_nome").focus(), 90);
}
function fechar() {
  $("#modal").hidden = true;
  document.body.style.overflow = "";
  if (ultimoFoco) ultimoFoco.focus();
}

/* menu do celular — declarada aqui de propósito: o handler de Escape
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

  /* prévia ao vivo */
  $("#form").addEventListener("input", previa);
  $("#form").addEventListener("change", previa);

  /* envio */
  $("#form").addEventListener("submit", (e) => {
    e.preventDefault();
    if ($('input[name="site_web"]').value) return;   /* isca de robô */
    if (!valida()) return;

    const d = dados();
    d.fonte = $("#form").dataset.fonte || "";
    avisarCRM(d);

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

  /* header grudado + barra de progresso + botão flutuante */
  const aoRolar = () => {
    const y = scrollY;
    $("#topo").classList.toggle("grudado", y > 24);
    const alt = document.documentElement.scrollHeight - innerHeight;
    $("#prog").style.width = alt > 0 ? `${Math.min(100, (y / alt) * 100)}%` : "0";
    $("#flut").classList.toggle("ver", y > innerHeight * 0.65);
  };
  addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

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
