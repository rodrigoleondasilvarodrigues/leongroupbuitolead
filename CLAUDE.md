# MazyOS — Sistema operacional do negócio

Sua empresa roda em cima desse arquivo. Aqui ficam as regras de operação
do MazyOS — como o Claude lê o contexto, aprende com correções, mantém
tudo atualizado e cria skills novas conforme a operação evolui.

Esse arquivo é editável. Quando o `/instalar` rodar, ele complementa o
final dessa página com as regras específicas do seu negócio.

---

## Contexto do negócio

No início de toda conversa, ler os seguintes arquivos (quando existirem
e estiverem preenchidos):

1. `_memoria/empresa.md` — quem é o usuário, o que faz, como funciona o negócio
2. `_memoria/preferencias.md` — tom de voz, estilo de escrita, o que evitar
3. `_memoria/estrategia.md` — foco atual, prioridades, prazos

Usar essas informações como base pra qualquer resposta ou decisão. Ao
sugerir prioridades, formatos ou abordagens, considerar o foco atual
descrito em `estrategia.md`.

Pra qualquer tarefa visual (carrossel, post, landing page), consultar
`identidade/design-guide.md` como referência de estilo.

Não é necessário listar o que foi lido nem confirmar a leitura. Apenas
usar o contexto naturalmente.

---

## Fluxo de trabalho

Antes de executar qualquer tarefa, verificar se existe skill relevante
em `.claude/skills/`. Se encontrar, seguir as instruções da skill. Se
não encontrar, executar a tarefa normalmente.

Ao concluir uma tarefa que não tinha skill mas parece repetível (o
usuário provavelmente vai pedir de novo no futuro), perguntar:

> "Isso pode virar uma skill pra próxima vez. Quer que eu crie?"

Não perguntar pra tarefas pontuais ou perguntas simples. Só quando o
padrão de repetição for claro.

---

## Aprender com correções

