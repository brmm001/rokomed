import { prisma } from './src/lib/prisma';

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) return;
  const exam = await prisma.mockExam.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
  if (!exam) return;
  
  try {
    const updated = await prisma.mockExam.update({
      where: { id: exam.id },
      data: { status: 'IN_PROGRESS', startedAt: exam.startedAt ?? new Date() },
    });
    console.log('Update success:', updated.id);
  } catch (e) {
    console.log('Update error:', e);
  }
}
main().catch(console.error).finally(() => process.exit(0));
