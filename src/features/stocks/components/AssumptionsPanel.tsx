import { z } from 'zod'
import { formatTimestampDate } from '@/lib/format'

/**
 * `assumptions` não é contrato estável: lemos só o que reconhecemos e ignoramos o resto.
 * Se nada bater, o painel não aparece.
 */
const schema = z.object({
  sources: z.array(z.string()).optional(),
  analyzedAt: z.string().optional(),
  bazinRequiredYieldPercent: z.string().optional(),
  grahamMultiplier: z.string().optional(),
  valuationFairBandPercent: z.string().optional(),
  dividendHistoryYears: z.number().optional(),
  stalePriceDays: z.number().optional(),
  minAnalystCoverage: z.number().optional(),
  dividendsAreGross: z.boolean().optional(),
})

const pt = (value: string) => value.replace('.', ',')

export function AssumptionsPanel({ assumptions }: { assumptions: Record<string, unknown> | null | undefined }) {
  const parsed = schema.safeParse(assumptions ?? {})
  if (!parsed.success) return null

  const a = parsed.data
  const lines = [
    a.sources?.length ? `Fonte dos dados: ${a.sources.join(', ')}.` : null,
    a.analyzedAt ? `Análise feita em ${formatTimestampDate(a.analyzedAt)}.` : null,
    a.bazinRequiredYieldPercent
      ? `Bazin: média anual de dividendos dividida por ${pt(a.bazinRequiredYieldPercent)}%.`
      : null,
    a.grahamMultiplier
      ? `Graham: raiz de ${pt(a.grahamMultiplier)} × lucro por ação × valor patrimonial por ação.`
      : null,
    a.valuationFairBandPercent
      ? `Na média dos concorrentes: até ${pt(a.valuationFairBandPercent)}% da mediana do grupo.`
      : null,
    a.dividendHistoryYears ? `Histórico de dividendos: até ${a.dividendHistoryYears} anos, em janelas de 12 meses.` : null,
    a.dividendsAreGross ? 'Dividendos brutos, na data ex (IR do JCP não descontado).' : null,
    a.stalePriceDays ? `Cotação com mais de ${a.stalePriceDays} dias é sinalizada como desatualizada.` : null,
    a.minAnalystCoverage
      ? `Consenso com menos de ${a.minAnalystCoverage} analistas é sinalizado como baixa cobertura.`
      : null,
  ].filter(Boolean)

  if (lines.length === 0) return null

  return (
    <details className="rounded-xl border border-border bg-surface">
      <summary className="cursor-pointer px-4 py-3 text-sm text-muted hover:text-text">Como calculamos</summary>
      <ul className="space-y-1.5 border-t border-border px-4 py-3 text-sm text-muted">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </details>
  )
}
