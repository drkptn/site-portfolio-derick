import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight, ArrowUpRight, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ease } from '@/animations/easing'
import { Tag } from '@/components/ui/Tag'
import { projects, type Project } from '@/data/projects'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useI18n } from '@/i18n/LanguageProvider'
import { useSmoothScroll } from '@/providers/SmoothScrollProvider'
import { ProjectVisual } from './ProjectVisual'

interface ProjectModalProps {
  project: Project | null
  onClose: () => void
  onNavigate: (project: Project) => void
}

export function ProjectModal({ project, onClose, onNavigate }: ProjectModalProps) {
  const { lock, unlock } = useSmoothScroll()
  const open = project !== null

  useEffect(() => {
    if (!open) return
    lock()
    return () => unlock()
  }, [open, lock, unlock])

  return createPortal(
    <AnimatePresence>
      {project && <ModalBody key="modal" project={project} onClose={onClose} onNavigate={onNavigate} />}
    </AnimatePresence>,
    document.body,
  )
}

function ModalBody({ project, onClose, onNavigate }: { project: Project; onClose: () => void; onNavigate: (p: Project) => void }) {
  const { t, l } = useI18n()
  const reduce = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  useFocusTrap(panelRef, true, onClose, closeRef)

  const next = projects[(projects.indexOf(project) + 1) % projects.length]
  const m = t.projects.modal
  const links: { key: keyof Project['links']; label: string }[] = [
    { key: 'demo', label: m.demo },
    { key: 'github', label: m.github },
    { key: 'caseStudy', label: m.caseStudy },
  ]

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [project])

  const item = (i: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 24 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: ease.outExpo, delay: 0.35 + i * 0.07 },
  })

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-stretch justify-center p-0 lg:p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4, delay: 0.25 } }}
    >
      <button
        type="button"
        aria-label={m.close}
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-ink-0/75 backdrop-blur-md"
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        className="relative flex w-full max-w-[1400px] flex-col overflow-hidden border border-white/[0.08] bg-ink-50 lg:rounded-[14px]"
        initial={reduce ? { opacity: 0 } : { clipPath: 'inset(100% 0% 0% 0%)' }}
        animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)' }}
        exit={reduce ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
        transition={{ duration: 0.9, ease: ease.inOutQuart }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-4 lg:px-8">
          <p className="eyebrow flex items-center gap-3 text-ink-500">
            <span className="text-ink-900">{project.index}</span>
            <span className="h-px w-6 bg-ink-400" aria-hidden="true" />
            {l(project.discipline)}
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="group flex h-10 items-center gap-3 rounded-[6px] border border-ink-200 bg-ink-100/60 pl-3 pr-2 text-xs text-ink-700 transition-colors hover:border-ink-400 hover:text-ink-950"
          >
            <span className="hidden font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-500 sm:inline">Esc</span>
            {m.close}
            <X size={16} strokeWidth={1.5} className="transition-transform duration-500 group-hover:rotate-90" aria-hidden="true" />
          </button>
        </div>

        <div ref={scrollRef} data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-5 pb-16 pt-10 lg:px-8 lg:pt-14">
            <motion.h2
              {...item(0)}
              id="project-modal-title"
              className="max-w-[16ch] text-[clamp(2.4rem,6vw,5.5rem)] font-medium leading-[0.95] tracking-[-0.05em] text-ink-900"
            >
              {l(project.title)}
            </motion.h2>
            <motion.p {...item(1)} className="mt-6 max-w-[60ch] text-base leading-relaxed text-ink-600 lg:text-lg">
              {l(project.summary)}
            </motion.p>

            <motion.div {...item(2)} className="mt-10">
              <ProjectVisual project={project} />
              <p className="eyebrow mt-3 text-ink-500">↳ {m.note}</p>
            </motion.div>

            <div className="mt-14 grid gap-10 border-t border-white/[0.07] pt-10 md:grid-cols-12">
              <motion.div {...item(3)} className="md:col-span-6">
                <h3 className="eyebrow mb-5 text-ink-600">{m.involved}</h3>
                <ul className="space-y-4">
                  {l(project.details).map((d, i) => (
                    <li key={i} className="flex gap-4 text-[0.9375rem] leading-relaxed text-ink-700">
                      <span className="mt-1 font-mono text-[0.6875rem] text-ink-500">0{i + 1}</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div {...item(4)} className="md:col-span-3">
                <h3 className="eyebrow mb-5 text-ink-600">{m.stack}</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <Tag key={tech}>{tech}</Tag>
                  ))}
                </div>
              </motion.div>
              <motion.div {...item(5)} className="md:col-span-3">
                <h3 className="eyebrow mb-5 text-ink-600">{m.links}</h3>
                <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
                  {links.map(({ key, label }) => {
                    const href = project.links[key]
                    return (
                      <li key={key}>
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-cursor="open"
                            className="group flex items-center justify-between py-3 text-sm text-ink-800 hover:text-ink-950"
                          >
                            {label}
                            <ArrowUpRight size={15} strokeWidth={1.5} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </a>
                        ) : (
                          <span className="flex items-center justify-between py-3 text-sm text-ink-500" aria-disabled="true">
                            {label}
                            <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-500">{m.soon}</span>
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </motion.div>
            </div>

            {/* Next project */}
            <motion.button
              {...item(6)}
              type="button"
              onClick={() => onNavigate(next)}
              className="group mt-16 flex w-full items-end justify-between gap-6 border-t border-white/[0.07] pt-8 text-left"
            >
              <span>
                <span className="eyebrow block text-ink-500">{next.index} — {m.next}</span>
                <span className="mt-3 block text-[clamp(1.6rem,4vw,3.25rem)] font-medium tracking-[-0.045em] text-ink-500 transition-colors duration-500 group-hover:text-ink-950">
                  {l(next.title)}
                </span>
              </span>
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full border border-ink-300 text-ink-700 transition-all duration-500 group-hover:border-ink-900 group-hover:bg-ink-900 group-hover:text-ink-0">
                <ArrowRight size={20} strokeWidth={1.5} aria-hidden="true" />
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
