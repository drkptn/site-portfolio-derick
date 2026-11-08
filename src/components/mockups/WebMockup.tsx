import { Layer, Stage } from './Stage'

/** Browser + design-tool layers panel + mobile frame: from prototype to responsive site. */
export function WebMockup({ label }: { label: string }) {
  return (
    <Stage label={label}>
      {/* Browser */}
      <Layer depth={0.6} className="left-[150px] top-[20px] w-[640px]">
        <div className="overflow-hidden rounded-[12px] border border-white/[0.09] bg-[#0d0d0d] shadow-[0_40px_90px_-30px_rgb(0_0_0/0.95)]">
          <div className="flex h-9 items-center gap-3 border-b border-white/[0.07] bg-[#121212] px-3.5">
            <span className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-[#3a3a3a]" />
              <span className="size-2.5 rounded-full bg-[#2c2c2c]" />
              <span className="size-2.5 rounded-full bg-[#2c2c2c]" />
            </span>
            <span className="mx-auto flex h-6 w-64 items-center justify-center rounded-[5px] bg-[#1a1a1a] font-mono text-[10.5px] text-[#7a7a7a]">
              localhost:5173
            </span>
          </div>
          <div className="p-6">
            {/* Site nav */}
            <div className="flex items-center justify-between">
              <span className="h-4 w-14 rounded-[3px] bg-[#e5e5e5]" />
              <span className="flex gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="h-1.5 w-9 rounded-full bg-white/15" />
                ))}
              </span>
              <span className="h-6 w-16 rounded-[4px] bg-[#e5e5e5]" />
            </div>
            {/* Hero */}
            <div className="mt-10 grid grid-cols-[1.2fr_1fr] items-center gap-6">
              <div className="relative">
                <p className="text-[38px] font-medium leading-[0.95] tracking-[-0.05em] text-[#f5f5f5]">
                  Hello,
                  <br />
                  <span className="text-[#7a7a7a]">responsive</span> web.
                </p>
                {/* Selection box */}
                <span className="absolute -inset-2 rounded-[2px] border border-[#9fb2c9]">
                  {['-left-1 -top-1', '-right-1 -top-1', '-bottom-1 -left-1', '-bottom-1 -right-1'].map((p) => (
                    <span key={p} className={`absolute ${p} size-2 border border-[#9fb2c9] bg-[#0d0d0d]`} />
                  ))}
                  <span className="absolute -top-6 left-0 rounded-[3px] bg-[#9fb2c9] px-1.5 py-0.5 font-mono text-[9.5px] text-black">
                    H1 · 38 / 0.95
                  </span>
                </span>
                <div className="mt-6 flex gap-2">
                  <span className="h-7 w-24 rounded-[4px] bg-[#e5e5e5]" />
                  <span className="h-7 w-20 rounded-[4px] border border-white/15" />
                </div>
              </div>
              <div className="diagonal-hatch aspect-[4/3] rounded-[8px] border border-white/10" />
            </div>
            {/* Cards */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-[8px] border border-white/[0.08] bg-[#121212] p-3">
                  <span className="block size-5 rounded-[4px] border border-white/15" />
                  <span className="mt-3 block h-2 w-3/4 rounded-full bg-white/25" />
                  <span className="mt-2 block h-1.5 w-full rounded-full bg-white/10" />
                  <span className="mt-1.5 block h-1.5 w-2/3 rounded-full bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layer>

      {/* Layers panel */}
      <Layer depth={1.5} className="left-0 top-[170px] w-[210px]">
        <div className="overflow-hidden rounded-[10px] border border-white/[0.1] bg-[#141414] shadow-[0_30px_70px_-25px_rgb(0_0_0/0.95)]">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-3.5 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[#8a8a8a]">
            Layers
            <span className="text-[#5a5a5a]">⌘ L</span>
          </div>
          <div className="py-2 text-[12px]">
            {[
              ['▾', 'Desktop — 1440', 0, false],
              ['▸', 'Nav', 1, false],
              ['▾', 'Hero', 1, false],
              ['T', 'Heading', 2, true],
              ['▢', 'Actions', 2, false],
              ['▢', 'Image', 2, false],
              ['▸', 'Cards', 1, false],
              ['▸', 'Footer', 1, false],
            ].map(([icon, name, level, selected]) => (
              <div
                key={name as string}
                className={`flex items-center gap-2 py-1.5 pr-3 ${selected ? 'bg-[#9fb2c9]/15 text-[#f5f5f5]' : 'text-[#9a9a9a]'}`}
                style={{ paddingLeft: 14 + (level as number) * 14 }}
              >
                <span className="w-3 font-mono text-[10px] text-[#6b6b6b]">{icon as string}</span>
                {name as string}
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.07] px-3.5 py-3 font-mono text-[10.5px] text-[#7a7a7a]">
            <div className="flex justify-between">
              <span>Auto layout</span>
              <span className="text-[#d4d4d4]">↓ 24</span>
            </div>
            <div className="mt-1.5 flex justify-between">
              <span>Grid</span>
              <span className="text-[#d4d4d4]">12 col</span>
            </div>
          </div>
        </div>
      </Layer>

      {/* Mobile frame */}
      <Layer depth={2.2} className="bottom-0 right-0 w-[190px]">
        <div className="rounded-[30px] border border-white/[0.14] bg-[#0b0b0b] p-2.5 shadow-[0_40px_80px_-25px_rgb(0_0_0/0.95),inset_0_1px_0_rgb(255_255_255/0.08)]">
          <div className="overflow-hidden rounded-[22px] bg-[#0f0f0f] px-4 pb-6 pt-3">
            <div className="mx-auto mb-4 h-4 w-16 rounded-full bg-black" />
            <div className="flex items-center justify-between">
              <span className="h-3 w-10 rounded-[3px] bg-[#e5e5e5]" />
              <span className="flex flex-col gap-1">
                <span className="h-px w-4 bg-white/60" />
                <span className="h-px w-3 bg-white/60" />
              </span>
            </div>
            <p className="mt-6 text-[21px] font-medium leading-[0.95] tracking-[-0.05em] text-[#f5f5f5]">
              Hello,
              <br />
              <span className="text-[#7a7a7a]">responsive</span>
              <br />
              web.
            </p>
            <span className="mt-4 block h-6 w-full rounded-[4px] bg-[#e5e5e5]" />
            <div className="diagonal-hatch mt-4 aspect-square rounded-[6px] border border-white/10" />
            <span className="mt-3 block h-1.5 w-3/4 rounded-full bg-white/15" />
          </div>
        </div>
      </Layer>

      {/* Multiplayer-style cursor */}
      <Layer depth={2.8} className="left-[470px] top-[230px]">
        <div className="flex items-start">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 1.5l13 6.2-5.8 1.6-2.3 5.6L2 1.5Z" fill="#f5f5f5" stroke="#0a0a0a" />
          </svg>
          <span className="ml-1 mt-3 rounded-[4px] bg-[#f5f5f5] px-1.5 py-0.5 text-[10.5px] font-medium text-black">Derick</span>
        </div>
      </Layer>
    </Stage>
  )
}
