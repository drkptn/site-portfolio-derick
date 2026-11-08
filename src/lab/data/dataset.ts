/** Synthetic, deterministic sample data (seeded PRNG) — always labelled as such in the UI. */

export const REGIONS = ['Sudeste', 'Sul', 'Nordeste', 'Centro-Oeste', 'Norte'] as const
export const CATEGORIES = ['Hardware', 'Software', 'Services'] as const
export const MONTHS = 12

export type Region = (typeof REGIONS)[number]
export type Category = (typeof CATEGORIES)[number]

export interface Row {
  month: number // 0..11
  region: Region
  category: Category
  revenue: number
  orders: number
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const regionBase: Record<Region, number> = { Sudeste: 520, Sul: 260, Nordeste: 210, 'Centro-Oeste': 140, Norte: 80 }
const categoryFactor: Record<Category, number> = { Hardware: 1, Software: 0.75, Services: 0.55 }
const ticket: Record<Category, number> = { Hardware: 1.9, Software: 0.85, Services: 1.3 }

export const rows: Row[] = (() => {
  const rand = mulberry32(2026)
  const out: Row[] = []
  for (let m = 0; m < MONTHS; m++) {
    // gentle growth + a Q4 peak + a mid-year dip
    const season = 1 + m * 0.025 + (m >= 9 ? 0.22 : 0) - (m === 5 || m === 6 ? 0.08 : 0)
    for (const region of REGIONS) {
      for (const category of CATEGORIES) {
        const revenue = Math.round(regionBase[region] * categoryFactor[category] * season * (0.86 + rand() * 0.28) * 100) * 10
        out.push({ month: m, region, category, revenue, orders: Math.round(revenue / (ticket[category] * 1000)) })
      }
    }
  }
  return out
})()

export function toCsv(data: Row[], monthLabels: string[]) {
  const head = 'month,region,category,revenue_brl,orders'
  return [head, ...data.map((r) => `${monthLabels[r.month]},${r.region},${r.category},${r.revenue},${r.orders}`)].join('\n')
}
