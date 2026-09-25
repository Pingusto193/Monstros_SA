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
cp .env.example .env               # preencha DATABASE_URL (Supabase ou banco local)
npm run db:deploy                  # cria as tabelas
npm run db:seed                    # dados de exemplo (só se o banco estiver vazio)
npm run dev                        # API em http://localhost:3333

# em outro terminal
cd Front_End && npm install
VITE_API_URL=http://localhost:3333 npm run dev
```

Banco local sem Docker: `npx prisma dev --name rastro` mostra uma URL "TCP" para usar no `DATABASE_URL`
(com `DATABASE_POOL_MAX=1`).

Conta de exemplo: `victor@rastro.app` / `pegada123` (todos os usuários de exemplo usam a mesma senha).

## Colocar no ar (Supabase + Render)

1. **Banco (Supabase):** crie um projeto em supabase.com (região São Paulo). Em **Connect → Session pooler**
   copie a URI (porta 5432) e troque `[YOUR-PASSWORD]` pela senha do banco.
2. **Tabelas e dados:** não precisa fazer nada — a cada deploy o Render aplica as migrações e, se o banco
   estiver vazio, carrega os dados de exemplo (`npm run db:seed`).
3. **Hospedagem (Render):** em render.com, **New → Blueprint** e escolha este repositório.
   O `render.yaml` cria dois serviços:
   - `rastro-api` — peça `DATABASE_URL` (a mesma URI do Supabase) e `CORS_ORIGIN` (endereço do site).
   - `rastro-web` — peça `VITE_API_URL` (endereço da API).
   Como os endereços só existem depois de criados, na primeira vez preencha com os nomes previstos
   (`https://rastro-api.onrender.com` e `https://rastro-web.onrender.com`) e, se o Render usar outro
   endereço, corrija em **Environment** e faça um novo deploy.
4. A cada `git push` na `main`, o Render publica a versão nova sozinho.

Observações do plano gratuito: a API "dorme" depois de 15 minutos parada e a primeira visita pode levar
até ~1 minuto (o site avisa "Acordando o servidor…"). O banco gratuito do Supabase pausa após 1 semana
sem uso — é só reativar no painel.
