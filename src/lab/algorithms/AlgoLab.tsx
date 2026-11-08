import { Pause, Play, Shuffle, SkipForward } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/cn'
import { LabFrame, Segmented, ToolButton } from '../LabFrame'
import { ALGORITHMS, makeArray, record, type AlgoId, type Preset } from './sorting'

const copy = {
  en: {
    algorithm: 'Algorithm', size: 'Elements', speed: 'Speed', input: 'Input', random: 'Random', nearly: 'Nearly sorted', reversed: 'Reversed',
    play: 'Play', pause: 'Pause', step: 'Step', shuffle: 'New data', comparisons: 'Comparisons', writes: 'Writes', progress: 'Step',
    best: 'Best', avg: 'Average', worst: 'Worst', space: 'Space', stable: 'Stable', yes: 'yes', no: 'no',
    compared: 'compared', written: 'written', pivot: 'pivot / min', sorted: 'in place', done: 'Sorted ✓',
    chart: 'Array being sorted',
  },
  pt: {
    algorithm: 'Algoritmo', size: 'Elementos', speed: 'Velocidade', input: 'Entrada', random: 'Aleatório', nearly: 'Quase ordenado', reversed: 'Invertido',
    play: 'Iniciar', pause: 'Pausar', step: 'Passo', shuffle: 'Novos dados', comparisons: 'Comparações', writes: 'Escritas', progress: 'Passo',
    best: 'Melhor', avg: 'Médio', worst: 'Pior', space: 'Espaço', stable: 'Estável', yes: 'sim', no: 'não',
    compared: 'comparando', written: 'escrito', pivot: 'pivô / mín', sorted: 'na posição', done: 'Ordenado ✓',
    chart: 'Array sendo ordenado',
  },
}

