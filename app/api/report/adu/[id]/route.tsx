import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assessFeasibility } from '@/lib/finance/adu-feasibility'
import { analyzeADU } from '@/lib/finance/adu'
import { ADUReport } from '@/lib/report/ADUReport'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const p = await prisma.aDUProject.findUnique({ where: { id } })
  if (!p) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const feasibility = assessFeasibility({
    lotSizeSqft: p.lotSizeSqft,
    existingCoverageSqft: p.existingCoverageSqft,
    zoningCode: p.zoningCode,
    aduCount: p.aduCount,
    setbackFront: p.setbackFront,
    setbackRear: p.setbackRear,
    setbackSide: p.setbackSide,
    utilityWater: p.utilityWater as 'adequate' | 'needs_upgrade',
    utilitySewer: p.utilitySewer as 'adequate' | 'needs_upgrade',
    hasHOA: p.hasHOA,
    permitTimelineMonths: p.permitTimelineMonths,
    permitCostEstimate: p.permitCostEstimate,
  })

  const analysis = analyzeADU({
    purchasePrice: p.purchasePrice,
    constructionCost: p.constructionCost,
    aduCount: p.aduCount,
    marketRateUnits: p.marketRateUnits,
    middleIncomeUnits: p.middleIncomeUnits,
    marketRateRent: p.marketRateRent,
    middleIncomeRent: p.middleIncomeRent,
    vacancyRate: p.vacancyRate,
    opExpRatio: p.opExpRatio,
    annualRentGrowth: p.annualRentGrowth,
    holdPeriodYears: p.holdPeriodYears,
    exitCapRate: p.exitCapRate,
    equityInvested: p.equityInvested,
    preferredReturnRate: p.preferredReturnRate,
    sponsorSplit: p.sponsorSplit,
  })

  const date = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  const buffer = await renderToBuffer(
    <ADUReport
      name={p.name}
      address={p.address}
      neighborhood={p.neighborhood}
      purchasePrice={p.purchasePrice}
      constructionCost={p.constructionCost}
      aduCount={p.aduCount}
      marketRateUnits={p.marketRateUnits}
      middleIncomeUnits={p.middleIncomeUnits}
      marketRateRent={p.marketRateRent}
      middleIncomeRent={p.middleIncomeRent}
      holdPeriodYears={p.holdPeriodYears}
      exitCapRate={p.exitCapRate}
      equityInvested={p.equityInvested}
      preferredReturnRate={p.preferredReturnRate}
      sponsorSplit={p.sponsorSplit}
      analysis={analysis}
      feasibility={feasibility}
      date={date}
    />
  )

  const filename = `${p.name.replace(/[^a-z0-9]/gi, '-')}-ADU-Investor-Report.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
