import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { adminApi, userApi } from '../lib/api'
import api from '../lib/api'
import { useAuthStore } from '../store/auth'
import {
  Building2, GraduationCap, Stethoscope, Calendar,
  ChevronRight, ChevronLeft, CheckCircle2, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Lista de faculdades de medicina do Brasil ────────────────────────────────
const MEDICAL_SCHOOLS = [
  'USP – Universidade de São Paulo', 'UNIFESP – Escola Paulista de Medicina',
  'UNICAMP – Universidade Estadual de Campinas', 'UFRJ – Universidade Federal do Rio de Janeiro',
  'UERJ – Universidade do Estado do Rio de Janeiro', 'UFF – Universidade Federal Fluminense',
  'UFRGS – Universidade Federal do Rio Grande do Sul', 'UFMG – Universidade Federal de Minas Gerais',
  'UFBA – Universidade Federal da Bahia', 'UFC – Universidade Federal do Ceará',
  'UFPE – Universidade Federal de Pernambuco', 'UFRN – Universidade Federal do Rio Grande do Norte',
  'UFG – Universidade Federal de Goiás', 'UFPA – Universidade Federal do Pará',
  'UFAM – Universidade Federal do Amazonas', 'UFMS – Universidade Federal de Mato Grosso do Sul',
  'UFMT – Universidade Federal de Mato Grosso', 'UFPI – Universidade Federal do Piauí',
  'UFMA – Universidade Federal do Maranhão', 'UFAL – Universidade Federal de Alagoas',
  'UFS – Universidade Federal de Sergipe', 'UFPB – Universidade Federal da Paraíba',
  'UFRR – Universidade Federal de Roraima', 'UFAC – Universidade Federal do Acre',
  'UFAP – Universidade Federal do Amapá', 'FURG – Universidade Federal do Rio Grande',
  'UFES – Universidade Federal do Espírito Santo', 'UFSCar – Universidade Federal de São Carlos',
  'UFSC – Universidade Federal de Santa Catarina', 'UFJF – Universidade Federal de Juiz de Fora',
  'UFVJM – Universidade Federal dos Vales do Jequitinhonha e Mucuri',
  'UFSJ – Universidade Federal de São João del-Rei', 'UFU – Universidade Federal de Uberlândia',
  'UNIMONTES – Universidade Estadual de Montes Claros', 'UENP – Universidade Estadual do Norte do Paraná',
  'UEL – Universidade Estadual de Londrina', 'UEM – Universidade Estadual de Maringá',
  'UEPG – Universidade Estadual de Ponta Grossa', 'UNIOESTE – Universidade Estadual do Oeste do Paraná',
  'UESC – Universidade Estadual de Santa Cruz', 'UEFS – Universidade Estadual de Feira de Santana',
  'UESB – Universidade Estadual do Sudoeste da Bahia', 'UECE – Universidade Estadual do Ceará',
  'URCA – Universidade Regional do Cariri', 'UVA – Universidade Estadual Vale do Acaraú',
  'UFCG – Universidade Federal de Campina Grande', 'UNIVASF – Universidade Federal do Vale do São Francisco',
  'UFSB – Universidade Federal do Sul da Bahia', 'UNIR – Universidade Federal de Rondônia',
  'UFTO – Universidade Federal do Tocantins', 'UNITINS – Universidade Estadual do Tocantins',
  'PUC-SP – Pontifícia Universidade Católica de São Paulo',
  'PUC-RS – Pontifícia Universidade Católica do Rio Grande do Sul',
  'PUC-PR – Pontifícia Universidade Católica do Paraná',
  'PUC-MG – Pontifícia Universidade Católica de Minas Gerais',
  'Santa Casa de São Paulo', 'Santa Casa de Misericórdia de Belo Horizonte',
  'FMB – Faculdade de Medicina de Botucatu (UNESP)', 'UNESP – Marília',
  'UNESP – Sorocaba', 'UNESP – Araçatuba',
  'Faculdade de Medicina de Jundiaí', 'Faculdade de Medicina de Marília (FAMEMA)',
  'Faculdade de Medicina do ABC', 'Faculdade de Ciências Médicas da Santa Casa de SP',
  'FMUSP – Faculdade de Medicina USP (campus Ribeirão Preto)',
  'USP Ribeirão Preto', 'UNICID – Universidade Cidade de São Paulo',
  'IAMSPE – Instituto de Assistência Médica ao Servidor Público Estadual',
  'Faculdade Evangélica Mackenzie do Paraná', 'UNICESUMAR',
  'Universidade Positivo', 'FAMED – UFCSPA', 'UFCSPA – Universidade Federal de Ciências da Saúde de Porto Alegre',
  'UNIJUÍ – Universidade Regional do Noroeste do Estado do Rio Grande do Sul',
  'URI – Universidade Regional Integrada do Alto Uruguai e das Missões',
  'ULBRA – Universidade Luterana do Brasil', 'FEEVALE', 'UCS – Universidade de Caxias do Sul',
  'UnB – Universidade de Brasília', 'UCB – Universidade Católica de Brasília',
  'Escola Superior de Ciências da Saúde (ESCS/DF)', 'UFOB – Universidade Federal do Oeste da Bahia',
  'UNILAB – Universidade da Integração Internacional da Lusofonia Afro-Brasileira',
  'UFCA – Universidade Federal do Cariri', 'UNIVALE – Universidade Vale do Rio Doce',
  'UNINCOR', 'UNIVAS', 'FIPMoc', 'Faculdade de Medicina de Itajubá',
  'Instituto Tocantinense Presidente Antônio Carlos (ITPAC)',
  'FIMCA – Faculdade Integrada Metropolitana de Cascavel',
  'Outra faculdade não listada',
]

const SPECIALTIES = [
  'Clínica Médica', 'Cirurgia Geral', 'Pediatria', 'Ginecologia e Obstetrícia',
  'Medicina de Família e Comunidade', 'Medicina Preventiva e Social',
  'Cardiologia', 'Neurologia', 'Ortopedia e Traumatologia', 'Psiquiatria',
  'Dermatologia', 'Infectologia', 'Endocrinologia', 'Gastroenterologia',
  'Pneumologia', 'Nefrologia', 'Reumatologia', 'Hematologia e Hemoterapia',
  'Oftalmologia', 'Otorrinolaringologia', 'Urologia', 'Oncologia Clínica',
  'Anestesiologia', 'Radiologia e Diagnóstico por Imagem', 'Medicina Intensiva',
  'Medicina de Emergência', 'Medicina Nuclear', 'Patologia', 'Anatomia Patológica',
  'Medicina do Trabalho', 'Medicina Legal e Perícia Médica', 'Cirurgia Plástica',
  'Cirurgia Cardiovascular', 'Cirurgia Torácica', 'Cirurgia Pediátrica',
  'Cirurgia de Cabeça e Pescoço', 'Cirurgia do Aparelho Digestivo',
  'Neurocirurgia', 'Medicina Física e Reabilitação', 'Geriatria',
  'Medicina Esportiva', 'Imunologia e Alergia', 'Genética Médica', 'Ainda não sei',
]

const EXAM_YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i)

