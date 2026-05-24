import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { sendEmail } from '../lib/resend'
import crypto from 'crypto'

// ── Utilitário: verifica se uma assinatura expirou e rebaixa o plano ─────────
async function checkAndExpireSubscription(userId: string): Promise<void> {
  const activeSub = await prisma.subscription.findFirst({
    where: { userId, status: 'active' },
    orderBy: { expiresAt: 'desc' },
  })

  if (activeSub?.expiresAt && activeSub.expiresAt < new Date()) {
    await prisma.subscription.update({
      where: { id: activeSub.id },
      data: { status: 'expired' },
    })
    await prisma.user.update({
      where: { id: userId },
      data: { plan: 'FREE' },
    })
  }
}

export default async function subscriptionRoutes(app: FastifyInstance) {
  // GET /api/subscriptions/current — assinatura atual (com verificação de expiração)
  app.get('/current', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }

    // FIX #5: Verifica se a assinatura ativa expirou e rebaixa para FREE
    await checkAndExpireSubscription(payload.sub)

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

  // POST /api/subscriptions/check-expiry — cron job endpoint (sem auth, chamado internamente)
  // Varre todos os usuários PRO com assinatura vencida e os rebaixa para FREE
  app.post('/check-expiry', async (request: FastifyRequest, reply: FastifyReply) => {
    const cronSecret = request.headers['x-cron-secret']
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return reply.code(401).send({ error: 'Não autorizado' })
    }

    const expired = await prisma.subscription.findMany({
      where: {
        status: 'active',
        expiresAt: { lt: new Date() },
      },
      select: { id: true, userId: true },
    })

    let count = 0
    for (const sub of expired) {
      await prisma.subscription.update({ where: { id: sub.id }, data: { status: 'expired' } })
      await prisma.user.update({ where: { id: sub.userId }, data: { plan: 'FREE' } })
      count++
    }

    app.log.info(`[check-expiry] ${count} assinatura(s) expirada(s) processada(s)`)
    return reply.send({ expired: count })
  })

  // POST /api/subscriptions/cancel — cancelar assinatura atual
  app.post('/cancel', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user || user.plan === 'FREE') return reply.code(400).send({ error: 'Nenhuma assinatura PRO ativa.' })

    // Busca a assinatura ativa mais recente
    const activeSub = await prisma.subscription.findFirst({
      where: { userId: user.id, status: 'active' },
      orderBy: { createdAt: 'desc' }
    })

    if (activeSub) {
      await prisma.subscription.update({
        where: { id: activeSub.id },
        data: { status: 'cancelled' }
      })
    }

    // Reverte plano do usuário para FREE
    await prisma.user.update({
      where: { id: user.id },
      data: { plan: 'FREE' }
    })

    // E-mail de confirmação de cancelamento
    sendEmail({
      to: user.email,
      subject: 'Confirmação de Cancelamento - Rokomedicina',
      html: `
        <h2>Assinatura Cancelada</h2>
        <p>Olá, ${user.name}.</p>
        <p>Sua assinatura PRO foi cancelada com sucesso. Seu plano retornou para a versão <strong>Gratuita</strong> (limite de 10 questões por dia).</p>
        <p>Caso mude de ideia, você pode reativar seu plano a qualquer momento no nosso painel.</p>
        <br/>
        <p>Agradecemos por ter estudado com a gente!<br/>Equipe Rokomedicina</p>
      `
    }).catch(err => app.log.error('Erro ao enviar email de cancelamento: ' + err.message))

    return reply.send({ success: true, message: 'Assinatura cancelada com sucesso' })
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

    // FIX #1: Verificação de assinatura HMAC-SHA256 do Mercado Pago
    if (process.env.MERCADO_PAGO_WEBHOOK_SECRET) {
      const xSignature = request.headers['x-signature'] as string | undefined
      const xRequestId = request.headers['x-request-id'] as string | undefined
      const dataId = body?.data?.id ?? ''

      if (!xSignature) {
        app.log.warn('[Webhook] Requisição sem x-signature — rejeitada')
        return reply.code(400).send({ error: 'Assinatura ausente' })
      }

      // Formato da assinatura: "ts=<timestamp>,v1=<hash>"
      const parts = Object.fromEntries(
        xSignature.split(',').map(p => p.split('=') as [string, string])
      )
      const ts = parts['ts']
      const v1 = parts['v1']

      if (!ts || !v1) {
        app.log.warn('[Webhook] Formato de x-signature inválido — rejeitado')
        return reply.code(400).send({ error: 'Assinatura inválida' })
      }

      const manifest = `id:${dataId};request-id:${xRequestId ?? ''};ts:${ts};`
      const expected = crypto
        .createHmac('sha256', process.env.MERCADO_PAGO_WEBHOOK_SECRET)
        .update(manifest)
        .digest('hex')

      if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1))) {
        app.log.warn('[Webhook] Assinatura HMAC não confere — rejeitada')
        return reply.code(400).send({ error: 'Assinatura inválida' })
      }
    } else {
      app.log.warn('[Webhook] MERCADO_PAGO_WEBHOOK_SECRET não configurado — verificação ignorada')
    }

    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return reply.code(200).send({ received: true })
    }

    try {
      const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN })

      const topic = body.type || body.topic
      if (topic === 'payment' && body.data?.id) {
        const paymentClient = new Payment(client)
        const paymentInfo = await paymentClient.get({ id: body.data.id })

        // FIX #2: Validar que paymentInfo.id não é nulo antes de qualquer operação
        if (!paymentInfo.id) {
          app.log.error('[Webhook] paymentInfo.id é nulo — abortando processamento')
          return reply.code(200).send({ received: true })
        }

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
            const mpId = String(paymentInfo.id)

            // FIX #2: Upsert seguro no Payment (mercadoPagoId garantidamente não-nulo)
            await prisma.payment.upsert({
              where: { mercadoPagoId: mpId },
              update: { status: 'approved' },
              create: {
                userId,
                mercadoPagoId: mpId,
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

            // FIX #4: Idempotência — evitar duplicatas se o MP reenviar o webhook
            const existingSub = await prisma.subscription.findFirst({
              where: { userId, status: 'active', expiresAt },
            })

            if (!existingSub) {
              await prisma.subscription.create({
                data: {
                  userId,
                  plan: 'PRO',
                  status: 'active',
                  expiresAt
                }
              })
            }

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
