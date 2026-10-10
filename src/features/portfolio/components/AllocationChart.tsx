import Decimal from 'decimal.js'
import { useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { formatMoney, formatPercent } from '@/lib/format'
import { assetTypeLabel, indexerGroupLabel } from '@/lib/labels'
import type { PortfolioSummary, SummarySlice } from '../api/portfolio'

type Grouping = 'type' | 'indexer'

// Categóricas sem vermelho/laranja: essas cores são reservadas para alertas.
const COLORS = ['#c9a24b', '#7d9bb8', '#4fb286', '#9a8fc4', '#c4896b', '#6fb3b8', '#b5b5a8', '#8a7f5a']

const tabs: { value: Grouping; label: string }[] = [
  { value: 'type', label: 'Por tipo' },
  { value: 'indexer', label: 'Por indexador' },
]

export function AllocationChart({ summary }: { summary: PortfolioSummary }) {
  const [grouping, setGrouping] = useState<Grouping>('type')

  const slices: SummarySlice[] = grouping === 'type' ? summary.byAssetType : summary.byIndexer
  const labelOf = (key: string | null) =>
    grouping === 'type' ? assetTypeLabel(key ?? '') : indexerGroupLabel(key)

  // Só o tamanho das fatias: o percentual exibido é o que o backend calculou.
  const data = slices.map((slice) => ({ name: labelOf(slice.key), value: new Decimal(slice.amount).toNumber() }))

  return (
    <section className="space-y-4 rounded-xl border border-border bg-surface p-4">
      <div role="tablist" aria-label="Agrupar alocação" className="grid grid-cols-2 rounded-lg bg-surface-2 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={grouping === tab.value}
            onClick={() => setGrouping(tab.value)}
            className={`h-9 cursor-pointer rounded-md text-sm transition-colors ${
              grouping === tab.value ? 'bg-surface text-gold shadow-sm' : 'text-muted hover:text-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid items-center gap-4 sm:grid-cols-2">
        <div className="h-52" aria-hidden>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="62%"
                outerRadius="95%"
                stroke="var(--color-surface)"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="space-y-2">
          {slices.map((slice, index) => (
            <li key={slice.key ?? 'none'} className="flex items-center gap-2 text-sm">
              <span
                className="size-3 shrink-0 rounded-sm"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate">{labelOf(slice.key)}</span>
              <span className="tabular-nums text-muted">{formatMoney(slice.amount)}</span>
              <span className="w-14 text-right font-medium tabular-nums">{formatPercent(slice.percentage, 1)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
