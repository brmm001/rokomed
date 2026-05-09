import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

export default async function supportRoutes(app: FastifyInstance) {
  // GET /api/support/tickets — lista tickets do usuário
  app.get('/tickets', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: payload.sub },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })
    return reply.send({ tickets })
  })

  // POST /api/support/tickets — cria novo ticket
  app.post('/tickets', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const schema = z.object({
      subject: z.string().min(3),
      content: z.string().min(5)
    })
    const parsed = schema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message })

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: payload.sub,
        subject: parsed.data.subject,
        messages: {
          create: {
            senderId: payload.sub,
            content: parsed.data.content
          }
        }
      },
      include: { messages: true }
    })
    return reply.send({ ticket })
  })

  // POST /api/support/tickets/:id/messages — adiciona msg
  app.post('/tickets/:id/messages', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id } = request.params as { id: string }
    const schema = z.object({ content: z.string().min(1) })
    const parsed = schema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message })

    const ticket = await prisma.supportTicket.findUnique({ where: { id } })
    if (!ticket || ticket.userId !== payload.sub) return reply.code(404).send({ error: 'Ticket não encontrado' })

    const message = await prisma.supportMessage.create({
      data: {
        ticketId: id,
        senderId: payload.sub,
        content: parsed.data.content
      }
    })
    
    await prisma.supportTicket.update({
      where: { id },
      data: { updatedAt: new Date() }
    })

    return reply.send({ message })
  })
}
