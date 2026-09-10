// Geradores dos entregáveis · Leon Group
// Pautas dos posts vieram das aulas 01-04 (ver
// _memoria/historico/ESPECIFICACOES-SISTEMAS.md).
//
// ⚠ A "anatomia das reviews" das aulas era anatomia de avaliação fabricada, e
// foi removida daqui em 2026-09-10, por achado da auditoria do ecossistema.
// O que este arquivo gera agora é PEDIDO de avaliação, mandado pelo contractor
// ao cliente real dele. O motivo está por escrito antes das listas PEDIDO_*:
// regra de integridade do CLAUDE.md, política do Google Business Profile, e a
// FTC Rule on Consumer Reviews, que alcança quem fornece o texto.

/* ⚠ ESTAS LISTAS JÁ GERARAM AVALIAÇÃO FALSA, E FORAM SUBSTITUÍDAS.

   A versão anterior tinha frases em primeira pessoa DE CLIENTE ("I want to
   leave an honest review about the work...", "Five stars. Best team in {c}").
   Combinadas, montavam 20 avaliações prontas para o contractor publicar como
   se fossem clientes dele. Isso é avaliação fabricada: quebra a regra de
   integridade do CLAUDE.md, suspende perfil no Google, e desde 2024 a FTC Rule
   on Consumer Reviews alcança quem FORNECE o texto.

   Agora as listas montam o PEDIDO de avaliação: a mensagem que o contractor
   manda para o cliente real dele, depois da obra, pedindo que ele avalie.
   Quem escreve é o contractor, quem avalia é o cliente, e o texto da avaliação
   não sai daqui.

   {d} = dono · {c} = cidade · {s} = serviço · {LINK} = link de avaliação  */
const PEDIDO_ABERTURA = [
  "Hi! This is {d}. Thanks again for trusting us with your {s} in {c}.",
  "Hey, {d} here. It was a pleasure working on your {s}.",
  "Hi, it's {d}. Just wanted to say thank you for choosing us for your {s}.",
  "Hello! {d} here. Hope you are enjoying the new {s}.",
  "Hi, this is {d} from the {s} job we just wrapped up in {c}.",
  "Hey! {d} speaking. Thank you for having us out for your {s}.",
];
const PEDIDO_MOTIVO = [
  "Most of my work comes from neighbors finding me on Google.",
  "Word of mouth and Google is how people around {c} find me.",
  "I am a small local business, so reviews are what help new customers find me.",
  "Google reviews are pretty much my only advertising.",
  "Being easy to find on Google makes a real difference for a small crew like mine.",
];
const PEDIDO_ASK = [
  "If you were happy with how it turned out, would you mind leaving a quick review? {LINK}",
  "If you have a minute, a short review would help me a lot: {LINK}",
  "Whenever you have a moment, you can leave a review here: {LINK}",
  "If you feel like sharing your experience, the review link is here: {LINK}",
  "Only if you think we earned it, you can leave a review here: {LINK}",
];
const PEDIDO_FECHO = [
  "Either way, thank you, and call me anytime you need anything.",
  "No pressure at all. Thanks again and take care.",
  "Thanks for the work, and let me know if anything comes up.",
  "Appreciate it either way. Have a good one!",
  "Thank you, and I am around if you need anything else.",
];

const pick = (a) => a[Math.floor(Math.random() * a.length)];
/* {LINK} NÃO é substituído aqui de propósito: o link de avaliação do perfil só
   existe depois de o Google Business Profile estar verificado, o que acontece
   no dia 4 da cadência. O contractor cola o link dele no lugar. */
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
      texto = [pick(PEDIDO_ABERTURA), pick(PEDIDO_MOTIVO), pick(PEDIDO_ASK), pick(PEDIDO_FECHO)]
        .map((p) => fmt(p, ctx)).join(" ");
      if (!usados.has(texto)) { usados.add(texto); break; }
    }
    saida.push({ texto, servico: ctx.s, foto_ref: fotos.length ? fotos[i % fotos.length] : null });
  }
  return saida;
}

