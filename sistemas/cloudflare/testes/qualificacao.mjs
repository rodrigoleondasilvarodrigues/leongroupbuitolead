/* O roteiro da ligação de qualificação, extraído da Aula 03.
   Protege três coisas: que o roteiro continue completo, que ele não invente
   equipe que não existe, e que a confirmação ao vivo não seja silenciosamente
   removida, que é a parte que ataca o no-show. */
import { ROTEIRO, CONFIRMACAO, FECHO, preencher } from "../src/conteudo-qualificacao.js";
import { CSS_QUAL, JS_QUAL } from "../src/admin-qualificacao.js";
import { ADMIN_HTML } from "../src/admin.js";
import fs from "node:fs";
import vm from "node:vm";

let ok = 0, mau = 0;
const t = (n, c) => { if (c) ok++; else { mau++; console.log("  FALHA " + n); } };

// ── o roteiro cobre a sequência da aula ──
t("tem as 11 etapas", ROTEIRO.length === 11);
t("etapas numeradas de 1 a 11", ROTEIRO.every((e, i) => e.n === i + 1));
t("toda etapa tem fala", ROTEIRO.every(e => e.fala && e.fala.trim()));
t("toda etapa tem nome", ROTEIRO.every(e => e.etapa && e.etapa.trim()));

const etapas = ROTEIRO.map(e => e.etapa.toLowerCase()).join(" ");
for (const parte of ["abertura", "budget", "rapport", "need", "timeline", "authority", "agendar"])
  t(`cobre ${parte}`, etapas.includes(parte));

// ── BANT completo, e cada campo existe na tabela leads ──
const campos = ROTEIRO.filter(e => e.campo).map(e => e.campo);
for (const c of ["budget", "authority", "need", "timeline", "rapport"])
  t(`captura ${c}`, campos.includes(c));
const schema = fs.readFileSync(new URL("../schema.sql", import.meta.url), "utf8");
const mig = fs.readFileSync(new URL("../migracao-15-confirmacao-ao-vivo.sql", import.meta.url), "utf8");
t("todo campo capturado existe na tabela leads",
  campos.every(c => new RegExp(`\\b${c}\\b`).test(schema)));
t("a migração 15 cria confirmacao_ao_vivo", /confirmacao_ao_vivo/.test(mig));

// ── as marcas registradas da aula ──
t("ancora o budget em 10 mil", ROTEIRO.some(e => /10 mil d[óo]lares/i.test(e.fala)));
t("pergunta pelo decisor", ROTEIRO.some(e => /s[óo]cio|decidir/i.test(e.fala)));
t("call de 40 minutos", ROTEIRO.some(e => /40 minutos/.test(e.fala)));
t("oferece janela fechada, nunca pergunta aberta",
  ROTEIRO.some(e => /Qual que fica melhor/i.test(e.fala)));
t("avisa para nunca passar de 2 dias",
  ROTEIRO.some(e => /dois dias|2 dias/i.test(e.dica || "")));
t("lembra que o script é âncora e não robô",
  JS_QUAL.includes("âncora, não robô"));

// ── confirmação ao vivo: a parte que segura o no-show ──
t("seis passos de confirmação", CONFIRMACAO.length === 6);
const ids = CONFIRMACAO.map(c => c.id);
for (const i of ["viva_voz", "abriu_zap", "recebeu", "email", "meet", "presenca"])
  t(`confirmação tem ${i}`, ids.includes(i));
t("toda confirmação traz a fala pronta", CONFIRMACAO.every(c => c.fala && c.fala.trim()));
t("explica o Meet sem exigir conta", CONFIRMACAO.some(c => /não precisa criar conta/i.test(c.fala)));

// ── integridade: a adaptação para operação solo ──
const tudo = [...ROTEIRO.map(e => [e.fala, e.dica, e.porque].join(" ")),
              ...CONFIRMACAO.map(c => c.fala), FECHO].join(" ");
t("não inventa time preparando o plano", !/meus meninos|minha equipe|meu time/i.test(tudo));
t("não inventa um closer", !/quem vai conduzir/i.test(tudo));
t("o compromisso fala do trabalho real", /diagn[óo]stico/i.test(
  CONFIRMACAO.find(c => c.id === "presenca").fala));
t("nenhum travessão", !/[—–]/.test(tudo));

// ── substituição de variáveis ──
const l = { nome: "Pedro Alves", empresa: "Alves Remodeling", nicho: "remodeling" };
t("usa o primeiro nome", preencher("Fala, {primeiro}.", l) === "Fala, Pedro.");
t("usa a empresa", preencher("{empresa}", l) === "Alves Remodeling");
t("tem padrão quando falta dado", preencher("{primeiro} {empresa}", {}) === "amigo sua empresa");
t("não sobra placeholder no roteiro renderizado",
  !/\{(primeiro|empresa|palpite|janela)\}/.test(ROTEIRO.map(e => preencher(e.fala, l)).join(" ")));

// ── o JS que vai pra tela compila e está ligado ──
t("JS_QUAL compila", (() => {
  try { new vm.Script("function esc(s){return s}\n" + JS_QUAL); return true; } catch { return false; }
})());
t("define l_roteiro", /function l_roteiro/.test(JS_QUAL));
t("define rqConfirmacao", /function rqConfirmacao/.test(JS_QUAL));
t("regex de espaço sobreviveu ao escape", JS_QUAL.includes("\\s+"));
t("o admin chama l_roteiro", /l_roteiro\(l\)/.test(ADMIN_HTML));
t("o CSS do roteiro entrou no admin", ADMIN_HTML.includes(".rq-fala"));
t("a seção antiga de BANT em branco saiu", !/Qualifica[çc][ãa]o BANT/.test(ADMIN_HTML));
t("qual() manda a confirmação ao vivo", /confirmacao_ao_vivo:rqConfirmacao\(\)/.test(ADMIN_HTML));

console.log(`\n${ok} passaram, ${mau} falharam`);
process.exit(mau ? 1 : 0);
