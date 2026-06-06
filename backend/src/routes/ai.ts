import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { z } from 'zod'

// Helper function to check and reset user AI credits
async function checkAndResetCredits(userId: string, currentCreditsUsed: number, lastReset: Date) {
  const now = new Date()
  
  // Check if we entered a different calendar month or a different year
  const isDifferentMonth = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()
  
  if (isDifferentMonth) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        aiCreditsUsed: 0,
        lastCreditsReset: now
      }
    })
    return 0
  }
  
  return currentCreditsUsed
}

export default async function aiRoutes(app: FastifyInstance) {
  
  // GET /api/ai/history — recupera histórico e limites de créditos
  app.get('/history', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const userId = payload.sub

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, aiCreditsUsed: true, lastCreditsReset: true }
    })

    if (!user) return reply.code(404).send({ error: 'Usuário não encontrado' })

    const activeCreditsUsed = await checkAndResetCredits(userId, user.aiCreditsUsed, user.lastCreditsReset)
    const limit = user.plan === 'FREE' ? 5 : 50

    const messages = await prisma.aiMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, role: true, content: true, createdAt: true }
    })

    return reply.send({
      creditsUsed: activeCreditsUsed,
      creditsLimit: limit,
      history: messages
    })
  })

  // POST /api/ai/ask — envia pergunta ao Dr. André
  app.post('/ask', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const userId = payload.sub

    const bodySchema = z.object({
      content: z.string().min(1).max(2000)
    })

    const parsed = bodySchema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message })
    const { content } = parsed.data

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        plan: true,
        xp: true,
        streak: true,
        aiCreditsUsed: true,
        lastCreditsReset: true,
        targetInstitutionId: true,
        targetSpecialtyId: true,
        examDate: true
      }
    })

    if (!user) return reply.code(404).send({ error: 'Usuário não encontrado' })

    // Check credits reset
    const activeCreditsUsed = await checkAndResetCredits(userId, user.aiCreditsUsed, user.lastCreditsReset)
    const limit = user.plan === 'FREE' ? 5 : 50

    if (activeCreditsUsed >= limit) {
      return reply.code(403).send({
        error: `Você esgotou seus créditos de IA para este mês (${activeCreditsUsed}/${limit}). Faça upgrade para o plano PRO para ter direito a 50 mensagens mensais.`
      })
    }

    if (!process.env.OPENAI_API_KEY) {
      return reply.code(500).send({ error: 'A API de IA não está configurada no servidor (OPENAI_API_KEY ausente).' })
    }

    // 1. Gather Performance Stats
    const [totalAnswered, correctAnswered] = await Promise.all([
      prisma.userAnswer.count({ where: { userId } }),
      prisma.userAnswer.count({ where: { userId, isCorrect: true } })
    ])
    const overallAccuracy = totalAnswered > 0 ? Math.round((correctAnswered / totalAnswered) * 100) : 0

    // 2. Fetch Large Area performance
    const specialties = await prisma.specialty.findMany({
      where: { isGrandeArea: true },
      select: { id: true, name: true }
    })

    const subjectsPerformance = []
    for (const spec of specialties) {
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

      const [totalSpec, correctSpec] = await Promise.all([
        prisma.userAnswer.count({
          where: { userId, question: { specialtyId: { in: allIds } } }
        }),
        prisma.userAnswer.count({
          where: { userId, isCorrect: true, question: { specialtyId: { in: allIds } } }
        })
      ])

      if (totalSpec > 0) {
        const acc = Math.round((correctSpec / totalSpec) * 100)
        subjectsPerformance.push(`${spec.name}: ${acc}% de acertos (${totalSpec} respondidas)`)
      } else {
        subjectsPerformance.push(`${spec.name}: Sem dados de estudo (não iniciado)`)
      }
    }

    let targetInstAcronym = ''
    if (user.targetInstitutionId) {
      const inst = await prisma.institution.findUnique({
        where: { id: user.targetInstitutionId },
        select: { acronym: true }
      })
      if (inst) targetInstAcronym = inst.acronym
    }

    // 3. Compose Prompt Context
    let performanceSummary = `DADOS DO ESTUDANTE:
- Nome: ${user.name}
- Plano: ${user.plan}
- Pontos (XP): ${user.xp}
- Ofensiva (streak): ${user.streak} dias
- Total de Questões Respondidas: ${totalAnswered}
- Acurácia Média Geral: ${overallAccuracy}%
`
    if (user.examDate) {
      performanceSummary += `- Data Prevista da Prova: ${new Date(user.examDate).toLocaleDateString('pt-BR')}\n`
    }
    if (targetInstAcronym) {
      performanceSummary += `- Banca/Instituição Pretendida: ${targetInstAcronym}\n`
    }
    if (user.targetSpecialtyId) {
      performanceSummary += `- Especialidade Pretendida: ${user.targetSpecialtyId}\n`
    }
    performanceSummary += `\nDESEMPENHO POR GRANDE ÁREA:\n` + subjectsPerformance.map(s => `- ${s}`).join('\n')

    const systemPrompt = `Você é o Dr. André, o tutor pessoal de Inteligência Artificial do RokoMed (uma plataforma premium de preparação para provas de Residência Médica no Brasil).
Você fala em português e atua como um mentor acadêmico inteligente, didático e empático.

Aqui estão os dados atualizados de desempenho do aluno para contextualizar seus conselhos:
${performanceSummary}

INSTRUÇÕES DE COMPORTAMENTO:
1. Responda a dúvidas médicas baseando-se em diretrizes científicas atualizadas aplicadas a provas de residência (como SUS, SBC, Febrasgo, SBP, etc.).
2. Faça referências diretas ao desempenho do estudante se ele pedir dicas de estudo ou planejamento. Aconselhe-o a focar nas grandes áreas de menor acurácia.
3. Seja didático, estruture suas explicações médicas de forma clara (use tópicos ou marcações em negrito se ajudar).
4. Mantenha as respostas concisas, focadas e com tom encorajador de mentor. Fale sempre em português do Brasil.`

    // 4. Fetch Message History
    const history = await prisma.aiMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 12
    })

    const openAiMessages = [
      { role: 'system', content: systemPrompt },
      ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content }
    ]

    // 5. Call OpenAI
    try {
      const responseOpenAi = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: openAiMessages,
          temperature: 0.7,
          max_tokens: 800
        })
      })

      if (!responseOpenAi.ok) {
        const errorText = await responseOpenAi.text()
        console.error('OpenAI response error:', errorText)
        return reply.code(502).send({ error: 'Não foi possível obter resposta do tutor. Tente novamente em instantes.' })
      }

      const resJson = (await responseOpenAi.json()) as any
      const answer = resJson.choices?.[0]?.message?.content || 'Não consegui processar a resposta no momento.'

      // Save messages
      await prisma.aiMessage.create({
        data: { userId, role: 'user', content }
      })
      await prisma.aiMessage.create({
        data: { userId, role: 'assistant', content: answer }
      })

      // Increment credits used
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { aiCreditsUsed: { increment: 1 } },
        select: { aiCreditsUsed: true }
      })

      return reply.send({
        answer,
        creditsUsed: updatedUser.aiCreditsUsed,
        creditsLimit: limit
      })

    } catch (err) {
      console.error('API tutor crash:', err)
      return reply.code(500).send({ error: 'Erro interno ao conectar ao serviço de inteligência artificial.' })
    }
  })

  // POST /api/ai/clear — apaga histórico de mensagens
  app.post('/clear', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const userId = payload.sub

    await prisma.aiMessage.deleteMany({
      where: { userId }
    })

    return reply.send({ success: true })
  })
}
