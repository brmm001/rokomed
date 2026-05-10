import { prisma } from './src/lib/prisma';
async function main() {
  await prisma.$executeRawUnsafe(`PRAGMA journal_mode = WAL;`);
  await prisma.$executeRawUnsafe(`PRAGMA synchronous = NORMAL;`);
  console.log('WAL mode enabled');
}
main().finally(() => prisma.$disconnect());
