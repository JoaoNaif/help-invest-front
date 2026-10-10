import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { formatMoneyOrDash, formatTimestampDate } from '@/lib/format'
import type { StockAnalysis } from '../api/stocks'

/** Linha de uma análise anterior; leva ao detalhe. */
export function AnalysisListItem({ analysis }: { analysis: StockAnalysis }) {
  return (
    <li>
      <Link
        to={`/acoes/${analysis.id}`}
        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-muted/50"
      >
        <div className="min-w-0">
          <p className="truncate text-lg font-medium">{analysis.tickers.join(' × ')}</p>
          <p className="mt-0.5 truncate text-sm text-muted">
            {[
              ...analysis.result.items.map((item) => `${item.ticker} ${formatMoneyOrDash(item.price)}`),
              formatTimestampDate(analysis.createdAt),
            ].join(' · ')}
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
      </Link>
    </li>
  )
}
