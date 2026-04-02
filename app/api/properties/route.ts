import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [deals, residentialProjects] = await Promise.all([
    prisma.deal.findMany({ orderBy: { updatedAt: 'desc' } }),
    prisma.residentialProject.findMany({ orderBy: { updatedAt: 'desc' } }),
  ])
  return NextResponse.json({ deals, residentialProjects })
}
