# Rastro — API

Express 5 + TypeScript (executado com `tsx`) + Prisma 7 + PostgreSQL.
O `package.json`, o `prisma/` e o `.env` ficam na **raiz** do repositório.

## Scripts (rodar na raiz)

| Script                   | O que faz                                                   |
| ------------------------ | ----------------------------------------------------------- |
| `npm run dev`            | API com recarga automática (http://localhost:3333)         |
| `npm start`              | API em modo normal (usado pelo Render)                      |
| `npm run typecheck`      | checagem de tipos                                           |
| `npm run db:migrate`     | cria uma migração nova depois de mudar o `schema.prisma`    |
| `npm run db:deploy`      | aplica as migrações no banco do `.env`                      |
| `npm run db:seed`        | dados de exemplo (só se o banco estiver vazio)              |
| `npm run db:reset-demo`  | **apaga tudo** e recria os dados de exemplo                 |
| `npm run db:studio`      | abre o Prisma Studio para ver as tabelas                    |

## Estrutura

```
Back_end/src/
  server.ts        inicia o servidor
  app.ts           middlewares (helmet, CORS, JSON), rotas e tratamento de erros
  config.ts        variáveis de ambiente
  db.ts            conexão Prisma + PostgreSQL
  auth.ts          sessões (token opaco; o banco guarda só o hash)
  validation.ts    regras de validação (zod), iguais às do front
  serializers.ts   converte linhas do banco nos tipos do front (Front_End/src/types)
  images.ts        checagem de imagens (assinatura real do arquivo)
  routes/          auth, users, sightings (inclui curtidas, comentários e regiões), media
prisma/
  schema.prisma    tabelas: users, posts, comentarios, curtidas, sessoes, imagens
  migrations/      histórico de migrações
  seed.ts          dados de exemplo (reaproveita Front_End/src/mocks/seed)
```

## Rotas

Todas respondem JSON. Rotas marcadas com 🔒 exigem `Authorization: Bearer <token>`.
Erros: `{ code, message, fieldErrors? }` — os mesmos códigos que o front já trata.

| Método e rota                         | Descrição                                   |
| ------------------------------------- | ------------------------------------------- |
| `POST /auth/register`                 | cadastro → `{ user, token, expiresAt }`     |
| `POST /auth/login`                    | login → `{ user, token, expiresAt }`        |
| `POST /auth/logout` 🔒                | encerra a sessão                            |
| `GET /auth/me` 🔒                     | sessão atual                                |
| `PUT /auth/password` 🔒               | troca de senha (encerra as outras sessões)  |
| `GET /users/:username`                | perfil + estatísticas                       |
| `PATCH /users/me` 🔒                  | editar nome, @, bio e foto                  |
| `GET /users?search=`                  | busca de pessoas                            |
| `GET /users/featured`                 | investigadores em destaque                  |
| `GET /users/availability?username=`   | @ disponível?                               |
| `GET /users/:id/sightings`            | avistamentos de um usuário (paginado)       |
| `GET /sightings/feed`                 | feed (paginado: `cursor`, `limit`)          |
| `GET /sightings`                      | busca: `query`, `region`, `period`, `sort`  |
| `GET /sightings/:id`                  | detalhe                                     |
| `POST /sightings` 🔒                  | publicar                                    |
| `DELETE /sightings/:id` 🔒            | excluir (só o autor)                        |
| `PUT` / `DELETE /sightings/:id/like` 🔒 | curtir / descurtir                        |
| `GET /sightings/:id/comments`         | comentários                                 |
| `POST /sightings/:id/comments` 🔒     | comentar                                    |
| `DELETE /comments/:id` 🔒             | excluir (autor do comentário ou do post)    |
| `GET /regions`                        | regiões com mais avistamentos               |
| `POST /uploads` 🔒                    | envio de foto (multipart: `file`, `width`, `height`) |
| `GET /images/:id`                     | serve a foto guardada no banco              |
| `GET /health`                         | verificação de saúde (usada pelo Render)    |

## Segurança

- Senhas com bcrypt; o token de sessão é aleatório e o banco guarda só o hash (SHA-256).
- Limite de tentativas em login, cadastro e troca de senha.
- Validação de todos os dados recebidos; fotos conferidas pela assinatura do arquivo (JPG, PNG, WEBP,
  até 5 MB) e só é possível publicar fotos enviadas pelo próprio usuário.
- CORS restrito às origens de `CORS_ORIGIN`; cabeçalhos de segurança com helmet.
