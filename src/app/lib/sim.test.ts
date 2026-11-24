import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETUP, type Setup } from './data'
import { addDays, iso } from './format'
import { balanceNow, balancesAt, forecast, levels, seedTxs, type Tx } from './sim'

// Fixed "today" so date maths is the same on every run: Monday 2026-11-23.
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-23T12:00:00')) })
afterEach(() => vi.useRealTimers())

// Only the weekly or one-off entry moves the balance: no bills, no pay, no daily spending.
const quiet: Setup = { ...DEFAULT_SETUP, gross: 0, bills: [] }
const tx = (date: string, amount: number, mine = true): Tx => ({ id: Math.random(), date, name: 't', cat: 'Annet', amount, mine })

describe('levels', () => {
  it('gives green levels 1..4 when all values are positive', () => {
    const lv = levels([1, 2, 3, 4, 5, 6, 7, 8])
    expect(lv.every((l) => l >= 1 && l <= 4)).toBe(true)
    expect(lv[0]).toBe(1)
    expect(lv[7]).toBe(4)
  })

  it('gives red levels -1..-4 when all values are negative', () => {
    const lv = levels([-1, -2, -3, -4, -5, -6, -7, -8])
    expect(lv.every((l) => l <= -1 && l >= -4)).toBe(true)
    expect(lv[0]).toBe(-1)
    expect(lv[7]).toBe(-4)
  })

  it('gives 0 for days with nothing', () => {
    expect(levels([0, 5, -5])).toEqual([0, 1, -1])
  })
})

describe('forecast', () => {
  it('adds a weekly entry only from its start date', () => {
    const start = iso(addDays(new Date(), 14))
    const out = forecast(quiet, [{ name: 'Lunsj', cat: 'Mat', amount: -50, days: [0, 1, 2, 3, 4, 5, 6], start }], 1000, 1)
    expect(out.find((p) => p.k === iso(addDays(new Date(), 13)))!.v).toBe(1000)
    expect(out.find((p) => p.k === start)!.v).toBe(950)
  })

  it('adds a future one-off entry on its own day', () => {
    const day = iso(addDays(new Date(), 7))
    const out = forecast(quiet, [], 1000, 1, [tx(day, -300)])
    expect(out.find((p) => p.k === iso(addDays(new Date(), 6)))!.v).toBe(1000)
    expect(out.find((p) => p.k === day)!.v).toBe(700)
  })
})

describe('bills from onboarding', () => {
  it('uses the names the user typed, not guessed shop names', () => {
    const s: Setup = { ...quiet, bills: [{ id: 1, name: 'Lunsj på jobb', cat: 'Mat', amount: 50, repeat: 'weekly', day: 1, days: [1, 2, 3, 4, 5] }] }
    const names = new Set(seedTxs(s).map((t) => t.name))
    expect([...names]).toEqual(['Lunsj på jobb'])
  })

  it('keeps money in and out on the same day apart', () => {
    const start = iso(new Date())
    const weekly = [
      { name: 'Inn', cat: 'Annen inntekt', amount: 500, days: [5], start },
      { name: 'Ut', cat: 'Annet', amount: -500, days: [5], start },
    ]
    const friday = forecast(quiet, weekly, 0, 1).find((p) => p.k === '2026-11-27')!
    expect(friday.income).toBe(500)
    expect(friday.spend).toBe(500)
  })

  it('books bills due today in the history', () => {
    const s: Setup = { ...quiet, bills: [{ id: 1, name: 'Husleie', cat: 'Husleie / lån', amount: 9500, repeat: 'monthly', day: 23, days: [] }] }
    expect(seedTxs(s).some((t) => t.date === '2026-11-23' && t.amount === -9500)).toBe(true)
  })

  it('pays on the chosen pay day in the forecast', () => {
    const s: Setup = { ...quiet, gross: 40000, payDay: 25 }
    const out = forecast(s, [], 0, 1)
    const paid = out.filter((p) => p.income > 0).map((p) => p.k)
    expect(paid).toEqual(['2026-11-25'])
  })
})

describe('balance', () => {
  it('does not count a future-dated entry today', () => {
    const today = iso(new Date())
    const txs = [tx(iso(addDays(new Date(), -1)), -100), tx(iso(addDays(new Date(), 7)), -500)]
    expect(balanceNow(quiet, txs, today)).toBe(DEFAULT_SETUP.saldo - 100)
  })

  it('gives the end-of-day balance for past days', () => {
    const today = iso(new Date())
    const y = iso(addDays(new Date(), -1)), y2 = iso(addDays(new Date(), -2))
    const txs = [tx(y, -100), tx(today, 50), tx(iso(addDays(new Date(), 3)), -999)]
    const bal = balancesAt(txs, 1000, today, [today, y, y2])
    expect(bal.get(today)).toBe(1000)
    expect(bal.get(y)).toBe(950)
    expect(bal.get(y2)).toBe(1050)
  })
})
