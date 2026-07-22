/**
 * inspect-mismatch.ts
 * Compara enunciados/ids entre questoes_importar.jsonl e gabarito_importar.jsonl para UFSC 2017/2018/2021/2023
 */
import * as fs from 'fs'
import * as path from 'path'

const questoesPath = path.resolve(__dirname, '../../questoes_importar.jsonl')
const gabaritoPath = path.resolve(__dirname, '../../gabarito_importar.jsonl')

const qLines = fs.readFileSync(questoesPath, 'utf8').split('\n').filter(Boolean)
const gLines = fs.readFileSync(gabaritoPath, 'utf8').split('\n').filter(Boolean)

console.log(`Total questoes: ${qLines.length}`)
console.log(`Total gabaritos: ${gLines.length}`)

// Amostra de gabarito UFSC 2017
for (const line of gLines) {
  try {
    const g = JSON.parse(line)
    if (g.ano === 2017 && g.instituicao.includes('UFSC')) {
      console.log('Gabarito UFSC 2017 sample:', {
        id: g.id,
        instituicao: g.instituicao,
        ano: g.ano,
        numero_questao: g.numero_questao,
        numero_questao_original: g.numero_questao_original,
        enunciado_snippet: (g.enunciado_completo || '').slice(0, 60)
      })
      break
    }
  } catch (e) {}
}

// Amostra de questão UFSC 2017
for (const line of qLines) {
  try {
    const q = JSON.parse(line)
    if (q.ano === 2017 && q.instituicao.includes('UFSC')) {
      console.log('Questao UFSC 2017 sample:', {
        instituicao: q.instituicao,
        ano: q.ano,
        numero_questao: q.numero_questao,
        enunciado_snippet: (q.enunciado_completo || '').slice(0, 60)
      })
      break
    }
  } catch (e) {}
}
