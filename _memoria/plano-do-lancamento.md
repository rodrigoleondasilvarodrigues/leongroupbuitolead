# O plano, de hoje até o primeiro cliente pago

Escrito em 2026-09-10. Este documento explica **o porquê** de cada
prioridade, não só a ordem. A fila operacional crua está em
`_memoria/historico/PENDENCIAS-E-PROXIMOS-PASSOS.md`; aqui está o raciocínio.

> **A frase que resume tudo:** o sistema acabou e não é mais o gargalo. O que
> separa a Leon Group do primeiro cliente pago é oferta decidida, número
> americano, criativo produzido e campanha no ar. Nessa ordem, e por motivos
> que não são de gosto.

---

# 1. Onde a operação está hoje

## Pronto e no ar

| O que | Onde |
|---|---|
| Site público bilíngue, com formulário ligado ao CRM | `leon-group-site.pages.dev` |
| Três páginas de proposta, fora do Google | `/planos`, `/planosv2`, `/planosv3` |
| CRM comercial: 4 pipelines, funil, diagnóstico | `leon-group.leongroup.workers.dev` |
| Caixa em dólar e real, com entradas e saídas | aba Caixa |
| Ativações com playbook e checklist | card do lead |
| Entrega completa: formulário, upload, site, reviews, checklist de 42 itens | aba Operacional |
| Contrato com aceite eletrônico | `/c/<token>` |
| Oferta escrita como se faz na call | `propostas/oferta-na-call.md` |
| Passo a passo da campanha na Meta, com PDF | `_memoria/playbook-campanha-meta.md` |
| 20 roteiros de anúncio escritos | ⚠ ver a nota abaixo |

Suíte de testes em **525 asserções**, rodando antes de todo deploy.

> ⚠ **Os 20 roteiros de anúncio que estão no repositório vão ser
> substituídos.** O usuário disse em 2026-09-10 que não gostou de como
> ficaram e que volta com as próprias versões. Os arquivos em
> `marketing/anuncios/` ficam como histórico até ele trazer os novos. Uma
> sessão futura **não deve** tratá-los como o que vai ao ar.

## Não pronto, e é isso que trava

1. **Oferta e nicho não decididos** (preço confirmado, flooring ou HVAC)
2. **Número americano** não contratado
3. **Página do Facebook** não criada
4. **Criativos não produzidos** (roteiros sim, vídeos não)
5. **Nenhum cliente real**

---

# 2. Por que essa ordem, e não outra

## A oferta vem primeiro porque ela é a mais barata e desbloqueia mais

Um dia de decisão sua desbloqueia quatro coisas: a promessa do criativo, o
preço da call, a proposta e o contrato. Nenhuma delas existe sem ela.

E tem um motivo financeiro direto: **o Arcads cobra por geração, não tem teste
grátis, e não devolve dinheiro por resultado ruim.** Se você gerar vídeo e
depois trocar o nicho ou o preço, você regera tudo a US$ 11 cada. Decidir
antes de assinar é o que protege os US$ 110.

**A decisão de nicho é sua, e os dois lados são defensáveis:**

| | Flooring | HVAC |
|---|---|---|
| Volume | 90% dos clientes do mercado | menor |
| Ticket do cliente dele | menor | maior |
| Na aula | citado como o de maior volume | citado como "o melhor nicho" |
| Efeito no criativo | linguagem de piso, antes e depois visual | linguagem de urgência, quebrou o ar |

Eu não escolho isso por você porque a informação que decide não está no
repositório: é quantos contractors de cada nicho você consegue alcançar em
Massachusetts com R$ 100 por dia, e isso só o teste diz.

## O número americano vem antes do criativo porque o relógio é de terceiro

O trabalho é de meia hora. A espera pode ser de dias: pedido, verificação, às
vezes portabilidade. Disparar hoje e trabalhar na oferta enquanto espera é o
que economiza a fila.

E ele trava três coisas ao mesmo tempo: o WhatsApp Business não sai sem ele, o
site ainda mostra um número brasileiro provisório, e **ligar para dono de casa
americano de número brasileiro derruba a taxa de atendimento**, que é a
primeira conversão do funil. Hoje o funil vazaria no primeiro degrau por causa
do prefixo do telefone.

