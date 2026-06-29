import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { questionsApi } from '../lib/api'
import { openPrintWindow, type PrintQuestion } from './PrintView'
import {
  Printer, X, CheckSquare, Square, Loader2,
  BookOpen, ChevronRight, ChevronLeft, CheckCircle2, FileText
} from 'lucide-react'

interface RawQuestion {
  id: string
  statement: string
  options?: { letter: string; text: string }[]
  correctOption?: string
  year?: number
  difficulty: string
  specialty?: { name: string }
  institution?: { acronym: string }
}

interface Props {
  filters: {
    search: string
    specialty: string
    institution: string
    year: string
    difficulty: string
    bookmarked: boolean
    wrongOnly: boolean
  }
  onClose: () => void
}

const DIFF_LABEL: Record<string, string> = { FACIL: 'Fácil', MEDIO: 'Médio', DIFICIL: 'Difícil' }
const DIFF_COLOR: Record<string, string> = { FACIL: '#10B981', MEDIO: '#F59E0B', DIFICIL: '#EF4444' }

export default function PrintSelectorModal({ filters, onClose }: Props) {
  const [printPage, setPrintPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [printing, setPrinting] = useState(false)

  // Busca as questões com opções completas usando limit=20
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['print-questions', printPage, filters],
    queryFn: () => questionsApi.list({
      page: printPage,
      limit: 20,
      ...(filters.search      && { search: filters.search }),
      ...(filters.specialty   && { specialtyId: filters.specialty }),
      ...(filters.institution && { institutionId: filters.institution }),
      ...(filters.year        && { year: parseInt(filters.year) }),
      ...(filters.difficulty  && { difficulty: filters.difficulty }),
      ...(filters.bookmarked  && { bookmarked: true }),
      ...(filters.wrongOnly   && { wrongOnly: true }),
    }),
    staleTime: 30_000,
  })

  const questions: RawQuestion[] = data?.data ?? []
  const totalPages: number = data?.totalPages ?? 1

  // Quando mudar a página, seleciona tudo da nova página automaticamente
  useEffect(() => {
    if (questions.length > 0) {
      setSelected(new Set(questions.map(q => q.id)))
    }
  }, [printPage, data])

  const toggleOne = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    const allIds = questions.map(q => q.id)
    const allSelected = allIds.every(id => selected.has(id))
    if (allSelected) {
      setSelected(prev => {
        const next = new Set(prev)
        allIds.forEach(id => next.delete(id))
        return next
      })
    } else {
      setSelected(prev => {
        const next = new Set(prev)
        allIds.forEach(id => next.add(id))
        return next
      })
    }
  }

  const handlePrint = async () => {
    const toPrint = questions.filter(q => selected.has(q.id))
    if (toPrint.length === 0) return

    setPrinting(true)
    try {
      // Busca dados completos (com opções) para cada questão selecionada em paralelo
      const fullQuestions = await Promise.all(
        toPrint.map(q =>
          questionsApi.get(q.id).then((full: RawQuestion) => full).catch(() => null)
        )
      )

      const printList: PrintQuestion[] = fullQuestions
        .filter(Boolean)
        .map((q, i) => ({
          number: i + 1,
          statement: q!.statement,
          options: Array.isArray(q!.options) ? q!.options : [],
          correctOption: q!.correctOption,
          year: q!.year,
          institution: q!.institution?.acronym,
          specialty: q!.specialty?.name,
        }))

      openPrintWindow('Banco de Questões — RokoMed', printList)
    } finally {
      setPrinting(false)
    }
  }

  const allSelectedOnPage = questions.length > 0 && questions.every(q => selected.has(q.id))
  const someSelectedOnPage = questions.some(q => selected.has(q.id))

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--bg-surface, #0d1b2e)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 22,
        width: '100%', maxWidth: 640,
        maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 1.75rem 1rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(59,130,246,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Printer size={22} color="var(--accent-blue, #3B7EF8)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>Selecionar Questões para Imprimir</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {selected.size} questão{selected.size !== 1 ? 'ões' : ''} selecionada{selected.size !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 10,
              width: 36, height: 36, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={18} color="var(--text-muted)" />
          </button>
        </div>

        {/* Toolbar: selecionar todos + paginação */}
        <div style={{
          padding: '0.75rem 1.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          background: 'rgba(255,255,255,0.02)',
        }}>
          <button
            onClick={toggleAll}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: allSelectedOnPage ? 'var(--accent-blue, #3B7EF8)' : 'var(--text-muted)',
              fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif',
              padding: '0.375rem 0.625rem', borderRadius: 8,
              transition: 'background 0.15s',
            }}
          >
            {allSelectedOnPage
              ? <CheckSquare size={16} />
              : someSelectedOnPage
                ? <CheckSquare size={16} style={{ opacity: 0.5 }} />
                : <Square size={16} />}
            {allSelectedOnPage ? 'Desmarcar todos' : 'Selecionar todos desta página'}
          </button>

          {/* Mini paginação */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setPrintPage(p => Math.max(1, p - 1))}
                disabled={printPage === 1 || isFetching}
                style={{
                  background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8,
                  width: 30, height: 30, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: printPage === 1 ? 0.3 : 1,
                }}
              >
                <ChevronLeft size={14} color="var(--text-muted)" />
              </button>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: 60, textAlign: 'center' }}>
                {printPage} / {totalPages}
              </span>
              <button
                onClick={() => setPrintPage(p => Math.min(totalPages, p + 1))}
                disabled={printPage === totalPages || isFetching}
                style={{
                  background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8,
                  width: 30, height: 30, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: printPage === totalPages ? 0.3 : 1,
                }}
              >
                <ChevronRight size={14} color="var(--text-muted)" />
              </button>
            </div>
          )}
        </div>

        {/* Lista de questões */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.75rem' }}>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: 12 }}>
              <Loader2 size={22} color="var(--accent-blue)" className="animate-spin" />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Carregando questões...</span>
            </div>
          ) : questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <BookOpen size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
              <div>Nenhuma questão encontrada</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {isFetching && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 4 }}>
                  <Loader2 size={13} className="animate-spin" /> Carregando...
                </div>
              )}
              {questions.map((q, idx) => {
                const isChecked = selected.has(q.id)
                return (
                  <button
                    key={q.id}
                    onClick={() => toggleOne(q.id)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                      padding: '0.875rem 1rem',
                      borderRadius: 12,
                      border: `1px solid ${isChecked ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.07)'}`,
                      background: isChecked ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                      width: '100%',
                    }}
                  >
                    {/* Checkbox visual */}
                    <div style={{
                      width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                      border: `2px solid ${isChecked ? 'var(--accent-blue, #3B7EF8)' : 'rgba(255,255,255,0.2)'}`,
                      background: isChecked ? 'var(--accent-blue, #3B7EF8)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s', marginTop: 2,
                    }}>
                      {isChecked && <CheckCircle2 size={13} color="#fff" />}
                    </div>

                    {/* Número */}
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: 'rgba(59,130,246,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Outfit', fontWeight: 700, color: 'var(--accent-blue)', fontSize: '0.75rem',
                    }}>
                      {(printPage - 1) * 20 + idx + 1}
                    </div>

                    {/* Conteúdo */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.8375rem', color: 'var(--text-primary)', lineHeight: 1.5,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}
                        dangerouslySetInnerHTML={{
                          __html: q.statement.replace(/<[^>]+>/g, '').slice(0, 160) + '...'
                        }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
                        {q.specialty && (
                          <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 99, background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)' }}>
                            {q.specialty.name}
                          </span>
                        )}
                        {q.institution && (
                          <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 99, background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
                            {q.institution.acronym}
                          </span>
                        )}
                        {q.year && (
                          <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 99, background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
                            {q.year}
                          </span>
                        )}
                        <span style={{
                          fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 99,
                          background: `${DIFF_COLOR[q.difficulty]}22`,
                          color: DIFF_COLOR[q.difficulty],
                        }}>
                          {DIFF_LABEL[q.difficulty] ?? q.difficulty}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.75rem 1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '0.875rem',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, cursor: 'pointer',
              fontWeight: 600, fontSize: '0.9rem',
              color: 'var(--text-secondary)', fontFamily: 'Outfit, sans-serif',
            }}
          >
            Cancelar
          </button>
          <button
            id="print-selected-btn"
            onClick={handlePrint}
            disabled={selected.size === 0 || printing}
            style={{
              flex: 2, padding: '0.875rem',
              background: selected.size === 0 ? 'rgba(59,130,246,0.3)' : 'var(--accent-blue, #3B7EF8)',
              border: 'none', borderRadius: 12, cursor: selected.size === 0 ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: '0.9rem', color: '#fff',
              fontFamily: 'Outfit, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.2s',
            }}
          >
            {printing ? (
              <><Loader2 size={17} className="animate-spin" /> Preparando...</>
            ) : (
              <><FileText size={17} /> Imprimir {selected.size} questão{selected.size !== 1 ? 'ões' : ''}</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
