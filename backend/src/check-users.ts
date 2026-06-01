import { prisma } from './lib/prisma'

async function main() {
  console.log('Querying payments, subscriptions, and coupons...')
  try {
    const payments = await prisma.payment.findMany()
    const coupons = await prisma.coupon.findMany()
    const subs = await prisma.subscription.findMany()
    
    console.log('Payments:', JSON.stringify(payments, null, 2))
    console.log('Coupons:', JSON.stringify(coupons, null, 2))
    console.log('Subscriptions:', JSON.stringify(subs, null, 2))
  } catch (error) {
    console.error('Error querying:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
