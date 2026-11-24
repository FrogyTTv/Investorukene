import { describe, expect, it } from 'vitest'
import { parseNum } from './format'

describe('parseNum', () => {
  it('reads digits only', () => {
    expect(parseNum('42 000')).toBe(42000)
    expect(parseNum('42 000 kr')).toBe(42000)
    expect(parseNum('')).toBe(0)
    expect(parseNum('abc')).toBe(0)
  })
})
