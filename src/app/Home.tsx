// Home screen after onboarding. Heatmap first, never the account balance.
// The bottom tab bar (Hjem, Aktivitet, Prognose, Budsjett, Skatt) is removed for now.
import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Icon, type IconName } from '../components/Icon'
import { BigNum, Card, CatChip, Heat, Label, Months, Seg, TaxBox } from '../components/ui'
import { CATEGORIES, EXPENSES, WEEKDAYS, type Setup } from '../lib/data'
import { addDays, dayLabel, fmt, iso, kr, monthName, monthShort, signed, signedKr } from '../lib/format'
import { balanceNow, balancesAt, booked, dayVal, levels, MODES, type Mode, type Tx, type Weekly } from '../lib/sim'
import { netMonthly, taxPercent } from '../lib/tax'
import { ForecastChart } from './ForecastChart'

type Props = {
  setup: Setup
  txs: Tx[]
  weekly: Weekly[]
  freshId: number | null
  mode: Mode
  onMode: (m: Mode) => void
  onAdd: (sign: '-1' | '1') => void
  onSettings: () => void
}

const Row = ({ cat, title, sub, amount, fresh }: { cat: string; title: string; sub: string; amount: number; fresh?: boolean }) => (
  <li className={`grid grid-cols-[auto_1fr_auto] items-center gap-3.5 py-2 text-[15px] font-semibold ${fresh ? 'animate-[rise_.5s_var(--ease-soft)]' : ''}`}>
    <CatChip cat={cat} />
    <span className="min-w-0">{title}<small className="mt-0.5 block text-[13px] font-normal text-muted">{sub}</small></span>
    <b className={`text-right font-semibold whitespace-nowrap ${amount > 0 ? 'text-green' : ''}`}>{signed(amount)}</b>
  </li>
)

const Quick = ({ icon, onClick, children }: { icon: IconName; onClick: () => void; children: ReactNode }) => (
  <button type="button" onClick={onClick} className="group flex cursor-pointer flex-col items-center gap-2 p-0 text-[13px] font-medium">
    <span className="grid size-[52px] place-items-center rounded-full bg-cream/14 transition-colors group-hover:bg-cream/22"><Icon name={icon} /></span>
    {children}
  </button>
)

