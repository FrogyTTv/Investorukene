// Entry for the Saldo app (app.html). This is the whole app: it knows nothing about the device emulator.
// The emulator only loads app.html in an iframe and sets the --safe-* CSS variables (see src/emulator).
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Saldo } from './Saldo'

const startIn = new URLSearchParams(location.search).get('start') === 'onboarding' ? 'onboarding' : 'app'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Saldo startIn={startIn} />
  </StrictMode>,
)
