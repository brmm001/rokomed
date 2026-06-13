/**
 * import-answers.ts
 * Importa gabarito, comentários, linha de raciocínio e especialidades
 * do arquivo gabarito_importar.jsonl para o banco de dados.
 *
 * Suporta tanto o formato antigo quanto o novo do JSONL.
 *
 * Uso: npm run import:answers
 */

import { prisma } from '../src/lib/prisma'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

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

function mapDifficulty(raw: string | null | undefined): string {
  if (!raw) return 'MEDIO'
  const map: Record<string, string> = {
    'Fácil':     'FACIL',
    'facil':     'FACIL',
    'Fácil ':    'FACIL',
    'easy':      'FACIL',
    'Média':     'MEDIO',
    'Media':     'MEDIO',
    'média':     'MEDIO',
    'media':     'MEDIO',
    'medium':    'MEDIO',
    'moderada':  'MEDIO',
    'Difícil':   'DIFICIL',
    'Dificil':   'DIFICIL',
    'difícil':   'DIFICIL',
    'dificil':   'DIFICIL',
    'hard':      'DIFICIL',
    'Decoreba':  'FACIL',
    'decoreba':  'FACIL',
  }
  return map[raw.trim()] ?? 'MEDIO'
}

function buildCode(instituicao: string, ano: number, numero: number): string {
  return `${instituicao}-${ano}-${numero}`
}

/** Monta HTML rico para o campo `explanation` */
function buildExplanation(raw: GabaritoItem): string {
  let alts = ''
  const correctOption = raw.gabarito || raw.resposta_correta || raw.alternativas?.find(a => a.correta === true)?.letra || ''

  if (raw.alternativas && Array.isArray(raw.alternativas)) {
    alts = raw.alternativas
      .map(alt => `
        <div class="alt-item">
          <span class="alt-letra ${alt.correta ? 'correta' : 'incorreta'}">${alt.letra}</span>
          <span class="alt-texto">${alt.texto ?? ''}</span>
          ${alt.comentario ? `<p class="alt-comentario">${alt.comentario}</p>` : ''}
        </div>`)
      .join('')
  } else if (raw.raciocinio_por_alternativa) {
    alts = Object.entries(raw.raciocinio_por_alternativa)
      .map(([letra, texto]) => `
        <div class="alt-item">
          <span class="alt-letra ${letra === correctOption ? 'correta' : 'incorreta'}">${letra}</span>
          <span class="alt-texto">${texto}</span>
        </div>`)
      .join('')
  }

  const gatilhosList = raw.gatilhos_clinicos || raw.palavras_chave || raw.gatilhos || []
  const gatilhos = gatilhosList
    .map(g => `<span class="gatilho">${g}</span>`)
    .join(' ')

  return `
<section class="explicacao">
  ${gatilhos ? `<div class="gatilhos"><strong>🎯 Gatilhos:</strong> ${gatilhos}</div>` : ''}

  <div class="comentario-geral">
    <h4>📋 Comentário Geral</h4>
    <p>${raw.comentario_geral ?? ''}</p>
  </div>

  ${alts ? `
  <div class="raciocinio-alternativas">
    <h4>🔍 Análise das Alternativas</h4>
    ${alts}
  </div>` : ''}

  ${raw.conteudo_completo ? `
  <div class="conteudo-completo">
    <h4>📚 Conteúdo Completo</h4>
    <p>${raw.conteudo_completo}</p>
  </div>` : ''}

  ${raw.linha_de_raciocinio_completa ? `
  <div class="linha-raciocinio">
    <h4>💡 Linha de Raciocínio</h4>
    <p>${raw.linha_de_raciocinio_completa}</p>
  </div>` : ''}

  ${raw.como_matar_a_questao_rapido ? `
  <div class="dica-rapida">
    <h4>⚡ Como matar rápido</h4>
    <p>${raw.como_matar_a_questao_rapido}</p>
  </div>` : ''}

  ${(raw.pegadinha || raw.pegadinha_principal) ? `
  <div class="pegadinha">
    <h4>⚠️ Pegadinha</h4>
    <p>${raw.pegadinha || raw.pegadinha_principal}</p>
  </div>` : ''}

  ${raw.subtema_2 ? `
  <div class="contexto-especifico">
    <h4>🔬 Contexto Específico</h4>
    <p>${raw.subtema_2}</p>
  </div>` : ''}
</section>`.trim()
}

