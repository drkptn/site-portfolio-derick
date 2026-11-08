import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { cn } from '@/lib/cn'

export interface Point {
  label: string
  value: number
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

/** "Nice" axis ticks (1, 2, 2.5, 5 × 10^n). */
function niceTicks(max: number, count = 4) {
  if (max <= 0) return [0, 1]
  const raw = max / count
  const pow = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? raw
  return Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => i * step)
}

/* ------------------------------------------------------------------ Line */

/** Single-series line + area with a crosshair tooltip (pointer and arrow keys). */
export function LineChart({
  data,
  format,
  label,
  height = 240,
}: {
  data: Point[]
  format: (v: number) => string
  label: string
  height?: number
}) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const gid = `area-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const pad = { l: 52, r: 12, t: 14, b: 26 }
  const w = Math.max(0, width - pad.l - pad.r)
  const h = height - pad.t - pad.b
  const ticks = niceTicks(Math.max(...data.map((d) => d.value), 1))
  const max = ticks[ticks.length - 1]
  const x = (i: number) => pad.l + (data.length < 2 ? w / 2 : (i / (data.length - 1)) * w)
  const y = (v: number) => pad.t + h - (v / max) * h
  const path = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ')
  const area = `${path} L${x(data.length - 1)},${pad.t + h} L${x(0)},${pad.t + h} Z`

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const rel = (e.clientX - r.left - pad.l) / Math.max(1, w)
    setHover(Math.max(0, Math.min(data.length - 1, Math.round(rel * (data.length - 1)))))
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    setHover((h0) => {
      const cur = h0 ?? (e.key === 'ArrowRight' ? -1 : data.length)
      return Math.max(0, Math.min(data.length - 1, cur + (e.key === 'ArrowRight' ? 1 : -1)))
    })
  }

  const hv = hover !== null ? data[hover] : null
  return (
    <div ref={ref} className="relative">
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={label}
          tabIndex={0}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          onKeyDown={onKey}
          onBlur={() => setHover(null)}
          className="block touch-pan-y outline-none focus-visible:outline-1 focus-visible:outline-ink-900"
        >
          <defs>
            <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--color-ink-900)" stopOpacity="0.16" />
              <stop offset="1" stopColor="var(--color-ink-900)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={pad.l + w} y1={y(t)} y2={y(t)} stroke="var(--color-ink-200)" strokeDasharray={t ? '2 4' : undefined} />
              <text x={pad.l - 10} y={y(t)} dy="0.32em" textAnchor="end" className="fill-ink-500 font-mono text-[10px]">
                {format(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) => (
            <text key={d.label} x={x(i)} y={height - 6} textAnchor="middle" className={cn('font-mono text-[10px]', hover === i ? 'fill-ink-900' : 'fill-ink-500', data.length > 8 && i % 2 === 1 && 'max-sm:hidden')}>
              {d.label}
            </text>
          ))}
          <path d={area} fill={`url(#${gid})`} />
          <path d={path} fill="none" stroke="var(--color-ink-900)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {hv && hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + h} stroke="var(--color-ink-500)" strokeDasharray="3 3" />
              <circle cx={x(hover)} cy={y(hv.value)} r="5" fill="var(--color-ink-50)" stroke="var(--color-ink-950)" strokeWidth="2" />
            </g>
          )}
        </svg>
      )}
      {hv && hover !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-[6px] border border-ink-300 bg-ink-50/95 px-2.5 py-1.5 shadow-lg backdrop-blur"
          style={{ left: Math.min(Math.max(x(hover), 70), width - 70) }}
          role="status"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-500">{hv.label}</p>
          <p className="text-sm font-medium tabular-nums text-ink-950">{format(hv.value)}</p>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------- Horizontal bars */

/** Single-series ranked bars; optional click-to-filter (cross-filtering). */
export function BarList({
  data,
  format,
  selected,
  onSelect,
  share = false,
  label,
}: {
  data: Point[]
  format: (v: number) => string
  selected?: string | null
  onSelect?: (label: string) => void
  share?: boolean
  label: string
}) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const total = data.reduce((a, d) => a + d.value, 0) || 1
  const Tag = onSelect ? 'button' : 'div'
  return (
    <ul className="space-y-1.5" aria-label={label}>
      {data.map((d) => {
        const dim = selected && selected !== d.label
        return (
          <li key={d.label}>
            <Tag
              {...(onSelect ? { type: 'button' as const, onClick: () => onSelect(d.label), 'aria-pressed': selected === d.label } : {})}
              className={cn('group grid w-full grid-cols-[6.5rem_1fr_auto] items-center gap-3 rounded-[5px] px-1 py-1 text-left', onSelect && 'hover:bg-ink-100/70')}
              title={`${d.label}: ${format(d.value)}`}
            >
              <span className={cn('truncate text-xs', dim ? 'text-ink-500' : 'text-ink-800')}>{d.label}</span>
              <span className="relative h-2.5 overflow-hidden rounded-r-[4px] bg-ink-100">
                <span
                  className={cn('absolute inset-y-0 left-0 rounded-r-[4px] transition-[width,background-color] duration-700 ease-[var(--ease-out-expo)]', dim ? 'bg-ink-300' : 'bg-ink-800 group-hover:bg-ink-950')}
                  style={{ width: `${(d.value / max) * 100}%` }}
                />
              </span>
              <span className="w-16 text-right font-mono text-[11px] tabular-nums text-ink-600">
                {share ? `${((d.value / total) * 100).toFixed(1)}%` : format(d.value)}
              </span>
            </Tag>
          </li>
        )
      })}
    </ul>
  )
}
