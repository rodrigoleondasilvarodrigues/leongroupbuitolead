/* Carrega o admin num navegador simulado e confere que ele MONTA.
   O teste de sintaxe pega o script quebrado; este pega o que compila e
   mesmo assim não desenha nada. Rode com: node testes/admin.mjs        */
import { ADMIN_HTML } from "../src/admin.js";
import { JSDOM } from "jsdom";

let ok = 0, mal = 0;
const t = (n, c, d = "") => { c ? (ok++, console.log(`  \x1b[32mv\x1b[0m ${n}${d ? "  -> " + d : ""}`))
                                : (mal++, console.log(`  \x1b[31mX\x1b[0m ${n}${d ? "  -> " + d : ""}`)) };

const PAINEL = {
  leads: [{ id: 1, nome: "Marcos Ribeiro", empresa: "Ribeiro Hardwood Flooring LLC",
    telefone: "+15085550142", nicho: "Flooring", cidade: "Framingham", estado: "MA",
    pipeline: "leads_novos", coluna: "super_hot", entrou_coluna_em: new Date().toISOString(),
    observacoes: "Onde atende: Framingham, MA" }],
  clientes: [], pipelines: {
    leads_novos: [["responderam","Responderam"],["super_hot","Super Hot"],["hot","Hot"],
                  ["warm","Warm"],["cold","Cold"],["super_cold","Super Cold"]],
    agendamento: [["call_agendado","Call Agendado"],["fechou","Fechou"]],
    recuperacao: [["recuperacao","Recuperação"]], nutricao: [["nutricao","Nutrição"]] },
  ativacoes: { super_hot: 10, hot: 7, warm: 5, cold: 3, super_cold: 2, responderam: 0 },
  catalogo: [["ligacao","Ligação"],["audio","Áudio"],["comprovante_falso","Comprovante de Zelle falso"]],
  entregaveis: [["gmb","Google Meu Negócio"],["site","Site"],["instagram","Instagram"],["logo","Logo"]],
  kpis: { etapas: { whatsapp: 1, ligacao_atendida: 0, call_marcada: 0, call_comparecida: 0, call_fechada: 0 }, alertas: [] },
};
const LEAD = { ...PAINEL.leads[0], ativacoes: [], eventos: [], mensagens: [],
  rapport: "", budget: "", authority: "", need: "", timeline: "", fuso: "" };

const erros = [];
const dom = new JSDOM(ADMIN_HTML, { runScripts: "dangerously", url: "https://leon-group.workers.dev/",
  pretendToBeVisual: true,
  beforeParse(w) {
    w.fetch = (u) => Promise.resolve({ json: () => Promise.resolve(
      String(u).startsWith("/api/painel") ? PAINEL :
      String(u).startsWith("/api/lead?") ? LEAD : { ok: true }) });
    w.alert = (m) => { w.__alert = m; };
    w.confirm = () => true;
    w.addEventListener("error", (e) => erros.push(String(e.error || e.message)));
  } });
const w = dom.window, doc = w.document;
const $ = (s) => doc.querySelector(s), $$ = (s) => [...doc.querySelectorAll(s)];

