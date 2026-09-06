# Auditoria do CRM — 06/09/2026

Auditoria de 6 lentes (consistência de estado, performance, lógica de negócio,
segurança, integridade de dados, motor de automação) sobre `src/` e `schema.sql`.

**Ressalva sobre o método:** a auditoria automatizada bateu o limite de sessão e
117 das 123 tarefas falharam — inclusive todos os verificadores adversariais. A
lista que ela devolveu marcava 38 achados como "refutados" quando ninguém os
havia verificado. **Cada achado abaixo foi verificado à mão, lendo o código**, e
os que dependiam de comportamento em produção foram testados contra o sistema no ar.
A lente de lógica de negócio morreu antes de reportar: essa frente ficou parcialmente
coberta (a aritmética de dias úteis foi verificada à mão, o resto não).

## Corrigido

### Segurança

| O quê | Consequência real | Prova |
|---|---|---|
| `/api/logout` ficava **antes** do portão de autenticação e chamava `invalidarTodasSessoes()` | Qualquer pessoa com a URL derrubava o dono do próprio CRM, em loop, sem cookie nenhum | Testado ao vivo: POST sem cookie → sessão válida caiu (HTTP 200→401). Depois da correção: 401 no atacante, sessão intacta |
| Formulário público gravava no **mesmo contador** que barra o login do admin | 50 acessos com token errado em 1h trancavam o dono fora do admin | Escopos separados (`login` / `formulario`), migração 05 |
| `esc()` de `geradores.js` não escapava aspa simples, e o hero usa `url('...')` com foto do formulário | Injeção de CSS permanente no site entregue ao cliente (não chega a script: `<` e `>` já eram escapados) | Aspa simples adicionada ao escape |
| Regex do cookie de sessão sem âncora | Cookie com nome terminando em `leon_sessao` casava primeiro e derrubava a sessão boa | `(?:^\|;\s*)` adicionado |
| Token de uso único era check-depois-grava | Dois envios simultâneos passavam pelos dois lados da trava: mídia duplicada, prazo reiniciado | Trava virou condição do próprio `UPDATE ... WHERE formulario_em IS NULL` + checagem de `changes` |
| Formulário não validava nada no servidor | Envio vazio queimava o token e a entrega começava a contar sem uma foto — e o cliente não podia reenviar (410) | Mínimo de 11 fotos e campos obrigatórios no servidor. Testado: 400 com token intacto |

### Perda e corrupção de dados

| O quê | Consequência real |
|---|---|
| `/api/cliente-editar` gravava os 13 campos com `?? null`, mas a tela manda 9 | **Cada clique em "Salvar"** apagava nicho, e-mail, valor_pago, cores e tem_logo do cliente |
| `valor_pago` caía para `lead.budget` | O valor que entrou virava o número que o lead *disse* que podia gastar na qualificação — receita errada no operacional |
| KPIs `call_comparecida` e `call_fechada` liam eventos que nenhum código gravava | Presos em zero para sempre, e o diagnóstico acusava o SDR com base em dado inexistente |
| Diagnóstico rodava com amostra de 1 lead | Qualquer taxa virava acusação; agora exige 5 na etapa |

### Motor de automação

| O quê | Consequência real |
|---|---|
| Erro HTTP da Z-API gravado como envio bem-sucedido (`fetch` não lança em 4xx/5xx) | Token inválido, número bloqueado ou sem crédito apareceriam como "enviada" — a operação pareceria funcionar sem nenhuma mensagem chegar |
| Nenhum isolamento por lead, e `scheduled()` engolia a exceção sem log | Um lead com problema abortava o motor inteiro em silêncio; nutrição e recuperação nunca rodavam |
| N+1 na nutrição/recuperação (1 consulta por lead, a cada 15 min) | Balde que só cresce: com alguns milhares de leads o motor estourava o tempo de execução e parava no meio |
| Trava de confirmação era `lead_id + tipo`, sem recorte de tempo | Call remarcada — o que acontece em **todo** no-show — nunca mais recebia confirmação, que é justamente o que evita o no-show seguinte |
| `no_show_f1`/`f2` mandavam o **mesmo texto** duas vezes seguidas | É o caminho mais curto para o número ser marcado como spam |
| `no_show_f3` era estado terminal | Lead morria no pipeline de agendamento, fora da régua de 14 dias da recuperação |
| Nada respeitava horário local | Follow-up podia disparar 3h da manhã no fuso do lead. Agora só entre 8h e 21h (America/New_York) |
| Dias úteis calculados em UTC | Formulário respondido domingo à noite em Boston jogava o prazo 3 dias para frente. Verificado nos 14 dias de início: o sinal de atrasado nunca dispara antes do prazo |

### Performance

| Rota | Antes | Depois |
|---|---|---|
| `/api/painel` | 3,50 s (27 idas ao banco em fila) | **0,39 s** (2 em paralelo) |
| `/api/cliente` (abrir cliente) | 7 idas em fila, tabela `marcos` lida 2× | 2 idas |
| `/api/lead` (abrir lead) | 4 idas em fila | 2 idas |
| `/api/gerar` (site + reviews + posts) | ~40 idas em fila; `DELETE` já feito se a inserção falhasse | 4 batches, `DELETE`+`INSERT` atômicos |
| Payload do painel | 28,8 KB (mandava o `site_html` inteiro, nunca usado) | 16,9 KB |
| Índices | faltavam 10 | `midias`, `posts`, `marcos`, `ligacoes`, `eventos`, `mensagens`, `escopo`, `formulario_token`, `lead_origem_id` |

### Interface

| O quê | Consequência real |
|---|---|
| `irPara()` chamava `render()`, mas tema/selo/switch/abas eram pintados em `carregar()` | Clicar em OPERACIONAL não mudava a moldura — parecia que o clique não fazia nada |
| Sub-abas tinham o mesmo defeito | O realce não acompanhava o clique |
| Sessão expirada sobrescrevia `D` com o objeto de erro | Tela congelava sem explicação; agora volta pro login, e falha de rede mostra aviso |
| Nome ia interpolado no `onclick` do Excluir | `esc()` gera `&#39;`, o parser decodifica de volta e o JS quebra: **o botão ficava inerte para qualquer O'Brien, D'Angelo** |

## Verificado e descartado

- **Reenvio do formulário duplicando mídia e reiniciando prazo** (sequencial): já era barrado pelo 410. Só o caso simultâneo era real — esse foi corrigido.
- **`no_show_f3` nunca manda a mensagem de encerramento**: manda, no momento da transição. O que faltava era o lead seguir para recuperação.
- **Sem OpenAI as confirmações repetem o mesmo texto**: eram 3 variações sorteadas (agora 5). O problema real estava no no-show, que usava texto fixo.
- **`criarLead()` esconde o lead novo**: ele abre o painel do lead na hora, então aparece.

## Não corrigido (assumido)

- `abrirLead`/`abrirCliente` gravam `aberto` antes do `await`: clicar em dois cartões dentro da janela da requisição pode abrir um e agir no outro. Exige clique muito rápido; fica anotado.
- O refresh de 60 s reconstrói o conteúdo e devolve a rolagem horizontal do quadro para a primeira coluna.
- **A lente de lógica de negócio não rodou.** Decaimento de temperatura, régua de renovação e conversão lead→cliente foram lidos mas não auditados a fundo. Vale uma segunda rodada quando o limite de sessão permitir.

## Como testar de novo

```bash
LEON_SENHA='...' ./testes/rodar.sh      # 31 asserções na interface
```
