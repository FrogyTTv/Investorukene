// The Saldo app: onboarding, home screen and sheets. Example data only, nothing leaves the browser.
import { useEffect, useState } from 'react'
import { DEFAULT_SETUP, HEATS, type Setup } from '../lib/data'
import { addDays, iso, signed } from '../lib/format'
import { seedTxs, txId, type Mode, type Tx, type Weekly } from '../lib/sim'
import { Onboarding } from '../onboarding/Onboarding'
import { AddSheet, type NewEntry } from './AddSheet'
import { Home } from './Home'
import { SettingsSheet } from './SettingsSheet'

const HEAT_KEY = 'saldo:heat'
const readHeat = () => { try { return localStorage.getItem(HEAT_KEY) || HEATS[0][1] } catch { return HEATS[0][1] } }

export function Saldo({ startIn = 'app' }: { startIn?: 'app' | 'onboarding' }) {
  const [view, setView] = useState(startIn)
  const [setup, setSetup] = useState<Setup>(DEFAULT_SETUP)
  const [mode, setMode] = useState<Mode>('balance') // start on how much money you have, not what you spend
  const [txs, setTxs] = useState<Tx[]>(() => seedTxs(DEFAULT_SETUP))
  const [weekly, setWeekly] = useState<Weekly[]>([])
  const [freshId, setFreshId] = useState<number | null>(null)
  const [add, setAdd] = useState<{ open: boolean; sign: '-1' | '1' }>({ open: false, sign: '-1' })
  const [settings, setSettings] = useState(false)
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  const [heat, setHeat] = useState(readHeat)

  // Heatmap colour only changes the heatmap, never the blue theme.
  useEffect(() => {
    document.documentElement.style.setProperty('--heat', heat)
    try { localStorage.setItem(HEAT_KEY, heat) } catch { /* private mode: not remembered */ }
  }, [heat])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  // A finished onboarding is a fresh start: new example history, and the user's own entries are cleared.
  const openApp = () => { setTxs(seedTxs(setup)); setWeekly([]); setFreshId(null); setView('app') }
  const restart = () => { setSettings(false); setView('onboarding') }

  const onAdd = (e: NewEntry) => {
    const base = { name: e.name, cat: e.cat, amount: e.amount, mine: true }
    if (e.kind === 'once') {
      const t = { ...base, id: txId(), date: e.date }
      setTxs((x) => [...x, t])
      setFreshId(t.id)
      setToast({ id: t.id, text: `Lagt til: ${e.name}, ${signed(e.amount)}` })
    } else {
      setWeekly((w) => [...w, { name: e.name, cat: e.cat, amount: e.amount, days: e.days, start: e.start }])
      // Past days from the start date up to today become real entries; future days go into the forecast.
      const added: Tx[] = []
      const todayK = iso(new Date())
      for (let d = new Date(`${e.start}T12:00`); iso(d) <= todayK; d = addDays(d, 1))
        if (e.days.includes(d.getDay())) added.push({ ...base, id: txId(), date: iso(d) })
      setTxs((x) => [...x, ...added])
      setFreshId(added.at(-1)?.id ?? null)
      setToast({ id: txId(), text: `Lagt til hver uke: ${e.name}, ${signed(e.amount)} × ${e.days.length} dager` })
    }
    setAdd((a) => ({ ...a, open: false }))
  }

  if (view === 'onboarding')
    return <Onboarding setup={setup} onChange={setSetup} mode={mode} onMode={setMode} onDone={openApp} />

  return (
    <>
      <Home setup={setup} txs={txs} weekly={weekly} freshId={freshId} mode={mode} onMode={setMode}
        onAdd={(sign) => setAdd({ open: true, sign })} onSettings={() => setSettings(true)} />
      <AddSheet open={add.open} sign={add.sign} onClose={() => setAdd((a) => ({ ...a, open: false }))} onAdd={onAdd} />
      <SettingsSheet open={settings} onClose={() => setSettings(false)} heat={heat} onHeat={setHeat} onRestart={restart} />
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(24px+var(--safe-bottom))] z-20 flex justify-center" role="status">
          <span key={toast.id} className="animate-[rise_.35s_var(--ease-soft)] rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap">{toast.text}</span>
        </div>
      )}
    </>
  )
}
