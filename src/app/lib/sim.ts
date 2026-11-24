// Example data. The app has no bank access, so history and forecast are generated from the
// onboarding answers. Real transactions would replace this if bank linking is added later.
import { addDays, iso, rng } from './format'
import { netMonthly } from './tax'
import type { Setup } from './data'

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

const dailyVariable = (s: Setup) => (s.expenses.Mat + s.expenses.Transport + s.expenses.Annet) / 30

/** Onboarding preview: the next `days` days, starting on Sunday so rows are weekdays. */
export function simulate(days: number, s: Setup) {
  const r = rng(7)
  const net = netMonthly(s.gross)
  const variable = dailyVariable(s)
  const now = new Date()
  const start = addDays(now, -now.getDay())
  let bal = s.saldo
  const out: { date: Date; spend: number; income: number; balance: number }[] = []
  for (let d = 0; d < days; d++) {
    const date = addDays(start, d)
    const dom = date.getDate()
    const weekend = date.getDay() % 6 === 0
    let spend = variable * (0.3 + r() * 1.4) * (weekend ? 1.5 : 1)
    if (dom === 1) spend += s.expenses['Husleie / lån']
    if (dom === 15) spend += s.expenses.Strøm
    if (dom === 5) spend += s.expenses.Abonnementer
    const income = dom === 20 ? net : 0
    bal += income - spend
    out.push({ date, spend, income, balance: bal })
  }
  return out
}

/** One year of example history: bills on fixed days, pay on the 20th, everyday spending spread out. */
export function seedTxs(s: Setup): Tx[] {
  const r = rng(5)
  const e = s.expenses
  const net = netMonthly(s.gross)
  const out: Tx[] = []
  const pick = (a: string[]) => a[Math.floor(r() * a.length)]
  const add = (date: Date, name: string, cat: string, amount: number) =>
    out.push({ id: txId(), date: iso(date), name, cat, amount: Math.round(amount) })
  for (let d = 364; d >= 1; d--) {
    const date = addDays(new Date(), -d)
    const dom = date.getDate()
    if (dom === 1) add(date, 'Husleie', 'Husleie / lån', -e['Husleie / lån'])
    if (dom === 5) add(date, 'Strømmetjenester', 'Abonnementer', -e.Abonnementer)
    if (dom === 15) add(date, 'Strømregning', 'Strøm', -e.Strøm)
    if (dom === 20) add(date, 'Lønn', 'Lønn', net)
    if (r() < 0.6) add(date, pick(['Rema 1000', 'Kiwi', 'Coop Extra', 'Meny']), 'Mat', (-e.Mat / 18) * (0.4 + r() * 1.2))
    if (r() < 0.3) add(date, 'Kollektivbillett', 'Transport', (-e.Transport / 9) * (0.5 + r()))
    if (r() < 0.25) add(date, pick(['Kafé', 'Kino', 'Apotek', 'Klær']), 'Annet', (-e.Annet / 7.5) * (0.4 + r() * 1.2))
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

/** Balance forecast from tomorrow, `months` months ahead, same rhythm as the history. `txs` adds one-off entries dated after today. */
export function forecast(s: Setup, weekly: Weekly[], now: number, months: number, txs: Tx[] = []) {
  const planned: Record<string, number> = {}
  const todayK = iso(new Date())
  for (const t of txs) if (t.date > todayK) planned[t.date] = (planned[t.date] ?? 0) + t.amount
  const e = s.expenses
  const daily = dailyVariable(s)
  const net = netMonthly(s.gross)
  const out: { k: string; v: number }[] = []
  let b = now
  for (let d = 1; d <= months * 30; d++) {
    const x = addDays(new Date(), d)
    const k = iso(x)
    const dom = x.getDate()
    b -= daily
    b += weeklyOn(weekly, x) + (planned[k] ?? 0)
    if (dom === 1) b -= e['Husleie / lån']
    if (dom === 5) b -= e.Abonnementer
    if (dom === 15) b -= e.Strøm
    if (dom === 20) b += net
    out.push({ k, v: b })
  }
  return out
}
