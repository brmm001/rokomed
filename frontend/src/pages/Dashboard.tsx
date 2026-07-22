import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { userApi } from '../lib/api'
import {
  BookOpen, CheckCircle, Flame, Zap,
  ArrowRight, Clock, X, ChevronRight, RotateCcw,
  CalendarCheck2, Target, PlayCircle, AlertCircle,
  TrendingUp, Star, Check,
} from 'lucide-react'

// ── Banner dispensável (substitui o amarelo permanente) ───────────────────
function DismissableBanner({ id, children }: { id: string; children: React.ReactNode }) {
  const key = `banner_dismissed_${id}`
  const [visible, setVisible] = useState(() => !localStorage.getItem(key))

  const dismiss = () => {
    localStorage.setItem(key, '1')
    setVisible(false)
  }

  if (!visible) return null
  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(20,184,166,0.1))',
      border: '1px solid rgba(59,130,246,0.2)',
      borderRadius: 14, padding: '14px 40px 14px 18px',
      marginBottom: 20, fontSize: '0.875rem', color: '#A1A1A6', lineHeight: 1.55,
      animation: 'fadeSlideIn 0.3s ease',
    }}>
      {children}
      <button
        onClick={dismiss}
        aria-label="Dispensar aviso"
        style={{
          position: 'absolute', top: 10, right: 10,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.3)', padding: 4, borderRadius: 6,
          lineHeight: 0,
        }}
      >
        <X size={14} />
      </button>
    </div>
  )
}

// ── Card "O que estudar agora" ─────────────────────────────────────────────
function NextActionCard({ stats, isPro, onStart }: { stats: any; isPro: boolean; onStart: () => void }) {
  const errorsCount = stats?.errors_count ?? 0
  const flashcardsDue = stats?.flashcards_due ?? 0
  const todayCount = stats?.today_count ?? 0
  const dailyLimit = isPro ? Infinity : 10
  const remaining = Math.max(0, dailyLimit - todayCount)

  let action = { title: '', reason: '', duration: '', cta: '', icon: BookOpen, color: '#3B82F6', path: '' }

  if (flashcardsDue > 0) {
    action = { title: `${flashcardsDue} flashcard${flashcardsDue > 1 ? 's' : ''} para revisar`, reason: 'Revisões vencidas ficam mais difíceis com o tempo.', duration: `~${Math.ceil(flashcardsDue * 0.5)} min`, cta: 'Revisar agora', icon: RotateCcw, color: '#F59E0B', path: '/flashcards' }
  } else if (errorsCount > 0) {
    action = { title: 'Revisar questões erradas', reason: 'Você tem questões erradas que merecem atenção.', duration: '~10 min', cta: 'Ver meus erros', icon: AlertCircle, color: '#EF4444', path: '/questoes?filter=erros' }
  } else if (!isPro || remaining > 0) {
    action = { title: 'Sessão de 10 questões', reason: 'Manter constância diária acelera a fixação.', duration: '~15 min', cta: 'Iniciar agora', icon: Zap, color: '#10B981', path: '' }
  } else {
    action = { title: 'Explorar banco de questões', reason: 'Continue onde parou ou explore novos temas.', duration: 'Livre', cta: 'Acessar banco', icon: BookOpen, color: '#3B82F6', path: '/questoes' }
  }

  const ActionIcon = action.icon

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15,32,64,0.9) 0%, rgba(10,10,11,0.9) 100%)',
      border: `1px solid ${action.color}30`,
      borderRadius: 20,
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: 20,
    }}>
      {/* Glow de fundo */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: '50%', background: `${action.color}18`, filter: 'blur(40px)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${action.color}20`, border: `1px solid ${action.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ActionIcon size={22} color={action.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: action.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
            O que estudar agora
          </div>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#EDEDED', margin: '0 0 4px', lineHeight: 1.3 }}>
            {action.title}
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 14px', lineHeight: 1.5 }}>
            {action.reason}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={action.path ? (() => window.location.href = action.path) : onStart}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', borderRadius: 99, border: 'none',
                background: action.color, color: '#fff',
                fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                boxShadow: `0 4px 16px ${action.color}40`,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${action.color}60` }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 4px 16px ${action.color}40` }}
            >
              <PlayCircle size={15} /> {action.cta}
            </button>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> {action.duration}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Card de retomada ──────────────────────────────────────────────────────
