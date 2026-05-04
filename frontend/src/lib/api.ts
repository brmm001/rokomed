import axios from 'axios'
import { useAuthStore } from '../store/auth'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// Injeta token em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Trata erros globais
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data).then(r => r.data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
  logout: () => api.post('/auth/logout').then(r => r.data),
}

// ── Questions ───────────────────────────────────────────────────────────────
export const questionsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/questions', { params }).then(r => r.data),
  get: (id: string) =>
    api.get(`/questions/${id}`).then(r => r.data),
  answer: (id: string, data: { selectedOpt: string; timeSpentSec?: number }) =>
    api.post(`/questions/${id}/answer`, data).then(r => r.data),
  bookmark: (id: string) =>
    api.post(`/questions/${id}/bookmark`).then(r => r.data),
  note: (id: string, content: string) =>
    api.put(`/questions/${id}/note`, { content }).then(r => r.data),
  highlight: (id: string, rangeJson: object, color?: string) =>
    api.post(`/questions/${id}/highlight`, { rangeJson, color }).then(r => r.data),
  deleteHighlight: (id: string, hId: string) =>
    api.delete(`/questions/${id}/highlight/${hId}`).then(r => r.data),
  filters: () =>
    api.get('/questions/meta/filters').then(r => r.data),
  specialtyTree: () =>
    api.get('/questions/meta/specialty-tree').then(r => r.data),
}

// ── Simulados ────────────────────────────────────────────────────────────────
export const simuladosApi = {
  preview: (data: {
    totalQuestions?: number; difficulties?: string[]
    institutionIds?: string[]; specialtyIds?: string[]; years?: number[]
  }) => api.post('/simulados/preview', data).then(r => r.data),
  create: (data: {
    title?: string; totalQuestions: number; timeLimitMin?: number | null
    difficulties?: ('FACIL'|'MEDIO'|'DIFICIL')[]; institutionIds?: string[]; specialtyIds?: string[]; years?: number[]
  }) => api.post('/simulados', data).then(r => r.data),
  list: () => api.get('/simulados').then(r => r.data),
  get:  (id: string) => api.get(`/simulados/${id}`).then(r => r.data),
  start:  (id: string) => api.patch(`/simulados/${id}/start`).then(r => r.data),
  answer: (id: string, data: { order: number; selectedOpt: string }) =>
    api.patch(`/simulados/${id}/answer`, data).then(r => r.data),
  finish: (id: string) => api.patch(`/simulados/${id}/finish`).then(r => r.data),
}

// ── User ────────────────────────────────────────────────────────────────────
export const userApi = {
  stats: () => api.get('/user/stats').then(r => r.data),
  history: (page?: number) => api.get('/user/history', { params: { page } }).then(r => r.data),
  profile: () => api.get('/user/profile').then(r => r.data),
  updateProfile: (data: { name?: string; picture?: string }) =>
    api.patch('/user/profile', data).then(r => r.data),
}

// ── Admin ───────────────────────────────────────────────────────────────────
export const adminApi = {
  stats: () => api.get('/admin/stats').then(r => r.data),
  questions: (params?: Record<string, unknown>) =>
    api.get('/admin/questions', { params }).then(r => r.data),
  createQuestion: (data: Record<string, unknown>) =>
    api.post('/admin/questions', data).then(r => r.data),
  updateQuestion: (id: string, data: Record<string, unknown>) =>
    api.put(`/admin/questions/${id}`, data).then(r => r.data),
  deleteQuestion: (id: string) =>
    api.delete(`/admin/questions/${id}`).then(r => r.data),
  users: (params?: Record<string, unknown>) =>
    api.get('/admin/users', { params }).then(r => r.data),
  banUser: (id: string, banned: boolean) =>
    api.patch(`/admin/users/${id}/ban`, { banned }).then(r => r.data),
  logs: (page?: number) =>
    api.get('/admin/logs', { params: { page } }).then(r => r.data),
  specialties: () => api.get('/admin/specialties').then(r => r.data),
  institutions: () => api.get('/admin/institutions').then(r => r.data),
}

// ── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptionApi = {
  current: () => api.get('/subscriptions/current').then(r => r.data),
  checkout: (plan: string, couponCode?: string) =>
    api.post('/subscriptions/checkout', { plan, couponCode }).then(r => r.data),
}

// ── Adaptive (CAT / IRT) ─────────────────────────────────────────────────────
export const adaptiveApi = {
  start: (data: { specialtyId?: string; nItems?: number }) =>
    api.post('/adaptive/start', data).then(r => r.data),
  answer: (sessionId: string, data: { selectedOpt: string; timeSpentSec?: number }) =>
    api.post(`/adaptive/${sessionId}/answer`, data).then(r => r.data),
  finish: (sessionId: string) =>
    api.patch(`/adaptive/${sessionId}/finish`).then(r => r.data),
  history: () =>
    api.get('/adaptive/history').then(r => r.data),
}

// ── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  overview: () => api.get('/analytics/overview').then(r => r.data),
  thetaHistory: () => api.get('/analytics/theta-history').then(r => r.data),
  specialtyRadar: () => api.get('/analytics/specialty-radar').then(r => r.data),
  learningCurve: () => api.get('/analytics/learning-curve').then(r => r.data),
  weeklyReport: () => api.get('/analytics/weekly-report').then(r => r.data),
  alerts: () => api.get('/analytics/alerts').then(r => r.data),
  readAlert: (id: string) => api.patch(`/analytics/alerts/${id}/read`).then(r => r.data),
}

export default api
