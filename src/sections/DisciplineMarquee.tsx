import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'
import { useRef } from 'react'
import { Spark } from '@/components/icons'
import { useI18n } from '@/i18n/LanguageProvider'
import { wrap } from '@/lib/math'

/**
 * Infinite band of disciplines between the hero and About.
 * Its speed and direction react to scroll velocity.
 */
export function DisciplineMarquee() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const factor = useTransform(velocity, [0, 1200], [0, 4], { clamp: false })
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`)
  const direction = useRef(-1)

  useAnimationFrame((_, delta) => {
    if (reduce) return
    const f = factor.get()
    if (f < 0) direction.current = 1
    else if (f > 0) direction.current = -1
    const move = direction.current * 1.6 * (delta / 1000)
    baseX.set(baseX.get() + move + move * Math.abs(f))
  })

  const items = [...t.marquee, ...t.marquee]

  return (
    <div className="relative overflow-hidden border-y border-white/[0.06] bg-ink-50 py-6 lg:py-8" aria-label={t.marquee.join(', ')} role="marquee">
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink-50 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink-50 to-transparent" />
      <motion.div className="flex w-max items-center whitespace-nowrap will-change-transform" style={{ x }} aria-hidden="true">
        {items.map((item, i) => (
          <span key={i} className="flex items-center">
            <span
              className={
                i % 2 === 0
                  ? 'text-[clamp(2rem,5.2vw,4.75rem)] font-medium tracking-[-0.045em] text-ink-900'
                  : 'text-outline text-[clamp(2rem,5.2vw,4.75rem)] font-medium tracking-[-0.045em]'
              }
            >
              {item}
            </span>
            <Spark size={22} className="mx-8 text-ink-500 lg:mx-12" />
          </span>
        ))}
      </motion.div>
    </div>
  )
}
