import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { residentialSchema } from '@/lib/validations'
import { calculateFlip } from '@/lib/finance/flip'
import { calculateBRRR } from '@/lib/finance/brrr'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const project = await prisma.residentialProject.findUnique({ where: { id: params.id } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const parsed = residentialSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const d = parsed.data

  const flip = calculateFlip({
    purchasePrice: d.purchasePrice,
    renovationBudget: d.renovationBudget,
    arv: d.arv,
    holdPeriodMonths: d.flipHoldMonths,
    buyClosingCosts: d.buyClosingCosts,
    sellClosingCostsPct: d.flipSellClosingPct,
    investorCapital: d.flipInvestorCapital,
    monthlyCarryingCosts: d.flipMonthlyCarrying,
    financingType: d.flipFinancingType,
    hardMoneyLtvPct: d.flipHardMoneyLtvPct,
    hardMoneyRate: d.flipHardMoneyRate,
    hardMoneyPoints: d.flipHardMoneyPoints,
  })

  const brrr = calculateBRRR({
    purchasePrice: d.purchasePrice,
    renovationBudget: d.renovationBudget,
    arv: d.arv,
    buyClosingCosts: d.buyClosingCosts,
    holdPeriodYears: d.brrrHoldYears,
    investorCapital: d.brrrInvestorCapital,
    targetCashYieldPct: d.brrrTargetYield,
    equitySplitAtSalePct: d.brrrEquitySplit,
    monthlyRent: d.brrrMonthlyRent,
    operatingExpenseRatio: d.brrrOpExpRatio,
    operatingReservePct: d.brrrReservePct,
    refinanceLtv: d.brrrRefinanceLtv,
    refinanceRate: d.brrrRefinanceRate,
    refinanceLoanTermYears: d.brrrRefinanceTerm,
    financingType: d.brrrFinancingType,
    hardMoneyLtvPct: d.brrrHardMoneyLtvPct,
    hardMoneyRate: d.brrrHardMoneyRate,
    hardMoneyPoints: d.brrrHardMoneyPoints,
    renovationMonths: d.brrrRenovationMonths,
  })

  const project = await prisma.residentialProject.update({
    where: { id: params.id },
    data: {
      ...d,
      cachedFlipScore: flip.dealScore,
      cachedFlipRec: flip.recommendation,
      cachedFlipROI: flip.annualizedRoi,
      cachedBrrrScore: brrr.dealScore,
      cachedBrrrRec: brrr.recommendation,
      cachedBrrrYield: brrr.actualCashYield,
    },
  })

  return NextResponse.json(project)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.residentialProject.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
