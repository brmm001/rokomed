import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

export default async function lessonRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth)

  // GET /api/lessons — lista todas as aulas agrupadas por especialidade
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { plan: string; role: string }
    const isPro = payload.plan === 'PRO' || payload.plan === 'GRUPO' || ['ADMIN', 'SUPERADMIN'].includes(payload.role)

    const specialties = await prisma.specialty.findMany({
      orderBy: { name: 'asc' },
      include: {
        lessons: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    // Filtra especialidades que têm pelo menos 1 aula
    const data = specialties
      .filter(s => s.lessons.length > 0)
      .map(s => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        lessons: s.lessons.map(l => ({
          id: l.id,
          title: l.title,
          description: l.description,
          durationMin: l.durationMin,
          locked: !isPro,
          videoUrl: isPro ? l.videoUrl : null, // Oculta a URL do vídeo de usuários FREE
          createdAt: l.createdAt
        }))
      }))

    return reply.send({ data })
  })

  // GET /api/lessons/:id — detalhes de uma aula específica (Bloqueado para FREE)
  app.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { plan: string; role: string }
    const isPro = payload.plan === 'PRO' || payload.plan === 'GRUPO' || ['ADMIN', 'SUPERADMIN'].includes(payload.role)

    if (!isPro) {
      return reply.code(402).send({ error: 'Recurso exclusivo para assinantes Pro', upgrade: true })
    }

    const { id } = request.params as { id: string }
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { specialty: { select: { id: true, name: true } } }
    })

    if (!lesson) {
      return reply.code(404).send({ error: 'Aula não encontrada' })
    }

    return reply.send({ lesson })
  })
}
