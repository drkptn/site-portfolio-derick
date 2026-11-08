import type { Localized } from '@/i18n/types'
import type { LabId } from '@/lab/bus'

export type ProjectVisual = 'code' | 'dashboard' | 'web'

export interface Project {
  index: string
  slug: string
  visual: ProjectVisual
  discipline: Localized<string>
  title: Localized<string>
  summary: Localized<string>
  /** Bullet points taken from the CV. */
  details: Localized<string[]>
  tech: string[]
  /**
   * Links are intentionally empty — fill them when the material is published.
   * Empty links render as "Coming soon" instead of fake URLs.
   */
  links: { demo: string; github: string; caseStudy: string }
  /** Interactive app in the Lab section that demonstrates this project's skills. */
  lab: LabId
}

export const projects: Project[] = [
  {
    index: '01',
    slug: 'python-csharp-apps',
    visual: 'code',
    discipline: { en: 'Software · Databases', pt: 'Software · Banco de dados' },
    title: { en: 'Python & C# Applications', pt: 'Aplicações em Python e C#' },
    summary: {
      en: 'Programs built with a focus on databases — modeling, storage and querying of information.',
      pt: 'Desenvolvimento de programas com foco em banco de dados, modelagem, armazenamento e consulta de informações.',
    },
    details: {
      en: [
        'Database-focused programs: data modeling, storage and querying of information.',
        'Projects with network (networking) data, practicing logic, data structuring and code organization.',
      ],
      pt: [
        'Programas com foco em banco de dados: modelagem, armazenamento e consulta de informações.',
        'Projetos com dados de redes (networking), praticando lógica, estruturação de dados e organização de código.',
      ],
    },
    tech: ['Python', 'C#', 'SQL', 'Database'],
    links: { demo: '', github: '', caseStudy: '' },
    lab: 'code',
  },
  {
    index: '02',
    slug: 'interactive-dashboards',
    visual: 'dashboard',
    discipline: { en: 'Data · Visualization', pt: 'Dados · Visualização' },
    title: { en: 'Interactive Dashboards', pt: 'Dashboards Interativos' },
    summary: {
      en: 'Dashboards built with data treatment, KPIs and charts to support decision-making, prioritizing visual clarity and UX principles.',
      pt: 'Construção de dashboards com tratamento de dados, indicadores (KPIs) e gráficos para apoiar a tomada de decisão, priorizando clareza visual e princípios de UX.',
    },
    details: {
      en: [
        'Power BI dashboards with data treatment, indicators (KPIs) and charts to support decision-making.',
        'Focus on visual clarity, applying UX principles to the presentation of data.',
      ],
      pt: [
        'Dashboards em Power BI com tratamento de dados, indicadores (KPIs) e gráficos para apoiar a tomada de decisão.',
        'Foco em clareza visual, aplicando princípios de UX na apresentação dos dados.',
      ],
    },
    tech: ['Power BI', 'Excel', 'Data Analytics', 'UX'],
    links: { demo: '', github: '', caseStudy: '' },
    lab: 'data',
  },
  {
    index: '03',
    slug: 'websites-interfaces',
    visual: 'web',
    discipline: { en: 'Web · Interface design', pt: 'Web · Design de interface' },
    title: { en: 'Websites & Web Interfaces', pt: 'Sites e Interfaces Web' },
    summary: {
      en: 'Responsive websites built with HTML, CSS and JavaScript, with layouts and prototypes created in Figma.',
      pt: 'Desenvolvimento de sites responsivos utilizando HTML, CSS e JavaScript, com layouts e protótipos criados no Figma.',
    },
    details: {
      en: [
        'Responsive websites with HTML, CSS and JavaScript.',
        'Layouts and prototypes created in Figma.',
      ],
      pt: [
        'Sites responsivos com HTML, CSS e JavaScript.',
        'Layouts e protótipos criados no Figma.',
      ],
    },
    tech: ['HTML', 'CSS', 'JavaScript', 'Figma', 'UI/UX'],
    links: { demo: '', github: '', caseStudy: '' },
    lab: 'design',
  },
]
