import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { ease } from '@/animations/easing'
import { CircleLoader } from '@/components/ui/CircleLoader'
import { heroSceneReady, loadHeroScene } from '@/components/three/loadHeroScene'
import { profile } from '@/data/profile'
import { useI18n } from '@/i18n/LanguageProvider'
import { hasWebGL } from '@/lib/webgl'
import { useAppState } from '@/providers/AppStateProvider'
import { useSmoothScroll } from '@/providers/SmoothScrollProvider'

const VISITED_KEY = 'dp-visited'
const MAX_WAIT = 6000

function windowLoaded() {
  return document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }))
}

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

function hasVisited() {
  try {
    return sessionStorage.getItem(VISITED_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Opening screen. Progress reflects real work: web fonts, the 3D scene chunk and the
 * window load event. It never waits longer than MAX_WAIT, and repeat visits are shorter.
 */
export function Preloader() {
  const { t } = useI18n()
  const { setIntroDone } = useAppState()
  const { lock, unlock, scrollTo } = useSmoothScroll()
  const reduce = useReducedMotion()
  const [visible, setVisible] = useState(true)
  const [target, setTarget] = useState(0)
  const display = useMotionValue(0)
  const counter = useTransform(display, (v) => String(Math.round(v)).padStart(3, '0'))
  const barScale = useTransform(display, (v) => v / 100)
  const startedAt = useRef(performance.now())
  const repeat = useRef(hasVisited())

  // Lock scroll and track real loading tasks
  useEffect(() => {
    lock()
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    let cancelled = false
    // Integer weights (sum = 100): float weights like 0.7 + 0.3 = 0.9999999999999999 would never reach 1
    let done = 0
    const tasks: Array<[number, Promise<unknown>]> = [
      [30, document.fonts?.ready ?? Promise.resolve()],
      // The 3D scene (chunk download + environment + shader compilation) counts toward progress,
      // but slow devices don't hold the site hostage: after 3s the page opens anyway and the
      // scene fades in on its own when it is ready.
      [50, hasWebGL() ? Promise.race([loadHeroScene().then(heroSceneReady), wait(3000)]) : Promise.resolve()],
      [20, windowLoaded()],
    ]
    tasks.forEach(([weight, task]) => {
      task
        .catch(() => undefined)
        .finally(() => {
          if (cancelled) return
          done += weight
          setTarget(Math.min(100, done) / 100)
        })
    })
    const safety = window.setTimeout(() => !cancelled && setTarget(1), MAX_WAIT)
    return () => {
      cancelled = true
      window.clearTimeout(safety)
    }
  }, [lock])

  // Animate the counter toward the real progress, then exit
  useEffect(() => {
    const controls = animate(display, target * 100, {
      duration: reduce ? 0.1 : repeat.current ? 0.35 : 0.7,
      ease: ease.outQuart,
    })
    if (target < 1) return () => controls.stop()

    const minDuration = reduce ? 200 : repeat.current ? 450 : 1000
    const wait = Math.max(0, minDuration - (performance.now() - startedAt.current))
    const exitAt = wait + (reduce ? 0 : 300)
    const id = window.setTimeout(() => setVisible(false), exitAt)
    // The hero intro starts while the curtain is still lifting — overlapping feels cinematic
    const introId = window.setTimeout(() => setIntroDone(true), exitAt + (reduce ? 0 : 280))
    return () => {
      controls.stop()
      window.clearTimeout(id)
      window.clearTimeout(introId)
    }
  }, [target, display, reduce, setIntroDone])

  const finish = () => {
    try {
      sessionStorage.setItem(VISITED_KEY, '1')
    } catch {
      /* ignore */
    }
    unlock()
    const hash = window.location.hash
    if (hash.length > 1) requestAnimationFrame(() => scrollTo(hash, { immediate: true }))
  }

  const letters = profile.name.toUpperCase().split('')

  return (
    <AnimatePresence onExitComplete={finish}>
      {visible && (
        <motion.div
          key="preloader"
          role="status"
          aria-live="polite"
          aria-label={t.preloader.loading}
          className="fixed inset-0 z-[150] flex items-center justify-center overflow-hidden bg-ink-0 text-ink-900"
          initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={
            reduce
              ? { opacity: 0, transition: { duration: 0.3 } }
              : { clipPath: 'inset(0% 0% 100% 0%)', transition: { duration: 1, ease: ease.inOutQuart } }
          }
        >
          {/* Grid + vignette */}
          <div aria-hidden="true" className="absolute inset-0 opacity-60">
            <div className="absolute inset-y-0 left-1/4 w-px bg-white/[0.04]" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-white/[0.06]" />
            <div className="absolute inset-y-0 left-3/4 w-px bg-white/[0.04]" />
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/[0.04]" />
            <div className="absolute left-1/2 top-1/2 size-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.07),transparent_65%)]" />
          </div>

          {/* Corner marks */}
          <Corner className="left-[var(--gutter)] top-6" label={`DP — ${t.preloader.portfolio}`} />
          <Corner className="right-[var(--gutter)] top-6 text-right" label={`© ${new Date().getFullYear()}`} />
          <Corner className="bottom-6 left-[var(--gutter)]" label={t.preloader.loading} />
          <Corner className="bottom-6 right-[var(--gutter)] text-right" label={`${profile.location.city}, BR`} />

          <motion.div
            className="relative flex w-full max-w-[min(92vw,62rem)] flex-col items-center px-[var(--gutter)]"
            exit={reduce ? undefined : { y: -80, opacity: 0, filter: 'blur(8px)', transition: { duration: 0.8, ease: ease.inOutQuart } }}
          >
            <p
              aria-hidden="true"
              className="flex overflow-hidden whitespace-nowrap text-[clamp(2.1rem,8.4vw,7.5rem)] font-medium leading-[0.95] tracking-[-0.05em]"
            >
              {letters.map((ch, i) => (
                <motion.span
                  key={i}
                  className="text-metal inline-block"
                  initial={reduce ? false : { y: '110%', rotate: 6 }}
                  animate={{ y: '0%', rotate: 0 }}
                  transition={{ duration: repeat.current ? 0.6 : 1, ease: ease.outExpo, delay: 0.1 + i * (repeat.current ? 0.02 : 0.04) }}
                >
                  {ch === ' ' ? ' ' : ch}
                </motion.span>
              ))}
            </p>

            <div className="mt-10 flex w-full max-w-md items-center gap-4">
              <CircleLoader size={18} className="shrink-0 text-ink-600" />
              <div className="relative h-px flex-1 overflow-hidden bg-white/10">
                <motion.div className="absolute inset-0 origin-left bg-ink-900" style={{ scaleX: barScale }} />
              </div>
              <span className="w-14 text-right font-mono text-xs tabular-nums text-ink-600">
                <motion.span>{counter}</motion.span>%
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Corner({ className, label }: { className: string; label: string }) {
  return (
    <motion.div
      aria-hidden="true"
      className={`eyebrow absolute flex items-center gap-2 text-ink-500 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <span className="text-ink-400">+</span>
      {label}
    </motion.div>
  )
}
