import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import dotenv from 'dotenv'

dotenv.config()

const app = Fastify({ logger: true })

// ── Plugins ────────────────────────────────────────────────────────────────
app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
})

app.register(jwt, {
  secret: process.env.JWT_SECRET || 'fallback-secret-change-me',
  sign: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
})

app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } })

// ── Routes ─────────────────────────────────────────────────────────────────
app.register(require('./routes/auth').default,          { prefix: '/api/auth' })
app.register(require('./routes/questions').default,     { prefix: '/api/questions' })
app.register(require('./routes/admin').default,         { prefix: '/api/admin' })
app.register(require('./routes/subscriptions').default, { prefix: '/api/subscriptions' })
app.register(require('./routes/user').default,          { prefix: '/api/user' })
app.register(require('./routes/simulados').default,     { prefix: '/api/simulados' })
app.register(require('./routes/adaptive').default,      { prefix: '/api/adaptive' })
app.register(require('./routes/analytics').default,     { prefix: '/api/analytics' })

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  env: process.env.NODE_ENV,
}))

// ── Start ──────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000
    await app.listen({ port, host: '0.0.0.0' })
    console.log(`🚀 ResidênciaApp API rodando em http://localhost:${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
