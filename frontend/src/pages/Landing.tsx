import { useEffect } from 'react'

export default function LandingPage() {
  useEffect(() => {
    document.title = 'Rokomed — Banco de Questões'
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600&display=swap');

        .lp-root *, .lp-root *::before, .lp-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .lp-root {
          --ink:   #1C1917; /* stone-900 */
          --paper: #FAFAF9; /* stone-50 */
          --red:   #0369A1; /* sky-700 */
          --rule:  #E7E5E4; /* stone-200 */
          --muted: #57534E; /* stone-600 */
          --display: 'Lora', Georgia, serif;
          --body:  'Inter', sans-serif;
          font-family: var(--body);
          background: var(--paper);
          color: var(--ink);
          line-height: 1.6;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* NAV */
        .lp-nav { display:flex; align-items:center; justify-content:space-between; padding:1.2rem 5vw; border-bottom:1px solid var(--rule); position:sticky; top:0; z-index:100; background:rgba(250,250,249,0.95); backdrop-filter:blur(8px); }
        .lp-logo { font-family:var(--display); font-size:1.5rem; font-weight:600; color:var(--ink); text-decoration:none; letter-spacing:-0.02em; }
        .lp-logo em { color:var(--red); font-style:normal; }
        .lp-nav-links { display:flex; gap:2.5rem; list-style:none; }
        .lp-nav-links a { font-size:0.85rem; font-weight:500; color:var(--muted); text-decoration:none; transition:color .2s; }
        .lp-nav-links a:hover { color:var(--ink); }
        .lp-nav-cta { font-size:0.85rem; font-weight:500; background:var(--ink); color:var(--paper); padding:0.6rem 1.4rem; border-radius:6px; text-decoration:none; transition:background .2s; }
        .lp-nav-cta:hover { background:var(--red); }

        /* HERO */
        .lp-hero { display:grid; grid-template-columns:1.2fr 1fr; min-height:85vh; border-bottom:1px solid var(--rule); }
        .lp-hero-left { padding:6vw 5vw; border-right:1px solid var(--rule); display:flex; flex-direction:column; justify-content:center; }
        .lp-hero-eyebrow { display:inline-block; font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; color:var(--red); margin-bottom:1.5rem; }
        .lp-h1 { font-family:var(--display); font-size:clamp(2.8rem, 5vw, 4.5rem); line-height:1.15; letter-spacing:-0.02em; color:var(--ink); font-weight:500; margin-bottom:1.5rem; }
        .lp-h1 .lp-red { color:var(--red); font-style:italic; }
        .lp-hero-desc { font-size:1.1rem; color:var(--muted); line-height:1.7; max-width:480px; margin-bottom:2.5rem; }
        .lp-hero-actions { display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap; }
        .lp-btn-ink { background:var(--ink); color:var(--paper); padding:.85rem 2rem; border-radius:6px; font-size:.95rem; font-weight:500; text-decoration:none; transition:background .2s; }
        .lp-btn-ink:hover { background:var(--red); }
        .lp-btn-link { font-size:.95rem; font-weight:500; color:var(--ink); text-decoration:none; display:flex; align-items:center; gap:0.5rem; transition:color .2s; }
        .lp-btn-link:hover { color:var(--red); }
        .lp-hero-note { font-size:.85rem; color:var(--muted); margin-top:1.5rem; }

        /* HERO RIGHT */
        .lp-hero-right { display:flex; flex-direction:column; }
        .lp-hero-price-block { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:4rem 3rem; border-bottom:1px solid var(--rule); position:relative; background:#FFFFFF; }
        .lp-price-label { font-size:.85rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:var(--muted); margin-bottom:1rem; }
        .lp-price-big { font-family:var(--display); font-size:clamp(5rem, 10vw, 8rem); line-height:1; color:var(--ink); }
        .lp-price-big sup { font-family:var(--body); font-weight:400; font-size:.3em; vertical-align:super; color:var(--muted); }
        .lp-price-period { font-size:1rem; color:var(--muted); margin-top:.5rem; }
        .lp-hero-stats-row { display:grid; grid-template-columns:1fr 1fr; background:var(--paper); }
        .lp-hstat { padding:2rem; border-top:1px solid var(--rule); border-right:1px solid var(--rule); text-align:center; }
        .lp-hstat:nth-child(2n) { border-right:none; }
        .lp-hstat .lp-n { font-family:var(--display); font-size:2.5rem; line-height:1; color:var(--ink); margin-bottom:.5rem; }
        .lp-hstat .lp-n span { color:var(--red); font-size:0.8em; }
        .lp-hstat .lp-label { font-size:.85rem; color:var(--muted); font-weight:500; }

        /* MARQUEE */
        .lp-mq-wrap { overflow:hidden; border-bottom:1px solid var(--rule); padding:1.2rem 0; background:#FFFFFF; }
        .lp-mq-inner { display:flex; white-space:nowrap; animation:lp-mq 35s linear infinite; }
        .lp-mq-inner span { font-size:.85rem; font-weight:500; color:var(--muted); padding:0 2rem; }
        .lp-mq-inner .lp-dot { color:var(--rule); opacity:1; padding:0; }
        @keyframes lp-mq { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        /* FEATURES */
        .lp-feat-section { display:grid; grid-template-columns:320px 1fr; border-bottom:1px solid var(--rule); }
        .lp-feat-sidebar { padding:5rem 4vw; border-right:1px solid var(--rule); background:#FFFFFF; }
        .lp-sec-num { font-size:0.85rem; font-weight:600; color:var(--red); letter-spacing:0.05em; margin-bottom:1rem; display:block; text-transform:uppercase; }
        .lp-sec-h { font-family:var(--display); font-size:2.2rem; line-height:1.2; letter-spacing:-0.01em; margin-bottom:1.5rem; }
        .lp-feat-grid { display:grid; grid-template-columns:1fr 1fr; }
        .lp-fi { padding:4rem 3rem; border-bottom:1px solid var(--rule); border-right:1px solid var(--rule); background:var(--paper); transition:background .2s; }
        .lp-fi:nth-child(2n) { border-right:none; }
        .lp-fi:nth-last-child(-n+2) { border-bottom:none; }
        .lp-fi:hover { background:#FFFFFF; }
        .lp-fi-num { font-size:.85rem; font-weight:600; color:var(--red); margin-bottom:1rem; display:block; }
        .lp-fi h3 { font-family:var(--display); font-size:1.4rem; color:var(--ink); margin-bottom:.8rem; font-weight:500; }
        .lp-fi p { font-size:1.05rem; color:var(--muted); line-height:1.6; }

        /* SPECIALTIES */
        .lp-spec-section { display:grid; grid-template-columns:1fr 1.2fr; border-bottom:1px solid var(--rule); }
        .lp-spec-left { padding:6rem 4vw; border-right:1px solid var(--rule); background:#FFFFFF; display:flex; flex-direction:column; justify-content:center; }
        .lp-spec-left h2 { font-family:var(--display); font-size:clamp(2.5rem,4vw,3.5rem); line-height:1.2; letter-spacing:-0.01em; }
        .lp-spec-left h2 em { font-style:italic; color:var(--red); }
        .lp-spec-right { padding:6rem 4vw; display:flex; flex-direction:column; justify-content:center; }
        .lp-spec-tags { display:flex; flex-wrap:wrap; gap:.75rem; margin-top:2rem; }
        .lp-stag { font-size:.85rem; font-weight:500; padding:.5rem 1rem; border:1px solid var(--rule); color:var(--ink); background:#FFFFFF; border-radius:20px; transition:all .2s; cursor:default; }
        .lp-stag:hover,.lp-stag.lp-hi { background:var(--ink); color:#FFFFFF; border-color:var(--ink); }
        .lp-stag.lp-hir { background:var(--red); color:#FFFFFF; border-color:var(--red); }

        /* PRICING */
        .lp-price-section { border-bottom:1px solid var(--rule); background:#FFFFFF; }
        .lp-price-hdr { padding:6rem 5vw 4rem; text-align:center; max-width:800px; margin:0 auto; }
        .lp-price-hdr h2 { font-family:var(--display); font-size:clamp(2.5rem,4vw,3.5rem); letter-spacing:-.01em; line-height:1.2; margin-bottom:1rem; }
        .lp-price-hdr p { font-size:1.15rem; color:var(--muted); }
        .lp-pcards { display:grid; grid-template-columns:1fr 1fr 1fr; max-width:1200px; margin:0 auto; padding:0 5vw 6rem; gap:2rem; }
        .lp-pc { padding:3rem 2.5rem; border:1px solid var(--rule); border-radius:12px; display:flex; flex-direction:column; gap:2rem; position:relative; background:var(--paper); }
        .lp-pc.lp-feat { background:var(--ink); color:var(--paper); border-color:var(--ink); box-shadow:0 20px 40px rgba(0,0,0,0.08); transform:scale(1.03); }
        .lp-pc-lbl { font-size:1.05rem; font-weight:600; color:var(--ink); }
        .lp-pc.lp-feat .lp-pc-lbl { color:#FFFFFF; }
        .lp-pc-price { display:flex; align-items:baseline; gap:.3rem; }
        .lp-pc-price .lp-cur { font-size:1.2rem; color:var(--muted); }
        .lp-pc.lp-feat .lp-pc-price .lp-cur { color:rgba(255,255,255,.6); }
        .lp-pc-price .lp-amt { font-family:var(--display); font-size:4.5rem; line-height:1; }
        .lp-pc-price .lp-per { font-size:1rem; color:var(--muted); }
        .lp-pc.lp-feat .lp-pc-price .lp-per { color:rgba(255,255,255,.6); }
        hr.lp-r { border:none; border-top:1px solid var(--rule); }
        .lp-pc.lp-feat hr.lp-r { border-color:rgba(255,255,255,.15); }
        .lp-pc-feats { list-style:none; display:flex; flex-direction:column; gap:1rem; flex:1; }
        .lp-pc-feats li { font-size:.95rem; color:var(--muted); display:flex; align-items:flex-start; gap:.75rem; line-height:1.5; }
        .lp-pc.lp-feat .lp-pc-feats li { color:rgba(255,255,255,.85); }
        .lp-pc-feats li::before { content:'✓'; color:var(--red); font-weight:bold; }
        .lp-pc.lp-feat .lp-pc-feats li::before { color:#38BDF8; }
        .lp-pc-btn { display:block; text-align:center; padding:1rem; font-size:.95rem; font-weight:500; border-radius:6px; text-decoration:none; transition:all .2s; }
        .lp-pc-btn-out { border:1px solid var(--rule); color:var(--ink); background:#FFFFFF; }
        .lp-pc-btn-out:hover { border-color:var(--ink); }
        .lp-pc-btn-ppr { background:var(--red); color:#FFFFFF; }
        .lp-pc-btn-ppr:hover { background:#0284C7; }
        .lp-pflag { position:absolute; top:-14px; left:50%; transform:translateX(-50%); background:var(--red); color:#FFFFFF; font-size:.75rem; font-weight:600; padding:.4rem 1.2rem; border-radius:20px; letter-spacing:0.05em; text-transform:uppercase; }

        /* TESTIMONIALS */
        .lp-testi-s { border-bottom:1px solid var(--rule); background:var(--paper); }
        .lp-testi-hdr { padding:6rem 5vw 3rem; text-align:center; border-bottom:1px solid var(--rule); }
        .lp-testi-hdr h2 { font-family:var(--display); font-size:clamp(2rem,4vw,3.2rem); letter-spacing:-.01em; }
        .lp-tgrid { display:grid; grid-template-columns:1fr 1fr 1fr; }
        .lp-titem { padding:4rem 3.5rem; border-right:1px solid var(--rule); display:flex; flex-direction:column; gap:1.5rem; background:#FFFFFF; }
        .lp-titem:last-child { border-right:none; }
        .lp-tq { font-size:1.1rem; font-style:italic; color:var(--ink); line-height:1.7; flex:1; }
        .lp-tmeta { display:flex; flex-direction:column; gap:0.25rem; }
        .lp-tmeta .lp-name { font-weight:600; color:var(--ink); font-size:0.95rem; }
        .lp-tmeta .lp-role { font-size:.85rem; color:var(--muted); }

        /* FINAL CTA */
        .lp-cta-s { display:flex; flex-direction:column; align-items:center; text-align:center; gap:2.5rem; padding:8rem 5vw; border-bottom:1px solid var(--rule); background:#FFFFFF; }
        .lp-cta-s h2 { font-family:var(--display); font-size:clamp(2.5rem,5vw,4.5rem); line-height:1.15; letter-spacing:-0.02em; max-width:800px; }
        .lp-cta-s h2 em { color:var(--red); font-style:italic; }

        /* FOOTER */
        .lp-footer { padding:3rem 5vw; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1.5rem; background:var(--paper); }
        .lp-footer p { font-size:.9rem; color:var(--muted); }
        .lp-flinks { display:flex; gap:2.5rem; list-style:none; }
        .lp-flinks a { font-size:.9rem; color:var(--muted); text-decoration:none; }
        .lp-flinks a:hover { color:var(--ink); }

        @media(max-width:900px){
          .lp-hero,.lp-spec-section { grid-template-columns:1fr; }
          .lp-hero-right,.lp-spec-left { display:none; }
          .lp-feat-section { grid-template-columns:1fr; }
          .lp-feat-sidebar { border-right:none; border-bottom:1px solid var(--rule); padding:4rem 5vw; }
          .lp-feat-grid,.lp-pcards,.lp-tgrid { grid-template-columns:1fr; }
          .lp-fi { border-right:none; padding:3rem 5vw; }
          .lp-pcards { padding:0 5vw 4rem; gap:1.5rem; }
          .lp-pc { transform:none !important; }
          .lp-titem { border-right:none; border-bottom:1px solid var(--rule); padding:3rem 5vw; }
          .lp-nav-links { display:none; }
        }
      `}</style>

      <div className="lp-root">
        <nav className="lp-nav">
          <a href="#" className="lp-logo">Rokomed<em>.</em></a>
          <ul className="lp-nav-links">
            <li><a href="#recursos">Recursos</a></li>
            <li><a href="#especialidades">Especialidades</a></li>
            <li><a href="#planos">Planos</a></li>
            <li><a href="#depoimentos">Depoimentos</a></li>
          </ul>
          <a href="#planos" className="lp-nav-cta">Começar Agora</a>
        </nav>

        <section className="lp-hero">
          <div className="lp-hero-left">
            <div className="lp-hero-eyebrow">Banco de Questões Inteligente</div>
            <h1 className="lp-h1">
              Passe na <span className="lp-red">residência</span> na primeira tentativa.
            </h1>
            <p className="lp-hero-desc">Mais de 15.000 questões comentadas, simulados adaptativos e análise de desempenho por especialidade. O preparo que você precisa, sem perda de tempo.</p>
            <div className="lp-hero-actions">
              <a href="#planos" className="lp-btn-ink">Começar por R$29/mês</a>
              <a href="#recursos" className="lp-btn-link">Conhecer a plataforma →</a>
            </div>
            <p className="lp-hero-note">Sem taxa de adesão · Cancele a qualquer momento</p>
          </div>

          <div className="lp-hero-right">
            <div className="lp-hero-price-block">
              <div className="lp-price-label">Acesso Completo Por</div>
              <div className="lp-price-big"><sup>R$</sup>29</div>
              <div className="lp-price-period">ao mês</div>
            </div>
            <div className="lp-hero-stats-row">
              <div className="lp-hstat"><div className="lp-n">15<span>k+</span></div><div className="lp-label">Questões Comentadas</div></div>
              <div className="lp-hstat"><div className="lp-n">40<span>+</span></div><div className="lp-label">Especialidades Médicas</div></div>
              <div className="lp-hstat"><div className="lp-n">98<span>%</span></div><div className="lp-label">Taxa de Aprovação</div></div>
              <div className="lp-hstat"><div className="lp-n">4.9<span>/5</span></div><div className="lp-label">Avaliação dos Alunos</div></div>
            </div>
          </div>
        </section>

        <div className="lp-mq-wrap" aria-hidden="true">
          <div className="lp-mq-inner">
            <span>Clínica Médica</span><span className="lp-dot">·</span><span>Cirurgia Geral</span><span className="lp-dot">·</span><span>Pediatria</span><span className="lp-dot">·</span><span>Ginecologia</span><span className="lp-dot">·</span><span>Preventiva</span><span className="lp-dot">·</span><span>Cardiologia</span><span className="lp-dot">·</span><span>Neurologia</span><span className="lp-dot">·</span><span>Ortopedia</span><span className="lp-dot">·</span><span>Psiquiatria</span><span className="lp-dot">·</span><span>Dermatologia</span><span className="lp-dot">·</span><span>Infectologia</span><span className="lp-dot">·</span><span>Endocrinologia</span><span className="lp-dot">·</span><span>Pneumologia</span><span className="lp-dot">·</span><span>Nefrologia</span><span className="lp-dot">·</span>
            <span>Clínica Médica</span><span className="lp-dot">·</span><span>Cirurgia Geral</span><span className="lp-dot">·</span><span>Pediatria</span><span className="lp-dot">·</span><span>Ginecologia</span><span className="lp-dot">·</span><span>Preventiva</span><span className="lp-dot">·</span><span>Cardiologia</span><span className="lp-dot">·</span><span>Neurologia</span><span className="lp-dot">·</span><span>Ortopedia</span><span className="lp-dot">·</span><span>Psiquiatria</span><span className="lp-dot">·</span><span>Dermatologia</span><span className="lp-dot">·</span><span>Infectologia</span><span className="lp-dot">·</span><span>Endocrinologia</span><span className="lp-dot">·</span><span>Pneumologia</span><span className="lp-dot">·</span><span>Nefrologia</span><span className="lp-dot">·</span>
          </div>
        </div>

        <section className="lp-feat-section" id="recursos">
          <div className="lp-feat-sidebar">
            <span className="lp-sec-num">Vantagens</span>
            <h2 className="lp-sec-h">Por que o Rokomed funciona?</h2>
            <p style={{fontSize:'1.05rem',color:'var(--muted)',lineHeight:1.6}}>Construído por médicos especialistas para garantir que você estude exatamente o que cai nas provas.</p>
          </div>
          <div className="lp-feat-grid">
            <div className="lp-fi"><span className="lp-fi-num">01</span><h3>Banco Comentado</h3><p>Questões reais das principais bancas do Brasil com gabarito detalhado e fundamentação bibliográfica.</p></div>
            <div className="lp-fi"><span className="lp-fi-num">02</span><h3>Simulados Adaptativos</h3><p>Nossa plataforma identifica suas maiores dificuldades e cria provas sob medida para sua evolução.</p></div>
            <div className="lp-fi"><span className="lp-fi-num">03</span><h3>Métricas Precisas</h3><p>Acompanhe seu desempenho por grande área e subtema. Saiba exatamente onde focar seus esforços.</p></div>
            <div className="lp-fi"><span className="lp-fi-num">04</span><h3>Filtros Avançados</h3><p>Treine focado no seu objetivo. Filtre por instituição, ano, nível de dificuldade ou conceito-chave.</p></div>
          </div>
        </section>

        <section className="lp-spec-section" id="especialidades">
          <div className="lp-spec-left">
            <h2>Pratique todas as <em>especialidades</em> cobradas.</h2>
            <p style={{fontSize:'1.1rem',color:'var(--muted)',marginTop:'1.5rem',maxWidth:'400px'}}>O edital inteiro coberto de forma inteligente, organizado para facilitar sua memorização.</p>
          </div>
          <div className="lp-spec-right">
            <div style={{fontSize:'0.85rem',fontWeight:600,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Cobertura Completa</div>
            <div className="lp-spec-tags">
              <span className="lp-stag lp-hir">Clínica Médica</span><span className="lp-stag lp-hir">Cirurgia Geral</span><span className="lp-stag lp-hir">Pediatria</span><span className="lp-stag lp-hir">Ginecologia e Obstetrícia</span><span className="lp-stag lp-hir">Medicina Preventiva</span>
              <span className="lp-stag lp-hi">Cardiologia</span><span className="lp-stag lp-hi">Neurologia</span><span className="lp-stag lp-hi">Ortopedia</span>
              <span className="lp-stag">Psiquiatria</span><span className="lp-stag">Dermatologia</span><span className="lp-stag">Infectologia</span><span className="lp-stag">Endocrinologia</span><span className="lp-stag">Gastroenterologia</span><span className="lp-stag">Pneumologia</span><span className="lp-stag">Nefrologia</span><span className="lp-stag">Reumatologia</span><span className="lp-stag">Hematologia</span><span className="lp-stag">Oftalmologia</span><span className="lp-stag">Otorrinolaringologia</span><span className="lp-stag">Urologia</span><span className="lp-stag">Oncologia</span><span className="lp-stag">Anestesiologia</span>
            </div>
          </div>
        </section>

        <section className="lp-price-section" id="planos">
          <div className="lp-price-hdr">
            <h2>Planos e Investimento</h2>
            <p>Escolha a melhor assinatura para a sua jornada de aprovação.</p>
          </div>
          <div className="lp-pcards">
            <div className="lp-pc">
              <div className="lp-pc-lbl">Mensal</div>
              <div className="lp-pc-price"><span className="lp-cur">R$</span><span className="lp-amt">29</span><span className="lp-per">/mês</span></div>
              <hr className="lp-r" />
              <ul className="lp-pc-feats">
                <li>Acesso ilimitado às questões</li>
                <li>Filtros por banca e instituição</li>
                <li>Estatísticas de desempenho</li>
                <li>Suporte por e-mail</li>
              </ul>
              <a href="#" className="lp-pc-btn lp-pc-btn-out">Começar Mensal</a>
            </div>
            <div className="lp-pc lp-feat">
              <span className="lp-pflag">Mais Escolhido</span>
              <div className="lp-pc-lbl">Semestral</div>
              <div className="lp-pc-price"><span className="lp-cur">R$</span><span className="lp-amt">19</span><span className="lp-per">/mês</span></div>
              <hr className="lp-r" />
              <ul className="lp-pc-feats">
                <li>Tudo do plano Mensal</li>
                <li>Simulados adaptativos</li>
                <li>Análise detalhada de erros</li>
                <li>Revisão programada</li>
                <li>Suporte prioritário</li>
              </ul>
              <a href="#" className="lp-pc-btn lp-pc-btn-ppr">Assinar Semestral</a>
            </div>
            <div className="lp-pc">
              <div className="lp-pc-lbl">Anual</div>
              <div className="lp-pc-price"><span className="lp-cur">R$</span><span className="lp-amt">15</span><span className="lp-per">/mês</span></div>
              <hr className="lp-r" />
              <ul className="lp-pc-feats">
                <li>Tudo do plano Semestral</li>
                <li>Simulados inéditos mensais</li>
                <li>Mentoria gravada</li>
                <li>Modo offline (app)</li>
              </ul>
              <a href="#" className="lp-pc-btn lp-pc-btn-out">Assinar Anual</a>
            </div>
          </div>
        </section>

        <section className="lp-testi-s" id="depoimentos">
          <div className="lp-testi-hdr">
            <h2>Aprovados confiam em nós.</h2>
          </div>
          <div className="lp-tgrid">
            <div className="lp-titem">
              <p className="lp-tq">"O formato direto ao ponto salvou meu estudo de reta final. As questões são excelentes e os comentários tiram todas as dúvidas na hora."</p>
              <div className="lp-tmeta"><span className="lp-name">Carolina M.</span><span className="lp-role">Aprovada na USP (Clínica Médica)</span></div>
            </div>
            <div className="lp-titem">
              <p className="lp-tq">"O sistema de análise de desempenho me mostrou que eu estava perdendo tempo estudando temas que já dominava. Foco total onde importava."</p>
              <div className="lp-tmeta"><span className="lp-name">Rafael L.</span><span className="lp-role">Aprovado na UNIFESP (Cirurgia Geral)</span></div>
            </div>
            <div className="lp-titem">
              <p className="lp-tq">"Gostei muito da fluidez do app. Dava para fazer 10 questões entre um atendimento e outro no plantão de forma muito prática."</p>
              <div className="lp-tmeta"><span className="lp-name">Thais F.</span><span className="lp-role">Aprovada na Santa Casa (Pediatria)</span></div>
            </div>
          </div>
        </section>

        <section className="lp-cta-s">
          <h2>Sua vaga de residência<br />começa <em>hoje.</em></h2>
          <a href="#planos" className="lp-btn-ink" style={{padding:'1rem 2.5rem', fontSize:'1rem'}}>Criar minha conta agora</a>
        </section>

        <footer className="lp-footer">
          <a href="#" className="lp-logo" style={{fontSize:'1.2rem'}}>Rokomed<em>.</em></a>
          <ul className="lp-flinks">
            <li><a href="#">Termos de Uso</a></li>
            <li><a href="#">Política de Privacidade</a></li>
            <li><a href="#">Fale Conosco</a></li>
          </ul>
          <p>© 2026 Rokomed. Todos os direitos reservados.</p>
        </footer>
      </div>
    </>
  )
}
