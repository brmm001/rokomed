import { useState } from 'react'
import { Link } from 'react-router-dom'
import { submitPartnershipLead } from '../lib/api'
import toast from 'react-hot-toast'

export default function PartnershipsPage() {
  const [ambName, setAmbName] = useState('')
  const [ambEmail, setAmbEmail] = useState('')
  const [ambLoading, setAmbLoading] = useState(false)
  const [atlName, setAtlName] = useState('')
  const [atlEmail, setAtlEmail] = useState('')
  const [atlLoading, setAtlLoading] = useState(false)
  const [instName, setInstName] = useState('')
  const [instEmail, setInstEmail] = useState('')
  const [instLoading, setInstLoading] = useState(false)

  const submit = async (
    type: 'AMBASSADOR' | 'ATLETICA' | 'INSTITUICAO',
    name: string, email: string,
    setLoading: (v: boolean) => void,
    reset: () => void,
    msg: string
  ) => {
    if (!name.trim() || !email.includes('@')) { toast.error('Preencha nome e e-mail válido.'); return }
    setLoading(true)
    try { await submitPartnershipLead({ type, name, email }); toast.success(msg); reset() }
    catch { toast.error('Erro ao enviar. Tente novamente.') }
    finally { setLoading(false) }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .pp * { box-sizing: border-box; margin: 0; padding: 0; }
        .pp {
          --ink: #111111; --paper: #FAFAFA; --red: #1D4ED8; --rule: rgba(0,0,0,0.18); --muted: #525252;
          --display: 'Abril Fatface', Georgia, serif; --body: 'Crimson Pro', Georgia, serif; --mono: 'IBM Plex Mono', monospace;
          font-family: var(--body); background: var(--paper); color: var(--ink); line-height: 1.5; overflow-x: hidden;
        }
        .pp h1, .pp h2, .pp h3, .pp h4, .pp h5, .pp h6 { color: var(--ink); }
        .pp-nav { display:flex; align-items:center; justify-content:space-between; padding:1.4rem 5vw; border-bottom:2px solid var(--ink); background:var(--paper); position:sticky; top:0; z-index:100; }
        .pp-logo { font-family:var(--display); font-size:1.35rem; color:var(--ink); text-decoration:none; }
        .pp-logo em { color:var(--red); font-style:normal; }
        .pp-nav-links { display:flex; gap:2rem; list-style:none; }
        .pp-nav-links a { font-family:var(--mono); font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase; color:var(--muted); text-decoration:none; transition:color .15s; }
        .pp-nav-links a:hover { color:var(--ink); }
        .pp-nav-cta { font-family:var(--mono); font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase; background:var(--ink); color:var(--paper); padding:0.55rem 1.3rem; text-decoration:none; }
        .pp-nav-cta:hover { background:var(--red); }

        /* HERO */
        .pp-hero { padding:6rem 5vw 5rem; border-bottom:2px solid var(--ink); text-align:center; }
        .pp-hero-label { font-family:var(--mono); font-size:.7rem; letter-spacing:.18em; text-transform:uppercase; color:var(--muted); margin-bottom:1.5rem; }
        .pp-hero h1 { font-family:var(--display); font-size:clamp(3rem,7vw,6rem); line-height:.95; letter-spacing:-.02em; margin-bottom:1.5rem; }
        .pp-hero h1 em { color:var(--red); font-style:italic; }
        .pp-hero p { font-size:1.1rem; font-weight:300; color:var(--muted); max-width:600px; margin:0 auto 2.5rem; line-height:1.7; }
        .pp-hero-tabs { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; }
        .pp-hero-tab { font-family:var(--mono); font-size:.7rem; letter-spacing:.1em; text-transform:uppercase; padding:.6rem 1.5rem; border:1px solid var(--rule); color:var(--muted); text-decoration:none; transition:all .15s; }
        .pp-hero-tab:hover, .pp-hero-tab.active { background:var(--ink); color:var(--paper); border-color:var(--ink); }

        /* SECTION COMMON */
        .pp-sec { border-bottom:2px solid var(--ink); }
        .pp-sec-grid { display:grid; grid-template-columns:280px 1fr; }
        .pp-sec-side { padding:5rem 3rem; border-right:2px solid var(--ink); display:flex; flex-direction:column; gap:2rem; }
        .pp-sec-num { font-family:var(--display); font-size:5rem; line-height:1; -webkit-text-stroke:1px var(--red); color:transparent; }
        .pp-sec-side h2 { font-family:var(--display); font-size:2rem; line-height:1.05; letter-spacing:-.02em; }
        .pp-sec-side h2 em { color:var(--red); font-style:italic; }
        .pp-sec-side p { font-size:.9rem; font-weight:300; color:var(--muted); line-height:1.65; font-style:italic; }
        .pp-sec-body { padding:4rem 3rem; display:flex; flex-direction:column; gap:2rem; }

        /* PERKS GRID */
        .pp-perks { display:grid; grid-template-columns:1fr 1fr; gap:1.2rem; }
        .pp-perk { padding:1.8rem; border:1px solid var(--rule); transition:border-color .2s; }
        .pp-perk:hover { border-color:var(--red); }
        .pp-perk-num { font-family:var(--mono); font-size:.6rem; letter-spacing:.14em; color:var(--muted); margin-bottom:.7rem; }
        .pp-perk h4 { font-family:var(--display); font-size:1.05rem; margin-bottom:.4rem; }
        .pp-perk p { font-size:.85rem; font-weight:300; color:var(--muted); line-height:1.6; }

        /* TESTIMONIALS */
        .pp-quotes { display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid var(--rule); }
        .pp-quote { padding:2.5rem; border-right:1px solid var(--rule); display:flex; flex-direction:column; gap:1rem; }
        .pp-quote:last-child { border-right:none; }
        .pp-quote-av { width:48px; height:48px; border-radius:50%; background:var(--ink); display:flex; align-items:center; justify-content:center; font-family:var(--display); font-size:1.2rem; color:var(--paper); }
        .pp-quote h4 { font-family:var(--display); font-size:1rem; margin-bottom:.1rem; }
        .pp-quote .pp-role { font-family:var(--mono); font-size:.6rem; letter-spacing:.1em; text-transform:uppercase; color:var(--red); }
        .pp-quote p { font-size:.88rem; font-weight:300; color:var(--muted); line-height:1.6; font-style:italic; flex:1; }

        /* FORM */
        .pp-form { display:flex; flex-direction:column; gap:.75rem; max-width:480px; }
        .pp-form input { padding:.9rem 1.1rem; font-family:var(--mono); font-size:.75rem; border:1px solid var(--rule); background:var(--paper); color:var(--ink); outline:none; transition:border-color .2s; }
        .pp-form input:focus { border-color:var(--ink); }
        .pp-btn { font-family:var(--mono); font-size:.72rem; letter-spacing:.12em; text-transform:uppercase; background:var(--ink); color:var(--paper); padding:.9rem 2rem; border:none; cursor:pointer; transition:background .15s; }
        .pp-btn:hover { background:var(--red); }
        .pp-btn:disabled { opacity:.5; cursor:not-allowed; }

        /* DISCOUNT BAR */
        .pp-discount-bar { background:var(--red); padding:2rem 3rem; display:flex; align-items:center; justify-content:space-between; gap:2rem; flex-wrap:wrap; }
        .pp-discount-big { font-family:var(--display); font-size:4rem; line-height:1; color:#fff; }
        .pp-discount-detail { font-family:var(--mono); font-size:.7rem; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.9); margin-top:.3rem; }
        .pp-discount-bar-btn { font-family:var(--mono); font-size:.7rem; letter-spacing:.12em; text-transform:uppercase; background:#fff; color:var(--red); padding:.8rem 2rem; border:none; cursor:pointer; transition:opacity .2s; white-space:nowrap; display:inline-block; }
        .pp-discount-bar-btn:hover { opacity:.85; }

        /* TIERS */
        .pp-tiers { display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid var(--rule); }
        .pp-tier { padding:3rem 2.5rem; border-right:1px solid var(--rule); transition:background .2s; }
        .pp-tier:last-child { border-right:none; }
        .pp-tier:hover { background:rgba(0,0,0,.02); }
        .pp-tier-badge { font-family:var(--mono); font-size:.6rem; letter-spacing:.14em; text-transform:uppercase; color:#fff; background:var(--muted); padding:.25rem .6rem; display:inline-block; margin-bottom:1.2rem; }
        .pp-tier.featured .pp-tier-badge { background:var(--red); }
        .pp-tier h3 { font-family:var(--display); font-size:1.6rem; margin-bottom:.5rem; }
        .pp-tier-price-label { font-family:var(--mono); font-size:.65rem; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); margin-bottom:.3rem; }
        .pp-tier-price { font-family:var(--display); font-size:2.5rem; color:var(--ink); margin-bottom:1.2rem; }
        .pp-tier.featured .pp-tier-price { color:var(--red); }
        .pp-tier ul { list-style:none; display:flex; flex-direction:column; gap:.5rem; }
        .pp-tier ul li { font-size:.88rem; color:var(--muted); font-weight:300; display:flex; gap:.5rem; align-items:flex-start; line-height:1.4; }
        .pp-tier ul li::before { content:'→'; font-family:var(--mono); font-size:.7rem; color:var(--red); flex-shrink:0; }

        /* LOGOS */
        .pp-logos { display:grid; grid-template-columns:repeat(5,1fr); border-top:1px solid var(--rule); }
        .pp-logo-cell { padding:2rem; border-right:1px solid var(--rule); display:flex; flex-direction:column; align-items:center; gap:.6rem; transition:background .15s; }
        .pp-logo-cell:last-child { border-right:none; }
        .pp-logo-cell:hover { background:rgba(0,0,0,.03); }
        .pp-logo-icon { width:44px; height:44px; border-radius:50%; border:2px solid var(--rule); display:flex; align-items:center; justify-content:center; font-family:var(--display); font-size:.9rem; color:var(--muted); }
        .pp-logo-cell span { font-family:var(--mono); font-size:.58rem; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); text-align:center; }

        /* CTA BAR */
        .pp-cta-bar { padding:3rem 5vw; background:var(--ink); display:flex; align-items:center; justify-content:space-between; gap:2rem; flex-wrap:wrap; }
        .pp-cta-bar p { font-family:var(--mono); font-size:.75rem; letter-spacing:.1em; text-transform:uppercase; color:#a8a29e; }
        .pp-cta-bar a { font-family:var(--mono); font-size:.72rem; letter-spacing:.12em; text-transform:uppercase; background:var(--red); color:#fff; padding:.8rem 2rem; text-decoration:none; transition:opacity .2s; }
        .pp-cta-bar a:hover { opacity:.85; }

        /* FOOTER */
        .pp-footer { background:#0d0d14; color:#a8a29e; padding:2rem 5vw; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; border-top:2px solid #222; }
        .pp-footer p { font-family:var(--mono); font-size:.6rem; letter-spacing:.08em; text-transform:uppercase; }
        .pp-footer-links { display:flex; gap:2rem; list-style:none; }
        .pp-footer-links a { font-family:var(--mono); font-size:.6rem; letter-spacing:.1em; text-transform:uppercase; color:#a8a29e; text-decoration:none; transition:color .15s; }
        .pp-footer-links a:hover { color:#e7e5e4; }

        @media(max-width:900px){
          .pp-sec-grid { grid-template-columns:1fr; }
          .pp-sec-side { border-right:none; border-bottom:1px solid var(--rule); padding:3rem 5vw; }
          .pp-sec-body { padding:3rem 5vw; }
          .pp-perks, .pp-quotes, .pp-tiers { grid-template-columns:1fr; }
          .pp-quote { border-right:none; border-bottom:1px solid var(--rule); }
          .pp-tier { border-right:none; border-bottom:1px solid var(--rule); }
          .pp-logos { grid-template-columns:repeat(3,1fr); }
          .pp-nav-links { display:none; }
        }
      `}</style>

      <div className="pp">
        {/* NAV */}
        <nav className="pp-nav">
          <Link to="/" className="pp-logo">Roko<em>Med</em></Link>
          <ul className="pp-nav-links">
            <li><Link to="/#recursos">Recursos</Link></li>
            <li><Link to="/#planos">Planos</Link></li>
            <li><a href="#embaixadores">Embaixadores</a></li>
            <li><a href="#atleticas">Atléticas</a></li>
            <li><a href="#instituicoes">Instituições</a></li>
          </ul>
          <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
            <Link to="/login" className="pp-nav-cta" style={{background:'transparent',color:'var(--ink)',border:'1px solid var(--ink)'}}>Entrar</Link>
            <Link to="/checkout" className="pp-nav-cta">Assinar</Link>
          </div>
        </nav>

        {/* HERO */}
        <div className="pp-hero">
          <div className="pp-hero-label">RokoMed · Programa de Parcerias</div>
          <h1>Cresça com a gente.<br /><em>Juntos.</em></h1>
          <p>Seja um embaixador, conecte sua atlética ou traga sua instituição. Temos um modelo de parceria feito para você.</p>
          <div className="pp-hero-tabs">
            <a href="#embaixadores" className="pp-hero-tab">Embaixadores</a>
            <a href="#atleticas" className="pp-hero-tab">Atléticas</a>
            <a href="#instituicoes" className="pp-hero-tab">Instituições</a>
          </div>
        </div>

        {/* ===== EMBAIXADORES ===== */}
        <section className="pp-sec" id="embaixadores">
          <div className="pp-sec-grid">
            <div className="pp-sec-side">
              <div className="pp-sec-num">01</div>
              <h2>Seja um <em>Embaixador</em></h2>
              <p>Médicos residentes e estudantes apaixonados. Divulgue o RokoMed, ajude colegas e ganhe comissão recorrente por isso.</p>
              <div className="pp-form">
                <input type="text" placeholder="Seu nome completo" value={ambName} onChange={e => setAmbName(e.target.value)} />
                <input type="email" placeholder="Seu melhor e-mail" value={ambEmail} onChange={e => setAmbEmail(e.target.value)} />
                <button className="pp-btn" disabled={ambLoading}
                  onClick={() => submit('AMBASSADOR', ambName, ambEmail, setAmbLoading, () => { setAmbName(''); setAmbEmail('') }, 'Candidatura enviada! 🙌')}>
                  {ambLoading ? 'Enviando...' : 'Quero ser embaixador →'}
                </button>
              </div>
            </div>
            <div className="pp-sec-body">
              <div className="pp-perks">
                {[
                  {n:'001', t:'Comissão recorrente', d:'Ganhe sobre cada assinatura indicada durante toda a vigência do plano do seu indicado.'},
                  {n:'002', t:'Acesso gratuito', d:'Embaixadores ativos têm acesso completo ao RokoMed sem nenhum custo pelo período da parceria.'},
                  {n:'003', t:'Material exclusivo', d:'Artes prontas, link personalizado e suporte dedicado para você divulgar com facilidade.'},
                  {n:'004', t:'Reconhecimento público', d:'Seu nome em destaque na plataforma como referência na comunidade RokoMed.'},
                ].map(({n,t,d}) => (
                  <div className="pp-perk" key={n}>
                    <div className="pp-perk-num">{n}</div>
                    <h4>{t}</h4>
                    <p>{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pp-quotes">
            {[
              {i:'CM', n:'Carolina M.', r:'Embaixadora — Clínica Médica', q:'"Indico o RokoMed para todos os colegas. Além de ajudar, ainda consigo renda extra enquanto estudo."'},
              {i:'RL', n:'Rafael L.', r:'Embaixador — Cirurgia Geral', q:'"A plataforma vende sozinha. Compartilhei o link e em 1 mês já tinha 12 indicações ativas."'},
              {i:'TF', n:'Thais F.', r:'Embaixadora — Pediatria', q:'"O painel de comissões é transparente. Melhor programa de embaixadores que já participei."'},
            ].map(({i,n,r,q}) => (
              <div className="pp-quote" key={n}>
                <div className="pp-quote-av">{i}</div>
                <div><h4>{n}</h4><div className="pp-role">{r}</div></div>
                <p>{q}</p>
              </div>
            ))}
          </div>
          <div className="pp-cta-bar">
            <p>Comunidade RokoMed · Crescendo todo mês</p>
            <a href="#embaixadores" onClick={e => { e.preventDefault(); document.querySelector<HTMLInputElement>('.pp-sec:first-of-type input')?.focus() }}>Cadastre-se agora →</a>
          </div>
        </section>

        {/* ===== ATLÉTICAS ===== */}
        <section className="pp-sec" id="atleticas">
          <div className="pp-sec-grid">
            <div className="pp-sec-side">
              <div className="pp-sec-num">02</div>
              <h2>Parceria com <em>Atléticas</em></h2>
              <p>Sua atlética oferece o RokoMed com desconto exclusivo. Os membros pagam menos, a atlética recebe comissão.</p>
              <div className="pp-form" id="atl-form">
                <input type="text" placeholder="Nome da atlética / faculdade" value={atlName} onChange={e => setAtlName(e.target.value)} />
                <input type="email" placeholder="E-mail da diretoria" value={atlEmail} onChange={e => setAtlEmail(e.target.value)} />
                <button className="pp-btn" disabled={atlLoading}
                  onClick={() => submit('ATLETICA', atlName, atlEmail, setAtlLoading, () => { setAtlName(''); setAtlEmail('') }, 'Proposta enviada! Retornamos em 24h ✅')}>
                  {atlLoading ? 'Enviando...' : 'Quero parceria para minha atlética →'}
                </button>
              </div>
            </div>
            <div className="pp-sec-body">
              <div className="pp-perks">
                {[
                  {n:'001', t:'Desconto de até 40%', d:'Seus membros pagam menos. A atlética recebe comissão por cada assinatura ativa do convênio.'},
                  {n:'002', t:'Link e cupom exclusivos', d:'Código personalizado com o nome da sua atlética. Fácil de divulgar em grupos e redes.'},
                  {n:'003', t:'Sem burocracia', d:'Sem contrato complicado. Vocês divulgam, nós pagamos a comissão mensalmente.'},
                  {n:'004', t:'Dashboard da atlética', d:'Painel exclusivo para acompanhar alunos ativos e quanto a atlética já arrecadou.'},
                ].map(({n,t,d}) => (
                  <div className="pp-perk" key={n}>
                    <div className="pp-perk-num">{n}</div>
                    <h4>{t}</h4>
                    <p>{d}</p>
                  </div>
                ))}
              </div>
              <div className="pp-discount-bar">
                <div>
                  <div className="pp-discount-big">40%</div>
                  <div className="pp-discount-detail">de desconto para membros da atlética parceira</div>
                </div>
                <button className="pp-discount-bar-btn" onClick={() => { document.getElementById('atl-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => document.querySelector<HTMLInputElement>('#atl-form input')?.focus(), 400) }}>Quero essa parceria →</button>
              </div>
            </div>
          </div>
          <div className="pp-logos">
            {['USP','UNIFESP','UNICAMP','UFSCar','FAMERP'].map(u => (
              <div className="pp-logo-cell" key={u}>
                <div className="pp-logo-icon">{u[0]}</div>
                <span>Atlética {u}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== INSTITUIÇÕES ===== */}
        <section className="pp-sec" id="instituicoes">
          <div className="pp-sec-grid">
            <div className="pp-sec-side">
              <div className="pp-sec-num">03</div>
              <h2>Parceria com <em>Instituições</em></h2>
              <p>Faculdades, ligas acadêmicas, cursinhos e hospitais. Pacotes corporativos sob medida para sua realidade.</p>
              <div className="pp-form">
                <input type="text" placeholder="Nome da instituição" value={instName} onChange={e => setInstName(e.target.value)} />
                <input type="email" placeholder="E-mail institucional" value={instEmail} onChange={e => setInstEmail(e.target.value)} />
                <button className="pp-btn" disabled={instLoading}
                  onClick={() => submit('INSTITUICAO', instName, instEmail, setInstLoading, () => { setInstName(''); setInstEmail('') }, 'Proposta solicitada! Retornamos em até 24h ✅')}>
                  {instLoading ? 'Enviando...' : 'Solicitar proposta →'}
                </button>
              </div>
            </div>
            <div className="pp-sec-body">
              <div className="pp-tiers">
                <div className="pp-tier">
                  <span className="pp-tier-badge">Starter</span>
                  <h3>Liga &amp; Grupo</h3>
                  <div className="pp-tier-price-label">A partir de</div>
                  <div className="pp-tier-price">R$9<span style={{fontSize:'1.1rem',fontWeight:300}}>/aluno/mês</span></div>
                  <ul>
                    <li>Mínimo 20 alunos</li>
                    <li>Acesso completo à plataforma</li>
                    <li>Relatório de engajamento mensal</li>
                    <li>Suporte via WhatsApp</li>
                  </ul>
                </div>
                <div className="pp-tier featured">
                  <span className="pp-tier-badge">Mais escolhido</span>
                  <h3>Faculdade</h3>
                  <div className="pp-tier-price-label">A partir de</div>
                  <div className="pp-tier-price">R$7<span style={{fontSize:'1.1rem',fontWeight:300}}>/aluno/mês</span></div>
                  <ul>
                    <li>Mínimo 100 alunos</li>
                    <li>Tudo do Starter</li>
                    <li>Dashboard institucional</li>
                    <li>Treinamento para coordenadores</li>
                    <li>Simulados com branding próprio</li>
                  </ul>
                </div>
                <div className="pp-tier">
                  <span className="pp-tier-badge">Enterprise</span>
                  <h3>Hospital &amp; Rede</h3>
                  <div className="pp-tier-price-label">Sob consulta</div>
                  <div className="pp-tier-price" style={{fontSize:'1.8rem'}}>Personalizado</div>
                  <ul>
                    <li>Usuários ilimitados</li>
                    <li>Tudo do Faculdade</li>
                    <li>API e integração com LMS</li>
                    <li>Gerente de conta dedicado</li>
                    <li>SLA garantido em contrato</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="pp-cta-bar">
            <p>+30 instituições parceiras em todo o Brasil</p>
            <a href="#instituicoes" onClick={e => { e.preventDefault(); document.querySelector<HTMLInputElement>('#instituicoes input')?.focus() }}>Fale com a gente →</a>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pp-footer">
          <Link to="/" className="pp-logo">Roko<em>Med</em></Link>
          <p>© 2026 RokoMed · Todos os direitos reservados</p>
          <ul className="pp-footer-links">
            <li><a href="#">Termos</a></li>
            <li><a href="#">Privacidade</a></li>
            <li><Link to="/">Voltar ao início</Link></li>
          </ul>
        </footer>
      </div>
    </>
  )
}
