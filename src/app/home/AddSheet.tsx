// "Ny transaksjon": add a one-off or a weekly expense/income.
import { useState, type FormEvent } from 'react'
import { Icon } from '../components/Icon'
import { CatChip, Seg } from '../components/ui'
import { ALL_CATS, WEEKDAYS } from '../lib/data'
import { iso, kr, parseNum } from '../lib/format'
import { PillButton, Sheet } from './Sheet'

export type NewEntry =
  | { kind: 'once'; date: string; name: string; cat: string; amount: number }
  | { kind: 'weekly'; start: string; name: string; cat: string; amount: number; days: number[] }

type Sign = '-1' | '1'
type Repeat = 'once' | 'weekly'

const glass = 'bg-cream/10 inset-ring inset-ring-cream/10'
const bare = 'w-full min-w-0 cursor-pointer appearance-none border-0 bg-transparent p-0 text-base font-semibold text-cream outline-none placeholder:text-cream/45 focus-visible:underline focus-visible:underline-offset-4'

export function AddSheet({ open, sign: initialSign, onClose, onAdd }: {
  open: boolean; sign: Sign; onClose: () => void; onAdd: (e: NewEntry) => void
}) {
  const [sign, setSign] = useState<Sign>(initialSign)
  const [cat, setCat] = useState(initialSign === '1' ? 'Lønn' : 'Mat')
  const [date, setDate] = useState(() => iso(new Date()))
  const [name, setName] = useState('')
  const [amount, setAmount] = useState(0)
  const [repeat, setRepeat] = useState<Repeat>('once')
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [err, setErr] = useState('')

  // Reset type, category, date and error each time the sheet opens (adjusting state during render).
  const [lastOpen, setLastOpen] = useState(open)
  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) { setSign(initialSign); setCat(initialSign === '1' ? 'Lønn' : 'Mat'); setDate(iso(new Date())); setErr('') }
  }

  const changeSign = (s: Sign) => { setSign(s); setCat(s === '1' ? 'Lønn' : 'Mat') }
  const toggleDay = (d: number) => setDays((x) => (x.includes(d) ? x.filter((y) => y !== d) : [...x, d]))
  const weekly = repeat === 'weekly'
  const n = days.length
  const repSum = n ? `${n} ${n === 1 ? 'dag' : 'dager'} i uka${amount ? ` · ${kr(amount * n)} per uke · ca. ${kr((amount * n * 52) / 12)} per måned` : ''}` : 'Velg minst én dag.'

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!amount) return setErr('Skriv inn et beløp.')
    if (weekly && !n) return setErr('Velg minst én dag.')
    const base = { name: name.trim() || cat, cat, amount: Number(sign) * amount }
    onAdd(weekly ? { kind: 'weekly', start: date || iso(new Date()), days: [...days], ...base } : { kind: 'once', date: date || iso(new Date()), ...base })
    setAmount(0); setName(''); setRepeat('once')
  }

  return (
    <Sheet open={open} onClose={onClose} title="Ny transaksjon" titleId="addTitle">
      <form onSubmit={submit} noValidate className="flex flex-1 flex-col gap-4">
        <Seg options={[['-1', 'Utgift'], ['1', 'Inntekt']]} value={sign} onChange={changeSign} label="Type" />
        <div className="relative flex flex-col gap-2">
          <div className={`flex min-h-[74px] items-center gap-3.5 rounded-[20px] p-4 ${glass}`}>
            <CatChip cat={cat} />
            <label htmlFor="aCat" className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[13px] text-muted">Kategori</span>
              <select id="aCat" value={cat} onChange={(e) => setCat(e.target.value)} className={bare}>
                {ALL_CATS.map((c) => <option key={c} className="bg-navy">{c}</option>)}
              </select>
            </label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label={weekly ? 'Startdato' : 'Dato'}
              className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-medium text-muted outline-none" />
          </div>
          <span aria-hidden="true" className="absolute top-1/2 left-1/2 z-10 grid size-8 -translate-1/2 place-items-center rounded-full border-4 border-[color-mix(in_oklab,var(--color-deep)_75%,var(--color-navy))] bg-[color-mix(in_oklab,var(--color-cream)_16%,var(--color-deep))]">
            <Icon name="down" className="size-4" />
          </span>
          <div className={`flex min-h-[74px] items-center gap-3.5 rounded-[20px] p-4 ${glass}`}>
            <label htmlFor="aName" className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[13px] text-muted">Beskrivelse</span>
              <input id="aName" value={name} onChange={(e) => setName(e.target.value)} placeholder="F.eks. Rema 1000" autoComplete="off" className={bare} />
            </label>
            <label htmlFor="aAmt" className="flex items-center gap-1">
              <input id="aAmt" inputMode="numeric" placeholder="0" autoFocus={open} value={amount ? amount.toLocaleString('nb-NO') : ''}
                onChange={(e) => setAmount(parseNum(e.target.value))}
                className="w-[130px] border-0 bg-transparent p-0 text-right font-display text-[26px] font-bold outline-none placeholder:text-cream/45" />
              <span className="font-display text-[17px] font-bold">kr</span>
            </label>
          </div>
        </div>
        <Seg options={[['once', 'Én gang'], ['weekly', 'Hver uke']]} value={repeat} onChange={setRepeat} label="Gjentakelse" />
        {weekly && (
          <div className="flex flex-col gap-2">
            <span className="text-[13px] text-muted">Hvilke dager?</span>
            <div className="grid grid-cols-7 gap-1.5" role="group" aria-label="Ukedager">
              {WEEKDAYS.map(([d, t]) => (
                <button key={d} type="button" aria-pressed={days.includes(d)} onClick={() => toggleDay(d)}
                  className="h-10 cursor-pointer rounded-full bg-cream/10 text-[13px] font-semibold text-muted inset-ring inset-ring-cream/10 aria-pressed:bg-cream aria-pressed:text-ink aria-pressed:inset-ring-0">
                  {t}
                </button>
              ))}
            </div>
            <span className="text-[13px] text-muted">{repSum}</span>
          </div>
        )}
        {err && <span className="text-[13px] text-warn" role="alert">{err}</span>}
        <PillButton type="submit">Legg til</PillButton>
      </form>
    </Sheet>
  )
}
