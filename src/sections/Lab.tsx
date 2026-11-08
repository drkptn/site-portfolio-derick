import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { BarChart3, Binary, Palette, SquareTerminal } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ease } from '@/animations/easing'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useI18n } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/cn'
import { LAB_IDS, onOpenLab, type LabId } from '@/lab/bus'
import { labApps, labCopy } from '@/lab/content'
import { useSmoothScroll } from '@/providers/SmoothScrollProvider'

// Each app is its own chunk: nothing is downloaded until a visitor opens it
const apps: Record<LabId, React.LazyExoticComponent<() => React.JSX.Element>> = {
  code: lazy(() => import('@/lab/code/CodeLab')),
  data: lazy(() => import('@/lab/data/DataLab')),
  design: lazy(() => import('@/lab/design/DesignLab')),
  algorithms: lazy(() => import('@/lab/algorithms/AlgoLab')),
}
const icons = { code: SquareTerminal, data: BarChart3, design: Palette, algorithms: Binary }

export function Lab() {
  const { l } = useI18n()
  const reduce = useReducedMotion()
  const { scrollTo } = useSmoothScroll()
  const [active, setActive] = useState<LabId>('code')
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const tabRefs = useRef<Record<LabId, HTMLButtonElement | null>>({ code: null, data: null, design: null, algorithms: null })
  const App = apps[active]

  // Mount the active app only once the section is near the viewport
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: '400px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // "Try it live" from a project opens the matching app
  useEffect(
    () =>
      onOpenLab((id) => {
        setActive(id)
        setVisible(true)
        requestAnimationFrame(() => scrollTo('#lab-apps', { offset: -90 }))
      }),
    [scrollTo],
  )

  // Arrow-key navigation between tabs (WAI-ARIA tabs pattern)
  const onKey = (e: KeyboardEvent) => {
    const i = LAB_IDS.indexOf(active)
    const next = e.key === 'ArrowRight' ? LAB_IDS[(i + 1) % 4] : e.key === 'ArrowLeft' ? LAB_IDS[(i + 3) % 4] : null
    if (!next) return
    e.preventDefault()
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section ref={sectionRef} id="lab" aria-labelledby="lab-title" className="relative py-28 lg:py-40">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px hairline" />
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionHeading id="lab" index="05" label={l(labCopy.label)} dim={l(labCopy.titleDim)} bright={l(labCopy.titleBright)} />
          </div>
          <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.15}>
            <p className="text-[0.9375rem] leading-relaxed text-ink-600 text-pretty">{l(labCopy.intro)}</p>
            <p className="eyebrow mt-4 normal-case tracking-normal text-ink-500">{l(labCopy.note)}</p>
          </Reveal>
        </div>

        <Reveal className="mt-14 lg:mt-20" y={20}>
          <div id="lab-apps" role="tablist" aria-label={l(labCopy.label)} onKeyDown={onKey} className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {LAB_IDS.map((id, i) => {
              const Icon = icons[id]
              const on = id === active
              return (
                <button
                  key={id}
                  ref={(el) => {
                    tabRefs.current[id] = el
                  }}
                  role="tab"
                  id={`lab-tab-${id}`}
                  aria-selected={on}
                  aria-controls="lab-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(id)}
                  className={cn(
                    'group relative flex flex-col gap-4 overflow-hidden rounded-[10px] border p-4 text-left transition-colors duration-500 sm:p-5',
                    on ? 'border-ink-600 bg-ink-100' : 'border-ink-200 bg-ink-75 hover:border-ink-400',
                  )}
                >
                  <span className="flex items-center justify-between">
                    <span className={cn('flex size-9 items-center justify-center rounded-[7px] border transition-colors', on ? 'border-ink-900 bg-ink-900 text-ink-0' : 'border-ink-300 text-ink-700')}>
                      <Icon size={17} strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <span className="font-mono text-[0.625rem] text-ink-500">0{i + 1}</span>
                  </span>
                  <span>
                    <span className="block text-base font-medium tracking-[-0.02em] text-ink-900 sm:text-lg">{l(labApps[id].title)}</span>
                    <span className="mt-1 block text-xs leading-snug text-ink-500 sm:text-[0.8125rem]">{l(labApps[id].desc)}</span>
                  </span>
                  <span className="hidden flex-wrap gap-1 sm:flex">
                    {labApps[id].tags.map((tag) => (
                      <span key={tag} className="rounded-[3px] border border-ink-200 px-1.5 py-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.08em] text-ink-500">
                        {tag}
                      </span>
                    ))}
                  </span>
                  {on && <motion.span layoutId="lab-tab" className="absolute inset-x-4 bottom-0 h-px bg-ink-900" />}
                </button>
              )
            })}
          </div>
        </Reveal>

        <div id="lab-panel" role="tabpanel" aria-labelledby={`lab-tab-${active}`} className="mt-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={reduce ? false : { opacity: 0, y: 16, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={reduce ? undefined : { opacity: 0, y: -8, filter: 'blur(6px)' }}
              transition={{ duration: 0.45, ease: ease.outExpo }}
            >
              {visible ? (
                <Suspense fallback={<LabSkeleton label={l(labCopy.loadingApp)} />}>
                  <App />
                </Suspense>
              ) : (
                <LabSkeleton label={l(labCopy.loadingApp)} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

/** Skeleton shown while an app chunk is downloading. */
function LabSkeleton({ label }: { label: string }) {
  return (
    <div className="surface overflow-hidden rounded-[14px]" aria-busy="true" aria-label={label}>
      <div className="flex h-12 items-center gap-3 border-b border-white/[0.07] px-4">
        <span className="h-2.5 w-14 rounded-full bg-ink-200" />
        <span className="h-2.5 w-24 animate-pulse rounded-full bg-ink-200" />
        <span className="ml-auto h-8 w-24 animate-pulse rounded-[6px] bg-ink-200" />
      </div>
      <div className="grid gap-4 p-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3">
          {[80, 62, 90, 45, 70, 55, 84].map((w, i) => (
            <span key={i} className="block h-3 animate-pulse rounded-full bg-ink-200/80" style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-[8px] bg-ink-100" />
      </div>
    </div>
  )
}