export function Home({ setup, txs, weekly, freshId, mode, onMode, onAdd, onSettings }: Props) {
  const mainRef = useRef<HTMLElement>(null)
  const heatRef = useRef<HTMLDivElement>(null)
  const [txAll, setTxAll] = useState(false)

  const today = new Date()
  const todayK = iso(today)
  const net = netMonthly(setup.gross)
  const now = balanceNow(setup, txs, todayK)

  const jump = (id: string) => {
    const el = document.getElementById(id)
    if (el && mainRef.current) mainRef.current.scrollTo({ top: el.offsetTop - 24, behavior: 'smooth' })
  }

  // This month
  const mk = todayK.slice(0, 7)
  const month = booked(txs, todayK).filter((t) => t.date.startsWith(mk))
  const inM = month.reduce((a, t) => (t.amount > 0 ? a + t.amount : a), 0)
  const outM = month.reduce((a, t) => (t.amount < 0 ? a - t.amount : a), 0)

  // Heatmap: last 52 weeks, Sunday-start columns, future days faded
  const heat = useMemo(() => {
    const byDay: Record<string, { spend: number; income: number }> = {}
    for (const t of txs) {
      const x = (byDay[t.date] ??= { spend: 0, income: 0 })
      if (t.amount < 0) x.spend -= t.amount
      else x.income += t.amount
    }
    const end = addDays(new Date(), 6 - new Date().getDay())
    const start = addDays(end, -52 * 7 + 1)
    const keys = Array.from({ length: 52 * 7 }, (_, i) => iso(addDays(start, i)))
    const bal = balancesAt(txs, now, todayK, keys.filter((k) => k <= todayK))
    const cells = keys.map((k) => {
      const x = byDay[k] ?? { spend: 0, income: 0 }
      const future = k > todayK
      return { k, future, v: future ? 0 : dayVal(mode, x.spend, x.income, bal.get(k)!) }
    })
    const lv = levels(cells.map((c) => c.v))
    const names: string[] = []
    for (let w = 0; w < 52; w += 4) { const n = monthShort(addDays(start, w * 7)); if (!names.includes(n)) names.push(n) }
    return { cells: cells.map((c, i) => ({ l: lv[i], fut: c.future, title: `${dayLabel(c.k)}: ${signedKr(c.v)}` })), names }
  }, [txs, mode, now, todayK])

  // Phones: start on the newest weeks, swipe back for history
  useLayoutEffect(() => {
    const el = heatRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [heat])

  // Budget this month
  const budget = EXPENSES.map((c) => {
    const b = setup.expenses[c]
    const used = -month.filter((t) => t.cat === c && t.amount < 0).reduce((a, t) => a + t.amount, 0)
    return { c, b, used, over: used > b }
  })
  const total = budget.reduce((a, x) => a + x.b, 0)
  const usedAll = budget.reduce((a, x) => a + x.used, 0)

  // Latest transactions
  const yK = iso(addDays(today, -1))
  const dl = (k: string) => (k === todayK ? 'I dag' : k === yK ? 'I går' : dayLabel(k))
  const list = booked(txs, todayK).sort((a, b) => b.date.localeCompare(a.date) || Number(!!b.mine) - Number(!!a.mine)).slice(0, txAll ? 20 : 3)

  // Upcoming bills, pay and weekly entries
  const dom = today.getDate()
  const e = setup.expenses
  const midnight = new Date(`${todayK}T00:00`).getTime()
  const upcoming = ([
    [1, 'Husleie', 'Husleie / lån', -e['Husleie / lån']],
    [5, 'Strømmetjenester', 'Abonnementer', -e.Abonnementer],
    [15, 'Strømregning', 'Strøm', -e.Strøm],
    [20, 'Lønn', 'Lønn', net],
  ] as [number, string, string, number][]).map(([d, name, cat, amount]) => {
    const when = new Date(today.getFullYear(), today.getMonth() + (d < dom ? 1 : 0), d)
    const days = Math.round((when.getTime() - midnight) / 864e5)
    return { key: name, days, cat, name, amount, sub: `${days === 0 ? 'I dag' : days === 1 ? 'I morgen' : `Om ${days} dager`} · ${dayLabel(iso(when))}` }
  }).concat(weekly.map((w, i) => {
    // Next matching weekday from tomorrow, or from the start date if that is later.
    const tomorrow = addDays(new Date(`${todayK}T00:00`), 1)
    const first = new Date(`${w.start}T00:00`)
    const when = first > tomorrow ? first : tomorrow
    while (!w.days.includes(when.getDay())) when.setDate(when.getDate() + 1)
    const days = Math.round((when.getTime() - midnight) / 864e5)
    const dn = WEEKDAYS.filter(([d]) => w.days.includes(d)).map(([, n]) => n).join(', ')
    return { key: `w${i}`, days, cat: w.cat, name: w.name, amount: w.amount, sub: `Hver uke · ${dn} · ${dayLabel(iso(when))}` }
  })).concat(txs.filter((t) => t.date > todayK).map((t) => {
    // One-off entries dated in the future
    const days = Math.round((new Date(`${t.date}T00:00`).getTime() - midnight) / 864e5)
    return { key: `t${t.id}`, days, cat: t.cat, name: t.name, amount: t.amount, sub: `${days === 1 ? 'I morgen' : `Om ${days} dager`} · ${dayLabel(t.date)}` }
  })).sort((a, b) => a.days - b.days).slice(0, 3)

  const goalPart = setup.goalAmt ? Math.min(1, Math.max(0, now / setup.goalAmt)) : 0
  const C = 2 * Math.PI * 27

  return (
    <main ref={mainRef} className="h-full overflow-y-auto bg-page pr-(--safe-right) pb-[calc(56px+var(--safe-bottom))] pl-(--safe-left)">
      <section id="sec-home" className="flex flex-col items-center px-4 pb-8 text-center min-[901px]:px-[max(16px,calc(50%-424px))]">
        <header className="flex items-center justify-between self-stretch pt-[calc(12px+var(--safe-top))] pb-4">
          <span className="grid size-10 place-items-center rounded-full bg-mint text-ink"><Icon name="user" className="size-[18px]" /></span>
          <button type="button" aria-label="Innstillinger" onClick={onSettings}
            className="grid size-10 cursor-pointer place-items-center rounded-full bg-cream/14">
            <Icon name="sliders" />
          </button>
        </header>
        <span className="mt-7 text-[15px] font-medium text-cream/75 min-[901px]:mt-10">Brukt i {monthName()}</span>
        <b className="mt-1.5 font-display text-[60px] leading-none font-bold tracking-[-0.04em]">
          {fmt(outM)}<small className="ml-[.15em] text-[.38em] tracking-normal">kr</small>
        </b>
        <button type="button" onClick={() => jump('sec-fore')}
          className="mt-5 h-10 cursor-pointer rounded-full bg-cream/14 px-[22px] text-sm font-semibold">Prognose</button>
        <div className="mt-8 grid w-full max-w-[380px] grid-cols-4 gap-1 min-[901px]:mt-10 min-[901px]:w-auto min-[901px]:grid-cols-[repeat(4,72px)] min-[901px]:gap-3" aria-label="Snarveier">
          <Quick icon="plus" onClick={() => onAdd('-1')}>Legg til</Quick>
          <Quick icon="income" onClick={() => onAdd('1')}>Inntekt</Quick>
          <Quick icon="pie" onClick={() => jump('sec-budget')}>Budsjett</Quick>
          <Quick icon="tx" onClick={() => jump('sec-tx')}>Aktivitet</Quick>
        </div>
      </section>

      <div className="mx-auto grid max-w-[880px] grid-cols-1 items-start gap-3 px-4 min-[901px]:grid-cols-2">
        <Card id="sec-map" className="min-[901px]:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <Label>Pengekartet</Label>
            <Seg options={MODES} value={mode} onChange={onMode} compact label="Vis" />
          </div>
          <div ref={heatRef} className="no-scrollbar overflow-x-auto">
            <div className="min-w-[820px]">
              <Heat cells={heat.cells} className="wide" label="Varmekart siste 52 uker" />
              <Months names={heat.names} className="text-xs" />
            </div>
          </div>
        </Card>

        <Card id="sec-tx">
          <ul className="flex flex-col">
            {list.map((t) => <Row key={t.id} cat={t.cat} title={t.name} sub={dl(t.date)} amount={t.amount} fresh={t.id === freshId} />)}
          </ul>
          <button type="button" onClick={() => setTxAll(!txAll)} className="cursor-pointer p-1.5 text-[15px] font-semibold">{txAll ? 'Se færre' : 'Se alle'}</button>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="gap-1.5"><Label>Inntekt</Label><b className="font-display text-[22px] leading-[1.1] font-bold tracking-[-0.02em]">{kr(inM)}</b></Card>
          <Card className="gap-1.5"><Label>Utgifter</Label><b className="font-display text-[22px] leading-[1.1] font-bold tracking-[-0.02em]">{kr(outM)}</b></Card>
        </div>

        <Card id="sec-fore">
          <Label>Beregnet saldo</Label>
          <BigNum value={fmt(now)} />
          <ForecastChart setup={setup} txs={txs} weekly={weekly} now={now} />
        </Card>

        <Card className="flex-row items-center gap-4">
          <svg viewBox="0 0 64 64" className="size-14 flex-none -rotate-90 fill-none" aria-hidden="true">
            <circle cx="32" cy="32" r="27" strokeWidth="7" className="stroke-cream/10" />
            <circle cx="32" cy="32" r="27" strokeWidth="7" strokeLinecap="round" className="stroke-(--h4) transition-[stroke-dashoffset] duration-800 ease-soft"
              style={{ strokeDasharray: C, strokeDashoffset: C * (1 - goalPart) }} />
          </svg>
          <div>
            <Label>Sparemål</Label>
            <b className="my-0.5 block font-display text-[17px] font-bold">{setup.goalName || 'Sparemålet'}</b>
            <span className="text-[13px] text-muted">{kr(Math.min(now, setup.goalAmt))} av {kr(setup.goalAmt)}</span>
          </div>
        </Card>

        <Card id="sec-budget">
          <Label>Budsjett denne måneden</Label>
          <b className="font-display text-[28px] leading-[1.1] font-bold tracking-[-0.02em]">{usedAll <= total ? `${kr(total - usedAll)} igjen` : `${kr(usedAll - total)} over`}</b>
          <div className="mt-1 flex flex-col gap-2.5">
            {budget.map(({ c, b, used, over }) => (
              <div key={c} className="flex flex-col gap-1.5 text-sm font-medium">
                <div className="flex justify-between gap-2">
                  <span>{c}</span>
                  <span className={over ? 'text-warn' : 'text-muted'}>{over ? `${kr(used - b)} over` : `${kr(b - used)} igjen`}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-xs bg-cream/10">
                  <i className="block h-full rounded-xs" style={{ background: over ? 'var(--color-warn)' : CATEGORIES[c].color, width: `${Math.min(100, b ? (used / b) * 100 : 0)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card id="sec-upcoming">
          <Label>Kommende</Label>
          <ul className="flex flex-col">
            {upcoming.map((u) => <Row key={u.key} cat={u.cat} title={u.name} sub={u.sub} amount={u.amount} />)}
          </ul>
        </Card>

        <Card id="sec-tax">
          <Label>Skatt per måned</Label>
          <TaxBox gross={setup.gross} net={net} pct={taxPercent(setup.gross)} />
        </Card>
      </div>
    </main>
  )
}
