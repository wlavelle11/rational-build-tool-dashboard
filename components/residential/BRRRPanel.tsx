'use client'

import type { BRRRMetrics } from '@/lib/finance/brrr'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { CheckCircle2, XCircle } from 'lucide-react'

interface Props {
  metrics: BRRRMetrics
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

export function BRRRPanel({ metrics, financingType }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-tertiary)' }}>
          BRRR Results
        </p>
        <RecBadge rec={metrics.recommendation} score={metrics.dealScore} />
      </div>

      <div className="card" style={{ padding: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Refinance
        </p>
        {financingType === 'hard_money' && (
          <MetricRow label="Bridge Loan Costs" value={formatCurrency(metrics.bridgeLoanCosts)} />
        )}
        <MetricRow label="Refinance Loan Amount" value={formatCurrency(metrics.refinanceLoanAmount)} />
        <MetricRow label="Capital Returned via Refi" value={formatCurrency(metrics.capitalReturnedViaRefi)} highlight="positive" />
        <MetricRow label="Remaining Capital at Risk" value={formatCurrency(metrics.remainingCapitalAtRisk)} highlight={metrics.remainingCapitalAtRisk === 0 ? 'positive' : 'neutral'} />
      </div>

      <div className="card" style={{ padding: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Monthly Cash Flow
        </p>
        <MetricRow label="Gross Rent" value={formatCurrency(metrics.monthlyGrossRent)} />
        <MetricRow label="Operating Expenses" value={`− ${formatCurrency(metrics.monthlyOperatingExpenses)}`} />
        <MetricRow label="Operating Reserve" value={`− ${formatCurrency(metrics.monthlyReserve)}`} />
        <MetricRow label="Mortgage Payment" value={`− ${formatCurrency(metrics.monthlyMortgage)}`} />
        <MetricRow
          label="Monthly Investor Distribution"
          value={formatCurrency(metrics.monthlyInvestorDistribution)}
          highlight={metrics.monthlyInvestorDistribution > 0 ? 'positive' : 'negative'}
        />
      </div>

      <div className="card" style={{ padding: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Cash Yield
        </p>
        <MetricRow label="Annual Gross Rent" value={formatCurrency(metrics.annualGrossRent)} />
        <MetricRow label="Actual Cash Yield" value={formatPercent(metrics.actualCashYield)} highlight={metrics.cashYieldAchieved ? 'positive' : 'negative'} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Target Yield ({formatPercent(metrics.targetCashYield)}) Achieved</span>
          {metrics.cashYieldAchieved
            ? <CheckCircle2 size={16} color="var(--color-success)" />
            : <XCircle size={16} color="var(--color-danger)" />
          }
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Total Returns (Hold Period)
        </p>
        <MetricRow label="Total Distributions" value={formatCurrency(metrics.totalDistributions)} highlight="positive" />
        <MetricRow label="Equity at Sale (investor share)" value={formatCurrency(metrics.equityAtSale)} highlight="positive" />
        <MetricRow label="Total Return" value={formatCurrency(metrics.totalReturn)} highlight="positive" />
        <MetricRow label="Total ROI" value={formatPercent(metrics.totalROI)} highlight={metrics.totalROI > 0 ? 'positive' : 'negative'} />
      </div>
    </div>
  )
}
