# Pesquisa: ABO contra CBO, verba mínima por criativo e as métricas que valem

Pesquisado em 2026-09-16, em fontes de fora da mentoria, porque isto é regra de plataforma e
prática de mercado, não opinião de instrutor. As fontes estão no fim.

**A pergunta que motivou:** dá para rodar 1 campanha com 5 conjuntos em ABO, um criativo em cada,
com R$ 250 por dia?

**A resposta curta:** dá para montar, mas é a pior das três opções com a sua verba. O motivo não é
gosto, é a matemática da fase de aprendizado. Detalhe abaixo.

---

## 1. O que é cada um

| Sigla | O que significa | Onde fica a verba |
|---|---|---|
| **ABO** | Ad Set Budget Optimization | No **conjunto**. Cada conjunto gasta o seu, independente |
| **CBO** | Campaign Budget Optimization, hoje chamado **Advantage campaign budget** | Na **campanha**. O Meta distribui entre os conjuntos e concentra no que responde |

O consenso de mercado cabe em uma frase: **testa em ABO, escala em CBO.** ABO dá leitura limpa
porque cada criativo recebe a mesma verba. CBO dá eficiência porque o Meta empurra o dinheiro para
quem está performando, e por isso mesmo atrapalha teste: é comum 20% dos conjuntos levarem 80% da
verba.

---

## 2. A regra que decide tudo: 50 eventos por conjunto por semana

O Meta precisa de aproximadamente **50 eventos de otimização por conjunto, a cada 7 dias**, para
sair da fase de aprendizado. Abaixo disso o conjunto entra em **aprendizagem limitada**, que não se
resolve esperando: a conta não fecha e a entrega fica instável para sempre.

No seu caso, o evento de otimização é **conversa iniciada no WhatsApp**.

A fórmula que sai daí:

```
verba diária mínima por conjunto = (custo alvo por evento × 50) ÷ 7
```

Com custo alvo de R$ 40 por conversa, isso dá **R$ 285 por dia POR CONJUNTO** para sair do
aprendizado. Guarde esse número: ele é maior que a sua verba diária inteira.

**Mínimo oficial da plataforma:** US$ 1 por dia por conjunto. É o que o sistema aceita, não o que
funciona. O mínimo prático citado nas fontes fica entre US$ 50 e US$ 250 por dia por conjunto, para
campanhas de conversão.

⚠️ **Cuidado com a conversão de moeda:** as referências de US$ 100 a US$ 150 de gasto por criativo
para julgar um teste valem para campanhas de compra, onde cada evento custa muito mais que uma
conversa de WhatsApp. Não dá para traduzir direto. A régua de R$ 100 por criativo da aula é bem
mais baixa que a literatura, e continua sendo o piso mínimo para julgar, não o ideal.

---

## 3. A sua verba nas três estruturas

Verba real: R$ 250 por dia de quinta a domingo, R$ 100 por dia de segunda a quarta. **R$ 1.300 por
semana.**

| Estrutura | Verba por conjunto por dia | Conversas por semana por conjunto (CPL R$ 40) | Distância dos 50 eventos |
|---|---|---|---|
| **A. 5 conjuntos ABO** (a sua proposta) | R$ 50 nos dias cheios, R$ 20 nos outros | ~6,5 | 13% do necessário |
| **B. 3 conjuntos ABO** | R$ 83 nos dias cheios | ~11 | 22% |
| **C. 1 conjunto só** (CBO ou ABO único) | R$ 250 nos dias cheios | ~32 | 65% |

Nenhuma das três sai do aprendizado com essa verba. Mas a estrutura C chega a dois terços do
caminho, e a A fica em um oitavo.

**O que isso significa na prática, sem jargão:** quanto mais você divide, mais cada pedaço fica
cego. Cinco conjuntos com R$ 50 significam cinco máquinas aprendendo devagar ao mesmo tempo, cada
uma com dados demais de pouca coisa. As fontes recomendam exatamente o contrário quando a verba é
curta: **juntar em 1 ou 2 conjuntos em vez de espalhar em 5.**

**E a regra de teste em ABO:** a recomendação é dar por conjunto cerca de **2x o custo alvo por
resultado, por dia**. Com R$ 40 de alvo, são R$ 80 por dia por conjunto. Com R$ 250 por dia, isso
dá **3 conjuntos**, não 5.

