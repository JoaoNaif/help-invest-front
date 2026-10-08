import { isAxiosError } from 'axios'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { formatMoney } from '@/lib/format'
import { goalLabel } from '@/lib/labels'
import { ResultView } from '../components/ResultView'
import { Stepper } from '../components/Stepper'
import { ReviewView } from '../components/ReviewView'
import { useComparison } from '../hooks/useComparison'

export function ComparisonPage() {
  const { id = '' } = useParams()
  const { data, isPending, error, refetch } = useComparison(id)

  if (isPending) return <LoadingSkeleton />

  if (error || !data) {
    const notFound = isAxiosError(error) && [400, 403, 404].includes(error.response?.status ?? 0)

    return (
      <div className="space-y-4 py-10 text-center">
        <h1 className="text-2xl">{notFound ? 'Comparação não encontrada' : 'Não deu para carregar'}</h1>
        <p className="text-muted">
          {notFound ? 'Ela não existe ou não é sua.' : 'Verifique a conexão e tente de novo.'}
        </p>
        <div className="flex justify-center gap-2">
          {!notFound && (
            <Button type="button" variant="secondary" onClick={() => void refetch()}>
              Tentar de novo
            </Button>
          )}
          <Link
            to="/"
            className="inline-flex h-11 items-center rounded-lg bg-gold px-4 text-sm font-semibold text-on-gold hover:bg-gold-hover"
          >
            Nova comparação
          </Link>
        </div>
      </div>
    )
  }

  const { comparison } = data
  const isDone = comparison.status === 'DONE'

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <Stepper current={isDone ? 3 : 2} />
        <h1 className="text-3xl">{isDone ? 'Ranking' : 'Confira antes de comparar'}</h1>
        <p className="text-muted">
          {formatMoney(comparison.amount)} por {comparison.horizonMonths}{' '}
          {comparison.horizonMonths === 1 ? 'mês' : 'meses'}
          {comparison.goal && ` · Objetivo: ${goalLabel(comparison.goal)}`}
        </p>
        {!isDone && (
          <p className="text-sm text-muted">
            Estas são as opções que vamos comparar. Se estiver tudo certo, é só confirmar.
          </p>
        )}
        {isDone && (
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gold hover:text-gold-hover">
            <ArrowLeft className="size-4" aria-hidden />
            Nova comparação
          </Link>
        )}
      </header>

      {isDone ? <ResultView detail={data} /> : <ReviewView detail={data} />}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4" aria-busy aria-label="Carregando">
      <div className="h-9 w-48 animate-pulse rounded-lg bg-surface" />
      <div className="h-5 w-64 animate-pulse rounded-lg bg-surface" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-32 animate-pulse rounded-xl bg-surface" />
      ))}
    </div>
  )
}