⚠ **Pela via legítima.** A aula ensina comprar número em bot de SMS do
Telegram para simular presença nos EUA. Decisão de 2026-09-05, e ela se
sustenta por um motivo prático além do ético: número de bot descartável é
perdido a qualquer momento, e perder o número é perder toda conversa de lead
que está nele.

## O criativo vem depois da oferta, mas antes de tudo o resto

É o maior volume de trabalho e está no caminho crítico da campanha. Os
roteiros novos são seus. O que eu preciso te dizer sobre eles:

> **Ator de IA não é o problema. Depoimento falso é.** A extração das aulas
> marcou 42 táticas enganosas, e uma delas é usar ator de IA para simular
> cliente satisfeito. Antes de gerar, confira cada roteiro: se o ator fala
> como **narrador** ou como você apresentando o serviço, está limpo. Se ele
> fala como **cliente dando depoimento**, o criativo fabrica prova social.
> Essa é a linha, e ela é fina.

## A campanha vem por último porque não adianta antes

Anúncio apontando para uma oferta indecidida, um número que não atende e um
criativo que não existe queima verba sem produzir informação.

---

# 3. A semana até sexta

| Quando | O que | Por que agora |
|---|---|---|
| **Hoje** | Disparar o pedido do número americano | espera de terceiro |
| **Hoje** | Criar a página do Facebook | meia hora, sem espera |
| **Hoje ou amanhã** | Decidir preço e nicho | desbloqueia o criativo |
| **Amanhã** | Gravar os seus 4 criativos | custa zero e valida a mensagem |
| **Quarta** | Conferir os 16 roteiros de Arcads contra a linha do depoimento | protege os US$ 110 |
| **Quarta** | Assinar o Arcads, olhar a ferramenta, gerar **1** vídeo | o reembolso de 24h ainda está aberto se não servir |
| **Quinta** | Gerar 3 ou 4 dos roteiros mais fortes | não os 16 |
| **Quinta à noite** | Rodar a checagem de pré-voo do playbook de campanha | se o cartão não passar, você descobre com um dia de folga |
| **Sexta de manhã** | Subir 2 campanhas, R$ 100 cada, programadas para sábado 9h | a aula manda programar para o dia seguinte |
| **Sexta à tarde** | Clicar no seu próprio anúncio e conferir o funil inteiro | o teste que ninguém faz e que salva a semana |

## A conta do seu orçamento, que muda o plano

Você disse R$ 250 por dia no fim de semana e R$ 100 por dia na semana,
testando 4 a 6 criativos. **Isso não fecha**, e o motivo é a unidade do
método:

> R$ 100 por dia **por criativo**, em estrutura de uma campanha, um conjunto,
> um criativo.

