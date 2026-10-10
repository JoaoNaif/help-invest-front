import { z } from 'zod'
import { isPositiveDecimal, normalizeDecimal, toInputDecimal } from '@/lib/decimal-input'
import { ASSET_TYPES, INDEXERS, LIQUIDITIES } from '@/lib/labels'
import type { Position, PositionInput, PositionPatch } from './api/portfolio'

const blankOr = (valid: (value: string) => boolean, message: string) =>
  z.string().refine((value) => value.trim() === '' || valid(value.trim()), message)

/** Uma posição como o formulário a enxerga: tudo texto. A conversão para a API fica em `toPositionInput`. */
export const positionFormSchema = z.object({
  assetType: z.enum(ASSET_TYPES, { message: 'Escolha o tipo.' }),
  name: z.string().trim().min(1, 'Dê um nome para a posição.'),
  investedAmount: z.string().refine(isPositiveDecimal, 'Informe um valor maior que zero.'),
  issuerName: z.string(),
  issuerCnpj: blankOr((v) => v.replace(/\D/g, '').length === 14, 'O CNPJ tem 14 dígitos.'),
  indexer: z.enum(['', ...INDEXERS]),
  rate: blankOr((v) => normalizeDecimal(v) !== null, 'Taxa inválida.'),
  investedAt: z.string(),
  maturityAt: z.string(),
  liquidity: z.enum(['', ...LIQUIDITIES]),
})

export type PositionFormValues = z.infer<typeof positionFormSchema>

export const emptyPosition: PositionFormValues = {
  assetType: 'CDB',
  name: '',
  investedAmount: '',
  issuerName: '',
  issuerCnpj: '',
  indexer: '',
  rate: '',
  investedAt: '',
  maturityAt: '',
  liquidity: '',
}

export function toPositionFormValues(position: Position): PositionFormValues {
  return {
    assetType: position.assetType as PositionFormValues['assetType'],
    name: position.name,
    investedAmount: toInputDecimal(position.investedAmount),
    issuerName: position.issuerName ?? '',
    issuerCnpj: position.issuerCnpj ?? '',
    indexer: (position.indexer ?? '') as PositionFormValues['indexer'],
    rate: toInputDecimal(position.rate),
    investedAt: position.investedAt ?? '',
    maturityAt: position.maturityAt ?? '',
    liquidity: (position.liquidity ?? '') as PositionFormValues['liquidity'],
  }
}

/** Campos opcionais vazios viram `null` (no PATCH, limpar o campo). Taxa só existe junto com indexador. */
export function toPositionInput(values: PositionFormValues): PositionInput {
  return {
    assetType: values.assetType,
    name: values.name.trim(),
    investedAmount: normalizeDecimal(values.investedAmount) ?? '0',
    issuerName: values.issuerName.trim() || null,
    issuerCnpj: values.issuerCnpj.replace(/\D/g, '') || null,
    indexer: values.indexer || null,
    rate: values.indexer ? normalizeDecimal(values.rate) : null,
    investedAt: values.investedAt || null,
    maturityAt: values.maturityAt || null,
    liquidity: values.liquidity || null,
  }
}

/**
 * PATCH só com o que mudou: campo ausente = não altera, `null` = limpa.
 * Compara a versão normalizada do original com a do formulário.
 */
export function toPositionPatch(original: Position, values: PositionFormValues): PositionPatch {
  const before = toPositionInput(toPositionFormValues(original))
  const after = toPositionInput(values)
  const patch: Record<string, string | null> = {}

  for (const key of Object.keys(after) as (keyof PositionInput)[]) {
    if (after[key] !== before[key]) patch[key] = after[key] ?? null
  }

  return patch as PositionPatch
}
