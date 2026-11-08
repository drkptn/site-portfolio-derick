import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useRef, type PointerEvent, type ReactNode } from 'react'
import { useFinePointer } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/cn'

interface TiltCardProps {
  children: ReactNode
  className?: string
  max?: number
  /** Enables the mouse-following light on the surface and border. */
  spotlight?: boolean
  as?: 'div' | 'article' | 'li'
}

/** 3D tilt that follows the pointer, with a spotlight on the surface and border. */
export function TiltCard({ children, className, max = 6, spotlight = true, as = 'div' }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const fine = useFinePointer()
  const reduce = useReducedMotion()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 160, damping: 18 })
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 160, damping: 18 })
  const enabled = fine && !reduce
  const Comp = motion[as]

  const onMove = (e: PointerEvent<HTMLElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
    if (enabled) {
      px.set(x)
      py.set(y)
    }
  }
  const onLeave = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <Comp
      ref={ref as never}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn('relative [transform-style:preserve-3d]', spotlight && 'spotlight', className)}
      style={enabled ? { rotateX: rx, rotateY: ry, transformPerspective: 1100 } : undefined}
    >
      {children}
    </Comp>
  )
}
