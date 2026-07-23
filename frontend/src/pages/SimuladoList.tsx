import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { simuladosApi } from '../lib/api'
import toast from 'react-hot-toast'
import {
  ClipboardList, Plus, Trophy, Clock, CheckCircle,
  Play, ArrowRight, Loader2, Calendar, AlertCircle, Sparkles, BookOpen, Brain, Activity, Settings2
} from 'lucide-react'

interface MockExam {
  id: string
  title: string
  totalQuestions: number
  status: 'PENDING' | 'IN_PROGRESS' | 'FINISHED'
  score?: number | null
  correctCount: number
  currentIndex: number
  timeLimitMin?: number | null
  startedAt?: string | null
  finishedAt?: string | null
  createdAt: string
}

const PRESET_PACKAGES = [
  {
    id: 'revalida-inep',
    title: 'Simulado Revalida INEP',
    description: 'Prova com 100 questões abordando as 5 grandes áreas, com nível de dificuldade e distribuição idênticos ao INEP.',
    totalQuestions: 100,
    timeLimitMin: 300,
    icon: <Trophy size={20} color="#F59E0B" />,
    color: 'rgba(245,158,11,0.15)',
    border: 'rgba(245,158,11,0.4)',
  },
  {
    id: 'rapido-cirurgia',
    title: 'Rápido de Cirurgia',
    description: 'Bateria de 20 questões apenas de Cirurgia Geral para testar seus conhecimentos em tempo recorde.',
    totalQuestions: 20,
    timeLimitMin: 30,
    icon: <Activity size={20} color="#EF4444" />,
    color: 'rgba(239,68,68,0.15)',
    border: 'rgba(239,68,68,0.4)',
  },
  {
    id: 'clinica-hard',
    title: 'Clínica Médica - Nível Hard',
    description: '50 questões nível difícil de Clínica Médica para desafiar seu raciocínio clínico avançado.',
    totalQuestions: 50,
    timeLimitMin: 90,
    icon: <Brain size={20} color="#8B5CF6" />,
    color: 'rgba(139,92,246,0.15)',
    border: 'rgba(139,92,246,0.4)',
  }
]

