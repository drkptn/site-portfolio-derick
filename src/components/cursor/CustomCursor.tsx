import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { useFinePointer } from '@/hooks/useMediaQuery'
import { useI18n } from '@/i18n/LanguageProvider'
import { useTheme } from '@/providers/ThemeProvider'
import type { Content } from '@/i18n/content'

type Variant = 'default' | 'link' | 'label' | 'text' | 'hidden'
type CursorKey = keyof Content['cursor']

const INTERACTIVE = 'a, button, [role="button"], label, select, summary, [data-cursor]'

const sizes: Record<Variant, { w: number; h: number }> = {
  default: { w: 34, h: 34 },
  link: { w: 58, h: 58 },
  label: { w: 86, h: 86 },
  text: { w: 2, h: 26 },
  hidden: { w: 0, h: 0 },
}

/**
 * Two-part cursor: an exact dot + a lagging ring that grows on interactive elements
 * and shows contextual labels (data-cursor="view|open|copy|explore|send|download").
 * Mounted only on fine pointers; touch devices keep the native behaviour.
 */
export function CustomCursor() {
  const fine = useFinePointer()
  if (!fine) return null
  return <CursorInner />
}

function CursorInner() {
  const { t } = useI18n()
  const ink = useTheme().theme === 'light' ? '10,10,10' : '245,245,245'
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 420, damping: 38, mass: 0.55 })
  const ry = useSpring(y, { stiffness: 420, damping: 38, mass: 0.55 })
  const [variant, setVariant] = useState<Variant>('hidden')
  const [label, setLabel] = useState<CursorKey | null>(null)
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    document.documentElement.classList.add('has-custom-cursor')
    let visible = false

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x.set(e.clientX)
      y.set(e.clientY)
      if (!visible) {
        visible = true
        rx.jump(e.clientX)
        ry.jump(e.clientY)
        setVariant((v) => (v === 'hidden' ? 'default' : v))
      }
    }

    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null
      if (!target?.closest) return
      if (target.closest('input, textarea')) {
        setVariant('text')
        setLabel(null)
        return
      }
      const el = target.closest(INTERACTIVE)
      if (!el) {
        setVariant('default')
        setLabel(null)
        return
      }
      const key = el.getAttribute('data-cursor')
      if (key === 'none') {
        setVariant('hidden')
      } else if (key && key in t.cursor) {
        setVariant('label')
        setLabel(key as CursorKey)
      } else {
        setVariant('link')
        setLabel(null)
      }
    }

    const onLeaveWindow = () => {
      visible = false
      setVariant('hidden')
    }
    const onDown = () => setPressed(true)
    const onUp = () => setPressed(false)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeaveWindow)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    return () => {
      document.documentElement.classList.remove('has-custom-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.documentElement.removeEventListener('pointerleave', onLeaveWindow)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [t.cursor, x, y, rx, ry])

  const size = sizes[variant]
  const isLabel = variant === 'label'

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[200]">
      {/* Ring */}
      <motion.div
        className="absolute left-0 top-0 flex items-center justify-center overflow-hidden border border-solid"
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: size.w,
          height: size.h,
          borderRadius: variant === 'text' ? 2 : 999,
          backgroundColor: isLabel
            ? `rgba(${ink},1)`
            : variant === 'link'
              ? `rgba(${ink},0.06)`
              : variant === 'text'
                ? `rgba(${ink},0.9)`
                : `rgba(${ink},0)`,
          borderColor: isLabel || variant === 'text' ? `rgba(${ink},0)` : variant === 'link' ? `rgba(${ink},0.7)` : `rgba(${ink},0.32)`,
          scale: pressed ? 0.86 : 1,
          opacity: variant === 'hidden' ? 0 : 1,
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.6 }}
        initial={false}
      >
        <AnimatePresence mode="wait">
          {isLabel && label && (
            <motion.span
              key={label}
              className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.16em] text-ink-0"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {t.cursor[label]}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      {/* Dot */}
      <motion.div
        className="absolute left-0 top-0 size-1.5 rounded-full bg-[#fff] mix-blend-difference"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: variant === 'default' ? 1 : 0, scale: variant === 'default' ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
    </div>
  )
}
