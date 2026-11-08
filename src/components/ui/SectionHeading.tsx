import { cn } from '@/lib/cn'
import { RevealText } from './RevealText'
import { Reveal } from './Reveal'

interface SectionLabelProps {
  index: string
  label: string
  className?: string
}

/** (02) ——— ABOUT */
export function SectionLabel({ index, label, className }: SectionLabelProps) {
  return (
    <Reveal className={cn('flex items-center gap-4', className)} y={12}>
      <span className="eyebrow text-ink-600">({index})</span>
      <span className="h-px w-10 bg-ink-400" aria-hidden="true" />
      <span className="eyebrow inline-flex items-center gap-2 text-ink-600">
        <span className="size-1.5 rounded-full bg-ink-700" aria-hidden="true" />
        {label}
      </span>
    </Reveal>
  )
}

interface SectionHeadingProps {
  id: string
  index: string
  label: string
  dim: string
  bright: string
  className?: string
  titleClassName?: string
}

export function SectionHeading({ id, index, label, dim, bright, className, titleClassName }: SectionHeadingProps) {
  return (
    <div className={cn('flex flex-col gap-7', className)}>
      <SectionLabel index={index} label={label} />
      <RevealText
        as="h2"
        id={`${id}-title`}
        className={cn(
          'max-w-[18ch] text-[clamp(2.4rem,5.6vw,5.25rem)] font-medium leading-[0.98] tracking-[-0.045em] text-balance',
          titleClassName,
        )}
        parts={[
          { text: dim, className: 'text-dim' },
          { text: bright, className: 'text-ink-900' },
        ]}
      />
    </div>
  )
}
