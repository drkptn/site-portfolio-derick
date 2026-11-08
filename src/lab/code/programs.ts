import { DEVICES, LINKS, deviceById, type Device } from './network'

/* ------------------------------------------------------------- helpers */

const py = (s: string) => `"${s}"`
const pad = (s: string | number, n: number) => String(s).padEnd(n)
const padL = (s: string | number, n: number) => String(s).padStart(n)

/** Python's round(): ties go to the even number. */
function pyRound(x: number) {
  const f = Math.floor(x)
  const diff = x - f
  if (Math.abs(diff - 0.5) < 1e-9) return f % 2 === 0 ? f : f + 1
  return Math.round(x)
}

/* ----------------------------------------------------------- inventory */

export type InvDevice = Pick<Device, 'hostname' | 'type' | 'site' | 'online'>

export const initialInventory: InvDevice[] = DEVICES.slice(0, 7).map(({ hostname, type, site, online }) => ({ hostname, type, site, online }))

export function inventorySource(items: InvDevice[]) {
  const rows = items.map((d) => `    Device(${py(d.hostname)}, ${py(d.type)}, ${py(d.site)}, ${d.online ? 'True' : 'False'}),`).join('\n')
  return `from dataclasses import dataclass
from collections import Counter

@dataclass
class Device:
    hostname: str
    kind: str
    site: str
    online: bool

inventory = [
${rows}
]

print(f"{'HOSTNAME':<14}{'TYPE':<14}{'SITE':<13}STATUS")
print("-" * 48)
for d in sorted(inventory, key=lambda d: (d.site, d.hostname)):
    status = "● online" if d.online else "○ offline"
    print(f"{d.hostname:<14}{d.kind:<14}{d.site:<13}{status}")

per_site = Counter(d.site for d in inventory)
offline = [d.hostname for d in inventory if not d.online]
print()
print("Devices per site:", dict(per_site))
print(f"Availability: {100 * (1 - len(offline) / len(inventory)):.1f}%")
print("Needs attention:", ", ".join(offline) or "nothing")`
}

export function runInventory(items: InvDevice[]): string[] {
  if (items.length === 0) return ['Traceback (most recent call last):', '  File "inventory.py", line 30, in <module>', 'ZeroDivisionError: division by zero']
  const out = [`${pad('HOSTNAME', 14)}${pad('TYPE', 14)}${pad('SITE', 13)}STATUS`, '-'.repeat(48)]
  const sorted = [...items].sort((a, b) => (a.site === b.site ? (a.hostname < b.hostname ? -1 : 1) : a.site < b.site ? -1 : 1))
  for (const d of sorted) out.push(`${pad(d.hostname, 14)}${pad(d.type, 14)}${pad(d.site, 13)}${d.online ? '● online' : '○ offline'}`)
  const perSite = new Map<string, number>()
  items.forEach((d) => perSite.set(d.site, (perSite.get(d.site) ?? 0) + 1))
  const offline = items.filter((d) => !d.online).map((d) => d.hostname)
  out.push('')
  out.push(`Devices per site: {${[...perSite].map(([k, v]) => `'${k}': ${v}`).join(', ')}}`)
  out.push(`Availability: ${(100 * (1 - offline.length / items.length)).toFixed(1)}%`)
  out.push(`Needs attention: ${offline.join(', ') || 'nothing'}`)
  return out
}

/* --------------------------------------------------------------- route */

/** Adjacency list in both directions, keyed by hostname. */
export const graph: Record<string, Record<string, number>> = (() => {
  const g: Record<string, Record<string, number>> = {}
  for (const l of LINKS) {
    const a = deviceById(l.source).hostname
    const b = deviceById(l.target).hostname
    ;(g[a] ??= {})[b] = l.latency
    ;(g[b] ??= {})[a] = l.latency
  }
  return g
})()

export const routeNodes = Object.keys(graph).sort()

