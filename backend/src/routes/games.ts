import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import crypto from 'crypto'

export default async function gameRoutes(app: FastifyInstance) {
  
  // ── Duelo Médico ──────────────────────────────────────────────────────────
  app.get('/duel', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const count = await prisma.question.count({ where: { isPublished: true } })
      if (count < 5) return reply.code(400).send({ error: 'Quantidade insuficiente de questões no banco' })

      const skip = Math.max(0, Math.floor(Math.random() * (count - 5)))
      const questions = await prisma.question.findMany({
        where: { isPublished: true },
        skip,
        take: 5,
        include: {
          specialty: { select: { id: true, name: true } },
          institution: { select: { id: true, name: true, acronym: true } },
        }
      })

      const data = questions.map(q => ({
        id: q.id,
        statement: q.statement,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        correctOption: q.correctOption,
        explanation: q.explanation,
        specialty: q.specialty,
        institution: q.institution,
        year: q.year
      })).sort(() => 0.5 - Math.random()) // Embaralha as 5 questões

      return reply.send({ questions: data })
    } catch (err: any) {
      return reply.code(500).send({ error: err.message })
    }
  })

  app.post('/duel/result', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const schema = z.object({
      won: z.boolean(),
      isTie: z.boolean().optional(),
      score: z.number()
    })

    const parsed = schema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: 'Dados inválidos' })

    const { won, isTie, score } = parsed.data
    const todayStr = new Date().toISOString().slice(0, 10)

    // Determina XP ganho
    let xpGain = 10 // derrota
    if (won) xpGain = 50
    else if (isTie) xpGain = 25

    try {
      // Cria registro de GamePlay
      await prisma.gamePlay.create({
        data: {
          userId: payload.sub,
          gameType: 'DUEL',
          date: todayStr,
          score,
          isWin: won,
          details: JSON.stringify({ xpGain, isTie })
        }
      })

      // Atualiza XP do usuário
      const user = await prisma.user.update({
        where: { id: payload.sub },
        data: {
          xp: { increment: xpGain }
        },
        select: { xp: true }
      })

      return reply.send({ success: true, xpGain, totalXp: user.xp })
    } catch (err: any) {
      return reply.code(500).send({ error: err.message })
    }
  })

  // ── Rounds (Desafio Diário) ──────────────────────────────────────────────
  app.get('/rounds/questions', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10)
      const allIds = await prisma.question.findMany({
        where: { isPublished: true },
        select: { id: true }
      })

      if (allIds.length < 12) return reply.code(400).send({ error: 'Quantidade insuficiente de questões no banco' })

      // Seed determinitisco baseado na data
      const selectedIds = allIds
        .map(q => ({
          id: q.id,
          hash: crypto.createHash('md5').update(todayStr + q.id).digest('hex')
        }))
        .sort((a, b) => a.hash.localeCompare(b.hash))
        .slice(0, 12)
        .map(x => x.id)

      const questions = await prisma.question.findMany({
        where: { id: { in: selectedIds } },
        include: {
          specialty: { select: { id: true, name: true } },
          institution: { select: { id: true, name: true, acronym: true } },
        }
      })

      // Ordena de forma determinística
      const data = selectedIds.map(id => {
        const q = questions.find(x => x.id === id)!
        return {
          id: q.id,
          statement: q.statement,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
          correctOption: q.correctOption,
          explanation: q.explanation,
          specialty: q.specialty,
          institution: q.institution,
          year: q.year
        }
      })

      return reply.send({ questions: data })
    } catch (err: any) {
      return reply.code(500).send({ error: err.message })
    }
  })

  app.post('/rounds/submit', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const schema = z.object({
      score: z.number().min(0).max(12),
      livesLeft: z.number().min(0).max(3),
      timeSpent: z.number()
    })

    const parsed = schema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: 'Dados inválidos' })

    const { score, livesLeft, timeSpent } = parsed.data
    const todayStr = new Date().toISOString().slice(0, 10)

    // Calcula ganho de XP
    let xpGain = score * 10 + livesLeft * 10
    if (score === 12) xpGain += 50 // bônus de gabarito

    try {
      // Impede envios duplicados no mesmo dia
      const existing = await prisma.gamePlay.findFirst({
        where: {
          userId: payload.sub,
          gameType: 'ROUNDS',
          date: todayStr
        }
      })

      if (existing) {
        return reply.code(400).send({ error: 'Você já completou o Rounds de hoje.' })
      }

      await prisma.gamePlay.create({
        data: {
          userId: payload.sub,
          gameType: 'ROUNDS',
          date: todayStr,
          score,
          isWin: score >= 10,
          details: JSON.stringify({ livesLeft, timeSpent, xpGain })
        }
      })

      const user = await prisma.user.update({
        where: { id: payload.sub },
        data: {
          xp: { increment: xpGain }
        },
        select: { xp: true }
      })

      return reply.send({ success: true, xpGain, totalXp: user.xp })
    } catch (err: any) {
      return reply.code(500).send({ error: err.message })
    }
  })

  app.get('/rounds/leaderboard', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10)
      const plays = await prisma.gamePlay.findMany({
        where: {
          gameType: 'ROUNDS',
          date: todayStr
        },
        include: {
          user: {
            select: {
              name: true,
              picture: true,
              plan: true
            }
          }
        },
        take: 30
      })

      const leaderboard = plays.map(p => {
        let livesLeft = 0
        let timeSpent = 9999
        try {
          if (p.details) {
            const parsed = JSON.parse(p.details)
            livesLeft = parsed.livesLeft ?? 0
            timeSpent = parsed.timeSpent ?? 9999
          }
        } catch {}

        return {
          id: p.id,
          name: p.user.name,
          picture: p.user.picture,
          plan: p.user.plan,
          score: p.score,
          livesLeft,
          timeSpent
        }
      })

      // Ordena: Score decrescente, Vidas restantes decrescente, Tempo crescente
      leaderboard.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        if (b.livesLeft !== a.livesLeft) return b.livesLeft - a.livesLeft
        return a.timeSpent - b.timeSpent
      })

      return reply.send({ leaderboard: leaderboard.slice(0, 10) })
    } catch (err: any) {
      return reply.code(500).send({ error: err.message })
    }
  })

  // ── Pista Clínica ─────────────────────────────────────────────────────────
  app.get('/pista/question', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10)
      const questions = await prisma.question.findMany({
        where: {
          isPublished: true,
          reasoningLine: { not: null }
        },
        select: { id: true }
      })

      if (questions.length === 0) return reply.code(404).send({ error: 'Nenhum caso clínico cadastrado para pista' })

      const selected = questions
        .map(q => ({
          id: q.id,
          hash: crypto.createHash('md5').update('pista' + todayStr + q.id).digest('hex')
        }))
        .sort((a, b) => a.hash.localeCompare(b.hash))[0]

      const q = await prisma.question.findUnique({
        where: { id: selected.id },
        include: {
          specialty: { select: { id: true, name: true } },
          institution: { select: { id: true, name: true, acronym: true } }
        }
      })

      if (!q) return reply.code(404).send({ error: 'Questão não encontrada' })

      let reasoningLine: string[] = []
      if (q.reasoningLine) {
        try { reasoningLine = JSON.parse(q.reasoningLine) } catch { reasoningLine = [] }
      }

      return reply.send({
        id: q.id,
        statement: q.statement,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        correctOption: q.correctOption,
        explanation: q.explanation,
        specialty: q.specialty,
        institution: q.institution,
        year: q.year,
        reasoningLine
      })
    } catch (err: any) {
      return reply.code(500).send({ error: err.message })
    }
  })

  app.post('/pista/submit', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const schema = z.object({
      score: z.number(), // Pontos obtidos (ex: baseado em pistas usadas)
      cluesRevealed: z.number().min(0).max(6),
      isWin: z.boolean()
    })

    const parsed = schema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: 'Dados inválidos' })

    const { score, cluesRevealed, isWin } = parsed.data
    const todayStr = new Date().toISOString().slice(0, 10)

    // Calcula XP
    let xpGain = 5 // Tentou
    if (isWin) {
      xpGain = 30 + (6 - cluesRevealed) * 5
    }

    try {
      const existing = await prisma.gamePlay.findFirst({
        where: {
          userId: payload.sub,
          gameType: 'PISTA',
          date: todayStr
        }
      })

      if (existing) {
        return reply.code(400).send({ error: 'Você já realizou a Pista Clínica de hoje.' })
      }

      await prisma.gamePlay.create({
        data: {
          userId: payload.sub,
          gameType: 'PISTA',
          date: todayStr,
          score,
          isWin,
          details: JSON.stringify({ cluesRevealed, xpGain })
        }
      })

      const user = await prisma.user.update({
        where: { id: payload.sub },
        data: {
          xp: { increment: xpGain }
        },
        select: { xp: true }
      })

      return reply.send({ success: true, xpGain, totalXp: user.xp })
    } catch (err: any) {
      return reply.code(500).send({ error: err.message })
    }
  })

  // ── Stats gerais de jogos do usuário ──────────────────────────────────────
  app.get('/stats', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    try {
      const plays = await prisma.gamePlay.findMany({
        where: { userId: payload.sub }
      })

      const todayStr = new Date().toISOString().slice(0, 10)
      const completedRounds = plays.some(p => p.gameType === 'ROUNDS' && p.date === todayStr)
      const completedPista = plays.some(p => p.gameType === 'PISTA' && p.date === todayStr)

      const duelWins = plays.filter(p => p.gameType === 'DUEL' && p.isWin).length
      const totalDuels = plays.filter(p => p.gameType === 'DUEL').length
      
      const totalPoints = plays.reduce((acc, p) => acc + p.score, 0)

      return reply.send({
        totalPoints,
        completedRounds,
        completedPista,
        duelWins,
        totalDuels,
      })
    } catch (err: any) {
      return reply.code(500).send({ error: err.message })
    }
  })
}
