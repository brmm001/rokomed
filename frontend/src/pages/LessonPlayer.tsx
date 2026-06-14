import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Clock, Maximize2 } from 'lucide-react'

// Helper to extract embed URL from YouTube / Vimeo
function getEmbedUrl(url: string) {
  if (!url) return ''

  // YouTube watch URLs or short URLs
  let match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`
  }

  // Vimeo URLs
  match = url.match(/(?:vimeo\.com\/)\b(\d+)\b/)
  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}?autoplay=1&dnt=1`
  }

  return url
}

export default function LessonPlayerPage() {
  const location = useLocation()
  const navigate = useNavigate()

  // Lesson data is passed via router state
  const lesson = location.state as { title: string; videoUrl: string; description?: string; durationMin?: number; groupName?: string } | null

  useEffect(() => {
    if (!lesson) {
      navigate('/aulas', { replace: true })
      return
    }
    document.title = `${lesson.title} — RokoMed`
    return () => { document.title = 'RokoMed' }
  }, [lesson, navigate])

  if (!lesson) return null

  const embedUrl = getEmbedUrl(lesson.videoUrl)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #050D1A 0%, #0A1628 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#EBF4FF',
      }}
    >
      {/* Top Bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(100,160,255,0.08)',
          background: 'rgba(5,13,26,0.85)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(100,160,255,0.12)',
            borderRadius: '10px',
            color: '#A5C3F7',
            padding: '8px 14px',
            cursor: 'pointer',
            fontSize: '0.8125rem',
            fontWeight: 600,
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(100,160,255,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
        >
          <ArrowLeft size={15} />
          Voltar às Aulas
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          {lesson.groupName && (
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                color: '#3B7EF8',
                marginBottom: '2px',
              }}
            >
              {lesson.groupName}
            </div>
          )}
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
              fontWeight: 700,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: '#EBF4FF',
            }}
          >
            {lesson.title}
          </h1>
        </div>

        {lesson.durationMin && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.8125rem',
              color: '#7B9DBF',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(100,160,255,0.08)',
              padding: '6px 12px',
              borderRadius: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            <Clock size={13} />
            {lesson.durationMin} min
          </div>
        )}
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 1200, width: '100%', margin: '0 auto', padding: '2rem 1.5rem', gap: '1.5rem' }}>

        {/* Video Player */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingBottom: '56.25%', // 16:9
            height: 0,
            borderRadius: '20px',
            overflow: 'hidden',
            background: '#000',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(100,160,255,0.1)',
          }}
        >
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={lesson.title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0,
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4F6D8C',
                gap: '12px',
              }}
            >
              <Maximize2 size={40} />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Vídeo não disponível</p>
            </div>
          )}
        </div>

        {/* Info Card below the video */}
        <div
          style={{
            background: 'rgba(12,26,48,0.5)',
            border: '1px solid rgba(100,160,255,0.08)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'rgba(59,126,248,0.1)',
              border: '1px solid rgba(59,126,248,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3B7EF8',
              flexShrink: 0,
            }}
          >
            <BookOpen size={20} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                margin: '0 0 0.375rem 0',
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#EBF4FF',
                lineHeight: 1.3,
              }}
            >
              {lesson.title}
            </h2>
            {lesson.description && (
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#7B9DBF', lineHeight: 1.6 }}>
                {lesson.description}
              </p>
            )}
          </div>

          {lesson.durationMin && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(100,160,255,0.08)',
                borderRadius: '12px',
                padding: '10px 16px',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EBF4FF', fontFamily: 'Outfit, sans-serif' }}>
                {lesson.durationMin}
              </span>
              <span style={{ fontSize: '0.6875rem', color: '#4F6D8C', fontWeight: 600 }}>min</span>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
