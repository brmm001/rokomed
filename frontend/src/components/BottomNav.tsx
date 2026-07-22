import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import {
  CalendarCheck2, BookOpen, RefreshCw, BarChart3,
  MoreHorizontal, Brain, Gamepad2, Calendar, User,
  HeadphonesIcon, LogOut, ShieldCheck,
} from 'lucide-react'

interface BottomNavProps {
  onMoreClick: () => void
  showMore: boolean
}

const bottomItems = [
  { to: '/dashboard', icon: CalendarCheck2, label: 'Hoje' },
  { to: '/questoes',  icon: BookOpen,       label: 'Estudar' },
  { to: '/adaptive',  icon: RefreshCw,      label: 'Revisar' },
  { to: '/analytics', icon: BarChart3,      label: 'Evolução' },
]

export default function BottomNav({ onMoreClick, showMore }: BottomNavProps) {
  return (
    <nav
      role="navigation"
      aria-label="Navegação principal"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(10,10,11,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'stretch',
        // safe area para iPhone com notch
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {bottomItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/dashboard'}
          style={{ flex: 1, textDecoration: 'none' }}
          aria-label={label}
        >
          {({ isActive }) => (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                padding: '10px 4px 8px',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                transition: 'color 0.18s',
              }}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.75}
                color={isActive ? '#3B82F6' : 'currentColor'}
              />
              <span style={{
                fontSize: '0.65rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#3B82F6' : 'currentColor',
                letterSpacing: '-0.01em',
              }}>
                {label}
              </span>
            </div>
          )}
        </NavLink>
      ))}

      {/* Botão Mais */}
      <button
        onClick={onMoreClick}
        aria-label="Mais opções"
        aria-expanded={showMore}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          padding: '10px 4px 8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: showMore ? '#3B82F6' : 'rgba(255,255,255,0.45)',
          transition: 'color 0.18s',
        }}
      >
        <MoreHorizontal size={22} strokeWidth={showMore ? 2.5 : 1.75} color={showMore ? '#3B82F6' : 'currentColor'} />
        <span style={{
          fontSize: '0.65rem',
          fontWeight: showMore ? 700 : 500,
          letterSpacing: '-0.01em',
        }}>
          Mais
        </span>
      </button>
    </nav>
  )
}

/** Menu slide-up do "Mais" no mobile */
interface MoreMenuProps {
  isAdmin: boolean
  onClose: () => void
  onLogout: () => void
}

export function MoreMenu({ isAdmin, onClose, onLogout }: MoreMenuProps) {
  const navigate = useNavigate()

  const items = [
    { icon: Brain,           label: 'Dr. André (IA)',  to: '/tutor' },
    { icon: Calendar,        label: 'Minha Rotina',    to: '/rotina' },
    { icon: Gamepad2,        label: 'Mini Games',      to: '/games' },
    { icon: User,            label: 'Perfil',          to: '/perfil' },
    { icon: HeadphonesIcon,  label: 'Suporte',         to: null, action: 'support' },
    ...(isAdmin ? [{ icon: ShieldCheck, label: 'Administração', to: '/admin' }] : []),
  ]

  const go = (to: string | null, action?: string) => {
    onClose()
    if (to) navigate(to)
    if (action === 'support') {
      // Dispara evento do widget de suporte
      document.dispatchEvent(new CustomEvent('open-support-widget'))
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 55,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.15s ease',
        }}
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu Mais"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 60,
          background: '#141416',
          borderRadius: '20px 20px 0 0',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '8px 0 calc(env(safe-area-inset-bottom) + 16px)',
          animation: 'slideUp 0.22s cubic-bezier(0.2,0.8,0.2,1)',
        }}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '8px auto 16px' }} />

        {items.map(({ icon: Icon, label, to, action }) => (
          <button
            key={label}
            onClick={() => go(to, action)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 24px', background: 'none', border: 'none',
              color: '#EDEDED', fontSize: '0.9375rem', fontWeight: 500,
              cursor: 'pointer', textAlign: 'left',
              transition: 'background 0.15s',
            }}
            onTouchStart={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onTouchEnd={e => (e.currentTarget.style.background = 'none')}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={18} color="#A1A1A6" />
            </div>
            {label}
          </button>
        ))}

        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 24px' }} />

        <button
          onClick={() => { onClose(); onLogout() }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 24px', background: 'none', border: 'none',
            color: '#FF453A', fontSize: '0.9375rem', fontWeight: 500,
            cursor: 'pointer', textAlign: 'left',
          }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,69,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogOut size={18} color="#FF453A" />
          </div>
          Sair da conta
        </button>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </>
  )
}
