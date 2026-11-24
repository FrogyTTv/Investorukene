// Balance for the last 90 days (solid) and a forecast (dashed, heatmap colour). Hover or drag to read a day.
import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { addDays, dayLabel, iso, kr, monthShort } from '../lib/format'
import { balancesAt, forecast, type Tx, type Weekly } from '../lib/sim'
import type { Setup } from '../lib/data'

const W = 800, H = 220

export function ForecastChart({ setup, txs, weekly, now, months = 12 }: { setup: Setup; txs: Tx[]; weekly: Weekly[]; now: number; months?: number }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<number | null>(null)

  const c = useMemo(() => {
    const keys = Array.from({ length: 91 }, (_, j) => iso(addDays(new Date(), j - 90)))
    const bal = balancesAt(txs, now, keys[90], keys)
    const past = keys.map((k) => ({ k, v: bal.get(k)! }))
    const series = [...past, ...forecast(setup, weekly, now, months, txs)]
    const n = series.length - 1, split = past.length - 1
    let lo = Math.min(...series.map((p) => p.v)), hi = Math.max(...series.map((p) => p.v))
    const pad = (hi - lo) * 0.12 || 1000
    lo -= pad; hi += pad
    const X = (i: number) => (i / n) * W
    const Y = (v: number) => 210 - ((v - lo) / (hi - lo)) * 200
    const pts = series.map((p, i) => ({ ...p, i }))
    const line = (arr: typeof pts) => arr.map((p, j) => `${j ? 'L' : 'M'}${X(p.i).toFixed(1)},${Y(p.v).toFixed(1)}`).join('')
    const area = (arr: typeof pts) => `${line(arr)}L${X(arr[arr.length - 1].i).toFixed(1)},${H}L${X(arr[0].i).toFixed(1)},${H}Z`
    const a = pts.slice(0, split + 1), b = pts.slice(split)
    // Month ticks along the bottom; thin them out for long ranges.
    const every = series.length > 400 ? 3 : series.length > 220 ? 2 : 1
    let m = 0
    const labels: { x: number; t: string }[] = []
    series.forEach((p, i) => { if (p.k.endsWith('-01') && m++ % every === 0) labels.push({ x: X(i) / 8, t: monthShort(new Date(`${p.k}T12:00`)) }) })
    return { series, split, X, Y, lineA: line(a), lineB: line(b), areaA: area(a), areaB: area(b), labels }
  }, [setup, txs, weekly, now, months])

  const pct = (x: number, y: number) => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` })
  const p = hover != null ? c.series[hover] : null

  return (
    <div className="relative -mx-0.5 mt-1 mb-[22px] h-[150px] touch-pan-y"
      onPointerMove={(e) => {
        const r = svgRef.current!.getBoundingClientRect()
        setHover(Math.round(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * (c.series.length - 1)))
      }}
      onPointerLeave={() => setHover(null)}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block size-full overflow-visible" role="img" aria-label="Saldo siste 90 dager og prognose for neste år">
        <defs>
          <linearGradient id="gPast" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--color-cream)" stopOpacity=".10" /><stop offset="1" stopColor="var(--color-cream)" stopOpacity="0" /></linearGradient>
          <linearGradient id="gFut" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--h4)" stopOpacity=".22" /><stop offset="1" stopColor="var(--color-green)" stopOpacity="0" /></linearGradient>
        </defs>
        <path d={c.areaA} fill="url(#gPast)" />
        <path d={c.areaB} fill="url(#gFut)" />
        <line x1={c.X(c.split)} x2={c.X(c.split)} y1="0" y2={H} stroke="color-mix(in srgb, var(--color-cream) 12%, transparent)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d={c.lineA} fill="none" stroke="var(--color-cream)" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path d={c.lineB} fill="none" stroke="var(--h4)" strokeWidth="2" strokeDasharray="5 5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {hover != null && <line x1={c.X(hover)} x2={c.X(hover)} y1="0" y2={H} stroke="var(--color-muted)" strokeWidth="1" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />}
      </svg>
      <Dot style={pct(c.X(c.split), c.Y(c.series[c.split].v))} />
      {p && hover != null && (<>
        <Dot hover style={pct(c.X(hover), c.Y(p.v))} />
        <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-lg bg-ink px-[9px] py-[5px] text-xs font-semibold whitespace-nowrap text-cream" style={pct(c.X(hover), c.Y(p.v))}>
          {kr(p.v)}
          <small className="block font-medium opacity-60">{hover > c.split ? 'Prognose · ' : ''}{dayLabel(p.k)}</small>
        </div>
      </>)}
      <div className="absolute right-0 -bottom-5 left-0 h-4 text-[11px] font-medium text-muted">
        {c.labels.map((l) => <span key={`${l.x}`} className="absolute -translate-x-1/2" style={{ left: `${l.x}%` }}>{l.t}</span>)}
      </div>
    </div>
  )
}

const Dot = ({ hover = false, style }: { hover?: boolean; style: CSSProperties }) => (
  <span className={`pointer-events-none absolute -mt-[4.5px] -ml-[4.5px] size-[9px] rounded-full border-2 bg-[color-mix(in_srgb,var(--color-navy)_35%,transparent)] ${hover ? 'border-(--h4)' : 'border-ink'}`} style={style} />
)