---

## 4. Quantos criativos por conjunto

- Meta recomenda **até 6 criativos** por conjunto quando se usa otimização automática de criativo.
- Para teste padrão, a prática recomendada é **3 a 5 criativos** por conjunto.
- O limite técnico é 20, e as fontes são unânimes em dizer que usar os 20 só piora.
- Nenhum criativo deve ser julgado antes de acumular gasto suficiente. Na sua escala, **R$ 100 de
  gasto acumulado** é o piso para ter opinião sobre uma peça.

---

## 5. As métricas, separadas por onde se lê

### Na Meta, no nível do anúncio

| Métrica | O que diz | Régua |
|---|---|---|
| **Conversas iniciadas** | Quantas pessoas abriram conversa no WhatsApp | É o seu volume bruto |
| **Custo por conversa iniciada** | Verba ÷ conversas | R$ 20 a R$ 50 validado, até R$ 70 observação, acima mata |
| **CTR (taxa de cliques)** | Se o anúncio convence a agir | Abaixo de 1% em vídeo, o gancho está fraco |
| **Hook rate** (reproduções de 3s ÷ impressões) | Se os 3 primeiros segundos seguram | Abaixo de 25% o começo do vídeo é o problema |
| **Hold rate** (ThruPlay ou 15s ÷ impressões) | Se a mensagem sustenta até o fim | Queda brusca mostra onde a pessoa desiste |
| **CPM** | O preço da mídia | CPM alto com CTR bom significa público caro, não criativo ruim |
| **Frequência** | Quantas vezes a mesma pessoa viu | Acima de 2 na semana, começa a fadiga |
| **Gasto acumulado por anúncio** | Se já dá para julgar | Abaixo de R$ 100, a peça é "não testada", não "perdedora" |

### No CRM, que é onde a decisão real acontece

| Métrica | Como se calcula | Régua |
|---|---|---|
| **Taxa de resposta** | Quantas conversas viraram diálogo de verdade | Conversa iniciada não é lead |
| **Taxa de qualificação** | Leads qualificados ÷ conversas | Referência de mercado: acima de 25% |
| **Custo por lead qualificado** | Verba ÷ leads qualificados | É o número que substitui o CPL depois da primeira semana |
| **Agendamento, comparecimento, proposta, fechamento** | O funil do dashboard | Com menos de 5 numa etapa, o dashboard se cala de propósito |
| **CAC** | Verba total ÷ clientes fechados | O único número que diz se a campanha se paga |

**A regra de ouro:** compare criativos pelo custo por conversa na Meta, mas escolha o campeão pelo
que **agenda** no CRM. Criativo de R$ 25 que só traz curioso vale menos que um de R$ 45 que marca
reunião.

---

## 6. Recomendação, com a sua verba de hoje

**Você não tem dinheiro para um teste limpo de criativo agora.** Essa é a frase honesta. A escolha
real é entre duas coisas:

| Se o objetivo é | Estrutura | O que você ganha | O que você perde |
|---|---|---|---|
| **Conversa mais barata** (recomendado nas rodadas 1 e 2) | 1 campanha, 1 conjunto, 3 a 4 criativos | Entrega concentrada, custo por conversa menor, mais leads pelo mesmo dinheiro | O Meta escolhe: 1 ou 2 criativos ficam sem teste |
| **Leitura limpa de criativo** | 1 campanha, 3 conjuntos ABO, R$ 83 por dia cada | Cada criativo recebe a mesma verba e dá para comparar | Custo por conversa provavelmente maior, porque cada conjunto fica mais instável |

**O que eu recomendo:** comece concentrado. Nesta fase o dinheiro precisa comprar **cliente**, não
conhecimento. O criativo vencedor aparece sozinho, porque é aquele que o Meta passa a alimentar.
Quando entrar caixa, migre para ABO com 3 conjuntos para comparar com rigor.

**E se você quiser mesmo ABO agora:** 3 conjuntos de R$ 83 nos dias de R$ 250, e de segunda a
quarta deixa **um conjunto só** rodando com R$ 100. Cinco conjuntos de R$ 50 não, porque fica
abaixo do piso de 2x o custo alvo e nenhum deles junta dado suficiente para você confiar no
resultado.

---

