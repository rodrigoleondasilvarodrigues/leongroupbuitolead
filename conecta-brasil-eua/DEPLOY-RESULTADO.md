# Resultado do deploy: Conecta Brasil-EUA

Nova interface publicada em 14/11/2026, 01:55 (horário local do Mac). Tudo no plano gratuito: nada foi pago nem ativado como pago.

## Está no ar

**https://conecta-brasil-eua.minnverso-jogo.workers.dev**

| Rota | Status | Tamanho | Tema escuro novo |
| --- | --- | --- | --- |
| `/healthz` | 200 (`ok`) | 2 bytes | n/a (texto puro) |
| `/` (painel) | 200 | 30.068 bytes | sim |
| `/grupos` | 200 | 59.022 bytes | sim |
| `/estados` | 200 | 73.039 bytes | sim |
| `/categorias` | 200 | 21.499 bytes | sim |
| `/como-utilizar` | 200 | 15.790 bytes | sim |
| `/empresas` | 200 | 174.309 bytes | sim |

Conferido por `curl` na URL publicada. "Tema escuro novo" significa que a resposta traz
`color-scheme:dark` e a variável `--bg:#0b1210` da paleta nova, mais o menu lateral com os itens
Estados, Categorias, Como utilizar e Empresas.

> **Atenção: a URL continua pública.** Qualquer pessoa com o link vê os grupos e as empresas (com telefone).
> Ativar o Cloudflare Access é o próximo passo, e está detalhado no fim deste arquivo.

## Conta e banco

- **Conta Cloudflare:** `Laplaceanalytica@gmail.com's Account`, ID `fb49d2423ae85fe6dc7922ae96b93a2a`
  (login OAuth do wrangler que já existia neste Mac, e-mail `laplaceanalytica@gmail.com`)
- **Worker:** `conecta-brasil-eua` · subdomínio workers.dev `minnverso-jogo`
- **Version ID deste deploy:** `cb8ecc1f-7c84-4752-aa80-d8d62f1a97aa` · upload 170,96 KiB (46,33 KiB gzip)
- **Banco D1:** `conecta-db`, `database_id = 01ac58ae-21fb-434a-80bb-9f757153cb56` (já no `wrangler.toml`)
- **Migrations:** `0001`, `0002` e `0003` aplicadas no banco remoto. A `0003_confianca_prospeccao.sql`
  entrou nesta rodada (6 comandos): adiciona `empresas.confianca_brasileira`, `empresas.arquivo_origem`
  e a tabela `prospeccao`. Só adiciona coisa, não altera nem apaga o que existia.
- **Cron:** `0 6 * * *` (revalidação diária dos links, 20 por execução)

## Contagens no D1 remoto

Consultado direto no banco depois da importação:

| | Antes (13/11) | Agora |
| --- | --- | --- |
| Grupos | 376 | **422** |
| Grupos ativos | 280 | **295** |
| Empresas | 3.170 | **3.902** |

Empresas por confiança de que o negócio é brasileiro:

| Confiança | Empresas |
| --- | --- |
| alta | **2.193** |
| média | **542** |
| baixa | **1.134** |
| sem classificação | **33** |
| total | **3.902** |

Os mesmos números aparecem no site, pelo filtro `conf`: `/empresas?conf=alta` devolve 2.193,
`?conf=media` 542, `?conf=baixa` 1.134 e `?conf=todas` 3.902. A tela de Empresas, **sem filtro,
mostra 2.768**: ela esconde a confiança `baixa` por padrão (3.902 menos 1.134).

**As 33 "sem classificação" são sobra da importação anterior**, de linhas dos `leads_*.csv` antigos que
o `empresas_final.csv` não casou por telefone nem por empresa+cidade+estado. Elas continuam no banco e
aparecem na tela (o padrão não as esconde), só não têm a coluna de confiança preenchida. Se você quiser,
dá para listá-las e decidir apagar ou reclassificar. Nada foi apagado por conta própria aqui.

