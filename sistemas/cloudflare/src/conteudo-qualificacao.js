/* ═══════════ O ROTEIRO DA LIGAÇÃO DE QUALIFICAÇÃO ═══════════
   Extraído da Aula 03, do roleplay que o Enrico faz ao vivo. Aquilo não é um
   resumo do script: é ele ligando e conduzindo, frase por frase. O que está
   aqui é a transcrição transposta para o card do lead.

   ── por que o CRM precisava disso ──
   Antes existiam cinco campos de texto em branco (rapport, budget, authority,
   need, timeline) com uma dica minúscula em cada. Isso serve para ANOTAR
   DEPOIS. Não serve para CONDUZIR a ligação, que é quando o dinheiro é ganho
   ou perdido. O roteiro abaixo é para ficar aberto na tela com o telefone no
   ouvido.

   ── a frase que organiza o tom ──
   "Venda não pode parecer venda. Quando você faz o primeiro contato com o
   lead, tu não tem que chegar naquele entusiasmo absurdo."
   E logo depois: "Call de vendas é exatamente igual você trocar ideia com
   alguma mina." Não é "E aí, Gabriela, como você está?". É "E aí, Gabi,
   tudo bem?".

   ── o script é âncora, não robô ──
   "Eu não segui o script especificamente. O script, ele é uma base, não é um
   robô que você vai ler e executar." Os campos existem para capturar a
   resposta, não para obrigar a pergunta a sair igual.

   ── DUAS ADAPTAÇÕES CONSCIENTES, e o motivo ──
   1. No original existe SDR e closer: "quem vai conduzir essa call contigo vai
      ser o Henrico". A Leon Group é uma pessoa só. Fingir um closer seria
      inventar equipe, que o CLAUDE.md proíbe. A versão aqui é solo.
   2. No original: "eu vou pedir para os meus meninos, o Léo, o Guilherme, o
      Gustavo, começarem a preparar o plano". Mesma coisa: não existem esses
      meninos. O compromisso foi reescrito para o trabalho real, que é o
      diagnóstico que o Rodrigo monta sozinho. O efeito (criar custo social
      para o no-show) se mantém, porque o trabalho é verdadeiro.            */

export const ROTEIRO = [
  {
    n: 1, etapa: "Abertura", campo: null,
    fala: "Fala, {primeiro}.",
    porque: "Sem entusiasmo de vendedor. É o mesmo tom de ligar para um conhecido. Entusiasmo alto no primeiro segundo denuncia venda e fecha o cara.",
  },
  {
    n: 2, etapa: "Enquadrar a conversa", campo: null,
    fala: "O objetivo dessa conversa, cara, é entender de forma bem rápida se o que a gente faz de fato faz sentido para a sua empresa.",
    porque: "Diz que a ligação é curta e que pode não dar em nada. Tira a pressão e abaixa a guarda.",
  },
  {
    n: 3, etapa: "Empresa e ofício", campo: "nicho",
    fala: "Qual o nome da sua empresa, cara?\n\nPosso assumir que você trabalha na área de {palpite}, né, pelo nome? Trabalha alguma área específica?",
    porque: "O palpite pelo nome mostra que você prestou atenção, e a pergunta do subnicho faz ele detalhar sozinho.",
  },
  {
    n: 4, etapa: "Onde ele está", campo: "cidade",
    fala: "E você tá localizado em que estado, cidade, cara?",
    dica: "Puxe rapport de verdade na resposta. No original: \"Tampa na Flórida é bom demais, mano. Eu gosto do calor, é o clima da Flórida, me lembra o Brasil.\" Se você não conhece a cidade, pergunte como é morar lá. Não invente familiaridade.",
    porque: "Além do rapport, a cidade alimenta o relógio do card e a busca que você vai fazer no diagnóstico.",
  },
  {
    n: 5, etapa: "Budget", campo: "budget",
    fala: "Mas aí, {primeiro}, como que tem das vendas aí? Foi boa nos últimos 30 dias? Como que foi?\n\nNos últimos 30 dias conseguiu faturar mais de 10 mil dólares?",
    dica: "Se ele der desculpa de temporada, acolha antes de insistir: \"Final de ano é foda, ligado? Mas dá para dar um jeito.\" Depois ancore nos 10 mil e cale a boca.",
    porque: "A âncora de 10 mil faz o lead subir sozinho. No roleplay ele responde \"bem mais, uns 30\". Você descobre o faturamento sem nunca perguntar quanto ele ganha.",
  },
  {
    n: 6, etapa: "Rapport de imigrante", campo: "rapport",
    fala: "E faz tempo que você tá na América, cara?\n\nE curte aí? Tem saudade do Brasil?",
    dica: "Espelhe com algo verdadeiro seu. No original ele diz que está há seis anos e que a família tem empresa de construção. Use a SUA história real, não a dele.",
    porque: "É o ponto de conexão que você reutiliza no follow de no-show. Anote o que ele contar: filho, time, cidade natal, quanto tempo fora.",
  },
  {
    n: 7, etapa: "Need", campo: "need",
    fala: "E me fala uma coisa, velho: você acha que você realmente precisa desse tipo de serviço que a gente faz?\n\nBasicamente é trazer mais cliente para você sem que você precise investir em tráfego pago. A gente pega o que o americano mais valoriza na hora de fechar um serviço, que são as reviews, e usa isso para te levantar nas buscas do Google.\n\nVocê acha que é algo que você precisa agora para fechar mais serviço particular, talvez diminuir a dependência de um contratista?",
    porque: "Aqui a oferta aparece pela primeira vez, e aparece como pergunta. Ele que diz que precisa. Quem afirma não convence, quem pergunta faz o outro convencer a si mesmo.",
  },
  {
    n: 8, etapa: "Timeline", campo: "timeline",
    fala: "É algo que você quer fazer para agora?",
    dica: "Quem quer decidir daqui a dois ou três meses não vira call. Agradeça, mande para nutrição e siga. Não gaste energia.",
    porque: "Separa interesse de intenção. É o filtro que impede agenda cheia de call que não fecha.",
  },
  {
    n: 9, etapa: "Authority", campo: "authority",
    fala: "E na hora de decidir uma coisa dessas, é você sozinho ou tem sócio junto? A esposa participa?",
    dica: "Se tiver mais alguém, essa pessoa PRECISA estar na call. Marque com os dois ou não marque.",
    porque: "Descobrir o decisor no minuto 45 da reunião é perder a reunião inteira. O Enrico é literal: \"ele tem que entrar na call com o decisor final sempre\".",
  },
  {
    n: 10, etapa: "Compromisso antes de marcar", campo: null,
    fala: "E essa call que a gente vai fazer, eu vou te apresentar um plano personalizado mesmo, montado a dedo para ti.\n\nEntão posso contar que você realmente tem interesse em melhorar essa parte da sua empresa, algo que você quer fazer para agora?",
    porque: "Ele diz sim em voz alta antes de ver o horário. É o sim que segura a presença depois.",
  },
  {
    n: 11, etapa: "Agendar", campo: null,
    fala: "Eu tenho disponibilidade hoje entre {janela}. Vai durar mais ou menos 40 minutos a ligação.\n\nQual que fica melhor para ti?",
    dica: "Duas janelas fechadas, nunca \"quando você pode?\". Se ele recusar as duas, ofereça uma terceira específica: \"7h30 funciona? Das 7h30 às 8h30?\". Nunca mais de dois dias à frente.",
    porque: "Opção fechada fecha. Pergunta aberta manda ele consultar a agenda mental e sumir.",
  },
];

