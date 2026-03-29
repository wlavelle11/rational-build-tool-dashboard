interface Props {
  recommendation: 'Strong Buy' | 'Caution' | 'Pass'
  score: number
}

export function RecommendationBadge({ recommendation, score }: Props) {
  const config = {
    'Strong Buy': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', dot: 'bg-emerald-500' },
    'Caution': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', dot: 'bg-amber-500' },
    'Pass': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', dot: 'bg-red-500' },
  }
  const c = config[recommendation]
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${c.bg} ${c.border}`}>
      <div className={`h-2 w-2 rounded-full ${c.dot}`} />
      <span className={`text-sm font-semibold ${c.text}`}>{recommendation}</span>
      <span className={`text-xs ${c.text} opacity-70`}>{score}/100</span>
    </div>
  )
}
