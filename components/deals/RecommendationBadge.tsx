interface Props {
  recommendation: 'Strong Buy' | 'Caution' | 'Pass'
  score: number
}

type Config = { cls: string; dotCls: string }

const config: Record<string, Config> = {
  'Strong Buy': { cls: 'badge badge-success', dotCls: 'badge-dot' },
  'Caution':    { cls: 'badge badge-warning', dotCls: 'badge-dot' },
  'Pass':       { cls: 'badge badge-danger',  dotCls: 'badge-dot' },
}

export function RecommendationBadge({ recommendation, score }: Props) {
  const c = config[recommendation] ?? { cls: 'badge badge-neutral', dotCls: 'badge-dot' }
  return (
    <div className={c.cls} style={{ fontSize: 13, padding: '6px 14px', gap: 8 }}>
      <span className={c.dotCls} style={{ width: 7, height: 7 }} />
      {recommendation}
      <span className="badge-score">{score}/100</span>
    </div>
  )
}
