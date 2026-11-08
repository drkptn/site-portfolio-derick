import { motion, useInView, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { Award, GraduationCap } from 'lucide-react'
import { useRef } from 'react'
import { ease } from '@/animations/easing'
import { CircleLoader } from '@/components/ui/CircleLoader'
import { Counter } from '@/components/ui/Counter'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { profile, totalCertifiedHours } from '@/data/profile'
import { useI18n } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/cn'

type Kind = 'certificate' | 'now' | 'future'
interface Milestone {
  key: string
  year: string
  title: string
  meta: string
  kind: Kind
  hours?: number
}

export function Education() {
  const { t, lang } = useI18n()
  const e = t.education
  const reduce = useReducedMotion()
  const timelineRef = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ['start 65%', 'end 55%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 28 })

  const milestones: Milestone[] = [
    ...profile.certifications.map((c) => ({
      key: c.id,
      year: String(c.year),
      title: c.name,
      meta: `${c.issuer} · ${c.hours} ${e.hours}`,
      kind: 'certificate' as const,
      hours: c.hours,
    })),
    { key: 'now', year: e.now, title: e.nowTitle, meta: profile.education.institution, kind: 'now' },
    {
      key: 'grad',
      year: String(profile.education.expectedYear),
      title: e.graduationTitle,
      meta: `${profile.education.institution} · ${e.expectedShort}`,
      kind: 'future',
    },
  ]

  return (
    <section id="education" aria-labelledby="education-title" className="relative py-28 lg:py-40">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px hairline" />
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionHeading id="education" index="05" label={e.label} dim={e.titleDim} bright={e.titleBright} />
          </div>
          <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.15}>
            <div className="flex items-end gap-4">
              <Counter to={totalCertifiedHours} suffix="h" className="text-[clamp(3.5rem,6vw,5.5rem)] font-medium leading-none tracking-[-0.06em] text-ink-900" />
              <p className="mb-2 max-w-[14ch] text-sm leading-snug text-ink-500">{e.hoursLabel}</p>
            </div>
            <HoursBar />
          </Reveal>
        </div>

        <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-10">
          {/* Degree */}
          <div className="lg:col-span-5">
            <Reveal className="lg:sticky lg:top-28" y={40}>
              <article className="surface relative overflow-hidden rounded-[12px] p-6 lg:p-8" aria-labelledby="degree-title">
                <span aria-hidden="true" className="text-outline pointer-events-none absolute -bottom-10 -right-4 select-none text-[13rem] font-semibold leading-none tracking-[-0.08em] opacity-50">
                  CS
                </span>
                <div className="relative flex items-center justify-between">
                  <span className="eyebrow flex items-center gap-2 text-ink-600">
                    <GraduationCap size={14} strokeWidth={1.5} aria-hidden="true" />
                    {profile.education.institution}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink-100/60 py-1 pl-1.5 pr-3 text-xs text-ink-700">
                    <CircleLoader size={16} stroke={1.5} className="text-ink-800" />
                    {e.status}
                  </span>
                </div>

                <h3 id="degree-title" className="relative mt-12 max-w-[14ch] text-[clamp(1.9rem,3vw,2.6rem)] font-medium leading-[1.02] tracking-[-0.045em] text-ink-900">
                  {e.degree}
                </h3>

                <div className="relative mt-10 flex items-center gap-6">
                  <div className="relative flex size-28 items-center justify-center">
                    <svg viewBox="0 0 112 112" className="absolute inset-0" aria-hidden="true">
                      {Array.from({ length: 48 }).map((_, i) => (
                        <line
                          key={i}
                          x1="56"
                          y1="4"
                          x2="56"
                          y2={i % 4 === 0 ? 12 : 9}
                          stroke="currentColor"
                          className="text-ink-300"
                          strokeWidth="1"
                          transform={`rotate(${i * 7.5} 56 56)`}
                        />
                      ))}
                    </svg>
                    {/* Indeterminate arc: "in progress", without implying a total number of semesters */}
                    <CircleLoader size={92} stroke={1} className="absolute text-ink-700" />
                    <span className="text-4xl font-medium tracking-[-0.05em] text-ink-950">
                      0{profile.education.semester}
                    </span>
                  </div>
                  <div>
                    <p className="eyebrow">{e.semester}</p>
                    <p className="mt-2 text-sm text-ink-600">{e.semesterLong}</p>
                  </div>
                </div>

                <dl className="relative mt-10 grid grid-cols-2 border-t border-white/[0.08] pt-6">
                  <div>
                    <dt className="eyebrow">{e.expected}</dt>
                    <dd className="mt-2 text-2xl font-medium tracking-[-0.03em] text-ink-900">{profile.education.expectedYear}</dd>
                  </div>
                  <div className="border-l border-white/[0.08] pl-6">
                    <dt className="eyebrow">{lang === 'pt' ? 'Grau' : 'Degree'}</dt>
                    <dd className="mt-2 text-2xl font-medium tracking-[-0.03em] text-ink-900">{lang === 'pt' ? 'Bacharelado' : 'Bachelor'}</dd>
                  </div>
                </dl>
              </article>
            </Reveal>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal y={12}>
              <h3 className="eyebrow mb-8 text-ink-600">{e.certsLabel}</h3>
            </Reveal>
            <ol ref={timelineRef} className="relative">
              <span aria-hidden="true" className="absolute bottom-3 left-[5.5px] top-3 w-px bg-white/10 sm:left-[calc(4.5rem+5.5px)]" />
              <motion.span
                aria-hidden="true"
                className="absolute bottom-3 left-[5.5px] top-3 w-px origin-top bg-gradient-to-b from-ink-950 via-ink-700 to-ink-500 sm:left-[calc(4.5rem+5.5px)]"
                style={reduce ? undefined : { scaleY: fill }}
              />
              {milestones.map((m, i) => (
                <TimelineItem key={m.key} milestone={m} index={i} />
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

function TimelineItem({ milestone: m, index }: { milestone: Milestone; index: number }) {
  const { t } = useI18n()
  const ref = useRef<HTMLLIElement>(null)
  const shown = useInView(ref, { once: true, margin: '0px 0px -12% 0px' })
  const lit = useInView(ref, { once: true, margin: '0px 0px -45% 0px' })
  const reduce = useReducedMotion()

  return (
    <li ref={ref} className="relative grid grid-cols-[12px_1fr] gap-x-6 pb-10 last:pb-0 sm:grid-cols-[4.5rem_12px_1fr]">
      <span className={cn('hidden pt-4 font-mono text-xs tabular-nums transition-colors duration-700 sm:block', lit ? 'text-ink-900' : 'text-ink-500')}>
        {m.year}
      </span>
      <span className="relative flex justify-center pt-[1.15rem]" aria-hidden="true">
        <span
          className={cn(
            'relative z-10 block size-3 rounded-full border transition-all duration-700',
            m.kind === 'future'
              ? 'border-dashed border-ink-500 bg-ink-50'
              : lit
                ? 'border-ink-950 bg-ink-950 shadow-[0_0_0_5px_rgb(245_245_245/0.08)]'
                : 'border-ink-400 bg-ink-50',
          )}
        />
        {m.kind === 'now' && lit && <span className="absolute top-[1.15rem] size-3 animate-ping rounded-full bg-ink-900/40" />}
      </span>
      <motion.div
        className={cn(
          'spotlight group relative overflow-hidden rounded-[10px] border p-5 transition-colors duration-500',
          m.kind === 'future' ? 'border-dashed border-white/[0.12]' : 'border-white/[0.08] bg-ink-75 hover:border-white/[0.16]',
        )}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
          e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
        }}
        // No horizontal offset here: un-revealed cards must not push past the viewport edge on phones
        initial={reduce ? false : { opacity: 0, y: 16, clipPath: 'inset(0% 100% 0% 0%)' }}
        animate={shown || reduce ? { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' } : undefined}
        transition={{ duration: 1, ease: ease.outExpo, delay: 0.05 * index }}
      >
        <div className="relative z-[2]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow mb-2 sm:hidden">{m.year}</p>
              <p className="text-lg font-medium tracking-[-0.025em] text-ink-900">{m.title}</p>
              <p className="mt-1 text-sm text-ink-500">{m.meta}</p>
            </div>
            {m.kind === 'certificate' && (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-[4px] border border-ink-200 px-2 py-1 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink-600">
                <Award size={12} strokeWidth={1.5} aria-hidden="true" />
                {t.education.certificate}
              </span>
            )}
          </div>
          {m.hours && (
            <div className="mt-4 h-px w-full bg-white/[0.07]" aria-hidden="true">
              <motion.div
                className="h-px origin-left bg-ink-700"
                style={{ width: `${(m.hours / 80) * 100}%` }}
                initial={reduce ? false : { scaleX: 0 }}
                animate={shown || reduce ? { scaleX: 1 } : undefined}
                transition={{ duration: 1.4, ease: ease.outExpo, delay: 0.3 }}
              />
            </div>
          )}
        </div>
      </motion.div>
    </li>
  )
}

/** Proportional bar of certified hours per course. */
function HoursBar() {
  return (
    <div className="mt-6">
      <div className="flex h-1.5 gap-1 overflow-hidden" aria-hidden="true">
        {profile.certifications.map((c, i) => (
          <motion.span
            key={c.id}
            className={cn('h-full rounded-full', ['bg-ink-950', 'bg-ink-600', 'bg-ink-400'][i])}
            style={{ flexGrow: c.hours }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: ease.outExpo, delay: 0.2 + i * 0.12 }}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
        {profile.certifications.map((c, i) => (
          <li key={c.id} className="eyebrow flex items-center gap-2 text-[0.625rem]">
            <span className={cn('size-1.5 rounded-full', ['bg-ink-950', 'bg-ink-600', 'bg-ink-400'][i])} aria-hidden="true" />
            {c.name} · {c.hours}h
          </li>
        ))}
      </ul>
    </div>
  )
}
