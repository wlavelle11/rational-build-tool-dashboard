'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { YearlyProForma } from '@/lib/finance/types'
import { formatCurrency } from '@/lib/formatters'

export function NOIChart({ proForma }: { proForma: YearlyProForma[] }) {
  const data = proForma.map(row => ({ year: `Yr ${row.year}`, NOI: Math.round(row.noi), EGI: Math.round(row.effectiveGrossIncome) }))
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Area type="monotone" dataKey="EGI" stroke="#93c5fd" fill="#eff6ff" name="EGI" />
        <Area type="monotone" dataKey="NOI" stroke="#3b82f6" fill="#dbeafe" name="NOI" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
