import { History } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { toApiError } from '@/lib/errors'
import { ComparisonListItem } from '../components/ComparisonListItem'
import { useComparisonHistory } from '../hooks/useComparison'

export function HistoryPage() {
  const { data, isPending, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useComparisonHistory()

  const comparisons = data?.pages.flat() ?? []

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl">Histórico</h1>
        <p className="mt-2 text-muted">Suas comparações anteriores, da mais recente para a mais antiga.</p>
      </header>

      {isPending && (
        <div className="space-y-3" aria-busy aria-label="Carregando">
          {[0, 1, 2, 3].map((i) => (
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

      {!isPending && !error && comparisons.length === 0 && (
        <div className="space-y-3 rounded-xl border border-dashed border-border py-12 text-center">
          <History className="mx-auto size-8 text-muted" aria-hidden />
          <p className="text-muted">Você ainda não fez nenhuma comparação.</p>
          <Link
            to="/"
            className="inline-flex h-11 items-center rounded-lg bg-gold px-4 text-sm font-semibold text-on-gold hover:bg-gold-hover"
          >
            Fazer a primeira
          </Link>
        </div>
      )}

      {comparisons.length > 0 && (
        <ul className="space-y-3">
          {comparisons.map((comparison) => (
            <ComparisonListItem key={comparison.id} comparison={comparison} />
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
    </div>
  )
}
