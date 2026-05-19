import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../lib/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    document.title = 'Recuperar Senha — RokoMed'
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSuccess(true)
      toast.success('Se o e-mail existir, enviaremos as instruções!')
    } catch (err: unknown) {
      toast.error('Ocorreu um erro. Tente novamente mais tarde.')
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
        <Link to="/login" className="text-[#525252] hover:text-[#111111] transition-colors flex items-center gap-2 font-['IBM_Plex_Mono',monospace] text-xs uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Login
        </Link>
      </header>

      {/* Form Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <h1 className="font-['Abril_Fatface',Georgia,serif] text-4xl mb-2 text-[#111111] leading-tight text-center">
            Esqueceu a senha?
          </h1>
          <p className="text-[#525252] mb-10 font-light italic text-center">
            Digite seu e-mail abaixo e enviaremos um link mágico para você redefinir sua senha.
          </p>

          {success ? (
            <div className="bg-white p-8 border-2 border-[#111111] shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] text-center">
              <div className="w-16 h-16 bg-[#10B981]/20 text-[#10B981] rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="font-['IBM_Plex_Mono',monospace] text-lg mb-2">E-mail Enviado!</h3>
              <p className="text-[#525252] text-sm font-sans">
                Se o e-mail <strong>{email}</strong> estiver cadastrado, você receberá um link de recuperação em alguns minutos.
              </p>
              <p className="text-[#525252] text-xs italic mt-4 font-sans">
                (Não esqueça de checar o Spam)
              </p>
            </div>
          ) : (
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-[#111111] bg-white text-[#111111] placeholder:text-[rgba(0,0,0,0.3)] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] transition-all rounded-none font-sans"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-[#111111] text-white font-['IBM_Plex_Mono',monospace] text-[0.75rem] uppercase tracking-widest py-4 px-6 hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="animate-pulse">Enviando...</span>
                ) : (
                  <>
                    Enviar Link de Recuperação
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
