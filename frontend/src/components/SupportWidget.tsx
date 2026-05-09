import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, ChevronLeft, Plus, ShieldCheck } from 'lucide-react'
import { supportApi } from '../lib/api'
import { useAuthStore } from '../store/auth'
import toast from 'react-hot-toast'

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  sender?: { name: string; role: string }
}

interface Ticket {
  id: string
  subject: string
  status: string
  messages: Message[]
  updatedAt: string
}

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null)
  const [view, setView] = useState<'list' | 'chat' | 'new'>('list')
  const [subject, setSubject] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const user = useAuthStore(state => state.user)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && user) loadTickets()
  }, [isOpen, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeTicketId, tickets])

  const loadTickets = async () => {
    try {
      const res = await supportApi.tickets()
      setTickets(res.tickets)
      if (res.tickets.length === 0) setView('new')
      else setView('list')
    } catch (err) { console.error(err) }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !newMessage.trim()) return
    setLoading(true)
    try {
      const res = await supportApi.createTicket(subject, newMessage)
      setTickets([res.ticket, ...tickets])
      setActiveTicketId(res.ticket.id)
      setView('chat')
      setSubject('')
      setNewMessage('')
    } catch {
      toast.error('Erro ao criar ticket')
    } finally { setLoading(false) }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeTicketId) return
    setLoading(true)
    try {
      const res = await supportApi.sendMessage(activeTicketId, newMessage)
      setTickets(tickets.map(t =>
        t.id === activeTicketId ? { ...t, messages: [...t.messages, res.message] } : t
      ))
      setNewMessage('')
    } catch {
      toast.error('Erro ao enviar mensagem')
    } finally { setLoading(false) }
  }

  const openTicket = (id: string) => {
    setActiveTicketId(id)
    setView('chat')
  }

  const activeTicket = tickets.find(t => t.id === activeTicketId)

  if (!user) return null

  return (
    <>
      {/* Botão flutuante */}
      <button
        id="support-widget-toggle"
        onClick={() => setIsOpen(v => !v)}
        title="Suporte"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, #111111, #1D4ED8)',
          border: 'none', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(29,78,216,0.4)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {isOpen
          ? <X size={20} color="white" />
          : <MessageCircle size={20} color="white" />
        }
      </button>

      {/* Janela */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 88, right: 24, zIndex: 999,
          width: 360, height: 500,
          background: 'white', borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          fontFamily: "'Inter', sans-serif",
          border: '1px solid rgba(0,0,0,0.06)',
          animation: 'fadeInUp 0.2s ease',
        }}>
          {/* Header */}
          <div style={{
            background: '#111111', color: 'white',
            padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            {(view === 'chat' || view === 'new') && (
              <button
                onClick={() => setView(tickets.length ? 'list' : 'new')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: 0, display: 'flex' }}
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Suporte RokoMed</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
                {view === 'chat' && activeTicket ? activeTicket.subject : 'Seus tickets de suporte'}
              </div>
            </div>
            {view === 'list' && (
              <button
                onClick={() => setView('new')}
                title="Novo ticket"
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', borderRadius: 8, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, color: 'white', fontSize: '0.7rem' }}
              >
                <Plus size={12} /> Novo
              </button>
            )}
          </div>

          {/* Corpo */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* ── Lista de tickets ── */}
            {view === 'list' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tickets.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', gap: 8 }}>
                    <MessageCircle size={32} style={{ opacity: 0.3 }} />
                    <span style={{ fontSize: '0.85rem' }}>Nenhum ticket ainda</span>
                    <button onClick={() => setView('new')} style={{ fontSize: '0.8rem', color: '#1D4ED8', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                      Abrir chamado
                    </button>
                  </div>
                ) : tickets.map(t => (
                  <button
                    key={t.id}
                    onClick={() => openTicket(t.id)}
                    style={{
                      background: '#FAFAFA', border: '1px solid #E5E7EB', borderRadius: 12,
                      padding: '12px 14px', cursor: 'pointer', textAlign: 'left', width: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#111111' }}>{t.subject}</span>
                      <span style={{
                        fontSize: '0.6rem', padding: '2px 6px', borderRadius: 99, flexShrink: 0,
                        background: t.status === 'OPEN' ? '#DBEAFE' : '#F3F4F6',
                        color: t.status === 'OPEN' ? '#1D4ED8' : '#6B7280',
                      }}>
                        {t.status === 'OPEN' ? 'Aberto' : 'Fechado'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: 4 }}>
                      {t.messages.length} {t.messages.length === 1 ? 'mensagem' : 'mensagens'} · {new Date(t.updatedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* ── Chat ── */}
            {view === 'chat' && activeTicket && (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10, background: '#F9FAFB' }}>
                  {activeTicket.messages.map(msg => {
                    const isMe = msg.senderId === user.id
                    return (
                      <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                        {!isMe && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3, fontSize: '0.62rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                            <ShieldCheck size={10} color="#1D4ED8" /> Equipe RokoMed
                          </div>
                        )}
                        <div style={{
                          maxWidth: '85%', padding: '9px 13px', borderRadius: 16, fontSize: '0.85rem', lineHeight: 1.5,
                          ...(isMe
                            ? { background: '#1D4ED8', color: 'white', borderBottomRightRadius: 4 }
                            : { background: 'white', color: '#111111', border: '1px solid #E5E7EB', borderBottomLeftRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }
                          )
                        }}>
                          {msg.content}
                        </div>
                        <div style={{ fontSize: '0.62rem', color: '#9CA3AF', marginTop: 3 }}>
                          {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} style={{ padding: '10px 12px', borderTop: '1px solid #E5E7EB', background: 'white', display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Escreva uma mensagem..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    style={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: 12, padding: '8px 12px', fontSize: '0.85rem', outline: 'none' }}
                    required
                  />
                  <button type="submit" disabled={loading} style={{
                    background: '#1D4ED8', color: 'white', border: 'none', borderRadius: 12,
                    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0, opacity: loading ? 0.6 : 1,
                  }}>
                    <Send size={14} />
                  </button>
                </form>
              </>
            )}

            {/* ── Novo ticket ── */}
            {view === 'new' && (
              <form onSubmit={handleCreateTicket} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16, gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                    Assunto
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Dúvida sobre o plano..."
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                    Sua mensagem
                  </label>
                  <textarea
                    placeholder="Descreva sua dúvida em detalhes..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    style={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', fontSize: '0.875rem', resize: 'none', outline: 'none', fontFamily: 'inherit', minHeight: 120 }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: '#111111', color: 'white', border: 'none', borderRadius: 12,
                    padding: '12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  <Send size={14} /> {loading ? 'Enviando...' : 'Enviar mensagem'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
