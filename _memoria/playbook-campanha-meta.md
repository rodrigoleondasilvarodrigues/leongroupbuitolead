# Subir a campanha na Meta, passo a passo

Extraído das 4 aulas da mentoria e do hotseat em 2026-09-10. A aula de anúncios
é a **03**, onde o mentor programa ao vivo compartilhando a tela.

Fonte bruta: `_memoria/historico/extracoes/aulas-campanha-meta.json`
(117 passos, 93 regras, 143 números, com citação literal em cada item).

> **Este documento não é a aula.** É a aula filtrada pela regra de integridade
> da casa. 42 itens extraídos foram marcados como tática enganosa e estão em
> quarentena na seção "O que não entra", com o motivo. Se você seguir só o que
> está aqui, você sobe a campanha pelo método e sem nada que suspenda conta,
> queime número ou minta para cliente.

---

# 1. Leia isto primeiro: a conta do seu orçamento

Você me disse: **R$ 250 por dia no fim de semana, R$ 100 por dia na semana,
testando 4 a 6 criativos.** Isso dá R$ 1.000 por semana.

O método da aula tem uma unidade fixa, e ela é o que faz a conta fechar ou não:

> "Eu gosto de colocar R$100 por criativo, certo? A nossa estrutura, ela sempre
> vai ser uma campanha, um conjunto e um criativo. Logo, R$100 por campanha."

**R$ 100 por dia POR CRIATIVO.** Não R$ 100 por dia no total.

E a janela de validação é de 3 dias, com corte diário:

> "Se no primeiro dia já deu mais de R$100, eu não trouxe lead, eu já mato. [...]
> No segundo lead abaixar pelo menos aí para no mínimo R$70, eu deixo. Senão eu
> mato. E no terceiro dia, o custo por lead tem que estar entre R$20 até R$50 no
> máximo. Passou de R$50, pode matar."

## A conta, sem enfeite

| Se você testar | Custo por dia | 3 dias de validação |
|---|---|---|
| 1 criativo | R$ 100 | R$ 300 |
| 2 criativos | R$ 200 | R$ 600 |
| 4 criativos | R$ 400 | R$ 1.200 |
| 6 criativos | R$ 600 | R$ 1.800 |

Com **R$ 100 por dia você testa UM criativo**, não quatro. Se você dividir
R$ 100 entre 4 criativos, cada um fica com R$ 25 por dia, e aí o corte do dia 1
("gastou R$ 100 e não trouxe lead") levaria **quatro dias** para acontecer em
cada um. O critério de decisão da aula deixa de funcionar.

Isso não é preciosismo. É o motivo pelo qual gente queima verba testando muito
criativo com pouco dinheiro: nenhum recebe entrega suficiente para o Meta sair
da fase de aprendizado, e no fim você não sabe qual funcionou.

## O que eu recomendo, dentro dos seus R$ 1.000

Respeita a sua intenção (mais peso no fim de semana), respeita o mínimo de
R$ 100 por criativo, e fecha exatamente nos R$ 1.000:

| Dias | O que roda | Por dia | Total |
|---|---|---|---|
| Sexta, sábado, domingo | **2 criativos**, R$ 100 cada | R$ 200 | R$ 600 |
| Segunda a quinta | **só o vencedor**, R$ 100 | R$ 100 | R$ 400 |
| | | | **R$ 1.000** |

Por que assim:

- **Os 3 dias seguidos são a janela de validação inteira.** Sexta, sábado e
  domingo dão os três cortes (dia 1, dia 2, dia 3) sem interrupção.
- **Fim de semana é quando o contractor está com o celular na mão.** Ele
  trabalha na obra de segunda a sexta. A sua intuição de pesar o fim de semana
  está certa, e essa distribuição a respeita.
- **Segunda você já sabe qual ganhou** e coloca a semana toda nele.

