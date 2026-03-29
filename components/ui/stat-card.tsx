type Trend = 'positive' | 'warning' | 'negative' | 'neutral'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  trend?: Trend
  icon?: React.ReactNode
}

const trendClass: Record<Trend, string> = {
  positive: 'stat-value-positive',
  warning:  'stat-value-warning',
  negative: 'stat-value-negative',
  neutral:  '',
}

export function StatCard({ label, value, sub, trend = 'neutral', icon }: StatCardProps) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <span className="stat-label">{label}</span>
        {icon && <span style={{ color: 'var(--color-text-muted)' }}>{icon}</span>}
      </div>
      <p className={`stat-value ${trendClass[trend]}`}>{value}</p>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  )
}