interface OnboardingData {
  originInstitution: string
  targetInstitutionId: string
  targetSpecialtyId: string
  examYear: number
}

interface Props {
  onComplete: () => void
}

export default function OnboardingModal({ onComplete }: Props) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    originInstitution: '',
    targetInstitutionId: '',
    targetSpecialtyId: '',
    examYear: new Date().getFullYear() + 1,
  })
  const [schoolSearch, setSchoolSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const { data: institutionsData } = useQuery({
    queryKey: ['admin-institutions'],
    queryFn: adminApi.institutions,
  })

  const filteredSchools = MEDICAL_SCHOOLS.filter(s =>
    s.toLowerCase().includes(schoolSearch.toLowerCase())
  ).slice(0, 8)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await api.post('/user/onboarding', data)
      toast.success('Perfil configurado! Sua experiência está personalizada 🎯', { duration: 4000 })
      onComplete()
    } catch {
      toast.error('Erro ao salvar configurações')
    } finally {
      setLoading(false)
    }
  }

  const canNext = () => {
    if (step === 1) return data.originInstitution.length > 0
    if (step === 2) return data.targetInstitutionId.length > 0 && data.targetSpecialtyId.length > 0
    if (step === 3) return data.examYear > 0
    return false
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 24,
        width: '100%', maxWidth: 560,
        overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Header com progress */}
        <div style={{
          background: 'linear-gradient(135deg, #050D1A 0%, #0F2040 100%)',
          padding: '2rem 2rem 1.5rem',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #3B82F6, #14B8A6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                Vamos personalizar sua jornada
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>3 perguntas rápidas</div>
            </div>
          </div>

          {/* Steps bar */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 99,
                background: s <= step ? 'linear-gradient(90deg, #3B82F6, #14B8A6)' : 'rgba(255,255,255,0.1)',
                transition: 'background 0.4s ease',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {['Origem', 'Objetivo', 'Quando'].map((label, i) => (
              <span key={label} style={{ fontSize: '0.65rem', color: i + 1 <= step ? 'var(--accent-blue)' : 'var(--text-muted)', fontFamily: 'Outfit', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Corpo */}
        <div style={{ padding: '2rem' }}>

          {/* ── Step 1: Faculdade de origem ── */}
          {step === 1 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={22} color="var(--accent-blue)" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>De qual faculdade você é?</h2>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Isso nos ajuda a personalizar os conteúdos para o seu perfil</p>
                </div>
              </div>

              <input
                type="text"
                placeholder="Buscar faculdade..."
                value={schoolSearch}
                onChange={e => setSchoolSearch(e.target.value)}
                className="input"
                style={{ width: '100%', marginBottom: '0.75rem', fontSize: '0.9rem', boxSizing: 'border-box' }}
                autoFocus
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflowY: 'auto' }}>
                {(schoolSearch ? filteredSchools : MEDICAL_SCHOOLS.slice(0, 10)).map(school => (
                  <button
                    key={school}
                    onClick={() => { setData(d => ({ ...d, originInstitution: school })); setSchoolSearch('') }}
                    style={{
                      textAlign: 'left', padding: '10px 14px', borderRadius: 10, border: '1px solid',
                      borderColor: data.originInstitution === school ? 'var(--accent-blue)' : 'var(--border)',
                      background: data.originInstitution === school ? 'rgba(59,130,246,0.12)' : 'transparent',
                      cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span>{school}</span>
                    {data.originInstitution === school && <CheckCircle2 size={16} color="var(--accent-blue)" />}
                  </button>
                ))}
                {schoolSearch && filteredSchools.length === 0 && (
                  <button
                    onClick={() => { setData(d => ({ ...d, originInstitution: schoolSearch })); setSchoolSearch('') }}
                    style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 10, border: '1px dashed var(--border)', background: 'transparent', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--accent-blue)' }}
                  >
                    + Usar "{schoolSearch}"
                  </button>
                )}
              </div>

              {data.originInstitution && (
                <div style={{ marginTop: '0.75rem', padding: '8px 12px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, fontSize: '0.8rem', color: 'var(--accent-blue)' }}>
                  ✓ Selecionado: <strong>{data.originInstitution}</strong>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Prova e especialidade ── */}
          {step === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Stethoscope size={22} color="var(--accent-teal)" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Para onde você está mirando?</h2>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Qual banca/prova e qual especialidade você quer cursar</p>
                </div>
              </div>

              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
                Banca / Programa-alvo
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: '1.25rem', maxHeight: 180, overflowY: 'auto' }}>
                {institutionsData?.data?.map((inst: { id: string; acronym: string; name: string }) => (
                  <button
                    key={inst.id}
                    onClick={() => setData(d => ({ ...d, targetInstitutionId: inst.id }))}
                    style={{
                      padding: '10px 12px', borderRadius: 10, border: '1px solid',
                      borderColor: data.targetInstitutionId === inst.id ? 'var(--accent-teal)' : 'var(--border)',
                      background: data.targetInstitutionId === inst.id ? 'rgba(20,184,166,0.12)' : 'transparent',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: data.targetInstitutionId === inst.id ? 'var(--accent-teal)' : 'var(--text-primary)' }}>{inst.acronym}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{inst.name}</div>
                  </button>
                ))}
              </div>

              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
                Especialidade desejada
              </label>
              <select
                value={data.targetSpecialtyId}
                onChange={e => setData(d => ({ ...d, targetSpecialtyId: e.target.value }))}
                className="input"
                style={{ width: '100%', boxSizing: 'border-box' }}
              >
                <option value="">Selecione uma especialidade...</option>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {/* ── Step 3: Ano da prova ── */}
          {step === 3 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={22} color="#FBBF24" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Quando você vai prestar?</h2>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Vamos calibrar seu cronograma de estudos automaticamente</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: '1.5rem' }}>
                {EXAM_YEARS.map(year => (
                  <button
                    key={year}
                    onClick={() => setData(d => ({ ...d, examYear: year }))}
                    style={{
                      padding: '1.5rem 1rem', borderRadius: 14, border: '2px solid',
                      borderColor: data.examYear === year ? '#FBBF24' : 'var(--border)',
                      background: data.examYear === year ? 'rgba(251,191,36,0.1)' : 'transparent',
                      cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    }}
                  >
                    <span style={{ fontSize: '1.5rem', fontFamily: 'Outfit', fontWeight: 800, color: data.examYear === year ? '#FBBF24' : 'var(--text-primary)' }}>
                      {year}
                    </span>
                    {year === new Date().getFullYear() && (
                      <span style={{ fontSize: '0.6rem', color: '#F87171', fontWeight: 600, textTransform: 'uppercase' }}>Este ano</span>
                    )}
                    {year === new Date().getFullYear() + 1 && (
                      <span style={{ fontSize: '0.6rem', color: 'var(--accent-teal)', fontWeight: 600, textTransform: 'uppercase' }}>Mais comum</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Resumo */}
              <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 14, padding: '1rem 1.25rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 10 }}>
                  Resumo do seu perfil
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem' }}>
                    <GraduationCap size={14} color="var(--accent-blue)" />
                    <span style={{ color: 'var(--text-muted)' }}>Origem:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{data.originInstitution || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem' }}>
                    <Stethoscope size={14} color="var(--accent-teal)" />
                    <span style={{ color: 'var(--text-muted)' }}>Especialidade:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{data.targetSpecialtyId || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem' }}>
                    <Calendar size={14} color="#FBBF24" />
                    <span style={{ color: 'var(--text-muted)' }}>Prova em:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{data.examYear}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Ações */}
        <div style={{
          padding: '1rem 2rem 1.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: '1px solid var(--border)',
        }}>
          <button
            onClick={() => step > 1 ? setStep(s => (s - 1) as 1 | 2 | 3) : undefined}
            style={{
              opacity: step === 1 ? 0 : 1, pointerEvents: step === 1 ? 'none' : 'auto',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.875rem',
            }}
          >
            <ChevronLeft size={16} /> Voltar
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(s => (s + 1) as 1 | 2 | 3)}
              disabled={!canNext()}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: canNext() ? 1 : 0.4 }}
            >
              Continuar <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canNext() || loading}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #3B82F6, #14B8A6)', opacity: canNext() ? 1 : 0.4 }}
            >
              {loading ? 'Salvando...' : <><Sparkles size={15} /> Começar personalizado</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
