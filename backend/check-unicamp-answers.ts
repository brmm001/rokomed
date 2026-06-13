import { prisma } from './src/lib/prisma'

async function main() {
  console.log('Querying UNICAMP 2026 questions...')
  const questions = await prisma.question.findMany({
    where: {
      year: 2026,
      institution: { acronym: 'UNICAMP' }
    },
    select: {
      id: true,
      code: true,
      correctOption: true,
      options: true,
      statement: true
    }
  })

  console.log(`Found ${questions.length} UNICAMP 2026 questions.`)

  const correctOptionCounts: Record<string, number> = {}
  let nullOrEmptyCount = 0

  for (const q of questions) {
    const key = q.correctOption ?? 'NULL'
    correctOptionCounts[key] = (correctOptionCounts[key] || 0) + 1
    if (!q.correctOption) {
      nullOrEmptyCount++
      if (nullOrEmptyCount <= 5) {
        console.log(`Sample empty question - Code: ${q.code}, Statement snippet: ${q.statement.substring(0, 100)}`)
      }
    }
  }

  console.log('Distribution of correctOption values:', correctOptionCounts)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