async function reviewsOpenAI(dono, cidade, servicos, qtd, key) {
  /* ⚠ ESTE PROMPT JÁ GEROU AVALIAÇÃO FALSA, E FOI CORRIGIDO.

     A versão anterior pedia "${qtd} Google Business Profile reviews, first
     person, as a real residential customer". Isso é avaliação fabricada: o
     texto saía pronto para o contractor publicar como se fosse cliente dele.
     Quebra a regra de integridade do CLAUDE.md, viola a política do Google
     Business Profile (suspende o perfil) e cai na regra da FTC sobre avaliação
     de consumidor, a FTC Rule on Consumer Reviews, que desde 2024 alcança quem
     FORNECE o texto, não só quem publica.
     E quem levaria a suspensão era o cliente, no perfil que a Leon Group
     acabou de montar para ele.

     Agora gera PEDIDO de avaliação: a mensagem que o contractor manda para o
     cliente REAL dele, depois da obra entregue, pedindo que ele avalie. Um por
     serviço, para ele não mandar a mesma frase para todo mundo.             */
  const prompt =
`Write ${qtd} distinct REVIEW REQUEST messages in ENGLISH. These are messages that a
construction / home services contractor sends TO HIS OWN REAL CUSTOMER, by text or
WhatsApp, right after finishing a job, asking that customer to leave a Google review.

The contractor is ${dono}, in ${cidade}. Services: ${servicos.join(", ")}.

CRITICAL: these are NOT reviews. Do NOT write anything in the voice of a customer
praising the company. Do NOT write testimonials. Each message is the CONTRACTOR
speaking to his customer, asking for a favor.

Each message MUST:
- be written by ${dono} in first person, addressed to the customer as "you"
- reference the specific service that was just completed
- ask plainly for a Google review, with no pressure and no incentive offered
- include the literal placeholder {LINK} where the review link goes
- be 2 to 4 sentences, warm and simple, the way a tradesperson actually writes
- be different from the others: vary the service and the opening

NEVER include:
- any sentence a customer would write ("great job", "highly recommend", "5 stars")
- any promise, discount or gift in exchange for the review
- any suggestion of what the customer should say or how many stars to give

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
  ["Antes e depois", "Mostrar a transformação de um projeto real. A foto faz o trabalho, legenda curta."],
  ["O processo por dentro", "Como o serviço é executado, etapa por etapa. Gera confiança de quem sabe fazer."],
  ["Material que a gente usa", "Comparar materiais e explicar a escolha. Posiciona como especialista."],
  ["Erro comum que sai caro", "Um erro que o dono da casa comete e o prejuízo que gera."],
  ["Quanto tempo leva", "Expectativa realista de prazo para o serviço mais pedido."],
  ["A equipe", "Quem executa. Rosto humano vende mais que logo."],
  ["Cliente satisfeito", "Depoimento real, com autorização. Sem encenação."],
  ["Detalhe do acabamento", "Close no detalhe que separa o trabalho bem feito do mal feito."],
  ["Região atendida", "Quais cidades atende: reforça SEO local e filtra lead ruim."],
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

// ── site do cliente ────────────────────────────────────────────────────────
// A aspa simples PRECISA estar aqui: o hero usa url('...') e a foto vem do
// formulário público. Sem escapar, quem tiver o link do formulário fecha a
// url() e injeta CSS no site entregue. `<` e `>` já barravam a saída do <style>.
const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
  (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

/* ═══════════════════ BIBLIOTECA DE COPY DO SITE DO CLIENTE ═══════════════════
   O cliente responde o formulário em português, no celular, com pressa. O que
   chega é "FAço tudo de hvac e flooring" e "velocidade e cuidado". Isso é
   SINAL, não texto: serve pra escolher o que dizer, nunca pra ir cru na tela
   que o dono de casa americano vai ler.

   Aqui está a copy escrita, em inglês, por ofício. O gerador detecta o ofício
   e os diferenciais nas respostas e monta o site com os blocos certos.      */

// ── detecção de ofício a partir do que o cliente escreveu ──
const OFICIOS = [
  ["hvac",       /hvac|air condition|ar.?condicionado|heating|furnace|climatiza|refrigera|mini.?split/i],
  ["flooring",   /floor|piso|hardwood|madeira|vinyl|vinil|laminate|laminado|carpet|tile|azulejo|porcelanato|epoxy|ep[óo]xi|staircase|escada/i],
  ["painting",   /paint|pintura|pintor/i],
  ["roofing",    /roof|telhad|shingle|cobertura/i],
  ["gutters",    /gutter|calha/i],
  ["remodeling", /remodel|reforma|renova|bathroom|banheiro|kitchen|cozinha|basement|por[aã]o/i],
  ["carpentry",  /carpent|carpintar|cabinet|marcenar|arm[áa]rio|deck|trim|molding/i],
  ["framing",    /framing|estrutura|drywall|sheetrock/i],
  ["landscaping",/landscap|jardin|lawn|paisagis/i],
  ["cleaning",   /power.?wash|pressure.?wash|lava.?jato/i],
];

/* Para cada ofício: a promessa do hero, o que o comprador teme, os serviços
   padrão e as perguntas que ele faz antes de ligar. Escrito para dono de casa
   americano, não para o contractor.                                        */
const FALA = {
  hvac: {
    promessa: "Heating and cooling that works when you need it most",
    linha: "Repairs, installs and maintenance for homes across {area}. Straight answers, honest pricing, and a crew that shows up when we say we will.",
    medo: [
      ["We answer fast", "A broken system in July or January is not something that waits. Call us and you get a real person, not a machine."],
      ["Flat pricing before we start", "You know the number before any work begins. No surprises added at the end."],
      ["Clean work, every visit", "Drop cloths down, shoes covered, and the space left the way we found it."],
    ],
    servicos: [
      ["AC repair and installation", "Central air, mini-splits and heat pumps. Diagnosis, repair, or a full replacement if that is the honest answer."],
      ["Heating and furnace service", "Furnaces, boilers and heat pumps kept running through the winter."],
      ["Mini-split systems", "Ductless comfort for additions, finished basements and rooms that never get warm enough."],
      ["Seasonal maintenance", "A tune-up before the season is the cheapest way to avoid an emergency call during it."],
      ["Air quality and ductwork", "Filtration, humidity and duct work for homes that feel stuffy or uneven."],
    ],
    faq: [
      ["How fast can you get here?", "For no heat or no cooling we prioritize same-day whenever the schedule allows. Call and we will tell you honestly when we can be there."],
      ["Do you charge for the estimate?", "Estimates for replacements and installs are free. Diagnostic visits for a system that is already down carry a service fee, which we tell you up front."],
      ["Repair or replace?", "We tell you which one actually makes sense. If a repair buys you five more years, we say so instead of selling you a system you do not need."],
      ["What areas do you serve?", "{area}. If you are just outside, call anyway and we will tell you straight."],
    ],
    galeria: "Recent installs and service calls",
  },
  flooring: {
    promessa: "Floors installed right, finished clean, done on schedule",
    linha: "Hardwood, tile, vinyl and laminate for homes across {area}. We show up on the day we promise and leave the house cleaner than we found it.",
    medo: [
      ["We finish on the date we give you", "The schedule you get is the schedule we work to. If something changes, you hear it from us first."],
      ["Dust kept under control", "Containment and vacuum sanding, so the rest of the house stays livable while we work."],
      ["The finish is the whole job", "Edges, transitions and stair noses done properly. That is where you can tell who did the work."],
    ],
    servicos: [
      ["Hardwood installation", "Solid and engineered, nail-down or glue-down, with proper subfloor prep before a single board goes in."],
      ["Sanding and refinishing", "Bringing an existing floor back instead of replacing it, when the wood still has life in it."],
      ["Tile", "Kitchens, bathrooms, entryways and mudrooms. Level, sealed and set to last."],
      ["Vinyl plank and laminate", "Durable, waterproof options for busy homes, basements and rentals."],
      ["Stairs and transitions", "Treads, risers and the details between rooms that most crews rush."],
    ],
    faq: [
      ["How long will my floor take?", "A typical room is one to two days for installation. Sanding and refinishing adds drying time between coats. You get the real timeline before we start."],
      ["Can we stay in the house?", "For most jobs yes. We work room by room and contain the dust. For a full refinish we will tell you which days are worth being out."],
      ["Do you move furniture?", "Yes, we handle the moving as part of the job. Tell us about anything fragile or unusually heavy when we quote it."],
      ["What areas do you serve?", "{area}. If you are just outside, call anyway and we will tell you straight."],
    ],
    galeria: "Recent floors",
  },
  painting: {
    promessa: "Paint work that still looks right three years from now",
    linha: "Interior and exterior painting across {area}. Proper prep, clean lines, and a crew that respects the house.",
    medo: [
      ["Prep is most of the job", "Patching, sanding and priming before any color goes on. Skipping it is why paint fails early."],
      ["Clean lines, no rushing", "Straight cuts at the ceiling and trim, tape where it belongs, and a walkthrough before we call it done."],
      ["Your house stays protected", "Floors covered, furniture moved and wrapped, and everything back in place at the end of each day."],
    ],
    servicos: [
      ["Interior painting", "Walls, ceilings, trim and doors, room by room or the whole house."],
      ["Exterior painting", "Siding, trim and porches, with the prep and primer the New England weather demands."],
      ["Cabinet refinishing", "A kitchen that looks new for a fraction of a full remodel."],
      ["Drywall repair and patching", "Holes, cracks and water damage fixed before the paint goes on."],
      ["Deck and fence staining", "Cleaned, prepped and sealed to hold up through the season."],
    ],
    faq: [
      ["How long does a room take?", "Most rooms are one to two days including prep and two coats. We give you the schedule in writing before we start."],
      ["Do you supply the paint?", "Yes, and we tell you exactly which product and finish we are using and why."],
      ["Can we stay in the house?", "Yes. We work in sections and use low-odor products indoors."],
      ["What areas do you serve?", "{area}. If you are just outside, call anyway and we will tell you straight."],
    ],
    galeria: "Recent projects",
  },
  roofing: {
    promessa: "A roof that keeps the weather out, installed properly",
    linha: "Roof repairs, replacements and inspections across {area}. Honest assessment first, so you are not sold a roof you do not need.",
    medo: [
      ["We look before we sell", "A full inspection with photos, so you see what we see and decide with real information."],
      ["Repair when repair is enough", "Not every leak is a new roof. We tell you which one you are actually dealing with."],
      ["The property is left clean", "Magnet sweep for nails, tarps over the landscaping, and debris hauled away the same day."],
    ],
    servicos: [
      ["Roof replacement", "Full tear-off and installation with proper underlayment, flashing and ventilation."],
      ["Leak repair", "Finding the actual source, not just patching where the water shows up inside."],
      ["Inspections and documentation", "Photo reports for your records, for a sale, or for an insurance claim."],
      ["Flashing and chimney work", "The details around chimneys, valleys and skylights, where most leaks start."],
      ["Ventilation", "Ridge and soffit venting that keeps the attic dry and the roof lasting longer."],
    ],
    faq: [
      ["Do you do free inspections?", "Yes. You get photos and a straight answer on whether you need a repair or a replacement."],
      ["How long does a replacement take?", "Most homes are one to two days. Weather can move it, and we tell you as soon as we know."],
      ["Do you work with insurance claims?", "We document everything with photos and written detail so you have what the adjuster needs."],
      ["What areas do you serve?", "{area}. If you are just outside, call anyway and we will tell you straight."],
    ],
    galeria: "Recent roofs",
  },
  remodeling: {
    promessa: "Remodels that finish on the date we promised",
    linha: "Kitchens, bathrooms and full renovations across {area}. One crew, one schedule, and a number you can plan around.",
    medo: [
      ["You get a real schedule", "Written, with dates, before demolition starts. If something shifts, you hear it from us the same day."],
      ["One point of contact", "You talk to the person running the job, not a call center."],
      ["The house stays livable", "Dust barriers, protected floors and a clean site at the end of every day."],
    ],
    servicos: [
      ["Bathroom remodeling", "Full gut or refresh, with tile, plumbing and fixtures handled by one crew."],
      ["Kitchen remodeling", "Cabinets, counters, backsplash and flooring, coordinated so trades are not waiting on each other."],
      ["Basement finishing", "Turning unused square footage into a room the family actually uses."],
      ["Additions and layout changes", "Opening walls, adding space, and the framing and permits that come with it."],
      ["Tile and finish work", "The details that decide whether a remodel looks professional or homemade."],
    ],
    faq: [
      ["How long does a bathroom take?", "Most full bathrooms run two to three weeks. You get the real schedule in writing before we start."],
      ["Do you handle permits?", "Yes, on work that requires them. We tell you up front what the job needs."],
      ["Can we live here during the work?", "For most single-room remodels yes. For larger jobs we tell you honestly which weeks will be hard."],
      ["What areas do you serve?", "{area}. If you are just outside, call anyway and we will tell you straight."],
    ],
    galeria: "Recent remodels",
  },
  carpentry: {
    promessa: "Custom carpentry, measured and fitted on site",
    linha: "Cabinets, trim and built-ins across {area}. Cut to the space you actually have, not to a catalog size.",
    medo: [
      ["Measured in your home", "Nothing ordered off a chart. We measure the space and build to it."],
      ["Joints and finish done right", "The difference between custom work and flat-pack shows up at the seams."],
      ["Clean install", "Shop work stays in the shop. What happens in your house is assembly, not sawdust."],
    ],
    servicos: [
      ["Custom cabinets", "Kitchens, bathrooms, laundry and garage, built to the room."],
      ["Built-ins and shelving", "Using the awkward wall or alcove that furniture never fits."],
      ["Trim and molding", "Baseboard, crown, casing and wainscoting, mitered properly."],
      ["Doors and hardware", "Hung square, closing right, the first time."],
      ["Decks and outdoor structures", "Built for the New England winter, not for one summer."],
    ],
    faq: [
      ["How long does custom work take?", "Most cabinet jobs run three to five weeks from measurement to install. We give you the dates in writing."],
      ["Can you match existing woodwork?", "Usually yes. Send us a photo and we will tell you honestly how close we can get."],
      ["Do you finish and paint?", "Yes, in the shop, which is a better finish than spraying in your house."],
      ["What areas do you serve?", "{area}. If you are just outside, call anyway and we will tell you straight."],
    ],
    galeria: "Recent work",
  },
  gutters: {
    promessa: "Gutters that move water away from the house",
    linha: "Installation, cleaning and repair across {area}. Sized and pitched properly, because gutters that overflow are worse than none.",
    medo: [
      ["Sized for your roof", "Not every house takes the same gutter. We size and pitch to the roof area you actually have."],
      ["Seamless where it matters", "Fewer joints means fewer places to leak."],
      ["We clean up", "Debris bagged and hauled, not left in the beds."],
    ],
    servicos: [
      ["Seamless gutter installation", "Formed on site to the exact run, in aluminum or copper."],
      ["Cleaning and maintenance", "Before the fall leaves and before the spring thaw."],
      ["Guards and covers", "Cutting the cleaning down on houses under trees."],
      ["Downspouts and drainage", "Moving the water far enough from the foundation to matter."],
      ["Repairs and re-pitching", "Fixing the sag that makes water sit and overflow."],
    ],
    faq: [
      ["How often should gutters be cleaned?", "Twice a year for most homes, more if you are under pines or oaks."],
      ["Are gutter guards worth it?", "Sometimes. We tell you honestly whether your tree cover justifies the cost."],
      ["How long does an install take?", "Most homes are a single day."],
      ["What areas do you serve?", "{area}. If you are just outside, call anyway and we will tell you straight."],
    ],
    galeria: "Recent installs",
  },
  framing: {
    promessa: "Framing and drywall done straight and square",
    linha: "Framing, drywall and finishing across {area}. The layer nobody sees, done so the layers everybody sees come out right.",
    medo: [
      ["Square and plumb", "Because every trade after us pays for it if we are not."],
      ["On the general's schedule", "We show up when the schedule says and we do not hold up the next crew."],
      ["Finished ready for paint", "Taped, mudded and sanded to a surface the painter is not fighting."],
    ],
    servicos: [
      ["Interior framing", "Walls, openings and layout changes."],
      ["Drywall hanging", "Cut and hung with the seams where they belong."],
      ["Taping and finishing", "To a level that paints out clean."],
      ["Ceilings", "Flat, coffered and repairs after water damage."],
      ["Repairs and patches", "Holes, cracks and openings closed so you cannot tell where they were."],
    ],
    faq: [
      ["Do you work with general contractors?", "Yes, that is most of our work. We keep to the schedule we are given."],
      ["Do you do the painting too?", "We finish to a paint-ready surface. Painting we can quote separately."],
      ["How fast can you start?", "Call and we will tell you honestly where we are booked to."],
      ["What areas do you serve?", "{area}. If you are just outside, call anyway and we will tell you straight."],
    ],
    galeria: "Recent work",
  },
  landscaping: {
    promessa: "Yards that look cared for, all season",
    linha: "Lawn care, cleanups and landscaping across {area}. Same crew every visit, so nothing gets missed.",
    medo: [
      ["Same crew, every visit", "They learn your property instead of starting over each week."],
      ["We show up on schedule", "Rain moves us a day, and you hear about it."],
      ["Clean edges", "Beds, walkways and driveways cut clean. It is what makes a yard look maintained."],
    ],
    servicos: [
      ["Weekly lawn maintenance", "Mowing, trimming and blowing, on a set day."],
      ["Spring and fall cleanups", "Leaves, beds and the winter debris."],
      ["Mulch and bed work", "Edged, weeded and mulched."],
      ["Planting and design", "Plants that survive the New England winter."],
      ["Hardscaping", "Walkways, patios and retaining walls."],
    ],
    faq: [
      ["Do you offer seasonal contracts?", "Yes, and we tell you exactly what each visit includes."],
      ["What if it rains on my day?", "We move you to the next dry day and let you know."],
      ["Do you handle cleanups only?", "Yes, one-time cleanups without a contract are fine."],
      ["What areas do you serve?", "{area}. If you are just outside, call anyway and we will tell you straight."],
    ],
    galeria: "Recent properties",
  },
  cleaning: {
    promessa: "Exteriors cleaned without damaging what is underneath",
    linha: "Pressure and soft washing across {area}. The right pressure for the surface, which is what separates cleaning from stripping.",
    medo: [
      ["Right pressure for the surface", "Soft wash on siding and roofs, higher pressure only where it belongs."],
      ["Plants protected", "Rinsed and covered before we start."],
      ["You see the difference", "Before and after on every job."],
    ],
    servicos: [
      ["House and siding washing", "Removing the green and the grime without forcing water behind the siding."],
      ["Roof soft washing", "Killing the algae streaks without stripping the granules off the shingles."],
      ["Driveways and walkways", "Concrete, pavers and brick."],
      ["Decks and fences", "Cleaned and prepped for sealing."],
      ["Gutter brightening", "The black streaks off the gutter faces."],
    ],
    faq: [
      ["Will it damage my siding?", "Not the way we do it. Siding gets soft wash, never high pressure."],
      ["How long does a house take?", "Most homes are half a day."],
      ["How often?", "Every one to two years for most houses in this climate."],
      ["What areas do you serve?", "{area}. If you are just outside, call anyway and we will tell you straight."],
    ],
    galeria: "Recent jobs",
  },
  geral: {
    promessa: "Work done right, finished on the schedule we gave you",
    linha: "Serving homeowners across {area}. Clear pricing, a real schedule, and a crew that treats the house with respect.",
    medo: [
      ["A schedule you can plan around", "You get dates before we start, and you hear from us first if anything moves."],
      ["Pricing before the work", "The number is agreed before we begin. No surprises at the end."],
      ["We leave it clean", "Every day, not just the last one."],
    ],
    servicos: [],
    faq: [
      ["Do you give free estimates?", "Yes. Send a message with a photo and we will tell you what it takes."],
      ["How soon can you start?", "Call and we will tell you honestly where we are booked to."],
      ["Are you insured?", "Ask us and we will send the documentation."],
      ["What areas do you serve?", "{area}. If you are just outside, call anyway and we will tell you straight."],
    ],
    galeria: "Recent work",
  },
};

/* Diferenciais: o cliente escreve duas palavras em português. Viram um bloco
   escrito em inglês. Se nada casar, o ofício já traz os três dele.        */
const SINAIS = [
  [/r[áa]pid|velocidad|[áa]gil|urgen|mesmo dia|emergen|pontual|prazo|no prazo/i,
   ["Speed you can count on", "We answer fast and we finish when we said we would. Most people call us because the last crew did not."]],
  [/cuidad|limp|caprich|zel|respeit|organiza/i,
   ["We treat the house like ours", "Floors covered, space cleaned at the end of every day, and nothing left for you to deal with."]],
  [/qualidad|acabament|detalhe|bem feito|perfei/i,
   ["The finish is where it shows", "Anyone can do the middle of the job. The edges and the details are what you will be looking at for years."]],
  [/pre[çc]o|barat|custo|justo|honest/i,
   ["Fair, written pricing", "You get the number before the work starts, and it does not change at the end."]],
  [/garantia|warrant/i,
   ["Backed by our warranty", "If something is not right after we leave, we come back and make it right."]],
  [/experi[êe]nc|anos|tempo de|veteran/i,
   ["Years of doing this", "Enough jobs behind us to know what goes wrong before it does."]],
  [/comunica|aviso|whats|foto|atualiza|transparen/i,
   ["You always know where the job stands", "Updates as we go, with photos, so you are never wondering what happened today."]],
  [/licen|seguro|insur|bonded/i,
   ["Licensed and insured", "Documentation available on request, before any work starts."]],
];

/* ═══════════════════════ SITE DO CLIENTE ═══════════════════════
   Reconstruído do zero. O anterior tinha 6 KB, quatro seções, nenhum dado
   estruturado, nenhum telefone clicável, nenhuma das cidades atendidas, e
   despejava a prosa em português do formulário na tela.

   Regras deste gerador:
   1. NADA em português vai pra tela. As respostas são briefing.
   2. O lead vai direto pro WhatsApp DO CLIENTE. Nunca passa pela agência:
      quem pede orçamento é ativo dele.
   3. Tudo que o checklist de otimização exige tem que sair pronto daqui.  */

const tit = (s) => String(s || "").trim().split(/\s+/)
  .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");

// telefone -> só dígitos, com o 1 dos EUA quando vier sem
function soDigitos(t) {
  const d = String(t || "").replace(/\D/g, "");
  return d.length === 10 ? "1" + d : d;
}
// clareia ou escurece uma cor hex, pra derivar tons da paleta do cliente
function tom(hex, f) {
  const h = String(hex || "").replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(h)) return hex || "#1b4965";
  const n = [0, 2, 4].map((i) => {
    const v = parseInt(h.slice(i, i + 2), 16);
    return Math.max(0, Math.min(255, Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f))));
  });
  return "#" + n.map((v) => v.toString(16).padStart(2, "0")).join("");
}
// texto legível sobre uma cor qualquer
function contraste(hex) {
  const h = String(hex || "").replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(h)) return "#fff";
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? "#14110c" : "#ffffff";
}

function oficiosDe(c) {
  const txt = [c.servicos, c.faz, c.nicho, c.empresa].filter(Boolean).join(" ");
  const achados = OFICIOS.filter(([, re]) => re.test(txt)).map(([k]) => k);
  return achados.length ? achados : ["geral"];
}
function diferenciaisDe(c, oficio) {
  const txt = [c.diferencial, c.faz, c.observacoes].filter(Boolean).join(" ");
  const achados = [];
  for (const [re, bloco] of SINAIS) {
    if (achados.length >= 3) break;
    if (re.test(txt)) achados.push(bloco);
  }
  const padrao = FALA[oficio].medo;
  for (const p of padrao) {                      // completa até 3 sem repetir
    if (achados.length >= 3) break;
    if (!achados.some((a) => a[0] === p[0])) achados.push(p);
  }
  return achados.slice(0, 3);
}

export function gerarSite(c, fotos = [], reviews = []) {
  const empresa = esc(c.empresa || "Our Company");
  const dono = esc(tit(c.nome_dono || c.nome_contato || ""));
  const cidade = esc(tit(c.cidade || ""));
  const uf = esc(String(c.estado || "").toUpperCase().slice(0, 2));
  const telBruto = String(c.telefone || "").trim();
  const tel = esc(telBruto);
  const zap = soDigitos(telBruto);
  const anos = (String(c.tempo_mercado || "").match(/\d+/) || [])[0] || "";

  const oficios = oficiosDe(c);
  const chefe = oficios[0];
  const F = FALA[chefe];

  // cidades atendidas: texto indexável, que é a maior alavanca de SEO local
  const cidades = [...new Set(
    String(c.localizacoes || c.cidade || "").split(/[,;\n/]+/)
      .map((x) => tit(x)).filter((x) => x.length > 1))];
  const area = cidades.length
    ? (cidades.length > 3 ? cidades.slice(0, 3).join(", ") + " and nearby" : cidades.join(", "))
    : `${cidade}, ${uf}`;

  // serviços: a lista curada do ofício, não a frase solta do formulário
  const servicos = oficios.flatMap((o) => FALA[o].servicos).slice(0, 8);
  const difs = diferenciaisDe(c, chefe);
  const faq = F.faq.map(([q, a]) => [q, a.replace("{area}", area)]);
  const linha = F.linha.replace("{area}", area);
  const principal = servicos.length ? servicos[0][0] : tit(chefe);
  const titulo = `${principal} in ${cidade}, ${uf} | ${empresa}`;
  const descricao = `${empresa}: ${F.promessa.toLowerCase()}. Serving ${area}. Call ${tel} for a free estimate.`;

  const prim = c.cor_primaria || "#1b4965";
  const dest = c.cor_destaque || "#f6ae2d";
  // A capa é a foto que mais aparece no site inteiro. Quem escolhe é o
  // operador, reordenando as fotos no cadastro do cliente: a primeira da
  // lista vira o hero. Está dito no checklist.
  const capa = fotos[0] || "";
  const grade = fotos.slice(1, 10);
  /* ⚠ O site NÃO recebe mais texto gerado. Antes, `reviews` chegava aqui com
     avaliação fabricada e ia para o site PÚBLICO do cliente como se fosse
     depoimento real. Agora só entra avaliação de verdade, digitada à mão
     depois de existir no perfil do Google, e hoje nada alimenta isso: a lista
     chega vazia e a seção não é desenhada. É o comportamento certo, e o
     checklist já dizia isso ("Avaliações do Google aparecendo no site: depois
     que existirem avaliações reais. Nunca antes, e nunca inventadas"). */
  const revs = (reviews || []).filter((r) => r.real === 1 || r.real === true).slice(0, 3);

  const msg = encodeURIComponent(
    `Hi ${dono || empresa}! I found your website and I would like a free estimate.`);
  const linkZap = zap ? `https://wa.me/${zap}?text=${msg}` : "";

  const jsonld = JSON.stringify({
    "@context": "https://schema.org", "@type": "HomeAndConstructionBusiness",
    name: c.empresa || "", telephone: telBruto || undefined,
    url: c.vercel_url || undefined,
    image: fotos.slice(0, 5),
    areaServed: cidades.map((n) => ({ "@type": "City", name: n })),
    address: { "@type": "PostalAddress", addressLocality: c.cidade || "", addressRegion: uf, addressCountry: "US" },
    founder: c.nome_dono ? { "@type": "Person", name: c.nome_dono } : undefined,
    knowsLanguage: ["en", "pt"],
    makesOffer: servicos.map(([n, d]) => ({ "@type": "Offer",
      itemOffered: { "@type": "Service", name: n, description: d } })),
    openingHours: "Mo-Sa 07:00-19:00",
  }, (k, v) => v === undefined ? undefined : v);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${titulo}</title>
<meta name="description" content="${esc(descricao)}">
<meta property="og:title" content="${titulo}">
<meta property="og:description" content="${esc(descricao)}">
${capa ? `<meta property="og:image" content="${esc(capa)}">` : ""}
<meta name="robots" content="index,follow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;600;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
<script type="application/ld+json">${jsonld}</script>
<style>
:root{
  --prim:${prim}; --prim-esc:${tom(prim, -0.45)}; --prim-cl:${tom(prim, 0.9)};
  --dest:${dest}; --sobre-dest:${contraste(dest)};
  --tinta:#15130f; --tinta2:#4a4740; --linha:#e2ded4; --papel:#faf8f4; --branco:#fff;
  --disp:"Zilla Slab",Georgia,serif; --corpo:"Source Sans 3",-apple-system,Segoe UI,sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font:400 17px/1.6 var(--corpo);color:var(--tinta);background:var(--branco);-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}
a{color:inherit}
h1,h2,h3{font-family:var(--disp);font-weight:700;line-height:1.1;letter-spacing:-.015em;text-wrap:balance}
h1{font-size:clamp(2.3rem,5.6vw,4rem)}
h2{font-size:clamp(1.75rem,3.6vw,2.7rem)}
h3{font-size:1.18rem;font-weight:600}
p{max-width:62ch}
.env{max-width:1120px;margin:0 auto;padding:0 22px}
.sec{padding:clamp(56px,7vw,96px) 0}
.rot{font:700 11.5px/1 var(--corpo);letter-spacing:.16em;text-transform:uppercase;
  color:var(--prim);margin-bottom:14px;display:block}

/* topo */
header{position:sticky;top:0;z-index:50;background:var(--prim);color:#fff;
  box-shadow:0 1px 0 rgba(0,0,0,.12)}
.barra{display:flex;align-items:center;gap:16px;padding:13px 0;min-height:64px}
.marca{font-family:var(--disp);font-weight:700;font-size:19px;line-height:1.1;letter-spacing:-.01em}
.marca small{display:block;font:400 11.5px/1.3 var(--corpo);opacity:.72;letter-spacing:.02em}
.topo-acoes{margin-left:auto;display:flex;align-items:center;gap:10px}
.fone{font-family:var(--disp);font-weight:600;font-size:17px;color:#fff;text-decoration:none;white-space:nowrap}
.fone span{display:block;font:400 10.5px/1 var(--corpo);opacity:.7;letter-spacing:.09em;text-transform:uppercase}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;
  background:var(--dest);color:var(--sobre-dest);border:0;border-radius:4px;cursor:pointer;
  font:700 15px/1 var(--corpo);padding:14px 22px;text-decoration:none;white-space:nowrap;
  transition:filter .2s,transform .15s}
.btn:hover{filter:brightness(1.07);transform:translateY(-1px)}
.btn.linha2{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.5)}
.btn.linha2:hover{background:rgba(255,255,255,.12)}
.btn.pq{padding:11px 17px;font-size:14px}

