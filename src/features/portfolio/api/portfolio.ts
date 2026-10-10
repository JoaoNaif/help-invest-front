import { z } from 'zod'
import { alertSchema } from '@/lib/alerts'
import { api } from '@/lib/api'

export const positionSchema = z.object({
  id: z.string(),
  assetType: z.string(),
  name: z.string(),
  issuerName: z.string().nullable(),
  issuerCnpj: z.string().nullable(),
  investedAmount: z.string(),
  indexer: z.string().nullable(),
  rate: z.string().nullable(),
  investedAt: z.string().nullable(),
  maturityAt: z.string().nullable(),
  liquidity: z.string().nullable(),
  source: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Position = z.infer<typeof positionSchema>

const slice = z.object({ amount: z.string(), percentage: z.string() })

export const summarySchema = z.object({
  total: z.string(),
  byAssetType: z.array(slice.extend({ key: z.string() })),
  // Posições sem indexador (ex.: ações) chegam com `key: null`.
  byIndexer: z.array(slice.extend({ key: z.string().nullable() })),
  byIssuer: z.array(
    slice.extend({
      issuerCnpj: z.string().nullable(),
      issuerName: z.string().nullable(),
      fgcCoveredAmount: z.string(),
      fgcUncoveredAmount: z.string(),
    }),
  ),
  alerts: z.array(alertSchema),
})

export type PortfolioSummary = z.infer<typeof summarySchema>
export type SummarySlice = { key: string | null; amount: string; percentage: string }

/** Corpo do POST. Opcionais ausentes ficam de fora; no PATCH, `null` limpa o campo. */
export type PositionInput = {
  assetType: string
  name: string
  investedAmount: string
  issuerName?: string | null
  issuerCnpj?: string | null
  indexer?: string | null
  rate?: string | null
  investedAt?: string | null
  maturityAt?: string | null
  liquidity?: string | null
}

export type PositionPatch = Partial<PositionInput>

export async function fetchPositions(): Promise<Position[]> {
  const { data } = await api.get('/positions')
  return z.object({ positions: z.array(positionSchema) }).parse(data).positions
}

export async function fetchSummary(): Promise<PortfolioSummary> {
  const { data } = await api.get('/portfolio/summary')
  return z.object({ summary: summarySchema }).parse(data).summary
}

export async function createPosition(input: PositionInput): Promise<Position> {
  const { data } = await api.post('/positions', input)
  return z.object({ position: positionSchema }).parse(data).position
}

export async function updatePosition(id: string, patch: PositionPatch): Promise<Position> {
  const { data } = await api.patch(`/positions/${id}`, patch)
  return z.object({ position: positionSchema }).parse(data).position
}

export async function deletePosition(id: string): Promise<void> {
  await api.delete(`/positions/${id}`)
}
