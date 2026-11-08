/** Tiny className joiner — avoids pulling a dependency for something this small. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}
