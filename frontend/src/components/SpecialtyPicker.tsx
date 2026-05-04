import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { questionsApi } from '../lib/api'
import { ChevronRight, ChevronDown, Check, X, BookOpen, Layers, FileText } from 'lucide-react'

interface SpecialtyPickerProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

interface Subtheme { id: string; name: string; questionCount: number }
interface Theme { id: string; name: string; questionCount: number; subthemes: Subtheme[] }
interface Area { id: string; name: string; questionCount: number; themes: Theme[] }

export default function SpecialtyPicker({ selectedIds, onChange }: SpecialtyPickerProps) {
  const [expandedArea, setExpandedArea] = useState<string | null>(null)
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null)

  const { data } = useQuery({
    queryKey: ['specialty-tree'],
    queryFn: questionsApi.specialtyTree,
    staleTime: Infinity,
  })

  const tree: Area[] = data?.tree || []

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id])
  }

  // Select all theme IDs under an area
  const toggleArea = (area: Area) => {
    const allIds = [area.id, ...area.themes.map(t => t.id), ...area.themes.flatMap(t => t.subthemes.map(st => st.id))]
    const allSelected = allIds.every(id => selectedIds.includes(id))
    if (allSelected) {
      onChange(selectedIds.filter(id => !allIds.includes(id)))
    } else {
      onChange([...new Set([...selectedIds, ...allIds])])
    }
  }

  // Select all subtheme IDs under a theme
  const toggleTheme = (theme: Theme, areaId: string) => {
    const allIds = [theme.id, ...theme.subthemes.map(st => st.id)]
    const allSelected = allIds.every(id => selectedIds.includes(id))
    if (allSelected) {
      onChange(selectedIds.filter(id => !allIds.includes(id)))
    } else {
      onChange([...new Set([...selectedIds, ...allIds])])
    }
  }

  const isAreaPartial = (area: Area) => {
    const allIds = [area.id, ...area.themes.map(t => t.id), ...area.themes.flatMap(t => t.subthemes.map(st => st.id))]
    const count = allIds.filter(id => selectedIds.includes(id)).length
    return count > 0 && count < allIds.length
  }

  const isAreaFull = (area: Area) => {
    const allIds = [area.id, ...area.themes.map(t => t.id), ...area.themes.flatMap(t => t.subthemes.map(st => st.id))]
    return allIds.every(id => selectedIds.includes(id))
  }

  return (
    <div className="glass" style={{ borderRadius: 16, padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <BookOpen size={17} color="var(--accent-teal)" />
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>Especialidade</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {selectedIds.length === 0 ? '(Todas)' : `${selectedIds.length} selecionada(s)`}
          </span>
        </div>
        {selectedIds.length > 0 && (
          <button onClick={() => onChange([])} className="btn btn-ghost"
            style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}>
            <X size={12} /> Limpar
          </button>
        )}
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.25rem', marginBottom: '1rem' }}>
        Selecione por grande área, tema ou subtema. Clique na seta para expandir.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {tree.map((area) => {
          const isExpanded = expandedArea === area.id
          const areaFull = isAreaFull(area)
          const areaPartial = isAreaPartial(area)

          return (
            <div key={area.id}>
              {/* Grande Área */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.75rem',
                borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                background: areaFull ? 'rgba(20,184,166,0.12)' : areaPartial ? 'rgba(20,184,166,0.06)' : 'transparent',
                border: `1px solid ${areaFull ? 'rgba(20,184,166,0.3)' : areaPartial ? 'rgba(20,184,166,0.15)' : 'var(--border)'}`,
              }}>
                <button onClick={() => setExpandedArea(isExpanded ? null : area.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text-muted)' }}>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <button onClick={() => toggleArea(area)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left',
                  }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: areaFull ? 'var(--accent-teal)' : areaPartial ? 'rgba(20,184,166,0.4)' : 'var(--bg-elevated)',
                    border: `1px solid ${areaFull || areaPartial ? 'var(--accent-teal)' : 'var(--border)'}`,
                  }}>
                    {(areaFull || areaPartial) && <Check size={12} color="white" strokeWidth={3} />}
                  </div>
                  <Layers size={14} color="var(--accent-teal)" />
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: areaFull ? 'var(--accent-teal)' : 'var(--text-primary)' }}>
                    {area.name}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {area.themes.length} temas
                  </span>
                </button>
              </div>

              {/* Temas */}
              {isExpanded && (
                <div style={{ marginLeft: '1.5rem', borderLeft: '2px solid var(--border)', paddingLeft: '0.75rem', marginTop: '0.25rem' }}>
                  {area.themes.map(theme => {
                    const themeExpanded = expandedTheme === theme.id
                    const themeSelected = selectedIds.includes(theme.id)
                    const hasSubthemes = theme.subthemes.length > 0

                    return (
                      <div key={theme.id}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.625rem',
                          borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                          background: themeSelected ? 'rgba(59,130,246,0.08)' : 'transparent',
                        }}>
                          {hasSubthemes ? (
                            <button onClick={() => setExpandedTheme(themeExpanded ? null : theme.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text-muted)' }}>
                              {themeExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                          ) : <span style={{ width: 14 }} />}
                          <button onClick={() => hasSubthemes ? toggleTheme(theme, area.id) : toggle(theme.id)}
                            style={{
                              flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem',
                              background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left',
                            }}>
                            <div style={{
                              width: 18, height: 18, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: themeSelected ? 'var(--accent-blue)' : 'var(--bg-elevated)',
                              border: `1px solid ${themeSelected ? 'var(--accent-blue)' : 'var(--border)'}`,
                            }}>
                              {themeSelected && <Check size={10} color="white" strokeWidth={3} />}
                            </div>
                            <span style={{ fontSize: '0.8125rem', color: themeSelected ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
                              {theme.name}
                            </span>
                            {hasSubthemes && (
                              <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                {theme.subthemes.length} sub
                              </span>
                            )}
                          </button>
                        </div>

                        {/* Subtemas */}
                        {themeExpanded && hasSubthemes && (
                          <div style={{ marginLeft: '1.25rem', borderLeft: '1px solid var(--border)', paddingLeft: '0.625rem', marginTop: '0.125rem' }}>
                            {theme.subthemes.map(st => {
                              const stSelected = selectedIds.includes(st.id)
                              return (
                                <button key={st.id} onClick={() => toggle(st.id)}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                                    padding: '0.375rem 0.5rem', borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s',
                                    background: stSelected ? 'rgba(139,92,246,0.08)' : 'transparent',
                                    border: 'none', textAlign: 'left',
                                  }}>
                                  <div style={{
                                    width: 16, height: 16, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: stSelected ? '#8B5CF6' : 'var(--bg-elevated)',
                                    border: `1px solid ${stSelected ? '#8B5CF6' : 'var(--border)'}`,
                                  }}>
                                    {stSelected && <Check size={8} color="white" strokeWidth={3} />}
                                  </div>
                                  <FileText size={12} color="var(--text-muted)" />
                                  <span style={{ fontSize: '0.75rem', color: stSelected ? '#8B5CF6' : 'var(--text-muted)' }}>
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
    </div>
  )
}
