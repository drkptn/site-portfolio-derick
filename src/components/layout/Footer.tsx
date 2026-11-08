import { motion, useInView, useReducedMotion } from 'motion/react'
import { ArrowUp, ArrowUpRight } from 'lucide-react'
import { useRef, type MouseEvent } from 'react'
import { ease } from '@/animations/easing'
import { GitHubIcon, LinkedInIcon, Logo } from '@/components/icons'
import { CircleLoader } from '@/components/ui/CircleLoader'
import { Magnetic } from '@/components/ui/Magnetic'
import { navSections } from '@/data/sections'
import { profile } from '@/data/profile'
import { useLocalTime } from '@/hooks/useLocalTime'
import { useI18n } from '@/i18n/LanguageProvider'
import { useSmoothScroll } from '@/providers/SmoothScrollProvider'

export function Footer() {
  const { t, lang } = useI18n()
  const { scrollTo } = useSmoothScroll()
  const reduce = useReducedMotion()
  const wordRef = useRef<HTMLDivElement>(null)
  const inView = useInView(wordRef, { once: true, margin: '0px 0px -5% 0px' })
  const time = useLocalTime(profile.location.timeZone)
  const year = new Date().getFullYear()

  const go = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    scrollTo(`#${id}`)
  }

  const socials = [
    { label: 'E-mail', href: `mailto:${profile.email}`, icon: null },
    { label: 'LinkedIn', href: profile.links.linkedin, icon: LinkedInIcon },
    { label: 'GitHub', href: profile.links.github, icon: GitHubIcon },
    { label: t.footer.cv, href: `${import.meta.env.BASE_URL}${profile.cv[lang]}?v=${profile.cvVersion}`, icon: null, download: true },
  ]

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.07] pt-20 lg:pt-28">
      <div className="container-x grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <Logo size={34} />
            <span className="text-sm font-medium text-ink-900">{profile.name}</span>
          </div>
          <p className="mt-6 max-w-[26ch] text-[clamp(1.4rem,2.2vw,1.9rem)] font-medium leading-tight tracking-[-0.035em] text-ink-900">
            {t.footer.tagline}
          </p>
          <p className="eyebrow mt-6 text-ink-500">React · TypeScript · Three.js · Motion</p>
        </div>

        <nav aria-label={t.footer.navigation} className="md:col-span-2 md:col-start-7">
          <h2 className="eyebrow mb-5 text-ink-600">{t.footer.navigation}</h2>
          <ul className="grid grid-cols-2 gap-y-3 md:grid-cols-1">
            {navSections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={(e) => go(e, s.id)} className="group inline-flex items-center gap-2 text-sm text-ink-600 transition-colors hover:text-ink-950">
                  <span className="font-mono text-[0.625rem] text-ink-500">{s.index}</span>
                  <span className="relative">
                    {t.nav[s.navKey!]}
                    <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-ink-900 transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <h2 className="eyebrow mb-5 text-ink-600">{t.footer.elsewhere}</h2>
          <ul className="space-y-3">
            {socials.map(({ label, href, icon: Icon, download }) => (
              <li key={label}>
                {href ? (
                  <a
                    href={href}
                    {...(download ? { download: href.split('/').pop()?.split('?')[0] } : href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="group inline-flex items-center gap-2 text-sm text-ink-600 transition-colors hover:text-ink-950"
                  >
                    {Icon && <Icon size={14} />}
                    {label}
                    <ArrowUpRight size={13} strokeWidth={1.5} className="opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:opacity-100" aria-hidden="true" />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm text-ink-500" aria-disabled="true">
                    {Icon && <Icon size={14} />}
                    {label}
                    <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em]">· {t.projects.modal.soon}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex md:col-span-1 md:col-start-12 md:justify-end">
          <Magnetic>
            <button
              type="button"
              onClick={() => scrollTo('top')}
              aria-label={t.nav.backToTop}
              className="group flex size-14 items-center justify-center rounded-full border border-ink-300 text-ink-700 transition-colors duration-500 hover:border-ink-900 hover:bg-ink-900 hover:text-ink-0"
            >
              <ArrowUp size={18} strokeWidth={1.5} className="transition-transform duration-500 group-hover:-translate-y-0.5" aria-hidden="true" />
            </button>
          </Magnetic>
        </div>
      </div>

      {/* Giant wordmark */}
      <div ref={wordRef} aria-hidden="true" className="container-x mt-20 select-none overflow-hidden lg:mt-28">
        <p className="flex justify-between whitespace-nowrap text-[clamp(3rem,13.4vw,15rem)] font-semibold uppercase leading-[0.78] tracking-[-0.065em] [mask-image:linear-gradient(to_bottom,black_35%,transparent_95%)]">
          {'Derick Putini'.split('').map((ch, i) => (
            <motion.span
              key={i}
              className="text-metal inline-block"
              initial={reduce ? false : { y: '100%', opacity: 0 }}
              animate={inView || reduce ? { y: '0%', opacity: 1 } : undefined}
              transition={{ duration: 1.2, ease: ease.outExpo, delay: i * 0.035 }}
            >
              {ch === ' ' ? ' ' : ch}
            </motion.span>
          ))}
        </p>
      </div>

      <div className="container-x relative flex flex-col gap-4 border-t border-white/[0.07] py-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {profile.name}. {t.footer.rights}
        </p>
        <p className="flex items-center gap-2.5 text-ink-600">
          <CircleLoader size={14} stroke={1.5} className="text-ink-600" />
          {t.footer.theEnd}
        </p>
        <p className="font-mono tabular-nums">
          {profile.location.city} · {time}
        </p>
      </div>
    </footer>
  )
}
