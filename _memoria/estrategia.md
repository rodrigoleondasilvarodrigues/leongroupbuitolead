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

- ⚠ **WhatsApp provisório:** `5561998629189` (brasileiro, DDD 61). Usuário avisou que
  troca "muito em breve". Fica numa única linha em `sistemas/site-agencia/conteudo.js`.
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

**1. Produzir os criativos, todos.** Os **20 roteiros já estão escritos** e prontos para
a ferramenta: 16 com ator de IA e 4 para o Rodrigo gravar. Fonte de verdade em
`marketing/anuncios/roteiros-20.json`, documento montado em
`saidas/Leon-Group-20-Roteiros-de-Anuncio.pdf`. Cada roteiro tem um prompt único,
copiável de uma vez, com o storyboard embaixo.
Falta: **gerar os 16 vídeos com ator de IA, gravar os 4 do Rodrigo, editar e legendar.**
Sem criativo pronto não há campanha, e o criativo é a primeira coisa que o diagnóstico
do funil acusa quando a conversão de entrada está baixa.

**2. Pegar o número americano.** Pela via legítima (Google Voice, OpenPhone ou linha
real), **nunca** pelo método da aula, que ensina comprar número por bot do Telegram para
simular presença nos EUA. Decisão já tomada em 2026-09-05, ver abaixo.
Trava três coisas ao mesmo tempo: o site ainda usa um WhatsApp brasileiro provisório
(`5561998629189`), o WhatsApp Business não pode ser configurado sem ele, e ligar para
lead americano de número brasileiro derruba a taxa de atendimento.

**3. Tráfego pago, do começo ao fim.** Página do Facebook, Meta Business Suite conectado
(pixel, dataset, conta de anúncios), campanha montada, orçamento definido, e a régua de
acompanhamento ligada no dashboard do CRM.
⚠ Lembrar da decisão de posicionamento: **para o cliente**, tráfego pago é a última
etapa do método, e o site diz isso. Isso vale para a entrega dos clientes, não para a
aquisição da própria agência, que é o caso aqui.

**O que não está no caminho:** o sistema. CRM, caixa, entrega, upload e site estão
prontos e testados. O gargalo agora é criativo, número e campanha.

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
