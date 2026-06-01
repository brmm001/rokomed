import { authApi } from './api'
import { useAuthStore } from '../store/auth'

export function trackClick(buttonType: string, email?: string) {
  try {
    const user = useAuthStore.getState().user
    authApi.trackClick({
      email: email || user?.email || undefined,
      userId: user?.id || undefined,
      buttonType,
      pageUrl: window.location.pathname,
    }).catch(err => console.error('Erro ao rastrear clique:', err))
  } catch (err) {
    console.error('Falha no tracker:', err)
  }
}
