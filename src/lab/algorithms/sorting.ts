/** Sorting algorithms written as step recorders: every compare/write becomes a frame. */

export type AlgoId = 'bubble' | 'insertion' | 'selection' | 'merge' | 'quick'

export interface Step {
  array: number[]
  compare?: [number, number]
  write?: number[]
  pivot?: number
  sorted: number[]
  line: number
  comparisons: number
  writes: number
}

export const ALGORITHMS: Record<AlgoId, { name: string; code: string[]; best: string; avg: string; worst: string; space: string; stable: boolean }> = {
  bubble: {
    name: 'Bubble',
    code: ['for i in 0 … n-1', '  for j in 0 … n-i-2', '    if a[j] > a[j+1]', '      swap(a[j], a[j+1])', '  a[n-i-1] is in place'],
    best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true,
  },
  insertion: {
    name: 'Insertion',
    code: ['for i in 1 … n-1', '  key = a[i]; j = i - 1', '  while j ≥ 0 and a[j] > key', '    a[j+1] = a[j]; j -= 1', '  a[j+1] = key'],
    best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true,
  },
  selection: {
    name: 'Selection',
    code: ['for i in 0 … n-1', '  min = i', '  for j in i+1 … n-1', '    if a[j] < a[min]: min = j', '  swap(a[i], a[min])'],
    best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: false,
  },
  merge: {
    name: 'Merge',
    code: ['mergeSort(lo, hi)', '  if hi - lo < 1: return', '  sort left half, sort right half', '  compare left[i] with right[j]', '  write the smaller into a[k]'],
    best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: true,
  },
  quick: {
    name: 'Quick',
    code: ['quickSort(lo, hi)', '  pivot = a[hi]; i = lo', '  for j in lo … hi-1: compare', '    if a[j] < pivot: swap, i++', '  swap(a[i], a[hi]) → placed'],
    best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', stable: false,
  },
}

class Recorder {
  steps: Step[] = []
  comparisons = 0
  writes = 0
  sorted = new Set<number>()
  constructor(public a: number[]) {
    this.push({ line: 0 })
  }
  push(s: Partial<Step> & { line: number }) {
    this.steps.push({ array: [...this.a], sorted: [...this.sorted], comparisons: this.comparisons, writes: this.writes, ...s })
  }
  cmp(i: number, j: number, line: number) {
    this.comparisons++
    this.push({ compare: [i, j], line })
  }
  swap(i: number, j: number, line: number) {
    ;[this.a[i], this.a[j]] = [this.a[j], this.a[i]]
    this.writes += 2
    this.push({ write: [i, j], line })
  }
  set(i: number, v: number, line: number) {
    this.a[i] = v
    this.writes++
    this.push({ write: [i], line })
  }
  done() {
    this.a.forEach((_, i) => this.sorted.add(i))
    this.push({ line: -1 })
    return this.steps
  }
}

export function record(id: AlgoId, input: number[]): Step[] {
  const r = new Recorder([...input])
  const a = r.a
  const n = a.length

  if (id === 'bubble') {
    for (let i = 0; i < n - 1; i++) {
      let swapped = false
      for (let j = 0; j < n - i - 1; j++) {
        r.cmp(j, j + 1, 2)
        if (a[j] > a[j + 1]) {
          r.swap(j, j + 1, 3)
          swapped = true
        }
      }
      r.sorted.add(n - i - 1)
      r.push({ line: 4 })
      if (!swapped) break
    }
  }

  if (id === 'insertion') {
    r.sorted.add(0)
    for (let i = 1; i < n; i++) {
      const key = a[i]
      let j = i - 1
      r.push({ line: 1, compare: [i, i] })
      while (j >= 0) {
        r.cmp(j, j + 1, 2)
        if (a[j] <= key) break
        r.set(j + 1, a[j], 3)
        j--
      }
      r.set(j + 1, key, 4)
    }
  }

  if (id === 'selection') {
    for (let i = 0; i < n - 1; i++) {
      let min = i
      r.push({ line: 1, pivot: min })
      for (let j = i + 1; j < n; j++) {
        r.comparisons++
        r.push({ compare: [j, min], pivot: min, line: 3 })
        if (a[j] < a[min]) min = j
      }
      if (min !== i) r.swap(i, min, 4)
      r.sorted.add(i)
    }
  }

  if (id === 'merge') {
    const sort = (lo: number, hi: number) => {
      if (hi - lo < 1) return
      const mid = (lo + hi) >> 1
      sort(lo, mid)
      sort(mid + 1, hi)
      const left = a.slice(lo, mid + 1)
      const right = a.slice(mid + 1, hi + 1)
      let i = 0
      let j = 0
      let k = lo
      while (i < left.length && j < right.length) {
        r.cmp(lo + i, mid + 1 + j, 3)
        r.set(k++, left[i] <= right[j] ? left[i++] : right[j++], 4)
      }
      while (i < left.length) r.set(k++, left[i++], 4)
      while (j < right.length) r.set(k++, right[j++], 4)
    }
    sort(0, n - 1)
  }

  if (id === 'quick') {
    const sort = (lo: number, hi: number) => {
      if (lo >= hi) {
        if (lo === hi) r.sorted.add(lo)
        return
      }
      const pivot = a[hi]
      r.push({ line: 1, pivot: hi })
      let i = lo
      for (let j = lo; j < hi; j++) {
        r.comparisons++
        r.push({ compare: [j, hi], pivot: hi, line: 2 })
        if (a[j] < pivot) {
          if (i !== j) r.swap(i, j, 3)
          i++
        }
      }
      if (i !== hi) r.swap(i, hi, 4)
      r.sorted.add(i)
      sort(lo, i - 1)
      sort(i + 1, hi)
    }
    sort(0, n - 1)
  }

  return r.done()
}

export type Preset = 'random' | 'nearly' | 'reversed'

export function makeArray(n: number, preset: Preset, seed = Math.random()) {
  let s = Math.floor(seed * 2 ** 31) || 1
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
  const base = Array.from({ length: n }, (_, i) => Math.round(((i + 1) / n) * 95) + 5)
  if (preset === 'reversed') return base.reverse()
  if (preset === 'nearly') {
    const a = [...base]
    for (let k = 0; k < Math.max(1, Math.round(n / 10)); k++) {
      const i = Math.floor(rand() * (n - 1))
      ;[a[i], a[i + 1]] = [a[i + 1], a[i]]
    }
    return a
  }
  const a = [...base]
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
