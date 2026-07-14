import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  Star,
  ChevronDown,
  Check,
  Sparkles,
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Layers,
  Target,
  Flame,
  ShieldCheck,
  RefreshCw,
  Search,
  Lightbulb,
  RotateCcw,
  XCircle,
  BarChart2,
  Zap,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api, { subscriptionApi } from '../lib/api'
import { trackClick } from '../lib/tracker'

export default function AprovacaoLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [leadEmail, setLeadEmail] = useState('')
  const [loadingLead, setLoadingLead] = useState(false)
  const [activeAgendaTab, setActiveAgendaTab] = useState<'cronograma' | 'assuntos' | 'caderno'>('cronograma')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { data: plansData } = useQuery({
    queryKey: ['plans'],
    queryFn: subscriptionApi.plans,
  })

  const monthlyPrice = plansData?.monthly?.amount || 29
  const semiannualTotal = plansData?.semiannual?.amount || 97
  const annualTotal = plansData?.annual?.amount || 147

  const semiannualInstallment = Math.round(semiannualTotal / 6)
  const annualInstallment = Math.round(annualTotal / 12)

  useEffect(() => {
    document.title = 'RokoMed — Pare de estudar no escuro para a residência médica'
    trackClick('APROVACAO_LANDING_VIEW')
  }, [])

  const handleLeadCapture = async () => {
    if (!leadEmail.includes('@')) {
      alert('Por favor, insira um e-mail válido.')
      return
    }
    setLoadingLead(true)
    try {
      trackClick('APROVACAO_LEAD_CAPTURE', leadEmail)
      await api.post('/auth/lead', { email: leadEmail })
      localStorage.setItem('rokomed_lead_email', leadEmail)
      window.location.href = '/simulado-gratis'
    } catch (e) {
      console.error(e)
      localStorage.setItem('rokomed_lead_email', leadEmail)
      window.location.href = '/simulado-gratis'
    }
  }

  const faqItems = [
    {
      q: "As questões são de provas reais?",
      a: "Sim. O RokoMed reúne questões de provas reais de residência médica aplicadas pelas principais bancas e instituições do país, incluindo ENARE, USP, UNIFESP, UNICAMP, SUS-SP e outras."
    },
    {
      q: "Quais instituições e bancas estão disponíveis?",
      a: "A plataforma conta com questões de diversas bancas e instituições, com destaque para ENARE, USP-SP, UNIFESP, UNICAMP, SUS-SP e outras grandes provas de residência médica."
    },
    {
      q: "Quantas questões existem atualmente?",
      a: "O RokoMed conta com mais de 15.000 questões comentadas, organizadas por especialidade, tema, banca e nível de dificuldade."
    },
    {
      q: "Todas as questões são comentadas?",
      a: "Sim. Todas as questões possuem comentário explicativo. Além disso, você pode usar a IA Tutor (Dr. André) para aprofundar qualquer explicação ou esclarecer dúvidas específicas diretamente nos comentários da questão."
    },
    {
      q: "Como funciona a IA Tutor (Dr. André)?",
      a: "O Dr. André é o tutor de IA do RokoMed. Ele analisa as questões que você errou, explica o raciocínio por trás de cada alternativa e responde perguntas teóricas diretamente no contexto da questão. Os planos PRO têm acesso ilimitado ao Dr. André."
    },
    {
      q: "Como funcionam os flashcards?",
      a: "Os flashcards são adaptativos: o sistema prioriza os conteúdos que você tem mais dificuldade, trazendo-os para revisão com mais frequência. Isso torna sua revisão mais objetiva e reduz o tempo perdido com conteúdos que você já domina."
    },
    {
      q: "Como funciona a análise de desempenho?",
      a: "O RokoMed acompanha seu histórico de questões e identifica especialidades, temas e padrões onde você perde mais pontos. Você tem acesso a gráficos de evolução e pode visualizar claramente onde sua performance precisa de atenção."
    },
    {
      q: "O RokoMed funciona no celular?",
      a: "Sim. A plataforma é responsiva e funciona bem no celular, tablet e desktop, sem necessidade de instalar nenhum aplicativo."
    },
    {
      q: "Novas questões são adicionadas?",
      a: "Sim. A plataforma é atualizada continuamente com novas questões de provas recentes."
    },
    {
      q: "Existe fidelidade contratual?",
      a: "Não. Você pode cancelar sua assinatura a qualquer momento com apenas um clique na área de perfil, sem nenhuma multa contratual. Seu acesso permanece ativo até o fim do período contratado."
    },
    {
      q: "Como funciona a garantia de 7 dias?",
      a: "Se você assinar e não ficar satisfeito nos primeiros 7 dias, basta entrar em contato e devolvemos o valor integralmente. Sem burocracia."
    },
    {
      q: "Qual é a diferença entre o RokoMed e um cursinho tradicional?",
      a: "Cursinhos tradicionais geralmente focam em centenas de horas de videoaulas. O RokoMed é uma plataforma focada em estudo ativo por questões: você resolve, identifica onde está perdendo pontos, entende seus erros com comentários e IA, e revisa com flashcards adaptativos. O objetivo não é consumir conteúdo passivamente, mas transformar seus erros em uma preparação mais objetiva."
    }
  ]

  return (
    <div className="ap-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Sora:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

        .ap-root *, .ap-root *::before, .ap-root *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .ap-root {
          background-color: #030812;
          color: #C8DCF5;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;

          --bg-deep: #030812;
          --bg-surface: #070F1E;
          --bg-card: #0C1A30;
          --bg-card-hover: #112443;
          --border: rgba(100, 160, 255, 0.08);
          --border-hover: rgba(100, 160, 255, 0.2);
          --primary: #3B7EF8;
          --primary-glow: rgba(59, 126, 248, 0.15);
          --cyan: #A5C3F7;
          --cyan-glow: rgba(165, 195, 247, 0.15);
          --green: #10B981;
          --amber: #F59E0B;
          --text-primary: #EBF4FF;
          --text-secondary: #7B9DBF;
          --text-muted: #4F6D8C;
          --radius-md: 12px;
          --radius-lg: 24px;
        }

        .ap-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Ambient Glows */
        .ap-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
          opacity: 0.45;
        }

        /* Buttons */
        .ap-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          border-radius: 9999px;
          padding: 14px 28px;
          cursor: pointer;
          border: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          white-space: nowrap;
          font-family: 'Sora', sans-serif;
        }

        .ap-btn-primary {
          background: linear-gradient(135deg, var(--primary) 0%, #1D4ED8 100%);
          color: white;
          box-shadow: 0 4px 20px var(--primary-glow);
        }

        .ap-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(59, 126, 248, 0.35);
          background: linear-gradient(135deg, #4F8BFF 0%, #2563EB 100%);
        }

        .ap-btn-cyan {
          background: linear-gradient(135deg, var(--cyan) 0%, var(--primary) 100%);
          color: #030812;
          box-shadow: 0 4px 20px var(--cyan-glow);
        }

        .ap-btn-cyan:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(165, 195, 247, 0.25);
        }

        .ap-btn-ghost {
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-primary);
          border: 1px solid var(--border);
        }

        .ap-btn-ghost:hover {
          border-color: var(--border-hover);
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-1px);
        }

        .ap-btn-lg {
          font-size: 16px;
          padding: 18px 40px;
        }

        /* Cards styling */
        .ap-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 32px;
          position: relative;
          z-index: 1;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ap-card-hover:hover {
          transform: translateY(-4px);
          border-color: var(--border-hover);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
          background: var(--bg-card-hover);
        }

        /* Header / Nav */
        .ap-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(3, 8, 18, 0.75);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          transition: background 0.3s;
        }

        .ap-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
        }

        .ap-logo {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: var(--text-primary);
          text-decoration: none;
          letter-spacing: -0.02em;
        }

        .ap-logo span {
          color: var(--primary);
        }

        .ap-nav-links {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .ap-nav-link {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.2s;
        }

        .ap-nav-link:hover {
          color: var(--text-primary);
        }

        /* Hero */
        .ap-hero-sec {
          position: relative;
          padding: 140px 0 80px;
          overflow: hidden;
        }

        .ap-hero-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 56px;
          align-items: center;
        }

        .ap-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--cyan);
          background: rgba(165, 195, 247, 0.06);
          border: 1px solid rgba(165, 195, 247, 0.15);
          padding: 6px 14px;
          border-radius: 9999px;
          margin-bottom: 24px;
          font-family: 'Sora', sans-serif;
        }

        .ap-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(34px, 5.5vw, 54px);
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.1;
          letter-spacing: -0.03em;
        }

        .ap-title span {
          background: linear-gradient(135deg, var(--cyan) 0%, var(--primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .ap-subtitle {
          color: var(--text-secondary);
          font-size: clamp(15px, 2.5vw, 18px);
          line-height: 1.6;
          margin: 20px 0 32px;
          max-width: 600px;
        }

        /* Trust bar */
        .ap-trust-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 32px;
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .ap-trust-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ap-trust-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--cyan);
          flex-shrink: 0;
        }

        /* Lead capture container */
        .ap-lead-box {
          display: flex;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 6px;
          max-width: 520px;
          width: 100%;
          align-items: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          margin-bottom: 16px;
        }

        .ap-lead-input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 12px 16px;
          color: white;
          font-size: 14px;
          outline: none;
          font-family: inherit;
        }

        .ap-lead-input::placeholder {
          color: var(--text-muted);
        }

        .ap-cta-sub {
          font-size: 12px;
          color: var(--text-muted);
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .ap-cta-sub span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Hero Right: Floating Interface Teaser */
        .ap-hero-visual {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .ap-dashboard-teaser {
          width: 100%;
          max-width: 440px;
          background: rgba(12, 26, 48, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(100, 160, 255, 0.12);
          border-radius: var(--radius-lg);
          padding: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          position: relative;
          z-index: 2;
        }

        /* Infinite Marquee Ticker */
        .ap-marquee {
          background: linear-gradient(90deg, rgba(59, 126, 248, 0.06) 0%, rgba(165, 195, 247, 0.06) 100%);
          border-y: 1px solid rgba(100, 160, 255, 0.1);
          overflow: hidden;
          padding: 16px 0;
          white-space: nowrap;
        }

        .ap-marquee-track {
          display: inline-flex;
          gap: 48px;
          animation: ap-scroll 30s linear infinite;
        }

        @keyframes ap-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .ap-marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Sora', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .ap-marquee-item strong {
          color: var(--text-primary);
        }

        .ap-marquee-dot {
          color: var(--cyan);
          font-size: 16px;
        }

        /* Section header */
        .ap-sec-header {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 56px;
        }

        .ap-sec-tag {
          font-family: 'Sora', sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--primary);
          letter-spacing: 0.1em;
          margin-bottom: 12px;
        }

        .ap-sec-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .ap-sec-title span {
          background: linear-gradient(135deg, var(--cyan) 0%, var(--primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .ap-sec-desc {
          color: var(--text-secondary);
          font-size: 16px;
          margin-top: 14px;
          line-height: 1.6;
        }

        /* Problem Section */
        .ap-problem-sec {
          background: linear-gradient(180deg, #030812 0%, #050e1a 100%);
          position: relative;
        }

        .ap-problem-list {
          max-width: 680px;
          margin: 0 auto 48px;
        }

        .ap-problem-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 18px 0;
          border-bottom: 1px solid var(--border);
          font-size: 17px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .ap-problem-item:last-child {
          border-bottom: none;
        }

        .ap-problem-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .ap-problem-questions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          max-width: 800px;
          margin: 0 auto 40px;
        }

        .ap-problem-q {
          padding: 20px 24px;
          background: rgba(59, 126, 248, 0.04);
          border: 1px solid rgba(59, 126, 248, 0.12);
          border-radius: 16px;
          font-size: 15px;
          color: var(--cyan);
          font-weight: 500;
          line-height: 1.4;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Ciclo Roko */
        .ap-ciclo-sec {
          position: relative;
          background: #050E1A;
        }

        .ap-ciclo-flow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 56px;
          flex-wrap: wrap;
        }

        .ap-ciclo-pill {
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 700;
          padding: 8px 20px;
          border-radius: 9999px;
          border: 1px solid var(--border-hover);
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
          letter-spacing: 0.04em;
        }

        .ap-ciclo-arrow {
          color: var(--cyan);
          font-size: 18px;
          opacity: 0.6;
        }

        .ap-step-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }

        .ap-step-card {
          padding: 32px 24px;
          border-radius: var(--radius-lg);
          background: rgba(12, 26, 48, 0.4);
          border: 1px solid var(--border);
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }

        .ap-step-card:hover {
          transform: translateY(-4px);
          border-color: var(--border-hover);
          background: rgba(12, 26, 48, 0.7);
        }

        .ap-step-num {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 800;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary) 0%, #1D4ED8 100%);
          color: white;
          box-shadow: 0 4px 12px var(--primary-glow);
          margin-bottom: 24px;
        }

        .ap-step-card:nth-child(2) .ap-step-num {
          background: linear-gradient(135deg, var(--cyan) 0%, var(--primary) 100%);
          color: #030812;
          box-shadow: 0 4px 12px var(--cyan-glow);
        }

        .ap-step-card:nth-child(3) .ap-step-num {
          background: linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%);
          box-shadow: 0 4px 12px rgba(236, 72, 153, 0.25);
        }

        .ap-step-card:nth-child(4) .ap-step-num {
          background: linear-gradient(135deg, var(--amber) 0%, #D97706 100%);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
        }

        .ap-step-label {
          font-family: 'Sora', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--primary);
          margin-bottom: 6px;
        }

        .ap-step-card:nth-child(2) .ap-step-label { color: var(--cyan); }
        .ap-step-card:nth-child(3) .ap-step-label { color: #EC4899; }
        .ap-step-card:nth-child(4) .ap-step-label { color: var(--amber); }

        .ap-step-title {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .ap-step-desc {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Interactive scheduler mockup */
        .ap-sched-sec {
          padding: 100px 0;
          background: #030812;
          position: relative;
        }

        .ap-sched-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }

        /* Interactive controls */
        .ap-tab-btn {
          display: flex;
          gap: 16px;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: all 0.25s;
        }

        .ap-tab-btn.active {
          background: rgba(12, 26, 48, 0.7);
          border-color: var(--border-hover);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .ap-tab-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .ap-tab-btn.active .ap-tab-icon {
          background: var(--primary-glow);
          border-color: var(--primary);
          color: var(--primary);
        }

        .ap-tab-title {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-secondary);
          transition: color 0.2s;
        }

        .ap-tab-btn.active .ap-tab-title {
          color: var(--text-primary);
        }

        .ap-tab-desc {
          font-size: 14px;
          color: var(--text-muted);
          margin-top: 4px;
          line-height: 1.5;
        }

        /* Mock views */
        .ap-mock-screen {
          background: #081121;
          border: 1px solid rgba(100, 160, 255, 0.15);
          border-radius: var(--radius-lg);
          padding: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          min-height: 380px;
          display: flex;
          flex-direction: column;
        }

        .ap-mock-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border);
          padding-bottom: 14px;
          margin-bottom: 18px;
        }

        /* Features / Benefits */
        .ap-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 28px;
        }

        .ap-benefit-headline {
          font-family: 'Outfit', sans-serif;
          font-size: 19px;
          font-weight: 700;
          color: white;
          margin-top: 20px;
          margin-bottom: 6px;
          line-height: 1.3;
        }

        /* Questions positioning section */
        .ap-questions-sec {
          background: #050E1A;
          position: relative;
        }

        .ap-questions-inner {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }

        .ap-questions-stat {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(60px, 10vw, 100px);
          font-weight: 800;
          background: linear-gradient(135deg, var(--cyan) 0%, var(--primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1;
          margin-bottom: 8px;
        }

        /* Comparison */
        .ap-compare-sec {
          position: relative;
        }

        .ap-compare-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          max-width: 900px;
          margin: 0 auto;
        }

        .ap-compare-col {
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .ap-compare-col.roko {
          border-color: rgba(59, 126, 248, 0.3);
          box-shadow: 0 8px 32px rgba(59, 126, 248, 0.08);
        }

        .ap-compare-head {
          padding: 16px 24px;
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .ap-compare-col:not(.roko) .ap-compare-head {
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-muted);
          border-bottom: 1px solid var(--border);
        }

        .ap-compare-col.roko .ap-compare-head {
          background: rgba(59, 126, 248, 0.08);
          color: var(--cyan);
          border-bottom: 1px solid rgba(59, 126, 248, 0.15);
        }

        .ap-compare-item {
          padding: 16px 24px;
          font-size: 14px;
          line-height: 1.5;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .ap-compare-item:last-child {
          border-bottom: none;
        }

        .ap-compare-col:not(.roko) .ap-compare-item {
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.01);
        }

        .ap-compare-col.roko .ap-compare-item {
          color: var(--text-primary);
          background: rgba(12, 26, 48, 0.4);
        }

        /* Testimonials */
        .ap-testimonials-sec {
          background: #050E1A;
          position: relative;
        }

        .ap-test-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
        }

        .ap-test-card {
          padding: 28px;
          border-radius: var(--radius-lg);
          background: rgba(12, 26, 48, 0.5);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .ap-test-stars {
          display: flex;
          gap: 3px;
          margin-bottom: 16px;
        }

        .ap-test-quote {
          font-size: 14px;
          line-height: 1.7;
          color: var(--text-primary);
          font-style: italic;
          margin-bottom: 20px;
          flex: 1;
        }

        .ap-test-tag {
          font-size: 11px;
          font-weight: 600;
          color: var(--green);
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 4px 10px;
          border-radius: 4px;
          align-self: flex-start;
          margin-bottom: 20px;
        }

        .ap-test-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .ap-test-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary) 0%, var(--cyan) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          color: #030812;
          font-size: 14px;
          flex-shrink: 0;
        }

        /* Pricing layout */
        .ap-pricing-sec {
          background: #050E1A;
          position: relative;
        }

        .ap-pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 28px;
          margin-top: 56px;
        }

        .ap-price-card {
          background: rgba(12, 26, 48, 0.5);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 40px 28px;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: all 0.3s;
        }

        .ap-price-card.popular {
          border-color: var(--primary);
          background: rgba(12, 26, 48, 0.8);
          box-shadow: 0 10px 30px rgba(59, 126, 248, 0.12);
        }

        .ap-price-card.popular::before {
          content: 'Melhor Custo-Benefício';
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--primary);
          color: white;
          padding: 4px 16px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: 'Sora', sans-serif;
          white-space: nowrap;
        }

        .ap-price-card:hover {
          transform: translateY(-4px);
          border-color: var(--border-hover);
        }

        .ap-price-title {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: white;
        }

        .ap-price-desc {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .ap-price-val {
          margin: 32px 0;
        }

        .ap-price-val span.currency {
          font-size: 18px;
          font-weight: 600;
          color: white;
          margin-right: 4px;
        }

        .ap-price-val span.amount {
          font-family: 'Outfit', sans-serif;
          font-size: 48px;
          font-weight: 800;
          color: white;
        }

        .ap-price-val span.period {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .ap-features-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 32px;
        }

        .ap-features-list li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: var(--text-primary);
        }

        /* Why cheaper section */
        .ap-cheaper-sec {
          background: #030812;
          position: relative;
        }

        .ap-cheaper-inner {
          max-width: 760px;
          margin: 0 auto;
          text-align: center;
        }

        /* For whom section */
        .ap-forwhom-sec {
          background: #050E1A;
          position: relative;
        }

        .ap-forwhom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          max-width: 900px;
          margin: 0 auto;
        }

        .ap-forwhom-col {
          padding: 32px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
        }

        .ap-forwhom-col.yes {
          background: rgba(16, 185, 129, 0.03);
          border-color: rgba(16, 185, 129, 0.15);
        }

        .ap-forwhom-col.maybe-not {
          background: rgba(255, 255, 255, 0.01);
        }

        .ap-forwhom-head {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .ap-forwhom-col.yes .ap-forwhom-head { color: var(--green); }
        .ap-forwhom-col.maybe-not .ap-forwhom-head { color: var(--text-secondary); }

        .ap-forwhom-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 14px;
          font-size: 14px;
          line-height: 1.5;
        }

        .ap-forwhom-col.yes .ap-forwhom-item { color: var(--text-primary); }
        .ap-forwhom-col.maybe-not .ap-forwhom-item { color: var(--text-secondary); }

        /* FAQ Accordion */
        .ap-faq-list {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ap-faq-item {
          background: rgba(12, 26, 48, 0.4);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .ap-faq-item:hover {
          border-color: var(--border-hover);
        }

        .ap-faq-btn {
          width: 100%;
          border: none;
          background: transparent;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          text-align: left;
          color: white;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 16px;
          gap: 16px;
        }

        .ap-faq-ans {
          padding: 0 24px 20px;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.7;
        }

        /* Final CTA Section */
        .ap-finalcta-sec {
          background: linear-gradient(180deg, #030812 0%, #05101e 100%);
          position: relative;
          text-align: center;
        }

        .ap-finalcta-inner {
          max-width: 680px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* Footer */
        .ap-footer {
          background: #02060F;
          padding: 48px 0;
          border-top: 1px solid var(--border);
          font-size: 13px;
          color: var(--text-muted);
          text-align: center;
        }

        /* Animations */
        .animate-rot {
          animation: ap-spin 20s linear infinite;
        }

        @keyframes ap-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 991px) {
          .ap-hero-grid, .ap-sched-grid, .ap-forwhom-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .ap-hero-sec {
            padding-top: 100px;
          }
          .ap-dashboard-teaser {
            margin: 0 auto;
          }
          .ap-compare-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ── Mobile (≤ 768px) ── */
        @media (max-width: 768px) {
          .ap-container {
            padding: 0 16px;
          }

          /* Nav */
          .ap-nav-links {
            display: none;
          }
          .ap-nav-cta-desktop {
            display: none;
          }
          .ap-hamburger {
            display: flex;
            flex-direction: column;
            gap: 5px;
            cursor: pointer;
            background: none;
            border: none;
            padding: 6px;
          }
          .ap-hamburger span {
            display: block;
            width: 22px;
            height: 2px;
            background: var(--text-primary);
            border-radius: 2px;
            transition: all 0.2s;
          }
          .ap-mobile-menu {
            display: flex;
            flex-direction: column;
            gap: 0;
            position: fixed;
            top: 72px;
            left: 0;
            right: 0;
            background: rgba(3, 8, 18, 0.97);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--border);
            padding: 16px 24px 24px;
            z-index: 99;
          }
          .ap-mobile-menu a, .ap-mobile-menu button {
            display: block;
            padding: 14px 0;
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
            text-decoration: none;
            border-bottom: 1px solid var(--border);
            background: none;
            border-left: none;
            border-right: none;
            border-top: none;
            cursor: pointer;
            text-align: left;
            font-family: inherit;
          }
          .ap-mobile-menu a:last-child, .ap-mobile-menu button:last-child {
            border-bottom: none;
          }
          .ap-mobile-cta {
            margin-top: 16px;
            display: block;
            text-align: center;
            background: linear-gradient(135deg, var(--primary) 0%, #1D4ED8 100%);
            color: white !important;
            padding: 14px 24px !important;
            border-radius: 9999px;
            font-family: 'Sora', sans-serif !important;
            font-weight: 700 !important;
            font-size: 14px !important;
          }

          /* Hero */
          .ap-hero-sec {
            padding: 90px 0 60px;
          }
          .ap-hero-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .ap-hero-visual {
            display: none;
          }
          .ap-lead-box {
            flex-direction: column;
            border-radius: 14px;
            padding: 12px;
            gap: 10px;
          }
          .ap-lead-input {
            width: 100%;
            padding: 14px 16px;
          }
          .ap-lead-box .ap-btn {
            width: 100%;
            border-radius: 10px !important;
            padding: 14px 20px !important;
            font-size: 14px !important;
          }

          /* Sections */
          .ap-sched-sec {
            padding: 60px 0;
          }
          .ap-sched-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .ap-step-grid {
            grid-template-columns: 1fr;
          }
          .ap-pricing-grid {
            grid-template-columns: 1fr;
          }
          .ap-test-grid {
            grid-template-columns: 1fr;
          }
          .ap-features-grid {
            grid-template-columns: 1fr;
          }
          .ap-forwhom-grid {
            grid-template-columns: 1fr;
          }
          .ap-compare-grid {
            grid-template-columns: 1fr;
          }

          /* Calculator section inline grid */
          .ap-calc-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .ap-calc-inner-grid {
            grid-template-columns: 1fr !important;
          }

          /* Section headers */
          .ap-sec-header {
            margin-bottom: 36px;
          }
          section {
            padding: 60px 0 !important;
          }

          /* Mock screen */
          .ap-mock-screen {
            min-height: 300px;
          }

          /* Compare */
          .ap-compare-wrap {
            overflow-x: auto;
          }

          /* Price card popular badge */
          .ap-price-card.popular {
            margin-top: 12px;
          }

          .ap-ciclo-flow {
            gap: 6px;
          }
          .ap-ciclo-pill {
            font-size: 12px;
            padding: 6px 14px;
          }
          .ap-trust-bar {
            gap: 12px;
          }
        }

        @media (min-width: 769px) {
          .ap-hamburger {
            display: none;
          }
          .ap-mobile-menu {
            display: none !important;
          }
        }
      `}</style>

      {/* Decorative ambient glows */}
      <div className="ap-glow" style={{ top: '-10%', left: '5%', width: '400px', height: '400px', background: 'var(--primary)' }}></div>
      <div className="ap-glow" style={{ top: '40%', right: '-10%', width: '500px', height: '500px', background: 'rgba(165, 195, 247, 0.15)' }}></div>
      <div className="ap-glow" style={{ bottom: '10%', left: '-10%', width: '400px', height: '400px', background: 'rgba(139, 92, 246, 0.2)' }}></div>

      {/* ── Navigation Header ── */}
      <header className="ap-header">
        <div className="ap-container ap-nav">
          <Link to="/" className="ap-logo">
            Roko<span>Med</span>
          </Link>
          <nav className="ap-nav-links">
            <a href="#ciclo-roko" className="ap-nav-link">Metodologia</a>
            <a href="#plataforma" className="ap-nav-link">Plataforma</a>
            <a href="#depoimentos" className="ap-nav-link">Depoimentos</a>
            <a href="#planos" className="ap-nav-link">Planos</a>
            <a href="#faq" className="ap-nav-link">Dúvidas</a>
          </nav>
          <a href="#planos" className="ap-btn ap-btn-primary ap-nav-cta-desktop" style={{ padding: '10px 22px', fontSize: '13px' }}>
            Começar Agora <ArrowRight size={14} />
          </a>
          {/* Hamburger button for mobile */}
          <button
            className="ap-hamburger"
            aria-label="Abrir menu"
            onClick={() => setMobileMenuOpen(prev => !prev)}
          >
            <span /><span /><span />
          </button>
        </div>
        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="ap-mobile-menu">
            <a href="#ciclo-roko" onClick={() => setMobileMenuOpen(false)}>Metodologia</a>
            <a href="#plataforma" onClick={() => setMobileMenuOpen(false)}>Plataforma</a>
            <a href="#depoimentos" onClick={() => setMobileMenuOpen(false)}>Depoimentos</a>
            <a href="#planos" onClick={() => setMobileMenuOpen(false)}>Planos</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>Dúvidas</a>
            <a href="#planos" className="ap-mobile-cta" onClick={() => setMobileMenuOpen(false)}>Começar Agora →</a>
          </div>
        )}
      </header>

      {/* ── 1. HERO SECTION ── */}
      <section className="ap-hero-sec">
        <div className="ap-container ap-hero-grid">
          
          <div>
            <div className="ap-badge">
              <Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} />
              Plataforma inteligente para residência médica
            </div>
            
            <h1 className="ap-title">
              Pare de estudar no escuro<br />
              para a <span>residência médica.</span>
            </h1>
            
            <p className="ap-subtitle">
              Resolva questões reais, descubra exatamente onde está perdendo pontos e transforme seus erros em revisões inteligentes com IA e flashcards adaptativos.
            </p>

            {/* Trust line */}
            <div className="ap-trust-bar">
              <span className="ap-trust-item"><span className="ap-trust-dot"></span> 15.000+ questões comentadas</span>
              <span className="ap-trust-item"><span className="ap-trust-dot"></span> ENARE, USP, UNIFESP e outras</span>
              <span className="ap-trust-item"><span className="ap-trust-dot"></span> IA Tutor</span>
              <span className="ap-trust-item"><span className="ap-trust-dot"></span> Revisão inteligente dos seus erros</span>
            </div>

            {/* Email Lead Capture — preservado integralmente */}
            <div className="ap-lead-box">
              <input
                type="email"
                placeholder="Seu melhor e-mail profissional..."
                value={leadEmail}
                onChange={e => setLeadEmail(e.target.value)}
                className="ap-lead-input"
                aria-label="Seu melhor e-mail profissional"
              />
              <button
                onClick={handleLeadCapture}
                disabled={loadingLead}
                className="ap-btn ap-btn-cyan"
                style={{ padding: '12px 24px', fontSize: '13px', borderRadius: '12px' }}
              >
                {loadingLead ? 'Processando...' : 'Estudar Grátis'} <ArrowRight size={14} />
              </button>
            </div>

            <div className="ap-cta-sub">
              <span><ShieldCheck size={13} color="var(--green)" /> Acesso imediato</span>
              <span><Check size={13} color="var(--green)" /> Sem fidelidade</span>
              <span><ShieldCheck size={13} color="var(--green)" /> 7 dias de garantia</span>
            </div>

            <div style={{ marginTop: 24 }}>
              <Link
                to="/checkout?plan=monthly"
                className="ap-btn ap-btn-primary"
                style={{ fontSize: '15px', padding: '16px 36px' }}
              >
                Começar agora por R$ {monthlyPrice}/mês <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Hero Right: Dashboard Teaser */}
          <div className="ap-hero-visual">
            {/* Rotating stamp animation */}
            <div style={{ position: 'absolute', top: -36, left: -36, zIndex: 10, width: 120, height: 120 }}>
              <svg viewBox="0 0 120 120" className="animate-rot" style={{ width: '100%', height: '100%', color: 'var(--text-primary)' }}>
                <defs>
                  <path id="badge-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
                </defs>
                <text fontSize="8.2" fontWeight="700" letterSpacing="2.5" fill="currentColor">
                  <textPath href="#badge-circle">✦ ROKOMED ✦ ESTUDO ATIVO ✦ RESIDÊNCIA MÉDICA </textPath>
                </text>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan) 0%, var(--primary) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#030812', fontWeight: 800, fontSize: 10, textAlign: 'center', lineHeight: 1.1, boxShadow: '0 4px 12px var(--cyan-glow)' }}>
                  Roko<br />Med
                </div>
              </div>
            </div>

            {/* Interactive Dashboard teaser */}
            <div className="ap-dashboard-teaser">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', fontFamily: 'Sora' }}>Análise de Desempenho</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '11px', color: 'var(--green)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                  <TrendingUp size={10} /> +18.4% esta semana
                </span>
              </div>

              {/* Mini question teaser */}
              <div style={{ padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 14 }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, fontFamily: 'Sora', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Questão Recente — Clínica Médica (USP)</div>
                <div style={{ fontSize: '12px', color: 'white', lineHeight: 1.5, marginBottom: 10 }}>
                  Homem, 58 anos, HAS, DM2. Queixa de dispneia aos esforços progressiva há 2 meses. Ausculta: B3. Diagnóstico mais provável?
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '11px', color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <XCircle size={11} color="#EF4444" /> A) Pericardite aguda
                  </div>
                  <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '11px', color: '#6EE7B7', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={11} color="#10B981" /> B) Insuficiência Cardíaca
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1, padding: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Taxa de Acerto</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'white', marginTop: 2, fontFamily: 'Outfit' }}>78.4%</div>
                </div>
                <div style={{ flex: 1, padding: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Sequência</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#F97316', marginTop: 2, fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Flame size={16} fill="#F97316" /> 14d
                  </div>
                </div>
              </div>

              <div style={{ padding: 14, background: 'rgba(59, 126, 248, 0.05)', border: '1px solid rgba(59, 126, 248, 0.15)', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', fontWeight: 700, color: 'var(--primary)', marginBottom: 6, fontFamily: 'Sora' }}>
                  <MessageSquare size={11} /> IA TUTOR — Análise do Erro
                </div>
                <p style={{ fontSize: '11.5px', color: '#B2CBE5', lineHeight: 1.5 }}>
                  "Você perdeu 35% dos pontos em Gastroenterologia. Identifiquei as questões específicas da USP para focar na revisão de amanhã."
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Infinite Marquee Ticker ── */}
      <div className="ap-marquee">
        <div className="ap-marquee-track">
          {Array.from({ length: 4 }).map((_, outerIdx) => (
            <div key={outerIdx} style={{ display: 'inline-flex', gap: 48 }}>
              <span className="ap-marquee-item"><span className="ap-marquee-dot">◆</span> Clínica Médica — Síndrome Coronariana Aguda</span>
              <span className="ap-marquee-item"><span className="ap-marquee-dot">◆</span> Infectologia — Sepse e Choque Séptico</span>
              <span className="ap-marquee-item"><span className="ap-marquee-dot">◆</span> Cirurgia — Abdome Agudo</span>
              <span className="ap-marquee-item"><span className="ap-marquee-dot">◆</span> Pediatria — Reanimação Neonatal</span>
              <span className="ap-marquee-item"><span className="ap-marquee-dot">◆</span> GO — Pré-eclâmpsia e Eclâmpsia</span>
              <span className="ap-marquee-item"><span className="ap-marquee-dot">◆</span> Neurologia — AVC Isquêmico</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. PROBLEM SECTION ── */}
      <section className="ap-problem-sec" style={{ padding: '100px 0' }}>
        <div className="ap-container">
          <div className="ap-sec-header">
            <div className="ap-sec-tag">O problema real</div>
            <h2 className="ap-sec-title">Você estuda, mas sabe exatamente onde está <span>perdendo pontos?</span></h2>
          </div>

          <div className="ap-problem-list">
            <div className="ap-problem-item">
              <div className="ap-problem-icon">
                <BookOpen size={15} color="#EF4444" />
              </div>
              <span>Você resolve questões. Assiste aulas. Faz resumos. Pula de um assunto para outro.</span>
            </div>
            <div className="ap-problem-item">
              <div className="ap-problem-icon">
                <Search size={15} color="#EF4444" />
              </div>
              <span>Mas continua sem saber em quais especialidades e temas está perdendo mais pontos.</span>
            </div>
            <div className="ap-problem-item">
              <div className="ap-problem-icon">
                <BarChart2 size={15} color="#EF4444" />
              </div>
              <span>Sem dados claros sobre seu desempenho, fica difícil saber o que revisar primeiro.</span>
            </div>
          </div>

          <div className="ap-problem-questions">
            <div className="ap-problem-q">
              <Search size={16} style={{ flexShrink: 0 }} />
              Onde exatamente estou perdendo meus pontos?
            </div>
            <div className="ap-problem-q">
              <RefreshCw size={16} style={{ flexShrink: 0 }} />
              O que devo revisar primeiro?
            </div>
            <div className="ap-problem-q">
              <TrendingUp size={16} style={{ flexShrink: 0 }} />
              Estou realmente melhorando?
            </div>
          </div>

          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              O RokoMed foi criado para transformar essas dúvidas em{' '}
              <strong style={{ color: 'var(--text-primary)' }}>questões, dados e uma revisão mais objetiva.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. O CICLO ROKO (Metodologia) ── */}
      <section id="ciclo-roko" className="ap-ciclo-sec" style={{ padding: '100px 0' }}>
        <div className="ap-container">
          <div className="ap-sec-header">
            <div className="ap-sec-tag">O Ciclo Roko</div>
            <h2 className="ap-sec-title">Transforme cada erro em <span>um próximo passo claro.</span></h2>
            <p className="ap-sec-desc">
              O RokoMed não é um banco de questões solto. É um sistema integrado onde cada erro vira aprendizado e cada sessão de estudo gera informação útil.
            </p>
          </div>

          <div className="ap-ciclo-flow">
            <span className="ap-ciclo-pill">Resolva</span>
            <span className="ap-ciclo-arrow">→</span>
            <span className="ap-ciclo-pill">Descubra</span>
            <span className="ap-ciclo-arrow">→</span>
            <span className="ap-ciclo-pill">Corrija</span>
            <span className="ap-ciclo-arrow">→</span>
            <span className="ap-ciclo-pill">Fixe</span>
          </div>

          <div className="ap-step-grid">
            <div className="ap-step-card">
              <div className="ap-step-num">01</div>
              <div className="ap-step-label">Resolva</div>
              <h3 className="ap-step-title">Treine com questões reais</h3>
              <p className="ap-step-desc">Mais de 15.000 questões das principais provas e bancas de residência médica: ENARE, USP, UNIFESP, UNICAMP, SUS-SP e outras.</p>
            </div>
            <div className="ap-step-card">
              <div className="ap-step-num">02</div>
              <div className="ap-step-label">Descubra</div>
              <h3 className="ap-step-title">Veja onde você perde pontos</h3>
              <p className="ap-step-desc">O RokoMed identifica especialidades, temas e padrões onde você mais erra. Não é achismo: é o seu histórico de respostas transformado em dado.</p>
            </div>
            <div className="ap-step-card">
              <div className="ap-step-num">03</div>
              <div className="ap-step-label">Corrija</div>
              <h3 className="ap-step-title">Entenda por que errou</h3>
              <p className="ap-step-desc">Comentários detalhados em cada questão e a IA Tutor (Dr. André) para explicar o raciocínio, aprofundar conceitos e esclarecer dúvidas diretamente no contexto do erro.</p>
            </div>
            <div className="ap-step-card">
              <div className="ap-step-num">04</div>
              <div className="ap-step-label">Fixe</div>
              <h3 className="ap-step-title">Revise o que realmente importa</h3>
              <p className="ap-step-desc">Flashcards adaptativos e caderno de erros inteligente transformam suas lacunas em revisão focada. Você revisa mais o que esquece e menos o que já domina.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. PRODUCT DEMO / PLATAFORMA INTERATIVA ── */}
      <section id="plataforma" className="ap-sched-sec">
        <div className="ap-container ap-sched-grid">
          
          {/* Left: Interactive mockup */}
          <div>
            <div className="ap-mock-screen">
              {activeAgendaTab === 'cronograma' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="ap-mock-header">
                    <span style={{ fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px' }}>
                      <LayoutDashboard size={16} color="var(--primary)" /> Análise de Desempenho
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 600 }}>↑ Melhorando</span>
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Suas especialidades com mais oportunidade de melhora:</p>
                    
                    {[
                      { label: 'Gastroenterologia', pct: '52%', color: '#EF4444', tag: 'Maior lacuna' },
                      { label: 'Cardiologia', pct: '68%', color: 'var(--amber)', tag: 'Em progresso' },
                      { label: 'Pediatria', pct: '81%', color: 'var(--green)', tag: 'Dominando' },
                    ].map((item, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 10, border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: 6 }}>
                          <span style={{ fontWeight: 600, color: 'white' }}>{item.label}</span>
                          <span style={{ color: item.color, fontWeight: 600, fontSize: '11px' }}>{item.tag}</span>
                        </div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: item.color, width: item.pct, transition: 'width 0.6s' }}></div>
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 4 }}>{item.pct} de acerto</div>
                      </div>
                    ))}

                    <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
                      <Link to="/questoes" className="ap-btn ap-btn-primary" style={{ flex: 1, padding: 12, fontSize: '12px', borderRadius: '8px' }}>
                        Ver minha análise completa
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activeAgendaTab === 'assuntos' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="ap-mock-header">
                    <span style={{ fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px' }}>
                      <BookOpen size={16} color="var(--cyan)" /> Questão + Explicação
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 600 }}>USP-SP 2024</span>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <p style={{ fontSize: '12px', color: 'white', lineHeight: 1.6 }}>Mulher, 34 anos, queixa de palpitações e sudorese. TSH &lt; 0,1. T4 livre aumentado. Qual o tratamento de primeira linha?</p>
                    
                    {[
                      { opt: 'A', text: 'Levotiroxina', wrong: false, selected: false },
                      { opt: 'B', text: 'Metimazol', wrong: false, selected: true, correct: true },
                      { opt: 'C', text: 'Iodo radioativo', wrong: true, selected: false },
                    ].map((item, i) => (
                      <div key={i} style={{ 
                        padding: '8px 12px', borderRadius: 8, fontSize: '12px', display: 'flex', gap: 8, alignItems: 'center',
                        background: item.correct ? 'rgba(16,185,129,0.08)' : item.wrong ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${item.correct ? 'rgba(16,185,129,0.2)' : item.wrong ? 'rgba(239,68,68,0.15)' : 'var(--border)'}`,
                        color: item.correct ? '#6EE7B7' : item.wrong ? '#FCA5A5' : 'var(--text-secondary)'
                      }}>
                        <span style={{ fontWeight: 700 }}>{item.opt})</span> {item.text}
                        {item.correct && <CheckCircle2 size={12} color="#10B981" style={{ marginLeft: 'auto' }} />}
                      </div>
                    ))}

                    <div style={{ padding: 10, background: 'rgba(59, 126, 248, 0.05)', border: '1px solid rgba(59, 126, 248, 0.15)', borderRadius: 8, marginTop: 4 }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--primary)', marginBottom: 4, fontFamily: 'Sora', textTransform: 'uppercase' }}>Comentário da Questão</div>
                      <p style={{ fontSize: '11px', color: '#B2CBE5', lineHeight: 1.5 }}>Na Doença de Graves, o Metimazol é a primeira linha por inibir a síntese hormonal. O iodo é opção mas não primeira linha em adultos jovens.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeAgendaTab === 'caderno' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="ap-mock-header">
                    <span style={{ fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px' }}>
                      <Layers size={16} color="var(--amber)" /> Caderno de Erros
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: 4 }}>12 pendentes</span>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Questões salvas automaticamente para revisão:</p>
                    
                    <div style={{ padding: 12, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: 10 }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'white' }}>Questão #12,894 — Clínica Médica (USP-SP)</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Erro em: Insuficiência Cardíaca</span>
                        <span style={{ fontSize: '11.5px', color: 'var(--amber)', fontWeight: 700 }}>Revisar amanhã</span>
                      </div>
                    </div>

                    <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 10 }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'white' }}>Questão #9,401 — Pediatria (ENARE)</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Erro em: Calendário Vacinal</span>
                        <span style={{ fontSize: '11.5px', color: 'var(--green)', fontWeight: 700 }}>Revisado</span>
                      </div>
                    </div>

                    <Link to="/questoes" className="ap-btn ap-btn-cyan" style={{ width: '100%', padding: 12, fontSize: '12px', borderRadius: '8px', marginTop: 'auto', color: '#030812' }}>
                      Revisar Erros Pendentes
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Interactive trigger buttons */}
          <div>
            <div className="ap-sec-tag">Veja o que acontece depois que você erra</div>
            <h2 className="ap-sec-title" style={{ marginBottom: 12 }}>Do erro ao <span>próximo passo</span></h2>
            <p className="ap-sec-desc" style={{ marginBottom: 32 }}>
              Cada questão respondida gera dados. Esses dados mostram onde você está perdendo pontos e o que revisar a seguir.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <button
                className={`ap-tab-btn ${activeAgendaTab === 'cronograma' ? 'active' : ''}`}
                onClick={() => setActiveAgendaTab('cronograma')}
              >
                <div className="ap-tab-icon">
                  <BarChart2 size={20} />
                </div>
                <div>
                  <h3 className="ap-tab-title">Análise de Desempenho</h3>
                  <p className="ap-tab-desc">Veja exatamente em quais especialidades e temas você perde mais pontos, com dados claros do seu histórico.</p>
                </div>
              </button>

              <button
                className={`ap-tab-btn ${activeAgendaTab === 'assuntos' ? 'active' : ''}`}
                onClick={() => setActiveAgendaTab('assuntos')}
              >
                <div className="ap-tab-icon">
                  <Lightbulb size={20} />
                </div>
                <div>
                  <h3 className="ap-tab-title">Questão + Comentário + IA Tutor</h3>
                  <p className="ap-tab-desc">Entenda o raciocínio por trás de cada alternativa com comentários detalhados e o Dr. André disponível para aprofundar.</p>
                </div>
              </button>

              <button
                className={`ap-tab-btn ${activeAgendaTab === 'caderno' ? 'active' : ''}`}
                onClick={() => setActiveAgendaTab('caderno')}
              >
                <div className="ap-tab-icon">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 className="ap-tab-title">Caderno de Erros + Flashcards</h3>
                  <p className="ap-tab-desc">Seus erros viram revisão automática. Flashcards adaptativos reforçam os conteúdos onde você mais precisa.</p>
                </div>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ── 5. BENEFITS / FEATURES SECTION ── */}
      <section style={{ padding: '100px 0' }}>
        <div className="ap-container">
          <div className="ap-sec-header">
            <div className="ap-sec-tag">O que você acessa</div>
            <h2 className="ap-sec-title">Cada recurso pensado para <span>melhorar seu desempenho</span></h2>
            <p className="ap-sec-desc">Não funcionalidades soltas. Um conjunto integrado focado em identificar lacunas e transformar erros em preparação.</p>
          </div>

          <div className="ap-features-grid">
            <div className="ap-card ap-card-hover">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59, 126, 248, 0.1)', border: '1px solid rgba(59, 126, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <MessageSquare size={20} />
              </div>
              <h3 className="ap-benefit-headline">Errou uma questão? Entenda por que errou.</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Use a IA Tutor para aprofundar explicações, esclarecer dúvidas e compreender melhor os conceitos por trás de cada questão.</p>
            </div>

            <div className="ap-card ap-card-hover">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)' }}>
                <BarChart2 size={20} />
              </div>
              <h3 className="ap-benefit-headline">Veja exatamente onde sua nota está escapando.</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Acompanhe seu desempenho e identifique áreas, especialidades e temas que merecem mais atenção. Dados claros, não suposições.</p>
            </div>

            <div className="ap-card ap-card-hover">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(165, 195, 247, 0.08)', border: '1px solid rgba(165, 195, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)' }}>
                <RefreshCw size={20} />
              </div>
              <h3 className="ap-benefit-headline">Revise mais o que você esquece e menos o que já domina.</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Flashcards adaptativos priorizam os conteúdos com maior dificuldade, tornando sua revisão mais objetiva e eficiente.</p>
            </div>

            <div className="ap-card ap-card-hover">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
                <Target size={20} />
              </div>
              <h3 className="ap-benefit-headline">Teste sua preparação antes da prova real.</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Monte simulados por banca, especialidade, nível e ano. Acompanhe sua evolução em um ambiente focado em desempenho.</p>
            </div>

            <div className="ap-card ap-card-hover">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)' }}>
                <Layers size={20} />
              </div>
              <h3 className="ap-benefit-headline">Seus erros viram revisão automática.</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>O caderno de erros organiza automaticamente suas questões incorretas e programa revisões periódicas para que você não esqueça o que aprendeu.</p>
            </div>

            <div className="ap-card ap-card-hover">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59, 126, 248, 0.1)', border: '1px solid rgba(59, 126, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <BookOpen size={20} />
              </div>
              <h3 className="ap-benefit-headline">Questões comentadas das principais bancas.</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Mais de 15.000 questões reais com comentários detalhados, organizadas por especialidade, banca, tema e nível de dificuldade.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. 15.000 QUESTÕES POSICIONAMENTO ── */}
      <section className="ap-questions-sec" style={{ padding: '100px 0' }}>
        <div className="ap-container">
          <div className="ap-questions-inner">
            <div className="ap-sec-tag">O banco de questões</div>
            <div className="ap-questions-stat">15.000+</div>
            <h2 className="ap-sec-title" style={{ marginBottom: 20 }}>questões comentadas</h2>
            <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32 }}>
              Mais questões não significam necessariamente mais aprovação. O RokoMed reúne mais de 15.000 questões para uma preparação focada em resolução, identificação de erros e revisão.
            </p>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
              A ideia não é criar uma biblioteca infinita que você nunca termina. É ajudar você a descobrir onde está perdendo pontos e transformar cada sessão de estudo em informação útil para sua preparação.
            </p>
            <div style={{ marginTop: 40, padding: '20px 32px', background: 'rgba(59, 126, 248, 0.05)', border: '1px solid rgba(59, 126, 248, 0.12)', borderRadius: 16, display: 'inline-block' }}>
              <p style={{ fontSize: '15px', color: 'var(--cyan)', fontWeight: 600 }}>
                Tudo o que você precisa para treinar. Sem o excesso que só faz você perder tempo.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 40 }}>
              {['ENARE', 'USP-SP', 'UNIFESP', 'UNICAMP', 'SUS-SP', 'Revalida'].map(banca => (
                <span key={banca} style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 9999, fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: 'Sora' }}>
                  {banca}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. COMPARISON ── */}
      <section className="ap-compare-sec" style={{ padding: '100px 0' }}>
        <div className="ap-container">
          <div className="ap-sec-header">
            <div className="ap-sec-tag">Comparativo honesto</div>
            <h2 className="ap-sec-title">Preparação tradicional <span>vs. RokoMed</span></h2>
            <p className="ap-sec-desc">Uma comparação direta e objetiva. Não estamos dizendo que o outro lado é ruim — estamos dizendo que o RokoMed foi feito com um foco diferente.</p>
          </div>

          <div className="ap-compare-grid">
            {/* Coluna Tradicional */}
            <div className="ap-compare-col">
              <div className="ap-compare-head">Preparação Tradicional</div>
              {[
                'Você escolhe manualmente o que revisar, sem dados sobre onde está errando.',
                'Muito conteúdo e pouca clareza sobre suas lacunas reais.',
                'Você estuda e depois tenta lembrar o que errou.',
                'Difícil visualizar sua evolução ao longo do tempo.',
                'Plataformas com preços de R$ 4.000 a R$ 12.000/ano.',
              ].map((text, i) => (
                <div key={i} className="ap-compare-item">
                  <span style={{ color: 'var(--text-muted)', flexShrink: 0, fontSize: '16px' }}>—</span>
                  {text}
                </div>
              ))}
            </div>

            {/* Coluna RokoMed */}
            <div className="ap-compare-col roko">
              <div className="ap-compare-head">RokoMed</div>
              {[
                'Seus erros identificam automaticamente onde você precisa melhorar.',
                'Desempenho organizado por especialidade para facilitar o foco.',
                'Questões, explicações, revisão e flashcards fazem parte do mesmo processo.',
                'Acompanhe seu desempenho com dados claros ao longo do tempo.',
                'R$ 29/mês, com acesso completo e sem fidelidade.',
              ].map((text, i) => (
                <div key={i} className="ap-compare-item">
                  <CheckCircle2 size={16} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. TESTIMONIALS ── */}
      <section id="depoimentos" className="ap-testimonials-sec" style={{ padding: '100px 0' }}>
        <div className="ap-container">
          <div className="ap-sec-header">
            <div className="ap-sec-tag">Depoimentos</div>
            <h2 className="ap-sec-title">Quem colocou o RokoMed <span>na rotina de estudos</span></h2>
            <p className="ap-sec-desc">Relatos de estudantes que usaram a plataforma durante sua preparação para residência médica.</p>
          </div>

          <div className="ap-test-grid">
            <div className="ap-test-card">
              <div className="ap-test-stars">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="var(--amber)" color="var(--amber)" />)}
              </div>
              <p className="ap-test-quote">
                "O Tutor de IA (Dr. André) me tirou dúvidas complexas de fisiologia cardíaca em plena madrugada, logo após eu errar uma questão. O feedback imediato do RokoMed vale ouro."
              </p>
              <div className="ap-test-tag">Aprovado ENARE • Anestesiologia</div>
              <div className="ap-test-user">
                <div className="ap-test-avatar" style={{ background: 'linear-gradient(135deg, #EC4899 0%, var(--primary) 100%)' }}>H</div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>Dr. Henrique Vasconcellos</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Aprovado em 2025</p>
                </div>
              </div>
            </div>

            <div className="ap-test-card">
              <div className="ap-test-stars">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="var(--amber)" color="var(--amber)" />)}
              </div>
              <p className="ap-test-quote">
                "Achei que o banco adaptativo era só marketing, mas o algoritmo do RokoMed começou a me mandar exatamente os pontos fracos de neonatologia que eu errava nas provas antigas. Incrível."
              </p>
              <div className="ap-test-tag">Aprovada USP-SP • Pediatria</div>
              <div className="ap-test-user">
                <div className="ap-test-avatar">L</div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>Dra. Letícia Albuquerque</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Aprovada em 2024</p>
                </div>
              </div>
            </div>

            <div className="ap-test-card">
              <div className="ap-test-stars">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="var(--amber)" color="var(--amber)" />)}
              </div>
              <p className="ap-test-quote">
                "Conciliar o último ano do internato com estudo para residência exige precisão. O RokoMed me deu as questões mais quentes do dia para fazer no hospital."
              </p>
              <div className="ap-test-tag">Aprovado UNICAMP • Ortopedia</div>
              <div className="ap-test-user">
                <div className="ap-test-avatar" style={{ background: 'linear-gradient(135deg, var(--amber) 0%, #EC4899 100%)' }}>R</div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>Dr. Rodrigo Fontes</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Aprovado em 2025</p>
                </div>
              </div>
            </div>

            <div className="ap-test-card">
              <div className="ap-test-stars">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="var(--amber)" color="var(--amber)" />)}
              </div>
              <p className="ap-test-quote">
                "O caderno de erros inteligente do RokoMed limpa as nossas falhas. Em vez de rever o edital inteiro, eu revisava apenas onde havia tropeçado. Foco cirúrgico no que cai."
              </p>
              <div className="ap-test-tag">Aprovada SUS-SP • Ginecologia e Obstetrícia</div>
              <div className="ap-test-user">
                <div className="ap-test-avatar" style={{ background: 'linear-gradient(135deg, var(--green) 0%, var(--cyan) 100%)' }}>B</div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>Dra. Beatriz Nogueira</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Aprovada em 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. PRICING SECTION ── */}
      <section id="planos" className="ap-pricing-sec" style={{ padding: '100px 0' }}>
        <div className="ap-container">
          <div className="ap-sec-header">
            <div className="ap-sec-tag">Planos acessíveis</div>
            <h2 className="ap-sec-title">Sua preparação não deveria <span>custar milhares de reais.</span></h2>
            <p className="ap-sec-desc">Acesso completo à plataforma. Sem fidelidade. Cancel quando quiser.</p>
          </div>

          <div className="ap-pricing-grid">
            {/* Mensal */}
            <div className="ap-price-card">
              <h3 className="ap-price-title">Mensal</h3>
              <p className="ap-price-desc">Flexibilidade máxima para começar.</p>
              
              <div className="ap-price-val">
                <span className="currency">R$</span>
                <span className="amount">{monthlyPrice}</span>
                <span className="period"> / mês</span>
              </div>

              <ul className="ap-features-list">
                <li><CheckCircle2 size={16} color="var(--cyan)" /> 15.000+ questões comentadas</li>
                <li><CheckCircle2 size={16} color="var(--cyan)" /> IA Tutor (Dr. André)</li>
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Flashcards adaptativos</li>
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Análise de desempenho</li>
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Simulados personalizáveis</li>
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Caderno de erros automático</li>
              </ul>

              <Link to="/checkout?plan=monthly" className="ap-btn ap-btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto', borderRadius: '12px' }}>
                Começar agora
              </Link>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
                Acesso imediato • Sem fidelidade • 7 dias de garantia
              </p>
            </div>

            {/* Semestral */}
            <div className="ap-price-card popular">
              <h3 className="ap-price-title">Semestral</h3>
              <p className="ap-price-desc">Ideal para manter consistência na preparação.</p>
              
              <div className="ap-price-val">
                <span className="period">6x de </span>
                <span className="amount">R$ {semiannualInstallment}</span>
                <span className="period"> / mês</span>
                <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 600, marginTop: 4 }}>Total à vista: R$ {semiannualTotal}</div>
              </div>

              <ul className="ap-features-list">
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Tudo do plano Mensal</li>
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Análise estatística aprofundada</li>
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Análise detalhada por banca</li>
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Prioridade no suporte</li>
              </ul>

              <Link to="/checkout?plan=semiannual" className="ap-btn ap-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto', borderRadius: '12px' }}>
                Começar agora
              </Link>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
                Acesso imediato • Sem fidelidade • 7 dias de garantia
              </p>
            </div>

            {/* Anual */}
            <div className="ap-price-card">
              <h3 className="ap-price-title">Anual</h3>
              <p className="ap-price-desc">Para uma preparação consistente a longo prazo.</p>
              
              <div className="ap-price-val">
                <span className="period">12x de </span>
                <span className="amount">R$ {annualInstallment}</span>
                <span className="period"> / mês</span>
                <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 600, marginTop: 4 }}>Total à vista: R$ {annualTotal}</div>
              </div>

              <ul className="ap-features-list">
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Tudo do plano Semestral</li>
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Maior desconto por acesso</li>
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Caderno de erros estendido</li>
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Suporte prioritário via WhatsApp</li>
              </ul>

              <Link to="/checkout?plan=annual" className="ap-btn ap-btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto', borderRadius: '12px' }}>
                Começar agora
              </Link>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
                Acesso imediato • Sem fidelidade • 7 dias de garantia
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. POR QUE CUSTA MENOS ── */}
      <section className="ap-cheaper-sec" style={{ padding: '80px 0' }}>
        <div className="ap-container">
          <div className="ap-cheaper-inner">
            <div className="ap-sec-tag">Por que o RokoMed custa menos?</div>
            <h2 className="ap-sec-title" style={{ marginBottom: 24 }}>Foco em estudo ativo, <span>não em estrutura gigantesca.</span></h2>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20 }}>
              Porque somos uma plataforma focada em estudo ativo por questões, revisão e tecnologia. Em vez de cobrar pelo acesso a uma estrutura gigantesca de conteúdos que talvez você nunca use, concentramos o RokoMed no que ajuda você a praticar, identificar erros e revisar com mais objetividade.
            </p>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Preço baixo não significa baixa qualidade. Significa foco diferente.
            </p>
          </div>
        </div>
      </section>

      {/* ── 11. PARA QUEM É ── */}
      <section className="ap-forwhom-sec" style={{ padding: '100px 0' }}>
        <div className="ap-container">
          <div className="ap-sec-header">
            <div className="ap-sec-tag">Para quem é</div>
            <h2 className="ap-sec-title">O RokoMed é <span>para você que...</span></h2>
          </div>

          <div className="ap-forwhom-grid">
            <div className="ap-forwhom-col yes">
              <div className="ap-forwhom-head">✓ O RokoMed é para você</div>
              {[
                'Está se preparando para residência médica',
                'Aprende principalmente resolvendo questões',
                'Quer identificar seus principais pontos fracos com clareza',
                'Precisa estudar com mais objetividade e foco',
                'Busca uma alternativa acessível com tecnologia',
              ].map((text, i) => (
                <div key={i} className="ap-forwhom-item">
                  <CheckCircle2 size={16} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} />
                  {text}
                </div>
              ))}
            </div>

            <div className="ap-forwhom-col maybe-not">
              <div className="ap-forwhom-head">Talvez o RokoMed não seja para você se</div>
              {[
                'Você procura um curso baseado principalmente em centenas de horas de videoaulas',
                'Não pretende resolver questões com frequência',
                'Espera que uma plataforma substitua completamente sua dedicação pessoal',
              ].map((text, i) => (
                <div key={i} className="ap-forwhom-item">
                  <span style={{ color: 'var(--text-muted)', flexShrink: 0, fontSize: '16px' }}>—</span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 12. FAQ ── */}
      <section id="faq" style={{ padding: '100px 0' }}>
        <div className="ap-container">
          <div className="ap-sec-header">
            <div className="ap-sec-tag">Dúvidas frequentes</div>
            <h2 className="ap-sec-title">Perguntas <span>Frequentes</span></h2>
            <p className="ap-sec-desc">Caso sua pergunta não esteja aqui, entre em contato conosco pelo chat de suporte.</p>
          </div>

          <div className="ap-faq-list">
            {faqItems.map((item, idx) => {
              const isOpen = openFaq === idx
              return (
                <div key={idx} className="ap-faq-item">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="ap-faq-btn"
                  >
                    <span>{item.q}</span>
                    <ChevronDown size={18} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none', color: 'var(--text-secondary)', flexShrink: 0 }} />
                  </button>
                  {isOpen && (
                    <div className="ap-faq-ans">
                      {item.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 13. FINAL CTA ── */}
      <section className="ap-finalcta-sec" style={{ padding: '120px 0' }}>
        <div className="ap-glow" style={{ top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'rgba(59, 126, 248, 0.12)', opacity: 0.6 }}></div>
        <div className="ap-container">
          <div className="ap-finalcta-inner">
            <div className="ap-badge" style={{ justifyContent: 'center' }}>
              <Zap size={12} style={{ display: 'inline', marginRight: 4 }} />
              Acesso imediato após a assinatura
            </div>

            <h2 className="ap-sec-title" style={{ fontSize: 'clamp(32px, 5vw, 52px)', marginBottom: 20 }}>
              Você não precisa estudar<br /><span>mais no escuro.</span>
            </h2>

            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 48, maxWidth: 560, margin: '0 auto 48px' }}>
              Resolva questões, descubra onde está perdendo pontos e transforme seus erros em uma preparação mais inteligente.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <Link
                to="/checkout?plan=monthly"
                className="ap-btn ap-btn-primary ap-btn-lg"
                style={{ fontSize: '16px', padding: '18px 48px' }}
              >
                Começar agora por R$ {monthlyPrice}/mês <ArrowRight size={18} />
              </Link>
              <div className="ap-cta-sub" style={{ justifyContent: 'center', fontSize: '13px' }}>
                <span><Check size={13} color="var(--green)" /> Acesso imediato</span>
                <span><Check size={13} color="var(--green)" /> Sem fidelidade</span>
                <span><ShieldCheck size={13} color="var(--green)" /> 7 dias de garantia</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="ap-footer">
        <div className="ap-container">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <Link to="/blog" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px' }}>Blog</Link>
            <Link to="/glossario" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px' }}>Glossário</Link>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px' }}>Termos de uso</a>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px' }}>Privacidade</a>
          </div>
          <p>© {new Date().getFullYear()} RokoMed. Todos os direitos reservados.</p>
          <p style={{ marginTop: 8, color: 'var(--text-muted)' }}>Plataforma de preparação para residência médica.</p>
        </div>
      </footer>
    </div>
  )
}
