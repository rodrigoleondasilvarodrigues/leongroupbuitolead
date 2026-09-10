/* ═══════════════════════ ATIVAÇÕES ═══════════════════════
   O follow-up com playbook, não com botão vazio.

   ── o que mudou, e por quê ──
   Antes, clicar numa ativação só REGISTRAVA "eu fiz isso". O conteúdo era
   inventado por fora, do zero, toda vez, e às onze da noite depois de um dia
   de trabalho o conteúdo inventado é sempre pior.

   Agora clicar ABRE o playbook: o que escrever, o que falar no áudio, quais
   emojis, a direção da foto de visualização única e o prompt de imagem pronto
   para colar, tudo já com o nome e a empresa do lead dentro. Registrar é um
   segundo clique, depois de mandar de verdade.

   ── as duas regras que o conteúdo daqui não quebra ──
   1. FOLLOW-UP NÃO É VENDA. Nenhuma mensagem oferta, manda preço ou empurra.
      A venda acontece na ligação. A ativação só reabre a conversa.
   2. INTEGRIDADE (CLAUDE.md). Nada inventa cliente, resultado, depoimento,
      urgência ou prazo. Nada finge que houve pagamento.

   ── sobre os dois prompts longos ──
   PROMPT_PDF_FOLLOWUP e PROMPT_CEU são texto do USUÁRIO, colados palavra por
   palavra. Não reescrever, não "melhorar", não encurtar: ele escreveu com
   cuidado e as travas de integridade estão dentro do próprio prompt (o crachá
   obrigatório "FOLLOW-UP — NOT A PAYMENT", a lista do que não pode aparecer).
   Mexer no texto é mexer nas travas.

   O travessão em "FOLLOW-UP — NOT A PAYMENT" fica: é string exigida como
   exata pelo prompt dele, em inglês, e é crachá, não separador de frase.   */

/* Placeholders que o personalizador troca. Os dois primeiros formatos são os
   que o usuário usou nos prompts dele; o formato {{CHAVE}} é o do conteúdo
   escrito depois. Todos convivem. */
import { CONTEUDO } from "./conteudo-ativacoes.js";

const TROCAS = [
  [/\[NOME_DO_CLIENTE\]/g, "nome"],
  [/\[EMPRESA_DO_CLIENTE\]/g, "empresa"],
  [/\[CLIENT NAME\]/g, "nome"],
  [/\[COMPANY NAME\]/g, "empresa"],
  [/\{\{NOME\}\}/g, "nome"],
  [/\{\{PRIMEIRO_NOME\}\}/g, "primeiro"],
  [/\{\{EMPRESA\}\}/g, "empresa"],
  [/\{\{CIDADE\}\}/g, "cidade"],
  [/\{\{NICHO\}\}/g, "nicho"],
];

/* Dados do lead que o playbook usa, já limpos. `falta` é o que o card avisa
   antes de o operador gerar: PDF com "Company:" vazio parece defeito, e ele
   só descobre depois de gastar a geração. */
export function dadosDoLead(lead) {
  const l = lead || {};
  const nome = String(l.nome || "").trim();
  const primeiro = nome.split(/\s+/)[0] || "";
  const empresa = String(l.empresa || "").trim();
  const cidade = [l.cidade, l.estado].filter(Boolean).join(", ");
  const falta = [];
  if (!nome) falta.push("nome do lead");
  if (!empresa) falta.push("empresa do lead");
  return { nome, primeiro, empresa, cidade, nicho: String(l.nicho || "").trim(), falta };
}

export function personalizar(texto, lead) {
  if (!texto) return "";
  const d = dadosDoLead(lead);
  let s = String(texto);
  for (const [re, chave] of TROCAS) s = s.replace(re, d[chave] || "");
  return s;
}

/* ═════════════ PROMPT 1: o PDF de follow-up ═════════════
   Texto do usuário, literal. Ver o aviso no topo do arquivo. */
