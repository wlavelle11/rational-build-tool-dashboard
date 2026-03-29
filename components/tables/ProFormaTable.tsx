import type { YearlyProForma } from '@/lib/finance/types'
import { formatCurrency } from '@/lib/formatters'

interface Props {
  proForma: YearlyProForma[]
  exitValuation: number
  holdPeriodYears: number
}

export function ProFormaTable({ proForma, exitValuation, holdPeriodYears }: Props) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table proforma-table">
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Year</th>
            <th>GPI</th>
            <th>Vacancy</th>
            <th>EGI</th>
            <th>OpEx</th>
            <th>NOI</th>
            <th>Cash Flow</th>
            <th>Cumul. CF</th>
          </tr>
        </thead>
        <tbody>
          {proForma.map((row) => {
            const isExit = row.year === holdPeriodYears
            return (
              <tr
                key={row.year}
                className={isExit ? 'proforma-row-highlight' : ''}
              >
                <td
                  className="table-cell-primary"
                  style={{ textAlign: 'left', color: isExit ? 'var(--color-brand)' : undefined }}
                >
                  {isExit ? `Year ${row.year} · Exit` : `Year ${row.year}`}
                </td>
                <td className="num">{formatCurrency(row.grossPotentialIncome)}</td>
                <td className="num" style={{ color: 'var(--color-danger)' }}>
                  ({formatCurrency(row.vacancyLoss)})
                </td>
                <td className="num">{formatCurrency(row.effectiveGrossIncome)}</td>
                <td className="num" style={{ color: 'var(--color-danger)' }}>
                  ({formatCurrency(row.operatingExpenses)})
                </td>
                <td className="num table-cell-primary">{formatCurrency(row.noi)}</td>
                <td className="num">{formatCurrency(row.cashFlow)}</td>
                <td className="num">{formatCurrency(row.cumulativeCashFlow)}</td>
              </tr>
            )
          })}
          <tr className="proforma-row-exit">
            <td style={{ textAlign: 'left', fontWeight: 700 }}>Exit Proceeds</td>
            <td colSpan={6} />
            <td className="num" style={{ fontWeight: 700 }}>{formatCurrency(exitValuation)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
