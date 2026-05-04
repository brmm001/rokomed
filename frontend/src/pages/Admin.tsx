import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../lib/api'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, BookOpen, Users, FileText,
  Plus, Trash2, ShieldOff, ShieldCheck, RefreshCw,
  AlertTriangle, BookMarked
} from 'lucide-react'

type AdminTab = 'stats' | 'questions' | 'users' | 'logs'

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('stats')
  const qc = useQueryClient()

  const { data: stats,  isLoading: statsLoading  } = useQuery({ queryKey: ['admin-stats'],   queryFn: adminApi.stats })
  const { data: qData,  isLoading: qLoading       } = useQuery({ queryKey: ['admin-questions'], queryFn: () => adminApi.questions(), enabled: tab === 'questions' })
  const { data: uData,  isLoading: uLoading       } = useQuery({ queryKey: ['admin-users'],     queryFn: () => adminApi.users(),     enabled: tab === 'users' })
  const { data: logs,   isLoading: logsLoading    } = useQuery({ queryKey: ['admin-logs'],      queryFn: () => adminApi.logs(),      enabled: tab === 'logs' })

  const deleteQ = useMutation({
    mutationFn: (id: string) => adminApi.deleteQuestion(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-questions'] }); toast.success('Questão deletada') },
  })

  const banUser = useMutation({
    mutationFn: ({ id, banned }: { id: string; banned: boolean }) => adminApi.banUser(id, banned),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Usuário atualizado') },
  })

  const tabs = [
    { id: 'stats',     label: 'Visão geral',  icon: <LayoutDashboard size={16} /> },
    { id: 'questions', label: 'Questões',      icon: <BookOpen size={16} /> },
    { id: 'users',     label: 'Usuários',      icon: <Users size={16} /> },
    { id: 'logs',      label: 'Logs',          icon: <FileText size={16} /> },
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
    </div>
  )
}
