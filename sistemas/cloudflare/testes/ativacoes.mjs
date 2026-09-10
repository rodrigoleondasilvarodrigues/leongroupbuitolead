/* As ativações com playbook.

   O que este teste protege, em ordem de importância:

   1. OS DOIS PROMPTS DO USUÁRIO, palavra por palavra. Ele os escreveu com as
      travas de integridade dentro (o crachá "não é pagamento", a lista do que
      não pode aparecer). Alguém "melhorando" o texto tira as travas sem
      perceber, e aí o PDF vira o engodo que a regra proíbe.
   2. A ATIVAÇÃO ENGANOSA NÃO VOLTA. "Comprovante de Zelle falso" saiu do
      catálogo; se voltar, o teste falha.
   3. ABRIR NÃO É MANDAR. Abrir o playbook não pode contar como ativação feita,
      senão o checklist mente sobre o que já foi enviado.
   4. A PERSONALIZAÇÃO NÃO DEIXA PLACEHOLDER PARA TRÁS. Um "[NOME_DO_CLIENTE]"
      que escapa vira um PDF com o placeholder impresso, mandado para o cliente.
*/
import { JSDOM } from "jsdom";
import { ADMIN_HTML } from "../src/admin.js";
import * as A from "../src/ativacoes.js";

let ok = 0, mal = 0;
const t = (n, c, d = "") => { c ? (ok++, console.log("  \x1b[32mv\x1b[0m " + n + (d ? "  -> " + d : "")))
  : (mal++, console.log("  \x1b[31mX\x1b[0m " + n + (d ? "  -> " + d : ""))) };

const LEAD = {
  id: 3, nome: "Marcos Oliveira", empresa: "Oliveira Hardwood & Tile",
  nicho: "Flooring", cidade: "Framingham", estado: "MA",
  telefone: "+1 508 555 0142", pipeline: "leads_novos", coluna: "super_hot",
};

console.log("\n\x1b[1m=== 1. OS PROMPTS DO USUÁRIO, INTACTOS ===\x1b[0m");
t("o prompt do PDF está inteiro", A.PROMPT_PDF_FOLLOWUP.length > 12000,
  A.PROMPT_PDF_FOLLOWUP.length + " caracteres");
t("o prompt do céu está inteiro", A.PROMPT_CEU.length > 3500,
  A.PROMPT_CEU.length + " caracteres");

/* As travas de integridade que moram DENTRO do prompt dele. Se uma sumir, o
   gerador deixa de ser instruído a não fingir pagamento. */
const TRAVAS = [
  "FOLLOW-UP — NOT A PAYMENT",
  "Nothing in the design may falsely indicate that money was sent",
  "Do not create something that could reasonably be mistaken for evidence of a real financial transaction",
  "anything suggesting that a real financial transaction took place",
  "Do not make it tiny",
  "It must clearly communicate that this is NOT a payment",
  "TEXT ACCURACY IS MORE IMPORTANT THAN GENERATIVE IMAGE STYLIZATION",
];
for (const trava of TRAVAS)
  t("trava presente: " + JSON.stringify(trava.slice(0, 46)), A.PROMPT_PDF_FOLLOWUP.includes(trava));

t("a lista do que NÃO pode aparecer continua completa",
  ["transaction ID", "confirmation number", "account numbers", "QR codes",
   "SEND MONEY buttons", "payment receipt"].every((x) => A.PROMPT_PDF_FOLLOWUP.includes(x)));
t("o prompt do céu mantém a frase exata do follow-up",
  A.PROMPT_CEU.includes("We are waiting for your reply regarding our conversation with Leon Group - Buit To Lead."));

console.log("\n\x1b[1m=== 2. A ATIVAÇÃO ENGANOSA NÃO VOLTA ===\x1b[0m");
const tipos = A.CATALOGO.map((c) => c[0]);
t("comprovante falso fora do catálogo", !tipos.includes("comprovante_falso"), tipos.join(" "));
t("nada no catálogo tem nome de comprovante ou pagamento",
  !A.CATALOGO.some((c) => /comprovante|pagamento|payment|pix|zelle/i.test(c[1])));
t("o PDF de follow-up honesto entrou no lugar", tipos.includes("pdf_followup"));
t("dez ativações no catálogo", A.CATALOGO.length === 10, String(A.CATALOGO.length));

