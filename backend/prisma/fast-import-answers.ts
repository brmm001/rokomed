/**
 * fast-import-answers.ts
 * Importa gabarito usando libSQL pipeline (batch) para máxima velocidade.
 * Formato esperado do JSONL (novo):
 *   { id, numero_questao, instituicao, ano, especialidade, tema, subtema,
 *     dificuldade, gabarito, comentario_geral, alternativas: [{letra,texto,correta,comentario,...}],
 *     linha_de_raciocinio_completa, ... }
 *
 * Uso: npx ts-node --project tsconfig.scripts.json prisma/fast-import-answers.ts <arquivo.jsonl>
 */

import { createClient } from '@libsql/client'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'
import * as dotenv from 'dotenv'
import { randomUUID } from 'crypto'

dotenv.config({ path: path.resolve(__dirname, '../.env.turso') })

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    'fácil': 'FACIL', 'facil': 'FACIL', 'Fácil': 'FACIL', 'Fácil ': 'FACIL', 'easy': 'FACIL',
    'média': 'MEDIO', 'media': 'MEDIO', 'Média': 'MEDIO', 'Media': 'MEDIO', 'medium': 'MEDIO', 'moderada': 'MEDIO',
    'difícil': 'DIFICIL', 'dificil': 'DIFICIL', 'Difícil': 'DIFICIL', 'Dificil': 'DIFICIL', 'hard': 'DIFICIL',
    'decoreba': 'FACIL', 'Decoreba': 'FACIL',
  }
  return map[raw.trim()] ?? 'MEDIO'
}

function buildCode(inst: string, ano: any, num: number): string {
  let normalizedInst = inst.trim()
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
  return `${normalizedInst}-${parsedAno}-${num}`
}

// Garante que um valor seja string ou null para o libSQL (nunca undefined)
function asStr(v: unknown): string | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'boolean') return null
  if (Array.isArray(v)) return v.length > 0 ? JSON.stringify(v) : null
  return String(v)
}

