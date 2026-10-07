# 03 — UX e design

## Premissa

Bonito, moderno e elegante, **mas prático**. O produto existe para **reduzir o tempo** que a pessoa gasta olhando mercado, taxas e comparando opções. Praticidade vence enfeite: menos cliques, menos telas, tudo intuitivo.

## Princípios de UX

1. **Entrada rápida.** Login e cadastro na mesma tela (abas). Cadastro com 3 campos (nome, e-mail, senha), sem confirmação de e-mail. Após `POST /accounts`, o front faz `POST /sessions` sozinho e leva direto à tela de uso. Autofocus, Enter envia, gerenciador de senhas funciona (`autocomplete` corretos).
2. **A tela inicial é o comparador** (o diferencial). Nada de dashboard vazio antes.
3. **Colar é o gesto principal.** Área grande que aceita **Ctrl+V de print**, arrastar imagem, colar texto ou digitar manualmente. Valor e prazo no topo.
4. **Fluxo curto:** colar → conferir (destaque no que a IA extraiu) → comparar → ranking com alertas.
5. **Perfil nunca bloqueia.** Aviso discreto ("complete seu perfil para alertas mais precisos") quando houver `PROFILE_MISSING`/`PROFILE_OUTDATED`.
6. **Mobile-first.** Navegação inferior (Comparar · Carteira · Histórico · Perfil) no celular; lateral no desktop. Totalmente responsivo.
7. **Honestidade na UI.** Mostrar premissas ("como calculamos"), fontes e datas; manter o aviso de que a explicação é informativa e a decisão é do investidor.
8. **Estados cuidados:** loading (skeleton), vazio (com próximo passo claro), erro (mensagem humana + ação), 503 ("tente de novo mais tarde").

## Telas

| Tela | Conteúdo |
|---|---|
| Entrar / Cadastrar | uma tela, duas abas |
| Comparar (home) | valor + prazo + entrada (print/texto/manual) |
| Conferência | opções editáveis, `LLM_EXTRACTED` destacado, adicionar/remover |
| Resultado | ranking por `netAnnualRate`, alertas por opção, "Explicar", "Escolhi esta", "como calculamos" |
| Histórico | lista paginada de comparações → detalhe |
| Carteira | posições (CRUD) + resumo: rosca de alocação, FGC por emissor, alertas |
| Perfil | renda, reserva, objetivo, horizonte, tolerância; aviso se desatualizado |

## Paleta (somente escuro)

Tokens como CSS variables, expostos ao Tailwind. Valores iniciais, ajustáveis na implementação:

| Token | Valor | Uso |
|---|---|---|
| `bg` | `#0B0D12` | fundo da página |
| `surface` | `#12151C` | cartões |
| `surface-2` | `#181C26` | cartões elevados, inputs |
| `border` | `#232838` | divisórias |
| `text` | `#EDEBE6` | texto principal (off-white quente) |
| `text-muted` | `#9AA0AE` | texto secundário |
| `gold` | **`#C9A24B`** | marca: botão primário, item ativo, melhor opção |
| `gold-hover` | a definir (tom mais claro) | hover/foco |
| `info` | azul-acinzentado | alerta `INFO` |
| `warning` | **laranja** | alerta `WARNING` |
| `danger` | vermelho | alerta `DANGER` |
| `gain` / `loss` | verde / vermelho discretos | variações |

**Regra:** dourado/âmbar é **só marca**. Alertas usam `info/warning/danger` e **sempre com ícone** (não depender só da cor). Contraste mínimo WCAG AA no texto.

## Tipografia

- **Inter** — UI, corpo e números. Números com `font-variant-numeric: tabular-nums` (colunas alinhadas).
- **Fraunces** — títulos e momentos de destaque (toque de sofisticação), uso **pontual**: títulos de página e valores de destaque, não em rótulos ou tabelas.
- Carregar via fontes self-hosted ou `@fontsource` (evitar dependência de CDN), com `font-display: swap`.

## Componentes próprios (`components/ui`)

Botão (primário dourado, secundário, ghost), Input/Select/Textarea, Card, Badge de severidade, Tabs, Modal/Drawer, Skeleton, Toast, EmptyState, área de upload/colar. Foco visível, navegação por teclado e `aria` corretos (sem shadcn, fica por nossa conta).

## Gráficos

- **Carteira:** Recharts (rosca de alocação por tipo/indexador/emissor, cores derivadas do tema).
- **Comparador:** barras horizontais em `div` + Tailwind, largura proporcional à `netAnnualRate` (sem biblioteca).

## Formatação (`lib/format`)

Moeda `pt-BR` (R$), percentuais com sufixo conforme `indexer`, datas `dd/mm/aaaa` sem armadilha de fuso para datas de calendário.
