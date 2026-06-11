import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { leadSchema } from '@/lib/validations'

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({ orderBy: { score: 'desc' } })
    return NextResponse.json(leads)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  // Enforced once PIPELINE_API_KEY is set in the environment; open until then
  // so the pipeline keeps syncing while the key is rolled out to both sides.
  const apiKey = process.env.PIPELINE_API_KEY
  if (apiKey && req.headers.get('x-api-key') !== apiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const records: unknown[] = Array.isArray(body) ? body : (body.leads ?? [])

    if (records.length === 0) return NextResponse.json({ upserted: 0 })

    let upserted = 0
    const errors: { index: number; error: unknown }[] = []

    for (let i = 0; i < records.length; i++) {
      const parsed = leadSchema.safeParse(records[i])
      if (!parsed.success) {
        errors.push({ index: i, error: parsed.error.flatten() })
        continue
      }
      const d = parsed.data
      await prisma.lead.upsert({
        where: { address: d.address },
        update: {
          zipCode: d.zipCode, leadType: d.leadType, tab: d.tab,
          distressType: d.distressType, filingDate: d.filingDate,
          estValue: d.estValue, loanAmount: d.loanAmount,
          equity: d.equity, equityPct: d.equityPct,
          yearBuilt: d.yearBuilt, beds: d.beds, baths: d.baths, sqft: d.sqft,
          score: d.score, status: d.status, sources: d.sources,
          priority: d.priority, photoUrl: d.photoUrl, notes: d.notes,
          firstSeen: d.firstSeen, lastSeen: d.lastSeen,
          // never overwrite saved=true from pipeline syncs
        },
        create: {
          address: d.address, zipCode: d.zipCode, leadType: d.leadType, tab: d.tab,
          distressType: d.distressType, filingDate: d.filingDate,
          estValue: d.estValue, loanAmount: d.loanAmount,
          equity: d.equity, equityPct: d.equityPct,
          yearBuilt: d.yearBuilt, beds: d.beds, baths: d.baths, sqft: d.sqft,
          score: d.score, status: d.status, sources: d.sources,
          priority: d.priority, photoUrl: d.photoUrl, notes: d.notes,
          firstSeen: d.firstSeen, lastSeen: d.lastSeen,
          saved: false,
        },
      })
      upserted++
    }

    return NextResponse.json({ upserted, errors: errors.length > 0 ? errors : undefined })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
