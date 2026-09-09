/* ═══════════════════════ CONTRATO ═══════════════════════

   ⚠⚠ AVISO QUE NÃO PODE SER REMOVIDO ⚠⚠

   Este texto é MINUTA. Foi escrito por quem não é advogado, a partir do escopo
   real do sistema, e serve para o usuário levar a um profissional em vez de
   chegar nele com uma folha em branco.

   O que especificamente precisa de revisão antes de este contrato ser usado
   contra alguém:

   1. LEI APLICÁVEL E FORO. Prestador no Brasil, cliente nos Estados Unidos. A
      cláusula abaixo escolhe o Brasil, que é o mais simples para o prestador,
      mas pode ser inexequível contra um cliente americano que não compareça.
      Um advogado precisa dizer se vale a pena, e se arbitragem resolveria.
   2. ACEITE ELETRÔNICO. O aceite por clique é reconhecido nos Estados Unidos
      (ESIGN Act, UETA) e no Brasil, MAS depende de o texto integral estar na
      tela antes do clique e de a prova ser guardada. O sistema faz as duas
      coisas; se o texto valeria em juízo é pergunta para advogado.
   3. IMPOSTO E REMESSA. Receber de cliente americano tem consequência fiscal
      nos dois países. Nada aqui trata disso.
   4. CLASSIFICAÇÃO DE COLABORADOR. Quando entrar freelancer, ver o aviso que
      já existe em `_memoria/playbook-operacao.md`.

   ── a decisão de conteúdo que importa ──

   A cláusula 6 (o que NÃO está incluído) é a mais importante do contrato, e é
   a que a maioria dos contratos de agência não tem. Ela protege os dois lados:
   o cliente sabe o que não vai receber, e a agência não é cobrada por
   faturamento que nunca prometeu. Ela existe porque a regra de integridade da
   Leon Group proíbe prometer faturamento ou posição no Google, e contrato que
   não diz isso deixa a promessa por escrito no boca a boca.

   A cláusula 8 (propriedade) dá tudo ao cliente e declara que a agência não
   guarda senha. Isso já é o que o checklist do sistema exige na entrega, então
   o contrato só está pondo no papel o que a operação já faz.                */

// Muda quando o TEXTO muda. O aceite grava esta versão, senão um contrato
// editado depois torna todo aceite anterior impossível de interpretar.
export const VERSAO_CONTRATO = "2026-09-09.1";

const AGENCIA = {
  nome: "Leon Group",
  slogan: "Built to Lead.",
  email: "leongroup.builtolead@gmail.com",
  pais: "Brasil",
};

const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
  (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

const dataLonga = (iso) => {
  const d = iso ? new Date(iso) : new Date();
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long",
    year: "numeric", timeZone: "America/Sao_Paulo" }).format(d);
};

/* Prazo de entrega em dias ÚTEIS, contados da resposta ao formulário e não da
   assinatura. É como o sistema já conta (`entrega_iniciada_em`), e o contrato
   tem que dizer a mesma coisa, senão a agência assume um prazo que o sistema
   não mede. */
const PRAZO_DIAS_UTEIS = 5;

/* ── O ESCOPO ──
   Espelha exatamente o que `geradores.js` produz e o que `CADENCIA` entrega.
   Se um dia o sistema passar a entregar outra coisa, esta lista muda junto,
   senão o contrato promete o que o sistema não faz. */
export const ESCOPO = [
  ["Marca",
   "Logotipo em três versões (principal com fundo transparente, versão para fundo claro e versão para fundo escuro), mais o ícone quadrado para foto de perfil. Entregue somente se o CLIENTE ainda não possuir logotipo próprio."],
  ["Site",
   "Site de uma página, publicado e no ar, com telefone clicável fixo em tela, uma seção por serviço prestado, as cidades atendidas escritas como texto, galeria com as fotos de obra enviadas pelo CLIENTE, formulário de orçamento e dados estruturados de negócio local."],
  ["Google Meu Negócio",
   "Otimização do perfil: categoria principal e secundárias, área de atendimento sem exposição de endereço residencial, telefone, horário, descrição, serviços cadastrados individualmente, e publicação das fotos de obra enviadas pelo CLIENTE."],
  ["Avaliações",
   "Vinte textos de avaliação redigidos em inglês, cada um referente a um serviço específico e mencionando a região atendida, entregues em arquivo ao CLIENTE, acompanhados do processo de solicitação de avaliação e do link direto do perfil."],
  ["Instagram",
   "Doze publicações e quatro destaques, com as artes finalizadas, mais a configuração do perfil: biografia com serviço e região, botão de contato e link do site."],
  ["Entrega",
   "Pasta com todos os arquivos originais, tutorial do Google Meu Negócio, e reunião de entrega ao final do prazo."],
];

