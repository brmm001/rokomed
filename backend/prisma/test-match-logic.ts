/**
 * test-match-logic.ts
 * Testar porque fast-import-answers não encontrou o código no BD.
 */
import { createClient } from '@libsql/client'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../.env.turso') })

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

function buildCode(inst: string, ano: any, num: number): string {
  let normalizedInst = inst.trim()
  if (normalizedInst.startsWith('UNICAMP')) normalizedInst = 'UNICAMP'
  if (normalizedInst.toLowerCase().includes('revalida')) normalizedInst = 'Revalida'
  let parsedAno = typeof ano === 'number' ? ano : parseInt(String(ano), 10)
  if (isNaN(parsedAno)) parsedAno = 0
  return `${normalizedInst}-${parsedAno}-${num}`
}

async function main() {
  const qRows = await client.execute('SELECT code FROM questions WHERE code LIKE "%UFSC%"')
  const existingCodes = new Set(qRows.rows.map(r => (r.code as string)))
  console.log(`Encontradas ${existingCodes.size} questoes UFSC no BD. Exemplo:`, Array.from(existingCodes).slice(0, 5))

  const gabaritoPath = path.resolve(__dirname, '../../gabarito_importar.jsonl')
  const gLines = fs.readFileSync(gabaritoPath, 'utf8').split('\n').filter(Boolean)

  let matched = 0
  let unMatched = 0

  for (const line of gLines) {
    let raw: any
    try { raw = JSON.parse(line) } catch { continue }
    if (!raw.instituicao || !raw.instituicao.includes('UFSC')) continue

    let num: number = raw.numero_questao_original ?? raw.numero_questao ?? 0
    const rawId = raw.id ? raw.id.replace(/_/g, '-').replace(/^REVALIDA-/i, 'Revalida-') : null

    if (!num && rawId) {
      const lastPart = rawId.split('-').pop() ?? ''
      const parsed = parseInt(lastPart, 10)
      if (!isNaN(parsed) && parsed > 0) num = parsed
    }

    let code = rawId ?? buildCode(raw.instituicao, raw.ano, num)
    if (!existingCodes.has(code)) {
      code = buildCode(raw.instituicao, raw.ano, num)
    }

    if (!existingCodes.has(code)) {
      const instPrefix = raw.instituicao.split(/[\s\/]/)[0].trim()
      if (instPrefix && instPrefix !== raw.instituicao.trim()) {
        const fallbackCode = buildCode(instPrefix, raw.ano, num)
        if (existingCodes.has(fallbackCode)) {
          code = fallbackCode
        }
      }
    }

    if (existingCodes.has(code)) {
      matched++
    } else {
      unMatched++
      if (unMatched <= 5) {
        console.log('Unmatched sample:', { rawId, inst: raw.instituicao, ano: raw.ano, num, codeTried: code })
      }
    }
  }

  console.log(`Resultados UFSC: ${matched} matched, ${unMatched} unmatched`)
  await client.close()
}

main().catch(e => { console.error(e); process.exit(1) })
