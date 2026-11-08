import { motion, useReducedMotion } from 'motion/react'
import { ArrowLeftRight, Database, Play, Plus, RotateCcw, Shuffle, Table2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useI18n } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/cn'
import { LabFrame, Segmented, ToolButton } from '../LabFrame'
import { highlight } from './highlight'
import { LINKS, NODE_POS, SITES, TYPES, deviceById } from './network'
import {
  DAYS,
  initialInventory,
  initialTraffic,
  inventorySource,
  routeNodes,
  routeSource,
  runInventory,
  runRoute,
  runStats,
  shortestPath,
  statsSource,
  type InvDevice,
} from './programs'
import { TABLES, devicesQuery, incidentsQuery, linksQuery, perSiteQuery, type DeviceFilters, type QueryResult } from './queries'

const copy = {
  en: {
    lang: 'Language', run: 'Run', inputs: 'Inputs', output: 'Terminal', code: 'Source', live: 'The code follows the controls',
    idle: 'Adjust the inputs and press Run.', inventory: 'Network inventory', route: 'Shortest route', stats: 'Traffic stats',
    hostname: 'hostname', add: 'Add', remove: 'Remove', online: 'online', offline: 'offline', invalid: 'Use 3–14 chars: a-z, 0-9 and “-”, not repeated.',
    from: 'From', to: 'To', swap: 'Swap', clickNode: 'Tip: tap a node to set the destination.', latency: 'ms',
    typical: 'Typical week', random: 'Random', reset: 'Reset',
    query: 'Query', devices: 'Devices', perSite: 'Per site', links: 'Slowest links', incidents: 'Incidents',
    site: 'Site', type: 'Type', status: 'Status', order: 'Order by', all: 'All', limit: 'Limit', minBw: 'Min. bandwidth',
    onlyOffline: 'Only sites with offline devices', open: 'Open', severity: 'Severity', results: 'Results', rows: 'rows', schema: 'Schema', empty: 'No rows match.',
  },
  pt: {
    lang: 'Linguagem', run: 'Executar', inputs: 'Entradas', output: 'Terminal', code: 'Código', live: 'O código acompanha os controles',
    idle: 'Ajuste as entradas e clique em Executar.', inventory: 'Inventário de rede', route: 'Menor rota', stats: 'Estatísticas de tráfego',
    hostname: 'hostname', add: 'Adicionar', remove: 'Remover', online: 'online', offline: 'offline', invalid: 'Use 3–14 caracteres: a-z, 0-9 e “-”, sem repetir.',
    from: 'Origem', to: 'Destino', swap: 'Inverter', clickNode: 'Dica: toque num nó para defini-lo como destino.', latency: 'ms',
    typical: 'Semana típica', random: 'Aleatório', reset: 'Restaurar',
    query: 'Consulta', devices: 'Dispositivos', perSite: 'Por local', links: 'Links mais lentos', incidents: 'Incidentes',
    site: 'Local', type: 'Tipo', status: 'Status', order: 'Ordenar por', all: 'Todos', limit: 'Limite', minBw: 'Banda mínima',
    onlyOffline: 'Só locais com equipamento offline', open: 'Abertos', severity: 'Severidade', results: 'Resultado', rows: 'linhas', schema: 'Esquema', empty: 'Nenhuma linha encontrada.',
  },
}
type Copy = (typeof copy)['en']

export default function CodeLab() {
  const { lang } = useI18n()
  const c = copy[lang]
  const [language, setLanguage] = useState<'python' | 'sql'>('python')
  const [file, setFile] = useState('inventory.py')

  return (
    <LabFrame
      file={language === 'python' ? file : 'query.sql'}
      live={language === 'python' ? 'Python' : 'SQL'}
      actions={
        <Segmented
          label={c.lang}
          value={language}
          onChange={setLanguage}
          options={[
            { value: 'python', label: 'Python' },
            { value: 'sql', label: 'SQL' },
          ]}
        />
      }
    >
      {language === 'python' ? <PythonLab c={c} onFile={setFile} /> : <SqlLab c={c} />}
    </LabFrame>
  )
}

