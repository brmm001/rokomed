import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { blogPosts } from '../data/blogData'
import { updateSEOMetadata } from '../lib/seo'
import { Calendar, Clock, User, ChevronRight, ArrowLeft } from 'lucide-react'

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  const post = blogPosts.find(p => p.slug === slug)

  useEffect(() => {
    if (post) {
      const pageUrl = `https://rokomed.com.br/blog/${post.slug}`
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': post.title,
        'description': post.excerpt,
        'url': pageUrl,
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
  }, [post])

  if (!post) {
    return (
      <div className="bd-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#030812', color: '#C8DCF5' }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'white', fontFamily: 'Outfit' }}>Artigo não encontrado</h1>
          <p style={{ marginTop: 8, color: '#7B9DBF' }}>Desculpe, o artigo que você procura não está publicado no blog.</p>
          <Link to="/blog" className="ap-btn ap-btn-primary" style={{ marginTop: 24, padding: '10px 20px', borderRadius: 8, fontSize: '13px' }}>
            Voltar ao Blog
          </Link>
        </div>
      </div>
    )
  }

  // Sidebar posts
  const sidebarPosts = blogPosts.filter(p => p.slug !== slug).slice(0, 3)

  return (
    <div className="bd-root">
      <style>{`
        .bd-root {
          background-color: #030812;
          min-height: 100vh;
          color: #C8DCF5;
          font-family: 'Inter', sans-serif;
          padding: 100px 0 60px;
        }
        .bd-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .bd-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #7B9DBF;
          margin-bottom: 32px;
        }
        .bd-breadcrumb a {
          color: #7B9DBF;
          text-decoration: none;
        }
        .bd-breadcrumb a:hover {
          color: white;
        }
        .bd-layout {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 48px;
        }
        .bd-article {
          background: #070F1E;
          border: 1px solid rgba(100, 160, 255, 0.08);
          border-radius: 20px;
          padding: 40px;
        }
        .bd-header-meta {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: #7B9DBF;
          margin-bottom: 16px;
        }
        .bd-header-meta span {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .bd-title {
          font-family: 'Outfit', sans-serif;
          font-size: 34px;
          font-weight: 800;
          color: white;
          letter-spacing: -0.02em;
          line-height: 1.25;
          margin-bottom: 32px;
        }
        .bd-content {
          font-size: 15px;
          line-height: 1.7;
          color: #EBF4FF;
        }
        .bd-content h2 {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: white;
          margin: 36px 0 16px;
        }
        .bd-content h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: white;
          margin: 28px 0 12px;
        }
        .bd-content p {
          margin-bottom: 20px;
        }
        .bd-content ul, .bd-content ol {
          margin: 0 0 20px 24px;
        }
        .bd-content li {
          margin-bottom: 8px;
        }
        .bd-content strong {
          color: white;
        }
        /* CTA Box */
        .bd-cta {
          margin-top: 56px;
          background: linear-gradient(135deg, rgba(59, 126, 248, 0.1) 0%, rgba(165, 195, 247, 0.05) 100%);
          border: 1px solid rgba(59, 126, 248, 0.2);
          border-radius: 16px;
          padding: 28px;
          text-align: center;
        }
        .bd-cta-title {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: white;
        }
        .bd-cta-desc {
          font-size: 13.5px;
          color: #7B9DBF;
          margin: 8px 0 20px;
        }
        /* Sidebar */
        .bd-sidebar-box {
          background: #070F1E;
          border: 1px solid rgba(100, 160, 255, 0.08);
          border-radius: 20px;
          padding: 24px;
          align-self: start;
        }
        .bd-sidebar-title {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: white;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(100, 160, 255, 0.08);
        }
        .bd-sidebar-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .bd-sidebar-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .bd-sidebar-link {
          color: white;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          line-height: 1.3;
          transition: color 0.2s;
        }
        .bd-sidebar-link:hover {
          color: #3B7EF8;
        }
        .bd-sidebar-date {
          font-size: 11px;
          color: #7B9DBF;
        }
        @media (max-width: 768px) {
          .bd-layout {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .bd-article {
            padding: 24px;
          }
        }
      `}</style>

      <div className="bd-container">
        {/* Breadcrumb Navigation for SEO */}
        <div className="bd-breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={12} />
          <Link to="/blog">Blog</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'white', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '300px' }}>
            {post.title}
          </span>
        </div>

        <div className="bd-layout">
          {/* Main Article */}
          <article className="bd-article">
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
            
            <h1 className="bd-title">{post.title}</h1>
            
            <div 
              className="bd-content"
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />

            {/* CTA Box */}
            <div className="bd-cta">
              <h3 className="bd-cta-title">Quer Turbinar Sua Preparação Para as Provas?</h3>
              <p className="bd-cta-desc">
                Crie sua conta gratuita no RokoMed e tenha acesso a mais de 15 mil questões comentadas e auxílio do Dr. André, nosso tutor de IA.
              </p>
              <Link to="/register" className="ap-btn ap-btn-primary" style={{ borderRadius: 8, padding: '12px 24px' }}>
                Estudar Grátis Agora
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="bd-sidebar-box">
            <h3 className="bd-sidebar-title">Outros Artigos</h3>
            <ul className="bd-sidebar-list">
              {sidebarPosts.map(p => (
                <li key={p.slug} className="bd-sidebar-item">
                  <Link to={`/blog/${p.slug}`} className="bd-sidebar-link">
                    {p.title}
                  </Link>
                  <span className="bd-sidebar-date">{new Date(p.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  )
}
