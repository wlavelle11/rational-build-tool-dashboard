'use client'

import type { FeasibilityResult } from '@/lib/finance/adu-feasibility'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface Props {
  result: FeasibilityResult
}

const FLAG_CONFIG = {
  'GO':      { cls: 'badge-success', label: 'GO',      icon: <CheckCircle2 size={14} />, color: 'var(--color-success)' },
  'CAUTION': { cls: 'badge-warning', label: 'CAUTION', icon: <AlertCircle size={14} />, color: 'var(--color-warning)' },
  'NO-GO':   { cls: 'badge-danger',  label: 'NO-GO',   icon: <XCircle size={14} />,     color: 'var(--color-danger)'  },
}

const CAT_FLAG = {
  pass:    { color: 'var(--color-success)', icon: <CheckCircle2 size={13} /> },
  caution: { color: 'var(--color-warning)', icon: <AlertCircle size={13} /> },
  fail:    { color: 'var(--color-danger)',  icon: <XCircle size={13} /> },
}

export function FeasibilityScoreCard({ result }: Props) {
  const cfg = FLAG_CONFIG[result.flag]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Overall score */}
      <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ textAlign: 'center', minWidth: 80 }}>
          <p style={{ fontSize: 40, fontWeight: 800, color: cfg.color, lineHeight: 1 }}>{result.totalScore}</p>
          <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>out of 100</p>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8 }}>
            <span className={`badge badge-${cfg.cls}`} style={{ fontSize: 13, padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              {cfg.icon}
              {cfg.label}
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            {result.flag === 'GO' && 'This property passes feasibility. Proceed to financial analysis.'}
            {result.flag === 'CAUTION' && 'Proceed with care. Address flagged items before committing.'}
            {result.flag === 'NO-GO' && 'Significant obstacles identified. This property is not recommended for ADU development.'}
          </p>
        </div>
        {/* Score bar */}
        <div style={{ width: 8, height: 80, background: 'var(--color-border)', borderRadius: 4, position: 'relative', flexShrink: 0 }}>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: `${result.totalScore}%`,
            background: cfg.color,
            borderRadius: 4,
            transition: 'height 0.4s ease',
          }} />
        </div>
      </div>

      {/* Category breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {result.categories.map((cat) => {
          const catCfg = CAT_FLAG[cat.flag]
          const pct = cat.maxScore > 0 ? cat.score / cat.maxScore : 0
          return (
            <div key={cat.label} className="card" style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: catCfg.color }}>{catCfg.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{cat.label}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: catCfg.color }}>
                  {cat.score}/{cat.maxScore}
                </span>
              </div>
              <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 2, marginBottom: 6 }}>
                <div style={{ height: '100%', width: `${pct * 100}%`, background: catCfg.color, borderRadius: 2, transition: 'width 0.3s ease' }} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', lineHeight: 1.4 }}>{cat.notes}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
