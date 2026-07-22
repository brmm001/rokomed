import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { authApi } from '../lib/api'
import toast from 'react-hot-toast'
import {
  CalendarCheck2, BookOpen, RefreshCw, BarChart3,
  MoreHorizontal, Crown, ShieldCheck, Brain, Gamepad2,
  Calendar, User, HeadphonesIcon, LogOut, ChevronDown,
  ClipboardList, Layers, Video, Lock,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import SupportWidget from './SupportWidget'
import OnboardingModal from './OnboardingModal'
import BottomNav, { MoreMenu } from './BottomNav'
import '../internal-theme.css'

// ── Grupos da navegação lateral (desktop) ─────────────────────────────────
const navGroups = [
  {
    label: 'Hoje',
    id: 'hoje',
    icon: CalendarCheck2,
    to: '/dashboard',
    exact: true,
    subitems: [],
  },
  {
    label: 'Estudar',
    id: 'estudar',
    icon: BookOpen,
    to: '/questoes',
    subitems: [
      { to: '/questoes',  label: 'Banco de Questões', icon: BookOpen },
      { to: '/aulas',     label: 'Aulas e Temas',     icon: Video },
      { to: '/simulados', label: 'Simulados',          icon: ClipboardList, pro: true },
    ],
  },
  {
    label: 'Revisar',
    id: 'revisar',
    icon: RefreshCw,
    to: '/adaptive',
    subitems: [
      { to: '/adaptive',   label: 'Trilha Adaptativa', icon: RefreshCw, pro: true },
      { to: '/flashcards', label: 'Flashcards',         icon: Layers },
    ],
  },
  {
    label: 'Evolução',
    id: 'evolucao',
    icon: BarChart3,
    to: '/analytics',
    subitems: [
      { to: '/analytics', label: 'Desempenho',     icon: BarChart3 },
    ],
  },
  {
    label: 'Mais',
    id: 'mais',
    icon: MoreHorizontal,
    to: null,
    subitems: [
      { to: '/tutor',  label: 'Dr. André (IA)', icon: Brain },
      { to: '/games',  label: 'Mini Games',     icon: Gamepad2, pro: true },
      { to: '/rotina', label: 'Minha Rotina',   icon: Calendar, pro: true },
      { to: '/perfil', label: 'Perfil',         icon: User },
    ],
  },
]

export default function Layout() {
  const { user, logout, setAuth } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  // Atualiza dados do usuário em background
  useEffect(() => {
    authApi.me()
      .then(res => { if (res.user && res.token) setAuth(res.user, res.token) })
      .catch(() => {})
  }, [setAuth])

  // Abre automaticamente o grupo da rota atual
  useEffect(() => {
    for (const g of navGroups) {
      if (g.subitems.some(s => location.pathname.startsWith(s.to))) {
        setOpenGroup(g.id)
        return
      }
      if (g.to && location.pathname === g.to) {
        setOpenGroup(g.id)
        return
      }
    }
  }, [location.pathname])

  // Suporte ao evento do MoreMenu
  useEffect(() => {
    const handler = () => {
      const btn = document.querySelector<HTMLButtonElement>('[data-support-trigger]')
      btn?.click()
    }
    document.addEventListener('open-support-widget', handler)
    return () => document.removeEventListener('open-support-widget', handler)
  }, [])

  // Fecha o menu "Mais" ao clicar fora (desktop)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        if (openGroup === 'mais') setOpenGroup(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openGroup])

  // Focus mode: sem sidebar durante questão/simulado
  const isFocusMode =
    /^\/questoes\/[a-zA-Z0-9_-]+$/.test(location.pathname) ||
    (location.pathname.includes('/simulados/') && !location.pathname.endsWith('/novo'))

  // Onboarding: FREE, trial ou PRO sem onboarding concluído
  const showOnboarding = user?.onboardingDone === false

  // Trial expirado → lockout (mantido conforme decisão do usuário)
  if (user?.plan === 'FREE' && user?.trialExpired) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: 'radial-gradient(circle at center, #0B192C 0%, #020617 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: '2rem', fontFamily: 'Outfit, sans-serif',
      }}>
        <div style={{
          maxWidth: '480px', width: '100%',
          background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(251,191,36,0.3)', borderRadius: '24px',
          padding: '3rem 2.5rem', textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px rgba(251,191,36,0.1)',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg,#F59E0B,#D97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem',
            boxShadow: '0 8px 24px rgba(245,158,11,0.3)',
          }}>
            <Crown size={36} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF', marginBottom: '1rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Período de Teste Concluído
          </h1>
          <p style={{ fontSize: '0.975rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Seus 7 dias de acesso grátis expiraram. Para continuar estudando com mais de 10.000 questões comentadas, simulados inteligentes e o sistema de flashcards, faça o upgrade para o plano Pro.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={() => navigate('/pricing')}
              style={{ width: '100%', padding: '1rem 2rem', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: '#FFF', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245,158,11,0.4)' }}
            >
              Ver Planos e Upgrade
            </button>
            <button
              onClick={async () => { await authApi.logout().catch(() => {}); logout(); navigate('/login'); toast.success('Até logo!') }}
              style={{ width: '100%', padding: '0.875rem 2rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94A3B8', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
            >
              Sair da Conta
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isAdmin = user && ['ADMIN', 'SUPERADMIN'].includes(user.role)
  const isPro = user?.plan !== 'FREE'

  const handleLogout = async () => {
    await authApi.logout().catch(() => {})
    logout()
    navigate('/login')
    toast.success('Até logo!')
  }

  const toggleGroup = (id: string, to: string | null) => {
    if (to && navGroups.find(g => g.id === id)?.subitems.length === 0) {
      navigate(to)
      return
    }
    setOpenGroup(prev => (prev === id ? null : id))
  }

  return (
    <div className="internal-system" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Skip link — acessibilidade */}
      <a
        href="#main-content"
        style={{
          position: 'absolute', top: -40, left: 8, zIndex: 9999,
          background: '#3B82F6', color: '#fff', padding: '8px 16px',
          borderRadius: 8, fontWeight: 600, fontSize: '0.875rem',
          transition: 'top 0.2s',
          // Fica visível apenas ao focar via teclado
        }}
        onFocus={e => { e.currentTarget.style.top = '8px' }}
        onBlur={e => { e.currentTarget.style.top = '-40px' }}
      >
        Ir para o conteúdo principal
      </a>

      {/* ── Sidebar (desktop ≥ 768px) ──────────────────────────────────── */}
      <aside
        aria-label="Menu lateral"
        style={{
          display: isFocusMode ? 'none' : 'flex',
          position: 'fixed', top: 0, bottom: 0, left: 0,
          zIndex: 50, width: 240,
          flexDirection: 'column',
          background: 'rgba(10,10,11,0.85)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
        className="hidden md:flex"
      >
        {/* Logo */}
        <div style={{ padding: '1.25rem 1rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <a href="/dashboard" style={{ fontFamily: "'Abril Fatface', Georgia, serif", fontSize: '1.5rem', textDecoration: 'none', color: '#EDEDED', letterSpacing: '0.02em' }}>
            Roko<span style={{ color: '#3B82F6' }}>Med</span>
          </a>
        </div>

        {/* Avatar + nome + plano */}
        <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#0F2040,#1E3A5F)', border: '2px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {user?.picture
              ? <img src={user.picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '0.75rem', color: '#93C5FD', fontWeight: 700 }}>{user?.name?.[0]?.toUpperCase()}</span>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#EDEDED', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isPro ? '#FCD34D' : '#A1A1A6', background: isPro ? 'rgba(252,211,77,0.12)' : 'rgba(161,161,166,0.12)', padding: '1px 7px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 1 }}>
              <Crown size={9} /> {user?.plan}
            </span>
          </div>
        </div>

        {/* Grupos de nav */}
        <nav style={{ flex: 1, padding: '0.5rem 0.625rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }} aria-label="Navegação principal">
          {navGroups.map(({ id, label, icon: Icon, to, subitems, exact }) => {
            const isGroupActive = subitems.some(s => location.pathname.startsWith(s.to)) || (to && (exact ? location.pathname === to : location.pathname.startsWith(to)))
            const isOpen = openGroup === id

            if (subitems.length === 0 && to) {
              return (
                <NavLink
                  key={id}
                  to={to}
                  end={exact}
                  aria-label={label}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', transition: 'all 0.15s' }}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 1.75} color={isActive ? '#3B82F6' : 'currentColor'} />
                      <span style={{ flex: 1, fontWeight: isActive ? 600 : 500 }}>{label}</span>
                    </>
                  )}
                </NavLink>
              )
            }

            return (
              <div key={id} ref={id === 'mais' ? moreRef : undefined}>
                {/* Cabeçalho do grupo */}
                <button
                  onClick={() => toggleGroup(id, to)}
                  aria-expanded={isOpen}
                  aria-label={`${label} — ${isOpen ? 'fechar' : 'abrir'} submenu`}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 9, border: 'none',
                    background: isGroupActive ? 'rgba(59,130,246,0.1)' : 'transparent',
                    color: isGroupActive ? '#fff' : 'rgba(255,255,255,0.5)',
                    fontSize: '0.875rem', fontWeight: isGroupActive ? 600 : 500,
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  }}
                >
                  <Icon size={18} strokeWidth={isGroupActive ? 2.5 : 1.75} color={isGroupActive ? '#3B82F6' : 'currentColor'} />
                  <span style={{ flex: 1 }}>{label}</span>
                  <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'rgba(255,255,255,0.3)' }} />
                </button>

                {/* Subitens */}
                {isOpen && (
                  <div style={{ paddingLeft: 12, paddingTop: 2, paddingBottom: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {subitems.map(({ to: subTo, label: subLabel, icon: SubIcon, pro }) => (
                      <NavLink
                        key={subTo}
                        to={subTo}
                        aria-label={subLabel}
                        style={({ isActive }) => ({
                          display: 'flex', alignItems: 'center', gap: 9,
                          padding: '8px 10px', borderRadius: 8, textDecoration: 'none',
                          fontSize: '0.8125rem', fontWeight: isActive ? 600 : 400,
                          color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                          background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                          transition: 'all 0.15s',
                        })}
                      >
                        {({ isActive }) => (
                          <>
                            <SubIcon size={15} strokeWidth={isActive ? 2.5 : 1.75} />
                            <span style={{ flex: 1 }}>{subLabel}</span>
                            {pro && !isPro && <Lock size={11} color="rgba(255,255,255,0.25)" />}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Admin */}
          {isAdmin && (
            <NavLink
              to="/admin"
              aria-label="Administração"
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 9, textDecoration: 'none',
                fontSize: '0.875rem', fontWeight: isActive ? 600 : 500,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                background: isActive ? 'rgba(59,130,246,0.1)' : 'transparent',
                marginTop: 8,
              })}
            >
              {({ isActive }) => (
                <>
                  <ShieldCheck size={18} strokeWidth={isActive ? 2.5 : 1.75} color={isActive ? '#3B82F6' : 'currentColor'} />
                  <span>Administração</span>
                </>
              )}
            </NavLink>
          )}
        </nav>

        {/* Upgrade CTA (FREE) */}
        {!isPro && (
          <div style={{ margin: '0 0.625rem 0.625rem', padding: '0.875rem', borderRadius: 12, background: 'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(20,184,166,0.12))', border: '1px solid rgba(59,130,246,0.2)' }}>
            <Crown size={16} color="#FCD34D" />
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginTop: 5, marginBottom: 3, color: '#EDEDED' }}>Upgrade para Pro</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: 9 }}>Questões ilimitadas + IA tutor</div>
            <NavLink to="/pricing" style={{ display: 'block', textAlign: 'center', padding: '0.45rem', borderRadius: 8, background: '#3B82F6', color: '#fff', fontWeight: 600, fontSize: '0.78rem', textDecoration: 'none' }}>
              Ver planos
            </NavLink>
          </div>
        )}

        {/* Sair */}
        <div style={{ padding: '0.625rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={handleLogout}
            aria-label="Sair da conta"
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: 'rgba(255,79,79,0.7)', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', transition: 'color 0.15s', textAlign: 'left' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#FF453A'; e.currentTarget.style.background = 'rgba(255,69,58,0.07)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,79,79,0.7)'; e.currentTarget.style.background = 'transparent' }}
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          minWidth: 0,
          // Espaço para sidebar no desktop
          marginLeft: isFocusMode ? 0 : undefined,
        }}
        className={isFocusMode ? '' : 'md:ml-[240px]'}
      >
        {/* Header mobile */}
        {!isFocusMode && (
          <header
            className="flex md:hidden"
            style={{
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(10,10,11,0.85)',
              backdropFilter: 'blur(20px)',
              position: 'sticky', top: 0, zIndex: 30,
            }}
          >
            <a href="/dashboard" style={{ fontFamily: "'Abril Fatface', Georgia, serif", fontSize: '1.35rem', textDecoration: 'none', color: '#EDEDED' }}>
              Roko<span style={{ color: '#3B82F6' }}>Med</span>
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Mini avatar mobile */}
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#0F2040,#1E3A5F)', border: '1.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {user?.picture
                  ? <img src={user.picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '0.7rem', color: '#93C5FD', fontWeight: 700 }}>{user?.name?.[0]?.toUpperCase()}</span>
                }
              </div>
            </div>
          </header>
        )}

        {/* Conteúdo */}
        <main
          id="main-content"
          tabIndex={-1}
          style={{
            flex: 1,
            padding: isFocusMode ? 0 : '1.25rem 1rem',
            paddingBottom: isFocusMode ? 0 : 'calc(env(safe-area-inset-bottom) + 72px)', // espaço para bottom nav mobile
          }}
          className={isFocusMode ? '' : 'md:p-8 md:pb-8'}
        >
          <Outlet />
        </main>
      </div>

      {/* ── Bottom Nav (mobile) ─────────────────────────────────────────── */}
      {!isFocusMode && (
        <div className="block md:hidden">
          <BottomNav
            onMoreClick={() => setShowMoreMenu(p => !p)}
            showMore={showMoreMenu}
          />
          {showMoreMenu && (
            <MoreMenu
              isAdmin={!!isAdmin}
              onClose={() => setShowMoreMenu(false)}
              onLogout={handleLogout}
            />
          )}
        </div>
      )}

      {/* Suporte e Onboarding */}
      <SupportWidget />
      {showOnboarding && (
        <div style={{ position: 'relative' }}>
          <OnboardingModal onComplete={() => {
            useAuthStore.setState(state => ({
              user: state.user ? { ...state.user, onboardingDone: true } : null,
            }))
          }} />
          <button
            onClick={() => useAuthStore.setState(state => ({
              user: state.user ? { ...state.user, onboardingDone: true } : null,
            }))}
            aria-label="Pular configuração inicial"
            style={{
              position: 'fixed', top: 16, right: 16, zIndex: 10001,
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 10, padding: '6px 14px', cursor: 'pointer',
              color: 'rgba(255,255,255,0.7)', fontSize: '13px',
              fontFamily: 'Outfit, sans-serif', fontWeight: 600,
              backdropFilter: 'blur(8px)', transition: 'all 0.2s',
            }}
          >
            Pular →
          </button>
        </div>
      )}
    </div>
  )
}
