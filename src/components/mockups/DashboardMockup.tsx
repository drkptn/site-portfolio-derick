import { useId } from 'react'
import { Layer, Stage, Window } from './Stage'

const line = 'M0 120 C 40 112, 60 86, 100 90 S 160 60, 200 70 S 260 30, 300 44 S 360 20, 420 14 S 470 26, 500 10'
const bars = [42, 64, 50, 80, 58, 92, 70]

/** Monochrome dashboard concept (sample data, clearly labelled). */
export function DashboardMockup({ label }: { label: string }) {
  const fillId = `dash-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  return (
    <Stage label={label}>
      <Layer depth={0.6} className="left-0 top-[56px] w-[720px]">
        <Window title="dashboard.pbix — concept">
          <div className="flex">
            {/* Sidebar */}
            <div className="flex w-12 flex-col items-center gap-4 border-r border-white/[0.06] py-5">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={`size-5 rounded-[5px] ${i === 0 ? 'bg-[#d4d4d4]' : 'border border-white/10'}`} />
              ))}
            </div>
            <div className="flex-1 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-medium tracking-[-0.02em] text-[#f5f5f5]">Overview</p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#5f5f5f]">Sample data · concept</p>
                </div>
                <div className="flex gap-2">
                  {['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => (
                    <span
                      key={q}
                      className={`rounded-[5px] px-2 py-1 font-mono text-[10px] ${i === 3 ? 'bg-[#e5e5e5] text-black' : 'border border-white/10 text-[#7a7a7a]'}`}
                    >
                      {q}
                    </span>
                  ))}
                </div>
              </div>

              {/* KPI row */}
              <div className="mb-4 grid grid-cols-4 gap-3">
                {[
                  ['KPI A', '128.4k', '+8.1%'],
                  ['KPI B', '3,912', '+2.4%'],
                  ['KPI C', '32.8', '−0.6%'],
                  ['KPI D', '74%', '+4.0%'],
                ].map(([k, v, d], i) => (
                  <div key={k} className="rounded-[8px] border border-white/[0.07] bg-[#121212] p-3">
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#5f5f5f]">{k}</p>
                    <p className="mt-1.5 text-[19px] font-medium tracking-[-0.03em] text-[#f5f5f5]">{v}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#9a9a9a]">{d}</span>
                      <svg width="44" height="14" fill="none">
                        <path d={i % 2 ? 'M0 10 L10 8 L20 11 L30 5 L44 3' : 'M0 12 L11 9 L22 10 L33 4 L44 6'} stroke="#8a8a8a" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-[1fr_170px] gap-3">
                <div className="rounded-[8px] border border-white/[0.07] bg-[#121212] p-4">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#5f5f5f]">Trend</p>
                  <svg viewBox="0 0 500 140" className="h-[150px] w-full" fill="none">
                    <defs>
                      <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#f5f5f5" stopOpacity="0.22" />
                        <stop offset="1" stopColor="#f5f5f5" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[20, 55, 90, 125].map((y) => (
                      <line key={y} x1="0" x2="500" y1={y} y2={y} stroke="#ffffff" strokeOpacity="0.05" />
                    ))}
                    <path d={`${line} L500 140 L0 140 Z`} fill={`url(#${fillId})`} />
                    <path d={line} stroke="#e5e5e5" strokeWidth="2" />
                    <path d="M0 128 C 60 124, 120 110, 180 112 S 300 96, 360 92 S 460 80, 500 76" stroke="#6b6b6b" strokeWidth="1.5" strokeDasharray="4 5" />
                    <circle cx="300" cy="44" r="5" fill="#0d0d0d" stroke="#f5f5f5" strokeWidth="2" />
                  </svg>
                </div>
                <div className="rounded-[8px] border border-white/[0.07] bg-[#121212] p-4">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#5f5f5f]">By group</p>
                  <div className="flex h-[150px] items-end gap-2">
                    {bars.map((h, i) => (
                      <span
                        key={i}
                        className="flex-1 rounded-t-[3px]"
                        style={{ height: `${h}%`, background: i === 5 ? '#e5e5e5' : 'rgba(255,255,255,0.14)' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Window>
      </Layer>

      {/* Goal donut */}
      <Layer depth={1.6} className="right-0 top-0 w-[250px]">
        <div className="rounded-[12px] border border-white/[0.1] bg-[#111]/95 p-5 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6b6b6b]">Goal progress</p>
          <div className="mt-4 flex items-center gap-4">
            <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
              <circle cx="44" cy="44" r="36" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="8" />
              <circle cx="44" cy="44" r="36" stroke="#e5e5e5" strokeWidth="8" strokeLinecap="round" strokeDasharray="226" strokeDashoffset="63" transform="rotate(-90 44 44)" />
            </svg>
            <div>
              <p className="text-[26px] font-medium tracking-[-0.04em] text-[#f5f5f5]">72%</p>
              <p className="text-[11px] text-[#7a7a7a]">of target</p>
            </div>
          </div>
        </div>
      </Layer>

      {/* Filter / tooltip */}
      <Layer depth={2.2} className="bottom-[10px] right-[40px] w-[240px]">
        <div className="rounded-[10px] border border-white/[0.12] bg-[#e9e9e9] p-4 text-black shadow-[0_30px_60px_-20px_rgb(0_0_0/0.9)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#555]">Filter</p>
          {[
            ['Period', 'Q4'],
            ['Group', 'All'],
            ['View', 'Monthly'],
          ].map(([k, v]) => (
            <div key={k} className="mt-2 flex justify-between border-t border-black/10 pt-2 text-[12px]">
              <span className="text-[#555]">{k}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </div>
      </Layer>
    </Stage>
  )
}
