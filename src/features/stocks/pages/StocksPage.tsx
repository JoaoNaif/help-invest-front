import { TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toApiError } from '@/lib/errors'
import { AnalysisListItem } from '../components/AnalysisListItem'
import { StockForm } from '../components/StockForm'
import { useStockAnalyses } from '../hooks/useStocks'

export function StocksPage() {
  const { data, isPending, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useStockAnalyses()
  const analyses = data?.pages.flat() ?? []

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl">Ações</h1>
        <p className="mt-2 text-muted">
          Veja dividendos, preço teto e como a ação se compara aos concorrentes. Informe uma ação ou duas para
          comparar.
        </p>
      </header>

      <StockForm />

      <section className="space-y-3">
        <h2 className="text-xl">Análises anteriores</h2>

        {isPending && (
          <div className="space-y-3" aria-busy aria-label="Carregando">
            {[0, 1].map((i) => (
              <div key={i} className="h-[4.5rem] animate-pulse rounded-xl bg-surface" />
            ))}
          </div>
        )}

        {error && (
          <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
            <p className="text-sm text-danger">{toApiError(error).message}</p>
            <Button type="button" variant="secondary" onClick={() => void refetch()}>
              Tentar de novo
            </Button>
          </div>
        )}

        {!isPending && !error && analyses.length === 0 && (
          <div className="space-y-2 rounded-xl border border-dashed border-border py-10 text-center">
            <TrendingUp className="mx-auto size-8 text-muted" aria-hidden />
            <p className="text-muted">Você ainda não analisou nenhuma ação.</p>
          </div>
        )}

        {analyses.length > 0 && (
          <ul className="space-y-3">
            {analyses.map((analysis) => (
              <AnalysisListItem key={analysis.id} analysis={analysis} />
            ))}
          </ul>
        )}

        {hasNextPage && (
          <Button
            type="button"
            variant="secondary"
            loading={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
            className="w-full"
          >
            Carregar mais
          </Button>
        )}
      </section>
    </div>
  )
}
