# 01 — Log de decisões

Formato: decisão · motivo · alternativas descartadas. Data: 2026-10-06 (sessão de definição do front).

## D1. Vite + React + TypeScript (SPA), não Next.js

- **Motivo:** app privado e autenticado, sem SEO nem páginas públicas. O backend (NestJS) já é o servidor; Next criaria um segundo backend e complicaria os cookies httpOnly (o servidor do Next teria de repassá-los). SPA + API no mesmo site funciona direto. Dev e deploy mais simples (estático).
- **Quando reavaliar:** se surgir landing pública com SEO. Mesmo assim, a landing seria um projeto separado.

## D2. React Router (modo SPA)

- **Motivo:** o autor já domina. Rotas protegidas via loader/componente de guarda.
- **Versão:** planejado v7, mas o `npm` instalou a **v8** (2026-10-06); a API usada (`createBrowserRouter`, `RouterProvider` de `react-router/dom`) é a mesma. Mantida a v8.
- **Descartado:** TanStack Router.

## D3. TanStack Query para dados do servidor

- **Motivo:** cache, estados de loading/erro, mutations e invalidação encaixam no fluxo DRAFT → DONE do comparador.

## D4. React Hook Form + Zod

- **Motivo:** o backend usa Zod; erros 400 (`errors.details[].path`) mapeiam direto para os campos.

## D5. Tailwind puro, sem shadcn/ui

- **Motivo:** shadcn deixa tudo com a mesma cara. Componentes próprios (`src/components/ui/`) dão identidade. Acessibilidade fica por nossa conta (foco, aria, teclado).

## D6. Axios como cliente HTTP

- **Motivo:** interceptors resolvem o refresh de sessão (401 → `POST /sessions/refresh` uma vez → repete). Detalhes em [02](./02-stack-e-arquitetura.md).

## D7. Recharts para gráficos — só na carteira

- **Motivo:** biblioteca declarativa e simples (rosca de alocação, barras). Entra com a feature de carteira, **depois** do comparador.
- **Barras do comparador:** `div` + Tailwind, sem biblioteca (largura proporcional à `netAnnualRate`).
- **Descartado:** visx (baixo nível demais para o ganho).

## D8. decimal.js só para formatar/comparar

- **Motivo:** o backend entrega dinheiro e taxas como `string`. O front **nunca calcula** imposto, taxa líquida ou concentração; só exibe e, no máximo, compara/ordena strings decimais.

## D9. Estrutura feature-based

- **Motivo:** `features/comparison`, `features/portfolio` etc. mantêm o que muda junto, junto. Camada de API tipada compartilhada. Ver [02](./02-stack-e-arquitetura.md).
- **Descartado:** espelhar as camadas `core/domain/infra` do backend (peso demais para um front).

## D10. Tipos da API escritos à mão + Zod validando as respostas

- **Motivo:** o backend não tem OpenAPI. Zod nas respostas pega divergência de contrato cedo.
- **Futuro:** pedir Swagger/OpenAPI ao backend e gerar o client, se a API crescer.

## D11. Sem testes no front por ora

- **Motivo:** decisão do autor para o início; validação manual local. Quando entrar: Vitest + Testing Library (mesma ferramenta do backend), Playwright depois.
- **Consequência:** manter a lógica fora dos componentes (hooks e utilitários puros) para facilitar testes futuros.

## D12. Visual: dashboard financeiro sóbrio, só tema escuro, dourado como marca

- Tema claro **não** no início. Paleta e tipografia em [03](./03-ux-e-design.md).
- **Dourado `#C9A24B`** = marca e destaque (primário, item ativo, melhor opção). **Nunca** usar dourado/âmbar para alertas: severidade tem cores próprias para não confundir com `WARNING`.
- **Tipografia:** Inter (UI e números, `tabular-nums`) + Fraunces (títulos, toque de sofisticação, uso pontual).

## D13. 100% responsivo, mobile-first

- **Motivo:** o fluxo do print sugere uso no celular. Navegação inferior no mobile, lateral no desktop.

## D14. Praticidade acima de tudo (princípio de produto do front)

- Login e cadastro rápidos, tela de uso intuitiva, o mínimo de cliques. Detalhes em [03](./03-ux-e-design.md).

## D15. Deploy adiado

- Muito teste local antes. Lembrete: em produção front e API precisam ficar sob o mesmo domínio base (cookies `SameSite=Strict`). Ver [02](./02-stack-e-arquitetura.md).
