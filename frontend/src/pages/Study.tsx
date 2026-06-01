import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { questionsApi } from '../lib/api'
import { useAuthStore } from '../store/auth'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Bookmark, BookmarkCheck, MessageSquare, CheckCircle,
  XCircle, ChevronDown, ChevronUp, Clock, Flag, Loader2,
  Brain, BarChart3, Target, ChevronRight, TrendingUp,
} from 'lucide-react'

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
const diffColor: Record<string, string> = { FACIL: 'badge-green', MEDIO: 'badge-gold', DIFICIL: 'badge-red' }
const diffBarColor: Record<string, string> = {
  FACIL:   'linear-gradient(90deg,#10B981,#6EE7B7)',
  MEDIO:   'linear-gradient(90deg,#F59E0B,#FCD34D)',
  DIFICIL: 'linear-gradient(90deg,#EF4444,#F87171)',
}

/** Constrói a trilha de breadcrumb da especialidade (3 níveis) */
function buildBreadcrumb(specialty: SpecialtyNode | null | undefined): SpecialtyNode[] {
  if (!specialty) return []
  const trail: SpecialtyNode[] = []
  // percorre da raiz até a folha
  let cur: SpecialtyNode | null | undefined = specialty
  const stack: SpecialtyNode[] = []
  while (cur) { stack.unshift(cur); cur = cur.parent }
  return stack
}

