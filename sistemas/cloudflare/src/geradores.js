// Geradores dos entregáveis — Leon Group
// Anatomia das reviews e pautas dos posts vieram das aulas 01-04 (ver
// _memoria/historico/ESPECIFICACOES-SISTEMAS.md).

const ABERTURAS = [
  "I had been looking for a reliable {s} contractor in {c} for months before I found {d}.",
  "After getting three quotes for {s} here in {c}, I decided to go with {d} — best decision I made.",
  "We needed {s} done at our home in {c} and a neighbor recommended {d}.",
  "I want to leave an honest review about the {s} work {d} did for us in {c}.",
  "Finding a good {s} company in {c} is not easy. {d} changed that for us.",
  "This is my second project with {d} and once again the {s} work in {c} was flawless.",
];
const ATENDIMENTO = [
  "{d} was extremely attentive from the very first call — answered every question without rushing me.",
  "What stood out was the communication. {d} kept me updated every single day of the project.",
  "{d} showed up exactly when he said he would, which is rare around {c}.",
  "The whole crew was respectful and clean, and {d} personally checked the work at the end of each day.",
  "I never had to chase {d} for an update. He was always one step ahead.",
];
const PRAZO = [
  "The job was finished ahead of the schedule we agreed on — {d} delivered earlier than we expected.",
  "They finished the {s} faster than promised and without cutting any corners.",
  "{d} gave me a timeline and beat it. That never happens with contractors.",
  "Project came in on budget and ahead of the deadline.",
];
const QUALIDADE = [
  "The quality of the {s} is exactly what we hoped for — the finish is clean and professional.",
  "You can tell {d} takes pride in the work. Every detail of the {s} was done right.",
  "Our neighbors here in {c} have already asked who did our {s}.",
  "The result completely changed the space. The {s} looks better than the photos we were shown.",
];
const FECHAMENTOS = [
  "If you need {s} in {c}, call {d}. Best {s} service in {c}, hands down.",
  "I recommend {d} to anyone in {c} looking for {s}. Best {s} contractor in {c}.",
  "Hands down the best {s} company in {c}. Thank you, {d}!",
  "Do yourself a favor and hire {d} — the best {s} in {c} by far.",
  "Five stars. Best {s} team in {c} and I will use {d} again.",
];

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const fmt = (t, ctx) => t.replace(/\{d\}/g, ctx.d).replace(/\{c\}/g, ctx.c).replace(/\{s\}/g, ctx.s);

export function listaServicos(txt) {
  return (txt || "").replace(/;/g, ",").split(",").map((s) => s.trim()).filter(Boolean);
}

export async function gerarReviews(cliente, qtd = 20, fotos = [], openaiKey = "") {
  const dono = cliente.nome_dono || cliente.nome_contato || "the owner";
  const cidade = cliente.cidade || "our city";
  const servicos = listaServicos(cliente.servicos);
  const svc = servicos.length ? servicos : ["remodeling"];

  if (openaiKey) {
    const viaIA = await reviewsOpenAI(dono, cidade, svc, qtd, openaiKey);
    if (viaIA) return viaIA.map((texto, i) => ({
      texto, servico: svc[i % svc.length],
      foto_ref: fotos.length ? fotos[i % fotos.length] : null,
    }));
  }

  const usados = new Set(), saida = [];
  for (let i = 0; i < qtd; i++) {
    const ctx = { d: dono, c: cidade, s: svc[i % svc.length] };
    let texto = "";
    for (let t = 0; t < 40; t++) {
      texto = [pick(ABERTURAS), pick(ATENDIMENTO), pick(PRAZO), pick(QUALIDADE), pick(FECHAMENTOS)]
        .map((p) => fmt(p, ctx)).join(" ");
      if (!usados.has(texto)) { usados.add(texto); break; }
    }
    saida.push({ texto, servico: ctx.s, foto_ref: fotos.length ? fotos[i % fotos.length] : null });
  }
  return saida;
}

async function reviewsOpenAI(dono, cidade, servicos, qtd, key) {
  const prompt =
`Write ${qtd} distinct Google Business Profile reviews in ENGLISH for a construction / home services
company in ${cidade}, owned by ${dono}. Services: ${servicos.join(", ")}.

Each review MUST:
- be first person, as a real residential customer
- repeat the owner's name "${dono}" at least twice
- name the specific service performed
- name the city "${cidade}" at least twice (local SEO)
- praise attentiveness and mention the job finished ahead of schedule
- end stating they are the best [service] in ${cidade}
- be 4 to 7 sentences, natural, with varied structure
- sound like different people wrote them

Return ONLY a JSON array of strings.`;
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o", temperature: 1.0, messages: [{ role: "user", content: prompt }] }),
    });
    const j = await r.json();
    let t = j.choices[0].message.content.trim();
    t = t.slice(t.indexOf("["), t.lastIndexOf("]") + 1);
    const arr = JSON.parse(t);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string").slice(0, qtd) : null;
  } catch (e) {
    console.log("openai reviews falhou:", e.message);
    return null;
  }
}

