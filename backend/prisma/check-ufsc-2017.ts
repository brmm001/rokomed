/**
 * check-new-questions.ts
 * Verifica os codes das questões UFSC 2017 importadas agora
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
  // Verifica UFSC 2017
  const r2017 = await client.execute({
    sql: `SELECT code, year, isPublished FROM questions WHERE year = 2017 AND code LIKE 'UFSC%' ORDER BY code`,
    args: []
  })
  console.log(`UFSC 2017 codes (${r2017.rows.length} total):`)
  for (const row of r2017.rows.slice(0, 10)) {
    console.log(`  code="${row.code}" isPublished=${row.isPublished}`)
  }
  
  // Verifica UFSC 2015
  const r2015 = await client.execute({
    sql: `SELECT COUNT(*) as cnt, MIN(code) as first_code, MAX(code) as last_code FROM questions WHERE year = 2015 AND code LIKE 'UFSC%'`,
    args: []
  })
  console.log(`\nUFSC 2015: ${r2015.rows[0].cnt} questões`)
  console.log(`  Primeiro: ${r2015.rows[0].first_code}`)
  console.log(`  Último: ${r2015.rows[0].last_code}`)
  
  // Verifica UFSC 2018
  const r2018 = await client.execute({
    sql: `SELECT COUNT(*) as cnt, MIN(code) as first_code, MAX(code) as last_code FROM questions WHERE year = 2018 AND code LIKE 'UFSC%'`,
    args: []
  })
  console.log(`\nUFSC 2018: ${r2018.rows[0].cnt} questões`)
  console.log(`  Primeiro: ${r2018.rows[0].first_code}`)
  console.log(`  Último: ${r2018.rows[0].last_code}`)
  
  await client.close()
}

main().catch(e => { console.error(e); process.exit(1) })
