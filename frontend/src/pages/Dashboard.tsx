import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { userApi } from '../lib/api'
import {
  BookOpen, CheckCircle, Target, Flame, Star,
  TrendingUp, ArrowRight, Clock
} from 'lucide-react'

export default function DashboardPage() {
  const user     = useAuthStore(s => s.user)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [paymentNotification, setPaymentNotification] = useState<'success' | 'pending' | 'failure' | null>(null)

  useEffect(() => {
    const paymentStatus = searchParams.get('payment')
    if (paymentStatus === 'success') {
      setPaymentNotification('success')
      // Dispara evento de conversão do Google Ads
      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'conversion', {
          'send_to': 'AW-625816226/q172CM7Zz5YCEKLltKoC',
          'value': 1.0,
          'currency': 'BRL'
        });
      }
    } else if (paymentStatus === 'pending') {
      setPaymentNotification('pending')
    } else if (paymentStatus === 'failure') {
      setPaymentNotification('failure')
    }

    if (paymentStatus) {
      // Remove payment status from URL so it doesn't reappear on refresh
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('payment')
      setSearchParams(newParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn:  userApi.stats,
  })

  const StatCard = ({ icon: Icon, value, label, color }: {
    icon: React.ElementType; value: string | number; label: string; color: string;
  }) => (
    <div className="apple-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="stat-value">{value}</div>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={22} color={color} />
        </div>
      </div>
      <div className="stat-label">{label}</div>
    </div>
  )

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {paymentNotification && (
        <div 
          className="animate-in fade-in slide-in-from-top-4 duration-300"
          style={{
            padding: '16px 24px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            border: '1px solid',
            background: paymentNotification === 'success' 
              ? 'rgba(16, 185, 129, 0.1)' 
              : paymentNotification === 'pending'
              ? 'rgba(245, 158, 11, 0.1)'
              : 'rgba(239, 68, 68, 0.1)',
            borderColor: paymentNotification === 'success'
              ? 'rgba(16, 185, 129, 0.3)'
              : paymentNotification === 'pending'
              ? 'rgba(245, 158, 11, 0.3)'
              : 'rgba(239, 68, 68, 0.3)',
            color: paymentNotification === 'success'
              ? '#10B981'
              : paymentNotification === 'pending'
              ? '#F59E0B'
              : '#EF4444',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.25rem' }}>
              {paymentNotification === 'success' ? '🎉' : paymentNotification === 'pending' ? '⏳' : '❌'}
            </span>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                {paymentNotification === 'success' 
                  ? 'Assinatura Ativada!' 
                  : paymentNotification === 'pending'
                  ? 'Pagamento em Processamento'
                  : 'Falha no Pagamento'}
              </strong>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {paymentNotification === 'success' 
                  ? 'Seu acesso ao RokoMed PRO está totalmente liberado. Bons estudos!' 
                  : paymentNotification === 'pending'
                  ? 'Seu pagamento está pendente de aprovação. Assim que for confirmado, seu plano PRO será liberado.'
                  : 'Não conseguimos processar sua transação. Por favor, tente novamente ou fale com o suporte.'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setPaymentNotification(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: '1.125rem',
              padding: '4px',
            }}
          >
            &times;
          </button>
        </div>
      )}
      {/* Welcome */}
      <div className="dashboard-header" style={{ marginBottom: '32px' }}>
        <h1 className="apple-title">
          Olá, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="apple-subtitle">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="apple-card" style={{ height: 110, opacity: 0.5 }} />
          ))
        ) : (
          <>
            <StatCard icon={BookOpen}      value={stats?.total ?? 0}               label="Questões respondidas" color="var(--accent-blue)"  />
            <StatCard icon={CheckCircle}   value={`${stats?.accuracy ?? 0}%`}      label="Taxa de acerto"        color="var(--accent-green)" />
            <StatCard icon={Flame}         value={`${stats?.streak ?? 0} dias`}    label="Sequência ativa"       color="#F97316"             />
            <StatCard icon={Target}        value={stats?.today_count ?? 0}         label="Questões hoje"         color="var(--accent-teal)"  />
          </>
        )}
      </div>

      {/* Main actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Quick study card */}
        <div className="apple-card" style={{ background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Continuar estudando</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: '0.875rem' }}>
                Banco completo com questões de todas as especialidades
              </p>
            </div>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={26} color="var(--accent-blue)" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'Clínica Médica', count: '850+' },
              { label: 'Cirurgia',       count: '620+' },
              { label: 'Pediatria',      count: '440+' },
              { label: 'G&O',            count: '380+' },
            ].map(({ label, count }) => (
              <div key={label} style={{ padding: '0.75rem', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-blue)', fontFamily: 'Outfit' }}>{count}</div>
              </div>
            ))}
          </div>

          <button id="start-study-btn" className="apple-btn" onClick={() => navigate('/questoes')} style={{ width: '100%', marginTop: '8px' }}>
            Ir para o banco de questões <ArrowRight size={16} />
          </button>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Progress */}
          <div className="apple-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <TrendingUp size={18} color="var(--accent-green)" />
              <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Progresso hoje</span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                <span>{stats?.today_count ?? 0} questões</span>
                <span>{user?.plan === 'FREE' ? '10 disponíveis' : '∞'}</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  background: 'var(--gradient-accent)',
                  width: user?.plan === 'FREE'
                    ? `${Math.min(((stats?.today_count ?? 0) / 10) * 100, 100)}%`
                    : '60%',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
            {user?.plan === 'FREE' && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Limite diário: 10 questões. <button className="btn" style={{ padding: 0, color: 'var(--accent-blue)', fontSize: '0.75rem', background: 'none' }} onClick={() => navigate('/pricing')}>Fazer upgrade</button>
              </p>
            )}
          </div>

          {/* Streak */}
          <div className="apple-card" style={{ padding: '20px', textAlign: 'center' }}>
            <Flame size={32} color="#F97316" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'Outfit', color: '#F97316' }}>
              {stats?.streak ?? 0}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>dias de sequência</div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 4 }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: i < (stats?.streak ?? 0) % 7
                    ? 'rgba(249,115,22,0.3)'
                    : 'var(--bg-elevated)',
                  border: `1px solid ${i < (stats?.streak ?? 0) % 7 ? 'rgba(249,115,22,0.5)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.5rem', color: i < (stats?.streak ?? 0) % 7 ? '#F97316' : 'var(--text-muted)',
                }}>
                  {['S','T','Q','Q','S','S','D'][i]}
                </div>
              ))}
            </div>
          </div>

          {/* Study tips */}
          <div className="apple-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Star size={16} color="var(--accent-gold)" />
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Dica do dia</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: 1.6, margin: 0 }}>
              Revise questões erradas antes de avançar para novos tópicos. O modo revisão está disponível no banco de questões.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              <Clock size={12} />
              <span>Leitura: ~2min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
