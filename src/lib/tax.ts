// Simplified Norwegian tax, 2025 rates. Estimate only: no wealth tax, and no deductions
// except minstefradrag and personfradrag. The UI labels it as an estimate.
const TRINN: [number, number][] = [[217400, 0.017], [306050, 0.04], [697150, 0.137], [942400, 0.167], [1410750, 0.177], [Infinity, 0]]

export function yearlyTax(y: number) {
  const minste = Math.min(y * 0.46, 92000)
  const alminnelig = Math.max(0, y - minste - 108550) * 0.22
  const trygd = y * 0.077
  let trinn = 0
  for (let i = 0; i < TRINN.length - 1; i++) trinn += Math.max(0, Math.min(y, TRINN[i + 1][0]) - TRINN[i][0]) * TRINN[i][1]
  return alminnelig + trygd + trinn
}

/** Net pay per month from gross pay per month. */
export const netMonthly = (gross: number) => {
  const y = gross * 12
  return (y - yearlyTax(y)) / 12
}

/** Tax share in whole percent, for "Skatt (ca. 31 %)". */
export const taxPercent = (gross: number) => (gross ? Math.round((yearlyTax(gross * 12) / (gross * 12)) * 100) : 0)
