import { describe, expect, it } from 'vitest'
import { netMonthly, taxPercent, yearlyTax } from './tax'

describe('tax estimate', () => {
  it('gives the expected net pay for 42 000 kr a month', () => {
    // 504 000 a year: 66 759 alminnelig + 38 808 trygd + 9 425.05 trinn = 114 992.05
    expect(yearlyTax(504000)).toBeCloseTo(114992.05, 2)
    expect(netMonthly(42000)).toBeCloseTo(32417.33, 2)
    expect(taxPercent(42000)).toBe(23)
  })

  it('is zero for no income', () => {
    expect(yearlyTax(0)).toBe(0)
    expect(taxPercent(0)).toBe(0)
  })
})
