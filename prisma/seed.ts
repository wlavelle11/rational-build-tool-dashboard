import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'
import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DIRECT_URL,
})

const adapter = new PrismaPg({ pool })
const prisma = new PrismaClient({ adapter })

async function main() {
  const clientPassword = await hash('Rational0123!', 12)

  await prisma.user.upsert({
    where: { email: 'buildrational@gmail.com' },
    update: {},
    create: {
      email: 'buildrational@gmail.com',
      name: 'Rational Build',
      passwordHash: clientPassword,
      role: 'viewer',
    },
  })

  console.log('Seeded client account: buildrational@gmail.com')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
