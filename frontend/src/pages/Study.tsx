import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { questionsApi } from '../lib/api'
import { useAuthStore } from '../store/auth'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Bookmark, BookmarkCheck, MessageSquare, CheckCircle,
  XCircle, ChevronDown, ChevronUp, Clock, Flag, Loader2,
  Brain, BarChart3, Target, ChevronRight, TrendingUp, Printer,
  Sparkles, Users, Zap,
} from 'lucide-react'
import PrintModal, { type PrintQuestion } from '../components/PrintView'

/* ── tipos ────────────────────────────────────────────────────────────────── */
interface SpecialtyNode {
  id: string; name: string; slug: string
  parent?: SpecialtyNode | null
}

interface Question {
  id: string; code: string; year?: number
  statement: string
  options: { letter: string; text: string }[]
  correctOption?: string
  explanation?: string
  reasoningLine?: string[]
  difficulty: 'FACIL' | 'MEDIO' | 'DIFICIL'
  specialty?: SpecialtyNode | null
  institution?: { id: string; name: string; acronym: string } | null
  images?: { id: string; url: string; caption?: string }[]
  isBookmarked: boolean
  note?: string | null
  stats?: { totalAnswers: number; correctAnswers: number; correctRate: number | null }
}

/* ── helpers ──────────────────────────────────────────────────────────────── */
const diffLabel: Record<string, string> = { FACIL: 'Fácil', MEDIO: 'Médio', DIFICIL: 'Difícil' }
const diffCfg: Record<string, { color: string; bg: string; border: string }> = {
  FACIL:   { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)' },
  MEDIO:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  DIFICIL: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)' },
}
const diffBarColor: Record<string, string> = {
  FACIL:   'linear-gradient(90deg,#10B981,#6EE7B7)',
  MEDIO:   'linear-gradient(90deg,#F59E0B,#FCD34D)',
  DIFICIL: 'linear-gradient(90deg,#EF4444,#F87171)',
}

function buildBreadcrumb(specialty: SpecialtyNode | null | undefined): SpecialtyNode[] {
  if (!specialty) return []
  const stack: SpecialtyNode[] = []
  let cur: SpecialtyNode | null | undefined = specialty
  while (cur) { stack.unshift(cur); cur = cur.parent }
  return stack
}