export const PROMPT_PDF_FOLLOWUP = `CREATE A COMPLETE, FINISHED PDF FILE — NOT JUST AN IMAGE PREVIEW.

I need you to design and generate a premium personalized follow-up card to send to a client through WhatsApp.

The final deliverable MUST be an actual downloadable PDF file (.pdf), consisting of exactly ONE PAGE in A4 portrait format.

--------------------------------------------------
CLIENT INFORMATION
--------------------------------------------------

Client name:
[NOME_DO_CLIENTE]

Client company:
[EMPRESA_DO_CLIENTE]

IMPORTANT:
Replace the placeholders above with exactly the information provided.
Do not invent, abbreviate, translate, or modify the client's name or company name.

--------------------------------------------------
PURPOSE
--------------------------------------------------

This document is a commercial/sales FOLLOW-UP communication.

Its purpose is simply to catch the client's attention and communicate that we are waiting for their response.

This is NOT:
- a payment receipt
- a transaction confirmation
- a bank statement
- an invoice
- a payment request
- proof of payment
- proof of transfer
- a financial transaction document

Nothing in the design may falsely indicate that money was sent, received, requested, deposited, charged, transferred, or processed.

--------------------------------------------------
VISUAL CONCEPT
--------------------------------------------------

Create a highly polished, premium fintech-inspired visual.

Use the visual language and overall aesthetic associated with modern U.S. peer-to-peer payment applications, with a strong Zelle-inspired visual feeling:

- vibrant purple
- violet
- subtle purple gradients
- white content card
- minimalist banking-app aesthetic
- sophisticated U.S. fintech interface
- modern digital-payment visual language
- clean typography
- premium UI design
- soft shadows
- rounded corners
- generous spacing
- elegant information hierarchy

IMPORTANT BRANDING RULE:

The design may be visually inspired by the recognizable purple fintech aesthetic associated with Zelle, but DO NOT reproduce an official Zelle payment receipt, official transaction screen, official banking document, or deceptive payment confirmation.

Do not create something that could reasonably be mistaken for evidence of a real financial transaction.

Prefer an UNBRANDED fintech-inspired design.

Do not use an official Zelle logo unless clearly allowed by the platform and appropriate for a purely referential design. If there is any uncertainty, omit the logo completely.

The effectiveness of the design should come from the purple fintech aesthetic and interface language — NOT from pretending a transaction occurred.

--------------------------------------------------
PAGE FORMAT
--------------------------------------------------

The final document must be:

- Actual PDF file (.pdf)
- ONE page only
- A4 portrait
- 210 × 297 mm
- portrait orientation
- high resolution
- sharp text
- professional-quality rendering
- optimized for viewing on smartphones
- suitable for sending through WhatsApp
- balanced margins
- no printer crop marks
- no bleed marks
- no unnecessary white border around the page
- no extra pages
- no explanation page
- no cover page

The main design should fill the A4 page appropriately.

--------------------------------------------------
BACKGROUND
--------------------------------------------------

Use a premium purple background.

Suggested characteristics:

- vibrant fintech purple
- violet gradient
- subtle depth
- elegant abstract curved shapes
- very subtle light effects
- sophisticated rather than playful
- visually striking when the PDF thumbnail appears inside WhatsApp

Avoid excessive decoration.

The design needs to catch attention immediately while still looking professional.

--------------------------------------------------
MAIN CARD
--------------------------------------------------

Place one large WHITE CARD in the center of the page.

The card should have:

- rounded corners
- subtle soft shadow
- premium digital-interface appearance
- generous internal spacing
- excellent visual hierarchy
- strong contrast against the purple background

It should resemble the polished interface language of a high-end fintech application.

Do not make it look like a paper bank receipt.

--------------------------------------------------
TOP LABEL
--------------------------------------------------

At the top of the white card, create a clearly visible rounded badge or pill.

Use this EXACT text:

FOLLOW-UP — NOT A PAYMENT

Do not translate it.

Do not remove it.

Do not make it tiny.

Do not hide it.

Do not lower its opacity until it becomes difficult to read.

Do not place it in a visually insignificant location.

It must clearly communicate that this is NOT a payment.

Recommended styling:

- very light lavender background
- dark or vibrant purple text
- modern sans-serif font
- medium-bold or semibold
- small attention/information icon if appropriate

--------------------------------------------------
CLIENT PERSONALIZATION AREA
--------------------------------------------------

Immediately below the FOLLOW-UP label, create a clean personalized information area.

Display:

Client:
[NOME_DO_CLIENTE]

Company:
[EMPRESA_DO_CLIENTE]

Use the exact client name and company provided at the beginning of this prompt.

Recommended visual treatment:

Client: [NOME_DO_CLIENTE]

Company: [EMPRESA_DO_CLIENTE]

The words "Client:" and "Company:" may use a slightly lighter or smaller font.

The actual client name and company should have greater visual emphasis.

You may use:

- subtle rounded information rows
- a small person icon next to Client
- a small building/company icon next to Company

Keep these elements elegant and minimalist.

DO NOT make these fields resemble:

- sender banking information
- recipient banking information
- payment beneficiaries
- bank account fields

They are simply identification fields for the follow-up communication.

--------------------------------------------------
CENTRAL VISUAL ELEMENT
--------------------------------------------------

Below the client information, place a premium communication-oriented icon.

Preferred concept:

- message/chat bubble
- three-dot conversation indicator
- notification symbol
- subtle attention rays

Use purple/violet styling.

The icon may have:

- slight 3D depth
- subtle gradients
- soft shadow
- modern mobile-interface appearance

The icon must communicate:

"conversation / response / message"

NOT:

"money / transfer / payment completed"

--------------------------------------------------
MAIN MESSAGE
--------------------------------------------------

Place the following message prominently in the center of the white card.

EXACT TEXT:

AGUARDANDO SUA RESPOSTA

This should be the strongest textual element on the page.

Recommended:

- uppercase
- bold
- large
- centered
- dark purple or near-black purple
- maximum readability

It may appear on two lines:

AGUARDANDO
SUA RESPOSTA

Do not alter the Portuguese wording.

--------------------------------------------------
ENGLISH MESSAGE
--------------------------------------------------

Immediately underneath, display:

WAITING FOR YOUR REPLY

Use:

- smaller font than the Portuguese headline
- uppercase
- centered
- medium purple or muted violet
- slightly increased letter spacing if visually appropriate

Do not change this phrase.

--------------------------------------------------
SECONDARY MESSAGE
--------------------------------------------------

Below the English line, add a subtle divider.

Then display:

Just following up regarding our conversation.

Use:

- small clean typography
- neutral gray or muted purple
- centered
- understated visual treatment

This sentence must remain secondary to the main message.

--------------------------------------------------
VISUAL HIERARCHY
--------------------------------------------------

The viewer should perceive the information in approximately this order:

1. FOLLOW-UP — NOT A PAYMENT
2. Client name
3. Company
4. Message/communication icon
5. AGUARDANDO SUA RESPOSTA
6. WAITING FOR YOUR REPLY
7. Just following up regarding our conversation.

The page should feel intentional, premium, simple and uncluttered.

--------------------------------------------------
TYPOGRAPHY
--------------------------------------------------

Use a premium modern sans-serif typeface.

The overall feeling should be similar to contemporary fintech/mobile banking products.

Prioritize:

- readability
- modernity
- clean geometry
- strong hierarchy
- professional appearance

Avoid:

- decorative fonts
- handwritten fonts
- serif fonts
- cartoon typography
- excessively futuristic fonts

--------------------------------------------------
COLOR PALETTE
--------------------------------------------------

Primary:
Bright/vibrant purple

Secondary:
Deep violet / dark purple

Background variations:
Purple gradients

Card:
White

Secondary surfaces:
Very light lavender

Primary text:
Dark purple / near-black

Secondary text:
Muted purple or neutral gray

Do not introduce unrelated dominant colors.

--------------------------------------------------
DO NOT INCLUDE
--------------------------------------------------

Absolutely DO NOT include:

- any dollar amount
- any currency amount
- dollar signs
- payment amounts
- bank balances
- bank names
- account numbers
- routing numbers
- card numbers
- sender banking information
- recipient banking information
- fake bank information
- payment confirmation
- "payment sent"
- "payment received"
- "transfer completed"
- "money sent"
- "money received"
- transaction status
- pending payment status
- transaction ID
- confirmation ID
- confirmation number
- reference number
- fake transaction number
- fake bank receipt
- payment receipt
- fake dates
- fake timestamps
- transfer dates
- QR codes
- payment buttons
- SEND MONEY buttons
- REQUEST MONEY buttons
- confirmation checkmarks suggesting successful transfer
- account balances
- bank statement elements
- anything suggesting that a real financial transaction took place

--------------------------------------------------
DO NOT ADD EXTRA COPY
--------------------------------------------------

Do not invent additional:

- marketing slogans
- motivational phrases
- financial slogans
- fintech taglines
- calls to action
- sales copy
- promotional sentences

Do not place random decorative English phrases in the corners of the page.

Only use the requested copy.

--------------------------------------------------
QUALITY CONTROL
--------------------------------------------------

Before exporting the PDF, carefully verify:

1. Client name is spelled correctly.
2. Company name is spelled correctly.
3. "AGUARDANDO SUA RESPOSTA" is spelled correctly.
4. "WAITING FOR YOUR REPLY" is spelled correctly.
5. "FOLLOW-UP — NOT A PAYMENT" is completely visible.
6. "Just following up regarding our conversation." is correct.
7. No unwanted text was generated.
8. No fake financial information was generated.
9. There are no distorted letters.
10. There are no misspellings.
11. All typography is sharp and readable.
12. Nothing important is cropped.
13. The page is correctly proportioned as A4 portrait.
14. The design remains clearly a follow-up communication.
15. The visual result looks professional when viewed on a smartphone.

If image generation causes typography errors, recreate or programmatically typeset the final layout so all text is rendered correctly before producing the PDF.

TEXT ACCURACY IS MORE IMPORTANT THAN GENERATIVE IMAGE STYLIZATION.

--------------------------------------------------
FINAL FILE CREATION
--------------------------------------------------

After completing the design:

CREATE THE ACTUAL PDF FILE.

Do not stop after generating an image.

If necessary:

1. Generate the visual/background.
2. Create the final A4 page programmatically.
3. Typeset the exact text over the design.
4. Place all elements correctly.
5. Export the completed page as a high-quality PDF.

FINAL PDF SPECIFICATIONS:

- File type: PDF
- Extension: .pdf
- Pages: exactly 1
- Page size: A4
- Dimensions: 210 × 297 mm
- Orientation: portrait
- High-resolution visual assets
- Sharp vector or high-quality rendered typography
- No crop marks
- No printer marks
- No additional white margins
- No additional explanatory pages

--------------------------------------------------
FINAL RESPONSE REQUIREMENT
--------------------------------------------------

Your final response must include the ACTUAL DOWNLOADABLE PDF FILE.

Do NOT only show an image preview.

Do NOT only provide instructions for creating the PDF.

Do NOT merely describe what the PDF would look like.

Do NOT return only PNG, JPG, JPEG or WEBP.

The primary final deliverable must be:

[NOME_DO_CLIENTE] / [EMPRESA_DO_CLIENTE] — Follow-Up.pdf

If an image preview is also created, it may be provided as an OPTIONAL secondary file.

But the required primary deliverable is the downloadable .PDF file.`;

