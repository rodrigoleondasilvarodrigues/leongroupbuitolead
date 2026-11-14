# Conecta Brasil-EUA

Ferramenta **privada** (uso pessoal do Leon) com duas seções:
- **Grupos**: links de convite de grupos de WhatsApp de brasileiros nos EUA.
- **Empresas**: lista de leads B2B (negócios brasileiros nos EUA) para a agência de marketing do Leon.

Interface em português, mobile-first.

- **Sem login/senha/assinatura**: a proteção é o **Cloudflare Access** na frente do site todo (grupos **e** empresas)
  (configurado no painel; ver [DEPLOY.md](DEPLOY.md)). O Worker pode, opcionalmente, conferir o
  JWT do Access (`ACCESS_AUD` + `ACCESS_TEAM_DOMAIN`); em dev local a checagem é ignorada.
- **Stack** (plano gratuito da Cloudflare): 1 Worker em TypeScript (Hono) + D1 + Cron Trigger.

## Funcionalidades
| Página | O que faz |
|---|---|
| `/` | Painel: grupos ativos, estados, cidades, contagem por status e por categoria **+ painel de Empresas** (total, com telefone/Instagram, barras por nicho e por estado). |
| `/grupos` | Biblioteca em cards. Clique abre o `chat.whatsapp.com` em nova aba (`rel=noopener`). Por padrão só `ativo`; caixa "Mostrar expirados/indeterminados". Filtros por estado, cidade, categoria, **nicho** (quando houver), busca e paginação. |
| `/estado/:uf`, `/categoria/:slug` | Mesma biblioteca já filtrada. |
| `/estados`, `/categorias` | Índices navegáveis: um card por estado e por categoria, com as contagens. |
| `/como-utilizar` | Página de uso: da pesquisa à próxima conexão. |
| `/empresas` | Leads B2B em cards (telefone clicável, site/Instagram/Facebook, nota Google, indício brasileiro, oportunidade de marketing, fontes). Filtros: **nicho, estado, cidade, oportunidade** ("contém", com atalhos tipo *sem Instagram*, *sem site*), **busca em todos os campos** (cada palavra precisa aparecer; telefone casa só pelos dígitos). |
| `/empresas` (prospecção) | Em cada empresa: **status de prospecção** (não contatado, contatado, respondeu, cliente), data do contato e observação, editáveis no site. Ficam na tabela `prospeccao`, separada: **o reimport dos CSVs nunca apaga nem sobrescreve**. Filtro por status e por **confiança de que a empresa é brasileira** (alta/média/baixa). |
| `/empresas/exportar.csv?…` | Exporta **o resultado filtrado** (mesmos parâmetros da tela) no formato oficial do CSV de empresas. |
| `/admin` | Lista todos os links; criar/editar/excluir; marcar como expirado; **Revalidar agora**; exportar CSV de grupos/empresas. |
| `/admin/importar` | Importa 1 ou vários CSVs **de grupos e de empresas misturados** (tipo detectado pelo cabeçalho): pré-visualização por arquivo, erros por linha, duplicados/mesclas, depois confirma. |
| Cron diário | Revalida um lote pequeno de links (os verificados há mais tempo). |

### Revalidação de links
- Faz apenas **GET na página pública** `https://chat.whatsapp.com/<codigo>`. **Nunca entra em grupos**,
  não segue o botão "entrar", não envia cookies.
- Heurísticas isoladas em `src/linkcheck.ts` (testadas com fixtures **sintéticas** em `tests/fixtures/`):
  `og:title` com nome → ativo; `og:title` vazio/genérico ou texto de "link redefinido" ou HTTP 404/410 → expirado;
  o resto (429, 5xx, erro de rede, HTML desconhecido) → indeterminado (não altera o status).
- Um link só passa para **expirado após 2 verificações seguidas** indicando revogação.
- Lotes: cron = `CHECK_BATCH` (padrão 20) links/dia; botão = até 10 por clique; pausa de `CHECK_DELAY_MS` (1,5 s) entre requisições.
- Script standalone (Node): `npx tsx scripts/revalidate.ts entrada.csv saida.csv --limit 50 --delay 2000` (nunca altera a entrada).

## Rodar localmente
```bash
npm install
npm run db:migrate:local      # cria o D1 local (.wrangler/)
npm run db:seed:local         # opcional: carrega data/sample-groups.csv (dados fictícios)
npm run dev                   # http://localhost:8787
```
Testar o cron localmente: `npx wrangler dev --test-scheduled` e abrir `http://localhost:8787/__scheduled`.

### Empresas: deduplicação e mescla
- **Chave**: telefone comercial só com dígitos (tira o `1` dos EUA quando tem 11 dígitos; célula com vários telefones usa o primeiro). Sem telefone → `empresa + cidade + estado` em minúsculas.
  Um lead sem telefone casa com o mesmo `empresa+cidade+estado` que tenha telefone (e um registro antigo sem telefone é promovido quando o telefone aparece).
