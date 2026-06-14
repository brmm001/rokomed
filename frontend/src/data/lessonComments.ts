export interface CommentThread {
  id: string
  student: { name: string; initials: string; color: string }
  question: string
  time: string
  likes: number
  reply: string // uses **bold** markers and \n for line breaks
}

// Deterministic pool of student names, initials and colors
const STUDENTS_POOL = [
  { name: 'Lucas Marques', initials: 'LM', color: '#3B7EF8' },
  { name: 'Fernanda Lima', initials: 'FL', color: '#10B981' },
  { name: 'Rodrigo Barreto', initials: 'RB', color: '#F59E0B' },
  { name: 'Letícia Menezes', initials: 'LM', color: '#8B5CF6' },
  { name: 'Paulo Nascimento', initials: 'PN', color: '#EC4899' },
  { name: 'Gustavo Teles', initials: 'GT', color: '#3D82F6' },
  { name: 'Camila Rocha', initials: 'CR', color: '#14B8A6' },
  { name: 'Mariana Castro', initials: 'MC', color: '#EF4444' },
  { name: 'Thiago Oliveira', initials: 'TO', color: '#F59E0B' },
  { name: 'Beatriz Santos', initials: 'BS', color: '#8B5CF6' },
  { name: 'Vanessa Monteiro', initials: 'VM', color: '#3B7EF8' },
  { name: 'André Fonseca', initials: 'AF', color: '#10B981' },
  { name: 'Isabela Torres', initials: 'IT', color: '#EC4899' },
  { name: 'Felipe Araújo', initials: 'FA', color: '#8B5CF6' },
  { name: 'Natália Carmo', initials: 'NC', color: '#F59E0B' },
  { name: 'Samuel Viana', initials: 'SV', color: '#3B7EF8' },
  { name: 'Diego Carvalho', initials: 'DC', color: '#10B981' },
  { name: 'Juliana Prado', initials: 'JP', color: '#EC4899' },
  { name: 'Ana Luíza Ferreira', initials: 'AF', color: '#8B5CF6' },
  { name: 'Roberto Cunha', initials: 'RC', color: '#F59E0B' },
  { name: 'Alessandra Duarte', initials: 'AD', color: '#3B7EF8' },
  { name: 'Marcelo Santana', initials: 'MS', color: '#10B981' },
  { name: 'Renata Figueiredo', initials: 'RF', color: '#EC4899' },
  { name: 'Henrique Lopes', initials: 'HL', color: '#8B5CF6' },
  { name: 'Camila Freitas', initials: 'CF', color: '#F59E0B' },
  { name: 'Bruna Vasconcelos', initials: 'BV', color: '#14B8A6' },
  { name: 'Ricardo Dias', initials: 'RD', color: '#EF4444' },
  { name: 'Gabriela Mello', initials: 'GM', color: '#3B82F6' },
  { name: 'Fábio Ramos', initials: 'FR', color: '#10B981' },
  { name: 'Patrícia Sales', initials: 'PS', color: '#EC4899' },
]

// Returns a deterministic student profile based on lesson title and comment index
function getDeterministicStudent(title: string, index: number) {
  let hash = 0
  const combined = `${title}-${index}`
  for (let i = 0; i < combined.length; i++) {
    hash = combined.charCodeAt(i) + ((hash << 5) - hash)
  }
  const idx = Math.abs(hash) % STUDENTS_POOL.length
  return STUDENTS_POOL[idx]
}

