const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const updated = await prisma.user.updateMany({
    where: { email: 'teste@rokomed.com' },
    data: { onboardingDone: true }
  });
  console.log('Atualizado:', updated.count, 'usuario(s)');
}
main()
  .then(() => process.exit(0))
  .catch(e => { console.error(e.message); process.exit(1); });
