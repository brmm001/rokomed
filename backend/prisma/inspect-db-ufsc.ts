/**
 * inspect-db-ufsc.ts
 * Busca todas as questões da UFSC no banco para ver seus códigos, anos e se foram publicadas.
 */
import { createClient } from '@libsql/client'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../.env.turso') })

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function main() {
  const result = await client.execute({
    sql: `SELECT id, code, year, isPublished, statement FROM questions WHERE code LIKE '%UFSC%' OR code LIKE '%ufsc%' LIMIT 20`,
    args: []
  })
  console.log(`Encontradas ${result.rows.length} questões UFSC no BD:`)
  for (const r of result.rows) {
    console.log(`code: ${r.code} | year: ${r.year} | published: ${r.isPublished} | statement: ${(r.statement as string).slice(0, 50)}`)
  }
  await client.close()
}

main().catch(e => { console.error(e); process.exit(1) })
