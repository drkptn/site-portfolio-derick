/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public site URL, e.g. https://derickputini.com (used at build time for SEO tags). */
  readonly VITE_SITE_URL?: string
  /** JSON endpoint for the contact form (Formspree, Getform, Basin, custom backend…). */
  readonly VITE_FORM_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
