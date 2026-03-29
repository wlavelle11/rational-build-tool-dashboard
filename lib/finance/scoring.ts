import { SCORING } from './constants'

function scoreMetric(value: number, fair: number, good: number, excellent: number): number {
  if (value >= excellent) return 100
  if (value >= good) return 75 + ((value - good) / (excellent - good)) * 25
  if (value >= fair) return 50 + ((value - fair) / (good - fair)) * 25
  if (value >= fair * 0.5) return 25 + ((value - fair * 0.5) / (fair * 0.5)) * 25
  return Math.max(0, (value / (fair * 0.5)) * 25)
}

export interface ScoringInputs {
  capRate: number
  irr: number
  equityMultiple: number
  cashOnCash: number
  totalValueCreation: number
}

export function computeDealScore(inputs: ScoringInputs): number {
  const { WEIGHTS, BENCHMARKS } = SCORING
  const capRateScore = scoreMetric(inputs.capRate, BENCHMARKS.capRate.fair, BENCHMARKS.capRate.good, BENCHMARKS.capRate.excellent)
  const irrScore = scoreMetric(inputs.irr, BENCHMARKS.irr.fair, BENCHMARKS.irr.good, BENCHMARKS.irr.excellent)
  const emScore = scoreMetric(inputs.equityMultiple, BENCHMARKS.equityMultiple.fair, BENCHMARKS.equityMultiple.good, BENCHMARKS.equityMultiple.excellent)
  const cocScore = scoreMetric(inputs.cashOnCash, BENCHMARKS.cashOnCash.fair, BENCHMARKS.cashOnCash.good, BENCHMARKS.cashOnCash.excellent)
  const tvcScore = scoreMetric(inputs.totalValueCreation, BENCHMARKS.totalValueCreation.fair, BENCHMARKS.totalValueCreation.good, BENCHMARKS.totalValueCreation.excellent)
  const weightedScore = capRateScore * WEIGHTS.capRate + irrScore * WEIGHTS.irr + emScore * WEIGHTS.equityMultiple + cocScore * WEIGHTS.cashOnCash + tvcScore * WEIGHTS.totalValueCreation
  return Math.round(weightedScore)
}

export function getRecommendation(score: number): 'Strong Buy' | 'Caution' | 'Pass' {
  if (score >= SCORING.STRONG_BUY_THRESHOLD) return 'Strong Buy'
  if (score >= SCORING.CAUTION_THRESHOLD) return 'Caution'
  return 'Pass'
}
