import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle2, ShieldCheck, Mail, Lock, User,
  CreditCard, Smartphone, Copy, Check, RefreshCw, AlertTriangle,
  Sparkles, Tag, X
} from 'lucide-react'
import api, { authApi } from '../lib/api'
import { useAuthStore } from '../store/auth'
import toast from 'react-hot-toast'
import { trackClick } from '../lib/tracker'

// ── Tipos ──────────────────────────────────────────────────────────────────────
type Step = 'identify' | 'payment' | 'pix-waiting' | 'success' | 'rejected'
type PaymentTab = 'card' | 'pix'

interface InitData {
  amount: number
  originalAmount: number
  discountApplied: number
  coupon: { code: string; type: string; value: number } | null
  publicKey: string
  plan: string
  userInfo: { email: string; firstName: string; lastName: string }
}

interface PixData {
  paymentId: string
  pixQrCode: string
  pixQrCodeBase64: string
}

// Mapa de erros do MP para mensagens amigáveis
const MP_ERROR_MAP: Record<string, string> = {
  cc_rejected_insufficient_amount: 'Saldo insuficiente no cartão.',
  cc_rejected_bad_filled_card_number: 'Número do cartão incorreto.',
  cc_rejected_bad_filled_date: 'Data de vencimento incorreta.',
  cc_rejected_bad_filled_other: 'Dados do cartão inválidos.',
  cc_rejected_bad_filled_security_code: 'Código de segurança (CVV) incorreto.',
  cc_rejected_blacklist: 'Cartão não autorizável.',
  cc_rejected_call_for_authorize: 'Ligue para o banco para autorizar a compra.',
  cc_rejected_card_disabled: 'Cartão desativado. Contate seu banco.',
  cc_rejected_duplicated_payment: 'Pagamento duplicado detectado.',
  cc_rejected_high_risk: 'Pagamento recusado por segurança do Mercado Pago.',
  cc_rejected_max_attempts: 'Muitas tentativas. Aguarde antes de tentar novamente.',
}

const PLAN_NAMES: Record<string, string> = {
  monthly: 'Mensal',
  semiannual: 'Semestral',
  annual: 'Anual',
}

const PLAN_PERIOD_LABELS: Record<string, string> = {
  monthly: '/mês',
  semiannual: '/semestre',
  annual: '/ano',
}

const PLAN_PERIOD_TEXTS: Record<string, string> = {
  monthly: 'automaticamente todo mês',
  semiannual: 'automaticamente a cada 6 meses',
  annual: 'automaticamente a cada 12 meses',
}

