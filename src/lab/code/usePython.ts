import { useCallback, useEffect, useRef, useState } from 'react'
import { runtimeUrl } from '../runtime'

export type PyStatus = 'idle' | 'loading' | 'ready' | 'running'
export interface OutputLine {
  kind: 'out' | 'err' | 'info'
  text: string
}

/** Owns the Python worker: lazy runtime download, stdout streaming, stop & restart. */
export function usePython() {
  const worker = useRef<Worker | null>(null)
  const [status, setStatus] = useState<PyStatus>('idle')
  const [version, setVersion] = useState<string>('')
  const [output, setOutput] = useState<OutputLine[]>([])
  const [lastMs, setLastMs] = useState<number | null>(null)
  const indexURL = runtimeUrl('pyodide/')

  const spawn = useCallback(() => {
    const w = new Worker(new URL('./python.worker.ts', import.meta.url), { type: 'module' })
    w.onmessage = (e: MessageEvent) => {
      const m = e.data
      if (m.type === 'status') {
        setStatus(m.status)
        if (m.version) setVersion(m.version)
      } else if (m.type === 'stdout') setOutput((o) => [...o, { kind: 'out', text: m.text }])
      else if (m.type === 'stderr') setOutput((o) => [...o, { kind: 'err', text: m.text }])
      else if (m.type === 'error') {
        setOutput((o) => [...o, { kind: 'err', text: m.text }])
        setStatus('ready')
      } else if (m.type === 'done') {
        setLastMs(m.ms)
        setStatus('ready')
      }
    }
    w.onerror = () => {
      setOutput((o) => [...o, { kind: 'err', text: 'Python runtime failed to load.' }])
      setStatus('idle')
    }
    worker.current = w
    return w
  }, [])

  useEffect(() => () => worker.current?.terminate(), [])

  /** Start downloading the runtime ahead of time (e.g. when the editor gets focus). */
  const warmUp = useCallback(() => {
    if (worker.current) return
    spawn().postMessage({ type: 'init', indexURL })
  }, [spawn, indexURL])

  const run = useCallback(
    (code: string) => {
      const w = worker.current ?? spawn()
      setOutput([])
      setLastMs(null)
      w.postMessage({ type: 'run', indexURL, code })
    },
    [spawn, indexURL],
  )

  /** Terminating the worker is the only reliable way to stop runaway Python. */
  const stop = useCallback(() => {
    worker.current?.terminate()
    worker.current = null
    setStatus('idle')
    setOutput((o) => [...o, { kind: 'info', text: '■ Execution stopped.' }])
  }, [])

  const clear = useCallback(() => setOutput([]), [])

  return { status, version, output, lastMs, run, stop, warmUp, clear }
}
