import { DEVICES, INCIDENTS, LINKS, SITES, TYPES, deviceById } from './network'

export type Cell = string | number
export interface QueryResult {
  sql: string
  columns: string[]
  rows: Cell[][]
}

const q = (s: string) => `'${s.replace(/'/g, "''")}'`

/* ---------------------------------------------------------------- devices */

export interface DeviceFilters {
  site: (typeof SITES)[number] | 'all'
  type: (typeof TYPES)[number] | 'all'
  status: 'all' | 'online' | 'offline'
  order: 'hostname' | 'site' | 'ip_address'
}

export function devicesQuery(f: DeviceFilters): QueryResult {
  const where: string[] = []
  if (f.site !== 'all') where.push(`site = ${q(f.site)}`)
  if (f.type !== 'all') where.push(`type = ${q(f.type)}`)
  if (f.status !== 'all') where.push(`online = ${f.status === 'online' ? 1 : 0}`)
  const sql = [
    'SELECT hostname, type, site, ip_address, online',
    'FROM devices',
    where.length ? `WHERE ${where.join('\n  AND ')}` : null,
    `ORDER BY ${f.order};`,
  ]
    .filter(Boolean)
    .join('\n')

  const key = { hostname: 'hostname', site: 'site', ip_address: 'ip' } as const
  const rows = DEVICES.filter(
    (d) => (f.site === 'all' || d.site === f.site) && (f.type === 'all' || d.type === f.type) && (f.status === 'all' || d.online === (f.status === 'online')),
  )
    .sort((a, b) => {
      const k = key[f.order]
      // SQLite compares text byte-wise; IPs sort as text too
      return a[k] < b[k] ? -1 : a[k] > b[k] ? 1 : 0
    })
    .map((d) => [d.hostname, d.type, d.site, d.ip, d.online ? 1 : 0])
  return { sql, columns: ['hostname', 'type', 'site', 'ip_address', 'online'], rows }
}

/* ----------------------------------------------------------------- per site */

export function perSiteQuery(onlyWithOffline: boolean): QueryResult {
  const sql = `SELECT site,
       COUNT(*) AS devices,
       SUM(CASE WHEN online = 0 THEN 1 ELSE 0 END) AS offline
FROM devices
GROUP BY site${onlyWithOffline ? '\nHAVING offline > 0' : ''}
ORDER BY devices DESC, site;`
  const groups = new Map<string, { devices: number; offline: number }>()
  DEVICES.forEach((d) => {
    const g = groups.get(d.site) ?? { devices: 0, offline: 0 }
    g.devices++
    if (!d.online) g.offline++
    groups.set(d.site, g)
  })
  const rows = [...groups]
    .filter(([, g]) => !onlyWithOffline || g.offline > 0)
    .sort((a, b) => b[1].devices - a[1].devices || (a[0] < b[0] ? -1 : 1))
    .map(([site, g]) => [site, g.devices, g.offline])
  return { sql, columns: ['site', 'devices', 'offline'], rows }
}

/* -------------------------------------------------------------------- links */

export function linksQuery(limit: number, minBandwidth: number): QueryResult {
  const sql = `SELECT s.hostname AS source,
       t.hostname AS target,
       c.latency_ms,
       c.bandwidth_mbps
FROM connections c
JOIN devices s ON s.id = c.source_id
JOIN devices t ON t.id = c.target_id${minBandwidth ? `\nWHERE c.bandwidth_mbps >= ${minBandwidth}` : ''}
ORDER BY c.latency_ms DESC
LIMIT ${limit};`
  const rows = LINKS.filter((l) => l.bandwidth >= minBandwidth)
    .sort((a, b) => b.latency - a.latency)
    .slice(0, limit)
    .map((l) => [deviceById(l.source).hostname, deviceById(l.target).hostname, l.latency, l.bandwidth])
  return { sql, columns: ['source', 'target', 'latency_ms', 'bandwidth_mbps'], rows }
}

/* ---------------------------------------------------------------- incidents */

export function incidentsQuery(status: 'open' | 'all', severity: 'all' | 'high' | 'medium' | 'low'): QueryResult {
  const where: string[] = []
  if (status === 'open') where.push('i.resolved = 0')
  if (severity !== 'all') where.push(`i.severity = ${q(severity)}`)
  const sql = `SELECT d.hostname, d.site, i.severity, i.opened_on, i.resolved
FROM incidents i
JOIN devices d ON d.id = i.device_id${where.length ? `\nWHERE ${where.join('\n  AND ')}` : ''}
ORDER BY CASE i.severity WHEN 'high' THEN 1
                         WHEN 'medium' THEN 2 ELSE 3 END,
         i.opened_on;`
  const rank = { high: 1, medium: 2, low: 3 }
  const rows = INCIDENTS.filter((i) => (status === 'all' || !i.resolved) && (severity === 'all' || i.severity === severity))
    .sort((a, b) => rank[a.severity] - rank[b.severity] || (a.opened < b.opened ? -1 : 1))
    .map((i) => {
      const d = deviceById(i.device)
      return [d.hostname, d.site, i.severity, i.opened, i.resolved ? 1 : 0]
    })
  return { sql, columns: ['hostname', 'site', 'severity', 'opened_on', 'resolved'], rows }
}

export const TABLES = [
  { name: 'devices', count: DEVICES.length, columns: ['id PK', 'hostname', 'type', 'site', 'ip_address', 'online'] },
  { name: 'connections', count: LINKS.length, columns: ['id PK', 'source_id FK', 'target_id FK', 'latency_ms', 'bandwidth_mbps'] },
  { name: 'incidents', count: INCIDENTS.length, columns: ['id PK', 'device_id FK', 'severity', 'opened_on', 'resolved'] },
]
