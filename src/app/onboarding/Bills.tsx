// Onboarding step "Faste utgifter": the user names each expense, sets the amount, and picks when it happens:
// one date each month, or one or more days each week.
import { MoneyInput, Seg } from '../components/ui'
import { billId, EXPENSES, perMonth, WEEKDAYS, type Bill, type ExpenseName } from '../lib/data'
import { kr } from '../lib/format'

const field = 'h-9 min-w-0 rounded-[10px] border border-cream/14 bg-cream/10 px-2.5 text-sm font-medium text-cream transition-[border-color] focus:border-cream'
const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1)

/** "Den 20." style label for a date in the month. */
export const dayOfMonth = (d: number) => `Den ${d}.`

/** Select for a day of the month (1-31). Short months use their last day. */
export function MonthDaySelect({ id, value, onChange, className = '' }: { id: string; value: number; onChange: (d: number) => void; className?: string }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(Number(e.target.value))} className={`${field} cursor-pointer ${className}`}>
      {DAYS_OF_MONTH.map((d) => <option key={d} value={d} className="bg-navy">{dayOfMonth(d)}</option>)}
    </select>
  )
}

function BillRow({ bill, onChange, onRemove }: { bill: Bill; onChange: (b: Bill) => void; onRemove: () => void }) {
  const set = (patch: Partial<Bill>) => onChange({ ...bill, ...patch })
  const toggleDay = (d: number) => set({ days: bill.days.includes(d) ? bill.days.filter((x) => x !== d) : [...bill.days, d] })
  const id = `bill${bill.id}`
  const weekly = bill.repeat === 'weekly'
  return (
    <li className="flex flex-col gap-2.5 rounded-[14px] bg-cream/10 p-3">
      <div className="grid grid-cols-[1fr_110px_auto] items-center gap-2">
        <input id={`${id}n`} value={bill.name} placeholder="Navn, f.eks. Husleie" aria-label="Navn"
          onChange={(e) => set({ name: e.target.value })} className={`${field} h-11 text-[15px] placeholder:text-cream/45`} />
        <MoneyInput id={`${id}a`} value={bill.amount} onChange={(amount) => set({ amount })} />
        <button type="button" aria-label={`Fjern ${bill.name || 'utgift'}`} onClick={onRemove}
          className="grid size-9 cursor-pointer place-items-center rounded-full text-lg text-muted hover:bg-cream/10 hover:text-cream">×</button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select aria-label="Kategori" value={bill.cat} onChange={(e) => set({ cat: e.target.value as ExpenseName })} className={`${field} flex-1 cursor-pointer`}>
          {EXPENSES.map((c) => <option key={c} value={c} className="bg-navy">{c}</option>)}
        </select>
        <Seg options={[['monthly', 'Hver måned'], ['weekly', 'Hver uke']]} value={bill.repeat} compact label="Hvor ofte"
          onChange={(repeat) => set({ repeat, days: repeat === 'weekly' && !bill.days.length ? [1] : bill.days })} />
      </div>
      {weekly ? (
        <div className="grid grid-cols-7 gap-1" role="group" aria-label="Dager i uka">
          {WEEKDAYS.map(([d, n]) => (
            <button key={d} type="button" aria-pressed={bill.days.includes(d)} onClick={() => toggleDay(d)}
              className="h-8 cursor-pointer rounded-full bg-cream/10 text-xs font-semibold text-muted aria-pressed:bg-cream aria-pressed:text-ink">{n}</button>
          ))}
        </div>
      ) : (
        <label htmlFor={`${id}d`} className="flex items-center justify-between gap-2 text-[13px] text-muted">
          Hvilken dato?
          <MonthDaySelect id={`${id}d`} value={bill.day} onChange={(day) => set({ day })} />
        </label>
      )}
      <span className="text-xs text-muted">
        {weekly
          ? bill.days.length ? `${bill.days.length} ${bill.days.length === 1 ? 'gang' : 'ganger'} i uka · ca. ${kr(perMonth(bill))} per måned` : 'Velg minst én dag.'
          : `${dayOfMonth(bill.day).toLowerCase()} hver måned`}
      </span>
    </li>
  )
}

/** The list of fixed expenses, with a button to add one more. */
export function Bills({ bills, onChange }: { bills: Bill[]; onChange: (b: Bill[]) => void }) {
  const add = () => onChange([...bills, { id: billId(), name: '', cat: 'Annet', amount: 0, repeat: 'monthly', day: 1, days: [] }])
  return (
    <>
      <ul className="flex flex-col gap-2.5">
        {bills.map((b) => (
          <BillRow key={b.id} bill={b} onChange={(nb) => onChange(bills.map((x) => (x.id === b.id ? nb : x)))}
            onRemove={() => onChange(bills.filter((x) => x.id !== b.id))} />
        ))}
      </ul>
      <button type="button" onClick={add}
        className="h-11 cursor-pointer rounded-[10px] border border-dashed border-cream/30 text-sm font-semibold text-cream hover:bg-cream/10">+ Legg til utgift</button>
    </>
  )
}
