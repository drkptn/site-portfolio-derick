import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

interface AppState {
  /** True once the preloader has finished its exit transition. */
  introDone: boolean
  setIntroDone: (value: boolean) => void
}

const AppStateContext = createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [introDone, setIntroDone] = useState(false)
  const value = useMemo(() => ({ introDone, setIntroDone }), [introDone])
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>')
  return ctx
}
