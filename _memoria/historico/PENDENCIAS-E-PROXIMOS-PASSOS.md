# Fila operacional, do mais urgente ao menos

Atualizada em 2026-09-09. Ordenada por **importância x urgência**, não por tema.
Antes de executar um item, confira se o usuário o concluiu fora da conversa.

> **A leitura de uma frase:** o sistema está pronto e não é mais o gargalo. O que
> separa a Leon Group do primeiro cliente pago é oferta escrita, número
> americano, criativo produzido e campanha no ar. Nessa ordem.

## Comece hoje pelos itens 2 e 3, e trabalhe no 1

Os itens **2** (número) e **3** (Meta) dependem de terceiro: pedido, verificação,
aprovação de meio de pagamento. São 30 minutos de trabalho seu e possivelmente
dias de espera. Disparar os dois hoje e usar o dia no item 1 economiza uma
semana de fila.

---

# 🔴 Bloqueia receita

## 1. A oferta por escrito

**Por que primeiro:** nada funciona sem ela. O criativo precisa prometer algo
específico, a call não fecha sem preço, a proposta não existe. É o item mais
barato da lista (um dia de decisão) e o que desbloqueia mais coisa.

- [ ] **Decidir o recorte de nicho.** Flooring (90% dos clientes, maior volume)
      ou HVAC (apontado na aula como o de cliente com mais dinheiro). A decisão
      está em aberto desde o começo e agora trava o criativo e a segmentação da
      campanha. **É sua, não minha:** os dois caminhos são defensáveis.
- [ ] Escrever problema, promessa responsável e mecanismo da oferta.
- [ ] Definir entregáveis e o que fica **fora** do escopo.
- [ ] Definir prazo, o que o cliente precisa fazer, e como aprova.
- [ ] Definir preço, entrada, recorrência e política de cancelamento.
- [ ] Definir as métricas de processo e de resultado, sem prometer faturamento
      nem posição no Google.

**Desbloqueia:** criativo, proposta, contrato, e a própria call de fechamento.

## 2. O número americano

**Por que agora:** tem espera de terceiro, e trava três coisas ao mesmo tempo.
O trabalho é curto; o relógio é que é longo.

- [ ] Contratar pela via legítima: Google Voice, OpenPhone ou linha real.
      **Nunca** pelo método da aula (número por bot do Telegram para simular
      presença nos EUA). Decisão já tomada em 2026-09-05.
- [ ] Configurar o WhatsApp Business nele: identidade, descrição, horário,
      respostas rápidas.
- [ ] Trocar o número provisório do site (`5561998629189`, brasileiro, DDD 61).
      Fica numa linha só em `sistemas/site-agencia/conteudo.js`.
- [ ] Pôr o mesmo número no CRM (botão WhatsApp do admin).

**Por que importa tanto:** o método é "lead entra, você liga em menos de um
minuto". Ligar para dono de casa americano de número brasileiro derruba a taxa
de atendimento, que é a primeira conversão do funil. Hoje o funil vazaria no
primeiro degrau por causa do prefixo do telefone.

## 3. A conta de anúncios da Meta

**Por que agora:** também tem espera de terceiro, e a que costuma dar problema.
Conta nova é sinalizada, verificação de negócio leva dias, e recusa de meio de
pagamento é comum. Deixar para depois do criativo pronto é o jeito clássico de
perder uma semana com tudo pronto na mão.

- [ ] Criar a página da Leon Group no Facebook.
- [ ] Conectar Instagram e Facebook na Meta Business Suite.
- [ ] Criar conta de anúncios, cadastrar meio de pagamento e **confirmar que foi
      aceito**.
- [ ] Instalar pixel e dataset, e testar que o evento de conversão chega.
- [ ] Organizar acessos e permissões.

## 4. Produzir os 20 criativos

**Por que aqui:** é o maior volume de trabalho da lista e está no caminho crítico
da campanha. Vem depois do item 1 porque, se a oferta ou o nicho mudarem, o
roteiro muda com eles.

- [ ] Reler os 20 roteiros contra a oferta decidida no item 1 e ajustar o que
      não bater.
- [ ] Gerar os **16 vídeos com ator de IA** (um prompt por roteiro, copiável de
      uma vez, em `marketing/anuncios/roteiros-20.json`).
- [ ] Gravar os **4 roteiros do Rodrigo**.
- [ ] Editar, legendar e exportar nos formatos da campanha.

Roteiro escrito não é criativo pronto. Hoje existem 20 roteiros e **zero vídeos**.
Documento montado em `saidas/Leon-Group-20-Roteiros-de-Anuncio.pdf`.

## 5. Proposta, contrato e cobrança

**Por que antes da campanha:** se um lead fechar no segundo dia de anúncio e não
houver contrato nem forma de cobrar, o dinheiro não entra e a credibilidade vai
junto. Não precisa estar pronto antes do criativo, mas precisa estar antes de o
primeiro anúncio subir.

