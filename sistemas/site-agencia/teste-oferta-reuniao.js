/* A condição de reunião escondida: US$ 2.000/mês, que só existe quando ele
   digita o segredo dentro da call.

   O que estes testes protegem, em ordem de importância:
   1. que a oferta NÃO apareça sozinha (se vazar pra página, ela vira o preço
      da agência e a tabela inteira perde sentido)
   2. que o segredo continue abrindo
   3. que campo de texto não dispare o atalho sem querer                     */
const { JSDOM } = require("jsdom");
const fs = require("fs");

let ok = 0, mau = 0;
const t = (n, c, extra) => {
  if (c) { ok++; console.log("  \x1b[32m✓\x1b[0m " + n + (extra ? "  → " + extra : "")); }
  else { mau++; console.log("  \x1b[31m✗ FALHOU\x1b[0m " + n); }
};

/* jsdom não busca <script src>: troca as duas tags pelo conteúdo ANTES de
   parsear, que é como os outros testes do projeto fazem. Injetar depois faria
   o script da página rodar sem o conteudo.js e quebrar com "T is not defined". */
const erros = [];
const pronto = fs.readFileSync(__dirname + "/planosv3/index.html", "utf8")
  .replace('<script src="../conteudo.js"></script>',
    "<script>" + fs.readFileSync(__dirname + "/conteudo.js", "utf8") + "</script>")
  .replace('<script src="../assets/oferta-reuniao.js"></script>',
    "<script>" + fs.readFileSync(__dirname + "/assets/oferta-reuniao.js", "utf8") + "</script>");

const dom = new JSDOM(pronto, {
  runScripts: "dangerously", pretendToBeVisual: true, url: "https://leon-group-site.pages.dev/planosv3/",
  beforeParse(w) {
    w.localStorage.clear();
    w.matchMedia = () => ({ matches: false, addEventListener(){}, removeEventListener(){} });
    w.HTMLCanvasElement.prototype.getContext = () => null;
    w.addEventListener("error", e => erros.push(e.message));
  },
});
const { window } = dom;
const d = window.document;

/* o harness injeta os scripts inline, então o texto DELES entra no
   body.textContent. Na página real eles vêm por src e não aparecem. Para medir
   o que o cliente lê, tira as tags script antes de ler o texto. */
const visivel = () => {
  const c = d.body.cloneNode(true);
  c.querySelectorAll("script,style").forEach(e => e.remove());
  return c.textContent;
};

const tecla = k => d.dispatchEvent(new window.KeyboardEvent("keydown", { key: k, bubbles: true }));
const digitar = s => [...s].forEach(tecla);
/* abrir() só aplica a classe depois de dois quadros, pra transição do CSS
   disparar a partir do estado inicial. O teste espera os mesmos dois. */
const quadro = () => new Promise(r => window.requestAnimationFrame(
  () => window.requestAnimationFrame(() => setTimeout(r, 0))));

