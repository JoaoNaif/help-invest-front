import Decimal from 'decimal.js'

// Dinheiro e taxas chegam como string. Nunca converter para float para calcular.

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 })

export type Indexer = 'PRE' | 'CDI' | 'IPCA' | 'SELIC'

export function formatMoney(value: string): string {
  return currency.format(new Decimal(value).toNumber())
}

export function formatNumber(value: string): string {
  return decimal.format(new Decimal(value).toNumber())
}

/** Percentual já em pontos percentuais (0–100), ex.: "12.888448" → "12,89%". */
export function formatPercent(value: string, digits = 2): string {
  return `${new Decimal(value).toDecimalPlaces(digits).toNumber().toLocaleString('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`
}

/** Sufixo correto conforme o indexador (docs/02, regra 4). */
export function formatRate(rate: string, indexer: Indexer | null): string {
  const n = formatNumber(rate)

  switch (indexer) {
    case 'CDI':
      return `${n}% do CDI`
    case 'IPCA':
      return `IPCA + ${n}% a.a.`
    case 'SELIC':
      return `Selic + ${n}%`
    case 'PRE':
      return `${n}% a.a.`
    default:
      return `${n}%`
  }
}

/** Data de calendário "YYYY-MM-DD" → "dd/mm/aaaa" sem passar por Date (evita erro de fuso). */
export function formatCalendarDate(value: string): string {
  const [y, m, d] = value.split('-')
  return `${d}/${m}/${y}`
}
