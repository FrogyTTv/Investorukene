// Onboarding: 6 steps, full screen on phones. Titles sit in the same place on every step,
// and the button is the same size on every step.
import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Heat, MoneyInput, Months, Seg, Stats, TaxBox, type HeatCell } from '../components/ui'
import { perMonth, type Setup } from '../lib/data'
import { kr, monthShort, rng, signedKr } from '../lib/format'
import { dayVal, levels, MODES, simulate, type Mode } from '../lib/sim'
import { netMonthly, taxPercent } from '../lib/tax'
import { Bills, MonthDaySelect } from './Bills'

const BUTTONS = ['Kom i gang', 'Neste', 'Neste', 'Vis kartet mitt', 'Fullfør', 'Gå til appen']
const LAST = BUTTONS.length - 1

// Hero illustration on the first step: random green and red days.
const HERO: HeatCell[] = (() => {
  const r = rng(3)
  return Array.from({ length: 7 * 22 }, (_, i) => ({
    l: (r() < 0.3 ? -1 : 1) * Math.floor(r() ** 1.4 * 5),
    d: Math.floor(i / 7) * 30 + (i % 7) * 15,
  }))
})()

const H1 = ({ children }: { children: ReactNode }) => (
  <h1 className="font-display text-[34px] leading-[1.15] font-bold text-balance min-[960px]:text-[44px] min-[960px]:tracking-[-0.025em]">{children}</h1>
)
const H2 = ({ children }: { children: ReactNode }) => (
  <h2 className="font-display text-2xl leading-[1.15] font-bold text-balance min-[960px]:text-[34px] min-[960px]:tracking-[-0.02em]">{children}</h2>
)
const Lead = ({ children }: { children: ReactNode }) => <p className="-mt-2.5 text-muted min-[960px]:text-base">{children}</p>
const Field = ({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) => (
  <label htmlFor={htmlFor} className="flex flex-col gap-1.5 text-[13px] font-medium text-muted">{label}{children}</label>
)
const Box = ({ bad = false, children }: { bad?: boolean; children: ReactNode }) => (
  <div className={`flex justify-between rounded-[10px] bg-cream/10 p-3.5 text-sm ${bad ? '[&>b]:text-warn' : ''}`}>{children}</div>
)

type Props = {
  setup: Setup
  onChange: (s: Setup) => void
  mode: Mode
  onMode: (m: Mode) => void
  onDone: () => void
}

export function Onboarding({ setup, onChange, mode, onMode, onDone }: Props) {
  const [step, setStep] = useState(0)
  const [backDir, setBackDir] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  const net = netMonthly(setup.gross)
  const expTotal = setup.bills.reduce((s, b) => s + perMonth(b), 0)
  const surplus = net - expTotal
  const months = surplus > 0 ? Math.ceil(setup.goalAmt / surplus) : Infinity
  const set = (patch: Partial<Setup>) => onChange({ ...setup, ...patch })

  const go = (i: number) => {
    const next = Math.max(0, Math.min(LAST, i))
    setBackDir(next < step)
    setStep(next)
    scroller.current?.scrollTo(0, 0)
  }

  // Step 4: preview of the next 26 weeks, built from the answers.
  const preview = useMemo(() => {
    if (step !== 4) return null
    const data = simulate(26 * 7, setup)
    const vals = data.map((d) => dayVal(mode, d.spend, d.income, d.balance))
    const lv = levels(vals)
    const wave = 572 / 26 // the whole wave takes about 0.6 s
    const cells = data.map((d, i) => ({
      l: lv[i], d: Math.round(Math.floor(i / 7) * wave + (i % 7) * 12),
      title: `${d.date.toLocaleDateString('nb-NO')}: ${signedKr(vals[i])}`,
    }))
    const names: string[] = []
    for (let w = 0; w < 26; w += 4) { const n = monthShort(data[w * 7].date); if (!names.includes(n)) names.push(n) }
    return { cells, names }
  }, [step, setup, mode])

  return (
    <div className="flex h-full flex-col overflow-hidden bg-onboard">
      <div className="flex items-center gap-3 px-[22px] pt-[calc(16px+var(--safe-top))] min-[960px]:px-[max(48px,calc(50%-260px))] min-[960px]:pt-12">
        <button type="button" aria-label="Tilbake" disabled={step === 0} onClick={() => go(step - 1)}
          className="w-7 cursor-pointer p-0 text-xl text-muted disabled:invisible">&larr;</button>
        <div className="h-1 flex-1 overflow-hidden rounded-sm bg-cream/10">
          <i className="block h-full bg-cream transition-[width] duration-600 ease-soft" style={{ width: `${(step / LAST) * 100}%` }} />
        </div>
        <span className="text-xs text-muted">{step + 1}/{LAST + 1}</span>
      </div>

      <div ref={scroller} className="flex-1 overflow-y-auto px-[22px] py-6 min-[960px]:px-[max(48px,calc(50%-260px))] min-[960px]:pt-16 min-[960px]:pb-4">
        <section key={step} className={`step flex flex-col gap-4 ${backDir ? 'back-dir' : ''}`}>
          {step === 0 && (<>
            <H1>Se pengene dine som et kart.</H1>
            <Lead>Hver rute er en dag. Grønn betyr pluss, rød betyr minus, og sterkere farge betyr større beløp. Vi setter opp budsjettet ditt på to minutter.</Lead>
            <Heat cells={HERO} animate className="w-full" />
          </>)}

          {step === 1 && (<>
            <H2>Hva tjener du?</H2>
            <Lead>Månedslønn før skatt. Vi regner ut hva du sitter igjen med.</Lead>
            <Field label="Brutto månedslønn" htmlFor="gross"><MoneyInput id="gross" value={setup.gross} onChange={(gross) => set({ gross })} /></Field>
            <TaxBox gross={setup.gross} net={net} pct={taxPercent(setup.gross)} className="rounded-[10px] bg-cream/10 p-3.5" />
            <p className="text-xs text-muted">Forenklet estimat med 2025-satser: trygdeavgift, trinnskatt og 22 % skatt på alminnelig inntekt etter minstefradrag og personfradrag.</p>
            <Field label="Hvilken dato får du lønn?" htmlFor="payDay"><MonthDaySelect id="payDay" value={setup.payDay} onChange={(payDay) => set({ payDay })} className="h-11" /></Field>
            <Field label="Hvor mye har du på konto nå?" htmlFor="saldo"><MoneyInput id="saldo" value={setup.saldo} onChange={(saldo) => set({ saldo })} /></Field>
          </>)}

          {step === 2 && (<>
            <H2>Faste utgifter</H2>
            <Lead>Skriv inn hva du betaler for, hvor mye hver gang, og når: en dato hver måned, eller dager hver uke.</Lead>
            <Bills bills={setup.bills} onChange={(bills) => set({ bills })} />
            <Box bad={surplus < 0}><span>Igjen per måned etter faste utgifter</span><b className="font-medium">{kr(surplus)}</b></Box>
          </>)}

          {step === 3 && (<>
            <H2>Hva sparer du til?</H2>
            <Lead>Et mål gjør det lettere å holde budsjettet.</Lead>
            <Field label="Navn på målet" htmlFor="goalName">
              <input id="goalName" value={setup.goalName} onChange={(e) => set({ goalName: e.target.value })}
                className="h-11 rounded-[10px] border border-cream/14 bg-cream/10 px-3.5 text-sm font-medium text-cream transition-[border-color,box-shadow] focus:border-cream focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-cream)_10%,transparent)]" />
            </Field>
            <Field label="Beløp" htmlFor="goalAmt"><MoneyInput id="goalAmt" value={setup.goalAmt} onChange={(goalAmt) => set({ goalAmt })} /></Field>
            <Box><span>{surplus > 0 ? 'Om du sparer alt til overs' : 'Ingenting til overs ennå'}</span><b className="font-medium">{isFinite(months) ? `${months} mnd` : '–'}</b></Box>
          </>)}

          {step === 4 && preview && (<>
            <H2>Ditt kart</H2>
            <Lead>Neste 26 uker, regnet ut fra tallene dine. Ekte transaksjoner erstatter dette når du kobler til banken.</Lead>
            <Seg options={MODES} value={mode} onChange={onMode} label="Vis" />
            <div>
              <Heat key={mode} cells={preview.cells} animate label="Varmekart over neste 26 uker" />
              <Months names={preview.names} />
            </div>
            <div className="flex items-center justify-end gap-[3px] text-[11px] text-muted [&>i]:size-2.5 [&>i]:rounded-[2px]">
              Minus <i className="bg-(--n4)" /><i className="bg-(--n2)" /><i className="bg-(--h0)" /><i className="bg-(--h2)" /><i className="bg-(--h4)" /> Pluss
            </div>
            <Stats items={[['Saldo om 12 mnd', setup.saldo + surplus * 12], ['Til overs per mnd', surplus]]} />
          </>)}

          {step === 5 && (<>
            <H1>Klar!</H1>
            <Lead>Budsjettet ditt er satt opp. {setup.goalName || 'Sparemålet'} er nådd om {isFinite(months) ? `${months} måneder` : 'en stund'} med dagens tall.</Lead>
            <Stats items={[['Netto per mnd', net], ['Faste utgifter', expTotal]]} />
          </>)}
        </section>
      </div>

      <div className="px-[22px] pt-4 pb-[calc(24px+var(--safe-bottom))] min-[960px]:px-[max(48px,calc(50%-260px))] min-[960px]:pb-14">
        <button type="button" disabled={(step === 1 && !setup.gross) || (step === 2 && setup.bills.some((b) => b.repeat === 'weekly' && !b.days.length))} onClick={() => (step === LAST ? onDone() : go(step + 1))}
          className="h-11 w-full cursor-pointer rounded-[10px] bg-cream px-6 text-sm font-medium tracking-[.01em] text-ink transition-[transform,opacity] duration-150 ease-soft not-disabled:hover:-translate-y-px not-disabled:active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40">
          {BUTTONS[step]}
        </button>
      </div>
    </div>
  )
}
