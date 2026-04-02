import { z } from 'zod'

export const residentialSchema = z.object({
  // Project info
  name: z.string().min(1, 'Project name is required').max(100),
  neighborhood: z.string().min(1, 'Neighborhood is required').max(100),
  address: z.string().optional(),

  // Shared property inputs
  purchasePrice: z.coerce.number().min(1, 'Purchase price is required'),
  renovationBudget: z.coerce.number().min(0),
  arv: z.coerce.number().min(1, 'ARV is required'),
  buyClosingCosts: z.coerce.number().min(0),

  // Flip inputs
  flipInvestorCapital: z.coerce.number().min(1, 'Investor capital is required'),
  flipHoldMonths: z.coerce.number().int().min(1).max(36),
  flipMonthlyCarrying: z.coerce.number().min(0),
  flipSellClosingPct: z.coerce.number().min(0).max(0.15),
  flipFinancingType: z.enum(['cash', 'hard_money']),
  flipHardMoneyLtvPct: z.coerce.number().min(0).max(1).optional(),
  flipHardMoneyRate: z.coerce.number().min(0).max(0.30).optional(),
  flipHardMoneyPoints: z.coerce.number().min(0).max(0.10).optional(),

  // BRRR inputs
  brrrInvestorCapital: z.coerce.number().min(1, 'Investor capital is required'),
  brrrHoldYears: z.coerce.number().int().min(1).max(30),
  brrrMonthlyRent: z.coerce.number().min(1, 'Monthly rent is required'),
  brrrOpExpRatio: z.coerce.number().min(0).max(1),
  brrrReservePct: z.coerce.number().min(0).max(0.20),
  brrrRefinanceLtv: z.coerce.number().min(0).max(0.90),
  brrrRefinanceRate: z.coerce.number().min(0).max(0.20),
  brrrRefinanceTerm: z.coerce.number().int().min(5).max(40),
  brrrTargetYield: z.coerce.number().min(0).max(0.20),
  brrrEquitySplit: z.coerce.number().min(0).max(1),
  brrrFinancingType: z.enum(['cash', 'hard_money']),
  brrrHardMoneyLtvPct: z.coerce.number().min(0).max(1).optional(),
  brrrHardMoneyRate: z.coerce.number().min(0).max(0.30).optional(),
  brrrHardMoneyPoints: z.coerce.number().min(0).max(0.10).optional(),
  brrrRenovationMonths: z.coerce.number().int().min(1).max(24).optional(),
})

export type ResidentialFormValues = z.infer<typeof residentialSchema>

export const dealSchema = z.object({
  name: z.string().min(1, 'Deal name is required').max(100),
  neighborhood: z.string().min(1, 'Neighborhood is required').max(100),
  address: z.string().optional(),
  units: z.coerce.number().int().min(1).max(500),
  purchasePrice: z.coerce.number().min(1),
  monthlyGrossRent: z.coerce.number().min(1),
  vacancyRate: z.coerce.number().min(0).max(1),
  operatingExpenseRatio: z.coerce.number().min(0).max(1),
  annualRentGrowth: z.coerce.number().min(0).max(1),
  annualExpenseGrowth: z.coerce.number().min(0).max(1),
  holdPeriodYears: z.coerce.number().int().min(1).max(30),
  exitCapRate: z.coerce.number().min(0.001).max(1),
  acquisitionClosingCosts: z.coerce.number().min(0),
  renovationCapex: z.coerce.number().min(0),
  equityInvested: z.coerce.number().min(1),
  preferredReturnRate: z.coerce.number().min(0).max(1),
  sponsorPromoteRate: z.coerce.number().min(0).max(1),
})

export type DealFormValues = z.infer<typeof dealSchema>