function buildExplanation(raw: GabaritoItem): string {
  // Alternativas: prefere alternativas_com_justificativas (novo formato), depois alternativas
  const altsSource = raw.alternativas_com_justificativas ?? raw.alternativas ?? []
  const racioMap: Record<string, string> = raw.raciocinio_por_alternativa ?? {}

  const alts = altsSource
    .map(alt => {
      const comentario = alt.comentario || alt.justificativa || racioMap[alt.letra] || ''
      return `
      <div class="alt-item">
        <span class="alt-letra ${alt.correta ? 'correta' : 'incorreta'}">${alt.letra}</span>
        <span class="alt-texto">${alt.texto ?? ''}</span>
        ${comentario ? `<p class="alt-comentario">${comentario}</p>` : ''}
      </div>`
    }).join('')

  const gatilhos = (raw.gatilhos_clinicos ?? raw.gatilhos ?? raw.palavras_chave ?? [])
    .slice(0, 5)
    .map((g: string) => `<span class="gatilho">${g}</span>`).join(' ')

  // Linha de raciocínio: string ou array
  const linhaRaciocinio = raw.linha_de_raciocinio_completa
    ?? (Array.isArray(raw.linha_de_raciocinio) ? raw.linha_de_raciocinio.join(' ') : undefined)

  const pegadinha = raw.pegadinha_principal ?? raw.pegadinha

  return `
<section class="explicacao">
  ${gatilhos ? `<div class="gatilhos"><strong>🎯 Gatilhos:</strong> ${gatilhos}</div>` : ''}
  <div class="comentario-geral">
    <h4>📋 Comentário Geral</h4>
    <p>${raw.comentario_geral ?? ''}</p>
  </div>
  <div class="raciocinio-alternativas">
    <h4>🔍 Análise das Alternativas</h4>
    ${alts}
  </div>
  ${linhaRaciocinio ? `
  <div class="linha-raciocinio">
    <h4>💡 Linha de Raciocínio</h4>
    <p>${linhaRaciocinio}</p>
  </div>` : ''}
  ${raw.como_matar_a_questao_rapido ? `
  <div class="dica-rapida">
    <h4>⚡ Como matar rápido</h4>
    <p>${raw.como_matar_a_questao_rapido}</p>
  </div>` : ''}
  ${pegadinha ? `<div class="pegadinha"><h4>⚠️ Pegadinha</h4><p>${pegadinha}</p></div>` : ''}
</section>`.trim()
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Alternativa {
  letra: string
  texto?: string
  correta?: boolean
  comentario?: string
  justificativa?: string
  linha_raciocinio?: string
  por_que_esta_certa?: string | null
  por_que_esta_errada?: string | null
  pegadinha?: string | null
}

interface GabaritoItem {
  id?:                        string
  numero_questao?:            number
  numero_questao_original?:   number
  instituicao:                string
  ano:                        number
  especialidade?:             string
  area?:                      string
  grande_tema?:               string
  tema?:                      string
  subtema?:                   string
  subtema_2?:                 string
  micro_subtema?:             string
  dificuldade?:               string
  gabarito?:                  string      // campo novo: letra da resposta certa
  resposta_correta?:          string      // campo legado
  alternativas?:              Alternativa[]
  alternativas_com_justificativas?: Alternativa[]  // formato enriquecido
  raciocinio_por_alternativa?: Record<string, string>  // mapa letra -> texto
  comentario_geral?:          string
  linha_de_raciocinio?:       string[]    // array formato novo
  linha_de_raciocinio_completa?: string
  como_matar_a_questao_rapido?: string
  gatilhos_clinicos?:         string[]
  gatilhos?:                  string[]    // alias formato novo
  palavras_chave?:            string[]
  pegadinha_principal?:       string
  pegadinha?:                 string      // alias formato novo
  tags?:                      string[]
}

// ─── Cache de especialidades ──────────────────────────────────────────────────

const specialtyCache = new Map<string, string>()

async function loadSpecialtyCache() {
  const rows = await client.execute('SELECT id, slug FROM specialties')
  for (const row of rows.rows) {
    specialtyCache.set(row.slug as string, row.id as string)
  }
  console.log(`  🏷️  ${specialtyCache.size} especialidades carregadas do BD`)
}

const specialtyBuffer: Array<{ id: string; name: string; slug: string; parentId: string | null; isGrandeArea: number }> = []

function getOrBuffer(name: string, parentId: string | null, isGrandeArea = false): string {
  // slug inclui sufixo do pai para evitar colisões entre temas iguais em áreas diferentes
  const suffix = parentId ? `-${parentId.slice(-8)}` : ''
  const slug = toSlug(name) + suffix

  const cached = specialtyCache.get(slug)
  if (cached) return cached

  const id = randomUUID()
  specialtyBuffer.push({ id, name, slug, parentId, isGrandeArea: isGrandeArea ? 1 : 0 })
  specialtyCache.set(slug, id)
  return id
}

function resolveSpecialtyId(raw: GabaritoItem): string {
  const area       = raw.especialidade || raw.area || 'Outros'
  const grandeTema = raw.grande_tema || ''
  const tema       = raw.tema || ''
  const subtema    = raw.subtema || raw.micro_subtema || ''

  const l1 = getOrBuffer(area, null, true)
  const l2 = grandeTema ? getOrBuffer(grandeTema, l1) : l1
  const l3 = tema       ? getOrBuffer(tema, l2)       : l2
  const l4 = subtema    ? getOrBuffer(subtema, l3)    : l3
  return l4
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const BATCH_SIZE = 30

async function main() {
  const args = process.argv.slice(2).filter(a => !a.startsWith('--'))
  const filePath = args[0]
    ? path.resolve(args[0])
    : path.resolve(__dirname, '../../gabarito_importar.jsonl')

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo não encontrado: ${filePath}`)
    process.exit(1)
  }

  console.log(`📥 Importando gabarito (batch/pipeline)...`)
  console.log(`📄 Arquivo: ${filePath}`)

  await loadSpecialtyCache()

  // Carregar todos os codes existentes no BD
  const qRows = await client.execute('SELECT code FROM questions')
  const existingCodes = new Set(qRows.rows.map(r => (r.code as string).replace(/^REVALIDA-/i, 'Revalida-')))
  console.log(`  📋 ${existingCodes.size} questões no BD`)

  // Ler gabarito (filtrando apenas novas se --only-new estiver presente)
  const onlyNew = process.argv.includes('--only-new')
  let lines: string[] = []

  if (onlyNew) {
    console.log(`🔍 Buscando apenas as respostas novas adicionadas via git diff...`)
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
      console.log(`  💡 Encontradas ${lines.length} novas respostas no git diff.`)
    } catch (err) {
      console.error(`  ❌ Erro ao ler git diff:`, err)
      process.exit(1)
    }
  } else {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    lines = fileContent.split('\n').map(l => l.replace(/^\uFEFF/, '').trim()).filter(Boolean)
  }

  const items: GabaritoItem[] = []
  let lineNum = 0
  for (const line of lines) {
    lineNum++
    try {
      items.push(JSON.parse(line))
    } catch {
      console.error(`  ❌ Linha ${lineNum}: JSON inválido`)
    }
  }
  console.log(`📋 ${items.length} registros de gabarito lidos.`)

  let updated  = 0
  let notFound = 0
  let errors   = 0

  // Resolver especialidades e montar mapa code → dados a atualizar
  const resolvedMap = new Map<string, {
    specialtyId: string
    difficulty:  string
    correct:     string
    explanation: string
    reasoning:   string
  }>()

  const notFoundList: string[] = []

  for (const raw of items) {
    let num: number = raw.numero_questao_original ?? raw.numero_questao ?? 0

    // Normaliza o id: substitui underscores por hífens e ajusta prefixo Revalida
    const rawId = raw.id
      ? raw.id.replace(/_/g, '-').replace(/^REVALIDA-/i, 'Revalida-')
      : null

    // Se num for 0/falsy, tenta extrair do final do rawId (ex: UFSC_2017_RESIDENCIA_MEDICA_001 → 1)
    if (!num && rawId) {
      const lastPart = rawId.split('-').pop() ?? ''
      const parsed = parseInt(lastPart, 10)
      if (!isNaN(parsed) && parsed > 0) num = parsed
    }

    let code = rawId ?? buildCode(raw.instituicao, raw.ano, num)
    if (!existingCodes.has(code)) {
      code = buildCode(raw.instituicao, raw.ano, num)
    }

    // Fallback extra: tenta com a sigla extraída da instituição
    // Ex: 'UFSC / COREME' → 'UFSC' ou 'Universidade Federal de Santa Catarina (UFSC)' → 'UFSC'
    if (!existingCodes.has(code)) {
      const matchParen = raw.instituicao.match(/\(([^)]+)\)/)
      const extractedAcronym = matchParen ? matchParen[1].trim() : null
      const instPrefix = extractedAcronym ?? raw.instituicao.split(/[\s\/]/)[0].trim()

      if (instPrefix) {
        const fallbackCode = buildCode(instPrefix, raw.ano, num)
        if (existingCodes.has(fallbackCode)) {
          code = fallbackCode
        }
      }

      if (!existingCodes.has(code) && raw.instituicao.includes('UFSC')) {
        const fallbackCode = buildCode('UFSC', raw.ano, num)
        if (existingCodes.has(fallbackCode)) {
          code = fallbackCode
        }
      }
    }

    if (!existingCodes.has(code)) {
      notFound++
      notFoundList.push(rawId ?? buildCode(raw.instituicao, raw.ano, num))
      continue
    }

    // Tenta campo direto; se vazio, deriva do array alternativas (correta: true)
    const altsSource = raw.alternativas_com_justificativas ?? raw.alternativas ?? []
    const correct = raw.gabarito || raw.resposta_correta
      || altsSource.find(a => a.correta === true)?.letra
      || ''
    if (!correct) {
      console.warn(`  ⚠️  Sem gabarito: ${code}`)
      continue
    }

    const specialtyId = resolveSpecialtyId(raw)

    // Linha de raciocínio: string ou array
    const linhaStr = raw.linha_de_raciocinio_completa
      ?? (Array.isArray(raw.linha_de_raciocinio) ? raw.linha_de_raciocinio.join(' ') : undefined)
    const reasoning = JSON.stringify(linhaStr ? [linhaStr] : [])

    resolvedMap.set(code, {
      specialtyId,
      difficulty:  mapDifficulty(raw.dificuldade),
      correct,
      explanation: buildExplanation(raw),
      reasoning,
    })
  }

  // Flush especialidades novas em um único batch
  if (specialtyBuffer.length > 0) {
    console.log(`  🏷️  Criando ${specialtyBuffer.length} novas especialidades...`)
    for (let i = 0; i < specialtyBuffer.length; i += 100) {
      const chunk = specialtyBuffer.slice(i, i + 100)
      await client.batch(
        chunk.map(s => ({
          sql:  `INSERT OR IGNORE INTO specialties (id, name, slug, parentId, isGrandeArea) VALUES (?, ?, ?, ?, ?)`,
          args: [s.id, s.name, s.slug, s.parentId, s.isGrandeArea],
        })),
        'write'
      )
    }
    console.log(`  ✅ Especialidades criadas`)
  }

  // Atualizar questões em batches
  const codes = Array.from(resolvedMap.keys())
  const now   = new Date().toISOString()

  for (let i = 0; i < codes.length; i += BATCH_SIZE) {
    const chunk = codes.slice(i, i + BATCH_SIZE)
    try {
      await client.batch(
        chunk.map(code => {
          const d = resolvedMap.get(code)!
          return {
            sql: `UPDATE questions SET
                    correctOption = ?,
                    explanation   = ?,
                    reasoningLine = ?,
                    difficulty    = ?,
                    specialtyId   = ?,
                    isPublished   = 1,
                    updatedAt     = ?
                  WHERE code = ?`,
            // Todos os args são string ou number — nunca undefined/boolean
            args: [
              d.correct,
              d.explanation,
              d.reasoning,
              d.difficulty,
              d.specialtyId,
              now,
              code,
            ],
          }
        }),
        'write'
      )
      updated += chunk.length
      console.log(`  ✅ ${updated}/${codes.length} atualizadas...`)
    } catch (err) {
      console.error(`  ❌ Erro no lote ${Math.floor(i / BATCH_SIZE) + 1}:`, (err as Error).message)
      errors += chunk.length
    }
  }

  // Relatório final
  const specialties = await client.execute('SELECT COUNT(*) as n FROM specialties')
  const published   = await client.execute('SELECT COUNT(*) as n FROM questions WHERE isPublished = 1')
  const unpublished = await client.execute('SELECT COUNT(*) as n FROM questions WHERE isPublished = 0')

  console.log('\n════════════════════════════════════════')
  console.log('📊 Importação de gabarito concluída!')
  console.log(`   ✅ Atualizadas:           ${updated}`)
  console.log(`   ⚠️  Não encontradas no BD: ${notFound}`)
  console.log(`   ❌ Erros:                 ${errors}`)
  console.log(`   🏷️  Total especialidades:  ${specialties.rows[0].n}`)
  console.log(`   📚 Questões publicadas:   ${published.rows[0].n}`)
  console.log(`   ⏳ Sem gabarito ainda:    ${unpublished.rows[0].n}`)
  console.log('════════════════════════════════════════')

  if (notFoundList.length > 0) {
    console.log(`\n⚠️  Codes não encontrados (primeiros 20):`)
    notFoundList.slice(0, 20).forEach(c => console.log(`   • ${c}`))
    if (notFoundList.length > 20) console.log(`   ... e mais ${notFoundList.length - 20}`)
  }

  await client.close()
}

main().catch((err) => { console.error(err); process.exit(1) })
