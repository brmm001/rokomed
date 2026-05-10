import { prisma } from './src/lib/prisma';
async function main() {
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "questions_year_idx" ON "questions" ("year");`);
  console.log('Index created');
}
main().finally(() => prisma.$disconnect());
