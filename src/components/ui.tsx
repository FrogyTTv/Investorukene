// Small shared building blocks. One style each, used everywhere.
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { CATEGORIES } from '../lib/data'
import { kr, parseNum } from '../lib/format'
import { Icon } from './Icon'

export type HeatCell = { l: number; title?: string; fut?: boolean; d?: number }

/** Heatmap grid. `animate` pops the squares in as a wave. */
export function Heat({ cells, animate = false, className = '', label }: { cells: HeatCell[]; animate?: boolean; className?: string; label?: string }) {
  return (
    <div className={`heat ${animate ? '' : 'still'} ${className}`} aria-label={label} aria-hidden={label ? undefined : true} role={label ? 'img' : undefined}>
      {cells.map((c, i) => (
        <i key={i} data-l={c.l} className={c.fut ? 'fut' : undefined} title={c.title} style={c.d != null ? ({ '--d': c.d } as CSSProperties) : undefined} />
      ))}
    </div>
  )
}

/** Segmented control. Pressed button is cream with ink text. */
export function Seg<T extends string>({ options, value, onChange, className = '', compact = false, label }: {
  options: [T, string][]; value: T; onChange: (v: T) => void; className?: string; compact?: boolean; label?: string
}) {
  return (
    <div className={`flex gap-1 rounded-[10px] bg-cream/10 p-[3px] ${className}`} role="group" aria-label={label}>
      {options.map(([v, t]) => (
        <button key={v} type="button" aria-pressed={v === value} onClick={() => onChange(v)}
          className={`flex-1 cursor-pointer rounded-[7px] text-[13px] font-medium whitespace-nowrap text-muted transition-colors duration-200 aria-pressed:bg-cream aria-pressed:text-ink ${compact ? 'px-[11px] py-[5px]' : 'p-1.5'}`}>
          {t}
        </button>
      ))}
    </div>
  )
}

/** Money field that shows thousand spaces while you type. */
export function MoneyInput({ id, value, onChange, className = '' }: { id: string; value: number; onChange: (v: number) => void; className?: string }) {
  return (
    <span className={`flex h-11 items-center rounded-[10px] border border-cream/14 bg-cream/10 px-3.5 transition-[border-color,box-shadow] focus-within:border-cream focus-within:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-cream)_10%,transparent)] ${className}`}>
      <input id={id} inputMode="numeric" value={value ? value.toLocaleString('nb-NO') : ''} onChange={(e) => onChange(parseNum(e.target.value))}
        className="h-full min-w-0 flex-1 bg-transparent p-0 text-sm font-medium outline-none placeholder:text-cream/45" style={{ outline: 'none' }} />
      <span className="text-sm text-muted">kr</span>
    </span>
  )
}

/** Glass card. */
export function Card({ id, className = '', children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={`flex min-w-0 scroll-mt-6 flex-col gap-3 rounded-[22px] bg-cream/10 p-[18px] inset-ring inset-ring-cream/10 ${className}`}>
      {children}
    </section>
  )
}

export const Label = ({ children }: { children: ReactNode }) => <span className="text-sm font-medium text-muted">{children}</span>

/** Big number in the display face, with a small "kr". */
export const BigNum = ({ value, className = '' }: { value: ReactNode; className?: string }) => (
  <b className={`font-display text-[28px] leading-[1.1] font-bold tracking-[-0.02em] ${className}`}>
    {value}
    <small className="ml-[.15em] text-[.55em]">kr</small>
  </b>
)

/** Round category icon in the category colour. */
export function CatChip({ cat, size = 'size-10' }: { cat: string; size?: string }) {
  const c = CATEGORIES[cat] ?? CATEGORIES.Annet
  return (
    <span className={`grid flex-none place-items-center rounded-full ${size}`}
      style={{ color: `color-mix(in srgb, ${c.color} 75%, #fff)`, background: `color-mix(in srgb, ${c.color} 22%, transparent)` }}>
      <Icon name={c.icon} />
    </span>
  )
}

/** Counts a money value up from 0 when it appears or changes. */
export function CountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(value)
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches
  useEffect(() => {
    if (still) return
    const t0 = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 900)
      setShown(value * (1 - (1 - p) ** 3))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, still])
  return <>{kr(still ? value : shown)}</>
}

/** Two small stat boxes side by side. */
export function Stats({ items }: { items: [string, number][] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {items.map(([t, v]) => (
        <div key={t} className="rounded-[10px] border border-cream/14 p-3.5">
          <span className="text-xs text-muted">{t}</span>
          <b className="block text-base font-medium"><CountUp value={v} /></b>
        </div>
      ))}
    </div>
  )
}

/** Brutto, skatt and netto per month. */
export function TaxBox({ gross, net, pct, className = '' }: { gross: number; net: number; pct: number; className?: string }) {
  return (
    <div className={`grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 text-sm [&>b]:text-right [&>b]:font-medium ${className}`}>
      <span>Brutto</span><b>{kr(gross)}</b>
      <span>Skatt (ca. {pct} %)</span><b>−{kr(gross - net)}</b>
      <span className="text-base text-green">Netto</span><b className="text-base text-green">{kr(net)}</b>
    </div>
  )
}

/** Month names under a heatmap. */
export const Months = ({ names, className = '' }: { names: string[]; className?: string }) => (
  <div className={`flex justify-between text-[11px] text-muted ${className}`}>{names.map((n) => <span key={n}>{n}</span>)}</div>
)