Então R$ 100 por dia testa **um** criativo, não quatro. Dividido entre quatro,
cada um fica com R$ 25 por dia, e o corte do dia 1 da aula ("gastou R$ 100 e
não trouxe lead") levaria quatro dias para acontecer em cada um. O critério de
decisão para de funcionar.

**O que eu recomendo, e fecha exatamente nos seus R$ 1.000 por semana:**

| Dias | O que roda | Por dia | Total |
|---|---|---|---|
| Sexta, sábado, domingo | 2 criativos, R$ 100 cada | R$ 200 | R$ 600 |
| Segunda a quinta | só o vencedor | R$ 100 | R$ 400 |

Três dias seguidos são a janela de validação inteira da aula, e fim de semana
é quando o contractor está com o celular na mão em vez de na obra. A sua
intuição de pesar o fim de semana está certa.

**A consequência:** 2 criativos por fim de semana, então 4 a 6 criativos são 2
a 3 fins de semana. Para testar 4 de uma vez, o fim de semana tem que ir para
R$ 400 por dia.

Detalhe completo, com as citações da aula, no PDF
`saidas/Leon-Group-Campanha-Meta-Passo-a-Passo.pdf`.

---

# 4. Depois de sexta

## O fim de semana: os três cortes

| Quando | Critério | Ação |
|---|---|---|
| Sábado à noite | gastou R$ 100 e zero lead | matar |
| Domingo à noite | CPL acima de R$ 70 | matar |
| Domingo à noite | CPL entre R$ 20 e R$ 50 | validado |

E o aviso que a própria aula dá: **CPL barato com lead ruim não vale nada.** O
número que decide é o custo por lead qualificado e o custo por cliente
adquirido, e esses você lê no dashboard do Comercial, não no gerenciador da
Meta. Com menos de 5 leads numa etapa o dashboard se cala de propósito, então
nos primeiros dias o CPL é o que você tem.

## Quando o primeiro lead entrar

O caminho está pronto e testado, e é este:

1. Lead cai no WhatsApp e aparece em **Comercial → Leads novos → Super Hot**
2. Você liga em **menos de um minuto**. O playbook da ativação Ligação abre com
   o roteiro e o nome dele dentro
3. Não atendeu? A ativação Mensagem tem o bilhete pronto. Depois Áudio. O
   checklist marca o que você já tentou
4. Qualifica no BANT e agenda, **nunca mais de dois dias à frente**
5. Fecha na call com `propostas/oferta-na-call.md` aberto no celular
6. Marca **Fechou** e o lead vira cliente no Operacional automaticamente
7. Gera o link do contrato, ele aceita, e o portão do formulário destrava
8. Lança a entrada no Caixa, com a data e a cotação do dia
9. Ele responde o formulário e **aí** começam os 5 dias úteis
10. Clica em Gerar: site, 20 reviews e briefs do Instagram saem prontos

## Quando o primeiro cliente fechar

Duas coisas que não podem ser esquecidas:

- **Entregar o diagnóstico gratuito** que o site promete. É trabalho real e
  prometido na tela.
- **Rodar a segunda rodada de auditoria de segurança.** A primeira parou no
  achado 7 de 32, e desde então subiu superfície nova e já no ar: upload
  público, rota de mídia pública e três rotas que chamam API externa. Hoje o
  dano possível é pequeno porque não há dado real. No dia em que houver
  telefone de lead e foto de obra de cliente pagante, deixa de ser.

---

# 5. O que eu deixei de propósito para depois

Não é esquecimento, é ordem.

| O que | Por que espera |
|---|---|
| Domínio próprio | o site funciona sem ele; só melhora credibilidade |
| Limpeza do R2 | 10 GB não enchem com zero cliente |
| Vídeo acima de 95 MB | o limite do Worker; contorna com trecho mais curto |
| Grupo de WhatsApp pela Z-API | parado até a Z-API ser contratada |
| Slides da apresentação comercial | a call roda com o roteiro, sem slide |
| As 3 aulas não liberadas | quando saírem, reextrair a parte de escala |

---

# 6. As decisões que continuam suas

1. **O preço.** Recomendação: US$ 2.500 em pagamento único, como preço de
   fundador para os três primeiros clientes, contra US$ 5.000 depois. O
   raciocínio está em `propostas/oferta-na-call.md`. ⚠ O link do WHOP para em
   US$ 2.500 por cobrança, então o preço e o meio de cobrança se decidem
   juntos.
2. **O nicho.** Flooring ou HVAC. Ver a tabela da seção 2.
3. **O orçamento por criativo.** Aceitar 2 criativos por fim de semana, ou
   subir a verba do fim de semana para R$ 400 por dia.
4. **Gênero na segmentação.** A aula manda segmentar somente homens. Funciona,
   e exclui mulher dona de empresa e mulher que decide a obra em casa. Se o
   CPL ficar alto, é a primeira coisa que eu abriria.

---

# 7. O que eu não vou fazer, e por quê

A extração das 4 aulas e do hotseat marcou **42 táticas enganosas**. Elas
ficam registradas em `_memoria/historico/extracoes/aulas-campanha-meta.json`
como histórico estudado, e nenhuma entra em processo da Leon Group. As que
apareceriam justo agora, na subida da campanha:

- número americano de bot de Telegram
- "5/5" com estrela no título do anúncio
- conta de anúncios de familiar para driblar limite
- criativo com caso de cliente fabricado
- empresas fictícias como prova social no Instagram
- depoimento pago a R$ 20
- print de Google de outra empresa apresentado como resultado próprio
- prazo artificial de 15 minutos no fechamento

Isso não é preferência. É o que separa uma agência que dura de uma que perde a
conta de anúncios, tem o perfil do cliente suspenso, ou é denunciada pelo
primeiro lead que confere. E, desde 2024, avaliação fabricada tem multa da FTC
que alcança quem fornece, não só quem publica.
