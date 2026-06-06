import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { glossaryTerms } from '../data/glossaryData'
import { updateSEOMetadata } from '../lib/seo'
import { ArrowLeft, ChevronRight, Stethoscope, ShieldCheck, HeartPulse, HelpCircle } from 'lucide-react'

export default function GlossaryDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const termData = glossaryTerms.find(t => t.slug === slug)

  useEffect(() => {
    if (termData) {
      const pageUrl = `https://rokomed.com.br/glossario/${termData.slug}`
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'DefinedTerm',
        'name': termData.term,
        'description': termData.definition,
        'url': pageUrl,
        'inDefinedTermSet': {
          '@type': 'DefinedTermSet',
          'name': 'Glossário RokoMed',
          'url': 'https://rokomed.com.br/glossario'
        }
      }

      updateSEOMetadata(
        `${termData.term} — Sintomas, Diagnóstico e Tratamento`,
        termData.definition,
        schema
      )
    }
  }, [termData])

  if (!termData) {
    return (
      <div className="gd-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#030812', color: '#C8DCF5' }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'white', fontFamily: 'Outfit' }}>Termo não encontrado</h1>
          <p style={{ marginTop: 8, color: '#7B9DBF' }}>Desculpe, o termo médico que você procura não está em nosso glossário.</p>
          <Link to="/glossario" className="ap-btn ap-btn-primary" style={{ marginTop: 24, padding: '10px 20px', borderRadius: 8, fontSize: '13px' }}>
            Voltar ao Glossário
          </Link>
        </div>
      </div>
    )
  }

  // Sidebar: other terms
  const sidebarTerms = glossaryTerms.filter(t => t.slug !== slug).slice(0, 5)

  return (
    <div className="gd-root">
      <style>{`
        .gd-root {
          background-color: #030812;
          min-height: 100vh;
          color: #C8DCF5;
          font-family: 'Inter', sans-serif;
          padding: 100px 0 60px;
        }
        .gd-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .gd-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #7B9DBF;
          margin-bottom: 32px;
        }
        .gd-breadcrumb a {
          color: #7B9DBF;
          text-decoration: none;
        }
        .gd-breadcrumb a:hover {
          color: white;
        }
        .gd-layout {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 48px;
        }
        .gd-article {
          background: #070F1E;
          border: 1px solid rgba(100, 160, 255, 0.08);
          border-radius: 20px;
          padding: 40px;
        }
        .gd-title {
          font-family: 'Outfit', sans-serif;
          font-size: 36px;
          font-weight: 800;
          color: white;
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin-bottom: 20px;
        }
        .gd-def-box {
          font-size: 16px;
          line-height: 1.6;
          color: #EBF4FF;
          border-left: 4px solid #3B7EF8;
          padding-left: 18px;
          margin-bottom: 36px;
        }
        .gd-sec-title {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: white;
          margin: 32px 0 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .gd-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 24px;
        }
        .gd-list li {
          display: flex;
          align-items: start;
          gap: 8px;
          font-size: 14.5px;
          line-height: 1.5;
        }
        .gd-paragraph {
          font-size: 14.5px;
          line-height: 1.6;
          color: #C8DCF5;
          margin-bottom: 24px;
        }
        /* CTA Card */
        .gd-cta {
          margin-top: 48px;
          background: linear-gradient(135deg, rgba(59, 126, 248, 0.1) 0%, rgba(165, 195, 247, 0.05) 100%);
          border: 1px solid rgba(59, 126, 248, 0.2);
          border-radius: 16px;
          padding: 28px;
          text-align: center;
        }
        .gd-cta-title {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: white;
        }
        .gd-cta-desc {
          font-size: 13.5px;
          color: #7B9DBF;
          margin: 8px 0 20px;
        }
        /* Sidebar */
        .gd-sidebar-box {
          background: #070F1E;
          border: 1px solid rgba(100, 160, 255, 0.08);
          border-radius: 20px;
          padding: 24px;
          align-self: start;
        }
        .gd-sidebar-title {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: white;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(100, 160, 255, 0.08);
        }
        .gd-sidebar-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .gd-sidebar-link {
          color: #7B9DBF;
          font-size: 13.5px;
          text-decoration: none;
          transition: color 0.2s;
          display: block;
        }
        .gd-sidebar-link:hover {
          color: white;
        }
        @media (max-width: 768px) {
          .gd-layout {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .gd-article {
            padding: 24px;
          }
        }
      `}</style>

      <div className="gd-container">
        {/* Breadcrumb Navigation for SEO */}
        <div className="gd-breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={12} />
          <Link to="/glossario">Glossário</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'white' }}>{termData.term}</span>
        </div>

        <div className="gd-layout">
          {/* Main Content */}
          <article className="gd-article">
            <h1 className="gd-title">{termData.term}</h1>
            <div className="gd-def-box">{termData.definition}</div>

            <h2 className="gd-sec-title">
              <Stethoscope size={18} color="#3B7EF8" /> Sintomas e Sinais Clínicos
            </h2>
            <ul className="gd-list">
              {termData.symptoms.map((sym, idx) => (
                <li key={idx}>
                  <CheckCircle2 size={15} color="#10B981" style={{ marginTop: 3, flexShrink: 0 }} />
                  <span>{sym}</span>
                </li>
              ))}
            </ul>

            <h2 className="gd-sec-title">
              <HelpCircle size={18} color="#3B7EF8" /> Critérios Diagnósticos
            </h2>
            <p className="gd-paragraph">{termData.diagnosis}</p>

            <h2 className="gd-sec-title">
              <HeartPulse size={18} color="#3B7EF8" /> Conduta e Tratamento
            </h2>
            <p className="gd-paragraph">{termData.treatment}</p>

            {/* CTA Box */}
            <div className="gd-cta">
              <h3 className="gd-cta-title">Estude {termData.term} no RokoMed</h3>
              <p className="gd-cta-desc">
                Faça simulados personalizados e revise este tema com suporte da nossa Inteligência Artificial (Dr. André).
              </p>
              <Link to="/register" className="ap-btn ap-btn-primary" style={{ borderRadius: 8, padding: '12px 24px' }}>
                Criar Conta Grátis
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="gd-sidebar-box">
            <h3 className="gd-sidebar-title">Outros Termos Médicos</h3>
            <ul className="gd-sidebar-list">
              {sidebarTerms.map(t => (
                <li key={t.slug}>
                  <Link to={`/glossario/${t.slug}`} className="gd-sidebar-link">
                    {t.term}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  )
}
// Helper component for checklist bullet
function CheckCircle2({ size, color, style }: { size: number; color: string; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
