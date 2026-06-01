import { useNavigate } from 'react-router-dom'
import { Crown, Check, Zap, Users, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { subscriptionApi } from '../lib/api'
import { useAuthStore } from '../store/auth'

export default function PricingPage() {
  const navigate = useNavigate()

  const { data: plansData } = useQuery({
    queryKey: ['plans'],
    queryFn: subscriptionApi.plans,
  })

  const user = useAuthStore(s => s.user)
  const isFreePlanCurrent = user?.plan === 'FREE' && !user?.trialExpired

  const plans = [
    {
      id: 'FREE',
      name: 'Gratuito',
      price: 'R$ 0',
      period: 'por 7 dias',
      description: '7 dias de acesso grátis sem cartão',
      color: 'var(--text-muted)',
      features: [
        '10 questões por dia',
        '5 flashcards por dia',
        'Revisão com algoritmo SM-2',
        'Trilha Adaptativa',
      ],
      missing: ['Questões ilimitadas', 'Tutor IA', 'Flashcards ilimitados', 'Relatórios avançados'],
      cta: isFreePlanCurrent ? 'Plano atual' : 'Começar Grátis',
      ctaDisabled: isFreePlanCurrent || (user ? user.plan !== 'FREE' : false),
    },
    {
      id: 'monthly',
      name: 'Mensal',
      price: plansData?.monthly?.priceFormatted ?? 'R$ 29,00',
      period: '/ mês',
      description: plansData?.monthly?.description ?? 'Acesso completo com renovação automática. Cancele quando quiser.',
      color: 'var(--accent-blue)',
      features: plansData?.monthly?.features ?? [
        'Acesso a todo o banco de questões',
        'Simulados por especialidade',
        'Gabaritos comentados',
      ],
      missing: ['Simulados personalizados por IA', 'Suporte prioritário', 'Flashcards integrados'],
      cta: 'Assinar Mensal',
      highlighted: false,
    },
    {
      id: 'semiannual',
      name: 'Semestral',
      price: plansData?.semiannual?.priceFormatted ?? '6x de R$ 19,00',
      period: '',
      description: plansData?.semiannual?.description ?? 'Nosso plano mais vendido. Sem renovação automática.',
      color: '#F59E0B',
      highlighted: true,
      bestValue: true,
      features: plansData?.semiannual?.features ?? [
        'Tudo do plano Mensal',
        'Simulados personalizados por IA',
        'Suporte prioritário',
      ],
      missing: ['Flashcards integrados'],
      cta: 'Assinar Semestral',
    },
    {
      id: 'annual',
      name: 'Anual',
      price: plansData?.annual?.priceFormatted ?? '12x de R$ 15,00',
      period: '',
      description: plansData?.annual?.description ?? 'O melhor custo-benefício. Sem renovação automática.',
      color: 'var(--accent-teal)',
      features: plansData?.annual?.features ?? [
        'Tudo do plano Semestral',
        'Flashcards integrados',
        'Planilha de evolução exportável',
      ],
      missing: [],
      cta: 'Assinar Anual',
    },
  ]

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 1.5rem' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.375rem 0.875rem', borderRadius: 9999, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <Crown size={14} color="var(--accent-gold)" />
          <span style={{ fontSize: '0.8125rem', color: '#FCD34D', fontWeight: 600 }}>Planos e preços</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', margin: '0 0 0.75rem', fontWeight: 800 }}>
          Invista na sua aprovação
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', maxWidth: 520, margin: '0 auto' }}>
          Cancele quando quiser. Sem fidelidade. 7 dias grátis para testar.
        </p>
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="glass"
            style={{
              borderRadius: 20, padding: '1.75rem',
              border: plan.highlighted ? `2px solid ${plan.color}` : '1px solid var(--border)',
              position: 'relative',
              boxShadow: plan.highlighted ? `0 8px 32px rgba(59,130,246,0.2)` : undefined,
              transform: plan.highlighted ? 'scale(1.02)' : undefined,
            }}
          >
            {plan.bestValue && (
              <div style={{
                position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #3B82F6, #14B8A6)',
                padding: '0.3rem 1rem', borderRadius: 9999,
                fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap',
              }}>
                ⚡ Mais popular
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {plan.id === 'FREE' && <Crown size={20} color={plan.color} />}
                {plan.id === 'monthly' && <Zap size={20} color={plan.color} />}
                {plan.id === 'semiannual' && <Sparkles size={20} color={plan.color} />}
                {plan.id === 'annual' && <Users size={20} color={plan.color} />}
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: plan.color }}>{plan.name}</h2>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>
                {plan.price}
                <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>
                  {plan.period}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 6 }}>{plan.description}</p>
            </div>

            <button
              id={`plan-cta-${plan.id.toLowerCase()}`}
              className={plan.ctaDisabled ? 'btn btn-ghost' : 'btn btn-primary'}
              disabled={plan.ctaDisabled}
              onClick={() => {
                if (!plan.ctaDisabled) {
                  if (plan.id === 'FREE') {
                    navigate('/register')
                  } else {
                    navigate(`/checkout?plan=${plan.id}`)
                  }
                }
              }}
              style={{ width: '100%', marginBottom: '1.5rem', padding: '0.875rem', fontSize: '0.9375rem',
                ...(!plan.highlighted && !plan.ctaDisabled ? { background: `${plan.color}22`, color: plan.color, boxShadow: 'none' } : {}),
              }}
            >
              {plan.cta}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {plan.features.map((f: string) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem' }}>
                  <Check size={15} color={plan.color} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
                </div>
              ))}
              {plan.missing.map((f: string) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', opacity: 0.4 }}>
                  <div style={{ width: 15, height: 15, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 12, height: 1.5, background: 'var(--text-muted)', borderRadius: 1 }} />
                  </div>
                  <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FAQs */}
      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Dúvidas? Fale conosco em{' '}
          <a href="mailto:suporte@residencia.app" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>
            suporte@residencia.app
          </a>
        </p>
      </div>
    </div>
  )
}
