import { cn } from '@/lib/cn'

interface CircleLoaderProps {
  size?: number
  className?: string
  /** 0–1: draws a determinate arc instead of spinning. */
  progress?: number
  stroke?: number
}

/** Ring indicator inspired by the loader set in reference 04. */
export function CircleLoader({ size = 40, className, progress, stroke = 1.5 }: CircleLoaderProps) {
  const r = (size - stroke * 2) / 2
  const c = 2 * Math.PI * r
  const determinate = typeof progress === 'number'
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn(!determinate && 'animate-spin-slow', className)}
      aria-hidden="true"
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.18} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={determinate ? c * (1 - Math.min(1, Math.max(0, progress))) : c * 0.72}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: determinate ? 'stroke-dashoffset 120ms linear' : undefined }}
      />
    </svg>
  )
}