`prospeccao`: **0 linhas**, porque ninguém editou status no site ainda. A contagem passou a sair no fim do
`reimport.sh` justamente para provar, nas próximas rodadas, que o reimport não zerou o que você editou.

## A importação desta rodada

- Fonte: `dados-import/` com `grupos.csv`, `grupos_outros.csv`, `grupos_staging2.csv`, `grupos_staging3.csv`,
  `grupos_staging4.csv` e **`empresas_final.csv`**.
- O `--dir` agora prioriza o `empresas_final.csv` e **ignora os `leads_*.csv`** quando ele existe. Os seis
  `leads_*.csv` antigos saíram da pasta (estão guardados em `/tmp/conecta-bkp-0146/leads-antigos/`, fora do git).
- `out/import.sql`: 20,1 MB, 10.885 statements (422 grupos + 3.869 empresas).
- O D1 aceitou o arquivo inteiro de uma vez: **22.657 linhas gravadas, 4 tabelas, 1 tentativa**, sem precisar
  dividir em lotes.
- **A tabela `prospeccao` não é apagada pelo reimport.** O SQL gerado não tem nenhum `DELETE`, `DROP` ou
  `TRUNCATE` (conferido no arquivo). A única coisa que ele faz com `prospeccao` é um `UPDATE ... SET
  empresa_chave` que migra a chave quando um lead que não tinha telefone passa a ter, e só quando isso não
  conflita com uma linha já existente.

## Erros de validação

**38 linhas** ignoradas na importação (contra 248 na rodada anterior). Nenhum arquivo de entrada foi modificado.

| Arquivo | Linhas | Válidas | Com erro |
| --- | --- | --- | --- |
| `grupos.csv` | 280 | 279 (205 ativos) | 1 |
| `grupos_outros.csv` | 123 | 123 (85 ativos) | 0 |
| `grupos_staging2.csv` | 136 | 136 (119 ativos) | 0 |
| `grupos_staging3.csv` | 10 | 10 (4 ativos) | 0 |
| `grupos_staging4.csv` | 20 | 20 (5 ativos) | 0 |
| `empresas_final.csv` | 3.906 | 3.869 | 37 |

Motivos: 1 grupo com `categoria inválida "classificados"`, 36 empresas com `estado vazio` e 1 com
`estado desconhecido "TE"` (linha 3383, X-Picanha Bras-Mex Churrasco: parece "TX" digitado errado).
São 38 linhas de correção no CSV, não defeito do sistema. A categoria `universidade`, que derrubava
100 linhas antes, agora é aceita.

Os 146 códigos de grupo repetidos entre arquivos foram mesclados por `codigo` (o lote mais recente vence),
não duplicados.

## Reimportar depois (quando os CSVs mudarem)

```bash
cd "/Users/macbook/Leon Group - Buit To Lead /conecta-brasil-eua"
bash scripts/reimport.sh dados-import    # a pasta usada nesta rodada
bash scripts/reimport.sh                 # mesma coisa: dados-import/ é o padrão
bash scripts/reimport.sh outra-pasta     # outra pasta do coletor
bash scripts/reimport.sh --sql-pronto    # reexecuta o out/import.sql que já existe
```

É idempotente: pode rodar quantas vezes quiser. Não duplica, não desfaz revalidação mais nova, não apaga
campo já preenchido e não mexe no status de prospecção. Valida, gera `out/import.sql`, executa no D1 remoto
(dividindo em lotes se precisar) e imprime no fim as contagens de grupos, empresas, empresas por confiança
e linhas de `prospeccao`. Não precisa de token: usa o login OAuth do wrangler deste Mac.

Deploy completo (código mais migrations mais dados) de novo:

```bash
bash scripts/deploy.sh dados-import
```

## Proteger o site: Cloudflare Access só com o e-mail do Leon

Continua **pendente** e continua sendo o próximo passo. Faça na ordem. O plano Zero Trust Free cobre até
50 usuários; a Cloudflare pode pedir um meio de pagamento para criar a organização, mesmo no Free. Essa
decisão é sua, não foi feita aqui.