function ContinueCard({ lastSession, navigate }: { lastSession: any; navigate: (p: string) => void }) {
  if (!lastSession) return null

  return (
    <button
      onClick={() => navigate(lastSession.path)}
      style={{
        width: '100%', textAlign: 'left',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14, padding: '14px 16px',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 20, transition: 'background 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.055)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <RotateCcw size={18} color="#3B82F6" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Continuar</div>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#EDEDED', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastSession.label}</div>
        {lastSession.progress && (
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{lastSession.progress}</div>
        )}
      </div>
      <ChevronRight size={16} color="rgba(255,255,255,0.25)" />
    </button>
  )
}

// ── Stat card compacto ────────────────────────────────────────────────────
function StatChip({ icon: Icon, value, label, color }: { icon: any; value: string | number; label: string; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '14px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
      <Icon size={18} color={color} />
      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>{value}</span>
      <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
    </div>
  )
}

// ── Checklist de ativação ─────────────────────────────────────────────────
function ActivationChecklist({ stats }: { stats: any }) {
  const items = [
    { label: 'Responder diagnóstico (10 questões)', done: (stats?.total ?? 0) >= 10, path: '/questoes' },
    { label: 'Configurar rotina de estudos', done: false, path: '/rotina' },
    { label: 'Fazer primeiro simulado', done: (stats?.simulados_done ?? 0) > 0, path: '/simulados' },
    { label: 'Revisar primeiro flashcard', done: (stats?.flashcards_reviewed ?? 0) > 0, path: '/flashcards' },
  ]
  const doneCount = items.filter(i => i.done).length
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem('checklist_dismissed'))

  if (dismissed || doneCount === items.length) return null

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '1rem', marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#EDEDED' }}>Primeiros passos</div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{doneCount}/{items.length} concluídos</div>
        </div>
        <button onClick={() => { localStorage.setItem('checklist_dismissed', '1'); setDismissed(true) }} aria-label="Fechar checklist" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', lineHeight: 0 }}>
          <X size={14} />
        </button>
      </div>
      {/* Barra de progresso */}
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.07)', marginBottom: 12, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#3B82F6,#10B981)', width: `${(doneCount / items.length) * 100}%`, transition: 'width 0.4s ease' }} />
      </div>
      {items.map(({ label, done, path }) => (
        <a
          key={label}
          href={path}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '7px 0', textDecoration: 'none',
            color: done ? 'rgba(255,255,255,0.3)' : '#EDEDED',
            fontSize: '0.8125rem', fontWeight: done ? 400 : 500,
            transition: 'color 0.15s',
          }}
        >
          <div style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${done ? '#10B981' : 'rgba(255,255,255,0.2)'}`, background: done ? 'rgba(16,185,129,0.2)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
            {done && <Check size={11} color="#10B981" strokeWidth={3} />}
          </div>
          <span style={{ textDecoration: done ? 'line-through' : 'none' }}>{label}</span>
          {!done && <ChevronRight size={13} color="rgba(255,255,255,0.2)" style={{ marginLeft: 'auto' }} />}
        </a>
      ))}
    </div>
  )
}

// ── Page principal ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const user = useAuthStore(s => s.user)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [paymentNotification, setPaymentNotification] = useState<'success' | 'pending' | 'failure' | null>(null)

  // Notificação de pagamento
  useEffect(() => {
    const ps = searchParams.get('payment')
    if (ps === 'success') {
      setPaymentNotification('success')
      if (typeof (window as any).gtag === 'function') {
        ;(window as any).gtag('event', 'conversion', { send_to: 'AW-625816226/q172CM7Zz5YCEKLltKoC', value: 29.0, currency: 'BRL', transaction_id: searchParams.get('payment_id') || searchParams.get('collection_id') || '' })
      }
      if (typeof (window as any).fbq === 'function') {
        ;(window as any).fbq('track', 'Purchase', { value: 29.0, currency: 'BRL' })
      }
    } else if (ps === 'pending') setPaymentNotification('pending')
    else if (ps === 'failure') setPaymentNotification('failure')

    if (ps) {
      const p = new URLSearchParams(searchParams)
      p.delete('payment')
      setSearchParams(p, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: userApi.stats,
  })

  const isPro = user?.plan !== 'FREE'
  const firstName = user?.name?.split(' ')[0] ?? ''

  // Última sessão salva no localStorage (simples por ora; backend em seguida)
  const lastSession = (() => {
    try {
      const raw = localStorage.getItem('last_study_session')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })()

  // Inicia sessão rápida de 10 questões
  const startQuickSession = useCallback(() => {
    localStorage.setItem('quick_session_size', '10')
    navigate('/questoes?session=10')
  }, [navigate])

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  })()

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', animation: 'fadeSlideIn 0.3s ease' }}>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* Notificação de pagamento */}
      {paymentNotification && (
        <div style={{
          padding: '14px 20px', borderRadius: 12, marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          border: '1px solid',
          background: paymentNotification === 'success' ? 'rgba(16,185,129,0.1)' : paymentNotification === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
          borderColor: paymentNotification === 'success' ? 'rgba(16,185,129,0.3)' : paymentNotification === 'pending' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.1rem' }}>{paymentNotification === 'success' ? '🎉' : paymentNotification === 'pending' ? '⏳' : '❌'}</span>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: '#EDEDED' }}>
                {paymentNotification === 'success' ? 'Assinatura Ativada!' : paymentNotification === 'pending' ? 'Pagamento em Processamento' : 'Falha no Pagamento'}
              </strong>
              <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)' }}>
                {paymentNotification === 'success' ? 'Seu acesso ao RokoMed PRO está totalmente liberado. Bons estudos!' : paymentNotification === 'pending' ? 'Assim que confirmado, seu plano PRO será liberado.' : 'Não conseguimos processar sua transação. Tente novamente ou fale com o suporte.'}
              </span>
            </div>
          </div>
          <button onClick={() => setPaymentNotification(null)} aria-label="Fechar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', lineHeight: 0, flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Saudação */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, background: 'linear-gradient(180deg,#fff 0%,#A1A1A6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
          {greeting}, {firstName} 👋
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', margin: '4px 0 0', fontWeight: 400 }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Área de ações principais */}
      <section aria-label="Próximas ações" style={{ marginBottom: 24 }}>
        {/* Retomada de sessão */}
        <ContinueCard lastSession={lastSession} navigate={navigate} />

        {/* Próxima ação recomendada */}
        {!isLoading && (
          <NextActionCard stats={stats} isPro={isPro} onStart={startQuickSession} />
        )}
        {isLoading && (
          <div style={{ height: 140, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20, animation: 'pulse 1.5s ease infinite' }} />
        )}
      </section>

      {/* Checklist de primeiros passos */}
      <ActivationChecklist stats={stats} />

      {/* Banner dispensável (notícias/novidades) */}
      <DismissableBanner id="ufsc-500-julho">
        <strong style={{ color: '#EDEDED' }}>🔥 Novidade — UFSC 500+ questões</strong>
        <br />
        Adicionamos mais de 500 questões comentadas da UFSC. Explore no banco de questões!
        <a href="/questoes?instituicao=UFSC" style={{ color: '#3B82F6', marginLeft: 6, textDecoration: 'none', fontWeight: 600 }}>Ver agora →</a>
      </DismissableBanner>

      {/* Stats grid — abaixo das ações */}
      <section aria-label="Estatísticas" style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: 88, borderRadius: 14, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease infinite' }} />
            ))
          ) : (
            <>
              <StatChip icon={BookOpen}    value={stats?.total ?? 0}          label="Questões respondidas" color="#3B82F6" />
              <StatChip icon={CheckCircle} value={`${stats?.accuracy ?? 0}%`} label="Taxa de acerto"        color="#10B981" />
              <StatChip icon={Flame}       value={stats?.streak ?? 0}         label="Dias de sequência"     color="#F97316" />
              <StatChip icon={Target}      value={stats?.today_count ?? 0}    label="Questões hoje"         color="#14B8A6" />
            </>
          )}
        </div>
      </section>

      {/* Ação rápida + progresso diário */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start' }}>
        {/* Botão de sessão rápida */}
        <button
          id="start-10q-btn"
          onClick={startQuickSession}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 18px', borderRadius: 14, border: 'none',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#EDEDED', cursor: 'pointer', textAlign: 'left',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
        >
          <Zap size={20} color="#F59E0B" />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Sessão rápida — 10 questões</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>~15 min · Seleção inteligente</div>
          </div>
          <ArrowRight size={16} color="rgba(255,255,255,0.3)" style={{ marginLeft: 'auto' }} />
        </button>

        {/* Progresso diário compacto */}
        <div style={{ padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', minWidth: 120, textAlign: 'center' }}>
          <TrendingUp size={16} color="#10B981" style={{ marginBottom: 4 }} />
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Hoje</div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', marginBottom: 6 }}>
            <div style={{
              height: '100%', borderRadius: 3,
              background: 'linear-gradient(90deg,#3B82F6,#10B981)',
              width: isPro ? '60%' : `${Math.min(((stats?.today_count ?? 0) / 10) * 100, 100)}%`,
              transition: 'width 0.5s ease',
            }} />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
            {stats?.today_count ?? 0}{isPro ? '' : '/10'}
          </div>
        </div>
      </section>

      {/* Dica do dia */}
      <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Star size={15} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#EDEDED', marginBottom: 2 }}>Dica do dia</div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.55 }}>
            Revise questões erradas antes de avançar para novos tópicos. O espaçamento entre revisões melhora a retenção em até 3×.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5 }
          50% { opacity: 0.8 }
        }
      `}</style>
    </div>
  )
}
