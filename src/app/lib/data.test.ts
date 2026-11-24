import { describe, expect, it } from 'vitest'
import { billOn, budgetOf, DEFAULT_SETUP, isDayOfMonth, perMonth, type Bill } from './data'

const bill = (p: Partial<Bill>): Bill => ({ id: 1, name: 'x', cat: 'Annet', amount: 100, repeat: 'monthly', day: 1, days: [], ...p })

describe('bills', () => {
  it('uses the last day of a short month for day 31', () => {
    expect(isDayOfMonth(31, new Date('2026-02-28T12:00'))).toBe(true)
    expect(isDayOfMonth(31, new Date('2026-03-30T12:00'))).toBe(false)
    expect(isDayOfMonth(31, new Date('2026-03-31T12:00'))).toBe(true)
  })

  it('is due on the chosen weekdays only', () => {
    const b = bill({ repeat: 'weekly', days: [1, 3] }) // Monday and Wednesday
    expect(billOn(b, new Date('2026-11-23T12:00'))).toBe(true) // Monday
    expect(billOn(b, new Date('2026-11-24T12:00'))).toBe(false) // Tuesday
    expect(billOn(b, new Date('2026-11-25T12:00'))).toBe(true) // Wednesday
  })

  it('turns a weekly amount into about a month', () => {
    expect(perMonth(bill({ repeat: 'weekly', amount: 50, days: [1, 2, 3, 4, 5] }))).toBe(1083)
    expect(perMonth(bill({ amount: 9500 }))).toBe(9500)
  })

  it('sums the budget per category', () => {
    const b = budgetOf({ ...DEFAULT_SETUP, bills: [bill({ cat: 'Mat', amount: 100 }), bill({ id: 2, cat: 'Mat', amount: 50 })] })
    expect(b.Mat).toBe(150)
    expect(b.Strøm).toBe(0)
  })
})
