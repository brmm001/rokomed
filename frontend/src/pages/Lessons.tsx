import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { lessonsApi } from '../lib/api'
import { useAuthStore } from '../store/auth'
import {
  Play, Lock, Clock, BookOpen, Sparkles,
  ChevronRight, ShieldCheck
} from 'lucide-react'


export default function LessonsPage() {
  const user = useAuthStore(s => s.user)
  const isPro = user?.plan === 'PRO' || user?.plan === 'GRUPO' || ['ADMIN', 'SUPERADMIN'].includes(user?.role || '')
  const navigate = useNavigate()

  const { data: lessonsGroup, isLoading } = useQuery({
    queryKey: ['student-lessons'],
    queryFn: lessonsApi.list
  })

  // Local state for upgrade modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const handleLessonClick = (lesson: { locked: boolean; title: string; videoUrl: string | null; description?: string; durationMin?: number }, groupName?: string) => {
    if (lesson.locked || !isPro || !lesson.videoUrl) {
      setShowUpgradeModal(true)
    } else {
      navigate('/aulas/player', {
        state: {
          title: lesson.title,
          videoUrl: lesson.videoUrl,
          description: lesson.description,
          durationMin: lesson.durationMin,
          groupName,
        },
      })
    }
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Header Banner */}
      <div 
        className="glass"
        style={{
          borderRadius: 20,
          padding: '2.5rem 2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(15, 32, 64, 0.4) 0%, rgba(10, 22, 40, 0.6) 100%)',
          border: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div style={{ flex: 1, minWidth: '280px' }}>
          <h1 style={{ fontSize: '2.25rem', margin: 0, fontWeight: 800, letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BookOpen size={32} color="var(--accent-blue)" /> Aulas e Temas
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1rem', lineHeight: '1.5', maxWidth: 600 }}>
            Domine as especialidades médicas com nossas aulas exclusivas preparadas por especialistas. Assinantes PRO têm acesso irrestrito ao conteúdo em vídeo.
          </p>
        </div>
        
        {!isPro && (
          <div 
            className="glass" 
            style={{ 
              padding: '1.25rem', 
              borderRadius: 14, 
              border: '1px solid rgba(245, 158, 11, 0.25)', 
              background: 'rgba(245, 158, 11, 0.05)',
              maxWidth: 320
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <Sparkles size={18} /> Acesso Limitado
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0', lineHeight: 1.4 }}>
              Você está na conta FREE. Libere todas as videoaulas e recursos de IA agora mesmo.
            </p>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
              onClick={() => setShowUpgradeModal(true)}
            >
              Assinar Plano PRO
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', gap: '1rem' }}>
          <div className="loader" style={{ width: 36, height: 36 }}></div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Carregando aulas...</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {lessonsGroup?.data?.length === 0 && (
            <div className="glass" style={{ borderRadius: 16, padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Nenhuma aula disponível no momento. Volte mais tarde!
            </div>
          )}

          {lessonsGroup?.data?.map((group: { id: string; name: string; lessons: any[] }) => (

            <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ChevronRight size={18} color="var(--accent-blue)" /> {group.name}
                <span className="badge badge-gray" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                  {group.lessons.length} {group.lessons.length === 1 ? 'aula' : 'aulas'}
                </span>
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {group.lessons.map((lesson: { id: string; title: string; description: string; durationMin: number; locked: boolean; videoUrl: string | null }) => (
                  <div 
                    key={lesson.id} 
                    className="glass glass-hover" 
                    style={{ 
                      borderRadius: 16, 
                      padding: '1.25rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      opacity: lesson.locked ? 0.85 : 1
                    }}
                    onClick={() => handleLessonClick(lesson, group.name)}
                  >
                    
                    {/* Locked overlay theme */}
                    {lesson.locked && (
                      <div style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'rgba(5, 13, 26, 0.7)',
                        backdropFilter: 'blur(4px)',
                        padding: '4px 8px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: 'var(--accent-gold)',
                        border: '1px solid rgba(245, 158, 11, 0.2)'
                      }}>
                        <Lock size={10} /> PRO
                      </div>
                    )}

                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginTop: 0, marginBottom: '0.5rem', paddingRight: '40px', lineHeight: 1.4, color: 'var(--text-primary)' }}>
                        {lesson.title}
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.5rem', lineHeight: 1.4 }}>
                        {lesson.description || 'Nenhuma descrição disponível para esta aula.'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Clock size={12} />
                        <span>{lesson.durationMin ? `${lesson.durationMin} min` : 'Duração sob consulta'}</span>
                      </div>
                      
                      <span 
                        className="btn btn-secondary" 
                        style={{ 
                          padding: '0.375rem 0.75rem', 
                          fontSize: '0.75rem', 
                          borderRadius: 8,
                          background: lesson.locked ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
                          borderColor: lesson.locked ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)',
                          color: lesson.locked ? 'var(--accent-gold)' : 'var(--accent-blue)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        {lesson.locked ? (
                          <>
                            <Lock size={12} /> Desbloquear
                          </>
                        ) : (
                          <>
                            <Play size={12} fill="currentColor" /> Assistir
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}


      {/* ── Premium Upgrade Modal ─────────────────────────────────────────────── */}
      {showUpgradeModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(10px)',
            padding: '20px'
          }}
          onClick={() => setShowUpgradeModal(false)}
        >
          <div 
            className="glass animate-fade-in" 
            style={{
              width: '90%',
              maxWidth: '460px',
              padding: '2rem',
              borderRadius: '24px',
              textAlign: 'center',
              position: 'relative',
              boxShadow: 'var(--shadow-card), var(--shadow-glow)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              background: 'linear-gradient(135deg, #0A1628 0%, #112240 100%)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowUpgradeModal(false)} 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'inline-flex', width: 64, height: 64, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', marginBottom: '1.5rem' }}>
              <Lock size={32} />
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', fontFamily: 'Outfit, sans-serif' }}>
              Conteúdo Exclusivo PRO
            </h3>
            
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
              Esta videoaula é reservada para assinantes do plano PRO. Assine hoje para desbloquear todas as aulas, simulados com IA e flashcards.
            </p>

            {/* Benefits List */}
            <div style={{ textAlign: 'left', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 16, padding: '1rem 1.25rem', border: '1px solid var(--border)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                'Acesso a todas as videoaulas do Rokomed',
                'Simulados personalizados por Inteligência Artificial',
                'Algoritmo inteligente de Flashcards integrados',
                'Gabarito comentado em vídeo e texto detalhado',
              ].map((benefit, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem' }}>
                  <ShieldCheck size={16} color="var(--accent-green)" />
                  <span style={{ color: 'var(--text-primary)' }}>{benefit}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.9rem', background: 'var(--accent-gold)', border: 'none', color: '#050D1A', fontWeight: 700 }}
                onClick={() => {
                  setShowUpgradeModal(false)
                  navigate('/pricing')
                }}
              >
                Conhecer os Planos PRO
              </button>
              <button 
                className="btn btn-ghost" 
                style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setShowUpgradeModal(false)}
              >
                Continuar Estudando Grátis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
