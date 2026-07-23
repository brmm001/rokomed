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

// Componentes UI
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'

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
const diffVariant: Record<string, "green" | "gold" | "red"> = {
  FACIL:   'green',
  MEDIO:   'gold',
  DIFICIL: 'red',
}
const diffBarColor: Record<string, string> = {
  FACIL:   'linear-gradient(90deg,#10B981,#6EE7B7)',
  MEDIO:   'linear-gradient(90deg,#F59E0B,#FCD34D)',
  DIFICIL: 'linear-gradient(90deg,#EF4444,#F87171)',
}
const diffColorHex: Record<string, string> = {
  FACIL: '#10B981', MEDIO: '#F59E0B', DIFICIL: '#EF4444'
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

  // Atalhos de teclado globais
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const key = e.key.toUpperCase()
      if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
        if (!submitted) handleAnswer(key)
      } else if (e.key === 'Enter') {
        if (!submitted && selected) handleSubmit()
        else if (submitted) handleNextQuestion()
      } else if (key === 'N') {
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
    <div className="flex items-center justify-center min-h-[400px] gap-3">
      <Loader2 size={24} className="text-[var(--accent-blue)] animate-spin" />
      <span className="text-[var(--text-muted)]">Carregando questão...</span>
    </div>
  )

  if (!q) return (
    <div className="text-center p-16">
      <p className="text-[var(--text-muted)]">Questão não encontrada</p>
      <Button variant="ghost" onClick={() => navigate('/questoes')} className="mt-3">
        <ArrowLeft size={16} /> Voltar
      </Button>
    </div>
  )

  const options   = q.options
  const isCorrect = selected !== null && selected === q.correctOption
  const breadcrumb = buildBreadcrumb(q.specialty)

  const getOptionState = (letter: string): 'idle' | 'selected' | 'correct' | 'wrong' | 'dimmed' => {
    if (!submitted) return selected === letter ? 'selected' : 'idle'
    if (letter === q.correctOption) return 'correct'
    if (letter === selected) return 'wrong'
    return 'dimmed'
  }

  return (
    <div className="max-w-[820px] mx-auto pb-16">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/questoes')} className="flex-shrink-0 !px-3">
          <ArrowLeft size={16} /> Voltar
        </Button>

        <div className="flex-1 min-w-0">
          {sessionData.queue.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="blue">SESSÃO</Badge>
              <span className="text-xs text-[var(--text-muted)]">
                {sessionData.index + 1} de {sessionData.queue.length} questões
              </span>
            </div>
          )}

          {breadcrumb.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {breadcrumb.map((s, i) => (
                <span key={s.id} className="flex items-center gap-1.5">
                  <span className={`text-xs font-semibold rounded-md ${
                    i === breadcrumb.length - 1 
                      ? 'text-[#93C5FD] bg-[rgba(59,130,246,0.12)] px-2.5 py-1 border border-solid border-[rgba(59,130,246,0.2)]'
                      : 'text-[var(--text-muted)]'
                  }`}>{s.name}</span>
                  {i < breadcrumb.length - 1 && <ChevronRight size={11} className="text-[var(--text-muted)]" />}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2 flex-wrap items-center">
            {q.institution && <Badge variant="gray">{q.institution.acronym}</Badge>}
            {q.year && <Badge variant="gray">{q.year}</Badge>}
            <Badge variant={diffVariant[q.difficulty]}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: diffColorHex[q.difficulty] }} />
              {diffLabel[q.difficulty]}
            </Badge>
            {q.code && <span className="text-[11px] text-[var(--text-muted)] font-mono">#{q.code}</span>}
          </div>
        </div>

        <div className="flex gap-1.5 flex-shrink-0">
          {[
            { btnId: 'bookmark-btn', icon: q.isBookmarked ? <BookmarkCheck size={17} color="#F59E0B" /> : <Bookmark size={17} />, onClick: () => bookmarkMutation.mutate(), active: false, title: 'Favoritar' },
            { btnId: 'note-btn', icon: <MessageSquare size={17} color={showNote ? '#3B82F6' : undefined} />, onClick: () => setShowNote(p => !p), active: showNote, title: 'Anotações (N)' },
            { btnId: 'print-question-btn', icon: <Printer size={17} />, onClick: () => setShowPrint(true), active: false, title: 'Imprimir' },
          ].map(({ btnId, icon, onClick, active, title }) => (
            <button key={btnId} id={btnId} onClick={onClick} title={title}
              className={`p-2 rounded-[10px] flex items-center transition-all cursor-pointer ${
                active ? 'bg-[rgba(59,130,246,0.15)] border border-solid border-[rgba(59,130,246,0.3)] text-[var(--accent-blue)]'
                       : 'bg-[rgba(255,255,255,0.05)] border border-solid border-[rgba(255,255,255,0.08)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.1)]'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── Question Body ─────────────────────────────────────────────────── */}
      <Card variant="solid" className="mb-5 bg-[rgba(10,22,40,0.6)]">
        {/* Statement */}
        <div
          className="text-base leading-[1.8] text-[var(--text-primary)] mb-7"
          dangerouslySetInnerHTML={{ __html: q.statement }}
        />

        {/* Images */}
        {q.images && q.images.length > 0 && (
          <div className="flex gap-3 flex-wrap mb-6">
            {q.images.map(img => (
              <div key={img.id} className="rounded-xl overflow-hidden border border-solid border-[rgba(255,255,255,0.08)]">
                <img src={img.url} alt={img.caption || 'Imagem'} className="max-w-[320px] block" />
                {img.caption && <p className="text-xs text-[var(--text-muted)] text-center m-2">{img.caption}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Options */}
        <div className="flex flex-col gap-2">
          {options.map(({ letter, text }) => {
            const state = getOptionState(letter)
            const stateClasses = {
              idle:     "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.07)] text-[var(--text-primary)] hover:bg-[rgba(59,130,246,0.08)] hover:border-[var(--border-accent)]",
              selected: "bg-[rgba(59,130,246,0.12)] border-[rgba(59,130,246,0.4)] text-[var(--text-primary)]",
              correct:  "bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.5)] text-[var(--text-primary)]",
              wrong:    "bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.4)] text-[var(--text-primary)]",
              dimmed:   "bg-[rgba(255,255,255,0.015)] border-[rgba(255,255,255,0.04)] text-[var(--text-muted)] opacity-60",
            }
            const letterBg = {
              idle: 'bg-[rgba(255,255,255,0.08)]', selected: 'bg-[#3B82F6]',
              correct: 'bg-[#10B981]', wrong: 'bg-[#EF4444]', dimmed: 'bg-[rgba(255,255,255,0.04)]',
            }
            return (
              <button
                id={`option-${letter}`}
                key={letter}
                onClick={() => handleAnswer(letter)}
                disabled={submitted}
                className={`w-full text-left rounded-xl p-3.5 flex items-start gap-3.5 text-[15px] leading-[1.55] font-inter transition-all duration-200 border border-solid ${stateClasses[state]} ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className={`w-[30px] h-[30px] rounded-lg shrink-0 flex items-center justify-center font-bold text-[14px] text-white transition-all duration-200 ${letterBg[state]}`}>
                  {state === 'correct' && <CheckCircle size={16} color="#fff" />}
                  {state === 'wrong'   && <XCircle size={16} color="#fff" />}
                  {state !== 'correct' && state !== 'wrong' && letter}
                </span>
                <span className="flex-1 pt-[3px]">{text}</span>
              </button>
            )
          })}
        </div>

        {/* Submit button */}
        {!submitted && (
          <div className="mt-5">
            <Button
              id="submit-answer-btn"
              onClick={handleSubmit}
              disabled={selected === null || answerMutation.isPending}
              className={`w-full !py-3.5 !rounded-xl !text-base font-outfit ${selected === null ? '!bg-[rgba(255,255,255,0.05)] !text-[var(--text-muted)]' : ''}`}
            >
              {answerMutation.isPending
                ? <><Loader2 size={18} className="animate-spin" /> Verificando...</>
                : <><Zap size={18} /> Confirmar Resposta <span className="text-[11px] opacity-60 ml-1">(Enter)</span></>
              }
            </Button>
            {selected === null && (
              <p className="text-center text-[13px] text-[var(--text-muted)] mt-2.5 flex items-center justify-center gap-1.5">
                <Clock size={13} /> Você também pode usar as teclas A-E do teclado
              </p>
            )}
          </div>
        )}
      </Card>

      {/* ── Result panel ─────────────────────────────────────────────────── */}
      {submitted && (
        <div className="flex flex-col gap-4 animate-[study-slide-up_0.4s_ease_both]">

          {/* Result banner */}
          <div className={`rounded-2xl p-5 border border-solid flex items-center gap-4 ${
            isCorrect
              ? 'bg-gradient-to-br from-[rgba(16,185,129,0.12)] to-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.35)]'
              : 'bg-gradient-to-br from-[rgba(239,68,68,0.12)] to-[rgba(239,68,68,0.05)] border-[rgba(239,68,68,0.35)]'
          }`}>
            <div className={`w-11 h-11 rounded-full shrink-0 flex items-center justify-center border border-solid ${
              isCorrect ? 'bg-[rgba(16,185,129,0.18)] border-[rgba(16,185,129,0.45)]' : 'bg-[rgba(239,68,68,0.18)] border-[rgba(239,68,68,0.45)]'
            }`}>
              {isCorrect ? <CheckCircle size={22} color="#10B981" /> : <XCircle size={22} color="#EF4444" />}
            </div>
            <div className="flex-1">
              <div className={`font-outfit font-extrabold text-[17px] mb-0.5 ${isCorrect ? 'text-[#6EE7B7]' : 'text-[#FCA5A5]'}`}>
                {isCorrect ? 'Resposta correta!' : 'Resposta incorreta'}
              </div>
              {!isCorrect && (
                <div className="text-[var(--text-secondary)] text-[13px]">
                  Você marcou <strong className="text-[#FCA5A5]">{selected}</strong> · Gabarito: <strong className="text-[#6EE7B7]">{q.correctOption}</strong>
                </div>
              )}
              {isCorrect && <div className="text-[var(--text-muted)] text-[13px]">Continue assim! 🏆</div>}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2.5">
            <Card variant="solid" padding="sm" className="bg-[rgba(10,22,40,0.7)] p-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <BarChart3 size={14} color="#3B82F6" />
                <span className="text-[10px] text-[var(--text-muted)] font-bold tracking-wider">ACERTO GERAL</span>
              </div>
              {q.stats?.correctRate !== null && q.stats?.correctRate !== undefined ? (
                <>
                  <div className={`text-[26px] font-outfit font-extrabold leading-none ${q.stats.correctRate >= 60 ? 'text-[#6EE7B7]' : q.stats.correctRate >= 40 ? 'text-[#FCD34D]' : 'text-[#FCA5A5]'}`}>
                    {q.stats.correctRate}%
                  </div>
                  <div className="mt-2 h-[3px] rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${q.stats.correctRate}%`, backgroundColor: q.stats.correctRate >= 60 ? '#10B981' : q.stats.correctRate >= 40 ? '#F59E0B' : '#EF4444' }} />
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-1.5 flex items-center gap-1">
                    <Users size={11} /> {q.stats.correctAnswers}/{q.stats.totalAnswers}
                  </div>
                </>
              ) : <div className="text-xs text-[var(--text-muted)] mt-1.5">Seja o primeiro!</div>}
            </Card>

            <Card variant="solid" padding="sm" className="bg-[rgba(10,22,40,0.7)] p-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Target size={14} color={diffColorHex[q.difficulty]} />
                <span className="text-[10px] text-[var(--text-muted)] font-bold tracking-wider">DIFICULDADE</span>
              </div>
              <div className="text-[18px] font-outfit font-extrabold leading-none flex items-center gap-1.5" style={{ color: diffColorHex[q.difficulty] }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: diffColorHex[q.difficulty] }} />
                {diffLabel[q.difficulty]}
              </div>
              <div className="mt-2 h-[3px] rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ background: diffBarColor[q.difficulty], width: q.difficulty === 'FACIL' ? '33%' : q.difficulty === 'MEDIO' ? '66%' : '100%' }} />
              </div>
            </Card>

            <Card variant="solid" padding="sm" className="bg-[rgba(10,22,40,0.7)] p-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <TrendingUp size={14} color={isCorrect ? '#10B981' : '#EF4444'} />
                <span className="text-[10px] text-[var(--text-muted)] font-bold tracking-wider">SEU RESULTADO</span>
              </div>
              <div className={`text-[18px] font-outfit font-extrabold leading-none ${isCorrect ? 'text-[#6EE7B7]' : 'text-[#FCA5A5]'}`}>
                {isCorrect ? '✓ Acertou' : '✗ Errou'}
              </div>
              {!isCorrect && (
                <div className="text-[11px] text-[var(--text-muted)] mt-1.5">
                  {selected} → {q.correctOption}
                </div>
              )}
            </Card>
          </div>

          {/* Reasoning line */}
          {q.reasoningLine && q.reasoningLine.length > 0 && (
            <div className="bg-[rgba(20,184,166,0.05)] border border-solid border-[rgba(20,184,166,0.18)] rounded-2xl p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-[30px] h-[30px] rounded-lg bg-[rgba(20,184,166,0.15)] border border-solid border-[rgba(20,184,166,0.3)] flex items-center justify-center shrink-0">
                  <Brain size={15} color="#14B8A6" />
                </div>
                <h3 className="m-0 text-[15px] font-bold text-[#5EEAD4]">Linha de Raciocínio</h3>
              </div>
              <ol className="m-0 p-0 list-none flex flex-col gap-2">
                {q.reasoningLine.map((step, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="w-[22px] h-[22px] rounded-full shrink-0 bg-[rgba(20,184,166,0.15)] border border-solid border-[rgba(20,184,166,0.35)] flex items-center justify-center text-[11px] font-extrabold text-[#14B8A6] mt-px">
                      {i + 1}
                    </span>
                    <span className="text-[var(--text-secondary)] text-[14px] leading-[1.6] pt-px">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Explanation */}
          {q.explanation && (
            <Card variant="solid" padding="none" className="bg-[rgba(10,22,40,0.7)] overflow-hidden">
              <button
                id="toggle-explanation-btn"
                onClick={() => setShowExpl(p => !p)}
                className={`w-full p-4 bg-[rgba(59,130,246,0.07)] border-none cursor-pointer flex items-center justify-between transition-colors ${showExpl ? 'border-b border-solid border-[rgba(59,130,246,0.12)]' : ''}`}
              >
                <span className="flex items-center gap-2.5 font-outfit font-bold text-[15px] text-[#93C5FD]">
                  <Sparkles size={17} color="#3B82F6" /> Gabarito Comentado
                </span>
                <span className="flex items-center gap-1.5 text-[13px] text-[var(--text-muted)]">
                  {showExpl ? 'Ocultar' : 'Ver explicação'}
                  {showExpl ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>
              {showExpl && (
                <div className="p-6 explanation-content animate-fade-in" dangerouslySetInnerHTML={{ __html: q.explanation }} />
              )}
            </Card>
          )}
        </div>
      )}

      {/* ── Notes ────────────────────────────────────────────────────────── */}
      {showNote && (
        <Card variant="solid" padding="md" className="mt-4 bg-[rgba(10,22,40,0.7)] border-[rgba(59,130,246,0.15)] animate-[study-slide-up_0.3s_ease_both]">
          <h3 className="m-0 mb-3 text-[14px] flex items-center gap-2 text-[#93C5FD] font-semibold">
            <MessageSquare size={15} color="#3B82F6" /> Anotações
          </h3>
          <textarea
            id="note-textarea"
            className="input resize-y text-[14px]"
            rows={4}
            placeholder="Suas anotações sobre esta questão..."
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
          />
          <div className="flex items-center justify-between mt-3 text-[12px]">
            <span className="text-[var(--text-muted)]">Anotações são salvas automaticamente</span>
            <span className={noteMutation.isPending ? 'text-[var(--accent-blue)]' : 'text-[var(--text-muted)]'}>
              {noteMutation.isPending ? 'Salvando...' : noteText === q.note ? 'Salvo' : 'Não salvo'}
            </span>
          </div>
        </Card>
      )}

      {/* ── Bottom actions ────────────────────────────────────────────────── */}
      {submitted && (
        <div className="flex gap-2.5 justify-between mt-6 flex-wrap">
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/questoes')}>
              <ArrowLeft size={15} /> Banco
            </Button>
            <Button id="flag-btn" variant="ghost" className="!text-[var(--text-muted)]">
              <Flag size={15} /> Sinalizar
            </Button>
          </div>
          <Button onClick={handleNextQuestion} className="font-outfit">
            {sessionData.queue.length > 0 && sessionData.index >= sessionData.queue.length - 1 ? (
              <>Concluir sessão <CheckCircle size={17} /></>
            ) : (
              <>Próxima questão <span className="text-[11px] opacity-60 ml-0.5">(Enter)</span> <ChevronRight size={17} /></>
            )}
          </Button>
        </div>
      )}

      {/* Print modal */}
      {showPrint && q && (
        <PrintModal
          title={`Questão ${q.code ?? q.id}${q.institution ? ` — ${q.institution.acronym}` : ''}${q.year ? ` (${q.year})` : ''}`}
          questions={[{
            number: 1, statement: q.statement, options: q.options, correctOption: q.correctOption,
            year: q.year, institution: q.institution?.acronym, specialty: q.specialty?.name, images: q.images,
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
        /* ── Compact alt items ── */
        .explanation-content .alt-item {
          display: flex !important; align-items: flex-start !important;
          padding: 0.5rem 0.75rem !important; border-radius: 10px !important;
          margin-bottom: 0.3rem !important; background: rgba(255,255,255,0.02) !important;
          border: 1px solid rgba(255,255,255,0.05) !important; gap: 0.75rem !important;
          transition: border-color 0.15s !important;
        }
        .explanation-content .alt-item:hover { border-color: rgba(255,255,255,0.1) !important; }
        .explanation-content .alt-letra {
          width: 26px !important; height: 26px !important; border-radius: 7px !important;
          font-size: 0.75rem !important; font-weight: 800 !important; flex-shrink: 0 !important;
        }
        .explanation-content .alt-letra.correta {
          background: rgba(16,185,129,0.18) !important; color: #6EE7B7 !important; border: 1px solid rgba(16,185,129,0.35) !important;
        }
        .explanation-content .alt-letra.incorreta {
          background: rgba(239,68,68,0.14) !important; color: #FCA5A5 !important; border: 1px solid rgba(239,68,68,0.28) !important;
        }
        .explanation-content .alt-texto {
          font-size: 0.875rem !important; line-height: 1.55 !important; color: var(--text-secondary) !important; padding-top: 3px !important;
        }
        .explanation-content .alt-comentario {
          padding-left: 38px !important; font-size: 0.8125rem !important; color: var(--text-muted) !important;
          line-height: 1.55 !important; margin-top: 0.3rem !important; width: 100% !important;
        }
        .explanation-content h4 {
          font-size: 0.75rem !important; font-weight: 800 !important; color: var(--text-secondary) !important;
          margin: 1rem 0 0.5rem !important; text-transform: uppercase !important; letter-spacing: 0.06em !important;
          display: flex !important; align-items: center !important; gap: 0.4rem !important;
        }
        .explanation-content .gatilhos {
          padding: 0.75rem 1rem !important; border-radius: 10px !important; margin-bottom: 1rem !important;
          gap: 0.4rem !important; font-size: 0.8125rem !important;
        }
        .explanation-content .comentario-geral,
        .explanation-content .conteudo-completo,
        .explanation-content .raciocinio-alternativas,
        .explanation-content .pegadinha,
        .explanation-content .contexto-especifico {
          padding: 0.875rem 1rem !important; border-radius: 12px !important; margin-bottom: 1rem !important;
        }
        .explanation-content p {
          margin: 0 0 0.625rem !important; font-size: 0.9rem !important; line-height: 1.65 !important;
        }
      `}</style>
    </div>
  )
}