/* ── O QUE NÃO ESTÁ INCLUÍDO ──
   A cláusula mais importante. Cada linha aqui existe porque, sem ela, a
   agência seria cobrada por algo que nunca prometeu. */
export const FORA_DO_ESCOPO = [
  "Garantia de faturamento, de número de clientes, de número de orçamentos ou de qualquer resultado financeiro. A AGÊNCIA não promete e não estima resultado financeiro em nenhuma hipótese.",
  "Garantia de posição em resultado de busca do Google ou de qualquer outro buscador. Posição em busca é definida por algoritmo de terceiro, fora do controle das partes.",
  "Prazo para aparecimento de resultado. A AGÊNCIA se compromete com o prazo de EXECUÇÃO do escopo, não com prazo de resultado.",
  "Publicação das avaliações. Os textos são entregues ao CLIENTE, e a publicação é feita por ele e pelos clientes dele. A AGÊNCIA não publica avaliação, não cria conta de terceiro e não simula cliente, por vedação legal e por política própria.",
  "Verba de anúncio, gestão de tráfego pago e produção de vídeo, que não integram este escopo.",
  "Registro de domínio próprio, cuja contratação e custo são do CLIENTE.",
  "Atendimento telefônico dos contatos gerados, resposta a orçamento e execução do serviço vendido, que são do CLIENTE.",
];

export const OBRIGACOES_CLIENTE = [
  "Responder o formulário de início com informações verdadeiras, incluindo no mínimo onze fotos de trabalhos realizados por ele próprio.",
  "Enviar somente fotos e vídeos de autoria própria ou com licença de uso. O CLIENTE declara ser titular dos direitos do material que enviar e responde por ele.",
  "Liberar o acesso ao perfil do Google Meu Negócio até o quarto dia útil do prazo.",
  "Publicar as avaliações recebidas em ritmo próprio, e solicitar avaliação apenas a clientes reais que tenham contratado seu serviço.",
  "Responder no mesmo dia os contatos que chegarem pelos canais entregues.",
  "Manter em seu próprio nome e sob seu próprio acesso as contas de Google, Instagram e domínio.",
];

/* ═══════════════ O TEXTO ═══════════════
   Devolve o contrato em texto puro. O HTML da página é montado a partir dele,
   e o hash do aceite é calculado sobre ele: uma fonte só, para o que o cliente
   leu e o que ficou guardado serem provadamente a mesma coisa. */
