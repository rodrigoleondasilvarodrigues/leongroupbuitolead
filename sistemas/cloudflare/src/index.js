// Leon Group — Worker único: admin protegido + sites dos clientes + formulário público.
import * as G from "./geradores.js";
import * as A from "./auth.js";
import { ADMIN_HTML } from "./admin.js";
import { LOGIN_HTML, formularioHTML, aguardandoHTML, jaRespondidoHTML } from "./paginas.js";

const agora = () => new Date().toISOString();
// Datas podem chegar em ISO (o padrão do app) ou no formato do SQLite
// ("YYYY-MM-DD HH:MM:SS", que o JS leria como hora LOCAL e erraria o fuso).
// Este parser normaliza os dois para UTC.
const parseData = (v) => {
  if (!v) return null;
  const s = String(v);
  const d = new Date(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s) ? s.replace(" ", "T") + "Z" : s);
  return isNaN(d) ? null : d;
};
const horasDesde = (v) => { const d = parseData(v); return d ? (Date.now() - d) / 3600000 : 0; };
const MIN_FOTOS = 11;   // mesmo mínimo que o formulário exige na tela
const TETO_LOTE = 500;  // leads processados por rodada do cron, por etapa

// O público está nos EUA (prioridade Massachusetts/Boston). O Worker roda em UTC,
// então sem isto uma mensagem de follow-up dispara 3h da manhã no fuso do lead —
// o jeito mais rápido de o número ser denunciado como spam.
function horaLocalEUA(quando = new Date()) {
  const h = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", hour: "numeric", hour12: false }).format(quando);
  return Number(h) % 24;
}
const janelaDeContato = () => { const h = horaLocalEUA(); return h >= 8 && h < 21; };
const json = (o, s = 200, h = {}) => new Response(JSON.stringify(o), {
  status: s, headers: { "Content-Type": "application/json; charset=utf-8", ...h },
});
const html = (s, st = 200, h = {}) => new Response(s, {
  status: st, headers: { "Content-Type": "text/html; charset=utf-8", ...h },
});
const slugify = (s) => (s || "").toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "") || "cliente";
const token = () => crypto.randomUUID().replace(/-/g, "").slice(0, 20);
const dias = (v) => { const d = parseData(v); return d ? Math.floor((Date.now() - d) / 86400000) : 0; };

