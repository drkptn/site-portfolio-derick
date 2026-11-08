import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ChartNoAxesColumn, CodeXml, Cpu, PenTool, Sparkles, Terminal, ArrowUpRight } from 'lucide-react'
import { useRef } from 'react'
import { ease } from '@/animations/easing'
import { BlackHole } from '@/components/blackhole/BlackHole'
import { CircleLoader } from '@/components/ui/CircleLoader'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TiltCard } from '@/components/ui/TiltCard'
import { profile } from '@/data/profile'
import { useI18n } from '@/i18n/LanguageProvider'

const focusIcons = [Cpu, Terminal, CodeXml, ChartNoAxesColumn, PenTool, Sparkles]

export function About() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const ghostX = useTransform(scrollYProgress, [0, 1], ['6%', '-18%'])

  return (
    <section ref={ref} id="about" aria-labelledby="about-title" className="relative overflow-hidden py-28 lg:py-40">
      {/* Ghost word drifting behind the copy (reference 02) */}
      <motion.p
        aria-hidden="true"
        className="text-outline pointer-events-none absolute left-0 top-[38%] -z-10 select-none whitespace-nowrap text-[26vw] font-semibold leading-none tracking-[-0.06em] opacity-60"
        style={reduce ? undefined : { x: ghostX }}
      >
        Derick.
      </motion.p>

      <div className="container-x">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <SectionHeading id="about" index="02" label={t.about.label} dim={t.about.titleDim} bright={t.about.titleBright} />
          </div>
          <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.2} y={50}>
            <ProfileCard />
          </Reveal>
        </div>

        <div className="mt-20 grid gap-10 lg:mt-28 lg:grid-cols-12">
          <Reveal className="lg:col-span-3" y={20}>
            <div className="flex items-center gap-3 lg:flex-col lg:items-start">
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-ink-500">Bio</span>
              <span className="h-px w-16 bg-ink-300 lg:h-24 lg:w-px" aria-hidden="true" />
            </div>
          </Reveal>
          <div className="lg:col-span-9">
            <Reveal y={30}>
              <p className="max-w-[32ch] text-[clamp(1.4rem,2.4vw,2.15rem)] font-medium leading-[1.2] tracking-[-0.03em] text-ink-900 text-pretty">
                {t.about.lead}
              </p>
            </Reveal>
            <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
              {t.about.paragraphs.map((p, i) => (
                <Reveal key={i} delay={0.08 * i} y={24}>
                  <span className="mb-4 block font-mono text-[0.6875rem] text-ink-400" aria-hidden="true">
                    0{i + 1}
                  </span>
                  <p className="text-[0.9375rem] leading-relaxed text-ink-600 text-pretty">{p}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* Focus areas — Swiss table */}
        <div className="mt-24 lg:mt-32">
          <Reveal className="mb-6 flex items-center justify-between" y={12}>
            <h3 className="eyebrow text-ink-600">{t.about.focusLabel}</h3>
            <span className="eyebrow">06</span>
          </Reveal>
          <ul className="grid border-l border-t border-white/[0.08] sm:grid-cols-2 lg:grid-cols-3">
            {t.about.focus.map((item, i) => {
              const Icon = focusIcons[i]
              return (
                <motion.li
                  key={item.title}
                  className="group relative overflow-hidden border-b border-r border-white/[0.08]"
                  initial={reduce ? false : { opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                  transition={{ duration: 0.9, ease: ease.outExpo, delay: (i % 3) * 0.08 }}
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 origin-bottom scale-y-0 bg-gradient-to-t from-white/[0.05] to-white/[0.015] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-y-100"
                  />
                  <div className="relative flex min-h-48 flex-col justify-between gap-10 p-6 lg:min-h-56 lg:p-8">
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-[0.6875rem] text-ink-500">0{i + 1}</span>
                      <span className="flex size-10 items-center justify-center rounded-[6px] border border-ink-200 bg-ink-100/60 text-ink-700 transition-all duration-500 group-hover:rotate-[-8deg] group-hover:border-ink-400 group-hover:text-ink-950">
                        <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                      </span>
                    </div>
                    <div>
                      <p className="flex items-center gap-2 text-[1.375rem] font-medium tracking-[-0.03em] text-ink-900">
                        {item.title}
                        <ArrowUpRight
                          size={16}
                          strokeWidth={1.5}
                          aria-hidden="true"
                          className="-translate-x-2 text-ink-500 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100"
                        />
                      </p>
                      <p className="mt-2 text-sm text-ink-500">{item.desc}</p>
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}

function ProfileCard() {
  const { t, lang } = useI18n()
  const c = t.about.card
  const rows: [string, string][] = [
    [c.fields.name, profile.name],
    [c.fields.course, `${lang === 'pt' ? 'Ciência da Computação' : 'Computer Science'} · ${profile.education.institution}`],
    [c.fields.location, `${profile.location.city} — ${profile.location.region}, ${profile.location.country[lang]}`],
    [c.fields.languages, c.languages],
  ]

  return (
    <TiltCard className="surface rounded-[10px]" max={7}>
      <div className="relative z-[2] overflow-hidden rounded-[10px]">
        <div className="diagonal-hatch flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div className="flex items-center gap-3">
            <BlackHole size={28} />
            <span className="eyebrow text-ink-600">{c.title}</span>
          </div>
          <span className="eyebrow text-ink-500">No. DP-{new Date().getFullYear()}</span>
        </div>

        <div className="flex items-center gap-5 px-5 py-6">
          <div className="relative flex size-20 shrink-0 items-center justify-center text-ink-900">
            <CircleLoader size={80} stroke={1} className="absolute inset-0 text-ink-700" />
            <span className="text-2xl font-medium tracking-[-0.04em]">0{profile.education.semester}</span>
          </div>
          <div>
            <p className="text-lg font-medium leading-tight tracking-[-0.02em] text-ink-900">{c.role}</p>
            <p className="mt-1 text-sm text-ink-500">{c.semester}</p>
          </div>
        </div>

        <dl className="border-t border-white/[0.07] px-5">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4 border-b border-white/[0.05] py-3 last:border-0">
              <dt className="eyebrow shrink-0">{k}</dt>
              <dd className="text-right text-[0.8125rem] text-ink-700">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="flex items-center justify-between gap-4 border-t border-white/[0.07] bg-ink-100/40 px-5 py-4">
          <span className="flex items-center gap-2.5 text-[0.8125rem] text-ink-800">
            <span className="size-2 animate-pulse-dot rounded-full bg-ink-900" aria-hidden="true" />
            {c.status}
          </span>
          <Barcode />
        </div>
      </div>
    </TiltCard>
  )
}

function Barcode() {
  const bars = [2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3]
  return (
    <span className="flex h-6 items-stretch gap-[2px] opacity-70" aria-hidden="true">
      {bars.map((w, i) => (
        <span key={i} className="bg-ink-600" style={{ width: w }} />
      ))}
    </span>
  )
}
