import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Clock, Maximize2, MessageCircle, ThumbsUp, BadgeCheck, ChevronDown, ChevronUp } from 'lucide-react'
import { getCommentsForLesson, type CommentThread } from '../data/lessonComments'

// ── URL Helper ──────────────────────────────────────────────────────────────────
function getEmbedUrl(url: string) {
  if (!url) return ''
  let match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
  if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`
  match = url.match(/(?:vimeo\.com\/)\b(\d+)\b/)
  if (match?.[1]) return `https://player.vimeo.com/video/${match[1]}?autoplay=1&dnt=1`
  return url
}

// ── Markdown-ish Text Renderer ──────────────────────────────────────────────────
function RichText({ text }: { text: string }) {
  return (
    <div style={{ lineHeight: 1.65, fontSize: '0.875rem', color: '#A5C3F7' }}>
      {text.split('\n').map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/)
        const rendered = parts.map((p, j) =>
          p.startsWith('**') && p.endsWith('**')
            ? <strong key={j} style={{ color: '#EBF4FF', fontWeight: 700 }}>{p.slice(2, -2)}</strong>
            : <span key={j}>{p}</span>
        )
        const isBullet = line.startsWith('•')
        const isHeader = parts.some(p => p.startsWith('**') && p.endsWith('**') && p.length > 4) && !isBullet

        return (
          <div key={i} style={{
            marginBottom: line === '' ? '0.625rem' : '0.2rem',
            display: 'flex',
            gap: isBullet ? 6 : 0,
            paddingLeft: isBullet ? 4 : 0,
            marginTop: isHeader && i > 0 ? '0.625rem' : 0,
          }}>
            {rendered}
          </div>
        )
      })}
    </div>
  )
}

