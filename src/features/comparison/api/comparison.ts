import { z } from 'zod'
import { api } from '@/lib/api'

export const alertSchema = z.object({
  code: z.string(),
  // Severidade desconhecida não quebra a tela: cai em INFO.
  severity: z.enum(['INFO', 'WARNING', 'DANGER']).catch('INFO'),
  message: z.string(),
})

export type Alert = z.infer<typeof alertSchema>

export const optionSchema = z.object({
  id: z.string(),
  assetType: z.string(),
  issuerName: z.string().nullable(),
  issuerCnpj: z.string().nullable(),
  indexer: z.string(),
  rate: z.string(),
  maturityAt: z.string().nullable(),
  liquidity: z.string().nullable(),
  graceDays: z.number().nullable(),
  minAmount: z.string().nullable(),
  netAnnualRate: z.string().nullable(),
  alerts: z.array(alertSchema),
  rawInput: z.string().nullable(),
  source: z.enum(['MANUAL', 'LLM_EXTRACTED']).catch('MANUAL'),
  createdAt: z.string(),
})

export type ComparisonOption = z.infer<typeof optionSchema>

export const comparisonSchema = z.object({
  id: z.string(),
  amount: z.string(),
  horizonMonths: z.number(),
  status: z.enum(['DRAFT', 'CONFIRMED', 'DONE']),
  assumptions: z.unknown(),
  chosenOptionId: z.string().nullable(),
  goal: z.string().nullish(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Comparison = z.infer<typeof comparisonSchema>

const withOptionsSchema = z.object({
  comparison: comparisonSchema,
  options: z.array(optionSchema),
})

/**
 * Explicação com resumo, indicação e prós/contras (formato novo) ou texto corrido (formato antigo).
 * O front aceita os dois até o backend migrar; ver docs/01-decisoes.md.
 */
const structuredExplanationSchema = z.object({
  summary: z.string(),
  bestOptionId: z.string().nullish(),
  bestReason: z.string().nullish(),
  options: z
    .array(z.object({ optionId: z.string(), pros: z.array(z.string()), cons: z.array(z.string()) }))
    .default([]),
})

export const explanationSchema = z.union([structuredExplanationSchema, z.string()])

export type Explanation = z.infer<typeof explanationSchema>

const detailSchema = withOptionsSchema.extend({ explanation: explanationSchema.nullable() })

export type ComparisonDetail = z.infer<typeof detailSchema>

const comparisonSummarySchema = comparisonSchema.extend({
  optionsCount: z.number().nullish(),
  /** Melhor opção; null enquanto a comparação não foi avaliada. */
  topOption: z
    .object({
      issuerName: z.string().nullable(),
      assetType: z.string(),
      netAnnualRate: z.string().nullable(),
    })
    .nullish(),
})

export type ComparisonSummary = z.infer<typeof comparisonSummarySchema>

const listSchema = z.object({ comparisons: z.array(comparisonSummarySchema) })

const recentOptionSchema = z.object({
  assetType: z.string(),
  issuerName: z.string().nullable(),
  issuerCnpj: z.string().nullable(),
  indexer: z.string(),
  rate: z.string(),
  maturityAt: z.string().nullable(),
  liquidity: z.string().nullable(),
  graceDays: z.number().nullable(),
  minAmount: z.string().nullable(),
})

export type RecentOption = z.infer<typeof recentOptionSchema>

/** Corpo de uma opção enviado ao backend (POST manual e PUT /options). */
export type OptionInput = {
  id?: string
  assetType: string
  indexer: string
  rate: string
  issuerName: string | null
  issuerCnpj: string | null
  maturityAt: string | null
  liquidity: string | null
  graceDays: number | null
  minAmount: string | null
  rawInput: string | null
}

export type CreateComparisonInput = {
  amount: string
  horizonMonths: number
  /** Objetivo opcional deste dinheiro (RESERVE, RETIREMENT, PURCHASE, GROWTH). */
  goal?: string
  input:
    | { type: 'manual'; options: OptionInput[] }
    | { type: 'text'; text: string }
    | { type: 'image'; base64: string; mediaType: 'image/png' | 'image/jpeg' | 'image/webp' }
}

export async function createComparison(body: CreateComparisonInput) {
  const { data } = await api.post('/comparisons', body)
  return withOptionsSchema.parse(data)
}

export async function fetchComparison(id: string): Promise<ComparisonDetail> {
  const { data } = await api.get(`/comparisons/${id}`)
  return detailSchema.parse(data)
}

export async function fetchComparisons(page = 1) {
  const { data } = await api.get('/comparisons', { params: { page } })
  return listSchema.parse(data).comparisons
}

export async function reviewOptions(id: string, options: OptionInput[]) {
  const { data } = await api.put(`/comparisons/${id}/options`, { options })
  return withOptionsSchema.parse(data)
}

export async function evaluateComparison(id: string) {
  const { data } = await api.post(`/comparisons/${id}/evaluate`)
  return withOptionsSchema.parse(data)
}

export async function explainComparison(id: string): Promise<Explanation> {
  const { data } = await api.post(`/comparisons/${id}/explanation`)
  return z.object({ explanation: explanationSchema }).parse(data).explanation
}

export async function chooseOption(id: string, optionId: string) {
  const { data } = await api.put(`/comparisons/${id}/chosen-option`, { optionId })
  return z.object({ comparison: comparisonSchema }).parse(data).comparison
}

/** Até 8 opções distintas já usadas pelo usuário, só com dados de entrada. */
export async function fetchRecentOptions(): Promise<RecentOption[]> {
  const { data } = await api.get('/comparison-options/recent')
  return z.object({ options: z.array(recentOptionSchema) }).parse(data).options
}
