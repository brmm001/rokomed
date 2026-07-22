/**
 * create-import2-files.ts
 * Extrai as linhas novas adicionadas via git diff para questoes_importar2.jsonl e gabarito_importar2.jsonl
 */
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

const rootDir = path.resolve(__dirname, '../../')

function extractNewLines(fileName: string): string[] {
  const filePath = path.join(rootDir, fileName)
  const diffOutput = execSync(
    `git diff -U0 -- "${filePath}"`,
    { encoding: 'utf8', maxBuffer: 100 * 1024 * 1024, cwd: rootDir }
  )
  return diffOutput
    .split('\n')
    .filter((l: string) => l.startsWith('+') && !l.startsWith('+++'))
    .map((l: string) => l.substring(1).replace(/^\uFEFF/, '').trim())
    .filter(Boolean)
}

try {
  const qLines = extractNewLines('questoes_importar.jsonl')
  const qOutPath = path.join(rootDir, 'questoes_importar2.jsonl')
  fs.writeFileSync(qOutPath, qLines.join('\n') + '\n', 'utf8')
  console.log(`✅ ${qLines.length} questões salvas em ${qOutPath}`)

  const gLines = extractNewLines('gabarito_importar.jsonl')
  const gOutPath = path.join(rootDir, 'gabarito_importar2.jsonl')
  fs.writeFileSync(gOutPath, gLines.join('\n') + '\n', 'utf8')
  console.log(`✅ ${gLines.length} gabaritos salvos em ${gOutPath}`)
} catch (err) {
  console.error('❌ Erro ao criar arquivos import2:', err)
  process.exit(1)
}
