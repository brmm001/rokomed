import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function fix() {
  // 1. Corrige acronym da instituição
  const r1 = await client.execute({
    sql:  `UPDATE institutions SET acronym = 'FMABC' WHERE acronym = 'FMACB'`,
    args: [],
  })
  console.log('Instituição corrigida:', r1.rowsAffected)

  // 2. Corrige todos os codes das questões FMACB- -> FMABC-
  const r2 = await client.execute({
    sql:  `UPDATE questions SET code = REPLACE(code, 'FMACB-', 'FMABC-') WHERE code LIKE 'FMACB-%'`,
    args: [],
  })
  console.log('Questões (code) corrigidas:', r2.rowsAffected)

  // 3. Corrige institutionId nas questões para apontar para o id correto
  const inst = await client.execute({
    sql:  `SELECT id FROM institutions WHERE acronym = 'FMABC'`,
    args: [],
  })
  if (inst.rows.length > 0) {
    const instId = inst.rows[0].id as string
    const r3 = await client.execute({
      sql:  `UPDATE questions SET institutionId = ? WHERE code LIKE 'FMABC-%'`,
      args: [instId],
    })
    console.log('institutionId corrigido:', r3.rowsAffected)
  }

  // Resumo
  const total = await client.execute(`SELECT COUNT(*) as n FROM questions WHERE code LIKE 'FMABC-%'`)
  console.log('Total questões FMABC no BD:', total.rows[0].n)

  await client.close()
}

fix().catch(e => { console.error(e); process.exit(1) })