/* hero */
.hero{position:relative;background:var(--prim-esc);color:#fff;overflow:hidden}
.hero-foto{position:absolute;inset:0}
.hero-foto img{width:100%;height:100%;object-fit:cover;opacity:.42}
.hero::after{content:"";position:absolute;inset:0;
  background:linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,.72))}
.hero .env{position:relative;z-index:2;padding-top:clamp(58px,8vw,104px);padding-bottom:clamp(58px,8vw,104px)}
.hero .rot{color:var(--dest)}
.hero h1{max-width:17ch}
.hero .lead{font-size:clamp(1.05rem,1.7vw,1.22rem);margin-top:20px;max-width:52ch;color:rgba(255,255,255,.9)}
.hero .acoes{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px}

/* faixa de confiança */
.faixa{background:var(--prim-cl);border-bottom:1px solid var(--linha)}
.faixa ul{list-style:none;display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));
  gap:1px;background:var(--linha)}
.faixa li{background:var(--prim-cl);padding:18px 20px}
.faixa b{font-family:var(--disp);font-size:20px;display:block;color:var(--prim)}
.faixa span{font-size:13.5px;color:var(--tinta2)}

/* serviços */
.servicos{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1px;
  margin-top:38px}
.serv{background:var(--branco);padding:26px 24px;box-shadow:0 0 0 1px var(--linha)}
.serv h3{margin-bottom:8px}
.serv p{font-size:15px;color:var(--tinta2);max-width:none}
.serv i{display:block;width:30px;height:3px;background:var(--dest);margin-bottom:16px}