// ── 12 posts + 4 destaques ────────────────────────────────────────────────
export const PAUTAS = [
  ["Antes e depois", "Mostrar a transformação de um projeto real. A foto faz o trabalho — legenda curta."],
  ["O processo por dentro", "Como o serviço é executado, etapa por etapa. Gera confiança de quem sabe fazer."],
  ["Material que a gente usa", "Comparar materiais e explicar a escolha. Posiciona como especialista."],
  ["Erro comum que sai caro", "Um erro que o dono da casa comete e o prejuízo que gera."],
  ["Quanto tempo leva", "Expectativa realista de prazo para o serviço mais pedido."],
  ["A equipe", "Quem executa. Rosto humano vende mais que logo."],
  ["Cliente satisfeito", "Depoimento real, com autorização. Sem encenação."],
  ["Detalhe do acabamento", "Close no detalhe que separa o trabalho bem feito do mal feito."],
  ["Região atendida", "Quais cidades atende — reforça SEO local e filtra lead ruim."],
  ["Dúvida frequente", "A pergunta que todo cliente faz antes de fechar, respondida direto."],
  ["Projeto concluído", "Entrega final com o resultado em destaque."],
  ["Como pedir um orçamento", "Chamada para ação clara, com o caminho do contato."],
];
export const DESTAQUES = [
  ["Services", "O que a empresa faz. Um card por serviço principal."],
  ["Projects", "Portfólio: antes e depois dos trabalhos entregues."],
  ["Reviews", "Prints das avaliações reais do Google Meu Negócio."],
  ["Contact", "Como falar com a empresa: telefone, WhatsApp, região atendida."],
];

export function gerarPosts(c) {
  const ctx = `Empresa: ${c.empresa || ""} · Região: ${c.cidade || ""}\nServiços: ${(c.servicos || "").slice(0, 200)}`;
  return [
    ...PAUTAS.map(([titulo, brief], i) => ({ ordem: i + 1, tipo: "post", titulo, brief: `${brief}\n\n${ctx}` })),
    ...DESTAQUES.map(([titulo, brief], i) => ({ ordem: i + 1, tipo: "destaque", titulo, brief: `${brief}\n\n${ctx}` })),
  ];
}

