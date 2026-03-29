'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { YearlyProForma } from '@/lib/finance/types'
import { formatCurrency } from '@/lib/formatters'

export function CashFlowChart({ proForma }: { proForma: YearlyProForma[] }) {
  const data = proForma.map(row => ({ year: `Yr ${row.year}`, 'Cash Flow': Math.round(row.cashFlow) }))
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Bar dataKey="Cash Flow" fill="#3b82f6" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
