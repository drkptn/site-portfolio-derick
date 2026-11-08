import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, Check, CircleAlert, Copy, Mail, MapPin, Phone, Send } from 'lucide-react'
import { useId, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { ease } from '@/animations/easing'
import { GitHubIcon, LinkedInIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import { CircleLoader } from '@/components/ui/CircleLoader'
import { Reveal } from '@/components/ui/Reveal'
import { RevealText } from '@/components/ui/RevealText'
import { SectionLabel } from '@/components/ui/SectionHeading'
import { profile } from '@/data/profile'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { useLocalTime } from '@/hooks/useLocalTime'
import { useI18n } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/cn'
import {
  buildMailto,
  formEndpoint,
  limits,
  sendContact,
  validate,
  type ContactErrors,
  type ContactField,
  type ContactPayload,
} from '@/lib/contact'

export function Contact() {
  const { t } = useI18n()
  const c = t.contact

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden py-28 lg:py-40">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px hairline" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[70vh] w-[110vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgb(200_212_228/0.07),transparent_60%)]" />
      <div className="container-x">
        <SectionLabel index="07" label={c.label} />
        <RevealText
          as="h2"
          id="contact-title"
          className="mt-8 max-w-[14ch] text-[clamp(3rem,9vw,9.5rem)] font-medium leading-[0.9] tracking-[-0.055em]"
          parts={[
            { text: c.titleDim, className: 'text-dim' },
            { text: c.titleBright, className: 'text-ink-950' },
          ]}
        />

        <div className="mt-16 grid gap-14 lg:mt-24 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="max-w-[40ch] text-[1.0625rem] leading-relaxed text-ink-600">{c.description}</p>
            </Reveal>
            <Reveal delay={0.1} className="mt-10">
              <ContactList />
            </Reveal>
          </div>
          <Reveal className="lg:col-span-7" delay={0.15} y={40}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */

function ContactList() {
  const { t, lang } = useI18n()
  const c = t.contact
  const time = useLocalTime(profile.location.timeZone)

  return (
    <ul className="border-t border-white/[0.08]">
      <Row icon={<Mail size={16} strokeWidth={1.5} />} label={c.email}>
        <a href={`mailto:${profile.email}`} className="truncate text-ink-900 underline-offset-4 hover:underline" data-cursor="open">
          {profile.email}
        </a>
        <CopyButton value={profile.email} label={c.copyEmail} />
      </Row>
      <Row icon={<Phone size={16} strokeWidth={1.5} />} label={c.phone}>
        <a href={profile.phoneHref} className="text-ink-900 underline-offset-4 hover:underline">
          {profile.phone}
        </a>
        <CopyButton value={profile.phone} label={c.copyPhone} />
      </Row>
      <Row icon={<MapPin size={16} strokeWidth={1.5} />} label={c.location}>
        <span className="text-ink-900">
          {profile.location.city}, {profile.location.region} — {profile.location.country[lang]}
        </span>
        <span className="font-mono text-[0.6875rem] tabular-nums text-ink-500">{time}</span>
      </Row>
      <SocialRow icon={<LinkedInIcon size={16} />} label={c.linkedin} href={profile.links.linkedin} soon={c.soon} />
      <SocialRow icon={<GitHubIcon size={16} />} label={c.github} href={profile.links.github} soon={c.soon} />
    </ul>
  )
}

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[2.5rem_1fr] items-center gap-x-3 border-b border-white/[0.08] py-4">
      <span className="flex size-9 items-center justify-center rounded-[6px] border border-ink-200 text-ink-600" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="eyebrow mb-1.5 text-[0.625rem]">{label}</p>
        <div className="flex min-w-0 items-center justify-between gap-3 text-[0.9375rem]">{children}</div>
      </div>
    </li>
  )
}

