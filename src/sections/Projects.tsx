import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useCallback, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { ease } from '@/animations/easing'
import { Spark } from '@/components/icons'
import { ProjectModal } from '@/components/projects/ProjectModal'
import { ProjectVisual } from '@/components/projects/ProjectVisual'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Tag } from '@/components/ui/Tag'
import { projects, type Project } from '@/data/projects'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { useI18n } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/cn'
import { useSmoothScroll } from '@/providers/SmoothScrollProvider'
import { openLab } from '@/lab/bus'
import { labCopy } from '@/lab/content'
import { FlaskConical } from 'lucide-react'

export function Projects() {
  const isDesktop = useIsDesktop()
  const reduce = useReducedMotion()
  const [selected, setSelected] = useState<Project | null>(null)
  const open = useCallback((p: Project) => setSelected(p), [])
  const close = useCallback(() => setSelected(null), [])

  return (
    <>
      {isDesktop && !reduce ? <HorizontalProjects onOpen={open} /> : <StackedProjects onOpen={open} />}
      <ProjectModal project={selected} onClose={close} onNavigate={open} />
    </>
  )
}

/* ------------------------------ Desktop: pinned horizontal track ------------------------------ */

function HorizontalProjects({ onOpen }: { onOpen: (p: Project) => void }) {
  const { t } = useI18n()
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [distance, setDistance] = useState(0)
  const [current, setCurrent] = useState(1)

  useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current
      if (track) setDistance(Math.max(0, track.scrollWidth - window.innerWidth))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (trackRef.current) ro.observe(trackRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance])
  const smoothX = useSpring(x, { stiffness: 140, damping: 30, mass: 0.4 })
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 26 })

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    setCurrent(Math.min(projects.length, Math.max(1, Math.round(p * (projects.length + 1)))))
  })

  return (
    <section
      ref={sectionRef}
      id="projects"
      aria-labelledby="projects-title"
      className="relative"
      style={{ height: `calc(100svh + ${distance}px)` }}
    >
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px hairline" />
        <motion.div ref={trackRef} className="flex h-full w-max items-center gap-[5vw] pl-[var(--gutter)] pr-[8vw] will-change-transform" style={{ x: smoothX }}>
          <IntroPanel />
          {projects.map((p, i) => (
            <ProjectPanel key={p.slug} project={p} reversed={i % 2 === 1} onOpen={onOpen} />
          ))}
          <NextPanel />
        </motion.div>

        {/* Progress */}
        <div className="container-x absolute inset-x-0 bottom-7 flex items-center gap-6">
          <span className="eyebrow tabular-nums text-ink-600">
            <span className="text-ink-900">{String(current).padStart(2, '0')}</span> / {String(projects.length).padStart(2, '0')}
          </span>
          <div className="relative h-px flex-1 overflow-hidden bg-white/10">
            <motion.div className="absolute inset-0 origin-left bg-ink-800" style={{ scaleX: bar }} />
          </div>
          <span className="eyebrow">{t.projects.scrollHint}</span>
        </div>
      </div>
    </section>
  )
}

