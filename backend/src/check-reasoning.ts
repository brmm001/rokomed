import 'dotenv/config'
import { prisma } from './lib/prisma'

async function check() {
  const count = await prisma.question.count({
    where: {
      reasoningLine: { not: null }
    }
  })
  console.log('Total questions with reasoningLine:', count)
  
  if (count > 0) {
    const sample = await prisma.question.findFirst({
      where: { reasoningLine: { not: null } },
      select: { id: true, statement: true, reasoningLine: true, options: true, correctOption: true }
    })
    console.log('Sample question:', JSON.stringify(sample, null, 2))
  }
}

check().catch(console.error)
