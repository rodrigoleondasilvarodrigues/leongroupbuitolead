/* ═══════════════════════════════════════════════════════════════════
   Conteúdo do site da Leon Group — português e inglês.

   REGRA QUE VALE POR CIMA DE TUDO AQUI (CLAUDE.md, "Integridade"):
   nada neste arquivo pode afirmar cliente, depoimento, avaliação,
   localização, equipe ou resultado que não exista e não seja verificável.
   A Leon Group é nova. O texto vende o MÉTODO e a CLAREZA, nunca um
   histórico inventado. Quando houver caso real, com nome e número
   documentados, ele entra aqui — não antes.

   Para editar o texto do site, é só mexer neste arquivo.
   ═══════════════════════════════════════════════════════════════════ */

/* ───────── O NÚMERO DO WHATSAPP FICA AQUI, E SÓ AQUI ─────────
   Formato internacional, apenas dígitos: país + DDD + número.
   Brasil:  55 + DDD + número   ->  "5531999999999"
   EUA:     1  + área + número  ->  "16170000000"

   ⚠ ENQUANTO ESTIVER "" O BOTÃO AVISA QUE O CANAL NÃO ESTÁ
     CONFIGURADO EM VEZ DE ABRIR UMA CONVERSA COM NÚMERO ERRADO.
     Trocar por um número real antes de publicar.                        */
const WHATSAPP = "";

/* Endpoint opcional do CRM. Preenchido, cada formulário enviado também
   nasce como lead em "Leads novos / Super Hot" no CRM — assim nenhum
   contato se perde se a pessoa desistir antes de mandar a mensagem.
   Vazio = o site funciona igual, só não registra no CRM.                */
const CRM_ENDPOINT = "https://leon-group.leongroup.workers.dev/api/site-lead";

const NICHOS = [
  "Flooring", "Hardwood", "Tile", "Painting", "Remodeling", "Kitchen",
  "Bathroom", "Cabinets", "Carpentry", "Roofing", "Gutters", "HVAC",
  "Framing", "Vinyl", "Laminate", "Staircase", "Epoxy", "Carpet",
];

