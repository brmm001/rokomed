import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { sendEmail } from '../lib/resend'

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
    const { plan } = request.body as { plan: 'monthly' | 'semiannual' | 'annual' }

    const payload = request.user as { sub: string }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) return reply.code(404).send({ error: 'Usuário não encontrado' })

    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      app.log.warn('MERCADO_PAGO_ACCESS_TOKEN não configurado. Retornando URL fake.')
      return reply.send({ checkoutUrl: 'https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=fake' })
    }

    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN })
    const frontUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

    const planConfig: Record<string, { title: string; amount: number }> = {
      monthly:    { title: 'RokoMed - Plano Mensal',    amount: 29.00  },
      semiannual: { title: 'RokoMed - Plano Semestral', amount: 97.00  },
      annual:     { title: 'RokoMed - Plano Anual',     amount: 147.00 },
    }

    const config = planConfig[plan]
    if (!config) return reply.code(400).send({ error: 'Plano inválido' })

    try {
      const preference = new Preference(client)
      const result = await preference.create({
        body: {
          items: [
            {
              id: plan,
              title: config.title,
              quantity: 1,
              unit_price: config.amount,
              currency_id: 'BRL',
            }
          ],
          back_urls: {
            success: `${frontUrl}/dashboard?payment=success`,
            failure: `${frontUrl}/checkout?payment=failure`,
            pending: `${frontUrl}/dashboard?payment=pending`,
          },
          auto_return: 'approved',
          external_reference: `${user.id}__${plan}`,
        }
      })

      if (!result.init_point) {
        app.log.error('MP não retornou init_point: ' + JSON.stringify(result))
        return reply.code(500).send({ error: 'Erro ao gerar link de pagamento' })
      }

      return reply.send({ checkoutUrl: result.init_point })
    } catch (err: any) {
      app.log.error({ err }, 'Erro ao gerar checkout do Mercado Pago')
      return reply.code(500).send({
        error: 'Erro ao gerar checkout do Mercado Pago',
        detail: err?.message
      })
    }
  })

  // POST /api/subscriptions/webhook — webhook Mercado Pago
  app.post('/webhook', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any
    app.log.info(`Webhook MP recebido: ${JSON.stringify(body)}`)

    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return reply.code(200).send({ received: true })
    }

    try {
      const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN })

      const topic = body.type || body.topic
      if (topic === 'payment' && body.data?.id) {
        const paymentClient = new Payment(client)
        const paymentInfo = await paymentClient.get({ id: body.data.id })

        if (paymentInfo.status === 'approved') {
          let userId: string | null = null
          let planKey = 'monthly'

          if (paymentInfo.external_reference) {
            // Separador duplo __ para evitar conflito com UUID que usa -
            const parts = paymentInfo.external_reference.split('__')
            userId = parts[0]
            planKey = parts[1] || 'monthly'
          } else if (paymentInfo.payer?.email) {
            const user = await prisma.user.findUnique({ where: { email: paymentInfo.payer.email } })
            if (user) userId = user.id
          }

          if (userId) {
            const months = planKey === 'semiannual' ? 6 : planKey === 'annual' ? 12 : 1
            const expiresAt = new Date()
            expiresAt.setMonth(expiresAt.getMonth() + months)

            await prisma.payment.upsert({
              where: { mercadoPagoId: String(paymentInfo.id) },
              update: { status: 'approved' },
              create: {
                userId,
                mercadoPagoId: String(paymentInfo.id),
                plan: 'PRO',
                amount: Number(paymentInfo.transaction_amount) || 0,
                status: 'approved',
                webhookPayload: JSON.stringify(body)
              }
            })

            const updatedUser = await prisma.user.update({
              where: { id: userId },
              data: { plan: 'PRO' }
            })

            await prisma.subscription.create({
              data: {
                userId,
                plan: 'PRO',
                status: 'active',
                expiresAt
              }
            })

            // Envia o e-mail de confirmação da compra
            sendEmail({
              to: updatedUser.email,
              subject: 'Pagamento Aprovado! Bem-vindo ao Rokomedicina PRO',
              html: `
                <h2>Seu pagamento foi aprovado! 🎉</h2>
                <p>Olá, ${updatedUser.name}!</p>
                <p>Sua assinatura do plano <strong>${planKey.toUpperCase()}</strong> foi ativada com sucesso e é válida até ${expiresAt.toLocaleDateString('pt-BR')}.</p>
                <p>Aproveite todos os recursos exclusivos da plataforma para impulsionar seus estudos.</p>
                <br />
                <p>Bons estudos,<br/>Equipe Rokomedicina</p>
              `
            }).catch(err => app.log.error('Erro ao enviar email de assinatura: ' + err.message))

            app.log.info(`[Webhook] Pagamento aprovado. Conta ${userId} → PRO. Vencimento: ${expiresAt}`)
          }
        }
      }
    } catch (err) {
      app.log.error(err as any, 'Erro processando webhook')
    }

    return reply.code(200).send({ received: true })
  })
}
