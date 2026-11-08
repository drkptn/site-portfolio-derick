import Lenis from 'lenis'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'

type Target = string | number | HTMLElement

interface SmoothScrollApi {
  scrollTo: (target: Target, options?: { immediate?: boolean; offset?: number }) => void
  /** Ref-counted scroll lock (menu, modal and preloader can stack). */
  lock: () => void
  unlock: () => void
  getLenis: () => Lenis | null
}

const SmoothScrollContext = createContext<SmoothScrollApi | null>(null)

const expo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  const lenisRef = useRef<Lenis | null>(null)
  const locks = useRef(0)

  useEffect(() => {
    if (reduce) return
    const lenis = new Lenis({
      duration: 1.15,
      easing: expo,
      smoothWheel: true,
      autoRaf: true,
      // Elements that manage their own scroll (modal, mobile menu) opt out with data-lenis-prevent
      prevent: (node) => node.hasAttribute('data-lenis-prevent'),
    })
    lenisRef.current = lenis
    if (locks.current > 0) lenis.stop()
    return () => {
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reduce])

  const resolve = (target: Target): number | HTMLElement | null => {
    if (typeof target === 'number' || target instanceof HTMLElement) return target
    if (target === 'top' || target === '#home' || target === '#') return 0
    return document.querySelector<HTMLElement>(target.startsWith('#') ? target : `#${target}`)
  }

  const scrollTo = useCallback<SmoothScrollApi['scrollTo']>((target, options) => {
    const resolved = resolve(target)
    if (resolved === null) return
    const lenis = lenisRef.current
    if (lenis) {
      lenis.scrollTo(resolved, {
        offset: options?.offset ?? 0,
        immediate: options?.immediate,
        duration: 1.5,
        easing: expo,
        force: true,
      })
      return
    }
    const top =
      typeof resolved === 'number'
        ? resolved
        : resolved.getBoundingClientRect().top + window.scrollY + (options?.offset ?? 0)
    window.scrollTo({ top, behavior: options?.immediate || reduce ? 'auto' : 'smooth' })
  }, [reduce])

  const lock = useCallback(() => {
    locks.current += 1
    lenisRef.current?.stop()
    document.documentElement.style.overflow = 'hidden'
  }, [])

  const unlock = useCallback(() => {
    locks.current = Math.max(0, locks.current - 1)
    if (locks.current === 0) {
      lenisRef.current?.start()
      document.documentElement.style.overflow = ''
    }
  }, [])

  const api = useMemo<SmoothScrollApi>(
    () => ({ scrollTo, lock, unlock, getLenis: () => lenisRef.current }),
    [scrollTo, lock, unlock],
  )

  return <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>
}

export function useSmoothScroll() {
  const ctx = useContext(SmoothScrollContext)
  if (!ctx) throw new Error('useSmoothScroll must be used inside <SmoothScrollProvider>')
  return ctx
}
