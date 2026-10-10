import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { toApiError } from '@/lib/errors'
import { formatCalendarDate, formatMoney, formatRate, type Indexer } from '@/lib/format'
import { assetTypeLabel, liquidityLabel } from '@/lib/labels'
import type { Position } from '../api/portfolio'
import { useDeletePosition } from '../hooks/usePortfolio'

type Props = { position: Position; onEdit: () => void }

export function PositionItem({ position, onEdit }: Props) {
  const remove = useDeletePosition()
  const [confirming, setConfirming] = useState(false)

  const details = [
    assetTypeLabel(position.assetType),
    position.issuerName,
    position.rate ? formatRate(position.rate, position.indexer as Indexer | null) : null,
    position.maturityAt ? `vence em ${formatCalendarDate(position.maturityAt)}` : null,
    position.liquidity ? liquidityLabel(position.liquidity) : null,
  ].filter(Boolean)

  return (
    <li className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{position.name}</p>
          <p className="mt-1 text-sm text-muted">{details.join(' · ')}</p>
        </div>
        <p className="shrink-0 font-medium tabular-nums">{formatMoney(position.investedAmount)}</p>
      </div>

      {confirming ? (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          <p className="text-sm">Excluir esta posição? Isso não pode ser desfeito.</p>
          {remove.error && <p className="text-sm text-danger">{toApiError(remove.error).message}</p>}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              loading={remove.isPending}
              onClick={() => remove.mutate(position.id)}
              className="border-danger/50 text-danger"
            >
              Sim, excluir
            </Button>
            <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex gap-1 border-t border-border pt-3">
          <Button type="button" variant="ghost" onClick={onEdit} aria-label={`Editar ${position.name}`}>
            <Pencil className="size-4" aria-hidden />
            Editar
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setConfirming(true)}
            aria-label={`Excluir ${position.name}`}
          >
            <Trash2 className="size-4" aria-hidden />
            Excluir
          </Button>
        </div>
      )}
    </li>
  )
}
