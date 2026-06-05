import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { Gamepad2, Trophy, Swords, Zap, HelpCircle, CheckCircle2, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

type GameStats = {
  totalPoints: number
  completedRounds: boolean
  completedPista: boolean
  duelWins: number
  totalDuels: number
}

export default function MiniGamesPage() {
  const navigate = useNavigate()

  const { data: stats, isLoading } = useQuery<GameStats>({
    queryKey: ['game-stats'],
    queryFn: async () => {
      const res = await api.get('/games/stats')
      return res.data
    }
  })

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }} className="animate-fade-in">
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="apple-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Gamepad2 size={36} color="var(--accent-blue)" /> Mini Games
          </h1>
          <p className="apple-subtitle" style={{ marginTop: 8 }}>
            Escolha um desafio e entre direto no modo de jogo para testar seus conhecimentos e ganhar XP.
          </p>
        </div>
        
        {/* Total Points Badge */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(20, 184, 166, 0.15))',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: 16,
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 8px 30px rgba(59, 130, 246, 0.05)'
        }}>
          <Trophy color="var(--accent-gold)" size={24} />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Pontuação Total</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>
              {isLoading ? '...' : stats?.totalPoints || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* Game 1: Duelo Médico */}
        <div 
          onClick={() => navigate('/games/duel')}
          className="apple-card"
          style={{
            cursor: 'pointer',
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)'
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 126, 248, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {/* Card Header Cover */}
          <div style={{
            height: 180,
            background: 'linear-gradient(135deg, #1E1B4B 0%, #311042 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {/* Visual game graphics */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, zIndex: 1 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20,
                background: 'rgba(59, 130, 246, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid rgba(59, 130, 246, 0.5)',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
              }}>
                <Swords size={32} color="#60A5FA" />
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'rgba(255,255,255,0.2)', fontFamily: 'Outfit' }}>VS</span>
              <div style={{
                width: 64, height: 64, borderRadius: 20,
                background: 'rgba(239, 68, 68, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid rgba(239, 68, 68, 0.5)',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)'
              }}>
                <Zap size={32} color="#F87171" />
              </div>
            </div>
            
            {/* Tag */}
            <span style={{
              position: 'absolute', top: 16, left: 16,
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              color: '#93C5FD',
              fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              padding: '4px 10px', borderRadius: 99
            }}>
              Tempo Real
            </span>
          </div>

          {/* Card Body */}
          <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Duelo Médico</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 10, lineHeight: 1.6, flex: 1 }}>
              Desafie oponentes em partidas rápidas de 5 questões com temporizador. Quem responder correto e mais rápido ganha mais XP!
            </p>
            
            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--border)', margin: '1.5rem 0' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {stats?.totalDuels ? `Vitórias: ${stats.duelWins}/${stats.totalDuels}` : 'Nenhum duelo jogado'}
              </span>
              <span style={{ color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: '0.875rem' }}>
                Jogar Duelo <ChevronRight size={16} />
              </span>
            </div>
          </div>
        </div>

        {/* Game 2: Rounds */}
        <div 
          onClick={() => navigate('/games/rounds')}
          className="apple-card"
          style={{
            cursor: 'pointer',
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)'
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {/* Card Header Cover */}
          <div style={{
            height: 180,
            background: 'linear-gradient(135deg, #064E3B 0%, #062F4F 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {/* Visual game graphics */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, zIndex: 1 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.6))' }}>❤️</span>
              ))}
            </div>
            
            {/* Tag */}
            <span style={{
              position: 'absolute', top: 16, left: 16,
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34D399',
              fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              padding: '4px 10px', borderRadius: 99
            }}>
              Desafio Diário
            </span>
          </div>

          {/* Card Body */}
          <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Rounds</h2>
              {stats?.completedRounds && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  color: 'var(--accent-green)', fontSize: '0.75rem', fontWeight: 600,
                  background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                  padding: '3px 8px', borderRadius: 6
                }}>
                  <CheckCircle2 size={12} /> Feito Hoje
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 10, lineHeight: 1.6, flex: 1 }}>
              Uma sequência de 12 questões diárias idênticas para todos os participantes. Você tem apenas 3 vidas. Suba no Ranking!
            </p>
            
            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--border)', margin: '1.5rem 0' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', justifyInterface: 'space-between', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Reseta a cada 24 horas
              </span>
              <span style={{ color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: '0.875rem' }}>
                Jogar Rounds <ChevronRight size={16} />
              </span>
            </div>
          </div>
        </div>

        {/* Game 3: Pista Clínica */}
        <div 
          onClick={() => navigate('/games/pista')}
          className="apple-card"
          style={{
            cursor: 'pointer',
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)'
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(245, 158, 11, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {/* Card Header Cover */}
          <div style={{
            height: 180,
            background: 'linear-gradient(135deg, #78350F 0%, #1E293B 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {/* Visual game graphics */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContents: 'center', zIndex: 1 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid rgba(245, 158, 11, 0.5)',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)'
              }}>
                <HelpCircle size={32} color="#FBBF24" />
              </div>
            </div>
            
            {/* Tag */}
            <span style={{
              position: 'absolute', top: 16, left: 16,
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#FBBF24',
              fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              padding: '4px 10px', borderRadius: 99
            }}>
              Investigação Diária
            </span>
          </div>

          {/* Card Body */}
          <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Pista Clínica</h2>
              {stats?.completedPista && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  color: 'var(--accent-green)', fontSize: '0.75rem', fontWeight: 600,
                  background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                  padding: '3px 8px', borderRadius: 6
                }}>
                  <CheckCircle2 size={12} /> Feito Hoje
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 10, lineHeight: 1.6, flex: 1 }}>
              Investigue o caso clínico do dia com pistas progressivas de raciocínio. Tente acertar com o menor número de pistas possíveis!
            </p>
            
            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--border)', margin: '1.5rem 0' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', justifyInterface: 'space-between', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Novo caso clínico todos os dias
              </span>
              <span style={{ color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, fontSize: '0.875rem' }}>
                Jogar Pista <ChevronRight size={16} />
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
