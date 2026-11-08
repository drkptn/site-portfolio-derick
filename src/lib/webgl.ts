let cached: boolean | undefined

/** Feature-detect WebGL once, so the 3D scene can fall back gracefully. */
export function hasWebGL() {
  if (cached !== undefined) return cached
  try {
    const canvas = document.createElement('canvas')
    cached = Boolean(
      window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    )
  } catch {
    cached = false
  }
  return cached
}