/** reasoningLine salvo como JSON para o frontend renderizar como lista */
function buildReasoningLine(raw: GabaritoItem): string {
  const items = raw.linha_de_raciocinio || 
                (raw.linha_de_raciocinio_completa ? [raw.linha_de_raciocinio_completa] : [])
  return JSON.stringify(items)
}

// ─── Tipos ─────────────────────────────────────────────────────────────────

interface Alternativa {
  letra: string
  texto?: string
  correta?: boolean
  comentario?: string
  linha_raciocinio?: string
  por_que_esta_certa?: string | null
  por_que_esta_errada?: string | null
  pegadinha?: string | null
}

interface GabaritoItem {
  id:                         string
  instituicao:                string
  ano:                        number
  numero_questao:             number
  numero_questao_original?:   number
  especialidade?:             string
  area?:                      string
  grande_tema?:               string
  tema?:                      string
  subtema?:                   string
  subtema_2?:                 string
  micro_subtema?:             string
  dificuldade?:               string
  gabarito?:                  string
  resposta_correta?:          string
  alternativas?:              Alternativa[]
  comentario_geral?:          string
  raciocinio_por_alternativa?: Record<string, string>
  linha_de_raciocinio_completa?: string
  linha_de_raciocinio?:       string[]
  como_matar_a_questao_rapido?: string
  gatilhos?:                  string[]
  gatilhos_clinicos?:         string[]
  palavras_chave?:            string[]
  pegadinha?:                 string
  pegadinha_principal?:       string
  conteudo_completo?:         string
}

// ─── Cache de especialidades ────────────────────────────────────────────────

const specialtyCache = new Map<string, string>() // slug → id

async function getOrCreateSpecialty(
  name: string,
  parentId?: string,
  isGrandeArea: boolean = false
): Promise<string> {
  const slug = toSlug(name) + (parentId ? `-${parentId.slice(-6)}` : '')
  const cached = specialtyCache.get(slug)
  if (cached) return cached

  const specialty = await prisma.specialty.upsert({
    where:  { slug },
    create: { name, slug, parentId: parentId ?? null, isGrandeArea },
    update: { isGrandeArea },
  })

  specialtyCache.set(slug, specialty.id)
  return specialty.id
}

/** Cria hierarquia de níveis: área → grande_tema → tema → subtema */
async function resolveSpecialtyId(raw: GabaritoItem): Promise<string> {
  const area       = raw.especialidade || raw.area || 'Outros'
  const grandeTema = raw.grande_tema || ''
  const tema       = raw.tema || ''
  const subtema    = raw.subtema || raw.micro_subtema || ''

  // Level 1: Grande Área (ex: Clínica Médica)
  const level1Id = await getOrCreateSpecialty(area, undefined, true)
  // Level 2: Grande Tema (ex: Pneumologia)
  const level2Id = grandeTema ? await getOrCreateSpecialty(grandeTema, level1Id) : level1Id
  // Level 3: Tema (ex: Tuberculose pulmonar)
  const level3Id = tema ? await getOrCreateSpecialty(tema, level2Id) : level2Id
  // Level 4: Subtema (ex: Investigação de tosse crônica)
  const level4Id = subtema ? await getOrCreateSpecialty(subtema, level3Id) : level3Id

  return level4Id
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const filePath = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, '../../gabarito_importar.jsonl')

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

    let mappedInstitution = raw.instituicao
    if (mappedInstitution.includes('UNICAMP')) {
      mappedInstitution = 'UNICAMP'
    }
    const num = raw.numero_questao_original !== undefined ? raw.numero_questao_original : raw.numero_questao
    const code = buildCode(mappedInstitution, raw.ano, num)

    try {
      // Verifica se a questão existe
      const existing = await prisma.question.findUnique({ where: { code } })
      if (!existing) {
        console.warn(`  ⚠️  Questão não encontrada no BD: ${code}`)
        notFound++
        continue
      }

      const correct = raw.gabarito || raw.resposta_correta || raw.alternativas?.find(a => a.correta === true)?.letra

      if (!correct) {
        console.warn(`  ⚠️  Questão sem gabarito definido: ${code}`)
        errors++
        continue
      }

      // Resolve hierarquia de especialidades
      const specialtyId = await resolveSpecialtyId(raw)

      // Atualiza a questão com gabarito completo
      await prisma.question.update({
        where: { code },
        data:  {
          correctOption: correct,
          explanation:   buildExplanation(raw),
          reasoningLine: buildReasoningLine(raw),
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
