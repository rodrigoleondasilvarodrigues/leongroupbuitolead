// Leon Group — Worker único: admin protegido + sites dos clientes + formulário público.
import * as G from "./geradores.js";
import * as A from "./auth.js";
import * as M from "./marca.js";
import * as Arq from "./arquivos.js";
import * as Ativ from "./ativacoes.js";
import * as Ct from "./contrato.js";
import { contratoFormHTML, contratoLerHTML, contratoAceitoHTML,
         contratoIndisponivelHTML } from "./pagina-contrato.js";
import * as F from "./funil.js";
import { criarContextoIA, validarContexto } from "./ai-contexto.js";
import { promptLogo, faltaNoBriefing, refinarComIA } from "./logo-prompt.js";
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
const MIN_FOTOS = G.MIN_FOTOS;   // uma definição só, em geradores.js
const TETO_LOTE = 500;
/* Origens do site público autorizadas a mandar lead para o CRM.
   Acrescentar aqui o domínio próprio quando existir. */
const ORIGENS_SITE = [
  "https://leon-group-site.pages.dev",
];  // leads processados por rodada do cron, por etapa

// O público está nos EUA (prioridade Massachusetts/Boston). O Worker roda em UTC,
// então sem isto uma mensagem de follow-up dispara 3h da manhã no fuso do lead —
// o jeito mais rápido de o número ser denunciado como spam.
function horaLocalEUA(quando = new Date()) {
  const h = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", hour: "numeric", hour12: false }).format(quando);
  return Number(h) % 24;
}
const janelaDeContato = () => { const h = horaLocalEUA(); return h >= 8 && h < 21; };
// O operador está no Brasil. Lembrete de tarefa segue o horário DELE, não o
// do lead: resumo do dia chegando 4h da manhã não serve pra nada.
function horaLocalBrasil(quando = new Date()) {
  const h = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo", hour: "numeric", hour12: false }).format(quando);
  return Number(h) % 24;
}
const diaBrasil = (quando = new Date()) => new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(quando);
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
/* Cota de ativação por dia, por coluna. Antes só o pipeline 1 tinha número:
   quem estava em agendamento, nutrição ou recuperação via "0 ativações/dia" e
   o card parecia dizer "não faça nada", que é o oposto do que a régua manda.

   Os números do pipeline 1 vêm da aula. Os outros são derivados da lógica da
   régua: quem tem call marcada não precisa de ativação (a cadência de
   confirmação já cuida), quem deu no-show precisa de muita, e nutrição é
   contato raro de propósito. */
const ATIV_DIA = {
  // pipeline 1: quanto mais frio, menos toque, para não queimar o número
  responderam: 0, super_hot: 10, hot: 7, warm: 5, cold: 3, super_cold: 2,
  // pipeline 2: a cadência de confirmação já roda sozinha nestes
  call_agendado: 0, call_rolando: 0, fechou: 0,
  // no-show é onde o follow-up decide a venda
  no_show: 6, no_show_f1: 4, no_show_f2: 3, no_show_f3: 1,
  // recusou: um toque a cada tanto, sem insistir
  recusou: 1,
  // pipelines 3 e 4
  recuperacao: 2, nutricao: 1,
};
const PIPELINES = {
  leads_novos: [["responderam","Responderam"],["super_hot","Super Hot"],["hot","Hot"],
                ["warm","Warm"],["cold","Cold"],["super_cold","Super Cold"]],
  agendamento: [["call_agendado","Call Agendado"],["call_rolando","Call Rolando"],["no_show","No Show"],
                ["no_show_f1","No Show F1"],["no_show_f2","No Show F2"],["no_show_f3","No Show F3"],
                ["fechou","Fechou ✓"],["recusou","Recusou"]],
  recuperacao: [["recuperacao","Recuperação"]],
  nutricao: [["nutricao","Nutrição"]],
};
/* O catálogo agora vive em ativacoes.js, junto com o playbook de cada uma:
   ter a lista num arquivo e o conteúdo em outro garantia que um dia entrasse
   ativação sem playbook, e o operador clicaria num botão que não ensina nada.

   ⚠ MUDANÇA DE COMPORTAMENTO: a ativação "Comprovante de Zelle falso" SAIU.
   Ela era engodo declarado, mantida antes por decisão explícita do usuário.
   No lugar entrou "PDF de follow-up", com o prompt que ELE escreveu, que usa
   a mesma estética de fintech para chamar atenção mas carrega crachá
   obrigatório "FOLLOW-UP — NOT A PAYMENT" e proíbe por escrito qualquer valor,
   número de transação ou confirmação de pagamento. Mesmo efeito de atenção,
   sem fingir transação. Ver o comentário no topo de ativacoes.js. */
