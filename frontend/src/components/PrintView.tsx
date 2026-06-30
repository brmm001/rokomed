import { Printer, X, FileText } from 'lucide-react'

export interface PrintQuestion {
  number: number
  statement: string
  options: { letter: string; text: string }[]
  correctOption?: string
  year?: number
  institution?: string
  specialty?: string
  images?: { id: string; url: string; caption?: string }[]
}

interface PrintViewProps {
  title: string
  questions: PrintQuestion[]
  onClose: () => void
}

export function openPrintWindow(title: string, questions: PrintQuestion[]) {
  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) {
    alert('Permita pop-ups para imprimir as questoes.')
    return
  }

  const answersHTML = questions
    .map(
      (q) =>
        `<div class="answer-row">
          <span class="answer-num">${q.number}.</span>
          <span class="answer-val">${q.correctOption ?? '-'}</span>
        </div>`
    )
    .join('')

  const questionsHTML = questions
    .map((q) => {
      const meta = [q.institution, q.specialty, q.year].filter(Boolean).join(' . ')
      const optionsHTML = q.options
        .map(
          (opt) =>
            `<div class="option">
              <span class="opt-letter">${opt.letter}</span>
              <span class="opt-text">${opt.text}</span>
            </div>`
        )
        .join('')

      const imagesHTML = q.images && q.images.length > 0
        ? `<div class="images-list">${q.images.map(img =>
            `<figure class="img-figure">
              <img src="${img.url}" alt="${img.caption || 'Imagem da questao'}" class="question-img" />
              ${img.caption ? `<figcaption class="img-caption">${img.caption}</figcaption>` : ''}
            </figure>`
          ).join('')}</div>`
        : ''

      return `
        <div class="question-block">
          <div class="question-header">
            <span class="question-num">Questao ${q.number}</span>
            ${meta ? `<span class="question-meta">${meta}</span>` : ''}
          </div>
          <div class="question-statement">${q.statement}</div>
          ${imagesHTML}
          <div class="options-list">
            ${optionsHTML}
          </div>
          <div class="answer-space">
            <div class="answer-line-label">Minha resposta:</div>
            <div class="answer-line"></div>
          </div>
        </div>
      `
    })
    .join('')

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, serif; color: #111; background: #fff; }
    .cover { padding: 48px 64px 32px; border-bottom: 3px double #111; text-align: center; margin-bottom: 24px; }
    .cover-logo { font-size: 13px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; color: #555; margin-bottom: 10px; }
    .cover-title { font-size: 22px; font-weight: 700; margin-bottom: 6px; color: #111; }
    .cover-meta { font-size: 13px; color: #666; }
    .questions-section { padding: 0 64px 48px; }
    .questions-section-title { font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: #888; border-bottom: 1px solid #ccc; padding-bottom: 6px; margin-bottom: 24px; }
    .question-block { margin-bottom: 36px; page-break-inside: avoid; }
    .question-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 8px; }
    .question-num { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #444; white-space: nowrap; }
    .question-meta { font-size: 11px; color: #888; }
    .question-statement { font-size: 13.5px; line-height: 1.75; color: #111; margin-bottom: 14px; }
    .question-statement p { margin-bottom: 8px; }
    .question-statement strong { font-weight: 700; }
    .question-statement em { font-style: italic; }
    .question-statement table { border-collapse: collapse; margin: 10px 0; font-size: 12px; }
    .question-statement table td, .question-statement table th { border: 1px solid #ccc; padding: 4px 8px; }
    .options-list { display: flex; flex-direction: column; gap: 7px; margin-left: 6px; }
    .option { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; line-height: 1.55; }
    .opt-letter { font-weight: 700; width: 18px; flex-shrink: 0; color: #333; }
    .opt-text { flex: 1; color: #222; }
    .answer-space { display: flex; align-items: center; gap: 10px; margin-top: 14px; padding-top: 10px; border-top: 1px dashed #ddd; }
    .answer-line-label { font-size: 11px; color: #999; white-space: nowrap; font-style: italic; }
    .answer-line { flex: 1; border-bottom: 1px solid #bbb; height: 16px; }
    .images-list { display: flex; flex-wrap: wrap; gap: 12px; margin: 12px 0 16px; }
    .img-figure { margin: 0; }
    .question-img { max-width: 320px; max-height: 260px; width: auto; height: auto; display: block; border: 1px solid #ccc; border-radius: 4px; }
    .img-caption { font-size: 10px; color: #888; text-align: center; margin-top: 4px; font-style: italic; }
    .gabarito-section { page-break-before: always; padding: 48px 64px; }
    .gabarito-title { font-size: 18px; font-weight: 700; margin-bottom: 6px; color: #111; }
    .gabarito-subtitle { font-size: 12px; color: #888; margin-bottom: 28px; border-bottom: 2px solid #111; padding-bottom: 10px; }
    .answers-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; max-width: 480px; }
    .answer-row { display: flex; align-items: center; gap: 8px; background: #f5f5f5; border-radius: 6px; padding: 8px 12px; border: 1px solid #ddd; }
    .answer-num { font-size: 12px; color: #666; font-weight: 600; width: 26px; }
    .answer-val { font-size: 15px; font-weight: 900; color: #111; font-family: Courier New, monospace; }
    .print-footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 10px; color: #aaa; text-align: center; }
    @media print {
      body { padding: 0; }
      .gabarito-section { page-break-before: always; }
      .question-img { max-width: 300px; max-height: 240px; }
      @page { size: A4; margin: 18mm 15mm; }
    }
  </style>
</head>
<body>
  <div class="cover">
    <div class="cover-logo">RokoMed - Questoes para Impressao</div>
    <div class="cover-title">${title}</div>
    <div class="cover-meta">${questions.length} questoes - Gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
  </div>
  <div class="questions-section">
    <div class="questions-section-title">Questoes - responda no espaco indicado</div>
    ${questionsHTML}
  </div>
  <div class="gabarito-section">
    <div class="gabarito-title">Gabarito Oficial</div>
    <div class="gabarito-subtitle">${title} - ${questions.length} questoes</div>
    <div class="answers-grid">
      ${answersHTML}
    </div>
    <div class="print-footer">Impresso via RokoMed - rokomed.com.br</div>
  </div>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`

  win.document.write(html)
  win.document.close()
}

export default function PrintModal({ title, questions, onClose }: PrintViewProps) {
  const handlePrint = () => openPrintWindow(title, questions)

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--bg-card, #0d1b2e)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, padding: '2rem', maxWidth: 540, width: '100%',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Printer size={22} color="var(--accent-blue, #3B7EF8)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.0625rem' }}>Imprimir Questoes</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{questions.length} questoes - gabarito incluido</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} color="var(--text-muted)" />
          </button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
            <FileText size={16} color="var(--accent-blue, #3B7EF8)" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: 'Questoes', value: `${questions.length} questoes (sem gabarito marcado)` },
              { label: 'Gabarito', value: 'Ultima pagina separada' },
              { label: 'Formato', value: 'A4 vertical - otimizado para impressao' },
              { label: 'Resposta', value: 'Espaco em branco por questao' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8375rem' }}>
                <span style={{ color: 'var(--text-muted)', width: 80, flexShrink: 0 }}>{item.label}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.8125rem', color: '#F59E0B', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          As questoes serao impressas <strong>sem o gabarito marcado</strong>. O gabarito oficial aparece na <strong>ultima pagina</strong>, para corrigir depois.
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.875rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)', fontFamily: 'Outfit, sans-serif' }}>
            Cancelar
          </button>
          <button id="print-confirm-btn" onClick={handlePrint} style={{ flex: 2, padding: '0.875rem', background: 'var(--accent-blue, #3B7EF8)', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', color: '#fff', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Printer size={17} />
            Abrir para Impressao
          </button>
        </div>
      </div>
    </div>
  )
}
