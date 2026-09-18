/* Um cliente de DEMONSTRAÇÃO, completo, para ver a entrega inteira funcionando.
 *
 * Diferente de `semear-operacional.mjs`, que cria cinco clientes para cobrir as
 * sub-visões da aba Entrega, este cria UM só, com absolutamente tudo
 * preenchido, inclusive os campos novos do formulário (e-mail, Instagram,
 * license e seguro). Serve para gerar site, posts, destaques e avaliações e
 * conferir o resultado com o olho.
 *
 * Uso, de dentro de sistemas/cloudflare (o jeito fácil é rodar
 * ./preparar-demo-local.sh, que faz tudo isto de uma vez):
 *
 *   node semear-cliente-demo.mjs > /tmp/demo.sql
 *   npx wrangler d1 execute leon-group --local --file=/tmp/demo.sql
 *
 * A base das fotos pode ser trocada por variável de ambiente, para apontar
 * para onde elas estiverem sendo servidas:
 *
 *   FOTOS_BASE=http://127.0.0.1:8899 node semear-cliente-demo.mjs
 *
 * ⚠ NUNCA rode isto com --remote sem querer. É dado de demonstração, e o
 * slug começa com "demo-" justamente para dar para apagar depois com
 * DELETE FROM clientes WHERE slug LIKE 'demo-%'.
 */
import { CADENCIA, CHECKLIST, ENTREGAVEIS } from "./src/geradores.js";

const BASE = process.env.FOTOS_BASE || "http://127.0.0.1:8899";
const N = new Date().toISOString();
const dias = (n) => new Date(Date.now() - n * 864e5).toISOString();
const frente = (n) => new Date(Date.now() + n * 864e5).toISOString();
const q = (v) => (v === null || v === undefined ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);

const C = {
  slug: "demo-vieira-hardwood",
  empresa: "Vieira Hardwood Floors",
  razao: "Vieira Hardwood Floors LLC",
  dono: "Ricardo Vieira",
  cidade: "Orlando",
  uf: "FL",
  tel: "(407) 555-0142",                 // faixa 555-01XX é reservada para ficção
  email: "contato@vieirahardwood.test",  // .test não existe de verdade, de propósito
  instagram: "@vieirahardwood",
  slogan: "Floors that hold up.",
  servicos: "Hardwood Installation, Floor Sanding and Refinishing, Staircase Refinishing, Vinyl and Laminate",
  faz: "Instalo e restauro piso de madeira em casa residencial, do preparo do contrapiso ao acabamento. Trabalho com equipe própria e faço a limpeza no fim de cada dia.",
  naoFaz: "Não faço obra comercial, não faço demolição e não trabalho com carpete.",
  diferencial: "Equipe própria, limpeza garantida no fim de cada dia, garantia de 3 anos no acabamento e orçamento por escrito antes de começar.",
  locais: "Orlando, Winter Park, Kissimmee, Altamonte Springs, Sanford, Lake Mary",
  tempo: "9 anos",
  cores: "azul escuro e dourado",
  prim: "#1b4965",
  dest: "#f6ae2d",
  fotos: 12,
};

const sql = [];
sql.push(`-- CLIENTE DE DEMONSTRAÇÃO, gerado em ${N}`);
sql.push(`-- Apagar depois:  DELETE FROM clientes WHERE slug LIKE 'demo-%';`);

/* Limpeza antes de inserir. Apagar só a linha do cliente deixa marcos,
   checklist, fotos e entradas órfãos no banco, e a cada nova rodada os
   números da tela dobram. Aqui sai o filho pelo id do cliente, sai o
   cliente, e depois sai qualquer órfão que tenha sobrado de rodada
   anterior. Vale só no banco local de demonstração. */
const FILHOS = ["midias", "marcos", "checklist", "entregaveis", "entradas", "reviews", "posts", "arquivos"];
for (const t of FILHOS)
  sql.push(`DELETE FROM ${t} WHERE cliente_id IN (SELECT id FROM clientes WHERE slug=${q(C.slug)});`);
sql.push(`DELETE FROM clientes WHERE slug=${q(C.slug)};`);
for (const t of FILHOS)
  sql.push(`DELETE FROM ${t} WHERE cliente_id NOT IN (SELECT id FROM clientes);`);

