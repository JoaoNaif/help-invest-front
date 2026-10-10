import Decimal from 'decimal.js'
import { Check, Crown, UserRound } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { toApiError } from '@/lib/errors'
import { formatCalendarDate, formatPercent, formatRate, type Indexer } from '@/lib/format'
import { assetTypeLabel, liquidityLabel } from '@/lib/labels'
import type { Alert, ComparisonDetail, ComparisonOption } from '../api/comparison'
import { useChooseOption, useExplain } from '../hooks/useComparison'
import { AlertList } from '@/components/ui/AlertList'
import { AssumptionsPanel } from './AssumptionsPanel'
import { ExplanationPanel } from './ExplanationPanel'

const PROFILE_CODES = ['PROFILE_MISSING', 'PROFILE_OUTDATED']

/** Largura da barra proporcional à taxa líquida (só apresentação; o cálculo é do backend). */
function barWidth(rate: string | null, max: Decimal): string {
  if (!rate || max.lte(0)) return '0%'
  const pct = Decimal.max(new Decimal(rate).div(max).times(100), 3)
  return `${pct.toDecimalPlaces(1).toString()}%`
}

export function ResultView({ detail }: { detail: ComparisonDetail }) {
  const { comparison, options, explanation } = detail
  const choose = useChooseOption(comparison.id)
  const explain = useExplain(comparison.id)

  const max = options.reduce(
    (acc, option) => (option.netAnnualRate ? Decimal.max(acc, option.netAnnualRate) : acc),
    new Decimal(0),
  )

  // Avisos de perfil valem para a comparação toda: mostrar uma vez, discreto, sem repetir por opção.
  const profileAlerts = dedupeAlerts(
    options.flatMap((option) => option.alerts.filter((alert) => PROFILE_CODES.includes(alert.code))),
  )

  const explainError = explain.error ? toApiError(explain.error) : null
  const chooseError = choose.error ? toApiError(choose.error) : null

  return (
    <div className="space-y-8">
      {profileAlerts.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted">
          <span>{profileAlerts[0].message}</span>
          <Link to="/perfil" className="inline-flex items-center gap-1.5 text-gold hover:text-gold-hover">
            <UserRound className="size-4" aria-hidden />
            Completar perfil
          </Link>
        </div>
      )}

      <ol className="space-y-4">
        {options.map((option, index) => (
          <RankingItem
            key={option.id}
            option={option}
            position={index + 1}
            width={barWidth(option.netAnnualRate, max)}
            chosen={comparison.chosenOptionId === option.id}
            choosing={choose.isPending && choose.variables === option.id}
            onChoose={() => choose.mutate(option.id)}
          />
        ))}
      </ol>

      {chooseError && (
        <p role="alert" className="text-sm text-danger">
          {chooseError.message}
        </p>
      )}

      <ExplanationPanel
        explanation={explanation}
        options={options}
        loading={explain.isPending}
        error={explainError}
        onExplain={() => explain.mutate()}
      />

      <AssumptionsPanel assumptions={comparison.assumptions} options={options} />
    </div>
  )
}

function dedupeAlerts(alerts: Alert[]) {
  return alerts.filter((alert, i) => alerts.findIndex((a) => a.code === alert.code) === i)
}

type ItemProps = {
  option: ComparisonOption
  position: number
  width: string
  chosen: boolean
  choosing: boolean
  onChoose: () => void
}

function RankingItem({ option, position, width, chosen, choosing, onChoose }: ItemProps) {
  const best = position === 1
  const alerts = option.alerts.filter((alert) => !PROFILE_CODES.includes(alert.code))

  const details = [
    assetTypeLabel(option.assetType),
    formatRate(option.rate, option.indexer as Indexer),
    option.maturityAt ? `vence em ${formatCalendarDate(option.maturityAt)}` : null,
    option.liquidity ? liquidityLabel(option.liquidity) : null,
  ].filter(Boolean)

  return (
    <li
      className={`rounded-xl border bg-surface p-4 sm:p-5 ${best ? 'border-gold/60' : 'border-border'} ${
        chosen ? 'ring-2 ring-gold/40' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">{position}º</span>
            {best && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">
                <Crown className="size-3" aria-hidden />
                Maior taxa líquida
              </span>
            )}
            {chosen && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-xs text-text">
                <Check className="size-3" aria-hidden />
                Sua escolha
              </span>
            )}
          </div>
          <h3 className="mt-1 truncate text-lg font-medium">
            {option.issuerName ?? 'Emissor não informado'}
          </h3>
          <p className="mt-0.5 text-sm text-muted">{details.join(' · ')}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-display text-2xl">
            {option.netAnnualRate ? formatPercent(option.netAnnualRate) : '—'}
          </p>
          <p className="text-xs text-muted">a.a. líquida</p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden>
        <div
          className={`h-full rounded-full ${best ? 'bg-gold' : 'bg-muted/60'}`}
          style={{ width }}
        />
      </div>

      {alerts.length > 0 && (
        <div className="mt-4">
          <AlertList alerts={alerts} />
        </div>
      )}

      {!chosen && (
        <div className="mt-4">
          <Button type="button" variant="ghost" loading={choosing} onClick={onChoose} className="h-9">
            Escolhi esta
          </Button>
        </div>
      )}
    </li>
  )
}