console.log("\n\x1b[1m=== 3. PERSONALIZAÇÃO SEM DEIXAR PLACEHOLDER ===\x1b[0m");
const pb = A.playbookDe("pdf_followup", LEAD);
t("o playbook do PDF existe", !!pb);
const pdfTxt = pb.prompts[0].texto;
t("nenhum [NOME_DO_CLIENTE] escapou", !pdfTxt.includes("[NOME_DO_CLIENTE]"));
t("nenhum [EMPRESA_DO_CLIENTE] escapou", !pdfTxt.includes("[EMPRESA_DO_CLIENTE]"));
t("o nome do lead entrou", pdfTxt.includes("Marcos Oliveira"));
t("a empresa entrou", pdfTxt.includes("Oliveira Hardwood & Tile"));
t("o nome do arquivo final também personalizou",
  pdfTxt.includes("Marcos Oliveira / Oliveira Hardwood & Tile"));
t("as travas sobreviveram à personalização",
  TRAVAS.every((x) => pdfTxt.includes(x)));

const pbFoto = A.playbookDe("foto_unica", LEAD);
t("a foto de visualização única tem o prompt do céu", !!pbFoto && pbFoto.prompts.length === 1
  && /cloud/i.test(pbFoto.prompts[0].texto));
t("e ele também personalizou", pbFoto.prompts[0].texto.includes("Marcos Oliveira")
  && !pbFoto.prompts[0].texto.includes("[CLIENT NAME]"));

/* Nenhum playbook pode chegar na tela com placeholder cru: é o que vira um
   WhatsApp mandado com "{{NOME}}" no meio. */
let sobrou = [];
for (const [tipo] of A.CATALOGO) {
  const x = A.playbookDe(tipo, LEAD);
  if (!x) continue;
  const tudo = [x.texto_pt, x.texto_en, x.roteiro_audio, x.direcao_visual,
                ...x.prompts.map((p) => p.texto)].join(" ");
  const m = tudo.match(/\{\{[A-Z_]+\}\}|\[(NOME_DO_CLIENTE|EMPRESA_DO_CLIENTE|CLIENT NAME|COMPANY NAME)\]/g);
  if (m) sobrou.push(tipo + ": " + [...new Set(m)].join(","));
}
t("nenhum placeholder sobrou em nenhum playbook", sobrou.length === 0,
  sobrou.join(" | ") || "todos limpos");

console.log("\n\x1b[1m=== 4. TODA ATIVAÇÃO TEM PLAYBOOK ===\x1b[0m");
const sem = A.CATALOGO.filter(([tipo]) => !A.playbookDe(tipo, LEAD)).map((c) => c[0]);
t("nenhuma ativação sem playbook", sem.length === 0, sem.join(", ") || "todas cobertas");
const magros = A.CATALOGO.filter(([tipo]) => {
  const x = A.playbookDe(tipo, LEAD);
  return x && (!x.quando_usar || !x.por_que || !x.nao_fazer.length);
}).map((c) => c[0]);
t("toda ativação diz quando usar, por que e o que não fazer",
  magros.length === 0, magros.join(", ") || "todas completas");
const semConteudo = A.CATALOGO.filter(([tipo]) => {
  const x = A.playbookDe(tipo, LEAD);
  return x && !x.texto_pt && !x.roteiro_audio && !x.direcao_visual
    && !x.prompts.length && !(x.emojis || []).length;
}).map((c) => c[0]);
t("nenhuma ativação abre vazia", semConteudo.length === 0,
  semConteudo.join(", ") || "todas com conteúdo");

console.log("\n\x1b[1m=== 5. FOLLOW-UP NÃO É VENDA ===\x1b[0m");
/* A regra da casa: a ativação reabre a conversa, não vende. Preço, proposta e
   oferta dentro de uma mensagem de follow-up quebram o método. */
const PROIBIDO = [
  [/\bUS\$\s*[\d.,]+|\bR\$\s*[\d.,]+|\$\s?\d{3,}/, "preço"],
  [/\bproposta\b|\bplano de\b|\bcontrato\b/i, "proposta ou contrato"],
  [/\bdesconto\b|\bpromo(ção|cao)\b|\búltima chance\b|\bvaga(s)? limitada/i, "pressão ou desconto"],
  [/garanto que|garantimos|vai faturar|primeira página do google/i, "promessa de resultado"],
];
let vendendo = [];
for (const [tipo] of A.CATALOGO) {
  const x = A.playbookDe(tipo, LEAD);
  if (!x) continue;
  const msg = [x.texto_pt, x.texto_en, x.roteiro_audio].filter(Boolean).join(" ");
  for (const [re, nome] of PROIBIDO)
    if (re.test(msg)) vendendo.push(tipo + " (" + nome + ")");
}
t("nenhuma mensagem oferta, precifica ou pressiona", vendendo.length === 0,
  vendendo.join(" | ") || "limpo");

console.log("\n\x1b[1m=== 6. SEM TRAVESSÃO NO TEXTO EM PORTUGUÊS ===\x1b[0m");
/* Regra permanente do usuário. A exceção é o crachá em inglês dentro do
   prompt dele, que é string exigida como exata. */
