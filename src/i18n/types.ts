export type Lang = 'en' | 'pt'

export type Localized<T> = Record<Lang, T>

export const LANGS: Lang[] = ['en', 'pt']
