/** Colour math for the Design Lab: OKLCH → sRGB, hex parsing and WCAG 2.x contrast. */

export type RGB = [number, number, number] // 0..255

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export function oklchToRgb(L: number, C: number, H: number): RGB {
  const h = (H * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  return lin.map((c) => {
    const v = clamp01(c)
    return Math.round((v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055) * 255)
  }) as RGB
}

export const rgbToHex = ([r, g, b]: RGB) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')

export function hexToRgb(hex: string): RGB | null {
  const m = hex.trim().replace('#', '')
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m
  if (!/^[0-9a-f]{6}$/i.test(full)) return null
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as RGB
}

export function luminance([r, g, b]: RGB) {
  const ch = [r, g, b].map((v) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}

export function contrast(a: RGB, b: RGB) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** Nudges the foreground lighter/darker until it reaches the target ratio against bg. */
export function fixContrast(fg: RGB, bg: RGB, target = 4.5): RGB {
  const towardWhite = luminance(bg) < 0.4
  let cur = fg
  for (let i = 0; i < 100 && contrast(cur, bg) < target; i++) {
    cur = cur.map((v) => Math.round(towardWhite ? v + (255 - v) * 0.06 : v * 0.94)) as RGB
  }
  return cur
}

/** Black or white — whichever reads better on the given colour. */
export const onColor = (bg: RGB): RGB => (contrast([255, 255, 255], bg) >= contrast([10, 10, 10], bg) ? [255, 255, 255] : [10, 10, 10])