// ── Componente Principal ───────────────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const setAuth = useAuthStore(state => state.setAuth)
  const [searchParams] = useSearchParams()
  const plan = searchParams.get('plan') || 'monthly'

  // Estados principais
  const [step, setStep] = useState<Step>('identify')
  const [activeTab, setActiveTab] = useState<PaymentTab>('card')
  const [loading, setLoading] = useState(false)
  const [initData, setInitData] = useState<InitData | null>(null)
  const [pixData, setPixData] = useState<PixData | null>(null)
  const [pixCopied, setPixCopied] = useState(false)
  const [pixCountdown, setPixCountdown] = useState(1800) // 30 min
  const [rejectedReason, setRejectedReason] = useState('')
  const [brickReady, setBrickReady] = useState(false)
  const [brickError, setBrickError] = useState<string | null>(null)
  const brickControllerRef = useRef<any>(null)

  // Form de identificação
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })

  // Cupom
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState<{ code: string; label: string } | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)

  // CPF para PIX
  const [pixCpf, setPixCpf] = useState('')

  // ── Fetch init data ──────────────────────────────────────────────────────────
  const fetchInitData = useCallback(async (coupon?: string) => {
    try {
      const res = await api.post('/subscriptions/transparent/init', {
        plan,
        couponCode: coupon,
      })
      setInitData(res.data)
    } catch (err) {
      console.error('Erro ao inicializar checkout:', err)
    }
  }, [plan])

  // ── Inicialização ────────────────────────────────────────────────────────────
  useEffect(() => {
    document.title = 'Finalizar Compra — RokoMed'
    window.scrollTo(0, 0)

    if (token) {
      setStep('payment')
      fetchInitData()
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
  }, [token, fetchInitData])

  // ── Google Sign-In ───────────────────────────────────────────────────────────
  useEffect(() => {
    const initializeGoogle = () => {
      const currentToken = useAuthStore.getState().token
      if (step === 'identify' && !currentToken && typeof window !== 'undefined' && (window as any).google) {
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
      } else if (step === 'identify' && !currentToken) {
        setTimeout(initializeGoogle, 500)
      }
    }

    initializeGoogle()
  }, [step])

  // ── MP Brick: carrega SDK e renderiza ────────────────────────────────────────
  useEffect(() => {
    if (step !== 'payment' || activeTab !== 'card') return

    // A publicKey vem do backend (/transparent/init → process.env.MERCADO_PAGO_PUBLIC_KEY)
    // Aguarda initData carregar antes de tentar montar o Brick
    const publicKey = initData?.publicKey
    if (!publicKey) {
      if (initData) {
        setBrickError('Chave pública do Mercado Pago não configurada no servidor. Configure MERCADO_PAGO_PUBLIC_KEY nas variáveis de ambiente do backend.')
      }
      return
    }

    setBrickError(null)
    const amount = initData?.amount ?? 29.00

    // Destrói Brick anterior se existir
    if (brickControllerRef.current) {
      brickControllerRef.current.unmount?.()
      brickControllerRef.current = null
      setBrickReady(false)
    }

    const loadAndRenderBrick = () => {
      try {
        const mp = new (window as any).MercadoPago(publicKey, { locale: 'pt-BR' })
        const bricksBuilder = mp.bricks()

        bricksBuilder.create('cardPayment', 'mp-card-container', {
          initialization: {
            amount,
            payer: {
              email: initData?.userInfo.email,
            },
          },
          customization: {
            visual: {
              style: {
                theme: 'dark',
                customVariables: {
                  baseColor: '#3B7EF8',
                  fontSizeBase: '14px',
                  borderRadiusBase: '8px',
                  formBackgroundColor: '#0C1A2E',
                  inputBackgroundColor: '#0C1A2E',
                  inputBorderColor: 'rgba(100,160,255,0.2)',
                  labelTextColor: '#7B9DBF',
                  inputTextColor: '#EBF4FF',
                },
              },
              hidePaymentButton: false,
            },
            paymentMethods: {
              maxInstallments: 1,
            },
          },
          callbacks: {
            onReady: () => setBrickReady(true),
            onSubmit: async (cardFormData: any) => {
              await handleCardSubmit(cardFormData)
            },
            onError: (error: any) => {
              console.error('[MP Brick error]', error)
              const code = error?.cause?.[0]?.code
              if (code && code !== 'E301') {
                setBrickError(`Erro no formulário (${code}). Recarregue a página e tente novamente.`)
              }
            },
          },
        }).then((controller: any) => {
          brickControllerRef.current = controller
        }).catch((err: any) => {
          console.error('[Brick create error]', err)
          setBrickError('Não foi possível carregar o formulário de pagamento. Verifique se a Public Key do Mercado Pago está correta.')
        })
      } catch (err: any) {
        console.error('[MP init error]', err)
        setBrickError('Erro ao inicializar o Mercado Pago. Verifique a Public Key e tente novamente.')
      }
    }

    // Carrega o SDK MP se ainda não carregou
    if (!(window as any).MercadoPago) {
      const script = document.createElement('script')
      script.src = 'https://sdk.mercadopago.com/js/v2'
      script.async = true
      script.onload = loadAndRenderBrick
      document.body.appendChild(script)
    } else {
      loadAndRenderBrick()
    }

    return () => {
      brickControllerRef.current?.unmount?.()
      brickControllerRef.current = null
    }
  }, [step, activeTab, initData])

  // ── Polling PIX ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 'pix-waiting' || !pixData?.paymentId) return

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/subscriptions/transparent/pix-status/${pixData.paymentId}`)
        if (res.data.status === 'approved') {
          clearInterval(interval)
          setStep('success')
        }
      } catch (_) { /* silencia */ }
    }, 10_000)

    const countdown = setInterval(() => {
      setPixCountdown(prev => {
        if (prev <= 1) { clearInterval(countdown); return 0 }
        return prev - 1
      })
    }, 1000)

    return () => { clearInterval(interval); clearInterval(countdown) }
  }, [step, pixData])

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      trackClick('CHECKOUT_SUBMIT', formData.email)
      const currentToken = useAuthStore.getState().token
      if (!currentToken) {
        try {
          const authRes = await api.post('/auth/register', {
            name: formData.name,
            email: formData.email,
            password: formData.password,
          })
          setAuth(authRes.data.user, authRes.data.token)
          api.defaults.headers.common['Authorization'] = `Bearer ${authRes.data.token}`
          toast.success(`Conta criada! Bem-vindo, ${authRes.data.user.name.split(' ')[0]}!`)
        } catch (err: any) {
          if (err.response?.status === 409) {
            // Tenta login
            try {
              const loginRes = await api.post('/auth/login', {
                email: formData.email,
                password: formData.password,
              })
              setAuth(loginRes.data.user, loginRes.data.token)
              api.defaults.headers.common['Authorization'] = `Bearer ${loginRes.data.token}`
              toast.success(`Bem-vindo de volta!`)
            } catch {
              toast.error('E-mail já cadastrado. Verifique sua senha.')
              setLoading(false)
              return
            }
          } else throw err
        }
      }
      await fetchInitData()
      setStep('payment')
    } catch (err) {
      toast.error('Erro ao criar conta. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleResponse = async (response: any) => {
    setLoading(true)
    try {
      const { token, user } = await authApi.googleLogin(response.credential)
      setAuth(user, token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      toast.success(`Bem-vindo, ${user.name.split(' ')[0]}!`)
      await fetchInitData()
      setStep('payment')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao autenticar com o Google')
    } finally {
      setLoading(false)
    }
  }

  const handleCardSubmit = async (cardFormData: any) => {
    setLoading(true)
    try {
      const res = await api.post('/subscriptions/transparent/subscribe', {
        cardToken: cardFormData.token,
        paymentMethodId: cardFormData.payment_method_id,
        issuerId: cardFormData.issuer_id,
        installments: cardFormData.installments ?? 1,
        email: cardFormData.payer?.email || initData?.userInfo.email,
        identificationType: cardFormData.payer?.identification?.type || 'CPF',
        identificationNumber: cardFormData.payer?.identification?.number || '',
        plan,
        couponCode: couponApplied?.code,
      })

      if (res.data.status === 'approved') {
        setStep('success')
      } else {
        setRejectedReason('Assinatura criada mas pendente de autorização. Aguarde.')
        setStep('rejected')
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail || ''
      const friendlyMsg = MP_ERROR_MAP[detail] || 'Pagamento recusado. Verifique os dados e tente novamente.'
      setRejectedReason(friendlyMsg)
      setStep('rejected')
    } finally {
      setLoading(false)
    }
  }

  const handlePixGenerate = async () => {
    if (!pixCpf || pixCpf.replace(/\D/g, '').length < 11) {
      toast.error('Informe um CPF válido para gerar o PIX.')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/subscriptions/transparent/pix', {
        plan,
        couponCode: couponApplied?.code,
        email: initData?.userInfo.email,
        identificationType: 'CPF',
        identificationNumber: pixCpf.replace(/\D/g, ''),
      })
      setPixData({
        paymentId: res.data.paymentId,
        pixQrCode: res.data.pixQrCode,
        pixQrCodeBase64: res.data.pixQrCodeBase64,
      })
      setPixCountdown(1800)
      setStep('pix-waiting')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao gerar PIX. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const res = await api.post('/subscriptions/coupon/validate', { code: couponCode })
      if (res.data.valid) {
        const label = res.data.type === 'percent'
          ? `-${res.data.value}%`
          : `-R$ ${res.data.value.toFixed(2)}`
        setCouponApplied({ code: res.data.code, label })
        await fetchInitData(res.data.code)
        toast.success(`Cupom ${res.data.code} aplicado! Desconto: ${label}`)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Cupom inválido.')
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = async () => {
    setCouponApplied(null)
    setCouponCode('')
    await fetchInitData()
  }

  const copyPix = () => {
    if (!pixData?.pixQrCode) return
    navigator.clipboard.writeText(pixData.pixQrCode)
    setPixCopied(true)
    toast.success('Código PIX copiado!')
    setTimeout(() => setPixCopied(false), 3000)
  }

  const retryPayment = () => {
    setRejectedReason('')
    setBrickReady(false)
    setStep('payment')
  }

  // Formata countdown
  const fmtCountdown = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050D1A] text-[#C8DCF5] font-sans flex flex-col md:flex-row selection:bg-[#3B7EF8] selection:text-white">
      
      {/* ── LEFT COLUMN: Form ─────────────────────────────────────────────── */}
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

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center md:justify-start md:pt-20 lg:pt-24 pb-16 p-6 md:p-12 relative z-10">
          <div className="w-full max-w-lg">

            {/* ── STEP: IDENTIFICAÇÃO ─────────────────────────────────── */}
            {step === 'identify' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-5 h-5 border border-[#3B7EF8] bg-[#3B7EF8]/10 text-[#3B7EF8] rounded-full text-[10px] font-mono">1</span>
                  <span className="font-mono text-[0.6rem] uppercase tracking-widest text-[#3B7EF8]">Identificação</span>
                </div>
                <h1 className="font-extrabold text-3xl mb-2 text-[#EBF4FF] tracking-tight leading-tight">
                  Crie sua conta
                </h1>
                <p className="text-[#7B9DBF] mb-8 font-medium">
                  Primeiro passo para ativar seu plano PRO.
                </p>

                <form onSubmit={handleIdentify} className="space-y-4">
                  {[
                    { label: 'Nome completo', key: 'name', type: 'text', Icon: User, placeholder: 'Dr. João Silva' },
                    { label: 'E-mail', key: 'email', type: 'email', Icon: Mail, placeholder: 'joao@exemplo.com' },
                    { label: 'Senha', key: 'password', type: 'password', Icon: Lock, placeholder: '••••••••' },
                  ].map(({ label, key, type, Icon, placeholder }) => (
                    <div key={key}>
                      <label className="block font-mono text-[0.65rem] uppercase tracking-widest text-[#7B9DBF] mb-2">{label}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3A5470]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <input
                          required
                          type={type}
                          value={(formData as any)[key]}
                          onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                          className="block w-full pl-10 pr-3 py-3 border border-[rgba(100,160,255,0.15)] bg-[#0C1A2E]/50 text-[#EBF4FF] placeholder:text-[#3A5470] focus:outline-none focus:ring-1 focus:ring-[#3B7EF8] focus:border-[#3B7EF8] transition-all rounded-lg font-sans text-sm"
                          placeholder={placeholder}
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-[#3B7EF8] text-white font-semibold text-sm py-4 px-6 hover:bg-[#5B94FF] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed rounded-lg shadow-[0_4px_20px_rgba(59,126,248,0.25)]"
                  >
                    {loading ? <span className="animate-pulse">Aguarde...</span> : <>Continuar para pagamento <span>→</span></>}
                  </button>
                </form>

                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[rgba(100,160,255,0.1)]"></div></div>
                  <span className="relative bg-[#050D1A] px-4 text-xs font-mono uppercase tracking-widest text-[#7B9DBF]">ou</span>
                </div>

                <div id="google-checkout-btn" className="flex justify-center"></div>
              </div>
            )}

            {/* ── STEP: PAGAMENTO ─────────────────────────────────────── */}
            {step === 'payment' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-5 h-5 border border-[#3B7EF8] bg-[#3B7EF8]/10 text-[#3B7EF8] rounded-full text-[10px] font-mono">2</span>
                  <span className="font-mono text-[0.6rem] uppercase tracking-widest text-[#3B7EF8]">Pagamento</span>
                </div>
                <h1 className="font-extrabold text-3xl mb-8 text-[#EBF4FF] tracking-tight leading-tight">
                  Dados de Pagamento
                </h1>

                {/* Cupom */}
                <div className="mb-6">
                  {couponApplied ? (
                    <div className="flex items-center justify-between p-3 border border-green-500/30 bg-green-500/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-300 font-medium">Cupom <strong>{couponApplied.code}</strong> — {couponApplied.label}</span>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-[#7B9DBF] hover:text-red-400 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3A5470]">
                          <Tag className="h-4 w-4" />
                        </div>
                        <input
                          type="text"
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value.toUpperCase())}
                          onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                          className="block w-full pl-10 pr-3 py-2.5 border border-[rgba(100,160,255,0.15)] bg-[#0C1A2E]/50 text-[#EBF4FF] placeholder:text-[#3A5470] focus:outline-none focus:ring-1 focus:ring-[#3B7EF8] focus:border-[#3B7EF8] transition-all rounded-lg font-sans text-sm"
                          placeholder="Cupom de desconto"
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode}
                        className="px-4 py-2.5 bg-[#0C1A2E] border border-[rgba(100,160,255,0.2)] text-[#7B9DBF] hover:text-[#EBF4FF] hover:border-[#3B7EF8] font-mono text-xs uppercase tracking-wider rounded-lg transition-all disabled:opacity-50"
                      >
                        {couponLoading ? '...' : 'Aplicar'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-[#0C1A2E] rounded-xl border border-[rgba(100,160,255,0.1)] mb-6">
                  {([
                    { id: 'card', label: 'Cartão de Crédito', icon: <CreditCard className="w-4 h-4" /> },
                    { id: 'pix', label: 'PIX', icon: <Smartphone className="w-4 h-4" /> },
                  ] as const).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (brickControllerRef.current) {
                          brickControllerRef.current.unmount?.()
                          brickControllerRef.current = null
                          setBrickReady(false)
                        }
                        setActiveTab(tab.id)
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all ${
                        activeTab === tab.id
                          ? 'bg-[#3B7EF8] text-white shadow-[0_2px_10px_rgba(59,126,248,0.3)]'
                          : 'text-[#7B9DBF] hover:text-[#EBF4FF]'
                      }`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab: Cartão */}
                {activeTab === 'card' && (
                  <div>
                    {initData && (
                      <div className="mb-3 p-3 bg-[#0C1A2E]/70 border border-[rgba(100,160,255,0.1)] rounded-lg">
                        <div className="flex items-center gap-2 text-xs text-[#7B9DBF]">
                          <RefreshCw className="w-3 h-3 text-[#3B7EF8]" />
                          <span>Assinatura recorrente: <strong className="text-[#EBF4FF]">R$ {initData.amount.toFixed(2)}{PLAN_PERIOD_LABELS[initData.plan] || '/mês'}</strong></span>
                          {initData.discountApplied > 0 && (
                            <span className="ml-auto text-green-400">-R$ {initData.discountApplied.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {brickError ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                        <div className="w-10 h-10 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <p className="text-sm text-red-300 leading-relaxed max-w-sm">{brickError}</p>
                        <button
                          onClick={() => { setBrickError(null); setBrickReady(false) }}
                          className="text-xs text-[#3B7EF8] hover:underline font-mono uppercase tracking-wider"
                        >
                          Tentar novamente
                        </button>
                      </div>
                    ) : !brickReady && (
                      <div className="flex items-center justify-center py-12 text-[#7B9DBF]">
                        <div className="w-6 h-6 border-2 border-[rgba(59,126,248,0.2)] border-t-[#3B7EF8] rounded-full animate-spin mr-3"></div>
                        Carregando formulário seguro...
                      </div>
                    )}
                    <div id="mp-card-container" className={brickReady ? '' : 'hidden'}></div>

                    {/* Info de assinatura */}
                    <div className="mt-4 p-3 border border-[rgba(100,160,255,0.1)] bg-[#0C1A2E]/40 rounded-lg">
                      <p className="text-xs text-[#7B9DBF] leading-relaxed">
                        <ShieldCheck className="w-3 h-3 inline mr-1 text-[#3B7EF8]" />
                        Ao assinar, autorizo o Mercado Pago a cobrar <strong className="text-[#EBF4FF]">R$ {initData?.amount.toFixed(2) ?? '29,00'}{PLAN_PERIOD_LABELS[initData?.plan || 'monthly'] || '/mês'}</strong> {PLAN_PERIOD_TEXTS[initData?.plan || 'monthly'] || 'automaticamente todo mês'} no cartão informado. Cancele a qualquer momento pelo perfil.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab: PIX */}
                {activeTab === 'pix' && (
                  <div className="space-y-4">
                    {initData && (
                      <div className="p-3 bg-[#0C1A2E]/70 border border-[rgba(100,160,255,0.1)] rounded-lg">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#7B9DBF]">Valor do PIX:</span>
                          <span className="text-[#EBF4FF] font-semibold">R$ {initData.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block font-mono text-[0.65rem] uppercase tracking-widest text-[#7B9DBF] mb-2">CPF do Pagador (apenas números)</label>
                      <input
                        required
                        type="text"
                        maxLength={11}
                        value={pixCpf}
                        onChange={e => setPixCpf(e.target.value.replace(/\D/g, ''))}
                        className="block w-full px-3 py-3 border border-[rgba(100,160,255,0.15)] bg-[#0C1A2E]/50 text-[#EBF4FF] placeholder:text-[#3A5470] focus:outline-none focus:ring-1 focus:ring-[#3B7EF8] focus:border-[#3B7EF8] transition-all rounded-lg text-sm"
                        placeholder="Ex: 12345678900"
                      />
                    </div>

                    <button
                      onClick={handlePixGenerate}
                      disabled={loading || pixCpf.length < 11}
                      className="w-full bg-[#3B7EF8] text-white font-semibold text-sm py-4 px-6 hover:bg-[#5B94FF] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-[0_4px_20px_rgba(59,126,248,0.25)]"
                    >
                      {loading ? 'Processando...' : 'Gerar QR Code PIX'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP: PIX WAITING ───────────────────────────────────── */}
            {step === 'pix-waiting' && pixData && (
              <div className="animate-in fade-in duration-500 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></span>
                  <span className="font-mono text-[0.6rem] uppercase tracking-widest text-yellow-500">Aguardando Pagamento</span>
                </div>
                <h1 className="font-extrabold text-2xl mb-2 text-[#EBF4FF] tracking-tight">
                  Pague com PIX
                </h1>
                <p className="text-sm text-[#7B9DBF] mb-6">
                  Escaneie o QR Code abaixo ou copie a chave copia-e-cola. A ativação é automática em poucos segundos após o pagamento.
                </p>

                {/* QR Code */}
                <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-xl border border-white/10">
                  {pixData.pixQrCodeBase64 ? (
                    <img
                      src={`data:image/png;base64,${pixData.pixQrCodeBase64}`}
                      alt="PIX QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-black font-semibold text-xs bg-gray-100 rounded-lg">
                      QR Code indisponível
                    </div>
                  )}
                </div>

                {/* Copia e Cola */}
                <div className="mb-6 max-w-sm mx-auto">
                  <label className="block text-left font-mono text-[0.65rem] uppercase tracking-widest text-[#7B9DBF] mb-2">Código Copia e Cola</label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      type="text"
                      value={pixData.pixQrCode || ''}
                      className="block flex-1 px-3 py-2.5 bg-[#0C1A2E] border border-[rgba(100,160,255,0.15)] text-xs text-[#EBF4FF] rounded-lg focus:outline-none"
                    />
                    <button
                      onClick={copyPix}
                      className="p-2.5 bg-[#3B7EF8] text-white hover:bg-[#5B94FF] rounded-lg transition-colors"
                      title="Copiar código"
                    >
                      {pixCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Contador */}
                <div className="text-xs text-[#7B9DBF] font-mono mb-4">
                  O código expira em: <strong className="text-[#EBF4FF]">{fmtCountdown(pixCountdown)}</strong>
                </div>

                <button
                  onClick={() => setStep('payment')}
                  className="text-xs text-[#7B9DBF] hover:text-[#EBF4FF] underline font-mono uppercase tracking-wider"
                >
                  Alterar método de pagamento
                </button>
              </div>
            )}

            {/* ── STEP: SUCESSO ───────────────────────────────────────── */}
            {step === 'success' && (
              <div className="animate-in scale-in duration-500 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>

                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#3B7EF8]" />
                  <span className="font-mono text-[0.65rem] uppercase tracking-widest text-[#3B7EF8]">Pagamento Aprovado</span>
                </div>

                <h1 className="font-extrabold text-3xl mb-3 text-[#EBF4FF] tracking-tight">
                  Bem-vindo ao PRO! 🎉
                </h1>
                <p className="text-[#7B9DBF] mb-8 leading-relaxed">
                  Sua assinatura está ativa. Você terá acesso a todo o conteúdo do RokoMed PRO e receberá um e-mail de confirmação em instantes.
                </p>

                <div className="p-4 bg-[#0C1A2E]/70 border border-[rgba(100,160,255,0.1)] rounded-xl mb-8 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7B9DBF]">Plano</span>
                    <span className="text-[#EBF4FF] font-semibold">RokoMed PRO — {PLAN_NAMES[initData?.plan || 'monthly']}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7B9DBF]">Valor</span>
                    <span className="text-[#EBF4FF] font-semibold">R$ {initData?.amount.toFixed(2) ?? '29,00'}{PLAN_PERIOD_LABELS[initData?.plan || 'monthly']}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7B9DBF]">Status</span>
                    <span className="text-green-400 font-semibold">✓ Ativo</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-[#3B7EF8] text-white font-semibold text-sm py-4 px-6 hover:bg-[#5B94FF] transition-all duration-200 flex items-center justify-center gap-2 group rounded-lg shadow-[0_4px_20px_rgba(59,126,248,0.25)]"
                >
                  Ir para o Dashboard
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            )}

            {/* ── STEP: RECUSADO ──────────────────────────────────────── */}
            {step === 'rejected' && (
              <div className="animate-in fade-in duration-500 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>

                <h1 className="font-extrabold text-2xl mb-3 text-[#EBF4FF] tracking-tight">
                  Pagamento Recusado
                </h1>
                <p className="text-[#7B9DBF] mb-4">
                  {rejectedReason || 'O pagamento não foi autorizado.'}
                </p>

                <div className="p-4 bg-[#0C1A2E]/70 border border-red-500/20 rounded-xl mb-8 text-left">
                  <p className="text-xs text-[#7B9DBF] leading-relaxed">
                    Verifique se os dados do cartão estão corretos, se há limite disponível e tente novamente. Se o problema persistir, contate seu banco ou use outro método de pagamento.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={retryPayment}
                    className="w-full bg-[#3B7EF8] text-white font-semibold text-sm py-4 px-6 hover:bg-[#5B94FF] transition-all duration-200 flex items-center justify-center gap-2 rounded-lg shadow-[0_4px_20px_rgba(59,126,248,0.25)]"
                  >
                    <RefreshCw className="w-4 h-4" /> Tentar Novamente
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full bg-transparent text-[#7B9DBF] font-semibold text-xs uppercase tracking-widest py-3 hover:text-[#EBF4FF] transition-colors"
                  >
                    Voltar para a página inicial
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-[rgba(100,160,255,0.1)] text-center">
              <p className="font-mono text-[0.6rem] text-[#3A5470] tracking-widest uppercase">
                Pagamento processado com segurança pelo Mercado Pago
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN: Order Summary ──────────────────────────────────── */}
      <div className="hidden md:flex w-[400px] lg:w-[460px] bg-[#0C1A2E] text-white p-10 lg:p-12 flex-col justify-start md:pt-[144px] lg:pt-[160px] relative shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,126,248,0.07),transparent_60%)] pointer-events-none z-0" />

        <div className="relative z-10">
          <p className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7B9DBF] mb-6">Resumo do Pedido</p>

          <h2 className="font-extrabold text-2xl text-[#EBF4FF] tracking-tight mb-1">RokoMed PRO</h2>
          <p className="text-[#7B9DBF] text-sm mb-8">Plano {PLAN_NAMES[initData?.plan || 'monthly'] || 'Mensal'} — Assinatura Recorrente</p>

          <div className="space-y-3 mb-8 pt-6 border-t border-[rgba(100,160,255,0.1)]">
            {[
              'Acesso ilimitado ao banco de questões',
              'Simulados personalizados por IA',
              'Gabaritos comentados completos',
              'Flashcards integrados',
              'Analytics de desempenho detalhado',
              'Suporte prioritário',
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                <span className="text-[#EBF4FF] font-light text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <div className="p-4 border border-[rgba(100,160,255,0.1)] bg-[rgba(59,126,248,0.05)] rounded-xl mb-8">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-[#3B7EF8]" />
              <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[#EBF4FF]">Checkout Seguro</span>
            </div>
            <p className="text-xs text-[#7B9DBF] leading-relaxed">
              Seus dados de cartão são processados diretamente pelo Mercado Pago e nunca armazenados em nossos servidores.
            </p>
          </div>

          <div className="pt-6 border-t border-[rgba(100,160,255,0.1)]">
            <div className="flex justify-between items-end">
              <div>
                <span className="font-mono text-[0.7rem] uppercase tracking-widest text-[#7B9DBF] block mb-1">Valor do plano</span>
                {(initData?.discountApplied ?? 0) > 0 && (
                  <span className="line-through text-[#7B9DBF] text-sm mr-2">
                    R$ {initData!.originalAmount.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="font-extrabold text-4xl text-[#EBF4FF] tracking-tight">
                  R$ {initData ? initData.amount.toFixed(2).replace('.', ',') : '29,00'}
                </div>
                <div className="font-mono text-[0.65rem] text-[#7B9DBF] uppercase tracking-wider mt-1">{PLAN_PERIOD_LABELS[initData?.plan || 'monthly']}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
