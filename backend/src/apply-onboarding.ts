import { prisma } from './lib/prisma'

async function main() {
  const stmts = [
    `ALTER TABLE "users" ADD COLUMN "onboardingDone" INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE "users" ADD COLUMN "originInstitution" TEXT`,
    `ALTER TABLE "users" ADD COLUMN "targetSpecialtyId" TEXT`,
  ]

  for (const sql of stmts) {
    try {
      await prisma.$executeRawUnsafe(sql)
      console.log('OK:', sql.substring(0, 60))
    } catch (e: any) {
      console.log('Skip (já existe?):', e.message.substring(0, 80))
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
