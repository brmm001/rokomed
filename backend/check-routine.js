const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function main() {
  try {
    const user = await p.user.findFirst({ select: { id: true, routineConfig: true } })
    console.log('routineConfig OK, user:', user?.id || 'nenhum usuário')
  } catch (e) {
    console.error('ERRO routineConfig:', e.message)
  }
  
  try {
    const spec = await p.specialty.findFirst({ where: { isGrandeArea: true } })
    console.log('isGrandeArea OK:', spec?.id || 'nenhuma grande área')
  } catch (e) {
    console.error('ERRO isGrandeArea:', e.message)
  }

  try {
    const ip = await p.institutionPriority.findFirst()
    console.log('institutionPriority OK:', ip?.id || 'nenhuma')
  } catch (e) {
    console.error('ERRO institutionPriority:', e.message)
  }

  await p.$disconnect()
}

main()
