import { prisma } from './src/lib/prisma';
async function main() {
  await prisma.question.updateMany({ data: { specialtyId: null } });
  await prisma.specialty.deleteMany({});
  console.log('Cleaned up specialties');
}
main().finally(() => prisma.$disconnect());