let comTravessao = [];
for (const [tipo] of A.CATALOGO) {
  const x = A.playbookDe(tipo, LEAD);
  if (!x) continue;
  const pt = [x.quando_usar, x.por_que, x.texto_pt, x.roteiro_audio,
              x.direcao_visual, ...(x.nao_fazer || [])].filter(Boolean).join(" ");
  if (pt.includes("—")) comTravessao.push(tipo);
}
t("nenhum travessão no conteúdo em português", comTravessao.length === 0,
  comTravessao.join(", ") || "limpo");
t("o crachá em inglês do prompt do usuário mantém o travessão dele",
  A.PROMPT_PDF_FOLLOWUP.includes("FOLLOW-UP — NOT A PAYMENT"));

console.log("\n\x1b[1m=== 7. O CHECKLIST DERIVA, NÃO DUPLICA ===\x1b[0m");
const semNada = A.checklist({}, LEAD);
t("lead novo: nada feito", semNada.every((x) => !x.feito && x.vezes === 0));
t("uma linha por ativação do catálogo", semNada.length === A.CATALOGO.length);

const comHistorico = A.checklist({
  ligacao: { n: 2, ultima: "2026-09-09T10:00:00Z", respostas: 1, aberto: null },
  emoji: { n: 1, ultima: "2026-09-08T18:00:00Z", respostas: 0, aberto: null },
  audio: { n: 1, ultima: "2026-09-09T12:00:00Z", respostas: 0, aberto: "2026-09-09T12:00:00Z" },
}, LEAD);
const porTipo = Object.fromEntries(comHistorico.map((x) => [x.tipo, x]));
t("ligação conta 2 envios", porTipo.ligacao.feito && porTipo.ligacao.vezes === 2);
t("e registra que teve resposta", porTipo.ligacao.respostas === 1);
/* O ponto central: aberto e não registrado NÃO conta como feito. */
t("áudio aberto e não mandado NÃO conta como feito", !porTipo.audio.feito,
  "vezes=" + porTipo.audio.vezes);
t("mas fica marcado como aberto sem mandar", porTipo.audio.aberto_sem_mandar);
t("o que nunca foi tocado segue em branco", !porTipo.figurinha.feito);
const r = A.resumoChecklist(comHistorico);
t("o resumo conta só o que foi mandado", r.feitos === 2, JSON.stringify(r));
t("e soma as respostas", r.respostas === 1);
t("não diz que esgotou o catálogo", !r.esgotou);

console.log("\n\x1b[1m=== 8. LEAD SEM EMPRESA AVISA ANTES DE GASTAR GERAÇÃO ===\x1b[0m");
const magro = A.playbookDe("pdf_followup", { id: 9, nome: "João" });
t("detecta que falta a empresa", magro.falta.includes("empresa do lead"),
  magro.falta.join(", "));
t("e o prompt sai com o campo vazio, não com o placeholder",
  !magro.prompts[0].texto.includes("[EMPRESA_DO_CLIENTE]"));

console.log("\n\x1b[1m=== 9. A TELA ===\x1b[0m");
const CHECK = A.checklist({ ligacao: { n: 1, ultima: "2026-09-09T10:00:00Z", respostas: 1 } }, LEAD);
const PAINEL = {
  leads: [{ ...LEAD, entrou_coluna_em: "2026-09-09T09:00:00Z", arquivado: 0 }],
  clientes: [],
  pipelines: { leads_novos: [["super_hot", "Super Hot"]], agendamento: [], recuperacao: [], nutricao: [] },
  ativacoes: { super_hot: 10 },
  catalogo: A.CATALOGO,
  entregaveis: [["gmb", "Google Meu Negócio"]],
  kpis: { etapas: {}, alertas: [] },
};
const LEAD_API = { ...LEAD, ativacoes: [], eventos: [], mensagens: [],
  checklist_ativacoes: CHECK, ativacao_falta: [] };

const erros = [];
const dom = new JSDOM(ADMIN_HTML, { runScripts: "dangerously", pretendToBeVisual: true,
  url: "https://leon-group.workers.dev/",
  beforeParse(w) {
    w.fetch = (u) => Promise.resolve({ ok: true, json: () => Promise.resolve(
      String(u).startsWith("/api/painel") ? PAINEL :
      String(u).startsWith("/api/lead?") ? LEAD_API :
      String(u).startsWith("/api/ativacao-playbook") ? A.playbookDe(
        new URL(u, "https://x/").searchParams.get("tipo"), LEAD) :
      { ok: true }) });
    w.alert = (m) => { w.__alert = m };
    w.confirm = () => true;
    w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
    Object.defineProperty(w.navigator, "clipboard", {
      value: { writeText: (x) => { w.__copiado = x; return Promise.resolve() } }, configurable: true });
    w.addEventListener("error", (e) => erros.push(e.message));
  } });
