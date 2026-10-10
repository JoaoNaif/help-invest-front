import Decimal from 'decimal.js'
import { CircleCheck, CircleMinus, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { AlertList } from '@/components/ui/AlertList'
import {
  formatCalendarDate,
  formatFixed,
  formatMoney,
  formatMoneyOrDash,
  formatPercentOrDash,
  formatTimestampDate,
} from '@/lib/format'
import { ceilingMethodName, ceilingMethodPremise, verdictLabel } from '@/lib/labels'
import type { StockItem } from '../api/stocks'

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-2 border-t border-border pt-4">
      <h3 className="text-base font-medium">{title}</h3>
      {hint && <p className="text-xs text-muted">{hint}</p>}
      {children}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-2 px-3 py-2">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium tabular-nums">{value}</dd>
    </div>
  )
}

const verdictColor: Record<string, string> = {
  CHEAP: 'text-gain',
  EXPENSIVE: 'text-loss',
}

export function StockCard({ item }: { item: StockItem }) {
  const { fundamentals, dividends, valuation, consensus } = item

  return (
    <article className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
      <header className="space-y-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <h2 className="text-2xl">{item.ticker}</h2>
          <p className="text-xl font-medium tabular-nums">{formatMoneyOrDash(item.price)}</p>
        </div>
        <p className="text-sm text-muted">{[item.name, item.sector].filter(Boolean).join(' · ')}</p>
        <p className="text-xs text-muted">
          {item.priceDate ? `Cotação de ${formatTimestampDate(item.priceDate)}` : 'Cotação sem data'}
          {item.source && ` · Fonte: ${item.source}`}
        </p>
        {item.plannedAmount && (
          <p className="text-sm">
            <span className="text-muted">Aporte planejado: </span>
            <span className="tabular-nums">{formatMoney(item.plannedAmount)}</span>
          </p>
        )}
      </header>

      <AlertList alerts={item.alerts} />

      <Section title="Indicadores">
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Stat label="P/L" value={formatFixed(fundamentals?.priceToEarnings)} />
          <Stat label="P/VP" value={formatFixed(fundamentals?.priceToBook)} />
          <Stat label="ROE" value={formatPercentOrDash(fundamentals?.returnOnEquity)} />
          <Stat label="Lucro por ação" value={formatMoneyOrDash(fundamentals?.earningsPerShare)} />
          <Stat label="Valor patrimonial por ação" value={formatMoneyOrDash(fundamentals?.bookValuePerShare)} />
        </dl>
      </Section>

      <Section
        title="Dividendos"
        hint="Valores brutos (IR do JCP não descontado), na data ex."
      >
        {dividends ? (
          <>
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Stat label="Yield em 12 meses" value={formatPercentOrDash(dividends.trailing12mYield)} />
              <Stat label="Pago em 12 meses (por ação)" value={formatMoneyOrDash(dividends.trailing12mPerShare)} />
              <Stat label="Média anual (por ação)" value={formatMoneyOrDash(dividends.averageAnnualPerShare)} />
            </dl>
            <ul className="space-y-1 text-sm">
              {dividends.yearsCovered != null && (
                <li className="text-muted">
                  Baseado em {dividends.yearsCovered} {dividends.yearsCovered === 1 ? 'ano' : 'anos'} de histórico
                  {dividends.yearsWithPayment != null && `, com pagamento em ${dividends.yearsWithPayment}`}.
                </li>
              )}
              {dividends.consistent != null && (
                <ConsistencyLine
                  icon={dividends.consistent ? CircleCheck : CircleMinus}
                  text={
                    dividends.consistent
                      ? 'Pagou em todos os anos cobertos.'
                      : 'Não pagou em todos os anos cobertos.'
                  }
                />
              )}
              {dividends.upcoming && (
                <li>
                  Próximo provento: data ex {formatCalendarDate(dividends.upcoming.exDate)}
                  {dividends.upcoming.amountPerShare && ` · ${formatMoney(dividends.upcoming.amountPerShare)} por ação`}
                </li>
              )}
            </ul>
          </>
        ) : (
          <p className="text-sm text-muted">Sem dados de dividendos.</p>
        )}
      </Section>

      <Section
        title="Preço teto"
        hint="Referência de método, não previsão. Cada método tem uma premissa própria."
      >
        {item.ceilingPrices.length === 0 ? (
          <p className="text-sm text-muted">Sem dados suficientes para calcular (ex.: lucro negativo).</p>
        ) : (
          <ul className="space-y-3">
            {item.ceilingPrices.map((ceiling) => (
              <li key={ceiling.method} className="rounded-lg bg-surface-2 px-3 py-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{ceilingMethodName(ceiling.method)}</span>
                  <span className="font-medium tabular-nums">{formatMoneyOrDash(ceiling.value)}</span>
                </div>
                <p className="text-xs text-muted">Premissa: {ceilingMethodPremise(ceiling.method)}</p>
                {ceiling.upsidePercent != null && (
                  <p className="mt-1 text-sm">
                    {new Decimal(ceiling.upsidePercent).gte(0)
                      ? `Preço atual ${formatPercentOrDash(ceiling.upsidePercent)} abaixo do teto.`
                      : `Preço atual ${formatPercentOrDash(new Decimal(ceiling.upsidePercent).abs().toString())} acima do teto.`}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="Comparação com concorrentes"
        hint="Mediana do grupo; até 15% de diferença conta como na média."
      >
        {valuation?.group ? (
          <>
            <p className="text-sm text-muted">Grupo: {valuation.group}</p>
            <ul className="space-y-2">
              {(
                [
                  ['P/L', valuation.priceToEarnings],
                  ['P/VP', valuation.priceToBook],
                ] as const
              ).map(([label, multiple]) =>
                multiple ? (
                  <li key={label} className="rounded-lg bg-surface-2 px-3 py-2 text-sm">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-medium">
                        {label}: <span className="tabular-nums">{formatFixed(multiple.value)}</span>
                      </span>
                      <span className={verdictColor[multiple.verdict] ?? 'text-muted'}>
                        {verdictLabel(multiple.verdict)}
                      </span>
                    </div>
                    <p className="text-xs text-muted">
                      Mediana dos concorrentes: <span className="tabular-nums">{formatFixed(multiple.peerMedian)}</span>
                      {multiple.diffPercent != null && ` · diferença de ${formatPercentOrDash(multiple.diffPercent)}`}
                    </p>
                  </li>
                ) : null,
              )}
            </ul>

            {valuation.peers.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[20rem] text-sm">
                  <thead className="text-left text-xs text-muted">
                    <tr>
                      <th className="py-1 pr-3 font-normal">Concorrente</th>
                      <th className="px-3 py-1 text-right font-normal">P/L</th>
                      <th className="px-3 py-1 text-right font-normal">P/VP</th>
                      <th className="py-1 pl-3 text-right font-normal">Yield</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border tabular-nums">
                    {valuation.peers.map((peer) => (
                      <tr key={peer.ticker}>
                        <td className="py-1.5 pr-3">{peer.ticker}</td>
                        <td className="px-3 py-1.5 text-right">{formatFixed(peer.priceToEarnings)}</td>
                        <td className="px-3 py-1.5 text-right">{formatFixed(peer.priceToBook)}</td>
                        <td className="py-1.5 pl-3 text-right">{formatPercentOrDash(peer.dividendYield)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {valuation.peersUnavailable.length > 0 && (
              <p className="text-xs text-muted">
                Sem resposta da fonte para: {valuation.peersUnavailable.join(', ')}.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted">Ainda não temos concorrentes cadastrados para este setor.</p>
        )}
      </Section>

      <Section
        title="Tendência dos analistas"
        hint="O que o conjunto de analistas diz, não a opinião de um especialista."
      >
        {consensus ? (
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">{consensus.analystCount}</span>{' '}
              {consensus.analystCount === 1 ? 'analista' : 'analistas'}
              {[
                consensus.buy != null && `${consensus.buy} compra`,
                consensus.hold != null && `${consensus.hold} neutro`,
                consensus.sell != null && `${consensus.sell} venda`,
              ]
                .filter(Boolean)
                .map((part, index) => (index === 0 ? `: ${part}` : ` · ${part}`))
                .join('')}
            </p>
            {consensus.targetPrice && (
              <p className="text-muted">
                Preço-alvo médio: <span className="tabular-nums">{formatMoney(consensus.targetPrice)}</span>
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">Sem cobertura de analistas.</p>
        )}
      </Section>
    </article>
  )
}

function ConsistencyLine({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <Icon className="size-4 shrink-0 text-muted" aria-hidden />
      {text}
    </li>
  )
}
