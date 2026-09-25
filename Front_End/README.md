# Rastro — Front-end

Rede social para **registrar, visualizar e compartilhar avistamentos do Pé Grande**.

O site funciona em dois modos, sem nenhuma mudança nas telas:

- **Modo API** (com `VITE_API_URL`): usa a API do `Back_end` e o banco PostgreSQL — é o modo publicado.
- **Modo mock** (sem `VITE_API_URL`): tudo roda no navegador, com dados de exemplo no `localStorage`.
  Útil para mexer no visual sem precisar da API.

## Como rodar

```bash
cd Front_End
npm install
npm run dev                                          # modo mock — http://localhost:5173
VITE_API_URL=http://localhost:3333 npm run dev       # modo API (suba a API antes; ver README da raiz)
```

| Script              | O que faz                                   |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | servidor de desenvolvimento                 |
| `npm run build`     | checagem de tipos + build de produção       |
| `npm run preview`   | serve o build de produção localmente        |
| `npm run lint`      | oxlint (inclui regras de acessibilidade)    |
| `npm run typecheck` | só a checagem do TypeScript                 |

Para testar no celular pela rede local: `npm run dev -- --host` e abra o endereço mostrado.
Tudo funciona, exceto a captura de GPS, que o navegador só libera em HTTPS ou `localhost`.

## Contas de demonstração

| E-mail              | Senha       |
| ------------------- | ----------- |
| `victor@rastro.app` | `pegada123` |

Todos os usuários de exemplo (`marina@rastro.app`, `lucas@rastro.app`, `helena@rastro.app`…) usam a
mesma senha — nos dois modos (no modo API eles vêm do `npm run db:seed`).

- **Modo mock:** tudo o que for criado fica salvo **neste navegador**. Para voltar ao estado inicial:
  Configurações → Conta e segurança → Restaurar dados de demonstração.
- **Modo API:** os dados ficam no banco. Para recriar os exemplos: `npm run db:reset-demo` (na raiz).

## Stack

- React 19 + TypeScript + Vite 8 (template oficial)
- React Router 8 (rotas, rotas protegidas, carregamento por página)
- TanStack Query 5 (cache, estados de carregamento/erro e atualizações otimistas)
- CSS Modules + design tokens (`src/styles/tokens.css`), tema claro/escuro
- lucide-react (ícones) · Inter e Fraunces via Fontsource (fontes servidas pelo próprio app)

## Arquitetura

```
Páginas/componentes  →  hooks (src/hooks/queries)  →  serviços (src/services)  →  mock (src/mocks)
                                                            ↑
                                              futuramente: cliente HTTP → Back_end → PostgreSQL
```

```
src/
  pages/        telas (auth, feed, explore, sighting, profile, settings)
  layouts/      AppLayout (sidebar / barra inferior) e AuthLayout
  components/   componentes reutilizáveis (ui, sighting, comments, forms, navigation, feedback…)
  hooks/        hooks de interface e hooks de dados (hooks/queries)
  context/      providers de autenticação, tema e notificações
  services/     contracts.ts (interfaces) · mock/ (implementações) · index.ts (ponto de troca)
  mocks/        db.ts (banco mockado) · records.ts (formato das "tabelas") · seed/ (dados de exemplo)
  types/        tipos de domínio usados pela interface
  utils/        datas pt-BR, formatação, validação, imagens, rotas
  styles/       tokens e estilos globais
```

Regra do projeto: **páginas e componentes nunca importam `src/mocks`**. Todo acesso a dados passa
pelos hooks, que chamam os serviços de `src/services`.

## Autenticação no modo mock

- Login e cadastro são validados na tela e validados de novo no serviço (`utils/validation.ts`).
- Senhas são guardadas **apenas como hash** com salt (`utils/crypto/password.ts`) — nunca em texto puro.
- A sessão é um token aleatório salvo em `localStorage` (`rastro:session`) e registrado na tabela
  `sessions` do mock. Ao recarregar a página, `authService.restoreSession()` recupera o usuário.
- `ProtectedRoute` manda quem não está logado para `/login` e, depois do login, devolve para a
  página pedida. `PublicOnlyRoute` tira quem já está logado das telas de login/cadastro.

## Onde ficam os dados mockados

- `src/mocks/seed/` — usuários, avistamentos, comentários e curtidas de exemplo (fotos reais do
  Unsplash, servidas pelo CDN deles).
- `src/mocks/db.ts` — carrega os exemplos na primeira visita e salva cada "tabela" no `localStorage`
  (`rastro:db:*`). As gravações são transacionais: se o armazenamento encher, nada fica pela metade.
- Fotos enviadas pelo usuário são redimensionadas no navegador (máx. 1080 px, JPEG) antes de salvar.

## Conexão com o backend

A troca entre os modos acontece em um único arquivo, `src/services/index.ts`:

- `src/services/contracts.ts` — as interfaces (o "contrato" de cada serviço).
- `src/services/http/` — implementação que chama a API (`apiClient.ts` envia o token da sessão e
  converte os erros `{ code, message, fieldErrors }` em `AppError`).
- `src/services/mock/` — implementação local (localStorage).

Fotos: no modo API, a imagem é comprimida no navegador (máx. 1080 px, JPEG) e enviada para
`POST /uploads`; a API guarda no banco e devolve a URL.

## Variáveis de ambiente

Veja `.env.example`:

| Variável                 | Para que serve                                                          |
| ------------------------ | ----------------------------------------------------------------------- |
| `VITE_API_URL`           | endereço da API; sem ela, modo mock                                     |
| `VITE_SHOW_DEMO_ACCOUNT` | `true` mostra a conta de demonstração no login também no modo API       |
| `VITE_MOCK_LATENCY`      | latência simulada no modo mock (1 = realista, 0 = instantâneo)          |

No Render, `VITE_API_URL` é definida no serviço `rastro-web` (ver `render.yaml` na raiz).
