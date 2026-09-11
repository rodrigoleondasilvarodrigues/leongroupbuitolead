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

**Atualizado em 2026-09-10.** A Leon Group passou a atender também a região de
Los Angeles (seção 0), a copy de cada anúncio foi escrita e está pronta para
colar (seção 5), e a mensagem inicial do WhatsApp ganhou seção própria
(seção 6).

> ⚠ **A trava do número não caiu.** O número americano foi contratado, mas o
> **WhatsApp ainda não o aceitou**: o SMS de verificação não chega. Isso
> bloqueia o passo 7 da subida. O estado e o que tentar estão na seção 2, e o
> ponto de decisão está na seção 8.

---

# 0. Onde a Leon Group atende, desde 2026-09-10

Duas regiões, e a segmentação da campanha **não muda por causa disso**.

| Região | Cidades que entram na copy |
|---|---|
| **Grande Los Angeles** | Los Angeles, Van Nuys, North Hollywood, Burbank, Glendale, Pasadena, Long Beach, Culver City, Santa Monica, Inglewood, Torrance, Pomona, Anaheim |
| **Grande Boston** | Boston, Everett, Malden, Medford, Somerville, Framingham, Waltham, Revere, Quincy, Lynn |

**Por que a segmentação não muda.** O filtro que separa o seu público não é
geográfico, é o **idioma português** dentro dos Estados Unidos. Restringir a
duas áreas metropolitanas encolhe o público, encarece a entrega e atrasa a
saída da fase de aprendizado, o que faz os cortes de R$ 70 e R$ 50 ficarem
difíceis de atingir em três dias. Você segmenta o país inteiro, e **lê no CRM
de onde os leads vieram**, decidindo com dado em vez de palpite.

**O que muda de verdade é o criativo.** Um vídeo que fala de neve e ice dam em
fevereiro não significa nada para quem trabalha em Pomona, e um que fala de
Everett não significa nada para quem trabalha em Van Nuys. Por isso existem
duas levas de roteiro:

| Leva | Arquivo | Quantos |
|---|---|---|
| Massachusetts | `marketing/anuncios/roteiros-20.json` | 20 |
| Los Angeles | `marketing/anuncios/roteiros-la.json` | 6 |

Os seis de LA são adaptação dos roteiros 1, 2, 4, 12, 15 e 20. **Não é troca de
nome de cidade:** o roteiro 4 girava em torno de fevereiro, neve e ice dam, que
não existem no sul da Califórnia, e virou a estação de chuva de janeiro. E
nenhum valor em dólar de Massachusetts foi reaproveitado, porque ticket de
Boston não é ticket de Los Angeles.

> ⚠ **A área 213 é de Los Angeles.** Um lead de Boston vê um número da
> Califórnia no seu anúncio. Isso não impede nada e é muito melhor que o número
> brasileiro anterior, mas se um dia der para ter um segundo número em 617,
> a leva de Massachusetts converte melhor com ele.

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
nos EUA. **Fora.** Decisão registrada em 2026-09-05.

**Contratado pela via legítima em 2026-09-10**, mas **não concluído**. O número
é **+1 213 396 0014**, do Vnumber, e já está no site e no CRM.

⚠ **O WhatsApp ainda não aceitou esse número.** O código de verificação não
chega por SMS e o suporte do Vnumber foi acionado no mesmo dia. Enquanto isso
não resolver, o link `wa.me` para ele **não abre conversa**, e os lembretes que
o CRM manda para `meu_whatsapp` também não chegam.

Duas coisas a tentar antes de repetir a verificação:

- **Verificação por chamada de voz.** Depois que o SMS falha e o cronômetro
  zera, aparece a opção "Me ligue" e o código é ditado. Funciona em vários
  números virtuais onde o SMS não chega, desde que o número receba chamadas
  de entrada.
- **Descobrir se a faixa é VoIP.** O WhatsApp recusa faixas VoIP conhecidas, e
  esse é o sintoma exato (número aceito, código nunca chega). Se for o caso,
  repetir não resolve: a saída é eSIM pré-pago americano ou linha de operadora.

⚠ **Repetir muitas vezes piora.** O WhatsApp aumenta a espera a cada tentativa
falha no mesmo número e pode bloqueá-lo temporariamente, justamente quando o
SMS voltar a funcionar.

A regra de origem continua valendo: se precisar de outro número, ele sai por
serviço legítimo, nunca por bot descartável de Telegram.

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

**Já resolvido, não precisa refazer:**

- [x] **Número americano contratado.** +1 213 396 0014, área 213, pela via
      legítima. Já está no site e no CRM. (A **verificação no WhatsApp** ainda
      não passou: virou o primeiro item da lista do que falta, logo abaixo.)
- [x] **Conta de anúncios, Business Manager, Instagram e meio de pagamento.**
      Confirmados em 2026-09-09.
