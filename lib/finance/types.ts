export interface DealInputs {
  purchasePrice: number
  monthlyGrossRent: number
  vacancyRate: number
  operatingExpenseRatio: number
  annualRentGrowth: number
  annualExpenseGrowth: number
  holdPeriodYears: number
  exitCapRate: number
  acquisitionClosingCosts: number
  renovationCapex: number
  equityInvested: number
  preferredReturnRate: number
  sponsorPromoteRate: number
}

export interface YearlyProForma {
  year: number
  grossPotentialIncome: number
  vacancyLoss: number
  effectiveGrossIncome: number
  operatingExpenses: number
  noi: number
  cashFlow: number
  cumulativeCashFlow: number
}

export interface WaterfallResult {
  lpDistributions: number[]
  gpDistributions: number[]
  lpCumulativePref: number[]
  totalLpDistributions: number
  totalGpDistributions: number
  saleProceeds: number
  lpSaleProceeds: number
  gpSaleProceeds: number
}

export interface DealMetrics {
  year1CapRate: number
  year1CashOnCash: number
  year1NOI: number
  exitValuation: number
  totalValueCreation: number
  cumulativeCashFlow: number
  irr: number
  equityMultiple: number
  dealScore: number
  recommendation: 'Strong Buy' | 'Caution' | 'Pass'
  proForma: YearlyProForma[]
  waterfall: WaterfallResult
}

export interface SensitivityResult {
  rentGrowthRates: number[]
  exitCapRates: number[]
  irrMatrix: number[][]
  equityMultipleMatrix: number[][]
  totalValueCreationMatrix: number[][]
}
