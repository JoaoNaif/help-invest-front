import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { formatCalendarDate } from '@/lib/format'

type View = 'days' | 'months' | 'years'

type DatePickerProps = {
  label: string
  /** "YYYY-MM-DD" ou vazio. */
  value: string
  onChange: (value: string) => void
  error?: string
}

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]
const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const YEARS_PER_PAGE = 12

const pad = (n: number) => String(n).padStart(2, '0')
const toValue = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`

function parse(value: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return match ? { y: Number(match[1]), m: Number(match[2]) - 1, d: Number(match[3]) } : null
}

/**
 * Calendário próprio: começa nos dias; tocar no mês abre os meses e tocar no ano abre os anos.
 * Escolher o ano volta aos meses, e escolher o mês volta aos dias.
 */
export function DatePicker({ label, value, onChange, error }: DatePickerProps) {
  const id = useId()
  const errorId = `${id}-error`
  const root = useRef<HTMLDivElement>(null)

  const selected = parse(value)
  const [today] = useState(() => new Date())

  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>('days')
  const [year, setYear] = useState(selected?.y ?? today.getFullYear())
  const [month, setMonth] = useState(selected?.m ?? today.getMonth())

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function toggle() {
    if (!open) {
      setYear(selected?.y ?? today.getFullYear())
      setMonth(selected?.m ?? today.getMonth())
      setView('days')
    }
    setOpen(!open)
  }

  function pick(y: number, m: number, d: number) {
    onChange(toValue(y, m, d))
    setOpen(false)
  }

  function shiftMonth(delta: number) {
    const next = new Date(year, month + delta, 1)
    setYear(next.getFullYear())
    setMonth(next.getMonth())
  }

  const pageStart = year - (year % YEARS_PER_PAGE)

  const title =
    view === 'days' ? `${MONTHS[month]} ${year}` : view === 'months' ? String(year) : `${pageStart} – ${pageStart + YEARS_PER_PAGE - 1}`

  function shift(delta: number) {
    if (view === 'days') shiftMonth(delta)
    else if (view === 'months') setYear(year + delta)
    else setYear(year + delta * YEARS_PER_PAGE)
  }

  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  return (
    <div ref={root} className="relative space-y-1.5">
      <label htmlFor={id} className="block text-sm text-muted">
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`flex h-11 w-full cursor-pointer items-center justify-between rounded-lg border bg-surface-2 px-3 text-base focus:border-gold focus:outline-none ${error ? 'border-danger' : 'border-border'}`}
      >
        <span className={selected ? 'text-text' : 'text-muted/60'}>
          {selected ? formatCalendarDate(value) : 'dd/mm/aaaa'}
        </span>
        <CalendarDays className="size-4 text-muted" aria-hidden />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={`Escolher data: ${label}`}
          className="absolute z-20 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface p-3 shadow-2xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shift(-1)}
              aria-label="Anterior"
              className="grid size-9 cursor-pointer place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-text"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>

            {view === 'days' ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setView('months')}
                  className="cursor-pointer rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-surface-2"
                >
                  {MONTHS[month]}
                </button>
                <button
                  type="button"
                  onClick={() => setView('years')}
                  className="cursor-pointer rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-surface-2"
                >
                  {year}
                </button>
              </div>
            ) : view === 'months' ? (
              <button
                type="button"
                onClick={() => setView('years')}
                className="cursor-pointer rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-surface-2"
              >
                {title}
              </button>
            ) : (
              <span className="px-2 py-1.5 text-sm font-medium">{title}</span>
            )}

            <button
              type="button"
              onClick={() => shift(1)}
              aria-label="Próximo"
              className="grid size-9 cursor-pointer place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-text"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>

          {view === 'days' && (
            <>
              <div className="mb-1 grid grid-cols-7 text-center text-xs text-muted">
                {WEEKDAYS.map((day, i) => (
                  <span key={i} className="py-1">
                    {day}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: firstWeekday }, (_, i) => (
                  <span key={`blank-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1
                  const isSelected = selected?.y === year && selected.m === month && selected.d === day
                  const isToday =
                    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => pick(year, month, day)}
                      aria-pressed={isSelected}
                      className={`grid h-9 cursor-pointer place-items-center rounded-lg text-sm ${
                        isSelected
                          ? 'bg-gold font-semibold text-on-gold'
                          : isToday
                            ? 'border border-gold/60 hover:bg-surface-2'
                            : 'hover:bg-surface-2'
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {view === 'months' && (
            <div className="grid grid-cols-3 gap-1">
              {MONTHS.map((name, index) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setMonth(index)
                    setView('days')
                  }}
                  className={`h-11 cursor-pointer rounded-lg text-sm ${
                    index === month ? 'bg-surface-2 text-gold' : 'hover:bg-surface-2'
                  }`}
                >
                  {name.slice(0, 3)}
                </button>
              ))}
            </div>
          )}

          {view === 'years' && (
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: YEARS_PER_PAGE }, (_, i) => pageStart + i).map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    setYear(y)
                    setView('months')
                  }}
                  className={`h-11 cursor-pointer rounded-lg text-sm ${
                    y === year ? 'bg-surface-2 text-gold' : 'hover:bg-surface-2'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex justify-between border-t border-border pt-2 text-sm">
            <button
              type="button"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
              className="cursor-pointer rounded-lg px-2 py-1.5 text-muted hover:text-text"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={() => pick(today.getFullYear(), today.getMonth(), today.getDate())}
              className="cursor-pointer rounded-lg px-2 py-1.5 text-gold hover:text-gold-hover"
            >
              Hoje
            </button>
          </div>
        </div>
      )}

      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
