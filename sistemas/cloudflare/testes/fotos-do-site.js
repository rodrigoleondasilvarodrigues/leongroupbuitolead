/* As fotos do site vêm de dois lugares e já saiu site sem foto nenhuma por a
   geração olhar só um deles. Este teste tranca o comportamento. */
import { fotosDoCliente } from "../src/geradores.js";

let ok = 0, mal = 0;
const t = (rot, cond, extra) => {
  cond ? (ok++, console.log(`  \x1b[32mv\x1b[0m ${rot}${extra ? `  -> ${extra}` : ""}`))
       : (mal++, console.log(`  \x1b[31mX\x1b[0m ${rot}${extra ? `  -> ${extra}` : ""}`));
};
const RAIZ = "https://leon-group.leongroup.workers.dev";

console.log("\n\x1b[1m=== 1. AS DUAS FONTES ENTRAM ===\x1b[0m");
const dois = fotosDoCliente({
  subidas: ["/m/c1/aaaa.jpg", "/m/c1/bbbb.jpg"],
  coladas: ["https://drive.google.com/x.jpg"],
  raiz: RAIZ,
});
t("as três fotos aparecem", dois.length === 3, dois.length + " fotos");
t("nenhuma foto some quando só há coladas",
  fotosDoCliente({ coladas: ["https://a.com/1.jpg"], raiz: RAIZ }).length === 1);
t("nem quando só há subidas",
  fotosDoCliente({ subidas: ["/m/c1/a.jpg"], raiz: RAIZ }).length === 1);
t("sem foto nenhuma devolve lista vazia, não quebra",
  fotosDoCliente({ raiz: RAIZ }).length === 0);

console.log("\n\x1b[1m=== 2. URL ABSOLUTA, SEMPRE ===\x1b[0m");
/* O site é publicado no Vercel. Um `/m/...` relativo resolveria contra o
   domínio do Vercel, onde a imagem não existe: site no ar com tudo quebrado. */
t("a foto subida ganha o domínio do Worker",
  dois[0] === RAIZ + "/m/c1/aaaa.jpg", dois[0]);
t("nenhuma URL relativa sobra na lista",
  dois.every((u) => /^https?:\/\//.test(u)), dois.join(" "));
t("o link já absoluto passa intacto",
  dois[2] === "https://drive.google.com/x.jpg", dois[2]);
t("raiz com barra no fim não gera barra dobrada",
  fotosDoCliente({ subidas: ["/m/c1/a.jpg"], raiz: RAIZ + "/" })[0]
    === RAIZ + "/m/c1/a.jpg",
  fotosDoCliente({ subidas: ["/m/c1/a.jpg"], raiz: RAIZ + "/" })[0]);
t("sem raiz, a subida é descartada em vez de virar link quebrado",
  fotosDoCliente({ subidas: ["/m/c1/a.jpg"], raiz: "" }).length === 0);

console.log("\n\x1b[1m=== 3. ORDEM: A CAPA DO SITE ===\x1b[0m");
/* A primeira foto da lista vira o hero, que domina a tela. Foto subida do
   celular é a que o cliente escolheu a dedo; link colado vem em ordem de
   pasta. Então subida vem primeiro. */
t("subidas vêm antes das coladas",
  dois[0].includes("/m/") && dois[1].includes("/m/")
  && dois[2].includes("drive.google"), dois.map((u) => u.slice(-9)).join(" "));
t("a ordem entre as subidas é preservada",
  dois[0].endsWith("aaaa.jpg") && dois[1].endsWith("bbbb.jpg"));

console.log("\n\x1b[1m=== 4. LIXO NÃO ENTRA ===\x1b[0m");
const sujo = fotosDoCliente({
  subidas: ["/m/c1/ok.jpg", "", null, undefined],
  coladas: ["https://a.com/1.jpg", "  ", "nao-e-url", "javascript:alert(1)",
            "ftp://a.com/x.jpg", "https://a.com/1.jpg"],
  raiz: RAIZ,
});
t("vazio, nulo e indefinido caem fora", !sujo.some((u) => !u));
t("texto que não é URL cai fora", !sujo.some((u) => u.includes("nao-e-url")));
t("javascript: cai fora", !sujo.some((u) => /javascript:/i.test(u)),
  sujo.filter((u) => /javascript/i.test(u)).join("") || "nenhum");
t("protocolo que o navegador não carrega em <img> cai fora",
  !sujo.some((u) => /^ftp:/i.test(u)));
t("foto repetida entra uma vez só", sujo.length === 2, sujo.join(" "));

console.log(mal ? `\n\x1b[31m\x1b[1m${ok} passaram, ${mal} falharam\x1b[0m`
                : `\n\x1b[32m\x1b[1m${ok} passaram, 0 falharam\x1b[0m`);
process.exit(mal ? 1 : 0);
