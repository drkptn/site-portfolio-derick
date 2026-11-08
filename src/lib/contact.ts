import { profile } from '@/data/profile'

export interface ContactPayload {
  name: string
  email: string
  subject: string
  message: string
}

export type ContactField = keyof ContactPayload
export type ContactErrors = Partial<Record<ContactField, true>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const limits = { name: 80, email: 120, subject: 120, message: 2000 }

export function validate(values: ContactPayload): ContactErrors {
  const errors: ContactErrors = {}
  if (values.name.trim().length < 2) errors.name = true
  if (!EMAIL_RE.test(values.email.trim())) errors.email = true
  if (values.subject.trim().length < 3) errors.subject = true
  if (values.message.trim().length < 10) errors.message = true
  return errors
}

/** Endpoint is configured at build time — see .env.example. */
export const formEndpoint = (import.meta.env.VITE_FORM_ENDPOINT ?? '').trim()

/**
 * Sends the message as JSON. Works with Formspree / Getform / Basin or any backend
 * that accepts `POST application/json` and answers with a 2xx status.
 */
export async function sendContact(payload: ContactPayload, signal?: AbortSignal) {
  if (!formEndpoint) throw new Error('FORM_ENDPOINT_NOT_CONFIGURED')
  const res = await fetch(formEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      ...payload,
      _subject: `[Portfólio] ${payload.subject}`,
      _replyto: payload.email,
      _template: 'table',
      _captcha: 'false',
    }),
    signal,
  })
  if (!res.ok) throw new Error(`HTTP_${res.status}`)
  // FormSubmit answers 200 with { success: "false" } when it rejects a message
  const data = (await res.json().catch(() => ({}))) as { success?: string | boolean; message?: string }
  if (data.success === 'false' || data.success === false) throw new Error(data.message || 'REJECTED')
}

/** Fallback when no endpoint is configured: the visitor's own mail client. */
export function buildMailto({ name, email, subject, message }: ContactPayload) {
  const body = `${message}\n\n— ${name} <${email}>`
  return `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
