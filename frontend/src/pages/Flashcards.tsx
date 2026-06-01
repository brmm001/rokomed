import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { flashcardApi } from '../lib/api'
import { useAuthStore } from '../store/auth'
import { Layers, CheckCircle2, ChevronRight, HelpCircle, Trophy, Crown } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FlashcardsPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  // Queries
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['flashcard-stats'],
    queryFn: flashcardApi.stats,
  })

  const { data: dueCards, refetch: refetchCards, isLoading } = useQuery({
    queryKey: ['flashcard-list'],
    queryFn: flashcardApi.list,
  })

  const cardsList = dueCards?.data || []
  const hasCards = cardsList.length > 0
  const isFinished = hasCards && currentIndex >= cardsList.length
  const currentCard = hasCards && !isFinished ? cardsList[currentIndex] : null

  const handleReview = async (quality: 'EASY' | 'MEDIUM' | 'HARD') => {
    if (!currentCard) return

    try {
      await flashcardApi.review(currentCard.id, quality)
      toast.success('Revisão registrada!')
      
      // Animação de desvirar
      setIsFlipped(false)
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
        refetchStats()
      }, 300)
    } catch (err) {
      toast.error('Erro ao salvar revisão')
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: '3rem' }}>
      <style>{`
        .flashcard-card-container {
          perspective: 1000px;
          width: 100%;
          max-width: 550px;
          height: 340px;
          cursor: pointer;
          margin: 0 auto;
        }
        .flashcard-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        .flashcard-card-container.flipped .flashcard-card-inner {
          transform: rotateY(180deg);
        }
        .flashcard-card-front, .flashcard-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 20px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
          overflow-y: auto;
        }
        .flashcard-card-front {
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
          justify-content: center;
          align-items: center;
        }
        .flashcard-card-back {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: var(--text-primary);
          transform: rotateY(180deg);
        }
        .flashcard-content {
          font-size: 1.125rem;
          line-height: 1.6;
          text-align: center;
          width: 100%;
        }
        .flashcard-content p, .flashcard-content div {
          margin-bottom: 0.5rem;
        }
        .quality-btn {
          flex: 1;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
          border: none;
          color: white;
          text-align: center;
        }
        .quality-btn:hover {
          transform: translateY(-2px);
        }
        .btn-hard {
          background: #EF4444;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
        }
        .btn-hard:hover {
          background: #DC2626;
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
        }
        .btn-medium {
          background: #F59E0B;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
        }
        .btn-medium:hover {
          background: #D97706;
          box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
        }
        .btn-easy {
          background: #10B981;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        }
        .btn-easy:hover {
          background: #059669;
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Layers color="var(--accent-blue)" /> Flashcards
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Revisão inteligente com repetição espaçada (SM-2)
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        <div className="glass" style={{ padding: '1.25rem', borderRadius: 16, textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
            {stats?.total ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
            Total Criados
          </div>
        </div>
        <div className="glass" style={{ padding: '1.25rem', borderRadius: 16, textAlign: 'center', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FBBF24', fontFamily: 'Outfit' }}>
            {stats?.pending ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
            Pendentes Hoje
          </div>
        </div>
        <div className="glass" style={{ padding: '1.25rem', borderRadius: 16, textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-teal)', fontFamily: 'Outfit' }}>
            {stats?.today ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
            Gerados Hoje
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <span className="loader" style={{ width: 40, height: 40 }} />
        </div>
      ) : isFinished || !hasCards ? (
        /* Completion Screen */
        <div className="glass animate-fade-in" style={{ padding: '3.5rem 2rem', borderRadius: 24, textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.05) 100%)',
            border: '2px solid #10B981',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)'
          }}>
            <Trophy size={36} color="#10B981" />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            {hasCards ? 'Sessão Concluída!' : 'Nenhum flashcard pendente'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 450, margin: '0 auto 2rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
            {hasCards
              ? 'Parabéns! Você revisou todas as cartas pendentes para hoje. Continue respondendo questões para fixar o aprendizado.'
              : 'Você está em dia com seus estudos! À medida que você responde questões no banco de dados, flashcards são criados automaticamente.'
            }
          </p>

          <button
            onClick={() => navigate('/questoes')}
            className="btn btn-primary"
            style={{ padding: '0.85rem 2rem', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            Ir para o Banco de Questões <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        /* Review flow */
        <div className="animate-fade-in">
          {/* Progress Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <span>Revisando {currentIndex + 1} de {cardsList.length}</span>
            <span>{Math.round(((currentIndex) / cardsList.length) * 100)}% concluído</span>
          </div>
          
          <div style={{ width: '100%', height: 6, background: 'var(--border)', borderRadius: 3, marginBottom: '2rem', overflow: 'hidden' }}>
            <div style={{ width: `${((currentIndex) / cardsList.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-teal))', borderRadius: 3, transition: 'width 0.3s ease' }} />
          </div>

          {/* Flashcard Component */}
          <div
            className={`flashcard-card-container ${isFlipped ? 'flipped' : ''}`}
            onClick={() => setIsFlipped(f => !f)}
          >
            <div className="flashcard-card-inner">
              {/* Front side */}
              <div className="flashcard-card-front">
                <div style={{ position: 'absolute', top: '1.25rem', left: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <HelpCircle size={14} /> Pergunta
                </div>
                <div
                  className="flashcard-content"
                  dangerouslySetInnerHTML={{ __html: currentCard?.front || '' }}
                />
                <div style={{ position: 'absolute', bottom: '1.25rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>
                  Clique para revelar a resposta
                </div>
              </div>

              {/* Back side */}
              <div className="flashcard-card-back" onClick={(e) => e.stopPropagation()}>
                <div style={{ position: 'absolute', top: '1.25rem', left: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-blue)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <CheckCircle2 size={14} /> Resposta & Explicação
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', width: '100%', overflowY: 'auto', padding: '1rem 0' }}>
                  <div
                    className="flashcard-content"
                    style={{ textAlign: 'left', fontSize: '0.95rem' }}
                    dangerouslySetInnerHTML={{ __html: currentCard?.back || '' }}
                  />
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center' }}>
                  Como foi lembrar desta resposta?
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons (only visible when flipped) */}
          <div style={{ height: 60, marginTop: '2rem', display: 'flex', gap: '1rem', visibility: isFlipped ? 'visible' : 'hidden', opacity: isFlipped ? 1 : 0, transition: 'opacity 0.2s' }}>
            <button className="quality-btn btn-hard" onClick={() => handleReview('HARD')}>
              Difícil
            </button>
            <button className="quality-btn btn-medium" onClick={() => handleReview('MEDIUM')}>
              Médio
            </button>
            <button className="quality-btn btn-easy" onClick={() => handleReview('EASY')}>
              Fácil
            </button>
          </div>
        </div>
      )}

      {/* Upgrade CTA banner for free users */}
      {user?.plan === 'FREE' && (
        <div style={{
          marginTop: '3rem',
          padding: '1.25rem',
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(20,184,166,0.1) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(251, 191, 36, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <Crown size={20} color="#FBBF24" />
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Precisa de mais flashcards?</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              No plano Grátis você gera até 5 flashcards por dia. Assine o Pro para obter flashcards ilimitados!
            </div>
          </div>
          <button
            onClick={() => navigate('/pricing')}
            className="btn btn-primary"
            style={{ fontSize: '0.78rem', padding: '0.5rem 1rem' }}
          >
            Fazer Upgrade
          </button>
        </div>
      )}
    </div>
  )
}
