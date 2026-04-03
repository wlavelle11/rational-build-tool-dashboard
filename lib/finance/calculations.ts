import type { DealInputs, YearlyProForma } from './types'

export function buildProForma(inputs: DealInputs): YearlyProForma[] {
  const { monthlyGrossRent, vacancyRate, operatingExpenseRatio, annualRentGrowth, annualExpenseGrowth, holdPeriodYears } = inputs
  const rows: YearlyProForma[] = []
  let cumulative = 0
  const year1EGI = monthlyGrossRent * 12 * (1 - vacancyRate)
  const baseExpenses = year1EGI * operatingExpenseRatio

  for (let year = 1; year <= holdPeriodYears; year++) {
    const rentMultiplier = Math.pow(1 + annualRentGrowth, year - 1)
    const expenseMultiplier = Math.pow(1 + annualExpenseGrowth, year - 1)
    const grossPotentialIncome = monthlyGrossRent * 12 * rentMultiplier
    const vacancyLoss = grossPotentialIncome * vacancyRate
    const effectiveGrossIncome = grossPotentialIncome - vacancyLoss
    const operatingExpenses = baseExpenses * expenseMultiplier
    const noi = effectiveGrossIncome - operatingExpenses
    const cashFlow = noi
    cumulative += cashFlow
    rows.push({ year, grossPotentialIncome, vacancyLoss, effectiveGrossIncome, operatingExpenses, noi, cashFlow, cumulativeCashFlow: cumulative })
  }
  return rows
}

export function computeExitValuation(proForma: YearlyProForma[], exitCapRate: number): number {
  if (exitCapRate <= 0) return 0
  return proForma[proForma.length - 1].noi / exitCapRate
}

export function computeCapRate(monthlyGrossRent: number, vacancyRate: number, operatingExpenseRatio: number, purchasePrice: number): number {
  if (purchasePrice <= 0) return 0
  const egi = monthlyGrossRent * 12 * (1 - vacancyRate)
  const noi = egi * (1 - operatingExpenseRatio)
  return noi / purchasePrice
}
