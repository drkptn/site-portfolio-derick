import { motion, useInView, useReducedMotion } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { ease } from '@/animations/easing'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  x?: number
  blur?: boolean
  scale?: number
  /** Clip-path wipe from the bottom instead of a fade. */
  clip?: boolean
  when?: boolean
  amount?: number
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  x = 0,
  blur = false,
  scale = 1,
  clip = false,
  when = true,
  amount = 0,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px', amount })
  const reduce = useReducedMotion()
  const show = (inView && when) || reduce

  const hidden = clip
    ? { clipPath: 'inset(100% 0% 0% 0%)', y: y / 2 }
    : { opacity: 0, y, x, scale, filter: blur ? 'blur(10px)' : 'blur(0px)' }
  const visible = clip
    ? { clipPath: 'inset(0% 0% 0% 0%)', y: 0 }
    : { opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)' }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : hidden}
      animate={show ? visible : undefined}
      transition={{ duration: clip ? 1.2 : 0.9, ease: clip ? ease.inOutQuart : ease.outExpo, delay }}
    >
      {children}
    </motion.div>
  )
}
