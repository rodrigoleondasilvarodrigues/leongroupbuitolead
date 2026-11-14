# Deploy — Conecta Brasil-EUA (Grupos + Empresas)

Tudo cabe no **plano gratuito** da Cloudflare (Workers Free, D1 Free, Cron Triggers, Zero Trust Free até 50 usuários).
O site inteiro (grupos **e** empresas, inclusive as exportações CSV) fica atrás do **Cloudflare Access**: só o e-mail do Leon entra.

## 1. O que o Leon precisa providenciar
1. **Conta Cloudflare** (gratuita) — https://dash.cloudflare.com/sign-up
2. **Subdomínio workers.dev**: no painel, *Workers & Pages* → escolher o subdomínio (só na primeira vez).
3. **Autenticação do wrangler** — escolha UMA opção:
   - **Mais simples (manual):** `npx wrangler login` (abre o navegador e autoriza).
   - **Ou um API Token** (obrigatório para o `scripts/deploy.sh`): *My Profile → API Tokens → Create Token → Custom token*, com:
     | Escopo | Permissão | Nível |
     |---|---|---|
     | Account | Workers Scripts | Edit |
     | Account | D1 | Edit |
     | Account | Account Settings | Read |
     | User | User Details | Read |
     | User | Memberships | Read |
     | Zone *(só se usar domínio próprio)* | Workers Routes | Edit |
     | Zone *(só se usar domínio próprio)* | Zone | Read |

     *Account Resources*: incluir apenas a sua conta. Depois:
     ```bash
     export CLOUDFLARE_API_TOKEN=...      # o token
     export CLOUDFLARE_ACCOUNT_ID=...     # Workers & Pages → lado direito "Account ID"
     ```
4. **O e-mail do Leon** que terá acesso (único e-mail na política do Access).
5. A **pasta do coletor** com `grupos.csv`, `grupos_outros.csv` e `leads_*.csv` (ou o `out/import.sql` já gerado).
6. *(Opcional)* domínio próprio já na Cloudflare.

## 2. Criar o banco, publicar e carregar os dados

### Opção rápida — script não interativo
```bash
npm install
export CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=...
bash scripts/deploy.sh <pasta-do-coletor>     # ou: npm run deploy:remote -- <pasta-do-coletor>
```
Faz, em ordem: testes → cria o D1 `conecta-db` se não existir → grava o `database_id` no `wrangler.toml` →
`migrations apply --remote` → `wrangler deploy` → gera e executa `out/import.sql` no D1 remoto.
Pode rodar de novo quando os CSVs crescerem (tudo é idempotente). Sem pasta, usa o `out/import.sql` existente;
`SKIP_IMPORT=1` pula os dados. Depois vá direto ao **passo 3 (Access)**.

### Opção manual — passo a passo
1. Instalar e conferir:
   ```bash
   npm install
   npm test
   ```
2. Criar o banco D1:
   ```bash
   npx wrangler d1 create conecta-db
   ```
