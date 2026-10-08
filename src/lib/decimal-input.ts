import Decimal from 'decimal.js'

/**
 * Texto digitado em pt-BR ("1.500,50", "R$ 10000", "6,5") → string decimal para a API ("1500.50").
 * Devolve null se não for um número válido. Sem vírgula, o ponto é tratado como decimal.
 */
export function normalizeDecimal(input: string): string | null {
  const text = input.trim().replace(/^R\$/, '').replace(/\s/g, '')
  if (!text) return null

  const normalized = text.includes(',') ? text.replace(/\./g, '').replace(',', '.') : text

  return /^\d+(\.\d+)?$/.test(normalized) ? normalized : null
}

export function isPositiveDecimal(input: string): boolean {
  const normalized = normalizeDecimal(input)
  return normalized !== null && new Decimal(normalized).gt(0)
}

/** String da API ("6.5") → texto de campo em pt-BR ("6,5"). */
export function toInputDecimal(value: string | null | undefined): string {
  return value ? value.replace('.', ',') : ''
}