const CATALOGO = Ativ.CATALOGO;

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const p = url.pathname;
    const ip = req.headers.get("CF-Connecting-IP") || "0.0.0.0";
    const origem = req.headers.get("Origin") || "";

    try {
      /* ───────── ícone da marca ─────────
         Antes do portão de sessão porque a aba de login, o formulário do
         cliente e as páginas de aviso também mostram o leão. É o mesmo
         arquivo que o site da agência usa. */
      const icone = M.rotaIcone(p);
      if (icone) return icone;

      /* ───────── mídia dos clientes (R2) ─────────
         Público e sem cookie: o site do cliente é publicado no Vercel, em
         outro domínio, e busca as fotos daqui. A chave é um UUID, então o
         link não é adivinhável, mas o conteúdo é feito para ser visto. */
      if (p.startsWith("/m/")) {
        const r = await Arq.servir(env, p);
        if (r) return r;
        return new Response("não encontrado", { status: 404 });
      }

      // Sites dos clientes NÃO são servidos aqui — vão 100% para o Vercel,
      // com deploy manual. O admin baixa o index.html em /api/baixar-site.
      /* ═════════ público: o contrato ═════════
         Vem ANTES do formulário de onboarding no fluxo: o cliente aceita o
         contrato, o pagamento é confirmado, e só então o onboarding abre.
         O aceite aqui liga a chave `contrato_assinado`, que é metade do
         portão que o sistema já tinha. */
      if (p.startsWith("/c/")) {
        const t = p.slice(3).replace(/\/$/, "");
        const c = await env.DB.prepare("SELECT * FROM clientes WHERE contrato_token=?")
          .bind(t).first();
        if (!c) return html(contratoIndisponivelHTML(
          "Este link de contrato não existe ou foi substituído por um novo."), 404);
        // já aceito: mostra a via dele, não deixa aceitar de novo
        if (c.contrato_aceito_em)
          return html(contratoAceitoHTML(c, Ct.textoContrato(c)));
        // sem os dados legais ainda, ou ele pediu para voltar e corrigir
        const querEditar = url.searchParams.get("editar") === "1";
        if (!c.razao_social || querEditar) return html(contratoFormHTML(c, t));
        return html(contratoLerHTML(c, t, Ct.textoContrato(c)));
      }
      if (p.startsWith("/api/contrato-dados/") && req.method === "POST") {
        const t = p.slice(20);
        if (await A.bloqueadoPorTentativas(env, ip, "contrato"))
          return json({ erro: "Muitas tentativas. Aguarde." }, 429);
        const c = await env.DB.prepare(
          "SELECT id,contrato_aceito_em FROM clientes WHERE contrato_token=?").bind(t).first();
        if (!c) { await A.registrarTentativa(env, ip, false, "contrato");
                  return json({ erro: "link inválido" }, 404); }
        if (c.contrato_aceito_em)
          return json({ erro: "Este contrato já foi aceito e não pode mais ser alterado." }, 409);
        const b = await req.json().catch(() => ({}));
        const corta = (v, n) => String(v ?? "").trim().slice(0, n);
        const campos = {
          razao_social: corta(b.razao_social, 160),
          tipo_entidade: corta(b.tipo_entidade, 40),
          nome_dono: corta(b.nome_dono, 120),
          email_contrato: corta(b.email_contrato, 160),
          endereco: corta(b.endereco, 160),
          endereco_cidade: corta(b.endereco_cidade, 80),
          endereco_estado: corta(b.endereco_estado, 2).toUpperCase(),
          endereco_zip: corta(b.endereco_zip, 12),
        };
        const falta = Object.entries(campos).filter(([, v]) => !v).map(([k]) => k);
        if (falta.length) return json({ erro: "Faltam campos: " + falta.join(", ") }, 400);
        if (!campos.email_contrato.includes("@")) return json({ erro: "E-mail inválido." }, 400);
        await env.DB.prepare(`UPDATE clientes SET razao_social=?,tipo_entidade=?,nome_dono=?,
          email_contrato=?,endereco=?,endereco_cidade=?,endereco_estado=?,endereco_zip=?,
          atualizado_em=? WHERE id=?`)
          .bind(...Object.values(campos), agora(), c.id).run();
        await ev(env.DB, { cliente_id: c.id, tipo: "contrato_preenchido",
                           detalhe: "cliente preencheu os dados legais" });
        return json({ ok: true });
      }
      if (p.startsWith("/api/contrato-aceitar/") && req.method === "POST") {
        const t = p.slice(22);
        if (await A.bloqueadoPorTentativas(env, ip, "contrato"))
          return json({ erro: "Muitas tentativas. Aguarde." }, 429);
        const c = await env.DB.prepare("SELECT * FROM clientes WHERE contrato_token=?")
          .bind(t).first();
        if (!c) { await A.registrarTentativa(env, ip, false, "contrato");
                  return json({ erro: "link inválido" }, 404); }
        if (c.contrato_aceito_em) return json({ erro: "Este contrato já foi aceito." }, 409);
        if (!c.razao_social) return json({ erro: "Preencha seus dados antes de aceitar." }, 400);
        const b = await req.json().catch(() => ({}));
        const nome = String(b.nome ?? "").trim().slice(0, 120);
        if (!b.li) return json({ erro: "Marque a confirmação de leitura." }, 400);
        if (nome.length < 5 || !nome.includes(" "))
          return json({ erro: "Digite seu nome completo, com sobrenome." }, 400);

        /* O hash é do texto que o SERVIDOR gera agora, com os mesmos dados que
           foram exibidos. É o que permite provar, depois, com qual redação
           exata a pessoa concordou. */
        const texto = Ct.textoContrato({ ...c, contrato_aceito_em: null });
        const hash = await Ct.hashDoTexto(texto);
        const n = agora();
        /* A condição no WHERE é a trava: dois cliques simultâneos no botão não
           gravam dois aceites com horas diferentes. */
        const gravou = await env.DB.prepare(`UPDATE clientes SET contrato_aceito_em=?,
          contrato_aceito_nome=?,contrato_aceito_ip=?,contrato_aceito_agente=?,
          contrato_versao=?,contrato_hash=?,contrato_assinado=1,contrato_em=?,
          atualizado_em=? WHERE id=? AND contrato_aceito_em IS NULL`)
          .bind(n, nome, ip, String(req.headers.get("User-Agent") || "").slice(0, 250),
                Ct.VERSAO_CONTRATO, hash, n, n, c.id).run();
        if (!gravou.meta.changes) return json({ erro: "Este contrato já foi aceito." }, 409);
        await ev(env.DB, { cliente_id: c.id, tipo: "contrato_aceito",
                           detalhe: `${nome} aceitou a versão ${Ct.VERSAO_CONTRATO}` });
        await avisarOperador(env.DB, env, "contrato_aceito",
          `${c.empresa} aceitou o contrato. Confirme o pagamento para liberar o formulário.`);
        return json({ ok: true });
      }

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
        // Sem armazenamento configurado o formulário não oferece o seletor de
        // arquivo: melhor não mostrar um botão que vai falhar do que mostrar e
        // deixar o cliente achando que o problema é o celular dele.
        return html(formularioHTML(c, t, { upload: Arq.temR2(env) }));
      }
      /* ───────── público: o cliente subindo foto e vídeo do celular ─────────
         Um arquivo por requisição. Não é multipart de propósito: 15 fotos num
         POST só estouram o corpo do Worker e as 15 falham juntas. Uma por vez
         mostra progresso, e a que falhar falha sozinha.

         O portão é o mesmo do formulário (contrato, pagamento, link não
         consumido), porque isso grava no banco em nome do cliente. */
      if (p.startsWith("/api/subir/")) {
        const t = p.slice(11).replace(/\/$/, "");
        if (await A.bloqueadoPorTentativas(env, ip, "upload"))
          return json({ erro: "Muitos envios em sequência. Espere um minuto e continue." }, 429);
        const c = await env.DB.prepare(
          `SELECT id,formulario_em,contrato_assinado,pagamento_confirmado
           FROM clientes WHERE formulario_token=?`).bind(t).first();
        if (!c) { await A.registrarTentativa(env, ip, false, "upload"); return json({ erro: "token inválido" }, 404); }
        if (!c.contrato_assinado || !c.pagamento_confirmado)
          return json({ erro: "Formulário ainda não liberado." }, 403);
        if (c.formulario_em) return json({ erro: "Este formulário já foi respondido." }, 410);

        // GET devolve o que já subiu. Serve para quando o navegador do celular
        // mata a aba no meio do upload: ao voltar, a lista continua lá em vez
        // de o cliente achar que perdeu tudo e mandar de novo.
        if (req.method === "GET") {
          const { results } = await env.DB.prepare(
            `SELECT id,slot,nome,mime,bytes,chave FROM arquivos
             WHERE cliente_id=? AND origem='cliente' ORDER BY id`).bind(c.id).all();
          return json({ arquivos: results.map((a) => ({
            id: a.id, tipo: a.slot, nome: a.nome, mime: a.mime, bytes: a.bytes,
            url: Arq.urlDe(a.chave) })) });
        }
        if (req.method !== "POST") return json({ erro: "método" }, 405);

        const tipo = url.searchParams.get("tipo") || "foto";
        if (!["foto", "video", "logo"].includes(tipo)) return json({ erro: "tipo inválido" }, 400);
        const r = await Arq.receber(env, req, {
          cliente_id: c.id, origem: "cliente", destino: "cliente", slot: tipo,
          nome: url.searchParams.get("nome") || "",
        });
        if (r.erro) return json({ erro: r.erro }, r.status || 400);
        return json(r);
      }
      // O cliente apagando algo que ele mesmo acabou de subir (mandou a foto
      // errada). Só o que veio dele, e só antes de o formulário ser enviado.
      if (p.startsWith("/api/remover/") && req.method === "POST") {
        const t = p.slice(13).replace(/\/$/, "");
        const c = await env.DB.prepare(
          `SELECT id,formulario_em FROM clientes WHERE formulario_token=?`).bind(t).first();
        if (!c) return json({ erro: "token inválido" }, 404);
        if (c.formulario_em) return json({ erro: "Formulário já respondido." }, 410);
        const b = await req.json().catch(() => ({}));
        const dono = await env.DB.prepare(
          "SELECT id FROM arquivos WHERE id=? AND cliente_id=? AND origem='cliente'")
          .bind(Number(b.id) || 0, c.id).first();
        if (!dono) return json({ erro: "arquivo não encontrado" }, 404);
        const r = await Arq.apagar(env, c.id, dono.id);
        return json(r.erro ? { erro: r.erro } : { ok: true }, r.status || 200);
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
        // As fotos podem chegar por dois caminhos: subidas do celular (já
        // gravadas em `arquivos` antes deste envio) ou coladas como link.
        // O mínimo vale sobre a SOMA dos dois, senão quem subiu 15 fotos do
        // celular ainda seria barrado por não ter colado link nenhum.
        const subidas = await env.DB.prepare(
          "SELECT COUNT(*) n FROM arquivos WHERE cliente_id=? AND origem='cliente' AND slot='foto'")
          .bind(c.id).first();
        const totalFotos = fotosOk.length + (subidas?.n || 0);
        if (totalFotos < MIN_FOTOS)
          return json({ erro: `Faltam fotos: tenho ${totalFotos}, o mínimo é ${MIN_FOTOS}. Nada foi perdido, o link continua valendo e as fotos que você já subiu continuam aqui.` }, 400);
        if (!String(b.nome_dono || "").trim() || !String(b.cidade || "").trim() || !String(b.servicos || "").trim())
          return json({ erro: "Nome do dono, cidade e serviços são obrigatórios. Nada foi salvo, o link continua valendo." }, 400);

        const prazo = G.somaDiasUteis(new Date(), G.PRAZO_MAXIMO_DIAS).toISOString();
        // A trava é a própria condição do UPDATE (formulario_em IS NULL).
        // Antes, checar-depois-gravar deixava dois envios simultâneos passarem
        // pelos dois lados da trava, duplicando mídia e reiniciando o prazo.
        const txt = (v, n = 400) => (String(v ?? "").trim().slice(0, n) || null);
        const gravou = await env.DB.prepare(
          `UPDATE clientes SET nome_dono=?,cidade=?,estado=?,telefone=?,servicos=?,diferencial=?,
           observacoes=?,tem_logo=?,cores=?,tempo_mercado=?,faz=?,nao_faz=?,localizacoes=?,
           email=COALESCE(?,email),instagram=?,licenciado=?,segurado=?,
           logo_estilo=?,logo_simbolo=?,logo_evitar=?,logo_referencias=?,logo_texto=?,logo_slogan=?,
           formulario_em=?,prazo_final=?,entrega_iniciada_em=?,atualizado_em=?
           WHERE id=? AND formulario_em IS NULL`
        ).bind(b.nome_dono||null,b.cidade||null,b.estado||null,b.telefone||null,b.servicos||null,
               b.diferencial||null,b.observacoes||null,b.tem_logo?1:0,b.cores||null,
               b.tempo_mercado||null,b.faz||null,b.nao_faz||null,b.localizacoes||null,
               // e-mail: COALESCE porque o cliente pode deixar em branco e o
               // admin já ter cadastrado um na venda. Em branco não apaga.
               txt(b.email, 120), txt(b.instagram, 60),
               b.licenciado ? 1 : 0, b.segurado ? 1 : 0,
               // briefing da logo: é daqui que sai o prompt do gpt-image-2
               txt(b.logo_estilo),txt(b.logo_simbolo),txt(b.logo_evitar),
               txt(b.logo_referencias),txt(b.logo_texto,90),txt(b.logo_slogan,60),
               agora(),prazo,agora(),agora(),c.id).run();
        if (!gravou.meta.changes)
          return json({ erro: "Este formulário já foi respondido." }, 410);
        /* Os arquivos subidos do celular já estão no R2. O resto do sistema
           (geração do site, contagem de fotos, pasta de entrega) lê de
           `midias`, então cada upload ganha aqui a linha correspondente,
           com URL ABSOLUTA: o site do cliente é publicado no Vercel, em outro
           domínio, e um caminho relativo apontaria para o lugar errado. */
        const origemAbs = new URL(req.url).origin;
        const { results: subidos } = await env.DB.prepare(
          `SELECT chave,slot,nome FROM arquivos
           WHERE cliente_id=? AND origem='cliente' ORDER BY id`).bind(c.id).all();
        for (const a of subidos) {
          const abs = origemAbs + Arq.urlDe(a.chave);
          const jaLigado = await env.DB.prepare(
            "SELECT 1 FROM midias WHERE cliente_id=? AND caminho=?").bind(c.id, abs).first();
          if (jaLigado) continue;
          await env.DB.prepare(
            "INSERT INTO midias (cliente_id,tipo,caminho,descricao,criado_em) VALUES (?,?,?,?,?)")
            .bind(c.id, a.slot, abs, a.nome ? `enviado pelo cliente: ${a.nome}` : "enviado pelo cliente", agora()).run();
        }
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
        // Checklist de otimização: nasce junto com os marcos. A entrega não
        // fecha enquanto os itens obrigatórios não estiverem marcados.
        const temChk = await env.DB.prepare(
          "SELECT COUNT(*) AS n FROM checklist WHERE cliente_id=?").bind(c.id).first();
        if (!(temChk?.n)) {
          const n2 = agora();
          for (let i = 0; i < G.CHECKLIST.length; i += 20)
            await env.DB.batch(G.CHECKLIST.slice(i, i + 20).map(([area, item, obr, det], j) =>
              env.DB.prepare(`INSERT INTO checklist (cliente_id,area,item,detalhe,obrigatorio,ordem,criado_em)
                              VALUES (?,?,?,?,?,?,?)`).bind(c.id, area, item, det, obr, i + j, n2)));
        }
        return json({ ok: true });
      }

      // ───────── público: formulário do site da agência ─────────
      // O site (leon-group-site.pages.dev) manda o contato para cá antes de
      // abrir o WhatsApp. Assim o lead existe no CRM mesmo se a pessoa fechar
      // a aba sem mandar a mensagem — que é a maior parte de quem preenche.
      if (p === "/api/site-lead") {
        const cabecalhos = {
          "Access-Control-Allow-Origin": ORIGENS_SITE.includes(origem) ? origem : ORIGENS_SITE[0],
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        };
        if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cabecalhos });
        if (req.method !== "POST") return json({ erro: "método" }, 405, cabecalhos);
        if (!ORIGENS_SITE.includes(origem)) return json({ erro: "origem não permitida" }, 403, cabecalhos);
        if (await A.bloqueadoPorTentativas(env, ip, "site"))
          return json({ erro: "muitas tentativas" }, 429, cabecalhos);

        // sendBeacon manda text/plain (não sabe fazer preflight): por isso
        // lemos o corpo como texto e parseamos à mão, sem exigir o header.
        const b = await req.text().then((t) => JSON.parse(t || "{}")).catch(() => ({}));
        if (b.site_web) return json({ ok: true }, 200, cabecalhos);   // isca de robô: aceita e ignora

        const corta = (v, n) => String(v ?? "").trim().slice(0, n);
        const parcial = !!b.parcial;
        const nome = corta(b.nome, 80), tel = corta(b.telefone, 30);
        const sessao = corta(b.sessao, 40) || null;
        const digitos = tel.replace(/\D/g, "").length;

        // PARCIAL = alguém começou a preencher e ainda não enviou. Só vale
        // com telefone utilizável: sem telefone não há como chamar de volta,
        // e guardar o resto não serviria pra nada. Falha em silêncio (200),
        // porque isso não é erro de quem está digitando.
        if (parcial) {
          if (!sessao || digitos < 8) return json({ ok: true, ignorado: true }, 200, cabecalhos);
        } else if (!nome || !tel) {
          await A.registrarTentativa(env, ip, false, "site");
          return json({ erro: "nome e telefone são obrigatórios" }, 400, cabecalhos);
        }

        const n = agora();
        const obs = [
          parcial ? "FORMULÁRIO INCOMPLETO no site: contato guardado pra retomar" : "",
          b.plano ? `PLANO QUE ELE CLICOU: ${corta(b.plano, 60)}` : "",
          b.papel ? `Papel: ${corta(b.papel, 60)}` : "",
          b.hoje ? `Cliente hoje chega por: ${corta(b.hoje, 60)}` : "",
          b.cidade ? `Onde atende: ${corta(b.cidade, 60)}` : "",
          b.idioma ? `Idioma do site: ${corta(b.idioma, 4)}` : "",
        ].filter(Boolean).join(" · ");
        const origemLead = `site:${corta(b.origem || b.fonte, 40) || "direto"}`;

        // Mesma sessão do site = mesmo lead. Quem parou no meio e voltou
        // depois atualiza a própria linha, não cria uma segunda.
        const existente = sessao
          ? await env.DB.prepare("SELECT id FROM leads WHERE sessao_site=?").bind(sessao).first()
          : null;

        if (existente) {
          // Só grava campo que veio preenchido: um parcial posterior mais
          // curto não pode apagar o que já tinha sido capturado antes.
          const brutaU = corta(b.cidade, 80);
          const ufU = (brutaU.match(/(?:^|[,\s\-])([A-Za-z]{2})\s*$/) || [])[1] || "";
          const cidU = ufU ? brutaU.replace(/(?:^|[,\s\-])[A-Za-z]{2}\s*$/, "").replace(/[,\s\-]+$/, "") : brutaU;
          const mudar = { telefone: tel, nome, empresa: corta(b.empresa, 90),
                          nicho: corta(b.servico, 40),
                          cidade: cidU, estado: ufU.toUpperCase() };
          const chaves = Object.keys(mudar).filter((k) => mudar[k]);
          chaves.push("observacoes", "origem", "atualizado_em");
          const valores = chaves.map((k) => (
            k === "observacoes" ? (obs || null) :
            k === "origem" ? origemLead :
            k === "atualizado_em" ? n : mudar[k]));
          await env.DB.prepare(
            `UPDATE leads SET ${chaves.map((k) => k + "=?").join(",")} WHERE id=?`
          ).bind(...valores, existente.id).run();
          await ev(env.DB, { lead_id: existente.id,
                             tipo: parcial ? "site_parcial" : "site_completou",
                             para: "leads_novos/super_hot",
                             detalhe: parcial ? "atualizou o formulário incompleto"
                                              : "terminou o formulário do site" });
          return json({ ok: true, id: existente.id, atualizado: true }, 200, cabecalhos);
        }

        // Linha nova. Parcial tem teto próprio por IP para não virar porta
        // de inundação do banco: 8 novos por IP a cada 15 min. Quem passa
        // do teto recebe 200 e some, sem mensagem de erro na tela.
        if (parcial && await A.bloqueadoPorTentativas(env, ip, "site-parcial")) {
          console.log("site-lead: teto de parciais atingido", ip);
          return json({ ok: true, ignorado: true }, 200, cabecalhos);
        }
        // "Boston, MA" chega num campo só: separa a sigla do estado, que é o
        // que o relógio local do card usa para achar o fuso.
        const bruta = corta(b.cidade, 80);
        const uf = (bruta.match(/(?:^|[,\s\-])([A-Za-z]{2})\s*$/) || [])[1] || "";
        const cid = uf ? bruta.replace(/(?:^|[,\s\-])[A-Za-z]{2}\s*$/, "").replace(/[,\s\-]+$/, "") : bruta;
        const r = await env.DB.prepare(
          `INSERT INTO leads (nome,telefone,empresa,nicho,origem,observacoes,sessao_site,
           cidade,estado,criado_em,entrou_coluna_em,atualizado_em) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
        ).bind(nome || "Site (formulário incompleto)", tel,
               corta(b.empresa, 90) || null, corta(b.servico, 40) || null,
               origemLead, obs || null, sessao,
               cid || null, uf.toUpperCase() || null, n, n, n).run();
        // registrarTentativa alimenta o mesmo contador do teto acima
        if (parcial) await A.registrarTentativa(env, ip, false, "site-parcial");
        await ev(env.DB, { lead_id: r.meta.last_row_id,
                           tipo: parcial ? "site_parcial" : "criado",
                           para: "leads_novos/super_hot",
                           detalhe: parcial ? "começou o formulário e ainda não enviou"
                                            : "veio do site da agência" });
        return json({ ok: true, id: r.meta.last_row_id }, 200, cabecalhos);
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

      /* Upload da agência fica AQUI, e não em apiAdmin, porque apiAdmin
         começa lendo o corpo como JSON. O corpo de um upload é o arquivo:
         passar por lá o consumiria e chegaria vazio no R2. */
      if (p === "/api/subir-arquivo" && req.method === "POST") {
        const cid = Number(url.searchParams.get("cliente_id")) || 0;
        if (!cid) return json({ erro: "cliente_id obrigatório" }, 400);
        const existe = await env.DB.prepare("SELECT id FROM clientes WHERE id=?").bind(cid).first();
        if (!existe) return json({ erro: "cliente não encontrado" }, 404);
        const r = await Arq.receber(env, req, {
          cliente_id: cid, origem: "agencia",
          destino: url.searchParams.get("destino") || "entrega",
          slot: url.searchParams.get("slot") || "outros",
          nome: url.searchParams.get("nome") || "",
        });
        if (r.erro) return json({ erro: r.erro }, r.status || 400);
        return json(r);
      }

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

  if (p === "/api/assistente/contexto" && req.method === "POST") {
    let contexto;
    try { contexto = validarContexto(corpo.contexto); }
    catch (e) { return json({ erro: e.message }, 400); }
    try { return json(await criarContextoIA(contexto, env, { financeiroDoPainel })); }
    catch (e) {
      return json({ erro: e.message === 'Registro não encontrado ou arquivado.'
        ? e.message : 'Não foi possível consultar os dados do CRM. Tente novamente.' }, e.message === 'Registro não encontrado ou arquivado.' ? 404 : 503);
    }
  }

  // ── painel geral ──
  if (p === "/api/painel") {
    // Um único round-trip para tudo. Antes isto era N+1 (4 consultas por cliente,
    // uma esperando a outra): 5 clientes = 27 idas ao banco = 3,5s de espera,
    // e crescia linear. Agora são 6 consultas agregadas em batch, custo constante.
    // o batch do painel e o dos KPIs são independentes: vão em paralelo, não em fila
    const [[qL, qC, qEnt, qRev, qMk, qChk, qMd, qArq], kpisPainel] = await Promise.all([
      D.batch([
        D.prepare("SELECT * FROM leads WHERE arquivado=0 ORDER BY entrou_coluna_em DESC"),
        D.prepare("SELECT * FROM clientes WHERE arquivado=0 ORDER BY id DESC"),
        D.prepare("SELECT id,tipo,status,url,cliente_id FROM entregaveis"),
        D.prepare("SELECT cliente_id, COUNT(*) t, SUM(postada) p FROM reviews GROUP BY cliente_id"),
        D.prepare("SELECT cliente_id, COUNT(*) t, SUM(concluido) c FROM marcos GROUP BY cliente_id"),
        D.prepare("SELECT cliente_id, COUNT(*) t, SUM(feito) f FROM checklist WHERE obrigatorio=1 GROUP BY cliente_id"),
        D.prepare("SELECT cliente_id, tipo, COUNT(*) n FROM midias GROUP BY cliente_id, tipo"),
        D.prepare("SELECT cliente_id, COUNT(*) n FROM arquivos WHERE origem='agencia' GROUP BY cliente_id"),
      ]),
      kpis(D),
    ]);
    const leads = qL.results, cls = qC.results;

    // indexa os agregados por cliente_id antes de costurar
    const ents = new Map(), revs = new Map(), mks = new Map(), mds = new Map(), chks = new Map();
    for (const e of qEnt.results) {
      if (!ents.has(e.cliente_id)) ents.set(e.cliente_id, []);
      ents.get(e.cliente_id).push({ id: e.id, tipo: e.tipo, status: e.status, url: e.url });
    }
    for (const r of qRev.results) revs.set(r.cliente_id, r);
    for (const m of qMk.results) mks.set(m.cliente_id, m);
    for (const k of qChk.results) chks.set(k.cliente_id, k);
    const arqs = new Map();
    for (const a of qArq.results) arqs.set(a.cliente_id, a.n);
    for (const x of qMd.results) {
      if (!mds.has(x.cliente_id)) mds.set(x.cliente_id, {});
      mds.get(x.cliente_id)[x.tipo] = x.n;
    }

    const agoraMs = Date.now();
    for (const c of cls) {
      // o HTML do site pode ter dezenas de KB e o admin nunca lê esse campo aqui.
      // logo_prompt é o JSON do gpt-image-2, alguns KB por cliente, e a lista
      // não usa: só o card usa, e o card busca em /api/cliente.
      delete c.site_html; delete c.logo_prompt;
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
      const ck = chks.get(c.id);
      c.chk_total = ck?.t || 0; c.chk_feitos = ck?.f || 0;
      const entOk = c.entregaveis.filter((e) => ["entregue", "aprovado"].includes(e.status)).length;
      c.ent_total = c.entregaveis.length; c.ent_feitos = entOk;
      // Mesma regra do portão em /api/cliente, na versão agregada: os três
      // grupos que travam, ou a conclusão antecipada registrada no botão.
      c.portao_cumprido = c.marcos_total > 0 && c.marcos_feitos >= c.marcos_total
        && c.chk_total > 0 && c.chk_feitos >= c.chk_total
        && c.ent_total > 0 && entOk >= c.ent_total;
      c.entrega_completa = c.portao_cumprido || !!c.entrega_forcada;
      // atrasado só vale se o prazo passou E a entrega ainda não terminou
      c.atrasado = c.dias_uteis !== null && c.dias_uteis > G.PRAZO_MAXIMO_DIAS && !c.entrega_completa;
      c.midias = mds.get(c.id) || {};
      c.arquivos_agencia = arqs.get(c.id) || 0;
    }
    return json({ leads, clientes: cls, pipelines: PIPELINES, ativacoes: ATIV_DIA,
                  catalogo: CATALOGO, entregaveis: G.ENTREGAVEIS, kpis: kpisPainel,
                  // sem o bucket do R2 a área de upload aparece desligada,
                  // com o comando para criar, em vez de falhar em silêncio
                  sem_r2: !Arq.temR2(env) });
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
    /* O CHECKLIST é derivado da tabela `ativacoes`, não guardado à parte: dois
       lugares guardando "o que já foi feito" divergem, e no dia em que
       divergirem o operador manda a mesma coisa duas vezes ou pula uma. */
    const todas = (await D.prepare(
      `SELECT tipo, COUNT(*) n, MAX(executada_em) ultima, SUM(respondeu) respostas,
              MAX(aberto_em) aberto
       FROM ativacoes WHERE lead_id=? GROUP BY tipo`).bind(id).all()).results;
    const porTipo = Object.fromEntries(todas.map((a) => [a.tipo, a]));
    lead.checklist_ativacoes = Ativ.checklist(porTipo, lead);
    lead.ativacao_falta = Ativ.dadosDoLead(lead).falta;
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
        // Dois números diferentes, e confundir os dois vira faturamento
        // fantasma:
        //   valor_contrato = CONTRATADO, o que foi combinado
        //   valor_pago     = RECEBIDO, dinheiro que entrou de verdade
        // Na virada nada entrou ainda: o pagamento só é confirmado depois,
        // na chave do portão. Copiar o contratado pra cá fazia o cliente
        // nascer marcado como pago sem ninguém ter pagado nada.
        const novo = await criarClienteDoLead(D, l, corpo.valor_pago || null);
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
  /* ══════════════════ PLAYBOOK DA ATIVAÇÃO ══════════════════
     Devolve o conteúdo daquela ativação JÁ PERSONALIZADO com o nome e a
     empresa do lead: o que escrever, o que falar no áudio, os emojis, a
     direção da foto de visualização única e os prompts de imagem prontos
     para colar no gerador.

     Abrir NÃO registra o envio. Registrar é outro clique, depois de mandar.
     Registrar no clique de abrir enchia o histórico de ativações que nunca
     saíram, e aí o checklist mentia sobre o que já foi feito. */
  if (p === "/api/ativacao-playbook") {
    const id = url.searchParams.get("id");
    const tipo = url.searchParams.get("tipo");
    const lead = await D.prepare(
      "SELECT id,nome,empresa,nicho,cidade,estado,telefone,pipeline,coluna,rapport FROM leads WHERE id=?")
      .bind(id).first();
    if (!lead) return json({ erro: "lead não encontrado" }, 404);
    const pb = Ativ.playbookDe(tipo, lead);
    if (!pb) return json({ erro: "ativação desconhecida" }, 404);
    // marca que foi ABERTO, sem marcar que foi mandado
    await D.prepare(`INSERT INTO ativacoes (lead_id,tipo,executada_em,aberto_em,
                     coluna_na_hora,pipeline_na_hora) VALUES (?,?,?,?,?,?)`)
      .bind(lead.id, tipo, agora(), agora(), lead.coluna, lead.pipeline).run();
    return json(pb);
  }

  if (p === "/api/ativacao") {
    const l = await D.prepare("SELECT coluna,pipeline FROM leads WHERE id=?").bind(corpo.id).first();
    if (!l) return json({ erro: "lead não encontrado" }, 404);
    /* Fecha a linha que o "abrir" criou, em vez de inserir outra. Sem isso,
       cada ativação mandada contava duas vezes: uma na abertura e outra no
       registro, e a cota diária estourava sozinha. */
    const fechou = await D.prepare(
      `UPDATE ativacoes SET executada_em=?, aberto_em=NULL, nota=?, conteudo_enviado=?,
       coluna_na_hora=?, pipeline_na_hora=?
       WHERE id = (SELECT MAX(id) FROM ativacoes
                   WHERE lead_id=? AND tipo=? AND aberto_em IS NOT NULL)`
    ).bind(agora(), corpo.nota || null, String(corpo.conteudo || "").slice(0, 4000) || null,
           l.coluna, l.pipeline, corpo.id, corpo.tipo).run();
    if (!fechou.meta.changes)
      // registrado sem ter aberto o playbook: o operador mandou por fora
      await D.prepare(`INSERT INTO ativacoes (lead_id,tipo,executada_em,nota,
                       conteudo_enviado,coluna_na_hora,pipeline_na_hora)
                       VALUES (?,?,?,?,?,?,?)`)
        .bind(corpo.id, corpo.tipo, agora(), corpo.nota || null,
              String(corpo.conteudo || "").slice(0, 4000) || null, l.coluna, l.pipeline).run();
    await ev(D, { lead_id: corpo.id, tipo: "ativacao", para: corpo.tipo,
                  detalhe: `em ${l.pipeline}/${l.coluna}` });
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
  // Localização do lead. Alimenta o relógio local do card: sem cidade e
  // estado não há como saber a hora de quem vai atender o telefone.
  if (p === "/api/lead-editar") {
    const permitidos = ["cidade", "estado", "fuso", "nome", "empresa", "telefone", "email", "nicho"];
    const campos = permitidos.filter((c) => corpo[c] !== undefined);
    if (!campos.length) return json({ erro: "nada a alterar" }, 400);
    // fuso só entra se for um identificador IANA plausível; lixo vira NULL
    const limpa = (c) => {
      const v = String(corpo[c] ?? "").trim();
      if (c === "fuso") return /^[A-Za-z]+\/[A-Za-z_+\-]+$/.test(v) ? v : null;
      if (c === "estado") return v.toUpperCase().slice(0, 2) || null;
      return v.slice(0, 120) || null;
    };
    await D.prepare(`UPDATE leads SET ${campos.map((c) => c + "=?").join(",")},atualizado_em=? WHERE id=?`)
      .bind(...campos.map(limpa), agora(), corpo.id).run();
    return json({ ok: true });
  }
  if (p === "/api/qualificar") {
    // nicho e cidade vêm do roteiro da ligação (etapas 3 e 4) e alimentam o
    // relógio do card e a busca do diagnóstico, então valem UPDATE aqui.
    await D.prepare(`UPDATE leads SET rapport=?,budget=?,authority=?,need=?,timeline=?,
      nicho=COALESCE(NULLIF(?,''),nicho), cidade=COALESCE(NULLIF(?,''),cidade),
      confirmacao_ao_vivo=?, qualificado=?, atualizado_em=? WHERE id=?`)
      .bind(corpo.rapport||null,corpo.budget||null,corpo.authority||null,corpo.need||null,
            corpo.timeline||null,corpo.nicho||'',corpo.cidade||'',
            corpo.confirmacao_ao_vivo||null,corpo.qualificado?1:0,agora(),corpo.id).run();
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
    const TABS = ["entregaveis", "reviews", "posts", "marcos", "midias", "checklist",
                  "arquivos", "entradas"];
    const ordemDe = (t) => (t === "checklist" ? "ordem" : t === "entradas" ? "recebido_em" : "id");
    const res = await D.batch(TABS.map((t) =>
      D.prepare(`SELECT * FROM ${t} WHERE cliente_id=? ORDER BY ${ordemDe(t)}`).bind(id)));
    TABS.forEach((t, i) => { c[t] = res[i].results; });
    for (const a of c.arquivos) a.url = Arq.urlDe(a.chave);
    /* O financeiro DESTE cliente, já convertido nas duas moedas: entrada por
       entrada, com a cotação que cada uma usou. O card mostra dólar e real
       lado a lado porque a operação fatura em dólar e o fundador vive em real. */
    {
      const [cot] = await D.batch([D.prepare(
        "SELECT chave,valor FROM config WHERE chave IN ('cotacao','cotacao_em','cotacao_fonte')")]);
      const k = Object.fromEntries((cot.results || []).map((r) => [r.chave, r.valor]));
      c.cotacao_ref = F.cotacaoValida(k.cotacao) || F.COTACAO_PADRAO;
      c.cotacao_em = k.cotacao_em || null;
      c.cotacao_padrao = !F.cotacaoValida(k.cotacao);
      const qs = await D.prepare("SELECT * FROM saidas WHERE cliente_id=? ORDER BY pago_em")
        .bind(id).all();
      c.financeiro = F.financeiroDoCliente(c, c.entradas, c.cotacao_ref, qs.results);
    }
    // régua do fluxo de trabalho: logo, site, Instagram, Google, pasta
    c.pecas = Arq.progresso(c.arquivos);
    c.catalogo_arquivos = Arq.CATALOGO_ARQUIVOS;
    const total = c.marcos.length, feitos = c.marcos.filter((m) => m.concluido).length;
    c.marcos_total = total; c.marcos_feitos = feitos;
    // A entrega só fecha com as TRÊS coisas prontas. Antes olhava só os
    // marcos, e dava pra declarar entrega completa com o Google Business
    // Profile ainda pendente, que é a peça de maior retorno do pacote.
    const obr = c.checklist.filter((k) => k.obrigatorio);
    c.chk_total = obr.length;
    c.chk_feitos = obr.filter((k) => k.feito).length;
    const entOk = c.entregaveis.filter((e) => ["entregue", "aprovado"].includes(e.status)).length;
    c.ent_total = c.entregaveis.length; c.ent_feitos = entOk;
    /* O portão de conclusão: uma conta só, no servidor, usada pelo card, pela
       lista e pelo botão de conclusão antecipada. Antes eram três contagens
       repetidas em lugares diferentes, e nenhuma tela dizia quais eram. */
    c.portao = await portaoDeConclusao(D, c);
    c.entrega_completa = c.portao.concluida;
    /* O QUE FAZER AGORA. O painel tem 14 seções e nenhuma dizia por onde
       começar. Esta é a única pergunta que importa ao abrir o cliente. */
    const temSite = !!c.site_html, temPosts = c.posts.length > 0;
    const temLogoPronta = c.arquivos.some((a) => a.destino === "logo" && a.origem === "agencia");
    c.proximo_passo =
      c.portao.forcada
        ? ["Entrega fechada antes do prazo", `Você fechou em ${new Date(c.portao.forcada_em).toLocaleDateString("pt-BR")}.` +
           (c.portao.forcada_pendencias?.length
             ? ` Ficou registrado que ${c.portao.forcada_pendencias.length} grupo(s) estavam abertos na hora.`
             : " O portão estava cumprido na hora do clique.")]
      : !c.contrato_assinado || !c.pagamento_confirmado
        /* Nomeia só o que FALTA. Com o contrato já aceito pelo cliente, pedir
           para "marcar contrato" manda o operador procurar o que já está feito. */
        ? [!c.contrato_assinado && !c.pagamento_confirmado ? "Marque contrato e pagamento"
           : !c.contrato_assinado ? "Falta o contrato"
           : "Confirme o pagamento",
           c.contrato_aceito_em
             ? "O cliente já aceitou o contrato. Falta confirmar o pagamento para o formulário abrir."
             : "É o portão. Sem os dois, o formulário do cliente nem abre."]
      : !c.formulario_em
        ? ["Mande o link do formulário", "Está na seção Links. Sem ele preencher, não há material pra trabalhar e o prazo nem começa."]
      : !c.grupo_whatsapp
        ? ["Crie o grupo no WhatsApp e cole o link", "Marco 1 da entrega. É onde toda a comunicação vai passar."]
      : !temSite || !temPosts
        ? ["Gere os entregáveis", "Um clique produz o site, as reviews e os briefs do Instagram."]
      : (!c.tem_logo && !temLogoPronta)
        // A logo entra no site, no Instagram e no Google. Fazer depois das
        // três é refazer as três.
        ? ["Faça a logo primeiro", "O cliente não tinha logo. Copie o prompt na seção “Logo” e suba os arquivos: ela entra no site, no Instagram e no Google."]
      : !c.vercel_url
        ? ["Publique o site no Vercel", "Baixe o index.html, suba no Vercel e cole a URL de volta aqui."]
      : c.chk_feitos < c.chk_total
        ? [`Trabalhe o checklist: faltam ${c.chk_total - c.chk_feitos}`, "Cada item tem o passo a passo junto. Comece pelo Google Business Profile, é o que mais move o ponteiro."]
      : feitos < total
        ? [`Marque os marcos: faltam ${total - feitos}`, "A cadência dos 5 dias úteis."]
      : entOk < c.ent_total
        ? ["Feche os entregáveis", "Marque cada um como entregue na seção Entregáveis."]
      : ["Entrega concluída", "Atualize os leads recebidos todo mês, é o número da conversa de renovação."];

    // uma linha só, para o resumo no alto do checklist. A lista detalhada
    // com onde ficar cada coisa vem em c.portao.grupos
    c.trava_entrega = c.portao.cumprido ? ""
      : c.portao.pendencias.map((x) => x.rotulo).join(" · ");
    c.atrasado = c.dias_uteis !== null && c.dias_uteis > G.PRAZO_MAXIMO_DIAS && !c.entrega_completa;
    const rv = parseData(c.renovacao_em);
    c.dias_para_renovar = rv ? Math.ceil((rv - Date.now()) / 86400000) : null;
    return json(c);
  }
  if (p === "/api/cliente-editar") {
    const permitidos = ["nome_dono","cidade","estado","telefone","servicos","diferencial","observacoes",
                        "cores","nicho","email","valor_pago","cor_primaria","cor_destaque","tem_logo",
                        "grupo_whatsapp","fuso"];
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
    const [qc, qf, qa] = await D.batch([
      D.prepare("SELECT * FROM clientes WHERE id=?").bind(id),
      D.prepare("SELECT caminho FROM midias WHERE cliente_id=? AND tipo='foto'").bind(id),
      // As fotos que o cliente SUBIU do celular vivem em `arquivos`, não em
      // `midias`. Sem esta consulta o site sairia sem foto nenhuma para todo
      // cliente que usou o seletor de arquivo em vez de colar link, que agora
      // é o caminho normal.
      D.prepare(`SELECT chave FROM arquivos WHERE cliente_id=? AND origem='cliente'
                 AND slot='foto' AND mime LIKE 'image/%' ORDER BY id`).bind(id),
    ]);
    const c = qc.results[0];
    if (!c) return json({ erro: "cliente não encontrado" }, 404);
    // A junção das duas fontes mora em geradores.js, com teste: já saiu site
    // sem foto nenhuma por a geração olhar só um dos dois caminhos.
    const fotos = G.fotosDoCliente({
      subidas: qa.results.map((x) => Arq.urlDe(x.chave)),
      coladas: qf.results.map((m) => m.caminho),
      raiz: new URL(req.url).origin,
    });
    const feito = [];
    if (corpo.site !== false) {
      // Os depoimentos gerados são entregues para validação do cliente real.
      // Não entram automaticamente no site público do cliente.
      const site = G.gerarSite(c, fotos, []);
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
      const revs = await G.gerarReviews(c, 20, fotos);
      const marcoReviews = G.CADENCIA.find(m => m.marco.startsWith("Sistema de avaliação")).marco;
      // apagar + inserir 20 + marcar: num batch só. Antes eram 22 idas ao banco
      // em fila, e o DELETE já tinha acontecido se alguma inserção falhasse —
      // resultado possível: cliente sem review nenhuma.
      await D.batch([
        D.prepare("DELETE FROM reviews WHERE cliente_id=?").bind(id),
        ...revs.map((r) => D.prepare(
          "INSERT INTO reviews (cliente_id,texto,servico,foto_ref,criado_em) VALUES (?,?,?,?,?)")
          .bind(id, r.texto, r.servico, r.foto_ref, agora())),
        D.prepare("UPDATE marcos SET marco=?,concluido=1,concluido_em=? WHERE cliente_id=? AND marco LIKE 'Sistema de avaliação%'")
          .bind(marcoReviews, agora(), id),
      ]);
      feito.push(`${revs.length} depoimentos`);
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
      proximo: feito.includes("site")
        ? "Baixe o index.html e publique no Vercel, depois cole a URL no admin."
        : "Confira os textos no card do cliente ou baixe a entrega (.txt)." });
  }
  if (p === "/api/liberar-formulario") {
    // destrava o formulário do cliente: contrato assinado e/ou pagamento confirmado
    const campos = [], vals = [];
    if ("contrato" in corpo) { campos.push("contrato_assinado=?", "contrato_em=?"); vals.push(corpo.contrato ? 1 : 0, corpo.contrato ? agora() : null); }
    if ("pagamento" in corpo) {
      campos.push("pagamento_confirmado=?", "pagamento_em=?");
      vals.push(corpo.pagamento ? 1 : 0, corpo.pagamento ? agora() : null);
      // É AQUI que o dinheiro entra, e só aqui. Ligando a chave, o recebido
      // nasce sugerido pelo contratado e fica editável. Desligando, ele é
      // zerado: pagamento não confirmado não pode contar como receita.
      const at = await D.prepare("SELECT valor_contrato,valor_pago FROM clientes WHERE id=?")
        .bind(corpo.id).first();
      if (corpo.pagamento) {
        if (!at?.valor_pago && at?.valor_contrato) { campos.push("valor_pago=?"); vals.push(at.valor_contrato); }
      } else { campos.push("valor_pago=?"); vals.push(null); }
    }
    if (!campos.length) return json({ erro: "nada a alterar" }, 400);
    await D.prepare(`UPDATE clientes SET ${campos.join(",")},atualizado_em=? WHERE id=?`)
      .bind(...vals, agora(), corpo.id).run();
    return json({ ok: true });
  }
  /* Gera o link do contrato. Chamar de novo troca o token, que é o jeito de
     invalidar um link mandado para o e-mail errado. Depois de aceito, não
     gera mais: o aceite ficaria órfão do link que o produziu. */
  if (p === "/api/gerar-contrato") {
    const c = await D.prepare("SELECT contrato_aceito_em FROM clientes WHERE id=?")
      .bind(corpo.id).first();
    if (!c) return json({ erro: "cliente não encontrado" }, 404);
    if (c.contrato_aceito_em)
      return json({ erro: "Contrato já aceito. Gerar link novo apagaria o vínculo com o aceite." }, 409);
    const t = token();
    await D.prepare("UPDATE clientes SET contrato_token=?,contrato_enviado_em=?,atualizado_em=? WHERE id=?")
      .bind(t, agora(), agora(), corpo.id).run();
    return json({ ok: true, contrato_token: t });
  }
  if (p === "/api/baixar-contrato") {
    const id = url.searchParams.get("id");
    const c = await D.prepare("SELECT * FROM clientes WHERE id=?").bind(id).first();
    if (!c) return json({ erro: "cliente não encontrado" }, 404);
    if (!c.razao_social)
      return json({ erro: "O cliente ainda não preencheu os dados do contrato." }, 400);
    const nome = `contrato-${c.slug || c.id}${c.contrato_aceito_em ? "-aceito" : "-minuta"}.txt`;
    return new Response(Ct.textoContrato(c), { headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nome}"` } });
  }
  if (p === "/api/novo-token-formulario") {
    // gera link novo (o antigo é de uso único e já morreu)
    const t = token();
    await D.prepare("UPDATE clientes SET formulario_token=?,formulario_em=NULL,atualizado_em=? WHERE id=?")
      .bind(t, agora(), corpo.id).run();
    return json({ ok: true, formulario_token: t });
  }
  // Número do operador e liga/desliga dos avisos. Não é credencial: é um
  // telefone, e fica no banco justamente para poder ser trocado na tela.
  if (p === "/api/config" && req.method === "GET") {
    return json({
      meu_whatsapp: await cfg(D, "meu_whatsapp"),
      avisos_ligados: (await cfg(D, "avisos_ligados", "1")) === "1",
      hora_resumo: await cfg(D, "hora_resumo", "8"),
      zapi: !!(env.ZAPI_INSTANCIA && env.ZAPI_TOKEN),
      openai: !!env.OPENAI_API_KEY,
    });
  }
  if (p === "/api/config" && req.method === "POST") {
    if (corpo.meu_whatsapp !== undefined)
      await setCfg(D, "meu_whatsapp", String(corpo.meu_whatsapp).replace(/\D/g, "").slice(0, 20));
    if (corpo.avisos_ligados !== undefined)
      await setCfg(D, "avisos_ligados", corpo.avisos_ligados ? "1" : "0");
    if (corpo.hora_resumo !== undefined)
      await setCfg(D, "hora_resumo",
        String(Math.min(23, Math.max(0, Number.parseInt(corpo.hora_resumo, 10) || 0))));
    return json({ ok: true });
  }
  // Teste do canal: manda uma mensagem de verdade para o próprio número.
  if (p === "/api/testar-whatsapp") {
    const r = await avisarOperador(D, env, "teste",
      "Teste da Leon Group. Se você recebeu isso, o CRM está falando com o seu WhatsApp.");
    return json(r.erro ? { erro: r.erro } : { ok: true, enviada: r.enviada });
  }
  // Roda o motor agora, sem esperar os 15 minutos do cron. Serve para testar
  // e para forçar o resumo do dia. Protegida por sessão como todo o resto.
  if (p === "/api/rodar-motor") {
    const r = await motorAutomacao(env);
    return json({ ok: true, falhas: r.falhas });
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
      if (cli && corpo.apagar_cliente_tambem) await apagarCliente(D, cli.id, env);
      for (const tab of ["ativacoes", "ligacoes", "mensagens", "eventos"])
        await D.prepare(`DELETE FROM ${tab} WHERE lead_id=?`).bind(id).run();
      await D.prepare("DELETE FROM leads WHERE id=?").bind(id).run();
      return json({ ok: true, apagado: `lead "${l.nome}"${cli ? " e o cliente vinculado" : ""}` });
    }

    if (tipo === "cliente") {
      const c = await D.prepare("SELECT empresa FROM clientes WHERE id=?").bind(id).first();
      if (!c) return json({ erro: "cliente não encontrado" }, 404);
      /* Dinheiro que entrou não é apagado de tabela por tabela junto com o
         cliente. Ver o comentário em apagarCliente. */
      const ent = await D.prepare(
        "SELECT COUNT(*) n, GROUP_CONCAT(valor || ' ' || moeda, ', ') lista FROM entradas WHERE cliente_id=?")
        .bind(id).first();
      if ((ent?.n || 0) > 0 && !corpo.apagar_entradas_tambem)
        return json({ erro: `"${c.empresa}" tem ${ent.n} entrada(s) de dinheiro lançada(s) ` +
          `(${ent.lista}). Apagar o cliente apagaria essa receita do caixa e do mês a mês, ` +
          `sem deixar rastro. Apague as entradas uma a uma na seção Entradas do card, ou ` +
          `reenvie com apagar_entradas_tambem:true se for isso mesmo que você quer.` }, 409);
      await apagarCliente(D, id, env);
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
  if (p === "/api/checklist") {
    const salvo = await D.prepare("UPDATE checklist SET feito=?,feito_em=? WHERE id=? AND cliente_id=?")
      .bind(corpo.feito ? 1 : 0, corpo.feito ? agora() : null, corpo.id, corpo.cid).run();
    if (salvo.meta?.changes === 0) return json({ erro: 'Item não encontrado neste cliente.' }, 404);
    return json({ ok: true });
  }
  if (p === "/api/marco") {
    const salvo = await D.prepare("UPDATE marcos SET concluido=?,concluido_em=? WHERE id=?")
      .bind(corpo.concluido ? 1 : 0, corpo.concluido ? agora() : null, corpo.mid).run();
    if (salvo.meta?.changes === 0) return json({ erro: 'Marco não encontrado.' }, 404);
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

  // A "pasta de entrega" do 5º dia útil, num arquivo só. É o que o cliente
  // recebe na reunião de entrega, então tem que abrir sozinho: onde está cada
  // coisa, o que é dele, o que ele precisa fazer.
  if (p === "/api/exportar") {
    const id = url.searchParams.get("id");
    const c = await D.prepare("SELECT * FROM clientes WHERE id=?").bind(id).first();
    if (!c) return json({ erro: "cliente não encontrado" }, 404);
    const [qr, qp, qe, ql, qlog] = await D.batch([
      D.prepare("SELECT * FROM reviews WHERE cliente_id=?").bind(id),
      D.prepare("SELECT * FROM posts WHERE cliente_id=? ORDER BY tipo DESC,ordem").bind(id),
      D.prepare("SELECT tipo,status,url FROM entregaveis WHERE cliente_id=?").bind(id),
      D.prepare("SELECT caminho FROM midias WHERE cliente_id=? AND tipo='logo'").bind(id),
      // a logo pode ter sido SUBIDA (pelo cliente ou pela agência) em vez de colada
      D.prepare(`SELECT chave FROM arquivos WHERE cliente_id=?
                 AND (slot='logo' OR (destino='logo' AND slot='principal'))
                 ORDER BY origem='agencia' DESC, id LIMIT 1`).bind(id),
    ]);
    const revs = qr.results, ps = qp.results;
    // o .txt é aberto fora do sistema: link relativo ali não abre em lugar nenhum
    const raizEntrega = new URL(req.url).origin;
    const ent = (t) => (qe.results.find((e) => e.tipo === t) || {}).url || "";
    const risca = (t) => `${t} ${".".repeat(Math.max(2, 22 - t.length))}`;
    const linha = (rot, val) => `  ${risca(rot)} ${val || "(pendente)"}`;
    // o site do cliente é publicado no Vercel. A rota /site/<slug> NÃO existe:
    // mandar o cliente para lá era entregar um link que cai na tela de login.
    const txt = [
      `ENTREGA · ${(c.empresa || "").toUpperCase()}`,
      "Leon Group · Built to Lead.",
      "=".repeat(70), "",
      "CONTATO", "",
      linha("Cliente", c.nome_dono || c.nome_contato),
      linha("Empresa", c.empresa),
      linha("Cidade", [c.cidade, c.estado].filter(Boolean).join(", ")),
      linha("Telefone", c.telefone),
      linha("Grupo do WhatsApp", c.grupo_whatsapp),
      "", "O QUE FOI ENTREGUE", "",
      linha("Site", c.vercel_url),
      linha("Google Meu Negócio", ent("gmb")),
      linha("Instagram", ent("instagram")),
      linha("Logo", ent("logo") || (ql.results[0] || {}).caminho
        || (qlog.results[0] ? raizEntrega + Arq.urlDe(qlog.results[0].chave) : "")),
      "",
      "  O acesso do Instagram e do Google Meu Negócio fica com você.",
      "  A Leon Group não guarda senha nenhuma.",
      "", "=".repeat(70),
      `DEPOIMENTOS (${revs.length}). Textos personalizados em inglês.`,
      "O cliente real deve validar os dados e os elogios antes de usar cada depoimento.",
      "Ajuste o serviço, a cidade, a qualidade, o prazo e a limpeza à experiência real.",
      "Os textos são rascunhos para validação, sem autor atribuído ou publicação automática.",
      "=".repeat(70), "",
      ...revs.map((r, i) => `--- DEPOIMENTO ${i+1} (${r.servico||""}) ---\n${r.texto}\n`),
      "=".repeat(70), "INSTAGRAM · 12 POSTS + 4 DESTAQUES", "=".repeat(70), "",
      ...ps.map(x => `[${x.tipo.toUpperCase()} ${x.ordem}] ${x.titulo}\n${x.brief}\n`),
      "=".repeat(70), "O QUE VOCÊ FAZ A PARTIR DE AGORA", "=".repeat(70), "",
      "  1. Enviar os depoimentos para o cliente real validar e ajustar antes de usar",
      "  2. Publicar os 12 posts e montar os 4 destaques no Instagram",
      "  3. Manter o Google Meu Negócio atualizado: foto de obra nova toda semana",
      "  4. Responder lead no mesmo dia. Velocidade fecha mais que argumento",
      "  5. Qualquer dúvida, fala no grupo do WhatsApp",
      "",
    ].join("\n");
    return new Response(txt, { headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="entrega-${c.slug}.txt"` } });
  }

  /* ══════════════════ DASHBOARD COMERCIAL ══════════════════
     O funil inteiro, o dinheiro e o diagnóstico. Separado de /api/painel
     porque o painel roda a cada 60 segundos e isto não precisa: são
     agregações do período inteiro, que não mudam de minuto em minuto. */
  if (p === "/api/dashboard") {
    const [f, fin] = await Promise.all([F.funil(D), financeiroDoPainel(D)]);
    return json({
      etapas: f.etapas, clientes_ativos: f.clientes_ativos,
      rotulos: F.ROTULOS_FUNIL,
      financeiro: fin,
      diagnostico: F.diagnostico(f.etapas),
      ia_disponivel: !!env.OPENAI_API_KEY,
    });
  }
  // Botão, não automático: cada clique é uma chamada paga na OpenAI, e o
  // diagnóstico da tela já responde a pergunta na maioria dos dias.
  if (p === "/api/diagnostico-ia" && req.method === "POST") {
    const [f, fin] = await Promise.all([F.funil(D), financeiroDoPainel(D)]);
    const r = await F.diagnosticoIA(f.etapas, fin, F.diagnostico(f.etapas), env.OPENAI_API_KEY || "");
    return json(r, r.erro ? 400 : 200);
  }

  /* ══════════════════ ENTRADAS: o que caiu na conta ══════════════════
     Uma linha por dinheiro que entrou, com moeda, cotação do dia e data.
     É o que permite responder "quanto entrou na empresa" para contrato
     recorrente, e é o que trava o total em real: entrada antiga não muda de
     valor quando o dólar mexe hoje. */
  if (p === "/api/entrada" && req.method === "POST") {
    const cid = Number(corpo.cliente_id) || 0;
    if (corpo.apagar) {
      const r = await D.prepare("DELETE FROM entradas WHERE id=? AND cliente_id=?")
        .bind(Number(corpo.id) || 0, cid).run();
      if (!r.meta.changes) return json({ erro: "entrada não encontrada" }, 404);
      await ev(D, { cliente_id: cid, tipo: "entrada_apagada", detalhe: `entrada #${corpo.id}` });
      return json({ ok: true });
    }
    const existe = await D.prepare("SELECT id FROM clientes WHERE id=?").bind(cid).first();
    if (!existe) return json({ erro: "cliente não encontrado" }, 404);

    const v = F.parseDinheiro(corpo.valor);
    if (!v || v.valor <= 0)
      return json({ erro: "Valor inválido. Escreva o número, por exemplo 2500 ou 2.500,00." }, 400);
    const moeda = corpo.moeda === "BRL" ? "BRL" : corpo.moeda === "USD" ? "USD" : (v.moeda || null);
    if (!moeda) return json({ erro: "Escolha a moeda da entrada." }, 400);
    // Data do DINHEIRO, não do cadastro: é ela que monta o mês a mês.
    const data = String(corpo.recebido_em || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data))
      return json({ erro: "Informe a data em que o dinheiro entrou." }, 400);
    const cot = corpo.cotacao ? F.cotacaoValida(corpo.cotacao) : null;
    if (corpo.cotacao && !cot)
      return json({ erro: "Cotação inválida. É quantos reais valia um dólar naquele dia, por exemplo 5,42." }, 400);
    const txt = (x, n) => (String(x ?? "").trim().slice(0, n) || null);

    const campos = [String(v.valor), moeda, cot ? String(cot) : null, data,
                    txt(corpo.meio, 40), txt(corpo.parcela, 40), txt(corpo.nota, 200)];
    if (corpo.id) {
      const r = await D.prepare(`UPDATE entradas SET valor=?,moeda=?,cotacao=?,recebido_em=?,
                                 meio=?,parcela=?,nota=? WHERE id=? AND cliente_id=?`)
        .bind(...campos, Number(corpo.id), cid).run();
      if (!r.meta.changes) return json({ erro: "entrada não encontrada" }, 404);
      return json({ ok: true, id: Number(corpo.id) });
    }
    const r = await D.prepare(`INSERT INTO entradas
      (cliente_id,valor,moeda,cotacao,recebido_em,meio,parcela,nota,criado_em)
      VALUES (?,?,?,?,?,?,?,?,?)`).bind(cid, ...campos, agora()).run();
    await ev(D, { cliente_id: cid, tipo: "entrada",
                  detalhe: `${moeda} ${v.valor} em ${data}${cot ? ` (cotação ${cot})` : ""}` });
    return json({ ok: true, id: r.meta.last_row_id });
  }

  /* ══════════════════ SAÍDAS: o outro lado do caixa ══════════════════
     Uma linha por dinheiro que saiu. `cliente_id` preenchido faz o gasto ser
     custo direto daquele cliente e entrar no lucro dele; vazio, é custo da
     operação (anúncio, ferramenta, contador) e entra só no caixa geral. */
  if (p === "/api/saida" && req.method === "POST") {
    if (corpo.apagar) {
      const r = await D.prepare("DELETE FROM saidas WHERE id=?").bind(Number(corpo.id) || 0).run();
      if (!r.meta.changes) return json({ erro: "despesa não encontrada" }, 404);
      return json({ ok: true });
    }
    const v = F.parseDinheiro(corpo.valor);
    if (!v || v.valor <= 0)
      return json({ erro: "Valor inválido. Escreva o número, por exemplo 1800 ou 1.800,00." }, 400);
    const moeda = corpo.moeda === "BRL" ? "BRL" : corpo.moeda === "USD" ? "USD" : (v.moeda || null);
    if (!moeda) return json({ erro: "Escolha a moeda da despesa." }, 400);
    const data = String(corpo.pago_em || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data))
      return json({ erro: "Informe a data em que o dinheiro saiu." }, 400);
    const cot = corpo.cotacao ? F.cotacaoValida(corpo.cotacao) : null;
    if (corpo.cotacao && !cot)
      return json({ erro: "Cotação inválida. É quantos reais valia um dólar naquele dia, por exemplo 5,42." }, 400);
    // categoria fora do catálogo cai em "outros": melhor lançar que perder o gasto
    const cats = F.CATEGORIAS_SAIDA.map(([k]) => k);
    const cat = cats.includes(corpo.categoria) ? corpo.categoria : "outros";
    // cliente inexistente vira custo de operação, em vez de linha órfã
    let cid = Number(corpo.cliente_id) || null;
    if (cid && !(await D.prepare("SELECT 1 FROM clientes WHERE id=?").bind(cid).first())) cid = null;
    const txt = (x, n) => (String(x ?? "").trim().slice(0, n) || null);

    const campos = [String(v.valor), moeda, cot ? String(cot) : null, data, cat,
                    txt(corpo.descricao, 160), cid, corpo.recorrente ? 1 : 0, txt(corpo.nota, 200)];
    if (corpo.id) {
      const r = await D.prepare(`UPDATE saidas SET valor=?,moeda=?,cotacao=?,pago_em=?,categoria=?,
                                 descricao=?,cliente_id=?,recorrente=?,nota=? WHERE id=?`)
        .bind(...campos, Number(corpo.id)).run();
      if (!r.meta.changes) return json({ erro: "despesa não encontrada" }, 404);
      return json({ ok: true, id: Number(corpo.id) });
    }
    const r = await D.prepare(`INSERT INTO saidas
      (valor,moeda,cotacao,pago_em,categoria,descricao,cliente_id,recorrente,nota,criado_em)
      VALUES (?,?,?,?,?,?,?,?,?,?)`).bind(...campos, agora()).run();
    return json({ ok: true, id: r.meta.last_row_id });
  }

  /* Cotação de referência. Usada só onde a entrada não tem cotação própria,
     e para projetar o que ainda falta receber. O botão de buscar traz a
     cotação de MERCADO, que é referência: o real que ele recebe de verdade
     sai da cotação do banco ou da Wise dele, sempre pior que a de mercado. */
  if (p === "/api/cotacao") {
    if (req.method === "POST") {
      if (corpo.buscar) {
        const r = await F.buscarCotacao();
        if (r.erro) return json({ erro: r.erro }, 502);
        await setCfg(D, "cotacao", String(r.valor));
        await setCfg(D, "cotacao_em", agora());
        await setCfg(D, "cotacao_fonte", r.fonte);
        return json({ ok: true, valor: r.valor, em: agora(), fonte: r.fonte });
      }
      const v = F.cotacaoValida(corpo.valor);
      if (!v) return json({ erro: "Cotação inválida. Quantos reais vale um dólar, por exemplo 5,42." }, 400);
      await setCfg(D, "cotacao", String(v));
      await setCfg(D, "cotacao_em", agora());
      await setCfg(D, "cotacao_fonte", "digitada por você");
      return json({ ok: true, valor: v });
    }
    return json({ valor: await cfg(D, "cotacao"), em: await cfg(D, "cotacao_em"),
                  fonte: await cfg(D, "cotacao_fonte") });
  }
  // Taxa do gateway e custo direto do cliente. É o que sai do recebido antes
  // de virar lucro, e sem isso "valor vendido" e "lucro" são o mesmo número.
  if (p === "/api/custos" && req.method === "POST") {
    const pct = String(corpo.taxa_percentual ?? "").replace(",", ".").trim();
    const n = Number.parseFloat(pct);
    if (pct && (!Number.isFinite(n) || n < 0 || n > 100))
      return json({ erro: "A taxa tem que ser um número entre 0 e 100." }, 400);
    const moedaCusto = corpo.custos_moeda === "BRL" ? "BRL" : corpo.custos_moeda === "USD" ? "USD" : null;
    await D.prepare(`UPDATE clientes SET taxa_percentual=?,custos_valor=?,custos_moeda=?,
                     custos_nota=?,atualizado_em=? WHERE id=?`)
      .bind(pct || null, String(corpo.custos_valor ?? "").trim() || null, moedaCusto,
            String(corpo.custos_nota ?? "").trim().slice(0, 200) || null, agora(), corpo.id).run();
    return json({ ok: true });
  }

  /* ══════════════════ PROMPT DA LOGO ══════════════════
     Monta o JSON do gpt-image-2 a partir do que o cliente descreveu. Sempre
     determinístico; com `ia=1` e chave configurada, os campos descritivos
     são reescritos em inglês de designer. */
  if (p === "/api/prompt-logo") {
    const id = url.searchParams.get("id") || corpo.id;
    const c = await D.prepare("SELECT * FROM clientes WHERE id=?").bind(id).first();
    if (!c) return json({ erro: "cliente não encontrado" }, 404);
    let spec = promptLogo(c), rationale = null;
    if (url.searchParams.get("ia") === "1") {
      const r = await refinarComIA(spec, env.OPENAI_API_KEY || "");
      if (r) { spec = r.spec; rationale = r.rationale; }
      else if (!env.OPENAI_API_KEY) rationale = "Sem OPENAI_API_KEY: saiu o prompt base, sem refinamento.";
      else rationale = "A IA não respondeu. Saiu o prompt base, que já funciona.";
    }
    const texto = JSON.stringify(spec, null, 2);
    // guarda o último gerado: reabrir o card não precisa remontar nem repagar
    await D.prepare("UPDATE clientes SET logo_prompt=?,logo_prompt_em=? WHERE id=?")
      .bind(texto, agora(), id).run();
    return json({ ok: true, prompt: texto, falta: faltaNoBriefing(c), rationale,
                  ia_disponivel: !!env.OPENAI_API_KEY });
  }
  // Briefing da logo editável no admin: o cliente descreve por áudio no
  // WhatsApp com muito mais frequência do que preenche campo de formulário.
  if (p === "/api/logo-briefing" && req.method === "POST") {
    const campos = ["logo_estilo", "logo_simbolo", "logo_evitar", "logo_referencias",
                    "logo_texto", "logo_slogan", "cores"];
    const usar = campos.filter((k) => corpo[k] !== undefined);
    if (!usar.length) return json({ erro: "nada a alterar" }, 400);
    await D.prepare(`UPDATE clientes SET ${usar.map((k) => k + "=?").join(",")},atualizado_em=? WHERE id=?`)
      .bind(...usar.map((k) => String(corpo[k] ?? "").trim().slice(0, 400) || null), agora(), corpo.id).run();
    return json({ ok: true });
  }

  /* ══════════════════ ARQUIVOS DA AGÊNCIA ══════════════════
     A peça PRONTA: logo finalizada, artes do Instagram, fotos do Google.
     Antes essas peças ficavam no computador de quem fez e não havia onde
     colocá-las, então a entrega dependia de alguém lembrar de mandar. */
  if (p === "/api/arquivo-apagar" && req.method === "POST") {
    const r = await Arq.apagar(env, Number(corpo.cliente_id) || 0, Number(corpo.id) || 0);
    return json(r.erro ? { erro: r.erro } : { ok: true }, r.status || 200);
  }

  /* ══════════════════ CONCLUIR A ENTREGA ══════════════════
     Duas formas de sair de "em entrega":

     1. Cumprindo o portão: marcos, checklist obrigatório e os 4 entregáveis.
        Isso já acontece sozinho, sem botão.
     2. Este botão, para quando o trabalho foi entregue ANTES do prazo ou por
        um caminho diferente do previsto.

     A confirmação é a frase inteira, digitada, e vai no CORPO da requisição:
     o mesmo padrão da exclusão. E o que estava aberto no momento do clique
     fica congelado em `entrega_forcada_pendencias`, porque marcar entregue o
     que não foi feito é exatamente o tipo de número que esta operação não
     inventa. Quem abrir o card depois vê o que faltava.                     */
  if (p === "/api/concluir-entrega" && req.method === "POST") {
    const FRASE = "SERVIÇO ENTREGUE ANTES DO TEMPO";
    const id = Number(corpo.id) || 0;
    const c = await D.prepare("SELECT * FROM clientes WHERE id=?").bind(id).first();
    if (!c) return json({ erro: "cliente não encontrado" }, 404);

    if (corpo.desfazer) {
      await D.prepare(`UPDATE clientes SET entrega_concluida_em=NULL,entrega_forcada=0,
                       entrega_forcada_nota=NULL,entrega_forcada_pendencias=NULL,atualizado_em=?
                       WHERE id=?`).bind(agora(), id).run();
      await ev(D, { cliente_id: id, tipo: "entrega_reaberta", detalhe: "conclusão antecipada desfeita" });
      return json({ ok: true, reaberto: true });
    }

    // Normaliza acento e caixa: quem digita no celular erra o Ç, e recusar
    // por causa disso não protege nada, só irrita.
    const norm = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ").trim().toUpperCase();
    if (norm(corpo.confirmacao) !== norm(FRASE))
      return json({ erro: `Confirmação inválida. Digite exatamente: ${FRASE}` }, 400);
    if (!String(corpo.nota || "").trim())
      return json({ erro: "Escreva o que foi entregue e por que está fechando antes do prazo. Fica registrado no card." }, 400);

    const port = await portaoDeConclusao(D, c);
    await D.prepare(`UPDATE clientes SET entrega_concluida_em=?,entrega_forcada=1,
                     entrega_forcada_nota=?,entrega_forcada_pendencias=?,atualizado_em=? WHERE id=?`)
      .bind(agora(), String(corpo.nota).trim().slice(0, 600),
            port.pendencias.length ? JSON.stringify(port.pendencias) : null, agora(), id).run();
    await ev(D, { cliente_id: id, tipo: "entrega_concluida_antes",
                  detalhe: port.pendencias.length
                    ? `fechada com ${port.pendencias.length} pendência(s): ${port.pendencias.map((x) => x.rotulo).join(" · ")}`
                    : "fechada com o portão inteiro cumprido" });
    return json({ ok: true, pendencias: port.pendencias });
  }

  return json({ erro: "rota desconhecida" }, 404);
}

