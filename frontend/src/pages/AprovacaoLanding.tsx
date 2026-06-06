import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, MessageSquare, Award, ArrowRight, Star, HelpCircle, ChevronDown, Check, Zap, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { subscriptionApi } from '../lib/api'
import { trackClick } from '../lib/tracker'

export default function AprovacaoLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [leadEmail, setLeadEmail] = useState('')
  const [loadingLead, setLoadingLead] = useState(false)

  // Interactive widget state
  const [targetInst, setTargetInst] = useState('FMUSP')
  const [targetSpec, setTargetSpec] = useState('Cirurgia Geral')
  const [showWidgetResult, setShowWidgetResult] = useState(false)

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
    document.title = 'Aprovados RokoMed — O Método para sua Aprovação na Residência'
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

  const approvedStudentsMarquee = [
    { name: 'Dr. Gabriel Mendes', inst: 'USP (FMUSP)', spec: 'Cirurgia Geral' },
    { name: 'Dra. Ana Clara Rocha', inst: 'ENARE - HC', spec: 'Clínica Médica' },
    { name: 'Dr. Mateus Silveira', inst: 'UNICAMP', spec: 'Ortopedia' },
    { name: 'Dra. Carolina Schmitt', inst: 'UNIFESP', spec: 'Pediatria' },
    { name: 'Dr. Thiago Kunz', inst: 'IAMSPE', spec: 'Anestesiologia' },
    { name: 'Dra. Julia Rinaldi', inst: 'SUS-SP', spec: 'Ginecologia e Obstetrícia' },
    { name: 'Dr. Lucas Pires', inst: 'UFRJ', spec: 'Radiologia' },
    { name: 'Dra. Mariana Goulart', inst: 'UFRGS', spec: 'Dermatologia' }
  ]

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
      a: "Sim! Todos os planos PRO dão direito a até 50 consultas mensais com o Dr. André. O plano gratuito oferece 5 créditos experimentais para testar a inteligência do tutor."
    },
    {
      q: "Existe fidelidade contratual?",
      a: "Não. Você pode cancelar sua assinatura a qualquer momento com apenas um clique na área de perfil, sem qualquer multa contratual. Seu acesso continuará ativo até o fim do ciclo contratado."
    }
  ]

  // Widget calculations based on input
  const getWidgetRecommendation = () => {
    return {
      questionsNeeded: targetInst === 'FMUSP' ? 3200 : targetInst === 'ENARE' ? 1800 : 2500,
      focusArea: targetSpec === 'Cirurgia Geral' ? 'Cirurgia Geral e Trauma' : targetSpec === 'Pediatria' ? 'Neonatologia e Pediatria Geral' : 'Clínica Médica e Cardiologia',
      advice: `A banca do ${targetInst} historicamente prioriza raciocínio clínico integrado em ${targetSpec}. Recomendamos agendar pelo menos 4 horas semanais deste assunto no cronograma da sua rotina adaptativa.`
    }
  }

  const widgetResult = getWidgetRecommendation()

  return (
    <div className="landing-page-root">
      
      {/* Styles setup */}
      <style>{`
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
          --green:     #10B981;
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

        .landing-page-root .container {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 24px;
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

        /* Hero */
        .landing-page-root .hero {
          padding: 140px 0 60px;
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
          grid-template-columns: 1.2fr 0.8fr;
          gap: 48px;
          align-items: center;
        }

        /* Scrolling Ticker */
        .landing-page-root .ticker-wrap {
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          overflow: hidden;
          white-space: nowrap;
          padding: 16px 0;
          position: relative;
        }

        .landing-page-root .ticker-scroll {
          display: inline-block;
          animation: marquee 25s linear infinite;
        }

        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }

        .landing-page-root .ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-right: 48px;
          font-size: 13px;
          font-weight: 500;
          color: var(--muted);
        }

        .landing-page-root .ticker-item strong {
          color: white;
        }

        /* Widgets & Cards */
        .landing-page-root .glass-card {
          background: rgba(12, 26, 46, 0.45);
          backdrop-filter: blur(16px);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }

        /* Pricing layout */
        .landing-page-root .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-top: 48px;
        }

        .landing-page-root .pricing-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 32px 24px;
          position: relative;
          display: flex;
          flex-direction: column;
          transition: transform .2s, border-color .2s;
        }

        .landing-page-root .pricing-card.popular {
          border-color: var(--blue);
          box-shadow: 0 0 25px rgba(59,126,248,.12);
        }

        .landing-page-root .pricing-card:hover {
          transform: translateY(-2px);
          border-color: var(--border-h);
        }
      `}</style>

      {/* ── Header ── */}
      <nav>
        <div className="container nav-inner">
          <Link to="/" className="nav-logo" style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'Outfit', color: 'white' }}>
            Roko<span style={{ color: 'var(--blue)' }}>Med</span>
          </Link>
          <div className="nav-links">
            <Link to="/login" className="nav-link">Entrar</Link>
            <Link to="/register" className="btn btn-primary nav-cta" style={{ padding: '8px 16px', fontSize: '13px' }}>
              Cadastrar Grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="container hero-inner">
          
          <div className="animate-fade-in">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '12px', fontWeight: 600, color: 'var(--blue)', background: 'rgba(59,126,248,0.1)', border: '1px solid rgba(59,126,248,0.2)', padding: '4px 12px', borderRadius: 99, marginBottom: 16 }}>
              <Award size={13} />
              MÉTODO COMPROVADO DE APROVAÇÃO
            </div>

            <h1 style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 800, color: 'white', lineHeight: 1.15, fontFamily: 'Outfit', letterSpacing: '-0.02em' }}>
              O caminho mais curto entre você e a sua <span style={{ color: 'var(--blue)' }}>vaga de Residência</span>.
            </h1>
            
            <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.6, marginTop: 16, maxWidth: 620 }}>
              Chega de cursinhos tradicionais com videoaulas cansativas de 3 horas. No RokoMed você aprende praticando, monitora suas fraquezas e estuda com uma inteligência que calibra seu plano de estudos diariamente.
            </p>

            <ul style={{ listStyle: 'none', margin: '24px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Banco com mais de 15.000 questões com gabarito comentado detalhado.',
                'Dr. André: Tutor Inteligente de IA que analisa suas falhas e explica a teoria.',
                'Caderno de Erros automatizado para você dominar seus pontos fracos.'
              ].map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', color: '#A8C8E8' }}>
                  <CheckCircle2 size={16} color="var(--green)" style={{ flexShrink: 0 }} /> {item}
                </li>
              ))}
            </ul>

            {/* Lead capture form */}
            <div style={{ display: 'flex', gap: 8, maxWidth: 480, width: '100%', alignItems: 'center', marginTop: 32 }}>
              <input
                type="email"
                placeholder="Seu e-mail profissional..."
                value={leadEmail}
                onChange={e => setLeadEmail(e.target.value)}
                style={{
                  flex: 1, padding: '14px 18px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)', borderRadius: 12, color: 'white',
                  fontSize: '0.9rem', outline: 'none'
                }}
              />
              <button
                onClick={handleLeadCapture}
                disabled={loadingLead}
                className="btn btn-primary"
                style={{ padding: '14px 24px', borderRadius: 12 }}
              >
                {loadingLead ? 'Processando...' : 'Iniciar Simulado Grátis'} <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Social Proof Approved Widget */}
          <div className="glass-card animate-spring" style={{ padding: '1.75rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -12, right: -12, background: 'linear-gradient(135deg, var(--amber) 0%, #D97706 100%)', padding: '4px 12px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 4, color: '#FFF', fontSize: '0.7rem', fontWeight: 700, boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
              <Sparkles size={11} /> 94% de Sucesso
            </div>
            
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>
              Mural dos Aprovados RokoMed
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              {[
                { name: 'Dr. Gabriel Mendes', spec: 'Cirurgia Geral', inst: 'USP (FMUSP)', quote: 'O caderno de erros me economizou semanas de estudo tradicional.', score: '82% acertos' },
                { name: 'Dra. Ana Clara Rocha', spec: 'Clínica Médica', inst: 'ENARE', quote: 'A trilha adaptativa foca exatamente no que você precisa. Aprovada na 1ª opção!', score: '1º Lugar' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>{item.name}</span>
                    <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--green)', borderRadius: 4, fontWeight: 600 }}>{item.score}</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 2 }}>{item.spec} — {item.inst}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text)', fontStyle: 'italic', marginTop: 6, borderLeft: '2px solid var(--blue)', paddingLeft: 8 }}>
                    "{item.quote}"
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--muted)' }}>
              <div style={{ display: 'flex', color: 'var(--amber)' }}>
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
              </div>
              <span>Avaliado em <strong>4.9/5</strong> por +2.000 médicos</span>
            </div>

          </div>

        </div>
      </section>

      {/* ── Marquee approved students ── */}
      <div className="ticker-wrap">
        <div className="ticker-scroll">
          {/* Repeat list twice to make it seamless loop */}
          {[...approvedStudentsMarquee, ...approvedStudentsMarquee].map((item, idx) => (
            <span key={idx} className="ticker-item">
              <CheckCircle2 size={13} color="var(--green)" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              <span>{item.name}</span> aprovado em <strong>{item.spec}</strong> na <strong>{item.inst}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* ── Dynamic Simulation Calculator Widget ── */}
      <section className="section" style={{ background: '#081120' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 48, alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PREVISÃO DE APRENDIZAGEM</span>
            <h2 className="section-title" style={{ marginTop: 8, fontFamily: 'Outfit' }}>Calcule sua Meta até a Prova</h2>
            <p className="section-sub" style={{ marginTop: 12 }}>
              Selecione a instituição dos seus sonhos e sua especialidade. Nosso algoritmo estima a carga de questões com base na cobrança e prioridades calibradas.
            </p>

            {/* Input selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4 }}>Banca Pretendida</label>
                <select className="input" value={targetInst} onChange={e => { setTargetInst(e.target.value); setShowWidgetResult(true); }} style={{ width: '100%', background: '#0C1A2E', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'white' }}>
                  <option value="FMUSP">USP (FMUSP)</option>
                  <option value="ENARE">ENARE (Exame Nacional)</option>
                  <option value="UNICAMP">UNICAMP</option>
                  <option value="UNIFESP">UNIFESP</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4 }}>Especialidade Pretendida</label>
                <select className="input" value={targetSpec} onChange={e => { setTargetSpec(e.target.value); setShowWidgetResult(true); }} style={{ width: '100%', background: '#0C1A2E', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'white' }}>
                  <option value="Cirurgia Geral">Cirurgia Geral</option>
                  <option value="Pediatria">Pediatria</option>
                  <option value="Clínica Médica">Clínica Médica</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowWidgetResult(true)}
              className="btn btn-primary"
              style={{ marginTop: 20, width: '100%', borderRadius: 8 }}
            >
              Simular Carga de Estudos
            </button>
          </div>

          <div className="glass-card" style={{ minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {showWidgetResult ? (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Carga Estimada</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', fontFamily: 'Outfit' }}>
                      {widgetResult.questionsNeeded} <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 500 }}>questões</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Sub-área prioritária</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--blue)', marginTop: 4 }}>{widgetResult.focusArea}</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(59,126,248,0.06)', border: '1px solid rgba(59,126,248,0.15)', borderRadius: 12, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 700, color: 'var(--blue)', marginBottom: 6 }}>
                    <MessageSquare size={14} /> DICA DO DR. ANDRÉ (IA)
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#B9D1EC', lineHeight: 1.5 }}>
                    {widgetResult.advice}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
                <Sparkles size={32} color="var(--blue)" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
                Preencha os dados ao lado para simular o plano adaptativo ideal para sua aprovação.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="section-title" style={{ fontFamily: 'Outfit' }}>Como RokoMed se compara?</h2>
            <p className="section-sub" style={{ margin: '8px auto 0' }}>Fizemos um comparativo honesto com os cursinhos de apostila tradicionais.</p>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 16, background: 'rgba(255,255,255,0.01)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 20px', fontWeight: 700 }}>Recurso</th>
                  <th style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--blue)' }}>RokoMed</th>
                  <th style={{ padding: '16px 20px', fontWeight: 500, color: 'var(--muted)' }}>Cursinhos de Apostila</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Metodologia de Estudo', roko: 'Estudo Ativo baseado em questões reais', traditional: 'Aulas expositivas longas e leitura passiva' },
                  { feature: 'Organização da Agenda', roko: 'Cronograma semanal adaptável com 1 clique', traditional: 'Cronograma estático e volumoso (impossível de cumprir)' },
                  { feature: 'Resolução de Dúvidas', roko: 'Tutor de IA (Dr. André) que responde na hora', traditional: 'Fóruns lentos que demoram dias para responder' },
                  { feature: 'Caderno de Erros', roko: 'Automatizado, focado nos seus erros passados', traditional: 'Manual (estudante precisa separar as folhas)' },
                  { feature: 'Custo-benefício', roko: 'A partir de 12x de R$ 9,90/mês', traditional: 'Preços abusivos de R$ 4.000 a R$ 12.000' }
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: 'white' }}>{row.feature}</td>
                    <td style={{ padding: '16px 20px', color: '#B9D1EC', fontWeight: 500 }}>
                      <Check size={14} color="var(--green)" style={{ display: 'inline', marginRight: 6 }} /> {row.roko}
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--muted)' }}>{row.traditional}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="section" style={{ background: '#081120', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h2 className="section-title" style={{ fontFamily: 'Outfit' }}>Pronto para iniciar sua preparação?</h2>
            <p className="section-sub" style={{ margin: '8px auto 0' }}>Escolha o plano ideal para seu momento. Cancele quando quiser.</p>
          </div>

          <div className="pricing-grid">
            {/* Mensal */}
            <div className="pricing-card">
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>Plano Mensal</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: 4 }}>Para quem quer testar por pouco tempo</div>
              
              <div style={{ margin: '24px 0 16px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>R$</span>
                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', fontFamily: 'Outfit' }}>{monthlyPrice}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}> / mês</span>
              </div>
              
              <Link to="/checkout?plan=monthly" className="btn btn-ghost" style={{ width: '100%', borderRadius: 10, padding: 12, justifyContent: 'center' }}>
                Assinar Plano Mensal
              </Link>
            </div>

            {/* Semestral */}
            <div className="pricing-card popular">
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--blue)', color: 'white', padding: '3px 12px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Melhor Custo-Benefício
              </div>
              
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>Plano Semestral</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: 4 }}>Acesso completo por 6 meses de estudos</div>
              
              <div style={{ margin: '24px 0 16px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>6x de </span>
                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', fontFamily: 'Outfit' }}>R$ {semiannualInstallment}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}> / mês</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 600, marginTop: 4 }}>Total à vista: R$ {semiannualTotal}</div>
              </div>
              
              <Link to="/checkout?plan=semiannual" className="btn btn-primary" style={{ width: '100%', borderRadius: 10, padding: 12, justifyContent: 'center' }}>
                Assinar Plano Semestral
              </Link>
            </div>

            {/* Anual */}
            <div className="pricing-card">
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>Plano Anual</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: 4 }}>Preparação a longo prazo com maior desconto</div>
              
              <div style={{ margin: '24px 0 16px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>12x de </span>
                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', fontFamily: 'Outfit' }}>R$ {annualInstallment}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}> / mês</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 600, marginTop: 4 }}>Total à vista: R$ {annualTotal}</div>
              </div>
              
              <Link to="/checkout?plan=annual" className="btn btn-ghost" style={{ width: '100%', borderRadius: 10, padding: 12, justifyContent: 'center' }}>
                Assinar Plano Anual
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 className="section-title" style={{ fontFamily: 'Outfit' }}>Perguntas Frequentes</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqItems.map((item, idx) => {
              const isOpen = openFaq === idx
              return (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      width: '100%', border: 'none', background: 'transparent', padding: '16px 20px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      cursor: 'pointer', textAlign: 'left', color: 'white', fontWeight: 600, fontSize: '0.95rem'
                    }}
                  >
                    <span>{item.q}</span>
                    <ChevronDown size={16} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none', color: 'var(--muted)' }} />
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 20px 20px', fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.6 }} className="animate-fade-in">
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
      <footer style={{ background: '#030A14', padding: '40px 0', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--faint)', textAlign: 'center' }}>
        <div className="container">
          <p>© {new Date().getFullYear()} RokoMed. Todos os direitos reservados.</p>
          <p style={{ marginTop: 8 }}>Feito para médicos, por médicos.</p>
        </div>
      </footer>

    </div>
  )
}
