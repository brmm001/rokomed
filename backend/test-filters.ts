import { prisma } from './src/lib/prisma'

async function main() {
  console.log('Testing filters query...')
  const years = await prisma.question.findMany({
    where: { isPublished: true, year: { not: null } },
    select: { year: true },
    distinct: ['year'],
    orderBy: { year: 'desc' },
  })
  console.log('Years returned:', years.map(q => q.year))

  const unicamp2026Count = await prisma.question.count({
    where: {
      isPublished: true,
      year: 2026,
      institution: { acronym: 'UNICAMP' }
    }
  })
  console.log('Published UNICAMP 2026 questions count:', unicamp2026Count)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
