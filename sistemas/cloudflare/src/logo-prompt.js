/* ═══════════════════ PROMPT DA LOGO (gpt-image-2) ═══════════════════
   O cliente descreve a logo que ele quer no formulário, em português, com as
   palavras dele. Este módulo transforma essa descrição num prompt JSON pronto
   para colar no ChatGPT com o gpt-image-2.

   ── por que JSON e não uma frase ──
   Prompt de logo em texto corrido perde requisito: o modelo escolhe uma parte
   e ignora o resto. Em JSON cada exigência tem campo próprio, e a mais
   importante de todas (a grafia exata do nome da empresa) fica isolada num
   campo que o modelo não confunde com descrição de estilo.

   ── por que em inglês ──
   O gpt-image-2 desenha melhor a partir de inglês, e o texto DENTRO da logo é
   em inglês porque o cliente final é americano. A descrição crua do cliente
   em português vai junto, no campo `client_brief_verbatim`: se a tradução
   automática errar a intenção, a frase original dele está lá para conferir.  */

// ── cores: o que o cliente escreve x o que o modelo entende ──
// Ele escreve "azul escuro e dourado". Sem isso o prompt sai com a palavra
// portuguesa e o modelo inventa a cor.
const CORES = [
  [/\b(azul\s*(escuro|marinho|petr[óo]leo)|navy|marinho)\b/i, "deep navy blue", "#12314F"],
  [/\b(azul\s*(claro|c[ée]u)|celeste)\b/i, "light sky blue", "#5FA8D3"],
  [/\bazul\b/i, "blue", "#1B4965"],
  [/\b(dourado|ouro|gold)\b/i, "warm gold", "#C9A227"],
  [/\b(amarelo|yellow)\b/i, "yellow", "#F6AE2D"],
  [/\b(vermelho|red)\b/i, "red", "#C1292E"],
  [/\b(laranja|orange)\b/i, "orange", "#E65A19"],
  [/\b(verde\s*(escuro|musgo)|dark\s*green)\b/i, "dark forest green", "#1F4034"],
  [/\b(verde|green)\b/i, "green", "#2D6A4F"],
  [/\b(preto|black)\b/i, "black", "#171717"],
  [/\b(branco|white)\b/i, "white", "#FFFFFF"],
  [/\b(cinza|grafite|gray|grey)\b/i, "graphite gray", "#4A4A4A"],
  [/\b(marrom|madeira|wood|brown|caramelo)\b/i, "warm wood brown", "#8B5A2B"],
  [/\b(bege|creme|marfim|off.?white)\b/i, "ivory", "#F7F3EA"],
  [/\b(prata|prateado|silver)\b/i, "silver", "#9AA0A6"],
  [/\b(bord[ôo]|vinho|burgundy)\b/i, "burgundy", "#6B2233"],
];

// ── estilo: vocabulário visual em inglês a partir do que ele escreveu ──
const ESTILOS = [
  [/\b(moderno|moderna|atual|clean|limpo|limpa)\b/i, "modern, clean, contemporary"],
  [/\b(minimalista|minimalismo|simples|discreto)\b/i, "minimalist, few elements, generous negative space"],
  [/\b(cl[áa]ssico|cl[áa]ssica|tradicional|atemporal)\b/i, "classic, timeless, traditional craftsmanship feel"],
  [/\b(robusto|robusta|forte|s[óo]lido|s[óo]lida|pesado|industrial)\b/i, "sturdy, solid, industrial weight"],
  [/\b(elegante|sofisticado|sofisticada|premium|luxo|luxuoso)\b/i, "elegant, premium, restrained"],
  [/\b(rústico|r[úu]stica|artesanal|vintage|retr[ôo])\b/i, "rustic, handcrafted, vintage-inspired"],
  [/\b(divertido|amig[áa]vel|leve|friendly)\b/i, "friendly, approachable"],
  [/\b(profissional|s[ée]rio|confi[áa]vel|confian[çc]a)\b/i, "professional, trustworthy, corporate-grade"],
  [/\b(tecnol[óo]gico|tech|futurista)\b/i, "technical, precise, engineered"],
];

