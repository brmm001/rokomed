import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

export default async function subscriptionRoutes(app: FastifyInstance) {
  // GET /api/subscriptions/current — assinatura atual
  app.get('/current', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }

    const subscription = await prisma.subscription.findFirst({
      where:   { userId: payload.sub },
      orderBy: { createdAt: 'desc' },
    })

    const user = await prisma.user.findUnique({
      where:  { id: payload.sub },
      select: { plan: true },
    })

    return reply.send({ subscription, plan: user?.plan })
  })

  // POST /api/subscriptions/checkout — iniciar checkout Mercado Pago
  app.post('/checkout', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { plan, couponCode } = request.body as { plan: 'PRO' | 'GRUPO'; couponCode?: string }

    const prices: Record<string, number> = { PRO: 49.90, GRUPO: 299.90 }
    let amount = prices[plan]

    if (!amount) return reply.code(400).send({ error: 'Plano inválido' })

    // Aplicar cupom se fornecido
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: { code: couponCode, isActive: true, usesRemaining: { gt: 0 } },
      })
      if (coupon) {
        amount = coupon.type === 'percent'
          ? amount * (1 - coupon.value / 100)
          : Math.max(0, amount - coupon.value)
      }
    }

    // Aqui você integraria com MercadoPago SDK real
    // Por enquanto retorna payload de checkout simulado
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return reply.send({
        checkoutUrl: null,
        message: 'Configure MERCADO_PAGO_ACCESS_TOKEN para ativar pagamentos',
        amount,
        plan,
      })
    }

    // TODO: integração MercadoPago real
    return reply.send({ checkoutUrl: null, amount, plan })
  })

  // POST /api/subscriptions/webhook — webhook Mercado Pago
  app.post('/webhook', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { type?: string; data?: { id?: string } }

    if (body?.type === 'payment' && body?.data?.id) {
      // TODO: buscar payment no MP e atualizar subscription
      app.log.info(`Webhook recebido: payment ${body.data.id}`)
    }

    return reply.code(200).send({ received: true })
  })
}
