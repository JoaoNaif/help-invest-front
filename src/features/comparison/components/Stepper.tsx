import { Check } from 'lucide-react'

const STEPS = ['Informar', 'Conferir', 'Ranking']

/** Mostra em que etapa do fluxo a pessoa está; `current` vai de 1 a 3. */
export function Stepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center gap-2 text-xs" aria-label="Etapas da comparação">
      {STEPS.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current

        return (
          <li key={label} className="flex items-center gap-2" aria-current={active ? 'step' : undefined}>
            <span
              className={`grid size-5 place-items-center rounded-full text-[0.65rem] font-semibold ${
                active
                  ? 'bg-gold text-on-gold'
                  : done
                    ? 'bg-gold/20 text-gold'
                    : 'bg-surface-2 text-muted'
              }`}
            >
              {done ? <Check className="size-3" aria-hidden /> : step}
            </span>
            <span className={active ? 'font-medium text-text' : 'text-muted'}>{label}</span>
            {step < STEPS.length && <span className="h-px w-5 bg-border" aria-hidden />}
          </li>
        )
      })}
    </ol>
  )
}
