import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/auth'
import { userApi, subscriptionApi } from '../lib/api'
import {
  User, Crown, Flame, BookOpen, CheckCircle,
  Star, Award, Settings, AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview')
  const [isCancelling, setIsCancelling] = useState(false)

  const { data: stats }   = useQuery({ queryKey: ['user-stats'],   queryFn: userApi.stats })
  const { data: histData } = useQuery({
    queryKey: ['user-history'],
    queryFn:  () => userApi.history(1),
    enabled:  activeTab === 'history',
  })

  const planColors = { FREE: 'var(--text-muted)', PRO: 'var(--accent-gold)', GRUPO: 'var(--accent-teal)' }
  const planColor  = planColors[user?.plan || 'FREE']

  const handleCancelSubscription = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar sua assinatura PRO? Seu plano retornará para o Gratuito.')) return
    
    setIsCancelling(true)
    try {
      await subscriptionApi.cancel()
      toast.success('Assinatura cancelada com sucesso.')
      // Atualiza o store local (idealmente recarregaria os dados completos do /auth/me)
      if (user) {
        setAuth({ ...user, plan: 'FREE' }, useAuthStore.getState().token!)
      }
    } catch (err) {
      toast.error('Erro ao cancelar assinatura.')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div className="glass" style={{ borderRadius: 20, padding: '2rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(15,32,64,0.9), rgba(10,22,40,0.95))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg,#0F2040,#1E3A5F)',
            border: '3px solid var(--border-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
          }}>
            {user?.picture
              ? <img src={user.picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#93C5FD', fontFamily: 'Outfit' }}>
                  {user?.name?.[0]?.toUpperCase()}
                </span>
            }
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 800 }}>{user?.name}</h1>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 8px', fontSize: '0.875rem' }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="badge" style={{ background: `${planColor}22`, color: planColor, border: `1px solid ${planColor}44` }}>
                <Crown size={11} /> {user?.plan}
              </span>
              <span className="badge badge-gray">{user?.role}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 80px)', gap: '1rem', textAlign: 'center' }}>
            {[
              { value: stats?.streak ?? 0, label: 'Streak', icon: <Flame size={16} color="#F97316" /> },
              { value: user?.xp ?? 0,      label: 'XP',     icon: <Star size={16} color="var(--accent-gold)" /> },
              { value: stats?.accuracy ? `${stats.accuracy}%` : '-', label: 'Acerto', icon: <CheckCircle size={16} color="var(--accent-green)" /> },
            ].map(({ value, label, icon }) => (
              <div key={label} style={{ padding: '0.75rem', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>{icon}</div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.125rem' }}>{value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {[
          { id: 'overview', label: 'Visão geral', icon: <User size={15} /> },
          { id: 'history',  label: 'Histórico',   icon: <BookOpen size={15} /> },
        ].map(({ id, label, icon }) => (
          <button
            key={id}
            id={`profile-tab-${id}`}
            className={`btn ${activeTab === id ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab(id as 'overview' | 'history')}
            style={{ fontSize: '0.875rem' }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="animate-fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { icon: BookOpen, value: stats?.total ?? 0, label: 'Total respondidas', color: 'var(--accent-blue)' },
              { icon: CheckCircle, value: stats?.correct ?? 0, label: 'Respostas corretas', color: 'var(--accent-green)' },
              { icon: Award, value: stats?.bookmarks ?? 0, label: 'Favoritas', color: 'var(--accent-gold)' },
              { icon: Flame, value: stats?.streak ?? 0, label: 'Dias de sequência', color: '#F97316' },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="glass stat-card" style={{ borderRadius: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="stat-value" style={{ color }}>{value}</div>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color={color} />
                  </div>
                </div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Subscription info */}
          <div className="glass" style={{ borderRadius: 14, padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              <Settings size={16} color="var(--accent-blue)" /> Assinatura
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 4 }}>Plano atual</div>
                <span className="badge" style={{ background: `${planColor}22`, color: planColor, border: `1px solid ${planColor}44`, fontSize: '0.875rem', padding: '0.375rem 0.875rem' }}>
                  <Crown size={13} /> {user?.plan}
                </span>
              </div>
              {user?.plan === 'FREE' ? (
                <a href="/pricing" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
                  <Crown size={15} /> Fazer upgrade Pro
                </a>
              ) : (
                <button 
                  onClick={handleCancelSubscription} 
                  disabled={isCancelling}
                  className="btn btn-ghost" 
                  style={{ fontSize: '0.875rem', color: '#EF4444' }}
                >
                  <AlertTriangle size={15} /> {isCancelling ? 'Cancelando...' : 'Cancelar Assinatura'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History tab */}
      {activeTab === 'history' && (
        <div className="animate-fade-in">
          {!histData?.data?.length ? (
            <div className="glass" style={{ borderRadius: 14, padding: '3rem', textAlign: 'center' }}>
              <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
              <p style={{ color: 'var(--text-muted)' }}>Nenhuma questão respondida ainda</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {histData.data.map((a: {
                id: string
                selectedOpt: string
                isCorrect: boolean
                createdAt: string
                question: { id: string; statement: string; correctOption: string; specialty?: { name: string }; institution?: { acronym: string } }
              }) => (
                <div key={a.id} className="glass" style={{ borderRadius: 12, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: a.isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {a.isCorrect ? <CheckCircle size={18} color="#10B981" /> : <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#F87171' }}>✗</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                      dangerouslySetInnerHTML={{ __html: a.question.statement.replace(/<[^>]+>/g, '').slice(0, 120) + '...' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 4 }}>
                      {a.question.specialty   && <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{a.question.specialty.name}</span>}
                      {a.question.institution && <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>{a.question.institution.acronym}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(a.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: a.isCorrect ? '#10B981' : '#F87171', fontWeight: 600 }}>
                      {a.selectedOpt} → {a.question.correctOption}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
