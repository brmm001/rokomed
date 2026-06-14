export interface LessonTopic {
  title: string
  desc: string
  durationMin?: number
}

export interface LessonCategory {
  id: string
  name: string
  color: string
  glow: string
  emoji: string
  topics: LessonTopic[]
}

export const LESSON_CATALOG: LessonCategory[] = [
  {
    id: 'clinica',
    name: 'Clínica Médica',
    color: '#3B7EF8',
    glow: 'rgba(59,126,248,0.15)',
    emoji: '🫀',
    topics: [
      { title: 'Síndrome coronariana aguda', desc: 'IAMCSST vs IAMSSST, ECG, troponina, reperfusão e antiagregação plaquetária', durationMin: 55 },
      { title: 'Insuficiência cardíaca', desc: 'IC sistólica e diastólica, NYHA, BNP, quadrupla terapia e manejo do EAP', durationMin: 60 },
      { title: 'Arritmias mais cobradas em prova', desc: 'FA, flutter, TSV, WPW, bradiarritmias e indicações de cardioversão', durationMin: 50 },
      { title: 'Hipertensão arterial sistêmica', desc: 'Diagnóstico, metas pressóricas, classes e situações especiais (DM, IRC, gestação)', durationMin: 45 },
      { title: 'Crise hipertensiva', desc: 'Urgência vs emergência hipertensiva, alvos e escolha do anti-hipertensivo EV', durationMin: 35 },
      { title: 'Diabetes mellitus', desc: 'Critérios diagnósticos, metas de HbA1c, insulinoterapia e hipoglicemiantes orais', durationMin: 65 },
      { title: 'Cetoacidose diabética e estado hiperosmolar', desc: 'CAD vs EHH: critérios, reposição hídrica, insulina e monitorização do potássio', durationMin: 50 },
      { title: 'Distúrbios do sódio', desc: 'Hiponatremia e hipernatremia: déficit, velocidade de correção e riscos (mielinólise)', durationMin: 45 },
      { title: 'Distúrbios do potássio', desc: 'Hipocalemia e hipercalemia: ECG, causas, tratamento emergencial e reposição', durationMin: 40 },
      { title: 'Injúria renal aguda', desc: 'Critérios KDIGO, pré-renal vs intrínseca vs pós-renal, FeNa e sedimento urinário', durationMin: 50 },
      { title: 'Doença renal crônica', desc: 'Estadiamento TFG, anemia renal, osteodistrofia, hipervolemia e indicações de diálise', durationMin: 55 },
      { title: 'Anemias', desc: 'Ferropriva, megaloblástica, hemolítica, doença crônica e aplástica: diagnóstico diferencial', durationMin: 60 },
      { title: 'Leucemias e linfomas', desc: 'LMA, LLA, LLC, LMC, Hodgkin e não-Hodgkin: clínica, diagnóstico e tratamento', durationMin: 70 },
      { title: 'Tromboembolismo venoso e TEP', desc: 'TVP, TEP, escore de Wells, D-dímero, angioTC e anticoagulação (DOAC vs warfarina)', durationMin: 55 },
      { title: 'Sepse e choque séptico', desc: 'Critérios SEPSIS-3, SOFA, qSOFA, bundle da hora 1 e antibióticos empíricos', durationMin: 60 },
    ],
  },
  {
    id: 'infectologia',
    name: 'Infectologia',
    color: '#10B981',
    glow: 'rgba(16,185,129,0.15)',
    emoji: '🦠',
    topics: [
      { title: 'Pneumonia adquirida na comunidade', desc: 'CURB-65, estratificação, escolha do antibiótico e atípicos (Legionella, Mycoplasma)', durationMin: 50 },
      { title: 'Tuberculose', desc: 'Diagnóstico, esquema RHZE, TB-HIV, efeitos adversos e profilaxia com isoniazida', durationMin: 60 },
      { title: 'HIV e infecções oportunistas', desc: 'CD4 × infecções, TARV, IRIS, Pneumocystis, toxoplasmose e CMV', durationMin: 65 },
      { title: 'Infecção urinária', desc: 'Cistite, pielonefrite, ITU complicada, gestante e escolha do antibiótico', durationMin: 40 },
      { title: 'Meningites', desc: 'Análise do líquor, bacteriana vs viral vs TB, ceftriaxona e dexametasona', durationMin: 55 },
      { title: 'Hepatites virais', desc: 'HBV (HBsAg, sorologia), HCV, hepatite fulminante e indicações de tratamento', durationMin: 50 },
      { title: 'Dengue, zika e chikungunya', desc: 'Classificação de risco da dengue, NS1, sorologia e critérios de internação', durationMin: 45 },
      { title: 'Antibióticos na residência médica', desc: 'Espectros, mecanismos de resistência, cobertura de gram+ e gram−, ESBL e KPC', durationMin: 70 },
      { title: 'Infecções de pele e partes moles', desc: 'Celulite, erisipela, fasciíte necrosante, abscesso e MRSA comunitário', durationMin: 40 },
      { title: 'Endocardite infecciosa', desc: 'Critérios de Duke, flora, ecocardiograma, antibioticoterapia e indicações cirúrgicas', durationMin: 55 },
    ],
  },
  {
    id: 'cirurgia',
    name: 'Cirurgia Geral',
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.15)',
    emoji: '🔪',
    topics: [
      { title: 'Abdome agudo', desc: 'Causas, abordagem diagnóstica, peritonite e quando operar de emergência', durationMin: 50 },
      { title: 'Apendicite aguda', desc: 'Escore de Alvarado, sinais clínicos, diagnóstico por imagem e tratamento (cirúrgico x ATB)', durationMin: 45 },
      { title: 'Colecistite aguda', desc: 'Critérios de Tóquio, colecistectomia precoce vs eletiva e classificação de gravidade', durationMin: 45 },
      { title: 'Colangite', desc: 'Tríade e Pêntade de Charcot, CPRE de urgência e antibioticoterapia biliar', durationMin: 40 },
      { title: 'Pancreatite aguda', desc: 'Ranson, BISAP, Atlanta revisado, hidratação, antibiótico e necrose infectada', durationMin: 55 },
      { title: 'Obstrução intestinal', desc: 'Delgado vs cólon, aderências, vólvulo, radiografia e conduta cirúrgica', durationMin: 45 },
      { title: 'Hérnias da parede abdominal', desc: 'Inguinal (direta vs indireta), umbilical, incisional, encarceramento e estrangulamento', durationMin: 40 },
      { title: 'Trauma abdominal', desc: 'FAST, laparotomia de emergência, trauma hepático e esplênico: conservador vs cirúrgico', durationMin: 55 },
      { title: 'Hemorragia digestiva alta e baixa', desc: 'Escore de Rockall, EDA, HDA x HDB, tratamento endoscópico e cirúrgico', durationMin: 50 },
      { title: 'Cuidados pré e pós-operatórios', desc: 'Risco cirúrgico (Goldman, Lee), antibioticoprofilaxia, tromboprofilaxia e complicações', durationMin: 50 },
    ],
  },
  {
    id: 'pediatria',
    name: 'Pediatria',
    color: '#8B5CF6',
    glow: 'rgba(139,92,246,0.15)',
    emoji: '👶',
    topics: [
      { title: 'Crescimento e desenvolvimento', desc: 'Curvas de crescimento, marcos do DNPM, puberdade normal e desvios patológicos', durationMin: 50 },
      { title: 'Puericultura', desc: 'Consultas preventivas, avaliação nutricional, VDPCA, vitaminas D e K e orientação familiar', durationMin: 45 },
      { title: 'Imunização infantil', desc: 'Calendário SBP e PNI, vacinas combinadas, contraindicações e situações especiais', durationMin: 55 },
      { title: 'Aleitamento materno', desc: 'Benefícios, técnica, contraindicações, leite de banco e fórmulas infantis', durationMin: 40 },
      { title: 'Desidratação e terapia de reidratação oral', desc: 'Graus de desidratação, TRO (Plano A/B/C) e reposição EV com soro fisiológico', durationMin: 45 },
      { title: 'Bronquiolite', desc: 'VSR, diagnóstico clínico, critérios de internação, oxigênio e manejo suportivo', durationMin: 40 },
      { title: 'Asma na infância', desc: 'Classificação de gravidade, beta-2 de curta ação, corticosteroide e manejo da crise', durationMin: 50 },
      { title: 'Pneumonia na criança', desc: 'Critérios OMS, flora por faixa etária, antibiótico e critérios de internação pediátrica', durationMin: 45 },
      { title: 'Diarreia aguda na criança', desc: 'Rotavírus, norovírus, bacteriana, TRO e quando usar antibiótico em pediatria', durationMin: 40 },
      { title: 'Reanimação neonatal', desc: 'Fluxograma SBP/2021, VPP, intubação, massagem cardíaca e adrenalina em sala de parto', durationMin: 55 },
    ],
  },
  {
    id: 'go',
    name: 'Ginecologia e Obstetrícia',
    color: '#EC4899',
    glow: 'rgba(236,72,153,0.15)',
    emoji: '🌸',
    topics: [
      { title: 'Pré-natal de baixo risco', desc: 'Consultas, exames obrigatórios por trimestre, USG, ácido fólico e ferro', durationMin: 55 },
      { title: 'Sangramento da primeira metade da gestação', desc: 'Abortamento (tipos e conduta), gravidez ectópica, mola hidatiforme', durationMin: 50 },
      { title: 'Pré-eclâmpsia e eclâmpsia', desc: 'Critérios diagnósticos, HELLP, sulfato de magnésio, anti-hipertensivos e parto', durationMin: 60 },
      { title: 'Trabalho de parto e parto normal', desc: 'Fases do parto, partograma, distocias, indicações de cesariana e episiotomia', durationMin: 55 },
      { title: 'Corrimentos vaginais e ISTs', desc: 'Candida, vaginose bacteriana, tricomonas, sífilis, gonorreia e clamídia', durationMin: 50 },
    ],
  },
]
