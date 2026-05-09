import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

export default async function userRoutes(app: FastifyInstance) {
  // GET /api/user/stats — estatísticas pessoais do aluno
  app.get('/stats', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const userId  = payload.sub

    const today = new Date(); today.setHours(0, 0, 0, 0)
    const week  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [total, correct, today_count, bookmarks] = await Promise.all([
      prisma.userAnswer.count({ where: { userId } }),
      prisma.userAnswer.count({ where: { userId, isCorrect: true } }),
      prisma.userAnswer.count({ where: { userId, createdAt: { gte: today } } }),
      prisma.userBookmark.count({ where: { userId } }),
    ])

    // % de acerto por especialidade
    const bySpecialty = await prisma.userAnswer.groupBy({
      by: ['questionId'],
      where: { userId },
      _count: { id: true },
    })

    // Heatmap dos últimos 7 dias
    const heatmap = await prisma.userAnswer.groupBy({
      by: ['createdAt'],
      where: { userId, createdAt: { gte: week } },
      _count: { id: true },
    })

    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

    return reply.send({
      total, correct, accuracy, today_count, bookmarks,
      streak: (await prisma.user.findUnique({ where: { id: userId }, select: { streak: true } }))?.streak ?? 0,
      answeredThisWeek: bySpecialty.length,
      heatmap,
    })
  })

  // GET /api/user/history — histórico de respostas paginado
  app.get('/history', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { page = '1' } = request.query as { page?: string }
    const p = parseInt(page)

    const [answers, total] = await Promise.all([
      prisma.userAnswer.findMany({
        where:   { userId: payload.sub },
        orderBy: { createdAt: 'desc' },
        skip:    (p - 1) * 20,
        take:    20,
        include: {
          question: {
            select: {
              id: true, statement: true, correctOption: true, difficulty: true,
              specialty:   { select: { name: true } },
              institution: { select: { acronym: true } },
            },
          },
        },
      }),
      prisma.userAnswer.count({ where: { userId: payload.sub } }),
    ])

    return reply.send({ data: answers, total, page: p, totalPages: Math.ceil(total / 20) })
  })

  // GET /api/user/profile — perfil completo
  app.get('/profile', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true, name: true, email: true, picture: true,
        role: true, plan: true, xp: true, streak: true,
        createdAt: true, isBanned: true,
        subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    })

    if (!user) return reply.code(404).send({ error: 'Usuário não encontrado' })

    return reply.send({ user })
  })

  // PATCH /api/user/profile — atualizar nome e picture
  app.patch('/profile', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { name, picture } = request.body as { name?: string; picture?: string }

    const user = await prisma.user.update({
      where: { id: payload.sub },
      data: { ...(name && { name }), ...(picture && { picture }) },
      select: { id: true, name: true, email: true, picture: true, role: true, plan: true },
    })

    return reply.send({ user })
  })

  // POST /api/user/onboarding — salva dados do onboarding
  app.post('/onboarding', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const {
      originInstitution,
      targetInstitutionId,
      targetSpecialtyId,
      examYear,
    } = request.body as {
      originInstitution?: string
      targetInstitutionId?: string
      targetSpecialtyId?: string
      examYear?: number
    }

    const examDate = examYear ? new Date(`${examYear}-01-01`) : undefined

    const user = await prisma.user.update({
      where: { id: payload.sub },
      data: {
        onboardingDone: true,
        ...(originInstitution && { originInstitution }),
        ...(targetInstitutionId && { targetInstitutionId }),
        ...(targetSpecialtyId && { targetSpecialtyId }),
        ...(examDate && { examDate }),
      },
      select: {
        id: true, name: true, email: true, plan: true, role: true,
        onboardingDone: true, originInstitution: true,
        targetInstitutionId: true, targetSpecialtyId: true, examDate: true,
      },
    })

    return reply.send({ user })
  })
}
