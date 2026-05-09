import { useEffect } from 'react'
import { Link } from 'react-router-dom'
export default function LandingPage() {
  useEffect(() => {
    document.title = 'RokoMed — Banco de Questões'
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .lp-root *, .lp-root *::before, .lp-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .lp-root {
          --ink:   #111111;
          --paper: #FAFAFA;
          --red:   #1D4ED8;
          --rule:  rgba(0,0,0,0.18);
          --muted: #525252;
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

        /* FOOTER */
        .lp-footer { padding:2rem 5vw; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
        .lp-footer p { font-family:var(--mono); font-size:.63rem; letter-spacing:.08em; color:var(--muted); text-transform:uppercase; }
        .lp-flinks { display:flex; gap:2rem; list-style:none; }
        .lp-flinks a { font-family:var(--mono); font-size:.63rem; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); text-decoration:none; }
        .lp-flinks a:hover { color:var(--ink); }

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

        <section className="lp-price-section" id="planos">
          <div className="lp-price-hdr">
            <div>
              <div className="lp-sec-num" style={{fontSize:'3rem',marginBottom:'.4rem'}}>03</div>
              <h2>Planos e preços</h2>
            </div>
            <p>Escolha o plano que melhor se adapta ao seu momento de estudo.</p>
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
                <li>Estatísticas de desempenho</li>
                <li>Cancele quando quiser</li>
              </ul>
              <Link to="/checkout?plan=monthly" className="lp-pc-btn lp-pc-btn-out">Começar agora →</Link>
            </div>
            <div className="lp-pc lp-feat">
              <span className="lp-pflag">Mais popular</span>
              <div className="lp-pc-lbl">Semestral</div>
              <div className="lp-pc-price" style={{alignItems:'baseline'}}>
                <span className="lp-cur">6x</span><span className="lp-cur" style={{marginLeft:'0.3rem'}}>R$</span><span className="lp-amt">19</span>
              </div>
              <div style={{fontFamily:'var(--body)', fontWeight:300, fontStyle:'italic', fontSize:'0.85rem', color:'rgba(255,255,255,0.5)', marginTop:'0.2rem'}}>ou à vista por R$ 114</div>
              <hr className="lp-r" style={{marginTop:'0.8rem'}} />
              <ul className="lp-pc-feats">
                <li>Tudo do plano Mensal</li>
                <li>Simulados personalizados por IA</li>
                <li>Filtro avançado por banca e ano</li>
                <li>Modo revisão rápida</li>
                <li>Suporte prioritário</li>
              </ul>
              <Link to="/checkout?plan=semiannual" className="lp-pc-btn lp-pc-btn-ppr">Economizar 34% →</Link>
            </div>
            <div className="lp-pc">
              <div className="lp-pc-lbl">Anual</div>
              <div className="lp-pc-price" style={{alignItems:'baseline'}}>
                <span className="lp-cur">12x</span><span className="lp-cur" style={{marginLeft:'0.3rem'}}>R$</span><span className="lp-amt">15</span>
              </div>
              <div style={{fontFamily:'var(--body)', fontWeight:300, fontStyle:'italic', fontSize:'0.85rem', color:'var(--muted)', marginTop:'0.2rem'}}>ou à vista por R$ 180</div>
              <hr className="lp-r" style={{marginTop:'0.8rem'}} />
              <ul className="lp-pc-feats">
                <li>Tudo do plano Semestral</li>
                <li>Acesso antecipado a novos recursos</li>
                <li>Flashcards integrados</li>
                <li>Planilha de evolução exportável</li>
                <li>Suporte via WhatsApp</li>
              </ul>
              <Link to="/checkout?plan=annual" className="lp-pc-btn lp-pc-btn-out">Melhor custo-benefício →</Link>
            </div>
          </div>
        </section>

        <section className="lp-testi-s" id="depoimentos">
          <div className="lp-testi-hdr">
            <div>
              <div className="lp-sec-num" style={{fontSize:'3rem',marginBottom:'.3rem'}}>04</div>
              <h2>O que dizem<br />quem já passou</h2>
            </div>
            <div style={{fontFamily:'var(--display)',fontSize:'6rem',color:'var(--red)',opacity:.12,lineHeight:1,userSelect:'none'}}>"</div>
          </div>
          <div className="lp-tgrid">
            <div className="lp-titem">
              <p className="lp-tq">"Estudei com outros bancos antes, mas o RokoMed é outro nível. Os comentários são didáticos e os simulados me ajudaram a entender exatamente onde eu errava."</p>
              <div className="lp-tmeta"><div className="lp-name">Carolina M.</div><div className="lp-role">Aprovada em Clínica Médica — USP 2024</div></div>
            </div>
            <div className="lp-titem">
              <p className="lp-tq">"Em 4 meses usando a plataforma minha nota nos simulados subiu 18 pontos. A análise de desempenho por tema é o diferencial que faz toda a diferença."</p>
              <div className="lp-tmeta"><div className="lp-name">Rafael L.</div><div className="lp-role">Aprovado em Cirurgia Geral — UNIFESP 2024</div></div>
            </div>
            <div className="lp-titem">
              <p className="lp-tq">"Usei no celular durante a madrugada no plantão. As questões curtas e os comentários objetivos encaixaram perfeitamente na minha rotina."</p>
              <div className="lp-tmeta"><div className="lp-name">Thais F.</div><div className="lp-role">Aprovada em Pediatria — Santa Casa SP 2024</div></div>
            </div>
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

        <footer className="lp-footer">
          <a href="#" className="lp-logo">Roko<em>Med</em></a>
          <p>© 2026 RokoMed · Todos os direitos reservados</p>
          <ul className="lp-flinks">
            <li><a href="#">Termos</a></li>
            <li><a href="#">Privacidade</a></li>
            <li><a href="#">Contato</a></li>
          </ul>
        </footer>
      </div>
    </>
  )
}
