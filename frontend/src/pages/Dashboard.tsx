import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { userApi } from '../lib/api'
import {
  BookOpen, CheckCircle, Flame, Zap,
  ArrowRight, Clock, X, ChevronRight, RotateCcw,
  Target, PlayCircle, AlertCircle,
  TrendingUp, Star, Check,
} from 'lucide-react'

import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

// ── Banner dispensável ───────────────────────────────────────────────────
function DismissableBanner({ id, children }: { id: string; children: React.ReactNode }) {
  const key = `banner_dismissed_${id}`
  const [visible, setVisible] = useState(() => !localStorage.getItem(key))

  const dismiss = () => {
    localStorage.setItem(key, '1')
    setVisible(false)
  }

  if (!visible) return null
  return (
    <div className="relative bg-gradient-to-br from-[rgba(59,130,246,0.12)] to-[rgba(20,184,166,0.1)] border border-solid border-[rgba(59,130,246,0.2)] rounded-xl py-3.5 pr-10 pl-4 mb-5 text-[14px] text-[#A1A1A6] leading-[1.55] animate-fade-in">
      {children}
      <button
        onClick={dismiss}
        aria-label="Dispensar aviso"
        className="absolute top-2.5 right-2.5 bg-transparent border-none cursor-pointer text-[rgba(255,255,255,0.3)] p-1 rounded-md leading-none hover:bg-[rgba(255,255,255,0.05)] transition-colors"
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
    <Card variant="glass" padding="lg" className="mb-5 relative overflow-hidden" style={{ borderColor: `${action.color}30` }}>
      {/* Glow de fundo */}
      <div className="absolute -top-[60px] -right-[60px] w-[180px] h-[180px] rounded-full blur-[40px] pointer-events-none" style={{ backgroundColor: `${action.color}18` }} />

      <div className="flex items-start gap-3.5 relative">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-solid" style={{ backgroundColor: `${action.color}20`, borderColor: `${action.color}30` }}>
          <ActionIcon size={22} color={action.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.06em] mb-1" style={{ color: action.color }}>
            O que estudar agora
          </div>
          <h2 className="text-[17px] font-bold text-[#EDEDED] m-0 mb-1 leading-[1.3] font-outfit">
            {action.title}
          </h2>
          <p className="text-[13px] text-[rgba(255,255,255,0.45)] m-0 mb-3.5 leading-[1.5]">
            {action.reason}
          </p>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              size="sm"
              onClick={action.path ? (() => window.location.href = action.path) : onStart}
              className="!rounded-full border-none shadow-md transition-all hover:-translate-y-[1px]"
              style={{ backgroundColor: action.color, color: '#fff' }}
            >
              <PlayCircle size={15} /> {action.cta}
            </Button>
            <span className="text-xs text-[rgba(255,255,255,0.3)] flex items-center gap-1">
              <Clock size={12} /> {action.duration}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ── Card de retomada ──────────────────────────────────────────────────────
function ContinueCard({ lastSession, navigate }: { lastSession: any; navigate: (p: string) => void }) {
  if (!lastSession) return null

  return (
    <button
      onClick={() => navigate(lastSession.path)}
      className="w-full text-left bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.055)] border border-solid border-[rgba(255,255,255,0.07)] rounded-2xl p-3.5 cursor-pointer flex items-center gap-3 mb-5 transition-colors"
    >
      <div className="w-10 h-10 rounded-xl bg-[rgba(59,130,246,0.15)] flex items-center justify-center shrink-0">
        <RotateCcw size={18} color="#3B82F6" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-[#3B82F6] uppercase tracking-[0.05em]">Continuar</div>
        <div className="text-[14px] font-semibold text-[#EDEDED] mt-[1px] truncate">{lastSession.label}</div>
        {lastSession.progress && (
          <div className="text-[11px] text-[rgba(255,255,255,0.35)] mt-0.5">{lastSession.progress}</div>
        )}
      </div>
      <ChevronRight size={16} color="rgba(255,255,255,0.25)" />
    </button>
  )
}

// ── Stat card compacto ────────────────────────────────────────────────────
function StatChip({ icon: Icon, value, label, color }: { icon: any; value: string | number; label: string; color: string }) {
  return (
    <Card variant="apple" padding="sm" className="flex flex-col items-center gap-1 py-3.5 px-2">
      <Icon size={18} color={color} />
      <span className="text-[20px] font-bold text-white tracking-tight font-outfit">{value}</span>
      <span className="text-[10px] text-[rgba(255,255,255,0.4)] text-center leading-[1.2]">{label}</span>
    </Card>
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
    <Card variant="apple" padding="md" className="mb-5">
      <div className="flex justify-between items-center mb-2.5">
        <div>
          <div className="text-[13px] font-bold text-[#EDEDED]">Primeiros passos</div>
          <div className="text-[11px] text-[rgba(255,255,255,0.35)] mt-px">{doneCount}/{items.length} concluídos</div>
        </div>
        <button onClick={() => { localStorage.setItem('checklist_dismissed', '1'); setDismissed(true) }} aria-label="Fechar checklist" className="bg-transparent border-none cursor-pointer text-[rgba(255,255,255,0.3)] leading-none hover:bg-[rgba(255,255,255,0.05)] p-1 rounded-md transition-colors">
          <X size={14} />
        </button>
      </div>
      {/* Barra de progresso */}
      <div className="h-1 rounded-full bg-[rgba(255,255,255,0.07)] mb-3 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#10B981] transition-all duration-400 ease-out" style={{ width: `${(doneCount / items.length) * 100}%` }} />
      </div>
      {items.map(({ label, done, path }) => (
        <a
          key={label}
          href={path}
          className={`flex items-center gap-2.5 py-1.5 no-underline text-[13px] transition-colors ${done ? 'text-[rgba(255,255,255,0.3)] font-normal' : 'text-[#EDEDED] font-medium'}`}
        >
          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all border-[1.5px] border-solid ${done ? 'border-[#10B981] bg-[rgba(16,185,129,0.2)]' : 'border-[rgba(255,255,255,0.2)] bg-transparent'}`}>
            {done && <Check size={11} color="#10B981" strokeWidth={3} />}
          </div>
          <span className={done ? 'line-through' : ''}>{label}</span>
          {!done && <ChevronRight size={13} color="rgba(255,255,255,0.2)" className="ml-auto" />}
        </a>
      ))}
    </Card>
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

  // Última sessão salva no localStorage
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
    <div className="max-w-[860px] mx-auto animate-fade-in pb-10">
      
      {/* Notificação de pagamento */}
      {paymentNotification && (
        <Card variant="solid" padding="md" className={`mb-5 flex items-center justify-between gap-3 ${
          paymentNotification === 'success' ? 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)]' :
          paymentNotification === 'pending' ? 'bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.3)]' :
          'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)]'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="text-[1.1rem]">
              {paymentNotification === 'success' ? '🎉' : paymentNotification === 'pending' ? '⏳' : '❌'}
            </span>
            <div>
              <strong className="block text-[14px] text-[#EDEDED] mb-0.5">
                {paymentNotification === 'success' ? 'Assinatura Ativada!' : paymentNotification === 'pending' ? 'Pagamento em Processamento' : 'Falha no Pagamento'}
              </strong>
              <span className="text-[13px] text-[rgba(255,255,255,0.5)]">
                {paymentNotification === 'success' ? 'Seu acesso ao RokoMed PRO está totalmente liberado. Bons estudos!' : paymentNotification === 'pending' ? 'Assim que confirmado, seu plano PRO será liberado.' : 'Não conseguimos processar sua transação. Tente novamente ou fale com o suporte.'}
              </span>
            </div>
          </div>
          <button onClick={() => setPaymentNotification(null)} aria-label="Fechar" className="bg-transparent border-none cursor-pointer text-[rgba(255,255,255,0.4)] leading-none shrink-0 hover:bg-[rgba(255,255,255,0.1)] p-1.5 rounded-md transition-colors">
            <X size={16} />
          </button>
        </Card>
      )}

      {/* Saudação */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold m-0 bg-gradient-to-b from-white to-[#A1A1A6] bg-clip-text text-transparent tracking-tight font-outfit">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-[rgba(255,255,255,0.4)] text-[14px] m-0 mt-1 font-normal">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Área de ações principais */}
      <section aria-label="Próximas ações" className="mb-6">
        <ContinueCard lastSession={lastSession} navigate={navigate} />

        {!isLoading && (
          <NextActionCard stats={stats} isPro={isPro} onStart={startQuickSession} />
        )}
        {isLoading && (
          <div className="h-[140px] rounded-[20px] bg-[rgba(255,255,255,0.03)] border border-solid border-[rgba(255,255,255,0.06)] mb-5 animate-pulse" />
        )}
      </section>

      {/* Checklist de primeiros passos */}
      <ActivationChecklist stats={stats} />

      {/* Banner dispensável (notícias/novidades) */}
      <DismissableBanner id="ufsc-500-julho">
        <strong className="text-[#EDEDED]">🔥 Novidade — UFSC 500+ questões</strong>
        <br />
        Adicionamos mais de 500 questões comentadas da UFSC. Explore no banco de questões!
        <a href="/questoes?instituicao=UFSC" className="text-[#3B82F6] ml-1.5 no-underline font-semibold hover:underline">Ver agora →</a>
      </DismissableBanner>

      {/* Stats grid — abaixo das ações */}
      <section aria-label="Estatísticas" className="mb-6">
        <div className="grid grid-cols-4 gap-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[88px] rounded-[14px] bg-[rgba(255,255,255,0.03)] animate-pulse" />
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
      <section className="grid grid-cols-[1fr_auto] gap-3 items-start">
        {/* Botão de sessão rápida */}
        <button
          id="start-10q-btn"
          onClick={startQuickSession}
          className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-solid border-[rgba(255,255,255,0.08)] text-[#EDEDED] cursor-pointer text-left transition-colors hover:bg-[rgba(255,255,255,0.08)]"
        >
          <Zap size={20} color="#F59E0B" />
          <div>
            <div className="text-[14px] font-semibold font-inter">Sessão rápida — 10 questões</div>
            <div className="text-[11.5px] text-[rgba(255,255,255,0.4)] mt-[1px]">~15 min · Seleção inteligente</div>
          </div>
          <ArrowRight size={16} color="rgba(255,255,255,0.3)" className="ml-auto" />
        </button>

        {/* Progresso diário compacto */}
        <Card variant="apple" padding="sm" className="min-w-[120px] text-center p-3.5">
          <TrendingUp size={16} color="#10B981" className="mb-1 mx-auto" />
          <div className="text-[11px] text-[rgba(255,255,255,0.4)] mb-1.5">Hoje</div>
          <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.07)] overflow-hidden mb-1.5">
            <div className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#10B981] transition-all duration-500 ease-out"
              style={{ width: isPro ? '60%' : `${Math.min(((stats?.today_count ?? 0) / 10) * 100, 100)}%` }} />
          </div>
          <div className="text-[11.5px] text-[rgba(255,255,255,0.35)] font-medium">
            {stats?.today_count ?? 0}{isPro ? '' : '/10'}
          </div>
        </Card>
      </section>

      {/* Dica do dia */}
      <Card variant="apple" padding="sm" className="mt-4 flex items-start gap-2.5 p-3.5">
        <Star size={15} color="#F59E0B" className="shrink-0 mt-[1px]" />
        <div>
          <div className="text-[12.5px] font-semibold text-[#EDEDED] mb-0.5">Dica do dia</div>
          <p className="m-0 text-[12.5px] text-[rgba(255,255,255,0.45)] leading-[1.55]">
            Revise questões erradas antes de avançar para novos tópicos. O espaçamento entre revisões melhora a retenção em até 3×.
          </p>
        </div>
      </Card>
    </div>
  )
}
