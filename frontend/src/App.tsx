import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/auth'
import Layout from './components/Layout'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import DashboardPage from './pages/Dashboard'
import QuestionBankPage from './pages/QuestionBank'
import StudyPage from './pages/Study'
import PricingPage from './pages/Pricing'
import ProfilePage from './pages/Profile'
import AdminPage from './pages/Admin'
import LandingPage from './pages/Landing'
import AprovacaoLandingPage from './pages/AprovacaoLanding'
import FreeExamPage from './pages/FreeExam'

function IndexRoute() {
  const isAprovacao = window.location.hostname.includes('aprovacao') || window.location.search.includes('v=aprovacao')
  return isAprovacao ? <AprovacaoLandingPage /> : <LandingPage />
}
import SimuladoConfigPage from './pages/SimuladoConfig'
import SimuladoExamPage from './pages/SimuladoExam'
import SimuladoListPage from './pages/SimuladoList'
import AdaptiveSessionPage from './pages/AdaptiveSession'
import AnalyticsPage from './pages/Analytics'
import CheckoutPage from './pages/Checkout'
import PartnershipsPage from './pages/Partnerships'
import ForgotPasswordPage from './pages/ForgotPassword'
import ResetPasswordPage from './pages/ResetPassword'
import FlashcardsPage from './pages/Flashcards'
import LessonsPage from './pages/Lessons'
import MiniGamesPage from './pages/MiniGames'
import GameDuelPage from './pages/GameDuel'
import GameRoundsPage from './pages/GameRounds'
import GamePistaPage from './pages/GamePista'
import RoutinePage from './pages/Routine'
import DrAndrePage from './pages/DrAndre'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (!['ADMIN', 'SUPERADMIN'].includes(user.role)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function RequirePro({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.plan === 'FREE') return <Navigate to="/pricing" replace />
  return <>{children}</>
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

function FacebookPixelTracker() {
  const location = useLocation()

  useEffect(() => {
    if (typeof (window as any).fbq === 'function') {
      (window as any).fbq('track', 'PageView')
    }
  }, [location.pathname, location.search])

  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <FacebookPixelTracker />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#112240', color: '#E2E8F0',
              border: '1px solid rgba(99,179,237,0.2)',
              borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#112240' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: '#112240' } },
          }}
        />
        <Routes>
          {/* Público */}
          <Route path="/"         element={<IndexRoute />} />
          <Route path="/aprovacao" element={<AprovacaoLandingPage />} />
          <Route path="/simulado-gratis" element={<FreeExamPage />} />
          <Route path="/login"    element={<PublicOnly><LoginPage /></PublicOnly>} />
          <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
          <Route path="/forgot-password" element={<PublicOnly><ForgotPasswordPage /></PublicOnly>} />
          <Route path="/reset-password" element={<PublicOnly><ResetPasswordPage /></PublicOnly>} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/pricing"  element={<PricingPage />} />
          <Route path="/parcerias" element={<PartnershipsPage />} />

          {/* Autenticado */}
          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route path="/dashboard"      element={<DashboardPage />} />
            <Route path="/rotina"         element={<RequirePro><RoutinePage /></RequirePro>} />
            <Route path="/questoes"       element={<QuestionBankPage />} />
            <Route path="/questoes/:id"   element={<StudyPage />} />
            <Route path="/aulas"          element={<LessonsPage />} />
            <Route path="/simulados/novo" element={<RequirePro><SimuladoConfigPage /></RequirePro>} />
            <Route path="/simulados"      element={<RequirePro><SimuladoListPage /></RequirePro>} />
            <Route path="/simulados/:id"  element={<RequirePro><SimuladoExamPage /></RequirePro>} />
            <Route path="/adaptive"       element={<RequirePro><AdaptiveSessionPage /></RequirePro>} />
            <Route path="/flashcards"     element={<FlashcardsPage />} />
            <Route path="/games"          element={<RequirePro><MiniGamesPage /></RequirePro>} />
            <Route path="/games/duel"     element={<RequirePro><GameDuelPage /></RequirePro>} />
            <Route path="/games/rounds"    element={<RequirePro><GameRoundsPage /></RequirePro>} />
            <Route path="/games/pista"     element={<RequirePro><GamePistaPage /></RequirePro>} />
            <Route path="/analytics"      element={<AnalyticsPage />} />
            <Route path="/tutor"          element={<DrAndrePage />} />
            <Route path="/perfil"         element={<ProfilePage />} />
            <Route path="/admin"          element={<RequireAdmin><AdminPage /></RequireAdmin>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
