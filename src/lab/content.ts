import type { Localized } from '@/i18n/types'
import type { LabId } from './bus'

export const labCopy = {
  label: { en: 'Lab', pt: 'Lab' },
  titleDim: { en: 'Interactive', pt: 'Laboratório' },
  titleBright: { en: 'lab.', pt: 'interativo.' },
  intro: {
    en: 'Working projects you can run right here — real Python and SQL in your browser, a live dashboard, a design-token playground and algorithm visualizations. Nothing is a screenshot.',
    pt: 'Projetos funcionais que você roda aqui mesmo — Python e SQL de verdade no navegador, um dashboard ao vivo, um playground de design tokens e visualizações de algoritmos. Nada aqui é captura de tela.',
  },
  note: {
    en: 'Built with AI-assisted development and reviewed by me. Everything runs locally in your browser.',
    pt: 'Desenvolvido com apoio de IA e revisado por mim. Tudo roda localmente no seu navegador.',
  },
  live: { en: 'Live', pt: 'Ao vivo' },
  loadingApp: { en: 'Loading app…', pt: 'Carregando app…' },
  tryLive: { en: 'Try it live', pt: 'Testar ao vivo' },
} satisfies Record<string, Localized<string>>

export const labApps: Record<LabId, { title: Localized<string>; desc: Localized<string>; tags: string[]; file: string }> = {
  code: {
    title: { en: 'Code Lab', pt: 'Code Lab' },
    desc: { en: 'Python & SQL running in the browser', pt: 'Python e SQL rodando no navegador' },
    tags: ['Python', 'SQL', 'WebAssembly'],
    file: 'network_db.py',
  },
  data: {
    title: { en: 'Data Lab', pt: 'Data Lab' },
    desc: { en: 'Live dashboard + your own CSV', pt: 'Dashboard ao vivo + seu próprio CSV' },
    tags: ['Data', 'KPIs', 'Charts'],
    file: 'dashboard.live',
  },
  design: {
    title: { en: 'Design Lab', pt: 'Design Lab' },
    desc: { en: 'Tokens, type scale & contrast', pt: 'Tokens, escala tipográfica e contraste' },
    tags: ['UI', 'UX', 'WCAG'],
    file: 'tokens.css',
  },
  algorithms: {
    title: { en: 'Algorithm Lab', pt: 'Algorithm Lab' },
    desc: { en: 'Sorting, step by step', pt: 'Ordenação, passo a passo' },
    tags: ['Logic', 'Algorithms', 'Big-O'],
    file: 'sorting.viz',
  },
}
