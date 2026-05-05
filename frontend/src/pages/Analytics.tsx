import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { analyticsApi } from '../lib/api'
import {
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid
} from 'recharts'
import {
  Brain, TrendingUp, Target, AlertTriangle, CheckCircle,
  BarChart3, Activity, Shield, Gauge, Bell, Zap, ChevronRight
} from 'lucide-react'

type Tab = 'overview' | 'evolution' | 'specialties' | 'projection'

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const navigate = useNavigate()

  const { data: overview, isLoading } = useQuery({ queryKey: ['analytics-overview'], queryFn: analyticsApi.overview })
  const { data: thetaHist } = useQuery({ queryKey: ['theta-history'], queryFn: analyticsApi.thetaHistory, enabled: tab === 'evolution' })
  const { data: radar } = useQuery({ queryKey: ['specialty-radar'], queryFn: analyticsApi.specialtyRadar, enabled: tab === 'specialties' })
  const { data: lcurve } = useQuery({ queryKey: ['learning-curve'], queryFn: analyticsApi.learningCurve, enabled: tab === 'projection' })

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Visão Geral', icon: Gauge },
    { key: 'evolution', label: 'Evolução', icon: TrendingUp },
    { key: 'specialties', label: 'Especialidades', icon: Target },
    { key: 'projection', label: 'Projeção', icon: Activity },
  ]

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={24} color="#8B5CF6" /> Análise Inteligente
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: '0.8125rem' }}>
            IRT · CUSUM · Monte Carlo · Brier · χ²
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/adaptive')}
          style={{ padding: '0.625rem 1.25rem', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', fontSize: '0.8125rem' }}>
          <Brain size={16} /> Trilha Adaptativa
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', padding: '0.25rem', borderRadius: 12, background: 'var(--bg-elevated)' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
              padding: '0.625rem', borderRadius: 10, fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
              background: tab === t.key ? 'var(--bg-card)' : 'transparent',
              color: tab === t.key ? '#8B5CF6' : 'var(--text-muted)',
              border: 'none', transition: 'all 0.2s',
              boxShadow: tab === t.key ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
            }}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'overview' && <OverviewTab overview={overview} isLoading={isLoading} navigate={navigate} />}
      {tab === 'evolution' && <EvolutionTab data={thetaHist} />}
      {tab === 'specialties' && <SpecialtiesTab data={radar} />}
      {tab === 'projection' && <ProjectionTab data={lcurve} />}
    </div>
  )
}

// ── Overview Tab ──────────────────────────────────────────────────────────

