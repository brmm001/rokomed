import { useState, useRef, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { questionsApi } from '../lib/api'
import {
  Search, BookOpen, ChevronRight, ChevronLeft, X, RefreshCw,
  Filter, Target, Building2, GraduationCap, ChevronDown,
  XCircle, BarChart3, List, LayoutGrid, Star, Zap, AlertCircle,
  RotateCcw, Clock,
} from 'lucide-react'

const DIFFICULTIES = ['FACIL', 'MEDIO', 'DIFICIL'] as const

const diffConfig = {
  FACIL:   { label: 'Fácil',   color: '#10B981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  dot: '#10B981' },
  MEDIO:   { label: 'Médio',   color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)',  dot: '#F59E0B' },
  DIFICIL: { label: 'Difícil', color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',   dot: '#EF4444' },
}

// Filtros rápidos que aparecem como chips no topo (sem abrir o painel)
const QUICK_FILTERS = [
  { id: 'wrongOnly',  label: '✕ Meus erros',      icon: AlertCircle,  color: '#EF4444' },
  { id: 'bookmarked', label: '★ Favoritas',       icon: Star,         color: '#F59E0B' },
  { id: 'unanswered', label: 'Não respondidas',   icon: BookOpen,     color: '#3B82F6' },
] as const

const SESSION_SIZES = [10, 20, 30] as const

export default function QuestionBankPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Estado dos filtros sincronizado com a URL
  const getParam = (key: string, fallback = '') => searchParams.get(key) ?? fallback

  const [searchInput, setSearchInput] = useState(() => getParam('q'))
  const [viewMode, setViewMode]       = useState<'list' | 'compact'>(() => getParam('view', 'list') as 'list' | 'compact')
  const [showFilters, setShowFilters] = useState(() => !!searchParams.get('specialty') || !!searchParams.get('institution') || !!searchParams.get('year') || !!searchParams.get('difficulty'))
  const [sessionSize, setSessionSize] = useState<number | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Deriva todos os filtros diretamente dos searchParams
  const page        = parseInt(getParam('page', '1'))
  const search      = getParam('q')
  const specialty   = getParam('specialty')
  const institution = getParam('institution')
  const year        = getParam('year')
  const difficulty  = getParam('difficulty')
  const bookmarked  = getParam('bookmarked') === 'true'
  const wrongOnly   = getParam('wrongOnly') === 'true'
  const unanswered  = getParam('unanswered') === 'true'

  // Atualiza a URL preservando os outros params
  const setFilter = useCallback((updates: Record<string, string | null>) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === '') next.delete(k)
        else next.set(k, v)
      }
      // Sempre volta para page 1 ao filtrar
      next.set('page', '1')
      return next
    }, { replace: true })
  }, [setSearchParams])

  const setPage = (p: number) => setSearchParams(prev => {
    const next = new URLSearchParams(prev)
    next.set('page', String(p))
    return next
  }, { replace: true })

  const { data: filtersData } = useQuery({
    queryKey: ['question-filters'],
    queryFn:  questionsApi.filters,
    staleTime: Infinity,
  })

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['questions', page, search, specialty, institution, year, difficulty, bookmarked, wrongOnly, unanswered],
    queryFn: () => questionsApi.list({
      page,
      ...(search        && { search }),
      ...(specialty     && { specialtyId: specialty }),
      ...(institution   && { institutionId: institution }),
      ...(year          && { year: parseInt(year) }),
      ...(difficulty    && { difficulty }),
      ...(bookmarked    && { bookmarked: true }),
      ...(wrongOnly     && { wrongOnly: true }),
      ...(unanswered    && { unanswered: true }),
    }),
    placeholderData: (prev) => prev,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilter({ q: searchInput })
  }

  const clearFilters = () => {
    setSearchInput('')
    setSearchParams({}, { replace: true })
  }

  const activeFilters = [specialty, institution, year, difficulty, bookmarked ? '1' : '', wrongOnly ? '1' : '', unanswered ? '1' : ''].filter(Boolean).length

  // Inicia sessão com tamanho definido
  const startSession = (size: number) => {
    // Salva os IDs da página atual como fila da sessão
    const ids = data?.data?.slice(0, size).map((q: any) => q.id) ?? []
    localStorage.setItem('session_queue', JSON.stringify(ids))
    localStorage.setItem('session_size', String(size))
    localStorage.setItem('session_index', '0')
    if (ids[0]) navigate(`/questoes/${ids[0]}?session=1`)
  }

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', paddingBottom: '3rem' }}>

      {/* ── Hero Header ───────────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(20,184,166,0.1) 50%, rgba(139,92,246,0.08) 100%)',
        border: '1px solid rgba(99,179,237,0.15)',
        padding: '2.5rem 2rem',
      }}>
        {/* Decorative glows */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: 80, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'linear-gradient(135deg, #3B82F6, #14B8A6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(59,130,246,0.35)',
              flexShrink: 0,
            }}>
              <BookOpen size={24} color="white" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Banco de Questões
              </h1>
              <p style={{ margin: 0, marginTop: 4, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Residência Médica · REVALIDA
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
            {[
              { icon: <Target size={15} />, label: 'Questões', value: data?.total?.toLocaleString('pt-BR') ?? '—', color: '#3B82F6' },
              { icon: <GraduationCap size={15} />, label: 'Especialidades', value: filtersData?.specialties?.length ?? '—', color: '#14B8A6' },
              { icon: <Building2 size={15} />, label: 'Instituições', value: filtersData?.institutions?.length ?? '—', color: '#8B5CF6' },
            ].map(({ icon, label, value, color }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14,
                padding: '0.75rem 1.125rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 88,
              }}>
                <div style={{ color, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'Outfit', color: '#fff', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search bar inside hero */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.625rem', marginTop: '1.5rem', position: 'relative' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={17} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              ref={searchRef}
              id="question-search"
              type="text"
              className="input"
              placeholder="Buscar por palavra-chave, diagnóstico, tema..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{
                paddingLeft: '2.75rem',
                paddingRight: searchInput ? '3rem' : '1rem',
                background: 'rgba(10,22,40,0.7)',
                border: '1px solid rgba(99,179,237,0.2)',
                borderRadius: 12,
                fontSize: '0.9375rem',
                height: 48,
                backdropFilter: 'blur(8px)',
              }}
            />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(''); setFilter({ q: null }) }}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
                <X size={15} />
              </button>
            )}
          </div>
          <button type="submit" style={{
            height: 48, padding: '0 1.5rem',
            background: 'linear-gradient(135deg, #3B82F6, #14B8A6)',
            color: 'white', border: 'none', borderRadius: 12,
            fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
            whiteSpace: 'nowrap',
          }}>
            <Search size={16} /> Buscar
          </button>
          <button
            id="toggle-filters-btn"
            type="button"
            onClick={() => setShowFilters(p => !p)}
            style={{
              height: 48, padding: '0 1.25rem',
              background: showFilters ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)',
              color: showFilters ? '#93C5FD' : 'var(--text-secondary)',
              border: showFilters ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              position: 'relative',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
          >
            <Filter size={16} />
            Filtros
            {activeFilters > 0 && (
              <span style={{
                background: '#3B82F6', color: '#fff', borderRadius: '50%',
                width: 18, height: 18, fontSize: '0.625rem', fontWeight: 800,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {activeFilters}
              </span>
            )}
            <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
        </form>
      </div>

      {/* ── Filtros rápidos (chips) ───────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        {QUICK_FILTERS.map(({ id, label, color, icon: QIcon }) => {
          const active = searchParams.get(id) === 'true'
          return (
            <button
              key={id}
              onClick={() => setFilter({ [id]: active ? null : 'true' })}
              aria-pressed={active}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 99,
                border: `1px solid ${active ? color + '60' : 'rgba(255,255,255,0.1)'}`,
                background: active ? `${color}18` : 'rgba(255,255,255,0.04)',
                color: active ? color : 'rgba(255,255,255,0.5)',
                fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <QIcon size={13} />
              {label}
            </button>
          )
        })}

        {/* Seletor de sessão */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600, whiteSpace: 'nowrap' }}>Iniciar sessão:</span>
          {SESSION_SIZES.map(size => (
            <button
              key={size}
              onClick={() => startSession(size)}
              disabled={!data?.data?.length}
              title={`Sessão de ${size} questões (~${size * 1.5} min)`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 99,
                border: '1px solid rgba(59,130,246,0.3)',
                background: 'rgba(59,130,246,0.1)',
                color: '#93C5FD', fontWeight: 700, fontSize: '0.78rem',
                cursor: data?.data?.length ? 'pointer' : 'not-allowed',
                opacity: data?.data?.length ? 1 : 0.4,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (data?.data?.length) e.currentTarget.style.background = 'rgba(59,130,246,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)' }}
            >
              <Zap size={11} /> {size}q <Clock size={11} style={{ opacity: 0.6 }} /> ~{Math.round(size * 1.5)}min
            </button>
          ))}
        </div>
      </div>

      {/* ── Active filter chips ─────────────────────────────────── */}
      {activeFilters > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ativos:</span>
          {specialty && filtersData?.specialties && (() => {
            const s = filtersData.specialties.find((x: { id: string; name: string }) => x.id === specialty)
            return s ? <FilterChip label={s.name} onRemove={() => setFilter({ specialty: null })} color="#3B82F6" /> : null
          })()}
          {institution && filtersData?.institutions && (() => {
            const i = filtersData.institutions.find((x: { id: string; acronym: string }) => x.id === institution)
            return i ? <FilterChip label={i.acronym} onRemove={() => setFilter({ institution: null })} color="#8B5CF6" /> : null
          })()}
          {year && <FilterChip label={`Ano ${year}`} onRemove={() => setFilter({ year: null })} color="#14B8A6" />}
          {difficulty && <FilterChip label={diffConfig[difficulty as keyof typeof diffConfig]?.label ?? difficulty} onRemove={() => setFilter({ difficulty: null })} color={diffConfig[difficulty as keyof typeof diffConfig]?.color ?? '#888'} />}
          {bookmarked && <FilterChip label="★ Favoritas" onRemove={() => setFilter({ bookmarked: null })} color="#F59E0B" />}
          {wrongOnly && <FilterChip label="✕ Apenas erros" onRemove={() => setFilter({ wrongOnly: null })} color="#EF4444" />}
          {unanswered && <FilterChip label="Não respondidas" onRemove={() => setFilter({ unanswered: null })} color="#3B82F6" />}
          {search && <FilterChip label={`"${search}"`} onRemove={() => setFilter({ q: null })} color="#64748B" />}
          <button onClick={clearFilters} style={{
            background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171',
            borderRadius: 99, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <X size={11} /> Limpar tudo
          </button>
        </div>
      )}

      {/* ── Filters panel ─────────────────────────────────────────────── */}
      {showFilters && (
        <div style={{
          background: 'rgba(10,22,40,0.8)',
          border: '1px solid rgba(99,179,237,0.12)',
          borderRadius: 18,
          padding: '1.5rem',
          marginBottom: '1.5rem',
          backdropFilter: 'blur(12px)',
          animation: 'qb-slide-down 0.25s cubic-bezier(0.2,0.8,0.2,1) both',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <FilterSelect id="filter-specialty" label="Especialidade" icon={<GraduationCap size={13} />} value={specialty} onChange={v => setFilter({ specialty: v })}>
              <option value="">Todas especialidades</option>
              {filtersData?.specialties?.map((s: { id: string; name: string }) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </FilterSelect>

            <FilterSelect id="filter-institution" label="Instituição" icon={<Building2 size={13} />} value={institution} onChange={v => setFilter({ institution: v })}>
              <option value="">Todas instituições</option>
              {filtersData?.institutions?.map((i: { id: string; acronym: string; name: string }) => (
                <option key={i.id} value={i.id}>{i.acronym} — {i.name}</option>
              ))}
            </FilterSelect>

            <FilterSelect id="filter-year" label="Ano" icon={<BarChart3 size={13} />} value={year} onChange={v => setFilter({ year: v })}>
              <option value="">Todos os anos</option>
              {filtersData?.years?.map((y: number) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </FilterSelect>

            {/* Difficulty */}
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <BarChart3 size={13} /> Dificuldade
              </label>
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                {(['', ...DIFFICULTIES] as const).map(d => {
                  const cfg = d ? diffConfig[d] : null
                  const active = difficulty === d
                  return (
                    <button key={d} type="button" onClick={() => setFilter({ difficulty: d || null })} style={{
                      flex: 1, padding: '8px 4px',
                      borderRadius: 10,
                      border: active ? `1px solid ${cfg?.border ?? 'rgba(255,255,255,0.3)'}` : '1px solid rgba(255,255,255,0.07)',
                      background: active ? (cfg?.bg ?? 'rgba(255,255,255,0.1)') : 'rgba(255,255,255,0.03)',
                      color: active ? (cfg?.color ?? '#fff') : 'var(--text-muted)',
                      fontSize: '0.75rem', fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.15s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}>
                      {cfg && <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0, display: 'inline-block' }} />}
                      {d === '' ? 'Todas' : cfg?.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
            <ToggleSwitch id="filter-bookmarked" checked={bookmarked} onChange={v => setFilter({ bookmarked: v ? 'true' : null })} icon={<Star size={13} />} label="Somente favoritas" color="#F59E0B" />
            <ToggleSwitch id="filter-wrongonly" checked={wrongOnly} onChange={v => setFilter({ wrongOnly: v ? 'true' : null })} icon={<XCircle size={13} />} label="Apenas erros" color="#EF4444" />
            <ToggleSwitch id="filter-unanswered" checked={unanswered} onChange={v => setFilter({ unanswered: v ? 'true' : null })} icon={<BookOpen size={13} />} label="Não respondidas" color="#3B82F6" />
          </div>
        </div>
      )}

      {/* ── Toolbar: results count + view toggle ─────────────────────── */}
      {!isLoading && data && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isFetching && <RefreshCw size={13} className="animate-spin" style={{ color: 'var(--text-muted)' }} />}
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {data.total?.toLocaleString('pt-BR')} questões
              {search && <> para <strong style={{ color: 'var(--text-secondary)' }}>"{search}"</strong></>}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {(['list', 'compact'] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)} style={{
                padding: '6px 10px', borderRadius: 8, border: 'none',
                background: viewMode === mode ? 'rgba(59,130,246,0.2)' : 'transparent',
                color: viewMode === mode ? '#93C5FD' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {mode === 'list' ? <List size={15} /> : <LayoutGrid size={15} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Questions list ────────────────────────────────────────────── */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'rgba(10,22,40,0.5)',
          border: '1px dashed rgba(99,179,237,0.2)',
          borderRadius: 20,
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <BookOpen size={32} color="var(--text-muted)" />
          </div>
          <h3 style={{ color: 'var(--text-secondary)', fontWeight: 600, margin: '0 0 0.5rem' }}>Nenhuma questão encontrada</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 1.5rem' }}>
            Tente ajustar os filtros ou use termos diferentes.
          </p>
          <button className="apple-btn apple-btn-secondary" onClick={clearFilters} style={{ margin: '0 auto' }}>
            <RefreshCw size={14} /> Limpar filtros
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: viewMode === 'compact' ? 4 : 10 }}>
          {data?.data?.map((q: {
            id: string
            statement: string
            year?: number
            difficulty: 'FACIL' | 'MEDIO' | 'DIFICIL'
            specialty?: { name: string }
            institution?: { acronym: string }
            isBookmarked: boolean
          }, idx: number) => (
            <QuestionCard
              key={q.id}
              q={q}
              idx={(page - 1) * 20 + idx + 1}
              viewMode={viewMode}
              onClick={() => {
                // Salva a sessão atual no localStorage para "Continuar"
                const ids = data?.data?.map((item: any) => item.id) ?? []
                localStorage.setItem('session_queue', JSON.stringify(ids))
                localStorage.setItem('session_index', String(idx))
                localStorage.setItem('last_study_session', JSON.stringify({
                  label: `Banco de Questões — p. ${page}`,
                  path: `/questoes?${searchParams.toString()}`,
                  progress: `Questão ${(page-1)*20 + idx + 1} de ${data?.total ?? '?'}`,
                }))
                navigate(`/questoes/${q.id}?fromBank=1`)
              }}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────────────── */}
      {data && data.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem', marginTop: '2rem' }}>
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{
            height: 40, padding: '0 1rem',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, color: 'var(--text-secondary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: '0.875rem', fontWeight: 500, opacity: page === 1 ? 0.4 : 1,
          }}>
            <ChevronLeft size={16} /> Anterior
          </button>

          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {getPaginationRange(page, data.totalPages).map((p, i) =>
              p === '...' ? (
                <span key={`el-${i}`} style={{ width: 36, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>…</span>
              ) : (
                <button key={p} onClick={() => setPage(p as number)} style={{
                  width: 40, height: 40, borderRadius: 10, border: 'none',
                  background: page === p ? 'linear-gradient(135deg, #3B82F6, #14B8A6)' : 'rgba(255,255,255,0.05)',
                  color: page === p ? '#fff' : 'var(--text-secondary)',
                  fontWeight: page === p ? 700 : 500, fontSize: '0.875rem', cursor: 'pointer',
                  boxShadow: page === p ? '0 4px 14px rgba(59,130,246,0.35)' : 'none',
                }}>
                  {p}
                </button>
              )
            )}
          </div>

          <button onClick={() => setPage(Math.min(data.totalPages, page + 1))} disabled={page === data.totalPages} style={{
            height: 40, padding: '0 1rem',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, color: 'var(--text-secondary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: '0.875rem', fontWeight: 500, opacity: page === data.totalPages ? 0.4 : 1,
          }}>
            Próxima <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── Injected keyframes ──────────────────────────────────────────── */}
      <style>{`
        @keyframes qb-slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes qb-card-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .qb-question-card {
          transition: transform 0.2s ease, border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .qb-question-card:hover {
          border-color: rgba(99,179,237,0.25) !important;
          background: rgba(15,32,64,0.9) !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,130,246,0.1) !important;
        }
        .qb-question-card:hover .qb-chevron {
          color: #93C5FD;
          transform: translateX(3px);
        }
        .qb-question-card .qb-chevron {
          transition: color 0.2s, transform 0.2s;
        }
      `}</style>
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function FilterChip({ label, onRemove, color }: { label: string; onRemove: () => void; color: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: `${color}18`, border: `1px solid ${color}40`, color,
      borderRadius: 99, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600,
    }}>
      {label}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', color, cursor: 'pointer', display: 'flex', padding: 1, opacity: 0.7 }}>
        <X size={11} />
      </button>
    </span>
  )
}

function FilterSelect({ id, label, icon, value, onChange, children }: {
  id: string; label: string; icon: React.ReactNode; value: string
  onChange: (v: string) => void; children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {icon} {label}
      </label>
      <div style={{ position: 'relative' }}>
        <select id={id} value={value} onChange={e => onChange(e.target.value)} style={{
          width: '100%', height: 40,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 10, color: value ? 'var(--text-primary)' : 'var(--text-muted)',
          fontSize: '0.875rem', padding: '0 2rem 0 0.875rem',
          appearance: 'none', cursor: 'pointer', outline: 'none',
          fontFamily: 'Inter, sans-serif',
        }}
          onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
        >
          {children}
        </select>
        <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
      </div>
    </div>
  )
}

function ToggleSwitch({ id, checked, onChange, icon, label, color }: {
  id: string; checked: boolean; onChange: (v: boolean) => void
  icon: React.ReactNode; label: string; color: string
}) {
  return (
    <label htmlFor={id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}>
      <div style={{ position: 'relative' }}>
        <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
        <div style={{
          width: 38, height: 22, borderRadius: 99,
          background: checked ? color : 'rgba(255,255,255,0.08)',
          border: `1px solid ${checked ? color : 'rgba(255,255,255,0.1)'}`,
          transition: 'all 0.2s', position: 'relative',
        }}>
          <div style={{
            width: 16, height: 16, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: 2, left: checked ? 18 : 2,
            transition: 'left 0.2s cubic-bezier(0.2,0.8,0.2,1)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }} />
        </div>
      </div>
      <span style={{ fontSize: '0.875rem', color: checked ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ color: checked ? color : 'var(--text-muted)' }}>{icon}</span>
        {label}
      </span>
    </label>
  )
}

function QuestionCard({ q, idx, viewMode, onClick }: {
  q: { id: string; statement: string; year?: number; difficulty: 'FACIL' | 'MEDIO' | 'DIFICIL'; specialty?: { name: string }; institution?: { acronym: string }; isBookmarked: boolean }
  idx: number; viewMode: 'list' | 'compact'; onClick: () => void
}) {
  const cfg = diffConfig[q.difficulty]
  const isCompact = viewMode === 'compact'
  const plainText = q.statement.replace(/<[^>]+>/g, '').slice(0, isCompact ? 120 : 200)

  return (
    <button
      id={`question-item-${idx - 1}`}
      onClick={onClick}
      className="qb-question-card"
      style={{
        width: '100%', textAlign: 'left', cursor: 'pointer',
        background: 'rgba(10,22,40,0.6)',
        border: '1px solid rgba(99,179,237,0.1)',
        borderRadius: isCompact ? 12 : 16,
        padding: isCompact ? '0.875rem 1.125rem' : '1.25rem 1.5rem',
        display: 'flex', alignItems: isCompact ? 'center' : 'flex-start', gap: isCompact ? 12 : 16,
        animation: 'qb-card-in 0.3s ease both',
      }}
    >
      {/* Number badge */}
      <div style={{
        flexShrink: 0,
        width: isCompact ? 30 : 38, height: isCompact ? 30 : 38,
        borderRadius: isCompact ? 8 : 10,
        background: `${cfg.color}18`, border: `1px solid ${cfg.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Outfit', fontWeight: 700, color: cfg.color, fontSize: isCompact ? '0.8rem' : '0.875rem',
      }}>
        {idx}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: isCompact ? '0.8375rem' : '0.9rem',
          color: 'var(--text-primary)', lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: isCompact ? 1 : 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          marginBottom: isCompact ? 0 : '0.5rem',
        }}>
          {plainText}{plainText.length >= (isCompact ? 120 : 200) ? '…' : ''}
        </p>

        {!isCompact && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
              borderRadius: 99, padding: '2px 9px', fontSize: '0.7rem', fontWeight: 700,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
              {cfg.label}
            </span>
            {q.specialty && (
              <span style={{
                background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#93C5FD',
                borderRadius: 99, padding: '2px 9px', fontSize: '0.7rem', fontWeight: 600,
              }}>{q.specialty.name}</span>
            )}
            {q.institution && (
              <span style={{
                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#C4B5FD',
                borderRadius: 99, padding: '2px 9px', fontSize: '0.7rem', fontWeight: 600,
              }}>{q.institution.acronym}</span>
            )}
            {q.year && (
              <span style={{
                background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)', color: '#94A3B8',
                borderRadius: 99, padding: '2px 9px', fontSize: '0.7rem', fontWeight: 600,
              }}>{q.year}</span>
            )}
            {q.isBookmarked && <Star size={12} color="#F59E0B" fill="#F59E0B" />}
          </div>
        )}

        {isCompact && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: '0.7rem', color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
            {q.specialty && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>· {q.specialty.name}</span>}
            {q.institution && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>· {q.institution.acronym}</span>}
            {q.year && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>· {q.year}</span>}
          </div>
        )}
      </div>

      <ChevronRight size={16} color="var(--text-muted)" className="qb-chevron" style={{ flexShrink: 0 }} />
    </button>
  )
}

function SkeletonCard({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'rgba(10,22,40,0.5)', border: '1px solid rgba(99,179,237,0.07)',
      borderRadius: 16, padding: '1.25rem 1.5rem',
      display: 'flex', alignItems: 'flex-start', gap: 16, ...style,
    }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.04)', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 14, background: 'rgba(255,255,255,0.05)', borderRadius: 7, width: '75%', marginBottom: 10 }} />
        <div style={{ height: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 7, width: '50%', marginBottom: 10 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          {[48, 72, 36].map(w => <div key={w} style={{ height: 18, width: w, background: 'rgba(255,255,255,0.04)', borderRadius: 99 }} />)}
        </div>
      </div>
    </div>
  )
}

function getPaginationRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p)
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}