export function textoContrato(c) {
  const contratante = c.razao_social || c.empresa || "(não informado)";
  const entidade = c.tipo_entidade ? ` (${c.tipo_entidade})` : "";
  const rep = c.nome_dono || c.nome_contato || "(não informado)";
  const end = [c.endereco, c.endereco_cidade, c.endereco_estado, c.endereco_zip]
    .filter(Boolean).join(", ") || "(não informado)";
  const valor = c.valor_contrato || "(a definir)";
  const meses = Number(c.duracao_meses) || 3;
  const recorrente = c.tipo_contrato === "MRR";
  // "6 (6) meses" fica ridículo num contrato. Escreve por extenso o que dá.
  const EXT = { 1: "um", 2: "dois", 3: "três", 4: "quatro", 5: "cinco", 6: "seis",
                9: "nove", 12: "doze", 18: "dezoito", 24: "vinte e quatro" };
  const mesesTxt = EXT[meses] ? `${meses} (${EXT[meses]}) meses` : `${meses} meses`;
  const plano = c.plano || "Presença Local";

  const n = (i) => `${i}.`;
  const L = [];
  const p = (t) => L.push(t);
  const cl = (num, tit) => L.push("", `${num} ${tit.toUpperCase()}`, "");

  p("CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE MARKETING DIGITAL");
  p("");
  p(`${AGENCIA.nome} · ${AGENCIA.slogan}`);
  p(`Versão do instrumento: ${VERSAO_CONTRATO}`);

  cl(n(1), "As partes");
  p(`CONTRATADA: ${AGENCIA.nome}, com operação remota sediada no ${AGENCIA.pais}, doravante AGÊNCIA, representada por Rodrigo Leon da Silva Rodrigues, contato ${AGENCIA.email}.`);
  p("");
  p(`CONTRATANTE: ${contratante}${entidade}, com endereço em ${end}, doravante CLIENTE, representada por ${rep}${c.email_contrato ? `, contato ${c.email_contrato}` : ""}.`);

  cl(n(2), "Objeto");
  p(`A AGÊNCIA prestará ao CLIENTE os serviços de presença digital descritos na cláusula 3, no plano "${plano}", com o objetivo de organizar e melhorar a presença do CLIENTE nos canais de busca e de rede social.`);
  p("");
  p("Este contrato é de MEIO, e não de RESULTADO. A AGÊNCIA se obriga a executar o escopo com diligência técnica e no prazo pactuado, e não se obriga a produzir resultado comercial, conforme a cláusula 6.");

  cl(n(3), "Escopo dos serviços");
  ESCOPO.forEach(([tit, desc], i) => {
    p(`3.${i + 1} ${tit}. ${desc}`);
    p("");
  });
  L.pop();

  cl(n(4), "Prazo de execução");
  p(`4.1 O prazo de execução é de ${PRAZO_DIAS_UTEIS} (cinco) dias úteis.`);
  p("");
  p("4.2 O prazo começa a contar do dia em que o CLIENTE responder integralmente o formulário de início, e NÃO da data de aceite deste contrato nem da data do pagamento. Enquanto o formulário não for respondido, o prazo não corre, por depender de informação e de material que só o CLIENTE possui.");
  p("");
  p("4.3 Atraso do CLIENTE em liberar o acesso ao Google Meu Negócio (cláusula 5) suspende o prazo pelo tempo do atraso.");

  cl(n(5), "Obrigações do cliente");
  OBRIGACOES_CLIENTE.forEach((o, i) => p(`5.${i + 1} ${o}`));

  cl(n(6), "O que não está incluído");
  p("Esta cláusula é essencial e integra o objeto. O CLIENTE declara ter lido e compreendido que os itens abaixo NÃO fazem parte do contrato:");
  p("");
  FORA_DO_ESCOPO.forEach((o, i) => { p(`6.${i + 1} ${o}`); p(""); });
  L.pop();

  cl(n(7), "Valor e pagamento");
  p(recorrente
    ? `7.1 O valor é de ${valor} por mês, pelo período de ${mesesTxt}.`
    : `7.1 O valor é de ${valor}, em pagamento único, cobrindo o período de ${mesesTxt}.`);
  p("");
  p("7.2 O pagamento é condição para o início da execução. O formulário de início é liberado ao CLIENTE após a confirmação do pagamento.");
  p("");
  p("7.3 Não há taxa, comissão ou custo além do valor acima. Custo de terceiro que o CLIENTE opte por contratar (domínio próprio, verba de anúncio) é pago por ele diretamente ao fornecedor, sem intermediação da AGÊNCIA.");

  cl(n(8), "Propriedade e acessos");
  p("8.1 Todo material entregue passa a ser de propriedade do CLIENTE: logotipo e arquivos originais, conteúdo do site, textos de avaliação e artes de rede social.");
  p("");
  p("8.2 As contas de Google, Instagram e domínio permanecem em nome do CLIENTE e sob acesso dele. A AGÊNCIA NÃO ARMAZENA SENHA DE CLIENTE. Acesso concedido para execução é temporário, e o CLIENTE deve alterar a senha ao final.");
  p("");
  p("8.3 Encerrado o contrato por qualquer motivo, o CLIENTE permanece com tudo que foi entregue, sem necessidade de anuência da AGÊNCIA e sem pagamento adicional.");

  cl(n(9), "Uso do caso para divulgação");
  p("9.1 A AGÊNCIA poderá divulgar o trabalho realizado, incluindo imagens do antes e depois dos perfis e do site, mediante autorização por escrito do CLIENTE, que pode ser negada sem qualquer efeito sobre o preço ou sobre a execução.");
  p("");
  p("9.2 A AGÊNCIA não utilizará depoimento não prestado pelo CLIENTE, não atribuirá ao CLIENTE resultado não verificado, e não usará o nome do CLIENTE em material que contenha promessa de faturamento.");

  cl(n(10), "Confidencialidade");
  p("10.1 Cada parte manterá em sigilo a informação comercial e operacional da outra a que tiver acesso, pelo prazo do contrato e por 2 (dois) anos após o seu término.");

  cl(n(11), "Vigência, renovação e rescisão");
  p(`11.1 A vigência é de ${mesesTxt}, contados do aceite deste instrumento.`);
  p("");
  p(`11.2 ${c.renovacao_automatica ? "Ao final do prazo, o contrato renova automaticamente por igual período, salvo manifestação em contrário de qualquer das partes com 15 (quinze) dias de antecedência." : "Não há renovação automática. A continuidade depende de nova contratação."}`);
  p("");
  p("11.3 Qualquer das partes pode rescindir a qualquer tempo, por escrito. Rescindido antes da conclusão do escopo, é devido o valor proporcional ao que já foi executado, e o CLIENTE permanece com o que já foi entregue.");
  p("");
  p("11.4 A AGÊNCIA poderá rescindir de imediato, sem devolução do valor proporcional ao já executado, se o CLIENTE solicitar conduta vedada pela cláusula 12.");

  cl(n(12), "Conduta vedada");
  p("12.1 A AGÊNCIA não executará, ainda que solicitada pelo CLIENTE: fabricação de avaliação, depoimento ou caso; criação de perfil em nome de terceiro; declaração de endereço ou de presença física inexistente; uso de imagem sem licença; e qualquer promessa de faturamento ou de posição em busca.");
  p("");
  p("12.2 Estas vedações decorrem de política da AGÊNCIA e de norma aplicável, incluindo, quanto a avaliação fabricada, a regra da Federal Trade Commission vigente desde 2024, que alcança quem fornece a avaliação e não apenas quem a publica.");

  cl(n(13), "Limitação de responsabilidade");
  p("13.1 A responsabilidade da AGÊNCIA limita-se ao valor efetivamente pago por este contrato.");
  p("");
  p("13.2 A AGÊNCIA não responde por: suspensão de perfil decorrente de conduta do CLIENTE; indisponibilidade de plataforma de terceiro (Google, Meta, provedor de hospedagem); alteração de algoritmo ou de política de terceiro; e resultado comercial, conforme a cláusula 6.");

  cl(n(14), "Lei aplicável e foro");
  p("14.1 Este contrato é regido pela lei brasileira.");
  p("");
  p("14.2 As partes elegem o foro da comarca de domicílio da AGÊNCIA para dirimir controvérsia, renunciando a qualquer outro.");
  p("");
  p("14.3 As partes tentarão a composição amigável por 30 (trinta) dias antes de qualquer medida judicial.");

  cl(n(15), "Aceite eletrônico");
  p("15.1 Este contrato é celebrado por aceite eletrônico. Ao digitar o nome completo e confirmar, o CLIENTE declara que leu integralmente este instrumento, que concorda com todas as cláusulas, e que possui poderes para contratar.");
  p("");
  p("15.2 O aceite registra data e hora, endereço de rede de origem, nome digitado e a versão exata do texto exibido, e essa informação é a prova da contratação.");
  p("");
  p(`15.3 As partes reconhecem a validade da forma eletrônica, na forma do art. 10, §2º, da Medida Provisória 2.200-2/2001 e da legislação americana aplicável (ESIGN Act e UETA).`);

  p("");
  p("=".repeat(64));
  p(`Data de emissão: ${dataLonga(c.contrato_enviado_em)}`);
  if (c.contrato_aceito_em) {
    p("");
    p("ACEITO ELETRONICAMENTE");
    p(`Nome digitado: ${c.contrato_aceito_nome || ""}`);
    p(`Data e hora: ${new Date(c.contrato_aceito_em).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })} (horário de Brasília)`);
    p(`Origem: ${c.contrato_aceito_ip || ""}`);
    p(`Versão aceita: ${c.contrato_versao || VERSAO_CONTRATO}`);
    if (c.contrato_hash) p(`Impressão do texto (SHA-256): ${c.contrato_hash}`);
  } else {
    p("");
    p("AGUARDANDO ACEITE DO CLIENTE");
  }
  return L.join("\n");
}

