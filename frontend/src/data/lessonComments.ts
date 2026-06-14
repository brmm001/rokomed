export interface CommentThread {
  id: string
  student: { name: string; initials: string; color: string }
  question: string
  time: string
  likes: number
  reply: string // uses **bold** markers and \n for line breaks
}

const THREADS: { keywords: string[]; threads: CommentThread[] }[] = [
  // ─── Síndrome Coronariana Aguda ────────────────────────────────────────────
  {
    keywords: ['coronariana', 'infarto', 'iamcsst', 'iamssst', 'miocárdio', 'stemi', 'iam'],
    threads: [
      {
        id: 'sca-1', student: { name: 'Rodrigo Barreto', initials: 'RB', color: '#3B7EF8' },
        question: 'Qual a diferença prática entre IAMCSST e IAMSSST? No ECG, o que caracteriza cada um? Me confundo muito quando caem os dois na mesma questão.',
        time: '2 dias atrás', likes: 47,
        reply: `Pergunta certeira, Rodrigo — e muito cobrada! Vou organizar isso de forma que você nunca mais confunda:

**IAMCSST (com supra de ST):**
• ECG: supradesnivelamento ≥ 1mm em ≥ 2 derivações contíguas de membros, ou ≥ 2mm em V1-V3. **BRE novo** equivale a supra e conta como IAMCSST!
• Fisiopatologia: oclusão coronária TOTAL → necrose transmural em desenvolvimento
• Conduta: reperfusão IMEDIATA. ICP primária em < 90 min do 1º contato médico (ou < 120 min do diagnóstico se precisar de transferência)

**IAMSSST (sem supra de ST):**
• ECG: infradesnivelamento de ST ≥ 0,5mm, inversão simétrica de onda T, ou até ECG **completamente normal** — com troponina elevada
• Fisiopatologia: oclusão parcial → necrose subendocárdica
• Conduta: estratifique pelo **TIMI** ou **GRACE**, anticoague e leve para ICP em 24-72h conforme risco

**Mnemônico de ouro:** CSST = "Completo" (oclusão total → Corre pro cateterismo). SSST = "Subtotal" (estabiliza, estratifica).

**Pearl de prova:** Supra em **aVR + infra difuso (V4-V6)** = oclusão de TCE ou DA proximal → equivale a IAMCSST mesmo sem supra convencional! Isso cai muito em prova de cardiologia.`
      },
      {
        id: 'sca-2', student: { name: 'Letícia Menezes', initials: 'LM', color: '#10B981' },
        question: 'Qual a medicação que devo dar no PS antes da ICP? Ouço falar em AAS, heparina, ticagrelor... fico perdida na ordem certa.',
        time: '5 dias atrás', likes: 61,
        reply: `Letícia, vou te dar o protocolo antitrombótico com a lógica de cada droga:

**1. AAS 300 mg mastigado — PRIMEIRO, sempre**
Inibe COX-1 → bloqueia tromboxano A2 → inibe agregação plaquetária. Base de qualquer SCA.

**2. Inibidor de P2Y12 — logo após o AAS**
• **Ticagrelor 180mg** é o preferencial (mais rápido, mais potente, reduziu mortalidade no estudo PLATO)
• **Clopidogrel 300-600mg**: reservado para quem vai receber fibrinolítico ou tem contraindicação ao ticagrelor

**3. Anticoagulante**
• IAMCSST + ICP: **HNF EV** em bolus na sala de hemodinâmica
• IAMSSST sem ICP imediata: **fondaparinux** é o preferencial (menos sangramento que HNF)
• IAMSSST + ICP: enoxaparina ou HNF

**Ordem prática no PS:**
AAS → P2Y12 → ECG/troponina → acionamento do cardio → anticoagulação → cateterismo

**Pearl importantíssima:** No IAMCSST, o **oxigênio suplementar só se SpO2 < 90%!** Hiperóxia em pacientes normóxicos causa vasoconstrição coronária e aumenta a área de necrose. Cai muito em prova e a maioria dos candidatos erra por "intuição".`
      },
      {
        id: 'sca-3', student: { name: 'Paulo Nascimento', initials: 'PN', color: '#F59E0B' },
        question: 'Quando indicar trombólise ao invés da ICP? E como saber se a trombólise funcionou depois de aplicar?',
        time: '1 semana atrás', likes: 39,
        reply: `Excelente, Paulo! Trombólise x ICP é questão clássica. Vamos lá:

**Quando trombolisar?**
Quando a ICP primária **não estiver disponível em < 120 min** do diagnóstico. A trombólise é sempre no IAMCSST — nunca no IAMSSST (piora desfechos).

**Contraindicações absolutas (cobradas toda prova):**
• AVC hemorrágico a qualquer tempo
• AVC isquêmico nos últimos 6 meses
• TCE grave nos últimos 3 meses
• Dissecção aórtica
• Sangramento ativo (exceto menstrual)
• Cirurgia intracraniana/intraespinhal recente

**Critérios de reperfusão bem-sucedida (avaliar em 60-90 min):**
• ✅ Redução **≥ 50%** do supradesnivelamento do ST
• ✅ Alívio completo ou significativo da dor
• ✅ **RIVA** (ritmo idioventricular acelerado) — sinal de reperfusão!
• ✅ Pico precoce da CK-MB (wash-out pela abertura do vaso)

**Se falhou a trombólise → ICP de resgate em 3-24h!**

**Pearl:** O **RIVA** é um sinal BENIGNO e DESEJADO após trombólise — indica reperfusão do miocárdio. Muita gente confunde com TV maligna, mas nesse contexto é um bom sinal. A diferença: RIVA tem FC 60-120 bpm, é bem tolerado e resolve espontaneamente.`
      },
    ],
  },

  // ─── Insuficiência Cardíaca ─────────────────────────────────────────────────
  {
    keywords: ['insuficiência cardíaca', 'cardíaca', 'fração de ejeção', 'bnp', 'nyha', 'edema agudo', 'ic sistólica'],
    threads: [
      {
        id: 'ic-1', student: { name: 'Fernanda Lima', initials: 'FL', color: '#8B5CF6' },
        question: 'Como diferencio IC sistólica de IC diastólica? Ambas têm dispneia e edema, fico confusa no diagnóstico diferencial.',
        time: '3 dias atrás', likes: 52,
        reply: `Fernanda, a diferença central está no **ecocardiograma**, mas a clínica já dá pistas importantes:

**IC com FE reduzida (ICFEr) — "sistólica" — FE < 40%:**
• Dilatação do VE → coração "cansado" que não contrai bem
• Cardiomegalia importante na Rx de tórax
• **3ª bulha (B3 = galope)** — ventrículo dilatado vibrando ao encher passivamente
• Perfil típico: homem de meia-idade, pós-SCA ou miocardiopatia dilatada

**IC com FE preservada (ICFEp) — "diastólica" — FE ≥ 50%:**
• Ventrículo rígido que não relaxa → enchimento prejudicado
• Coração menos dilatado (hipertrofia concêntrica)
• Perfil típico: mulher idosa hipertensa com DM

**BNP/NT-proBNP:** Eleva nos **dois tipos** — serve para confirmar IC e guiar tratamento, não para diferenciar sistólica de diastólica.

**Tratamento: quem tem a evidência mais sólida?**
A **ICFEr** tem a "quadrupla terapia" com redução de mortalidade comprovada. A ICFEp tem tratamento menos definido — basicamente controlar a causa e usar diurético para congestão.

**Pearl de prova:** ICFEp + HAS → alvo pressórico agressivo (< 130/80). A HAS é a causa mais tratável da ICFEp!`
      },
      {
        id: 'ic-2', student: { name: 'Gustavo Teles', initials: 'GT', color: '#EC4899' },
        question: 'Edema agudo de pulmão: quais medicamentos dar e em qual ordem? Sempre confundo morfina com nitrato.',
        time: '1 semana atrás', likes: 68,
        reply: `Gustavo, o EAP é emergência que exige raciocínio rápido! Memorize o mnemônico **LMNOP**:

**L — Lasix (furosemida) 40-80 mg EV**
Além da diurese (que demora 20-30 min), tem vasodilatação venosa *imediata* (em minutos). Dá PRIMEIRO.

**M — Morfina 2-4 mg EV**
Reduz pré-carga (venodilatação), alivia ansiedade e taquicardia. Hoje é controversa — pode causar hipotensão e retenção de CO₂. Algumas UTIs já não usam de rotina.

**N — Nitrato (nitroglicerina)**
Sublingual inicialmente → EV se PAS > 90 mmHg. Reduz pré E pós-carga. É o principal vasodilatador — muito eficaz!

**O — Oxigênio**
Alvo SpO₂ > 94%. Se não mantiver com O₂ convencional → **VNI (CPAP ou BiPAP) antes de intubar!** VNI salva vidas no EAP — reduz necessidade de intubação em ~60%.

**P — Posição sentada**
Posição ortostática reduz retorno venoso e alivia o trabalho respiratório. Simples e eficaz.

**Pearl crítica:** PAS < 90 mmHg = EAP + **choque cardiogênico**! Aqui NÃO use nitrato (piora hipotensão). Use **dobutamina** + **noradrenalina** e considere balão intra-aórtico. Muda completamente o manejo!`
      },
      {
        id: 'ic-3', student: { name: 'Camila Rocha', initials: 'CR', color: '#10B981' },
        question: 'Qual é a "quadrupla terapia" da IC com FE reduzida? Vejo esse termo em todo lugar mas não sei exatamente quais são as 4 drogas.',
        time: '4 dias atrás', likes: 84,
        reply: `Camila, essa é A pergunta do momento em cardiologia! As 4 drogas com redução de mortalidade comprovada (classe I de evidência):

**1. IECA / BRA (ou preferencial: ARNI)**
IECA (enalapril) ou BRA (losartana) bloqueiam o SRAA. Mas hoje o **ARNI — sacubitril/valsartana (Entresto®)** é superior ao IECA em mortalidade no estudo PARADIGM-HF. Troca o IECA pelo ARNI se o paciente tolerar.

**2. Betabloqueador**
Apenas 3 com evidência em IC: **carvedilol**, **bisoprolol** e **succinato de metoprolol**. O **atenolol NÃO** tem evidência em IC — pegadinha clássica de prova! Nunca inicie na descompensação aguda — aguarde euvolemia.

**3. Antagonista de mineralocorticoide (ARM)**
Espironolactona ou eplerenona. Contraindicado se K⁺ > 5,0 ou creatinina > 2,5 (risco de hipercalemia fatal).

**4. Inibidor de SGLT-2**
Dapagliflozina ou empagliflozina — reduzem hospitalização e morte CV **independentemente do diabetes!** São os mais recentes e completam a quadrupla.

**Mnemônico: BRAS** — **B**etabloqueador + **R**AI (ou ARNI) + **A**ldosterona antagonista + **S**GLT-2 inibidor

**Pearl de ouro:** A combinação das 4 drogas reduz mortalidade em até 60% vs placebo. Cada classe age por mecanismo distinto e os efeitos são aditivos — por isso tratamos com todas.`
      },
    ],
  },

  // ─── Sepse ──────────────────────────────────────────────────────────────────
  {
    keywords: ['sepse', 'choque séptico', 'sepsis', 'sofa', 'bundle', 'lactato', 'sirs'],
    threads: [
      {
        id: 'sep-1', student: { name: 'Mariana Castro', initials: 'MC', color: '#3B7EF8' },
        question: 'Qual a diferença entre SIRS, sepse e choque séptico pelo SEPSIS-3? O critério de 2014 era diferente e estou confusa.',
        time: '2 dias atrás', likes: 73,
        reply: `Mariana, o SEPSIS-3 (2016) mudou tudo. Entender o porquê da mudança ajuda a memorizar:

**Definição SEPSIS-3:**
Sepse = disfunção orgânica ameaçadora à vida causada por resposta *desregulada* do hospedeiro à infecção.
Critério prático: **SOFA ≥ 2 pontos** acima do basal + infecção suspeita ou confirmada.

**Choque séptico = sepse MAIS:**
• Necessidade de vasopressor para manter **PAM ≥ 65 mmHg**, E
• **Lactato > 2 mmol/L** mesmo após reposição volêmica adequada
• Mortalidade: ~40% (vs ~10-20% na sepse sem choque)

**qSOFA — triagem rápida na enfermaria (2 de 3 = risco alto):**
• FR ≥ 22 irpm
• Glasgow ≤ 13
• PAS ≤ 100 mmHg

**O que SUMIU no SEPSIS-3:**
• "Sepse grave" → não existe mais. Toda sepse É grave por definição.
• SIRS não é mais critério de sepse (qualquer queimadura, pancreatite ou exercício tem SIRS).

**Pearl de prova:** Se a questão usar o termo "sepse grave" como diagnóstico → está desatualizada. O moderno é simplesmente "sepse" (com disfunção de órgão pelo SOFA). Mas para o SOFA, você precisa saber calcular os 6 componentes!`
      },
      {
        id: 'sep-2', student: { name: 'Thiago Oliveira', initials: 'TO', color: '#F59E0B' },
        question: 'O que é o "bundle da hora 1" da sepse? Tenho dificuldade em lembrar todos os passos na ordem certa.',
        time: '3 dias atrás', likes: 56,
        reply: `Thiago, o bundle da hora 1 (SSC 2018) é o conjunto de ações que devem ser *iniciadas* em 1 hora após identificar sepse. Memorize o "3 + 3":

**3 coisas para COLETAR antes do antibiótico:**
1. **Lactato sérico** (> 2 = alerta; > 4 = gravíssimo mesmo sem hipotensão)
2. **Hemoculturas** (2 pares de locais diferentes — ANTES do ATB, mas não atrase mais de 45 min)
3. Gasometria + função renal (sódio, creatinina, bilirrubina para o SOFA)

**3 coisas para TRATAR:**
1. **Antibiótico** de amplo espectro em < 1 hora (piperacilina-tazobactam ou meropeném ± vancomicina)
2. **Cristaloide** 30 mL/kg em até 3h se hipotensão ou lactato > 4
3. **Noradrenalina** se PAS < 90 após volume (alvo PAM ≥ 65)

**Mnemônico: LAH-CAV**
L=Lactato, A=Antibiótico, H=Hemocultura, C=Cristaloide, A=Avalie resposta, V=Vasopressor

**Pearl:** O antibiótico em < 1 hora é o item mais cobrado E o que mais impacta mortalidade. Cada hora de atraso aumenta mortalidade em ~7%. Se houver dúvida diagnóstica, comece o ATB e descalone depois. O diagnóstico pode esperar; o antibiótico, não!`
      },
      {
        id: 'sep-3', student: { name: 'Beatriz Santos', initials: 'BS', color: '#EC4899' },
        question: 'Como calculo o SOFA? Nunca consigo lembrar os 6 sistemas avaliados e as pontuações.',
        time: '5 dias atrás', likes: 41,
        reply: `Beatriz, o SOFA avalia 6 sistemas, cada um com 0 a 4 pontos. Use o mnemônico **"RCNHCN"** (Respiração, Coagulação, fígado-N, Hemodinâmica, Consciência, Nefrológico):

**R — Respiratório (PaO₂/FiO₂):**
≥ 400=0 | 300-399=1 | 200-299=2 | 100-199 com VM=3 | < 100 com VM=4

**C — Coagulação (Plaquetas em mil/mm³):**
≥ 150=0 | 100-149=1 | 50-99=2 | 20-49=3 | < 20=4

**N — hepáticoN / Bilirrubina total (mg/dL):**
< 1,2=0 | 1,2-1,9=1 | 2,0-5,9=2 | 6,0-11,9=3 | ≥ 12=4

**H — Hemodinâmico (PAM ou vasopressor):**
PAM ≥ 70=0 | PAM < 70 sem vaso=1 | Dopa ≤ 5 ou dobutamina=2 | Dopa > 5 ou nora ≤ 0,1=3 | Dopa > 15 ou nora > 0,1=4

**C — Consciência (Glasgow):**
15=0 | 13-14=1 | 10-12=2 | 6-9=3 | < 6=4

**N — Nefrológico (Creatinina em mg/dL ou DU):**
< 1,2=0 | 1,2-1,9=1 | 2,0-3,4=2 | 3,5-4,9 ou DU < 500 mL/dia=3 | > 5 ou DU < 200 mL/dia=4

**SOFA ≥ 2 acima do basal = sepse confirmada.**

**Pearl:** Na prova, quando derem dados clínicos pedindo "há sepse?", calcule o SOFA rapidinho. Pneumonia + creatinina 2,5 + bilirrubina 3,0 = 2+2=4 pontos = sepse = internação em UTI.`
      },
    ],
  },

  // ─── Meningites ─────────────────────────────────────────────────────────────
  {
    keywords: ['meningite', 'meningococo', 'liquor', 'líquor', 'ceftriaxona', 'kernig', 'brudzinski'],
    threads: [
      {
        id: 'men-1', student: { name: 'Vanessa Monteiro', initials: 'VM', color: '#8B5CF6' },
        question: 'Como diferencio meningite bacteriana de viral pelo líquor? E quando devo dar dexametasona?',
        time: '4 dias atrás', likes: 57,
        reply: `Vanessa, o líquor é o grande diferenciador! Veja a tabela:

**Bacteriana:** Turvo | > 1.000 células (PMN) | Proteína > 100 mg/dL | Glicose < 40 mg/dL | Gram + em 60-80%
**Viral:** Límpido | 50-500 (linfócitos) | Proteína < 100 | Glicose normal | Gram negativo
**TB:** Xantocrômico | 100-500 (linfócitos) | Proteína > 100 | Glicose muito baixa | Gram negativo
**Fúngica:** Turvo/límpido | 50-500 (linfócitos) | Proteína alta | Glicose baixa | Tinta nanquim positiva

**Mnemônico bacteriana:** "**TAP-B**" — Turvo, Alta proteína, PMN, glicose Baixa.

**Dexametasona — quando e como:**
• Meningite bacteriana confirmada ou muito provável
• **Antes ou junto com o 1º antibiótico** (depois não tem benefício)
• Dose: 0,15 mg/kg IV a cada 6h por 4 dias
• Maior benefício: pneumocócica em adultos (reduz mortalidade) e H. influenzae em crianças (reduz surdez)

**Cobertura empírica adulto imunocompetente:**
• Ceftriaxona 2g IV 12/12h (pneumococo + meningococo)
• Adicione **ampicilina** se > 50 anos ou imunossuprimido (cobre Listeria!)
• Considere **aciclovir** se suspeita de encefalite herpética (HSV)

**Pearl crítica:** Se houver papiledema, déficit focal ou Glasgow < 13 → não faça PL ainda! **Antibiótico + dexametasona imediatamente → TC → PL**. O antibiótico primeiro. Cada hora de atraso eleva a mortalidade drasticamente!`
      },
    ],
  },

  // ─── TEP / TEV ──────────────────────────────────────────────────────────────
  {
    keywords: ['embolia pulmonar', 'tromboembolismo', 'tep', 'tvp', 'trombose', 'anticoagulação', 'wells'],
    threads: [
      {
        id: 'tep-1', student: { name: 'André Fonseca', initials: 'AF', color: '#F59E0B' },
        question: 'Como uso o escore de Wells para TEP? E qual o papel do D-dímero nessa investigação?',
        time: '2 dias atrás', likes: 65,
        reply: `André, a lógica do algoritmo de TEP é elegante. Entendendo o porquê, você nunca erra:

**Wells para TEP — some 1 ponto por critério:**
• Sinais clínicos de TVP: **+3**
• Diagnóstico alternativo menos provável que TEP: **+3**
• FC > 100: **+1,5**
• Imobilização/cirurgia nas últimas 4 semanas: **+1,5**
• TEP ou TVP prévia: **+1,5**
• Hemoptise: **+1**
• Câncer ativo (tratamento nos últimos 6 meses): **+1**

**Interpretação:**
• **≤ 4 = baixa probabilidade** → D-dímero
• **> 4 = alta probabilidade** → angioTC direta (pula o D-dímero!)

**D-dímero — regras de ouro:**
• Use SOMENTE em baixa probabilidade (Wells ≤ 4)
• Negativo (< 500 ng/mL) em baixa probabilidade → **exclui TEP** (VPN ~99%)
• Positivo → não confirma nada (baixa especificidade) → angioTC
• Ajuste por idade em > 50 anos: ponto de corte = **idade × 10** ng/mL (ex: 70 anos → 700 ng/mL)

**Por que não pedir D-dímero em todos?**
Eleva em cirurgia, gestação, infecção, câncer, idosos → gera cascata de exames desnecessários.

**Pearl:** Wells > 4 = pula direto para angioTC. Mas se há contraindicação ao contraste → cintilografia V/Q ou ECO transtorácico (BRD novo + dilatação de VD + sinal de McConnell = VD com ápice hipercinético).`
      },
      {
        id: 'tep-2', student: { name: 'Isabela Torres', initials: 'IT', color: '#8B5CF6' },
        question: 'Qual anticoagulante escolher no TEP e por quanto tempo devo manter?',
        time: '4 dias atrás', likes: 51,
        reply: `Isabela, o tratamento do TEP evoluiu muito com os DOACs (anticoagulantes orais diretos):

**TEP hemodinamicamente ESTÁVEL:**
• Anticoagule imediatamente ao suspeitar (não espere confirmação se probabilidade alta)
• **Rivaroxabana**: 15 mg 2x/dia por 21 dias → depois 20 mg/dia. Inicia ambulatorial! Sem heparina "ponte".
• **Apixabana**: 10 mg 2x/dia por 7 dias → 5 mg 2x/dia
• HBPM (enoxaparina 1 mg/kg 12/12h) + warfarina para quem não pode DOAC

**TEP de ALTO RISCO (choque/hipotensão):**
• **Trombólise sistêmica:** alteplase 100 mg IV em 2h
• Contraindicações: AVC < 6 meses, cirurgia recente, sangramento ativo
• Após trombólise: HNF por 24h → depois HBPM ou DOAC

**Duração da anticoagulação:**
• Fator reversível (cirurgia, imobilização): **3 meses**
• 1º episódio sem fator identificado (idiopático): 3-6 meses, depois reavalie risco de recorrência/sangramento
• 2º episódio ou trombofilia grave (SAAF): **indefinido**
• Câncer ativo: HBPM ou DOACs (rivaroxabana/apixabana superiores à varfarina em CA)

**Pearl:** SAAF (síndrome antifosfolípide) = **sempre warfarina**, não DOAC! Os estudos TRAPS e RAPS mostraram superioridade da warfarina sobre rivaroxabana no SAAF com alto risco trombótico.`
      },
    ],
  },

  // ─── Diabetes Mellitus ──────────────────────────────────────────────────────
  {
    keywords: ['diabetes', 'diabete', 'glicemia', 'insulina', 'metformina', 'hba1c', 'hipoglicemiante'],
    threads: [
      {
        id: 'dm-1', student: { name: 'Felipe Araújo', initials: 'FA', color: '#10B981' },
        question: 'Quais são os critérios diagnósticos do diabetes e como diferencio DM1 de DM2 clinicamente?',
        time: '1 dia atrás', likes: 71,
        reply: `Felipe, critérios diagnósticos de DM são certeza em prova! Qualquer **um** destes confirma:

• **Glicemia de jejum ≥ 126 mg/dL** (jejum ≥ 8h) — em 2 ocasiões separadas
• **TOTG 2h ≥ 200 mg/dL** (75g de glicose)
• **HbA1c ≥ 6,5%** — em 2 ocasiões (ou 1 vez com sintomas)
• **Glicemia aleatória ≥ 200 mg/dL + sintomas** (poliúria, polidipsia, perda de peso) → confirma com 1 medida!

**Pré-diabetes:** Jejum 100-125 | TOTG 140-199 | HbA1c 5,7-6,4%

**DM1 vs DM2 — diferenças clínicas:**
DM1: jovem (< 30a), magro, início agudo com cetoacidose, peptídeo C baixo, anti-GAD/anti-IA2 positivos, sempre precisa de insulina.
DM2: > 40 anos (cada vez mais jovens), sobrepeso/obeso, início insidioso e assintomático, peptídeo C normal ou alto, não precisa de insulina inicialmente.

**Pearl:** O DM2 responde por **90-95%** dos casos. Na prova, se não especificar o tipo, é DM2. DM1 em adulto? Pense em **LADA** (Latent Autoimmune Diabetes in Adults) — evolução lenta para dependência de insulina.`
      },
      {
        id: 'dm-2', student: { name: 'Natália Carmo', initials: 'NC', color: '#3B7EF8' },
        question: 'Por que a metformina é sempre a 1ª opção no DM2? E quando avanço para outros agentes?',
        time: '3 dias atrás', likes: 59,
        reply: `Natália, a metformina lidera por razões sólidas — e o escalonamento moderno é guiado por comorbidades, não só por HbA1c:

**Por que metformina primeiro?**
• Reduz HbA1c em 1-2% — eficácia robusta
• **Não causa hipoglicemia** (não estimula insulina diretamente)
• Não aumenta peso (ou até reduz levemente)
• Reduz eventos cardiovasculares (estudo UKPDS)
• Barata e amplamente disponível
• Contraindicação principal: TFG < 30 mL/min (risco de acidose lática por acúmulo)

**Quando adicionar 2ª droga?**
HbA1c acima da meta após 3 meses com metformina em dose máxima tolerada (2-3g/dia).

**Escalonamento moderno — baseado em comorbidades (não apenas em HbA1c!):**
• 🫀 DCV estabelecida ou alto risco CV: adicione **SGLT-2i** ou **GLP-1** (reduzem MACE — morte CV, IAM, AVC)
• 🫘 Doença renal crônica: **SGLT-2i** são preferidos (protegem o rim — estudo DAPA-CKD)
• ⚖️ Obesidade significativa: **GLP-1** (semaglutida reduz até 15% do peso — estudo SUSTAIN)
• 🩸 Risco de hipoglicemia elevado (idosos, condutores): evite sulfonilureias

**Pearl:** A metformina **sozinha** jamais causa hipoglicemia. Ela funciona em sinergismo com a insulina endógena. Isso muda o perfil de segurança completamente!`
      },
    ],
  },

  // ─── Cetoacidose Diabética ──────────────────────────────────────────────────
  {
    keywords: ['cetoacidose', 'cad', 'estado hiperosmolar', 'ehh', 'ânion gap', 'bicarbonato diabét'],
    threads: [
      {
        id: 'cad-1', student: { name: 'Samuel Viana', initials: 'SV', color: '#EC4899' },
        question: 'Como diferencio CAD de EHH? Ambos têm glicemia alta mas o tratamento parece diferente.',
        time: '2 dias atrás', likes: 63,
        reply: `Samuel, a diferença entre CAD e EHH é uma das mais cobradas em Clínica Médica! Veja a tabela comparativa:

**CAD:** glicemia > 250 | pH < 7,3 | bicarbonato < 18 | cetonas +++ | ânion gap elevado | osm < 320 | consciência geralmente preservada | DM1 (mas DM2 também)
**EHH:** glicemia > 600 | pH > 7,3 | bicarbonato > 18 | cetonas ausentes | gap normal | osm > 320 | rebaixamento/coma | DM2 em idosos

**Por que na CAD tem cetose e no EHH não?**
Na CAD: **zero insulina** → lipólise intensa → corpos cetônicos (β-hidroxibutirato, acetoacetato, acetona).
No EHH: há insulina **residual suficiente** para inibir a lipólise → sem formação de cetonas.

**Tratamento compartilhado (os 3 pilares):**
1. **SF 0,9%**: 1-2 L na 1ª hora (hidratação agressiva — ambos têm déficit de 5-10 L!)
2. **Potássio**: SEMPRE antes da insulina se K⁺ < 3,5 (insulina empurra K para dentro da célula → hipocalemia fatal)
3. **Insulina**: 0,1 UI/kg em bolus + 0,1 UI/kg/h em infusão

**Pearl capital para prova:** Na CAD, trate até **fechamento do ânion gap**, não até a glicemia normalizar! A glicemia cai antes do gap fechar. Se parar a insulina antes, o paciente entra em cetoacidose de novo. Quando glicemia < 200, adicione SG 5% e reduza a insulina — mas mantenha a infusão!`
      },
    ],
  },

  // ─── Arritmias ───────────────────────────────────────────────────────────────
  {
    keywords: ['arritmia', 'fibrilação', 'fibrilação atrial', 'flutter', 'tsv', 'bradicardia', 'wpw', 'wolff'],
    threads: [
      {
        id: 'arr-1', student: { name: 'Diego Carvalho', initials: 'DC', color: '#3B7EF8' },
        question: 'Como diferencio FA de flutter no ECG? Parece a mesma coisa para mim quando olho rápido.',
        time: '1 dia atrás', likes: 49,
        reply: `Diego, a diferença é visual e você fixa com um olhar treinado!

**Fibrilação Atrial (FA):**
• Ondas P ausentes → linha de base com oscilações irregulares caóticas ("fio embaralhado")
• Ritmo ventricular: **irregularmente irregular** (RR completamente aleatório)
• Frequência atrial: 350-600 bpm
• Como lembrar: FA = "F de fio" → linha de base parece fio emaranhado

**Flutter Atrial:**
• Ondas "F" em **dente de serra** — regular, melhor visível em D2, D3, aVF e V1
• Frequência atrial: ~300 bpm (250-350)
• Bloqueio AV geralmente 2:1 → FC ventricular ~**150 bpm** muito regular!
• Como lembrar: FluTTer = "F de fila" → ondas em fila organizada, como dentes de serra

**Pearl de ouro:** FC de exatamente **150 bpm regular** = flutter 2:1 até prova em contrário! Isso é o "150 que assusta" do emergencista. Massagem do seio carotídeo aumenta transitoriamente o bloqueio AV → desvelha as ondas em dente de serra e confirma o diagnóstico.

**Pearl crítica sobre WPW:** FA + síndrome de WPW = **NUNCA** betabloqueador, verapamil, diltiazem ou adenosina! Bloqueiam o nó AV e forçam a condução pela via acessória → FA pré-excitada → FV → morte. Use procainamida ou amiodarona!`
      },
      {
        id: 'arr-2', student: { name: 'Juliana Prado', initials: 'JP', color: '#10B981' },
        question: 'Quando cardioverto e quando controlo frequência na FA? Parece que depende do tempo mas nunca sei o corte exato.',
        time: '4 dias atrás', likes: 62,
        reply: `Juliana, a decisão na FA tem dois eixos: **estabilidade hemodinâmica** e **tempo de duração**.

**Se INSTÁVEL (hipotensão, EAP, angina, síncope) — qualquer duração:**
→ **Cardioversão elétrica sincronizada imediata** (100-200 J bifásico). Não espere anticoagulação!

**Se ESTÁVEL — avalie a duração:**

**FA < 48 horas:**
• Pode cardioverter sem ecocardiograma (risco de trombo muito baixo)
• Heparine primeiro → cardioverta (elétrica: 120-200 J | química: propafenona, amiodarona)
• Anticoagule por ≥ 4 semanas após (remodelamento atrial favorece trombos mesmo após reversão)

**FA > 48 horas ou duração DESCONHECIDA:**
• Opção 1: anticoagule por 3 semanas → cardioverta → anticoagule mais 4 semanas
• Opção 2: ETE (ecocardiograma transesofágico) para excluir trombo → se negativo, cardioverta e anticoagule 4 semanas

**Controle de FC (quando não cardioverter):**
Alvo: 60-100 bpm em repouso. **Betabloqueador** (metoprolol) ou **diltiazem/verapamil**. Digoxina = último recurso (lento, só funciona em repouso).

**Pearl:** CHADSVASC ≥ 2 em homens ou ≥ 3 em mulheres → anticoagule com DOAC indefinidamente (rivaroxabana, apixabana ou dabigatrana), independente do ritmo (FA paroxística, persistente ou permanente)!`
      },
    ],
  },

  // ─── Pré-eclâmpsia / Eclâmpsia ──────────────────────────────────────────────
  {
    keywords: ['eclâmpsia', 'pré-eclâmpsia', 'hellp', 'hipertensão gravidez', 'magnésio', 'sulfato de magnésio'],
    threads: [
      {
        id: 'pe-1', student: { name: 'Ana Luíza Ferreira', initials: 'AF', color: '#EC4899' },
        question: 'Quando a pré-eclâmpsia vira eclâmpsia? E por que o magnésio previne convulsão se não é anticonvulsivante clássico?',
        time: '3 dias atrás', likes: 58,
        reply: `Ana Luíza, pergunta que mostra que você pensa além da decoreba!

**Pré-eclâmpsia → Eclâmpsia:**
A eclâmpsia é a pré-eclâmpsia **+ convulsão tônico-clônica generalizada** sem outra causa. Pode ocorrer antes do parto, durante ou até **7 dias após** (eclâmpsia tardia — muito cobrada!).

**Critérios de pré-eclâmpsia grave (indicam internação + possível antecipação do parto):**
• PAS ≥ 160 ou PAD ≥ 110 mmHg
• Cefaleia intensa refratária ou escotomas
• Epigastralgia/dor em hipocôndrio direito (distensão hepática = alerta de HELLP)
• Oligo-anúria (< 500 mL/24h)
• Trombocitopenia < 100.000/mm³
• Creatinina > 1,1 mg/dL

**Por que o magnésio previne convulsão?**
O MgSO₄ não age nos canais de Na⁺ como fenitoína. Ele age como:
• **Antagonista do receptor NMDA** → bloqueia excitotoxicidade por glutamato
• **Vasodilatador cerebral** → reduz vasoespasmo que causa isquemia cortical
• **Estabilizador de membrana** neuronal

**Protocolo de Zuspan:**
• Ataque: 4 g IV em 20 min
• Manutenção: 1-2 g/h IV
• Monitorize: refluxo patelar (perda = toxicidade). Parada respiratória → **gluconato de cálcio 10 mL 10% IV** (antídoto imediato!)

**Pearl:** O magnésio é tanto **profilático** quanto **terapêutico**. Se convulsiou: bolus de Mg + proteja vias aéreas + decúbito lateral. Não use diazepam como primeira escolha!`
      },
      {
        id: 'pe-2', student: { name: 'Roberto Cunha', initials: 'RC', color: '#3B7EF8' },
        question: 'O que é a síndrome HELLP e por que ela é tão perigosa? Ela é complicação da pré-eclâmpsia ou entidade separada?',
        time: '6 dias atrás', likes: 47,
        reply: `Roberto, HELLP é uma das emergências obstétricas mais temidas. Vamos desmontar letra por letra:

**H — Hemolysis (hemólise microangiopática):**
Esquizócitos no esfregaço, LDH elevada, bilirrubina indireta alta, haptoglobina baixa → anemia hemolítica.

**EL — Elevated Liver enzymes:**
AST e ALT > 2× o normal. Pode evoluir para **hematoma hepático subcapsular → ruptura → hemorragia catastrófica** (mortalidade > 50%)!

**LP — Low Platelets:**
Plaquetas < 100.000/mm³. Risco de CID.

**É pré-eclâmpsia ou entidade separada?**
~85% das HELLP têm pré-eclâmpsia concomitante, mas **~15% ocorrem SEM hipertensão ou proteinúria**! Por isso é entidade própria — o diagnóstico não depende de PA.

**Conduta pela idade gestacional:**
• **< 34 semanas**: betametasona (maturidade fetal) + estabilização → parto em 24-48h
• **≥ 34 semanas**: parto imediato em qualquer situação!
• Dexametasona EV melhora contagem de plaquetas temporariamente (uso controverso mas cobrado)

**Pearl:** Dor em hipocôndrio direito + "gripe" em gestante = **HELLP até prova em contrário**. Diagnóstico diferencial com hepatite, mas a trombocitopenia orienta. Nunca subestime epigastralgia em gestante hipertensa!`
      },
    ],
  },

  // ─── Reanimação Neonatal ─────────────────────────────────────────────────────
  {
    keywords: ['neonatal', 'reanimação neonatal', 'rcn', 'apgar', 'sala de parto', 'recém-nascido', 'vpp'],
    threads: [
      {
        id: 'neo-1', student: { name: 'Alessandra Duarte', initials: 'AD', color: '#EC4899' },
        question: 'Qual o fluxo da reanimação neonatal em sala de parto? A sequência parece complicada na prova.',
        time: '3 dias atrás', likes: 72,
        reply: `Alessandra, a RCN/SBP 2021 tem uma lógica de árvore de decisão. Veja passo a passo:

**Pergunta ANTES de tudo (30 segundos):**
1. A termo (≥ 37 semanas)?
2. Respirando ou chorando?
3. Tônus muscular bom?

→ **Tudo "sim"** → colo materno, clampeamento oportuno. Nenhuma intervenção.
→ **Qualquer "não"** → mesa de reanimação aquecida.

**Na mesa — "30 segundos de estabilização":**
1. Aquecimento e posicionamento (pescoço em leve extensão — "cheirar o ar")
2. Aspiração (só se secreção obstrutiva ou mecônio espesso)
3. Secagem e estimulação (friccionar suavemente o dorso e plantas dos pés)

**Avalie FC — é o indicador mais importante!**

**FC ≥ 100 + respiração eficaz** → observação e SpO₂

**FC < 100 ou apneia/gasping:**
→ **VPP** (ventilação com pressão positiva) com **O₂ 21%** (ar ambiente!) por 30 s

**Após VPP 30s — FC ainda < 100:**
→ Verifique máscara, posição, pressão (MR. SOPA)
→ Considere intubação traqueal ou máscara laríngea

**FC < 60 após VPP eficaz por 30s:**
→ **Massagem cardíaca** (compressão 1/3 do tórax, 2 dedos em pé) + VPP (relação 3:1 = 90 compressões + 30 ventilações por minuto)
→ **Adrenalina** 0,01-0,03 mg/kg IV se FC persistir < 60

**Pearl IMPORTANTÍSSIMA:** O O₂ 100% só a partir de 34 semanas e somente se SpO₂ não atingir as metas. Em prematuros ≤ 34s e nos primeiros 30s de qualquer RN: **ar ambiente (21%)**! Hiperóxia em prematuros causa retinopatia da prematuridade e displasia broncopulmonar.

**Apgar:** Avaliado em 1, 5 e 10 min. O Apgar guia retrospectivamente, mas **não é quem indica reanimação** — a FC e a respiração é que guiam a conduta em tempo real!`
      },
    ],
  },

  // ─── HIV / Infecções Oportunistas ────────────────────────────────────────────
  {
    keywords: ['hiv', 'aids', 'sida', 'cd4', 'antirretroviral', 'tarv', 'oportunistas', 'pneumocystis'],
    threads: [
      {
        id: 'hiv-1', student: { name: 'Marcelo Santana', initials: 'MS', color: '#3B7EF8' },
        question: 'Quais infecções oportunistas surgem em cada faixa de CD4? Sempre confundo a ordem.',
        time: '2 dias atrás', likes: 68,
        reply: `Marcelo, a correlação CD4 × infecção oportunista precisa estar na ponta da língua!

**CD4 > 500 (imunidade quase normal):**
Herpes zóster | Candidíase oral (thrush) | Sinusite bacteriana recorrente

**CD4 200-500 (imunossupressão moderada):**
Tuberculose (pode surgir em qualquer CD4, mas o risco dispara) | Candidíase esofágica | Leucoplasia pilosa oral (EBV) | Sarcoma de Kaposi (HHV-8)

**CD4 < 200 — LIMIAR DE AIDS:**
• **Pneumocistose (PCP)**: profilaxia com SMZ-TMP quando CD4 < 200!
• Toxoplasmose cerebral (CD4 < 100-150): profilaxia também com SMZ-TMP
• Criptococose (meningite fúngica): CD4 < 100

**CD4 < 50 (AIDS avançada):**
• CMV (retinite, colite, encefalite)
• MAC — Mycobacterium avium complex (febre, perda de peso, diarreia, pancitopenia)
• LMP — Leucoencefalopatia multifocal progressiva (JC vírus)
• Criptosporidiose disseminada

**Mnemônico "CD4 caindo, bicho subindo":**
↓500: Candida oral, Zóster → ↓200: PCP (profilaxia!) → ↓100: Toxo, Criptococo → ↓50: CMV, MAC, LMP

**Pearl:** Quando CD4 > 200 com TARV eficaz por ≥ 6 meses → suspend a as profilaxias primárias (exceto MAC, que suspende com CD4 > 100). E lembre: CD4 < 200 **sozinho** já define AIDS, mesmo sem infecção oportunista!`
      },
    ],
  },

  // ─── Pancreatite Aguda ───────────────────────────────────────────────────────
  {
    keywords: ['pancreatite', 'amilase', 'lipase', 'ranson', 'bisap', 'pseudocisto', 'necrose pancreática'],
    threads: [
      {
        id: 'pan-1', student: { name: 'Renata Figueiredo', initials: 'RF', color: '#F59E0B' },
        question: 'Como avalio a gravidade da pancreatite aguda? E qual o papel dos critérios de Ranson?',
        time: '3 dias atrás', likes: 54,
        reply: `Renata, classificação de gravidade de pancreatite é certeza nas provas de cirurgia e clínica!

**Critérios de Ranson (2 momentos):**
Na admissão: Idade > 55 | Leucócitos > 16.000 | Glicose > 200 mg/dL | LDH > 350 | AST > 250
Em 48h: Queda de Ht > 10% | Ureia sobe > 5 mg/dL | Cálcio < 8 mg/dL | PaO₂ < 60 mmHg | Déficit de base > 4 | Sequestro de líquido > 6 L

0-2 = leve (< 3%) | 3-4 = moderada (15%) | ≥ 5 = grave (50-100%)

**BISAP (mais prático no dia a dia):**
B = BUN > 25 mg/dL | I = Impaired mental status (confusão) | S = SIRS (≥ 2 critérios) | A = Idade > 60 | P = derrame Pleural
BISAP ≥ 3 = grave (mortalidade > 10%)

**Classificação de Atlanta revisada (2012):**
• Leve: sem falência orgânica, sem necrose
• Moderadamente grave: falência orgânica transitória (< 48h) OU complicações locais
• Grave: falência orgânica persistente (> 48h)

**Quando pedir TC de abdome?**
**NÃO** na chegada! TC com contraste em 48-72h se não melhora ou suspeita de complicação. TC precoce pode subestimar a necrose.

**Tratamento (prova):**
1. **Hidratação agressiva** (2,5-4 L/dia de cristaloide) — mais importante de tudo!
2. Analgesia (tramadol, dipirona)
3. Antibiótico **somente** se necrose infectada (não use profilaticamente!)
4. CPRE precoce (< 24h) se pancreatite biliar + colangite associada

**Pearl:** Amilase sobe e cai rápido. **Lipase é mais específica e fica elevada por mais tempo**. Pancreatite crônica pode ter pancreatite aguda sem amilase elevada (glândula fibrótica sem enzimas para liberar). Confie na lipase!`
      },
    ],
  },

  // ─── Apendicite ─────────────────────────────────────────────────────────────
  {
    keywords: ['apendicite', 'apêndice', 'mcburney', 'alvarado', 'rovsing', 'blumberg', 'fid', 'fossa ilíaca'],
    threads: [
      {
        id: 'ap-1', student: { name: 'Henrique Lopes', initials: 'HL', color: '#F59E0B' },
        question: 'Quais são os sinais clínicos da apendicite e qual o papel do escore de Alvarado?',
        time: '3 dias atrás', likes: 44,
        reply: `Henrique, a semiotécnica da apendicite é básica mas essencial — e muito cobrada em provas de cirurgia!

**Sinais clínicos clássicos:**
• **McBurney**: dor à palpação no ponto de McBurney (1/3 externo da linha umbilical → EIAS direita)
• **Blumberg**: descompressão brusca dolorosa na FID (peritonismo localizado)
• **Rovsing**: palpação na FIE causa dor na FID (por deslocamento de gás — apêndice com gás)
• **Sinal do psoas**: extensão passiva do quadril D causa dor (apêndice retroileal)
• **Sinal do obturador**: rotação interna do quadril flexionado causa dor (apêndice pélvico)

**Escore de Alvarado (MANTRELS) — 10 pontos:**
M=Migração para FID (+1) | A=Anorexia (+1) | N=Náusea/vômito (+1) | T=Dor em FID (+2) | R=Rebound (+1) | E=Temperatura > 37,3°C (+1) | L=Leucocitose (+2) | S=Desvio à esquerda (+1)

• ≤ 4: baixa probabilidade → alta ou observação
• 5-6: intermediário → imagem (USG ou TC)
• 7-8: alta → cirurgia (adulto) ou imagem (criança/mulher)
• ≥ 9: quase certo → cirurgia direta

**Exames de imagem:**
• USG: 1ª escolha (sem radiação, bom para crianças e gestantes), sensibilidade 75-90%
• TC de abdome e pelve: padrão-ouro quando USG inconclusiva (sensibilidade > 95%)

**Pearl:** Em mulheres em idade fértil com dor em FID, **SEMPRE** afaste gravidez ectópica (beta-hCG quantitativo). Dor em FID + beta-hCG positivo = ectópica até prova em contrário!`
      },
    ],
  },

  // ─── PAC ─────────────────────────────────────────────────────────────────────
  {
    keywords: ['pneumonia', 'pac', 'comunidade', 'curb', 'atípico', 'amoxicilina', 'legionella', 'macrolídeo'],
    threads: [
      {
        id: 'pac-1', student: { name: 'Lucas Marques', initials: 'LM', color: '#3B7EF8' },
        question: 'Como uso o CURB-65 para decidir internação na PAC? E qual antibiótico escolho?',
        time: '2 dias atrás', likes: 66,
        reply: `Lucas, CURB-65 + algoritmo de antibiótico são os pilares da PAC nas provas!

**CURB-65 — 1 ponto por critério:**
**C**=Confusão mental nova | **U**=Ureia > 50 mg/dL | **R**=FR ≥ 30 irpm | **B**=PAS < 90 ou PAD ≤ 60 | **65**=Idade ≥ 65 anos

• 0-1: ambulatorial (mortalidade ~1%)
• 2: hospitalização (mortalidade ~9%) — borderline, decida pela clínica
• ≥ 3: internação (mortalidade 22-57%); score 4-5 = considere UTI

**Antibioticoterapia por local de tratamento:**

**Ambulatorial, sem comorbidades:**
→ Amoxicilina 1g 8/8h (cobre pneumococo — o mais frequente)

**Ambulatorial com comorbidades (DM, cardiopatia, uso recente de ATB):**
→ Amoxicilina-clavulanato OU fluoroquinolona respiratória (levofloxacino/moxifloxacino)

**Hospitalar (CURB 2-3):**
→ Beta-lactâmico (ceftriaxona 1-2g/dia) + macrolídeo (azitromicina 500 mg/dia) — cobertura de atípicos
→ OU fluoroquinolona respiratória em monoterapia

**UTI (CURB 4-5):**
→ Ceftriaxona + azitromicina OU fluoroquinolona respiratória
→ Suspeita de Pseudomonas (DPOC grave, bronquiectasia, corticoide crônico): piperacilina-tazobactam ou cefepima

**Pearl:** **Legionella** = PAC grave + hiponatremia + diarreia + LDH alta + tosse seca em paciente de hotel/ar-condicionado. Antibiótico: **macrolídeo ou fluoroquinolona** (beta-lactâmico NÃO cobre Legionella!). É questão recorrente em provas de infectologia!`
      },
    ],
  },

  // ─── Tuberculose ─────────────────────────────────────────────────────────────
  {
    keywords: ['tuberculose', 'mycobacterium', 'rifampicina', 'isoniazida', 'pirazinamida', 'bhze', 'rhze', 'tb'],
    threads: [
      {
        id: 'tb-1', student: { name: 'Eduardo Nunes', initials: 'EN', color: '#F59E0B' },
        question: 'Como é o esquema de tratamento da tuberculose no Brasil? E quais as diferenças para HIV+?',
        time: '5 dias atrás', likes: 53,
        reply: `Eduardo, esquema TB é certeza em prova e tem detalhes que pegam!

**Esquema Brasil para adultos — RHZE 2 meses + RH 4 meses:**
• **R** — Rifampicina 600 mg
• **H** — Isoniazida 300 mg
• **Z** — Pirazinamida 2.000 mg
• **E** — Etambutol 1.200 mg (primeiros 2 meses)
**Total: 6 meses.**

**Formas graves (meningite TB, miliar, osteoarticular):**
RHZE 2 meses + RH por **7-10 meses** (até 12 meses no total). Dexametasona em TB meníngea (reduz mortalidade e sequelas!).

**TB + HIV — quando iniciar TARV?**
• CD4 < 50: iniciar TARV em **2 semanas** após ATB anti-TB
• CD4 ≥ 50: iniciar TARV em **8 semanas** (maior risco de IRIS com CD4 baixo se antecipar demais)
• IRIS: piora paradoxal ao recuperar imunidade — trate com NSAID ou prednisona; não suspenda TARV!

**Efeitos adversos (cobrado muito!):**
• **Rifampicina**: hepatotoxicidade, indutor enzimático CYP450 (diminui efeito de ACO, warfarina, ARV!), urina/lágrimas/lentes laranjas
• **Isoniazida**: neuropatia periférica → **piridoxina (B6) profilática!** Hepatite
• **Pirazinamida**: hiperuricemia (gota), hepatite (a mais hepatotóxica das 3!)
• **Etambutol**: neurite óptica retrobulbar (perda de visão de cores, campo visual) → monitorize mensalmente!

**Pearl:** Rifampicina + efavirenz (ARV) = interação significativa, mas o efavirenz é o ARV preferido nesse cenário. **Nunca use inibidor de protease** com rifampicina (reduz nível sérico do IP a quase zero)!`
      },
    ],
  },

  // ─── Pré-natal ───────────────────────────────────────────────────────────────
  {
    keywords: ['pré-natal', 'prenatal', 'gestação', 'gravidez', 'trimestre', 'ácido fólico', 'toxoplasmose gestação'],
    threads: [
      {
        id: 'pn-1', student: { name: 'Larissa Moura', initials: 'LM', color: '#EC4899' },
        question: 'Quais são as consultas e exames obrigatórios no pré-natal de baixo risco? Sempre confundo o cronograma.',
        time: '3 dias atrás', likes: 61,
        reply: `Larissa, o pré-natal de baixo risco do Ministério da Saúde tem cronograma definido e é muito cobrado nas provas de GO e Saúde Pública!

**Número mínimo de consultas: 6 (OMS recomenda ≥ 8)**
• ≤ 28 semanas: mensalmente | 28-36s: quinzenalmente | > 36s: semanalmente

**Exames do 1º trimestre (< 14 semanas):**
Tipagem + Rh | Hemograma | Glicemia de jejum | Urina I + urocultura | VDRL | Anti-HIV | HBsAg | Toxoplasmose IgG+IgM | TSH
**USG 11-13⁶ semanas**: translucência nucal + datação precisa

**2º trimestre (14-28 semanas):**
• **TOTG 75g** entre 24-28s (rastreamento de DM gestacional) — o mais cobrado!
• USG morfológico (20-24s)
• Repetir: VDRL + hemograma + toxoplasmose (se IgG negativa)

**3º trimestre (28-40 semanas):**
• Hemograma | VDRL (3ª coleta) | Anti-HIV (repetição)
• **Estreptococo B (35-37s)**: cultura vaginal/retal → se positivo, penicilina durante o parto
• USG (30-34s) + cardiotocografia a partir de 36s

**Suplementações obrigatórias:**
• **Ácido fólico**: 0,4 mg/dia idealmente 1-3 meses ANTES da concepção + até 12 semanas (prevenção de defeito do tubo neural)
• **Ferro elementar**: 40 mg/dia a partir de 20 semanas

**Pearl:** GDM diagnóstico pelo TOTG 75g: jejum ≥ 92, 1h ≥ 180, 2h ≥ 153 mg/dL. **Um valor** alterado já é suficiente para o diagnóstico — diferente do rastreamento de DM2!`
      },
    ],
  },

  // ─── IRA ─────────────────────────────────────────────────────────────────────
  {
    keywords: ['injúria renal', 'lesão renal aguda', 'aki', 'ira renal', 'oligúria', 'kdigo', 'pré-renal', 'fena'],
    threads: [
      {
        id: 'ira-1', student: { name: 'Vinícius Campos', initials: 'VC', color: '#10B981' },
        question: 'Como diferencio IRA pré-renal de intrínseca? Quais exames ajudam na diferenciação?',
        time: '4 dias atrás', likes: 49,
        reply: `Vinícius, a diferenciação da IRA é fundamental — e a análise do sedimento urinário + índices urinários é o que faz toda a diferença!

**IRA Pré-renal (funcional):**
Causa: hipovolemia, baixo débito cardíaco, vasoconstritores (AINEs, contraste, sepse)
Fisiopatologia: rim "sedento" → tenta conservar sódio e água
• Sedimento: normal (cilindros hialinos aceitáveis)
• **Sódio urinário < 20 mEq/L** (rim retendo sódio)
• **FeNa < 1%** ← mais usado!
• Osmolaridade urinária > 500 mOsm/kg
• **Responde à hidratação!**

**FeNa = (Na urin × Creat plasm) ÷ (Na plasm × Creat urin) × 100**

**IRA Intrínseca (necrose tubular aguda — NTA):**
Causa: isquemia prolongada, aminoglicosídeos, contraste, cisplatina, rabdomiólise
Fisiopatologia: túbulos lesados não conseguem concentrar urina nem reter sódio
• Sedimento: **cilindros granulosos "sujos" (pigmentados)** — patognomônico de NTA!
• **Sódio urinário > 40 mEq/L**
• **FeNa > 2%**
• Osmolaridade urinária < 350 mOsm/kg
• Não melhora só com hidratação — aguarda recuperação tubular (dias a semanas)

**IRA Pós-renal (obstrutiva):**
USG mostra hidronefrose bilateral. Trate removendo a obstrução!

**Critérios KDIGO para diagnóstico de IRA (qualquer um):**
• Creatinina ↑ ≥ 0,3 mg/dL em 48h, OU
• Creatinina ↑ ≥ 1,5× o basal em 7 dias, OU
• Débito urinário < 0,5 mL/kg/h por ≥ 6h

**Pearl:** Cuidado com FeNa em pacientes usando diurético — mesmo em IRA pré-renal, o diurético força a excreção de sódio → FeNa pode ser falso-positivo. Use a **FeUreia** (< 35% = pré-renal) nesses casos!`
      },
    ],
  },

  // ─── HAS ─────────────────────────────────────────────────────────────────────
  {
    keywords: ['hipertensão', 'has', 'pressão arterial', 'anti-hipertensivo', 'amlodipino', 'captopril'],
    threads: [
      {
        id: 'has-1', student: { name: 'Simone Azevedo', initials: 'SA', color: '#8B5CF6' },
        question: 'Qual anti-hipertensivo escolher para cada perfil de paciente? Tenho dificuldade com as indicações preferenciais.',
        time: '2 dias atrás', likes: 76,
        reply: `Simone, a escolha do anti-hipertensivo depende das **comorbidades** — essa é a lógica que organiza tudo:

**Diabético ou proteinúria:** → **IECA ou BRA** (nefroprotegem, antiproteinúricos). Ex: enalapril, losartana.

**IC com FE reduzida:** → IECA (ou ARNI) + betabloqueador + espironolactona + SGLT-2i. Evite verapamil/diltiazem em IC sistólica!

**Pós-IAM ou DAC estável:** → **Betabloqueador + IECA** (betabloqueador reduz mortalidade pós-IAM — use indefinidamente)

**Paciente negro sem comorbidade:** → **Bloqueadores de Ca dihidropiridínicos** (amlodipino) ou **tiazídicos**. IECA/BRA têm menor eficácia anti-hipertensiva em negros de forma isolada.

**Gestante:** → **Metildopa** (1ª linha, por segurança), hidralazina, nifedipino de ação prolongada.
**CONTRAINDICADOS na gestação:** IECA, BRA, inibidores diretos de renina — causam agenesia renal fetal e oligodramnia!

**HAS + AVC prévio:** → IECA ou BRA + tiazídico (reduz AVC recorrente — estudo PROGRESS)

**HAS + hipocalemia espontânea:** → Investigue **hiperaldosteronismo primário** (relação aldosterona/renina). Espironolactona é benéfica.

**Mnemônico "ABCD" das 4 classes principais:**
A=IECA/BRA | B=Betabloqueadores | C=Ca-antagonistas | D=Diuréticos tiazídicos

**Pearl:** Evite combinar betabloqueador + verapamil/diltiazem (bloqueio AV sinérgico → bradicardia grave). E atenolol tem desempenho inferior em desfechos cardiovasculares comparado a outros betabloqueadores — prefira bisoprolol ou metoprolol!`
      },
    ],
  },

  // ─── Imunização Infantil ─────────────────────────────────────────────────────
  {
    keywords: ['imunização', 'vacina', 'calendário', 'pnc', 'tríplice', 'pentavalente', 'bcg', 'rotavírus vacina'],
    threads: [
      {
        id: 'vac-1', student: { name: 'Camila Freitas', initials: 'CF', color: '#8B5CF6' },
        question: 'Como é o calendário de vacinação infantil do SUS? Sempre erro a ordem das vacinas por faixa etária.',
        time: '2 dias atrás', likes: 55,
        reply: `Camila, o calendário do PNI (2024) organizado por marco de idade — o mais cobrado!

**Ao nascer:**
• BCG (intradérmica) — cobre TB miliar e meníngea
• Hepatite B (1ª dose)

**2 meses:**
• Pentavalente (DTP + Hib + Hep B 2ª dose)
• VIP (polio inativada)
• Pneumocócica 10-valente (1ª dose) — PnC10
• Rotavírus humano (1ª dose) — oral, atenuada

**3 meses:** • Meningocócica C (1ª dose)

**4 meses:**
• Pentavalente (2ª dose) • VIP (2ª dose) • PnC10 (2ª dose) • Rotavírus (2ª dose) • MenC (2ª dose)

**5 meses:** • Pentavalente (3ª dose) • VIP (3ª dose)

**6 meses:** • Influenza (anual a partir daqui)

**12 meses:**
• PnC10 (reforço) • MenC (reforço) • Tríplice viral (SCR — sarampo, caxumba, rubéola)

**15 meses:**
• DTP (1º reforço) • VOP (oral — reforço com atenuada) • Varicela (VZ — 1 dose)
• Hepatite A (1 dose)

**4 anos:**
• DTP (2º reforço) • VOP (2º reforço) • SCR (2ª dose) • Varicela (2ª dose — novidade PNI 2024!)

**Pearl:** Rotavírus tem **janela de administração** — 1ª dose: 1m15d a 3m15d; 2ª dose: 3m15d a 7m29d. Fora dessa janela, não aplique (risco de intussuscepção aumentado). E a vacina de rotavírus é **oral e viva-atenuada** — contraindicada em imunossuprimidos graves!`
      },
    ],
  },
]