3. **Colar o id**: copie o `database_id` impresso e cole em `wrangler.toml`, substituindo `00000000-0000-0000-0000-000000000000`:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "conecta-db"
   database_id = "<cole-aqui>"
   ```
4. Criar as tabelas (aplica `0001_init.sql` e `0002_empresas.sql`):
   ```bash
   npx wrangler d1 migrations apply conecta-db --remote
   ```
5. Publicar o Worker (com o cron diário):
   ```bash
   npx wrangler deploy
   #   → https://conecta-brasil-eua.<seu-subdominio>.workers.dev
   ```
   > ⚠️ Faça o **passo 3 (Access) logo em seguida**: até lá o site fica público.
6. Gerar e carregar os dados (grupos + empresas):
   ```bash
   npm run validate   -- --dir <pasta-do-coletor>     # dry-run: relatório por arquivo/linha
   npm run import:sql -- --dir <pasta-do-coletor>     # gera out/import.sql
   npx wrangler d1 execute conecta-db --remote --file=out/import.sql
   ```
   Pode repetir sempre que os arquivos crescerem: é upsert (grupos por `codigo`, empresas por telefone ou
   empresa+cidade+estado), não duplica, não desfaz revalidações mais novas e não apaga campos já preenchidos.
   Alternativa: enviar os CSVs pela tela `/admin/importar` (aceita vários arquivos, grupos e empresas juntos).

> Banco que já existia (só com a migration 0001)? Basta o passo 4: a `0002` só **adiciona** a coluna `grupos.nicho`
> (vazia por padrão) e a tabela `empresas`; nada é apagado.

## 3. Cloudflare Access (Zero Trust Free) — só o e-mail do Leon entra

### Opção A — workers.dev (um clique)
1. Painel → *Workers & Pages* → `conecta-brasil-eua` → **Settings → Domains & Routes**.
2. Na linha **workers.dev**, clique em **Enable Cloudflare Access** (ative também para *Preview URLs*, se aparecer).
   Na primeira vez, o painel pede para criar a organização Zero Trust: escolha um **team name** (ex.: `leon`) e o plano **Free ($0)**.
   *Obs.: a Cloudflare pode pedir um meio de pagamento mesmo no plano Free — a decisão é sua; o plano Free não cobra até 50 usuários.*
3. Clique em **Manage Cloudflare Access** (ou *Zero Trust → Access → Applications*) e abra a aplicação criada.
4. Em **Policies**, edite/crie a política:
   - *Action*: **Allow**
   - *Include* → **Emails** → `<email-do-leon>` (**apenas** esse)
   - Remova qualquer outra regra (ex.: "Emails ending in", "Everyone").
5. Em *Login methods*, deixe **One-time PIN** (código por e-mail) — não precisa de senha nem de IdP.

### Opção B — domínio próprio
1. *Workers & Pages → conecta-brasil-eua → Settings → Domains & Routes → Add → Custom domain* (ex.: `grupos.seudominio.com`).
2. *Zero Trust → Access → Applications → Add an application → Self-hosted*.
   - Application domain: `grupos.seudominio.com` (e, se mantiver o workers.dev, adicione também `conecta-brasil-eua.<sub>.workers.dev`).
   - Session duration: ex. 1 mês.
3. Policy: **Allow** → Include → **Emails** → `<email-do-leon>`. Login method: **One-time PIN**.
4. Recomendo `workers_dev = false` no `wrangler.toml` + `npx wrangler deploy`, para não sobrar URL desprotegida.

### Verificação extra no Worker: `ACCESS_AUD` + `ACCESS_TEAM_DOMAIN` (recomendada)
Com isso, mesmo que a política do painel seja desligada por engano, o Worker recusa (403) qualquer requisição sem JWT
válido do Access — em todas as rotas, incluindo `/empresas` e `/empresas/exportar.csv` (só `/healthz` fica aberto).
1. *Zero Trust → Access → Applications → (sua app) → Overview/Configure* → copie o **Application Audience (AUD) Tag**.
2. O **team domain** é `<team-name>.cloudflareaccess.com` (*Zero Trust → Settings → Custom Pages* ou *General*).
3. Grave as duas variáveis — escolha um:
   - **Script:** `ACCESS_AUD=<AUD> ACCESS_TEAM_DOMAIN=<team>.cloudflareaccess.com SKIP_IMPORT=1 bash scripts/deploy.sh`
   - **Manual:** em `wrangler.toml`, `[vars]`, descomente e preencha, depois `npx wrangler deploy`:
     ```toml
     ACCESS_AUD = "<AUD Tag>"
     ACCESS_TEAM_DOMAIN = "<team-name>.cloudflareaccess.com"
     ```
   O cron não passa por HTTP e continua funcionando.

### Testar
- Janela anônima → abrir a URL → deve aparecer a tela do Access pedindo e-mail → código chega no e-mail do Leon.
- Outro e-mail não recebe acesso.
- `curl -i https://conecta-brasil-eua.<sub>.workers.dev/empresas` sem cookie → redireciona para o login do Access (ou 403).
- `curl https://…/healthz` → `ok` (único endpoint sem login).

## 4. Operação
- Logs do cron: *Workers & Pages → conecta-brasil-eua → Logs* ou `npx wrangler tail`.
- Ajustar volume: `CHECK_BATCH` (padrão 20/dia; máx. 40 no código) e `CHECK_DELAY_MS` em `wrangler.toml`.
  Com 20/dia, 600 links levam ~30 dias para um ciclo completo; se quiser mais rápido, mude o cron para
  várias vezes ao dia (ex.: `"0 */6 * * *"`) — continua no plano gratuito.
- Atualizar dados: `npm run import:sql -- --dir <pasta>` + `npx wrangler d1 execute conecta-db --remote --file=out/import.sql`
  (ou `bash scripts/deploy.sh <pasta>`).
- Backup: `/admin/exportar.csv` (grupos), `/empresas/exportar.csv` (empresas) ou
  `npx wrangler d1 export conecta-db --remote --output=backup.sql`.
