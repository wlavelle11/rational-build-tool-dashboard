import type { DealMetrics } from '@/lib/finance/types'
import { formatCurrency, formatPercent, formatMultiple } from '@/lib/formatters'

interface Props { metrics: DealMetrics }

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export function MetricsCards({ metrics }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <MetricCard label="Going-in Cap Rate" value={formatPercent(metrics.year1CapRate)} sub="NOI / Purchase Price" />
      <MetricCard label="Year 1 Cash-on-Cash" value={formatPercent(metrics.year1CashOnCash)} sub="Annual CF / Equity" />
      <MetricCard label="IRR" value={formatPercent(metrics.irr)} sub="Investor IRR" />
      <MetricCard label="Equity Multiple" value={formatMultiple(metrics.equityMultiple)} sub="Total Distributions / Equity" />
      <MetricCard label="Exit Valuation" value={formatCurrency(metrics.exitValuation)} sub="Final NOI / Exit Cap" />
      <MetricCard label="Total Value Creation" value={formatCurrency(metrics.totalValueCreation)} sub="Exit Value − Purchase Price" />
      <MetricCard label="Cumulative Cash Flow" value={formatCurrency(metrics.cumulativeCashFlow)} sub="Sum of Annual NOI" />
      <MetricCard label="Year 1 NOI" value={formatCurrency(metrics.year1NOI)} sub="Net Operating Income" />
      <MetricCard label="Deal Score" value={`${metrics.dealScore}/100`} sub="Weighted composite score" />
    </div>
  )
}