**A consequência que você precisa aceitar:** 2 criativos por fim de semana. Os
seus 4 a 6 criativos viram **2 a 3 fins de semana** de teste. Se quiser testar
4 de uma vez, o orçamento do fim de semana tem que ir para R$ 400 por dia
(R$ 1.200 nos três dias).

Não existe caminho de testar 6 criativos com R$ 100 por dia. Escolher entre
"menos criativo por vez" e "mais verba" é a decisão, e ela é sua.

---

# 2. O que não entra

A extração marcou **42 itens** como tática enganosa. Eles ficam registrados em
`_memoria/historico/extracoes/aulas-campanha-meta.json` como histórico
estudado, e **nenhum entra no passo a passo**. Os que aparecem exatamente no
meio da subida da campanha, e que você veria na aula:

### Número americano comprado em bot de SMS do Telegram

A aula ensina comprar número em bot (cita "Notes SNS") para simular presença
nos EUA. **Fora.** Decisão já registrada em 2026-09-05: o número sai por Google
Voice, OpenPhone ou linha real. Número de bot descartável é perdido a qualquer
momento, e perder o número é perder toda conversa de lead que está nele.

### Título do anúncio com "5/5" e emoji de estrela

É avaliação inventada. **Fora.** Além de quebrar a regra da casa, avaliação
fabricada é exatamente o que a FTC passou a multar desde 2024, e a Meta reprova
anúncio com nota falsa.

### Conta de anúncios de familiar para "ter mais liberdade"

A aula sugere usar conta de pai, primo ou familiar para driblar limite do
Facebook. **Fora.** Você já tem BM e conta de anúncios próprias e funcionando.
Rodar na conta de outra pessoa é o caminho mais rápido para perder o ativo.

### Criativo com caso de cliente fabricado

A aula valida um modelo de criativo com dono de construção fictício e número de
faturamento inventado. **Fora**, e essa é a que mais importa para sexta:

> ⚠ **Atenção nos seus criativos de Arcads.** Ator de IA **não é** problema.
> Ator de IA fingindo ser um cliente satisfeito **é**. Antes de subir, confira
> cada um dos seus roteiros: se o ator fala como CLIENTE dando depoimento, o
> criativo está fabricando prova social. Se ele fala como NARRADOR, ou como
> você, apresentando o serviço, está limpo. Essa é a diferença entre um criativo
> aceitável e um depoimento falso.

### Prova social inventada no Instagram e na apresentação

Empresas fictícias em destaque de "Customers", depoimento pago a R$ 20, print
de Google de outra empresa apresentado como resultado próprio, taxa de
insucesso fabricada nos slides. **Tudo fora.** Prova social real só depois do
primeiro trabalho pago e documentado.

### Pressão na hora do fechamento

Prazo artificial de 15 minutos, câmera desligada, "não deixar o lead sair da
call sem pagar". **Fora.** Ele tem direito de pensar, e a oferta escrita em
`propostas/oferta-na-call.md` já diz isso.

---

# 3. Antes de subir (faça na quinta)

- [ ] **Página do Facebook criada** e ligada na BM e no Instagram.
- [ ] **Conta de anúncios com meio de pagamento aceito.** Confirme que passou,
      não só que foi cadastrado. Recusa de cartão é o motivo mais comum de
      campanha não subir na hora.
- [ ] **Pixel e dataset instalados**, e o evento de conversão do site testado.
- [ ] **Número de WhatsApp Business ativo** e o número que vai no anúncio é o
      mesmo que você vai atender.
- [ ] **Os criativos exportados** no formato final, com legenda queimada.
- [ ] **Cada roteiro conferido** contra a advertência de prova social acima.
- [ ] **A oferta e o nicho decididos.** O criativo promete algo; se a promessa
      mudar depois, o criativo é refeito.
- [ ] **O CRM aberto na aba Comercial**, para o primeiro lead não esperar.

---

# 4. O passo a passo

Ordenado como um fluxo único. Os três níveis da Meta são campanha, conjunto e
anúncio, e a aula percorre nessa ordem.

## Nível 1: a campanha