/* A parte que quase todo mundo pula, e é a que segura o no-show: isso acontece
   com o lead AINDA NO TELEFONE. Não é mensagem mandada depois. */
export const CONFIRMACAO = [
  { id: "viva_voz",  texto: "Pedi para ele colocar no viva-voz",
    fala: "Tá com o celular na mão? Coloca a ligação no viva-voz, por favor." },
  { id: "abriu_zap", texto: "Ele abriu a nossa conversa no WhatsApp",
    fala: "Abre a nossa conversa no WhatsApp aí agora. Conseguiu abrir?" },
  { id: "recebeu",   texto: "Mandei a confirmação e ele confirmou que chegou",
    fala: "Tô te enviando a confirmação da nossa reunião, verifica se vai chegar. Chegou?" },
  { id: "email",     texto: "Ele mandou o e-mail no chat, ainda na ligação",
    fala: "Me encaminha o seu e-mail agora aqui no chat do WhatsApp para eu linkar com o invite no Google Agenda." },
  { id: "meet",      texto: "Expliquei o Google Meet",
    fala: "A call vai ser no Google Meet. Se você não tiver o aplicativo, é só ir na App Store e pesquisar Meet, M E E T. Não precisa criar conta. Eu te mando o link aqui pelo WhatsApp." },
  { id: "presenca",  texto: "Peguei o compromisso de presença",
    fala: "Meu irmão, posso contar com a tua presença mesmo? Porque eu vou passar as próximas horas montando o diagnóstico da {empresa}: vou abrir o teu Google, o teu site e as tuas avaliações e escrever o que tá faltando. É o horário que você realmente consegue comparecer? É que eu não posso ter furo na agenda." },
];

export const FECHO =
  "Faltando 5 minutos eu te envio o link aqui. Qualquer dúvida tu pode me ligar aqui no WhatsApp. " +
  "Prazerzão, {primeiro}.";

/* Substitui {primeiro}, {empresa}, {palpite}, {janela} pelo que o card sabe. */
export function preencher(texto, l) {
  const primeiro = (l?.nome || "").trim().split(/\s+/)[0] || "amigo";
  const palpite = l?.nicho || "construção";
  const janela = l?.janela || "6 e 8 da noite";
  return String(texto || "")
    .replaceAll("{primeiro}", primeiro)
    .replaceAll("{empresa}", l?.empresa || "sua empresa")
    .replaceAll("{palpite}", palpite)
    .replaceAll("{janela}", janela);
}