// ── Comment Card ────────────────────────────────────────────────────────────────
function CommentCard({ thread, index }: { thread: CommentThread; index: number }) {
  const [replyOpen, setReplyOpen] = useState(index === 0)
  const [liked, setLiked] = useState(false)

  return (
    <div style={{
      background: 'rgba(12,26,48,0.5)',
      border: '1px solid rgba(100,160,255,0.08)',
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      {/* Student Question */}
      <div style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {/* Avatar */}
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: `${thread.student.color}22`,
            border: `2px solid ${thread.student.color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 800, color: thread.student.color,
            letterSpacing: '-0.02em',
          }}>
            {thread.student.initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.375rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#EBF4FF' }}>{thread.student.name}</span>
              <span style={{ fontSize: '0.75rem', color: '#4F6D8C' }}>{thread.time}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#C8DCF5', lineHeight: 1.6 }}>
              {thread.question}
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: '0.75rem' }}>
              <button
                onClick={() => setLiked(l => !l)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  fontSize: '0.8125rem', fontWeight: 600,
                  color: liked ? '#3B7EF8' : '#4F6D8C',
                  transition: 'color 0.15s',
                }}
              >
                <ThumbsUp size={14} fill={liked ? '#3B7EF8' : 'none'} />
                {thread.likes + (liked ? 1 : 0)}
              </button>
              <button
                onClick={() => setReplyOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  fontSize: '0.8125rem', fontWeight: 600, color: '#4F6D8C',
                  transition: 'color 0.15s',
                }}
              >
                <MessageCircle size={14} />
                {replyOpen ? 'Ocultar resposta' : 'Ver resposta do Professor'}
                {replyOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dr. André Reply */}
      {replyOpen && (
        <div style={{
          borderTop: '1px solid rgba(100,160,255,0.08)',
          background: 'rgba(59,126,248,0.04)',
          padding: '1.25rem 1.5rem',
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            {/* Admin avatar */}
            <div style={{
              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #1e40af, #3B7EF8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 900, color: '#fff',
              letterSpacing: '-0.02em',
              boxShadow: '0 0 12px rgba(59,126,248,0.3)',
            }}>
              DR
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: '0.875rem', color: '#EBF4FF' }}>Dr. André</span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: '0.7rem', fontWeight: 700,
                  color: '#3B7EF8', background: 'rgba(59,126,248,0.12)',
                  border: '1px solid rgba(59,126,248,0.25)',
                  padding: '2px 8px', borderRadius: 20,
                }}>
                  <BadgeCheck size={11} /> Professor · RokoMed
                </span>
              </div>

              <RichText text={thread.reply} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Comments Section ────────────────────────────────────────────────────────────
function CommentsSection({ title, groupName }: { title: string; groupName?: string }) {
  const threads = getCommentsForLesson(title, groupName)

  return (
    <div style={{
      background: 'rgba(8,18,34,0.6)',
      border: '1px solid rgba(100,160,255,0.08)',
      borderRadius: 20,
      overflow: 'hidden',
    }}>
      {/* Section Header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid rgba(100,160,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(59,126,248,0.03)',
      }}>
        <MessageCircle size={18} color="#3B7EF8" />
        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#EBF4FF' }}>
          Dúvidas & Discussão
        </span>
        <span style={{
          fontSize: '0.75rem', fontWeight: 700,
          background: 'rgba(59,126,248,0.1)', color: '#3B7EF8',
          border: '1px solid rgba(59,126,248,0.2)',
          padding: '2px 8px', borderRadius: 20,
        }}>
          {threads.length} comentário{threads.length !== 1 ? 's' : ''}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#4F6D8C', display: 'flex', alignItems: 'center', gap: 4 }}>
          <BadgeCheck size={12} color="#3B7EF8" /> Respostas verificadas pelo professor
        </span>
      </div>

      {/* Comment list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '1.25rem 1.5rem' }}>
        {threads.map((thread, i) => (
          <CommentCard key={thread.id} thread={thread} index={i} />
        ))}
      </div>

      {/* CTA to ask question */}
      <div style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid rgba(100,160,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(59,126,248,0.1)',
          border: '1px solid rgba(59,126,248,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#3B7EF8', fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0,
        }}>
          EU
        </div>
        <div style={{
          flex: 1, background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(100,160,255,0.1)',
          borderRadius: 10, padding: '0.625rem 1rem',
          color: '#4F6D8C', fontSize: '0.875rem', cursor: 'text',
        }}>
          Tem uma dúvida sobre essa aula? Pergunte ao professor...
        </div>
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────────
export default function LessonPlayerPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const lesson = location.state as {
    title: string
    videoUrl: string
    description?: string
    durationMin?: number
    groupName?: string
  } | null

  useEffect(() => {
    if (!lesson) { navigate('/aulas', { replace: true }); return }
    document.title = `${lesson.title} — RokoMed`
    return () => { document.title = 'RokoMed' }
  }, [lesson, navigate])

  if (!lesson) return null

  const embedUrl = getEmbedUrl(lesson.videoUrl)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #050D1A 0%, #0A1628 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#EBF4FF',
    }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid rgba(100,160,255,0.08)',
        background: 'rgba(5,13,26,0.85)',
        backdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 50,
        flexWrap: 'wrap',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(100,160,255,0.12)',
            borderRadius: 10, color: '#A5C3F7',
            padding: '8px 14px', cursor: 'pointer',
            fontSize: '0.8125rem', fontWeight: 600,
            transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(100,160,255,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
        >
          <ArrowLeft size={15} /> Voltar às Aulas
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          {lesson.groupName && (
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#3B7EF8', marginBottom: 2 }}>
              {lesson.groupName}
            </div>
          )}
          <h1 style={{ margin: 0, fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#EBF4FF' }}>
            {lesson.title}
          </h1>
        </div>

        {lesson.durationMin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8125rem', color: '#7B9DBF', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(100,160,255,0.08)', padding: '6px 12px', borderRadius: 8, whiteSpace: 'nowrap' }}>
            <Clock size={13} /> {lesson.durationMin} min
          </div>
        )}
      </header>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 1000, width: '100%', margin: '0 auto', padding: '2rem 1.5rem', gap: '1.5rem' }}>

        {/* Video Player */}
        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, borderRadius: 20, overflow: 'hidden', background: '#000', boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(100,160,255,0.1)' }}>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={lesson.title}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#4F6D8C', gap: 12 }}>
              <Maximize2 size={40} />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Vídeo não disponível</p>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div style={{ background: 'rgba(12,26,48,0.5)', border: '1px solid rgba(100,160,255,0.08)', borderRadius: 16, padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,126,248,0.1)', border: '1px solid rgba(59,126,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B7EF8', flexShrink: 0 }}>
            <BookOpen size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: '0 0 0.375rem 0', fontSize: '1.125rem', fontWeight: 700, color: '#EBF4FF', lineHeight: 1.3 }}>
              {lesson.title}
            </h2>
            {lesson.description && (
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#7B9DBF', lineHeight: 1.6 }}>
                {lesson.description}
              </p>
            )}
          </div>
          {lesson.durationMin && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(100,160,255,0.08)', borderRadius: 12, padding: '10px 16px', flexShrink: 0 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EBF4FF' }}>{lesson.durationMin}</span>
              <span style={{ fontSize: '0.6875rem', color: '#4F6D8C', fontWeight: 600 }}>min</span>
            </div>
          )}
        </div>

        {/* ── Comments Section ─────────────────────────────────────────────── */}
        <CommentsSection title={lesson.title} groupName={lesson.groupName} />

      </main>
    </div>
  )
}
