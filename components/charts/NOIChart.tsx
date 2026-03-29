'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { YearlyProForma } from '@/lib/finance/types'
import { formatCurrency } from '@/lib/formatters'

export function NOIChart({ proForma }: { proForma: YearlyProForma[] }) {
  const data = proForma.map(row => ({
    year: `Y${row.year}`,
    NOI: Math.round(row.noi),
    EGI: Math.round(row.effectiveGrossIncome),
  }))

  return (
    <ResponsiveContainer width="100%" height={210}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="egi" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="noi" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
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
        <Tooltip
          formatter={(v: number, name: string) => [formatCurrency(v), name]}
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
          cursor={{ stroke: '#e4e4e7', strokeWidth: 1 }}
        />
        <Area type="monotone" dataKey="EGI" stroke="#93c5fd" strokeWidth={1.5} fill="url(#egi)" name="EGI" dot={false} />
        <Area type="monotone" dataKey="NOI" stroke="#2563eb" strokeWidth={2} fill="url(#noi)" name="NOI" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