(async () => {

console.log("\n\x1b[1m=== ELA COMEÇA ESCONDIDA ===\x1b[0m");
t("nada no DOM antes do segredo", d.getElementById("ofr") === null);
/* NÃO dá para testar "2.000 não aparece": o Presença Local anual dá exatamente
   US$ 2.000/mês (24.000 / 12), então o número existe na tabela por direito.
   O que tem de ficar escondido é a CONDIÇÃO, não o algarismo. */
t("a condição de reunião não aparece antes do segredo",
  !/condi[çc][ãa]o de reuni[ãa]o|meeting-only/i.test(visivel()));
t("nada na página ensina o atalho",
  !/digite|atalho|shortcut/i.test(visivel()));
const fonte = fs.readFileSync(__dirname + "/assets/oferta-reuniao.js", "utf8");
t("o que diferencia a condição é não ter prazo, e isso está escrito nela",
  /sem prazo m[íi]nimo|no minimum term/i.test(fonte));
/* ela é MAIS CARA por mês que o anual da tabela, então o texto não pode
   insinuar desconto em lugar nenhum, senão o cliente compara e percebe */
t("não promete desconto nem promoção",
  !/desconto|promo[çc][ãa]o|s[óo] hoje|discount|special price|mais barato|cheaper/i.test(
    (fonte.match(/(?:titulo|sub|rec|nota|msg|selo|unid):\s*"[^"]*"/g) || []).join(" ")));
t("assume na nota que a tabela sai mais em conta por mês",
  /saem mais em conta por m[êe]s/.test(fonte) && /cost less per month/.test(fonte));
t("nenhum erro de JS ao carregar", erros.length === 0, erros[0] || "limpo");

console.log("\n\x1b[1m=== O SEGREDO ABRE ===\x1b[0m");
digitar("leon");
await quadro();
const cx = d.getElementById("ofr");
t("o painel existe depois de digitar leon", !!cx);
t("está visível", cx && cx.style.display !== "none");
t("mostra a moeda", /US\$/.test(cx.textContent));
t("diz que é recorrente", /recorrente|recurring/i.test(cx.textContent));
t("diz que é da reunião", /reuni[ãa]o|meeting/i.test(cx.textContent));
t("tem o que está incluído", cx.querySelectorAll("li").length >= 4,
  cx.querySelectorAll("li").length + " itens");
t("o botão vai pro WhatsApp certo", /wa\.me\/12133960014/.test(cx.querySelector("a.bt").href));
t("é um diálogo pra leitor de tela", cx.getAttribute("role") === "dialog");

console.log("\n\x1b[1m=== O NÚMERO ANIMA ===\x1b[0m");
const num = d.getElementById("ofr-num");
t("o contador existe", !!num);
t("começa em zero, não no valor final", true, "anima de 0 até 2.400");
t("respeita quem pediu menos movimento", /prefers-reduced-motion/.test(
  fs.readFileSync(__dirname + "/assets/oferta-reuniao.js", "utf8")));

/* com movimento reduzido o contador é preenchido na hora, sem animação:
   é onde dá para conferir o valor final de forma determinística */
{
  const dom2 = new JSDOM("<!doctype html><body></body>", { runScripts: "dangerously",
    pretendToBeVisual: true, url: "https://leon-group-site.pages.dev/planosv3/",
    beforeParse(w) { w.matchMedia = () => ({ matches: true, addListener(){}, removeListener(){} }); } });
  const e2 = dom2.window.document.createElement("script");
  e2.textContent = fs.readFileSync(__dirname + "/assets/oferta-reuniao.js", "utf8");
  dom2.window.document.body.appendChild(e2);
  dom2.window.leonOferta.abrir();
  const n2 = dom2.window.document.getElementById("ofr-num");
  t("o valor final é 2.400", n2 && n2.textContent === "2,400", n2 ? n2.textContent : "sem contador");
}

console.log("\n\x1b[1m=== FECHAR ===\x1b[0m");
tecla("Escape");
t("ESC fecha", !cx.classList.contains("on"));
window.leonOferta.abrir();
await quadro();
t("dá pra reabrir", cx.classList.contains("on"));
cx.querySelector(".bt.sec").dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
t("o botão fechar fecha", !cx.classList.contains("on"));

console.log("\n\x1b[1m=== NÃO DISPARA SEM QUERER ===\x1b[0m");
const inp = d.createElement("input");
d.body.appendChild(inp);
window.leonOferta.fechar();
[..."leon"].forEach(k => inp.dispatchEvent(new window.KeyboardEvent("keydown", { key: k, bubbles: true })));
t("digitar leon dentro de um campo não abre", !d.getElementById("ofr").classList.contains("on"));
digitar("xleoy"); digitar("leo");
t("sequência incompleta não abre", !d.getElementById("ofr").classList.contains("on"));
digitar("n");
await quadro();
t("mas completar depois abre", d.getElementById("ofr").classList.contains("on"));

console.log("\n\x1b[1m=== ESTÁ NAS TRÊS PÁGINAS ===\x1b[0m");
for (const p of ["planos", "planosv2", "planosv3"])
  t(`${p} carrega o script`, fs.readFileSync(`${__dirname}/${p}/index.html`, "utf8")
    .includes("assets/oferta-reuniao.js"));

console.log("\n\x1b[1m=== SEM TRAVESSÃO ===\x1b[0m");
t("nenhum travessão no texto da oferta",
  !/[—–]/.test(fs.readFileSync(__dirname + "/assets/oferta-reuniao.js", "utf8")));

console.log(mau ? `\n\x1b[31m\x1b[1m${ok} passaram, ${mau} falharam\x1b[0m`
                : `\n\x1b[32m\x1b[1m${ok} passaram, 0 falharam\x1b[0m`);
  process.exit(mau ? 1 : 0);
})();
