import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/leads/cleanup
// Deletes Archived leads older than 90 days that have NOT been saved.
// Safe to call from a cron job or manually from the UI.
export async function POST() {
  try {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

    const result = await prisma.lead.deleteMany({
      where: {
        tab: 'Archived',
        saved: false,
        updatedAt: { lt: cutoff },
      },
    })

    return NextResponse.json({ deleted: result.count })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
