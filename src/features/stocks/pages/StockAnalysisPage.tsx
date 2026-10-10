import { ArrowLeft, Info } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { AlertList } from '@/components/ui/AlertList'
import { Button } from '@/components/ui/Button'
import { toApiError } from '@/lib/errors'
import { formatTimestampDate } from '@/lib/format'
import { AssumptionsPanel } from '../components/AssumptionsPanel'
import { StockCard } from '../components/StockCard'
import { useStockAnalysis } from '../hooks/useStocks'

export function StockAnalysisPage() {
  const { id = '' } = useParams()
  const { data: analysis, isPending, error, refetch } = useStockAnalysis(id)

  const apiError = error ? toApiError(error) : null
  const notFound = apiError && [400, 403, 404].includes(apiError.status ?? 0)

  return (
    <div className="space-y-6">
      <Link to="/acoes" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text">
        <ArrowLeft className="size-4" aria-hidden />
        Ações
      </Link>

      {isPending && (
        <div className="space-y-3" aria-busy aria-label="Carregando">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-surface" />
          <div className="h-96 animate-pulse rounded-xl bg-surface" />
        </div>
      )}

      {notFound && (
        <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
          <p className="text-sm">Não encontramos essa análise.</p>
          <Link to="/acoes" className="text-sm text-gold hover:text-gold-hover">
            Fazer uma nova análise
          </Link>
        </div>
      )}

      {apiError && !notFound && (
        <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-danger">{apiError.message}</p>
          <Button type="button" variant="secondary" onClick={() => void refetch()}>
            Tentar de novo
          </Button>
        </div>
      )}

      {analysis && (
        <>
          <header>
            <h1 className="text-3xl">{analysis.tickers.join(' × ')}</h1>
            <p className="mt-2 text-sm text-muted">Análise de {formatTimestampDate(analysis.createdAt)}</p>
          </header>

          <p className="flex items-start gap-2 rounded-lg border border-info/30 bg-info/10 px-3 py-2 text-sm text-info">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              Informação para apoiar sua decisão, não é recomendação de compra ou venda. A decisão é sua.
            </span>
          </p>

          <AlertList alerts={analysis.result.alerts} />

          <div className={`grid gap-4 ${analysis.result.items.length > 1 ? 'lg:grid-cols-2' : ''}`}>
            {analysis.result.items.map((item) => (
              <StockCard key={item.ticker} item={item} />
            ))}
          </div>

          <AssumptionsPanel assumptions={analysis.assumptions} />
        </>
      )}
    </div>
  )
}
