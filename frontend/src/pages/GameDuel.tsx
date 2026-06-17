import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '../lib/api'
import { Swords, Trophy, Zap, AlertTriangle, ArrowRight, Home, CheckCircle2, XCircle, Clock } from 'lucide-react'
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
}

const BOT_NAMES = [
  { name: 'Dr. Felipe Souza', inst: 'FMUSP', avatar: 'FS' },
  { name: 'Dra. Amanda Silva', inst: 'UNIFESP', avatar: 'AS' },
  { name: 'Dr. Lucas Santos', inst: 'ENARE', avatar: 'LS' },
  { name: 'Dra. Mariana Costa', inst: 'UNICAMP', avatar: 'MC' },
  { name: 'Dr. Ricardo Oliveira', inst: 'UFRJ', avatar: 'RO' },
]

export default function GameDuelPage() {
  const navigate = useNavigate()
  
  // Game states: 'matching' | 'playing' | 'gameover'
  const [gameState, setGameState] = useState<'matching' | 'playing' | 'gameover'>('matching')
  
  // Matchmaking states
  const [botPlayer, setBotPlayer] = useState<typeof BOT_NAMES[0] | null>(null)
  
  // Questions list
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  
  // Scoring & progress
  const [userScore, setUserScore] = useState(0)
  const [botScore, setBotScore] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(15)
  const [userSelected, setUserSelected] = useState<string | null>(null)
  const [botSelected, setBotSelected] = useState<string | null>(null)
  const [revealAnswer, setRevealAnswer] = useState(false)

  // Tracking answers
  const [roundResults, setRoundResults] = useState<{ user: boolean; bot: boolean }[]>([])

  const timerRef = useRef<any>(null)
  const botAnswerTimerRef = useRef<any>(null)

  // Fetch questions
  const { data, error, isLoading } = useQuery<{ questions: Question[] }>({
    queryKey: ['duel-questions'],
    queryFn: async () => {
      const res = await api.get('/games/duel')
      return res.data
    },
    enabled: gameState === 'matching',
    retry: false
  })

  // Submit result mutation
  const submitResult = useMutation({
    mutationFn: async (body: { won: boolean; isTie: boolean; score: number }) => {
      const res = await api.post('/games/duel/result', body)
      return res.data
    },
    onSuccess: (res) => {
      toast.success(`Duelo registrado! Você ganhou +${res.xpGain} XP! 🚀`)
    },
    onError: () => {
      toast.error('Erro ao salvar resultado do duelo.')
    }
  })

  // Matchmaking Simulation
  useEffect(() => {
    if (gameState === 'matching') {
      const randomBot = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]
      setBotPlayer(randomBot)

      const matchTimeout = setTimeout(() => {
        if (data?.questions && data.questions.length > 0) {
          setQuestions(data.questions)
          setGameState('playing')
          startRound()
        } else if (error) {
          toast.error('Não foi possível carregar as questões. Tente novamente.')
          navigate('/games')
        }
      }, 3500) // Matchmaking lasts 3.5s

      return () => clearTimeout(matchTimeout)
    }
  }, [gameState, data, error])

  // Timer logic for playing
  useEffect(() => {
    if (gameState === 'playing' && !revealAnswer) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleTimeOut()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameState, revealAnswer, currentIdx])

  const startRound = () => {
    setUserSelected(null)
    setBotSelected(null)
    setRevealAnswer(false)
    setSecondsLeft(15)

    // Schedule bot to answer at a random time (between 3 and 10 seconds)
    const botDelay = 3000 + Math.random() * 7000
    botAnswerTimerRef.current = setTimeout(() => {
      simulateBotAnswer()
    }, botDelay)
  }

  const simulateBotAnswer = () => {
    if (revealAnswer) return
    
    const currentQuestion = questions[currentIdx]
    if (!currentQuestion) return

    // Bot accuracy probability: ~70%
    const isBotCorrect = Math.random() < 0.7
    let selectedLetter = currentQuestion.correctOption

    if (!isBotCorrect) {
      const wrongOpts = currentQuestion.options.filter(o => o.letter !== currentQuestion.correctOption)
      if (wrongOpts.length > 0) {
        selectedLetter = wrongOpts[Math.floor(Math.random() * wrongOpts.length)].letter
      }
    }

    setBotSelected(selectedLetter)
  }

  const handleUserSelect = (letter: string) => {
    if (userSelected || revealAnswer) return
    setUserSelected(letter)
    
    // If bot has not answered yet, make it answer shortly after user
    if (!botSelected) {
      if (botAnswerTimerRef.current) clearTimeout(botAnswerTimerRef.current)
      botAnswerTimerRef.current = setTimeout(() => {
        simulateBotAnswer()
      }, 800 + Math.random() * 1200)
    }
  }

  // Handle timeout or when both answered
  useEffect(() => {
    if (gameState === 'playing' && (userSelected && botSelected) && !revealAnswer) {
      endRound()
    }
  }, [userSelected, botSelected, gameState])

  const handleTimeOut = () => {
    if (!userSelected) setUserSelected('TIMEOUT')
    if (!botSelected) simulateBotAnswer()
    endRound()
  }

  const endRound = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (botAnswerTimerRef.current) clearTimeout(botAnswerTimerRef.current)
    
    setRevealAnswer(true)
    
    const currentQuestion = questions[currentIdx]
    const userCorrect = userSelected === currentQuestion.correctOption
    // If bot was still pending, force a value
    const finalBotSelected = botSelected || 'TIMEOUT'
    const botCorrect = finalBotSelected === currentQuestion.correctOption

    // Calculate score
    if (userCorrect) {
      // Points based on speed: base 100 + secondsRemaining * 10
      const points = 100 + secondsLeft * 10
      setUserScore(prev => prev + points)
    }

    if (botCorrect) {
      // Simulated speed points
      const botSecondsLeft = Math.max(1, Math.floor(Math.random() * 12))
      const points = 100 + botSecondsLeft * 10
      setBotScore(prev => prev + points)
    }

    setRoundResults(prev => [...prev, { user: userCorrect, bot: botCorrect }])

    // Wait 4 seconds to show answer feedback, then next question
    setTimeout(() => {
      if (currentIdx < 4) {
        setCurrentIdx(prev => prev + 1)
        startRound()
      } else {
        // Game Over!
        setGameState('gameover')
      }
    }, 4000)
  }

  // Trigger game over submission
  useEffect(() => {
    if (gameState === 'gameover') {
      const won = userScore > botScore
      const isTie = userScore === botScore
      submitResult.mutate({ won, isTie, score: userScore })
    }
  }, [gameState])

  // MATCHMAKING RENDER
  if (gameState === 'matching') {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#E2E8F0',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <div style={{
          background: 'rgba(30, 41, 59, 0.45)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 24,
          padding: '4rem 3rem',
          textAlign: 'center',
          maxWidth: 500,
          width: '100%',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
        }}>
          <Swords size={48} className="animate-pulse" color="var(--accent-blue)" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Procurando Duelo</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '3rem' }}>
            Emparelhando você com outro estudante de medicina...
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem' }}>
            {/* User Avatar */}
            <div>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid #60A5FA', fontSize: '1.5rem', fontWeight: 800
              }}>
                VOCÊ
              </div>
              <div style={{ marginTop: 8, fontSize: '0.875rem', fontWeight: 600 }}>Você</div>
            </div>

            {/* Spinner */}
            <div style={{
              width: 32, height: 32,
              border: '4px solid rgba(59, 130, 246, 0.1)',
              borderTop: '4px solid #3B82F6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>

            {/* Opponent Avatar */}
            <div>
              {botPlayer ? (
                <>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #EF4444, #B91C1C)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '3px solid #F87171', fontSize: '1.5rem', fontWeight: 800,
                    animation: 'pulse 1.5s infinite'
                  }}>
                    {botPlayer.avatar}
                  </div>
                  <div style={{ marginTop: 8, fontSize: '0.875rem', fontWeight: 600 }}>{botPlayer.name.split(' ')[0]}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{botPlayer.inst}</div>
                </>
              ) : (
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '3px dashed rgba(255,255,255,0.1)' }} />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // PLAYING RENDER
  if (gameState === 'playing') {
    const currentQ = questions[currentIdx]
    const timerPercent = (secondsLeft / 15) * 100

    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
        
        {/* Top Header info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 24, marginBottom: '2rem' }}>
          
          {/* User Score card */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 14, padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>VC</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Você</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>{userScore} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>pts</span></div>
            </div>
            {userSelected && (
              <div style={{ fontSize: '0.75rem', color: userSelected === 'TIMEOUT' ? '#EF4444' : '#60A5FA', fontWeight: 600 }}>
                {userSelected === 'TIMEOUT' ? 'Tempo esgotado' : `Respondeu ${userSelected}`}
              </div>
            )}
          </div>

          {/* Central Timer & Question count */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Questão {currentIdx + 1}/5</div>
            <div style={{
              marginTop: 6, width: 50, height: 50, borderRadius: '50%',
              background: secondsLeft <= 4 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              border: secondsLeft <= 4 ? '2px solid #EF4444' : '2px solid #3B82F6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit',
              color: secondsLeft <= 4 ? '#EF4444' : 'var(--text-primary)'
            }}>
              {secondsLeft}
            </div>
          </div>

          {/* Bot Score card */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 14, padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 12, textAlign: 'right', flexDirection: 'row-reverse'
          }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>{botPlayer?.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{botPlayer?.name.split(' ')[0]}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>{botScore} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>pts</span></div>
            </div>
            {botSelected && (
              <div style={{ fontSize: '0.75rem', color: botSelected === 'TIMEOUT' ? '#EF4444' : '#F87171', fontWeight: 600 }}>
                Respondeu
              </div>
            )}
          </div>
        </div>

        {/* Global Timer Progress Bar */}
        <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{
            height: '100%',
            background: secondsLeft <= 4 ? 'linear-gradient(90deg, #EF4444, #F87171)' : 'linear-gradient(90deg, #3B82F6, #14B8A6)',
            width: `${timerPercent}%`,
            transition: 'width 1s linear'
          }} />
        </div>

        {/* Rounds Dots Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: '2rem' }}>
          {Array.from({ length: 5 }).map((_, i) => {
            const res = roundResults[i]
            let color = 'rgba(255,255,255,0.1)'
            let icon = null
            
            if (i === currentIdx) {
              color = '#3B82F6'
            } else if (res) {
              if (res.user && res.bot) color = '#10B981'
              else if (res.user) color = '#3B82F6'
              else if (res.bot) color = '#EF4444'
              else color = 'rgba(239, 68, 68, 0.4)'
            }
            
            return (
              <div key={i} style={{
                width: 14, height: 14, borderRadius: '50%',
                background: color,
                transition: 'all 0.3s'
              }} />
            )
          })}
        </div>

        {/* Question Panel */}
        <div className="apple-card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
          
          {/* Question Metadata */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, fontFamily: 'Outfit' }}>
            <span style={{ color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: 4 }}>
              {currentQ?.institution?.acronym || 'Prova'} {currentQ?.year}
            </span>
            <span>•</span>
            <span>{currentQ?.specialty?.name}</span>
          </div>

          {/* Statement */}
          <div 
            dangerouslySetInnerHTML={{ __html: currentQ?.statement || '' }}
            style={{ fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '2rem' }}
          />

          {/* Options list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentQ?.options?.filter(opt => opt.text && opt.text.trim() !== '').map((opt) => {
              const isUserChoice = userSelected === opt.letter
              const isBotChoice = botSelected === opt.letter
              const isCorrect = opt.letter === currentQ.correctOption
              
              let borderColor = 'var(--border)'
              let bg = 'transparent'
              let icon = null
              
              if (revealAnswer) {
                if (isCorrect) {
                  borderColor = 'var(--accent-green)'
                  bg = 'rgba(16, 185, 129, 0.06)'
                  icon = <CheckCircle2 size={18} color="var(--accent-green)" />
                } else if (isUserChoice) {
                  borderColor = '#EF4444'
                  bg = 'rgba(239, 68, 68, 0.06)'
                  icon = <XCircle size={18} color="#EF4444" />
                }
              } else if (isUserChoice) {
                borderColor = 'var(--accent-blue)'
                bg = 'rgba(59, 130, 246, 0.06)'
              }

              return (
                <button
                  key={opt.letter}
                  disabled={userSelected !== null || revealAnswer}
                  onClick={() => handleUserSelect(opt.letter)}
                  style={{
                    textAlign: 'left', padding: '16px 20px', borderRadius: 12, border: '1px solid',
                    borderColor, background: bg, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
                    transition: 'all 0.2s', position: 'relative', width: '100%'
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: isUserChoice ? 'var(--accent-blue)' : 'rgba(255,255,255,0.04)',
                    border: '1px solid',
                    borderColor: isUserChoice ? 'var(--accent-blue)' : 'var(--border)',
                    color: isUserChoice ? 'white' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.875rem'
                  }}>
                    {opt.letter}
                  </div>
                  <div style={{ flex: 1, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{opt.text}</div>
                  
                  {/* Bot selected indicator indicator */}
                  {isBotChoice && (
                    <span style={{
                      background: '#EF4444', color: 'white', fontSize: '0.6rem', fontWeight: 700,
                      padding: '2px 6px', borderRadius: 4, marginRight: 8, textTransform: 'uppercase'
                    }}>
                      {botPlayer?.name.split(' ')[0]}
                    </span>
                  )}
                  {icon}
                </button>
              )
            })}
          </div>
        </div>

        {/* Reveal Explanation Block */}
        {revealAnswer && currentQ?.explanation && (
          <div className="apple-card" style={{ padding: '2rem', borderLeft: '4px solid var(--accent-blue)', background: 'rgba(59, 130, 246, 0.02)' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 700, color: 'var(--accent-blue)' }}>Explicação do Professor</h3>
            <div dangerouslySetInnerHTML={{ __html: currentQ.explanation }} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }} />
          </div>
        )}
      </div>
    )
  }

  // GAMEOVER RENDER
  if (gameState === 'gameover') {
    const isUserWinner = userScore > botScore
    const isTie = userScore === botScore
    
    return (
      <div style={{ maxWidth: 500, margin: '4rem auto', fontFamily: 'Outfit, sans-serif', textAlign: 'center' }} className="animate-fade-in">
        <div className="apple-card" style={{ padding: '4rem 3rem' }}>
          
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: isUserWinner ? 'rgba(16, 185, 129, 0.15)' : isTie ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: isUserWinner ? '2px solid #10B981' : isTie ? '2px solid #F59E0B' : '2px solid #EF4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem'
          }}>
            <Trophy size={40} color={isUserWinner ? '#10B981' : isTie ? '#F59E0B' : '#EF4444'} />
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
            {isUserWinner ? 'Você Venceu! 🎉' : isTie ? 'Empate Técnico! 🤝' : 'Derrota! 😢'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2.5rem' }}>
            {isUserWinner 
              ? `Excelente performance! Você derrotou ${botPlayer?.name}.`
              : isTie 
              ? `Foi por muito pouco! Você e ${botPlayer?.name} empataram.`
              : `Não foi dessa vez! ${botPlayer?.name} levou a melhor.`
            }
          </p>

          {/* Match Score Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 10px', marginBottom: '3rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Sua Pontuação</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-blue)', marginTop: 4 }}>{userScore} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>pts</span></div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Pontuação do Oponente</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#EF4444', marginTop: 4 }}>{botScore} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>pts</span></div>
            </div>
          </div>

          {/* XP Rewards Block */}
          {submitResult.isSuccess && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 14,
              padding: '12px 20px',
              fontSize: '0.9rem',
              color: '#34D399',
              fontWeight: 600,
              marginBottom: '2.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}>
              <Zap size={16} /> +{submitResult.data?.xpGain} XP adicionados à sua conta!
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={() => {
                setGameState('matching')
                setUserScore(0)
                setBotScore(0)
                setCurrentIdx(0)
                setRoundResults([])
              }}
              className="apple-btn"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Jogar Novamente <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/games')}
              style={{
                width: '100%', padding: '12px', border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--text-primary)', borderRadius: 12,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontSize: '0.9375rem', fontWeight: 600, transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Home size={16} /> Voltar ao Menu
            </button>
          </div>

        </div>
      </div>
    )
  }

  return null
}
