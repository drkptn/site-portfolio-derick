import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { useCallback, useRef, useState, type MouseEvent } from 'react'
import { ease } from '@/animations/easing'
import { BlackHole } from '@/components/blackhole/BlackHole'
import { Button } from '@/components/ui/Button'
import { navParent, navSections, sections, type SectionId } from '@/data/sections'
import { profile } from '@/data/profile'
import { useActiveSection } from '@/hooks/useActiveSection'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useI18n } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/cn'
import { useAppState } from '@/providers/AppStateProvider'
import { useSmoothScroll } from '@/providers/SmoothScrollProvider'
import { LanguageSwitch } from './LanguageSwitch'
import { ThemeToggle } from './ThemeToggle'

const ALL_IDS = sections.map((s) => s.id)

export function Navbar() {
  const { t } = useI18n()
  const { introDone } = useAppState()
  const { scrollTo, lock, unlock } = useSmoothScroll()
  const reduce = useReducedMotion()
  const active = navParent[useActiveSection(ALL_IDS) as SectionId]
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 24)
    // Hide while reading downwards, reveal on any upward intent
    setHidden(y > window.innerHeight * 0.9 && y > prev + 2)
  })

  const toggle = useCallback(
    (next: boolean) => {
      setOpen(next)
      if (next) lock()
      else unlock()
    },
    [lock, unlock],
  )
  const close = useCallback(() => toggle(false), [toggle])

  useFocusTrap(headerRef, open, close)

  const go = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    if (open) {
      toggle(false)
      window.setTimeout(() => scrollTo(`#${id}`), reduce ? 0 : 450)
    } else {
      scrollTo(`#${id}`)
    }
  }

  return (
    <header ref={headerRef} id="site-header" className="fixed inset-x-0 top-0 z-[80]">
      <motion.div
        className="relative"
        initial={{ y: -24, opacity: 0 }}
        animate={{
          y: introDone ? (hidden && !open ? '-110%' : 0) : -24,
          opacity: introDone ? 1 : 0,
        }}
        transition={{ duration: hidden ? 0.5 : 0.8, ease: ease.outExpo, delay: introDone && !scrolled ? 0.5 : 0 }}
      >
      <div
        className={cn(
          'absolute inset-0 -z-10 border-b transition-[background-color,border-color,backdrop-filter] duration-500',
          scrolled && !open
            ? 'border-white/[0.06] bg-ink-50/70 backdrop-blur-xl'
            : 'border-transparent bg-transparent',
        )}
        aria-hidden="true"
      />
      <nav aria-label={t.nav.primary} className="container-x flex h-[var(--nav-h)] items-center justify-between gap-6">
        <a
          href="#home"
          onClick={(e) => go(e, 'home')}
          className="group relative z-[2] flex items-center gap-3"
          aria-label={`${profile.name} — ${t.nav.home}`}
        >
          <BlackHole size={34} className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-110" />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-[0.8125rem] font-medium tracking-[-0.01em] text-ink-900">{profile.name}</span>
            <span className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-500">
              CS · Front-End · Data
            </span>
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center rounded-[8px] border border-white/[0.07] bg-ink-100/40 p-1 backdrop-blur-md lg:flex">
          {navSections.map((s) => {
            const isActive = active === s.id
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => go(e, s.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'relative flex h-8 items-center gap-1.5 rounded-[6px] px-3.5 text-[0.8125rem] tracking-[-0.005em] transition-colors duration-300',
                    isActive ? 'text-ink-950' : 'text-ink-500 hover:text-ink-900',
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-[6px] bg-ink-200/90 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="font-mono text-[0.625rem] text-ink-400">{s.index}</span>
                  {t.nav[s.navKey!]}
                </a>
              </li>
            )
          })}
        </ul>

        <div className="relative z-[2] flex items-center gap-2.5">
          <ThemeToggle />
          <LanguageSwitch id="nav-lang" className="hidden xs:flex" />
          <div className="hidden md:block">
            <Button
              href="#contact"
              onClick={(e) => go(e as MouseEvent<HTMLAnchorElement>, 'contact')}
              variant="primary"
              className="h-9 px-4 text-[0.75rem] !shadow-[0_8px_30px_-14px_rgb(255_255_255/0.45)]"
            >
              {t.nav.cta}
            </Button>
          </div>
          <button
            type="button"
            onClick={() => toggle(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            className="relative flex size-10 items-center justify-center rounded-[6px] border border-ink-200 bg-ink-100/60 lg:hidden"
          >
            <span className="relative block h-3 w-4" aria-hidden="true">
              <motion.span
                className="absolute left-0 top-0 block h-px w-full bg-ink-900"
                animate={open ? { top: '50%', rotate: 45 } : { top: '0%', rotate: 0 }}
                transition={{ duration: 0.45, ease: ease.outExpo }}
              />
              <motion.span
                className="absolute bottom-0 left-0 block h-px w-full bg-ink-900"
                animate={open ? { bottom: '50%', rotate: -45, width: '100%' } : { bottom: '0%', rotate: 0, width: '62%' }}
                transition={{ duration: 0.45, ease: ease.outExpo }}
              />
            </span>
          </button>
        </div>
      </nav>
      </motion.div>

      <MobileMenu open={open} active={active} onNavigate={go} />
    </header>
  )
}

interface MobileMenuProps {
  open: boolean
  active: SectionId
  onNavigate: (e: MouseEvent<HTMLAnchorElement>, id: string) => void
}

function MobileMenu({ open, active, onNavigate }: MobileMenuProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const origin = 'calc(100% - var(--gutter) - 1.25rem) calc(var(--nav-h) / 2)'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          data-lenis-prevent
          className="fixed inset-0 -z-[1] flex flex-col overflow-y-auto overscroll-contain bg-ink-0 pt-[calc(var(--nav-h)+2rem)] lg:hidden"
          initial={reduce ? { opacity: 0 } : { clipPath: `circle(0% at ${origin})` }}
          animate={reduce ? { opacity: 1 } : { clipPath: `circle(150% at ${origin})` }}
          exit={reduce ? { opacity: 0 } : { clipPath: `circle(0% at ${origin})` }}
          transition={{ duration: 0.75, ease: ease.inOutQuart }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 dot-grid opacity-[0.35] [mask-image:radial-gradient(circle_at_80%_10%,black,transparent_70%)]" />
          <ul className="container-x relative flex flex-col">
            {navSections.map((s, i) => (
              <motion.li
                key={s.id}
                className="border-b border-white/[0.07]"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
                transition={{ duration: 0.8, ease: ease.outExpo, delay: 0.18 + i * 0.06 }}
              >
                <a
                  href={`#${s.id}`}
                  onClick={(e) => onNavigate(e, s.id)}
                  aria-current={active === s.id ? 'true' : undefined}
                  className="group flex items-baseline justify-between py-4"
                >
                  <span
                    className={cn(
                      'text-[clamp(2.25rem,11vw,3.5rem)] font-medium leading-none tracking-[-0.045em] transition-colors',
                      active === s.id ? 'text-ink-950' : 'text-ink-500 group-hover:text-ink-900',
                    )}
                  >
                    {t.nav[s.navKey!]}
                  </span>
                  <span className="font-mono text-xs text-ink-500">{s.index}</span>
                </a>
              </motion.li>
            ))}
          </ul>
          <motion.div
            className="container-x relative mt-auto flex flex-col gap-5 pb-10 pt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <LanguageSwitch id="menu-lang" className="self-start" />
            <a href={`mailto:${profile.email}`} className="text-sm text-ink-700 underline-offset-4 hover:underline">
              {profile.email}
            </a>
            <p className="eyebrow">
              {profile.location.city}, {profile.location.region} — {profile.location.coords}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
