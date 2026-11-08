import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), seo(env.VITE_SITE_URL ?? '')],
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
