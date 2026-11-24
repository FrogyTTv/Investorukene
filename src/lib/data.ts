import type { IconName } from '../components/Icon'

export const EXPENSES = ['Husleie / lån', 'Strøm', 'Mat', 'Transport', 'Abonnementer', 'Annet'] as const
export type ExpenseName = (typeof EXPENSES)[number]

/** What onboarding collects. */
export type Setup = {
  gross: number
  saldo: number
  expenses: Record<ExpenseName, number>
  goalName: string
  goalAmt: number
}

export const DEFAULT_SETUP: Setup = {
  gross: 42000,
  saldo: 15000,
  expenses: { 'Husleie / lån': 9500, Strøm: 900, Mat: 4000, Transport: 800, Abonnementer: 450, Annet: 2000 },
  goalName: 'Sommerferie',
  goalAmt: 20000,
}

export const INCOME_CATS = ['Lønn', 'Annen inntekt'] as const
export const ALL_CATS = [...EXPENSES, ...INCOME_CATS]

/** Each category has a colour and an icon. Colours sit on the blue page next to the team palette. */
export const CATEGORIES: Record<string, { color: string; icon: IconName }> = {
  'Husleie / lån': { color: '#8f97ff', icon: 'home' },
  Strøm: { color: '#f2c14e', icon: 'bolt' },
  Mat: { color: '#96D248', icon: 'bag' },
  Transport: { color: '#C2E7DA', icon: 'bus' },
  Abonnementer: { color: '#c9a3ff', icon: 'repeat' },
  Annet: { color: '#9fb3ad', icon: 'dots' },
  Lønn: { color: '#96D248', icon: 'income' },
  'Annen inntekt': { color: '#96D248', icon: 'income' },
}

/** Heatmap colour presets in Innstillinger. Only changes the heatmap, never the blue theme. */
export const HEATS: [string, string][] = [
  ['Grønn', '#96D248'], ['Lyseblå', '#C2E7DA'], ['Hvit', '#F1FFE7'], ['Blå', '#7C84FF'],
  ['Lilla', '#B48CFF'], ['Gul', '#F2C14E'], ['Turkis', '#4FD1C5'],
]

/** Weekdays Monday first. The number is JS getDay(): 0 = Sunday ... 6 = Saturday. */
export const WEEKDAYS: [number, string][] = [[1, 'Ma'], [2, 'Ti'], [3, 'On'], [4, 'To'], [5, 'Fr'], [6, 'Lø'], [0, 'Sø']]