- **Upsert**: a linha com `data_coleta` mais nova vence; **um valor vazio nunca apaga um valor conhecido**; `indicio_brasileiro` e `fonte_url` são **unidos** sem repetição.
- A mesma regra roda na tela, no `import:local` e no `out/import.sql` (o SQL é o mesmo texto; testado em SQLite real).
- Detalhes em [docs/CSV_FORMAT.md](docs/CSV_FORMAT.md#empresas-leads-b2b).

## Testes
```bash
npm test          # vitest: CSV, heurísticas de link, Access, empresas (chave, mescla, upsert SQL), detecção de cabeçalho
npm run typecheck
```

## CSV
Formatos oficiais (grupos e empresas) em [docs/CSV_FORMAT.md](docs/CSV_FORMAT.md). Os scripts aceitam vários arquivos
e detectam o tipo de cada um pelo cabeçalho. Com `--dir <pasta>` usam **todos os `grupos*.csv`** (`grupos.csv`,
`grupos_outros.csv` e qualquer outro lote, tipo `grupos_staging2.csv`). Para empresas, usam **`empresas_final.csv`**
se ele existir na pasta (e aí **ignoram os `leads_*.csv`**); sem ele, usam **todos os `leads_*.csv`** (avisam se algum
dos esperados faltar ou vier só com cabeçalho, e seguem). Sempre ignoram `*.bak*.csv` e `staging_*.csv`.
```bash
npm run validate     -- --dir <pasta-do-coletor>          # dry-run: relatório por arquivo e por linha (não grava nada)
npm run validate     -- grupos.csv leads_empresas.csv     # ou arquivos avulsos
npm run import:local -- --dir <pasta-do-coletor>          # grava no D1 local (rode antes: npm run db:migrate:local)
npm run import:sql   -- --dir <pasta-do-coletor>          # gera out/import.sql (grupos + empresas) para o D1 remoto
npm run reimport                                          # valida + gera + executa no D1 REMOTO (padrão: dados-import/)
```
Os arquivos de entrada **nunca** são modificados.
A pasta `dados-import/` (CSVs do coletor, com telefones reais) e `out/` estão no `.gitignore`: não vão para o git.

## Deploy
Passo a passo em [DEPLOY.md](DEPLOY.md). Há também `scripts/deploy.sh` (não interativo): cria o D1 se faltar, grava o
`database_id`, aplica migrations, publica o Worker e importa os dados.
Autenticação: usa `CLOUDFLARE_API_TOKEN` se estiver definido; **sem token, usa o login OAuth do `npx wrangler login`**
(e para na hora, sem publicar nada, se não houver login válido). `CLOUDFLARE_ACCOUNT_ID` é opcional: sem ele, usa a
primeira conta listada no `wrangler whoami` (e avisa quando há mais de uma).
```bash
bash scripts/deploy.sh dados-import     # infra + código + dados
```

### Reimportar os dados (sem republicar o Worker)
```bash
bash scripts/reimport.sh                # pasta padrão: dados-import/
bash scripts/reimport.sh <pasta>        # outra pasta do coletor
bash scripts/reimport.sh --sql-pronto   # executa o out/import.sql que já existe
```
Um comando só: valida os CSVs (relatório por arquivo e por linha), gera `out/import.sql`, executa no **D1 remoto** e
imprime as contagens finais (grupos, grupos ativos, empresas, empresas por confiança e o total de linhas de
`prospeccao`, que serve de prova de que o status editado no site sobreviveu). É **upsert idempotente** (pode rodar quantas vezes
quiser) e, se o D1 recusar o arquivo inteiro por tamanho, ele divide em lotes e tenta de novo automaticamente.

## Estrutura
```
src/index.ts       rotas (Hono) + handler do cron
src/views.ts       HTML/CSS (sem dependências de front-end)
src/db.ts          consultas D1 (grupos), upsert, revalidação em lote
src/csv.ts         parser/validador/exportador de CSV (grupos) + detecção do tipo pelo cabeçalho
src/empresas.ts    empresas: validação, chave, mescla, SQL de upsert, consultas/filtros/painel
src/importar.ts    importação mista (classifica cada arquivo e valida com o módulo certo)
src/linkcheck.ts   heurísticas de validade do convite (único lugar)
src/access.ts      verificação opcional do JWT do Cloudflare Access
src/constants.ts   categorias, status, estados
migrations/        schema D1 (0001 grupos; 0002 empresas + grupos.nicho; 0003 confianca_brasileira + prospeccao)
scripts/           validate-csv, import-csvs, revalidate (Node); deploy.sh, reimport.sh, comum.sh (auth/lotes) + deploy-helpers.mjs
tests/             vitest + fixtures sintéticas
```
