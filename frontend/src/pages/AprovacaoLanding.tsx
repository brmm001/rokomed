import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  MessageSquare,
  Award,
  ArrowRight,
  Star,
  ChevronDown,
  Check,
  Zap,
  Sparkles,
  Play,
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Layers,
  Video,
  Smartphone,
  Target,
  Flame,
  Clock,
  ArrowUpRight,
  ShieldCheck
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
    document.title = 'Bora Passar RokoMed — O Caminho para sua Aprovação na Residência'
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
      q: "O que é o RokoMed?",
      a: "O RokoMed é uma plataforma inteligente e adaptativa de preparação para residência médica. Composta por mais de 15.000 questões comentadas, simulados personalizáveis, análise de prioridades de banca e um tutor inteligente alimentado por Inteligência Artificial (o Dr. André)."
    },
    {
      q: "Como o RokoMed me ajuda a ser aprovado mais rápido?",
      a: "Ao contrário dos métodos tradicionais, focamos no estudo ativo. A plataforma monitora suas taxas de acerto, calcula suas fraquezas e cria um caderno de erros dinâmico automático. O Dr. André analisa seu perfil e tira dúvidas teóricas nos comentários das questões."
    },
    {
      q: "Os planos pagos oferecem acesso ao Dr. André (Tutor IA)?",
      a: "Sim! Todos os planos PRO dão direito a consultas com o Dr. André. O plano gratuito oferece 5 créditos experimentais para testar a inteligência do tutor."
    },
    {
      q: "Existe fidelidade contratual?",
      a: "Não. Você pode cancelar sua assinatura a qualquer momento com apenas um clique na área de perfil, sem qualquer multa contratual. Seu acesso continuará ativo até o fim do ciclo contratado."
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
          margin-bottom: 32px;
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

        /* Methodology Step Cards */
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
          background: #050E1A;
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

        /* Features */
        .ap-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 28px;
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

        .ap-test-quote {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-primary);
          font-style: italic;
          margin-bottom: 20px;
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
          margin-bottom: auto;
        }

        .ap-test-user {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 24px;
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
        }

        /* Steps & Video */
        .ap-journey-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }

        .ap-j-step {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
        }

        .ap-j-num {
          font-family: 'Outfit', sans-serif;
          font-size: 28px;
          font-weight: 800;
          background: linear-gradient(135deg, var(--cyan) 0%, var(--primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1;
        }

        .ap-video-mock {
          aspect-ratio: 16/9;
          background: radial-gradient(circle at center, rgba(12, 26, 48, 0.8) 0%, rgba(5, 13, 26, 0.95) 100%);
          border: 1px solid rgba(100, 160, 255, 0.15);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ap-play-btn {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--cyan) 0%, var(--primary) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #030812;
          box-shadow: 0 8px 24px rgba(165, 195, 247, 0.2);
          cursor: pointer;
          border: none;
          transition: transform 0.2s;
        }

        .ap-play-btn:hover {
          transform: scale(1.1);
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
        }

        .ap-faq-ans {
          padding: 0 24px 20px;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
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
          .ap-hero-grid, .ap-sched-grid, .ap-journey-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .ap-hero-sec {
            padding-top: 100px;
          }
          .ap-dashboard-teaser {
            margin: 0 auto;
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
          .ap-journey-grid {
            grid-template-columns: 1fr;
            gap: 40px;
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

          /* Table comparison */
          .ap-compare-wrap {
            overflow-x: auto;
          }
          .ap-compare-table {
            min-width: 560px;
          }

          /* Journey video */
          .ap-video-mock {
            min-height: 200px;
          }

          /* Price card popular badge */
          .ap-price-card.popular {
            margin-top: 12px;
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
            <a href="#metodologia" className="ap-nav-link">Metodologia</a>
            <a href="#agenda" className="ap-nav-link">Agenda</a>
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
            <a href="#metodologia" onClick={() => setMobileMenuOpen(false)}>Metodologia</a>
            <a href="#agenda" onClick={() => setMobileMenuOpen(false)}>Agenda</a>
            <a href="#depoimentos" onClick={() => setMobileMenuOpen(false)}>Depoimentos</a>
            <a href="#planos" onClick={() => setMobileMenuOpen(false)}>Planos</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>Dúvidas</a>
            <a href="#planos" className="ap-mobile-cta" onClick={() => setMobileMenuOpen(false)}>Começar Agora →</a>
          </div>
        )}
      </header>

      {/* ── Hero Section ── */}
      <section className="ap-hero-sec">
        <div className="ap-container ap-hero-grid">
          
          <div>
            <div className="ap-badge">
              <Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} />
              RokoMed Inteligência Ativa • Preparação Focada
            </div>
            
            <h1 className="ap-title">
              Domine as bancas com<br />
              <span>estudo ativo guiado por IA</span>
            </h1>
            
            <p className="ap-subtitle">
              Chega de videoaulas intermináveis e resumos estáticos. O RokoMed analisa seu edital, cria uma trilha de estudo adaptativa e resolve suas dúvidas instantaneamente com o Dr. André, nosso tutor inteligente de IA.
            </p>

            {/* Email Lead Capture */}
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

            {/* Trust symbols */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: 'var(--text-secondary)', marginTop: -12 }}>
              <div style={{ display: 'flex', color: 'var(--amber)' }}>
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
              </div>
              <span>Avaliado em <strong>4.9/5</strong> por mais de 2.000 médicos.</span>
            </div>
          </div>

          {/* Hero Right: Teaser Card and Rotator */}
          <div className="ap-hero-visual">
            {/* Rotating stamp animation */}
            <div style={{ position: 'absolute', top: -36, left: -36, zIndex: 10, width: 120, height: 120 }}>
              <svg viewBox="0 0 120 120" className="animate-rot" style={{ width: '100%', height: '100%', color: 'var(--text-primary)' }}>
                <defs>
                  <path id="badge-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
                </defs>
                <text fontSize="8.2" fontWeight="700" letterSpacing="2.5" fill="currentColor">
                  <textPath href="#badge-circle">✦ ROKOMED ✦ MÁXIMO RENDIMENTO ✦ INTELIGÊNCIA ATIVA </textPath>
                </text>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan) 0%, var(--primary) 100%)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: '#030812', fontWeight: 800, fontSize: 10, textAlign: 'center', lineHeight: 1.1, boxShadow: '0 4px 12px var(--cyan-glow)' }}>
                  Roko<br />Med
                </div>
              </div>
            </div>

            {/* Interactive Dashboard teaser */}
            <div className="ap-dashboard-teaser">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', fontFamily: 'Sora' }}>Painel RokoMed PRO</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '11px', color: 'var(--green)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                  <TrendingUp size={10} /> +18.4% esta semana
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div style={{ flex: 1, padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 12 }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Taxa de Acerto</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginTop: 4, fontFamily: 'Outfit' }}>78.4%</div>
                </div>
                <div style={{ flex: 1, padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 12 }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Sequência</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#F97316', marginTop: 4, fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Flame size={18} fill="#F97316" /> 14 dias
                  </div>
                </div>
              </div>

              <div style={{ padding: 16, background: 'rgba(59, 126, 248, 0.05)', border: '1px solid rgba(59, 126, 248, 0.15)', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', fontWeight: 700, color: 'var(--primary)', marginBottom: 6, fontFamily: 'Sora' }}>
                  <MessageSquare size={13} /> COMENTÁRIO DO DR. ANDRÉ (Tutor IA)
                </div>
                <p style={{ fontSize: '11.5px', color: '#B2CBE5', lineHeight: 1.4 }}>
                  "Você melhorou em Pediatria, mas Gastro ainda responde por 35% das suas dúvidas. Criei um caderno de erros focado nas questões da USP dos últimos 3 anos para revisar amanhã."
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
            </div>
          ))}
        </div>
      </div>

      {/* ── Metodologia Section ── */}
      <section id="metodologia" style={{ padding: '100px 0' }}>
        <div className="ap-container">
          <div className="ap-sec-header">
            <div className="ap-sec-tag">Metodologia RokoMed</div>
            <h2 className="ap-sec-title">Se é para passar, que seja <span>do jeito certo</span></h2>
            <p className="ap-sec-desc">
              Não adianta maratonar videoaulas passivas. O RokoMed acelera sua retenção de conteúdo com um ciclo prático focado em questões, análise estatística e revisão no tempo certo.
            </p>
          </div>

          <div className="ap-step-grid">
            <div className="ap-step-card">
              <div className="ap-step-num">01</div>
              <h3 className="ap-step-title">Aprendizado</h3>
              <p className="ap-step-desc">Resumos estratégicos e cartões teóricos que dão o embasamento direto para o assunto do dia.</p>
            </div>
            <div className="ap-step-card">
              <div className="ap-step-num">02</div>
              <h3 className="ap-step-title">Fixação</h3>
              <p className="ap-step-desc">Exercícios focados e mapeados pela relevância histórica de incidência no seu exame de residência.</p>
            </div>
            <div className="ap-step-card">
              <div className="ap-step-num">03</div>
              <h3 className="ap-step-title">Foco IA</h3>
              <p className="ap-step-desc">O Dr. André identifica suas lacunas conceituais e ajusta o nível de explicação automaticamente.</p>
            </div>
            <div className="ap-step-card">
              <div className="ap-step-num">04</div>
              <h3 className="ap-step-title">Revisão</h3>
              <p className="ap-step-desc">Agenda adaptativa inteligente que traz os assuntos de volta antes de entrarem na curva de esquecimento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Agenda Section ── */}
      <section id="agenda" className="ap-sched-sec">
        <div className="ap-container ap-sched-grid">
          
          {/* Left: Interactive mockup */}
          <div>
            <div className="ap-mock-screen">
              {activeAgendaTab === 'cronograma' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="ap-mock-header">
                    <span style={{ fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px' }}>
                      <LayoutDashboard size={16} color="var(--primary)" /> Cronograma Adaptativo
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: 4 }}>Meta diária: 2h</span>
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Esta semana seu foco é cobrir o edital prioritário da <strong>USP</strong>:</p>
                    
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 10, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, color: 'white' }}>Pediatria - Aleitamento</span>
                        <span style={{ color: 'var(--green)', fontWeight: 600 }}>Meta batida!</span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'var(--green)', width: '100%' }}></div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 10, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, color: 'white' }}>Cardiologia - Hipertensão</span>
                        <span style={{ color: 'var(--primary)' }}>A fazer hoje</span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'var(--primary)', width: '40%' }}></div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
                      <Link to="/questoes" className="ap-btn ap-btn-primary" style={{ flex: 1, padding: 12, fontSize: '12px', borderRadius: '8px' }}>
                        Estudar Assunto do Dia
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activeAgendaTab === 'assuntos' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="ap-mock-header">
                    <span style={{ fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px' }}>
                      <BookOpen size={16} color="var(--cyan)" /> Painel de Assuntos
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 600 }}>Incidência USP</span>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
                    {[
                      { label: 'Síndrome Coronariana Aguda', area: 'Clínica', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', tag: 'Altíssima relevância' },
                      { label: 'Sepse e Choque Séptico', area: 'Clínica / Infectologia', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', tag: 'Altíssima relevância' },
                      { label: 'Pré-eclâmpsia e Eclâmpsia', area: 'GO', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', tag: 'Alta relevância' },
                      { label: 'Abdome Agudo / Apendicite', area: 'Cirurgia', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', tag: 'Média relevância' },
                      { label: 'Reanimação Neonatal', area: 'Pediatria', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', tag: 'Média relevância' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 8 }}>
                        <div>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'white', display: 'block' }}>{item.label}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.area}</span>
                        </div>
                        <span style={{ fontSize: '10px', color: item.color, background: item.bg, padding: '2px 7px', borderRadius: 4, fontWeight: 700, whiteSpace: 'nowrap', marginLeft: 8 }}>{item.tag}</span>
                      </div>
                    ))}

                    <div style={{ marginTop: 'auto', padding: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 8, fontSize: '11px', color: 'var(--text-secondary)' }}>
                      💡 Filtrado para priorizar temas com peso {`>=`} 3 no último edital.
                    </div>
                  </div>
                </div>
              )}

              {activeAgendaTab === 'caderno' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="ap-mock-header">
                    <span style={{ fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px' }}>
                      <Layers size={16} color="var(--amber)" /> Caderno de Erros Inteligente
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: 4 }}>12 pendentes</span>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Questões salvas automaticamente para revisão ativa:</p>
                    
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
            <div className="ap-sec-tag">Recurso Principal</div>
            <h2 className="ap-sec-title">Uma agenda que <span>estuda com você</span></h2>
            <p className="ap-sec-desc" style={{ marginBottom: 32 }}>
              A rotina médica é caótica. Por isso, abandonamos as planilhas fixas e criamos uma agenda dinâmica e adaptativa de verdade.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <button
                className={`ap-tab-btn ${activeAgendaTab === 'cronograma' ? 'active' : ''}`}
                onClick={() => setActiveAgendaTab('cronograma')}
              >
                <div className="ap-tab-icon">
                  <LayoutDashboard size={20} />
                </div>
                <div>
                  <h3 className="ap-tab-title">Cronograma até a prova</h3>
                  <p className="ap-tab-desc">Distribuição semanal inteligente de acordo com sua disponibilidade e tempo até o exame.</p>
                </div>
              </button>

              <button
                className={`ap-tab-btn ${activeAgendaTab === 'assuntos' ? 'active' : ''}`}
                onClick={() => setActiveAgendaTab('assuntos')}
              >
                <div className="ap-tab-icon">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="ap-tab-title">Painel de Assuntos Prioritários</h3>
                  <p className="ap-tab-desc">Acesso rápido aos temas de altíssima incidência nas bancas desejadas.</p>
                </div>
              </button>

              <button
                className={`ap-tab-btn ${activeAgendaTab === 'caderno' ? 'active' : ''}`}
                onClick={() => setActiveAgendaTab('caderno')}
              >
                <div className="ap-tab-icon">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="ap-tab-title">Caderno de Erros Automático</h3>
                  <p className="ap-tab-desc">Organiza suas questões incorretas e força revisões periódicas programadas por IA.</p>
                </div>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ── All Features Section ── */}
      <section style={{ padding: '100px 0' }}>
        <div className="ap-container">
          <div className="ap-sec-header">
            <div className="ap-sec-tag">+ Tudo que você precisa</div>
            <h2 className="ap-sec-title">Uma plataforma, <span>mil ferramentas</span></h2>
            <p className="ap-sec-desc">Tudo integrado em um único ecossistema focado no seu aprendizado e retenção de longo prazo.</p>
          </div>

          <div className="ap-features-grid">
            <div className="ap-card ap-card-hover">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59, 126, 248, 0.1)', border: '1px solid rgba(59, 126, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <BookOpen size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginTop: 20, marginBottom: 8, fontFamily: 'Outfit' }}>Questões Comentadas</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>+15 mil questões reais mapeadas, com comentários detalhados e apoio de teoria.</p>
            </div>

            <div className="ap-card ap-card-hover">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(165, 195, 247, 0.08)', border: '1px solid rgba(165, 195, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)' }}>
                <Target size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginTop: 20, marginBottom: 8, fontFamily: 'Outfit' }}>Análise Estatística de Prova</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Conheça de antemão as predileções e pesos de cada banca examinadora (USP, ENARE, UNICAMP).</p>
            </div>

            <div className="ap-card ap-card-hover">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)' }}>
                <TrendingUp size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginTop: 20, marginBottom: 8, fontFamily: 'Outfit' }}>Painel de Métricas Real-time</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Gráficos precisos de evolução de acertos e controle de metas semanais de estudos.</p>
            </div>

            <div className="ap-card ap-card-hover">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
                <Layers size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginTop: 20, marginBottom: 8, fontFamily: 'Outfit' }}>Simulados Customizáveis</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Monte provas sob medida escolhendo temas, bancas, nível de dificuldade e ano de aplicação.</p>
            </div>

            <div className="ap-card ap-card-hover">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)' }}>
                <Video size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginTop: 20, marginBottom: 8, fontFamily: 'Outfit' }}>Aulas de Técnicas</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Aperfeiçoe sua rotina de estudos com técnicas de memorização e resolução de exames práticos.</p>
            </div>

            <div className="ap-card ap-card-hover">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EC4899' }}>
                <Smartphone size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginTop: 20, marginBottom: 8, fontFamily: 'Outfit' }}>Onboarding Gamificado</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Aprenda a navegar nas rotinas e ferramentas da plataforma com missões guiadas recompensadoras.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials Section ── */}
      <section id="depoimentos" className="ap-testimonials-sec" style={{ padding: '100px 0' }}>
        <div className="ap-container">
          <div className="ap-sec-header">
            <div className="ap-sec-tag">Depoimentos reais</div>
            <h2 className="ap-sec-title">Eles colocaram o RokoMed na rotina. <span>E passaram.</span></h2>
            <p className="ap-sec-desc">Mapeamos as histórias de sucesso de quem otimizou os estudos e alcançou a aprovação.</p>
          </div>

          <div className="ap-test-grid">
            <div className="ap-test-card">
              <p className="ap-test-quote">
                "O Tutor de IA (Dr. André) me tirou dúvidas complexas de fisiologia cardíaca em plena madrugada, logo após eu errar uma questão. O feedback imediato do RokoMed vale ouro."
              </p>
              <div className="ap-test-tag">✓ Aprovado ENARE • Anestesiologia</div>
              <div className="ap-test-user">
                <div className="ap-test-avatar" style={{ background: 'linear-gradient(135deg, #EC4899 0%, var(--primary) 100%)' }}>H</div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>Dr. Henrique Vasconcellos</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Aprovado em 2025</p>
                </div>
              </div>
            </div>

            <div className="ap-test-card">
              <p className="ap-test-quote">
                "Achei que o banco adaptativo era só marketing, mas o algoritmo do RokoMed começou a me mandar exatamente os pontos fracos de neonatologia que eu errava nas provas antigas. Incrível."
              </p>
              <div className="ap-test-tag">✓ Aprovada USP-SP • Pediatria</div>
              <div className="ap-test-user">
                <div className="ap-test-avatar">L</div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>Dra. Letícia Albuquerque</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Aprovada em 2024</p>
                </div>
              </div>
            </div>

            <div className="ap-test-card">
              <p className="ap-test-quote">
                "Conciliar o último ano do internato com estudo para residência exige precisão. O RokoMed me deu as 20 questões mais quentes do dia para fazer no hospital."
              </p>
              <div className="ap-test-tag">✓ Aprovado UNICAMP • Ortopedia</div>
              <div className="ap-test-user">
                <div className="ap-test-avatar" style={{ background: 'linear-gradient(135deg, var(--amber) 0%, #EC4899 100%)' }}>R</div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>Dr. Rodrigo Fontes</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Aprovado em 2025</p>
                </div>
              </div>
            </div>

            <div className="ap-test-card">
              <p className="ap-test-quote">
                "O caderno de erros inteligente do RokoMed limpa as nossas falhas. Em vez de rever o edital inteiro, eu revisava apenas onde havia tropeçado. Foco cirúrgico no que cai."
              </p>
              <div className="ap-test-tag">✓ Aprovada SUS-SP • Ginecologia e Obstetrícia</div>
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

      {/* ── Jornada em 4 Passos e Video Player ── */}
      <section style={{ padding: '100px 0' }}>
        <div className="ap-container ap-journey-grid">
          <div>
            <div className="ap-sec-tag">Como funciona</div>
            <h2 className="ap-sec-title" style={{ marginBottom: 36 }}>Na rota da aprovação <span>em 4 passos</span></h2>
            
            <div className="ap-j-step">
              <div className="ap-j-num">01</div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>Faça o seu cadastro</h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: 4 }}>Preencha seus dados para receber o link com acesso imediato e experimentar a plataforma.</p>
              </div>
            </div>

            <div className="ap-j-step">
              <div className="ap-j-num">02</div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>Selecione seus objetivos</h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: 4 }}>Indique qual residência médica pretende concorrer e defina suas principais prioridades.</p>
              </div>
            </div>

            <div className="ap-j-step">
              <div className="ap-j-num">03</div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>Estude no piloto automático</h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: 4 }}>Siga as tarefas geradas pela agenda inteligente com base em desempenho e probabilidade.</p>
              </div>
            </div>

            <div className="ap-j-step">
              <div className="ap-j-num">04</div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>Monitore a evolução</h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: 4 }}>Confira no painel central a evolução da sua nota estatística e alcance a meta de acertos.</p>
              </div>
            </div>
          </div>

          <div>
            <div className="ap-video-mock">
              <button className="ap-play-btn" aria-label="Reproduzir vídeo demonstrativo do RokoMed">
                <Play size={24} style={{ fill: '#030812' }} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', marginTop: 14 }}>
              Demonstração rápida da plataforma (2 minutos de tour).
            </p>
          </div>
        </div>
      </section>


      {/* ── Table Comparison ── */}
      <section style={{ padding: '100px 0' }}>
        <div className="ap-container">
          <div className="ap-sec-header">
            <div className="ap-sec-tag">Comparativo Honesto</div>
            <h2 className="ap-sec-title">RokoMed vs. <span>Mecanismos Tradicionais</span></h2>
            <p className="ap-sec-desc">Mapeamos as diferenças fundamentais entre o nosso método e o modelo passivo de cursinhos tradicionais.</p>
          </div>

          <div className="ap-compare-wrap" style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '16px', background: 'rgba(255,255,255,0.01)' }}>
            <table className="ap-compare-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '18px 24px', fontWeight: 700, color: 'white' }}>Recurso</th>
                  <th style={{ padding: '18px 24px', fontWeight: 700, color: 'var(--cyan)' }}>Método RokoMed</th>
                  <th style={{ padding: '18px 24px', fontWeight: 500, color: 'var(--text-secondary)' }}>Apostilas Tradicionais</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { r: 'Metodologia ativa', rk: 'Estudo guiado centrado em questões comentadas', tr: 'Leitura linear cansativa e videoaulas de 3h' },
                  { r: 'Organização da agenda', rk: 'Algoritmo que recalibra metas diariamente com 1 clique', tr: 'Cronograma estático e volumoso impossível de seguir' },
                  { r: 'Suporte a dúvidas', rk: 'Dr. André (IA) responde no comentário da questão em segundos', tr: 'Envio de fórum lento que demora dias para retorno' },
                  { r: 'Caderno de erros', rk: 'Filtro e agendamento automático de erros do aluno', tr: 'Seleção e organização manual de folhas incorretas' },
                  { r: 'Mensalidade média', rk: 'R$ 29,00/mês (sem taxas escondidas)', tr: 'Preços abusivos variando de R$ 4.000 a R$ 12.000' }
                ].map((row, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.02)' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: 'white' }}>{row.r}</td>
                    <td style={{ padding: '16px 24px', color: 'white' }}>
                      <Check size={14} color="var(--green)" style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} /> {row.rk}
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{row.tr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section id="planos" className="ap-pricing-sec" style={{ padding: '100px 0' }}>
        <div className="ap-container">
          <div className="ap-sec-header">
            <div className="ap-sec-tag">Planos acessíveis</div>
            <h2 className="ap-sec-title">Escolha o seu plano de estudos</h2>
            <p className="ap-sec-desc">Acesso completo sem taxas de cancelamento. Comece a acelerar seu rendimento hoje mesmo.</p>
          </div>

          <div className="ap-pricing-grid">
            {/* Mensal */}
            <div className="ap-price-card">
              <h3 className="ap-price-title">Plano Mensal</h3>
              <p className="ap-price-desc">Flexibilidade máxima para sua jornada de estudos.</p>
              
              <div className="ap-price-val">
                <span className="currency">R$</span>
                <span className="amount">{monthlyPrice}</span>
                <span className="period"> / mês</span>
              </div>

              <ul className="ap-features-list">
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Acesso completo ao banco de questões</li>
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Simulados adaptativos personalizados</li>
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Resumos teóricos e flashcards</li>
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Suporte do Dr. André (Tutor IA)</li>
              </ul>

              <Link to="/checkout?plan=monthly" className="ap-btn ap-btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto', borderRadius: '12px' }}>
                Assinar Plano Mensal
              </Link>
            </div>

            {/* Semestral */}
            <div className="ap-price-card popular">
              <h3 className="ap-price-title">Plano Semestral</h3>
              <p className="ap-price-desc">Ideal para manter a regularidade no ciclo de revisões.</p>
              
              <div className="ap-price-val">
                <span className="period">6x de </span>
                <span className="amount">R$ {semiannualInstallment}</span>
                <span className="period"> / mês</span>
                <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 600, marginTop: 4 }}>Total à vista: R$ {semiannualTotal}</div>
              </div>

              <ul className="ap-features-list">
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Tudo do plano Mensal</li>
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Rastreamento estatístico aprofundado</li>
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Prioridade de respostas do Dr. André</li>
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Análise detalhada por banca</li>
              </ul>

              <Link to="/checkout?plan=semiannual" className="ap-btn ap-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto', borderRadius: '12px' }}>
                Assinar Plano Semestral
              </Link>
            </div>

            {/* Anual */}
            <div className="ap-price-card">
              <h3 className="ap-price-title">Plano Anual</h3>
              <p className="ap-price-desc">A melhor taxa de desconto para preparação a longo prazo.</p>
              
              <div className="ap-price-val">
                <span className="period">12x de </span>
                <span className="amount">R$ {annualInstallment}</span>
                <span className="period"> / mês</span>
                <div style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 600, marginTop: 4 }}>Total à vista: R$ {annualTotal}</div>
              </div>

              <ul className="ap-features-list">
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Tudo do plano Semestral</li>
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Maior desconto por tempo de acesso</li>
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Caderno de erros adaptável estendido</li>
                <li><CheckCircle2 size={16} color="var(--cyan)" /> Suporte prioritário via WhatsApp</li>
              </ul>

              <Link to="/checkout?plan=annual" className="ap-btn ap-btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto', borderRadius: '12px' }}>
                Assinar Plano Anual
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" style={{ padding: '100px 0' }}>
        <div className="ap-container">
          <div className="ap-sec-header">
            <div className="ap-sec-tag">Ficou com alguma dúvida?</div>
            <h2 className="ap-sec-title">Dúvidas <span>Frequentes</span></h2>
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
                    <ChevronDown size={18} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none', color: 'var(--text-secondary)' }} />
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
          <p style={{ marginTop: 8, color: 'var(--text-muted)' }}>Plataforma adaptativa feita por médicos, para médicos.</p>
        </div>
      </footer>
    </div>
  )
}
