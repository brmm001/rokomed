import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, requirePro } from '../middleware/auth'
import {
  probability3PL, estimateMAP, selectNextItem, fisherInformation,
  difficultyToB, calibrateFromData, thetaToLabel, thetaToPercentile,
  type IRTParams, type Response, type PoolItem,
} from '../lib/irt-engine'

// ── Schemas ────────────────────────────────────────────────────────────────

const startSchema = z.object({
  specialtyId: z.string().optional(),
  nItems:      z.number().min(5).max(50).default(20),
})

const answerSchema = z.object({
  selectedOpt:  z.string().length(1),
  timeSpentSec: z.number().optional(),
})

export default async function adaptiveRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth)
  app.addHook('preHandler', requirePro)

  // ── POST /api/adaptive/start ──────────────────────────────────────────
  app.post('/start', async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const parsed = startSchema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message })

    const { specialtyId, nItems } = parsed.data

    // Get or create user theta
    const existingTheta = await prisma.userTheta.findUnique({
      where: { userId_specialtyId: { userId: payload.sub, specialtyId: specialtyId ?? 'GLOBAL' } },
    })

    const thetaStart = existingTheta?.theta ?? 0
    const seStart = existingTheta?.se ?? 1.0

    // Get first item pool
    const pool = await loadItemPool(specialtyId ?? null)
    
    if (pool.length === 0) {
      return reply.code(400).send({ error: 'Sem questões disponíveis para esta configuração' })
    }

    const actualNItems = Math.min(nItems, pool.length)

    // Create adaptive session
    const session = await prisma.adaptiveSession.create({
      data: {
        userId: payload.sub,
        specialtyId: specialtyId ?? null,
        thetaStart,
        seStart,
        totalItems: actualNItems,
        status: 'ACTIVE',
      },
    })

    const answeredIds = new Set<string>()
    const firstItem = selectNextItem(thetaStart, pool, answeredIds)

    if (!firstItem) {
      await prisma.adaptiveSession.update({ where: { id: session.id }, data: { status: 'FINISHED', finishedAt: new Date() } })
      return reply.code(400).send({ error: 'Erro ao selecionar questão' })
    }

    // Create first session item
    const sessionItem = await prisma.adaptiveSessionItem.create({
      data: {
        sessionId: session.id,
        questionId: firstItem.questionId,
        order: 0,
        thetaBefore: thetaStart,
        seBefore: seStart,
        fisherInfo: fisherInformation(thetaStart, firstItem.params),
      },
    })

    // Load full question
    const question = await loadFullQuestion(firstItem.questionId, payload.sub)

    return reply.code(201).send({
      session: {
        id: session.id,
        thetaStart,
        seStart,
        totalItems: actualNItems,
        currentIndex: 0,
        status: 'ACTIVE',
      },
      currentItem: { sessionItemId: sessionItem.id, question },
      theta: { value: thetaStart, se: seStart, label: thetaToLabel(thetaStart), percentile: thetaToPercentile(thetaStart) },
    })
  })

  // ── POST /api/adaptive/:sessionId/answer ──────────────────────────────
  app.post('/:sessionId/answer', async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { sessionId } = request.params as { sessionId: string }
    const parsed = answerSchema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: 'Dados inválidos' })

    const { selectedOpt, timeSpentSec } = parsed.data

    // Validate session
    const session = await prisma.adaptiveSession.findUnique({
      where: { id: sessionId },
      include: { items: { orderBy: { order: 'asc' } } },
    })
    if (!session || session.userId !== payload.sub) return reply.code(404).send({ error: 'Sessão não encontrada' })
    if (session.status !== 'ACTIVE') return reply.code(400).send({ error: 'Sessão já finalizada' })

    // Get current (unanswered) item
    const currentItem = session.items.find(i => i.selectedOpt === null)
    if (!currentItem) return reply.code(400).send({ error: 'Nenhum item pendente' })

    // Get question & IRT params
    const question = await prisma.question.findUnique({
      where: { id: currentItem.questionId },
      include: { irt: true },
    })
    if (!question) return reply.code(404).send({ error: 'Questão não encontrada' })

    const isCorrect = selectedOpt.toUpperCase() === question.correctOption?.toUpperCase()
    const params: IRTParams = question.irt
      ? { a: question.irt.a, b: question.irt.b, c: question.irt.c }
      : { a: 1.0, b: difficultyToB(question.difficulty), c: 0.2 }

    // Build response history for MAP estimation
    const allResponses: Response[] = []
    for (const item of session.items) {
      if (item.selectedOpt === null) continue
      const q = await prisma.question.findUnique({ where: { id: item.questionId }, include: { irt: true } })
      if (!q) continue
      const p: IRTParams = q.irt ? { a: q.irt.a, b: q.irt.b, c: q.irt.c }
        : { a: 1.0, b: difficultyToB(q.difficulty), c: 0.2 }
      allResponses.push({ params: p, correct: item.isCorrect ?? false })
    }
    // Add current answer
    allResponses.push({ params, correct: isCorrect })

    // Estimate new theta
    const mapResult = estimateMAP(allResponses, session.thetaStart, 1.0)

    // Update current item
    await prisma.adaptiveSessionItem.update({
      where: { id: currentItem.id },
      data: {
        selectedOpt: selectedOpt.toUpperCase(),
        isCorrect,
        timeSpentSec,
        thetaAfter: mapResult.theta,
        seAfter: mapResult.se,
        answeredAt: new Date(),
      },
    })

    // Also save in UserAnswer for global stats
    await prisma.userAnswer.create({
      data: { userId: payload.sub, questionId: currentItem.questionId, selectedOpt: selectedOpt.toUpperCase(), isCorrect, timeSpentSec },
    })

    // Update session correct count
    const newCorrectCount = session.correctCount + (isCorrect ? 1 : 0)
    const answeredCount = session.items.filter(i => i.selectedOpt !== null).length + 1

    // Check if session is complete
    if (answeredCount >= session.totalItems) {
      // Finish session
      await prisma.adaptiveSession.update({
        where: { id: sessionId },
        data: { status: 'FINISHED', thetaEnd: mapResult.theta, seEnd: mapResult.se, correctCount: newCorrectCount, finishedAt: new Date() },
      })

      // Update user theta
      await prisma.userTheta.upsert({
        where: { userId_specialtyId: { userId: payload.sub, specialtyId: session.specialtyId ?? 'GLOBAL' } },
        create: { userId: payload.sub, specialtyId: session.specialtyId ?? 'GLOBAL', theta: mapResult.theta, se: mapResult.se, nAnswers: answeredCount },
        update: { theta: mapResult.theta, se: mapResult.se, nAnswers: { increment: answeredCount } },
      })

      return reply.send({
        finished: true,
        result: {
          thetaStart: session.thetaStart, thetaEnd: mapResult.theta,
          seStart: session.seStart, seEnd: mapResult.se,
          correct: newCorrectCount, total: session.totalItems,
          accuracy: Math.round((newCorrectCount / session.totalItems) * 100),
          label: thetaToLabel(mapResult.theta),
          percentile: thetaToPercentile(mapResult.theta),
        },
        answer: { isCorrect, correctOption: question.correctOption },
      })
    }

    // Select next item
    await prisma.adaptiveSession.update({
      where: { id: sessionId },
      data: { correctCount: newCorrectCount },
    })

    const pool = await loadItemPool(session.specialtyId)
    const answeredIds = new Set(session.items.map(i => i.questionId))
    answeredIds.add(currentItem.questionId)
    const nextPoolItem = selectNextItem(mapResult.theta, pool, answeredIds)

    if (!nextPoolItem) {
      // No more items available — finish early
      await prisma.adaptiveSession.update({
        where: { id: sessionId },
        data: { status: 'FINISHED', thetaEnd: mapResult.theta, seEnd: mapResult.se, totalItems: answeredCount, finishedAt: new Date() },
      })
      await prisma.userTheta.upsert({
        where: { userId_specialtyId: { userId: payload.sub, specialtyId: session.specialtyId ?? 'GLOBAL' } },
        create: { userId: payload.sub, specialtyId: session.specialtyId ?? 'GLOBAL', theta: mapResult.theta, se: mapResult.se, nAnswers: answeredCount },
        update: { theta: mapResult.theta, se: mapResult.se, nAnswers: { increment: answeredCount } },
      })
      return reply.send({ finished: true, result: { thetaStart: session.thetaStart, thetaEnd: mapResult.theta, seStart: session.seStart, seEnd: mapResult.se, correct: newCorrectCount, total: answeredCount, accuracy: Math.round((newCorrectCount / answeredCount) * 100), label: thetaToLabel(mapResult.theta), percentile: thetaToPercentile(mapResult.theta) }, answer: { isCorrect, correctOption: question.correctOption } })
    }

    // Create next session item
    const nextItem = await prisma.adaptiveSessionItem.create({
      data: {
        sessionId, questionId: nextPoolItem.questionId, order: answeredCount,
        thetaBefore: mapResult.theta, seBefore: mapResult.se,
        fisherInfo: fisherInformation(mapResult.theta, nextPoolItem.params),
      },
    })

    const nextQuestion = await loadFullQuestion(nextPoolItem.questionId, payload.sub)

    return reply.send({
      finished: false,
      currentIndex: answeredCount,
      currentItem: { sessionItemId: nextItem.id, question: nextQuestion },
      theta: { value: mapResult.theta, se: mapResult.se, label: thetaToLabel(mapResult.theta), percentile: thetaToPercentile(mapResult.theta) },
      answer: { isCorrect, correctOption: question.correctOption },
    })
  })

  // ── PATCH /api/adaptive/:sessionId/finish ─────────────────────────────
  app.patch('/:sessionId/finish', async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { sessionId } = request.params as { sessionId: string }

    const session = await prisma.adaptiveSession.findUnique({
      where: { id: sessionId },
      include: { items: true },
    })
    if (!session || session.userId !== payload.sub) return reply.code(404).send({ error: 'Sessão não encontrada' })
    if (session.status === 'FINISHED') return reply.send({ session })

    const answeredItems = session.items.filter(i => i.selectedOpt !== null)
    const lastAnswered = answeredItems[answeredItems.length - 1]
    const thetaEnd = lastAnswered?.thetaAfter ?? session.thetaStart
    const seEnd = lastAnswered?.seAfter ?? session.seStart

    await prisma.adaptiveSession.update({
      where: { id: sessionId },
      data: { status: 'FINISHED', thetaEnd, seEnd, totalItems: answeredItems.length, finishedAt: new Date() },
    })

    await prisma.userTheta.upsert({
      where: { userId_specialtyId: { userId: payload.sub, specialtyId: session.specialtyId ?? 'GLOBAL' } },
      create: { userId: payload.sub, specialtyId: session.specialtyId ?? 'GLOBAL', theta: thetaEnd, se: seEnd, nAnswers: answeredItems.length },
      update: { theta: thetaEnd, se: seEnd, nAnswers: { increment: answeredItems.length } },
    })

    return reply.send({
      result: {
        thetaStart: session.thetaStart, thetaEnd,
        seStart: session.seStart, seEnd,
        correct: session.correctCount, total: answeredItems.length,
        accuracy: answeredItems.length > 0 ? Math.round((session.correctCount / answeredItems.length) * 100) : 0,
        label: thetaToLabel(thetaEnd), percentile: thetaToPercentile(thetaEnd),
      },
    })
  })

  // ── GET /api/adaptive/history ─────────────────────────────────────────
  app.get('/history', async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }

    const sessions = await prisma.adaptiveSession.findMany({
      where: { userId: payload.sub },
      orderBy: { startedAt: 'desc' },
      take: 20,
      select: {
        id: true, specialtyId: true, thetaStart: true, thetaEnd: true,
        seStart: true, seEnd: true, totalItems: true, correctCount: true,
        status: true, startedAt: true, finishedAt: true,
      },
    })

    return reply.send({
      sessions: sessions.map(s => ({
        ...s,
        accuracy: s.totalItems > 0 ? Math.round((s.correctCount / s.totalItems) * 100) : 0,
        labelEnd: s.thetaEnd != null ? thetaToLabel(s.thetaEnd) : null,
      })),
    })
  })
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function loadItemPool(specialtyId: string | null): Promise<PoolItem[]> {
  const where: Record<string, unknown> = { isPublished: true }
  if (specialtyId) {
    // Include child specialties
    const allIds = [specialtyId]
    let toExpand = [specialtyId]
    while (toExpand.length > 0) {
      const children = await prisma.specialty.findMany({ where: { parentId: { in: toExpand } }, select: { id: true } })
      const childIds = children.map(c => c.id)
      allIds.push(...childIds)
      toExpand = childIds
    }
    where.specialtyId = { in: allIds }
  }

  const questions = await prisma.question.findMany({
    where: where as any,
    select: { id: true, difficulty: true, irt: true },
  })

  return questions.map(q => ({
    questionId: q.id,
    params: q.irt
      ? { a: q.irt.a, b: q.irt.b, c: q.irt.c }
      : { a: 1.0, b: difficultyToB(q.difficulty), c: 0.2 },
  }))
}

async function loadFullQuestion(questionId: string, userId: string) {
  const q = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      specialty: { select: { id: true, name: true, parent: { select: { id: true, name: true } } } },
      institution: { select: { id: true, name: true, acronym: true } },
      images: { orderBy: { order: 'asc' } },
      bookmarks: { where: { userId }, select: { id: true } },
    },
  })

  if (!q) return null

  return {
    ...q,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    isBookmarked: (q.bookmarks?.length ?? 0) > 0,
  }
}
