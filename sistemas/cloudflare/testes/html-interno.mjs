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
  // Os DOIS estados do formulário: com o armazenamento ligado (seletor de
  // arquivo) e desligado (só os campos de colar link). O segundo é o que está
  // no ar enquanto o R2 não é habilitado, e é o que o cliente real vê hoje.
  ["paginas.js · formularioHTML (upload ligado)", formularioHTML({
    id: 1, empresa: "Teste", nome_contato: "Fulano", formulario_token: "tok" }, "tok",
    { upload: true })],
  ["paginas.js · formularioHTML (upload desligado)", formularioHTML({
    id: 1, empresa: "Teste", nome_contato: "Fulano", formulario_token: "tok" }, "tok",
    { upload: false })],
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

/* Cada estado tem que oferecer o caminho que FUNCIONA, e só ele. Oferecer o
   seletor de arquivo sem armazenamento faz o cliente achar que o celular dele
   está com problema; esconder o campo de link quando não há upload deixa ele
   sem caminho nenhum. */
const ligado = formularioHTML({ id: 1, empresa: "T", formulario_token: "t" }, "t", { upload: true });
const desligado = formularioHTML({ id: 1, empresa: "T", formulario_token: "t" }, "t", { upload: false });
const checa = (rot, cond) => { cond ? (ok++, console.log(`  \x1b[32mv\x1b[0m ${rot}`))
                                    : (mal++, console.log(`  \x1b[31mX\x1b[0m ${rot}`)) };
console.log();
checa("upload ligado: tem seletor de arquivo", /type="file"/.test(ligado));
checa("upload ligado: campo de link fica recolhido como alternativa",
  /<details class="oureg">/.test(ligado));
checa("upload ligado: PODE_SUBIR=true no script", /var PODE_SUBIR=true/.test(ligado));
checa("upload DESLIGADO: nenhum seletor de arquivo", !/type="file"/.test(desligado));
checa("upload DESLIGADO: campo de link das fotos aberto",
  /id="fotos"/.test(desligado) && !/<details class="oureg">/.test(desligado));
checa("upload DESLIGADO: campo de link dos vídeos aberto", /id="videos"/.test(desligado));
checa("upload DESLIGADO: campo de link da logo aberto", /id="logo_url"/.test(desligado));
checa("upload DESLIGADO: explica como deixar a pasta pública",
  /deixe a pasta[\s\S]{0,20}<b>pública<\/b>/.test(desligado));
checa("upload DESLIGADO: PODE_SUBIR=false no script", /var PODE_SUBIR=false/.test(desligado));
checa("os dois estados mantêm o contador de fotos", /id="conta_foto"/.test(ligado)
  && /id="conta_foto"/.test(desligado));

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
