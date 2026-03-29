import type { YearlyProForma } from '@/lib/finance/types'
import { formatCurrency } from '@/lib/formatters'

interface Props {
  proForma: YearlyProForma[]
  exitValuation: number
  holdPeriodYears: number
}

export function ProFormaTable({ proForma, exitValuation, holdPeriodYears }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Year</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">GPI</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Vacancy</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">EGI</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">OpEx</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">NOI</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Cash Flow</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Cumulative CF</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {proForma.map((row) => (
            <tr key={row.year} className={`hover:bg-gray-50 ${row.year === holdPeriodYears ? 'bg-blue-50' : ''}`}>
              <td className="px-4 py-3 font-medium text-gray-900">{row.year === holdPeriodYears ? `Year ${row.year} (Exit)` : `Year ${row.year}`}</td>
              <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(row.grossPotentialIncome)}</td>
              <td className="px-4 py-3 text-right text-red-600">({formatCurrency(row.vacancyLoss)})</td>
              <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(row.effectiveGrossIncome)}</td>
              <td className="px-4 py-3 text-right text-red-600">({formatCurrency(row.operatingExpenses)})</td>
              <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(row.noi)}</td>
              <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(row.cashFlow)}</td>
              <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(row.cumulativeCashFlow)}</td>
            </tr>
          ))}
          <tr className="bg-emerald-50 border-t-2 border-emerald-200">
            <td className="px-4 py-3 font-semibold text-emerald-900">Exit Proceeds</td>
            <td className="px-4 py-3" colSpan={6} />
            <td className="px-4 py-3 text-right font-semibold text-emerald-900">{formatCurrency(exitValuation)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
