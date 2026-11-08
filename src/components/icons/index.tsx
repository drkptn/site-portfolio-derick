import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number }

/** Brand marks drawn as simple outlines to match the Lucide stroke style. */
export function LinkedInIcon({ size = 18, strokeWidth = 1.6, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="3" />
      <path d="M7.5 10.5v6M7.5 7.5v.01M11.5 16.5v-6M11.5 13c0-1.7 1.1-2.6 2.5-2.6s2.5.9 2.5 2.6v3.5" />
    </svg>
  )
}

export function GitHubIcon({ size = 18, strokeWidth = 1.6, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </svg>
  )
}

/** DP monogram with a four-point star — the site's mark (also used as favicon). */
export function Logo({ size = 28, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
      <rect x="0.5" y="0.5" width="31" height="31" rx="7" fill="#0a0a0a" stroke="#373737" />
      <path d="M8 9h4.6c4 0 6.4 2.6 6.4 7s-2.4 7-6.4 7H8V9Z" stroke="#f5f5f5" strokeWidth="1.8" />
      <path d="M24.5 6.5c.3 2.2 1 2.9 3.2 3.2-2.2.3-2.9 1-3.2 3.2-.3-2.2-1-2.9-3.2-3.2 2.2-.3 2.9-1 3.2-3.2Z" fill="#f5f5f5" />
      <path d="M21 23V16.4h2.6a2.3 2.3 0 0 1 0 4.6H21" stroke="#a3a3a3" strokeWidth="1.6" />
    </svg>
  )
}

/** Concave four-point star (echoes the chrome stars in the 3D hero). */
export function Spark({ size = 14, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 0c.6 7.4 4.6 11.4 12 12-7.4.6-11.4 4.6-12 12-.6-7.4-4.6-11.4-12-12 7.4-.6 11.4-4.6 12-12Z" fill="currentColor" />
    </svg>
  )
}
