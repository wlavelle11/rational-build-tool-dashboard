import type { DealInputs, DealMetrics } from './types'
import { buildProForma, computeExitValuation, computeCapRate } from './calculations'
import { calculateIRR } from './irr'
import { computeWaterfall } from './waterfall'
import { computeDealScore, getRecommendation } from './scoring'

export function analyzeDeal(inputs: DealInputs): DealMetrics {
  const proForma = buildProForma(inputs)
  const exitValuation = computeExitValuation(proForma, inputs.exitCapRate)
  const year1 = proForma[0]
  const year1CapRate = computeCapRate(inputs.monthlyGrossRent, inputs.vacancyRate, inputs.operatingExpenseRatio, inputs.purchasePrice)
  const year1CashOnCash = year1.cashFlow / inputs.equityInvested
  const totalValueCreation = exitValuation - inputs.purchasePrice
  const cumulativeCashFlow = proForma.reduce((s, y) => s + y.cashFlow, 0)

  const irrCashFlows = [-inputs.equityInvested, ...proForma.map((y) => y.cashFlow)]
  irrCashFlows[irrCashFlows.length - 1] += exitValuation
  const irr = calculateIRR(irrCashFlows)

  const totalDistributions = cumulativeCashFlow + exitValuation
  const equityMultiple = totalDistributions / inputs.equityInvested

  const waterfall = computeWaterfall(proForma, exitValuation, inputs.equityInvested, inputs.preferredReturnRate, inputs.sponsorPromoteRate)
  const dealScore = computeDealScore({ capRate: year1CapRate, irr, equityMultiple, cashOnCash: year1CashOnCash, totalValueCreation: totalValueCreation / inputs.purchasePrice })
  const recommendation = getRecommendation(dealScore)

  return { year1CapRate, year1CashOnCash, year1NOI: year1.noi, exitValuation, totalValueCreation, cumulativeCashFlow, irr, equityMultiple, dealScore, recommendation, proForma, waterfall }
}

export * from './types'
export * from './constants'
export { computeSensitivity } from './sensitivity'
export { buildProForma } from './calculations'
