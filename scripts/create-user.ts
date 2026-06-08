/**
 * Create a dashboard user.
 *
 * Usage:
 *   npx tsx scripts/create-user.ts <email> <password> [name]
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'
import 'dotenv/config'

async function main() {
  const [, , email, password, name] = process.argv

  if (!email || !password) {
    console.error('Usage: npx tsx scripts/create-user.ts <email> <password> [name]')
    process.exit(1)
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  try {
    const passwordHash = await hash(password, 12)
    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase().trim() },
      update: { passwordHash, name: name || undefined },
      create: {
        email: email.toLowerCase().trim(),
        name: name || email.split('@')[0],
        passwordHash,
        role: 'admin',
      },
    })
    console.log(`User created: ${user.email} (${user.role})`)
  } finally {
    await prisma.$disconnect()
  }
}

main()
