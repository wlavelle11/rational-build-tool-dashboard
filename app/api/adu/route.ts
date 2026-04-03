import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { aduSchema } from '@/lib/validations'
import { assessFeasibility } from '@/lib/finance/adu-feasibility'
import { analyzeADU } from '@/lib/finance/adu'

export async function GET() {
  try {
    const projects = await prisma.aDUProject.findMany({ orderBy: { updatedAt: 'desc' } })
    return NextResponse.json(projects)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = aduSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

    const d = parsed.data

    const feasibility = assessFeasibility({
      lotSizeSqft: d.lotSizeSqft, existingCoverageSqft: d.existingCoverageSqft,
      zoningCode: d.zoningCode ?? '', aduCount: d.aduCount,
      setbackFront: d.setbackFront, setbackRear: d.setbackRear, setbackSide: d.setbackSide,
      utilityWater: d.utilityWater, utilitySewer: d.utilitySewer,
      hasHOA: d.hasHOA, permitTimelineMonths: d.permitTimelineMonths, permitCostEstimate: d.permitCostEstimate,
    })

    const analysis = analyzeADU({
      purchasePrice: d.purchasePrice, constructionCost: d.constructionCost,
      aduCount: d.aduCount, marketRateUnits: d.marketRateUnits, middleIncomeUnits: d.middleIncomeUnits,
      marketRateRent: d.marketRateRent, middleIncomeRent: d.middleIncomeRent,
      vacancyRate: d.vacancyRate, opExpRatio: d.opExpRatio, annualRentGrowth: d.annualRentGrowth,
      holdPeriodYears: d.holdPeriodYears, exitCapRate: d.exitCapRate,
      equityInvested: d.equityInvested, preferredReturnRate: d.preferredReturnRate, sponsorSplit: d.sponsorSplit,
    })

    const project = await prisma.aDUProject.create({
      data: {
        name: d.name, neighborhood: d.neighborhood, address: d.address ?? null, apn: d.apn ?? null,
        purchasePrice: d.purchasePrice, lotSizeSqft: d.lotSizeSqft, existingCoverageSqft: d.existingCoverageSqft,
        zoningCode: d.zoningCode ?? '', setbackFront: d.setbackFront, setbackRear: d.setbackRear, setbackSide: d.setbackSide,
        utilityWater: d.utilityWater, utilitySewer: d.utilitySewer, hasHOA: d.hasHOA,
        permitTimelineMonths: d.permitTimelineMonths, permitCostEstimate: d.permitCostEstimate,
        aduCount: d.aduCount, constructionCost: d.constructionCost,
        marketRateUnits: d.marketRateUnits, middleIncomeUnits: d.middleIncomeUnits,
        marketRateRent: d.marketRateRent, middleIncomeRent: d.middleIncomeRent,
        vacancyRate: d.vacancyRate, opExpRatio: d.opExpRatio, annualRentGrowth: d.annualRentGrowth,
        holdPeriodYears: d.holdPeriodYears, exitCapRate: d.exitCapRate,
        equityInvested: d.equityInvested, preferredReturnRate: d.preferredReturnRate, sponsorSplit: d.sponsorSplit,
        cachedFeasibilityScore: feasibility.totalScore, cachedFeasibilityFlag: feasibility.flag,
        cachedIRR: analysis.irr, cachedEquityMultiple: analysis.equityMultiple, cachedRecommendation: analysis.recommendation,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
