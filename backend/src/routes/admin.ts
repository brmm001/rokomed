import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireRole } from '../middleware/auth'
import { randomUUID } from 'crypto'

// ── Institution map (mesma do script de import) ───────────────────────────────
const INSTITUTION_MAP: Record<string, { name: string; city?: string; state?: string }> = {
  UNICAMP:    { name: 'Universidade Estadual de Campinas',              city: 'Campinas',               state: 'SP' },
  USP:        { name: 'Universidade de São Paulo',                      city: 'São Paulo',              state: 'SP' },
  UNIFESP:    { name: 'Universidade Federal de São Paulo',              city: 'São Paulo',              state: 'SP' },
  AMRIGS:     { name: 'Associação Médica do Rio Grande do Sul',         city: 'Porto Alegre',           state: 'RS' },
  ENARE:      { name: 'Exame Nacional de Residência',                                                   state: 'BR' },
  UERJ:       { name: 'Universidade Estadual do Rio de Janeiro',        city: 'Rio de Janeiro',         state: 'RJ' },
  UFRJ:       { name: 'Universidade Federal do Rio de Janeiro',         city: 'Rio de Janeiro',         state: 'RJ' },
  UFMG:       { name: 'Universidade Federal de Minas Gerais',           city: 'Belo Horizonte',         state: 'MG' },
  FMUSP:      { name: 'Faculdade de Medicina da USP',                   city: 'São Paulo',              state: 'SP' },
  HCFMUSP:    { name: 'Hospital das Clínicas FMUSP',                   city: 'São Paulo',              state: 'SP' },
  'SUS-SP':   { name: 'SUS-SP',                                         city: 'São Paulo',              state: 'SP' },
  SANTA_CASA: { name: 'Santa Casa de São Paulo',                        city: 'São Paulo',              state: 'SP' },
  UFPR:       { name: 'Universidade Federal do Paraná',                 city: 'Curitiba',               state: 'PR' },
  UNESP:      { name: 'Universidade Estadual Paulista',                 city: 'São Paulo',              state: 'SP' },
  FAMERP:     { name: 'Faculdade de Medicina de São José do Rio Preto', city: 'São José do Rio Preto',  state: 'SP' },
  PUCRS:      { name: 'Pontifícia Universidade Católica do Rio Grande do Sul', city: 'Porto Alegre',   state: 'RS' },
  UFSC:       { name: 'Universidade Federal de Santa Catarina',         city: 'Florianópolis',          state: 'SC' },
  UFRGS:      { name: 'Universidade Federal do Rio Grande do Sul',      city: 'Porto Alegre',           state: 'RS' },
  CESUPA:     { name: 'Centro Universitário do Estado do Pará',         city: 'Belém',                  state: 'PA' },
  FMABC:      { name: 'Faculdade de Medicina do ABC',                   city: 'Santo André',            state: 'SP' },
  CMC:        { name: 'Colégio Médico de Córdoba',                                                      state: 'BR' },
}

function mapDificuldade(raw: string): 'FACIL' | 'MEDIO' | 'DIFICIL' {
  const lower = raw.toLowerCase()
  if (lower.includes('fácil') || lower.includes('facil')) return 'FACIL'
  if (lower.includes('difícil') || lower.includes('dificil')) return 'DIFICIL'
  return 'MEDIO'
}

const questionSchema = z.object({
  year:          z.number().optional(),
  statement:     z.string().min(10),
  options:       z.array(z.object({ letter: z.string().length(1), text: z.string().min(1) })).min(2),
  correctOption: z.string().length(1),
  explanation:   z.string().optional(),
  difficulty:    z.enum(['FACIL', 'MEDIO', 'DIFICIL']).default('MEDIO'),
  specialtyId:   z.string().optional(),
  institutionId: z.string().optional(),
  isPublished:   z.boolean().default(false),
})

