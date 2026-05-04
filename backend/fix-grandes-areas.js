const {PrismaClient} = require('@prisma/client');
const p = new PrismaClient();

// Grandes áreas médicas reais para residência
const GRANDES_AREAS = [
  'Cardiologia',
  'Cirurgia Geral',
  'Cirurgia Vascular',
  'Clínica Médica',
  'Coloproctologia',
  'Dermatologia',
  'Endocrinologia',
  'Gastroenterologia',
  'Ginecologia',
  'Ginecologia Oncológica',
  'Hematologia',
  'Hepatologia',
  'Infectologia',
  'Mastologia',
  'Medicina Preventiva',
  'Nefrologia',
  'Neonatologia',
  'Neurologia',
  'Obstetrícia',
  'Oftalmologia',
  'Ortopedia',
  'Otorrinolaringologia',
  'Pediatria',
  'Pneumologia',
  'Psiquiatria',
  'Radiologia',
  'Reumatologia',
  'SUS',
  'Urologia',
  'Ética Médica',
  'Epidemiologia',
  'Medicina Legal',
  'Cirurgia Pediátrica',
  'Cirurgia Plástica',
  'Cirurgia Torácica',
  'Emergência',
  'Medicina de Família',
  'Anestesiologia',
  'Patologia',
];

(async () => {
  // Reset all
  await p.specialty.updateMany({ data: { isGrandeArea: false } });

  let marked = 0;
  for (const name of GRANDES_AREAS) {
    const result = await p.specialty.updateMany({
      where: { name, parentId: null },
      data: { isGrandeArea: true },
    });
    if (result.count > 0) {
      marked++;
      console.log('  ✓ ' + name);
    } else {
      console.log('  ✗ ' + name + ' (não encontrada como raiz)');
    }
  }

  console.log('\nMarcadas: ' + marked + '/' + GRANDES_AREAS.length);

  // Verify
  const areas = await p.specialty.findMany({
    where: { isGrandeArea: true },
    select: { name: true, _count: { select: { children: true } } },
    orderBy: { name: 'asc' },
  });
  console.log('\nGrandes áreas ativas (' + areas.length + '):');
  areas.forEach(a => console.log('  ' + a.name + ' (' + a._count.children + ' temas)'));

  await p.$disconnect();
})();
