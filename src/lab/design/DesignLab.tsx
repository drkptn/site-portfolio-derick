import { ArrowLeftRight, Bell, Check, Copy, Wand2, X } from 'lucide-react'
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { useI18n } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/cn'
import { LabFrame, Segmented, ToolButton } from '../LabFrame'
import { contrast, fixContrast, hexToRgb, oklchToRgb, onColor, rgbToHex, type RGB } from './color'

const copy = {
  en: {
    tokens: 'Tokens', accent: 'Accent', mono: 'Mono', color: 'Color', hue: 'Hue', radius: 'Radius', density: 'Density',
    base: 'Base size', ratio: 'Type scale', shadow: 'Shadow', none: 'None', soft: 'Soft', deep: 'Deep', theme: 'Preview',
    light: 'Light', dark: 'Dark', preview: 'Live preview', tab: 'Panel', contrastTab: 'Contrast checker', exportTab: 'Export CSS', scaleTab: 'Type scale',
    text: 'Text', background: 'Background', swap: 'Swap', fix: 'Fix to AA', normal: 'Normal text', large: 'Large text', copy: 'Copy', copied: 'Copied',
    sampleTitle: 'Plan your next sprint', sampleBody: 'Tokens drive every component — change one value and the whole system follows.',
    primary: 'Get started', secondary: 'Learn more', email: 'E-mail', notify: 'Notifications', saved: 'Changes saved', progress: 'Design system adoption',
    pass: 'Pass', fail: 'Fail',
  },
  pt: {
    tokens: 'Tokens', accent: 'Destaque', mono: 'Mono', color: 'Cor', hue: 'Matiz', radius: 'Raio', density: 'Densidade',
    base: 'Tamanho base', ratio: 'Escala tipográfica', shadow: 'Sombra', none: 'Nenhuma', soft: 'Suave', deep: 'Profunda', theme: 'Prévia',
    light: 'Claro', dark: 'Escuro', preview: 'Prévia ao vivo', tab: 'Painel', contrastTab: 'Verificador de contraste', exportTab: 'Exportar CSS', scaleTab: 'Escala tipográfica',
    text: 'Texto', background: 'Fundo', swap: 'Inverter', fix: 'Corrigir p/ AA', normal: 'Texto normal', large: 'Texto grande', copy: 'Copiar', copied: 'Copiado',
    sampleTitle: 'Planeje sua próxima sprint', sampleBody: 'Tokens controlam cada componente — mude um valor e o sistema inteiro acompanha.',
    primary: 'Começar', secondary: 'Saiba mais', email: 'E-mail', notify: 'Notificações', saved: 'Alterações salvas', progress: 'Adoção do design system',
    pass: 'Passa', fail: 'Falha',
  },
}

const RATIOS = [
  { value: '1.2', label: '1.200 · Minor third' },
  { value: '1.25', label: '1.250 · Major third' },
  { value: '1.333', label: '1.333 · Perfect fourth' },
  { value: '1.5', label: '1.500 · Perfect fifth' },
]

