import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

// ── Schemas ────────────────────────────────────────────────────────────────
const listSchema = z.object({
  page:          z.coerce.number().min(1).default(1),
  limit:         z.coerce.number().min(1).max(50).default(20),
  specialtyId:   z.string().optional(),
  institutionId: z.string().optional(),
  year:          z.coerce.number().optional(),
  difficulty:    z.enum(['FACIL', 'MEDIO', 'DIFICIL']).optional(),
  search:        z.string().optional(),
  bookmarked:    z.coerce.boolean().optional(),
  wrongOnly:     z.coerce.boolean().optional(),
})

const answerSchema = z.object({
  selectedOpt:   z.string().length(1),
  timeSpentSec:  z.number().optional(),
})

// Helper para deserializar campos JSON armazenados como string (SQLite)
function parseQuestion(q: Record<string, unknown>) {
  return {
    ...q,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    isBookmarked: Array.isArray(q.bookmarks) ? (q.bookmarks as unknown[]).length > 0 : false,
    note: Array.isArray(q.notes) ? ((q.notes as Array<{ content: string }>)[0]?.content ?? null) : null,
    highlights: Array.isArray(q.highlights)
      ? (q.highlights as Array<Record<string, unknown>>).map(h => ({
          ...h,
          rangeJson: typeof h.rangeJson === 'string' ? JSON.parse(h.rangeJson) : h.rangeJson,
        }))
      : [],
  }
}

