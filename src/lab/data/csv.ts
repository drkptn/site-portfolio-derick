/** Small CSV parser: quotes, escaped quotes, comma/semicolon/tab delimiters, BR number format. */

export interface ParsedCsv {
  headers: string[]
  rows: string[][]
  delimiter: string
}

export function parseCsv(text: string): ParsedCsv {
  const clean = text.replace(/^﻿/, '')
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? ''
  const delimiter = [',', ';', '\t'].sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0]

  const records: string[][] = []
  let field = ''
  let record: string[] = []
  let quoted = false
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i]
    if (quoted) {
      if (ch === '"' && clean[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === delimiter) {
      record.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && clean[i + 1] === '\n') i++
      record.push(field)
      records.push(record)
      record = []
      field = ''
    } else field += ch
  }
  if (field || record.length) {
    record.push(field)
    records.push(record)
  }
  const nonEmpty = records.filter((r) => r.some((c) => c.trim() !== ''))
  const [headers = [], ...rows] = nonEmpty
  return { headers: headers.map((h, i) => h.trim() || `col_${i + 1}`), rows, delimiter }
}

/** Parses "1234.5", "1,234.5", "1.234,5", "R$ 12", "45%" … returns null when not numeric. */
export function toNumber(raw: string): number | null {
  let s = raw.trim().replace(/[R$€£%\s]/g, '')
  if (!s) return null
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s) || /^-?\d+,\d+$/.test(s)) s = s.replace(/\./g, '').replace(',', '.')
  else s = s.replace(/,/g, '')
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export function numericColumns(csv: ParsedCsv) {
  return csv.headers
    .map((_, i) => i)
    .filter((i) => {
      const vals = csv.rows.map((r) => r[i] ?? '').filter((v) => v.trim() !== '')
      return vals.length > 0 && vals.filter((v) => toNumber(v) !== null).length / vals.length >= 0.8
    })
}

export function stats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length
  const sum = sorted.reduce((a, b) => a + b, 0)
  const median = n === 0 ? 0 : n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2
  return { count: n, sum, mean: n ? sum / n : 0, median, min: sorted[0] ?? 0, max: sorted[n - 1] ?? 0 }
}