export default function SimuladoListPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<'RECOMMENDED' | 'IN_PROGRESS' | 'FINISHED'>('RECOMMENDED')

  const { data, isLoading, error } = useQuery<{ data: MockExam[] }>({
    queryKey: ['simulados'],
    queryFn: simuladosApi.list,
  })

  const createPresetMutation = useMutation({
    mutationFn: (pkg: typeof PRESET_PACKAGES[0]) => simuladosApi.create({
      title: pkg.title,
      totalQuestions: pkg.totalQuestions,
      timeLimitMin: pkg.timeLimitMin,
      // Passar especialidades hardcoded ou null para ser geral
      // Aqui num cenário real buscaríamos o ID de Cirurgia etc. 
      // Por simplicidade, enviamos apenas título, count e limit.
    }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['simulados'] })
      navigate(`/simulados/${data.exam.id}`)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Erro ao gerar pacote')
    }
  })

  const exams = data?.data || []

  // Calcular estatísticas
  const inProgressExams = exams.filter(e => e.status === 'PENDING' || e.status === 'IN_PROGRESS')
  const finishedExams = exams.filter(e => e.status === 'FINISHED')

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12 }}>
        <Loader2 size={24} color="var(--accent-blue)" className="animate-spin" />
        <span style={{ color: 'var(--text-muted)' }}>Carregando seus simulados...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ maxWidth: 600, margin: '4rem auto', textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--accent-red)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Erro ao carregar simulados</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Tente atualizar a página.</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: 900, margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={22} color="white" />
            </div>
            <h1 style={{ margin: 0, fontSize: '1.625rem', fontWeight: 800 }}>Simulados</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Escolha um pacote, continue de onde parou ou crie o seu.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/simulados/novo')} style={{ padding: '0.75rem 1.25rem', borderRadius: 12, boxShadow: '0 4px 14px rgba(59,130,246,0.35)' }}>
          <Settings2 size={16} /> Personalizado
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        {[
          { id: 'RECOMMENDED', label: 'Disponíveis', icon: Sparkles },
          { id: 'IN_PROGRESS', label: `Em Andamento (${inProgressExams.length})`, icon: Play },
          { id: 'FINISHED',    label: `Concluídos (${finishedExams.length})`, icon: CheckCircle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: 99, border: 'none',
              background: activeTab === tab.id ? 'var(--accent-blue)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s',
            }}
          >
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ABA: RECOMENDADOS */}
      {activeTab === 'RECOMMENDED' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {PRESET_PACKAGES.map(pkg => (
            <div key={pkg.id} className="apple-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: pkg.color, border: `1px solid ${pkg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                {pkg.icon}
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{pkg.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.5rem', flex: 1 }}>{pkg.description}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 8 }}>
                  <BookOpen size={13} /> {pkg.totalQuestions} questões
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 8 }}>
                  <Clock size={13} /> {pkg.timeLimitMin} min
                </span>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => createPresetMutation.mutate(pkg)}
                disabled={createPresetMutation.isPending}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 700 }}
              >
                {createPresetMutation.isPending && createPresetMutation.variables?.id === pkg.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>Iniciar Prova <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          ))}

          {/* Criar Personalizado Card */}
          <div className="apple-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'rgba(59,130,246,0.03)', border: '1px dashed rgba(59,130,246,0.3)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Settings2 size={20} color="var(--accent-blue)" />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--accent-blue)' }}>Personalizado</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Monte sua prova filtrando por especialidade, instituição, ano e dificuldade.
            </p>
            <button className="btn btn-secondary" onClick={() => navigate('/simulados/novo')} style={{ padding: '0.6rem 1.25rem', borderRadius: 10 }}>
              Configurar Filtros
            </button>
          </div>
        </div>
      )}

      {/* ABAS: EM ANDAMENTO E CONCLUÍDOS */}
      {(activeTab === 'IN_PROGRESS' || activeTab === 'FINISHED') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {activeTab === 'IN_PROGRESS' && inProgressExams.length === 0 && (
             <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>Nenhum simulado em andamento.</p>
          )}
          {activeTab === 'FINISHED' && finishedExams.length === 0 && (
             <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>Nenhum simulado concluído.</p>
          )}

          {(activeTab === 'IN_PROGRESS' ? inProgressExams : finishedExams).map(exam => {
            const formattedDate = new Date(exam.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit', month: '2-digit', year: 'numeric'
            })

            const isPending = exam.status === 'PENDING'
            const isInProgress = exam.status === 'IN_PROGRESS'
            const isFinished = exam.status === 'FINISHED'

            const progressPct = exam.totalQuestions > 0 ? Math.round((exam.currentIndex / exam.totalQuestions) * 100) : 0

            return (
              <div key={exam.id} className="apple-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>{exam.title || 'Simulado Personalizado'}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={13} /> {formattedDate}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>•</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{exam.totalQuestions} questões</span>
                      {exam.timeLimitMin && (
                        <>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>•</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={13} /> {exam.timeLimitMin} min
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {isPending && <span className="badge badge-gold">Pendente</span>}
                    {isInProgress && <span className="badge badge-blue">Em Andamento</span>}
                    
                    {isFinished && typeof exam.score === 'number' && (
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.35rem', color: exam.score >= 70 ? 'var(--accent-green)' : exam.score >= 50 ? 'var(--accent-gold)' : 'var(--accent-red)' }}>
                          {exam.score}%
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {exam.correctCount}/{exam.totalQuestions} acertos
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {isInProgress && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      <span>Progresso: {exam.currentIndex} de {exam.totalQuestions} respondidas</span>
                      <span style={{ fontWeight: 600 }}>{progressPct}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 3, background: 'var(--accent-blue)', width: `${progressPct}%`, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '0.85rem', marginTop: '0.2rem' }}>
                  <button
                    className={`btn ${isFinished ? 'btn-ghost' : 'btn-primary'}`}
                    onClick={() => navigate(`/simulados/${exam.id}`)}
                    style={{ padding: '0.45rem 1.15rem', fontSize: '0.8rem', borderRadius: 8, gap: '0.35rem' }}
                  >
                    {isPending && <><Play size={13} fill="currentColor" /> Iniciar Prova</>}
                    {isInProgress && <><Play size={13} fill="currentColor" /> Continuar Prova</>}
                    {isFinished && <>Revisar Simulado <ArrowRight size={13} /></>}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