- [ ] **1.** Gerenciador de Anúncios → **Criar campanha**.
- [ ] **2.** Objetivo: **Engajamento**. Continuar. Depois escolher a opção **de
      baixo, "campanha de engajamento manual"**. Continuar.

  > **Nunca use o objetivo Leads.** O motivo, na aula: *"O tipo de engajamento
  > que vai fazer o lead engajar no criativo. E ao final desse criativo ali,
  > mais ou menos 70, 80, 100% do criativo, ele entrar em contato, ou seja,
  > sendo lead extremamente qualificado."* Com objetivo Leads o Meta busca o
  > lead mais barato, que assistiu 3 segundos e não sabe o que clicou.

- [ ] **3.** Nome da campanha, nesta ordem de blocos:

  ```
  0 vendas · CBO · 12/09/2026 · Engajamento WhatsApp · Leon Group
  ```

  O contador de vendas na frente é proposital: na lista de campanhas você vê
  de relance qual já vendeu. Quando vender, troca o `0` por `1`.

- [ ] **4.** **CBO ligado** (orçamento no nível da campanha), primeira opção.
      **R$ 100 por dia.**

  Estrutura **1-1-1**: uma campanha, um conjunto, um criativo. Cada criativo é
  uma campanha inteira e separada.

## Nível 2: o conjunto

- [ ] **5.** Nome do conjunto: **`Ad 01`**. O mesmo número em todos os três
      níveis é o que amarra campanha, conjunto e anúncio.
- [ ] **6.** Selecionar a **página do Facebook**.
- [ ] **7.** Destino: trocar automático por **manual → WhatsApp Business**.
      Se o número não estiver vinculado, aparece "conectar número" na própria
      tela: clica, coloca o número, e insere o código que chega no WhatsApp
      Business.
- [ ] **8.** Canais de conversa: **só WhatsApp**. Instagram desativado,
      Messenger desativado. Otimização: **maximizar o número de conversas**.
- [ ] **9.** Programação: início **no dia seguinte**, **9h no horário de
      Brasília**.

  > ⚠ **A aula diz que 9h no Brasil é 8h nos EUA.** Isso é verdade de março a
  > novembro. **De novembro a março a diferença passa a ser de 2 horas** (os EUA
  > saem do horário de verão e o Brasil não tem mais desde 2019), então 9h de
  > Brasília cai às 7h em Boston. Em setembro a conta da aula está certa. Em
  > novembro, se você não mexer, a campanha começa a entregar uma hora mais
  > cedo do que você pensa.

- [ ] **10.** Público → Locais → Editar:
      - **Incluir:** Estados Unidos da América, confirmando que está marcado
        como **país** (não cidade, não região).
      - **Excluir:** Brasil.
      - **Excluir:** Alasca.
- [ ] **11.** Idade: **25 a 55**.
- [ ] **12.** Idioma: **Português (Brasil)**. É isso que filtra brasileiro
      morando nos EUA, e é a peça mais importante da segmentação.
- [ ] **13.** Gênero: **somente homens**.

  > Isso é escolha de segmentação da aula, não regra técnica. Vale saber que
  > exclui mulher dona de empresa e mulher que decide a obra em casa. Se o
  > custo por lead ficar alto, é a primeira coisa que eu testaria abrir.

- [ ] **14.** Público Advantage → trocar para **"sugestão de público"**.
- [ ] **15.** Posicionamentos: trocar para **manuais** e **desativar WhatsApp**
      (como posicionamento de exibição) e a **Audience Network**.
- [ ] **16.** Em Feeds, **desativar**: notificação do Facebook, página inicial
      do Explorar, e Facebook Marketplace. Ficam 4 posicionamentos marcados.
- [ ] **17.** Veiculação: **24 horas, contínua**, sem programação por hora.

  > A aula é explícita: *"24 horas."* E explica que a janela em que o lead
  > costuma chegar é das 7h ao meio-dia e das 17h em diante, mas deixa a
  > campanha aberta o dia inteiro em vez de restringir.

