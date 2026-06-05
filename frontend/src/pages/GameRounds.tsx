import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { Trophy, HelpCircle, ArrowRight, Home, CheckCircle2, XCircle, Heart, Clock, Loader2 } from 'lucide-react'
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

type LeaderboardEntry = {
  id: string
  name: string
  picture: string | null
  plan: string
  score: number
  livesLeft: number
  timeSpent: number
}

export default function GameRoundsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  // Tabs: 'play' | 'leaderboard'
  const [activeTab, setActiveTab] = useState<'play' | 'leaderboard'>('play')
  
  // Game states: 'intro' | 'playing' | 'gameover'
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro')
  
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [lives, setLives] = useState(3)
  const [score, setScore] = useState(0)
  
  // Timer for overall round duration
  const [timeSpent, setTimeSpent] = useState(0)
  const overallTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Current question states
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null)
  const [revealAnswer, setRevealAnswer] = useState(false)

  // Questions query (12 daily questions)
  const { data: questionsData, isLoading: loadingQuestions, error: questionsError } = useQuery<{ questions: Question[] }>({
    queryKey: ['rounds-questions'],
    queryFn: async () => {
      const res = await api.get('/games/rounds/questions')
      return res.data
    },
    enabled: gameState === 'playing' && questions.length === 0,
    retry: false
  })

  // Leaderboard query
  const { data: leaderboardData, isLoading: loadingLeaderboard } = useQuery<{ leaderboard: LeaderboardEntry[] }>({
    queryKey: ['rounds-leaderboard'],
    queryFn: async () => {
      const res = await api.get('/games/rounds/leaderboard')
      return res.data
    },
    enabled: activeTab === 'leaderboard' || gameState === 'gameover'
  })

  // Submit result mutation
  const submitResult = useMutation({
    mutationFn: async (body: { score: number; livesLeft: number; timeSpent: number }) => {
      const res = await api.post('/games/rounds/submit', body)
      return res.data
    },
    onSuccess: (res) => {
      toast.success(`Parabéns! Rounds diário enviado. +${res.xpGain} XP obtido! 🌟`)
      queryClient.invalidateQueries({ queryKey: ['rounds-leaderboard'] })
      queryClient.invalidateQueries({ queryKey: ['game-stats'] })
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || 'Erro ao enviar resultado do Rounds.'
      toast.error(msg)
    }
  })

  // Start the game
  const handleStartGame = () => {
    setQuestions([])
    setCurrentIdx(0)
    setLives(3)
    setScore(0)
    setTimeSpent(0)
    setGameState('playing')
  }

  // Populate loaded questions
  useEffect(() => {
    if (questionsData?.questions) {
      setQuestions(questionsData.questions)
      // Start overall timer
      overallTimerRef.current = setInterval(() => {
        setTimeSpent((prev) => prev + 1)
      }, 1000)
    }
  }, [questionsData])

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (overallTimerRef.current) clearInterval(overallTimerRef.current)
    }
  }, [])

  const handleSelectOption = (letter: string) => {
    if (selectedOpt || revealAnswer) return
    setSelectedOpt(letter)
    setRevealAnswer(true)

    const currentQ = questions[currentIdx]
    const isCorrect = letter === currentQ.correctOption

    if (isCorrect) {
      setScore(prev => prev + 1)
      toast.success('Resposta Correta!', { duration: 1500 })
    } else {
      setLives(prev => {
        const nextLives = prev - 1
        if (nextLives === 0) {
          endRound(score) // Game over (loss)
        }
        return nextLives
      })
      toast.error(`Alternativa incorreta! O gabarito é ${currentQ.correctOption}`, { duration: 2000 })
    }
  }

  const handleNextQuestion = () => {
    setSelectedOpt(null)
    setRevealAnswer(false)
    
    if (currentIdx < 11 && lives > 0) {
      setCurrentIdx(prev => prev + 1)
    } else {
      endRound(score + (lives > 0 && selectedOpt === questions[currentIdx].correctOption ? 1 : 0))
    }
  }

  const endRound = (finalScore: number) => {
    if (overallTimerRef.current) clearInterval(overallTimerRef.current)
    setGameState('gameover')
    
    // Submit score
    submitResult.mutate({
      score: finalScore,
      livesLeft: lives,
      timeSpent
    })
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)' }} className="animate-fade-in">
      
      {/* Header Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '2.5rem', gap: 24 }}>
        <button
          onClick={() => { setActiveTab('play'); if(gameState === 'gameover') setGameState('intro'); }}
          style={{
            background: 'none', border: 'none', padding: '12px 6px', fontSize: '1.05rem', fontWeight: 700,
            color: activeTab === 'play' ? 'var(--accent-blue)' : 'var(--text-muted)',
            borderBottom: activeTab === 'play' ? '3px solid var(--accent-blue)' : '3px solid transparent',
            cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Outfit'
          }}
        >
          Desafio Rounds
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          style={{
            background: 'none', border: 'none', padding: '12px 6px', fontSize: '1.05rem', fontWeight: 700,
            color: activeTab === 'leaderboard' ? 'var(--accent-blue)' : 'var(--text-muted)',
            borderBottom: activeTab === 'leaderboard' ? '3px solid var(--accent-blue)' : '3px solid transparent',
            cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Outfit'
          }}
        >
          Classificação Diária
        </button>
      </div>

      {activeTab === 'play' && (
        <>
          {/* INTRO SCREEN */}
          {gameState === 'intro' && (
            <div style={{ maxWidth: 600, margin: '3rem auto', textAlign: 'center' }}>
              <div className="apple-card" style={{ padding: '4rem 3rem' }}>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: '1.5rem' }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Heart key={i} size={40} fill="#EF4444" color="#EF4444" className="animate-pulse" />
                  ))}
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: 'white', marginBottom: '0.75rem' }}>Rounds de Hoje</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.975rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                  Responda a **12 questões diárias** idênticas para todos os participantes do RokoMed. 
                  Você tem apenas **3 corações (vidas)**. Errou, perde vida. Gabarite no menor tempo para liderar o ranking!
                </p>

                <button
                  onClick={handleStartGame}
                  className="apple-btn"
                  style={{ margin: '0 auto', width: '100%', maxWidth: 300, justifyContent: 'center' }}
                >
                  Começar Desafio <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* PLAYING SCREEN */}
          {gameState === 'playing' && (
            <div>
              {loadingQuestions || questions.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: 12 }}>
                  <Loader2 size={36} color="var(--accent-blue)" className="animate-spin" />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Carregando questões do dia...</span>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}>
                  {/* Left Column: Question */}
                  <div>
                    {/* Header info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                        Questão {currentIdx + 1} de 12
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                        <Clock size={16} /> Tempo: {formatTime(timeSpent)}
                      </div>
                    </div>

                    {/* Question Card */}
                    <div className="apple-card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, fontFamily: 'Outfit' }}>
                        <span style={{ color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                          {questions[currentIdx]?.institution?.acronym || 'Prova'} {questions[currentIdx]?.year}
                        </span>
                        <span>•</span>
                        <span>{questions[currentIdx]?.specialty?.name}</span>
                      </div>

                      <div 
                        dangerouslySetInnerHTML={{ __html: questions[currentIdx]?.statement || '' }}
                        style={{ fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '2rem' }}
                      />

                      {/* Options */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {questions[currentIdx]?.options?.map((opt) => {
                          const isChoice = selectedOpt === opt.letter
                          const isCorrect = opt.letter === questions[currentIdx].correctOption
                          
                          let borderColor = 'var(--border)'
                          let bg = 'transparent'
                          let icon = null
                          
                          if (revealAnswer) {
                            if (isCorrect) {
                              borderColor = 'var(--accent-green)'
                              bg = 'rgba(16, 185, 129, 0.06)'
                              icon = <CheckCircle2 size={18} color="var(--accent-green)" />
                            } else if (isChoice) {
                              borderColor = '#EF4444'
                              bg = 'rgba(239, 68, 68, 0.06)'
                              icon = <XCircle size={18} color="#EF4444" />
                            }
                          } else if (isChoice) {
                            borderColor = 'var(--accent-blue)'
                            bg = 'rgba(59, 130, 246, 0.06)'
                          }

                          return (
                            <button
                              key={opt.letter}
                              disabled={revealAnswer}
                              onClick={() => handleSelectOption(opt.letter)}
                              style={{
                                textAlign: 'left', padding: '16px 20px', borderRadius: 12, border: '1px solid',
                                borderColor, background: bg, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
                                transition: 'all 0.2s', width: '100%'
                              }}
                            >
                              <div style={{
                                width: 28, height: 28, borderRadius: 8,
                                background: isChoice ? 'var(--accent-blue)' : 'rgba(255,255,255,0.04)',
                                border: '1px solid',
                                borderColor: isChoice ? 'var(--accent-blue)' : 'var(--border)',
                                color: isChoice ? 'white' : 'var(--text-muted)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: '0.875rem'
                              }}>
                                {opt.letter}
                              </div>
                              <div style={{ flex: 1, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{opt.text}</div>
                              {icon}
                            </button>
                          )
                        })}
                      </div>

                      {revealAnswer && (
                        <button
                          onClick={handleNextQuestion}
                          className="apple-btn"
                          style={{ marginTop: '2.5rem', width: '100%', justifyContent: 'center' }}
                        >
                          {currentIdx === 11 ? 'Finalizar Rounds' : 'Próxima Questão'} <ArrowRight size={16} />
                        </button>
                      )}
                    </div>

                    {/* Explanation */}
                    {revealAnswer && questions[currentIdx]?.explanation && (
                      <div className="apple-card" style={{ padding: '2rem', borderLeft: '4px solid var(--accent-blue)', background: 'rgba(59, 130, 246, 0.02)' }}>
                        <h3 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 700, color: 'var(--accent-blue)' }}>Explicação Detalhada</h3>
                        <div dangerouslySetInnerHTML={{ __html: questions[currentIdx].explanation || '' }} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }} />
                      </div>
                    )}
                  </div>

                  {/* Right Column: Sidebar Stats */}
                  <div style={{ position: 'sticky', top: 100 }}>
                    <div className="apple-card" style={{ padding: '20px', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 16px' }}>Suas Vidas</h3>
                      <div style={{ display: 'flex', gap: 10 }}>
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Heart
                            key={i}
                            size={28}
                            fill={i < lives ? '#EF4444' : 'rgba(255,255,255,0.05)'}
                            color={i < lives ? '#EF4444' : 'rgba(255,255,255,0.1)'}
                            style={{ transition: 'all 0.2s' }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="apple-card" style={{ padding: '20px' }}>
                      <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 16px' }}>Progresso</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 6 }}>
                        <span>Acertos</span>
                        <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{score}</span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', background: 'var(--accent-green)',
                          width: `${((currentIdx) / 12) * 100}%`,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GAMEOVER SCREEN */}
          {gameState === 'gameover' && (
            <div style={{ maxWidth: 500, margin: '3rem auto', textAlign: 'center' }}>
              <div className="apple-card" style={{ padding: '4rem 3rem' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: score >= 10 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: score >= 10 ? '2px solid #10B981' : '2px solid #EF4444',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  <Trophy size={36} color={score >= 10 ? '#10B981' : '#EF4444'} />
                </div>

                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: 'white', marginBottom: '0.5rem' }}>
                  Rounds Concluído!
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                  {score === 12 
                    ? 'Incrível! Você gabaritou as 12 questões de hoje! 🏆' 
                    : score >= 10 
                    ? 'Ótima performance! Você completou com uma excelente taxa de acertos.' 
                    : 'Bom esforço! Continue estudando para melhorar sua pontuação diária.'
                  }
                </p>

                {/* Performance stats */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                  borderRadius: 16, padding: '16px 10px', marginBottom: '2.5rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Acertos</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>{score}/12</div>
                  </div>
                  <div style={{ borderLeft: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Vidas Restantes</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EF4444', marginTop: 4 }}>{lives} ❤️</div>
                  </div>
                  <div style={{ borderLeft: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Tempo Gasto</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-teal)', marginTop: 4 }}>{formatTime(timeSpent)}</div>
                  </div>
                </div>

                {submitResult.isSuccess && (
                  <div style={{
                    background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)',
                    borderRadius: 12, padding: '10px 16px', color: '#34D399', fontSize: '0.85rem',
                    fontWeight: 600, marginBottom: '2.5rem'
                  }}>
                    🌟 +{submitResult.data?.xpGain} XP adicionados ao seu perfil!
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    onClick={() => setActiveTab('leaderboard')}
                    className="apple-btn"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Ver Leaderboard <Trophy size={16} />
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
          )}
        </>
      )}

      {/* LEADERBOARD VIEW */}
      {activeTab === 'leaderboard' && (
        <div className="apple-card" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', color: 'white', margin: '0 0 8px' }}>Ranking Geral do Dia</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2.5rem' }}>
            Estudantes ordenados por número de acertos, vidas restantes e menor tempo gasto nas 12 questões.
          </p>

          {loadingLeaderboard ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
              <Loader2 size={36} color="var(--accent-blue)" className="animate-spin" />
            </div>
          ) : !leaderboardData?.leaderboard || leaderboardData.leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              Nenhum resultado registrado hoje ainda. Seja o primeiro a jogar!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 500 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '12px 16px' }}>Posição</th>
                    <th style={{ padding: '12px 16px' }}>Estudante</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Pontos (Acertos)</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Vidas Restantes</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Tempo</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.leaderboard.map((entry, idx) => {
                    const isTop3 = idx < 3
                    const crownColors = ['#FBBF24', '#94A3B8', '#D97706']
                    
                    return (
                      <tr
                        key={entry.id}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.03)',
                          background: isTop3 ? `rgba(255,255,255,${0.02 - idx * 0.005})` : 'transparent',
                          transition: 'background 0.2s'
                        }}
                      >
                        {/* Position */}
                        <td style={{ padding: '16px', fontWeight: 800, fontSize: '1.1rem', width: 80 }}>
                          {isTop3 ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: crownColors[idx] }}>
                              👑 {idx + 1}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', paddingLeft: 8 }}>{idx + 1}</span>
                          )}
                        </td>
                        
                        {/* Profile name and avatar */}
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: '#1E3A8A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: '0.75rem', color: '#93C5FD', overflow: 'hidden'
                            }}>
                              {entry.picture ? <img src={entry.picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : entry.name[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>
                                {entry.name}
                              </div>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{entry.plan} Member</span>
                            </div>
                          </div>
                        </td>
                        
                        {/* Score */}
                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                          {entry.score}/12
                        </td>
                        
                        {/* Lives left */}
                        <td style={{ padding: '16px', textAlign: 'center', color: '#EF4444', fontSize: '0.9rem' }}>
                          {Array.from({ length: entry.livesLeft }).map((_, i) => '❤️').join('') || '💀'}
                        </td>
                        
                        {/* Time spent */}
                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent-teal)' }}>
                          {formatTime(entry.timeSpent)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
