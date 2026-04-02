import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const leads = await prisma.lead.findMany({ orderBy: { score: 'desc' } })
  return NextResponse.json(leads)
}

export async function POST(req: Request) {
  const body = await req.json()
  const records: Record<string, unknown>[] = Array.isArray(body) ? body : body.leads ?? []

  if (records.length === 0) {
    return NextResponse.json({ upserted: 0 })
  }

  let upserted = 0
  for (const r of records) {
    const address = String(r.address ?? '').trim()
    if (!address) continue

    await prisma.lead.upsert({
      where: { address },
      update: {
        zipCode:      r.zip_code      != null ? String(r.zip_code)      : undefined,
        leadType:     r.lead_type     != null ? String(r.lead_type)     : undefined,
        tab:          r.tab           != null ? String(r.tab)           : 'NOD',
        distressType: r.distress_type != null ? String(r.distress_type) : undefined,
        filingDate:   r.filing_date   != null ? String(r.filing_date)   : undefined,
        estValue:     r.est_value     != null ? Number(r.est_value)     : undefined,
        loanAmount:   r.loan_amount   != null ? Number(r.loan_amount)   : undefined,
        equity:       r.equity        != null ? Number(r.equity)        : undefined,
        equityPct:    r.equity_pct    != null ? Number(r.equity_pct)    : undefined,
        yearBuilt:    r.year_built    != null ? String(r.year_built)    : undefined,
        beds:         r.beds          != null ? String(r.beds)          : undefined,
        baths:        r.baths         != null ? String(r.baths)         : undefined,
        sqft:         r.sqft          != null ? String(r.sqft)          : undefined,
        score:        r.score         != null ? Number(r.score)         : 0,
        status:       r.status        != null ? String(r.status)        : undefined,
        sources:      r.sources       != null ? String(r.sources)       : undefined,
        priority:     Boolean(r.priority),
        notes:        r.notes         != null ? String(r.notes)         : undefined,
        firstSeen:    r.first_seen    != null ? String(r.first_seen)    : undefined,
        lastSeen:     r.last_seen     != null ? String(r.last_seen)     : undefined,
      },
      create: {
        address,
        zipCode:      r.zip_code      != null ? String(r.zip_code)      : undefined,
        leadType:     r.lead_type     != null ? String(r.lead_type)     : undefined,
        tab:          r.tab           != null ? String(r.tab)           : 'NOD',
        distressType: r.distress_type != null ? String(r.distress_type) : undefined,
        filingDate:   r.filing_date   != null ? String(r.filing_date)   : undefined,
        estValue:     r.est_value     != null ? Number(r.est_value)     : undefined,
        loanAmount:   r.loan_amount   != null ? Number(r.loan_amount)   : undefined,
        equity:       r.equity        != null ? Number(r.equity)        : undefined,
        equityPct:    r.equity_pct    != null ? Number(r.equity_pct)    : undefined,
        yearBuilt:    r.year_built    != null ? String(r.year_built)    : undefined,
        beds:         r.beds          != null ? String(r.beds)          : undefined,
        baths:        r.baths         != null ? String(r.baths)         : undefined,
        sqft:         r.sqft          != null ? String(r.sqft)          : undefined,
        score:        r.score         != null ? Number(r.score)         : 0,
        status:       r.status        != null ? String(r.status)        : undefined,
        sources:      r.sources       != null ? String(r.sources)       : undefined,
        priority:     Boolean(r.priority),
        notes:        r.notes         != null ? String(r.notes)         : undefined,
        firstSeen:    r.first_seen    != null ? String(r.first_seen)    : undefined,
        lastSeen:     r.last_seen     != null ? String(r.last_seen)     : undefined,
      },
    })
    upserted++
  }

  return NextResponse.json({ upserted }, { status: 200 })
}