- [x] **O CRM.** Comercial, caixa e entrega no ar e testados.
- [x] **O site com o número certo**, publicado.

**Ainda falta, e é o que trava sexta:**

- [ ] **⚠ O WhatsApp aceitar o número.** Bloqueia tudo: o passo 7 exige
      vincular um WhatsApp Business ao conjunto, e sem número verificado a
      campanha não passa dali. Também deixa o botão do site sem conversa e os
      lembretes do CRM sem destino. Ver a seção 2 para o que tentar.
- [ ] **Página do Facebook criada** e ligada na BM e no Instagram. Sem ela o
      conjunto não deixa escolher a página no passo 6.
- [ ] **Confirmar que o meio de pagamento passou**, não só que está cadastrado.
      Recusa de cartão é o motivo mais comum de campanha não subir na hora.
- [ ] **Pixel e dataset instalados**, e o evento de conversão do site testado.
- [ ] **Os criativos exportados** no formato final, com legenda queimada.
      Nenhum vídeo foi produzido ainda: os roteiros estão escritos, o vídeo não.
- [ ] **Cada roteiro conferido** contra a advertência de prova social acima.
- [ ] **A oferta e o nicho decididos.** O criativo promete algo; se a promessa
      mudar depois, o criativo é refeito.

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

# 5. A copy de cada anúncio, pronta para colar

O passo 21 pede texto principal e título. Aqui estão os dois, por criativo,
já escritos. **Título curto**, porque o Meta corta perto de 40 caracteres no
feed do celular. **Texto principal** com a primeira linha carregando o peso,
porque é a única que aparece antes do "ver mais".

Regra que vale para todos: **sem "5/5", sem emoji de estrela, sem "nota" e sem
contagem de clientes**. Isso é avaliação inventada, está na quarentena da
seção 2, e a Meta reprova.

## Leva Los Angeles

| # | Título (até 40) | Texto principal, primeira linha |
|---|---|---|
| **101** | Você recebe a diária. Ele, a obra. | Quatro dias de piso em Van Nuys valem uma coisa pra você e outra bem diferente pra quem assinou o orçamento. |
| **102** | Um nome só no seu histórico | Abre o histórico de chamadas do seu celular e rola até o fim. Quantos nomes diferentes aparecem ali? |
| **103** | Janeiro não para o trabalho | Chuva forte, obra parada e telefone mudo. Só que telhado vazando acontece exatamente nesse mês. |
| **104** | Mesmo piso. Só um aparece. | Dois instaladores na mesma cidade, mesmo material, mesmo preço. Sexta de manhã, só um existe na tela. |
| **105** | Diagnóstico por escrito. Custo zero. | Você manda o nome da empresa e a cidade. Em dois dias volta um documento sobre a SUA empresa. |
| **106** | Um convite, não uma venda | Sou o Rodrigo, da Leon Group. Me manda o nome da sua empresa e a cidade, e eu te devolvo um diagnóstico. |

## Leva Massachusetts

| # | Título (até 40) | Texto principal, primeira linha |
|---|---|---|
| **01** | Você recebe a diária. Ele, a obra. | Você fecha a semana com a diária. Quem assinou o orçamento fecha com a obra inteira. |
| **02** | Um nome só no seu histórico | Se for um nome só, você não tem clientes. Você tem uma fonte. E fonte fecha. |
| **04** | Fevereiro não para o trabalho | Neve na driveway e telefone mudo. Mas ice dam e cano estourado acontecem justamente aí. |
| **12** | Mesmo piso. Só um aparece. | Dois instaladores de Everett, mesma semana, mesmo acabamento. Um aparece na busca, o outro não. |
| **15** | Diagnóstico por escrito. Custo zero. | Isso aqui é de graça e não tem pegadinha. Você manda duas coisas e recebe um documento. |
| **20** | Um convite, não uma venda | Manda o nome da empresa e a cidade. O diagnóstico volta por escrito, sem custo. |

O texto principal completo de cada anúncio é o campo `legenda_meta` do roteiro,
que já vem escrito por inteiro nos dois arquivos JSON. Copie de lá, não
reescreva na hora: a legenda passou pelo validador de integridade.

## O que o título nunca pode dizer

| Não escreva | Por quê |
|---|---|
| "5/5 ⭐" ou qualquer nota | Avaliação inventada. Meta reprova, FTC multa desde 2024 |
| "Já ajudamos X empresas" | A Leon Group não tem cliente fechado. É contagem falsa |
| "Garanto primeiro lugar no Google" | Promessa de posição. Ninguém controla isso |
| "Você vai faturar X" | Promessa de faturamento |
| "Aqui em Boston" / "aqui nos EUA" | Presença física falsa. A operação é remota |
| Qualquer travessão | Regra da casa. Vírgula, dois pontos ou parênteses |

