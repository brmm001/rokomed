import { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/auth'
import Layout from './components/Layout'

// Lazy loaded page components
const LoginPage = lazy(() => import('./pages/Login'))
const RegisterPage = lazy(() => import('./pages/Register'))
const DashboardPage = lazy(() => import('./pages/Dashboard'))
const QuestionBankPage = lazy(() => import('./pages/QuestionBank'))
const StudyPage = lazy(() => import('./pages/Study'))
const PricingPage = lazy(() => import('./pages/Pricing'))
const ProfilePage = lazy(() => import('./pages/Profile'))
const AdminPage = lazy(() => import('./pages/Admin'))
const LandingPage = lazy(() => import('./pages/Landing'))
const AprovacaoLandingPage = lazy(() => import('./pages/AprovacaoLanding'))
const FreeExamPage = lazy(() => import('./pages/FreeExam'))
const SimuladoConfigPage = lazy(() => import('./pages/SimuladoConfig'))
const SimuladoExamPage = lazy(() => import('./pages/SimuladoExam'))
const SimuladoListPage = lazy(() => import('./pages/SimuladoList'))
const AdaptiveSessionPage = lazy(() => import('./pages/AdaptiveSession'))
const AnalyticsPage = lazy(() => import('./pages/Analytics'))
const CheckoutPage = lazy(() => import('./pages/Checkout'))
const PartnershipsPage = lazy(() => import('./pages/Partnerships'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPassword'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPassword'))
const FlashcardsPage = lazy(() => import('./pages/Flashcards'))
const LessonsPage = lazy(() => import('./pages/Lessons'))
const MiniGamesPage = lazy(() => import('./pages/MiniGames'))
const GameDuelPage = lazy(() => import('./pages/GameDuel'))
const GameRoundsPage = lazy(() => import('./pages/GameRounds'))
const GamePistaPage = lazy(() => import('./pages/GamePista'))
const RoutinePage = lazy(() => import('./pages/Routine'))
const DrAndrePage = lazy(() => import('./pages/DrAndre'))
const GlossaryListPage = lazy(() => import('./pages/GlossaryList'))
const GlossaryDetailPage = lazy(() => import('./pages/GlossaryDetail'))
const BlogListPage = lazy(() => import('./pages/BlogList'))
const BlogDetailPage = lazy(() => import('./pages/BlogDetail'))

function IndexRoute() {
  const isAprovacao = window.location.hostname.includes('aprovacao') || window.location.search.includes('v=aprovacao')
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#050D1A', color: '#EBF4FF' }}>
        <div style={{ width: '30px', height: '30px', border: '3px solid rgba(59,126,248,0.1)', borderTopColor: '#3B7EF8', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      {isAprovacao ? <AprovacaoLandingPage /> : <LandingPage />}
    </Suspense>
  )
}

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
        <Suspense fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#050D1A', color: '#EBF4FF', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid rgba(59,126,248,0.1)', borderTopColor: '#3B7EF8', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <span style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '-0.01em', color: '#7B9DBF' }}>Carregando RokoMed...</span>
            </div>
          </div>
        }>
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
            <Route path="/glossario" element={<GlossaryListPage />} />
            <Route path="/glossario/:slug" element={<GlossaryDetailPage />} />
            <Route path="/blog" element={<BlogListPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />

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
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
