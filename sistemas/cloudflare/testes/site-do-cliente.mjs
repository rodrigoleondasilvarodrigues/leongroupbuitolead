/* CONTRATO DO SITE QUE SAI PARA O CLIENTE.

   Escrito em 2026-09-18, quando o kit da mentoria (Kit Agência Delafiori) foi
   avaliado e as peças boas dele foram trazidas para cá.

   Duas coisas que estes testes existem para impedir:

   1. SELO DE CREDENCIAL INVENTADO. O template do kit escreve "Licensed &
      Insured" fixo no herói, para todo cliente. Boa parte dos contratistas
      brasileiros não tem license, e publicar isso no site DELES seria uma
      alegação falsa feita por nós, em nome deles. Aqui o selo só aparece se
      o cliente marcou no formulário.

   2. REGIÃO FIXA NA COPY. A biblioteca de textos nasceu com foco em
      Massachusetts e dizia "the New England weather demands" na descrição de
      serviço. Isso ia para cliente da Flórida, do Texas, de qualquer lugar.
      O território é o país inteiro desde 2026-09-11.                        */
import fs from "node:fs";
import path from "node:path";
import { gerarSite, CADENCIA, CHECKLIST } from "../src/geradores.js";

const RAIZ = path.join(import.meta.dirname, "..");
const ler = (p) => fs.readFileSync(path.join(RAIZ, p), "utf8");

let ok = 0, mal = 0;
const t = (n, c, d = "") => { c ? (ok++, console.log("  \x1b[32mv\x1b[0m " + n + (d ? "  -> " + d : "")))
  : (mal++, console.log("  \x1b[31mX\x1b[0m " + n + (d ? "  -> " + d : ""))) };

const BASE = {
  empresa: "Summit Painting", nome_dono: "Mike Summit",
  cidade: "Orlando", estado: "FL", telefone: "(407) 555-0199",
  servicos: "Interior Painting, Exterior Painting, Cabinet Painting",
  faz: "Residential painting, full prep",
  diferencial: "Equipe própria, limpeza no fim de cada dia",
  localizacoes: "Orlando, Winter Park, Kissimmee",
  tempo_mercado: "8 anos",
};
const FOTOS = ["https://exemplo.test/1.jpg", "https://exemplo.test/2.jpg", "https://exemplo.test/3.jpg"];

console.log("\n\x1b[1m=== 1. SELOS DE CREDENCIAL SÓ APARECEM SE O CLIENTE MARCOU ===\x1b[0m");
const comSelo = gerarSite({ ...BASE, licenciado: 1, segurado: 1 }, FOTOS, []);
const semSelo = gerarSite({ ...BASE, licenciado: 0, segurado: 0 }, FOTOS, []);
t("quem marcou license recebe o selo Licensed", comSelo.includes("Licensed"));
t("quem marcou seguro recebe o selo Insured", comSelo.includes("Insured"));
t("quem NÃO marcou não recebe Licensed", !semSelo.includes("Licensed"));
t("quem NÃO marcou não recebe Insured", !semSelo.includes("Insured"));
t("orçamento grátis aparece para os dois, porque é verdade para os dois",
  comSelo.includes("Free estimates") && semSelo.includes("Free estimates"));
const soLicenca = gerarSite({ ...BASE, licenciado: 1, segurado: 0 }, FOTOS, []);
t("marcar só license não traz seguro junto",
  soLicenca.includes("Licensed") && !soLicenca.includes("Insured"));

console.log("\n\x1b[1m=== 2. CONTATO NO RODAPÉ VEM DO FORMULÁRIO ===\x1b[0m");
const comContato = gerarSite({ ...BASE, email: "mike@summit.test", instagram: "@summitpaintingfl" }, FOTOS, []);
t("e-mail vira link de e-mail", comContato.includes("mailto:mike@summit.test"));
t("instagram vira link do perfil", comContato.includes("instagram.com/summitpaintingfl"));
t("sem e-mail cadastrado, nenhum mailto é desenhado", !semSelo.includes("mailto:"));
t("sem instagram cadastrado, nenhum link de perfil é desenhado", !semSelo.includes("instagram.com"));
/* O @ é digitado à mão pelo cliente no celular e vai direto para dentro de um
   href. Só pode sobrar o que é válido num perfil: letra, número, ponto e
   sublinhado. Espaço, barra e sinal de tag saem antes. */
