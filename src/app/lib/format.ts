// Number, money and date helpers. UI language is Norwegian (bokmål), so money is "15 683 kr".

export const fmt = (n: number) => Math.round(n).toLocaleString('nb-NO')
export const kr = (n: number) => `${fmt(n)} kr`
/** "+1 200 kr" for money in, "-1 200 kr" for money out. */
export const signed = (v: number) => (v > 0 ? '+' : '') + kr(v)
/** Same as signed, with a real minus sign. Used in heatmap tooltips. */
export const signedKr = (v: number) => (v > 0 ? '+' : v < 0 ? '−' : '') + kr(Math.abs(v))
/** Reads digits only, so "42 000" and "42000 kr" both give 42000. */
export const parseNum = (s: string) => Number(s.replace(/[^\d]/g, '')) || 0

/** Local date as YYYY-MM-DD. */
export const iso = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10)
export const dayLabel = (k: string) => new Date(`${k}T12:00`).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })
export const monthName = (d = new Date()) => d.toLocaleDateString('nb-NO', { month: 'long' })
export const monthShort = (d: Date) => d.toLocaleDateString('nb-NO', { month: 'short' })
export const addDays = (d: Date, n: number) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

/** Seeded random (mulberry32), so the example data is the same on every render. */
export function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
