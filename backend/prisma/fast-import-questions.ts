/**
 * fast-import-questions.ts
 * Importa questões usando libSQL pipeline (batch) para máxima velocidade.
 * Uso: npx ts-node --project tsconfig.scripts.json prisma/fast-import-questions.ts <arquivo.jsonl>
 */

import { createClient } from '@libsql/client'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'
import * as dotenv from 'dotenv'
import { randomUUID } from 'crypto'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const INSTITUTION_MAP: Record<string, { name: string; city?: string; state?: string }> = {
  UNICAMP:    { name: 'Universidade Estadual de Campinas',          city: 'Campinas',              state: 'SP' },
  USP:        { name: 'Universidade de São Paulo',                  city: 'São Paulo',             state: 'SP' },
  UNIFESP:    { name: 'Universidade Federal de São Paulo',          city: 'São Paulo',             state: 'SP' },
  AMRIGS:     { name: 'Associação Médica do Rio Grande do Sul',     city: 'Porto Alegre',          state: 'RS' },
  ENARE:      { name: 'Exame Nacional de Residência',                                              state: 'BR' },
  UERJ:       { name: 'Universidade Estadual do Rio de Janeiro',    city: 'Rio de Janeiro',        state: 'RJ' },
  UFRJ:       { name: 'Universidade Federal do Rio de Janeiro',     city: 'Rio de Janeiro',        state: 'RJ' },
  UFMG:       { name: 'Universidade Federal de Minas Gerais',       city: 'Belo Horizonte',        state: 'MG' },
  FMUSP:      { name: 'Faculdade de Medicina da USP',               city: 'São Paulo',             state: 'SP' },
  HCFMUSP:    { name: 'Hospital das Clínicas FMUSP',               city: 'São Paulo',             state: 'SP' },
  'SUS-SP':   { name: 'SUS-SP',                                     city: 'São Paulo',             state: 'SP' },
  SANTA_CASA: { name: 'Santa Casa de São Paulo',                    city: 'São Paulo',             state: 'SP' },
  UFPR:       { name: 'Universidade Federal do Paraná',             city: 'Curitiba',              state: 'PR' },
  UNESP:      { name: 'Universidade Estadual Paulista',             city: 'São Paulo',             state: 'SP' },
  FAMERP:     { name: 'Faculdade de Medicina de São José do Rio Preto', city: 'São José do Rio Preto', state: 'SP' },
  PUCRS:      { name: 'Pontifícia Universidade Católica do Rio Grande do Sul', city: 'Porto Alegre', state: 'RS' },
  UFSC:       { name: 'Universidade Federal de Santa Catarina',     city: 'Florianópolis',         state: 'SC' },
  UFRGS:      { name: 'Universidade Federal do Rio Grande do Sul',  city: 'Porto Alegre',          state: 'RS' },
  CESUPA:     { name: 'Centro Universitário do Estado do Pará',     city: 'Belém',                 state: 'PA' },
  CMC:        { name: 'Colégio Médico de Córdoba',                                                 state: 'BR' },
}

interface RawQuestion {
  instituicao: string
  ano: number
  numero_questao: number
  enunciado_completo: string
  alternativas: Record<string, string>
}

function buildOptions(alternativas: Record<string, string>): string {
  return JSON.stringify(
    Object.entries(alternativas).map(([letter, text]) => ({ letter, text }))
  )
}

function buildCode(inst: string, ano: number, num: number): string {
  return `${inst}-${ano}-${num}`
}

const BATCH_SIZE = 50

async function main() {
  const filePath = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.resolve(__dirname, '../../novas_questoes.jsonl')

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo não encontrado: ${filePath}`)
    process.exit(1)
  }

  console.log(`📥 Importando questões (batch/pipeline)...`)
  console.log(`📄 Arquivo: ${filePath}`)

  // 1. Carregar instituições já existentes (uma única query)
  const instRows = await client.execute('SELECT id, acronym FROM institutions')
  const instMap = new Map<string, string>()
  for (const row of instRows.rows) {
    instMap.set(row.acronym as string, row.id as string)
  }

  // 2. Carregar todas as questões em memória
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf-8' }),
    crlfDelay: Infinity,
  })

  const questions: RawQuestion[] = []
  let lineNum = 0
  for await (const line of rl) {
    const trimmed = line.trim()
    if (!trimmed) continue
    lineNum++
    try {
      questions.push(JSON.parse(trimmed))
    } catch {
      console.error(`  ❌ Linha ${lineNum}: JSON inválido`)
    }
  }

  console.log(`📋 ${questions.length} questões lidas. Processando em lotes de ${BATCH_SIZE}...`)

  let imported = 0
  let errors = 0

  // 3. Processar em batches
  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, i + BATCH_SIZE)
    const stmts: any[] = []

    for (const raw of batch) {
      // Garantir instituição
      if (!instMap.has(raw.instituicao)) {
        const mapped = INSTITUTION_MAP[raw.instituicao]
        const id = randomUUID()
        const now = new Date().toISOString()
        stmts.push({
          sql: `INSERT OR IGNORE INTO institutions (id, name, acronym, city, state)
                VALUES (?, ?, ?, ?, ?)`,
          args: [
            id,
            mapped?.name ?? raw.instituicao,
            raw.instituicao,
            mapped?.city ?? null,
            mapped?.state ?? null,
          ],
        })
        instMap.set(raw.instituicao, id)
      }

      const code = buildCode(raw.instituicao, raw.ano, raw.numero_questao)
      const instId = instMap.get(raw.instituicao)!
      const now = new Date().toISOString()
      const id = randomUUID()
      const stmt = `<p>${raw.enunciado_completo}</p>`
      const opts = buildOptions(raw.alternativas)

      stmts.push({
        sql: `INSERT INTO questions
                (id, code, year, statement, options, difficulty, isPublished, flagCount, institutionId, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, 'MEDIO', 0, 0, ?, ?, ?)
              ON CONFLICT(code) DO UPDATE SET
                statement = excluded.statement,
                options   = excluded.options,
                updatedAt = excluded.updatedAt`,
        args: [id, code, raw.ano, stmt, opts, instId, now, now],
      })
    }

    try {
      await client.batch(stmts, 'write')
      imported += batch.length
      console.log(`  ✅ ${imported}/${questions.length} importadas...`)
    } catch (err) {
      console.error(`  ❌ Erro no lote ${i / BATCH_SIZE + 1}:`, err)
      errors += batch.length
    }
  }

  // Contagem final
  const total = await client.execute('SELECT COUNT(*) as n FROM questions')
  const insts = await client.execute('SELECT COUNT(*) as n FROM institutions')

  console.log('\n════════════════════════════════════')
  console.log('📊 Importação concluída!')
  console.log(`   ✅ Importadas:   ${imported}`)
  console.log(`   ❌ Erros:        ${errors}`)
  console.log(`   📚 Total no BD:  ${total.rows[0].n}`)
  console.log(`   🏛️  Instituições: ${insts.rows[0].n}`)
  console.log('════════════════════════════════════')
  console.log('⚠️  Questões salvas sem gabarito (isPublished=0)')
  console.log('   → Execute fast-import-answers.ts em seguida')

  await client.close()
}

main().catch((err) => { console.error(err); process.exit(1) })
