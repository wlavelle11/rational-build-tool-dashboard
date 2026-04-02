import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assessFeasibility } from '@/lib/finance/adu-feasibility'
import { analyzeADU } from '@/lib/finance/adu'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const project = await prisma.aDUProject.findUnique({ where: { id: params.id } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()

  const feasibility = assessFeasibility({
    lotSizeSqft: body.lotSizeSqft, existingCoverageSqft: body.existingCoverageSqft,
    zoningCode: body.zoningCode, aduCount: body.aduCount,
    setbackFront: body.setbackFront, setbackRear: body.setbackRear, setbackSide: body.setbackSide,
    utilityWater: body.utilityWater, utilitySewer: body.utilitySewer,
    hasHOA: body.hasHOA, permitTimelineMonths: body.permitTimelineMonths, permitCostEstimate: body.permitCostEstimate,
  })

  const analysis = analyzeADU({
    purchasePrice: body.purchasePrice, constructionCost: body.constructionCost,
    aduCount: body.aduCount, marketRateUnits: body.marketRateUnits, middleIncomeUnits: body.middleIncomeUnits,
    marketRateRent: body.marketRateRent, middleIncomeRent: body.middleIncomeRent,
    vacancyRate: body.vacancyRate, opExpRatio: body.opExpRatio, annualRentGrowth: body.annualRentGrowth,
    holdPeriodYears: body.holdPeriodYears, exitCapRate: body.exitCapRate,
    equityInvested: body.equityInvested, preferredReturnRate: body.preferredReturnRate, sponsorSplit: body.sponsorSplit,
  })

  const project = await prisma.aDUProject.update({
    where: { id: params.id },
    data: {
      ...body,
      cachedFeasibilityScore: feasibility.totalScore,
      cachedFeasibilityFlag: feasibility.flag,
      cachedIRR: analysis.irr,
      cachedEquityMultiple: analysis.equityMultiple,
      cachedRecommendation: analysis.recommendation,
    },
  })

  return NextResponse.json(project)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.aDUProject.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
