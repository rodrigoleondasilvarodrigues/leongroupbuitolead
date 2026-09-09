/* ═══════════════════════ ARQUIVOS ═══════════════════════
   Arquivo de verdade, guardado no R2. Duas portas de entrada:

   1. O CLIENTE, no formulário público, subindo fotos e vídeos do celular.
      Antes ele tinha que subir no Drive, deixar público e colar 11 links um
      por linha. Ninguém faz isso no celular, e é onde a entrega travava.

   2. A AGÊNCIA, no card do cliente, subindo a peça PRONTA: a logo, as artes
      do Instagram, as fotos do Google Meu Negócio. Antes essas peças viviam
      no computador de quem fez e não havia onde colocá-las.

   Os dois casos gravam na mesma tabela `arquivos`, e o que separa é `origem`.

   ── por que o R2 e não o D1 ──
   D1 é SQLite: linha de no máximo 1 MB e 500 MB no plano grátis. Um vídeo de
   celular tem 40 MB. Guardar mídia lá enche o banco do CRM e derruba tudo.
   O R2 é feito pra isso, tem 10 GB grátis e não cobra saída de dados.        */

const agora = () => new Date().toISOString();

/* ── tipos aceitos ──
   A extensão é a fonte da verdade na hora de SERVIR (não vale um round-trip
   no banco por imagem carregada), então cada mime aceito tem uma extensão
   fixa e o caminho do objeto carrega essa extensão. */
export const TIPOS = {
  "image/jpeg": { ext: "jpg", video: false },
  "image/png": { ext: "png", video: false },
  "image/webp": { ext: "webp", video: false },
  // iPhone fotografa em HEIC. Chega aqui quando o navegador não converteu na
  // seleção: aceito para não perder a foto, mas NÃO tem preview no admin nem
  // serve para o site, porque navegador nenhum desenha HEIC em <img>.
  "image/heic": { ext: "heic", video: false, semPreview: true },
  "image/heif": { ext: "heif", video: false, semPreview: true },
  "video/mp4": { ext: "mp4", video: true },
  "video/quicktime": { ext: "mov", video: true },   // o padrão do iPhone
  "video/webm": { ext: "webm", video: true },
};
const POR_EXT = Object.fromEntries(
  Object.entries(TIPOS).map(([mime, t]) => [t.ext, mime]));

export const TETO_IMAGEM = 12 * 1024 * 1024;   // 12 MB: sobra folga até para foto sem compressão
export const TETO_VIDEO = 95 * 1024 * 1024;    // o corpo de requisição do Worker para em 100 MB
export const TETO_FOTOS_CLIENTE = 40;
export const TETO_VIDEOS_CLIENTE = 5;
export const TETO_ARQUIVOS_AGENCIA = 120;      // 12 posts + 4 destaques + logo + GMB, com sobra

/* Sniff dos primeiros bytes. O Content-Type do upload é escolhido por quem
   sobe, então sozinho não vale nada: dá para declarar image/png e mandar um
   HTML, que serviria script no nosso próprio domínio. */
