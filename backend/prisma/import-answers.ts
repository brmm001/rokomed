/**
 * import-answers.ts
 * Importa gabarito, comentários, linha de raciocínio e especialidades
 * do arquivo gabarito_importar.jsonl para o banco de dados.
 *
 * Uso: npm run import:answers
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

const prisma = new PrismaClient()

// ─── Helpers ───────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120)
}

function mapDifficulty(raw: string): string {
  const map: Record<string, string> = {
    'Fácil':     'FACIL',
    'facil':     'FACIL',
    'Média':     'MEDIO',
    'Media':     'MEDIO',
    'Difícil':   'DIFICIL',
    'Dificil':   'DIFICIL',
    'Decoreba':  'FACIL',
    'decoreba':  'FACIL',
  }
  return map[raw] ?? 'MEDIO'
}

function buildCode(instituicao: string, ano: number, numero: number): string {
  return `${instituicao}-${ano}-${numero}`
}

/** Monta HTML rico para o campo `explanation` */
function buildExplanation(raw: GabaritoItem): string {
  const alternativas = Object.entries(raw.raciocinio_por_alternativa ?? {})
    .map(([letra, texto]) => `
      <div class="alt-item">
        <span class="alt-letra ${letra === raw.resposta_correta ? 'correta' : 'incorreta'}">${letra}</span>
        <span class="alt-texto">${texto}</span>
      </div>`)
    .join('')

  const gatilhos = (raw.gatilhos ?? [])
    .map(g => `<span class="gatilho">${g}</span>`)
    .join(' ')

  return `
<section class="explicacao">
  ${gatilhos ? `<div class="gatilhos"><strong>🎯 Gatilhos:</strong> ${gatilhos}</div>` : ''}

  <div class="comentario-geral">
    <h4>📋 Comentário Geral</h4>
    <p>${raw.comentario_geral ?? ''}</p>
  </div>

  <div class="raciocinio-alternativas">
    <h4>🔍 Análise das Alternativas</h4>
    ${alternativas}
  </div>

  <div class="conteudo-completo">
    <h4>📚 Conteúdo Completo</h4>
    <p>${raw.conteudo_completo ?? ''}</p>
  </div>

  ${raw.pegadinha ? `
  <div class="pegadinha">
    <h4>⚠️ Pegadinha</h4>
    <p>${raw.pegadinha}</p>
  </div>` : ''}

  ${raw.subtema_2 ? `
  <div class="contexto-especifico">
    <h4>🔬 Contexto Específico</h4>
    <p>${raw.subtema_2}</p>
  </div>` : ''}
</section>`.trim()
}

/** reasoningLine salvo como JSON para o frontend renderizar como lista */
function buildReasoningLine(items: string[]): string {
  return JSON.stringify(items ?? [])
}

// ─── Tipos ─────────────────────────────────────────────────────────────────

interface GabaritoItem {
  id:                       string
  instituicao:              string
  ano:                      number
  area:                     string
  numero_questao_original:  number
  grande_tema:              string
  tema:                     string
  subtema:                  string
  subtema_2?:               string
  dificuldade:              string
  resposta_correta:         string
  gatilhos?:                string[]
  comentario_geral?:        string
  raciocinio_por_alternativa?: Record<string, string>
  linha_de_raciocinio?:     string[]
  conteudo_completo?:       string
  pegadinha?:               string
  tags?:                    string[]
}

// ─── Cache de especialidades ────────────────────────────────────────────────

const specialtyCache = new Map<string, string>() // slug → id

async function getOrCreateSpecialty(
  name: string,
  parentId?: string
): Promise<string> {
  const slug = toSlug(name) + (parentId ? `-${parentId.slice(-6)}` : '')
  const cached = specialtyCache.get(slug)
  if (cached) return cached

  const specialty = await prisma.specialty.upsert({
    where:  { slug },
    create: { name, slug, parentId: parentId ?? null },
    update: {},
  })

  specialtyCache.set(slug, specialty.id)
  return specialty.id
}

/** Cria hierarquia de 3 níveis: grande_tema → tema → subtema */
async function resolveSpecialtyId(raw: GabaritoItem): Promise<string> {
  const level1Id = await getOrCreateSpecialty(raw.grande_tema)
  const level2Id = await getOrCreateSpecialty(raw.tema,     level1Id)
  const level3Id = await getOrCreateSpecialty(raw.subtema,  level2Id)
  return level3Id
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const filePath = path.resolve(__dirname, '../../gabarito_importar.jsonl')

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo não encontrado: ${filePath}`)
    process.exit(1)
  }

  console.log('📥 Iniciando importação de gabarito...')
  console.log(`📄 Arquivo: ${filePath}`)

  const rl = readline.createInterface({
    input:     fs.createReadStream(filePath, { encoding: 'utf-8' }),
    crlfDelay: Infinity,
  })

  let total    = 0
  let updated  = 0
  let notFound = 0
  let errors   = 0

  for await (const line of rl) {
    const trimmed = line.trim()
    if (!trimmed) continue

    total++

    let raw: GabaritoItem
    try {
      raw = JSON.parse(trimmed)
    } catch {
      console.error(`  ❌ Linha ${total}: JSON inválido`)
      errors++
      continue
    }

    const code = buildCode(raw.instituicao, raw.ano, raw.numero_questao_original)

    try {
      // Verifica se a questão existe
      const existing = await prisma.question.findUnique({ where: { code } })
      if (!existing) {
        console.warn(`  ⚠️  Questão não encontrada: ${code}`)
        notFound++
        continue
      }

      // Resolve hierarquia de especialidades (3 níveis)
      const specialtyId = await resolveSpecialtyId(raw)

      // Atualiza a questão com gabarito completo
      await prisma.question.update({
        where: { code },
        data:  {
          correctOption: raw.resposta_correta,
          explanation:   buildExplanation(raw),
          reasoningLine: buildReasoningLine(raw.linha_de_raciocinio ?? []),
          difficulty:    mapDifficulty(raw.dificuldade),
          specialtyId,
          isPublished:   true,
        },
      })

      updated++

      if (updated % 100 === 0) {
        console.log(`  ✅ ${updated} questões atualizadas...`)
      }

    } catch (err) {
      console.error(`  ❌ Erro na questão ${code}:`, err)
      errors++
    }
  }

  // Resumo final
  const specialties = await prisma.specialty.count()
  const published   = await prisma.question.count({ where: { isPublished: true } })

  console.log('\n════════════════════════════════════════')
  console.log('📊 Importação de gabarito concluída!')
  console.log(`   📝 Total de linhas:      ${total}`)
  console.log(`   ✅ Atualizadas:          ${updated}`)
  console.log(`   ⚠️  Não encontradas:      ${notFound}`)
  console.log(`   ❌ Erros:               ${errors}`)
  console.log(`   🏷️  Especialidades criadas: ${specialties}`)
  console.log(`   📚 Questões publicadas:  ${published}`)
  console.log('════════════════════════════════════════')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