// régua de temperatura do pipeline 1
const ESCADA = ["super_hot", "hot", "warm", "cold", "super_cold"];
const ATIV_DIA = { responderam: 0, super_hot: 10, hot: 7, warm: 5, cold: 3, super_cold: 2 };
const PIPELINES = {
  leads_novos: [["responderam","Responderam"],["super_hot","Super Hot"],["hot","Hot"],
                ["warm","Warm"],["cold","Cold"],["super_cold","Super Cold"]],
  agendamento: [["call_agendado","Call Agendado"],["call_rolando","Call Rolando"],["no_show","No Show"],
                ["no_show_f1","No Show F1"],["no_show_f2","No Show F2"],["no_show_f3","No Show F3"],
                ["fechou","Fechou ✓"],["recusou","Recusou"]],
  recuperacao: [["recuperacao","Recuperação"]],
  nutricao: [["nutricao","Nutrição"]],
};
const CATALOGO = [
  ["ligacao","Ligação"],["audio","Áudio"],["audio_unico","Áudio de visualização única"],
  ["foto_unica","Foto de visualização única"],["figurinha","Figurinha"],["emoji","Emoji"],
  ["mensagem","Mensagem de texto"],["video_unico","Vídeo de visualização única"],
  ["status_mencao","Menção em status"],
  // ⚠️ engodo — incluída por decisão explícita do usuário (ver README)
  ["comprovante_falso","Comprovante de PIX falso ⚠️"],
];

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const p = url.pathname;
    const ip = req.headers.get("CF-Connecting-IP") || "0.0.0.0";

    try {
      // Sites dos clientes NÃO são servidos aqui — vão 100% para o Vercel,
      // com deploy manual. O admin baixa o index.html em /api/baixar-site.
      // ───────── público: formulário do cliente ─────────
      if (p.startsWith("/f/")) {
        const t = p.slice(3).replace(/\/$/, "");
        const c = await env.DB.prepare(
          `SELECT id,empresa,nome_contato,formulario_em,contrato_assinado,pagamento_confirmado
           FROM clientes WHERE formulario_token=?`).bind(t).first();
        if (!c) return html("<h1>Formulário não encontrado</h1>", 404);
        // só abre depois do contrato assinado E do pagamento confirmado
        if (!c.contrato_assinado || !c.pagamento_confirmado)
          return html(aguardandoHTML(c), 403);
        // uso único: depois de respondido o link morre
        if (c.formulario_em) return html(jaRespondidoHTML(c), 410);
        return html(formularioHTML(c, t));
      }
      if (p.startsWith("/api/formulario/") && req.method === "POST") {
        const t = p.slice(16);
        // contador próprio (escopo "formulario"): impede marretar a rota em loop
        // sem nunca trancar o login do admin.
        if (await A.bloqueadoPorTentativas(env, ip, "formulario"))
          return json({ erro: "Muitas tentativas. Aguarde." }, 429);
        const c = await env.DB.prepare(
          `SELECT id,formulario_em,contrato_assinado,pagamento_confirmado
           FROM clientes WHERE formulario_token=?`).bind(t).first();
        if (!c) { await A.registrarTentativa(env, ip, false, "formulario"); return json({ erro: "token inválido" }, 404); }
        if (!c.contrato_assinado || !c.pagamento_confirmado)
          return json({ erro: "Formulário ainda não liberado: aguardando contrato e pagamento." }, 403);
        if (c.formulario_em) return json({ erro: "Este formulário já foi respondido." }, 410);
        const b = await req.json();

        // Validação no SERVIDOR. A checagem do navegador não vale nada aqui:
        // sem isto, um envio vazio queimava o token de uso único e a entrega
        // começava a contar sem uma única foto para trabalhar — e o cliente
        // não conseguia reenviar (410).
        const fotosOk = (b.fotos || []).filter((u) => /^https?:\/\//i.test(String(u)));
        if (fotosOk.length < MIN_FOTOS)
          return json({ erro: `Faltam fotos: recebi ${fotosOk.length}, o mínimo é ${MIN_FOTOS}. Nada foi salvo — o link continua valendo.` }, 400);
        if (!String(b.nome_dono || "").trim() || !String(b.cidade || "").trim() || !String(b.servicos || "").trim())
          return json({ erro: "Nome do dono, cidade e serviços são obrigatórios. Nada foi salvo — o link continua valendo." }, 400);

        const prazo = G.somaDiasUteis(new Date(), G.PRAZO_MAXIMO_DIAS).toISOString();
        // A trava é a própria condição do UPDATE (formulario_em IS NULL).
        // Antes, checar-depois-gravar deixava dois envios simultâneos passarem
        // pelos dois lados da trava, duplicando mídia e reiniciando o prazo.
        const gravou = await env.DB.prepare(
          `UPDATE clientes SET nome_dono=?,cidade=?,estado=?,telefone=?,servicos=?,diferencial=?,
           observacoes=?,tem_logo=?,cores=?,tempo_mercado=?,faz=?,nao_faz=?,localizacoes=?,
           formulario_em=?,prazo_final=?,entrega_iniciada_em=?,atualizado_em=?
           WHERE id=? AND formulario_em IS NULL`
        ).bind(b.nome_dono||null,b.cidade||null,b.estado||null,b.telefone||null,b.servicos||null,
               b.diferencial||null,b.observacoes||null,b.tem_logo?1:0,b.cores||null,
               b.tempo_mercado||null,b.faz||null,b.nao_faz||null,b.localizacoes||null,
               agora(),prazo,agora(),agora(),c.id).run();
        if (!gravou.meta.changes)
          return json({ erro: "Este formulário já foi respondido." }, 410);
        const jaTem = await env.DB.prepare(
          "SELECT COUNT(*) AS n FROM midias WHERE cliente_id=?").bind(c.id).first();
        const espaco = Math.max(0, 40 - (jaTem?.n || 0));   // teto acumulado de 40 mídias
        for (const u of (b.fotos || []).slice(0, espaco)) {
          if (!/^https?:\/\//i.test(String(u))) continue;   // só http(s)
          await env.DB.prepare("INSERT INTO midias (cliente_id,tipo,caminho,criado_em) VALUES (?,?,?,?)")
            .bind(c.id, "foto", String(u).slice(0, 500), agora()).run();
        }
        for (const u of (b.videos || []).slice(0, 5)) {
          if (!/^https?:\/\//i.test(String(u))) continue;
          await env.DB.prepare("INSERT INTO midias (cliente_id,tipo,caminho,criado_em) VALUES (?,?,?,?)")
            .bind(c.id, "video", String(u).slice(0, 500), agora()).run();
        }
        if (b.logo_url && /^https?:\/\//i.test(String(b.logo_url)))
          await env.DB.prepare("INSERT INTO midias (cliente_id,tipo,caminho,descricao,criado_em) VALUES (?,?,?,?,?)")
            .bind(c.id, "logo", String(b.logo_url).slice(0, 500), "logo enviada pelo cliente", agora()).run();
        const temMarcos = await env.DB.prepare(
          "SELECT COUNT(*) AS n FROM marcos WHERE cliente_id=?").bind(c.id).first();
        if (!(temMarcos?.n)) {
          for (const m of G.CADENCIA)
            await env.DB.prepare(
              "INSERT INTO marcos (cliente_id,marco,prazo_dias,criado_em) VALUES (?,?,?,?)")
              .bind(c.id, `${m.marco} [${m.quem}]`, m.dia, agora()).run();
        }
        return json({ ok: true });
      }

      // ───────── login ─────────
      if (p === "/login") return html(LOGIN_HTML);
      if (p === "/api/login" && req.method === "POST") {
        if (await A.bloqueadoPorTentativas(env, ip))
          return json({ erro: "Muitas tentativas. Aguarde 15 minutos." }, 429);
        const { senha } = await req.json();
        const ok = await A.senhaConfere(env, senha);
        await A.registrarTentativa(env, ip, ok);
        if (!ok) { await A.atrasoPorFalhas(env, ip); return json({ erro: "Senha incorreta" }, 401); }
        return json({ ok: true }, 200, { "Set-Cookie": A.cookieSessao(await A.criarSessao(env)) });
      }
      // ───────── daqui pra baixo exige sessão ─────────
      const autenticado = await A.sessaoValida(req, env);

      // logout FICA DEPOIS DO PORTÃO. Antes ficava antes, e chamava
      // invalidarTodasSessoes(): bastava um POST sem cookie nenhum, de qualquer
      // lugar do mundo, para derrubar o dono do próprio CRM — em loop.
      // Agora exige sessão válida e só limpa o cookie de quem pediu.
      // Para matar TODAS as sessões existe /api/encerrar-sessoes, autenticada.
      if (p === "/api/logout" && req.method === "POST") {
        if (!autenticado) return json({ erro: "não autenticado" }, 401);
        return json({ ok: true }, 200, { "Set-Cookie": A.cookieLimpo() });
      }
      if (p === "/" || p === "/admin")
        return autenticado ? html(ADMIN_HTML) : Response.redirect(new URL("/login", req.url).toString(), 302);
      if (!autenticado) return json({ erro: "não autenticado" }, 401);

      return await apiAdmin(p, req, env);
    } catch (e) {
      console.log("erro:", e.message, e.stack);   // fica no log do Worker, não na resposta
      return json({ erro: "Erro interno" }, 500);
    }
  },

  // decaimento, cadências e no-show rodam por Cron Trigger (a cada 15 min)
  async scheduled(event, env, ctx) {
    // waitUntil engolia qualquer exceção sem log: o motor podia estar parado
    // havia semanas e nada apareceria em lugar nenhum.
    ctx.waitUntil(
      motorAutomacao(env)
        .then((r) => console.log(`cron ok — ${r?.falhas || 0} falha(s) isolada(s)`))
        .catch((e) => console.log("cron ABORTOU:", e.message, e.stack))
    );
  },
};

// ══════════════════════ API do admin ══════════════════════
async function apiAdmin(p, req, env) {
  const url = new URL(req.url);
  const D = env.DB;
  const corpo = req.method === "POST" ? await req.json().catch(() => ({})) : {};

  // ── painel geral ──
  if (p === "/api/painel") {
    // Um único round-trip para tudo. Antes isto era N+1 (4 consultas por cliente,
    // uma esperando a outra): 5 clientes = 27 idas ao banco = 3,5s de espera,
    // e crescia linear. Agora são 6 consultas agregadas em batch, custo constante.
    // o batch do painel e o dos KPIs são independentes: vão em paralelo, não em fila
    const [[qL, qC, qEnt, qRev, qMk, qMd], kpisPainel] = await Promise.all([
      D.batch([
        D.prepare("SELECT * FROM leads WHERE arquivado=0 ORDER BY entrou_coluna_em DESC"),
        D.prepare("SELECT * FROM clientes WHERE arquivado=0 ORDER BY id DESC"),
        D.prepare("SELECT id,tipo,status,url,cliente_id FROM entregaveis"),
        D.prepare("SELECT cliente_id, COUNT(*) t, SUM(postada) p FROM reviews GROUP BY cliente_id"),
        D.prepare("SELECT cliente_id, COUNT(*) t, SUM(concluido) c FROM marcos GROUP BY cliente_id"),
        D.prepare("SELECT cliente_id, tipo, COUNT(*) n FROM midias GROUP BY cliente_id, tipo"),
      ]),
      kpis(D),
    ]);
    const leads = qL.results, cls = qC.results;

    // indexa os agregados por cliente_id antes de costurar
    const ents = new Map(), revs = new Map(), mks = new Map(), mds = new Map();
    for (const e of qEnt.results) {
      if (!ents.has(e.cliente_id)) ents.set(e.cliente_id, []);
      ents.get(e.cliente_id).push({ id: e.id, tipo: e.tipo, status: e.status, url: e.url });
    }
    for (const r of qRev.results) revs.set(r.cliente_id, r);
    for (const m of qMk.results) mks.set(m.cliente_id, m);
    for (const x of qMd.results) {
      if (!mds.has(x.cliente_id)) mds.set(x.cliente_id, {});
      mds.get(x.cliente_id)[x.tipo] = x.n;
    }

    const agoraMs = Date.now();
    for (const c of cls) {
      // o HTML do site pode ter dezenas de KB e o admin nunca lê esse campo aqui
      delete c.site_html;
      c.dias = dias(c.data_entrada);
      // entrega: quantos dias úteis já correram dos 5
      c.dias_uteis = c.entrega_iniciada_em ? G.diasUteisDesde(parseData(c.entrega_iniciada_em)) : null;
      // renovação: quantos dias faltam para o fim do contrato
      const rv = parseData(c.renovacao_em);
      c.dias_para_renovar = rv ? Math.ceil((rv - agoraMs) / 86400000) : null;
      c.renovacao_perto = c.dias_para_renovar !== null && c.dias_para_renovar <= 21;
      c.entregaveis = ents.get(c.id) || [];
      const r = revs.get(c.id);
      c.reviews_total = r?.t || 0; c.reviews_postadas = r?.p || 0;
      const mk = mks.get(c.id);
      c.marcos_total = mk?.t || 0; c.marcos_feitos = mk?.c || 0;
      c.entrega_completa = c.marcos_total > 0 && c.marcos_feitos >= c.marcos_total;
      // atrasado só vale se o prazo passou E a entrega ainda não terminou
      c.atrasado = c.dias_uteis !== null && c.dias_uteis > G.PRAZO_MAXIMO_DIAS && !c.entrega_completa;
      c.midias = mds.get(c.id) || {};
    }
    return json({ leads, clientes: cls, pipelines: PIPELINES, ativacoes: ATIV_DIA,
                  catalogo: CATALOGO, entregaveis: G.ENTREGAVEIS, kpis: kpisPainel });
  }

  // ── comercial ──
  if (p === "/api/lead" && req.method === "POST") {
    const n = agora();
    const r = await D.prepare(
      `INSERT INTO leads (nome,telefone,email,empresa,nicho,faturamento_mensal,origem,criado_em,entrou_coluna_em,atualizado_em)
       VALUES (?,?,?,?,?,?,?,?,?,?)`
    ).bind(corpo.nome||"Sem nome",corpo.telefone||"",corpo.email||null,corpo.empresa||null,
           corpo.nicho||null,corpo.faturamento_mensal||null,corpo.origem||"meta-ads",n,n,n).run();
    const id = r.meta.last_row_id;
    await ev(D, { lead_id: id, tipo: "criado", para: "leads_novos/super_hot" });
    await msg(D, env, id, "boas_vindas",
      "Oi! Recebi seu contato aqui. Um dos nossos especialistas vai te ligar em menos de 5 minutos, tudo bem?");
    return json({ id });
  }
  if (p === "/api/lead" && req.method === "GET") {
    const id = url.searchParams.get("id");
    const lead = await D.prepare("SELECT * FROM leads WHERE id=?").bind(id).first();
    if (!lead) return json({ erro: "não encontrado" }, 404);
    // as três listas são independentes: um round-trip só, não três em fila
    const [at, evs, ms] = await D.batch([
      D.prepare("SELECT * FROM ativacoes WHERE lead_id=? ORDER BY id DESC LIMIT 20").bind(id),
      D.prepare("SELECT * FROM eventos WHERE lead_id=? ORDER BY id DESC LIMIT 20").bind(id),
      D.prepare("SELECT * FROM mensagens WHERE lead_id=? ORDER BY id DESC LIMIT 20").bind(id),
    ]);
    lead.ativacoes = at.results; lead.eventos = evs.results; lead.mensagens = ms.results;
    return json(lead);
  }
  if (p === "/api/mover") {
    const l = await D.prepare("SELECT * FROM leads WHERE id=?").bind(corpo.id).first();
    await mover(D, l, corpo.coluna, corpo.pipeline, corpo.motivo || "movido manualmente");

    // Os KPIs de comparecimento e fechamento liam eventos que NENHUM código
    // gravava — ficavam presos em zero e o diagnóstico acusava o SDR à toa.
    // Fica ANTES do bloco do "fechou": aquele bloco tem return próprio.
    if (corpo.coluna === "call_rolando")
      await ev(D, { lead_id: l.id, tipo: "call_compareceu", para: "call_rolando", detalhe: "entrou na call" });
    if (corpo.coluna === "fechou")
      await ev(D, { lead_id: l.id, tipo: "call_fechou", para: "fechou", detalhe: "fechou a venda" });

    // FECHOU: os dados do lead viram um cliente no operacional, automaticamente
    if (corpo.coluna === "fechou") {
      const ja = await D.prepare("SELECT id FROM clientes WHERE lead_origem_id=?").bind(l.id).first();
      if (!ja) {
        // valor_pago é dinheiro que ENTROU. O budget do BANT é só o que o lead
        // disse que podia gastar na qualificação — nunca deve virar receita.
        const novo = await criarClienteDoLead(D, l, corpo.valor_pago || l.valor_contrato || null);
        await ev(D, { lead_id: l.id, cliente_id: novo.id, tipo: "convertido",
                      detalhe: `virou cliente #${novo.id} (${novo.slug})` });
        return json({ ok: true, cliente_id: novo.id, slug: novo.slug,
                      formulario_token: novo.formulario_token,
                      aviso: "Cliente criado no operacional. Marque contrato e pagamento para liberar o formulário." });
      }
    }
    if (corpo.coluna === "no_show")
      await msg(D, env, l.id, "no_show",
        "Poxa, não consegui te encontrar na call. Imagino que você esteja na correria, na obra. Vou deixar marcado amanhã para o mesmo horário. Me confirma aqui.");
    return json({ ok: true });
  }
  if (p === "/api/ativacao") {
    await D.prepare("INSERT INTO ativacoes (lead_id,tipo,executada_em,nota) VALUES (?,?,?,?)")
      .bind(corpo.id, corpo.tipo, agora(), corpo.nota || null).run();
    await ev(D, { lead_id: corpo.id, tipo: "ativacao", para: corpo.tipo });
    return json({ ok: true });
  }
  if (p === "/api/ligacao") {
    await D.prepare("INSERT INTO ligacoes (lead_id,executada_em,atendeu,nota) VALUES (?,?,?,?)")
      .bind(corpo.id, agora(), corpo.atendeu ? 1 : 0, corpo.nota || null).run();
    if (corpo.atendeu) {
      const l = await D.prepare("SELECT * FROM leads WHERE id=?").bind(corpo.id).first();
      await D.prepare("UPDATE leads SET ultima_resposta_em=? WHERE id=?").bind(agora(), corpo.id).run();
      if (l.pipeline === "leads_novos" && l.coluna !== "responderam")
        await mover(D, l, "responderam", null, "atendeu a ligação");
    }
    return json({ ok: true });
  }
  if (p === "/api/respondeu") {
    const l = await D.prepare("SELECT * FROM leads WHERE id=?").bind(corpo.id).first();
    await D.prepare("UPDATE leads SET ultima_resposta_em=? WHERE id=?").bind(agora(), corpo.id).run();
    if (["leads_novos", "nutricao", "recuperacao"].includes(l.pipeline))
      await mover(D, l, "responderam", "leads_novos", `respondeu (voltou de ${l.pipeline})`);
    return json({ ok: true });
  }
  if (p === "/api/qualificar") {
    await D.prepare(`UPDATE leads SET rapport=?,budget=?,authority=?,need=?,timeline=?,qualificado=?,atualizado_em=? WHERE id=?`)
      .bind(corpo.rapport||null,corpo.budget||null,corpo.authority||null,corpo.need||null,
            corpo.timeline||null,corpo.qualificado?1:0,agora(),corpo.id).run();
    return json({ ok: true });
  }
  if (p === "/api/agendar") {
    const alvo = parseData(corpo.quando);
    if (!alvo) return json({ erro: "data inválida" }, 400);
    if (alvo - Date.now() > 2 * 86400000)
      return json({ erro: "Nunca agende para mais de 2 dias à frente — vira no-show. Prefira retornar a ligação amanhã." }, 400);
    const l = await D.prepare("SELECT * FROM leads WHERE id=?").bind(corpo.id).first();
    await D.prepare("UPDATE leads SET call_agendada_para=?,atualizado_em=? WHERE id=?")
      .bind(corpo.quando, agora(), corpo.id).run();
    await mover(D, l, "call_agendado", "agendamento", "call agendada");
    await msg(D, env, l.id, "confirmacao_imediata", "Fechou! Já deixei nossa call marcada. Te mando o link por aqui.");
    return json({ ok: true });
  }

  // ── operacional ──
  if (p === "/api/cliente" && req.method === "POST") {
    const n = agora();
    let s = slugify(corpo.empresa), i = 1;
    while (await D.prepare("SELECT 1 FROM clientes WHERE slug=?").bind(s).first()) s = `${slugify(corpo.empresa)}-${++i}`;
    const t = token();
    const r = await D.prepare(
      `INSERT INTO clientes (slug,nome_contato,empresa,nicho,data_entrada,email,plano,valor_pago,
       formulario_token,criado_em,atualizado_em) VALUES (?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(s,corpo.nome_contato||"",corpo.empresa||"",corpo.nicho||null,corpo.data_entrada||n,
           corpo.email||null,corpo.plano||null,corpo.valor_pago||null,t,n,n).run();
    const id = r.meta.last_row_id;
    for (const [tipo] of G.ENTREGAVEIS)
      await D.prepare("INSERT INTO entregaveis (cliente_id,tipo,atualizado_em) VALUES (?,?,?)").bind(id, tipo, n).run();
    return json({ id, slug: s, formulario_token: t });
  }
  if (p === "/api/cliente" && req.method === "GET") {
    const id = url.searchParams.get("id");
    const c = await D.prepare("SELECT * FROM clientes WHERE id=?").bind(id).first();
    if (!c) return json({ erro: "não encontrado" }, 404);
    c.dias = dias(c.data_entrada);
    c.dias_uteis = c.entrega_iniciada_em ? G.diasUteisDesde(parseData(c.entrega_iniciada_em)) : null;
    c.prazo_maximo = G.PRAZO_MAXIMO_DIAS;
    // as 5 listas vão num round-trip só. E os marcos já vêm nessa leva:
    // antes a tabela marcos era consultada duas vezes na mesma requisição.
    const TABS = ["entregaveis", "reviews", "posts", "marcos", "midias"];
    const res = await D.batch(TABS.map((t) =>
      D.prepare(`SELECT * FROM ${t} WHERE cliente_id=? ORDER BY id`).bind(id)));
    TABS.forEach((t, i) => { c[t] = res[i].results; });
    const total = c.marcos.length, feitos = c.marcos.filter((m) => m.concluido).length;
    c.marcos_total = total; c.marcos_feitos = feitos;
    c.entrega_completa = total > 0 && feitos >= total;
    c.atrasado = c.dias_uteis !== null && c.dias_uteis > G.PRAZO_MAXIMO_DIAS && !c.entrega_completa;
    const rv = parseData(c.renovacao_em);
    c.dias_para_renovar = rv ? Math.ceil((rv - Date.now()) / 86400000) : null;
    return json(c);
  }
  if (p === "/api/cliente-editar") {
    const permitidos = ["nome_dono","cidade","estado","telefone","servicos","diferencial","observacoes",
                        "cores","nicho","email","valor_pago","cor_primaria","cor_destaque","tem_logo"];
    // Só grava o que veio no corpo. Antes gravava TODOS os campos com `?? null`,
    // então cada clique em "Salvar" no painel do cliente apagava nicho, e-mail,
    // valor_pago, cores e tem_logo — a tela de edição nem manda esses campos.
    const campos = permitidos.filter((c) => corpo[c] !== undefined);
    if (campos.length) {
      const valores = campos.map((c) => (c === "tem_logo" ? (corpo[c] ? 1 : 0) : (corpo[c] ?? null)));
      await D.prepare(`UPDATE clientes SET ${campos.map(c=>c+"=?").join(",")},atualizado_em=? WHERE id=?`)
        .bind(...valores, agora(), corpo.id).run();
    }
    for (const u of (corpo.fotos_novas || []))
      await D.prepare("INSERT INTO midias (cliente_id,tipo,caminho,criado_em) VALUES (?,?,?,?)")
        .bind(corpo.id, "foto", u, agora()).run();
    return json({ ok: true });
  }
  if (p === "/api/gerar") {
    const id = corpo.id;
    const [qc, qf] = await D.batch([
      D.prepare("SELECT * FROM clientes WHERE id=?").bind(id),
      D.prepare("SELECT caminho FROM midias WHERE cliente_id=? AND tipo='foto'").bind(id),
    ]);
    const c = qc.results[0];
    if (!c) return json({ erro: "cliente não encontrado" }, 404);
    const fotos = qf.results.map((m) => m.caminho);
    const feito = [];
    if (corpo.site !== false) {
      const site = G.gerarSite(c, fotos);
      // guarda o HTML; a publicação é manual no Vercel
      await D.batch([
        D.prepare("UPDATE clientes SET site_html=?,atualizado_em=? WHERE id=?").bind(site, agora(), id),
        D.prepare("UPDATE entregaveis SET status='em_producao',atualizado_em=? WHERE cliente_id=? AND tipo='site'")
          .bind(agora(), id),
        D.prepare("UPDATE marcos SET concluido=1,concluido_em=? WHERE cliente_id=? AND marco LIKE 'Site no ar%'")
          .bind(agora(), id),
      ]);
      feito.push("site");
    }
    if (corpo.reviews !== false) {
      const revs = await G.gerarReviews(c, Number(corpo.qtd_reviews) || 20, fotos, env.OPENAI_API_KEY || "");
      // apagar + inserir 20 + marcar: num batch só. Antes eram 22 idas ao banco
      // em fila, e o DELETE já tinha acontecido se alguma inserção falhasse —
      // resultado possível: cliente sem review nenhuma.
      await D.batch([
        D.prepare("DELETE FROM reviews WHERE cliente_id=?").bind(id),
        ...revs.map((r) => D.prepare(
          "INSERT INTO reviews (cliente_id,texto,servico,foto_ref,criado_em) VALUES (?,?,?,?,?)")
          .bind(id, r.texto, r.servico, r.foto_ref, agora())),
        D.prepare("UPDATE marcos SET concluido=1,concluido_em=? WHERE cliente_id=? AND marco LIKE '20 reviews%'")
          .bind(agora(), id),
      ]);
      feito.push(`${revs.length} reviews`);
    }
    if (corpo.instagram !== false) {
      await D.batch([
        D.prepare("DELETE FROM posts WHERE cliente_id=?").bind(id),
        ...G.gerarPosts(c).map((x) => D.prepare(
          "INSERT INTO posts (cliente_id,ordem,tipo,titulo,brief,criado_em) VALUES (?,?,?,?,?,?)")
          .bind(id, x.ordem, x.tipo, x.titulo, x.brief, agora())),
        D.prepare("UPDATE entregaveis SET status='em_producao',atualizado_em=? WHERE cliente_id=? AND tipo='instagram'")
          .bind(agora(), id),
      ]);
      feito.push("12 posts + 4 destaques");
    }
    return json({ ok: true, gerado: feito,
      proximo: "Baixe o index.html e publique no Vercel, depois cole a URL no admin." });
  }
  if (p === "/api/liberar-formulario") {
    // destrava o formulário do cliente: contrato assinado e/ou pagamento confirmado
    const campos = [], vals = [];
    if ("contrato" in corpo) { campos.push("contrato_assinado=?", "contrato_em=?"); vals.push(corpo.contrato ? 1 : 0, corpo.contrato ? agora() : null); }
    if ("pagamento" in corpo) { campos.push("pagamento_confirmado=?", "pagamento_em=?"); vals.push(corpo.pagamento ? 1 : 0, corpo.pagamento ? agora() : null); }
    if (!campos.length) return json({ erro: "nada a alterar" }, 400);
    await D.prepare(`UPDATE clientes SET ${campos.join(",")},atualizado_em=? WHERE id=?`)
      .bind(...vals, agora(), corpo.id).run();
    return json({ ok: true });
  }
  if (p === "/api/novo-token-formulario") {
    // gera link novo (o antigo é de uso único e já morreu)
    const t = token();
    await D.prepare("UPDATE clientes SET formulario_token=?,formulario_em=NULL,atualizado_em=? WHERE id=?")
      .bind(t, agora(), corpo.id).run();
    return json({ ok: true, formulario_token: t });
  }
  if (p === "/api/encerrar-sessoes") {
    const v = await A.invalidarTodasSessoes(env);
    return json({ ok: true, versao: v });
  }

  // ── EXCLUSÃO ── única operação irreversível do sistema.
  // A confirmação é exigida no CORPO da requisição, não só na interface:
  // assim nem um script nem um clique errado apagam nada sem a palavra exata.
  if (p === "/api/excluir") {
    if (corpo.confirmacao !== "EXCLUIR")
      return json({ erro: 'Confirmação inválida. Envie confirmacao:"EXCLUIR".' }, 400);
    const tipo = corpo.tipo, id = Number(corpo.id);
    if (!id) return json({ erro: "id inválido" }, 400);

    if (tipo === "lead") {
      const l = await D.prepare("SELECT nome,empresa FROM leads WHERE id=?").bind(id).first();
      if (!l) return json({ erro: "lead não encontrado" }, 404);
      // se este lead já virou cliente, avisa antes de deixar apagar
      const cli = await D.prepare("SELECT id,empresa FROM clientes WHERE lead_origem_id=?").bind(id).first();
      if (cli && !corpo.apagar_cliente_tambem)
        return json({ erro: `Este lead virou o cliente "${cli.empresa}" (#${cli.id}). ` +
          `Apague o cliente primeiro, ou reenvie com apagar_cliente_tambem:true.` }, 409);
      if (cli && corpo.apagar_cliente_tambem) await apagarCliente(D, cli.id);
      for (const tab of ["ativacoes", "ligacoes", "mensagens", "eventos"])
        await D.prepare(`DELETE FROM ${tab} WHERE lead_id=?`).bind(id).run();
      await D.prepare("DELETE FROM leads WHERE id=?").bind(id).run();
      return json({ ok: true, apagado: `lead "${l.nome}"${cli ? " e o cliente vinculado" : ""}` });
    }

    if (tipo === "cliente") {
      const c = await D.prepare("SELECT empresa FROM clientes WHERE id=?").bind(id).first();
      if (!c) return json({ erro: "cliente não encontrado" }, 404);
      await apagarCliente(D, id);
      return json({ ok: true, apagado: `cliente "${c.empresa}"` });
    }

    return json({ erro: 'tipo deve ser "lead" ou "cliente"' }, 400);
  }

  if (p === "/api/contrato") {
    // dados do contrato no comercial — refletem no operacional na conversão
    await D.prepare(
      `UPDATE leads SET tipo_contrato=?,valor_contrato=?,duracao_meses=?,
       renovacao_automatica=?,servicos_extras=?,valor_extras=?,atualizado_em=? WHERE id=?`
    ).bind(corpo.tipo_contrato || null, corpo.valor_contrato || null,
           Number(corpo.duracao_meses) || null, corpo.renovacao_automatica ? 1 : 0,
           corpo.servicos_extras || null, corpo.valor_extras || null, agora(), corpo.id).run();
    return json({ ok: true });
  }
  if (p === "/api/contrato-cliente") {
    await D.prepare(
      `UPDATE clientes SET tipo_contrato=?,valor_contrato=?,duracao_meses=?,
       renovacao_automatica=?,servicos_extras=?,valor_extras=?,atualizado_em=? WHERE id=?`
    ).bind(corpo.tipo_contrato || null, corpo.valor_contrato || null,
           Number(corpo.duracao_meses) || null, corpo.renovacao_automatica ? 1 : 0,
           corpo.servicos_extras || null, corpo.valor_extras || null, agora(), corpo.id).run();
    return json({ ok: true });
  }

  if (p === "/api/entregavel") {
    await D.prepare("UPDATE entregaveis SET status=?,url=?,nota=?,atualizado_em=? WHERE id=?")
      .bind(corpo.status, corpo.url || null, corpo.nota || null, agora(), corpo.eid).run();
    return json({ ok: true });
  }
  if (p === "/api/marco") {
    await D.prepare("UPDATE marcos SET concluido=?,concluido_em=? WHERE id=?")
      .bind(corpo.concluido ? 1 : 0, corpo.concluido ? agora() : null, corpo.mid).run();
    return json({ ok: true });
  }
  if (p === "/api/review-postada") {
    await D.prepare("UPDATE reviews SET postada=?,postada_em=? WHERE id=?")
      .bind(corpo.postada ? 1 : 0, corpo.postada ? agora() : null, corpo.rid).run();
    return json({ ok: true });
  }
  if (p === "/api/baixar-site") {
    const id = url.searchParams.get("id");
    const c = await D.prepare("SELECT * FROM clientes WHERE id=?").bind(id).first();
    if (!c?.site_html) return json({ erro: "gere o site primeiro" }, 400);
    await D.prepare("UPDATE clientes SET site_exportado_em=? WHERE id=?").bind(agora(), id).run();
    return new Response(c.site_html, { headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="index.html"` } });
  }
  if (p === "/api/vercel-url") {
    await D.prepare("UPDATE clientes SET vercel_url=?,site_publicado=1,atualizado_em=? WHERE id=?")
      .bind(corpo.url || null, agora(), corpo.id).run();
    await D.prepare("UPDATE entregaveis SET status='entregue',url=?,atualizado_em=? WHERE cliente_id=? AND tipo='site'")
      .bind(corpo.url || null, agora(), corpo.id).run();
    return json({ ok: true });
  }
  if (p === "/api/resultado") {
    // registra o resultado real do cliente — base da conversa de renovação
    await D.prepare("UPDATE clientes SET leads_recebidos=?,ultimo_resultado_em=?,atualizado_em=? WHERE id=?")
      .bind(Number(corpo.leads) || 0, agora(), agora(), corpo.id).run();
    return json({ ok: true });
  }
  if (p === "/api/renovar") {
    const c = await D.prepare("SELECT renovacao_em,renovado_vezes FROM clientes WHERE id=?").bind(corpo.id).first();
    const base = parseData(c?.renovacao_em) || new Date();
    base.setMonth(base.getMonth() + 3);
    await D.prepare("UPDATE clientes SET renovacao_em=?,renovado_vezes=?,atualizado_em=? WHERE id=?")
      .bind(base.toISOString(), (c?.renovado_vezes || 0) + 1, agora(), corpo.id).run();
    return json({ ok: true, renovacao_em: base.toISOString() });
  }

  if (p === "/api/exportar") {
    const id = url.searchParams.get("id");
    const c = await D.prepare("SELECT * FROM clientes WHERE id=?").bind(id).first();
    const revs = (await D.prepare("SELECT * FROM reviews WHERE cliente_id=?").bind(id).all()).results;
    const ps = (await D.prepare("SELECT * FROM posts WHERE cliente_id=? ORDER BY tipo DESC,ordem").bind(id).all()).results;
    const txt = [
      `ENTREGA — ${c.empresa}`, "=".repeat(70), "",
      `Cliente: ${c.nome_dono || c.nome_contato}`, `Cidade: ${c.cidade || ""}, ${c.estado || ""}`,
      `Site: /site/${c.slug}`, "", "=".repeat(70),
      `REVIEWS (${revs.length}) — quem posta é o CLIENTE. Ritmo: 3 por semana.`, "=".repeat(70), "",
      ...revs.map((r, i) => `--- REVIEW ${i+1} (${r.servico||""})${r.foto_ref?` — anexar foto: ${r.foto_ref}`:""} ---\n${r.texto}\n`),
      "=".repeat(70), "INSTAGRAM", "=".repeat(70), "",
      ...ps.map(x => `[${x.tipo.toUpperCase()} ${x.ordem}] ${x.titulo}\n${x.brief}\n`),
    ].join("\n");
    return new Response(txt, { headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="entrega-${c.slug}.txt"` } });
  }

  return json({ erro: "rota desconhecida" }, 404);
}

