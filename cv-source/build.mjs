/**
 * Generates the CV PDFs (PT + EN) with the portfolio's visual identity.
 *
 *   node cv-source/build.mjs
 *
 * Requires Playwright with Chromium available (npx playwright install chromium).
 * Output: public/cv/Derick-Putini-CV.pdf (PT) and public/cv/Derick-Putini-CV-EN.pdf (EN)
 */
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const font = (pkg, file) => pathToFileURL(join(root, 'node_modules/@fontsource-variable', pkg, 'files', file)).href
const GEIST = font('geist', 'geist-latin-wght-normal.woff2')
const GEIST_EXT = font('geist', 'geist-latin-ext-wght-normal.woff2')
const MONO = font('geist-mono', 'geist-mono-latin-wght-normal.woff2')

const profile = {
  name: 'Derick Putini',
  email: 'derickputini03@gmail.com',
  phone: '(11) 93345-0411',
  city: 'Santo André — SP',
}

const content = {
  pt: {
    file: 'Derick-Putini-CV.pdf',
    lang: 'pt-BR',
    role: 'Estudante de Ciência da Computação · Front-End · Dados',
    status: 'Aberto a primeiras oportunidades em tecnologia',
    labels: { profile: 'Perfil', projects: 'Projetos', education: 'Formação', courses: 'Cursos e certificações', skills: 'Habilidades', languages: 'Idiomas', differentials: 'Diferenciais' },
    summary:
      'Estudante de Ciência da Computação na UNINTER com foco em desenvolvimento de software, Front-End e análise de dados. Desenvolvo aplicações em Python e C#, trabalho com banco de dados e dados de redes e crio interfaces web responsivas. Complemento o perfil técnico com Power BI e UI/UX Design para entregar soluções funcionais e bem desenhadas, e uso IA e ferramentas de IA para ganhar produtividade e acelerar o aprendizado. Busco minha primeira oportunidade em tecnologia para evoluir com a equipe e contribuir com projetos reais.',
    projects: [
      {
        title: 'Portfólio pessoal interativo',
        meta: '2026',
        bullets: [
          'Site one-page com cena 3D, tema claro/escuro, versão PT/EN e foco em acessibilidade e performance.',
          'Lab interativo: programas Python, consultas SQL, dashboard com upload de CSV, design tokens com contraste WCAG e algoritmos de ordenação.',
        ],
        tags: ['React', 'TypeScript', 'Three.js', 'UI/UX'],
      },
      {
        title: 'Aplicações em Python e C#',
        bullets: [
          'Programas com foco em banco de dados: modelagem, armazenamento e consulta de informações.',
          'Projetos com dados de redes (networking), praticando lógica, estruturação de dados e organização de código.',
        ],
        tags: ['Python', 'C#', 'SQL', 'Banco de dados'],
      },
      {
        title: 'Dashboards interativos em Power BI',
        bullets: [
          'Construção de dashboards com tratamento de dados, indicadores (KPIs) e gráficos para apoiar a tomada de decisão.',
          'Foco em clareza visual, aplicando princípios de UX na apresentação dos dados.',
        ],
        tags: ['Power BI', 'Excel', 'Análise de dados', 'UX'],
      },
      {
        title: 'Sites e interfaces web',
        bullets: ['Sites responsivos com HTML, CSS e JavaScript, com layouts e protótipos criados no Figma.'],
        tags: ['HTML', 'CSS', 'JavaScript', 'Figma'],
      },
    ],
    education: { title: 'Bacharelado em Ciência da Computação', school: 'UNINTER · cursando o 3º semestre', year: '2028', yearNote: 'previsão' },
    courses: [
      ['Power BI', 'Impacta · 40 horas', '2026'],
      ['UI/UX Design', 'Origamid · 80 horas', '2024'],
      ['HTML, CSS e JavaScript', 'Origamid · 46 horas', '2024'],
    ],
    hours: '166 horas de cursos certificados',
    skills: [
      ['Programação', ['Python', 'C#', 'JavaScript', 'Java', 'SQL', 'Lógica e algoritmos']],
      ['Front-End', ['HTML5', 'CSS3', 'React', 'TypeScript', 'Design responsivo']],
      ['Dados', ['Power BI', 'Excel', 'Dashboards', 'Banco de dados', 'Redes']],
      ['Design e ferramentas', ['Figma', 'UI Design', 'UX Design', 'VS Code']],
      ['Inteligência artificial', ['IA generativa', 'Ferramentas de IA', 'Desenvolvimento assistido por IA']],
    ],
    langs: [
      ['Português', 'Nativo', 1],
      ['Inglês', 'Avançado (C1)', 0.85],
    ],
    differentials: [
      'Programação + dados (Power BI) + design de interface (UI/UX).',
      'IA aplicada ao estudo, ao desenvolvimento e à produtividade.',
      'Inglês C1 para documentação técnica e comunicação.',
      'Aprendizado contínuo e disponibilidade para diferentes áreas.',
    ],
  },
  en: {
    file: 'Derick-Putini-CV-EN.pdf',
    lang: 'en',
    role: 'Computer Science Student · Front-End · Data',
    status: 'Open to first opportunities in tech',
    labels: { profile: 'Profile', projects: 'Projects', education: 'Education', courses: 'Courses & certifications', skills: 'Skills', languages: 'Languages', differentials: 'Differentials' },
    summary:
      'Computer Science student at UNINTER focused on software development, Front-End and data analysis. I build applications in Python and C#, work with databases and network data, and create responsive web interfaces. I complement my technical profile with Power BI and UI/UX Design to deliver functional, well-designed solutions, and I use AI and AI tools to boost productivity and speed up learning. I am looking for my first opportunity in tech to grow with a team and contribute to real projects.',
    projects: [
      {
        title: 'Interactive personal portfolio',
        meta: '2026',
        bullets: [
          'One-page website with a 3D scene, light/dark theme, PT/EN versions and a focus on accessibility and performance.',
          'Interactive lab: Python programs, SQL queries, a dashboard with CSV upload, design tokens with WCAG contrast and sorting algorithms.',
        ],
        tags: ['React', 'TypeScript', 'Three.js', 'UI/UX'],
      },
      {
        title: 'Python & C# applications',
        bullets: [
          'Database-focused programs: data modeling, storage and querying of information.',
          'Projects with network data, practicing logic, data structuring and code organization.',
        ],
        tags: ['Python', 'C#', 'SQL', 'Databases'],
      },
      {
        title: 'Interactive Power BI dashboards',
        bullets: [
          'Dashboards with data treatment, indicators (KPIs) and charts to support decision-making.',
          'Focus on visual clarity, applying UX principles to data presentation.',
        ],
        tags: ['Power BI', 'Excel', 'Data analysis', 'UX'],
      },
      {
        title: 'Websites & web interfaces',
        bullets: ['Responsive websites with HTML, CSS and JavaScript, with layouts and prototypes created in Figma.'],
        tags: ['HTML', 'CSS', 'JavaScript', 'Figma'],
      },
    ],
    education: { title: 'Bachelor of Computer Science', school: 'UNINTER · currently in the 3rd semester', year: '2028', yearNote: 'expected' },
    courses: [
      ['Power BI', 'Impacta · 40 hours', '2026'],
      ['UI/UX Design', 'Origamid · 80 hours', '2024'],
      ['HTML, CSS & JavaScript', 'Origamid · 46 hours', '2024'],
    ],
    hours: '166 hours of certified coursework',
    skills: [
      ['Programming', ['Python', 'C#', 'JavaScript', 'Java', 'SQL', 'Logic & algorithms']],
      ['Front-End', ['HTML5', 'CSS3', 'React', 'TypeScript', 'Responsive design']],
      ['Data', ['Power BI', 'Excel', 'Dashboards', 'Databases', 'Networking']],
      ['Design & tools', ['Figma', 'UI Design', 'UX Design', 'VS Code']],
      ['Artificial intelligence', ['Generative AI', 'AI tools', 'AI-assisted development']],
    ],
    langs: [
      ['Portuguese', 'Native', 1],
      ['English', 'Advanced (C1)', 0.85],
    ],
    differentials: [
      'Programming + data (Power BI) + interface design (UI/UX).',
      'AI applied to study, development and productivity.',
      'C1 English for technical docs and communication.',
      'Continuous learning; open to different areas in tech.',
    ],
  },
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
const star = (size, color) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M12 0c.6 7.4 4.6 11.4 12 12-7.4.6-11.4 4.6-12 12-.6-7.4-4.6-11.4-12-12 7.4-.6 11.4-4.6 12-12Z" fill="${color}"/></svg>`

function html(c) {
  let n = 0
  const label = (text) => `<h2 class="label"><span>(${String(++n).padStart(2, '0')})</span><i></i>${esc(text)}</h2>`
  return `<!doctype html><html lang="${c.lang}"><head><meta charset="utf-8"><style>
@font-face{font-family:G;src:url(${GEIST}) format('woff2');font-weight:100 900;unicode-range:U+0000-00FF,U+2000-206F,U+20AC,U+2122,U+2190-21FF}
@font-face{font-family:G;src:url(${GEIST_EXT}) format('woff2');font-weight:100 900;unicode-range:U+0100-02AF,U+1E00-1EFF}
@font-face{font-family:M;src:url(${MONO}) format('woff2');font-weight:100 900}
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:210mm;height:297mm}
body{font-family:G,sans-serif;color:#262626;font-size:8.3pt;line-height:1.45;-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fff;position:relative;overflow:hidden}
.mono{font-family:M,monospace}
header{background:#0a0a0a;color:#f5f5f5;padding:10mm 14mm 7mm;position:relative;overflow:hidden}
header .grid{position:absolute;inset:0;display:grid;grid-template-columns:repeat(6,1fr);padding:0 14mm}
header .grid i{border-left:1px solid rgba(255,255,255,.06)} header .grid i:last-child{border-right:1px solid rgba(255,255,255,.06)}
header .glow{position:absolute;right:-30mm;top:-40mm;width:120mm;height:120mm;border-radius:50%;background:radial-gradient(closest-side,rgba(200,212,228,.16),transparent)}
.top{display:flex;justify-content:space-between;align-items:center;position:relative}
.eyebrow{font-family:M,monospace;font-size:6.6pt;letter-spacing:.18em;text-transform:uppercase;color:#8a8a8a}
.pill{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(255,255,255,.16);border-radius:99px;padding:3px 9px 3px 7px;font-size:7.4pt;color:#d4d4d4}
.pill b{width:6px;height:6px;border-radius:50%;background:#f5f5f5;box-shadow:0 0 0 3px rgba(245,245,245,.15)}
h1{position:relative;margin-top:5mm;font-size:44pt;line-height:.86;font-weight:500;letter-spacing:-.055em;text-transform:uppercase;color:#ededed}
.role{position:relative;margin-top:4mm;font-family:M,monospace;font-size:7.6pt;letter-spacing:.14em;text-transform:uppercase;color:#a3a3a3}
.contact{position:relative;display:flex;gap:7mm;margin-top:4.5mm;padding-top:3mm;border-top:1px solid rgba(255,255,255,.1);font-size:8pt;color:#d4d4d4}
.contact span{display:flex;flex-direction:column;gap:1px}
.contact small{font-family:M,monospace;font-size:6pt;letter-spacing:.16em;text-transform:uppercase;color:#737373}
.star{position:absolute;right:16mm;top:20mm}
main{display:grid;grid-template-columns:1fr 60mm;gap:8mm;padding:7mm 14mm 0}
.label{display:flex;align-items:center;gap:8px;font-family:M,monospace;font-weight:400;font-size:6.8pt;letter-spacing:.18em;text-transform:uppercase;color:#141414;margin:0 0 3mm}
.label span{color:#8a8a8a}.label i{width:16px;height:1px;background:#a3a3a3}
section{margin-bottom:5mm}
p.summary{color:#404040;font-size:8.7pt}
.proj{padding:2.2mm 0;border-top:1px solid #e5e5e5}
.proj:first-of-type{border-top:0;padding-top:0}
.proj h3{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:9.4pt;font-weight:600;letter-spacing:-.02em;color:#0a0a0a}
.proj h3 small{font-family:M,monospace;font-weight:400;font-size:6.8pt;color:#8a8a8a}
.proj ul{margin:1mm 0 0;padding-left:0;list-style:none}
.proj li{position:relative;padding-left:10px;color:#404040}
.proj li:before{content:'';position:absolute;left:0;top:.62em;width:4px;height:1px;background:#737373}
.tags{display:flex;flex-wrap:wrap;gap:3px}
.tag{font-family:M,monospace;font-size:6.2pt;border:1px solid #d4d4d4;border-radius:3px;padding:1px 5px;color:#525252}
.row{display:flex;justify-content:space-between;align-items:baseline;padding:1.8mm 0;border-top:1px solid #ececec}
.row:first-of-type{border-top:0;padding-top:0}
.row b{font-weight:600;color:#0a0a0a;font-size:9pt}.row em{display:block;font-style:normal;color:#737373;font-size:8pt}
.row .y{font-family:M,monospace;font-size:7.6pt;color:#141414;text-align:right}.row .y small{display:block;font-size:6pt;color:#8a8a8a;letter-spacing:.1em;text-transform:uppercase}
.hours{margin-top:2mm;display:flex;gap:2px;height:4px}.hours i{border-radius:2px}
.hours-l{margin-top:1.4mm;font-family:M,monospace;font-size:6.4pt;color:#737373;letter-spacing:.06em}
aside{border-left:1px solid #e5e5e5;padding-left:7mm}
.skill{margin-bottom:3.2mm}.skill p{font-family:M,monospace;font-size:6.2pt;letter-spacing:.14em;text-transform:uppercase;color:#737373;margin-bottom:1.4mm}
.chips{display:flex;flex-wrap:wrap;gap:3px}.chip{font-size:7.4pt;background:#f2f2f2;border:1px solid #e5e5e5;border-radius:4px;padding:1px 6px;color:#262626}
.lang{margin-bottom:2.6mm}.lang div{display:flex;justify-content:space-between;font-size:8pt}.lang b{font-weight:600;color:#0a0a0a}.lang span{color:#737373}
.bar{margin-top:1.2mm;height:3px;border-radius:2px;background:#e5e5e5}.bar i{display:block;height:100%;border-radius:2px;background:#141414}
.diff li{list-style:none;position:relative;padding-left:12px;margin-bottom:1.6mm;color:#404040;font-size:8pt}
.diff li svg{position:absolute;left:0;top:.35em}
footer{position:absolute;left:14mm;right:14mm;bottom:6mm;display:flex;justify-content:space-between;font-family:M,monospace;font-size:6pt;letter-spacing:.14em;text-transform:uppercase;color:#a3a3a3;border-top:1px solid #ececec;padding-top:2.5mm}
.band{position:absolute;left:0;right:0;bottom:13mm;display:grid;grid-template-columns:1fr 1.25fr 1fr;gap:8mm;padding:6mm 14mm 0;border-top:1px solid #e5e5e5;background:#fff}
.band .label{margin-bottom:2.4mm}
.title-wrap{display:flex;align-items:baseline;gap:6px;white-space:nowrap}
</style></head><body>
<header>
  <div class="grid"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="glow"></div>
  <div class="top"><span class="eyebrow">DP — Curriculum Vitae · ${new Date().getFullYear()}</span><span class="pill"><b></b>${esc(c.status)}</span></div>
  <h1>${esc(profile.name)}</h1>
  <div class="star">${star(30, '#e5e5e5')}</div>
  <p class="role">${esc(c.role)}</p>
  <div class="contact">
    <span><small>E-mail</small>${esc(profile.email)}</span>
    <span><small>${c.lang === 'en' ? 'Phone' : 'Telefone'}</small>${esc(profile.phone)}</span>
    <span><small>${c.lang === 'en' ? 'Location' : 'Localização'}</small>${esc(profile.city)}${c.lang === 'en' ? ', Brazil' : ', Brasil'}</span>
  </div>
</header>
<main>
  <div>
    <section>${label(c.labels.profile)}<p class="summary">${esc(c.summary)}</p></section>
    <section>${label(c.labels.projects)}
      ${c.projects
        .map(
          (p) => `<div class="proj"><h3><span class="title-wrap">${esc(p.title)}${p.meta ? `<small>${p.meta}</small>` : ''}</span><span class="tags">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</span></h3><ul>${p.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul></div>`,
        )
        .join('')}
    </section>
  </div>
  <aside>
    <section>${label(c.labels.skills)}
      ${c.skills.map(([cat, items]) => `<div class="skill"><p>${esc(cat)}</p><div class="chips">${items.map((i) => `<span class="chip">${esc(i)}</span>`).join('')}</div></div>`).join('')}
    </section>
    <section>${label(c.labels.languages)}
      ${c.langs.map(([l, lv, v]) => `<div class="lang"><div><b>${esc(l)}</b><span>${esc(lv)}</span></div><div class="bar"><i style="width:${v * 100}%"></i></div></div>`).join('')}
    </section>
  </aside>
</main>
<div class="band">
    <section>${label(c.labels.education)}
      <div class="row"><div><b>${esc(c.education.title)}</b><em>${esc(c.education.school)}</em></div><div class="y">${c.education.year}<small>${esc(c.education.yearNote)}</small></div></div>
    </section>
    <section>${label(c.labels.courses)}
      ${c.courses.map(([t, m, y]) => `<div class="row"><div><b>${esc(t)}</b><em>${esc(m)}</em></div><div class="y">${y}</div></div>`).join('')}
      <div class="hours"><i style="flex:46;background:#0a0a0a"></i><i style="flex:80;background:#737373"></i><i style="flex:40;background:#c4c4c4"></i></div>
      <p class="hours-l">${esc(c.hours)}</p>
    </section>
    <section>${label(c.labels.differentials)}
      <ul class="diff">${c.differentials.map((d) => `<li>${star(7, '#262626')}${esc(d)}</li>`).join('')}</ul>
    </section>
</div>
<footer><span>${esc(profile.name)}</span><span>${c.lang === 'en' ? 'Designed & developed with curiosity' : 'Projetado e desenvolvido com curiosidade'}</span></footer>
</body></html>`
}

const outDir = join(root, 'public/cv')
mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch()
for (const c of Object.values(content)) {
  const page = await browser.newPage()
  const tmp = join(root, 'cv-source', `.cv-${c.lang}.html`)
  writeFileSync(tmp, html(c))
  await page.goto(pathToFileURL(tmp).href)
  await page.evaluate(() => document.fonts.ready)
  await page.pdf({ path: join(outDir, c.file), format: 'A4', printBackground: true, preferCSSPageSize: true })
  console.log('✓', c.file)
}
await browser.close()
