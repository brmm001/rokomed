import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../lib/api'
import { useAuthStore } from '../store/auth'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Stethoscope, ArrowRight, Check } from 'lucide-react'

const benefits = [
  '10 questões gratuitas por dia',
  'Acesso ao gabarito comentado',
  'Salve questões nos favoritos',
  '7 dias de trial grátis',
]

export default function RegisterPage() {
  const [name, setName]         = useState('')
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
      const { user, token } = await authApi.register({ name, email, password })
      setAuth(user, token)
      toast.success('Conta criada com sucesso!')
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao criar conta'
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
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div className="animate-fade-in" style={{ width: '100%', maxWidth: 860, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
        {/* Left — benefits */}
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #3B82F6, #14B8A6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px rgba(59,130,246,0.3)' }}>
              <Stethoscope size={22} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem' }}>ResidênciaApp</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Banco de Questões para Residência</div>
            </div>
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem', lineHeight: 1.2 }}>
            Prepare-se para<br />
            <span style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              passar na residência
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Milhares de questões de USP, UNIFESP, ENARE e mais. Gabarito comentado, favoritos, anotações e IA tutor.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {benefits.map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={12} color="#10B981" strokeWidth={3} />
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div className="glass" style={{ borderRadius: 16, padding: '2rem' }}>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.375rem', marginBottom: '1.5rem', fontWeight: 700 }}>
            Criar conta grátis
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Nome completo</label>
              <input id="name" type="text" className="input" placeholder="Dr. João Silva" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>E-mail</label>
              <input id="email" type="email" className="input" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  className="input"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required minLength={6}
                  style={{ paddingRight: '2.75rem' }}
                />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button id="register-btn" type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 8, padding: '0.875rem', fontSize: '0.9375rem' }}>
              {loading ? <span className="loader" style={{ width: 20, height: 20 }} /> : (
                <>Criar conta <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Já tem conta?{' '}
            <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