/* ═════════════ PROMPT 2: o céu com o nome nas nuvens ═════════════
   Texto do usuário, literal. Ver o aviso no topo do arquivo. */
export const PROMPT_CEU = `Create a highly polished, visually striking and emotionally engaging image of a beautiful bright blue sky with soft white clouds.

The overall concept should feel elegant, uplifting, memorable, and attention-grabbing, while still remaining professional and tasteful enough to be used as a follow-up message to a client.

MAIN VISUAL IDEA:
The sky should be the main scene: a vivid, clean, bright blue sky with a peaceful and premium atmosphere. The clouds should be soft, fluffy, well-defined, and naturally illuminated by daylight.

IMPORTANT TEXT IN THE CLOUDS:
Write the following two personalized elements using the clouds themselves, as if the letters are formed naturally in the sky:

1. [CLIENT NAME]
2. [COMPANY NAME]

Both names must be clearly readable and beautifully integrated into the cloud formations.

TEXT COMPOSITION:
- The client name and company name should appear as large cloud lettering in the sky
- The lettering should feel magical, elegant, and natural
- The text should not look heavy, artificial, or cartoonish
- The clouds must still look realistic and soft
- The words should be easy to read at first glance

FOLLOW-UP MESSAGE:
Also include a clear follow-up message in the image, communicating that we are waiting for the client's return regarding the conversation with Leon Group - Buit To Lead.

Use this exact message:

"We are waiting for your reply regarding our conversation with Leon Group - Buit To Lead."

You may also make it slightly more elegant in layout, but keep the wording exactly the same.

TEXT PLACEMENT:
- The [CLIENT NAME] and [COMPANY NAME] should be the hero elements, formed in the clouds
- The follow-up sentence should appear below, in a refined and elegant way
- The follow-up sentence should NOT be formed in clouds; instead, it should appear as clean, tasteful overlay text
- Use a sophisticated, readable, modern font for the overlay sentence
- Make sure the overlay text contrasts well with the sky without looking harsh

STYLE AND MOOD:
- premium
- inspiring
- clean
- elegant
- airy
- hopeful
- sophisticated
- professional
- visually impressive
- subtle luxury
- warm but not overly sentimental

VISUAL DETAILS:
- rich blue sky
- soft natural sunlight
- realistic white clouds
- subtle atmospheric depth
- balanced composition
- clean negative space
- no clutter
- no extra objects unless they improve elegance
- no birds, airplanes, or distractions unless very subtle and artistic
- no storm clouds
- no dark mood
- no excessive fantasy elements

TYPOGRAPHY REQUIREMENTS:
- [CLIENT NAME] and [COMPANY NAME] must be rendered as cloud text, large and legible
- The overlay follow-up sentence must be sharp, correctly spelled, and easy to read
- All text must be accurate and professional
- Avoid distorted, melted, or unreadable lettering

COMPOSITION:
- Create a harmonious layout with the cloud names placed prominently in the upper and middle portions of the sky
- Position the follow-up line lower in the composition, with elegant spacing
- The overall image should feel balanced and intentional
- The image should instantly capture attention when viewed in WhatsApp

OUTPUT GOAL:
The final result should look like a premium personalized follow-up visual: a serene blue-sky scene, with the client's name and company name written in the clouds, and a refined message below stating that we are waiting for their reply regarding the conversation with Leon Group - Buit To Lead.

QUALITY CONTROL:
Before finalizing, ensure:
- [CLIENT NAME] is spelled correctly
- [COMPANY NAME] is spelled correctly
- "We are waiting for your reply regarding our conversation with Leon Group - Buit To Lead." is spelled correctly
- the cloud lettering is clearly legible
- the scene looks beautiful, premium, and professional
- the text is not distorted or hard to read

Aspect ratio: vertical, suitable for sharing on WhatsApp.`;

