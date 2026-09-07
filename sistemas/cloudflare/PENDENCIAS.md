# Melhorias pedidas durante o teste integral (2026-09-07)

Anotadas no meio do teste para não interromper o fluxo. Fazer depois que
o teste terminar.

## 1. Ordem das seções no card do lead ✅ FEITO

**Pedido do usuário:** hoje a seção **Contrato** aparece antes de **Mover**.
Inverter: Mover primeiro, Contrato depois.

Motivo: Mover é usado a cada passo (call rolando, no show, recusou), e
Contrato só uma vez, no fechamento. A ação frequente tem que estar mais perto.

**Cuidado ao fazer:** o contrato precisa estar preenchido ANTES de mover para
"Fechou", porque os dados são copiados para o cliente na virada. Com Contrato
embaixo de Mover, fica fácil clicar em Fechou sem ter preenchido.

Proposta: fazer a inversão pedida E, ao clicar em "Fechou" com o contrato
vazio, o sistema perguntar antes de converter. Assim atende o pedido sem
abrir o buraco.

## 2. Fuso no campo de agendamento

O campo `datetime-local` não diz em que fuso a hora está sendo digitada. Ele
usa o relógio do navegador, em silêncio.

Hoje funciona porque só o fundador opera, e ele está em Brasília. O risco é
real: marcar 8h da manhã pensando "cedo mas ok" dá 7h para um lead em
Massachusetts, e ligação às 7h queima o lead.

**Correção:** mostrar embaixo do campo, ao vivo, a hora convertida para o
fuso do lead enquanto ele digita. Algo como:

    12:30 para você em Brasília  ·  11:30 para ele em Framingham, MA

Os dados já existem: `fusoDe(lead)` no admin.js devolve o fuso, e a função
`difBsb` já calcula a diferença.

## 3. valor_pago preenchido antes do pagamento ✅ RESOLVIDO, ver item 8

Na virada de lead para cliente, `criarClienteDoLead` grava
`valor_pago = corpo.valor_pago || lead.valor_contrato`. No teste, o cliente
nasceu com `valor_pago = 1500` enquanto `pagamento_confirmado = 0`.

`valor_pago` é dinheiro que ENTROU. Somar esse campo entre clientes para ver
faturamento conta dinheiro que ainda não chegou. É o mesmo erro que o código
já evita de propósito com o budget do BANT, mas escapou aqui.

**Correção:** não gravar `valor_pago` na virada. Preencher quando a chave de
pagamento confirmado for ligada, usando o valor do contrato como sugestão
editável.

## 4. Travessões nas páginas públicas ✅ FEITO

`src/paginas.js` é anterior à regra de não usar travessão. Pelo menos três:
- título da página de espera: "<empresa> — Aguardando liberação"
- intro do formulário: "melhor fica a entrega — e mais qualificado..."
- campo de fotos: "Links das fotos — precisamos de pelo menos 11"

Varrer o arquivo inteiro.

## 5. RECONSTRUIR o site do cliente ✅ FEITO em 2026-09-07

Pedido do usuário durante o teste: "será que conseguimos melhorar o site do
cliente? Deixar muito melhor mesmo, sem algo tão simples e montar como se
fosse um padrão pra todos os futuros clientes?"

### O que o site gerado tem hoje, medido no teste

    tamanho                     6,1 KB, 4 seções
    schema.org LocalBusiness    não tem
    telefone clicável (tel:)    não tem
    formulário de orçamento     não tem
    cidades atendidas           não tem (o cliente informou 10)
    as 20 reviews               não tem
    palavras em português       14

### Problema 1: idioma misturado

O formulário é respondido em português, porque o cliente é brasileiro. Isso
está certo. O erro é usar a prosa dele CRUA no site, que é lido por dono de
casa americano. O campo `diferencial` foi direto para o subtítulo do hero em
português, embaixo de um título em inglês.

**Correção:** as respostas em português são BRIEFING, não conteúdo. O texto
em inglês tem que ser gerado a partir delas (via OPENAI_API_KEY). Sem a
chave, o site não pode exibir a prosa crua: usa só os campos estruturados
(serviços, cidades, telefone), que já são termos em inglês.

### Problema 2: falta o que faz um site de contractor converter

Um site de prestador local precisa, no mínimo:

- **schema.org LocalBusiness em JSON-LD** com nome, telefone, área atendida,
  serviços e horário. É o que alimenta o resultado de busca local
