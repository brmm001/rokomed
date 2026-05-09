import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

type FreeQuestion = {
  id: string
  statement: string
  options: any
  correctOption?: string
  explanation?: string
  specialty?: { name: string }
  institution?: { name: string; acronym: string }
  year?: number
}

export default function FreeExamPage() {
  const [questions, setQuestions] = useState<FreeQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    import('../lib/api').then(({ default: api }) => {
      api.get('/questions/public-sample')
        .then(r => { setQuestions(r.data.data || []); setLoading(false) })
        .catch(e => { console.error(e); setLoading(false) })
    })
  }, [])

  const handleSelectOption = (letter: string) => {
    const q = questions[currentIndex]
    if (answers[q.id]) return // already answered
    setAnswers({ ...answers, [q.id]: letter })
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1)
    else setShowResult(true)
  }

  if (loading) return <div style={{padding:'5rem', textAlign:'center', fontFamily:'var(--mono)', background:'var(--paper)', minHeight:'100vh'}}>Carregando simulado...</div>
  if (questions.length === 0) return <div style={{padding:'5rem', textAlign:'center', fontFamily:'var(--mono)', background:'var(--paper)', minHeight:'100vh'}}>Nenhuma questão disponível.</div>

  if (showResult) {
    const correctCount = questions.filter(q => answers[q.id] === q.correctOption).length
    const score = Math.round((correctCount / questions.length) * 100)
    
    return (
      <div style={{minHeight:'100vh', background:'var(--paper)', color:'var(--ink)', fontFamily:'var(--body)', padding:'4rem 1rem'}}>
        <div style={{maxWidth:'600px', margin:'0 auto', textAlign:'center', border:'2px solid var(--ink)', padding:'3rem', background:'white'}}>
          <h2 style={{fontFamily:'var(--display)', fontSize:'3rem', marginBottom:'1rem'}}>Fim de Prova!</h2>
          <div style={{fontSize:'5rem', fontFamily:'var(--display)', color: score >= 60 ? '#10B981' : '#EF4444', lineHeight:1}}>{score}%</div>
          <p style={{fontFamily:'var(--mono)', fontSize:'0.9rem', color:'var(--muted)', marginTop:'1rem', textTransform:'uppercase'}}>
            Você acertou {correctCount} de {questions.length} questões
          </p>
          
          <hr style={{border:'none', borderTop:'1px dashed var(--rule)', margin:'2rem 0'}} />
          
          <p style={{fontSize:'1.1rem', marginBottom:'1.5rem', color: 'var(--red)', fontWeight: 'bold'}}>
            Aviso de Reajuste!
          </p>
          <p style={{fontSize:'1.05rem', marginBottom:'2rem', lineHeight: 1.6}}>
            A plataforma RokoMed passará por um reajuste de preço devido à nova versão da Inteligência Artificial. Garanta hoje o acesso total por apenas <strong>R$ 29,00 mensais</strong> antes que o valor aumente!
          </p>
          
          <Link to="/checkout?plan=monthly" style={{display:'inline-block', background:'var(--red)', color:'white', padding:'1.2rem 2rem', fontFamily:'var(--mono)', fontWeight:'bold', textTransform:'uppercase', textDecoration:'none', letterSpacing:'0.05em', width:'100%', borderRadius: '4px', boxShadow: '0 4px 14px rgba(211, 47, 47, 0.4)'}}>
            Garantir Acesso Imediato
          </Link>
          <p style={{fontFamily:'var(--mono)', fontSize:'0.75rem', color:'var(--muted)', marginTop:'1rem'}}>Assinatura sem fidelidade. Cancele a qualquer momento.</p>
        </div>
      </div>
    )
  }

  const q = questions[currentIndex]
  const answeredLetter = answers[q.id]
  const isAnswered = !!answeredLetter

  let parsedOpts = []
  try {
    parsedOpts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options
  } catch(e) {}

  return (
    <>
      <style>{`
        :root {
          --paper: #FAFAFA;
          --ink: #111111;
          --rule: #E5E5E5;
          --red: #D32F2F;
          --blue: #2563EB;
          --display: 'Abril Fatface', serif;
          --body: 'Crimson Pro', serif;
          --mono: 'Inter', sans-serif;
        }

        .editorial-explanation h4 {
          font-family: var(--mono);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--blue);
          margin-top: 0;
          margin-bottom: 0.75rem;
          font-weight: 700;
        }
        .editorial-explanation p {
          margin-bottom: 1rem;
          line-height: 1.7;
        }
        .editorial-explanation .gatilhos {
          margin-bottom: 1.5rem;
          padding: 1rem 1.5rem;
          background: rgba(37, 99, 235, 0.04);
          border-left: 4px solid var(--blue);
        }
        .editorial-explanation .gatilho {
          display: inline-block;
          background: white;
          border: 1px solid var(--rule);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          margin-right: 0.4rem;
          margin-bottom: 0.4rem;
          font-family: var(--mono);
          color: var(--ink);
        }
        .editorial-explanation .comentario-geral,
        .editorial-explanation .conteudo-completo,
        .editorial-explanation .pegadinha,
        .editorial-explanation .contexto-especifico,
        .editorial-explanation .raciocinio-alternativas {
          padding: 1.5rem;
          background: white;
          border: 1px solid var(--rule);
          border-radius: 8px;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .editorial-explanation .pegadinha h4 {
          color: #D97706;
        }
        .editorial-explanation .pegadinha {
          border-left: 4px solid #D97706;
        }
        .editorial-explanation .alt-item {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: var(--paper);
          border: 1px solid var(--rule);
          border-radius: 6px;
        }
        .editorial-explanation .alt-item:last-child {
          margin-bottom: 0;
        }
        .editorial-explanation .alt-letra {
          font-family: var(--mono);
          font-weight: bold;
          padding: 0.3rem 0.7rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          height: fit-content;
        }
        .editorial-explanation .alt-letra.correta {
          background: rgba(16, 185, 129, 0.15);
          color: #065F46;
        }
        .editorial-explanation .alt-letra.incorreta {
          background: rgba(239, 68, 68, 0.15);
          color: #991B1B;
        }
        .editorial-explanation .alt-texto {
          font-size: 0.95rem;
          line-height: 1.6;
        }
      `}</style>
      <div style={{minHeight:'100vh', background:'var(--paper)', color:'var(--ink)', fontFamily:'var(--body)'}}>
        <header style={{padding:'1.5rem 2rem', borderBottom:'2px solid var(--ink)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--paper)'}}>
          <div style={{fontFamily:'var(--display)', fontSize:'1.2rem', lineHeight:1}}>Roko<em style={{color:'var(--blue)', fontStyle:'normal'}}>Med</em></div>
        <div style={{fontFamily:'var(--mono)', fontSize:'0.8rem', letterSpacing:'0.1em', textTransform:'uppercase'}}>Questão {currentIndex + 1} / {questions.length}</div>
        <Link to="/" style={{fontFamily:'var(--mono)', fontSize:'0.7rem', color:'var(--muted)', textDecoration:'none', textTransform:'uppercase', letterSpacing:'0.1em'}}>Sair</Link>
      </header>

      <main style={{maxWidth:'800px', margin:'3rem auto', padding:'0 1.5rem'}}>
        <div style={{marginBottom:'2rem', display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          {q.institution && (
            <span style={{fontFamily:'var(--mono)', fontSize:'0.65rem', background:'var(--rule)', color:'var(--ink)', padding:'0.3rem 0.6rem', textTransform:'uppercase', letterSpacing:'0.1em'}}>
              {q.institution.acronym || q.institution.name} {q.year ? `- ${q.year}` : ''}
            </span>
          )}
          <span style={{fontFamily:'var(--mono)', fontSize:'0.65rem', background:'var(--ink)', color:'var(--paper)', padding:'0.3rem 0.6rem', textTransform:'uppercase', letterSpacing:'0.1em'}}>{q.specialty?.name || 'Geral'}</span>
        </div>
        
        <div dangerouslySetInnerHTML={{__html: q.statement}} style={{fontSize:'1.15rem', lineHeight:1.7, marginBottom:'3rem'}} />

        <div style={{display:'flex', flexDirection:'column', gap:'1rem', marginBottom:'3rem'}}>
          {Array.isArray(parsedOpts) && parsedOpts.map((opt: any) => {
            const isSelected = answeredLetter === opt.letter
            const isCorrect = isAnswered && opt.letter === q.correctOption
            const isWrong = isAnswered && isSelected && opt.letter !== q.correctOption
            
            let border = '1px solid var(--rule)'
            let bg = 'white'
            let color = 'var(--ink)'
            if (isCorrect) { border = '2px solid #10B981'; bg = 'rgba(16, 185, 129, 0.1)'; color = '#065F46' }
            else if (isWrong) { border = '2px solid #EF4444'; bg = 'rgba(239, 68, 68, 0.1)'; color = '#991B1B' }
            else if (isSelected) { border = '2px solid var(--ink)' }

            return (
              <button 
                key={opt.letter}
                onClick={() => handleSelectOption(opt.letter)}
                style={{
                  display:'flex', gap:'1rem', padding:'1.2rem', border, background: bg, color,
                  cursor: isAnswered ? 'default' : 'pointer', textAlign:'left', fontFamily:'var(--body)', fontSize:'1.05rem',
                  transition: 'border-color 0.2s'
                }}
              >
                <div style={{fontFamily:'var(--mono)', fontWeight:'bold', flexShrink:0}}>{opt.letter})</div>
                <div dangerouslySetInnerHTML={{__html: opt.text}} />
              </button>
            )
          })}
        </div>

        {isAnswered && (
          <div style={{background:'rgba(37, 99, 235, 0.03)', border:'1px solid var(--blue)', padding:'2rem', marginBottom:'3rem', borderRadius: '8px'}}>
            <h4 style={{fontFamily:'var(--mono)', color:'var(--blue)', textTransform:'uppercase', fontSize:'0.85rem', marginBottom:'1.5rem', letterSpacing:'0.1em', fontWeight:'bold'}}>
              Resolução RokoMed
            </h4>
            <div className="editorial-explanation" dangerouslySetInnerHTML={{__html: q.explanation || 'Nenhum comentário disponível para esta questão no momento.'}} style={{fontSize:'1rem', lineHeight:1.6, color:'var(--ink)'}} />
          </div>
        )}

        {isAnswered && (
          <div style={{textAlign:'right', paddingBottom:'5rem'}}>
            <button onClick={handleNext} style={{background:'var(--ink)', color:'var(--paper)', border:'none', padding:'1rem 2rem', fontFamily:'var(--mono)', fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'0.1em', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'0.5rem', transition:'background 0.2s'}}>
              {currentIndex < questions.length - 1 ? 'Próxima Questão' : 'Ver Resultado Final'} <ArrowRight size={16} />
            </button>
          </div>
        )}
      </main>
    </div>
    </>
  )
}
