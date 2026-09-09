import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(aqui, "..", "..");
const req = createRequire(path.join(raiz, "sistemas", "site-agencia", "package.json"));
const { JSDOM } = req("jsdom");

const alvo = process.argv[2] || path.join(raiz, "saidas", "roteiros-anuncios.html");
const dados = JSON.parse(fs.readFileSync(path.join(raiz, "marketing/anuncios/roteiros-20.json"), "utf8"));
const html = fs.readFileSync(alvo, "utf8");

let ok = 0, mau = 0;
const t = (nome, cond) => { if (cond) { ok++; } else { mau++; console.log("  FALHA " + nome); } };

const erros = [];
const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true,
  beforeParse(w) { w.onerror = e => erros.push(String(e)); } });
const d = dom.window.document;

t("nenhum erro de JS", erros.length === 0);
if (erros.length) console.log(erros.slice(0, 3));

// estrutura
t("20 cartoes", d.querySelectorAll(".roteiro").length === 20);
t("20 caixas de script em destaque", d.querySelectorAll(".cx.destaque").length === 20);
t("3 passos por cartao", [...d.querySelectorAll(".roteiro")].every(e => e.querySelectorAll(".passo").length === 3));
t("todo cartao tem storyboard", [...d.querySelectorAll(".roteiro")].every(e => e.querySelector("table.sb")));
t("todo cartao tem botao de copiar no script",
  [...d.querySelectorAll(".cx.destaque")].every(e => e.querySelector(".copiar")));
t("storyboard tem 4 colunas", [...d.querySelectorAll("table.sb thead tr")].every(r => r.children.length === 4));

// o script na tela e identico ao do JSON
const caixas = [...d.querySelectorAll(".roteiro .cx.destaque .txt")].map(e => e.textContent.trim());
t("script da tela bate com o JSON", dados.every((r, i) => caixas[i] === r.script_arcads.trim()));

// tetos
t("todo script dentro do teto", dados.every(r => r.script_arcads.length <= (r.numero === 20 ? 400 : 600)));
t("contagem exibida bate", dados.every(r => html.includes(`${r.script_arcads.length} caracteres`)));

// b-roll: um bloco por plano
t("planos de b-roll batem com o JSON",
  [...d.querySelectorAll(".roteiro")].every((e, i) => e.querySelectorAll(".plano").length === dados[i].broll.length));

// ICP na abertura falada
const icp = /subcontractor|empres[áa]rio da constru[çc][ãa]o|home service/i;
t("ICP na abertura de todo script",
  dados.every(r => icp.test(r.script_arcads.split(/[.\n]/).slice(0, 2).join(" "))));

// regras de conteudo
t("sem travessao", !/[—–]/.test(d.body.textContent));
t("nenhuma afirmacao de presenca fisica nos EUA",
  !/\b(estou|estamos|moro|moramos)\s+(aqui\s+)?(nos estados unidos|na am[ée]rica|em boston)/i.test(d.body.textContent));
t("nenhum depoimento de cliente", !/\b(meu|nosso) cliente (faturou|fez|conseguiu|saiu de)/i.test(d.body.textContent));

// navegacao e filtros
t("filtros presentes", d.querySelectorAll(".chip").length >= 5);
t("secao da ferramenta existe", !!d.querySelector("#ferramenta"));
t("os tres modelos do Arcads citados",
  ["Omnihuman 1.5", "Audio Driven", "Arcads 1.0"].every(m => html.includes(m)));
t("frames da aula preservados", d.querySelectorAll("#referencia img").length >= 3);

// tema
t("paleta clara na raiz", /:root\{[^}]*--marfim:/.test(html));
t("tema escuro por media query", html.includes("prefers-color-scheme: dark"));
t("tema escuro por atributo", html.includes('[data-theme="dark"]'));
t("body pinta o proprio fundo", /body\{[^}]*background:var\(--marfim\)/.test(html));

// filtro funcionando
const chip = [...d.querySelectorAll(".chip")].find(c => c.dataset.f === "gravado");
chip.dispatchEvent(new dom.window.Event("click", { bubbles: true }));
const visiveis = [...d.querySelectorAll(".roteiro")].filter(e => !e.hidden);
t("filtro gravado mostra 4", visiveis.length === 4);
t("contador acompanha", d.getElementById("cont").textContent.includes("4"));

console.log(`\n${ok} passaram, ${mau} falharam`);
process.exit(mau ? 1 : 0);
