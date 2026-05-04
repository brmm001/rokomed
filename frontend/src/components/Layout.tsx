import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { authApi } from '../lib/api'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, BookOpen, User, Crown,
  LogOut, ShieldCheck, Stethoscope, Menu, X, ClipboardList,
  Brain, BarChart3,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/questoes',       icon: BookOpen,         label: 'Banco de Questões' },
  { to: '/simulados/novo', icon: ClipboardList,    label: 'Simulado' },
  { to: '/adaptive',       icon: Brain,            label: 'Trilha Adaptativa' },
  { to: '/analytics',      icon: BarChart3,        label: 'Análise' },
  { to: '/perfil',         icon: User,             label: 'Perfil' },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await authApi.logout().catch(() => {})
    logout()
    navigate('/login')
    toast.success('Até logo!')
  }

  const isAdmin = user && ['ADMIN', 'SUPERADMIN'].includes(user.role)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
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
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.25s ease',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #3B82F6, #14B8A6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Stethoscope size={20} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                ResidênciaApp
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Banco de Questões</div>
            </div>
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
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', truncate: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
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
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              style={{ marginTop: 8 }}
              onClick={() => setSidebarOpen(false)}
            >
              <ShieldCheck size={18} />
              Administração
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
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Mobile header */}
        <header style={{
          display: 'none',
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
    </div>
  )
}
