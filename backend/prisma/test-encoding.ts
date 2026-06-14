import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

async function main() {
  const rlGab = readline.createInterface({
    input: fs.createReadStream(path.resolve(__dirname, '../../gabarito_importar.jsonl')),
    crlfDelay: Infinity
  })
  for await (const line of rlGab) {
    const cleaned = line.replace(/^\uFEFF/, '').trim()
    if (!cleaned) continue
    const parsed = JSON.parse(cleaned)
    if (parsed.instituicao.includes('Recife') || parsed.instituicao.includes('CEDER')) {
      console.log('Template raw preview:')
      console.log(JSON.stringify(parsed, null, 2).slice(0, 1000))
      break
    }
  }

  const rlQuest = readline.createInterface({
    input: fs.createReadStream(path.resolve(__dirname, '../../questoes_importar.jsonl')),
    crlfDelay: Infinity
  })
  for await (const line of rlQuest) {
    const cleaned = line.replace(/^\uFEFF/, '').trim()
    if (!cleaned) continue
    const parsed = JSON.parse(cleaned)
    if (parsed.instituicao.includes('Recife') || parsed.instituicao.includes('CEDER')) {
      console.log('Question raw preview:')
      console.log(JSON.stringify(parsed, null, 2).slice(0, 1000))
      break
    }
  }
}

main()
