import { MotionConfig } from 'motion/react'
import { CustomCursor } from '@/components/cursor/CustomCursor'
import { Navbar } from '@/components/layout/Navbar'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
import { Preloader } from '@/components/preloader/Preloader'
import { LanguageProvider, useI18n } from '@/i18n/LanguageProvider'
import { AppStateProvider } from '@/providers/AppStateProvider'
import { SmoothScrollProvider } from '@/providers/SmoothScrollProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { Footer } from '@/components/layout/Footer'
import { PageProgress } from '@/components/layout/PageProgress'
import { About } from '@/sections/About'
import { Contact } from '@/sections/Contact'
import { Differentials } from '@/sections/Differentials'
import { DisciplineMarquee } from '@/sections/DisciplineMarquee'
import { Education } from '@/sections/Education'
import { Hero } from '@/sections/Hero'
import { Lab } from '@/sections/Lab'
import { Projects } from '@/sections/Projects'
import { Skills } from '@/sections/Skills'

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
      <LanguageProvider>
        <AppStateProvider>
          <SmoothScrollProvider>
            <Shell />
          </SmoothScrollProvider>
        </AppStateProvider>
      </LanguageProvider>
      </ThemeProvider>
    </MotionConfig>
  )
}

function Shell() {
  const { t } = useI18n()
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-md focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-sm focus:text-ink-0"
      >
        {t.meta.skip}
      </a>
      <Preloader />
      <CustomCursor />
      <ScrollProgress />
      <div aria-hidden="true" className="grain pointer-events-none fixed inset-0 z-[95] opacity-[0.045]" />
      <Navbar />
      <main id="main">
        <Hero />
        <DisciplineMarquee />
        <About />
        <Skills />
        <Projects />
        <Lab />
        <Education />
        <Differentials />
        <Contact />
      </main>
      <Footer />
      <PageProgress />
    </>
  )
}
