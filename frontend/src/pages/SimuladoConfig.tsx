import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { simuladosApi, questionsApi } from '../lib/api'
import SpecialtyPicker from '../components/SpecialtyPicker'
import toast from 'react-hot-toast'
import {
  ClipboardList, Settings2, Users2, BookOpen, Loader2,
  ChevronRight, Target, Hash, Clock, Check, X,
  AlertTriangle, Info, RefreshCw,
} from 'lucide-react'

const DIFFICULTIES = [
  { value: 'FACIL',   label: 'Fácil',   color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
  { value: 'MEDIO',   label: 'Médio',   color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
  { value: 'DIFICIL', label: 'Difícil', color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)' },
]
const QUESTION_COUNTS = [10, 20, 30, 40, 60, 80, 100]
const TIME_LIMITS = [
  { value: null, label: 'Sem limite' },
  { value: 30,   label: '30 min' },
  { value: 60,   label: '1 hora' },
  { value: 90,   label: '1h30' },
  { value: 120,  label: '2 horas' },
  { value: 180,  label: '3 horas' },
]

export default function SimuladoConfigPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [totalQuestions, setTotalQuestions] = useState(40)
  const [customCount, setCustomCount]       = useState('')
  const [difficulties, setDifficulties]     = useState<string[]>(['FACIL', 'MEDIO', 'DIFICIL'])
  const [institutionIds, setInstitutionIds] = useState<string[]>([])
  const [specialtyIds, setSpecialtyIds]     = useState<string[]>([])
  const [timeLimitMin, setTimeLimitMin]     = useState<number | null>(null)
  const [title, setTitle]                   = useState('')

  // Estado do alerta de questões insuficientes
  const [availableCount, setAvailableCount] = useState<number | null>(null)
  const [availableError, setAvailableError] = useState<string | null>(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  const { data: filtersData } = useQuery({
    queryKey:  ['question-filters'],
    queryFn:   questionsApi.filters,
    staleTime: Infinity,
  })

  const effectiveCount = customCount ? (parseInt(customCount) || 0) : totalQuestions

  // Preview de disponibilidade (chama sempre que filtros mudam)
  const checkAvailability = useCallback(async () => {
    if (difficulties.length === 0) return
    setCheckingAvailability(true)
    setAvailableError(null)
    try {
      const result = await simuladosApi.preview({
        totalQuestions: effectiveCount,
        difficulties: difficulties.length < 3 ? difficulties as ('FACIL'|'MEDIO'|'DIFICIL')[] : undefined,
        institutionIds: institutionIds.length ? institutionIds : undefined,
        specialtyIds:   specialtyIds.length   ? specialtyIds   : undefined,
      })
      setAvailableCount(result.available)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string; available?: number } } })?.response?.data
      if (msg?.available !== undefined) setAvailableCount(msg.available)
      setAvailableError(msg?.error ?? 'Erro ao verificar disponibilidade')
    } finally {
      setCheckingAvailability(false)
    }
  }, [difficulties, institutionIds, specialtyIds, effectiveCount])

  useEffect(() => {
    const timer = setTimeout(checkAvailability, 400)
    return () => clearTimeout(timer)
  }, [checkAvailability])

  const createMutation = useMutation({
    mutationFn: (count: number) => simuladosApi.create({
      title: title || undefined,
      totalQuestions: count,
      timeLimitMin,
      difficulties: difficulties.length < 3 ? difficulties as ('FACIL'|'MEDIO'|'DIFICIL')[] : undefined,
      institutionIds: institutionIds.length ? institutionIds : undefined,
      specialtyIds:   specialtyIds.length   ? specialtyIds   : undefined,
    }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['simulados'] })
      toast.success('Simulado criado!')
      navigate(`/simulados/${data.exam.id}`)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string; available?: number } } })?.response?.data
      if (msg?.available !== undefined) {
        setAvailableCount(msg.available)
        setAvailableError(msg.error ?? 'Questões insuficientes')
      } else {
        toast.error(msg?.error || 'Erro ao criar simulado')
      }
    },
  })

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  const notEnough  = availableCount !== null && availableCount < effectiveCount
  const canCreate  = !notEnough && difficulties.length > 0 && effectiveCount >= 1 && availableCount !== null && availableCount > 0
  const canCreatePartial = notEnough && availableCount !== null && availableCount >= 1

  return (
    <div className="animate-fade-in" style={{ maxWidth: 760, margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.5rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={22} color="white" />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.625rem', fontWeight: 800 }}>Simulado Personalizado</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Configure seu simulado e monte uma prova sob medida.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Nome */}
        <div className="glass" style={{ borderRadius: 16, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
            <Settings2 size={17} color="var(--accent-blue)" />
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>Nome do Simulado</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(opcional)</span>
          </div>
          <input id="simulado-title" className="input" type="text"
            placeholder="Ex: Revisão UNICAMP 2024"
            value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        {/* Número de questões */}
        <div className="glass" style={{ borderRadius: 16, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
            <Hash size={17} color="var(--accent-blue)" />
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>Número de Questões</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {QUESTION_COUNTS.map(n => (
              <button key={n} id={`count-${n}`} onClick={() => { setTotalQuestions(n); setCustomCount('') }}
                style={{
                  padding: '0.5rem 1.125rem', borderRadius: 10, border: '1px solid', fontWeight: 700,
                  fontSize: '0.9375rem', cursor: 'pointer', transition: 'all 0.15s',
                  background: totalQuestions === n && !customCount ? 'rgba(59,130,246,0.15)' : 'transparent',
                  borderColor: totalQuestions === n && !customCount ? 'var(--accent-blue)' : 'var(--border)',
                  color: totalQuestions === n && !customCount ? 'var(--accent-blue)' : 'var(--text-secondary)',
                }}>
                {n}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>Ou digite:</span>
            <input id="custom-count" className="input" type="number" min={1} max={120}
              placeholder="1–120" value={customCount}
              onChange={e => setCustomCount(e.target.value)} style={{ width: 100 }} />
          </div>

          {/* ── Alerta de disponibilidade ── */}
          {checkingAvailability ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <RefreshCw size={14} className="animate-spin" /> Verificando disponibilidade...
            </div>
          ) : availableCount !== null ? (
            notEnough ? (
              <div style={{ padding: '0.875rem 1rem', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                  <AlertTriangle size={17} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <span style={{ fontWeight: 700, color: '#FCA5A5', fontSize: '0.9rem' }}>
                      Questões insuficientes com os filtros selecionados
                    </span>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
                      {availableError || `Apenas ${availableCount} questão(ões) disponíve${availableCount === 1 ? 'l' : 'is'}. Você pediu ${effectiveCount}.`}
                    </p>
                  </div>
                </div>
                {canCreatePartial && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" onClick={() => createMutation.mutate(availableCount)}
                      disabled={createMutation.isPending} style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}>
                      {createMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : `Criar com ${availableCount} questão(ões)`}
                    </button>
                    <button className="btn btn-ghost" onClick={() => { setTotalQuestions(Math.min(availableCount, 20)); setCustomCount('') }}
                      style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}>
                      Ajustar número
                    </button>
                  </div>
                )}
                {!canCreatePartial && availableCount < 1 && (
                  <p style={{ color: '#EF4444', fontSize: '0.8125rem', margin: 0 }}>
                    Há menos de 1 questão disponível. Amplie os filtros (especialidade, instituição ou dificuldade) para criar um simulado.
                  </p>
                )}
              </div>
            ) : (
              <div style={{ padding: '0.625rem 0.875rem', borderRadius: 10, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.25)', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info size={14} color="#10B981" />
                <span>
                  <strong style={{ color: '#6EE7B7' }}>{availableCount} questões</strong> disponíveis •
                  Serão sorteadas <strong style={{ color: 'var(--accent-blue)' }}>{effectiveCount}</strong> aleatoriamente
                </span>
              </div>
            )
          ) : null}
        </div>

        {/* Dificuldade */}
        <div className="glass" style={{ borderRadius: 16, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
            <Target size={17} color="var(--accent-gold)" />
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>Dificuldade</h3>
            {difficulties.length === 0 && (
              <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600 }}>Selecione pelo menos uma</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {DIFFICULTIES.map(d => {
              const active = difficulties.includes(d.value)
              return (
                <button key={d.value} id={`diff-${d.value}`}
                  onClick={() => toggle(difficulties, setDifficulties, d.value)}
                  style={{ flex: 1, padding: '1rem', borderRadius: 12, border: `1px solid ${active ? d.border : 'var(--border)'}`,
                    cursor: 'pointer', transition: 'all 0.15s', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '0.5rem', background: active ? d.bg : 'transparent' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: active ? d.color : 'rgba(255,255,255,0.06)' }}>
                    {active && <Check size={14} color="white" strokeWidth={3} />}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: active ? d.color : 'var(--text-muted)' }}>{d.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tempo limite */}
        <div className="glass" style={{ borderRadius: 16, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
            <Clock size={17} color="var(--accent-teal)" />
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>Tempo Limite</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {TIME_LIMITS.map(t => (
              <button key={String(t.value)} id={`time-${t.value}`} onClick={() => setTimeLimitMin(t.value)}
                style={{ padding: '0.5rem 1rem', borderRadius: 10, border: '1px solid', fontWeight: 600,
                  fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s',
                  background: timeLimitMin === t.value ? 'rgba(20,184,166,0.1)' : 'transparent',
                  borderColor: timeLimitMin === t.value ? 'rgba(20,184,166,0.5)' : 'var(--border)',
                  color: timeLimitMin === t.value ? 'var(--accent-teal)' : 'var(--text-secondary)' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Especialidade — seletor hierárquico (Grande Área → Tema → Subtema) */}
        <SpecialtyPicker selectedIds={specialtyIds} onChange={setSpecialtyIds} />

        {/* Instituição */}
        <div className="glass" style={{ borderRadius: 16, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Users2 size={17} color="var(--accent-blue)" />
              <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>Instituição</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {institutionIds.length === 0 ? '(Todas)' : `${institutionIds.length} selecionada(s)`}
              </span>
            </div>
            {institutionIds.length > 0 && (
              <button onClick={() => setInstitutionIds([])} className="btn btn-ghost"
                style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}>
                <X size={12} /> Limpar
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {filtersData?.institutions?.map((inst: { id: string; acronym: string; name: string }) => {
              const active = institutionIds.includes(inst.id)
              return (
                <button key={inst.id} id={`inst-${inst.acronym}`}
                  onClick={() => toggle(institutionIds, setInstitutionIds, inst.id)}
                  title={inst.name}
                  style={{ padding: '0.375rem 0.875rem', borderRadius: 8, border: `1px solid ${active ? 'var(--accent-blue)' : 'var(--border)'}`,
                    fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', transition: 'all 0.15s',
                    background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
                    color: active ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
                  {inst.acronym}
                </button>
              )
            })}
          </div>
        </div>

        {/* Botão criar */}
        <button id="create-simulado-btn" className="btn btn-primary"
          onClick={() => createMutation.mutate(effectiveCount)}
          disabled={createMutation.isPending || !canCreate || difficulties.length === 0}
          style={{ padding: '1rem', fontSize: '1rem', fontWeight: 700, borderRadius: 14,
            opacity: !canCreate || difficulties.length === 0 ? 0.5 : 1 }}>
          {createMutation.isPending
            ? <><Loader2 size={18} className="animate-spin" /> Montando simulado...</>
            : <><ClipboardList size={18} /> Montar Simulado — {effectiveCount} Questões <ChevronRight size={18} /></>}
        </button>

        {difficulties.length === 0 && (
          <p style={{ textAlign: 'center', color: '#EF4444', fontSize: '0.875rem', margin: '-0.5rem 0 0' }}>
            Selecione pelo menos uma dificuldade.
          </p>
        )}
      </div>
    </div>
  )
}
