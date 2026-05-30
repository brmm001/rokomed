import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { questionsApi } from '../lib/api'
import { ChevronRight, ChevronDown, Check, X, BookOpen, Search } from 'lucide-react'

interface SpecialtyPickerProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

interface Subtheme { id: string; name: string }
interface Theme    { id: string; name: string; subthemes: Subtheme[] }
interface Area     { id: string; name: string; themes: Theme[] }

export default function SpecialtyPicker({ selectedIds, onChange }: SpecialtyPickerProps) {
  const [expandedArea,  setExpandedArea]  = useState<string | null>(null)
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const { data } = useQuery({
    queryKey: ['specialty-tree'],
    queryFn:  questionsApi.specialtyTree,
    staleTime: Infinity,
  })

  const tree: Area[] = data?.tree || []

  // ── helpers de seleção ──────────────────────────────────────────────────────
  const toggle = (id: string) =>
    onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id])

  const areaAllIds = (area: Area) =>
    [area.id, ...area.themes.flatMap(t => [t.id, ...t.subthemes.map(s => s.id)])]

  const themeAllIds = (theme: Theme) =>
    [theme.id, ...theme.subthemes.map(s => s.id)]

  const toggleArea = (area: Area) => {
    const ids = areaAllIds(area)
    const allOn = ids.every(id => selectedIds.includes(id))
    onChange(allOn ? selectedIds.filter(id => !ids.includes(id)) : [...new Set([...selectedIds, ...ids])])
  }

  const toggleTheme = (theme: Theme) => {
    const ids = themeAllIds(theme)
    const allOn = ids.every(id => selectedIds.includes(id))
    onChange(allOn ? selectedIds.filter(id => !ids.includes(id)) : [...new Set([...selectedIds, ...ids])])
  }

  const areaFull    = (area: Area)  => areaAllIds(area).every(id => selectedIds.includes(id))
  const areaPartial = (area: Area)  => areaAllIds(area).some(id => selectedIds.includes(id)) && !areaFull(area)
  const themeFull   = (t: Theme)    => themeAllIds(t).every(id => selectedIds.includes(id))
  const themePartial= (t: Theme)    => themeAllIds(t).some(id => selectedIds.includes(id)) && !themeFull(t)

  // ── filtro de busca ─────────────────────────────────────────────────────────
  const q = search.toLowerCase().trim()
  const filtered = q
    ? tree.map(area => ({
        ...area,
        themes: area.themes
          .map(t => ({ ...t, subthemes: t.subthemes.filter(s => s.name.toLowerCase().includes(q)) }))
          .filter(t => t.name.toLowerCase().includes(q) || t.subthemes.length > 0),
      })).filter(a => a.name.toLowerCase().includes(q) || a.themes.length > 0)
    : tree

  // Quando busca está ativa, expande tudo automaticamente
  const isAreaOpen  = (id: string) => !!q || expandedArea  === id
  const isThemeOpen = (id: string) => !!q || expandedTheme === id

  // ── chips das áreas com seleção (para limpeza rápida) ──────────────────────
  const selectedAreas = tree.filter(a => areaAllIds(a).some(id => selectedIds.includes(id)))

  const removeArea = (area: Area) =>
    onChange(selectedIds.filter(id => !areaAllIds(area).includes(id)))

  // ── estilos reutilizáveis ──────────────────────────────────────────────────
  const rowBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    width: '100%', padding: 0, background: 'none', border: 'none',
    cursor: 'pointer', textAlign: 'left',
  }

  const checkbox = (on: boolean, partial: boolean, color: string): React.CSSProperties => ({
    width: 16, height: 16, borderRadius: 3, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: on ? color : partial ? `${color}55` : 'var(--bg-elevated)',
    border: `1.5px solid ${on || partial ? color : 'var(--border)'}`,
    transition: 'all 0.12s',
  })

  return (
    <div className="glass" style={{ borderRadius: 16, padding: '1.25rem' }}>

      {/* ── cabeçalho ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={16} color="var(--accent-teal)" />
          <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Especialidade</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {selectedIds.length === 0 ? '(Todas)' : `${selectedIds.length} selecionada(s)`}
          </span>
        </div>
        {selectedIds.length > 0 && (
          <button onClick={() => onChange([])} className="btn btn-ghost"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', gap: 4 }}>
            <X size={11} /> Limpar
          </button>
        )}
      </div>

      {/* ── chips das áreas com seleção ──────────────────────────────────── */}
      {selectedAreas.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.625rem' }}>
          {selectedAreas.map(area => (
            <span key={area.id} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.2rem 0.55rem', borderRadius: 20,
              background: areaFull(area) ? 'rgba(20,184,166,0.15)' : 'rgba(20,184,166,0.07)',
              border: '1px solid rgba(20,184,166,0.35)',
              fontSize: '0.72rem', color: 'var(--accent-teal)', fontWeight: 600,
            }}>
              {area.name}
              <button onClick={() => removeArea(area)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', opacity: 0.7 }}>
                <X size={10} color="var(--accent-teal)" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ── busca ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.45rem 0.75rem', borderRadius: 8, marginBottom: '0.625rem',
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      }}>
        <Search size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        <input
          placeholder="Buscar especialidade..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '0.84rem', color: 'var(--text-primary)' }}
        />
        {search && (
          <button onClick={() => setSearch('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
            <X size={12} color="var(--text-muted)" />
          </button>
        )}
      </div>

      {/* ── árvore com scroll ────────────────────────────────────────────── */}
      <div style={{ maxHeight: 280, overflowY: 'auto', overflowX: 'hidden' }}>
        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '1rem 0' }}>
            Nenhuma especialidade encontrada
          </p>
        ) : filtered.map(area => {
          const aOpen = isAreaOpen(area.id)
          const afull = areaFull(area), apart = areaPartial(area)

          return (
            <div key={area.id} style={{ marginBottom: 2 }}>

              {/* ── Grande Área ── */}
              <div style={{
                display: 'flex', alignItems: 'center',
                borderRadius: 8, overflow: 'hidden',
                background: afull ? 'rgba(20,184,166,0.1)' : apart ? 'rgba(20,184,166,0.05)' : 'transparent',
                transition: 'background 0.12s',
              }}>
                {/* chevron expande */}
                <button
                  onClick={() => {
                    setExpandedArea(aOpen && !q ? null : area.id)
                    setExpandedTheme(null)
                  }}
                  style={{ ...rowBase, width: 32, flexShrink: 0, justifyContent: 'center', paddingLeft: 4 }}
                >
                  {aOpen
                    ? <ChevronDown  size={14} color="var(--text-muted)" />
                    : <ChevronRight size={14} color="var(--text-muted)" />}
                </button>

                {/* checkbox + nome seleciona área inteira */}
                <button onClick={() => toggleArea(area)}
                  style={{ ...rowBase, flex: 1, padding: '0.5rem 0.5rem 0.5rem 0' }}>
                  <div style={checkbox(afull, apart, 'var(--accent-teal)')}>
                    {(afull || apart) && <Check size={10} color="white" strokeWidth={3} />}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.84rem', color: afull ? 'var(--accent-teal)' : 'var(--text-primary)', flex: 1 }}>
                    {area.name}
                  </span>
                  <span style={{ fontSize: '0.63rem', color: 'var(--text-muted)', paddingRight: '0.5rem', whiteSpace: 'nowrap' }}>
                    {area.themes.length} temas
                  </span>
                </button>
              </div>

              {/* ── Temas ── */}
              {aOpen && (
                <div style={{ paddingLeft: '1.25rem', borderLeft: '2px solid var(--border)', marginLeft: '0.9rem', marginTop: 2 }}>
                  {area.themes.map(theme => {
                    const tOpen = isThemeOpen(theme.id)
                    const tfull = themeFull(theme), tpart = themePartial(theme)
                    const hasSubs = theme.subthemes.length > 0

                    return (
                      <div key={theme.id} style={{ marginBottom: 1 }}>

                        {/* ── linha do Tema ── */}
                        <div style={{
                          display: 'flex', alignItems: 'center',
                          borderRadius: 6, overflow: 'hidden',
                          background: tfull ? 'rgba(59,130,246,0.08)' : tpart ? 'rgba(59,130,246,0.04)' : 'transparent',
                        }}>
                          {/* chevron subtemas */}
                          {hasSubs ? (
                            <button
                              onClick={() => setExpandedTheme(tOpen && !q ? null : theme.id)}
                              style={{ ...rowBase, width: 26, flexShrink: 0, justifyContent: 'center' }}
                            >
                              {tOpen
                                ? <ChevronDown  size={12} color="var(--text-muted)" />
                                : <ChevronRight size={12} color="var(--text-muted)" />}
                            </button>
                          ) : <span style={{ width: 26, flexShrink: 0 }} />}

                          {/* checkbox + nome */}
                          <button
                            onClick={() => hasSubs ? toggleTheme(theme) : toggle(theme.id)}
                            style={{ ...rowBase, flex: 1, padding: '0.4rem 0.4rem 0.4rem 0' }}
                          >
                            <div style={checkbox(tfull, tpart, 'var(--accent-blue)')}>
                              {(tfull || tpart) && <Check size={9} color="white" strokeWidth={3} />}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: tfull ? 'var(--accent-blue)' : 'var(--text-secondary)', flex: 1 }}>
                              {theme.name}
                            </span>
                            {hasSubs && (
                              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', paddingRight: '0.25rem', whiteSpace: 'nowrap' }}>
                                {theme.subthemes.length} sub
                              </span>
                            )}
                          </button>
                        </div>

                        {/* ── Subtemas ── */}
                        {tOpen && hasSubs && (
                          <div style={{ paddingLeft: '1rem', borderLeft: '1px dashed var(--border)', marginLeft: '0.7rem', marginTop: 1 }}>
                            {theme.subthemes.map(st => {
                              const stOn = selectedIds.includes(st.id)
                              return (
                                <button key={st.id} onClick={() => toggle(st.id)}
                                  style={{
                                    ...rowBase, padding: '0.3rem 0.4rem',
                                    borderRadius: 5,
                                    background: stOn ? 'rgba(139,92,246,0.08)' : 'transparent',
                                  }}
                                >
                                  <div style={checkbox(stOn, false, '#8B5CF6')}>
                                    {stOn && <Check size={8} color="white" strokeWidth={3} />}
                                  </div>
                                  <span style={{ fontSize: '0.775rem', color: stOn ? '#8B5CF6' : 'var(--text-muted)' }}>
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
