/** Sample network used by both the Python programs and the SQL builder. */

export const SITES = ['Santo André', 'São Paulo', 'Campinas'] as const
export const TYPES = ['switch', 'router', 'firewall', 'server', 'access-point'] as const

export interface Device {
  id: number
  hostname: string
  type: (typeof TYPES)[number]
  site: (typeof SITES)[number]
  ip: string
  online: boolean
}

export const DEVICES: Device[] = [
  { id: 1, hostname: 'core-sw-01', type: 'switch', site: 'Santo André', ip: '10.0.0.1', online: true },
  { id: 2, hostname: 'edge-rt-01', type: 'router', site: 'Santo André', ip: '10.0.0.254', online: true },
  { id: 3, hostname: 'ap-lab-02', type: 'access-point', site: 'Santo André', ip: '10.0.1.12', online: false },
  { id: 4, hostname: 'core-sw-02', type: 'switch', site: 'São Paulo', ip: '10.1.0.1', online: true },
  { id: 5, hostname: 'fw-01', type: 'firewall', site: 'São Paulo', ip: '10.1.0.2', online: true },
  { id: 6, hostname: 'srv-db-01', type: 'server', site: 'São Paulo', ip: '10.1.2.10', online: false },
  { id: 7, hostname: 'srv-web-01', type: 'server', site: 'São Paulo', ip: '10.1.2.11', online: true },
  { id: 8, hostname: 'ap-office-01', type: 'access-point', site: 'Campinas', ip: '10.2.1.5', online: true },
  { id: 9, hostname: 'edge-rt-02', type: 'router', site: 'Campinas', ip: '10.2.0.254', online: true },
]

export interface Link {
  source: number
  target: number
  latency: number
  bandwidth: number
}

export const LINKS: Link[] = [
  { source: 1, target: 2, latency: 2, bandwidth: 10000 },
  { source: 1, target: 3, latency: 4, bandwidth: 1000 },
  { source: 2, target: 5, latency: 9, bandwidth: 1000 },
  { source: 2, target: 4, latency: 14, bandwidth: 1000 },
  { source: 5, target: 4, latency: 3, bandwidth: 10000 },
  { source: 4, target: 6, latency: 1, bandwidth: 10000 },
  { source: 4, target: 7, latency: 1, bandwidth: 10000 },
  { source: 2, target: 9, latency: 19, bandwidth: 500 },
  { source: 9, target: 8, latency: 4, bandwidth: 1000 },
]

export interface Incident {
  id: number
  device: number
  severity: 'low' | 'medium' | 'high'
  opened: string
  resolved: boolean
}

export const INCIDENTS: Incident[] = [
  { id: 1, device: 3, severity: 'medium', opened: '2026-10-02', resolved: false },
  { id: 2, device: 6, severity: 'high', opened: '2026-10-05', resolved: false },
  { id: 3, device: 6, severity: 'medium', opened: '2026-09-21', resolved: true },
  { id: 4, device: 2, severity: 'low', opened: '2026-09-30', resolved: true },
  { id: 5, device: 9, severity: 'high', opened: '2026-10-01', resolved: true },
  { id: 6, device: 8, severity: 'low', opened: '2026-10-06', resolved: false },
]

export const deviceById = (id: number) => DEVICES.find((d) => d.id === id)!

/** Graph layout for the route visualizer (viewBox 0 0 600 300). */
export const NODE_POS: Record<number, [number, number]> = {
  3: [60, 70],
  1: [170, 150],
  2: [300, 80],
  5: [420, 60],
  4: [470, 180],
  6: [560, 120],
  7: [560, 250],
  9: [300, 240],
  8: [160, 270],
}