## Nível 3: o anúncio

- [ ] **18.** Nome do anúncio: **`Ad 01`**.
- [ ] **19.** Origem: **criar anúncio**. Não usar publicação existente.
- [ ] **20.** Formato: **anúncio em vídeo**. Subir o criativo.
- [ ] **21.** Texto principal e título.

  > **Sem "5/5" e sem emoji de estrela no título.** A aula usa; é avaliação
  > inventada e está na quarentena da seção 2.

- [ ] **22.** Aprimoramentos de criativo: **desativar todos**, exceto
      **"retoques de vídeos"**, que fica ligado.
- [ ] **23.** Botão: **enviar mensagem pelo WhatsApp**.
- [ ] **24.** Conversas → **criar modelo de conversa** e **trocar a mensagem de
      abertura**:

  | | Texto |
  |---|---|
  | **Antes** (padrão do Meta) | "Olá, posso ter mais informações sobre isso?" |
  | **Depois** (o que usar) | "Olá, gostaria de saber mais sobre o programa de marketing de vocês." |

  A troca importa porque a mensagem padrão não diz sobre o quê, e você atende
  sem saber de qual anúncio o lead veio. A frase nova já entrega o contexto na
  primeira linha da conversa.

## Os criativos 2 em diante

- [ ] **25.** Nos três pontinhos da campanha → **Duplicar**. Na duplicata,
      trocar `01` por `02` nos **três** níveis (campanha, conjunto, anúncio).
- [ ] **26.** Em "alterar seleções", trocar o vídeo.

  > **A armadilha da duplicata:** clicar no vídeo novo **não** desmarca o
  > antigo. Você tem que clicar no novo e depois clicar no antigo para
  > desmarcar. Se não fizer, a campanha 02 sobe com o criativo 01 e você
  > testa a mesma coisa duas vezes pagando dobrado.

- [ ] **27.** Publicar tudo de uma vez: clicar na primeira campanha, segurar
      **Shift**, clicar na última, e **Publicar**.

---

# 5. A tabela de decisão

Confira uma vez por dia, no fim do dia. O critério é do mentor, medido na
operação dele.

| Dia | Situação | O que fazer |
|---|---|---|
| **1** | Gastou os R$ 100 e trouxe **zero lead** | **Matar** |
| **1** | Trouxe pelo menos 1 lead | Deixar rodar |
| **2** | CPL **acima de R$ 70** | **Matar** |
| **2** | CPL até R$ 70 | Deixar rodar |
| **3** | CPL **entre R$ 20 e R$ 50** | **Validado.** Escalar |
| **3** | CPL **acima de R$ 50** | **Matar** |

CPL = verba gasta ÷ leads que chegaram no WhatsApp.

## O número que decide de verdade não é o CPL

> "Não adianta de nada tu ter um CPL barato, que é o custo por lead, sendo que
> esse lead é uma merda. Tu tem que ter um CPMQL, que significa custo por
> marketing qualified lead, ou seja, custo por lead qualificado bom. E além de
> ter um custo por lead qualificado bom, tem que ter um custo por aquisição de
> cliente."

Traduzido para o seu CRM: o CPL você lê no gerenciador da Meta, mas **o lead
qualificado e o cliente adquirido você lê no dashboard do Comercial**. O funil
lá mostra quantos entraram, quantos responderam, quantos agendaram, quantos
compareceram e quantos fecharam. Um criativo com CPL de R$ 25 que nunca agenda
é pior que um de R$ 45 que agenda.

Com menos de 5 leads numa etapa o dashboard se cala de propósito: taxa em cima
de 3 leads é ruído. Nos primeiros dias, o CPL da Meta é o que você tem.

## Escalar o que ganhou

A aula não detalha o método de escala além de manter o vencedor rodando. O que
está claro nela: cada criativo é uma campanha própria, então escalar é
**subir a verba daquela campanha** ou **duplicá-la**, não misturar criativos no
mesmo conjunto.