/* ================================================================ Python */

type Program = 'inventory' | 'route' | 'stats'
const FILES: Record<Program, string> = { inventory: 'inventory.py', route: 'shortest_route.py', stats: 'stats.py' }

function PythonLab({ c, onFile }: { c: Copy; onFile: (f: string) => void }) {
  const [program, setProgram] = useState<Program>('inventory')
  const [items, setItems] = useState<InvDevice[]>(initialInventory)
  const [from, setFrom] = useState('ap-lab-02')
  const [to, setTo] = useState('srv-db-01')
  const [traffic, setTraffic] = useState(initialTraffic)
  const [output, setOutput] = useState<string[] | null>(null)
  const [runId, setRunId] = useState(0)

  useEffect(() => {
    onFile(FILES[program])
    setOutput(null)
  }, [program, onFile])

  const source = program === 'inventory' ? inventorySource(items) : program === 'route' ? routeSource(from, to) : statsSource(traffic)
  const run = () => {
    setOutput(program === 'inventory' ? runInventory(items) : program === 'route' ? runRoute(from, to) : runStats(traffic))
    setRunId((n) => n + 1)
  }

  return (
    <>
      <Chips
        value={program}
        onChange={setProgram}
        options={[
          { value: 'inventory', label: c.inventory },
          { value: 'route', label: c.route },
          { value: 'stats', label: c.stats },
        ]}
      />
      <div className="grid lg:grid-cols-[1fr_1.1fr]">
        <div className="min-w-0 border-white/[0.07] lg:border-r">
          <div className="p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="eyebrow">{c.inputs}</p>
              <ToolButton primary onClick={run}>
                <Play size={13} aria-hidden="true" /> {c.run}
              </ToolButton>
            </div>
            {program === 'inventory' && <InventoryInputs c={c} items={items} setItems={setItems} />}
            {program === 'route' && <RouteInputs c={c} from={from} to={to} setFrom={setFrom} setTo={setTo} />}
            {program === 'stats' && <StatsInputs c={c} values={traffic} setValues={setTraffic} />}
          </div>
          <Terminal key={runId} c={c} command={`python ${FILES[program]}`} lines={output} />
        </div>
        <div className="min-w-0 border-t border-white/[0.07] lg:border-t-0">
          <p className="eyebrow flex items-center justify-between border-b border-white/[0.07] px-4 py-2.5">
            <span>{c.code}</span>
            <span className="normal-case tracking-normal text-ink-500">↳ {c.live}</span>
          </p>
          <CodeView code={source} lang="python" className="h-[24rem] lg:h-[40rem]" />
        </div>
      </div>
    </>
  )
}