function OverviewTab({ overview, isLoading, navigate }: { overview: any; isLoading: boolean; navigate: any }) {
  if (isLoading || !overview) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Carregando análise...</div>
  }

  const theta = overview.theta
  const cusum = overview.cusum
  const approval = overview.approval
  const bias = overview.optionBias

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* Theta card */}
        <div className="glass" style={{ borderRadius: 14, padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 4 }}>Habilidade θ</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit', color: '#8B5CF6' }}>
            {theta.value.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>±{theta.se.toFixed(2)} · {theta.label}</div>
          <div style={{ marginTop: 8, fontSize: '0.75rem', padding: '0.25rem 0.625rem', borderRadius: 6, display: 'inline-block', background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', fontWeight: 600 }}>
            Top {theta.percentile}%
          </div>
        </div>

        {/* Accuracy card */}
        <div className="glass" style={{ borderRadius: 14, padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 4 }}>Acerto Geral</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--accent-green)' }}>
            {Math.round(overview.accuracy.rate * 100)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{overview.accuracy.correct}/{overview.accuracy.total}</div>
        </div>

        {/* P(approval) */}
        <div className="glass" style={{ borderRadius: 14, padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 4 }}>P(Aprovação)</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit', color: approval.probability != null ? (approval.probability >= 0.6 ? 'var(--accent-green)' : '#EF4444') : 'var(--text-muted)' }}>
            {approval.probability != null ? `${Math.round(approval.probability * 100)}%` : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {approval.daysToExam != null ? `${approval.daysToExam} dias p/ prova` : 'Configure data da prova'}
          </div>
        </div>

        {/* Brier Score */}
        <div className="glass" style={{ borderRadius: 14, padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 4 }}>Brier Score</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit', color: overview.brierScore < 0.2 ? 'var(--accent-green)' : overview.brierScore < 0.3 ? '#F59E0B' : '#EF4444' }}>
            {overview.brierScore.toFixed(3)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {overview.brierScore < 0.2 ? 'Boa calibração' : overview.brierScore < 0.3 ? 'Calibração razoável' : 'Calibração fraca'}
          </div>
        </div>
      </div>

      {/* CUSUM + Chi-squared */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="glass" style={{ borderRadius: 14, padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {cusum.alert ? <AlertTriangle size={18} color="#EF4444" /> : <Shield size={18} color="var(--accent-green)" />}
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>CUSUM</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: cusum.alert ? '#EF4444' : 'var(--accent-green)' }}>
            {cusum.alert ? '⚠ Regressão detectada' : '✓ Estável'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            S = {cusum.stat.toFixed(2)} {cusum.changePoint != null ? `· Ponto de mudança: questão ${cusum.changePoint}` : ''}
          </div>
        </div>

        <div className="glass" style={{ borderRadius: 14, padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {bias.biasedOption ? <AlertTriangle size={18} color="#F59E0B" /> : <CheckCircle size={18} color="var(--accent-green)" />}
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Viés de Alternativa (χ²)</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: bias.biasedOption ? '#F59E0B' : 'var(--accent-green)' }}>
            {bias.biasedOption ? `Viés: letra ${bias.biasedOption}` : '✓ Sem viés'}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: 8 }}>
            {Object.entries(bias.distribution || {}).map(([letter, pct]) => (
              <div key={letter} style={{ flex: 1, textAlign: 'center', padding: '0.375rem', borderRadius: 6, background: letter === bias.biasedOption ? 'rgba(245,158,11,0.15)' : 'var(--bg-elevated)', fontSize: '0.75rem' }}>
                <div style={{ fontWeight: 700 }}>{letter}</div>
                <div style={{ color: 'var(--text-muted)' }}>{pct as number}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {overview.alerts?.length > 0 && (
        <div className="glass" style={{ borderRadius: 14, padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Bell size={18} color="#F59E0B" />
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Alertas Ativos</span>
          </div>
          {overview.alerts.map((a: any) => (
            <div key={a.id} style={{ padding: '0.75rem', borderRadius: 10, background: a.severity === 'CRITICAL' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${a.severity === 'CRITICAL' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`, marginBottom: '0.5rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.title}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>{a.message}</div>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <button className="glass glass-hover" onClick={() => navigate('/adaptive')}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', borderRadius: 14, padding: '1.25rem', cursor: 'pointer', border: '1px solid rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.04)', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Zap size={20} color="#8B5CF6" />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Iniciar Trilha Adaptativa</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{overview.sessionCount} sessões concluídas</div>
          </div>
        </div>
        <ChevronRight size={18} color="var(--text-muted)" />
      </button>
    </div>
  )
}

// ── Evolution Tab ─────────────────────────────────────────────────────────

function EvolutionTab({ data }: { data: any }) {
  if (!data?.snapshots?.length) {
    return <EmptyState message="Complete pelo menos 2 sessões adaptativas para ver a evolução." />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass" style={{ borderRadius: 16, padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem' }}>Evolução de θ ao longo do tempo</h3>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.snapshots}>
              <defs>
                <linearGradient id="thetaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={v => new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} domain={[-3, 3]} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.8125rem' }}
                formatter={(v: any) => [Number(v).toFixed(3), 'θ']}
                labelFormatter={v => new Date(v).toLocaleDateString('pt-BR')} />
              <Area type="monotone" dataKey="theta" stroke="#8B5CF6" fill="url(#thetaGrad)" strokeWidth={2} dot={{ r: 3, fill: '#8B5CF6' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {data.trajectory && (
        <div className="glass" style={{ borderRadius: 14, padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Análise de Trajetória</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)' }}>Tendência</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: data.trajectory.trend === 'up' ? 'var(--accent-green)' : data.trajectory.trend === 'down' ? '#EF4444' : 'var(--text-muted)', marginTop: 4 }}>
                {data.trajectory.trend === 'up' ? '↑ Subindo' : data.trajectory.trend === 'down' ? '↓ Descendo' : '→ Estável'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)' }}>Velocidade</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: 4 }}>{data.trajectory.velocity.toFixed(4)} θ/dia</div>
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)' }}>Aceleração</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: 4 }}>{data.trajectory.acceleration.toFixed(4)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Specialties Tab ───────────────────────────────────────────────────────

function SpecialtiesTab({ data }: { data: any }) {
  if (!data?.data?.length) {
    return <EmptyState message="Faça sessões adaptativas por especialidade para ver o radar." />
  }

  const radarData = data.data.map((d: any) => ({
    subject: d.name.length > 12 ? d.name.slice(0, 12) + '…' : d.name,
    theta: Math.max(0, d.theta + 3), // Shift to 0-6 range for radar
    fullMark: 6,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass" style={{ borderRadius: 16, padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem' }}>Radar de Especialidades</h3>
        <div style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} domain={[0, 6]} />
              <Radar name="θ" dataKey="theta" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* List */}
      <div className="glass" style={{ borderRadius: 14, padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Detalhamento</h3>
        {data.data.sort((a: any, b: any) => b.theta - a.theta).map((d: any) => (
          <div key={d.specialtyId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{d.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.nAnswers} respostas · {d.label}</div>
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#8B5CF6', fontFamily: 'Outfit' }}>{d.theta.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Projection Tab ────────────────────────────────────────────────────────

function ProjectionTab({ data }: { data: any }) {
  if (!data?.data) {
    return <EmptyState message="Mínimo 10 respostas necessárias para gerar a curva de aprendizado." />
  }

  const curve = data.data

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass" style={{ borderRadius: 16, padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Curva de Aprendizado + Projeção</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
          Regressão logística: logit(P) = β₀ + β₁·t
        </p>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curve.projection}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} label={{ value: 'Dia', position: 'bottom', fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} domain={[0, 100]} label={{ value: '%', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.8125rem' }}
                formatter={(v: any) => [`${v}%`, 'Predição']} />
              <Line type="monotone" dataKey="predicted" stroke="#8B5CF6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        <div className="glass" style={{ borderRadius: 14, padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)' }}>Taxa de Aprendizado</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: curve.beta1 > 0 ? 'var(--accent-green)' : '#EF4444', marginTop: 4, fontFamily: 'Outfit' }}>
            {curve.beta1 > 0 ? '+' : ''}{(curve.beta1 * 100).toFixed(3)}%/dia
          </div>
        </div>
        <div className="glass" style={{ borderRadius: 14, padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)' }}>R² (ajuste)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-blue)', marginTop: 4, fontFamily: 'Outfit' }}>
            {curve.r2.toFixed(3)}
          </div>
        </div>
        <div className="glass" style={{ borderRadius: 14, padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)' }}>Tendência</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: curve.trend === 'improving' ? 'var(--accent-green)' : curve.trend === 'declining' ? '#EF4444' : 'var(--text-muted)', marginTop: 4 }}>
            {curve.trend === 'improving' ? '↑ Melhorando' : curve.trend === 'declining' ? '↓ Piorando' : '→ Estável'}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  const navigate = useNavigate()
  return (
    <div className="glass" style={{ borderRadius: 16, padding: '3rem', textAlign: 'center' }}>
      <Brain size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>{message}</p>
      <button className="btn btn-primary" onClick={() => navigate('/adaptive')}
        style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}>
        <Zap size={16} /> Iniciar Trilha Adaptativa
      </button>
    </div>
  )
}
