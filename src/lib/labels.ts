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

/** Nome do indexador como grupo (resumo da carteira), sem o sufixo de taxa. */
const indexerGroupLabels: Record<string, string> = {
  CDI: 'CDI',
  IPCA: 'IPCA +',
  PRE: 'Prefixado',
  SELIC: 'Selic +',
}

export const indexerGroupLabel = (value: string | null) =>
  value === null ? 'Sem indexador' : (indexerGroupLabels[value] ?? value)

export const assetTypeLabel =(value: string) => assetTypeLabels[value] ?? value
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

export const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH'] as const

const riskLabels: Record<string, { label: string; hint: string }> = {
  LOW: { label: 'Conservador', hint: 'Prefiro não ver meu dinheiro oscilar.' },
  MEDIUM: { label: 'Moderado', hint: 'Aceito oscilar um pouco por mais retorno.' },
  HIGH: { label: 'Arrojado', hint: 'Aceito oscilar bastante atrás de retorno maior.' },
}

export const riskLabel = (value: string) => riskLabels[value]?.label ?? value
export const riskHint = (value: string) => riskLabels[value]?.hint ?? ''
