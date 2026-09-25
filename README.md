# Rastro — Monstros S.A.

Rede social para registrar, visualizar e compartilhar avistamentos do Pé Grande.

| Pasta              | O que é                                                            |
| ------------------ | ------------------------------------------------------------------ |
| `Front_End/`       | Site (React + TypeScript + Vite) — ver [Front_End/README.md](Front_End/README.md) |
| `Back_end/`        | API (Express + TypeScript) — ver [Back_end/README.md](Back_end/README.md) |
| `prisma/`          | Schema, migrações e dados de exemplo do banco (PostgreSQL)         |
| `render.yaml`      | Configuração de hospedagem no Render (API + site)                  |

## Rodar no computador

Pré-requisito: Node.js 22.12 ou mais novo.

**Só o site, sem banco (modo mock):**

```bash
cd Front_End && npm install && npm run dev      # http://localhost:5173
```

**Site + API + banco:**

```bash
npm install                        # dependências da API (na raiz)
cp .env.example .env               # preencha DATABASE_URL (banco local)
npm run db:deploy                  # cria as tabelas
npm run db:seed                    # dados de exemplo (só se o banco estiver vazio)
npm run dev                        # API em http://localhost:3333

# em outro terminal
cd Front_End && npm install
VITE_API_URL=http://localhost:3333 npm run dev
```

Banco local sem Docker: `npx prisma dev --name rastro` mostra uma URL "TCP" para usar no `DATABASE_URL`
(com `DATABASE_POOL_MAX=1`).

Conta de exemplo (só no modo mock e em bancos locais com `npm run db:seed`): `victor@rastro.app` / `pegada123`.

## Colocar no ar (tudo no Render)

O `render.yaml` cria três coisas de uma vez: o banco PostgreSQL (`rastro-db`), a API (`rastro-api`)
e o site (`rastro-web`), já ligados entre si.

1. Em render.com, entre com o GitHub e vá em **New → Blueprint**.
2. Escolha este repositório e clique em **Apply**. Não é preciso preencher nada: a API recebe a conexão
   com o banco automaticamente e aplica as tabelas ao iniciar.
3. Confira os endereços criados. Se o Render não conseguir usar `rastro-api.onrender.com` e
   `rastro-web.onrender.com` (nomes já em uso), ele cria outros — nesse caso:
   - na API (`rastro-api` → **Environment**), ajuste `CORS_ORIGIN` para o endereço do site;
   - no site (`rastro-web` → **Environment**), ajuste `VITE_API_URL` para o endereço da API e publique
     de novo com **Manual Deploy → Clear build cache & deploy**.
4. A cada `git push` na `main`, o Render publica a versão nova sozinho.

O site publicado começa **vazio**, só com usuários reais. Os dados de exemplo (`npm run db:seed`) são
só para desenvolvimento local.

**Limites do plano gratuito**

- **Banco:** o PostgreSQL gratuito do Render **expira 30 dias após a criação**. Depois disso há um prazo
  curto para passar para um plano pago antes de os dados serem apagados. Ele tem 1 GB de espaço
  (cabem milhares de fotos comprimidas).
- **API:** "dorme" depois de 15 minutos parada; a primeira visita pode levar até ~1 minuto (o site avisa
  "Acordando o servidor…").
- O banco só aceita conexões da rede interna do Render (`ipAllowList: []`). Para acessá-lo do seu
  computador (ex.: Prisma Studio), libere seu IP em `rastro-db` → **Networking** e use a
  **External Database URL**.
