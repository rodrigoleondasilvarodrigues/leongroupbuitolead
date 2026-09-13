# 6 · Os 6 roteiros · leva Los Angeles

Numerados 101 a 106, adaptação dos roteiros 1, 2, 4, 12, 15 e 20.

**Adaptação não foi troca de nome de cidade.** O roteiro 4 girava em torno
de fevereiro, neve e ice dam, que não existem no sul da Califórnia, e virou
a estação de chuva de janeiro (roteiro 103). E nenhum valor em dólar de
Massachusetts foi reaproveitado: ticket de Boston não é ticket de Los
Angeles, então onde havia número, ou ele saiu, ou entrou como faixa a
conferir em fonte local antes de gravar.

Cidades: Van Nuys, North Hollywood, Burbank, Glendale, Pasadena, Long
Beach, Inglewood, Torrance e Pomona.

## Índice

| Nº | Grupo | Título | Duração | Tipo |
|---|---|---|---|---|
| 101 | A dor | A diária (LA) | 43s | ator de IA |
| 102 | A dor | O telefone que não toca (LA) | 44s | ator de IA |
| 103 | A dor | A estação da chuva (LA) | 45s | ator de IA |
| 104 | Contraste | Dois contractors, mesma cidade (LA) | 44s | ator de IA |
| 105 | Oferta | O diagnóstico gratuito (LA) | 45s | ator de IA |
| 106 | Rodrigo | Convite direto (LA) | 40s | Rodrigo grava |

---

## Roteiro 101 · A diária (LA)

`A dor` · 43 segundos · ator de IA · 500 caracteres de script

**O ângulo:** Faz a conta na cara do subcontractor: quatro dias de piso em Van Nuys valem a diária pra ele e a obra inteira pra quem tinha o nome no orçamento. Versão Los Angeles do roteiro 1, sem os valores de Massachusetts.

**Modelo:** Audio Driven. O script passa de 400 caracteres, então não cabe no Omnihuman 1.5, e o Audio Driven segura os 600 entregando os 43 segundos sem cortar o fecho.

### O prompt, copiar de uma vez

```
QUEM
Homem latino, 30 a 45 anos, aparência de quem trabalha na construção. Camiseta ou camisa de trabalho, sem uniforme de escritório. Fala reto, energia de conversa de estacionamento, não de apresentação. Sem sorriso de comercial.

ONDE
Dentro da picape, garagem ou parede lisa. Luz natural seca, de fim de tarde da Califórnia. Nada de escritório corporativo, nada de planta decorativa ao fundo.

O QUE FALA (palavra por palavra, sem improviso)
Subcontractor, deixa eu te falar do Wilson.
Wilson instala piso em Van Nuys há seis anos. Trabalho impecável.
Quarta passada, mil e duzentos pés de engineered hardwood.
Quatro dias de serviço, e ele recebeu a diária.
O dono da casa pagou o orçamento inteiro.
A diferença ficou com quem assinou aquele orçamento.
O cara não instala melhor que o Wilson. Ele só aparece no Google.
A Leon Group arruma isso: perfil, avaliação e site no teu nome.
Chama no WhatsApp. O diagnóstico é de graça e por escrito.

NUNCA
Nunca dizer que quem fala é cliente da Leon Group nem que a agência conseguiu resultado para alguém. Nunca dar depoimento em primeira pessoa de cliente satisfeito. Nunca afirmar presença física nos Estados Unidos. Nunca prometer faturamento nem posição no Google. Nunca citar nota de avaliação ou quantidade de estrelas da própria agência. Nunca usar travessão na legenda queimada.
```

### Escolha do ator

Na biblioteca do Arcads, filtrar: gênero masculino, faixa etária 30 a 45, cenário indoor casual (dentro da picape, garagem, parede lisa). Se o filtro de etnia estiver disponível, priorizar latino. Procurar um cara que parece que já pegou no pesado e fala reto. Descartar sorriso de comercial, gesto de palestrante e fundo de escritório. Ator DIFERENTE do usado no roteiro 1 de Massachusetts: os dois podem rodar na mesma semana e o mesmo rosto contando duas histórias satura o público.

### Áudio

Settings > Audio > Speech to Speech. Rodrigo grava a própria voz e a ferramenta troca pela do ator. Começa baixo e seco. A linha da diária sai devagar, com meio segundo de pausa depois. A linha do orçamento inteiro sai um tom acima, quase indignado por ele. O fecho volta ao tom calmo de indicação, sem empurrar.

### Storyboard