/* Impressão digital do texto exato que o cliente leu. Sem isso, editar o
   contrato depois tornaria o aceite anterior impossível de interpretar: não
   haveria como dizer com qual redação a pessoa concordou. */
export async function hashDoTexto(txt) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

/* O contrato em HTML, para leitura na tela. Monta a partir do MESMO texto que
   vai para o hash: se a tela mostrasse uma coisa e o hash guardasse outra, o
   registro de aceite não provaria nada. */
export function contratoEmHTML(txt) {
  const linhas = txt.split("\n");
  let h = "", emLista = false;
  const fechar = () => { if (emLista) { h += "</div>"; emLista = false; } };
  for (const l of linhas) {
    const t = l.trim();
    if (!t) { fechar(); continue; }
    if (/^=+$/.test(t)) { fechar(); h += '<hr class="ct-hr">'; continue; }
    if (/^\d+\.\s[A-ZÀ-Ú]/.test(t)) {            // título de cláusula
      fechar(); h += `<h3 class="ct-h">${esc(t)}</h3>`; continue;
    }
    if (/^CONTRATO DE/.test(t)) { fechar(); h += `<h2 class="ct-t">${esc(t)}</h2>`; continue; }
    if (/^(ACEITO ELETRONICAMENTE|AGUARDANDO ACEITE)/.test(t)) {
      fechar(); h += `<p class="ct-sel">${esc(t)}</p>`; continue;
    }
    if (/^\d+\.\d+\s/.test(t)) {                 // item numerado
      if (!emLista) { h += '<div class="ct-itens">'; emLista = true; }
      const [num, ...resto] = t.split(/\s+/);
      h += `<p class="ct-i"><b>${esc(num)}</b> ${esc(resto.join(" "))}</p>`;
      continue;
    }
    fechar(); h += `<p class="ct-p">${esc(t)}</p>`;
  }
  fechar();
  return h;
}
