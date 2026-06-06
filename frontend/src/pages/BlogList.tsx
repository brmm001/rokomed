import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { blogPosts } from '../data/blogData'
import { updateSEOMetadata } from '../lib/seo'
import { Calendar, Clock, User, ArrowRight } from 'lucide-react'

export default function BlogListPage() {
  useEffect(() => {
    updateSEOMetadata(
      'Blog RokoMed — Dicas de Estudos e Residência Médica',
      'Artigos e guias práticos sobre editais de residência médica (ENARE, USP, UNIFESP), dicas de produtividade e metodologia de estudo ativo.'
    )
  }, [])

  return (
    <div className="bl-list-root">
      <style>{`
        .bl-list-root {
          background-color: #030812;
          min-height: 100vh;
          color: #C8DCF5;
          font-family: 'Inter', sans-serif;
          padding: 80px 0 60px;
        }
        .bl-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .bl-header {
          text-align: center;
          margin-bottom: 56px;
        }
        .bl-logo {
          font-family: 'Outfit', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: white;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 24px;
        }
        .bl-logo span {
          color: #3B7EF8;
        }
        .bl-title {
          font-family: 'Outfit', sans-serif;
          font-size: 36px;
          font-weight: 800;
          color: white;
          letter-spacing: -0.02em;
        }
        .bl-subtitle {
          font-size: 15px;
          color: #7B9DBF;
          margin-top: 8px;
        }
        .bl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 32px;
        }
        .bl-card {
          background: #070F1E;
          border: 1px solid rgba(100, 160, 255, 0.08);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          text-decoration: none;
        }
        .bl-card:hover {
          transform: translateY(-4px);
          border-color: rgba(100, 160, 255, 0.2);
          background: #0C1A30;
        }
        .bl-card-cover {
          height: 160px;
          background: linear-gradient(135deg, #0C1A30 0%, #172B4C 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          color: #3B7EF8;
          font-size: 20px;
          border-bottom: 1px solid rgba(100, 160, 255, 0.08);
        }
        .bl-card-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .bl-card-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #7B9DBF;
          margin-bottom: 12px;
        }
        .bl-card-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .bl-card-title {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: white;
          line-height: 1.3;
          margin-bottom: 10px;
        }
        .bl-card-excerpt {
          font-size: 13.5px;
          color: #7B9DBF;
          line-height: 1.5;
          margin-bottom: 24px;
        }
        .bl-card-link {
          margin-top: auto;
          font-size: 13.5px;
          font-weight: 600;
          color: #3B7EF8;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        @media (max-width: 600px) {
          .bl-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="bl-container">
        <header className="bl-header">
          <Link to="/" className="bl-logo">
            Roko<span>Med</span>
          </Link>
          <h1 className="bl-title">Blog RokoMed</h1>
          <p className="bl-subtitle">Guias estratégicos, análises de editais e dicas sobre como estudar ativamente para a residência.</p>
        </header>

        <div className="bl-grid">
          {blogPosts.map(post => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="bl-card">
              <div className="bl-card-cover">
                RokoMed Blog
              </div>
              <div className="bl-card-body">
                <div className="bl-card-meta">
                  <span>
                    <Calendar size={13} /> {new Date(post.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span>
                    <Clock size={13} /> {post.readTime}
                  </span>
                </div>
                <h2 className="bl-card-title">{post.title}</h2>
                <p className="bl-card-excerpt">{post.excerpt}</p>
                <span className="bl-card-link">
                  Ler artigo completo <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
