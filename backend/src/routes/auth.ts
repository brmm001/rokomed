import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export default async function authRoutes(app: FastifyInstance) {
  // POST /api/auth/register
  app.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const result = registerSchema.safeParse(request.body)
    if (!result.success) {
      return reply.code(400).send({ error: result.error.errors[0].message })
    }

    const { name, email, password } = result.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return reply.code(409).send({ error: 'E-mail já cadastrado' })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { name, email, passwordHash, plan: 'FREE', role: 'ALUNO' },
      select: { id: true, name: true, email: true, role: true, plan: true, picture: true, xp: true, streak: true },
    })

    // Cria subscription trial de 1 dia
    const trialEnd = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await prisma.subscription.create({
      data: { userId: user.id, plan: 'FREE', status: 'trial', trialEndsAt: trialEnd },
    })

    // Grava IP do trial (anti-abuse)
    const ip = request.ip
    await prisma.trialIp.create({ data: { ip, userId: user.id } })

    const token = app.jwt.sign({ sub: user.id, role: user.role, plan: user.plan })

    return reply.code(201).send({ token, user })
  })

  // POST /api/auth/login
  app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const result = loginSchema.safeParse(request.body)
    if (!result.success) {
      return reply.code(400).send({ error: 'Dados inválidos' })
    }

    const { email, password } = result.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) {
      return reply.code(401).send({ error: 'E-mail ou senha incorretos' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return reply.code(401).send({ error: 'E-mail ou senha incorretos' })
    }

    if (user.isBanned) {
      return reply.code(403).send({ error: 'Conta suspensa' })
    }

    const token = app.jwt.sign({ sub: user.id, role: user.role, plan: user.plan })

    return reply.send({
      token,
      user: {
        id: user.id, name: user.name, email: user.email,
        role: user.role, plan: user.plan, picture: user.picture,
        xp: user.xp, streak: user.streak,
      },
    })
  })

  // GET /api/auth/me
  app.get('/me', {
    preHandler: async (request, reply) => {
      try { await request.jwtVerify() } catch { reply.code(401).send({ error: 'Não autenticado' }) }
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, plan: true, picture: true, xp: true, streak: true, isBanned: true },
    })
    if (!user) return reply.code(404).send({ error: 'Usuário não encontrado' })
    return reply.send({ user })
  })

  // POST /api/auth/logout (apenas instrui o frontend a apagar o token)
  app.post('/logout', async (_request, reply) => {
    return reply.send({ message: 'Logout realizado com sucesso' })
  })
}
