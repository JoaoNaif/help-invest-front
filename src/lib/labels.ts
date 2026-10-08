// Rótulos em português dos enums do backend (docs/02, regra 5). Valor desconhecido cai no próprio código.

export const ASSET_TYPES = [
  'CDB',
  'LCI',
  'LCA',
  'LC',
  'TESOURO',
  'DEBENTURE',
  'CRI',
  'CRA',
  'ACAO',
  'FII',
  'FUNDO',
  'CRIPTO',
  'OUTRO',
] as const

/** Só renda fixa entra no comparador; os demais dão 422 no evaluate. */
export const COMPARABLE_ASSET_TYPES = [
  'CDB',
  'LCI',
  'LCA',
  'LC',
  'TESOURO',
  'DEBENTURE',
  'CRI',
  'CRA',
] as const

export const INDEXERS = ['CDI', 'IPCA', 'PRE', 'SELIC'] as const
export const LIQUIDITIES = ['DAILY', 'AT_MATURITY', 'GRACE_PERIOD'] as const

const assetTypeLabels: Record<string, string> = {
  CDB: 'CDB',
  LCI: 'LCI',
  LCA: 'LCA',
  LC: 'LC',
  TESOURO: 'Tesouro Direto',
  DEBENTURE: 'Debênture',
  CRI: 'CRI',
  CRA: 'CRA',
  ACAO: 'Ação',
  FII: 'FII',
  FUNDO: 'Fundo',
  CRIPTO: 'Cripto',
  OUTRO: 'Outro',
}

const indexerLabels: Record<string, string> = {
  CDI: '% do CDI',
  IPCA: 'IPCA +',
  PRE: 'Prefixado',
  SELIC: 'Selic +',
}

const liquidityLabels: Record<string, string> = {
  DAILY: 'Liquidez diária',
  AT_MATURITY: 'Só no vencimento',
  GRACE_PERIOD: 'Diária após carência',
}

export const assetTypeLabel = (value: string) => assetTypeLabels[value] ?? value
export const indexerLabel = (value: string) => indexerLabels[value] ?? value
export const liquidityLabel = (value: string) => liquidityLabels[value] ?? value

/** Dica do campo "taxa" conforme o indexador. */
export function rateHint(indexer: string): string {
  switch (indexer) {
    case 'CDI':
      return 'Ex.: 110 (% do CDI)'
    case 'IPCA':
      return 'Ex.: 6,5 (IPCA + 6,5% a.a.)'
    case 'SELIC':
      return 'Ex.: 0,1 (Selic + 0,1%)'
    default:
      return 'Ex.: 14,2 (% a.a.)'
  }
}

export const GOALS = ['RESERVE', 'RETIREMENT', 'PURCHASE', 'GROWTH'] as const

const goalLabels: Record<string, string> = {
  RESERVE: 'Reserva de emergência',
  RETIREMENT: 'Aposentadoria',
  PURCHASE: 'Uma compra (carro, imóvel, viagem...)',
  GROWTH: 'Fazer o dinheiro render mais',
}

export const goalLabel = (value: string) => goalLabels[value] ?? value