/* ══════════════════ O PORTÃO DE CONCLUSÃO ══════════════════
   A pergunta "o que falta para este cliente sair de EM ENTREGA" tinha
   resposta espalhada por três contas invisíveis em lugares diferentes da
   tela. Aqui ela fica num lugar só, explícita, e é a MESMA conta que o card,
   a lista e o botão de conclusão usam.

   São três grupos, e todos os três precisam estar fechados:

     1. os 11 marcos da cadência de 5 dias
     2. os itens OBRIGATÓRIOS do checklist de otimização
     3. os 4 entregáveis em "entregue" ou "aprovado"

   Os arquivos do catálogo aparecem como quarto grupo, mas NÃO travam: quem
   atesta que a logo foi entregue é o item do checklist. O arquivo no R2 é a
   prova, não a condição, e transformar em condição criaria trabalho que
   ninguém pediu.                                                            */
async function portaoDeConclusao(D, c) {
  const [qMk, qChk, qEnt, qArq] = await D.batch([
    D.prepare("SELECT COUNT(*) t, SUM(concluido) f FROM marcos WHERE cliente_id=?").bind(c.id),
    D.prepare("SELECT COUNT(*) t, SUM(feito) f FROM checklist WHERE cliente_id=? AND obrigatorio=1").bind(c.id),
    D.prepare("SELECT tipo,status FROM entregaveis WHERE cliente_id=?").bind(c.id),
    D.prepare("SELECT destino,slot,origem FROM arquivos WHERE cliente_id=?").bind(c.id),
  ]);
  const mk = qMk.results[0] || {}, ck = qChk.results[0] || {};
  const ents = qEnt.results || [];
  const entOk = ents.filter((e) => ["entregue", "aprovado"].includes(e.status));
  const rot = (t) => (G.ENTREGAVEIS.find((x) => x[0] === t) || [])[1] || t;

  const grupos = [
    { chave: "marcos", rotulo: "Marcos da cadência", trava: true,
      feitos: mk.f || 0, total: mk.t || 0,
      onde: "Seção “Cadência de entrega”, no card",
      porque: "São os 11 passos dos 5 dias úteis. Um marco aberto significa uma etapa que o cliente não recebeu." },
    { chave: "checklist", rotulo: "Checklist obrigatório", trava: true,
      feitos: ck.f || 0, total: ck.t || 0,
      onde: "Seção “Checklist de otimização”",
      porque: "É onde mora o Google Meu Negócio, que é a peça de maior retorno do pacote. Fechar sem ele é entregar meia entrega." },
    { chave: "entregaveis", rotulo: "Entregáveis", trava: true,
      feitos: entOk.length, total: ents.length,
      abertos: ents.filter((e) => !["entregue", "aprovado"].includes(e.status)).map((e) => rot(e.tipo)),
      onde: "Seção “Entregáveis”",
      porque: "Site, Google Meu Negócio, Instagram e Logo. É o que foi vendido." },
    { chave: "arquivos", rotulo: "Arquivos das peças", trava: false,
      ...(() => {
        const prog = Arq.progresso(qArq.results || []);
        const obr = prog.flatMap((g) => g.slots.filter((s) => s.minimo > 0));
        return { feitos: obr.filter((s) => s.completo).length, total: obr.length,
                 abertos: obr.filter((s) => !s.completo).map((s) => `${s.rotulo} (falta ${s.falta})`) };
      })(),
      onde: "Seção “Peças e arquivos”",
      porque: "Não trava a conclusão: quem atesta a entrega é o checklist. Aqui é a prova, e serve para o cliente ter os arquivos na mão depois." },
  ];

  const pendencias = grupos.filter((g) => g.trava && g.feitos < g.total)
    .map((g) => ({ chave: g.chave, rotulo: `${g.rotulo}: ${g.total - g.feitos} de ${g.total} aberto(s)` }));
  const naturalmente = grupos.filter((g) => g.trava)
    .every((g) => g.total > 0 && g.feitos >= g.total);

  return {
    grupos, pendencias,
    cumprido: naturalmente,
    // forçada conta como concluída: foi decisão registrada, não conta furada
    concluida: naturalmente || !!c.entrega_forcada,
    forcada: !!c.entrega_forcada,
    forcada_em: c.entrega_concluida_em || null,
    forcada_nota: c.entrega_forcada_nota || null,
    forcada_pendencias: (() => {
      try { return JSON.parse(c.entrega_forcada_pendencias || "null"); } catch { return null; }
    })(),
    frase_confirmacao: "SERVIÇO ENTREGUE ANTES DO TEMPO",
  };
}

