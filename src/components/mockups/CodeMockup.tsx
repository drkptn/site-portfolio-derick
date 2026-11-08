import { Layer, Stage, Window } from './Stage'

/* Tiny syntax palette in greys (keywords bright, strings mid, comments dim) */
const K = ({ c }: { c: string }) => <span className="text-[#f5f5f5]">{c}</span>
const S = ({ c }: { c: string }) => <span className="text-[#9fb2c9]">{c}</span>
const C = ({ c }: { c: string }) => <span className="text-[#555]">{c}</span>
const F = ({ c }: { c: string }) => <span className="text-[#d4d4d4] underline decoration-white/10 underline-offset-2">{c}</span>

const lines = [
  <><C c="# concept — storing and querying network devices" /></>,
  <><K c="import" /> sqlite3</>,
  <></>,
  <><K c="def" /> <F c="create_schema" />(conn):</>,
  <>{'    '}conn.execute(<S c={'"""'} /></>,
  <>{'      '}<S c="CREATE TABLE IF NOT EXISTS devices (" /></>,
  <>{'        '}<S c="id INTEGER PRIMARY KEY," /></>,
  <>{'        '}<S c="hostname TEXT NOT NULL," /></>,
  <>{'        '}<S c="ip_address TEXT UNIQUE" /></>,
  <>{'      '}<S c={')"""'} />)</>,
  <></>,
  <><K c="def" /> <F c="find_by_host" />(conn, host):</>,
  <>{'    '}cur = conn.execute(</>,
  <>{'      '}<S c={'"SELECT * FROM devices WHERE hostname = ?"'} />,</>,
  <>{'      '}(host,))</>,
  <>{'    '}<K c="return" /> cur.fetchall()</>,
]

export function CodeMockup({ label }: { label: string }) {
  return (
    <Stage label={label}>
      {/* Editor */}
      <Layer depth={0.6} className="left-0 top-[64px] w-[600px]">
        <Window tabs={['network_db.py', 'Repository.cs']}>
          <div className="flex py-4 font-mono text-[12.5px] leading-[22px]">
            <div className="select-none px-4 text-right text-[#3d3d3d]">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <div className="whitespace-pre pr-6 text-[#a3a3a3]">
              {lines.map((l, i) => (
                <div key={i} className={i === 13 ? '-mx-2 rounded-[3px] bg-white/[0.05] px-2' : undefined}>
                  {l}
                  {i === 15 && <span className="ml-0.5 inline-block h-[15px] w-[7px] translate-y-[3px] animate-pulse bg-[#d4d4d4]" />}
                </div>
              ))}
            </div>
          </div>
        </Window>
      </Layer>

      {/* ER diagram */}
      <Layer depth={1.4} className="right-0 top-0 w-[360px]">
        <div className="rounded-[12px] border border-white/[0.1] bg-[#111]/95 p-5 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)] backdrop-blur">
          <div className="mb-4 flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#7a7a7a]">
            <span>schema.erd</span>
            <span>2 tables</span>
          </div>
          <div className="relative flex flex-col gap-10">
            <Table name="devices" rows={[['id', 'PK'], ['hostname', 'TEXT'], ['ip_address', 'UNIQUE']]} />
            <Table name="connections" rows={[['id', 'PK'], ['source_id', 'FK'], ['target_id', 'FK']]} offset />
            <svg className="absolute left-[38px] top-[118px]" width="140" height="70" fill="none">
              <path d="M2 2v30c0 8 6 14 14 14h90c8 0 14 6 14 14v8" stroke="#6b6b6b" strokeDasharray="3 4" />
              <circle cx="2" cy="2" r="3" fill="#d4d4d4" />
              <circle cx="120" cy="68" r="3" fill="#d4d4d4" />
            </svg>
          </div>
        </div>
      </Layer>

      {/* Terminal */}
      <Layer depth={2} className="bottom-0 left-[300px] w-[440px]">
        <Window title="terminal — zsh">
          <div className="space-y-1.5 p-4 font-mono text-[12px] leading-[18px] text-[#8a8a8a]">
            <p>
              <span className="text-[#f5f5f5]">$</span> python network_db.py
            </p>
            <p>› schema ready · devices, connections</p>
            <p>› find_by_host(<span className="text-[#9fb2c9]">"core-switch"</span>)</p>
            <div className="mt-2 grid grid-cols-[40px_1fr_1fr] gap-x-3 border-t border-white/[0.07] pt-2 text-[#bdbdbd]">
              <span className="text-[#5a5a5a]">id</span>
              <span className="text-[#5a5a5a]">hostname</span>
              <span className="text-[#5a5a5a]">ip_address</span>
              <span>1</span>
              <span>core-switch</span>
              <span>10.0.0.1</span>
            </div>
          </div>
        </Window>
      </Layer>
    </Stage>
  )
}

function Table({ name, rows, offset }: { name: string; rows: [string, string][]; offset?: boolean }) {
  return (
    <div className={`w-[230px] overflow-hidden rounded-[8px] border border-white/[0.1] ${offset ? 'ml-[80px]' : ''}`}>
      <div className="flex items-center justify-between bg-[#1c1c1c] px-3 py-2 font-mono text-[11.5px] text-[#f5f5f5]">
        {name}
        <span className="size-1.5 rounded-full bg-[#9fb2c9]" />
      </div>
      {rows.map(([col, type]) => (
        <div key={col} className="flex justify-between border-t border-white/[0.06] px-3 py-1.5 font-mono text-[11px]">
          <span className="text-[#bdbdbd]">{col}</span>
          <span className="text-[#5f5f5f]">{type}</span>
        </div>
      ))}
    </div>
  )
}
