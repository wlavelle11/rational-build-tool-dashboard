export interface FlipInputs {
  purchasePrice: number
  renovationBudget: number
  arv: number
  holdPeriodMonths: number
  buyClosingCosts: number
  sellClosingCostsPct: number
  investorCapital: number
  monthlyCarryingCosts: number
  financingType: 'cash' | 'hard_money'
  hardMoneyLtvPct?: number
  hardMoneyRate?: number
  hardMoneyPoints?: number
}

export interface FlipMetrics {
  totalProjectCost: number
  hardMoneyCosts: number
  sellClosingCosts: number
  netSaleProceeds: number
  grossProfit: number
  loanFee: number
  interest: number
  netProjectProfit: number
  investorProfitShare: number
  totalInvestorReturn: number
  roi: number
  annualizedRoi: number
  profitMargin: number
  dealScore: number
  recommendation: 'Strong Buy' | 'Caution' | 'Pass'
}

export function calculateFlip(inputs: FlipInputs): FlipMetrics {
  const {
    purchasePrice,
    renovationBudget,
    arv,
    holdPeriodMonths,
    buyClosingCosts,
    sellClosingCostsPct,
    investorCapital,
    monthlyCarryingCosts,
    financingType,
    hardMoneyLtvPct = 0.70,
    hardMoneyRate = 0.12,
    hardMoneyPoints = 0.02,
  } = inputs

  const holdFraction = holdPeriodMonths / 12
  const carryingCosts = monthlyCarryingCosts * holdPeriodMonths

  let hardMoneyCosts = 0
  if (financingType === 'hard_money') {
    const loanAmount = purchasePrice * hardMoneyLtvPct
    hardMoneyCosts = loanAmount * hardMoneyRate * holdFraction + loanAmount * hardMoneyPoints
  }

  const totalProjectCost = purchasePrice + renovationBudget + buyClosingCosts + carryingCosts + hardMoneyCosts
  const sellClosingCosts = arv * sellClosingCostsPct
  const netSaleProceeds = arv - sellClosingCosts
  const grossProfit = netSaleProceeds - totalProjectCost

  // Investor return structure from RBD's investor doc
  const loanFee = investorCapital * 0.01
  const interest = investorCapital * 0.10 * holdFraction
  const netProjectProfit = grossProfit
  const investorProfitShare = Math.max(0, netProjectProfit * 0.3333)
  const totalInvestorReturn = loanFee + interest + investorProfitShare

  const roi = investorCapital > 0 ? totalInvestorReturn / investorCapital : 0
  const annualizedRoi = holdPeriodMonths > 0 ? Math.pow(1 + roi, 12 / holdPeriodMonths) - 1 : 0
  const profitMargin = arv > 0 ? grossProfit / arv : 0

  const dealScore = computeFlipScore({ annualizedRoi, profitMargin, grossProfit, investorCapital })

  return {
    totalProjectCost,
    hardMoneyCosts,
    sellClosingCosts,
    netSaleProceeds,
    grossProfit,
    loanFee,
    interest,
    netProjectProfit,
    investorProfitShare,
    totalInvestorReturn,
    roi,
    annualizedRoi,
    profitMargin,
    dealScore,
    recommendation: dealScore >= 80 ? 'Strong Buy' : dealScore >= 60 ? 'Caution' : 'Pass',
  }
}

function computeFlipScore({ annualizedRoi, profitMargin, grossProfit, investorCapital }: {
  annualizedRoi: number
  profitMargin: number
  grossProfit: number
  investorCapital: number
}): number {
  const roiScore = annualizedRoi >= 0.40 ? 100
    : annualizedRoi >= 0.30 ? 75 + ((annualizedRoi - 0.30) / 0.10) * 25
    : annualizedRoi >= 0.20 ? 50 + ((annualizedRoi - 0.20) / 0.10) * 25
    : Math.max(0, (annualizedRoi / 0.20) * 50)

  const marginScore = profitMargin >= 0.20 ? 100
    : profitMargin >= 0.15 ? 75 + ((profitMargin - 0.15) / 0.05) * 25
    : profitMargin >= 0.10 ? 50 + ((profitMargin - 0.10) / 0.05) * 25
    : Math.max(0, (profitMargin / 0.10) * 50)

  const profitPct = investorCapital > 0 ? grossProfit / investorCapital : 0
  const profitScore = profitPct >= 0.40 ? 100
    : profitPct >= 0.30 ? 75 + ((profitPct - 0.30) / 0.10) * 25
    : profitPct >= 0.20 ? 50 + ((profitPct - 0.20) / 0.10) * 25
    : Math.max(0, (profitPct / 0.20) * 50)

  return Math.round(roiScore * 0.40 + marginScore * 0.35 + profitScore * 0.25)
}
