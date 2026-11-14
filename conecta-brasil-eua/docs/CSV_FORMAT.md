# Formato oficial do CSV — Conecta Brasil-EUA

Há dois tipos de CSV: **grupos** (links de WhatsApp) e **empresas** (leads B2B). Ambos: **UTF-8, com cabeçalho**,
separador vírgula, aspas duplas para campos com vírgula/aspas/quebra de linha (RFC 4180). BOM é aceito.

**Detecção automática do tipo** (tela de importação e scripts): cabeçalho com `codigo` + `link` → grupos;
com `empresa` + `telefone_comercial` → empresas; outro cabeçalho → arquivo ignorado com aviso.

## Grupos

O cabeçalho deve conter **exatamente** estas 10 colunas, mais a opcional `nicho` (a ordem pode variar; colunas
ausentes, extras ou duplicadas invalidam o arquivo inteiro):

| Coluna | Obrigatória | Regra |
|---|---|---|
| `codigo` | sim | Código do convite (chave única). 10–40 letras/números. Deve ser igual ao código no `link`. |
| `link` | sim | `https://chat.whatsapp.com/<codigo>` |
| `nome_grupo` | não | Até 200 caracteres. Vazio gera aviso: o app mostra um nome provisório ("Grupo <categoria> · <cidade>") e a revalidação preenche com o nome público do convite, se encontrado. |
| `estado` | sim | Sigla de 2 letras dos EUA (ex.: `FL`, `MA`, `NJ`; aceita também `DC`, `PR`). Maiúsc./minúsc. tanto faz. |
| `cidade` | não | Vazio = grupo do estado inteiro (gera aviso, não erro). |
| `categoria` | sim | Uma de: `empregos`, `moradia`, `compra-e-venda`, `servicos`, `uber-delivery`, `igrejas`, `mulheres`, `imigracao`, `eventos`, `geral`. |
| `fonte_url` | não | URL `http(s)://` onde o link foi encontrado. |
| `data_coleta` | não* | `YYYY-MM-DD` (vazio gera aviso). |
| `status` | não* | `ativo`, `expirado` ou `indeterminado` (vazio vira `indeterminado` com aviso). |
| `ultima_validacao` | não | `YYYY-MM-DD` ou vazio. |
| `nicho` | **opcional** (coluna) | Texto livre curto (até 60), gravado em minúsculas (ex.: `limpeza`, `comida`). CSVs sem a coluna continuam válidos. Aparece no card, vira filtro em `/grupos` e sai na exportação. |

Rótulos exibidos no app (pt-BR): Empregos, Moradia, Compra e venda, Serviços,
Uber e delivery, Igrejas, Mulheres, Imigração, Eventos, Geral.

## Importação (grupos)
- **Vários arquivos**: o coletor grava `grupos.csv` (9 estados prioritários), `grupos_outros.csv` (demais estados) e, quando aparece material novo, outros lotes `grupos_<nome>.csv` — todos com o mesmo formato e todos importados (`--dir` pega qualquer `grupos*.csv`). A tela de importação aceita vários arquivos de uma vez, e os scripts aceitam `--dir <pasta>`. Os arquivos crescem com o tempo e dados parciais são normais.
- **Upsert por `codigo`**: código novo → insere; código existente → atualiza.
  - `status` só é sobrescrito se a `ultima_validacao` do CSV for **≥** à do banco (não desfaz uma revalidação mais recente feita pelo cron).
  - `nome_grupo` e `nicho` vazios no CSV **não apagam** um valor já conhecido.
- **Código repetido entre arquivos**: mesclado; vence a linha com `ultima_validacao` mais recente, depois `data_coleta` mais recente, e em empate o último arquivo. O relatório lista as ocorrências e os campos divergentes.
- **Grafias alternativas de categoria** são normalizadas, com aviso: `compra_e_venda` → `compra-e-venda`, `delivery`/`uber`/`uber_delivery` → `uber-delivery`. `classificados` **não** está na lista oficial e continua sendo erro.
- Linhas com erro são ignoradas e listadas no relatório (linha, código, motivo). Linhas válidas são importadas.
- `codigo` repetido dentro do mesmo arquivo: a primeira ocorrência vale, as demais viram erro.
- A exportação (`/admin/exportar.csv`) gera exatamente este formato, já com a coluna `nicho` (round-trip).

## Empresas (leads B2B)

Cabeçalho com **exatamente** estas 14 colunas (ordem livre; ausentes/extras/duplicadas invalidam o arquivo).
Um arquivo **só com o cabeçalho** é aceito (aviso "nada a importar") — os coletores criam o arquivo antes de preencher.

