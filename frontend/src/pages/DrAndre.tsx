import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiApi } from '../lib/api'
import { useAuthStore } from '../store/auth'
import toast from 'react-hot-toast'
import {
  Sparkles, Send, Trash2, ShieldAlert, Cpu, CheckCircle, Clock, ArrowLeft
} from 'lucide-react'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export default function DrAndrePage() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const [inputText, setInputText] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Query message history and credits
  const { data: aiData, isLoading } = useQuery<any>({
    queryKey: ['ai-history'],
    queryFn: aiApi.getHistory,
  })

  // Mutation to send messages
  const askMutation = useMutation({
    mutationFn: (content: string) => aiApi.ask(content),
    onSuccess: (data) => {
      setInputText('')
      qc.invalidateQueries({ queryKey: ['ai-history'] })
      // Scroll to bottom
      setTimeout(() => scrollToBottom(), 50)
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || 'Erro ao enviar mensagem para o tutor.'
      toast.error(msg)
    }
  })

  // Mutation to clear chat history
  const clearMutation = useMutation({
    mutationFn: aiApi.clear,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-history'] })
      toast.success('Histórico de conversas limpo!')
    },
    onError: (err: any) => {
      toast.error('Não foi possível limpar o histórico.')
    }
  })

  // Scroll helper
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Scroll to bottom on load or list updates
  useEffect(() => {
    if (aiData?.history?.length > 0) {
      scrollToBottom()
    }
  }, [aiData])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    if (askMutation.isPending) return

    // Verify credits limit before sending client-side
    const used = aiData?.creditsUsed || 0
    const limit = aiData?.creditsLimit || (user?.plan === 'FREE' ? 5 : 50)

    if (used >= limit) {
      toast.error(`Você atingiu seu limite de mensagens mensais (${used}/${limit}).`)
      return
    }

    askMutation.mutate(inputText)
  }

  const handleClearChat = () => {
    if (window.confirm('Tem certeza que deseja apagar todo o histórico de conversas com o Dr. André?')) {
      clearMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
        <Cpu size={24} className="animate-spin" style={{ marginRight: '8px' }} />
        Chamando Dr. André...
      </div>
    )
  }

  const messages: Message[] = aiData?.history || []
  const creditsUsed = aiData?.creditsUsed || 0
  const creditsLimit = aiData?.creditsLimit || (user?.plan === 'FREE' ? 5 : 50)
  const remaining = Math.max(0, creditsLimit - creditsUsed)
  const creditsPercent = (creditsUsed / creditsLimit) * 100

  return (
    <div className="animate-fade-in" style={{
      maxWidth: 900,
      margin: '0 auto',
      height: 'calc(100vh - 120px)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, sans-serif'
    }}>
      
      {/* ── Top Panel Header ── */}
      <div className="glass" style={{
        padding: '1.25rem 1.75rem',
        borderRadius: '16px 16px 0 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* AI Avatar */}
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B82F6 0%, #1E3A8A 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid rgba(99, 179, 237, 0.4)',
            boxShadow: '0 0 15px rgba(59,130,246,0.3)',
            color: 'white',
            fontWeight: 800,
            fontSize: '1rem',
            fontFamily: 'Outfit'
          }}>
            DA
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, color: 'white', fontSize: '1.05rem', fontFamily: 'Outfit' }}>Dr. André</span>
              <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(59,130,246,0.15)', color: '#93C5FD', fontWeight: 700, border: '1px solid rgba(59,130,246,0.25)' }}>
                IA TUTOR
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
              Analista de desempenho ativo
            </div>
          </div>
        </div>

        {/* Credit Tracker & Clean buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          
          <div style={{ width: '160px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
              <span>Mensagens do Mês:</span>
              <span style={{ fontWeight: 700, color: remaining <= 2 ? '#EF4444' : 'white' }}>{creditsUsed}/{creditsLimit}</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                background: remaining <= 2 ? 'linear-gradient(90deg,#EF4444,#F87171)' : 'linear-gradient(90deg,#3B82F6,#14B8A6)',
                width: `${creditsPercent}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="btn btn-ghost"
              style={{ padding: '8px 12px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, color: '#F87171', fontSize: '0.8rem' }}
            >
              <Trash2 size={13} /> Limpar
            </button>
          )}
        </div>
      </div>

      {/* ── Messenger Screen ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '2rem 1.75rem',
        background: 'rgba(15, 23, 42, 0.25)',
        borderLeft: '1px solid rgba(255,255,255,0.04)',
        borderRight: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        
        {/* Welcome message when history is empty */}
        {messages.length === 0 && (
          <div style={{
            maxWidth: '520px',
            margin: '2rem auto',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12
          }} className="animate-fade-in">
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: 'rgba(59,130,246,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)', marginBottom: 8
            }}>
              <Sparkles size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', margin: 0, fontFamily: 'Outfit' }}>Tire dúvidas com o Dr. André</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
              Como seu tutor pessoal de inteligência artificial, o Dr. André sabe toda a sua acurácia acadêmica no RokoMed. Ele pode te indicar no que focar nos estudos, ajudar a revisar casos ou detalhar qualquer conceito das disciplinas médicas!
            </p>
            
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
              {[
                'Quais são minhas maiores fraquezas nos estudos?',
                'Explique os critérios de Duke para Endocardite',
                'Como posso melhorar meu cronograma essa semana?',
                'Quais os principais sinais do Choque Neurogênico?'
              ].map(suggest => (
                <button
                  key={suggest}
                  onClick={() => setInputText(suggest)}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 99, padding: '8px 14px', fontSize: '0.75rem',
                    color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'
                    e.currentTarget.style.color = '#FFF'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                >
                  {suggest}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubble loop */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user'

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                animation: 'fade-in 0.25s ease-out-in'
              }}
            >
              <div style={{
                maxWidth: '70%',
                background: isUser ? 'var(--accent-blue)' : 'rgba(30, 41, 59, 0.45)',
                border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                padding: '12px 18px',
                color: isUser ? 'white' : '#E2E8F0',
                fontSize: '0.925rem',
                lineHeight: 1.6,
                boxShadow: isUser ? '0 4px 15px rgba(59,130,246,0.15)' : '0 4px 10px rgba(0,0,0,0.15)',
                whiteSpace: 'pre-line'
              }}>
                {msg.content}
                
                <div style={{
                  fontSize: '0.675rem',
                  color: isUser ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)',
                  marginTop: 6,
                  textAlign: 'right'
                }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {askMutation.isPending && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              background: 'rgba(30, 41, 59, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '16px 16px 16px 2px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Dr. André está formulando a resposta</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <span className="dot" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-blue)', animation: 'pulse-dot 1s infinite 0.1s' }}></span>
                <span className="dot" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-blue)', animation: 'pulse-dot 1s infinite 0.2s' }}></span>
                <span className="dot" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-blue)', animation: 'pulse-dot 1s infinite 0.3s' }}></span>
              </div>
              <style>{`
                @keyframes pulse-dot {
                  0%, 100% { transform: scale(1); opacity: 0.4; }
                  50% { transform: scale(1.4); opacity: 1; }
                }
              `}</style>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Input Send Panel ── */}
      <form onSubmit={handleSend} className="glass" style={{
        padding: '1.25rem 1.75rem',
        borderRadius: '0 0 16px 16px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'linear-gradient(0deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%)',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center'
      }}>
        <input
          id="ai-input"
          type="text"
          disabled={askMutation.isPending}
          placeholder={remaining === 0 ? 'Créditos mensais esgotados.' : 'Digite sua dúvida médica ou peça dicas de estudo...'}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="input"
          style={{ flex: 1, borderRadius: 12, padding: '12px 16px' }}
        />

        <button
          type="submit"
          disabled={askMutation.isPending || !inputText.trim() || remaining === 0}
          className="btn btn-primary"
          style={{
            borderRadius: 12, width: 46, height: 46, padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}
        >
          <Send size={18} />
        </button>
      </form>

    </div>
  )
}
