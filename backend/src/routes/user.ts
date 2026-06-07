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

    // Busca campos base do usuário (sempre existem)
    let user: any = null
    try {
      user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          examDate: true,
          targetSpecialtyId: true,
          targetInstitutionId: true,
          routineConfig: true,
        }
      })
    } catch {
      // Fallback: tenta sem routineConfig (campo pode não existir no Turso ainda)
      try {
        user = await (prisma.user as any).findUnique({
          where: { id: payload.sub },
          select: {
            examDate: true,
            targetSpecialtyId: true,
            targetInstitutionId: true,
          }
        })
      } catch (err2: any) {
        return reply.code(500).send({ error: 'Erro ao buscar dados do usuário' })
      }
    }

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

    // Busca contagem de erros — com fallback caso a tabela ou coluna não exista
    let wrongCount = 0
    try {
      wrongCount = await prisma.userAnswer.count({
        where: { userId: payload.sub, isCorrect: false }
      })
    } catch { wrongCount = 0 }

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
  // OTIMIZADO: apenas 3 queries ao banco + agregação em memória
  app.get('/subjects-proficiency', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { institutionId } = request.query as { institutionId?: string }

    // Query 1: dados do usuário
    let user: any = null
    try {
      user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { targetInstitutionId: true }
      })
    } catch { user = null }

    const activeInstitutionId = institutionId || user?.targetInstitutionId || ''

    // Query 2: toda a árvore de especialidades em 1 query
    let allSpecialties: { id: string; name: string; parentId: string | null; isGrandeArea: boolean }[] = []
    try {
      allSpecialties = await (prisma.specialty as any).findMany({
        select: { id: true, name: true, parentId: true, isGrandeArea: true }
      })
    } catch {
      try {
        allSpecialties = await prisma.specialty.findMany({
          select: { id: true, name: true, parentId: true }
        }) as any[]
      } catch { allSpecialties = [] }
    }

    // Grandes áreas = isGrandeArea true ou parentId null como fallback
    const grandeAreas = allSpecialties.filter(s => (s as any).isGrandeArea || s.parentId === null)

    // Mapa de filhos em memória
    const childrenMap = new Map<string, string[]>()
    for (const s of allSpecialties) {
      if (s.parentId) {
        const arr = childrenMap.get(s.parentId) || []
        arr.push(s.id)
        childrenMap.set(s.parentId, arr)
      }
    }

    function expandTree(rootId: string): string[] {
      const ids = [rootId]
      const queue = [rootId]
      while (queue.length > 0) {
        const cur = queue.shift()!
        for (const child of childrenMap.get(cur) || []) {
          ids.push(child)
          queue.push(child)
        }
      }
      return ids
    }

    // Query 3: prioridades da banca
    let priorities: { specialtyId: string; priority: string }[] = []
    if (activeInstitutionId) {
      try {
        priorities = await prisma.institutionPriority.findMany({
          where: { institutionId: activeInstitutionId },
          select: { specialtyId: true, priority: true }
        })
      } catch { priorities = [] }
    }

    // Query 4: todas as respostas do usuário com specialtyId (1 query, processa em memória)
    let answerMap = new Map<string, { total: number; correct: number }>()
    try {
      const answers = await prisma.userAnswer.findMany({
        where: { userId: payload.sub },
        select: { isCorrect: true, question: { select: { specialtyId: true } } }
      })
      for (const a of answers) {
        const sid = (a.question as any)?.specialtyId
        if (!sid) continue
        const entry = answerMap.get(sid) || { total: 0, correct: 0 }
        entry.total++
        if (a.isCorrect) entry.correct++
        answerMap.set(sid, entry)
      }
    } catch { answerMap = new Map() }

    // Agrega em memória — sem queries extras
    const results = grandeAreas.map(spec => {
      const ids = expandTree(spec.id)
      let total = 0, correct = 0
      for (const id of ids) {
        const e = answerMap.get(id)
        if (e) { total += e.total; correct += e.correct }
      }
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : null
      let level = 'NÃO ESTUDADO'
      if (accuracy !== null) {
        if (accuracy < 50) level = 'INICIANTE'
        else if (accuracy < 80) level = 'INTERMEDIÁRIO'
        else level = 'AVANÇADO'
      }
      const pr = priorities.find(p => p.specialtyId === spec.id)
      return { id: spec.id, name: spec.name, accuracy, level, priority: pr?.priority || 'MEDIA' }
    })

    return reply.send({ activeInstitutionId, data: results })
  })
}
