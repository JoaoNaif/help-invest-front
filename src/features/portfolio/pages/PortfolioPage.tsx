import { Plus, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { AlertList } from '@/components/ui/AlertList'
import { Button } from '@/components/ui/Button'
import { toApiError } from '@/lib/errors'
import { formatMoney } from '@/lib/format'
import { AllocationChart } from '../components/AllocationChart'
import { IssuerList } from '../components/IssuerList'
import { PositionForm } from '../components/PositionForm'
import { PositionItem } from '../components/PositionItem'
import { usePositions, useSummary } from '../hooks/usePortfolio'

const PROFILE_CODES = ['PROFILE_MISSING', 'PROFILE_OUTDATED']

/** `'new'` = formulário de nova posição; um id = editando essa; `null` = fechado. */
type Editing = 'new' | string | null

export function PortfolioPage() {
  const positionsQuery = usePositions()
  const summaryQuery = useSummary()
  const [editing, setEditing] = useState<Editing>(null)

  const positions = positionsQuery.data ?? []
  const summary = summaryQuery.data
  const close = () => setEditing(null)

  const alerts = summary?.alerts ?? []
  const needsProfile = alerts.some((alert) => PROFILE_CODES.includes(alert.code))

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl">Carteira</h1>
          {summary && positions.length > 0 ? (
            <p className="mt-2 text-muted">
              Total investido:{' '}
              <span className="font-medium text-text tabular-nums">{formatMoney(summary.total)}</span>
            </p>
          ) : (
            <p className="mt-2 text-muted">Suas posições e como o dinheiro está distribuído.</p>
          )}
        </div>
        {editing === null && positions.length > 0 && (
          <Button type="button" onClick={() => setEditing('new')} className="shrink-0">
            <Plus className="size-4" aria-hidden />
            Adicionar
          </Button>
        )}
      </header>

      {editing === 'new' && <PositionForm onDone={close} />}

      {positionsQuery.isPending && (
        <div className="space-y-3" aria-busy aria-label="Carregando">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      )}

      {positionsQuery.error && (
        <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-danger">{toApiError(positionsQuery.error).message}</p>
          <Button type="button" variant="secondary" onClick={() => void positionsQuery.refetch()}>
            Tentar de novo
          </Button>
        </div>
      )}

      {!positionsQuery.isPending && !positionsQuery.error && positions.length === 0 && editing !== 'new' && (
        <div className="space-y-3 rounded-xl border border-dashed border-border py-12 text-center">
          <Wallet className="mx-auto size-8 text-muted" aria-hidden />
          <p className="text-muted">Sua carteira está vazia.</p>
          <Button type="button" onClick={() => setEditing('new')}>
            <Plus className="size-4" aria-hidden />
            Adicionar a primeira posição
          </Button>
        </div>
      )}

      {positions.length > 0 && (
        <>
          {summaryQuery.isPending && <div className="h-64 animate-pulse rounded-xl bg-surface" aria-busy />}

          {summaryQuery.error && (
            <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
              <p className="text-sm text-danger">{toApiError(summaryQuery.error).message}</p>
              <Button type="button" variant="secondary" onClick={() => void summaryQuery.refetch()}>
                Tentar de novo
              </Button>
            </div>
          )}

          {summary && (
            <>
              <AlertList alerts={alerts} />
              {needsProfile && (
                <Link to="/perfil" className="inline-block text-sm text-gold hover:text-gold-hover">
                  Completar perfil
                </Link>
              )}
              <AllocationChart summary={summary} />
              <IssuerList issuers={summary.byIssuer} />
            </>
          )}

          <section className="space-y-3">
            <h2 className="text-xl">Posições</h2>
            <ul className="space-y-3">
              {positions.map((position) =>
                editing === position.id ? (
                  <li key={position.id}>
                    <PositionForm position={position} onDone={close} />
                  </li>
                ) : (
                  <PositionItem key={position.id} position={position} onEdit={() => setEditing(position.id)} />
                ),
              )}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
