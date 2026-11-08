import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

const STORAGE_KEY = 'dp-theme'
const ThemeContext = createContext<ThemeContextValue | null>(null)

function initialTheme(): Theme {
  return document.documentElement.dataset.siteTheme === 'light' ? 'light' : 'dark'
}

/** Dark by default; light is an explicit choice that persists per visitor. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.siteTheme = theme
    root.style.background = theme === 'light' ? '#f4f4f3' : '#0a0a0a'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f4f4f3' : '#0a0a0a')
    document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* storage unavailable */
    }
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])
  const value = useMemo(() => ({ theme, toggle }), [theme, toggle])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