export default function StudyPage() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const qc         = useQueryClient()
  const _user      = useAuthStore(s => s.user)

  const [selected, setSelected]   = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [showExpl, setShowExpl]   = useState(true)
  const [showNote, setShowNote]   = useState(false)
  const [noteText, setNoteText]   = useState('')
  const startTime = useRef(Date.now())

  const { data: q, isLoading } = useQuery<Question>({
    queryKey: ['question', id],
    queryFn:  () => questionsApi.get(id!),
  })

  useEffect(() => { if (q?.note) setNoteText(q.note) }, [q])

  // Reset state when question ID changes (critical to prevent carrying over answers)
  useEffect(() => {
    setSelected(null)
    setSubmitted(false)
    setShowExpl(true)
    setShowNote(false)
    setNoteText('')
    startTime.current = Date.now()
  }, [id])

  const handleNextQuestion = async () => {
    try {
      const specId = q?.specialty?.id
      // Buscamos questões do mesmo tema/especialidade
      const res = await questionsApi.list({
        specialtyId: specId,
        limit: 50,
      })
      const list = res?.data || []
      // Filtra a questão atual
      const others = list.filter((item: any) => item.id !== id)
      
      if (others.length > 0) {
        // Seleciona uma aleatória das outras
        const randomQ = others[Math.floor(Math.random() * others.length)]
        navigate(`/questoes/${randomQ.id}`)
      } else {
        toast.success('Você concluiu todas as questões disponíveis desta especialidade!')
        navigate('/questoes')
      }
    } catch (e) {
      toast.error('Erro ao carregar próxima questão')
      navigate('/questoes')
    }
  }

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

  const noteMutation = useMutation({
    mutationFn: () => questionsApi.note(id!, noteText),
    onSuccess: () => toast.success('Anotação salva'),
  })

  const handleAnswer = async (opt: string) => {
    if (submitted) return
    setSelected(opt)
    setSubmitted(true)
    const res = await answerMutation.mutateAsync(opt)
    if (res.isCorrect) toast.success('Resposta correta! 🎉', { duration: 3000 })
    else toast.error(`Incorreto. Gabarito: ${res.correctOption}`, { duration: 3000 })
  }

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

  const options  = q.options
  const isCorrect = selected !== null && selected === q.correctOption
  const breadcrumb = buildBreadcrumb(q.specialty)

  const getOptionClass = (letter: string) => {
    if (!submitted) return 'apple-option'
    if (letter === q.correctOption) return 'apple-option correct'
    if (letter === selected)        return 'apple-option wrong'
    return 'apple-option'
  }

  return (
    <div className="animate-spring" style={{ maxWidth: 820, margin: '0 auto', paddingBottom: '3rem' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button className="btn btn-ghost" onClick={() => navigate('/questoes')} style={{ padding: '0.5rem 0.75rem', flexShrink: 0 }}>
          <ArrowLeft size={18} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Breadcrumb de especialidade */}
          {breadcrumb.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {breadcrumb.map((s, i) => (
                <span key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 600,
                    color: i === breadcrumb.length - 1 ? 'var(--accent-blue)' : 'var(--text-muted)',
                    background: i === breadcrumb.length - 1 ? 'rgba(59,130,246,0.12)' : 'transparent',
                    padding: i === breadcrumb.length - 1 ? '0.15rem 0.5rem' : '0',
                    borderRadius: 6,
                  }}>{s.name}</span>
                  {i < breadcrumb.length - 1 && <ChevronRight size={12} color="var(--text-muted)" />}
                </span>
              ))}
            </div>
          )}

          {/* Badges de metadados */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {q.institution && <span className="badge badge-gray">{q.institution.acronym}</span>}
            {q.year        && <span className="badge badge-gray">{q.year}</span>}
            <span className={`badge ${diffColor[q.difficulty]}`}>{diffLabel[q.difficulty]}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button id="bookmark-btn" className="btn btn-ghost"
            onClick={() => bookmarkMutation.mutate()} disabled={bookmarkMutation.isPending}
            style={{ padding: '0.5rem 0.75rem' }}>
            {q.isBookmarked
              ? <BookmarkCheck size={18} color="var(--accent-gold)" />
              : <Bookmark size={18} />}
          </button>
          <button id="note-btn" className={`btn ${showNote ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowNote(p => !p)} style={{ padding: '0.5rem 0.75rem' }}>
            <MessageSquare size={18} />
          </button>
        </div>
      </div>

      {/* ── Question Card ────────────────────────────────────────────────── */}
      <div style={{ padding: '0 0.5rem 2rem 0.5rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '1.35rem', fontWeight: 500, lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: '2.5rem', letterSpacing: '-0.015em' }}
          dangerouslySetInnerHTML={{ __html: q.statement }} />

        {q.images && q.images.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {q.images.map(img => (
              <div key={img.id} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={img.url} alt={img.caption || 'Imagem'} style={{ maxWidth: 320, display: 'block' }} />
                {img.caption && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', margin: '0.5rem' }}>{img.caption}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Alternativas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {options.map(({ letter, text }) => (
            <button id={`option-${letter}`} key={letter}
              className={getOptionClass(letter)}
              onClick={() => handleAnswer(letter)}
              disabled={submitted}>
              <span style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: '1rem',
                background: submitted && letter === q.correctOption ? '#30D158'
                  : submitted && letter === selected ? '#FF453A'
                  : 'rgba(255,255,255,0.1)',
                color: '#fff',
                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}>
                {submitted && letter === q.correctOption && <CheckCircle size={18} color="#fff" />}
                {submitted && letter === selected && letter !== q.correctOption && <XCircle size={18} color="#fff" />}
                {(!submitted || (letter !== q.correctOption && letter !== selected)) && letter}
              </span>
              <span style={{ flex: 1 }}>{text}</span>
            </button>
          ))}
        </div>

        {!submitted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            <Clock size={14} />
            <span>Selecione uma alternativa para responder</span>
          </div>
        )}
      </div>

      {/* ── Painel de Resultado (após responder) ──────────────────────────── */}
      {submitted && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Banner resultado */}
          <div style={{
            borderRadius: 16, padding: '1.5rem',
            background: isCorrect
              ? 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05))'
              : 'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(239,68,68,0.05))',
            border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
            display: 'flex', alignItems: 'center', gap: '1rem',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
              background: isCorrect ? '#30D158' : '#FF453A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isCorrect
                ? <CheckCircle size={28} color="#fff" />
                : <XCircle size={28} color="#fff" />}
            </div>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem',
                color: isCorrect ? '#6EE7B7' : '#FCA5A5' }}>
                {isCorrect ? '✅ Resposta Correta!' : '❌ Resposta Incorreta'}
              </div>
              {!isCorrect && (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 2 }}>
                  A alternativa correta era <strong style={{ color: '#6EE7B7' }}>{q.correctOption}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Cards de estatísticas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {/* % Acerto global */}
            <div className="apple-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <BarChart3 size={16} color="var(--text-secondary)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ACERTO GERAL</span>
              </div>
              {q.stats?.correctRate !== null && q.stats?.correctRate !== undefined ? (
                <>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.75rem',
                    color: q.stats.correctRate >= 60 ? '#6EE7B7' : q.stats.correctRate >= 40 ? '#FCD34D' : '#FCA5A5' }}>
                    {q.stats.correctRate}%
                  </div>
                  <div style={{ marginTop: '0.5rem', height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${q.stats.correctRate}%`, borderRadius: 4,
                      background: q.stats.correctRate >= 60 ? 'var(--accent-green)' : q.stats.correctRate >= 40 ? 'var(--accent-gold)' : 'var(--accent-red)',
                      transition: 'width 1s ease' }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    {q.stats.correctAnswers} de {q.stats.totalAnswers} respondentes
                  </div>
                </>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Seja o primeiro!</div>
              )}
            </div>

            {/* Dificuldade */}
            <div className="apple-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Target size={16} color="var(--text-secondary)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DIFICULDADE</span>
              </div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.4rem',
                color: q.difficulty === 'FACIL' ? '#6EE7B7' : q.difficulty === 'MEDIO' ? '#FCD34D' : '#FCA5A5' }}>
                {diffLabel[q.difficulty]}
              </div>
              <div style={{ marginTop: '0.5rem', height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 4,
                  width: q.difficulty === 'FACIL' ? '33%' : q.difficulty === 'MEDIO' ? '66%' : '100%',
                  background: diffBarColor[q.difficulty], transition: 'width 0.8s ease' }} />
              </div>
            </div>

            {/* Sua performance */}
            <div className="apple-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <TrendingUp size={16} color="var(--text-secondary)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SEU RESULTADO</span>
              </div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.4rem',
                color: isCorrect ? '#6EE7B7' : '#FCA5A5' }}>
                {isCorrect ? 'Acertou!' : 'Errou'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                {isCorrect
                  ? 'Continue assim! 🏆'
                  : `Resposta: ${selected} → Gabarito: ${q.correctOption}`}
              </div>
            </div>
          </div>

          {/* Linha de Raciocínio */}
          {q.reasoningLine && q.reasoningLine.length > 0 && (
            <div className="glass" style={{ borderRadius: 16, padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(20,184,166,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={17} color="var(--accent-teal)" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Linha de Raciocínio
                </h3>
              </div>
              <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {q.reasoningLine.map((step, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                    <span style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(20,184,166,0.2)', border: '1px solid rgba(20,184,166,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-teal)',
                      marginTop: 1,
                    }}>{i + 1}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, paddingTop: 2 }}>
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Gabarito Comentado */}
          {q.explanation && (
            <div className="glass" style={{ borderRadius: 16, overflow: 'hidden' }}>
              <button id="toggle-explanation-btn"
                onClick={() => setShowExpl(p => !p)}
                style={{
                  width: '100%', padding: '1.125rem 1.5rem',
                  background: 'rgba(16,185,129,0.08)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  color: '#6EE7B7', fontWeight: 700, fontFamily: 'Outfit', fontSize: '1rem',
                }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <CheckCircle size={18} />
                  Gabarito Comentado
                </span>
                {showExpl ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {showExpl && (
                <div style={{ padding: '1.5rem' }}
                  className="explanation-content animate-fade-in"
                  dangerouslySetInnerHTML={{ __html: q.explanation }} />
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Anotações ────────────────────────────────────────────────────── */}
      {showNote && (
        <div className="glass animate-fade-in" style={{ borderRadius: 14, padding: '1.25rem', marginTop: '1rem' }}>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={16} color="var(--accent-blue)" /> Anotações
          </h3>
          <textarea id="note-textarea" className="input" rows={4}
            placeholder="Suas anotações sobre esta questão..."
            value={noteText} onChange={e => setNoteText(e.target.value)}
            style={{ resize: 'vertical' }} />
          <button id="save-note-btn" className="btn btn-secondary"
            onClick={() => noteMutation.mutate()} disabled={noteMutation.isPending}
            style={{ marginTop: '0.75rem' }}>
            {noteMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Salvar anotação'}
          </button>
        </div>
      )}

      {/* ── Ações ────────────────────────────────────────────────────────── */}
      {submitted && (
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/questoes')}>
            <ArrowLeft size={16} /> Voltar ao banco
          </button>
          <button id="flag-btn" className="btn btn-ghost" style={{ color: 'var(--text-muted)' }}>
            <Flag size={16} /> Sinalizar
          </button>
          <button className="apple-btn" onClick={handleNextQuestion}>
            Próxima questão
          </button>
        </div>
      )}
    </div>
  )
}
