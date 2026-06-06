export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'guia-definitivo-enare-2026',
    title: 'Guia Definido ENARE 2026: Calendário, Vagas e Temas Mais Cobrados',
    excerpt: 'Prepare-se para o maior exame de residência médica do Brasil. Confira tudo sobre as inscrições, vagas e os assuntos prioritários de cada especialidade no ENARE 2026.',
    content: `
      <p>O Exame Nacional de Residência (ENARE) consolidou-se como o maior concurso de residência médica do Brasil. Organizado pela AOCP sob a supervisão da Ebserh, o ENARE atrai anualmente dezenas de milhares de candidatos em busca de vagas nas melhores instituições de saúde federais e estaduais do país.</p>

      <h2>Calendário do ENARE 2026 (Previsões e Cronograma)</h2>
      <p>Historicamente, o edital do ENARE é publicado no final do primeiro semestre, com a seguinte distribuição de etapas:</p>
      <ul>
        <li><strong>Publicação do Edital:</strong> Julho / Agosto</li>
        <li><strong>Período de Inscrições:</strong> Agosto a Setembro</li>
        <li><strong>Aplicação da Prova Objetiva:</strong> Outubro</li>
        <li><strong>Análise Curricular:</strong> Novembro</li>
        <li><strong>Resultado Final e Escolha de Vagas:</strong> Dezembro / Janeiro</li>
      </ul>

      <h2>A Estrutura da Prova Objetiva</h2>
      <p>A prova do ENARE possui 100 questões de múltipla escolha com 5 alternativas cada, distribuídas igualmente (20 questões para cada) nas cinco grandes áreas da medicina:</p>
      <ol>
        <li>Clínica Médica</li>
        <li>Cirurgia Geral</li>
        <li>Pediatria</li>
        <li>Ginecologia e Obstetrícia (G&O)</li>
        <li>Medicina Preventiva e Social</li>
      </ol>

      <h2>Os Temas Mais Cobrados em Cada Grande Área</h2>
      <h3>1. Clínica Médica</h3>
      <p>Foco intenso em cardiologia (principalmente hipertensão arterial sistêmica e insuficiência cardíaca) e endocrinologia (complicações agudas e crônicas do Diabetes Mellitus).</p>

      <h3>2. Cirurgia Geral</h3>
      <p>Temas de abdome agudo (apendicite aguda, colecistite aguda, obstrução intestinal) e atendimento inicial ao politraumatizado (diretrizes do ATLS 10ª edição) dominam as provas.</p>

      <h3>3. Pediatria</h3>
      <p>Calendário vacinal atualizado do PNI, desenvolvimento neuropsicomotor, aleitamento materno e infecções respiratórias comuns na infância (como as bronquiolites e pneumonias).</p>

      <h3>4. Ginecologia e Obstetrícia</h3>
      <p>Sangramentos da primeira e segunda metade da gestação, síndromes hipertensivas da gravidez (pré-eclâmpsia e eclâmpsia) e rastreamento de câncer de colo de útero e mama.</p>

      <h3>5. Medicina Preventiva e Social</h3>
      <p>Estrutura e diretrizes do Sistema Único de Saúde (SUS), níveis de atenção à saúde, bioestatística (cálculo de sensibilidade, especificidade e valores preditivos) e medicina do trabalho.</p>

      <h2>Como o RokoMed Otimiza seus Estudos para o ENARE</h2>
      <p>Com a proximidade da prova, o estudo reativo de leitura de resumos perde eficiência. A melhor estratégia é a resolução de questões focadas e revisões espaçadas. No RokoMed, nosso algoritmo adaptativo monta simulados e cadernos de erros baseados exclusivamente na incidência histórica da banca AOCP (ENARE). Além disso, o Dr. André, nosso tutor de IA, esclarece os mecanismos fisiopatológicos de cada alternativa incorreta de forma instantânea.</p>
    `,
    author: 'Dr. André (Tutor IA RokoMed)',
    date: '2026-05-15',
    readTime: '6 min'
  },
  {
    slug: 'top-5-assuntos-clinica-medica-usp',
    title: 'Top 5 Assuntos de Clínica Médica Mais Cobrados na USP-SP',
    excerpt: 'Análise estatística detalhada da banca da Faculdade de Medicina da USP (FMUSP). Descubra os temas indispensáveis para garantir sua vaga.',
    content: `
      <p>A prova de residência da Faculdade de Medicina da Universidade de São Paulo (FMUSP) é conhecida pelo seu alto nível de exigência conceitual e foco em casos clínicos complexos de subespecialidades. Passar na USP exige mais do que saber o básico: é preciso dominar condutas práticas de nível terciário.</p>

      <h2>Os 5 Assuntos Indispensáveis de Clínica Médica na USP</h2>
      
      <h3>1. Insuficiência Cardíaca (IC)</h3>
      <p>O foco costuma ser a conduta na IC com fração de ejeção reduzida (ICFEr), incluindo o papel dos inibidores de SGLT2 (gliflozinas), sacubitril-valsartana e indicação de terapia de ressincronização cardíaca.</p>

      <h3>2. Infarto Agudo do Miocárdio (IAM)</h3>
      <p>Critérios eletrocardiográficos para definição de IAM com supra de ST, tempo porta-balão, indicações e contraindicações de fibrinolíticos e dupla antiagregação plaquetária.</p>

      <h3>3. Diabetes Mellitus (DM) e Cetoacidose Diabética (CAD)</h3>
      <p>Tratamento do paciente crítico com CAD, manejo de eletrólitos (principalmente potássio e reposição de bicarbonato) e escolha de hipoglicemiantes orais em pacientes com doença renal crônica ou insuficiência cardíaca.</p>

      <h3>4. Antibioticoterapia no Paciente Crítico</h3>
      <p>Manejo da sepse e choque séptico de acordo com a Surviving Sepsis Campaign, espectro de ação de carbapenenes, polimixinas e cobertura para microrganismos multirresistentes hospitalares.</p>

      <h3>5. Distúrbios Ácido-Básicos e Eletrolíticos</h3>
      <p>Manejo de hiponatremia (risco de mielinólise pontina central ao repor muito rápido) e hipercalemia na urgência renal, além de interpretação detalhada de gasometrias arteriais com cálculo de Anion Gap.</p>

      <h2>Dica Prática para a Prova da USP</h2>
      <p>As questões da USP gostam de simular plantões de pronto-socorro. Sempre atente para os sinais de gravidade do paciente e a conduta imediata mais correta, antes de pensar em exames diagnósticos demorados.</p>
    `,
    author: 'Dra. Luiza Martins (Medicina Intensiva)',
    date: '2026-05-28',
    readTime: '5 min'
  },
  {
    slug: 'metodo-estudo-ativo-residencia',
    title: 'Método de Estudo Ativo: Como Passar na Residência sem Aulas de 3 Horas',
    excerpt: 'Cansado de cronogramas atrasados e leituras passivas? Entenda a ciência por trás do estudo ativo baseado em questões e repetição espaçada.',
    content: `
      <p>Muitos médicos e acadêmicos passam o ano de preparação para residência assistindo a extensas videoaulas e fazendo resumos coloridos. O resultado? No segundo semestre, sentem que esqueceram tudo o que estudaram em janeiro. Isso ocorre devido à chamada "Curva do Esquecimento" e ao caráter passivo desse método de estudo.</p>

      <h2>Por Que o Estudo Passivo Falha?</h2>
      <p>Ler apostilas e assistir videoaulas exige pouca energia do cérebro. Como não há esforço para recuperar a informação, as conexões neurais não se fortalecem, e o cérebro descarta o conteúdo rapidamente. O neurocientista Hermann Ebbinghaus demonstrou que perdemos mais de 70% das informações novas em apenas 24 horas caso não realizemos uma revisão ativa.</p>

      <h2>Os 3 Pilares do Estudo Ativo de Alta Retenção</h2>
      
      <h3>1. Active Recall (Recuperação Ativa)</h3>
      <p>Consiste em testar o cérebro forçando-o a buscar a resposta na memória antes de lê-la. A melhor maneira de praticar isso na preparação médica é resolvendo questões antes de estudar a teoria detalhada. Ao errar, seu cérebro cria um alerta de atenção, tornando a explicação teórica muito mais memorável.</p>

      <h3>2. Spaced Repetition (Repetição Espaçada)</h3>
      <p>Em vez de revisar o assunto no dia seguinte, depois em uma semana e depois em um mês de forma estática, revise-o exatamente no momento em que seu cérebro está prestes a esquecê-lo. No RokoMed, esse cálculo é feito de forma automatizada pelo algoritmo, baseado na sua taxa de acertos e no tempo decorrido.</p>

      <h3>3. Feedback Imediato e Caderno de Erros</h3>
      <p>Saber por que errou no mesmo instante em que respondeu é fundamental. Adicionalmente, agrupar essas questões incorretas em um "Caderno de Erros" dinâmico garante que você revise especificamente as suas fraquezas, e não os temas que você já domina.</p>

      <h2>Conclusão</h2>
      <p>Estudar de forma ativa exige mais esforço e pode ser desconfortável no início, mas é cientificamente comprovado como o método mais rápido para fixação de conteúdo e aprovação em concursos de alta concorrência.</p>
    `,
    author: 'Dr. André (Tutor IA RokoMed)',
    date: '2026-06-02',
    readTime: '7 min'
  }
];
