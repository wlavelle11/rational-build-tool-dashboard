'use client'

import type { SensitivityResult } from '@/lib/finance/types'
import { formatPercent, formatMultiple, formatCurrency } from '@/lib/formatters'

interface Props {
  sensitivity: SensitivityResult
  baseRentGrowth: number
  baseExitCap: number
}

function getHeatClass(value: number, min: number, max: number): string {
  const pct = (value - min) / (max - min || 1)
  if (pct >= 0.75) return 'heatmap-cell-1'
  if (pct >= 0.55) return 'heatmap-cell-2'
  if (pct >= 0.40) return 'heatmap-cell-3'
  if (pct >= 0.25) return 'heatmap-cell-4'
  return 'heatmap-cell-5'
}

interface MatrixProps {
  title: string
  description: string
  matrix: number[][]
  rowLabels: string[]
  colLabels: string[]
  baseRowIdx: number
  baseColIdx: number
  formatValue: (v: number) => string
}

function SensitivityMatrix({ title, description, matrix, rowLabels, colLabels, baseRowIdx, baseColIdx, formatValue }: MatrixProps) {
  const flat = matrix.flat()
  const min = Math.min(...flat)
  const max = Math.max(...flat)

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <p className="card-title">{title}</p>
          <p className="card-subtitle">{description}</p>
        </div>
      </div>
      <div className="card-body" style={{ overflowX: 'auto' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
          Rows: Rent Growth · Columns: Exit Cap Rate
        </p>
        <table className="heatmap-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left', color: 'var(--color-text-muted)' }}>Rent ↓ / Cap →</th>
              {colLabels.map((label, ci) => (
                <th
                  key={ci}
                  className={ci === baseColIdx ? 'heatmap-header-active' : ''}
                  style={{ textAlign: 'center' }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, ri) => (
              <tr key={ri}>
                <th
                  className={ri === baseRowIdx ? 'heatmap-header-active' : ''}
                  style={{ textAlign: 'left', fontWeight: 600 }}
                >
                  {rowLabels[ri]}
                </th>
                {row.map((val, ci) => {
                  const isBase = ri === baseRowIdx && ci === baseColIdx
                  return (
                    <td
                      key={ci}
                      className={`${getHeatClass(val, min, max)} ${isBase ? 'heatmap-base' : ''}`}
                    >
                      {formatValue(val)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 11, color: 'var(--color-text-muted)' }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, outline: '2px solid var(--color-brand)', outlineOffset: -1 }} />
          <span>Base case assumption</span>
        </div>
      </div>
    </div>
  )
}

export function SensitivityTables({ sensitivity, baseRentGrowth, baseExitCap }: Props) {
  const rowLabels = sensitivity.rentGrowthRates.map(r => formatPercent(r))
  const colLabels = sensitivity.exitCapRates.map(c => formatPercent(c))
  const baseRowIdx = sensitivity.rentGrowthRates.findIndex(r => Math.abs(r - baseRentGrowth) < 0.001)
  const baseColIdx = sensitivity.exitCapRates.findIndex(c => Math.abs(c - baseExitCap) < 0.001)
  const rIdx = baseRowIdx === -1 ? 3 : baseRowIdx
  const cIdx = baseColIdx === -1 ? 3 : baseColIdx

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p className="page-eyebrow" style={{ marginBottom: 6 }}>Stress Testing</p>
        <h2 className="page-title" style={{ fontSize: 20 }}>Sensitivity Analysis</h2>
        <p className="page-description">
          Returns across varying rent growth and exit cap rate assumptions. Highlighted cell = base case.
        </p>
      </div>
      <SensitivityMatrix
        title="IRR Sensitivity"
        description="Investor IRR across scenarios"
        matrix={sensitivity.irrMatrix}
        rowLabels={rowLabels} colLabels={colLabels}
        baseRowIdx={rIdx} baseColIdx={cIdx}
        formatValue={v => formatPercent(v)}
      />
      <SensitivityMatrix
        title="Equity Multiple Sensitivity"
        description="Total distributions / equity invested"
        matrix={sensitivity.equityMultipleMatrix}
        rowLabels={rowLabels} colLabels={colLabels}
        baseRowIdx={rIdx} baseColIdx={cIdx}
        formatValue={v => formatMultiple(v)}
      />
      <SensitivityMatrix
        title="Value Creation Sensitivity"
        description="Exit valuation minus purchase price"
        matrix={sensitivity.totalValueCreationMatrix}
        rowLabels={rowLabels} colLabels={colLabels}
        baseRowIdx={rIdx} baseColIdx={cIdx}
        formatValue={v => formatCurrency(v)}
      />
    </div>
  )
}