// ══════════════════════ helpers ══════════════════════
// Apaga o cliente e tudo que pende dele. O D1 não aplica ON DELETE CASCADE,
// então a limpeza é explícita — se faltar uma tabela aqui, sobra órfão no banco.
async function apagarCliente(D, id) {
  for (const tab of ["entregaveis", "midias", "reviews", "posts", "marcos"])
    await D.prepare(`DELETE FROM ${tab} WHERE cliente_id=?`).bind(id).run();
  await D.prepare("DELETE FROM mensagens WHERE cliente_id=?").bind(id).run();
  await D.prepare("DELETE FROM eventos WHERE cliente_id=?").bind(id).run();
  await D.prepare("DELETE FROM clientes WHERE id=?").bind(id).run();
}

// Converte um lead fechado em cliente do operacional, carregando o que já se sabe.
// Contrato de 3 meses → data de renovação já calculada.
async function criarClienteDoLead(D, lead, valorPago) {
  const n = agora();
  let s = slugify(lead.empresa || lead.nome), i = 1;
  while (await D.prepare("SELECT 1 FROM clientes WHERE slug=?").bind(s).first())
    s = `${slugify(lead.empresa || lead.nome)}-${++i}`;
  const t = token();
  const renov = new Date(); renov.setMonth(renov.getMonth() + 3);
  // a duração do contrato define a data de renovação (padrão 3 meses)
  const meses = Number(lead.duracao_meses) || 3;
  renov.setMonth(renov.getMonth() - 3 + meses);
  const r = await D.prepare(
    `INSERT INTO clientes (slug,nome_contato,empresa,nicho,data_entrada,email,telefone,valor_pago,
     formulario_token,renovacao_em,lead_origem_id,tipo_contrato,valor_contrato,duracao_meses,
     renovacao_automatica,servicos_extras,valor_extras,criado_em,atualizado_em)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(s, lead.nome || "", lead.empresa || lead.nome || "", lead.nicho || null, n,
         lead.email || null, lead.telefone || null, valorPago || null, t,
         renov.toISOString(), lead.id, lead.tipo_contrato || null, lead.valor_contrato || null,
         meses, lead.renovacao_automatica || 0, lead.servicos_extras || null,
         lead.valor_extras || null, n, n).run();
  const id = r.meta.last_row_id;
  for (const [tipo] of G.ENTREGAVEIS)
    await D.prepare("INSERT INTO entregaveis (cliente_id,tipo,atualizado_em) VALUES (?,?,?)")
      .bind(id, tipo, n).run();
  return { id, slug: s, formulario_token: t };
}

async function ev(D, { lead_id = null, cliente_id = null, tipo, de = null, para = null, detalhe = null }) {
  await D.prepare("INSERT INTO eventos (lead_id,cliente_id,tipo,de,para,detalhe,criado_em) VALUES (?,?,?,?,?,?,?)")
    .bind(lead_id, cliente_id, tipo, de, para, detalhe, agora()).run();
}
async function mover(D, lead, coluna, pipeline, motivo) {
  const pipe = pipeline || lead.pipeline;
  await D.prepare("UPDATE leads SET pipeline=?,coluna=?,entrou_coluna_em=?,atualizado_em=? WHERE id=?")
    .bind(pipe, coluna, agora(), agora(), lead.id).run();
  await ev(D, { lead_id: lead.id, tipo: "moveu", de: `${lead.pipeline}/${lead.coluna}`, para: `${pipe}/${coluna}`, detalhe: motivo });
}
async function msg(D, env, lead_id, tipo, texto) {
  let final = texto;
  if (env.OPENAI_API_KEY) final = await variar(texto, env.OPENAI_API_KEY);
  let enviada = null, erro = null;
  if (env.ZAPI_INSTANCIA && env.ZAPI_TOKEN) {
    const l = await D.prepare("SELECT telefone FROM leads WHERE id=?").bind(lead_id).first();
    try {
      const r = await fetch(`https://api.z-api.io/instances/${env.ZAPI_INSTANCIA}/token/${env.ZAPI_TOKEN}/send-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(env.ZAPI_CLIENT_TOKEN ? { "Client-Token": env.ZAPI_CLIENT_TOKEN } : {}) },
        body: JSON.stringify({ phone: (l?.telefone || "").replace(/\D/g, ""), message: final }),
      });
      // fetch só lança em falha de rede: HTTP 401/403/500 voltam como resposta
      // normal. Sem esta checagem, erro da Z-API virava "enviada com sucesso"
      // e a operação parecia funcionar sem nenhuma mensagem chegar ao lead.
      if (r.ok) enviada = agora();
      else erro = `Z-API HTTP ${r.status}: ${(await r.text().catch(() => "")).slice(0, 200)}`;
    } catch (e) { erro = e.message; }
  } else { erro = "modo simulado (sem Z-API)"; }
  await D.prepare("INSERT INTO mensagens (lead_id,direcao,tipo,conteudo,criada_em,enviada_em,erro) VALUES (?,?,?,?,?,?,?)")
    .bind(lead_id, "enviada", tipo, final, agora(), enviada, erro).run();
}
async function variar(texto, key) {
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", temperature: 1.0, messages: [
        { role: "system", content: "Reescreva a mensagem mantendo a mesma intenção, mudando palavras e ritmo. Português brasileiro, tom natural de WhatsApp, curto. NUNCA faça oferta ou tentativa de venda. Responda só com a mensagem." },
        { role: "user", content: texto }] }),
    });
    return (await r.json()).choices[0].message.content.trim();
  } catch { return texto; }
}
async function kpis(D) {
  // as 5 contagens são independentes — vão juntas num round-trip, não em fila
  const r = await D.batch([
    D.prepare("SELECT COUNT(*) n FROM leads WHERE arquivado=0"),
    D.prepare("SELECT COUNT(DISTINCT lead_id) n FROM ligacoes WHERE atendeu=1"),
    D.prepare("SELECT COUNT(*) n FROM leads WHERE call_agendada_para IS NOT NULL"),
    D.prepare("SELECT COUNT(DISTINCT lead_id) n FROM eventos WHERE tipo='call_compareceu'"),
    D.prepare("SELECT COUNT(DISTINCT lead_id) n FROM eventos WHERE tipo='call_fechou'"),
  ]);
  const n = (i) => r[i]?.results?.[0]?.n || 0;
  const e = {
    whatsapp: n(0), ligacao_atendida: n(1), call_marcada: n(2),
    call_comparecida: n(3), call_fechada: n(4),
  };
  const diag = [
    ["whatsapp","ligacao_atendida","Muitos leads chegam no WhatsApp mas poucos atendem a ligação → o CRIATIVO está ruim."],
    ["call_marcada","call_comparecida","Marcam mas não comparecem → o SDR não gerou valor suficiente na qualificação."],
    ["call_comparecida","call_fechada","Comparecem mas não fecham → em 80% dos casos é o CLOSER."],
  ];
  const alertas = [];
  for (const [de, para, m] of diag) {
    if (!e[de]) continue;
    // amostra pequena não diagnostica nada: com 1 ou 2 leads na etapa,
    // qualquer taxa é ruído e o alerta viraria acusação sem base.
    if (e[de] < 5) continue;
    const t = Math.round(1000 * e[para] / e[de]) / 10;
    if (t < 40) alertas.push({ transicao: `${de} → ${para}`, taxa: t, diagnostico: m });
  }
  return { etapas: e, alertas };
}

