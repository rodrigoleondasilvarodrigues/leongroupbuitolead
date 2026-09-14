# O diagnóstico, do lead ao PDF na mão dele

O diagnóstico é a oferta de entrada da Leon Group e a pauta da call de 40 minutos.
Ele não é isca de mensagem: é o motivo pelo qual o lead aceita sentar com você.

---

## A parte dele: duas informações, e só

O cliente **não responde questionário**. Se ele tivesse que preencher formulário
longo, metade desistiria, e a outra metade responderia errado. Tudo que o
diagnóstico precisa é público: você mesmo vai olhar.

Dele você precisa de **duas coisas**:

```
1. O nome exato da empresa
2. A cidade onde ele trabalha
```

E é literalmente o que o roteiro da ligação pede, na etapa 3 e na etapa 4.

### Por onde ele entra

| Caminho | O que acontece |
|---|---|
| Anúncio no Meta | Clica, cai no WhatsApp, vira lead no CRM |
| Site, formulário | Preenche nome, empresa, WhatsApp, serviço, cidade, e abre o WhatsApp com a mensagem pronta |
| Página de planos | Botão "Pede o diagnóstico gratuito" leva pro WhatsApp |
| Indicação | Chama direto |

Em qualquer um deles o destino é o mesmo: **o WhatsApp**, e de lá o CRM.

Quem preenche o formulário do site já chega com empresa, serviço e cidade
preenchidos no card. Quem vem do anúncio chega só com o telefone, e aí as duas
informações saem na ligação.

---

## A parte sua, em quatro passos

### Passo 1 · Ligue em menos de um minuto

O roteiro está no card do lead, no CRM. As etapas 3 e 4 capturam empresa e
cidade, que é o insumo do diagnóstico. Na etapa 11 você marca a call e diz o que
vai fazer:

> Eu vou abrir o seu perfil do Google, o seu site e as suas avaliações, montar
> um documento com o que tá faltando e a ordem pra resolver, e te mostro na tela.

Não prometa prazo curto demais. Você precisa de uma noite para fazer direito.

### Passo 2 · Copie o modelo

```bash
cd "/Users/macbook/Leon Group - Buit To Lead "
cp dados/diagnostico-modelo.json dados/diagnostico-ribeiro.json
```

Use o sobrenome ou o nome da empresa no arquivo. Esse pedaço vira o nome do PDF.

Preencha o cabeçalho:

```json
"slug":    "ribeiro",
"empresa": "Ribeiro Hardwood Flooring",
"oficio":  "Flooring",
"cidade":  "Everett, MA",
"data":    "15/09/2026",
```

Deixe `"exemplo": false`. Só o modelo de demonstração leva `true`, que é o que
imprime o selo de exemplo na capa.

### Passo 3 · Audite os 27 itens

Abra o JSON e vá item por item. **Cada item tem um campo `onde_olhar` que diz
exatamente o que abrir e o que julgar.** Esse campo é só seu: o gerador não o
imprime, então ele nunca aparece no PDF do cliente.

Para cada item você mexe em dois campos:

```json
"estado": "ok" | "parcial" | "falta" | "na",
"obs":    "o que você viu, em uma frase"
```

| Estado | Quando usar |
|---|---|
| `ok` | Está lá e está certo |
| `parcial` | Existe mas incompleto ou errado |
| `falta` | Não existe |
| `na` | Não dá para verificar de fora (sai da contagem) |

A `obs` é o que faz o documento parecer feito à mão, porque é. Não escreva
"faltando": escreva **"Aparece como Horário não informado"** ou **"O perfil tem
um número e o site tem outro"**. O específico é o que convence.

#### As três telas que você vai abrir

```
1. Google, buscando "nome da empresa + cidade"     → 12 itens do perfil
2. O site dele, no celular e no desktop            → 10 itens do site
3. Google, buscando "serviço + cidade"             → os 3 do mapa, para comparar
```

A busca número 3 é a que produz o número que mais dói: quantas avaliações têm os
três primeiros da cidade dele, contra as dele.

#### O tempo que leva

Da primeira vez, umas duas horas. Depois do terceiro, quarenta minutos. Não corte
caminho no começo: o documento é a sua oferta inteira.

### Passo 4 · Escreva a abertura e a ordem

Dois campos que não se preenchem sozinhos, e são os que vendem.

**`abertura`**, duas ou três frases sobre o estado geral. Direto, sem suavizar e
sem dramatizar. O exemplo do modelo mostra o tom:

> O serviço está lá e as fotos mostram acabamento bom. O problema é que quase
> nada disso chega ao dono da casa.

**`ordem`**, a lista numerada de correção. Ordene por **impacto sobre esforço**,
não por área. Cada passo tem três campos:

```json
{ "o_que":  "Esconder o endereço residencial e configurar a área de atendimento",
  "como":   "No perfil do Google, troque para service area business e marque as cidades.",
  "porque": "É violação das diretrizes, pode suspender o perfil, e expõe a sua casa no mapa." }
```

O `porque` é o campo mais importante do documento inteiro. É ele que transforma
lista de tarefas em argumento.

Regra de ordenação que funciona:

```
1º   o que pode SUSPENDER o perfil        (risco)
2º   o que é 1 clique e muda ranqueamento (categoria, área)
3º   o que está divergente entre fontes   (telefone, nome)
4º   o que está vazio e é rápido          (horário, descrição, serviços)
5º   o que leva tempo e precisa começar   (avaliações)
6º   o que está quebrado e vaza lead      (formulário, velocidade)
```

### Passo 5 · Gere

```bash
python3 scripts/gerar_diagnostico.py dados/diagnostico-ribeiro.json
```

Sai em `saidas/Diagnostico-ribeiro.pdf`, A4, na identidade da marca, com o placar
por área na segunda página.

---

## Quando entregar

**Na call, na tela, não antes por mensagem.**

Você compartilha a tela, passa item por item, e ele vê o próprio negócio sendo
lido em voz alta. O PDF vai para a mão dele **depois** da reunião, junto da
proposta.

Mandar antes mata a call: quem já recebeu o valor não tem motivo para sentar
quarenta minutos com você.

---

## O que nunca entra no documento

- Número que você não conferiu. Se não deu para verificar, o estado é `na`.
- Acusação de avaliação comprada. Escreva que vale revisar, nunca que é fraude.
- Promessa de posição no Google ou de faturamento.
- Nome de concorrente. Diga "os três primeiros do mapa", não a empresa.
- Qualquer coisa que você não conseguiria mostrar na tela se ele perguntasse.
