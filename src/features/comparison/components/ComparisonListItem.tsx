import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { formatMoney, formatPercent, formatTimestampDate } from '@/lib/format'
import { assetTypeLabel, goalLabel } from '@/lib/labels'
import type { ComparisonSummary } from '../api/comparison'

/** Linha de uma comparação anterior; leva ao detalhe (conferência se ainda for rascunho). */
export function ComparisonListItem({ comparison }: { comparison: ComparisonSummary }) {
  const done = comparison.status === 'DONE'
  const { topOption, optionsCount } = comparison

  const details = [
    `${comparison.horizonMonths} ${comparison.horizonMonths === 1 ? 'mês' : 'meses'}`,
    comparison.goal ? goalLabel(comparison.goal) : null,
    optionsCount ? `${optionsCount} ${optionsCount === 1 ? 'opção' : 'opções'}` : null,
    formatTimestampDate(comparison.createdAt),
  ].filter(Boolean)

  return (
    <li>
      <Link
        to={`/comparacoes/${comparison.id}`}
        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-muted/50"
      >
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-medium">{formatMoney(comparison.amount)}</span>
            {!done && (
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">Em conferência</span>
            )}
            {comparison.chosenOptionId && (
              <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">Escolha feita</span>
            )}
          </p>
          <p className="mt-0.5 truncate text-sm text-muted">{details.join(' · ')}</p>
          {topOption && (
            <p className="mt-1 truncate text-sm">
              <span className="text-muted">Melhor taxa: </span>
              {topOption.issuerName ?? assetTypeLabel(topOption.assetType)}
              {topOption.netAnnualRate && ` · ${formatPercent(topOption.netAnnualRate)} a.a. líquida`}
            </p>
          )}
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
      </Link>
    </li>
  )
}