- [ ] Apresentação comercial (a que roda na call).
- [ ] Proposta em modelo, com o escopo do item 1.
- [ ] Contrato. ⚠ O `playbook-operacao.md` tem um aviso jurídico sobre
      classificação de colaborador PJ que precisa de validação profissional
      antes de ser aplicado.
- [ ] Forma de cobrança que funcione para cliente nos EUA (Wise, Zelle, gateway).
- [ ] Roteiro de onboarding: o que acontece nas primeiras 24h depois do pagamento.

## 6. Subir a campanha

- [ ] Definir orçamento diário e teto.
- [ ] Montar a campanha com a segmentação do nicho escolhido.
- [ ] Conferir que o lead do anúncio chega no CRM e que a mensagem de
      boas-vindas dispara.
- [ ] Acompanhar pelo dashboard do CRM. Com menos de 5 leads numa etapa ele se
      cala de propósito: taxa em cima de 3 leads é ruído.

---

# 🟠 Antes de operar com gente de verdade

## 7. Segunda rodada de auditoria de segurança

**Por que aqui e não depois:** a primeira auditoria parou no achado **7 de 32**, e
os achados 8 a 32 nunca foram verificados. Desde então subiu superfície nova e
**já está no ar**: upload público, rota de mídia pública e três rotas que chamam
API externa.

Hoje o dano possível é pequeno porque não há dado real no sistema. No dia em que
houver telefone de lead e foto de obra de cliente pagante, deixa de ser pequeno.

- [ ] Rodar os achados 8 a 32 da auditoria original.
- [ ] Auditar o que é novo: `/api/subir/<token>`, `/m/<chave>`, e as chamadas a
      OpenAI e AwesomeAPI.

## 8. O primeiro cliente real

- [ ] Fechar o primeiro contrato pago.
- [ ] **Entregar o diagnóstico gratuito por escrito** que o site promete (Google
      Business Profile, site e avaliações). É trabalho real e prometido, não
      isca. Prometido na tela, tem que ser entregue.
- [ ] Rodar a entrega dos 5 dias úteis pelo sistema, do formulário à reunião.
- [ ] Documentar o resultado e pedir o depoimento.

⚠ Regra de integridade, não negociável: prova social real só depois deste
trabalho pago e documentado. Nunca antes, nunca inventada.

---

# 🟡 Melhora a operação, não bloqueia nada

## 9. Domínio próprio

- [ ] Registrar o domínio.
- [ ] Apontar o site e o admin.
- [ ] Acrescentar a origem em `ORIGENS_SITE` no
      `sistemas/cloudflare/src/index.js`, senão o CORS barra o formulário.

## 10. Dívida técnica do sistema

- [ ] **Limpeza do R2.** Apagar cliente apaga os arquivos dele; **arquivar não**.
      Sem alerta de uso dos 10 GB. Vídeo come rápido: 40 MB cada, 5 por cliente.
- [ ] **Vídeo acima de 95 MB** não sobe (o corpo de requisição do Worker para em
      100 MB). Resolver exige upload direto ao R2 com URL assinada.
- [ ] **Grupo de WhatsApp pela Z-API.** O campo guarda o link de convite, e a
      Z-API envia para o ID do grupo, que é outro identificador. Parado por
      decisão do usuário até a Z-API ser contratada.
- [ ] `wrangler` está na 3.114.17 e avisa que a 4 saiu.

## 11. Completar canais e conteúdo

- [ ] Finalizar identidade e informações do canal do YouTube.
- [ ] Manter a régua de conteúdo no Instagram.

## 12. Quando as 3 aulas restantes saírem

- [ ] Comparar o que elas trazem com o que já está construído.
- [ ] A aula de Claude Coding é onde o instrutor mostraria o ecossistema de CRM
      dele por dentro.
- [ ] O arquivo do sistema de registro do Closer é o único que ele prometeu
      enviar de fato.

---

# ✅ Já feito, para não refazer

**Marca:** naming, slogan, identidade visual com o leão no O, brand kit de 22
arquivos, e-mail, Instagram, YouTube, duas séries de 12 posts, 42 Stories e
destaques em 6 abas.

**Site da agência:** no ar em `leon-group-site.pages.dev`, bilíngue, com
formulário que cria o lead no CRM e captura preenchimento abandonado.

**Sistema, no ar em `leon-group.leongroup.workers.dev`:** CRM comercial com 4
pipelines e automações, dashboard com funil e diagnóstico, caixa em dólar e real
com entradas e saídas, operação de entrega completa (formulário com upload do
celular, geração de site, 20 reviews, briefs de 12 posts e 4 destaques,
checklist de 40 itens, cadência de 5 dias, portão de conclusão), prompt de logo
e 402 asserções de teste.

**Sistema de acompanhamento de funil:** é o dashboard do CRM. O item antigo
"montar sistema de acompanhamento de funil" está concluído.

**Criativos:** 20 roteiros escritos (16 com ator de IA, 4 para gravar). Os
vídeos não. Ver item 4.
