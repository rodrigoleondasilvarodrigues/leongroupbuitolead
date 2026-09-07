/* Valida o JS que vive DENTRO das template strings de HTML.
   `node --check src/admin.js` NÃO pega isso: para ele, todo o HTML é
   uma string. Foi assim que uma regex quebrada derrubou o admin inteiro
   em produção: dentro de template string \s vira s e \/ vira /, então
   [,\s\-\/] chegou no navegador como [,s-/], que é intervalo inválido.
   Rode com: node testes/html-interno.mjs                              */
import { ADMIN_HTML } from "../src/admin.js";
import { LOGIN_HTML, formularioHTML, aguardandoHTML, jaRespondidoHTML } from "../src/paginas.js";
import vm from "node:vm";

const alvos = [
  ["admin.js · ADMIN_HTML", ADMIN_HTML],
  ["paginas.js · LOGIN_HTML", LOGIN_HTML],
  ["paginas.js · formularioHTML", formularioHTML({
    id: 1, empresa: "Teste", nome_contato: "Fulano", formulario_token: "tok" }, 11)],
  ["paginas.js · aguardandoHTML", typeof aguardandoHTML === "function" ? aguardandoHTML({ empresa: "T" }) : aguardandoHTML],
  ["paginas.js · jaRespondidoHTML", typeof jaRespondidoHTML === "function" ? jaRespondidoHTML({ empresa: "T" }) : jaRespondidoHTML],
];

let ok = 0, mal = 0;
for (const [rot, html] of alvos) {
  if (typeof html !== "string") { console.log(`  ? ${rot}: não é string, pulando`); continue; }
  const blocos = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (!blocos.length) { console.log(`  · ${rot}: sem script embutido`); ok++; continue; }
  let falhou = false;
  blocos.forEach((js, i) => {
    try { new vm.Script(js); }
    catch (e) {
      falhou = true;
      const linha = Number((e.stack.match(/evalmachine[^:]*:(\d+)/) || [])[1] || 0);
      const trecho = js.split("\n")[linha - 1] || "";
      console.log(`  \x1b[31mX\x1b[0m ${rot} (bloco ${i + 1}) linha ${linha}`);
      console.log(`      ${e.message}`);
      if (trecho) console.log(`      ${trecho.trim().slice(0, 110)}`);
    }
  });
  if (falhou) mal++; else { ok++; console.log(`  \x1b[32mv\x1b[0m ${rot}: ${blocos.length} bloco(s), sintaxe válida`); }
}

// Barra invertida comida pela template string é o erro clássico aqui.
// Uma regex correta quase nunca tem [,s- ou :s* depois da interpolação.
const suspeitos = [];
for (const [rot, html] of alvos) {
  if (typeof html !== "string") continue;
  for (const m of html.matchAll(/\/[^\/\n]*\[[^\]\n]*[a-z]-[\/.][^\]\n]*\][^\/\n]*\/[gimsuy]*/g))
    suspeitos.push(`${rot}: ${m[0].slice(0, 60)}`);
}
if (suspeitos.length) {
  mal++;
  console.log(`  \x1b[31mX\x1b[0m regex com intervalo suspeito (barra invertida comida?)`);
  suspeitos.forEach((x) => console.log("      " + x));
} else {
  ok++;
  console.log("  \x1b[32mv\x1b[0m nenhuma regex com intervalo suspeito");
}

console.log(`\n${mal ? "\x1b[31m" : "\x1b[32m"}\x1b[1m${ok} passaram, ${mal} falharam\x1b[0m`);
process.exit(mal ? 1 : 0);
