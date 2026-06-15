import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { MercadoPagoConfig, Preference, Payment, PreApproval } from 'mercadopago'
import { sendEmail } from '../lib/resend'
import crypto from 'crypto'
import { PLANS } from '../config/plans'

// ── Utilitário: Gera templates de e-mail estilizados com HTML/CSS inline ─────
function getEmailTemplate(title: string, bodyHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 40px 20px;
            color: #1f2937;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid #e5e7eb;
          }
          .header {
            background-color: #111111;
            padding: 30px;
            text-align: center;
          }
          .logo {
            font-family: Georgia, serif;
            font-size: 24px;
            font-weight: bold;
            color: #ffffff;
            text-decoration: none;
            letter-spacing: 1px;
          }
          .logo em {
            color: #3b82f6;
            font-style: normal;
          }
          .content {
            padding: 40px 30px;
            line-height: 1.6;
          }
          .content h2 {
            font-size: 20px;
            font-weight: 700;
            color: #111111;
            margin-top: 0;
            margin-bottom: 20px;
          }
          .content p {
            margin-top: 0;
            margin-bottom: 16px;
            font-size: 15px;
            color: #4b5563;
          }
          .card {
            background-color: #f9fafb;
            border: 1px solid #f3f4f6;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            border-radius: 6px;
            margin: 25px 0;
          }
          .card p {
            margin: 0;
            font-size: 14px;
            color: #374151;
          }
          .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #f3f4f6;
            font-size: 13px;
            color: #9ca3af;
          }
          .footer a {
            color: #3b82f6;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">Roko<em>Med</em></span>
          </div>
          <div class="content">
            ${bodyHtml}
          </div>
          <div class="footer">
            <p>Este é um e-mail automático enviado pelo RokoMed.</p>
            <p>&copy; ${new Date().getFullYear()} RokoMed. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

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

// ── Utilitário: ativa assinatura PRO após pagamento aprovado ──────────────────
async function activateSubscription(
  app: FastifyInstance,
  userId: string,
  planKey: string,
  mercadoPagoId: string,
  amount: number,
  couponCode: string | null,
  paymentMethod: string,
  webhookPayload: string
): Promise<void> {
  const months = planKey === 'semiannual' ? 6 : planKey === 'annual' ? 12 : 1
  const expiresAt = new Date()
  expiresAt.setMonth(expiresAt.getMonth() + months)
  const mpId = String(mercadoPagoId)

  await prisma.payment.upsert({
    where: { mercadoPagoId: mpId },
    update: { status: 'approved' },
    create: {
      userId,
      mercadoPagoId: mpId,
      plan: 'PRO',
      amount,
      status: 'approved',
      paymentMethod,
      couponCode: couponCode || null,
      webhookPayload,
    },
  })

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { plan: 'PRO' },
  })

  // Decrementa uso do cupom
  if (couponCode) {
    try {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })
      if (coupon && coupon.usesRemaining > 0) {
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usesRemaining: coupon.usesRemaining - 1 },
        })
      }
    } catch (couponErr) {
      app.log.error(couponErr, 'Erro ao decrementar uso do cupom')
    }
  }

  // Idempotência: evita duplicar subscriptions
  const existingSub = await prisma.subscription.findFirst({
    where: { userId, status: 'active', expiresAt },
  })

  if (!existingSub) {
    await prisma.subscription.create({
      data: { userId, plan: 'PRO', status: 'active', expiresAt },
    })
  }

  // E-mail de confirmação
  const planLabel = planKey === 'annual' ? 'Anual' : planKey === 'semiannual' ? 'Semestral' : 'Mensal'
  const successEmailHtml = getEmailTemplate(
    'Pagamento Aprovado! Bem-vindo ao RokoMed PRO',
    `
      <h2>Seu pagamento foi aprovado! 🎉</h2>
      <p>Olá, <strong>${updatedUser.name}</strong>!</p>
      <p>É com muita alegria que damos as boas-vindas ao <strong>RokoMed PRO</strong>. Sua assinatura do plano <strong>${planLabel}</strong> foi ativada com sucesso.</p>
      <div class="card">
        <p><strong>Detalhes da sua assinatura:</strong></p>
        <p style="margin-top: 8px;">• Plano: RokoMed PRO (${planLabel})</p>
        <p>• Data de expiração: <strong>${expiresAt.toLocaleDateString('pt-BR')}</strong></p>
        <p>• Status: <strong>Ativo</strong></p>
      </div>
      <p>Aproveite agora mesmo todos os recursos ilimitados!</p>
      <br />
      <p>Bons estudos,<br/><strong>Equipe RokoMed</strong></p>
    `
  )

  sendEmail({
    to: updatedUser.email,
    subject: 'Pagamento Aprovado! Bem-vindo ao RokoMed PRO',
    html: successEmailHtml,
  }).catch(err => app.log.error('Erro ao enviar email de assinatura: ' + err.message))

  app.log.info(`[activateSubscription] Conta ${userId} → PRO. Vencimento: ${expiresAt}`)
}

