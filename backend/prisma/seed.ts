import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // ── Especialidades ─────────────────────────────────────────────────────
  const specialties = [
    { name: 'Clínica Médica', slug: 'clinica-medica' },
    { name: 'Cirurgia Geral', slug: 'cirurgia-geral' },
    { name: 'Pediatria', slug: 'pediatria' },
    { name: 'Ginecologia e Obstetrícia', slug: 'ginecologia-obstetricia' },
    { name: 'Medicina Preventiva', slug: 'medicina-preventiva' },
    { name: 'Cardiologia', slug: 'cardiologia' },
    { name: 'Pneumologia', slug: 'pneumologia' },
    { name: 'Gastroenterologia', slug: 'gastroenterologia' },
    { name: 'Neurologia', slug: 'neurologia' },
    { name: 'Endocrinologia', slug: 'endocrinologia' },
  ]

  for (const s of specialties) {
    await prisma.specialty.upsert({ where: { slug: s.slug }, create: s, update: {} })
  }

  // ── Instituições ───────────────────────────────────────────────────────
  const institutions = [
    { name: 'Universidade de São Paulo', acronym: 'USP', city: 'São Paulo', state: 'SP' },
    { name: 'Universidade Federal de São Paulo', acronym: 'UNIFESP', city: 'São Paulo', state: 'SP' },
    { name: 'Seções de Residência Médica - ENARE', acronym: 'ENARE', state: 'BR' },
    { name: 'Hospital das Clínicas FMUSP', acronym: 'HCFMUSP', city: 'São Paulo', state: 'SP' },
    { name: 'Universidade Estadual do Rio de Janeiro', acronym: 'UERJ', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'Universidade Federal do Rio de Janeiro', acronym: 'UFRJ', city: 'Rio de Janeiro', state: 'RJ' },
    { name: 'SUS-SP', acronym: 'SUS-SP', city: 'São Paulo', state: 'SP' },
  ]

  for (const i of institutions) {
    await prisma.institution.upsert({ where: { acronym: i.acronym }, create: i, update: {} })
  }

  // ── Admin ──────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where:  { email: 'admin@residencia.app' },
    create: {
      name:         'Admin',
      email:        'admin@residencia.app',
      passwordHash: await bcrypt.hash('admin123', 12),
      role:         'SUPERADMIN',
      plan:         'PRO',
    },
    update: {},
  })

  // ── Questões de exemplo ────────────────────────────────────────────────
  const clinica  = await prisma.specialty.findUnique({ where: { slug: 'clinica-medica' } })
  const cardio   = await prisma.specialty.findUnique({ where: { slug: 'cardiologia' } })
  const usp      = await prisma.institution.findUnique({ where: { acronym: 'USP' } })
  const unifesp  = await prisma.institution.findUnique({ where: { acronym: 'UNIFESP' } })

  const questions = [
    {
      year: 2023,
      statement: `<p>Paciente do sexo masculino, 58 anos, hipertenso e diabético, apresenta dor precordial em aperto com irradiação para o braço esquerdo há 2 horas, associada a diaforese e dispneia. ECG mostra supradesnivelamento de ST em D2, D3 e aVF.</p><p>Qual é a conduta imediata mais adequada?</p>`,
      options: [
        { letter: 'A', text: 'Administrar morfina, oxigênio, nitrato e aspirina (MONA) e aguardar evolução' },
        { letter: 'B', text: 'Realizar angioplastia primária imediata (ICP primária)' },
        { letter: 'C', text: 'Administrar trombolítico e aguardar reperfusão' },
        { letter: 'D', text: 'Solicitar ecocardiograma de urgência antes de qualquer intervenção' },
        { letter: 'E', text: 'Realizar cardioversão elétrica sincronizada' },
      ],
      correctOption: 'B',
      explanation: '<p>O IAM com supradesnivelamento de ST (IAMCSST) inferior tem indicação de reperfusão imediata. A angioplastia primária (ICP) é o método de escolha quando disponível em menos de 90 minutos do primeiro contato médico. A morfina atualmente é questionada por poder mascarar sintomas e ter efeitos adversos hemodinâmicos.</p>',
      difficulty: 'MEDIO' as const,
      specialtyId: cardio?.id,
      institutionId: usp?.id,
      isPublished: true,
    },
    {
      year: 2022,
      statement: `<p>Uma mulher de 32 anos, grávida de 38 semanas, é internada com pressão arterial de 160/110 mmHg, cefaleia intensa, escotomas visuais e edema ++/4+ em membros inferiores. Não apresenta contrações. Exames laboratoriais mostram proteinúria de 3,5 g/24h, plaquetas 95.000/mm³, creatinina 1,4 mg/dL.</p><p>Qual é o diagnóstico e a conduta mais adequada?</p>`,
      options: [
        { letter: 'A', text: 'Pré-eclâmpsia grave — interrupção imediata da gestação' },
        { letter: 'B', text: 'Hipertensão gestacional — anti-hipertensivo oral e acompanhamento ambulatorial' },
        { letter: 'C', text: 'HELLP síndrome — corticoterapia e aguardar maturidade fetal' },
        { letter: 'D', text: 'Eclâmpsia — sulfato de magnésio e aguardar resolução das convulsões' },
        { letter: 'E', text: 'Pré-eclâmpsia leve — repouso em DLE e revisão em 48h' },
      ],
      correctOption: 'A',
      explanation: '<p>O quadro é de pré-eclâmpsia grave (PA ≥160/110, proteinúria >3g/24h, plaquetopenia, creatinina elevada, sintomas neurológicos). Com 38 semanas, a conduta é interrupção imediata da gestação. O sulfato de magnésio deve ser iniciado para prevenção de eclâmpsia durante o processo.</p>',
      difficulty: 'DIFICIL' as const,
      specialtyId: (await prisma.specialty.findUnique({ where: { slug: 'ginecologia-obstetricia' } }))?.id,
      institutionId: unifesp?.id,
      isPublished: true,
    },
    {
      year: 2023,
      statement: `<p>Criança de 3 anos é trazida ao pronto-socorro com febre de 39°C há 4 dias, exantema morbiliforme descamativo, língua em morango, edema de extremidades e conjuntivite bilateral não purulenta. Sem foco infeccioso identificado.</p><p>Qual é o diagnóstico mais provável e qual é o tratamento de escolha?</p>`,
      options: [
        { letter: 'A', text: 'Escarlatina — penicilina benzatina IM dose única' },
        { letter: 'B', text: 'Doença de Kawasaki — IGIV + AAS em dose anti-inflamatória' },
        { letter: 'C', text: 'Sarampo — suporte clínico e vitamina A' },
        { letter: 'D', text: 'Síndrome de Stevens-Johnson — corticoterapia sistêmica' },
        { letter: 'E', text: 'Febre reumática — penicilina + AAS em dose anti-inflamatória' },
      ],
      correctOption: 'B',
      explanation: '<p>A Doença de Kawasaki é diagnosticada clinicamente: febre ≥5 dias + 4 dos 5 critérios (exantema, conjuntivite, alterações de lábios/língua, adenopatia cervical, alterações de extremidades). O tratamento é IGIV 2g/kg dose única + AAS 80-100 mg/kg/dia. A língua em morango e a descamação são achados clássicos.</p>',
      difficulty: 'MEDIO' as const,
      specialtyId: (await prisma.specialty.findUnique({ where: { slug: 'pediatria' } }))?.id,
      institutionId: usp?.id,
      isPublished: true,
    },
    {
      year: 2022,
      statement: `<p>Homem de 45 anos, etilista crônico, com dor abdominal epigástrica intensa irradiando para o dorso, náuseas e vômitos há 12 horas. Lipase sérica: 3.200 U/L (VR <60). Ultrassonografia: vesícula com calculose.</p><p>Qual é a causa mais provável e a conduta inicial?</p>`,
      options: [
        { letter: 'A', text: 'Pancreatite alcoólica — jejum, hidratação vigorosa e analgesia' },
        { letter: 'B', text: 'Pancreatite biliar — colecistectomia laparoscópica de urgência' },
        { letter: 'C', text: 'Úlcera péptica perfurada — laparotomia exploradora de urgência' },
        { letter: 'D', text: 'Colecistite aguda — antibioticoterapia e colecistectomia eletiva' },
        { letter: 'E', text: 'Pancreatite biliar — jejum, hidratação e colecistectomia na mesma internação' },
      ],
      correctOption: 'E',
      explanation: '<p>Embora o paciente seja etilista, a presença de calculose vesicular indica a causa biliar como mais provável (regra: calcular sempre as causas biliares mesmo em etilistas). O tratamento da PA biliar inclui suporte clínico (jejum + hidratação + analgesia) e colecistectomia laparoscópica durante a mesma internação para evitar recidiva.</p>',
      difficulty: 'DIFICIL' as const,
      specialtyId: clinica?.id,
      institutionId: unifesp?.id,
      isPublished: true,
    },
    {
      year: 2021,
      statement: `<p>Sobre a prevenção primária do câncer de colo uterino, assinale a alternativa CORRETA:</p>`,
      options: [
        { letter: 'A', text: 'A vacina quadrivalente contra HPV é indicada apenas para meninas de 9 a 14 anos' },
        { letter: 'B', text: 'O rastreamento por Papanicolaou deve ter início aos 25 anos e intervalo trianual após dois exames normais' },
        { letter: 'C', text: 'Mulheres vacinadas contra HPV não precisam realizar Papanicolaou' },
        { letter: 'D', text: 'O rastreamento deve ser interrompido aos 60 anos independente do histórico de exames' },
        { letter: 'E', text: 'A colposcopia é o exame de rastreamento de escolha na população geral' },
      ],
      correctOption: 'B',
      explanation: '<p>Segundo o INCA/MS: citologia cérvico-vaginal iniciada aos 25 anos, com intervalo anual nos 2 primeiros anos e, se normais, trianual até os 65 anos. Mulheres vacinadas devem continuar fazendo rastreamento. O rastreamento só é suspenso após 2 exames negativos consecutivos após os 65 anos.</p>',
      difficulty: 'FACIL' as const,
      specialtyId: (await prisma.specialty.findUnique({ where: { slug: 'medicina-preventiva' } }))?.id,
      institutionId: usp?.id,
      isPublished: true,
    },
  ]

  for (const q of questions) {
    await prisma.question.create({
      data: {
        ...(q as Record<string, unknown>),
        options: JSON.stringify((q as { options: unknown }).options),
      } as Parameters<typeof prisma.question.create>[0]['data'],
    })
  }

  console.log('✅ Seed concluído!')
  console.log('   👤 Admin: admin@residencia.app / admin123')
  console.log(`   📚 ${questions.length} questões criadas`)
  console.log(`   🏥 ${specialties.length} especialidades`)
  console.log(`   🏛️  ${institutions.length} instituições`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