| Coluna | Obrigatória | Regra |
|---|---|---|
| `empresa` | sim | Nome do negócio, até 200 caracteres. |
| `nicho` | não* | Texto livre, gravado em minúsculas (ex.: `comida`, `limpeza`, `construcao`, `beleza`). Vazio gera aviso. |
| `cidade` | não* | Vazia gera aviso; texto que parece outro campo (frase longa, números) gera aviso "cidade suspeita". |
| `estado` | sim | Sigla de 2 letras dos EUA (aceita `DC`, `PR`). |
| `telefone_comercial` | não | Qualquer formatação (`(407) 555-0101`, `+1 407…`). Vários números na célula (`a / b`, `a; b`) → a chave usa o primeiro (aviso). `+55` e números fora de 10 dígitos geram aviso. |
| `site`, `instagram`, `facebook` | não | URL `http(s)://`. `@perfil` no Instagram e `dominio.com` sem `https://` são convertidos (aviso). |
| `google_nota` | não | Número 0–5 (`4,7` vira `4.7`). Inválido → aviso e fica vazio. |
| `google_avaliacoes` | não | Inteiro (`1.234` vira `1234`). Inválido → aviso e fica vazio. |
| `indicio_brasileiro` | não | Itens separados por `;` (ex.: `nome em português; listado no Guia Brazusa`). |
| `oportunidade_marketing` | não | Texto livre (o filtro "Oportunidade contém…" procura aqui). |
| `fonte_url` | não | Uma ou mais URLs `http(s)://` separadas por espaço ou `\|`. Não-URLs são descartadas com aviso. |
| `data_coleta` | não* | `YYYY-MM-DD`. Inválida → aviso e tratada como vazia. |

Só **empresa vazia, estado inválido/vazio ou número de colunas errado** derrubam a linha (erro). O resto vira aviso,
para não perder o lead por um detalhe.

### Deduplicação (chave)
1. **Telefone**: só os dígitos do (primeiro) número; se tiver 11 dígitos começando com `1`, tira o `1` → `tel:4075550101`.
2. **Sem telefone**: `empresa|cidade|estado` em minúsculas, sem espaços extras → `nome:café brasil|orlando|fl`.
3. Um lead **sem telefone** casa com o mesmo `empresa+cidade+estado` que tenha telefone (no mesmo lote ou já no banco).
   Se o banco tinha o lead sem telefone e ele aparece com telefone, o registro é **promovido** para a chave do telefone (sem duplicar).

> ⚠ Filiais que publicam o **mesmo telefone** viram uma empresa só (regra da chave). O relatório marca esses casos com
> "nomes/cidades diferentes — confira".

### Mescla / upsert (igual na tela, no `import:local` e no `out/import.sql`)
- Campos simples: vence a linha com **`data_coleta` mais nova** (empate → a que chega depois, i.e. o último arquivo).
- **Vazio nunca apaga** um valor conhecido (nem quando a linha vazia é a mais nova).
- `indicio_brasileiro` e `fonte_url`: **união** sem repetição (mantém a ordem; ignora maiúsc./minúsc.).
- `data_coleta` final = a maior.
- Reimportar o mesmo arquivo não muda nada (idempotente).

### Exportação
`/empresas/exportar.csv` (aceita os mesmos filtros da tela: `?nicho=&estado=&cidade=&oport=&q=`) gera exatamente
estas 14 colunas — dá para reimportar.

## Validação local (dry-run, não altera nada)
```bash
npm run validate -- --dir <pasta-do-coletor>      # todos os grupos*.csv e leads_*.csv
npm run validate -- a.csv b.csv [--json]
```
Com `--dir`: usa **todos** os `grupos*.csv` (inclusive lotes extras, tipo `grupos_staging2.csv`) e todos os
`leads_*.csv`; avisa quando falta algum dos esperados
(`leads_empresas.csv`, `leads_frente1.csv`, `leads_frente2.csv`, `leads_claudinho.csv`, `leads_frank.csv`) e segue;
**ignora** `*.bak*.csv` e `staging_*.csv`.

Mostra, por arquivo: linhas, válidas, erros (linha a linha), avisos por tipo e contagens (grupos: status/estado/categoria;
empresas: inseridas/mescladas/ignoradas, nicho, estado), além do total mesclado, dos códigos de grupo repetidos entre
arquivos e das chaves de empresa com 2+ linhas. Sai com código 1 se houver linhas com erro.

## Importação por linha de comando
```bash
npm run import:local -- --dir <pasta-do-coletor>   # grava no D1 local (.wrangler/) e mostra novos x mesclados
npm run import:sql   -- --dir <pasta-do-coletor>   # só gera out/import.sql (grupos + empresas)
npx wrangler d1 execute conecta-db --remote --file=out/import.sql   # D1 remoto (após o deploy)
```

## Exemplo
Grupos: `data/sample-groups.csv` (todas as linhas são **fictícias**, com códigos `EXEMPLOFAKE…`).
Empresas: `data/sample-empresas.csv` (fictício, telefones `555`).
