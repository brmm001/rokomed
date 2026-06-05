import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { Search, Trophy, CheckCircle2, XCircle, Home, Zap, Loader2, KeyRound, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

type Question = {
  id: string
  statement: string
  options: { letter: string; text: string }[]
  correctOption: string
  explanation?: string
  specialty?: { name: string }
  institution?: { acronym: string; name: string }
  year?: number
  reasoningLine: string[]
}

export default function GamePistaPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Game states: 'playing' | 'gameover'
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing')

  // Clues revealed index (1-based, starts at 1 showing Clue 1)
  const [cluesRevealed, setCluesRevealed] = useState(1)
  
  // Attempts left (starts at 6)
  const [attemptsLeft, setAttemptsLeft] = useState(6)
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null)
  
  // History of incorrect options guessed
  const [incorrectGuesses, setIncorrectGuesses] = useState<string[]>([])
  const [isWin, setIsWin] = useState(false)

  // Fetch Pista question
  const { data: questionData, isLoading, error } = useQuery<Question>({
    queryKey: ['pista-question'],
    queryFn: async () => {
      const res = await api.get('/games/pista/question')
      return res.data
    },
    retry: false
  })

  // Submit result mutation
  const submitResult = useMutation({
    mutationFn: async (body: { score: number; cluesRevealed: number; isWin: boolean }) => {
      const res = await api.post('/games/pista/submit', body)
      return res.data
    },
    onSuccess: (res) => {
      toast.success(`Investigação finalizada! Você ganhou +${res.xpGain} XP! 🔍`)
      queryClient.invalidateQueries({ queryKey: ['game-stats'] })
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || 'Erro ao enviar resultado da Pista Clínica.'
      toast.error(msg)
    }
  })

  const handleRevealClue = () => {
    if (!questionData) return
    if (cluesRevealed < questionData.reasoningLine.length) {
      setCluesRevealed(prev => prev + 1)
      toast.success('Nova pista revelada! 🔍')
    } else {
      toast.error('Todas as pistas disponíveis já foram reveladas.')
    }
  }

  const handleSelectOption = (letter: string) => {
    if (!questionData || selectedOpt || gameState === 'gameover') return

    const isCorrect = letter === questionData.correctOption

    if (isCorrect) {
      setSelectedOpt(letter)
      setIsWin(true)
      setGameState('gameover')
      
      // Calculate score based on clues used
      // 1 clue = 100, 2 clues = 85, 3 clues = 70, etc.
      const score = Math.max(10, 100 - (cluesRevealed - 1) * 15)
      
      submitResult.mutate({
        score,
        cluesRevealed,
        isWin: true
      })
    } else {
      setIncorrectGuesses(prev => [...prev, letter])
      
      setAttemptsLeft(prev => {
        const nextAttempts = prev - 1
        if (nextAttempts <= 0) {
          setSelectedOpt(letter)
          setGameState('gameover')
          submitResult.mutate({
            score: 0,
            cluesRevealed,
            isWin: false
          })
          toast.error('Você esgotou todas as tentativas! Caso encerrado. 💀')
        } else {
          toast.error(`Incorreto! Tentativas restantes: ${nextAttempts}`)
          // Auto reveal next clue if available
          if (cluesRevealed < questionData.reasoningLine.length) {
            setCluesRevealed(curr => curr + 1)
          }
        }
        return nextAttempts
      })
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12 }}>
        <Loader2 size={36} color="var(--accent-blue)" className="animate-spin" />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Carregando caso clínico do dia...</span>
      </div>
    )
  }

  if (error || !questionData) {
    return (
      <div style={{ maxWidth: 500, margin: '4rem auto', textAlign: 'center' }}>
        <div className="apple-card" style={{ padding: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>Nenhum caso disponível</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 10, marginBottom: '2rem' }}>
            Não encontramos um caso clínico com pistas disponível para hoje. Volte mais tarde!
          </p>
          <button onClick={() => navigate('/games')} className="apple-btn" style={{ margin: '0 auto' }}>
            Voltar ao Menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)' }} className="animate-fade-in">
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="apple-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Search size={32} color="var(--accent-gold)" /> Pista Clínica
          </h1>
          <p className="apple-subtitle" style={{ marginTop: 8 }}>
            Investigue o caso clínico do dia analisando as pistas progressivas. Acerte com o menor número de pistas para ganhar mais pontos!
          </p>
        </div>
        
        {/* Status Indicators */}
        <div style={{ display: 'flex', gap: 16 }}>
          {/* Attempts counter */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border)',
            borderRadius: 12, padding: '10px 18px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Tentativas</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit', color: attemptsLeft <= 2 ? '#EF4444' : 'var(--text-primary)', marginTop: 2 }}>
              {attemptsLeft}/6
            </div>
          </div>

          {/* Clues Count */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border)',
            borderRadius: 12, padding: '10px 18px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Pistas Abertas</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--accent-teal)', marginTop: 2 }}>
              {cluesRevealed}/{questionData.reasoningLine.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start', marginBottom: '3rem' }}>
        
        {/* Left Column: Investigation Board */}
        <div>
          {/* Clues Board */}
          <div className="apple-card" style={{ padding: '2.5rem', marginBottom: '2rem', border: '1px solid rgba(245, 158, 11, 0.25)', boxShadow: '0 8px 30px rgba(245, 158, 11, 0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Outfit', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                📋 Quadro de Pistas
              </h2>
              {gameState === 'playing' && cluesRevealed < questionData.reasoningLine.length && (
                <button
                  onClick={handleRevealClue}
                  style={{
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#FBBF24',
                    padding: '8px 16px', borderRadius: 8,
                    fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.12)'}
                >
                  <KeyRound size={14} /> Solicitar Pista
                </button>
              )}
            </div>

            {/* Clues Items list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {questionData.reasoningLine.map((clue, idx) => {
                const isUnlocked = idx < cluesRevealed
                return (
                  <div
                    key={idx}
                    style={{
                      background: isUnlocked ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)',
                      border: '1px solid',
                      borderColor: isUnlocked ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)',
                      borderRadius: 12,
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: isUnlocked ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                      color: isUnlocked ? '#050D1A' : 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.85rem'
                    }}>
                      {idx + 1}
                    </div>
                    
                    <div style={{
                      flex: 1,
                      fontSize: '0.9375rem',
                      color: isUnlocked ? 'white' : 'var(--text-muted)',
                      fontStyle: isUnlocked ? 'normal' : 'italic',
                      lineHeight: 1.5
                    }}>
                      {isUnlocked ? clue : 'Pista trancada... Erre uma opção ou solicite acima para liberar.'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Full Case Statement (only if game over or clues revealed is high enough, or always? Let's show a summary always but complete description is the key study material) */}
          <div className="apple-card" style={{ padding: '2.5rem' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 800, fontFamily: 'Outfit', color: 'white' }}>
              📖 Descrição do Caso Clínico
            </h3>
            <div
              dangerouslySetInnerHTML={{ __html: questionData.statement }}
              style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.6 }}
            />
          </div>

          {/* Explanation detailed */}
          {gameState === 'gameover' && questionData.explanation && (
            <div className="apple-card" style={{ padding: '2.5rem', marginTop: '2rem', borderLeft: '4px solid var(--accent-blue)', background: 'rgba(59, 130, 246, 0.02)' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '1.05rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--accent-blue)' }}>Gabarito & Raciocínio</h3>
              <div dangerouslySetInnerHTML={{ __html: questionData.explanation }} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }} />
            </div>
          )}
        </div>

        {/* Right Column: Answer Guess Panel */}
        <div style={{ position: 'sticky', top: 100 }}>
          {gameState === 'playing' ? (
            <div className="apple-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 16px', letterSpacing: '0.05em' }}>
                Formular Diagnóstico
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {questionData.options.map(opt => {
                  const isIncorrectGuess = incorrectGuesses.includes(opt.letter)
                  
                  let border = '1px solid var(--border)'
                  let bg = 'transparent'
                  let cursor = 'pointer'

                  if (isIncorrectGuess) {
                    border = '1px solid #EF4444'
                    bg = 'rgba(239, 68, 68, 0.04)'
                    cursor = 'not-allowed'
                  }

                  return (
                    <button
                      key={opt.letter}
                      disabled={isIncorrectGuess || gameState === 'gameover'}
                      onClick={() => handleSelectOption(opt.letter)}
                      style={{
                        textAlign: 'left', padding: '14px 16px', borderRadius: 10, border,
                        background: bg, cursor, display: 'flex', alignItems: 'center', gap: 12,
                        transition: 'all 0.15s', width: '100%'
                      }}
                      onMouseEnter={e => {
                        if (!isIncorrectGuess) e.currentTarget.style.borderColor = 'var(--accent-blue)'
                      }}
                      onMouseLeave={e => {
                        if (!isIncorrectGuess) e.currentTarget.style.borderColor = 'var(--border)'
                      }}
                    >
                      <div style={{
                        width: 24, height: 24, borderRadius: 6,
                        background: isIncorrectGuess ? '#EF4444' : 'rgba(255,255,255,0.04)',
                        color: isIncorrectGuess ? 'white' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.8rem'
                      }}>
                        {opt.letter}
                      </div>
                      <span style={{ fontSize: '0.875rem', color: isIncorrectGuess ? 'var(--text-muted)' : 'var(--text-primary)', flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {opt.text}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            // GAME OVER PANEL
            <div className="apple-card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: isWin ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: isWin ? '2px solid #10B981' : '2px solid #EF4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}>
                {isWin ? <CheckCircle2 size={32} color="#10B981" /> : <XCircle size={32} color="#EF4444" />}
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'Outfit', color: 'white', margin: '0 0 4px' }}>
                {isWin ? 'Caso Resolvido! 🏆' : 'Investigação Fracassou! 💀'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                {isWin 
                  ? `Você identificou o diagnóstico correto com ${cluesRevealed} pistas!`
                  : `O diagnóstico correto era a alternativa ${questionData.correctOption}.`
                }
              </p>

              {submitResult.isSuccess && (
                <div style={{
                  background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)',
                  borderRadius: 10, padding: '8px 12px', color: '#34D399', fontSize: '0.8rem',
                  fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}>
                  <Zap size={14} /> +{submitResult.data?.xpGain} XP adicionados!
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() => navigate('/games')}
                  className="apple-btn"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Voltar aos Mini Games <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
