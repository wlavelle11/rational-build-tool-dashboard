import { z } from 'zod'

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
