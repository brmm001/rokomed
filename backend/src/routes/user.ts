import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { z } from 'zod'

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

  // GET /api/user/institutions — lista instituições para o usuário (ex: onboarding)
  app.get('/institutions', { preHandler: [requireAuth] }, async (_request, reply) => {
    const institutions = await prisma.institution.findMany({ orderBy: { acronym: 'asc' } })
    return reply.send({ data: institutions })
  })

  // GET /api/user/routine — dados de rotina
  app.get('/routine', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        examDate: true,
        targetSpecialtyId: true,
        targetInstitutionId: true,
        routineConfig: true,
      }
    })

    if (!user) return reply.code(404).send({ error: 'Usuário não encontrado' })

    let daysLeft = null
    if (user.examDate) {
      const now = new Date()
      const diff = user.examDate.getTime() - now.getTime()
      daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }

    let routineConfigParsed = null
    if (user.routineConfig) {
      try { routineConfigParsed = JSON.parse(user.routineConfig) } catch {}
    }

    // Busca contagem de erros no Caderno de Erros (respostas incorretas distintas)
    const wrongCount = await prisma.userAnswer.count({
      where: {
        userId: payload.sub,
        isCorrect: false
      }
    })

    return reply.send({
      examDate: user.examDate,
      daysLeft,
      targetSpecialtyId: user.targetSpecialtyId,
      targetInstitutionId: user.targetInstitutionId,
      routineConfig: routineConfigParsed,
      wrongCount
    })
  })

  // POST /api/user/routine — salva configuração de rotina
  app.post('/routine', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const schema = z.object({
      weeklyHours: z.number().min(1).max(168),
      schedule: z.record(z.string(), z.array(z.string())),
    })

    const parsed = schema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message })

    const routineConfig = JSON.stringify(parsed.data)

    const user = await prisma.user.update({
      where: { id: payload.sub },
      data: { routineConfig },
      select: { id: true, routineConfig: true }
    })

    return reply.send({ success: true, routineConfig: parsed.data })
  })

  // GET /api/user/subjects-proficiency — proficiência e prioridades do usuário
  app.get('/subjects-proficiency', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { institutionId } = request.query as { institutionId?: string }

    // Busca o usuário para ver a banca alvo se nenhuma for passada por parâmetro
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { targetInstitutionId: true }
    })

    const activeInstitutionId = institutionId || user?.targetInstitutionId || ''

    // Busca todas as especialidades raízes ou grandes áreas
    const specialties = await prisma.specialty.findMany({
      where: { isGrandeArea: true },
      select: { id: true, name: true }
    })

    // Busca prioridades manuais da banca ativa
    const priorities = activeInstitutionId ? await prisma.institutionPriority.findMany({
      where: { institutionId: activeInstitutionId },
      select: { specialtyId: true, priority: true }
    }) : []

    // Calcula proficiência para cada grande área
    const results = []
    for (const spec of specialties) {
      // Pega todos os IDs de especialidades filhas/temas para somar as respostas
      const allIds = [spec.id]
      let toExpand = [spec.id]
      while (toExpand.length > 0) {
        const children = await prisma.specialty.findMany({
          where: { parentId: { in: toExpand } },
          select: { id: true }
        })
        const childIds = children.map(c => c.id)
        allIds.push(...childIds)
        toExpand = childIds
      }

      // Conta respostas do usuário
      const [totalAnswered, correctAnswered] = await Promise.all([
        prisma.userAnswer.count({
          where: {
            userId: payload.sub,
            question: { specialtyId: { in: allIds } }
          }
        }),
        prisma.userAnswer.count({
          where: {
            userId: payload.sub,
            isCorrect: true,
            question: { specialtyId: { in: allIds } }
          }
        })
      ])

      const accuracy = totalAnswered > 0 ? Math.round((correctAnswered / totalAnswered) * 100) : null
      
      let level = 'NÃO ESTUDADO'
      if (accuracy !== null) {
        if (accuracy < 50) level = 'INICIANTE'
        else if (accuracy < 80) level = 'INTERMEDIÁRIO'
        else level = 'AVANÇADO'
      }

      // Procura prioridade configurada pelo admin
      const priorityRecord = priorities.find(p => p.specialtyId === spec.id)
      const priority = priorityRecord ? priorityRecord.priority : 'MEDIA' // Padrão média

      results.push({
        id: spec.id,
        name: spec.name,
        accuracy,
        level,
        priority
      })
    }

    return reply.send({ activeInstitutionId, data: results })
  })
}