function assinaturaBate(mime, buf) {
  const b = new Uint8Array(buf.slice(0, 16));
  const em = (pos, ...bytes) => bytes.every((x, i) => b[pos + i] === x);
  const texto = (pos, s) => [...s].every((ch, i) => b[pos + i] === ch.charCodeAt(0));
  switch (mime) {
    case "image/jpeg": return em(0, 0xff, 0xd8, 0xff);
    case "image/png": return em(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    case "image/webp": return texto(0, "RIFF") && texto(8, "WEBP");
    case "image/heic":
    case "image/heif": return texto(4, "ftyp");
    case "video/mp4":
    case "video/quicktime": return texto(4, "ftyp");
    case "video/webm": return em(0, 0x1a, 0x45, 0xdf, 0xa3);
    default: return false;
  }
}

/* ═══════════════ CATÁLOGO: a sequência lógica do trabalho ═══════════════
   A ordem daqui é a ordem da cadência de entrega, não uma lista alfabética.
   A logo vem primeiro porque ela ENTRA no site, no Instagram e no Google: sem
   ela pronta, as outras três peças ficam para refazer depois.

   dia      = dia da cadência em que a peça é devida (bate com CADENCIA)
   minimo   = quantos arquivos a peça precisa para contar como feita
   entregavel = qual dos 4 entregáveis essa peça alimenta                    */
export const CATALOGO_ARQUIVOS = [
  { destino: "logo", dia: 1, entregavel: "logo", rotulo: "Logo",
    nota: "Primeiro de tudo: a logo entra no site, no Instagram e no Google. Fazer depois é refazer as três.",
    slots: [
      { slot: "principal", rotulo: "Principal (PNG transparente)", minimo: 1, max: 3,
        dica: "Fundo transparente de verdade. É o arquivo que vai para o cliente e para todos os canais." },
      { slot: "fundo-claro", rotulo: "Versão para fundo claro", minimo: 1, max: 3,
        dica: "Para o site e o papel. Costuma ser a versão escura da marca." },
      { slot: "fundo-escuro", rotulo: "Versão para fundo escuro", minimo: 1, max: 3,
        dica: "O Instagram e o site usam faixas escuras. Logo escura em fundo escuro desaparece." },
      { slot: "favicon", rotulo: "Ícone quadrado (perfil e aba)", minimo: 1, max: 2,
        dica: "Quadrado, só o símbolo, sem o texto. Serve de foto de perfil e de ícone da aba." },
    ] },
  { destino: "site", dia: 1, entregavel: "site", rotulo: "Site",
    nota: "A capa é a primeira coisa que o dono de casa vê. Ela decide se ele rola o resto ou fecha a aba.",
    slots: [
      { slot: "hero", rotulo: "Foto de capa", minimo: 1, max: 2,
        dica: "A melhor obra que existe, horizontal e bem iluminada. Domina a tela inteira." },
      { slot: "galeria", rotulo: "Galeria e antes/depois", minimo: 4, max: 30,
        dica: "Antes e depois é o formato que mais converte em obra. Só foto real do cliente." },
    ] },
  { destino: "instagram", dia: 2, entregavel: "instagram", rotulo: "Instagram",
    nota: "Os briefs dos 12 posts e dos 4 destaques saem prontos na geração. Aqui entram as artes finalizadas.",
    slots: [
      { slot: "perfil", rotulo: "Foto de perfil", minimo: 1, max: 2,
        dica: "O ícone quadrado da logo. Mesma imagem do Google, para parecer a mesma empresa." },
      { slot: "posts", rotulo: "Artes dos 12 posts", minimo: 12, max: 30,
        dica: "1080x1350. Uma arte por brief gerado. Sobe todas de uma vez." },
      { slot: "destaques", rotulo: "Capas dos 4 destaques", minimo: 4, max: 8,
        dica: "Antes e depois, serviços, região atendida e depoimentos reais." },
    ] },
  { destino: "gmb", dia: 4, entregavel: "gmb", rotulo: "Google Meu Negócio",
    nota: "O perfil é a peça de maior retorno do pacote. Foto de banco de imagem aqui é percebida na hora.",
    slots: [
      { slot: "logo-perfil", rotulo: "Logo do perfil", minimo: 1, max: 2,
        dica: "Quadrada. O Google recorta em círculo: deixe folga nas bordas." },
      { slot: "capa", rotulo: "Foto de capa", minimo: 1, max: 2,
        dica: "Horizontal, 1024x576 ou maior. É o que aparece grande na busca." },
      { slot: "obra", rotulo: "Fotos de obra (mínimo 10)", minimo: 10, max: 40,
        dica: "Perfil com 10 fotos de obra real ranqueia acima de perfil com 2. Use as do formulário." },
      { slot: "equipe", rotulo: "Veículo e equipe", minimo: 0, max: 10,
        dica: "Opcional, mas veículo com a marca é das fotos que mais geram confiança nos Estados Unidos." },
    ] },
  { destino: "entrega", dia: 5, entregavel: null, rotulo: "Pasta de entrega",
    nota: "O que mais o cliente recebe na reunião do 5º dia: tutorial, arquivos originais, o que sobrar.",
    slots: [
      { slot: "originais", rotulo: "Arquivos originais da marca", minimo: 0, max: 20,
        dica: "Ele é o dono da marca dele. Manda a pasta com todos os formatos." },
      { slot: "outros", rotulo: "Outros arquivos", minimo: 0, max: 40, dica: "" },
    ] },
];

// mapa plano destino/slot -> regra, para validar o que chega
const SLOTS = new Map();
for (const g of CATALOGO_ARQUIVOS)
  for (const s of g.slots) SLOTS.set(`${g.destino}/${s.slot}`, { ...s, destino: g.destino });

// Slots do CLIENTE (formulário público). Separados do catálogo da agência:
// o cliente manda matéria-prima, a agência manda peça pronta.
const SLOTS_CLIENTE = new Set(["cliente/foto", "cliente/video", "cliente/logo"]);

export const temR2 = (env) => !!(env && env.MIDIA);

/* ── URL pública de um arquivo ──
   A chave é aleatória (UUID), então o link não é adivinhável, mas também não
   é secreto: foto de obra do cliente existe justamente para aparecer no site
   dele. Vídeo e foto do formulário entram no site público do cliente. */
export const urlDe = (chave) => `/m/${chave}`;

/* ═══════════════ SERVIR ═══════════════
   Fica FORA do portão de sessão: o site do cliente é publicado no Vercel e
   busca as imagens daqui, de outro domínio, sem cookie nenhum.

   O Content-Type sai da EXTENSÃO da chave, conferida contra a lista de tipos
   aceitos. Sem ida ao banco: um site com 15 fotos faria 15 leituras no D1 por
   visitante, de graça. */
export async function servir(env, caminho) {
  const chave = caminho.slice(3);
  // c<id>/<uuid>.<ext> — nada de ".." nem de barra a mais
  if (!/^c\d{1,9}\/[0-9a-f]{32}\.[a-z0-9]{2,5}$/.test(chave)) return null;
  const ext = chave.slice(chave.lastIndexOf(".") + 1);
  const mime = POR_EXT[ext];
  if (!mime) return null;
  if (!temR2(env)) return new Response("armazenamento não configurado", { status: 503 });
  const obj = await env.MIDIA.get(chave);
  if (!obj) return new Response("não encontrado", { status: 404 });
  return new Response(obj.body, { headers: {
    "Content-Type": mime,
    "Cache-Control": "public, max-age=31536000, immutable",   // a chave nunca é reusada
    "Content-Length": String(obj.size),
    "X-Content-Type-Options": "nosniff",
  } });
}

/* ═══════════════ RECEBER ═══════════════
   Um arquivo por requisição, no corpo cru. Não é multipart de propósito: no
   celular, um lote de 15 fotos num único POST multipart estoura o limite de
   corpo e perde as 15 juntas. Uma por vez mostra progresso e o que falhou
   falha sozinho.

   Chamado pelas duas portas (formulário público e admin), com `origem`
   diferente. A validação é a mesma, e é toda no servidor: a do navegador
   serve só para o cliente não esperar o upload para descobrir o erro.       */
export async function receber(env, req, { cliente_id, origem, destino, slot, nome }) {
  if (!temR2(env))
    // Mensagem diferente para cada lado: o cliente não tem o que fazer com o
    // nome de um arquivo de pendências do repositório.
    return { erro: origem === "cliente"
      ? "O envio de arquivo está indisponível agora. Use o campo de colar link, no fim desta seção, ou fale com a gente pelo WhatsApp."
      : "Armazenamento de arquivo não configurado. Habilite o R2 no painel da Cloudflare e crie o bucket (ver wrangler.toml).",
      status: 503 };

  const mime = String(req.headers.get("Content-Type") || "").split(";")[0].trim().toLowerCase();
  const tipo = TIPOS[mime];
  if (!tipo) return { erro: `Tipo de arquivo não aceito (${mime || "sem tipo"}). Manda foto (JPG, PNG) ou vídeo (MP4, MOV).`, status: 415 };

  const chaveSlot = `${destino}/${slot}`;
  const regra = SLOTS.get(chaveSlot);
  if (!regra && !SLOTS_CLIENTE.has(chaveSlot))
    return { erro: "destino inválido", status: 400 };

  // Content-Length é declarado por quem sobe: serve para recusar ANTES de ler
  // 90 MB do corpo, mas o tamanho real é reconferido depois de ler.
  const teto = tipo.video ? TETO_VIDEO : TETO_IMAGEM;
  const declarado = Number(req.headers.get("Content-Length") || 0);
  const mb = (n) => (n / 1048576).toFixed(0);
  if (declarado > teto)
    return { erro: `Arquivo de ${mb(declarado)} MB. O limite é ${mb(teto)} MB por ${tipo.video ? "vídeo" : "foto"}.`, status: 413 };

  const buf = await req.arrayBuffer();
  if (!buf.byteLength) return { erro: "arquivo vazio", status: 400 };
  if (buf.byteLength > teto)
    return { erro: `Arquivo de ${mb(buf.byteLength)} MB. O limite é ${mb(teto)} MB.`, status: 413 };
  if (!assinaturaBate(mime, buf))
    return { erro: "O conteúdo do arquivo não corresponde ao tipo declarado.", status: 400 };

  // ── tetos de quantidade ──
  const jaTem = await env.DB.prepare(
    "SELECT COUNT(*) n FROM arquivos WHERE cliente_id=? AND origem=? AND slot=?")
    .bind(cliente_id, origem, slot).first();
  const noSlot = jaTem?.n || 0;
  if (regra && noSlot >= regra.max)
    return { erro: `"${regra.rotulo}" já tem ${noSlot} arquivos, o máximo é ${regra.max}.`, status: 409 };
  if (origem === "cliente") {
    const tetoCli = tipo.video ? TETO_VIDEOS_CLIENTE : TETO_FOTOS_CLIENTE;
    if (noSlot >= tetoCli)
      return { erro: `Você já mandou ${noSlot} ${tipo.video ? "vídeos" : "fotos"}, que é o limite.`, status: 409 };
  } else {
    const total = await env.DB.prepare(
      "SELECT COUNT(*) n FROM arquivos WHERE cliente_id=? AND origem='agencia'").bind(cliente_id).first();
    if ((total?.n || 0) >= TETO_ARQUIVOS_AGENCIA)
      return { erro: `Teto de ${TETO_ARQUIVOS_AGENCIA} arquivos por cliente atingido.`, status: 409 };
  }

  const chave = `c${cliente_id}/${crypto.randomUUID().replace(/-/g, "")}.${tipo.ext}`;
  await env.MIDIA.put(chave, buf, { httpMetadata: { contentType: mime } });

  // A linha só nasce depois do objeto existir. Na ordem inversa, uma falha no
  // R2 deixaria linha apontando para arquivo que não existe, e o admin
  // mostraria imagem quebrada sem explicação.
  try {
    const r = await env.DB.prepare(
      `INSERT INTO arquivos (cliente_id,chave,nome,mime,bytes,destino,slot,origem,criado_em)
       VALUES (?,?,?,?,?,?,?,?,?)`
    ).bind(cliente_id, chave, String(nome || "").slice(0, 160) || null, mime,
           buf.byteLength, destino, slot, origem, agora()).run();
    return { ok: true, id: r.meta.last_row_id, chave, url: urlDe(chave),
             mime, bytes: buf.byteLength, preview: !tipo.semPreview && !tipo.video };
  } catch (e) {
    await env.MIDIA.delete(chave).catch(() => {});   // não deixa objeto órfão pagando storage
    throw e;
  }
}

/* ═══════════════ APAGAR ═══════════════
   Objeto e linha, nessa ordem. Linha sem objeto o admin ainda consegue
   mostrar como "arquivo faltando"; objeto sem linha ninguém mais encontra e
   ele fica ocupando espaço para sempre. */
export async function apagar(env, cliente_id, id) {
  const a = await env.DB.prepare("SELECT chave FROM arquivos WHERE id=? AND cliente_id=?")
    .bind(id, cliente_id).first();
  if (!a) return { erro: "arquivo não encontrado", status: 404 };
  if (temR2(env)) await env.MIDIA.delete(a.chave).catch((e) => console.log("r2 delete:", e.message));
  await env.DB.prepare("DELETE FROM arquivos WHERE id=?").bind(id).run();
  return { ok: true };
}

// Todo arquivo do cliente vai embora junto com ele. O D1 não faz cascade, e
// storage órfão no R2 é conta que continua chegando.
export async function apagarDoCliente(env, cliente_id) {
  const { results } = await env.DB.prepare("SELECT chave FROM arquivos WHERE cliente_id=?")
    .bind(cliente_id).all();
  if (temR2(env))
    for (const a of results) await env.MIDIA.delete(a.chave).catch(() => {});
  await env.DB.prepare("DELETE FROM arquivos WHERE cliente_id=?").bind(cliente_id).run();
}

/* Estado de cada peça do catálogo: quantos arquivos tem, quantos falta, e se
   a peça está completa. É o que desenha a régua do fluxo de trabalho no card
   e o que o portão de conclusão consulta. */
export function progresso(arquivos = []) {
  const daAgencia = arquivos.filter((a) => a.origem === "agencia");
  return CATALOGO_ARQUIVOS.map((g) => {
    const slots = g.slots.map((s) => {
      const meus = daAgencia.filter((a) => a.destino === g.destino && a.slot === s.slot);
      return { ...s, arquivos: meus, tem: meus.length,
               falta: Math.max(0, s.minimo - meus.length),
               completo: meus.length >= s.minimo };
    });
    const obrig = slots.filter((s) => s.minimo > 0);
    return { ...g, slots,
             completo: obrig.every((s) => s.completo),
             tem: slots.reduce((n, s) => n + s.tem, 0),
             falta: obrig.reduce((n, s) => n + s.falta, 0) };
  });
}
