import { motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { Award, BookOpen, BrainCircuit, ChartNoAxesColumn, CodeXml, GraduationCap, Languages, Layers, Rocket, Timer, Users } from 'lucide-react'
import { useRef } from 'react'
import { ease } from '@/animations/easing'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { useI18n } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/cn'

const itemIcons = [CodeXml, ChartNoAxesColumn, Layers, BrainCircuit, BookOpen, Languages, Rocket, Users]
const factIcons = [Languages, Timer, Award, GraduationCap]

export function Differentials() {
  const { t } = useI18n()
  const d = t.differentials
  const isDesktop = useIsDesktop()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  return (
    <section ref={ref} id="differentials" aria-labelledby="differentials-title" className="relative overflow-hidden py-28 lg:py-40">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px hairline" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-[20%] top-1/4 size-[60vw] rounded-full bg-[radial-gradient(closest-side,rgb(200_212_228/0.06),transparent)]" />
      <div className="container-x">
        <SectionHeading id="differentials" index="06" label={d.label} dim={d.titleDim} bright={d.titleBright} />

        <div className="mt-16 grid gap-16 lg:mt-24 lg:grid-cols-12 lg:gap-10">
          <ol className="border-t border-white/[0.08] lg:col-span-7">
            {d.items.map((item, i) => (
              <Row key={item.title} index={i} title={item.title} desc={item.desc} />
            ))}
          </ol>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              {isDesktop && !reduce ? <FactStack progress={scrollYProgress} /> : <FactGrid />}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Row({ index, title, desc }: { index: number; title: string; desc: string }) {
  const ref = useRef<HTMLLIElement>(null)
  // Lights up while it crosses the reading band in the middle of the viewport
  const focused = useInView(ref, { margin: '-38% 0px -38% 0px' })
  const reduce = useReducedMotion()
  const Icon = itemIcons[index]
  const on = focused || reduce

  return (
    <motion.li
      ref={ref}
      className="group relative border-b border-white/[0.08]"
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.8, ease: ease.outExpo }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-white/[0.045] to-transparent transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-x-100"
      />
      <div className="relative grid grid-cols-[2.5rem_1fr_auto] items-start gap-x-4 gap-y-2 py-6 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center sm:py-7">
        <span className={cn('font-mono text-xs tabular-nums transition-colors duration-500', on ? 'text-ink-900' : 'text-ink-500')}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <p
          className={cn(
            'text-[clamp(1.2rem,1.9vw,1.6rem)] font-medium leading-tight tracking-[-0.035em] transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2',
            on ? 'text-ink-950' : 'text-ink-500',
          )}
        >
          {title}
        </p>
        <p className={cn('col-start-2 text-sm leading-relaxed transition-colors duration-500 sm:col-start-3', on ? 'text-ink-600' : 'text-ink-500')}>
          {desc}
        </p>
        <span
          className={cn(
            'col-start-3 row-start-1 flex size-10 items-center justify-center rounded-[6px] border transition-all duration-500 group-hover:rotate-[-10deg] sm:col-start-4',
            on ? 'border-ink-500 text-ink-950' : 'border-ink-200 text-ink-500',
          )}
          aria-hidden="true"
        >
          <Icon size={17} strokeWidth={1.5} />
        </span>
      </div>
    </motion.li>
  )
}

/**
 * Isometric board of fact cards (reference 05). Each card floats at its own height
 * and lifts at a different rate while the section scrolls.
 */
function FactStack({ progress }: { progress: MotionValue<number> }) {
  const { t } = useI18n()
  const facts = t.differentials.facts
  const lifts = [
    useTransform(progress, [0.1, 0.7], [10, 70]),
    useTransform(progress, [0.1, 0.7], [30, 40]),
    useTransform(progress, [0.1, 0.7], [20, 95]),
    useTransform(progress, [0.1, 0.7], [45, 60]),
  ]
  const positions = [
    { x: 0, y: 0 },
    { x: 236, y: 0 },
    { x: 0, y: 166 },
    { x: 236, y: 166 },
  ]

  return (
    <div className="relative flex h-[520px] origin-center scale-[0.86] items-center justify-center [perspective:2000px] xl:scale-95">
      <div className="relative h-[316px] w-[456px] [transform-style:preserve-3d] [transform:rotateX(52deg)_rotateZ(-36deg)]">
        {/* Base plate */}
        <div className="dot-grid absolute -inset-8 rounded-[22px] border border-white/[0.06] bg-ink-75/60" />
        {facts.map((f, i) => {
          const Icon = factIcons[i]
          return (
            <motion.div
              key={f.label}
              className="absolute h-[150px] w-[220px] [transform-style:preserve-3d]"
              style={{ left: positions[i].x, top: positions[i].y, z: lifts[i] }}
            >
              {/* Shadow on the plate */}
              <div className="absolute inset-2 rounded-[14px] bg-black/70 blur-xl [transform:translateZ(-40px)]" aria-hidden="true" />
              <div className="surface relative flex h-full w-full flex-col justify-between rounded-[14px] p-5">
                <div className="flex items-center justify-between">
                  <span className="flex size-8 items-center justify-center rounded-[7px] border border-white/10 bg-ink-200/60 text-ink-900">
                    <Icon size={15} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <span className="font-mono text-[0.625rem] text-ink-500">0{i + 1}</span>
                </div>
                <div>
                  <p className="text-metal text-[2.6rem] font-medium leading-none tracking-[-0.06em]">{f.value}</p>
                  <p className="mt-1.5 text-xs text-ink-500">{f.label}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function FactGrid() {
  const { t } = useI18n()
  return (
    <ul className="grid grid-cols-2 gap-3">
      {t.differentials.facts.map((f, i) => {
        const Icon = factIcons[i]
        return (
          <motion.li
            key={f.label}
            className="surface flex h-full flex-col justify-between gap-8 rounded-[10px] p-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: ease.outExpo, delay: i * 0.06 }}
          >
              <Icon size={16} strokeWidth={1.5} className="text-ink-600" aria-hidden="true" />
              <div>
                <p className="text-metal text-[2.5rem] font-medium leading-none tracking-[-0.06em]">{f.value}</p>
                <p className="mt-2 text-xs text-ink-500">{f.label}</p>
              </div>
          </motion.li>
        )
      })}
    </ul>
  )
}
