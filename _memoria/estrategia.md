# Estratégia

> O que importa agora. Prioridades, metas, prazos.
> O Claude usa isso pra decidir o que sugerir primeiro e o que adiar.
> Atualize sempre que as prioridades mudarem.

## Fase

Empresa nova, começando do zero (fase 0→1). Fundador sozinho, montando venda, estrutura própria e entrega ao mesmo tempo.

## Prioridade principal

Vender + montar estrutura própria + entregar pros clientes, tudo sozinho. Playbook operacional já consolidado em `_memoria/playbook-operacao.md` (transcrito das 4 aulas da mentoria, versão nova) — faltam 3 aulas ainda não liberadas, atualizar quando saírem.

## Sistemas construídos (2026-09-05)

Dois sistemas prontos e testados em `sistemas/`, feitos a partir das 311 especificações extraídas das
4 aulas (`_memoria/historico/ESPECIFICACOES-SISTEMAS.md`):

- **CRM Comercial** (`sistemas/crm-comercial/`, porta 8770) — 4 pipelines com decaimento automático de
  24h, cadência de confirmação de call, máquina de no-show, KPIs com diagnóstico de gargalo, Z-API e
  variação de mensagem por IA. Todas as automações testadas.
- **Operação de Entrega** (`sistemas/02-entrega/`, porta 8771) — cadastro do cliente fechado,
  formulário, geração do site (Cloudflare Pages), das 20 reviews estratégicas em inglês e dos briefs
  dos 12 posts + 4 destaques, mais a régua dos 14 dias.

Ordem de uso recomendada pela própria aula: começar pela entrega manual (sistema 2); ligar o CRM
comercial só na transição do 2º para o 3º cliente.

## Decisões tomadas

- **Número de atendimento nos EUA (2026-09-05):** será obtido pela via legítima (Google Voice,
  OpenPhone ou linha real), **não** pelo método da aula — que ensina comprar número por bot do
  Telegram para simular presença nos EUA. Decisão do usuário, alinhada à regra de integridade.

## O que pode esperar

Preenchimento manual de CRM com dados vindos do WhatsApp — candidata a virar skill própria via `/mapear-rotinas` assim que o processo estiver mapeado (depende do material das aulas).

## Contexto com prazo

Nenhum prazo definido ainda.

## Estado da marca (confirmado em 2026-09-03, ver `_memoria/historico/ESTADO-ATUAL.md`)

**Concluído:** naming e slogan (Leon Group / Built to Lead.), identidade visual (preto + laranja, leão no O), brand kit completo, e-mail, Instagram e YouTube criados, kit visual do YouTube, duas séries de 12 posts publicadas, 42 Stories + destaques em 6 abas.

**Pendente/sem confirmação:** página do Facebook, WhatsApp Business configurado, número de atendimento legítimo nos EUA, conexão no Meta Business Suite (pixel/dataset/conta de anúncios), oferta principal por escrito (escopo/preço/prazo), recorte comercial prioritário dentro de construction/home services, landing page, apresentação comercial, proposta/contrato/cobrança/onboarding, 5 criativos de aquisição, campanha inicial, sistema de acompanhamento de funil, primeiro cliente real, primeiro case com depoimento verificável.

**Regra de integridade (não negociável):** nunca declarar cliente inexistente como real, nunca inventar depoimento/avaliação/localização/equipe/resultado, nunca reutilizar mídia sem licença, nunca prometer faturamento ou posição no Google sem base verificável. Mockups/demonstrações só valem rotulados como tal. Prova social real só depois do primeiro trabalho pago e documentado.