| Tempo | Imagem | Na tela |
|---|---|---|
| `0:00-0:05` | Talking head, plano do peito pra cima. Entra já falando, sem respiro antes. | HEADLINE (topo, caixa preta #171717, texto marfim #F7F3EA, sai em 0:05): Você recebe a diária. Ele recebe a obra. |
| `0:05-0:11` | Plano de apoio: mãos assentando engineered hardwood, luz seca de manhã. | LEGENDA (caixa preta #171717, texto marfim, a 78% da altura): Wilson instala piso em Van Nuys há seis anos. |
| `0:11-0:16` | Volta pro talking head, plano um pouco mais fechado. | LEGENDA: mil e duzentos pés de engineered hardwood |
| `0:16-0:21` | Plano de apoio: mãos contando notas dentro da picape no fim do dia. | LEGENDA: Quatro dias de serviço. Ele recebeu a diária. |
| `0:21-0:26` | Talking head, pausa curta antes da linha. | LEGENDA: O dono da casa pagou o orçamento inteiro. |
| `0:26-0:31` | Talking head, tom um degrau acima. | LEGENDA: A diferença ficou com quem assinou. |
| `0:31-0:36` | Plano de apoio: gravação de tela da busca no Google, map pack com três resultados. | LEGENDA: Ele não instala melhor. Ele aparece. |
| `0:36-0:40` | Talking head, tom de indicação, sem empurrar. | LEGENDA: perfil, avaliação e site no teu nome |
| `0:40-0:43` | Talking head, fecho. Corta seco, sem fade. | CARTELA FINAL: Leon Group · Built to Lead. · Diagnóstico gratuito por escrito |

### Planos de apoio, com prompt pronto

**`0:05-0:11`** · origem: gerado por IA (Veo 3.1 ou Kling 2.6)

```
Close-up, handheld, of a flooring installer's hands laying an engineered hardwood plank into place on a subfloor, tapping block and rubber mallet, knee pads on the floor, sawdust in the air, warm dry morning light through a bare window of an empty room, slight camera drift to the right, shallow depth of field, natural documentary look, 6 seconds.
```

**`0:16-0:21`** · origem: gerado por IA (Veo 3.1 ou Kling 2.6)

```
Close-up of work-worn hands counting a small stack of twenty dollar bills inside the cab of a pickup truck at the end of the day, dusty dashboard, coffee cup in the holder, low warm sun through the windshield, palm tree silhouette out of focus in the background, static shot with a small handheld shake, muted realistic colors, no faces, 5 seconds.
```

**`0:31-0:36`** · origem: gravação de tela do Rodrigo, feita no dia, com nomes de terceiros borrados

```
Screen recording of a Google search on a phone for hardwood floor installer Van Nuys CA, showing the local map pack with three business listings, finger scrolling slowly, captured in an incognito window with location set to Van Nuys, California.
```

### Para publicar

**Headline estática:** Você recebe a diária. Ele recebe a obra.

**CTA:** Chama no WhatsApp e pede o diagnóstico gratuito por escrito do seu Google Business Profile, do seu site e das suas avaliações.

**Legenda do Meta:**

```
Você fecha a semana com a diária. Quem assinou o orçamento fecha com a obra inteira.

Quatro dias de engineered hardwood em Van Nuys valem uma coisa pra você e outra bem diferente pro contractor que apareceu primeiro na busca do dono da casa. E a diferença ali não foi habilidade.

Enquanto o perfil no Google, o site e as avaliações estiverem no nome de outra pessoa, você continua sendo a mão de obra do orçamento dela.

A Leon Group monta essa presença pra empresário de construção e home services na região de Los Angeles: Google Business Profile, site com SEO local e botão direto pro seu WhatsApp, estratégia de avaliação, Instagram e conteúdo. Tráfego pago entra só na última etapa, depois que a base estiver de pé.

O primeiro passo é de graça e por escrito: diagnóstico do seu Google Business Profile, do seu site e das suas avaliações, com o que está faltando e em que ordem resolver.

Chama no WhatsApp.
```

### Integridade

O personagem é invenção para ilustrar o mercado. Nunca apresentar como cliente da Leon Group, nunca colocar depoimento na boca dele, nunca atribuir resultado da agência a ele. No dia que houver cliente real, o caso entra com nome verdadeiro e autorização por escrito. Nenhum valor em dólar é falado neste roteiro: a versão de Massachusetts citava 340 de diária e 11.400 de obra, e esses números são de lá. A conta aqui é feita por comparação, sem número, o que também evita afirmar preço de mercado sem fonte local. Nenhum resultado é atribuído à Leon Group, que não tem cliente fechado.

### Conferir antes de publicar

- [ ] WhatsApp: o número do anúncio é +1 213 396 0014 (americano, área 213). Situação em 2026-09-10, fim do dia: o WhatsApp Business foi ATIVADO nesse número. Antes de gravar cartela ou áudio citando o número, e antes de subir campanha apontando pra ele, mande uma mensagem de teste pelo link wa.me e confirme que ela chega no aparelho.
- [ ] Roteiro da leva de Los Angeles. Conferir que nenhuma referência de Massachusetts sobrou no áudio, na tela ou na legenda: cidade, clima e sazonalidade são outros.
- [ ] [VERIFICAR] Se em alguma variação for colocado valor na tela: o ticket de engineered hardwood instalado e a diária de instalador em Los Angeles NÃO são os de Massachusetts. Conferir preço em Angi e HomeAdvisor filtrando Van Nuys ou Los Angeles CA, e a diária em Indeed, ZipRecruiter e Salary.com para flooring installer Los Angeles. Sem esse dado, manter o roteiro sem número, que é como ele está.
- [ ] Na gravação de tela da busca hardwood floor installer Van Nuys CA, confirmar que nenhum nome, telefone ou nota de empresa real fica legível depois do blur, para o anúncio não citar concorrente identificável.
- [ ] Confirmar que a página do diagnóstico gratuito está no ar e que o botão do site abre a conversa antes de gravar a tela.

---

## Roteiro 102 · O telefone que não toca (LA)

`A dor` · 44 segundos · ator de IA · 482 caracteres de script

**O ângulo:** Manda o cara abrir o histórico de chamadas do próprio celular e perceber que tem um nome só ali: ele não tem clientes, tem uma fonte. Versão Los Angeles do roteiro 2, com as cidades e sem o valor de Massachusetts.

**Modelo:** Audio Driven. Passa de 400 caracteres, então fica fora do Omnihuman 1.5, e o Audio Driven entrega os 44 segundos com respiro.

### O prompt, copiar de uma vez

```
QUEM
Homem latino, 32 a 45 anos, roupa de trabalho, aparência de fim de expediente. Fala com energia de conversa direta, sem locução. Nada de terno, nada de sorriso de catálogo.

ONDE
Dentro da van de trabalho ou encostado nela, no fim do dia. Luz natural quente da Califórnia. Ferramenta e material ao fundo, fora de foco.

O QUE FALA (palavra por palavra, sem improviso)
Subcontractor, abre o histórico de chamadas do teu celular agora.
O Cleiton fez isso semana passada. Rolou a tela inteira.
Um nome só. Sempre o mesmo.
Esse nome liga na terça e ele vai pra North Hollywood. Liga na quinta, Burbank.
O Cleiton fechou um banheiro inteiro mês passado. O dono da casa nem sabe o nome dele.
No dia que esse telefone parar, não acabou o job. Acabou a fonte.
Sou o Rodrigo, da Leon Group.
Chama no WhatsApp e eu te mando o diagnóstico por escrito, de graça.

NUNCA
Nunca dizer que quem fala é cliente da Leon Group nem que a agência conseguiu resultado para alguém. Nunca dar depoimento em primeira pessoa de cliente satisfeito. Nunca afirmar presença física nos Estados Unidos. Nunca prometer faturamento nem posição no Google. Nunca citar nota de avaliação ou quantidade de estrelas da própria agência. Nunca usar travessão na legenda queimada.
```

### Escolha do ator

Arcads > Add Actors: masculino, 32 a 45, cenário dentro do carro ou obra. Priorizar latino se o filtro existir. Cara de quem acabou o dia, não de quem vai apresentar. Ator diferente do roteiro 101 e do roteiro 2 de Massachusetts.

### Áudio

Speech to Speech. A abertura é um comando, sai firme e direto. O trecho do nome único sai mais baixo, quase constatação. A linha da fonte que acaba sai devagar e seca, com pausa antes. O fecho volta ao tom de oferta calma.

### Storyboard

| Tempo | Imagem | Na tela |
|---|---|---|
| `0:00-0:05` | Talking head, plano médio. Comando direto na câmera. | HEADLINE (caixa preta #171717, texto marfim #F7F3EA, sai em 0:05): UM NOME SÓ NO TEU HISTÓRICO DE CHAMADAS |
| `0:05-0:11` | Plano de apoio: tela do celular com o mesmo nome repetido, polegar rolando. | LEGENDA: O Cleiton fez isso semana passada. |
| `0:11-0:15` | Volta pro talking head, plano fechado. | LEGENDA: Um nome só. Sempre o mesmo. |
| `0:15-0:23` | Plano de apoio: banheiro reformado, contractor guardando ferramenta. | LEGENDA: terça em North Hollywood, quinta em Burbank |
| `0:23-0:29` | Talking head, tom de constatação. | LEGENDA: O dono da casa nem sabe o nome dele. |
| `0:29-0:36` | Plano de apoio: celular apagado na bancada, silêncio. | LEGENDA: Não acabou o job. Acabou a fonte. |
| `0:36-0:40` | Talking head, apresentação curta. | LEGENDA: Rodrigo · Leon Group |
| `0:40-0:44` | Talking head, fecho. Corta seco. | CARTELA FINAL: Leon Group · Built to Lead. · Diagnóstico gratuito por escrito |

### Planos de apoio, com prompt pronto

**`0:05-0:11`** · origem: gerado por IA (Veo 3.1 ou Kling 2.6)

```
Close-up of a phone screen showing a call history list where the same contact name repeats over and over, thumb scrolling slowly, screen slightly tilted, held in a calloused hand inside a work van, natural daylight, shallow depth of field, 6 seconds.
```

**`0:17-0:23`** · origem: gerado por IA (Veo 3.1 ou Kling 2.6)

```
Wide handheld shot of a finished bathroom remodel, new tile and vanity, a contractor packing tools into a bucket by the door, late afternoon light through the window, no faces visible, documentary feel, 6 seconds.
```

**`0:29-0:34`** · origem: gerado por IA (Veo 3.1 ou Kling 2.6)

```
Static close-up of a phone lying face up on a workbench, screen dark, no notifications, dust and tools around it, cold flat light, held for a beat too long, 5 seconds.
```

### Para publicar

**Headline estática:** UM NOME SÓ NO TEU HISTÓRICO DE CHAMADAS

**CTA:** Chama no WhatsApp e pede o diagnóstico gratuito por escrito. Você manda o nome da empresa e a cidade.

**Legenda do Meta:**

```
Abre o histórico de chamadas do seu celular e rola até o fim. Quantos nomes diferentes aparecem ali?

Se for um só, você não tem clientes. Você tem uma fonte. E fonte fecha.

Terça em North Hollywood, quinta em Burbank, e o dono da casa que pagou a obra nunca soube o seu nome. Enquanto for assim, quem cresce com o seu acabamento é quem assinou o orçamento.

A Leon Group monta a presença que faz o dono da casa achar VOCÊ: Google Business Profile, site em inglês com botão direto pro seu WhatsApp, estratégia de avaliação e conteúdo. Para construção e home services na região de Los Angeles.

O primeiro passo não custa nada e vem por escrito: diagnóstico do seu perfil, do seu site e das suas avaliações, com a ordem do que resolver.

Chama no WhatsApp.
```

### Integridade

O personagem é invenção para ilustrar o mercado. Nunca apresentar como cliente da Leon Group, nunca colocar depoimento na boca dele, nunca atribuir resultado da agência a ele. No dia que houver cliente real, o caso entra com nome verdadeiro e autorização por escrito. Nenhum valor em dólar é falado: a versão de Massachusetts citava 14.800 de banheiro, número de lá. Aqui a obra é citada sem preço, o que evita afirmar ticket de mercado de Los Angeles sem fonte. Quem fala é apresentador, não cliente.

### Conferir antes de publicar

- [ ] WhatsApp: o número do anúncio é +1 213 396 0014 (americano, área 213). Situação em 2026-09-10, fim do dia: o WhatsApp Business foi ATIVADO nesse número. Antes de gravar cartela ou áudio citando o número, e antes de subir campanha apontando pra ele, mande uma mensagem de teste pelo link wa.me e confirme que ela chega no aparelho.
- [ ] Roteiro da leva de Los Angeles. Conferir que nenhuma referência de Massachusetts sobrou no áudio, na tela ou na legenda: cidade, clima e sazonalidade são outros.
- [ ] [VERIFICAR] Se alguma variação colocar o ticket do banheiro na tela: o valor de bathroom remodel em Los Angeles não é o de Boston. Conferir no Remodeling Cost vs Value Report com recorte Los Angeles e em Angi ou HomeAdvisor filtrando a cidade. Sem o dado, manter sem número.
- [ ] North Hollywood e Burbank são cidades vizinhas reais. Confirmar no Google Maps que o trajeto entre as duas é curto, para a história não soar impossível para quem mora lá.
- [ ] Na gravação de tela, checar que não aparece aba pessoal, e-mail logado, nome ou número de terceiro.

---

## Roteiro 103 · A estação da chuva (LA)

`A dor` · 45 segundos · ator de IA · 526 caracteres de script

**O ângulo:** Nomeia o mês que dói na Califórnia (janeiro, chuva forte, telefone mudo) para virar a chave: a chuva não tira o trabalho da rua, ela só tira o trabalho de quem depende de indicação. Substitui o roteiro 4, cuja premissa era neve e ice dam, que não existem em Los Angeles.

**Modelo:** Audio Driven. Passa de 400 caracteres e entrega os 45 segundos sem emenda.

### O prompt, copiar de uma vez

```
QUEM
Homem latino, 35 a 47 anos, roupa de trabalho gasta, aparência de quem tem anos de estrada. Fala como quem dá conselho a um colega, não como quem vende. Sem gesto de palestrante.

ONDE
Garagem ou depósito de material, porta aberta com luz cinzenta de dia chuvoso ao fundo. Ferramenta empilhada, nada cenográfico.

O QUE FALA (palavra por palavra, sem improviso)
Subcontractor, pergunta pro Jailson qual mês dói.
Janeiro em Pomona. Chuva forte três semanas e o telefone mudo.
Mas o trabalho existe. Telhado vazando, calha entupida, água entrando na garagem.
Onze da noite, um homeowner de Pasadena pega o celular e procura socorro.
Ele não chama o melhor. Chama quem ele acha.
O Jailson tava a dez minutos dali. Não apareceu na busca.
Janeiro não se resolve com anúncio caro. Se resolve com Google que funciona em janeiro.
Chama a Leon Group no WhatsApp. Diagnóstico gratuito, por escrito.

NUNCA
Nunca dizer que quem fala é cliente da Leon Group nem que a agência conseguiu resultado para alguém. Nunca dar depoimento em primeira pessoa de cliente satisfeito. Nunca afirmar presença física nos Estados Unidos. Nunca prometer faturamento nem posição no Google. Nunca citar nota de avaliação ou quantidade de estrelas da própria agência. Nunca usar travessão na legenda queimada.
```

### Escolha do ator

Arcads > Add Actors: masculino, 35 a 47, cenário garagem ou depósito. Priorizar latino. Alguém com cara de quem já passou por temporada fraca, tom de conselho e não de venda. Ator diferente dos roteiros 101 e 102.

### Áudio

Speech to Speech. A abertura é convite a pensar, sai calma. O trecho da chuva sai mais baixo e pesado. A virada em 'mas o trabalho existe' sobe um tom. As três linhas de serviço saem rápidas e enfileiradas. O fecho é seco e definitivo.

### Storyboard

| Tempo | Imagem | Na tela |
|---|---|---|
| `0:00-0:05` | Talking head, plano médio, tom de conselho. | HEADLINE (caixa preta #171717, texto marfim #F7F3EA, sai em 0:05): JANEIRO NÃO PARA O TRABALHO. PARA QUEM DEPENDE DE INDICAÇÃO. |
| `0:05-0:12` | Plano de apoio: chuva forte em rua residencial, picape com lona. | LEGENDA: Janeiro em Pomona. Telefone mudo três semanas. |
| `0:12-0:19` | Plano de apoio: calha entupida transbordando na parede de stucco. | LEGENDA: Mas o trabalho existe. |
| `0:19-0:26` | Plano de apoio: tela do celular à noite, busca de emergência. | LEGENDA: Onze da noite, alguém procura socorro. |
| `0:26-0:31` | Volta pro talking head, pausa antes da linha. | LEGENDA: Ele não chama o melhor. Chama quem ele acha. |
| `0:31-0:36` | Talking head, tom mais baixo. | LEGENDA: A dez minutos dali. Não apareceu. |
| `0:36-0:42` | Talking head, tom firme, olhando na câmera. | LEGENDA: Google que funciona em janeiro. |
| `0:42-0:45` | Talking head, fecho. Corta seco. | CARTELA FINAL: Leon Group · Built to Lead. · Diagnóstico gratuito por escrito |

### Planos de apoio, com prompt pronto

**`0:05-0:12`** · origem: gerado por IA (Veo 3.1 ou Kling 2.6)

```
Heavy winter rain falling on a residential street in Southern California, water running along the curb, palm trees moving in the wind, a parked work truck with tools covered by a tarp, grey overcast light, handheld, documentary look, 7 seconds.
```

**`0:12-0:19`** · origem: gerado por IA (Veo 3.1 ou Kling 2.6)

```
Close-up of water overflowing from a clogged residential gutter during heavy rain, spilling down the side of a stucco house, splashing onto a concrete driveway, grey daylight, static shot, realistic colors, 7 seconds.
```

**`0:19-0:26`** · origem: gerado por IA (Veo 3.1 ou Kling 2.6)

```
Close-up of a phone screen at night, a hand typing an emergency search into Google, face lit only by the screen, dark room, rain visible on the window behind, shallow depth of field, 7 seconds.
```

### Para publicar

**Headline estática:** JANEIRO NÃO PARA O TRABALHO. PARA QUEM DEPENDE DE INDICAÇÃO.

**CTA:** Chama no WhatsApp e pede o diagnóstico gratuito por escrito antes da próxima temporada de chuva.

**Legenda do Meta:**

```
Todo subcontractor tem um mês que dói. Na Califórnia costuma ser janeiro: chuva forte, obra parada e o telefone mudo por semanas.

Só que o trabalho não sumiu. Telhado vazando, calha entupida e água entrando na garagem acontecem exatamente nesse mês. Alguém procura socorro às onze da noite e chama quem encontra, não quem é melhor.

Se você depende de indicação, você fica de fora justamente quando a demanda aparece.

A Leon Group monta a presença que faz você ser encontrado: Google Business Profile otimizado, site em inglês com SEO local, estratégia de avaliação e conteúdo. Para construção e home services na região de Los Angeles.

Diagnóstico gratuito e por escrito do seu perfil, do seu site e das suas avaliações. Chama no WhatsApp.
```

### Integridade

O personagem é invenção para ilustrar o mercado. Nunca apresentar como cliente da Leon Group, nunca colocar depoimento na boca dele, nunca atribuir resultado da agência a ele. No dia que houver cliente real, o caso entra com nome verdadeiro e autorização por escrito. Nenhum valor em dólar e nenhum dado de mercado é afirmado. A sazonalidade citada (chuva de inverno no sul da Califórnia) é característica climática pública da região, não estatística de negócio. A versão de Massachusetts falava de neve e ice dam, que não existem em Los Angeles, e por isso a premissa foi trocada, não traduzida.

### Conferir antes de publicar

- [ ] WhatsApp: o número do anúncio é +1 213 396 0014 (americano, área 213). Situação em 2026-09-10, fim do dia: o WhatsApp Business foi ATIVADO nesse número. Antes de gravar cartela ou áudio citando o número, e antes de subir campanha apontando pra ele, mande uma mensagem de teste pelo link wa.me e confirme que ela chega no aparelho.
- [ ] Roteiro da leva de Los Angeles. Conferir que nenhuma referência de Massachusetts sobrou no áudio, na tela ou na legenda: cidade, clima e sazonalidade são outros.
- [ ] Conferir que a temporada de chuva citada bate com o calendário do sul da Califórnia no ano da veiculação. Se o anúncio for subir fora da estação, trocar o mês falado no áudio e na legenda queimada, senão a história perde a força para quem mora lá.
- [ ] Pomona e Pasadena são cidades reais da região. Confirmar no Google Maps que a distância citada (dez minutos) é plausível para o trajeto sugerido, ou ajustar o número no áudio.
- [ ] Nenhum número de mercado é citado. Se alguma variação colocar volume de busca ou ticket na tela, buscar antes no Google Keyword Planner com localização Los Angeles, CA, e mostrar a fonte no frame.

---

## Roteiro 104 · Dois contractors, mesma cidade (LA)

`Contraste` · 44 segundos · ator de IA · 550 caracteres de script

**O ângulo:** Dois subcontractors de Inglewood fazem o mesmo piso, na mesma semana, com o mesmo acabamento e o mesmo preço, e na sexta de manhã só um deles existe na tela do celular do dono da casa. Versão Los Angeles do roteiro 12.

**Modelo:** Audio Driven. Passa de 400 caracteres e entrega os 44 segundos com respiro entre as linhas.

### O prompt, copiar de uma vez

```
QUEM
Homem latino, 31 a 42 anos, roupa de trabalho limpa, aparência de quem tem equipe pequena. Conta o caso como quem conversa, com ritmo tranquilo. Sem energia de vendedor.

ONDE
Cozinha em reforma ou sala vazia com material encostado na parede. Luz natural de tarde. Nada de escritório.

O QUE FALA (palavra por palavra, sem improviso)
Dois subcontractors de piso em Inglewood. Fabiano e Wanderson.
Mesma semana, mesmo engineered hardwood, mesmo acabamento, mesmo preço.
Sexta de manhã o dono da casa pega o celular e procura instalador.
O Fabiano aparece: foto do serviço, avaliação de gente da região, site.
O Wanderson não existe naquela tela.
Os dois trabalham igual. Um tem estrutura, o outro não.
A Leon Group monta a tua: perfil no Google, site com botão pro teu WhatsApp, avaliação.
Anúncio é a última etapa, não a primeira.
Chama no WhatsApp. Diagnóstico gratuito, por escrito.

NUNCA
Nunca dizer que quem fala é cliente da Leon Group nem que a agência conseguiu resultado para alguém. Nunca dar depoimento em primeira pessoa de cliente satisfeito. Nunca afirmar presença física nos Estados Unidos. Nunca prometer faturamento nem posição no Google. Nunca citar nota de avaliação ou quantidade de estrelas da própria agência. Nunca usar travessão na legenda queimada.
```

### Escolha do ator

Arcads > Add Actors: masculino, 31 a 42, cenário obra ou cozinha em reforma. Priorizar latino. Tom de quem conta um caso, não de quem apresenta. Ator diferente dos roteiros 101, 102 e 103.

### Áudio

Speech to Speech. As duas primeiras linhas saem em ritmo de enumeração, quase entediado de propósito, porque o ponto é que tudo é igual. A linha do Wanderson sai com pausa antes e depois. 'Um tem estrutura, o outro não' sai devagar. O fecho volta ao tom calmo.

### Storyboard

| Tempo | Imagem | Na tela |
|---|---|---|
| `0:00-0:06` | Talking head, plano médio. Abre apresentando os dois nomes. | HEADLINE (caixa preta #171717, texto marfim #F7F3EA, sai em 0:06): Mesmo piso. Mesma cidade. Só um aparece no celular. |
| `0:06-0:13` | Plano de apoio: duas equipes assentando o mesmo piso em salas parecidas. | LEGENDA: Mesma semana. Mesmo acabamento. Mesmo preço. |
| `0:13-0:20` | Plano de apoio: dono da casa na cozinha, celular na mão, sexta de manhã. | LEGENDA: Sexta de manhã, ele procura instalador. |
| `0:20-0:27` | Plano de apoio: gravação de tela do map pack, três resultados. | LEGENDA: foto, avaliação, site |
| `0:27-0:32` | Volta pro talking head. Pausa antes e depois da linha. | LEGENDA: O Wanderson não existe naquela tela. |
| `0:32-0:37` | Talking head, tom devagar. | LEGENDA: Um tem estrutura. O outro não. |
| `0:37-0:41` | Talking head, enumerando com a mão. | LEGENDA: perfil · site · avaliação |
| `0:41-0:44` | Talking head, fecho. Corta seco. | CARTELA FINAL: Leon Group · Built to Lead. · Diagnóstico gratuito por escrito |

### Planos de apoio, com prompt pronto

**`0:06-0:13`** · origem: gerado por IA (Veo 3.1 ou Kling 2.6)

```
Split-feel documentary shot of two different flooring crews working in two similar empty living rooms, same engineered hardwood planks, same tools, warm afternoon light, handheld, no faces visible, matching framing to suggest they are interchangeable, 7 seconds.
```

**`0:13-0:20`** · origem: gerado por IA (Veo 3.1 ou Kling 2.6)

```
Over the shoulder shot of a homeowner sitting at a kitchen table on a Friday morning, coffee in hand, scrolling a phone search results page for a flooring installer, bright natural light, screen not legible, 7 seconds.
```

**`0:20-0:27`** · origem: gravação de tela do Rodrigo, feita no dia, com nomes de terceiros borrados

```
Screen recording of a Google local map pack on a phone for flooring contractor Inglewood CA, three business cards visible with photos and review counts, finger pausing on the first one, incognito window with location set to Inglewood, California.
```

### Para publicar

**Headline estática:** Mesmo piso. Mesma cidade. Só um aparece no celular.

**CTA:** Chama no WhatsApp e pede o diagnóstico gratuito por escrito do seu perfil, site e avaliações.

**Legenda do Meta:**

```
Dois instaladores de piso na mesma cidade. Mesma semana, mesmo material, mesmo acabamento, mesmo preço.

Sexta de manhã, o dono da casa pega o celular e procura. Um deles aparece com foto do serviço, avaliação e site. O outro não existe naquela tela.

Não é sobre quem trabalha melhor. É sobre quem tem estrutura montada quando a busca acontece.

A Leon Group monta a sua: Google Business Profile, site em inglês com botão direto pro seu WhatsApp, estratégia de avaliação, Instagram e conteúdo. Para construção e home services na região de Los Angeles. Tráfego pago entra só na última etapa, depois que a base estiver de pé.

Diagnóstico gratuito e por escrito. Chama no WhatsApp.
```

### Integridade

Os dois personagens são invenção para ilustrar o mercado. Nunca apresentar como cliente da Leon Group, nunca colocar depoimento na boca dele, nunca atribuir resultado da agência a ele. No dia que houver cliente real, o caso entra com nome verdadeiro e autorização por escrito. Nenhum valor em dólar e nenhuma contagem de avaliação é afirmada: a versão de Massachusetts citava trinta e duas avaliações, e esse número saiu daqui porque não foi medido em Inglewood. Nenhum concorrente real é citado ou identificável.

### Conferir antes de publicar

- [ ] WhatsApp: o número do anúncio é +1 213 396 0014 (americano, área 213). Situação em 2026-09-10, fim do dia: o WhatsApp Business foi ATIVADO nesse número. Antes de gravar cartela ou áudio citando o número, e antes de subir campanha apontando pra ele, mande uma mensagem de teste pelo link wa.me e confirme que ela chega no aparelho.
- [ ] Roteiro da leva de Los Angeles. Conferir que nenhuma referência de Massachusetts sobrou no áudio, na tela ou na legenda: cidade, clima e sazonalidade são outros.
- [ ] Se alguma variação exibir contagem de avaliações na tela, gravar a busca flooring contractor Inglewood CA no Google Maps no dia, printar com a data e usar o número real capturado. Sem esse print, manter a legenda genérica como está.
- [ ] Na gravação de tela do map pack, confirmar que nenhum nome, telefone ou nota de empresa real fica legível depois do blur.
- [ ] Confirmar que os nomes usados não coincidem com empresa real de flooring em Inglewood: buscar os dois no Google antes de gerar o vídeo e trocar se houver coincidência.

---

## Roteiro 105 · O diagnóstico gratuito (LA)

`Oferta` · 45 segundos · ator de IA · 540 caracteres de script

**O ângulo:** A oferta seca no primeiro segundo: nomeia o ICP, diz que é de graça e que não tem pegadinha, e o resto é o contrato do que ele manda, do que recebe e do que não vai acontecer. Versão Los Angeles do roteiro 15.

**Modelo:** Audio Driven. Passa de 400 caracteres e entrega os 45 segundos sem cortar o fecho.

### O prompt, copiar de uma vez

```
QUEM
Homem latino, 33 a 45 anos, camisa simples, aparência de profissional acessível. Fala como quem explica um procedimento, com clareza e sem pressa. Sem energia de vendedor e sem gesto de palco.

ONDE
Sala neutra e clara, parede lisa clara, sem elemento cenográfico. Luz suave e frontal. Nada de escritório corporativo.

O QUE FALA (palavra por palavra, sem improviso)
Empresário da construção e home services na Califórnia: isso aqui é de graça e não tem pegadinha.
Você me manda duas coisas. O nome da empresa e a cidade. Van Nuys, Glendale, Torrance, tanto faz.
Eu abro o teu Google Business Profile, o teu site e as tuas avaliações.
Em dois dias você recebe um documento por escrito, sobre a tua empresa, na ordem do que arrumar primeiro.
Não é reunião. Não é call de uma hora.
Dá pra executar sozinho, sem me contratar.
E ninguém vai te ligar insistindo.
WhatsApp aqui embaixo. Leon Group. Built to Lead.

NUNCA
Nunca dizer que quem fala é cliente da Leon Group nem que a agência conseguiu resultado para alguém. Nunca dar depoimento em primeira pessoa de cliente satisfeito. Nunca afirmar presença física nos Estados Unidos. Nunca prometer faturamento nem posição no Google. Nunca citar nota de avaliação ou quantidade de estrelas da própria agência. Nunca usar travessão na legenda queimada.
```

### Escolha do ator

Arcads > Add Actors: masculino, 33 a 45, cenário neutro e claro (parede lisa, sala simples). Aqui o ator é APRESENTADOR da oferta, não personagem de história, então pode ter postura um pouco mais formal, mas nunca de palco. Ator diferente dos roteiros 101 a 104.

### Áudio

Speech to Speech. Tom de quem explica um procedimento, calmo e claro do começo ao fim. As três negativas ('não é reunião', 'não é call', 'ninguém vai te ligar insistindo') saem pausadas, uma por vez, porque é onde a objeção mora. O fecho é curto e sem entonação de venda.

### Storyboard

| Tempo | Imagem | Na tela |
|---|---|---|
| `0:00-0:07` | Talking head, plano do peito pra cima, olhando reto na câmera. | HEADLINE (caixa preta #171717 de cantos arredondados, texto marfim #F7F3EA, duas linhas, canto superior esquerdo a 25% da altura, sai com fade em 0:07): DIAGNÓSTICO POR ESCRITO. / CUSTO: ZERO. |
| `0:07-0:12` | Talking head, enumera com dois dedos. | LEGENDA: nome da empresa + cidade |
| `0:12-0:19` | Plano de apoio: gravação de tela de um perfil sendo analisado. | LEGENDA: perfil · site · avaliações |
| `0:19-0:27` | Plano de apoio: documento de diagnóstico rolando na tela. | LEGENDA: em dois dias, por escrito, na ordem do que arrumar |
| `0:27-0:32` | Volta pro talking head. Pausa entre as duas negativas. | LEGENDA: Não é reunião. Não é call. |
| `0:32-0:37` | Talking head, tom tranquilo. | LEGENDA: Dá pra executar sozinho. |
| `0:37-0:41` | Talking head, a objeção final. | LEGENDA: E ninguém vai te ligar insistindo. |
| `0:41-0:45` | Talking head, fecho curto. Corta seco. | CARTELA FINAL: Leon Group · Built to Lead. · WhatsApp |

### Planos de apoio, com prompt pronto

**`0:12-0:19`** · origem: gravação de tela do Rodrigo em perfil de demonstração, sem dado de terceiro

```
Screen recording of a Google Business Profile page for a generic home services company being reviewed on a laptop, cursor moving over the photos and categories section, clean neutral interface, no real business name legible, 7 seconds.
```

**`0:19-0:27`** · origem: gravação de tela do documento modelo da própria Leon Group

```
Close-up of a written diagnostic document on a laptop screen, clean typography, headings and a numbered list visible but text not legible, scrolling slowly, soft daylight, 8 seconds.
```

### Para publicar

**Headline estática:** DIAGNÓSTICO POR ESCRITO. / CUSTO: ZERO.

**CTA:** Manda no WhatsApp o nome da sua empresa e a cidade. O diagnóstico volta por escrito em dois dias.

**Legenda do Meta:**

```
Isso aqui é de graça e não tem pegadinha.

Você manda duas coisas no WhatsApp: o nome da sua empresa e a cidade onde atende. Van Nuys, Glendale, Torrance, tanto faz.

Em dois dias você recebe um documento por escrito, sobre a SUA empresa, dizendo o que está faltando no seu Google Business Profile, no seu site e nas suas avaliações, na ordem do que resolver primeiro.

O que não vai acontecer: não é reunião, não é call de uma hora, e ninguém vai te ligar insistindo. Dá pra pegar o documento e executar sozinho, sem contratar nada.

A Leon Group trabalha com construção e home services na região de Los Angeles e em Massachusetts.

Chama no WhatsApp.
```

### Integridade

Quem fala é apresentador da oferta, não cliente e não personagem dando depoimento. Nenhum resultado, caso ou número de cliente é citado. A única promessa é o diagnóstico gratuito por escrito, que já existe, está publicado no site e é entregável na mão. O prazo de dois dias é compromisso operacional e precisa ser cumprido de fato.

### Conferir antes de publicar

- [ ] WhatsApp: o número do anúncio é +1 213 396 0014 (americano, área 213). Situação em 2026-09-10, fim do dia: o WhatsApp Business foi ATIVADO nesse número. Antes de gravar cartela ou áudio citando o número, e antes de subir campanha apontando pra ele, mande uma mensagem de teste pelo link wa.me e confirme que ela chega no aparelho.
- [ ] Roteiro da leva de Los Angeles. Conferir que nenhuma referência de Massachusetts sobrou no áudio, na tela ou na legenda: cidade, clima e sazonalidade são outros.
- [ ] Capacidade de entrega: antes de subir, ter o documento modelo do diagnóstico pronto e o prazo de dois dias assumido. O anúncio promete por escrito em dois dias, então o primeiro pedido precisa ser atendido nesse prazo. Se não der, mudar o prazo falado no áudio antes de gerar o vídeo.
- [ ] Na gravação de tela do perfil e do documento, confirmar que nenhum nome, endereço, telefone ou e-mail real aparece, e que a aba usada não tem conta pessoal logada.
- [ ] Nenhum número de mercado é citado. Se alguma variação inserir um, buscar antes no Google Keyword Planner com localização Los Angeles, CA, e mostrar a fonte no frame.

---

## Roteiro 106 · Convite direto (LA)

`Rodrigo` · 40 segundos · gravado pelo Rodrigo · 451 caracteres de script

**O ângulo:** Rodrigo olha na câmera e diz que aquilo não é venda, é convite: manda o nome da empresa e a cidade, e ele devolve o diagnóstico por escrito de graça. Versão Los Angeles do roteiro 20, gravada por ele, sem custo de ferramenta.

**Modelo:** Não passa pelo Arcads: quem grava é o Rodrigo, no celular. O campo fica preenchido porque o documento é o mesmo para os dois tipos, mas não há geração de ator.

### O prompt, copiar de uma vez

```
QUEM
Rodrigo, fundador da Leon Group, falando direto na câmera do celular. Não é ator gerado.

ONDE
Ambiente interno neutro, sem eco, parede lisa. Luz frontal natural, de janela. Sem elemento cenográfico e sem logo de terceiro em quadro.

O QUE FALA (palavra por palavra, sem improviso)
Se você é empresário da construção na Califórnia, isso aqui é um convite, não é uma venda.
Sou o Rodrigo, da Leon Group.
Me manda no WhatsApp o nome da sua empresa e a cidade. Van Nuys, Pasadena, Long Beach, tanto faz.
Eu olho o seu Google, o seu site e as suas avaliações.
E te devolvo um diagnóstico por escrito, em dois dias.
Sem custo, e sem ninguém te ligando insistindo depois.
Se não servir, você apaga e segue o dia.
O botão está aqui embaixo.

NUNCA
Nunca dizer que quem fala é cliente da Leon Group nem que a agência conseguiu resultado para alguém. Nunca dar depoimento em primeira pessoa de cliente satisfeito. Nunca afirmar presença física nos Estados Unidos. Nunca prometer faturamento nem posição no Google. Nunca citar nota de avaliação ou quantidade de estrelas da própria agência. Nunca usar travessão na legenda queimada.
```

### Escolha do ator

Não se aplica: quem aparece é o Rodrigo. Enquadramento do peito pra cima, celular na altura dos olhos, nunca de baixo. Camisa lisa, sem estampa e sem logo de terceiro.

### Áudio

Gravado direto no celular, em ambiente sem eco. Tom de conversa, não de anúncio. As duas primeiras linhas saem devagar, porque é onde ele se apresenta. 'Sem custo' sai seco. A última linha sai leve, quase dando permissão pra pessoa ignorar.

### Storyboard

| Tempo | Imagem | Na tela |
|---|---|---|
| `0:00-0:06` | Rodrigo, plano do peito pra cima, olhando na câmera. Entra falando. | HEADLINE (caixa preta #171717, texto marfim #F7F3EA, sai em 0:06): Diagnóstico por escrito, sem custo |
| `0:06-0:10` | Mesmo plano, apresentação curta. | LEGENDA: Rodrigo · Leon Group |
| `0:10-0:17` | Mesmo plano, enumera com dois dedos. | LEGENDA: nome da empresa + cidade |
| `0:17-0:22` | Plano de apoio: documento de diagnóstico rolando na tela do laptop. | LEGENDA: perfil · site · avaliações |
| `0:22-0:28` | Volta pro Rodrigo, mesmo enquadramento. | LEGENDA: por escrito, em dois dias |
| `0:28-0:34` | Rodrigo, tom seco na primeira metade da linha. | LEGENDA: Sem custo. Sem ninguém te ligando insistindo. |
| `0:34-0:37` | Rodrigo, tom leve, quase dando permissão. | LEGENDA: Se não servir, você apaga e segue o dia. |
| `0:37-0:40` | Rodrigo, fecho. Corta seco, sem fade. | CARTELA FINAL: Leon Group · Built to Lead. · WhatsApp |

### Planos de apoio, com prompt pronto

**`0:14-0:22`** · origem: gravação de tela do documento modelo da própria Leon Group

```
Screen recording of a written diagnostic document being scrolled on a laptop, clean headings and numbered list, text not legible, soft daylight, 8 seconds.
```

### Para publicar

**Headline estática:** Diagnóstico por escrito, sem custo

**CTA:** Manda no WhatsApp o nome da sua empresa e a cidade. O diagnóstico volta por escrito em dois dias.

**Legenda do Meta:**

```
Isso aqui é um convite, não é uma venda.

Sou o Rodrigo, da Leon Group. Me manda no WhatsApp o nome da sua empresa e a cidade onde você atende. Van Nuys, Pasadena, Long Beach, tanto faz.

Eu olho o seu Google Business Profile, o seu site e as suas avaliações, e te devolvo um diagnóstico por escrito em dois dias. Sem custo, e sem ninguém te ligando insistindo depois.

Se não servir pra você, apaga e segue o dia. Se servir, dá pra executar sozinho, sem me contratar.

A Leon Group trabalha com construção e home services na região de Los Angeles e em Massachusetts.
```

### Integridade

Quem fala é o próprio fundador se apresentando. Não há cliente, depoimento, resultado nem número atribuído a ninguém. Não se diz onde o Rodrigo está, só onde o público trabalha. Não há promessa de faturamento nem de posição no Google. A única entrega prometida é o diagnóstico gratuito por escrito, que já está publicado no site.

### Conferir antes de publicar

- [ ] WhatsApp: o número do anúncio é +1 213 396 0014 (americano, área 213). Situação em 2026-09-10, fim do dia: o WhatsApp Business foi ATIVADO nesse número. Antes de gravar cartela ou áudio citando o número, e antes de subir campanha apontando pra ele, mande uma mensagem de teste pelo link wa.me e confirme que ela chega no aparelho.
- [ ] Roteiro da leva de Los Angeles. Conferir que nenhuma referência de Massachusetts sobrou no áudio, na tela ou na legenda: cidade, clima e sazonalidade são outros.
- [ ] Prazo: o vídeo promete dois dias. Confirmar que o documento modelo do diagnóstico está pronto e que o prazo é cumprível antes de subir. Se não for, regravar com o prazo real.
- [ ] Cidades citadas no áudio (Van Nuys, Pasadena, Long Beach): checar se estão dentro do raio que o Rodrigo quer atender agora, para não atrair lead de região que ele não vai priorizar.
- [ ] Nada de nome, telefone, endereço ou print de empresa real aparece na gravação de tela do diagnóstico. Revisar o take frame a frame antes de exportar.

---

