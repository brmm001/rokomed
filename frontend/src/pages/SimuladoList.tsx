import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { simuladosApi } from '../lib/api'
import {
  ClipboardList, Plus, Trophy, Clock, CheckCircle,
  Play, ArrowRight, Loader2, Calendar, AlertCircle
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

export default function SimuladoListPage() {
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery<{ data: MockExam[] }>({
    queryKey: ['simulados'],
    queryFn: simuladosApi.list,
  })

  const exams = data?.data || []

  // Calcular estatísticas rápidas
  const totalExams = exams.length
  const finishedExams = exams.filter(e => e.status === 'FINISHED')
  const averageScore = finishedExams.length > 0
    ? Math.round(finishedExams.reduce((acc, curr) => acc + (curr.score || 0), 0) / finishedExams.length)
    : 0

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={22} color="white" />
            </div>
            <h1 style={{ margin: 0, fontSize: '1.625rem', fontWeight: 800 }}>Meus Simulados</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Visualize seu histórico, continue provas pendentes ou crie um novo simulado.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/simulados/novo')} style={{ padding: '0.75rem 1.25rem', borderRadius: 12 }}>
          <Plus size={16} /> Novo Simulado
        </button>
      </div>

      {totalExams > 0 && (
        <>
          {/* Stats Summary Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            
            <div className="apple-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ClipboardList size={20} color="var(--accent-blue)" />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>{totalExams}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulados Criados</div>
              </div>
            </div>

            <div className="apple-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle size={20} color="var(--accent-green)" />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>{finishedExams.length}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Concluídos</div>
              </div>
            </div>

            <div className="apple-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trophy size={20} color="var(--accent-gold)" />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', color: finishedExams.length > 0 ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                  {finishedExams.length > 0 ? `${averageScore}%` : '-'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aproveitamento Médio</div>
              </div>
            </div>

          </div>

          {/* List Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {exams.map(exam => {
              const formattedDate = new Date(exam.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })

              const isPending = exam.status === 'PENDING'
              const isInProgress = exam.status === 'IN_PROGRESS'
              const isFinished = exam.status === 'FINISHED'

              // Progresso das respostas
              const progressPct = exam.totalQuestions > 0
                ? Math.round((exam.currentIndex / exam.totalQuestions) * 100)
                : 0

              return (
                <div key={exam.id} className="apple-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>{exam.title}</h3>
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

                    {/* Status Badge & Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {isPending && <span className="badge badge-gold">Pendente</span>}
                      {isInProgress && <span className="badge badge-blue">Em Andamento</span>}
                      {isFinished && <span className="badge badge-green">Finalizado</span>}

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

                  {/* Progress bar for IN_PROGRESS */}
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

                  {/* Action Button Row */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '0.85rem', marginTop: '0.2rem' }}>
                    <button
                      className={`btn ${isFinished ? 'btn-ghost' : 'btn-primary'}`}
                      onClick={() => navigate(`/simulados/${exam.id}`)}
                      style={{ padding: '0.45rem 1.15rem', fontSize: '0.8rem', borderRadius: 8, gap: '0.35rem' }}
                    >
                      {isPending && (
                        <>
                          <Play size={13} fill="currentColor" /> Iniciar Prova
                        </>
                      )}
                      {isInProgress && (
                        <>
                          <Play size={13} fill="currentColor" /> Continuar Prova
                        </>
                      )}
                      {isFinished && (
                        <>
                          Revisar Simulado <ArrowRight size={13} />
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Empty State */}
      {totalExams === 0 && (
        <div className="glass" style={{ borderRadius: 16, padding: '3.5rem 2rem', textAlign: 'center', marginTop: '1rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <ClipboardList size={30} color="var(--accent-blue)" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Nenhum simulado criado</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 440, margin: '0 auto 1.75rem auto', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Você ainda não criou nenhum simulado personalizado. Monte uma prova sob medida com os filtros que desejar e comece a treinar agora!
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/simulados/novo')} style={{ padding: '0.75rem 1.5rem', borderRadius: 12 }}>
            <Plus size={16} /> Criar Primeiro Simulado
          </button>
        </div>
      )}

    </div>
  )
}
