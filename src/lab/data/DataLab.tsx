import { Download, FileUp, RotateCcw, Table2, X } from 'lucide-react'
import { useMemo, useState, type ChangeEvent, type DragEvent } from 'react'
import { useI18n } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/cn'
import { LabFrame, Segmented, ToolButton } from '../LabFrame'
import { BarList, LineChart, type Point } from './charts'
import { numericColumns, parseCsv, stats, toNumber, type ParsedCsv } from './csv'
import { CATEGORIES, MONTHS, REGIONS, rows, toCsv, type Category, type Region } from './dataset'

const copy = {
  en: {
    dashboard: 'Dashboard', csv: 'Your CSV', mode: 'Mode', sample: 'Synthetic sample data',
    region: 'Region', all: 'All', category: 'Category', metric: 'Metric', revenue: 'Revenue', orders: 'Orders',
    period: 'Period', last6: 'Last 6 mo', last12: '12 months',
    total: 'Total', avg: 'Monthly average', best: 'Best month', change: 'vs previous period',
    trend: 'Monthly trend', byRegion: 'By region — click to filter', share: 'Share by category',
    table: 'Table', chart: 'Charts', export: 'Export CSV', clear: 'Clear filter',
    drop: 'Drop a .csv file here or click to choose', private: 'Your file is processed only in your browser — nothing is uploaded.',
    trySample: 'Try with the sample file', labelCol: 'Label column', valueCol: 'Value column',
    count: 'Rows', sum: 'Sum', mean: 'Mean', median: 'Median', min: 'Min', max: 'Max',
    top: 'Top values (summed by label)', preview: 'Preview', noNumeric: 'No numeric column found in this file.',
    another: 'Load another file', month: 'Month',
  },
  pt: {
    dashboard: 'Dashboard', csv: 'Seu CSV', mode: 'Modo', sample: 'Dados sintéticos de amostra',
    region: 'Região', all: 'Todas', category: 'Categoria', metric: 'Métrica', revenue: 'Receita', orders: 'Pedidos',
    period: 'Período', last6: 'Últimos 6 m', last12: '12 meses',
    total: 'Total', avg: 'Média mensal', best: 'Melhor mês', change: 'vs período anterior',
    trend: 'Tendência mensal', byRegion: 'Por região — clique para filtrar', share: 'Participação por categoria',
    table: 'Tabela', chart: 'Gráficos', export: 'Exportar CSV', clear: 'Limpar filtro',
    drop: 'Solte um arquivo .csv aqui ou clique para escolher', private: 'Seu arquivo é processado só no seu navegador — nada é enviado.',
    trySample: 'Testar com o arquivo de exemplo', labelCol: 'Coluna de rótulo', valueCol: 'Coluna de valor',
    count: 'Linhas', sum: 'Soma', mean: 'Média', median: 'Mediana', min: 'Mín', max: 'Máx',
    top: 'Maiores valores (somados por rótulo)', preview: 'Prévia', noNumeric: 'Nenhuma coluna numérica encontrada no arquivo.',
    another: 'Carregar outro arquivo', month: 'Mês',
  },
}

type Metric = 'revenue' | 'orders'

export default function DataLab() {
  const { lang } = useI18n()
  const c = copy[lang]
  const [mode, setMode] = useState<'dashboard' | 'csv'>('dashboard')
  const locale = lang === 'pt' ? 'pt-BR' : 'en-US'
  const monthLabels = useMemo(
    () => Array.from({ length: MONTHS }, (_, m) => new Intl.DateTimeFormat(locale, { month: 'short' }).format(new Date(2026, m, 1)).replace('.', '')),
    [locale],
  )

  return (
    <LabFrame
      file={mode === 'dashboard' ? 'dashboard.live' : 'upload.csv'}
      live={c.sample}
      actions={
        <Segmented
          label={c.mode}
          value={mode}
          onChange={setMode}
          options={[
            { value: 'dashboard', label: c.dashboard },
            { value: 'csv', label: c.csv },
          ]}
        />
      }
      footer={<span>{mode === 'dashboard' ? `${rows.length} rows · 12 × ${REGIONS.length} × ${CATEGORIES.length}` : 'CSV · , ; tab · UTF-8'}</span>}
    >
      {mode === 'dashboard' ? <Dashboard c={c} locale={locale} monthLabels={monthLabels} /> : <CsvExplorer c={c} locale={locale} monthLabels={monthLabels} />}
    </LabFrame>
  )
}

