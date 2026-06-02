import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../lib/api'
import { useAuthStore } from '../store/auth'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Stethoscope, ArrowRight, Check, ArrowLeft } from 'lucide-react'
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
          
          const btnWidth = window.innerWidth < 420 ? '280' : '340'
          const btnElem = document.getElementById('google-register-btn')
          if (btnElem) {
            (window as any).google.accounts.id.renderButton(
              btnElem,
              { theme: 'outline', size: 'large', width: btnWidth, text: 'signup_with' }
            );
          }
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
    <div className="min-h-screen bg-[#050D1A] text-[#C8DCF5] font-sans flex flex-col selection:bg-[#3B7EF8] selection:text-white">
      {/* Header */}
      <header className="p-6 border-b border-[rgba(100,160,255,0.1)] flex items-center justify-between bg-[#050D1A]/80 backdrop-blur-md sticky top-0 z-50">
        <Link to="/" className="font-extrabold text-xl text-[#EBF4FF] no-underline tracking-tight">
          Roko<span className="text-[#3B7EF8]">Med</span>
        </Link>
        <Link to="/" className="text-[#7B9DBF] hover:text-[#EBF4FF] transition-colors flex items-center gap-2 font-mono text-xs uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
      </header>

      {/* Main Grid */}
      <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
        {/* Left Column — benefits (visible on desktop) */}
        <div className="hidden md:flex md:w-1/2 flex-col justify-center p-12 lg:p-24 border-r border-[rgba(100,160,255,0.1)] bg-[#0C1A2E]/30 relative">
          <div className="absolute inset-0 bg-radial-gradient from-[rgba(59,126,248,0.05)] to-transparent pointer-events-none"></div>
          <div className="max-w-md mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#3B7EF8] to-[#14B8A6] flex items-center justify-center shadow-[0_6px_24px_rgba(59,126,248,0.3)]">
                <Stethoscope size={22} color="white" />
              </div>
              <div>
                <div className="font-sans font-extrabold text-xl text-[#EBF4FF] tracking-tight">Roko<span className="text-[#3B7EF8]">Med</span></div>
                <div className="text-xs text-[#7B9DBF] font-mono uppercase tracking-wider">Banco de Questões para Residência</div>
              </div>
            </div>

            <h1 className="font-sans font-extrabold text-4xl mb-4 text-[#EBF4FF] tracking-tight leading-tight">
              Prepare-se para<br />
              <span className="bg-gradient-to-r from-[#3B7EF8] to-[#14B8A6] bg-clip-text text-transparent">
                passar na residência
              </span>
            </h1>
            <p className="text-[#7B9DBF] mb-8 font-medium leading-relaxed">
              Milhares de questões de USP, UNIFESP, ENARE e mais. Gabarito comentado, favoritos, anotações e IA tutor.
            </p>

            <div className="space-y-4">
              {benefits.map(b => (
                <div key={b} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-emerald-500" strokeWidth={3} />
                  </div>
                  <span className="text-[#EBF4FF] font-light text-sm">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column — registration form */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 relative">
          <div className="w-full max-w-md">
            
            {/* Logo for Mobile */}
            <div className="flex md:hidden items-center gap-3 mb-8 justify-center">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#3B7EF8] to-[#14B8A6] flex items-center justify-center">
                <Stethoscope size={18} color="white" />
              </div>
              <div className="font-sans font-extrabold text-lg text-[#EBF4FF] tracking-tight">
                Roko<span className="text-[#3B7EF8]">Med</span>
              </div>
            </div>

            <div className="p-8 border border-[rgba(100,160,255,0.15)] bg-[#0C1A2E]/50 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
              <h2 className="font-sans text-xl font-extrabold text-[#EBF4FF] tracking-tight mb-6 text-center">
                Criar conta grátis
              </h2>

              {/* Google Sign-up at the top for minimum friction */}
              <div className="flex justify-center w-full mb-6">
                <div id="google-register-btn"></div>
              </div>

              {/* Divider */}
              <div className="relative mb-6 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[rgba(100,160,255,0.1)]"></div></div>
                <span className="relative bg-[#0c1b2f] px-4 text-xs font-mono uppercase tracking-widest text-[#7B9DBF]">ou use seu e-mail</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-mono text-[0.65rem] uppercase tracking-widest text-[#7B9DBF] mb-2">Nome completo</label>
                  <input
                    id="name"
                    type="text"
                    className="block w-full px-4 py-3 border border-[rgba(100,160,255,0.15)] bg-[#0C1A2E]/50 text-[#EBF4FF] placeholder:text-[#3A5470] focus:outline-none focus:ring-1 focus:ring-[#3B7EF8] focus:border-[#3B7EF8] transition-all rounded-lg font-sans text-sm"
                    placeholder="Dr. João Silva"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block font-mono text-[0.65rem] uppercase tracking-widest text-[#7B9DBF] mb-2">E-mail</label>
                  <input
                    id="email"
                    type="email"
                    className="block w-full px-4 py-3 border border-[rgba(100,160,255,0.15)] bg-[#0C1A2E]/50 text-[#EBF4FF] placeholder:text-[#3A5470] focus:outline-none focus:ring-1 focus:ring-[#3B7EF8] focus:border-[#3B7EF8] transition-all rounded-lg font-sans text-sm"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[0.65rem] uppercase tracking-widest text-[#7B9DBF] mb-2">Senha</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPw ? 'text' : 'password'}
                      className="block w-full pl-4 pr-10 py-3 border border-[rgba(100,160,255,0.15)] bg-[#0C1A2E]/50 text-[#EBF4FF] placeholder:text-[#3A5470] focus:outline-none focus:ring-1 focus:ring-[#3B7EF8] focus:border-[#3B7EF8] transition-all rounded-lg font-sans text-sm"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7B9DBF] hover:text-[#EBF4FF] transition-colors"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  id="register-btn"
                  type="submit"
                  className="w-full mt-4 bg-[#3B7EF8] text-white font-semibold text-sm py-4 px-6 hover:bg-[#5B94FF] transition-all duration-200 flex items-center justify-center gap-2 group rounded-lg shadow-[0_4px_20px_rgba(59,126,248,0.25)]"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="animate-pulse">Criando conta...</span>
                  ) : (
                    <>Criar conta <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </form>

              <p className="text-center mt-6 text-sm text-[#7B9DBF]">
                Já tem conta?{' '}
                <Link to="/login" className="text-[#3B7EF8] hover:text-[#5B94FF] transition-colors font-semibold">Entrar</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
