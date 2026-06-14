import { PrismaClient } from '@prisma/client'
import { LESSON_CATALOG } from '../../frontend/src/data/lessonCatalog'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding lessons from frontend catalog...')

  for (const cat of LESSON_CATALOG) {
    // Find or create specialty
    let specialty = await prisma.specialty.findFirst({
      where: {
        OR: [
          { slug: cat.id },
          { name: cat.name }
        ]
      }
    })

    if (!specialty) {
      specialty = await prisma.specialty.create({
        data: {
          name: cat.name,
          slug: cat.id,
        }
      })
    }

    console.log(`Specialty: ${specialty.name} (ID: ${specialty.id})`)

    // Create or update lessons for each topic in catalog
    for (const topic of cat.topics) {
      let lesson = await prisma.lesson.findFirst({
        where: { title: topic.title }
      })

      if (!lesson) {
        lesson = await prisma.lesson.create({
          data: {
            title: topic.title,
            description: topic.desc,
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Default video (YouTube embeddable link)
            durationMin: topic.durationMin || 45,
            specialtyId: specialty.id
          }
        })
        console.log(`  [NEW] Lesson: ${lesson.title}`)
      } else {
        lesson = await prisma.lesson.update({
          where: { id: lesson.id },
          data: {
            description: topic.desc,
            videoUrl: lesson.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            durationMin: topic.durationMin || lesson.durationMin || 45,
            specialtyId: specialty.id
          }
        })
        console.log(`  [UPD] Lesson: ${lesson.title}`)
      }
    }
  }

  console.log('Lessons seeding completed successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