export function routeSource(start: string, goal: string) {
  const lines = Object.entries(graph)
    .map(([k, v]) => `    ${py(k)}: {${Object.entries(v).map(([n, w]) => `${py(n)}: ${w}`).join(', ')}},`)
    .join('\n')
  return `import heapq

# Link latency (ms) between network nodes
links = {
${lines}
}

def shortest_path(graph, start, goal):
    queue = [(0, start, [start])]
    seen = set()
    while queue:
        cost, node, path = heapq.heappop(queue)
        if node == goal:
            return cost, path
        if node in seen:
            continue
        seen.add(node)
        for neighbor, latency in graph[node].items():
            if neighbor not in seen:
                heapq.heappush(queue, (cost + latency, neighbor, path + [neighbor]))
    return None, []

cost, path = shortest_path(links, ${py(start)}, ${py(goal)})
print("Route:  ", " → ".join(path))
print("Latency:", cost, "ms")
print("Hops:   ", len(path) - 1)`
}

/** Dijkstra with the same tie-breaking as Python's heapq on (cost, node, path) tuples. */
export function shortestPath(start: string, goal: string): { cost: number | null; path: string[] } {
  const queue: [number, string, string[]][] = [[0, start, [start]]]
  const seen = new Set<string>()
  const cmp = (a: [number, string, string[]], b: [number, string, string[]]) =>
    a[0] - b[0] || (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : a[2].join() < b[2].join() ? -1 : 1)
  while (queue.length) {
    queue.sort(cmp)
    const [cost, node, path] = queue.shift()!
    if (node === goal) return { cost, path }
    if (seen.has(node)) continue
    seen.add(node)
    for (const [n, w] of Object.entries(graph[node] ?? {})) if (!seen.has(n)) queue.push([cost + w, n, [...path, n]])
  }
  return { cost: null, path: [] }
}

export function runRoute(start: string, goal: string): string[] {
  const { cost, path } = shortestPath(start, goal)
  return [`Route:   ${path.join(' → ')}`, `Latency: ${cost === null ? 'None' : cost} ms`, `Hops:    ${path.length - 1}`]
}

/* --------------------------------------------------------------- stats */

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
export const initialTraffic = [182, 205, 198, 241, 266, 97, 74]

export function statsSource(values: number[]) {
  return `import statistics as st

# Average traffic per weekday (GB)
traffic = {${DAYS.map((d, i) => `${py(d)}: ${values[i]}`).join(', ')}}

values = list(traffic.values())
print(f"Mean:    {st.mean(values):.1f} GB")
print(f"Median:  {st.median(values):.1f} GB")
print(f"Std dev: {st.stdev(values):.1f} GB")
print()

peak = max(traffic, key=traffic.get)
scale = 30 / max(values)
for day, gb in traffic.items():
    bar = "█" * round(gb * scale)
    mark = "  ← peak" if day == peak else ""
    print(f"{day}  {bar:<30} {gb:>4}{mark}")`
}

export function runStats(values: number[]): string[] {
  const n = values.length
  const mean = values.reduce((a, b) => a + b, 0) / n
  const sorted = [...values].sort((a, b) => a - b)
  const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2
  const stdev = Math.sqrt(values.reduce((a, v) => a + (v - mean) ** 2, 0) / (n - 1))
  const max = Math.max(...values)
  if (max === 0) return ['Traceback (most recent call last):', '  File "stats.py", line 13, in <module>', 'ZeroDivisionError: division by zero']
  const peakIdx = values.indexOf(max)
  const scale = 30 / max
  const out = [`Mean:    ${mean.toFixed(1)} GB`, `Median:  ${median.toFixed(1)} GB`, `Std dev: ${stdev.toFixed(1)} GB`, '']
  DAYS.forEach((d, i) => out.push(`${d}  ${pad('█'.repeat(pyRound(values[i] * scale)), 30)} ${padL(values[i], 4)}${i === peakIdx ? '  ← peak' : ''}`))
  return out
}
