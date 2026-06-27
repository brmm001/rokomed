import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Crown, BookOpen, Layers } from 'lucide-react'

export default function BlogHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <style>{`
        .blog-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          height: 72px;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          border-bottom: 1px solid transparent;
        }
        .blog-nav-scrolled {
          background: rgba(3, 8, 18, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(100, 160, 255, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
        }
        .blog-nav-container {
          max-width: 1100px;
          width: 100%;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .blog-logo-link {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: white;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: transform 0.2s;
        }
        .blog-logo-link:hover {
          transform: scale(1.02);
        }
        .blog-logo-link span {
          color: #3B7EF8;
        }
        .blog-menu {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .blog-menu-link {
          color: #94A3B8;
          text-decoration: none;
          font-size: 14.5px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .blog-menu-link:hover, .blog-menu-link.active {
          color: white;
        }
        .blog-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .blog-btn-free {
          background: linear-gradient(135deg, #3B7EF8 0%, #1D4ED8 100%);
          color: white;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          box-shadow: 0 4px 15px rgba(59, 126, 248, 0.25);
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .blog-btn-free:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 126, 248, 0.4);
        }
        .blog-btn-login {
          color: white;
          font-size: 14.5px;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .blog-btn-login:hover {
          opacity: 0.8;
        }
        .blog-hamburger {
          display: none;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
        }
        
        /* Mobile Overlay Menu */
        .blog-mobile-menu {
          position: fixed;
          inset: 0;
          z-index: 99;
          background: #030812;
          padding: 100px 24px 40px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          transform: translateX(100%);
          transition: transform 0.3s ease;
        }
        .blog-mobile-menu-open {
          transform: translateX(0);
        }
        .blog-mobile-link {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: white;
          text-decoration: none;
          border-bottom: 1px solid rgba(100, 160, 255, 0.05);
          padding-bottom: 12px;
        }
        .blog-mobile-actions {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .blog-mobile-btn-free {
          background: linear-gradient(135deg, #3B7EF8 0%, #1D4ED8 100%);
          color: white;
          padding: 14px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 16px;
          text-align: center;
          text-decoration: none;
          box-shadow: 0 4px 15px rgba(59, 126, 248, 0.25);
        }
        .blog-mobile-btn-login {
          border: 1px solid rgba(255,255,255,0.1);
          color: #94A3B8;
          padding: 14px;
          border-radius: 14px;
          font-weight: 600;
          font-size: 16px;
          text-align: center;
          text-decoration: none;
          transition: background 0.2s;
        }
        
        @media (max-width: 768px) {
          .blog-menu, .blog-actions {
            display: none;
          }
          .blog-hamburger {
            display: block;
          }
        }
      `}</style>

      <nav className={`blog-nav ${scrolled ? 'blog-nav-scrolled' : ''}`}>
        <div className="blog-nav-container">
          <Link to="/" className="blog-logo-link">
            Roko<span>Med</span>
          </Link>

          <div className="blog-menu">
            <NavLink to="/" className="blog-menu-link">Home</NavLink>
            <NavLink to="/questoes" className="blog-menu-link">Questões</NavLink>
            <NavLink to="/pricing" className="blog-menu-link">Planos</NavLink>
            <NavLink to="/blog" className="blog-menu-link">Blog</NavLink>
          </div>

          <div className="blog-actions">
            <Link to="/login" className="blog-btn-login">Login</Link>
            <Link to="/register" className="blog-btn-free">
              Estudar Grátis <Crown size={14} />
            </Link>
          </div>

          <button className="blog-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`blog-mobile-menu ${mobileMenuOpen ? 'blog-mobile-menu-open' : ''}`}>
        <Link to="/" className="blog-mobile-link" onClick={() => setMobileMenuOpen(false)}>Início</Link>
        <Link to="/questoes" className="blog-mobile-link" onClick={() => setMobileMenuOpen(false)}>Questões</Link>
        <Link to="/pricing" className="blog-mobile-link" onClick={() => setMobileMenuOpen(false)}>Planos</Link>
        <Link to="/blog" className="blog-mobile-link" onClick={() => setMobileMenuOpen(false)}>Blog</Link>

        <div className="blog-mobile-actions">
          <Link to="/register" className="blog-mobile-btn-free" onClick={() => setMobileMenuOpen(false)}>
            Criar Conta Grátis
          </Link>
          <Link to="/login" className="blog-mobile-btn-login" onClick={() => setMobileMenuOpen(false)}>
            Acessar Sistema
          </Link>
        </div>
      </div>
    </>
  )
}
