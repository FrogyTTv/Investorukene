import { StrictMode, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Saldo } from './app/Saldo'
import { Emulator } from './emulator/Emulator'

const params = new URLSearchParams(location.search)
// ?frame=1: running inside the desktop device emulator. ?app=1: always show the bare app.
const inFrame = params.has('frame')
const bareApp = inFrame || params.has('app')
const startIn = params.get('start') === 'onboarding' ? 'onboarding' : 'app'

// Inside the emulator, env(safe-area-inset-*) is 0, so the emulator tells the app the device's safe area.
const applySafe = (s: { top: number; right: number; bottom: number; left: number }) => {
  for (const k of ['top', 'right', 'bottom', 'left'] as const)
    if (Number.isFinite(s[k])) document.documentElement.style.setProperty(`--safe-${k}`, `${s[k]}px`)
}
if (inFrame) {
  const [top, right, bottom, left] = (params.get('safe') ?? '').split(',').map(Number)
  applySafe({ top, right, bottom, left })
  window.addEventListener('message', (e) => {
    if (e.source !== window.parent || e.origin !== location.origin || e.data?.type !== 'saldo:safe-area') return
    applySafe(e.data)
  })
}

// Phones get the app full screen. Wide screens get the device emulator.
const wide = matchMedia('(min-width: 901px)')
const subscribe = (cb: () => void) => { wide.addEventListener('change', cb); return () => wide.removeEventListener('change', cb) }

function Root() {
  const isWide = useSyncExternalStore(subscribe, () => wide.matches)
  return !bareApp && isWide ? <Emulator /> : <Saldo startIn={startIn} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
