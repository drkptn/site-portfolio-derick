import { AnimatePresence, motion } from 'motion/react'
import { Moon, Sun } from 'lucide-react'
import { useI18n } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/cn'
import { useTheme } from '@/providers/ThemeProvider'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const { t } = useI18n()
  const light = theme === 'light'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? t.nav.themeDark : t.nav.themeLight}
      title={light ? t.nav.themeDark : t.nav.themeLight}
      className={cn(
        'relative flex size-9 items-center justify-center overflow-hidden rounded-[6px] border border-ink-200 bg-ink-100/60 text-ink-800 transition-colors hover:border-ink-400 hover:text-ink-950',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 14, rotate: -60, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -14, rotate: 60, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex"
        >
          {light ? <Moon size={16} strokeWidth={1.6} aria-hidden="true" /> : <Sun size={16} strokeWidth={1.6} aria-hidden="true" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
