# Operação de Entrega — Leon Group

Cadastra o cliente fechado, coleta o formulário, gera os entregáveis e rastreia
os primeiros 14 dias (a janela que, segundo a aula, define a satisfação dos 3 meses).

## Rodar

```bash
cd sistemas/02-entrega
python3 entrega.py
```

Abre em **http://localhost:8771**.

## O escopo fechado — 4 entregáveis

Segundo a aula, a entrega são **só quatro coisas**, e o instrutor diz que são as mesmas
há mais de um ano:

1. **GMB** — Google Meu Negócio otimizado
2. **Site** — gerado a partir do template, hospedado no Cloudflare Pages (grátis)
3. **Instagram** — 12 posts + 4 destaques
4. **Logo** — criada quando o cliente não tem

Mais as **~20 reviews estratégicas**. Fora disso não entra nada: a pergunta "posso
adicionar chatbot ou CRM como entregável?" foi respondida com um não — *"menos é mais"*.

## O fluxo

```
cliente paga → cadastro (ainda em call) → formulário do cliente
   → gerar → site + 20 reviews + briefs do Instagram → pasta de entrega
   → publicar no Cloudflare → régua dos 14 dias
```

Esse é o **processo manual** que a própria aula recomenda para os 2 primeiros clientes
— automatizar só a partir do terceiro.

## As reviews

Geradas com a anatomia exata ditada na aula:

- primeira pessoa, como cliente final, **em inglês**
- repete o **nome do dono** várias vezes
- nomeia o **tipo de serviço**
- repete a **cidade** várias vezes (SEO local)
- elogia **atendimento** e **prazo batido**
- fecha com superlativo local: *"best [serviço] in [cidade]"*

**Quem posta é o cliente**, não a agência. O sistema gera o arquivo, você repassa,
e ele manda para amigos e familiares. Ritmo alvo: **3 por semana** até completar 20.
Se houver fotos cadastradas, cada review vem com a foto sugerida para anexar.

Com `OPENAI_API_KEY` no `.env`, as reviews saem geradas por IA (mais variadas).
Sem a chave, saem por template combinatório — funcionais, com menos variedade.

## O site

Gera um `index.html` completo e responsivo: hero com a foto do cliente, serviços,
galeria, seção de diferenciais, CTA de free estimate e botão de WhatsApp flutuante.
Title e description já otimizados para busca local (`serviço + cidade + estado`).

**Para publicar:** dash.cloudflare.com → Workers & Pages → Create → Pages → upload
da pasta `entregaveis`. O domínio sai como `<nome-da-empresa>.pages.dev`, grátis,
até 500 sites na conta.

## A pasta de entrega

```
entregas/<empresa>/
  LEIA-ME.txt              instruções de publicação
  entregaveis/
    index.html             o site
    instagram-briefs.txt   os 12 posts + 4 destaques
  fotos-e-videos/          o que o cliente enviou
  reviews/
    reviews-google.txt     as 20 reviews para repassar
  reunioes/                gravações
```

Mesma estrutura que a aula descreve para a pasta no Drive da agência.

## Régua dos 14 dias

O sistema cria 10 marcos com prazo, do formulário respondido (dia 1) à reunião de
acompanhamento (dia 14). A aula é explícita: *"ele tem que estar em êxtase nos primeiros
14 dias"* — e reconhece que é quase impossível entregar lead nesse prazo, então a
satisfação vem da **qualidade percebida da entrega**, não do resultado ainda.
