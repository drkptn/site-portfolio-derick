export type LabId = 'code' | 'data' | 'design' | 'algorithms'

export const LAB_IDS: LabId[] = ['code', 'data', 'design', 'algorithms']

const EVENT = 'lab:open'

/** Ask the Lab section to show a given app (used by "Try it live" buttons). */
export function openLab(id: LabId) {
  window.dispatchEvent(new CustomEvent<LabId>(EVENT, { detail: id }))
}

export function onOpenLab(handler: (id: LabId) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<LabId>).detail)
  window.addEventListener(EVENT, listener)
  return () => window.removeEventListener(EVENT, listener)
}
