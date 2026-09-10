/* ═══════════ O CONTEÚDO DE CADA ATIVAÇÃO ═══════════
   Separado de `ativacoes.js` porque aquilo é motor (personalização, checklist,
   catálogo) e isto é texto. Texto muda toda semana conforme ele descobre o que
   o contractor responde; motor não muda quase nunca.

   ── para quem é escrito ──
   Contractor brasileiro morando nos Estados Unidos, Massachusetts e Boston.
   Dono de empresa de flooring, pintura, telhado, HVAC. Fatura US$ 10 a 20 mil
   por mês. Trabalha NA OBRA: atende o telefone com a mão suja, lê mensagem no
   intervalo do almoço, responde à noite. Não é executivo e desliga na hora
   que cheira a marketing.

   ── as duas regras que nenhum texto daqui quebra ──
   1. FOLLOW-UP NÃO É VENDA. Nada aqui oferta, manda preço, manda proposta ou
      empurra. A venda acontece na ligação. A ativação só reabre a conversa.
   2. INTEGRIDADE. Nada inventa cliente, resultado, depoimento, urgência ou
      prazo. Nada finge que houve pagamento.

   ── por que as mensagens são curtas e sem pergunta aberta ──
   Pergunta aberta ("como posso te ajudar?") dá trabalho de responder, e quem
   está na obra não responde o que dá trabalho. Pergunta fechada, de uma linha,
   com resposta de uma palavra, é o que volta.                              */