function InventoryInputs({ c, items, setItems }: { c: Copy; items: InvDevice[]; setItems: (f: (i: InvDevice[]) => InvDevice[]) => void }) {
  const [hostname, setHostname] = useState('')
  const [type, setType] = useState<InvDevice['type']>('server')
  const [site, setSite] = useState<InvDevice['site']>('Campinas')
  const [error, setError] = useState(false)

  const add = (e: FormEvent) => {
    e.preventDefault()
    const h = hostname.trim().toLowerCase()
    if (!/^[a-z0-9-]{3,14}$/.test(h) || items.some((d) => d.hostname === h)) {
      setError(true)
      return
    }
    setItems((list) => [...list, { hostname: h, type, site, online: true }])
    setHostname('')
    setError(false)
  }

  return (
    <div>
      <ul data-lenis-prevent className="max-h-56 space-y-1 overflow-auto pr-1">
        {items.map((d) => (
          <li key={d.hostname} className="flex items-center gap-2 rounded-[6px] border border-white/[0.07] bg-ink-50/50 px-2.5 py-1.5">
            <button
              type="button"
              onClick={() => setItems((list) => list.map((x) => (x.hostname === d.hostname ? { ...x, online: !x.online } : x)))}
              aria-pressed={d.online}
              aria-label={`${d.hostname}: ${d.online ? c.online : c.offline}`}
              className={cn('flex h-6 w-16 shrink-0 items-center justify-center gap-1 rounded-full border font-mono text-[10px]', d.online ? 'border-ink-600 text-ink-900' : 'border-dashed border-ink-400 text-ink-500')}
            >
              {d.online ? '●' : '○'} {d.online ? c.online : c.offline}
            </button>
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-ink-900">{d.hostname}</span>
            <span className="hidden font-mono text-[10px] text-ink-500 sm:inline">{d.type}</span>
            <span className="truncate text-[11px] text-ink-500">{d.site}</span>
            <button type="button" onClick={() => setItems((list) => list.filter((x) => x.hostname !== d.hostname))} aria-label={`${c.remove} ${d.hostname}`} className="text-ink-500 hover:text-ink-950">
              <X size={14} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-[1.2fr_1fr_1fr_auto]">
        <input
          value={hostname}
          onChange={(e) => {
            setHostname(e.target.value)
            setError(false)
          }}
          placeholder="nas-backup-01"
          aria-label={c.hostname}
          aria-invalid={error}
          className="col-span-2 h-9 rounded-[6px] border border-ink-200 bg-ink-100 px-2.5 font-mono text-base text-ink-900 outline-none placeholder:text-ink-400 focus:border-ink-600 aria-[invalid=true]:border-ink-950 sm:col-span-1 sm:text-xs"
        />
        <Select value={type} onChange={(v) => setType(v as InvDevice['type'])} options={TYPES} label="type" />
        <Select value={site} onChange={(v) => setSite(v as InvDevice['site'])} options={SITES} label="site" />
        <button type="submit" className="col-span-2 inline-flex h-9 items-center justify-center gap-1.5 rounded-[6px] border border-ink-300 px-3 text-xs text-ink-900 hover:border-ink-600 sm:col-span-1">
          <Plus size={13} aria-hidden="true" /> {c.add}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-ink-700">{c.invalid}</p>}
    </div>
  )
}

function RouteInputs({ c, from, to, setFrom, setTo }: { c: Copy; from: string; to: string; setFrom: (s: string) => void; setTo: (s: string) => void }) {
  const { path } = useMemo(() => shortestPath(from, to), [from, to])
  const onPath = (a: string, b: string) => path.some((n, i) => (n === a && path[i + 1] === b) || (n === b && path[i + 1] === a))
  const byName = (name: string) => LINKS.flatMap((l) => [l.source, l.target]).map(deviceById).find((d) => d.hostname === name)!

  return (
    <div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <label className="min-w-0">
          <span className="eyebrow mb-1.5 block text-[0.5625rem]">{c.from}</span>
          <Select value={from} onChange={setFrom} options={routeNodes} label={c.from} />
        </label>
        <button
          type="button"
          onClick={() => {
            setFrom(to)
            setTo(from)
          }}
          aria-label={c.swap}
          className="mb-0.5 flex size-9 items-center justify-center rounded-[6px] border border-ink-200 text-ink-700 hover:text-ink-950"
        >
          <ArrowLeftRight size={14} aria-hidden="true" />
        </button>
        <label className="min-w-0">
          <span className="eyebrow mb-1.5 block text-[0.5625rem]">{c.to}</span>
          <Select value={to} onChange={setTo} options={routeNodes} label={c.to} />
        </label>
      </div>

      <svg viewBox="-10 -10 640 330" className="mt-3 w-full rounded-[8px] border border-white/[0.07] bg-ink-50/50" role="img" aria-label={path.join(' → ')}>
        {LINKS.map((l, i) => {
          const a = deviceById(l.source)
          const b = deviceById(l.target)
          const [x1, y1] = NODE_POS[a.id]
          const [x2, y2] = NODE_POS[b.id]
          const active = onPath(a.hostname, b.hostname)
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={active ? 'var(--color-ink-950)' : 'var(--color-ink-300)'} strokeWidth={active ? 3 : 1.5} strokeDasharray={active ? undefined : '4 4'} className="transition-all duration-500" />
              <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 7} textAnchor="middle" className={cn('font-mono text-[15px] sm:text-[12px]', active ? 'fill-ink-950' : 'fill-ink-500')}>
                {l.latency}
                {c.latency}
              </text>
            </g>
          )
        })}
        {routeNodes.map((name) => {
          const d = byName(name)
          const [x, y] = NODE_POS[d.id]
          const isEnd = name === from || name === to
          const inPath = path.includes(name)
          return (
            <g key={name} onClick={() => name !== from && setTo(name)} className="cursor-pointer">
              <circle cx={x} cy={y} r={isEnd ? 12 : 8} fill={isEnd ? 'var(--color-ink-950)' : inPath ? 'var(--color-ink-700)' : 'var(--color-ink-75)'} stroke="var(--color-ink-700)" strokeWidth="1.5" className="transition-all duration-500" />
              <text x={x} y={y + (y > 200 ? 28 : -18)} textAnchor="middle" className={cn('font-mono text-[16px] sm:text-[12px]', inPath ? 'fill-ink-900' : 'fill-ink-500')}>
                {name}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="mt-2 text-xs text-ink-500">{c.clickNode}</p>
    </div>
  )
}

function StatsInputs({ c, values, setValues }: { c: Copy; values: number[]; setValues: (v: number[]) => void }) {
  return (
    <div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {DAYS.map((d, i) => (
          <label key={d} className="flex flex-col gap-1">
            <span className="eyebrow text-center text-[0.5625rem]">{d}</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={999}
              value={values[i]}
              onChange={(e) => {
                const next = [...values]
                next[i] = Math.max(0, Math.min(999, Math.round(Number(e.target.value) || 0)))
                setValues(next)
              }}
              className="h-10 w-full rounded-[6px] border border-ink-200 bg-ink-100 text-center font-mono text-base text-ink-900 outline-none focus:border-ink-600 sm:text-sm"
            />
          </label>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <ToolButton onClick={() => setValues(initialTraffic)}>
          <RotateCcw size={13} aria-hidden="true" /> {c.typical}
        </ToolButton>
        <ToolButton onClick={() => setValues(DAYS.map(() => Math.round(40 + Math.random() * 260)))}>
          <Shuffle size={13} aria-hidden="true" /> {c.random}
        </ToolButton>
      </div>
    </div>
  )
}

/** Terminal that "types" the program output line by line. */
function Terminal({ c, command, lines }: { c: Copy; command: string; lines: string[] | null }) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(reduce ? (lines?.length ?? 0) : 0)
  const ref = useRef<HTMLPreElement>(null)

  useEffect(() => {
    if (!lines || reduce) return
    if (shown >= lines.length) return
    const id = window.setTimeout(() => setShown((n) => n + 1), 45)
    return () => window.clearTimeout(id)
  }, [lines, shown, reduce])

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight })
  }, [shown])

  const visible = lines ? (reduce ? lines : lines.slice(0, shown)) : []
  const finished = lines && visible.length === lines.length
  const failed = lines?.some((l) => l.startsWith('Traceback'))

  return (
    <div className="theme-dark-scope border-t border-white/[0.07] bg-[#0b0b0b]">
      <p className="eyebrow border-b border-white/[0.06] px-4 py-2 text-[#8a8a8a]">{c.output}</p>
      <pre ref={ref} data-lenis-prevent aria-live="polite" className="m-0 h-64 overflow-auto whitespace-pre p-4 font-mono text-[12px] leading-[1.6] text-[#d4d4d4]">
        {lines ? (
          <>
            <span className="text-[#f5f5f5]">$ </span>
            {command}
            {'\n'}
            {visible.map((l, i) => (
              <motion.span key={i} className={cn('block', l.startsWith('Traceback') || l.includes('Error') ? 'text-[#f5f5f5]' : undefined)} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
                {l || ' '}
              </motion.span>
            ))}
            {finished && <span className="mt-2 block text-[#5c5c5c]">{failed ? 'Process exited with code 1' : 'Process finished with exit code 0'}</span>}
            {!finished && <span className="inline-block h-3.5 w-2 animate-pulse bg-[#d4d4d4] align-middle" />}
          </>
        ) : (
          <span className="whitespace-normal text-[#7a7a7a]">{c.idle}</span>
        )}
      </pre>
    </div>
  )
}

/* =================================================================== SQL */

type QueryId = 'devices' | 'perSite' | 'links' | 'incidents'

function SqlLab({ c }: { c: Copy }) {
  const [query, setQuery] = useState<QueryId>('devices')
  const [filters, setFilters] = useState<DeviceFilters>({ site: 'all', type: 'all', status: 'all', order: 'hostname' })
  const [onlyOffline, setOnlyOffline] = useState(false)
  const [limit, setLimit] = useState(5)
  const [minBw, setMinBw] = useState(0)
  const [incStatus, setIncStatus] = useState<'open' | 'all'>('open')
  const [severity, setSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  const result: QueryResult =
    query === 'devices'
      ? devicesQuery(filters)
      : query === 'perSite'
        ? perSiteQuery(onlyOffline)
        : query === 'links'
          ? linksQuery(limit, minBw)
          : incidentsQuery(incStatus, severity)

  return (
    <>
      <Chips
        value={query}
        onChange={setQuery}
        options={[
          { value: 'devices', label: c.devices },
          { value: 'perSite', label: c.perSite },
          { value: 'links', label: c.links },
          { value: 'incidents', label: c.incidents },
        ]}
      />
      <div className="flex flex-wrap items-end gap-3 border-b border-white/[0.07] px-4 py-3">
        {query === 'devices' && (
          <>
            <Labeled label={c.site}>
              <Select value={filters.site} onChange={(v) => setFilters({ ...filters, site: v as DeviceFilters['site'] })} options={['all', ...SITES]} label={c.site} display={(v) => (v === 'all' ? c.all : v)} />
            </Labeled>
            <Labeled label={c.type}>
              <Select value={filters.type} onChange={(v) => setFilters({ ...filters, type: v as DeviceFilters['type'] })} options={['all', ...TYPES]} label={c.type} display={(v) => (v === 'all' ? c.all : v)} />
            </Labeled>
            <Labeled label={c.status}>
              <Segmented label={c.status} value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })} options={[{ value: 'all', label: c.all }, { value: 'online', label: c.online }, { value: 'offline', label: c.offline }]} />
            </Labeled>
            <Labeled label={c.order}>
              <Select value={filters.order} onChange={(v) => setFilters({ ...filters, order: v as DeviceFilters['order'] })} options={['hostname', 'site', 'ip_address']} label={c.order} />
            </Labeled>
          </>
        )}
        {query === 'perSite' && (
          <label className="flex items-center gap-2 text-xs text-ink-700">
            <input type="checkbox" checked={onlyOffline} onChange={(e) => setOnlyOffline(e.target.checked)} className="size-4 accent-[var(--color-ink-900)]" />
            {c.onlyOffline} <span className="font-mono text-ink-500">(HAVING)</span>
          </label>
        )}
        {query === 'links' && (
          <>
            <Labeled label={`${c.limit}: ${limit}`}>
              <input type="range" min={1} max={9} value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="lab-range w-40" />
            </Labeled>
            <Labeled label={c.minBw}>
              <Segmented label={c.minBw} value={String(minBw)} onChange={(v) => setMinBw(Number(v))} options={[{ value: '0', label: c.all }, { value: '1000', label: '≥ 1 Gb' }, { value: '10000', label: '≥ 10 Gb' }]} />
            </Labeled>
          </>
        )}
        {query === 'incidents' && (
          <>
            <Labeled label={c.status}>
              <Segmented label={c.status} value={incStatus} onChange={setIncStatus} options={[{ value: 'open', label: c.open }, { value: 'all', label: c.all }]} />
            </Labeled>
            <Labeled label={c.severity}>
              <Segmented label={c.severity} value={severity} onChange={setSeverity} options={[{ value: 'all', label: c.all }, { value: 'high', label: 'high' }, { value: 'medium', label: 'medium' }, { value: 'low', label: 'low' }]} />
            </Labeled>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_1.15fr]">
        <div className="min-w-0 border-white/[0.07] lg:border-r">
          <CodeView code={result.sql} lang="sql" className="h-auto min-h-[12rem] lg:h-full" />
        </div>
        <div className="min-w-0 border-t border-white/[0.07] p-4 lg:border-t-0">
          <p className="eyebrow mb-3 flex items-center justify-between">
            <span>{c.results}</span>
            <span className="normal-case tracking-normal">
              {result.rows.length} {c.rows}
            </span>
          </p>
          {result.rows.length ? (
            <motion.div key={result.sql} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="overflow-x-auto rounded-[8px] border border-white/[0.08]">
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="bg-ink-100/70">
                    {result.columns.map((col) => (
                      <th key={col} scope="col" className="whitespace-nowrap px-3 py-2 text-left font-medium text-ink-800">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={i} className="border-t border-white/[0.06] hover:bg-ink-100/50">
                      {row.map((v, j) => (
                        <td key={j} className={cn('whitespace-nowrap px-3 py-1.5 text-ink-700', typeof v === 'number' && 'text-right tabular-nums')}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <p className="text-sm text-ink-500">{c.empty}</p>
          )}
          <p className="eyebrow mb-2 mt-6 flex items-center gap-2">
            <Database size={12} aria-hidden="true" /> {c.schema}
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {TABLES.map((t) => (
              <div key={t.name} className="rounded-[8px] border border-white/[0.08] p-2.5">
                <p className="mb-1.5 flex items-center justify-between font-mono text-xs text-ink-900">
                  <span className="flex items-center gap-1.5">
                    <Table2 size={12} aria-hidden="true" /> {t.name}
                  </span>
                  <span className="text-ink-500">{t.count}</span>
                </p>
                {t.columns.map((col) => (
                  <p key={col} className="font-mono text-[0.6875rem] text-ink-500">
                    {col}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

/* ================================================================ shared */

function CodeView({ code, lang, className }: { code: string; lang: 'python' | 'sql'; className?: string }) {
  const html = useMemo(() => highlight(code, lang), [code, lang])
  const lines = code.split('\n').length
  return (
    <div data-lenis-prevent className={cn('code-editor theme-dark-scope overflow-auto overscroll-contain bg-[#0b0b0b]', className)}>
      <div className="flex min-h-full w-max min-w-full font-mono text-[12.5px] leading-[1.65]">
        <div aria-hidden="true" className="sticky left-0 select-none border-r border-white/[0.06] bg-[#0b0b0b] px-3 py-4 text-right text-[#3f3f3f]">
          {Array.from({ length: lines }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="m-0 whitespace-pre px-4 py-4 text-[#bdbdbd]" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  )
}

function Chips<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-white/[0.07] px-4 py-2.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={o.value === value}
          className={cn(
            'h-8 shrink-0 rounded-[5px] border px-2.5 text-xs transition-colors',
            o.value === value ? 'border-ink-600 bg-ink-200/70 text-ink-950' : 'border-ink-200 text-ink-600 hover:text-ink-950',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Select({ value, onChange, options, label, display }: { value: string; onChange: (v: string) => void; options: readonly string[]; label: string; display?: (v: string) => string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="h-9 w-full min-w-0 rounded-[6px] border border-ink-200 bg-ink-100 px-2 font-mono text-base text-ink-900 sm:text-xs"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {display ? display(o) : o}
        </option>
      ))}
    </select>
  )
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-1.5 text-[0.5625rem]">{label}</p>
      {children}
    </div>
  )
}
