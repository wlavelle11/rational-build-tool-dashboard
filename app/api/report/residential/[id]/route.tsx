import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateFlip } from '@/lib/finance/flip'
import { calculateBRRR } from '@/lib/finance/brrr'
import { ResidentialReport } from '@/lib/report/ResidentialReport'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const p = await prisma.residentialProject.findUnique({ where: { id } })
  if (!p) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const flip = calculateFlip({
    purchasePrice: p.purchasePrice,
    renovationBudget: p.renovationBudget,
    arv: p.arv,
    holdPeriodMonths: p.flipHoldMonths,
    buyClosingCosts: p.buyClosingCosts,
    sellClosingCostsPct: p.flipSellClosingPct,
    investorCapital: p.flipInvestorCapital,
    monthlyCarryingCosts: p.flipMonthlyCarrying,
    financingType: p.flipFinancingType as 'cash' | 'hard_money',
    hardMoneyLtvPct: p.flipHardMoneyLtvPct ?? undefined,
    hardMoneyRate: p.flipHardMoneyRate ?? undefined,
    hardMoneyPoints: p.flipHardMoneyPoints ?? undefined,
  })

  const brrr = calculateBRRR({
    purchasePrice: p.purchasePrice,
    renovationBudget: p.renovationBudget,
    arv: p.arv,
    buyClosingCosts: p.buyClosingCosts,
    holdPeriodYears: p.brrrHoldYears,
    investorCapital: p.brrrInvestorCapital,
    targetCashYieldPct: p.brrrTargetYield,
    equitySplitAtSalePct: p.brrrEquitySplit,
    monthlyRent: p.brrrMonthlyRent,
    operatingExpenseRatio: p.brrrOpExpRatio,
    operatingReservePct: p.brrrReservePct,
    refinanceLtv: p.brrrRefinanceLtv,
    refinanceRate: p.brrrRefinanceRate,
    refinanceLoanTermYears: p.brrrRefinanceTerm,
    financingType: p.brrrFinancingType as 'cash' | 'hard_money',
    hardMoneyLtvPct: p.brrrHardMoneyLtvPct ?? undefined,
    hardMoneyRate: p.brrrHardMoneyRate ?? undefined,
    hardMoneyPoints: p.brrrHardMoneyPoints ?? undefined,
    renovationMonths: p.brrrRenovationMonths ?? undefined,
  })

  const date = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  const buffer = await renderToBuffer(
    <ResidentialReport
      name={p.name}
      address={p.address}
      neighborhood={p.neighborhood}
      purchasePrice={p.purchasePrice}
      renovationBudget={p.renovationBudget}
      arv={p.arv}
      buyClosingCosts={p.buyClosingCosts}
      flipHoldMonths={p.flipHoldMonths}
      flipInvestorCapital={p.flipInvestorCapital}
      brrrHoldYears={p.brrrHoldYears}
      brrrInvestorCapital={p.brrrInvestorCapital}
      flip={flip}
      brrr={brrr}
      date={date}
    />
  )

  const filename = `${p.name.replace(/[^a-z0-9]/gi, '-')}-Investor-Report.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
