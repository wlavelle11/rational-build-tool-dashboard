'use client'

import type { FlipMetrics } from '@/lib/finance/flip'
import type { BRRRMetrics } from '@/lib/finance/brrr'
import { formatCurrency, formatPercent } from '@/lib/formatters'

interface Props {
  flipMetrics: FlipMetrics
  brrrMetrics: BRRRMetrics
  holdMonths: number
  brrrHoldYears: number
}

export function ComparisonSummary({ flipMetrics, brrrMetrics, holdMonths, brrrHoldYears }: Props) {
  const flipWins = flipMetrics.dealScore >= brrrMetrics.dealScore

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-tertiary)' }}>
            Strategy Comparison
          </p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 2 }}>
            {flipWins ? 'Flip' : 'BRRR'} scores higher for this property
          </p>
        </div>
        <span className={flipWins ? 'badge badge-success' : 'badge badge-brand'} style={{ fontSize: 13, padding: '6px 14px' }}>
          <span className="badge-dot" />
          {flipWins ? 'Flip Recommended' : 'BRRR Recommended'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Flip column */}
        <div style={{
          padding: 16,
          borderRadius: 8,
          border: `2px solid ${flipWins ? 'var(--color-success)' : 'var(--color-border)'}`,
          background: flipWins ? 'color-mix(in srgb, var(--color-success) 5%, transparent)' : 'var(--color-surface)',
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, color: flipWins ? 'var(--color-success)' : 'var(--color-text-primary)' }}>
            FLIP {flipWins ? '★' : ''}
          </p>
          <CompRow label="Deal Score" value={`${flipMetrics.dealScore}/100`} />
          <CompRow label="Recommendation" value={flipMetrics.recommendation} />
          <CompRow label="Total Investor Return" value={formatCurrency(flipMetrics.totalInvestorReturn)} />
          <CompRow label="Annualized ROI" value={formatPercent(flipMetrics.annualizedRoi)} />
          <CompRow label="Profit Margin" value={formatPercent(flipMetrics.profitMargin)} />
          <CompRow label="Hold Period" value={`${holdMonths} months`} />
        </div>

        {/* BRRR column */}
        <div style={{
          padding: 16,
          borderRadius: 8,
          border: `2px solid ${!flipWins ? 'var(--color-brand)' : 'var(--color-border)'}`,
          background: !flipWins ? 'color-mix(in srgb, var(--color-brand) 5%, transparent)' : 'var(--color-surface)',
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, color: !flipWins ? 'var(--color-brand)' : 'var(--color-text-primary)' }}>
            BRRR {!flipWins ? '★' : ''}
          </p>
          <CompRow label="Deal Score" value={`${brrrMetrics.dealScore}/100`} />
          <CompRow label="Recommendation" value={brrrMetrics.recommendation} />
          <CompRow label="Total Return" value={formatCurrency(brrrMetrics.totalReturn)} />
          <CompRow label="Monthly Distribution" value={formatCurrency(brrrMetrics.monthlyInvestorDistribution)} />
          <CompRow label="Cash Yield" value={formatPercent(brrrMetrics.actualCashYield)} />
          <CompRow label="Hold Period" value={`${brrrHoldYears} years`} />
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 12, textAlign: 'center' }}>
        Score comparison is based on deal-specific benchmarks. Consider your time horizon: Flip = short-term exit, BRRR = long-term income + appreciation.
      </p>
    </div>
  )
}

function CompRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>{value}</span>
    </div>
  )
}
