import { useMemo, useRef, type KeyboardEvent } from 'react'
import { highlight } from './highlight'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  onRun: () => void
  language: 'python' | 'sql'
  label: string
}

/**
 * Transparent textarea on top of a highlighted <pre>. Both share the same box,
 * font metrics and padding; the scroll container wraps them so they never drift.
 */
export function CodeEditor({ value, onChange, onRun, language, label }: CodeEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const html = useMemo(() => highlight(value, language), [value, language])
  const lines = value.split('\n').length

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      onRun()
      return
    }
    if (e.key === 'Tab' && !e.shiftKey) {
      // Indent with 4 spaces (Esc + Tab still lets keyboard users leave the field)
      e.preventDefault()
      const el = e.currentTarget
      const { selectionStart: s, selectionEnd: end } = el
      const next = value.slice(0, s) + '    ' + value.slice(end)
      onChange(next)
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = s + 4
      })
    }
  }

  return (
    <div data-lenis-prevent className="code-editor relative h-full min-h-[18rem] overflow-auto overscroll-contain bg-[#0b0b0b]">
      <div className="flex min-h-full w-max min-w-full font-mono text-[16px] leading-[1.6] sm:text-[13px]">
        <div aria-hidden="true" className="sticky left-0 z-10 select-none border-r border-white/[0.06] bg-[#0b0b0b] px-3 py-4 text-right text-[#3f3f3f]">
          {Array.from({ length: lines }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <div className="relative flex-1">
          <pre aria-hidden="true" className="m-0 whitespace-pre px-4 py-4 text-[#bdbdbd]" dangerouslySetInnerHTML={{ __html: html }} />
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            aria-label={label}
            className="absolute inset-0 h-full w-full resize-none overflow-hidden whitespace-pre bg-transparent px-4 py-4 text-transparent caret-[#f5f5f5] outline-none selection:bg-white/20 selection:text-transparent"
          />
        </div>
      </div>
    </div>
  )
}
