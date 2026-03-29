'use client'

import type { SensitivityResult } from '@/lib/finance/types'
import { formatPercent, formatMultiple, formatCurrency } from '@/lib/formatters'

interface Props {
  sensitivity: SensitivityResult
  baseRentGrowth: number
  baseExitCap: number
}

function getHeatmapColor(value: number, min: number, max: number): string {
  const range = max - min || 1
  const normalized = (value - min) / range
  if (normalized >= 0.75) return 'bg-emerald-100 text-emerald-900'
  if (normalized >= 0.55) return 'bg-green-50 text-green-900'
  if (normalized >= 0.40) return 'bg-yellow-50 text-yellow-900'
  if (normalized >= 0.25) return 'bg-orange-100 text-orange-900'
  return 'bg-red-100 text-red-900'
}

function SensitivityMatrix({ title, description, matrix, rowLabels, colLabels, baseRowIdx, baseColIdx, formatValue }: {
  title: string; description: string; matrix: number[][];
  rowLabels: string[]; colLabels: string[]; baseRowIdx: number; baseColIdx: number;
  formatValue: (v: number) => string
}) {
  const allValues = matrix.flat()
  const minVal = Math.min(...allValues)
  const maxVal = Math.max(...allValues)

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <div className="p-5 overflow-x-auto">
        <div className="mb-2 text-xs text-gray-500 font-medium">Rows: Rent Growth · Columns: Exit Cap Rate</div>
        <table className="text-xs">
          <thead>
            <tr>
              <th className="text-left px-3 py-2 text-gray-500 font-medium w-28">Rent ↓ / Cap →</th>
              {colLabels.map((label, ci) => (
                <th key={ci} className={`px-3 py-2 text-center font-medium ${ci === baseColIdx ? 'text-blue-700 bg-blue-50' : 'text-gray-600'}`}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, ri) => (
              <tr key={ri}>
                <td className={`px-3 py-2 font-medium ${ri === baseRowIdx ? 'text-blue-700 bg-blue-50' : 'text-gray-600'}`}>{rowLabels[ri]}</td>
                {row.map((val, ci) => {
                  const isBase = ri === baseRowIdx && ci === baseColIdx
                  return (
                    <td key={ci} className={`px-3 py-2 text-center tabular-nums ${getHeatmapColor(val, minVal, maxVal)} ${isBase ? 'ring-2 ring-blue-500 ring-inset font-bold' : ''}`}>
                      {formatValue(val)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <div className="h-3 w-3 ring-2 ring-blue-500 ring-inset rounded-sm" />
          <span>Base assumption</span>
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Sensitivity Analysis</h2>
        <p className="text-sm text-gray-500 mt-1">Stress test returns across varying rent growth and exit cap rate assumptions. Highlighted cell = base assumptions.</p>
      </div>
      <SensitivityMatrix title="IRR Sensitivity" description="Investor IRR across scenarios" matrix={sensitivity.irrMatrix} rowLabels={rowLabels} colLabels={colLabels} baseRowIdx={baseRowIdx === -1 ? 3 : baseRowIdx} baseColIdx={baseColIdx === -1 ? 3 : baseColIdx} formatValue={v => formatPercent(v)} />
      <SensitivityMatrix title="Equity Multiple Sensitivity" description="Total distributions / equity invested" matrix={sensitivity.equityMultipleMatrix} rowLabels={rowLabels} colLabels={colLabels} baseRowIdx={baseRowIdx === -1 ? 3 : baseRowIdx} baseColIdx={baseColIdx === -1 ? 3 : baseColIdx} formatValue={v => formatMultiple(v)} />
      <SensitivityMatrix title="Total Value Creation Sensitivity" description="Exit valuation minus purchase price" matrix={sensitivity.totalValueCreationMatrix} rowLabels={rowLabels} colLabels={colLabels} baseRowIdx={baseRowIdx === -1 ? 3 : baseRowIdx} baseColIdx={baseColIdx === -1 ? 3 : baseColIdx} formatValue={v => formatCurrency(v)} />
    </div>
  )
}
