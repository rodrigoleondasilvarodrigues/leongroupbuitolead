# Estratégia

> O que importa agora. Prioridades, metas, prazos.
> O Claude usa isso pra decidir o que sugerir primeiro e o que adiar.
> Atualize sempre que as prioridades mudarem.

## Fase

Empresa nova, começando do zero (fase 0→1). Fundador sozinho, montando venda, estrutura própria e entrega ao mesmo tempo.

## Prioridade principal

Vender + montar estrutura própria + entregar pros clientes, tudo sozinho. Playbook operacional já consolidado em `_memoria/playbook-operacao.md` (transcrito das 4 aulas da mentoria, versão nova). Faltam 3 aulas ainda não liberadas, atualizar quando saírem.

## O sistema no ar (atualizado em 2026-09-09)

**https://leon-group.leongroup.workers.dev** (Cloudflare Workers + D1 + R2, código em
`sistemas/cloudflare/`). Aplicação única, protegida por senha, que substituiu os dois
sistemas locais em Python. Motor de automação por cron a cada 15 minutos.

Os dois sistemas antigos (`sistemas/crm-comercial/` e `sistemas/02-entrega/`, portas
8770 e 8771) ficam como histórico. **Não são mais o que roda.**

O que o sistema faz hoje:

- **Comercial:** 4 pipelines com decaimento de 24h, cadência de confirmação de call,
  máquina de no-show, nutrição e recuperação. Relógio do fuso de cada lead no card.
- **Dashboard:** funil de verdade (largura proporcional, altura constante), com a
  conversão de cada passagem, o gargalo apontado e as saídas laterais (fechou na call,
  fechou no follow-up, recusou, perdido). Diagnóstico determinístico sempre, mais botão
  de análise por IA. Com menos de 5 leads numa etapa ele se cala e diz que se calou.
- **Caixa:** entradas e saídas em dólar E real ao mesmo tempo, cada lançamento com a
  cotação do dia em que aquele dinheiro se moveu. Navegação por mês, gasto por
  categoria, extrato por dia, custo fixo mensal. Separa **lucro nos clientes** de
  **saldo do caixa**, que são perguntas diferentes.
- **Entrega:** cadastro do cliente fechado, formulário de onboarding com upload direto
  do celular (R2), geração do site + 20 reviews + briefs dos 12 posts e 4 destaques,
  checklist de otimização de 40 itens com passo a passo, cadência de 5 dias úteis,
  portão de conclusão explícito e fechamento antecipado por frase digitada.
- **Logo:** prompt JSON para o gpt-image-2 montado a partir do briefing do cliente.

Suíte de testes em **402 asserções** (`sistemas/cloudflare/testes/rodar.sh`). Rodar
antes de todo deploy.

Ordem de uso recomendada pela própria aula: começar pela entrega manual; ligar o
CRM comercial só na transição do 2º para o 3º cliente.

### Dívida técnica conhecida, em ordem de importância

1. **A auditoria adversarial parou no achado 7 de 32** e agora há superfície nova no
   ar: upload público, rota de mídia pública e três rotas que chamam API externa.
   Vale uma segunda rodada antes de operar com volume.
2. **Nada limpa o R2.** Apagar cliente apaga os arquivos dele; **arquivar não**. Sem
   alerta de uso dos 10 GB grátis. Vídeo come rápido: 40 MB cada, 5 por cliente.
3. **Vídeo acima de 95 MB** não sobe: o corpo de requisição do Worker para em 100 MB
   no plano grátis.

Detalhe de tudo em `sistemas/cloudflare/PENDENCIAS.md`.

## Site da agência (2026-09-06, revisado no mesmo dia)

No ar em **https://leon-group-site.pages.dev** (Cloudflare Pages, código em
`sistemas/site-agencia/`). Bilíngue PT/EN com escolha na primeira visita, história,
serviços, as doze funções, método, FAQ e formulário na própria página que abre o
WhatsApp com mensagem pronta e **também cria o lead no CRM** (rota `/api/site-lead`).

