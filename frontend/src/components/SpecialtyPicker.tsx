import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { questionsApi } from '../lib/api'
import {
  ChevronRight, ChevronDown, Check, X, BookOpen,
  Layers, FileText, Search, ChevronUp,
} from 'lucide-react'

interface SpecialtyPickerProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

interface Subtheme { id: string; name: string; questionCount: number }
interface Theme { id: string; name: string; questionCount: number; subthemes: Subtheme[] }
interface Area { id: string; name: string; questionCount: number; themes: Theme[] }

export default function SpecialtyPicker({ selectedIds, onChange }: SpecialtyPickerProps) {
  const [open, setOpen] = useState(false)
  const [expandedArea, setExpandedArea] = useState<string | null>(null)
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const { data } = useQuery({
    queryKey: ['specialty-tree'],
    queryFn: questionsApi.specialtyTree,
    staleTime: Infinity,
  })

  const tree: Area[] = data?.tree || []

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id])
  }

  const toggleArea = (area: Area) => {
    const allIds = [area.id, ...area.themes.map(t => t.id), ...area.themes.flatMap(t => t.subthemes.map(st => st.id))]
    const allSelected = allIds.every(id => selectedIds.includes(id))
    if (allSelected) onChange(selectedIds.filter(id => !allIds.includes(id)))
    else onChange([...new Set([...selectedIds, ...allIds])])
  }

  const toggleTheme = (theme: Theme) => {
    const allIds = [theme.id, ...theme.subthemes.map(st => st.id)]
    const allSelected = allIds.every(id => selectedIds.includes(id))
    if (allSelected) onChange(selectedIds.filter(id => !allIds.includes(id)))
    else onChange([...new Set([...selectedIds, ...allIds])])
  }

  const isAreaFull = (area: Area) => {
    const allIds = [area.id, ...area.themes.map(t => t.id), ...area.themes.flatMap(t => t.subthemes.map(st => st.id))]
    return allIds.every(id => selectedIds.includes(id))
  }
  const isAreaPartial = (area: Area) => {
    const allIds = [area.id, ...area.themes.map(t => t.id), ...area.themes.flatMap(t => t.subthemes.map(st => st.id))]
    const count = allIds.filter(id => selectedIds.includes(id)).length
    return count > 0 && count < allIds.length
  }

  // Filtra a árvore pela busca
  const q = search.toLowerCase().trim()
  const filteredTree = q
    ? tree
        .map(area => ({
          ...area,
          themes: area.themes
            .map(theme => ({
              ...theme,
              subthemes: theme.subthemes.filter(st => st.name.toLowerCase().includes(q)),
            }))
            .filter(theme => theme.name.toLowerCase().includes(q) || theme.subthemes.length > 0),
        }))
        .filter(area => area.name.toLowerCase().includes(q) || area.themes.length > 0)
    : tree

  // Tags das grandes áreas selecionadas (para exibir abaixo do trigger)
  const selectedAreaTags = tree.filter(area =>
    [area.id, ...area.themes.map(t => t.id), ...area.themes.flatMap(t => t.subthemes.map(st => st.id))]
      .some(id => selectedIds.includes(id))
  )

  const removeArea = (area: Area) => {
    const allIds = [area.id, ...area.themes.map(t => t.id), ...area.themes.flatMap(t => t.subthemes.map(st => st.id))]
    onChange(selectedIds.filter(id => !allIds.includes(id)))
  }

  return (
    <div className="glass" style={{ borderRadius: 16, padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <BookOpen size={17} color="var(--accent-teal)" />
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>Especialidade</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {selectedIds.length === 0 ? '(Todas)' : `${selectedIds.length} selecionada(s)`}
          </span>
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="btn btn-ghost"
            style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
          >
            <X size={12} /> Limpar
          </button>
        )}
      </div>

      {/* Tags das grandes áreas selecionadas */}
      {selectedAreaTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.75rem' }}>
          {selectedAreaTags.map(area => (
            <span
              key={area.id}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.25rem 0.625rem', borderRadius: 20,
                background: isAreaFull(area) ? 'rgba(20,184,166,0.15)' : 'rgba(20,184,166,0.07)',
                border: '1px solid rgba(20,184,166,0.3)',
                fontSize: '0.75rem', color: 'var(--accent-teal)', fontWeight: 600,
              }}
            >
              {area.name}
              <button
                onClick={() => removeArea(area)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--accent-teal)', opacity: 0.7 }}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown container */}
      <div ref={containerRef} style={{ position: 'relative' }}>
        {/* Trigger button */}
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.625rem 0.875rem', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
            background: open ? 'rgba(20,184,166,0.08)' : 'var(--bg-elevated)',
            border: `1px solid ${open ? 'rgba(20,184,166,0.4)' : 'var(--border)'}`,
            color: 'var(--text-secondary)', fontSize: '0.875rem',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={15} color="var(--accent-teal)" />
            {selectedIds.length === 0
              ? 'Selecionar especialidades...'
              : `${selectedIds.length} especialidade(s) selecionada(s)`}
          </span>
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {/* Popover */}
        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          }}>
            {/* Search */}
            <div style={{ padding: '0.625rem 0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <input
                autoFocus
                placeholder="Buscar especialidade..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  fontSize: '0.875rem', color: 'var(--text-primary)',
                }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Tree — scrollable, max 320px */}
            <div style={{ maxHeight: 320, overflowY: 'auto', padding: '0.5rem' }}>
              {filteredTree.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '1rem' }}>
                  Nenhuma especialidade encontrada
                </p>
              ) : filteredTree.map(area => {
                const isExpanded = expandedArea === area.id || !!q
                const areaFull = isAreaFull(area)
                const areaPartial = isAreaPartial(area)

                return (
                  <div key={area.id}>
                    {/* Grande Área */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.375rem',
                      padding: '0.5rem 0.5rem', borderRadius: 8, transition: 'all 0.12s',
                      background: areaFull ? 'rgba(20,184,166,0.1)' : areaPartial ? 'rgba(20,184,166,0.05)' : 'transparent',
                    }}>
                      <button
                        onClick={() => setExpandedArea(isExpanded && !q ? null : area.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', color: 'var(--text-muted)', flexShrink: 0 }}
                      >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                      <button
                        onClick={() => toggleArea(area)}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                      >
                        <div style={{
                          width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: areaFull ? 'var(--accent-teal)' : areaPartial ? 'rgba(20,184,166,0.4)' : 'var(--bg-elevated)',
                          border: `1px solid ${areaFull || areaPartial ? 'var(--accent-teal)' : 'var(--border)'}`,
                        }}>
                          {(areaFull || areaPartial) && <Check size={11} color="white" strokeWidth={3} />}
                        </div>
                        <Layers size={13} color="var(--accent-teal)" style={{ flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: areaFull ? 'var(--accent-teal)' : 'var(--text-primary)' }}>
                          {area.name}
                        </span>
                        <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                          {area.themes.length} temas
                        </span>
                      </button>
                    </div>

                    {/* Temas */}
                    {isExpanded && (
                      <div style={{ marginLeft: '1.5rem', borderLeft: '1px solid var(--border)', paddingLeft: '0.5rem', marginBottom: '0.25rem' }}>
                        {area.themes.map(theme => {
                          const themeExpanded = expandedTheme === theme.id || !!q
                          const themeSelected = selectedIds.includes(theme.id)
                          const hasSubthemes = theme.subthemes.length > 0

                          return (
                            <div key={theme.id}>
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                padding: '0.375rem 0.5rem', borderRadius: 6, transition: 'all 0.12s',
                                background: themeSelected ? 'rgba(59,130,246,0.07)' : 'transparent',
                              }}>
                                {hasSubthemes ? (
                                  <button
                                    onClick={() => setExpandedTheme(themeExpanded && !q ? null : theme.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', color: 'var(--text-muted)', flexShrink: 0 }}
                                  >
                                    {themeExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                  </button>
                                ) : <span style={{ width: 18 }} />}
                                <button
                                  onClick={() => hasSubthemes ? toggleTheme(theme) : toggle(theme.id)}
                                  style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                                >
                                  <div style={{
                                    width: 16, height: 16, borderRadius: 3, flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: themeSelected ? 'var(--accent-blue)' : 'var(--bg-elevated)',
                                    border: `1px solid ${themeSelected ? 'var(--accent-blue)' : 'var(--border)'}`,
                                  }}>
                                    {themeSelected && <Check size={9} color="white" strokeWidth={3} />}
                                  </div>
                                  <span style={{ fontSize: '0.8rem', color: themeSelected ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
                                    {theme.name}
                                  </span>
                                  {hasSubthemes && (
                                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                                      {theme.subthemes.length} sub
                                    </span>
                                  )}
                                </button>
                              </div>

                              {/* Subtemas */}
                              {themeExpanded && hasSubthemes && (
                                <div style={{ marginLeft: '1.25rem', borderLeft: '1px solid var(--border)', paddingLeft: '0.5rem', marginBottom: '0.125rem' }}>
                                  {theme.subthemes.map(st => {
                                    const stSelected = selectedIds.includes(st.id)
                                    return (
                                      <button key={st.id} onClick={() => toggle(st.id)}
                                        style={{
                                          display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%',
                                          padding: '0.3rem 0.5rem', borderRadius: 5, cursor: 'pointer', transition: 'all 0.12s',
                                          background: stSelected ? 'rgba(139,92,246,0.08)' : 'transparent',
                                          border: 'none', textAlign: 'left',
                                        }}
                                      >
                                        <div style={{
                                          width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          background: stSelected ? '#8B5CF6' : 'var(--bg-elevated)',
                                          border: `1px solid ${stSelected ? '#8B5CF6' : 'var(--border)'}`,
                                        }}>
                                          {stSelected && <Check size={8} color="white" strokeWidth={3} />}
                                        </div>
                                        <FileText size={11} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.775rem', color: stSelected ? '#8B5CF6' : 'var(--text-muted)' }}>
                                          {st.name}
                                        </span>
                                      </button>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Footer com atalho */}
            <div style={{
              borderTop: '1px solid var(--border)', padding: '0.5rem 0.75rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {selectedIds.length > 0 ? `${selectedIds.length} selecionada(s)` : 'Nenhuma — todas incluídas'}
              </span>
              <button
                onClick={() => setOpen(false)}
                className="btn btn-primary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.875rem', borderRadius: 8 }}
              >
                Confirmar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
