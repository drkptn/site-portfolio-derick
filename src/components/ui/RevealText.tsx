import { motion, useInView, useReducedMotion } from 'motion/react'
import { useRef, type ElementType } from 'react'
import { ease } from '@/animations/easing'
import { cn } from '@/lib/cn'

export interface RevealPart {
  text: string
  className?: string
}

interface RevealTextProps {
  /** Plain text or several styled parts (e.g. a dim lead-in and a bright ending). */
  parts: string | RevealPart[]
  as?: ElementType
  className?: string
  delay?: number
  stagger?: number
  /** Start the animation only when this is true (e.g. after the preloader). */
  when?: boolean
  /** Adds a blur-to-sharp transition, borrowed from the motion reference. */
  blur?: boolean
  id?: string
}

/**
 * Word-by-word masked reveal. The animated copy is aria-hidden and a plain copy
 * is kept for assistive tech, so screen readers never read split fragments.
 */
export function RevealText({
  parts,
  as: Tag = 'p',
  className,
  delay = 0,
  stagger = 0.045,
  when = true,
  blur = true,
  id,
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' })
  const reduce = useReducedMotion()
  const list: RevealPart[] = typeof parts === 'string' ? [{ text: parts }] : parts
  const plain = list.map((p) => p.text).join(' ')
  const show = inView && when

  let wordIndex = 0
  return (
    <Tag ref={ref} id={id} className={className}>
      <span className="sr-only">{plain}</span>
      <span aria-hidden="true">
        {list.map((part, pi) => {
          const words = part.text.split(' ').filter(Boolean)
          return (
            <span key={pi}>
              {words.map((word, wi) => {
                const i = wordIndex++
                return (
                  <span key={wi} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-top">
                    <motion.span
                      className={cn('inline-block will-change-transform', part.className)}
                      initial={reduce ? false : { y: '105%', opacity: 0, filter: blur ? 'blur(8px)' : 'blur(0px)' }}
                      animate={show || reduce ? { y: '0%', opacity: 1, filter: 'blur(0px)' } : undefined}
                      transition={{ duration: 1, ease: ease.outExpo, delay: delay + i * stagger }}
                    >
                      {word}
                    </motion.span>
                    {' '}
                  </span>
                )
              })}
            </span>
          )
        })}
      </span>
    </Tag>
  )
}
