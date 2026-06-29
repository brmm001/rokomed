/**
 * simulados.ts — Rotas de Simulado Personalizado
 * POST   /api/simulados          — cria simulado e seleciona questões aleatórias
 * GET    /api/simulados          — lista simulados do usuário
 * GET    /api/simulados/:id      — detalhe + questões (sem gabarito até finalizar)
 * PATCH  /api/simulados/:id/start  — inicia o simulado
 * PATCH  /api/simulados/:id/answer — registra resposta de uma questão
 * PATCH  /api/simulados/:id/finish  — finaliza e calcula score
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, requirePro } from '../middleware/auth'

const createSchema = z.object({
  title:          z.string().min(1).max(100).optional(),
  totalQuestions: z.number().int().min(1).max(120),
  timeLimitMin:   z.number().int().min(10).max(360).optional().nullable(),
  difficulties:   z.array(z.enum(['FACIL', 'MEDIO', 'DIFICIL'])).optional(),
  institutionIds: z.array(z.string()).optional(),
  specialtyIds:   z.array(z.string()).optional(),
  years:          z.array(z.number().int()).optional(),
})

const answerSchema = z.object({
  order:       z.number().int().min(0),
  selectedOpt: z.string().length(1),
})

// ── Helper: monta where + expande especialidades recursivamente ────────────
async function buildQuestionWhere(filters: {
  difficulties?: string[]; institutionIds?: string[]; specialtyIds?: string[]; years?: number[]
}): Promise<Record<string, unknown>> {
  const where: Record<string, unknown> = { isPublished: true, correctOption: { not: null } }
  if (filters.difficulties?.length)   where.difficulty    = { in: filters.difficulties }
  if (filters.institutionIds?.length) where.institutionId = { in: filters.institutionIds }
  if (filters.years?.length)          where.year          = { in: filters.years }

  if (filters.specialtyIds?.length) {
    const allIds = [...filters.specialtyIds]
    let toExpand = [...filters.specialtyIds]
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
  return where
}

export default async function simuladoRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth)
  app.addHook('preHandler', requirePro)

  // POST /api/simulados/preview — verifica disponibilidade SEM criar simulado
  app.post('/preview', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as {
      totalQuestions?: number; difficulties?: string[]
      institutionIds?: string[]; specialtyIds?: string[]; years?: number[]
    }
    const where     = await buildQuestionWhere(body)
    const available = await prisma.question.count({ where })
    const requested = body.totalQuestions ?? 0
    if (available < requested) {
      return reply.code(422).send({
        error: `Apenas ${available} questão(ões) disponíve${available === 1 ? 'l' : 'is'} com esses filtros.`,
        available,
      })
    }
    return reply.send({ available, requested, ok: true })
  })

  // POST /api/simulados — cria simulado com seleção aleatória de questões
  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const parsed  = createSchema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message })

    const { title, totalQuestions, timeLimitMin, difficulties, institutionIds, specialtyIds, years } = parsed.data

    const where     = await buildQuestionWhere({ difficulties, institutionIds, specialtyIds, years })
    const available = await prisma.question.count({ where })

    if (available < totalQuestions) {
      return reply.code(422).send({
        error: `Apenas ${available} questão(ões) disponíve${available === 1 ? 'l' : 'is'} com esses filtros.`,
        available,
      })
    }

    const allIds  = await prisma.question.findMany({ where, select: { id: true }, orderBy: { id: 'asc' } })
    const shuffled = allIds.sort(() => Math.random() - 0.5).slice(0, totalQuestions)

    const config    = JSON.stringify({ difficulties, institutionIds, specialtyIds, years })
    const autoTitle = title || `Simulado — ${new Date().toLocaleDateString('pt-BR')}`

    const exam = await prisma.mockExam.create({
      data: {
        userId: payload.sub, title: autoTitle, totalQuestions,
        timeLimitMin: timeLimitMin ?? null, config, status: 'PENDING',
        questions: { create: shuffled.map((q, i) => ({ questionId: q.id, order: i })) },
      },
    })

    return reply.code(201).send({ exam })
  })

  // GET /api/simulados — lista simulados do usuário
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }

    const exams = await prisma.mockExam.findMany({
      where:   { userId: payload.sub },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, totalQuestions: true, status: true,
        score: true, correctCount: true, currentIndex: true,
        timeLimitMin: true, startedAt: true, finishedAt: true, createdAt: true,
      },
    })

    return reply.send({ data: exams })
  })

  // GET /api/simulados/:id — detalhe com questões
  app.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id }  = request.params as { id: string }

    const exam = await prisma.mockExam.findFirst({
      where: { id, userId: payload.sub },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            question: {
              include: {
                specialty:   { select: { id: true, name: true, slug: true, parent: { select: { id: true, name: true } } } },
                institution: { select: { id: true, acronym: true, name: true } },
                images:      { orderBy: { order: 'asc' } },
              },
            },
          },
        },
      },
    })

    if (!exam) return reply.code(404).send({ error: 'Simulado não encontrado' })

    const isFinished = exam.status === 'FINISHED'

    // Serializa as questões (options JSON + oculta gabarito se não finalizado)
    const questions = exam.questions.map(eq => {
      const q = eq.question
      const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options
      return {
        examQuestionId: eq.id,
        order:          eq.order,
        selectedOpt:    eq.selectedOpt,
        isCorrect:      eq.isCorrect,
        answeredAt:     eq.answeredAt,
        question: {
          id:          q.id,
          statement:   q.statement,
          options:     opts,
          difficulty:  q.difficulty,
          year:        q.year,
          specialty:   q.specialty,
          institution: q.institution,
          images:      q.images,
          correctOption: q.correctOption,
          // Só exibe explicação após finalizar
          ...(isFinished ? {
            explanation:   q.explanation,
            reasoningLine: (() => { try { return JSON.parse(q.reasoningLine ?? '[]') } catch { return [] } })(),
          } : {}),
        },
      }
    })

    return reply.send({ ...exam, questions })
  })

  // PATCH /api/simulados/:id/start — inicia o simulado
  app.patch('/:id/start', async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id }  = request.params as { id: string }

    const exam = await prisma.mockExam.findFirst({ where: { id, userId: payload.sub } })
    if (!exam) return reply.code(404).send({ error: 'Simulado não encontrado' })
    if (exam.status === 'FINISHED') return reply.code(400).send({ error: 'Simulado já finalizado' })

    const updated = await prisma.mockExam.update({
      where: { id },
      data:  { status: 'IN_PROGRESS', startedAt: exam.startedAt ?? new Date() },
    })

    return reply.send({ exam: updated })
  })

  // PATCH /api/simulados/:id/answer — registra resposta de uma questão
  app.patch('/:id/answer', async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id }  = request.params as { id: string }
    const parsed  = answerSchema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: 'Dados inválidos' })

    const { order, selectedOpt } = parsed.data

    const exam = await prisma.mockExam.findFirst({
      where: { id, userId: payload.sub },
      include: { questions: { where: { order }, include: { question: { select: { correctOption: true } } } } },
    })

    if (!exam) return reply.code(404).send({ error: 'Simulado não encontrado' })
    if (exam.status === 'FINISHED') return reply.code(400).send({ error: 'Simulado já finalizado' })

    const eq = exam.questions[0]
    if (!eq) return reply.code(404).send({ error: 'Questão não encontrada no simulado' })

    const isCorrect = selectedOpt.toUpperCase() === (eq.question.correctOption ?? '').toUpperCase()

    await prisma.mockExamQuestion.update({
      where: { id: eq.id },
      data:  { selectedOpt: selectedOpt.toUpperCase(), isCorrect, answeredAt: new Date() },
    })

    // Atualiza currentIndex se avançou
    const newIndex = Math.max(exam.currentIndex, order + 1)
    await prisma.mockExam.update({
      where: { id },
      data:  { currentIndex: newIndex, status: 'IN_PROGRESS', startedAt: exam.startedAt ?? new Date() },
    })

    return reply.send({ ok: true, isCorrect })
  })

  // PATCH /api/simulados/:id/finish — finaliza simulado e calcula score
  app.patch('/:id/finish', async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id }  = request.params as { id: string }

    const exam = await prisma.mockExam.findFirst({
      where:   { id, userId: payload.sub },
      include: { questions: true },
    })

    if (!exam) return reply.code(404).send({ error: 'Simulado não encontrado' })
    if (exam.status === 'FINISHED') return reply.code(400).send({ error: 'Simulado já finalizado' })

    const correctCount = exam.questions.filter(q => q.isCorrect).length
    const answered     = exam.questions.filter(q => q.selectedOpt !== null).length
    const score        = Math.round((correctCount / exam.totalQuestions) * 100)

    const updated = await prisma.mockExam.update({
      where: { id },
      data:  {
        status:       'FINISHED',
        correctCount,
        score,
        finishedAt:   new Date(),
        currentIndex: exam.totalQuestions,
      },
    })

    return reply.send({ exam: updated, correctCount, answered, score })
  })
}