- **Telefone como `tel:` fixo na tela**, sempre visível no celular. A maior
  parte do tráfego é celular e a ação é ligar
- **Uma página ou seção por serviço**, com o termo que a pessoa realmente
  busca ("hardwood floor refinishing near me")
- **As cidades atendidas listadas**, cada uma como texto indexável. As 10
  cidades que o cliente informou são a maior alavanca de SEO local que ele
  tem, e hoje nenhuma aparece
- **As reviews em destaque**, com nota e nome
- **Galeria de antes e depois**, que é o formato que converte em obra
- **Formulário de orçamento** que mande o lead para algum lugar (decidir
  para onde: WhatsApp do cliente, e-mail, ou o CRM)
- **Selo de licença e seguro** quando o cliente tiver

### Problema 3: é um template genérico

Cores padrão do banco (azul #1B4965 e amarelo #F6AE2D) em layout de
template. Precisa virar um padrão de verdade da Leon Group: identidade
própria, reconhecível como trabalho da agência, mas que respeite as cores
que o cliente escolheu no formulário.

### Como fazer

Vale tratar como projeto próprio, não como remendo em `gerarSite`. Provável
caminho: um template real com blocos condicionais (mostra a seção de reviews
só se houver reviews, a de licença só se houver licença), gerado a partir de
um objeto de dados limpo, com o texto em inglês vindo da IA a partir do
briefing em português.

Testar com o Ribeiro antes de usar em cliente real.

## 6. Marcos e entregáveis não conversam ✅ FEITO, o checklist trava a entrega

Achado pelo usuário durante o teste: "o que significa estar pendente se já
foi entregue?"

No fim do teste o painel dizia **entrega completa** (11 de 11 marcos) com
dois dos quatro entregáveis ainda em `pendente` (Google Meu Negócio e Logo)
e um em `em_producao` (Instagram).

São dois controles paralelos que não se falam:

- **Marcos**: os 11 passos da cadência. Marcados à mão, um a um
- **Entregáveis**: os 4 artefatos e seu estado. Manuais, com duas exceções
  automáticas: gerar move `site` e `instagram` para `em_producao`, e colar a
  URL do Vercel move `site` para `entregue`. `gmb` e `logo` nunca mudam
  sozinhos, e `instagram` nunca chega a `entregue`

O risco: fechar a entrega de um cliente sem o Google Meu Negócio existir, que
é justamente a peça de maior retorno da entrega. O sistema não avisa nada.

**Correção proposta, em duas partes:**

1. `entrega_completa` passa a exigir marcos concluídos **E** os quatro
   entregáveis em `entregue` ou `aprovado`. Hoje ela olha só os marcos
2. O painel mostra qual entregável está travando o fechamento

Opcional, avaliar: marcar o marco correspondente mover o entregável junto.
O mapa é direto:

    marco "Site no ar e link enviado"       -> entregável site
    marco "Logo entregue"                   -> entregável logo
    marcos "12 posts" e "4 destaques"       -> entregável instagram
    marco "GMB otimizado"                   -> entregável gmb

Risco dessa parte: automatizar demais faz o operador marcar sem fazer. A
parte 1 é mais segura, porque trava sem tirar a decisão da mão dele.


---

## 7. Mensagem no grupo do WhatsApp

Fora da lista por enquanto, a pedido do usuário: ele ainda não contratou a
Z-API e vai voltar nesse assunto depois. Fica registrado só o diagnóstico,
para não ter que redescobrir:

O campo `grupo_whatsapp` guarda o LINK DE CONVITE (`chat.whatsapp.com/XXXX`).
A Z-API não envia para link de convite, ela envia para o ID do grupo, que é
outro identificador. Resolver exige guardar o ID, e provavelmente buscar a
lista de grupos da instância conectada para o operador escolher numa lista
em vez de digitar.

## 8. valor_pago antes do pagamento ✅ RESOLVIDO em 2026-09-07

Eram dois números tratados como um só. Agora estão separados:

    valor_contrato = CONTRATADO, o que foi combinado no fechamento
    valor_pago     = RECEBIDO, dinheiro que entrou de verdade

- A virada de lead para cliente não grava mais `valor_pago`. Na virada nada
  entrou ainda
- `valor_pago` nasce quando a chave de pagamento confirmado é ligada,
  sugerido pelo valor do contrato e editável
- Desligar a chave zera o `valor_pago`: pagamento não confirmado não conta
  como receita
- A tela mostra os dois estados de forma diferente: `6900 a receber` em
  laranja, ou `6900 recebido` em negrito
