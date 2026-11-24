import type { IconName } from '../components/Icon'

export const EXPENSES = ['Husleie / lån', 'Strøm', 'Mat', 'Transport', 'Abonnementer', 'Annet'] as const
export type ExpenseName = (typeof EXPENSES)[number]

/**
 * A fixed expense the user names and times in onboarding. `amount` is per time it happens:
 * once a month on `day` (1-31, last day of the month if the month is shorter), or every week on `days`.
 */
export type Bill = { id: number; name: string; cat: ExpenseName; amount: number; repeat: 'monthly' | 'weekly'; day: number; days: number[] }

/** What onboarding collects. */
export type Setup = {
  gross: number
  saldo: number
  payDay: number
  bills: Bill[]
  goalName: string
  goalAmt: number
}

let nextBill = 100
export const billId = () => nextBill++

export const DEFAULT_SETUP: Setup = {
  gross: 42000,
  saldo: 15000,
  payDay: 20,
  bills: [
    { id: 1, name: 'Husleie', cat: 'Husleie / lån', amount: 9500, repeat: 'monthly', day: 1, days: [] },
    { id: 2, name: 'Strømregning', cat: 'Strøm', amount: 900, repeat: 'monthly', day: 15, days: [] },
    { id: 3, name: 'Strømmetjenester', cat: 'Abonnementer', amount: 450, repeat: 'monthly', day: 5, days: [] },
    { id: 4, name: 'Matbutikken', cat: 'Mat', amount: 230, repeat: 'weekly', day: 1, days: [1, 3, 5, 6] },
    { id: 5, name: 'Buss', cat: 'Transport', amount: 37, repeat: 'weekly', day: 1, days: [1, 2, 3, 4, 5] },
    { id: 6, name: 'Kafé og kino', cat: 'Annet', amount: 230, repeat: 'weekly', day: 1, days: [5, 6] },
  ],
  goalName: 'Sommerferie',
  goalAmt: 20000,
}

/** About how much a bill costs per month. */
export const perMonth = (b: Bill) => (b.repeat === 'monthly' ? b.amount : Math.round((b.amount * b.days.length * 52) / 12))

/** Monthly budget per category: the sum of the bills in it. */
export const budgetOf = (s: Setup) => {
  const out = Object.fromEntries(EXPENSES.map((c) => [c, 0])) as Record<ExpenseName, number>
  for (const b of s.bills) out[b.cat] += perMonth(b)
  return out
}

const lastDay = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
/** True if a monthly date (1-31) falls on this day. Short months use their last day. */
export const isDayOfMonth = (day: number, d: Date) => d.getDate() === Math.min(day, lastDay(d))
/** True if the bill is due on this day. */
export const billOn = (b: Bill, d: Date) => (b.repeat === 'monthly' ? isDayOfMonth(b.day, d) : b.days.includes(d.getDay()))

export const INCOME_CATS = ['Lønn', 'Annen inntekt'] as const
export const ALL_CATS = [...EXPENSES, ...INCOME_CATS]

/** Each category has an icon. All icons use the heatmap colour. */
export const CATEGORIES: Record<string, { icon: IconName }> = {
  'Husleie / lån': { icon: 'home' },
  Strøm: { icon: 'bolt' },
  Mat: { icon: 'bag' },
  Transport: { icon: 'bus' },
  Abonnementer: { icon: 'repeat' },
  Annet: { icon: 'dots' },
  Lønn: { icon: 'income' },
  'Annen inntekt': { icon: 'income' },
}

/** Heatmap colour presets in Innstillinger. Only changes the heatmap, never the blue theme. */
export const HEATS: [string, string][] = [
  ['Grønn', '#96D248'], ['Lyseblå', '#C2E7DA'], ['Hvit', '#F1FFE7'], ['Blå', '#7C84FF'],
  ['Lilla', '#B48CFF'], ['Gul', '#F2C14E'], ['Turkis', '#4FD1C5'],
]

/** Weekdays Monday first. The number is JS getDay(): 0 = Sunday ... 6 = Saturday. */
export const WEEKDAYS: [number, string][] = [[1, 'Ma'], [2, 'Ti'], [3, 'On'], [4, 'To'], [5, 'Fr'], [6, 'Lø'], [0, 'Sø']]
