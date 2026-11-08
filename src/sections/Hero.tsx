import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowDown, ArrowUpRight, Clock4, Download } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState, type MouseEvent } from 'react'
import { ease } from '@/animations/easing'
import { SceneFallback } from '@/components/three/SceneFallback'
import { loadHeroScene } from '@/components/three/loadHeroScene'
import { Button } from '@/components/ui/Button'
import { RevealText } from '@/components/ui/RevealText'
import { profile } from '@/data/profile'
import { useFinePointer, useIsDesktop } from '@/hooks/useMediaQuery'
import { useLocalTime } from '@/hooks/useLocalTime'
import { useI18n } from '@/i18n/LanguageProvider'
import { hasWebGL } from '@/lib/webgl'
import { useAppState } from '@/providers/AppStateProvider'
import { useSmoothScroll } from '@/providers/SmoothScrollProvider'
import { useTheme } from '@/providers/ThemeProvider'

const HeroScene = lazy(loadHeroScene)

export function Hero() {
  const { t } = useI18n()
  const { introDone } = useAppState()
  const { scrollTo } = useSmoothScroll()
  const reduce = useReducedMotion() ?? false
  const isDesktop = useIsDesktop()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref)
  const webgl = hasWebGL()
  const light = useTheme().theme === 'light'

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  // Scroll-out choreography inspired by the motion reference: the name disperses
  // (tracking opens up + blur) while the camera dives into the core.
  const tracking = useTransform(scrollYProgress, [0, 0.7], ['-0.055em', '0.08em'])
  const nameBlur = useTransform(scrollYProgress, [0, 0.6], ['blur(0px)', 'blur(16px)'])
  const nameOpacity = useTransform(scrollYProgress, [0.05, 0.6], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -140])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])
  const sceneOpacity = useTransform(scrollYProgress, [0.45, 0.95], [1, 0])

  const go = (e: MouseEvent<HTMLElement>, id: string) => {
    e.preventDefault()
    scrollTo(`#${id}`)
  }

  const letters = (word: string, offset: number) =>
    word.split('').map((ch, i) => (
      <span key={i} className="inline-block overflow-hidden pb-[0.04em] align-top">
        <motion.span
          className="text-metal inline-block"
          initial={reduce ? false : { y: '105%' }}
          animate={introDone || reduce ? { y: '0%' } : undefined}
          transition={{ duration: 1.3, ease: ease.outExpo, delay: 0.15 + (offset + i) * 0.05 }}
        >
          {ch}
        </motion.span>
      </span>
    ))

  return (
    <section
      ref={ref}
      id="home"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden"
    >
      <HeroBackdrop show={introDone} />

      {/* 3D scene */}
      <motion.div
        className="absolute inset-x-0 top-0 -z-10 h-[100svh] [mask-image:linear-gradient(to_bottom,black_58%,transparent_90%)] lg:inset-0 lg:h-auto lg:[mask-image:linear-gradient(to_bottom,black_72%,transparent)]"
        style={reduce ? undefined : { opacity: sceneOpacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: introDone ? 1 : 0 }}
        transition={{ duration: 1.6, ease: ease.outExpo }}
        role="img"
        aria-label={t.hero.sceneLabel}
      >
        {webgl ? (
          <Suspense fallback={null}>
            <HeroScene progress={scrollYProgress} active={inView} intro={introDone} compact={!isDesktop} reduced={reduce} light={light} />
          </Suspense>
        ) : (
          <SceneFallback />
        )}
      </motion.div>

      <div className="container-x relative flex min-h-[100svh] flex-1 flex-col pb-6 pt-[calc(var(--nav-h)+1.25rem)] lg:pb-8">
        {/* Top meta */}
        <motion.div
          className="flex items-start justify-between gap-6"
          initial={{ opacity: 0, y: 12 }}
          animate={introDone ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1, ease: ease.outExpo, delay: 0.7 }}
          style={reduce ? undefined : { opacity: contentOpacity }}
        >
          <p className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-ink-100/50 py-1.5 pl-2 pr-3.5 text-[0.75rem] text-ink-700 backdrop-blur-md">
            <span className="relative flex size-2 items-center justify-center">
              <span className="size-2 animate-pulse-dot rounded-full bg-ink-900" />
            </span>
            {t.hero.available}
          </p>
          <div className="hidden text-right md:block">
            <p className="eyebrow">{t.preloader.portfolio} — {new Date().getFullYear()}</p>
            <p className="eyebrow mt-2 text-ink-400">{profile.location.coords}</p>
          </div>
        </motion.div>

        {/* Name — split around the 3D core */}
        <motion.h1
          id="hero-title"
          className="mb-14 mt-[6svh] flex flex-col text-[clamp(4.2rem,21vw,9rem)] font-medium uppercase leading-[0.82] lg:my-auto lg:flex-row lg:items-center lg:justify-between lg:text-[clamp(6rem,11.6vw,14.5rem)]"
          style={reduce ? { letterSpacing: '-0.055em' } : { letterSpacing: tracking, filter: nameBlur, opacity: nameOpacity }}
        >
          <span className="sr-only">{profile.name}</span>
          <span aria-hidden="true" className="block whitespace-nowrap">
            {letters(profile.firstName.toUpperCase(), 0)}
          </span>
          {/* Mobile: the core sits between the two lines (vertical take on the desktop split) */}
          <span aria-hidden="true" className="block h-[30svh] lg:hidden" />
          <span aria-hidden="true" className="block self-end whitespace-nowrap lg:self-auto">
            {letters(profile.lastName.toUpperCase(), 6)}
          </span>
        </motion.h1>

        {/* Statement + actions */}
        <motion.div
          className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10"
          // On small screens the hero is taller than the viewport: never fade out content the user is scrolling to
          style={reduce || !isDesktop ? undefined : { y: contentY, opacity: contentOpacity }}
        >
          <div className="lg:col-span-7">
            <motion.ul
              className="mb-5 flex flex-wrap gap-x-3 gap-y-1.5"
              initial={{ opacity: 0 }}
              animate={introDone ? { opacity: 1 } : undefined}
              transition={{ duration: 1, delay: 0.9 }}
            >
              {t.hero.roles.map((role, i) => (
                <li key={role} className="eyebrow flex items-center gap-3 text-ink-600">
                  {i > 0 && <span className="hidden text-ink-400 sm:inline" aria-hidden="true">·</span>}
                  {role}
                </li>
              ))}
            </motion.ul>
            <RevealText
              as="p"
              when={introDone}
              delay={0.85}
              stagger={0.035}
              className="max-w-[24ch] text-[clamp(1.65rem,3vw,2.9rem)] font-medium leading-[1.04] tracking-[-0.04em] text-balance"
              parts={[
                { text: t.hero.titleDim, className: 'text-dim' },
                { text: t.hero.titleBright, className: 'text-ink-900' },
              ]}
            />
          </div>

          <motion.div
            className="flex flex-col gap-6 lg:col-span-5 lg:col-start-8 xl:col-span-4 xl:col-start-9"
            initial={{ opacity: 0, y: 24 }}
            animate={introDone ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1.1, ease: ease.outExpo, delay: 1.15 }}
          >
            <p className="max-w-[46ch] text-[0.9375rem] leading-relaxed text-ink-600">{t.hero.description}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button href="#projects" onClick={(e) => go(e, 'projects')} cursor="explore" icon={ArrowDown}>
                {t.hero.explore}
              </Button>
              <Button href="#contact" onClick={(e) => go(e, 'contact')} variant="secondary" icon={ArrowUpRight}>
                {t.hero.contact}
              </Button>
              <Button href={profile.cv} download="Derick-Putini-CV.pdf" variant="ghost" icon={Download} cursor="download">
                {t.hero.cv}
              </Button>
            </div>
          </motion.div>
        </motion.div>

        <HeroFooter show={introDone} onScroll={(e) => go(e, 'about')} />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------------- */

