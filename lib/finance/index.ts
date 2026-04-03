import type { DealInputs, DealMetrics } from './types'
import { buildProForma, computeExitValuation, computeCapRate } from './calculations'
import { calculateIRR } from './irr'
import { computeWaterfall } from './waterfall'
import { computeDealScore, getRecommendation } from './scoring'

export function analyzeDeal(inputs: DealInputs): DealMetrics {
  // All-in cost basis: purchase + closing costs + capex
  const allInCost = inputs.purchasePrice + inputs.acquisitionClosingCosts + inputs.renovationCapex

  const proForma = buildProForma(inputs)
  const exitValuation = computeExitValuation(proForma, inputs.exitCapRate)
  const year1 = proForma[0]
  // Yield on cost uses all-in basis (standard underwriting convention)
  const year1CapRate = computeCapRate(inputs.monthlyGrossRent, inputs.vacancyRate, inputs.operatingExpenseRatio, allInCost)
  const year1CashOnCash = inputs.equityInvested > 0 ? year1.cashFlow / inputs.equityInvested : 0
  const totalValueCreation = exitValuation - allInCost
  const cumulativeCashFlow = proForma.reduce((s, y) => s + y.cashFlow, 0)

  const irrCashFlows = [-inputs.equityInvested, ...proForma.map((y) => y.cashFlow)]
  irrCashFlows[irrCashFlows.length - 1] += exitValuation
  const irr = calculateIRR(irrCashFlows)

  const totalDistributions = cumulativeCashFlow + exitValuation
  const equityMultiple = inputs.equityInvested > 0 ? totalDistributions / inputs.equityInvested : 0

  const waterfall = computeWaterfall(proForma, exitValuation, inputs.equityInvested, inputs.preferredReturnRate, inputs.sponsorPromoteRate)
  const dealScore = computeDealScore({ capRate: year1CapRate, irr, equityMultiple, cashOnCash: year1CashOnCash, totalValueCreation: allInCost > 0 ? totalValueCreation / allInCost : 0 })
  const recommendation = getRecommendation(dealScore)

  return { year1CapRate, year1CashOnCash, year1NOI: year1.noi, exitValuation, totalValueCreation, cumulativeCashFlow, irr, equityMultiple, dealScore, recommendation, proForma, waterfall }
}

export * from './types'
export * from './constants'
export { computeSensitivity } from './sensitivity'
export { buildProForma } from './calculations'
