/* ═══════════════════════════════════════════════════════════════════
   Conteúdo do site da Leon Group, em português e inglês.

   REGRA QUE VALE POR CIMA DE TUDO AQUI (CLAUDE.md, "Integridade"):
   nada neste arquivo pode afirmar cliente, depoimento, avaliação,
   localização, equipe ou resultado que não exista e não seja verificável.
   A Leon Group é nova. O texto vende o MÉTODO e a CLAREZA, nunca um
   histórico inventado. Quando houver caso real, com nome e número
   documentados, ele entra aqui, não antes.

   A seção "Funções" descreve FUNÇÕES EXECUTADAS na conta do cliente,
   nunca uma contagem de funcionários. É a formulação verdadeira para
   uma agência enxuta e não vira alegação de equipe inventada.

   REGRA DE ESCRITA: nada de travessão neste arquivo. Use vírgula,
   dois-pontos, ponto ou parêntese. Pedido explícito do usuário.

   Para editar o texto do site, é só mexer neste arquivo.
   ═══════════════════════════════════════════════════════════════════ */

/* ───────── O NÚMERO DO WHATSAPP FICA AQUI, E SÓ AQUI ─────────
   Formato internacional, apenas dígitos: país + DDD + número.
   Brasil:  55 + DDD + número   ->  "5531999999999"
   EUA:     1  + área + número  ->  "16170000000"

   ⚠ PROVISÓRIO: número brasileiro (61, Brasília), em uso até o número
     americano legítimo existir. Quando trocar, mude SÓ esta linha e
     republique. Nenhum outro arquivo referencia o número.

   Deixar como "" faz o botão avisar para usar o e-mail, em vez de abrir
   uma conversa com número errado.                                       */
const WHATSAPP = "5561998629189";

/* Endpoint do CRM. Preenchido, cada formulário enviado também nasce como
   lead em "Leads novos / Super Hot" no CRM, e o formulário abandonado no
   meio vira lead parcial (ver PARCIAL_MS abaixo).
   Vazio = o site funciona igual, só não registra no CRM.                */
const CRM_ENDPOINT = "https://leon-group.leongroup.workers.dev/api/site-lead";

/* Quanto tempo sem digitar antes de guardar o preenchimento incompleto.
   Só dispara depois que o WhatsApp estiver preenchido: sem telefone não
   há como chamar de volta, e guardar não serviria pra nada.             */
const PARCIAL_MS = 2500;