/* ═════════════ O CATÁLOGO ═════════════
   A lista e o playbook moram no MESMO arquivo de propósito. Antes a lista
   estava em index.js e não havia playbook nenhum; com dois arquivos, um dia
   entra ativação na lista sem conteúdo e o operador clica num botão que não
   ensina nada.

   `grupo` só organiza a tela. `cota` não fica aqui: ela é por COLUNA do
   pipeline (ATIV_DIA em index.js), não por tipo de ativação.

   ⚠ "Comprovante de Zelle falso" SAIU deste catálogo. Era engodo declarado.
   No lugar entrou "PDF de follow-up", com o prompt do próprio usuário, que
   usa a mesma estética de fintech para chamar atenção mas carrega crachá
   obrigatório dizendo que NÃO é pagamento e proíbe por escrito valor, número
   de transação e confirmação. Mesmo efeito de atenção, sem fingir transação. */
export const CATALOGO = [
  ["ligacao", "Ligação", "contato"],
  ["mensagem", "Mensagem de texto", "contato"],
  ["audio", "Áudio", "contato"],
  ["audio_unico", "Áudio de visualização única", "efemero"],
  ["foto_unica", "Foto de visualização única", "efemero"],
  ["video_unico", "Vídeo de visualização única", "efemero"],
  ["figurinha", "Figurinha", "leve"],
  ["emoji", "Emoji", "leve"],
  ["status_mencao", "Menção em status", "leve"],
  ["pdf_followup", "PDF de follow-up", "peca"],
];

