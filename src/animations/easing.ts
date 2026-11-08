/** Shared motion language — keep every animation on the same curves. */
export const ease = {
  outExpo: [0.16, 1, 0.3, 1] as const,
  outQuart: [0.25, 1, 0.5, 1] as const,
  inOutQuart: [0.76, 0, 0.24, 1] as const,
  inOutCirc: [0.85, 0, 0.15, 1] as const,
}

export const duration = {
  fast: 0.35,
  base: 0.7,
  slow: 1.1,
  cinematic: 1.4,
}
