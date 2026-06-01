import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  picture?: string
  role: 'ALUNO' | 'PROFESSOR' | 'ADMIN' | 'SUPERADMIN'
  plan: 'FREE' | 'PRO' | 'GRUPO'
  xp: number
  streak: number
  onboardingDone?: boolean
  originInstitution?: string
  targetInstitutionId?: string
  targetSpecialtyId?: string
  examDate?: string
  trialExpired?: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (data) => set((s) => ({ user: s.user ? { ...s.user, ...data } : null })),
    }),
    { name: 'residencia-auth' }
  )
)
