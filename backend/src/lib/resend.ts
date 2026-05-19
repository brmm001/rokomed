import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789_dummy_prevent_crash')

interface SendEmailProps {
  to: string | string[]
  subject: string
  html: string
}

/**
 * Função utilitária para enviar e-mails usando o Resend.
 * O e-mail "from" deve pertencer ao domínio verificado.
 */
export async function sendEmail({ to, subject, html }: SendEmailProps) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY não configurada. E-mail ignorado:', subject)
    return { success: false, error: 'API Key não configurada' }
  }

  // Use a variável de ambiente para o remetente, com um fallback padrão
  const fromEmail = process.env.EMAIL_FROM || 'suporte@seuminio.com.br'

  try {
    const data = await resend.emails.send({
      from: `Rokomed <${fromEmail}>`,
      to,
      subject,
      html,
    })
    
    return { success: true, data }
  } catch (error) {
    console.error('Erro ao enviar e-mail via Resend:', error)
    return { success: false, error }
  }
}
