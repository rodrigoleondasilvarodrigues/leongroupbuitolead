# Decisão de tráfego pago: estrutura, verba e rodadas

Fechado em 2026-09-16, com a verba real do Rodrigo, a citação da Aula 05 e a pesquisa de
plataforma em `_memoria/pesquisa-abo-cbo-verba-metricas.md`. O passo a passo de tela continua em
`_memoria/playbook-campanha-meta.md`.

**Este documento é para reproduzir. Cada número aqui tem origem declarada.**

---

## A decisão, em cinco linhas

1. **Uma campanha, um conjunto, quatro anúncios.**
2. **Orçamento na campanha (CBO, hoje chamado Advantage campaign budget).**
3. **R$ 250 por dia de quinta a domingo, R$ 100 por dia de segunda a quarta.**
4. **Nada de ABO por enquanto.** Com um conjunto só, a discussão ABO contra CBO deixa de existir:
   os dois viram a mesma coisa. ABO passa a valer quando houver verba para dar R$ 80 por dia a
   cada conjunto.
5. **Rodada de quatro dias, decisão no domingo, campeão segue na semana.**

---

## Por que essa e não outra

| Estrutura | Verba por conjunto/dia | Eventos por semana por conjunto | Dos 50 que o Meta pede |
|---|---|---|---|
| 5 conjuntos ABO | R$ 50 | 6,5 | 13% |
| 3 conjuntos ABO | R$ 83 | 10,8 | 22% |
| **1 conjunto (a decisão)** | **R$ 250** | **32,5** | **65%** |

O Meta precisa de cerca de 50 eventos por conjunto a cada 7 dias para sair da fase de aprendizado.
Dividir a verba em cinco deixa cada conjunto com 13% do necessário, e aprendizagem limitada não se
resolve esperando. Concentrar é o único caminho que chega perto do limiar com R$ 1.300 por semana.

**Por que quatro anúncios e não três nem cinco:** numa rodada de quatro dias (R$ 1.000), a
distribuição típica do CBO deixa o líder com uns R$ 550, o segundo com R$ 220 e os demais
dividindo o resto. Com quatro peças, as duas últimas ficam perto de R$ 115, acima do piso de
R$ 100 que permite julgar. Com cinco, caem para R$ 77 e viram dúvida em vez de resposta.

---

## O que esperar de custo, sem ilusão

Você anuncia para quem mora nos Estados Unidos, então paga leilão americano: CPM de referência
US$ 23, contra US$ 4,20 do Brasil. Conversa iniciada em mercado desenvolvido custa US$ 3 a US$ 10,
o que dá **R$ 16 a R$ 55**.

| Cenário | Custo por conversa | Conversas por semana com R$ 1.300 |
|---|---|---|
| Bom | R$ 20 | 65 |
| Provável | R$ 35 | 37 |
| Ruim, mas ainda dentro | R$ 55 | 24 |
| Fora da régua, mata o criativo | acima de R$ 70 | menos de 19 |

Se a conta de anúncios for faturada no Brasil, tire 12% de imposto: R$ 250 de orçamento compram
perto de R$ 222 de entrega.

**A boa notícia que a sua intuição acertou:** como você usa o WhatsApp Business comum e não a API,
**a conversa em si não custa nada**. Você paga o anúncio e pronto.

---

## A montagem, passo a passo

**Campanha**
- Objetivo: **Engajamento**, depois **campanha de engajamento manual**. Nunca Leads.
- Nome: `0 vendas · CBO · R1 · 17/09/2026 · Engajamento WhatsApp · Leon Group`
- **CBO ligado**, R$ 250 por dia.

**Conjunto** (um só)
- Nome: `R1 · EUA · PT · 25-55 · WhatsApp`
- Destino: **WhatsApp**, com Instagram Direct e Messenger desativados.
- Público: **Estados Unidos**, excluindo Brasil e Alasca. **Idioma português.** **Sem nenhum
  interesse** (confirmado na Aula 05, linha 181).
- Idade 25 a 55. Posicionamento manual, sem Audience Network.

**Anúncios** (quatro, um por criativo)
- Nomes: `R1-01 <ângulo> · Rodrigo`, `R1-02 <ângulo> · Rodrigo`, `R1-03 <ângulo> · Rodrigo`,
  `R1-04 <ângulo> · UGC`
- **Mesma copy, mesmo título, mesma mensagem de abertura em todos.** Só o vídeo muda. É isso que
  transforma a rodada em teste de criativo, e não em teste de copy.
