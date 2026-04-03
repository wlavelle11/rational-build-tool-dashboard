import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/leads/:id — toggle saved flag
export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const lead = await prisma.lead.findUnique({ where: { id }, select: { saved: true } })
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updated = await prisma.lead.update({
      where: { id },
      data: { saved: !lead.saved },
      select: { id: true, saved: true },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/leads/:id — hard delete a single lead
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.lead.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
