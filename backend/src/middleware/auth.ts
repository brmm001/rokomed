import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma'

// ── Decorators ────────────────────────────────────────────────────────────

/** Verifica JWT e injeta user no request */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
    // O payload do JWT tem { sub: userId, role, plan }
  } catch {
    reply.code(401).send({ error: 'Não autenticado' })
  }
}

/** Verifica se o usuário tem o role mínimo exigido */
export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply)
    const payload = request.user as { role: string }
    if (!roles.includes(payload.role)) {
      reply.code(403).send({ error: 'Acesso negado' })
    }
  }
}

/** Verifica se o usuário está banido */
export async function checkNotBanned(request: FastifyRequest, reply: FastifyReply) {
  const payload = request.user as { sub: string }
  const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { isBanned: true } })
  if (user?.isBanned) {
    reply.code(403).send({ error: 'Conta suspensa' })
  }
}

/** Verifica se o usuário tem plano PRO ou GRUPO */
export async function requirePro(request: FastifyRequest, reply: FastifyReply) {
  const payload = request.user as { plan: string }
  if (payload.plan === 'FREE') {
    reply.code(402).send({ error: 'Recurso exclusivo para assinantes Pro', upgrade: true })
  }
}

/** Verifica se a assinatura está ativa (ou se o trial de 7 dias não expirou) */
export async function requireActiveSubscription(request: FastifyRequest, reply: FastifyReply) {
  const payload = request.user as { sub: string }
  
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { plan: true }
  })

  // Se for PRO ou GRUPO, está liberado
  if (user?.plan === 'PRO' || user?.plan === 'GRUPO') {
    return
  }

  // Se for FREE, verificar se o trial expirou
  const trialSub = await prisma.subscription.findFirst({
    where: { userId: payload.sub, status: 'trial' },
    orderBy: { trialEndsAt: 'desc' }
  })

  if (trialSub && trialSub.trialEndsAt && trialSub.trialEndsAt < new Date()) {
    return reply.code(402).send({
      error: 'Seu período de teste gratuito de 7 dias expirou. Faça upgrade para Pro!',
      expired: true
    })
  }
}