const T = {
  /* ══════════════════════════ PORTUGUÊS ══════════════════════════ */
  pt: {
    _html: "pt-BR",
    porta_tit: "Escolha seu idioma",
    porta_sub: "Choose your language",

    nav_historia: "História",
    nav_servicos: "Serviços",
    nav_metodo: "Como funciona",
    nav_faq: "Dúvidas",

    cta_curto: "Falar agora",
    cta_curto2: "Falar agora",
    cta_principal: "Falar com a Leon Group",
    cta_principal2: "Falar com a Leon Group",
    cta_secundario: "Ver como funciona",
    flut_texto: "WhatsApp",

    hero_selo: "Para brasileiros na construção nos Estados Unidos",
    /* cada item vira uma linha; ~ marca a parte em laranja */
    hero_h1: ["Você já sabe", "executar a obra.", "~Falta o cliente te achar.~"],
    hero_sub: "Presença, aquisição e processo comercial para brasileiros que têm empresa de construção e home services nos Estados Unidos. Sem depender de tráfego pago e sem precisar de license.",
    hero_micro: "Uma ligação curta. Se não fizer sentido pra você, a gente diz na hora.",

    num_1: "dias úteis para sua presença estar no ar",
    num_2: "avaliações no Google como meta do trimestre",
    num_3: "nichos de construção atendidos",

    rot_problema: "O problema",
    prob_titulo: "Indicação é boa. Mas indicação não é canal de venda.",
    prob_texto: "Você fatura bem. Tem A-Number, tem equipe, entrega serviço bom e o cliente volta a te chamar. O que você não tem é previsão: quando a obra acaba, a busca por cliente novo começa do zero outra vez.",
    dores: [
      ["Cliente novo só chega por indicação",
       "Sem fila, sem previsão, sem controle. O mês bom depende de quem lembrou de você."],
      ["Tráfego pago assusta, e com razão",
       "Investir milhares de dólares por semana em Meta e Google sem processo comercial montado é queimar dinheiro."],
      ["O anúncio que mais converte pede license",
       "O Google Local Service Ads exige licença que a maior parte dos contractors brasileiros não tem. Fica de fora do canal mais direto."],
      ["Quem pesquisa sua empresa não acha nada",
       "O cliente americano procura o nome antes de ligar. Se não achar site, Google Business Profile e avaliação, ele escolhe outro."],
    ],

    rot_historia: "A Leon Group",
    hist: [
      "A Leon Group nasceu de uma conta que não fecha: brasileiro na construção civil nos Estados Unidos fatura bem, executa bem, tem cliente satisfeito — e ainda assim não sabe de onde vem o trabalho do mês que vem.",
      "Quem administra a obra e quem executa a obra vivem do mesmo lugar: indicação. Nenhum dos dois tem canal de venda próprio. Não é falta de competência técnica, é falta de estrutura comercial — e estrutura comercial é uma coisa que se constrói.",
      "É essa a brecha que a Leon Group ocupa. Não vendemos visibilidade solta nem post bonito. Construímos as três coisas que fazem cliente novo chegar sem depender de indicação: ~presença que passa confiança~, ~aquisição que traz gente pedindo orçamento~ e ~processo comercial que não deixa lead esfriar~.",
      "Somos uma agência nova, e preferimos dizer isso do que inventar história. Você não vai encontrar aqui depoimento encenado, número que não dá pra conferir nem foto de obra que não é nossa. Quando existir caso real, com nome e resultado documentado, ele vai estar nesta página — e não antes.",
    ],
    assin_nome: "Leon Group",
    assin_papel: "Built to Lead.",

    rot_servicos: "Serviços",
    serv_titulo: "O que a gente constrói pra você",
    serv_sub: "Não é um item de cada vez: é o conjunto que faz o cliente achar, confiar e chamar. Metodologia LeadsEveryDay.",
    servicos: [
      ["marca", "Marca e presença",
       "Identidade, logo e perfil no padrão de empresa americana consolidada. O primeiro filtro do cliente é o que ele vê antes de falar com você.",
       "Base"],
      ["gbp", "Google Business Profile",
       "Perfil criado e otimizado do jeito certo: categoria, área de atendimento, serviços, fotos e informação completa. É o que aparece quando alguém busca sua obra na sua cidade.",
       "Busca local"],
      ["site", "Site em inglês que converte",
       "Página própria feita para o cliente americano decidir: serviço claro, região atendida, obra mostrada e um caminho direto para pedir orçamento.",
       "Conversão"],
      ["review", "Estratégia de avaliação",
       "Roteiro, momento e acompanhamento para pedir avaliação de cliente real depois de cada obra entregue. Reputação se constrói com cliente que existe.",
       "Reputação"],
      ["insta", "Conteúdo e Instagram",
       "Doze publicações e quatro destaques com linha editorial definida — feitos para o dono de casa entender o que você faz e por que confiar.",
       "Autoridade"],
      ["aquisicao", "Aquisição e processo comercial",
       "Campanha, atendimento no WhatsApp, qualificação e CRM com régua de follow-up. Lead que chega e não é trabalhado é dinheiro jogado fora.",
       "Motor"],
    ],

    rot_metodo: "Como funciona",
    met_titulo: "Cinco etapas, sem mistério",
    met_sub: "A ordem importa: presença antes de anúncio, anúncio antes de escala. Pular etapa é o jeito mais rápido de gastar sem retorno.",
    passos: [
      ["Diagnóstico", "Ligação curta pra entender o que você faz, onde atende, como o cliente chega hoje e o que dá pra melhorar primeiro. Se não fizer sentido, a gente fala na hora.", ""],
      ["Marca e presença", "Identidade, perfil e Google Business Profile no ar. É a base: sem isso, todo dólar de anúncio vaza.", "5 dias úteis"],
      ["Site e conteúdo", "Página em inglês publicada, doze posts e quatro destaques prontos, com a sua obra e a sua região.", "Mesma janela"],
      ["Aquisição", "Campanha no ar, lead cai direto no WhatsApp. A regra é ligar em menos de um minuto — velocidade fecha mais que argumento.", "Contínuo"],
      ["Processo comercial", "CRM com régua de temperatura e follow-up. Nenhum lead sai do funil sem dizer explicitamente que não quer.", "Contínuo"],
    ],

    rot_nao: "Transparência",
    nao_titulo: "O que a gente não faz",
    naos: [
      "Não inventamos depoimento nem avaliação de cliente que não existe",
      "Não prometemos faturamento nem posição no Google — ninguém pode",
      "Não usamos foto de obra que não é sua",
      "Não vendemos por mensagem: a conversa que decide é por ligação",
      "Não atendemos house cleaning, carpet cleaning ou window tint",
      "Não pressionamos: você tem tempo pra decidir",
    ],

    rot_faq: "Dúvidas",
    faq_titulo: "O que perguntam antes de começar",
    faq: [
      ["Preciso investir em tráfego pago?",
       "Não é obrigatório, e é justamente esse o ponto. A base do trabalho — marca, Google Business Profile, site, avaliação e conteúdo — traz cliente pela busca local e pela sua presença, sem você colocar dinheiro em anúncio. Quando fizer sentido acelerar com campanha, a gente monta junto e você decide."],
      ["Preciso de license?",
       "Não para o que a gente constrói. O Google Local Service Ads exige licença, e é exatamente por isso que ele fica de fora do caminho principal. Presença, busca local e conteúdo funcionam sem license."],
      ["Em quanto tempo eu vejo resultado?",
       "Sua presença fica no ar em até cinco dias úteis depois do formulário preenchido — isso é prazo, não estimativa. Já quando entra o primeiro cliente novo, honestamente, depende da sua região, do seu nicho e da concorrência. Quem te promete data pra isso está adivinhando."],
      ["Com quais serviços vocês trabalham?",
       "Flooring (hardwood, tile, vinyl, laminate, carpet, escada, epóxi), painting, remodeling, cabinets, carpentry, roofing, gutters, HVAC e framing. Ficamos fora de house cleaning, carpet cleaning e window tint: o ticket não cobre o custo de aquisição, e a gente prefere dizer isso do que aceitar e não entregar."],
      ["Quanto custa?",
       "O preço sai depois do diagnóstico, porque depende do que você já tem e do que precisa ser construído. Não tem pacote fechado na prateleira e não tem cobrança escondida. Você recebe escopo, prazo e valor por escrito antes de decidir qualquer coisa."],
      ["Vocês garantem resultado?",
       "Garantimos método, execução e transparência: você sabe o que está sendo feito, quando e por quê. Faturamento e posição no Google não dependem só de nós — dependem do mercado, da sua região e da sua operação. Quem garante número está vendendo, não trabalhando."],
      ["Eu não falo inglês. É problema?",
       "Nenhum. O atendimento com você é todo em português. O material que vai pro seu cliente — site, perfil, conteúdo, anúncio — é feito em inglês, no padrão que o cliente americano espera ler."],
      ["Vocês estão nos Estados Unidos?",
       "A operação é remota e o atendimento é em português. Preferimos deixar isso claro em vez de fingir endereço americano: o que importa é o material que chega ao seu cliente estar no padrão de lá, e é assim que a gente faz."],
    ],

    fim_titulo: "Vamos ver se faz sentido",
    fim_sub: "Uma ligação curta, sem apresentação de vendas. Você conta como está hoje, a gente diz o que dá pra fazer — e se não for pra você, falamos na hora.",

    pe_frase: "Presença, aquisição e processo comercial para construção e home services nos Estados Unidos.",
    pe_contato: "Contato",
    pe_atende: "Atendemos",
    pe_regiao: "Prioridade em Massachusetts e Boston · Estados Unidos",
    pe_nota: "Agência nova. Nenhum caso publicado ainda — quando houver, com nome e número, estará aqui.",

    /* ── formulário ── */
    form_titulo: "Antes de abrir o WhatsApp",
    form_intro: "Cinco campos rápidos. A gente já chega na conversa sabendo do que se trata, e você não repete nada.",
    f_nome: "Seu nome",
    f_empresa: "Nome da empresa",
    f_tel: "Seu WhatsApp",
    f_servico: "Qual serviço você faz",
    f_cidade: "Cidade e estado",
    f_papel: "Você é",
    f_hoje: "Como o cliente chega hoje",
    f_obrig: "Preencha este campo",
    f_enviar: "Abrir o WhatsApp",
    f_nota: "Abre a conversa com a mensagem já escrita. Você lê antes de enviar.",
    previa_rot: "O que vai no WhatsApp",

    opt_servico: ["Flooring", "Painting", "Remodeling", "Cabinets", "Carpentry",
                  "Roofing", "Gutters", "HVAC", "Framing", "Outro"],
    opt_papel: ["Dono da empresa (contractor)", "Trabalho como subcontractor", "Sócio", "Outro"],
    opt_hoje: ["Só por indicação", "Indicação e redes sociais", "Já invisto em anúncio",
               "Não tenho processo nenhum", "Estou começando agora"],
    opt_placeholder: "Selecione",

    /* mensagem que sai no WhatsApp */
    wa: (d) =>
`Olá! Vim pelo site da Leon Group${d.origem ? ` (encontrei em: ${d.origem})` : ""}.

Sou ${d.nome}, da ${d.empresa}.
• Serviço: ${d.servico}
• Onde atendo: ${d.cidade}
• Sou: ${d.papel}
• Cliente hoje chega por: ${d.hoje}

Quero saber mais sobre o que a Leon Group pode fazer pela minha empresa.`,

    sem_numero: "O WhatsApp ainda não está configurado neste site. Fale com a gente por e-mail: leongroup.builtolead@gmail.com",
  },

  /* ══════════════════════════ ENGLISH ══════════════════════════ */
  en: {
    _html: "en",
    porta_tit: "Choose your language",
    porta_sub: "Escolha seu idioma",

    nav_historia: "Story",
    nav_servicos: "Services",
    nav_metodo: "How it works",
    nav_faq: "FAQ",

    cta_curto: "Talk to us",
    cta_curto2: "Talk to us",
    cta_principal: "Talk to Leon Group",
    cta_principal2: "Talk to Leon Group",
    cta_secundario: "See how it works",
    flut_texto: "WhatsApp",

    hero_selo: "For Brazilian construction owners in the United States",
    hero_h1: ["You already know", "how to do the work.", "~Now let the customer find you.~"],
    hero_sub: "Presence, lead generation and a sales process for Brazilians running construction and home services companies in the United States. No paid ads required, no license needed.",
    hero_micro: "One short call. If it isn't a fit for you, we'll say so right there.",

    num_1: "business days to put your presence online",
    num_2: "Google reviews as the quarterly target",
    num_3: "construction trades served",

    rot_problema: "The problem",
    prob_titulo: "Referrals are good. But a referral is not a sales channel.",
    prob_texto: "You bill well. You have an A-Number, a crew, you deliver good work and customers call you back. What you don't have is predictability: when the job ends, the search for the next customer starts from zero all over again.",
    dores: [
      ["New customers only come from referrals",
       "No queue, no forecast, no control. A good month depends on who happened to remember you."],
      ["Paid traffic is scary, and rightly so",
       "Spending thousands of dollars a week on Meta and Google with no sales process in place is burning money."],
      ["The ad that converts best requires a license",
       "Google Local Service Ads requires a license most Brazilian contractors don't have. That closes off the most direct channel."],
      ["Anyone who searches your company finds nothing",
       "American customers look up the name before they call. No website, no Google Business Profile, no reviews — they pick someone else."],
    ],

    rot_historia: "Leon Group",
    hist: [
      "Leon Group started from a number that doesn't add up: Brazilians in construction in the United States bill well, do good work, keep customers happy — and still have no idea where next month's job is coming from.",
      "The one who runs the job and the one who does the job both live off the same thing: referrals. Neither has a sales channel of their own. It isn't a lack of skill, it's a lack of commercial structure — and commercial structure is something you build.",
      "That's the gap Leon Group fills. We don't sell vague visibility or pretty posts. We build the three things that bring new customers without depending on referrals: ~presence that earns trust~, ~acquisition that brings people asking for estimates~ and ~a sales process that doesn't let leads go cold~.",
      "We're a new agency, and we'd rather say that than invent a history. You won't find staged testimonials here, numbers you can't verify, or photos of work that isn't ours. When there's a real case, with a name and documented results, it will be on this page — and not before.",
    ],
    assin_nome: "Leon Group",
    assin_papel: "Built to Lead.",

    rot_servicos: "Services",
    serv_titulo: "What we build for you",
    serv_sub: "It isn't one piece at a time: it's the whole set that makes a customer find you, trust you and call. LeadsEveryDay methodology.",
    servicos: [
      ["marca", "Brand and presence",
       "Identity, logo and profile at the standard of an established American company. The customer's first filter is what they see before they ever talk to you.",
       "Foundation"],
      ["gbp", "Google Business Profile",
       "Profile created and optimized properly: category, service area, services, photos and complete information. It's what shows up when someone searches for your trade in your city.",
       "Local search"],
      ["site", "A website in English that converts",
       "Your own page, built for an American customer to decide: clear service, service area, work on display and a direct path to request an estimate.",
       "Conversion"],
      ["review", "Review strategy",
       "Script, timing and follow-through to ask real customers for a review after every job delivered. Reputation is built with customers who actually exist.",
       "Reputation"],
      ["insta", "Content and Instagram",
       "Twelve posts and four highlights on a defined editorial line — made so homeowners understand what you do and why they should trust you.",
       "Authority"],
      ["aquisicao", "Acquisition and sales process",
       "Campaign, WhatsApp handling, qualification and a CRM with a follow-up cadence. A lead that arrives and isn't worked is money thrown away.",
       "Engine"],
    ],

    rot_metodo: "How it works",
    met_titulo: "Five steps, no mystery",
    met_sub: "Order matters: presence before ads, ads before scale. Skipping a step is the fastest way to spend with nothing to show.",
    passos: [
      ["Diagnosis", "A short call to understand what you do, where you work, how customers reach you today and what's worth fixing first. If it isn't a fit, we say so right there.", ""],
      ["Brand and presence", "Identity, profile and Google Business Profile live. This is the foundation: without it, every ad dollar leaks.", "5 business days"],
      ["Website and content", "Your English page published, twelve posts and four highlights ready, with your work and your area.", "Same window"],
      ["Acquisition", "Campaign live, leads land straight in WhatsApp. The rule is to call in under a minute — speed closes more than argument.", "Ongoing"],
      ["Sales process", "A CRM with temperature tracking and follow-up. No lead leaves the funnel without explicitly saying no.", "Ongoing"],
    ],

    rot_nao: "Transparency",
    nao_titulo: "What we don't do",
    naos: [
      "We don't invent testimonials or reviews from customers who don't exist",
      "We don't promise revenue or Google rankings — nobody can",
      "We don't use photos of work that isn't yours",
      "We don't sell over text: the conversation that decides happens on a call",
      "We don't serve house cleaning, carpet cleaning or window tint",
      "We don't pressure you: you get time to decide",
    ],

    rot_faq: "FAQ",
    faq_titulo: "What people ask before starting",
    faq: [
      ["Do I need to spend on paid ads?",
       "Not required, and that's exactly the point. The foundation — brand, Google Business Profile, website, reviews and content — brings customers through local search and your own presence, without you putting money into ads. When it makes sense to accelerate with a campaign, we build it together and you decide."],
      ["Do I need a license?",
       "Not for what we build. Google Local Service Ads requires one, which is precisely why it isn't the main path here. Presence, local search and content work without a license."],
      ["How long until I see results?",
       "Your presence is live within five business days of the form being filled in — that's a deadline, not an estimate. When the first new customer comes in, honestly, depends on your area, your trade and your competition. Anyone giving you a date for that is guessing."],
      ["Which trades do you work with?",
       "Flooring (hardwood, tile, vinyl, laminate, carpet, staircase, epoxy), painting, remodeling, cabinets, carpentry, roofing, gutters, HVAC and framing. We stay out of house cleaning, carpet cleaning and window tint: the ticket doesn't cover the cost of acquisition, and we'd rather say so than take it on and underdeliver."],
      ["How much does it cost?",
       "Pricing comes after the diagnosis, because it depends on what you already have and what needs to be built. No off-the-shelf package and no hidden fees. You get scope, timeline and price in writing before you decide anything."],
      ["Do you guarantee results?",
       "We guarantee method, execution and transparency: you know what's being done, when and why. Revenue and Google rankings don't depend on us alone — they depend on the market, your area and your operation. Anyone guaranteeing a number is selling, not working."],
      ["I don't speak English. Is that a problem?",
       "Not at all. Everything with you is in Portuguese. The material that reaches your customer — website, profile, content, ads — is produced in English, at the standard an American customer expects to read."],
      ["Are you based in the United States?",
       "The operation is remote and we work with you in Portuguese. We'd rather be upfront about that than fake an American address: what matters is that the material reaching your customer meets the standard there, and that's how we build it."],
    ],

    fim_titulo: "Let's see if it's a fit",
    fim_sub: "A short call, no sales deck. You tell us where things stand, we tell you what can be done — and if it isn't for you, we'll say so right there.",

    pe_frase: "Presence, acquisition and sales process for construction and home services in the United States.",
    pe_contato: "Contact",
    pe_atende: "We serve",
    pe_regiao: "Massachusetts and Boston first · United States",
    pe_nota: "New agency. No published case yet — when there is one, with a name and numbers, it will be here.",

    form_titulo: "Before opening WhatsApp",
    form_intro: "Five quick fields. We come into the conversation already knowing what it's about, and you don't repeat yourself.",
    f_nome: "Your name",
    f_empresa: "Company name",
    f_tel: "Your WhatsApp",
    f_servico: "What trade do you work in",
    f_cidade: "City and state",
    f_papel: "You are",
    f_hoje: "How customers reach you today",
    f_obrig: "Please fill this in",
    f_enviar: "Open WhatsApp",
    f_nota: "Opens the chat with the message already written. You read it before sending.",
    previa_rot: "What goes to WhatsApp",

    opt_servico: ["Flooring", "Painting", "Remodeling", "Cabinets", "Carpentry",
                  "Roofing", "Gutters", "HVAC", "Framing", "Other"],
    opt_papel: ["Company owner (contractor)", "I work as a subcontractor", "Partner", "Other"],
    opt_hoje: ["Referrals only", "Referrals and social media", "I already run ads",
               "No process at all", "Just getting started"],
    opt_placeholder: "Select",

    wa: (d) =>
`Hi! I came from the Leon Group website${d.origem ? ` (found it on: ${d.origem})` : ""}.

I'm ${d.nome}, from ${d.empresa}.
• Trade: ${d.servico}
• Where I work: ${d.cidade}
• I am: ${d.papel}
• Customers reach me through: ${d.hoje}

I'd like to know more about what Leon Group can do for my company.`,

    sem_numero: "WhatsApp isn't configured on this site yet. Reach us by email: leongroup.builtolead@gmail.com",
  },
};
