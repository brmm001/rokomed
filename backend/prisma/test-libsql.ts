/**
 * test-libsql.ts
 * Testa o cliente libSQL com um INSERT simples
 */

import { createClient } from '@libsql/client'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { randomUUID } from 'crypto'

dotenv.config({ path: path.resolve(__dirname, '../.env.turso') })

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function main() {
  // Check current institutions
  const instRows = await client.execute({ sql: 'SELECT id, acronym FROM institutions WHERE acronym = ?', args: ['UFSC'] })
  console.log('UFSC in DB?', instRows.rows.length > 0, instRows.rows[0])
  
  // Test a simple batch
  const id = randomUUID()
  const code = `UFSC-2015-TEST-${Date.now()}`
  const now = new Date().toISOString()
  const instId = instRows.rows[0]?.id as string ?? 'missing'
  
  console.log('\nTest args:')
  const args = [id, code, 2015, '<p>Test</p>', '[]', instId, now, now]
  args.forEach((v, i) => console.log(`  arg[${i}]: ${typeof v} = ${String(v).substring(0, 60)}`))
  
  try {
    await client.batch([{
      sql: `INSERT INTO questions
              (id, code, year, statement, options, difficulty, isPublished, flagCount, institutionId, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, 'MEDIO', 0, 0, ?, ?, ?)
            ON CONFLICT(code) DO UPDATE SET
              statement = excluded.statement,
              options   = excluded.options,
              updatedAt = excluded.updatedAt`,
      args: args as any,
    }], 'write')
    console.log('✅ Batch OK')
    
    // Cleanup
    await client.execute({ sql: 'DELETE FROM questions WHERE code = ?', args: [code] })
  } catch (err) {
    console.error('❌ Batch error:', err)
  }

  await client.close()
}

main().catch(e => { console.error(e); process.exit(1) })
