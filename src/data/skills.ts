import type { Localized } from '@/i18n/types'

export type SkillCategory = 'programming' | 'frontend' | 'data' | 'design' | 'ai'

export interface SkillElement {
  symbol: string
  name: string
  categories: SkillCategory[]
  /** Where this skill shows up — strictly based on the CV. */
  note: Localized<string>
}

export const skillCategories: { id: SkillCategory; name: Localized<string>; glyph: string }[] = [
  { id: 'programming', name: { en: 'Programming', pt: 'Programação' }, glyph: '{ }' },
  { id: 'frontend', name: { en: 'Front-End', pt: 'Front-End' }, glyph: '</>' },
  { id: 'data', name: { en: 'Data & Analytics', pt: 'Dados & Análise' }, glyph: '▦' },
  { id: 'design', name: { en: 'Design & Tools', pt: 'Design & Ferramentas' }, glyph: '◇' },
  { id: 'ai', name: { en: 'Artificial Intelligence', pt: 'Inteligência Artificial' }, glyph: '✦' },
]

const webCourse: Localized<string> = {
  en: 'Responsive websites and interfaces · Origamid course (46h, 2024).',
  pt: 'Sites e interfaces responsivos · curso Origamid (46h, 2024).',
}

const dbApps: Localized<string> = {
  en: 'Applications focused on databases: modeling, storage and querying of information.',
  pt: 'Aplicações com foco em banco de dados: modelagem, armazenamento e consulta de informações.',
}

/**
 * Ordered so each category forms a contiguous block in the 7 × 3 "periodic table".
 * NOTE: Java was requested for the site but is not listed in the current CV PDF —
 * no proficiency level or project is attributed to it.
 */
export const skills: SkillElement[] = [
  // Programming
  { symbol: 'Py', name: 'Python', categories: ['programming'], note: dbApps },
  {
    symbol: 'C#',
    name: 'C#',
    categories: ['programming'],
    note: {
      en: 'Database-focused programs and projects with network data, practicing code organization.',
      pt: 'Programas com foco em banco de dados e projetos com dados de redes, praticando organização de código.',
    },
  },
  { symbol: 'Js', name: 'JavaScript', categories: ['programming', 'frontend'], note: webCourse },
  {
    symbol: 'Jv',
    name: 'Java',
    categories: ['programming'],
    note: { en: 'Programming knowledge.', pt: 'Conhecimento em programação.' },
  },
  {
    symbol: 'Lg',
    name: 'Logic & Algorithms',
    categories: ['programming'],
    note: {
      en: 'Practiced through projects with network data: logic, data structuring and code organization.',
      pt: 'Praticada em projetos com dados de redes: lógica, estruturação de dados e organização de código.',
    },
  },
  // Front-end
  { symbol: 'Ht', name: 'HTML5', categories: ['frontend'], note: webCourse },
  { symbol: 'Cs', name: 'CSS3', categories: ['frontend'], note: webCourse },
  {
    symbol: 'Rd',
    name: 'Responsive Design',
    categories: ['frontend'],
    note: {
      en: 'Responsive websites with layouts and prototypes created in Figma.',
      pt: 'Sites responsivos com layouts e protótipos criados no Figma.',
    },
  },
  // Data
  {
    symbol: 'Sq',
    name: 'SQL',
    categories: ['data', 'programming'],
    note: {
      en: 'Storing and querying information in database-focused applications.',
      pt: 'Armazenamento e consulta de informações em aplicações com banco de dados.',
    },
  },
  { symbol: 'Db', name: 'Database', categories: ['data'], note: dbApps },
  {
    symbol: 'Bi',
    name: 'Power BI',
    categories: ['data'],
    note: {
      en: 'Interactive dashboards with KPIs and charts · Impacta certificate (40h, 2026).',
      pt: 'Dashboards interativos com KPIs e gráficos · certificado Impacta (40h, 2026).',
    },
  },
  {
    symbol: 'Xl',
    name: 'Excel',
    categories: ['data'],
    note: {
      en: 'Data treatment and organization for analysis and dashboards.',
      pt: 'Tratamento e organização de dados para análise e dashboards.',
    },
  },
  {
    symbol: 'Ds',
    name: 'Dashboards',
    categories: ['data'],
    note: {
      en: 'Indicators (KPIs) and charts to support decision-making, with clear visual hierarchy.',
      pt: 'Indicadores (KPIs) e gráficos para apoiar a tomada de decisão, com clareza visual.',
    },
  },
  {
    symbol: 'Nw',
    name: 'Networking',
    categories: ['data'],
    note: {
      en: 'Projects with network data, practicing logic and data structuring.',
      pt: 'Projetos com dados de redes, praticando lógica e estruturação de dados.',
    },
  },
  // Design & tools
  {
    symbol: 'Fg',
    name: 'Figma',
    categories: ['design'],
    note: {
      en: 'Layouts and prototypes for web projects.',
      pt: 'Layouts e protótipos para projetos web.',
    },
  },
  {
    symbol: 'Ui',
    name: 'UI Design',
    categories: ['design'],
    note: {
      en: 'Interface design · Origamid UI/UX course (80h, 2024).',
      pt: 'Design de interfaces · curso de UI/UX Origamid (80h, 2024).',
    },
  },
  {
    symbol: 'Ux',
    name: 'UX Design',
    categories: ['design'],
    note: {
      en: 'UX principles applied to data presentation and interfaces · Origamid (80h, 2024).',
      pt: 'Princípios de UX aplicados à apresentação de dados e interfaces · Origamid (80h, 2024).',
    },
  },
  {
    symbol: 'Vs',
    name: 'VS Code',
    categories: ['design'],
    note: {
      en: 'Code editor used for development work.',
      pt: 'Editor de código usado no desenvolvimento.',
    },
  },
  // AI
  {
    symbol: 'Ga',
    name: 'Generative AI',
    categories: ['ai'],
    note: {
      en: 'Applied to study, development and productivity.',
      pt: 'Aplicada ao estudo, ao desenvolvimento e à produtividade.',
    },
  },
  {
    symbol: 'At',
    name: 'AI Tools',
    categories: ['ai'],
    note: {
      en: 'Used to gain productivity and accelerate learning.',
      pt: 'Usadas para ganhar produtividade e acelerar o aprendizado.',
    },
  },
  {
    symbol: 'Ad',
    name: 'AI-assisted Development',
    categories: ['ai'],
    note: {
      en: 'AI as support for writing, understanding and organizing code.',
      pt: 'IA como apoio para escrever, entender e organizar código.',
    },
  },
]
