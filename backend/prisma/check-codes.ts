import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.turso') })

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function main() {
  const res = await client.execute("SELECT code FROM questions WHERE code LIKE '%revalida%' AND code LIKE '%2023%' AND code NOT LIKE 'Revalida-2023-1-%' ORDER BY code")
  console.log("Revalida 2023 codes NOT starting with Revalida-2023-1-:", res.rows.map(r => r.code))
  await client.close()
}

main().catch(console.error)
