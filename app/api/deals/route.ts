import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { dealSchema } from '@/lib/validations'
import { analyzeDeal } from '@/lib/finance'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = dealSchema.parse(body)
    const metrics = analyzeDeal(data)
    const deal = await prisma.deal.create({
      data: {
        ...data,
        address: data.address || null,
        cachedIRR: metrics.irr,
        cachedEquityMultiple: metrics.equityMultiple,
        cachedCapRate: metrics.year1CapRate,
        cachedScore: metrics.dealScore,
        cachedRecommendation: metrics.recommendation,
      },
    })
    return NextResponse.json(deal, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  const deals = await prisma.deal.findMany({ orderBy: { updatedAt: 'desc' } })
  return NextResponse.json(deals)
}
