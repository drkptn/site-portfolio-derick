import { useCallback, useEffect, useRef, useState } from 'react'

export function useCopyToClipboard(resetAfter = 1800) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = useCallback(
    async (text: string) => {
      let ok = false
      try {
        await navigator.clipboard.writeText(text)
        ok = true
      } catch {
        // Fallback for browsers / contexts without the async clipboard API
        const area = document.createElement('textarea')
        area.value = text
        area.setAttribute('readonly', '')
        area.style.position = 'fixed'
        area.style.opacity = '0'
        document.body.appendChild(area)
        area.select()
        try {
          ok = document.execCommand('copy')
        } catch {
          ok = false
        }
        area.remove()
      }
      if (ok) {
        setCopied(true)
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setCopied(false), resetAfter)
      }
      return ok
    },
    [resetAfter],
  )

  return { copied, copy }
}
