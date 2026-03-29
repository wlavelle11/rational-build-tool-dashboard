import type { DealMetrics } from '@/lib/finance/types'
import { formatCurrency, formatPercent, formatMultiple } from '@/lib/formatters'

interface Props { metrics: DealMetrics }

type Trend = 'positive' | 'warning' | 'negative' | ''

function getTrend(value: number, good: number, ok: number): Trend {
  if (value >= good) return 'positive'
  if (value >= ok)   return 'warning'
  return 'negative'
}

interface MetricCardProps {
  label: string
  value: string
  sub: string
  trend?: Trend
}

function MetricCard({ label, value, sub, trend = '' }: MetricCardProps) {
  return (
    <div className="metric-card">
      <p className="metric-label">{label}</p>
      <p className={`metric-value ${trend}`}>{value}</p>
      <p className="metric-sub">{sub}</p>
    </div>
  )
}

export function MetricsCards({ metrics }: Props) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: 12,
    }}>
      <MetricCard
        label="Going-in Cap Rate"
        value={formatPercent(metrics.year1CapRate)}
        sub="NOI / Purchase Price"
        trend={getTrend(metrics.year1CapRate, 0.055, 0.045)}
      />
      <MetricCard
        label="Year 1 Cash-on-Cash"
        value={formatPercent(metrics.year1CashOnCash)}
        sub="Annual CF / Equity"
        trend={getTrend(metrics.year1CashOnCash, 0.07, 0.05)}
      />
      <MetricCard
        label="IRR"
        value={formatPercent(metrics.irr)}
        sub="Investor IRR"
        trend={getTrend(metrics.irr, 0.15, 0.10)}
      />
      <MetricCard
        label="Equity Multiple"
        value={formatMultiple(metrics.equityMultiple)}
        sub="Distributions / Equity"
        trend={getTrend(metrics.equityMultiple, 2.0, 1.5)}
      />
      <MetricCard
        label="Exit Valuation"
        value={formatCurrency(metrics.exitValuation)}
        sub="Final NOI / Exit Cap"
      />
      <MetricCard
        label="Value Creation"
        value={formatCurrency(metrics.totalValueCreation)}
        sub="Exit Value − Purchase Price"
      />
      <MetricCard
        label="Cumulative CF"
        value={formatCurrency(metrics.cumulativeCashFlow)}
        sub="Sum of Annual Cash Flow"
      />
      <MetricCard
        label="Year 1 NOI"
        value={formatCurrency(metrics.year1NOI)}
        sub="Net Operating Income"
      />
      <MetricCard
        label="Deal Score"
        value={`${metrics.dealScore}/100`}
        sub="Weighted composite"
        trend={getTrend(metrics.dealScore, 80, 60)}
      />
    </div>
  )
}
