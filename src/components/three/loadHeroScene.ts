let promise: Promise<typeof import('./HeroScene')> | null = null

/** Shared dynamic import so the preloader and React.lazy reuse the same request. */
export function loadHeroScene() {
  promise ??= import('./HeroScene')
  return promise
}

let markReady: () => void = () => {}
const ready = new Promise<void>((resolve) => {
  markReady = resolve
})

/** Resolves once the 3D scene has its environment and compiled shaders (first frame is cheap). */
export const heroSceneReady = () => ready

/** Called by the scene itself when it is ready to render without stalling. */
export const signalHeroSceneReady = () => markReady()
