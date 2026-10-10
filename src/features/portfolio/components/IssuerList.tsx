import Decimal from 'decimal.js'
import { ShieldCheck } from 'lucide-react'
import { formatMoney, formatPercent } from '@/lib/format'
import type { PortfolioSummary } from '../api/portfolio'

/** Concentração por emissor e quanto dele está (ou não) coberto pelo FGC. Tudo vem pronto do backend. */
export function IssuerList({ issuers }: { issuers: PortfolioSummary['byIssuer'] }) {
  if (issuers.length === 0) return null

  return (
    <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <h2 className="flex items-center gap-2 text-xl">
        <ShieldCheck className="size-5 text-muted" aria-hidden />
        Por emissor e FGC
      </h2>

      <ul className="divide-y divide-border">
        {issuers.map((issuer) => {
          const uncovered = new Decimal(issuer.fgcUncoveredAmount).gt(0)

          return (
            <li key={issuer.issuerCnpj ?? issuer.issuerName ?? 'unknown'} className="space-y-1 py-3 first:pt-0 last:pb-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="min-w-0 truncate font-medium">{issuer.issuerName ?? 'Emissor não informado'}</p>
                <p className="shrink-0 tabular-nums">
                  {formatMoney(issuer.amount)}{' '}
                  <span className="text-sm text-muted">({formatPercent(issuer.percentage, 1)})</span>
                </p>
              </div>
              <p className="text-sm text-muted">
                Coberto pelo FGC: <span className="tabular-nums">{formatMoney(issuer.fgcCoveredAmount)}</span>
              </p>
              {uncovered && (
                <p className="text-sm text-warning">
                  Acima do limite do FGC:{' '}
                  <span className="tabular-nums">{formatMoney(issuer.fgcUncoveredAmount)}</span>
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
