import { ChevronRight } from 'lucide-react'
import { z } from 'zod'
import { formatCalendarDate, formatPercent } from '@/lib/format'
import { assetTypeLabel } from '@/lib/labels'
import type { ComparisonOption } from '../api/comparison'

/**
 * `assumptions` não é contrato estável: lemos só o que reconhecemos e ignoramos o resto.
 * Se nada bater, o painel simplesmente não aparece.
 */
const assumptionsSchema = z.object({
  indicators: z
    .record(
      z.string(),
      z
        .object({
          value: z.string().nullish(),
          date: z.string().nullish(),
        })
        .passthrough(),
    )
    .optional(),
  options: z
    .array(
      z
        .object({
          optionId: z.string(),
          holdingDays: z.number().nullish(),
          holdingPeriodBasis: z.string().nullish(),
          grossAnnualRate: z.string().nullish(),
          incomeTaxRate: z.string().nullish(),
        })
        .passthrough(),
    )
    .optional(),
  notes: z.array(z.string()).optional(),
})

const indicatorNames: Record<string, string> = {
  CDI: 'CDI',
  SELIC: 'Selic',
  IPCA_12M: 'IPCA dos últimos 12 meses',
}

const STEPS = [
  'Pegamos a taxa de cada opção e traduzimos para um rendimento ao ano.',
  'Descontamos o Imposto de Renda, que é menor quanto mais tempo o dinheiro fica aplicado.',
  'Comparamos o que sobra de verdade (a taxa líquida), por isso o ranking pode diferir da taxa anunciada.',
]

function holdingText(days?: number | null, basis?: string | null) {
  if (!days) return null
  const approx = days >= 60 ? `${Math.round(days / 30)} meses` : `${days} dias`
  return basis === 'HORIZON' ? `${approx} (o prazo que você informou)` : `${approx} (até o vencimento)`
}

function taxText(rate?: string | null) {
  if (rate === null || rate === undefined) return null
  return Number(rate) === 0 ? 'sem Imposto de Renda' : `Imposto de Renda de ${formatPercent(rate, 1)}`
}

export function AssumptionsPanel({
  assumptions,
  options,
}: {
  assumptions: unknown
  options: ComparisonOption[]
}) {
  const parsed = assumptionsSchema.safeParse(assumptions)
  if (!parsed.success) return null

  const { indicators = {}, options: perOption = [], notes = [] } = parsed.data
  const knownIndicators = Object.entries(indicators).filter(([, item]) => item.value)

  return (
    <details className="group rounded-xl border border-border bg-surface">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm">
        <ChevronRight className="size-4 text-muted transition-transform group-open:rotate-90" aria-hidden />
        Como chegamos nesses números
      </summary>

      <div className="space-y-5 border-t border-border px-4 py-4 text-sm">
        <ol className="list-decimal space-y-1.5 pl-5">
          {STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        {knownIndicators.length > 0 && (
          <div>
            <h3 className="mb-1.5 font-medium">Taxas de mercado usadas</h3>
            <ul className="space-y-1 text-muted">
              {knownIndicators.map(([key, item]) => (
                <li key={key}>
                  {indicatorNames[key] ?? key}: {formatPercent(item.value as string)} ao ano
                  {item.date && ` (Banco Central, ${formatCalendarDate(item.date)})`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {perOption.length > 0 && (
          <div>
            <h3 className="mb-1.5 font-medium">Em cada opção</h3>
            <ul className="space-y-2">
              {perOption.map((item) => {
                const option = options.find((o) => o.id === item.optionId)
                if (!option) return null

                const parts = [
                  holdingText(item.holdingDays, item.holdingPeriodBasis) &&
                    `Prazo considerado: ${holdingText(item.holdingDays, item.holdingPeriodBasis)}`,
                  item.grossAnnualRate && `rende ${formatPercent(item.grossAnnualRate)} ao ano antes do imposto`,
                  taxText(item.incomeTaxRate),
                  option.netAnnualRate && `sobra ${formatPercent(option.netAnnualRate)} ao ano`,
                ].filter(Boolean)

                return (
                  <li key={item.optionId}>
                    <span className="font-medium">
                      {option.issuerName ?? assetTypeLabel(option.assetType)}:
                    </span>{' '}
                    <span className="text-muted">{parts.join(' · ')}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {notes.length > 0 && (
          <div>
            <h3 className="mb-1.5 font-medium">Bom saber</h3>
            <ul className="list-disc space-y-1 pl-5 text-muted">
              {notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-muted">São estimativas com os dados de hoje; o rendimento real pode variar.</p>
      </div>
    </details>
  )
}