function SocialRow({ icon, label, href, soon }: { icon: ReactNode; label: string; href: string; soon: string }) {
  return (
    <li className="border-b border-white/[0.08]">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="open"
          className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-3 py-4"
        >
          <span className="flex size-9 items-center justify-center rounded-[6px] border border-ink-200 text-ink-600 transition-colors group-hover:border-ink-500 group-hover:text-ink-950" aria-hidden="true">
            {icon}
          </span>
          <span className="text-[0.9375rem] text-ink-900">{label}</span>
          <ArrowUpRight size={16} strokeWidth={1.5} className="text-ink-500 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink-950" aria-hidden="true" />
        </a>
      ) : (
        <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-3 py-4" aria-disabled="true">
          <span className="flex size-9 items-center justify-center rounded-[6px] border border-dashed border-ink-300 text-ink-500" aria-hidden="true">
            {icon}
          </span>
          <span className="text-[0.9375rem] text-ink-500">{label}</span>
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-500">{soon}</span>
        </div>
      )}
    </li>
  )
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const { t } = useI18n()
  const { copied, copy } = useCopyToClipboard()
  return (
    <button
      type="button"
      onClick={() => copy(value)}
      aria-label={label}
      data-cursor="copy"
      className={cn(
        'relative flex h-8 shrink-0 items-center gap-1.5 overflow-hidden rounded-[5px] border px-2.5 font-mono text-[0.625rem] uppercase tracking-[0.12em] transition-colors duration-300',
        copied ? 'border-ink-900 bg-ink-900 text-ink-0' : 'border-ink-200 text-ink-600 hover:border-ink-500 hover:text-ink-950',
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? 'ok' : 'copy'}
          className="flex items-center gap-1.5"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.25, ease: ease.outExpo }}
        >
          {copied ? <Check size={12} strokeWidth={2} aria-hidden="true" /> : <Copy size={12} strokeWidth={1.5} aria-hidden="true" />}
          {copied ? t.contact.copied : t.contact.copy}
        </motion.span>
      </AnimatePresence>
      <span className="sr-only" aria-live="polite">
        {copied ? t.contact.copied : ''}
      </span>
    </button>
  )
}

/* -------------------------------------------------------------------------- */

type Status = 'idle' | 'sending' | 'success' | 'error' | 'fallback'
const empty: ContactPayload = { name: '', email: '', subject: '', message: '' }

