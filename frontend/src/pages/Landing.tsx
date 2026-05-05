import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Brain, Target, TrendingUp, ShieldCheck,
  ArrowRight, Stethoscope, Star, CheckCircle,
  BarChart3, Zap, GraduationCap, LayoutDashboard
} from 'lucide-react'

export default function LandingPage() {
  useEffect(() => {
    document.title = 'Rokomed — Banco de Questões Inteligente'
  }, [])

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white selection:bg-indigo-500/30 overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-600/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto backdrop-blur-md border-b border-white/5 mt-4 rounded-2xl bg-white/[0.02]">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Stethoscope size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Rokomed</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Recursos</a>
          <a href="#stats" className="hover:text-white transition-colors">Resultados</a>
          <a href="#pricing" className="hover:text-white transition-colors">Planos</a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Entrar
          </Link>
          <Link to="/register" className="px-5 py-2.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 backdrop-blur-sm">
            Criar conta
          </Link>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>A plataforma definitiva para Residência Médica</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight max-w-4xl"
          >
            Sua aprovação desenhada por{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-teal-400">
              Inteligência Artificial
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed"
          >
            Mais de 15.000 questões comentadas, simulados adaptativos que aprendem com seus erros e estatísticas precisas para direcionar seu estudo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link to="/register" className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-teal-500 rounded-2xl overflow-hidden transition-all hover:scale-105 shadow-xl shadow-indigo-500/25">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative flex items-center gap-2">
                Começar agora gratuitamente <ArrowRight size={18} />
              </span>
            </Link>
            <a href="#features" className="px-8 py-4 text-base font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
              Conhecer recursos
            </a>
          </motion.div>

          {/* Floating UI Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-20 w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-2 shadow-2xl relative"
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-2xl opacity-50 animate-pulse" />
            <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#0A0F1C]/80 relative aspect-[16/9] flex items-center justify-center">
              {/* Fake UI Elements */}
              <div className="absolute inset-0 flex">
                <div className="w-64 border-r border-white/5 p-4 hidden md:block">
                  <div className="h-8 w-32 bg-white/10 rounded mb-8" />
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-white/5 rounded" />
                    <div className="h-4 w-4/5 bg-white/5 rounded" />
                    <div className="h-4 w-5/6 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="flex-1 p-8">
                  <div className="flex gap-4 mb-8">
                    <div className="h-24 flex-1 bg-gradient-to-br from-indigo-500/20 to-transparent border border-indigo-500/20 rounded-xl" />
                    <div className="h-24 flex-1 bg-gradient-to-br from-teal-500/20 to-transparent border border-teal-500/20 rounded-xl" />
                    <div className="h-24 flex-1 bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-500/20 rounded-xl hidden sm:block" />
                  </div>
                  <div className="h-64 w-full bg-white/5 border border-white/5 rounded-xl" />
                </div>
              </div>
              
              {/* Overlay Glass Panel */}
              <div className="absolute z-10 w-80 p-6 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/50 transform translate-x-12 translate-y-12">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center">
                    <TrendingUp className="text-teal-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-300">Desempenho Geral</div>
                    <div className="text-2xl font-bold text-white">87.5%</div>
                  </div>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-400 w-[87.5%] rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Projetado para sua aprovação</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Tecnologia avançada para otimizar cada minuto do seu estudo.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard 
                icon={<Brain />}
                title="Trilhas Adaptativas"
                desc="Nossa IA identifica suas fraquezas e seleciona as questões exatas que você precisa resolver para melhorar."
              />
              <FeatureCard 
                icon={<BarChart3 />}
                title="Analytics Profundo"
                desc="Gráficos detalhados usando Teoria de Resposta ao Item (TRI) para mostrar seu real nível de proficiência."
              />
              <FeatureCard 
                icon={<Target />}
                title="Simulados Personalizados"
                desc="Crie provas com a cara das instituições que você deseja, filtrando por bancas, anos e grandes áreas."
              />
              <FeatureCard 
                icon={<Zap />}
                title="Comentários Focados"
                desc="Resoluções diretas ao ponto. Sem enrolação, explicando o porquê de cada alternativa."
              />
              <FeatureCard 
                icon={<LayoutDashboard />}
                title="Dashboard Intuitivo"
                desc="Sua evolução centralizada em um painel moderno e sem distrações."
              />
              <FeatureCard 
                icon={<ShieldCheck />}
                title="Conteúdo Atualizado"
                desc="Novas provas e questões adicionadas constantemente pela nossa equipe de especialistas."
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="py-20 border-y border-white/5 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-teal-400 mb-2">15k+</div>
              <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">Questões</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-teal-400 mb-2">40+</div>
              <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">Especialidades</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-teal-400 mb-2">98%</div>
              <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">Aprovação</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-teal-400 mb-2">4.9/5</div>
              <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">Avaliação</div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Investimento no seu futuro</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Sem taxas ocultas. Escolha o plano perfeito para você.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <PricingCard 
                title="Mensal"
                price="29"
                features={["Acesso ilimitado às questões", "Simulados básicos", "Análise de desempenho", "Suporte padrão"]}
              />
              <PricingCard 
                title="Semestral"
                price="19"
                highlight={true}
                features={["Tudo do Mensal", "Trilhas Adaptativas com IA", "Simulados personalizados", "Análise preditiva de nota", "Suporte prioritário"]}
              />
              <PricingCard 
                title="Anual"
                price="15"
                features={["Tudo do Semestral", "Revisões programadas", "Mentorias coletivas", "Acesso a novos recursos em primeira mão"]}
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Pronto para vestir o jaleco do seu sonho?</h2>
            <Link to="/register" className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all backdrop-blur-md hover:scale-105 shadow-2xl">
              Criar conta gratuitamente
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Stethoscope className="text-indigo-400" size={20} />
            <span className="font-bold">Rokomed</span>
          </div>
          <div className="text-slate-500 text-sm">
            © 2026 Rokomed. Todos os direitos reservados.
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group">
      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
  )
}

function PricingCard({ title, price, features, highlight = false }: { title: string, price: string, features: string[], highlight?: boolean }) {
  return (
    <div className={`p-8 rounded-3xl border flex flex-col ${highlight ? 'bg-gradient-to-b from-indigo-900/40 to-[#0A0F1C] border-indigo-500/30 relative' : 'bg-white/[0.02] border-white/5'}`}>
      {highlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full text-xs font-bold tracking-wider">
          MAIS POPULAR
        </div>
      )}
      <div className="text-slate-400 font-medium mb-4">{title}</div>
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-2xl text-slate-500">R$</span>
        <span className="text-5xl font-extrabold">{price}</span>
        <span className="text-slate-500">/mês</span>
      </div>
      <ul className="space-y-4 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckCircle className={`w-5 h-5 shrink-0 ${highlight ? 'text-teal-400' : 'text-slate-500'}`} />
            <span className="text-slate-300 text-sm leading-tight">{f}</span>
          </li>
        ))}
      </ul>
      <Link to="/register" className={`w-full py-4 rounded-xl font-bold text-center transition-all ${highlight ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>
        Assinar {title}
      </Link>
    </div>
  )
}

function SparklesIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}
