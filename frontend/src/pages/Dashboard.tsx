import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { userApi } from '../lib/api'
import {
  BookOpen, CheckCircle, Target, Flame, Star,
  TrendingUp, ArrowRight, Clock
} from 'lucide-react'

export default function DashboardPage() {
  const user     = useAuthStore(s => s.user)
  const navigate = useNavigate()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn:  userApi.stats,
  })

  const StatCard = ({ icon: Icon, value, label, color }: {
    icon: React.ElementType; value: string | number; label: string; color: string;
  }) => (
    <div className="glass glass-hover stat-card" style={{ borderRadius: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="stat-value" style={{ color }}>{value}</div>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={22} color={color} />
        </div>
      </div>
      <div className="stat-label">{label}</div>
    </div>
  )

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Welcome */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 800 }}>
          Olá, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass" style={{ borderRadius: 14, padding: '1.25rem', height: 100, opacity: 0.5 }} />
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        {/* Quick study card */}
        <div className="glass" style={{ borderRadius: 16, padding: '1.75rem', background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(20,184,166,0.08))', border: '1px solid rgba(59,130,246,0.2)' }}>
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

          <button id="start-study-btn" className="btn btn-primary" onClick={() => navigate('/questoes')} style={{ width: '100%', padding: '0.875rem' }}>
            Ir para o banco de questões <ArrowRight size={16} />
          </button>
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Progress */}
          <div className="glass" style={{ borderRadius: 14, padding: '1.25rem' }}>
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
          <div className="glass" style={{ borderRadius: 14, padding: '1.25rem', textAlign: 'center' }}>
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
          <div className="glass" style={{ borderRadius: 14, padding: '1.25rem' }}>
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
