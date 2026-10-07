# CLAUDE.md

Contexto permanente do front do Help Invest. Leia antes de mexer em qualquer coisa.

## O que é

Front do **Help Invest**, assistente de investimentos pessoal com IA (Brasil, pt-BR). Diferencial: **comparador de renda fixa** (cola um print/texto de CDBs etc.; o sistema extrai, calcula taxa líquida e alerta liquidez, FGC, concentração, taxa suspeita). Objetivo do produto: **reduzir o tempo** que o usuário gasta olhando mercado e comparando opções. Praticidade é prioridade máxima.

Estratégia: uso próprio → amigos/família → avaliar virar serviço (CVM, LGPD).

O backend (NestJS) fica em `../backend`. Contrato HTTP: `../backend/docs/09-api-referencia.md` (**o código do backend vence se divergir**). Documentação do front em [`docs/`](./docs/README.md); **registre decisões novas em `docs/01-decisoes.md`** e mantenha o índice em dia.

| Doc | Assunto |
|-----|---------|
| [`docs/01`](./docs/01-decisoes.md) | log de decisões |
| [`docs/02`](./docs/02-stack-e-arquitetura.md) | stack, pastas, camada de API, regras do contrato |
| [`docs/03`](./docs/03-ux-e-design.md) | UX, telas, paleta, tipografia |
| [`docs/04`](./docs/04-roadmap.md) | etapas de entrega |

## Regras do produto (valem para qualquer código)

- **O front não faz conta.** Taxa líquida, IR, concentração e alertas vêm prontos do backend. Só exibir e formatar.
- Dinheiro e taxas chegam como **`string`**. Nunca `parseFloat`/float para somar ou comparar; usar `decimal.js` e `Intl.NumberFormat('pt-BR')`.
- `rate` depende do `indexer` (CDI → "% do CDI", IPCA → "IPCA + x%", PRE → "x% a.a.", SELIC → "Selic + x%").
- Explicação do LLM é **informativa, não recomendação**: manter o aviso na tela. Explicação **só por botão** (gasta crédito).
- Nunca pedir senha de corretora. Imagens de print não são armazenadas; enviar base64 sem prefixo `data:`.
- Alertas: mostrar `message`; `severity` define cor/ícone; `code` desconhecido não quebra a tela.

## Stack

Vite + React 19 + TypeScript (strict) · React Router v8 (SPA, `react-router`) · TanStack Query · Axios · React Hook Form + Zod · Tailwind (sem shadcn) · Recharts (só carteira) · decimal.js · Node 22. **Sem testes por ora.**

## Arquitetura

Feature-based: `src/app`, `src/features/{auth,profile,comparison,portfolio}`, `src/components/ui`, `src/lib`, `src/styles`. **Feature não importa de outra feature.** Lógica fora do JSX (hooks/funções puras). Respostas da API validadas com Zod. Detalhes em `docs/02`.

## Sessão e API

- Axios com `withCredentials: true`; `baseURL` = `VITE_API_URL` (dev `http://localhost:3333`).
- Cookies httpOnly (ilegíveis ao JS). Logado? → `GET /me`.
- `401` fora de `/sessions` → **um** `POST /sessions/refresh` compartilhado → repetir a requisição; refresh `401` → login.
- Usar `localhost` (não `127.0.0.1`). Vite em `5173` já está liberado no CORS do backend.
- Backend local: `npm run services:up` + `npm run start:dev` em `../backend` (API em `:3333`).

## Design (resumo; completo em `docs/03`)

Dashboard financeiro **sóbrio, só escuro**, **dourado `#C9A24B` como marca** (nunca para alertas; alertas = info azul-acinzentado, warning laranja, danger vermelho, sempre com ícone). Inter (UI e números, `tabular-nums`) + Fraunces (títulos, uso pontual). **100% responsivo, mobile-first** (nav inferior no celular). Barras do comparador em `div`+Tailwind; Recharts só na carteira.

## UX (prioridade máxima: praticidade)

Login e cadastro na mesma tela, cadastro com 3 campos e login automático. Tela inicial = comparador, com **Ctrl+V de print**. Fluxo: colar → conferir (destacar `LLM_EXTRACTED`) → comparar → ranking. Perfil nunca bloqueia. Estados de loading/vazio/erro sempre cuidados.

## Comandos

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | dev server em `http://localhost:5173` (porta fixa, liberada no CORS do backend) |
| `npm run build` | `tsc -b` + build de produção |
| `npm run lint` | oxlint |
| `npm run preview` | serve o build |

Copie `.env.example` para `.env` (`VITE_API_URL`). Alias `@/` aponta para `src/`.
Tailwind v4: tokens do tema em `src/styles/index.css` (`@theme`), sem `tailwind.config`.