const SLOGAN = "Built to Lead.";

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
    nav_funcoes: "O time",
    nav_metodo: "Como funciona",
    nav_faq: "Dúvidas",
    nav_contato: "Falar agora",

    cta_curto: "Falar agora",
    cta_curto2: "Falar agora",
    cta_principal: "Falar com a Leon Group",
    cta_principal2: "Quero o diagnóstico gratuito",
    cta_secundario: "Ver como funciona",
    flut_texto: "WhatsApp",

    hero_selo: "Para brasileiros na construção nos Estados Unidos",
    /* cada item vira uma linha; ~ marca a parte em laranja */
    hero_h1: ["Você já sabe", "executar a obra.", "~Falta o cliente te achar.~"],
    hero_sub: "Presença, aquisição e processo comercial para brasileiros que têm empresa de construção e home services nos Estados Unidos. Sem depender de tráfego pago e sem precisar de license.",
    hero_micro: "Uma ligação curta. Se não fizer sentido pra você, a gente diz na hora.",

    num_1: "dias úteis para sua presença estar no ar",
    num_2: "avaliações no Google como meta do trimestre",
    num_3: "funções trabalhando na sua conta",

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
      "A Leon Group nasceu de uma conta que não fecha: brasileiro na construção civil nos Estados Unidos fatura bem, executa bem, tem cliente satisfeito, e ainda assim não sabe de onde vem o trabalho do mês que vem.",
      "Quem administra a obra e quem executa a obra vivem do mesmo lugar: indicação. Nenhum dos dois tem canal de venda próprio. Não é falta de competência técnica, é falta de estrutura comercial, e estrutura comercial é uma coisa que se constrói.",
      "É essa a brecha que a Leon Group ocupa. Não vendemos visibilidade solta nem post bonito. Construímos as três coisas que fazem cliente novo chegar sem depender de indicação: ~presença que passa confiança~, ~aquisição que traz gente pedindo orçamento~ e ~processo comercial que não deixa lead esfriar~.",
      "Somos uma agência nova, e preferimos dizer isso do que inventar história. O nome carrega o que a gente quer entregar: ~Built to Lead~, construído para liderar. Não pra aparecer, não pra postar bonito, mas pra colocar a sua empresa na frente na sua região.",
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
       "Doze publicações e quatro destaques com linha editorial definida, feitos para o dono de casa entender o que você faz e por que confiar.",
       "Autoridade"],
      ["aquisicao", "Aquisição e processo comercial",
       "Atendimento no WhatsApp, qualificação e CRM com régua de follow-up. Lead que chega e não é trabalhado é dinheiro jogado fora.",
       "Motor"],
      ["ads", "Tráfego pago: Google Ads e Meta Ads",
       "Search no Google Ads e campanha no Meta Ads. Entra por último de propósito: anúncio em cima de presença fraca e sem follow-up é o jeito mais caro de não vender nada.",
       "Última etapa"],
    ],

    /* ─── funções executadas na conta (NÃO é contagem de funcionários) ─── */
    rot_funcoes: "O time por trás",
    func_titulo: "Doze funções trabalhando na sua conta",
    func_sub: "Uma empresa de construção não precisa contratar doze profissionais diferentes. Precisa que essas doze funções sejam executadas com método. É isso que entra no contrato.",
    funcoes: [
      ["Gestor de projeto",
       "Cronograma, prazo e responsável por cada entrega. Você sabe o que está sendo feito e quando fica pronto."],
      ["Head comercial",
       "Desenha o processo de venda: o que perguntar, quando ligar, como conduzir até o fechamento."],
      ["Especialista em Google Meu Negócio",
       "Perfil, categoria, área de atendimento, serviços e fotos. É a peça que decide se você aparece na busca da sua cidade."],
      ["Especialista em SEO",
       "Estrutura do site, palavra-chave, página por serviço e por região. Aparecer sem pagar por clique é o que segura o custo lá embaixo."],
      ["Copywriter",
       "Texto do site, do anúncio, do perfil e da mensagem. Em inglês, no jeito que o cliente americano lê e entende."],
      ["Designer",
       "Marca, identidade, peça de anúncio e material do perfil. O primeiro filtro do cliente é visual, e ele julga em segundos."],
      ["Social media",
       "Linha editorial, calendário e publicação. Perfil parado passa a mesma mensagem que perfil que não existe."],
      ["Editor de vídeo",
       "Corte, legenda e formato vertical a partir da obra que você já filma no celular. Vídeo de obra real converte mais que imagem de banco."],
      ["I.A. e automação",
       "Resposta imediata, qualificação e follow-up sem esquecimento. O que é repetitivo vira máquina e para de depender de memória."],
      ["Head de performance",
       "Lê o número: quanto custa o lead, quantos viram orçamento, quantos viram obra. Sem isso, investir em anúncio é achismo caro."],
      ["Gestor de tráfego pago",
       "Google Ads em search e Meta Ads. Só entra na última etapa, quando presença e processo já estão de pé."],
      ["Suporte integral",
       "Canal direto em português, do primeiro dia ao fim do contrato. Sem fila, sem ticket e sem intermediário."],
    ],
    func_nota: "A Leon Group é enxuta de propósito. Quem executa se apoia em processo, ferramenta e automação para cobrir essas funções sem inchar o custo, e esse custo menor é o que faz o preço fechar pra você. Você contrata resultado, não crachá.",

    rot_metodo: "Como funciona",
    met_titulo: "Seis etapas, sem mistério",
    met_sub: "A ordem importa: presença antes de anúncio, anúncio antes de escala. Pular etapa é o jeito mais rápido de gastar sem retorno.",
    passos: [
      ["Diagnóstico", "Ligação curta pra entender o que você faz, onde atende, como o cliente chega hoje e o que dá pra melhorar primeiro. Se não fizer sentido, a gente fala na hora.", ""],
      ["Marca e presença", "Identidade, perfil e Google Business Profile no ar. É a base: sem isso, todo dólar de anúncio vaza.", "5 dias úteis"],
      ["Site e conteúdo", "Página em inglês publicada, doze posts e quatro destaques prontos, com a sua obra e a sua região.", "Mesma janela"],
      ["Aquisição", "Lead cai direto no WhatsApp. A regra é ligar em menos de um minuto: velocidade fecha mais que argumento.", "Contínuo"],
      ["Processo comercial", "CRM com régua de temperatura e follow-up. Nenhum lead sai do funil sem dizer explicitamente que não quer.", "Contínuo"],
      ["Tráfego pago", "Aí sim: Google Ads em search e Meta Ads. É a última etapa de propósito. Com presença no ar, site convertendo e follow-up rodando, o mesmo dólar de anúncio rende muito mais.", "Última etapa"],
    ],


    /* ══════════════════ PLANOS ══════════════════
       Três planos, e o PRIMEIRO é o alvo. A ancoragem funciona pelo
       enquadramento, não pelo preço: os planos 2 e 3 não são melhores, são
       DEPOIS. Contractor que ainda não aparece no Google não precisa de gestão
       de tráfego, precisa existir primeiro. Assim o plano 1 é a escolha óbvia
       por maturidade, e os outros dois ancoram sem parecer inferiores.

       Os três são entregáveis de verdade. Nenhum plano de vitrine.

       ⚠ O plano 3 vende gestão de tráfego pago. NÃO VENDER antes de ter rodado
       a primeira campanha da própria agência: vender operação de anúncio sem
       nunca ter subido uma é exatamente o tipo de promessa que a regra de
       integridade proíbe. Por isso o preço dele é "a partir de".            */
    rot_planos: "Planos",
    planos_titulo: "Três caminhos, e o primeiro resolve o que dói agora",
    planos_sub: "O mais completo não é o mais indicado. Se o dono de casa ainda não te acha no Google, tráfego pago só faz você pagar mais caro para não ser encontrado. Comece por existir.",
    planos_alvo: "Comece por aqui",
    planos_depois: "Para depois",
    planos_mes: "por mês",
    planos_total: "no total",
    planos_cta: "Quero esse plano",
    planos: [
      ["Presença Local", "2.500", "833", "3 meses",
       "Você existe no Google, tem site que converte e avaliação para mostrar. É o que 9 de 10 contractors precisam primeiro.",
       ["Logo em três versões, se você ainda não tem",
        "Site no ar, com telefone clicável e todas as cidades que você atende",
        "Google Meu Negócio otimizado do zero: categoria, área, serviços, fotos",
        "20 avaliações escritas em inglês, prontas para você publicar",
        "12 posts e 4 destaques do Instagram, com as artes finalizadas",
        "Tudo em 5 dias úteis, com reunião de entrega",
        "3 meses de acompanhamento no WhatsApp"],
       "alvo"],
      ["Presença + Conteúdo", "4.500", "1.500", "3 meses",
       "Para quem já aparece e quer sair na frente. Mantém o perfil vivo mês a mês, que é o que o Google recompensa.",
       ["Tudo do Presença Local",
        "8 posts novos por mês, com as artes",
        "20 avaliações novas a cada trimestre",
        "Publicação semanal no perfil do Google",
        "Uma página por serviço, com o termo que a pessoa digita",
        "Google Search Console configurado e relatório mensal do que trouxe visita"],
       "depois"],
      ["Aquisição", "7.500", "2.500", "3 meses",
       "Para quem já tem presença montada e quer volume. Anúncio apontando para uma casa arrumada, e não para uma obra.",
       ["Tudo do Presença + Conteúdo",
        "Campanha de Google Ads Search montada e gerenciada",
        "Campanha de Meta Ads montada e gerenciada",
        "Acompanhamento semanal de custo por contato",
        "Página de captura própria, separada do site"],
       "depois"],
    ],
    planos_partir: "a partir de",
    planos_nota_verba: "A verba de anúncio do plano Aquisição é investida direto no Google e na Meta, no cartão do próprio cliente. A Leon Group não recebe percentual sobre a verba, e não há taxa escondida.",
    planos_nota_pgto: "Pagamento em até três parcelas. O valor mensal ao lado é só a conta dividida, para você comparar os planos, e não uma mensalidade.",
    planos_nota_nova: "A Leon Group é uma agência nova e ainda não tem caso publicado. Por isso o Presença Local sai por 2.500 em vez de 5.000 para os três primeiros clientes, em troca de permissão para documentar o trabalho. Se você não gostar do resultado, não tem depoimento, e o preço continua o mesmo.",
    planos_duvida: "Não sabe qual serve para você?",
    planos_duvida_cta: "Pede o diagnóstico gratuito",
    planos_duvida_txt: "A gente olha o seu Google, o seu site e as suas avaliações, escreve o que encontrou e te manda. Sem custo, e é seu mesmo que você não contrate nada.",

    /* ══════════════ PERÍODOS, para /planosv2 ══════════════
       O padrão da Kairon: cada plano com três períodos, e quanto mais longo o
       compromisso, menor a mensalidade.

       Guardo o TOTAL e os MESES, e a mensalidade é calculada dividindo. Se eu
       guardasse a mensalidade escrita à mão, um dia ela deixaria de multiplicar
       de volta pro total e a página mostraria uma conta que não fecha, na frente
       do cliente, no meio da call.

       O que cada período ACRESCENTA está escrito, porque o escopo do plano é
       majoritariamente a construção inicial: vender 12 meses sem dizer o que
       acontece do mês 4 ao 12 seria vender ar.                              */
    planos_periodos: [
      // [plano, [ [meses, total, o que os meses extras incluem], ... ] ]
      ["Presença Local", [
        [3, 2500, "A construção completa mais 3 meses de acompanhamento no WhatsApp."],
        [6, 4500, "Mais 3 meses de acompanhamento, e uma rodada nova de 20 avaliações no 4º mês."],
        [12, 8000, "Acompanhamento o ano todo, 20 avaliações novas por trimestre e revisão do perfil a cada 3 meses."],
      ]],
      ["Presença + Conteúdo", [
        [3, 4500, "A construção completa, mais 8 posts por mês e o relatório mensal."],
        [6, 8000, "O mesmo ritmo por 6 meses, com uma página nova de serviço no 4º mês."],
        [12, 14000, "O ano todo, com uma página nova de serviço por trimestre."],
      ]],
      ["Aquisição", [
        [3, 7500, "A construção completa, o conteúdo mensal e as campanhas montadas e gerenciadas."],
        [6, 13500, "Seis meses de gestão, com teste de criativo a cada mês."],
        [12, 24000, "O ano todo de gestão, com escala do que estiver funcionando."],
      ]],
    ],
    v2_titulo: "Escolha o plano e o prazo",
    v2_sub: "O plano define o que você recebe. O prazo define quanto tempo a gente fica junto, e quanto mais longo, menor a mensalidade. O primeiro plano é o que resolve o que dói agora.",
    rot_periodo: ["Trimestral", "Semestral", "Anual"],
    v2_meses: "meses",
    v2_por_mes: "por mês",
    v2_total: "total",
    v2_economia: "economia de",
    v2_inclui: "O que o prazo acrescenta",
    v2_entrega: "O que está incluído no plano",
    v2_melhor: "Melhor custo por mês",

    /* ══════════════ /planosv3, no layout da Kairon ══════════════
       Copiado do layout de kairon-assessoria.vercel.app/planos, medido no CSS
       real dela: `.plans-grid` em 3 colunas a partir de 960px, o premium com
       card escuro e faixa, o do meio com borda de destaque, e uma seção de
       preços POR PLANO com 3 colunas de periodicidade.

       ⚠ ANCORAGEM NO MAIOR, ao contrário de /planos e /planosv2. Aqui o
       Aquisição é o destacado, exatamente como o Kairós é lá.

       v3_destaque: "" | "borda" | "escuro"  (o tratamento visual do card)     */
    /* Do print: o herói é escuro com constelação, o menu é fixo com âncora por
       plano, e o cartão DESTACADO em cada faixa de preço é escolhido a dedo
       (na Kairon: Silver nenhum, Gold o do meio, Kairós o primeiro), não o
       mais barato. v3_featured guarda o índice, ou null. */
    v3_featured: [null, 1, 0],
    v3_nav: ["Planos", "Presença", "Conteúdo", "Aquisição"],
    v3_nav_cta: "Falar com a Leon Group",
    v3_hero_pill: "Escolha o plano ideal para o seu negócio",
    v3_hero_h1: ["Planos", "Leon Group"],
    v3_hero_lead: "Três formas de colocar a metodologia LeadsEveryDay pra rodar no seu negócio: presença, conteúdo e aquisição aplicados com estratégia. Escolha o plano que encaixa no seu momento.",
    v3_hero_bt1: "Conhecer os planos",
    v3_hero_bt2: "Falar com a Leon Group",
    v3_hero_scroll: "Arraste para baixo",
    v3_eyebrow: "Escolha o plano ideal",
    v3_titulo: "Escolha o plano ideal para o seu negócio",
    v3_lead: "Do essencial pra existir no Google até a operação completa de aquisição, com a Leon Group dentro do jogo.",
    v3_ver: "Ver preços",
    v3_eyebrow_precos: "Escolha a periodicidade ideal",
    v3_precos_de: "Planos",
    v3_por_mes: "por mês",
    v3_total: "Valor total:",
    v3_parcelas: "Em até {n}x no cartão",
    v3_nota: "Os valores acima já incluem tudo que está listado no plano. Não há taxa de setup, taxa de plataforma nem comissão sobre resultado.",
    v3_cta_titulo: "Na dúvida entre dois planos?",
    v3_cta_txt: "Chama a gente no WhatsApp. A gente olha o momento do seu negócio e te fala, com sinceridade, qual plano faz sentido. Sem empurrar o mais caro.",
    v3_cta_bt: "Falar no WhatsApp",
    v3_cta_msg: "Olá! Vi os planos da Leon Group e quero ajuda pra escolher o ideal pro meu negócio.",
    v3_faixa: "Indicado para quem quer volume",
    v3_subs: ["", "Perfeito para quem já aparece e quer sair na frente.",
              "Indicado para quem quer volume."],
    v3_destaque: ["", "borda", "escuro"],
    v3_verba: "+ verba de anúncio à parte, paga direto ao Google e à Meta",
    rot_faq: "Dúvidas",
    faq_titulo: "O que perguntam antes de começar",
    faq: [
      ["Preciso investir em tráfego pago?",
       "Não é obrigatório, e é justamente esse o ponto. A base do trabalho (marca, Google Business Profile, site, avaliação e conteúdo) traz cliente pela busca local e pela sua presença, sem você colocar dinheiro em anúncio. Google Ads e Meta Ads entram na última etapa, quando já existe estrutura pra sustentar o investimento, e você decide se quer."],
      ["Preciso de license?",
       "Não para o que a gente constrói. O Google Local Service Ads exige licença, e é exatamente por isso que ele fica de fora do caminho principal. Presença, busca local e conteúdo funcionam sem license."],
      ["Em quanto tempo eu vejo resultado?",
       "Sua presença fica no ar em até cinco dias úteis depois do formulário preenchido, e isso é prazo, não estimativa. Já quando entra o primeiro cliente novo, honestamente, depende da sua região, do seu nicho e da concorrência. Quem te promete data pra isso está adivinhando."],
      ["Com quais serviços vocês trabalham?",
       "Flooring (hardwood, tile, vinyl, laminate, carpet, escada, epóxi), painting, remodeling, cabinets, carpentry, roofing, gutters, HVAC e framing. Ficamos fora de house cleaning, carpet cleaning e window tint: o ticket não cobre o custo de aquisição, e a gente prefere dizer isso do que aceitar e não entregar."],
      ["Quanto custa?",
       "O preço sai depois do diagnóstico, porque depende do que você já tem e do que precisa ser construído. Não tem pacote fechado na prateleira e não tem cobrança escondida. Você recebe escopo, prazo e valor por escrito antes de decidir qualquer coisa."],
      ["Vocês garantem resultado?",
       "Garantimos método, execução e transparência: você sabe o que está sendo feito, quando e por quê. Faturamento e posição no Google não dependem só de nós, dependem do mercado, da sua região e da sua operação. Quem garante número está vendendo, não trabalhando."],
      ["Eu não falo inglês. É problema?",
       "Nenhum. O atendimento com você é todo em português. O material que vai pro seu cliente (site, perfil, conteúdo, anúncio) é feito em inglês, no padrão que o cliente americano espera ler."],
      ["Vocês estão nos Estados Unidos?",
       "A operação é remota e o atendimento é em português. Preferimos deixar isso claro em vez de fingir endereço americano: o que importa é o material que chega ao seu cliente estar no padrão de lá, e é assim que a gente faz."],
    ],

    /* ─── seção final: formulário na página, com incentivo real ─── */
    rot_contato: "Falar com a gente",
    ct_titulo: "Comece pelo diagnóstico gratuito",
    ct_sub: "A gente olha o seu Google Business Profile, o seu site e as suas avaliações e devolve por escrito o que está travando cliente novo de chegar. Sem custo e sem compromisso. Se depois disso você quiser tocar sozinho, o material é seu do mesmo jeito.",
    ct_pontos: [
      ["Diagnóstico por escrito, sem custo",
       "O que está faltando na sua presença, em ordem de prioridade, com o que dá pra corrigir sozinho."],
      ["Ligação curta, sem apresentação de venda",
       "Você conta como está hoje. Se não for pra você, a gente fala na hora e ninguém perde tempo."],
      ["Escopo, prazo e preço por escrito",
       "Antes de você decidir qualquer coisa. Sem cobrança escondida e sem pressão."],
      ["Poucas contas ao mesmo tempo",
       "A agência é enxuta de propósito, então o diagnóstico segue por ordem de chegada."],
    ],
    ct_form_tit: "Preencha aqui",
    ct_form_sub: "Leva menos de um minuto. No final, abre o WhatsApp com a mensagem já escrita e você lê antes de enviar.",

    /* ── formulário ── */
    form_titulo: "Antes de abrir o WhatsApp",
    form_intro: "Sete campos rápidos. A gente já chega na conversa sabendo do que se trata, e você não repete nada.",
    f_nome: "Seu nome",
    f_empresa: "Nome da empresa",
    f_tel: "Seu WhatsApp",
    f_tel_dica: "Começa por aqui. Se você parar no meio do formulário, a gente guarda o que já foi preenchido e chama no WhatsApp. Nada de lista e nada de spam.",
    f_servico: "Qual serviço você faz",
    f_cidade: "Cidade e estado",
    f_papel: "Você é",
    f_hoje: "Como o cliente chega hoje",
    f_obrig: "Preencha este campo",
    f_enviar: "Abrir o WhatsApp",
    f_nota: "Abre a conversa com a mensagem já escrita. Você lê antes de enviar.",
    previa_rot: "O que vai no WhatsApp",
    f_vazio: "(não informado)",
    f_salvo: "Contato guardado. Se você sair agora, a gente chama no WhatsApp.",

    opt_servico: ["Flooring", "Painting", "Remodeling", "Cabinets", "Carpentry",
                  "Roofing", "Gutters", "HVAC", "Framing", "Outro"],
    opt_papel: ["Dono da empresa (contractor)", "Trabalho como subcontractor", "Sócio", "Outro"],
    opt_hoje: ["Só por indicação", "Indicação e redes sociais", "Já invisto em anúncio",
               "Não tenho processo nenhum", "Estou começando agora"],
    opt_placeholder: "Selecione",

    fim_titulo: "Vamos ver se faz sentido",
    fim_sub: "Uma ligação curta, sem apresentação de vendas. Você conta como está hoje, a gente diz o que dá pra fazer, e se não for pra você, falamos na hora.",

    pe_frase: "Presença, aquisição e processo comercial para construção e home services nos Estados Unidos.",
    pe_contato: "Contato",
    pe_atende: "Atendemos",
    pe_regiao: "Prioridade em Massachusetts e Boston · Estados Unidos",
    pe_nota: "Agência nova. Nenhum caso publicado ainda. Quando houver, com nome e número, estará aqui.",

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
    nav_funcoes: "The team",
    nav_metodo: "How it works",
    nav_faq: "FAQ",
    nav_contato: "Talk to us",

    cta_curto: "Talk to us",
    cta_curto2: "Talk to us",
    cta_principal: "Talk to Leon Group",
    cta_principal2: "Get the free assessment",
    cta_secundario: "See how it works",
    flut_texto: "WhatsApp",

    hero_selo: "For Brazilian construction owners in the United States",
    hero_h1: ["You already know", "how to do the work.", "~Now let the customer find you.~"],
    hero_sub: "Presence, lead generation and a sales process for Brazilians running construction and home services companies in the United States. No paid ads required, no license needed.",
    hero_micro: "One short call. If it isn't a fit for you, we'll say so right there.",

    num_1: "business days to put your presence online",
    num_2: "Google reviews as the quarterly target",
    num_3: "roles working on your account",

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
       "American customers look up the name before they call. No website, no Google Business Profile, no reviews, and they pick someone else."],
    ],

    rot_historia: "Leon Group",
    hist: [
      "Leon Group started from a number that doesn't add up: Brazilians in construction in the United States bill well, do good work, keep customers happy, and still have no idea where next month's job is coming from.",
      "The one who runs the job and the one who does the job both live off the same thing: referrals. Neither has a sales channel of their own. It isn't a lack of skill, it's a lack of commercial structure, and commercial structure is something you build.",
      "That's the gap Leon Group fills. We don't sell vague visibility or pretty posts. We build the three things that bring new customers without depending on referrals: ~presence that earns trust~, ~acquisition that brings people asking for estimates~ and ~a sales process that doesn't let leads go cold~.",
      "We're a new agency, and we'd rather say that than invent a history. The name carries what we set out to deliver: ~Built to Lead~. Not built to look good, not built to post nicely, but built to put your company out in front in your area.",
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
       "Twelve posts and four highlights on a defined editorial line, made so homeowners understand what you do and why they should trust you.",
       "Authority"],
      ["aquisicao", "Acquisition and sales process",
       "WhatsApp handling, qualification and a CRM with a follow-up cadence. A lead that arrives and isn't worked is money thrown away.",
       "Engine"],
      ["ads", "Paid traffic: Google Ads and Meta Ads",
       "Google Ads search campaigns and Meta Ads. It comes last on purpose: advertising on top of weak presence with no follow-up is the most expensive way to sell nothing.",
       "Last stage"],
    ],

    rot_funcoes: "The team behind it",
    func_titulo: "Twelve roles working on your account",
    func_sub: "A construction company doesn't need to hire twelve different professionals. It needs those twelve roles executed with method. That's what the contract covers.",
    funcoes: [
      ["Project manager",
       "Schedule, deadline and an owner for every deliverable. You know what's being done and when it lands."],
      ["Head of sales",
       "Designs the sales process: what to ask, when to call, how to carry a lead through to closing."],
      ["Google Business Profile specialist",
       "Profile, category, service area, services and photos. This is the piece that decides whether you show up in your city's search."],
      ["SEO specialist",
       "Site structure, keywords, a page per service and per area. Showing up without paying per click is what keeps the cost down."],
      ["Copywriter",
       "Website, ad, profile and message copy. In English, the way an American customer actually reads and understands it."],
      ["Designer",
       "Brand, identity, ad creative and profile assets. The customer's first filter is visual, and they judge in seconds."],
      ["Social media",
       "Editorial line, calendar and publishing. A dormant profile sends the same signal as no profile at all."],
      ["Video editor",
       "Cuts, captions and vertical format from the job footage you already shoot on your phone. Real job video converts better than stock."],
      ["AI and automation",
       "Instant replies, qualification and follow-up that never forgets. Anything repetitive becomes a machine instead of relying on memory."],
      ["Head of performance",
       "Reads the numbers: cost per lead, how many turn into estimates, how many turn into jobs. Without that, ad spend is expensive guesswork."],
      ["Paid traffic manager",
       "Google Ads search and Meta Ads. Only enters at the last stage, once presence and process are standing."],
      ["Full client support",
       "A direct line in Portuguese, from day one to the end of the contract. No queue, no ticket, no middleman."],
    ],
    func_nota: "Leon Group is lean on purpose. Whoever executes leans on process, tooling and automation to cover these roles without inflating cost, and that lower cost is what makes the price work for you. You are buying the outcome, not the headcount.",

    rot_metodo: "How it works",
    met_titulo: "Six steps, no mystery",
    met_sub: "Order matters: presence before ads, ads before scale. Skipping a step is the fastest way to spend with nothing to show.",
    passos: [
      ["Diagnosis", "A short call to understand what you do, where you work, how customers reach you today and what's worth fixing first. If it isn't a fit, we say so right there.", ""],
      ["Brand and presence", "Identity, profile and Google Business Profile live. This is the foundation: without it, every ad dollar leaks.", "5 business days"],
      ["Website and content", "Your English page published, twelve posts and four highlights ready, with your work and your area.", "Same window"],
      ["Acquisition", "Leads land straight in WhatsApp. The rule is to call in under a minute: speed closes more than argument.", "Ongoing"],
      ["Sales process", "A CRM with temperature tracking and follow-up. No lead leaves the funnel without explicitly saying no.", "Ongoing"],
      ["Paid traffic", "Now Google Ads search and Meta Ads. It's the last stage on purpose. With presence live, a site that converts and follow-up running, the same ad dollar goes much further.", "Last stage"],
    ],


    rot_planos: "Plans",
    planos_titulo: "Three paths, and the first one fixes what hurts today",
    planos_sub: "The most complete plan is not the recommended one. If homeowners still cannot find you on Google, paid ads only make you pay more to stay invisible. Start by existing.",
    planos_alvo: "Start here",
    planos_depois: "For later",
    planos_mes: "per month",
    planos_total: "total",
    planos_cta: "I want this plan",
    planos: [
      ["Local Presence", "2,500", "833", "3 months",
       "You exist on Google, you have a site that converts, and you have reviews to show. This is what 9 out of 10 contractors need first.",
       ["Logo in three versions, if you do not have one yet",
        "Website live, with a tap-to-call phone and every city you serve",
        "Google Business Profile built from scratch: category, service area, services, photos",
        "20 reviews written in English, ready for you to publish",
        "12 Instagram posts and 4 highlights, artwork finished",
        "All of it in 5 business days, with a handoff call",
        "3 months of support on WhatsApp"],
       "alvo"],
      ["Presence + Content", "4,500", "1,500", "3 months",
       "For those already visible who want to pull ahead. Keeps the profile active month over month, which is what Google rewards.",
       ["Everything in Local Presence",
        "8 new posts per month, artwork included",
        "20 new reviews every quarter",
        "Weekly posting on your Google profile",
        "One page per service, using the term people actually type",
        "Google Search Console set up, with a monthly report of what brought visits"],
       "depois"],
      ["Acquisition", "7,500", "2,500", "3 months",
       "For those with presence already built who want volume. Ads pointing at a finished house, not a construction site.",
       ["Everything in Presence + Content",
        "Google Ads Search campaign built and managed",
        "Meta Ads campaign built and managed",
        "Weekly tracking of cost per contact",
        "Dedicated landing page, separate from the site"],
       "depois"],
    ],
    planos_partir: "from",
    planos_nota_verba: "The ad budget on the Acquisition plan goes straight to Google and Meta, on the client's own card. Leon Group takes no percentage of ad spend, and there are no hidden fees.",
    planos_nota_pgto: "Payable in up to three installments. The monthly figure beside each plan is only the total divided, so you can compare plans. It is not a subscription.",
    planos_nota_nova: "Leon Group is a new agency and does not have a published case study yet. That is why Local Presence is 2,500 instead of 5,000 for the first three clients, in exchange for permission to document the work. If you are not happy with the result, there is no testimonial, and the price stays the same.",
    planos_duvida: "Not sure which one fits you?",
    planos_duvida_cta: "Get the free diagnosis",
    planos_duvida_txt: "We look at your Google, your site and your reviews, write up what we found, and send it to you. No cost, and it is yours even if you never hire us.",

    planos_periodos: [
      ["Local Presence", [
        [3, 2500, "The full build plus 3 months of support on WhatsApp."],
        [6, 4500, "Three more months of support, and a fresh batch of 20 reviews in month 4."],
        [12, 8000, "Support all year, 20 new reviews every quarter, and a profile review every 3 months."],
      ]],
      ["Presence + Content", [
        [3, 4500, "The full build, plus 8 posts a month and the monthly report."],
        [6, 8000, "The same pace for 6 months, with a new service page in month 4."],
        [12, 14000, "All year, with a new service page every quarter."],
      ]],
      ["Acquisition", [
        [3, 7500, "The full build, the monthly content, and campaigns built and managed."],
        [6, 13500, "Six months of management, with a creative test every month."],
        [12, 24000, "A full year of management, scaling whatever is working."],
      ]],
    ],
    v2_titulo: "Pick the plan and the term",
    v2_sub: "The plan defines what you get. The term defines how long we work together, and the longer it runs, the lower the monthly. The first plan is the one that fixes what hurts today.",
    rot_periodo: ["Quarterly", "Semiannual", "Annual"],
    v2_meses: "months",
    v2_por_mes: "per month",
    v2_total: "total",
    v2_economia: "you save",
    v2_inclui: "What the term adds",
    v2_entrega: "What the plan includes",
    v2_melhor: "Best monthly rate",

    v3_featured: [null, 1, 0],
    v3_nav: ["Plans", "Presence", "Content", "Acquisition"],
    v3_nav_cta: "Talk to Leon Group",
    v3_hero_pill: "Pick the right plan for your business",
    v3_hero_h1: ["Leon Group", "Plans"],
    v3_hero_lead: "Three ways to put the LeadsEveryDay method to work in your business: presence, content and acquisition applied with strategy. Pick the plan that fits where you are now.",
    v3_hero_bt1: "See the plans",
    v3_hero_bt2: "Talk to Leon Group",
    v3_hero_scroll: "Scroll down",
    v3_eyebrow: "Pick the right plan",
    v3_titulo: "Pick the right plan for your business",
    v3_lead: "From the essentials to exist on Google to a full acquisition operation, with Leon Group in the game.",
    v3_ver: "See prices",
    v3_eyebrow_precos: "Pick the right term",
    v3_precos_de: "Plan",
    v3_por_mes: "per month",
    v3_total: "Total:",
    v3_parcelas: "Up to {n} installments",
    v3_nota: "The prices above already include everything listed in the plan. There is no setup fee, no platform fee and no commission on results.",
    v3_cta_titulo: "Torn between two plans?",
    v3_cta_txt: "Message us on WhatsApp. We look at where your business is right now and tell you honestly which plan makes sense. No pushing the expensive one.",
    v3_cta_bt: "Message on WhatsApp",
    v3_cta_msg: "Hi! I saw the Leon Group plans and I'd like help picking the right one for my business.",
    v3_faixa: "For those who want volume",
    v3_subs: ["", "Perfect for those already visible who want to pull ahead.",
              "For those who want volume."],
    v3_destaque: ["", "borda", "escuro"],
    v3_verba: "+ ad budget separate, paid straight to Google and Meta",
    rot_faq: "FAQ",
    faq_titulo: "What people ask before starting",
    faq: [
      ["Do I need to spend on paid ads?",
       "Not required, and that's exactly the point. The foundation (brand, Google Business Profile, website, reviews and content) brings customers through local search and your own presence, without you putting money into ads. Google Ads and Meta Ads come in at the last stage, once there's structure to support the spend, and you decide whether you want it."],
      ["Do I need a license?",
       "Not for what we build. Google Local Service Ads requires one, which is precisely why it isn't the main path here. Presence, local search and content work without a license."],
      ["How long until I see results?",
       "Your presence is live within five business days of the form being filled in, and that's a deadline, not an estimate. When the first new customer comes in, honestly, depends on your area, your trade and your competition. Anyone giving you a date for that is guessing."],
      ["Which trades do you work with?",
       "Flooring (hardwood, tile, vinyl, laminate, carpet, staircase, epoxy), painting, remodeling, cabinets, carpentry, roofing, gutters, HVAC and framing. We stay out of house cleaning, carpet cleaning and window tint: the ticket doesn't cover the cost of acquisition, and we'd rather say so than take it on and underdeliver."],
      ["How much does it cost?",
       "Pricing comes after the diagnosis, because it depends on what you already have and what needs to be built. No off-the-shelf package and no hidden fees. You get scope, timeline and price in writing before you decide anything."],
      ["Do you guarantee results?",
       "We guarantee method, execution and transparency: you know what's being done, when and why. Revenue and Google rankings don't depend on us alone, they depend on the market, your area and your operation. Anyone guaranteeing a number is selling, not working."],
      ["I don't speak English. Is that a problem?",
       "Not at all. Everything with you is in Portuguese. The material that reaches your customer (website, profile, content, ads) is produced in English, at the standard an American customer expects to read."],
      ["Are you based in the United States?",
       "The operation is remote and we work with you in Portuguese. We'd rather be upfront about that than fake an American address: what matters is that the material reaching your customer meets the standard there, and that's how we build it."],
    ],

    rot_contato: "Talk to us",
    ct_titulo: "Start with the free assessment",
    ct_sub: "We look at your Google Business Profile, your website and your reviews, and send back in writing what's blocking new customers from reaching you. No cost, no strings. If you'd rather run with it yourself afterwards, the material is yours all the same.",
    ct_pontos: [
      ["A written assessment, at no cost",
       "What's missing from your presence, in priority order, including what you can fix on your own."],
      ["A short call, no sales deck",
       "You tell us where things stand. If it isn't for you, we say so right there and nobody wastes time."],
      ["Scope, timeline and price in writing",
       "Before you decide anything. No hidden fees and no pressure."],
      ["Few accounts at a time",
       "The agency is lean on purpose, so assessments go in the order they arrive."],
    ],
    ct_form_tit: "Fill it in here",
    ct_form_sub: "Takes under a minute. At the end it opens WhatsApp with the message already written, and you read it before sending.",

    form_titulo: "Before opening WhatsApp",
    form_intro: "Seven quick fields. We come into the conversation already knowing what it's about, and you don't repeat yourself.",
    f_nome: "Your name",
    f_empresa: "Company name",
    f_tel: "Your WhatsApp",
    f_tel_dica: "Start here. If you stop halfway through, we keep what you already filled in and reach out on WhatsApp. No lists, no spam.",
    f_servico: "What trade do you work in",
    f_cidade: "City and state",
    f_papel: "You are",
    f_hoje: "How customers reach you today",
    f_obrig: "Please fill this in",
    f_enviar: "Open WhatsApp",
    f_nota: "Opens the chat with the message already written. You read it before sending.",
    previa_rot: "What goes to WhatsApp",
    f_vazio: "(not provided)",
    f_salvo: "Contact saved. If you leave now, we'll reach out on WhatsApp.",

    opt_servico: ["Flooring", "Painting", "Remodeling", "Cabinets", "Carpentry",
                  "Roofing", "Gutters", "HVAC", "Framing", "Other"],
    opt_papel: ["Company owner (contractor)", "I work as a subcontractor", "Partner", "Other"],
    opt_hoje: ["Referrals only", "Referrals and social media", "I already run ads",
               "No process at all", "Just getting started"],
    opt_placeholder: "Select",

    fim_titulo: "Let's see if it's a fit",
    fim_sub: "A short call, no sales deck. You tell us where things stand, we tell you what can be done, and if it isn't for you, we'll say so right there.",

    pe_frase: "Presence, acquisition and sales process for construction and home services in the United States.",
    pe_contato: "Contact",
    pe_atende: "We serve",
    pe_regiao: "Massachusetts and Boston first · United States",
    pe_nota: "New agency. No published case yet. When there is one, with a name and numbers, it will be here.",

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
