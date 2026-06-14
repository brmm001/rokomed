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

  // GET /api/lessons/:id/comments — listar comentários da aula
  app.get('/:id/comments', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: lessonId } = request.params as { id: string }
    const comments = await prisma.lessonComment.findMany({
      where: {
        lessonId,
        parentId: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            picture: true,
            role: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                picture: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return reply.send({ data: comments })
  })

  // POST /api/lessons/:id/comments — criar comentário ou resposta
  app.post('/:id/comments', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: lessonId } = request.params as { id: string }
    const { text, parentId } = request.body as { text: string; parentId?: string }

    if (!text || text.trim().length === 0) {
      return reply.code(400).send({ error: 'O texto do comentário é obrigatório' })
    }

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
    if (!lesson) {
      return reply.code(404).send({ error: 'Aula não encontrada' })
    }

    if (parentId) {
      const parent = await prisma.lessonComment.findUnique({ where: { id: parentId } })
      if (!parent) {
        return reply.code(404).send({ error: 'Comentário original não encontrado' })
      }
    }

    const payload = request.user as { sub: string; role: string }
    const isAdminReply = ['ADMIN', 'SUPERADMIN', 'PROFESSOR'].includes(payload.role)

    const comment = await prisma.lessonComment.create({
      data: {
        lessonId,
        userId: payload.sub,
        text: text.trim(),
        parentId: parentId || null,
        isAdminReply
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            picture: true,
            role: true
          }
        }
      }
    })

    return reply.code(201).send({ comment })
  })

  // DELETE /api/lessons/comments/:commentId — deletar comentário
  app.delete('/comments/:commentId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { commentId } = request.params as { commentId: string }

    const comment = await prisma.lessonComment.findUnique({ where: { id: commentId } })
    if (!comment) {
      return reply.code(404).send({ error: 'Comentário não encontrado' })
    }

    const payload = request.user as { sub: string; role: string }
    const isOwner = comment.userId === payload.sub
    const isAdmin = ['ADMIN', 'SUPERADMIN', 'PROFESSOR'].includes(payload.role)

    if (!isOwner && !isAdmin) {
      return reply.code(403).send({ error: 'Acesso negado: você não tem permissão para deletar este comentário' })
    }

    await prisma.lessonComment.delete({ where: { id: commentId } })
    return reply.send({ success: true })
  })
}

