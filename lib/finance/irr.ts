export function calculateIRR(cashFlows: number[]): number {
  if (cashFlows.length < 2) return NaN
  const MAX_ITERATIONS = 1000
  const TOLERANCE = 1e-7
  let rate = 0.1

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const { npv, npvDerivative } = computeNPVAndDerivative(cashFlows, rate)
    if (Math.abs(npv) < TOLERANCE) return rate
    if (Math.abs(npvDerivative) < TOLERANCE) break
    const newRate = rate - npv / npvDerivative
    if (Math.abs(newRate - rate) < TOLERANCE) return newRate
    rate = newRate
  }
  return bisectionIRR(cashFlows, -0.99, 10.0)
}

function computeNPVAndDerivative(cashFlows: number[], rate: number) {
  let npv = 0
  let npvDerivative = 0
  for (let t = 0; t < cashFlows.length; t++) {
    const factor = Math.pow(1 + rate, t)
    npv += cashFlows[t] / factor
    npvDerivative -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1)
  }
  return { npv, npvDerivative }
}

function bisectionIRR(cashFlows: number[], low: number, high: number): number {
  const MAX_ITER = 200
  const TOLERANCE = 1e-6
  const npvLow = computeNPV(cashFlows, low)
  const npvHigh = computeNPV(cashFlows, high)
  if (npvLow * npvHigh > 0) return NaN
  for (let i = 0; i < MAX_ITER; i++) {
    const mid = (low + high) / 2
    const npvMid = computeNPV(cashFlows, mid)
    if (Math.abs(npvMid) < TOLERANCE || (high - low) / 2 < TOLERANCE) return mid
    if (npvLow * npvMid < 0) high = mid
    else low = mid
  }
  return (low + high) / 2
}

function computeNPV(cashFlows: number[], rate: number): number {
  return cashFlows.reduce((npv, cf, t) => npv + cf / Math.pow(1 + rate, t), 0)
}
