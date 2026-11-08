import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { profile } from './src/data/profile.ts'

/**
 * SEO plugin
 * - Injects the public site URL (VITE_SITE_URL) into canonical / Open Graph tags.
 * - Generates JSON-LD structured data from the same profile data used by the UI.
 * - Emits robots.txt and (when a site URL is configured) sitemap.xml.
 *
 * Without VITE_SITE_URL the absolute-URL tags are removed instead of shipping a fake domain.
 */
function seo(siteUrlRaw: string): Plugin {
  const siteUrl = siteUrlRaw.replace(/\/+$/, '')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: 'Computer Science Student',
    description:
      'Computer Science student focused on software development, front-end, data analytics and UI/UX design.',
    email: `mailto:${profile.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Santo André',
      addressRegion: 'SP',
      addressCountry: 'BR',
    },
    knowsLanguage: ['pt-BR', 'en'],
    knowsAbout: [
      'Python',
      'C#',
      'JavaScript',
      'HTML',
      'CSS',
      'SQL',
      'Power BI',
      'Data Analytics',
      'UI Design',
      'UX Design',
      'Generative AI',
    ],
    affiliation: { '@type': 'CollegeOrUniversity', name: 'UNINTER' },
    hasCredential: profile.certifications.map((c) => ({
      '@type': 'EducationalOccupationalCredential',
      name: c.name,
      credentialCategory: 'certificate',
      recognizedBy: { '@type': 'Organization', name: c.issuer },
    })),
    ...(siteUrl ? { url: `${siteUrl}/`, image: `${siteUrl}/og-image.png` } : {}),
    sameAs: [profile.links.linkedin, profile.links.github].filter(Boolean),
  }

  return {
    name: 'portfolio-seo',
    transformIndexHtml(html) {
      let out = html
      if (siteUrl) {
        out = out.replaceAll('%SITE_URL%', siteUrl)
      } else {
        // Drop tags that require an absolute URL; keep relative fallbacks for images.
        out = out
          .split('\n')
          .filter((line) => !(line.includes('%SITE_URL%') && line.includes('data-absolute')))
          .join('\n')
          .replaceAll('%SITE_URL%', '')
      }
      return out.replaceAll(' data-absolute', '').replace(
        '<!--JSON_LD-->',
        `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
      )
    },
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /']
      if (siteUrl) robots.push('', `Sitemap: ${siteUrl}/sitemap.xml`)
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots.join('\n') + '\n' })

      if (siteUrl) {
        const today = new Date().toISOString().slice(0, 10)
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`,
        })
      }
    },
  }
}

/**
 * Lab runtimes: Python (Pyodide) and SQLite (sql.js) are self-hosted from node_modules
 * instead of a third-party CDN, so the interactive lab works on any host.
 * Served by a dev middleware and emitted under /runtimes/ at build time.
 */
const RUNTIMES: Record<string, { dir: string; files: string[] }> = {
  pyodide: {
    dir: 'node_modules/pyodide',
    files: ['pyodide.mjs', 'pyodide.asm.js', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json'],
  },
  sql: { dir: 'node_modules/sql.js/dist', files: ['sql-wasm-browser.wasm'] },
}

const MIME: Record<string, string> = {
  '.mjs': 'text/javascript',
  '.js': 'text/javascript',
  '.wasm': 'application/wasm',
  '.zip': 'application/zip',
  '.json': 'application/json',
}

function labRuntimes(): Plugin {
  return {
    name: 'lab-runtimes',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const match = req.url?.match(/\/runtimes\/(\w+)\/([\w.-]+)/)
        const runtime = match && RUNTIMES[match[1]]
        if (!runtime || !runtime.files.includes(match[2])) return next()
        const file = join(process.cwd(), runtime.dir, match[2])
        if (!existsSync(file)) return next()
        res.setHeader('Content-Type', MIME[match[2].slice(match[2].lastIndexOf('.'))] ?? 'application/octet-stream')
        res.end(readFileSync(file))
      })
    },
    generateBundle() {
      for (const [name, runtime] of Object.entries(RUNTIMES)) {
        for (const f of runtime.files) {
          this.emitFile({ type: 'asset', fileName: `runtimes/${name}/${f}`, source: readFileSync(join(process.cwd(), runtime.dir, f)) })
        }
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), seo(env.VITE_SITE_URL ?? ''), labRuntimes()],
    worker: { format: 'es' },
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1200,
    },
  }
})
