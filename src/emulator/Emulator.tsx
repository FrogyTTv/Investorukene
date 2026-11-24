// Desktop preview: the Saldo app (app.html) runs in an iframe at the device's screen size, inside a device frame.
// Changing device or orientation resizes the iframe, so the app keeps its state.
// The emulator never imports app code. Its only link to the app is APP_URL and the --safe-* CSS variables.
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from './icons'
import { DEFAULT_DEVICE, DEVICES, rotate, type Device, type Insets } from './devices'

const KEY = 'saldo:emulator'
type Prefs = { device: string; landscape: boolean; fit: boolean }
const readPrefs = (): Prefs => {
  const def = { device: DEFAULT_DEVICE, landscape: false, fit: true }
  try { return { ...def, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return def }
}

/** The app page, next to this one (works on localhost, GitHub Pages and in sub-folders). */
export const APP_URL = './app.html'

export function Emulator() {
  const [prefs, setPrefs] = useState(readPrefs)
  const device = DEVICES.find((d) => d.id === prefs.device) ?? DEVICES[0]
  const landscape = prefs.landscape
  const safe = landscape ? device.safeLandscape : device.safe
  const sw = landscape ? device.h : device.w
  const sh = landscape ? device.w : device.h
  const bezel = landscape ? rotate(device.bezel) : device.bezel
  const fw = sw + bezel.left + bezel.right
  const fh = sh + bezel.top + bezel.bottom

  const [reloads, setReloads] = useState(0)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState({ w: 0, h: 0 })

  const update = (p: Partial<Prefs>) => setPrefs((x) => {
    const next = { ...x, ...p }
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* not remembered */ }
    return next
  })

  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setStage({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // env(safe-area-inset-*) is 0 inside an iframe, so give the app the device's safe area
  // through the same CSS variables a real phone fills in (--safe-top, --safe-right, ...).
  const applySafe = useCallback(() => {
    const root = frameRef.current?.contentDocument?.documentElement
    if (!root) return
    for (const k of ['top', 'right', 'bottom', 'left'] as const) root.style.setProperty(`--safe-${k}`, `${safe[k]}px`)
  }, [safe])
  useEffect(applySafe, [applySafe])

  const pad = 8 // room for the side buttons
  const scale = prefs.fit && stage.w ? Math.min(1, (stage.w - pad * 2) / fw, (stage.h - pad * 2) / fh) : 1

  return (
    <div className="flex h-full flex-col bg-[#07080f] bg-[radial-gradient(60%_50%_at_75%_0%,color-mix(in_srgb,var(--color-blue)_35%,transparent),transparent_70%)] text-[#f3f4f8]">
      <header className="flex flex-wrap items-center justify-center gap-2 px-4 pt-5 pb-3">
        <span className="mr-2 flex items-center gap-2.5 font-display text-[19px] font-extrabold tracking-[-0.02em]">
          <span className="grid size-[22px] grid-cols-2 gap-0.5" aria-hidden="true">
            <i className="rounded-[3px] bg-blue" /><i className="rounded-[3px] bg-green" /><i className="rounded-[3px] bg-mint" /><i className="rounded-[3px] bg-cream" />
          </span>
          Saldo
        </span>
        <label className="sr-only" htmlFor="device">Enhet</label>
        <select id="device" value={device.id} onChange={(e) => update({ device: e.target.value })}
          className="h-9 cursor-pointer rounded-full border-0 bg-white/8 px-4 text-sm font-semibold text-inherit inset-ring inset-ring-white/14 hover:bg-white/12">
          {(['iPhone', 'Android', 'Nettbrett'] as Device['group'][]).map((g) => (
            <optgroup key={g} label={g}>
              {DEVICES.filter((d) => d.group === g).map((d) => (
                <option key={d.id} value={d.id}>{d.name}{d.id === DEFAULT_DEVICE ? ' (standard)' : ''}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <span className="px-1 text-[13px] text-[#9aa0b4] tabular-nums">{sw} × {sh}</span>
        <ToolButton label={landscape ? 'Stående' : 'Liggende'} onClick={() => update({ landscape: !landscape })} pressed={landscape}>
          <Icon name="rotate" className="size-[18px]" />
        </ToolButton>
        <ToolButton label={prefs.fit ? 'Tilpass vindu' : 'Faktisk størrelse'} onClick={() => update({ fit: !prefs.fit })}>
          <span className="text-[13px] font-semibold">{prefs.fit ? `${Math.round(scale * 100)} %` : '100 %'}</span>
        </ToolButton>
        <ToolButton label="Last inn på nytt" onClick={() => setReloads((n) => n + 1)}><Icon name="reload" className="size-[18px]" /></ToolButton>
        <a href={APP_URL} target="_blank" rel="noreferrer" title="Åpne appen i ny fane" aria-label="Åpne appen i ny fane"
          className="grid h-9 min-w-9 place-items-center rounded-full bg-white/8 px-2.5 inset-ring inset-ring-white/14 hover:bg-white/12">
          <Icon name="external" className="size-[18px]" />
        </a>
      </header>

      <div ref={stageRef} className={`flex min-h-0 flex-1 ${prefs.fit ? 'items-center justify-center overflow-hidden' : 'overflow-auto'}`}>
        <div className={`relative flex-none ${prefs.fit ? '' : 'm-auto'}`} style={{ width: fw * scale + pad * 2, height: fh * scale + pad * 2 }}>
          <div className="absolute origin-top-left" style={{ left: pad, top: pad, width: fw, height: fh, transform: `scale(${scale})` }}>
            <Frame device={device} landscape={landscape} bezel={bezel} w={fw} h={fh} />
            <div className="absolute overflow-hidden bg-black" style={{ left: bezel.left, top: bezel.top, width: sw, height: sh, borderRadius: device.radius }}>
              <iframe key={reloads} ref={frameRef} src={APP_URL} title={`Saldo på ${device.name}`} onLoad={applySafe}
                className="block border-0" style={{ width: sw, height: sh }} />
              <Overlay device={device} landscape={landscape} />
            </div>
          </div>
        </div>
      </div>

      <p className="px-4 pt-2 pb-5 text-center text-[13px] text-[#9aa0b4]">Trykk og scroll i telefonen. Alt er eksempeldata.</p>
    </div>
  )
}

function ToolButton({ label, onClick, pressed, children }: { label: string; onClick: () => void; pressed?: boolean; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} aria-pressed={pressed}
      className="grid h-9 min-w-9 cursor-pointer place-items-center rounded-full bg-white/8 px-2.5 inset-ring inset-ring-white/14 hover:bg-white/12 aria-pressed:bg-white/18">
      {children}
    </button>
  )
}

/** Device body with side buttons. */
function Frame({ device, landscape, bezel, w, h }: { device: Device; landscape: boolean; bezel: Insets; w: number; h: number }) {
  const outer = device.kind === 'home-button' ? 52 : device.radius + Math.min(bezel.top, bezel.left)
  // Side buttons: volume on the left, power on the right (portrait only, to keep landscape simple).
  const side = landscape ? [] : device.kind === 'tablet'
    ? [{ right: -7, top: 90, height: 56 }]
    : [{ left: -7, top: 180, height: 64 }, { left: -7, top: 264, height: 64 }, { right: -7, top: 220, height: 96 }]
  return (
    <div className="absolute inset-0 bg-[#0c0c0f] shadow-[0_0_0_2px_#2a2b31,0_0_0_5px_#0c0c0f,0_40px_100px_-30px_rgb(0_0_0/.8),0_0_120px_-40px_color-mix(in_srgb,var(--color-blue)_60%,transparent)]"
      style={{ borderRadius: outer, width: w, height: h }}>
      {side.map((s, i) => <span key={i} className="absolute w-1 rounded-[2px] bg-[#2a2b31]" style={s} />)}
      {device.kind === 'home-button' && (
        <span className="absolute size-[52px] rounded-full shadow-[inset_0_0_0_2px_#2a2b31]"
          style={landscape ? { right: (bezel.right - 52) / 2, top: (h - 52) / 2 } : { bottom: (bezel.bottom - 52) / 2, left: (w - 52) / 2 }} />
      )}
    </div>
  )
}

/** Status bar, camera and home indicator drawn over the screen. They never catch clicks. */
function Overlay({ device, landscape }: { device: Device; landscape: boolean }) {
  const k = device.kind
  return (
    <div className="pointer-events-none absolute inset-0 z-10 text-white">
      {k === 'island' && (landscape
        ? <span className="absolute top-1/2 left-[11px] -mt-[62px] h-[124px] w-9 rounded-[20px] bg-black" />
        : <span className="absolute top-[11px] left-1/2 -ml-[62px] h-9 w-[124px] rounded-[20px] bg-black" />)}
      {k === 'punch-hole' && (landscape
        ? <span className="absolute top-1/2 left-3 -mt-1.5 size-3 rounded-full bg-black" />
        : <span className="absolute top-3 left-1/2 -ml-1.5 size-3 rounded-full bg-black" />)}
      {!landscape && <StatusBar kind={k} />}
      {k === 'island' && <span className={`absolute bottom-2 left-1/2 h-[5px] rounded-[3px] bg-white/75 ${landscape ? '-ml-[100px] w-[200px]' : '-ml-[68px] w-[136px]'}`} />}
      {(k === 'punch-hole' || k === 'tablet') && <span className="absolute bottom-1.5 left-1/2 -ml-[54px] h-1 w-[108px] rounded-full bg-white/70" />}
    </div>
  )
}

function StatusBar({ kind }: { kind: Device['kind'] }) {
  const icons = (
    <span className="flex items-center gap-1.5">
      <svg width="18" height="12" viewBox="0 0 18 12" fill="#fff" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
      <svg width="16" height="12" viewBox="0 0 16 12" fill="#fff" aria-hidden="true"><path d="M8 2.5c2.3 0 4.4.9 6 2.4l1.2-1.3A10.4 10.4 0 0 0 8 .7 10.4 10.4 0 0 0 .8 3.6L2 4.9a8.6 8.6 0 0 1 6-2.4zm0 3.6c1.4 0 2.6.5 3.6 1.4l1.2-1.3A7 7 0 0 0 8 4.3a7 7 0 0 0-4.8 1.9l1.2 1.3c1-.9 2.2-1.4 3.6-1.4zm0 3.5c.5 0 1 .2 1.3.5L8 11.5 6.7 10.1c.3-.3.8-.5 1.3-.5z" /></svg>
      <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden="true"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="#fff" strokeOpacity=".5" /><rect x="2" y="2" width="20" height="9" rx="2" fill="#fff" /><rect x="24.5" y="4.5" width="2" height="4" rx="1" fill="#fff" fillOpacity=".5" /></svg>
    </span>
  )
  if (kind === 'island')
    return <div className="absolute inset-x-0 top-0 flex h-[50px] items-center justify-between pr-[34px] pl-11 text-base font-semibold" style={{ fontFamily: '-apple-system, "SF Pro Text", var(--font-body)' }}><span>9:41</span>{icons}</div>
  if (kind === 'home-button')
    return <div className="absolute inset-x-0 top-0 flex h-5 items-center justify-between px-1.5 text-xs font-semibold [&_svg]:scale-75"><span className="w-[60px]" /><span>9:41</span><span className="flex w-[60px] justify-end">{icons}</span></div>
  return <div className={`absolute inset-x-0 top-0 flex items-center justify-between text-[13px] font-medium [&_svg]:scale-[.85] ${kind === 'tablet' ? 'h-6 px-5' : 'h-8 px-6'}`}><span>9:41</span>{icons}</div>
}
