import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { content, type Content } from './content'
import type { Lang, Localized } from './types'

interface LanguageContextValue {
  lang: Lang
  t: Content
  setLang: (lang: Lang) => void
  /** Pick the current-language value from a Localized object. */
  l: <T>(value: Localized<T>) => T
}

const STORAGE_KEY = 'dp-lang'
const LanguageContext = createContext<LanguageContextValue | null>(null)

function detectInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'pt') return saved
  } catch {
    /* storage unavailable */
  }
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en'
    document.title = content[lang].meta.title
  }, [lang])

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, t: content[lang], setLang, l: (v) => v[lang] }),
    [lang, setLang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useI18n() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useI18n must be used inside <LanguageProvider>')
  return ctx
}
