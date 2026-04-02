'use client'

import type { ADUMetrics } from '@/lib/finance/adu'
import { formatCurrency, formatPercent, formatMultiple } from '@/lib/formatters'

interface Props {
  metrics: ADUMetrics
}

function MetricCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: 'positive' | 'warning' | 'negative' }) {
  const color = highlight === 'positive' ? 'var(--color-success)' : highlight === 'warning' ? 'var(--color-warning)' : highlight === 'negative' ? 'var(--color-danger)' : 'var(--color-text-primary)'
  return (
    <div className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value" style={{ color }}>{value}</p>
      {sub && <p className="metric-sub">{sub}</p>}
    </div>
  )
}

function RecBadge({ rec, score }: { rec: string; score: number }) {
  const cfg: Record<string, string> = { 'Strong Buy': 'badge badge-success', 'Caution': 'badge badge-warning', 'Pass': 'badge badge-danger' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <span className={cfg[rec] ?? 'badge'}>
        <span className="badge-dot" />
        {rec}
      </span>
      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Score: {score}/100</span>
    </div>
  )
}

export function ADUMetricsPanel({ metrics }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <RecBadge rec={metrics.recommendation} score={metrics.dealScore} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <MetricCard label="Year 1 NOI" value={formatCurrency(metrics.year1NOI)} highlight="positive" />
        <MetricCard label="Year 10 NOI" value={formatCurrency(metrics.year10NOI)} sub="5.5% growth" highlight="positive" />
        <MetricCard label="Exit Value" value={formatCurrency(metrics.exitValue)} sub="@ exit cap rate" />
        <MetricCard label="Equity Gain" value={formatCurrency(metrics.projectedEquityGain)} highlight={metrics.projectedEquityGain > 0 ? 'positive' : 'negative'} />
        <MetricCard label="Cumulative Cash Flow" value={formatCurrency(metrics.cumulativeCashFlow)} sub="Over hold period" highlight="positive" />
        <MetricCard label="Total Value Creation" value={formatCurrency(metrics.totalValueCreation)} highlight="positive" />
        <MetricCard label="Equity Multiple" value={formatMultiple(metrics.equityMultiple)} highlight={metrics.equityMultiple >= 1.8 ? 'positive' : metrics.equityMultiple >= 1.5 ? 'warning' : 'negative'} />
        <MetricCard label="IRR (Unlevered)" value={formatPercent(metrics.irr)} highlight={metrics.irr >= 0.10 ? 'positive' : metrics.irr >= 0.07 ? 'warning' : 'negative'} />
      </div>

      <div className="card" style={{ padding: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-tertiary)', marginBottom: 10 }}>Investor Waterfall</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { label: `LP Pref (${formatPercent(6/100)}/yr)`, value: formatCurrency(metrics.lpPreferredPaid) },
            { label: 'Capital Returned', value: formatCurrency(metrics.lpCapitalReturned) },
            { label: 'Investor Profit (30%)', value: formatCurrency(metrics.investorProfit) },
            { label: 'Sponsor Profit (70%)', value: formatCurrency(metrics.sponsorProfit) },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
