// "Innstillinger": heatmap colour (only the heatmap, never the blue theme) and restart onboarding.
import { Heat, type HeatCell } from '../components/ui'
import { HEATS } from '../lib/data'
import { rng } from '../lib/format'
import { PillButton, Sheet } from './Sheet'

const PREVIEW: HeatCell[] = (() => {
  const r = rng(9)
  return Array.from({ length: 7 * 18 }, () => ({ l: (r() < 0.3 ? -1 : 1) * Math.floor(r() ** 1.3 * 5) }))
})()

export function SettingsSheet({ open, onClose, heat, onHeat, onRestart }: {
  open: boolean; onClose: () => void; heat: string; onHeat: (c: string) => void; onRestart: () => void
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Innstillinger" titleId="setTitle">
      <span className="text-[13px] text-muted">Farge på pengekartet</span>
      <div className="rounded-[20px] bg-cream/10 p-4 inset-ring inset-ring-cream/10">
        <Heat cells={PREVIEW} className="wide w-full" />
      </div>
      <div className="grid grid-cols-4 gap-x-2 gap-y-3.5" role="radiogroup" aria-label="Farge på pengekartet">
        {HEATS.map(([name, c]) => (
          <button key={c} type="button" role="radio" aria-checked={c === heat} onClick={() => onHeat(c)}
            className="group flex cursor-pointer flex-col items-center gap-2 text-xs font-semibold text-cream/70 aria-checked:text-cream">
            <i className="size-11 rounded-full inset-ring inset-ring-white/15 transition-transform duration-150 ease-soft group-active:scale-[.94] group-aria-checked:outline-2 group-aria-checked:outline-offset-3 group-aria-checked:outline-cream" style={{ background: c }} />
            {name}
          </button>
        ))}
      </div>
      <PillButton ghost onClick={onRestart}>Start oppsett på nytt</PillButton>
    </Sheet>
  )
}
