# Rastro — Front-end

Rede social para **registrar, visualizar e compartilhar avistamentos do Pé Grande**.

Nesta etapa a aplicação roda 100% no navegador com **dados mockados**. O banco de dados
(Prisma + PostgreSQL, já esboçado na raiz do repositório) será conectado na próxima etapa —
a arquitetura foi feita para essa troca não exigir mudanças nas telas.

## Como rodar

```bash
cd Front_End
npm install
npm run dev          # http://localhost:5173
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
mesma senha. Contas, publicações, curtidas e comentários novos ficam salvos **neste navegador**.
Para voltar ao estado inicial: **Configurações → Conta e segurança → Restaurar dados de demonstração**.

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

## Autenticação mockada

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

## Como conectar o backend

1. Criar no `Back_end` as rotas descritas em `src/services/contracts.ts` (cada método traz o
   endpoint sugerido no comentário, ex.: `GET /sightings/feed?cursor=&limit=`).
2. Criar `src/services/http/` com implementações `fetch` das mesmas interfaces, enviando o token do
   `tokenStorage` no cabeçalho `Authorization`:

   ```ts
   export const httpSightingService: SightingService = {
     async getFeed({ cursor, limit }) {
       const response = await fetch(`${import.meta.env.VITE_API_URL}/sightings/feed?cursor=${cursor ?? ''}&limit=${limit ?? ''}`, {
         headers: { Authorization: `Bearer ${tokenStorage.get()}` },
       });
       if (!response.ok) throw await toAppError(response); // { code, message, fieldErrors }
       return response.json();
     },
     // ...demais métodos
   };
   ```

3. Trocar as atribuições em `src/services/index.ts` e definir `demoAccount` e `demoData` como `null`.
4. Responder erros no formato `{ code, message, fieldErrors }` (códigos em `services/errors.ts`) —
   a interface já sabe exibir cada um.

Nenhuma página, componente ou hook precisa ser alterado.

## Relação com o `prisma/schema.prisma` atual

| Front (mock)                 | Prisma            |
| ---------------------------- | ----------------- |
| `UserRecord.name`            | `User.nome`       |
| `UserRecord.passwordHash`    | `User.senhaHash`  |
| `UserRecord.avatarUrl`       | `User.fotoPerfil` |
| `SightingRecord.description` | `Post.texto`      |
| `SightingRecord.photoUrl`    | `Post.imagem`     |
| `SightingRecord.createdAt`   | `Post.criadoEm`   |
| `SightingRecord.likeCount`   | `Post.quantidadeCurtidas` |
| `SightingRecord.authorId`    | `Post.autorId`    |

O schema ainda **não** tem campos que o app usa: `User.username` (único), `User.bio`, `User.createdAt`;
no `Post`: local, cidade, estado/região, país, latitude/longitude/precisão, data e horário do
avistamento, largura/altura da foto; e as tabelas de comentários, curtidas (par usuário + post único)
e sessões (se não usar JWT). Ele também exige `numeroTelefone`, que o cadastro atual não pede —
decidir na etapa do banco se o telefone entra no cadastro ou vira opcional.

## Variáveis de ambiente

Veja `.env.example`. Hoje só existe `VITE_MOCK_LATENCY` (1 = latência realista, 0 = respostas
instantâneas); `VITE_API_URL` fica reservada para a etapa do backend.
