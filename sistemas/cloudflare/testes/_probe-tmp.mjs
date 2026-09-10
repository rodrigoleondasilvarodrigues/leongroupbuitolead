import { ADMIN_HTML } from "/Users/macbook/Leon Group - Buit To Lead /sistemas/cloudflare/src/admin.js";
import { diagnostico, ROTULOS_FUNIL, financeiroTotal } from "/Users/macbook/Leon Group - Buit To Lead /sistemas/cloudflare/src/funil.js";
import { JSDOM } from "jsdom";

const FIN = financeiroTotal([], [], { valor: "5.40" }, []);
const PAINEL = { leads: [], clientes: [], pipelines: {leads_novos:[["super_hot","Super Hot"]],agendamento:[["fechou","Fechou"]],recuperacao:[["recuperacao","R"]],nutricao:[["nutricao","N"]]},
  ativacoes: {}, catalogo: [], entregaveis: [], kpis: { etapas: {}, alertas: [] }, sem_r2: true };

const cenarios = {
  A: { entraram: 100, responderam: 50, agendaram: 20, compareceram: 10, recusaram: 2, fecharam_call: 1, fecharam_followup: 0, fecharam: 1, perdidos: 30 },
  B: { entraram: 20, responderam: 15, agendaram: 10, compareceram: 6, recusaram: 1, fecharam_call: 3, fecharam_followup: 4, fecharam: 7, perdidos: 2 },
  C: { entraram: 10, responderam: 3, agendaram: 0, compareceram: 0, recusaram: 0, fecharam_call: 0, fecharam_followup: 0, fecharam: 0, perdidos: 1 },
  D: { entraram: 30, responderam: 25, agendaram: 20, compareceram: 6, recusaram: 9, fecharam_call: 1, fecharam_followup: 0, fecharam: 1, perdidos: 5 },
};
let atual = "A";
const resp = () => ({ etapas: cenarios[atual], clientes_ativos: 0, rotulos: ROTULOS_FUNIL,
  financeiro: FIN, diagnostico: diagnostico(cenarios[atual]), ia_disponivel: false });

const dom = new JSDOM(ADMIN_HTML, { runScripts: "dangerously", url: "https://x.workers.dev/", pretendToBeVisual: true,
  beforeParse(w){ w.fetch=(u)=>Promise.resolve({ok:true,json:()=>Promise.resolve(
      String(u).startsWith("/api/painel")?PAINEL: String(u).startsWith("/api/dashboard")?resp():{ok:true})});
    w.alert=()=>{}; w.confirm=()=>true; w.addEventListener("error",e=>console.log("JSERR",String(e.error||e.message))); } });
const w=dom.window, doc=w.document;
const $$=(s)=>[...doc.querySelectorAll(s)];
const espera=(ms=60)=>new Promise(r=>setTimeout(r,ms));

setTimeout(async ()=>{
  await espera(150);
  const abaDash=$$("#abas button").find(b=>/Dashboard/.test(b.textContent));
  abaDash.click(); await espera(120);
  for (const k of Object.keys(cenarios)) {
    atual=k; await w.carregarDash(true); await espera(80);
    const larg=$$(".fx-faixa i").map(el=>{const m=el.getAttribute("style").match(/polygon\(([\d.]+)% 0,([\d.]+)% 0/);return Math.round((Number(m[2])-Number(m[1]))*10)/10;});
    const nums=$$(".fx-n").map(el=>el.textContent.trim().replace(/\s+/g," "));
    console.log("\n===== CENÁRIO",k,JSON.stringify(cenarios[k]));
    console.log("larguras:",larg.join(" / "));
    console.log("números:",nums.join(" | "));
    console.log("tags:",$$(".fx-p .meio").map(x=>x.textContent.replace(/\s+/g," ").trim()).join("  ||  "));
    const anom=doc.querySelector(".fx-anom"); if(anom) console.log("ANOMALIA:",anom.textContent.replace(/\s+/g," ").trim());
    const diag=doc.querySelector(".diag"); console.log("DIAG:",diag.textContent.replace(/\s+/g," ").trim().slice(0,700));
    console.log("FUGA:",$$(".fg").map(x=>x.textContent.replace(/\s+/g," ").trim()).join(" | "));
  }
  process.exit(0);
},0);