export default async function subscriptionRoutes(app: FastifyInstance) {
  // GET /api/subscriptions/plans — planos e preços
  app.get('/plans', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send(PLANS)
  })

  // POST /api/subscriptions/coupon/validate — validar cupom de desconto
  app.post('/coupon/validate', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { code } = request.body as { code: string }
    if (!code) return reply.code(400).send({ error: 'Código do cupom é obrigatório.' })

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!coupon) {
      return reply.code(404).send({ error: 'Cupom inválido ou inexistente.' })
    }

    if (!coupon.isActive) {
      return reply.code(400).send({ error: 'Este cupom não está mais ativo.' })
    }

    if (coupon.usesRemaining <= 0) {
      return reply.code(400).send({ error: 'Este cupom já atingiu o limite de usos.' })
    }

    if (coupon.validUntil && coupon.validUntil < new Date()) {
      return reply.code(400).send({ error: 'Este cupom está expirado.' })
    }

    return reply.send({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value
    })
  })

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

    // E-mail de confirmação de cancelamento (estilizado)
    const cancelEmailHtml = getEmailTemplate(
      'Confirmação de Cancelamento - RokoMed',
      `
        <h2>Assinatura Cancelada</h2>
        <p>Olá, <strong>${user.name}</strong>.</p>
        <p>Confirmamos que sua assinatura do plano RokoMed PRO foi cancelada com sucesso. Seu acesso retornou para a versão gratuita (limite de 10 questões por dia).</p>
        <div class="card">
          <p>Seus dados de desempenho e histórico de estudos continuam salvos com segurança. Se quiser assinar novamente e retomar o acesso ilimitado, basta acessar a plataforma a qualquer momento.</p>
        </div>
        <p>Agradecemos por ter estudado com a gente e desejamos muito sucesso em sua jornada de estudos!</p>
        <br/>
        <p>Abraços,<br/><strong>Equipe RokoMed</strong></p>
      `
    )

    sendEmail({
      to: user.email,
      subject: 'Confirmação de Cancelamento - RokoMed',
      html: cancelEmailHtml
    }).catch(err => app.log.error('Erro ao enviar email de cancelamento: ' + err.message))

    return reply.send({ success: true, message: 'Assinatura cancelada com sucesso' })
  })

  // POST /api/subscriptions/checkout — iniciar checkout Mercado Pago
  app.post('/checkout', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { plan, couponCode } = request.body as { plan: 'monthly' | 'semiannual' | 'annual'; couponCode?: string }

    const payload = request.user as { sub: string }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) return reply.code(404).send({ error: 'Usuário não encontrado' })

    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      app.log.warn('MERCADO_PAGO_ACCESS_TOKEN não configurado. Retornando URL fake.')
      return reply.send({ checkoutUrl: 'https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=fake' })
    }

    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN })
    const frontUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

    const config = PLANS[plan]
    if (!config) return reply.code(400).send({ error: 'Plano inválido' })

    let finalAmount = config.amount
    let discountApplied = 0
    let validCoupon: any = null

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() }
      })

      if (coupon && coupon.isActive && coupon.usesRemaining > 0 && (!coupon.validUntil || coupon.validUntil >= new Date())) {
        validCoupon = coupon
        if (coupon.type === 'percent') {
          discountApplied = (config.amount * coupon.value) / 100
        } else if (coupon.type === 'fixed') {
          discountApplied = coupon.value
        }
        finalAmount = Math.max(0.1, config.amount - discountApplied)
      }
    }

    // Ambiente de teste: usa sandbox_init_point para evitar bloqueio de autopagamento
    const isTestMode = process.env.MERCADO_PAGO_ACCESS_TOKEN?.startsWith('TEST-')

    try {
      const preference = new Preference(client)
      const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() // 6 horas

      const result = await preference.create({
        body: {
          items: [
            {
              id: plan,
              title: config.title,
              description: config.description,
              category_id: 'services',
              quantity: 1,
              unit_price: Number(finalAmount.toFixed(2)),
              currency_id: 'BRL',
            }
          ],
          payer: {
            name: user.name?.split(' ')[0] ?? '',
            surname: user.name?.split(' ').slice(1).join(' ') ?? '',
            email: user.email,
          },
          back_urls: {
            success: `${frontUrl}/dashboard?payment=success`,
            failure: `${frontUrl}/checkout?payment=failure`,
            pending: `${frontUrl}/dashboard?payment=pending`,
          },
          auto_return: 'approved',
          statement_descriptor: 'ROKOMED',
          external_reference: `${user.id}__${plan}__${validCoupon ? validCoupon.code : ''}`,
          expiration_date_to: expiresAt,
          expires: true,
        }
      })

      // Em modo de teste usa sandbox_init_point; em produção usa init_point
      const checkoutUrl = isTestMode
        ? (result.sandbox_init_point ?? result.init_point)
        : result.init_point

      if (!checkoutUrl) {
        app.log.error('MP não retornou init_point: ' + JSON.stringify(result))
        return reply.code(500).send({ error: 'Erro ao gerar link de pagamento' })
      }

      return reply.send({ checkoutUrl })
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
          let couponCode: string | null = null

          if (paymentInfo.external_reference) {
            // Separador duplo __ para evitar conflito com UUID que usa -
            const parts = paymentInfo.external_reference.split('__')
            userId = parts[0]
            planKey = parts[1] || 'monthly'
            couponCode = parts[2] || null
          } else if (paymentInfo.payer?.email) {
            const user = await prisma.user.findUnique({ where: { email: paymentInfo.payer.email } })
            if (user) userId = user.id
          }

          if (userId) {
            await activateSubscription(
              app,
              userId,
              planKey,
              String(paymentInfo.id),
              Number(paymentInfo.transaction_amount) || 0,
              couponCode,
              (paymentInfo.payment_method_id as string) || 'unknown',
              JSON.stringify(body)
            )
          }
        }
      }
    } catch (err) {
      app.log.error(err as any, 'Erro processando webhook')
    }

    return reply.code(200).send({ received: true })
  })

  // ── CHECKOUT TRANSPARENTE ─────────────────────────────────────────────────

  // POST /api/subscriptions/transparent/init — prepara dados para o Brick
  app.post('/transparent/init', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { plan = 'monthly', couponCode } = request.body as { plan?: string; couponCode?: string }
    const payload = request.user as { sub: string }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) return reply.code(404).send({ error: 'Usuário não encontrado' })

    const config = PLANS[plan]
    if (!config) return reply.code(400).send({ error: 'Plano inválido' })

    let finalAmount = config.amount
    let discountApplied = 0
    let couponInfo: any = null

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } })
      if (coupon && coupon.isActive && coupon.usesRemaining > 0 && (!coupon.validUntil || coupon.validUntil >= new Date())) {
        couponInfo = { code: coupon.code, type: coupon.type, value: coupon.value }
        discountApplied = coupon.type === 'percent'
          ? (config.amount * coupon.value) / 100
          : coupon.value
        finalAmount = Math.max(0.1, config.amount - discountApplied)
      }
    }

    const publicKey = process.env.MERCADO_PAGO_PUBLIC_KEY || ''

    return reply.send({
      amount: Number(finalAmount.toFixed(2)),
      originalAmount: config.amount,
      discountApplied: Number(discountApplied.toFixed(2)),
      coupon: couponInfo,
      publicKey,
      plan,
      userInfo: {
        email: user.email,
        firstName: user.name?.split(' ')[0] ?? '',
        lastName: user.name?.split(' ').slice(1).join(' ') ?? '',
      },
    })
  })

  // POST /api/subscriptions/transparent/subscribe — cartão recorrente via PreApproval
  app.post('/transparent/subscribe', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const {
      cardToken, paymentMethodId, issuerId, installments = 1,
      email, identificationType, identificationNumber,
      plan = 'monthly', couponCode,
    } = request.body as {
      cardToken: string; paymentMethodId: string; issuerId?: string; installments?: number;
      email: string; identificationType: string; identificationNumber: string;
      plan?: string; couponCode?: string;
    }

    const payload = request.user as { sub: string }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) return reply.code(404).send({ error: 'Usuário não encontrado' })

    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return reply.code(503).send({ error: 'Pagamento indisponível no momento. Configure MERCADO_PAGO_ACCESS_TOKEN.' })
    }

    const config = PLANS[plan]
    if (!config) return reply.code(400).send({ error: 'Plano inválido' })

    let finalAmount = config.amount
    let couponCodeUpper: string | null = null

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } })
      if (coupon && coupon.isActive && coupon.usesRemaining > 0 && (!coupon.validUntil || coupon.validUntil >= new Date())) {
        couponCodeUpper = coupon.code
        const discount = coupon.type === 'percent'
          ? (config.amount * coupon.value) / 100
          : coupon.value
        finalAmount = Math.max(0.1, config.amount - discount)
      }
    }

    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN })
    const frontUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

    try {
      const preApprovalClient = new PreApproval(client)
      const result = await preApprovalClient.create({
        body: {
          reason: `RokoMed PRO — ${config.title}`,
          payer_email: email || user.email,
          card_token_id: cardToken,
          auto_recurring: {
            frequency: 1,
            frequency_type: 'months',
            transaction_amount: Number(finalAmount.toFixed(2)),
            currency_id: 'BRL',
          },
          back_url: `${frontUrl}/dashboard?payment=success`,
          status: 'authorized',
          external_reference: `${user.id}__${plan}__${couponCodeUpper || ''}`,
        },
      })

      app.log.info(`[PreApproval] Resultado: ${JSON.stringify({ id: result.id, status: result.status })}`)

      if (result.status === 'authorized' || result.status === 'active') {
        // Ativa imediatamente — MP vai cobrar recorrentemente a partir daqui
        await activateSubscription(
          app,
          user.id,
          plan,
          result.id ?? `preapproval_${Date.now()}`,
          finalAmount,
          couponCodeUpper,
          'credit_card',
          JSON.stringify(result)
        )
        return reply.send({ status: 'approved', subscriptionId: result.id })
      }

      // Assinatura criada mas ainda não autorizada (ex: cartão pendente de confirmação)
      return reply.send({ status: result.status ?? 'pending', subscriptionId: result.id })
    } catch (err: any) {
      app.log.error({ err }, 'Erro ao criar PreApproval')
      return reply.code(500).send({
        error: 'Erro ao processar assinatura',
        detail: err?.cause?.message ?? err?.message,
      })
    }
  })

  // POST /api/subscriptions/transparent/pix — gera pagamento PIX único (30 dias)
  app.post('/transparent/pix', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { plan = 'monthly', couponCode, email, identificationType = 'CPF', identificationNumber } = request.body as {
      plan?: string; couponCode?: string; email: string; identificationType?: string; identificationNumber: string;
    }

    const payload = request.user as { sub: string }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) return reply.code(404).send({ error: 'Usuário não encontrado' })

    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return reply.code(503).send({ error: 'Pagamento indisponível no momento.' })
    }

    const config = PLANS[plan]
    if (!config) return reply.code(400).send({ error: 'Plano inválido' })

    let finalAmount = config.amount
    let couponCodeUpper: string | null = null

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } })
      if (coupon && coupon.isActive && coupon.usesRemaining > 0 && (!coupon.validUntil || coupon.validUntil >= new Date())) {
        couponCodeUpper = coupon.code
        const discount = coupon.type === 'percent'
          ? (config.amount * coupon.value) / 100
          : coupon.value
        finalAmount = Math.max(0.1, config.amount - discount)
      }
    }

    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN })

    try {
      const paymentClient = new Payment(client)
      const result = await paymentClient.create({
        body: {
          transaction_amount: Number(finalAmount.toFixed(2)),
          description: `RokoMed PRO — ${config.title}`,
          payment_method_id: 'pix',
          payer: {
            email: email || user.email,
            identification: { type: identificationType, number: identificationNumber },
          },
          external_reference: `${user.id}__${plan}__${couponCodeUpper || ''}`,
          date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
        },
      })

      if (!result.id) {
        return reply.code(500).send({ error: 'MP não retornou ID do pagamento' })
      }

      const pixData = (result as any).point_of_interaction?.transaction_data

      return reply.send({
        status: result.status,
        paymentId: String(result.id),
        pixQrCode: pixData?.qr_code ?? null,
        pixQrCodeBase64: pixData?.qr_code_base64 ?? null,
        pixExpiresAt: pixData?.ticket_url ?? null,
      })
    } catch (err: any) {
      app.log.error({ err }, 'Erro ao criar pagamento PIX')
      return reply.code(500).send({
        error: 'Erro ao gerar PIX',
        detail: err?.cause?.message ?? err?.message,
      })
    }
  })

  // GET /api/subscriptions/transparent/pix-status/:id — polling para confirmar PIX
  app.get('/transparent/pix-status/:id', { preHandler: [requireAuth] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }

    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return reply.code(503).send({ error: 'Serviço indisponível' })
    }

    try {
      const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN })
      const paymentClient = new Payment(client)
      const paymentInfo = await paymentClient.get({ id })

      return reply.send({
        status: paymentInfo.status,
        statusDetail: paymentInfo.status_detail,
      })
    } catch (err: any) {
      app.log.error({ err }, 'Erro ao consultar status do PIX')
      return reply.code(500).send({ error: 'Erro ao consultar pagamento' })
    }
  })
}
