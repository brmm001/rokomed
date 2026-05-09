import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireRole } from '../middleware/auth'

const leadSchema = z.object({
  type:  z.enum(['AMBASSADOR', 'ATLETICA', 'INSTITUICAO']),
  name:  z.string().min(2),
  email: z.string().email(),
  extra: z.record(z.string(), z.unknown()).optional(),
})

export default async function partnershipsRoutes(app: FastifyInstance) {
  // ── Público ─────────────────────────────────────────────────────────────────

  // POST /api/partnerships/lead — enviado pelos formulários da landing page
  app.post('/lead', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = leadSchema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message })

    const { type, name, email, extra } = parsed.data

    const lead = await prisma.partnershipLead.create({
      data: {
        type,
        name,
        email,
        extra: extra ? JSON.stringify(extra) : null,
      },
    })

    return reply.code(201).send({ ok: true, id: lead.id })
  })

  // ── Admin ────────────────────────────────────────────────────────────────────

  const isAdmin = requireRole('ADMIN', 'SUPERADMIN')

  // GET /api/partnerships/admin/leads
  app.get('/admin/leads', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { type, status, page = '1' } = request.query as {
      type?: string; status?: string; page?: string
    }
    const p = parseInt(page)
    const where: Record<string, unknown> = {}
    if (type)   where.type   = type
    if (status) where.status = status

    const [leads, total] = await Promise.all([
      prisma.partnershipLead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (p - 1) * 30,
        take: 30,
      }),
      prisma.partnershipLead.count({ where }),
    ])

    return reply.send({ data: leads, total, page: p, totalPages: Math.ceil(total / 30) })
  })

  // PATCH /api/partnerships/admin/leads/:id — atualiza status / notes
  app.patch('/admin/leads/:id', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const schema = z.object({
      status: z.enum(['NOVO', 'EM_CONTATO', 'FECHADO', 'RECUSADO']).optional(),
      notes:  z.string().optional(),
    })
    const parsed = schema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message })

    const lead = await prisma.partnershipLead.update({
      where: { id },
      data: parsed.data,
    })
    return reply.send({ lead })
  })

  // DELETE /api/partnerships/admin/leads/:id
  app.delete('/admin/leads/:id', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    await prisma.partnershipLead.delete({ where: { id } })
    return reply.send({ deleted: true })
  })
}
