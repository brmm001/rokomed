import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../lib/api'
import { useAuthStore } from '../store/auth'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Stethoscope, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const { setAuth }             = useAuthStore()
  const navigate                = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { user, token } = await authApi.login({ email, password })
      setAuth(user, token)
      toast.success(`Bem-vindo de volta, ${user.name.split(' ')[0]}!`)
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao fazer login'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gradient-hero)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-10%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>

      <div className="animate-fade-in" style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, #3B82F6, #14B8A6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(59,130,246,0.3)',
          }}>
            <Stethoscope size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', margin: 0, fontFamily: 'Outfit', fontWeight: 800 }}>
            ResidênciaApp
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Acesse sua conta
          </p>
        </div>

        {/* Card */}
        <div className="glass" style={{ borderRadius: 16, padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    padding: 0,
                  }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: 8, padding: '0.875rem', fontSize: '0.9375rem' }}
            >
              {loading ? <span className="loader" style={{ width: 20, height: 20 }} /> : (
                <>Entrar <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Não tem conta?{' '}
            <Link to="/register" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>
              Criar conta grátis
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          Admin demo: admin@residencia.app / admin123
        </p>
      </div>
    </div>
  )
}