O validador `scripts/validar_roteiros_anuncio.py` barra as seis, mas o campo de
título você digita direto na Meta, onde não há validador. **Confira na mão.**

---

# 6. A mensagem inicial do WhatsApp

Existem **duas** mensagens diferentes, e as pessoas confundem. Uma vem do
anúncio, a outra vem do site.

## 1. A do anúncio (passo 24)

É a que o lead do Meta Ads envia com um toque, sem digitar nada. Configurada em
Conversas → criar modelo de conversa.

| | Texto |
|---|---|
| **Padrão do Meta, não usar** | "Olá, posso ter mais informações sobre isso?" |
| **O que usar** | "Olá, gostaria de saber mais sobre o programa de marketing de vocês." |

**Por que trocar.** A padrão não diz sobre o quê, e você atende sem saber de
qual anúncio o lead veio. A nova já entrega o contexto na primeira linha.

**Variação recomendada, se você rodar as duas levas ao mesmo tempo:** ponha a
região na mensagem, e o CRM te diz de onde veio sem você perguntar.

| Leva | Mensagem de abertura |
|---|---|
| Los Angeles | "Olá! Vi o anúncio de vocês. Tenho empresa de construção na região de Los Angeles e quero saber mais." |
| Massachusetts | "Olá! Vi o anúncio de vocês. Tenho empresa de construção em Massachusetts e quero saber mais." |

Isso custa um modelo de conversa a mais por campanha e resolve a pergunta mais
cara do primeiro minuto: **de onde esse lead veio**.

## 2. A do site

Sai pronta quando a pessoa preenche o formulário em
`leon-group-site.pages.dev`. Não é a mesma coisa, e é bem mais rica:

```
Olá! Vim pelo site da Leon Group.

Sou [nome], da [empresa].
• Serviço: [serviço]
• Onde atendo: [cidade]
• Sou: [subcontractor ou contractor]
• Cliente hoje chega por: [origem]

Quero saber mais sobre o que a Leon Group pode fazer pela minha empresa.
```

Essa versão já chega qualificada, com os sete campos. Ela vive numa função só
em `sistemas/site-agencia/conteudo.js` e **não precisa mexer**.

## 3. O que VOCÊ responde, no primeiro minuto

A aula é dura nesse ponto: **menos de um minuto** até a primeira resposta, e
a melhor janela de ligação é **17h às 22h** (52% de atendimento), com a segunda
das **7h às 11h**. Os dois horários são do fuso do lead, e o card do CRM mostra
o relógio local dele justamente por isso.

A primeira resposta não vende. Ela confirma e marca:

> "Opa, [nome]! Aqui é o Rodrigo, da Leon Group. Vi que você tem [empresa] em
> [cidade]. Vou olhar seu Google, seu site e suas avaliações e te mandar o
> diagnóstico por escrito. Antes disso, me diz uma coisa: hoje seu cliente
> chega mais por indicação ou por busca no Google?"

Confirma o que ele mandou, entrega a promessa do anúncio, e abre a
qualificação com uma pergunta só. Sem apresentação de vendas, sem PDF, sem
"posso te ligar?".

---

# 7. A tabela de decisão

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

# 8. O plano da sexta, hora a hora

Assumindo que os criativos estão prontos e os itens da seção 3 estão feitos.

## O ponto de decisão, quinta à noite

**Decisão do Rodrigo em 2026-09-10:** não adiar nem remarcar nada agora. Na
quinta à noite ele olha o estado real e decide. Esta é a folha dessa decisão.

| Pergunta | Se sim | Se não |
|---|---|---|
| **O WhatsApp aceitou o número?** | Segue para a próxima pergunta | Ou sobe apontando para outro WhatsApp que funcione, ou adia. Sem número verificado o passo 7 não passa |
| **Existem 2 vídeos exportados?** | Pode subir sexta | Adia. Não há campanha sem criativo, e 1 vídeo só não dá teste |
| **A página do Facebook existe?** | Pode subir sexta | Adia. O passo 6 não deixa escolher a página |

As três precisam de sim. **Qualquer não adia a subida**, e adiar não custa
nada: a verba não gasta enquanto não sobe, e criativo apressado queima
orçamento em vez de trazer lead.

> ⚠ **Estado em 2026-09-10:** as três estão em **não**. O WhatsApp não aceitou
> o número, nenhum vídeo foi produzido (os 26 roteiros estão escritos, e
> roteiro escrito não é criativo pronto) e a página do Facebook não existe.
> O caminho mais barato para a segunda é gravar primeiro os roteiros do próprio
> Rodrigo, o **106 (LA)** e o **20 (MA)**, que custam zero, e só depois pagar o
> Arcads.

### Se o número não resolver a tempo

Duas saídas, e as duas são dele:

