import { SENSITIVITY } from './constants'
import { buildProForma, computeExitValuation } from './calculations'
import { calculateIRR } from './irr'
import type { DealInputs, SensitivityResult } from './types'

export function computeSensitivity(baseInputs: DealInputs): SensitivityResult {
  const { RENT_GROWTH_STEPS, EXIT_CAP_STEPS, RENT_GROWTH_DELTA, EXIT_CAP_DELTA } = SENSITIVITY
  const halfRent = Math.floor(RENT_GROWTH_STEPS / 2)
  const halfCap = Math.floor(EXIT_CAP_STEPS / 2)

  const rentGrowthRates = Array.from({ length: RENT_GROWTH_STEPS }, (_, i) =>
    Math.max(0, baseInputs.annualRentGrowth + (i - halfRent) * RENT_GROWTH_DELTA)
  )
  const exitCapRates = Array.from({ length: EXIT_CAP_STEPS }, (_, i) =>
    Math.max(0.01, baseInputs.exitCapRate + (i - halfCap) * EXIT_CAP_DELTA)
  )

  const irrMatrix: number[][] = []
  const equityMultipleMatrix: number[][] = []
  const totalValueCreationMatrix: number[][] = []

  for (const rentGrowth of rentGrowthRates) {
    const irrRow: number[] = []
    const emRow: number[] = []
    const tvcRow: number[] = []
    for (const exitCap of exitCapRates) {
      const modifiedInputs: DealInputs = { ...baseInputs, annualRentGrowth: rentGrowth, exitCapRate: exitCap }
      const proForma = buildProForma(modifiedInputs)
      const exitVal = computeExitValuation(proForma, exitCap)
      const totalDistributions = proForma.reduce((s, y) => s + y.cashFlow, 0) + exitVal
      const equityMultiple = totalDistributions / baseInputs.equityInvested
      const cashFlows = [-baseInputs.equityInvested, ...proForma.map((y) => y.cashFlow)]
      cashFlows[cashFlows.length - 1] += exitVal
      const irr = calculateIRR(cashFlows)
      irrRow.push(irr)
      emRow.push(equityMultiple)
      tvcRow.push(exitVal - baseInputs.purchasePrice)
    }
    irrMatrix.push(irrRow)
    equityMultipleMatrix.push(emRow)
    totalValueCreationMatrix.push(tvcRow)
  }

  return { rentGrowthRates, exitCapRates, irrMatrix, equityMultipleMatrix, totalValueCreationMatrix }
}
