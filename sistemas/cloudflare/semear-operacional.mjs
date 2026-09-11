/* Gera o SQL dos clientes de teste do CRM operacional.
 *
 * Um cliente em cada sub-visão da aba Entrega, que são estas, definidas em
 * VISOES_OP no admin.js e replicadas aqui para os dados caírem no filtro certo:
 *
 *   concluidos  c.entrega_completa
 *   em_entrega  c.entrega_iniciada_em && !c.entrega_completa
 *   atrasados   c.atrasado            (dias_uteis > 5 && !entrega_completa)
 *   aguardando  !c.formulario_em      ("Aguardando cliente")
 *   renovacao   c.renovacao_perto     (dias_para_renovar <= 21)
 *
 * Duas sobreposições são do próprio sistema, não erro dos dados: o ATRASADO
 * também aparece em "Em entrega", porque a entrega começou e não terminou; e o
 * de RENOVAÇÃO também aparece em "Concluídos", porque quem renova é justamente
 * quem já recebeu a entrega.
 *
 * A entrega fecha por dois caminhos diferentes, e há um de cada aqui:
 *   portão cumprido   todos os marcos + todo o checklist + todos os entregáveis
 *   entrega_forcada   fechamento antecipado registrado no botão
 *
 * Uso, de dentro de sistemas/cloudflare:
 *
 *   node semear-operacional.mjs > /tmp/op.sql
 *   npx wrangler d1 execute leon-group --local  --file=/tmp/op.sql   # testar
 *   npx wrangler d1 execute leon-group --remote --file=/tmp/op.sql   # produção
 *
 * Limpar só o operacional antes (isto APAGA dados de verdade; os leads do
 * comercial não são tocados):
 *
 *   npx wrangler d1 execute leon-group --remote --command "DELETE FROM reviews;
 *     DELETE FROM posts; DELETE FROM marcos; DELETE FROM checklist;
 *     DELETE FROM entregaveis; DELETE FROM midias; DELETE FROM arquivos;
 *     DELETE FROM entradas; DELETE FROM clientes;"
 *
 * ⚠ Apagar linha de mídia NÃO apaga o arquivo no R2 (dívida técnica 2).
 *
 * Os INSERTs são individuais porque com UNION ALL o statement do checklist
 * estoura o limite do D1 (SQLITE_TOOBIG): o passo a passo de cada item é longo.
 */
import { CADENCIA, CHECKLIST, ENTREGAVEIS, gerarReviews, gerarPosts } from "./src/geradores.js";

const AGORA = new Date();
const iso = (d) => d.toISOString();
const diasAtras = (n) => iso(new Date(AGORA.getTime() - n * 864e5));
const diasAFrente = (n) => iso(new Date(AGORA.getTime() + n * 864e5));
const N = iso(AGORA);
const q = (v) => (v === null || v === undefined ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);

