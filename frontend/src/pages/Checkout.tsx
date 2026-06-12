import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ShieldCheck, Mail, Lock, User, CreditCard } from 'lucide-react'
import api, { authApi, subscriptionApi } from '../lib/api'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/auth'
import toast from 'react-hot-toast'
import { trackClick } from '../lib/tracker'

type PlanType = 'monthly' | 'semiannual' | 'annual'

type PlanDetail = {
  title: string;
  price: string;
  total?: string;
  description: string;
  features: string[];
}

const PLAN_DETAILS: Record<PlanType, PlanDetail> = {
  monthly: {
    title: 'Plano Mensal',
    price: 'R$ 29,00',
    description: 'Acesso completo com renovação automática. Cancele quando quiser.',
    features: ['Acesso a todo o banco de questões', 'Simulados por especialidade', 'Gabaritos comentados']
  },
  semiannual: {
    title: 'Plano Semestral',
    price: '6x de R$ 16,16',
    total: 'Total à vista: R$ 97,00',
    description: 'Nosso plano mais vendido. Sem renovação automática.',
    features: ['Tudo do plano Mensal', 'Simulados personalizados por IA', 'Suporte prioritário']
  },
  annual: {
    title: 'Plano Anual',
    price: '12x de R$ 12,25',
    total: 'Total à vista: R$ 147,00',
    description: 'O melhor custo-benefício. Sem renovação automática.',
    features: ['Tudo do plano Semestral', 'Flashcards integrados', 'Planilha de evolução exportável']
  }
}

