/**
 * import-questions.ts
 * Importa questões do arquivo questoes_importar.jsonl para o banco de dados.
 * Uso: npx ts-node prisma/import-questions.ts
 */

import { prisma } from '../src/lib/prisma'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

// Mapeamento de siglas conhecidas → dados completos da instituição
const INSTITUTION_MAP: Record<string, { name: string; city?: string; state?: string }> = {
  UNICAMP:  { name: 'Universidade Estadual de Campinas',          city: 'Campinas',       state: 'SP' },
  USP:      { name: 'Universidade de São Paulo',                  city: 'São Paulo',       state: 'SP' },
  UNIFESP:  { name: 'Universidade Federal de São Paulo',          city: 'São Paulo',       state: 'SP' },
  AMRIGS:   { name: 'Associação Médica do Rio Grande do Sul',     city: 'Porto Alegre',    state: 'RS' },
  ENARE:    { name: 'Exame Nacional de Residência',               state: 'BR' },
  UERJ:     { name: 'Universidade Estadual do Rio de Janeiro',    city: 'Rio de Janeiro',  state: 'RJ' },
  UFRJ:     { name: 'Universidade Federal do Rio de Janeiro',     city: 'Rio de Janeiro',  state: 'RJ' },
  UFMG:     { name: 'Universidade Federal de Minas Gerais',       city: 'Belo Horizonte',  state: 'MG' },
  FMUSP:    { name: 'Faculdade de Medicina da USP',               city: 'São Paulo',       state: 'SP' },
  HCFMUSP:  { name: 'Hospital das Clínicas FMUSP',               city: 'São Paulo',       state: 'SP' },
  'SUS-SP': { name: 'SUS-SP',                                     city: 'São Paulo',       state: 'SP' },
  SANTA_CASA: { name: 'Santa Casa de São Paulo',                  city: 'São Paulo',       state: 'SP' },
  UFPR:     { name: 'Universidade Federal do Paraná',             city: 'Curitiba',        state: 'PR' },
  UNESP:    { name: 'Universidade Estadual Paulista',             city: 'São Paulo',       state: 'SP' },
  FAMERP:   { name: 'Faculdade de Medicina de São José do Rio Preto', city: 'São José do Rio Preto', state: 'SP' },
  PUCRS:    { name: 'Pontifícia Universidade Católica do Rio Grande do Sul', city: 'Porto Alegre', state: 'RS' },
  UFSC:     { name: 'Universidade Federal de Santa Catarina',     city: 'Florianópolis',   state: 'SC' },
  UFRGS:    { name: 'Universidade Federal do Rio Grande do Sul',  city: 'Porto Alegre',    state: 'RS' },
}

interface RawQuestion {
  instituicao: string
  ano: number
  numero_questao: number
  enunciado_completo: string
  alternativas: Record<string, string>
}

// Cache para evitar consultas repetidas ao banco
const institutionCache = new Map<string, string>()

async function getOrCreateInstitution(acronym: string): Promise<string> {
  const cached = institutionCache.get(acronym)
  if (cached) return cached

  const mapped = INSTITUTION_MAP[acronym]
  const data = mapped
    ? { name: mapped.name, acronym, city: mapped.city, state: mapped.state }
    : { name: acronym, acronym }  // fallback: usa a própria sigla como nome

  const inst = await prisma.institution.upsert({
    where:  { acronym },
    create: data,
    update: {},
  })

  institutionCache.set(acronym, inst.id)
  return inst.id
}

function buildOptions(alternativas: Record<string, string>) {
  return JSON.stringify(
    Object.entries(alternativas).map(([letter, text]) => ({ letter, text }))
  )
}

function buildCode(instituicao: string, ano: any, numero: number): string {
  let normalizedInst = instituicao.trim()
  if (normalizedInst.startsWith('UNICAMP')) {
    normalizedInst = 'UNICAMP'
  }
  if (normalizedInst.toLowerCase().includes('revalida')) {
    normalizedInst = 'Revalida'
  }
  let parsedAno = typeof ano === 'number' ? ano : parseInt(String(ano), 10)
  if (isNaN(parsedAno)) {
    parsedAno = 0
  }
  return `${normalizedInst}-${parsedAno}-${numero}`
}

async function main() {
  const args = process.argv.slice(2).filter(a => !a.startsWith('--'))
  const filePath = args[0] ? path.resolve(args[0]) : path.resolve(__dirname, '../../questoes_importar.jsonl')

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo não encontrado: ${filePath}`)
    process.exit(1)
  }

  console.log('📥 Iniciando importação de questões...')
  console.log(`📄 Arquivo: ${filePath}`)

  const onlyNew = process.argv.includes('--only-new')
  let lines: string[] = []

  if (onlyNew) {
    console.log(`🔍 Buscando apenas as questões novas adicionadas via git diff...`)
    try {
      const diffOutput = require('child_process').execSync(
        `git diff -U0 -- "${filePath}"`,
        { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
      )
      lines = diffOutput
        .split('\n')
        .filter((l: string) => l.startsWith('+') && !l.startsWith('+++'))
        .map((l: string) => l.substring(1).replace(/^\uFEFF/, '').trim())
        .filter(Boolean)
      console.log(`  💡 Encontradas ${lines.length} novas questões no git diff.`)
    } catch (err) {
      console.error(`  ❌ Erro ao ler git diff:`, err)
      process.exit(1)
    }
  } else {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    lines = fileContent.split('\n').map(l => l.replace(/^\uFEFF/, '').trim()).filter(Boolean)
  }

  let total    = 0
  let imported = 0
  let skipped  = 0
  let errors   = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    total++

    let raw: RawQuestion
    try {
      raw = JSON.parse(trimmed)
    } catch {
      console.error(`  ❌ Linha ${total}: JSON inválido`)
      errors++
      continue
    }

    const code = buildCode(raw.instituicao, raw.ano, raw.numero_questao)

    try {
      const institutionId = await getOrCreateInstitution(raw.instituicao)

      await prisma.question.upsert({
        where: { code },
        create: {
          code,
          year:          raw.ano,
          statement:     `<p>${raw.enunciado_completo}</p>`,
          options:       buildOptions(raw.alternativas),
          institutionId,
          isPublished:   false,  // será publicado após importar o gabarito
        },
        update: {
          // Se a questão já existe, atualiza apenas enunciado e alternativas
          statement: `<p>${raw.enunciado_completo}</p>`,
          options:   buildOptions(raw.alternativas),
        },
      })

      imported++

      if (imported % 100 === 0) {
        console.log(`  ✅ ${imported} questões importadas...`)
      }
    } catch (err) {
      console.error(`  ❌ Erro na questão ${code}:`, err)
      errors++
    }
  }

  // Resumo
  const institutions = await prisma.institution.count()
  console.log('\n════════════════════════════════════')
  console.log('📊 Importação concluída!')
  console.log(`   📝 Total de linhas: ${total}`)
  console.log(`   ✅ Importadas:      ${imported}`)
  console.log(`   ⏭️  Ignoradas:       ${skipped}`)
  console.log(`   ❌ Erros:           ${errors}`)
  console.log(`   🏛️  Instituições:    ${institutions}`)
  console.log('════════════════════════════════════')
  console.log('⚠️  Questões salvas sem gabarito (isPublished=false)')
  console.log('   → Execute import-answers.ts após receber o 2º arquivo')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
