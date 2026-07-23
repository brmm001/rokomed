import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { simuladosApi } from '../lib/api'
import toast from 'react-hot-toast'
import {
  ArrowLeft, ArrowRight, CheckCircle, XCircle, Flag, Clock,
  BarChart3, BookOpen, Brain, Target, ChevronDown, ChevronUp,
  Trophy, RotateCcw, Loader2, Printer, ListTodo
} from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import PrintModal, { type PrintQuestion } from '../components/PrintView'

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
  const over  = total ? elapsed > total : false
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: over ? 'rgba(255,69,58,0.1)' : 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '12px' }}>
      <Clock size={16} color={over ? '#FF453A' : 'var(--accent-blue)'} />
      <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '18px', color: over ? '#FF453A' : 'var(--text-primary)', letterSpacing: '0.5px' }}>
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
  const [localAnswers, setLocalAnswers] = useState<Record<number, string>>({})
  const [showResult, setShowResult]   = useState(false)
  const [showExpl, setShowExpl]       = useState<number | null>(null)
  const [showPrint, setShowPrint]     = useState(false)
  const pendingRef = useRef<Record<number, string>>({})

  const { data: exam, isLoading } = useQuery<MockExam>({
    queryKey:  ['simulado', id],
    queryFn:   () => simuladosApi.get(id!),
    refetchOnWindowFocus: false,
  })

  // Inicializa respostas
  useEffect(() => {
    if (!exam) return
    if (exam.status === 'FINISHED') setShowResult(true)
    const saved: Record<number, string> = {}
    exam.questions.forEach(eq => { if (eq.selectedOpt) saved[eq.order] = eq.selectedOpt })
    setLocalAnswers(saved)
    const firstUnanswered = exam.questions.find(q => !q.selectedOpt)?.order ?? 0
    setCurrent(firstUnanswered)
  }, [exam?.id])

  const startMutation = useMutation({
    mutationFn: () => simuladosApi.start(id!),
    onSuccess:  (data) => {
      qc.setQueryData(['simulado', id], (old: any) => old ? { ...old, status: data.exam.status, startedAt: data.exam.startedAt } : old)
      qc.invalidateQueries({ queryKey: ['simulado', id] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Erro ao iniciar simulado')
    },
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
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Erro ao finalizar simulado')
    },
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

  /* ── PENDING: Overview ── */
  if (exam.status === 'PENDING' && !showResult) {
    // Collect specialties to show overview
    const specCounts = exam.questions.reduce((acc, eq) => {
      const sName = eq.question.specialty?.parent?.name || eq.question.specialty?.name || 'Outros'
      acc[sName] = (acc[sName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return (
      <div className="animate-fade-in" style={{ maxWidth: 700, margin: '0 auto', paddingTop: '2rem' }}>
        <button onClick={() => navigate('/simulados')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: '2rem', padding: 0 }}>
          <ArrowLeft size={16} /> Voltar aos Simulados
        </button>

        <div className="glass" style={{ padding: '2.5rem 2rem', borderRadius: 20, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--gradient-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 20px rgba(59,130,246,0.3)' }}>
            <Trophy size={36} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>{exam.title || 'Simulado Personalizado'}</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
            Visão geral da prova e distribuição dos temas
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="apple-card" style={{ padding: '1.25rem' }}>
              <BookOpen size={20} color="var(--accent-blue)" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{exam.totalQuestions}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Questões</div>
            </div>
            <div className="apple-card" style={{ padding: '1.25rem' }}>
              <Clock size={20} color="var(--accent-gold)" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{exam.timeLimitMin ? `${exam.timeLimitMin} min` : 'Livre'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duração Estimada</div>
            </div>
          </div>

          <div style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ListTodo size={18} color="var(--accent-blue)" /> Áreas Abordadas
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {Object.entries(specCounts).map(([name, count]) => (
                <div key={name} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '0.5rem 0.875rem', borderRadius: 10, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{count}</span> questões de {name}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" onClick={() => setShowPrint(true)} style={{ padding: '0.875rem 1.5rem', borderRadius: 12 }}>
              <Printer size={18} /> Imprimir PDF
            </button>
            <button className="btn btn-primary" onClick={handleStart} disabled={startMutation.isPending}
              style={{ padding: '0.875rem 3rem', fontSize: '1.0625rem', fontWeight: 700, borderRadius: 12, boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }}>
              {startMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : '🚀 Começar Agora'}
            </button>
          </div>
        </div>

        {showPrint && (
          <PrintModal title={exam.title} questions={exam.questions.map((eq, i) => ({
            number: i + 1, statement: eq.question.statement, options: eq.question.options, correctOption: eq.question.correctOption,
            year: eq.question.year, institution: eq.question.institution?.acronym, specialty: eq.question.specialty?.name, images: eq.question.images
          } as PrintQuestion))} onClose={() => setShowPrint(false)} />
        )}
      </div>
    )
  }

  /* ── FINISHED: Resultado com Radar Chart ── */
  if (showResult && exam.status === 'FINISHED') {
    const correct    = exam.correctCount
    const total      = exam.totalQuestions
    const score      = exam.score ?? Math.round((correct / total) * 100)
    const wrong      = exam.questions.filter(q => q.isCorrect === false).length
    const unanswered = exam.questions.filter(q => q.selectedOpt === null).length

    // Calculando dados para o Radar Chart
    const specialtyStats = exam.questions.reduce((acc, eq) => {
      const specName = eq.question.specialty?.parent?.name || eq.question.specialty?.name || 'Geral'
      if (!acc[specName]) acc[specName] = { name: specName, total: 0, correct: 0 }
      acc[specName].total++
      if (eq.isCorrect) acc[specName].correct++
      return acc
    }, {} as Record<string, { name: string, total: number, correct: number }>)

    const radarData = Object.values(specialtyStats).map(s => ({
      subject: s.name,
      A: Math.round((s.correct / s.total) * 100),
      fullMark: 100
    }))

    return (
      <div className="animate-fade-in" style={{ maxWidth: 900, margin: '0 auto', paddingBottom: '3rem' }}>
        
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/simulados')} style={{ padding: '0.5rem 0.875rem' }}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{exam.title}</div>
          <button className="btn btn-primary" onClick={() => navigate('/simulados/novo')} style={{ padding: '0.5rem 1.25rem', borderRadius: 10 }}>
             Novo Simulado
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Score & KPI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="apple-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem',
              background: score >= 70 ? 'rgba(48,209,88,0.08)' : score >= 50 ? 'rgba(245,158,11,0.08)' : 'rgba(255,69,58,0.08)' }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '5rem', lineHeight: 1, color: score >= 70 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444' }}>
                {score}%
              </div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
                {score >= 70 ? 'Excelente desempenho!' : score >= 50 ? 'Bom trabalho, continue!' : 'Revise os conteúdos'}
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { label: 'ACERTOS', value: correct, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
                { label: 'ERROS',   value: wrong,   color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
                { label: 'BRANCOS', value: unanswered, color: '#94A3B8', bg: 'rgba(100,116,139,0.1)' },
              ].map(s => (
                <div key={s.label} className="apple-card" style={{ padding: '1rem', textAlign: 'center', background: s.bg, border: `1px solid ${s.color}22` }}>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2rem', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Radar Chart */}
          <div className="apple-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Target size={18} color="var(--accent-blue)" /> Desempenho por Área
            </h3>
            <div style={{ flex: 1, minHeight: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} />
                  <Radar name="Aproveitamento" dataKey="A" stroke="var(--accent-blue)" fill="var(--accent-blue)" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Revisão de questões */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={18} color="var(--accent-blue)" /> Gabarito Comentado
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
      </div>
    )
  }

  /* ── IN_PROGRESS: Execução com Sidebar e Grid ── */
  const eqs = exam.questions
  const eq  = eqs[current]
  if (!eq) return null
  const q          = eq.question
  const answered   = localAnswers[eq.order]

  return (
    <div className="animate-spring" style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: '3rem', paddingTop: '1rem' }}>
      
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexDirection: 'row-reverse' }}>
        
        {/* SIDEBAR: Question Map & Timer */}
        <div style={{ width: 320, flexShrink: 0, position: 'sticky', top: '5rem' }}>
          <div className="apple-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Mapa da Prova</h2>
              <Timer startedAt={exam.startedAt} limitMin={exam.timeLimitMin} finished={exam.status === 'FINISHED'} />
            </div>

            {/* Grid 1..N */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.6rem', marginBottom: '2rem' }}>
              {eqs.map((eq2, i) => {
                const ans = localAnswers[eq2.order]
                return (
                  <button key={i} onClick={() => setCurrent(i)}
                    title={`Questão ${i + 1}`}
                    style={{ 
                      aspectRatio: '1', borderRadius: 8, border: '1px solid',
                      cursor: 'pointer', transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.85rem',
                      background: i === current ? 'rgba(59,130,246,0.2)' : ans ? 'rgba(59,130,246,0.9)' : 'rgba(255,255,255,0.03)',
                      borderColor: i === current ? '#3B82F6' : ans ? 'rgba(59,130,246,0.9)' : 'var(--border)',
                      color: ans && i !== current ? '#fff' : i === current ? '#3B82F6' : 'var(--text-muted)',
                      transform: i === current ? 'scale(1.08)' : 'scale(1)',
                    }}>
                    {i + 1}
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(59,130,246,0.9)' }} /> Respondidas
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }} /> Em branco
              </div>
            </div>

            <button id="finish-simulado-btn" className="btn btn-primary"
              onClick={handleFinish} disabled={finishMutation.isPending}
              style={{ width: '100%', padding: '0.875rem', borderRadius: 10, fontWeight: 700, fontSize: '0.95rem' }}>
              {finishMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <><Trophy size={16} /> Entregar Simulado</>}
            </button>
          </div>
        </div>

        {/* MAIN CONTENT: Question Area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="glass" style={{ borderRadius: 20, padding: '2.5rem' }}>
            
            {/* Header / Meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--accent-blue)', letterSpacing: 1, textTransform: 'uppercase' }}>Questão {current + 1}</span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {q.specialty?.parent && <span className="badge badge-gray">{q.specialty.parent.name}</span>}
                  {q.specialty && <span className="badge badge-gray">{q.specialty.name}</span>}
                  {q.institution && <span className="badge badge-gray">{q.institution.acronym}</span>}
                  {q.year && <span className="badge badge-gray">{q.year}</span>}
                </div>
              </div>
              <button className="btn btn-ghost" onClick={() => setShowPrint(true)} style={{ padding: '0.5rem 0.8rem', fontSize: '0.8125rem' }}>
                <Printer size={15} /> Imprimir
              </button>
            </div>

            <div className="text-lg md:text-xl font-medium leading-relaxed text-[var(--text-primary)] mb-6 md:mb-10 tracking-tight"
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
                  <span style={{ flex: 1, textAlign: 'left', lineHeight: 1.5 }}>{text}</span>
                  {answered === letter && <CheckCircle size={18} color="#000" />}
                </button>
              ))}
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <button className="btn btn-ghost" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>
                <ArrowLeft size={16} /> Anterior
              </button>
              {current < exam.totalQuestions - 1 && (
                <button className="btn btn-primary" onClick={() => setCurrent(c => Math.min(eqs.length - 1, c + 1))} style={{ padding: '0.6rem 1.25rem', borderRadius: 10 }}>
                  Próxima <ArrowRight size={16} />
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {showPrint && (
        <PrintModal title={exam.title} questions={eqs.map((eq2, i) => ({
          number: i + 1, statement: eq2.question.statement, options: eq2.question.options, correctOption: eq2.question.correctOption,
          year: eq2.question.year, institution: eq2.question.institution?.acronym, specialty: eq2.question.specialty?.name, images: eq2.question.images
        } as PrintQuestion))} onClose={() => setShowPrint(false)} />
      )}
    </div>
  )
}
