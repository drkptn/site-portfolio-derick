import type { Content } from '@/i18n/content'

export type SectionId = 'home' | 'about' | 'skills' | 'projects' | 'lab' | 'education' | 'differentials' | 'contact'

/** Page order. `nav` = shown in the main menu (differentials lives under Education). */
export const sections: { id: SectionId; index: string; navKey?: keyof Content['nav'] }[] = [
  { id: 'home', index: '01', navKey: 'home' },
  { id: 'about', index: '02', navKey: 'about' },
  { id: 'skills', index: '03', navKey: 'skills' },
  { id: 'projects', index: '04', navKey: 'projects' },
  { id: 'lab', index: '05', navKey: 'lab' },
  { id: 'education', index: '06', navKey: 'education' },
  { id: 'differentials', index: '07' },
  { id: 'contact', index: '08', navKey: 'contact' },
]

export const navSections = sections.filter((s) => s.navKey)

/** Which nav item should look active while a given section is in view. */
export const navParent: Record<SectionId, SectionId> = {
  home: 'home',
  about: 'about',
  skills: 'skills',
  projects: 'projects',
  lab: 'lab',
  education: 'education',
  differentials: 'education',
  contact: 'contact',
}
