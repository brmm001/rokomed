import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { probability3PL, thetaToLabel, thetaToPercentile, difficultyToB } from '../lib/irt-engine'
import {
  cusum, monteCarloApproval, brierScore, chiSquaredBias,
  learningCurve, thetaTrajectory, movingAverage,
} from '../lib/stats-engine'

export default async function analyticsRoutes(app: FastifyInstance) {

  // ── GET /api/analytics/overview ───────────────────────────────────────
  app.get('/overview', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const userId = payload.sub

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { examDate: true, cutoffScore: true },
    })

    // Get global theta
    const globalTheta = await prisma.userTheta.findUnique({
      where: { userId_specialtyId: { userId, specialtyId: 'GLOBAL' } },
    })

    const theta = globalTheta?.theta ?? 0
    const se = globalTheta?.se ?? 1.0

    // Recent answers for CUSUM
    const recentAnswers = await prisma.userAnswer.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { isCorrect: true, createdAt: true },
    })

    const totalAnswers = await prisma.userAnswer.count({ where: { userId } })
    const correctAnswers = await prisma.userAnswer.count({ where: { userId, isCorrect: true } })
    const baselineAccuracy = totalAnswers > 0 ? correctAnswers / totalAnswers : 0.5

    // CUSUM
    const cusumSeries = recentAnswers.reverse().map(a => a.isCorrect ? 1 : 0)
    const cusumResult = cusum(cusumSeries, baselineAccuracy)

    // Monte Carlo P(approval)
    let pApproval = null
    let daysToExam = null
    if (user?.examDate && user?.cutoffScore) {
      daysToExam = Math.ceil((new Date(user.examDate).getTime() - Date.now()) / (86400000))
      const mc = monteCarloApproval(theta, se, user.cutoffScore, 100, { mean: 0, sd: 1 }, 5000)
      pApproval = mc.pApproval
    }

    // Brier score (last 50 answers)
    const recentForBrier = await prisma.userAnswer.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { question: { include: { irt: true } } },
    })
    const predictions = recentForBrier.map(a => {
      const params = a.question.irt
        ? { a: a.question.irt.a, b: a.question.irt.b, c: a.question.irt.c }
        : { a: 1.0, b: difficultyToB(a.question.difficulty), c: 0.2 }
      return probability3PL(theta, params)
    })
    const outcomes = recentForBrier.map(a => a.isCorrect ? 1 : 0)
    const brier = brierScore(predictions, outcomes)

    // Chi-squared bias
    const optionCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 }
    const allAnswers = await prisma.userAnswer.findMany({
      where: { userId },
      select: { selectedOpt: true },
    })
    for (const a of allAnswers) {
      if (optionCounts[a.selectedOpt] !== undefined) optionCounts[a.selectedOpt]++
    }
    const chiResult = chiSquaredBias(optionCounts)

    // Adaptive sessions count
    const sessionCount = await prisma.adaptiveSession.count({ where: { userId, status: 'FINISHED' } })

    // Active alerts
    const alerts = await prisma.userAlert.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    return reply.send({
      theta: {
        value: theta, se, label: thetaToLabel(theta),
        percentile: thetaToPercentile(theta),
        nAnswers: globalTheta?.nAnswers ?? 0,
      },
      approval: { probability: pApproval, cutoff: user?.cutoffScore, daysToExam },
      cusum: { stat: cusumResult.stat, alert: cusumResult.alert, changePoint: cusumResult.changePoint },
      brierScore: brier,
      optionBias: chiResult,
      accuracy: { total: totalAnswers, correct: correctAnswers, rate: baselineAccuracy },
      sessionCount,
      alerts,
    })
  })

  // ── GET /api/analytics/theta-history ──────────────────────────────────
  app.get('/theta-history', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }

    const sessions = await prisma.adaptiveSession.findMany({
      where: { userId: payload.sub, status: 'FINISHED' },
      orderBy: { finishedAt: 'asc' },
      select: { thetaEnd: true, seEnd: true, finishedAt: true, specialtyId: true, correctCount: true, totalItems: true },
    })

    const firstDate = sessions[0]?.finishedAt ?? new Date()
    const snapshots = sessions
      .filter(s => s.thetaEnd != null)
      .map(s => ({
        theta: s.thetaEnd!,
        se: s.seEnd!,
        date: s.finishedAt!.toISOString(),
        dayIndex: Math.floor((s.finishedAt!.getTime() - firstDate.getTime()) / 86400000),
        accuracy: s.totalItems > 0 ? Math.round((s.correctCount / s.totalItems) * 100) : 0,
      }))

    const trajectory = thetaTrajectory(snapshots.map(s => ({ theta: s.theta, dayIndex: s.dayIndex })))

    return reply.send({ snapshots, trajectory })
  })

  // ── GET /api/analytics/specialty-radar ─────────────────────────────────
  app.get('/specialty-radar', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }

    const thetas = await prisma.userTheta.findMany({
      where: { userId: payload.sub, NOT: { specialtyId: 'GLOBAL' } },
    })

    // Get specialty names
    const specialtyIds = thetas.map(t => t.specialtyId).filter(Boolean) as string[]
    const specialties = await prisma.specialty.findMany({
      where: { id: { in: specialtyIds } },
      select: { id: true, name: true },
    })

    const nameMap = new Map(specialties.map(s => [s.id, s.name]))

    const data = thetas.map(t => ({
      specialtyId: t.specialtyId,
      name: nameMap.get(t.specialtyId ?? '') ?? 'Geral',
      theta: t.theta,
      se: t.se,
      nAnswers: t.nAnswers,
      label: thetaToLabel(t.theta),
    }))

    return reply.send({ data })
  })

  // ── GET /api/analytics/learning-curve ──────────────────────────────────
  app.get('/learning-curve', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { examDate: true, createdAt: true },
    })

    const answers = await prisma.userAnswer.findMany({
      where: { userId: payload.sub },
      orderBy: { createdAt: 'asc' },
      select: { isCorrect: true, createdAt: true },
    })

    if (answers.length < 10) {
      return reply.send({ message: 'Mínimo 10 respostas necessárias', data: null })
    }

    const startDate = user?.createdAt ?? answers[0].createdAt
    const history = answers.map(a => ({
      day: Math.floor((a.createdAt.getTime() - startDate.getTime()) / 86400000),
      correct: a.isCorrect,
    }))

    const daysToExam = user?.examDate
      ? Math.ceil((new Date(user.examDate).getTime() - Date.now()) / 86400000)
      : 30

    const curve = learningCurve(history, Math.max(daysToExam, 7))

    return reply.send({
      data: {
        beta1: curve.beta1,
        r2: curve.r2,
        trend: curve.beta1 > 0.001 ? 'improving' : curve.beta1 < -0.001 ? 'declining' : 'stable',
        projection: curve.projection,
        totalDataPoints: answers.length,
      },
    })
  })

  // ── GET /api/analytics/weekly-report ───────────────────────────────────
  app.get('/weekly-report', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const userId = payload.sub

    const weekAgo = new Date(Date.now() - 7 * 86400000)
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000)

    // This week stats
    const thisWeekAnswers = await prisma.userAnswer.count({ where: { userId, createdAt: { gte: weekAgo } } })
    const thisWeekCorrect = await prisma.userAnswer.count({ where: { userId, createdAt: { gte: weekAgo }, isCorrect: true } })

    // Last week stats
    const lastWeekAnswers = await prisma.userAnswer.count({ where: { userId, createdAt: { gte: twoWeeksAgo, lt: weekAgo } } })
    const lastWeekCorrect = await prisma.userAnswer.count({ where: { userId, createdAt: { gte: twoWeeksAgo, lt: weekAgo }, isCorrect: true } })

    const thisWeekAcc = thisWeekAnswers > 0 ? thisWeekCorrect / thisWeekAnswers : 0
    const lastWeekAcc = lastWeekAnswers > 0 ? lastWeekCorrect / lastWeekAnswers : 0

    // Sessions this week
    const sessions = await prisma.adaptiveSession.findMany({
      where: { userId, status: 'FINISHED', finishedAt: { gte: weekAgo } },
      select: { thetaStart: true, thetaEnd: true, totalItems: true, correctCount: true },
    })

    // Global theta
    const globalTheta = await prisma.userTheta.findUnique({
      where: { userId_specialtyId: { userId, specialtyId: 'GLOBAL' } },
    })

    // Specialty breakdown
    const thetas = await prisma.userTheta.findMany({
      where: { userId, NOT: { specialtyId: 'GLOBAL' } },
    })
    const specIds = thetas.map(t => t.specialtyId).filter(Boolean) as string[]
    const specs = await prisma.specialty.findMany({ where: { id: { in: specIds } }, select: { id: true, name: true } })
    const specMap = new Map(specs.map(s => [s.id, s.name]))

    const topSpecialties = thetas.sort((a, b) => b.theta - a.theta).slice(0, 3).map(t => ({
      name: specMap.get(t.specialtyId ?? '') ?? 'Geral', theta: t.theta,
    }))
    const weakSpecialties = thetas.sort((a, b) => a.theta - b.theta).slice(0, 3).map(t => ({
      name: specMap.get(t.specialtyId ?? '') ?? 'Geral', theta: t.theta,
    }))

    return reply.send({
      period: `${weekAgo.toLocaleDateString('pt-BR')} – ${new Date().toLocaleDateString('pt-BR')}`,
      theta: { current: globalTheta?.theta ?? 0, se: globalTheta?.se ?? 1 },
      thisWeek: { answers: thisWeekAnswers, correct: thisWeekCorrect, accuracy: Math.round(thisWeekAcc * 100) },
      lastWeek: { answers: lastWeekAnswers, correct: lastWeekCorrect, accuracy: Math.round(lastWeekAcc * 100) },
      change: { accuracy: Math.round((thisWeekAcc - lastWeekAcc) * 100) },
      sessions: { count: sessions.length, totalItems: sessions.reduce((s, x) => s + x.totalItems, 0) },
      topSpecialties,
      weakSpecialties,
    })
  })

  // ── GET /api/analytics/alerts ─────────────────────────────────────────
  app.get('/alerts', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }

    const alerts = await prisma.userAlert.findMany({
      where: { userId: payload.sub },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return reply.send({ alerts })
  })

  // ── PATCH /api/analytics/alerts/:id/read ──────────────────────────────
  app.patch('/alerts/:id/read', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id } = request.params as { id: string }

    await prisma.userAlert.updateMany({
      where: { id, userId: payload.sub },
      data: { isRead: true },
    })

    return reply.send({ success: true })
  })
}