/* galeria: proporção fixa e recorte, nunca esticar */
.galeria{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px;margin-top:34px}
.galeria a{display:block;overflow:hidden;border-radius:3px;background:var(--papel);aspect-ratio:4/3}
.galeria img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
.galeria a:hover img{transform:scale(1.04)}

/* diferenciais */
.porques{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:34px;margin-top:38px}
.porque b{font-family:var(--disp);font-size:1.14rem;display:block;margin-bottom:8px}
.porque p{font-size:15.5px;color:var(--tinta2);max-width:none}
.porque .n{font:700 12px/1 var(--corpo);color:var(--dest);letter-spacing:.1em;display:block;margin-bottom:11px}

/* área atendida */
.area{background:var(--prim);color:#fff}
.area .rot{color:var(--dest)}
.area h2{max-width:20ch}
.cidades{display:flex;flex-wrap:wrap;gap:9px;margin-top:26px}
.cidades span{background:rgba(255,255,255,.11);border:1px solid rgba(255,255,255,.16);
  padding:8px 15px;border-radius:3px;font-size:14.5px;font-weight:600}

/* avaliações */
.revs{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:22px;margin-top:34px}
.rev{background:var(--papel);border:1px solid var(--linha);padding:22px 24px;border-radius:4px}
.rev .est{color:var(--dest);letter-spacing:2px;font-size:15px;margin-bottom:10px}
.rev p{font-size:15.5px;color:var(--tinta2);max-width:none}

/* faq */
.faq{max-width:780px;margin-top:32px}
.faq details{border-bottom:1px solid var(--linha)}
.faq summary{cursor:pointer;list-style:none;padding:20px 40px 20px 0;position:relative;
  font-family:var(--disp);font-weight:600;font-size:1.1rem}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";position:absolute;right:6px;top:17px;font-size:24px;
  color:var(--dest);font-family:var(--corpo);line-height:1}