// ── site ──────────────────────────────────────────────────────────────────
// A aspa simples PRECISA estar aqui: o hero usa url('...') e a foto vem do
// formulário público. Sem escapar, o cliente (ou quem tiver o link) fecha a
// url() e injeta CSS no site entregue. `<` e `>` já barravam a saída do <style>.
const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
  (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

export function gerarSite(c, fotos = []) {
  const empresa = esc(c.empresa || "Company");
  const dono = esc(c.nome_dono || c.nome_contato || "");
  const cidade = esc(c.cidade || "");
  const estado = esc(c.estado || "");
  const tel = esc(c.telefone || "");
  const dif = esc(c.diferencial || "");
  const cor = esc(c.cor_primaria || "#1B4965");
  const cor2 = esc(c.cor_destaque || "#F6AE2D");
  const svc = listaServicos(c.servicos);
  const principal = esc(svc[0] || "Construction");
  const zap = (c.telefone || "").replace(/\D/g, "");
  const cards = (svc.length ? svc.slice(0, 6) : ["Remodeling", "Flooring", "Painting"])
    .map((s) => `<article class="s"><h3>${esc(s)}</h3><p>Professional ${esc(s.toLowerCase())} services in ${cidade}, ${estado}.</p></article>`).join("\n");
  const gal = fotos.slice(0, 12).map((f) => `<figure><img src="${esc(f)}" alt="${empresa} project in ${cidade}" loading="lazy"></figure>`).join("\n");
  const heroBg = fotos.length ? `,url('${esc(fotos[0])}')` : "";

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${empresa} — ${principal} in ${cidade}, ${estado}</title>
<meta name="description" content="${empresa}: ${esc(svc.slice(0,4).join(", "))} in ${cidade}, ${estado}. Free estimate. ${dif.slice(0,90)}">
<style>
:root{--c:${cor};--a:${cor2};--t:#1a1a1a}
*{box-sizing:border-box;margin:0;padding:0}
body{font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--t);background:#fff}
header{background:var(--c);color:#fff;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
header b{font-size:20px}
header a{background:var(--a);color:#111;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600}
.hero{background:linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55))${heroBg};background-size:cover;background-position:center;color:#fff;padding:110px 24px;text-align:center}
.hero h1{font-size:clamp(28px,5vw,46px);max-width:760px;margin:0 auto 14px}
.hero p{font-size:19px;opacity:.94;max-width:620px;margin:0 auto 26px}
.btn{display:inline-block;background:var(--a);color:#111;padding:15px 34px;border-radius:8px;text-decoration:none;font-weight:700;font-size:17px}
section{padding:64px 24px;max-width:1100px;margin:0 auto}
h2{font-size:29px;margin-bottom:26px;color:var(--c)}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:18px}
.s{border:1px solid #e6e6e6;border-radius:10px;padding:22px}
.s h3{color:var(--c);margin-bottom:7px;font-size:19px}
.gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
.gal img{width:100%;height:210px;object-fit:cover;border-radius:8px;display:block}
.cta{background:var(--c);color:#fff;text-align:center}.cta h2{color:#fff}
footer{background:#111;color:#999;padding:30px 24px;text-align:center;font-size:14px}
.zap{position:fixed;right:20px;bottom:20px;background:#25D366;color:#fff;width:58px;height:58px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.28)}
</style></head><body>
<header><b>${empresa}</b><a href="#contact">Free Estimate</a></header>
<div class="hero"><h1>${principal} in ${cidade}, ${estado}</h1>
<p>${dif || `Licensed and experienced team serving ${cidade} and surrounding areas.`}</p>
<a class="btn" href="#contact">Get Your Free Estimate</a></div>
<section><h2>Our Services</h2><div class="grid">${cards}</div></section>
${fotos.length ? `<section><h2>Recent Projects</h2><div class="gal">${gal}</div></section>` : ""}
<section><h2>Why ${empresa}</h2><div class="grid">
<article class="s"><h3>On Schedule</h3><p>We finish when we say we will — most projects ahead of schedule.</p></article>
<article class="s"><h3>Clear Communication</h3><p>${dono || "The owner"} keeps you updated at every stage.</p></article>
<article class="s"><h3>Local to ${cidade}</h3><p>We know the homes, the codes and the neighborhoods here.</p></article>
</div></section>
<section class="cta" id="contact"><h2>Request Your Free Estimate</h2>
<p style="margin-bottom:24px">Tell us about your project and we'll get back to you today.</p>
${zap ? `<a class="btn" href="https://wa.me/${zap}">Message us on WhatsApp</a>` : ""}
${tel ? `<p style="margin-top:18px;font-size:19px">${tel}</p>` : ""}</section>
<footer>© ${empresa} · ${cidade}, ${estado} · All rights reserved</footer>
${zap ? `<a class="zap" href="https://wa.me/${zap}" aria-label="WhatsApp">✆</a>` : ""}
</body></html>`;
}

// Cadência de entrega — criada quando o CLIENTE responde o formulário.
// Prazo máximo: 5 DIAS ÚTEIS (fim de semana não conta).
export const CADENCIA = [
  { dia: 1, marco: "Grupo do WhatsApp criado com o cliente",      quem: "agência" },
  { dia: 1, marco: "Site no ar e link enviado ao cliente",        quem: "agência" },
  { dia: 1, marco: "Logo entregue (se o cliente não tinha)",      quem: "agência" },
  { dia: 2, marco: "12 posts do Instagram entregues",             quem: "agência" },
  { dia: 2, marco: "4 destaques do Instagram entregues",          quem: "agência" },
  { dia: 3, marco: "20 reviews entregues ao cliente",             quem: "agência" },
  { dia: 3, marco: "Tutorial do Google Meu Negócio enviado",      quem: "agência" },
  { dia: 4, marco: "Acesso ao Google Meu Negócio liberado",       quem: "cliente" },
  { dia: 4, marco: "GMB otimizado (categorias, serviços, fotos)", quem: "agência" },
  { dia: 5, marco: "Pasta de entrega completa enviada",           quem: "agência" },
  { dia: 5, marco: "Reunião de entrega realizada",                quem: "ambos" },
];
export const PRAZO_MAXIMO_DIAS = 5;

// Soma dias ÚTEIS a partir de uma data — sábado e domingo não contam.
// Dia da semana no fuso do cliente (EUA), não em UTC. Formulário respondido
// domingo 20h em Boston é segunda 01h em UTC: contando em UTC o prazo caía na
// segunda seguinte em vez da sexta — 3 dias de diferença no que foi prometido.
const DIAS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
export function diaDaSemanaEUA(quando) {
  const r = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", weekday: "short" }).format(quando);
  return DIAS.indexOf(r.slice(0, 3));
}
const fimDeSemana = (d) => { const s = diaDaSemanaEUA(d); return s === 0 || s === 6; };

export function somaDiasUteis(base, dias) {
  const d = new Date(base);
  let restantes = dias;
  while (restantes > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (!fimDeSemana(d)) restantes--;
  }
  return d;
}

// Quantos dias úteis já se passaram desde o início da entrega.
export function diasUteisDesde(base) {
  const ini = new Date(base), hoje = new Date();
  let n = 0;
  const d = new Date(ini);
  while (d < hoje) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (!fimDeSemana(d)) n++;   // mesmo fuso do somaDiasUteis, senão os dois discordam
  }
  return n;
}

export const ENTREGAVEIS = [
  ["gmb", "Google Meu Negócio"], ["site", "Site"],
  ["instagram", "Instagram (12 posts + 4 destaques)"], ["logo", "Logo"],
];
