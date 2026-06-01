import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { sendEmail } from '../lib/resend'

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
      return reply.code(400).send({ error: result.error.issues[0].message })
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

    // Cria subscription trial de 7 dias
    const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.subscription.create({
      data: { userId: user.id, plan: 'FREE', status: 'trial', trialEndsAt: trialEnd },
    })

    // Grava IP do trial (anti-abuse)
    const ip = request.ip
    await prisma.trialIp.create({ data: { ip, userId: user.id } })

    const token = app.jwt.sign({ sub: user.id, role: user.role, plan: user.plan })

    // Enviar e-mail de boas-vindas assincronamente (não precisa usar await para não travar o fluxo)
    sendEmail({
      to: user.email,
      subject: 'Boas-vindas ao Rokomedicina!',
      html: `
        <h2>Olá, ${user.name}!</h2>
        <p>Sua conta foi criada com sucesso. Seja bem-vindo(a) ao Rokomedicina!</p>
        <p>Para acessar sua conta, vá para a <a href="${process.env.FRONTEND_URL || 'https://rokomed.com.br'}/login">página de login</a> e utilize suas credenciais.</p>
        <br />
        <p>Bons estudos!</p>
      `,
    }).catch(err => console.error('Erro ao enviar email de boas-vindas', err));

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
      select: { id: true, name: true, email: true, role: true, plan: true, picture: true, xp: true, streak: true, isBanned: true, onboardingDone: true },
    })
    if (!user) return reply.code(404).send({ error: 'Usuário não encontrado' })

    const trialSub = await prisma.subscription.findFirst({
      where: { userId: user.id, status: 'trial' },
      orderBy: { trialEndsAt: 'desc' }
    })
    const trialExpired = trialSub && trialSub.trialEndsAt ? trialSub.trialEndsAt < new Date() : false

    const token = app.jwt.sign({ sub: user.id, role: user.role, plan: user.plan })

    return reply.send({
      user: { ...user, trialExpired },
      token
    })
  })

  // POST /api/auth/logout (apenas instrui o frontend a apagar o token)
  app.post('/logout', async (_request, reply) => {
    return reply.send({ message: 'Logout realizado com sucesso' })
  })

  // POST /api/auth/lead (Captura e-mail para simulado grátis)
  app.post('/lead', async (request: FastifyRequest, reply: FastifyReply) => {
    const { email } = request.body as { email: string }
    if (!email || !email.includes('@')) return reply.code(400).send({ error: 'E-mail inválido' })

    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      user = await prisma.user.create({
        data: { name: 'Visitante', email, plan: 'FREE', role: 'ALUNO' },
      })
    }
    
    return reply.send({ success: true, userId: user.id })
  })

  // POST /api/auth/click-event — Rastreia cliques de visitantes
  app.post('/click-event', async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, userId, buttonType, pageUrl } = request.body as {
      email?: string
      userId?: string
      buttonType: string
      pageUrl: string
    }

    if (!buttonType || !pageUrl) {
      return reply.code(400).send({ error: 'buttonType e pageUrl são obrigatórios' })
    }

    const click = await prisma.visitorClick.create({
      data: {
        email: email || null,
        userId: userId || null,
        buttonType,
        pageUrl,
        ip: request.ip,
      }
    })

    return reply.send({ success: true, clickId: click.id })
  })


  // POST /api/auth/forgot-password (Envia o e-mail de recuperação)
  app.post('/forgot-password', async (request: FastifyRequest, reply: FastifyReply) => {
    const { email } = request.body as { email: string }
    if (!email) return reply.code(400).send({ error: 'E-mail obrigatório' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // Retorna sucesso de qualquer forma por segurança (para não confirmar quais emails existem)
      return reply.send({ message: 'Se o e-mail existir em nossa base, enviaremos as instruções.' })
    }

    // Gerar um token JWT com duração de 1 hora para o reset
    const resetToken = app.jwt.sign({ sub: user.id, purpose: 'reset_password' }, { expiresIn: '1h' })
    
    // O link aponta para o Frontend, que vai ler da URL e mandar para a rota de reset
    const resetLink = `${process.env.FRONTEND_URL || 'https://rokomed.com.br'}/reset-password?token=${resetToken}`

    await sendEmail({
      to: user.email,
      subject: 'Recuperação de Senha - Rokomedicina',
      html: `
        <h2>Recuperação de Senha</h2>
        <p>Olá, ${user.name}. Recebemos um pedido para alterar a senha da sua conta.</p>
        <p>Clique no link abaixo para criar uma nova senha. Este link expira em 1 hora.</p>
        <p><a href="${resetLink}">Redefinir minha senha</a></p>
        <p>Se você não solicitou isso, pode ignorar este e-mail.</p>
      `
    })

    return reply.send({ message: 'Se o e-mail existir em nossa base, enviaremos as instruções.' })
  })

  // POST /api/auth/reset-password (Altera a senha baseada no token)
  app.post('/reset-password', async (request: FastifyRequest, reply: FastifyReply) => {
    const { token, newPassword } = request.body as { token?: string, newPassword?: string }
    if (!token || !newPassword || newPassword.length < 6) {
      return reply.code(400).send({ error: 'Token inválido ou senha muito curta.' })
    }

    try {
      const decoded = app.jwt.verify(token) as { sub: string, purpose: string }
      if (decoded.purpose !== 'reset_password') {
        throw new Error('Invalid token purpose')
      }

      const passwordHash = await bcrypt.hash(newPassword, 12)
      await prisma.user.update({
        where: { id: decoded.sub },
        data: { passwordHash }
      })

      return reply.send({ message: 'Senha alterada com sucesso.' })
    } catch (err) {
      return reply.code(400).send({ error: 'Token inválido ou expirado.' })
    }
  })
}
