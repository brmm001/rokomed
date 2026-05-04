import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { questionsApi } from '../lib/api'
import {
  Search, Filter, Bookmark, SlidersHorizontal,
  BookOpen, ChevronRight, ChevronLeft, X, RefreshCw
} from 'lucide-react'

const DIFFICULTIES = ['FACIL', 'MEDIO', 'DIFICIL'] as const

export default function QuestionBankPage() {
  const navigate = useNavigate()
  const [page, setPage]             = useState(1)
  const [search, setSearch]         = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [specialty, setSpecialty]   = useState('')
  const [institution, setInstitution] = useState('')
  const [year, setYear]             = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [bookmarked, setBookmarked] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const { data: filtersData } = useQuery({
    queryKey: ['question-filters'],
    queryFn:  questionsApi.filters,
    staleTime: Infinity,
  })

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['questions', page, search, specialty, institution, year, difficulty, bookmarked],
    queryFn: () => questionsApi.list({
      page,
      ...(search        && { search }),
      ...(specialty     && { specialtyId: specialty }),
      ...(institution   && { institutionId: institution }),
      ...(year          && { year: parseInt(year) }),
      ...(difficulty    && { difficulty }),
      ...(bookmarked    && { bookmarked: true }),
    }),
    placeholderData: (prev) => prev,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const clearFilters = () => {
    setSpecialty(''); setInstitution(''); setYear(''); setDifficulty(''); setBookmarked(false)
    setSearch(''); setSearchInput(''); setPage(1)
  }

  const activeFilters = [specialty, institution, year, difficulty, bookmarked ? 'bookmarked' : ''].filter(Boolean).length

  const diffColor = { FACIL: 'badge-green', MEDIO: 'badge-gold', DIFICIL: 'badge-red' } as const

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.625rem', margin: 0, fontWeight: 800 }}>Banco de Questões</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: '0.875rem' }}>
          {data?.total ? `${data.total.toLocaleString('pt-BR')} questões disponíveis` : 'Carregando...'}
        </p>
      </div>

      {/* Search + Filter bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
        <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="question-search"
              type="text"
              className="input"
              placeholder="Buscar questões..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary"><Search size={16} /></button>
        </form>

        <button
          id="toggle-filters-btn"
          className={`btn ${showFilters ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setShowFilters(p => !p)}
          style={{ gap: '0.5rem', position: 'relative' }}
        >
          <SlidersHorizontal size={16} />
          Filtros
          {activeFilters > 0 && (
            <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--accent-blue)', borderRadius: '50%', width: 18, height: 18, fontSize: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="glass animate-fade-in" style={{ borderRadius: 14, padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Especialidade</label>
              <select id="filter-specialty" className="input" value={specialty} onChange={e => { setSpecialty(e.target.value); setPage(1) }} style={{ cursor: 'pointer' }}>
                <option value="">Todas</option>
                {filtersData?.specialties?.map((s: { id: string; name: string }) => (
                  <option key={s.id} value={s.id}>📁 {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Instituição</label>
              <select id="filter-institution" className="input" value={institution} onChange={e => { setInstitution(e.target.value); setPage(1) }}>
                <option value="">Todas</option>
                {filtersData?.institutions?.map((i: { id: string; acronym: string; name: string }) => (
                  <option key={i.id} value={i.id}>{i.acronym} — {i.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Ano</label>
              <select id="filter-year" className="input" value={year} onChange={e => { setYear(e.target.value); setPage(1) }}>
                <option value="">Todos</option>
                {filtersData?.years?.map((y: number) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Dificuldade</label>
              <select id="filter-difficulty" className="input" value={difficulty} onChange={e => { setDifficulty(e.target.value); setPage(1) }}>
                <option value="">Todas</option>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <input id="filter-bookmarked" type="checkbox" checked={bookmarked} onChange={e => { setBookmarked(e.target.checked); setPage(1) }} />
              <Bookmark size={14} />
              Somente favoritas
            </label>

            {activeFilters > 0 && (
              <button className="btn btn-ghost" onClick={clearFilters} style={{ fontSize: '0.8125rem' }}>
                <X size={14} /> Limpar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Questions list */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass" style={{ borderRadius: 12, padding: '1.5rem', opacity: 0.4 + i * 0.1 }}>
              <div style={{ height: 14, background: 'var(--bg-elevated)', borderRadius: 4, width: '80%', marginBottom: 10 }} />
              <div style={{ height: 12, background: 'var(--bg-elevated)', borderRadius: 4, width: '60%' }} />
            </div>
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="glass" style={{ borderRadius: 14, padding: '3rem', textAlign: 'center' }}>
          <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
          <h3 style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Nenhuma questão encontrada</h3>
          <button className="btn btn-ghost" onClick={clearFilters} style={{ marginTop: 12 }}>
            <RefreshCw size={14} /> Limpar filtros
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {isFetching && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: 4 }}>
              <RefreshCw size={14} className="animate-spin" /> Atualizando...
            </div>
          )}

          {data?.data?.map((q: {
            id: string
            statement: string
            year?: number
            difficulty: 'FACIL' | 'MEDIO' | 'DIFICIL'
            specialty?: { name: string }
            institution?: { acronym: string }
            isBookmarked: boolean
          }, idx: number) => (
            <button
              key={q.id}
              id={`question-item-${idx}`}
              onClick={() => navigate(`/questoes/${q.id}`)}
              className="glass glass-hover"
              style={{
                borderRadius: 12, padding: '1.25rem',
                textAlign: 'left', cursor: 'pointer',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'flex-start', gap: '1rem',
                width: '100%',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'rgba(59,130,246,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Outfit', fontWeight: 700, color: 'var(--accent-blue)', fontSize: '0.875rem',
              }}>
                {(page - 1) * 20 + idx + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  dangerouslySetInnerHTML={{ __html: q.statement.replace(/<[^>]+>/g, '').slice(0, 200) + '...' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {q.specialty && <span className="badge badge-blue">{q.specialty.name}</span>}
                  {q.institution && <span className="badge badge-gray">{q.institution.acronym}</span>}
                  {q.year && <span className="badge badge-gray">{q.year}</span>}
                  <span className={`badge ${diffColor[q.difficulty]}`}>{q.difficulty}</span>
                  {q.isBookmarked && <Bookmark size={12} color="var(--accent-gold)" fill="var(--accent-gold)" />}
                </div>
              </div>
              <ChevronRight size={18} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 4 }} />
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button className="btn btn-ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft size={16} /> Anterior
          </button>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Página {page} de {data.totalPages}
          </span>
          <button className="btn btn-ghost" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}>
            Próxima <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