1. **Subir apontando para um WhatsApp que funcione.** Converte de verdade e o
   lead é atendido. O custo é o lead ver um DDI que não é o da região dele, o
   que derruba a taxa de atendimento na ligação de volta.
2. **Adiar até o número entrar.** Mantém a operação coerente, e como não há
   verba comprometida, adiar é barato.

Não existe terceira: campanha apontando para número sem WhatsApp entrega
cliques que morrem na tela, pagando por cada um.

| Quando | O que |
|---|---|
| **Quinta, à noite** | Rodar a seção 3 inteira. Se o cartão não estiver aprovado, você descobre com um dia de folga. |
| **Sexta, de manhã** | Subir as 2 campanhas, R$ 100 cada, programadas para **sábado às 9h de Brasília**. Se rodar uma leva por região, suba um criativo de LA e um de MA, para o CRM te dizer qual região responde melhor. |
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

# 9. O fazer e o não fazer, numa página

A folha para deixar aberta na hora de subir. Tudo aqui já está explicado
em algum ponto acima; isto é o resumo que cabe numa tela.

## Faça

| O quê | Detalhe |
|---|---|
| Objetivo **Engajamento**, opção manual | Nunca Leads. Leads traz quem viu 3 segundos |
| Estrutura **1-1-1** | Uma campanha, um conjunto, um criativo. Sempre |
| **R$ 100 por dia por criativo** | Menos que isso quebra o critério de corte |
| **CBO ligado**, orçamento na campanha | Primeira opção da tela |
| Segmentar **Estados Unidos como país** | Excluir Brasil e Alasca |
| Idioma **Português (Brasil)** | É a peça mais importante da segmentação |
| Idade **25 a 55** | Da aula |
| Destino **WhatsApp Business**, manual | Instagram e Messenger desativados |
| Trocar a **mensagem de abertura** | Seção 6. A padrão do Meta não diz sobre o quê |
| Programar para **o dia seguinte, 9h** | Confira o fuso: de novembro a março a conta muda |
| Posicionamentos **manuais** | Desativar WhatsApp como exibição e Audience Network |
| Deixar **24 horas contínuas** | Sem programação por hora |
| **Clicar no próprio anúncio** antes de dormir | O teste da seção 8. Cinco itens |
| Ler o funil **no CRM**, não só o CPL da Meta | CPL barato que nunca agenda é prejuízo |
| Conferir o **corte todo dia**, no fim do dia | Dia 1, dia 2, dia 3. Sem exceção |

## Não faça

| O quê | Por quê |
|---|---|
| Objetivo **Leads** | Traz lead que não sabe o que clicou |
| Dividir R$ 100 entre vários criativos | Nenhum sai do aprendizado e o corte deixa de funcionar |
| **"5/5" ou estrela** no título | Avaliação inventada. Meta reprova, FTC multa |
| **Depoimento** de ator de IA como cliente | Prova social fabricada. Ator de IA como narrador é limpo |
| Dizer **"aqui em Boston"** ou "aqui nos EUA" | Presença física falsa. A operação é remota |
| Prometer **faturamento ou posição** | Ninguém controla o mercado nem o Google |
| Citar **contagem de clientes** | Não há cliente fechado ainda |
| Conta de anúncios **de familiar** | Caminho mais rápido de perder o ativo |
| **Pressão no fechamento** | Prazo de 15 minutos, não deixar sair da call. Fora |
| **Travessão** em qualquer texto | Regra da casa |
| Esquecer de **desmarcar o vídeo antigo** ao duplicar | Sobe a campanha 02 com o criativo 01, pagando dobrado |
| Subir **campanha e criativo no mesmo dia** | A aula pede um dia de folga entre montar e rodar |
| Reaproveitar **valor de mercado de outra região** | Ticket de Boston não é ticket de Los Angeles |

## As três que mais custam dinheiro

1. **Dividir o orçamento.** R$ 100 dividido por 4 criativos não testa 4 coisas,
   não testa nenhuma. O critério de corte da aula só funciona com R$ 100
   inteiros por criativo.
2. **A duplicata com o vídeo errado.** Clicar no vídeo novo não desmarca o
   antigo. Você paga por dois testes e recebe um.
3. **Não clicar no próprio anúncio.** Cinco minutos na sexta à noite versus um
   fim de semana inteiro de verba entregando para um botão quebrado.

---

# 10. Os números da aula, com fonte

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

# 11. As três aulas que faltam

O mentor prometeu mais 3 aulas ainda não liberadas, incluindo a de Claude
Coding. Quando saírem, o que vale reextrair para este documento:

- O método de **escala** (o buraco da seção 5)
- Qualquer coisa sobre **retargeting** ou público morno, que a aula 03 quase
  não toca
- O **arquivo do sistema de registro do Closer**, o único que ele manteve a
  promessa de enviar
