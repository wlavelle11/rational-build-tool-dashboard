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

export const aduSchema = z.object({
  name:                  z.string().min(1, 'Project name is required').max(100),
  neighborhood:          z.string().min(1, 'Neighborhood is required').max(100),
  address:               z.string().optional(),
  apn:                   z.string().optional(),
  purchasePrice:         z.coerce.number().min(1),
  lotSizeSqft:           z.coerce.number().min(0),
  existingCoverageSqft:  z.coerce.number().min(0),
  zoningCode:            z.string().optional().default(''),
  setbackFront:          z.coerce.boolean().default(false),
  setbackRear:           z.coerce.boolean().default(false),
  setbackSide:           z.coerce.boolean().default(false),
  utilityWater:          z.enum(['adequate', 'needs_upgrade']).default('adequate'),
  utilitySewer:          z.enum(['adequate', 'needs_upgrade']).default('adequate'),
  hasHOA:                z.coerce.boolean().default(false),
  permitTimelineMonths:  z.coerce.number().int().min(1).max(60).default(6),
  permitCostEstimate:    z.coerce.number().min(0).default(15000),
  aduCount:              z.coerce.number().int().min(1).max(12).default(4),
  constructionCost:      z.coerce.number().min(0),
  marketRateUnits:       z.coerce.number().int().min(0),
  middleIncomeUnits:     z.coerce.number().int().min(0),
  marketRateRent:        z.coerce.number().min(0),
  middleIncomeRent:      z.coerce.number().min(0),
  vacancyRate:           z.coerce.number().min(0).max(1).default(0.05),
  opExpRatio:            z.coerce.number().min(0).max(1).default(0.30),
  annualRentGrowth:      z.coerce.number().min(0).max(0.20).default(0.055),
  holdPeriodYears:       z.coerce.number().int().min(1).max(30).default(10),
  exitCapRate:           z.coerce.number().min(0.001).max(0.20).default(0.05),
  equityInvested:        z.coerce.number().min(1),
  preferredReturnRate:   z.coerce.number().min(0).max(0.20).default(0.06),
  sponsorSplit:          z.coerce.number().min(0).max(1).default(0.70),
})

export type ADUFormValues = z.infer<typeof aduSchema>

export const leadSchema = z.object({
  address:      z.string().min(1).max(500),
  zipCode:      z.string().max(20).optional(),
  leadType:     z.string().max(100).optional(),
  tab:          z.enum(['NOD', 'Auction', 'Listed', 'Archived']).default('NOD'),
  distressType: z.string().max(100).optional(),
  filingDate:   z.string().max(50).optional(),
  estValue:     z.coerce.number().nonnegative().optional(),
  loanAmount:   z.coerce.number().nonnegative().optional(),
  equity:       z.coerce.number().optional(),
  equityPct:    z.coerce.number().optional(),
  yearBuilt:    z.string().max(20).optional(),
  beds:         z.string().max(20).optional(),
  baths:        z.string().max(20).optional(),
  sqft:         z.string().max(20).optional(),
  score:        z.coerce.number().int().min(0).max(100).default(0),
  status:       z.string().max(200).optional(),
  sources:      z.string().max(500).optional(),
  priority:     z.coerce.boolean().default(false),
  notes:        z.string().max(1000).optional(),
  firstSeen:    z.string().max(50).optional(),
  lastSeen:     z.string().max(50).optional(),
})
