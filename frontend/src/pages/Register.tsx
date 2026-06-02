import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../lib/api'
import { useAuthStore } from '../store/auth'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Stethoscope, ArrowRight, Check } from 'lucide-react'
import { trackClick } from '../lib/tracker'

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

  useEffect(() => {
    document.title = 'Criar Conta — RokoMed'

    // Initialize Google Sign-In button
    const initializeGoogle = () => {
      if (typeof window !== 'undefined' && (window as any).google) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '958197775916-g2d0013h7b5a837c7.apps.googleusercontent.com',
            callback: handleGoogleResponse,
          });
          (window as any).google.accounts.id.renderButton(
            document.getElementById('google-register-btn'),
            { theme: 'outline', size: 'large', width: '380px', text: 'signup_with' }
          );
        } catch (e) {
          console.error('Google Sign-Up initialization failed:', e)
        }
      } else {
        setTimeout(initializeGoogle, 500)
      }
    }

    initializeGoogle()
  }, [])

  const handleGoogleResponse = async (response: any) => {
    setLoading(true)
    try {
      const { token, user } = await authApi.googleLogin(response.credential)
      setAuth(user, token)
      toast.success(`Conta ativada com sucesso! Bem-vindo, ${user.name.split(' ')[0]}!`)
      navigate('/dashboard')
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Erro ao criar conta com o Google'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      trackClick('REGISTER_SUBMIT', email)
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
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem' }}>RokoMed</div>
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

          {/* Divider */}
          <div style={{ position: 'relative', margin: '1.5rem 0', textAlign: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}><div style={{ width: '100%', borderTop: '1px solid var(--border)' }}></div></div>
            <span style={{ position: 'relative', background: 'var(--bg-surface, #121214)', padding: '0 1rem', fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>ou</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '1rem' }}>
            <div id="google-register-btn"></div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Já tem conta?{' '}
            <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
