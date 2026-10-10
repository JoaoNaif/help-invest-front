import { z } from 'zod'
import { alertSchema } from '@/lib/alerts'
import { api } from '@/lib/api'

// Nesta seção o backend manda strings com 2 casas e `null` = dado indisponível (nunca zero).
// Tudo que não é essencial é lido de forma defensiva: campo novo ou ausente não quebra a tela.
const str = z.string().nullish()

const multipleSchema = z.object({
  value: str,
  peerMedian: str,
  diffPercent: str,
  verdict: z.string().catch('UNAVAILABLE'),
})

export const stockItemSchema = z.object({
  ticker: z.string(),
  name: z.string().nullish(),
  sector: str,
  price: str,
  priceDate: str,
  plannedAmount: str,
  source: str,
  fundamentals: z
    .object({
      priceToEarnings: str,
      priceToBook: str,
      earningsPerShare: str,
      bookValuePerShare: str,
      returnOnEquity: str,
    })
    .nullish(),
  dividends: z
    .object({
      trailing12mPerShare: str,
      trailing12mYield: str,
      averageAnnualPerShare: str,
      yearsCovered: z.number().nullish(),
      yearsWithPayment: z.number().nullish(),
      consistent: z.boolean().nullish(),
      upcoming: z.object({ exDate: z.string(), amountPerShare: str }).nullish(),
    })
    .nullish(),
  ceilingPrices: z
    .array(z.object({ method: z.string(), value: str, upsidePercent: str }))
    .nullish()
    .transform((value) => value ?? []),
  valuation: z
    .object({
      group: str,
      priceToEarnings: multipleSchema.nullish(),
      priceToBook: multipleSchema.nullish(),
      peers: z
        .array(
          z.object({
            ticker: z.string(),
            name: str,
            priceToEarnings: str,
            priceToBook: str,
            dividendYield: str,
          }),
        )
        .nullish()
        .transform((value) => value ?? []),
      peersUnavailable: z
        .array(z.string())
        .nullish()
        .transform((value) => value ?? []),
    })
    .nullish(),
  consensus: z
    .object({
      analystCount: z.number(),
      buy: z.number().nullish(),
      hold: z.number().nullish(),
      sell: z.number().nullish(),
      targetPrice: str,
    })
    .nullish(),
  alerts: z
    .array(alertSchema)
    .nullish()
    .transform((value) => value ?? []),
})

export type StockItem = z.infer<typeof stockItemSchema>

export const stockAnalysisSchema = z.object({
  id: z.string(),
  tickers: z.array(z.string()),
  createdAt: z.string(),
  result: z.object({
    items: z.array(stockItemSchema),
    alerts: z
      .array(alertSchema)
      .nullish()
      .transform((value) => value ?? []),
  }),
  // Premissas não são contrato estável: lidas de forma solta no painel "como calculamos".
  assumptions: z.record(z.string(), z.unknown()).nullish(),
})

export type StockAnalysis = z.infer<typeof stockAnalysisSchema>

export type StockAnalysisInput = { items: { ticker: string; amount?: string }[] }

export async function createStockAnalysis(input: StockAnalysisInput): Promise<StockAnalysis> {
  const { data } = await api.post('/stock-analyses', input)
  return z.object({ analysis: stockAnalysisSchema }).parse(data).analysis
}

export async function fetchStockAnalysis(id: string): Promise<StockAnalysis> {
  const { data } = await api.get(`/stock-analyses/${id}`)
  return z.object({ analysis: stockAnalysisSchema }).parse(data).analysis
}

export async function fetchStockAnalyses(page = 1): Promise<StockAnalysis[]> {
  const { data } = await api.get('/stock-analyses', { params: { page } })
  return z.object({ analyses: z.array(stockAnalysisSchema) }).parse(data).analyses
}