Quando o usuário corrigir algo, melhorar uma resposta ou dar uma
instrução que parece permanente (frases como "na verdade é assim", "não
faça mais isso", "prefiro assim", "sempre que...", "evita...", "da
próxima vez..."), perguntar:

> "Quer que eu salve isso pra não precisar repetir?"

Se sim, identificar onde faz mais sentido salvar:

- **Sobre o negócio** (clientes, serviços, mercado) → `_memoria/empresa.md`
- **Sobre preferências e estilo** (tom de voz, formato, o que evitar) → `_memoria/preferencias.md`
- **Sobre prioridades e foco** (projetos, metas, prazos) → `_memoria/estrategia.md`
- **Regra de comportamento nessa pasta** → próprio `CLAUDE.md`

Salvar com uma linha nova clara, sem reformatar o arquivo inteiro.
Confirmar mostrando a linha adicionada.

Não perguntar se a correção for óbvia de contexto imediato (ex: "na
verdade o arquivo se chama X"). Só perguntar quando a informação tiver
valor duradouro.

---

## Manter contexto atualizado

Ao terminar uma tarefa que mudou algo relevante (cliente novo, skill
nova, mudança de foco, processo novo, ferramenta instalada, estrutura
alterada), perguntar:

> "Isso mudou algo no teu contexto. Quer que eu atualize a memória?"

Se sim, identificar o que atualizar:

- **Cliente, serviço, ferramenta, equipe** → `_memoria/empresa.md`
- **Mudança de prioridade ou foco** → `_memoria/estrategia.md`
- **Tom ou estilo** → `_memoria/preferencias.md`
- **Pasta, regra de organização, skill criada** → `CLAUDE.md`
- **Visual (cores, fontes, logo)** → `identidade/design-guide.md`

Mostrar o que vai mudar antes de salvar. Não reformatar o arquivo
inteiro, só adicionar ou editar a linha relevante.

**Quando NÃO perguntar:**
- Tarefas pontuais sem impacto no contexto (escrever um email avulso, criar um post)
- Perguntas simples ou conversas sem ação
- Mudanças já salvas pelo bloco "Aprender com correções"

**Dica:** rode `/atualizar` pra uma varredura completa quando houver dúvida.

---

## Criação de skills

Quando o usuário pedir skill nova:

1. Verificar se existe template relevante em `templates/skills/`. Se
   existir, usar como base e adaptar pro contexto
2. Perguntar se é específica desse projeto ou útil em qualquer:
   - Específica → `.claude/skills/nome-da-skill/SKILL.md` (local)
   - Universal → `~/.claude/skills/nome-da-skill/SKILL.md` (global)
3. Ler `_memoria/empresa.md` e `_memoria/preferencias.md` pra calibrar
   o conteúdo da skill ao contexto do negócio
4. Se a skill precisar de arquivos de apoio (templates, exemplos),
   criar dentro da pasta da skill
5. Seguir o fluxo da skill-creator nativa do Claude Code

---

# Leon Group — Built to Lead.

Agência enxuta de geração de leads (metodologia LeadsEveryDay) para brasileiros donos ou operadores de empresas de construção e home services nos EUA. Ajuda quem já sabe executar o serviço a construir presença, organização e aquisição suficientes para competir e liderar — marca, Google Business Profile, landing page, conteúdo, aquisição e processo comercial. Fundador opera sozinho hoje; planeja trazer a namorada pra ajudar em alguma frente futuramente.

## Identidade oficial (não recriar — só usar)

- Nome: **Leon Group** · Slogan: **Built to Lead.**
- Símbolo obrigatório: cabeça de leão integrada à letra **O** de LEON — nunca usar versão sem o leão
- Logo pronto em `identidade/logo.png` (fundo escuro: `identidade/logo-fundo-escuro.png`); kit completo (22 arquivos: horizontal, vertical, monocromático, ícones, favicon, aplicações) em `identidade/brand-kit/`
- E-mail `leongroup.builtolead@gmail.com` · Instagram `@leongroup.builtolead` · YouTube criado e descrito
- Paleta para peças **novas**: marfim `#F7F3EA`, preto `#171717`, laranja `#E65A19` (escuro `#C44712`) — ver `identidade/design-guide.md` pra paleta completa. O brand kit oficial em si usa preto `#161616`/laranja `#E15818`: **não recolorir os arquivos existentes**, só as peças futuras seguem a paleta nova.
- Direção estética: sofisticada, clara, bastante espaço negativo, laranja só como ênfase. Evitar 3D, brilho, excesso de ornamento, aparência genérica de IA.

## Público e mercado

Contractors e empresas de construção/home services nos EUA, foco em brasileiros. Nichos: Remodeling, Flooring, Painting, Cabinets, Roofing, Gutters, HVAC. Prioridade geográfica inicial: **Massachusetts e Boston**. Recorte comercial prioritário dentro desses nichos ainda **não confirmado** — não decidir por conta própria, perguntar ao usuário quando isso for relevante pra uma entrega.

## Estrutura de pastas

- `sistemas/cloudflare/`: **o sistema que roda de verdade**, no ar em
  `https://leon-group.leongroup.workers.dev` (Workers + D1 + R2). CRM comercial, dashboard com
  funil, caixa em dólar e real, operação de entrega e upload de mídia, tudo numa aplicação só.
  Suíte de **402 asserções** em `testes/rodar.sh`: rodar antes de todo deploy. Estado e dívida
  técnica em `sistemas/cloudflare/PENDENCIAS.md`.
- `sistemas/crm-comercial/` e `sistemas/02-entrega/`: versões locais em `python3`, **substituídas**
  pela aplicação Cloudflare. Ficam como histórico, não são o que roda. Não desenvolver nelas.
- `sistemas/site-agencia/`: site público da agência (Cloudflare Pages). Índice em `sistemas/README.md`.
- `_memoria/` — quem é a agência, tom de voz, foco atual (`empresa.md`, `preferencias.md`, `estrategia.md`)
- `_memoria/historico/` — **fonte de verdade histórica**: estado consolidado, decisões de marca, pendências, aulas/hotseat estudados, credenciais (sem senhas reais), conversa completa, inventário. Consultar antes de perguntar algo que pode já estar decidido ali.
- `_memoria/historico/exploracoes-visuais/` — naming e identidades **descartados** (Valdieri, Leoni, Leone Group, variantes A/B/C/E de logo/paleta, 28 logos iniciais). Puramente histórico — nunca usar como identidade atual, nunca restaurar esses nomes. Pasta pesada (~180MB de imagens): considerar manter fora do git (ver nota em Segurança e higiene).
- `identidade/` — brand kit oficial + design guide (marca **atual**, pronta pra uso)
- `marketing/redes-sociais/` — ativos já publicados por canal (`youtube/`, `instagram/`, `facebook/`, `materiais-gerais/` — WhatsApp, LinkedIn, X, assinatura, guias). A existência da arte **não confirma** que a conta/canal foi configurado — ver estado real em `_memoria/estrategia.md`.
- `clientes/`, `briefings/`, `propostas/` — criadas sob demanda quando surgir o primeiro cliente real
- `saidas/`, `dados/`, `scripts/` — conforme convenção padrão do MazyOS

## Fonte de verdade (nessa ordem)

1. Pedido mais recente do usuário na conversa atual
2. `_memoria/estrategia.md` e `_memoria/historico/ESTADO-ATUAL.md` / `DECISOES-DE-MARCA.md`
3. Ativos oficiais em `identidade/` e `marketing/redes-sociais/`
4. `_memoria/historico/CONVERSA-COMPLETA.md` (só pra recuperar formulação exata de algo que não esteja nos documentos consolidados)

## Antes de criar qualquer peça nova

Inspecionar o que já existe em `identidade/` e `marketing/redes-sociais/` — **não recriar logo, posts, kits ou Stories já concluídos**. Se a tarefa parecer já entregue, avisar o usuário e perguntar se quer mesmo refazer.

## Estado da operação

Lista completa e atualizável em `_memoria/estrategia.md` (seção "Estado da marca") e `_memoria/historico/PENDENCIAS-E-PROXIMOS-PASSOS.md`. Resumo: identidade, brand kit, e-mail, Instagram, YouTube e duas séries de posts + 42 Stories estão **prontos e publicados**. Facebook, WhatsApp Business, Meta Business Suite, oferta comercial por escrito, landing page, proposta/contrato e primeiro cliente real estão **pendentes**.

Passo a passo operacional completo (criativos, campanha, qualificação, CRM, contratação) em `_memoria/playbook-operacao.md` — inclui um aviso jurídico sobre classificação de colaborador PJ que precisa de validação profissional antes de aplicar.

Depois de qualquer entrega que mude esse estado (canal configurado, oferta definida, cliente fechado), atualizar `_memoria/estrategia.md` — não deixar a lista de pendências desatualizada.

## Integridade — regra não negociável

Nunca declarar cliente inexistente como real, nunca inventar depoimento, avaliação, localização, equipe ou resultado, nunca reutilizar mídia sem licença, nunca prometer faturamento ou posição no Google sem base verificável. Mockup/demonstração só vale rotulado como tal. Prova social real só depois de um primeiro trabalho pago e documentado.

Motivo: o material de origem (aulas + hotseat estudados, ver `_memoria/historico/AULAS-E-HOTSEAT.md`) inclui táticas enganosas de terceiros — casos fake, depoimento encenado, prints manipulados, falsa presença nos EUA, pressão de venda sem tempo de decisão. Ficam registradas como histórico estudado, **nunca como processo operacional da Leon Group**.

## Regra editorial (correção confirmada do usuário)

Posts e conteúdo público falam com a **dor do público-cliente** (contractors/home services) — nunca explicam ou citam o conteúdo das aulas estudadas. As aulas são estratégia interna de bastidor, não pauta de post.

## Segurança e higiene do repositório

- Nunca armazenar senha, token, chave de API ou dado de pagamento em qualquer arquivo do projeto — usar gerenciador de senhas externo. Ver `_memoria/historico/CREDENCIAIS-E-SEGURANCA.md`.
- `_memoria/historico/exploracoes-visuais/` é grande (~180MB de imagens descartadas). Antes de rodar `/salvar` pela primeira vez, considerar excluir essa pasta do git (adicionar ao `.gitignore`) pra não inflar o repositório — os arquivos continuam preservados localmente.

## Tom de voz

Ainda não calibrado com exemplo real, ver `_memoria/preferencias.md`. Direção geral confirmada: confiante, direto, profissional, claro, próximo de contractors brasileiros nos EUA. Evitar: "vamos juntos!", emoji em email formal, "caro cliente", jargão de guru ("alavancar", "sinergia").

**Nada de travessão (o tracinho longo) separando frase.** Regra permanente do usuário (2026-09-06), vale em todo texto: site, post, proposta, email e nas próprias respostas do Claude. Usar vírgula, dois-pontos, ponto ou parêntese. Hífen de palavra composta continua normal.

## Idioma

Colaboração com o usuário em português, simples e direto. Peças voltadas ao mercado americano (posts, site, anúncios) em inglês quando for o idioma do público-alvo.

## Ferramentas conectadas

- [ ] Notion
- [ ] Gmail
- [ ] Google Calendar
- [ ] Canva
- [ ] Meta Ads
- [ ] Google Ads
- [ ] WhatsApp (captação/atendimento)
- [ ] CRM (acompanhamento dos leads)

*(Marcar conforme for instalando os MCPs)*
