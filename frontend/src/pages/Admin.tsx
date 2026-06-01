import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, lessonsApi } from '../lib/api'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, BookOpen, Users, FileText,
  Plus, Trash2, ShieldOff, ShieldCheck, RefreshCw,
  AlertTriangle, BookMarked, MessageSquare, ShoppingCart,
  Send, CheckCircle, Clock, Mail, Handshake, MousePointerClick,
  Play, Video, Edit
} from 'lucide-react'

type AdminTab = 'stats' | 'questions' | 'users' | 'logs' | 'support' | 'leads' | 'partnerships' | 'clicks' | 'lessons'

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('stats')
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [partnerFilter, setPartnerFilter] = useState<{ type: string; status: string }>({ type: '', status: '' })
  const [partnerNotes, setPartnerNotes] = useState<Record<string, string>>({})
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [editingLesson, setEditingLesson] = useState<{
    id?: string
    title: string
    description: string
    videoUrl: string
    durationMin: number
    specialtyId: string
  } | null>(null)
  const qc = useQueryClient()

  const { data: stats,   isLoading: statsLoading   } = useQuery({ queryKey: ['admin-stats'],   queryFn: adminApi.stats })
  const { data: qData,   isLoading: qLoading        } = useQuery({ queryKey: ['admin-questions'], queryFn: () => adminApi.questions(), enabled: tab === 'questions' })
  const { data: uData,   isLoading: uLoading        } = useQuery({ queryKey: ['admin-users'],     queryFn: () => adminApi.users(),     enabled: tab === 'users' })
  const { data: logs,    isLoading: logsLoading     } = useQuery({ queryKey: ['admin-logs'],      queryFn: () => adminApi.logs(),      enabled: tab === 'logs' })
  const { data: tickets, isLoading: ticketsLoading  } = useQuery({ queryKey: ['admin-support'],   queryFn: adminApi.supportTickets,    enabled: tab === 'support' })
  const { data: ticketDetail } = useQuery({ queryKey: ['admin-ticket', selectedTicketId], queryFn: () => adminApi.supportTicket(selectedTicketId!), enabled: !!selectedTicketId })
  const { data: leads,    isLoading: leadsLoading    } = useQuery({ queryKey: ['admin-leads'],        queryFn: adminApi.abandonedCheckouts, enabled: tab === 'leads' })
  const { data: partnerships, isLoading: partnershipsLoading } = useQuery({
    queryKey: ['admin-partnerships', partnerFilter],
    queryFn: () => adminApi.partnerships({ type: partnerFilter.type || undefined, status: partnerFilter.status || undefined }),
    enabled: tab === 'partnerships',
  })
  const { data: clicksData, isLoading: clicksLoading } = useQuery({
    queryKey: ['admin-clicks'],
    queryFn: adminApi.clicks,
    enabled: tab === 'clicks',
  })

  const deleteQ = useMutation({
    mutationFn: (id: string) => adminApi.deleteQuestion(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-questions'] }); toast.success('Questão deletada') },
  })

  // Lessons mutations & queries
  const { data: specialtiesData } = useQuery({
    queryKey: ['admin-specialties-lessons'],
    queryFn: adminApi.specialties,
    enabled: (tab as string) === 'lessons' || (showLessonModal && (tab as string) === 'lessons')
  })

  const { data: lessonsGrouped, isLoading: lessonsLoading } = useQuery({
    queryKey: ['admin-lessons-grouped'],
    queryFn: lessonsApi.list,
    enabled: (tab as string) === 'lessons'
  })

  const createLesson = useMutation({
    mutationFn: (data: Record<string, any>) => adminApi.createLesson(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-lessons-grouped'] })
      setShowLessonModal(false)
      setEditingLesson(null)
      toast.success('Aula criada com sucesso!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Erro ao criar aula')
    }
  })

  const updateLesson = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) => adminApi.updateLesson(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-lessons-grouped'] })
      setShowLessonModal(false)
      setEditingLesson(null)
      toast.success('Aula atualizada com sucesso!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Erro ao atualizar aula')
    }
  })

  const deleteLesson = useMutation({
    mutationFn: (id: string) => adminApi.deleteLesson(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-lessons-grouped'] })
      toast.success('Aula deletada com sucesso!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Erro ao deletar aula')
    }
  })

  const banUser = useMutation({
    mutationFn: ({ id, banned }: { id: string; banned: boolean }) => adminApi.banUser(id, banned),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Usuário atualizado') },
  })

  const sendReply = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => adminApi.supportReply(id, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-ticket', selectedTicketId] })
      qc.invalidateQueries({ queryKey: ['admin-support'] })
      setReplyText('')
      toast.success('Resposta enviada!')
    },
  })

  const setTicketStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.supportSetStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-support'] }); qc.invalidateQueries({ queryKey: ['admin-ticket', selectedTicketId] }) },
  })

  const updatePartner = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: string; notes?: string } }) =>
      adminApi.updatePartnershipLead(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-partnerships'] }); toast.success('Atualizado!') },
  })

  const deletePartner = useMutation({
    mutationFn: (id: string) => adminApi.deletePartnershipLead(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-partnerships'] }); toast.success('Lead removido') },
  })

  const tabs = [
    { id: 'stats',        label: 'Visão geral',  icon: <LayoutDashboard size={16} /> },
    { id: 'questions',    label: 'Questões',      icon: <BookOpen size={16} /> },
    { id: 'users',        label: 'Usuários',      icon: <Users size={16} /> },
    { id: 'lessons',      label: 'Aulas',         icon: <Play size={16} /> },
    { id: 'leads',        label: 'Leads',         icon: <ShoppingCart size={16} /> },
    { id: 'clicks',       label: 'Cliques',       icon: <MousePointerClick size={16} /> },
    { id: 'support',      label: 'Suporte',       icon: <MessageSquare size={16} /> },
    { id: 'partnerships', label: 'Parcerias',     icon: <Handshake size={16} /> },
    { id: 'logs',         label: 'Logs',          icon: <FileText size={16} /> },
  ] as const

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.625rem', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <ShieldCheck size={24} color="var(--accent-blue)" /> Administração
        </h1>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tabs.map(({ id, label, icon }) => (
          <button
            key={id}
            id={`admin-tab-${id}`}
            className={`btn ${tab === id ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab(id)}
            style={{ fontSize: '0.875rem' }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* ── Stats Tab ──────────────────────────────────────────────────────── */}
      {tab === 'stats' && (
        <div className="animate-fade-in">
          {statsLoading ? (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass" style={{ flex: '1 1 160px', height: 100, borderRadius: 14, opacity: 0.4 }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Questões',      value: stats?.totalQuestions, color: 'var(--accent-blue)',  icon: <BookOpen size={20} /> },
                { label: 'Usuários',      value: stats?.totalUsers,     color: 'var(--accent-teal)',  icon: <Users size={20} /> },
                { label: 'Respostas',     value: stats?.totalAnswers,   color: 'var(--accent-green)', icon: <BookMarked size={20} /> },
                { label: 'Novos Hoje',    value: stats?.usersToday,     color: 'var(--accent-gold)',  icon: <Plus size={20} /> },
                { label: 'Sinalizadas',   value: stats?.flaggedQuestions, color: '#F97316',           icon: <AlertTriangle size={20} /> },
                { label: 'IPs suspeitos', value: stats?.suspiciousIps,  color: 'var(--accent-red)',   icon: <ShieldOff size={20} /> },
              ].map(({ label, value, color, icon }) => (
                <div key={label} className="glass stat-card" style={{ borderRadius: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="stat-value" style={{ color, fontSize: '1.75rem' }}>{value ?? '—'}</div>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                      {icon}
                    </div>
                  </div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Questions Tab ─────────────────────────────────────────────────── */}
      {tab === 'questions' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {qData?.total ?? '...'} questões
            </span>
          </div>

          {qLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)' }}>
              <RefreshCw size={18} className="animate-spin" /> Carregando...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {qData?.data?.map((q: {
                id: string
                statement: string
                year?: number
                difficulty: string
                isPublished: boolean
                specialty?: { name: string }
                institution?: { name: string; acronym: string }
              }) => (
                <div key={q.id} className="glass" style={{ borderRadius: 12, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                      dangerouslySetInnerHTML={{ __html: q.statement.replace(/<[^>]+>/g, '').slice(0, 100) + '...' }}
                    />
                    <div style={{ display: 'flex', gap: '0.375rem', marginTop: 6 }}>
                      {q.specialty   && <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{q.specialty.name}</span>}
                      {q.institution && <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>{q.institution.acronym}</span>}
                      {q.year        && <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>{q.year}</span>}
                      <span className={`badge ${q.isPublished ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.65rem' }}>
                        {q.isPublished ? 'Publicada' : 'Rascunho'}
                      </span>
                    </div>
                  </div>
                  <button
                    id={`delete-q-${q.id}`}
                    className="btn btn-danger"
                    style={{ padding: '0.5rem 0.75rem', flexShrink: 0 }}
                    onClick={() => { if (confirm('Deletar esta questão?')) deleteQ.mutate(q.id) }}
                    disabled={deleteQ.isPending}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Users Tab ─────────────────────────────────────────────────────── */}
      {tab === 'users' && (
        <div className="animate-fade-in">
          {uLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)' }}>
              <RefreshCw size={18} className="animate-spin" /> Carregando...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {uData?.data?.map((u: {
                id: string
                name: string
                email: string
                role: string
                plan: string
                isBanned: boolean
                createdAt: string
                xp: number
              }) => (
                <div key={u.id} className="glass" style={{ borderRadius: 12, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#0F2040,#1E3A5F)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border)', fontWeight: 700, color: '#93C5FD', fontSize: '0.9rem' }}>
                    {u.name[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    <div style={{ display: 'flex', gap: '0.375rem', marginTop: 4 }}>
                      <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>{u.role}</span>
                      <span className={`badge ${u.plan === 'FREE' ? 'badge-gray' : 'badge-gold'}`} style={{ fontSize: '0.65rem' }}>{u.plan}</span>
                      {u.isBanned && <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>BANIDO</span>}
                    </div>
                  </div>
                  <button
                    id={`ban-user-${u.id}`}
                    className={`btn ${u.isBanned ? 'btn-secondary' : 'btn-danger'}`}
                    style={{ padding: '0.5rem 0.75rem', flexShrink: 0, fontSize: '0.8125rem' }}
                    onClick={() => banUser.mutate({ id: u.id, banned: !u.isBanned })}
                    disabled={banUser.isPending}
                  >
                    {u.isBanned ? <><ShieldCheck size={14} /> Desbanir</> : <><ShieldOff size={14} /> Banir</>}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Logs Tab ──────────────────────────────────────────────────────── */}
      {tab === 'logs' && (
        <div className="animate-fade-in">
          {logsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)' }}>
              <RefreshCw size={18} className="animate-spin" /> Carregando...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {logs?.data?.map((log: {
                id: string
                action: string
                target?: string
                createdAt: string
                admin: { name: string; email: string }
              }) => (
                <div key={log.id} className="glass" style={{ borderRadius: 10, padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--accent-teal)' }}>{log.action}</span>
                    {log.target && <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginLeft: 8 }}>→ {log.target.slice(0, 20)}...</span>}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>por {log.admin?.name}</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Leads Tab ──────────────────────────────────────────────────────── */}
      {tab === 'leads' && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Usuários que se cadastraram nos últimos 7 dias mas ainda não assinaram um plano PRO. Ótimas oportunidades de remarketing!
            </p>
          </div>
          {leadsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)' }}>
              <RefreshCw size={18} className="animate-spin" /> Carregando...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {leads?.data?.length === 0 && (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Nenhum lead nos últimos 7 dias.</div>
              )}
              {leads?.data?.map((lead: {
                id: string; name: string; email: string; createdAt: string;
                payments: { status: string; plan: string; createdAt: string }[]
              }) => (
                <div key={lead.id} className="glass" style={{ borderRadius: 12, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#0F2040,#1E3A5F)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border)', fontWeight: 700, color: '#93C5FD', fontSize: '0.9rem' }}>
                    {lead.name[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{lead.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Mail size={12} /> {lead.email}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      Cadastrou em {new Date(lead.createdAt).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {lead.payments.length > 0 ? (
                      <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Tentou pagar</span>
                    ) : (
                      <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>Só cadastrou</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Support Tab ────────────────────────────────────────────────────── */}
      {tab === 'support' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: selectedTicketId ? '1fr 1.5fr' : '1fr', gap: '1rem' }}>
          {/* Lista */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {ticketsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)' }}>
                <RefreshCw size={18} className="animate-spin" /> Carregando...
              </div>
            ) : (
              <>
                {tickets?.data?.length === 0 && (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Nenhum ticket de suporte ainda.</div>
                )}
                {tickets?.data?.map((t: {
                  id: string; subject: string; status: string; updatedAt: string;
                  user: { name: string; email: string }
                }) => (
                  <button
                    key={t.id}
                    id={`ticket-${t.id}`}
                    className="glass"
                    style={{
                      borderRadius: 12, padding: '1rem', display: 'flex', alignItems: 'center',
                      gap: '0.75rem', cursor: 'pointer', textAlign: 'left', width: '100%',
                      border: selectedTicketId === t.id ? '1px solid var(--accent-blue)' : '1px solid var(--border)',
                    }}
                    onClick={() => setSelectedTicketId(t.id)}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#0F2040,#1E3A5F)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#93C5FD', fontSize: '0.85rem' }}>
                      {t.user.name[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{t.subject}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.user.name}</div>
                    </div>
                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span style={{
                        fontSize: '0.6rem', padding: '2px 6px', borderRadius: 99,
                        background: t.status === 'OPEN' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
                        color: t.status === 'OPEN' ? 'var(--accent-blue)' : 'var(--text-muted)',
                        border: `1px solid ${t.status === 'OPEN' ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`,
                      }}>
                        {t.status === 'OPEN' ? <><Clock size={9} style={{ display:'inline', marginRight:2 }} />Aberto</> : <><CheckCircle size={9} style={{ display:'inline', marginRight:2 }} />Fechado</>}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {new Date(t.updatedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Chat do ticket selecionado */}
          {selectedTicketId && ticketDetail && (
            <div className="glass" style={{ borderRadius: 16, display: 'flex', flexDirection: 'column', maxHeight: '70vh' }}>
              {/* Header do ticket */}
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{ticketDetail.ticket?.subject}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {ticketDetail.ticket?.user?.name} · {ticketDetail.ticket?.user?.email}
                  </div>
                </div>
                <button
                  onClick={() => setTicketStatus.mutate({ id: selectedTicketId, status: ticketDetail.ticket?.status === 'OPEN' ? 'CLOSED' : 'OPEN' })}
                  className={`btn ${ticketDetail.ticket?.status === 'OPEN' ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                >
                  {ticketDetail.ticket?.status === 'OPEN' ? <><CheckCircle size={13} /> Fechar</> : <><Clock size={13} /> Reabrir</>}
                </button>
              </div>
              {/* Mensagens */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ticketDetail.ticket?.messages?.map((msg: { id: string; content: string; createdAt: string; sender: { name: string; role: string } }) => {
                  const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(msg.sender?.role)
                  return (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isAdmin ? 'flex-end' : 'flex-start' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 3 }}>
                        {isAdmin ? '👮 Você (Admin)' : `👤 ${msg.sender?.name}`}
                      </div>
                      <div style={{
                        maxWidth: '85%', padding: '8px 12px', borderRadius: 12, fontSize: '0.875rem', lineHeight: 1.5,
                        ...(isAdmin
                          ? { background: 'var(--accent-blue)', color: 'white', borderBottomRightRadius: 3 }
                          : { background: 'var(--bg-base)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderBottomLeftRadius: 3 }
                        )
                      }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {new Date(msg.createdAt).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* Reply */}
              <form
                onSubmit={(e) => { e.preventDefault(); if (replyText.trim()) sendReply.mutate({ id: selectedTicketId, content: replyText }) }}
                style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}
              >
                <input
                  type="text"
                  placeholder="Escreva sua resposta..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  className="input"
                  style={{ flex: 1, fontSize: '0.875rem' }}
                />
                <button type="submit" disabled={sendReply.isPending} className="btn btn-primary" style={{ padding: '0.5rem 0.875rem' }}>
                  <Send size={14} />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ── Partnerships Tab ─────────────────────────────────────────────────── */}
      {tab === 'partnerships' && (
        <div className="animate-fade-in">
          {/* Filtros */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              className="input"
              style={{ fontSize: '0.8125rem', padding: '0.45rem 0.75rem', minWidth: 160 }}
              value={partnerFilter.type}
              onChange={e => setPartnerFilter(f => ({ ...f, type: e.target.value }))}
            >
              <option value="">Todos os tipos</option>
              <option value="AMBASSADOR">Embaixadores</option>
              <option value="ATLETICA">Atléticas</option>
              <option value="INSTITUICAO">Instituições</option>
            </select>
            <select
              className="input"
              style={{ fontSize: '0.8125rem', padding: '0.45rem 0.75rem', minWidth: 160 }}
              value={partnerFilter.status}
              onChange={e => setPartnerFilter(f => ({ ...f, status: e.target.value }))}
            >
              <option value="">Todos os status</option>
              <option value="NOVO">Novo</option>
              <option value="EM_CONTATO">Em contato</option>
              <option value="FECHADO">Fechado</option>
              <option value="RECUSADO">Recusado</option>
            </select>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginLeft: 'auto' }}>
              {partnerships?.total ?? 0} lead{partnerships?.total !== 1 ? 's' : ''}
            </span>
          </div>

          {partnershipsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)' }}>
              <RefreshCw size={18} className="animate-spin" /> Carregando...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {partnerships?.data?.length === 0 && (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Nenhum lead encontrado.</div>
              )}
              {partnerships?.data?.map((lead: {
                id: string; type: string; name: string; email: string;
                extra?: string; status: string; notes?: string; createdAt: string;
              }) => {
                const typeLabel: Record<string, string> = { AMBASSADOR: 'Embaixador', ATLETICA: 'Atlética', INSTITUICAO: 'Instituição' }
                const statusColor: Record<string, string> = {
                  NOVO: 'var(--accent-blue)', EM_CONTATO: 'var(--accent-gold)',
                  FECHADO: 'var(--accent-green)', RECUSADO: 'var(--accent-red)',
                }
                const extra = lead.extra ? (() => { try { return JSON.parse(lead.extra!) } catch { return {} } })() : {}
                return (
                  <div key={lead.id} className="glass" style={{ borderRadius: 14, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                      {/* Avatar */}
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#0F2040,#1E3A5F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#93C5FD', fontSize: '1rem', flexShrink: 0, border: '2px solid var(--border)' }}>
                        {lead.name[0]?.toUpperCase()}
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{lead.name}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Mail size={12} /> {lead.email}
                        </div>
                        {Object.keys(extra).length > 0 && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {Object.entries(extra).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                          </div>
                        )}
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {new Date(lead.createdAt).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      {/* Badges + ações */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                          {typeLabel[lead.type] ?? lead.type}
                        </span>
                        <select
                          className="input"
                          style={{ fontSize: '0.7rem', padding: '3px 8px', color: statusColor[lead.status] ?? 'inherit', minWidth: 130 }}
                          value={lead.status}
                          onChange={e => updatePartner.mutate({ id: lead.id, data: { status: e.target.value } })}
                        >
                          <option value="NOVO">Novo</option>
                          <option value="EM_CONTATO">Em contato</option>
                          <option value="FECHADO">Fechado</option>
                          <option value="RECUSADO">Recusado</option>
                        </select>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => { if (confirm('Remover lead?')) deletePartner.mutate(lead.id) }}
                          disabled={deletePartner.isPending}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    {/* Notes */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        className="input"
                        style={{ flex: 1, fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
                        placeholder="Anotações internas..."
                        defaultValue={lead.notes ?? ''}
                        onBlur={e => {
                          const val = e.target.value
                          if (val !== (lead.notes ?? '')) {
                            updatePartner.mutate({ id: lead.id, data: { notes: val } })
                          }
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Clicks Tab ──────────────────────────────────────────────────────── */}
      {tab === 'clicks' && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Cliques em botões de compra ("Comprar") ou de abertura de conta ("Cadastrar" / "Começar") realizados por visitantes e usuários.
            </p>
          </div>
          {clicksLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)' }}>
              <RefreshCw size={18} className="animate-spin" /> Carregando...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {clicksData?.data?.length === 0 && (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Nenhum clique registrado ainda.</div>
              )}
              {clicksData?.data?.map((click: {
                id: string;
                email?: string;
                userId?: string;
                buttonType: string;
                pageUrl: string;
                ip?: string;
                createdAt: string;
              }) => {
                const badgeColor: Record<string, string> = {
                  START_FREE: 'badge-green',
                  BUY_MONTHLY: 'badge-blue',
                  BUY_SEMIANNUAL: 'badge-gold',
                  BUY_ANNUAL: 'badge-teal',
                  BUY_HERO: 'badge-blue',
                  BUY_CTA_BOTTOM: 'badge-blue',
                  REGISTER_SUBMIT: 'badge-green',
                  CHECKOUT_SUBMIT: 'badge-gold',
                }
                return (
                  <div key={click.id} className="glass" style={{ borderRadius: 12, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`badge ${badgeColor[click.buttonType] || 'badge-gray'}`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                          {click.buttonType}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          na página <code style={{ color: 'var(--text-primary)' }}>{click.pageUrl}</code>
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', marginTop: 6, fontWeight: 500 }}>
                        {click.email ? (
                          <span>E-mail: <strong style={{ color: 'var(--text-primary)' }}>{click.email}</strong></span>
                        ) : click.userId ? (
                          <span style={{ color: 'var(--text-muted)' }}>Usuário ID: {click.userId}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Visitante Anônimo</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        IP: {click.ip || '—'} · Registrado em {new Date(click.createdAt).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Lessons Tab ─────────────────────────────────────────────────────── */}
      {tab === 'lessons' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                Gerencie as aulas da plataforma. Aulas são organizadas por especialidade e bloqueadas para usuários FREE.
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingLesson({ title: '', description: '', videoUrl: '', durationMin: 0, specialtyId: '' })
                setShowLessonModal(true)
              }}
            >
              <Plus size={16} /> Adicionar Aula
            </button>
          </div>

          {lessonsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)' }}>
              <RefreshCw size={18} className="animate-spin" /> Carregando aulas...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {lessonsGrouped?.data?.length === 0 && (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }} className="glass">
                  Nenhuma aula cadastrada ainda.
                </div>
              )}
              {lessonsGrouped?.data?.map((group: { id: string; name: string; lessons: any[] }) => (
                <div key={group.id} className="glass" style={{ borderRadius: 14, padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 0, marginBottom: '1rem', color: 'var(--accent-blue)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    {group.name}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {group.lessons.map((lesson: { id: string; title: string; description: string; durationMin: number; videoUrl: string; specialtyId: string }) => (
                      <div key={lesson.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{lesson.title}</div>
                          {lesson.description && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{lesson.description}</div>}
                          <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span>Duração: {lesson.durationMin || '—'} min</span>
                            <span>•</span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px', whiteSpace: 'nowrap' }}>Vídeo: {lesson.videoUrl}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: '0.5rem 0.75rem' }}
                            onClick={() => {
                              setEditingLesson({
                                id: lesson.id,
                                title: lesson.title,
                                description: lesson.description || '',
                                videoUrl: lesson.videoUrl,
                                durationMin: lesson.durationMin || 0,
                                specialtyId: lesson.specialtyId || group.id
                              })
                              setShowLessonModal(true)
                            }}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '0.5rem 0.75rem' }}
                            onClick={() => {
                              if (confirm(`Deletar a aula "${lesson.title}"?`)) {
                                deleteLesson.mutate(lesson.id)
                              }
                            }}
                            disabled={deleteLesson.isPending}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Lesson Modal ────────────────────────────────────────────────────── */}
      {showLessonModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(8px)'
        }}>
          <div className="glass animate-fade-in" style={{
            width: '90%',
            maxWidth: '500px',
            padding: '24px',
            borderRadius: '16px',
            position: 'relative'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '1.25rem', fontWeight: 700 }}>
              {editingLesson?.id ? 'Editar Aula' : 'Nova Aula'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const data = {
                title: editingLesson?.title,
                description: editingLesson?.description || null,
                videoUrl: editingLesson?.videoUrl,
                durationMin: editingLesson?.durationMin ? Number(editingLesson.durationMin) : null,
                specialtyId: editingLesson?.specialtyId || null
              }
              if (editingLesson?.id) {
                updateLesson.mutate({ id: editingLesson.id, data })
              } else {
                createLesson.mutate(data)
              }
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Título *</label>
                <input
                  type="text"
                  className="input"
                  required
                  value={editingLesson?.title || ''}
                  onChange={e => setEditingLesson(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Descrição</label>
                <textarea
                  className="input"
                  rows={3}
                  value={editingLesson?.description || ''}
                  onChange={e => setEditingLesson(prev => prev ? { ...prev, description: e.target.value } : null)}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>URL do Vídeo (YouTube/Vimeo) *</label>
                <input
                  type="url"
                  className="input"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={editingLesson?.videoUrl || ''}
                  onChange={e => setEditingLesson(prev => prev ? { ...prev, videoUrl: e.target.value } : null)}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Duração (minutos)</label>
                  <input
                    type="number"
                    className="input"
                    value={editingLesson?.durationMin || ''}
                    onChange={e => setEditingLesson(prev => prev ? { ...prev, durationMin: Number(e.target.value) } : null)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Especialidade</label>
                  <select
                    className="input"
                    value={editingLesson?.specialtyId || ''}
                    onChange={e => setEditingLesson(prev => prev ? { ...prev, specialtyId: e.target.value } : null)}
                  >
                    <option value="">Nenhuma</option>
                    {specialtiesData?.data?.map((s: { id: string; name: string }) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowLessonModal(false); setEditingLesson(null) }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={createLesson.isPending || updateLesson.isPending}>
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
