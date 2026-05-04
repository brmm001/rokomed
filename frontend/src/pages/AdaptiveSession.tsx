import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { adaptiveApi, questionsApi } from '../lib/api'
import {
  Brain, Zap, ChevronRight, CheckCircle, XCircle,
  ArrowRight, Target, TrendingUp, Clock, BarChart3,
  BookOpen, Gauge
} from 'lucide-react'

interface ThetaState {
  value: number; se: number; label: string; percentile: number
}

export default function AdaptiveSessionPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const specId = searchParams.get('specialty') || undefined

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [question, setQuestion] = useState<any>(null)
  const [sessionItemId, setSessionItemId] = useState<string | null>(null)
  const [theta, setTheta] = useState<ThetaState>({ value: 0, se: 1, label: 'Iniciante', percentile: 50 })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [totalItems, setTotalItems] = useState(20)
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctOption: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [starting, setStarting] = useState(true)
  const [finished, setFinished] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [nItems, setNItems] = useState(20)
  const [configMode, setConfigMode] = useState(true)
  const startTimeRef = useRef(Date.now())

  // Specialties for config
  const { data: filters } = useQuery({ queryKey: ['filters'], queryFn: questionsApi.filters })

  async function startSession() {
    setConfigMode(false)
    setStarting(true)
    try {
      const res = await adaptiveApi.start({ specialtyId: specId, nItems })
      setSessionId(res.session.id)
      setTotalItems(res.session.totalItems)
      setQuestion(res.currentItem.question)
      setSessionItemId(res.currentItem.sessionItemId)
      setTheta(res.theta)
      setCurrentIndex(0)
      startTimeRef.current = Date.now()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao iniciar sessão')
      setConfigMode(true)
    }
    setStarting(false)
  }

  async function submitAnswer() {
    if (!selectedOpt || !sessionId || feedback) return
    setLoading(true)
    const timeSpentSec = Math.round((Date.now() - startTimeRef.current) / 1000)

    try {
      const res = await adaptiveApi.answer(sessionId, { selectedOpt, timeSpentSec })
      setFeedback(res.answer)

      if (res.finished) {
        setResult(res.result)
        setTheta({ value: res.result.thetaEnd, se: res.result.seEnd, label: res.result.label, percentile: res.result.percentile })
        setTimeout(() => setFinished(true), 1500)
      } else {
        setTheta(res.theta)
        // After 1.5s delay, move to next question
        setTimeout(() => {
          setQuestion(res.currentItem.question)
          setSessionItemId(res.currentItem.sessionItemId)
          setCurrentIndex(res.currentIndex)
          setSelectedOpt(null)
          setFeedback(null)
          startTimeRef.current = Date.now()
        }, 1500)
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao enviar resposta')
    }
    setLoading(false)
  }

  // ── Config Screen ─────────────────────────────────────────────────────
  if (configMode) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Brain size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 800 }}>Trilha Adaptativa</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: '0.875rem' }}>
            O sistema seleciona questões ideais para seu nível usando IRT e maximização de informação de Fisher.
          </p>
        </div>

        <div className="glass" style={{ borderRadius: 16, padding: '1.5rem', marginBottom: '1rem' }}>
          <label style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block', marginBottom: 8 }}>Especialidade (opcional)</label>
          <select
            style={{ width: '100%', padding: '0.75rem', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
            defaultValue=""
            onChange={e => { if (e.target.value) { const sp = new URLSearchParams(searchParams); sp.set('specialty', e.target.value); navigate(`?${sp.toString()}`, { replace: true }) } }}
          >
            <option value="">Todas as especialidades</option>
            {filters?.specialties?.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="glass" style={{ borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <label style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block', marginBottom: 8 }}>Número de questões: {nItems}</label>
          <input type="range" min={5} max={50} step={5} value={nItems} onChange={e => setNItems(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#8B5CF6' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            <span>5</span><span>50</span>
          </div>
        </div>

        <button className="btn btn-primary" onClick={startSession}
          style={{ width: '100%', padding: '1rem', fontSize: '1rem', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}>
          <Zap size={18} /> Iniciar Trilha Adaptativa
        </button>

        <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: 12, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>🧠 Como funciona?</strong>
              <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1rem', lineHeight: 1.8 }}>
                <li>Cada questão é escolhida para maximizar a informação sobre seu nível</li>
                <li>Seu θ (habilidade) é atualizado em tempo real após cada resposta</li>
                <li>Questões fáceis demais ou impossíveis são eliminadas automaticamente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Finished Screen ───────────────────────────────────────────────────
  if (finished && result) {
    const thetaDelta = result.thetaEnd - result.thetaStart
    return (
      <div className="animate-fade-in" style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <Target size={40} color="white" />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Sessão Concluída!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{result.correct}/{result.total} corretas ({result.accuracy}%)</p>

        {/* Theta gauge */}
        <div className="glass" style={{ borderRadius: 16, padding: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8 }}>Habilidade (θ)</div>
          <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'Outfit', color: '#8B5CF6' }}>
            {result.thetaEnd.toFixed(2)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: 8 }}>
            <span style={{ fontSize: '0.8125rem', color: thetaDelta >= 0 ? 'var(--accent-green)' : '#EF4444' }}>
              {thetaDelta >= 0 ? '↑' : '↓'} {Math.abs(thetaDelta).toFixed(3)}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>±{result.seEnd.toFixed(2)}</span>
          </div>
          <div style={{ marginTop: 12, padding: '0.5rem 1rem', borderRadius: 8, background: 'rgba(139,92,246,0.12)', display: 'inline-block', fontSize: '0.875rem', fontWeight: 600, color: '#8B5CF6' }}>
            {result.label} — Top {result.percentile}%
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="glass" style={{ borderRadius: 12, padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-green)' }}>{result.accuracy}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Acerto</div>
          </div>
          <div className="glass" style={{ borderRadius: 12, padding: '1rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-blue)' }}>{result.percentile}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Percentil</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn" onClick={() => { setConfigMode(true); setFinished(false); setResult(null); setSessionId(null) }}
            style={{ flex: 1, padding: '0.875rem' }}>
            Nova Sessão
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/analytics')}
            style={{ flex: 1, padding: '0.875rem', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}>
            <BarChart3 size={16} /> Ver Análise
          </button>
        </div>
      </div>
    )
  }

  // ── Question Screen ───────────────────────────────────────────────────
  if (starting) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Brain size={48} color="#8B5CF6" style={{ animation: 'pulse 1.5s infinite' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Calculando questão ideal...</p>
        </div>
      </div>
    )
  }

  const options = question?.options || []

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Brain size={20} color="#8B5CF6" />
          <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Adaptativa</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{currentIndex + 1}/{totalItems}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.375rem 0.75rem', borderRadius: 8, background: 'rgba(139,92,246,0.12)', fontSize: '0.8125rem', fontWeight: 600, color: '#8B5CF6' }}>
            θ = {theta.value.toFixed(2)}
          </div>
          <div style={{ padding: '0.375rem 0.75rem', borderRadius: 8, background: 'rgba(20,184,166,0.12)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-teal)' }}>
            {theta.label}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-elevated)', marginBottom: '1.25rem', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #8B5CF6, #6366F1)',
          width: `${((currentIndex + 1) / totalItems) * 100}%`, transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Question */}
      <div className="glass" style={{ borderRadius: 16, padding: '1.5rem', marginBottom: '1rem' }}>
        {question?.specialty && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            {question.institution && <span style={{ padding: '0.25rem 0.625rem', borderRadius: 6, fontSize: '0.75rem', background: 'rgba(59,130,246,0.12)', color: 'var(--accent-blue)', fontWeight: 600 }}>{question.institution.acronym}</span>}
            <span style={{ padding: '0.25rem 0.625rem', borderRadius: 6, fontSize: '0.75rem', background: 'rgba(20,184,166,0.12)', color: 'var(--accent-teal)', fontWeight: 600 }}>{question.specialty.name}</span>
            {question.year && <span style={{ padding: '0.25rem 0.625rem', borderRadius: 6, fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>{question.year}</span>}
          </div>
        )}
        <div style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--text-primary)' }}
          dangerouslySetInnerHTML={{ __html: question?.statement || '' }} />
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {options.map((opt: any) => {
          const isSelected = selectedOpt === opt.letter
          const isCorrect = feedback?.correctOption === opt.letter
          const isWrong = feedback && isSelected && !feedback.isCorrect

          let bg = 'var(--bg-card)'
          let border = '1px solid var(--border)'
          if (feedback) {
            if (isCorrect) { bg = 'rgba(34,197,94,0.12)'; border = '1px solid rgba(34,197,94,0.4)' }
            else if (isWrong) { bg = 'rgba(239,68,68,0.12)'; border = '1px solid rgba(239,68,68,0.4)' }
          } else if (isSelected) { bg = 'rgba(139,92,246,0.12)'; border = '1px solid rgba(139,92,246,0.4)' }

          return (
            <button key={opt.letter} disabled={!!feedback}
              onClick={() => setSelectedOpt(opt.letter)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.875rem 1rem', borderRadius: 12, background: bg, border, cursor: feedback ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.2s', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              <span style={{ minWidth: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8125rem', background: isSelected ? 'rgba(139,92,246,0.25)' : 'var(--bg-elevated)', color: isSelected ? '#8B5CF6' : 'var(--text-muted)' }}>
                {feedback && isCorrect ? <CheckCircle size={16} color="#22C55E" /> : feedback && isWrong ? <XCircle size={16} color="#EF4444" /> : opt.letter}
              </span>
              <span style={{ lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: opt.text }} />
            </button>
          )
        })}
      </div>

      {/* Submit button */}
      {!feedback && (
        <button className="btn btn-primary" onClick={submitAnswer} disabled={!selectedOpt || loading}
          style={{ width: '100%', padding: '0.875rem', fontSize: '0.9375rem', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', opacity: !selectedOpt ? 0.5 : 1 }}>
          {loading ? 'Processando...' : 'Confirmar Resposta'} <ArrowRight size={16} />
        </button>
      )}
    </div>
  )
}
