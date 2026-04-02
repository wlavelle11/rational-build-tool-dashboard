import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { analyzeDeal } from '@/lib/finance'
import { DealTabs } from '@/components/deals/DealTabs'

interface Props {
  params: Promise<{ id: string }>
}

export default async function DealPage({ params }: Props) {
  const { id } = await params
  const deal = await prisma.deal.findUnique({ where: { id } })
  if (!deal) notFound()

  const inputs = {
    purchasePrice: deal.purchasePrice,
    monthlyGrossRent: deal.monthlyGrossRent,
    vacancyRate: deal.vacancyRate,
    operatingExpenseRatio: deal.operatingExpenseRatio,
    annualRentGrowth: deal.annualRentGrowth,
    annualExpenseGrowth: deal.annualExpenseGrowth,
    holdPeriodYears: deal.holdPeriodYears,
    exitCapRate: deal.exitCapRate,
    acquisitionClosingCosts: deal.acquisitionClosingCosts,
    renovationCapex: deal.renovationCapex,
    equityInvested: deal.equityInvested,
    preferredReturnRate: deal.preferredReturnRate,
    sponsorPromoteRate: deal.sponsorPromoteRate,
  }

  const metrics = analyzeDeal(inputs)

  return <DealTabs deal={deal} inputs={inputs} metrics={metrics} />
}
