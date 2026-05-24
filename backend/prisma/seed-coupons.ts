import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seedando cupons no banco de dados...')

  const coupons = [
    {
      code: 'PROMO50',
      type: 'percent',
      value: 50,
      usesRemaining: 100,
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
      isActive: true,
    },
    {
      code: 'WELCOME10',
      type: 'percent',
      value: 10,
      usesRemaining: 500,
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
      isActive: true,
    },
    {
      code: 'DESCONTO20',
      type: 'fixed',
      value: 20,
      usesRemaining: 50,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      isActive: true,
    },
    {
      code: 'EXPIRED10',
      type: 'percent',
      value: 10,
      usesRemaining: 5,
      validUntil: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expirado há 1 dia
      isActive: true,
    },
    {
      code: 'LIMIT0',
      type: 'percent',
      value: 30,
      usesRemaining: 0, // Esgotado
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  ]

  for (const c of coupons) {
    const created = await prisma.coupon.upsert({
      where: { code: c.code },
      update: {
        type: c.type,
        value: c.value,
        usesRemaining: c.usesRemaining,
        validUntil: c.validUntil,
        isActive: c.isActive,
      },
      create: c,
    })
    console.log(`- Coupon ${created.code} (${created.type}: ${created.value}) upserted.`)
  }

  console.log('✅ Cupons cadastrados com sucesso!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