function HeroFooter({ show, onScroll }: { show: boolean; onScroll: (e: MouseEvent<HTMLElement>) => void }) {
  const { t } = useI18n()
  const time = useLocalTime(profile.location.timeZone)
  return (
    <motion.div
      className="mt-10 flex items-end justify-between gap-6 border-t border-white/[0.07] pt-5"
      initial={{ opacity: 0 }}
      animate={show ? { opacity: 1 } : undefined}
      transition={{ duration: 1, delay: 1.4 }}
    >
      <a href="#about" onClick={onScroll} className="group flex items-center gap-3" aria-label={`${t.hero.scroll} — ${t.nav.about}`}>
        <span className="relative block h-9 w-px overflow-hidden bg-white/10" aria-hidden="true">
          <span className="absolute inset-0 animate-scroll-cue bg-ink-900" />
        </span>
        <span className="eyebrow text-ink-600 transition-colors group-hover:text-ink-900">{t.hero.scroll}</span>
      </a>
      <p className="eyebrow hidden items-center gap-2 sm:flex">
        <Clock4 size={12} strokeWidth={1.5} aria-hidden="true" />
        <span>
          {t.hero.based} {profile.location.city} — <time className="tabular-nums text-ink-700">{time}</time> GMT-3
        </span>
      </p>
      <p className="eyebrow">
        <span className="text-ink-900">01</span> / 08
      </p>
    </motion.div>
  )
}

/** Swiss column grid with light drops falling along the lines (motion reference). */
function HeroBackdrop({ show }: { show: boolean }) {
  const fine = useFinePointer()
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20">
      <div className="absolute left-1/2 top-[46%] h-[85vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(200_212_228/0.10),rgb(255_255_255/0.03)_45%,transparent)]" />
      <div className="container-x absolute inset-0 grid grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`relative border-l border-white/[0.045] ${i >= 4 ? 'hidden lg:block' : ''} ${i === 5 ? 'border-r' : ''}`}>
            {show && i % 2 === 1 && (
              <span
                className="absolute -left-px top-0 block h-40 w-px animate-line-drop bg-gradient-to-b from-transparent via-ink-700/70 to-transparent"
                style={{ animationDelay: `${i * 1.3}s`, animationDuration: `${6 + i}s` }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink-50 to-transparent" />
      {fine && <PointerHud />}
    </div>
  )
}

/** Tiny live pointer read-out — a technical detail, desktop only. */
function PointerHud() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    let raf = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() =>
        setPos({ x: (e.clientX / window.innerWidth) * 2 - 1, y: -((e.clientY / window.innerHeight) * 2 - 1) }),
      )
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])
  return (
    <div className="eyebrow absolute right-[var(--gutter)] top-1/2 hidden -translate-y-1/2 flex-col items-end gap-1.5 text-[0.625rem] text-ink-500 xl:flex">
      <span>fig. 01 — core / icosa·80</span>
      <span className="tabular-nums">
        x {pos.x.toFixed(2)} · y {pos.y.toFixed(2)}
      </span>
    </div>
  )
}