const CLIENTES = [
  {
    visao: "Aguardando cliente",
    slug: "teste-aguardando-cliente",
    emp: "Moreira Flooring LLC", dono: "Jailson Moreira",
    cid: "Van Nuys", uf: "CA", tel: "12135550101", ni: "Flooring",
    servicos: "hardwood flooring, staircase refinishing, vinyl installation",
    nota: "Contrato assinado e pago. O link do formulário foi enviado e o cliente ainda não respondeu, então a entrega nem começou e o relógio dos 5 dias úteis não está correndo.",
    contrato: 1, pago: 1,
    form: null,        // sem formulario_em: é isto que o filtro olha
    inicio: null, marcosFeitos: 0, chkFeito: false, entStatus: "pendente",
    forcada: 0, concluida: null, renovaEm: null, conteudo: false,
  },
  {
    visao: "Em entrega",
    slug: "teste-em-entrega",
    emp: "Ruiz Cabinets LLC", dono: "Fabiano Ruiz",
    cid: "Framingham", uf: "MA", tel: "15085550104", ni: "Cabinets",
    servicos: "custom cabinets, cabinet installation, countertops",
    nota: "No meio da cadência, dentro do prazo. Serve para ver a barra de dias úteis, os marcos pela metade e o checklist em andamento.",
    contrato: 1, pago: 1,
    form: 3, inicio: 3, marcosFeitos: 5, chkFeito: false, entStatus: "em_producao",
    forcada: 0, concluida: null, renovaEm: 80, conteudo: true,
  },
  {
    visao: "Atrasado",
    slug: "teste-atrasado",
    emp: "Amaral HVAC Services", dono: "Robson Amaral",
    cid: "Glendale", uf: "CA", tel: "18185550109", ni: "HVAC",
    servicos: "HVAC installation, HVAC repair, duct cleaning",
    nota: "Passou dos 5 dias úteis com a entrega aberta. É o alerta vermelho do painel. Também aparece em Em entrega, porque começou e não terminou.",
    contrato: 1, pago: 1,
    form: 14, inicio: 14, marcosFeitos: 6, chkFeito: false, entStatus: "em_producao",
    forcada: 0, concluida: null, renovaEm: 70, conteudo: true,
  },
  {
    visao: "Concluído",
    slug: "teste-concluido",
    emp: "Caldeira Remodeling Inc", dono: "Sidnei Caldeira",
    cid: "Inglewood", uf: "CA", tel: "13235550113", ni: "Remodeling",
    servicos: "kitchen remodeling, bathroom remodeling, interior renovation",
    nota: "Fechou pelo PORTÃO CUMPRIDO: todos os marcos, todo o checklist e todos os entregáveis. É o caminho normal de conclusão. Renovação ainda longe, então não entra na aba Renovação.",
    contrato: 1, pago: 1,
    form: 22, inicio: 22, marcosFeitos: 11, chkFeito: true, entStatus: "entregue",
    forcada: 0, concluida: 8, renovaEm: 68, conteudo: true,
  },
  {
    visao: "Renovação",
    slug: "teste-renovacao",
    emp: "Tavares Hardwood LLC", dono: "Marcelo Tavares",
    cid: "Burbank", uf: "CA", tel: "18185550107", ni: "Flooring",
    servicos: "hardwood flooring, refinishing, stair treads",
    nota: "Contrato de 3 meses chegando ao fim: renova em 9 dias. Fechou pela CONCLUSÃO ANTECIPADA (entrega_forcada), que é o outro caminho do portão. Também aparece em Concluídos, porque quem renova é quem já recebeu a entrega.",
    contrato: 1, pago: 1,
    form: 81, inicio: 81, marcosFeitos: 10, chkFeito: false, entStatus: "entregue",
    forcada: 1, concluida: 72, renovaEm: 9, conteudo: true,
  },
];

const sql = [];
sql.push("-- clientes de teste do CRM operacional, um por sub-visão. Gerado em " + N);

