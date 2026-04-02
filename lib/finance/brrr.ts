export interface BRRRInputs {
  purchasePrice: number
  renovationBudget: number
  arv: number
  buyClosingCosts: number
  holdPeriodYears: number
  investorCapital: number
  targetCashYieldPct: number
  equitySplitAtSalePct: number
  monthlyRent: number
  operatingExpenseRatio: number
  operatingReservePct: number
  refinanceLtv: number
  refinanceRate: number
  refinanceLoanTermYears: number
  financingType: 'cash' | 'hard_money'
  hardMoneyLtvPct?: number
  hardMoneyRate?: number
  hardMoneyPoints?: number
  renovationMonths?: number
}

export interface BRRRMetrics {
  refinanceLoanAmount: number
  capitalReturnedViaRefi: number
  remainingCapitalAtRisk: number
  bridgeLoanCosts: number
  monthlyGrossRent: number
  monthlyOperatingExpenses: number
  monthlyReserve: number
  monthlyMortgage: number
  monthlyNetCashFlow: number
  monthlyInvestorDistribution: number
  annualGrossRent: number
  annualNetCashFlow: number
  actualCashYield: number
  targetCashYield: number
  cashYieldAchieved: boolean
  totalDistributions: number
  equityAtSale: number
  totalReturn: number
  totalROI: number
  dealScore: number
  recommendation: 'Strong Buy' | 'Caution' | 'Pass'
}

export function calculateBRRR(inputs: BRRRInputs): BRRRMetrics {
  const {
    purchasePrice,
    renovationBudget,
    arv,
    buyClosingCosts,
    holdPeriodYears,
    investorCapital,
    targetCashYieldPct,
    equitySplitAtSalePct,
    monthlyRent,
    operatingExpenseRatio,
    operatingReservePct,
    refinanceLtv,
    refinanceRate,
    refinanceLoanTermYears,
    financingType,
    hardMoneyLtvPct = 0.70,
    hardMoneyRate = 0.12,
    hardMoneyPoints = 0.02,
    renovationMonths = 6,
  } = inputs

  let bridgeLoanCosts = 0
  if (financingType === 'hard_money') {
    const bridgeLoan = purchasePrice * hardMoneyLtvPct
    bridgeLoanCosts = bridgeLoan * hardMoneyRate * (renovationMonths / 12) + bridgeLoan * hardMoneyPoints
  }

  const totalCostBasis = purchasePrice + renovationBudget + buyClosingCosts + bridgeLoanCosts
  const refinanceLoanAmount = arv * refinanceLtv
  const capitalReturnedViaRefi = Math.max(0, refinanceLoanAmount - totalCostBasis)
  const remainingCapitalAtRisk = Math.max(0, investorCapital - capitalReturnedViaRefi)

  const monthlyRate = refinanceRate / 12
  const nPayments = refinanceLoanTermYears * 12
  const monthlyMortgage = refinanceLoanAmount > 0 && monthlyRate > 0
    ? refinanceLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, nPayments)) / (Math.pow(1 + monthlyRate, nPayments) - 1)
    : 0

  const monthlyGrossRent = monthlyRent
  const monthlyOperatingExpenses = monthlyGrossRent * operatingExpenseRatio
  const monthlyReserve = monthlyGrossRent * operatingReservePct
  const monthlyNetCashFlow = monthlyGrossRent - monthlyOperatingExpenses - monthlyReserve - monthlyMortgage
  const monthlyInvestorDistribution = Math.max(0, monthlyNetCashFlow)

  const annualGrossRent = monthlyGrossRent * 12
  const annualNetCashFlow = monthlyNetCashFlow * 12
  const actualCashYield = investorCapital > 0 ? (monthlyInvestorDistribution * 12) / investorCapital : 0
  const cashYieldAchieved = actualCashYield >= targetCashYieldPct

  const totalDistributions = monthlyInvestorDistribution * 12 * holdPeriodYears
  const projectedSalePrice = arv * Math.pow(1.03, holdPeriodYears)
  const remainingLoanBalance = computeRemainingBalance(refinanceLoanAmount, refinanceRate, refinanceLoanTermYears, holdPeriodYears)
  const equityAtSale = (projectedSalePrice - remainingLoanBalance) * equitySplitAtSalePct
  const totalReturn = capitalReturnedViaRefi + totalDistributions + equityAtSale
  const totalROI = investorCapital > 0 ? totalReturn / investorCapital : 0

  const dealScore = computeBRRRScore({ actualCashYield, targetCashYield: targetCashYieldPct, capitalReturnedViaRefi, investorCapital, totalROI })

  return {
    refinanceLoanAmount,
    capitalReturnedViaRefi,
    remainingCapitalAtRisk,
    bridgeLoanCosts,
    monthlyGrossRent,
    monthlyOperatingExpenses,
    monthlyReserve,
    monthlyMortgage,
    monthlyNetCashFlow,
    monthlyInvestorDistribution,
    annualGrossRent,
    annualNetCashFlow,
    actualCashYield,
    targetCashYield: targetCashYieldPct,
    cashYieldAchieved,
    totalDistributions,
    equityAtSale,
    totalReturn,
    totalROI,
    dealScore,
    recommendation: dealScore >= 80 ? 'Strong Buy' : dealScore >= 60 ? 'Caution' : 'Pass',
  }
}

function computeRemainingBalance(principal: number, annualRate: number, termYears: number, yearsPaid: number): number {
  const monthlyRate = annualRate / 12
  const nPayments = termYears * 12
  const paymentsMade = Math.min(yearsPaid * 12, nPayments)
  if (monthlyRate === 0) return principal * (1 - paymentsMade / nPayments)
  const monthly = principal * (monthlyRate * Math.pow(1 + monthlyRate, nPayments)) / (Math.pow(1 + monthlyRate, nPayments) - 1)
  return monthly * (Math.pow(1 + monthlyRate, nPayments) - Math.pow(1 + monthlyRate, paymentsMade)) / (Math.pow(1 + monthlyRate, nPayments) - 1)
}

function computeBRRRScore({ actualCashYield, targetCashYield, capitalReturnedViaRefi, investorCapital, totalROI }: {
  actualCashYield: number
  targetCashYield: number
  capitalReturnedViaRefi: number
  investorCapital: number
  totalROI: number
}): number {
  const yieldRatio = targetCashYield > 0 ? actualCashYield / targetCashYield : 0
  const yieldScore = Math.min(100, Math.max(0, yieldRatio * 100))

  const capReturnRatio = investorCapital > 0 ? capitalReturnedViaRefi / investorCapital : 0
  const capitalScore = capReturnRatio >= 1 ? 100
    : capReturnRatio >= 0.75 ? 75 + ((capReturnRatio - 0.75) / 0.25) * 25
    : capReturnRatio >= 0.50 ? 50 + ((capReturnRatio - 0.50) / 0.25) * 25
    : Math.max(0, (capReturnRatio / 0.50) * 50)

  const roiScore = totalROI >= 1.50 ? 100
    : totalROI >= 1.00 ? 75 + ((totalROI - 1.00) / 0.50) * 25
    : totalROI >= 0.50 ? 50 + ((totalROI - 0.50) / 0.50) * 25
    : Math.max(0, (totalROI / 0.50) * 50)

  return Math.round(yieldScore * 0.35 + capitalScore * 0.35 + roiScore * 0.30)
}