const RAW_THREADS: { keywords: string[]; threads: { id: string; question: string; likes: number; reply: string }[] }[] = [
  // ─── Síndrome Coronariana Aguda ────────────────────────────────────────────
  {
    keywords: ['coronariana', 'infarto', 'iamcsst', 'iamssst'],
    threads: [
      {
        id: 'sca-1',
        likes: 47,
        question: 'Qual a diferença prática entre IAMCSST e IAMSSST? No ECG, o que caracteriza cada um? Me confundo muito quando caem os dois na mesma questão.',
        reply: `**IAMCSST (com supra de ST):**
• ECG: supradesnivelamento ≥ 1mm em ≥ 2 derivações contíguas de membros, ou ≥ 2mm em V1-V3. **BRE novo** equivale a supra.
• Fisiopatologia: oclusão coronária TOTAL → necrose transmural.
• Conduta: reperfusão IMEDIATA (ICP primária em < 90 min).

**IAMSSST (sem supra de ST):**
• ECG: infradesnivelamento de ST ≥ 0.5mm, inversão de T, ou ECG normal com troponina elevada.
• Fisiopatologia: oclusão subtotal → necrose subendocárdica.
• Conduta: estratificar risco (TIMI/GRACE) e cateterismo em 24-72h.

**Mnemônico:** CSST = "Completo" (oclusão total → corre pro cateter). SSST = "Subtotal" (estabiliza e estratifica).`
      },
      {
        id: 'sca-2',
        likes: 38,
        question: 'No infarto inferior, por que devemos evitar o uso de nitratos e morfina? Qual a explicação hemodinâmica?',
        reply: `Excelente pergunta! No **infarto de parede inferior** (geralmente por oclusão de Coronária Direita), há acometimento frequente do **Ventrículo Direito (VD)**.
• O VD é altamente dependente de **pré-carga** para manter o débito cardíaco.
• **Nitratos** (vasodilatadores venosos) e **morfina** reduzem drasticamente o retorno venoso (pré-carga).
• Usá-los pode precipitar **hipotensão grave e choque cardiogênico**.

**Conduta no infarto de VD:**
• Hidratação com SF/Ringer se hipotenso.
• Evitar diuréticos, nitratos e morfina.
• Monitorar com derivações direitas (V3R e V4R).`
      }
    ]
  },
  // ─── Insuficiência Cardíaca ─────────────────────────────────────────────────
  {
    keywords: ['insuficiencia cardiaca', 'cardiaca', 'fer', 'fep'],
    threads: [
      {
        id: 'ic-1',
        likes: 54,
        question: 'Qual a diferença no tratamento farmacológico da ICFEr (fração de ejeção reduzida) e ICFEp (preservada)?',
        reply: `**ICFEr (FE < 40%):**
Tem a **quádrupla terapia** mandatória com redução comprovada de mortalidade:
1. **IECA/BRA** ou **Sacubitril-Valsartana (ARNI)**.
2. **Betabloqueador** (Carvedilol, Succinato de Metoprolol ou Bisoprolol).
3. **Antagonista de Aldosterona** (Espironolactona).
4. **Inibidor de SGLT2** (Dapagliflozina ou Empagliflozina).

**ICFEp (FE ≥ 50%):**
• O tratamento é voltado para controle de sintomas (congestão) e tratamento de comorbidades (HAS, DM).
• Os **iSGLT2** mostraram redução de internação hospitalar (estudos EMPEROR-Preserved e DELIVER), sendo a única classe com recomendação forte recente.`
      },
      {
        id: 'ic-2',
        likes: 42,
        question: 'Como classificar hemodinamicamente a IC descompensada no pronto-socorro (perfis A, B, L, C)?',
        reply: `Essa classificação avalia **Congestão** (Quente/Frio) e **Perfusão** (Úmido/Seco):

• **Perfil A (Quente e Seco):** Sem congestão, bem perfundido. Investigar outra causa de dispneia.
• **Perfil B (Quente e Úmido):** Congesto e bem perfundido. **Mais comum!** Tratar com diurético de alça (Furosemida) + vasodilatador (Nitroglicerina/Nitroprussiato).
• **Perfil L (Frio e Seco):** Mal perfundido e sem congestão. Hidratar com cautela.
• **Perfil C (Frio e Úmido):** Congesto e mal perfundido. **Grave!** Requer inotrópico (Dobutamina) e ajuste hemodinâmico.`
      }
    ]
  },
  // ─── Arritmias ──────────────────────────────────────────────────────────────
  {
    keywords: ['arritmias', 'fibrilacao', 'flutter', 'tsv', 'bradicardia'],
    threads: [
      {
        id: 'arr-1',
        likes: 61,
        question: 'Na Fibrilação Atrial estável, qual a melhor estratégia: controle de ritmo (reverter para sinusal) ou controle de frequência?',
        reply: `Estudos grandes (como o AFFIRM) demonstraram que, na maioria dos pacientes estáveis, o **controle de frequência** tem desfechos semelhantes ao controle de ritmo em termos de mortalidade.
• **Controle de Frequência:** Preferencial em idosos e assintomáticos. Alvo FC < 110 bpm com betabloqueadores (Metoprolol) ou bloqueadores de canais de cálcio (Diltiazem).
• **Controle de Ritmo:** Reservado para pacientes jovens, muito sintomáticos ou IC refratária.

**Lembrete de ouro:** O controle de ritmo requer avaliação do tempo de FA (>48h exige anticoagulação prévia por 3 semanas ou ecocardiograma transesofágico para excluir trombo).`
      },
      {
        id: 'arr-2',
        likes: 49,
        question: 'Como diferenciar no ECG uma Taquicardia Supraventricular (TSV) por reentrada nodal de uma FA com condução aberrante?',
        reply: `Diferenciação crucial no PS:
• **TSV (reentrada nodal):** Ritmo **perfeitamente regular**, FC geralmente 150-220 bpm, onda P oculta ou retrógrada (pseudo s em D2/pseudo r' em V1).
• **FA com aberrância:** Ritmo **completamente irregular** (RR irregular), QRS alargado (bloqueio de ramo funcional).

**Pearl de Conduta:** Na TSV estável, faça massagem carotídea ou **Adenosina 6mg EV rápido** em bólus. Se instável, cardioversão elétrica sincronizada imediata.`
      }
    ]
  },
  // ─── Hipertensão Arterial ───────────────────────────────────────────────────
  {
    keywords: ['hipertensao', 'has', 'pressao arterial', 'anti-hipertensivo'],
    threads: [
      {
        id: 'has-1',
        likes: 39,
        question: 'Quais os anti-hipertensivos de escolha para pacientes com Doença Renal Crônica (DRC) ou microalbuminúria?',
        reply: `Em pacientes com DRC e proteinúria/microalbuminúria, os **IECA (Enalapril/Captopril)** ou **BRA (Losartana/Valsartana)** são de primeira escolha.
• **Mecanismo:** Promovem vasodilatação da arteríola eferente, reduzindo a pressão intraglomerular e a progressão da proteinúria.
• **Atenção:** Monitorar creatinina e potássio. Um aumento de até 30% na creatinina após início é aceitável. Se K+ > 5.5 ou TFG cair muito, suspender.`
      },
      {
        id: 'has-2',
        likes: 31,
        question: 'Como manejar a hipertensão na gestante? Quais drogas são proibidas e quais são seguras?',
        reply: `Segurança fetal em primeiro lugar:
• **Drogas Seguras (1ª linha):** Metildopa, Hidralazina, Nifedipino.
• **Drogas Proibidas (Teratogênicas):** IECA e BRA (causam disfunção renal fetal, oligodramnia e malformações).
• **Meta Pressórica:** Manter PA entre 130-150 / 80-100 mmHg. Evitar reduzir demais para não prejudicar o fluxo uteroplacentário.`
      }
    ]
  },
  // ─── Crise Hipertensiva ─────────────────────────────────────────────────────
  {
    keywords: ['crise', 'emergencia hipertensiva', 'urgencia hipertensiva'],
    threads: [
      {
        id: 'ch-1',
        likes: 45,
        question: 'Qual a diferença no tempo de redução da PA entre uma Urgência e uma Emergência Hipertensiva?',
        reply: `Diferença crítica de conduta no PS:
• **Urgência Hipertensiva:** Sem lesão de órgão-alvo aguda. Redução lenta (em 24 a 48h) com medicamentos **orais** (Captopril, Clonidina). Evitar Nifedipino sublingual (queda abrupta pode causar isquemia cerebral/coronariana).
• **Emergência Hipertensiva:** Presença de lesão aguda de órgão-alvo (Ex: EAP, Dissecção Aórtica, AVC). Redução imediata (minutos a horas) com medicação **endovenosa** (Nitroprussiato de Sódio ou Nitroglicerina).

**Exceção:** Na Dissecção Aguda de Aorta, a meta é reduzir a PAS para < 120 mmHg e FC < 60 bpm em até 20 minutos (usando Labetalol ou Nitroprussiato + Betabloqueador).`
      }
    ]
  },
  // ─── Diabetes Mellitus ──────────────────────────────────────────────────────
  {
    keywords: ['diabetes', 'glicemia', 'insulina', 'metformina', 'hba1c'],
    threads: [
      {
        id: 'dm-1',
        likes: 58,
        question: 'Quando indicar insulina de início no diagnóstico de Diabetes Tipo 2?',
        reply: `A indicação de insulinoterapia imediata no DM2 ocorre quando há sinais de **glicotoxicidade** ou catabolismo:
1. **Glicemia de jejum > 300 mg/dL** ou **HbA1c > 10%**.
2. **Sintomas clássicos de perda de peso**, poliúria, polidipsia marcantes.
3. Presença de cetoacidose ou cetonúria.

Após a estabilização da glicotoxicidade, é possível tentar associar ou migrar para hipoglicemiantes orais.`
      },
      {
        id: 'dm-2',
        likes: 42,
        question: 'Quais os benefícios adicionais dos inibidores de SGLT2 e análogos de GLP-1 além do controle glicêmico?',
        reply: `São as classes "queridinhas" das diretrizes modernas devido a desfechos extraglicêmicos:
• **iSGLT2 (Dapagliflozina, Empagliflozina):** Excelentes desfechos de **cardioproteção** (redução de internação por IC) e **nefroproteção** (redução da taxa de declínio da TFG).
• **GLP-1 (Semaglutida, Liraglutida):** Forte redução de peso, além de redução de eventos cardiovasculares maiores (MACE - morte CV, IAM, AVC). Indica-se prioritariamente em obesos com doença cardiovascular estabelecida.`
      }
    ]
  },
  // ─── Cetoacidose e Estado Hiperosmolar ──────────────────────────────────────
  {
    keywords: ['cetoacidose', 'cad', 'estado hiperosmolar', 'ehh'],
    threads: [
      {
        id: 'cad-1',
        likes: 51,
        question: 'Por que o potássio deve ser dosado antes de iniciar a insulina na Cetoacidose Diabética?',
        reply: `Esse é um dos erros mais fatais no PS. A insulina funciona abrindo os canais celulares e jogando glicose para dentro, mas carrega o potássio junto (desvio intracelular).
• Se o **Potássio sérico for < 3.3 mEq/L**, NÃO inicie insulina!
• Faça reposição de Potássio antes. Iniciar insulina com potássio baixo precipita **arritmias graves e parada cardiorrespiratória**.
• Se potássio estiver entre 3.3 e 5.2, repor potássio junto com a infusão de insulina.`
      }
    ]
  },
  // ─── Distúrbios do Sódio ────────────────────────────────────────────────────
  {
    keywords: ['sodio', 'hiponatremia', 'hipernatremia', 'mielinose'],
    threads: [
      {
        id: 'na-1',
        likes: 56,
        question: 'Qual o risco de corrigir muito rápido a hiponatremia crônica? Qual o limite seguro?',
        reply: `A correção rápida da hiponatremia crônica pode levar à **Síndrome de Desmielinização Osmótica** (antiga mielinólise pontina).
• Ocorre porque as células cerebrais perdem água rapidamente para o meio extracelular hipertônico, causando retração neuronal e desmielinização.
• **Limite Seguro de Correção:** Não exceder **8 a 10 mEq/L nas primeiras 24 horas**.
• Em caso de hiponatremia sintomática grave (crise convulsiva, coma), usa-se salina hipertônica a 3% com meta de elevar 4-6 mEq/L rapidamente para controle dos sintomas, respeitando o limite diário.`
      }
    ]
  },
  // ─── Distúrbios do Potássio ─────────────────────────────────────────────────
  {
    keywords: ['potassio', 'hipocalemia', 'hipercalemia', 'gluconato'],
    threads: [
      {
        id: 'k-1',
        likes: 48,
        question: 'Quais as alterações eletrocardiográficas da hipercalemia e qual a conduta imediata para proteger o miocárdio?',
        reply: `A hipercalemia é uma emergência médica que altera o potencial de membrana miocárdica:
• **Alterações no ECG (em ordem de gravidade):**
  1. Onda T alta, simétrica e pontiaguda ("em tenda").
  2. Achatamento de onda P e prolongamento do intervalo PR.
  3. Alargamento do QRS (onda sinoidal - pré-parada).

• **Conduta Imediata se alterações no ECG:** **Gluconato de Cálcio a 10% EV** (1 ampola em 5-10 min).
• **Atenção:** O gluconato de cálcio NÃO reduz o potássio sérico. Ele apenas estabiliza a membrana cardíaca para evitar arritmias letais. Para baixar o potássio, use insulina + glicose (solução polarizante), beta-2 agonista inalatório ou resinas de troca.`
      }
    ]
  },
  // ─── Injúria Renal Aguda ────────────────────────────────────────────────────
  {
    keywords: ['injuria renal', 'renal aguda', 'aki', 'ira', 'kdigo'],
    threads: [
      {
        id: 'ira-1',
        likes: 43,
        question: 'Como diferenciar a IRA Pré-Renal da Necrose Tubular Aguda (NTA) usando índices urinários?',
        reply: `A diferenciação orienta a terapia (hidratação vs restrição):

• **IRA Pré-renal:** Rim está hipoperfundido, mas funcional (retém sódio/água):
  - Sódio urinário: < 20 mEq/L
  - **Fração de Excreção de Sódio (FeNa): < 1%**
  - Osmolaridade urinária: > 500 mOsm
  - Sedimento: Cilindros hialinos

• **Necrose Tubular Aguda (Intrínseca):** Lesão celular impede reabsorção:
  - Sódio urinário: > 40 mEq/L
  - **FeNa: > 2%**
  - Osmolaridade urinária: < 350 mOsm
  - Sedimento: **Cilindros granulosos escuros ("sujos")**`
      }
    ]
  },
  // ─── Doença Renal Crônica ───────────────────────────────────────────────────
  {
    keywords: ['doenca renal cronica', 'drc', 'uremia', 'dialise'],
    threads: [
      {
        id: 'drc-1',
        likes: 52,
        question: 'Quais são as principais indicações de diálise de urgência em pacientes com DRC ou IRA?',
        reply: `Memorize o mnemônico das vogais (**AEIOU**):
• **A - Acidose:** Acidose metabólica grave refratária (pH < 7.1).
• **E - Eletrólitos:** Hipercalemia refratária grave (> 6.5 mEq/L com alterações no ECG).
• **I - Intoxicação:** Por drogas dialisáveis (lítio, salicilatos, metanol, etilenoglicol).
• **O - Overload:** Hipervolemia refratária (EAP que não responde a diuréticos).
• **U - Uremia:** Encefalopatia urêmica, pericardite urêmica ou hemorragia por disfunção plaquetária urêmica.`
      }
    ]
  },
  // ─── Anemias ────────────────────────────────────────────────────────────────
  {
    keywords: ['anemias', 'ferropriva', 'megaloblastica', 'hemolitica'],
    threads: [
      {
        id: 'an-1',
        likes: 49,
        question: 'Como diferenciar a Anemia Ferropriva da Anemia de Doença Crônica usando o perfil de ferro?',
        reply: `Ambas são anemias microcíticas/normocíticas, mas o perfil de ferro as diferencia:

• **Anemia Ferropriva:** Falta ferro no estoque e na circulação:
  - Ferro sérico: Baixo
  - **Ferritina: Baixa (< 30 ng/mL)** — Melhor parâmetro!
  - TIBC (Capacidade de ligação): Alta

• **Anemia de Doença Crônica:** Ferro está preso nos estoques (macrófagos) devido à inflamação (hepcidina alta):
  - Ferro sérico: Baixo
  - **Ferritina: Normal ou Alta**
  - TIBC: Baixa ou Normal`
      }
    ]
  },
  // ─── Sepse e Choque Séptico ─────────────────────────────────────────────────
  {
    keywords: ['sepse', 'choque septico', 'sofa', 'bundle', 'lactato'],
    threads: [
      {
        id: 'sep-1',
        likes: 68,
        question: 'O que define o Choque Séptico de acordo com a conferência Sepsis-3?',
        reply: `Segundo o **Sepsis-3**, o choque séptico é um subgrupo da sepse em que as alterações circulatórias e celulares são graves o suficiente para aumentar substancialmente a mortalidade.
Clinicamente, é definido por:
1. Necessidade de **vasopressor** (Noradrenalina) para manter a PAM ≥ 65 mmHg, **E**
2. **Lactato sérico > 2 mmol/L** (18 mg/dL) mesmo após ressuscitação volêmica adequada.

**Mortalidade:** Associa-se a uma mortalidade hospitalar superior a 40%.`
      }
    ]
  },
  // ─── Pneumonia Adquirida na Comunidade ──────────────────────────────────────
  {
    keywords: ['pneumonia', 'pac', 'curb'],
    threads: [
      {
        id: 'pac-1',
        likes: 52,
        question: 'Como calcular e aplicar o escore CURB-65 para decidir o local de tratamento na PAC?',
        reply: `O escore **CURB-65** pontua de 0 a 5 com os seguintes critérios:
• **C - Confusão:** Confusão mental desorientada recente.
• **U - Ureia:** Ureia plasmática ≥ 50 mg/dL (ou BUN > 19).
• **R - Respiração:** Frequência respiratória ≥ 30 irpm.
• **B - Blood Pressure:** PAS < 90 mmHg ou PAD ≤ 60 mmHg.
• **65 - Idade:** Idade ≥ 65 anos.

**Manejo:**
- **0 ou 1 ponto:** Tratamento ambulatorial.
- **2 pontos:** Considerar internação hospitalar (enfermaria).
- **3 a 5 pontos:** Internação de urgência, avaliar vaga em UTI se score ≥ 4.`
      }
    ]
  },
  // ─── Tuberculose ────────────────────────────────────────────────────────────
  {
    keywords: ['tuberculose', 'rhze', 'isoniazida'],
    threads: [
      {
        id: 'tb-1',
        likes: 47,
        question: 'Quais os principais efeitos colaterais do esquema básico de Tuberculose (RHZE) e qual droga causa neurite óptica?',
        reply: `O esquema **RHZE (Rifampicina, Isoniazida, Pirazinamida e Etambutol)** requer acompanhamento rigoroso:
• **Hepatotoxicidade:** Principal efeito colateral compartilhado por **R, H e Z**. Deve-se suspender o tratamento se transaminases subirem > 3x com sintomas ou > 5x sem sintomas.
• **Etambutol (E):** Causa **neurite óptica retrobulbar** (redução da acuidade visual e perda da discriminação de cores verde/vermelho). **Não usar em crianças menores de 5-7 anos** que não conseguem fazer teste visual.
• **Rifampicina (R):** Urina e suor avermelhados (benigno), além de ser potente indutor do CYP450 (reduz efeito de anticoncepcionais, anticoagulantes).
• **Isoniazida (H):** Neurite periférica (prevenida com reposição de **Piridoxina/Vitamina B6**).`
      }
    ]
  },
  // ─── Apendicite Aguda ───────────────────────────────────────────────────────
  {
    keywords: ['apendicite', 'mcburney', 'alvarado'],
    threads: [
      {
        id: 'ap-1',
        likes: 44,
        question: 'Qual a ordem cronológica dos sintomas na apendicite aguda (Tríade de Murphy)?',
        reply: `A apresentação clássica da apendicite inicia com:
1. **Dor periumbilical difusa ou epigástrica** (cólica visceral).
2. Associada a **náuseas, vômitos ou anorexia** (quase 100% dos casos).
3. **Migração da dor para a Fossa Ilíaca Direita (FID)** após 12-24h, tornando-se contínua e bem localizada (peritonismo no ponto de McBurney).

**Dica de Prova:** A presença de **Sinal de Blumberg** (dor à descompressão brusca na FID) confirma a irritação peritoneal local.`
      }
    ]
  },
  // ─── Pancreatite Aguda ───────────────────────────────────────────────────────
  {
    keywords: ['pancreatite', 'amilase', 'lipase', 'ranson'],
    threads: [
      {
        id: 'pan-1',
        likes: 50,
        question: 'Para o diagnóstico de Pancreatite Aguda, precisamos de exames de imagem em todos os pacientes?',
        reply: `Não! O diagnóstico de pancreatite aguda baseia-se na presença de pelo menos **2 dos 3 critérios** de Atlanta:
1. **Dor abdominal típica:** Epigástrica em barra, com irradiação para o dorso.
2. **Enzimas pancreáticas (Amilase ou Lipase) elevadas ≥ 3x** o limite superior da normalidade.
3. Achados típicos em exames de imagem (TC, RM ou USG).

Portanto, se o paciente tem dor típica e lipase/amilase elevadas ≥ 3x, **o diagnóstico está fechado**. A TC com contraste só deve ser solicitada após 48-72h em caso de dúvida diagnóstica ou piora clínica para avaliar complicações (necrose, coleções).`
      }
    ]
  },
  // ─── Pré-eclâmpsia e Eclâmpsia ──────────────────────────────────────────────
  {
    keywords: ['eclampsia', 'pre-eclampsia', 'magnesio'],
    threads: [
      {
        id: 'pe-1',
        likes: 53,
        question: 'Qual a dose de ataque e manutenção do Sulfato de Magnésio no tratamento e prevenção da Eclâmpsia?',
        reply: `O **Sulfato de Magnésio (MgSO4)** é o padrão-ouro. O esquema clássico de **Pritchard** (intramuscular) ou **Zuspan** (endovenoso) é muito cobrado:

• **Esquema de Zuspan (EV - preferencial):**
  - **Ataque:** 4g a 6g EV diluídos, infundir em 20 minutos.
  - **Manutenção:** 1g a 2g por hora em infusão contínua.

• **Sinais de Intoxicação (Monitoramento obrigatório):**
  - Reflexo patelar (deve estar presente).
  - Frequência respiratória (deve ser > 12-16 irpm).
  - Débito urinário (deve ser > 25-30 mL/h, pois o magnésio é excretado pelo rim).

**Antídoto:** **Gluconato de Cálcio a 10%** (10 mL EV lento).`
      }
    ]
  }
]

