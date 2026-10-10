# 04 — Roadmap do front

Ordem pensada em entregar valor cedo: o comparador é o diferencial.

## Etapa 0 — Fundação (concluída em 2026-10-06)

Feito: projeto Vite, tokens do tema, fontes, rotas com guarda, Axios com refresh, formatadores, layout responsivo e páginas placeholder. `tsc`, `oxlint` e `vite build` passam; dev server responde em `:5173`. Ainda **não** testado contra o backend rodando (começa na etapa 1).

Projeto Vite + TS strict, Tailwind com tokens do tema, fontes (Inter, Fraunces), React Router, TanStack Query, instância Axios com refresh, formatadores, layout responsivo (nav inferior/lateral), componentes base.

## Etapa 1 — Entrada

Entrar/Cadastrar (uma tela, abas), login automático após cadastro, guarda de rotas via `GET /me`, logout.

## Etapa 2 — Comparador (núcleo)

Entrada (print/texto/manual) → conferência → avaliar → resultado com ranking e alertas → explicar → escolher.

## Etapa 3 — Histórico

Lista paginada e detalhe de comparações.

## Etapa 4 — Perfil (concluída em 2026-10-09)

Formulário do investidor e aviso de perfil desatualizado/ausente (já integrado aos alertas desde a etapa 2).

## Etapa 5 — Carteira (concluída em 2026-10-09)

CRUD de posições e resumo (Recharts: alocação; FGC por emissor; alertas).

## Depois

Testes (Vitest + Testing Library, Playwright), tema claro, Swagger/OpenAPI para gerar o client, PWA se fizer sentido, deploy (mesmo domínio base da API).

## Critério de sucesso

Em um uso real: da abertura do app até o ranking de um print colado em **poucos cliques e sem fricção**, inclusive no celular.
