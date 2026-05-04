const {PrismaClient} = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  const roots = await p.specialty.findMany({
    where: { parentId: null },
    select: { id: true, name: true, _count: { select: { children: true } } },
    orderBy: { name: 'asc' },
  });

  const with3plus = roots.filter(r => r._count.children >= 3);
  console.log('Com >= 3 filhos (' + with3plus.length + '):');
  with3plus.forEach(r => console.log('  ' + r.name + ' (' + r._count.children + ' filhos)'));
  await p.$disconnect();
})();