export default function DesignLab() {
  const { lang } = useI18n()
  const c = copy[lang]
  const [mono, setMono] = useState(true)
  const [hue, setHue] = useState(250)
  const [radius, setRadius] = useState(8)
  const [density, setDensity] = useState(1)
  const [base, setBase] = useState(16)
  const [ratio, setRatio] = useState('1.25')
  const [shadow, setShadow] = useState<'none' | 'soft' | 'deep'>('soft')
  const [scheme, setScheme] = useState<'light' | 'dark'>('light')
  const [panel, setPanel] = useState<'contrast' | 'scale' | 'export'>('contrast')

  const dark = scheme === 'dark'
  const accent: RGB = mono ? (dark ? [245, 245, 245] : [20, 20, 20]) : oklchToRgb(dark ? 0.72 : 0.55, 0.16, hue)
  const tokens = {
    bg: dark ? '#0f0f0f' : '#ffffff',
    surface: dark ? '#181818' : '#f6f6f6',
    border: dark ? '#2a2a2a' : '#e3e3e3',
    text: dark ? '#f2f2f2' : '#141414',
    muted: dark ? '#9a9a9a' : '#5f5f5f',
    accent: rgbToHex(accent),
    onAccent: rgbToHex(onColor(accent)),
  }
  const sizes = [-1, 0, 1, 2, 3, 4].map((step) => +(base * Number(ratio) ** step).toFixed(2))
  const space = (n: number) => `${(n * 4 * density).toFixed(1)}px`
  const shadowCss = { none: 'none', soft: '0 8px 24px -12px rgba(0,0,0,.25)', deep: '0 24px 60px -20px rgba(0,0,0,.55)' }[shadow]

  const vars = {
    '--d-bg': tokens.bg,
    '--d-surface': tokens.surface,
    '--d-border': tokens.border,
    '--d-text': tokens.text,
    '--d-muted': tokens.muted,
    '--d-accent': tokens.accent,
    '--d-on-accent': tokens.onAccent,
    '--d-radius': `${radius}px`,
    '--d-shadow': shadowCss,
  } as CSSProperties

  const css = `:root {
  /* colour */
  --color-bg: ${tokens.bg};
  --color-surface: ${tokens.surface};
  --color-border: ${tokens.border};
  --color-text: ${tokens.text};
  --color-muted: ${tokens.muted};
  --color-accent: ${tokens.accent};
  --color-on-accent: ${tokens.onAccent};
  /* shape & depth */
  --radius: ${radius}px;
  --shadow: ${shadowCss};
  /* spacing (4px grid × ${density}) */
${[1, 2, 3, 4, 6, 8].map((n) => `  --space-${n}: ${space(n)};`).join('\n')}
  /* type scale (base ${base}px × ${ratio}) */
${['sm', 'base', 'lg', 'xl', '2xl', '3xl'].map((k, i) => `  --text-${k}: ${(sizes[i] / 16).toFixed(3)}rem;`).join('\n')}
}`

  return (
    <LabFrame file="tokens.css" live={c.preview}>
      <div className="grid lg:grid-cols-[18rem_1fr]">
        {/* Controls */}
        <div className="space-y-5 border-b border-white/[0.07] p-4 sm:p-5 lg:border-b-0 lg:border-r">
          <p className="eyebrow">{c.tokens}</p>
          <Field label={c.accent}>
            <Segmented label={c.accent} value={mono ? 'mono' : 'color'} onChange={(v) => setMono(v === 'mono')} options={[{ value: 'mono', label: c.mono }, { value: 'color', label: c.color }]} />
          </Field>
          <Range label={c.hue} value={hue} min={0} max={360} onChange={setHue} disabled={mono} suffix="°" hueTrack />
          <Range label={c.radius} value={radius} min={0} max={24} onChange={setRadius} suffix="px" />
          <Range label={c.density} value={density} min={0.75} max={1.5} step={0.05} onChange={setDensity} suffix="×" />
          <Range label={c.base} value={base} min={14} max={18} onChange={setBase} suffix="px" />
          <Field label={c.ratio}>
            <select value={ratio} onChange={(e) => setRatio(e.target.value)} className="h-9 w-full rounded-[6px] border border-ink-200 bg-ink-100 px-2 text-base text-ink-900 sm:text-xs">
              {RATIOS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label={c.shadow}>
            <Segmented label={c.shadow} value={shadow} onChange={setShadow} options={[{ value: 'none', label: c.none }, { value: 'soft', label: c.soft }, { value: 'deep', label: c.deep }]} />
          </Field>
          <Field label={c.theme}>
            <Segmented label={c.theme} value={scheme} onChange={setScheme} options={[{ value: 'light', label: c.light }, { value: 'dark', label: c.dark }]} />
          </Field>
        </div>

        {/* Preview */}
        <div className="min-w-0">
          <div style={vars} className="p-4 transition-colors duration-500 sm:p-6" aria-label={c.preview}>
            <div className="rounded-[calc(var(--d-radius)+6px)] p-[3px]" style={{ background: tokens.bg }}>
              <Preview c={c} space={space} sizes={sizes} />
            </div>
          </div>

          <div className="border-t border-white/[0.07] p-4 sm:p-5">
            <Segmented
              label={c.tab}
              value={panel}
              onChange={setPanel}
              options={[
                { value: 'contrast', label: c.contrastTab },
                { value: 'scale', label: c.scaleTab },
                { value: 'export', label: c.exportTab },
              ]}
            />
            <div className="mt-4">
              {panel === 'contrast' && <ContrastChecker c={c} initialFg={tokens.muted} initialBg={tokens.bg} key={scheme} />}
              {panel === 'scale' && (
                <ul className="space-y-2">
                  {[...sizes].reverse().map((s, i) => (
                    <li key={i} className="flex items-baseline gap-4 border-b border-white/[0.06] pb-2">
                      <span className="w-20 shrink-0 font-mono text-[11px] text-ink-500">
                        {s}px · {['3xl', '2xl', 'xl', 'lg', 'base', 'sm'][i]}
                      </span>
                      <span className="truncate font-medium tracking-[-0.02em] text-ink-900" style={{ fontSize: Math.min(s, 44) }}>
                        Derick Putini
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {panel === 'export' && <CodeBlock code={css} c={c} />}
            </div>
          </div>
        </div>
      </div>
    </LabFrame>
  )
}

/* ----------------------------------------------------------- Live preview */

function Preview({ c, space, sizes }: { c: (typeof copy)['en']; space: (n: number) => string; sizes: number[] }) {
  const [on, setOn] = useState(true)
  const [email, setEmail] = useState('')
  const box = 'border border-[var(--d-border)] bg-[var(--d-surface)] rounded-[var(--d-radius)] shadow-[var(--d-shadow)]'
  return (
    <div className="grid gap-3 rounded-[calc(var(--d-radius)+4px)] bg-[var(--d-bg)] text-[var(--d-text)] transition-colors duration-500 md:grid-cols-[1.3fr_1fr]" style={{ padding: space(4) }}>
      <div className={box} style={{ padding: space(6) }}>
        <span className="inline-flex items-center rounded-full border border-[var(--d-border)] px-2 py-0.5 text-[11px] text-[var(--d-muted)]">v2.0 · tokens</span>
        <p className="font-semibold leading-tight tracking-[-0.03em]" style={{ fontSize: sizes[3], marginTop: space(3) }}>
          {c.sampleTitle}
        </p>
        <p className="leading-relaxed text-[var(--d-muted)]" style={{ fontSize: sizes[1], marginTop: space(2) }}>
          {c.sampleBody}
        </p>
        <div className="flex flex-wrap" style={{ gap: space(2), marginTop: space(5) }}>
          <button type="button" className="rounded-[var(--d-radius)] bg-[var(--d-accent)] font-medium text-[var(--d-on-accent)] transition-transform active:scale-95" style={{ padding: `${space(2.5)} ${space(4)}`, fontSize: sizes[0] }}>
            {c.primary}
          </button>
          <button type="button" className="rounded-[var(--d-radius)] border border-[var(--d-border)] font-medium" style={{ padding: `${space(2.5)} ${space(4)}`, fontSize: sizes[0] }}>
            {c.secondary}
          </button>
        </div>
        <label className="block" style={{ marginTop: space(5) }}>
          <span className="block text-[var(--d-muted)]" style={{ fontSize: sizes[0] - 1, marginBottom: space(1.5) }}>
            {c.email}
          </span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-[var(--d-radius)] border border-[var(--d-border)] bg-[var(--d-bg)] text-base outline-none placeholder:text-[var(--d-muted)] focus:border-[var(--d-accent)] sm:text-sm"
            style={{ padding: `${space(2.5)} ${space(3)}` }}
          />
        </label>
      </div>
      <div className="grid content-start" style={{ gap: space(3) }}>
        <div className={cn(box, 'flex items-center justify-between')} style={{ padding: space(4) }}>
          <span className="flex items-center gap-2" style={{ fontSize: sizes[1] - 1 }}>
            <Bell size={15} aria-hidden="true" /> {c.notify}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label={c.notify}
            onClick={() => setOn(!on)}
            className="relative h-6 w-11 rounded-full transition-colors duration-300"
            style={{ background: on ? 'var(--d-accent)' : 'var(--d-border)' }}
          >
            <span className="absolute top-0.5 size-5 rounded-full bg-[var(--d-bg)] shadow transition-[left] duration-300" style={{ left: on ? 22 : 2 }} />
          </button>
        </div>
        <div className={box} style={{ padding: space(4) }}>
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-[var(--d-accent)] text-xs font-semibold text-[var(--d-on-accent)]">DP</span>
            <span>
              <span className="block font-medium" style={{ fontSize: sizes[1] - 1 }}>Derick Putini</span>
              <span className="block text-[var(--d-muted)]" style={{ fontSize: sizes[0] - 1 }}>UI · Front-End</span>
            </span>
          </div>
          <p className="text-[var(--d-muted)]" style={{ fontSize: sizes[0] - 1, marginTop: space(4) }}>
            {c.progress}
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--d-border)]" style={{ marginTop: space(2) }}>
            <div className="h-full w-[72%] rounded-full bg-[var(--d-accent)]" />
          </div>
        </div>
        <div className={cn(box, 'flex items-center gap-2')} style={{ padding: space(3), fontSize: sizes[0] }} role="status">
          <span className="flex size-5 items-center justify-center rounded-full bg-[var(--d-accent)] text-[var(--d-on-accent)]">
            <Check size={12} strokeWidth={2.5} aria-hidden="true" />
          </span>
          {c.saved}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------- Contrast checker */

function ContrastChecker({ c, initialFg, initialBg }: { c: (typeof copy)['en']; initialFg: string; initialBg: string }) {
  const [fg, setFg] = useState(initialFg)
  const [bg, setBg] = useState(initialBg)
  const fgRgb = hexToRgb(fg)
  const bgRgb = hexToRgb(bg)
  const ratio = fgRgb && bgRgb ? contrast(fgRgb, bgRgb) : null
  const checks = useMemo(
    () =>
      ratio === null
        ? []
        : [
            [c.normal, 'AA', ratio >= 4.5],
            [c.normal, 'AAA', ratio >= 7],
            [c.large, 'AA', ratio >= 3],
            [c.large, 'AAA', ratio >= 4.5],
          ] as const,
    [ratio, c],
  )

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
      <div className="space-y-3">
        <ColorInput label={c.text} value={fg} onChange={setFg} />
        <ColorInput label={c.background} value={bg} onChange={setBg} />
        <div className="flex flex-wrap gap-2">
          <ToolButton
            onClick={() => {
              setFg(bg)
              setBg(fg)
            }}
          >
            <ArrowLeftRight size={13} aria-hidden="true" /> {c.swap}
          </ToolButton>
          <ToolButton onClick={() => fgRgb && bgRgb && setFg(rgbToHex(fixContrast(fgRgb, bgRgb)))} disabled={!ratio || ratio >= 4.5}>
            <Wand2 size={13} aria-hidden="true" /> {c.fix}
          </ToolButton>
        </div>
      </div>
      <div className="overflow-hidden rounded-[10px] border border-white/[0.08]">
        <div className="p-4" style={{ background: bgRgb ? bg : undefined, color: fgRgb ? fg : undefined }}>
          <p className="text-2xl font-semibold tracking-[-0.03em]">Aa — 24px</p>
          <p className="mt-1 text-sm">The quick brown fox jumps over the lazy dog.</p>
        </div>
        <div className="flex items-center justify-between gap-4 p-4">
          <p className="text-4xl font-medium tracking-[-0.05em] text-ink-950 tabular-nums" aria-live="polite">
            {ratio ? ratio.toFixed(2) : '—'}
            <span className="text-lg text-ink-500">:1</span>
          </p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
            {checks.map(([size, level, ok]) => (
              <li key={size + level} className={cn('flex items-center gap-1.5 text-xs', ok ? 'text-ink-900' : 'text-ink-500 line-through decoration-ink-400')}>
                {ok ? <Check size={13} strokeWidth={2.25} aria-hidden="true" /> : <X size={13} strokeWidth={2.25} aria-hidden="true" />}
                <span className="sr-only">{ok ? c.pass : c.fail}: </span>
                {level} · {size}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const valid = hexToRgb(value) !== null
  return (
    <label className="flex items-center gap-3">
      <input type="color" value={valid ? (value.length === 4 ? rgbToHex(hexToRgb(value)!) : value) : '#000000'} onChange={(e) => onChange(e.target.value)} className="size-10 shrink-0 cursor-pointer rounded-[6px] border border-ink-200 bg-transparent p-0.5" aria-label={label} />
      <span className="flex-1">
        <span className="eyebrow block text-[0.5625rem]">{label}</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          aria-invalid={!valid}
          className="mt-1 w-full border-b border-ink-300 bg-transparent pb-1 font-mono text-base uppercase text-ink-900 outline-none focus:border-ink-900 aria-[invalid=true]:border-ink-950 sm:text-sm"
        />
      </span>
    </label>
  )
}

function CodeBlock({ code, c }: { code: string; c: (typeof copy)['en'] }) {
  const { copied, copy: doCopy } = useCopyToClipboard()
  return (
    <div className="theme-dark-scope relative overflow-hidden rounded-[10px] border border-white/[0.08] bg-[#0b0b0b]">
      <button type="button" onClick={() => doCopy(code)} data-cursor="copy" className="absolute right-3 top-3 inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-white/15 bg-black/60 px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#d4d4d4] hover:text-white">
        {copied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />} {copied ? c.copied : c.copy}
      </button>
      <pre data-lenis-prevent className="max-h-80 overflow-auto p-4 font-mono text-[12px] leading-[1.65] text-[#bdbdbd]">{code}</pre>
    </div>
  )
}

/* ---------------------------------------------------------------- Inputs */

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-2 text-[0.5625rem]">{label}</p>
      {children}
    </div>
  )
}

function Range({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix,
  disabled,
  hueTrack,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  suffix: string
  disabled?: boolean
  hueTrack?: boolean
}) {
  return (
    <label className={cn('block', disabled && 'opacity-40')}>
      <span className="mb-2 flex justify-between">
        <span className="eyebrow text-[0.5625rem]">{label}</span>
        <span className="font-mono text-[11px] tabular-nums text-ink-700">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="lab-range w-full"
        style={hueTrack ? ({ '--track': 'linear-gradient(90deg,oklch(.6 .16 0),oklch(.6 .16 60),oklch(.6 .16 120),oklch(.6 .16 180),oklch(.6 .16 240),oklch(.6 .16 300),oklch(.6 .16 360))' } as CSSProperties) : undefined}
      />
    </label>
  )
}
