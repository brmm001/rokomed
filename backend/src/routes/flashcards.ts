import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, requireActiveSubscription } from '../middleware/auth'

const reviewSchema = z.object({
  quality: z.enum(['EASY', 'MEDIUM', 'HARD']),
})

export default async function flashcardRoutes(app: FastifyInstance) {
  // GET /api/flashcards — Lista os flashcards pendentes para revisão
  app.get('/', { preHandler: [requireAuth, requireActiveSubscription] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const now = new Date()

    const cards = await prisma.flashcard.findMany({
      where: {
        userId: payload.sub,
        dueDate: { lte: now },
      },
      orderBy: {
        dueDate: 'asc',
      },
    })

    return reply.send({ data: cards })
  })

  // GET /api/flashcards/stats — Retorna estatísticas de flashcards do usuário
  app.get('/stats', { preHandler: [requireAuth, requireActiveSubscription] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const now = new Date()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [total, pending, todayCount] = await Promise.all([
      prisma.flashcard.count({
        where: { userId: payload.sub },
      }),
      prisma.flashcard.count({
        where: {
          userId: payload.sub,
          dueDate: { lte: now },
        },
      }),
      prisma.flashcard.count({
        where: {
          userId: payload.sub,
          createdAt: { gte: today },
        },
      }),
    ])

    return reply.send({ total, pending, today: todayCount })
  })

  // POST /api/flashcards/:id/review — Processa a revisão de um flashcard usando o algoritmo SM-2
  app.post('/:id/review', { preHandler: [requireAuth, requireActiveSubscription] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id } = request.params as { id: string }
    const parsed = reviewSchema.safeParse(request.body)

    if (!parsed.success) {
      return reply.code(400).send({ error: 'Qualidade inválida' })
    }

    const { quality } = parsed.data

    const card = await prisma.flashcard.findFirst({
      where: { id, userId: payload.sub },
    })

    if (!card) {
      return reply.code(404).send({ error: 'Flashcard não encontrado' })
    }

    let { easeFactor, interval } = card

    if (quality === 'HARD') {
      interval = 1
      easeFactor = Math.max(1.3, easeFactor - 0.2)
    } else if (quality === 'MEDIUM') {
      if (interval === 1) {
        interval = 3
      } else {
        interval = Math.round(interval * easeFactor)
      }
      easeFactor = Math.max(1.3, easeFactor - 0.05)
    } else { // EASY
      if (interval === 1) {
        interval = 6
      } else {
        interval = Math.round(interval * easeFactor)
      }
      easeFactor = Math.min(3.0, easeFactor + 0.15)
    }

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + interval)

    const updatedCard = await prisma.flashcard.update({
      where: { id },
      data: {
        easeFactor,
        interval,
        dueDate,
      },
    })

    return reply.send({ card: updatedCard })
  })
}