/* ── símbolo por ofício ──
   O nicho é o que o cliente já preencheu, e é a informação mais concreta que
   existe para o símbolo. "Flooring" leva a tábua e veio de madeira; "roofing",
   à linha do telhado. Sem isso o modelo devolve casinha genérica para todo
   mundo, que é exatamente a cara de logo de IA que a gente evita.            */
const SIMBOLO_POR_NICHO = [
  [/floor|piso|hardwood|madeira|vinyl|laminate|carpet|tile|epoxi|ep[óo]xi/i,
   "flooring", "wood plank, parquet pattern, wood grain direction, or a chevron/herringbone module"],
  [/roof|telhad|shingle/i,
   "roofing", "a clean roofline silhouette, shingle rhythm, or a peaked gable form"],
  [/paint|pintur/i,
   "painting", "a single confident brush or roller stroke, or a color-edge transition"],
  [/cabinet|arm[áa]ri|carpint|carpentry|wood.?work/i,
   "cabinets and carpentry", "a cabinet door proportion, dovetail joint, or square/rule geometry"],
  [/hvac|ar.?condicionado|heating|cooling|ventil/i,
   "HVAC", "airflow lines, a vent louver rhythm, or a fan blade abstraction"],
  [/gutter|calha/i,
   "gutters", "a gutter profile in section, or a clean water-run line"],
  [/framing|estrutur/i,
   "framing", "an exposed stud frame, truss triangle, or structural grid"],
  [/remodel|reforma|renovation|kitchen|bathroom|cozinha|banheiro/i,
   "remodeling", "an interior corner in perspective, an arch, or a doorway threshold"],
  [/landscap|jardin|lawn/i,
   "landscaping", "a simplified leaf, hedge line, or terrain contour"],
  [/concrete|concreto|masonry|alvenaria|brick/i,
   "concrete and masonry", "a brick bond pattern, trowel edge, or block module"],
];

const limpa = (v, n = 400) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);
const listaDe = (v) => limpa(v, 400).split(/[,;·\n]+/).map((s) => s.trim()).filter(Boolean);

/* A lista CORES vai do específico para o genérico, e o trecho que casa é
   CONSUMIDO antes de seguir. Sem isso "azul escuro" casava duas vezes, como
   `deep navy blue` e outra vez como `blue`, e a paleta chegava no modelo com
   dois azuis onde o cliente pediu um. */
function traduzCores(texto) {
  let t = limpa(texto, 300);
  const achadas = [];
  for (const [re, nome, hex] of CORES) {
    const m = t.match(re);
    if (!m) continue;
    t = t.slice(0, m.index) + " " + t.slice(m.index + m[0].length);
    if (!achadas.some((c) => c.name === nome)) achadas.push({ name: nome, hex });
  }
  return achadas;
}
function traduzEstilo(texto) {
  const t = limpa(texto, 500);
  const achados = [];
  for (const [re, frase] of ESTILOS) if (re.test(t)) achados.push(frase);
  return achados;
}
function simboloDoNicho(nicho, servicos) {
  const t = `${nicho || ""} ${servicos || ""}`;
  for (const [re, trade, ideia] of SIMBOLO_POR_NICHO)
    if (re.test(t)) return { trade, ideia };
  return { trade: "home services", ideia: "a simple tool silhouette or a house-corner geometric mark" };
}

/* Texto que vai DENTRO da logo. É o campo que mais dá errado: modelo de
   imagem erra letra, e logo com o nome errado é retrabalho garantido. Por isso
   sai partido em principal/secundário e com a grafia marcada como literal. */
function textoDaLogo(c) {
  const explicito = limpa(c.logo_texto, 90);
  const bruto = explicito || limpa(c.empresa, 90);
  // "Ribeiro Hardwood Flooring LLC" -> principal "RIBEIRO", secundário o resto.
  // LLC/Inc fora: sufixo jurídico dentro da marca deixa a logo pesada e não é
  // o que aparece no caminhão.
  const semSufixo = bruto.replace(/[,\s]+(llc|inc\.?|corp\.?|ltd\.?)$/i, "").trim();
  const partes = semSufixo.split(/\s+/);
  return {
    primary: (partes[0] || semSufixo).toUpperCase(),
    secondary: partes.length > 1 ? partes.slice(1).join(" ").toUpperCase() : null,
    tagline: limpa(c.logo_slogan, 60) || null,
    full_wordmark: semSufixo.toUpperCase(),
    must_be_spelled_exactly: true,
  };
}

