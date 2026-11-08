import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center rounded-[4px] border border-ink-200 bg-ink-100/50 px-2.5 font-mono text-[0.6875rem] tracking-[0.04em] text-ink-600 transition-colors duration-300 hover:border-ink-400 hover:text-ink-900',
        className,
      )}
    >
      {children}
    </span>
  )
}
