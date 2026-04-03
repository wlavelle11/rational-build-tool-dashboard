import { calculateIRR } from './irr'

export interface ADUInputs {
  purchasePrice: number
  constructionCost: number
  aduCount: number
  marketRateUnits: number
  middleIncomeUnits: number
  marketRateRent: number
  middleIncomeRent: number
  vacancyRate: number
  opExpRatio: number
  annualRentGrowth: number
  holdPeriodYears: number
  exitCapRate: number
  equityInvested: number
  preferredReturnRate: number
  sponsorSplit: number
}

export interface ADUYearlyRow {
  year: number
  grossRent: number
  vacancyLoss: number
  egi: number
  opEx: number
  noi: number
  cashFlow: number
  cumulativeCashFlow: number
}

export interface ADUMetrics {
  totalProjectCost: number
  year1MonthlyRent: number
  year1GrossRent: number
  year1NOI: number
  year10NOI: number
  exitValue: number
  projectedEquityGain: number
  cumulativeCashFlow: number
  totalValueCreation: number
  equityMultiple: number
  irr: number
  proForma: ADUYearlyRow[]
  // Waterfall
  lpPreferredPaid: number
  lpCapitalReturned: number
  sponsorProfit: number
  investorProfit: number
  recommendation: 'Strong Buy' | 'Caution' | 'Pass'
  dealScore: number
}

export function analyzeADU(inputs: ADUInputs): ADUMetrics {
  const {
    purchasePrice, constructionCost, marketRateUnits, middleIncomeUnits,
    marketRateRent, middleIncomeRent, vacancyRate, opExpRatio,
    annualRentGrowth, holdPeriodYears, exitCapRate, equityInvested,
    preferredReturnRate, sponsorSplit,
  } = inputs

  const totalProjectCost = purchasePrice + constructionCost
  const year1MonthlyRent = marketRateUnits * marketRateRent + middleIncomeUnits * middleIncomeRent
  const year1GrossRent = year1MonthlyRent * 12

  // Build pro forma
  const proForma: ADUYearlyRow[] = []
  let cumulative = 0

  for (let year = 1; year <= holdPeriodYears; year++) {
    const growthFactor = Math.pow(1 + annualRentGrowth, year - 1)
    const grossRent = year1GrossRent * growthFactor
    const vacancyLoss = grossRent * vacancyRate
    const egi = grossRent - vacancyLoss
    const opEx = egi * opExpRatio
    const noi = egi - opEx
    const cashFlow = noi
    cumulative += cashFlow
    proForma.push({ year, grossRent, vacancyLoss, egi, opEx, noi, cashFlow, cumulativeCashFlow: cumulative })
  }

  const year1NOI = proForma[0].noi
  const year10NOI = proForma[proForma.length - 1].noi
  const exitValue = exitCapRate > 0 ? year10NOI / exitCapRate : 0
  const projectedEquityGain = exitValue - totalProjectCost
  const cumulativeCashFlow = proForma[proForma.length - 1].cumulativeCashFlow
  const totalValueCreation = projectedEquityGain + cumulativeCashFlow

  // IRR calculation: initial outflow = -equityInvested, then annual NOI, then exit at end
  const cashFlows = [-equityInvested, ...proForma.map((r, i) => i === holdPeriodYears - 1 ? r.cashFlow + exitValue : r.cashFlow)]
  const irr = calculateIRR(cashFlows)
  const equityMultiple = equityInvested > 0 ? (cumulativeCashFlow + exitValue) / equityInvested : 0

  // Investor waterfall
  const totalLP = equityInvested
  const preferredTotal = totalLP * preferredReturnRate * holdPeriodYears
  const lpPreferredPaid = Math.min(preferredTotal, cumulativeCashFlow)
  const remainingAfterPref = Math.max(0, exitValue - totalLP - Math.max(0, preferredTotal - lpPreferredPaid))
  const investorSplit = 1 - sponsorSplit
  const sponsorProfit = remainingAfterPref * sponsorSplit
  const investorProfit = remainingAfterPref * investorSplit
  const lpCapitalReturned = Math.min(totalLP, exitValue)

  const dealScore = computeADUScore({ irr, equityMultiple, year1NOI, totalProjectCost })

  return {
    totalProjectCost,
    year1MonthlyRent,
    year1GrossRent,
    year1NOI,
    year10NOI,
    exitValue,
    projectedEquityGain,
    cumulativeCashFlow,
    totalValueCreation,
    equityMultiple,
    irr,
    proForma,
    lpPreferredPaid,
    lpCapitalReturned,
    sponsorProfit,
    investorProfit,
    recommendation: dealScore >= 80 ? 'Strong Buy' : dealScore >= 60 ? 'Caution' : 'Pass',
    dealScore,
  }
}

function computeADUScore({ irr, equityMultiple, year1NOI, totalProjectCost }: {
  irr: number
  equityMultiple: number
  year1NOI: number
  totalProjectCost: number
}): number {
  // IRR score: 7% = fair, 10% = good, 14%+ = excellent
  const irrScore = irr >= 0.14 ? 100
    : irr >= 0.10 ? 75 + ((irr - 0.10) / 0.04) * 25
    : irr >= 0.07 ? 50 + ((irr - 0.07) / 0.03) * 25
    : Math.max(0, (irr / 0.07) * 50)

  // Equity multiple: 1.5x = fair, 1.8x = good, 2.2x+ = excellent
  const emScore = equityMultiple >= 2.2 ? 100
    : equityMultiple >= 1.8 ? 75 + ((equityMultiple - 1.8) / 0.4) * 25
    : equityMultiple >= 1.5 ? 50 + ((equityMultiple - 1.5) / 0.3) * 25
    : Math.max(0, (equityMultiple / 1.5) * 50)

  // Cap rate (year 1): 4% = fair, 5% = good, 6%+ = excellent
  const capRate = totalProjectCost > 0 ? year1NOI / totalProjectCost : 0
  const capScore = capRate >= 0.06 ? 100
    : capRate >= 0.05 ? 75 + ((capRate - 0.05) / 0.01) * 25
    : capRate >= 0.04 ? 50 + ((capRate - 0.04) / 0.01) * 25
    : Math.max(0, (capRate / 0.04) * 50)

  return Math.round(irrScore * 0.40 + emScore * 0.35 + capScore * 0.25)
}
