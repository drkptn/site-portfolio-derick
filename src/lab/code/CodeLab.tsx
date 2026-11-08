import { Database, Play, RotateCcw, Square, Table2, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { CircleLoader } from '@/components/ui/CircleLoader'
import { useI18n } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/cn'
import { LabFrame, Segmented, ToolButton } from '../LabFrame'
import { CodeEditor } from './CodeEditor'
import { pythonSnippets, sqlSnippets } from './snippets'
import { usePython } from './usePython'
import { useSql } from './useSql'

type Lang = 'python' | 'sql'

const copy = {
  en: {
    run: 'Run', stop: 'Stop', reset: 'Reset DB', clear: 'Clear', examples: 'Examples', editor: 'Code editor',
    output: 'Output', results: 'Results', schema: 'Schema', rows: 'rows',
    idlePy: 'Press Run (or Ctrl/⌘ + Enter). The Python runtime (~13 MB) downloads on first use and is cached by your browser.',
    loadingPy: 'Starting Python (WebAssembly)…', runningPy: 'Running…',
    idleSql: 'Press Run to query a real SQLite database seeded with network devices, links and incidents.',
    loadingSql: 'Starting SQLite…', empty: 'Query returned no rows.', edit: 'Edit anything — it’s real code.',
    lang: 'Language',
  },
  pt: {
    run: 'Executar', stop: 'Parar', reset: 'Resetar BD', clear: 'Limpar', examples: 'Exemplos', editor: 'Editor de código',
    output: 'Saída', results: 'Resultado', schema: 'Esquema', rows: 'linhas',
    idlePy: 'Clique em Executar (ou Ctrl/⌘ + Enter). O runtime do Python (~13 MB) é baixado no primeiro uso e fica em cache no navegador.',
    loadingPy: 'Iniciando Python (WebAssembly)…', runningPy: 'Executando…',
    idleSql: 'Clique em Executar para consultar um banco SQLite real com dispositivos, links e incidentes de rede.',
    loadingSql: 'Iniciando SQLite…', empty: 'A consulta não retornou linhas.', edit: 'Edite à vontade — é código de verdade.',
    lang: 'Linguagem',
  },
}

export default function CodeLab() {
  const { lang, l } = useI18n()
  const c = copy[lang]
  const [language, setLanguage] = useState<Lang>('python')
  const [pyId, setPyId] = useState(pythonSnippets[0].id)
  const [sqlId, setSqlId] = useState(sqlSnippets[0].id)
  const [pyCode, setPyCode] = useState(pythonSnippets[0].code)
  const [sqlCode, setSqlCode] = useState(sqlSnippets[0].code)
  const py = usePython()
  const sql = useSql()
  const outRef = useRef<HTMLDivElement>(null)

  const snippets = language === 'python' ? pythonSnippets : sqlSnippets
  const activeId = language === 'python' ? pyId : sqlId
  const code = language === 'python' ? pyCode : sqlCode
  const setCode = language === 'python' ? setPyCode : setSqlCode

  const pick = (id: string) => {
    const s = snippets.find((x) => x.id === id)!
    if (language === 'python') {
      setPyId(id)
      setPyCode(s.code)
    } else {
      setSqlId(id)
      setSqlCode(s.code)
    }
  }

  const run = () => (language === 'python' ? py.run(pyCode) : sql.run(sqlCode))
  const busy = language === 'python' ? py.status === 'loading' || py.status === 'running' : sql.status === 'loading'

  // SQLite is tiny (~0.7 MB): prepare it as soon as the SQL tab opens
  useEffect(() => {
    if (language === 'sql') void sql.ensure()
  }, [language, sql])

  useEffect(() => {
    outRef.current?.scrollTo({ top: outRef.current.scrollHeight })
  }, [py.output])

  const ms = language === 'python' ? py.lastMs : sql.lastMs

  return (
    <LabFrame
      file={language === 'python' ? `${activeId}.py` : `${activeId}.sql`}
      live={language === 'python' ? 'Python' : 'SQLite'}
      actions={
        <>
          <Segmented<Lang>
            label={c.lang}
            value={language}
            onChange={setLanguage}
            options={[
              { value: 'python', label: 'Python' },
              { value: 'sql', label: 'SQL' },
            ]}
          />
          {language === 'python' && py.status === 'running' ? (
            <ToolButton onClick={py.stop}>
              <Square size={13} aria-hidden="true" /> {c.stop}
            </ToolButton>
          ) : (
            <ToolButton primary onClick={run} disabled={busy}>
              {busy ? <CircleLoader size={14} stroke={1.75} /> : <Play size={13} aria-hidden="true" />} {c.run}
            </ToolButton>
          )}
        </>
      }
      footer={
        <>
          <span>{language === 'python' ? `Python ${py.version ? '· Pyodide ' + py.version : '· Pyodide'} · Web Worker` : 'SQLite 3 · sql.js · WebAssembly'}</span>
          {ms !== null && <span>⏱ {ms.toFixed(ms < 10 ? 1 : 0)} ms</span>}
          <span className="hidden sm:inline">Ctrl/⌘ + Enter</span>
        </>
      }
    >
      {/* Examples */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto border-b border-white/[0.07] px-4 py-2.5">
        <span className="eyebrow shrink-0">{c.examples}</span>
        {snippets.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => pick(s.id)}
            aria-pressed={s.id === activeId}
            className={cn(
              'h-8 shrink-0 rounded-[5px] border px-2.5 text-xs transition-colors',
              s.id === activeId ? 'border-ink-600 bg-ink-200/70 text-ink-950' : 'border-ink-200 text-ink-600 hover:text-ink-950',
            )}
          >
            {l(s.title)}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.2fr_1fr]">
        <div className="theme-dark-scope h-[22rem] border-white/[0.07] lg:h-[30rem] lg:border-r" onFocus={language === 'python' ? py.warmUp : undefined}>
          <CodeEditor value={code} onChange={setCode} onRun={run} language={language} label={`${c.editor} — ${language === 'python' ? 'Python' : 'SQL'}`} />
        </div>

        <div className="flex h-[20rem] flex-col border-t border-white/[0.07] lg:h-[30rem] lg:border-t-0">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-2">
            <span className="eyebrow">{language === 'python' ? c.output : c.results}</span>
            {language === 'python' ? (
              <button type="button" onClick={py.clear} className="inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-950">
                <Trash2 size={12} aria-hidden="true" /> {c.clear}
              </button>
            ) : (
              <button type="button" onClick={() => void sql.reset()} className="inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-950">
                <RotateCcw size={12} aria-hidden="true" /> {c.reset}
              </button>
            )}
          </div>

          <div ref={outRef} data-lenis-prevent className="flex-1 overflow-auto overscroll-contain" aria-live="polite">
            {language === 'python' ? (
              <PythonOutput status={py.status} output={py.output} idle={c.idlePy} loading={c.loadingPy} running={c.runningPy} />
            ) : (
              <SqlOutput sql={sql} c={c} />
            )}
          </div>
        </div>
      </div>
      <p className="border-t border-white/[0.07] px-4 py-2 text-xs text-ink-500">↳ {c.edit}</p>
    </LabFrame>
  )
}

function PythonOutput({
  status,
  output,
  idle,
  loading,
  running,
}: {
  status: string
  output: { kind: string; text: string }[]
  idle: string
  loading: string
  running: string
}) {
  if (output.length === 0 && status !== 'loading' && status !== 'running')
    return <p className="p-4 text-sm leading-relaxed text-ink-500">{idle}</p>
  return (
    <pre className="m-0 whitespace-pre-wrap break-words p-4 font-mono text-[12.5px] leading-[1.65] text-ink-800">
      {output.map((line, i) => (
        <span key={i} className={cn('block', line.kind === 'err' && 'text-ink-950 underline decoration-ink-500/60 decoration-wavy underline-offset-4', line.kind === 'info' && 'text-ink-500')}>
          {line.text}
        </span>
      ))}
      {(status === 'loading' || status === 'running') && (
        <span className="mt-2 flex items-center gap-2 text-ink-500">
          <CircleLoader size={14} stroke={1.5} /> {status === 'loading' ? loading : running}
        </span>
      )}
    </pre>
  )
}

function SqlOutput({ sql, c }: { sql: ReturnType<typeof useSql>; c: (typeof copy)['en'] }) {
  if (sql.status === 'loading')
    return (
      <p className="flex items-center gap-2 p-4 text-sm text-ink-500">
        <CircleLoader size={14} stroke={1.5} /> {c.loadingSql}
      </p>
    )
  return (
    <div className="p-4">
      {sql.message && (
        <p className={cn('mb-4 rounded-[6px] border px-3 py-2 font-mono text-xs', sql.message.kind === 'err' ? 'border-ink-500 text-ink-950' : 'border-ink-200 text-ink-600')}>
          {sql.message.text}
        </p>
      )}
      {sql.result ? (
        sql.result.rows.length ? (
          <>
            <div className="overflow-x-auto rounded-[8px] border border-white/[0.08]">
              <table className="w-full border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-ink-100/70">
                    {sql.result.columns.map((col) => (
                      <th key={col} scope="col" className="whitespace-nowrap px-3 py-2 text-left font-medium text-ink-800">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sql.result.rows.map((row, i) => (
                    <tr key={i} className="border-t border-white/[0.06] hover:bg-ink-100/50">
                      {row.map((v, j) => (
                        <td key={j} className={cn('whitespace-nowrap px-3 py-1.5 text-ink-700', typeof v === 'number' && 'text-right tabular-nums')}>
                          {v === null ? <span className="text-ink-500">NULL</span> : String(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 font-mono text-[0.6875rem] text-ink-500">
              {sql.result.rows.length} {c.rows}
            </p>
          </>
        ) : (
          <p className="text-sm text-ink-500">{c.empty}</p>
        )
      ) : (
        !sql.message && <p className="text-sm leading-relaxed text-ink-500">{c.idleSql}</p>
      )}

      {sql.schema.length > 0 && (
        <details className="group mt-5" open={!sql.result}>
          <summary className="eyebrow flex cursor-pointer list-none items-center gap-2 text-ink-600">
            <Database size={12} aria-hidden="true" /> {c.schema}
          </summary>
          <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {sql.schema.map((t) => (
              <div key={t.name} className="rounded-[8px] border border-white/[0.08] p-2.5">
                <p className="mb-1.5 flex items-center justify-between font-mono text-xs text-ink-900">
                  <span className="flex items-center gap-1.5">
                    <Table2 size={12} aria-hidden="true" /> {t.name}
                  </span>
                  <span className="text-ink-500">{t.count}</span>
                </p>
                {t.columns.map((col) => (
                  <p key={col.name} className="flex justify-between font-mono text-[0.6875rem] text-ink-500">
                    <span className={col.pk ? 'text-ink-800' : undefined}>{col.name}</span>
                    <span>{col.pk ? 'PK' : col.type}</span>
                  </p>
                ))}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