.faq details[open] summary::after{content:"–"}
.faq .r{padding:0 40px 22px 0;color:var(--tinta2);font-size:16px}

/* contato */
.contato{background:var(--papel);border-top:1px solid var(--linha)}
.ct{display:grid;grid-template-columns:1fr 1fr;gap:clamp(32px,5vw,64px);align-items:start}
.cx{background:var(--branco);border:1px solid var(--linha);border-radius:5px;padding:clamp(22px,3vw,32px)}
.campo{margin-bottom:14px}
.campo label{display:block;font-size:13.5px;font-weight:700;margin-bottom:5px}
.campo input,.campo select,.campo textarea{width:100%;padding:12px 13px;border:1px solid var(--linha);
  border-radius:4px;font:400 16px/1.4 var(--corpo);background:var(--branco);color:var(--tinta)}
.campo input:focus,.campo select:focus,.campo textarea:focus{outline:0;border-color:var(--prim);
  box-shadow:0 0 0 3px ${tom(prim, 0.78)}}
.campo textarea{min-height:82px;resize:vertical}
.cx .btn{width:100%;margin-top:6px}
.aviso{font-size:12.5px;color:var(--tinta2);text-align:center;margin-top:11px}
.direto{list-style:none;display:grid;gap:14px;margin-top:26px}
.direto li{display:flex;gap:13px;align-items:flex-start;font-size:15.5px}
.direto b{font-family:var(--disp)}