sql.push(`INSERT INTO clientes (slug,nome_contato,empresa,razao_social,nicho,data_entrada,
  email,instagram,telefone,plano,valor_pago,nome_dono,cidade,estado,servicos,diferencial,
  observacoes,localizacoes,tempo_mercado,faz,nao_faz,
  tem_logo,cores,cor_primaria,cor_destaque,logo_slogan,licenciado,segurado,
  formulario_token,formulario_em,contrato_assinado,contrato_em,pagamento_confirmado,pagamento_em,
  entrega_iniciada_em,prazo_final,grupo_whatsapp,
  tipo_contrato,valor_contrato,duracao_meses,renovacao_automatica,renovacao_em,
  leads_recebidos,criado_em,atualizado_em)
VALUES (${q(C.slug)},${q(C.dono)},${q(C.empresa)},${q(C.razao)},${q("Flooring")},${q(dias(9))},
  ${q(C.email)},${q(C.instagram)},${q(C.tel)},${q("Presença Local")},${q("US$ 2.500")},
  ${q(C.dono)},${q(C.cidade)},${q(C.uf)},${q(C.servicos)},${q(C.diferencial)},
  ${q("CLIENTE DE DEMONSTRAÇÃO. Não é cliente real, serve para conferir a entrega com o olho.")},
  ${q(C.locais)},${q(C.tempo)},${q(C.faz)},${q(C.naoFaz)},
  0,${q(C.cores)},${q(C.prim)},${q(C.dest)},${q(C.slogan)},1,1,
  ${q("tok-demo-vieira")},${q(dias(2))},1,${q(dias(6))},1,${q(dias(5))},
  ${q(dias(2))},${q(frente(3))},${q("https://chat.whatsapp.com/demo-vieira")},
  ${q("TCV")},${q("2500")},3,1,${q(frente(83))},
  0,${q(N)},${q(N)});`);

const id = `(SELECT id FROM clientes WHERE slug=${q(C.slug)})`;

// Fotos "coladas": entram em midias, que é de onde a geração do site lê os
// links (a outra fonte, `arquivos`, é o que o cliente sobe pelo celular).
for (let i = 1; i <= C.fotos; i++) {
  const nome = `foto-${String(i).padStart(2, "0")}.jpg`;
  sql.push(`INSERT INTO midias (cliente_id,tipo,caminho,criado_em) ` +
    `VALUES (${id},${q("foto")},${q(`${BASE}/${nome}`)},${q(N)});`);
}

// Pagamento recebido, para o caixa não ficar vazio na demonstração.
sql.push(`INSERT INTO entradas (cliente_id,valor,moeda,cotacao,recebido_em,meio,parcela,nota,criado_em) ` +
  `VALUES (${id},2500,${q("USD")},5.4,${q(dias(5))},${q("WHOP")},${q("1/1")},` +
  `${q("Entrada de demonstração")},${q(N)});`);

// Cadência: os marcos dos dois primeiros dias já concluídos.
CADENCIA.forEach((m, i) => {
  const feito = m.dia <= 2;
  sql.push(`INSERT INTO marcos (cliente_id,marco,prazo_dias,concluido,concluido_em,criado_em) ` +
    `VALUES (${id},${q(m.marco + " [" + m.quem + "]")},${m.dia},${feito ? 1 : 0},` +
    `${q(feito ? dias(1) : null)},${q(N)});`);
});

// Checklist de otimização: um terço marcado, para a barra de progresso mexer.
// Cada item é [area, item, obrigatorio, detalhe].
CHECKLIST.forEach(([area, item, obrigatorio, detalhe], i) => {
  const feito = i % 3 === 0;
  sql.push(`INSERT INTO checklist (cliente_id,area,item,detalhe,obrigatorio,ordem,feito,feito_em,criado_em) ` +
    `VALUES (${id},${q(area)},${q(item)},${q(detalhe || "")},${obrigatorio ? 1 : 0},` +
    `${i + 1},${feito ? 1 : 0},${q(feito ? dias(1) : null)},${q(N)});`);
});

// Entregáveis ainda pendentes: é isso que os botões de gerar vão preencher.
// Cada entregável é [tipo, nome].
ENTREGAVEIS.forEach(([tipo]) => {
  sql.push(`INSERT INTO entregaveis (cliente_id,tipo,status,url,atualizado_em) ` +
    `VALUES (${id},${q(tipo)},${q("pendente")},NULL,${q(N)});`);
});

console.log(sql.join("\n"));