/* ═══════════════ O PROMPT ═══════════════
   Determinístico: mesma entrada, mesma saída, sem chamada de rede e sem
   custo. A IA entra só como refinamento opcional, em `refinarComIA`.        */
export function promptLogo(c) {
  const cores = [
    ...traduzCores(c.cores),
    ...traduzCores(c.logo_referencias),
  ].filter((v, i, a) => a.findIndex((x) => x.name === v.name) === i).slice(0, 4);

  const estilo = [...new Set([
    ...traduzEstilo(c.logo_estilo),
    ...traduzEstilo(c.diferencial),
  ])].slice(0, 4);

  const { trade, ideia } = simboloDoNicho(c.nicho, c.servicos);
  const cidade = [limpa(c.cidade, 60), limpa(c.estado, 4)].filter(Boolean).join(", ");
  const servicos = listaDe(c.servicos).slice(0, 6);
  const evitar = listaDe(c.logo_evitar).slice(0, 8);

  const spec = {
    task: "Design a logo for a residential contractor business.",
    model_note: "Render as a finished vector-style logo on a transparent background. Not a mockup, not a photograph, not a signboard, not a business card.",

    brand: {
      legal_name: limpa(c.empresa, 90) || null,
      trade,
      services: servicos.length ? servicos : null,
      service_area: cidade || null,
      owner: limpa(c.nome_dono || c.nome_contato, 60) || null,
      years_in_business: limpa(c.tempo_mercado, 30) || null,
      audience: "U.S. homeowners hiring a local contractor. The logo has to read as licensed and dependable, not as a startup.",
    },

    // O campo mais importante do arquivo. Fica no topo da hierarquia por isso.
    text_in_logo: textoDaLogo(c),

    symbol: {
      client_request: limpa(c.logo_simbolo, 300) || null,
      trade_appropriate_ideas: ideia,
      instruction: limpa(c.logo_simbolo, 300)
        ? "Build the mark from the client's request above. Use the trade ideas only to keep it readable at small size."
        : "The client gave no symbol preference. Pick ONE idea from trade_appropriate_ideas and commit to it. Do not combine several.",
      integration: "One single mark, geometrically integrated with the wordmark. No two competing symbols.",
    },

    style: {
      direction: estilo.length ? estilo
        : ["modern, clean, professional", "sturdy and legible, built to survive being printed on a truck door"],
      client_words: limpa(c.logo_estilo, 300) || null,
      reference_brands: limpa(c.logo_referencias, 300) || null,
    },

    color: {
      palette: cores.length ? cores : [{ name: "black", hex: "#171717" }, { name: "one accent color of your choice", hex: null }],
      max_colors: 3,
      instruction: cores.length
        ? "Use these colors and nothing else. Flat fills only."
        : "The client gave no color preference. Pick a flat two-color palette with strong contrast.",
      must_survive_one_color: "The logo has to still work stamped in solid black and in solid white.",
    },

    composition: {
      format: "square 1:1, mark centered, generous margin",
      background: "fully transparent",
      legibility_test: "Must stay readable at 32px (favicon) and on a vehicle door at 20 feet.",
    },

    deliverables_wanted: [
      "primary lockup: symbol + wordmark",
      "horizontal variant",
      "symbol alone, square, for profile pictures and favicon",
      "solid black one-color version",
      "solid white one-color version for dark backgrounds",
    ],

    // Lista negativa. É o que separa logo de contractor de logo genérica de
    // IA, e é padrão da Leon Group, não preferência de cliente.
    negative: [
      ...evitar.map((e) => `client explicitly does not want: ${e}`),
      "no 3D, no bevel, no emboss, no drop shadow",
      "no gloss, no gradient mesh, no lens flare, no glow",
      "no photorealistic house or photorealistic tool",
      "no clip-art house outline with a roof and a chimney",
      "no swoosh, no generic abstract ribbon",
      "no stock-looking family silhouette",
      "no fake award badge, no fake certification seal, no fake five-star row",
      "no lorem ipsum, no placeholder text, no misspelled words",
      "no watermark, no signature, no border frame around the logo",
      "no background scene of any kind",
    ],

    /* A frase do cliente, crua, em português. Se a tradução automática acima
       tiver errado a intenção, a intenção original está aqui do lado. */
    client_brief_verbatim: {
      language: "pt-BR",
      style: limpa(c.logo_estilo, 400) || null,
      symbol: limpa(c.logo_simbolo, 400) || null,
      colors: limpa(c.cores, 200) || null,
      references: limpa(c.logo_referencias, 400) || null,
      avoid: limpa(c.logo_evitar, 400) || null,
      differentiator: limpa(c.diferencial, 400) || null,
      note: "Translate intent, not words. If this contradicts the English fields above, follow this.",
    },
  };

  return spec;
}

