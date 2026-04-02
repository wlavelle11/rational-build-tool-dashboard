'use client'

import type { ADUYearlyRow } from '@/lib/finance/adu'
import { formatCurrency } from '@/lib/formatters'

export function ADUProForma({ rows, holdPeriodYears }: { rows: ADUYearlyRow[]; holdPeriodYears: number }) {
  return (
    <div className="data-table-wrapper" style={{ marginTop: 0 }}>
      <div className="data-table-header">
        <p className="card-title">10-Year Pro Forma</p>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Gross Rent</th>
              <th>Vacancy</th>
              <th>EGI</th>
              <th>Op Ex</th>
              <th>NOI</th>
              <th>Cash Flow</th>
              <th>Cumulative</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.year} style={row.year === holdPeriodYears ? { background: 'color-mix(in srgb, var(--color-brand) 5%, transparent)', fontWeight: 600 } : {}}>
                <td className="num">{row.year === holdPeriodYears ? `${row.year} ★` : row.year}</td>
                <td className="num">{formatCurrency(row.grossRent)}</td>
                <td className="num" style={{ color: 'var(--color-text-secondary)' }}>({formatCurrency(row.vacancyLoss)})</td>
                <td className="num">{formatCurrency(row.egi)}</td>
                <td className="num" style={{ color: 'var(--color-text-secondary)' }}>({formatCurrency(row.opEx)})</td>
                <td className="num table-cell-primary">{formatCurrency(row.noi)}</td>
                <td className="num">{formatCurrency(row.cashFlow)}</td>
                <td className="num">{formatCurrency(row.cumulativeCashFlow)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