**Buraco real:** a aula 03 não explica quanto subir por vez nem de quanto em
quanto tempo. Isso você vai ter que resolver por fora. O padrão de mercado que
não quebra aprendizado é subir **20% a cada 2 ou 3 dias** enquanto o CPL se
mantiver na faixa. Está anotado como decisão sua, não como recomendação da
aula.

---

# 6. O plano da sexta, hora a hora

Assumindo que os criativos estão prontos e os itens da seção 3 estão feitos.

| Quando | O que |
|---|---|
| **Quinta, à noite** | Rodar a seção 3 inteira. Se o cartão não estiver aprovado, você descobre com um dia de folga. |
| **Sexta, de manhã** | Subir as 2 campanhas (criativo 01 e 02), R$ 100 cada, programadas para **sábado às 9h de Brasília**. |
| **Sexta, à tarde** | Deixar o CRM aberto e o WhatsApp na mão. Testar você mesmo: clicar no seu anúncio, ver se cai no WhatsApp com a mensagem certa e se o lead aparece no CRM. |
| **Sábado, fim do dia** | Corte do dia 1: gastou R$ 100 e zero lead, mata. |
| **Domingo, fim do dia** | Corte do dia 2: CPL acima de R$ 70, mata. |
| **Domingo à noite** | Corte do dia 3: CPL entre R$ 20 e R$ 50 valida. Escolhe o vencedor. |
| **Segunda, de manhã** | Desliga o perdedor. Deixa o vencedor em R$ 100 por dia até quinta. |
| **Próxima sexta** | Sobe os 2 criativos seguintes, mesma mecânica. |

> **A aula recomenda subir com um dia de folga** entre montar e começar a
> rodar, e programar sempre para o dia seguinte. Subir sexta para rodar sábado
> segue essa regra.

## O teste que ninguém faz e que salva a semana

Antes de dormir na sexta, **clique no seu próprio anúncio** pelo celular.
Confira, na ordem:

- [ ] O anúncio abre o WhatsApp (não o Messenger, não o Instagram)
- [ ] A mensagem de abertura vem preenchida com o texto novo
- [ ] O lead aparece no CRM, em Comercial → Leads novos → Super Hot
- [ ] O card mostra a hora local dele e o telefone certo
- [ ] A ativação de Ligação abre o playbook com o nome dele dentro

Se qualquer um desses falhar, você tem a noite para arrumar em vez de descobrir
com lead real na segunda.

---

# 7. Os números da aula, com fonte

| O que | Valor | Onde |
|---|---|---|
| Orçamento por criativo | R$ 100 por dia | aula 03 |
| Caixa pequeno | R$ 200 por dia = 2 criativos | aula 03 |
| Corte dia 1 | R$ 100 gastos, 0 lead | aula 03 |
| Corte dia 2 | CPL acima de R$ 70 | aula 03 |
| Validação dia 3 | CPL de R$ 20 a R$ 50 | aula 03 |
| Janela de validação | cerca de 3 dias | aula 03 |
| Melhor horário para ligar | 17h às 22h, 52% de atendimento | aula 03 |
| Segunda melhor janela | 7h às 11h | aula 03 |
| Tempo até a primeira ligação | menos de 1 minuto | aula 03 |
| Ativações por dia, lead quente | 10 | aula 03 |
| Idade | 25 a 55 | aula 03 |
| Início da veiculação | dia seguinte, 9h Brasília | aula 03 |

Todos os 143 números extraídos, com a citação literal de cada um, estão em
`_memoria/historico/extracoes/aulas-campanha-meta.json`.

---

# 8. As três aulas que faltam

O mentor prometeu mais 3 aulas ainda não liberadas, incluindo a de Claude
Coding. Quando saírem, o que vale reextrair para este documento:

- O método de **escala** (o buraco da seção 5)
- Qualquer coisa sobre **retargeting** ou público morno, que a aula 03 quase
  não toca
- O **arquivo do sistema de registro do Closer**, o único que ele manteve a
  promessa de enviar