function IntroPanel() {
  const { t } = useI18n()
  return (
    <div className="flex w-[min(34vw,520px)] shrink-0 flex-col justify-center gap-10">
      <SectionHeading id="projects" index="04" label={t.projects.label} dim={t.projects.titleDim} bright={t.projects.titleBright} titleClassName="text-[clamp(3rem,6.5vw,7rem)]" />
      <Reveal delay={0.15}>
        <p className="max-w-[40ch] text-[0.9375rem] leading-relaxed text-ink-600">{t.projects.intro}</p>
      </Reveal>
      <Reveal delay={0.25} className="flex items-center gap-4">
        <span className="flex size-12 items-center justify-center rounded-full border border-ink-300">
          <motion.span animate={{ x: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
            <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
          </motion.span>
        </span>
        <span className="eyebrow">
          {String(projects.length).padStart(2, '0')} {t.projects.count}
        </span>
      </Reveal>
    </div>
  )
}

function ProjectPanel({ project, reversed, onOpen }: { project: Project; reversed: boolean; onOpen: (p: Project) => void }) {
  const { t, l } = useI18n()
  return (
    <article
      aria-labelledby={`project-${project.slug}`}
      className="grid h-[74svh] max-h-[760px] w-[min(88vw,1440px)] shrink-0 grid-cols-12 items-center gap-8"
    >
      <div className={cn('row-start-1 flex flex-col', reversed ? 'col-span-4 col-start-9 pl-2' : 'col-span-4 col-start-1 pr-2')}>
        <span aria-hidden="true" className="text-outline -mb-2 text-[clamp(5rem,9vw,9.5rem)] font-medium leading-none tracking-[-0.06em]">
          {project.index}
        </span>
        <p className="eyebrow mt-4 text-ink-500">{l(project.discipline)}</p>
        <h3 id={`project-${project.slug}`} className="mt-4 text-[clamp(2rem,3.4vw,3.5rem)] font-medium leading-[0.98] tracking-[-0.045em] text-ink-900 text-balance">
          {l(project.title)}
        </h3>
        <p className="mt-5 max-w-[44ch] text-[0.9375rem] leading-relaxed text-ink-600">{l(project.summary)}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {project.tech.map((tech) => (
            <Tag key={tech}>{tech}</Tag>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => openLab(project.lab)} cursor="explore" icon={FlaskConical}>
            {l(labCopy.tryLive)}
          </Button>
          <Button variant="secondary" onClick={() => onOpen(project)} cursor="open" icon={ArrowUpRight}>
            {t.projects.view}
          </Button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onOpen(project)}
        data-cursor="view"
        aria-label={`${t.projects.view}: ${l(project.title)}`}
        className={cn('group/visual row-start-1 block text-left', reversed ? 'col-span-8 col-start-1' : 'col-span-8 col-start-5')}
      >
        <Reveal clip>
          <ProjectVisual project={project} className="shadow-[0_60px_120px_-60px_rgb(0_0_0/1)] transition-[border-color] duration-500 group-hover/visual:border-white/20" />
        </Reveal>
      </button>
    </article>
  )
}

function NextPanel() {
  const { t } = useI18n()
  const { scrollTo } = useSmoothScroll()
  const go = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault()
    scrollTo('#contact')
  }
  return (
    <div className="flex h-[60svh] w-[min(30vw,460px)] shrink-0 flex-col justify-between rounded-[12px] border border-dashed border-white/[0.12] p-8">
      <Spark size={28} className="text-ink-600" />
      <div>
        <p className="text-[1.75rem] font-medium leading-tight tracking-[-0.04em] text-ink-900 text-balance">{t.projects.next.title}</p>
        <p className="mt-4 text-sm leading-relaxed text-ink-500">{t.projects.next.body}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button href="#contact" onClick={go} variant="primary">
            {t.projects.next.cta}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------ Mobile / reduced motion: stacked ------------------------------ */

function StackedProjects({ onOpen }: { onOpen: (p: Project) => void }) {
  const { t, l } = useI18n()
  return (
    <section id="projects" aria-labelledby="projects-title" className="relative py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px hairline" />
      <div className="container-x">
        <SectionHeading id="projects" index="04" label={t.projects.label} dim={t.projects.titleDim} bright={t.projects.titleBright} />
        <Reveal delay={0.1} className="mt-8">
          <p className="max-w-[48ch] text-[0.9375rem] leading-relaxed text-ink-600">{t.projects.intro}</p>
        </Reveal>

        <div className="mt-16 flex flex-col gap-20">
          {projects.map((p) => (
            <motion.article
              key={p.slug}
              aria-labelledby={`project-m-${p.slug}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
              transition={{ duration: 1, ease: ease.outExpo }}
            >
              <button type="button" onClick={() => onOpen(p)} className="group/visual block w-full text-left" aria-label={`${t.projects.view}: ${l(p.title)}`}>
                <ProjectVisual project={p} />
              </button>
              <div className="mt-6 flex items-baseline justify-between gap-4">
                <p className="eyebrow">{l(p.discipline)}</p>
                <span className="font-mono text-xs text-ink-500">{p.index}</span>
              </div>
              <h3 id={`project-m-${p.slug}`} className="mt-3 text-[clamp(1.9rem,7vw,2.75rem)] font-medium leading-[1] tracking-[-0.045em] text-ink-900">
                {l(p.title)}
              </h3>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-600">{l(p.summary)}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {p.tech.map((tech) => (
                  <Tag key={tech}>{tech}</Tag>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button variant="primary" onClick={() => openLab(p.lab)} icon={FlaskConical} magnetic={false}>
                  {l(labCopy.tryLive)}
                </Button>
                <Button variant="secondary" onClick={() => onOpen(p)} icon={ArrowUpRight} magnetic={false}>
                  {t.projects.view}
                </Button>
              </div>
            </motion.article>
          ))}
          <div className="rounded-[12px] border border-dashed border-white/[0.12] p-7">
            <Spark size={22} className="text-ink-600" />
            <p className="mt-6 text-xl font-medium tracking-[-0.03em] text-ink-900">{t.projects.next.title}</p>
            <p className="mt-3 text-sm text-ink-500">{t.projects.next.body}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
