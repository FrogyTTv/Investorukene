// Entry for the device emulator (index.html). It shows app.html inside a phone frame on desktop.
// Nothing here imports from src/app: the emulator only knows the app's URL.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './emulator.css'
import { APP_URL, Emulator } from './Emulator'

// Phones and narrow windows get the app itself, full screen.
if (!matchMedia('(min-width: 901px)').matches) {
  location.replace(APP_URL + location.search + location.hash)
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Emulator />
    </StrictMode>,
  )
}
