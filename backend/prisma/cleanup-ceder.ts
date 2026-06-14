import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.turso') })

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function main() {
  const r = await client.execute(`
    DELETE FROM questions 
    WHERE code LIKE 'Santa Casa de Misericórdia do Recife / CEDER-2025-%'
  `)
  console.log(`🧹 Deletadas ${r.rowsAffected} questões antigas do CEDER com código temporário.`)
  await client.close()
}

main().catch(console.error)
