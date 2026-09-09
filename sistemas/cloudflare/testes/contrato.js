/* O contrato é a única coisa do sistema que produz PROVA: um registro que
   alguém pode querer usar contra a Leon Group, ou a Leon Group contra alguém.
   Isso muda o que o teste tem que garantir. Não é "a tela desenhou": é que o
   texto diga o que promete, que não prometa o que não pode, e que o hash
   amarre o aceite ao texto exato que estava na tela. */
import { textoContrato, hashDoTexto, contratoEmHTML, VERSAO_CONTRATO,
         ESCOPO, FORA_DO_ESCOPO, OBRIGACOES_CLIENTE } from "../src/contrato.js";

let ok = 0, mal = 0;
const t = (rot, cond, extra) => {
  cond ? (ok++, console.log(`  \x1b[32mv\x1b[0m ${rot}${extra ? `  -> ${extra}` : ""}`))
       : (mal++, console.log(`  \x1b[31mX\x1b[0m ${rot}${extra ? `  -> ${extra}` : ""}`));
};

const CLI = {
  id: 1, slug: "ribeiro", empresa: "Ribeiro Hardwood LLC",
  razao_social: "Ribeiro Hardwood Flooring LLC", tipo_entidade: "LLC",
  nome_dono: "João Ribeiro", nome_contato: "João Ribeiro",
  endereco: "42 Concord St", endereco_cidade: "Framingham",
  endereco_estado: "MA", endereco_zip: "01702",
  email_contrato: "joao@ribeirofloors.com",
  valor_contrato: "US$ 2.500", tipo_contrato: "TCV", duracao_meses: 3,
  renovacao_automatica: 0, plano: "Presença Local",
  contrato_enviado_em: "2026-09-09T12:00:00Z",
};
const txt = textoContrato(CLI);

console.log("\n\x1b[1m=== 1. O CONTRATO TEM AS PARTES E OS DADOS DO CLIENTE ===\x1b[0m");
t("15 cláusulas", txt.split("\n").filter((l) => /^\d+\.\s[A-ZÀ-Ú]/.test(l.trim())).length === 15);
t("nome legal do cliente, não o nome fantasia",
  txt.includes("Ribeiro Hardwood Flooring LLC"));
t("tipo de entidade", txt.includes("(LLC)"));
t("representante", txt.includes("João Ribeiro"));
t("endereço montado", txt.includes("42 Concord St, Framingham, MA, 01702"));
t("e-mail de contato", txt.includes("joao@ribeirofloors.com"));
t("valor e prazo", txt.includes("US$ 2.500") && txt.includes("3 (três) meses"));
t("a versão do instrumento está no texto", txt.includes(VERSAO_CONTRATO));

console.log("\n\x1b[1m=== 2. O QUE ELE NÃO PROMETE ===\x1b[0m");
/* A regra de integridade da Leon Group proíbe prometer faturamento e posição
   no Google. Contrato que não diz isso deixa a promessa no boca a boca. */
t("recusa garantia de faturamento", /não promete e não estima resultado financeiro/.test(txt));
t("recusa garantia de posição em busca", /Garantia de posição em resultado de busca/.test(txt));
t("recusa prazo de resultado", /não com prazo de resultado/.test(txt));
t("declara-se contrato de MEIO, não de resultado",
  /de MEIO, e não de RESULTADO/.test(txt));
t("a cláusula 6 é declarada essencial", /Esta cláusula é essencial/.test(txt));
t("diz que a agência não publica avaliação",
  /A AGÊNCIA não publica avaliação, não cria conta de terceiro e não simula cliente/.test(txt));
t("cita a regra da FTC de 2024", /Federal Trade Commission vigente desde 2024/.test(txt));
t("veda conduta enganosa mesmo se o cliente pedir",
  /ainda que solicitada pelo CLIENTE/.test(txt));
t("veda declarar presença física inexistente",
  /presença física inexistente/.test(txt));
/* O sistema não pode prometer o que não entrega, e não pode deixar de
   prometer o que entrega: as duas listas vêm do escopo real. */
t("o escopo tem as 6 peças que o sistema realmente gera", ESCOPO.length === 6,
  ESCOPO.map((e) => e[0]).join(" · "));
t("fora do escopo tem 7 exclusões", FORA_DO_ESCOPO.length === 7);
t("6 obrigações do cliente", OBRIGACOES_CLIENTE.length === 6);

console.log("\n\x1b[1m=== 3. O PRAZO É O QUE O SISTEMA MEDE ===\x1b[0m");
/* O sistema conta os 5 dias de `entrega_iniciada_em`, que é a resposta do
   formulário. Se o contrato contasse da assinatura, a agência assumiria um
   prazo que o sistema não mede e ficaria devendo sem saber. */
t("cinco dias úteis", /5 \(cinco\) dias úteis/.test(txt));
t("conta da resposta do formulário, não da assinatura",
  /NÃO da data de aceite deste contrato nem da data do pagamento/.test(txt));
t("atraso do cliente no acesso do Google suspende o prazo",
  /suspende o prazo pelo tempo do atraso/.test(txt));

console.log("\n\x1b[1m=== 4. O CLIENTE FICA COM TUDO ===\x1b[0m");
/* O checklist do sistema já exige isso na entrega. O contrato só põe no papel
   o que a operação faz, e é o que impede a agência de virar refém do acesso. */
t("propriedade do material passa ao cliente",
  /passa a ser de propriedade do CLIENTE/.test(txt));
t("a agência declara que não guarda senha", /NÃO ARMAZENA SENHA DE CLIENTE/.test(txt));
t("encerrado o contrato, ele fica com o que recebeu",
  /permanece com tudo que foi entregue/.test(txt));