export const GRUPOS = {
  contato: "Contato direto",
  efemero: "Visualização única",
  leve: "Toque leve",
  peca: "Peça pronta",
};

/* Os dois prompts do usuário, disponíveis nas ativações que os usam. Um tipo
   pode ter zero, um ou dois: `prompts` é lista. `saida` diz o que se espera do
   gerador, porque colar um prompt de PDF num gerador de imagem devolve PNG e
   o operador só descobre depois. */
const PROMPTS = {
  pdf: {
    id: "pdf",
    titulo: "PDF de follow-up (estética fintech)",
    saida: "PDF, 1 página, A4 retrato",
    onde: "ChatGPT ou Claude com geração de arquivo. Precisa devolver .pdf, não imagem.",
    texto: PROMPT_PDF_FOLLOWUP,
  },
  ceu: {
    id: "ceu",
    titulo: "Nome nas nuvens (céu azul)",
    saida: "Imagem vertical, para WhatsApp",
    onde: "Qualquer gerador de imagem que acerte texto (gpt-image, Nano Banana).",
    texto: PROMPT_CEU,
  },
};

/* O conteúdo de cada ativação vive em `conteudo-ativacoes.js`: aquilo é texto,
   que muda toda semana conforme ele descobre o que o contractor responde, e
   isto é motor, que quase não muda. Os prompts do usuário são grudados aqui,
   nas ativações que os usam, para o conteúdo não precisar carregar 17 KB. */
