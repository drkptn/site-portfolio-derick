import { CodeMockup } from '@/components/mockups/CodeMockup'
import { DashboardMockup } from '@/components/mockups/DashboardMockup'
import { WebMockup } from '@/components/mockups/WebMockup'
import type { Project } from '@/data/projects'
import { useI18n } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/cn'

/** Concept visual for a project, always shown with an explicit "concept" badge. */
export function ProjectVisual({ project, className, badge = true }: { project: Project; className?: string; badge?: boolean }) {
  const { t, l } = useI18n()
  const label = `${t.projects.concept}: ${l(project.title)}`
  const Mockup = { code: CodeMockup, dashboard: DashboardMockup, web: WebMockup }[project.visual]

  return (
    <div className={cn('relative overflow-hidden rounded-[12px] border border-white/[0.08] bg-ink-75', className)}>
      <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(200_212_228/0.08),transparent)]" />
      {badge && (
        <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink-0/60 px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-600 backdrop-blur-md">
          <span className="size-1.5 rounded-full border border-ink-500" aria-hidden="true" />
          {t.projects.concept}
        </span>
      )}
      <div className="relative px-[5%] pb-[5%] pt-[9%] transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover/visual:scale-[1.025]">
        <Mockup label={label} />
      </div>
    </div>
  )
}
