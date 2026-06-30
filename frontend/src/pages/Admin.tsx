import { useState, useRef, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, lessonsApi } from '../lib/api'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, BookOpen, Users, FileText,
  Plus, Trash2, ShieldOff, ShieldCheck, RefreshCw,
  AlertTriangle, BookMarked, MessageSquare, ShoppingCart,
  Send, CheckCircle, Clock, Mail, Handshake, MousePointerClick,
  Play, Edit, Upload, FileUp, Database, CheckSquare, XCircle, AlertCircle,
  FolderTree, Image, X, Loader2, Search, ChevronLeft, ChevronRight
} from 'lucide-react'

type AdminTab = 'stats' | 'questions' | 'users' | 'logs' | 'support' | 'leads' | 'partnerships' | 'clicks' | 'lessons' | 'priorities' | 'import' | 'specialties'

interface ImportResult {
  imported: number
  skipped: number
  errors: number
  total: number
  errorMessages: string[]
}

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
  const [selectedInstId, setSelectedInstId] = useState<string>('')

  // Specialties state
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false)
  const [editingSpecialty, setEditingSpecialty] = useState<{
    id?: string
    name: string
    slug: string
    description: string
    parentId: string
    isGrandeArea: boolean
  } | null>(null)
  const [specialtySearch, setSpecialtySearch] = useState('')
  const [specialtyTypeFilter, setSpecialtyTypeFilter] = useState<'all' | 'grande' | 'sub'>('all')

  // Import state
  const [qFile, setQFile] = useState<File | null>(null)
  const [aFile, setAFile] = useState<File | null>(null)
  const [qDragging, setQDragging] = useState(false)
  const [aDragging, setADragging] = useState(false)
  const [qResult, setQResult] = useState<ImportResult | null>(null)
  const [aResult, setAResult] = useState<ImportResult | null>(null)
  const qFileRef = useRef<HTMLInputElement>(null)
  const aFileRef = useRef<HTMLInputElement>(null)

  // Image modal state
  const [imageModal, setImageModal] = useState<{ questionId: string; code: string } | null>(null)
  const [imgCaption, setImgCaption] = useState('')
  const [imgPreview, setImgPreview] = useState<string | null>(null)
  const [imgDragging, setImgDragging] = useState(false)
  const imgFileRef = useRef<HTMLInputElement>(null)

  // Questions search & pagination state
  const [qPage, setQPage] = useState(1)
  const [qSearch, setQSearch] = useState('')
  const [debouncedQSearch, setDebouncedQSearch] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQSearch(qSearch)
      setQPage(1)
    }, 400)
    return () => clearTimeout(handler)
  }, [qSearch])

  const qc = useQueryClient()

  const { data: stats,   isLoading: statsLoading   } = useQuery({ queryKey: ['admin-stats'],   queryFn: adminApi.stats })

  const { data: instData } = useQuery({
    queryKey: ['admin-institutions-priorities'],
    queryFn: adminApi.institutions,
    enabled: tab === 'priorities'
  })

  const { data: prioritiesData } = useQuery({
    queryKey: ['admin-priorities'],
    queryFn: adminApi.getPriorities,
    enabled: tab === 'priorities'
  })

  const { data: specialtiesPriorityData } = useQuery({
    queryKey: ['admin-specialties-priorities'],
    queryFn: adminApi.specialties,
    enabled: tab === 'priorities'
  })

  const savePriorityMutation = useMutation({
    mutationFn: (data: { institutionId: string; specialtyId: string; priority: 'MAXIMA' | 'ALTA' | 'MEDIA' | 'BAIXA' }) =>
      adminApi.savePriority(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-priorities'] })
      toast.success('Prioridade atualizada!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Erro ao salvar prioridade')
    }
  })
  const { data: qData,   isLoading: qLoading        } = useQuery({
    queryKey: ['admin-questions', qPage, debouncedQSearch],
    queryFn: () => adminApi.questions({ page: qPage, search: debouncedQSearch }),
    enabled: tab === 'questions'
  })
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

  // ── Image modal data & mutations ─────────────────────────────────────────
  const { data: questionImagesData, isLoading: imagesLoading } = useQuery({
    queryKey: ['admin-question-images', imageModal?.questionId],
    queryFn: () => adminApi.getQuestionImages(imageModal!.questionId),
    enabled: !!imageModal,
  })

  const addImage = useMutation({
    mutationFn: ({ questionId, url, caption }: { questionId: string; url: string; caption?: string }) =>
      adminApi.addQuestionImage(questionId, { url, caption }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-question-images', imageModal?.questionId] })
      setImgPreview(null)
      setImgCaption('')
      toast.success('Imagem adicionada!')
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao adicionar imagem'),
  })

  const updateImageCaption = useMutation({
    mutationFn: ({ imageId, caption }: { imageId: string; caption: string }) =>
      adminApi.updateQuestionImage(imageId, { caption }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-question-images', imageModal?.questionId] })
      toast.success('Legenda salva!')
    },
  })

  const deleteImage = useMutation({
    mutationFn: (imageId: string) => adminApi.deleteQuestionImage(imageId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-question-images', imageModal?.questionId] })
      toast.success('Imagem removida')
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erro ao remover imagem'),
  })

  // Comprime a imagem no browser usando Canvas (max 1024px, qualidade 0.82)
  const compressImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new window.Image()
        img.onload = () => {
          const MAX = 1024
          const scale = Math.min(1, MAX / Math.max(img.width, img.height))
          const canvas = document.createElement('canvas')
          canvas.width = Math.round(img.width * scale)
          canvas.height = Math.round(img.height * scale)
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/jpeg', 0.82))
        }
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }, [])

  const handleImageFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Selecione uma imagem válida'); return }
    if (file.size > 10 * 1024 * 1024) { toast.error('Arquivo muito grande (máx 10MB)'); return }
    try {
      const compressed = await compressImage(file)
      setImgPreview(compressed)
    } catch { toast.error('Erro ao processar imagem') }
  }, [compressImage])

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

  // Specialties queries & mutations
  const { data: specialtiesListData, isLoading: specialtiesLoading } = useQuery({
    queryKey: ['admin-specialties-list'],
    queryFn: adminApi.specialties,
    enabled: tab === 'specialties' || showSpecialtyModal
  })

  const createSpecialty = useMutation({
    mutationFn: (data: Record<string, any>) => adminApi.createSpecialty(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-specialties-list'] })
      qc.invalidateQueries({ queryKey: ['admin-specialties-lessons'] })
      qc.invalidateQueries({ queryKey: ['admin-specialties-priorities'] })
      setShowSpecialtyModal(false)
      setEditingSpecialty(null)
      toast.success('Tema criado com sucesso!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Erro ao criar tema')
    }
  })

  const updateSpecialty = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) => adminApi.updateSpecialty(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-specialties-list'] })
      qc.invalidateQueries({ queryKey: ['admin-specialties-lessons'] })
      qc.invalidateQueries({ queryKey: ['admin-specialties-priorities'] })
      setShowSpecialtyModal(false)
      setEditingSpecialty(null)
      toast.success('Tema atualizado com sucesso!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Erro ao atualizar tema')
    }
  })

  const deleteSpecialty = useMutation({
    mutationFn: (id: string) => adminApi.deleteSpecialty(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-specialties-list'] })
      qc.invalidateQueries({ queryKey: ['admin-specialties-lessons'] })
      qc.invalidateQueries({ queryKey: ['admin-specialties-priorities'] })
      toast.success('Tema deletado com sucesso!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Erro ao deletar tema')
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

  const importQMutation = useMutation({
    mutationFn: (file: File) => adminApi.importQuestions(file),
    onSuccess: (data: ImportResult) => {
      setQResult(data)
      toast.success(`${data.imported} questões importadas!`)
      qc.invalidateQueries({ queryKey: ['admin-questions'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erro no import de questões'),
  })

  const importAMutation = useMutation({
    mutationFn: (file: File) => adminApi.importAnswers(file),
    onSuccess: (data: ImportResult) => {
      setAResult(data)
      toast.success(`${data.imported} gabaritos aplicados!`)
      qc.invalidateQueries({ queryKey: ['admin-questions'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Erro no import de gabarito'),
  })

  const tabs = [
    { id: 'stats',        label: 'Visão geral',  icon: <LayoutDashboard size={16} /> },
    { id: 'questions',    label: 'Questões',      icon: <BookOpen size={16} /> },
    { id: 'users',        label: 'Usuários',      icon: <Users size={16} /> },
    { id: 'specialties',  label: 'Temas',         icon: <FolderTree size={16} /> },
    { id: 'lessons',      label: 'Aulas',         icon: <Play size={16} /> },
    { id: 'import',       label: 'Importar',      icon: <Upload size={16} /> },
    { id: 'leads',        label: 'Leads',         icon: <ShoppingCart size={16} /> },
    { id: 'priorities',   label: 'Prioridades por Banca', icon: <BookMarked size={16} /> },
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
          {/* Barra de Busca */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input"
                placeholder="Pesquisar por enunciado, código, especialidade ou instituição..."
                value={qSearch}
                onChange={(e) => setQSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: qSearch ? '2.5rem' : '1rem' }}
              />
              {qSearch && (
                <button
                  onClick={() => setQSearch('')}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

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
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {qData?.data?.map((q: {
                  id: string
                  code: string
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
                      id={`img-q-${q.id}`}
                      className="btn btn-ghost"
                      title="Gerenciar imagens"
                      style={{ padding: '0.5rem 0.75rem', flexShrink: 0, color: 'var(--accent-blue)' }}
                      onClick={() => { setImageModal({ questionId: q.id, code: q.code || q.id }); setImgPreview(null); setImgCaption('') }}
                    >
                      <Image size={15} />
                    </button>
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

              {/* Paginação */}
              {qData && qData.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setQPage(prev => Math.max(prev - 1, 1))}
                    disabled={qPage === 1}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem' }}
                  >
                    <ChevronLeft size={16} /> Anterior
                  </button>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Página <strong>{qPage}</strong> de {qData.totalPages}
                  </span>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setQPage(prev => Math.min(prev + 1, qData.totalPages))}
                    disabled={qPage === qData.totalPages}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem' }}
                  >
                    Próxima <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Modal de Imagens da Questão ───────────────────────────────────── */}
      {imageModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setImageModal(null) }}
        >
          <div className="glass" style={{
            borderRadius: 20, width: '100%', maxWidth: 680,
            maxHeight: '90vh', overflowY: 'auto',
            border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Image size={18} style={{ color: 'var(--accent-blue)' }} />
                  Imagens da Questão
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace' }}>{imageModal.code}</div>
              </div>
              <button className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={() => setImageModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Imagens existentes */}
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Imagens existentes {questionImagesData?.images?.length > 0 && `(${questionImagesData.images.length})`}
                </div>
                {imagesLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <Loader2 size={16} className="animate-spin" /> Carregando...
                  </div>
                ) : questionImagesData?.images?.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, textAlign: 'center', border: '1px dashed var(--border)' }}>
                    Nenhuma imagem adicionada ainda
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {questionImagesData?.images?.map((img: { id: string; url: string; caption: string | null; order: number }) => (
                      <div key={img.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.875rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--border)' }}>
                        <img
                          src={img.url}
                          alt={img.caption || 'imagem da questão'}
                          style={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid var(--border)' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Legenda</div>
                          <input
                            className="input"
                            style={{ width: '100%', fontSize: '0.8125rem', padding: '0.375rem 0.625rem' }}
                            defaultValue={img.caption || ''}
                            placeholder="Legenda da imagem (opcional)"
                            onBlur={(e) => {
                              const val = e.target.value
                              if (val !== (img.caption || '')) {
                                updateImageCaption.mutate({ imageId: img.id, caption: val })
                              }
                            }}
                          />
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>Ordem: {img.order}</div>
                        </div>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.4rem 0.6rem', flexShrink: 0 }}
                          title="Remover imagem"
                          disabled={deleteImage.isPending}
                          onClick={() => { if (confirm('Remover esta imagem?')) deleteImage.mutate(img.id) }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload de nova imagem */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Adicionar nova imagem
                </div>

                {/* Drop zone */}
                <div
                  style={{
                    border: `2px dashed ${imgDragging ? 'var(--accent-blue)' : imgPreview ? 'var(--accent-green)' : 'var(--border)'}`,
                    borderRadius: 12, padding: '1.5rem', textAlign: 'center', cursor: 'pointer',
                    background: imgDragging ? 'rgba(59,130,246,0.06)' : imgPreview ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => !imgPreview && imgFileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setImgDragging(true) }}
                  onDragLeave={() => setImgDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault(); setImgDragging(false)
                    const file = e.dataTransfer.files[0]
                    if (file) handleImageFile(file)
                  }}
                >
                  {imgPreview ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={imgPreview} alt="preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, objectFit: 'contain', border: '1px solid var(--border)' }} />
                      <button
                        className="btn btn-ghost"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', color: 'var(--accent-red)' }}
                        onClick={(e) => { e.stopPropagation(); setImgPreview(null) }}
                      >
                        <X size={12} /> Trocar imagem
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <Upload size={28} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Arraste uma imagem ou clique para selecionar</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPG, PNG, WebP · compressão automática · máx 10MB</div>
                    </div>
                  )}
                </div>

                <input
                  ref={imgFileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = '' }}
                />

                {/* Caption input */}
                <div style={{ marginTop: '0.875rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Legenda <span style={{ color: 'var(--text-muted)' }}>(opcional)</span>
                  </label>
                  <input
                    className="input"
                    style={{ width: '100%', fontSize: '0.875rem' }}
                    placeholder="Ex: Raio-X de tórax mostrando consolidação bilateral"
                    value={imgCaption}
                    onChange={(e) => setImgCaption(e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button className="btn btn-ghost" onClick={() => { setImgPreview(null); setImgCaption('') }} disabled={!imgPreview}>
                    Cancelar
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={!imgPreview || addImage.isPending}
                    onClick={() => {
                      if (!imgPreview || !imageModal) return
                      addImage.mutate({ questionId: imageModal.questionId, url: imgPreview, caption: imgCaption || undefined })
                    }}
                  >
                    {addImage.isPending ? <><Loader2 size={14} className="animate-spin" /> Enviando...</> : <><Plus size={14} /> Adicionar Imagem</>}
                  </button>
                </div>
              </div>

            </div>
          </div>
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

      {/* ── Specialties (Temas) Tab ────────────────────────────────────────── */}
      {tab === 'specialties' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '300px' }}>
              <input
                type="text"
                className="input"
                placeholder="Buscar temas..."
                value={specialtySearch}
                onChange={e => setSpecialtySearch(e.target.value)}
                style={{ maxWidth: '300px', fontSize: '0.875rem' }}
              />
              <select
                className="input"
                value={specialtyTypeFilter}
                onChange={e => setSpecialtyTypeFilter(e.target.value as any)}
                style={{ maxWidth: '200px', fontSize: '0.875rem' }}
              >
                <option value="all">Todos os tipos</option>
                <option value="grande">Grandes Áreas</option>
                <option value="sub">Sub-especialidades</option>
              </select>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingSpecialty({ name: '', slug: '', description: '', parentId: '', isGrandeArea: false })
                setShowSpecialtyModal(true)
              }}
            >
              <Plus size={16} /> Adicionar Tema
            </button>
          </div>

          {specialtiesLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)' }}>
              <RefreshCw size={18} className="animate-spin" /> Carregando temas...
            </div>
          ) : (
            <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '12px 8px', fontWeight: 600 }}>Nome</th>
                      <th style={{ padding: '12px 8px', fontWeight: 600 }}>Slug</th>
                      <th style={{ padding: '12px 8px', fontWeight: 600 }}>Tipo</th>
                      <th style={{ padding: '12px 8px', fontWeight: 600 }}>Grande Área Pai</th>
                      <th style={{ padding: '12px 8px', fontWeight: 600 }}>Descrição</th>
                      <th style={{ padding: '12px 8px', fontWeight: 600, textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const rawData = specialtiesListData?.data || []
                      const filtered = rawData.filter((s: any) => {
                        const matchesSearch = s.name.toLowerCase().includes(specialtySearch.toLowerCase()) ||
                          s.slug.toLowerCase().includes(specialtySearch.toLowerCase())
                        const matchesType = specialtyTypeFilter === 'all' ? true :
                          specialtyTypeFilter === 'grande' ? s.isGrandeArea : !s.isGrandeArea
                        return matchesSearch && matchesType
                      })

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                              Nenhum tema encontrado.
                            </td>
                          </tr>
                        )
                      }

                      return filtered.map((spec: { id: string; name: string; slug: string; description?: string; parentId?: string; isGrandeArea: boolean }) => {
                        const parentName = spec.parentId ? rawData.find((p: any) => p.id === spec.parentId)?.name : '—'
                        return (
                          <tr key={spec.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
                            <td style={{ padding: '16px 8px', fontWeight: 500 }}>
                              {spec.name}
                            </td>
                            <td style={{ padding: '16px 8px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent-teal)' }}>
                              {spec.slug}
                            </td>
                            <td style={{ padding: '16px 8px' }}>
                              {spec.isGrandeArea ? (
                                <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>Grande Área</span>
                              ) : (
                                <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>Sub-especialidade</span>
                              )}
                            </td>
                            <td style={{ padding: '16px 8px', color: spec.parentId ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                              {parentName}
                            </td>
                            <td style={{ padding: '16px 8px', color: 'var(--text-secondary)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {spec.description || '—'}
                            </td>
                            <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button
                                  className="btn btn-ghost"
                                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                  onClick={() => {
                                    setEditingSpecialty({
                                      id: spec.id,
                                      name: spec.name,
                                      slug: spec.slug,
                                      description: spec.description || '',
                                      parentId: spec.parentId || '',
                                      isGrandeArea: spec.isGrandeArea
                                    })
                                    setShowSpecialtyModal(true)
                                  }}
                                >
                                  Editar
                                </button>
                                <button
                                  className="btn btn-danger"
                                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                  onClick={() => {
                                    if (confirm(`Deletar o tema "${spec.name}"? Atenção: isso poderá afetar questões e aulas vinculadas.`)) {
                                      deleteSpecialty.mutate(spec.id)
                                    }
                                  }}
                                  disabled={deleteSpecialty.isPending}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Priorities Tab ─────────────────────────────────────────────────── */}
      {tab === 'priorities' && (
        <div className="animate-fade-in glass" style={{ padding: '24px', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#FFF' }}>
            Calibração de Prioridades por Banca
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Defina o peso de cobrança de cada grande área para cada banca/instituição. Essas prioridades influenciam o cronograma adaptativo e o cálculo de proficiência do aluno.
          </p>

          <div style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Selecione a Banca / Instituição
            </label>
            <select
              className="input"
              value={selectedInstId}
              onChange={(e) => setSelectedInstId(e.target.value)}
            >
              <option value="">-- Selecione uma instituição --</option>
              {instData?.data?.map((inst: { id: string; name: string; acronym: string }) => (
                <option key={inst.id} value={inst.id}>
                  {inst.acronym} - {inst.name}
                </option>
              ))}
            </select>
          </div>

          {!selectedInstId ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '12px' }}>
              Selecione uma instituição acima para visualizar e editar as prioridades das especialidades.
            </div>
          ) : (
            <div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '12px 8px', fontWeight: 600 }}>Grande Área</th>
                      <th style={{ padding: '12px 8px', fontWeight: 600 }}>Prioridade da Banca</th>
                      <th style={{ padding: '12px 8px', fontWeight: 600 }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specialtiesPriorityData?.data?.filter((s: any) => s.isGrandeArea).map((spec: { id: string; name: string }) => {
                      const priorityObj = prioritiesData?.data?.find(
                        (p: any) => p.institutionId === selectedInstId && p.specialtyId === spec.id
                      )
                      const currentPriority = priorityObj ? priorityObj.priority : 'MEDIA'

                      return (
                        <tr key={spec.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
                          <td style={{ padding: '16px 8px', fontWeight: 500 }}>
                            {spec.name}
                          </td>
                          <td style={{ padding: '16px 8px' }}>
                            <select
                              className="input"
                              style={{ width: '220px', padding: '6px 12px' }}
                              value={currentPriority}
                              onChange={(e) => {
                                savePriorityMutation.mutate({
                                  institutionId: selectedInstId,
                                  specialtyId: spec.id,
                                  priority: e.target.value as any
                                })
                              }}
                            >
                              <option value="MAXIMA">MÁXIMA (Muito Cobrada)</option>
                              <option value="ALTA">ALTA</option>
                              <option value="MEDIA">MÉDIA</option>
                              <option value="BAIXA">BAIXA</option>
                            </select>
                          </td>
                          <td style={{ padding: '16px 8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {savePriorityMutation.isPending && savePriorityMutation.variables?.specialtyId === spec.id ? (
                              <span style={{ color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <RefreshCw size={12} className="animate-spin" /> Salvando...
                              </span>
                            ) : priorityObj ? (
                              <span style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle size={12} /> Personalizado
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>Padrão (Média)</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Import Tab ──────────────────────────────────────────────────────── */}
      {tab === 'import' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Importação de Questões</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
              Faça upload de arquivos <code style={{ color: 'var(--accent-teal)' }}>.jsonl</code> para importar questões e gabaritos em lote.
              A importação é idempotente — questões duplicadas (mesmo código) serão atualizadas, não duplicadas.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>

            {/* ── Upload de Questões ── */}
            <div className="glass" style={{ borderRadius: 16, padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Database size={20} color="var(--accent-blue)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>Questões</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>questoes_importar.jsonl</div>
                </div>
              </div>

              {/* Drop zone questões */}
              <div
                id="drop-zone-questions"
                onDragOver={e => { e.preventDefault(); setQDragging(true) }}
                onDragLeave={() => setQDragging(false)}
                onDrop={e => {
                  e.preventDefault(); setQDragging(false)
                  const f = e.dataTransfer.files[0]
                  if (f) { setQFile(f); setQResult(null) }
                }}
                onClick={() => qFileRef.current?.click()}
                style={{
                  border: `2px dashed ${qDragging ? 'var(--accent-blue)' : qFile ? 'var(--accent-green)' : 'var(--border)'}`,
                  borderRadius: 12, padding: '2rem 1rem', textAlign: 'center', cursor: 'pointer',
                  background: qDragging ? 'rgba(59,130,246,0.06)' : qFile ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.2s', marginBottom: '1rem',
                }}
              >
                <input ref={qFileRef} type="file" accept=".jsonl,.json" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setQFile(f); setQResult(null) } }} />
                {qFile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <CheckSquare size={28} color="var(--accent-green)" />
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{qFile.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(qFile.size / 1024).toFixed(1)} KB</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <FileUp size={28} color="var(--text-muted)" />
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Arraste ou clique para selecionar</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.7 }}>Formato: .jsonl</div>
                  </div>
                )}
              </div>

              {/* Resultado questões */}
              {qResult && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                  {[
                    { label: 'Importadas', value: qResult.imported, color: 'var(--accent-green)', icon: <CheckCircle size={14} /> },
                    { label: 'Atualizadas', value: qResult.skipped, color: 'var(--accent-gold)', icon: <AlertCircle size={14} /> },
                    { label: 'Erros', value: qResult.errors, color: 'var(--accent-red)', icon: <XCircle size={14} /> },
                  ].map(({ label, value, color, icon }) => (
                    <div key={label} className="glass" style={{ borderRadius: 10, padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ color, fontSize: '1.4rem', fontWeight: 700 }}>{value}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: 2 }}>
                        <span style={{ color }}>{icon}</span>{label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {qResult?.errorMessages && qResult.errorMessages.length > 0 && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', maxHeight: 120, overflowY: 'auto' }}>
                  {qResult.errorMessages.map((msg, i) => (
                    <div key={i} style={{ fontSize: '0.75rem', color: '#FCA5A5', marginBottom: 2 }}>{msg}</div>
                  ))}
                </div>
              )}

              <button
                id="btn-import-questions"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={!qFile || importQMutation.isPending}
                onClick={() => qFile && importQMutation.mutate(qFile)}
              >
                {importQMutation.isPending
                  ? <><RefreshCw size={15} className="animate-spin" /> Importando...</>
                  : <><Upload size={15} /> Importar Questões</>}
              </button>
            </div>

            {/* ── Upload de Gabarito ── */}
            <div className="glass" style={{ borderRadius: 16, padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(234,179,8,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckSquare size={20} color="var(--accent-gold)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>Gabarito</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>gabarito_importar.jsonl</div>
                </div>
              </div>

              {/* Drop zone gabarito */}
              <div
                id="drop-zone-answers"
                onDragOver={e => { e.preventDefault(); setADragging(true) }}
                onDragLeave={() => setADragging(false)}
                onDrop={e => {
                  e.preventDefault(); setADragging(false)
                  const f = e.dataTransfer.files[0]
                  if (f) { setAFile(f); setAResult(null) }
                }}
                onClick={() => aFileRef.current?.click()}
                style={{
                  border: `2px dashed ${aDragging ? 'var(--accent-gold)' : aFile ? 'var(--accent-green)' : 'var(--border)'}`,
                  borderRadius: 12, padding: '2rem 1rem', textAlign: 'center', cursor: 'pointer',
                  background: aDragging ? 'rgba(234,179,8,0.06)' : aFile ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.2s', marginBottom: '1rem',
                }}
              >
                <input ref={aFileRef} type="file" accept=".jsonl,.json" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setAFile(f); setAResult(null) } }} />
                {aFile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <CheckSquare size={28} color="var(--accent-green)" />
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{aFile.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(aFile.size / 1024).toFixed(1)} KB</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <FileUp size={28} color="var(--text-muted)" />
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Arraste ou clique para selecionar</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.7 }}>Formato: .jsonl</div>
                  </div>
                )}
              </div>

              {/* Resultado gabarito */}
              {aResult && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                  {[
                    { label: 'Aplicados', value: aResult.imported, color: 'var(--accent-green)', icon: <CheckCircle size={14} /> },
                    { label: 'Não encontrados', value: aResult.skipped, color: 'var(--accent-gold)', icon: <AlertCircle size={14} /> },
                    { label: 'Erros', value: aResult.errors, color: 'var(--accent-red)', icon: <XCircle size={14} /> },
                  ].map(({ label, value, color, icon }) => (
                    <div key={label} className="glass" style={{ borderRadius: 10, padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ color, fontSize: '1.4rem', fontWeight: 700 }}>{value}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: 2 }}>
                        <span style={{ color }}>{icon}</span>{label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {aResult?.errorMessages && aResult.errorMessages.length > 0 && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', maxHeight: 120, overflowY: 'auto' }}>
                  {aResult.errorMessages.map((msg, i) => (
                    <div key={i} style={{ fontSize: '0.75rem', color: '#FCA5A5', marginBottom: 2 }}>{msg}</div>
                  ))}
                </div>
              )}

              <button
                id="btn-import-answers"
                className="btn btn-primary"
                style={{ width: '100%', background: 'linear-gradient(135deg, #B45309, #D97706)' }}
                disabled={!aFile || importAMutation.isPending}
                onClick={() => aFile && importAMutation.mutate(aFile)}
              >
                {importAMutation.isPending
                  ? <><RefreshCw size={15} className="animate-spin" /> Aplicando gabarito...</>
                  : <><CheckSquare size={15} /> Importar Gabarito</>}
              </button>
            </div>
          </div>

          {/* Instruções */}
          <div className="glass" style={{ borderRadius: 14, padding: '1.25rem', borderLeft: '3px solid var(--accent-blue)' }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--accent-blue)' }}>📋 Instruções de uso</h3>
            <ol style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.8 }}>
              <li>Primeiro importe o arquivo de <strong>questões</strong> (<code>questoes_importar.jsonl</code>). As questões ficam salvas como <em>rascunho</em>.</li>
              <li>Em seguida, importe o arquivo de <strong>gabarito</strong> (<code>gabarito_importar.jsonl</code>) para atribuir as respostas corretas e publicar automaticamente.</li>
              <li>Questões duplicadas (mesmo código BANCA-ANO-NÚMERO) são <strong>atualizadas</strong>, não duplicadas.</li>
              <li>Questões do gabarito que não encontrarem correspondência nas questões serão listadas em <em>Não encontrados</em>.</li>
            </ol>
          </div>
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

      {/* ── Specialty Modal ────────────────────────────────────────────────── */}
      {showSpecialtyModal && (
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
              {editingSpecialty?.id ? 'Editar Tema' : 'Novo Tema'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const data = {
                name: editingSpecialty?.name,
                slug: editingSpecialty?.slug,
                description: editingSpecialty?.description || null,
                parentId: (!editingSpecialty?.isGrandeArea && editingSpecialty?.parentId) ? editingSpecialty.parentId : null,
                isGrandeArea: !!editingSpecialty?.isGrandeArea
              }
              if (editingSpecialty?.id) {
                updateSpecialty.mutate({ id: editingSpecialty.id, data })
              } else {
                createSpecialty.mutate(data)
              }
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Nome *</label>
                <input
                  type="text"
                  className="input"
                  required
                  value={editingSpecialty?.name || ''}
                  onChange={e => {
                    const nameVal = e.target.value
                    setEditingSpecialty(prev => {
                      if (!prev) return null
                      const newSlug = prev.id ? prev.slug : nameVal
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .trim()
                      return { ...prev, name: nameVal, slug: newSlug }
                    })
                  }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Slug *</label>
                <input
                  type="text"
                  className="input"
                  required
                  value={editingSpecialty?.slug || ''}
                  onChange={e => setEditingSpecialty(prev => prev ? { ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') } : null)}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Descrição</label>
                <textarea
                  className="input"
                  rows={3}
                  value={editingSpecialty?.description || ''}
                  onChange={e => setEditingSpecialty(prev => prev ? { ...prev, description: e.target.value } : null)}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="chk-is-grande-area"
                  checked={editingSpecialty?.isGrandeArea || false}
                  onChange={e => {
                    const checked = e.target.checked
                    setEditingSpecialty(prev => prev ? { ...prev, isGrandeArea: checked, parentId: checked ? '' : prev.parentId } : null)
                  }}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="chk-is-grande-area" style={{ fontSize: '0.875rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500 }}>
                  Este tema é uma Grande Área? (Ex: Clínica Médica)
                </label>
              </div>

              {!editingSpecialty?.isGrandeArea && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Grande Área Pai *</label>
                  <select
                    className="input"
                    required={!editingSpecialty?.isGrandeArea}
                    value={editingSpecialty?.parentId || ''}
                    onChange={e => setEditingSpecialty(prev => prev ? { ...prev, parentId: e.target.value } : null)}
                  >
                    <option value="">-- Selecione a Grande Área --</option>
                    {specialtiesListData?.data?.filter((s: any) => s.isGrandeArea && s.id !== editingSpecialty?.id).map((s: { id: string; name: string }) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowSpecialtyModal(false); setEditingSpecialty(null) }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={createSpecialty.isPending || updateSpecialty.isPending}>
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