export const CONTEUDO = {

  ligacao: {
    quando_usar: "Primeiro contato, sempre, e em MENOS DE UM MINUTO depois de o lead entrar. Se ele não atender, a melhor janela para retornar é das 17h às 22h no fuso dele (52% de atendimento, medido em mais de 10 mil ligações da mentoria). A segunda melhor é das 7h às 11h. Nunca três ligações seguidas no mesmo dia.",
    por_que: "É a ativação que fecha. Todas as outras existem para ele atender a próxima ligação. O lead acabou de clicar no anúncio e mandar mensagem no WhatsApp: se você liga em um minuto, ele ainda está com o celular na mão e com o assunto na cabeça.",
    texto_pt: "",
    texto_en: "",
    // Para a ligação, o equivalente a "o que mandar" é O QUE FALAR quando ele
    // atende. Sem isso a seção abriria vazia justo na ativação que fecha.
    roteiro_audio: "ABERTURA (o lead acabou de mandar mensagem no WhatsApp)\n\n\"Oi, {{PRIMEIRO_NOME}}? Aqui é o Rodrigo, da Leon Group. Você acabou de mandar mensagem pra gente sobre o programa de marketing, tô te ligando na hora. Consegue falar dois minutos ou tá no meio de um serviço?\"\n\nSE ELE DISSER QUE ESTÁ OCUPADO\n\n\"Sem problema, é rapidinho. Me fala só um horário hoje ou amanhã que eu te ligo de volta.\" (anota e desliga, não insiste)\n\nSE ELE PUDER FALAR, VOCÊ OUVE\n\n\"Antes de eu falar qualquer coisa, me conta: de onde vêm os teus clientes hoje?\"\n\"Quantos orçamentos tu fez mês passado? E quantos fecharam?\"\n\"Se aparecessem cinco orçamentos por semana, tu daria conta de atender?\"\n\nVocê ouve, ouve, ouve. Anota o BANT enquanto ele fala, aqui embaixo no card.\n\nFECHAMENTO DA LIGAÇÃO (agendar, não vender)\n\n\"Olha, dá pra te ajudar sim. Eu vou olhar o teu Google, o teu site e as tuas avaliações e escrever um diagnóstico do que dá pra arrumar. Isso é de graça e é teu, fechando ou não. Marca comigo [dia] às [hora] que eu te mostro o que encontrei.\"\n\nNunca mais de dois dias à frente. Sem horário hoje? Não marque: diga que retorna a ligação amanhã.",
    emojis: [],
    direcao_visual: "",
    nao_fazer: [
      "Ligar três vezes seguidas no mesmo dia. Duas, e para.",
      "Ligar antes das 8h ou depois das 21h no fuso DELE, não no seu. O card mostra a hora local dele em cima.",
      "Vender na primeira ligação. A primeira ligação qualifica e agenda, só isso.",
      "Falar mais do que ele. A analogia é consultoria médica: ouve, ouve, ouve, e a receita vem no fim.",
      "Ligar de número brasileiro se já tiver o americano. O prefixo derruba a taxa de atendimento.",
    ],
  },

  mensagem: {
    quando_usar: "Depois de uma ligação não atendida, no mesmo dia. É o bilhete que explica a chamada perdida.",
    por_que: "Chamada perdida sem mensagem vira número desconhecido e ele bloqueia. Com uma linha explicando, vira contato conhecido.",
    texto_pt: "Oi {{PRIMEIRO_NOME}}, aqui é o Rodrigo da Leon Group. Te liguei agora, mas imagino que você esteja na obra. Me responde só com o horário que é melhor pra gente falar 5 minutos, que eu te ligo.",
    texto_en: "Hi {{PRIMEIRO_NOME}}, this is Rodrigo from Leon Group. I just called, but I figure you're on a job. Just reply with a good time and I'll call you back. Five minutes, that's it.",
    roteiro_audio: "",
    emojis: ["👊", "🔨", "👍"],
    direcao_visual: "",
    nao_fazer: [
      "Escrever mais de três linhas. Ele lê no intervalo, em pé.",
      "Perguntar 'como posso te ajudar?'. Dá trabalho responder e ele não responde.",
      "Mandar sem ter ligado antes. A mensagem explica a ligação, não substitui.",
      "Assinar como 'equipe Leon Group'. Ele fala com pessoa, não com equipe.",
    ],
  },

  audio: {
    quando_usar: "Quando ele leu a mensagem e não respondeu. O áudio fura a barreira do texto ignorado.",
    por_que: "Áudio de brasileiro para brasileiro cria proximidade que texto não cria, e o WhatsApp mostra o balãozinho azul: ele sabe que você sabe que ele ouviu.",
    texto_pt: "",
    texto_en: "",
    roteiro_audio: "Fala {{PRIMEIRO_NOME}}, tudo bem? Rodrigo aqui da Leon Group. Ó, eu não quero tomar teu tempo, sei que tu tá na correria. Eu dei uma olhada no Google da {{EMPRESA}} e vi umas coisas que dá pra arrumar rápido, sem custo nenhum pra ti saber quais são. Me fala só se faz sentido a gente conversar 5 minutos essa semana. Se não fizer, sem problema, eu paro de te incomodar. Abraço.",
    emojis: ["🎧", "👊"],
    direcao_visual: "",
    nao_fazer: [
      "Passar de 30 segundos. Áudio longo de desconhecido não é ouvido.",
      "Gravar na rua com barulho. Ele julga o profissionalismo pelo áudio.",
      "Falar de preço ou de plano. Isso é a ligação, não o áudio.",
      "Prometer resultado no áudio. Você diz o que viu, não o que vai acontecer.",
    ],
  },

  audio_unico: {
    quando_usar: "Lead que esfriou de vez, uma semana ou mais sem responder. É o último recurso antes da nutrição.",
    por_que: "A visualização única cria curiosidade: some depois de ouvir, então ele ouve. O custo de ignorar parece maior do que é.",
    texto_pt: "",
    texto_en: "",
    roteiro_audio: "{{PRIMEIRO_NOME}}, é o Rodrigo. Vou ser rápido porque esse áudio some. Eu não vou mais te encher, prometo. Só queria te dizer uma coisa que eu vi no perfil da {{EMPRESA}} e que tá te custando cliente todo mês. Se tu quiser saber o que é, me responde qualquer coisa aqui. Se não responder, tá tudo certo, eu entendo. Abraço.",
    emojis: ["👀", "⏳"],
    direcao_visual: "",
    nao_fazer: [
      "Usar mais de uma vez com o mesmo lead. Perde o efeito e vira chatice.",
      "Prometer no áudio uma revelação que você não tem. O que você viu tem que ser real e específico.",
      "Falar mais de 25 segundos. A pessoa não pode reouvir.",
      "Usar em lead quente. Desperdiça o recurso; use ligação.",
    ],
  },

  foto_unica: {
    quando_usar: "Depois de duas ou três tentativas sem resposta, num lead que ainda vale a pena. É o toque visual que quebra a rotina de texto.",
    por_que: "Imagem com o nome dele e o da empresa prova que não é disparo em massa. Visualização única faz ele abrir na hora.",
    texto_pt: "{{PRIMEIRO_NOME}}, fiz isso aqui pra você. 👆",
    texto_en: "{{PRIMEIRO_NOME}}, made this one for you. 👆",
    roteiro_audio: "",
    emojis: ["👆", "☁️", "👀"],
    direcao_visual: "Céu azul limpo, nuvens brancas macias, e o nome do lead e o da empresa dele formados pelas próprias nuvens. Embaixo, em texto limpo, a frase de follow-up. Nada de logo grande, nada de oferta, nada de preço na imagem. O prompt pronto está abaixo.",
    nao_fazer: [
      "Mandar a imagem sem uma linha de texto junto. Imagem sozinha parece corrente de WhatsApp.",
      "Pôr preço, oferta ou logo grande na imagem. Vira panfleto e ele ignora.",
      "Gerar sem conferir a grafia do nome e da empresa. Nome errado é pior que não mandar.",
      "Reaproveitar a imagem de um lead em outro. O nome nas nuvens é o ponto todo.",
    ],
  },

  video_unico: {
    quando_usar: "Lead que já falou com você por áudio e sumiu. O vídeo mostra a cara e reancora quem é você.",
    por_que: "Ver o rosto de quem está falando muda a relação. Para contractor brasileiro nos EUA, ver outro brasileiro falando direto vale mais que qualquer argumento escrito.",
    texto_pt: "",
    texto_en: "",
    roteiro_audio: "Oi {{PRIMEIRO_NOME}}, Rodrigo aqui. Gravei rapidinho porque acho que fica mais fácil de tu me conhecer assim. Eu ajudo contractor brasileiro daí a aparecer no Google quando o dono de casa procura o serviço. Só isso. Olhei o teu caso, tem coisa simples pra arrumar. Se quiser conversar, me responde aqui. Se não, beleza também. Abraço.",
    emojis: ["👋", "📹"],
    direcao_visual: "Você falando direto para a câmera, celular na vertical, luz natural, fundo neutro. Sem edição, sem legenda, sem trilha. Quanto mais parecer mensagem pessoal e menos parecer anúncio, melhor.",
    nao_fazer: [
      "Editar como se fosse anúncio. Vídeo produzido vira propaganda e perde a intimidade.",
      "Passar de 30 segundos.",
      "Gravar num lugar que denuncie fuso ou hora estranha. Ele repara.",
      "Dizer que está nos Estados Unidos. Você opera do Brasil e isso não se esconde.",
    ],
  },

  figurinha: {
    quando_usar: "Toque leve num lead morno que já teve conversa boa antes. Serve para reabrir sem cobrar.",
    por_que: "Figurinha não pede resposta, e por isso não gera culpa de não responder. Muitos respondem justamente por ser leve.",
    texto_pt: "",
    texto_en: "",
    roteiro_audio: "",
    emojis: ["👊", "😄", "🔨"],
    direcao_visual: "Figurinha simples e amistosa, do tipo que brasileiro usa no dia a dia. Nada de figurinha da marca, nada de figurinha com texto de venda.",
    nao_fazer: [
      "Mandar figurinha da própria agência. Vira propaganda e o efeito some.",
      "Usar em lead que nunca respondeu. Sem conversa anterior, é estranho.",
      "Mandar figurinha e nada mais por dias. É toque, não estratégia.",
      "Usar figurinha de humor duvidoso. Você não conhece o cara ainda.",
    ],
  },

  emoji: {
    quando_usar: "O toque mais leve que existe. Lead que sumiu há dias e você não quer queimar com outra mensagem longa.",
    por_que: "Um emoji sozinho é quase um cutucão. Custa nada mandar, custa nada responder, e reabre a janela de 24 horas do WhatsApp.",
    texto_pt: "",
    texto_en: "",
    roteiro_audio: "",
    emojis: ["👊", "👀", "🤔", "👋"],
    direcao_visual: "",
    nao_fazer: [
      "Mandar vários emojis seguidos. Um. Só um.",
      "Repetir o mesmo emoji em dias diferentes. Vira automação óbvia.",
      "Usar emoji ambíguo ou de duplo sentido.",
      "Mandar emoji como primeiro contato. Sem conversa antes, ele não entende.",
    ],
  },

  status_mencao: {
    quando_usar: "Quando você tem algo real para mostrar (um perfil que você otimizou, um site que subiu) e quer que o lead veja sem receber mensagem direta.",
    por_que: "Status é passivo: ele vê sem se sentir cobrado. Marcar o contato faz o status aparecer para ele com prioridade.",
    texto_pt: "",
    texto_en: "",
    roteiro_audio: "",
    emojis: ["📈", "🔨", "👀"],
    direcao_visual: "Só trabalho SEU e real: antes e depois de um perfil que você mexeu, um site que você subiu, um print de checklist concluído. Se você ainda não tem cliente entregue, use bastidor do próprio processo, nunca resultado de terceiro apresentado como seu.",
    nao_fazer: [
      "Postar resultado de cliente que não é seu. É a regra que não se quebra.",
      "Postar print do Google de outra empresa como se fosse trabalho seu.",
      "Marcar vários leads no mesmo status. Se um perceber, você perdeu todos.",
      "Postar oferta ou preço no status e marcar lead. Isso é anúncio, não follow-up.",
    ],
  },

  pdf_followup: {
    quando_usar: "Lead que sumiu e não abre mais mensagem comum. O PDF aparece na conversa com miniatura grande e chama atenção onde texto já não chama.",
    por_que: "A estética de aplicativo de pagamento faz a miniatura saltar na conversa. O que segura a honestidade é o crachá obrigatório no topo, dizendo que não é pagamento, e a proibição escrita de qualquer valor ou número de transação dentro do prompt.",
    texto_pt: "{{PRIMEIRO_NOME}}, te mandei isso aqui. Dá uma olhada quando puder.",
    texto_en: "{{PRIMEIRO_NOME}}, sent you this. Take a look when you get a minute.",
    roteiro_audio: "",
    emojis: ["📄", "👆"],
    direcao_visual: "Uma página A4, fundo roxo de fintech, cartão branco no meio. No topo do cartão, o crachá FOLLOW-UP NOT A PAYMENT, visível e legível. Abaixo, o nome do lead e o da empresa. No centro, AGUARDANDO SUA RESPOSTA. Nenhum valor, nenhum número de transação, nenhuma confirmação de pagamento. O prompt completo está abaixo.",
    nao_fazer: [
      "Apagar, encolher ou esconder o crachá FOLLOW-UP NOT A PAYMENT. É ele que separa isso de um comprovante falso.",
      "Deixar o gerador inventar valor, número de transação ou data. O prompt proíbe, mas confira o resultado antes de mandar.",
      "Mandar sem uma linha de texto junto. PDF solto na conversa parece golpe.",
      "Usar em lead quente ou logo no começo. É recurso de reativação, não de abertura.",
    ],
  },
};