export default async function adminRoutes(app: FastifyInstance) {
  const isAdmin = requireRole('ADMIN', 'SUPERADMIN')

  // ── Questões ─────────────────────────────────────────────────────────────

  // GET /api/admin/questions — todas as questões (incluindo não publicadas)
  app.get('/questions', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { page = '1', limit = '20' } = request.query as { page?: string; limit?: string }
    const p = parseInt(page), l = parseInt(limit)

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        skip: (p - 1) * l, take: l,
        orderBy: { createdAt: 'desc' },
        include: {
          specialty:   { select: { name: true } },
          institution: { select: { name: true, acronym: true } },
        },
      }),
      prisma.question.count(),
    ])

    return reply.send({ data: questions, total, page: p, totalPages: Math.ceil(total / l) })
  })

  // POST /api/admin/questions — criar questão
  app.post('/questions', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const parsed  = questionSchema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message })

    const question = await prisma.question.create({
      data: {
        ...parsed.data,
        options: JSON.stringify(parsed.data.options),
        createdById: payload.sub,
      },
    })

    await prisma.adminLog.create({
      data: { adminId: payload.sub, action: 'CREATE_QUESTION', target: question.id },
    })

    return reply.code(201).send({ question })
  })

  // PUT /api/admin/questions/:id — editar questão
  app.put('/questions/:id', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id }  = request.params as { id: string }
    const parsed  = questionSchema.partial().safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message })

    const updateData: any = { ...parsed.data }
    if (parsed.data.options) {
      updateData.options = JSON.stringify(parsed.data.options)
    }
    const question = await prisma.question.update({ where: { id }, data: updateData })

    await prisma.adminLog.create({
      data: { adminId: payload.sub, action: 'UPDATE_QUESTION', target: id },
    })

    return reply.send({ question })
  })

  // DELETE /api/admin/questions/:id
  app.delete('/questions/:id', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id }  = request.params as { id: string }

    await prisma.question.delete({ where: { id } })

    await prisma.adminLog.create({
      data: { adminId: payload.sub, action: 'DELETE_QUESTION', target: id },
    })

    return reply.send({ deleted: true })
  })

  // ── Imagens de Questões ───────────────────────────────────────────────────

  // GET /api/admin/questions/:id/images — listar imagens da questão
  app.get('/questions/:id/images', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const images = await prisma.questionImage.findMany({
      where: { questionId: id },
      orderBy: { order: 'asc' },
    })
    return reply.send({ images })
  })

  // POST /api/admin/questions/:id/images — adicionar imagem (base64 data URL)
  app.post('/questions/:id/images', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id }  = request.params as { id: string }

    const schema = z.object({
      url:     z.string().startsWith('data:image/').max(6 * 1024 * 1024, 'Imagem muito grande (máx 4MB)'),
      caption: z.string().max(255).optional(),
      order:   z.number().int().nonnegative().optional(),
    })

    const parsed = schema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message })

    // Calcula order como próximo disponível se não fornecido
    const nextOrder = parsed.data.order ?? await prisma.questionImage.count({ where: { questionId: id } })

    const image = await prisma.questionImage.create({
      data: {
        questionId: id,
        url:     parsed.data.url,
        caption: parsed.data.caption ?? null,
        order:   nextOrder,
      },
    })

    await prisma.adminLog.create({
      data: { adminId: payload.sub, action: 'ADD_QUESTION_IMAGE', target: id },
    })

    return reply.code(201).send({ image })
  })

  // PATCH /api/admin/questions/images/:imageId — editar caption ou order
  app.patch('/questions/images/:imageId', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { imageId } = request.params as { imageId: string }

    const schema = z.object({
      caption: z.string().max(255).nullable().optional(),
      order:   z.number().int().nonnegative().optional(),
    })

    const parsed = schema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message })

    const image = await prisma.questionImage.update({
      where: { id: imageId },
      data: {
        caption: parsed.data.caption === undefined ? undefined : parsed.data.caption,
        order:   parsed.data.order,
      },
    })

    return reply.send({ image })
  })

  // DELETE /api/admin/questions/images/:imageId — remover imagem
  app.delete('/questions/images/:imageId', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload  = request.user as { sub: string }
    const { imageId } = request.params as { imageId: string }

    const image = await prisma.questionImage.findUnique({ where: { id: imageId } })
    if (!image) return reply.code(404).send({ error: 'Imagem não encontrada' })

    await prisma.questionImage.delete({ where: { id: imageId } })

    await prisma.adminLog.create({
      data: { adminId: payload.sub, action: 'DELETE_QUESTION_IMAGE', target: imageId },
    })

    return reply.send({ deleted: true })
  })

  // ── Import de Questões (JSONL) ────────────────────────────────────────────

  // POST /api/admin/questions/import — upload de arquivo .jsonl de questões
  app.post('/questions/import', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }

    let fileContent = ''
    try {
      const data = await request.file()
      if (!data) return reply.code(400).send({ error: 'Nenhum arquivo enviado' })
      const chunks: Buffer[] = []
      for await (const chunk of data.file) chunks.push(chunk)
      fileContent = Buffer.concat(chunks).toString('utf-8')
    } catch {
      return reply.code(400).send({ error: 'Erro ao ler o arquivo' })
    }

    const lines = fileContent.split(/\r?\n/).filter(l => l.trim())
    let imported = 0, skipped = 0, errors = 0
    const errorMessages: string[] = []

    // Cache de instituições
    const instCache = new Map<string, string>()
    const existingInsts = await prisma.institution.findMany({ select: { id: true, acronym: true } })
    existingInsts.forEach(i => instCache.set(i.acronym, i.id))

    for (let i = 0; i < lines.length; i++) {
      try {
        const raw = JSON.parse(lines[i])
        const { instituicao, ano, numero_questao, enunciado_completo, alternativas } = raw

        if (!instituicao || !numero_questao || !enunciado_completo || !alternativas) {
          errors++
          errorMessages.push(`Linha ${i + 1}: campos obrigatórios ausentes`)
          continue
        }

        // Garantir instituição
        if (!instCache.has(instituicao)) {
          const mapped = INSTITUTION_MAP[instituicao]
          const inst = await prisma.institution.create({
            data: {
              id: randomUUID(),
              name: mapped?.name ?? instituicao,
              acronym: instituicao,
              city: mapped?.city,
              state: mapped?.state,
            },
          })
          instCache.set(instituicao, inst.id)
        }

        const code = `${instituicao}-${ano}-${numero_questao}`
        const institutionId = instCache.get(instituicao)!
        const statement = `<p>${enunciado_completo}</p>`
        const options = JSON.stringify(
          Object.entries(alternativas as Record<string, string>).map(([letter, text]) => ({ letter, text }))
        )

        // Upsert por code
        const existing = await prisma.question.findFirst({ where: { code } })
        if (existing) {
          await prisma.question.update({
            where: { id: existing.id },
            data: { statement, options, institutionId, year: ano ?? null },
          })
          skipped++
        } else {
          await prisma.question.create({
            data: {
              id: randomUUID(),
              code,
              year: ano ?? null,
              statement,
              options,
              difficulty: 'MEDIO',
              isPublished: false,
              flagCount: 0,
              institutionId,
            },
          })
          imported++
        }
      } catch (err: any) {
        errors++
        errorMessages.push(`Linha ${i + 1}: ${err?.message ?? 'Erro desconhecido'}`)
      }
    }

    await prisma.adminLog.create({
      data: {
        adminId: payload.sub,
        action: 'IMPORT_QUESTIONS',
        details: JSON.stringify({ imported, skipped, errors }),
      },
    })

    return reply.send({ imported, skipped, errors, total: lines.length, errorMessages: errorMessages.slice(0, 20) })
  })

  // POST /api/admin/questions/import-answers — upload de gabarito .jsonl
  app.post('/questions/import-answers', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }

    let fileContent = ''
    try {
      const data = await request.file()
      if (!data) return reply.code(400).send({ error: 'Nenhum arquivo enviado' })
      const chunks: Buffer[] = []
      for await (const chunk of data.file) chunks.push(chunk)
      fileContent = Buffer.concat(chunks).toString('utf-8')
    } catch {
      return reply.code(400).send({ error: 'Erro ao ler o arquivo' })
    }

    const lines = fileContent.split(/\r?\n/).filter(l => l.trim())
    let imported = 0, skipped = 0, errors = 0
    const errorMessages: string[] = []

    for (let i = 0; i < lines.length; i++) {
      try {
        const raw = JSON.parse(lines[i])
        const { instituicao, ano, numero_questao_original, resposta_correta, dificuldade,
                comentario_geral, raciocinio_por_alternativa, conteudo_completo } = raw

        if (!instituicao || !numero_questao_original || !resposta_correta) {
          errors++
          errorMessages.push(`Linha ${i + 1}: campos obrigatórios ausentes`)
          continue
        }

        const code = `${instituicao}-${ano}-${numero_questao_original}`
        const question = await prisma.question.findFirst({ where: { code } })

        if (!question) {
          skipped++
          errorMessages.push(`Linha ${i + 1}: questão ${code} não encontrada no banco`)
          continue
        }

        // Montar explanation completo
        let explanation = ''
        if (comentario_geral) explanation += `## Comentário Geral\n${comentario_geral}\n\n`
        if (raciocinio_por_alternativa && typeof raciocinio_por_alternativa === 'object') {
          explanation += `## Raciocínio por Alternativa\n`
          for (const [letra, texto] of Object.entries(raciocinio_por_alternativa)) {
            explanation += `**${letra}:** ${texto}\n\n`
          }
        }
        if (conteudo_completo) explanation += `## Conteúdo Completo\n${conteudo_completo}`

        await prisma.question.update({
          where: { id: question.id },
          data: {
            correctOption: resposta_correta,
            explanation: explanation.trim() || null,
            difficulty: dificuldade ? mapDificuldade(dificuldade) : undefined,
            isPublished: true,
          },
        })
        imported++
      } catch (err: any) {
        errors++
        errorMessages.push(`Linha ${i + 1}: ${err?.message ?? 'Erro desconhecido'}`)
      }
    }

    await prisma.adminLog.create({
      data: {
        adminId: payload.sub,
        action: 'IMPORT_ANSWERS',
        details: JSON.stringify({ imported, skipped, errors }),
      },
    })

    return reply.send({ imported, skipped, errors, total: lines.length, errorMessages: errorMessages.slice(0, 20) })
  })

  // ── Usuários ──────────────────────────────────────────────────────────────

  // GET /api/admin/users
  app.get('/users', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { page = '1', search = '' } = request.query as { page?: string; search?: string }
    const p = parseInt(page)

    const where = search ? {
      OR: [
        { name:  { contains: search } },
        { email: { contains: search } },
      ],
    } : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip: (p - 1) * 20, take: 20,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, plan: true, isBanned: true, createdAt: true, xp: true, streak: true },
      }),
      prisma.user.count({ where }),
    ])

    return reply.send({ data: users, total, page: p, totalPages: Math.ceil(total / 20) })
  })

  // PATCH /api/admin/users/:id/ban — banir/desbanir
  app.patch('/users/:id/ban', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload    = request.user as { sub: string }
    const { id }     = request.params as { id: string }
    const { banned } = request.body as { banned: boolean }

    const user = await prisma.user.update({ where: { id }, data: { isBanned: banned }, select: { id: true, isBanned: true } })

    await prisma.adminLog.create({
      data: { adminId: payload.sub, action: banned ? 'BAN_USER' : 'UNBAN_USER', target: id },
    })

    return reply.send({ user })
  })

  // PATCH /api/admin/users/:id/role — promover role
  app.patch('/users/:id/role', { preHandler: [requireRole('SUPERADMIN')] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id }  = request.params as { id: string }
    const { role } = request.body as { role: string }

    const user = await prisma.user.update({
      where: { id }, data: { role: role as 'ALUNO' | 'PROFESSOR' | 'ADMIN' | 'SUPERADMIN' },
      select: { id: true, role: true },
    })

    await prisma.adminLog.create({
      data: { adminId: payload.sub, action: 'UPDATE_ROLE', target: id, details: JSON.stringify({ role }) },
    })

    return reply.send({ user })
  })

  // ── Stats ─────────────────────────────────────────────────────────────────

  // GET /api/admin/stats
  app.get('/stats', { preHandler: [isAdmin] }, async (_request, reply) => {
    const today = new Date(); today.setHours(0, 0, 0, 0)

    const [totalQuestions, totalUsers, totalAnswers, usersToday, flaggedQuestions, trialAbuse] = await Promise.all([
      prisma.question.count(),
      prisma.user.count(),
      prisma.userAnswer.count(),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.question.count({ where: { flagCount: { gte: 3 } } }),
      prisma.trialIp.groupBy({ by: ['ip'], having: { ip: { _count: { gte: 3 } } }, _count: { ip: true } }),
    ])

    return reply.send({ totalQuestions, totalUsers, totalAnswers, usersToday, flaggedQuestions, suspiciousIps: trialAbuse.length })
  })

  // GET /api/admin/logs
  app.get('/logs', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { page = '1' } = request.query as { page?: string }
    const p = parseInt(page)

    const logs = await prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (p - 1) * 50, take: 50,
      include: { admin: { select: { name: true, email: true } } },
    })

    return reply.send({ data: logs })
  })

  // ── Especialidades e Instituições ─────────────────────────────────────────

  // GET /api/admin/specialties
  app.get('/specialties', { preHandler: [isAdmin] }, async (_request, reply) => {
    const specialties = await prisma.specialty.findMany({ orderBy: { name: 'asc' } })
    return reply.send({ data: specialties })
  })

  // POST /api/admin/specialties
  app.post('/specialties', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { name, slug, description, parentId, isGrandeArea } = request.body as { name: string; slug: string; description?: string; parentId?: string; isGrandeArea?: boolean }
    const specialty = await prisma.specialty.create({ data: { name, slug, description, parentId, isGrandeArea: !!isGrandeArea } })
    return reply.code(201).send({ specialty })
  })

  // PUT /api/admin/specialties/:id
  app.put('/specialties/:id', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id } = request.params as { id: string }
    const { name, slug, description, parentId, isGrandeArea } = request.body as {
      name?: string
      slug?: string
      description?: string | null
      parentId?: string | null
      isGrandeArea?: boolean
    }

    const specialty = await prisma.specialty.update({
      where: { id },
      data: {
        name,
        slug,
        description: description === undefined ? undefined : description,
        parentId: parentId === undefined ? undefined : parentId,
        isGrandeArea: isGrandeArea === undefined ? undefined : isGrandeArea,
      },
    })

    await prisma.adminLog.create({
      data: { adminId: payload.sub, action: 'UPDATE_SPECIALTY', target: id },
    })

    return reply.send({ specialty })
  })

  // DELETE /api/admin/specialties/:id
  app.delete('/specialties/:id', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id } = request.params as { id: string }

    await prisma.specialty.delete({ where: { id } })

    await prisma.adminLog.create({
      data: { adminId: payload.sub, action: 'DELETE_SPECIALTY', target: id },
    })

    return reply.send({ deleted: true })
  })

  // GET /api/admin/institutions
  app.get('/institutions', { preHandler: [isAdmin] }, async (_request, reply) => {
    const institutions = await prisma.institution.findMany({ orderBy: { acronym: 'asc' } })
    return reply.send({ data: institutions })
  })

  // POST /api/admin/institutions
  app.post('/institutions', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { name, acronym, city, state } = request.body as { name: string; acronym: string; city?: string; state?: string }
    const institution = await prisma.institution.create({ data: { name, acronym, city, state } })
    return reply.code(201).send({ institution })
  })

  // ── Abandoned Checkouts ──────────────────────────────────────────────────
  app.get('/abandoned-checkouts', { preHandler: [isAdmin] }, async (_request, reply) => {
    // Retorna usuários cujo plano é FREE e não têm assinaturas nem pagamentos aprovados recentes
    // Para simplificar, pegaremos usuários FREE criados nos últimos 7 dias.
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const leads = await prisma.user.findMany({
      where: {
        plan: 'FREE',
        createdAt: { gte: sevenDaysAgo }
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        payments: {
          select: { status: true, plan: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    return reply.send({ data: leads })
  })

  // ── Support Tickets ────────────────────────────────────────────────────────
  app.get('/support/tickets', { preHandler: [isAdmin] }, async (_request, reply) => {
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      }
    })
    return reply.send({ data: tickets })
  })

  app.get('/support/tickets/:id', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { name: true, role: true } } }
        }
      }
    })
    if (!ticket) return reply.code(404).send({ error: 'Not found' })
    return reply.send({ ticket })
  })

  app.post('/support/tickets/:id/messages', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id } = request.params as { id: string }
    const schema = z.object({ content: z.string().min(1) })
    const parsed = schema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message })

    const message = await prisma.supportMessage.create({
      data: {
        ticketId: id,
        senderId: payload.sub,
        content: parsed.data.content
      }
    })
    
    await prisma.supportTicket.update({
      where: { id },
      data: { updatedAt: new Date(), status: 'OPEN' } // ou algo similar
    })

    return reply.send({ message })
  })

  app.patch('/support/tickets/:id/status', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const { status } = request.body as { status: string }
    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: { status }
    })
    return reply.send({ ticket })
  })

  // ── Visitor Clicks ─────────────────────────────────────────────────────────
  app.get('/clicks', { preHandler: [isAdmin] }, async (_request, reply) => {
    const clicks = await prisma.visitorClick.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return reply.send({ data: clicks })
  })

  // ── Lessons CRUD ──────────────────────────────────────────────────────────
  const lessonSchema = z.object({
    title:       z.string().min(2),
    description: z.string().optional().nullable(),
    videoUrl:    z.string().url(),
    durationMin: z.number().optional().nullable(),
    specialtyId: z.string().optional().nullable(),
  })

  // POST /api/admin/lessons — criar aula
  app.post('/lessons', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const parsed  = lessonSchema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message })

    const lesson = await prisma.lesson.create({
      data: {
        title:       parsed.data.title,
        description: parsed.data.description || null,
        videoUrl:    parsed.data.videoUrl,
        durationMin: parsed.data.durationMin || null,
        specialtyId: parsed.data.specialtyId || null,
      }
    })

    await prisma.adminLog.create({
      data: { adminId: payload.sub, action: 'CREATE_LESSON', target: lesson.id },
    })

    return reply.code(201).send({ lesson })
  })

  // PUT /api/admin/lessons/:id — editar aula
  app.put('/lessons/:id', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id }  = request.params as { id: string }
    const parsed  = lessonSchema.partial().safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message })

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        title:       parsed.data.title,
        description: parsed.data.description === undefined ? undefined : parsed.data.description,
        videoUrl:    parsed.data.videoUrl,
        durationMin: parsed.data.durationMin === undefined ? undefined : parsed.data.durationMin,
        specialtyId: parsed.data.specialtyId === undefined ? undefined : parsed.data.specialtyId,
      }
    })

    await prisma.adminLog.create({
      data: { adminId: payload.sub, action: 'UPDATE_LESSON', target: id },
    })

    return reply.send({ lesson })
  })

  // DELETE /api/admin/lessons/:id — deletar aula
  app.delete('/lessons/:id', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const { id }  = request.params as { id: string }

    await prisma.lesson.delete({ where: { id } })

    await prisma.adminLog.create({
      data: { adminId: payload.sub, action: 'DELETE_LESSON', target: id },
    })

    return reply.send({ deleted: true })
  })

  // ── Priorities CRUD (Admin) ──────────────────────────────────────────────
  app.get('/priorities', { preHandler: [isAdmin] }, async (_request, reply) => {
    const priorities = await prisma.institutionPriority.findMany({
      include: {
        institution: { select: { acronym: true, name: true } },
        specialty: { select: { name: true } }
      }
    })
    return reply.send({ data: priorities })
  })

  app.post('/priorities', { preHandler: [isAdmin] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.user as { sub: string }
    const schema = z.object({
      institutionId: z.string(),
      specialtyId: z.string(),
      priority: z.enum(['MAXIMA', 'ALTA', 'MEDIA', 'BAIXA']),
    })

    const parsed = schema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.issues[0].message })

    const { institutionId, specialtyId, priority } = parsed.data

    const record = await prisma.institutionPriority.upsert({
      where: {
        institutionId_specialtyId: {
          institutionId,
          specialtyId
        }
      },
      update: { priority },
      create: { institutionId, specialtyId, priority }
    })

    await prisma.adminLog.create({
      data: {
        adminId: payload.sub,
        action: 'UPDATE_PRIORITY',
        target: record.id,
        details: JSON.stringify({ institutionId, specialtyId, priority })
      }
    })

    return reply.send({ success: true, priority: record })
  })
}


