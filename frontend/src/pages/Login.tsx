import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../lib/api'
import { useAuthStore } from '../store/auth'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowLeft, Mail, Lock, Stethoscope } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const { setAuth }             = useAuthStore()
  const navigate                = useNavigate()
  const [searchParams]          = useSearchParams()
  const redirectUrl             = searchParams.get('redirect')

  useEffect(() => {
    document.title = 'Entrar — RokoMed'

    // Initialize Google Sign-In button
    const initializeGoogle = () => {
      if (typeof window !== 'undefined' && (window as any).google) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '958197775916-g2d0013h7b5a837c7.apps.googleusercontent.com',
            callback: handleGoogleResponse,
          });
          
          const btnWidth = window.innerWidth < 420 ? '280' : '340'
          const btnElem = document.getElementById('google-login-btn')
          if (btnElem) {
            (window as any).google.accounts.id.renderButton(
              btnElem,
              { theme: 'outline', size: 'large', width: btnWidth, text: 'signin_with' }
            );
          }
        } catch (e) {
          console.error('Google Sign-In initialization failed:', e)
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
      toast.success(`Bem-vindo, ${user.name.split(' ')[0]}!`)
      navigate(redirectUrl || '/dashboard')
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Erro ao autenticar com o Google'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { user, token } = await authApi.login({ email, password })
      setAuth(user, token)
      toast.success(`Bem-vindo de volta, ${user.name.split(' ')[0]}!`)
      navigate(redirectUrl || '/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao fazer login'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050D1A] text-[#C8DCF5] font-sans flex flex-col selection:bg-[#3B7EF8] selection:text-white relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-radial-gradient from-[rgba(59,126,248,0.04)] to-transparent pointer-events-none z-0"></div>

      {/* Header */}
      <header className="p-6 border-b border-[rgba(100,160,255,0.1)] flex items-center justify-between bg-[#050D1A]/80 backdrop-blur-md sticky top-0 z-50">
        <Link to="/" className="font-extrabold text-xl text-[#EBF4FF] no-underline tracking-tight">
          Roko<span className="text-[#3B7EF8]">Med</span>
        </Link>
        <Link to="/" className="text-[#7B9DBF] hover:text-[#EBF4FF] transition-colors flex items-center gap-2 font-mono text-xs uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
      </header>

      {/* Form Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Logo / Brand Header */}
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#3B7EF8] to-[#14B8A6] flex items-center justify-center">
              <Stethoscope size={18} color="white" />
            </div>
            <div className="font-sans font-extrabold text-lg text-[#EBF4FF] tracking-tight">
              Roko<span className="text-[#3B7EF8]">Med</span>
            </div>
          </div>

          <div className="p-8 border border-[rgba(100,160,255,0.15)] bg-[#0C1A2E]/50 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
            <h1 className="font-sans text-xl font-extrabold text-[#EBF4FF] tracking-tight mb-6 text-center">
              Acesse sua conta
            </h1>

            {/* Google Sign-in at the top for minimum friction */}
            <div className="flex justify-center w-full mb-6">
              <div id="google-login-btn"></div>
            </div>

            {/* Divider */}
            <div className="relative mb-6 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[rgba(100,160,255,0.1)]"></div></div>
              <span className="relative bg-[#0c1b2f] px-4 text-xs font-mono uppercase tracking-widest text-[#7B9DBF]">ou use seu e-mail</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-[0.65rem] uppercase tracking-widest text-[#7B9DBF] mb-2">E-mail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3A5470]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-[rgba(100,160,255,0.15)] bg-[#0C1A2E]/50 text-[#EBF4FF] placeholder:text-[#3A5470] focus:outline-none focus:ring-1 focus:ring-[#3B7EF8] focus:border-[#3B7EF8] transition-all rounded-lg font-sans text-sm"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block font-mono text-[0.65rem] uppercase tracking-widest text-[#7B9DBF]">Senha</label>
                  <Link to="/forgot-password" className="block font-mono text-[0.65rem] uppercase tracking-widest text-[#3B7EF8] hover:text-[#5B94FF] transition-colors">
                    Esqueci a senha
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3A5470]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-[rgba(100,160,255,0.15)] bg-[#0C1A2E]/50 text-[#EBF4FF] placeholder:text-[#3A5470] focus:outline-none focus:ring-1 focus:ring-[#3B7EF8] focus:border-[#3B7EF8] transition-all rounded-lg font-sans text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7B9DBF] hover:text-[#EBF4FF] transition-colors"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-btn"
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-[#3B7EF8] text-white font-semibold text-sm py-4 px-6 hover:bg-[#5B94FF] transition-all duration-200 flex items-center justify-center gap-2 group rounded-lg shadow-[0_4px_20px_rgba(59,126,248,0.25)]"
              >
                {loading ? (
                  <span className="animate-pulse">Autenticando...</span>
                ) : (
                  <>
                    Entrar na Plataforma
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </>
                )}
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-[#7B9DBF]">
              Ainda não tem conta?{' '}
              <Link to="/checkout" className="text-[#3B7EF8] hover:text-[#5B94FF] transition-colors font-semibold">
                Ver planos
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