## 7. Quanto custa uma conversa de WhatsApp, e por que "barato" depende do país

Esta seção existe porque a impressão de que tráfego para WhatsApp é barato vem do mercado
brasileiro, e o público da Leon Group está nos Estados Unidos.

| Referência | Número |
|---|---|
| Conversa iniciada em mercado desenvolvido (inclui EUA) | **US$ 3 a US$ 10**, ou seja, cerca de **R$ 16 a R$ 55** |
| CPM médio nos Estados Unidos | **US$ 23** |
| CPM médio no Brasil | **US$ 4,20** |
| Diferença | O CPM americano é cerca de **5,5 vezes** o brasileiro |
| CPM de casa e serviços (tier 2) em mercado desenvolvido | 6 a 12 euros |
| Piloto realista de clique para WhatsApp | 300 a 500 euros para 30 a 50 conversas qualificadas |

**O que fica de pé da sua intuição:** clique para WhatsApp realmente custa menos que formulário e
que landing page. As referências de 2025 e 2026 falam em 30% a 60% menos que formulário
tradicional e cerca de 38% menos que landing page. E, como a Leon Group usa o WhatsApp Business
comum e não a API, **não existe cobrança por conversa**: você paga o anúncio e mais nada. Conversa
iniciada por anúncio ainda tem janela livre de 72 horas.

**O que não fica de pé:** o preço baixo que circula em português é preço de Brasil. Você anuncia
para gente que mora nos Estados Unidos, então paga leilão americano. A régua de R$ 20 a R$ 50 por
conversa, que veio da aula, coincide com a faixa internacional convertida (R$ 16 a R$ 55), então
serve. Só não espere R$ 5 por conversa.

⚠️ **Detalhe de imposto, se a conta de anúncios for faturada no Brasil:** desde 2026 a Meta repassa
PIS, COFINS e ISS ao anunciante, o que soma entre 12,15% e 12,5% ao custo. Na prática, R$ 250 de
orçamento compram perto de R$ 222 de entrega. Conferir na fatura antes de fechar a conta da semana.

⚠️ **Sobre o estudo que promete 92% de redução de custo por lead:** foi encomendado pela própria
Meta à Forrester. Serve como direção, não como número a repetir para cliente.

## Fontes

- ABO contra CBO, e a regra de 2x o CPA alvo por conjunto: https://segwise.ai/blog/abo-cbo-meta-ads-budget-strategies
- Mínimos oficiais e mínimos práticos por conjunto: https://www.stackmatix.com/blog/meta-ads-minimum-daily-budget-2026
- Fase de aprendizado e os 50 eventos por semana: https://adlibrary.com/posts/meta-ads-learning-phase-50-events-guide
- O que reinicia o aprendizado: https://withblip.com/blog/meta-ads-learning-phase-bulk-editing/
- Estrutura de teste de criativo em 2026: https://withblip.com/blog/how-to-test-new-meta-ads-creative-in-2026/
- Quantos criativos testar por vez: https://admanage.ai/blog/how-many-ad-creatives-to-test
- Métricas de campanha de clique para WhatsApp: https://getkanal.com/blog/click-to-whatsapp-ads-benchmarks-2026
- Indicadores de WhatsApp para negócio: https://chatbotx.io/blog/whatsapp-business-kpis-for-saas-b2b-the-2026-revenue-guide/
- Custo por conversa em mercado desenvolvido e tamanho de piloto: https://www.enrichlabs.ai/blog/whatsapp-advertising-complete-guide-2026
- Custo de anúncio de clique para WhatsApp em 2026: https://sendseven.com/en/blog/click-to-whatsapp-ads-cost-roi-2026
- CPM por país, Estados Unidos contra Brasil: https://www.adamigo.ai/blog/meta-ads-cpm-cpc-benchmarks-by-country-2026
- Referência adicional de CPM por país: https://adligator.com/blog/meta-ads-cpm-by-country-benchmarks
- Imposto repassado ao anunciante no Brasil em 2026: https://corporisbrasil.com.br/tecnologia-mais-cara-em-2026-anuncios-ia-e-whatsapp-aumentam-custos-para-empresas-e-consumidores/
- Clique para WhatsApp comparado a formulário e landing page: https://zenvia.com/blog/como-usar-anuncios-click-to-whatsapp-no-seu-negocio/
