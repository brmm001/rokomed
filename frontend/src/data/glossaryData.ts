export interface GlossaryTerm {
  slug: string;
  term: string;
  definition: string;
  symptoms: string[];
  diagnosis: string;
  treatment: string;
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    slug: 'apendicite-aguda',
    term: 'Apendicite Aguda',
    definition: 'A apendicite aguda é a inflamação do apêndice cecal, caracterizando-se como a principal causa de abdome agudo cirúrgico no mundo.',
    symptoms: [
      'Dor abdominal inicialmente periumbilical que se irradia para a fossa ilíaca direita (ponto de McBurney).',
      'Anorexia (perda de apetite), náuseas e vômitos.',
      'Febre de baixa intensidade.',
      'Sinal de Blumberg positivo (dor à descompressão súbita da fossa ilíaca direita).'
    ],
    diagnosis: 'O diagnóstico é predominantemente clínico. Exames complementares como ultrassonografia (USG) ou tomografia computadorizada (TC) de abdome são recomendados em casos duvidosos, gestantes ou crianças.',
    treatment: 'O tratamento padrão consiste em apendicectomia de urgência (aberta ou por videolaparoscopia), acompanhada de antibioticoterapia profilática ou terapêutica, conforme o estágio da perfuração.'
  },
  {
    slug: 'bronquiolite-obliterante',
    term: 'Bronquiolite Obliterante',
    definition: 'A bronquiolite obliterante é uma síndrome clínica crônica caracterizada pela obstrução inflamatória e cicatricial das pequenas vias aéreas (bronquíolos), geralmente secundária a uma infecção viral grave na infância.',
    symptoms: [
      'Tosse persistente ou sibilância recorrente.',
      'Taquipneia (respiração acelerada) e esforço respiratório.',
      'Hipoxemia crônica e estertores subcrepitantes à ausculta pulmonar.',
      'Tolerância diminuída ao esforço físico.'
    ],
    diagnosis: 'Baseia-se na história clínica de infecção respiratória aguda grave prévia com persistência dos sintomas obstrutivos por mais de 30 dias. A tomografia de alta resolução (TCAR) de tórax demonstra padrão de perfusão em mosaico, aprisionamento aéreo e bronquiectasias.',
    treatment: 'Suporte clínico com fisioterapia respiratória, oxigenoterapia se necessário, broncodilatadores e corticoides (inalatórios ou sistêmicos em pulsoterapia) para controle de episódios inflamatórios. Casos graves podem demandar transplante pulmonar.'
  },
  {
    slug: 'choque-cardiogenico',
    term: 'Choque Cardiogênico',
    definition: 'O choque cardiogênico é um estado de hipoperfusão tecidual sistêmica grave decorrente da incapacidade primária do coração de manter um débito cardíaco adequado, apesar de um volume intravascular adequado.',
    symptoms: [
      'Hipotensão arterial persistente (pressão sistólica < 90 mmHg).',
      'Sinais de má perfusão periférica (extremidades frias, cianose, sudorese, tempo de enchimento capilar lento).',
      'Rebaixamento do nível de consciência ou oligúria (< 0,5 mL/kg/h).',
      'Sinais de congestão pulmonar (dispneia, crepitações bibasais).'
    ],
    diagnosis: 'Baseia-se no cenário clínico de choque associado a exames complementares: eletrocardiograma (ECG) evidenciando isquemia/infarto, ecocardiograma demonstrando disfunção ventricular grave e cateterismo cardíaco (quando indicado).',
    treatment: 'Suporte hemodinâmico imediato com inotrópicos (como dobutamina) e vasopressores (como noradrenalina). O pilar principal é a revascularização precoce (angioplastia ou cirurgia) no caso de infarto agudo do miocárdio, ou dispositivos de suporte circulatório mecânico (balão intra-aórtico, ECMO).'
  },
  {
    slug: 'dengue-classica',
    term: 'Dengue Clássica',
    definition: 'A dengue clássica é uma doença febril aguda causada por um arbovírus do gênero Flavivirus, transmitida principalmente pela picada do mosquito Aedes aegypti.',
    symptoms: [
      'Febre alta de início abrupto (geralmente entre 39°C e 40°C).',
      'Cefaleia e dor retro-orbitária (atrás dos olhos).',
      'Mialgia (dor muscular) intensa e artralgia (dor nas articulações).',
      'Exantema máculo-papular pruriginoso e prostração.'
    ],
    diagnosis: 'Clínico-epidemiológico, confirmado por testes laboratoriais como detecção do antígeno NS1 (até o 5° dia), sorologia IgM/IgG (a partir do 6° dia) ou RT-PCR.',
    treatment: 'Tratamento de suporte focado em hidratação oral abundante e controle de sintomas com analgésicos e antipiréticos (como paracetamol ou dipirona). Medicamentos contendo ácido acetilsalicílico (AAS) e anti-inflamatórios não esteroidais (AINEs) são contraindicados devido ao risco de sangramento.'
  },
  {
    slug: 'eclampsia',
    term: 'Eclâmpsia',
    definition: 'A eclâmpsia é a ocorrência de crises convulsivas tônico-clônicas generalizadas em mulheres com pré-eclâmpsia, não atribuíveis a outras causas neurológicas, constituindo uma emergência obstétrica grave.',
    symptoms: [
      'Convulsões tônico-clônicas generalizadas ou coma.',
      'Hipertensão arterial grave associada a proteinúria (critérios de pré-eclâmpsia).',
      'Sinais de iminência de eclâmpsia: cefaleia intensa, distúrbios visuais (escotomas, diplopia), dor epigástrica ou em hipocôndrio direito, hiperreflexia.'
    ],
    diagnosis: 'O diagnóstico é eminentemente clínico pela presença de convulsões em gestantes com hipertensão estabelecida ou no puerpério imediato.',
    treatment: 'Prevenção e controle das convulsões com sulfato de magnésio (esquema de Pritchard ou Zuspan), controle pressórico rigoroso com anti-hipertensivos intravenosos (hidralazina ou labetalol) e estabilização da paciente para viabilizar o parto, que é a cura definitiva da doença.'
  }
];