for (const c of CLIENTES) {
  const base = c.form === null ? 2 : c.form;

  sql.push(`INSERT INTO clientes (slug,nome_contato,empresa,nicho,data_entrada,email,telefone,
  plano,valor_pago,nome_dono,cidade,estado,servicos,diferencial,observacoes,localizacoes,
  tempo_mercado,faz,nao_faz,
  formulario_token,formulario_em,contrato_assinado,contrato_em,pagamento_confirmado,pagamento_em,
  entrega_iniciada_em,entrega_concluida_em,entrega_forcada,entrega_forcada_nota,
  tipo_contrato,valor_contrato,duracao_meses,renovacao_automatica,renovacao_em,
  leads_recebidos,criado_em,atualizado_em)
VALUES (${q(c.slug)},${q(c.dono)},${q(c.emp)},${q(c.ni)},${q(diasAtras(base + 2))},
  ${q(c.slug + "@exemplo-teste.com")},${q(c.tel)},${q("Plano único")},${q("US$ 2.500")},
  ${q(c.dono)},${q(c.cid)},${q(c.uf)},${q(c.servicos)},
  ${q("REGISTRO DE TESTE, não é cliente real.")},
  ${q("REGISTRO DE TESTE · situação: " + c.visao + ". " + c.nota)},
  ${q(c.uf === "CA" ? "Greater Los Angeles" : "Greater Boston")},
  ${q("6 anos")},${q(c.servicos)},${q("No commercial work, no new construction")},
  ${q("tok-teste-" + c.slug.slice(6, 14))},
  ${q(c.form === null ? null : diasAtras(c.form))},
  ${c.contrato},${q(c.contrato ? diasAtras(base + 1) : null)},
  ${c.pago},${q(c.pago ? diasAtras(base + 1) : null)},
  ${q(c.inicio === null ? null : diasAtras(c.inicio))},
  ${q(c.concluida === null ? null : diasAtras(c.concluida))},
  ${c.forcada},${q(c.forcada ? "Cliente pediu para fechar antes: o Google Meu Negócio ficou de ser finalizado por ele." : null)},
  ${q("TCV")},${q("2500")},3,${c.renovaEm && c.renovaEm < 30 ? 0 : 1},
  ${q(c.renovaEm === null ? null : diasAFrente(c.renovaEm))},
  ${c.conteudo ? 12 : 0},${q(N)},${q(N)});`);

  const id = `(SELECT id FROM clientes WHERE slug=${q(c.slug)})`;

  CADENCIA.forEach((m, i) => {
    const feito = i < c.marcosFeitos;
    sql.push(`INSERT INTO marcos (cliente_id,marco,prazo_dias,concluido,concluido_em,criado_em) ` +
      `VALUES (${id},${q(m.marco + " [" + m.quem + "]")},${m.dia},${feito ? 1 : 0},` +
      `${q(feito ? diasAtras(Math.max(1, c.inicio - i)) : null)},${q(N)});`);
  });

  CHECKLIST.forEach(([area, item, obr, det], j) => {
    // no concluído tudo é marcado, porque o portão exige o checklist inteiro;
    // nos demais, só uma parte, proporcional ao andamento dos marcos
    const feito = c.chkFeito || (j < Math.round(CHECKLIST.length * (c.marcosFeitos / 11)));
    sql.push(`INSERT INTO checklist (cliente_id,area,item,detalhe,obrigatorio,ordem,feito,feito_em,criado_em) ` +
      `VALUES (${id},${q(area)},${q(item)},${q(det)},${obr},${j},${feito ? 1 : 0},` +
      `${q(feito ? diasAtras(1) : null)},${q(N)});`);
  });

  ENTREGAVEIS.forEach(([tipo]) => {
    sql.push(`INSERT INTO entregaveis (cliente_id,tipo,status,url,atualizado_em) ` +
      `VALUES (${id},${q(tipo)},${q(c.entStatus)},` +
      `${q(c.entStatus === "entregue" && tipo === "site" ? "https://exemplo-teste.vercel.app" : null)},${q(N)});`);
  });

  if (c.pago) {
    sql.push(`INSERT INTO entradas (cliente_id,valor,moeda,cotacao,recebido_em,meio,parcela,nota,criado_em) ` +
      `VALUES (${id},'2500','USD','5.4',${q(diasAtras(base + 1))},'Wise','pagamento único',` +
      `'REGISTRO DE TESTE',${q(N)});`);
  }

  // depoimentos e Instagram só existem depois que os entregáveis foram gerados
  if (c.conteudo) {
    const revs = await gerarReviews({
      nome_dono: c.dono, empresa: c.emp, cidade: c.cid, estado: c.uf,
      localizacoes: c.uf === "CA" ? "Greater Los Angeles" : "Greater Boston",
      servicos: c.servicos,
    });
    revs.forEach((r, i) => {
      sql.push(`INSERT INTO reviews (cliente_id,texto,servico,postada,criado_em) ` +
        `VALUES (${id},${q(r.texto)},${q(r.servico)},${i < 6 ? 1 : 0},${q(N)});`);
    });
    gerarPosts({ empresa: c.emp, cidade: c.cid, servicos: c.servicos }).forEach((p) => {
      sql.push(`INSERT INTO posts (cliente_id,ordem,tipo,titulo,brief,criado_em) ` +
        `VALUES (${id},${p.ordem},${q(p.tipo)},${q(p.titulo)},${q(p.brief)},${q(N)});`);
    });
  }
}

console.log(sql.join("\n"));
