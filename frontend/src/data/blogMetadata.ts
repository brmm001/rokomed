export interface PostMetadata {
  category: string;
  cover: string;
  inside: string;
}

export const postMetadataMap: Record<string, PostMetadata> = {
  'guia-definitivo-enare-2026': {
    category: 'Editais & Provas',
    cover: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    inside: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80'
  },
  'top-5-assuntos-clinica-medica-usp': {
    category: 'Editais & Provas',
    cover: 'https://images.unsplash.com/photo-1562774053-401386df7986?auto=format&fit=crop&w=800&q=80',
    inside: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&w=800&q=80'
  },
  'metodo-estudo-ativo-residencia': {
    category: 'Metodologia',
    cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    inside: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80'
  },
  'quanto-ganha-anestesiologista-na-pratica': {
    category: 'Carreira & Salário',
    cover: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&w=800&q=80',
    inside: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=800&q=80'
  },
  'quanto-ganha-dermatologista-na-pratica': {
    category: 'Carreira & Salário',
    cover: 'https://images.unsplash.com/photo-1614859324967-bdf461fcf769?auto=format&fit=crop&w=800&q=80',
    inside: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80'
  },
  'quanto-ganha-oftalmologista-na-pratica': {
    category: 'Carreira & Salário',
    cover: 'https://images.unsplash.com/photo-1507878866276-a947ef722fee?auto=format&fit=crop&w=800&q=80',
    inside: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80'
  },
  'quanto-ganha-psiquiatra-na-pratica': {
    category: 'Carreira & Salário',
    cover: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    inside: 'https://images.unsplash.com/photo-1527137341206-1a2ab81a4a69?auto=format&fit=crop&w=800&q=80'
  },
  'quanto-ganha-ortopedista-na-pratica': {
    category: 'Carreira & Salário',
    cover: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=800&q=80',
    inside: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80'
  },
  'quanto-ganha-cardiologista-na-pratica': {
    category: 'Carreira & Salário',
    cover: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=800&q=80',
    inside: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80'
  },
  'quanto-ganha-radiologista-na-pratica': {
    category: 'Carreira & Salário',
    cover: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    inside: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
  },
  'quanto-ganha-cirurgiao-plastico-na-pratica': {
    category: 'Carreira & Salário',
    cover: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    inside: 'https://images.unsplash.com/photo-1616391182219-e080b4d1043a?auto=format&fit=crop&w=800&q=80'
  },
  'quanto-ganha-pediatra-na-pratica': {
    category: 'Carreira & Salário',
    cover: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=800&q=80',
    inside: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=800&q=80'
  },
  'quanto-ganha-medico-de-familia-na-pratica': {
    category: 'Carreira & Salário',
    cover: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    inside: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80'
  }
};

export const defaultMetadata: PostMetadata = {
  category: 'Geral',
  cover: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
  inside: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80'
};