- ✅ **WhatsApp oficial (2026-09-10):** `12133960014` (+1 213 396 0014, americano, área 213,
  Los Angeles), obtido pelo Vnumber. **Ativo no WhatsApp Business desde o fim do dia
  2026-09-10**, confirmado pelo Rodrigo. O SMS de verificação falhou nas primeiras
  tentativas e o número chegou a entrar em bloqueio de segurança, mas depois entrou.
  Falta o teste ponta a ponta: mandar mensagem pelo botão do site e ver chegar.
  Substituiu o provisório brasileiro
  `5561998629189`, que não volta. Fica numa única linha em
  `sistemas/site-agencia/conteudo.js`, e no CRM no campo `meu_whatsapp` da tabela
  `config` (tela "WhatsApp do CRM" do admin). Os dois já estão com o número novo.
- Falta domínio próprio. Ao registrar, acrescentar a origem em `ORIGENS_SITE` no
  `sistemas/cloudflare/src/index.js`, senão o CORS barra o formulário.
- Texto escrito dentro da regra de integridade: assume que a agência é nova, sem caso
  publicado, e que a operação é remota. `teste.js` (96 verificações) falha se mudar.
- **Seção "O time por trás"**: doze funções executadas na conta (gestor de projeto,
  head comercial, GMN, SEO, copywriter, designer, social media, editor de vídeo, IA e
  automação, head de performance, gestor de tráfego pago, suporte integral). É escopo
  de trabalho, **nunca contagem de funcionários**: o teste falha se virar headcount.
- **Tráfego pago (Google Ads search + Meta Ads) é a última etapa**, marcado como tal
  no card de serviço e no sexto passo do método. Decisão do usuário.
- **Incentivo de conversão:** diagnóstico gratuito por escrito do Google Business
  Profile, site e avaliações do lead. É trabalho real e entregável, não isca falsa.
  **Quando entrar o primeiro pedido, esse diagnóstico precisa ser entregue de fato.**
- **Captura de formulário abandonado:** com o WhatsApp preenchido, o parcial vai pro
  CRM em 2,5s e num `sendBeacon` ao sair. Costurado por `sessao_site` (índice único,
  migração 06) para não duplicar quando a pessoa terminar depois. Avisado na tela
  antes de a pessoa digitar. Teto de 8 parciais novos por IP a cada 15 min.
- Seção "Transparência / O que a gente não faz" foi **removida** a pedido do usuário.
  As afirmações honestas continuam no FAQ, na história e na nota do rodapé.

## Próxima frente: aquisição (pendente, definido em 2026-09-09)

Três coisas, nesta ordem, e nenhuma delas depende do sistema (que já está pronto):

**1. Produzir os criativos, todos.** São **26 roteiros escritos** e prontos para a
ferramenta: **20 da leva Massachusetts** (16 com ator de IA, 4 para o Rodrigo gravar) e
**6 da leva Los Angeles** (`marketing/anuncios/roteiros-la.json`, numerados 101 a 106,
adaptação dos roteiros 1, 2, 4, 12, 15 e 20, com o 106 para o Rodrigo gravar). Fonte de verdade em
`marketing/anuncios/roteiros-20.json`, documento montado em
`saidas/Leon-Group-20-Roteiros-de-Anuncio.pdf`. Cada roteiro tem um prompt único,
copiável de uma vez, com o storyboard embaixo.
Falta produzir os vídeos, **em lote pequeno**: o Arcads cobra $110 por 10 vídeos, não tem
teste grátis, e "não gostei do resultado" não é reembolsável. Gravar primeiro os 4 do
Rodrigo (custa zero), depois 1 no Arcads para conferir, depois 3 ou 4. Economia da
ferramenta apurada na fila operacional.
Sem criativo pronto não há campanha, e o criativo é a primeira coisa que o diagnóstico
do funil acusa quando a conversão de entrada está baixa.

**2. Pegar o número americano. ✅ FEITO em 2026-09-10.** `+1 213 396 0014`, pelo
Vnumber, pela via legítima, e não pelo método da aula (número por bot do Telegram para
simular presença nos EUA). Já está no site e no CRM, e o **WhatsApp Business foi ativado
nele no fim do dia 10**. Esta frente deixou de ser bloqueante. Falta configurar a
identidade do WhatsApp Business (nome, descrição, horário, respostas rápidas) e fazer o
teste ponta a ponta pelo botão do site. Nota: a área 213 é de Los Angeles, e a prioridade
comercial é Massachusetts e Boston (área 617, 508, 781, 978). Não impede nada, mas um
lead de Boston vê um número da Califórnia.