export const PLAYBOOKS = {};
for (const k in CONTEUDO) PLAYBOOKS[k] = { ...CONTEUDO[k], prompts: [] };
if (PLAYBOOKS.pdf_followup) PLAYBOOKS.pdf_followup.prompts = [PROMPTS.pdf];
if (PLAYBOOKS.foto_unica) PLAYBOOKS.foto_unica.prompts = [PROMPTS.ceu];
if (PLAYBOOKS.status_mencao) PLAYBOOKS.status_mencao.prompts = [PROMPTS.ceu];

const ROTULO = Object.fromEntries(CATALOGO.map(([t, r]) => [t, r]));

/* Playbook de um tipo, com TUDO já personalizado. Um objeto só, para a tela
   não ter que montar nada nem repetir a substituição de placeholder. */
export function playbookDe(tipo, lead) {
  const base = PLAYBOOKS[tipo];
  if (!base) return null;
  const d = dadosDoLead(lead);
  const P = (x) => personalizar(x, lead);
  return {
    tipo,
    rotulo: ROTULO[tipo] || tipo,
    quando_usar: base.quando_usar || "",
    por_que: base.por_que || "",
    texto_pt: P(base.texto_pt),
    texto_en: P(base.texto_en),
    roteiro_audio: P(base.roteiro_audio),
    emojis: base.emojis || [],
    direcao_visual: P(base.direcao_visual),
    nao_fazer: base.nao_fazer || [],
    prompts: (base.prompts || []).map((pr) => ({
      id: pr.id, titulo: pr.titulo, saida: pr.saida, onde: pr.onde,
      texto: P(pr.texto),
    })),
    lead: { nome: d.nome, primeiro: d.primeiro, empresa: d.empresa, cidade: d.cidade },
    // o card avisa ANTES de o operador gastar uma geração num PDF com campo vazio
    falta: d.falta,
  };
}

/* ═════════════ O CHECKLIST ═════════════
   Derivado da tabela `ativacoes`, agrupada por tipo. Não há estado paralelo
   guardando "o que já foi feito": dois lugares divergem, e no dia em que
   divergirem o operador manda a mesma coisa duas vezes ou pula uma.

   `aberto_sem_mandar` é o sinal que interessa: playbook aberto e nunca
   registrado significa ativação que ele olhou e não usou. Três vezes seguidas
   nisso é ativação que não serve para ele, não falta de disciplina. */
export function checklist(porTipo, lead) {
  const temPlaybook = (t) => !!PLAYBOOKS[t];
  return CATALOGO.map(([tipo, rotulo, grupo]) => {
    const a = porTipo[tipo] || {};
    const feitas = Number(a.n || 0);
    const abertoAgora = !!a.aberto;
    // a linha aberta e não fechada conta como "aberto", não como "feito"
    const mandadas = Math.max(0, feitas - (abertoAgora ? 1 : 0));
    return {
      tipo, rotulo, grupo,
      feito: mandadas > 0,
      vezes: mandadas,
      ultima: mandadas > 0 ? a.ultima || null : null,
      respostas: Number(a.respostas || 0),
      aberto_sem_mandar: abertoAgora,
      tem_playbook: temPlaybook(tipo),
    };
  });
}

/* Quanto do catálogo já foi usado com este lead. É o número que o cabeçalho
   da seção mostra, para ele saber de relance se já tentou tudo. */
export function resumoChecklist(lista) {
  const feitos = lista.filter((x) => x.feito).length;
  return {
    feitos, total: lista.length,
    respostas: lista.reduce((n, x) => n + x.respostas, 0),
    esgotou: feitos >= lista.length,
  };
}
