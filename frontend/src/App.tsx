import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import SimuladoConfigPage from './pages/SimuladoConfig'
import SimuladoExamPage from './pages/SimuladoExam'
import AdaptiveSessionPage from './pages/AdaptiveSession'
import AnalyticsPage from './pages/Analytics'
import CheckoutPage from './pages/Checkout'

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

function PublicOnly({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<PublicOnly><LoginPage /></PublicOnly>} />
          <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/pricing"  element={<PricingPage />} />

          {/* Autenticado */}
          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route path="/dashboard"      element={<DashboardPage />} />
            <Route path="/questoes"       element={<QuestionBankPage />} />
            <Route path="/questoes/:id"   element={<StudyPage />} />
            <Route path="/simulados/novo" element={<SimuladoConfigPage />} />
            <Route path="/simulados/:id"  element={<SimuladoExamPage />} />
            <Route path="/adaptive"       element={<AdaptiveSessionPage />} />
            <Route path="/analytics"      element={<AnalyticsPage />} />
            <Route path="/perfil"         element={<ProfilePage />} />
            <Route path="/admin"          element={<RequireAdmin><AdminPage /></RequireAdmin>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
