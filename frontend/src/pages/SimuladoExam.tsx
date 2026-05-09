import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { simuladosApi } from '../lib/api'
import toast from 'react-hot-toast'
import {
  ArrowLeft, ArrowRight, CheckCircle, XCircle, Flag, Clock,
  BarChart3, BookOpen, Brain, Target, ChevronDown, ChevronUp,
  Trophy, RotateCcw, Loader2,
} from 'lucide-react'

/* ── tipos ── */
interface ExamQuestion {
  examQuestionId: string; order: number; selectedOpt: string | null; isCorrect: boolean | null
  question: {
    id: string; statement: string; options: { letter: string; text: string }[]
    difficulty: string; year?: number; specialty?: { name: string; parent?: { name: string } | null } | null
    institution?: { acronym: string } | null; images?: { id: string; url: string; caption?: string }[]
    correctOption?: string; explanation?: string; reasoningLine?: string[]
  }
}
interface MockExam {
  id: string; title: string; totalQuestions: number; status: string
  timeLimitMin?: number | null; startedAt?: string | null; correctCount: number; score?: number | null
  questions: ExamQuestion[]
}

const diffLabel: Record<string,string> = { FACIL:'Fácil', MEDIO:'Médio', DIFICIL:'Difícil' }
const diffColor: Record<string,string> = { FACIL:'#10B981', MEDIO:'#F59E0B', DIFICIL:'#EF4444' }

function Timer({ startedAt, limitMin, finished }: { startedAt?: string|null, limitMin?: number|null, finished: boolean }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!startedAt || finished) return
    const start = new Date(startedAt).getTime()
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(id)
  }, [startedAt, finished])
  const total   = limitMin ? limitMin * 60 : null
  const display = total ? Math.max(0, total - elapsed) : elapsed
  const mm = String(Math.floor(display / 60)).padStart(2, '0')
  const ss = String(display % 60).padStart(2, '0')
  const pct = total ? Math.min(100, (elapsed / total) * 100) : null
  const over  = total ? elapsed > total : false
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Clock size={15} color={over ? '#FF453A' : 'var(--text-secondary)'} />
      <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '14px', color: over ? '#FF453A' : 'var(--text-primary)', letterSpacing: '0.5px' }}>
        {total ? (over ? '+' : '') : ''}{mm}:{ss}
      </span>
    </div>
  )
}

