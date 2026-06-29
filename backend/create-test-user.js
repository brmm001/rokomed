const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('Teste@123456', 10);
  const user = await prisma.user.upsert({
    where: { email: 'teste@rokomed.com' },
    update: { plan: 'PRO', role: 'ADMIN' },
    create: { name: 'Teste RokoMed', email: 'teste@rokomed.com', passwordHash: hash, plan: 'PRO', role: 'ADMIN' }
  });
  console.log('OK:', user.email, user.plan, user.role);
  await prisma['']();
}
main().catch(e => { console.error(e.message); process.exit(1); });
