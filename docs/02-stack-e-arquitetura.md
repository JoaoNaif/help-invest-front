# 02 — Stack e arquitetura

## Stack

| Peça | Escolha | Observação |
|---|---|---|
| Build | Vite + React 19 + TypeScript strict | SPA |
| Rotas | React Router v8 (modo SPA) | rotas protegidas por guarda (`ProtectedRoute` usa `GET /me`) |
| Dados do servidor | TanStack Query | `queryKey` por feature |
| HTTP | Axios | instância única com `withCredentials` e interceptor de refresh |
| Formulários | React Hook Form + Zod (`@hookform/resolvers`) | erros 400 mapeados por `path` |
| Estilo | Tailwind CSS (tokens do tema em CSS variables) | sem biblioteca de componentes |
| Gráficos | Recharts | só na carteira |
| Números | decimal.js | só formatar/comparar |
| Ícones | lucide-react | |
| Fontes | `@fontsource-variable/inter` e `@fontsource-variable/fraunces` | self-hosted, sem CDN |

Zod fica na v3 (a mesma do backend).
| Testes | nenhum por ora | ver D11 |

Node 22 (igual ao backend, `.nvmrc`).

## Estrutura de pastas (feature-based)

```
src/
  app/                 # bootstrap: providers (Query, Router), rotas, layout, guarda de auth
  features/
    auth/              # login, cadastro, sessão (useCurrentUser)
    profile/           # perfil do investidor
    comparison/        # comparador (entrada, conferência, ranking, histórico)
    portfolio/         # posições e resumo (Recharts)
  components/ui/       # botão, input, card, badge, modal... (próprios, Tailwind)
  lib/                 # axios (api.ts), formatadores (moeda, %, data), decimal helpers
  styles/              # tokens do tema, fontes, base do Tailwind
```

Cada feature contém o que é dela: `api/` (chamadas + schemas Zod), `hooks/` (Query), `components/`, `pages/`, `types.ts`.
Regra: **feature não importa de outra feature**; o que for comum sobe para `components/ui` ou `lib`.
Lógica de negócio de tela em hooks/funções puras, **não** dentro de JSX (facilita testes futuros).

## Camada de API

- Uma instância Axios (`lib/api.ts`): `baseURL` vem de `VITE_API_URL` (dev: `http://localhost:3333`), `withCredentials: true`.
- **Refresh de sessão (interceptor de resposta):** em `401` fora de `/sessions`, chamar `POST /sessions/refresh` **uma única vez por vez** (promise compartilhada, requisições concorrentes esperam a mesma) e repetir a requisição original. Se o refresh der `401` → limpar cache e ir para o login.
- **Saber se está logado:** `GET /me` (`200` usuário / `401`). Os cookies são httpOnly, ilegíveis ao JS. Guarda de rota usa essa query.
- **Erros:** normalizar em um tipo único. Validação 400 → `errors.details[].path` marca o campo. Mensagens amigáveis para 422 (sugerir digitar manualmente), 429 (aguardar), 503 (tentar mais tarde), 409 (ação inválida para o status).
- **Respostas validadas com Zod** nas fronteiras (decisão D10).

## Regras do contrato que o front precisa respeitar

(Resumo; a fonte é `backend/docs/09-api-referencia.md`, e o código do backend vence se divergir.)

1. Front **não faz conta**. Taxa líquida, IR, concentração e alertas vêm prontos.
2. Dinheiro e taxas = **`string`**. Nunca `parseFloat` para somar. Formatar com `Intl.NumberFormat('pt-BR')` ou decimal.js.
3. Datas de calendário `YYYY-MM-DD`; timestamps ISO UTC. Cuidado com fuso ao exibir datas de calendário (não passar por `new Date('YYYY-MM-DD')` direto).
4. `rate` depende do `indexer`: `CDI` 110 → "110% do CDI"; `IPCA` 6.5 → "IPCA + 6,5% a.a."; `PRE` 14.2 → "14,2% a.a."; `SELIC` 0.1 → "Selic + 0,1%".
5. Rótulos em português dos enums são responsabilidade do front (mapa em `lib/labels`).
6. `PATCH /positions/:id`: campo ausente = não altera; `null` = limpa. Nunca enviar `undefined`/vazio por engano.
7. `alerts[].message` já vem em português: exibir; `severity` define cor/ícone; `code` desconhecido → mostrar `message` normalmente.
8. `assumptions` não é contrato estável: só exibir ("como calculamos").
9. `POST /comparisons/:id/explanation` gasta crédito: **só por botão**, nunca automático. `GET /comparisons/:id` devolve a última explicação.
10. `LLM_EXTRACTED` deve ser destacado na tela de conferência.
11. Aviso permanente: explicação do LLM é **informativa, não recomendação**; a decisão é do investidor.
12. Imagem do print: enviar base64 **sem** prefixo `data:...;base64,` (≤ ~5 MB; `image/png|jpeg|webp`). Considerar reduzir/comprimir no cliente antes de enviar.

## Sessão, cookies e CORS (dev)

- Cookies `access_token` (15 min) e `refresh_token` (`Path=/sessions`), `SameSite=Strict`, httpOnly.
- CORS do backend aceita `http://localhost:3000` e `http://localhost:5173`. **Vite usa `5173`** (já liberado). Outra porta → `CORS_ORIGINS` no `.env` do backend.
- Usar **`localhost`** (não `127.0.0.1`) no front e na API, sem misturar.
- **Produção:** front e API sob o mesmo domínio base (ex.: `app.dominio.com` / `api.dominio.com`).

## Limites de requisição (mostrar mensagem amigável no 429)

Geral 300/min · `POST /accounts` 5 · `POST /sessions` 5 · `POST /comparisons` 10 · explanation 10 · refresh 30.

## Variáveis de ambiente

- `VITE_API_URL` — base da API (default dev `http://localhost:3333`).
