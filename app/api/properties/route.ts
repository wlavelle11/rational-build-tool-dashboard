import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const properties = await prisma.property.findMany({ orderBy: { neighborhood: 'asc' } })
  return NextResponse.json(properties)
}
