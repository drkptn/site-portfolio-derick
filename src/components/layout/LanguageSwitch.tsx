import { motion } from 'motion/react'
import { useI18n } from '@/i18n/LanguageProvider'
import { LANGS } from '@/i18n/types'
import { cn } from '@/lib/cn'

export function LanguageSwitch({ id = 'lang', className }: { id?: string; className?: string }) {
  const { lang, setLang, t } = useI18n()
  return (
    <div
      role="group"
      aria-label={t.nav.language}
      className={cn('relative flex h-9 items-center rounded-[6px] border border-ink-200 bg-ink-100/50 p-0.5 font-mono text-[0.6875rem]', className)}
    >
      {LANGS.map((code) => {
        const active = code === lang
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={active}
            className={cn(
              'relative z-10 h-full rounded-[4px] px-2.5 uppercase tracking-[0.12em] transition-colors duration-300',
              active ? 'text-ink-0' : 'text-ink-500 hover:text-ink-900',
            )}
          >
            {active && (
              <motion.span
                layoutId={`${id}-pill`}
                className="absolute inset-0 -z-10 rounded-[4px] bg-ink-900"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            {code}
          </button>
        )
      })}
    </div>
  )
}
