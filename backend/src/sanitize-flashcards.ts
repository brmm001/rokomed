import dotenv from 'dotenv'
import { prisma } from './lib/prisma'

dotenv.config()

async function main() {
  console.log('Higienizando flashcards existentes...')
  try {
    const flashcards = await prisma.flashcard.findMany({
      include: {
        question: true
      }
    })

    console.log(`Encontrados ${flashcards.length} flashcards para analisar.`)

    let updatedCount = 0
    for (const card of flashcards) {
      const q = card.question
      if (!q) continue

      let correctText = ''
      try {
        const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        if (Array.isArray(opts)) {
          const found = opts.find((o: any) => o.letter.toUpperCase() === q.correctOption?.toUpperCase())
          if (found) {
            correctText = found.text
          }
        }
      } catch (e) {
        console.error(`Erro ao analisar opções do card ${card.id}:`, e)
      }

      const backContent = correctText 
        ? `<strong>Alternativa ${q.correctOption}:</strong> ${correctText}`
        : `<strong>Alternativa ${q.correctOption}</strong>`

      if (card.back !== backContent) {
        await prisma.flashcard.update({
          where: { id: card.id },
          data: { back: backContent }
        })
        updatedCount++
      }
    }

    console.log(`Higienização concluída! ${updatedCount} flashcards atualizados.`);
  } catch (error) {
    console.error('Erro durante higienização:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
