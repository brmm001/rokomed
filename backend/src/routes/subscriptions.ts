import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { MercadoPagoConfig, Preference, PreApproval } from 'mercadopago'

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
      // Retorna URL de fallback para dev se não houver MP configurado
      app.log.warn('MERCADO_PAGO_ACCESS_TOKEN não configurado. Retornando URL fake.');
      return reply.send({ checkoutUrl: 'https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=fake' });
    }

    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN })
    const frontUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

    try {
      if (plan === 'monthly') {
        // Assinatura com renovação automática
        const preApproval = new PreApproval(client)
        const result = await preApproval.create({
          body: {
            back_url: `${frontUrl}/dashboard?payment=success`,
            reason: "RokoMed - Plano Mensal (Renovação Automática)",
            auto_recurring: {
              frequency: 1,
              frequency_type: "months",
              transaction_amount: 29.00,
              currency_id: "BRL"
            },
            status: "pending"
          }
        })
        return reply.send({ checkoutUrl: result.init_point })
      } else {
        // Pagamento único (que pode ser parcelado no MP)
        const amount = plan === 'semiannual' ? 97.00 : 147.00
        const title = plan === 'semiannual' ? 'RokoMed - Plano Semestral' : 'RokoMed - Plano Anual'
        
        const preference = new Preference(client)
        const result = await preference.create({
          body: {
            items: [
              {
                id: plan,
                title,
                quantity: 1,
                unit_price: amount,
                currency_id: "BRL"
              }
            ],
            back_urls: {
              success: `${frontUrl}/dashboard?payment=success`,
              failure: `${frontUrl}/checkout?payment=failure`,
              pending: `${frontUrl}/dashboard?payment=pending`
            },
            auto_return: "approved",
            external_reference: `${user.id}_${plan}`
          }
        })
        return reply.send({ checkoutUrl: result.init_point })
      }
    } catch (err) {
      app.log.error(err)
      return reply.code(500).send({ error: 'Erro ao gerar checkout do Mercado Pago' })
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
        // Usa `require('mercadopago').Payment` pq importamos Payment no top
        const { Payment } = require('mercadopago')
        const paymentClient = new Payment(client)
        const paymentInfo = await paymentClient.get({ id: body.data.id })

        if (paymentInfo.status === 'approved') {
          // Precisamos identificar o usuário. Pode vir por external_reference ou pelo e-mail
          let userId: string | null = null
          let planKey = 'monthly'

          if (paymentInfo.external_reference) {
            const parts = paymentInfo.external_reference.split('_')
            userId = parts[0]
            planKey = parts[1] || 'monthly'
          } else if (paymentInfo.payer?.email) {
            const user = await prisma.user.findUnique({ where: { email: paymentInfo.payer.email } })
            if (user) userId = user.id
          }

          if (userId) {
            // Calcula vencimento
            const months = planKey === 'semiannual' ? 6 : planKey === 'annual' ? 12 : 1
            const expiresAt = new Date()
            expiresAt.setMonth(expiresAt.getMonth() + months)

            // Registra Pagamento
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

            // Atualiza usuário para PRO
            await prisma.user.update({
              where: { id: userId },
              data: { plan: 'PRO' }
            })

            // Cria / atualiza Assinatura
            await prisma.subscription.create({
              data: {
                userId,
                plan: 'PRO',
                status: 'active',
                expiresAt
              }
            })
            
            app.log.info(`[Webhook] Pagamento aprovado. Conta ${userId} atualizada para PRO. Vencimento: ${expiresAt}`)
          }
        }
      }
    } catch (err) {
      app.log.error(err as any, 'Erro processando webhook')
    }

    return reply.code(200).send({ received: true })
  })
}