// Normalize string for keyword matching
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .trim()
}

export function getCommentsForLesson(title: string, groupName?: string): CommentThread[] {
  const search = norm(`${title} ${groupName ?? ''}`)

  for (const entry of THREADS) {
    if (entry.keywords.some(k => search.includes(norm(k)))) {
      return entry.threads
    }
  }

  // Generic fallback
  return [
    {
      id: 'gen-1',
      student: { name: 'Fernanda Lima', initials: 'FL', color: '#3B7EF8' },
      question: 'Quais são os pontos mais cobrados em prova sobre esse tema? Quero focar no que realmente importa.',
      time: '3 dias atrás',
      likes: 28,
      reply: `Ótima pergunta! Em residência médica, para qualquer tema, os pilares que mais caem são:

**1. Definição e critérios diagnósticos** — as bancas adoram questionar os critérios oficiais, especialmente quando houve atualização recente. Fique atento às mudanças das últimas diretrizes.

**2. Fisiopatologia básica** — entender o "porquê" é o que diferencia o candidato que decora do candidato que raciocina. As questões modernas exigem raciocínio clínico, não memorização pura.

**3. Diagnóstico diferencial** — como diferenciar da principal doença que simula o quadro? Esse é o coração das questões de Clínica.

**4. Conduta de emergência** — o que fazer nas primeiras horas? Qual droga, qual dose, em qual ordem? Isso é o que as questões de residência mais exploram.

**5. Complicações e quando escalar o tratamento** — saber quando o paciente piora e o que fazer a seguir é fundamental.

**Estratégia de estudo:** faça questões comentadas desse tema nas principais bancas (USP, ENARE, UNICAMP, Fuvest). O padrão de cada banca revela o que elas mais valorizam. O RokoMed já filtra isso para você pelo painel de incidência!`,
    },
    {
      id: 'gen-2',
      student: { name: 'Lucas Marques', initials: 'LM', color: '#10B981' },
      question: 'Existe algum mnemônico para fixar os principais pontos desse assunto? Tenho dificuldade em lembrar na hora da prova.',
      time: '5 dias atrás',
      likes: 19,
      reply: `Lucas, mnemônicos são poderosos quando você entende o raciocínio por trás. Mas vou te dar uma dica ainda mais valiosa:

**A melhor "cola" não é decorar — é entender a fisiopatologia.**

Quando você entende por que um sinal clínico existe (ex: por que há estertores crepitantes no EAP?), você nunca mais precisa decorar — você deduz na hora da prova.

**Para mnemônicos que realmente funcionam:**
• Use acrônimos formados pelas **iniciais dos elementos mais importantes** (diagnóstico, tratamento, complicações)
• Associe a uma imagem mental ou história absurda — quanto mais estranha, mais fácil de lembrar
• Pratique o mnemônico em contexto: leia o mnemônico junto com questões daquele tema

**Dica de revisão ativa:**
Após assistir essa aula, feche o computador e tente escrever os 5 pontos principais sem consultar. Depois confira. Esse processo de recuperação ativa fixa 3× mais do que reler o material — está comprovado pela neurociência cognitiva!

O caderno de erros do RokoMed automatiza exatamente esse processo para questões — o que você errou, ele te manda de volta no momento certo do esquecimento. Use!`,
    },
  ]
}
