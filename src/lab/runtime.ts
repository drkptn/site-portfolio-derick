/** Absolute URL of a self-hosted runtime file (works under any base path). */
export const runtimeUrl = (path: string) => new URL(`runtimes/${path}`, document.baseURI).href
