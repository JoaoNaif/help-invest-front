import { z } from 'zod'
import { isPositiveDecimal, normalizeDecimal } from '@/lib/decimal-input'
import type { StockAnalysisInput } from './api/stocks'

/** Ticker da B3: 4 letras + 1 ou 2 dígitos (BBAS3, SANB11). Aceita minúsculas e espaços. */
const isTicker = (value: string) => /^[A-Z]{4}\d{1,2}$/.test(value.replace(/\s/g, '').toUpperCase())

const itemSchema = z.object({
  ticker: z.string().refine(isTicker, 'Informe um ticker válido, como BBAS3.'),
  amount: z
    .string()
    .refine((value) => value.trim() === '' || isPositiveDecimal(value), 'Informe um valor maior que zero.'),
})

export const stockFormSchema = z
  .object({ items: z.array(itemSchema).min(1).max(2) })
  .superRefine(({ items }, ctx) => {
    const seen = new Set<string>()

    items.forEach((item, index) => {
      const ticker = normalizeTicker(item.ticker)
      if (ticker && seen.has(ticker)) {
        ctx.addIssue({
          code: 'custom',
          path: ['items', index, 'ticker'],
          message: 'Escolha duas ações diferentes.',
        })
      }
      seen.add(ticker)
    })
  })

export type StockFormValues = z.infer<typeof stockFormSchema>

export const emptyStockForm: StockFormValues = { items: [{ ticker: '', amount: '' }] }

export const normalizeTicker = (value: string) => value.replace(/\s/g, '').toUpperCase()

export function toStockInput(values: StockFormValues): StockAnalysisInput {
  return {
    items: values.items.map((item) => {
      const amount = normalizeDecimal(item.amount)
      return amount ? { ticker: normalizeTicker(item.ticker), amount } : { ticker: normalizeTicker(item.ticker) }
    }),
  }
}
