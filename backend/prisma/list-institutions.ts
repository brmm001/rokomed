/**
 * list-institutions.ts
 * Lista todas as instituições no banco
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
  const result = await client.execute({ sql: 'SELECT id, name, acronym, city, state FROM institutions ORDER BY acronym', args: [] })
  console.log(`Found ${result.rows.length} institutions:`)
  for (const row of result.rows) {
    console.log(`  acronym="${row.acronym}" name="${String(row.name).substring(0, 40)}" city="${row.city}" state="${row.state}"`)
  }
  await client.close()
}

main().catch(e => { console.error(e); process.exit(1) })
