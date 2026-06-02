import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../lib/api'
import { useAuthStore } from '../store/auth'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowLeft, Mail, Lock } from 'lucide-react'

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
          (window as any).google.accounts.id.renderButton(
            document.getElementById('google-login-btn'),
            { theme: 'outline', size: 'large', width: '380px', text: 'signin_with' }
          );
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
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] font-['Crimson_Pro',Georgia,serif] flex flex-col selection:bg-[#1D4ED8] selection:text-white">
      {/* Header */}
      <header className="p-6 border-b-2 border-[#111111] flex items-center justify-between bg-white sticky top-0 z-10">
        <Link to="/" className="font-['Abril_Fatface',Georgia,serif] text-xl text-[#111111] no-underline">
          Roko<em className="not-italic text-[#1D4ED8]">Med</em>
        </Link>
        <Link to="/" className="text-[#525252] hover:text-[#111111] transition-colors flex items-center gap-2 font-['IBM_Plex_Mono',monospace] text-xs uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
      </header>

      {/* Form Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <h1 className="font-['Abril_Fatface',Georgia,serif] text-4xl mb-2 text-[#111111] leading-tight text-center">
            Acesse sua conta
          </h1>
          <p className="text-[#525252] mb-10 font-light italic text-center">
            Seja bem-vindo de volta ao RokoMed.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 bg-white p-8 border-2 border-[#111111] shadow-[8px_8px_0px_0px_rgba(17,17,17,1)]">
            <div>
              <label className="block font-['IBM_Plex_Mono',monospace] text-[0.65rem] uppercase tracking-widest text-[#525252] mb-2">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[rgba(0,0,0,0.3)]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[#111111] bg-white text-[#111111] placeholder:text-[rgba(0,0,0,0.3)] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] transition-all rounded-none font-sans"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-['IBM_Plex_Mono',monospace] text-[0.65rem] uppercase tracking-widest text-[#525252]">Senha</label>
                <Link to="/forgot-password" className="block font-['IBM_Plex_Mono',monospace] text-[0.65rem] uppercase tracking-widest text-[#1D4ED8] hover:text-[#111111] transition-colors">
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[rgba(0,0,0,0.3)]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-[#111111] bg-white text-[#111111] placeholder:text-[rgba(0,0,0,0.3)] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] transition-all rounded-none font-sans"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[rgba(0,0,0,0.3)] hover:text-[#111111] transition-colors"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-[#111111] text-white font-['IBM_Plex_Mono',monospace] text-[0.75rem] uppercase tracking-widest py-4 px-6 hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
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

          {/* Google Sign-in Seperator & Button */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[rgba(0,0,0,0.18)]"></div></div>
            <span className="relative bg-[#FAFAFA] px-4 text-xs font-mono uppercase tracking-widest text-[#525252]">ou</span>
          </div>
          
          <div className="flex justify-center w-full mb-4">
            <div id="google-login-btn"></div>
          </div>

          <p className="text-center mt-8 font-['IBM_Plex_Mono',monospace] text-[0.65rem] tracking-widest uppercase text-[#525252]">
            Ainda não tem conta?{' '}
            <Link to="/checkout" className="text-[#1D4ED8] hover:text-[#111111] transition-colors border-b border-[#1D4ED8] hover:border-[#111111] pb-[1px]">
              Ver planos
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}
