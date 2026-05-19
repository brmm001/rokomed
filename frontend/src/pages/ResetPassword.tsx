import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../lib/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = 'Nova Senha — RokoMed'
    if (!token) {
      toast.error('Token inválido ou ausente.')
      navigate('/login')
    }
  }, [token, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      await authApi.resetPassword(token, password)
      toast.success('Senha alterada com sucesso! Você já pode fazer login.')
      navigate('/login')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao alterar a senha. O token pode estar expirado.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!token) return null

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] font-['Crimson_Pro',Georgia,serif] flex flex-col selection:bg-[#1D4ED8] selection:text-white">
      {/* Header */}
      <header className="p-6 border-b-2 border-[#111111] flex items-center justify-between bg-white sticky top-0 z-10">
        <Link to="/" className="font-['Abril_Fatface',Georgia,serif] text-xl text-[#111111] no-underline">
          Roko<em className="not-italic text-[#1D4ED8]">Med</em>
        </Link>
        <Link to="/login" className="text-[#525252] hover:text-[#111111] transition-colors flex items-center gap-2 font-['IBM_Plex_Mono',monospace] text-xs uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Ir para Login
        </Link>
      </header>

      {/* Form Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <h1 className="font-['Abril_Fatface',Georgia,serif] text-4xl mb-2 text-[#111111] leading-tight text-center">
            Criar nova senha
          </h1>
          <p className="text-[#525252] mb-10 font-light italic text-center">
            Digite sua nova senha abaixo para recuperar seu acesso ao RokoMed.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 bg-white p-8 border-2 border-[#111111] shadow-[8px_8px_0px_0px_rgba(17,17,17,1)]">
            <div>
              <label className="block font-['IBM_Plex_Mono',monospace] text-[0.65rem] uppercase tracking-widest text-[#525252] mb-2">Nova Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[rgba(0,0,0,0.3)]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-[#111111] bg-white text-[#111111] placeholder:text-[rgba(0,0,0,0.3)] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] transition-all rounded-none font-sans"
                  placeholder="••••••••"
                  minLength={6}
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
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-[#111111] text-white font-['IBM_Plex_Mono',monospace] text-[0.75rem] uppercase tracking-widest py-4 px-6 hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-pulse">Salvando...</span>
              ) : (
                <>
                  Redefinir Senha
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
