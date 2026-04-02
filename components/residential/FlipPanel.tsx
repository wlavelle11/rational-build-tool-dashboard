'use client'

import type { FlipMetrics } from '@/lib/finance/flip'
import { formatCurrency, formatPercent } from '@/lib/formatters'

interface Props {
  metrics: FlipMetrics
  financingType: 'cash' | 'hard_money'
}

function MetricRow({ label, value, highlight }: { label: string; value: string; highlight?: 'positive' | 'negative' | 'neutral' }) {
  const colorMap = {
    positive: 'var(--color-success)',
    negative: 'var(--color-danger)',
    neutral: 'var(--color-text-secondary)',
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: highlight ? colorMap[highlight] : 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
    </div>
  )
}

function RecBadge({ rec, score }: { rec: string; score: number }) {
  const cfg: Record<string, string> = {
    'Strong Buy': 'badge badge-success',
    'Caution': 'badge badge-warning',
    'Pass': 'badge badge-danger',
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span className={cfg[rec] ?? 'badge'}>
        <span className="badge-dot" />
        {rec}
      </span>
      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Score: {score}/100</span>
    </div>
  )
}

export function FlipPanel({ metrics, financingType }: Props) {
  const profitColor = metrics.grossProfit >= 0 ? 'positive' : 'negative'
  const returnColor = metrics.totalInvestorReturn >= 0 ? 'positive' : 'negative'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-tertiary)' }}>
          Flip Results
        </p>
        <RecBadge rec={metrics.recommendation} score={metrics.dealScore} />
      </div>

      <div className="card" style={{ padding: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Project Costs
        </p>
        <MetricRow label="Total Project Cost" value={formatCurrency(metrics.totalProjectCost)} />
        <MetricRow label="Sell-Side Closing Costs" value={formatCurrency(metrics.sellClosingCosts)} />
        {financingType === 'hard_money' && (
          <MetricRow label="Hard Money Costs" value={formatCurrency(metrics.hardMoneyCosts)} />
        )}
        <MetricRow label="Net Sale Proceeds" value={formatCurrency(metrics.netSaleProceeds)} />
        <MetricRow label="Gross Profit" value={formatCurrency(metrics.grossProfit)} highlight={profitColor} />
        <MetricRow label="Profit Margin" value={formatPercent(metrics.profitMargin)} highlight={profitColor} />
      </div>

      <div className="card" style={{ padding: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Investor Returns
        </p>
        <MetricRow label="Loan Fee (1%)" value={formatCurrency(metrics.loanFee)} />
        <MetricRow label="Interest (10% annualized)" value={formatCurrency(metrics.interest)} />
        <MetricRow label="Net Project Profit" value={formatCurrency(metrics.netProjectProfit)} highlight={profitColor} />
        <MetricRow label="Investor Profit Share (33.33%)" value={formatCurrency(metrics.investorProfitShare)} highlight="positive" />
        <MetricRow label="Total Investor Return" value={formatCurrency(metrics.totalInvestorReturn)} highlight={returnColor} />
      </div>

      <div className="card" style={{ padding: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Performance
        </p>
        <MetricRow label="ROI" value={formatPercent(metrics.roi)} highlight={metrics.roi > 0 ? 'positive' : 'negative'} />
        <MetricRow label="Annualized ROI" value={formatPercent(metrics.annualizedRoi)} highlight={metrics.annualizedRoi > 0 ? 'positive' : 'negative'} />
      </div>
    </div>
  )
}