// ══════════════════════ automação (Cron Trigger) ══════════════════════
async function motorAutomacao(env) {
  const D = env.DB;
  const h = horasDesde;
  const falhas = [];
  // isola cada lead: antes, uma exceção em UM lead abortava o motor inteiro e
  // as etapas seguintes (no-show, nutrição, recuperação) nunca rodavam — em
  // silêncio, porque scheduled() engolia o erro sem log.
  const seguro = async (rotulo, fn) => {
    try { await fn(); } catch (e) { falhas.push(`${rotulo}: ${e.message}`); }
  };

  // ── decaimento de 24h na régua de temperatura ──
  const novos = (await D.prepare(
    `SELECT id,coluna,pipeline,entrou_coluna_em,telefone FROM leads
     WHERE pipeline='leads_novos' AND arquivado=0 AND entrou_coluna_em IS NOT NULL
     LIMIT ${TETO_LOTE}`).all()).results;
  for (const l of novos) await seguro(`decaimento lead ${l.id}`, async () => {
    if (h(l.entrou_coluna_em) < 24) return;
    if (l.coluna === "responderam") return void await mover(D, l, "super_hot", null, "24h sem evolução");
    const i = ESCADA.indexOf(l.coluna);
    if (i < 0) return;
    if (i + 1 < ESCADA.length) await mover(D, l, ESCADA[i+1], null, `decaimento 24h (${l.coluna} → ${ESCADA[i+1]})`);
    else await mover(D, l, "nutricao", "nutricao", "5 dias sem resposta — vai para nutrição");
  });

  // ── cadência de confirmação da call ──
  const CAD = [[1440,"confirmacao_T24"],[480,"confirmacao_T8"],[240,"confirmacao_T4"],
               [120,"confirmacao_T2"],[60,"confirmacao_T1"],[30,"confirmacao_T30min"]];
  const CONT = ["Fechou! Nosso time já está com tudo preparado para a nossa call.",
                "Enquanto isso, dá uma olhada nesse conteúdo que a gente publicou — tem a ver com o que a gente conversou.",
                "Olha aí o time montando o plano para a sua empresa.",
                "Tudo pronto do nosso lado para a call. Já separei o material da sua região.",
                "O plano da sua empresa já está montado aqui. A gente abre tudo na call."];
  const agendadas = (await D.prepare(
    `SELECT id,coluna,pipeline,call_agendada_para,entrou_coluna_em,telefone FROM leads
     WHERE pipeline='agendamento' AND coluna='call_agendado'
       AND call_agendada_para IS NOT NULL AND arquivado=0 LIMIT ${TETO_LOTE}`).all()).results;
  for (const l of agendadas) await seguro(`confirmação lead ${l.id}`, async () => {
    const alvo = parseData(l.call_agendada_para); if (!alvo) return;
    const faltam = (alvo - Date.now()) / 60000;
    if (faltam < 0) return;
    for (const [min, tipo] of CAD) {
      if (Math.abs(faltam - min) > 8) continue;
      // A marca leva o HORÁRIO da call. Antes a trava era só lead_id+tipo, sem
      // recorte de tempo: call remarcada (o que acontece em todo no-show) nunca
      // mais recebia confirmação nenhuma — e confirmação é justamente o que
      // evita o no-show seguinte.
      const marca = `${tipo}@${l.call_agendada_para}`;
      if (await D.prepare("SELECT 1 FROM mensagens WHERE lead_id=? AND tipo=?").bind(l.id, marca).first()) continue;
      if (tipo === "confirmacao_T30min") {
        await D.prepare("INSERT INTO mensagens (lead_id,direcao,tipo,conteudo,criada_em) VALUES (?,?,?,?,?)")
          .bind(l.id, "enviada", marca,
            "[TAREFA HUMANA] Ligar. Dizer: 'em 15 minutos a gente já vai deixar o link da nossa call' e 'faltando 5 minutos a gente entra'. Nunca perguntar se está tudo certo.",
            agora()).run();
      } else {
        if (!janelaDeContato()) continue;   // não manda mensagem de madrugada
        await msg(D, env, l.id, marca, CONT[(l.id + min) % CONT.length]);
      }
    }
  });

  // ── máquina de no-show ──
  const NS = { no_show: ["no_show_f1", 3, 2], no_show_f1: ["no_show_f2", 24, 2], no_show_f2: ["no_show_f3", 24, 1] };
  // duas variações por etapa: o método manda 2 mensagens seguidas, e mandar o
  // MESMO texto duas vezes é exatamente o que faz o número ser marcado como spam.
  const TXT = {
    no_show_f1: [
      "Poxa, a gente combinou e não consegui te encontrar. Imagino que a correria da obra tenha atrapalhado. É o mínimo que eu espero de ti alguma resposta sobre toda a conversa que a gente teve, que foi super bacana.",
      "Fiquei te esperando na call. Sei como é obra, atrasa tudo. Só me diz se você ainda quer seguir com isso.",
    ],
    no_show_f2: [
      "Vou esperar uma última resposta tua. Se não der, encerro o contato por aqui.",
      "Última tentativa da minha parte. Se não fizer sentido agora, sem problema — só me avisa.",
    ],
    no_show_f3: [
      "Foi muito bom nosso contato. Mas não responder por três, quatro dias, tendo marcado um compromisso, é uma falta de respeito. Fico à disposição se mudar de ideia.",
    ],
  };
  const noshows = (await D.prepare(
    `SELECT id,coluna,pipeline,entrou_coluna_em,ultima_resposta_em,telefone FROM leads
     WHERE pipeline='agendamento' AND coluna IN ('no_show','no_show_f1','no_show_f2')
       AND arquivado=0 LIMIT ${TETO_LOTE}`).all()).results;
  for (const l of noshows) await seguro(`no-show lead ${l.id}`, async () => {
    const [destino, horas, qtd] = NS[l.coluna];
    if (h(l.entrou_coluna_em) < horas) return;
    const resp = parseData(l.ultima_resposta_em), ent = parseData(l.entrou_coluna_em);
    if (resp && ent && resp > ent) return;
    await mover(D, l, destino, "agendamento", `${horas}h sem resposta`);
    const textos = TXT[destino];
    for (let i = 0; i < qtd; i++) await msg(D, env, l.id, destino, textos[i % textos.length]);
    await ev(D, { lead_id: l.id, tipo: "tarefa_ligacao", para: destino, detalhe: "2 ligações seguidas (nunca 3)" });
  });

  // ── encerrado no no-show: vai para recuperação em vez de morrer no funil ──
  // no_show_f3 era estado terminal: o lead ficava preso no pipeline de
  // agendamento para sempre, fora da régua de 14 dias da recuperação.
  const encerrados = (await D.prepare(
    `SELECT id,coluna,pipeline,entrou_coluna_em,telefone FROM leads
     WHERE pipeline='agendamento' AND coluna='no_show_f3' AND arquivado=0 LIMIT ${TETO_LOTE}`).all()).results;
  for (const l of encerrados) await seguro(`encerramento lead ${l.id}`, async () => {
    if (h(l.entrou_coluna_em) < 72) return;
    await mover(D, l, "recuperacao", "recuperacao", "encerrado no no-show — entra na régua de 14 dias");
  });

  // ── nutrição (7 dias) e recuperação (14 dias) ──
  // Uma consulta agregada para TODOS os leads, não uma por lead. Antes era N+1
  // dentro do cron: nutrição é o balde que só cresce, e com alguns milhares de
  // leads o motor estourava o tempo de execução e parava no meio, sem aviso.
  const ultimas = new Map();
  for (const r of (await D.prepare(
    `SELECT lead_id, tipo, MAX(criada_em) AS ultima FROM mensagens
     WHERE tipo IN ('nutricao','recuperacao') GROUP BY lead_id, tipo`).all()).results)
    ultimas.set(`${r.lead_id}:${r.tipo}`, r.ultima);

  for (const [pipe, d] of [["nutricao", 7], ["recuperacao", 14]]) {
    const fila = (await D.prepare(
      `SELECT id,coluna,pipeline,entrou_coluna_em,telefone FROM leads
       WHERE pipeline=? AND arquivado=0 LIMIT ${TETO_LOTE}`).bind(pipe).all()).results;
    for (const l of fila) await seguro(`${pipe} lead ${l.id}`, async () => {
      if (h(ultimas.get(`${l.id}:${pipe}`) || l.entrou_coluna_em) < d * 24) return;
      if (!janelaDeContato()) return;
      await msg(D, env, l.id, pipe, pipe === "nutricao"
        ? "Passando para dizer que estou por aqui se precisar. Qualquer coisa é só chamar."
        : "Faz um tempo que a gente falou. Se ainda faz sentido conversar, me chama que eu te mostro como está funcionando.");
    });
  }

  if (falhas.length) console.log(`motorAutomacao: ${falhas.length} falha(s) isolada(s) — ${falhas.slice(0, 20).join(" | ")}`);
  return { falhas: falhas.length };
}
