import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, XCircle, ChevronRight, Sparkles, Trophy, RotateCcw } from 'lucide-react'
import api from '../lib/api'

type FreeQuestion = {
  id: string
  statement: string
  options: any
  correctOption?: string
  explanation?: string
  specialty?: { name: string }
  institution?: { name: string; acronym: string }
  year?: number
}

export default function FreeExamPage() {
  const [questions, setQuestions] = useState<FreeQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResult, setShowResult] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    document.title = 'Simulado Grátis — RokoMed'
    api.get('/questions/public-sample')
      .then(r => { setQuestions(r.data.data || []); setLoading(false) })
      .catch(e => {
        console.error(e)
        const msg = e.response?.data?.error || e.message || 'Erro desconhecido'
        setError(msg)
        setLoading(false)
      })
  }, [])

  const handleSelectOption = (letter: string) => {
    const q = questions[currentIndex]
    if (answers[q.id]) return
    setAnswers({ ...answers, [q.id]: letter })
  }

  const handleNext = () => {
    setAnimating(true)
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        setShowResult(true)
      }
      setAnimating(false)
    }, 300)
  }

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#030812', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(59,126,248,0.15)', borderTopColor: '#3B7EF8', animation: 'fe-spin 0.9s linear infinite' }} />
      <style>{`@keyframes fe-spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ color: '#7B9DBF', fontSize: '14px', fontWeight: 500 }}>Carregando simulado...</span>
    </div>
  )

  /* ── Error ── */
  if (error) return (
    <div style={{ minHeight: '100vh', background: '#030812', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', fontFamily: "'Inter', sans-serif", padding: '2rem' }}>
      <XCircle size={48} color="#EF4444" />
      <p style={{ color: '#EBF4FF', fontSize: '16px', textAlign: 'center' }}>Erro ao carregar: <strong>{error}</strong></p>
      <a href="/simulado-gratis" style={{ color: '#3B7EF8', fontSize: '14px', textDecoration: 'underline' }}>Tentar novamente</a>
    </div>
  )

  if (questions.length === 0) return (
    <div style={{ minHeight: '100vh', background: '#030812', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7B9DBF', fontFamily: "'Inter', sans-serif" }}>
      Nenhuma questão disponível no momento.
    </div>
  )

  /* ── Result ── */
  if (showResult) {
    const correctCount = questions.filter(q => answers[q.id] === q.correctOption).length
    const score = Math.round((correctCount / questions.length) * 100)
    const isGood = score >= 60

    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Sora:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
          @keyframes fe-spin { to { transform: rotate(360deg); } }
          @keyframes fe-fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fe-scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
          @keyframes fe-glow { 0%,100% { box-shadow: 0 0 20px rgba(59,126,248,0.2); } 50% { box-shadow: 0 0 40px rgba(59,126,248,0.45); } }
          @keyframes fe-countUp { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
        `}</style>
        <div style={{ minHeight: '100vh', background: '#030812', fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden' }}>
          {/* Ambient glows */}
          <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,126,248,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Header */}
          <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(3,8,18,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(100,160,255,0.08)', padding: '0 24px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Link to="/" style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 800, color: '#EBF4FF', textDecoration: 'none', letterSpacing: '-0.02em' }}>
                Roko<span style={{ color: '#3B7EF8' }}>Med</span>
              </Link>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7B9DBF' }}>
                Simulado Grátis
              </span>
            </div>
          </header>

          <main style={{ maxWidth: '640px', margin: '0 auto', padding: '4rem 1.5rem 6rem', animation: 'fe-fadeUp 0.5s ease both' }}>
            {/* Trophy icon */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: isGood ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', border: `2px solid ${isGood ? 'rgba(16,185,129,0.35)' : 'rgba(245,158,11,0.35)'}`, animation: 'fe-scaleIn 0.5s 0.1s ease both', opacity: 0 }}>
                <Trophy size={36} color={isGood ? '#10B981' : '#F59E0B'} />
              </div>
            </div>

            {/* Score card */}
            <div style={{ background: 'rgba(12,26,48,0.7)', border: '1px solid rgba(100,160,255,0.12)', borderRadius: '24px', padding: '2.5rem', backdropFilter: 'blur(16px)', textAlign: 'center', marginBottom: '1.5rem', animation: 'fe-scaleIn 0.5s 0.15s ease both', opacity: 0 }}>
              <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3B7EF8', marginBottom: '8px' }}>Sua Pontuação</p>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '80px', fontWeight: 800, lineHeight: 1, color: isGood ? '#10B981' : '#F59E0B', animation: 'fe-countUp 0.6s 0.3s ease both', opacity: 0 }}>
                {score}%
              </div>
              <p style={{ color: '#7B9DBF', fontSize: '15px', marginTop: '12px' }}>
                Você acertou <strong style={{ color: '#EBF4FF' }}>{correctCount}</strong> de <strong style={{ color: '#EBF4FF' }}>{questions.length}</strong> questões
              </p>

              {/* Progress bar */}
              <div style={{ margin: '24px 0 0', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${score}%`, background: isGood ? 'linear-gradient(90deg, #10B981, #059669)' : 'linear-gradient(90deg, #F59E0B, #D97706)', borderRadius: '99px', transition: 'width 1s ease' }} />
              </div>

              {/* Per-question summary */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
                {questions.map((q, i) => {
                  const correct = answers[q.id] === q.correctOption
                  return (
                    <div key={q.id} style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, fontFamily: "'Sora', sans-serif", background: correct ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)', border: `1px solid ${correct ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.3)'}`, color: correct ? '#6EE7B7' : '#FCA5A5' }}>
                      {i + 1}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* CTA card */}
            <div style={{ background: 'linear-gradient(135deg, rgba(59,126,248,0.08) 0%, rgba(20,184,166,0.06) 100%)', border: '1px solid rgba(59,126,248,0.2)', borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem', animation: 'fe-fadeUp 0.5s 0.4s ease both', opacity: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={16} color="#F59E0B" />
                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#F59E0B' }}>Oferta por tempo limitado</span>
              </div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: 800, color: '#EBF4FF', marginBottom: '8px', lineHeight: 1.2 }}>
                Acesse <span style={{ background: 'linear-gradient(135deg, #A5C3F7, #3B7EF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>15.000+ questões</span> comentadas
              </h3>
              <p style={{ color: '#7B9DBF', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
                A plataforma RokoMed passará por reajuste de preço com a nova versão da IA. Garanta hoje o acesso total por apenas <strong style={{ color: '#EBF4FF' }}>R$&nbsp;29/mês</strong> antes que o valor aumente.
              </p>
              <Link
                to="/checkout?plan=monthly"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #3B7EF8, #1D4ED8)', color: 'white', fontFamily: "'Sora', sans-serif", fontSize: '15px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(59,126,248,0.35)', transition: 'all 0.25s' }}
              >
                Garantir Acesso Imediato <ArrowRight size={16} />
              </Link>
              <p style={{ color: '#4F6D8C', fontSize: '12px', textAlign: 'center', marginTop: '10px' }}>Sem fidelidade. Cancele a qualquer momento.</p>
            </div>

            {/* Restart */}
            <div style={{ textAlign: 'center', animation: 'fe-fadeUp 0.5s 0.5s ease both', opacity: 0 }}>
              <button
                onClick={() => { setShowResult(false); setCurrentIndex(0); setAnswers({}) }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid rgba(100,160,255,0.15)', color: '#7B9DBF', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontFamily: "'Inter', sans-serif", fontWeight: 500, transition: 'all 0.2s' }}
              >
                <RotateCcw size={14} /> Refazer simulado
              </button>
            </div>
          </main>
        </div>
      </>
    )
  }

  /* ── Exam ── */
  const q = questions[currentIndex]
  const answeredLetter = answers[q.id]
  const isAnswered = !!answeredLetter
  const progress = ((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100

  let parsedOpts: any[] = []
  try {
    parsedOpts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options
  } catch (_) {}

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Sora:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');

        @keyframes fe-spin { to { transform: rotate(360deg); } }
        @keyframes fe-fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fe-slideOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-40px); } }
        @keyframes fe-slideIn { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fe-revealExpl { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        .fe-option-btn {
          width: 100%;
          text-align: left;
          padding: 16px 20px;
          border-radius: 12px;
          border: 1px solid rgba(100,160,255,0.1);
          background: rgba(7,15,30,0.7);
          color: #C8DCF5;
          cursor: pointer;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          line-height: 1.55;
          transition: all 0.18s ease;
          position: relative;
          overflow: hidden;
        }
        .fe-option-btn:hover:not(.answered) {
          border-color: rgba(100,160,255,0.25);
          background: rgba(12,26,48,0.9);
          transform: translateX(2px);
        }
        .fe-option-btn.correct {
          border-color: rgba(16,185,129,0.5);
          background: rgba(16,185,129,0.08);
          color: #EBF4FF;
        }
        .fe-option-btn.wrong {
          border-color: rgba(239,68,68,0.45);
          background: rgba(239,68,68,0.07);
          color: #EBF4FF;
        }
        .fe-option-btn.selected-neutral {
          border-color: rgba(59,126,248,0.45);
          background: rgba(59,126,248,0.08);
          color: #EBF4FF;
        }
        .fe-letter {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 700;
          background: rgba(100,160,255,0.07);
          border: 1px solid rgba(100,160,255,0.12);
          color: #7B9DBF;
          transition: all 0.18s;
        }
        .fe-option-btn.correct .fe-letter {
          background: rgba(16,185,129,0.2);
          border-color: rgba(16,185,129,0.4);
          color: #6EE7B7;
        }
        .fe-option-btn.wrong .fe-letter {
          background: rgba(239,68,68,0.15);
          border-color: rgba(239,68,68,0.35);
          color: #FCA5A5;
        }
        .fe-option-btn.selected-neutral .fe-letter {
          background: rgba(59,126,248,0.15);
          border-color: rgba(59,126,248,0.35);
          color: #93C5FD;
        }

        /* Explanation */
        .fe-explanation .gatilhos { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; padding: 14px 16px; background: rgba(59,126,248,0.06); border: 1px solid rgba(59,126,248,0.18); border-radius: 10px; }
        .fe-explanation .gatilho { background: rgba(59,126,248,0.14); color: #93C5FD; border: 1px solid rgba(59,126,248,0.28); padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; font-family: 'Sora', sans-serif; }
        .fe-explanation h4 { font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #3B7EF8; margin: 0 0 10px; }
        .fe-explanation p { font-size: 14px; line-height: 1.7; color: #94A3B8; margin-bottom: 10px; }
        .fe-explanation .comentario-geral, .fe-explanation .conteudo-completo, .fe-explanation .raciocinio-alternativas, .fe-explanation .contexto-especifico { padding: 16px 18px; border-radius: 12px; background: rgba(255,255,255,0.025); border: 1px solid rgba(100,160,255,0.08); margin-bottom: 14px; }
        .fe-explanation .pegadinha { padding: 16px 18px; border-radius: 12px; background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.2); margin-bottom: 14px; }
        .fe-explanation .pegadinha h4 { color: #F59E0B; }
        .fe-explanation .alt-item { display: flex; gap: 12px; align-items: flex-start; padding: 10px 12px; border-radius: 8px; margin-bottom: 6px; background: rgba(255,255,255,0.02); border: 1px solid transparent; }
        .fe-explanation .alt-letra { width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; font-family: 'Sora', sans-serif; }
        .fe-explanation .alt-letra.correta { background: rgba(16,185,129,0.18); color: #6EE7B7; border: 1px solid rgba(16,185,129,0.35); }
        .fe-explanation .alt-letra.incorreta { background: rgba(239,68,68,0.12); color: #FCA5A5; border: 1px solid rgba(239,68,68,0.28); }
        .fe-explanation .alt-texto { font-size: 13px; line-height: 1.6; color: #94A3B8; padding-top: 3px; }

        .fe-next-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #3B7EF8, #1D4ED8);
          color: white; border: none; padding: 13px 28px;
          border-radius: 12px; font-family: 'Sora', sans-serif;
          font-size: 14px; font-weight: 700; cursor: pointer;
          box-shadow: 0 4px 20px rgba(59,126,248,0.3);
          transition: all 0.2s;
        }
        .fe-next-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(59,126,248,0.45); }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#030812', fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden' }}>
        {/* Ambient glows */}
        <div style={{ position: 'fixed', top: '-15%', right: '5%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,126,248,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        {/* ── Header ── */}
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(3,8,18,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(100,160,255,0.08)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/" style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 800, color: '#EBF4FF', textDecoration: 'none', letterSpacing: '-0.02em' }}>
              Roko<span style={{ color: '#3B7EF8' }}>Med</span>
            </Link>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4F6D8C' }}>
                Questão {currentIndex + 1} / {questions.length}
              </span>
            </div>
            <Link to="/" style={{ fontFamily: "'Sora', sans-serif", fontSize: '12px', fontWeight: 600, color: '#4F6D8C', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'color 0.2s' }}>
              Sair
            </Link>
          </div>

          {/* Progress bar */}
          <div style={{ height: '3px', background: 'rgba(255,255,255,0.04)' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #3B7EF8, #14B8A6)', transition: 'width 0.4s ease', borderRadius: '99px' }} />
          </div>
        </header>

        {/* ── Main ── */}
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem 6rem', position: 'relative', zIndex: 1, animation: animating ? 'fe-slideOut 0.3s ease both' : 'fe-slideIn 0.35s ease both' }}>

          {/* Meta badges */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {q.institution && (
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(100,160,255,0.07)', border: '1px solid rgba(100,160,255,0.14)', color: '#7B9DBF', padding: '5px 12px', borderRadius: '99px' }}>
                {q.institution.acronym || q.institution.name}{q.year ? ` · ${q.year}` : ''}
              </span>
            )}
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(59,126,248,0.1)', border: '1px solid rgba(59,126,248,0.22)', color: '#93C5FD', padding: '5px 12px', borderRadius: '99px' }}>
              {q.specialty?.name || 'Geral'}
            </span>
          </div>

          {/* Question statement */}
          <div
            dangerouslySetInnerHTML={{ __html: q.statement }}
            style={{ fontSize: '16px', lineHeight: 1.75, color: '#C8DCF5', marginBottom: '2.5rem', fontFamily: "'Inter', sans-serif" }}
          />

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2.5rem' }}>
            {Array.isArray(parsedOpts) && parsedOpts.map((opt: any) => {
              const isSelected = answeredLetter === opt.letter
              const isCorrect = isAnswered && opt.letter === q.correctOption
              const isWrong = isAnswered && isSelected && opt.letter !== q.correctOption

              let cls = 'fe-option-btn'
              if (isCorrect) cls += ' correct'
              else if (isWrong) cls += ' wrong'
              else if (isSelected) cls += ' selected-neutral'
              if (isAnswered) cls += ' answered'

              return (
                <button
                  key={opt.letter}
                  className={cls}
                  onClick={() => handleSelectOption(opt.letter)}
                >
                  <span className="fe-letter">{opt.letter}</span>
                  <span dangerouslySetInnerHTML={{ __html: opt.text }} style={{ flex: 1 }} />
                  {isCorrect && <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />}
                  {isWrong && <XCircle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {isAnswered && (
            <div style={{ animation: 'fe-revealExpl 0.4s ease both' }}>
              <div style={{ background: 'rgba(7,15,30,0.8)', border: '1px solid rgba(59,126,248,0.18)', borderRadius: '16px', padding: '24px', marginBottom: '2rem', backdropFilter: 'blur(12px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B7EF8' }} />
                  <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#3B7EF8' }}>Resolução RokoMed</span>
                </div>
                <div
                  className="fe-explanation"
                  dangerouslySetInnerHTML={{ __html: q.explanation || 'Nenhum comentário disponível para esta questão no momento.' }}
                  style={{ fontSize: '14px', lineHeight: 1.7, color: '#94A3B8' }}
                />
              </div>

              {/* Next button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="fe-next-btn" onClick={handleNext}>
                  {currentIndex < questions.length - 1 ? 'Próxima Questão' : 'Ver Resultado Final'}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Bottom CTA bar (before answering) */}
          {!isAnswered && (
            <div style={{ marginTop: '3rem', padding: '16px 20px', background: 'rgba(59,126,248,0.04)', border: '1px solid rgba(59,126,248,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <p style={{ fontSize: '13px', color: '#4F6D8C', margin: 0 }}>Selecione uma alternativa para continuar</p>
              <Link
                to="/register"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontFamily: "'Sora', sans-serif", fontWeight: 700, color: '#3B7EF8', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em' }}
              >
                Criar conta grátis <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
