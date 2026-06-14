import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, BookOpen, Clock, Maximize2, MessageCircle, ThumbsUp, BadgeCheck, ChevronDown, ChevronUp, Trash2, Send } from 'lucide-react'
import { getCommentsForLesson } from '../data/lessonComments'
import { lessonsApi } from '../lib/api'
import { useAuthStore } from '../store/auth'

// ── Types ────────────────────────────────────────────────────────────────────────
interface UnifiedComment {
  id: string
  text: string
  createdAt: string | Date
  isAdminReply: boolean
  user: {
    id?: string
    name: string
    picture?: string
    role: string
    initials?: string
    color?: string
  }
  parentId?: string | null
  replies?: UnifiedComment[]
}

// ── URL Helper ──────────────────────────────────────────────────────────────────
function getEmbedUrl(url: string) {
  if (!url) return ''
  let match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
  if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`
  match = url.match(/(?:vimeo\.com\/)\b(\d+)\b/)
  if (match?.[1]) return `https://player.vimeo.com/video/${match[1]}?autoplay=1&dnt=1`
  return url
}

// ── Initials & Colors Helpers ──────────────────────────────────────────────────
function getInitials(name: string) {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return parts[0].slice(0, 2).toUpperCase()
}

function getRandomColor(name: string) {
  const colors = ['#3B7EF8', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#3B82F6', '#EF4444', '#14B8A6']
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

function formatCommentDate(dateInput: string | Date) {
  if (typeof dateInput === 'string' && !dateInput.includes('T')) {
    return dateInput
  }
  const date = new Date(dateInput)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Agora mesmo'
  if (diffMins < 60) return `Há ${diffMins} min`
  if (diffHours < 24) return `Há ${diffHours} h`
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `Há ${diffDays} dias`
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
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
interface CommentCardProps {
  comment: UnifiedComment
  currentUser: any
  onReplySubmit: (parentId: string, text: string) => void
  onDelete: (commentId: string) => void
  defaultOpen: boolean
}

function CommentCard({ comment, currentUser, onReplySubmit, onDelete, defaultOpen }: CommentCardProps) {
  const [replyOpen, setReplyOpen] = useState(defaultOpen)
  const [liked, setLiked] = useState(false)

  const isDbComment = !!comment.user.id
  const canDelete = isDbComment && (currentUser?.id === comment.user.id || ['ADMIN', 'SUPERADMIN', 'PROFESSOR'].includes(currentUser?.role || ''))
  const isCommentAdmin = ['ADMIN', 'SUPERADMIN', 'PROFESSOR'].includes(comment.user.role) || comment.isAdminReply

  const totalReplies = comment.replies?.length || 0

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
            background: isCommentAdmin ? 'linear-gradient(135deg, #1e40af, #3B7EF8)' : `${comment.user.color || '#3B7EF8'}22`,
            border: `2px solid ${isCommentAdmin ? '#3B7EF8' : (comment.user.color || '#3B7EF8')}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 800, color: isCommentAdmin ? '#fff' : (comment.user.color || '#3B7EF8'),
            letterSpacing: '-0.02em',
          }}>
            {comment.user.initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.375rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#EBF4FF' }}>{comment.user.name}</span>
              
              {isCommentAdmin && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: '0.7rem', fontWeight: 700,
                  color: '#3B7EF8', background: 'rgba(59,126,248,0.12)',
                  border: '1px solid rgba(59,126,248,0.25)',
                  padding: '2px 8px', borderRadius: 20,
                }}>
                  <BadgeCheck size={11} /> Professor · RokoMed
                </span>
              )}

              <span style={{ fontSize: '0.75rem', color: '#4F6D8C' }}>{formatCommentDate(comment.createdAt)}</span>

              {canDelete && (
                <button
                  onClick={() => onDelete(comment.id)}
                  style={{
                    marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
                    color: '#EF4444', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 3,
                    padding: 4, borderRadius: 4, transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#F87171'}
                  onMouseLeave={e => e.currentTarget.style.color = '#EF4444'}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            
            <div style={{ margin: 0, fontSize: '0.9rem', color: '#C8DCF5', lineHeight: 1.6 }}>
              <RichText text={comment.text} />
            </div>

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
                {liked ? 1 : 0}
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
                {replyOpen ? 'Ocultar respostas' : totalReplies > 0 ? `Ver respostas (${totalReplies})` : 'Responder'}
                {replyOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Replies List */}
      {replyOpen && comment.replies && comment.replies.length > 0 && (
        <div style={{
          borderTop: '1px solid rgba(100,160,255,0.08)',
          background: 'rgba(59,126,248,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: '1.25rem 1.5rem 1.25rem 2.5rem',
        }}>
          {comment.replies.map((reply) => {
            const isReplyDbComment = !!reply.user.id
            const canDeleteReply = isReplyDbComment && (currentUser?.id === reply.user.id || ['ADMIN', 'SUPERADMIN', 'PROFESSOR'].includes(currentUser?.role || ''))
            const isReplyAdmin = ['ADMIN', 'SUPERADMIN', 'PROFESSOR'].includes(reply.user.role) || reply.isAdminReply

            return (
              <div key={reply.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: isReplyAdmin ? 'linear-gradient(135deg, #1e40af, #3B7EF8)' : `${reply.user.color || '#3B7EF8'}22`,
                  border: `2px solid ${isReplyAdmin ? '#3B7EF8' : (reply.user.color || '#3B7EF8')}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 800, color: isReplyAdmin ? '#fff' : (reply.user.color || '#3B7EF8'),
                }}>
                  {reply.user.initials}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#EBF4FF' }}>{reply.user.name}</span>
                    {isReplyAdmin && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        fontSize: '0.65rem', fontWeight: 700,
                        color: '#3B7EF8', background: 'rgba(59,126,248,0.12)',
                        border: '1px solid rgba(59,126,248,0.25)',
                        padding: '1px 6px', borderRadius: 20,
                      }}>
                        <BadgeCheck size={10} /> Professor · RokoMed
                      </span>
                    )}
                    <span style={{ fontSize: '0.7rem', color: '#4F6D8C' }}>{formatCommentDate(reply.createdAt)}</span>
                    
                    {canDeleteReply && (
                      <button
                        onClick={() => onDelete(reply.id)}
                        style={{
                          marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
                          color: '#EF4444', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 3,
                          padding: 2, borderRadius: 4, transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#F87171'}
                        onMouseLeave={e => e.currentTarget.style.color = '#EF4444'}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <RichText text={reply.text} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Reply input (Only for Database Comments) */}
      {replyOpen && isDbComment && (
        <div style={{
          borderTop: '1px solid rgba(100,160,255,0.06)',
          background: 'rgba(59,126,248,0.01)',
          padding: '0.75rem 1.5rem 0.75rem 2.5rem',
        }}>
          <form onSubmit={(e) => {
            e.preventDefault()
            const form = e.currentTarget
            const input = form.elements.namedItem('replyText') as HTMLInputElement
            if (input.value.trim()) {
              onReplySubmit(comment.id, input.value.trim())
              input.value = ''
            }
          }} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              name="replyText"
              placeholder="Escreva uma resposta..."
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(100,160,255,0.1)',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#EBF4FF',
                fontSize: '0.8125rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                background: '#3B7EF8',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                padding: '8px 16px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#2563EB'}
              onMouseLeave={e => e.currentTarget.style.background = '#3B7EF8'}
            >
              Responder
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

// ── Comments Section ────────────────────────────────────────────────────────────
interface CommentsSectionProps {
  lessonId?: string
  title: string
  groupName?: string
}

function CommentsSection({ lessonId, title, groupName }: CommentsSectionProps) {
  const user = useAuthStore(s => s.user)
  const queryClient = useQueryClient()
  const [newCommentText, setNewCommentText] = useState('')

  // 1. Fetch real comments from database if lessonId is defined
  const { data: dbCommentsData, isLoading } = useQuery({
    queryKey: ['lesson-comments', lessonId],
    queryFn: () => lessonId ? lessonsApi.getComments(lessonId) : Promise.resolve({ data: [] }),
    enabled: !!lessonId,
  })

  // 2. Fetch static (fake) comments
  const staticThreads = getCommentsForLesson(title, groupName)

  // 3. Mutations
  const addCommentMutation = useMutation({
    mutationFn: ({ text, parentId }: { text: string; parentId?: string }) => {
      if (!lessonId) return Promise.reject(new Error('ID da aula não disponível'))
      return lessonsApi.addComment(lessonId, text, parentId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-comments', lessonId] })
    }
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => lessonsApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-comments', lessonId] })
    }
  })

  // 4. Map static comments to unified format
  const mappedStaticComments: UnifiedComment[] = staticThreads.map(t => ({
    id: t.id,
    text: t.question,
    createdAt: t.time,
    isAdminReply: false,
    user: {
      name: t.student.name,
      role: 'ALUNO',
      initials: t.student.initials,
      color: t.student.color
    },
    replies: t.reply ? [
      {
        id: `reply-${t.id}`,
        text: t.reply,
        createdAt: t.time,
        isAdminReply: true,
        user: {
          name: 'Dr. André',
          role: 'ADMIN',
          initials: 'DA',
          color: '#3B7EF8'
        }
      }
    ] : []
  }))

  // 5. Map db comments to unified format
  const mappedDbComments: UnifiedComment[] = (dbCommentsData?.data ?? []).map((c: any) => ({
    id: c.id,
    text: c.text,
    createdAt: c.createdAt,
    isAdminReply: c.isAdminReply,
    user: {
      id: c.user.id,
      name: c.user.name,
      picture: c.user.picture,
      role: c.user.role,
      initials: getInitials(c.user.name),
      color: getRandomColor(c.user.name)
    },
    replies: (c.replies ?? []).map((r: any) => ({
      id: r.id,
      text: r.text,
      createdAt: r.createdAt,
      isAdminReply: r.isAdminReply,
      user: {
        id: r.user.id,
        name: r.user.name,
        picture: r.user.picture,
        role: r.user.role,
        initials: getInitials(r.user.name),
        color: getRandomColor(r.user.name)
      }
    }))
  }))

  // Merge them: DB comments first, then static ones
  const allComments = [...mappedDbComments, ...mappedStaticComments]

  const handleCreateRootComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCommentText.trim()) return
    addCommentMutation.mutate({ text: newCommentText.trim() })
    setNewCommentText('')
  }

  const handleReplySubmit = (parentId: string, text: string) => {
    addCommentMutation.mutate({ text, parentId })
  }

  const handleDeleteComment = (commentId: string) => {
    if (confirm('Tem certeza que deseja excluir este comentário?')) {
      deleteCommentMutation.mutate(commentId)
    }
  }

  const userInitials = user ? getInitials(user.name) : 'EU'
  const userColor = user ? getRandomColor(user.name) : '#3B7EF8'

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
          {allComments.length} comentário{allComments.length !== 1 ? 's' : ''}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#4F6D8C', display: 'flex', alignItems: 'center', gap: 4 }}>
          <BadgeCheck size={12} color="#3B7EF8" /> Respostas verificadas pelo professor
        </span>
      </div>

      {/* Comment list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '1.25rem 1.5rem' }}>
        {isLoading && (
          <div style={{ color: '#4F6D8C', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
            Carregando discussões...
          </div>
        )}
        {!isLoading && allComments.length === 0 && (
          <div style={{ color: '#4F6D8C', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 1rem' }}>
            Ainda não há dúvidas sobre este tema. Seja o primeiro a perguntar!
          </div>
        )}
        {!isLoading && allComments.map((comment, i) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            currentUser={user}
            onReplySubmit={handleReplySubmit}
            onDelete={handleDeleteComment}
            defaultOpen={i === 0}
          />
        ))}
      </div>

      {/* Input to ask a question */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderTop: '1px solid rgba(100,160,255,0.06)',
        background: 'rgba(12,26,48,0.3)',
      }}>
        <form onSubmit={handleCreateRootComment} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: `${userColor}22`,
            border: `2px solid ${userColor}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: userColor, fontSize: '0.75rem', fontWeight: 800,
          }}>
            {userInitials}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Tem uma dúvida sobre essa aula? Pergunte ao professor..."
              rows={2}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(100,160,255,0.1)',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#EBF4FF',
                fontSize: '0.875rem',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                minHeight: 50,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={!newCommentText.trim() || addCommentMutation.isPending}
                style={{
                  background: newCommentText.trim() ? '#3B7EF8' : 'rgba(59,126,248,0.2)',
                  color: newCommentText.trim() ? '#fff' : '#4F6D8C',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: newCommentText.trim() ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  if (newCommentText.trim()) e.currentTarget.style.background = '#2563EB'
                }}
                onMouseLeave={e => {
                  if (newCommentText.trim()) e.currentTarget.style.background = '#3B7EF8'
                }}
              >
                <Send size={14} />
                {addCommentMutation.isPending ? 'Enviando...' : 'Perguntar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────────
export default function LessonPlayerPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const lesson = location.state as {
    id: string
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
        <CommentsSection lessonId={lesson.id} title={lesson.title} groupName={lesson.groupName} />

      </main>
    </div>
  )
}
