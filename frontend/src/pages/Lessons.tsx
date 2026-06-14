import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { lessonsApi } from '../lib/api'
import { useAuthStore } from '../store/auth'
import { Play, Lock, Search, Sparkles, ShieldCheck, X, Clock } from 'lucide-react'
import { LESSON_CATALOG, type LessonTopic } from '../data/lessonCatalog'

// Normalize string for matching API lessons to static topics
function norm(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').trim()
}

function findApiLesson(topic: LessonTopic, apiLessons: any[]): any | null {
  const normTopic = norm(topic.title)
  const topicWords = normTopic.split(' ').filter(w => w.length > 4)
  return apiLessons.find((l: any) => {
    const normLesson = norm(l.title)
    return topicWords.length > 0 && topicWords.filter(w => normLesson.includes(w)).length >= Math.ceil(topicWords.length * 0.6)
  }) ?? null
}

export default function LessonsPage() {
  const user = useAuthStore(s => s.user)
  const isPro = user?.plan === 'PRO' || user?.plan === 'GRUPO' || ['ADMIN', 'SUPERADMIN'].includes(user?.role || '')
  const navigate = useNavigate()

  const [activeCategoryId, setActiveCategoryId] = useState(LESSON_CATALOG[0].id)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const { data: apiData } = useQuery({ queryKey: ['student-lessons'], queryFn: lessonsApi.list })

  const apiLessons = useMemo(() => {
    return (apiData?.data ?? []).flatMap((g: any) => g.lessons ?? [])
  }, [apiData])

  const activeCategory = LESSON_CATALOG.find(c => c.id === activeCategoryId)!

  const filteredTopics = useMemo(() => {
    const q = norm(searchQuery)
    if (!q) return activeCategory.topics
    return LESSON_CATALOG.flatMap(c => c.topics).filter(t =>
      norm(t.title).includes(q) || norm(t.desc).includes(q)
    )
  }, [searchQuery, activeCategory])

  const isSearching = searchQuery.trim().length > 0

  const handleTopicClick = (topic: LessonTopic) => {
    const apiLesson = findApiLesson(topic, apiLessons)
    if (!isPro) { setShowUpgradeModal(true); return }
    if (apiLesson?.videoUrl) {
      navigate('/aulas/player', {
        state: {
          title: topic.title,
          videoUrl: apiLesson.videoUrl,
          description: topic.desc,
          durationMin: topic.durationMin ?? apiLesson.durationMin,
          groupName: activeCategory.name,
        },
      })
    } else {
      setShowUpgradeModal(true)
    }
  }

  const totalTopics = LESSON_CATALOG.reduce((acc, c) => acc + c.topics.length, 0)
  const availableTopics = LESSON_CATALOG.reduce((acc, c) =>
    acc + c.topics.filter(t => !!findApiLesson(t, apiLessons)).length, 0)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: '4rem' }}>

      {/* ── Hero Header ──────────────────────────────────────────────────────── */}
      <div style={{
        borderRadius: 24,
        padding: '2.5rem 2rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(15,32,64,0.6) 0%, rgba(10,22,40,0.8) 100%)',
        border: '1px solid rgba(100,160,255,0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(59,126,248,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: '40%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(139,92,246,0.03)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.75rem' }}>📚</span>
              <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.025em' }}>
                Aulas e Temas
              </h1>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, maxWidth: 520 }}>
              Conteúdo estruturado para residência médica. Especialidades organizadas por relevância e incidência em prova.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: '1rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--accent-blue)', background: 'rgba(59,126,248,0.08)', border: '1px solid rgba(59,126,248,0.15)', padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>
                📋 {totalTopics} temas
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--accent-green)', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>
                ▶ {availableTopics} disponíveis
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>
                🕐 Em breve: {totalTopics - availableTopics}
              </span>
            </div>
          </div>

          {!isPro && (
            <div style={{
              padding: '1rem 1.25rem',
              borderRadius: 16,
              border: '1px solid rgba(245,158,11,0.2)',
              background: 'rgba(245,158,11,0.05)',
              maxWidth: 280,
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-gold)', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <Sparkles size={16} /> Acesso Limitado
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0', lineHeight: 1.5 }}>
                Libere todas as videoaulas com o plano PRO.
              </p>
              <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                onClick={() => setShowUpgradeModal(true)}>
                Assinar PRO
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Search ───────────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar tema (ex: síndrome coronariana, sepse, apendicite...)"
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '0.75rem 2.5rem 0.75rem 2.75rem',
            color: 'var(--text-primary)',
            fontSize: '0.9375rem',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.target.style.borderColor = 'rgba(59,126,248,0.4)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Category Tabs ────────────────────────────────────────────────────── */}
      {!isSearching && (
        <div style={{ display: 'flex', gap: 10, marginBottom: '1.75rem', overflowX: 'auto', paddingBottom: 4 }}>
          {LESSON_CATALOG.map(cat => {
            const isActive = activeCategoryId === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '0.625rem 1.125rem',
                  borderRadius: 12,
                  border: `1px solid ${isActive ? cat.color : 'var(--border)'}`,
                  background: isActive ? `${cat.color}18` : 'rgba(255,255,255,0.02)',
                  color: isActive ? cat.color : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                  boxShadow: isActive ? `0 0 12px ${cat.color}22` : 'none',
                }}
              >
                <span style={{ fontSize: '1rem' }}>{cat.emoji}</span>
                {cat.name}
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700,
                  background: isActive ? `${cat.color}30` : 'rgba(255,255,255,0.05)',
                  color: isActive ? cat.color : 'var(--text-muted)',
                  padding: '1px 7px', borderRadius: 20,
                }}>
                  {cat.topics.length}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Category Description ─────────────────────────────────────────────── */}
      {!isSearching && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '0.75rem 1rem',
          borderRadius: 10,
          background: `${activeCategory.color}08`,
          border: `1px solid ${activeCategory.color}20`,
          marginBottom: '1.5rem',
        }}>
          <span style={{ fontSize: '1.25rem' }}>{activeCategory.emoji}</span>
          <div>
            <span style={{ fontWeight: 700, color: activeCategory.color, fontSize: '0.9375rem' }}>{activeCategory.name}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginLeft: 10 }}>
              {activeCategory.topics.length} temas • {activeCategory.topics.filter(t => !!findApiLesson(t, apiLessons)).length} disponíveis
            </span>
          </div>
        </div>
      )}

      {/* Search results header */}
      {isSearching && (
        <div style={{ marginBottom: '1.25rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {filteredTopics.length} resultado{filteredTopics.length !== 1 ? 's' : ''} para "<strong style={{ color: 'var(--text-primary)' }}>{searchQuery}</strong>"
        </div>
      )}

      {/* ── Topic Grid ───────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem',
      }}>
        {filteredTopics.map((topic, idx) => {
          const apiLesson = findApiLesson(topic, apiLessons)
          const isAvailable = !!apiLesson?.videoUrl
          const cat = isSearching
            ? LESSON_CATALOG.find(c => c.topics.includes(topic)) ?? activeCategory
            : activeCategory

          return (
            <TopicCard
              key={`${cat.id}-${idx}`}
              topic={topic}
              category={cat}
              isAvailable={isAvailable}
              isPro={isPro}
              onClick={() => handleTopicClick(topic)}
            />
          )
        })}

        {filteredTopics.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
            <p style={{ margin: 0 }}>Nenhum tema encontrado para "<strong>{searchQuery}</strong>"</p>
          </div>
        )}
      </div>

      {/* ── Upgrade Modal ────────────────────────────────────────────────────── */}
      {showUpgradeModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(10px)', padding: 20 }}
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className="glass animate-fade-in"
            style={{ width: '90%', maxWidth: 460, padding: '2rem', borderRadius: 24, textAlign: 'center', position: 'relative', boxShadow: 'var(--shadow-card), var(--shadow-glow)', border: '1px solid rgba(245,158,11,0.25)', background: 'linear-gradient(135deg, #0A1628 0%, #112240 100%)' }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowUpgradeModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
              <X size={20} />
            </button>
            <div style={{ display: 'inline-flex', width: 64, height: 64, borderRadius: '50%', background: 'rgba(245,158,11,0.1)', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', marginBottom: '1.5rem' }}>
              <Lock size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Conteúdo Exclusivo PRO</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
              Esta videoaula é exclusiva para assinantes PRO. Assine e tenha acesso a todos os {totalTopics} temas, simulados e flashcards.
            </p>
            <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)', borderRadius: 14, padding: '1rem 1.25rem', border: '1px solid var(--border)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Acesso a todas as videoaulas do Rokomed', 'Simulados personalizados por Inteligência Artificial', 'Algoritmo inteligente de Flashcards', 'Gabarito comentado em vídeo e texto detalhado'].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem' }}>
                  <ShieldCheck size={16} color="var(--accent-green)" />
                  <span style={{ color: 'var(--text-primary)' }}>{b}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.9rem', background: 'var(--accent-gold)', border: 'none', color: '#050D1A', fontWeight: 700 }}
                onClick={() => { setShowUpgradeModal(false); navigate('/pricing') }}>
                Conhecer os Planos PRO
              </button>
              <button className="btn btn-ghost" style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setShowUpgradeModal(false)}>
                Continuar Estudando Grátis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Topic Card Component ────────────────────────────────────────────────────────
interface TopicCardProps {
  topic: import('../data/lessonCatalog').LessonTopic
  category: import('../data/lessonCatalog').LessonCategory
  isAvailable: boolean
  isPro: boolean
  onClick: () => void
}

function TopicCard({ topic, category, isAvailable, isPro, onClick }: TopicCardProps) {
  const [hovered, setHovered] = useState(false)

  const statusColor = isAvailable ? category.color : 'var(--text-muted)'
  const statusBg = isAvailable ? `${category.color}12` : 'rgba(255,255,255,0.02)'
  const statusBorder = isAvailable ? `${category.color}25` : 'var(--border)'

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hovered ? (isAvailable ? `${category.color}30` : 'rgba(255,255,255,0.08)') : 'var(--border)'}`,
        borderRadius: 16,
        cursor: 'pointer',
        transition: 'all 0.2s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered && isAvailable ? `0 8px 24px ${category.color}15` : 'none',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Colored top accent bar */}
      <div style={{ height: 3, background: isAvailable ? `linear-gradient(90deg, ${category.color}, ${category.color}60)` : 'rgba(255,255,255,0.06)', transition: 'all 0.2s' }} />

      <div style={{ padding: '1.125rem 1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: '0.625rem' }}>
          <h3 style={{
            margin: 0,
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.35,
            flex: 1,
          }}>
            {topic.title}
          </h3>
          {!isPro && (
            <Lock size={13} style={{ color: 'var(--accent-gold)', flexShrink: 0, marginTop: 2 }} />
          )}
        </div>

        {/* Description */}
        <p style={{
          margin: '0 0 1rem 0',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.55,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1,
        }}>
          {topic.desc}
        </p>

        {/* Footer row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: '0.7rem', fontWeight: 700,
              color: statusColor,
              background: statusBg,
              border: `1px solid ${statusBorder}`,
              padding: '2px 8px', borderRadius: 20,
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: isAvailable ? category.color : 'var(--text-muted)', display: 'inline-block' }} />
              {isAvailable ? 'Disponível' : 'Em breve'}
            </span>
            {topic.durationMin && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <Clock size={10} /> {topic.durationMin} min
              </span>
            )}
          </div>

          {isAvailable && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: '0.75rem', fontWeight: 700,
              color: category.color,
              background: `${category.color}12`,
              border: `1px solid ${category.color}25`,
              padding: '4px 10px', borderRadius: 8,
              transition: 'all 0.2s',
            }}>
              <Play size={11} fill="currentColor" /> Assistir
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
