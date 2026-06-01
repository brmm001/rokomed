import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ShieldCheck, Mail, Lock, User, CreditCard } from 'lucide-react'
import api, { subscriptionApi } from '../lib/api'
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
    price: '6x de R$ 19,00',
    total: 'Total à vista: R$ 97,00',
    description: 'Nosso plano mais vendido. Sem renovação automática.',
    features: ['Tudo do plano Mensal', 'Simulados personalizados por IA', 'Suporte prioritário']
  },
  annual: {
    title: 'Plano Anual',
    price: '12x de R$ 15,00',
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

  // Centralized pricing API query
  const { data: plansData } = useQuery({
    queryKey: ['plans'],
    queryFn: subscriptionApi.plans,
  })

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    type: 'percent' | 'fixed'
    value: number
  } | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  const handleApplyCoupon = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!couponCode.trim()) return

    setCouponLoading(true)
    setCouponError('')
    try {
      const res = await subscriptionApi.validateCoupon(couponCode)
      setAppliedCoupon(res)
      toast.success('Cupom aplicado com sucesso!')
    } catch (err: any) {
      setAppliedCoupon(null)
      const msg = err.response?.data?.error || 'Cupom inválido ou expirado.'
      setCouponError(msg)
      toast.error(msg)
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  useEffect(() => {
    document.title = 'Finalizar Compra — RokoMed'
    const token = useAuthStore.getState().token
    if (token) {
      setStep(2)
    }
    // Dispara evento de "Begin checkout" do Google Ads
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'conversion', {
        'send_to': 'AW-625816226/xTf7CODz5OAZEKLltKoC'
      });
    }
  }, [])

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const setAuth = useAuthStore(state => state.setAuth)
  // FIX #6: Sempre lê o token mais recente do store (evita stale closure)
  const token = useAuthStore.getState().token

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      trackClick('CHECKOUT_SUBMIT', formData.email)
      // FIX #6: Sempre lê o token mais atualizado do store no momento do submit
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
          // Garante que o interceptor do axios use o token reciém-gravado
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

      // Inicia checkout Mercado Pago (token já estará no header via interceptor ou header direto acima)
      const subRes = await api.post('/subscriptions/checkout', { plan, couponCode: appliedCoupon?.code })
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
  
  let discountAmount = 0
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discountAmount = (baseAmount * appliedCoupon.value) / 100
    } else if (appliedCoupon.type === 'fixed') {
      discountAmount = appliedCoupon.value
    }
  }
  const finalAmount = Math.max(0.1, baseAmount - discountAmount)

  const formatMoney = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const finalAmountFormatted = formatMoney(finalAmount)

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] font-['Crimson_Pro',Georgia,serif] flex flex-col md:flex-row selection:bg-[#1D4ED8] selection:text-white">
      {/* LEFT COLUMN: Checkout Form */}
      <div className="flex-1 flex flex-col min-h-screen relative border-r-2 border-[#111111]">
        {/* Header */}
        <header className="p-6 border-b-2 border-[#111111] flex items-center justify-between bg-white">
          <Link to="/" className="font-['Abril_Fatface',Georgia,serif] text-xl text-[#111111] no-underline">
            Roko<em className="not-italic text-[#1D4ED8]">Med</em>
          </Link>
          <Link to="/" className="text-[#525252] hover:text-[#111111] transition-colors flex items-center gap-2 font-['IBM_Plex_Mono',monospace] text-xs uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </header>

        {/* Form Container */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            
            {/* Progress indicators */}
            <div className="flex items-center gap-3 mb-10">
              <div className={`flex items-center gap-2 font-['IBM_Plex_Mono',monospace] text-[0.65rem] tracking-widest uppercase ${step === 1 ? 'text-[#1D4ED8]' : 'text-[#111111]'}`}>
                <span className={`flex items-center justify-center w-5 h-5 border rounded-full ${step === 1 ? 'border-[#1D4ED8] bg-[#1D4ED8]/10' : 'border-[#111111] bg-[#111111] text-white'}`}>
                  {step === 2 ? <CheckCircle2 className="w-3 h-3" /> : '1'}
                </span>
                Dados
              </div>
              <div className="h-px bg-[rgba(0,0,0,0.18)] flex-1"></div>
              <div className={`flex items-center gap-2 font-['IBM_Plex_Mono',monospace] text-[0.65rem] tracking-widest uppercase ${step === 2 ? 'text-[#1D4ED8]' : 'text-[#525252]'}`}>
                <span className={`flex items-center justify-center w-5 h-5 border rounded-full ${step === 2 ? 'border-[#1D4ED8] bg-[#1D4ED8]/10' : 'border-[rgba(0,0,0,0.18)]'}`}>
                  2
                </span>
                Pagamento
              </div>
            </div>

            {step === 1 ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="font-['Abril_Fatface',Georgia,serif] text-4xl mb-2 text-[#111111] leading-tight">
                  Crie sua conta
                </h1>
                <p className="text-[#525252] mb-8 font-light italic">
                  Falta pouco para você acessar o melhor banco de questões.
                </p>

                <form onSubmit={handleNextStep} className="space-y-5">
                  <div>
                    <label className="block font-['IBM_Plex_Mono',monospace] text-[0.65rem] uppercase tracking-widest text-[#525252] mb-2">Nome completo</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[rgba(0,0,0,0.3)]">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="block w-full pl-10 pr-3 py-3 border border-[#111111] bg-white text-[#111111] placeholder:text-[rgba(0,0,0,0.3)] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] transition-all rounded-none font-sans"
                        placeholder="Dr. João Silva"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-['IBM_Plex_Mono',monospace] text-[0.65rem] uppercase tracking-widest text-[#525252] mb-2">E-mail</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[rgba(0,0,0,0.3)]">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="block w-full pl-10 pr-3 py-3 border border-[#111111] bg-white text-[#111111] placeholder:text-[rgba(0,0,0,0.3)] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] transition-all rounded-none font-sans"
                        placeholder="joao@exemplo.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-['IBM_Plex_Mono',monospace] text-[0.65rem] uppercase tracking-widest text-[#525252] mb-2">Senha</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[rgba(0,0,0,0.3)]">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        required
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="block w-full pl-10 pr-3 py-3 border border-[#111111] bg-white text-[#111111] placeholder:text-[rgba(0,0,0,0.3)] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] transition-all rounded-none font-sans"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-6 bg-[#111111] text-white font-['IBM_Plex_Mono',monospace] text-[0.75rem] uppercase tracking-widest py-4 px-6 hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-2 group"
                  >
                    Continuar para pagamento
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h1 className="font-['Abril_Fatface',Georgia,serif] text-4xl mb-2 text-[#111111] leading-tight">
                  Pagamento Seguro
                </h1>
                <p className="text-[#525252] mb-8 font-light italic">
                  Você será redirecionado para o Mercado Pago para finalizar a transação com total segurança.
                </p>

                <div className="p-5 border border-[#111111] bg-white mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="w-5 h-5 text-[#1D4ED8]" />
                    <span className="font-['IBM_Plex_Mono',monospace] text-xs uppercase tracking-widest font-medium">Ambiente Seguro</span>
                  </div>
                  <p className="text-[#525252] text-sm leading-relaxed">
                    Nós utilizamos o <strong>Mercado Pago</strong> para processar nossos pagamentos. Seus dados de cartão não são armazenados em nossos servidores.
                  </p>
                </div>

                <form onSubmit={handleCheckout} className="space-y-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#111111] text-white font-['IBM_Plex_Mono',monospace] text-[0.75rem] uppercase tracking-widest py-4 px-6 hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
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
                    className="w-full bg-transparent text-[#525252] font-['IBM_Plex_Mono',monospace] text-[0.7rem] uppercase tracking-widest py-3 px-6 hover:text-[#111111] transition-colors"
                  >
                    Voltar e editar dados
                  </button>
                </form>
              </div>
            )}
            
            {/* Footer Trust symbols */}
            <div className="mt-12 pt-6 border-t border-[rgba(0,0,0,0.1)] text-center">
              <p className="font-['IBM_Plex_Mono',monospace] text-[0.6rem] text-[rgba(0,0,0,0.4)] tracking-widest uppercase">
                Pagamento processado por Mercado Pago
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Order Summary */}
      <div className="w-full md:w-[450px] lg:w-[500px] bg-[#111111] text-white p-6 md:p-12 flex flex-col justify-center">
        
        <div className="mb-10">
          <h2 className="font-['IBM_Plex_Mono',monospace] text-[0.7rem] uppercase tracking-widest text-[rgba(255,255,255,0.5)] mb-6">Resumo do Pedido</h2>
          
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-['Abril_Fatface',Georgia,serif] text-3xl">{selectedPlan.title}</h3>
            <button 
              className="font-['IBM_Plex_Mono',monospace] text-[0.65rem] text-[#1D4ED8] hover:text-white transition-colors uppercase tracking-widest border border-[#1D4ED8] hover:border-white px-2 py-1"
              onClick={() => {
                // If they want to change plan, we could show a modal. For simplicity here, just link back to pricing.
                navigate('/#planos')
              }}
            >
              Trocar
            </button>
          </div>
          <p className="text-[rgba(255,255,255,0.7)] font-light italic mb-8">
            {selectedPlan.description}
          </p>

          <div className="space-y-4 mb-8 pt-6 border-t border-[rgba(255,255,255,0.1)]">
            {selectedPlan.features.map((feature: string, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#1D4ED8] shrink-0" />
                <span className="text-[rgba(255,255,255,0.8)] font-light">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-8 border-t-2 border-[rgba(255,255,255,0.1)]">
          {/* Coupon Input Area */}
          <div className="mb-6">
            <label className="block font-['IBM_Plex_Mono',monospace] text-[0.65rem] uppercase tracking-widest text-[rgba(255,255,255,0.5)] mb-2">
              Cupom de desconto
            </label>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-[rgba(255,255,255,0.05)] border border-[#1D4ED8] p-3">
                <span className="font-['IBM_Plex_Mono',monospace] text-xs text-[#60A5FA]">
                  {appliedCoupon.code} ({appliedCoupon.type === 'percent' ? `${appliedCoupon.value}%` : `R$ ${appliedCoupon.value}`} OFF)
                </span>
                <button 
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs text-[rgba(255,255,255,0.6)] hover:text-white underline font-['IBM_Plex_Mono',monospace]"
                >
                  Remover
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="DIGITEOCUPOM"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 bg-transparent border border-[rgba(255,255,255,0.2)] text-white placeholder:text-[rgba(255,255,255,0.3)] focus:outline-none focus:border-white text-sm font-sans"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="px-4 py-2 bg-white text-[#111111] hover:bg-[#1D4ED8] hover:text-white transition-colors text-[0.7rem] font-['IBM_Plex_Mono',monospace] uppercase tracking-widest disabled:opacity-50"
                >
                  {couponLoading ? '...' : 'Aplicar'}
                </button>
              </div>
            )}
            {couponError && (
              <p className="text-[#EF4444] text-xs mt-1 italic">{couponError}</p>
            )}
          </div>

          <div className="flex justify-between items-end mb-2">
            <span className="font-['IBM_Plex_Mono',monospace] text-[0.7rem] uppercase tracking-widest text-[rgba(255,255,255,0.5)]">A pagar hoje</span>
            <div className="text-right">
              {appliedCoupon ? (
                <div>
                  <div className="font-['IBM_Plex_Mono',monospace] text-[0.65rem] text-[rgba(255,255,255,0.6)] line-through uppercase mb-1">
                    {selectedPlan.total || selectedPlan.price}
                  </div>
                  <div className="font-['Abril_Fatface',Georgia,serif] text-4xl text-white">
                    {finalAmountFormatted}
                  </div>
                  {plan !== 'monthly' && (
                    <div className="font-['IBM_Plex_Mono',monospace] text-[0.6rem] text-[#60A5FA] uppercase tracking-widest mt-1">
                      ou {plan === 'semiannual' ? '6x' : '12x'} de {formatMoney(finalAmount / (plan === 'semiannual' ? 6 : 12))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {selectedPlan.total && (
                    <div className="font-['IBM_Plex_Mono',monospace] text-[0.65rem] text-[rgba(255,255,255,0.6)] uppercase tracking-widest mb-1">
                      {selectedPlan.total}
                    </div>
                  )}
                  <div className="font-['Abril_Fatface',Georgia,serif] text-4xl text-white">
                    {selectedPlan.price}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}
