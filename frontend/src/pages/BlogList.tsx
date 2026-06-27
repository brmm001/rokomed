import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { blogPosts } from '../data/blogData'
import { updateSEOMetadata } from '../lib/seo'
import { Calendar, Clock, ArrowRight, Search, Sparkles, BookOpen } from 'lucide-react'
import BlogHeader from '../components/BlogHeader'
import { postMetadataMap, defaultMetadata } from '../data/blogMetadata'

export default function BlogListPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todas')

  useEffect(() => {
    updateSEOMetadata(
      'Blog RokoMed — Dicas de Estudos, Especialidades e Residência Médica',
      'Artigos, remuneração real das especialidades, guias práticos sobre editais de residência médica (ENARE, USP, UNIFESP) e metodologia de estudo ativo.'
    )
  }, [])

  const categories = ['Todas', 'Carreira & Salário', 'Metodologia', 'Editais & Provas']

  // Filter posts
  const filteredPosts = blogPosts.filter(post => {
    const meta = postMetadataMap[post.slug] || defaultMetadata
    const matchesCategory = selectedCategory === 'Todas' || meta.category === selectedCategory
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  return (
    <div className="bl-list-root">
      <BlogHeader />
      
      <style>{`
        .bl-list-root {
          background-color: #030812;
          min-height: 100vh;
          color: #C8DCF5;
          font-family: 'Inter', sans-serif;
          padding: 120px 0 80px;
          position: relative;
          overflow: hidden;
        }
        
        /* Premium Background Glows */
        .bl-bg-glow-1 {
          position: absolute;
          top: -200px;
          right: -200px;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 126, 248, 0.15) 0%, rgba(3, 8, 18, 0) 70%);
          pointer-events: none;
          z-index: 0;
        }
        .bl-bg-glow-2 {
          position: absolute;
          top: 40%;
          left: -300px;
          width: 700px;
          height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(20, 184, 166, 0.08) 0%, rgba(3, 8, 18, 0) 75%);
          pointer-events: none;
          z-index: 0;
        }

        .bl-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 1;
        }

        /* Hero Section */
        .bl-hero {
          text-align: center;
          max-width: 750px;
          margin: 0 auto 56px;
        }
        .bl-hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(59, 126, 248, 0.1);
          border: 1px solid rgba(59, 126, 248, 0.25);
          color: #3B7EF8;
          padding: 6px 14px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 20px;
          font-family: 'Outfit', sans-serif;
        }
        .bl-title {
          font-family: 'Outfit', sans-serif;
          font-size: 48px;
          font-weight: 900;
          color: white;
          letter-spacing: -0.03em;
          line-height: 1.15;
        }
        .bl-title span {
          background: linear-gradient(135deg, #FFF 30%, #93C5FD 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .bl-subtitle {
          font-size: 16px;
          color: #94A3B8;
          margin-top: 16px;
          line-height: 1.6;
        }

        /* Filters Toolbar */
        .bl-toolbar {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 48px;
          background: rgba(7, 15, 30, 0.6);
          border: 1px solid rgba(100, 160, 255, 0.06);
          padding: 16px;
          border-radius: 24px;
          backdrop-filter: blur(12px);
        }
        .bl-search-wrapper {
          position: relative;
          flex: 1;
        }
        .bl-search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #475569;
        }
        .bl-search-input {
          width: 100%;
          background: #030812;
          border: 1px solid rgba(100, 160, 255, 0.12);
          border-radius: 16px;
          padding: 14px 16px 14px 48px;
          color: white;
          font-size: 14.5px;
          outline: none;
          transition: all 0.2s;
        }
        .bl-search-input:focus {
          border-color: #3B7EF8;
          box-shadow: 0 0 15px rgba(59, 126, 248, 0.15);
        }
        .bl-categories {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .bl-categories::-webkit-scrollbar {
          display: none;
        }
        .bl-cat-btn {
          background: transparent;
          border: 1px solid rgba(100, 160, 255, 0.08);
          color: #94A3B8;
          padding: 10px 18px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .bl-cat-btn:hover {
          color: white;
          background: rgba(255,255,255,0.03);
          border-color: rgba(100, 160, 255, 0.2);
        }
        .bl-cat-btn-active {
          background: #3B7EF8 !important;
          color: white !important;
          border-color: #3B7EF8 !important;
          box-shadow: 0 4px 12px rgba(59, 126, 248, 0.2);
        }

        /* Grid & Cards */
        .bl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 32px;
        }
        .bl-card {
          background: rgba(7, 15, 30, 0.85);
          border: 1px solid rgba(100, 160, 255, 0.06);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          text-decoration: none;
          height: 100%;
        }
        .bl-card:hover {
          transform: translateY(-6px);
          border-color: rgba(59, 126, 248, 0.3);
          background: #091326;
          box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5), 0 0 20px rgba(59, 126, 248, 0.05);
        }
        
        /* Card Image Container */
        .bl-card-cover-container {
          position: relative;
          height: 200px;
          overflow: hidden;
          background: #070F1E;
        }
        .bl-card-cover-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .bl-card:hover .bl-card-cover-img {
          transform: scale(1.06);
        }
        .bl-card-tag {
          position: absolute;
          top: 16px;
          left: 16px;
          background: rgba(3, 8, 18, 0.65);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 4px 12px;
          border-radius: 30px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
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
          color: #64748B;
          margin-bottom: 12px;
        }
        .bl-card-meta span {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .bl-card-title {
          font-family: 'Outfit', sans-serif;
          font-size: 21px;
          font-weight: 700;
          color: white;
          line-height: 1.35;
          margin-bottom: 10px;
          transition: color 0.2s;
        }
        .bl-card:hover .bl-card-title {
          color: #3B7EF8;
        }
        .bl-card-excerpt {
          font-size: 14px;
          color: #94A3B8;
          line-height: 1.55;
          margin-bottom: 24px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .bl-card-link {
          margin-top: auto;
          font-size: 13.5px;
          font-weight: 600;
          color: #3B7EF8;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: gap 0.2s;
        }
        .bl-card:hover .bl-card-link {
          gap: 10px;
        }

        /* Premium Inline Ad Promo Card */
        .bl-promo-card {
          grid-column: span 1;
          background: linear-gradient(135deg, rgba(59, 126, 248, 0.15) 0%, rgba(20, 184, 166, 0.1) 100%);
          border: 1px solid rgba(59, 126, 248, 0.25);
          border-radius: 24px;
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 900px) {
          .bl-promo-card {
            grid-column: span 2;
          }
        }
        .bl-promo-glow {
          position: absolute;
          width: 250px;
          height: 250px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 126, 248, 0.2) 0%, transparent 70%);
          top: -50px;
          right: -50px;
          pointer-events: none;
        }
        .bl-promo-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(59, 126, 248, 0.15);
          border: 1px solid rgba(59, 126, 248, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          color: #3B7EF8;
        }
        .bl-promo-title {
          font-family: 'Outfit', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: white;
          margin-bottom: 12px;
          line-height: 1.25;
        }
        .bl-promo-desc {
          font-size: 14px;
          color: #94A3B8;
          line-height: 1.6;
          margin-bottom: 28px;
          max-width: 580px;
        }
        .bl-promo-btn {
          align-self: start;
          background: linear-gradient(135deg, #3B7EF8 0%, #1D4ED8 100%);
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
          box-shadow: 0 4px 15px rgba(59, 126, 248, 0.25);
          transition: all 0.2s;
        }
        .bl-promo-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 126, 248, 0.4);
        }

        /* Empty State */
        .bl-empty {
          text-align: center;
          padding: 60px 24px;
          background: rgba(7, 15, 30, 0.4);
          border: 1px dashed rgba(100, 160, 255, 0.1);
          border-radius: 24px;
          grid-column: 1 / -1;
        }
        .bl-empty-title {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
        }
        .bl-empty-desc {
          font-size: 14px;
          color: #64748B;
        }

        /* Responsive styling */
        @media (max-width: 768px) {
          .bl-list-root {
            padding-top: 100px;
          }
          .bl-title {
            font-size: 36px;
          }
          .bl-toolbar {
            flex-direction: column;
          }
          .bl-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>

      {/* Decorative Glow Elements */}
      <div className="bl-bg-glow-1"></div>
      <div className="bl-bg-glow-2"></div>

      <div className="bl-container">
        {/* Hero Area */}
        <header className="bl-hero">
          <div className="bl-hero-tag">
            <Sparkles size={13} /> O Guia dos Médicos de Alta Performance
          </div>
          <h1 className="bl-title">
            Blog <span>RokoMed</span>
          </h1>
          <p className="bl-subtitle">
            Dicas práticas de estudos, remuneração real do mercado, segredos de especialidades e como estudar ativamente para sua aprovação na residência médica.
          </p>
        </header>

        {/* Filter and Search Bar */}
        <div className="bl-toolbar">
          <div className="bl-search-wrapper">
            <Search className="bl-search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar artigos por título ou assunto..." 
              className="bl-search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="bl-categories">
            {categories.map(cat => (
              <button
                key={cat}
                className={`bl-cat-btn ${selectedCategory === cat ? 'bl-cat-btn-active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Article Cards Grid */}
        <div className="bl-grid">
          {filteredPosts.length === 0 ? (
            <div className="bl-empty">
              <h3 className="bl-empty-title">Nenhum artigo encontrado</h3>
              <p className="bl-empty-desc">Tente alterar o termo da pesquisa ou selecionar outra categoria.</p>
            </div>
          ) : (
            filteredPosts.map((post, idx) => {
              const meta = postMetadataMap[post.slug] || defaultMetadata
              
              // We render cards, and if we hit index 3, we inject the promo card!
              const elements = [];
              
              if (idx === 3 && searchQuery === '' && selectedCategory === 'Todas') {
                elements.push(
                  <div key="inline-promo" className="bl-promo-card">
                    <div className="bl-promo-glow"></div>
                    <div className="bl-promo-icon-wrapper">
                      <BookOpen size={24} />
                    </div>
                    <h3 className="bl-promo-title">
                      Estude Menos, Reteha Mais. Seja Aprovado!
                    </h3>
                    <p className="bl-promo-desc">
                      Chega de assistir a videoaulas passivas de 3 horas. Com o algoritmo adaptativo do RokoMed e simulados focados nas principais bancas (ENARE, USP, etc.), você estuda com foco absoluto nos seus pontos fracos. Experimente grátis hoje!
                    </p>
                    <Link to="/register" className="bl-promo-btn">
                      Criar Conta Gratuita
                    </Link>
                  </div>
                );
              }
              
              elements.push(
                <Link key={post.slug} to={`/blog/${post.slug}`} className="bl-card">
                  <div className="bl-card-cover-container">
                    <span className="bl-card-tag">{meta.category}</span>
                    <img 
                      className="bl-card-cover-img" 
                      src={meta.cover} 
                      alt={post.title} 
                      loading="lazy"
                    />
                  </div>
                  <div className="bl-card-body">
                    <div className="bl-card-meta">
                      <span>
                        <Calendar size={13} /> {new Date(post.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
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
              );
              
              return elements;
            })
          )}
        </div>
      </div>
    </div>
  )
}
