import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { funil, diagnostico } from "../src/funil.js";

const db = new DatabaseSync(":memory:");
for (const st of readFileSync(new URL("../schema.sql", import.meta.url), "utf8").split(";\n")) { try { db.exec(st); } catch(e){} }
for (const f of ["migracao-01-cadencia.sql","migracao-02-fluxo.sql","migracao-03-contrato.sql","migracao-04-indices.sql","migracao-05-escopo-tentativas.sql","migracao-06-lead-parcial.sql","migracao-07-grupo-whatsapp.sql","migracao-08-fusos.sql","migracao-09-checklist.sql"]) {
  try { db.exec(readFileSync(new URL("../"+f, import.meta.url), "utf8")); } catch(e){ /* colunas já existem */ }
}
// shim D1
const D = {
  prepare(sql){ return { sql, args: [], bind(...a){ return { sql, args:a, ...this } },
    all(){ return { results: db.prepare(sql).all(...(this.args||[])) } } } },
  async batch(stmts){ return stmts.map(s => ({ results: db.prepare(s.sql).all(...(s.args||[])) })); },
};
const ag = () => new Date().toISOString();
function novoLead(nome){ const r = db.prepare("INSERT INTO leads (nome,telefone,pipeline,coluna,criado_em,entrou_coluna_em,atualizado_em) VALUES (?,?,?,?,?,?,?)").run(nome,"1",'leads_novos','super_hot',ag(),ag(),ag()); return Number(r.lastInsertRowid); }
function mover(id, pipe, col){ const l = db.prepare("SELECT pipeline,coluna FROM leads WHERE id=?").get(id);
  db.prepare("UPDATE leads SET pipeline=?,coluna=?,entrou_coluna_em=?,atualizado_em=? WHERE id=?").run(pipe,col,ag(),ag(),id);
  db.prepare("INSERT INTO eventos (lead_id,tipo,de,para,criado_em) VALUES (?,?,?,?,?)").run(id,'moveu',`${l.pipeline}/${l.coluna}`,`${pipe}/${col}`,ag());
  if(col==='call_rolando') db.prepare("INSERT INTO eventos (lead_id,tipo,para,criado_em) VALUES (?,?,?,?)").run(id,'call_compareceu','call_rolando',ag());
  if(col==='fechou') db.prepare("INSERT INTO eventos (lead_id,tipo,para,criado_em) VALUES (?,?,?,?)").run(id,'call_fechou','fechou',ag());
}
const mostra = async (rot) => { const f = await funil(D); console.log(rot, JSON.stringify(f.etapas), "clientes_ativos:", f.clientes_ativos); };

// LEAD 1: percurso completo, fecha na call, depois o negócio cai e volta pra recusou
const a = novoLead("Marcos");
db.prepare("UPDATE leads SET ultima_resposta_em=? WHERE id=?").run(ag(), a);
db.prepare("UPDATE leads SET call_agendada_para=? WHERE id=?").run(ag(), a);
mover(a,'agendamento','call_agendado');
mover(a,'agendamento','call_rolando');
await mostra("depois da call:        ");
mover(a,'agendamento','fechou');
db.prepare("INSERT INTO clientes (slug,nome_contato,empresa,data_entrada,lead_origem_id,criado_em,atualizado_em) VALUES (?,?,?,?,?,?,?)").run('marcos','Marcos','Marcos',ag(),a,ag(),ag());
await mostra("depois de fechar:      ");
// desistiu: operador move de volta pra recusou e apaga o cliente
mover(a,'agendamento','recusou');
db.prepare("DELETE FROM eventos WHERE cliente_id=?").run(1);
db.prepare("DELETE FROM clientes WHERE id=?").run(1);
await mostra("voltou pra recusou:    ");
console.log("  -> diagnostico:", JSON.stringify(diagnostico((await funil(D)).etapas).resumo));

// LEAD 2: arquivar e desarquivar direto no banco
const b = novoLead("Ana");
db.prepare("UPDATE leads SET arquivado=1 WHERE id=?").run(b);
await mostra("Ana arquivada:         ");
db.prepare("UPDATE leads SET arquivado=0 WHERE id=?").run(b);
await mostra("Ana desarquivada:      ");
// LEAD 3: fecha vindo da nutrição, sem nunca ter comparecido
const c = novoLead("Bruno");
mover(c,'nutricao','nutricao');
mover(c,'agendamento','fechou');
await mostra("Bruno fechou no follow:");
