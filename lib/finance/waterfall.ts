import type { WaterfallResult, YearlyProForma } from './types'

export function computeWaterfall(
  proForma: YearlyProForma[],
  exitValuation: number,
  equityInvested: number,
  preferredReturnRate: number,
  sponsorPromoteRate: number
): WaterfallResult {
  const lpDistributions: number[] = []
  const gpDistributions: number[] = []
  const lpCumulativePref: number[] = []
  let accruedPref = 0
  const lpCapitalBalance = equityInvested

  for (const yearData of proForma) {
    const annualPref = lpCapitalBalance * preferredReturnRate
    accruedPref += annualPref
    const availableCash = yearData.cashFlow
    const prefPayment = Math.min(availableCash, accruedPref)
    accruedPref -= prefPayment
    const remainingCash = availableCash - prefPayment
    lpDistributions.push(prefPayment + remainingCash)
    gpDistributions.push(0)
    lpCumulativePref.push(accruedPref)
  }

  let remaining = exitValuation
  const prefPayout = Math.min(remaining, accruedPref)
  remaining -= prefPayout
  const capitalReturn = Math.min(remaining, lpCapitalBalance)
  remaining -= capitalReturn
  const gpPromote = remaining > 0 ? remaining * sponsorPromoteRate : 0
  const lpUpside = remaining > 0 ? remaining * (1 - sponsorPromoteRate) : 0
  const lpSaleProceeds = prefPayout + capitalReturn + lpUpside
  const gpSaleProceeds = gpPromote

  return {
    lpDistributions,
    gpDistributions,
    lpCumulativePref,
    totalLpDistributions: lpDistributions.reduce((s, v) => s + v, 0) + lpSaleProceeds,
    totalGpDistributions: gpDistributions.reduce((s, v) => s + v, 0) + gpSaleProceeds,
    saleProceeds: exitValuation,
    lpSaleProceeds,
    gpSaleProceeds,
  }
}
