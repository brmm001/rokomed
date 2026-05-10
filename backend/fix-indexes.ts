import { prisma } from './src/lib/prisma';

async function main() {
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "questions_specialtyId_idx" ON "questions" ("specialtyId");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "questions_institutionId_idx" ON "questions" ("institutionId");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "questions_isPublished_idx" ON "questions" ("isPublished");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "questions_createdAt_idx" ON "questions" ("createdAt");`);
  
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "user_answers_userId_idx" ON "user_answers" ("userId");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "user_answers_questionId_idx" ON "user_answers" ("questionId");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "user_bookmarks_userId_idx" ON "user_bookmarks" ("userId");`);
  console.log('Indexes created');
}

main().finally(() => prisma.$disconnect());
