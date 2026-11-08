import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useState } from 'react'
import { sections } from '@/data/sections'
import { useActiveSection } from '@/hooks/useActiveSection'
import { CircleLoader } from '@/components/ui/CircleLoader'
import { useI18n } from '@/i18n/LanguageProvider'
import { useSmoothScroll } from '@/providers/SmoothScrollProvider'

const SECTION_IDS = sections.map((s) => s.id)

/** Floating ring with the page percentage (reference 04) — click to go back to top. */
export function PageProgress() {
  const { t } = useI18n()
  const { scrollTo } = useSmoothScroll()
  const { scrollYProgress, scrollY } = useScroll()
  const [pct, setPct] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  // Hidden where it would sit on top of content controls (pinned projects, form, footer)
  const active = useActiveSection(SECTION_IDS)
  const visible = scrolled && active !== 'projects' && active !== 'contact'

  useMotionValueEvent(scrollYProgress, 'change', (v) => setPct(Math.round(v * 100)))
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > window.innerHeight * 0.8))

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={() => scrollTo('top')}
          aria-label={`${t.nav.backToTop} — ${pct}%`}
          className="group fixed bottom-6 right-[var(--gutter)] z-[70] hidden size-14 items-center justify-center rounded-full bg-ink-50/70 text-ink-700 backdrop-blur-md transition-colors hover:text-ink-950 lg:flex"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.4 }}
        >
          <CircleLoader size={56} stroke={1.25} progress={pct / 100} className="absolute inset-0" />
          <span className="font-mono text-[0.625rem] tabular-nums transition-opacity duration-300 group-hover:opacity-0">{pct}%</span>
          <span className="absolute font-mono text-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true">↑</span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
