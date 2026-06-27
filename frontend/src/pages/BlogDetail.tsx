import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { blogPosts } from '../data/blogData'
import { updateSEOMetadata } from '../lib/seo'
import { Calendar, Clock, User, ChevronRight, ArrowLeft, Crown, Sparkles, BookOpen } from 'lucide-react'
import BlogHeader from '../components/BlogHeader'
import { postMetadataMap, defaultMetadata } from '../data/blogMetadata'

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  const post = blogPosts.find(p => p.slug === slug)
  const meta = post ? (postMetadataMap[post.slug] || defaultMetadata) : defaultMetadata

  useEffect(() => {
    if (post) {
      const pageUrl = `https://rokomed.com.br/blog/${post.slug}`
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': post.title,
        'description': post.excerpt,
        'url': pageUrl,
        'image': meta.cover,
        'datePublished': post.date,
        'author': {
          '@type': 'Person',
          'name': post.author
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'RokoMed',
          'url': 'https://rokomed.com.br'
        }
      }

      updateSEOMetadata(
        post.title,
        post.excerpt,
        schema
      )
    }
  }, [post, meta])

  if (!post) {
    return (
      <div className="bd-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#030812', color: '#C8DCF5' }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'white', fontFamily: 'Outfit' }}>Artigo não encontrado</h1>
          <p style={{ marginTop: 8, color: '#7B9DBF' }}>Desculpe, o artigo que você procura não está publicado no blog.</p>
          <Link to="/blog" className="blog-btn-free" style={{ marginTop: 24, padding: '10px 20px', borderRadius: 8, fontSize: '13px' }}>
            Voltar ao Blog
          </Link>
        </div>
      </div>
    )
  }

  // Sidebar posts
  const sidebarPosts = blogPosts.filter(p => p.slug !== slug).slice(0, 4)

  // Dynamically inject image in the middle of article HTML body
  function injectInsideImage(contentHtml: string, imageUrl: string) {
    // We try to find the index of the second <h2>
    const h2Matches = [...contentHtml.matchAll(/<h2>/gi)];
    if (h2Matches.length >= 2) {
      const insertIndex = h2Matches[1].index!;
      const before = contentHtml.substring(0, insertIndex);
      const after = contentHtml.substring(insertIndex);
      const imgHtml = `
        <div class="bd-content-img-container">
          <img src="${imageUrl}" alt="Ilustração do artigo" class="bd-content-img" loading="lazy" />
        </div>
      `;
      return before + imgHtml + after;
    }
    
    // Fallback: insert after the middle </p>
    const pMatches = [...contentHtml.matchAll(/<\/p>/gi)];
    if (pMatches.length >= 2) {
      const midIdx = Math.floor(pMatches.length / 2);
      const insertIndex = pMatches[midIdx].index! + 4; // length of </p>
      const before = contentHtml.substring(0, insertIndex);
      const after = contentHtml.substring(insertIndex);
      const imgHtml = `
        <div class="bd-content-img-container">
          <img src="${imageUrl}" alt="Ilustração do artigo" class="bd-content-img" loading="lazy" />
        </div>
      `;
      return before + imgHtml + after;
    }
    
    return contentHtml;
  }

  const enrichedContent = injectInsideImage(post.content, meta.inside)

  return (
    <div className="bd-root">
      <BlogHeader />
      
      <style>{`
        .bd-root {
          background-color: #030812;
          min-height: 100vh;
          color: #C8DCF5;
          font-family: 'Inter', sans-serif;
          padding: 100px 0 80px;
          position: relative;
        }
        
        /* Ambient glows */
        .bd-glow-1 {
          position: absolute;
          top: -200px;
          left: 10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(59, 126, 248, 0.1) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .bd-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 1;
        }

        /* Breadcrumb */
        .bd-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #64748B;
          margin-bottom: 24px;
        }
        .bd-breadcrumb a {
          color: #64748B;
          text-decoration: none;
          transition: color 0.2s;
        }
        .bd-breadcrumb a:hover {
          color: white;
        }

        .bd-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
        }
        @media (min-width: 900px) {
          .bd-layout {
            grid-template-columns: 1fr 340px;
          }
        }

        /* Main Article Layout */
        .bd-article {
          background: rgba(7, 15, 30, 0.7);
          border: 1px solid rgba(100, 160, 255, 0.06);
          border-radius: 28px;
          padding: 24px;
          backdrop-filter: blur(12px);
          overflow: hidden;
        }
        @media (min-width: 600px) {
          .bd-article {
            padding: 48px;
          }
        }

        /* Cover Image on Top */
        .bd-cover-wrapper {
          width: 100%;
          height: 250px;
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 32px;
          border: 1px solid rgba(100, 160, 255, 0.08);
          background: #070F1E;
        }
        @media (min-width: 600px) {
          .bd-cover-wrapper {
            height: 380px;
          }
        }
        .bd-cover-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .bd-header-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 13px;
          color: #64748B;
          margin-bottom: 16px;
        }
        .bd-header-meta span {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .bd-title {
          font-family: 'Outfit', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: white;
          letter-spacing: -0.02em;
          line-height: 1.25;
          margin-bottom: 24px;
        }
        @media (min-width: 600px) {
          .bd-title {
            font-size: 38px;
          }
        }
        .bd-category-badge {
          background: rgba(59, 126, 248, 0.15);
          color: #3B7EF8;
          border: 1px solid rgba(59, 126, 248, 0.3);
          padding: 4px 12px;
          border-radius: 30px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 20px;
          display: inline-block;
        }

        /* HTML content body */
        .bd-content {
          font-size: 15.5px;
          line-height: 1.75;
          color: #CBD5E1;
        }
        .bd-content h2 {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: white;
          margin: 40px 0 16px;
          line-height: 1.3;
        }
        .bd-content h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: white;
          margin: 32px 0 12px;
        }
        .bd-content p {
          margin-bottom: 24px;
        }
        .bd-content ul, .bd-content ol {
          margin: 0 0 24px 20px;
        }
        .bd-content li {
          margin-bottom: 10px;
        }
        .bd-content strong {
          color: white;
        }
        
        /* Inside Content Image Container */
        .bd-content-img-container {
          margin: 36px 0;
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(100, 160, 255, 0.06);
          max-height: 320px;
        }
        .bd-content-img {
          width: 100%;
          height: 100%;
          max-height: 320px;
          object-fit: cover;
        }

        /* CTA Bottom Box */
        .bd-cta {
          margin-top: 56px;
          background: linear-gradient(135deg, rgba(59, 126, 248, 0.12) 0%, rgba(20, 184, 166, 0.06) 100%);
          border: 1px solid rgba(59, 126, 248, 0.2);
          border-radius: 20px;
          padding: 32px;
          text-align: center;
          position: relative;
        }
        .bd-cta-title {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: white;
        }
        .bd-cta-desc {
          font-size: 14px;
          color: #94A3B8;
          margin: 10px 0 24px;
          line-height: 1.6;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }
        .bd-cta-btn {
          background: linear-gradient(135deg, #3B7EF8 0%, #1D4ED8 100%);
          color: white;
          padding: 12px 28px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14.5px;
          text-decoration: none;
          box-shadow: 0 4px 15px rgba(59, 126, 248, 0.25);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .bd-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 126, 248, 0.4);
        }

        /* Sidebar Containers */
        .bd-sidebar-wrapper {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        
        /* Sticky Sidebar Promotion Banner */
        .bd-sidebar-promo {
          background: linear-gradient(135deg, rgba(7, 15, 30, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
          border: 1px solid rgba(59, 126, 248, 0.2);
          border-radius: 24px;
          padding: 28px;
          position: sticky;
          top: 96px;
          z-index: 10;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.4);
          overflow: hidden;
        }
        .bd-sidebar-promo::before {
          content: '';
          position: absolute;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(59, 126, 248, 0.15) 0%, transparent 70%);
          top: -30px;
          right: -30px;
          pointer-events: none;
        }
        .bd-sidebar-promo-tag {
          background: rgba(59, 126, 248, 0.1);
          color: #3B7EF8;
          border: 1px solid rgba(59, 126, 248, 0.3);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 10.5px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 16px;
        }
        .bd-sidebar-promo-title {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: white;
          line-height: 1.3;
          margin-bottom: 8px;
        }
        .bd-sidebar-promo-desc {
          font-size: 13px;
          color: #94A3B8;
          line-height: 1.55;
          margin-bottom: 24px;
        }
        .bd-sidebar-promo-btn {
          width: 100%;
          background: linear-gradient(135deg, #3B7EF8 0%, #1D4ED8 100%);
          color: white;
          padding: 12px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
          display: block;
          text-align: center;
          box-shadow: 0 4px 15px rgba(59, 126, 248, 0.2);
          transition: all 0.2s;
        }
        .bd-sidebar-promo-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 126, 248, 0.35);
        }
        
        /* Other Articles List */
        .bd-sidebar-box {
          background: rgba(7, 15, 30, 0.6);
          border: 1px solid rgba(100, 160, 255, 0.06);
          border-radius: 24px;
          padding: 24px;
          backdrop-filter: blur(8px);
        }
        .bd-sidebar-title {
          font-family: 'Outfit', sans-serif;
          font-size: 16.5px;
          font-weight: 700;
          color: white;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(100, 160, 255, 0.06);
        }
        .bd-sidebar-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 0;
          margin: 0;
        }
        .bd-sidebar-item {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .bd-sidebar-thumb {
          width: 64px;
          height: 64px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          background: #070F1E;
          border: 1px solid rgba(100, 160, 255, 0.05);
        }
        .bd-sidebar-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .bd-sidebar-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .bd-sidebar-link {
          color: white;
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          text-decoration: none;
          line-height: 1.35;
          transition: color 0.2s;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .bd-sidebar-link:hover {
          color: #3B7EF8;
        }
        .bd-sidebar-date {
          font-size: 11px;
          color: #64748B;
        }
      `}</style>

      <div className="bd-glow-1"></div>

      <div className="bd-container">
        {/* Breadcrumbs */}
        <nav className="bd-breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={12} />
          <Link to="/blog">Blog</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'white', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '220px' }}>
            {post.title}
          </span>
        </nav>

        {/* Core Layout */}
        <div className="bd-layout">
          {/* Main Article column */}
          <main>
            <article className="bd-article">
              <span className="bd-category-badge">{meta.category}</span>
              
              <h1 className="bd-title">{post.title}</h1>
              
              <div className="bd-header-meta">
                <span>
                  <User size={14} /> {post.author}
                </span>
                <span>
                  <Calendar size={14} /> {new Date(post.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span>
                  <Clock size={14} /> {post.readTime}
                </span>
              </div>
              
              {/* Featured Cover Image */}
              <div className="bd-cover-wrapper">
                <img className="bd-cover-img" src={meta.cover} alt={post.title} />
              </div>
              
              {/* HTML Body with dynamically injected inside image */}
              <div 
                className="bd-content"
                dangerouslySetInnerHTML={{ __html: enrichedContent }} 
              />

              {/* Bottom Registration CTA */}
              <div className="bd-cta">
                <h3 className="bd-cta-title">Potencialize sua Preparação Médica</h3>
                <p className="bd-cta-desc">
                  Estude de forma ativa com a plataforma adaptativa do RokoMed. Resolva milhares de questões de residência, monte cadernos de erros automáticos e aprenda com o Dr. André.
                </p>
                <Link to="/register" className="bd-cta-btn">
                  Criar Conta Gratuita <Sparkles size={14} />
                </Link>
              </div>
            </article>
          </main>

          {/* Sidebar Area */}
          <aside className="bd-sidebar-wrapper">
            {/* Sidebar Promo Cards (Sticky on scroll) */}
            <div className="bd-sidebar-promo">
              <span className="bd-sidebar-promo-tag">
                <Crown size={12} /> ROKOMED PRO
              </span>
              <h3 className="bd-sidebar-promo-title">O Algoritmo da Sua Aprovação</h3>
              <p className="bd-sidebar-promo-desc">
                Tenha acesso ilimitado ao banco de questões, revisões personalizadas com flashcards baseadas em repetição espaçada e ao Dr. André, o seu tutor de IA.
              </p>
              <Link to="/register" className="bd-sidebar-promo-btn">
                Estudar de Graça
              </Link>
            </div>

            {/* Other Articles list */}
            <div className="bd-sidebar-box">
              <h3 className="bd-sidebar-title">Outros Artigos</h3>
              <ul className="bd-sidebar-list">
                {sidebarPosts.map(p => {
                  const pMeta = postMetadataMap[p.slug] || defaultMetadata
                  return (
                    <li key={p.slug} className="bd-sidebar-item">
                      <div className="bd-sidebar-thumb">
                        <img src={pMeta.cover} alt={p.title} loading="lazy" />
                      </div>
                      <div className="bd-sidebar-info">
                        <Link to={`/blog/${p.slug}`} className="bd-sidebar-link">
                          {p.title}
                        </Link>
                        <span className="bd-sidebar-date">
                          {new Date(p.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
