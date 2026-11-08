import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

interface CounterProps {
  to: number
  pad?: number
  suffix?: string
  duration?: number
  className?: string
}

/** Counts up when scrolled into view. The final value is always rendered for assistive tech. */
export function Counter({ to, pad = 0, suffix = '', duration = 1.6, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()
  const [value, setValue] = useState(reduce ? to : 0)

  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, reduce, to, duration])

  const text = `${String(value).padStart(pad, '0')}${suffix}`
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{`${String(to).padStart(pad, '0')}${suffix}`}</span>
      <span aria-hidden="true" className="tabular-nums">
        {text}
      </span>
    </span>
  )
}