/* O que o formulário do cliente ainda não respondeu. O card mostra isso ao
   lado do prompt: prompt gerado sem briefing nenhum sai genérico, e é melhor
   dizer isso do que entregar uma logo qualquer. */
export function faltaNoBriefing(c) {
  const falta = [];
  if (!limpa(c.logo_estilo)) falta.push("estilo que ele quer");
  if (!limpa(c.logo_simbolo)) falta.push("ideia de símbolo");
  if (!limpa(c.cores)) falta.push("cores");
  if (!limpa(c.logo_evitar)) falta.push("o que ele não quer");
  if (!limpa(c.logo_referencias)) falta.push("marcas de referência");
  return falta;
}

/* ═══════════════ REFINAMENTO OPCIONAL COM IA ═══════════════
   Só entra com OPENAI_API_KEY. Reescreve os campos DESCRITIVOS em inglês de
   designer, a partir do briefing em português.

   O que a IA NÃO pode tocar: o texto que vai dentro da logo, a lista negativa
   e os entregáveis. Esses são exigência, não estilo — e é justamente onde um
   modelo "melhorando" o texto estragaria a peça.                            */
export async function refinarComIA(spec, key) {
  if (!key) return null;
  const brief = spec.client_brief_verbatim;
  if (!brief.style && !brief.symbol && !brief.references && !brief.colors) return null;

  const pedido =
`You are a brand designer briefing an image model to draw a logo for a U.S. residential contractor.

The client wrote this in Brazilian Portuguese:
- style: ${brief.style || "(nothing)"}
- symbol idea: ${brief.symbol || "(nothing)"}
- colors: ${brief.colors || "(nothing)"}
- reference brands: ${brief.references || "(nothing)"}
- does not want: ${brief.avoid || "(nothing)"}
- what makes the business different: ${brief.differentiator || "(nothing)"}

Trade: ${spec.brand.trade}. Services: ${(spec.brand.services || []).join(", ") || "n/a"}.
Service area: ${spec.brand.service_area || "n/a"}.

Return ONLY a JSON object with exactly these keys:
{
  "style_direction": [3 short English phrases of concrete visual direction],
  "symbol_concept": "one sentence describing ONE mark, specific enough to draw",
  "color_instruction": "one sentence on the palette, flat colors only",
  "rationale_pt": "uma frase em portugues explicando a escolha, para o operador conferir"
}
Translate intent, not words. Do not invent a color the client did not ask for if he asked for one.
Never suggest 3D, gradients, glow, or a generic house outline.`;

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o", temperature: 0.7,
                             response_format: { type: "json_object" },
                             messages: [{ role: "user", content: pedido }] }),
    });
    if (!r.ok) { console.log("logo IA:", r.status); return null; }
    const j = await r.json();
    const o = JSON.parse(j.choices[0].message.content);
    const arr = Array.isArray(o.style_direction)
      ? o.style_direction.filter((x) => typeof x === "string").slice(0, 4) : null;
    if (arr?.length) spec.style.direction = arr;
    if (typeof o.symbol_concept === "string" && o.symbol_concept.trim()) {
      spec.symbol.refined_concept = o.symbol_concept.trim().slice(0, 400);
      spec.symbol.instruction = "Draw exactly the mark described in refined_concept. Do not add a second element.";
    }
    if (typeof o.color_instruction === "string" && o.color_instruction.trim())
      spec.color.instruction = o.color_instruction.trim().slice(0, 300);
    return { spec, rationale: String(o.rationale_pt || "").slice(0, 400) };
  } catch (e) {
    console.log("logo IA falhou:", e.message);
    return null;
  }
}
