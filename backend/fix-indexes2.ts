import { prisma } from './src/lib/prisma';
async function main() {
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "specialties_parentId_idx" ON "specialties" ("parentId");`);
  console.log('Index created');
}
main().finally(() => prisma.$disconnect());
