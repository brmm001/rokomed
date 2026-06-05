import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireRole } from '../middleware/auth'

const questionSchema = z.object({
  year:          z.number().optional(),
  statement:     z.string().min(10),
  options:       z.array(z.object({ letter: z.string().length(1), text: z.string().min(1) })).min(2),
  correctOption: z.string().length(1),
  explanation:   z.string().optional(),
  difficulty:    z.enum(['FACIL', 'MEDIO', 'DIFICIL']).default('MEDIO'),
  specialtyId:   z.string().optional(),
  institutionId: z.string().optional(),
  isPublished:   z.boolean().default(false),
})

export default async function adminRoutes(app: FastifyInstance) {
  const isAdmin = requireRole('ADMIN', 'SUPERADMIN')

  // ── Questões ─────────────────────────────────────────────────────────────

  // GET /api/admin/questions — todas as questões (incluindo não publicadas)
  app.get('/questions', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { page = '1', limit = '20' } = request.query as { page?: string; limit?: string }
    const p = parseInt(page), l = parseInt(limit)

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        skip: (p - 1) * l, take: l,
        orderBy: { createdAt: 'desc' },
        include: {
          specialty:   { select: { name: true } },
          institution: { select: { name: true, acronym: true } },
        },
      }),
      prisma.question.count(),
    ])

    return reply.send({ data: questions, total, page: p, totalPages: Math.ceil(total / l) })
  })

  // POST /api/admin/questions — criar questão
  app.post('/questions', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const parsed  = questionSchema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message })

    const question = await prisma.question.create({
      data: {
        ...parsed.data,
        options: JSON.stringify(parsed.data.options),
        createdById: payload.sub,
      },
    })

    await prisma.adminLog.create({
      data: { adminId: payload.sub, action: 'CREATE_QUESTION', target: question.id },
    })

    return reply.code(201).send({ question })
  })

  // PUT /api/admin/questions/:id — editar questão
  app.put('/questions/:id', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id }  = request.params as { id: string }
    const parsed  = questionSchema.partial().safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message })

    const updateData: any = { ...parsed.data }
    if (parsed.data.options) {
      updateData.options = JSON.stringify(parsed.data.options)
    }
    const question = await prisma.question.update({ where: { id }, data: updateData })

    await prisma.adminLog.create({
      data: { adminId: payload.sub, action: 'UPDATE_QUESTION', target: id },
    })

    return reply.send({ question })
  })

  // DELETE /api/admin/questions/:id
  app.delete('/questions/:id', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id }  = request.params as { id: string }

    await prisma.question.delete({ where: { id } })

    await prisma.adminLog.create({
      data: { adminId: payload.sub, action: 'DELETE_QUESTION', target: id },
    })

    return reply.send({ deleted: true })
  })

  // ── Usuários ──────────────────────────────────────────────────────────────

  // GET /api/admin/users
  app.get('/users', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { page = '1', search = '' } = request.query as { page?: string; search?: string }
    const p = parseInt(page)

    const where = search ? {
      OR: [
        { name:  { contains: search } },
        { email: { contains: search } },
      ],
    } : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip: (p - 1) * 20, take: 20,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, plan: true, isBanned: true, createdAt: true, xp: true, streak: true },
      }),
      prisma.user.count({ where }),
    ])

    return reply.send({ data: users, total, page: p, totalPages: Math.ceil(total / 20) })
  })

  // PATCH /api/admin/users/:id/ban — banir/desbanir
  app.patch('/users/:id/ban', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload    = request.user as { sub: string }
    const { id }     = request.params as { id: string }
    const { banned } = request.body as { banned: boolean }

    const user = await prisma.user.update({ where: { id }, data: { isBanned: banned }, select: { id: true, isBanned: true } })

    await prisma.adminLog.create({
      data: { adminId: payload.sub, action: banned ? 'BAN_USER' : 'UNBAN_USER', target: id },
    })

    return reply.send({ user })
  })

  // PATCH /api/admin/users/:id/role — promover role
  app.patch('/users/:id/role', { preHandler: [requireRole('SUPERADMIN')] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id }  = request.params as { id: string }
    const { role } = request.body as { role: string }

    const user = await prisma.user.update({
      where: { id }, data: { role: role as 'ALUNO' | 'PROFESSOR' | 'ADMIN' | 'SUPERADMIN' },
      select: { id: true, role: true },
    })

    await prisma.adminLog.create({
      data: { adminId: payload.sub, action: 'UPDATE_ROLE', target: id, details: JSON.stringify({ role }) },
    })

    return reply.send({ user })
  })

  // ── Stats ─────────────────────────────────────────────────────────────────

  // GET /api/admin/stats
  app.get('/stats', { preHandler: [isAdmin] }, async (_request, reply) => {
    const today = new Date(); today.setHours(0, 0, 0, 0)

    const [totalQuestions, totalUsers, totalAnswers, usersToday, flaggedQuestions, trialAbuse] = await Promise.all([
      prisma.question.count(),
      prisma.user.count(),
      prisma.userAnswer.count(),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.question.count({ where: { flagCount: { gte: 3 } } }),
      prisma.trialIp.groupBy({ by: ['ip'], having: { ip: { _count: { gte: 3 } } }, _count: { ip: true } }),
    ])

    return reply.send({ totalQuestions, totalUsers, totalAnswers, usersToday, flaggedQuestions, suspiciousIps: trialAbuse.length })
  })

  // GET /api/admin/logs
  app.get('/logs', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { page = '1' } = request.query as { page?: string }
    const p = parseInt(page)

    const logs = await prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (p - 1) * 50, take: 50,
      include: { admin: { select: { name: true, email: true } } },
    })

    return reply.send({ data: logs })
  })

  // ── Especialidades e Instituições ─────────────────────────────────────────

  // GET /api/admin/specialties
  app.get('/specialties', { preHandler: [isAdmin] }, async (_request, reply) => {
    const specialties = await prisma.specialty.findMany({ orderBy: { name: 'asc' } })
    return reply.send({ data: specialties })
  })

  // POST /api/admin/specialties
  app.post('/specialties', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { name, slug, description, parentId } = request.body as { name: string; slug: string; description?: string; parentId?: string }
    const specialty = await prisma.specialty.create({ data: { name, slug, description, parentId } })
    return reply.code(201).send({ specialty })
  })

  // GET /api/admin/institutions
  app.get('/institutions', { preHandler: [isAdmin] }, async (_request, reply) => {
    const institutions = await prisma.institution.findMany({ orderBy: { acronym: 'asc' } })
    return reply.send({ data: institutions })
  })

  // POST /api/admin/institutions
  app.post('/institutions', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { name, acronym, city, state } = request.body as { name: string; acronym: string; city?: string; state?: string }
    const institution = await prisma.institution.create({ data: { name, acronym, city, state } })
    return reply.code(201).send({ institution })
  })

  // ── Abandoned Checkouts ──────────────────────────────────────────────────
  app.get('/abandoned-checkouts', { preHandler: [isAdmin] }, async (_request, reply) => {
    // Retorna usuários cujo plano é FREE e não têm assinaturas nem pagamentos aprovados recentes
    // Para simplificar, pegaremos usuários FREE criados nos últimos 7 dias.
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const leads = await prisma.user.findMany({
      where: {
        plan: 'FREE',
        createdAt: { gte: sevenDaysAgo }
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        payments: {
          select: { status: true, plan: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    return reply.send({ data: leads })
  })

  // ── Support Tickets ────────────────────────────────────────────────────────
  app.get('/support/tickets', { preHandler: [isAdmin] }, async (_request, reply) => {
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      }
    })
    return reply.send({ data: tickets })
  })

  app.get('/support/tickets/:id', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { name: true, role: true } } }
        }
      }
    })
    if (!ticket) return reply.code(404).send({ error: 'Not found' })
    return reply.send({ ticket })
  })

  app.post('/support/tickets/:id/messages', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id } = request.params as { id: string }
    const schema = z.object({ content: z.string().min(1) })
    const parsed = schema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message })

    const message = await prisma.supportMessage.create({
      data: {
        ticketId: id,
        senderId: payload.sub,
        content: parsed.data.content
      }
    })
    
    await prisma.supportTicket.update({
      where: { id },
      data: { updatedAt: new Date(), status: 'OPEN' } // ou algo similar
    })

    return reply.send({ message })
  })

  app.patch('/support/tickets/:id/status', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const { status } = request.body as { status: string }
    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: { status }
    })
    return reply.send({ ticket })
  })

  // ── Visitor Clicks ─────────────────────────────────────────────────────────
  app.get('/clicks', { preHandler: [isAdmin] }, async (_request, reply) => {
    const clicks = await prisma.visitorClick.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return reply.send({ data: clicks })
  })

  // ── Lessons CRUD ──────────────────────────────────────────────────────────
  const lessonSchema = z.object({
    title:       z.string().min(2),
    description: z.string().optional().nullable(),
    videoUrl:    z.string().url(),
    durationMin: z.number().optional().nullable(),
    specialtyId: z.string().optional().nullable(),
  })

  // POST /api/admin/lessons — criar aula
  app.post('/lessons', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const parsed  = lessonSchema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message })

    const lesson = await prisma.lesson.create({
      data: {
        title:       parsed.data.title,
        description: parsed.data.description || null,
        videoUrl:    parsed.data.videoUrl,
        durationMin: parsed.data.durationMin || null,
        specialtyId: parsed.data.specialtyId || null,
      }
    })

    await prisma.adminLog.create({
      data: { adminId: payload.sub, action: 'CREATE_LESSON', target: lesson.id },
    })

    return reply.code(201).send({ lesson })
  })

  // PUT /api/admin/lessons/:id — editar aula
  app.put('/lessons/:id', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id }  = request.params as { id: string }
    const parsed  = lessonSchema.partial().safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message })

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        title:       parsed.data.title,
        description: parsed.data.description === undefined ? undefined : parsed.data.description,
        videoUrl:    parsed.data.videoUrl,
        durationMin: parsed.data.durationMin === undefined ? undefined : parsed.data.durationMin,
        specialtyId: parsed.data.specialtyId === undefined ? undefined : parsed.data.specialtyId,
      }
    })

    await prisma.adminLog.create({
      data: { adminId: payload.sub, action: 'UPDATE_LESSON', target: id },
    })

    return reply.send({ lesson })
  })

  // DELETE /api/admin/lessons/:id — deletar aula
  app.delete('/lessons/:id', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id }  = request.params as { id: string }

    await prisma.lesson.delete({ where: { id } })

    await prisma.adminLog.create({
      data: { adminId: payload.sub, action: 'DELETE_LESSON', target: id },
    })

    return reply.send({ deleted: true })
  })

  // ── Priorities CRUD (Admin) ──────────────────────────────────────────────
  app.get('/priorities', { preHandler: [isAdmin] }, async (_request, reply) => {
    const priorities = await prisma.institutionPriority.findMany({
      include: {
        institution: { select: { acronym: true, name: true } },
        specialty: { select: { name: true } }
      }
    })
    return reply.send({ data: priorities })
  })

  app.post('/priorities', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const schema = z.object({
      institutionId: z.string(),
      specialtyId: z.string(),
      priority: z.enum(['MAXIMA', 'ALTA', 'MEDIA', 'BAIXA']),
    })

    const parsed = schema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message })

    const { institutionId, specialtyId, priority } = parsed.data

    const record = await prisma.institutionPriority.upsert({
      where: {
        institutionId_specialtyId: {
          institutionId,
          specialtyId
        }
      },
      update: { priority },
      create: { institutionId, specialtyId, priority }
    })

    await prisma.adminLog.create({
      data: {
        adminId: payload.sub,
        action: 'UPDATE_PRIORITY',
        target: record.id,
        details: JSON.stringify({ institutionId, specialtyId, priority })
      }
    })

    return reply.send({ success: true, priority: record })
  })
}


