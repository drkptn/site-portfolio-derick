import { ArrowUpRight } from 'lucide-react'
import type { ComponentType, MouseEventHandler, ReactNode, SVGProps } from 'react'
import { cn } from '@/lib/cn'
import { Magnetic } from './Magnetic'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps {
  children: ReactNode
  href?: string
  onClick?: MouseEventHandler<HTMLElement>
  variant?: Variant
  icon?: ComponentType<SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number }>
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  download?: boolean | string
  external?: boolean
  cursor?: string
  ariaLabel?: string
  magnetic?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-ink-900 text-ink-0 shadow-[inset_0_-2px_0_0_rgb(0_0_0/0.15),0_10px_40px_-12px_rgb(255_255_255/0.35)] hover:bg-white hover:shadow-[inset_0_-2px_0_0_rgb(0_0_0/0.15),0_14px_50px_-10px_rgb(255_255_255/0.5)]',
  secondary:
    'border border-ink-300 bg-ink-100/60 text-ink-900 backdrop-blur-sm hover:border-ink-500 hover:bg-ink-200/70 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06)]',
  ghost: 'text-ink-700 hover:text-ink-950',
}

/**
 * Button / link with a rolling-label hover (text slides up and is replaced by a copy)
 * and an icon that exits and re-enters diagonally.
 */
export function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  icon: Icon = ArrowUpRight,
  className,
  type = 'button',
  disabled,
  download,
  external,
  cursor,
  ariaLabel,
  magnetic = true,
}: ButtonProps) {
  const classes = cn(
    'group/btn relative inline-flex h-12 items-center gap-3 overflow-hidden rounded-[6px] text-[0.8125rem] font-medium tracking-[-0.005em] transition-[background,box-shadow,border-color,color] duration-500 ease-[var(--ease-out-expo)] disabled:pointer-events-none disabled:opacity-50',
    variant === 'ghost' ? 'px-1' : 'px-5',
    variants[variant],
    className,
  )

  const inner = (
    <>
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:-translate-y-full">
          {children}
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:translate-y-0"
        >
          {children}
        </span>
      </span>
      <span className="relative block size-4 overflow-hidden" aria-hidden="true">
        <Icon
          size={16}
          strokeWidth={1.75}
          className="absolute inset-0 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:translate-x-full group-hover/btn:-translate-y-full"
        />
        <Icon
          size={16}
          strokeWidth={1.75}
          className="absolute inset-0 -translate-x-full translate-y-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:translate-x-0 group-hover/btn:translate-y-0"
        />
      </span>
    </>
  )

  const element = href ? (
    <a
      href={href}
      onClick={onClick}
      className={classes}
      download={download}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      data-cursor={cursor}
      aria-label={ariaLabel}
    >
      {inner}
    </a>
  ) : (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      disabled={disabled}
      data-cursor={cursor}
      aria-label={ariaLabel}
    >
      {inner}
    </button>
  )

  return magnetic ? <Magnetic>{element}</Magnetic> : element
}
