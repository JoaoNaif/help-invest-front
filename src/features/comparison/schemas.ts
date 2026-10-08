import Decimal from 'decimal.js'
import { z } from 'zod'
import { isPositiveDecimal, normalizeDecimal, toInputDecimal } from '@/lib/decimal-input'
import { ASSET_TYPES, GOALS, INDEXERS, LIQUIDITIES } from '@/lib/labels'
import type { ComparisonOption, OptionInput, RecentOption } from './api/comparison'

export const MAX_OPTIONS = 20

const blankOr = (valid: (value: string) => boolean, message: string) =>
  z.string().refine((value) => value.trim() === '' || valid(value.trim()), message)

/** Uma opção como o formulário a enxerga: tudo texto. A conversão para a API fica em `toOptionInput`. */
export const optionFormSchema = z.object({
  id: z.string().optional(),
  source: z.enum(['MANUAL', 'LLM_EXTRACTED']).optional(),
  rawInput: z.string().nullable().optional(),
  assetType: z.enum(ASSET_TYPES, { message: 'Escolha o tipo.' }),
  indexer: z.enum(INDEXERS, { message: 'Escolha o indexador.' }),
  rate: z.string().refine(isPositiveDecimal, 'Informe uma taxa maior que zero.'),
  issuerName: z.string(),
  issuerCnpj: blankOr((v) => v.replace(/\D/g, '').length === 14, 'O CNPJ tem 14 dígitos.'),
  maturityAt: z.string(),
  liquidity: z.enum(['', ...LIQUIDITIES]),
  graceDays: blankOr((v) => /^\d+$/.test(v), 'Informe um número inteiro de dias.'),
  minAmount: blankOr((v) => normalizeDecimal(v) !== null, 'Valor inválido.'),
})

export type OptionFormValues = z.infer<typeof optionFormSchema>

export const optionsFormSchema = z.object({
  options: z.array(optionFormSchema).min(1, 'Adicione ao menos uma opção.').max(MAX_OPTIONS),
})

export type OptionsFormValues = z.infer<typeof optionsFormSchema>

const amountField = z.string().refine(isPositiveDecimal, 'Informe um valor maior que zero.')

const horizonField = z
  .string()
  .refine((v) => /^\d+$/.test(v.trim()) && Number(v) > 0 && Number(v) <= 600, 'Informe os meses (1 a 600).')

export const entryBaseSchema = z.object({
  amount: amountField,
  horizonMonths: horizonField,
  goal: z.enum(['', ...GOALS]),
})

export const entryManualSchema = entryBaseSchema.extend({
  options: optionsFormSchema.shape.options,
})

export type EntryFormValues = z.infer<typeof entryManualSchema>

export const emptyOption: OptionFormValues = {
  assetType: 'CDB',
  indexer: 'CDI',
  rate: '',
  issuerName: '',
  issuerCnpj: '',
  maturityAt: '',
  liquidity: '',
  graceDays: '',
  minAmount: '',
}

export function toOptionFormValues(option: ComparisonOption): OptionFormValues {
  return {
    id: option.id,
    source: option.source,
    rawInput: option.rawInput,
    assetType: option.assetType as OptionFormValues['assetType'],
    indexer: option.indexer as OptionFormValues['indexer'],
    rate: toInputDecimal(option.rate),
    issuerName: option.issuerName ?? '',
    issuerCnpj: option.issuerCnpj ?? '',
    maturityAt: option.maturityAt ?? '',
    liquidity: (option.liquidity ?? '') as OptionFormValues['liquidity'],
    graceDays: option.graceDays?.toString() ?? '',
    minAmount: toInputDecimal(option.minAmount),
  }
}

/** Texto do formulário → corpo da API. Campo vazio vira `null` (ausente = limpo no PUT /options). */
export function toOptionInput(values: OptionFormValues): OptionInput {
  const graceDays = values.liquidity === 'GRACE_PERIOD' && values.graceDays.trim() ? Number(values.graceDays) : null

  return {
    ...(values.id ? { id: values.id } : {}),
    assetType: values.assetType,
    indexer: values.indexer,
    rate: normalizeDecimal(values.rate) as string,
    issuerName: values.issuerName.trim() || null,
    issuerCnpj: values.issuerCnpj.replace(/\D/g, '') || null,
    maturityAt: values.maturityAt || null,
    liquidity: values.liquidity || null,
    graceDays,
    minAmount: normalizeDecimal(values.minAmount),
    rawInput: values.rawInput ?? null,
  }
}

/** Valor de dinheiro digitado → string decimal para a API. */
export function toAmount(value: string): string {
  return new Decimal(normalizeDecimal(value) as string).toString()
}

/** Opção recente do backend → valores do formulário (nova opção, sem id nem origem). */
export function recentToFormValues(option: RecentOption): OptionFormValues {
  return {
    assetType: option.assetType as OptionFormValues['assetType'],
    indexer: option.indexer as OptionFormValues['indexer'],
    rate: toInputDecimal(option.rate),
    issuerName: option.issuerName ?? '',
    issuerCnpj: option.issuerCnpj ?? '',
    maturityAt: option.maturityAt ?? '',
    liquidity: (option.liquidity ?? '') as OptionFormValues['liquidity'],
    graceDays: option.graceDays?.toString() ?? '',
    minAmount: toInputDecimal(option.minAmount),
  }
}