- Aprimoramentos de criativo desativados, menos "retoques de vídeos".
- Mensagem de abertura: "Olá, gostaria de saber mais sobre o programa de marketing de vocês."

---

## O calendário

| Rodada | Teste, R$ 250/dia | Manutenção, R$ 100/dia | O que sobe |
|---|---|---|---|
| **1** | qui 17/09 a dom 20/09 | seg 21 a qua 23/09 | 4 peças: 3 suas, 1 UGC, ângulos diferentes |
| **2** | qui 24/09 a dom 27/09 | seg 28 a qua 30/09 | campeão + 3 novas |
| **3** | qui 01/10 a dom 04/10 | seg 05 a qua 07/10 | campeão + 3 novas |
| **4 em diante** | a partir de 08/10 | | sustentar o vencedor, trocando execução quando cansar |

Ao fim da rodada 3 você terá testado 10 peças e terá um ângulo vencedor. As outras 8 entram como
munição contra fadiga, mantendo o ângulo que ganhou.

**Custo até lá: R$ 3.900 em três semanas.** É o preço de descobrir o que funciona.

---

## O que fazer em cada dia

| Dia | O que olhar | O que fazer |
|---|---|---|
| **Quinta** | A campanha saiu da análise e entrega | **Nada.** Só confirmar que a mensagem chega no WhatsApp |
| **Sexta** | Conversas iniciadas | **Nada.** Ainda é aprendizado |
| **Sábado** | Gasto acumulado por anúncio | Pausar peça com **R$ 150 ou mais e zero conversa** |
| **Domingo** | Custo por conversa por peça | Escolher o campeão. Acima de R$ 70 sai |
| **Segunda** | | Baixar a campanha para R$ 100 por dia, deixar só o campeão |
| **Quarta à noite** | | Montar a rodada seguinte para subir na quinta |

**Não mexa em nada entre quinta e sexta.** Cada edição reinicia o aprendizado e joga fora o que o
Meta já tinha aprendido. A única exceção é a pausa de sábado.

**Só julgue peça que passou de R$ 100 de gasto.** Abaixo disso ela não é perdedora, é não testada,
e volta na rodada seguinte.

---

## As métricas

**Na Meta, nível de anúncio:** conversas iniciadas, custo por conversa (R$ 20 a 50 validado, até
R$ 70 observação, acima mata), CTR (abaixo de 1% o gancho está fraco), hook rate (3s ÷ impressões,
abaixo de 25% o problema está no começo), hold rate, CPM, frequência (acima de 2 na semana é
fadiga) e gasto acumulado por peça.

**No CRM, que é onde a decisão real acontece:** taxa de resposta, taxa de qualificação (referência
de mercado: acima de 25%), custo por lead qualificado, agendamento, comparecimento, fechamento e
CAC.

**A regra de ouro:** compare criativos pelo custo por conversa na Meta, escolha o campeão pelo que
agenda no CRM.

---

## Quando mudar de estrutura

| Gatilho | Mudança |
|---|---|
| Verba diária chegar a R$ 250 sustentáveis **todos os dias** | Passar para ABO com 3 conjuntos de R$ 83, para leitura limpa |
| Existir um criativo campeão validado por duas rodadas | Duplicar para uma campanha de escala própria e subir 20% a cada 2 ou 3 dias |
| Custo por conversa estourar R$ 70 em toda a rodada | Não trocar criativo. Revisar oferta e segmentação |
| Frequência passar de 2 com custo subindo | Trocar a execução mantendo o ângulo vencedor |

---

## Antes de subir, amanhã

- [ ] **Teste ponta a ponta do WhatsApp.** Mandar mensagem pelo botão e ver chegar no aparelho.
      Pendente desde 2026-09-10, e é o único item que, se falhar, transforma a verba em prejuízo.
- [ ] Os quatro vídeos em 9:16, com legenda, nomeados no padrão da rodada.
- [ ] Quatro ângulos diferentes entre si. Duas peças que dizem a mesma coisa são a mesma aposta.
- [ ] Cada lead que chegar entra no CRM **no mesmo dia**.
- [ ] Lançar a verba diária no Caixa, como saída de anúncio.

---

## Os dois cenários ruins, decididos antes de acontecerem

**Rodada 1 terminou com zero conversa e R$ 1.000 gastos.** Não troque criativo. Quatro ângulos
diferentes com zero conversa é oferta ou segmentação, não criativo.

**Vieram conversas, mas ninguém agendou.** O criativo funciona e o problema está na ligação. A
Aula 05 é direta nisso: lead curioso é sintoma de criativo fraco ou de call malconduzida.
