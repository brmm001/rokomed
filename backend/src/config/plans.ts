export interface PlanConfig {
  id: string
  title: string
  amount: number
  priceFormatted: string
  period: string
  description: string
  features: string[]
  totalFormatted?: string
}

export const PLANS: Record<string, PlanConfig> = {
  monthly: {
    id: 'monthly',
    title: 'RokoMed - Plano Mensal',
    amount: 29.00,
    priceFormatted: 'R$ 29,00',
    period: '/ mês',
    description: 'Acesso completo com renovação automática. Cancele quando quiser.',
    features: ['Acesso a todo o banco de questões', 'Simulados por especialidade', 'Gabaritos comentados'],
  },
  semiannual: {
    id: 'semiannual',
    title: 'RokoMed - Plano Semestral',
    amount: 97.00,
    priceFormatted: '6x de R$ 19,00',
    totalFormatted: 'Total à vista: R$ 97,00',
    period: '/ semestral',
    description: 'Nosso plano mais vendido. Sem renovação automática.',
    features: ['Tudo do plano Mensal', 'Simulados personalizados por IA', 'Suporte prioritário'],
  },
  annual: {
    id: 'annual',
    title: 'RokoMed - Plano Anual',
    amount: 147.00,
    priceFormatted: '12x de R$ 15,00',
    totalFormatted: 'Total à vista: R$ 147,00',
    period: '/ anual',
    description: 'O melhor custo-benefício. Sem renovação automática.',
    features: ['Tudo do plano Semestral', 'Flashcards integrados', 'Planilha de evolução exportável'],
  },
}