t("uso do caso depende de autorização, e negar não muda o preço",
  /pode ser negada sem qualquer efeito sobre o preço/.test(txt));
t("não usa depoimento não prestado", /não utilizará depoimento não prestado/.test(txt));

console.log("\n\x1b[1m=== 5. O CONTRATO ACOMPANHA O CONTRATO FECHADO ===\x1b[0m");
const mrr = textoContrato({ ...CLI, tipo_contrato: "MRR", valor_contrato: "US$ 800",
  duracao_meses: 6, renovacao_automatica: 1 });
t("MRR vira valor por mês, com o prazo por extenso",
  /US\$ 800 por mês, pelo período de 6 \(seis\) meses/.test(mrr),
  (mrr.match(/7\.1[^\n]*/) || [])[0]);
t("TCV vira pagamento único", /em pagamento único/.test(txt));
t("renovação automática ligada aparece no texto",
  /renova automaticamente por igual período/.test(mrr));
t("e desligada diz que não renova", /Não há renovação automática/.test(txt));

console.log("\n\x1b[1m=== 6. CLIENTE SEM DADOS NÃO GERA CONTRATO MENTIROSO ===\x1b[0m");
const vazio = textoContrato({ id: 2, empresa: "Sem Dados" });
t("campo em branco vira '(não informado)', não texto vazio",
  (vazio.match(/\(não informado\)/g) || []).length >= 2);
t("valor em branco vira '(a definir)'", vazio.includes("(a definir)"));
t("prazo cai no padrão de 3 meses", vazio.includes("3 (três) meses"));
t("e ainda diz que aguarda aceite", vazio.includes("AGUARDANDO ACEITE DO CLIENTE"));

console.log("\n\x1b[1m=== 7. O HASH AMARRA O ACEITE AO TEXTO ===\x1b[0m");
/* Sem o hash, editar o contrato depois tornaria o aceite impossível de
   interpretar: ninguém conseguiria dizer com qual redação a pessoa concordou. */
const h1 = await hashDoTexto(txt);
const h2 = await hashDoTexto(textoContrato(CLI));
t("mesmo texto, mesmo hash", h1 === h2, h1.slice(0, 16) + "...");
t("hash é SHA-256 em hexadecimal", /^[0-9a-f]{64}$/.test(h1));
const h3 = await hashDoTexto(textoContrato({ ...CLI, valor_contrato: "US$ 2.501" }));
t("um dólar de diferença no valor muda o hash", h1 !== h3);
const h4 = await hashDoTexto(textoContrato({ ...CLI, razao_social: "Outra Empresa LLC" }));
t("outro contratante muda o hash", h1 !== h4);
/* O servidor calcula o hash sobre o texto SEM o bloco de aceite. Se calculasse
   com ele, o hash mudaria no instante em que fosse gravado, e nunca mais
   conferiria com nada: o registro provaria o oposto do que se propõe. */
const semAceite = await hashDoTexto(textoContrato({ ...CLI, contrato_aceito_em: null }));
t("o hash do texto sem aceite é o mesmo que o cliente viu na tela",
  semAceite === h1, semAceite.slice(0, 16) + "...");
const comAceite = await hashDoTexto(textoContrato({ ...CLI,
  contrato_aceito_em: "2026-09-09T15:45:21Z", contrato_aceito_nome: "João Ribeiro" }));
t("e o texto COM o bloco de aceite tem hash diferente, como esperado",
  comAceite !== h1);

console.log("\n\x1b[1m=== 8. O REGISTRO DO ACEITE ===\x1b[0m");
const aceito = textoContrato({ ...CLI,
  contrato_aceito_em: "2026-09-09T15:45:21Z", contrato_aceito_nome: "João Ribeiro",
  contrato_aceito_ip: "73.12.44.9", contrato_versao: VERSAO_CONTRATO, contrato_hash: h1 });
t("marca que foi aceito", aceito.includes("ACEITO ELETRONICAMENTE"));
t("guarda o nome digitado", aceito.includes("Nome digitado: João Ribeiro"));
t("guarda a origem", aceito.includes("73.12.44.9"));
t("guarda a versão aceita", aceito.includes(VERSAO_CONTRATO));
t("guarda a impressão do texto", aceito.includes(h1));
t("cita a base legal dos dois países",
  /Medida Provisória 2\.200-2\/2001/.test(aceito) && /ESIGN Act e UETA/.test(aceito));

console.log("\n\x1b[1m=== 9. O HTML NÃO DEIXA PASSAR INJEÇÃO ===\x1b[0m");
/* Os dados vêm de um formulário PÚBLICO. Sem escape, quem tem um link de
   contrato injeta script na página que o operador também abre. */
const mau = textoContrato({ ...CLI,
  razao_social: '<script>alert(1)</script>', nome_dono: '"><img src=x onerror=alert(2)>' });
const htm = contratoEmHTML(mau);
t("tag de script é escapada", !/<script>/.test(htm), (htm.match(/&lt;script&gt;/) || ["nada"])[0]);
t("atributo de imagem é escapado", !/<img/.test(htm));
t("aspas são escapadas", !/"><img/.test(htm));
t("mas o texto legítimo continua legível", htm.includes("CONTRATO DE PRESTAÇÃO"));
t("as cláusulas viram título", (htm.match(/class="ct-h"/g) || []).length === 15);
t("os itens numerados viram parágrafo próprio",
  (htm.match(/class="ct-i"/g) || []).length > 25);

console.log(mal ? `\n\x1b[31m\x1b[1m${ok} passaram, ${mal} falharam\x1b[0m`
                : `\n\x1b[32m\x1b[1m${ok} passaram, 0 falharam\x1b[0m`);
process.exit(mal ? 1 : 0);