/* rodapé */
footer{background:var(--prim-esc);color:rgba(255,255,255,.72);padding:44px 0 100px;font-size:14.5px}
footer .g{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:26px}
footer b{color:#fff;font-family:var(--disp);font-size:16px;display:block;margin-bottom:9px}
footer a{color:rgba(255,255,255,.8)}
footer .base{margin-top:32px;padding-top:18px;border-top:1px solid rgba(255,255,255,.14);font-size:13px;opacity:.65}

/* barra fixa no celular: ligar e WhatsApp sempre à mão */
.movel{position:fixed;left:0;right:0;bottom:0;z-index:60;display:none;
  grid-template-columns:1fr 1fr;gap:1px;background:rgba(0,0,0,.2)}
.movel a{display:flex;align-items:center;justify-content:center;gap:8px;padding:15px 8px;
  font:700 15px/1 var(--corpo);text-decoration:none}
.movel .lig{background:var(--prim);color:#fff}
.movel .zap{background:#25D366;color:#0b3d1e}
@media(max-width:760px){
  .movel{display:grid}
  .ct{grid-template-columns:1fr}
  .topo-acoes .btn{display:none}
  .barra{min-height:58px}
}
@media(prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto}}
</style>
</head>
<body>

<header>
  <div class="env barra">
    <div class="marca">${empresa}${cidade ? `<small>${cidade}, ${uf}</small>` : ""}</div>
    <div class="topo-acoes">
      ${tel ? `<a class="fone" href="tel:${esc(telBruto.replace(/[^\d+]/g, ""))}"><span>Call now</span>${tel}</a>` : ""}
      <a class="btn pq" href="#estimate">Free Estimate</a>
    </div>
  </div>
</header>

<section class="hero">
  ${capa ? `<div class="hero-foto"><img src="${esc(capa)}" alt="${empresa} work in ${cidade}, ${uf}" fetchpriority="high"></div>` : ""}
  <div class="env">
    <span class="rot">${esc(cidade)}, ${uf}${anos ? ` &middot; ${anos}+ years` : ""}</span>
    <h1>${esc(F.promessa)}</h1>
    <p class="lead">${esc(linha)}</p>
    <div class="acoes">
      <a class="btn" href="#estimate">Get a Free Estimate</a>
      ${tel ? `<a class="btn linha2" href="tel:${esc(telBruto.replace(/[^\d+]/g, ""))}">Call ${tel}</a>` : ""}
    </div>
  </div>
</section>

<div class="faixa"><div class="env"><ul>
  ${anos ? `<li><b>${anos}+ years</b><span>Doing this work</span></li>` : ""}
  <li><b>${cidades.length || 1} ${cidades.length === 1 ? "city" : "cities"}</b><span>Service area</span></li>
  <li><b>Free</b><span>Estimates</span></li>
  <li><b>English &amp; Portuguese</b><span>We speak both</span></li>
</ul></div></div>

<section class="sec"><div class="env">
  <span class="rot">What we do</span>
  <h2>Services in ${esc(cidade)} and nearby</h2>
  <div class="servicos">
    ${servicos.map(([n, d]) => `<article class="serv"><i></i><h3>${esc(n)}</h3><p>${esc(d)}</p></article>`).join("")}
  </div>
</div></section>

${grade.length ? `<section class="sec" style="background:var(--papel);border-top:1px solid var(--linha);border-bottom:1px solid var(--linha)"><div class="env">
  <span class="rot">Our work</span>
  <h2>${esc(F.galeria)}</h2>
  <div class="galeria">
    ${grade.map((u, i) => `<a href="${esc(u)}" target="_blank" rel="noopener"><img src="${esc(u)}" alt="${empresa} project ${i + 1} in ${cidade}, ${uf}" loading="lazy"></a>`).join("")}
  </div>
</div></section>` : ""}

<section class="sec"><div class="env">
  <span class="rot">Why homeowners call us back</span>
  <h2>What you get working with ${dono ? esc(dono) : esc(empresa)}</h2>
  <div class="porques">
    ${difs.map(([t, d], i) => `<div class="porque"><span class="n">0${i + 1}</span><b>${esc(t)}</b><p>${esc(d)}</p></div>`).join("")}
  </div>
</div></section>

<section class="sec area"><div class="env">
  <span class="rot">Service area</span>
  <h2>Where we work</h2>
  <p style="color:rgba(255,255,255,.82);margin-top:14px">We serve homeowners in these communities. If you are just outside, call anyway and we will tell you straight.</p>
  <div class="cidades">${cidades.map((n) => `<span>${esc(n)}</span>`).join("")}</div>
</div></section>

${revs.length ? `<section class="sec"><div class="env">
  <span class="rot">Reviews</span>
  <h2>What our customers say</h2>
  <div class="revs">${revs.map((r) => `<div class="rev"><div class="est">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p>${esc(r.texto)}</p></div>`).join("")}</div>
</div></section>` : ""}

<section class="sec" style="background:var(--papel);border-top:1px solid var(--linha)"><div class="env">
  <span class="rot">Questions</span>
  <h2>Before you call</h2>
  <div class="faq">
    ${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><div class="r">${esc(a)}</div></details>`).join("")}
  </div>
</div></section>

<section class="sec contato" id="estimate"><div class="env ct">
  <div>
    <span class="rot">Free estimate</span>
    <h2>Tell us what you need</h2>
    <p style="margin-top:14px;color:var(--tinta2)">Fill this in and it opens WhatsApp with your message ready. You read it before you send. No cost, no obligation.</p>
    <ul class="direto">
      ${tel ? `<li><b>Call:</b> <a href="tel:${esc(telBruto.replace(/[^\d+]/g, ""))}">${tel}</a></li>` : ""}
      ${linkZap ? `<li><b>WhatsApp:</b> <a href="${linkZap}" target="_blank" rel="noopener">Message us now</a></li>` : ""}
      <li><b>Serving:</b> ${esc(area)}</li>
      <li><b>Hours:</b> Monday to Saturday, 7am to 7pm</li>
    </ul>
  </div>
  <div class="cx">
    <form id="f" onsubmit="return enviar(event)">
      <div class="campo"><label for="n">Your name</label><input id="n" required></div>
      <div class="campo"><label for="p">Phone</label><input id="p" type="tel" inputmode="tel" required></div>
      <div class="campo"><label for="s">What do you need?</label>
        <select id="s">${servicos.map(([n]) => `<option>${esc(n)}</option>`).join("")}<option>Something else</option></select></div>
      <div class="campo"><label for="ct">Your town</label><input id="ct" placeholder="${esc(cidades[0] || cidade)}" required></div>
      <div class="campo"><label for="m">Tell us a bit more</label><textarea id="m" placeholder="Rough size, timing, anything we should know."></textarea></div>
      <button class="btn" type="submit">Send on WhatsApp</button>
      <p class="aviso">Opens WhatsApp with your message written. You send it.</p>
    </form>
  </div>
</div></section>

<footer><div class="env">
  <div class="g">
    <div><b>${empresa}</b>${cidade ? `${cidade}, ${uf}<br>` : ""}${esc(area)}</div>
    <div><b>Contact</b>${tel ? `<a href="tel:${esc(telBruto.replace(/[^\d+]/g, ""))}">${tel}</a><br>` : ""}${linkZap ? `<a href="${linkZap}" target="_blank" rel="noopener">WhatsApp</a>` : ""}</div>
    <div><b>Hours</b>Monday to Saturday<br>7:00am to 7:00pm</div>
    <div><b>Languages</b>English<br>Portuguese</div>
  </div>
  <div class="base">&copy; <span id="y"></span> ${empresa}. All rights reserved.</div>
</div></footer>

<nav class="movel">
  ${tel ? `<a class="lig" href="tel:${esc(telBruto.replace(/[^\d+]/g, ""))}">Call now</a>` : ""}
  ${linkZap ? `<a class="zap" href="${linkZap}" target="_blank" rel="noopener">WhatsApp</a>` : ""}
</nav>

<script>
document.getElementById('y').textContent=new Date().getFullYear();
function enviar(e){
  e.preventDefault();
  var v=function(i){return (document.getElementById(i).value||'').trim()};
  var t=['Hi! I found your website and I would like a free estimate.','',
    'Name: '+v('n'),'Phone: '+v('p'),'Service: '+v('s'),'Town: '+v('ct')];
  if(v('m')) t.push('Details: '+v('m'));
  var url='https://wa.me/${zap}?text='+encodeURIComponent(t.join('\\n'));
  var w=window.open(url,'_blank','noopener'); if(!w) location.href=url;
  return false;
}
</script>
</body>
</html>`;
}


// Cadência de entrega, criada quando o CLIENTE responde o formulário.
// Prazo máximo: 5 DIAS ÚTEIS (fim de semana não conta).
export const CADENCIA = [
  { dia: 1, marco: "Grupo do WhatsApp criado com o cliente",      quem: "agência" },
  { dia: 1, marco: "Site no ar e link enviado ao cliente",        quem: "agência" },
  { dia: 1, marco: "Logo entregue (se o cliente não tinha)",      quem: "agência" },
  { dia: 2, marco: "12 posts do Instagram entregues",             quem: "agência" },
  { dia: 2, marco: "4 destaques do Instagram entregues",          quem: "agência" },
  { dia: 3, marco: "Sistema de avaliação entregue (link, QR e 20 pedidos)", quem: "agência" },
  { dia: 3, marco: "Tutorial do Google Meu Negócio enviado",      quem: "agência" },
  { dia: 4, marco: "Acesso ao Google Meu Negócio liberado",       quem: "cliente" },
  { dia: 4, marco: "GMB otimizado (categorias, serviços, fotos)", quem: "agência" },
  { dia: 5, marco: "Pasta de entrega completa enviada",           quem: "agência" },
  { dia: 5, marco: "Reunião de entrega realizada",                quem: "ambos" },
];
export const PRAZO_MAXIMO_DIAS = 5;

/* Mínimo de fotos do formulário. Fica AQUI, num lugar só, porque o número
   aparece em três: a validação do servidor, o texto da tela e a barra de
   progresso do upload. Divergindo, o cliente vê "faltam 11" e é barrado
   por outro número. */
/* ═══════════ AS FOTOS DO CLIENTE, DE ONDE ELAS VIEREM ═══════════
   Chegam por dois caminhos e o site precisa dos dois juntos:

   subidas   o cliente escolheu no celular e o arquivo está no R2. A URL é
             uma rota do próprio Worker (`/m/<chave>`).
   coladas   o cliente pôs um link de Drive ou Dropbox no formulário.

   Duas coisas que esta função existe para não deixar errar:

   1. URL ABSOLUTA. O site vai publicado no Vercel, em outro domínio. Um
      `/m/...` relativo resolveria contra o Vercel, onde a imagem não existe,
      e o site iria ao ar com todas as fotos quebradas.
   2. SUBIDAS PRIMEIRO. A primeira foto da lista vira a capa do site, e foto
      subida do celular é a que o cliente escolheu a dedo. Link colado costuma
      vir em ordem aleatória de pasta.

   Já aconteceu de o site sair sem foto nenhuma porque a geração só olhava as
   coladas. Por isso a junção mora aqui, com teste, e não solta na rota.     */
export function fotosDoCliente({ subidas = [], coladas = [], raiz = "" }) {
  const abs = (u) => {
    const v = String(u || "").trim();
    if (!v) return null;
    if (/^https?:\/\//i.test(v)) return v;      // link já absoluto, passa
    if (v.startsWith("/")) return raiz ? raiz.replace(/\/$/, "") + v : null;
    return null;                                // qualquer outra coisa não é URL
  };
  const vistas = new Set();
  return [...subidas, ...coladas].map(abs).filter((u) => {
    if (!u || vistas.has(u)) return false;      // a mesma foto duas vezes não ajuda
    vistas.add(u);
    return true;
  });
}

export const MIN_FOTOS = 11;

// Soma dias ÚTEIS a partir de uma data: sábado e domingo não contam.
// Dia da semana no fuso do cliente (EUA), não em UTC. Formulário respondido
// domingo 20h em Boston é segunda 01h em UTC: contando em UTC o prazo caía na
// segunda seguinte em vez da sexta, 3 dias de diferença no que foi prometido.
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

/* ═══════════════════════ CHECKLIST DE OTIMIZAÇÃO ═══════════════════════
   Nasce junto com os marcos, quando o cliente responde o formulário.
   A entrega NÃO fecha enquanto os itens obrigatórios não estiverem feitos.

   Cada item tem um "detalhe" que é o passo a passo. A ideia é que quem
   executa não precise lembrar de nada nem procurar tutorial: está aqui.

   ⚠ Google Meu Negócio e Google Business Profile são O MESMO produto. O
   Google renomeou em 2021. Aqui é tratado como uma área só: "gbp".

   obrigatorio: 0 = recomendado, não trava a entrega.               */
export const CHECKLIST = [
  // ───────────── GOOGLE BUSINESS PROFILE ─────────────
  ["gbp", "Perfil verificado pelo Google", 1,
   "Sem verificação o perfil não aparece na busca nem no mapa. O Google pede cartão postal, vídeo ou telefone, e ele escolhe qual. Vídeo costuma sair no mesmo dia: grave o veículo com a marca, a ferramenta e a fachada ou o material, sem cortes. Este item trava todos os outros: comece por ele."],
  ["gbp", "Nome do negócio exatamente igual ao do site e dos documentos", 1,
   "Se a LLC é 'Ribeiro Hardwood Flooring LLC', é isso que vai. NUNCA enfie palavra-chave no nome (tipo 'Ribeiro Hardwood Flooring Boston Best Floors'). Isso é violação explícita das diretrizes e é o motivo número 1 de suspensão de perfil de contractor."],
  ["gbp", "Categoria principal certa, a mais específica que existir", 1,
   "'Flooring contractor' e não 'Contractor'. 'Hardwood floor refinishing service' se for o carro-chefe. A categoria principal é o que mais pesa no ranqueamento local: escolher genérico joga fora a maior alavanca gratuita que existe."],
  ["gbp", "Categorias secundárias preenchidas", 0,
   "Até 9. Uma por serviço real que ele presta. Não invente categoria que ele não atende: gera lead ruim e reclamação."],
  ["gbp", "Área de atendimento configurada, sem endereço público", 1,
   "Contractor que vai até a casa do cliente é 'service area business'. Marque as cidades atendidas e ESCONDA o endereço. Deixar o endereço residencial visível é violação e expõe a casa dele. Use as cidades que ele listou no formulário."],
  ["gbp", "Telefone local, o mesmo que está no site", 1,
   "Número com DDD da região. O mesmo dígito por dígito no perfil, no site e no Instagram. Divergência de telefone entre as fontes derruba a confiança do Google no negócio."],
  ["gbp", "Site do cliente apontado no perfil", 1,
   "Cole a URL do Vercel no campo Website. Este é metade do 'conectar o site ao Google': o perfil aponta pro site."],
  ["gbp", "Link do perfil colocado no site", 1,
   "A outra metade. Pegue o link curto do perfil (Compartilhar, no painel do GBP) e ponha no rodapé do site, com um botão 'See our reviews on Google'. Os dois apontando um pro outro é o que fecha a ligação entre eles."],
  ["gbp", "Horário de funcionamento preenchido", 1,
   "Inclusive sábado. Perfil sem horário aparece como 'horário não informado' e perde clique pra quem tem."],
  ["gbp", "Descrição de 750 caracteres escrita", 1,
   "Em inglês. Cite os serviços principais e 3 ou 4 cidades atendidas, de forma natural. Não repita a mesma palavra dez vezes: o Google entende contexto e repetição forçada não ajuda."],
  ["gbp", "Serviços cadastrados um a um, com descrição", 1,
   "Não deixe só a categoria. Cadastre 'Hardwood installation', 'Hardwood refinishing', 'Tile installation' etc, cada um com duas linhas. É o que faz o perfil aparecer em busca de serviço específico."],
  ["gbp", "Fotos: logo, capa e no mínimo 10 de obra", 1,
   "Use as fotos que o cliente mandou no formulário. Foto de banco de imagem em perfil de contractor é percebida na hora e destrói a confiança. Adicione foto do veículo com a marca e da equipe, se houver."],
  ["gbp", "Atributos preenchidos, principalmente idioma", 0,
   "Marque 'Speaks Portuguese' e 'Identifies as Latino-owned' se ele quiser. Para o público brasileiro nos Estados Unidos isso é filtro de escolha, não enfeite."],
  ["gbp", "Perguntas e respostas semeadas", 0,
   "O próprio dono pode publicar pergunta e responder. Coloque 3 a 5 que ele ouve toda semana: quanto tempo leva, se dá garantia, se atende tal cidade, se faz orçamento grátis. Aparece direto na busca."],
  ["gbp", "Processo de avaliação entregue e explicado ao cliente", 1,
   "Link direto de avaliação, mensagem-modelo em inglês, e o momento certo de pedir: na entrega da obra, com o cliente na frente do resultado. Avaliação é o ativo de maior retorno do perfil."],
  ["gbp", "Nenhuma avaliação fabricada, em hipótese nenhuma", 1,
   "Avaliação inventada suspende o perfil e, desde 2024, a regra da FTC prevê multa civil que alcança quem fornece, não só quem publica. Um perfil suspenso é o pior dano possível para um prestador local. Confirme que o cliente entendeu isso."],

  // ───────────── SITE ─────────────
  ["site", "Nome, área de atendimento e telefone idênticos aos do perfil", 1,
   "É o que o pessoal de SEO local chama de NAP consistente. Qualquer divergência entre site e perfil enfraquece os dois. Confira caractere por caractere."],
  ["site", "Telefone clicável fixo no topo, visível no celular", 1,
   "Link 'tel:' de verdade, não texto. A maior parte do tráfego de contractor é celular e a ação é ligar. Botão de ligar que exige rolar a página perde a ligação."],
  ["site", "Uma seção ou página por serviço principal", 1,
   "Com o termo que a pessoa realmente digita: 'hardwood floor refinishing', não 'nossos serviços'. Cada serviço com título próprio."],
  ["site", "Todas as cidades atendidas escritas no site", 1,
   "Como texto indexável, não como imagem. As cidades que o cliente listou no formulário são a maior alavanca de SEO local que ele tem. Se ele deu 10 cidades e o site não cita nenhuma, o trabalho está pela metade."],
  ["site", "schema.org LocalBusiness em JSON-LD", 1,
   "Bloco de dados estruturados com nome, telefone, área atendida, serviços e horário, mais 'sameAs' apontando pro perfil do Google. É o que ajuda o buscador a entender que site e perfil são o mesmo negócio."],
  ["site", "Título e descrição próprios em cada página", 1,
   "Título com serviço e cidade. Descrição que dá vontade de clicar, não uma lista de palavras."],
  ["site", "Formulário de orçamento que chega em algum lugar", 1,
   "Defina ANTES de publicar para onde vai: WhatsApp do cliente, e-mail, ou o CRM. Formulário que não entrega em lugar nenhum é o erro mais caro e mais silencioso desta lista."],
  ["site", "Foto de capa escolhida a dedo", 1,
   "A PRIMEIRA foto da lista de mídias vira o hero do site, a imagem que domina a tela inteira. Escolha a melhor obra, de preferência horizontal e bem iluminada, e reordene para ela ficar em primeiro. Foto ruim no topo derruba o site inteiro, por melhor que seja o resto."],
  ["site", "Fotos reais de obra, com antes e depois", 1,
   "Só as fotos do cliente. Antes e depois é o formato que mais converte em obra."],
  ["site", "HTTPS ativo e site abrindo rápido no celular", 1,
   "O Vercel já entrega HTTPS. Teste a velocidade no celular, em rede móvel, não no Wi-Fi do escritório."],
  ["site", "Google Search Console verificado", 1,
   "É onde você vê o que as pessoas digitaram pra chegar no site. Sem isso você não tem como provar resultado na conversa de renovação."],
  ["site", "Avaliações do Google aparecendo no site", 0,
   "Depois que existirem avaliações reais. Nunca antes, e nunca inventadas."],
  ["site", "Selo de licença e seguro", 0,
   "Só se o cliente realmente tiver. Se tiver, é dos elementos que mais aumentam confiança nos Estados Unidos."],

  // ───────────── INSTAGRAM ─────────────
  ["instagram", "Bio com serviço e cidade em inglês", 1,
   "A bio é o resultado de busca dentro do Instagram. 'Hardwood flooring · Framingham, MA' funciona melhor que uma frase bonita."],
  ["instagram", "Link do site na bio", 1,
   "Apontando pro site no Vercel. Se um dia tiver domínio próprio, troque aqui também. O Instagram é onde muita gente descobre o negócio, e um perfil sem link manda a pessoa embora sem caminho nenhum."],
  ["instagram", "Botão de contato configurado", 1,
   "Converta a conta para perfil profissional (Configurações, Conta, Mudar para conta profissional) e preencha telefone e e-mail. Isso libera os botões de Ligar e Mensagem no topo do perfil, que é como o dono de casa fala com ele sem sair do aplicativo."],
  ["instagram", "12 posts publicados", 1,
   "Os briefs saem prontos na geração. Perfil com 3 posts passa a mesma mensagem que perfil vazio."],
  ["instagram", "4 destaques montados com capa", 1,
   "Antes e depois, serviços, região atendida e depoimentos reais."],
  ["instagram", "Login e senha ficam COM O CLIENTE", 1,
   "A agência nunca guarda credencial de cliente. Se você precisou entrar para configurar, confirme que ele trocou a senha depois e que tem o acesso na mão dele."],

  // ───────────── LOGO ─────────────
  ["logo", "Arquivo entregue em PNG com fundo transparente", 1,
   "Três arquivos no mínimo: a principal em PNG transparente, uma versão para fundo claro e uma para fundo escuro. Fundo escuro importa porque o Instagram e o site usam faixas pretas, e logo preta em fundo preto some."],
  ["logo", "Logo aplicada nos três lugares", 1,
   "Site, perfil do Google e Instagram, na mesma versão. Marca diferente em cada canal parece empresa diferente."],
  ["logo", "Arquivos originais entregues ao cliente", 1,
   "Ele é o dono da marca dele. Mande a pasta com todos os formatos."],

  // ───────────── GERAL ─────────────
  ["geral", "Grupo de WhatsApp criado e link salvo no CRM", 1,
   "Toda a comunicação da entrega passa por ali. Sem um lugar único, a conversa se espalha e ninguém sabe o que foi decidido."],
  ["geral", "Nenhuma senha do cliente guardada pela agência", 1,
   "Confirme que Instagram, Google e domínio estão em nome dele, com acesso dele. Se a agência sair, ele fica com tudo."],
  ["geral", "Pasta de entrega enviada", 1,
   "O arquivo de entrega com tudo: links, reviews, briefs e os próximos passos dele."],
  ["geral", "Reunião de entrega feita, com o cliente vendo a tela", 1,
   "Mostre o perfil, o site e o Instagram funcionando. Entrega enviada por mensagem e não apresentada é entrega que o cliente não sabe que recebeu."],
];
