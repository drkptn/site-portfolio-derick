import { motion, useScroll, useSpring } from 'motion/react'

/** Thin page-progress line pinned to the very top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 })
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[90] h-px origin-left bg-gradient-to-r from-ink-500 via-ink-900 to-white"
      style={{ scaleX }}
    />
  )
}
