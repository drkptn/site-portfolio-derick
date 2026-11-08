import { useSyncExternalStore } from 'react'

export function useMediaQuery(query: string, serverFallback = false) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => serverFallback,
  )
}

/** True on devices with a precise pointer that can hover (mouse / trackpad). */
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)')

export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
