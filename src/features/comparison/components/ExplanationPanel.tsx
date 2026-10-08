import { Check, Minus, Sparkles, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { assetTypeLabel } from '@/lib/labels'
import type { ApiError } from '@/lib/errors'
import type { ComparisonOption, Explanation } from '../api/comparison'

type Props = {
  explanation: Explanation | null
  options: ComparisonOption[]
  loading: boolean
  error: ApiError | null
  onExplain: () => void
}

const optionName = (option: ComparisonOption) =>
  `${option.issuerName ?? 'Emissor não informado'} (${assetTypeLabel(option.assetType)})`

/** Explicação sob demanda (gasta crédito): resumo, a opção que mais combina e prós/contras de cada uma. */
export function ExplanationPanel({ explanation, options, loading, error, onExplain }: Props) {
  return (
    <section aria-labelledby="explain-title" className="space-y-4">
      <h2 id="explain-title" className="text-xl">
        Qual escolher?
      </h2>

      {!explanation && (
        <p className="text-sm text-muted">
          Peça uma explicação simples: a gente resume o ranking, indica a opção que mais combina com você e
          mostra vantagens e pontos de atenção de cada uma.
        </p>
      )}

      {typeof explanation === 'string' && (
        <p className="rounded-xl border border-border bg-surface p-4 leading-relaxed whitespace-pre-line">
          {explanation}
        </p>
      )}

      {explanation && typeof explanation === 'object' && (
        <Structured explanation={explanation} options={options} />
      )}

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error.message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" loading={loading} onClick={onExplain}>
          <Sparkles className="size-4" aria-hidden />
          {explanation ? 'Gerar nova explicação' : 'Me ajude a escolher'}
        </Button>
        <span className="text-xs text-muted">Cada explicação usa crédito da IA.</span>
      </div>

      <p className="text-xs text-muted">
        É uma sugestão baseada nos números acima e no que você informou, não uma recomendação de
        investimento. A decisão final é sempre sua.
      </p>
    </section>
  )
}

function Structured({
  explanation,
  options,
}: {
  explanation: Exclude<Explanation, string>
  options: ComparisonOption[]
}) {
  const best = options.find((option) => option.id === explanation.bestOptionId)

  return (
    <div className="space-y-4">
      <p className="leading-relaxed">{explanation.summary}</p>

      {best && (
        <div className="rounded-xl border border-gold/60 bg-gold/5 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-gold">
            <Star className="size-4" aria-hidden />
            Mais combina com você
          </p>
          <p className="mt-1 text-lg font-medium">{optionName(best)}</p>
          {explanation.bestReason && <p className="mt-1 text-sm leading-relaxed">{explanation.bestReason}</p>}
        </div>
      )}

      <ul className="grid gap-3 md:grid-cols-2">
        {explanation.options.map((item) => {
          const option = options.find((o) => o.id === item.optionId)
          if (!option) return null

          return (
            <li key={item.optionId} className="rounded-xl border border-border bg-surface p-4">
              <p className="font-medium">{optionName(option)}</p>

              {item.pros.length > 0 && (
                <ul className="mt-3 space-y-1.5 text-sm">
                  {item.pros.map((pro) => (
                    <li key={pro} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-gain" aria-hidden />
                      <span>
                        <span className="sr-only">Vantagem: </span>
                        {pro}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {item.cons.length > 0 && (
                <ul className="mt-3 space-y-1.5 text-sm">
                  {item.cons.map((con) => (
                    <li key={con} className="flex items-start gap-2">
                      <Minus className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                      <span>
                        <span className="sr-only">Ponto de atenção: </span>
                        {con}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