**3. Tráfego pago.** Confirmado em 2026-09-09 que Instagram, Business Manager, conta de
anúncios e meio de pagamento **já existem e funcionam**. Falta só a **página do Facebook**,
mais a campanha montada, o orçamento definido e a régua de acompanhamento no dashboard.

O passo a passo completo da subida está em `_memoria/playbook-campanha-meta.md`, com PDF em
`saidas/Leon-Group-Campanha-Meta-Passo-a-Passo.pdf` e artefato publicado em
https://claude.ai/code/artifact/d133d37c-52f0-4190-ad0e-65dd79e9960c (checklist que guarda o
progresso). Inclui a copy pronta de cada anúncio, a mensagem inicial do WhatsApp, os cortes
por dia e a folha de fazer e não fazer.

**Segmentação decidida em 2026-09-10:** Estados Unidos como país, excluindo Brasil e Alasca,
filtrado por **idioma português**. Não se segmenta por cidade: o filtro real é o idioma, e
restringir a área encolhe o público e encarece a entrega. De onde os leads vêm se lê no CRM.

**Cobrança:** o **WHOP já funciona**, com link limitado a **US$ 2.500 por cobrança**. Esse
teto é entrada da decisão de preço no item 1, não um detalhe para depois.
⚠ Lembrar da decisão de posicionamento: **para o cliente**, tráfego pago é a última
etapa do método, e o site diz isso. Isso vale para a entrega dos clientes, não para a
aquisição da própria agência, que é o caso aqui.

**O que não está no caminho:** o sistema. CRM, caixa, entrega, upload e site estão
prontos e testados. O gargalo agora é criativo, número e campanha.

**A fila completa e priorizada** está em
`_memoria/historico/PENDENCIAS-E-PROXIMOS-PASSOS.md`, ordenada por importância e
urgência, com o que já foi feito marcado. É a lista para trabalhar; esta seção
aqui é só o resumo das três frentes.

## Decisões tomadas

- **Número de atendimento nos EUA (2026-09-05):** será obtido pela via legítima (Google Voice,
  OpenPhone ou linha real), **não** pelo método da aula, que ensina comprar número por bot do
  Telegram para simular presença nos EUA. Decisão do usuário, alinhada à regra de integridade.

## O que pode esperar

Preenchimento manual de CRM com dados vindos do WhatsApp, candidata a virar skill própria via `/mapear-rotinas` assim que o processo estiver mapeado (depende do material das aulas).

## Contexto com prazo

Nenhum prazo definido ainda.

## Estado da marca (confirmado em 2026-09-03, ver `_memoria/historico/ESTADO-ATUAL.md`)

**Concluído:** naming e slogan (Leon Group / Built to Lead.), identidade visual (preto + laranja, leão no O), brand kit completo, e-mail, Instagram e YouTube criados, kit visual do YouTube, duas séries de 12 posts publicadas, 42 Stories + destaques em 6 abas.

**Feito depois disso:** site da agência no ar, sistema completo no ar (CRM, caixa, entrega, upload), **20 roteiros de anúncio escritos**, e o sistema de acompanhamento de funil (é o dashboard do CRM).

**Pendente:** os 20 criativos **produzidos** (roteiro escrito não é criativo pronto), número de atendimento legítimo nos EUA, WhatsApp Business, página do Facebook, Meta Business Suite (pixel/dataset/conta de anúncios), campanha inicial, oferta principal por escrito (escopo/preço/prazo), recorte comercial prioritário dentro de construction/home services, apresentação comercial, proposta/contrato/cobrança/onboarding, domínio próprio, primeiro cliente real, primeiro case com depoimento verificável.

As três primeiras frentes estão detalhadas na seção "Próxima frente: aquisição".

**Regra de integridade (não negociável):** nunca declarar cliente inexistente como real, nunca inventar depoimento/avaliação/localização/equipe/resultado, nunca reutilizar mídia sem licença, nunca prometer faturamento ou posição no Google sem base verificável. Mockups/demonstrações só valem rotulados como tal. Prova social real só depois do primeiro trabalho pago e documentado.