const w = dom.window, doc = w.document;
const $ = (s) => doc.querySelector(s), $$ = (s) => [...doc.querySelectorAll(s)];
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

await espera(160);
w.abrirLead(3);
await espera(200);

t("nenhum erro de JS ao abrir o lead", erros.length === 0, erros[0] || "limpo");
t("o checklist desenhou", $$(".at-l").length === 10, $$(".at-l").length + " linhas");
t("agrupado", $$(".at-grupo").length === 4,
  $$(".at-grupo > b").map((x) => x.textContent).join(" · "));
t("a ligação aparece como feita", $("#atl_ligacao").classList.contains("feito"));
t("com a marca de resposta", !!$("#atl_ligacao .at-resp"));
t("as não usadas ficam em branco", !$("#atl_emoji").classList.contains("feito"));
t("o cabeçalho mostra a cota da coluna", /10 por dia/.test($(".at-cab").textContent),
  $(".at-cab .cota").textContent);
t("e o progresso do catálogo", /1.*\/.*10 usadas/.test($(".at-cab .prog").textContent),
  $(".at-cab .prog").textContent.trim());
t("nenhum botão da grade antiga sobrou", !$(".grid button[onclick^=\"ativ(\"]"));

console.log("\n\x1b[1m=== 10. CLICAR ABRE O PLAYBOOK ===\x1b[0m");
w.atAbrir("pdf_followup");
await espera(200);
const linha = $("#atl_pdf_followup");
t("a linha abriu", linha.classList.contains("abre"));
const corpo = $("#atc_pdf_followup");
t("mostra quando usar", /Quando usar/.test(corpo.textContent));
t("mostra o prompt pronto", !!corpo.querySelector(".at-prompt"));
t("diz o que o gerador devolve", /devolve: PDF/.test(corpo.textContent),
  (corpo.querySelector(".saida") || {}).textContent);
t("diz onde colar", /ChatGPT|Claude/.test(corpo.textContent));
t("tem botão de copiar o prompt inteiro",
  !!$$(".at-prompt .acao").find((b) => /Copiar o prompt/.test(b.textContent)));
t("mostra o tamanho do prompt", /caracteres/.test(corpo.textContent));
t("tem o botão de registrar", !!$$(".at-fim .acao").find((b) => /Mandei/.test(b.textContent)));
t("lista o que não fazer", !!corpo.querySelector(".at-nao"));

console.log("\n\x1b[1m=== 11. COPIAR ENTREGA O TEXTO CERTO ===\x1b[0m");
const btPrompt = $$(".at-prompt .acao").find((b) => /Copiar o prompt/.test(b.textContent));
btPrompt.click();
await espera(80);
t("copiou o prompt inteiro", (w.__copiado || "").length > 12000,
  (w.__copiado || "").length + " caracteres");
t("já personalizado", (w.__copiado || "").includes("Marcos Oliveira"));
t("sem placeholder", !(w.__copiado || "").includes("[NOME_DO_CLIENTE]"));
t("com as travas de integridade dentro",
  TRAVAS.every((x) => (w.__copiado || "").includes(x)));

w.atAbrir("mensagem");
await espera(200);
const btTxt = $("#atc_mensagem .at-rot .cp");
if (btTxt) { btTxt.click(); await espera(80) }
t("copiar a mensagem entrega o texto personalizado",
  !!btTxt && (w.__copiado || "").includes("Marcos"),
  (w.__copiado || "").slice(0, 60));

console.log("\n\x1b[1m=== 12. ABRIR NÃO MARCA COMO FEITO ===\x1b[0m");
/* Abrir chama /api/ativacao-playbook, que grava uma linha ABERTA. Só o botão
   "Mandei, registrar" fecha essa linha. Na tela, a linha aberta não pode
   aparecer com o visto verde. */
t("a linha aberta não ganhou o visto de feita",
  !$("#atl_pdf_followup").classList.contains("feito"));
t("o progresso continua em 1 de 10", /1.*\/.*10 usadas/.test($(".at-cab .prog").textContent),
  $(".at-cab .prog").textContent.trim());
t("nenhum erro de JS no percurso", erros.length === 0, erros[0] || "limpo");

console.log("\n" + (mal ? "\x1b[31m" : "\x1b[32m") + "\x1b[1m" + ok
  + " passaram, " + mal + " falharam\x1b[0m");
process.exit(mal ? 1 : 0);
