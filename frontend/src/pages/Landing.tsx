import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, MessageCircle, Lock, Plus, Minus, ShieldCheck } from 'lucide-react'

export default function LandingPage() {
  const [showExitPopup, setShowExitPopup] = useState(false)
  const [hasTriggeredPopup, setHasTriggeredPopup] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  
  const [leadEmail, setLeadEmail] = useState('')
  const [loadingLead, setLoadingLead] = useState(false)

  const handleLeadCapture = async () => {
    if(!leadEmail.includes('@')) { alert('Por favor, insira um e-mail válido.'); return; }
    setLoadingLead(true)
    try {
      const api = (await import('../lib/api')).default
      await api.post('/auth/lead', { email: leadEmail })
      localStorage.setItem('rokomed_lead_email', leadEmail)
      window.location.href = '/simulado-gratis'
    } catch(e) {
      console.error(e)
      localStorage.setItem('rokomed_lead_email', leadEmail)
      window.location.href = '/simulado-gratis'
    }
  }

  useEffect(() => {
    document.title = 'RokoMed — Banco de Questões'
    
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasTriggeredPopup) {
        setShowExitPopup(true)
        setHasTriggeredPopup(true)
      }
    }
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [hasTriggeredPopup])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .lp-root *, .lp-root *::before, .lp-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .lp-root {
          --ink: #111111; --paper: #FAFAFA; --red: #C8102E; --rule: rgba(0,0,0,0.18); --muted: #525252;
          --display:'Abril Fatface', Georgia, serif;
          --body:  'Crimson Pro', Georgia, serif;
          --mono:  'IBM Plex Mono', monospace;
          font-family: var(--body);
          background: var(--paper);
          color: var(--ink);
          line-height: 1.5;
          overflow-x: hidden;
        }

        /* NAV */
        .lp-nav { display:flex; align-items:center; justify-content:space-between; padding:1.4rem 5vw; border-bottom:2px solid var(--ink); position:sticky; top:0; z-index:100; background:var(--paper); }
        .lp-logo { font-family:var(--display); font-size:1.35rem; color:var(--ink); text-decoration:none; }
        .lp-logo em { color:var(--red); font-style:normal; }
        .lp-nav-links { display:flex; gap:2.5rem; list-style:none; }
        .lp-nav-links a { font-family:var(--mono); font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase; color:var(--muted); text-decoration:none; transition:color .15s; }
        .lp-nav-links a:hover { color:var(--ink); }
        .lp-nav-cta { font-family:var(--mono); font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase; background:var(--ink); color:var(--paper); padding:0.55rem 1.3rem; text-decoration:none; transition:background .15s; }
        .lp-nav-cta:hover { background:var(--red); }

        /* HERO */
        .lp-hero { display:grid; grid-template-columns:1fr 1fr; min-height:88vh; border-bottom:2px solid var(--ink); }
        .lp-hero-left { padding:5vw; border-right:1px solid var(--rule); display:flex; flex-direction:column; justify-content:space-between; }
        .lp-hero-eyebrow { display:flex; align-items:center; gap:1rem; margin-bottom:3rem; }
        .lp-cross-icon { width:20px; height:20px; position:relative; flex-shrink:0; }
        .lp-cross-icon::before,.lp-cross-icon::after { content:''; position:absolute; background:var(--red); }
        .lp-cross-icon::before { width:20px; height:6px; top:7px; left:0; }
        .lp-cross-icon::after  { width:6px; height:20px; top:0; left:7px; }
        .lp-label { font-family:var(--mono); font-size:0.68rem; letter-spacing:0.14em; text-transform:uppercase; color:var(--muted); }
        .lp-h1 { font-family:var(--display); font-size:clamp(3.2rem,6.5vw,6rem); line-height:0.95; letter-spacing:-0.02em; color:var(--ink); flex:1; display:flex; flex-direction:column; justify-content:center; gap:0; }
        .lp-h1 .lp-red { color:var(--red); }
        .lp-hero-bottom { display:flex; flex-direction:column; gap:1.5rem; padding-top:3rem; border-top:1px solid var(--rule); }
        .lp-hero-desc { font-size:1.1rem; font-weight:300; color:var(--muted); line-height:1.7; max-width:440px; }
        .lp-hero-actions { display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap; }
        .lp-btn-ink { background:var(--ink); color:var(--paper); padding:.85rem 2rem; font-family:var(--mono); font-size:.75rem; letter-spacing:.1em; text-transform:uppercase; text-decoration:none; display:inline-block; transition:background .15s; }
        .lp-btn-ink:hover { background:var(--red); }
        .lp-btn-link { font-family:var(--mono); font-size:.7rem; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); text-decoration:none; border-bottom:1px solid var(--rule); padding-bottom:1px; transition:color .15s,border-color .15s; }
        .lp-btn-link:hover { color:var(--ink); border-color:var(--ink); }
        .lp-hero-note { font-family:var(--mono); font-size:.63rem; color:var(--muted); letter-spacing:.08em; }

        /* HERO RIGHT */
        .lp-hero-right { display:flex; flex-direction:column; }
        .lp-hero-price-block { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:4rem 3rem; border-bottom:1px solid var(--rule); position:relative; }
        .lp-price-label { font-family:var(--mono); font-size:.65rem; letter-spacing:.18em; text-transform:uppercase; color:var(--muted); margin-bottom:1.2rem; }
        .lp-price-big { font-family:var(--display); font-size:clamp(6rem,14vw,13rem); line-height:.85; color:var(--ink); letter-spacing:-.04em; }
        .lp-price-big sup { font-family:var(--body); font-weight:300; font-size:.22em; vertical-align:super; color:var(--muted); letter-spacing:0; }
        .lp-price-period { font-family:var(--body); font-weight:300; font-size:1rem; color:var(--muted); margin-top:.8rem; font-style:italic; }
        .lp-hero-stamp { position:absolute; bottom:2.5rem; right:2.5rem; width:86px; height:86px; border:2px solid var(--red); border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:.5rem; animation:lp-spin 22s linear infinite; }
        @keyframes lp-spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        .lp-hero-stamp span { font-family:var(--mono); font-size:.42rem; letter-spacing:.12em; text-transform:uppercase; color:var(--red); }
        .lp-hero-stamp .lp-sn { font-family:var(--display); font-size:1.3rem; color:var(--red); line-height:1; }
        .lp-hero-stats-row { display:grid; grid-template-columns:1fr 1fr; }
        .lp-hstat { padding:1.8rem; border-top:1px solid var(--rule); border-right:1px solid var(--rule); }
        .lp-hstat:nth-child(2n) { border-right:none; }
        .lp-hstat .lp-n { font-family:var(--display); font-size:2.2rem; line-height:1; color:var(--ink); margin-bottom:.3rem; }
        .lp-hstat .lp-n span { color:var(--red); }

        /* MARQUEE */
        .lp-mq-wrap { overflow:hidden; border-bottom:2px solid var(--ink); padding:.9rem 0; background:var(--ink); }
        .lp-mq-inner { display:flex; white-space:nowrap; animation:lp-mq 28s linear infinite; }
        .lp-mq-inner span { font-family:var(--mono); font-size:.7rem; letter-spacing:.12em; text-transform:uppercase; color:rgba(255,255,255,.7); padding:0 2rem; }
        .lp-mq-inner .lp-dot { color:var(--red); opacity:1; font-size:1rem; padding:0 .5rem; }
        @keyframes lp-mq { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        /* FEATURES */
        .lp-feat-section { display:grid; grid-template-columns:260px 1fr; border-bottom:2px solid var(--ink); }
        .lp-feat-sidebar { padding:4rem 3rem; border-right:2px solid var(--ink); display:flex; flex-direction:column; gap:2rem; }
        .lp-sec-num { font-family:var(--display); font-size:5rem; line-height:1; -webkit-text-stroke:1px var(--red); color:transparent; }
        .lp-sec-h { font-family:var(--display); font-size:2rem; line-height:1.05; letter-spacing:-.02em; }
        .lp-feat-grid { display:grid; grid-template-columns:1fr 1fr 1fr; }
        .lp-fi { padding:3rem 2.5rem; border-bottom:1px solid var(--rule); border-right:1px solid var(--rule); transition:background .2s; }
        .lp-fi:nth-child(3n) { border-right:none; }
        .lp-fi:nth-last-child(-n+3) { border-bottom:none; }
        .lp-fi:hover { background:rgba(188,42,26,.03); }
        .lp-fi-num { font-family:var(--mono); font-size:.63rem; letter-spacing:.14em; color:var(--muted); margin-bottom:1.5rem; }
        .lp-fi h3 { font-family:var(--display); font-size:1.25rem; color:var(--ink); margin-bottom:.7rem; line-height:1.1; }
        .lp-fi p { font-size:.95rem; font-weight:300; color:var(--muted); line-height:1.65; }

        /* SPECIALTIES */
        .lp-spec-section { display:grid; grid-template-columns:1fr 1fr; border-bottom:2px solid var(--ink); }
        .lp-spec-left { padding:5rem 4rem; border-right:2px solid var(--ink); display:flex; flex-direction:column; justify-content:space-between; }
        .lp-spec-left h2 { font-family:var(--display); font-size:clamp(2.4rem,4vw,3.6rem); line-height:1; letter-spacing:-.02em; }
        .lp-spec-left h2 em { font-style:italic; color:var(--red); }
        .lp-spec-count { display:flex; align-items:baseline; gap:.6rem; padding-top:2rem; border-top:1px solid var(--rule); }
        .lp-bignum { font-family:var(--display); font-size:3.5rem; line-height:1; color:var(--ink); }
        .lp-bignum span { color:var(--red); }
        .lp-spec-right { padding:3.5rem 3rem; display:flex; flex-direction:column; justify-content:center; }
        .lp-spec-tags { display:flex; flex-wrap:wrap; gap:.5rem; margin-top:1.5rem; }
        .lp-stag { font-family:var(--mono); font-size:.66rem; letter-spacing:.08em; padding:.38rem .8rem; border:1px solid var(--rule); color:var(--muted); transition:all .15s; cursor:default; text-transform:uppercase; }
        .lp-stag:hover,.lp-stag.lp-hi { background:var(--ink); color:var(--paper); border-color:var(--ink); }
        .lp-stag.lp-hir { background:var(--red); color:var(--paper); border-color:var(--red); }

        /* PRICING */
        .lp-price-section { border-bottom:2px solid var(--ink); }
        .lp-price-hdr { padding:4rem 5vw 3rem; border-bottom:1px solid var(--rule); display:flex; align-items:flex-end; justify-content:space-between; gap:2rem; flex-wrap:wrap; }
        .lp-price-hdr h2 { font-family:var(--display); font-size:clamp(2.5rem,5vw,4rem); letter-spacing:-.02em; line-height:1; }
        .lp-price-hdr p { font-size:1rem; font-weight:300; color:var(--muted); font-style:italic; max-width:280px; }
        .lp-pcards { display:grid; grid-template-columns:1fr 1fr 1fr; }
        .lp-pc { padding:3.5rem 3rem; border-right:1px solid var(--rule); display:flex; flex-direction:column; gap:2rem; position:relative; transition:background .2s; }
        .lp-pc:last-child { border-right:none; }
        .lp-pc:hover { background:rgba(15,12,7,.02); }
        .lp-pc.lp-feat { background:var(--ink); color:var(--paper); }
        .lp-pc-lbl { font-family:var(--mono); font-size:.63rem; letter-spacing:.16em; text-transform:uppercase; color:var(--muted); }
        .lp-pc.lp-feat .lp-pc-lbl { color:rgba(255,255,255,.5); }
        .lp-pc-price { display:flex; align-items:baseline; gap:.3rem; }
        .lp-pc-price .lp-cur { font-family:var(--body); font-weight:300; font-size:1.1rem; color:var(--muted); }
        .lp-pc.lp-feat .lp-pc-price .lp-cur { color:rgba(255,255,255,.5); }
        .lp-pc-price .lp-amt { font-family:var(--display); font-size:4rem; line-height:.9; letter-spacing:-.03em; }
        .lp-pc-price .lp-per { font-family:var(--body); font-weight:300; font-style:italic; font-size:.85rem; color:var(--muted); }
        .lp-pc.lp-feat .lp-pc-price .lp-per { color:rgba(255,255,255,.5); }
        hr.lp-r { border:none; border-top:1px solid var(--rule); }
        .lp-pc.lp-feat hr.lp-r { border-color:rgba(255,255,255,.2); }
        .lp-pc-feats { list-style:none; display:flex; flex-direction:column; gap:.65rem; flex:1; }
        .lp-pc-feats li { font-size:.9rem; font-weight:300; color:var(--muted); display:flex; align-items:flex-start; gap:.6rem; line-height:1.4; }
        .lp-pc.lp-feat .lp-pc-feats li { color:rgba(255,255,255,.9); }
        .lp-pc-feats li::before { content:'—'; font-family:var(--mono); font-size:.7rem; color:var(--red); flex-shrink:0; margin-top:.12rem; }
        .lp-pc.lp-feat .lp-pc-feats li::before { color:#60A5FA; }
        .lp-pc-btn { display:block; text-align:center; padding:.85rem; font-family:var(--mono); font-size:.7rem; letter-spacing:.1em; text-transform:uppercase; text-decoration:none; transition:all .15s; }
        .lp-pc-btn-out { border:1px solid var(--rule); color:var(--muted); }
        .lp-pc-btn-out:hover { border-color:var(--ink); color:var(--ink); }
        .lp-pc-btn-ppr { background:var(--paper); color:var(--ink); }
        .lp-pc-btn-ppr:hover { background:var(--red); color:var(--paper); }
        .lp-pflag { position:absolute; top:3.5rem; right:0; background:var(--red); color:var(--paper); font-family:var(--mono); font-size:.58rem; letter-spacing:.12em; text-transform:uppercase; padding:.3rem .55rem; writing-mode:vertical-rl; transform:rotate(180deg); }

        /* TESTIMONIALS */
        .lp-testi-s { border-bottom:2px solid var(--ink); }
        .lp-testi-hdr { padding:4rem 5vw 2rem; display:flex; align-items:baseline; justify-content:space-between; border-bottom:1px solid var(--rule); }
        .lp-testi-hdr h2 { font-family:var(--display); font-size:clamp(2rem,3.5vw,2.8rem); letter-spacing:-.02em; }
        .lp-tgrid { display:grid; grid-template-columns:1fr 1fr 1fr; }
        .lp-titem { padding:3rem 2.5rem; border-right:1px solid var(--rule); display:flex; flex-direction:column; gap:1.5rem; }
        .lp-titem:last-child { border-right:none; }
        .lp-tq { font-size:1rem; font-style:italic; font-weight:300; color:var(--ink); line-height:1.7; flex:1; }
        .lp-tmeta { border-top:1px solid var(--rule); padding-top:1.2rem; }
        .lp-tmeta .lp-name { font-family:var(--mono); font-size:.7rem; letter-spacing:.1em; text-transform:uppercase; color:var(--ink); margin-bottom:.25rem; }
        .lp-tmeta .lp-role { font-size:.82rem; color:var(--muted); font-style:italic; }

        /* FINAL CTA */
        .lp-cta-s { display:grid; grid-template-columns:1fr auto; align-items:center; gap:3rem; padding:6rem 5vw; border-bottom:2px solid var(--ink); }
        .lp-cta-s h2 { font-family:var(--display); font-size:clamp(3rem,6vw,5.5rem); line-height:.95; letter-spacing:-.03em; }
        .lp-cta-s h2 em { color:var(--red); font-style:italic; }
        .lp-cta-r { display:flex; flex-direction:column; align-items:flex-end; gap:1.2rem; flex-shrink:0; }
        .lp-cta-r .lp-note { font-family:var(--mono); font-size:.62rem; letter-spacing:.1em; color:var(--muted); text-transform:uppercase; text-align:right; }

        /* MEGA FOOTER */
        .lp-mfooter { background:#0d0d14; color:rgba(255,255,255,.75); padding:4rem 5vw 0; border-top:2px solid var(--ink); }
        .lp-mfooter-grid { display:grid; grid-template-columns:220px repeat(4,1fr); gap:3rem; padding-bottom:3rem; border-bottom:1px solid rgba(255,255,255,.08); }
        .lp-mfooter-brand { display:flex; flex-direction:column; gap:1.5rem; }
        .lp-mfooter-logo { font-family:var(--display); font-size:1.5rem; color:#fff; text-decoration:none; }
        .lp-mfooter-logo em { color:var(--red); font-style:normal; }
        .lp-mfooter-tagline { font-size:.82rem; font-weight:300; color:#a8a29e; line-height:1.6; }
        .lp-mfooter-badges { display:flex; flex-direction:column; gap:.6rem; }
        .lp-mfooter-badge { display:flex; align-items:center; gap:.6rem; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.15); padding:.5rem .9rem; border-radius:8px; text-decoration:none; transition:background .15s; cursor:pointer; }
        .lp-mfooter-badge:hover { background:rgba(255,255,255,.13); }
        .lp-mfooter-badge svg { flex-shrink:0; }
        .lp-mfooter-badge-text { display:flex; flex-direction:column; }
        .lp-mfooter-badge-text span:first-child { font-family:var(--mono); font-size:.52rem; letter-spacing:.1em; text-transform:uppercase; color:#a8a29e; }
        .lp-mfooter-badge-text span:last-child { font-family:var(--body); font-size:.85rem; color:#fff; font-weight:400; }
        .lp-mfooter-col h4 { font-family:var(--mono); font-size:.65rem; letter-spacing:.16em; text-transform:uppercase; color:#a8a29e; margin-bottom:1.2rem; }
        .lp-mfooter-col ul { list-style:none; display:flex; flex-direction:column; gap:.75rem; }
        .lp-mfooter-col ul li a { font-size:.9rem; font-weight:300; color:#d6d3d1; text-decoration:none; transition:color .15s; }
        .lp-mfooter-col ul li a:hover { color:#fff; }
        .lp-mfooter-col ul li a.lp-mf-hi { color:#f87171; }
        .lp-mfooter-bar { padding:1.2rem 0; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
        .lp-mfooter-bar p { font-family:var(--mono); font-size:.6rem; letter-spacing:.08em; text-transform:uppercase; color:#a8a29e; }
        .lp-mfooter-bar ul { display:flex; gap:1.5rem; list-style:none; }
        .lp-mfooter-bar ul a { font-family:var(--mono); font-size:.6rem; letter-spacing:.1em; text-transform:uppercase; color:#a8a29e; text-decoration:none; transition:color .15s; }
        .lp-mfooter-bar ul a:hover { color:#e7e5e4; }
        @media(max-width:900px){ .lp-mfooter-grid { grid-template-columns:1fr 1fr; } }

        /* COMPARISON TABLE */
        .lp-comp-s { padding: 5rem 5vw; border-bottom: 2px solid var(--ink); background: var(--paper); }
        .lp-comp-hdr { text-align: center; margin-bottom: 3rem; }
        .lp-comp-hdr h2 { font-family: var(--display); font-size: clamp(2rem, 4vw, 3rem); line-height: 1; }
        .lp-comp-table { width: 100%; max-width: 900px; margin: 0 auto; border-collapse: collapse; border: 2px solid var(--ink); background: white; }
        .lp-comp-table th, .lp-comp-table td { padding: 1.5rem 1rem; border: 1px solid var(--rule); text-align: center; font-size: 0.95rem; }
        .lp-comp-table th { font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.8rem; background: var(--ink); color: var(--paper); border-color: var(--ink); }
        .lp-comp-table th:first-child { background: var(--paper); color: var(--ink); text-align: left; border-right: 2px solid var(--ink); border-bottom: 2px solid var(--ink); }
        .lp-comp-table td:first-child { text-align: left; font-weight: 500; font-family: var(--body); border-right: 2px solid var(--ink); }
        .lp-comp-table tr:last-child td { border-bottom: none; }
        .lp-comp-table .lp-check { color: var(--red); font-weight: bold; font-family: var(--mono); }
        .lp-comp-table .lp-cross { color: var(--muted); opacity: 0.5; font-family: var(--mono); }

        /* FAQ */
        .lp-faq-s { padding: 5rem 5vw; border-bottom: 2px solid var(--ink); display: grid; grid-template-columns: 1fr 2fr; gap: 4rem; }
        .lp-faq-hdr h2 { font-family: var(--display); font-size: clamp(2rem, 4vw, 3rem); line-height: 1; }
        .lp-faq-item { border-bottom: 1px solid var(--rule); }
        .lp-faq-item:first-child { border-top: 1px solid var(--rule); }
        .lp-faq-q { width: 100%; text-align: left; padding: 1.5rem 0; background: none; border: none; font-family: var(--body); font-size: 1.1rem; color: var(--ink); cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
        .lp-faq-a { padding-bottom: 1.5rem; font-size: 0.95rem; color: var(--muted); line-height: 1.6; display: none; }
        .lp-faq-item.open .lp-faq-a { display: block; }

        /* WHATSAPP BTN */
        .lp-wa-btn { position: fixed; bottom: 2rem; right: 2rem; background: #25D366; color: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(37,211,102,0.4); z-index: 99; transition: transform 0.2s; }
        .lp-wa-btn:hover { transform: scale(1.1); }

        /* POPUP */
        .lp-popup-overlay { position: fixed; inset: 0; background: rgba(17,17,17,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(4px); }
        .lp-popup { background: var(--paper); border: 2px solid var(--ink); padding: 3rem; max-width: 500px; width: 100%; position: relative; text-align: center; box-shadow: 12px 12px 0px 0px rgba(17,17,17,1); }
        .lp-popup-close { position: absolute; top: 1rem; right: 1rem; background: none; border: none; cursor: pointer; color: var(--muted); transition: color 0.2s; }
        .lp-popup-close:hover { color: var(--ink); }

        @media(max-width:900px){
          .lp-hero,.lp-spec-section,.lp-cta-s { grid-template-columns:1fr; }
          .lp-hero-right,.lp-spec-left { display:none; }
          .lp-feat-section { grid-template-columns:1fr; }
          .lp-feat-sidebar { border-right:none; border-bottom:1px solid var(--rule); padding:3rem 5vw; }
          .lp-feat-grid,.lp-pcards,.lp-tgrid { grid-template-columns:1fr; }
          .lp-fi { border-right:none; }
          .lp-pc { border-right:none; border-bottom:1px solid var(--rule); }
          .lp-titem { border-right:none; border-bottom:1px solid var(--rule); }
          .lp-cta-r { align-items:flex-start; }
          .lp-nav-links { display:none; }
        }
      `}</style>

      <div className="lp-root">
        <nav className="lp-nav">
          <a href="#" className="lp-logo">Roko<em>Med</em></a>
          <ul className="lp-nav-links">
            <li><a href="#recursos">Recursos</a></li>
            <li><a href="#especialidades">Especialidades</a></li>
            <li><a href="#planos">Planos</a></li>
            <li><a href="#depoimentos">Depoimentos</a></li>
            <li><a href="/parcerias">Parcerias</a></li>
          </ul>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/login" className="lp-nav-cta" style={{ background: 'transparent', color: 'var(--ink)', border: '1px solid var(--ink)' }}>Entrar</Link>
            <a href="#planos" className="lp-nav-cta">Assinar</a>
          </div>
        </nav>

        <section className="lp-hero">
          <div className="lp-hero-left">
            <div className="lp-hero-eyebrow">
              <div className="lp-cross-icon"></div>
              <span className="lp-label">Banco de Questões · Residência Médica</span>
            </div>
            <h1 className="lp-h1">
              <span>Passe na</span>
              <span className="lp-red">residência</span>
              <span>na primeira</span>
              <span>tentativa.</span>
            </h1>
            <div className="lp-hero-bottom">
              <p className="lp-hero-desc">Mais de 15.000 questões comentadas, simulados adaptativos e análise de desempenho por especialidade. Tudo que você precisa, sem o que você não precisa.</p>
              <div className="lp-hero-actions">
                <Link to="/checkout" className="lp-btn-ink">Começar por R$29/mês</Link>
                <a href="#recursos" className="lp-btn-link">Ver recursos →</a>
              </div>
              <p className="lp-hero-note">Sem taxa de adesão · Acesso imediato · Cancele quando quiser</p>
            </div>
          </div>

          <div className="lp-hero-right">
            <div className="lp-hero-price-block">
              <div className="lp-price-label">A partir de</div>
              <div className="lp-price-big"><sup>R$</sup>29</div>
              <div className="lp-price-period">por mês</div>
              <div className="lp-hero-stamp">
                <span>mais de</span>
                <span className="lp-sn">8k</span>
                <span>aprovados</span>
              </div>
            </div>
            <div className="lp-hero-stats-row">
              <div className="lp-hstat"><div className="lp-n">15<span>k+</span></div><div className="lp-label">Questões comentadas</div></div>
              <div className="lp-hstat"><div className="lp-n">40<span>+</span></div><div className="lp-label">Especialidades</div></div>
              <div className="lp-hstat"><div className="lp-n">98<span>%</span></div><div className="lp-label">Taxa de aprovação</div></div>
              <div className="lp-hstat"><div className="lp-n">5<span>★</span></div><div className="lp-label">Avaliação média</div></div>
            </div>
          </div>
        </section>

        <div className="lp-mq-wrap" aria-hidden="true">
          <div className="lp-mq-inner">
            <span>Clínica Médica</span><span className="lp-dot">·</span><span>Cirurgia Geral</span><span className="lp-dot">·</span><span>Pediatria</span><span className="lp-dot">·</span><span>GO</span><span className="lp-dot">·</span><span>Med. Preventiva</span><span className="lp-dot">·</span><span>Cardiologia</span><span className="lp-dot">·</span><span>Neurologia</span><span className="lp-dot">·</span><span>Ortopedia</span><span className="lp-dot">·</span><span>Psiquiatria</span><span className="lp-dot">·</span><span>Dermatologia</span><span className="lp-dot">·</span><span>Infectologia</span><span className="lp-dot">·</span><span>Endocrinologia</span><span className="lp-dot">·</span><span>Pneumologia</span><span className="lp-dot">·</span><span>Nefrologia</span><span className="lp-dot">·</span>
            <span>Clínica Médica</span><span className="lp-dot">·</span><span>Cirurgia Geral</span><span className="lp-dot">·</span><span>Pediatria</span><span className="lp-dot">·</span><span>GO</span><span className="lp-dot">·</span><span>Med. Preventiva</span><span className="lp-dot">·</span><span>Cardiologia</span><span className="lp-dot">·</span><span>Neurologia</span><span className="lp-dot">·</span><span>Ortopedia</span><span className="lp-dot">·</span><span>Psiquiatria</span><span className="lp-dot">·</span><span>Dermatologia</span><span className="lp-dot">·</span><span>Infectologia</span><span className="lp-dot">·</span><span>Endocrinologia</span><span className="lp-dot">·</span><span>Pneumologia</span><span className="lp-dot">·</span><span>Nefrologia</span><span className="lp-dot">·</span>
          </div>
        </div>

        <section className="lp-feat-section" id="recursos">
          <div className="lp-feat-sidebar">
            <div className="lp-sec-num">01</div>
            <h2 className="lp-sec-h">Por que o RokoMed funciona</h2>
            <p style={{fontSize:'.93rem',fontWeight:300,color:'var(--muted)',lineHeight:1.7,fontStyle:'italic'}}>Construído por médicos que passaram pela residência. Cada detalhe pensado para o candidato real.</p>
          </div>
          <div className="lp-feat-grid">
            <div className="lp-fi"><div className="lp-fi-num">001</div><h3>Banco completo e comentado</h3><p>Questões de provas reais das principais bancas do Brasil com gabarito detalhado e fundamentação científica atualizada.</p></div>
            <div className="lp-fi"><div className="lp-fi-num">002</div><h3>Simulados adaptativos</h3><p>A plataforma aprende seus pontos fracos e monta simulados personalizados. Mais eficiência, menos tempo desperdiçado.</p></div>
            <div className="lp-fi"><div className="lp-fi-num">003</div><h3>Desempenho em tempo real</h3><p>Progresso por especialidade e tema. Veja onde você está em relação aos outros candidatos.</p></div>
            <div className="lp-fi"><div className="lp-fi-num">004</div><h3>Filtros por banca e ano</h3><p>Treine exatamente para a sua prova. Filtre por instituição, ano, dificuldade ou tema específico.</p></div>
            <div className="lp-fi"><div className="lp-fi-num">005</div><h3>Acesse de qualquer lugar</h3><p>Funciona no celular, tablet ou computador. Ideal para estudar no plantão, no metrô, em qualquer lugar.</p></div>
            <div className="lp-fi"><div className="lp-fi-num">006</div><h3>Sempre atualizado</h3><p>Novas questões adicionadas semanalmente. As últimas provas entram na plataforma logo após a aplicação.</p></div>
          </div>
        </section>

        <section className="lp-spec-section" id="especialidades">
          <div className="lp-spec-left">
            <div>
              <div className="lp-sec-num">02</div>
              <h2>Todas as <em>especialidades</em> que você precisa</h2>
            </div>
            <div className="lp-spec-count">
              <div className="lp-bignum">40<span>+</span></div>
              <div>
                <div className="lp-label">especialidades</div>
                <div style={{fontSize:'.9rem',color:'var(--muted)',fontStyle:'italic',fontWeight:300}}>das grandes áreas às subespecialidades</div>
              </div>
            </div>
          </div>
          <div className="lp-spec-right">
            <div className="lp-label">Principais especialidades</div>
            <div className="lp-spec-tags">
              <span className="lp-stag lp-hir">Clínica Médica</span><span className="lp-stag lp-hir">Cirurgia Geral</span><span className="lp-stag lp-hir">Pediatria</span><span className="lp-stag lp-hir">GO</span><span className="lp-stag lp-hir">Med. Preventiva</span>
              <span className="lp-stag lp-hi">Cardiologia</span><span className="lp-stag lp-hi">Neurologia</span><span className="lp-stag lp-hi">Ortopedia</span>
              <span className="lp-stag">Psiquiatria</span><span className="lp-stag">Dermatologia</span><span className="lp-stag">Infectologia</span><span className="lp-stag">Endocrinologia</span><span className="lp-stag">Gastroenterologia</span><span className="lp-stag">Pneumologia</span><span className="lp-stag">Nefrologia</span><span className="lp-stag">Reumatologia</span><span className="lp-stag">Hematologia</span><span className="lp-stag">Oftalmologia</span><span className="lp-stag">ORL</span><span className="lp-stag">Urologia</span><span className="lp-stag">Oncologia</span><span className="lp-stag">Anestesiologia</span>
            </div>
          </div>
        </section>

        <section className="lp-comp-s">
          <div className="lp-comp-hdr">
            <div className="lp-label" style={{marginBottom:'1rem'}}>O Fim do Cursinho Tradicional</div>
            <h2>Nós vs. Eles</h2>
          </div>
          <div style={{overflowX: 'auto', paddingBottom: '1rem'}}>
            <table className="lp-comp-table">
              <thead>
                <tr>
                  <th>Comparativo</th>
                  <th>Cursinhos Gigantes</th>
                  <th style={{background:'var(--red)'}}>RokoMed</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Preço Médio Anual</td>
                  <td>R$ 6.500 a R$ 9.000</td>
                  <td style={{fontWeight:'bold'}}>A partir de R$ 180</td>
                </tr>
                <tr>
                  <td>Foco do Estudo</td>
                  <td>Aulas teóricas de 2 horas</td>
                  <td>Prática ativa e direta</td>
                </tr>
                <tr>
                  <td>Comentários das Questões</td>
                  <td>Longos e prolixos</td>
                  <td>Diretos ao ponto</td>
                </tr>
                <tr>
                  <td>Simulados com IA</td>
                  <td><span className="lp-cross">✖ Não possui</span></td>
                  <td><span className="lp-check">✔ Sim</span></td>
                </tr>
                <tr>
                  <td>Cancelamento</td>
                  <td>Multas absurdas</td>
                  <td><span className="lp-check">✔ Cancele quando quiser</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="lp-testi-s" id="depoimentos">
          <div className="lp-testi-hdr">
            <div>
              <div className="lp-sec-num" style={{fontSize:'3rem',marginBottom:'.3rem'}}>03</div>
              <h2>O que dizem<br />quem já passou</h2>
            </div>
            <div style={{fontFamily:'var(--display)',fontSize:'6rem',color:'var(--red)',opacity:.12,lineHeight:1,userSelect:'none'}}>"</div>
          </div>
          <div className="lp-tgrid">
            <div className="lp-titem">
              <p className="lp-tq">"Estudei com outros bancos antes, mas o RokoMed é outro nível. Os comentários são didáticos e os simulados me ajudaram a entender exatamente onde eu errava."</p>
              <div className="lp-tmeta"><div className="lp-name">Carolina M.</div><div className="lp-role">Aprovada em 1º Lugar — Clínica Médica</div></div>
            </div>
            <div className="lp-titem">
              <p className="lp-tq">"Em 4 meses usando a plataforma minha nota nos simulados subiu 18 pontos. A análise de desempenho por tema é o diferencial que faz toda a diferença."</p>
              <div className="lp-tmeta"><div className="lp-name">Rafael L.</div><div className="lp-role">Aprovado na 1ª Opção — Cirurgia Geral</div></div>
            </div>
            <div className="lp-titem">
              <p className="lp-tq">"Usei no celular durante a madrugada no plantão. As questões curtas e os comentários objetivos encaixaram perfeitamente na minha rotina."</p>
              <div className="lp-tmeta"><div className="lp-name">Thais F.</div><div className="lp-role">Aprovada entre os Top 5 — Pediatria</div></div>
            </div>
          </div>
        </section>

        <section className="lp-price-section" id="planos">
          <div className="lp-price-hdr">
            <div>
              <div className="lp-sec-num" style={{fontSize:'3rem',marginBottom:'.4rem'}}>04</div>
              <h2>Planos e preços</h2>
              <div style={{background:'rgba(29, 78, 216, 0.1)', padding:'0.5rem 1rem', display:'inline-block', border:'1px solid var(--red)', marginTop:'1rem'}}>
                <span style={{fontFamily:'var(--mono)', fontSize:'0.7rem', color:'var(--red)', textTransform:'uppercase', letterSpacing:'0.1em'}}>
                  ⚡ Aproveite os R$ 19 mensais antes do reajuste da nova versão!
                </span>
              </div>
            </div>
            <p>
              Um cursinho tradicional custa R$ 8.500. O RokoMed custa menos que um lanche por mês para te garantir a vaga que vai mudar sua vida.
            </p>
          </div>
          <div className="lp-pcards">
            <div className="lp-pc">
              <div className="lp-pc-lbl">Mensal</div>
              <div className="lp-pc-price"><span className="lp-cur">R$</span><span className="lp-amt">29</span><span className="lp-per">/mês</span></div>
              <div style={{fontFamily:'var(--body)', fontWeight:300, fontStyle:'italic', fontSize:'0.85rem', color:'var(--muted)', marginTop:'0.2rem'}}>renovação automática</div>
              <hr className="lp-r" style={{marginTop:'0.8rem'}} />
              <ul className="lp-pc-feats">
                <li>Acesso a todo o banco de questões</li>
                <li>Simulados por especialidade</li>
                <li>Gabaritos comentados</li>
                <li>Cancele quando quiser</li>
              </ul>
              <Link to="/checkout?plan=monthly" className="lp-pc-btn lp-pc-btn-out">Começar agora →</Link>
            </div>
            <div className="lp-pc lp-feat">
              <span className="lp-pflag" style={{ background: '#FFC107', color: '#000', fontWeight: 'bold', fontSize: '0.65rem', padding: '0.4rem 0.8rem', boxShadow: '0 4px 12px rgba(255, 193, 7, 0.4)' }}>Mais Vendido</span>
              <div className="lp-pc-lbl">Semestral</div>
              <div className="lp-pc-price" style={{alignItems:'baseline'}}>
                <span className="lp-cur">6x</span><span className="lp-cur" style={{marginLeft:'0.3rem'}}>R$</span><span className="lp-amt">19</span>
              </div>
              <div style={{fontFamily:'var(--body)', fontWeight:300, fontStyle:'italic', fontSize:'0.85rem', color:'rgba(255,255,255,0.5)', marginTop:'0.2rem'}}>ou à vista por R$ 97</div>
              <div style={{fontFamily:'var(--mono)', fontSize:'0.65rem', color:'#60A5FA', marginTop:'0.5rem', textTransform:'uppercase', letterSpacing:'0.05em', display:'flex', alignItems:'center', gap:'0.3rem'}}>
                <ShieldCheck size={14}/> 7 dias de garantia
              </div>
              <hr className="lp-r" style={{marginTop:'0.8rem'}} />
              <ul className="lp-pc-feats">
                <li>Tudo do plano Mensal</li>
                <li>Simulados personalizados por IA</li>
                <li>Filtro avançado por banca e ano</li>
                <li style={{color:'#FFC107', fontWeight:600}}>🎁 Bônus: Planilha de Revisão Espaçada</li>
              </ul>
              <Link to="/checkout?plan=semiannual" className="lp-pc-btn lp-pc-btn-ppr">Economizar 34% →</Link>
            </div>
            <div className="lp-pc">
              <div className="lp-pc-lbl">Anual</div>
              <div className="lp-pc-price" style={{alignItems:'baseline'}}>
                <span className="lp-cur">12x</span><span className="lp-cur" style={{marginLeft:'0.3rem'}}>R$</span><span className="lp-amt">15</span>
              </div>
              <div style={{fontFamily:'var(--body)', fontWeight:300, fontStyle:'italic', fontSize:'0.85rem', color:'var(--muted)', marginTop:'0.2rem'}}>ou à vista por R$ 147</div>
              <div style={{fontFamily:'var(--mono)', fontSize:'0.65rem', color:'var(--red)', marginTop:'0.5rem', textTransform:'uppercase', letterSpacing:'0.05em', display:'flex', alignItems:'center', gap:'0.3rem'}}>
                <ShieldCheck size={14}/> 7 dias de garantia
              </div>
              <hr className="lp-r" style={{marginTop:'0.8rem'}} />
              <ul className="lp-pc-feats">
                <li>Tudo do plano Semestral</li>
                <li>Acesso antecipado a novos recursos</li>
                <li>Flashcards integrados</li>
                <li style={{color:'var(--ink)', fontWeight:600}}>🎁 Bônus: Guia 100 Temas SUS-SP</li>
              </ul>
              <Link to="/checkout?plan=annual" className="lp-pc-btn lp-pc-btn-out">Melhor custo-benefício →</Link>
            </div>
          </div>
          
          <div style={{textAlign:'center', padding:'2rem', borderTop:'1px solid var(--rule)', display:'flex', alignItems:'center', justifyContent:'center', gap:'2rem', flexWrap:'wrap'}}>
            <div style={{display:'flex', alignItems:'center', gap:'0.5rem', fontFamily:'var(--mono)', fontSize:'0.7rem', color:'var(--muted)', textTransform:'uppercase'}}>
              <Lock size={16} /> Compra 100% Segura
            </div>
            <div style={{display:'flex', alignItems:'center', gap:'0.5rem', fontFamily:'var(--mono)', fontSize:'0.7rem', color:'var(--muted)', textTransform:'uppercase'}}>
              <ShieldCheck size={16} /> Pagamento via Mercado Pago
            </div>
            <div style={{display:'flex', alignItems:'center', gap:'0.5rem', fontFamily:'var(--mono)', fontSize:'0.7rem', color:'var(--muted)', textTransform:'uppercase'}}>
              Acesso Liberado na Hora
            </div>
          </div>
        </section>

        <section className="lp-faq-s">
          <div className="lp-faq-hdr">
            <h2>Perguntas Frequentes</h2>
            <p style={{marginTop:'1rem', color:'var(--muted)'}}>Ficou alguma dúvida? Nós te ajudamos.</p>
          </div>
          <div>
            {[
              {q: "Tem aplicativo para celular?", a: "Sim! Nossa plataforma é totalmente responsiva e pode ser salva como aplicativo na tela inicial do seu celular (PWA), funcionando perfeitamente para você estudar nos plantões."},
              {q: "As questões são atualizadas?", a: "Nossa equipe adiciona as provas mais recentes semanalmente. Logo que uma banca aplica a prova, nossa equipe já trabalha na correção comentada."},
              {q: "Como funciona a garantia de 7 dias?", a: "Se você assinar o plano Semestral ou Anual e não gostar, basta nos mandar um único e-mail dentro de 7 dias e devolvemos 100% do seu dinheiro, sem letras miúdas."},
              {q: "Posso cancelar quando quiser?", a: "Sim, o cancelamento da renovação pode ser feito a qualquer momento com apenas 2 cliques direto pelo seu painel, sem precisar falar com atendentes."}
            ].map((faq, i) => (
              <div key={i} className={`lp-faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="lp-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {faq.q}
                  {openFaq === i ? <Minus size={18}/> : <Plus size={18}/>}
                </button>
                <div className="lp-faq-a">{faq.a}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="lp-cta-s">
          <h2>Sua vaga na residência<br />começa <em>hoje.</em></h2>
          <div className="lp-cta-r">
            <Link to="/checkout" className="lp-btn-ink" style={{fontSize:'.78rem',padding:'1rem 2.5rem'}}>Começar por R$29/mês</Link>
            <p className="lp-note">Acesso imediato · Sem compromisso</p>
            <p className="lp-note">+8.000 médicos aprovados</p>
          </div>
        </section>

        <footer className="lp-mfooter">
          <div className="lp-mfooter-grid">
            {/* Brand */}
            <div className="lp-mfooter-brand">
              <a href="#" className="lp-mfooter-logo">Roko<em>Med</em></a>
              <p className="lp-mfooter-tagline">O banco de questões mais objetivo do Brasil para quem quer passar na residência médica na primeira tentativa.</p>
              <div className="lp-mfooter-badges">
                <a href="#" className="lp-mfooter-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  <div className="lp-mfooter-badge-text">
                    <span>Disponível na</span>
                    <span>App Store</span>
                  </div>
                </a>
                <a href="#" className="lp-mfooter-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M3.18 23.76c.3.17.64.24.99.2l.06-.03 11.2-6.47-2.41-2.41-9.84 8.71zm-1.1-20.1A1.5 1.5 0 0 0 2 4.5v15a1.5 1.5 0 0 0 .08.5l9.36-9.36-9.36-7.98zm19.9 8.51-2.72-1.57-2.7 2.7 2.7 2.7 2.74-1.58a1.5 1.5 0 0 0 0-2.25zM4.17.28a1.5 1.5 0 0 0-.99.2L12 8.35l2.41-2.41L4.23.31l-.06-.03z"/></svg>
                  <div className="lp-mfooter-badge-text">
                    <span>Disponível no</span>
                    <span>Google Play</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Col 1 */}
            <div className="lp-mfooter-col">
              <h4>Plataforma</h4>
              <ul>
                <li><a href="#planos" className="lp-mf-hi">Assinar agora</a></li>
                <li><a href="#recursos">Banco de Questões</a></li>
                <li><a href="#recursos">Simulados Adaptativos</a></li>
                <li><a href="#especialidades">Especialidades</a></li>
                <li><a href="/simulado-gratis">Teste grátis</a></li>
                <li><a href="/checkout">Planos e Preços</a></li>
              </ul>
            </div>

            {/* Col 2 */}
            <div className="lp-mfooter-col">
              <h4>Parcerias</h4>
              <ul>
                <li><a href="/parcerias">Visão geral</a></li>
                <li><a href="/parcerias#atleticas">Parcerias Atléticas</a></li>
                <li><a href="/parcerias#embaixadores">Embaixadores</a></li>
                <li><a href="/parcerias#instituicoes">Instituições</a></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="lp-mfooter-col">
              <h4>Especialidades</h4>
              <ul>
                <li><a href="#especialidades">Clínica Médica</a></li>
                <li><a href="#especialidades">Cirurgia Geral</a></li>
                <li><a href="#especialidades">Pediatria</a></li>
                <li><a href="#especialidades">GO</a></li>
                <li><a href="#especialidades">Med. Preventiva</a></li>
                <li><a href="#especialidades">Cardiologia</a></li>
                <li><a href="#especialidades">Neurologia</a></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="lp-mfooter-col">
              <h4>Recursos</h4>
              <ul>
                <li><a href="#depoimentos">Depoimentos</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Contato</a></li>
                <li><a href="/login">Entrar</a></li>
                <li><a href="/register">Criar conta</a></li>
              </ul>
            </div>
          </div>

          <div className="lp-mfooter-bar">
            <p>© 2026 RokoMed · Todos os direitos reservados</p>
            <ul>
              <li><a href="#">Termos de Uso</a></li>
              <li><a href="#">Privacidade</a></li>
              <li><a href="#">Contato</a></li>
            </ul>
          </div>
        </footer>

        {/* Floating WhatsApp Button */}
        <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="lp-wa-btn" aria-label="WhatsApp">
          <MessageCircle size={32} />
        </a>

        {/* Exit Intent Popup */}
        {showExitPopup && (
          <div className="lp-popup-overlay" onClick={() => setShowExitPopup(false)}>
            <div className="lp-popup" onClick={e => e.stopPropagation()}>
              <button className="lp-popup-close" onClick={() => setShowExitPopup(false)}>
                <X size={24} />
              </button>
              <div className="lp-sec-num" style={{fontSize:'3rem', marginBottom:'1rem', lineHeight:1}}>Espere!</div>
              <h2 style={{fontFamily:'var(--display)', fontSize:'2.5rem', lineHeight:1, marginBottom:'1rem'}}>Não vá embora de mãos abanando.</h2>
              <p style={{color:'var(--muted)', marginBottom:'2rem'}}>
                Sabemos que a residência é puxada. Experimente grátis nosso simulado com 30 questões comentadas e veja seu nível agora mesmo.
              </p>
              <input 
                type="email" 
                placeholder="Qual o seu melhor e-mail?"
                value={leadEmail}
                onChange={e => setLeadEmail(e.target.value)}
                style={{width:'100%', padding:'1.2rem', fontSize:'1rem', fontFamily:'var(--mono)', border:'2px solid var(--ink)', marginBottom:'1rem', background:'var(--paper)', outline:'none'}}
              />
              <button 
                className="lp-btn-ink" 
                style={{display:'block', width:'100%', padding:'1.2rem', fontSize:'0.9rem', cursor:'pointer', border:'none'}} 
                onClick={handleLeadCapture} 
                disabled={loadingLead}
              >
                {loadingLead ? 'Carregando...' : 'Fazer Simulado Grátis Agora'}
              </button>
              <button onClick={() => setShowExitPopup(false)} style={{background:'none', border:'none', fontFamily:'var(--mono)', fontSize:'0.65rem', textTransform:'uppercase', color:'var(--muted)', marginTop:'1.5rem', cursor:'pointer', textDecoration:'underline'}}>
                Não, prefiro continuar estudando do jeito antigo
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
