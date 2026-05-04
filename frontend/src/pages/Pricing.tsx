import { useNavigate } from 'react-router-dom'
import { Crown, Check, Zap, Users } from 'lucide-react'

const plans = [
  {
    id: 'FREE',
    name: 'Gratuito',
    price: 'R$ 0',
    period: 'para sempre',
    description: 'Para começar seus estudos',
    color: 'var(--text-muted)',
    features: [
      '10 questões por dia',
      'Gabarito comentado',
      'Favoritar questões',
      'Filtros básicos',
    ],
    missing: ['Questões ilimitadas', 'Tutor IA', 'Flashcards adaptativos', 'Relatórios avançados'],
    cta: 'Plano atual',
    ctaDisabled: true,
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 'R$ 49,90',
    period: '/ mês',
    description: 'Para quem está focado na aprovação',
    color: 'var(--accent-blue)',
    highlighted: true,
    features: [
      'Questões ilimitadas',
      'Gabarito comentado',
      'Favoritar + anotações + grifos',
      'Todos os filtros',
      'Tutor IA (GPT-4o)',
      'Flashcards adaptativos (SM-2)',
      'Relatórios de desempenho',
      'Suporte prioritário',
    ],
    missing: [],
    cta: 'Assinar Pro',
    bestValue: true,
  },
  {
    id: 'GRUPO',
    name: 'Grupo',
    price: 'R$ 299,90',
    period: '/ mês',
    description: 'Para cursinhos e grupos de estudos',
    color: 'var(--accent-teal)',
    features: [
      'Tudo do Pro',
      'Até 30 alunos',
      'Dashboard do professor',
      'Relatórios da turma',
      'Simulados personalizados',
      'Link de convite',
    ],
    missing: [],
    cta: 'Assinar Grupo',
  },
]

export default function PricingPage() {
  const navigate = useNavigate()

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
          Cancele quando quiser. Sem fidelidade. Primeiro dia grátis para novos usuários.
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
                {plan.id === 'PRO' && <Zap size={20} color={plan.color} />}
                {plan.id === 'GRUPO' && <Users size={20} color={plan.color} />}
                {plan.id === 'FREE' && <Crown size={20} color={plan.color} />}
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
              onClick={() => !plan.ctaDisabled && navigate('/register')}
              style={{ width: '100%', marginBottom: '1.5rem', padding: '0.875rem', fontSize: '0.9375rem',
                ...(!plan.highlighted && !plan.ctaDisabled ? { background: `${plan.color}22`, color: plan.color, boxShadow: 'none' } : {}),
              }}
            >
              {plan.cta}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {plan.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem' }}>
                  <Check size={15} color={plan.color} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
                </div>
              ))}
              {plan.missing.map(f => (
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