export default function SimuladoExamPage() {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()
  const qc        = useQueryClient()

  const [current, setCurrent]         = useState(0)
  const [localAnswers, setLocalAnswers] = useState<Record<number, string>>({})  // order → selectedOpt
  const [showResult, setShowResult]   = useState(false)
  const [showExpl, setShowExpl]       = useState<number | null>(null)
  const pendingRef = useRef<Record<number, string>>({})

  const { data: exam, isLoading } = useQuery<MockExam>({
    queryKey:  ['simulado', id],
    queryFn:   () => simuladosApi.get(id!),
    refetchOnWindowFocus: false,
  })

  // Inicializa respostas salvas do servidor
  useEffect(() => {
    if (!exam) return
    if (exam.status === 'FINISHED') setShowResult(true)
    const saved: Record<number, string> = {}
    exam.questions.forEach(eq => { if (eq.selectedOpt) saved[eq.order] = eq.selectedOpt })
    setLocalAnswers(saved)
    const firstUnanswered = exam.questions.find(q => !q.selectedOpt)?.order ?? 0
    setCurrent(firstUnanswered)
  }, [exam?.id]) // eslint-disable-line

  const startMutation = useMutation({
    mutationFn: () => simuladosApi.start(id!),
    onSuccess:  (data) => {
      qc.setQueryData(['simulado', id], (old: any) => old ? { ...old, status: data.exam.status, startedAt: data.exam.startedAt } : old)
      qc.invalidateQueries({ queryKey: ['simulado', id] })
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Erro ao iniciar simulado'),
  })

  const answerMutation = useMutation({
    mutationFn: ({ order, selectedOpt }: { order: number; selectedOpt: string }) =>
      simuladosApi.answer(id!, { order, selectedOpt }),
  })

  const finishMutation = useMutation({
    mutationFn: () => simuladosApi.finish(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['simulado', id] })
      setShowResult(true)
    },
    onError: () => toast.error('Erro ao finalizar simulado'),
  })

  const handleStart = () => startMutation.mutate()

  const handleAnswer = useCallback((order: number, opt: string) => {
    setLocalAnswers(prev => ({ ...prev, [order]: opt }))
    pendingRef.current[order] = opt
    answerMutation.mutate({ order, selectedOpt: opt })
  }, []) // eslint-disable-line

  const handleFinish = () => {
    const answeredCount = Object.keys(localAnswers).length
    const total = exam?.totalQuestions ?? 0
    const unanswered = total - answeredCount
    if (unanswered > 0) {
      if (!window.confirm(`Você tem ${unanswered} questão(ões) sem resposta. Deseja finalizar mesmo assim?`)) return
    }
    finishMutation.mutate()
  }

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12 }}>
      <Loader2 size={24} color="var(--accent-blue)" className="animate-spin" />
      <span style={{ color: 'var(--text-muted)' }}>Carregando simulado...</span>
    </div>
  )

  if (!exam) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Simulado não encontrado</div>

  /* ── Tela inicial (PENDING) ── */
  if (exam.status === 'PENDING' && !showResult) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center', paddingTop: '3rem' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--gradient-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <Trophy size={36} color="white" />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>{exam.title}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          {exam.totalQuestions} questões{exam.timeLimitMin ? ` · ${exam.timeLimitMin} minutos` : ''}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {[
            { icon: <BookOpen size={18} />, label: `${exam.totalQuestions} questões` },
            { icon: <Clock size={18} />,    label: exam.timeLimitMin ? `${exam.timeLimitMin} min` : 'Sem limite' },
            { icon: <Target size={18} />,   label: 'Aleatório' },
          ].map((item, i) => (
              <div key={i} className="apple-card" style={{ padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {item.icon} {item.label}
            </div>
          ))}
        </div>
        <button id="start-simulado-btn" className="btn btn-primary" onClick={handleStart}
          disabled={startMutation.isPending}
          style={{ padding: '0.875rem 2.5rem', fontSize: '1.0625rem', fontWeight: 700, borderRadius: 12 }}>
          {startMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <>🚀 Iniciar Simulado</>}
        </button>
      </div>
    )
  }

  /* ── Tela de resultado (FINISHED) ── */
  if (showResult && exam.status === 'FINISHED') {
    const correct    = exam.correctCount
    const total      = exam.totalQuestions
    const score      = exam.score ?? Math.round((correct / total) * 100)
    const wrong      = exam.questions.filter(q => q.isCorrect === false).length
    const unanswered = exam.questions.filter(q => q.selectedOpt === null).length

    return (
      <div className="animate-fade-in" style={{ maxWidth: 820, margin: '0 auto', paddingBottom: '3rem' }}>
        {/* Score hero */}
        <div className="apple-card" style={{ padding: '40px', textAlign: 'center', marginBottom: '24px',
          background: score >= 70 ? 'rgba(48,209,88,0.08)'
            : score >= 50 ? 'rgba(245,158,11,0.08)'
            : 'rgba(255,69,58,0.08)' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '5rem', lineHeight: 1,
            color: score >= 70 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444' }}>
            {score}%
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.5rem' }}>{exam.title}</div>
          <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {score >= 70 ? '🏆 Excelente desempenho!' : score >= 50 ? '📈 Bom trabalho, continue!' : '💪 Revise os conteúdos e tente novamente'}
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'ACERTOS', value: correct, sub: `de ${total}`, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
            { label: 'ERROS',   value: wrong,   sub: `de ${total}`, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
            { label: 'EM BRANCO', value: unanswered, sub: 'não respondidas', color: '#94A3B8', bg: 'rgba(100,116,139,0.1)' },
          ].map(s => (
            <div key={s.label} className="apple-card" style={{ padding: '24px', textAlign: 'center', background: s.bg, border: `1px solid ${s.color}22` }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2.5rem', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1 }}>{s.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Revisão de questões */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={18} color="var(--accent-blue)" /> Revisão das Questões
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {exam.questions.map((eq, i) => {
            const q = eq.question
            const answered = eq.selectedOpt !== null
            const correct  = eq.isCorrect
            const isOpen   = showExpl === i
            return (
              <div key={eq.examQuestionId} className="apple-card" style={{ padding: 0, overflow: 'hidden',
                border: `1px solid ${!answered ? 'var(--border)' : correct ? 'rgba(48,209,88,0.3)' : 'rgba(255,69,58,0.25)'}` }}>
                <button onClick={() => setShowExpl(isOpen ? null : i)} style={{
                  width: '100%', padding: '1rem 1.25rem', background: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.875rem', textAlign: 'left' }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, fontWeight: 700, fontSize: '0.8125rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: !answered ? 'rgba(255,255,255,0.06)' : correct ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                    color: !answered ? 'var(--text-muted)' : correct ? '#10B981' : '#EF4444' }}>
                    {!answered ? (i+1) : correct ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  </span>
                  <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    dangerouslySetInnerHTML={{ __html: q.statement.replace(/<[^>]+>/g, '').slice(0, 120) + '...' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    {eq.selectedOpt && <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: correct ? '#10B981' : '#EF4444' }}>→ {eq.selectedOpt}</span>}
                    {q.correctOption && <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#10B981', background: 'rgba(16,185,129,0.15)', padding: '0.15rem 0.4rem', borderRadius: 6 }}>{q.correctOption}</span>}
                    {isOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="animate-fade-in" style={{ borderTop: '1px solid var(--border)', padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-primary)', marginBottom: '1rem' }}
                      dangerouslySetInnerHTML={{ __html: q.statement }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: q.explanation || q.reasoningLine?.length ? '1rem' : 0 }}>
                      {q.options.map(opt => (
                        <div key={opt.letter} style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 8,
                          background: opt.letter === q.correctOption ? 'rgba(16,185,129,0.1)' : opt.letter === eq.selectedOpt ? 'rgba(239,68,68,0.08)' : 'transparent',
                          border: `1px solid ${opt.letter === q.correctOption ? 'rgba(16,185,129,0.3)' : opt.letter === eq.selectedOpt ? 'rgba(239,68,68,0.2)' : 'transparent'}` }}>
                          <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: opt.letter === q.correctOption ? '#10B981' : opt.letter === eq.selectedOpt ? '#EF4444' : 'var(--text-muted)', flexShrink: 0 }}>{opt.letter}</span>
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{opt.text}</span>
                        </div>
                      ))}
                    </div>
                    {q.reasoningLine && q.reasoningLine.length > 0 && (
                      <div style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '0.875rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem', color: 'var(--accent-teal)', fontWeight: 700, fontSize: '0.875rem' }}>
                          <Brain size={15} /> Linha de Raciocínio
                        </div>
                        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                          {q.reasoningLine.map((step, si) => (
                            <li key={si} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                              <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: 'rgba(20,184,166,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-teal)', marginTop: 2 }}>{si+1}</span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {q.explanation && (
                      <div className="explanation-content" dangerouslySetInnerHTML={{ __html: q.explanation }} />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/simulados')}>
            <ArrowLeft size={16} /> Meus Simulados
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/simulados/novo')}>
            <RotateCcw size={16} /> Novo Simulado
          </button>
        </div>
      </div>
    )
  }

  /* ── Execução do simulado ── */
  const eqs = exam.questions
  const eq  = eqs[current]
  if (!eq) return null
  const q          = eq.question
  const answered   = localAnswers[eq.order]
  const answeredPct = Math.round((Object.keys(localAnswers).length / exam.totalQuestions) * 100)

  return (
    <div className="animate-spring" style={{ maxWidth: 820, margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Dynamic Island Progress */}
      <div style={{
        margin: '0 auto 2.5rem auto', width: 'fit-content', background: 'rgba(28, 28, 30, 0.65)', 
        backdropFilter: 'blur(20px)', padding: '10px 20px', borderRadius: '40px',
        display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
          {current + 1} <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>/ {exam.totalQuestions}</span>
        </div>
        <div style={{ width: 140, height: 6, borderRadius: 6, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 6, background: '#fff', width: `${((current + 1) / exam.totalQuestions) * 100}%`, transition: 'width 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)' }} />
        </div>
        <Timer startedAt={exam.startedAt} limitMin={exam.timeLimitMin} finished={exam.status === 'FINISHED'} />
      </div>

      {/* Dot navigation */}
      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {eqs.map((eq2, i) => {
          const ans = localAnswers[eq2.order]
          return (
            <button key={i} onClick={() => setCurrent(i)}
              title={`Questão ${i + 1}`}
              style={{ width: 22, height: 22, borderRadius: 6, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: i === current ? 'var(--accent-blue)'
                  : ans ? 'rgba(16,185,129,0.4)'
                  : 'rgba(255,255,255,0.08)',
                transform: i === current ? 'scale(1.15)' : 'scale(1)',
              }} />
          )
        })}
      </div>

      {/* Question card */}
      <div style={{ padding: '0 0.5rem 2rem 0.5rem', marginBottom: '1rem' }}>
        {/* Meta */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {q.specialty?.parent && <span className="badge badge-blue">{q.specialty.parent.name}</span>}
          {q.specialty && <span className="badge badge-blue">{q.specialty.name}</span>}
          {q.institution && <span className="badge badge-gray">{q.institution.acronym}</span>}
          {q.year && <span className="badge badge-gray">{q.year}</span>}
        </div>

        <div style={{ fontSize: '1.35rem', fontWeight: 500, lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: '2.5rem', letterSpacing: '-0.015em' }}
          dangerouslySetInnerHTML={{ __html: q.statement }} />

        {q.images && q.images.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {q.images.map(img => (
              <div key={img.id} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={img.url} alt={img.caption || 'Imagem'} style={{ maxWidth: 320, display: 'block' }} />
              </div>
            ))}
          </div>
        )}

        {/* Alternativas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {q.options.map(({ letter, text }) => (
            <button key={letter} id={`opt-${letter}`}
              onClick={() => handleAnswer(eq.order, letter)}
              className={`apple-option${answered === letter ? ' selected' : ''}`}>
              <span style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: '1rem',
                background: answered === letter ? '#fff' : 'rgba(255,255,255,0.1)', color: answered === letter ? '#000' : 'var(--text-primary)', transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                {letter}
              </span>
              <span style={{ flex: 1 }}>{text}</span>
              {answered === letter && <CheckCircle size={18} color="#000" />}
            </button>
          ))}
        </div>

        <div style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Flag size={13} />
          {answered
            ? <span>Resposta registrada: <strong style={{ color: 'var(--accent-blue)' }}>{answered}</strong> — você pode mudar antes de finalizar</span>
            : <span>Selecione uma alternativa. Você pode navegar entre questões e voltar depois.</span>}
        </div>
      </div>

      {/* Navegação */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button className="btn btn-ghost" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>
          <ArrowLeft size={16} /> Anterior
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
          <span style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--accent-green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--accent-green)', fontSize: '0.75rem' }}>
            {Object.keys(localAnswers).length}
          </span>
          <span>/{exam.totalQuestions} respondidas</span>
        </div>

        {current < exam.totalQuestions - 1 ? (
          <button className="apple-btn" onClick={() => setCurrent(c => Math.min(eqs.length - 1, c + 1))}>
            Próxima <ArrowRight size={16} />
          </button>
        ) : (
          <button id="finish-simulado-btn" className="apple-btn"
            onClick={handleFinish} disabled={finishMutation.isPending}
            style={{ background: '#fff', color: '#000' }}>
            {finishMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <><Trophy size={16} /> Finalizar</>}
          </button>
        )}
      </div>
    </div>
  )
}