const sujo = gerarSite({ ...BASE, instagram: "@@summit painting/fl<script>" }, FOTOS, []);
const handle = (sujo.match(/instagram\.com\/([^"]*)/) || [])[1] || "";
const rotulo = (sujo.match(/>@([^<]*)</) || [])[1] || "";
t("o @ é limpo antes de virar link", /^[A-Za-z0-9._]+$/.test(handle), handle);
t("e o que aparece na tela também sai limpo", /^[A-Za-z0-9._]+$/.test(rotulo), rotulo);
const comTag = gerarSite({ ...BASE, logo_slogan: "Fresh coats, done right." }, FOTOS, []);
t("a tagline do briefing da logo aparece no rodapé", comTag.includes("Fresh coats, done right."));

console.log("\n\x1b[1m=== 3. NENHUMA REGIÃO FIXA NA COPY ===\x1b[0m");
for (const [oficio, servicos] of [
  ["pintura", "Interior Painting, Exterior Painting"],
  ["carpintaria", "Deck Building, Fence Installation"],
  ["paisagismo", "Landscaping, Planting and Design"],
  ["piso", "Hardwood Installation, Tile"],
]) {
  const site = gerarSite({ ...BASE, servicos, faz: servicos }, FOTOS, []);
  t(`site de ${oficio} não cita New England`, !/New England/i.test(site));
}
t("a biblioteca de textos não tem mais New England no código",
  !/New England/i.test(ler("src/geradores.js")));

console.log("\n\x1b[1m=== 4. O FORMULÁRIO COLETA O QUE O SITE PRECISA ===\x1b[0m");
const form = ler("src/paginas.js");
for (const campo of ["email", "instagram", "licenciado", "segurado"])
  t(`o formulário tem o campo ${campo}`, form.includes(`id="${campo}"`));
for (const campo of ["email:v('email')", "instagram:v('instagram')", "licenciado:", "segurado:"])
  t(`o envio manda ${campo.split(":")[0]}`, form.includes(campo));
t("o formulário avisa para marcar só o que é verdade", /só o que for verdade/i.test(form));

console.log("\n\x1b[1m=== 5. A GRAVAÇÃO PERSISTE OS CAMPOS NOVOS ===\x1b[0m");
const api = ler("src/index.js");
for (const col of ["instagram=?", "licenciado=?", "segurado=?"])
  t(`a rota do formulário grava ${col}`, api.includes(col));
t("e-mail em branco não apaga o que o admin já tinha cadastrado",
  api.includes("email=COALESCE(?,email)"));

console.log("\n\x1b[1m=== 6. A MIGRAÇÃO EXISTE E É COMPLETA ===\x1b[0m");
const mig = ler("migracao-16-site-do-cliente.sql");
for (const col of ["instagram", "licenciado", "segurado"])
  t(`a migração 16 cria a coluna ${col}`, new RegExp(`ADD COLUMN ${col}\\b`).test(mig));

console.log("\n\x1b[1m=== 7. DÁ PARA VER O SITE ANTES DE ENTREGAR ===\x1b[0m");
/* Antes existia só o download, e ele marcava o site como exportado. Conferir
   o que saiu obrigava a baixar o arquivo, o que sujava o acompanhamento da
   entrega. A visualização resolve, desde que não marque nada. */
const rota = api.slice(api.indexOf('"/api/ver-site"'), api.indexOf('"/api/baixar-site"'));
t("existe a rota de visualizar o site", api.includes('"/api/ver-site"'));
t("ela devolve HTML para o navegador desenhar", /text\/html/.test(rota));
t("ela não força download", !/Content-Disposition/i.test(rota));
// a busca é pela ATRIBUIÇÃO, não pela palavra: o comentário da própria rota
// cita site_exportado_em para explicar por que não mexe nele
t("visualizar NÃO marca o site como exportado", !/site_exportado_em\s*=/.test(rota));
t("baixar continua marcando",
  /site_exportado_em\s*=/.test(api.slice(api.indexOf('"/api/baixar-site"'))));
t("a prévia interna não é indexável", /X-Robots-Tag/.test(rota) && /noindex/.test(rota));
t("e não fica em cache, senão gerar de novo mostra o antigo", /no-store/.test(rota));
const tela = ler("src/admin.js");
t("o card tem o botão de visualizar", tela.includes("/api/ver-site?id="));
t("o botão abre em aba nova", /ver-site\?id=[^"]*"[^>]*target="_blank"/.test(tela));
t("e o de baixar continua lá", tela.includes("/api/baixar-site?id="));

console.log("\n\x1b[1m=== 8. O QUE O KIT DA MENTORIA ACRESCENTOU AO PROCESSO ===\x1b[0m");
const cad = JSON.stringify(CADENCIA);
t("a cadência tem a call de apresentação e acesso", /apresenta[çc][ãa]o e acesso/i.test(cad));
t("ela acontece no dia 1, antes de tudo depender do cliente",
  CADENCIA.some((m) => m.dia === 1 && /apresenta[çc][ãa]o e acesso/i.test(m.marco)));
t("e é marcada como tarefa dos dois lados",
  CADENCIA.some((m) => /apresenta[çc][ãa]o e acesso/i.test(m.marco) && m.quem === "ambos"));

const chk = JSON.stringify(CHECKLIST);
t("o checklist proíbe texto desenhado na foto do Google", /sem texto desenhado em cima/i.test(chk));
t("e manda o texto do post viver na legenda", /na legenda, nunca na foto/i.test(chk));
t("o checklist manda recusar foto fora do assunto", /foto fora do assunto/i.test(chk));
t("e cita render e IA entre as recusadas", /render 3D ou de IA/i.test(chk));
t("o formulário explica ao cliente o que não serve como foto",
  /O que não serve/i.test(form) && /feita por IA/i.test(form));

console.log("\n\x1b[1m=== 9. WHITE LABEL: O MATERIAL É DO CLIENTE ===\x1b[0m");
/* Regra do kit que vale como regra nossa: o site entregue não carrega a marca
   de quem produziu. Nunca teve verificação, e agora tem. */
const entregue = gerarSite({ ...BASE, email: "a@b.test", instagram: "@x" }, FOTOS, []);
for (const marca of ["Leon Group", "leongroup", "Built to Lead"])
  t(`o site do cliente não cita "${marca}"`, !entregue.includes(marca));
t("e o rodapé é assinado pela empresa do cliente", entregue.includes("Summit Painting"));

console.log("\n" + (mal ? "\x1b[31m" : "\x1b[32m") + "\x1b[1m" + ok
  + " passaram, " + mal + " falharam\x1b[0m");
process.exit(mal ? 1 : 0);