function ContactForm() {
  const { t } = useI18n()
  const f = t.contact.form
  const reduce = useReducedMotion()
  const [values, setValues] = useState<ContactPayload>(empty)
  const [errors, setErrors] = useState<ContactErrors>({})
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [honeypot, setHoneypot] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const onChange = (field: ContactField) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...values, [field]: e.target.value }
    setValues(next)
    if (touched[field]) setErrors(validate(next))
    if (status === 'success' || status === 'error' || status === 'fallback') setStatus('idle')
  }
  const onBlur = (field: ContactField) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors(validate(values))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    setTouched({ name: true, email: true, subject: true, message: true })
    if (Object.keys(found).length > 0) {
      const first = (Object.keys(found) as ContactField[])[0]
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    if (honeypot) return // likely a bot

    if (!formEndpoint) {
      // No service connected: hand the message to the visitor's mail client instead of faking success
      window.location.href = buildMailto(values)
      setStatus('fallback')
      return
    }

    setStatus('sending')
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 15000)
    try {
      await sendContact(values, controller.signal)
      setStatus('success')
      setValues(empty)
      setTouched({})
    } catch {
      setStatus('error')
    } finally {
      window.clearTimeout(timeout)
    }
  }

  const sending = status === 'sending'

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="surface relative overflow-hidden rounded-[12px] p-6 sm:p-8 lg:p-10"
      aria-labelledby="contact-form-title"
    >
      <div className="mb-10 flex items-center justify-between gap-4">
        <h3 id="contact-form-title" className="text-xl font-medium tracking-[-0.03em] text-ink-900">
          {f.title}
        </h3>
        <span className="eyebrow flex items-center gap-2">
          <span className="size-1.5 animate-pulse-dot rounded-full bg-ink-900" aria-hidden="true" />
          {t.contact.open}
        </span>
      </div>

      {/* Honeypot (hidden from people and assistive tech) */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} name="company" />
        </label>
      </div>

      <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
        <Field label={f.name} error={errors.name && touched.name ? f.errors.name : undefined}>
          {(id, describedBy) => (
            <input
              id={id}
              name="name"
              autoComplete="name"
              placeholder={f.namePh}
              value={values.name}
              maxLength={limits.name}
              onChange={onChange('name')}
              onBlur={onBlur('name')}
              aria-invalid={Boolean(errors.name && touched.name)}
              aria-describedby={describedBy}
              required
              className={inputClass}
            />
          )}
        </Field>
        <Field label={f.email} error={errors.email && touched.email ? f.errors.email : undefined}>
          {(id, describedBy) => (
            <input
              id={id}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={f.emailPh}
              value={values.email}
              maxLength={limits.email}
              onChange={onChange('email')}
              onBlur={onBlur('email')}
              aria-invalid={Boolean(errors.email && touched.email)}
              aria-describedby={describedBy}
              required
              className={inputClass}
            />
          )}
        </Field>
        <Field label={f.subject} error={errors.subject && touched.subject ? f.errors.subject : undefined} className="sm:col-span-2">
          {(id, describedBy) => (
            <input
              id={id}
              name="subject"
              placeholder={f.subjectPh}
              value={values.subject}
              maxLength={limits.subject}
              onChange={onChange('subject')}
              onBlur={onBlur('subject')}
              aria-invalid={Boolean(errors.subject && touched.subject)}
              aria-describedby={describedBy}
              required
              className={inputClass}
            />
          )}
        </Field>
        <Field
          label={f.message}
          error={errors.message && touched.message ? f.errors.message : undefined}
          className="sm:col-span-2"
          aside={`${values.message.length}/${limits.message}`}
        >
          {(id, describedBy) => (
            <textarea
              id={id}
              name="message"
              rows={5}
              placeholder={f.messagePh}
              value={values.message}
              maxLength={limits.message}
              onChange={onChange('message')}
              onBlur={onBlur('message')}
              aria-invalid={Boolean(errors.message && touched.message)}
              aria-describedby={describedBy}
              required
              data-lenis-prevent
              className={cn(inputClass, 'min-h-32 resize-y')}
            />
          )}
        </Field>
      </div>

      <div className="mt-10 flex flex-col-reverse items-start justify-between gap-6 sm:flex-row sm:items-center">
        <p className="max-w-[34ch] text-xs leading-relaxed text-ink-500">{f.privacy}</p>
        <Button type="submit" disabled={sending} cursor="send" icon={sending ? SpinnerIcon : Send} className="min-w-44 justify-between">
          {sending ? f.sending : f.submit}
        </Button>
      </div>

      <div aria-live="polite" role="status" className="min-h-0">
        <AnimatePresence>
          {(status === 'success' || status === 'error' || status === 'fallback') && (
            <motion.div
              key={status}
              initial={reduce ? false : { opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: ease.outExpo }}
              className="overflow-hidden"
            >
              <p
                className={cn(
                  'mt-6 flex items-start gap-3 rounded-[8px] border px-4 py-3 text-sm leading-relaxed',
                  status === 'error' ? 'border-white/20 bg-white/[0.04] text-ink-800' : 'border-white/10 bg-ink-100/60 text-ink-700',
                )}
              >
                {status === 'error' ? (
                  <CircleAlert size={17} strokeWidth={1.5} className="mt-0.5 shrink-0" aria-hidden="true" />
                ) : (
                  <Check size={17} strokeWidth={1.75} className="mt-0.5 shrink-0" aria-hidden="true" />
                )}
                {status === 'success' ? f.success : status === 'error' ? f.error : f.fallback}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  )
}

const inputClass =
  'peer w-full border-0 border-b border-ink-300 bg-transparent px-0 pb-3 pt-1 text-[1rem] text-ink-950 outline-none transition-colors duration-300 placeholder:text-ink-400 hover:border-ink-500 focus:border-ink-900 focus-visible:outline-none aria-[invalid=true]:border-white/70'

function Field({
  label,
  error,
  className,
  aside,
  children,
}: {
  label: string
  error?: string
  className?: string
  aside?: string
  children: (id: string, describedBy: string | undefined) => ReactNode
}) {
  const id = useId()
  const errorId = `${id}-error`
  return (
    <div className={cn('group relative', className)}>
      <div className="mb-3 flex items-baseline justify-between">
        <label htmlFor={id} className="eyebrow text-ink-600 transition-colors group-focus-within:text-ink-900">
          {label} <span className="text-ink-500" aria-hidden="true">*</span>
        </label>
        {aside && <span className="font-mono text-[0.625rem] tabular-nums text-ink-500">{aside}</span>}
      </div>
      <div className="relative">
        {children(id, error ? errorId : undefined)}
        {/* Animated focus underline */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-ink-950 transition-transform duration-500 ease-[var(--ease-out-expo)] group-focus-within:scale-x-100"
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            id={errorId}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 flex items-center gap-1.5 text-xs text-ink-700"
          >
            <CircleAlert size={12} strokeWidth={1.75} aria-hidden="true" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function SpinnerIcon({ size = 16 }: { size?: number | string }) {
  return <CircleLoader size={Number(size)} stroke={1.75} />
}
