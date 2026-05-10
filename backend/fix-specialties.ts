import { prisma } from './src/lib/prisma';

async function main() {
  const result = await prisma.specialty.updateMany({
    where: { parentId: null },
    data: { isGrandeArea: true },
  });
  console.log('Updated specialties:', result.count);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