// ══════════════════════ helpers ══════════════════════
// Apaga o cliente e tudo que pende dele. O D1 não aplica ON DELETE CASCADE,
// então a limpeza é explícita — se faltar uma tabela aqui, sobra órfão no banco.
async function apagarCliente(D, id, env) {
  // Os objetos do R2 vão primeiro. Storage órfão não aparece em tela nenhuma
  // e continua sendo cobrado: se a linha for embora antes, ninguém mais sabe
  // que aquele arquivo existe.
  if (env) await Arq.apagarDoCliente(env, id).catch((e) => console.log("r2 limpeza:", e.message));
  /* A saída NÃO é apagada com o cliente: o dinheiro saiu de verdade e some do
     caixa se a linha for embora. Ela é desvinculada, virando custo da
     operação, que é o que ela passa a ser quando o cliente deixa de existir. */
  await D.prepare("UPDATE saidas SET cliente_id=NULL WHERE cliente_id=?").bind(id).run();
  /* A ENTRADA seguia sendo APAGADA aqui, e a justificativa da saída vale
     idêntica para ela: o dinheiro entrou de verdade. O resultado era
     assimétrico e caro: excluir um cliente pago apagava a receita, mantinha o
     custo, e o caixa passava a mostrar prejuízo puro onde houve lucro. Era
     também a única forma de uma entrada desaparecer sem rastro, porque os
     eventos do cliente são apagados na mesma função.

     Agora a exclusão é BLOQUEADA enquanto houver entrada lançada. O caminho
     para remover o dinheiro já existe e já avisa: apagar entrada por entrada
     na tela do cliente. `entradas.cliente_id` é NOT NULL, então desvincular
     como se faz com a saída exigiria migração; bloquear é mais honesto do que
     apagar receita em silêncio. */
  for (const tab of ["entregaveis", "midias", "reviews", "posts", "marcos", "checklist",
                     "arquivos", "entradas"])
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
     renovacao_automatica,servicos_extras,valor_extras,cidade,estado,fuso,criado_em,atualizado_em)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(s, lead.nome || "", lead.empresa || lead.nome || "", lead.nicho || null, n,
         lead.email || null, lead.telefone || null, valorPago || null, t,
         renov.toISOString(), lead.id, lead.tipo_contrato || null, lead.valor_contrato || null,
         meses, lead.renovacao_automatica || 0, lead.servicos_extras || null,
         lead.valor_extras || null,
         // a localização vem com o lead: o relógio do card do cliente já nasce certo
         lead.cidade || null, lead.estado || null, lead.fuso || null, n, n).run();
  const id = r.meta.last_row_id;
  for (const [tipo] of G.ENTREGAVEIS)
    await D.prepare("INSERT INTO entregaveis (cliente_id,tipo,atualizado_em) VALUES (?,?,?)")
      .bind(id, tipo, n).run();
  return { id, slug: s, formulario_token: t };
}

