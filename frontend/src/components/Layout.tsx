import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { authApi } from '../lib/api'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, BookOpen, User, Crown,
  LogOut, ShieldCheck, Stethoscope, Menu, X, ClipboardList,
  Brain, BarChart3, Layers,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import SupportWidget from './SupportWidget'
import OnboardingModal from './OnboardingModal'
import '../internal-theme.css'

const navItems = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/questoes',       icon: BookOpen,         label: 'Banco de Questões' },
  { to: '/simulados',      icon: ClipboardList,    label: 'Simulados' },
  { to: '/adaptive',       icon: Brain,            label: 'Trilha Adaptativa' },
  { to: '/flashcards',     icon: Layers,           label: 'Flashcards' },
  { to: '/analytics',      icon: BarChart3,        label: 'Análise' },
  { to: '/perfil',         icon: User,             label: 'Perfil' },
]

export default function Layout() {
  const { user, logout, setAuth } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    authApi.me()
      .then(res => {
        if (res.user && res.token) {
          setAuth(res.user, res.token)
        }
      })
      .catch(() => {
        // Ignora ou desloga se token expirou
      })
  }, [setAuth])

  // Focus mode: ocultar sidebar durante o estudo/simulado
  const isFocusMode = location.pathname.match(/^\/questoes\/[a-zA-Z0-9_-]+$/) || 
                      (location.pathname.includes('/simulados/') && !location.pathname.endsWith('/novo'))

  // Mostra onboarding para usuários PRO que ainda não completaram
  const showOnboarding = user?.plan === 'PRO' && user?.onboardingDone === false

  const handleLogout = async () => {
    await authApi.logout().catch(() => {})
    logout()
    navigate('/login')
    toast.success('Até logo!')
  }

  // Lockout screen para usuários com trial expirado
  if (user?.plan === 'FREE' && user?.trialExpired) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(circle at center, #0B192C 0%, #020617 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '2rem',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <div style={{
          maxWidth: '480px',
          width: '100%',
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '24px',
          padding: '3rem 2.5rem',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(251, 191, 36, 0.1)',
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
          }}>
            <Crown size={36} color="white" />
          </div>
          
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#FFF',
            marginBottom: '1rem',
            lineHeight: 1.2,
            letterSpacing: '-0.02em'
          }}>
            Período de Teste Concluído
          </h1>
          
          <p style={{
            fontSize: '0.975rem',
            color: '#94A3B8',
            lineHeight: 1.6,
            marginBottom: '2.5rem'
          }}>
            Seus 7 dias de acesso grátis expiraram. Para continuar estudando com mais de 10.000 questões comentadas, simulados inteligentes e o novo sistema de flashcards, faça o upgrade para o plano Pro.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={() => navigate('/pricing')}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#FFF',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.4)'
              }}
            >
              Ver Planos e Upgrade
            </button>

            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '0.875rem 2rem',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'transparent',
                color: '#94A3B8',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.color = '#FFF'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#94A3B8'
              }}
            >
              Sair da Conta
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isAdmin = user && ['ADMIN', 'SUPERADMIN'].includes(user.role)

  return (
    <div className="internal-system" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 260,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: isFocusMode ? 'none' : 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.25s ease',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem 1.15rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <a href="/dashboard" style={{
              fontFamily: "'Abril Fatface', Georgia, serif",
              fontSize: '1.65rem',
              textDecoration: 'none',
              color: 'var(--text-primary)',
              letterSpacing: '0.02em',
            }}>
              Roko<span style={{ color: '#3B82F6' }}>Med</span>
            </a>
          </div>
        </div>

        {/* Plan badge */}
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg,#0F2040,#1E3A5F)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--border-accent)',
              overflow: 'hidden',
            }}>
              {user?.picture
                ? <img src={user.picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '0.75rem', color: '#93C5FD', fontWeight: 700 }}>
                    {user?.name?.[0]?.toUpperCase()}
                  </span>
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <span className={`badge ${user?.plan === 'FREE' ? 'badge-gray' : 'badge-gold'}`} style={{ fontSize: '0.65rem' }}>
                <Crown size={10} />
                {user?.plan}
              </span>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} color={isActive ? 'var(--text-primary)' : 'currentColor'} />
                  <span style={{ fontWeight: isActive ? 600 : 500 }}>{label}</span>
                </>
              )}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              style={{ marginTop: 8 }}
              onClick={() => setSidebarOpen(false)}
            >
              {({ isActive }) => (
                <>
                  <ShieldCheck size={20} strokeWidth={isActive ? 2.5 : 1.5} color={isActive ? 'var(--text-primary)' : 'currentColor'} />
                  <span style={{ fontWeight: isActive ? 600 : 500 }}>Administração</span>
                </>
              )}
            </NavLink>
          )}
        </nav>

        {/* Upgrade CTA para free */}
        {user?.plan === 'FREE' && (
          <div style={{ margin: '0 0.75rem 0.75rem', padding: '1rem', borderRadius: 12, background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(20,184,166,0.15))', border: '1px solid rgba(59,130,246,0.25)' }}>
            <Crown size={18} color="#FCD34D" />
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginTop: 6, marginBottom: 4 }}>Upgrade para Pro</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10 }}>Questões ilimitadas + IA tutor</div>
            <NavLink to="/pricing" className="btn btn-primary" style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}>
              Ver planos
            </NavLink>
          </div>
        )}

        {/* Logout */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)' }}>
          <button className="nav-item" onClick={handleLogout} style={{ color: '#F87171' }}>
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: isFocusMode ? 0 : 260, transition: 'margin-left 0.3s ease', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Mobile header */}
        <header style={{
          display: isFocusMode ? 'none' : 'none', // Mantém controle original de mobile header

          padding: '1rem',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          <button className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={() => setSidebarOpen(p => !p)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        <main style={{ flex: 1, padding: '2rem' }}>
          <Outlet />
        </main>
      </div>

      <SupportWidget />
      {showOnboarding && (
        <OnboardingModal onComplete={() => {
          // Atualiza o store local para não mostrar novamente
          useAuthStore.setState(state => ({
            user: state.user ? { ...state.user, onboardingDone: true } : null
          }))
        }} />
      )}
    </div>
  )
}
