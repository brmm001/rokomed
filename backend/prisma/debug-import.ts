/**
 * debug-import.ts
 * Lê as primeiras questões novas do git diff e exibe os args do INSERT para debug.
 */

import * as path from 'path'
import * as readline from 'readline'
import * as fs from 'fs'
import { execSync } from 'child_process'
import { randomUUID } from 'crypto'

interface RawQuestion {
  instituicao: string
  ano: any
  numero_questao: any
  enunciado_completo: string
  alternativas: Record<string, string>
}

function buildCode(inst: string, ano: any, num: any): string {
  let normalizedInst = inst.trim()
  if (normalizedInst.startsWith('UNICAMP')) normalizedInst = 'UNICAMP'
  if (normalizedInst.toLowerCase().includes('revalida')) normalizedInst = 'Revalida'
  let parsedAno = typeof ano === 'number' ? ano : parseInt(String(ano), 10)
  if (isNaN(parsedAno)) parsedAno = 0
  return `${normalizedInst}-${parsedAno}-${num}`
}

function buildOptions(alternativas: Record<string, string>): string {
  return JSON.stringify(Object.entries(alternativas).map(([letter, text]) => ({ letter, text })))
}

async function main() {
  const filePath = path.resolve(__dirname, '../../questoes_importar.jsonl')
  const diffOutput = execSync(
    `git diff -U0 -- "${filePath}"`,
    { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024, cwd: path.resolve(__dirname, '../../') }
  )
  const lines = diffOutput
    .split('\n')
    .filter((l) => l.startsWith('+') && !l.startsWith('+++'))
    .map((l) => l.substring(1).replace(/^\uFEFF/, '').trim())
    .filter(Boolean)

  console.log(`Found ${lines.length} new lines`)

  // Check the first 5
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    let raw: RawQuestion
    try {
      raw = JSON.parse(lines[i])
    } catch (e) {
      console.error(`Line ${i + 1}: JSON parse error:`, e)
      continue
    }

    const code = buildCode(raw.instituicao, raw.ano, raw.numero_questao)
    const stmt = `<p>${raw.enunciado_completo}</p>`
    const opts = buildOptions(raw.alternativas)
    const id = randomUUID()
    const now = new Date().toISOString()
    const instId = randomUUID() // simulated

    const args = [id, code, raw.ano, stmt, opts, instId, now, now]
    
    console.log(`\nLine ${i + 1}: ${raw.instituicao} ${raw.ano} Q${raw.numero_questao}`)
    for (let j = 0; j < args.length; j++) {
      const v = args[j]
      const t = typeof v
      if (t === 'undefined') {
        console.error(`  arg[${j}] = UNDEFINED ← PROBLEM!`)
      } else {
        const preview = String(v).substring(0, 60)
        console.log(`  arg[${j}]: ${t} = "${preview}"`)
      }
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) })
