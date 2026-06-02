import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, MessageCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { subscriptionApi } from '../lib/api'
import { trackClick } from '../lib/tracker'

export default function LandingPage() {
  const [showExitPopup, setShowExitPopup] = useState(false)
  const [hasTriggeredPopup, setHasTriggeredPopup] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  
  const [leadEmail, setLeadEmail] = useState('')
  const [loadingLead, setLoadingLead] = useState(false)

  const { data: plansData } = useQuery({
    queryKey: ['plans'],
    queryFn: subscriptionApi.plans,
  })

  const monthlyPrice = plansData?.monthly?.amount || 29
  const semiannualTotal = plansData?.semiannual?.amount || 97
  const annualTotal = plansData?.annual?.amount || 147

  const semiannualInstallment = Math.round(semiannualTotal / 6)
  const annualInstallment = Math.round(annualTotal / 12)

  const handleLeadCapture = async () => {
    if (!leadEmail.includes('@')) {
      alert('Por favor, insira um e-mail válido.')
      return
    }
    setLoadingLead(true)
    try {
      trackClick('LEAD_CAPTURE', leadEmail)
      const api = (await import('../lib/api')).default
      await api.post('/auth/lead', { email: leadEmail })
      localStorage.setItem('rokomed_lead_email', leadEmail)
      window.location.href = '/simulado-gratis'
    } catch (e) {
      console.error(e)
      localStorage.setItem('rokomed_lead_email', leadEmail)
      window.location.href = '/simulado-gratis'
    }
  }

  useEffect(() => {
    document.title = 'RokoMed — Banco de Questões para Residência Médica'
    
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasTriggeredPopup) {
        setShowExitPopup(true)
        setHasTriggeredPopup(true)
      }
    }
    document.addEventListener('mouseleave', handleMouseLeave)

    // Scroll depth tracking
    let scrolled25 = false
    let scrolled50 = false
    let scrolled75 = false
    let scrolled100 = false

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      if (scrollHeight <= 0) return
      
      const scrollPercent = (scrollTop / scrollHeight) * 100

      if (scrollPercent >= 25 && !scrolled25) {
        scrolled25 = true
        trackClick('SCROLL_DEPTH_25')
      }
      if (scrollPercent >= 50 && !scrolled50) {
        scrolled50 = true
        trackClick('SCROLL_DEPTH_50')
      }
      if (scrollPercent >= 75 && !scrolled75) {
        scrolled75 = true
        trackClick('SCROLL_DEPTH_75')
      }
      if (scrollPercent >= 95 && !scrolled100) {
        scrolled100 = true
        trackClick('SCROLL_DEPTH_100')
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [hasTriggeredPopup])

  const faqItems = [
    {
      q: "Quantas questões existem na plataforma?",
      a: "O banco conta com mais de 15.000 questões comentadas das principais provas de residência médica do Brasil, incluindo USP (FMUSP), UNIFESP, ENARE, UERJ, UNICAMP, UFRJ, UFMG, UFPR, UFRGS, AMRIGS, SES-SP, Santa Casa de SP, HC-FMUSP, IAMSPE, AMP, FHEMIG, FEPECS, HFB, UFC e outras. O acervo é atualizado com novas provas regularmente."
    },
    {
      q: "Como funciona o plano gratuito?",
      a: "O plano gratuito dá acesso a 100 questões comentadas, com filtros por especialidade. Não é necessário cartão de crédito para criar a conta. Para acesso completo às 15.000+ questões, simulados personalizados, IA integrada e relatórios, basta escolher um plano pago."
    },
    {
      q: "Posso cancelar quando quiser?",
      a: "Sim. Não há fidelidade obrigatória. Você pode cancelar sua assinatura a qualquer momento diretamente pelo painel da sua conta. Seu acesso permanece ativo até o fim do período já pago."
    },
    {
      q: "A plataforma funciona no celular?",
      a: "Sim. O RokoMed é uma plataforma web totalmente responsiva — funciona bem em celular, tablet e computador, sem necessidade de instalar nenhum aplicativo."
    },
    {
      q: "A IA está disponível em todos os planos pagos?",
      a: "Sim. A IA integrada — para explicação de questões, raciocínio clínico e dúvidas — está disponível em todos os planos pagos: mensal, semestral e anual."
    }
  ]

  return (
    <>
      <style>{`
        /* Scoped Landing Page Styles */
        .landing-page-root *, .landing-page-root *::before, .landing-page-root *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        .landing-page-root {
          font-family: 'Inter', system-ui, sans-serif;
          background: #050D1A;
          color: #C8DCF5;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          
          --bg:        #050D1A;
          --bg2:       #08111F;
          --surface:   #0C1A2E;
          --card:      #0F2040;
          --border:    rgba(100, 160, 255, 0.10);
          --border-h:  rgba(100, 160, 255, 0.25);
          --blue:      #3B7EF8;
          --blue-h:    #5B94FF;
          --green:     #22C55E;
          --amber:     #F59E0B;
          --text:      #EBF4FF;
          --muted:     #7B9DBF;
          --faint:     #3A5470;
          --radius:    12px;
          --radius-lg: 20px;
        }

        .landing-page-root a {
          color: inherit;
          text-decoration: none;
        }

        .landing-page-root img {
          max-width: 100%;
          display: block;
        }

        /* Scoped layout & tags */
        .landing-page-root .container {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .landing-page-root .tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: var(--blue);
          background: rgba(59,126,248,.10);
          border: 1px solid rgba(59,126,248,.20);
          border-radius: 100px;
          padding: 4px 12px;
        }

        .landing-page-root .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          border-radius: var(--radius);
          padding: 12px 24px;
          cursor: pointer;
          border: none;
          transition: all .18s ease;
          text-decoration: none;
          white-space: nowrap;
        }

        .landing-page-root .btn-primary {
          background: var(--blue);
          color: #fff;
          box-shadow: 0 0 0 1px rgba(59,126,248,.4), 0 4px 20px rgba(59,126,248,.25);
        }

        .landing-page-root .btn-primary:hover {
          background: var(--blue-h);
          box-shadow: 0 0 0 1px rgba(91,148,255,.5), 0 6px 28px rgba(59,126,248,.4);
          transform: translateY(-1px);
        }

        .landing-page-root .btn-ghost {
          background: transparent;
          color: var(--muted);
          border: 1px solid var(--border);
        }

        .landing-page-root .btn-ghost:hover {
          border-color: var(--border-h);
          color: var(--text);
          background: rgba(255,255,255,.03);
        }

        .landing-page-root .btn-lg {
          padding: 15px 32px;
          font-size: 15px;
          border-radius: 14px;
        }

        .landing-page-root .section {
          padding: 96px 0;
        }

        .landing-page-root .section-sm {
          padding: 64px 0;
        }

        .landing-page-root .section-title {
          font-size: clamp(26px, 4vw, 36px);
          font-weight: 700;
          color: var(--text);
          letter-spacing: -.02em;
          line-height: 1.2;
        }

        .landing-page-root .section-sub {
          font-size: 16px;
          color: var(--muted);
          margin-top: 12px;
          max-width: 540px;
        }

        /* Noise overlay */
        .landing-page-root::before {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: .025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        /* NAV */
        .landing-page-root nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(5,13,26,.80);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border);
        }

        .landing-page-root .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
        }

        .landing-page-root .nav-logo {
          font-size: 18px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -.03em;
        }

        .landing-page-root .nav-logo span {
          color: var(--blue);
        }

        .landing-page-root .nav-links {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .landing-page-root .nav-link {
          font-size: 13px;
          font-weight: 500;
          color: var(--muted);
          padding: 6px 12px;
          border-radius: 8px;
          transition: color .15s, background .15s;
        }

        .landing-page-root .nav-link:hover {
          color: var(--text);
          background: rgba(255,255,255,.04);
        }

        .landing-page-root .nav-cta {
          margin-left: 8px;
        }

        /* HERO */
        .landing-page-root .hero {
          padding: 140px 0 80px;
          position: relative;
          overflow: hidden;
        }

        .landing-page-root .hero-glow {
          position: absolute;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 600px;
          pointer-events: none;
          background: radial-gradient(ellipse at 50% 0%, rgba(59,126,248,.18) 0%, transparent 65%);
        }

        .landing-page-root .hero-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: start;
          position: relative;
          z-index: 1;
        }

        .landing-page-root .hero-eyebrow {
          margin-bottom: 20px;
        }

        .landing-page-root .hero-title {
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 800;
          color: var(--text);
          letter-spacing: -.03em;
          line-height: 1.1;
        }

        .landing-page-root .hero-title em {
          font-style: normal;
          color: var(--blue);
        }

        .landing-page-root .hero-sub {
          font-size: 17px;
          color: var(--muted);
          margin-top: 16px;
          line-height: 1.65;
        }

        .landing-page-root .hero-checks {
          list-style: none;
          margin: 28px 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .landing-page-root .hero-checks li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #A8C8E8;
        }

        .landing-page-root .hero-checks li::before {
          content: '✓';
          width: 20px;
          height: 20px;
          background: rgba(34,197,94,.12);
          border: 1px solid rgba(34,197,94,.25);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: var(--green);
          flex-shrink: 0;
        }

        .landing-page-root .hero-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .landing-page-root .hero-note {
          font-size: 12px;
          color: var(--faint);
          margin-top: 14px;
        }

        /* Product screenshot mockup */
        .landing-page-root .hero-visual {
          position: relative;
        }

        .landing-page-root .screen-wrap {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 0 0 1px rgba(255,255,255,.04), 0 40px 80px rgba(0,0,0,.6);
        }

        .landing-page-root .screen-bar {
          background: #081525;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid var(--border);
        }

        .landing-page-root .screen-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .landing-page-root .screen-bar-url {
          flex: 1;
          background: rgba(255,255,255,.04);
          border-radius: 6px;
          height: 24px;
          margin: 0 8px;
          display: flex;
          align-items: center;
          padding: 0 10px;
          font-size: 11px;
          color: var(--faint);
        }

        .landing-page-root .screen-content {
          padding: 0;
        }

        /* Fake question UI */
        .landing-page-root .q-ui {
          padding: 20px;
        }

        .landing-page-root .q-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .landing-page-root .q-badge {
          font-size: 11px;
          font-weight: 600;
          color: var(--blue);
          background: rgba(59,126,248,.12);
          border: 1px solid rgba(59,126,248,.2);
          border-radius: 6px;
          padding: 3px 9px;
        }

        .landing-page-root .q-progress {
          display: flex;
          gap: 4px;
        }

        .landing-page-root .q-prog-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--border);
        }

        .landing-page-root .q-prog-dot.done {
          background: var(--green);
        }

        .landing-page-root .q-prog-dot.active {
          background: var(--blue);
        }

        .landing-page-root .q-text {
          font-size: 13px;
          line-height: 1.6;
          color: #C0D8F0;
          margin-bottom: 16px;
          padding: 14px;
          background: rgba(255,255,255,.025);
          border-radius: 8px;
          border: 1px solid var(--border);
        }

        .landing-page-root .q-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .landing-page-root .q-opt {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          font-size: 12px;
          color: var(--muted);
          cursor: pointer;
        }

        .landing-page-root .q-opt.correct {
          border-color: rgba(34,197,94,.35);
          background: rgba(34,197,94,.07);
          color: #A7F3C4;
        }

        .landing-page-root .q-opt.wrong {
          border-color: rgba(239,68,68,.25);
          background: rgba(239,68,68,.05);
          color: #FCA5A5;
        }

        .landing-page-root .q-opt-letter {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(255,255,255,.05);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .landing-page-root .q-opt.correct .q-opt-letter {
          background: rgba(34,197,94,.2);
          color: var(--green);
        }

        .landing-page-root .q-ia-tag {
          margin-top: 14px;
          padding: 10px 12px;
          background: rgba(59,126,248,.06);
          border: 1px solid rgba(59,126,248,.15);
          border-radius: 8px;
          font-size: 11px;
          color: #7BA8E0;
          line-height: 1.5;
        }

        .landing-page-root .q-ia-tag strong {
          color: var(--blue);
        }

        /* TRUST BAR */
        .landing-page-root .trust-bar {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: rgba(255,255,255,.015);
          padding: 20px 0;
        }

        .landing-page-root .trust-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 40px;
          flex-wrap: wrap;
        }

        .landing-page-root .trust-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--muted);
          font-weight: 500;
        }

        .landing-page-root .trust-item .icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--surface);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .landing-page-root .trust-item strong {
          color: var(--text);
        }

        /* DEMO SECTION */
        .landing-page-root .demo-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 48px;
        }

        .landing-page-root .demo-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: border-color .2s, transform .2s;
        }

        .landing-page-root .demo-card:hover {
          border-color: var(--border-h);
          transform: translateY(-2px);
        }

        .landing-page-root .demo-card-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .landing-page-root .demo-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .landing-page-root .demo-card-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }

        .landing-page-root .demo-card-sub {
          font-size: 12px;
          color: var(--muted);
        }

        .landing-page-root .demo-card-body {
          padding: 20px;
        }

        /* Fake chart */
        .landing-page-root .mini-chart {
          height: 80px;
          display: flex;
          align-items: flex-end;
          gap: 6px;
        }

        .landing-page-root .bar {
          flex: 1;
          border-radius: 4px 4px 0 0;
          background: rgba(59,126,248,.25);
          transition: background .2s;
        }

        .landing-page-root .bar.hi {
          background: var(--blue);
        }

        .landing-page-root .bar:hover {
          background: var(--blue-h);
        }

        /* Fake stats */
        .landing-page-root .stat-row {
          display: flex;
          gap: 16px;
        }

        .landing-page-root .stat-box {
          flex: 1;
          padding: 14px;
          background: rgba(255,255,255,.025);
          border: 1px solid var(--border);
          border-radius: 10px;
          text-align: center;
        }

        .landing-page-root .stat-num {
          font-size: 22px;
          font-weight: 700;
          color: var(--text);
        }

        .landing-page-root .stat-label {
          font-size: 11px;
          color: var(--muted);
          margin-top: 2px;
        }

        /* Fake AI chat */
        .landing-page-root .ai-msg {
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 12px;
          line-height: 1.5;
          margin-bottom: 8px;
        }

        .landing-page-root .ai-msg.user {
          background: rgba(59,126,248,.12);
          color: #9DC4F5;
          border: 1px solid rgba(59,126,248,.15);
          margin-left: 20px;
        }

        .landing-page-root .ai-msg.bot {
          background: rgba(255,255,255,.03);
          color: #A8C4E0;
          border: 1px solid var(--border);
          margin-right: 20px;
        }

        .landing-page-root .ai-msg .sender {
          font-size: 10px;
          font-weight: 600;
          margin-bottom: 4px;
          opacity: .6;
        }

        /* Flashcard */
        .landing-page-root .flashcard {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
        }

        .landing-page-root .flashcard-term {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .landing-page-root .flashcard-def {
          font-size: 12px;
          color: var(--muted);
          margin-top: 8px;
          line-height: 1.5;
        }

        .landing-page-root .flashcard-btns {
          display: flex;
          gap: 8px;
          margin-top: 14px;
        }

        .landing-page-root .fc-btn {
          flex: 1;
          padding: 8px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          border: 1px solid;
          cursor: pointer;
          text-align: center;
        }

        .landing-page-root .fc-btn.easy {
          border-color: rgba(34,197,94,.3);
          color: var(--green);
          background: rgba(34,197,94,.07);
        }

        .landing-page-root .fc-btn.hard {
          border-color: rgba(239,68,68,.25);
          color: #F87171;
          background: rgba(239,68,68,.05);
        }

        .landing-page-root .fc-btn.ok {
          border-color: rgba(245,158,11,.3);
          color: var(--amber);
          background: rgba(245,158,11,.07);
        }

        /* HOW IT WORKS */
        .landing-page-root .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-top: 48px;
        }

        .landing-page-root .step-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 28px 22px;
          position: relative;
          overflow: hidden;
          transition: border-color .2s;
        }

        .landing-page-root .step-card:hover {
          border-color: var(--border-h);
        }

        .landing-page-root .step-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--blue), transparent);
          opacity: 0;
          transition: opacity .2s;
        }

        .landing-page-root .step-card:hover::before {
          opacity: 1;
        }

        .landing-page-root .step-num {
          font-size: 11px;
          font-weight: 700;
          color: var(--blue);
          letter-spacing: .08em;
          text-transform: uppercase;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .landing-page-root .step-num::before {
          content: attr(data-n);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(59,126,248,.12);
          border: 1px solid rgba(59,126,248,.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: var(--blue);
        }

        .landing-page-root .step-icon {
          font-size: 28px;
          margin-bottom: 12px;
        }

        .landing-page-root .step-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
        }

        .landing-page-root .step-desc {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.55;
        }

        /* PRICING */
        .landing-page-root .pricing-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-top: 48px;
          align-items: start;
        }

        .landing-page-root .plan-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 28px 22px;
          position: relative;
          transition: border-color .2s, transform .2s;
        }

        .landing-page-root .plan-card:hover {
          border-color: var(--border-h);
          transform: translateY(-2px);
        }

        .landing-page-root .plan-card.featured {
          background: linear-gradient(160deg, #0C1E3A 0%, #0A1830 100%);
          border: 1px solid rgba(59,126,248,.35);
          transform: scale(1.03);
          box-shadow: 0 0 40px rgba(59,126,248,.12);
        }

        .landing-page-root .plan-card.featured:hover {
          transform: scale(1.03) translateY(-2px);
        }

        .landing-page-root .plan-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          font-weight: 700;
          color: #fff;
          letter-spacing: .05em;
          background: var(--blue);
          border-radius: 100px;
          padding: 4px 14px;
          box-shadow: 0 4px 12px rgba(59,126,248,.4);
          white-space: nowrap;
        }

        .landing-page-root .plan-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .landing-page-root .plan-price {
          margin: 14px 0 4px;
          display: flex;
          align-items: flex-end;
          gap: 4px;
        }

        .landing-page-root .plan-price-val {
          font-size: 36px;
          font-weight: 800;
          color: var(--text);
          line-height: 1;
        }

        .landing-page-root .plan-price-cur {
          font-size: 16px;
          font-weight: 600;
          color: var(--muted);
          margin-bottom: 4px;
        }

        .landing-page-root .plan-per {
          font-size: 12px;
          color: var(--faint);
        }

        .landing-page-root .plan-monthly {
          font-size: 12px;
          color: var(--green);
          margin-bottom: 20px;
          font-weight: 500;
        }

        .landing-page-root .plan-free-note {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 20px;
          height: 20px;
        }

        .landing-page-root .plan-divider {
          height: 1px;
          background: var(--border);
          margin: 20px 0;
        }

        .landing-page-root .plan-features {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 24px;
        }

        .landing-page-root .plan-features li {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 13px;
          color: var(--muted);
          line-height: 1.4;
        }

        .landing-page-root .plan-features li .chk {
          color: var(--green);
          flex-shrink: 0;
          margin-top: 1px;
        }

        .landing-page-root .plan-features li .dash {
          color: var(--faint);
          flex-shrink: 0;
        }

        .landing-page-root .plan-btn {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all .18s;
          text-decoration: none;
          display: inline-block;
          text-align: center;
        }

        .landing-page-root .plan-btn-ghost {
          background: rgba(255,255,255,.04);
          color: var(--muted);
          border: 1px solid var(--border);
        }

        .landing-page-root .plan-btn-ghost:hover {
          background: rgba(255,255,255,.07);
          color: var(--text);
        }

        .landing-page-root .plan-btn-primary {
          background: var(--blue);
          color: #fff;
          box-shadow: 0 4px 16px rgba(59,126,248,.3);
        }

        .landing-page-root .plan-btn-primary:hover {
          background: var(--blue-h);
          box-shadow: 0 6px 20px rgba(59,126,248,.45);
        }

        .landing-page-root .pricing-note {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: var(--faint);
        }

        /* WHY ROKOMED */
        .landing-page-root .why-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 48px;
        }

        .landing-page-root .why-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 28px;
          transition: border-color .2s;
        }

        .landing-page-root .why-card:hover {
          border-color: var(--border-h);
        }

        .landing-page-root .why-icon {
          font-size: 24px;
          margin-bottom: 14px;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: rgba(59,126,248,.08);
          border: 1px solid rgba(59,126,248,.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .landing-page-root .why-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
        }

        .landing-page-root .why-desc {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.6;
        }

        /* FAQ */
        .landing-page-root .faq-list {
          margin-top: 48px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-width: 720px;
          margin-left: auto;
          margin-right: auto;
        }

        .landing-page-root .faq-item {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          transition: border-color .2s;
        }

        .landing-page-root .faq-item:hover {
          border-color: var(--border-h);
        }

        .landing-page-root .faq-q {
          width: 100%;
          padding: 18px 20px;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          font-family: inherit;
        }

        .landing-page-root .faq-arrow {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          color: var(--muted);
          transition: transform .2s;
        }

        .landing-page-root .faq-item.open .faq-arrow {
          transform: rotate(180deg);
        }

        .landing-page-root .faq-a {
          max-height: 0;
          overflow: hidden;
          transition: max-height .3s ease;
        }

        .landing-page-root .faq-item.open .faq-a {
          max-height: 200px;
        }

        .landing-page-root .faq-a-inner {
          padding: 0 20px 18px;
          font-size: 14px;
          color: var(--muted);
          line-height: 1.65;
        }

        /* FINAL CTA */
        .landing-page-root .final-cta {
          text-align: center;
          padding: 96px 24px;
          position: relative;
          overflow: hidden;
        }

        .landing-page-root .final-cta-glow {
          position: absolute;
          bottom: -80px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 400px;
          pointer-events: none;
          background: radial-gradient(ellipse at 50% 100%, rgba(59,126,248,.15) 0%, transparent 65%);
        }

        .landing-page-root .final-cta h2 {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 800;
          color: var(--text);
          letter-spacing: -.025em;
          margin-bottom: 14px;
        }

        .landing-page-root .final-cta p {
          font-size: 16px;
          color: var(--muted);
          margin-bottom: 32px;
        }

        .landing-page-root .final-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .landing-page-root .final-note {
          font-size: 12px;
          color: var(--faint);
          margin-top: 14px;
        }

        /* FOOTER */
        .landing-page-root footer {
          border-top: 1px solid var(--border);
          padding: 36px 0;
          font-size: 13px;
          color: var(--faint);
          position: relative;
          z-index: 1;
        }

        .landing-page-root .footer-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .landing-page-root .footer-links {
          display: flex;
          gap: 20px;
        }

        .landing-page-root .footer-links a {
          transition: color .15s;
        }

        .landing-page-root .footer-links a:hover {
          color: var(--muted);
        }

        /* Social Proof */
        .landing-page-root .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 48px;
        }

        .landing-page-root .testi-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: border-color .2s;
        }

        .landing-page-root .testi-card:hover {
          border-color: var(--border-h);
        }

        .landing-page-root .testi-stars {
          display: flex;
          gap: 3px;
        }

        .landing-page-root .testi-star {
          color: var(--amber);
          font-size: 14px;
        }

        .landing-page-root .testi-text {
          font-size: 14px;
          color: #A8C4E0;
          line-height: 1.7;
          flex: 1;
        }

        .landing-page-root .testi-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .landing-page-root .testi-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--blue), #1e3a5f);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }

        .landing-page-root .testi-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .landing-page-root .testi-role {
          font-size: 12px;
          color: var(--muted);
        }

        .landing-page-root .testi-approved {
          border-color: rgba(34,197,94,.2);
          background: linear-gradient(160deg, #0d1f15 0%, var(--surface) 60%);
        }

        .landing-page-root .testi-approved:hover {
          border-color: rgba(34,197,94,.4);
        }

        .landing-page-root .testi-approved-banner {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 700;
          color: var(--green);
          background: rgba(34,197,94,.10);
          border: 1px solid rgba(34,197,94,.25);
          border-radius: 8px;
          padding: 6px 12px;
          margin-bottom: 10px;
          letter-spacing: .01em;
          width: fit-content;
        }

        .landing-page-root .testi-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          color: var(--green);
          background: rgba(34,197,94,.08);
          border: 1px solid rgba(34,197,94,.18);
          border-radius: 6px;
          padding: 2px 8px;
          margin-top: 2px;
        }

        /* Mobile hero mini-card */
        .landing-page-root .hero-mobile-card {
          display: none;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 16px;
          margin-top: 28px;
        }

        .landing-page-root .hmc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .landing-page-root .hmc-badge {
          font-size: 11px;
          font-weight: 600;
          color: var(--blue);
          background: rgba(59,126,248,.12);
          border: 1px solid rgba(59,126,248,.2);
          border-radius: 6px;
          padding: 3px 9px;
        }

        .landing-page-root .hmc-q {
          font-size: 13px;
          color: #C0D8F0;
          line-height: 1.55;
          padding: 12px;
          background: rgba(255,255,255,.025);
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .landing-page-root .hmc-correct {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid rgba(34,197,94,.35);
          background: rgba(34,197,94,.07);
          font-size: 12px;
          color: #A7F3C4;
          margin-bottom: 10px;
        }

        .landing-page-root .hmc-ia {
          padding: 10px 12px;
          background: rgba(59,126,248,.06);
          border: 1px solid rgba(59,126,248,.15);
          border-radius: 8px;
          font-size: 12px;
          color: #7BA8E0;
          line-height: 1.5;
        }

        /* Animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        
        .landing-page-root .hero-left > * {
          animation: fadeUp .5s ease both;
        }
        
        .landing-page-root .hero-left > *:nth-child(1) { animation-delay: .05s; }
        .landing-page-root .hero-left > *:nth-child(2) { animation-delay: .12s; }
        .landing-page-root .hero-left > *:nth-child(3) { animation-delay: .18s; }
        .landing-page-root .hero-left > *:nth-child(4) { animation-delay: .24s; }
        .landing-page-root .hero-left > *:nth-child(5) { animation-delay: .30s; }
        .landing-page-root .hero-visual { animation: fadeUp .5s ease .35s both; }

        /* Marquee */
        .landing-page-root .marquee-outer {
          overflow: hidden;
          width: 100%;
        }
        
        .landing-page-root .marquee-track {
          display: flex;
          gap: 10px;
          width: max-content;
          animation: marquee 38s linear infinite;
        }
        
        .landing-page-root .marquee-outer:hover .marquee-track {
          animation-play-state: paused;
        }
        
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        
        .landing-page-root .banca-pill {
          flex-shrink: 0;
          padding: 8px 18px;
          border-radius: 100px;
          background: var(--surface);
          border: 1px solid var(--border);
          font-size: 13px;
          font-weight: 600;
          color: var(--muted);
          white-space: nowrap;
          transition: color .15s, border-color .15s;
          cursor: default;
        }
        
        .landing-page-root .banca-pill:hover {
          color: var(--text);
          border-color: var(--border-h);
        }

        .landing-page-root .nav-mobile-btn {
          display: none;
        }

        /* Exit Popup Overlay & Content */
        .landing-page-root .lp-popup-overlay {
          position: fixed; inset: 0; background: rgba(5, 13, 26, 0.85); z-index: 1000;
          display: flex; align-items: center; justify-content: center; padding: 24px;
          backdrop-filter: blur(8px);
        }
        .landing-page-root .lp-popup {
          background: var(--surface); border: 1px solid var(--border-h);
          border-radius: var(--radius-lg); padding: 40px; max-width: 500px; width: 100%;
          position: relative; text-align: center;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,.05);
        }
        .landing-page-root .lp-popup-close {
          position: absolute; top: 16px; right: 16px; background: none; border: none;
          cursor: pointer; color: var(--muted); transition: color 0.2s;
        }
        .landing-page-root .lp-popup-close:hover { color: var(--text); }
        .landing-page-root .lp-popup-title {
          font-size: clamp(24px, 4vw, 32px); font-weight: 800; color: var(--text);
          letter-spacing: -.02em; margin-bottom: 12px;
        }
        .landing-page-root .lp-popup-title em { font-style: normal; color: var(--blue); }
        .landing-page-root .lp-popup p { font-size: 14px; color: var(--muted); margin-bottom: 24px; line-height: 1.6; }
        .landing-page-root .lp-popup-input {
          width: 100%; padding: 14px 16px; font-size: 14px; border-radius: var(--radius);
          border: 1px solid var(--border); background: rgba(255,255,255,.02);
          color: var(--text); margin-bottom: 14px; outline: none; transition: border-color .2s;
        }
        .landing-page-root .lp-popup-input:focus { border-color: var(--blue); }
        .landing-page-root .lp-popup-btn {
          width: 100%; display: inline-flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 600; border-radius: var(--radius);
          padding: 14px; cursor: pointer; border: none; background: var(--blue); color: #fff;
          transition: all .18s ease; box-shadow: 0 4px 16px rgba(59,126,248,.3);
        }
        .landing-page-root .lp-popup-btn:hover {
          background: var(--blue-h); box-shadow: 0 6px 20px rgba(59,126,248,.45);
        }
        .landing-page-root .lp-popup-cancel {
          background: none; border: none; font-size: 11px; text-transform: uppercase;
          letter-spacing: .05em; color: var(--muted); margin-top: 16px; cursor: pointer;
          text-decoration: underline; transition: color .2s;
        }
        .landing-page-root .lp-popup-cancel:hover { color: var(--text); }

        /* Floating WhatsApp Button */
        .landing-page-root .lp-wa-btn {
          position: fixed; bottom: 24px; right: 24px; background: #25D366; color: white;
          width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center;
          justify-content: center; box-shadow: 0 4px 16px rgba(37,211,102,0.3); z-index: 99;
          transition: transform 0.2s; cursor: pointer; border: none;
        }
        .landing-page-root .lp-wa-btn:hover { transform: scale(1.08); }

        @media (max-width: 900px) {
          .landing-page-root .hero { padding: 110px 0 60px; }
          .landing-page-root .hero-inner { grid-template-columns: 1fr; gap: 0; }
          .landing-page-root .hero-visual { display: none; }
          .landing-page-root .hero-mobile-card { display: block; }
          .landing-page-root .demo-grid { grid-template-columns: 1fr; }
          .landing-page-root .steps-grid { grid-template-columns: repeat(2, 1fr); }
          .landing-page-root .pricing-grid { grid-template-columns: repeat(2, 1fr); }
          .landing-page-root .plan-card.featured { transform: none; order: -1; }
          .landing-page-root .plan-card.featured:hover { transform: translateY(-2px); }
          .landing-page-root .why-grid { grid-template-columns: repeat(2, 1fr); }
          .landing-page-root .trust-inner { gap: 16px; }
          .landing-page-root .testimonials-grid { grid-template-columns: 1fr; }
          .landing-page-root .section { padding: 72px 0; }
          .landing-page-root .section-sm { padding: 56px 0; }
        }
        
        @media (max-width: 640px) {
          .landing-page-root .hero { padding: 88px 0 48px; }
          .landing-page-root .hero-title { font-size: 30px; }
          .landing-page-root .hero-sub { font-size: 15px; }
          .landing-page-root .hero-actions { flex-direction: column; align-items: stretch; }
          .landing-page-root .hero-actions .btn { justify-content: center; }
          .landing-page-root .steps-grid { grid-template-columns: 1fr; }
          .landing-page-root .pricing-grid { grid-template-columns: 1fr; }
          .landing-page-root .plan-card.featured { transform: none; }
          .landing-page-root .why-grid { grid-template-columns: 1fr; }
          .landing-page-root .nav-links { display: none; }
          .landing-page-root .nav-mobile-btn { display: flex; }
          .landing-page-root .trust-inner { flex-direction: column; align-items: flex-start; gap: 12px; }
          .landing-page-root .trust-bar { padding: 16px 0; }
          .landing-page-root .final-cta { padding: 64px 24px; }
          .landing-page-root .final-actions { flex-direction: column; align-items: stretch; }
          .landing-page-root .final-actions .btn { justify-content: center; }
          .landing-page-root .section { padding: 56px 0; }
          .landing-page-root .section-sm { padding: 48px 0; }
          .landing-page-root .section-title { font-size: 24px; }
          .landing-page-root .pricing-grid { gap: 12px; }
          .landing-page-root .plan-card { padding: 22px 18px; }
          .landing-page-root .plan-badge { font-size: 10px; }
        }
      `}</style>

      <div className="landing-page-root">
        {/* NAV */}
        <nav>
          <div className="container">
            <div className="nav-inner">
              <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                Roko<span>Med</span>
              </a>
              <div className="nav-links">
                <a href="#como-funciona" className="nav-link">Como funciona</a>
                <a href="#planos" className="nav-link">Planos</a>
                <a href="#faq" className="nav-link">FAQ</a>
                <Link to="/login" className="nav-link" onClick={() => trackClick('NAV_LOGIN')}>Entrar</Link>
                <Link to="/register" className="btn btn-primary nav-cta" style={{ padding: '8px 18px', fontSize: '13px' }} onClick={() => trackClick('NAV_SUBSCRIBE')}>
                  Começar Grátis
                </Link>
              </div>
              <Link to="/register" className="btn btn-primary nav-mobile-btn" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => trackClick('NAV_SUBSCRIBE_MOBILE')}>
                Começar Grátis
              </Link>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-glow"></div>
          <div className="container">
            <div className="hero-inner">
              {/* Left */}
              <div className="hero-left">
                <div className="hero-eyebrow">
                  <span className="tag">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <circle cx="5" cy="5" r="4" fill="#22C55E" />
                      <circle cx="5" cy="5" r="2" fill="#fff" />
                    </svg>
                    Banco de questões para residência médica
                  </span>
                </div>
                <h1 className="hero-title">
                  Prepare-se para a<br /><em>residência médica</em><br />de forma objetiva.
                </h1>
                <p className="hero-sub">
                  Mais de 15.000 questões comentadas, simulados personalizados e IA integrada para identificar e corrigir seus pontos fracos.
                </p>
                <ul className="hero-checks">
                  <li>Mais de 15.000 questões — USP, UNIFESP, ENARE, UERJ, UNICAMP e mais</li>
                  <li>IA que explica cada questão e tira dúvidas</li>
                  <li>Simulados personalizados por especialidade</li>
                  <li>Relatórios de desempenho detalhados</li>
                  <li>Funciona no celular, tablet e computador</li>
                </ul>
                <div className="hero-actions">
                  <Link to="/register" className="btn btn-primary btn-lg" onClick={() => trackClick('START_FREE_HERO')}>
                    Começar Gratuitamente
                  </Link>
                  <a href="#planos" className="btn btn-ghost btn-lg" onClick={() => trackClick('VIEW_PLANS_HERO')}>
                    Ver planos
                  </a>
                </div>
                <p className="hero-note">Plano gratuito disponível · Sem cartão de crédito</p>

                {/* Mini card visible on mobile */}
                <div className="hero-mobile-card">
                  <div className="hmc-header">
                    <span className="hmc-badge">Clínica Médica · USP 2024</span>
                    <span style={{ fontSize: '11px', color: 'var(--faint)' }}>3 de 5</span>
                  </div>
                  <div className="hmc-q">Paciente de 58 anos com dispneia progressiva, edema de MMII e crepitações bibasais. Diagnóstico mais provável?</div>
                  <div className="hmc-correct">
                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(34,197,94,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: 'var(--green)', flexShrink: 0 }}>B</span>
                    Insuficiência cardíaca descompensada ✓
                  </div>
                  <div className="hmc-ia"><strong style={{ color: 'var(--blue)' }}>✦ IA:</strong> A tríade dispneia + edema bilateral + crepitações em paciente com HAS e DM aponta para IC descompensada. Embolia pulmonar raramente cursa com edema progressivo.</div>
                </div>
              </div>

              {/* Right — Product screenshot */}
              <div className="hero-visual">
                <div className="screen-wrap">
                  <div className="screen-bar">
                    <div className="screen-dot" style={{ background: '#FF5F57' }}></div>
                    <div className="screen-dot" style={{ background: '#FFBD2E' }}></div>
                    <div className="screen-dot" style={{ background: '#28CA41' }}></div>
                    <div className="screen-bar-url">rokomed.com.br/questoes</div>
                  </div>
                  <div className="screen-content">
                    <div className="q-ui">
                      <div className="q-header">
                        <span className="q-badge">Clínica Médica · USP 2024</span>
                        <div className="q-progress">
                          <div className="q-prog-dot done"></div>
                          <div className="q-prog-dot done"></div>
                          <div className="q-prog-dot active"></div>
                          <div className="q-prog-dot"></div>
                          <div className="q-prog-dot"></div>
                        </div>
                      </div>
                      <div className="q-text">
                        Paciente de 58 anos, hipertenso e diabético, apresenta dispneia progressiva há 3 semanas, edema de membros inferiores e crepitações bibasais. Qual o diagnóstico mais provável?
                      </div>
                      <div className="q-options">
                        <div className="q-opt">
                          <div className="q-opt-letter">A</div>
                          Pneumonia bacteriana bilateral
                        </div>
                        <div className="q-opt correct">
                          <div className="q-opt-letter">B</div>
                          Insuficiência cardíaca descompensada ✓
                        </div>
                        <div className="q-opt">
                          <div className="q-opt-letter">C</div>
                          Derrame pleural por neoplasia
                        </div>
                        <div className="q-opt wrong">
                          <div className="q-opt-letter">D</div>
                          Embolia pulmonar ✗
                        </div>
                      </div>
                      <div className="q-ia-tag">
                        <strong>✦ IA:</strong> A tríade clássica de IC descompensada inclui dispneia, edema e crepitações. Os fatores de risco (HAS + DM) corroboram o diagnóstico. A embolia pulmonar geralmente não cursa com edema bilateral progressivo.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BAR */}
        <div className="trust-bar">
          <div className="container">
            <div className="trust-inner">
              <div className="trust-item">
                <div className="icon">📋</div>
                <div><strong>+15.000</strong> questões comentadas</div>
              </div>
              <div className="trust-item">
                <div className="icon">🏛️</div>
                <div><strong>USP, UNIFESP, ENARE</strong> e +20 bancas</div>
              </div>
              <div className="trust-item">
                <div className="icon">✦</div>
                <div><strong>IA integrada</strong> em todas as questões</div>
              </div>
              <div className="trust-item">
                <div className="icon">📱</div>
                <div><strong>Web responsivo</strong> — funciona em tudo</div>
              </div>
            </div>
          </div>
        </div>

        {/* BANCAS */}
        <section style={{ padding: '40px 0', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ marginBottom: '18px' }}>
            <p style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--faint)' }}>Questões das principais bancas do Brasil</p>
          </div>
          <div className="marquee-outer">
            <div className="marquee-track">
              <div className="banca-pill">USP · FMUSP</div>
              <div className="banca-pill">UNIFESP · EPM</div>
              <div className="banca-pill">ENARE</div>
              <div className="banca-pill">UERJ</div>
              <div className="banca-pill">UNICAMP</div>
              <div className="banca-pill">UFRJ</div>
              <div className="banca-pill">UFMG</div>
              <div className="banca-pill">UFPR</div>
              <div className="banca-pill">UFRGS</div>
              <div className="banca-pill">AMRIGS</div>
              <div className="banca-pill">SES-SP</div>
              <div className="banca-pill">Santa Casa SP</div>
              <div className="banca-pill">HC-FMUSP</div>
              <div className="banca-pill">IAMSPE</div>
              <div className="banca-pill">AMP</div>
              <div className="banca-pill">FHEMIG</div>
              <div className="banca-pill">FEPECS · SESDF</div>
              <div className="banca-pill">HFB</div>
              <div className="banca-pill">UFC · SURCE</div>
              <div className="banca-pill">UFBA · HUPES</div>
              <div className="banca-pill">FESP-RJ</div>
              <div className="banca-pill">SUS-BA</div>
              {/* duplicate for seamless loop */}
              <div className="banca-pill">USP · FMUSP</div>
              <div className="banca-pill">UNIFESP · EPM</div>
              <div className="banca-pill">ENARE</div>
              <div className="banca-pill">UERJ</div>
              <div className="banca-pill">UNICAMP</div>
              <div className="banca-pill">UFRJ</div>
              <div className="banca-pill">UFMG</div>
              <div className="banca-pill">UFPR</div>
              <div className="banca-pill">UFRGS</div>
              <div className="banca-pill">AMRIGS</div>
              <div className="banca-pill">SES-SP</div>
              <div className="banca-pill">Santa Casa SP</div>
              <div className="banca-pill">HC-FMUSP</div>
              <div className="banca-pill">IAMSPE</div>
              <div className="banca-pill">AMP</div>
              <div className="banca-pill">FHEMIG</div>
              <div className="banca-pill">FEPECS · SESDF</div>
              <div className="banca-pill">HFB</div>
              <div className="banca-pill">UFC · SURCE</div>
              <div className="banca-pill">UFBA · HUPES</div>
              <div className="banca-pill">FESP-RJ</div>
              <div className="banca-pill">SUS-BA</div>
            </div>
          </div>
        </section>

        {/* DEMO */}
        <section className="section" id="demo">
          <div className="container">
            <div style={{ textAlign: 'center' }}>
              <span className="tag" style={{ marginBottom: '16px', display: 'inline-flex' }}>O que você recebe</span>
              <h2 className="section-title" style={{ margin: '0 auto', maxWidth: '520px' }}>
                Veja exatamente o que está dentro da plataforma
              </h2>
              <p className="section-sub" style={{ margin: '12px auto 0' }}>Cada recurso foi pensado para tornar seu estudo mais eficiente, não mais longo.</p>
            </div>

            <div className="demo-grid">
              {/* Questões */}
              <div className="demo-card">
                <div className="demo-card-header">
                  <div className="demo-icon" style={{ background: 'rgba(59,126,248,.1)' }}>📋</div>
                  <div>
                    <div className="demo-card-title">Banco de Questões</div>
                    <div className="demo-card-sub">Filtros por especialidade, instituição e ano</div>
                  </div>
                </div>
                <div className="demo-card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,.02)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Clínica Médica · ENARE 2024</span>
                      <span style={{ fontSize: '11px', color: 'var(--green)', background: 'rgba(34,197,94,.1)', padding: '2px 8px', borderRadius: '6px' }}>Feita</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,.02)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Pediatria · UERJ 2023</span>
                      <span style={{ fontSize: '11px', color: 'var(--green)', background: 'rgba(34,197,94,.1)', padding: '2px 8px', borderRadius: '6px' }}>Feita</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(59,126,248,.05)', border: '1px solid rgba(59,126,248,.2)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#9DC4F5' }}>Cardiologia · USP 2024</span>
                      <span style={{ fontSize: '11px', color: 'var(--blue)', background: 'rgba(59,126,248,.12)', padding: '2px 8px', borderRadius: '6px' }}>Em andamento</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,.02)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Cirurgia Geral · UNIFESP 2023</span>
                      <span style={{ fontSize: '11px', color: 'var(--faint)' }}>Pendente</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,.02)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Ginecologia · UNICAMP 2024</span>
                      <span style={{ fontSize: '11px', color: 'var(--faint)' }}>Pendente</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,.02)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Neurologia · UFRJ 2023</span>
                      <span style={{ fontSize: '11px', color: 'var(--faint)' }}>Pendente</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Relatórios */}
              <div className="demo-card">
                <div className="demo-card-header">
                  <div className="demo-icon" style={{ background: 'rgba(34,197,94,.1)' }}>📊</div>
                  <div>
                    <div className="demo-card-title">Relatório de Desempenho</div>
                    <div className="demo-card-sub">Acompanhe sua evolução por especialidade</div>
                  </div>
                </div>
                <div className="demo-card-body">
                  <div className="stat-row" style={{ marginBottom: '16px' }}>
                    <div className="stat-box">
                      <div className="stat-num" style={{ color: 'var(--green)' }}>73%</div>
                      <div className="stat-label">Acertos</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-num">248</div>
                      <div className="stat-label">Questões</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-num" style={{ color: 'var(--blue)' }}>12</div>
                      <div className="stat-label">Dias</div>
                    </div>
                  </div>
                  <div className="mini-chart">
                    <div className="bar" style={{ height: '40%' }}></div>
                    <div className="bar" style={{ height: '55%' }}></div>
                    <div className="bar" style={{ height: '50%' }}></div>
                    <div className="bar" style={{ height: '65%' }}></div>
                    <div className="bar" style={{ height: '58%' }}></div>
                    <div className="bar hi" style={{ height: '73%' }}></div>
                    <div className="bar hi" style={{ height: '80%' }}></div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--faint)', textAlign: 'center', marginTop: '8px' }}>Últimos 7 dias</div>
                </div>
              </div>

              {/* IA */}
              <div className="demo-card">
                <div className="demo-card-header">
                  <div className="demo-icon" style={{ background: 'rgba(245,158,11,.1)' }}>✦</div>
                  <div>
                    <div className="demo-card-title">IA Integrada</div>
                    <div className="demo-card-sub">Tira dúvidas e explica o raciocínio clínico</div>
                  </div>
                </div>
                <div className="demo-card-body">
                  <div className="ai-msg user">
                    <div className="sender">Você</div>
                    Por que não pode ser embolia pulmonar nesse caso?
                  </div>
                  <div className="ai-msg bot">
                    <div className="sender">IA RokoMed</div>
                    Embolia pulmonar causa dispneia aguda e raramente cursa com edema bilateral progressivo. O edema simétrico + crepitações bibasais + fatores de risco cardiovascular indicam sobrecarga hídrica — padrão de IC descompensada.
                  </div>
                </div>
              </div>

              {/* Flashcards */}
              <div className="demo-card">
                <div className="demo-card-header">
                  <div className="demo-icon" style={{ background: 'rgba(168,85,247,.1)' }}>🃏</div>
                  <div>
                    <div className="demo-card-title">Flashcards Adaptativos</div>
                    <div className="demo-card-sub">Revisão espaçada baseada nos seus erros</div>
                  </div>
                </div>
                <div className="demo-card-body">
                  <div className="flashcard">
                    <div style={{ fontSize: '11px', color: 'var(--faint)', marginBottom: '10px' }}>Cardiologia</div>
                    <div className="flashcard-term">Critérios de Framingham para IC</div>
                    <div className="flashcard-def">Diagnóstico requer 2 maiores ou 1 maior + 2 menores. Maiores: dispneia paroxística noturna, edema agudo de pulmão, cardiomegalia, B3.</div>
                    <div className="flashcard-btns">
                      <button type="button" className="fc-btn hard">Difícil</button>
                      <button type="button" className="fc-btn ok">Ok</button>
                      <button type="button" className="fc-btn easy">Fácil</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section-sm" id="como-funciona" style={{ background: 'rgba(255,255,255,.015)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div style={{ textAlign: 'center' }}>
              <span className="tag" style={{ marginBottom: '16px', display: 'inline-flex' }}>Como funciona</span>
              <h2 className="section-title">Simples e direto</h2>
            </div>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-num" data-n="1">Passo</div>
                <div className="step-icon">📋</div>
                <div className="step-title">Resolva questões</div>
                <div className="step-desc">Filtre por especialidade, institution ou ano. Treine no ritmo que preferir.</div>
              </div>
              <div className="step-card">
                <div className="step-num" data-n="2">Passo</div>
                <div className="step-icon">🔍</div>
                <div className="step-title">Identifique pontos fracos</div>
                <div className="step-desc">Os relatórios mostram exatamente onde você erra mais e o que precisa revisar.</div>
              </div>
              <div className="step-card">
                <div className="step-num" data-n="3">Passo</div>
                <div className="step-icon">✦</div>
                <div className="step-title">Use a IA para aprender</div>
                <div className="step-desc">Pergunte à IA sobre qualquer questão ou tema. Ela explica o raciocínio clínico, não só a resposta.</div>
              </div>
              <div className="step-card">
                <div className="step-num" data-n="4">Passo</div>
                <div className="step-icon">📈</div>
                <div className="step-title">Acompanhe a evolução</div>
                <div className="step-desc">Veja seu desempenho crescer ao longo do tempo, especialidade por especialidade.</div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="section">
          <div className="container">
            <div style={{ textAlign: 'center' }}>
              <span className="tag" style={{ marginBottom: '16px', display: 'inline-flex' }}>Quem usa</span>
              <h2 className="section-title">O que os usuários dizem</h2>
              <p className="section-sub" style={{ margin: '12px auto 0' }}>Depoimentos de quem usou o RokoMed durante a preparação.</p>
            </div>

            <div className="testimonials-grid">
              {/* Card 1 — Approved */}
              <div className="testi-card testi-approved">
                <div className="testi-approved-banner">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7.5L5.5 11L12 3" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Aprovado — Pediatria · SES-SP 2024
                </div>
                <div className="testi-stars" style={{ marginTop: '4px' }}>
                  <span className="testi-star">★</span><span className="testi-star">★</span>
                  <span className="testi-star">★</span><span className="testi-star">★</span>
                  <span className="testi-star">★</span>
                </div>
                <p className="testi-text">"Resolvi mais de 4.000 questões no RokoMed durante minha preparação. Os relatórios mostraram exatamente quais especialidades estavam puxando minha nota para baixo, o que me ajudou a estudar de forma muito mais direcionada."</p>
                <div className="testi-author">
                  <div className="testi-avatar">MC</div>
                  <div>
                    <div className="testi-name">Mateus Carvalho</div>
                    <div className="testi-role">Aprovado em Pediatria · SES-SP 2024</div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="testi-card">
                <div className="testi-stars">
                  <span className="testi-star">★</span><span className="testi-star">★</span>
                  <span className="testi-star">★</span><span className="testi-star">★</span>
                  <span className="testi-star">★</span>
                </div>
                <p className="testi-text">"A IA me ajudou principalmente nas questões que eu errava por raciocínio. Em vez de apenas ler o comentário, eu conseguia discutir a questão e entender o motivo do erro. Isso acelerou bastante meu aprendizado."</p>
                <div className="testi-author">
                  <div className="testi-avatar" style={{ background: 'linear-gradient(135deg,#0f6e3a,#0a3d20)' }}>LM</div>
                  <div>
                    <div className="testi-name">Larissa Mendonça</div>
                    <div className="testi-role">Médica · Campinas, SP</div>
                    <div className="testi-badge">✓ Usuário verificado</div>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="testi-card">
                <div className="testi-stars">
                  <span className="testi-star">★</span><span className="testi-star">★</span>
                  <span className="testi-star">★</span><span className="testi-star">★</span>
                  <span className="testi-star">★</span>
                </div>
                <p className="testi-text">"Testei outros bancos de questões antes de conhecer o RokoMed. O que me fez ficar foi a combinação entre organização, velocidade da plataforma e custo-benefício. Hoje uso praticamente todos os dias."</p>
                <div className="testi-author">
                  <div className="testi-avatar" style={{ background: 'linear-gradient(135deg,#5b3fb5,#2d1f6e)' }}>RF</div>
                  <div>
                    <div className="testi-name">Rafael Ferreira</div>
                    <div className="testi-role">Internato · Universidade Federal</div>
                    <div className="testi-badge">✓ Usuário verificado</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="section" id="planos">
          <div className="container">
            <div style={{ textAlign: 'center' }}>
              <span className="tag" style={{ marginBottom: '16px', display: 'inline-flex' }}>Planos</span>
              <h2 className="section-title">Escolha seu plano</h2>
              <p className="section-sub" style={{ margin: '12px auto 0' }}>Comece grátis. Faça upgrade quando quiser. Cancele quando precisar.</p>
            </div>

            <div className="pricing-grid">
              {/* Gratuito */}
              <div className="plan-card">
                <div className="plan-name">Gratuito</div>
                <div className="plan-price">
                  <span className="plan-price-cur">R$</span>
                  <span className="plan-price-val">0</span>
                </div>
                <div className="plan-free-note">Para começar sem compromisso</div>
                <div className="plan-divider"></div>
                <ul className="plan-features">
                  <li><span className="chk">✓</span>100 questões gratuitas</li>
                  <li><span className="chk">✓</span>Filtros por especialidade</li>
                  <li><span className="chk">✓</span>Gabarito comentado</li>
                  <li><span className="dash">–</span><span style={{ color: 'var(--faint)' }}>Simulados personalizados</span></li>
                  <li><span className="dash">–</span><span style={{ color: 'var(--faint)' }}>IA integrada</span></li>
                  <li><span className="dash">–</span><span style={{ color: 'var(--faint)' }}>Relatórios completos</span></li>
                </ul>
                <Link to="/register" className="plan-btn plan-btn-ghost" onClick={() => trackClick('START_FREE')}>
                  Começar Grátis
                </Link>
              </div>

              {/* Mensal */}
              <div className="plan-card">
                <div className="plan-name">Mensal</div>
                <div className="plan-price">
                  <span className="plan-price-cur">R$</span>
                  <span className="plan-price-val">{monthlyPrice}</span>
                </div>
                <div className="plan-free-note" style={{ color: 'var(--muted)' }}>por mês</div>
                <div className="plan-divider"></div>
                <ul className="plan-features">
                  <li><span className="chk">✓</span>Todas as 15.000+ questões</li>
                  <li><span className="chk">✓</span>Simulados personalizados</li>
                  <li><span className="chk">✓</span>IA integrada</li>
                  <li><span className="chk">✓</span>Relatórios de desempenho</li>
                  <li><span className="chk">✓</span>Flashcards adaptativos</li>
                </ul>
                <Link to={`/checkout?plan=monthly`} className="plan-btn plan-btn-ghost" onClick={() => trackClick('BUY_MONTHLY')}>
                  Assinar Mensal
                </Link>
              </div>

              {/* Semestral */}
              <div className="plan-card">
                <div className="plan-name">Semestral</div>
                <div className="plan-price">
                  <span className="plan-price-cur">R$</span>
                  <span className="plan-price-val">{semiannualTotal}</span>
                </div>
                <div className="plan-monthly" style={{ marginTop: '4px' }}>≈ R${semiannualInstallment}/mês</div>
                <div className="plan-divider"></div>
                <ul className="plan-features">
                  <li><span className="chk">✓</span>Todas as 15.000+ questões</li>
                  <li><span className="chk">✓</span>Simulados personalizados</li>
                  <li><span className="chk">✓</span>IA integrada</li>
                  <li><span className="chk">✓</span>Relatórios de desempenho</li>
                  <li><span className="chk">✓</span>Flashcards adaptativos</li>
                </ul>
                <Link to={`/checkout?plan=semiannual`} className="plan-btn plan-btn-ghost" onClick={() => trackClick('BUY_SEMIANNUAL')}>
                  Assinar Semestral
                </Link>
              </div>

              {/* Anual — FEATURED */}
              <div className="plan-card featured">
                <div className="plan-badge">⭐ Melhor custo-benefício</div>
                <div className="plan-name" style={{ color: 'var(--blue)' }}>Anual</div>
                <div className="plan-price">
                  <span className="plan-price-cur" style={{ color: 'var(--text)' }}>R$</span>
                  <span className="plan-price-val" style={{ color: 'var(--text)' }}>{annualTotal}</span>
                </div>
                <div className="plan-monthly">≈ R${annualInstallment}/mês · Economia de 58%</div>
                <div className="plan-divider"></div>
                <ul className="plan-features">
                  <li><span className="chk">✓</span>Todas as 15.000+ questões</li>
                  <li><span className="chk">✓</span>Simulados personalizados</li>
                  <li><span className="chk">✓</span>IA integrada</li>
                  <li><span className="chk">✓</span>Relatórios de desempenho</li>
                  <li><span className="chk">✓</span>Flashcards adaptativos</li>
                </ul>
                <Link to={`/checkout?plan=annual`} className="plan-btn plan-btn-primary" onClick={() => trackClick('BUY_ANNUAL')}>
                  Assinar Plano Anual
                </Link>
              </div>
            </div>
            <p className="pricing-note">Pagamento seguro · Cancele a qualquer momento · Sem taxa de adesão</p>
          </div>
        </section>

        {/* WHY ROKOMED */}
        <section className="section-sm" style={{ background: 'rgba(255,255,255,.015)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div>
              <span className="tag" style={{ marginBottom: '16px', display: 'inline-flex' }}>Por que o RokoMed?</span>
              <h2 className="section-title">Uma ferramenta séria,<br />a um preço acessível.</h2>
              <p className="section-sub">Sem promessas exageradas. O RokoMed entrega o que todo candidato precisa: questões de qualidade, análise objetiva do desempenho e IA disponível quando você tiver dúvida.</p>
            </div>
            <div className="why-grid">
              <div className="why-card">
                <div className="why-icon">📋</div>
                <div className="why-title">Questões focadas em residência</div>
                <div className="why-desc">Mais de 15.000 questões das principais bancas do Brasil — USP, UNIFESP, ENARE, UERJ, UNICAMP, UFRJ, UFMG, AMRIGS, SES-SP, Santa Casa e outras — todas comentadas e organizadas por especialidade.</div>
              </div>
              <div className="why-card">
                <div className="why-icon">✦</div>
                <div className="why-title">IA que vai além da resposta</div>
                <div className="why-desc">A IA integrada explica o raciocínio clínico por trás de cada questão e está disponível para qualquer dúvida, a qualquer hora.</div>
              </div>
              <div className="why-card">
                <div className="why-icon">🎯</div>
                <div className="why-title">Simulados personalizados</div>
                <div className="why-desc">Monte simulados por especialidade, dificuldade ou instituição. Treine exatamente o que você precisa, sem desperdiçar tempo.</div>
              </div>
              <div className="why-card">
                <div className="why-icon">📊</div>
                <div className="why-title">Relatórios honestos</div>
                <div className="why-desc">Os relatórios mostram com precisão onde você está indo bem e onde precisa melhorar — sem maquiar os resultados.</div>
              </div>
              <div className="why-card">
                <div className="why-icon">💰</div>
                <div className="why-title">Preço acessível</div>
                <div className="why-desc">Plano anual por R$147 — menos de R$12 por mês. Para um investimento tão crítico quanto a preparação para residência, isso é justo.</div>
              </div>
              <div className="why-card">
                <div className="why-icon">📱</div>
                <div className="why-title">Funciona em qualquer tela</div>
                <div className="why-desc">Plataforma web totalmente responsiva. Estude no celular no plantão, no tablet em casa ou no computador quando quiser mais espaço.</div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" id="faq">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 0 }}>
              <span className="tag" style={{ marginBottom: '16px', display: 'inline-flex' }}>Dúvidas frequentes</span>
              <h2 className="section-title">Perguntas frequentes</h2>
            </div>

            <div className="faq-list">
              {faqItems.map((item, i) => (
                <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                  <button 
                    className="faq-q" 
                    onClick={() => {
                      const wasClosed = openFaq !== i
                      if (wasClosed) {
                        trackClick('FAQ_EXPAND: ' + item.q)
                      }
                      setOpenFaq(openFaq === i ? null : i)
                    }}
                  >
                    {item.q}
                    <svg className="faq-arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 7.5l5 5 5-5" />
                    </svg>
                  </button>
                  <div className="faq-a">
                    <div className="faq-a-inner">{item.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <div className="final-cta">
            <div className="final-cta-glow"></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2>Comece agora — é grátis.</h2>
              <p>Crie sua conta em menos de 1 minuto e resolva suas primeiras questões hoje.</p>
              <div className="final-actions">
                <Link to="/register" className="btn btn-primary btn-lg" onClick={() => trackClick('START_FREE_BOTTOM')}>
                  Criar Conta Gratuita
                </Link>
                <a href="#planos" className="btn btn-ghost btn-lg" onClick={() => trackClick('VIEW_PLANS_BOTTOM')}>
                  Ver planos pagos
                </a>
              </div>
              <p className="final-note">Sem cartão de crédito · Upgrade a qualquer momento</p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer>
          <div className="container">
            <div className="footer-inner">
              <div style={{ fontWeight: 700, color: 'var(--muted)', letterSpacing: '-.02em' }}>
                Roko<span>Med</span>
                <span style={{ fontWeight: 400, marginLeft: '16px', fontSize: '12px' }}>© 2026 RokoMed. Todos os direitos reservados.</span>
              </div>
              <div className="footer-links">
                <a href="#">Termos de uso</a>
                <a href="#">Privacidade</a>
                <a href="#">Contato</a>
              </div>
            </div>
          </div>
        </footer>

        {/* Floating WhatsApp Button */}
        <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="lp-wa-btn" aria-label="WhatsApp" onClick={() => trackClick('WHATSAPP_CLICK')}>
          <MessageCircle size={32} />
        </a>

        {/* Exit Intent Popup */}
        {showExitPopup && (
          <div className="lp-popup-overlay" onClick={() => setShowExitPopup(false)}>
            <div className="lp-popup" onClick={e => e.stopPropagation()}>
              <button className="lp-popup-close" onClick={() => setShowExitPopup(false)}>
                <X size={24} />
              </button>
              <div className="lp-popup-title">Espere!</div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '16px', lineHeight: 1.2 }}>
                Não vá embora de mãos abanando.
              </h2>
              <p>
                Sabemos que a residência é puxada. Experimente grátis nosso simulado com 30 questões comentadas e veja seu nível agora mesmo.
              </p>
              <input 
                type="email" 
                placeholder="Qual o seu melhor e-mail?"
                value={leadEmail}
                onChange={e => setLeadEmail(e.target.value)}
                className="lp-popup-input"
              />
              <button 
                type="button"
                className="lp-popup-btn"
                onClick={handleLeadCapture} 
                disabled={loadingLead}
              >
                {loadingLead ? 'Carregando...' : 'Fazer Simulado Grátis Agora'}
              </button>
              <button 
                type="button"
                onClick={() => setShowExitPopup(false)} 
                className="lp-popup-cancel"
              >
                Não, prefiro continuar estudando do jeito antigo
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
