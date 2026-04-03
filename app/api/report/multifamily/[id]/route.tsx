import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyzeDeal } from '@/lib/finance'
import { MultifamilyReport } from '@/lib/report/MultifamilyReport'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const deal = await prisma.deal.findUnique({ where: { id } })
  if (!deal) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const metrics = analyzeDeal({
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
  })

  const date = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  const buffer = await renderToBuffer(
    <MultifamilyReport
      name={deal.name}
      address={deal.address}
      neighborhood={deal.neighborhood}
      units={deal.units}
      purchasePrice={deal.purchasePrice}
      acquisitionClosingCosts={deal.acquisitionClosingCosts}
      renovationCapex={deal.renovationCapex}
      equityInvested={deal.equityInvested}
      monthlyGrossRent={deal.monthlyGrossRent}
      vacancyRate={deal.vacancyRate}
      operatingExpenseRatio={deal.operatingExpenseRatio}
      holdPeriodYears={deal.holdPeriodYears}
      exitCapRate={deal.exitCapRate}
      preferredReturnRate={deal.preferredReturnRate}
      sponsorPromoteRate={deal.sponsorPromoteRate}
      metrics={metrics}
      date={date}
    />
  )

  const filename = `${deal.name.replace(/[^a-z0-9]/gi, '-')}-Multifamily-Investor-Report.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
