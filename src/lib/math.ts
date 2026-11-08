export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/** Wraps v into [min, max) — used for seamless marquees. */
export const wrap = (min: number, max: number, v: number) => {
  const range = max - min
  return ((((v - min) % range) + range) % range) + min
}