setTimeout(async () => {
  console.log("\n\x1b[1m=== 1. O SCRIPT RODOU ===\x1b[0m");
  t("nenhum erro de JS", erros.length === 0, erros.join(" | ") || "limpo");
  t("funções principais existem",
    ["carregar","pintar","tique","blocoRelogio","fusoDe","abrirLead","abrirConfig"]
      .every((f) => typeof w[f] === "function"),
    ["carregar","pintar","tique","blocoRelogio","fusoDe","abrirLead","abrirConfig"]
      .filter((f) => typeof w[f] !== "function").join(", ") || "todas");

  console.log("\n\x1b[1m=== 2. O RELÓGIO DO TOPO ===\x1b[0m");
  t("seletor de praça preenchido", $("#rel_cidade").options.length === 19,
    $("#rel_cidade").options.length + " cidades");
  t("Boston é o padrão", $("#rel_cidade").options[0].textContent === "Boston, MA");
  const hEua = $("#h_eua").textContent, hBsb = $("#h_bsb").textContent;
  t("hora dos EUA saiu do placeholder", /\d/.test(hEua) && hEua !== "--:--:--", hEua);
  t("hora de Brasília saiu do placeholder", /\d/.test(hBsb) && hBsb !== "--:--:--", hBsb);
  t("horas são diferentes entre as praças", hEua !== hBsb, `${hEua} vs ${hBsb}`);
  t("dia da semana em português", /-feira|sábado|domingo/i.test($("#d_eua").textContent), $("#d_eua").textContent);
  t("badge da janela do motor preenchida", $("#rel_badge").textContent.length > 5, $("#rel_badge").textContent);
  t("diferença entre praças calculada", /Brasília está [+-]\d/.test($("#rel_dif").textContent), $("#rel_dif").textContent);

  console.log("\n\x1b[1m=== 3. A MOLDURA MONTOU ===\x1b[0m");
  t("switch de setor desenhado", $$("#setores button").length === 2,
    $$("#setores button").map((b) => b.textContent.trim().split(/\s+/)[0]).join(" / "));
  t("abas do comercial desenhadas", $$("#abas button").length === 4,
    $$("#abas button").map((b) => b.textContent.trim()).join(" · "));
  t("KPIs na tela", $$(".kpi").length === 5, $$(".kpi").length + " indicadores");
  t("o lead aparece na lista", doc.body.textContent.includes("Ribeiro Hardwood Flooring"));

  console.log("\n\x1b[1m=== 4. TROCA DE SETOR ===\x1b[0m");
  w.irPara("operacional");
  await new Promise((r) => setTimeout(r, 60));
  t("selo virou Operacional", $("#selo").textContent === "Operacional", $("#selo").textContent);
  t("abas trocaram para as 6 visões", $$("#abas button").length === 6,
    $$("#abas button").map((b) => b.textContent.trim().split(" (")[0]).join(" · "));
  w.irPara("comercial");
  await new Promise((r) => setTimeout(r, 60));
  t("voltou para o comercial", $("#selo").textContent === "Comercial");

  console.log("\n\x1b[1m=== 5. RELÓGIO DENTRO DO CARD DO LEAD ===\x1b[0m");
  await w.abrirLead(1);
  await new Promise((r) => setTimeout(r, 60));
  t("painel do lead abriu", $("#painel").classList.contains("on"));
  const card = $(".rel-card");
  t("bloco de relógio existe no card", !!card);
  t("achou o fuso pelo estado MA", card && card.dataset.tz === "America/New_York", card && card.dataset.tz);
  t("mostra onde o lead está", /Framingham/.test(card.textContent), (card.querySelector(".rc-onde") || {}).textContent);
  w.tique();
  t("hora local do lead preenchida", /\d\d:\d\d/.test(card.querySelector(".rc-hora").textContent),
    card.querySelector(".rc-hora").textContent);
  t("compara com Brasília", /Brasília/.test(card.querySelector(".rc-vs").textContent),
    card.querySelector(".rc-vs").textContent.replace(/\s+/g, " ").trim());
  t("diz se pode ligar", /ligar|hora/i.test(card.querySelector(".rc-ok").textContent),
    card.querySelector(".rc-ok").textContent);
  t("MA não é marcado como estado dividido", !card.querySelector(".rc-dupla"));
  t("campos de localização editáveis", !!$("#q_cidade") && !!$("#q_estado") && !!$("#q_fuso"));
  t("cidade e estado vieram preenchidos", $("#q_cidade").value === "Framingham" && $("#q_estado").value === "MA");

  console.log("\n\x1b[1m=== 6. LEAD SEM ESTADO ===\x1b[0m");
  const semLocal = w.blocoRelogio({ nome: "X" }, "Hora do lead");
  t("explica o que falta em vez de quebrar", /Sem cidade ou estado/.test(semLocal));
  const dividido = w.blocoRelogio({ estado: "FL" }, "Hora");
  t("estado dividido vem com aviso", /mais de um fuso/.test(dividido));

  console.log("\n\x1b[1m=== 7. PAINEL DO WHATSAPP ===\x1b[0m");
  t("botão existe no cabeçalho", !!$("#btn_zap"));
  t("dialog de configuração existe", !!$("#dlgCfg") && !!$("#cfg_num") && !!$("#cfg_hora"));

  console.log(`\n${mal ? "\x1b[31m" : "\x1b[32m"}\x1b[1m${ok} passaram, ${mal} falharam\x1b[0m`);
  process.exit(mal ? 1 : 0);
}, 700);