export default function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialPlan = (searchParams.get('plan') as PlanType) || 'monthly'
  const [plan, setPlan] = useState<PlanType>(initialPlan)

  const [step, setStep] = useState<1 | 2>(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore(state => state.setAuth)

  // Centralized pricing API query
  const { data: plansData } = useQuery({
    queryKey: ['plans'],
    queryFn: subscriptionApi.plans,
  })



  useEffect(() => {
    document.title = 'Finalizar Compra — RokoMed'
    window.scrollTo(0, 0)
    const token = useAuthStore.getState().token
    if (token) {
      setStep(2)
    }
    // Dispara evento de "Begin checkout" do Google Ads
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'conversion', {
        'send_to': 'AW-625816226/xTf7CODz5OAZEKLltKoC',
        'value': 1.0,
        'currency': 'BRL'
      });
    }
    if (typeof (window as any).fbq === 'function') {
      (window as any).fbq('track', 'InitiateCheckout');
    }

    // Google Sign-In button initializer
    const initializeGoogle = () => {
      const currentToken = useAuthStore.getState().token
      if (step === 1 && !currentToken && typeof window !== 'undefined' && (window as any).google) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '958197775916-g2d0013h7b5a837c7.apps.googleusercontent.com',
            callback: handleGoogleResponse,
          });
          const btnElem = document.getElementById('google-checkout-btn')
          if (btnElem) {
            (window as any).google.accounts.id.renderButton(
              btnElem,
              { theme: 'outline', size: 'large', width: '380px', text: 'signup_with' }
            );
          }
        } catch (e) {
          console.error('Google Sign-In initialization failed:', e)
        }
      } else if (step === 1 && !currentToken) {
        setTimeout(initializeGoogle, 500)
      }
    }

    initializeGoogle()
  }, [step])

  const handleGoogleResponse = async (response: any) => {
    setLoading(true)
    try {
      const { token, user } = await authApi.googleLogin(response.credential)
      setAuth(user, token)
      // Garante que o axios use o token novo
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      toast.success(`Conta ativada com sucesso! Bem-vindo, ${user.name.split(' ')[0]}!`)
      setStep(2)
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Erro ao autenticar com o Google'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      trackClick('CHECKOUT_SUBMIT', formData.email)
      const currentToken = useAuthStore.getState().token

      if (!currentToken) {
        // Usuário não logado: registrar primeiro, depois fazer checkout
        try {
          const authRes = await api.post('/auth/register', {
            name: formData.name,
            email: formData.email,
            password: formData.password
          })
          setAuth(authRes.data.user, authRes.data.token)
          api.defaults.headers.common['Authorization'] = `Bearer ${authRes.data.token}`
        } catch (err: any) {
          if (err.response?.status === 409) {
            toast.error('Este e-mail já está cadastrado. Por favor, faça login primeiro.', {
              duration: 5000,
              icon: '👋'
            });
            navigate('/login?redirect=/checkout?plan=' + plan);
            return;
          }
          throw err;
        }
      }

      // Inicia checkout Mercado Pago
      const subRes = await api.post('/subscriptions/checkout', { plan })
      if (subRes.data.checkoutUrl) {
        window.location.href = subRes.data.checkoutUrl
      } else {
        toast.error('Erro ao gerar link de pagamento')
      }
    } catch (err) {
      toast.error('Ocorreu um erro ao processar o checkout')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const plansConfig = plansData || {}
  const selectedPlan = plansConfig[plan] || PLAN_DETAILS[plan]

  // Preço base
  const baseAmount = selectedPlan.amount || (plan === 'annual' ? 147 : plan === 'semiannual' ? 97 : 29)

  const formatMoney = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return (
    <div className="min-h-screen bg-[#050D1A] text-[#C8DCF5] font-sans flex flex-col md:flex-row selection:bg-[#3B7EF8] selection:text-white">
      {/* LEFT COLUMN: Checkout Form */}
      <div className="flex-1 flex flex-col min-h-screen relative border-r border-[rgba(100,160,255,0.1)]">
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
          <div className="w-full max-w-md">
            
            {/* Progress indicators */}
            <div className="flex items-center gap-3 mb-10">
              <div className={`flex items-center gap-2 font-mono text-[0.65rem] tracking-widest uppercase ${step === 1 ? 'text-[#3B7EF8]' : 'text-[#EBF4FF]'}`}>
                <span className={`flex items-center justify-center w-5 h-5 border rounded-full text-[10px] ${step === 1 ? 'border-[#3B7EF8] bg-[#3B7EF8]/10' : 'border-[#3B7EF8] bg-[#3B7EF8] text-white'}`}>
                  {step === 2 ? <CheckCircle2 className="w-3 h-3 text-white" /> : '1'}
                </span>
                Dados
              </div>
              <div className="h-px bg-[rgba(100,160,255,0.1)] flex-1"></div>
              <div className={`flex items-center gap-2 font-mono text-[0.65rem] tracking-widest uppercase ${step === 2 ? 'text-[#3B7EF8]' : 'text-[#7B9DBF]'}`}>
                <span className={`flex items-center justify-center w-5 h-5 border rounded-full text-[10px] ${step === 2 ? 'border-[#3B7EF8] bg-[#3B7EF8]/10' : 'border-[rgba(100,160,255,0.2)]'}`}>
                  2
                </span>
                Pagamento
              </div>
            </div>

            {step === 1 ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="font-extrabold text-3xl mb-2 text-[#EBF4FF] tracking-tight leading-tight">
                  Crie sua conta
                </h1>
                <p className="text-[#7B9DBF] mb-8 font-medium">
                  Falta pouco para você acessar o melhor banco de questões.
                </p>

                <form onSubmit={handleNextStep} className="space-y-5">
                  <div>
                    <label className="block font-mono text-[0.65rem] uppercase tracking-widest text-[#7B9DBF] mb-2">Nome completo</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3A5470]">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="block w-full pl-10 pr-3 py-3 border border-[rgba(100,160,255,0.15)] bg-[#0C1A2E]/50 text-[#EBF4FF] placeholder:text-[#3A5470] focus:outline-none focus:ring-1 focus:ring-[#3B7EF8] focus:border-[#3B7EF8] transition-all rounded-lg font-sans text-sm"
                        placeholder="Dr. João Silva"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[0.65rem] uppercase tracking-widest text-[#7B9DBF] mb-2">E-mail</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3A5470]">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="block w-full pl-10 pr-3 py-3 border border-[rgba(100,160,255,0.15)] bg-[#0C1A2E]/50 text-[#EBF4FF] placeholder:text-[#3A5470] focus:outline-none focus:ring-1 focus:ring-[#3B7EF8] focus:border-[#3B7EF8] transition-all rounded-lg font-sans text-sm"
                        placeholder="joao@exemplo.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[0.65rem] uppercase tracking-widest text-[#7B9DBF] mb-2">Senha</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3A5470]">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        required
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="block w-full pl-10 pr-3 py-3 border border-[rgba(100,160,255,0.15)] bg-[#0C1A2E]/50 text-[#EBF4FF] placeholder:text-[#3A5470] focus:outline-none focus:ring-1 focus:ring-[#3B7EF8] focus:border-[#3B7EF8] transition-all rounded-lg font-sans text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-6 bg-[#3B7EF8] text-white font-semibold text-sm py-4 px-6 hover:bg-[#5B94FF] transition-all duration-200 flex items-center justify-center gap-2 group rounded-lg shadow-[0_4px_20px_rgba(59,126,248,0.25)]"
                  >
                    Continuar para pagamento
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </form>

                {/* Google Sign-in Divider & Button */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[rgba(100,160,255,0.1)]"></div></div>
                  <span className="relative bg-[#050D1A] px-4 text-xs font-mono uppercase tracking-widest text-[#7B9DBF]">ou</span>
                </div>

                <div className="flex justify-center w-full mb-4">
                  <div id="google-checkout-btn"></div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h1 className="font-extrabold text-3xl mb-2 text-[#EBF4FF] tracking-tight leading-tight">
                  Pagamento Seguro
                </h1>
                <p className="text-[#7B9DBF] mb-8 font-medium">
                  Você será redirecionado para o Mercado Pago para finalizar a transação com total segurança.
                </p>

                <div className="p-5 border border-[rgba(100,160,255,0.15)] bg-[#0C1A2E]/50 rounded-lg mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="w-5 h-5 text-[#3B7EF8]" />
                    <span className="font-mono text-xs uppercase tracking-widest font-semibold text-[#EBF4FF]">Ambiente Seguro</span>
                  </div>
                  <p className="text-[#7B9DBF] text-sm leading-relaxed">
                    Nós utilizamos o <strong>Mercado Pago</strong> para processar nossos pagamentos. Seus dados de cartão não são armazenados em nossos servidores.
                  </p>
                </div>

                <form onSubmit={handleCheckout} className="space-y-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#3B7EF8] text-white font-semibold text-sm py-4 px-6 hover:bg-[#5B94FF] transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed rounded-lg shadow-[0_4px_20px_rgba(59,126,248,0.25)]"
                  >
                    {loading ? (
                      <span className="animate-pulse">Processando...</span>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Ir para Mercado Pago
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full bg-transparent text-[#7B9DBF] font-semibold text-xs uppercase tracking-widest py-3 px-6 hover:text-[#EBF4FF] transition-colors"
                  >
                    Voltar e editar dados
                  </button>
                </form>
              </div>
            )}
            
            {/* Footer Trust symbols */}
            <div className="mt-12 pt-6 border-t border-[rgba(100,160,255,0.1)] text-center">
              <p className="font-mono text-[0.6rem] text-[#3A5470] tracking-widest uppercase">
                Pagamento processado por Mercado Pago
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Order Summary */}
      <div className="w-full md:w-[450px] lg:w-[500px] bg-[#0C1A2E] text-white p-6 md:p-12 flex flex-col justify-center relative">
        <div className="absolute inset-0 bg-radial-gradient from-[rgba(59,126,248,0.05)] to-transparent pointer-events-none z-0"></div>
        
        <div className="mb-10 relative z-10">
          <h2 className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7B9DBF] mb-6">Resumo do Pedido</h2>
          
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-extrabold text-3xl text-[#EBF4FF] tracking-tight">{selectedPlan.title}</h3>
            <button 
              className="font-mono text-[0.65rem] text-[#3B7EF8] hover:text-white transition-all duration-200 uppercase tracking-widest border border-[#3B7EF8] hover:border-white px-3 py-1 rounded"
              onClick={() => {
                navigate('/#planos')
              }}
            >
              Trocar
            </button>
          </div>
          <p className="text-[#7B9DBF] font-medium mb-8">
            {selectedPlan.description}
          </p>

          <div className="space-y-4 mb-8 pt-6 border-t border-[rgba(100,160,255,0.1)]">
            {selectedPlan.features.map((feature: string, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />
                <span className="text-[#EBF4FF] font-light text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-[rgba(100,160,255,0.1)] relative z-10">
          <div className="flex justify-between items-end mb-2">
            <span className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7B9DBF]">A pagar hoje</span>
            <div className="text-right">
              {selectedPlan.total && (
                <div className="font-mono text-[0.65rem] text-[#7B9DBF] uppercase tracking-widest mb-1">
                  {selectedPlan.total}
                </div>
              )}
              <div className="font-extrabold text-4xl text-[#EBF4FF] tracking-tight">
                {selectedPlan.price}
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}
