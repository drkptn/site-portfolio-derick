import type { Localized } from '@/i18n/types'

export interface Snippet {
  id: string
  title: Localized<string>
  code: string
}

/* ------------------------------------------------------------------ Python */

export const pythonSnippets: Snippet[] = [
  {
    id: 'inventory',
    title: { en: 'Network inventory', pt: 'Inventário de rede' },
    code: `from dataclasses import dataclass
from collections import Counter

@dataclass
class Device:
    hostname: str
    kind: str
    site: str
    online: bool

inventory = [
    Device("core-sw-01", "switch", "Santo André", True),
    Device("edge-rt-01", "router", "Santo André", True),
    Device("ap-lab-02", "access-point", "Santo André", False),
    Device("core-sw-02", "switch", "São Paulo", True),
    Device("fw-01", "firewall", "São Paulo", True),
    Device("srv-db-01", "server", "São Paulo", False),
    Device("ap-office-01", "access-point", "Campinas", True),
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
print("Needs attention:", ", ".join(offline))
`,
  },
  {
    id: 'route',
    title: { en: 'Shortest route (Dijkstra)', pt: 'Menor rota (Dijkstra)' },
    code: `import heapq

# Link latency in milliseconds between network nodes
links = {
    "core-sw-01": {"edge-rt-01": 2, "ap-lab-02": 4},
    "edge-rt-01": {"core-sw-01": 2, "fw-01": 9, "core-sw-02": 14},
    "fw-01": {"edge-rt-01": 9, "core-sw-02": 3},
    "core-sw-02": {"fw-01": 3, "edge-rt-01": 14, "srv-db-01": 1},
    "srv-db-01": {"core-sw-02": 1},
    "ap-lab-02": {"core-sw-01": 4},
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

cost, path = shortest_path(links, "ap-lab-02", "srv-db-01")
print("Route:  ", " → ".join(path))
print("Latency:", cost, "ms")
print("Hops:   ", len(path) - 1)
`,
  },
  {
    id: 'stats',
    title: { en: 'Traffic statistics', pt: 'Estatísticas de tráfego' },
    code: `import statistics as st

# Sample: average traffic per weekday (GB)
traffic = {"Mon": 182, "Tue": 205, "Wed": 198, "Thu": 241, "Fri": 266, "Sat": 97, "Sun": 74}

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
    print(f"{day}  {bar:<30} {gb:>4}{mark}")
`,
  },
]

/* --------------------------------------------------------------------- SQL */

export const sqlSeed = `
CREATE TABLE devices (
  id INTEGER PRIMARY KEY,
  hostname TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  site TEXT NOT NULL,
  ip_address TEXT UNIQUE,
  online INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE connections (
  id INTEGER PRIMARY KEY,
  source_id INTEGER REFERENCES devices(id),
  target_id INTEGER REFERENCES devices(id),
  latency_ms REAL,
  bandwidth_mbps INTEGER
);
CREATE TABLE incidents (
  id INTEGER PRIMARY KEY,
  device_id INTEGER REFERENCES devices(id),
  severity TEXT CHECK (severity IN ('low','medium','high')),
  opened_on TEXT,
  resolved INTEGER DEFAULT 0
);
INSERT INTO devices (hostname, type, site, ip_address, online) VALUES
  ('core-sw-01','switch','Santo André','10.0.0.1',1),
  ('edge-rt-01','router','Santo André','10.0.0.254',1),
  ('ap-lab-02','access-point','Santo André','10.0.1.12',0),
  ('core-sw-02','switch','São Paulo','10.1.0.1',1),
  ('fw-01','firewall','São Paulo','10.1.0.2',1),
  ('srv-db-01','server','São Paulo','10.1.2.10',0),
  ('srv-web-01','server','São Paulo','10.1.2.11',1),
  ('ap-office-01','access-point','Campinas','10.2.1.5',1),
  ('edge-rt-02','router','Campinas','10.2.0.254',1);
INSERT INTO connections (source_id, target_id, latency_ms, bandwidth_mbps) VALUES
  (1,2,2.1,10000),(1,3,4.3,1000),(2,5,9.4,1000),(2,4,14.2,1000),
  (5,4,3.0,10000),(4,6,1.2,10000),(4,7,1.1,10000),(2,9,18.7,500),(9,8,3.6,1000);
INSERT INTO incidents (device_id, severity, opened_on, resolved) VALUES
  (3,'medium','2026-10-02',0),(6,'high','2026-10-05',0),(6,'medium','2026-09-21',1),
  (2,'low','2026-09-30',1),(9,'high','2026-10-01',1),(8,'low','2026-10-06',0);
`

export const sqlSnippets: Snippet[] = [
  {
    id: 'per-site',
    title: { en: 'Devices per site', pt: 'Dispositivos por local' },
    code: `-- How many devices each site has, and how many are offline
SELECT site,
       COUNT(*)                         AS devices,
       SUM(CASE WHEN online = 0 THEN 1 ELSE 0 END) AS offline
FROM devices
GROUP BY site
ORDER BY devices DESC;`,
  },
  {
    id: 'links',
    title: { en: 'Slowest links (JOIN)', pt: 'Links mais lentos (JOIN)' },
    code: `-- Each link with both endpoints resolved by name
SELECT s.hostname AS source,
       t.hostname AS target,
       c.latency_ms,
       c.bandwidth_mbps
FROM connections c
JOIN devices s ON s.id = c.source_id
JOIN devices t ON t.id = c.target_id
ORDER BY c.latency_ms DESC
LIMIT 5;`,
  },
  {
    id: 'incidents',
    title: { en: 'Open incidents', pt: 'Incidentes abertos' },
    code: `-- Unresolved incidents, most severe first
SELECT d.hostname, d.site, i.severity, i.opened_on
FROM incidents i
JOIN devices d ON d.id = i.device_id
WHERE i.resolved = 0
ORDER BY CASE i.severity WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
         i.opened_on;`,
  },
]
