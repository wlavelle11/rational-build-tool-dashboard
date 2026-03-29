import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { dealSchema } from '@/lib/validations'
import { analyzeDeal } from '@/lib/finance'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deal = await prisma.deal.findUnique({ where: { id } })
  if (!deal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(deal)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data = dealSchema.parse(body)
    const metrics = analyzeDeal(data)
    const deal = await prisma.deal.update({
      where: { id },
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
    return NextResponse.json(deal)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.deal.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