export default async function questionRoutes(app: FastifyInstance) {
  // GET /api/questions — lista questões com filtros
  app.get('/', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string; plan: string }
    const parsed  = listSchema.safeParse(request.query)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.errors[0].message })

    const { page, limit, specialtyId, institutionId, year, difficulty, search, bookmarked, wrongOnly } = parsed.data

    // Limite diário para FREE: 10 questões
    if (payload.plan === 'FREE') {
      const today = new Date(); today.setHours(0, 0, 0, 0)
      const count = await prisma.userAnswer.count({
        where: { userId: payload.sub, createdAt: { gte: today } },
      })
      if (count >= 10) {
        return reply.code(402).send({ error: 'Limite diário atingido. Faça upgrade para Pro!', upgrade: true })
      }
    }

    const where: Record<string, unknown> = { isPublished: true }
    if (institutionId) where.institutionId = institutionId
    if (year)          where.year          = year
    if (difficulty)    where.difficulty    = difficulty
    if (search)        where.statement     = { contains: search }

    // Quando filtrar por especialidade, expande recursivamente para incluir temas e subtemas filhos
    if (specialtyId) {
      const allIds = [specialtyId]
      let toExpand = [specialtyId]
      while (toExpand.length > 0) {
        const children = await prisma.specialty.findMany({
          where:  { parentId: { in: toExpand } },
          select: { id: true },
        })
        const childIds = children.map(c => c.id)
        allIds.push(...childIds)
        toExpand = childIds
      }
      where.specialtyId = { in: allIds }
    }

    // Filtro: somente favoritas
    if (bookmarked) {
      const bm = await prisma.userBookmark.findMany({ where: { userId: payload.sub }, select: { questionId: true } })
      where.id = { in: bm.map(b => b.questionId) }
    }

    // Filtro: somente erradas
    if (wrongOnly) {
      const wrong = await prisma.userAnswer.findMany({
        where: { userId: payload.sub, isCorrect: false },
        select: { questionId: true },
        distinct: ['questionId'],
      })
      where.id = { in: wrong.map(a => a.questionId) }
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: { createdAt: 'desc' },
        include: {
          specialty:   { select: { id: true, name: true } },
          institution: { select: { id: true, name: true, acronym: true } },
          images:      { select: { id: true, url: true, caption: true, order: true }, orderBy: { order: 'asc' } },
          bookmarks:   { where: { userId: payload.sub }, select: { id: true } },
          notes:       { where: { userId: payload.sub }, select: { content: true } },
          highlights:  { where: { userId: payload.sub }, select: { id: true, rangeJson: true, color: true } },
        },
      }),
      prisma.question.count({ where }),
    ])

    const data = questions.map(q => parseQuestion(q as unknown as Record<string, unknown>))
    return reply.send({ data, total, page, totalPages: Math.ceil(total / limit) })
  })

  // GET /api/questions/:id — detalhe de uma questão
  app.get('/:id', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id }  = request.params as { id: string }

    const [question, totalAnswers, correctAnswers] = await Promise.all([
      prisma.question.findUnique({
        where: { id, isPublished: true },
        include: {
          specialty: {
            select: {
              id: true, name: true, slug: true,
              parent: {
                select: {
                  id: true, name: true, slug: true,
                  parent: { select: { id: true, name: true, slug: true } },
                },
              },
            },
          },
          institution: { select: { id: true, name: true, acronym: true } },
          images:      { orderBy: { order: 'asc' } },
          bookmarks:   { where: { userId: payload.sub }, select: { id: true } },
          notes:       { where: { userId: payload.sub }, select: { content: true } },
          highlights:  { where: { userId: payload.sub } },
        },
      }),
      prisma.userAnswer.count({ where: { questionId: id } }),
      prisma.userAnswer.count({ where: { questionId: id, isCorrect: true } }),
    ])

    if (!question) return reply.code(404).send({ error: 'Questão não encontrada' })

    const correctRate = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : null

    // Parseia reasoningLine de JSON string para array
    let reasoningLine: string[] = []
    if (question.reasoningLine) {
      try { reasoningLine = JSON.parse(question.reasoningLine) } catch { reasoningLine = [] }
    }

    const parsed = parseQuestion(question as unknown as Record<string, unknown>)
    return reply.send({
      ...parsed,
      reasoningLine,
      stats: { totalAnswers, correctAnswers, correctRate },
    })
  })

  // POST /api/questions/:id/answer — registra resposta
  app.post('/:id/answer', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id }  = request.params as { id: string }
    const parsed  = answerSchema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: 'Dados inválidos' })

    const { selectedOpt, timeSpentSec } = parsed.data

    const question = await prisma.question.findUnique({ where: { id }, select: { correctOption: true } })
    if (!question) return reply.code(404).send({ error: 'Questão não encontrada' })

    const isCorrect = selectedOpt.toUpperCase() === question.correctOption.toUpperCase()

    const answer = await prisma.userAnswer.create({
      data: { userId: payload.sub, questionId: id, selectedOpt: selectedOpt.toUpperCase(), isCorrect, timeSpentSec },
    })

    return reply.code(201).send({ answer, isCorrect, correctOption: question.correctOption })
  })

  // POST /api/questions/:id/bookmark — toggle favorito
  app.post('/:id/bookmark', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id }  = request.params as { id: string }

    const existing = await prisma.userBookmark.findUnique({
      where: { userId_questionId: { userId: payload.sub, questionId: id } },
    })

    if (existing) {
      await prisma.userBookmark.delete({ where: { id: existing.id } })
      return reply.send({ bookmarked: false })
    } else {
      await prisma.userBookmark.create({ data: { userId: payload.sub, questionId: id } })
      return reply.send({ bookmarked: true })
    }
  })

  // PUT /api/questions/:id/note — salva anotação
  app.put('/:id/note', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload     = request.user as { sub: string }
    const { id }      = request.params as { id: string }
    const { content } = request.body as { content: string }

    const note = await prisma.userNote.upsert({
      where:  { userId_questionId: { userId: payload.sub, questionId: id } },
      create: { userId: payload.sub, questionId: id, content },
      update: { content },
    })

    return reply.send({ note })
  })

  // POST /api/questions/:id/highlight — salva grifo (rangeJson serializado como string)
  app.post('/:id/highlight', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload              = request.user as { sub: string }
    const { id }               = request.params as { id: string }
    const { rangeJson, color } = request.body as { rangeJson: object; color?: string }

    const highlight = await prisma.userHighlight.create({
      data: {
        userId:     payload.sub,
        questionId: id,
        rangeJson:  JSON.stringify(rangeJson),
        color:      color || '#fde68a',
      },
    })

    return reply.code(201).send({ highlight: { ...highlight, rangeJson } })
  })

  // DELETE /api/questions/:id/highlight/:hId — remove grifo
  app.delete('/:id/highlight/:hId', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload     = request.user as { sub: string }
    const { id, hId } = request.params as { id: string; hId: string }

    await prisma.userHighlight.deleteMany({ where: { id: hId, userId: payload.sub, questionId: id } })
    return reply.send({ deleted: true })
  })

  // GET /api/questions/meta/filters — listas de filtros disponíveis
  // Retorna apenas grandes áreas médicas (isGrandeArea = true)
  app.get('/meta/filters', { preHandler: [requireAuth] }, async (_request, reply) => {
    const [specialties, institutions, years] = await Promise.all([
      prisma.specialty.findMany({
        where:   { isGrandeArea: true },
        select:  { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      prisma.institution.findMany({ select: { id: true, name: true, acronym: true }, orderBy: { acronym: 'asc' } }),
      prisma.question.findMany({
        where: { isPublished: true, year: { not: null } },
        select: { year: true },
        distinct: ['year'],
        orderBy: { year: 'desc' },
      }),
    ])

    return reply.send({ specialties, institutions, years: years.map(q => q.year) })
  })

  // GET /api/questions/meta/specialty-tree — hierarquia completa para UI de seleção
  // Retorna: Grande Área → Temas → Subtemas (3 níveis)
  app.get('/meta/specialty-tree', { preHandler: [requireAuth] }, async (_request, reply) => {
    const roots = await prisma.specialty.findMany({
      where: { isGrandeArea: true },
      select: {
        id: true, name: true,
        _count: { select: { children: true, questions: true } },
        children: {
          select: {
            id: true, name: true,
            _count: { select: { children: true, questions: true } },
            children: {
              select: { id: true, name: true, _count: { select: { questions: true } } },
              orderBy: { name: 'asc' },
            },
          },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    })

    const tree = roots.map(r => ({
      id: r.id,
      name: r.name,
      questionCount: (r._count as any).questions,
      themes: r.children.map(t => ({
        id: t.id,
        name: t.name,
        questionCount: (t._count as any).questions,
        subthemes: t.children.map(st => ({
          id: st.id,
          name: st.name,
          questionCount: (st._count as any).questions,
        })),
      })),
    }))

    return reply.send({ tree })
  })
}
