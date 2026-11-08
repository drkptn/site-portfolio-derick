import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import { useFinePointer } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/cn'

interface StageProps {
  children: ReactNode
  /** Design size of the artboard — the content is scaled to fit the container width. */
  width?: number
  height?: number
  className?: string
  label: string
}

/**
 * Fixed-size artboard scaled to its container, so mockups stay pixel-precise at any
 * breakpoint. Pointer position is exposed as --px / --py (−1…1) for layer parallax.
 */
export function Stage({ children, width = 960, height = 640, className, label }: StageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  const fine = useFinePointer()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [width])

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!fine) return
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3))
    e.currentTarget.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3))
  }
  const onLeave = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--px', '0')
    e.currentTarget.style.setProperty('--py', '0')
  }

  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn('theme-dark-scope relative w-full select-none', className)}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 origin-top-left"
        style={{ width, height, transform: `scale(${scale})`, visibility: scale ? 'visible' : 'hidden' }}
      >
        {children}
      </div>
    </div>
  )
}

/** A layer that drifts with the pointer; higher depth = closer to the viewer. */
export function Layer({
  depth = 1,
  className,
  style,
  children,
}: {
  depth?: number
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <div
      className={cn('absolute transition-transform duration-700 ease-[var(--ease-out-expo)]', className)}
      style={{
        ...style,
        transform: `translate3d(calc(var(--px, 0) * ${depth * 10}px), calc(var(--py, 0) * ${depth * 8}px), 0)`,
      }}
    >
      {children}
    </div>
  )
}

/** Window chrome shared by all mockups. */
export function Window({
  title,
  children,
  className,
  tabs,
}: {
  title?: string
  children: ReactNode
  className?: string
  tabs?: string[]
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[12px] border border-white/[0.09] bg-[#0d0d0d] shadow-[0_40px_90px_-30px_rgb(0_0_0/0.95),inset_0_1px_0_rgb(255_255_255/0.06)]',
        className,
      )}
    >
      <div className="flex h-9 items-center gap-3 border-b border-white/[0.07] bg-[#121212] px-3.5">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#3a3a3a]" />
          <span className="size-2.5 rounded-full bg-[#2c2c2c]" />
          <span className="size-2.5 rounded-full bg-[#2c2c2c]" />
        </span>
        {tabs ? (
          <span className="flex h-full items-end gap-1">
            {tabs.map((tab, i) => (
              <span
                key={tab}
                className={cn(
                  'flex h-7 items-center rounded-t-[6px] px-3 font-mono text-[11px]',
                  i === 0 ? 'bg-[#0d0d0d] text-[#d4d4d4]' : 'text-[#6b6b6b]',
                )}
              >
                {tab}
              </span>
            ))}
          </span>
        ) : (
          title && <span className="font-mono text-[11px] text-[#7a7a7a]">{title}</span>
        )}
      </div>
      {children}
    </div>
  )
}