/* O financeiro completo do painel, num lugar só: as duas rotas que precisam
   dele (o dashboard e o diagnóstico da IA) tinham a consulta duplicada, e
   qualquer campo novo teria que ser lembrado nos dois. */
async function financeiroDoPainel(D) {
  const [qCli, qEnt, qCot, qSai] = await D.batch([
    D.prepare(`SELECT id,empresa,data_entrada,valor_contrato,valor_extras,valor_pago,
               pagamento_confirmado,pagamento_em,tipo_contrato,duracao_meses,
               taxa_percentual,custos_valor,custos_moeda,custos_nota
               FROM clientes WHERE arquivado=0`),
    D.prepare("SELECT * FROM entradas ORDER BY recebido_em"),
    D.prepare("SELECT chave,valor FROM config WHERE chave IN ('cotacao','cotacao_em','cotacao_fonte')"),
    D.prepare("SELECT * FROM saidas ORDER BY pago_em"),
  ]);
  const c = Object.fromEntries((qCot.results || []).map((r) => [r.chave, r.valor]));
  return F.financeiroTotal(qCli.results, qEnt.results, {
    valor: c.cotacao, em: c.cotacao_em, fonte: c.cotacao_fonte }, qSai.results);
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
// ── config: chave/valor no banco, editável na tela ──
async function cfg(D, chave, padrao = "") {
  const r = await D.prepare("SELECT valor FROM config WHERE chave=?").bind(chave).first();
  return r?.valor ?? padrao;
}
async function setCfg(D, chave, valor) {
  await D.prepare("INSERT INTO config (chave,valor) VALUES (?,?) ON CONFLICT(chave) DO UPDATE SET valor=?")
    .bind(chave, String(valor), String(valor)).run();
}

/* ── envio pelo WhatsApp, um caminho só ──
   Antes só existia envio para LEAD. Cliente do operacional e lembrete de
   tarefa para o operador não tinham como sair. Agora os três passam por
   aqui, e tudo fica registrado na tabela mensagens com o erro, quando há. */
async function envio(D, env, { telefone, texto, tipo, lead_id = null, cliente_id = null, variar: comIA = true }) {
  let final = texto;
  if (comIA && env.OPENAI_API_KEY) final = await variar(texto, env.OPENAI_API_KEY);
  const numero = String(telefone || "").replace(/\D/g, "");
  let enviada = null, erro = null;
  if (!numero) erro = "sem número cadastrado";
  else if (!env.ZAPI_INSTANCIA || !env.ZAPI_TOKEN) erro = "modo simulado (sem Z-API)";
  else {
    try {
      const r = await fetch(`https://api.z-api.io/instances/${env.ZAPI_INSTANCIA}/token/${env.ZAPI_TOKEN}/send-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(env.ZAPI_CLIENT_TOKEN ? { "Client-Token": env.ZAPI_CLIENT_TOKEN } : {}) },
        body: JSON.stringify({ phone: numero, message: final }),
      });
      // fetch só lança em falha de rede: HTTP 401/403/500 voltam como resposta
      // normal. Sem esta checagem, erro da Z-API virava "enviada com sucesso".
      if (r.ok) enviada = agora();
      else erro = `Z-API HTTP ${r.status}: ${(await r.text().catch(() => "")).slice(0, 200)}`;
    } catch (e) { erro = e.message; }
  }
  await D.prepare("INSERT INTO mensagens (lead_id,cliente_id,direcao,tipo,conteudo,criada_em,enviada_em,erro) VALUES (?,?,?,?,?,?,?,?)")
    .bind(lead_id, cliente_id, "enviada", tipo, final, agora(), enviada, erro).run();
  return { enviada, erro };
}

// mensagem para um CLIENTE do operacional
async function msgCliente(D, env, cliente_id, tipo, texto) {
  const c = await D.prepare("SELECT telefone FROM clientes WHERE id=?").bind(cliente_id).first();
  return envio(D, env, { telefone: c?.telefone, texto, tipo, cliente_id });
}

/* lembrete de tarefa para o OPERADOR.
   Nunca varia o texto pela IA: aqui a mensagem é uma lista de tarefas, e
   reescrever lista de tarefa é o jeito mais rápido de perder informação. */
async function avisarOperador(D, env, tipo, texto) {
  const numero = await cfg(D, "meu_whatsapp");
  const ligado = (await cfg(D, "avisos_ligados", "1")) === "1";
  if (!ligado) return { erro: "avisos desligados na tela" };
  return envio(D, env, { telefone: numero, texto, tipo, variar: false });
}

async function msg(D, env, lead_id, tipo, texto) {
  const l = await D.prepare("SELECT telefone FROM leads WHERE id=?").bind(lead_id).first();
  return envio(D, env, { telefone: l?.telefone, texto, tipo, lead_id });
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

  // ═══════════ OPERACIONAL: o lado que antes não mandava nada ═══════════

  /* ── cobrança do formulário ──
     Cliente que pagou, recebeu o link e não respondeu é entrega parada:
     o prazo de 5 dias úteis não começa até ele preencher. Duas cobranças,
     em 24h e em 72h, e para. Depois disso é ligação, não mensagem.       */
  const travados = (await D.prepare(
    `SELECT id,empresa,nome_contato,telefone,contrato_em,pagamento_em FROM clientes
     WHERE arquivado=0 AND formulario_em IS NULL
       AND contrato_assinado=1 AND pagamento_confirmado=1 LIMIT ${TETO_LOTE}`).all()).results;
  for (const c of travados) await seguro(`formulário cliente ${c.id}`, async () => {
    const desde = c.pagamento_em || c.contrato_em;
    if (!desde) return;
    const horas = h(desde);
    const etapa = horas >= 72 ? "form_cobranca_72h" : horas >= 24 ? "form_cobranca_24h" : null;
    if (!etapa) return;
    if (await D.prepare("SELECT 1 FROM mensagens WHERE cliente_id=? AND tipo=?").bind(c.id, etapa).first()) return;
    if (!janelaDeContato()) return;
    await msgCliente(D, env, c.id, etapa, etapa === "form_cobranca_24h"
      ? `Oi ${c.nome_contato || ""}! Passando pra lembrar do formulário. É por ali que a gente pega as fotos das suas obras e os dados pra montar tudo. O prazo de 5 dias úteis começa a contar do seu envio, então quanto antes você mandar, antes fica no ar.`
      : `Oi ${c.nome_contato || ""}! O formulário ainda está aberto esperando você. Se estiver com dificuldade em alguma parte, me chama aqui que eu preencho junto contigo por chamada, leva 10 minutos.`);
    await ev(D, { cliente_id: c.id, tipo: etapa, detalhe: `formulário sem resposta há ${Math.floor(horas)}h` });
  });

  /* ── resumo diário de tarefas para o operador ──
     Uma mensagem por dia, no horário que ele escolher, no fuso DELE. Um
     aviso por tarefa viraria dezenas de mensagens e ele desligaria tudo.  */
  await seguro("resumo diário", async () => {
    const numero = await cfg(D, "meu_whatsapp");
    if (!numero) return;                                  // nada configurado ainda
    if ((await cfg(D, "avisos_ligados", "1")) !== "1") return;
    // "0" é hora válida. Number("0")||8 devolvia 8 e a meia-noite era
    // impossível de configurar, sem nenhum aviso.
    const bruto = await cfg(D, "hora_resumo", "8");
    const alvo = /^([01]?\d|2[0-3])$/.test(bruto) ? Number(bruto) : 8;
    if (horaLocalBrasil() !== alvo) return;                // só na hora marcada
    const marca = `resumo@${diaBrasil()}`;                 // uma vez por dia, só
    if (await D.prepare("SELECT 1 FROM mensagens WHERE tipo=?").bind(marca).first()) return;

    const [qCall, qQuentes, qForm, qAtraso, qRenov, qNoShow] = await D.batch([
      D.prepare(`SELECT nome,empresa,call_agendada_para,cidade,estado FROM leads
                 WHERE arquivado=0 AND pipeline='agendamento' AND coluna='call_agendado'
                   AND call_agendada_para IS NOT NULL ORDER BY call_agendada_para LIMIT 20`),
      D.prepare(`SELECT COUNT(*) n FROM leads WHERE arquivado=0 AND pipeline='leads_novos'
                   AND coluna IN ('responderam','super_hot')`),
      D.prepare(`SELECT empresa FROM clientes WHERE arquivado=0 AND formulario_em IS NULL
                   AND contrato_assinado=1 AND pagamento_confirmado=1 LIMIT 10`),
      D.prepare(`SELECT empresa,entrega_iniciada_em FROM clientes
                 WHERE arquivado=0 AND entrega_iniciada_em IS NOT NULL LIMIT 40`),
      D.prepare(`SELECT empresa,renovacao_em FROM clientes
                 WHERE arquivado=0 AND renovacao_em IS NOT NULL LIMIT 40`),
      D.prepare(`SELECT COUNT(*) n FROM leads WHERE arquivado=0 AND pipeline='agendamento'
                   AND coluna IN ('no_show','no_show_f1','no_show_f2')`),
    ]);

    // entrega atrasada: passou dos 5 dias úteis e ainda tem marco aberto
    const abertos = new Map();
    for (const m of (await D.prepare(
      `SELECT cliente_id, COUNT(*) t, SUM(concluido) c FROM marcos GROUP BY cliente_id`).all()).results)
      abertos.set(m.cliente_id, (m.t || 0) - (m.c || 0));
    const atrasados = qAtraso.results.filter((c) =>
      G.diasUteisDesde(parseData(c.entrega_iniciada_em)) > G.PRAZO_MAXIMO_DIAS);
    const renovando = qRenov.results.filter((c) => {
      const d = parseData(c.renovacao_em);
      return d && (d - Date.now()) / 86400000 <= 21;
    });

    const L = [`Bom dia. Resumo de ${new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}:`, ""];
    if (qCall.results.length) {
      L.push("CALLS AGENDADAS");
      for (const c of qCall.results) {
        const q = parseData(c.call_agendada_para);
        const hb = q ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo",
          day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(q) : "?";
        const onde = [c.cidade, c.estado].filter(Boolean).join(", ");
        L.push(`- ${c.nome}${c.empresa ? ` (${c.empresa})` : ""}: ${hb} no seu horário${onde ? ` · ele está em ${onde}` : ""}`);
      }
      L.push("");
    }
    const quentes = qQuentes.results[0]?.n || 0;
    const noshow = qNoShow.results[0]?.n || 0;
    if (quentes || noshow) {
      L.push("COMERCIAL");
      if (quentes) L.push(`- ${quentes} lead(s) quente(s) esperando ligação`);
      if (noshow) L.push(`- ${noshow} lead(s) na máquina de no-show`);
      L.push("");
    }
    if (qForm.results.length || atrasados.length || renovando.length) {
      L.push("OPERACIONAL");
      for (const c of qForm.results) L.push(`- ${c.empresa}: formulário ainda não respondido`);
      for (const c of atrasados) L.push(`- ${c.empresa}: ENTREGA ATRASADA, ${abertos.get(c.id) || 0} marco(s) aberto(s)`);
      for (const c of renovando) L.push(`- ${c.empresa}: renovação chegando`);
      L.push("");
    }
    if (L.length <= 2) L.push("Nada pendente hoje. Aproveita e prospecta.");
    await avisarOperador(D, env, marca, L.join("\n").trim());
  });

  if (falhas.length) console.log(`motorAutomacao: ${falhas.length} falha(s) isolada(s) — ${falhas.slice(0, 20).join(" | ")}`);
  return { falhas: falhas.length };
}