// Map raw threads into the UI structure with deterministic student assignment
export function getCommentsForLesson(title: string, groupName?: string): CommentThread[] {
  const search = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const group = (groupName ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  
  // Find matching raw thread in catalog
  let matchedGroup = RAW_THREADS.find(entry => 
    entry.keywords.some(keyword => search.includes(keyword) || group.includes(keyword))
  )

  const rawThreads = matchedGroup ? matchedGroup.threads : [
    {
      id: 'gen-1',
      likes: 21,
      question: 'Quais os principais pontos anatômicos e fisiológicos que costumam ser mais cobrados nas provas sobre este tema?',
      reply: `Excelente dúvida! Para as provas de residência, o foco deve ser direcionado a:
• **Fisiopatologia inicial:** O mecanismo de instalação da patologia.
• **Quadro clínico clássico:** Reconhecer os sinais de gravidade e as síndromes associadas.
• **Exames de triagem vs padrão-ouro:** Saber qual exame pedir primeiro e qual confirma o diagnóstico.
• **Tratamento de escolha:** A medicação de primeira linha e doses clássicas.`
    },
    {
      id: 'gen-2',
      likes: 14,
      question: 'Como diferenciar a conduta terapêutica inicial em um paciente estável de um instável nesse cenário clínico?',
      reply: `Dica de ouro para provas de emergência médica:
• **Instável (Hipotensão, alteração do nível de consciência, congestão pulmonar grave, dor precordial refratária):** A conduta é imediata e intervencionista (cardioversão, cirurgia de emergência, suporte circulatório).
• **Estável:** Permite investigação diagnóstica adicional, exames de laboratório e terapia clínica escalonada.`
    }
  ]

  // Map to unified CommentThread structure with deterministic student profiles
  return rawThreads.map((t, index) => {
    const student = getDeterministicStudent(title, index)
    // Relative dates spread out
    const relativeTimes = ['2 dias atrás', '4 dias atrás', '1 semana atrás']
    const time = relativeTimes[index % relativeTimes.length]
    
    return {
      id: t.id,
      student,
      question: t.question,
      time,
      likes: t.likes,
      reply: t.reply
    }
  })
}
