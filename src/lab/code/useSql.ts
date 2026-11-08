import { useCallback, useRef, useState } from 'react'
import type { Database } from 'sql.js'
import { runtimeUrl } from '../runtime'
import { sqlSeed } from './snippets'

export interface SqlResult {
  columns: string[]
  rows: (string | number | null)[][]
}
export interface TableInfo {
  name: string
  columns: { name: string; type: string; pk: boolean }[]
  count: number
}

/** Real SQLite (sql.js / WebAssembly) with a seeded network database. */
export function useSql() {
  const db = useRef<Database | null>(null)
  const loading = useRef<Promise<Database> | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready'>('idle')
  const [result, setResult] = useState<SqlResult | null>(null)
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [lastMs, setLastMs] = useState<number | null>(null)
  const [schema, setSchema] = useState<TableInfo[]>([])

  const readSchema = (d: Database) => {
    const tables = d.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")[0]?.values.map((v) => String(v[0])) ?? []
    setSchema(
      tables.map((name) => ({
        name,
        columns: (d.exec(`PRAGMA table_info(${name})`)[0]?.values ?? []).map((c) => ({ name: String(c[1]), type: String(c[2]), pk: Number(c[5]) > 0 })),
        count: Number(d.exec(`SELECT COUNT(*) FROM ${name}`)[0]?.values[0][0] ?? 0),
      })),
    )
  }

  const ensure = useCallback(async () => {
    if (db.current) return db.current
    loading.current ??= (async () => {
      setStatus('loading')
      const initSqlJs = (await import('sql.js')).default
      const SQL = await initSqlJs({ locateFile: (f: string) => runtimeUrl(`sql/${f}`) })
      const d = new SQL.Database()
      d.run(sqlSeed)
      db.current = d
      readSchema(d)
      setStatus('ready')
      return d
    })()
    return loading.current
  }, [])

  const run = useCallback(
    async (query: string) => {
      const d = await ensure()
      const t0 = performance.now()
      try {
        const res = d.exec(query)
        setLastMs(performance.now() - t0)
        const last = res[res.length - 1]
        if (last) {
          setResult({ columns: last.columns, rows: last.values as SqlResult['rows'] })
          setMessage(null)
        } else {
          setResult(null)
          setMessage({ kind: 'ok', text: `OK · ${d.getRowsModified()} row(s) affected` })
        }
        readSchema(d)
      } catch (err) {
        setResult(null)
        setMessage({ kind: 'err', text: err instanceof Error ? err.message : String(err) })
      }
    },
    [ensure],
  )

  const reset = useCallback(async () => {
    db.current?.close()
    db.current = null
    loading.current = null
    setResult(null)
    setMessage(null)
    await ensure()
  }, [ensure])

  return { status, result, message, lastMs, schema, run, reset, ensure }
}