/* ------------------------------------------------------------- Dashboard */

function Dashboard({ c, locale, monthLabels }: { c: (typeof copy)['en']; locale: string; monthLabels: string[] }) {
  const [region, setRegion] = useState<Region | null>(null)
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [metric, setMetric] = useState<Metric>('revenue')
  const [period, setPeriod] = useState<6 | 12>(12)
  const [view, setView] = useState<'chart' | 'table'>('chart')

  const fmt = useMemo(() => {
    const compact = new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 })
    const full = new Intl.NumberFormat(locale)
    return {
      axis: (v: number) => (metric === 'revenue' ? `R$${compact.format(v)}` : compact.format(v)),
      value: (v: number) => (metric === 'revenue' ? `R$ ${compact.format(v)}` : full.format(Math.round(v))),
    }
  }, [locale, metric])

  const firstMonth = MONTHS - period
  const filtered = useMemo(
    () => rows.filter((r) => r.month >= firstMonth && (!region || r.region === region) && (category === 'all' || r.category === category)),
    [firstMonth, region, category],
  )

  const monthly: Point[] = useMemo(() => {
    const sums = new Map<number, number>()
    filtered.forEach((r) => sums.set(r.month, (sums.get(r.month) ?? 0) + r[metric]))
    return [...sums.entries()].sort((a, b) => a[0] - b[0]).map(([m, v]) => ({ label: monthLabels[m], value: v }))
  }, [filtered, metric, monthLabels])

  // Region bars ignore the region filter itself, so the selection stays comparable
  const byRegion: Point[] = useMemo(
    () =>
      REGIONS.map((reg) => ({
        label: reg,
        value: rows.filter((r) => r.month >= firstMonth && r.region === reg && (category === 'all' || r.category === category)).reduce((a, r) => a + r[metric], 0),
      })).sort((a, b) => b.value - a.value),
    [firstMonth, category, metric],
  )
  const byCategory: Point[] = useMemo(
    () => CATEGORIES.map((cat) => ({ label: cat, value: filtered.filter((r) => r.category === cat).reduce((a, r) => a + r[metric], 0) })).sort((a, b) => b.value - a.value),
    [filtered, metric],
  )

  const total = monthly.reduce((a, p) => a + p.value, 0)
  const best = monthly.reduce((a, p) => (p.value > a.value ? p : a), monthly[0] ?? { label: '-', value: 0 })
  const half = Math.floor(monthly.length / 2)
  const recent = monthly.slice(half).reduce((a, p) => a + p.value, 0)
  const before = monthly.slice(0, half).reduce((a, p) => a + p.value, 0)
  const change = before ? ((recent - before) / before) * 100 : 0

  const exportCsv = () => {
    const blob = new Blob([toCsv(filtered, monthLabels)], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `dashboard-${metric}-${region ?? 'all'}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="p-4 sm:p-5">
      {/* Filters — one row above the charts */}
      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          label={c.category}
          value={category}
          onChange={setCategory}
          options={[{ value: 'all', label: c.all }, ...CATEGORIES.map((x) => ({ value: x, label: x }))]}
        />
        <Segmented label={c.metric} value={metric} onChange={setMetric} options={[{ value: 'revenue', label: c.revenue }, { value: 'orders', label: c.orders }]} />
        <Segmented label={c.period} value={String(period) as '6' | '12'} onChange={(v) => setPeriod(Number(v) as 6 | 12)} options={[{ value: '6', label: c.last6 }, { value: '12', label: c.last12 }]} />
        {region && (
          <button type="button" onClick={() => setRegion(null)} className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border border-ink-500 bg-ink-200 px-3 text-xs text-ink-950">
            {region} <X size={12} aria-label={c.clear} />
          </button>
        )}
        <div className="ml-auto flex gap-2">
          <ToolButton onClick={() => setView(view === 'chart' ? 'table' : 'chart')} pressed={view === 'table'}>
            <Table2 size={13} aria-hidden="true" /> {view === 'chart' ? c.table : c.chart}
          </ToolButton>
          <ToolButton onClick={exportCsv}>
            <Download size={13} aria-hidden="true" /> {c.export}
          </ToolButton>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {[
          [c.total, fmt.value(total)],
          [c.avg, fmt.value(total / Math.max(1, monthly.length))],
          [c.best, `${best.label} · ${fmt.value(best.value)}`],
          [c.change, `${change >= 0 ? '▲' : '▼'} ${Math.abs(change).toFixed(1)}%`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-[8px] border border-white/[0.07] bg-ink-50/60 p-3.5">
            <p className="eyebrow text-[0.5625rem]">{k}</p>
            <p className="mt-2 text-lg font-medium tracking-[-0.03em] text-ink-950 tabular-nums sm:text-xl">{v}</p>
          </div>
        ))}
      </div>

      {view === 'chart' ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-[8px] border border-white/[0.07] p-3.5">
            <p className="eyebrow mb-2">
              {c.trend} · {metric === 'revenue' ? c.revenue : c.orders}
              {region ? ` · ${region}` : ''}
            </p>
            <LineChart data={monthly} format={fmt.axis} label={`${c.trend}: ${monthly.map((p) => `${p.label} ${fmt.value(p.value)}`).join(', ')}`} />
          </div>
          <div className="grid gap-3">
            <div className="rounded-[8px] border border-white/[0.07] p-3.5">
              <p className="eyebrow mb-3">{c.byRegion}</p>
              <BarList data={byRegion} format={fmt.value} selected={region} onSelect={(r) => setRegion(region === r ? null : (r as Region))} label={c.byRegion} />
            </div>
            <div className="rounded-[8px] border border-white/[0.07] p-3.5">
              <p className="eyebrow mb-3">{c.share}</p>
              <BarList data={byCategory} format={fmt.value} share label={c.share} />
            </div>
          </div>
        </div>
      ) : (
        <div data-lenis-prevent className="mt-4 max-h-[26rem] overflow-auto rounded-[8px] border border-white/[0.07]">
          <table className="w-full font-mono text-xs">
            <thead className="sticky top-0 bg-ink-100">
              <tr>
                <th scope="col" className="px-3 py-2 text-left font-medium text-ink-800">{c.month}</th>
                <th scope="col" className="px-3 py-2 text-right font-medium text-ink-800">{metric === 'revenue' ? c.revenue : c.orders}</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((p) => (
                <tr key={p.label} className="border-t border-white/[0.06]">
                  <td className="px-3 py-1.5 text-ink-700">{p.label}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-ink-700">{fmt.value(p.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------- CSV explorer */

function CsvExplorer({ c, locale, monthLabels }: { c: (typeof copy)['en']; locale: string; monthLabels: string[] }) {
  const [csv, setCsv] = useState<ParsedCsv | null>(null)
  const [name, setName] = useState('')
  const [labelCol, setLabelCol] = useState(0)
  const [valueCol, setValueCol] = useState(0)
  const [dragging, setDragging] = useState(false)
  const nf = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale])
  const compact = useMemo(() => new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }), [locale])

  const load = (text: string, fileName: string) => {
    const parsed = parseCsv(text)
    const nums = numericColumns(parsed)
    setCsv(parsed)
    setName(fileName)
    setValueCol(nums[0] ?? 0)
    setLabelCol(parsed.headers.findIndex((_, i) => !nums.includes(i)) >= 0 ? parsed.headers.findIndex((_, i) => !nums.includes(i)) : 0)
  }
  const readFile = (file?: File) => file && file.text().then((t) => load(t, file.name))
  const onInput = (e: ChangeEvent<HTMLInputElement>) => readFile(e.target.files?.[0])
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    readFile(e.dataTransfer.files?.[0])
  }

  const nums = csv ? numericColumns(csv) : []
  const values = csv ? csv.rows.map((r) => toNumber(r[valueCol] ?? '')).filter((v): v is number => v !== null) : []
  const s = stats(values)
  const top: Point[] = useMemo(() => {
    if (!csv) return []
    const agg = new Map<string, number>()
    csv.rows.forEach((r) => {
      const v = toNumber(r[valueCol] ?? '')
      if (v !== null) agg.set(r[labelCol] || '—', (agg.get(r[labelCol] || '—') ?? 0) + v)
    })
    return [...agg.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 12)
  }, [csv, labelCol, valueCol])

  if (!csv)
    return (
      <div className="p-4 sm:p-5">
        <label
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            'flex min-h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-[10px] border border-dashed p-8 text-center transition-colors',
            dragging ? 'border-ink-900 bg-ink-100' : 'border-ink-300 hover:border-ink-500',
          )}
        >
          <span className="flex size-12 items-center justify-center rounded-full border border-ink-300 text-ink-700">
            <FileUp size={20} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="text-sm text-ink-800">{c.drop}</span>
          <span className="max-w-[40ch] text-xs text-ink-500">{c.private}</span>
          <input type="file" accept=".csv,text/csv" onChange={onInput} className="sr-only" />
        </label>
        <div className="mt-3 flex justify-center">
          <ToolButton onClick={() => load(toCsv(rows, monthLabels), 'sample-sales.csv')}>{c.trySample}</ToolButton>
        </div>
      </div>
    )

  return (
    <div className="p-4 sm:p-5">
      <div className="flex flex-wrap items-end gap-3">
        <p className="mr-auto font-mono text-xs text-ink-600">
          {name} · {csv.rows.length} × {csv.headers.length}
        </p>
        <Select label={c.labelCol} value={labelCol} onChange={setLabelCol} options={csv.headers} />
        <Select label={c.valueCol} value={valueCol} onChange={setValueCol} options={csv.headers} only={nums} />
        <ToolButton onClick={() => setCsv(null)}>
          <RotateCcw size={13} aria-hidden="true" /> {c.another}
        </ToolButton>
      </div>

      {nums.length === 0 ? (
        <p className="mt-6 text-sm text-ink-600">{c.noNumeric}</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2 lg:grid-cols-6">
            {(
              [
                [c.count, nf.format(s.count)],
                [c.sum, compact.format(s.sum)],
                [c.mean, compact.format(s.mean)],
                [c.median, compact.format(s.median)],
                [c.min, compact.format(s.min)],
                [c.max, compact.format(s.max)],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="rounded-[8px] border border-white/[0.07] bg-ink-50/60 p-3">
                <p className="eyebrow text-[0.5625rem]">{k}</p>
                <p className="mt-1.5 font-medium tabular-nums text-ink-950">{v}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-[8px] border border-white/[0.07] p-3.5">
              <p className="eyebrow mb-3">{c.top}</p>
              <BarList data={top} format={(v) => compact.format(v)} label={c.top} />
            </div>
            <div className="rounded-[8px] border border-white/[0.07]">
              <p className="eyebrow border-b border-white/[0.07] px-3.5 py-2.5">{c.preview}</p>
              <div data-lenis-prevent className="max-h-80 overflow-auto">
                <table className="w-full font-mono text-[11px]">
                  <thead className="sticky top-0 bg-ink-100">
                    <tr>
                      {csv.headers.map((h, i) => (
                        <th key={i} scope="col" className={cn('whitespace-nowrap px-3 py-2 text-left font-medium', i === valueCol || i === labelCol ? 'text-ink-950' : 'text-ink-600')}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csv.rows.slice(0, 50).map((r, i) => (
                      <tr key={i} className="border-t border-white/[0.06]">
                        {csv.headers.map((_, j) => (
                          <td key={j} className="whitespace-nowrap px-3 py-1 text-ink-700">
                            {r[j]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Select({ label, value, onChange, options, only }: { label: string; value: number; onChange: (v: number) => void; options: string[]; only?: number[] }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="eyebrow text-[0.5625rem]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 rounded-[6px] border border-ink-200 bg-ink-100 px-2 text-base text-ink-900 sm:text-xs"
      >
        {options.map((o, i) => (!only || only.includes(i) ? <option key={i} value={i}>{o}</option> : null))}
      </select>
    </label>
  )
}