**1. Criar a aplicação**

1. Painel da Cloudflare, *Workers & Pages* → `conecta-brasil-eua` → **Settings → Domains & Routes**.
2. Na linha **workers.dev**, clique em **Enable Cloudflare Access**. Na primeira vez ele pede para criar a
   organização Zero Trust: escolha um **team name** (ex.: `leon`) e o plano **Free ($0)**.
   - Caminho alternativo, se preferir criar à mão: *Zero Trust → Access → Applications → Add an application
     → **Self-hosted***, e em *Application domain* use `conecta-brasil-eua.minnverso-jogo.workers.dev`.
     Session duration: 1 mês.

**2. Política de acesso**

3. Abra a aplicação → **Policies** → crie ou edite:
   - *Action*: **Allow**
   - *Include* → **Emails** → `leongroup.builtolead@gmail.com` (**apenas** esse)
   - Apague qualquer outra regra que exista ("Everyone", "Emails ending in...").
4. Em *Login methods*, deixe **One-time PIN** (código por e-mail). Não precisa de senha nem de provedor externo.

**3. Travar também dentro do Worker (recomendado)**

Assim, se a política do painel for desligada por engano, o próprio Worker recusa com 403 quem não tem o JWT
do Access. Só `/healthz` continua aberto.

5. *Zero Trust → Access → Applications → (a sua app) → Overview/Configure*, copie o **Application Audience (AUD) Tag**.
6. O **team domain** é `<team-name>.cloudflareaccess.com` (*Zero Trust → Settings → General*).
7. Rode, nesta pasta:

```bash
ACCESS_AUD=<AUD-Tag> ACCESS_TEAM_DOMAIN=<team-name>.cloudflareaccess.com SKIP_IMPORT=1 bash scripts/deploy.sh
```

O script grava as duas variáveis no `[vars]` do `wrangler.toml` e republica o Worker. Não mexe nos dados
(`SKIP_IMPORT=1`). O cron não passa por HTTP e continua funcionando.

**4. Testar**

```bash
curl -i https://conecta-brasil-eua.minnverso-jogo.workers.dev/empresas   # deve virar redirect pro login do Access, ou 403
curl    https://conecta-brasil-eua.minnverso-jogo.workers.dev/healthz    # deve continuar respondendo "ok"
```

E em janela anônima: abrir a URL, aparece a tela do Access pedindo e-mail, o código chega no e-mail do Leon.
Outro e-mail não entra.

## O que foi mexido no código nesta rodada

- Interface nova aplicada por cima da pasta (`src/`, `tests/`, `scripts/lib.ts`, `scripts/import-csvs.ts`,
  `migrations/0003`). Backup do que havia antes em `/tmp/conecta-bkp-0146/`.
- `scripts/deploy.sh`: mantida a correção da rodada anterior (`${DB_NAME}...`, porque o bash 3.2 do macOS
  engole o caractere de reticências colado no nome da variável). `comum.sh` e a autenticação por OAuth
  seguem como estavam.
- `scripts/reimport.sh`: passou a imprimir também as empresas por confiança e o total de `prospeccao`.
  O resto do script não mudou e continua funcionando com o `import-csvs.ts` novo.
- `README.md`: rotas novas (`/estados`, `/categorias`, `/como-utilizar`), prospecção e confiança, a regra do
  `empresas_final.csv` com precedência sobre os `leads_*.csv`, e a migration `0003` na estrutura.

Testes antes do deploy: **88 testes em 8 arquivos, todos passando**, e `tsc --noEmit` limpo.

## Pendente

- **Cloudflare Access não foi ativado**, porque exige o painel e uma decisão sua sobre a organização Zero
  Trust. Até lá a URL é pública.
- **38 linhas de CSV para corrigir** (ver acima), se você quiser esses grupos e empresas no ar.
- **33 empresas sem classificação de confiança**, sobra da importação antiga, esperando sua decisão.
