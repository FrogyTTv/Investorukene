// Example data. The app has no bank access, so history and forecast are generated from the
// onboarding answers. Real transactions would replace this if bank linking is added later.
import { addDays, iso, rng } from './format'
import { netMonthly } from './tax'
import { billOn, isDayOfMonth, type Setup } from './data'

export type Mode = 'spend' | 'balance' | 'income'
export const MODES: [Mode, string][] = [['spend', 'Bruker'], ['balance', 'Har'], ['income', 'Tjener']]

export type Tx = { id: number; date: string; name: string; cat: string; amount: number; mine?: boolean }
export type Weekly = { name: string; cat: string; amount: number; days: number[]; start: string }

let nextId = 1
export const txId = () => nextId++

/** Signed value for one day: Bruker = money out (red), Tjener = money in (green), Har = balance (green in plus, red in minus). */
export const dayVal = (mode: Mode, spend: number, income: number, balance: number) =>
  mode === 'spend' ? -spend : mode === 'income' ? income : balance

/**
 * Heatmap levels: positive days 1..4 (shades of green), negative days -1..-4 (shades of red), 0 = nothing.
 * Each sign gets its own quartiles, so a few big days on one side do not wash out the other side.
 */
export function levels(vals: number[]) {
  const cuts = (arr: number[]) => {
    arr.sort((a, b) => a - b)
    const q = (p: number) => arr[Math.floor(p * (arr.length - 1))] ?? 0
    return [q(0.25), q(0.5), q(0.75)]
  }
  const tp = cuts(vals.filter((v) => v > 0))
  const tn = cuts(vals.filter((v) => v < 0).map((v) => -v))
  const lvl = (a: number, t: number[]) => (a <= t[0] ? 1 : a <= t[1] ? 2 : a <= t[2] ? 3 : 4)
  return vals.map((v) => (v > 0 ? lvl(v, tp) : v < 0 ? -lvl(-v, tn) : 0))
}

/** Spending varies a little from week to week; monthly bills are always the same. */
const vary = (weekly: boolean, r: () => number) => (weekly ? 0.7 + r() * 0.6 : 1)

/** Onboarding preview: the next `days` days, starting on Sunday so rows are weekdays. */
export function simulate(days: number, s: Setup) {
  const r = rng(7)
  const net = netMonthly(s.gross)
  const now = new Date()
  const start = addDays(now, -now.getDay())
  let bal = s.saldo
  const out: { date: Date; spend: number; income: number; balance: number }[] = []
  for (let d = 0; d < days; d++) {
    const date = addDays(start, d)
    let spend = 0
    for (const b of s.bills) if (billOn(b, date)) spend += b.amount * vary(b.repeat === 'weekly', r)
    const income = isDayOfMonth(s.payDay, date) ? net : 0
    bal += income - spend
    out.push({ date, spend, income, balance: bal })
  }
  return out
}

/** One year of example history from the user's own bills, with their own names, and pay on their pay day. */
export function seedTxs(s: Setup): Tx[] {
  const r = rng(5)
  const net = netMonthly(s.gross)
  const out: Tx[] = []
  const add = (date: Date, name: string, cat: string, amount: number) =>
    out.push({ id: txId(), date: iso(date), name, cat, amount: Math.round(amount) })
  for (let d = 364; d >= 1; d--) {
    const date = addDays(new Date(), -d)
    for (const b of s.bills) if (billOn(b, date) && b.amount) add(date, b.name.trim() || b.cat, b.cat, -b.amount * vary(b.repeat === 'weekly', r))
    if (isDayOfMonth(s.payDay, date) && net) add(date, 'Lønn', 'Lønn', net)
  }
  return out
}

/** Transactions dated today or earlier. A one-off entry can be dated in the future; it only counts from that day. */
export const booked = (txs: Tx[], todayK: string) => txs.filter((t) => t.date <= todayK)

/** Balance today: start balance plus the user's own entries up to today (the example history is already in it). */
export const balanceNow = (s: Setup, txs: Tx[], todayK: string) =>
  s.saldo + txs.reduce((sum, t) => (t.mine && t.date <= todayK ? sum + t.amount : sum), 0)

/**
 * Balance at the end of each day in `days` (all today or earlier): now minus everything booked after that day.
 * One pass over the transactions, newest first.
 */
export function balancesAt(txs: Tx[], now: number, todayK: string, days: string[]) {
  const sorted = booked(txs, todayK).sort((a, b) => b.date.localeCompare(a.date))
  const out = new Map<string, number>()
  let i = 0, after = 0
  for (const k of [...days].sort().reverse()) {
    while (i < sorted.length && sorted[i].date > k) after += sorted[i++].amount
    out.set(k, now - after)
  }
  return out
}

/** Sum of weekly expenses/income that fall on this date. */
export const weeklyOn = (weekly: Weekly[], d: Date) =>
  weekly.reduce((s, w) => (w.days.includes(d.getDay()) && iso(d) >= w.start ? s + w.amount : s), 0)

/**
 * Forecast from tomorrow, `months` months ahead: the user's bills, pay and weekly entries, plus one-off
 * entries dated after today. Each day has its spending, income and end-of-day balance `v`.
 */
export function forecast(s: Setup, weekly: Weekly[], now: number, months: number, txs: Tx[] = []) {
  const planned: Record<string, number> = {}
  const todayK = iso(new Date())
  for (const t of txs) if (t.date > todayK) planned[t.date] = (planned[t.date] ?? 0) + t.amount
  const net = netMonthly(s.gross)
  const out: { k: string; v: number; spend: number; income: number }[] = []
  let v = now
  for (let d = 1; d <= months * 30; d++) {
    const x = addDays(new Date(), d)
    const k = iso(x)
    let spend = 0, income = isDayOfMonth(s.payDay, x) ? net : 0
    for (const b of s.bills) if (billOn(b, x)) spend += b.amount
    for (const a of [weeklyOn(weekly, x), planned[k] ?? 0]) {
      if (a < 0) spend -= a
      else income += a
    }
    v += income - spend
    out.push({ k, v, spend, income })
  }
  return out
}
