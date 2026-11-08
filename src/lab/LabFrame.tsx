import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** App window used by every lab: title bar with file name, live badge and actions. */
export function LabFrame({
  file,
  live,
  actions,
  children,
  footer,
  className,
}: {
  file: string
  live: string
  actions?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('surface overflow-hidden rounded-[14px]', className)}>
      <div className="flex min-h-12 flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/[0.07] px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-ink-300" />
          <span className="size-2.5 rounded-full bg-ink-200" />
          <span className="size-2.5 rounded-full bg-ink-200" />
        </span>
        <span className="font-mono text-xs text-ink-500">{file}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-600">
          <span className="size-1.5 animate-pulse-dot rounded-full bg-ink-900" aria-hidden="true" />
          {live}
        </span>
        {actions && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
      {footer && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-white/[0.07] px-4 py-2.5 font-mono text-[0.6875rem] text-ink-500">
          {footer}
        </div>
      )}
    </div>
  )
}

/** Small toolbar button used inside lab apps. */
export function ToolButton({
  children,
  onClick,
  primary,
  disabled,
  label,
  pressed,
}: {
  children: ReactNode
  onClick: () => void
  primary?: boolean
  disabled?: boolean
  label?: string
  pressed?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      className={cn(
        'inline-flex h-9 items-center gap-2 rounded-[6px] px-3 text-[0.8125rem] font-medium transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40',
        primary
          ? 'bg-ink-900 text-ink-0 hover:bg-ink-950'
          : pressed
            ? 'border border-ink-500 bg-ink-200 text-ink-950'
            : 'border border-ink-200 bg-ink-100/60 text-ink-700 hover:border-ink-400 hover:text-ink-950',
      )}
    >
      {children}
    </button>
  )
}

/** Segmented control (single choice). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  label: string
  className?: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex rounded-[7px] border border-ink-200 bg-ink-100/50 p-0.5', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            'h-8 rounded-[5px] px-3 text-[0.75rem] transition-colors duration-300',
            o.value === value ? 'bg-ink-900 text-ink-0' : 'text-ink-600 hover:text-ink-950',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
