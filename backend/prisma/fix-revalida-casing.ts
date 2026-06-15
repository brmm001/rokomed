import * as dotenv from 'dotenv'
import * as path from 'path'

const useTurso = process.argv.includes('--turso')

if (useTurso) {
  dotenv.config({ path: path.resolve(__dirname, '../.env.turso') })
  console.log("Using Turso production environment.")
} else {
  dotenv.config({ path: path.resolve(__dirname, '../.env') })
  console.log("Using local environment.")
}

import { prisma } from '../src/lib/prisma'

async function main() {
  console.log("Fixing Revalida casing in the database...")
  const updatedCount = await prisma.$executeRawUnsafe(
    `UPDATE questions SET code = REPLACE(code, 'REVALIDA-', 'Revalida-') WHERE code LIKE 'REVALIDA-%'`
  )
  console.log(`✅ Updated ${updatedCount} question codes.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
