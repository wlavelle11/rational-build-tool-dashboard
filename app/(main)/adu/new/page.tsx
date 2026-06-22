import { ADUForm } from '@/components/adu/ADUForm'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function NewADUPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const id = typeof params.id === 'string' ? params.id : undefined

  const project = id ? await prisma.aDUProject.findUnique({ where: { id } }) : null
  const isEdit = Boolean(project)

  const defaultValues = project
    ? {
        name: project.name,
        neighborhood: project.neighborhood,
        address: project.address ?? '',
        apn: project.apn ?? '',
        purchasePrice: project.purchasePrice,
        lotSizeSqft: project.lotSizeSqft,
        existingCoverageSqft: project.existingCoverageSqft,
        zoningCode: project.zoningCode,
        setbackFront: project.setbackFront,
        setbackRear: project.setbackRear,
        setbackSide: project.setbackSide,
        utilityWater: project.utilityWater as 'adequate' | 'needs_upgrade',
        utilitySewer: project.utilitySewer as 'adequate' | 'needs_upgrade',
        hasHOA: project.hasHOA,
        permitTimelineMonths: project.permitTimelineMonths,
        permitCostEstimate: project.permitCostEstimate,
        aduCount: project.aduCount,
        constructionCost: project.constructionCost,
        marketRateUnits: project.marketRateUnits,
        middleIncomeUnits: project.middleIncomeUnits,
        marketRateRent: project.marketRateRent,
        middleIncomeRent: project.middleIncomeRent,
        vacancyRate: project.vacancyRate,
        opExpRatio: project.opExpRatio,
        annualRentGrowth: project.annualRentGrowth,
        holdPeriodYears: project.holdPeriodYears,
        exitCapRate: project.exitCapRate,
        equityInvested: project.equityInvested,
        preferredReturnRate: project.preferredReturnRate,
        sponsorSplit: project.sponsorSplit,
      }
    : undefined

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-eyebrow">ADU</p>
          <h1 className="page-title">{isEdit ? 'Edit ADU Analysis' : 'New ADU Analysis'}</h1>
          <p className="page-description">Feasibility scoring + 10-year financial model for San Diego Bonus ADU development</p>
        </div>
      </div>
      <ADUForm projectId={project?.id} defaultValues={defaultValues} />
    </div>
  )
}