export default function AlgoLab() {
  const { lang } = useI18n()
  const c = copy[lang]
  const [algo, setAlgo] = useState<AlgoId>('quick')
  const [size, setSize] = useState(32)
  const [speed, setSpeed] = useState(70)
  const [preset, setPreset] = useState<Preset>('random')
  const [seed, setSeed] = useState(0.42)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)

  const input = useMemo(() => makeArray(size, preset, seed), [size, preset, seed])
  const steps = useMemo(() => record(algo, input), [algo, input])
  const step = steps[Math.min(index, steps.length - 1)]
  const info = ALGORITHMS[algo]
  const finished = index >= steps.length - 1

  // Reset playback whenever the recording changes
  useEffect(() => {
    setIndex(0)
    setPlaying(false)
  }, [steps])

  useEffect(() => {
    if (!playing) return
    if (finished) {
      setPlaying(false)
      return
    }
    // speed 1..100 → from ~600ms per frame down to several frames per tick
    const delay = Math.max(16, 600 - speed * 6)
    const jump = speed > 85 ? Math.ceil((speed - 85) / 3) : 1
    const id = window.setTimeout(() => setIndex((i) => Math.min(steps.length - 1, i + jump)), delay)
    return () => window.clearTimeout(id)
  }, [playing, index, speed, finished, steps.length])

  const toggle = useCallback(() => {
    if (finished) setIndex(0)
    setPlaying((p) => !p)
  }, [finished])

  const sorted = new Set(step.sorted)
  const max = Math.max(...step.array)

  return (
    <LabFrame
      file={`${algo}_sort.viz`}
      live={info.name + ' sort'}
      actions={
        <>
          <ToolButton primary onClick={toggle}>
            {playing ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />} {playing ? c.pause : c.play}
          </ToolButton>
          <ToolButton onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))} disabled={finished} label={c.step}>
            <SkipForward size={13} aria-hidden="true" /> <span className="hidden sm:inline">{c.step}</span>
          </ToolButton>
          <ToolButton onClick={() => setSeed(Math.random())} label={c.shuffle}>
            <Shuffle size={13} aria-hidden="true" /> <span className="hidden sm:inline">{c.shuffle}</span>
          </ToolButton>
        </>
      }
      footer={
        <>
          <span>
            {c.progress} {index + 1}/{steps.length}
          </span>
          <span>
            {c.comparisons}: {step.comparisons}
          </span>
          <span>
            {c.writes}: {step.writes}
          </span>
          {finished && <span className="text-ink-900">{c.done}</span>}
        </>
      }
    >
      <div className="no-scrollbar overflow-x-auto border-b border-white/[0.07] px-4 py-2.5">
        <Segmented
          label={c.algorithm}
          value={algo}
          onChange={setAlgo}
          options={(Object.keys(ALGORITHMS) as AlgoId[]).map((id) => ({ value: id, label: ALGORITHMS[id].name }))}
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_20rem]">
        {/* Bars */}
        <div className="border-white/[0.07] p-4 sm:p-5 lg:border-r">
          <div
            role="img"
            aria-label={`${c.chart}: ${step.array.join(', ')}`}
            className="flex h-64 items-end gap-[2px] sm:h-80"
            onClick={toggle}
          >
            {step.array.map((v, i) => {
              const isCompare = step.compare?.includes(i)
              const isWrite = step.write?.includes(i)
              const isPivot = step.pivot === i
              return (
                <span key={i} className="relative flex h-full flex-1 items-end">
                  {(isCompare || isWrite) && <span className="absolute -top-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-ink-950" aria-hidden="true" />}
                  <span
                    className={cn(
                      'w-full rounded-t-[3px] transition-[height,background-color] duration-150',
                      isWrite ? 'bg-ink-950' : isCompare ? 'bg-frost' : isPivot ? 'bg-ink-600 outline-1 outline-dashed outline-offset-1 outline-ink-900' : sorted.has(i) ? 'bg-ink-700' : 'bg-ink-300',
                    )}
                    style={{ height: `${(v / max) * 92}%` }}
                  />
                </span>
              )
            })}
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-ink-600">
            {[
              ['bg-frost', c.compared],
              ['bg-ink-950', c.written],
              ['bg-ink-600 outline-1 outline-dashed outline-ink-900', c.pivot],
              ['bg-ink-700', c.sorted],
            ].map(([cls, label]) => (
              <li key={label} className="flex items-center gap-2">
                <span className={cn('h-3 w-2 rounded-[2px]', cls)} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Controls + pseudo-code */}
        <div className="space-y-5 border-t border-white/[0.07] p-4 sm:p-5 lg:border-t-0">
          <div className="theme-dark-scope overflow-x-auto rounded-[8px] border border-white/[0.08] bg-[#0b0b0b] py-2 font-mono text-[11.5px] leading-[1.7]">
            {info.code.map((line, i) => (
              <div key={i} className={cn('whitespace-pre px-3 transition-colors duration-150', step.line === i ? 'bg-white/10 text-[#f5f5f5]' : 'text-[#7a7a7a]')}>
                <span className="mr-3 select-none text-[#3d3d3d]">{i + 1}</span>
                {line}
              </div>
            ))}
          </div>

          <label className="block">
            <span className="mb-2 flex justify-between">
              <span className="eyebrow text-[0.5625rem]">{c.size}</span>
              <span className="font-mono text-[11px] text-ink-700">{size}</span>
            </span>
            <input type="range" min={8} max={64} value={size} onChange={(e) => setSize(Number(e.target.value))} className="lab-range w-full" />
          </label>
          <label className="block">
            <span className="mb-2 flex justify-between">
              <span className="eyebrow text-[0.5625rem]">{c.speed}</span>
              <span className="font-mono text-[11px] text-ink-700">{speed}</span>
            </span>
            <input type="range" min={1} max={100} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="lab-range w-full" />
          </label>
          <div>
            <p className="eyebrow mb-2 text-[0.5625rem]">{c.input}</p>
            <Segmented label={c.input} value={preset} onChange={setPreset} options={[{ value: 'random', label: c.random }, { value: 'nearly', label: c.nearly }, { value: 'reversed', label: c.reversed }]} />
          </div>

          <dl className="grid grid-cols-3 gap-2 text-center">
            {[
              [c.best, info.best],
              [c.avg, info.avg],
              [c.worst, info.worst],
              [c.space, info.space],
              [c.stable, info.stable ? c.yes : c.no],
            ].map(([k, v]) => (
              <div key={k} className="rounded-[6px] border border-white/[0.07] px-1 py-2">
                <dt className="eyebrow text-[0.5rem]">{k}</dt>
                <dd className="mt-1 whitespace-nowrap font-mono text-[11px] text-ink-900">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </LabFrame>
  )
}
