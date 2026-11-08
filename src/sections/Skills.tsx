import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useMemo, useState, type PointerEvent } from 'react'
import { ease } from '@/animations/easing'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { skillCategories, skills, type SkillCategory } from '@/data/skills'
import { useI18n } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/cn'

type Filter = SkillCategory | 'all'

const setSpot = (e: PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

export function Skills() {
  const { t, l } = useI18n()
  const reduce = useReducedMotion()
  const [filter, setFilter] = useState<Filter>('all')
  const [activeIndex, setActiveIndex] = useState(0)
  const active = skills[activeIndex]

  const counts = useMemo(() => {
    const map = new Map<Filter, number>([['all', skills.length]])
    skillCategories.forEach((c) => map.set(c.id, skills.filter((s) => s.categories.includes(c.id)).length))
    return map
  }, [])

  const categoryName = (id: SkillCategory) => l(skillCategories.find((c) => c.id === id)!.name)
  const glyph = (id: SkillCategory) => skillCategories.find((c) => c.id === id)!.glyph

  const selectFilter = (f: Filter) => {
    setFilter(f)
    if (f !== 'all' && !skills[activeIndex].categories.includes(f)) {
      setActiveIndex(skills.findIndex((s) => s.categories.includes(f)))
    }
  }

  return (
    <section id="skills" aria-labelledby="skills-title" className="relative py-28 lg:py-40">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px hairline" />
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionHeading id="skills" index="03" label={t.skills.label} dim={t.skills.titleDim} bright={t.skills.titleBright} />
          </div>
          <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.15}>
            <p className="text-[0.9375rem] leading-relaxed text-ink-600 text-pretty">{t.skills.intro}</p>
          </Reveal>
        </div>

        {/* Filters */}
        <Reveal className="mt-14 lg:mt-20" y={16}>
          <div role="group" aria-label={t.skills.filterLabel} className="no-scrollbar -mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
            {(['all', ...skillCategories.map((c) => c.id)] as Filter[]).map((f) => {
              const on = filter === f
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => selectFilter(f)}
                  aria-pressed={on}
                  className={cn(
                    'relative flex h-10 shrink-0 items-center gap-2.5 rounded-[6px] border px-3.5 text-[0.8125rem] transition-colors duration-300',
                    on ? 'border-ink-900 text-ink-0' : 'border-ink-200 bg-ink-100/40 text-ink-600 hover:border-ink-400 hover:text-ink-900',
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="skills-filter"
                      className="absolute inset-0 -z-10 rounded-[5px] bg-ink-900"
                      transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                    />
                  )}
                  {f === 'all' ? t.skills.all : categoryName(f)}
                  <span className={cn('font-mono text-[0.625rem]', on ? 'text-ink-400' : 'text-ink-500')}>
                    {String(counts.get(f)).padStart(2, '0')}
                  </span>
                </button>
              )
            })}
          </div>
        </Reveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Read-out */}
          <div className="lg:col-span-4">
            <Reveal className="lg:sticky lg:top-28" y={30}>
              <div className="surface spotlight relative overflow-hidden rounded-[10px]" onPointerMove={setSpot}>
                <div className="relative z-[2] flex min-h-[19rem] flex-col p-6 lg:min-h-[27rem] lg:p-7" aria-live="polite">
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-xs tabular-nums text-ink-500">{String(activeIndex + 1).padStart(2, '0')}</span>
                    <span className="font-mono text-xs text-ink-500">{glyph(active.categories[0])}</span>
                  </div>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={active.symbol}
                      className="flex flex-1 flex-col"
                      initial={reduce ? false : { opacity: 0, y: 14, filter: 'blur(6px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={reduce ? undefined : { opacity: 0, y: -10, filter: 'blur(6px)' }}
                      transition={{ duration: 0.35, ease: ease.outExpo }}
                    >
                      <p aria-hidden="true" className="text-metal my-auto py-4 text-[clamp(5rem,9vw,8.5rem)] font-medium leading-none tracking-[-0.06em]">
                        {active.symbol}
                      </p>
                      <div>
                        <h3 className="text-2xl font-medium tracking-[-0.03em] text-ink-900">{active.name}</h3>
                        <div className="my-5 h-px w-full bg-white/[0.08]" />
                        <dl className="grid gap-4 text-sm">
                          <div>
                            <dt className="eyebrow mb-1.5">{t.skills.category}</dt>
                            <dd className="text-ink-700">{active.categories.map(categoryName).join(' · ')}</dd>
                          </div>
                          <div>
                            <dt className="eyebrow mb-1.5">{t.skills.where}</dt>
                            <dd className="leading-relaxed text-ink-600">{l(active.note)}</dd>
                          </div>
                        </dl>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <p className="eyebrow mt-4 hidden text-ink-500 lg:block">↳ {t.skills.hint}</p>
            </Reveal>
          </div>

          {/* Periodic table */}
          <div className="lg:col-span-8">
            <ul className="grid grid-cols-4 gap-1.5 xs:grid-cols-5 sm:grid-cols-7 sm:gap-2">
              {skills.map((s, i) => {
                const matches = filter === 'all' || s.categories.includes(filter)
                const isActive = i === activeIndex
                return (
                  <motion.li
                    key={s.symbol}
                    initial={reduce ? false : { opacity: 0, scale: 0.92, y: 16 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: '0px 0px -5% 0px' }}
                    transition={{ duration: 0.7, ease: ease.outExpo, delay: (i % 7) * 0.04 + Math.floor(i / 7) * 0.08 }}
                  >
                    <button
                      type="button"
                      onPointerEnter={() => setActiveIndex(i)}
                      onFocus={() => setActiveIndex(i)}
                      onClick={() => setActiveIndex(i)}
                      onPointerMove={setSpot}
                      aria-pressed={isActive}
                      aria-label={`${s.name} — ${s.categories.map(categoryName).join(', ')}`}
                      className={cn(
                        'spotlight group relative flex aspect-square w-full flex-col justify-between overflow-hidden rounded-[6px] border p-2 text-left transition-[opacity,transform,border-color,background-color] duration-500 ease-[var(--ease-out-expo)] sm:p-2.5 lg:p-3',
                        isActive
                          ? 'border-ink-600 bg-ink-200/50'
                          : 'border-ink-200 bg-gradient-to-b from-ink-100/70 to-ink-75 hover:-translate-y-0.5 hover:border-ink-400',
                        !matches && 'scale-[0.94] opacity-20',
                      )}
                    >
                      <span className="relative z-[2] flex items-start justify-between font-mono text-[0.5625rem] text-ink-500 sm:text-[0.625rem]">
                        <span className="tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                        <span aria-hidden="true">{glyph(s.categories[0])}</span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          'relative z-[2] text-[clamp(1.25rem,3.4vw,2.25rem)] font-medium leading-none tracking-[-0.05em] transition-colors duration-300',
                          isActive ? 'text-ink-950' : 'text-ink-700 group-hover:text-ink-950',
                        )}
                      >
                        {s.symbol}
                      </span>
                      <span aria-hidden="true" className="relative z-[2] truncate text-[0.5625rem] text-ink-500 sm:text-[0.6875rem]">
                        {s.name}
                      </span>
                      {isActive && (
                        <motion.span
                          layoutId="skill-active"
                          aria-hidden="true"
                          className="absolute inset-x-2 bottom-0 h-px bg-ink-900"
                          transition={{ type: 'spring', stiffness: 400, damping: 36 }}
                        />
                      )}
                    </button>
                  </motion.li>
                )
              })}
            </ul>

            {/* Legend */}
            <Reveal className="mt-6 flex flex-wrap gap-x-6 gap-y-2" y={10}>
              {skillCategories.map((c) => (
                <span key={c.id} className="eyebrow flex items-center gap-2 text-ink-500">
                  <span className="text-ink-600" aria-hidden="true">{c.glyph}</span>
                  {l(c.name)}
                </span>
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
