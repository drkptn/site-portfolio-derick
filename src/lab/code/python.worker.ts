/// <reference lib="webworker" />
/**
 * Python runs in a Web Worker: the page never freezes, and an infinite loop can be
 * stopped by terminating the worker.
 */

type PyodideAPI = {
  setStdout: (o: { batched: (s: string) => void }) => void
  setStderr: (o: { batched: (s: string) => void }) => void
  runPythonAsync: (code: string, opts?: { globals?: unknown }) => Promise<unknown>
  globals: { get: (name: string) => (...args: unknown[]) => { destroy?: () => void } }
  version: string
}

type InMessage = { type: 'init'; indexURL: string } | { type: 'run'; indexURL: string; code: string }

/** Kept as a constant so hosts that cannot serve .zip can rename the file. */
const STDLIB_FILE = 'python_stdlib.zip'

let loading: Promise<PyodideAPI> | null = null

function ensure(indexURL: string) {
  loading ??= (async () => {
    postMessage({ type: 'status', status: 'loading' })
    const mod = (await import(/* @vite-ignore */ `${indexURL}pyodide.mjs`)) as {
      loadPyodide: (o: { indexURL: string; stdLibURL?: string }) => Promise<PyodideAPI>
    }
    const py = await mod.loadPyodide({ indexURL, stdLibURL: `${indexURL}${STDLIB_FILE}` })
    py.setStdout({ batched: (text) => postMessage({ type: 'stdout', text }) })
    py.setStderr({ batched: (text) => postMessage({ type: 'stderr', text }) })
    postMessage({ type: 'status', status: 'ready', version: py.version })
    return py
  })()
  return loading
}

self.onmessage = async (event: MessageEvent<InMessage>) => {
  const msg = event.data
  try {
    const py = await ensure(msg.indexURL)
    if (msg.type !== 'run') return
    postMessage({ type: 'status', status: 'running' })
    // Fresh namespace per run, so examples never leak state into each other
    const globals = py.globals.get('dict')()
    const t0 = performance.now()
    try {
      await py.runPythonAsync(msg.code, { globals })
      postMessage({ type: 'done', ms: performance.now() - t0 })
    } finally {
      globals.destroy?.()
    }
  } catch (err) {
    const text = err instanceof Error ? err.message : String(err)
    postMessage({ type: 'error', text: cleanTraceback(text) })
  }
}

/** Drop Pyodide-internal frames: keep only the user's code lines and the error. */
function cleanTraceback(text: string) {
  const lines = text.trim().split('\n')
  const userStart = lines.findIndex((l) => l.includes('File "<exec>"'))
  return userStart >= 0 ? ['Traceback (most recent call last):', ...lines.slice(userStart)].join('\n') : text
}