export default function StudyPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc       = useQueryClient()
  const _user    = useAuthStore(s => s.user)

  const [selected, setSelected]   = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [showExpl, setShowExpl]   = useState(true)
  const [showNote, setShowNote]   = useState(false)
  const [noteText, setNoteText]   = useState('')
  const [showPrint, setShowPrint] = useState(false)
  const startTime = useRef(Date.now())

  // Sessão atual do localStorage
  const sessionData = (() => {
    try {
      const qs = localStorage.getItem('session_queue')
      const idx = localStorage.getItem('session_index')
      const last = localStorage.getItem('last_study_session')
      return {
        queue: qs ? JSON.parse(qs) as string[] : [],
        index: idx ? parseInt(idx) : 0,
        meta: last ? JSON.parse(last) : null
      }
    } catch { return { queue: [], index: 0, meta: null } }
  })()

  const { data: q, isLoading } = useQuery<Question>({
    queryKey: ['question', id],
    queryFn:  () => questionsApi.get(id!),
  })

  const noteMutation = useMutation({
    mutationFn: () => questionsApi.note(id!, noteText),
    onSuccess: () => toast.success('Anotação salva'),
  })

  const answerMutation = useMutation({
    mutationFn: (opt: string) => questionsApi.answer(id!, {
      selectedOpt: opt,
      timeSpentSec: Math.round((Date.now() - startTime.current) / 1000),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-stats'] }),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string; upgrade?: boolean } } })?.response?.data
      if (msg?.upgrade) {
        toast.error('Limite diário atingido! Faça upgrade para Pro.', { duration: 5000 })
        setTimeout(() => navigate('/pricing'), 2000)
      } else toast.error(msg?.error || 'Erro ao registrar resposta')
    },
  })

  const bookmarkMutation = useMutation({
    mutationFn: () => questionsApi.bookmark(id!),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['question', id] })
      toast.success(data.bookmarked ? 'Adicionado aos favoritos' : 'Removido dos favoritos')
    },
  })

  useEffect(() => {
    setSelected(null); setSubmitted(false); setShowExpl(true)
    setShowNote(false); startTime.current = Date.now()
  }, [id])

  const handleNextQuestion = () => {
    if (sessionData.queue.length > 0 && sessionData.index < sessionData.queue.length - 1) {
      const nextIndex = sessionData.index + 1
      localStorage.setItem('session_index', String(nextIndex))
      if (sessionData.meta) {
        localStorage.setItem('last_study_session', JSON.stringify({
          ...sessionData.meta,
          progress: `Questão ${nextIndex + 1} de ${sessionData.queue.length}`
        }))
      }
      navigate(`/questoes/${sessionData.queue[nextIndex]}?session=1`)
    } else {
      toast.success('Você concluiu esta sessão de estudos!', { duration: 4000 })
      // Limpa sessão
      localStorage.removeItem('session_queue')
      localStorage.removeItem('session_index')
      localStorage.removeItem('session_size')
      navigate('/questoes')
    }
  }

  // Debounce para anotações
  useEffect(() => { if (q?.note) setNoteText(q.note) }, [q])
  useEffect(() => {
    if (!q || noteText === q.note) return
    const timer = setTimeout(() => { noteMutation.mutate() }, 1000)
    return () => clearTimeout(timer)
  }, [noteText])

  const handleAnswer = (opt: string) => { if (submitted) return; setSelected(opt) }

  const handleSubmit = async () => {
    if (!selected || submitted) return
    setSubmitted(true)
    const res = await answerMutation.mutateAsync(selected)
    if (res.isCorrect) toast.success('Resposta correta! 🎉', { duration: 3000 })
    else toast.error(`Incorreto. Gabarito: ${res.correctOption}`, { duration: 3000 })
  }

  // Atalhos de teclado globais (apenas se não estiver digitando na nota)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora se estiver num input ou textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const key = e.key.toUpperCase()
      
      // Atalhos A-E para selecionar opção
      if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
        if (!submitted) handleAnswer(key)
      } 
      // Enter: Confirmar resposta ou ir para próxima
      else if (e.key === 'Enter') {
        if (!submitted && selected) handleSubmit()
        else if (submitted) handleNextQuestion()
      } 
      // N: Abrir notas
      else if (key === 'N') {
        setShowNote(p => {
          if (!p) setTimeout(() => document.getElementById('note-textarea')?.focus(), 50)
          return !p
        })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [submitted, selected])


  /* ── loading ── */
  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12 }}>
      <Loader2 size={24} color="var(--accent-blue)" className="animate-spin" />
      <span style={{ color: 'var(--text-muted)' }}>Carregando questão...</span>
    </div>
  )

  if (!q) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <p style={{ color: 'var(--text-muted)' }}>Questão não encontrada</p>
      <button className="btn btn-ghost" onClick={() => navigate('/questoes')} style={{ marginTop: 12 }}>
        <ArrowLeft size={16} /> Voltar
      </button>
    </div>
  )

  const options   = q.options
  const isCorrect = selected !== null && selected === q.correctOption
  const breadcrumb = buildBreadcrumb(q.specialty)
  const dc = diffCfg[q.difficulty]

  const getOptionState = (letter: string): 'idle' | 'selected' | 'correct' | 'wrong' | 'dimmed' => {
    if (!submitted) return selected === letter ? 'selected' : 'idle'
    if (letter === q.correctOption) return 'correct'
    if (letter === selected) return 'wrong'
    return 'dimmed'
  }

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', paddingBottom: '4rem' }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate('/questoes')}
          style={{
            flexShrink: 0, padding: '0.5rem 0.875rem',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, color: 'var(--text-secondary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.15s',
          }}
        >
          <ArrowLeft size={16} /> Voltar
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Progresso da sessão (se houver) */}
          {sessionData.queue.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#3B82F6', background: 'rgba(59,130,246,0.15)', padding: '2px 8px', borderRadius: 6 }}>
                SESSÃO
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {sessionData.index + 1} de {sessionData.queue.length} questões
              </span>
            </div>
          )}

          {breadcrumb.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {breadcrumb.map((s, i) => (
                <span key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 600,
                    color: i === breadcrumb.length - 1 ? '#93C5FD' : 'var(--text-muted)',
                    background: i === breadcrumb.length - 1 ? 'rgba(59,130,246,0.12)' : 'transparent',
                    padding: i === breadcrumb.length - 1 ? '0.2rem 0.6rem' : '0',
                    borderRadius: 6,
                    border: i === breadcrumb.length - 1 ? '1px solid rgba(59,130,246,0.2)' : 'none',
                  }}>{s.name}</span>
                  {i < breadcrumb.length - 1 && <ChevronRight size={11} color="var(--text-muted)" />}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {q.institution && (
              <span style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', color: '#C4B5FD', borderRadius: 99, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600 }}>
                {q.institution.acronym}
              </span>
            )}
            {q.year && (
              <span style={{ background: 'rgba(100,116,139,0.12)', border: '1px solid rgba(100,116,139,0.2)', color: '#94A3B8', borderRadius: 99, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600 }}>
                {q.year}
              </span>
            )}
            <span style={{ background: dc.bg, border: `1px solid ${dc.border}`, color: dc.color, borderRadius: 99, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: dc.color, display: 'inline-block' }} />
              {diffLabel[q.difficulty]}
            </span>
            {q.code && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{q.code}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
          {[
            { btnId: 'bookmark-btn', icon: q.isBookmarked ? <BookmarkCheck size={17} color="#F59E0B" /> : <Bookmark size={17} />, onClick: () => bookmarkMutation.mutate(), disabled: bookmarkMutation.isPending, active: false, title: 'Favoritar' },
            { btnId: 'note-btn', icon: <MessageSquare size={17} color={showNote ? '#3B82F6' : undefined} />, onClick: () => setShowNote(p => !p), active: showNote, disabled: false, title: 'Anotações (N)' },
            { btnId: 'print-question-btn', icon: <Printer size={17} />, onClick: () => setShowPrint(true), active: false, disabled: false, title: 'Imprimir' },
          ].map(({ btnId, icon, onClick, disabled, active, title }) => (
            <button key={btnId} id={btnId} onClick={onClick} disabled={disabled} title={title}
              style={{
                padding: '0.5rem 0.75rem',
                background: active ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
                border: active ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, color: 'var(--text-secondary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', transition: 'all 0.15s',
              }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── Question Body ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(10,22,40,0.6)',
        border: '1px solid rgba(99,179,237,0.1)',
        borderRadius: 20, padding: '2rem',
        marginBottom: '1.25rem',
      }}>
        {/* Statement */}
        <div
          style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-primary)', marginBottom: '1.75rem' }}
          dangerouslySetInnerHTML={{ __html: q.statement }}
        />

        {/* Images */}
        {q.images && q.images.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {q.images.map(img => (
              <div key={img.id} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                <img src={img.url} alt={img.caption || 'Imagem'} style={{ maxWidth: 320, display: 'block' }} />
                {img.caption && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', margin: '0.5rem' }}>{img.caption}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {options.map(({ letter, text }) => {
            const state = getOptionState(letter)
            const stateStyles: Record<string, React.CSSProperties> = {
              idle:     { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'var(--text-primary)' },
              selected: { background: 'rgba(59,130,246,0.12)',  border: '1px solid rgba(59,130,246,0.4)',   color: 'var(--text-primary)' },
              correct:  { background: 'rgba(16,185,129,0.1)',   border: '1px solid rgba(16,185,129,0.5)',   color: 'var(--text-primary)' },
              wrong:    { background: 'rgba(239,68,68,0.1)',    border: '1px solid rgba(239,68,68,0.4)',    color: 'var(--text-primary)' },
              dimmed:   { background: 'rgba(255,255,255,0.015)',border: '1px solid rgba(255,255,255,0.04)', color: 'var(--text-muted)', opacity: 0.6 },
            }
            const letterBg: Record<string, string> = {
              idle: 'rgba(255,255,255,0.08)', selected: '#3B82F6',
              correct: '#10B981', wrong: '#EF4444', dimmed: 'rgba(255,255,255,0.04)',
            }
            return (
              <button
                id={`option-${letter}`}
                key={letter}
                onClick={() => handleAnswer(letter)}
                disabled={submitted}
                style={{
                  width: '100%', textAlign: 'left',
                  cursor: submitted ? 'default' : 'pointer',
                  borderRadius: 12, padding: '0.875rem 1rem',
                  display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                  fontSize: '0.9375rem', lineHeight: 1.55,
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s cubic-bezier(0.2,0.8,0.2,1)',
                  ...stateStyles[state],
                }}
              >
                <span style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.875rem', color: '#fff',
                  background: letterBg[state],
                  transition: 'all 0.2s',
                }}>
                  {state === 'correct' && <CheckCircle size={16} color="#fff" />}
                  {state === 'wrong'   && <XCircle size={16} color="#fff" />}
                  {state !== 'correct' && state !== 'wrong' && letter}
                </span>
                <span style={{ flex: 1, paddingTop: 3 }}>{text}</span>
              </button>
            )
          })}
        </div>

        {/* Submit button */}
        {!submitted && (
          <div style={{ marginTop: '1.25rem' }}>
            <button
              id="submit-answer-btn"
              onClick={handleSubmit}
              disabled={selected === null || answerMutation.isPending}
              style={{
                width: '100%', padding: '0.9375rem',
                borderRadius: 12, border: 'none',
                background: selected !== null ? 'linear-gradient(135deg, #3B82F6, #14B8A6)' : 'rgba(255,255,255,0.05)',
                color: selected !== null ? '#fff' : 'var(--text-muted)',
                fontWeight: 700, fontSize: '1rem',
                cursor: selected === null ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: selected !== null ? '0 4px 20px rgba(59,130,246,0.3)' : 'none',
                transition: 'all 0.25s cubic-bezier(0.2,0.8,0.2,1)',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              {answerMutation.isPending
                ? <><Loader2 size={18} className="animate-spin" /> Verificando...</>
                : <><Zap size={18} /> Confirmar Resposta <span style={{ fontSize: '0.7rem', opacity: 0.6, marginLeft: 4 }}>(Enter)</span></>
              }
            </button>
            {selected === null && (
              <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <Clock size={13} /> Você também pode usar as teclas A-E do teclado
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Result panel ─────────────────────────────────────────────────── */}
      {submitted && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'study-slide-up 0.4s cubic-bezier(0.2,0.8,0.2,1) both' }}>

          {/* Result banner */}
          <div style={{
            borderRadius: 16, padding: '1.125rem 1.5rem',
            background: isCorrect
              ? 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.05))'
              : 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.05))',
            border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`,
            display: 'flex', alignItems: 'center', gap: '1rem',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: isCorrect ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)',
              border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.45)' : 'rgba(239,68,68,0.45)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isCorrect ? <CheckCircle size={22} color="#10B981" /> : <XCircle size={22} color="#EF4444" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.0625rem', color: isCorrect ? '#6EE7B7' : '#FCA5A5', marginBottom: 2 }}>
                {isCorrect ? 'Resposta correta!' : 'Resposta incorreta'}
              </div>
              {!isCorrect && (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8375rem' }}>
                  Você marcou <strong style={{ color: '#FCA5A5' }}>{selected}</strong> · Gabarito: <strong style={{ color: '#6EE7B7' }}>{q.correctOption}</strong>
                </div>
              )}
              {isCorrect && <div style={{ color: 'var(--text-muted)', fontSize: '0.8375rem' }}>Continue assim! 🏆</div>}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
            {/* Acerto geral */}
            <div style={{ background: 'rgba(10,22,40,0.7)', border: '1px solid rgba(99,179,237,0.09)', borderRadius: 14, padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.625rem' }}>
                <BarChart3 size={14} color="#3B82F6" />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em' }}>ACERTO GERAL</span>
              </div>
              {q.stats?.correctRate !== null && q.stats?.correctRate !== undefined ? (
                <>
                  <div style={{ fontSize: '1.625rem', fontFamily: 'Outfit', fontWeight: 800, lineHeight: 1, color: q.stats.correctRate >= 60 ? '#6EE7B7' : q.stats.correctRate >= 40 ? '#FCD34D' : '#FCA5A5' }}>
                    {q.stats.correctRate}%
                  </div>
                  <div style={{ marginTop: 8, height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${q.stats.correctRate}%`, borderRadius: 3, background: q.stats.correctRate >= 60 ? '#10B981' : q.stats.correctRate >= 40 ? '#F59E0B' : '#EF4444', transition: 'width 1.2s ease' }} />
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users size={11} /> {q.stats.correctAnswers}/{q.stats.totalAnswers}
                  </div>
                </>
              ) : <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>Seja o primeiro!</div>}
            </div>

            {/* Dificuldade */}
            <div style={{ background: 'rgba(10,22,40,0.7)', border: '1px solid rgba(99,179,237,0.09)', borderRadius: 14, padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.625rem' }}>
                <Target size={14} color={dc.color} />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em' }}>DIFICULDADE</span>
              </div>
              <div style={{ fontSize: '1.125rem', fontFamily: 'Outfit', fontWeight: 800, color: dc.color, lineHeight: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: dc.color, display: 'inline-block' }} />
                {diffLabel[q.difficulty]}
              </div>
              <div style={{ marginTop: 8, height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: diffBarColor[q.difficulty], width: q.difficulty === 'FACIL' ? '33%' : q.difficulty === 'MEDIO' ? '66%' : '100%', transition: 'width 0.8s ease' }} />
              </div>
            </div>

            {/* Seu resultado */}
            <div style={{ background: 'rgba(10,22,40,0.7)', border: '1px solid rgba(99,179,237,0.09)', borderRadius: 14, padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.625rem' }}>
                <TrendingUp size={14} color={isCorrect ? '#10B981' : '#EF4444'} />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.08em' }}>SEU RESULTADO</span>
              </div>
              <div style={{ fontSize: '1.125rem', fontFamily: 'Outfit', fontWeight: 800, color: isCorrect ? '#6EE7B7' : '#FCA5A5', lineHeight: 1 }}>
                {isCorrect ? '✓ Acertou' : '✗ Errou'}
              </div>
              {!isCorrect && (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  {selected} → {q.correctOption}
                </div>
              )}
            </div>
          </div>

          {/* Reasoning line */}
          {q.reasoningLine && q.reasoningLine.length > 0 && (
            <div style={{ background: 'rgba(20,184,166,0.05)', border: '1px solid rgba(20,184,166,0.18)', borderRadius: 16, padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Brain size={15} color="#14B8A6" />
                </div>
                <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#5EEAD4' }}>Linha de Raciocínio</h3>
              </div>
              <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {q.reasoningLine.map((step, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 800, color: '#14B8A6', marginTop: 1,
                    }}>{i + 1}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, paddingTop: 1 }}>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Explanation */}
          {q.explanation && (
            <div style={{ background: 'rgba(10,22,40,0.7)', border: '1px solid rgba(99,179,237,0.1)', borderRadius: 16, overflow: 'hidden' }}>
              <button
                id="toggle-explanation-btn"
                onClick={() => setShowExpl(p => !p)}
                style={{
                  width: '100%', padding: '1rem 1.5rem',
                  background: 'rgba(59,130,246,0.07)',
                  borderBottom: showExpl ? '1px solid rgba(59,130,246,0.12)' : 'none',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.9375rem', color: '#93C5FD' }}>
                  <Sparkles size={17} color="#3B82F6" />
                  Gabarito Comentado
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {showExpl ? 'Ocultar' : 'Ver explicação'}
                  {showExpl ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>

              {showExpl && (
                <div
                  style={{ padding: '1.5rem' }}
                  className="explanation-content animate-fade-in"
                  dangerouslySetInnerHTML={{ __html: q.explanation }}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Notes ────────────────────────────────────────────────────────── */}
      {showNote && (
        <div style={{
          background: 'rgba(10,22,40,0.7)', border: '1px solid rgba(59,130,246,0.15)',
          borderRadius: 14, padding: '1.25rem', marginTop: '1rem',
          animation: 'study-slide-up 0.3s ease both',
        }}>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#93C5FD', fontWeight: 600 }}>
            <MessageSquare size={15} color="#3B82F6" /> Anotações
          </h3>
          <textarea
            id="note-textarea"
            className="input"
            rows={4}
            placeholder="Suas anotações sobre esta questão..."
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            style={{ resize: 'vertical', fontSize: '0.9rem' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Anotações são salvas automaticamente
            </span>
            <span style={{ fontSize: '0.75rem', color: noteMutation.isPending ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
              {noteMutation.isPending ? 'Salvando...' : noteText === q.note ? 'Salvo' : 'Não salvo'}
            </span>
          </div>
        </div>
      )}

      {/* ── Bottom actions ────────────────────────────────────────────────── */}
      {submitted && (
        <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'space-between', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => navigate('/questoes')}
              style={{
                padding: '0.625rem 1.125rem',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, color: 'var(--text-secondary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 500,
              }}
            >
              <ArrowLeft size={15} /> Banco
            </button>
            <button
              id="flag-btn"
              style={{
                padding: '0.625rem 1.125rem',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem',
              }}
            >
              <Flag size={15} /> Sinalizar
            </button>
          </div>
          <button
            onClick={handleNextQuestion}
            style={{
              padding: '0.75rem 1.75rem',
              background: 'linear-gradient(135deg, #3B82F6, #14B8A6)',
              border: 'none', borderRadius: 12,
              color: '#fff', fontWeight: 700, fontSize: '0.9375rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 18px rgba(59,130,246,0.35)',
              fontFamily: 'Outfit, sans-serif',
              transition: 'all 0.2s',
            }}
          >
            {sessionData.queue.length > 0 && sessionData.index >= sessionData.queue.length - 1 ? (
              <>Concluir sessão <CheckCircle size={17} /></>
            ) : (
              <>Próxima questão <span style={{ fontSize: '0.7rem', opacity: 0.6, marginLeft: 2 }}>(Enter)</span> <ChevronRight size={17} /></>
            )}
          </button>
        </div>
      )}

      {/* Print modal */}
      {showPrint && q && (
        <PrintModal
          title={`Questão ${q.code ?? q.id}${q.institution ? ` — ${q.institution.acronym}` : ''}${q.year ? ` (${q.year})` : ''}`}
          questions={[{
            number: 1,
            statement: q.statement,
            options: q.options,
            correctOption: q.correctOption,
            year: q.year,
            institution: q.institution?.acronym,
            specialty: q.specialty?.name,
            images: q.images,
          } as PrintQuestion]}
          onClose={() => setShowPrint(false)}
        />
      )}

      {/* Keyframes + explanation overrides */}
      <style>{`
        @keyframes study-slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        #submit-answer-btn:not(:disabled):hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 8px 28px rgba(59,130,246,0.45) !important;
        }

        /* ── Compact alt items ── */
        .explanation-content .alt-item {
          display: flex !important;
          align-items: flex-start !important;
          padding: 0.5rem 0.75rem !important;
          border-radius: 10px !important;
          margin-bottom: 0.3rem !important;
          background: rgba(255,255,255,0.02) !important;
          border: 1px solid rgba(255,255,255,0.05) !important;
          gap: 0.75rem !important;
          transition: border-color 0.15s !important;
        }
        .explanation-content .alt-item:hover {
          border-color: rgba(255,255,255,0.1) !important;
        }
        .explanation-content .alt-letra {
          width: 26px !important;
          height: 26px !important;
          border-radius: 7px !important;
          font-size: 0.75rem !important;
          font-weight: 800 !important;
          flex-shrink: 0 !important;
        }
        .explanation-content .alt-letra.correta {
          background: rgba(16,185,129,0.18) !important;
          color: #6EE7B7 !important;
          border: 1px solid rgba(16,185,129,0.35) !important;
        }
        .explanation-content .alt-letra.incorreta {
          background: rgba(239,68,68,0.14) !important;
          color: #FCA5A5 !important;
          border: 1px solid rgba(239,68,68,0.28) !important;
        }
        .explanation-content .alt-texto {
          font-size: 0.875rem !important;
          line-height: 1.55 !important;
          color: var(--text-secondary) !important;
          padding-top: 3px !important;
        }
        .explanation-content .alt-comentario {
          padding-left: 38px !important;
          font-size: 0.8125rem !important;
          color: var(--text-muted) !important;
          line-height: 1.55 !important;
          margin-top: 0.3rem !important;
          width: 100% !important;
        }
        .explanation-content h4 {
          font-size: 0.75rem !important;
          font-weight: 800 !important;
          color: var(--text-secondary) !important;
          margin: 1rem 0 0.5rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.06em !important;
          display: flex !important;
          align-items: center !important;
          gap: 0.4rem !important;
        }
        .explanation-content .gatilhos {
          padding: 0.75rem 1rem !important;
          border-radius: 10px !important;
          margin-bottom: 1rem !important;
          gap: 0.4rem !important;
          font-size: 0.8125rem !important;
        }
        .explanation-content .comentario-geral,
        .explanation-content .conteudo-completo,
        .explanation-content .raciocinio-alternativas,
        .explanation-content .pegadinha,
        .explanation-content .contexto-especifico {
          padding: 0.875rem 1rem !important;
          border-radius: 12px !important;
          margin-bottom: 1rem !important;
        }
        .explanation-content p {
          margin: 0 0 0.625rem !important;
          font-size: 0.9rem !important;
          line-height: 1.65 !important;
        }
      `}</style>
    </div>
  )
}
