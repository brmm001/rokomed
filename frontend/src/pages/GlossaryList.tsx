import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { glossaryTerms } from '../data/glossaryData'
import { updateSEOMetadata } from '../lib/seo'
import { Search, BookOpen, ArrowRight } from 'lucide-react'

export default function GlossaryListPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)

  useEffect(() => {
    updateSEOMetadata(
      'Glossário Médico de Residência Médica',
      'Consulte a definição, sintomas, critérios diagnósticos e tratamento das patologias mais cobradas nas provas de residência médica (USP, ENARE, UNICAMP).'
    )
  }, [])

  // Filter terms by search query and letter
  const filteredTerms = glossaryTerms.filter(item => {
    const matchesSearch = item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.definition.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLetter = selectedLetter ? item.term.toUpperCase().startsWith(selectedLetter) : true
    return matchesSearch && matchesLetter
  })

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
    <div className="gl-list-root">
      <style>{`
        .gl-list-root {
          background-color: #030812;
          min-height: 100vh;
          color: #C8DCF5;
          font-family: 'Inter', sans-serif;
          padding: 80px 0 60px;
        }
        .gl-container {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .gl-header {
          text-align: center;
          margin-bottom: 48px;
        }
        .gl-logo {
          font-family: 'Outfit', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: white;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 24px;
        }
        .gl-logo span {
          color: #3B7EF8;
        }
        .gl-title {
          font-family: 'Outfit', sans-serif;
          font-size: 36px;
          font-weight: 800;
          color: white;
          letter-spacing: -0.02em;
        }
        .gl-subtitle {
          font-size: 15px;
          color: #7B9DBF;
          margin-top: 8px;
        }
        .gl-search-bar {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(100, 160, 255, 0.1);
          border-radius: 12px;
          padding: 6px 14px;
          margin-bottom: 32px;
        }
        .gl-search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          padding: 10px;
          outline: none;
          font-size: 14px;
        }
        .gl-search-input::placeholder {
          color: #4F6D8C;
        }
        .gl-alphabet {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 40px;
          justify-content: center;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(100, 160, 255, 0.08);
        }
        .gl-letter-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid rgba(100, 160, 255, 0.08);
          background: transparent;
          color: #7B9DBF;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gl-letter-btn:hover, .gl-letter-btn.active {
          background: #3B7EF8;
          color: white;
          border-color: #3B7EF8;
        }
        .gl-letter-btn.all {
          width: auto;
          padding: 0 12px;
        }
        .gl-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        .gl-card {
          background: #070F1E;
          border: 1px solid rgba(100, 160, 255, 0.08);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.2s;
          text-decoration: none;
          display: block;
        }
        .gl-card:hover {
          transform: translateY(-2px);
          border-color: rgba(100, 160, 255, 0.2);
          background: #0C1A30;
        }
        .gl-term-name {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .gl-term-desc {
          font-size: 14px;
          color: #7B9DBF;
          margin-top: 8px;
          line-height: 1.5;
        }
        .gl-empty {
          text-align: center;
          padding: 40px;
          color: #4F6D8C;
        }
      `}</style>

      <div className="gl-container">
        <header className="gl-header">
          <Link to="/" className="gl-logo">
            Roko<span>Med</span>
          </Link>
          <h1 className="gl-title">Glossário de Termos Médicos</h1>
          <p className="gl-subtitle">Guia de consulta rápida com definições, diagnósticos e tratamentos das patologias recorrentes em provas.</p>
        </header>

        {/* Search Bar */}
        <div className="gl-search-bar">
          <Search size={18} color="#4F6D8C" />
          <input
            type="text"
            placeholder="Pesquisar termo médico (ex: Apendicite, Dengue)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="gl-search-input"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: '#4F6D8C', cursor: 'pointer', fontSize: '12px' }}>Limpar</button>
          )}
        </div>

        {/* Alphabet Navigation */}
        <div className="gl-alphabet">
          <button
            className={`gl-letter-btn all ${selectedLetter === null ? 'active' : ''}`}
            onClick={() => setSelectedLetter(null)}
          >
            Todos
          </button>
          {alphabet.map(letter => (
            <button
              key={letter}
              className={`gl-letter-btn ${selectedLetter === letter ? 'active' : ''}`}
              onClick={() => setSelectedLetter(letter)}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Terms Grid */}
        <div className="gl-grid">
          {filteredTerms.length > 0 ? (
            filteredTerms.map(item => (
              <Link key={item.slug} to={`/glossario/${item.slug}`} className="gl-card">
                <div className="gl-term-name">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <BookOpen size={18} color="#3B7EF8" /> {item.term}
                  </span>
                  <ArrowRight size={16} color="#4F6D8C" />
                </div>
                <p className="gl-term-desc">{item.definition}</p>
              </Link>
            ))
          ) : (
            <div className="gl-empty">
              Nenhum termo encontrado correspondente aos filtros.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
