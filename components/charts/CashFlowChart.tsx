'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import type { YearlyProForma } from '@/lib/finance/types'
import { formatCurrency } from '@/lib/formatters'

export function CashFlowChart({ proForma }: { proForma: YearlyProForma[] }) {
  const data = proForma.map(row => ({
    year: `Y${row.year}`,
    cf: Math.round(row.cashFlow),
  }))

  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={14}>
        <CartesianGrid strokeDasharray="2 4" stroke="#f4f4f5" vertical={false} />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 10, fill: '#a1a1aa', fontFamily: 'inherit' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 10, fill: '#a1a1aa', fontFamily: 'inherit' }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <ReferenceLine y={0} stroke="#e4e4e7" strokeWidth={1} />
        <Tooltip
          formatter={(v: number) => [formatCurrency(v), 'Cash Flow']}
          contentStyle={{
            background: '#fff',
            border: '1px solid #e4e4e7',
            borderRadius: 8,
            fontSize: 12,
            fontFamily: 'inherit',
            boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
            padding: '8px 12px',
          }}
          labelStyle={{ fontWeight: 600, color: '#09090b', marginBottom: 4 }}
          cursor={{ fill: '#f4f4f5' }}
        />
        <Bar dataKey="cf" radius={[3, 3, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.cf >= 0 ? '#2563eb' : '#ef4444'}
              fillOpacity={0.9}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
