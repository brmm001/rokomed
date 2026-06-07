import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { userApi } from '../lib/api'
import toast from 'react-hot-toast'
import {
  Calendar, BookOpen, Target, Award, Trash2, Plus, Clock,
  ArrowRight, Sparkles, ChevronDown, Check, TrendingUp, AlertTriangle
} from 'lucide-react'

const DAYS_OF_WEEK = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo'
] as const

type DayName = typeof DAYS_OF_WEEK[number]

export default function RoutinePage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  
  const [weeklyHours, setWeeklyHours] = useState<number>(15)
  const [showAddMenu, setShowAddMenu] = useState<{ day: DayName; open: boolean } | null>(null)

  // Queries
  const { data: routineData, isLoading: routineLoading, isError: routineError } = useQuery<any>({
    queryKey: ['user-routine'],
    queryFn: () => userApi.routine(),
    retry: 1,
  })

  useEffect(() => {
    if (routineData?.routineConfig?.weeklyHours) {
      setWeeklyHours(routineData.routineConfig.weeklyHours)
    }
  }, [routineData])

  const { data: proficiencyData, isLoading: proficiencyLoading, isError: proficiencyError } = useQuery<any>({
    queryKey: ['user-subjects-proficiency'],
    queryFn: () => userApi.subjectsProficiency(),
    retry: 1,
  })

  // Mutation
  const saveRoutineMutation = useMutation({
    mutationFn: (data: { weeklyHours: number; schedule: Record<string, string[]> }) =>
      userApi.saveRoutine(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-routine'] })
      toast.success('Cronograma atualizado!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Erro ao salvar cronograma')
    }
  })

  if (routineLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)', flexDirection: 'column', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid rgba(59,130,246,0.15)', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span>Carregando seu plano de estudos...</span>
      </div>
    )
  }

  if (routineError) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)', flexDirection: 'column', gap: '12px' }}>
        <AlertTriangle size={32} color="#EF4444" />
        <p style={{ color: '#F87171', fontWeight: 600 }}>Erro ao carregar dados da rotina.</p>
        <button onClick={() => window.location.reload()} className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>Tentar novamente</button>
      </div>
    )
  }

  const schedule: Record<string, string[]> = routineData?.routineConfig?.schedule || {
    'Segunda-feira': [],
    'Terça-feira': [],
    'Quarta-feira': [],
    'Quinta-feira': [],
    'Sexta-feira': [],
    'Sábado': [],
    'Domingo': []
  }

  const subjects = proficiencyData?.data || []

  // Helper to add topic to a day
  const handleAddTopic = (day: DayName, specialtyId: string) => {
    const currentDaySchedule = schedule[day] || []
    if (currentDaySchedule.includes(specialtyId)) {
      toast.error('Este assunto já está agendado para este dia!')
      return
    }
    const updatedSchedule = {
      ...schedule,
      [day]: [...currentDaySchedule, specialtyId]
    }
    saveRoutineMutation.mutate({
      weeklyHours,
      schedule: updatedSchedule
    })
    setShowAddMenu(null)
  }

  // Helper to remove topic from a day
  const handleRemoveTopic = (day: DayName, specialtyId: string) => {
    const updatedSchedule = {
      ...schedule,
      [day]: (schedule[day] || []).filter(id => id !== specialtyId)
    }
    saveRoutineMutation.mutate({
      weeklyHours,
      schedule: updatedSchedule
    })
  }

  // Update weekly hours goal
  const handleHoursChange = (newHours: number) => {
    setWeeklyHours(newHours)
    saveRoutineMutation.mutate({
      weeklyHours: newHours,
      schedule
    })
  }

  const getPriorityBadgeStyles = (priority: string) => {
    switch (priority) {
      case 'MAXIMA':
        return { bg: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', text: '#F87171', label: 'Prioridade Máxima 🔥' }
      case 'ALTA':
        return { bg: 'rgba(249, 115, 22, 0.15)', border: '1px solid rgba(249, 115, 22, 0.3)', text: '#FB923C', label: 'Prioridade Alta' }
      case 'MEDIA':
        return { bg: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', text: '#60A5FA', label: 'Prioridade Média' }
      case 'BAIXA':
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', border: '1px solid rgba(148, 163, 184, 0.3)', text: '#94A3B8', label: 'Prioridade Baixa' }
    }
  }

  const getProficiencyStyles = (level: string) => {
    switch (level) {
      case 'AVANÇADO':
        return { bg: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', text: '#34D399', label: 'Avançado' }
      case 'INTERMEDIÁRIO':
        return { bg: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', text: '#FBBF24', label: 'Intermediário' }
      case 'INICIANTE':
        return { bg: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', text: '#F87171', label: 'Iniciante' }
      case 'NÃO ESTUDADO':
      default:
        return { bg: 'rgba(148, 163, 184, 0.1)', border: '1px solid rgba(148, 163, 184, 0.2)', text: '#94A3B8', label: 'Não Estudado' }
    }
  }

  // Count total scheduled subjects to calculate load
  const totalScheduled = Object.values(schedule).reduce((acc, curr) => acc + curr.length, 0)
  const hoursPerSubject = totalScheduled > 0 ? (weeklyHours / totalScheduled).toFixed(1) : '0'

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1200, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── Top Countdown & Dashboard Banner ── */}
      <div className="glass" style={{
        padding: '2rem',
        borderRadius: '24px',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)',
        border: '1px solid rgba(99, 179, 237, 0.15)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow Effects */}
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%', width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none', zIndex: 0
        }} />

        <div style={{ flex: '1 1 500px', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <Sparkles size={16} />
            <span>CRONOGRAMA DE ESTUDOS ADAPTATIVO</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFF', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
            Ajusta com sua Rotina
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
            Chega de planilhas engessadas. O RokoMed entrega uma sequência de estudos adaptada ao seu desempenho, banca de preferência e tempo até a prova.
          </p>
        </div>

        {/* Exam Countdown Card */}
        {routineData?.daysLeft !== null && (
          <div className="glass" style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1.25rem 1.75rem',
            borderRadius: '16px',
            textAlign: 'center',
            minWidth: '180px',
            zIndex: 1
          }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Dias Até a Prova
            </span>
            <span style={{ display: 'block', fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-blue)', margin: '4px 0', textShadow: '0 0 10px rgba(59,130,246,0.3)' }}>
              {routineData.daysLeft}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Foco total no objetivo!
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Left Side: Weekly Grid Scheduler */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Header Controls */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Distribuição Semanal de Horas</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', margin: '4px 0 0' }}>
                Defina sua meta semanal para calcular o tempo diário por assunto.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Meta de Horas</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>{weeklyHours}h / semana</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={weeklyHours}
                onChange={(e) => handleHoursChange(Number(e.target.value))}
                style={{ width: '130px', accentColor: 'var(--accent-blue)', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Agenda Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {DAYS_OF_WEEK.map((day) => {
              const daySpecialtiesIds = schedule[day] || []
              
              return (
                <div key={day} className="glass" style={{
                  padding: '1.25rem',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  minHeight: '80px',
                  position: 'relative'
                }}>
                  {/* Day Name Indicator */}
                  <div style={{ width: '120px', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FFF' }}>{day}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {daySpecialtiesIds.length === 0
                        ? 'Nenhum assunto'
                        : `${daySpecialtiesIds.length} ${daySpecialtiesIds.length === 1 ? 'assunto' : 'assuntos'}`
                      }
                    </div>
                  </div>

                  {/* Scheduled Items Container */}
                  <div style={{ flex: 1, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {daySpecialtiesIds.map((specId) => {
                      const spec = subjects.find((s: any) => s.id === specId)
                      if (!spec) return null
                      const priorityStyle = getPriorityBadgeStyles(spec.priority)

                      return (
                        <div key={specId} style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '10px',
                          padding: '6px 10px 6px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.825rem',
                          color: '#E2E8F0',
                          animation: 'fade-in 0.2s ease-in-out'
                        }}>
                          <span style={{ fontWeight: 600 }}>{spec.name}</span>
                          <span style={{
                            fontSize: '0.65rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: priorityStyle.bg,
                            color: priorityStyle.text,
                            border: priorityStyle.border
                          }}>
                            {spec.priority === 'MAXIMA' ? '🔥' : ''} {spec.priority}
                          </span>
                          
                          {/* Hour portion indicator */}
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            ~{hoursPerSubject}h
                          </span>

                          <button
                            onClick={() => handleRemoveTopic(day, specId)}
                            style={{
                              border: 'none', background: 'transparent', color: 'var(--text-muted)',
                              cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center',
                              borderRadius: '4px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#F87171'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )
                    })}

                    {daySpecialtiesIds.length === 0 && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontStyle: 'italic' }}>
                        Clique no "+" ao lado para adicionar metas de estudo
                      </span>
                    )}
                  </div>

                  {/* Add Button dropdown for day */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <button
                      onClick={() => setShowAddMenu(prev => prev?.day === day ? null : { day, open: true })}
                      className="btn btn-ghost"
                      style={{
                        width: '32px', height: '32px', borderRadius: '50%', padding: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <Plus size={16} />
                    </button>

                    {showAddMenu?.day === day && (
                      <div className="glass shadow-2xl" style={{
                        position: 'absolute',
                        right: 0,
                        top: '40px',
                        zIndex: 100,
                        background: '#0B1528',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        width: '260px',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        padding: '6px'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '6px 12px', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          Adicionar Grande Área
                        </div>
                        {subjects.map((sub: any) => {
                          const isAlreadyAdded = daySpecialtiesIds.includes(sub.id)
                          return (
                            <button
                              key={sub.id}
                              disabled={isAlreadyAdded}
                              onClick={() => handleAddTopic(day, sub.id)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: 'none',
                                background: 'transparent',
                                color: isAlreadyAdded ? 'var(--text-muted)' : '#E2E8F0',
                                textAlign: 'left',
                                fontSize: '0.825rem',
                                cursor: isAlreadyAdded ? 'not-allowed' : 'pointer',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                              className={isAlreadyAdded ? '' : 'hover:bg-white/5'}
                            >
                              <span>{sub.name}</span>
                              {isAlreadyAdded && <Check size={12} color="var(--accent-green)" />}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )
            })}
          </div>

        </div>

        {/* Right Side Column: Subjects priorities & Caderno de Erros */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Caderno de Erros CTA */}
          <div className="glass" style={{
            padding: '1.5rem',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(15, 23, 42, 0.5) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <AlertTriangle size={16} />
              <span>Caderno de Erros</span>
            </div>

            <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#FFF', margin: '4px 0 8px' }}>
              {routineData?.wrongCount ?? 0}
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Questões que você errou anteriormente. Estudar suas falhas é o caminho mais rápido para a aprovação.
            </p>

            <button
              onClick={() => navigate('/questoes?wrongOnly=true')}
              className="btn btn-primary"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
                borderColor: '#DC2626',
                color: '#FFF',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
              }}
            >
              <span>Praticar Erros</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Painel de Assuntos Priorities */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={18} color="var(--accent-blue)" /> Painel de Assuntos
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '1.25rem' }}>
              Calibração de prioridade da banca com sua proficiência atual.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {proficiencyLoading ? (
                // Skeleton enquanto carrega
                <>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{
                      padding: '1rem', borderRadius: '14px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}>
                      <div style={{ height: '14px', width: '60%', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', marginBottom: '10px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                      <div style={{ height: '10px', width: '40%', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.9} }`}</style>
                    </div>
                  ))}
                </>
              ) : proficiencyError ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '1rem' }}>
                  <AlertTriangle size={18} color="#EF4444" style={{ marginBottom: '6px' }} />
                  <p>Erro ao carregar assuntos.</p>
                </div>
              ) : subjects.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '1rem' }}>
                  Nenhum assunto encontrado.
                </div>
              ) : (
                subjects.map((sub: any) => {
                  const priorityStyle = getPriorityBadgeStyles(sub.priority)
                  const levelStyle = getProficiencyStyles(sub.level)

                  return (
                    <div key={sub.id} style={{
                      padding: '1rem',
                      borderRadius: '14px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#FFF' }}>{sub.name}</span>
                        <span style={{
                          fontSize: '0.65rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: priorityStyle.bg,
                          color: priorityStyle.text,
                          border: priorityStyle.border,
                          fontWeight: 600,
                          whiteSpace: 'nowrap'
                        }}>
                          {sub.priority}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span>Nível:</span>
                          <span style={{ color: levelStyle.text, fontWeight: 700, fontSize: '0.75rem' }}>
                            {levelStyle.label}
                          </span>
                        </div>
                        <span>
                          {sub.accuracy !== null ? `${sub.accuracy}% de acerto` : 'Sem respostas'}
                        </span>
                      </div>

                      <div style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddTopic(e.target.value as DayName, sub.id)
                              e.target.value = ''
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="">+ Agendar na semana...</option>
                          {DAYS_OF_WEEK.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
